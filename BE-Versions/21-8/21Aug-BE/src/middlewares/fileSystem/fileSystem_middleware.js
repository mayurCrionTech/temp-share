/*
date            cr/qid      comments
07-april-2026     CR0015      [updated] - Unrestricted File Upload vulnerability fix -size validation
*/
const multer = require("multer");
const apiResponseHandler = require("../../managers/common/apiResponseHandler_manager.js");
const fileManager = require("../../managers/internalManagers/fileSystem/fileSystem_manager.js");
const fs = require("fs");

const jwt = require("jsonwebtoken");
const { authConfig } = require("../../configs/index.js");


const mongoose = require("mongoose");

// Middleware functions
//start of CR0015 changes
const ALLOWED_IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "pdf", "doc"];
const IMAGE_MAX_SIZE = 5 * 1024 * 1024; // 5 MB

const uploadImages = multer({
    dest: "uploads/",
    limits: {
        fileSize: IMAGE_MAX_SIZE,
    },
    fileFilter: (req, file, cb) => {
        const ext = file.originalname.split(".").pop().toLowerCase();
        if (!ALLOWED_IMAGE_EXTENSIONS.includes(ext)) {
            return cb(
                new Error(
                    `File "${file.originalname}" has an invalid type. Only .jpg, .png, .jpeg are allowed.`
                )
            );
        }
        cb(null, true);
    },
});

const SINGLE_FILE_MAX_SIZE = 10 * 1024 * 1024; // 10 MB

const uploadSingleMulter = multer({
    dest: "uploads/",
    limits: {
        fileSize: SINGLE_FILE_MAX_SIZE,
    },
});
//end of CR0015 changes
const validateFileExtensionAndSize = (req, res, next) => {
    const fileExtension = req.file.originalname.split(".").pop().toLowerCase();
    const { valid, message, maxSize, fileSize } = fileManager.isValidFileExtensionAndSize(fileExtension, req.file.size);

    if (!valid) {
        fs.unlink(req.file.path, (err) => {
            if (err) {
                console.error(`Failed to delete file ${req.file.path}: ${err.message}`);
            }
        });
        return apiResponseHandler.errorResponse(null, req, res, message, 400, { maxSize, fileSize });
    } else {
        next();
    }
};

const validateMultipleFileExtensionAndSize = (req, res, next) => {
    if (!Array.isArray(req.files) || req.files.length === 0) {
        return apiResponseHandler.errorResponse(null, req, res, "Invalid files provided", 400, null);
    }
    for (const file of req.files) {
        const fileExtension = file.originalname.split(".").pop().toLowerCase();
        const { valid, message, maxSize, fileSize } = fileManager.isValidFileExtensionAndSize(fileExtension, file.size);
        if (!valid) {
            return apiResponseHandler.errorResponse(null, req, res, message, 400, { maxSize, fileSize });
        }
    }
    next();
};

const validateMultipleFileExtensionAndSizeIfPresent = (req, res, next) => {
    if(req.files.length > 0){
        if (!Array.isArray(req.files) || req.files.length === 0) {
            return apiResponseHandler.errorResponse(null, req, res, "Invalid files provided", 400, null);
        }
        for (const file of req.files) {
            const fileExtension = file.originalname.split(".").pop().toLowerCase();
            const { valid, message, maxSize, fileSize } = fileManager.isValidFileExtensionAndSize(fileExtension, file.size);
            if (!valid) {
                return apiResponseHandler.errorResponse(null, req, res, message, 400, { maxSize, fileSize });
            }
        }
    }
    next();
};

