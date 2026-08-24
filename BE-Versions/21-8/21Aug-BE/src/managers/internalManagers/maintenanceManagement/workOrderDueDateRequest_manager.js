const {mongoDbManager} = require('../../dBManagers/index')
const workOrderDueDateRequest = require('../../../models/mongoDB/maintenanceManagement/workOrderDueDateRequest_model')
const mongoose = require('mongoose')
const paginationHandler = require("../../common/paginationHandler_manager");
const dataConstructor = require("../../../managers/common/DataObjectConstructor_manager.js")
const {
  sendViaUserID,
  } = require('../../../utils/socket/socketHandler.js');
const {
  workOrders,
} = require("../../../models/mongoDB/maintenanceManagement/workOrder_model");
const User = require("../../../models/mongoDB/userManagement/user_model");



async function createWorkOrderDueDateRequest(workOrderDueDateObject) {
    try{
    const workOrderDueDate = await mongoDbManager.insertOne(workOrderDueDateRequest, workOrderDueDateObject);  
    await handleNotificationForDueDateRequest(workOrderDueDate, workOrderDueDate.createdBy)
    return workOrderDueDate;
}
catch(error){
throw (error)
};
};

async function updateWorkOrderDueDateRequest(workOrderDueDateObj){
    try{
      const updateDueRequest =  await mongoDbManager.updateOne(workOrderDueDateRequest,{_id: workOrderDueDateObj.id},{$set:{
        reason: workOrderDueDateObj.reason,
        requestedDate: workOrderDueDateObj.requestedDate,
        updatedBy: workOrderDueDateObj.updatedBy,
        approvedBy: workOrderDueDateObj.approvedBy,
        updatedAt : workOrderDueDateObj.updatedAt,
        approvedDate: workOrderDueDateObj.approvedDate,
        isDeleted:"true"
      }})
      await handleNotificationForDueDateApproval(workOrderDueDateObj,workOrderDueDateObj.updatedBy)
    }catch(error){
      throw error;
    }
  }

  async function handleNotificationForDueDateApproval (doc,reqUserId){
  try{
    if(doc.workOrderId){
      const userObj = await mongoDbManager.findOne(User, {_id:reqUserId, isDeleted: false}, {name:1})
      const workOrderObj = await mongoDbManager.findOne(workOrders,{_id:doc.workOrderId, isDeleted: false},{name:1, businessUnit:1, assignees:1})
      await sendNotifications(
        "approve",
        `has been approved for Extension by ${userObj.name}.`,
        doc.workOrderId,
        workOrderObj.name,
        workOrderObj.assignees[0].toString(),
        workOrderObj.businessUnit
      );
    }
}
catch(error){
  console.log("error",error)
  throw error;
}
}


  async function checkExistingWorkOrderDueDate(query) {
    try {
      const existingWorkOrderDueDate = await mongoDbManager.findOne(workOrderDueDateRequest, query);
      return existingWorkOrderDueDate;
    } catch (error) {
      throw error;
    }
  }

  async function fetchDueDateRequests(reqData,workOrderId, businessUnitId) {
    try {
      const queryObj = queryBuilder(reqData, workOrderId, businessUnitId);
      const fieldMapping = fieldMappings();
      const countData = await mongoDbManager.count(workOrderDueDateRequest, queryObj.query);
      
      // Handle cases where either page or limit is not provided
      if (queryObj.page === null && queryObj.limit === null) {
        queryObj.limit = countData || 1; // Set limit to the total number of records if no limit is provided
        queryObj.page = 1; // Set page to 1 if no page is provided
      } else if (queryObj.page === null) {
        queryObj.page = 1; // Set default page to 1 if not provided
      } else if (queryObj.limit === null) {
        queryObj.limit = countData; // Set limit to the total number of records if no limit is provided
      }
  
      if (queryObj.limit === 0 && queryObj.page > 1) {
        return paginationHandler.paginationResObj(
          queryObj.page,
          1,
          countData,
          []
        );
      }
  
      const populateFields = ["createdBy", "updatedBy","approvedBy"];
  
      const selectFields = [
        "reason",
        "requestedDate",
        "approvedBy",
        "approvedDate",   
        "createdAt",
        "updatedAt",
        "createdBy",
        "updatedBy"
      ];
      let data = await mongoDbManager.fetchAllAndPopulate(
        workOrderDueDateRequest,
        queryObj.query,
        fieldMapping,
        queryObj.limit,
        queryObj.page,
        queryObj.sortOrder,
        populateFields,
        selectFields
      );
  
      if (data) {
        data = data.map((result) => {
          const { _id, ...rest } = result;
          return { ...rest, id: _id };
        });
      }
  
      const totalPages =
        countData === 0
          ? 0
          : queryObj.limit === 0
          ? 1
          : Math.ceil(countData / queryObj.limit);
  
      return paginationHandler.paginationResObj(
        queryObj.page,
        totalPages,
        countData,
        data
      );
    } catch (error) {
      throw error;
    }
  }

  async function handleNotificationForDueDateRequest (doc,reqUserId){
  try{
    if(doc.workOrderId){
      const workOrderObj = await mongoDbManager.findOne(workOrders,{_id:doc.workOrderId, isDeleted: false},{name:1, businessUnit:1, createdBy:1})
      const userObj = await mongoDbManager.findOne(User, {_id:reqUserId, isDeleted: false}, {name:1})
      await sendNotifications(
        "requested",
        `has been requested for Extension by ${userObj.name}.`,
        doc.workOrderId,
        workOrderObj.name,
        workOrderObj.createdBy.toString(),
        workOrderObj.businessUnit
      );
    }
}
catch(error){
  console.log("error",error)
  throw error;
}
}


  async function sendNotifications(
    title,
    message,
    id,
    name,
    reqUserId,
    businessUnit
  ) {
    try {
      const data = dataConstructor.constructNotification(
        title,
        message,
        { id: id, name: name },
        "workOrders",
        reqUserId,
        businessUnit
      );
      await sendViaUserID("notification", reqUserId, data);
    } catch (err) {
      throw err;
    }
  }
  

module.exports = {
    createWorkOrderDueDateRequest,
    updateWorkOrderDueDateRequest,
    checkExistingWorkOrderDueDate,
    fetchDueDateRequests,
    
}

function fieldMappings() {
  return {
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
    approvedBy: {
      localField: "approvedBy",
      collection: "users",
      fieldsToInclude: ["name", "email", "id"], // Example fields to include
    },

  };
}

function queryBuilder(reqData, workOrderId, businessUnitId) {
	const query = {
    isDeleted: false,
		...(workOrderId && {
			"workOrderId": new mongoose.Types.ObjectId(workOrderId)
		}),
    ...(businessUnitId && {
			"businessUnit": new mongoose.Types.ObjectId(businessUnitId)
		}),
	};

	const page = reqData.page ? parseInt(reqData.page, 10) : null;
	const limit = reqData.limit ? parseInt(reqData.limit, 10) : null;
	const skip = page && limit ? (page - 1) * limit : 0;
	const sort = reqData.sort || "createdAt";
	const order = reqData.order === "asc" ? 1 : -1;
	const sortOrder = { [sort]: order };

	return {
		query,
		skip,
		page,
		limit,
		sortOrder
	};
}