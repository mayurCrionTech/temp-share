const apiResponseHandler = require("../../managers/common/apiResponseHandler_manager");
const dashBoardManager = require("../../managers/internalManagers/dashBoardManagement/dashBoard_manager");

exports.dashboardStats = async (req, res) => {
  try {
    // Default pagination values if not provided
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 15;

    // BusinessUnit from token/context (patch into query for manager)
    const reqQuery = {
      ...req.query,
      businessUnit: req.businessUnit,
      page,
      limit
    };

    // Use manager to get stats and paginated logs
    const { summaryStats, logsTable, totalCount } =
      await dashBoardManager.getLogComplianceStatsAndTable(reqQuery);

    const responseObj = {
      Approval: summaryStats.approval,
      Overdue: summaryStats.overdue,
      Completed: summaryStats.completed,
      logsTable: logsTable,
      totalCount: totalCount,
    
    };

    return apiResponseHandler.successResponse(
      res,
      "Log Compliance Dashboard Fetched Successfully",
      200,
      responseObj
    );
  } catch (error) {
    console.log("error", error);
    return apiResponseHandler.errorResponse(
      error,
      req,
      res,
      error.message,
      500,
      null
    );
  }
};

exports.fetchDashhboard = async (req, res) => {
  try {
    if (req.query.clientId != 2) {
      return apiResponseHandler.errorResponse(
        null,
        req,
        res,
        "Failed! Invalid client Id",
        400,
        null
      );
    }
    const responseObj = await dashBoardManager.fetchProcessDashBoardEntries(
      req.query,
      req.businessUnit
    );
    return apiResponseHandler.successResponse(
      res,
      "DashBoard Fetched Successfully",
      200,
      responseObj
    );
  } catch (error) {
    console.log("error", error);
    return apiResponseHandler.errorResponse(
      error,
      req,
      res,
      error.message,
      500,
      null
    );
  }
};

exports.fetchLatestDashhboardEntries = async (req, res) => {
  try {
    if (req.query.clientId == 2) {
      const responseObj = await dashBoardManager.fetchLatestProcessEntries(
        req.query,
        req.businessUnit
      );
      return apiResponseHandler.successResponse(
        res,
        "Latest Entries Fetched Successfully",
        200,
        responseObj
      );
    } else {
      return apiResponseHandler.errorResponse(
        null,
        req,
        res,
        "Failed! Invalid client Id",
        400,
        null
      );
    }
  } catch (error) {
    console.log("error", error);
    return apiResponseHandler.errorResponse(
      error,
      req,
      res,
      error.message,
      500,
      null
    );
  }
};

exports.fetchProcessDashhboard = async (req, res) => {
  try {
    if (req.query.clientId != 3) {
      return apiResponseHandler.errorResponse(
        null,
        req,
        res,
        "Failed! Invalid client Id",
        400,
        null
      );
    }
    const responseObj = await dashBoardManager.getProcessDashBoardEntries(
      req.query,
      req.businessUnit
    );
    return apiResponseHandler.successResponse(
      res,
      "DashBoard Fetched Successfully",
      200,
      responseObj
    );
  } catch (error) {
    console.log("error", error);
    return apiResponseHandler.errorResponse(
      error,
      req,
      res,
      error.message,
      500,
      null
    );
  }
};

exports.fetchLatestProcessDashhboardEntries = async (req, res) => {
  try {
    if (req.query.clientId == 3) {
      const responseObj = await dashBoardManager.getLatestProcessEntries(
        req.query,
        req.businessUnit
      );
      return apiResponseHandler.successResponse(
        res,
        "Latest Entries Fetched Successfully",
        200,
        responseObj
      );
    } else {
      return apiResponseHandler.errorResponse(
        null,
        req,
        res,
        "Failed! Invalid client Id",
        400,
        null
      );
    }
  } catch (error) {
    console.log("error", error);
    return apiResponseHandler.errorResponse(
      error,
      req,
      res,
      error.message,
      500,
      null
    );
  }
};

// energyDashboard

exports.energyDashboard = async (req, res) => {
  try {
    if (req.query.clientId == 2) {
      const responseObj = await dashBoardManager.energyDashboard(
        req.query,
        req.businessUnit
      );
      return apiResponseHandler.successResponse(
        res,
        "Energy Dashboard Fetched Successfully",
        200,
        responseObj
      );
    } else {
      return apiResponseHandler.errorResponse(
        null,
        req,
        res,
        "Failed! Invalid client Id",
        400,
        null
      );
    }
  } catch (error) {
    console.log("error", error);
    //   const statusCode = error.statusCode || 500;
    //   const message = "Dashboard not found."|| error.message;
    return apiResponseHandler.errorResponse(
      error,
      req,
      res,
      "Some internal server error",
      500,
      null
    );
  }
};

exports.fetchLatestQualityDashboardEntries = async (req, res) => {
  try {
    if (req.query.clientId == 2 && req.query.plantName == "plant4") {
      const responseObj = await dashBoardManager.fetchLatestQualityEntries(
        req.query,
        req.businessUnit
      );
      return apiResponseHandler.successResponse(
        res,
        "Latest Entries Fetched Successfully",
        200,
        responseObj
      );
    } else {
      return apiResponseHandler.errorResponse(
        null,
        req,
        res,
        "Failed! Invalid client Id or Plant Details",
        400,
        null
      );
    }
  } catch (error) {
    console.log("error", error);
    return apiResponseHandler.errorResponse(
      error,
      req,
      res,
      "Some internal server error",
      500,
      null
    );
  }
};
//   fetchLatestQualityEntries

