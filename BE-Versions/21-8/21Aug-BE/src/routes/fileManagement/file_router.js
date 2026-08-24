const express = require("express");
const fileController = require("../../controllers/fileManagement/file_controller");
const { fileMiddleware, authJwtMiddleware } = require("../../middlewares");

const fileRouter = express.Router();
fileRouter.post(
	"/",
	[
		authJwtMiddleware.verifyToken,
		fileMiddleware.uploadSingle,
		fileMiddleware.validateAllowedExtension,
		fileMiddleware.validateFileSize,
		fileMiddleware.validateFileUpload
	],
	fileController.uploadFile
);
fileRouter.get(
	"/:id",
	[authJwtMiddleware.verifyToken, fileMiddleware.validateFile],
	fileController.getFile
);
fileRouter.put(
	"/:id/updatePath",
	[authJwtMiddleware.verifyToken, fileMiddleware.validateFile, fileMiddleware.validateUpdatePath],
	fileController.updateFilePath
);
fileRouter.get(
	"/:id/actions/:action",
	[fileMiddleware.validateTokenAndReturnFileObj],
	fileController.fileAction
);
fileRouter.put(
	"/:id/moveToRecycleBin",
	[authJwtMiddleware.verifyToken, fileMiddleware.validateFile],
	fileController.moveToRecycleBin
);
fileRouter.delete(
	"/temporary",
	[authJwtMiddleware.verifyToken, fileMiddleware.validateFilesForDeleteTemporaryAndReturnFiles],
	fileController.deleteTemporaryFiles
);
fileRouter.delete(
	"/:id",
	[authJwtMiddleware.verifyToken, fileMiddleware.validateFile],
	fileController.deleteFile
);

module.exports = { fileRouter };
