// const { TagLive } = require("../../../models/mongoDB/tags/newTagModel");
// const SetpointDeviationEvent = require("../../../models/mongoDB/logManagement/setpointDeviationEvent_model");

// // Memory cache to detect value changes
// const lastSeenValues = new Map();

// async function monitorTagRanges() {
//   try {
//     const tags = await TagLive.find({
//       isActive: true,
//       ranges: { $exists: true },
//     }).lean();

//     for (const tag of tags) {
//       const { minValue, maxValue } = tag.ranges || {};
//       const value = tag.latestValue;

//       if (typeof value !== "number") continue;
//       if (minValue == null && maxValue == null) continue;

//       const previousValue = lastSeenValues.get(tag._id.toString());

//       // Skip if value did not change
//       if (previousValue === value) continue;

//       // Update cache
//       lastSeenValues.set(tag._id.toString(), value);

//       let deviationType = null;

//       if (minValue != null && value < minValue) {
//         deviationType = "low";
//       } else if (maxValue != null && value > maxValue) {
//         deviationType = "high";
//       }

//       if (!deviationType) continue;

//       try {
//         await SetpointDeviationEvent.create({
//           sourceType: "plcLiveData",
//           sourceDetails: {
//             tagId: tag._id,
//             tagname: tag.tagname,
//           },
//           assetId: tag.assetId?.[0] || null,
//           fieldName: tag.tagname,
//           deviationType,
//           value,
//           triggeredAt: new Date(),
//         });
//       } catch (err) {
//         console.error(
//           `PLC deviation logging failed for ${tag.tagname}:`,
//           err.message,
//         );
//       }
//     }
//   } catch (err) {
//     console.error("Tag range monitor error:", err.message);
//   }
// }

// function startTagLiveWatcher() {
//   console.log("Monitoring tag_lives every 5 seconds...");
//   setInterval(monitorTagRanges, 5000);
// }

// module.exports = { startTagLiveWatcher };

//-----------------------------------------------
// new to avaoid duplicate log entries

// const { TagLive } = require("../../../models/mongoDB/tags/newTagModel");
const { TagLive } = require("../../../models/mongoDB/tags/tagsModel");
const SetpointDeviationEvent = require("../../../models/mongoDB/logManagement/setpointDeviationEvent_model");
const {buildLiveDataRefs}=require("../logManagement/liveDataRef")
const TagAnomalyCache = require("../../../models/mongoDB/cache/tagAnomalyCache_model");

// new - aiforcast collection [Annomalies]
const AIForecast = require("../../../models/mongoDB/aiforecast/aiforecast_model");
// let lastProcessedTime = null;

const MIN_REQUIRED_VALUES = 4;
const MAX_WAIT_MS = 120000;      // 2 minutes
const RETRY_INTERVAL_MS = 1000;  // check every 1 second

const pendingDeviationTags = new Set();

function isValidLiveValue(value) {
  return (
    value !== null &&
    value !== undefined &&
    !(typeof value === "string" && value.trim() === "")
  );
}

/**
 * Determine deviation state based on value and range
 */
function getDeviationState(value, minValue, maxValue) {
  if (typeof value !== "number") return null;

  if (minValue != null && value < minValue) {
    return "low";
  }

  if (maxValue != null && value > maxValue) {
    return "high";
  }

  // return "normal";
  return null;
}

/**
 * Monitor active tags and log deviation events only when state changes
 */
