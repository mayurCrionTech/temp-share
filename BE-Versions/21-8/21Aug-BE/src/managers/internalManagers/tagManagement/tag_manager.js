const mongoose = require("mongoose");
const forecastDefects = require("../../../models/mongoDB/forecastDefect/forecastDefect-model");
const {TagLive,TagHistory} = require("../../../models/mongoDB/tags/tagsModel");
const TagSummary = require("../../../models/mongoDB/tags/tagSummary");
const SetpointDeviationEvent = require("../../../models/mongoDB/logManagement/setpointDeviationEvent_model");
const TagAnomalyCache = require("../../../models/mongoDB/cache/tagAnomalyCache_model");
// const {sendForeCastDefects} = require("../../../utils/socket/socketHandler")
const {
  updateOne,
} = require("../../dBManagers/mongoDB_manager");


function parseISODuration(duration) {
  const regex = /^P(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?)?$/;
  const matches = duration.match(regex);

  if (!matches) {
    throw new Error("Invalid ISO8601 duration format");
  }

  const days = parseInt(matches[1] || 0, 10);
  const hours = parseInt(matches[2] || 0, 10);
  const minutes = parseInt(matches[3] || 0, 10);

  const totalMs =
    (days * 24 * 60 * 60 * 1000) +
    (hours * 60 * 60 * 1000) +
    (minutes * 60 * 1000);

  if (totalMs <= 0) {
    throw new Error("Interval must be greater than zero");
  }

  return totalMs;
}

// async function getTagHistory (
//   tagId,
//   startTime,
//   endTime,
//   interval,
//   aggregation,
//   limit = 100)
// {
//   console.log("tttt",tagId,startTime,endTime,interval,aggregation,limit)

//   if (!tagId || !startTime || !endTime || !interval || !aggregation) {
//     throw new Error("Missing required query parameters");
//   }

//   const start = new Date(startTime);
//   const end = new Date(endTime);

//   if (isNaN(start) || isNaN(end)) {
//     throw new Error("Invalid date format");
//   }

//   if (start >= end) {
//     throw new Error("startTime must be less than endTime");
//   }

//   const intervalMs = parseISODuration(interval);
//   const tagObjectId = new mongoose.Types.ObjectId(tagId);

//   // 🔹 Fetch hourly aggregated data
//   const hourlyData = await TagSummary.find({
//     tagId: tagObjectId,
//     startTime: { $gte: start, $lt: end }
//   })
//     .sort({ startTime: 1 })
//     .lean();

//   if (!hourlyData.length) {
//     return {
//       tagId,
//       interval,
//       aggregation,
//       points: []
//     };
//   }

//   const bucketMap = new Map();

//   for (let record of hourlyData) {

//     const recordTime = new Date(record.startTime);
//     const diff = recordTime - start;

//     if (diff < 0) continue;

//     const bucketIndex = Math.floor(diff / intervalMs);
//     const bucketStart = new Date(start.getTime() + bucketIndex * intervalMs);
//     const key = bucketStart.toISOString();

//     if (!bucketMap.has(key)) {
//       bucketMap.set(key, {
//         timestamp: bucketStart,
//         sum: 0,
//         count: 0,
//         minValue: Infinity,
//         maxValue: -Infinity,
//         first: record.first,
//         last: record.last
//       });
//     }

//     const bucket = bucketMap.get(key);

//     bucket.sum += record.sum;
//     bucket.count += record.count;
//     bucket.minValue = Math.min(bucket.minValue, record.minValue);
//     bucket.maxValue = Math.max(bucket.maxValue, record.maxValue);
//     bucket.last = record.last;
//   }

//   const points = [];

//   for (let bucket of bucketMap.values()) {

//     let value;

//     switch (aggregation) {
//       case "avg":
//         value = bucket.count ? bucket.sum / bucket.count : 0;
//         break;
//       case "sum":
//         value = bucket.sum;
//         break;
//       case "min":
//         value = bucket.minValue === Infinity ? 0 : bucket.minValue;
//         break;
//       case "max":
//         value = bucket.maxValue === -Infinity ? 0 : bucket.maxValue;
//         break;
//       case "count":
//         value = bucket.count;
//         break;
//       case "first":
//         value = bucket.first;
//         break;
//       case "last":
//         value = bucket.last;
//         break;
//       default:
//         throw new Error("Invalid aggregation type");
//     }

//     points.push({
//       timestamp: bucket.timestamp.toISOString(),
//       value
//     });
//   }

//   return {
//     tagId,
//     interval,
//     aggregation,
//     points: points.slice(0, limit)
//   };
// };

// function parseUserDate(dateString) {
//   if (!dateString) {
//     throw new Error("Date is required");
//   }

//   // If timezone already present → use directly
//   if (dateString.includes("Z") || dateString.includes("+")) {
//     const d = new Date(dateString);
//     if (isNaN(d)) throw new Error("Invalid date format");
//     return d;
//   }

//   // If no timezone → assume IST by appending +05:30
//   const d = new Date(dateString + "+05:30");

//   if (isNaN(d)) {
//     throw new Error("Invalid date format");
//   }

//   return d;
// }

function parseUserDate(dateString) {
  if (!dateString) {
    throw new Error("Date is required");
  }

  // If timezone explicitly provided
  if (/[zZ]|[+-]\d{2}:\d{2}$/.test(dateString)) {
    const d = new Date(dateString);
    if (isNaN(d)) throw new Error("Invalid date format");
    return d;
  }

  // Force IST if no timezone
  const d = new Date(dateString + "+05:30");

  if (isNaN(d)) {
    throw new Error("Invalid date format");
  }

  return d;
}

function floorToInterval(date, intervalMs) {
  const time = date.getTime();
  const floored = Math.floor(time / intervalMs) * intervalMs;
  return new Date(floored);
}

