const apiResponseHandler = require("../../managers/common/apiResponseHandler_manager");
const {checkExistingReport} = require("../../managers/internalManagers/reportManagement/report_manager");
const {checkExistingLog, checkExistingLogEntries} = require("../../managers/internalManagers/logManagement/log_manager")
const {checkExistingWorkOrder} = require("../../managers/internalManagers/maintenanceManagement/workOrder_manager")
const mongoose = require("mongoose");
const { mongoDbManager } = require("../../managers/dBManagers");
const {
  LogEntryModel,
} = require("../../models/mongoDB/logManagement/logEntry_model");


const validateReport = async (req,res,next) => {
    try{
        if(req.params.reportId || req.query.reportId || req.body.reportId){
            req.reportId = req.params.reportId || req.query.reportId || req.body.reportId
            if (!mongoose.Types.ObjectId.isValid(req.reportId)) {
                return apiResponseHandler.errorResponse(
                  null,
                  req,
                  res,
                  `Failed! ReportId is not valid`,
                  400,
                  null
                );
              }
        let existingReports = await checkExistingReport(req.reportId);
        if(existingReports){
            return next();
        }
        else{
            return apiResponseHandler.errorResponse(null, req,
                res,
                "Report doesn't exists",
                400,
                null
              );
        }
        }
        else{
            return apiResponseHandler.errorResponse(null, req,
                res,
                "Please pass reportId",
                400,
                null
              );
        }
    }catch(error){
        throw error;
    }
}

const checkStatusBeforeRegenerate = async (req,res,next) => {
    try{
        let existingReports = await checkExistingReport(req.reportId);
        req.report = existingReports;
        if(existingReports.status !== "revised"){
            return apiResponseHandler.errorResponse(null, req,
                res,
                `Cannot regenerate report when status is ${existingReports.status}`,
                400,
                null
            );
        }
        else{
            return next();
        }
    }catch(error){
        throw error
    }
}

const validateReportOfLog = async (req, res, next) => {
    try{
        if (req.body.moduleEntityId && req.body.moduleName == "logs"){
            const checkLog = await checkExistingLog(req.body.moduleEntityId)
            if(checkLog){
                return next();
            }else{
                return apiResponseHandler.errorResponse(null, req,
                    res,
                    `Provide valid LogId`,
                    400,
                    null
                );
            }
        }
        else if (req.body.moduleEntityId && req.body.moduleName == "workorders"){
             const checkWorkorder = await checkExistingWorkOrder({_id: req.body.moduleEntityId, isDeleted : false})
            if(checkWorkorder){
                return next();
            }else{
                return apiResponseHandler.errorResponse(null, req,
                    res,
                    `Provide valid Workorder Id`,
                    400,
                    null
                );
            }
        }else{
            return apiResponseHandler.errorResponse(null, req,
                res,
                `Provide moduleEntityId field in req.body`,
                400,
                null
            );
        }
    }catch (error){
        throw error;
    }
}
const checkDocumentPresentBeforeRegenerate = async (req,res,next) => {
    try{
        if(req.report.documentId === null){
            return next();
        }else{
            return apiResponseHandler.errorResponse(null, req,
                res,
                `Cannot Regenerate Report due to pending document approval or revision`,
                400,
                null
            );
        }
    }catch(error){
        throw error;
    }
}


const validateLogEntries = async(req,res,next) => {
  try{
      if (req.params.logId && req.params.entryId){
          req.logId = req.params.logId;
          req.entryId = req.params.entryId;
          if(!mongoose.Types.ObjectId.isValid(req.entryId) || !mongoose.Types.ObjectId.isValid(req.logId)){
            return apiResponseHandler.errorResponse(null, req,
                res,
                `Provide valid logId and entryId`,
                400,
                null
            );
          }
          const checkLog = await checkExistingLogEntries(req.logId ,req.entryId)
          if(checkLog){
              return next();
          }else{
              return apiResponseHandler.errorResponse(null, req,
                  res,
                  `Provide valid LogId`,
                  400,
                  null
              );
          }
      }else{
          return apiResponseHandler.errorResponse(null, req,
              res,
              `Provide logId and entryId field in req.params`,
              400,
              null
          );
      }
  }catch(error){
      throw error;
  }
}

const validateStatusForReport = async (req, res, next) => {
    try{
        const report = await mongoDbManager.findOne(LogEntryModel,{_id:req.body.entryId, status:{$in: ["pendingForApproval", "completed"]}})
        if(report){
            return next();
        }
        else{
            return apiResponseHandler.errorResponse(null, req,
              res,
              `Cannot generate Report! Kindly check the status.`,
              400,
              null
          );
        }
    }catch(error){
        throw error;
    }
}

module.exports = {
    validateReport,
    checkStatusBeforeRegenerate,
    checkDocumentPresentBeforeRegenerate,
    validateReportOfLog,
    validateLogEntries,
    validateStatusForReport,
}