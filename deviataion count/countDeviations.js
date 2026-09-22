const { MongoClient } = require("mongodb");

// MongoDB connection URI
const MONGO_URI =
  "mongodb://appadmindtd:4BhJJq4TH%2F%2AYinZk%21EkQ@sascpche0159.che.dc.tbintra.net:12001/paintddt?authSource=admin";

const DB_NAME = "paintddt";
const COLLECTION_NAME = "setpointDeviationEvents";

async function countSeptemberDeviations() {
  const client = new MongoClient(MONGO_URI);

  try {
    await client.connect();

    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);

    // September 1, 2026 00:00:00 UTC
    const startDate = new Date("2026-09-01T00:00:00.000Z");

    // October 1, 2026 00:00:00 UTC
    // Exclusive end date
    const endDate = new Date("2026-10-01T00:00:00.000Z");

    // Common filter
    const filter = {
      triggeredAt: {
        $gte: startDate,
        $lt: endDate,
      },
      "sourceDetails.sourceType": {
        $ne: "LOG",
      },
    };

    // -----------------------------------------
    // 1. Total deviation count
    // -----------------------------------------
    const totalCount = await collection.countDocuments(filter);

    // -----------------------------------------
    // 2. Tag-wise deviation count
    // -----------------------------------------
    const tagWiseCount = await collection
      .aggregate([
        {
          $match: filter,
        },
        {
          $group: {
            _id: "$sourceDetails.tagname",
            count: { $sum: 1 },
          },
        },
        {
          $sort: {
            count: -1,
          },
        },
      ])
      .toArray();

    // -----------------------------------------
    // Print result
    // -----------------------------------------
    console.log("\n=================================");
    console.log("Setpoint Deviation Count");
    console.log("=================================");
    console.log("Month           : September 2026");
    console.log("Collection      :", COLLECTION_NAME);
    console.log("Excluded Source : LOG");
    console.log("Total Deviations:", totalCount);

    console.log("\n=================================");
    console.log("Tag-wise Deviation Count");
    console.log("=================================");

    if (tagWiseCount.length === 0) {
      console.log("No deviations found.");
    } else {
      tagWiseCount.forEach((item) => {
        console.log(`${item._id} : ${item.count}`);
      });
    }

    console.log("=================================\n");

  } catch (error) {
    console.error("Error:", error);
  } finally {
    await client.close();
  }
}

countSeptemberDeviations();