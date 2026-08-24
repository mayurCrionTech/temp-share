const { mongoDbManager } = require("../../dBManagers/index");
const WorkOrderPartReplaced = require("../../../models/mongoDB/maintenanceManagement/workOrderPartReplaced_model");
const WorkOrderPartRequired = require("../../../models/mongoDB/maintenanceManagement/workOrderPartRequired_model.js");
const mongoose = require("mongoose");
const {
  Spares,
} = require("../../../models/mongoDB/spareManagement/spare_model.js");
const {Assets} = require("../../../models/mongoDB/assetManagement/asset_model");
const Users = require("../../../models/mongoDB/userManagement/user_model.js");
const {
  fetchEngineerUserTypeByDepartment,
} = require("../../../utils/socket/socketUserHandler")
const dataConstructor = require("../../../managers/common/DataObjectConstructor_manager.js")
const paginationHandler = require("../../common/paginationHandler_manager");
const {
	sendViaUserType,
  } = require('../../../utils/socket/socketHandler.js');
const { constructLogSpareMinimumThresholdTemplateData, sendSpareMinimumLimitBreachEmail } = require("../../../utils/emailService/templates/spareMinimumThresholdEmailTemplate.js");
const fileManager = require("../../internalManagers/fileSystem/fileSystem_manager.js")


async function createWorkOrderPartReplaced(workOrderPartReplacedObject,userId) {
  try {
    const createdWorkOrderPartReplaced = await mongoDbManager.insertOne(
      WorkOrderPartReplaced,
      workOrderPartReplacedObject
    );
    await setUtilisedCount(createdWorkOrderPartReplaced,userId);
    return createdWorkOrderPartReplaced;
  } catch (error) {
    throw error;
  }
}


async function setUtilisedCount(replaceQuantity, userId) {  //need to modify this function
  try {
    if (!replaceQuantity) throw new Error("replacedQuantity is required");
    const { spareRequested, replacedQuantity } = replaceQuantity;

    if (!spareRequested || typeof replacedQuantity !== "number") {
      throw new Error(
        "Invalid spareRequested or replacedQuantity"
      );
    }

    // Fetch the current quantity
    const partDoc = await mongoDbManager.findOne(WorkOrderPartRequired,{
      _id: spareRequested,
      isActive: true,
    });

    if (!partDoc) throw new Error("Spare request not found or inactive.");

    const currentQty = Number(partDoc.utilisedCount || 0);
    const newQty = Math.max(currentQty + replacedQuantity, 0);

    // Update with the new quantity
    const result = await mongoDbManager.updateOne(
      WorkOrderPartRequired,
      { _id: spareRequested },
      { $set: { utilisedCount: newQty } }
    );

    return result;
  } catch (error) {
    console.error("Error reducing spare quantity:", error);
    throw error;
  }
}


async function handleNotificationForMinimumThresholdSpare (doc,reqUserId){
  try{
    if(doc.asset){
      const selectFields = ["generalDetails"]
      const findAsset_Department = await mongoDbManager.findOneWithPopulate(Assets, {
        _id: doc.asset,
        isDeleted: false,
      },selectFields);
      await sendNotifications(
        "setLimitBreached",
        `The quantity of spare "${doc.name}" has fallen below the minimum threshold.`,
        doc._id,
        doc.name,
        findAsset_Department.generalDetails.department,
        reqUserId,
        doc.businessUnit
      );
    }
}
catch(err){
  console.log("err",err)
  throw err;
}
}


async function updateSpareReplaced(spareReplacedId, updateObj){
   try{
      const updatedSpare = await mongoDbManager.updateOne(WorkOrderPartReplaced,
        { _id: spareReplacedId }, // Match documents with IDs in the spareIds array
        { $set: updateObj } // Set the asset field to assetId
        );
      return updatedSpare;
    }catch(error){
      throw error;
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
      "sparesAndInventory",
      reqUserId,
      businessUnit
    );
    const userTypes = await fetchEngineerUserTypeByDepartment(department);
    await sendViaUserType("notification", userTypes, data);
  } catch (err) {
    throw err;
  }
}