async function getTagHistory(
  tagId,
  startTime,
  endTime,
  interval,
  aggregation,
  limit = 100
) {

  if (!tagId || !startTime || !endTime || !interval || !aggregation) {
    throw new Error("Missing required query parameters");
  }

  // const start = parseUserDate(startTime);
  // const end = parseUserDate(endTime);

  const rawStart = parseUserDate(startTime);
const rawEnd = parseUserDate(endTime);

const intervalMs = parseISODuration(interval);

// FLOOR both start and end
// const start = floorToInterval(rawStart, intervalMs);
// const end = floorToInterval(rawEnd, intervalMs);

function floorToHourUTC(date) {
  const d = new Date(date);
  d.setUTCMinutes(0, 0, 0);
  return d;
}

const start = floorToHourUTC(rawStart);
const end = floorToHourUTC(rawEnd);

// console.log("FLOORED START UTC:", start.toISOString());
// console.log("FLOORED END UTC:", end.toISOString());

//   console.log("START UTC:", start.toISOString());
// console.log("END UTC:", end.toISOString());

// console.log("RAW START:", rawStart.toISOString());
// console.log("RAW END:", rawEnd.toISOString());

  if (isNaN(start) || isNaN(end)) {
    throw new Error("Invalid date format");
  }

  if (start >= end) {
    throw new Error("startTime must be less than endTime");
  }

  // const intervalMs = parseISODuration(interval);
  const tagObjectId = new mongoose.Types.ObjectId(tagId);

  const hourlyData = await TagSummary.find({
    tagId: tagObjectId,
    startTime: { $gte: start, $lt: end }
  })
    .sort({ startTime: 1 })
    .lean();

  if (!hourlyData.length) {
    return {
      tagId,
      interval,
      aggregation,
      points: []
    };
  }

  const bucketMap = new Map();

  for (let record of hourlyData) {
    const recordTime = new Date(record.startTime);
    const diff = recordTime - start;

    if (diff < 0) continue;

    const bucketIndex = Math.floor(diff / intervalMs);
    const bucketStart = new Date(start.getTime() + bucketIndex * intervalMs);
    const key = bucketStart.toISOString();

    if (!bucketMap.has(key)) {
      bucketMap.set(key, {
        timestamp: bucketStart,
        sum: 0,
        count: 0,
        minValue: Infinity,
        maxValue: -Infinity,
        first: record.first,
        last: record.last
      });
    }

    const bucket = bucketMap.get(key);

    bucket.sum += record.sum;
    bucket.count += record.count;
    bucket.minValue = Math.min(bucket.minValue, record.minValue);
    bucket.maxValue = Math.max(bucket.maxValue, record.maxValue);
    bucket.last = record.last;
  }

  // const points = [];

  // for (let bucket of bucketMap.values()) {
  //   let value;

  //   switch (aggregation) {
  //     case "avg":
  //       value = bucket.count ? bucket.sum / bucket.count : 0;
  //       break;
  //     case "sum":
  //       value = bucket.sum;
  //       break;
  //     case "min":
  //       value =
  //         bucket.minValue === Infinity ? 0 : bucket.minValue;
  //       break;
  //     case "max":
  //       value =
  //         bucket.maxValue === -Infinity ? 0 : bucket.maxValue;
  //       break;
  //     case "count":
  //       value = bucket.count;
  //       break;
  //     case "first":
  //       value = bucket.first;
  //       break;
  //     case "last":
  //       value = bucket.last;
  //       break;
  //     default:
  //       throw new Error("Invalid aggregation type");
  //   }

  //   points.push({
  //     timestamp: bucket.timestamp.toISOString(),
  //     value
  //   });
  // }

  // return {
  //   tagId,
  //   interval,
  //   aggregation,
  //   points: points.slice(0, limit)
  // };
  const points = [];

let currentBucketStart = new Date(start);

while (currentBucketStart <= end) {
  const currentBucketEnd = new Date(currentBucketStart.getTime() + intervalMs);

  // Get records inside this bucket
  const records = hourlyData.filter(r => {
    const t = new Date(r.startTime);
    return t >= currentBucketStart && t < currentBucketEnd;
  });

  // if (records.length > 0) {
  const expectedHours = intervalMs / (60 * 60 * 1000);

if (records.length === expectedHours){
    let sum = 0;
    let count = 0;
    let minValue = Infinity;
    let maxValue = -Infinity;
    let first = records[0].first;
    let last = records[records.length - 1].last;

    for (let r of records) {
      sum += r.sum;
      count += r.count;
      minValue = Math.min(minValue, r.minValue);
      maxValue = Math.max(maxValue, r.maxValue);
    }

    let value;

    switch (aggregation) {
      case "avg":
        value = count ? sum / count : 0;
        break;
      case "sum":
        value = sum;
        break;
      case "min":
        value = minValue;
        break;
      case "max":
        value = maxValue;
        break;
      case "count":
        value = count;
        break;
      case "first":
        value = first;
        break;
      case "last":
        value = last;
        break;
      default:
        throw new Error("Invalid aggregation type");
    }

    points.push({
      timestamp: currentBucketStart.toISOString(),
      value
    });
  }

  // Move to next bucket
  currentBucketStart = currentBucketEnd;
}
 return {
    tagId,
    interval,
    aggregation,
    points: points.slice(0, limit)
  };
}

/**
 * Fetch all tags and map to API format
 */
async function fetchAllTags() {
  const tags = await TagLive.find();

  // map to frontend API format
  const formattedTags = tags.map((tag) => ({
    id: tag._id.toString(),
    tagname: tag.tagname,
    description: tag.description,
    dataType: tag.datatype,
    val: tag.latestValue,
    timestamp: tag.updatedAt,
    health: tag.health,
    plcMetadata: tag.plcMetadata || { dbAddress: "" },
  }));

  return formattedTags;
}

async function fetchTagsByAssetId(assetId, reqData) {
  const mongoose = require("mongoose");

  const assetObjectId = new mongoose.Types.ObjectId(assetId);

  const tags = await TagLive.find({ assetId: assetObjectId });

  return tags.map((tag) => ({
    id: tag._id.toString(),
    tagname: tag.tagname,
    description: tag.description,
    dataType: tag.datatype,
    val: tag.latestValue,
    timestamp: tag.updatedAt,
    health: tag.health,
    plcMetadata: tag.plcMetadata || { dbAddress: "" },
  }));
}

// async function getTagHistory({
//   tagId,
//   startTime,
//   endTime,
//   interval,
//   aggregation,
//   limit = 100
// }) {
//   try {

//     // -------- VALIDATION --------
//     if (!tagId || !mongoose.Types.ObjectId.isValid(tagId)) {
//       throw new Error("Invalid Tag ID");
//     }

//     if (!startTime || !endTime) {
//       throw new Error("StartTime and EndTime are required");
//     }

//     const allowedAgg = ["avg", "min", "max", "sum", "count", "first", "last"];
//     if (!allowedAgg.includes(aggregation)) {
//       throw new Error("Invalid aggregation type");
//     }

//     // -------- AGGREGATION OPERATOR --------
//     const aggMap = {
//       avg: { $avg: "$value" },
//       min: { $min: "$value" },
//       max: { $max: "$value" },
//       sum: { $sum: "$value" },
//       count: { $sum: 1 },
//       first: { $first: "$value" },
//       last: { $last: "$value" }
//     };

//     // -------- PIPELINE --------
//     const pipeline = [
//       {
//         $match: {
//           tag_id: new mongoose.Types.ObjectId(tagId),
//           timestamp: {
//             $gte: new Date(startTime),
//             $lte: new Date(endTime)
//           }
//         }
//       },
//       {
//         $sort: { timestamp: 1 }
//       },
//       {
//         $group: {
//           _id: {
//             $dateTrunc: {
//               date: "$timestamp",
//               unit: "hour"
//             }
//           },
//           value: aggMap[aggregation]
//         }
//       },
//       {
//         $limit: parseInt(limit)
//       }
//     ];

//     // -------- EXECUTE --------
//     const rawData = await mongoDbManager.aggregation(TagHistory, pipeline);

//     // -------- FORMAT --------
//     const points = rawData.map(r => ({
//       timestamp: r._id,
//       value: r.value
//     }));

//     return {
//       tagId,
//       interval,
//       aggregation,
//       count: points.length,
//       points
//     };

//   } catch (error) {
//     throw error;
//   }
// }

async function getAllLiveTags  (tagIds) {
  const tags = await TagLive.find(
    { _id: { $in: tagIds }, isActive: true },
    { tagname: 1, latestValue: 1, health: 1, updatedAt: 1 }
  ).lean();

  // Map to the required response structure
  const result = tags.map((tag) => ({
    tagId: tag._id,
    val: tag.latestValue ?? null,
    health: tag.health || true,   
    timestamp: tag.updatedAt,            
  }));

  return result;
};

// const { Assets }             = require("../../../models/mongoDB/assetManagement/asset_model");
// const { TagHistory }         = require("../../../models/mongoDB/tags/tagsModel");
// const SetpointDeviationEvent = require("../../../models/mongoDB/logManagement/setpointDeviationEvent_model");
// const { AssetParameters }    = require("../../../models/mongoDB/assetManagement/assetParameter_model");

// async function getTagAnomalies({ tagId, startTime, endTime, limit = 10, page = 1 }) {

//   if (!mongoose.Types.ObjectId.isValid(tagId)) {
//     throw new Error("Invalid tagId format. Must be a valid ObjectId.");
//   }

//   const start = new Date(startTime);
//   const end   = new Date(endTime);

//   if (isNaN(start.getTime()) || isNaN(end.getTime())) {
//     throw new Error("Invalid startTime or endTime. Must be valid ISO 8601 dates.");
//   }

//   if (start >= end) {
//     throw new Error("startTime must be before endTime.");
//   }

//   const pageNum   = Math.max(1, parseInt(page));
//   const limitNum  = Math.min(100, Math.max(1, parseInt(limit)));
//   const skipCount = (pageNum - 1) * limitNum;

//   const emptyResult = {
//     currentPage:    pageNum,
//     totalPageCount: 0,
//     totalDataCount: 0,
//     data:           [],
//   };

//   // ── STEP 1: Find deviation events by sourceDetails.tagId + time range ──
//   const deviationEvents = await SetpointDeviationEvent.find({
//     "sourceDetails.tagId": new mongoose.Types.ObjectId(tagId),
//     triggeredAt:           { $gte: start, $lte: end },
//   }).lean();

//   if (!deviationEvents.length) return emptyResult;

//   // ── STEP 2: Collect unique assetIds ────────────────────────────────────
//   const assetIds = [
//     ...new Set(
//       deviationEvents.filter((e) => e.assetId).map((e) => e.assetId.toString())
//     ),
//   ].map((id) => new mongoose.Types.ObjectId(id));

