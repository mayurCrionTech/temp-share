const {
  Assets,
} = require("../../../models/mongoDB/assetManagement/asset_model");

const {
  AssetParameters,
} = require("../../../models/mongoDB/assetManagement/assetParameter_model");

const {
  getLiveDataCollection,
  TagLive,
} = require("../../../models/mongoDB/tags/tagsModel");


const MAX_WAIT_MS = 120000;       // 2 minutes
const RETRY_INTERVAL_MS = 1000;  // check every 1 second
const MIN_REQUIRED_VALUES = 4;   // minimum valid tags required


function isValidValue(value) {
  if (value === null || value === undefined) {
    return false;
  }

  // Empty string means vehicle is not present
  if (typeof value === "string" && value.trim() === "") {
    return false;
  }

  // 0 and "0" are valid values
  return true;
}


function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}


async function buildLiveDataRefs(assetId, triggeredAt) {
  try {
    if (!assetId || !triggeredAt) {
      return [];
    }

    // --------------------------------------------------
    // 1. Get asset parent
    // --------------------------------------------------

    const asset = await Assets.findById(assetId)
      .select("locationAndHierarchyDetails.hierarchy.parent")
      .lean();

    const parentId =
      asset?.locationAndHierarchyDetails?.hierarchy?.parent;

    if (!parentId) {
      return [];
    }

    // --------------------------------------------------
    // 2. Get required parameters/tags
    // --------------------------------------------------

    const parameters = await AssetParameters.find({
      asset: parentId,
      isDeleted: false,
    })
      .select("tagId")
      .lean();

    if (!parameters.length) {
      return [];
    }

    const liveDataCollection = getLiveDataCollection();

    console.log(
      `[buildLiveDataRefs] Waiting for vehicle data. ` +
      `Required tags: ${parameters.length}, ` +
      `minimum valid: ${MIN_REQUIRED_VALUES}`
    );

    // --------------------------------------------------
    // 3. Prepare tag details
    // --------------------------------------------------

    const tagDetails = await Promise.all(
      parameters.map(async (param) => {
        const tag = await TagLive.findById(param.tagId)
          .select(
            "tagname latestValue unit ranges plcName isActive datatype health"
          )
          .lean();

        return {
          tagId: param.tagId,
          tag,
        };
      })
    );

    // Remove tags which don't exist anymore
    const validTagDetails = tagDetails.filter((item) => item.tag);

    if (!validTagDetails.length) {
      return [];
    }

    // --------------------------------------------------
    // 4. Track latest checked record per tag
    // --------------------------------------------------

    const lastCheckedTimestamp = new Map();

    // --------------------------------------------------
    // 5. Initial check
    //
    // We first look at the latest existing record.
    // --------------------------------------------------

    const currentRefs = [];

    await Promise.all(
      validTagDetails.map(async ({ tagId, tag }) => {
        const liveDocs = await liveDataCollection
          .find({
            tag_id: tagId,
          })
          .sort({ timestamp: -1 })
          .limit(1)
          .toArray();

        const liveData = liveDocs[0];

        if (!liveData) {
          return;
        }

        lastCheckedTimestamp.set(
          tagId.toString(),
          liveData.timestamp
        );

        if (!isValidValue(liveData.value)) {
          return;
        }

        currentRefs.push({
          _id: liveData._id,
          value: liveData.value,
          timestamp: liveData.timestamp,
          tagDetails: {
            _id: tag._id,
            tagname: tag.tagname,
            latestValue: tag.latestValue ?? null,
            unit: tag.unit ?? null,
            ranges: tag.ranges ?? null,
            plcName: tag.plcName,
            isActive: tag.isActive,
            datatype: tag.datatype,
            health: tag.health ?? null,
          },
        });
      })
    );

    // --------------------------------------------------
    // 6. If enough values already exist, return immediately
    // --------------------------------------------------

    if (currentRefs.length >= MIN_REQUIRED_VALUES) {
      console.log(
        `[buildLiveDataRefs] ${currentRefs.length}/${validTagDetails.length} ` +
        `valid values already available.`
      );

      return currentRefs;
    }

    // --------------------------------------------------
    // 7. Keep waiting for NEW records
    // --------------------------------------------------

    const startTime = Date.now();

    // Store refs by tag so we don't duplicate them
    const refsByTag = new Map();

    for (const ref of currentRefs) {
      refsByTag.set(
        ref.tagDetails._id.toString(),
        ref
      );
    }

    while (Date.now() - startTime < MAX_WAIT_MS) {
      await sleep(RETRY_INTERVAL_MS);

      await Promise.all(
        validTagDetails.map(async ({ tagId, tag }) => {
          try {
            const tagKey = tagId.toString();

            const previousTimestamp =
              lastCheckedTimestamp.get(tagKey);

            // --------------------------------------------------
            // Look for a NEWER record.
            //
            // This is important:
            // We don't want to keep reading the same "" record.
            // --------------------------------------------------

            const query = {
              tag_id: tagId,
            };

            if (previousTimestamp) {
              query.timestamp = {
                $gt: previousTimestamp,
              };
            }

            const liveDocs = await liveDataCollection
              .find(query)
              .sort({ timestamp: -1 })
              .limit(1)
              .toArray();

            const liveData = liveDocs[0];

            if (!liveData) {
              return;
            }

            // Remember that we have processed this record
            lastCheckedTimestamp.set(
              tagKey,
              liveData.timestamp
            );

            // Empty value means vehicle data is still unavailable
            if (!isValidValue(liveData.value)) {
              console.log(
                `[buildLiveDataRefs] ${tag.tagname}: ` +
                `new record received but value is empty`
              );

              return;
            }

            // --------------------------------------------------
            // Valid vehicle data received
            // --------------------------------------------------

            const ref = {
              _id: liveData._id,
              value: liveData.value,
              timestamp: liveData.timestamp,
              tagDetails: {
                _id: tag._id,
                tagname: tag.tagname,
                latestValue: tag.latestValue ?? null,
                unit: tag.unit ?? null,
                ranges: tag.ranges ?? null,
                plcName: tag.plcName,
                isActive: tag.isActive,
                datatype: tag.datatype,
                health: tag.health ?? null,
              },
            };

            refsByTag.set(tagKey, ref);

            console.log(
              `[buildLiveDataRefs] ${tag.tagname}: ` +
              `valid value received = ${liveData.value}`
            );
          } catch (err) {
            console.error(
              `[buildLiveDataRefs] Error checking tag ${tagId}:`,
              err.message
            );
          }
        })
      );

      // --------------------------------------------------
      // Get current valid refs
      // --------------------------------------------------

      const refs = Array.from(refsByTag.values()).filter(
        (ref) => isValidValue(ref.value)
      );

      const validCount = refs.length;
      const totalCount = validTagDetails.length;

      console.log(
        `[buildLiveDataRefs] Vehicle data progress: ` +
        `${validCount}/${totalCount}`
      );

      // --------------------------------------------------
      // ALL values available
      // --------------------------------------------------

      if (validCount === totalCount) {
        console.log(
          `[buildLiveDataRefs] All ${totalCount} values available.`
        );

        return refs;
      }

      // --------------------------------------------------
      // Minimum required values available
      // --------------------------------------------------

      if (validCount >= MIN_REQUIRED_VALUES) {
        console.log(
          `[buildLiveDataRefs] Minimum requirement reached: ` +
          `${validCount}/${totalCount}`
        );

        return refs;
      }
    }

    // --------------------------------------------------
    // 8. Timeout
    // --------------------------------------------------

    const finalRefs = Array.from(refsByTag.values()).filter(
      (ref) => isValidValue(ref.value)
    );

    console.log(
      `[buildLiveDataRefs] Timeout after ${MAX_WAIT_MS / 1000}s. ` +
      `Valid values: ${finalRefs.length}/${validTagDetails.length}`
    );

    // --------------------------------------------------
    // IMPORTANT:
    // Do NOT return partial data if less than 4 values.
    // This prevents events containing "" values.
    // --------------------------------------------------

    if (finalRefs.length >= MIN_REQUIRED_VALUES) {
      return finalRefs;
    }

    return [];

  } catch (err) {
    console.error(
      "buildLiveDataRefs failed:",
      err.message
    );

    return [];
  }
}


module.exports = {
  buildLiveDataRefs,
};