const { Assets } = require("../../../models/mongoDB/assetManagement/asset_model");
const { AssetParameters } = require("../../../models/mongoDB/assetManagement/assetParameter_model");
const { getLiveDataCollection } = require("../../../models/mongoDB/tags/tagsModel");

// old
// async function buildLiveDataRefs(assetId) {
//   try {
//     if (!assetId) return [];

//     // Step 1: Get asset → hierarchy parent
//     const asset = await Assets.findById(assetId)
//       .select("locationAndHierarchyDetails.hierarchy.parent")
//       .lean();

//     const parentId = asset?.locationAndHierarchyDetails?.hierarchy?.parent;
//     if (!parentId) return [];

//     // Step 2: Get all parameters under parent
//     const parameters = await AssetParameters.find({
//       asset: parentId,
//       isDeleted: false,
//     })
//       .select("tagId")
//       .lean();

//     if (!parameters.length) return [];

//     // Step 3: For each tagId → get last liveData_test _id
//     const liveDataCollection = getLiveDataCollection();

//     const liveDataRefPromises = parameters.map(async (param) => {
//       const lastEntry = await liveDataCollection
//         .find({ tag_id: param.tagId })
//         .sort({ timestamp: -1 })
//         .limit(1)
//         .project({ _id: 1 })
//         .toArray();

//       return lastEntry[0]?._id || null;
//     });

//     const liveDataRefs = (await Promise.all(liveDataRefPromises)).filter(Boolean);

//     return liveDataRefs;
//   } catch (err) {
//     console.error("buildLiveDataRefs failed:", err.message);
//     return [];
//   }
// }

// new - 22-04-2026
async function buildLiveDataRefs(assetId, triggeredAt) {
  try {
    if (!assetId || !triggeredAt) return [];

    // Step 1: Get parent asset
    const asset = await Assets.findById(assetId)
      .select("locationAndHierarchyDetails.hierarchy.parent")
      .lean();

    const parentId = asset?.locationAndHierarchyDetails?.hierarchy?.parent;
    if (!parentId) return [];

    // Step 2: Get parameters under parent
    const parameters = await AssetParameters.find({
      asset: parentId,
      isDeleted: false,
    })
      .select("tagId")
      .lean();

    if (!parameters.length) return [];

    const liveDataCollection = getLiveDataCollection();

    // Step 3: Get data AT THAT TIME (not latest)
    const refPromises = parameters.map(async (param) => {
      const doc = await liveDataCollection
        .find({
          tag_id: param.tagId,
          timestamp: { $lte: new Date(triggeredAt) }, // KEY CHANGE
        })
        .sort({ timestamp: -1 }) // latest BEFORE deviation
        .limit(1)
        .project({ _id: 1 })
        .toArray();

      return doc[0]?._id || null;
    });

    const refs = (await Promise.all(refPromises)).filter(Boolean);

    return refs; // same as before
  } catch (err) {
    console.error("buildLiveDataRefs failed:", err.message);
    return [];
  }
}

module.exports = { buildLiveDataRefs };