//   if (!assetIds.length) return emptyResult;

//   // ── STEP 3: Fetch assets → extract locationAndHierarchyDetails.hierarchy.parent ──
//   const assets = await Assets.find(
//     { _id: { $in: assetIds }, isDeleted: false },
//     { "locationAndHierarchyDetails.hierarchy.parent": 1 }
//   ).lean();

//   const parentIds = [
//     ...new Set(
//       assets
//         .map((a) => a.locationAndHierarchyDetails?.hierarchy?.parent?.toString())
//         .filter(Boolean)
//     ),
//   ].map((id) => new mongoose.Types.ObjectId(id));

//   if (!parentIds.length) return emptyResult;

//   // ── STEP 4: Fetch assetParameters for parent assets ────────────────────
//   const assetParameters = await AssetParameters.find(
//     { asset: { $in: parentIds }, isDeleted: false },
//     { name: 1, tagId: 1, asset: 1 }
//   ).lean();

//   if (!assetParameters.length) return emptyResult;

//   const tagLive = await TagLive.findOne(
//     { _id: new mongoose.Types.ObjectId(tagId), isActive: true },
//     { ranges: 1, unit: 1 }
//   ).lean();

//   const setPointLimit = tagLive
//   ?`${tagLive.ranges?.minValue ?? "?"}-${tagLive.ranges?.maxValue ?? "?"}`.trim()
//     // ? `${tagLive.ranges?.minValue ?? "?"}-${tagLive.ranges?.maxValue ?? "?"} ${tagLive.unit ?? ""}`.trim()
//     : null;

//   // ── Build lookup maps ──────────────────────────────────────────────────

//   const tagIdToParamName = {};
//   assetParameters.forEach((p) => {
//     tagIdToParamName[p.tagId.toString()] = p.name;
//   });

//   const parentToTagIds = {};
//   assetParameters.forEach((p) => {
//     const pid = p.asset.toString();
//     if (!parentToTagIds[pid]) parentToTagIds[pid] = [];
//     parentToTagIds[pid].push(p.tagId.toString());
//   });

//   const tagIdToAssetId = {};
//   assets.forEach((asset) => {
//     const parentId = asset.locationAndHierarchyDetails?.hierarchy?.parent?.toString();
//     if (!parentId) return;
//     (parentToTagIds[parentId] || []).forEach((tid) => {
//       tagIdToAssetId[tid] = asset._id.toString();
//     });
//   });

//   const assetIdToDeviation = {};
//   deviationEvents.forEach((evt) => {
//     if (evt.assetId) assetIdToDeviation[evt.assetId.toString()] = evt;
//   });

//   const paramTagObjectIds = assetParameters.map(
//     (p) => new mongoose.Types.ObjectId(p.tagId)
//   );

//   // ── STEP 5: Count for pagination ───────────────────────────────────────
//   const totalDataCount = await TagHistory.countDocuments({
//     tag_id:    { $in: paramTagObjectIds },
//     timestamp: { $gte: start, $lte: end },
//   });

//   if (totalDataCount === 0) return emptyResult;

//   const totalPageCount = Math.ceil(totalDataCount / limitNum);

//   // ── STEP 6: Fetch paginated liveData records ───────────────────────────
//   const liveDataRecords = await TagHistory.find({
//     tag_id:    { $in: paramTagObjectIds },
//     timestamp: { $gte: start, $lte: end },
//   })
//     .sort({ timestamp: -1 })
//     .skip(skipCount)
//     .limit(limitNum)
//     .lean();

//   // ── STEP 7: Group by assetId → build flat fields ──────────────────────
//   const assetTagAccumulator = new Map();

//   liveDataRecords.forEach((record) => {
//     const tagIdStr   = record.tag_id.toString();
//     const paramName  = tagIdToParamName[tagIdStr];
//     const assetIdStr = tagIdToAssetId[tagIdStr];

//     if (!paramName || !assetIdStr) return;

//     const deviation = assetIdToDeviation[assetIdStr] || null;

//     if (!assetTagAccumulator.has(assetIdStr)) {
//       assetTagAccumulator.set(assetIdStr, {
//         id:             record._id,
//         timestamp:      record.timestamp,
//         severity:       "warning",
//         fault:          deviation?.deviationType ?? null,
//         breachDateTime: deviation?.triggeredAt   ?? null,   // renamed from triggeredAt
//         setPointBreach: deviation?.value         ?? null,   // deviation value
//         unit:tagLive?.unit ?? "",
//         // setPointBreach: deviation?.value != null ? `${deviation.value} ${tagLive?.unit ?? ""}`.trim() : null,
//         setPointLimit,
//         message:        deviation
//           ? `${deviation.sourceDetails?.tagname ?? "Tag"} deviated from setpoint (${deviation.deviationType}) with value ${deviation.value}`
//           : "Anomaly detected",
//       });
//     }

//     const entry = assetTagAccumulator.get(assetIdStr);

//     // Trim prefix → "PT_WR34_CabinNumber" becomes "CabinNumber"
//     const shortName = paramName.includes("_")
//       ? paramName.substring(paramName.lastIndexOf("_") + 1)
//       : paramName;

//     // Flat at root — no nested tags object
//     entry[shortName] = record.value ?? null;

//     if (new Date(record.timestamp) > new Date(entry.timestamp)) {
//       entry.timestamp = record.timestamp;
//     }
//   });

//   return {
//     currentPage:    pageNum,
//     totalPageCount,
//     totalDataCount,
//     data: Array.from(assetTagAccumulator.values()),
//   };
// }
// module.exports = { fetchAllTags, fetchTagsByAssetId,getTagHistory,getAllLiveTags };


// async function getTagAnomalies({ tagId, startTime, endTime, limit = 10, page = 1 }) {

//   if (!mongoose.Types.ObjectId.isValid(tagId)) {
//     throw new Error("Invalid tagId format. Must be a valid ObjectId.");
//   }

//   const start = new Date(startTime);
//   const end   = new Date(endTime);

//   if (isNaN(start.getTime()) || isNaN(end.getTime())) {
//     throw new Error("Invalid startTime or endTime. Must be valid ISO 8601 dates.");
//   }

//   if (start >= end) {
//     throw new Error("startTime must be before endTime.");
//   }

//   const pageNum   = Math.max(1, parseInt(page));
//   const limitNum  = Math.min(100, Math.max(1, parseInt(limit)));
//   const skipCount = (pageNum - 1) * limitNum;

//   const emptyResult = {
//     currentPage:    pageNum,
//     totalPageCount: 0,
//     totalDataCount: 0,
//     data:           [],
//   };

//   // ── Fetch TagLive for unit + setPointLimit ─────────────────────────────
//   const tagLive = await TagLive.findOne(
//     { _id: new mongoose.Types.ObjectId(tagId), isActive: true },
//     { ranges: 1, unit: 1 }
//   ).lean();

//   const unit                   = tagLive?.unit ?? "";
//   const { minValue, maxValue } = tagLive?.ranges || {};
//   const setPointLimit          = (minValue != null && maxValue != null)
//     ? `${minValue}-${maxValue} ${unit}`.trim()
//     : null;

//   const matchStage = {
//     "sourceDetails.tagId": new mongoose.Types.ObjectId(tagId),
//     triggeredAt:           { $gte: start, $lte: end },
//   };

//   // ── Count total for pagination ─────────────────────────────────────────
//   const totalDataCount = await SetpointDeviationEvent.countDocuments(matchStage);
//   if (!totalDataCount) return emptyResult;

//   const totalPageCount = Math.ceil(totalDataCount / limitNum);

//   // ── Aggregation pipeline ───────────────────────────────────────────────
//   const deviationDocs = await SetpointDeviationEvent.aggregate([

//     // STEP 1: Filter by tagId + time range
//     { $match: matchStage },

//     // STEP 2: Sort + paginate
//     { $sort:  { triggeredAt: -1 } },
//     { $skip:  skipCount },
//     { $limit: limitNum },

//     // STEP 3: Join liveData_test using liveDataRefs array
//     {
//       $lookup: {
//         from:         "liveData_test",
//         localField:   "liveDataRefs",
//         foreignField: "_id",
//         as:           "liveDataDocs",
//       },
//     },

