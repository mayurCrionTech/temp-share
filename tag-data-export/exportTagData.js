require("dotenv").config();

const { MongoClient } = require("mongodb");
const { DateTime } = require("luxon");
const fs = require("fs");
const path = require("path");

// ============================================================
// CONFIGURATION
// ============================================================

const MONGO_URI = process.env.MONGO_URI;
const DB_NAME = process.env.MONGO_DB_NAME || "clonos";

// 0 = export ALL records
// 40 = approximately one record every 40 seconds
const FREQUENCY_SECONDS = Number(process.env.FREQUENCY_SECONDS || 0);

// tags to export
const TAG_NAMES = [
  "RB_File[173].Serial_No_VIN_1",
  "RB_File[173].Serial_No_VIN_2",
  "RB_File[173].Cab_Body_Code",
  "RB_File[173].Color_Code1",
  "RB_File[173].Dip_Paint_skid",
];

const TAG_COLLECTION = "tag_lives";
const LIVE_DATA_COLLECTION = "liveData_test";

const OUTPUT_DIR = path.join(__dirname, "exports");

// ============================================================
// VALIDATION
// ============================================================

if (!MONGO_URI) {
  console.error("ERROR: MONGO_URI is missing in .env");
  process.exit(1);
}

if (FREQUENCY_SECONDS < 0 || Number.isNaN(FREQUENCY_SECONDS)) {
  console.error("ERROR: FREQUENCY_SECONDS must be 0 or a positive number");
  process.exit(1);
}

// ============================================================
// CSV HELPERS
// ============================================================

