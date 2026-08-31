/**
 * One-time script: creates indexes on the timestamp fields used by the
 * rolling-window cleanup job (cleanupRollingWindows).
 *
 * Safe to run multiple times — createIndex is idempotent; if an equivalent
 * index already exists, MongoDB just no-ops instead of erroring or duplicating.
 *
 * Usage:
 *   1. Paste your MongoDB connection URI below (MONGO_URI).
 *   2. node ensureCleanupIndexes.js
 */

const { MongoClient } = require("mongodb");

// ---- PASTE YOUR MONGODB CONNECTION URI HERE ----
const MONGO_URI = "mongodb://localhost:27017/your-db-name";
// -------------------------------------------------

// Keep this in sync with src/configs/dataCleanupConfig.js manually,
// since this script is standalone and doesn't import your app's config.
//
// NOTE: "aiforecasts" is intentionally NOT listed here. Its cleanup filters
// on _id (ObjectId embeds creation time) instead of a date field, because
// its `timestamp` field holds a *future predicted* time, not insertion time.
// _id already has a default unique index in every MongoDB collection, so no
// extra index is needed for it.
const collectionsToIndex = [
  { collection: "setpoint_deviation_events", field: "createdAt" },
  { collection: "forecastDefects", field: "lastUpdatedAt" }, // confirm exact name/case
];

async function ensureCleanupIndexes() {
  const client = new MongoClient(MONGO_URI);

  try {
    await client.connect();
    console.log("Connected to MongoDB");

    const db = client.db(); // uses the DB name from the URI

    // Sanity check: list actual collection names so you can catch
    // case/pluralization mismatches before indexing the wrong (or a new, empty) collection
    const existingNames = (await db.listCollections().toArray()).map((c) => c.name);
    console.log("Collections found in DB:", existingNames);

    for (const { collection, field } of collectionsToIndex) {
      if (!existingNames.includes(collection)) {
        console.warn(
          `⚠️  Collection "${collection}" not found in DB — check name/case. Skipping index creation for it.`
        );
        continue;
      }

      try {
        const indexName = await db.collection(collection).createIndex({ [field]: 1 });
        console.log(`✅ Index ensured: ${collection}.${field} → "${indexName}"`);
      } catch (err) {
        console.error(`❌ Failed to create index on ${collection}.${field}:`, err.message);
      }
    }
  } catch (err) {
    console.error("Connection or script error:", err.message);
  } finally {
    await client.close();
    console.log("Connection closed");
  }
}

ensureCleanupIndexes();