exports.fetchQualityDashhboard = async (req, res) => {
  try {
    if (req.query.clientId == 2 && req.query.plantName == "plant4") {
      const responseObj = await dashBoardManager.fetchQualityDashboard(
        req.query,
        req.businessUnit
      );
      return apiResponseHandler.successResponse(
        res,
        "Latest Entries Fetched Successfully",
        200,
        responseObj
      );
    } else {
      return apiResponseHandler.errorResponse(
        null,
        req,
        res,
        "Failed! Invalid client Id",
        400,
        null
      );
    }
  } catch (error) {
    console.log("error", error);
    return apiResponseHandler.errorResponse(
      error,
      req,
      res,
      error.message,
      500,
      null
    );
  }
};

exports.getLiveDashboardData = async (req, res) => {
  try {
    if (req.query.clientId == 2 ) {
      const responseObj = await dashBoardManager.getLiveDashboardInitialData({plcName:"plcName" ,businessUnit:req.businessUnit});
      return apiResponseHandler.successResponse(
        res,
        "Latest Entries Fetched Successfully",
        200,
        responseObj
      );
    } else {
      return apiResponseHandler.errorResponse(
        null,
        req,
        res,
        error.message,
        "Failed! Invalid client Id",
        400,
        null
      );
    }
  } catch (error) {
    console.log("error", error);
    return apiResponseHandler.errorResponse(
      error,
      req,
      res,
      error.message,
      500,
      null
    );
  }
};

exports.getDashboardSections = async (req, res) => {
   try {
    const { sectionName , clientId ,date} = req.query;
    if(clientId == 2 ){
    if (!sectionName) {
      return res.status(400).json({
        message: "plcName query parameter is required"
      });
    }

    const responseObj = await dashBoardManager.getLiveDashboardSectionData(sectionName,date);

    if (responseObj?.error) {
      return res.status(404).json({
        message: responseObj.message
      });
    }

    return apiResponseHandler.successResponse(
        res,
        "Latest Entries Fetched Successfully",
        200,
        responseObj
      );
      
    }else{
      return apiResponseHandler.errorResponse(
        null,
        req,
        res,
        "Failed! Invalid client Id",
        400,
        null
      )
    }
    

  } catch (error) {
    return apiResponseHandler.errorResponse(
        null,
        req,
        res,
         error.message,
        400,
        null
      );
  } 
}

/*************  ✨ Windsurf Command ⭐  *************/
/*******  1854c296-fb63-43f5-8670-49a72e798fd0  *******/
exports.fetchPlants = async (req, res) => {
  try {
    if (req.query.clientId == 2) {
      const responseObj = await dashBoardManager.getPlants(req.businessUnit);
      return apiResponseHandler.successResponse(
        res,
        "Latest Entries Fetched Successfully",
        200,
        responseObj
      );
    } else {
      return apiResponseHandler.errorResponse(
        null,
        req,
        res,
        "Failed! Invalid client Id",
        400,
        null
      );
    }
  } catch {
    console.log("error", error);
    return apiResponseHandler.errorResponse(
      error,
      req,
      res,
      error.message,
      500,
      null
    );
  }
};

// powerbi dashboard controllers

exports.getAllPowerBiDashboards = async (req, res) => {
  try {
    const businessUnitId = req.businessUnit;

    const dashboards = await dashBoardManager.getPowerBiDashBoards(
      businessUnitId
    );
    return apiResponseHandler.successResponse(
      res,
      "Dashboards fetched successfully",
      200,
      dashboards
    );
  } catch (error) {
    return apiResponseHandler.errorResponse(
      error,
      req,
      res,
      "Failed to fetch dashboards",
      500,
      null
    );
  }
};

exports.createPowerBiDashboard = async (req, res) => {
  try {
    const reqBody = req.body;
    reqBody.businessUnit = req.businessUnit;
    const dashboard = await dashBoardManager.createPowerBiDashboard(reqBody);
    return apiResponseHandler.successResponse(
      res,
      "Dashboard created successfully",
      201,
      {"id": dashboard._id}
    );
  } catch (error) {
    console.error("Error creating Power BI dashboard:", error);
    return apiResponseHandler.errorResponse(
      error,
      req,
      res,
      "some internal server error",
      500,
      null
    );
  }
};

exports.updatePowerBiDashboard = async (req, res) => {
  try {
    const dashboardId = req.params.id;
    const dashboard = await dashBoardManager.updatePowerBiDashboard({
      ...req.body,
      _id: dashboardId,
    });

    if (!dashboard) {
      return apiResponseHandler.errorResponse(
        null,
        req,
        res,
        "Dashboard not found",
        404,
        null
      );
    }

    return apiResponseHandler.successResponse(
      res,
      "Dashboard updated successfully",
      200,
      dashboard
    );
  } catch (error) {
    return apiResponseHandler.errorResponse(
      error,
      req,
      res,
      "Failed to update dashboard",
      400,
      null
    );
  }
};

exports.deletePowerBiDashboard = async (req, res) => {
  try {
    const dashboardId = req.params.id;
    const result = await dashBoardManager.deletePowerBiDashboard({
      _id: dashboardId
    });

    if (!result || result.deletedCount === 0) {
      return apiResponseHandler.errorResponse(
        null,
        req,
        res,
        "Dashboard not found",
        404,
        null
      );
    }

    return apiResponseHandler.successResponse(
      res,
      "Dashboard deleted successfully",
      200,
      result
    );
  } catch (error) {
    return apiResponseHandler.errorResponse(
      error,
      req,
      res,
      "Failed to delete dashboard",
      500,
      null
    );
  }
};