//     // STEP 4: Join tag_lives using tag_id from each liveData doc
//     {
//       $lookup: {
//         from: "tag_lives",
//         let:  { liveDataDocs: "$liveDataDocs" },
//         pipeline: [
//           {
//             $match: {
//               $expr: {
//                 $in: [
//                   "$_id",
//                   {
//                     $map: {
//                       input: "$$liveDataDocs",
//                       as:    "ld",
//                       in:    "$$ld.tag_id",
//                     },
//                   },
//                 ],
//               },
//             },
//           },
//           {
//             $project: {
//               tagname:     1,
//               unit:        1,
//               ranges:      1,
//               plcName:     1,
//               isActive:    1,
//               latestValue: 1,
//               datatype:    1,
//               health:      1,
//             },
//           },
//         ],
//         as: "tagDocs",
//       },
//     },

//     // STEP 5: Merge tagDetails into each liveData doc
//     {
//       $addFields: {
//         liveDataRefs: {
//           $map: {
//             input: "$liveDataDocs",
//             as:    "ld",
//             in: {
//               _id:       "$$ld._id",
//               value:     "$$ld.value",
//               timestamp: "$$ld.timestamp",
//               tagDetails: {
//                 $arrayElemAt: [
//                   {
//                     $filter: {
//                       input: "$tagDocs",
//                       as:    "tag",
//                       cond:  { $eq: ["$$tag._id", "$$ld.tag_id"] },
//                     },
//                   },
//                   0,
//                 ],
//               },
//             },
//           },
//         },
//       },
//     },

//     // STEP 6: Clean up raw arrays
//     {
//       $project: {
//         liveDataDocs: 0,
//         tagDocs:      0,
//       },
//     },
//   ]);

//   // ── Format response ────────────────────────────────────────────────────
//   const data = deviationDocs.map((doc) => ({
//     id:             doc._id,
//     severity:       "warning",
//     fault:          doc.deviationType ?? null,
//     breachDateTime: doc.triggeredAt   ?? null,
//     setPointBreach: doc.value         ?? null,
//     unit,
//     setPointLimit,
//     message:        `${doc.sourceDetails?.tagname ?? "Tag"} deviated from setpoint (${doc.deviationType}) with value ${doc.value}`,
//     liveDataRefs:   (doc.liveDataRefs || []).map((ld) => ({
//       _id:       ld._id,
//       value:     ld.value     ?? null,
//       timestamp: ld.timestamp ?? null,
//       tagDetails: ld.tagDetails
//         ? {
//             _id:         ld.tagDetails._id,
//             tagname:     ld.tagDetails.tagname     ?? null,
//             latestValue: ld.tagDetails.latestValue ?? null,
//             unit:        ld.tagDetails.unit        ?? null,
//             ranges:      ld.tagDetails.ranges      ?? null,
//             plcName:     ld.tagDetails.plcName     ?? null,
//             isActive:    ld.tagDetails.isActive    ?? null,
//             datatype:    ld.tagDetails.datatype    ?? null,
//             health:      ld.tagDetails.health      ?? null,
//           }
//         : null,
//     })),
//   }));

//   return {
//     currentPage:    pageNum,
//     totalPageCount,
//     totalDataCount,
//     data,
//   };
// }



// async function getTagAnomalies({ tagId, startTime, endTime, limit = 10, page = 1 }) {

//   if (!mongoose.Types.ObjectId.isValid(tagId)) {
//     throw new Error("Invalid tagId format. Must be a valid ObjectId.");
//   }

//   const start = new Date(startTime);
//   const end   = new Date(endTime);

//   if (isNaN(start.getTime()) || isNaN(end.getTime())) {
//     throw new Error("Invalid startTime or endTime. Must be valid ISO 8601 dates.");
//   }

//   if (start >= end) {
//     throw new Error("startTime must be before endTime.");
//   }

//   const pageNum   = Math.max(1, parseInt(page));
//   const limitNum  = Math.min(100, Math.max(1, parseInt(limit)));
//   const skipCount = (pageNum - 1) * limitNum;

//   const emptyResult = {
//     currentPage:    pageNum,
//     totalPageCount: 0,
//     totalDataCount: 0,
//     data:           [],
//   };

//   // ── Fetch TagLive for unit + setPointLimit ─────────────────────────────
//   const tagLive = await TagLive.findOne(
//     { _id: new mongoose.Types.ObjectId(tagId), isActive: true },
//     { ranges: 1, unit: 1 }
//   ).lean();

//   const unit                   = tagLive?.unit ?? "";
//   const { minValue, maxValue } = tagLive?.ranges || {};
//   const setPointLimit          = (minValue != null && maxValue != null)
//     ? `${minValue}-${maxValue}`.trim()
//     : null;

//   // ── sourceDetails.tagId is stored as STRING in DB ──────────────────────
//   const matchStage = {
//     "sourceDetails.tagId": new mongoose.Types.ObjectId(tagId),               // ← string not ObjectId
//     triggeredAt:           { $gte: start, $lte: end },
//   };

//   console.log("???",matchStage)


//   // ── Count total for pagination ─────────────────────────────────────────
//   const totalDataCount = await SetpointDeviationEvent.countDocuments(matchStage);
//   if (!totalDataCount) return emptyResult;

//   console.log("TTTT",totalDataCount)

//   const totalPageCount = Math.ceil(totalDataCount / limitNum);

//   // ── Aggregation pipeline ───────────────────────────────────────────────
//   // const deviationDocs = await SetpointDeviationEvent.aggregate([
//   //   { $match: matchStage },
//   //   { $sort:  { triggeredAt: -1 } },
//   //   { $skip:  skipCount },
//   //   { $limit: limitNum },
//   //   // Join liveData_test using liveDataRefs array
//   //   {
//   //     $lookup: {
//   //       from:         "liveData_test",
//   //       localField:   "liveDataRefs",
//   //       foreignField: "_id",
//   //       as:           "liveDataDocs",
//   //     },
//   //   },
//   //   // Join tag_lives using tag_id from each liveData doc
//   //   {
//   //     $lookup: {
//   //       from: "tag_lives",
//   //       let:  { liveDataDocs: "$liveDataDocs" },
//   //       pipeline: [
//   //         {
//   //           $match: {
//   //             $expr: {
//   //               $in: [
//   //                 "$_id",
//   //                 {
//   //                   $map: {
//   //                     input: "$$liveDataDocs",
//   //                     as:    "ld",
//   //                     in:    "$$ld.tag_id",
//   //                   },
//   //                 },
//   //               ],
//   //             },
//   //           },
//   //         },
//   //         {
//   //           $project: {
//   //             tagname:     1,
//   //             unit:        1,
//   //             ranges:      1,
//   //             plcName:     1,
//   //             isActive:    1,
//   //             latestValue: 1,
//   //             datatype:    1,
//   //             health:      1,
//   //           },
//   //         },
//   //       ],
//   //       as: "tagDocs",
//   //     },
//   //   },
//   //   // Merge tagDetails into each liveData doc
//   //   {
//   //     $addFields: {
//   //       liveDataRefs: {
//   //         $map: {
//   //           input: "$liveDataDocs",
//   //           as:    "ld",
//   //           in: {
//   //             _id:       "$$ld._id",
//   //             value:     "$$ld.value",
//   //             timestamp: "$$ld.timestamp",
//   //             tagDetails: {
//   //               $arrayElemAt: [
//   //                 {
//   //                   $filter: {
//   //                     input: "$tagDocs",
//   //                     as:    "tag",
//   //                     cond:  { $eq: ["$$tag._id", "$$ld.tag_id"] },
//   //                   },
//   //                 },
//   //                 0,
//   //               ],
//   //             },
//   //           },
//   //         },
//   //       },
//   //     },
//   //   },
//   //   // Remove raw joined arrays
//   //   {
//   //     $project: {
//   //       liveDataDocs: 0,
//   //       tagDocs:      0,
//   //     },
//   //   },
//   // ]);

//   // const deviationDocs = await SetpointDeviationEvent.aggregate([
//   //   { $match: matchStage },
//   //   { $sort:  { triggeredAt: -1 } },
//   //   { $skip:  skipCount },
//   //   { $limit: limitNum },

