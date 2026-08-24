const express = require("express");
const {
  createReport,
  getReportModule,
  getModuleData,
  getReportFormat,
  reportCount,
  reports,
  getReportDetails,
  approveTheReport,
  getComments,
  addComments,
  reportHistory,
  regenrateRepert,
  downloadComplianceReport
} = require("../../controllers/reportManagement/report_controllers");
const { businessUnitMiddleware } = require("../../middlewares");
const reportRouter = express.Router();
const {reportMiddleware} = require("../../middlewares/index")

/**
 * @swagger
 * tags:
 *   name: Report
 *   description: APIs for Report
 */

reportRouter.get("/report-module", getReportModule);
reportRouter.get("/report-format", getReportFormat);
reportRouter.get("/module-data", [businessUnitMiddleware.verifyBusinessUnit], getModuleData);
reportRouter.post("/create-report", [businessUnitMiddleware.verifyBusinessUnit,reportMiddleware.validateReportOfLog], createReport);
reportRouter.get("/count", [businessUnitMiddleware.verifyBusinessUnit], reportCount);
reportRouter.get("/listing", [businessUnitMiddleware.verifyBusinessUnit], reports);
reportRouter.get("/:reportId", getReportDetails);
reportRouter.patch("/:reportId", approveTheReport);
reportRouter.patch("/:reportId/regenerate", [
  reportMiddleware.validateReport,
  reportMiddleware.checkStatusBeforeRegenerate,
  reportMiddleware.checkDocumentPresentBeforeRegenerate,
],regenrateRepert);
reportRouter.get("/comments/:reportId", getComments);
reportRouter.patch("/comments/:reportId", addComments);
reportRouter.get("/:reportId/history",[
  reportMiddleware.validateReport,
], reportHistory);
reportRouter.post("/logComplianceReport", downloadComplianceReport);

module.exports = { reportRouter };
