const fileManager = require("../../managers/internalManagers/fileManagement/file_manager");
const {
	successResponse,
	errorResponse
} = require("../../managers/common/apiResponseHandler_manager");

exports.uploadFile = async (req, res) => {
	try {
		const { name, moduleName, moduleId } = req.body;
		const result = await fileManager.uploadFile(req.file, name, moduleName, moduleId, req.userId);
		return successResponse(res, "File uploaded successfully", 201, { id: result._id });
	} catch (error) {
		return errorResponse(error, req, res, error.message, 500, null);
	}
};

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
		const result = await fileManager.getFile(req.params.id, req.query.action, req);
		return successResponse(res, "File retrieved successfully", 200, result);
	} catch (error) {
		return errorResponse(error, req, res, error.message, 404, null);
	}
};

exports.getFiles = async (req, res) => {
	try {
		let ids = req.query.ids ? req.query.ids.split(",") : [];
		let action = req.query.action;
		const result = await fileManager.getFiles(ids, action, req);
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
