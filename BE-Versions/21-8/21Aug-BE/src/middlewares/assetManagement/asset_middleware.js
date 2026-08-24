/*
date              cr/qid      comments
20-march-2026     CR0001      updated for dropdown option
*/
/*
date            qid / cr#         comments
19-mar-2026     CR0008           ASSET import by xlsx
17-apr-2026     CR0013           IDOR - Issue
*/

const { assetConstant, Assets } = require("../../models/mongoDB/assetManagement/asset_model"); // Assuming you have this file for constants
const departmentManager = require("../../managers/internalManagers/organizationManagement/department_manager.js");
const assetCategoryManager = require("../../managers/internalManagers/assetManagement/assetCategory_manager.js");
const businessUnitManager = require("../../managers/internalManagers/organizationManagement/businessUnit_manager.js");
const assetParameterManager = require("../../managers/internalManagers/assetManagement/assetParameter_manager");
const spareManager = require("../../managers/internalManagers/assetManagement/sparesAndInventory_manager");
const apiResponseHandler = require("../../managers/common/apiResponseHandler_manager.js");
const userManager = require("../../managers/internalManagers/userManagement/user_manager");
const assetManager = require("../../managers/internalManagers/assetManagement/asset_manager.js");
const fileManager = require("../../managers/internalManagers/fileSystem/fileSystem_manager.js");
const { default: mongoose } = require("mongoose");
const userMiddleware = require("../usermanagement/user_middleware.js");
const moduleConfig = require("../../configs/module_config.js");
//START
//CR0008
const multer = require("multer");//Excel
const path = require("path");//Excel
const fs = require("fs");//Excel
//END
//CR0013
const validateCreateAssetRequest = async (req, res, next) => {
  const { generalDetails, images } = req.body;
  const assetDepartmentId = generalDetails.department.toString();

		if (req.department !== assetDepartmentId) {
			return apiResponseHandler.errorResponse(
				null,
				req,
				res,
				"Forbidden! You do not have access to this asset",
				403
			);
		}
    //CR0013
  const errors = {};
  req.assetCreateObject = {
    generalDetails: {},
    isRegistrationCompleted: false,
    status: assetConstant.status.Active,
    businessUnit: req.businessUnit,
    createdBy: req.userId,
    updatedBy: req.userId,
    statusHistory: [
      {
        status: assetConstant.status.Active,
        startTime: new Date(),
        endTime: null, // explicitly set null for clarity
      },
    ],
  };

  const validateFieldGeneralDetails = async (field, options) => {
		const { type, minLength, maxLength, unique, required, checkExists, enumValues } = options;
    const value = generalDetails[field];

    if (required && !value) {
      errors[`generalDetails.${field}`] = `${field} is required`;
      return `Failed! ${field} is required`;
    }

    if (value) {
      if (type && typeof value !== type) {
        errors[`generalDetails.${field}`] = `${field} must be a ${type}`;
        return `Failed! ${field} must be a ${type}`;
      }

      if (maxLength && value.length > maxLength) {
        errors[`generalDetails.${field}`] = `${field} should not exceed ${maxLength} characters`;
        return `Failed! ${field} should not exceed ${maxLength} characters`;
      }

      if (minLength && value.length < minLength) {
        errors[`generalDetails.${field}`] = `${field} should not be less than ${minLength} characters`;
        return `Failed! ${field} should not be less than ${minLength} characters`;
      }

      if (unique) {
        const exists = await Assets.findOne({ [`generalDetails.${field}`]: value, isDeleted: false });
        if (exists) {
          errors[`generalDetails.${field}`] = `${field} already exists`;
          return `Failed! ${field} already exists in the server`;
        }
      }

      if (checkExists && !(await checkExists(value))) {
        errors[`generalDetails.${field}`] = `Invalid ${field}`;
        return `Failed! Invalid ${field}`;
      }

      if (enumValues && !enumValues.includes(value)) {
        errors[`generalDetails.${field}`] = `Invalid ${field}`;
        return `Failed! Invalid ${field}`;
      }

      req.assetCreateObject.generalDetails[field] = value;
    }
  };

  const fieldsToValidate = [
    {
      field: "name",
      options: { type: "string", maxLength: 50, unique: false, required: true },
    },
    {
      field: "number",
      options: { type: "string", maxLength: 15, unique: true, required: true },
    },
    { field: "description", options: { type: "string", maxLength: 1000 } },
    {
      field: "department",
      options: {
        required: true,
        checkExists: departmentManager.checkExistingDepartment,
      },
    },
    {
      field: "businessUnit",
      options: { checkExists: businessUnitManager.checkExistingBusinessUnit },
    },
    // {
    //   field: "category",
    //   options: { checkExists: assetCategoryManager.checkExistingAssetCategory },
    // },
    // CR0001
    {
      field: "category",
      options: { type: "string" },
    },
    // {
    //   field: "criticalityLevel",
    //   options: {
    //     enumValues: Object.values(
    //       assetConstant.generalDetails.criticalityLevel,
    //     ),
    //   },
    // },
    // CR0001
    {
      field: "criticalityLevel",
      options: { type: "string" },
    },
    {
      field: "criticalityLevelId",
      options: { type: "string" },
    },
    // { field: "runningMode", options: { enumValues: Object.values(assetConstant.generalDetails.runningMode) } },
    {
      field: "runningMode",
      options: { type: "string" },
    },
    {
      field: "runningModeId",
      //   options: { type: "object" },
      options: { type: "string" },
    },
    // {
    //   field: "functionalArea",
    //   options: {
    //     enumValues: Object.values(assetConstant.generalDetails.functionalArea),
    //   },
    // },
    {
      field: "functionalArea",
      options: { type: "string" },
    },
    {
      field: "functionalAreaId",
      options: { type: "string" },
    },
    {
      field: "owner",
      options: {
        required: true,
        checkExists: (userId) => userManager.getUser(req, userId, "_id", ""),
      },
    },
  ];

  for (const { field, options } of fieldsToValidate) {
    const error = await validateFieldGeneralDetails(field, options);
    if (error) {
      return apiResponseHandler.errorResponse(null, req, res, error, 400, null);
    }
  }

  if (images) {
    if (!Array.isArray(images)) {
      errors["images"] = "Images should be an array of IDs";
      return apiResponseHandler.errorResponse(
        null,
        req,
        res,
        "Failed! Images should be an array of IDs",
        400,
        errors,
      );
    }

    //inages max length is 6
    if (images.length > 6) {
      errors["images"] = "Images should not exceed 6 images";
      return apiResponseHandler.errorResponse(
        null,
        req,
        res,
        "Failed! Images should not exceed 6 images",
        400,
        errors,
      );
    }

    const uniqueImages = new Set();
    const duplicateImages = [];

    for (let i = 0; i < images.length; i++) {
      const imageId = images[i];

      if (typeof imageId !== "string") {
        return apiResponseHandler.errorResponse(
          null,
          req,
          res,
          "File ids must be a non-empty array of strings",
          400,
          null,
        );
      }

      // Check for duplicate permission IDs
      if (uniqueImages.has(imageId)) {
        duplicateImages.push(imageId);
      } else {
        uniqueImages.add(imageId);
      }
    }

    if (duplicateImages.length > 0) {
      return apiResponseHandler.errorResponse(
        null,
        req,
        res,
        "Duplicate file ids are not allowed",
        400,
        {
          duplicateImages,
        },
      );
    }

    let validFileObjAndInvalidFileIds =
      await fileManager.returnValidFileObjAndInvalidFileIds(images);

    let invalidFileIds = validFileObjAndInvalidFileIds.invalidFileIds;

    let validFileObjs = validFileObjAndInvalidFileIds.validFileObj;

    if (invalidFileIds.length > 0) {
      return apiResponseHandler.errorResponse(
        null,
        req,
        res,
        "Failed! Invalid File ids",
        400,
        {
          invalidFileIds,
        },
      );
    }

    //iterate and check all module ids and module names is empty
    let invalidFiles = [];
    for (let i = 0; i < validFileObjs.length; i++) {
      let validFileObj = validFileObjs[i];
      if (
        (validFileObj.moduleName && validFileObj.moduleName !== "assets") ||
        validFileObj.moduleId
      ) {
        invalidFiles.push(validFileObj._id);
      }
    }
    if (invalidFiles.length > 0) {
      return apiResponseHandler.errorResponse(
        null,
        req,
        res,
        "Failed! Invalid File ids",
        400,
        {
          invalidFiles,
        },
      );
    }
    req.assetCreateObject.images = images;
  }

  if (Object.keys(errors).length > 0) {
    console.log("errors", errors);
    return apiResponseHandler.errorResponse(
      null,
      req,
      res,
      "Failed! Validation error",
      400,
      errors,
    );
  }

  next();
};

