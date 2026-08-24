/**
 * This file will be the start point of the application.
 */
/*
date            qid / cr#         comments
07-apr-2026     CR0016           Added Helmet.js to avoid this vulenerablities
*/
const { serverConfig } = require("./src/configs");
const express = require("express");
const app = express();
const cors = require("cors");
// const helmet = require("helmet");
const fs = require("fs");
// const swaggerUi = require("swagger-ui-express"); // CR0021
const { router } = require("./src/routes");
const { connectToMongoDB, getMongoDBStatus } = require("./src/utils/mongodbConnection");
// const { swaggerSpec } = require("./src/utils/swagger"); // CR0021
const { jobHourly } = require("./src/utils/cron");
const { socketConnection, watchForecastDefects } = require("./src/utils/socket/socketHandler");
const logger = require("./src/utils/logger");
const { fixMissingIsMandatoryInLogEntries,
	fixMissingIsMandatoryInLogTemplates,
 } = require("./src/utils/logentriesScript");
const { adminSeeder,runOrganizationMigration,fixBrokenUserPermissions , runPermissionMigration,updateBusinessUnits, updateLogEntriesIsFormula } = require("./src/utils/dbScripts/index");
const { updateAllAssetsStatusHistory } = require("./src/managers/internalManagers/assetManagement/asset_manager");
const { rateLimiter } = require("./src/middlewares/rateLimiter");
const { requestContext } = require("./src/middlewares/requestContext");

const { mountLiveDataNamespace, getLiveNamespace, } = require("./src/utils/socket/liveDataMount.js");


// Tag Live Watcher for Range
const { startTagLiveWatcher } = require(
  "./src/managers/internalManagers/tagMonitoring/tagLiveWatcher_manager"
);

const{truckLiveWatcher,liveDataHandler, setpointDeviationWatcher,maintenanceExpiredWatcher}=require("./src/utils/socket/liveDataHandler")

// Auto-detect HTTPS: if SSL cert paths are set in env, use HTTPS; otherwise use HTTP
const SSL_KEY = process.env.SSL_KEY_PATH;
const SSL_CERT = process.env.SSL_CERT_PATH;
const SSL_CA = process.env.SSL_CA_PATH;

