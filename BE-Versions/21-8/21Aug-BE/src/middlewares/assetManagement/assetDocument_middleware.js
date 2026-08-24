/*
date              cr/qid      comments
20-march-2026     CR0001      Updated for dropdown option - static options replaced with dynamic
*/

const {
  AssetDocument,
  assetDocumentConstant,
} = require("../../models/mongoDB/assetManagement/assetDocument_model.js");
const apiResponseHandler = require("../../managers/common/apiResponseHandler_manager.js");
const fileManager = require("../../managers/internalManagers/fileSystem/fileSystem_manager.js");
const assetDocumentManager = require("../../managers/internalManagers/assetManagement/assetDocument_manager.js");
const { default: mongoose } = require("mongoose");
const assetManager = require("../../managers/internalManagers/assetManagement/asset_manager.js");

const validateField = async (field, value, options, businessUnit) => {
  const {
    type,
    maxLength,
    unique,
    required,
    checkExists,
    enumValues,
    alphanumeric,
    validateFile,
    assetDocumentId,
  } = options;

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
      const exists = await AssetDocument.findOne({
        [`${field}`]: { $regex: `^${value}$`, $options: "i" },
        isDeleted: false,
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
        if (image.moduleName && image.moduleName !== "assetDocuments") {
          return `Failed! Invalid ${field} File id can't be used for this module`;
        }
        if (image.moduleId && image.moduleId !== assetDocumentId) {
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

const validateCreateAssetDocumentRequest = async (req, res, next) => {
  const { name, number, type, typeId, revisionNumber, status, statusId, asset, file } = req.body;

  req.assetDocumentCreateObject = {
    name,
    number,
    type,
    typeId,
    revisionNumber,
    statusId,   
    status,
    asset,
    file,
    businessUnit: req.businessUnit,
    createdBy: req.userId,
    updatedBy: req.userId,
  };

  const fieldsToValidate = [
    {
      field: "name",
      options: {
        type: "string",
        minLength: 1,
        maxLength: 50,
        unique: true,
        required: true,
      },
    },
    {
      field: "number",
      options: {
        type: "string",
        minLength: 1,
        maxLength: 15,
        required: true,
        unique: true,
      },
    },
    // {
    // 	field: "type",
    // 	options: { enumValues: Object.values(assetDocumentConstant.types), required: true }
    // },
    // CR0001
    {
      field: "type",
      options: { type: "string" },
    },
    {
      field: "typeId",
      options: { type: "string" },
    },

    {
      field: "revisionNumber",
      options: { type: "string", minLength: 1, maxLength: 15 },
    },
    // CR0001
    {
      field: "status",
      // options: { enumValues: Object.values(assetDocumentConstant.status), required: true }
      options: { type: "string" },
    },
    {
      field: "statusId",
      options: { type: "string" },
    },
    {
      field: "asset",
      options: {
        type: "string",
        required: true,
        checkExists: assetManager.checkExistingAsset,
      },
    },
    { field: "file", options: { validateFile: true, required: true } },
  ];

  for (const { field, options } of fieldsToValidate) {
    const error = await validateField(
      field,
      req.body[field],
      options,
      req.businessUnit,
    );
    if (error) {
      return apiResponseHandler.errorResponse(null, req, res, error, 400, null);
    }
  }

  next();
};

const validateUpdateAssetDocumentRequest = async (req, res, next) => {
  const { name, number, type,typeId, revisionNumber, status,statusId, asset, file } = req.body;
  req.assetDocument = req.params.assetDocument;
  if (!req.assetDocument) {
    req.assetDocumentObj = await AssetDocument.findById(req.assetDocument);
  }
  if (!req.assetDocumentObj) {
    return apiResponseHandler.errorResponse(
      null,
      req,
      res,
      "AssetDocument not found",
      404,
      null,
    );
  }

  req.assetDocumentUpdateObject = {
    type: type ?? req.assetDocumentObj.type,
    typeId: typeId ?? req.assetDocumentObj.typeId,
    revisionNumber: revisionNumber ?? req.assetDocumentObj.revisionNumber,
    status: status ?? req.assetDocumentObj.status,
    statusId: statusId ?? req.assetDocumentObj.statusId,
    asset: asset ?? req.assetDocumentObj.asset,
    file: file ?? req.assetDocumentObj.file,
    updatedBy: req.userId,
    updatedAt: Date.now(),
  };
  if (req.assetDocumentObj.name != name) {
    req.assetDocumentUpdateObject.name = name;
  }
  if (req.assetDocumentObj.number != number) {
    req.assetDocumentUpdateObject.number = number;
  }

  const fieldsToValidate = [
    {
      field: "name",
      options: { type: "string", minLength: 1, maxLength: 50, unique: true },
    },
    {
      field: "number",
      options: { type: "string", minLength: 1, maxLength: 15, unique: true },
    },
    // {
    // 	field: "type",
    // 	options: { enumValues: Object.values(assetDocumentConstant.types), }
    // },
    // CR0001
    {
      field: "type",
      options: { type: "string" },
    },
    {
      field: "typeId",
      options: { type: "string" },
    },

    {
      field: "revisionNumber",
      options: { type: "string", minLength: 1, maxLength: 15 },
    },
    // {
    // 	field: "status",
    // 	options: { enumValues: Object.values(assetDocumentConstant.status), }
    // },
    // CR0001
    {
      field: "status",
      // options: { enumValues: Object.values(assetDocumentConstant.status), required: true }
      options: { type: "string" },
    },
    {
      field: "statusId",
      options: { type: "string" },
    },
    {
      field: "asset",
      options: { type: "string", checkExists: assetManager.checkExistingAsset },
    },
    {
      field: "file",
      options: { validateFile: true, assetDocumentId: req.assetDocument },
    },
  ];

  for (const { field, options } of fieldsToValidate) {
    if (
      field === "name" &&
      new RegExp(`^${req.assetDocumentObj.name}$`, "i").test(name)
    ) {
      // Skip validation for name uniqueness as it matches the existing name
      options.unique = false;
    }

    if (
      field === "number" &&
      new RegExp(`^${req.assetDocumentObj.number}$`, "i").test(number)
    ) {
      // Skip validation for name uniqueness as it matches the existing name
      options.unique = false;
    }

    const error = await validateField(
      field,
      req.body[field],
      options,
      req.businessUnit,
    );
    if (error) {
      return apiResponseHandler.errorResponse(null, req, res, error, 400, null);
    }
  }
  next();
};

const validateDeleteAssetDocumentsRequest = async (req, res, next) => {
  const { ids } = req.body;
  if (!ids) {
    return apiResponseHandler.errorResponse(
      null,
      req,
      res,
      "AssetDocument ids are required",
      400,
      null,
    );
  }

  if (!Array.isArray(ids) || ids.length === 0) {
    return apiResponseHandler.errorResponse(
      null,
      req,
      res,
      "AssetDocument ids must be a non-empty array of strings",
      400,
      null,
    );
  }

  const idSet = new Set();
  const duplicateIds = new Set();
  for (const id of ids) {
    if (idSet.has(id)) {
      duplicateIds.add(id);
    } else {
      idSet.add(id);
    }
  }

  if (duplicateIds.size > 0) {
    return apiResponseHandler.errorResponse(
      null,
      req,
      res,
      "Failed! Duplicate id found",
      400,
      {
        duplicateIds: Array.from(duplicateIds),
      },
    );
  }
  let invalidAssetDocumentIds =
    await assetDocumentManager.returnInvalidAssetDocumentIds(ids);
  if (invalidAssetDocumentIds.length > 0) {
    return apiResponseHandler.errorResponse(
      null,
      req,
      res,
      "Failed! Invalid AssetDocument ids",
      400,
      {
        invalidAssetDocumentIds: invalidAssetDocumentIds,
      },
    );
  }

  next();
};

const validateFetchAllRequest = async (req, res, next) => {
  let { name, number, types, revisionNumber, statuses, assets } = req.query;

  // Validate name
  if (name && typeof name !== "string") {
    return apiResponseHandler.errorResponse(
      null,
      req,
      res,
      "Name must be a string",
      400,
      null,
    );
  }

  // Validate number
  if (number && typeof number !== "string") {
    return apiResponseHandler.errorResponse(
      null,
      req,
      res,
      "Number must be a string",
      400,
      null,
    );
  }

  // Validate types
  if (types) {
    types = req.query.types.split(",");
    req.query.types = types;

    if (!Array.isArray(types) || types.length === 0) {
      return apiResponseHandler.errorResponse(
        null,
        req,
        res,
        "Types must be a non-empty string with comma-separated values",
        400,
        null,
      );
    }

    const invalidTypes = types.filter(
      (type) => !Object.values(assetDocumentConstant.types).includes(type),
    );
    if (invalidTypes.length > 0) {
      return apiResponseHandler.errorResponse(
        null,
        req,
        res,
        "Invalid types",
        400,
        { invalidTypes },
      );
    }
  } else {
    req.query.types = undefined;
  }

  // Validate revisionNumber
  if (revisionNumber && typeof revisionNumber !== "string") {
    return apiResponseHandler.errorResponse(
      null,
      req,
      res,
      "Revision number must be a string",
      400,
      null,
    );
  }

  // Validate statuses
  if (statuses) {
    statuses = req.query.statuses.split(",");
    req.query.statuses = statuses;

    if (!Array.isArray(statuses) || statuses.length === 0) {
      return apiResponseHandler.errorResponse(
        null,
        req,
        res,
        "Statuses must be a non-empty string with comma-separated values",
        400,
        null,
      );
    }

    const invalidStatuses = statuses.filter(
      (status) => !Object.values(assetDocumentConstant.status).includes(status),
    );
    if (invalidStatuses.length > 0) {
      return apiResponseHandler.errorResponse(
        null,
        req,
        res,
        "Invalid statuses",
        400,
        { invalidStatuses },
      );
    }
  } else {
    req.query.statuses = undefined;
  }

  // Validate assets
  if (assets) {
    assets = req.query.assets.split(",");

    if (!Array.isArray(assets) || assets.length === 0) {
      return apiResponseHandler.errorResponse(
        null,
        req,
        res,
        "Assets must be a non-empty string with comma-separated values",
        400,
        null,
      );
    }

    const invalidAssets = await assetManager.returnInvalidAssetIds(assets);
    if (invalidAssets?.invalidAssetIds?.length > 0) {
      return apiResponseHandler.errorResponse(
        null,
        req,
        res,
        "Invalid asset ids",
        400,
        { invalidAssetIds: invalidAssets.invalidAssetIds },
      );
    }
    for (let i = 0; i < assets.length; i++) {
      if (typeof assets[i] === "string") {
        assets[i] = new mongoose.Types.ObjectId(assets[i]);
      }
    }
    req.query.assets = assets;
  } else {
    req.query.assets = undefined;
  }

  next();
};

const validateAssetDocument = async (req, res, next) => {
  // Check if assetDocument is in req.params
  if (
    req.params.assetDocument &&
    typeof req.params.assetDocument === "string"
  ) {
    req.assetDocument = req.params.assetDocument;
  }
  // If not, check if assetDocument is in req.body
  else if (
    req.body.assetDocument &&
    typeof req.body.assetDocument === "string"
  ) {
    req.assetDocument = req.body.assetDocument;
  } else if (
    req.query.assetDocument &&
    typeof req.query.assetDocument === "string"
  ) {
    req.assetDocument = req.query.assetDocument;
  }
  // If assetDocument is not in req.params or req.body, return an error response
  else {
    return apiResponseHandler.errorResponse(
      null,
      req,
      res,
      "assetDocument id must be a non-empty string in req.params or req.body",
      400,
      null,
    );
  }

  // let checkAssetDocument = await assetDocumentManager.checkExistingAssetDocument(req.assetDocument);
  let checkExistingAssetDocument;
  let fetchByField = req.query.fetchByField;
  if (fetchByField) {
    let businessUnit = req.query.businessUnit;

    if (fetchByField == "name") {
      checkExistingAssetDocument =
        await assetDocumentManager.checkAssetDocumentByField(
          "name",
          req.assetDocument,
          businessUnit,
        );
    } else if (fetchByField == "number") {
      // Check if the user with the given ID exists
      checkExistingAssetDocument =
        await assetDocumentManager.checkAssetDocumentByField(
          "number",
          req.assetDocument,
          businessUnit,
        );
    }
  } else {
    checkExistingAssetDocument =
      await assetDocumentManager.checkExistingAssetDocument(req.assetDocument);
  }

  if (checkExistingAssetDocument) {
    req.assetDocumentObj = checkExistingAssetDocument;
    next();
  } else {
    return apiResponseHandler.errorResponse(
      null,
      req,
      res,
      "Failed! Asset Document does not exist",
      404,
      null,
    );
  }
};
const assetDocumentMiddleware = {
  validateCreateAssetDocumentRequest,
  validateUpdateAssetDocumentRequest,
  validateDeleteAssetDocumentsRequest,
  validateFetchAllRequest,
  validateAssetDocument,
};

module.exports = assetDocumentMiddleware;