const validateUpdateRequest = async (req, res, next) => {
  const {
    generalDetails,
    specifications,
    locationAndHierarchyDetails,
    images,
  } = req.body;
  const errors = {};
  req.assetUpdateObject = {
    updatedBy: req.userId,
    isRegistrationCompleted: false,
  };
  req.asset = req.params.asset;

  const validateFieldGeneralDetails = async (field, options) => {
    const { type, maxLength, unique, required, checkExists, enumValues } =
      options;
    const value = generalDetails[field];

    if (required && !value) {
      errors[`generalDetails.${field}`] = `${field} is required`;
      return `Failed! ${field} is required`;
    }

    if (value) {
      if (type && typeof value !== type) {
        errors[`generalDetails.${field}`] = `${field} must be a ${type}`;
        return `Failed! generalDetails.${field} must be a ${type}`;
      }

      if (maxLength && value.length > maxLength) {
        errors[`generalDetails.${field}`] =
          `${field} should not exceed ${maxLength} characters`;
        return `Failed! generalDetails.${field} should not exceed ${maxLength} characters`;
      }

      if (unique) {
        const exists = await Assets.findOne({
          [`generalDetails.${field}`]: value,
          isDeleted: false,
        });
        if (exists) {
          errors[`generalDetails.${field}`] = `${field} already exists`;
          return `Failed! generalDetails.${field} already exists in the server`;
        }
      }

      if (checkExists && !(await checkExists(value))) {
        errors[`generalDetails.${field}`] = `Invalid ${field}`;
        return `Failed! Invalid generalDetails.${field}`;
      }

      if (enumValues && !enumValues.includes(value)) {
        errors[`generalDetails.${field}`] = `Invalid ${field}`;
        return `Failed! Invalid generalDetails.${field}`;
      }

      req.assetUpdateObject.generalDetails[field] = value;
    }
  };
  const validateFieldSpecifications = async (fieldPath, options) => {
    const {
      type,
      maxLength,
      enumValues,
      required,
      isDate,
      alphanumeric,
      maxValue,
      minValue,
      validateFile,
      validateEmail,
      setToNull,
    } = options;
    const value = fieldPath.reduce(
      (acc, key) => acc && acc[key],
      specifications,
    );

    if (required && (value === undefined || value === null || value === "")) {
      errors[fieldPath.join(".")] = `${fieldPath.join(".")} is required`;
      return `Failed! ${fieldPath.join(".")} is required`;
    }

    if (value !== undefined && value !== null) {
      if (type && typeof value !== type) {
        errors[fieldPath.join(".")] =
          `${fieldPath.join(".")} must be a ${type}`;
        return `Failed! ${fieldPath.join(".")} must be a ${type}`;
      }

      if (maxLength && value.length > maxLength) {
        errors[fieldPath.join(".")] =
          `${fieldPath.join(".")} should not exceed ${maxLength} characters`;
        return `Failed! ${fieldPath.join(".")} should not exceed ${maxLength} characters`;
      }

      if (enumValues && !enumValues.includes(value)) {
        errors[fieldPath.join(".")] = `Invalid ${fieldPath.join(".")}`;
        return `Failed! Invalid ${fieldPath.join(".")}`;
      }

      if (isDate && isNaN(new Date(value).getTime())) {
        errors[fieldPath.join(".")] = `Invalid ${fieldPath.join(".")}`;
        return `Failed! Invalid ${fieldPath.join(".")}`;
      }

      if (alphanumeric && !/^[0-9a-zA-Z]+$/.test(value)) {
        errors[fieldPath.join(".")] =
          `${fieldPath.join(".")} must be an alphanumeric string`;
        return `Failed! ${fieldPath.join(".")} should contain only alphanumeric characters`;
      }

      if (maxValue !== undefined && value > maxValue) {
        errors[fieldPath.join(".")] =
          `${fieldPath.join(".")} must not exceed ${maxValue}`;
        return `Failed! ${fieldPath.join(".")} should not exceed ${maxValue}`;
      }

      if (minValue !== undefined && value < minValue) {
        errors[fieldPath.join(".")] = `${fieldPath.join(".")} must not be less than ${minValue}`;
        return `Failed! ${fieldPath.join(".")} should not be less than ${minValue}`;
      }

      if (validateFile) {
        if (value === null) {
          // fieldPath.reduce((acc, key, index) => {
          // 	if (index === fieldPath.length - 1) {
          // 		acc[key] = null;
          // 	} else {
          // 		acc[key] = acc[key] || {};
          // 	}
          // 	return acc[key];
          // }, req.assetUpdateObject.specifications);
          return;
        }
        if (!value) {
          errors[fieldPath.join(".")] = `${fieldPath.join(".")} is required`;
          return `Failed! ${fieldPath.join(".")} is required`;
        }
        if (!mongoose.Types.ObjectId.isValid(value)) {
          errors[fieldPath.join(".")] =
            `${fieldPath.join(".")} is not a valid file id`;
          return `Failed! ${fieldPath.join(".")} is not a valid file id`;
        }

        let termsAndConditions = await fileManager.getFile(value, "internal", req.businessUnit);
        if (!termsAndConditions) {
          return `Failed! Invalid ${fieldPath.join(".")} File id`;
        }
        if (termsAndConditions.moduleName || termsAndConditions.moduleId) {
          if (termsAndConditions.moduleName && termsAndConditions.moduleName !== "assets") {
            return `Failed! Invalid ${fieldPath.join(".")} File id is not an asset file`;
          }
          if (termsAndConditions.moduleId && termsAndConditions.moduleId !== req.asset) {
            return `Failed! Invalid ${fieldPath.join(".")} File id is not an asset file`;
          }
        }
      }

      if (validateEmail) {
        if (!value) {
          errors[fieldPath.join(".")] = `${fieldPath.join(".")} is required`;
          return `Failed! ${fieldPath.join(".")} is required`;
        }
        if (!userMiddleware.isValidEmail(value)) {
          errors[fieldPath.join(".")] = `${fieldPath.join(".")} is not a valid email`;
          return `Failed! ${fieldPath.join(".")} should be a valid email`;
        }
      }

      fieldPath.reduce((acc, key, index) => {
        if (index === fieldPath.length - 1) {
          acc[key] = value;
        } else {
          acc[key] = acc[key] || {};
        }
        return acc[key];
      }, req.assetUpdateObject.specifications);
    } else if (setToNull) {
      // Dynamically set the field to null if a specific condition fails
      fieldPath.reduce((acc, key, index) => {
        if (index === fieldPath.length - 1) {
          acc[key] = null;
        } else {
          acc[key] = acc[key] || {};
        }
        return acc[key];
      }, req.assetUpdateObject.specifications);
    }
  };
  const validateFieldLocationAndHierarchyDetails = async (
    fieldPath,
    options,
    req,
  ) => {
    const {
      type,
      maxLength,
      enumValues,
      required,
      isDate,
      alphanumeric,
      maxValue,
      maxDigits,
      checkExists,
    } = options;
    const value = fieldPath.reduce(
      (acc, key) => acc && acc[key],
      locationAndHierarchyDetails,
    );

    if (
      fieldPath.join(".") === "hierarchy.parent" &&
      req.asset &&
      value &&
      req.asset.toString() === value.toString()
    ) {
      errors[fieldPath.join(".")] = `Asset cannot be its own parent`;
      return `Failed! Asset cannot be its own parent`;
    }

    if (required && (value === undefined || value === null || value === "")) {
      errors[fieldPath.join(".")] = `${fieldPath.join(".")} is required`;
      return `Failed! ${fieldPath.join(".")} is required`;
    }

    if (value !== undefined && value !== null) {
      // Check for type validation
      if (type && typeof value !== type) {
        errors[fieldPath.join(".")] =
          `${fieldPath.join(".")} must be a ${type}`;
        return `Failed! ${fieldPath.join(".")} must be a ${type}`;
      }

      if (checkExists && !(await checkExists(value))) {
        errors[fieldPath.join(".")] = `Invalid ${value}`;
        return `Failed! Invalid ${fieldPath.join(".")}`;
      }

      // Check for maxLength for strings
      if (typeof value === "string" && maxLength && value.length > maxLength) {
        errors[fieldPath.join(".")] =
          `${fieldPath.join(".")} should not exceed ${maxLength} characters`;
        return `Failed! ${fieldPath.join(".")} should not exceed ${maxLength} characters`;
      }

      // Check for maxDigits for numeric fields
      if (typeof value === "number") {
        const stringValue = value.toString(); // Convert number to string

        // Handle negative numbers by considering the length after removing the negative sign
        const numDigits = stringValue.replace(/^-/, "").replace(".", "").length;

        if (maxDigits !== undefined && numDigits > maxDigits) {
          errors[fieldPath.join(".")] =
            `${fieldPath.join(".")} should not exceed ${maxDigits} digits`;
          return `Failed! ${fieldPath.join(".")} should not exceed ${maxDigits} digits`;
        }
      }

      fieldPath.reduce((acc, key, index) => {
        if (index === fieldPath.length - 1) {
          acc[key] = value;
        } else {
          acc[key] = acc[key] || {};
        }
        return acc[key];
      }, req.assetUpdateObject.locationAndHierarchyDetails);
    }
  };

  try {
    const hasNonEmptyValues = (obj) => {
      return Object.values(obj).some((value) =>
        typeof value === "object" && value !== null
          ? hasNonEmptyValues(value)
          : value !== null && value !== undefined && value !== "",
      );
    };

    req.assetObj = await Assets.findOne({ _id: req.asset, isDeleted: false });

    if (!req.assetObj) {
      return apiResponseHandler.errorResponse(
        null,
        req,
        res,
        "Asset not found",
        404,
      );
    }

    const isGeneralDetailsPresent =
      generalDetails && Object.keys(generalDetails).length > 0
        ? hasNonEmptyValues(generalDetails)
        : req.assetObj.generalDetails &&
          Object.keys(req.assetObj.generalDetails).length > 0 &&
          hasNonEmptyValues(req.assetObj.generalDetails);

    const isSpecificationsPresent =
      specifications && Object.keys(specifications).length > 0
        ? hasNonEmptyValues(specifications)
        : req.assetObj.specifications &&
          Object.keys(req.assetObj.specifications).length > 0 &&
          hasNonEmptyValues(req.assetObj.specifications);

    const isLocationAndHierarchyDetailsPresent =
      locationAndHierarchyDetails &&
      Object.keys(locationAndHierarchyDetails).length > 0
        ? hasNonEmptyValues(locationAndHierarchyDetails)
        : req.assetObj.locationAndHierarchyDetails &&
          Object.keys(req.assetObj.locationAndHierarchyDetails).length > 0 &&
          hasNonEmptyValues(req.assetObj.locationAndHierarchyDetails);

    if (
      moduleConfig.SPARE_MODULE == true &&
      moduleConfig.ASSET_PARAMETER_MODULE == true
    ) {
      const spare = await spareManager.getSpare(
        null,
        null,
        req.assetObj._id,
        "",
        "",
        req.businessUnit,
      );
      const assetParameter =
        await assetParameterManager.checkExistingParameterByAssetId(
          req.assetObj._id,
        );

      if (
        isGeneralDetailsPresent &&
        isSpecificationsPresent &&
        isLocationAndHierarchyDetailsPresent &&
        spare &&
        assetParameter
      ) {
        req.assetUpdateObject.isRegistrationCompleted = true;
      }
    } else if (moduleConfig.SPARE_MODULE == true) {
      const spare = await spareManager.getSpare(
        null,
        null,
        req.assetObj._id,
        "",
        "",
        req.businessUnit,
      );
      if (
        isGeneralDetailsPresent &&
        isSpecificationsPresent &&
        isLocationAndHierarchyDetailsPresent &&
        spare
      ) {
        req.assetUpdateObject.isRegistrationCompleted = true;
      }
    } else if (moduleConfig.ASSET_PARAMETER_MODULE == true) {
      const assetParameter =
        await assetParameterManager.checkExistingParameterByAssetId(
          req.assetObj._id,
        );
      if (
        isGeneralDetailsPresent &&
        isSpecificationsPresent &&
        isLocationAndHierarchyDetailsPresent &&
        assetParameter
      ) {
        req.assetUpdateObject.isRegistrationCompleted = true;
      }
    } else {
      if (
        isGeneralDetailsPresent &&
        isSpecificationsPresent &&
        isLocationAndHierarchyDetailsPresent
      ) {
        req.assetUpdateObject.isRegistrationCompleted = true;
      }
    }
    let fieldsToValidate = [];
    if (generalDetails) {
      req.assetUpdateObject.generalDetails = {};
      if (req.assetObj.generalDetails) {
        req.assetUpdateObject.generalDetails = req.assetObj.generalDetails;
        fieldsToValidate = [
          {
            field: "name",
            options: {
              type: "string",
              maxLength: 50,
              unique: true,
              required: !req.assetObj.generalDetails.name,
            },
          },
          {
            field: "number",
            options: {
              type: "string",
              maxLength: 15,
              unique: true,
              required: !req.assetObj.generalDetails.number,
            },
          },
          {
            field: "description",
            options: { type: "string", maxLength: 1000 },
          },
          {
            field: "department",
            options: {
              required: !req.assetObj.generalDetails.department,
              checkExists: departmentManager.checkExistingDepartment,
            },
          },
          // {
          //   field: "category",
          //   options: {
          //     checkExists: assetCategoryManager.checkExistingAssetCategory,
          //   },
          // },
          // CR0001
          {
            field: "category",
            options: { type: "string" },
          },
          {
            field: "businessUnit",
            options: {
              checkExists: businessUnitManager.checkExistingBusinessUnit,
            },
          },
          //   {
          //     field: "criticalityLevel",
          //     options: {
          //       enumValues: Object.values(
          //         assetConstant.generalDetails.criticalityLevel,
          //       ),
          //     },
          //   },
          // CR0001
          {
            field: "criticalityLevel",
            options: { type: "string" },
          },
          {
            field: "criticalityLevelId",
            options: { type: "string" },
          },
          //   {
          //     field: "runningMode",
          //     options: {
          //       enumValues: Object.values(
          //         assetConstant.generalDetails.runningMode,
          //       ),
          //     },
          //   },
          {
            field: "runningMode",
            options: { type: "string" },
          },
          {
            field: "runningModeId",
            options: { type: "string" },
          },
          //   {
          //     field: "functionalArea",
          //     options: {
          //       enumValues: Object.values(
          //         assetConstant.generalDetails.functionalArea,
          //       ),
          //     },
          //   },
          {
            field: "functionalArea",
            options: { type: "string" },
          },
          {
            field: "functionalAreaId",
            options: { type: "string" },
          },
          {
            field: "owner",
            options: {
              required: !req.assetObj.generalDetails.owner,
              checkExists: (userId) =>
                userManager.getUser(req, userId, "_id", ""),
            },
          },
        ];

        for (const { field, options } of fieldsToValidate) {
          const error = await validateFieldGeneralDetails(field, options);
          if (error) {
            return apiResponseHandler.errorResponse(
              null,
              req,
              res,
              error,
              400,
              null,
            );
          }
        }
      } else {
        fieldsToValidate = [
          {
            field: "name",
            options: {
              type: "string",
              maxLength: 50,
              unique: true,
              required: true,
            },
          },
          {
            field: "number",
            options: {
              type: "string",
              maxLength: 15,
              unique: true,
              required: true,
            },
          },
          {
            field: "description",
            options: { type: "string", maxLength: 1000 },
          },
          {
            field: "department",
            options: {
              required: true,
              checkExists: departmentManager.checkExistingDepartment,
            },
          },
          {
            field: "businessUnit",
            options: {
              checkExists: businessUnitManager.checkExistingBusinessUnit,
            },
          },
          // {
          //   field: "category",
          //   options: {
          //     checkExists: assetCategoryManager.checkExistingAssetCategory,
          //   },
          // },
          // CR0001
          {
            field: "category",
            options: { type: "string" },
          },
          //   {
          //     field: "criticalityLevel",
          //     options: {
          //       enumValues: Object.values(
          //         assetConstant.generalDetails.criticalityLevel,
          //       ),
          //     },
          //   },
          // CR0001
          {
            field: "criticalityLevel",
            options: { type: "string" },
          },
          {
            field: "criticalityLevelId",
            options: { type: "string" },
          },
          //   {
          //     field: "runningMode",
          //     options: {
          //       enumValues: Object.values(
          //         assetConstant.generalDetails.runningMode,
          //       ),
          //     },
          //   },
          {
            field: "runningMode",
            options: { type: "string" },
          },
          {
            field: "runningModeId",
            options: { type: "string" },
          },
          //   {
          //     field: "functionalArea",
          //     options: {
          //       enumValues: Object.values(
          //         assetConstant.generalDetails.functionalArea,
          //       ),
          //     },
          //   },
          {
            field: "functionalArea",
            options: { type: "string" },
          },
          {
            field: "functionalAreaId",
            options: { type: "string" },
          },
          {
            field: "owner",
            options: {
              required: true,
              checkExists: (userId) =>
                userManager.getUser(req, userId, "_id", ""),
            },
          },
        ];

        for (const { field, options } of fieldsToValidate) {
          const error = await validateFieldGeneralDetails(field, options);
          if (error) {
            return apiResponseHandler.errorResponse(
              null,
              req,
              res,
              error,
              400,
              null,
            );
          }
        }
      }
    }

    if (specifications) {
      req.assetUpdateObject.specifications = {};
      if (
        req.assetObj.specifications
        // && !req.assetObj.specifications.manufacturingDetails && !req.assetObj.specifications.calibrationDetails && !req.assetObj.specifications.hazardousAreaDetails
      ) {
        req.assetUpdateObject.specifications = req.assetObj.specifications;

        if (specifications.manufacturingDetails) {
          fieldsToValidate = [
            {
              field: ["manufacturingDetails", "type"],
              options: {
                enumValues: Object.values(
                  assetConstant.specifications.manufacturingDetails.type,
                ),
              },
            },
            {
              field: ["manufacturingDetails", "make"],
              options: { type: "string", maxLength: 50 },
            },
            {
              field: ["manufacturingDetails", "model"],
              options: { type: "string", maxLength: 50 },
            },
            {
              field: ["manufacturingDetails", "serialNumber"],
              options: { type: "string", maxLength: 15 },
            },
            {
              field: ["manufacturingDetails", "installationDate"],
              options: { isDate: true },
            },
            {
              field: ["manufacturingDetails", "serviceLiquid"],
              options: { type: "string", maxLength: 50 },
            },
            {
              field: ["manufacturingDetails", "manufacturer"],
              options: { type: "string", maxLength: 50 },
            },
          ];
          for (const { field, options } of fieldsToValidate) {
            const error = await validateFieldSpecifications(field, options);
            if (error) {
              return apiResponseHandler.errorResponse(
                null,
                req,
                res,
                error,
                400,
                null,
              );
            }
          }
        }

        if (specifications.hazardousAreaDetails) {
          fieldsToValidate = [
            {
              field: ["hazardousAreaDetails", "zoneClassification"],
              options: { type: "string", maxLength: 3 },
            },
            {
              field: ["hazardousAreaDetails", "gasGroup"],
              options: { type: "string", maxLength: 3 },
            },
            {
              field: ["hazardousAreaDetails", "temperatureClassification"],
              options: { type: "string", maxLength: 3 },
            },
          ];
          for (const { field, options } of fieldsToValidate) {
            const error = await validateFieldSpecifications(field, options);
            if (error) {
              return apiResponseHandler.errorResponse(
                null,
                req,
                res,
                error,
                400,
                null,
              );
            }
          }
        }

        if (specifications.warrantyDetails) {
          fieldsToValidate = [
            {
              field: ["warrantyDetails", "isWarrantyIncluded"],
              options: { type: "boolean" },
            },
            {
              field: ["warrantyDetails", "supplierName"],
              options: { type: "string", maxLength: 50 },
            },
            {
              field: ["warrantyDetails", "supplierEmail"],
              options: { type: "string", maxLength: 320, validateEmail: true },
            },
            {
              field: ["warrantyDetails", "warrantyPeriod", "id"],
              options: { type: "string" },
            },
            {
              field: ["warrantyDetails", "warrantyPeriod", "value"],
              options: {
                type: "number",
                maxValue: 999,
                maxLength: 3,
                minValue: -999,
              },
            },
            // CR0001
            {
              field: ["warrantyDetails", "warrantyPeriod", "type"],
                options: {
                  enumValues: Object.values(
                    assetConstant.specifications.warrantyDetails.warrantyPeriod
                      .type,
                  ),
                },
              // options: { type: "string" },
            },
            {
              field: ["warrantyDetails", "warrantyEndDate"],
              options: { isDate: true },
            },
            {
              field: ["warrantyDetails", "termsAndConditions"],
              options: {
                validateFile: true,
                setToNull: true,
              },
            },
          ];

          for (const { field, options } of fieldsToValidate) {
            const error = await validateFieldSpecifications(field, options);
            if (error) {
              return apiResponseHandler.errorResponse(
                null,
                req,
                res,
                error,
                400,
                null,
              );
            }
          }
        }

        if (specifications.calibrationDetails) {
          fieldsToValidate = [
            {
              field: ["calibrationDetails", "lastCalibrationDate"],
              options: { isDate: true },
            },
            {
              field: ["calibrationDetails", "calibrationCycle", "id"],
              options: {
                type: "string",
              },
            },
            {
              field: ["calibrationDetails", "calibrationCycle", "value"],
              options: {
                type: "string",
                maxLength: 3,
                alphanumeric: true,
              },
            },
            // CR0001
            {
              field: ["calibrationDetails", "calibrationCycle", "type"],
                options: {
                  enumValues: Object.values(
                    assetConstant.specifications.calibrationDetails
                      .calibrationCycle.type,
                  ),
                },
              // options: { type: "string" },
            },
            {
              field: ["calibrationDetails", "corrosionCheckDate"],
              options: { isDate: true },
            },
            {
              field: ["calibrationDetails", "corrosionCycle", "id"],
              options: {
                type: "string",
              },
            },
            {
              field: ["calibrationDetails", "corrosionCycle", "value"],
              options: {
                type: "string",
                maxLength: 3,
                alphanumeric: true,
              },
            },
            // CR0001
            {
              field: ["calibrationDetails", "corrosionCycle", "type"],
                options: {
                  enumValues: Object.values(
                    assetConstant.specifications.calibrationDetails.corrosionCycle
                      .type,
                  ),
                },
              // options: { type: "string" },
            },
            {
              field: ["calibrationDetails", "designThickness", "id"],
              options: {
                type: "string",
              },
            },
            {
              field: ["calibrationDetails", "designThickness", "value"],
              options: {
                type: "string",
                maxLength: 3,
                alphanumeric: true,
              },
            },
            // CR0001
            {
              field: ["calibrationDetails", "designThickness", "type"],
                options: {
                  enumValues: Object.values(
                    assetConstant.specifications.calibrationDetails
                      .designThickness.type,
                  ),
                  // required: !req.assetObj.specifications.calibrationDetails.designThickness?.type
                },
              // options: {
              //   type: "string",
              // },
            },
            {
              field: ["calibrationDetails", "allowableThickness", "id"],
              options: { type: "string" },
            },
            {
              field: ["calibrationDetails", "allowableThickness", "value"],
              options: {
                type: "number",
                maxValue: 999,
                // required: !req.assetObj.specifications.calibrationDetails.allowableThickness?.value
              },
            },
            // CR0001
            {
              field: ["calibrationDetails", "allowableThickness", "type"],
                options: {
                  enumValues: Object.values(
                    assetConstant.specifications.calibrationDetails
                      .allowableThickness.type,
                  ),
                  // required: !req.assetObj.specifications.calibrationDetails.allowableThickness?.type
                },
              // options: { type: "string" },
            },
            {
              field: ["calibrationDetails", "lastAuditDate"],
              options: {
                isDate: true,
                // required: !req.assetObj.specifications.calibrationDetails.lastAuditDate
              },
            },
            {
              field: ["calibrationDetails", "meanTimeToRepair"],
              options: {
                type: "number",
                maxValue: 999,
                // required: !req.assetObj.specifications.calibrationDetails.meanTimeToRepair
              },
            },
            {
              field: ["calibrationDetails", "meanTimeBetweenFailures"],
              options: {
                type: "number",
                maxValue: 999,
                // required: !req.assetObj.specifications.calibrationDetails.meanTimeBetweenFailures
              },
            },
          ];

          for (const { field, options } of fieldsToValidate) {
            const error = await validateFieldSpecifications(field, options);
            if (error) {
              return apiResponseHandler.errorResponse(
                null,
                req,
                res,
                error,
                400,
                null,
              );
            }
          }
        }
      }
      // else {
      // 	// console.log("specifications", specifications);

      // 	fieldsToValidate = [
      // 		{
      // 			field: ["manufacturingDetails", "type"],
      // 			options: {
      // 				enumValues: Object.values(assetConstant.specifications.manufacturingDetails.type),
      // 				// required: true
      // 			}
      // 		}
      // 	];
      // 	for (const { field, options } of fieldsToValidate) {
      // 		const error = await validateFieldSpecifications(field, options);
      // 		if (error) {
      // 			return apiResponseHandler.errorResponse(null, req, res, error, 400, null);
      // 		}
      // 	}

      // 	// if (
      // 	// 	specifications.manufacturingDetails?.type ===
      // 	// 	assetConstant.specifications.manufacturingDetails.type.StandardAsset
      // 	// ) {
      // 	// 	fieldsToValidate = [
      // 	// 		{ field: ["manufacturingDetails", "make"], options: { type: "string", maxLength: 50, required: true } },
      // 	// 		{ field: ["manufacturingDetails", "model"], options: { type: "string", maxLength: 50, required: true } },
      // 	// 		{
      // 	// 			field: ["manufacturingDetails", "serialNumber"],
      // 	// 			options: { type: "string", maxLength: 15, required: true }
      // 	// 		},
      // 	// 		{ field: ["manufacturingDetails", "manufacturer"], options: { type: "string", maxLength: 50 } },
      // 	// 		{ field: ["manufacturingDetails", "installationDate"], options: { isDate: true, required: true } },
      // 	// 		{
      // 	// 			field: ["manufacturingDetails", "serviceLiquid"],
      // 	// 			options: { type: "string", maxLength: 50, required: true }
      // 	// 		}
      // 	// 	];

      // 	// 	for (const { field, options } of fieldsToValidate) {
      // 	// 		const error = await validateFieldSpecifications(field, options);
      // 	// 		if (error) {
      // 	// 			return apiResponseHandler.errorResponse(null, req, res, error, 400, null);
      // 	// 		}
      // 	// 	}
      // 	// } else if (
      // 	// 	specifications.manufacturingDetails?.type ===
      // 	// 	assetConstant.specifications.manufacturingDetails.type.FabricatedAsset
      // 	// ) {
      // 	// 	fieldsToValidate = [
      // 	// 		{ field: ["manufacturingDetails", "make"], options: { type: "string", maxLength: 50 } },
      // 	// 		{ field: ["manufacturingDetails", "model"], options: { type: "string", maxLength: 50 } },
      // 	// 		{ field: ["manufacturingDetails", "serialNumber"], options: { type: "string", maxLength: 15 } },
      // 	// 		{
      // 	// 			field: ["manufacturingDetails", "manufacturer"],
      // 	// 			options: { type: "string", maxLength: 50 }
      // 	// 		},
      // 	// 		{ field: ["manufacturingDetails", "installationDate"], options: { isDate: true } },
      // 	// 		{ field: ["manufacturingDetails", "serviceLiquid"], options: { type: "string", maxLength: 50 } }
      // 	// 	];

      // 	// 	for (const { field, options } of fieldsToValidate) {
      // 	// 		const error = await validateFieldSpecifications(field, options);
      // 	// 		if (error) {
      // 	// 			return apiResponseHandler.errorResponse(null, req, res, error, 400, null);
      // 	// 		}
      // 	// 	}
      // 	// }

      // 	if (
      // 		specifications.manufacturingDetails?.type){
      // 	fieldsToValidate = [
      // 		{ field: ["manufacturingDetails", "make"], options: { type: "string", maxLength: 50 } },
      // 		{ field: ["manufacturingDetails", "model"], options: { type: "string", maxLength: 50 } },
      // 		{ field: ["manufacturingDetails", "serialNumber"], options: { type: "string", maxLength: 15 } },
      // 		{
      // 			field: ["manufacturingDetails", "manufacturer"],
      // 			options: { type: "string", maxLength: 50 }
      // 		},
      // 		{ field: ["manufacturingDetails", "installationDate"], options: { isDate: true } },
      // 		{ field: ["manufacturingDetails", "serviceLiquid"], options: { type: "string", maxLength: 50 } }
      // 	];

      // 	for (const { field, options } of fieldsToValidate) {
      // 		const error = await validateFieldSpecifications(field, options);
      // 		if (error) {
      // 			return apiResponseHandler.errorResponse(null, req, res, error, 400, null);
      // 		}
      // 	}
      // }

      // 	fieldsToValidate = [
      // 		{ field: ["hazardousAreaDetails", "zoneClassification"], options: { type: "string", maxLength: 3 } },
      // 		{ field: ["hazardousAreaDetails", "gasGroup"], options: { type: "string", maxLength: 3 } },
      // 		{ field: ["hazardousAreaDetails", "temperatureClassification"], options: { type: "string", maxLength: 3 } },
      // 		{ field: ["warrantyDetails", "isWarrantyIncluded"], options: { type: "boolean" } }
      // 	];

      // 	for (const { field, options } of fieldsToValidate) {
      // 		const error = await validateFieldSpecifications(field, options);
      // 		if (error) {
      // 			return apiResponseHandler.errorResponse(null, req, res, error, 400, null);
      // 		}
      // 	}

      // 	// if (specifications.warrantyDetails?.isWarrantyIncluded) {
      // 	// 	fieldsToValidate = [
      // 	// 		{
      // 	// 			field: ["warrantyDetails", "supplierName"],
      // 	// 			options: {
      // 	// 				type: "string",
      // 	// 				maxLength: 50,
      // 	// 				// required: !req.assetObj.specifications.warrantyDetails.supplierName
      // 	// 			}
      // 	// 		},
      // 	// 		{
      // 	// 			field: ["warrantyDetails", "supplierEmail"],
      // 	// 			options: {
      // 	// 				type: "string",
      // 	// 				maxLength: 320,
      // 	// 				// required: !req.assetObj.specifications.warrantyDetails.supplierEmail,
      // 	// 				validateEmail: true
      // 	// 			}
      // 	// 		},
      // 	// 		{
      // 	// 			field: ["warrantyDetails", "warrantyPeriod", "value"],
      // 	// 			options: {
      // 	// 				type: "number",
      // 	// 				maxValue: 999,
      // 	// 				maxLength: 3,
      // 	// 				minValue: -999,
      // 	// 				// required: !req.assetObj.specifications.warrantyDetails.warrantyPeriod?.value
      // 	// 			}
      // 	// 		},
      // 	// 		{
      // 	// 			field: ["warrantyDetails", "warrantyPeriod", "type"],
      // 	// 			options: {
      // 	// 				enumValues: Object.values(assetConstant.specifications.warrantyDetails.warrantyPeriod.type),
      // 	// 				// required: !req.assetObj.specifications.warrantyDetails.warrantyPeriod?.type
      // 	// 			}
      // 	// 		},
      // 	// 		{
      // 	// 			field: ["warrantyDetails", "warrantyEndDate"],
      // 	// 			options: { isDate: true,
      // 	// 				// required: !req.assetObj.specifications.warrantyDetails.warrantyEndDate
      // 	// 			}
      // 	// 		},
      // 	// 		{
      // 	// 			field: ["warrantyDetails", "termsAndConditions"],
      // 	// 			options: {
      // 	// 				validateFile: true
      // 	// 			}
      // 	// 		}
      // 	// 	];

      // 	// 	for (const { field, options } of fieldsToValidate) {
      // 	// 		const error = await validateFieldSpecifications(field, options);
      // 	// 		if (error) {
      // 	// 			return apiResponseHandler.errorResponse(null, req, res, error, 400, null);
      // 	// 		}
      // 	// 	}
      // 	// }

      // 	fieldsToValidate = [
      // 		{ field: ["calibrationDetails", "lastCalibrationDate"], options: { isDate: true } },
      // 		{
      // 			field: ["calibrationDetails", "calibrationCycle", "value"],
      // 			options: { type: "string", maxLength: 3, alphanumeric: true }
      // 		},
      // 		{
      // 			field: ["calibrationDetails", "calibrationCycle", "type"],
      // 			options: {
      // 				enumValues: Object.values(assetConstant.specifications.calibrationDetails.calibrationCycle.type)
      // 			}
      // 		},
      // 		{ field: ["calibrationDetails", "corrosionCheckDate"], options: { isDate: true } },
      // 		{
      // 			field: ["calibrationDetails", "corrosionCycle", "value"],
      // 			options: { type: "string", maxLength: 3, alphanumeric: true }
      // 		},
      // 		{
      // 			field: ["calibrationDetails", "corrosionCycle", "type"],
      // 			options: { enumValues: Object.values(assetConstant.specifications.calibrationDetails.corrosionCycle.type) }
      // 		},
      // 		{
      // 			field: ["calibrationDetails", "designThickness", "value"],
      // 			options: { type: "string", maxLength: 3, alphanumeric: true }
      // 		},
      // 		{
      // 			field: ["calibrationDetails", "designThickness", "type"],
      // 			options: { enumValues: Object.values(assetConstant.specifications.calibrationDetails.designThickness.type) }
      // 		},
      // 		{ field: ["calibrationDetails", "allowableThickness", "value"], options: { type: "number", maxValue: 999 } },
      // 		{
      // 			field: ["calibrationDetails", "allowableThickness", "type"],
      // 			options: {
      // 				enumValues: Object.values(assetConstant.specifications.calibrationDetails.allowableThickness.type)
      // 			}
      // 		},
      // 		{ field: ["calibrationDetails", "meanTimeToRepair"], options: { type: "number", maxValue: 999 } },
      // 		{ field: ["calibrationDetails", "meanTimeBetweenFailures"], options: { type: "number", maxValue: 999 } },
      // 		{ field: ["calibrationDetails", "lastAuditDate"], options: { isDate: true } }
      // 	];

      // 	for (const { field, options } of fieldsToValidate) {
      // 		const error = await validateFieldSpecifications(field, options);
      // 		if (error) {
      // 			return apiResponseHandler.errorResponse(null, req, res, error, 400, null);
      // 		}
      // 	}
      // }
    }

    if (locationAndHierarchyDetails) {
      req.assetUpdateObject.locationAndHierarchyDetails =
        req.assetObj.locationAndHierarchyDetails || {};

      fieldsToValidate = [
        {
          field: ["geographicalCoordinates", "latitude"],
          options: {
            type: "number",
            maxDigits: 6,
            required:
              !req.assetObj?.locationAndHierarchyDetails
                ?.geographicalCoordinates?.latitude,
          },
        },
        {
          field: ["geographicalCoordinates", "longitude"],
          options: {
            type: "number",
            maxDigits: 6,
            required:
              !req.assetObj?.locationAndHierarchyDetails
                ?.geographicalCoordinates?.longitude,
          },
        },
        {
          field: ["geographicalCoordinates", "elevation"],
          options: {
            type: "number",
            maxDigits: 6,
            required:
              !req.assetObj?.locationAndHierarchyDetails
                ?.geographicalCoordinates?.elevation,
          },
        },
        {
          field: ["hierarchy", "parent"],
          options: { checkExists: assetManager.checkExistingAsset },
        },
      ];

      for (const { field, options } of fieldsToValidate) {
        const error = await validateFieldLocationAndHierarchyDetails(
          field,
          options,
          req,
        );
        if (error) {
          return apiResponseHandler.errorResponse(
            null,
            req,
            res,
            error,
            400,
            null,
          );
        }
      }
    }

    if (images) {
      if (!Array.isArray(images)) {
        errors["images"] = "Images should be an array of IDs";
        return apiResponseHandler.errorResponse(
          null,
          req,
          res,
          "Failed! Images should be an array of IDs",
          400,
          errors,
        );
      }

      //inages max length is 6
      if (images.length > 6) {
        errors["images"] = "Images should not exceed 6 images";
        return apiResponseHandler.errorResponse(
          null,
          req,
          res,
          "Failed! Images should not exceed 6 images",
          400,
          errors,
        );
      }

      const uniqueImages = new Set();
      const duplicateImages = [];

      for (let i = 0; i < images.length; i++) {
        const imageId = images[i];

        if (typeof imageId !== "string") {
          return apiResponseHandler.errorResponse(
            null,
            req,
            res,
            "File ids must be a non-empty array of strings",
            400,
            null,
          );
        }

        // Check for duplicate permission IDs
        if (uniqueImages.has(imageId)) {
          duplicateImages.push(imageId);
        } else {
          uniqueImages.add(imageId);
        }
      }

      if (duplicateImages.length > 0) {
        return apiResponseHandler.errorResponse(
          null,
          req,
          res,
          "Duplicate file ids are not allowed",
          400,
          {
            duplicateImages,
          },
        );
      }

      let validFileObjAndInvalidFileIds =
        await fileManager.returnValidFileObjAndInvalidFileIds(images);

      let invalidFileIds = validFileObjAndInvalidFileIds.invalidFileIds;

      let validFileObjs = validFileObjAndInvalidFileIds.validFileObj;

      if (invalidFileIds.length > 0) {
        return apiResponseHandler.errorResponse(
          null,
          req,
          res,
          "Failed! Invalid File ids",
          400,
          {
            invalidFileIds,
          },
        );
      }

      //iterate and check all module ids and module names is empty
      let invalidFiles = [];
      for (let i = 0; i < validFileObjs.length; i++) {
        let validFileObj = validFileObjs[i];
        if (
          (validFileObj.moduleName && validFileObj.moduleName !== "assets") ||
          (validFileObj.moduleId && validFileObj.moduleId !== req.asset)
        ) {
          invalidFiles.push(validFileObj._id);
        } else if (
          validFileObj.moduleId &&
          validFileObj.moduleId !== req.asset
        ) {
          invalidFiles.push(validFileObj._id);
        }
      }
      if (invalidFiles.length > 0) {
        return apiResponseHandler.errorResponse(
          null,
          req,
          res,
          "Failed! Invalid File ids",
          400,
          {
            invalidFiles,
          },
        );
      }
      req.assetUpdateObject.images = images;
    }

    if (Object.keys(errors).length > 0) {
      return apiResponseHandler.errorResponse(null, req, res, errors, 400);
    }

    next();
  } catch (error) {
    console.error("Error validating asset update:", error);
    return apiResponseHandler.errorResponse(
      error,
      req,
      res,
      "Internal Server Error",
      500,
    );
  }
};

