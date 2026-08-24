const apiResponseHandler = require("../../managers/common/apiResponseHandler_manager");
const workOrderManager = require("../../managers/internalManagers/maintenanceManagement/workOrder_manager");
const workOrderPrtRequiredManager = require("../../managers/internalManagers/maintenanceManagement/workOrderPartRequired_manager")
const workOrderPartRequired = require("../../models/mongoDB/maintenanceManagement/workOrderPartRequired_model");
const workOrderPartReplaced = require("../../models/mongoDB/maintenanceManagement/workOrderPartReplaced_model")
const workOrderPartReplacedManager = require("../../managers/internalManagers/maintenanceManagement/workOrderPartReplaced_manager")
const { mongoDbManager } = require("../../managers/dBManagers/index");
const { Spares } = require("../../models/mongoDB/spareManagement/spare_model");


const validatePartsRequiredBody = async (req, res, next) => {
  try {
    // Check for any of the fields in req.body
    const partsRequired = req.body.partsRequired;
    // || req.body.partsReplaced || req.body.toolsRequired || req.body.consumables;

    // If any of the fields exist, check if it's an array
    if (!partsRequired || !Array.isArray(partsRequired)) {
      return apiResponseHandler.errorResponse(
        null,
        req,
        res,
        "The partsRequired field must be an array of objects",
        400,
        null
      );
    }

    // Check if the array contains objects
    if (Array.isArray(partsRequired)) {
      const hasNonObject = partsRequired.some(
        (item) => typeof item !== "object" || item === null
      );

      if (hasNonObject) {
        return apiResponseHandler.errorResponse(
          null,
          req,
          res,
          "Each element in the array should be an object",
          400,
          null
        );
      }
    }

    // Proceed if no errors
    next();
  } catch (error) {
    throw error;
  }
};

const validatePartsReplacedBody = async (req, res, next) => {
  try {
    // Check for any of the fields in req.body
    const partsReplaced = req.body.partsReplaced;
    // || req.body.partsReplaced || req.body.toolsRequired || req.body.consumables;

    // If any of the fields exist, check if it's an array
    if (!partsReplaced || !Array.isArray(partsReplaced)) {
      return apiResponseHandler.errorResponse(
        null,
        req,
        res,
        "The partsReplaced field must be an array of objects",
        400,
        null
      );
    }

    // Check if the array contains objects
    if (Array.isArray(partsReplaced)) {
      const hasNonObject = partsReplaced.some(
        (item) => typeof item !== "object" || item === null
      );

      if (hasNonObject) {
        return apiResponseHandler.errorResponse(
          null,
          req,
          res,
          "Each element in the array should be an object",
          400,
          null
        );
      }
      const sparesIds = partsReplaced.map((spares) => spares.spare);
      const validSpares = await workOrderManager.getSpareOfWorkOrder(
        req.workOrder, req.businessUnit
      );
      
      if (validSpares.data.length > 0) {
        const validSpareMap = validSpares.data.reduce((map, spare) => {
          map[spare.id] = spare.quantity; // Map spare ID to its available quantity
          return map;
        }, {});
        const invalidSpareIds = sparesIds.filter(
          (spareId) => !validSpareMap[spareId]
        );
        // Find quantity errors
        const invalidQuantities = partsReplaced
        .filter((spare) => {
          // Ensure validSpareMap[spare.spare] exists and compare quantities
          return (
            validSpareMap[spare.spare] &&
            spare.quantity > validSpareMap[spare.spare]?.value
          );
        })
        .map((spare) => spare.quantity);
        if (invalidSpareIds.length > 0) {
          return apiResponseHandler.errorResponse(
            null,
            req,
            res,
            "Provide correct spareId(s) for work order.",
            400,
            { invalidSpares: invalidSpareIds }
          );
        }
        if (invalidQuantities.length > 0) {
          return apiResponseHandler.errorResponse(
            null,
            req,
            res,
            "Provide correct Quantity for Spares.",
            400,
            { invalidQuantities: invalidQuantities }
          );
        } else {
          return next();
        }
      }
    }

    // Proceed if no errors
    return next();
  } catch (error) {
    throw error;
  }
};

const validateToolsRequiredBody = async (req, res, next) => {
  try {
    // Check for any of the fields in req.body
    const toolsRequired = req.body.toolsRequired;
    // || req.body.partsReplaced || req.body.toolsRequired || req.body.consumables;

    // If any of the fields exist, check if it's an array
    if (!toolsRequired || !Array.isArray(toolsRequired)) {
      return apiResponseHandler.errorResponse(
        null,
        req,
        res,
        "The toolsRequired field must be an array of objects",
        400,
        null
      );
    }

    // Check if the array contains objects
    if (Array.isArray(toolsRequired)) {
      const hasNonObject = toolsRequired.some(
        (item) => typeof item !== "object" || item === null
      );

      if (hasNonObject) {
        return apiResponseHandler.errorResponse(
          null,
          req,
          res,
          "Each element in the array should be an object",
          400,
          null
        );
      }
    }

    // Proceed if no errors
    next();
  } catch (error) {
    throw error;
  }
};

