// scripts/backfillTagAnomalyCache.js
const mongoose = require("mongoose");
const SetpointDeviationEvent = require("../src/models/mongoDB/logManagement/setpointDeviationEvent_model");
const TagAnomalyCache = require("../src/models/mongoDB/cache/tagAnomalyCache_model");
const { TagLive } = require("../src/models/mongoDB/tags/tagsModel");
const { buildLiveDataRefs } = require("../src/managers/internalManagers/logManagement/liveDataRef");

async function backfillTagAnomalyCache() {
  try {
    await mongoose.connect("mongodb://localhost:27017/paintddt");
    console.log("Mongo Connected ✅");

    const cursor = SetpointDeviationEvent.find({}).cursor();

    let processed = 0;
    let inserted = 0;
    let skippedNoTag = 0;
    let bulkOps = [];

    for await (const event of cursor) {
      processed++;

      const tagId = event.sourceDetails?.tagId;
      if (!tagId) {
        skippedNoTag++;
        continue;
      }

      const tag = await TagLive.findById(tagId).lean();
      if (!tag) {
        skippedNoTag++;
        continue;
      }

      const { minValue, maxValue } = tag.ranges || {};
      const setPointLimit =
        minValue != null && maxValue != null
          ? `${minValue}-${maxValue} ${tag.unit ?? ""}`.trim()
          : null;

      // Always regenerate fresh — ignore whatever event.liveDataRefs currently holds
      const liveDataRefs = await buildLiveDataRefs(event.assetId, event.triggeredAt);

      const payload = {
        id: event._id,
        severity: "warning",
        fault: event.deviationType,
        breachDateTime: event.triggeredAt,
        setPointBreach: event.value,
        unit: tag.unit ?? "",
        setPointLimit,
        message: `${tag.tagname} deviated from setpoint (${event.deviationType}) with value ${event.value}`,
        tagDetails: {
          tagId: tag._id,
          tagname: tag.tagname,
          unit: tag.unit ?? "",
          ranges: tag.ranges ?? null,
        },
        liveDataRefs,
      };

      bulkOps.push({
        insertOne: {
          document: {
            tagId: tag._id,
            breachDateTime: event.triggeredAt,
            payload,
          },
        },
      });

      if (bulkOps.length >= 500) {
        await TagAnomalyCache.bulkWrite(bulkOps);
        inserted += bulkOps.length;
        bulkOps = [];
        console.log(`⚡ Inserted ${inserted} so far (processed ${processed})`);
      }
    }

    if (bulkOps.length > 0) {
      await TagAnomalyCache.bulkWrite(bulkOps);
      inserted += bulkOps.length;
    }

    console.log(`🎉 Done. Processed: ${processed}, Inserted: ${inserted}, Skipped (no tag): ${skippedNoTag}`);
    process.exit(0);
  } catch (err) {
    console.error("Backfill failed:", err.message);
    process.exit(1);
  }
}

backfillTagAnomalyCache();