const removeExistingFieldValueFromRequestBody = async (req, res, next) => {
  try {
    if (req.assetObj && req.body) {
      if (req.assetObj.generalDetails && req.body.generalDetails) {
        if (
          req.assetObj.generalDetails.name &&
          req.body.generalDetails.name &&
          req.assetObj.generalDetails.name === req.body.generalDetails.name
        ) {
          delete req.body.generalDetails.name;
        }
        if (
          req.assetObj.generalDetails.number &&
          req.body.generalDetails.number &&
          req.assetObj.generalDetails.number === req.body.generalDetails.number
        ) {
          delete req.body.generalDetails.number;
        }
      }
    }
    next();
  } catch (error) {
    console.error(
      "Error removing existing field value from request body:",
      error,
    );
    return apiResponseHandler.errorResponse(
      error,
      req,
      res,
      "Failed! Internal Server Error",
      500,
    );
  }
};

const validateAsset = async (req, res, next) => {
  // Check if assetId is in req.params
  if (req.params.asset && typeof req.params.asset === "string") {
    req.asset = req.params.asset;
  }
  // If not, check if assetId is in req.body
  else if (req.body.asset && typeof req.body.asset === "string") {
    req.asset = req.body.asset;
  } else if (req.query.asset && typeof req.query.asset === "string") {
    req.asset = req.query.asset;
  }
  // If assetId is not in req.params or req.body, return an error response
  else {
    return apiResponseHandler.errorResponse(
      null,
      req,
      res,
      "Asset id must be a non-empty string in req.params or req.body",
      400,
      null,
    );
  }
  let checkExistingAsset;
  let fetchByField = req.query.fetchByField;
  if (fetchByField) {
    let businessUnit = req.query.businessUnit;
    let department = req.query.department;

    if (fetchByField == "name") {
      checkExistingAsset = await assetManager.checkAssetByField(
        "generalDetails.name",
        req.asset,
        businessUnit,
        department,
      );
    } else if (fetchByField == "number") {
      // Check if the user with the given ID exists
      checkExistingAsset = await assetManager.checkAssetByField(
        "generalDetails.number",
        req.asset,
        businessUnit,
        department,
      );
    } else if (fetchByField == "serialNumber") {
      // Check if the user with the given ID exists
      checkExistingAsset = await assetManager.checkAssetByField(
        "specifications.manufacturingDetails.serialNumber",
        req.asset,
        businessUnit,
        department,
      );
    }
  } else {
    checkExistingAsset = await assetManager.checkExistingAsset(req.asset);
  }

  if (checkExistingAsset) {
    req.assetObj = checkExistingAsset;
    next();
  } else {
    return apiResponseHandler.errorResponse(
      null,
      req,
      res,
      "Failed! Asset does not exist",
      404,
      null,
    );
  }
};
//CR0013
const checkAssetDepartmentAccess = (req, res, next) => {
 
	if (req.assetObj) {
		const assetDepartmentId = req.assetObj.generalDetails.department.toString();

		if (req.department !== assetDepartmentId) {
			return apiResponseHandler.errorResponse(
				null,
				req,
				res,
				"Forbidden! You do not have access to this asset",
				403
			);
		}
	}

	else if (req.assets && Array.isArray(req.assets)) {
		for (const asset of req.assets) {
			const assetDepartmentId = asset.generalDetails.department.toString();

			if (req.department !== assetDepartmentId) {
				return apiResponseHandler.errorResponse(
					null,
					req,
					res,
					"Forbidden! You do not have access to one or more assets",
					403
				);
			}
		}
	}

	next();
};
// CR0013