const validateConsumablesBody = async (req, res, next) => {
  try {
    // Check for any of the fields in req.body
    const consumables = req.body.consumables;
    // || req.body.partsReplaced || req.body.toolsRequired || req.body.consumables;

    // If any of the fields exist, check if it's an array
    if (!consumables || !Array.isArray(consumables)) {
      return apiResponseHandler.errorResponse(
        null,
        req,
        res,
        "The consumables field must be an array of objects",
        400,
        null
      );
    }

    // Check if the array contains objects
    if (Array.isArray(consumables)) {
      const hasNonObject = consumables.some(
        (item) => typeof item !== "object" || item === null
      );

      if (hasNonObject) {
        return apiResponseHandler.errorResponse(
          null,
          req,
          res,
          "Each element in the array should be an object",
          400,
          null
        );
      }
    }

    // Proceed if no errors
    next();
  } catch (error) {
    throw error;
  }
};

const verifySpareRequired = async (req, res, next) => {
  if(req.params.spareRequestedId || req.body.spareRequestedId){
    if (req.params.spareRequestedId && typeof req.params.spareRequestedId === "string") {
    req.spareRequested = req.params.spareRequestedId;
  } else if (req.body.spareRequestedId && typeof req.body.spareRequestedId === "string") {
    req.spareRequested = req.body.spareRequestedId;
  } else {
    return apiResponseHandler.errorResponse(
      null,
      req,
      res,
      "SpareRequestedId must be a non-empty string in req.params or req.body",
      400,
      null
    );
  }
  let existingSpare;
  existingSpare = await workOrderPrtRequiredManager.checkExistingSpareRequired({
    _id: req.spareRequested,
    isActive: true,
  });
  if (existingSpare) {
    req.spareRequestedObj = existingSpare;
    return next();
  } else {
    return apiResponseHandler.errorResponse(
      null,
      req,
      res,
      "Failed! SpareRequestedId does not exist",
      404,
      null
    );
  }
}
else{
  return next();
}
};


const verifySpareReplaced = async (req, res, next) => {
  if(req.params.spareReplacedId || req.body.spareReplacedId){
  if (req.params.spareReplacedId && typeof req.params.spareReplacedId === "string") {
    req.spareReplaced = req.params.spareReplacedId;
  } else if (req.body.spareReplacedId && typeof req.body.spareReplacedId === "string") {
    req.spareReplaced = req.body.spareReplacedId;
  } else {
    return apiResponseHandler.errorResponse(
      null,
      req,
      res,
      "spareReplaced must be a non-empty string in req.params or req.body",
      400,
      null
    );
  }
  let existingSpare;
  console.log( req.spareReplaced, " req.spareReplaced")
  existingSpare = await workOrderPartReplacedManager.checkExistingSpareReplaced({
    _id: req.spareReplaced,
    isActive: true,
  });

  if (existingSpare) {
    req.spareReplacedObj = existingSpare;
    return next();
  } else {
    return apiResponseHandler.errorResponse(
      null,
      req,
      res,
      "Failed! Spare Replaced Id does not exist",
      404,
      null
    );
  }    
  }else{
    return next();
  }
};



