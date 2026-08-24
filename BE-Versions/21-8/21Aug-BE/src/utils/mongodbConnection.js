const { mongoDbConfig } = require("../configs");
const mongoose = require("mongoose");

async function connectToMongoDB() {
	try {
		await mongoose.connect(mongoDbConfig.MONGO_DB_URL, {
			maxPoolSize: Number(process.env.MONGO_POOL_SIZE) || 20,
			minPoolSize: 5,
			socketTimeoutMS: 45000,
			serverSelectionTimeoutMS: 30000,
			heartbeatFrequencyMS: 10000,
			connectTimeoutMS: 30000,
			// Auto-reconnect settings
			retryWrites: true,
			retryReads: true,
		});
		console.log("Connected to MongoDB");
		if (process.env.RUN_ADD_INDEXES === 'true') {
			await createAllIndexes();
		}
	} catch (error) {
		console.error("Error connecting to MongoDB:", error.message);
		// Retry connection after 5 seconds
		console.log("Retrying MongoDB connection in 5 seconds...");
		setTimeout(connectToMongoDB, 5000);
	}
}

const db = mongoose.connection;

// Connection event handlers for resilience
db.on("disconnected", () => {
	console.warn("MongoDB disconnected. Mongoose will auto-reconnect.");
});

db.on("reconnected", () => {
	console.log("MongoDB reconnected successfully.");
});

db.on("error", (err) => {
	console.error("MongoDB connection error:", err.message);
});

function getMongoDBStatus() {
	switch (db.readyState) {
		case 0:
			return "Disconnected";
		case 1:
			return "Connected";
		case 2:
			return "Connecting";
		case 3:
			return "Disconnecting";
		default:
			return "Unknown";
	}
}

async function createAllIndexes() {
	const modelNames = mongoose.modelNames();
	for (const name of modelNames) {
		try {
			const model = mongoose.model(name);
			await model.createIndexes();
			console.log(`Indexes created for model: ${name}`);
		} catch (err) {
			console.error(`Error creating indexes for model ${name}:`, err.message);
		}
	}
}

module.exports = {
	connectToMongoDB,
	getMongoDBStatus,
	createAllIndexes,
};


// const { mongoDbConfig } = require("../configs");
// const mongoose = require("mongoose");
// // const { updateBusinessUnits } = require("./dbScripts/addBusinessUnit");

// async function connectToMongoDB() {
// 	try {
// 		await mongoose.connect(mongoDbConfig.MONGO_DB_URL, {
// 		});
// 		console.log("Connected to MongoDB");
//     if (process.env.RUN_ADD_INDEXES === 'true') {
//       await createAllIndexes();
//     }
    
// 	} catch (error) {
// 		console.error("Error connecting to MongoDB:", error.message);
// 	}
// }
// const db = mongoose.connection;
// // Function to get MongoDB connection status
// function getMongoDBStatus() {
//   switch (db.readyState) {
//     case 0:
//       return "Disconnected";
//     case 1:
//       return "Connected";
//     case 2:
//       return "Connecting";
//     case 3:
//       return "Disconnecting";
//     default:
//       return "Unknown";
//   }
// }

// async function createAllIndexes() {
//   const modelNames = mongoose.modelNames();

//   for (const name of modelNames) {
//     try {
//       const model = mongoose.model(name);
//       await model.createIndexes();
//       console.log(`Indexes created for model: ${name}`);
//     } catch (err) {
//       console.error(`Error creating indexes for model ${name}:`, err.message);
//     }
//   }
// }


// module.exports = {
// 	connectToMongoDB,
// 	getMongoDBStatus,
//   createAllIndexes,
// };
