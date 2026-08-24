const { PersonalProtectiveEquipment } = require("../../models/mongoDB/assetManagement/personalProtectiveEquipment_model.js");
const apiResponseHandler = require("../../managers/common/apiResponseHandler_manager.js");
const fileManager = require("../../managers/internalManagers/fileSystem/fileSystem_manager.js");
const personalProtectiveEquipmentManager = require("../../managers/internalManagers/assetManagement/personalProtectiveEquipment_manager.js");
const { default: mongoose } = require("mongoose");

const validateField = async (field, value, options, businessUnit) => {
    const { type, maxLength, unique, required, checkExists, enumValues, alphanumeric, validateFile } = options;

    if (required && !value) {
        return `Failed! ${field} is required`;
    }

    if (value) {
        if (type && typeof value !== type) {
            return `Failed! ${field} must be a ${type}`;
        }

        if (maxLength && value.length > maxLength) {
            return `Failed! ${field} should not exceed ${maxLength} characters`;
        }

        if (unique) {
            const exists = await PersonalProtectiveEquipment.findOne({
                [`${field}`]: value,
                isDeleted: false
            });
            if (exists) {
                return `Failed! ${field} already exists in the server`;
            }
        }

        if (validateFile) {
            if (!value) {
                return `Failed! ${field} is required`;
            }
            if (!mongoose.Types.ObjectId.isValid(value)) {
                return `Failed! ${field} is not a valid file id`;
            }

            let image = await fileManager.getFile(value, "internal", businessUnit);
            if (!image) {
                return `Failed! Invalid ${field} File id`;
            }
            if (image.moduleName || image.moduleId) {
                if (image.moduleName && image.moduleName !== "personalProtectiveEquipments") {
                    return `Failed! Invalid ${field} File id can't be used for this module`;
                }
                if (image.moduleId && image.moduleId) {
                    return `Failed! Invalid ${field} File id can't be used for this module`;
                }
            }
        }

        if (checkExists && !(await checkExists(value))) {
            return `Failed! Invalid ${field}`;
        }

        if (enumValues && !enumValues.includes(value)) {
            return `Failed! Invalid ${field}`;
        }

        if (alphanumeric && !/^[a-zA-Z0-9\s]*$/.test(value)) {
            return `Failed! ${field} should contain only alphanumeric characters`;
        }
    }

    return null;
};

const validateCreatePersonalProtectiveEquipmentRequest = async (req, res, next) => {
    const { name, description, image } = req.body;

    req.personalProtectiveEquipmentCreateObject = {
        name,
        description,
        image,
        businessUnit: req.businessUnit,
        createdBy: req.userId,
        updatedBy: req.userId
    };

    const fieldsToValidate = [
        { field: "name", options: { type: "string", maxLength: 50, unique: true, required: true } },
        {
            field: "description",
            options: { type: "string", maxLength: 300, alphanumeric: true, required: true }
        },
        { field: "image", options: { validateFile: true, required: true } }
    ];

    for (const { field, options } of fieldsToValidate) {
        const error = await validateField(field, req.body[field], options, req.businessUnit);
        if (error) {
            return apiResponseHandler.errorResponse(null, req, res, error, 400, null);
        }
    }

    next();
};

const validateUpdatePersonalProtectiveEquipmentRequest = async (req, res, next) => {
    const { name, description, image } = req.body;
    req.personalProtectiveEquipment = req.params.personalProtectiveEquipment;

    req.personalProtectiveEquipmentObj = await PersonalProtectiveEquipment.findById(req.personalProtectiveEquipment);
    if (!req.personalProtectiveEquipmentObj) {
        return apiResponseHandler.errorResponse(null, req, res, "PersonalProtectiveEquipment not found", 404, null);
    }

    req.personalProtectiveEquipmentUpdateObject = {
        name: name ?? req.personalProtectiveEquipmentObj.name,
        description: description ?? req.personalProtectiveEquipmentObj.description,
        image: image ?? req.personalProtectiveEquipmentObj.image,
        updatedBy: req.userId,
        updatedAt: Date.now()
    };

    const fieldsToValidate = [
        { field: "name", options: { type: "string", maxLength: 50, unique: true } },
        {
            field: "description",
            options: { type: "string", maxLength: 300, alphanumeric: true }
        },
        { field: "image", options: { validateFile: true, } }
    ];

    for (const { field, options } of fieldsToValidate) {

        const error = await validateField(field, req.body[field], options, req.businessUnit);
        if (error) {
            return apiResponseHandler.errorResponse(null, req, res, error, 400, null);
        }
    }

    next();
};