//   //   // STEP 1: Join liveData_test using liveDataRefs array
//   //   {
//   //     $lookup: {
//   //       from:         "liveData_test",
//   //       localField:   "liveDataRefs",
//   //       foreignField: "_id",
//   //       as:           "joinedLiveData",
//   //     },
//   //   },

//   //   // STEP 2: Extract tag_ids from joined liveData into a temp field
//   //   {
//   //     $addFields: {
//   //       _tagIds: {
//   //         $map: {
//   //           input: "$joinedLiveData",
//   //           as:    "ld",
//   //           in:    "$$ld.tag_id",
//   //         },
//   //       },
//   //     },
//   //   },

//   //   // STEP 3: Simple $lookup on tag_lives using extracted _tagIds
//   //   {
//   //     $lookup: {
//   //       from:         "tag_lives",
//   //       localField:   "_tagIds",
//   //       foreignField: "_id",
//   //       as:           "joinedTagDocs",
//   //     },
//   //   },

//   //   // STEP 4: Merge tagDetails into each liveData item
//   //   {
//   //     $addFields: {
//   //       liveDataRefs: {
//   //         $map: {
//   //           input: "$joinedLiveData",
//   //           as:    "ld",
//   //           in: {
//   //             _id:       "$$ld._id",
//   //             value:     "$$ld.value",
//   //             timestamp: "$$ld.timestamp",
//   //             tagDetails: {
//   //               $arrayElemAt: [
//   //                 {
//   //                   $filter: {
//   //                     input: "$joinedTagDocs",
//   //                     as:    "tag",
//   //                     cond:  { $eq: ["$$tag._id", "$$ld.tag_id"] },
//   //                   },
//   //                 },
//   //                 0,
//   //               ],
//   //             },
//   //           },
//   //         },
//   //       },
//   //     },
//   //   },

//   //   // STEP 5: Clean up temp fields
//   //   {
//   //     $project: {
//   //       joinedLiveData: 0,
//   //       joinedTagDocs:  0,
//   //       _tagIds:        0,
//   //     },
//   //   },
//   // ]);

//   const deviationDocs = await SetpointDeviationEvent.aggregate([
//     { $match: matchStage },
//     { $sort:  { triggeredAt: -1 } },
//     { $skip:  skipCount },
//     { $limit: limitNum },

//     // STEP 1: Join liveData_test using liveDataRefs array
//     {
//       $lookup: {
//         from:         "liveData_test",
//         localField:   "liveDataRefs",
//         foreignField: "_id",
//         as:           "joinedLiveData",
//       },
//     },

//     // STEP 2: Join tag_lives directly using liveDataRefs → tag_id
//     {
//       $lookup: {
//         from:         "tag_lives",
//         localField:   "joinedLiveData.tag_id",  // ← direct path, no $map needed
//         foreignField: "_id",
//         as:           "joinedTagDocs",
//       },
//     },

//     // STEP 3: Merge tagDetails into each liveData item
//     {
//       $addFields: {
//         liveDataRefs: {
//           $map: {
//             input: "$joinedLiveData",
//             as:    "ld",
//             in: {
//               _id:       "$$ld._id",
//               value:     "$$ld.value",
//               timestamp: "$$ld.timestamp",
//               tagDetails: {
//                 $arrayElemAt: [
//                   {
//                     $filter: {
//                       input: "$joinedTagDocs",
//                       as:    "tag",
//                       cond:  { $eq: ["$$tag._id", "$$ld.tag_id"] },
//                     },
//                   },
//                   0,
//                 ],
//               },
//             },
//           },
//         },
//       },
//     },

//     // STEP 4: Clean up
//     {
//       $project: {
//         joinedLiveData: 0,
//         joinedTagDocs:  0,
//       },
//     },
//   ]);


//   // console.log("<<<<<>>>>>",deviationDocs)

// // return

//   // ── Format response ────────────────────────────────────────────────────
//   const data = deviationDocs.map((doc) => ({
//     id:             doc._id,
//     severity:       "warning",
//     fault:          doc.deviationType ?? null,
//     breachDateTime: doc.triggeredAt   ?? null,
//     setPointBreach: doc.value         ?? null,
//     unit,
//     setPointLimit,
//     message:        `${doc.sourceDetails?.tagname ?? "Tag"} deviated from setpoint (${doc.deviationType}) with value ${doc.value}`,
//     liveDataRefs:   (doc.liveDataRefs || []).map((ld) => ({
//       _id:       ld._id,
//       value:     ld.value     ?? null,
//       timestamp: ld.timestamp ?? null,
//       tagDetails: ld.tagDetails
//         ? {
//             _id:         ld.tagDetails._id,
//             tagname:     ld.tagDetails.tagname     ?? null,
//             latestValue: ld.tagDetails.latestValue ?? null,
//             unit:        ld.tagDetails.unit        ?? null,
//             ranges:      ld.tagDetails.ranges      ?? null,
//             plcName:     ld.tagDetails.plcName     ?? null,
//             isActive:    ld.tagDetails.isActive    ?? null,
//             datatype:    ld.tagDetails.datatype    ?? null,
//             health:      ld.tagDetails.health      ?? null,
//           }
//         : null,
//     })),
//   }));

//   return {
//     currentPage:    pageNum,
//     totalPageCount,
//     totalDataCount,
//     data,
//   };
// }