const validateAssets = async (req, res, next) => {
  if (req.body.assets) {
    if (
      !req.body.assets ||
      !Array.isArray(req.body.assets) ||
      req.body.assets.length === 0
    ) {
      return apiResponseHandler.errorResponse(
        null,
        req,
        res,
        "Asset ids must be a non-empty array of strings",
        400,
        null,
      );
    }
    for (let i = 0; i < req.body.assets.length; i++) {
      if (typeof req.body.assets[i] !== "string") {
        return apiResponseHandler.errorResponse(
          null,
          req,
          res,
          "Asset ids must be a non-empty array of strings",
          400,
          null,
        );
      }
    }

    let assetData = await assetManager.returnInvalidAssetIds(req.body.assets);
    if (assetData.invalidAssetIds) {
      return apiResponseHandler.errorResponse(
        null,
        req,
        res,
        "Failed! Invalid Asset ids",
        400,
        {
          invalidAssetIds: assetData.invalidAssetIds,
        },
      );
    }
    req.assets = assetData.existingAssets;
    if (assetData.inValidAssetArray.length > 0) {
      return apiResponseHandler.errorResponse(
        null,
        req,
        res,
        "Failed! Invalid Asset ids",
        400,
        {
          invalidAssetIds: assetData.inValidAssetArray,
        },
      );
    } else {
      next();
    }
  } else {
    next();
  }
};

