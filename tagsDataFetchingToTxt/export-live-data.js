const { MongoClient, ObjectId } = require("mongodb");
const fs = require("fs");

// ==============================
// CONFIGURATION
// ==============================

const MONGO_URI = "mongodb://localhost:27017";
const DB_NAME = "YOUR_DATABASE_NAME";
const COLLECTION_NAME = "liveData_test";

const OUTPUT_FILE = "liveData_export.txt";

// Start date: 24 August 2026 00:00:00 UTC
const START_DATE = new Date("2026-08-24T00:00:00.000Z");

// Sampling interval: 10 minutes
const INTERVAL_MINUTES = 10;

// ==============================
// MAIN
// ==============================

async function exportLiveData() {
    const client = new MongoClient(MONGO_URI);

    try {
        console.log("Connecting to MongoDB...");

        await client.connect();

        const db = client.db(DB_NAME);
        const collection = db.collection(COLLECTION_NAME);

        const END_DATE = new Date();

        console.log(`Collection : ${COLLECTION_NAME}`);
        console.log(`From       : ${START_DATE.toISOString()}`);
        console.log(`To         : ${END_DATE.toISOString()}`);
        console.log(`Interval   : ${INTERVAL_MINUTES} minutes`);
        console.log("");

        /*
         * MongoDB performs the sampling.
         *
         * For every tag:
         *   - group records into 10-minute buckets
         *   - take the first record in each bucket
         *
         * This means Node.js does NOT download every 10-second record.
         */

        const pipeline = [
            {
                $match: {
                    timestamp: {
                        $gte: START_DATE,
                        $lte: END_DATE
                    }
                }
            },

            // Sort so that $first gives us the earliest record
            // inside each 10-minute bucket.
            {
                $sort: {
                    tag_id: 1,
                    timestamp: 1
                }
            },

            // Create a 10-minute bucket based on timestamp.
            {
                $set: {
                    timeBucket: {
                        $dateTrunc: {
                            date: "$timestamp",
                            unit: "minute",
                            binSize: INTERVAL_MINUTES
                        }
                    }
                }
            },

            // One record per tag per 10-minute bucket.
            {
                $group: {
                    _id: {
                        tag_id: "$tag_id",
                        timeBucket: "$timeBucket"
                    },
                    timestamp: {
                        $first: "$timestamp"
                    },
                    value: {
                        $first: "$value"
                    }
                }
            },

            // Sort final result
            {
                $sort: {
                    "_id.tag_id": 1,
                    timestamp: 1
                }
            },

            // Keep only required fields
            {
                $project: {
                    _id: 0,
                    tag_id: "$_id.tag_id",
                    timestamp: 1,
                    value: 1
                }
            }
        ];

        console.log("Running MongoDB aggregation...");

        const cursor = collection.aggregate(pipeline, {
            allowDiskUse: true
        });

        const outputStream = fs.createWriteStream(OUTPUT_FILE);

        // Header
        outputStream.write(
            "TAG_ID\tVALUE\tUTC_TIMESTAMP\tIST_TIMESTAMP\n"
        );

        let recordCount = 0;

        for await (const doc of cursor) {
            const tagId = doc.tag_id
                ? doc.tag_id.toString()
                : "";

            const value = doc.value;

            const utcTimestamp = doc.timestamp.toISOString();

            // IST = UTC + 5 hours 30 minutes
            const istTimestamp = new Date(
                doc.timestamp.getTime() + (5.5 * 60 * 60 * 1000)
            )
                .toISOString()
                .replace("Z", "+05:30");

            outputStream.write(
                `${tagId}\t${value}\t${utcTimestamp}\t${istTimestamp}\n`
            );

            recordCount++;

            if (recordCount % 10000 === 0) {
                console.log(
                    `Processed ${recordCount.toLocaleString()} records...`
                );
            }
        }

        await new Promise((resolve, reject) => {
            outputStream.end(resolve);
            outputStream.on("error", reject);
        });

        console.log("");
        console.log("====================================");
        console.log("Export completed successfully");
        console.log("====================================");
        console.log(`Records exported : ${recordCount.toLocaleString()}`);
        console.log(`Output file      : ${OUTPUT_FILE}`);
        console.log("");
    } catch (error) {
        console.error("Export failed:");
        console.error(error);
    } finally {
        await client.close();
        console.log("MongoDB connection closed.");
    }
}

exportLiveData();
