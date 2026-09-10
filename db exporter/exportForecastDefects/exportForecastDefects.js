const { MongoClient } = require("mongodb");
const fs = require("fs");

const MONGO_URI = "YOUR_SOURCE_MONGODB_URI";
const DB_NAME = "YOUR_SOURCE_DB_NAME";
const COLLECTION_NAME = "forecastDefects";

async function exportLatest20() {
    const client = new MongoClient(MONGO_URI);

    try {
        await client.connect();

        const db = client.db(DB_NAME);
        const collection = db.collection(COLLECTION_NAME);

        // Get latest 20 documents
        // Using _id descending because ObjectId contains creation timestamp
        const documents = await collection
            .find({})
            .sort({ _id: -1 })
            .limit(20) // number of docs
            .toArray();

        // Write as MongoDB-compatible JSON
        fs.writeFileSync(
            "forecastDefects_latest20.json",
            JSON.stringify(documents, null, 2)
        );

        console.log(`Successfully exported ${documents.length} documents.`);
        console.log("File: forecastDefects_latest20.json");

    } catch (error) {
        console.error("Export failed:", error);
    } finally {
        await client.close();
    }
}

exportLatest20();