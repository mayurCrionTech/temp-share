if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

module.exports = {
	PORT: process.env.PORT,
	LOGGER_PORT: process.env.LOGGER_PORT,
	APP_VERSION: process.env.APP_VERSION,
	APP_DESCRIPTION: process.env.APP_DESCRIPTION,
};
