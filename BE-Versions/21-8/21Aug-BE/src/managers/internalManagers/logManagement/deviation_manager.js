const SetpointDeviationEvent = require("../../../models/mongoDB/logManagement/setpointDeviationEvent_model");

async function getDeviations(queryParams) {
  const {
    sourceType,
    tagId,
    logId,
    assetId,
    from,
    to,
    page = 1,
    limit = 15,
  } = queryParams;

  const filter = {};

  if (sourceType) {
    filter.sourceType = sourceType;
  }

  if (tagId) {
    filter["sourceDetails.tagId"] = tagId;
  }

  if (logId) {
    filter["sourceDetails.logId"] = logId;
  }

  if (assetId) {
    filter.assetId = assetId;
  }

  if (from || to) {
    filter.triggeredAt = {};
    if (from) filter.triggeredAt.$gte = new Date(from);
    if (to) filter.triggeredAt.$lte = new Date(to);
  }

  const pageNumber = Number(page);
  const limitNumber = Number(limit);
  const skip = (pageNumber - 1) * limitNumber;

  const data = await SetpointDeviationEvent.find(filter)
    .select("-__v")
    .sort({ triggeredAt: -1 })
    .skip(skip)
    .limit(limitNumber)
    .lean();

  const total = await SetpointDeviationEvent.countDocuments(filter);

  return {
    currentPage: pageNumber,
    totalPageCount: Math.ceil(total / limitNumber),
    totalDataCount: total,
    data,
  };
}

module.exports = { getDeviations };
