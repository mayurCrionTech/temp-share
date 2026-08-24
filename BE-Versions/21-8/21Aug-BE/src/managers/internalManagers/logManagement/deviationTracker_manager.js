const SetpointDeviationEvent = require("../../../models/mongoDB/logManagement/setpointDeviationEvent_model");
const {buildLiveDataRefs}=require("./liveDataRef")

function getDeviationType(value, bounds) {
  const { lowerBound, upperBound, criticalLowerBound, criticalUpperBound } =
    bounds;

  if (criticalLowerBound !== null && value <= criticalLowerBound)
    return "criticalLowerBound";

  if (lowerBound !== null && value <= lowerBound) return "lowerBound";

  if (criticalUpperBound !== null && value >= criticalUpperBound)
    return "criticalUpperBound";

  if (upperBound !== null && value >= upperBound) return "upperBound";

  return null;
}

async function trackDeviationsForEntry({
  templateId,
  logStructureId,
  logId,
  entryId,
  assetId,
  fieldName,
  fieldValue,
  bounds,
}) {
  const deviationType = getDeviationType(fieldValue, bounds);

  if (!deviationType) return; // within range - do nothing

  const liveDataRefs = await buildLiveDataRefs(assetId);

  try {
    await SetpointDeviationEvent.create({
      sourceType: "log",
      sourceDetails: {
        templateId,
        logStructureId,
        logId,
        entryId,
      },
      assetId,
      fieldName,
      deviationType,
      value: fieldValue,
      triggeredAt: new Date(),
      liveDataRefs
    });
  } catch (err) {
    console.error("Deviation logging failed:", err.message);
  }
}

module.exports = { trackDeviationsForEntry };
