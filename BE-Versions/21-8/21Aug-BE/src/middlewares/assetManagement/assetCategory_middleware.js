const { AssetCategory } = require("../../models/mongoDB/assetManagement/assetCategory_model");
const apiResponseHandler = require("../../managers/common/apiResponseHandler_manager");
const businessUnitManager = require("../../managers/internalManagers/organizationManagement/businessUnit_manager");
const assetCategoryManager = require("../../managers/internalManagers/assetManagement/assetCategory_manager");
const personalProtectiveEquipmentManager = require("../../managers/internalManagers/assetManagement/personalProtectiveEquipment_manager");

const validateField = async (field, value, options) => {
    const { type, maxLength, unique, required, checkExists, checkManyExists, enumValues, alphanumeric, checkDuplicates } = options;

    if (required && !value) {
        return {
            message: `Failed! ${field} is required`,
            errorInfo: null
        };
    }

    if (value) {
        if (type && typeof value !== type && !Array.isArray(value)) {
            return {
                message: `Failed! ${field} must be a ${type}`,
                errorInfo: null
            };
        }

        if (maxLength && value.length > maxLength && !Array.isArray(value)) {
            return {
                message: `Failed! ${field} should not exceed ${maxLength} characters`,
                errorInfo: null
            };
        }
        else if (maxLength && value.length > maxLength && Array.isArray(value)) {
            return {
                message: `Failed! ${field} should not exceed ${maxLength} items`,
                errorInfo: null
            };
        }

        if (Array.isArray(value) && checkDuplicates) {
            const idSet = new Set();
            const duplicateIds = new Set();

            for (const id of value) {
                if (idSet.has(id)) {
                    duplicateIds.add(id);
                } else {
                    idSet.add(id);
                }
            }

            if (duplicateIds.size > 0) {
                return {
                    message: `Failed! Duplicate IDs found in ${field}`,
                    errorInfo: { duplicateIds: Array.from(duplicateIds) }
                };
            }
        }

        if (unique) {
            const exists = await AssetCategory.findOne({ [`${field}`]: value, isDeleted: false });
            if (exists) {
                return {
                    message: `Failed! ${field} already exists in the server`,
                    errorInfo: null
                };
            }
        }

        if (checkExists && !(await checkExists(value))) {
            return {
                message: `Failed! Invalid ${field}`,
                errorInfo: null
            };
        }

        if (checkManyExists) {
            const invalidIds = await checkManyExists(value);
            if (invalidIds.length > 0) {
                return {
                    message: `Failed! Invalid ${field}`,
                    errorInfo: {
                        invalidIds
                    }
                };
            }
        }

        if (enumValues && !enumValues.includes(value)) {
            return {
                message: `Failed! Invalid ${field}`,
                errorInfo: null
            };
        }

        if (alphanumeric && !/^[a-zA-Z0-9\s]*$/.test(value)) {
            return {
                message: `Failed! ${field} should contain only alphanumeric characters`,
                errorInfo: null
            };
        }
    }

    return null;
};
const validateCreateAssetCategoryRequest = async (req, res, next) => {
    const { name, defaultDocumentNames, personalProtectiveEquipments, businessUnit } = req.body;

    req.assetCategoryCreateObject = {
        name,
        defaultDocumentNames,
        personalProtectiveEquipments,
        businessUnit,
        createdBy: req.userId,
        updatedBy: req.userId
    };

    const fieldsToValidate = [
        { field: "name", options: { type: "string", maxLength: 50, unique: true, required: true } },
        { field: "defaultDocumentNames", options: { type: "array", maxLength: 50 } },
        { field: "personalProtectiveEquipments", options: { type: "array", maxLength: 100, checkManyExists: personalProtectiveEquipmentManager.returnInvalidPersonalProtectiveEquipmentIds } },
        { field: "businessUnit", options: { required: true, checkExists: businessUnitManager.checkExistingBusinessUnit } }
    ];

    for (const { field, options } of fieldsToValidate) {
        const value = req.body[field];

        const error = await validateField(field, value, options);
        if (error) {
            return apiResponseHandler.errorResponse(null, req, res, error.message, 400, error.errorInfo);
        }

    }

    next();
};

const validateUpdateAssetCategoryRequest = async (req, res, next) => {
    const { name, defaultDocumentNames, personalProtectiveEquipments, businessUnit } = req.body;

    req.assetCategory = req.params.assetCategory;
    req.assetCategoryObj = await AssetCategory.findById(req.assetCategory);

    if (!req.assetCategoryObj) {
        return apiResponseHandler.errorResponse(null, req, res, "AssetCategory not found", 404, null);
    }

    req.assetCategoryUpdateObject = {
        name: name ?? req.assetCategoryObj.name,
        defaultDocumentNames: defaultDocumentNames ?? req.assetCategoryObj.defaultDocumentNames,
        personalProtectiveEquipments: personalProtectiveEquipments ?? req.assetCategoryObj.personalProtectiveEquipments,
        businessUnit: businessUnit ?? req.assetCategoryObj.businessUnit,
        updatedBy: req.userId,
        updatedAt: Date.now()
    };

    const fieldsToValidate = [
        { field: "name", options: { type: "string", maxLength: 50, unique: true } },
        { field: "defaultDocumentNames", options: { type: "array", maxLength: 50 } },
        { field: "personalProtectiveEquipments", options: { type: "array", maxLength: 100, checkManyExists: personalProtectiveEquipmentManager.returnInvalidPersonalProtectiveEquipmentIds } },
    ];

    for (const { field, options } of fieldsToValidate) {
        const value = req.body[field];

        const error = await validateField(field, value, options);
        if (error) {
            return apiResponseHandler.errorResponse(null, req, res, error.message, 400, error.errorInfo);
        }

    }

    next();
};

const validateDeleteAssetCategoriesRequest = async (req, res, next) => {

    const fieldsToValidate = [
        { field: "assetCategoriesToDelete", options: { type: "array", maxLength: 1000, checkManyExists: assetCategoryManager.returnInvalidAssetCategoryIds, checkDuplicates: true, required: true } },
    ];

    for (const { field, options } of fieldsToValidate) {
        const value = req.body[field];

        const error = await validateField(field, value, options);
        if (error) {
            return apiResponseHandler.errorResponse(null, req, res, error.message, 400, error.errorInfo);
        }

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

const validateAssetCategory = async (req, res, next) => {
    if (req.params.assetCategory && typeof req.params.assetCategory === "string") {
        req.assetCategory = req.params.assetCategory;
    } else if (req.body.assetCategory && typeof req.body.assetCategory === "string") {
        req.assetCategory = req.body.assetCategory;
    } else if (req.query.assetCategory && typeof req.query.assetCategory === "string") {
        req.assetCategory = req.query.assetCategory;
    } else {
        return apiResponseHandler.errorResponse(null, req, res, "AssetCategory id must be a non-empty string in req.params or req.body", 400, null);
    }

    let checkAssetCategory = await assetCategoryManager.checkExistingAssetCategory(req.assetCategory);
    if (checkAssetCategory) {
        req.assetCategoryObj = checkAssetCategory;
        next();
    } else {
        return apiResponseHandler.errorResponse(null, req, res, "Failed! AssetCategory does not exist", 404, null);
    }
};

const assetCategoryMiddleware = {
    validateCreateAssetCategoryRequest,
    validateUpdateAssetCategoryRequest,
    validateDeleteAssetCategoriesRequest,
    validateFetchAllRequest,
    validateAssetCategory,
};

module.exports = assetCategoryMiddleware;