const validateUpdateStatusRequest = async (req, res, next) => {
  const requestBody = req.body;
  const errors = {};
  if (!req.body.status || typeof req.body.status !== "string") {
    return apiResponseHandler.errorResponse(
      null,
      req,
      res,
      "Status must be a non-empty string",
      400,
      null,
    );
  }
  req.assetUpdateObject = {
    updatedBy: req.userId,
  };

  if (!req.assetObj) {
    req.assetObj = await Assets.findOne({
      _id: req.params.asset,
      isDeleted: false,
    });
  }

  if (!req.assetObj) {
    return apiResponseHandler.errorResponse(
      null,
      req,
      res,
      "Asset not found",
      404,
    );
  }

  const validateFieldStatus = async (field, options) => {
    const { type, maxLength, unique, required, checkExists, enumValues } =
      options;
    const value = requestBody[field];

    if (required && !value) {
      errors[`${field}`] = `${field} is required`;
      return `Failed! ${field} is required`;
    }

    if (value) {
      if (type && typeof value !== type) {
        errors[`${field}`] = `${field} must be a ${type}`;
        return `Failed! ${field} must be a ${type}`;
      }

      if (maxLength && value.length > maxLength) {
        errors[`${field}`] =
          `${field} should not exceed ${maxLength} characters`;
        return `Failed! ${field} should not exceed ${maxLength} characters`;
      }

      if (unique) {
        const exists = await Assets.findOne({
          [`${field}`]: value,
          isDeleted: false,
        });
        if (exists) {
          errors[`${field}`] = `${field} already exists`;
          return `Failed! ${field} already exists in the server`;
        }
      }

      if (checkExists && !(await checkExists(value))) {
        errors[`${field}`] = `Invalid ${field}`;
        return `Failed! Invalid ${field}`;
      }

      if (enumValues && !enumValues.includes(value)) {
        errors[`${field}`] = `Invalid ${field}`;
        return `Failed! Invalid ${field}`;
      }

      req.assetUpdateObject[field] = value;
    }
  };

  let fieldsToValidate = [];

  req.assetUpdateObject.status = req.assetObj.status;
  fieldsToValidate = [
    {
      field: "status",
      options: {
        type: "string",
        required: true,
        enumValues: Object.values(assetConstant.status),
      },
    },
  ];

  for (const { field, options } of fieldsToValidate) {
    const error = await validateFieldStatus(field, options);
    if (error) {
      return apiResponseHandler.errorResponse(null, req, res, error, 400, null);
    }
  }

  next();
};