async function getPartsReplaced(reqData, workOrderId, businessUnitId, reqHost, reqProtocol) {
  try {
    const queryObj = queryBuilder(reqData, businessUnitId, workOrderId);
    const {
      page = 1,
      limit = 10,
      sortOrder = { createdAt: -1 },
      query,
    } = queryObj;

    // Extract spare name or specification filter
    const spareNameFilter = reqData?.name?.trim().replace(/\s+/g, ".*");
    const matchStage = { $match: query || {} };

    const lookupSpare = {
      $lookup: {
        from: "spares",
        localField: "spare",
        foreignField: "_id",
        as: "spare",
      },
    };

    const unwindSpare = {
      $unwind: { path: "$spare", preserveNullAndEmptyArrays: true },
    };

    const addSpareFullName = {
      $addFields: {
        spareFullName: {
          $cond: {
            if: {
              $and: [
                { $ifNull: ["$spare.name", false] },
                { $ifNull: ["$spare.specification", false] },
              ],
            },
            then: { $concat: ["$spare.name", " - ", "$spare.specification"] },
            else: "$spare.name",
          },
        },
      },
    };

    const lookupSpareRequested = {
      $lookup: {
        from: "workOrderPartsRequired",
        localField: "spareRequested",
        foreignField: "_id",
        as: "spareRequested",
      },
    };
    const unwindSpareRequested = {
      $unwind: { path: "$spareRequested", preserveNullAndEmptyArrays: true },
    };
    const spareFilterStage = spareNameFilter
      ? {
          $match: {
            spareFullName: { $regex: spareNameFilter, $options: "i" },
          },
        }
      : null;

    const lookupImages = {
      $lookup: {
        from: "files", // or "images", depending on your collection
        localField: "images",
        foreignField: "_id",
        as: "images",
      },
    };

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
                id: "$spare._id",
                name: {
                  $cond: {
                    if: {
                      $and: [
                        { $ifNull: ["$spare.name", false] },
                        { $ifNull: ["$spare.specification", false] },
                      ],
                    },
                    then: {
                      $concat: ["$spare.name", " - ", "$spare.specification"],
                    },
                    else: "$spare.name",
                  },
                },
                // specification: "$spare.specification",
                quantity: "$spare.quantity",
                units: "$spare.units",
              },
              replacedQuantity: 1,
              remarks: 1,
              images:1,
              spareRequested: {
                id: "$spareRequested._id",
                requestedQuantity: "$spareRequested.requestedQuantity",
              },
              workOrder: 1,
              createdBy: 1,
              updatedBy: 1,
              createdAt: 1,
              updatedAt: 1,
            },
          },
        ],
        count: [{ $count: "total" }],
      },
    };

    const pipeline = [
      matchStage,
      lookupSpare,
      unwindSpare,
      addSpareFullName,
      lookupSpareRequested,
      unwindSpareRequested,
      ...(spareFilterStage ? [spareFilterStage] : []),
      lookupImages,
      sortStage,
      facetStage,
    ];

    const [results] = await WorkOrderPartReplaced.aggregate(pipeline);
    const totalCount = results?.count?.[0]?.total || 0;
    const totalPages = limit === 0 ? 1 : Math.ceil(totalCount / limit);

        await Promise.all(
          results.data.map(async (spare) => {
            if (Array.isArray(spare.images) && spare.images.length > 0) {
              spare.images = await Promise.all(
                spare.images.map((document) =>
                  fileManager.transformFileObj(
                    document,
                    "download",
                    reqHost,
                    reqProtocol
                  )
                )
              );
            }
          })
        );

    // return paginationHandler.paginationResObj(
    //   page,
    //   totalPages,
    //   totalCount,
    //   results.data
    // );
    return results.data
  } catch (error) {
    throw error;
  }
}

