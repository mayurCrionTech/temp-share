const { Assets } = require("../../../models/mongoDB/assetManagement/asset_model");
const { AssetParameters } = require("../../../models/mongoDB/assetManagement/assetParameter_model");
const { getLiveDataCollection, TagLive } = require("../../../models/mongoDB/tags/tagsModel");

// old
// async function buildLiveDataRefs(assetId, triggeredAt) {
//   try {
//     if (!assetId || !triggeredAt) return [];

//     const asset = await Assets.findById(assetId)
//       .select("locationAndHierarchyDetails.hierarchy.parent")
//       .lean();

//     const parentId = asset?.locationAndHierarchyDetails?.hierarchy?.parent;
//     if (!parentId) return [];

//     const parameters = await AssetParameters.find({
//       asset: parentId,
//       isDeleted: false,
//     })
//       .select("tagId")
//       .lean();

//     if (!parameters.length) return [];

//     const liveDataCollection = getLiveDataCollection();

//     const refPromises = parameters.map(async (param) => {
//       const [liveDocs, tag] = await Promise.all([
//         liveDataCollection
//           .find({
//             tag_id: param.tagId,
//             timestamp: { $lte: new Date(triggeredAt) },
//           })
//           .sort({ timestamp: -1 })
//           .limit(1)
//           .toArray(),
//         TagLive.findById(param.tagId)
//           .select("tagname latestValue unit ranges plcName isActive datatype health")
//           .lean(),
//       ]);

//       const liveData = liveDocs[0];
//       if (!liveData || !tag) return null;

//       return {
//         _id: liveData._id,
//         value: liveData.value,
//         timestamp: liveData.timestamp,
//         tagDetails: {
//           _id: tag._id,
//           tagname: tag.tagname,
//           latestValue: tag.latestValue ?? null,
//           unit: tag.unit ?? null,
//           ranges: tag.ranges ?? null,
//           plcName: tag.plcName,
//           isActive: tag.isActive,
//           datatype: tag.datatype,
//           health: tag.health ?? null,
//         },
//       };
//     });

//     const refs = (await Promise.all(refPromises)).filter(Boolean);
//     return refs;
//   } catch (err) {
//     console.error("buildLiveDataRefs failed:", err.message);
//     return [];
//   }
// }

// new - to handle delay and wait till 15 seconds to get the latest live data
async function buildLiveDataRefs(assetId, triggeredAt) {
  try {
    if (!assetId || !triggeredAt) return [];

    const asset = await Assets.findById(assetId)
      .select("locationAndHierarchyDetails.hierarchy.parent")
      .lean();

    const parentId = asset?.locationAndHierarchyDetails?.hierarchy?.parent;
    if (!parentId) return [];

    const parameters = await AssetParameters.find({
      asset: parentId,
      isDeleted: false,
    })
      .select("tagId")
      .lean();

    if (!parameters.length) return [];

    const liveDataCollection = getLiveDataCollection();

    // Retry configuration
    const MAX_WAIT_MS = 15000; // Maximum 15 seconds
    const RETRY_INTERVAL_MS = 1000; // Check every 1 second

    const isValidValue = (value) => {
      if (value === null || value === undefined) return false;

      // Empty string is considered unavailable
      if (typeof value === "string" && value.trim() === "") {
        return false;
      }

      // 0 and "0" are valid values
      return true;
    };

    const sleep = (ms) =>
      new Promise((resolve) => setTimeout(resolve, ms));

    const refPromises = parameters.map(async (param) => {
      try {
        const tag = await TagLive.findById(param.tagId)
          .select(
            "tagname latestValue unit ranges plcName isActive datatype health"
          )
          .lean();

        if (!tag) return null;

        const startTime = Date.now();

        // Keep both:
        // 1. Valid live data if received
        // 2. Latest available record as fallback after 15 seconds
        let liveData = null;
        let latestAvailableData = null;

        while (Date.now() - startTime < MAX_WAIT_MS) {
          const liveDocs = await liveDataCollection
            .find({
              tag_id: param.tagId,
            })
            .sort({ timestamp: -1 })
            .limit(1)
            .toArray();

          const latestLiveData = liveDocs[0];

          if (latestLiveData) {
            // Always remember the latest record
            latestAvailableData = latestLiveData;

            // If value is available, use it immediately
            if (isValidValue(latestLiveData.value)) {
              liveData = latestLiveData;
              break;
            }
          }

          // Value is empty/missing, wait and check again
          await sleep(RETRY_INTERVAL_MS);
        }

        // If no valid value arrived within 15 seconds,
        // use whatever latest record is available.
        if (!liveData) {
          liveData = latestAvailableData;

          if (liveData) {
            console.log(
              `Using latest available live data for tag ${tag.tagname} after 15 seconds. Value:`,
              liveData.value
            );
          }
        }

        // No record at all for this tag
        if (!liveData) {
          console.log(
            `No live data found for tag ${tag.tagname} after 15 seconds`
          );
          return null;
        }

        return {
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
      } catch (err) {
        console.error(
          `Failed to build liveDataRef for tag ${param.tagId}:`,
          err.message
        );

        return null;
      }
    });

    const refs = (await Promise.all(refPromises)).filter(Boolean);

    return refs;
  } catch (err) {
    console.error("buildLiveDataRefs failed:", err.message);
    return [];
  }
}

module.exports = { buildLiveDataRefs };