let server;
if (SSL_KEY && SSL_CERT && fs.existsSync(SSL_KEY) && fs.existsSync(SSL_CERT)) {
	const https = require("https");
	const credentials = {
		key: fs.readFileSync(SSL_KEY, "utf8"),
		cert: fs.readFileSync(SSL_CERT, "utf8"),
	};
	if (SSL_CA && fs.existsSync(SSL_CA)) {
		credentials.ca = fs.readFileSync(SSL_CA, "utf8");
	}
	server = https.createServer(credentials, app);
	console.log("SSL certificates loaded — running in HTTPS mode");
} else {
	const http = require("http");
	server = http.createServer(app);
	console.log("No SSL certificates found — running in HTTP mode");
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
socketConnection(server);
mountLiveDataNamespace();
// app.use(helmet());
// app.use(cors({
	//   origin: (origin, callback) => {
		//     callback(null, origin); // allow all origins dynamically
		//   },
		//   credentials: true
		// }));
		
		app.use(cors());
		// app.use((req, res, next) => {
			//     const allowedOrigins = [
				//         "https://dicvbe.clonos.in",
				//         "https://dicv.clonos.in",
				// 		"http://localhost:3000"
				//     ];
				
				//     const origin = req.headers.origin;
				
				//     if (allowedOrigins.includes(origin)) {
					//         res.setHeader("Access-Control-Allow-Origin", origin);
					//     }
					
					//     res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
					//     res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
					
					//     // Handle preflight
					//     if (req.method === "OPTIONS") {
						//         return res.sendStatus(200);
						//     }
						
						//     next();
						// });
						
						
						// CR0021 - API Documentation (swagger) is disabled for time being
// app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/api/v1", requestContext, rateLimiter, router);

app.use("/", (req, res) => {
	res.status(200).json({
		message: "Server is up and running",
		result: {
			version: serverConfig.APP_VERSION,
			description: serverConfig.APP_DESCRIPTION,
			databaseStatus: getMongoDBStatus()
		}
	});
});

server.listen(serverConfig.PORT, async() => {
	console.log(`Application started on port: ${serverConfig.PORT}`);
	await connectToMongoDB();
	watchForecastDefects();
	await adminSeeder()
	await updateAllAssetsStatusHistory()
});

if (process.env.RUN_BUSINESS_UNIT_UPDATE === 'true') {
       updateBusinessUnits();
    }

if (process.env.RUN_ORGANIZATION_MIGRATIONS === 'true') {
	runOrganizationMigration()
	runPermissionMigration()
	fixBrokenUserPermissions('clean')
}

if (process.env.RUN_UPDATE_TEMPLATE == "true") {
	fixMissingIsMandatoryInLogEntries()
	fixMissingIsMandatoryInLogTemplates()
	updateLogEntriesIsFormula()
}

const handleCriticalError = async (logFunction, type, message, meta) => {
	try {
		await logFunction(type, message, meta);
	} catch (err) {
		console.error('Failed to log critical error:', err);
	}
	setTimeout(() => {
		process.exit(1);
	}, 1000);
};

process.on('unhandledRejection', (reason, promise) => {
	logger.logCritical(
		'UNHANDLED_EXCEPTION',
		`Unhandled Rejection: ${reason.message || reason}`,
		{
			reason,
			promise: JSON.stringify(promise)
		}
	);
});

process.on('uncaughtException', (err) => {
	handleCriticalError(
		logger.logCritical,
		'SYSTEM_CRASH',
		`Uncaught Exception: ${err.message}`,
		{
			error: err
		}
	);
});


startTagLiveWatcher();



// liveDataHandler (io.of("/live-data"));
// // require("./src/utils/socket/liveDataHandler")("/live-data");
// truckLiveWatcher();

// const liveNamespace = io.of("/live-data");

// liveDataHandler(liveNamespace);
truckLiveWatcher(getLiveNamespace());   // 🔥 pass io
setpointDeviationWatcher(getLiveNamespace());
maintenanceExpiredWatcher(getLiveNamespace()) //CR0028








// const { serverConfig } = require("./src/configs");
// const express = require("express");
// const app = express();
// const cors = require("cors");
// const helmet = require("helmet");
// // const swaggerUi = require("swagger-ui-express"); // CR0021
// let http = require("http");
// http = http.Server(app);
// const { router } = require("./src/routes");
// const { connectToMongoDB, getMongoDBStatus } = require("./src/utils/mongodbConnection");
// // const { swaggerSpec } = require("./src/utils/swagger"); // CR0021
// const { jobHourly } = require("./src/utils/cron");
// const { socketConnection } = require("./src/utils/socket/socketHandler");
// const logger = require("./src/utils/logger");
// const { fixMissingIsMandatoryInLogEntries,
// 	fixMissingIsMandatoryInLogTemplates,
//  } = require("./src/utils/logentriesScript");

// // const { runOrganizationMigration } = require("./src/utils/dbScripts/addOrganizations");
// // const { runPermissionMigration } = require("./src/utils/dbScripts/updatePermissionToRootLevel");
// // const { fixBrokenUserPermissions } = require("./src/utils/dbScripts/userPermissionDiagnosisScript");
// const { adminSeeder,runOrganizationMigration,fixBrokenUserPermissions , runPermissionMigration,updateBusinessUnits, updateLogEntriesIsFormula } = require("./src/utils/dbScripts/index");
// const { updateAllAssetsStatusHistory } = require("./src/managers/internalManagers/assetManagement/asset_manager");

// const { mountLiveDataNamespace, getLiveNamespace, } = require("./src/utils/socket/liveDataMount.js");


// // Tag Live Watcher for Range
// const { startTagLiveWatcher } = require(
//   "./src/managers/internalManagers/tagMonitoring/tagLiveWatcher_manager"
// );

// const{truckLiveWatcher,liveDataHandler, setpointDeviationWatcher}=require("./src/utils/socket/liveDataHandler")

// // const httpModule = require("http"); 
// // const{Server}=require('socket.io')
// // const server=httpModule.createServer(app)
// // const io = new Server(server, {
// //   cors: { origin: "*" }
// // });

// // const{getIOInstance}=require("./src/utils/socket/ioInstance")

// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// socketConnection(http);
// mountLiveDataNamespace();
// app.use(helmet());
// app.use(cors());
// // CR0021 - API Documentation (swagger) is disabled for time being
// // app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
// app.use("/api/v1", router);

// app.use("/", (req, res) => {
// 	res.status(200).json({
// 		message: "Server is up and running",
// 		result: {
// 			version: serverConfig.APP_VERSION,
// 			description: serverConfig.APP_DESCRIPTION,
// 			databaseStatus: getMongoDBStatus()
// 		}
// 	});
// });


// http.listen(serverConfig.PORT, async() => {
// 	console.log(`Application started on the port num : ${serverConfig.PORT}`);
// 	await connectToMongoDB();

// 	await adminSeeder()
// 	await updateAllAssetsStatusHistory()
// });

// if (process.env.RUN_BUSINESS_UNIT_UPDATE === 'true') {
//        updateBusinessUnits();
//     }

// if (process.env.RUN_ORGANIZATION_MIGRATIONS === 'true') {
// 	runOrganizationMigration()
// 	runPermissionMigration()
// 	fixBrokenUserPermissions('clean')
// }

// if (process.env.RUN_UPDATE_TEMPLATE == "true") {
// 	fixMissingIsMandatoryInLogEntries()
// 	fixMissingIsMandatoryInLogTemplates()
// 	updateLogEntriesIsFormula()
// }

// // Helper function to log critical errors and ensure logging is completed before exit
// const handleCriticalError = async (logFunction, type, message, meta) => {
// 	try {
// 		await logFunction(type, message, meta);
// 	} catch (err) {
// 		console.error('Failed to log critical error:', err);
// 	}
// 	// Give logger time to process before exiting
// 	setTimeout(() => {
// 		process.exit(1); // Exit after a short delay
// 	}, 1000);
// };

// // Global error handlers
// process.on('unhandledRejection', (reason, promise) => {
// 	logger.logCritical(
// 		'UNHANDLED_EXCEPTION',
// 		`Unhandled Rejection: ${reason.message || reason}`,
// 		{
// 			reason,  // Log the actual rejection reason (Error object or a custom reason)
// 			promise: JSON.stringify(promise)   // Log the promise details into meta
// 		}
// 	);

// 	// Optionally terminate the process if desired
// 	// process.exit(1);
// });

// process.on('uncaughtException', (err) => {
// 	handleCriticalError(
// 		logger.logCritical, // The logger function
// 		'SYSTEM_CRASH',
// 		`Uncaught Exception: ${err.message}`,
// 		{
// 			error: err  // Include the error object for detailed logging
// 		}
// 	);
// });


// startTagLiveWatcher();



// // liveDataHandler (io.of("/live-data"));
// // // require("./src/utils/socket/liveDataHandler")("/live-data");
// // truckLiveWatcher();

// // const liveNamespace = io.of("/live-data");

// // liveDataHandler(liveNamespace);
// truckLiveWatcher(getLiveNamespace());   // 🔥 pass io
// setpointDeviationWatcher(getLiveNamespace());