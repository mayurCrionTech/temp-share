const {WorkOrderRemarks} = require("../../../models/mongoDB/maintenanceManagement/workOrderRemark_model");
const { mongoDbManager } = require("../../dBManagers/index");
const paginationHandler = require("../../common/paginationHandler_manager");
const mongoose = require("mongoose");


async function createWorkOrderRemarks(workOrderRemarksObject) {
  try {
    const createdworkOrderRemarks = await mongoDbManager.insertOne(
      WorkOrderRemarks,
      workOrderRemarksObject
    );
    return createdworkOrderRemarks;
  } catch (error) {
    throw error;
  }
}

async function getRemarks (reqData, workOrderId, businessUnitId) {
  try{
    const queryObj = queryBuilder(reqData, workOrderId, businessUnitId);
		const fieldMapping = fieldMappings();
		const countData = await mongoDbManager.count(WorkOrderRemarks, queryObj.query);

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
			return paginationHandler.paginationResObj(queryObj.page, 1, countData, []);
		}

		const populateFields = ["createdBy","updatedBy", 
      // "workOrderId" 
    ];

		const selectFields = ["remark", "workOrderId", "createdBy", "updatedBy", "createdAt","updatedAt"];

		let data = await mongoDbManager.fetchAllAndPopulate(
			WorkOrderRemarks,
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

		const totalPages = countData === 0 ? 0 : queryObj.limit === 0 ? 1 : Math.ceil(countData / queryObj.limit);

		return paginationHandler.paginationResObj(queryObj.page, totalPages, countData, data);
  }catch(error){
    throw error;
  }
}

module.exports = {
  createWorkOrderRemarks,
  getRemarks,
};


function fieldMappings() {
  return {
    // workOrderId: {
    //   localField: "workOrderId",
    //   collection: "WorkOrders",
    //   fieldsToInclude: ["name","number", "id"], // Example fields to include
    // },
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

function queryBuilder(reqData,workOrderId,businessUnitId) {
	const query = {
    isDeleted: false,
		...(reqData.remark && {
			"remark": { $regex: reqData.remark, $options: "i" }
		}),
		...(workOrderId && {
			"workOrderId": new mongoose.Types.ObjectId(workOrderId)
		}),
		...(businessUnitId && {
			"businessUnit": new mongoose.Types.ObjectId(businessUnitId)
		}),
		// ...(reqData.department && {
		// 	"departments": new mongoose.Types.ObjectId(reqData.department)
		// }),
		// ...(reqData.createdAt && { createdAt: req.createdAt }),
		// ...(reqData.updatedAt && { updatedAt: req.updatedAt })
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