/*
date            qid / cr#         comments
16-mar-2026     CR0002           filteration for REPORTLIST

*/
const {
  reportCreation,
  moduleData,
  getReportCount,
  getAllReports,
  reportDetails,
  approveReport,
  getAllComments,
  postComment,
  fetchHistory,
  regenerateReport,
  entryReportCreation,
  generateExcelComplianceReport
} = require("../../managers/internalManagers/reportManagement/report_manager");
const {
  REPORT_MODULES,
  REPORT_FORMAT,
  REPORT_STATUS,
} = require("../../utils/constants");
const apiResponseHandler = require("../../managers/common/apiResponseHandler_manager");
const fileManager = require("../../managers/internalManagers/fileSystem/fileSystem_manager");
const paginationHandler = require("../../managers/common/paginationHandler_manager")

const getReportModule = async (req, res) => {
  try {
    const modules = REPORT_MODULES;
    if (modules) {
      return apiResponseHandler.successResponse(
        res,
        "Modules for report",
        200,
        modules
      );
    }
    return apiResponseHandler.successResponse(res, "No modules", 200, []);
  } catch (error) {
    return apiResponseHandler.errorResponse(error, req, res, error, 400, {});
  }
};

const getReportFormat = async (req, res) => {
  try {
    const formats = REPORT_FORMAT;
    if (formats) {
      return apiResponseHandler.successResponse(
        res,
        "Formats for report",
        200,
        formats
      );
    }
    return apiResponseHandler.successResponse(res, "No formats", 400, []);
  } catch (error) {
    return apiResponseHandler.errorResponse(error, req, res, error, 400, {});
  }
};

const getModuleData = async (req, res) => {
  try {
    const { module, status, page, limit, entityName } = req.query;
    if (module === null || module === undefined) {
      return apiResponseHandler.errorResponse(null, req,
        res,
        "Please provide module",
        400,
        {}
      );
    }
    // if (!REPORT_MODULES.includes(module)) {
    const matchedModule = REPORT_MODULES.find(
      (m) => m.toLowerCase() === module.toLowerCase()
    );
    if (!matchedModule) {
      return apiResponseHandler.errorResponse(null, req,
        res,
        `Please provide correct module name,valid modules are ${REPORT_MODULES}`,
        400,
        {}
      );
    }
    let pageNumber = page ? page : 1;
    let pageLimit = limit ? limit : 15;
    const data = await moduleData(
      // module,
      matchedModule,
      status,
      pageNumber,
      pageLimit,
      entityName,
      req.businessUnit,
      req.userId
    );
    if (data !== null) {
      return apiResponseHandler.successResponse(
        res,
        "Module entities",
        200,
        data
      );
    }
    return apiResponseHandler.successResponse(
      res,
      "Module entities not available",
      200,
      []
    );
  } catch (error) {
    return apiResponseHandler.errorResponse(error, req, res, error, 400, {});
  }
};

const createReport = async (req, res) => {
  try {
    const userId = req.userId;
    const reqData = req.body;
    const reqHost = req.get("host");
    const reqProtocol = req.protocol;
    const report = await reportCreation(reqData, userId, reqHost, reqProtocol);
    return apiResponseHandler.successResponse(
      res,
      "Report created successfully",
      200,
      report
    );
  } catch (error) {
    console.log(error);
    return apiResponseHandler.errorResponse(error, req, res, error, 400, {});
  }
};

const reportCount = async (req, res) => {
  try {
    const userId = req.userId;
    const count = await getReportCount(userId, req.businessUnit);
    return apiResponseHandler.successResponse(
      res,
      "Report status count details",
      200,
      count
    );
  } catch (error) {
    console.log(error);
    return apiResponseHandler.errorResponse(error, req, res, error, 400, {});
  }
};

const reports = async (req, res) => {
  try {
    //CR0002
    const userId = req.userId;  //Start
    const { 
      page,
      limit,
      module,
      allData,
      // filter fields (sent by the frontend via convertMuiFilterModelToApiParams)
      reportNumber,
      reportName,
      status,
      moduleName: moduleNameFilter,
      moduleEntityNumber,
      asset,
      departments,
      assignees,
    } = req.query;

    const moduleName = module || moduleNameFilter || "";

    // Bundle all filter fields into one object for the manager
    const filterParams = {
      reportNumber,
      reportName,
      status,
      moduleName: moduleNameFilter, // manager merges this with positional moduleName
      moduleEntityNumber,
      asset,
      departments,
      assignees,
    };
//End
    const allReports = await getAllReports(
      userId,
      page,
      limit,
      moduleName,
      allData,
      req.businessUnit,
      //start
      //CR0002
      filterParams 
      // //End
    );
    const data = allReports?.data ?? [];
    if (data.length === 0) {
      return apiResponseHandler.successResponse(
        res,
        "No reports are available",
        200,
        []
      );
    }
    return apiResponseHandler.successResponse(res, "reports", 200, allReports);
  } catch (error) {
    console.log(error);
    return apiResponseHandler.errorResponse(error, req, res, error, 400, {});
  }
};

const getReportDetails = async (req, res) => {
  try {
    const userId = req.userId;
    const { reportId } = req.params;
    const report = await reportDetails(reportId, userId, req);
    if (report) {
      return apiResponseHandler.successResponse(
        res,
        "Report details",
        200,
        report
      );
    }
    return apiResponseHandler.errorResponse(
      res,
      "Please Provide correct report id",
      400,
      err
    );
  } catch (error) {
    return apiResponseHandler.errorResponse(error, req, res, error, 400, {});
  }
};