function escapeCsv(value) {
  if (value === null || value === undefined) {
    return "";
  }

  let str = String(value);

  // Escape quotes
  str = str.replace(/"/g, '""');

  // Wrap if required
  if (
    str.includes(",") ||
    str.includes('"') ||
    str.includes("\n") ||
    str.includes("\r")
  ) {
    return `"${str}"`;
  }

  return str;
}

function createCsvContent(records, tagname) {
  const header = ["tagname", "value", "timestamp", "ist_timestamp"];

  const rows = [header.join(",")];

  for (const record of records) {
    const utcTimestamp = record.timestamp;

    const istTimestamp = DateTime.fromJSDate(utcTimestamp, {
      zone: "utc",
    })
      .setZone("Asia/Kolkata")
      .toFormat("yyyy-MM-dd HH:mm:ss.SSS");

    rows.push(
      [
        escapeCsv(tagname),
        escapeCsv(record.value),
        escapeCsv(utcTimestamp.toISOString()),
        escapeCsv(istTimestamp),
      ].join(","),
    );
  }

  return rows.join("\n");
}

// ============================================================
// FREQUENCY FILTER
// ============================================================

/**
 * FREQUENCY_SECONDS = 0
 * ---------------------
 * Return every record.
 *
 * FREQUENCY_SECONDS > 0
 * ---------------------
 * Return approximately one record per configured interval.
 *
 * Example:
 *
 * FREQUENCY_SECONDS = 40
 *
 * 10:00:01 -> selected
 * 10:00:10 -> skipped
 * 10:00:25 -> skipped
 * 10:00:42 -> selected
 * 10:01:03 -> skipped
 * 10:01:25 -> selected
 */
function applyFrequency(records, frequencySeconds) {
  if (frequencySeconds === 0) {
    return records;
  }

  if (records.length === 0) {
    return [];
  }

  const intervalMs = frequencySeconds * 1000;

  const selected = [];

  let lastSelectedTime = null;

  for (const record of records) {
    const currentTime = record.timestamp.getTime();

    if (
      lastSelectedTime === null ||
      currentTime - lastSelectedTime >= intervalMs
    ) {
      selected.push(record);
      lastSelectedTime = currentTime;
    }
  }

  return selected;
}

// ============================================================
// MAIN
// ============================================================

async function main() {
  const client = new MongoClient(MONGO_URI);

  try {
    console.log("==============================================");
    console.log("MongoDB Tag Data Export");
    console.log("==============================================");

    // --------------------------------------------------------
    // Calculate today's 6 AM -> 6 PM IST
    // --------------------------------------------------------

    const nowIST = DateTime.now().setZone("Asia/Kolkata");

    const startIST = nowIST.startOf("day").set({
      hour: 6,
      minute: 0,
      second: 0,
      millisecond: 0,
    });

    const endIST = nowIST.startOf("day").set({
      hour: 18,
      minute: 0,
      second: 0,
      millisecond: 0,
    });

    // Convert IST boundaries to UTC for MongoDB
    const startUTC = startIST.toUTC().toJSDate();
    const endUTC = endIST.toUTC().toJSDate();

    console.log("\nCurrent IST:");
    console.log(nowIST.toFormat("yyyy-MM-dd HH:mm:ss"));

    console.log("\nTime range:");

    console.log(
      "IST:",
      startIST.toFormat("yyyy-MM-dd HH:mm:ss"),
      "->",
      endIST.toFormat("yyyy-MM-dd HH:mm:ss"),
    );

    console.log("UTC:", startUTC.toISOString(), "->", endUTC.toISOString());

    console.log("\nFrequency:", FREQUENCY_SECONDS, "seconds");

    if (FREQUENCY_SECONDS === 0) {
      console.log("Mode: ALL RECORDS");
    } else {
      console.log(
        `Mode: approximately 1 record every ${FREQUENCY_SECONDS} seconds`,
      );
    }

    // --------------------------------------------------------
    // Create output directory
    // --------------------------------------------------------

    if (!fs.existsSync(OUTPUT_DIR)) {
      fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    // --------------------------------------------------------
    // Connect MongoDB
    // --------------------------------------------------------

    console.log("\nConnecting to MongoDB...");

    await client.connect();

    const db = client.db(DB_NAME);

    console.log("MongoDB connected.");

    const tagCollection = db.collection(TAG_COLLECTION);
    const liveDataCollection = db.collection(LIVE_DATA_COLLECTION);

    // --------------------------------------------------------
    // Find all tags
    // --------------------------------------------------------

    console.log("\nFinding tags...\n");

    const tagDocuments = await tagCollection
      .find({
        tagname: {
          $in: TAG_NAMES,
        },
      })
      .toArray();

    // --------------------------------------------------------
    // Check missing tags
    // --------------------------------------------------------

    const foundTagNames = new Set(tagDocuments.map((tag) => tag.tagname));

    const missingTags = TAG_NAMES.filter(
      (tagname) => !foundTagNames.has(tagname),
    );

    if (missingTags.length > 0) {
      console.log("WARNING: These tags were not found:");

      for (const tag of missingTags) {
        console.log("  -", tag);
      }

      console.log("");
    }

    console.log(`Found ${tagDocuments.length} of ${TAG_NAMES.length} tags.`);

    // --------------------------------------------------------
    // Process each tag
    // --------------------------------------------------------

    for (const tag of tagDocuments) {
      console.log("\n----------------------------------------------");
      console.log("Tag:", tag.tagname);
      console.log("Tag ID:", tag._id.toString());
      console.log("----------------------------------------------");

      // ----------------------------------------------------
      // Fetch data
      // ----------------------------------------------------

      console.log("Fetching live data...");

      const records = await liveDataCollection
        .find({
          tag_id: tag._id,
          timestamp: {
            $gte: startUTC,
            $lt: endUTC,
          },
        })
        .sort({
          timestamp: 1,
        })
        .toArray();

      console.log("Records found:", records.length);

      // ----------------------------------------------------
      // Apply frequency
      // ----------------------------------------------------

      const filteredRecords = applyFrequency(records, FREQUENCY_SECONDS);

      console.log("Records after frequency filter:", filteredRecords.length);

      // ----------------------------------------------------
      // Generate filename
      // ----------------------------------------------------

      const safeTagName = tag.tagname
        .replace(/\\/g, "_")
        .replace(/\//g, "_")
        .replace(/\[/g, "_")
        .replace(/\]/g, "_")
        .replace(/\./g, "_")
        .replace(/\s+/g, "_");

      const dateString = startIST.toFormat("yyyy-MM-dd");

      const filename = `${safeTagName}_${dateString}.csv`;

      const outputFile = path.join(OUTPUT_DIR, filename);

      // ----------------------------------------------------
      // Create CSV
      // ----------------------------------------------------

      const csvContent = createCsvContent(filteredRecords, tag.tagname);

      fs.writeFileSync(outputFile, csvContent, "utf8");

      console.log("CSV created:");
      console.log(outputFile);
    }

    // --------------------------------------------------------
    // Summary
    // --------------------------------------------------------

    console.log("\n==============================================");
    console.log("EXPORT COMPLETED");
    console.log("==============================================");

    console.log("Output directory:");
    console.log(OUTPUT_DIR);

    console.log("\nFiles:");

    const files = fs.readdirSync(OUTPUT_DIR);

    if (files.length === 0) {
      console.log("No files generated.");
    } else {
      for (const file of files) {
        console.log("  -", file);
      }
    }

    console.log("\n==============================================");
  } catch (error) {
    console.error("\nERROR:");
    console.error(error);
    process.exitCode = 1;
  } finally {
    await client.close();
    console.log("\nMongoDB connection closed.");
  }
}

// ============================================================
// RUN
// ============================================================

main();
