const { MongoClient, ObjectId } = require("mongodb");
const fs = require("fs");

// =====================================================
// MONGODB CONFIGURATION
// =====================================================

const MONGO_URI =
    "mongodb://appadmindtd:4BhJJq4TH%2F%2AYinZk%21EkQ@sascpche0159.che.dc.tbintra.net:12001/paintddt?authSource=admin";

const DB_NAME = "paintddt";
const COLLECTION_NAME = "liveData_test";

// =====================================================
// EXPORT CONFIGURATION
// =====================================================

// Tag ID to export
const TAG_ID = new ObjectId("699426acbfb07d6db09a052b");

//699426acbfb07d6db09a052b
//699426acbfb07d6db09a052e
//699426acbfb07d6db09a0531

// Start: 24 August 2026 00:00:00 UTC
const START_DATE = new Date("2026-08-24T00:00:00.000Z");

// End: Current date/time when script runs
const END_DATE = new Date();

// Take one record every 10 minutes
const INTERVAL_MINUTES = 10;

// Output file
const OUTPUT_FILE = "liveData_export.txt";


// =====================================================
// MAIN EXPORT FUNCTION
// =====================================================

async function exportLiveData() {

    const client = new MongoClient(MONGO_URI);

    try {

        console.log("");
        console.log("========================================");
        console.log("       LIVE DATA EXPORT STARTED");
        console.log("========================================");

        console.log("Connecting to MongoDB...");

        await client.connect();

        console.log("MongoDB connected successfully.");
        console.log("");

        const db = client.db(DB_NAME);
        const collection = db.collection(COLLECTION_NAME);

        console.log(`Database   : ${DB_NAME}`);
        console.log(`Collection : ${COLLECTION_NAME}`);
        console.log(`Tag ID     : ${TAG_ID.toString()}`);
        console.log(`From UTC   : ${START_DATE.toISOString()}`);
        console.log(`To UTC     : ${END_DATE.toISOString()}`);
        console.log(`Interval   : ${INTERVAL_MINUTES} minutes`);
        console.log("");


        // =================================================
        // MONGODB AGGREGATION
        // =================================================

        const pipeline = [

            // ---------------------------------------------
            // 1. Filter required TAG + date range
            // ---------------------------------------------

            {
                $match: {

                    tag_id: TAG_ID,

                    timestamp: {
                        $gte: START_DATE,
                        $lte: END_DATE
                    }

                }
            },


            // ---------------------------------------------
            // 2. Sort by timestamp
            // ---------------------------------------------

            {
                $sort: {
                    timestamp: 1
                }
            },


            // ---------------------------------------------
            // 3. Create 10-minute UTC buckets
            // ---------------------------------------------

            {
                $set: {

                    timeBucket: {

                        $dateTrunc: {
                            date: "$timestamp",
                            unit: "minute",
                            binSize: INTERVAL_MINUTES,
                            timezone: "UTC"
                        }

                    }

                }
            },


            // ---------------------------------------------
            // 4. Take first actual record
            //    from every 10-minute bucket
            // ---------------------------------------------

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


            // ---------------------------------------------
            // 5. Sort final records
            // ---------------------------------------------

            {
                $sort: {
                    timestamp: 1
                }
            },


            // ---------------------------------------------
            // 6. Return required fields only
            // ---------------------------------------------

            {
                $project: {

                    _id: 0,

                    tag_id: 1,

                    timestamp: 1,

                    value: 1

                }
            }

        ];


        // =================================================
        // RUN QUERY
        // =================================================

        console.log("Fetching data...");
        console.log("");

        const cursor = collection.aggregate(
            pipeline,
            {
                allowDiskUse: true
            }
        );


        // =================================================
        // CREATE OUTPUT FILE
        // =================================================

        const outputStream = fs.createWriteStream(
            OUTPUT_FILE,
            {
                encoding: "utf8"
            }
        );


        // Header
        outputStream.write(
            "TAG_ID\tVALUE\tUTC_TIMESTAMP\tIST_TIMESTAMP\n"
        );


        let recordCount = 0;


        // =================================================
        // PROCESS RECORDS
        // =================================================

        for await (const doc of cursor) {

            const tagId = doc.tag_id
                ? doc.tag_id.toString()
                : "";

            const value = doc.value;


            // ---------------------------------------------
            // Original MongoDB UTC timestamp
            // ---------------------------------------------

            const utcTimestamp =
                doc.timestamp.toISOString();


            // ---------------------------------------------
            // Convert UTC -> IST
            // IST = UTC + 05:30
            // ---------------------------------------------

            const istDate = new Date(
                doc.timestamp.getTime()
                + (5.5 * 60 * 60 * 1000)
            );


            const istTimestamp =
                istDate
                    .toISOString()
                    .replace("Z", "+05:30");


            // ---------------------------------------------
            // Write to TXT
            // ---------------------------------------------

            outputStream.write(
                `${tagId}\t${value}\t${utcTimestamp}\t${istTimestamp}\n`
            );


            recordCount++;


            // Progress every 10,000 records
            if (recordCount % 10000 === 0) {

                console.log(
                    `Exported ${recordCount.toLocaleString()} records...`
                );

            }

        }


        // =================================================
        // CLOSE OUTPUT FILE
        // =================================================

        await new Promise((resolve, reject) => {

            outputStream.on("error", reject);

            outputStream.end(resolve);

        });


        // =================================================
        // SUCCESS
        // =================================================

        console.log("");
        console.log("========================================");
        console.log("     EXPORT COMPLETED SUCCESSFULLY");
        console.log("========================================");

        console.log(
            `Tag ID           : ${TAG_ID.toString()}`
        );

        console.log(
            `Records exported : ${recordCount.toLocaleString()}`
        );

        console.log(
            `Output file      : ${OUTPUT_FILE}`
        );

        console.log("========================================");
        console.log("");


    } catch (error) {

        console.log("");
        console.log("========================================");
        console.log("            EXPORT FAILED");
        console.log("========================================");

        console.error(error);

        console.log("");


    } finally {

        await client.close();

        console.log("MongoDB connection closed.");

    }

}


// =====================================================
// START SCRIPT
// =====================================================

exportLiveData();