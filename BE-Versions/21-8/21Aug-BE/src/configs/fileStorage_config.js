if (process.env.NODE_ENV !== "production") {
	require("dotenv").config();
}

module.exports = {
	AZURE_ACCOUNT_KEY: process.env.AZURE_ACCOUNT_KEY,
	AZURE_ACCOUNT_NAME: process.env.AZURE_ACCOUNT_NAME,
	AZURE_CONTAINER_NAME: process.env.AZURE_CONTAINER_NAME,
	LOCAL_UPLOADS_DIRECTORY: process.env.LOCAL_UPLOADS_DIRECTORY,
	STORAGE_PROVIDER: process.env.STORAGE_PROVIDER,
};