const validateDeletePersonalProtectiveEquipmentsRequest = async (req, res, next) => {
    const { personalProtectiveEquipmentsToDelete } = req.body;
    if (!personalProtectiveEquipmentsToDelete) {
        return apiResponseHandler.errorResponse(null, req, res, "PersonalProtectiveEquipment ids are required", 400, null);
    }

    if (!Array.isArray(personalProtectiveEquipmentsToDelete) || personalProtectiveEquipmentsToDelete.length === 0) {
        return apiResponseHandler.errorResponse(null, req, res, "PersonalProtectiveEquipment ids must be a non-empty array of strings", 400, null);
    }

    const idSet = new Set();
    const duplicateIds = new Set();
    for (const id of personalProtectiveEquipmentsToDelete) {
        if (idSet.has(id)) {
            duplicateIds.add(id);
        } else {
            idSet.add(id);
        }
    }

    if (duplicateIds.size > 0) {
        return apiResponseHandler.errorResponse(null, req, res, "Failed! Duplicate id found", 400, {
            duplicateIds: Array.from(duplicateIds)
        });
    }
    let invalidPersonalProtectiveEquipmentIds = await personalProtectiveEquipmentManager.returnInvalidPersonalProtectiveEquipmentIds(personalProtectiveEquipmentsToDelete);
    if (invalidPersonalProtectiveEquipmentIds.length > 0) {
        return apiResponseHandler.errorResponse(null, req, res, "Failed! Invalid PersonalProtectiveEquipment ids", 400, {
            invalidPersonalProtectiveEquipmentIds: invalidPersonalProtectiveEquipmentIds
        });
    }

    next();
};

const validateFetchAllRequest = async (req, res, next) => {

    const { name } = req.query;
    if (name && typeof name !== 'string') {
        return apiResponseHandler.errorResponse(null, req, res, 'Name must be a string', 400, null);
    }

    next();
};

const validatePersonalProtectiveEquipment = async (req, res, next) => {
    // Check if personalProtectiveEquipment is in req.params
    if (req.params.personalProtectiveEquipment && typeof req.params.personalProtectiveEquipment === "string") {
        req.personalProtectiveEquipment = req.params.personalProtectiveEquipment;
    }
    // If not, check if personalProtectiveEquipment is in req.body
    else if (req.body.personalProtectiveEquipment && typeof req.body.personalProtectiveEquipment === "string") {
        req.personalProtectiveEquipment = req.body.personalProtectiveEquipment;
    }
    else if (req.query.personalProtectiveEquipment && typeof req.query.personalProtectiveEquipment === "string") {
        req.personalProtectiveEquipment = req.query.personalProtectiveEquipment;
    }
    // If personalProtectiveEquipment is not in req.params or req.body, return an error response
    else {
        return apiResponseHandler.errorResponse(null, req,
            res,
            "personalProtectiveEquipment id must be a non-empty string in req.params or req.body",
            400,
            null
        );
    }

    let checkPersonalProtectiveEquipment = await personalProtectiveEquipmentManager.checkExistingPersonalProtectiveEquipment(req.personalProtectiveEquipment)
    if (checkPersonalProtectiveEquipment) {
        req.personalProtectiveEquipmentObj = checkPersonalProtectiveEquipment;
        next();
    } else {
        return apiResponseHandler.errorResponse(null, req, res, "Failed! PersonalProtectiveEquipment does not exist", 404, null);
    }
};





const personalProtectiveEquipmentMiddleware = {
    validateCreatePersonalProtectiveEquipmentRequest,
    validateUpdatePersonalProtectiveEquipmentRequest,
    validateDeletePersonalProtectiveEquipmentsRequest,
    validateFetchAllRequest,
    validatePersonalProtectiveEquipment,

};

module.exports = personalProtectiveEquipmentMiddleware;