async function getSpareReplaced(reqData, businessUnitId, reqUserId) {
  try {
    const queryObj = queryBuilder(reqData, businessUnitId);
    const { page = 1, limit = 10, sortOrder = { createdAt: -1 }, query } = queryObj;

    // Extract spare name or specification filter
    const spareNameFilter = reqData?.name?.trim();
    const matchStage = { $match: query || {} };

    const lookupSpare = {
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

    const lookupSpareRequested = {
     $lookup: {
        from: "workOrderPartsRequired",
        localField: "spareRequested",
        foreignField: "_id",
        as: "spareRequested"
      }
    };

  const unwindSpareRequested = {
    $unwind: { path: "$spareRequested", preserveNullAndEmptyArrays: true }
  };

    const spareFilterStage = spareNameFilter
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
                id: "$spare._id",
                name: {
                  $cond: {
                    if: { $and: [{ $ifNull: ["$spare.name", false] }, { $ifNull: ["$spare.specification", false] }] },
                    then: { $concat: ["$spare.name", " - ", "$spare.specification"] },
                    else: "$spare.name"
                  }
                },
                // specification: "$spare.specification",
                quantity: "$spare.quantity",
                units: "$spare.units",
              },
              replacedQuantity: 1,
              remarks: 1,
              spareRequested:{
                id: "$spareRequested._id",
                requestedQuantity:"$spareRequested.requestedQuantity",
              },
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
      lookupSpare,
      unwindSpare,
      ...(approverFilterStage ? [approverFilterStage] : []),
      lookupSpareRequested,
      unwindSpareRequested,
      ...(spareFilterStage ? [spareFilterStage] : []),
      sortStage,
      facetStage
    ];

    const [results] = await WorkOrderPartReplaced.aggregate(pipeline);
    const totalCount = results?.count?.[0]?.total || 0;
    const totalPages = limit === 0 ? 1 : Math.ceil(totalCount / limit);

    return paginationHandler.paginationResObj(page, totalPages, totalCount, results.data);
  } catch (error) {
    throw error;
  }
}


async function checkExistingSpareReplaced(query) {
  try {
    const existingSpareReplaced = await mongoDbManager.findOne(WorkOrderPartReplaced, query);
    return existingSpareReplaced;
  } catch (error) {
    throw error;
  }
}


async function returnSpareQuantity(spareId, spareReplacedId, returnedQuantity) {
  try {
    const spareQuantity = await mongoDbManager.updateOne(
      WorkOrderPartReplaced,
      { _id: spareReplacedId, isActive: true },
      {
        $set: {
          quantityReturned: returnedQuantity,
          quantityReturnedAt: Date.now(),
        },
      }
    );
    await Promise.all([
      addreturnQuantity(spareId, returnedQuantity),
      reduceReplacedQuantity(spareReplacedId, returnedQuantity)
    ]);
    return spareQuantity;
  } catch (error) {
    throw error;
  }
}


async function addreturnQuantity(spareId, returnedQuantity){
  try{
      const result = await mongoDbManager.updateOne(
      Spares,
      { _id: spareId, isActive: true },
      [
        {
          $set: {
            quantity: {
              $cond: {
                if: { $isNumber: "$quantity" },
                then: { $add: ["$quantity", returnedQuantity] },
                else: { $add: [{ $toDouble: "$quantity" }, returnedQuantity] }
              }
            }
          }
        }
      ]
    );
    return result;
  }catch(error){
    throw error;
  }
}

async function reduceReplacedQuantity(spareReplacedId, returnedQuantity) {
  try {
    const result = await mongoDbManager.updateOne(
      WorkOrderPartReplaced,
      { _id: spareReplacedId, isActive: true },
      [
        {
          $set: {
            replacedQuantity: {
              $max: [
                0,
                {
                  $cond: {
                    if: { $isNumber: "$replacedQuantity" },
                    then: {
                      $subtract: ["$replacedQuantity", returnedQuantity],
                    },
                    else: {
                      $subtract: [
                        { $toDouble: "$replacedQuantity" },
                        returnedQuantity,
                      ],
                    },
                  },
                },
              ],
            },
          },
        },
      ]
    );
    return result;
  } catch (error) {
    throw error;
  }
}


