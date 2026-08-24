const {
  SpareStock
} = require("../../../models/mongoDB/spareManagement/spareStock_model");
const {
  Spares
} = require("../../../models/mongoDB/spareManagement/spare_model");
const { mongoDbManager } = require("../../dBManagers");
const paginationHandler = require("../../common/paginationHandler_manager");
const Model = SpareStock
const mongoose = require("mongoose");


async function createSpareQuantity(spareObject) {
  try {
    const spare = await mongoDbManager.insertOne(
      Model,
      spareObject
    );
    return spare;
  } catch (error) {
    throw error;
  }
}


async function getAllSpareQuantities(reqData, userId) {
  try {
    const queryObj = queryBuilder(reqData, userId); // Contains query, limit, page, sortOrder
    const { query, limit = 10, page = 1, sortOrder } = queryObj;
    
    const spareNameFilter = reqData?.name?.trim();

    // Handle filtering on spare.name (case-insensitive)
    if (spareNameFilter) {
      query['spareData.name'] = { $regex: spareNameFilter, $options: 'i' };
    }

    // Total count first for pagination
    const countPipeline = [
      {
        $lookup: {
          from: 'spares',
          localField: 'spare',
          foreignField: '_id',
          as: 'spareData',
        },
      },
      { $unwind: { path: '$spareData', preserveNullAndEmptyArrays: true } },
      { $match: query },
      { $count: 'total' },
    ];

    const countResult = await Model.aggregate(countPipeline);
    const countData = countResult[0]?.total || 0;

    if (limit === 0 && page > 1) {
      return paginationHandler.paginationResObj(page, 1, countData, []);
    }

    const aggregationPipeline = [
      {
        $lookup: {
          from: 'spares',
          localField: 'spare',
          foreignField: '_id',
          as: 'spareData',
        },
      },
      { $unwind: { path: '$spareData', preserveNullAndEmptyArrays: true } },
          {
        $lookup: {
          from: 'users',
          localField: 'spareData.approver',
          foreignField: '_id',
          as: 'approverData',
        },
      },
      { $unwind: { path: '$approverData', preserveNullAndEmptyArrays: true } },
      { $match: query },
      {
        $project: {
          _id:0,
          id: '$_id',
          // spare: 1,
          status: 1,
          quantity: 1,
          units: 1,
          cost: 1,
          expiryDate: 1,
          createdAt:1,
          spare: {
           id: '$spareData._id',
           name: {
                  $concat: [
                    { $ifNull: ["$spareData.name", ""] },
                    " - ",
                    { $ifNull: ["$spareData.specification", ""] }
                  ]
                },
          //  specification: '$spareData.specification',
           quantity: '$spareData.quantity',
           units: "$spareData.units",
           approver: {
              id: '$approverData._id',
              name: '$approverData.name',
              email: '$approverData.email' // or any other fields needed
            }
          },
        },
      },
    ];

    // Sorting
    if (Object.keys(sortOrder).length > 0) {
      aggregationPipeline.push({ $sort: sortOrder });
    }

    // Pagination
    aggregationPipeline.push(
      { $skip: (page - 1) * limit },
      { $limit: limit }
    );

    const data = await Model.aggregate(aggregationPipeline);

    const totalPages =
      countData === 0 ? 0 : limit === 0 ? 1 : Math.ceil(countData / limit);

    return paginationHandler.paginationResObj(
      page,
      totalPages,
      countData,
      data
    );
  } catch (err) {
    throw err;
  }
}



// async function getAllSpareQuantities(reqData, userId) {
//   try {
//     const queryObj = queryBuilder(reqData, userId);
//     const fieldMapping = fieldMappings();
//     const countData = await mongoDbManager.count(Model, queryObj.query);

//         if (queryObj.page === null && queryObj.limit === null) {
//           queryObj.limit = countData || 1; // Set limit to the total number of records if no limit is provided
//           queryObj.page = 1; // Set page to 1 if no page is provided
//         } else if (queryObj.page === null) {
//           queryObj.page = 1; // Set default page to 1 if not provided
//         } else if (queryObj.limit === null) {
//           queryObj.limit = countData; // Set limit to the total number of records if no limit is provided
//         }
    
