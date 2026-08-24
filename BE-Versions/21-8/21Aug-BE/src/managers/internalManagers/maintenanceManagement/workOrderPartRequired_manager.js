const { mongoDbManager } = require("../../dBManagers/index");
const workOrderPartRequired = require("../../../models/mongoDB/maintenanceManagement/workOrderPartRequired_model");
const mongoose = require("mongoose");
const paginationHandler = require("../../common/paginationHandler_manager");
const{Spares} = require("../../../models/mongoDB/spareManagement/spare_model")
const {Assets} = require("../../../models/mongoDB/assetManagement/asset_model");
const Users = require("../../../models/mongoDB/userManagement/user_model.js");
const {
  fetchEngineerUserTypeByDepartment,
} = require("../../../utils/socket/socketUserHandler")
const dataConstructor = require("../../../managers/common/DataObjectConstructor_manager.js")
const {
  sendViaUserType, sendViaUserID
  } = require('../../../utils/socket/socketHandler.js');
const { constructSpareRequestTemplateData, sendSpareRequestEmail } = require("../../../utils/emailService/templates/spareRequestEmailTemplate.js");
const { constructLogSpareMinimumThresholdTemplateData, sendSpareMinimumLimitBreachEmail } = require("../../../utils/emailService/templates/spareMinimumThresholdEmailTemplate.js");
const { workOrders } = require("../../../models/mongoDB/maintenanceManagement/workOrder_model.js");


async function createWorkOrderPartRequired(workOrderPartRequiredObject) {
  try {
    const createdWorkOrderPartRequired = await mongoDbManager.insertOne(
      workOrderPartRequired,
      workOrderPartRequiredObject
    );
    const spareObj = await mongoDbManager.findOne(Spares, {
      _id: createdWorkOrderPartRequired.spare,
      isActive: true,
    });
    const approverObj = await mongoDbManager.findOne(Users, {
      _id: spareObj.approver,
      isDeleted: false,
    });
    const creatorUserObj = await mongoDbManager.findOne(Users, {
      _id: createdWorkOrderPartRequired.createdBy,
      isDeleted: false,
    });
    const workorderObj = await mongoDbManager.findOne(workOrders, {
      _id: createdWorkOrderPartRequired.workOrder,
      isDeleted: false,
    });
    await handleNotificationForRequestQuantity(spareObj, creatorUserObj, workorderObj)
    const constructedData = await constructSpareRequestTemplateData(
        approverObj.name,
        (spareObj.name && spareObj.specification)
        ? `${spareObj.name} - ${spareObj.specification}`
        : spareObj.name || spareObj.specification || "",
        createdWorkOrderPartRequired.requestedQuantity,
        creatorUserObj.name,
        workorderObj.name,
        createdWorkOrderPartRequired.createdAt
      );

    await sendSpareRequestEmail(
        [approverObj.email],
        `Spare Quantity Requested`,
        constructedData
      );
    return createdWorkOrderPartRequired;
  } catch (error) {
    throw error;
  }
}


async function reduceSpareQuantity(partRequired, userId, spareObj) {
  try {
    if (!partRequired) throw new Error("partRequired is required");
    const { spare, requestedQuantity } = partRequired;

    if (!spare || typeof requestedQuantity !== 'number') {
      throw new Error("Invalid spare or requestedQuantity.");
    }

    const spareDoc = spareObj;
    if (!spareDoc) throw new Error("Spare not found or inactive");

    const currentQuantity = typeof spareDoc.quantity === 'number'
      ? spareDoc.quantity
      : parseFloat(spareDoc.quantity);

    const newQuantity = Math.max((currentQuantity || 0) - requestedQuantity, 0);

    const result = await mongoDbManager.updateOne(Spares,
      { _id: spare, isActive: true },
      { $set: { quantity: newQuantity } }
    );

    // Threshold check
    const updatedSpare = await Spares.findOne({
      _id: spare,
      $expr: { $lt: ["$quantity", "$minimumRequiredQuantity"] }
    }).lean();

    if (updatedSpare) {
      const spareCreator = await mongoDbManager.findOne(
        Users,
        { _id: updatedSpare.createdBy },
        { name: 1, email: 1 }
      );

      const constructedData = await constructLogSpareMinimumThresholdTemplateData(
        spareCreator.name,
        [updatedSpare]
      );

      await handleNotificationForMinimumThresholdSpare(updatedSpare, userId);

      await sendSpareMinimumLimitBreachEmail(
        [spareCreator.email],
        `Minimum Threshold Exceeded`,
        constructedData
      );
    }

    return result;
  } catch (error) {
    console.error("Error reducing spare quantity:", error);
    throw error;
  }
}

