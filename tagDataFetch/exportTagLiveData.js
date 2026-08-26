require("dotenv").config();

const { MongoClient, ObjectId } = require("mongodb");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;

const MONGO_URI = process.env.MONGO_URI;
const DB_NAME = process.env.MONGO_DB_NAME;

// The 3 tag IDs you want
const TAG_IDS = [
  "699426acbfb07d6db09a050d",
  "699426acbfb07d6db09a0516",
  "6a7c688863f1464aebae7645",
];

async function main() {
  if (!MONGO_URI) {
    throw new Error("MONGO_URI is missing in .env");
  }

  if (!DB_NAME) {
    throw new Error("MONGO_DB_NAME is missing in .env");
  }

  const client = new MongoClient(MONGO_URI);

  try {
    console.log("Connecting to MongoDB...");

    await client.connect();

    console.log("Connected successfully.");

    const db = client.db(DB_NAME);

    const tagLivesCollection = db.collection("tag_lives");
    const liveDataCollection = db.collection("liveData_test");

    // --------------------------------------------------
    // STEP 1: Find the 3 tags from tag_lives
    // --------------------------------------------------

    const tagObjectIds = TAG_IDS.map((id) => new ObjectId(id));

    const tags = await tagLivesCollection
      .find({
        _id: {
          $in: tagObjectIds,
        },
      })
      .toArray();

    console.log(`Found ${tags.length} of ${TAG_IDS.length} tags.`);

    if (tags.length === 0) {
      console.log("No tags found.");
      return;
    }

    // Show the tags we found
    console.log("\nTags found:");

    for (const tag of tags) {
      console.log(`${tag._id} -> ${tag.tagname}`);
    }

    // --------------------------------------------------
    // STEP 2: Calculate last 3 hours
    // --------------------------------------------------

    const endTime = new Date();

    const startTime = new Date(
      endTime.getTime() - 3 * 60 * 60 * 1000
    );

    console.log("\nTime range:");
    console.log("Start:", startTime.toISOString());
    console.log("End  :", endTime.toISOString());

    // --------------------------------------------------
    // STEP 3: Get live data for all 3 tags
    // --------------------------------------------------

    const liveData = await liveDataCollection
      .find({
        tag_id: {
          $in: tagObjectIds,
        },
        timestamp: {
          $gte: startTime,
          $lte: endTime,
        },
      })
      .sort({
        timestamp: 1,
      })
      .toArray();

    console.log(`\nFound ${liveData.length} live data records.`);

    // --------------------------------------------------
    // STEP 4: Create tag lookup
    // --------------------------------------------------

    const tagMap = new Map();

    for (const tag of tags) {
      tagMap.set(tag._id.toString(), tag.tagname);
    }

    // --------------------------------------------------
    // STEP 5: Convert records to CSV format
    // --------------------------------------------------

    const csvRecords = liveData.map((record) => {
      const tagId = record.tag_id.toString();

      const tagname = tagMap.get(tagId) || "UNKNOWN";

      // Convert MongoDB UTC timestamp to IST
      const timestampIST = new Date(
        record.timestamp.getTime() + 5.5 * 60 * 60 * 1000
      );

      // Format IST as YYYY-MM-DD HH:mm:ss
      const formattedIST = timestampIST
        .toISOString()
        .replace("T", " ")
        .substring(0, 19);

      return {
        tagname: tagname,
        tagid: tagId,
        value: record.value,
        timestamp_ist: formattedIST,
      };
    });

    // --------------------------------------------------
    // STEP 6: Write CSV
    // --------------------------------------------------

    const fileName = `tag_live_data_${Date.now()}.csv`;

    const csvWriter = createCsvWriter({
      path: fileName,
      header: [
        {
          id: "tagname",
          title: "TAGNAME",
        },
        {
          id: "tagid",
          title: "TAGID",
        },
        {
          id: "value",
          title: "VALUE",
        },
        {
          id: "timestamp_ist",
          title: "TIMESTAMP_IST",
        },
      ],
    });

    await csvWriter.writeRecords(csvRecords);

    console.log("\n====================================");
    console.log("CSV GENERATED SUCCESSFULLY");
    console.log("====================================");
    console.log(`File: ${fileName}`);
    console.log(`Records: ${csvRecords.length}`);
    console.log("====================================\n");
  } catch (error) {
    console.error("\nERROR:");
    console.error(error);
  } finally {
    await client.close();
    console.log("MongoDB connection closed.");
  }
}

main();