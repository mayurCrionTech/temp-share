/*
date            cr/qid      comments
07-april-2026     CR0009      [updated] - added rate limiting
*/

const express = require("express");
const fileController = require("../../controllers/fileSystem/fileSystem_controller");
const { fileMiddleware, authJwtMiddleware } = require("../../middlewares");
const { uploadLimiter } = require("../../middlewares/rateLimiter/rateLimiter"); // CR0009

const fileRouter = express.Router();



fileRouter.post(
	"/",
	[
		authJwtMiddleware.verifyToken,
		uploadLimiter,
		fileMiddleware.uploadSingle,
		fileMiddleware.validateFileExtensionAndSize,
		fileMiddleware.validateFileUpload
	],
	fileController.uploadFile
);


// CR0009
fileRouter.post(
	"/bulkUpload",
	[
		authJwtMiddleware.verifyToken,
		uploadLimiter,
		fileMiddleware.uploadMultiple,
		fileMiddleware.validateMultipleFileExtensionAndSize,
		fileMiddleware.validateFileUpload,
	],
	fileController.uploadFiles
);


fileRouter.get(
	"/",
	[authJwtMiddleware.verifyToken, fileMiddleware.validateFetchFilesRequest],
	fileController.getFiles
);


fileRouter.get(
	"/:id",
	[authJwtMiddleware.verifyToken, fileMiddleware.validateFile],
	fileController.getFile
);


// CR0009
fileRouter.put(
	"/:id/updatePath",
	[authJwtMiddleware.verifyToken, uploadLimiter, fileMiddleware.validateFile, fileMiddleware.validateUpdatePath], 
	fileController.updateFilePath
);



fileRouter.get(
	"/:id/actions/:action",
	[fileMiddleware.validateTokenAndReturnFileObj],
	fileController.fileAction
);


// CR0009
fileRouter.put(
	"/:id/moveToRecycleBin",
	[authJwtMiddleware.verifyToken, uploadLimiter, fileMiddleware.validateFile],
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