async function handleNotificationForRequestQuantity(
  spareObj,
  userObj,
  workorderObj
) {
  try {
    await sendNotificationForApprover(
      "requested",
      `has been requested by ${
        userObj.name
      } for the workorder ${workorderObj.name}`,
      spareObj._id,
      (spareObj.name && spareObj.specification)
        ? `${spareObj.name} - ${spareObj.specification}`
        : spareObj.name || spareObj.specification || "",
      spareObj.approver.toString(),
      spareObj.businessUnit
    );
  } catch (error) {
    throw error;
  }
}

async function handleNotificationForMinimumThresholdSpare (doc,reqUserId){
  try{
    if(doc.createdBy){
      const userObj = await mongoDbManager.findOne(Users, {_id:doc.createdBy, isDeleted: false}, {_id:1})
      await sendNotificationForApprover(
        "minimumLevelReached",
        `has reached a quantity of ${doc.quantity}, which is below the minimum required quantity ${doc.minimumRequiredQuantity}.`,
        doc._id,
        (doc.name && doc.specification)
        ? `${doc.name} - ${doc.specification}`
        : doc.name || doc.specification || "",
        userObj._id.toString(),
        doc.businessUnit
      );
    }
}
catch(err){
  console.log("err",err)
  throw err;
}
}


async function sendNotifications(
  title,
  message,
  id,
  name,
  department,
  reqUserId,
  businessUnit
) {
  try {
    const data = dataConstructor.constructNotification(
      title,
      message,
      { id: id, name: name },
      "spares",
      reqUserId,
      businessUnit
    );
    const userTypes = await fetchEngineerUserTypeByDepartment(department);
    await sendViaUserType("notification", userTypes, data);
  } catch (err) {
    throw err;
  }
}

async function sendNotificationForApprover(
  title,
  message,
  id,
  name,
  reqUserId,
  businessUnit
){
  try{
    const data = dataConstructor.constructNotification(
      title,
      message,
      { id: id, name: name },
      "spares",
      reqUserId,
      businessUnit
    );
    await sendViaUserID("notification", reqUserId, data);
  }catch(error){
    throw error;
  }
}


// async function getPartsRequired(reqData, workOrderId, businessUnitId) {
//   try {
//     const queryObj = queryBuilder(reqData, businessUnitId, workOrderId);
//     const fieldMapping = fieldMappings();
//     const countData = await mongoDbManager.count(
//       workOrderPartRequired,
//       queryObj.query
//     );

//     // Handle cases where either page or limit is not provided
//     if (queryObj.page === null && queryObj.limit === null) {
//       queryObj.limit = countData || 1; // Set limit to the total number of records if no limit is provided
//       queryObj.page = 1; // Set page to 1 if no page is provided
//     } else if (queryObj.page === null) {
//       queryObj.page = 1; // Set default page to 1 if not provided
//     } else if (queryObj.limit === null) {
//       queryObj.limit = countData; // Set limit to the total number of records if no limit is provided
//     }

//     if (queryObj.limit === 0 && queryObj.page > 1) {
//       return paginationHandler.paginationResObj(
//         queryObj.page,
//         1,
//         countData,
//         []
//       );
//     }

//     const populateFields = [
//       "createdBy",
//       "updatedBy",
//       "spare"
//     ];

//     const selectFields = [
//       "spare",
//       "requestedQuantity",
//       "status",
//       "remarks",
//       "workOrder",
//       "createdBy",
//       "updatedBy",
//       "createdAt",
//       "updatedAt",
//     ];