async function monitorTagRanges() {
  try {
    const tags = await TagLive.find({
      isActive: true,
      ranges: { $exists: true },
    }).lean();

    for (const tag of tags) {
      const { minValue, maxValue } = tag.ranges || {};
      const value = tag.latestValue;

      if (minValue == null && maxValue == null) continue;

      const newState = getDeviationState(value, minValue, maxValue);
      if (!newState) continue;

      const tagKey = `${tag._id.toString()}:${newState}`;

      // Prevent another watcher from processing the same
      // tag + deviation state while the first one is waiting.
      if (pendingDeviationTags.has(tagKey)) {
        continue;
      }

      try {
        // Get last event for this tag
        const lastEvent = await SetpointDeviationEvent.findOne({
          "sourceDetails.tagId": tag._id,
          "sourceDetails.sourceType": "plcLiveData",
        })
          .sort({ createdAt: -1 })
          .lean();

        const lastState = lastEvent?.deviationType ?? null;

        // Same deviation state already logged
        if (lastState === newState) {
          continue;
        }

        // Mark this tag/state as being processed
        pendingDeviationTags.add(tagKey);

        const triggeredAt = new Date();

        console.log(
          `Deviation detected for ${tag.tagname}. Waiting for vehicle data...`
        );

        const liveDataRefs = await buildLiveDataRefs(
          tag?.assetId?.[0],
          triggeredAt,
          {
            minRequiredValues: MIN_REQUIRED_VALUES,
            maxWaitMs: MAX_WAIT_MS,
            retryIntervalMs: RETRY_INTERVAL_MS,
          }
        );

        // Count valid values
        const validCount = liveDataRefs.filter((ref) =>
          isValidLiveValue(ref.value)
        ).length;

        console.log(
          `Vehicle data for ${tag.tagname}: ${validCount} valid values`
        );

        // ----------------------------------------------------
        // IMPORTANT:
        // Don't create event unless at least 4 values are valid
        // ----------------------------------------------------
        if (validCount < MIN_REQUIRED_VALUES) {
          console.log(
            `Skipping deviation event for ${tag.tagname}. ` +
            `Only ${validCount} valid values available.`
          );

          continue;
        }

        // ----------------------------------------------------
        // Create event ONLY when enough vehicle data exists
        // ----------------------------------------------------
        const event = await SetpointDeviationEvent.create({
          sourceDetails: {
            sourceType: "plcLiveData",
            tagId: tag._id,
            tagname: tag.tagname,
          },
          assetId: tag.assetId?.[0] || null,
          deviationType: newState,
          value,
          triggeredAt,
          liveDataRefs,
        });

        console.log(
          `Deviation logged: ${tag.tagname} changed from ${lastState} - ${newState}`
        );

        // ----------------------------------------------------
        // Write to cache
        // ----------------------------------------------------
        try {
          const setPointLimit =
            minValue != null && maxValue != null
              ? `${minValue}-${maxValue} ${tag.unit ?? ""}`.trim()
              : null;

          const payload = {
            id: event._id,
            severity: "warning",
            fault: newState,
            breachDateTime: event.triggeredAt,
            setPointBreach: value,
            unit: tag.unit ?? "",
            setPointLimit,
            message: `${tag.tagname} deviated from setpoint (${newState}) with value ${value}`,
            tagDetails: {
              tagId: tag._id,
              tagname: tag.tagname,
              unit: tag.unit ?? "",
              ranges: tag.ranges ?? null,
            },
            liveDataRefs,
          };

          await TagAnomalyCache.create({
            tagId: tag._id,
            breachDateTime: event.triggeredAt,
            payload,
          });
        } catch (cacheErr) {
          console.error(
            `Cache write failed for ${tag.tagname}:`,
            cacheErr.message
          );
        }
      } catch (err) {
        console.error(
          `PLC deviation logging failed for ${tag.tagname}:`,
          err.message
        );
      } finally {
        // Always release the lock
        pendingDeviationTags.delete(tagKey);
      }
    }
  } catch (err) {
    console.error("Tag range monitor error:", err.message);
  }
}

// for - [Annomalies] // new
let lastProcessedTime = new Date(); // Only watch from service boot time

async function monitorAIForecastRanges() {
  try {
    const forecasts = await AIForecast.find({
      timestamp: { $gt: lastProcessedTime },
    })
      .sort({ timestamp: 1 })
      .lean();

    if (forecasts.length === 0) return;

    lastProcessedTime = forecasts[forecasts.length - 1].timestamp;

    for (const forecast of forecasts) {
      const { tagId, predictedValue, timestamp } = forecast;

      if (!tagId) continue;

      const tag = await TagLive.findById(tagId).lean();
      if (!tag || !tag.ranges) continue;

      const { minValue, maxValue } = tag.ranges;
      const newState = getDeviationState(predictedValue, minValue, maxValue);

      if (!newState) continue;

      try {
        const lastEvent = await SetpointDeviationEvent.findOne({
          "sourceDetails.tagId": tagId,
          "sourceDetails.sourceType": "aiforecast",
        })
          .sort({ createdAt: -1 })
          .lean();

        const lastState = lastEvent?.deviationType ?? null;

        if (lastState === newState) continue;

        const liveDataRefs = await buildLiveDataRefs(tag?.assetId?.[0]);

        // fixed: assign result to `event` so cache block below can use it
        const event = await SetpointDeviationEvent.create({
          sourceDetails: {
            sourceType: "aiforecast",
            tagId,
            tagname: tag.tagname,
          },
          assetId: tag.assetId?.[0] || null,
          deviationType: newState,
          value: predictedValue,
          triggeredAt: timestamp,
          liveDataRefs,
        });

        console.log(`AI Anomaly: ${tag.tagname} - (${predictedValue})`);

        // Write straight to cache
        try {
          const setPointLimit =
            minValue != null && maxValue != null
              ? `${minValue}-${maxValue} ${tag.unit ?? ""}`.trim()
              : null;

          const payload = {
            id: event._id,
            severity: "warning",
            fault: newState,
            breachDateTime: timestamp,
            setPointBreach: predictedValue,
            unit: tag.unit ?? "",
            setPointLimit,
            message: `${tag.tagname} deviated from setpoint (${newState}) with value ${predictedValue}`,
            tagDetails: {
              tagId,
              tagname: tag.tagname,
              unit: tag.unit ?? "",
              ranges: tag.ranges ?? null,
            },
            liveDataRefs,
          };

          await TagAnomalyCache.create({
            tagId,
            breachDateTime: timestamp,
            payload,
          });
        } catch (cacheErr) {
          console.error(`Cache write failed for ${tag.tagname}:`, cacheErr.message);
        }

      } catch (err) {
        console.error(`AI logging failed for ${tag.tagname}:`, err.message);
      }
    }
  } catch (err) {
    console.error("AI watcher error:", err.message);
  }
}

/**
 * Start interval watcher
 */
function startTagLiveWatcher() {
  console.log("Monitoring tag_lives every 5 seconds...");
  setInterval(monitorTagRanges, 5000);
  // setInterval(monitorAIForecastRanges, 5000);
}

module.exports = { startTagLiveWatcher };