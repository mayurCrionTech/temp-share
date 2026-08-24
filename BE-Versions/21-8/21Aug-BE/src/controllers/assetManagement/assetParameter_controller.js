const assetParameterManager = require("../../managers/internalManagers/assetManagement/assetParameter_manager");
const apiResponseHandler = require("../../managers/common/apiResponseHandler_manager");
const { LiveData } = require("../../models/mongoDB/liveDataManagement/liveData_model");

// const createAssetParameter = async (req, res) => {

// 	try {
// 		const createdAssetParaMeter = await assetParameterManager.createAssetParameter(req.assetParameterCreateObject);
// 		const message = "Parameter created successfully";
// 		return apiResponseHandler.successResponse(res, message, 201, createdAssetParaMeter);
// 	} catch (error) {
// 		console.log("Some error happened while creating parameter", error.message);
// 		return apiResponseHandler.errorResponse(error, req, res, "Some internal server error", 500);
// 	}
// };
const createAssetParameter = async (req, res) => {

	try {
		
		const tagId=req.body.tagId
		if(!tagId){
			return apiResponseHandler.errorResponse(null, req, res, "tagId is required", 500);
		}
		
		const createdAssetParaMeter = await assetParameterManager.createAssetParameter(tagId,req.businessUnit,req.asset)
		const message = "Parameter created successfully";
		return apiResponseHandler.successResponse(res, message, 201, createdAssetParaMeter);
	} catch (error) {
		console.log("Some error happened while creating parameter", error.message);
		return apiResponseHandler.errorResponse(error, req, res, "Some internal server error", 500);
	}
};
const createAssetParameters = async (req, res) => {
	try {
		const data = await assetParameterManager.createAssetParameters(req.assetParameterCreateObjects);
		console.log("data", data)
		return apiResponseHandler.successResponse(res, "Parameters created successfully", 201, data);
	} catch (error) {
		console.log("Some error happened while creating parameters", error.message);
		return apiResponseHandler.errorResponse(error, req, res, "Some internal server error", 500);
	}
}

const updateAssetParameter = async (req, res) => {
	try {
		const { asset ,parameter } = req.params;
		const updatedAssetParameter = await assetParameterManager.updateAssetParameter(parameter, req.body,asset,req.businessUnit);
		return apiResponseHandler.successResponse(res, "Parameter updated successfully", 200, null);
	} catch (error) {
		console.log("Some error happened while updating parameter", error.message);
		return apiResponseHandler.errorResponse(error, req, res, "Some internal server error", 500);
	}
};

const bulkUpdateParameters = async (req, res) => {
	const { parametersToDelete } = req.body;

	try {
		// Process deletions
		if (parametersToDelete) {
			await assetParameterManager.deleteAssetParameters(parametersToDelete);
		}

		// Process updates
		await assetParameterManager.updateAssetParameters(req.assetParameterUpdateObjects);

		return apiResponseHandler.successResponse(res, "Parameters updated successfully", 200, null);
	} catch (error) {
		console.log("Some error happened while processing parameters", error.message);
		return apiResponseHandler.errorResponse(error, req, res, "Some internal server error", 500);
	}
};

const bulkDeleteParameters = async (req, res) => {
	const { parametersToDelete,asset } = req.body;

	try {
		await assetParameterManager.deleteAssetParameters(parametersToDelete,asset);
		return apiResponseHandler.successResponse(res, "Parameters deleted successfully", 200, null);
	} catch (error) {
		console.log("Some error happened while deleting parameters", error.message);
		return apiResponseHandler.errorResponse(error, req, res, "Some internal server error", 500);
	}
};

const fetchAssetParameters = async (req, res) => {
	try {
		const reqData = req.query;
		reqData.asset = req.params.asset;
		reqData.businessUnit = req.businessUnit
		const data = await assetParameterManager.getAssetParameters(reqData);
		return apiResponseHandler.successResponse(res, "Parameters fetched successfully", 200, data);
	} catch (error) {
		console.log("Some error happened while fetching parameters", error.message);
		return apiResponseHandler.errorResponse(error, req, res, "Some internal server error", 500);
	}
};


const fetchAssetParameter = async (req, res) => {
	try{
		const reqData = req.query;
		reqData.asset = req.params.asset;
		reqData.businessUnit = req.businessUnit;
		const assetParameterId = req.assetParameterObj._id;
		const data = await assetParameterManager.getParameter(assetParameterId, reqData);
		return apiResponseHandler.successResponse(res, "Parameters fetched successfully", 200, data);
	}catch(error){
		console.log(error)
		return apiResponseHandler.errorResponse(error, req, res, "Some internal server error", 500);
	}
}

const getLiveDataAssetParameters= async(req,res)=>{
	try{
		const reqData = req.query;
		const businessUnit = req.businessUnit
		if(businessUnit!=="6641959acbe6ea3941e60789"){
			return apiResponseHandler.successResponse(res, "Parameters fetched successfully", 200, []);

		}
		reqData.asset = req.params.asset;
		reqData.businessUnit = req.businessUnit;
		const data = await assetParameterManager.fetchLiveDataTags(reqData)
		return apiResponseHandler.successResponse(res, "Parameters fetched successfully", 200, data);
	}catch(error){
		console.log(error)
		return apiResponseHandler.errorResponse(error, req, res, "Some internal server error", 500);
	}
}






module.exports = {
	createAssetParameter,
	createAssetParameters,
	updateAssetParameter,
	bulkUpdateParameters,
	bulkDeleteParameters,
	fetchAssetParameters,
	fetchAssetParameter,
	getLiveDataAssetParameters
};