async function updateSpareReplacedAdded (spareReplacedId, imageIds){
  try{
    if (!Array.isArray(imageIds)) {
      imageIds = [imageIds];
    }
    const updateWorkOrderSpareWithImageId = await mongoDbManager.updateOne(
      WorkOrderPartReplaced,
      { _id: spareReplacedId, isActive: true }, // Cast workOrderId to ObjectId
      { $push: { images: { $each: imageIds } } } // Use $each to push the array
    );
    return updateWorkOrderSpareWithImageId;
  }catch(error){
    throw error;
  }
}


async function getImagesForSpareReplaced(reqQuery, spareReplacedId, reqHost, reqProtocol, workOrderId) {
  try {
    let page = reqQuery.page ? parseInt(reqQuery.page, 10) : 0;
    let limit = reqQuery.limit ? parseInt(reqQuery.limit, 10) : 200;
    const sort = reqQuery.sort || "createdAt";
    const order = reqQuery.order === "asc" ? 1 : -1;
    const sortOrder = { [sort]: order };

    if (isNaN(page) || page < 1) page = 1;
    if (isNaN(limit) || limit < 1) limit = 200;

const getWorkOrderImage = await WorkOrderPartReplaced.findOne({
  _id: spareReplacedId,
  workOrder: workOrderId,
  isActive: true,
}).populate("images");

if (getWorkOrderImage) {
  if (!getWorkOrderImage.images) {
    getWorkOrderImage.images = [];
  }
}
    // Ensure images is always an array
    let imagesArray = Array.isArray(getWorkOrderImage.images) 
      ? getWorkOrderImage.images 
      : [getWorkOrderImage.images];

    if (imagesArray.length > 0) {
      const fileDocuments = [];
      for (let document of imagesArray) {
        const image = await fileManager.transformFileObj(
          document,
          "download",
          reqHost,
          reqProtocol
        );
        fileDocuments.push(image);
      }
      imagesArray = fileDocuments; // Assign transformed documents to the array
    }

    const countData = imagesArray.length;
    const totalPages =
      countData === 0
        ? 0
        : limit === 0
        ? 1
        : Math.ceil(countData / limit);
    const skip = (page - 1) * limit;

    // Paginate the images array
    const paginatedImages = imagesArray.slice(skip, skip + limit);

    return paginationHandler.paginationResObj(
      page,
      totalPages,
      countData,
      paginatedImages
    );
  } catch (error) {
    throw error;
  }
}

module.exports = {
  createWorkOrderPartReplaced,
  getPartsReplaced,
  updateSpareReplaced,
  checkExistingSpareReplaced,
  returnSpareQuantity,
  updateSpareReplacedAdded,
  getImagesForSpareReplaced,
  getSpareReplaced,
};

function fieldMappings() {
  return {
    spare: {
      localField: "spare",
      collection: "spares",
      fieldsToInclude: ["name", "quantity", "specification","id"], // Example fields to include
    },
     spareRequested: {
      localField: "spareRequested",
      collection: "workOrderPartsRequired",
      fieldsToInclude: [ "requestedQuantity", "id"], // Example fields to include
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
    images: {
      localField: "images",
      collection: "files",
      isArray: true,
      fieldsToInclude: [
        "_id",
        "name",
        "extension",
        "contentType",
        "size",
        "storageLocation",
        "moduleName",
        "moduleId",
        "businessUnit",
      ], // Example fields to include
    },
  };
}

function queryBuilder(reqData,  businessUnitId, workOrderId) {
  const query = {
    isActive: true,
    ...(workOrderId && {
      workOrder: new mongoose.Types.ObjectId(workOrderId),
    }),
    ...(businessUnitId && {
      businessUnit: new mongoose.Types.ObjectId(businessUnitId),
    }),
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