const validateFileUpload = (req, res, next) => {
    const file = req.file;
    const files = req.files;
    if (!file && !files) {
        return apiResponseHandler.errorResponse(null, req, res, "File not provided", 400, null);
    }
    const { moduleName, moduleId } = req.body;
    if (!moduleName && moduleId) {
        fs.unlink(req.file.path, (err) => {
            if (err) {
                console.error(`Failed to delete file ${req.file.path}: ${err.message}`);
            }
        });
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

    req.fileObj = await fileManager.getFile(req.params.id, "internal", req.businessUnit);
    if (req.fileObj) {
        next();
    } else {
        return apiResponseHandler.errorResponse(null, req, res, "Failed! File does not exist", 400, null);
    }
};

const validateFileById = async (id, errorFieldName, businessUnit) => {
try {
    if (!id || typeof id !== "string") {
            if (errorFieldName) {
                throw new Error(`File id must be a non-empty string for ${errorFieldName}`);
            }
            throw new Error("File id must be a non-empty string");
        }
    if (!mongoose.Types.ObjectId.isValid(id)) {
            if (errorFieldName) {
							throw new Error(`Please enter a valid File id for ${errorFieldName}`);
						}
    		throw new Error("Please enter a valid File id");
    	}
    	const fileObj = await fileManager.getFile(id, "internal", businessUnit);
    	if (fileObj) {
    		return fileObj;
        } else {
            if (errorFieldName) {
							throw new Error(`Failed! File does not exist for ${errorFieldName}`);
						}
    		throw new Error("Failed! File does not exist");
    	}
} catch (error) {
    throw error;
}
};


const validateFetchFilesRequest = async (req, res, next) => {
    const ids = req.query.ids || req.body.ids;
    const action = req.params.action || req.query.action;

    // Initialize req.fileIds
    req.fileIds = [];

    // Validate and process ids
    if (ids) {
        if (typeof ids === "string") {
            req.fileIds = ids.split(",");
        } else if (Array.isArray(ids)) {
            req.fileIds = ids;
        } else {
            return apiResponseHandler.errorResponse(null, req,
                res,
                "File ids must be a non-empty string or array",
                400,
                null
            );
        }
    } else {
        return apiResponseHandler.errorResponse(null, req,
            res,
            "File ids must be provided in the request body or query",
            400,
            null
        );
    }

    // Validate fileIds array
    if (!Array.isArray(req.fileIds) || req.fileIds.length === 0) {
        return apiResponseHandler.errorResponse(null, req,
            res,
            "File ids must be a non-empty array",
            400,
            null
        );
    }

    // Validate individual file ids
    const invalidIds = req.fileIds.filter(id => !mongoose.Types.ObjectId.isValid(id));
    if (invalidIds.length > 0) {
        return apiResponseHandler.errorResponse(null, req,
            res,
            "Invalid file ids detected",
            400,
            { invalidIds }
        );
    }

    // Validate action
    const validActions = ["stream", "download", "view"];
    if (action && !validActions.includes(action)) {
        return apiResponseHandler.errorResponse(null, req,
            res,
            "Invalid action specified",
            400,
            null
        );
    }

    next();
};


const validateTokenAndReturnFileObj = async (req, res, next) => {
    const token = req.query.token;

    if (!token) {
        return apiResponseHandler.errorResponse(null, req, res, "Failed! No token provided", 400, null);
    }

    const decoded = jwt.verify(token, authConfig.SECRET);
    req.fileObj = await fileManager.getFile(decoded.fileId, "internal", req.businessUnit);
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

    req.filesObj = await fileManager.getFiles(
        null, // Assuming ids are not needed in this case
        "internal", // Assuming action is not needed in this case
        req.businessUnit,
        null, // Pass the request host if needed
        null, // Pass the request protocol if needed
        specifiedDate, // Use the specified date for filtering
        /^temp\// // Use the regex pattern for storage location
    );

    next()

}

const uploadSingle = (req, res, next) => {
    uploadSingleMulter.single("file")(req, res, (err) => { // CR0015
             if (err instanceof multer.MulterError) {
                if (err.code === "LIMIT_FILE_SIZE") {
                    return apiResponseHandler.errorResponse(
                            err,
                            req,
                            res,
                            "File size exceeds 10 MB limit",
                            400,
                            null
                        );
                    }
        } //CR0015
        if (err) {
            return apiResponseHandler.errorResponse(err, req, res, err.message, 400, null);
        }
        const file = req.file;
        if (!file) {
            return apiResponseHandler.errorResponse(null, req, res, "File not provided", 400, null);
        }
        next();
    });
};

const uploadMultiple = (req, res, next) => {
    uploadImages.array("files")(req, res, (err) => { // CR0015
        if (err instanceof multer.MulterError) {
            if (err.code === "LIMIT_FILE_SIZE") {
                return apiResponseHandler.errorResponse(
                    err, req, res,
                    `File should be less than ${IMAGE_MAX_SIZE / 1024 / 1024} MB!`,
                    400, null
                );
            }
            return apiResponseHandler.errorResponse(err, req, res, err.message, 400, null);
        } else if (err) {
            //CR0015
            return apiResponseHandler.errorResponse(err, req, res, err.message, 400, null);
        }
        const files = req.files;
        if (!files) {
            return apiResponseHandler.errorResponse(null, req, res, "Files not provided", 400, null);
        }
        if (files.length > 10) {
            return apiResponseHandler.errorResponse(null, req, res, "You can only upload a maximum of 10 files at a time", 400, null);
        }
        next();
    });
};


module.exports = {
	uploadSingle,
	uploadMultiple,
	validateFileUpload,
	validateUpdatePath,
	validateFile,
	validateFileById,
	validateFetchFilesRequest,
	validateTokenAndReturnFileObj,
	validateFileExtensionAndSize,
	validateMultipleFileExtensionAndSize,
	validateFilesForDeleteTemporaryAndReturnFiles,
    validateMultipleFileExtensionAndSizeIfPresent,
};
