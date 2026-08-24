const TagSummary=require("../../../models/mongoDB/tags/tagSummary")
const TagCron=require("../../../models/mongoDB/tags/tagCronmodel")
const {TagLive,TagHistory}=require("../../../models/mongoDB/tags/tagsModel")


// async function scheduleCronForTags() {

//   const jobStartTime = new Date();
//   const now = new Date();

//   const currentHour = new Date(Date.UTC(
//     now.getUTCFullYear(),
//     now.getUTCMonth(),
//     now.getUTCDate(),
//     now.getUTCHours(),
//     0, 0, 0
//   ));

//   let logDoc;

//   try {

//     // 🔹 Get last processed hour
//     const lastSummary = await TagSummary
//       .findOne()
//       .sort({ endTime: -1 });

//     let startPointer;

//     if (lastSummary) {
//       startPointer = new Date(lastSummary.endTime);
//     } else {
//       const firstLive = await TagHistory
//         .findOne()
//         .sort({ timestamp: 1 });

//       if (!firstLive) {
//         console.log("No live data found.");
//         return;
//       }

//       startPointer = new Date(firstLive.timestamp);
//     }

//     startPointer.setUTCMinutes(0, 0, 0);

//     // 🔹 Create Cron Log
//     logDoc = await TagCron.create({
//       jobName: "HourlyTagSummary",
//       windowStart: startPointer,
//       windowEnd: currentHour,
//       startedAt: jobStartTime,
//       status: "STARTED"
//     });

//     // 🔄 BACKFILL LOOP
//     while (startPointer < currentHour) {

//       const windowStart = new Date(startPointer);
//       const windowEnd = new Date(startPointer);
//       windowEnd.setUTCHours(windowEnd.getUTCHours() + 1);

//       console.log("Processing Hour:", windowStart.toISOString());

//       const result = await TagHistory.aggregate([
//         {
//           $match: {
//             timestamp: { $gte: windowStart, $lt: windowEnd }
//           }
//         },
//         { $sort: { timestamp: 1 } },
//         {
//           $group: {
//             _id: "$tag_id",
//             sum: { $sum: "$value" },
//             avg: { $avg: "$value" },
//             minValue: { $min: "$value" },
//             maxValue: { $max: "$value" },
//             count: { $sum: 1 },
//             first: { $first: "$value" },
//             last: { $last: "$value" }
//           }
//         }
//       ]);

//       for (let d of result) {

//         const tagDetails = await TagLive.findById(d._id);

//         await TagSummary.updateOne(
//           { tagId: d._id, startTime: windowStart },
//           {
//             $set: {
//               tagId: d._id,
//               tagName: tagDetails?.tagname || "",
//               unit: tagDetails?.unit || "",
//               value: d.last,
//               sum: d.sum,
//               avg: d.avg,
//               minValue: d.minValue,
//               maxValue: d.maxValue,
//               count: d.count,
//               first: d.first,
//               last: d.last,
//               startTime: windowStart,
//               endTime: windowEnd
//             }
//           },
//           { upsert: true }
//         );
//       }

//       startPointer = windowEnd;
//     }

//     await TagCron.findByIdAndUpdate(logDoc._id, {
//       endedAt: new Date(),
//       status: "COMPLETED"
//     });

//     console.log("Hourly Tag Summary Completed");

//   } catch (err) {

//     console.error("Hourly Tag Summary Failed:", err);

//     if (logDoc) {
//       await TagCron.findByIdAndUpdate(logDoc._id, {
//         endedAt: new Date(),
//         status: "FAILED",
//         message: err.message
//       });
//     }
//   }
// }
async function scheduleCronForTags() {

  const now = new Date();

  const currentHour = new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
    now.getUTCHours(),
    0, 0, 0
  ));

  // 🔹 Get all tags that have raw data
  const tagIds = await TagHistory.distinct("tag_id");

  for (let tagId of tagIds) {

    // console.log("Processing tag:", tagId.toString());

    // 🔹 Get last summary for this specific tag
    const lastSummary = await TagSummary
      .findOne({ tagId })
      .sort({ endTime: -1 });

    let startPointer;

    if (lastSummary) {
      startPointer = new Date(lastSummary.endTime);
    } else {
      const firstLive = await TagHistory
        .findOne({ tag_id: tagId })
        .sort({ timestamp: 1 });

      if (!firstLive) continue;

      startPointer = new Date(firstLive.timestamp);
    }

    // Align to hour boundary
    startPointer.setUTCMinutes(0, 0, 0);

    // 🔄 Backfill loop per tag
    while (startPointer < currentHour) {

      const windowStart = new Date(startPointer);
      const windowEnd = new Date(startPointer);
      windowEnd.setUTCHours(windowEnd.getUTCHours() + 1);

      const result = await TagHistory.aggregate([
        {
          $match: {
            tag_id: tagId,
            timestamp: { $gte: windowStart, $lt: windowEnd }
          }
        },
        { $sort: { timestamp: 1 } },
        {
          $group: {
            _id: "$tag_id",
            sum: { $sum: "$value" },
            avg: { $avg: "$value" },
            minValue: { $min: "$value" },
            maxValue: { $max: "$value" },
            count: { $sum: 1 },
            first: { $first: "$value" },
            last: { $last: "$value" }
          }
        }
      ]);

      if (result.length > 0) {

        const d = result[0];

        const tagDetails = await TagLive.findById(tagId);

        await TagSummary.updateOne(
          { tagId, startTime: windowStart },
          {
            $set: {
              tagId,
              tagName: tagDetails?.tagname || "",
              unit: tagDetails?.unit || "",
              value: d.last,
              sum: d.sum,
              avg: d.avg,
              minValue: d.minValue,
              maxValue: d.maxValue,
              count: d.count,
              first: d.first,
              last: d.last,
              startTime: windowStart,
              endTime: windowEnd
            }
          },
          { upsert: true }
        );
      }

      startPointer = windowEnd;
    }
  }

  console.log("Hourly Tag Summary Completed");
}

module.exports={scheduleCronForTags}