//     let data = await mongoDbManager.fetchAllAndPopulate(
//       workOrderPartRequired,
//       queryObj.query,
//       fieldMapping,
//       queryObj.limit,
//       queryObj.page,
//       queryObj.sortOrder,
//       populateFields,
//       selectFields
//     );
//     if (data) {
//       data = data.map((result) => {
//         const { _id, ...rest } = result;
//         return { ...rest, id: _id };
//       });
//     }

//       const totalPages = countData === 0 ? 0 : queryObj.limit === 0 ? 1 : Math.ceil(countData / queryObj.limit);
//       return paginationHandler.paginationResObj(queryObj.page, totalPages, countData, data);
//   } catch (error) {
//     throw error;
//   }
// }

// async function getPartsRequired(reqData, workOrderId, businessUnitId) {
//   try {
//     const queryObj = queryBuilder(reqData, workOrderId, businessUnitId);
//     const fieldMapping = fieldMappings();
//     const countData = await mongoDbManager.count(
//       workOrderPartRequired,
//       queryObj.query
//     );

//     // Handle cases where either page or limit is not provided
//     if (queryObj.page === null && queryObj.limit === null) {
//       queryObj.limit = countData || 1; // Set limit to the total number of records if no limit is provided
//       queryObj.page = 1; // Set page to 1 if no page is provided
//     } else if (queryObj.page === null) {
//       queryObj.page = 1; // Set default page to 1 if not provided
//     } else if (queryObj.limit === null) {
//       queryObj.limit = countData; // Set limit to the total number of records if no limit is provided
//     }

//     if (queryObj.limit === 0 && queryObj.page > 1) {
//       return paginationHandler.paginationResObj(
//         queryObj.page,
//         1,
//         countData,
//         []
//       );
//     }

//     const populateFields = [
//       "createdBy",
//       "updatedBy",
//       "spare"
//     ];

//     const selectFields = [
//       "spare",
//       "requestedQuantity",
//       "status",
//       "remarks",
//       "workOrder",
//       "createdBy",
//       "updatedBy",
//       "createdAt",
//       "updatedAt",
//     ];

//     let data = await mongoDbManager.fetchAllAndPopulate(
//       workOrderPartRequired,
//       queryObj.query,
//       fieldMapping,
//       queryObj.limit,
//       queryObj.page,
//       queryObj.sortOrder,
//       populateFields,
//       selectFields
//     );
//     if (data) {
//       data = data.map((result) => {
//         const { _id, ...rest } = result;
//         return { ...rest, id: _id };
//       });
//     }

//       const totalPages = countData === 0 ? 0 : queryObj.limit === 0 ? 1 : Math.ceil(countData / queryObj.limit);
//       return paginationHandler.paginationResObj(queryObj.page, totalPages, countData, data);
//   } catch (error) {
//     throw error;
//   }
// }

async function getPartsRequired(reqData, workOrderId, businessUnitId) {
  try {
    const queryObj = queryBuilder(reqData, businessUnitId, workOrderId);
    const { page = 1, limit = 10, sortOrder = { createdAt: -1 }, query } = queryObj;
    // Extract spare name filter from reqData if exists
    const spareNameFilter = reqData?.name?.trim();
    const matchStage = {
      $match: query || {}
    };

    const lookupStage = {
      $lookup: {
        from: "spares",
        localField: "spare",
        foreignField: "_id",
        as: "spare"
      }
    };

    const unwindSpare = { $unwind: { path: "$spare", preserveNullAndEmptyArrays: true } };

    // Apply spare.name filter if provided
    const spareNameMatch = spareNameFilter
      ? {
          $match: {
            $or: [
              { "spare.name": { $regex: spareNameFilter, $options: "i" } },
              { "spare.specification": { $regex: spareNameFilter, $options: "i" } }
            ]
          }
        }
      : null;

    const sortStage = { $sort: sortOrder };

    const facetStage = {
      $facet: {
        data: [
          // { $skip: (page - 1) * limit },
          // { $limit: limit },
          {
            $project: {
              _id:0,
              id: "$_id",
              spare: {
                 id: '$spare._id',
                 name: {
                  $concat: [
                    { $ifNull: ["$spare.name", ""] },
                    " - ",
                    { $ifNull: ["$spare.specification", ""] }
                  ]
                },
                //  specification: '$spare.specification',
                 quantity: '$spare.quantity',
                 units: "$spare.units",
              },
              requestedQuantity: 1,
              utilisedCount:1,
              status: 1,
              remarks: 1,
              workOrder: 1,
              createdBy: 1,
              updatedBy: 1,
              createdAt: 1,
              updatedAt: 1
            }
          }
        ],
        count: [{ $count: "total" }]
      }
    };

    const pipeline = [
      matchStage,
      lookupStage,
      unwindSpare,
      ...(spareNameMatch ? [spareNameMatch] : []),
      sortStage,
      facetStage
    ];

    const [results] = await workOrderPartRequired.aggregate(pipeline);
    const totalCount = results?.count?.[0]?.total || 0;
    const totalPages = limit === 0 ? 1 : Math.ceil(totalCount / limit);

    // return paginationHandler.paginationResObj(page, totalPages, totalCount, results.data);
    return results.data;
  } catch (error) {
    throw error;
  }
}



