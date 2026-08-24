const multer = require("multer");
const apiResponseHandler = require("../../managers/common/apiResponseHandler_manager.js");
const upload = multer({ dest: "uploads/" });
const fileManager = require("../../managers/internalManagers/fileManagement/file_manager.js");

const jwt = require("jsonwebtoken");
const { authConfig } = require("../../configs");


const mongoose = require("mongoose");

const validateFileType = (req, res, next) => {
    const allowedTypes = ["image/jpeg", "image/png", "application/pdf", "application/octet-stream"];
    if (!allowedTypes.includes(req.file.mimetype)) {
        return apiResponseHandler.errorResponse(null, req, res, "Invalid file type", 400, null);
    }
    next();
};

const validateAllowedExtension = (req, res, next) => {
    const allowedExtensions = ["jpg", "jpeg", "png", "pdf", "fbx"];
    if (!allowedExtensions.includes(req.file.originalname.split(".").pop())) {
        return apiResponseHandler.errorResponse(null, req, res, "Invalid file extension", 400, null);
    }
    next();
};

const validateFileSize = (req, res, next) => {
    if (req.file && req.file.size > 30 * 1024 * 1024) {
        return apiResponseHandler.errorResponse(null, req, res, "File size exceeds limit of 20MB", 400, null);
    }
    next();
};

const validateFileUpload = (req, res, next) => {
    const file = req.file;
    if (!file) {
        return apiResponseHandler.errorResponse(null, req, res, "File not provided", 400, null);
    }
    const { moduleName, moduleId } = req.body;
    if (!moduleName && moduleId) {
        return apiResponseHandler.errorResponse(null, req, res, "Both moduleName and moduleId must be provided together", 400, null);
    }
    next();
};

const validateUpdatePath = (req, res, next) => {
    const id = req.params.id;
    const { moduleName, moduleId } = req.body;
    if (!id) {
        return apiResponseHandler.errorResponse(null, req, res, "File id not provided", 400, null);
    }
    if (!moduleName && moduleId) {
        return apiResponseHandler.errorResponse(null, req,
            res,
            "Both moduleName and moduleId must be provided together",
            400,
            null
        );
    }

    next();
};

const validateFile = async (req, res, next) => {
    // Validate request


    let action = req.params.action || req.query.action
    if (!req.params.id || typeof req.params.id !== "string") {
        return apiResponseHandler.errorResponse(null, req,
            res,
            "File id must be a non-empty string",
            400,
            null
        );
    }
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return apiResponseHandler.errorResponse(null, req,
            res,
            "Please enter a valid File id",
            400,
            null
        );
    }

    if (action && (action !== "stream" && action !== "download" && action !== "view")) {
        return apiResponseHandler.errorResponse(null, req, res, "Please enter a valid action", 400, null);
    }

    req.fileObj = await fileManager.getFile(req.params.id, "internal");
    if (req.fileObj) {
        next();
    } else {
        return apiResponseHandler.errorResponse(null, req, res, "Failed! File does not exist", 400, null);
    }
};

const validateTokenAndReturnFileObj = async (req, res, next) => {
    const token = req.query.token;

    if (!token) {
        return apiResponseHandler.errorResponse(null, req, res, "Failed! No token provided", 400, null);
    }

    const decoded = jwt.verify(token, authConfig.SECRET);
    req.fileObj = await fileManager.getFile(decoded.fileId, "internal");
    if (req.fileObj) {
        next();
    } else {
        return apiResponseHandler.errorResponse(null, req, res, "Failed! Invalid token", 400, null);
    }
};

const validateFilesForDeleteTemporaryAndReturnFiles = async (req, res, next) => {
    const { date } = req.query;
    const specifiedDate = new Date(date);
    if (isNaN(specifiedDate)) {
        return apiResponseHandler.errorResponse(null, req, res, "Invalid date format provided", 400, null);
    }

    req.filesObj = await FileModel.find({
        createdAt: { $lt: specifiedDate },
        "storageLocation.path": { $regex: /^temp\// }
    });

    next()

}

const uploadSingle = (req, res, next) => {
    upload.single("file")(req, res, (error) => {
        if (error) {
            return apiResponseHandler.errorResponse(error, req, res, error.message, 400, null);
        }
        const file = req.file;
        if (!file) {
            return apiResponseHandler.errorResponse(null, req, res, "File not provided", 400, null);
        }
        next();
    });
};


module.exports = {
    uploadSingle,
    validateFileType,
    validateAllowedExtension,
    validateFileSize,
    validateFileUpload,
    validateUpdatePath,
    validateFile,
    validateTokenAndReturnFileObj,
    validateFilesForDeleteTemporaryAndReturnFiles
};
