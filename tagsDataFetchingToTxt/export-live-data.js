const { MongoClient, ObjectId } = require("mongodb");
const fs = require("fs");

// =====================================================
// CONFIGURATION
// =====================================================

const MONGO_URI = "mongodb://localhost:27017";
const DB_NAME = "YOUR_DATABASE_NAME";
const COLLECTION_NAME = "liveData_test";

const OUTPUT_FILE = "liveData_export.txt";

// Tag ID to export
const TAG_ID = new ObjectId("699426acbfb07d6db09a052b");
//const TAG_ID = new ObjectId("699426acbfb07d6db09a052e");
//const TAG_ID = new ObjectId("699426acbfb07d6db09a0531");




// Start date: 24 August 2026 00:00:00 UTC
const START_DATE = new Date("2026-08-24T00:00:00.000Z");

// End date: Current date/time when script runs
const END_DATE = new Date();

// Fetch one record every 10 minutes
const INTERVAL_MINUTES = 10;


// =====================================================
// EXPORT FUNCTION
// =====================================================

async function exportLiveData() {

    const client = new MongoClient(MONGO_URI);

    try {

        console.log("========================================");
        console.log("Connecting to MongoDB...");
        console.log("========================================");

        await client.connect();

        const db = client.db(DB_NAME);
        const collection = db.collection(COLLECTION_NAME);

        console.log(`Database   : ${DB_NAME}`);
        console.log(`Collection : ${COLLECTION_NAME}`);
        console.log(`Tag ID     : ${TAG_ID}`);
        console.log(`From UTC   : ${START_DATE.toISOString()}`);
        console.log(`To UTC     : ${END_DATE.toISOString()}`);
        console.log(`Interval   : ${INTERVAL_MINUTES} minutes`);
        console.log("");

        // =====================================================
        // MONGODB AGGREGATION
        // =====================================================

        const pipeline = [

            // -------------------------------------------------
            // 1. Filter only required tag and date range
            // -------------------------------------------------

            {
                $match: {
                    tag_id: TAG_ID,

                    timestamp: {
                        $gte: START_DATE,
                        $lte: END_DATE
                    }
                }
            },

            // -------------------------------------------------
            // 2. Sort by timestamp
            // -------------------------------------------------

            {
                $sort: {
                    timestamp: 1
                }
            },

            // -------------------------------------------------
            // 3. Create 10-minute UTC bucket
            // -------------------------------------------------

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

            // -------------------------------------------------
            // 4. Pick first actual record from every
            //    10-minute bucket
            // -------------------------------------------------

            {
                $group: {
                    _id: "$timeBucket",

                    tag_id: {
                        $first: "$tag_id"
                    },

                    timestamp: {
                        $first: "$timestamp"
                    },

                    value: {
                        $first: "$value"
                    }
                }
            },

            // -------------------------------------------------
            // 5. Sort final result
            // -------------------------------------------------

            {
                $sort: {
                    timestamp: 1
                }
            },

            // -------------------------------------------------
            // 6. Return only required fields
            // -------------------------------------------------

            {
                $project: {
                    _id: 0,
                    tag_id: 1,
                    timestamp: 1,
                    value: 1
                }
            }
        ];


        // =====================================================
        // RUN AGGREGATION
        // =====================================================

        console.log("Fetching data from MongoDB...");
        console.log("");

        const cursor = collection.aggregate(pipeline, {
            allowDiskUse: true
        });


        // =====================================================
        // CREATE OUTPUT FILE
        // =====================================================

        const outputStream = fs.createWriteStream(OUTPUT_FILE);

        // Header
        outputStream.write(
            "TAG_ID\tVALUE\tUTC_TIMESTAMP\tIST_TIMESTAMP\n"
        );


        let recordCount = 0;


        // =====================================================
        // WRITE DATA
        // =====================================================

        for await (const doc of cursor) {

            const tagId = doc.tag_id
                ? doc.tag_id.toString()
                : "";

            const value = doc.value;

            // Original MongoDB timestamp
            const utcTimestamp = doc.timestamp.toISOString();


            // -------------------------------------------------
            // Convert UTC -> IST
            // IST = UTC + 05:30
            // -------------------------------------------------

            const istDate = new Date(
                doc.timestamp.getTime() + (5.5 * 60 * 60 * 1000)
            );

            const istTimestamp = istDate
                .toISOString()
                .replace("Z", "+05:30");


            // -------------------------------------------------
            // Write to TXT
            // -------------------------------------------------

            outputStream.write(
                `${tagId}\t${value}\t${utcTimestamp}\t${istTimestamp}\n`
            );


            recordCount++;


            // Progress
            if (recordCount % 10000 === 0) {

                console.log(
                    `Exported ${recordCount.toLocaleString()} records...`
                );

            }
        }


        // =====================================================
        // CLOSE FILE
        // =====================================================

        await new Promise((resolve, reject) => {

            outputStream.end(resolve);

            outputStream.on("error", reject);

        });


        // =====================================================
        // COMPLETED
        // =====================================================

        console.log("");
        console.log("========================================");
        console.log("EXPORT COMPLETED SUCCESSFULLY");
        console.log("========================================");

        console.log(
            `Tag ID           : ${TAG_ID}`
        );

        console.log(
            `Records exported : ${recordCount.toLocaleString()}`
        );

        console.log(
            `Output file      : ${OUTPUT_FILE}`
        );

        console.log("========================================");


    } catch (error) {

        console.error("");
        console.error("========================================");
        console.error("EXPORT FAILED");
        console.error("========================================");

        console.error(error);

    } finally {

        await client.close();

        console.log("");
        console.log("MongoDB connection closed.");

    }
}


// =====================================================
// START
// =====================================================

exportLiveData();
