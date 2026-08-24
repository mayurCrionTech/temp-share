const mongoDbConfig = require("./mongoDb_config");
const serverConfig = require("./server_config");
const authConfig = require("./auth_config");
const securityConfig = require("./security_config");
const smtpConfig = require("./smtp_config");
const fileStorageConfig = require("./fileStorage_config");


module.exports = {
	authConfig,
	mongoDbConfig,
	serverConfig,
	securityConfig,
	smtpConfig,
	fileStorageConfig
};