//         if (queryObj.limit === 0 && queryObj.page > 1) {
//           return paginationHandler.paginationResObj(
//             queryObj.page,
//             1,
//             countData,
//             []
//           );
//         }
//     const populateFields = ["spare"];
//     const selecteFields = ["spare","status","quantity","units","cost","expiryDate"];


//     let data = await mongoDbManager.fetchAllWithQueryAndPopulate(
//       Model,
//       queryObj.query,
//       fieldMapping,
//       queryObj.limit,
//       queryObj.page,
//       queryObj.sortOrder,
//       populateFields,
//       selecteFields
//     );

//     if (data) {
//       data = data.map((result) => {
//         const { _id, ...rest } = result;
//         return { ...rest, id: _id };
//       });
//     }

//     const totalPages =
//       countData === 0
//         ? 0
//         : queryObj.limit === 0
//         ? 1
//         : Math.ceil(countData / queryObj.limit);

//     return paginationHandler.paginationResObj(
//       queryObj.page,
//       totalPages,
//       countData,
//       data
//     );
//   } catch (err) {
//     throw err;
//   }
// }

async function approveSpareQuantity(quantityId){
  try{
    const result = await mongoDbManager.updateOne(Model, { _id: quantityId, status: "pendingForApproval" },
  { $set: { status: "approved" } });
  if(result.modifiedCount == 1){
    const spareQuantityObj = await mongoDbManager.findOne(Model, { _id: quantityId, isActive: true });
    const approvedQuantity = spareQuantityObj.quantity || 0;
    const spareId = spareQuantityObj.spare;
    
    if (!spareId) throw "Spare reference not found.";
    
    const spareDoc = await mongoDbManager.findOne(Spares, { _id: spareId, isActive: true });
    const existingQuantity = spareDoc?.quantity || 0;
    const newQuantity = existingQuantity + approvedQuantity;

    // Step 4: Update spare model with new quantity
    await mongoDbManager.updateOne(
      Spares,
      { _id: spareId },
      { $set: { "quantity": newQuantity } }
    );
    }
  }catch(error){
    throw error;
  }
}

async function reviseSpareQuantity(quantityId){
  try{
    const result = await mongoDbManager.updateOne(Model, { _id: quantityId, status: "pendingForApproval" },
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

async function checkExistingSpareQuantity(query) {
  try {
    const existingSpareQuantity = await mongoDbManager.findOne(Model, query);
    return existingSpareQuantity;
  } catch (error) {
    throw error;
  }
}

async function updateSpareQuantity(spareQuantityId, updateObj){
   try{
      const updatedSpare = await mongoDbManager.updateOne(Model,
        { _id: spareQuantityId }, // Match documents with IDs in the spareIds array
        { $set: updateObj } // Set the asset field to assetId
        );
      return updatedSpare;
    }catch(error){
      throw error;
    }
}


async function deleteSpareQuantities(ids, userId) {
  try {
    let query = {
      isActive: true,
      spare: { $in: ids },
    };
    let updateObj = { isActive: false ,updatedBy: userId};
    return await mongoDbManager.updateMany(Model, query, updateObj);
  } catch (error) {
    throw error;
  }
}






module.exports ={
    createSpareQuantity,
    getAllSpareQuantities,
    approveSpareQuantity,
    reviseSpareQuantity,
    checkExistingSpareQuantity,
    updateSpareQuantity,
    deleteSpareQuantities,


}



function fieldMappings() {
  return {
    spare: {
      localField: "spare",
      collection: "spares",
      fieldsToInclude: ["name", "id"], // Example fields to include
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

function queryBuilder(reqData, userId) {
  const query = {
    isActive: true,
    ...(reqData.spare && mongoose.Types.ObjectId.isValid(reqData.spare) &&  {
      spare: new mongoose.Types.ObjectId(reqData.spare),
    }),
    ...(reqData.status &&
      typeof reqData.status === "string" && {
        status: {
          $in: reqData.status.split(",").map((p) => new RegExp(`^${p.trim()}$`, "i")),
        },
      }),
    ...(reqData.createdAt && { createdAt: reqData.createdAt }),
    ...(reqData.updatedAt && { updatedAt: reqData.updatedAt }),
  };

//   if (userId) {
//     query["$or"] = [
//       { createdBy: new mongoose.Types.ObjectId(userId) }, 
//     ];
//   }

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