
const fs = require("fs");
const path = require("path");

// In cron worker child processes, skip Errsole initialization entirely
// to avoid EADDRINUSE on port 8001 (already bound by the main process).
const isCronWorker = process.env.CRON_WORKER === "true";

// Derives the module name from the request URL.
// e.g. /api/v1/reports/module-data → reports
function getModuleFromReq(req) {
	if (!req?.originalUrl) return null;
	const parts = req.originalUrl.replace(/^\/api\/v1\//, "").split("/");
	return parts[0]?.split("?")[0] || null;
}

// Enriches meta with request context.
// Usage: logger.warn(logger.enrichMeta(req, { ...extra }, "functionName"), message)
function enrichMeta(req, meta = {}, fnName) {
	return {
		transactionId: req?.transactionId || null,
		userId: req?.userId || null,
		module: getModuleFromReq(req),
		fn: fnName || null,
		...meta
	};
}

// Builds a searchable prefix from meta fields.
// Output: [txn:abc123] [user:xyz] [reports] [getModuleData]
function buildPrefix(meta) {
	const parts = [];
	if (meta?.transactionId) parts.push(`txn:${meta.transactionId}`);
	if (meta?.userId) parts.push(`user:${meta.userId}`);
	if (meta?.module) parts.push(meta.module);
	if (meta?.fn) parts.push(meta.fn);
	return parts.length > 0 ? parts.map(p => `[${p}]`).join(" ") + " " : "";
}

let logger;

const errsole = require("errsole");
const ErrsoleSQLite = require("errsole-sqlite");
const { serverConfig } = require("../configs");

const filePath = "./tmp/logs.sqlite";

const dir = path.dirname(filePath);
if (!fs.existsSync(dir)) {
	fs.mkdirSync(dir, { recursive: true });
}

if (!fs.existsSync(filePath)) {
	fs.writeFileSync(filePath, "");
}

errsole.initialize({
	storage: new ErrsoleSQLite(filePath),
	port: serverConfig.LOGGER_PORT,
	appName: "clonos_backend",
	serverName: require("os").hostname(),
	enableDashboard: !isCronWorker
});

logger = {
	info: (meta, message, ...args) => errsole.meta(meta).info(`${buildPrefix(meta)}${message}`, ...args),
	warn: (meta, message, ...args) => errsole.meta(meta).warn(`${buildPrefix(meta)}${message}`, ...args),
	error: (meta, message, ...args) => errsole.meta(meta).error(`${buildPrefix(meta)}${message}`, ...args),
	debug: (meta, message, ...args) => errsole.meta(meta).debug(`${buildPrefix(meta)}${message}`, ...args),
	alert: (meta, message, ...args) => errsole.meta(meta).alert(`${buildPrefix(meta)}${message}`, ...args),
	logCritical: (errorType, message, meta) => {
		const prefix = buildPrefix(meta);
		const criticalErrors = ["CRITICAL", "FATAL", "SYSTEM_CRASH", "UNHANDLED_EXCEPTION"];
		if (criticalErrors.includes(errorType)) {
			errsole.meta(meta).alert(`${prefix}${errorType}: ${message}`);
		} else {
			errsole.meta(meta).error(`${prefix}${errorType}: ${message}`);
		}
	},
	enrichMeta
};

module.exports = logger;


// const fs = require("fs");
// const path = require("path");
// const errsole = require("errsole");
// const ErrsoleSQLite = require("errsole-sqlite");
// const { serverConfig } = require("../configs");

// const filePath = "./tmp/logs.sqlite";

// // Ensure the directory exists
// const dir = path.dirname(filePath);
// if (!fs.existsSync(dir)) {
// 	fs.mkdirSync(dir, { recursive: true });
// }

// // Check if the file exists, create it if it doesn't
// if (!fs.existsSync(filePath)) {
// 	fs.writeFileSync(filePath, "");
// }

// // Initialize Errsole with the SQLite storage
// errsole.initialize({
// 	storage: new ErrsoleSQLite(filePath),
// 	port: serverConfig.LOGGER_PORT
// });

// const logger = {
// 	info: (meta, message, ...args) => errsole.meta(meta).info(`[Backend] ${message}`, ...args),
// 	warn: (meta, message, ...args) => errsole.meta(meta).warn(`[Backend] ${message}`, ...args),
// 	error: (meta, message, ...args) => errsole.meta(meta).error(`[Backend] ${message}`, ...args),
// 	debug: (meta, message, ...args) => errsole.meta(meta).debug(`[Backend] ${message}`, ...args),
// 	alert: (meta, message, ...args) => errsole.meta(meta).alert(`[Backend] ${message}`, ...args),
// 	logCritical: (errorType, message, meta) => {
// 		// Log critical errors as alerts with the provided meta data
// 		const criticalErrors = ["CRITICAL", "FATAL", "SYSTEM_CRASH", "UNHANDLED_EXCEPTION"];
// 		if (criticalErrors.includes(errorType)) {
// 			errsole.meta(meta).alert(`[Backend] ${errorType}: ${message}`);
// 		} else {
// 			errsole.meta(meta).error(`[Backend] ${errorType}: ${message}`);
// 		}
// 	}
// };

// module.exports = logger;
