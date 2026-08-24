const fileManager = require("../../managers/internalManagers/fileSystem/fileSystem_manager");
const {
	successResponse,
	errorResponse
} = require("../../managers/common/apiResponseHandler_manager");
const fs = require("fs");
const path = require("path");

exports.uploadFile = async (req, res) => {
	try {
		const returnMetaData = req.query.returnMetaData;
		const { name, moduleName, moduleId } = req.body;
		const createdFile = await fileManager.uploadFile(req.file, name, moduleName, moduleId, req.userId, req.businessUnit);
		let responseObj;
		if (returnMetaData && returnMetaData != "false") {
			responseObj = await fileManager.transformFileObj(createdFile);
		} else {
			responseObj = { id: createdFile._id };
		}
		if (createdFile.extension === "jpg" || createdFile.extension === "jpeg" || createdFile.extension === "png") {
			const transformFile = await fileManager.transformFileObj(createdFile, "download", req.get("host"), req.protocol);
			responseObj.url = transformFile.url;
		}

		return successResponse(res, "File uploaded successfully", 201, responseObj);
	} catch (error) {
		return errorResponse(error, req, res, error.message, 500, null);
	}
};

exports.uploadFiles = async (req, res) => {
	try {
		const returnMetaData = req.query.returnMetaData;
		const { moduleName, moduleId } = req.body;
		const result = { data: [] };

		for (let i = 0; i < req.files.length; i++) {
			try {
				const createdFile = await fileManager.uploadFile(req.files[i], null, moduleName, moduleId, req.userId, req.businessUnit);
				let responseObj;

				if (returnMetaData && returnMetaData != "false") {
					responseObj = await fileManager.transformFileObj(createdFile);
				} else {
					responseObj = { id: createdFile._id };
				}

				if (createdFile.extension === "jpg" || createdFile.extension === "jpeg" || createdFile.extension === "png" 	|| createdFile.extension === "pdf" || createdFile.extension === "fbx") {
					const transformFile = await fileManager.transformFileObj(createdFile, "download", req.get("host"), req.protocol);
					responseObj.url = transformFile.url;
				}

				result.data.push(responseObj);
			} catch (error) {
				result.failures = []
				// Handle individual file upload errors
				const fileNameWithoutExtension = req.files[i].originalname.split(".").slice(0, -1).join(".");
				result.failures.push({
					name: fileNameWithoutExtension,
					extension: req.files[i].originalname.split(".").pop(),
					arrayPosition: i,
				});
			}
		}

		if (result.failures?.length > 0) {
			return successResponse(res, "Files uploaded partially", 207, result);
		}

		return successResponse(res, "Files uploaded successfully", 201, result);
	} catch (error) {
		return errorResponse(error, req, res, error.message, 500, null);
	}
}


exports.updateFilePath = async (req, res) => {
	try {
		const result = await fileManager.updateFilePath(
			req.fileObj,
			null,
			req.body.moduleName,
			req.body.moduleId,
			req.userId
		);
		return successResponse(res, "File path updated successfully", 200, null);
	} catch (error) {
		return errorResponse(error, req, res, error.message, 500, null);
	}
};

exports.getFile = async (req, res) => {
	try {
		const result = await fileManager.getFile(req.params.id, req.query.action, req.businessUnit, req.get("host"), req.protocol);
		return successResponse(res, "File retrieved successfully", 200, result);
	} catch (error) {
		return errorResponse(error, req, res, error.message, 404, null);
	}
};

exports.getFiles = async (req, res) => {
	try {
		let ids = req.fileIds;
		let action = req.query.action;
		const result = await fileManager.getFiles(ids, action, req.businessUnit, req.get("host"), req.protocol, null, null, req.query.page, req.query.limit);
		return successResponse(res, "File retrieved successfully", 200, result);
	} catch (error) {
		return errorResponse(error, req, res, error.message, 404, null);
	}
};

exports.fileAction = async (req, res) => {
	try {
		const action = req.params.action;

		const file = req.fileObj;

		const filePath = path.resolve(file.storageLocation.path);
		await fs.promises.access(filePath, fs.constants.F_OK);

		switch (action) {
			case "download":
				return fileManager.sendFile(res, filePath, file.name, "attachment");
			case "view":
				return fileManager.sendFile(res, filePath, file.name, "inline");
			case "stream":
				return fileManager.streamFile(req, res, filePath, file.contentType);
			default:
				return errorResponse(null, req, res, "Invalid action", 400, null);
		}
	} catch (error) {
		return errorResponse(error, req, res, error.message, 500, null);
	}
};

exports.moveToRecycleBin = async (req, res) => {
	try {
		const result = await fileManager.moveToRecycleBin(req.fileObj, null, req.userId);
		return successResponse(res, "File moved to recycle bin successfully", 200, null);
	} catch (error) {
		return errorResponse(error, req, res, error.message, 500, null);
	}
};

exports.deleteTemporaryFiles = async (req, res) => {
	try {
		const result = await fileManager.deleteTemporaryFiles(req.filesObj, req.userId);
		return successResponse(res, "Temporary files deleted successfully", 200, null);
	} catch (error) {
		return errorResponse(error, req, res, error.message, 500, null);
	}
};

exports.deleteFile = async (req, res) => {
	try {
		const result = await fileManager.deleteFile(req.fileObj, req.userId);
		return successResponse(res, "File deleted successfully", 200, null);
	} catch (error) {
		return errorResponse(error, req, res, error.message, 500, null);
	}
};