// new fast - cache anomaly 
async function getTagAnomaliesFast({ tagIds, startTime, endTime, limit = 10, page = 1 }) {
  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
  const skip = (pageNum - 1) * limitNum;

  const objectIds = tagIds.map((id) => new mongoose.Types.ObjectId(id));

  const match = {
    tagId: objectIds.length === 1 ? objectIds[0] : { $in: objectIds },
    breachDateTime: {
      $gte: new Date(startTime),
      $lte: new Date(endTime),
    },
  };

  const [rows, total] = await Promise.all([
    TagAnomalyCache.find(match)
      .sort({ breachDateTime: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean(),

    TagAnomalyCache.countDocuments(match),
  ]);

  return {
    currentPage: pageNum,
    totalPageCount: Math.ceil(total / limitNum),
    totalDataCount: total,
    data: rows.map((r) => ({
      ...r.payload,
      acknowledged: r.acknowledged ?? false,
    })),
  };
}

// old
async function getTagAnomalies({ tagId, startTime, endTime, limit = 10, page = 1 }) {
 
  if (!mongoose.Types.ObjectId.isValid(tagId)) {
    throw new Error("Invalid tagId format. Must be a valid ObjectId.");
  }
 
  const start = new Date(startTime);
  const end   = new Date(endTime);
 
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    throw new Error("Invalid startTime or endTime. Must be valid ISO 8601 dates.");
  }
 
  if (start >= end) {
    throw new Error("startTime must be before endTime.");
  }
 
  const pageNum   = Math.max(1, parseInt(page));
  const limitNum  = Math.min(100, Math.max(1, parseInt(limit)));
  const skipCount = (pageNum - 1) * limitNum;
 
  const emptyResult = {
    currentPage:    pageNum,
    totalPageCount: 0,
    totalDataCount: 0,
    data:           [],
  };
 
  // ── STEP 1: Fetch TagLive for unit + setPointLimit ─────────────────────
  const tagLive = await TagLive.findOne(
    { _id: new mongoose.Types.ObjectId(tagId), isActive: true },
    { ranges: 1, unit: 1 }
  ).lean();
 
  const unit                   = tagLive?.unit ?? "";
  const { minValue, maxValue } = tagLive?.ranges || {};
  const setPointLimit          = (minValue != null && maxValue != null)
    ? `${minValue}-${maxValue} ${unit}`.trim()
    : null;
 
  const matchStage = {
    "sourceDetails.tagId": new mongoose.Types.ObjectId(tagId),
    triggeredAt:           { $gte: start, $lte: end },
  };
 
  // ── STEP 2: Count for pagination ───────────────────────────────────────
  const totalDataCount = await SetpointDeviationEvent.countDocuments(matchStage);
  if (!totalDataCount) return emptyResult;
 
  const totalPageCount = Math.ceil(totalDataCount / limitNum);
 
  // ── STEP 3: Fetch paginated deviation events (no $lookup) ──────────────
  const deviationDocs = await SetpointDeviationEvent.find(matchStage)
    .sort({ triggeredAt: -1 })
    .skip(skipCount)
    .limit(limitNum)
    .lean();
 
  // ── STEP 4: Collect all liveDataRef ids from deviation docs ────────────
  const allRefIds = deviationDocs
    .flatMap((d) => d.liveDataRefs || [])
    .map((id) => new mongoose.Types.ObjectId(id));
 
  // ── STEP 5: Fetch liveData records by _id (fast — uses _id index) ──────
  const liveDataRecords = await TagHistory.find(
    { _id: { $in: allRefIds } },
    { tag_id: 1, value: 1, timestamp: 1 }
  ).lean();
 
  // ── STEP 6: Collect unique tag_ids from liveData records ───────────────
  const uniqueTagIds = [
    ...new Set(liveDataRecords.map((r) => r.tag_id?.toString()).filter(Boolean)),
  ].map((id) => new mongoose.Types.ObjectId(id));
 
  // ── STEP 7: Fetch tag_lives for those tag_ids ──────────────────────────
  const tagLiveDocs = await TagLive.find(
    { _id: { $in: uniqueTagIds } },
    { tagname: 1, unit: 1, ranges: 1, plcName: 1, isActive: 1, latestValue: 1, datatype: 1, health: 1 }
  ).lean();
 
  // ── Build lookup maps ──────────────────────────────────────────────────
  // liveData _id → record
  const liveDataMap = {};
  liveDataRecords.forEach((r) => {
    liveDataMap[r._id.toString()] = r;
  });
 
  // tag _id → tag details
  const tagLiveMap = {};
  tagLiveDocs.forEach((t) => {
    tagLiveMap[t._id.toString()] = t;
  });
 
  // ── STEP 8: Format response ────────────────────────────────────────────
  const data = deviationDocs.map((doc) => ({
    id:             doc._id,
    severity:       "warning",
    fault:          doc.deviationType ?? null,
    breachDateTime: doc.triggeredAt   ?? null,
    setPointBreach: doc.value         ?? null,
    unit,
    setPointLimit,
    message:        `${doc.sourceDetails?.tagname ?? "Tag"} deviated from setpoint (${doc.deviationType}) with value ${doc.value}`,
    tagDetails: {
      tagId: doc.sourceDetails?.tagId ?? null,
      tagname: doc.sourceDetails?.tagname ?? null,
      unit: doc.sourceDetails?.unit ?? null,
      ranges: doc.sourceDetails?.ranges ?? null,
    },
    liveDataRefs:   (doc.liveDataRefs || []).map((refId) => {
      const rec     = liveDataMap[refId.toString()];
      const tagDetail = rec?.tag_id ? tagLiveMap[rec.tag_id.toString()] : null;
      return {
        _id:       refId,
        value:     rec?.value     ?? null,
        timestamp: rec?.timestamp ?? null,
        tagDetails: tagDetail
          ? {
              _id:         tagDetail._id,
              tagname:     tagDetail.tagname     ?? null,
              latestValue: tagDetail.latestValue ?? null,
              unit:        tagDetail.unit        ?? null,
              ranges:      tagDetail.ranges      ?? null,
              plcName:     tagDetail.plcName     ?? null,
              isActive:    tagDetail.isActive    ?? null,
              datatype:    tagDetail.datatype    ?? null,
              health:      tagDetail.health      ?? null,
            }
          : null,
      };
    }),
  }));
 
  return {
    currentPage:    pageNum,
    totalPageCount,
    totalDataCount,
    data,
  };
}


// 2
// async function getTagAnomalies({
//   tagId,
//   startTime,
//   endTime,
//   limit = 10,
//   page = 1,
//   maxRefsPerEvent = 50, // 🔥 NEW: Limit refs per event
// }) {
//   if (!mongoose.Types.ObjectId.isValid(tagId)) {
//     throw new Error("Invalid tagId format. Must be a valid ObjectId.");
//   }

//   const start = new Date(startTime);
//   const end = new Date(endTime);

//   if (isNaN(start.getTime()) || isNaN(end.getTime())) {
//     throw new Error("Invalid startTime or endTime. Must be valid ISO 8601 dates.");
//   }

//   if (start >= end) {
//     throw new Error("startTime must be before endTime.");
//   }

//   const pageNum = Math.max(1, parseInt(page));
//   const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
//   const skipCount = (pageNum - 1) * limitNum;

//   const emptyResult = {
//     currentPage: pageNum,
//     totalPageCount: 0,
//     totalDataCount: 0,
//     data: [],
//   };

//   const tagObjectId = new mongoose.Types.ObjectId(tagId);
//   const matchStage = {
//     "sourceDetails.tagId": tagObjectId,
//     triggeredAt: { $gte: start, $lte: end },
//   };

//   // 🔥 OPTIMIZATION 1: Parallel queries for Step 1 & 2
//   const [tagLive, totalDataCount] = await Promise.all([
//     TagLive.findOne(
//       { _id: tagObjectId, isActive: true },
//       { ranges: 1, unit: 1 }
//     ).lean(),
//     SetpointDeviationEvent.countDocuments(matchStage),
//   ]);

//   if (!totalDataCount) return emptyResult;

//   const unit = tagLive?.unit ?? "";
//   const { minValue, maxValue } = tagLive?.ranges || {};
//   const setPointLimit =
//     minValue != null && maxValue != null
//       ? `${minValue}-${maxValue} ${unit}`.trim()
//       : null;

//   const totalPageCount = Math.ceil(totalDataCount / limitNum);

//   // 🔥 OPTIMIZATION 2: Limit liveDataRefs in projection
//   const deviationDocs = await SetpointDeviationEvent.find(matchStage, {
//     _id: 1,
//     deviationType: 1,
//     triggeredAt: 1,
//     value: 1,
//     "sourceDetails.tagId": 1,
//     "sourceDetails.tagname": 1,
//     "sourceDetails.unit": 1,
//     "sourceDetails.ranges": 1,
//     liveDataRefs: { $slice: maxRefsPerEvent }, // 🔥 Limit refs
//   })
//     .sort({ triggeredAt: -1 })
//     .skip(skipCount)
//     .limit(limitNum)
//     .lean();

//   // 🔥 OPTIMIZATION 3: Collect limited refs
//   const allRefIds = deviationDocs
//     .flatMap((d) => (d.liveDataRefs || []).slice(0, maxRefsPerEvent))
//     .map((id) => new mongoose.Types.ObjectId(id));

//   if (!allRefIds.length) {
//     return {
//       currentPage: pageNum,
//       totalPageCount,
//       totalDataCount,
//       data: deviationDocs.map((doc) => ({
//         id: doc._id,
//         severity: "warning",
//         fault: doc.deviationType ?? null,
//         breachDateTime: doc.triggeredAt ?? null,
//         setPointBreach: doc.value ?? null,
//         unit,
//         setPointLimit,
//         message: `${doc.sourceDetails?.tagname ?? "Tag"} deviated from setpoint (${doc.deviationType}) with value ${doc.value}`,
//         tagDetails: {
//           tagId: doc.sourceDetails?.tagId ?? null,
//           tagname: doc.sourceDetails?.tagname ?? null,
//           unit: doc.sourceDetails?.unit ?? null,
//           ranges: doc.sourceDetails?.ranges ?? null,
//         },
//         liveDataRefs: [],
//       })),
//     };
//   }

//   // 🔥 OPTIMIZATION 4: Fetch liveData and extract tag_ids in one pass
//   const liveDataRecords = await TagHistory.find(
//     { _id: { $in: allRefIds } },
//     { tag_id: 1, value: 1, timestamp: 1 }
//   ).lean();

//   // Build liveData map and collect unique tag_ids simultaneously
//   const liveDataMap = new Map();
//   const uniqueTagIdsSet = new Set();

//   liveDataRecords.forEach((r) => {
//     liveDataMap.set(r._id.toString(), r);
//     if (r.tag_id) {
//       uniqueTagIdsSet.add(r.tag_id.toString());
//     }
//   });

//   const uniqueTagIds = Array.from(uniqueTagIdsSet).map(
//     (id) => new mongoose.Types.ObjectId(id)
//   );

//   // 🔥 OPTIMIZATION 5: Fetch only if we have tag_ids
//   let tagLiveMap = new Map();
  
//   if (uniqueTagIds.length > 0) {
//     const tagLiveDocs = await TagLive.find(
//       { _id: { $in: uniqueTagIds } },
//       {
//         tagname: 1,
//         unit: 1,
//         ranges: 1,
//         plcName: 1,
//         isActive: 1,
//         latestValue: 1,
//         datatype: 1,
//         health: 1,
//       }
//     ).lean();

//     tagLiveDocs.forEach((t) => {
//       tagLiveMap.set(t._id.toString(), t);
//     });
//   }

//   // 🔥 OPTIMIZATION 6: Format response with Map lookups (faster than object)
//   const data = deviationDocs.map((doc) => ({
//     id: doc._id,
//     severity: "warning",
//     fault: doc.deviationType ?? null,
//     breachDateTime: doc.triggeredAt ?? null,
//     setPointBreach: doc.value ?? null,
//     unit,
//     setPointLimit,
//     message: `${doc.sourceDetails?.tagname ?? "Tag"} deviated from setpoint (${doc.deviationType}) with value ${doc.value}`,
//     tagDetails: {
//       tagId: doc.sourceDetails?.tagId ?? null,
//       tagname: doc.sourceDetails?.tagname ?? null,
//       unit: doc.sourceDetails?.unit ?? null,
//       ranges: doc.sourceDetails?.ranges ?? null,
//     },
//     liveDataRefs: (doc.liveDataRefs || [])
//       .slice(0, maxRefsPerEvent)
//       .map((refId) => {
//         const refIdStr = refId.toString();
//         const rec = liveDataMap.get(refIdStr);
//         const tagDetail = rec?.tag_id ? tagLiveMap.get(rec.tag_id.toString()) : null;
        
//         return {
//           _id: refId,
//           value: rec?.value ?? null,
//           timestamp: rec?.timestamp ?? null,
//           tagDetails: tagDetail
//             ? {
//                 _id: tagDetail._id,
//                 tagname: tagDetail.tagname ?? null,
//                 latestValue: tagDetail.latestValue ?? null,
//                 unit: tagDetail.unit ?? null,
//                 ranges: tagDetail.ranges ?? null,
//                 plcName: tagDetail.plcName ?? null,
//                 isActive: tagDetail.isActive ?? null,
//                 datatype: tagDetail.datatype ?? null,
//                 health: tagDetail.health ?? null,
//               }
//             : null,
//         };
//       }),
//   }));

//   return {
//     currentPage: pageNum,
//     totalPageCount,
//     totalDataCount,
//     data,
//   };
// }


// these code is added for getting the data from 6am to 7pm (this is commented as the format compact & points came into functionality - recently commented)
// async function getRawPoints({ tagId, startTime, endTime }) {

//   if (!mongoose.Types.ObjectId.isValid(tagId)) {
//     throw new Error("Invalid tagId format");
//   }

//   const start = new Date(startTime);
//   const end   = new Date(endTime);

//   const tagObjectId = new mongoose.Types.ObjectId(tagId);

//   // =========================
//   // RAW WINDOW (UNCHANGED)
//   // =========================
//   const rawStart = new Date(start);
//   rawStart.setUTCHours(0, 30, 0, 0);

//   const now = new Date();

//   const rawEnd = new Date(start);
//   rawEnd.setUTCHours(
//     now.getUTCHours(),
//     now.getUTCMinutes(),
//     now.getUTCSeconds(),
//     now.getUTCMilliseconds()
//   );

//   const maxRawEnd = new Date(start);
//   maxRawEnd.setUTCHours(13, 30, 0, 0);

//   if (rawEnd > maxRawEnd) {
//     rawEnd.setTime(maxRawEnd.getTime());
//   }

//   console.log("Raw Query Range:", rawStart, "to", rawEnd);

//   // =========================
//   // FUTURE WINDOW (UNCHANGED)
//   // =========================
//   const futureStart = new Date(start);
//   futureStart.setUTCHours(0, 30, 0, 0);

//   const futureEnd = new Date(start);
//   futureEnd.setUTCHours(13, 30, 0, 0);

//   console.log("Future Query Range:", futureStart, "to", futureEnd);

//   const forecastCollection =
//     mongoose.connection.db.collection("aiforecast");

//   // =========================
//   // OPTIMIZED QUERIES
//   // =========================
//   const [rawDocs, futureDocs] = await Promise.all([

//     // 🔥 RAW (aggregation instead of cursor + JS Set)
//     TagHistory.aggregate([
//       {
//         $match: {
//           tag_id: tagObjectId,
//           timestamp: { $gte: rawStart, $lte: rawEnd },
//         },
//       },
//       { $sort: { timestamp: 1 } },

//       // remove duplicates at DB level
//       {
//         $group: {
//           _id: {
//             timestamp: "$timestamp",
//             value: "$value",
//           },
//           timestamp: { $first: "$timestamp" },
//           value: { $first: "$value" },
//         },
//       },
//       { $sort: { timestamp: 1 } },

//       // { $limit: 10000 } // safety cap
//     ]),

//     // 🔥 FUTURE (toArray instead of cursor loop)
//     forecastCollection
//       .find(
//         {
//           tagId: tagObjectId,
//           timestamp: {
//             $gte: futureStart,
//             $lt: futureEnd,
//           },
//         },
//         {
//           projection: {
//             timestamp: 1,
//             predictedValue: 1,
//             _id: 0,
//           },
//         }
//       )
//       .sort({ timestamp: 1 })
//       // .limit(10000) // prevent large scan
//       .toArray()
//   ]);

//   // =========================
//   // FORMAT OUTPUT
//   // =========================
//   // const rawPoints = rawDocs.map((doc) => ({
//   //   timestamp: doc.timestamp,
//   //   value: doc.value,
//   // }));

//   // format output change for demo - size decrease
//   const rawPoints = rawDocs.map(doc => doc.value);
//   const futureValues = futureDocs.map(doc => doc.predictedValue);

//   const futureStartTime = futureDocs.length ? futureDocs[0].timestamp : null;
//   const futureEndTime = futureDocs.length ? futureDocs[futureDocs.length - 1].timestamp : null;

//   // const future = futureDocs.map((doc) => ({
//   //   timestamp: doc.timestamp,
//   //   value: doc.predictedValue,
//   // }));

//   return {
//     tagId,
//     rawPoints,
//     future: {
//     start: futureStartTime,
//     end: futureEndTime,
//     values: futureValues // [3.1, 3.2, 3.3...]
//     }
//   };
// }

// these are commented as the above code is used staticly, if required for production uncomment these

// async function getRawPoints({ tagId, startTime, endTime }) {

//   if (!mongoose.Types.ObjectId.isValid(tagId)) {
//     throw new Error("Invalid tagId format");
//   }

//   const start = new Date(startTime);
//   const end   = new Date(endTime);

//   if (isNaN(start) || isNaN(end)) {
//     throw new Error("Invalid dates");
//   }

//   if (start >= end) {
//     throw new Error("startTime must be before endTime");
//   }

//   const tagObjectId = new mongoose.Types.ObjectId(tagId);

//   // 🔹 RAW POINTS
//   const rawCursor = TagHistory.find({
//     tag_id: tagObjectId,
//     timestamp: { $gte: start, $lte: end },
//   })
//     .sort({ timestamp: 1 })
//     .select({ timestamp: 1, value: 1, _id: 0 })
//     .lean()
//     .cursor();

//   const rawPoints = [];
//   const MAX_POINTS = 5000;

//   for (let doc = await rawCursor.next(); doc != null; doc = await rawCursor.next()) {
//     rawPoints.push({
//       timestamp: doc.timestamp,
//       value: doc.value,
//     });

//     // if (rawPoints.length >= MAX_POINTS) break;
//   }

//   // 🔹 FUTURE (aiforecast collection)
//   const forecastCollection = mongoose.connection.db.collection("aiforecast");

//   const futureCursor = forecastCollection.find(
//     {
//       tagId: tagObjectId,
//       timestamp: { $gte: start, $lte: end },
//     },
//     {
//       projection: { timestamp: 1, predictedValue: 1, _id: 0 },
//     }
//   ).sort({ timestamp: 1 });

//   const future = [];

//   for (let doc = await futureCursor.next(); doc != null; doc = await futureCursor.next()) {
//     future.push({
//       timestamp: doc.timestamp,
//       value: doc.predictedValue,
//     });
//   }
//   console.log("countssss",future.length,rawPoints.length)

//   return {
//     tagId,
//     rawPoints,
//     future,
//   };
// }

async function getRawPoints({
  tagId,
  startTime,
  endTime,
  interval,
  aggregation,
  format = "compact"
}) {

  if (!tagId ||!startTime ||!endTime ||!interval ||!aggregation) {
    throw new Error("Missing required parameters");
  }

  if (!mongoose.Types.ObjectId.isValid(tagId)) {
    throw new Error("Invalid tagId");
  }

  const allowedAggregations = ["avg","sum","min","max","count","first","last"];

  if (!allowedAggregations.includes(aggregation)) {
    throw new Error("Invalid aggregation");
  }

  const intervalMs = parseISODuration(interval);

  const tagObjectId = new mongoose.Types.ObjectId(tagId);

  const start = new Date(startTime);
  const end = new Date(endTime);

  if (isNaN(start) || isNaN(end)) {
    throw new Error("Invalid date");
  }

  const rawStart = new Date(start);

  const rawEnd = new Date(end);
 // if only date is passed
// if (startTime.length === 10) {
//   rawStart.setUTCHours(0, 0, 0, 0);
// }

// if (endTime.length === 10) {
//   rawEnd.setUTCHours(23, 59, 59, 999);
// }


  const forecastCollection =mongoose.connection.db.collection("aiforecast");

  // =========================
  // RAW DATA AGGREGATION
  // =========================

  const rawPromise = TagHistory.aggregate([

    {
      $match: {
        tag_id: tagObjectId,
        timestamp: {
          $gte: rawStart,
          $lte: rawEnd
        }
      }
    },

    {
      $project: {
        timestamp: 1,
        value: 1
      }
    },

    {
      $sort: {
        timestamp: 1
      }
    },

    {
      $group: {

        _id: {
          bucket: {
            $toDate: {
              // $subtract: [
              //   { $toLong: "$timestamp" },
              //   {
              //     $mod: [
              //       { $toLong: "$timestamp" },
              //       intervalMs
              //     ]
              $subtract: [
                { $toLong: "$timestamp" },
                {
                  $mod: [
                    {
                      $subtract: [
                        { $toLong: "$timestamp" },
                        rawStart.getTime()
                      ]
                    },
                    intervalMs
                  ]
                }
              ]
            }
          }
        },

        avg: { $avg: "$value" },
        sum: { $sum: "$value" },
        min: { $min: "$value" },
        max: { $max: "$value" },
        count: { $sum: 1 },
        first: { $first: "$value" },
        last: { $last: "$value" },
        firstTimestamp: { $first: "$timestamp" },
        lastTimestamp: { $last: "$timestamp" }
      }
    },

    {
      $sort: {
        "_id.bucket": 1
      }
    }

  ]);

  // =========================
  // FORECAST AGGREGATION
  // =========================

  const forecastPromise = forecastCollection.aggregate([

    {
      $match: {
        tagId: tagObjectId,
        // tag_id: tagObjectId,
        timestamp: {
          $gte: rawStart,
          $lte: rawEnd
        }
      }
    },

    {
      $project: {
        timestamp: 1,
        value: "$predictedValue"
      }
    },

    {
      $sort: {
        timestamp: 1
      }
    },

    {
      $group: {

        _id: {
          bucket: {
            $toDate: {
              $subtract: [
                { $toLong: "$timestamp" },
                {
                  $mod: [
                    { $toLong: "$timestamp" },
                    intervalMs
                  ]
                }
              ]
            }
          }
        },

        avg: { $avg: "$value" },
        sum: { $sum: "$value" },
        min: { $min: "$value" },
        max: { $max: "$value" },
        count: { $sum: 1 },
        first: { $first: "$value" },
        last: { $last: "$value" },
        firstTimestamp: { $first: "$timestamp" },
        lastTimestamp: { $last: "$timestamp" }
      }
    },

    {
      $sort: {
        "_id.bucket": 1
      }
    }

  ]).toArray();

  // =========================
  // EXECUTE IN PARALLEL
  // =========================

  const [rawDocs, futureDocs] = await Promise.all([
    rawPromise,
    forecastPromise
  ]);

  // =========================
  // AGGREGATION VALUE PICKER
  // =========================

  function getValue(doc) {

    switch (aggregation) {

      case "avg":
        return doc.avg;

      case "sum":
        return doc.sum;

      case "min":
        return doc.min;

      case "max":
        return doc.max;

      case "count":
        return doc.count;

      case "first":
        return doc.first;

      case "last":
        return doc.last;

      default:
        return null;
    }
  }

  // =========================
  // FORMAT HISTORICAL
  // =========================

  const historicalPoints = rawDocs.map(doc => ({
    ts: doc._id.bucket.toISOString(),
    value: Number(Number(getValue(doc)))
  }));

  // =========================
  // FORMAT FORECAST
  // =========================

  const forecastPoints = futureDocs.map(doc => ({
    ts: doc._id.bucket.toISOString(),
    value: Number(Number(getValue(doc)))
  }));

  // =========================
  // RESPONSE
  // =========================

  if (format === "points") {
    return {
      tagId,
      meta: {
        aggregation,
        interval
      },
      historical: historicalPoints,
      forecast: forecastPoints
    };
  }

  // =========================
  // COMPACT FORMAT
  // =========================

  return {
    tagId,
    meta: {
      aggregation,
      interval
    },
    historical: {

  start:
    rawDocs.length
      ? rawDocs[0].firstTimestamp.toISOString()
      : null,

  end:
    rawDocs.length
      ? rawDocs[rawDocs.length - 1].lastTimestamp.toISOString()
      : null,

  values:
    historicalPoints.map(p => p.value)
},
    forecast: {

  start:
    futureDocs.length
      ? futureDocs[0].firstTimestamp
      : null,

  end:
    futureDocs.length
      ? futureDocs[futureDocs.length - 1].lastTimestamp
      : null,

  values:
    forecastPoints.map(p => p.value)
}
  };
}

async function getDefectPoints() {

  const forecastDefectCollection =mongoose.connection.db.collection("forecastDefects");

const forecastDefects = await forecastDefectCollection.aggregate([
  {
    $project: {
      _id: 1,
      forecastTimestamp: 1,
      status: 1,
      firstDetectedAt: 1,
      lastStatusChangeAt: 1,
      lastUpdatedAt: 1,
      acknowledged:1,
      detectedDefects: {
        $map: {
          input: "$detectedDefects",
          as: "defect",
          in: {
            defectName: "$$defect.defectName",
            confidenceScore: "$$defect.confidenceScore",
            riskLevel: "$$defect.riskLevel",
            triggeredRules: {
              $map: {
                input: "$$defect.triggeredRules",
                as: "rule",
                in: {
                  tagId: "$$rule.tagId",
                  forecastedValue: "$$rule.forecastedValue",
                },
              },
            },
          },
        },
      },
    },
  },
  {
    $sort: {
      forecastTimestamp: 1,
    },
  },
]).toArray();

return forecastDefects; 

// await sendForeCastDefects("forecastdefects", forecastDefects)

}

async function updateforecastAcknowledged(reqbody, forecastDefectId) {
  try {

    const { acknowledged, acknowledgedBy, acknowledgedAt } = reqbody;
    const result = await forecastDefects.updateOne(
      { _id: forecastDefectId },
      {
        $set: {
          acknowledged,
          acknowledgedBy,
          acknowledgedAt,
          updatedAt: Date.now()
        },
      }
    );

    return result;
  } catch (error) {
    throw error;
  }
}

async function updateAnomalyAcknowledged(reqbody, anomalyId) {
  try {

    const { acknowledged, acknowledgedBy, acknowledgedAt } = reqbody;
    const result = await TagAnomalyCache.updateOne(
      { "payload.id": new mongoose.Types.ObjectId(anomalyId) },
      {
        $set: {
          acknowledged,
          acknowledgedBy,
          acknowledgedAt,
          updatedAt: Date.now()
        },
      }
    );
    return result;
  } catch (error) {
    throw error;
  }
}


module.exports = { fetchAllTags, fetchTagsByAssetId,getTagHistory,getAllLiveTags,getTagAnomalies,getRawPoints,getTagAnomaliesFast,getDefectPoints,updateforecastAcknowledged,updateAnomalyAcknowledged };