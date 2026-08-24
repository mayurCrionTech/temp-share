// used for production
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const username = process.env.MONGO_DB_USERNAME || "";
const password = process.env.MONGO_DB_PASSWORD || "";

const isAuthRequired = username && password;

const credentials = isAuthRequired
  ? `${encodeURIComponent(username)}:${encodeURIComponent(password)}@`
  : "";

const authSource = process.env.MONGO_AUTH_SOURCE || "admin";

module.exports = {
  MONGO_DB_HOST: process.env.MONGO_DB_HOST || "127.0.0.1",
  MONGO_DB_NAME: process.env.MONGO_DB_NAME || "clonos",
  MONGO_DB_USERNAME: username,
  MONGO_DB_PASSWORD: password,
  MONGO_DB_PORT: process.env.MONGO_DB_PORT || "27017",
  MONGO_DB_PROTOCOL: process.env.MONGO_DB_PROTOCOL || "mongodb",
  MONGO_AUTH_SOURCE: authSource,

  MONGO_DB_URL:
    process.env.MONGO_DB_PROTOCOL === "mongodb+srv"
      ? `${process.env.MONGO_DB_PROTOCOL}://${credentials}${process.env.MONGO_DB_HOST}/${process.env.MONGO_DB_NAME}?authSource=${authSource}`
      : `${process.env.MONGO_DB_PROTOCOL}://${credentials}${process.env.MONGO_DB_HOST}:${process.env.MONGO_DB_PORT}/${process.env.MONGO_DB_NAME}?authSource=${authSource}`,
};

// if (process.env.NODE_ENV !== "production") {
// 	require("dotenv").config();
//   }
  
// 	const isAuthRequired = process.env.MONGO_DB_USERNAME && process.env.MONGO_DB_PASSWORD;
// 	const credentials = isAuthRequired
// 	  ? `${process.env.MONGO_DB_USERNAME}:${process.env.MONGO_DB_PASSWORD}@`
// 	  : "";
	
// 	module.exports = {
// 	  MONGO_DB_HOST: process.env.MONGO_DB_HOST || "127.0.0.1",
// 	  MONGO_DB_NAME: process.env.MONGO_DB_NAME || "clonos",
// 	  MONGO_DB_USERNAME: process.env.MONGO_DB_USERNAME || "",
// 	  MONGO_DB_PASSWORD: process.env.MONGO_DB_PASSWORD || "",
// 	  MONGO_DB_PORT: process.env.MONGO_DB_PORT || "27017",
// 	  MONGO_DB_PROTOCOL: process.env.MONGO_DB_PROTOCOL || "mongodb",
	
// 	  MONGO_DB_URL:
// 		process.env.MONGO_DB_PROTOCOL === "mongodb+srv"
// 		  ? `${process.env.MONGO_DB_PROTOCOL}://${credentials}${process.env.MONGO_DB_HOST}/${process.env.MONGO_DB_NAME}`
// 		  : `${process.env.MONGO_DB_PROTOCOL}://${credentials}${process.env.MONGO_DB_HOST}:${process.env.MONGO_DB_PORT}/${process.env.MONGO_DB_NAME}`,
// 	};
	