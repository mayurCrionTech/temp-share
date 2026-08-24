// const {
//   TagLive,
//   getLiveDataCollection,
// } = require("../../../models/mongoDB/tags/newTagModel");
const {
  TagLive,
  getLiveDataCollection,
} = require("../../../models/mongoDB/tags/tagsModel");

const {
  workOrders,
} = require("../../../models/mongoDB/maintenanceManagement/workOrder_model");

// Convert PT5M / PT2M / PT1H to milliseconds
function parseISOInterval(interval) {
  if (!interval) return 0;

  const match = interval.match(/PT(\d+)([SMH])/);
  if (!match) return 0;

  const value = parseInt(match[1], 10);
  const unit = match[2];

  switch (unit) {
    case "S":
      return value * 1000;
    case "M":
      return value * 60 * 1000;
    case "H":
      return value * 60 * 60 * 1000;
    default:
      return 0;
  }
}

// Prevent overlapping execution
let isRunning = false;

async function runSyntheticAggregation() {
  if (isRunning) {
    // console.log("Synthetic Aggregation Skipped (already running)");
    return;
  }

  isRunning = true;

  try {
    // console.log("Synthetic Aggregation Engine Running...");

    // USE RAW COLLECTION (bypass mongoose schema filtering)
    const syntheticTags = await TagLive.collection
      .find({
        "plcMetadata.type": "synthetic",
        isActive: true,
      })
      .toArray();

      

    if (!syntheticTags.length) {
      // console.log("No synthetic tags found");
      return;
    }

    const now = Date.now();

    for (const tag of syntheticTags) {
      const { module, output, refreshInterval } = tag.plcMetadata || {};

      if (!module || !output) {
        // console.log(`Skipping ${tag.tagname} - missing module/output`);
        continue;
      }

      // Interval logic
      if (refreshInterval) {
        const intervalMs = parseISOInterval(refreshInterval);
        const lastRun = new Date(tag.updatedAt).getTime();

        if (intervalMs && now - lastRun < intervalMs) {
          // console.log(`Skipping ${tag.tagname} - interval not reached`);
          continue;
        }
      }

      let totalCount = 0;

      console.log(`Processing Tag: ${tag.tagname}`);

      for (const assetId of tag.assetId) {
        // console.log("?????",assetId,output)
        let assetCount = 0;

        switch (module) {
          case "maintenance":
            assetCount = await workOrders.countDocuments({
              asset: assetId,
              status: output,
              isDeleted: false,
              startAt:{$gte:new Date("2026-02-24T00:00:00.000Z"),$lt:new Date("2026-02-25T00:00:00.000Z")}
              

            });
            break;

          default:
            continue;
        }

        totalCount += assetCount;

        // history should not be updated

        // await getLiveDataCollection().insertOne({
        //   timestamp: new Date(),
        //   tag_id: tag._id,
        //   asset_id: assetId,
        //   value: assetCount,
        // });
      }

      // Update using mongoose model is fine
      await TagLive.updateOne(
        { _id: tag._id },
        {
          $set: {
            latestValue: totalCount,
            updatedAt: new Date(),
          },
        }
      );

      console.log(`${tag.tagname} Total Updated - ${totalCount}`);
    }

    // console.log("Synthetic Aggregation Completed Successfully");
  } catch (err) {
    console.error("Synthetic Aggregation Error:", err);
  } finally {
    isRunning = false;
  }
}

module.exports = {
  runSyntheticAggregation,
};
// Interval based logic
//
// const {
//   TagLive,
//   getLiveDataCollection,
// } = require("../models/mongoDB/tags/newTagModel");

// const {
//   workOrders,
// } = require("../models/mongoDB/maintenanceManagement/workOrder_model");

// // Convert PT5M to milliseconds
// function parseISOInterval(interval) {
//   if (!interval) return 0;

//   const match = interval.match(/PT(\d+)([SMH])/);
//   if (!match) return 0;

//   const value = parseInt(match[1], 10);
//   const unit = match[2];

//   switch (unit) {
//     case "S":
//       return value * 1000;
//     case "M":
//       return value * 60 * 1000;
//     case "H":
//       return value * 60 * 60 * 1000;
//     default:
//       return 0;
//   }
// }

// // Prevent overlapping execution
// let isRunning = false;

// async function runSyntheticAggregation() {
//   // Skip if already running
//   if (isRunning) {
//     console.log("Synthetic Aggregation Skipped (already running)");
//     return;
//   }

//   isRunning = true;

//   try {
//     console.log("Synthetic Aggregation Engine Running...");

//     const syntheticTags = await TagLive.find({
//       "plcMetadata.type": "synthetic",
//       isActive: true,
//     });

//     if (!syntheticTags.length) {
//       console.log("No synthetic tags found");
//       return;
//     }

//     const now = Date.now();

//     for (const tag of syntheticTags) {
//       const { output, module, refreshInterval } = tag.plcMetadata || {};

//       if (!output || !refreshInterval) continue;

//       const intervalMs = parseISOInterval(refreshInterval);
//       const lastRun = new Date(tag.updatedAt).getTime();

//       // Run only if interval passed
//       if (now - lastRun < intervalMs) continue;

//       let totalCount = 0;

//       console.log(`Processing Tag: ${tag.tagname}`);

//       for (const assetId of tag.assetId) {
//         let assetCount = 0;

//         switch (module) {
//           case "maintenance":
//             assetCount = await workOrders.countDocuments({
//               asset: assetId,
//               status: output,
//               isDeleted: false,
//             });
//             break;

//           default:
//             continue;
//         }

//         totalCount += assetCount;

//         // Insert one time-series record per asset
//         await getLiveDataCollection().insertOne({
//           timestamp: new Date(),
//           tag_id: tag._id,
//           asset_id: assetId,
//           value: assetCount,
//         });

//         console.log(`Asset ${assetId} - ${assetCount}`);
//       }

//       // Update aggregated total in TagLive
//       await TagLive.updateOne(
//         { _id: tag._id },
//         {
//           $set: {
//             latestValue: totalCount,
//             updatedAt: new Date(),
//           },
//         },
//       );

//       console.log(`${tag.tagname} Total Updated - ${totalCount}`);
//     }
//   } catch (err) {
//     console.error("Synthetic Aggregation Error:", err);
//   } finally {
//     // Always release lock
//     isRunning = false;
//   }
// }

// module.exports = {
//   runSyntheticAggregation,
// };