async function getSpareRequired(reqData, businessUnitId, reqUserId){
  try{
    const queryObj = queryBuilder(reqData, businessUnitId);
    const { page = 1, limit = 10, sortOrder = { createdAt: -1 }, query } = queryObj;
    // Extract spare name filter from reqData if exists
    const spareNameFilter = reqData?.name?.trim();
    const matchStage = {
      $match: query || {}
    };

    const lookupStage = {
      $lookup: {
        from: "spares",
        localField: "spare",
        foreignField: "_id",
        as: "spare"
      }
    };
    const unwindSpare = { $unwind: { path: "$spare", preserveNullAndEmptyArrays: true } };

     const approverFilterStage = reqUserId
  ? {
      $match: {
        $or: [
          { "spare.createdBy": new mongoose.Types.ObjectId(reqUserId) },
          { "spare.approver": new mongoose.Types.ObjectId(reqUserId) }
        ]
      }
    }
  : null;

      const lookupApproverStage = {
          $lookup: {
            from: "users",
            localField: "spare.approver",
            foreignField: "_id",
            as: "approver"
          }
        };
    
        const unwindApprover = { $unwind: { path: "$approver", preserveNullAndEmptyArrays: true } };
    
    // Apply spare.name filter if provided
    const spareNameMatch = spareNameFilter
      ? {
          $match: {
            $or: [
              { "spare.name": { $regex: spareNameFilter, $options: "i" } },
              { "spare.specification": { $regex: spareNameFilter, $options: "i" } }
            ]
          }
        }
      : null;

    const sortStage = { $sort: sortOrder };

    const facetStage = {
      $facet: {
        data: [
          { $skip: (page - 1) * limit },
          { $limit: limit },
          {
            $project: {
              _id:0,
              id: "$_id",
              spare: {
                 id: '$spare._id',
                 name: {
                  $concat: [
                    { $ifNull: ["$spare.name", ""] },
                    " - ",
                    { $ifNull: ["$spare.specification", ""] }
                  ]
                },
                //  specification: '$spare.specification',
                 quantity: '$spare.quantity',
                 units: "$spare.units",
                 approver: {
                  id: "$approver._id",
                  name: "$approver.name",
                  email: "$approver.email"
                }
              },
              requestedQuantity: 1,
              utilisedCount:1,
              status: 1,
              remarks: 1,
              workOrder: 1,
              createdBy: 1,
              updatedBy: 1,
              createdAt: 1,
              updatedAt: 1
            }
          }
        ],
        count: [{ $count: "total" }]
      }
    };

    const pipeline = [
      matchStage,
      lookupStage,
      unwindSpare,
      ...(approverFilterStage ? [approverFilterStage] : []),
      lookupApproverStage,
      unwindApprover,
      ...(spareNameMatch ? [spareNameMatch] : []),
      sortStage,
      facetStage
    ];

    const [results] = await workOrderPartRequired.aggregate(pipeline);
    const totalCount = results?.count?.[0]?.total || 0;
    const totalPages = limit === 0 ? 1 : Math.ceil(totalCount / limit);

    return paginationHandler.paginationResObj(page, totalPages, totalCount, results.data);
  }catch(error){
    throw error;
  }
}