const validateStatusForApprovalAndRejectSpareRequired = async (req, res, next) => {
  try {
    const result = await mongoDbManager.findOne(workOrderPartRequired, { _id: req.spareRequested });
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

// const validateReplacedQuantityAndSpare = async (req, res, next) => {
// try{
//   if(req.spareRequested){
//     const spareRequested = await mongoDbManager.findOne(workOrderPartRequired,{_id:req.spareRequested, spare:req.spare, isActive: true})
//     if(spareRequested){
//       if(spareRequested.requestedQuantity <= spareRequested.utilisedCount){
//         return apiResponseHandler.errorResponse(
//         null,
//         req,
//         res,
//         "Cant replaceQuantity. Please Request and comeback",
//         400,
//         null
//         );
//       }
//       if(spareRequested.requestedQuantity < req.body.replacedQuantity){
//         return apiResponseHandler.errorResponse(
//           null,
//           req,
//           res,
//           "Please Provide the replacedQuantity lesser than requestedQuantity.",
//           400,
//           null
//         );
//       }
//      return next();
//     }
//     else{
//       return apiResponseHandler.errorResponse(
//           null,
//           req,
//           res,
//           "Spare doesnt exists for this spareRequestedId.",
//           400,
//           null
//         );
//     }
//   }
//   else{
//     return next();
//   }
// }catch(error){
//    next(error);
//  }
// }

const validateReplacedQuantityAndSpare = async (req, res, next) => {
  try {
    if (req.spareRequested) {
      const spareRequested = await mongoDbManager.findOne(
        workOrderPartRequired,
        { _id: req.spareRequested, spare: req.spare, isActive: true }
      );

      if (spareRequested) {
        const { requestedQuantity, utilisedCount } = spareRequested;
        const replacedQuantity = req.body.replacedQuantity;

        // Replaced quantity should not exceed requested quantity
        if (requestedQuantity < replacedQuantity) {
          return apiResponseHandler.errorResponse(
            null,
            req,
            res,
            "Please provide the replacedQuantity lesser than requestedQuantity.",
            400,
            null
          );
        }

        // Utilised + new replaced should not exceed requested
        if (utilisedCount + replacedQuantity > requestedQuantity) {
          return apiResponseHandler.errorResponse(
            null,
            req,
            res,
            "Total utilised quantity cannot exceed requestedQuantity.",
            400,
            null
          );
        }

        return next();
      } else {
        return apiResponseHandler.errorResponse(
          null,
          req,
          res,
          "Spare doesn't exist for this spareRequestedId.",
          400,
          null
        );
      }
    } else {
      return next();
    }
  } catch (error) {
    next(error);
  }
};



const validateSpareQuantityForRequest = async (req, res, next) => {
  try{
    if(req.spare){
      const spareObj = await mongoDbManager.findOne(Spares, {_id:req.spare, isActive: true});
      if(spareObj.quantity === 0){
        return apiResponseHandler.errorResponse(
        null,
        req,
        res,
        "The Quantity of spare is 0, cant request spare.",
        400,
        null
        );
      }
      if(spareObj.quantity < req.body.requestedQuantity){
        return apiResponseHandler.errorResponse(
          null,
          req,
          res,
          "Please Provide the requestedQuantity lesser than Quantity.",
          400,
          null
        );
      }
      return next();
    }
    else{
      return next();
    }
  }catch(error){
    next(error);
  }
}

const validateSpareQuamtityForRequestApproval = async (req, res, next) => {
  try {
    if (req.spareRequestedObj) {
      const { spare, requestedQuantity } = req.spareRequestedObj;
      const spareDoc = await mongoDbManager.findOne(Spares, {
        _id: spare,
        isActive: true,
      });
      if (!spareDoc) {
        return apiResponseHandler.errorResponse(
          null,
          req,
          res,
          "Spare not found.",
          400,
          null
        );
      }
      req.spareObj = spareDoc;
      const currentQuantity =
        typeof spareDoc.quantity === "number"
          ? spareDoc.quantity
          : parseFloat(spareDoc.quantity);
      if (currentQuantity <= 0) {
        return apiResponseHandler.errorResponse(
          null,
          req,
          res,
          "The Quantity of spare is out of stock.",
          400,
          null
        );
      }
      else if (requestedQuantity > currentQuantity) {
        return apiResponseHandler.errorResponse(
          null,
          req,
          res,
          `Requested quantity (${requestedQuantity}) exceeds available quantity (${currentQuantity}).`,
          400,
          null
        );
      }
      else{
        return next();
      }
    } else {
      return next();
    }
  } catch (error) {
    next(error);
  }
};

const validateReturnQuantity = async (req, res, next) => {
  try{
    if(req.spareReplaced){
    const spareReplaced = await mongoDbManager.findOne(workOrderPartReplaced,{_id:req.spareReplaced, isActive: true})
    if(spareReplaced.replacedQuantity === 0){
      return apiResponseHandler.errorResponse(
        null,
        req,
        res,
        "The replaced Quantity is 0. cant return the quantity",
        400,
        null
        );
    }
      if(spareReplaced.replacedQuantity < req.body.quantityToReturn){
        return apiResponseHandler.errorResponse(
        null,
        req,
        res,
        "The quantity to return cant be greater than the available replacedQuantity",
        400,
        null
        );
      }
      return next();
    }
  }catch(error){
    next(error);
  }
}

const workOrderPartsMiddleware = {
  validatePartsRequiredBody,
  validatePartsReplacedBody,
  validateToolsRequiredBody,
  validateConsumablesBody,
  verifySpareRequired,
  validateStatusForApprovalAndRejectSpareRequired,
  verifySpareReplaced,
  validateReplacedQuantityAndSpare,
  validateSpareQuantityForRequest,
  validateReturnQuantity,
  validateSpareQuamtityForRequestApproval,
};

module.exports = workOrderPartsMiddleware;
