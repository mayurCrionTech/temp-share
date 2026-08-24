/*
date              cr/qid      comments
22-march-2026     CR0001      Static dropdown options replaced by Dynamic + ids added
*/

const apiResponseHandler = require("../../managers/common/apiResponseHandler_manager");
const spareManager = require("../../managers/internalManagers/spareManagement/spare_manager");
const {
  statusEnum,
  quantityEnum,
  Spares
} = require("../../models/mongoDB/spareManagement/spare_model");
const {
  quantityStockEnum,
  SpareStock
} = require("../../models/mongoDB/spareManagement/spareStock_model");
const spareStockManager = require("../../managers/internalManagers/spareManagement/spareStock_manager");
const { mongoDbManager } = require("../../managers/dBManagers");
const userManager = require("../../managers/internalManagers/userManagement/user_manager");
const { default: mongoose } = require("mongoose");
const fileManager = require("../../managers/internalManagers/fileSystem/fileSystem_manager");


const validateField = async (field, value, options) => {
  const {
    type,
    maxLength,
    minLength,
    unique,
    required,
    checkExists,
    enumValues,
    alphanumeric,
    itemType,
    itemMaxLength,
    itemMinLength,
  } = options;

  if (required && (value === undefined || value === null || value === "")) {
    return `Failed! ${field} is required`;
  }

  if (value !== undefined && value !== null) {
    if (type === "array") {
      if (!Array.isArray(value)) {
        return `Failed! ${field} must be an array`;
      }

      if (maxLength && value.length > maxLength) {
        return `Failed! ${field} should not contain more than ${maxLength} items`;
      }

      if (minLength && value.length < minLength) {
        return `Failed! ${field} should contain at least ${minLength} items`;
      }

      if (itemType || itemMaxLength || itemMinLength) {
        for (const [index, item] of value.entries()) {
          if (itemType && typeof item !== itemType) {
            return `Failed! ${field}[${index}] must be a ${itemType}`;
          }

          if (itemMaxLength && item.length > itemMaxLength) {
            return `Failed! ${field}[${index}] must not exceed ${itemMaxLength} characters`;
          }

          if (itemMinLength && item.length < itemMinLength) {
            return `Failed! ${field}[${index}] must be at least ${itemMinLength} characters`;
          }
        }
      }
    } else if (type && typeof value !== type) {
      return `Failed! ${field} must be a ${type}`;
    }

    if (type === "string") {
      if (maxLength && value.length > maxLength) {
        return `Failed! ${field} should not exceed ${maxLength} characters`;
      }

      if (minLength && value.length < minLength) {
        return `Failed! ${field} should be at least ${minLength} characters`;
      }
    }

    if (unique) {
      const exists = await Spares.findOne({
        [`${field}`]: value,
        isActive: true,
      });
      if (exists) {
        return `Failed! ${field} already exists in the server`;
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

const validateCreateSpareRequest = async (req, res, next) => {
  const {
    name,
    specification,
    description,
    partNumber,
    quantity,
    units,
    cost,
    expiryDate,
    minimumRequiredQuantity,
    approver,
    category,
    isSupplierDetails,
    supplierDetails,
  } = req.body;

  req.spareCreateObject = {
    name: name,
    specification,
    description,
    partNumber,
    quantity,
    units,
    // unitsId: req.body.unitsId, // CR0001
    cost,
    costUnits: req.body.costUnits, // CR0001
    costUnitsId: req.body.costUnitsId, // CR0001
    expiryDate,
    minimumRequiredQuantity,
    approver,
    category,
    isSupplierDetails,
    supplierDetails,
    images: req.body.images,
    businessUnit: req.businessUnit,
    createdBy: req.userId,
    updatedBy: req.userId,
  };

  if(req.query.isDraft === "true"){
    req.spareCreateObject.status = "draft"
    return next();
  }
  else{
    req.spareCreateObject.status = "pendingForApproval";
      const fieldsToValidate = [
        {
          field: "name",
          options: { type: "string", maxLength: 50, required: true },
        },
        { field: "description", options: { type: "string", maxLength: 500 } },
        {field:"specification", options:{type: "string", maxLength: 30, required: true}},
        { field: "partNumber", options: { type: "string", maxLength: 20 } },
        { field: "quantity", options: { type: "number", maxLength: 8, required: true } },
        {
          field: "minimumRequiredQuantity",
          options: { type: "number", maxLength: 8 , required: true},
        },
        {
          field: "units",
          options: { type: "string", enumValues: quantityEnum, required: true },
        },
        // CR0001
        // {
        //   field: "units",
        //   options: { type: "string" },
        // },
        // {
        //   field: "unitsId",
        //   options: { type: "string" },
        // },
        {field: "cost", options: {type: "number"}},
        {field: "costUnits", options: {type: "string"}},
        {field: "costUnitsId", options: {type: "string"}},
        {field:"expiryDate", options: {type:"string"}},
        { field:"approver", options: { type: "string", checkExists: userManager.checkExistingUser , required: true}},
        { field: "category", options: { type: "string", maxLength: 10 } },
      ];
    
      for (const { field, options } of fieldsToValidate) {
        const error = await validateField(
          field,
          req.body[field],
          options,
        );
        if (error) {
          return apiResponseHandler.errorResponse(null, req, res, error, 400, null);
        }
      }
      console.log("req.spareCreateObject", req.spareCreateObject)
      return next();
  }

};

const validateStatus = async (req, res, next) => {
  try {
    // const statusEnum = ["pendingForApproval", "approved", "draft", "resubmit"];
    const { status } = req.query;
    if (status && !statusEnum.includes(status)) {
      return apiResponseHandler.errorResponse(
        null,
        req,
        res,
        "Client Side Error",
        400,
        `Please Provide Correct Status`
      );
    }

    next();
  } catch (error) {
    console.error("Error in validateStatus middleware:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

const verifySpare = async (req, res, next) => {
  if(req.params.spareId || req.body.spareId){
  if (req.params.spareId && typeof req.params.spareId === "string") {
    req.spare = req.params.spareId;
  } else if (req.body.spareId && typeof req.body.spareId === "string") {
    req.spare = req.body.spareId;
  } else {
    return apiResponseHandler.errorResponse(
      null,
      req,
      res,
      "Spare id must be a non-empty string in req.params or req.body",
      400,
      null
    );
  }
  let existingSpare;
  let fetchByField = req.query.fetchByField;
  if (fetchByField == "name") {
    existingSpare = await spareManager.checkExistingSpare({
      name: req.spare,                                      //both name and specification in req.spare
      isActive: true,
    });
  } else {
    existingSpare = await spareManager.checkExistingSpare({
      _id: req.spare,
      isActive: true,
    }, req.spare);
  }
  if (existingSpare) {
    req.spareObj = existingSpare;
    return next();
  } else {
    return apiResponseHandler.errorResponse(
      null,
      req,
      res,
      "Failed! Spare does not exist",
      404,
      null
    );
  }  
} else{
  return next();
}
};

const verifyQuantity = async (req, res, next) => {
  if (req.params.quantityId && typeof req.params.quantityId === "string") {
    req.quantity = req.params.quantityId;
  } else if (req.body.quantityId && typeof req.body.quantityId === "string") {
    req.quantity = req.body.quantityId;
  } else {
    return apiResponseHandler.errorResponse(
      null,
      req,
      res,
      "Spare id must be a non-empty string in req.params or req.body",
      400,
      null
    );
  }
  let existingSpare;
  existingSpare = await spareStockManager.checkExistingSpareQuantity({
    _id: req.quantity,
    isActive: true,
  });
  if (existingSpare) {
    req.spareQuantityObj = existingSpare;
    return next();
  } else {
    return apiResponseHandler.errorResponse(
      null,
      req,
      res,
      "Failed! Spare Quantity does not exist",
      404,
      null
    );
  }
};

const verifyDuplicates = async (req, res, next) => {
  try {
    if((req.body.name || req.body.specification) && req.body.status !== "draft"){
      const existingSpare = await spareManager.checkExistingSpare({
        name: req.body.name || req.spareObj.name,
        specification: req.body.specification ||  req.spareObj.specification,
        isActive: true,
      });
      if (existingSpare) {
        const error = new Error(`Duplicate Spare Name : ${req.body.name}`);
        return apiResponseHandler.errorResponse(
          null,
          req,
          res,
          "Client Side Error",
          400,
          `Duplicate Spare Name : ${req.body.name}`
        );
      } else {
        return next();
      }
    }
    next();
  } catch (error) {
    next(error);
  }
};


const verifyAddQuantityRequest = async (req, res, next) => {
  try {
    const { quantity, units, cost, expiryDate } = req.body;

    req.addQuantityObject = {
      quantity,
      cost,
      units,
      // CR0001
      // unitsId: req.body.unitsId,        
      costUnits: req.body.costUnits,     
      costUnitsId: req.body.costUnitsId,
      expiryDate,
      spare: req.spare,
      status: "pendingForApproval",
      businessUnit: req.businessUnit,
      createdBy: req.userId,
      updatedBy: req.userId,
    };

    const fieldsToValidate = [
      {
        field: "quantity",
        options: { type: "number", maxLength: 8, required: true },
      },
      {
        field: "units",
        options: {
          type: "string",
          enumValues: quantityStockEnum,
          required: true,
        },
      },
      // CR0001
      // {
      //     field: "units",
      //     options: { type: "string" },
      //   },
      //   {
      //     field: "unitsId",
      //     options: { type: "string" },
      //   },
      { field: "cost", options: { type: "number", maxLength: 8 } },
      {field: "costUnits", options: {type: "string"}},
        {field: "costUnitsId", options: {type: "string"}},
      // {field: "expiryDate", options: {type: "Date"}},
    ];

    for (const { field, options } of fieldsToValidate) {
      const error = await validateField(field, req.body[field], options);
      if (error) {
        return apiResponseHandler.errorResponse(
          null,
          req,
          res,
          error,
          400,
          null
        );
      }
    }
    next();
  } catch (error) {
    next(error);
  }
};

const verifyUpdateQuantityRequest = async (req, res, next) => {
  try {
    const { quantity, units, cost, expiryDate } = req.body;

    req.updateQuantityObject = {
      quantity: quantity ?? req.spareQuantityObj.quantity,
      cost:cost ?? req.spareQuantityObj.cost,
      units: units ?? req.spareQuantityObj.units,
      expiryDate: expiryDate ?? req.spareQuantityObj.expiryDate,
      spare: req.spare,
      status: "pendingForApproval",
      businessUnit: req.businessUnit,
      createdBy: req.userId,
      updatedBy: req.userId,
    };

    const fieldsToValidate = [
      {
        field: "quantity",
        options: { type: "number", maxLength: 8 },
      },
      {
        field: "units",
        options: {
          type: "string",
          enumValues: quantityStockEnum,
        },
      },
      // CR0001
      // {
      //     field: "units",
      //     options: { type: "string" },
      //   },
      //   {
      //     field: "unitsId",
      //     options: { type: "string" },
      //   },
      { field: "cost", options: { type: "number", maxLength: 8 } },
      {field: "costUnits", options: {type: "string"}},
        {field: "costUnitsId", options: {type: "string"}},
      // {field: "expiryDate", options: {type: "Date"}},
    ];

    for (const { field, options } of fieldsToValidate) {
      const error = await validateField(field, req.body[field], options);
      if (error) {
        return apiResponseHandler.errorResponse(
          null,
          req,
          res,
          error,
          400,
          null
        );
      }
    }
    next();
  } catch (error) {
    next(error);
  }
};

const validateStatusForApprovalAndRejectQuantities = async (req, res, next) => {
  try {
    const result = await mongoDbManager.findOne(SpareStock, { _id: req.quantity });
    if(result.status == "pendingForApproval"){
        return next()
    }
    else{
        return apiResponseHandler.errorResponse(
      null,
      req,
      res,
      "Status should be pendingForApproval before approval.",
      400,
      null
    );
    }
  } catch (error) {
    next(error);
  }
};


const validateStatusForApprovalAndReject = async (req, res, next) => {
  try {
    const result = await mongoDbManager.findOne(Spares, { _id: req.spare });
    if(result.status == "pendingForApproval"){
        return next()
    }
    else{
        return apiResponseHandler.errorResponse(
      null,
      req,
      res,
      "Status should be pendingForApproval before approval.",
      400,
      null
    );
    }
  } catch (error) {
    next(error);
  }
};

const validateUpdateSpareRequest = async (req, res, next) => {
  const {  name,
    specification,
    description,
    partNumber,
    quantity,
    units,
    cost,
    expiryDate,
    minimumRequiredQuantity,
    approver,
    category,
    images,
    isSupplierDetails,
    supplierDetails, } = req.body;
  // req.spare = req.params.spare;
  // console.log("req.spare",req.spare)
  //   if (req.spare) {
  //       req.spareObj = await Spares.findById(req.spare);
  //       console.log(" req.spareObj",  req.spareObj)
  //   }
  // if (!req.spareObj) {
  //   return apiResponseHandler.errorResponse(null, req, res, "Spare not found", 404, null);
  // }


  req.spareUpdateObject = {
    name: name ?? req.spareObj.name,
    specification : specification ?? req.spareObj.specification,
    description: description ?? req.spareObj.description,
    partNumber: partNumber?? req.spareObj.description,
    quantity: quantity ?? req.spareObj.quantity,
    units: units ?? req.spareObj.units,
    // CR0001
    // unitsId: req.body.unitsId ?? req.spareObj.unitsId, 
    cost: cost ?? req.spareObj.cost, 
    costUnits: req.body.costUnits ?? req.spareObj.costUnits,
    costUnitsId: req.body.costUnitsId ?? req.spareObj.costUnitsId,
    expiryDate: expiryDate ?? req.spareObj.expiryDate,
    minimumRequiredQuantity: minimumRequiredQuantity ?? req.spareObj.minimumRequiredQuantity,
    images: images ?? req.spareObj.images,
    approver: approver ?? req.spareObj.approver,
    category: category ?? req.spareObj.category,
    status:"pendingForApproval",
    isSupplierDetails:isSupplierDetails ?? req.spareObj.isSupplierDetails,
    supplierDetails: supplierDetails ?? req.spareObj.supplierDetails,
    updatedBy: req.userId,
    updatedAt: Date.now(),
  };
if (req.spareObj.name !== name || req.spareObj.specification !== specification) {
  req.spareUpdateObject.name = name;
  req.spareUpdateObject.specification = specification;
}

const fieldsToValidate = [
        {
          field: "name",
          options: { type: "string", maxLength: 50},
        },
        { field: "description", options: { type: "string", maxLength: 500 } },
        {field:"specification", options:{type: "string"}},
        { field: "partNumber", options: { type: "string", maxLength: 20 } },
        { field: "quantity", options: { type: "number", maxLength: 8 } },
        {
          field: "minimumRequiredQuantity",
          options: { type: "number", maxLength: 8 , },
        },
        {
          field: "units",
          options: { type: "string", enumValues: quantityEnum },
        },
        // CR0001
        // {
        //   field: "units",
        //   options: { type: "string" },
        // },
        // {
        //   field: "unitsId",
        //   options: { type: "string" },
        // },
        { field:"approver", options: { type: "string", checkExists: userManager.checkExistingUser}},
        { field: "category", options: { type: "string", maxLength: 10 } },
      ];

  for (const { field, options } of fieldsToValidate) {

    const error = await validateField(field, req.body[field], options, req.businessUnit);
    if (error) {
      return apiResponseHandler.errorResponse(null, req, res, error, 400, null);
    }
  }
  next();
};

const verifySpares = async (req, res, next) => {
  // Validate request
  const spares = req.body.spareIds;

  if (!Array.isArray(spares) || spares.length === 0) {
    return apiResponseHandler.errorResponse(null, req,
      res,
      "Spares must be a non-empty array of objects with 'id' as a string property or strings",
      400,
      null
    );
  }
  req.spares = req.body.spareIds;
  try {
    const dataIds = spares.map((spare) => {
       if (typeof spare === "string") {
        return spare;
      } else {
        throw new Error(
          "Each spare must be a string"
        );
      }
    });

    const sparesData = await spareManager.returnInvalidSpares(dataIds);
    if (Array.isArray(sparesData)) {
      return apiResponseHandler.errorResponse(null, req,
        res,
        "Failed! Some spares do not exist",
        400,
        { "invalidSpares": sparesData }
      );
    }
    req.spareObjs = sparesData.existingSpares;
    if (sparesData.invalidSpareArray.length > 0) {
      return apiResponseHandler.errorResponse(null, req,
        res,
        "Failed! Some spares do not exist",
        400,
        { "invalidSpares": sparesData.invalidSpareArray }
      );
    }

    next();
  } catch (error) {
    // Handle unexpected errors
    console.error("Error occurred during spare validation:", error);
    return apiResponseHandler.errorResponse(error, req,
      res,
      error.message,
      500,
      null
    );
  }
};


const validateSpareImages = async (req, res, next) => {
  try {
    if (req.body.images) {
      for (let documentId of req.body.images) {
        if (documentId === null) {
          return;
        }
        if (!documentId) {
          return apiResponseHandler.errorResponse(
            null,
            req,
            res,
            `Failed! ImageId is required`,
            400,
            null
          );
        }
        if (!mongoose.Types.ObjectId.isValid(documentId)) {
          return apiResponseHandler.errorResponse(
            null,
            req,
            res,
            `Failed! ImageId is not a valid file id`,
            400,
            null
          );
        }

        let spareDocuments = await fileManager.getFile(
          documentId,
          "internal",
          req.businessUnit
        );
        if (!spareDocuments) {
          return apiResponseHandler.errorResponse(
            null,
            req,
            res,
            `Failed! Invalid Image File id`,
            400,
            null
          );
        }
        if (spareDocuments.moduleName || spareDocuments.moduleId) {
          if (
            spareDocuments.moduleName &&
            spareDocuments.moduleName !== "spares"
          ) {
            return apiResponseHandler.errorResponse(
              null,
              req,
              res,
              `Failed! Invalid Image. File id is not an spare file`,
              400,
              null
            );
          }
          if (
            spareDocuments.moduleId &&
            spareDocuments.moduleId !== req.spare
          ) {
            return apiResponseHandler.errorResponse(
              null,
              req,
              res,
              `Failed! Invalid Image. File id is not an spare file`,
              400,
              null
            );
          }
        }
        if(req.spare){
          const existingSpare = await spareManager.checkExistingSpare({
            _id:req.spare,
            images: { $in: [documentId] },
            isActive: true
          });
          if (existingSpare) {
            continue; // Skip this documentId and continue to the next one
          }
        }
      }
      return next();
    } else {
      return next();
    }
  } catch (error) {
    throw error;
  }
};



module.exports = {
  verifyDuplicates,
  validateStatus,
  verifySpare,
  verifyAddQuantityRequest,
  verifyQuantity,
  validateStatusForApprovalAndRejectQuantities,
  validateStatusForApprovalAndReject,
  validateCreateSpareRequest,
  validateUpdateSpareRequest,
  verifyUpdateQuantityRequest,
  verifySpares,
  validateSpareImages,

};

