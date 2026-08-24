const apiResponseHandler = require("../../managers/common/apiResponseHandler_manager");
const assetDashBoardManager = require("../../managers/internalManagers/dashBoardManagement/assetDashBoard_manager");

const fetchAssetDashboard = async (req, res) => {
    try{
        const data = await assetDashBoardManager.getAllAssetsMetrics(req.businessUnit);
        const message = "Asset data fetched successfully"
        return apiResponseHandler.successResponse(res, message, 200, data);
    }catch(error){
        return apiResponseHandler.errorResponse(error, req,
              res,
              error.message || "Some internal server error",
              500
            );
    }
}

const fetchAssetActiveHoursDashBoard = async (req, res) => {
    try{
        let data;
        const reqData = req.query;
        const page = reqData.page ? parseInt(reqData.page, 10) : 1;
	    const limit = reqData.limit ? parseInt(reqData.limit, 10) : 15;
        if (reqData.activeAssetHours){
            data = await assetDashBoardManager.getAssetsActiveHoursLast12Months(page, limit);
        }
        if(reqData.onTimeWorkorders){
            data = await assetDashBoardManager.getWorkOrdersOnTimeCompletionLast12Months(page, limit);
        }
        return apiResponseHandler.successResponse(res, "Asset data fetched successfully", 200, data);
    }catch(error){
        return apiResponseHandler.errorResponse(error, req,
              res,
              error.message || "Some internal server error",
              500
            );
    }
}


module.exports = {
    fetchAssetDashboard,
    fetchAssetActiveHoursDashBoard,
}

