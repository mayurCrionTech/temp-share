const apiResponseHandler = require("../../managers/common/apiResponseHandler_manager");
const processDashBoardManager = require("../../managers/internalManagers/dashBoardManagement/processDashBoard_manager");

const fetchProcessDashboard = async (req, res) => {
    try{
        const data = await processDashBoardManager.getAllProcesssMetrics(req.businessUnit);
        const message = "Process data fetched successfully"
        return apiResponseHandler.successResponse(res, message, 200, data);
    }catch(error){
        return apiResponseHandler.errorResponse(error, req,
              res,
              error.message || "Some internal server error",
              500
            );
    }
}

const fetchProcessActiveHoursDashBoard = async (req, res) => {
    try{
        let data;
        const reqData = req.query;
        const page = reqData.page ? parseInt(reqData.page, 10) : 1;
        const limit = reqData.limit ? parseInt(reqData.limit, 10) : 15;
       
            data = await processDashBoardManager.getTableCards(req.businessUnit,page, limit);
        
        
        return apiResponseHandler.successResponse(res, "Process data fetched successfully", 200, data);
    }catch(error){
        return apiResponseHandler.errorResponse(error, req,
              res,
              error.message || "Some internal server error",
              500
            );
    }
}


module.exports = {
    fetchProcessDashboard,
    fetchProcessActiveHoursDashBoard,
}