//START
//CR0008

//Excel file upload using multer
const xlsxStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
        const timestamp = Date.now();
        const originalName = file.originalname.replace(/\s+/g, "_");
        cb(null, `${timestamp}_${originalName}`);
    },
});

const xlsxMulter = multer({ storage: xlsxStorage });

const uploadXlsx = (req, res, next) => {
	xlsxMulter.single("file")(req, res, (err) => {
		if (err) {
			return apiResponseHandler.errorResponse(err, req, res, err.message, 400, null);
		}
		next();
	});
};

const validateXlsxFile = (req, res, next) => {
	if (!req.file) {
		return apiResponseHandler.errorResponse(null, req, res, "File not provided", 400, null);
	}
	const ext = path.extname(req.file.originalname).toLowerCase();
	if (ext !== ".xlsx" && ext !== ".xls") {
		fs.unlink(req.file.path, (err) => {
			if (err) console.error("Failed to delete invalid file:", err.message);
		});
		return apiResponseHandler.errorResponse(null, req, res, "Only .xlsx and .xls files are allowed", 400, null);
	}
	next();
};
//END
//Excel

const assetMiddleware = {
  validateCreateAssetRequest,
  validateUpdateRequest,
  removeExistingFieldValueFromRequestBody,
  validateUpdateStatusRequest,
  validateAsset,
  validateAssets,
  // validateAssets,//Excel //CR0008
	uploadXlsx,//Excel  //CR0008
	validateXlsxFile,//Excel  //CR0008,
  checkAssetDepartmentAccess //CR0013
};
module.exports = assetMiddleware;