async function approveSpareRequired(spareRequiredIds, spareRequestedObj, userId, spareObj){
  try{
    const result = await mongoDbManager.updateOne(workOrderPartRequired, { _id: { $in: spareRequiredIds }, status: "pendingForApproval" },
      { $set: { status: "approved" } });
        if(result.acknowledged){
          await reduceSpareQuantity(spareRequestedObj, userId, spareObj)
          return result
        }
        else{
          throw "Not Approved! Try after some time";
        }
  }catch(error){
    throw error;
  }
}

async function notifyRequesterOnSpareApproval(spareRequestedObj, approverUserId, spareObj) {
  try {
    // Fetch the requester (operator)
    const operatorUserObj = await mongoDbManager.findOne(Users, {
      _id: spareRequestedObj.createdBy,
      isDeleted: false
    });
    if (!operatorUserObj) return; // skip if operator not found

    // Fetch approver user
    const approverUserObj = await mongoDbManager.findOne(Users, {
      _id: approverUserId,
      isDeleted: false
    });

    // Build notification message
    const message = `Your spare request for ${spareObj.name} has been approved by ${approverUserObj?.name || "Approver"}`;

    // Send via existing notification helper
    await sendNotificationForApprover(
      "approve",                     // activity/title matching enum
      message,
      spareRequestedObj._id,         // referenceId
      spareObj.name,                 // name
      operatorUserObj._id.toString(), // receiver
      spareRequestedObj.businessUnit
    );

  } catch (error) {
    console.log("Error sending spare approval notification to requester:", error);
    throw error;
  }
}


async function rejectSpareRequired(spareRequiredIds){
  try{
    const result = await mongoDbManager.updateOne(workOrderPartRequired, { _id: { $in: spareRequiredIds }, status: "pendingForApproval" },
      { $set: { status: "resubmit" } });
        if(result.acknowledged){
          return result
        }
        else{
          throw "Not Rejected! Try after some time";
        }
  }catch(error){
    throw error;
  }
}


async function checkExistingSpareRequired(query) {
  try {
    const existingSpareQuantity = await mongoDbManager.findOne(workOrderPartRequired, query);
    return existingSpareQuantity;
  } catch (error) {
    throw error;
  }
}


module.exports = {
  createWorkOrderPartRequired,
  getPartsRequired,
  getSpareRequired,
  approveSpareRequired,
  rejectSpareRequired,
  checkExistingSpareRequired,
  notifyRequesterOnSpareApproval
};

function fieldMappings() {
  return {
    spare: {
      localField: "spare",
      collection: "spares",
      fieldsToInclude: ["name", "quantity","specification", "id"], // Example fields to include
    },
    updatedBy: {
      localField: "updatedBy",
      collection: "users",
      fieldsToInclude: ["name", "email", "id"], // Example fields to include
    },
    createdBy: {
      localField: "createdBy",
      collection: "users",
      fieldsToInclude: ["name", "email", "id"], // Example fields to include
    },
  };
}

function queryBuilder(reqData, businessUnitId, workOrderId) {
  const query = {
    isActive: true,
    // ...(reqData.name && {
    //   "spare.name": { $regex: reqData.name, $options: "i" },
    // }),
    ...(workOrderId && {
      workOrder: new mongoose.Types.ObjectId(workOrderId),
    }),
    ...(businessUnitId && {
      businessUnit: new mongoose.Types.ObjectId(businessUnitId),
    }),
    ...(reqData.status &&
      typeof reqData.status === "string" && {
        status: {
          $in: reqData.status.split(",").map((p) => new RegExp(`^${p.trim()}$`, "i")),
        },
      }),
    // ...(reqData.createdAt && { createdAt: req.createdAt }),
    // ...(reqData.updatedAt && { updatedAt: req.updatedAt })
  };

  const page = reqData.page ? parseInt(reqData.page, 10) : 1;
  const limit = reqData.limit ? parseInt(reqData.limit, 10) : 10;
  const skip = page && limit ? (page - 1) * limit : 0;
  const sort = reqData.sort || "createdAt";
  const order = reqData.order === "asc" ? 1 : -1;
  const sortOrder = { [sort]: order };

  return {
    query,
    skip,
    page,
    limit,
    sortOrder,
  };
}