const approveTheReport = async (req, res) => {
  try {
    const userId = req.userId;
    const { reportId } = req.params;
    const reqData = req.body;
    const status = reqData ? reqData.status || "" : "";
    const statuses = REPORT_STATUS || [];
    if (!statuses.includes(status)) {
      return apiResponseHandler.errorResponse(
        "Please provide correct status",
        req,
        res,
        "Please provide correct status",
        400,
        {}
      );
    }
    const report = await approveReport(userId, reportId, reqData);
    if (report.success) {
      return apiResponseHandler.successResponse(
        res,
        "Report status updated",
        200,
        { status: report.status }
      );
    } else {
      const message = report.message;
      return apiResponseHandler.errorResponse(
        message,
        req,
        res,
        message,
        400,
        {}
      );
    }
  } catch (error) {
    console.log("error:", error);
    return apiResponseHandler.errorResponse(error, req, res, error, 400, {});
  }
};

const getComments = async (req, res) => {
  try {
    const userId = req.userId;
    const { reportId } = req.params;

    // Fetch all comments
    const comments = await getAllComments(userId, reportId);
    const commentCount = comments.length;

    // Parse pagination from query or default values
    let page = req.query.page ? parseInt(req.query.page, 10) : 1; // Default to page 1
    let limit = req.query.limit ? parseInt(req.query.limit, 10) : commentCount; // Default to all records if limit isn't specified
    
    if (isNaN(page) || page < 1) page = 1; 
    if (isNaN(limit) || limit < 1) limit = commentCount; // Default to total records if invalid

    const totalPages = commentCount === 0 ? 0 : Math.ceil(commentCount / limit);
    const skip = (page - 1) * limit;

    // Paginate comments
    const paginatedComments = comments.slice(skip, skip + limit);

    const data = paginationHandler.paginationResObj(
      page,
      totalPages,
      commentCount,
      paginatedComments
    );

    return apiResponseHandler.successResponse(
      res,
      "All comments",
      200,
      data
    );
  } catch (error) {
    console.error(error);
    return apiResponseHandler.errorResponse(error, req, res, "Some error occurred", 400, {});
  }
};

const addComments = async (req, res) => {
  try {
    const userId = req.userId;
    const { reportId } = req.params;
    const reqData = req.body;
    const result = await postComment(userId, reportId, reqData);
    if (result.success) {
      return apiResponseHandler.successResponse(
        res,
        "Comment added successfully",
        200,
        {}
      );
    } else {
      const message = result.message;
      return apiResponseHandler.errorResponse(
        message,
        req,
        res,
        message,
        400,
        {}
      );
    }
  } catch (error) {
    console.log(error);
    return apiResponseHandler.errorResponse(error, req, res, error, 400, {});
  }
};

const reportHistory = async (req, res) => {
  try{
    const historyData = await fetchHistory(req.query, req.params.reportId);
    if (historyData.data && historyData.data.length > 0) {
      const fileDocuments = [];
      for (let document of historyData.data) {
        if (document.history) {
          if (document.history.length) {
            for (let i = 0; i < document.history.length; i++){
              const images = await fileManager.transformFileObj(
              document.history[i],
              "view",
              req.get("host"),
              req.protocol
            );
            fileDocuments.push(images);}
          }
          else {
            const images = await fileManager.transformFileObj(
              document.history,
              "view",
              req.get("host"),
              req.protocol
            );
            fileDocuments.push(images);
          }
        } else {
          const data = paginationHandler.paginationResObj(1,1,0,[]);
          return apiResponseHandler.successResponse(
            res,
            "No History for this report.",
            200,
            data
          );
        }
      }
      historyData.data = fileDocuments;
    }
    return apiResponseHandler.successResponse(
      res,
      "Report History fetched successfully",
      200,
      historyData
    );
  }catch(error){
    console.log(error);
    return apiResponseHandler.errorResponse(error, req, res, "Some internal server", 500, {});
  }
}

const regenrateRepert = async (req, res) => {
  try{
    const reportId = req.reportId
    const reqHost = req.get("host");
    const reqProtocol = req.protocol;
    const regeneratedReport = await regenerateReport(reportId,req.userId,reqHost,reqProtocol)
    return apiResponseHandler.successResponse(res,"Report regenerated successfully",200,null);
  }catch(error){
    console.log(error);
    return apiResponseHandler.errorResponse(error, req, res, error, 500, {});
  }
}

const getSingleEntryReport = async (req,res) => {
  try{
    const userId = req.userId;
    const entryId = req.params.entryId;
    const logId = req.params.logId;
    const reqHost = req.get("host");
    const reqProtocol = req.protocol;
    const report = await entryReportCreation(entryId,logId, userId, reqHost, reqProtocol);
    return apiResponseHandler.successResponse(
      res,
      "Report generated successfully",
      201,
      report
    );
  }catch(error){
    console.log(error);
    return apiResponseHandler.errorResponse(error, req, res, error, 500, {});
  }
};
const downloadComplianceReport  = async (req,res) => {
  try{
    const { startDate, endDate } = req.body; // Or req.query if GET
    if(!startDate || !endDate){
      return apiResponseHandler.errorResponse(
        "Please provide start date and end date",
        req,
        res,
        "Please provide start date and end date",
        400,
        {}
      );
    }
    const buffer = await generateExcelComplianceReport({ startDate, endDate });

    res.setHeader('Content-Disposition', 'attachment; filename="Log_Compliance_Report.xlsx"');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
  }catch(error){
    console.log(error);
    return apiResponseHandler.errorResponse(error, req, res, error, 500, {});
  }
};

module.exports = {
  getReportModule,
  getReportFormat,
  getModuleData,
  createReport,
  reportCount,
  reports,
  getReportDetails,
  approveTheReport,
  getComments,
  addComments,
  reportHistory,
  regenrateRepert,
  getSingleEntryReport,
  downloadComplianceReport
};
