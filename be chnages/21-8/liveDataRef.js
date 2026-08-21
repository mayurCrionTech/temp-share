const { Assets } = require("../../../models/mongoDB/assetManagement/asset_model");
const { AssetParameters } = require("../../../models/mongoDB/assetManagement/assetParameter_model");
const { getLiveDataCollection, TagLive } = require("../../../models/mongoDB/tags/tagsModel");

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

    const refPromises = parameters.map(async (param) => {
      const [liveDocs, tag] = await Promise.all([
        liveDataCollection
          .find({
            tag_id: param.tagId,
            timestamp: { $lte: new Date(triggeredAt) },
          })
          .sort({ timestamp: -1 })
          .limit(1)
          .toArray(),
        TagLive.findById(param.tagId)
          .select("tagname latestValue unit ranges plcName isActive datatype health")
          .lean(),
      ]);

      const liveData = liveDocs[0];
      if (!liveData || !tag) return null;

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
    });

    const refs = (await Promise.all(refPromises)).filter(Boolean);
    return refs;
  } catch (err) {
    console.error("buildLiveDataRefs failed:", err.message);
    return [];
  }
}

module.exports = { buildLiveDataRefs };