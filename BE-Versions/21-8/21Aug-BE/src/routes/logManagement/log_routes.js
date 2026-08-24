/*
date            qid / cr#         comments
17-apr-2026     CR0013           IDOR - Issue
20-apr-2026     CR0010           Permission checks added 
*/
const express = require("express");

const {
  createLog,
  createTemplate,
  fillLogEntries,
  getAllLogs,
  getLogDetails,
  getLogEntries,
  getLogVersions,
  getLogEntryDetails,
  getlogStatusCount,
  getAllTemplates,
  updateLogDetails,
  updateLogStructureDetails,
  versionDetails,
  templateDetails,
  updateTemplateDetails,
  timePeriodDetails,
  checkUniquness,
  updateEntryStatus,
  updateEntry,
  getLogEntryStats,
  getAllLogEntries,
  getEntryDetails,
  uploadImage,
  uploadNotes,
  getImages,
  getNotes,
  updateTemplateSetPoints,
  updateTemplateDataSetFormula, // Unique to second version
  pauseEntries,
  resumeEntries,
  addImages,
  fetchLogFieldImages,
  fetchAllLogs,
  deleteLog,
  fetchDeviations,
} = require("../../controllers/logManagement/log_controllers");
const {
  getSingleEntryReport,
} = require("../../controllers/reportManagement/report_controllers");

const {
  fileMiddleware,
  businessUnitMiddleware, // Unique to second version
  reportMiddleware,
  authorizationMiddleware, // CR0010
} = require("../../middlewares");

const {
  validateLog,
  validateLogStructure,
  verifyStartDateAndEndDateTime,
} = require("../../middlewares/logManagement/log_middlewares");

const logRouter = express.Router();

/**
 * @swagger
 * tags:
 *   name: Log
 *   description: APIs for Log
 */

logRouter.get(
  "/all",
  [authorizationMiddleware.checkPermission("logs", "read")], // CR0010
  fetchAllLogs,
);
logRouter.post(
  "/general-details",
  [
    authorizationMiddleware.checkPermission("logs", "create"), // CR0010
    businessUnitMiddleware.verifyBusinessUnit,
    businessUnitMiddleware.checkLogBodyDepartmentAccess,
  ],
  createLog,
); //CR0013 -> checkLogBodyDepartmentAccess
logRouter.post(
  "/create-template",
  [
    authorizationMiddleware.checkPermission("logs", "create"), // CR0010
    businessUnitMiddleware.verifyBusinessUnit,
  ],
  createTemplate,
);
logRouter.get(
  "/entries",
  [
    authorizationMiddleware.checkPermission("logs", "read"), // CR0010
    businessUnitMiddleware.verifyBusinessUnit,
  ],
  getAllLogEntries,
);
// new
logRouter.get("/deviations", fetchDeviations);
logRouter.patch(
  "/fill-entries/:entryId",
  [
    authorizationMiddleware.checkPermission("logs", "fillEntry"), // CR0010
  ],
  fillLogEntries,
);
logRouter.get(
  "/",
  [
    authorizationMiddleware.checkPermission("logs", "read"), // CR0010
    businessUnitMiddleware.verifyBusinessUnit,
  ],
  getAllLogs,
);
logRouter.get(
  "/:logId",
  [
    authorizationMiddleware.checkPermission("logs", "read"), // CR0010
    validateLog,
    businessUnitMiddleware.checkLogDepartmentAccess,
  ],
  getLogDetails,
); //CR0013 -> validatelog,businessUnitMiddlware
logRouter.get(
  "/:logId/entries",
  [
    authorizationMiddleware.checkPermission("logs", "read"), // CR0010
    validateLog,
    businessUnitMiddleware.checkLogDepartmentAccess,
  ],
  getLogEntries,
); //CR0013 -> validatelog,businessUnitMiddlware
logRouter.get(
  "/:logId/versions",
  [
    authorizationMiddleware.checkPermission("logs", "read"), // CR0010
    validateLog,
    businessUnitMiddleware.checkLogDepartmentAccess,
  ],
  getLogVersions,
); //CR0013 -> validatelog,businessUnitMiddlware
logRouter.patch(
  "/entry-status",
  [
    authorizationMiddleware.checkPermission("logs", "update"), // CR0010
  ],
  updateEntryStatus,
);
logRouter.get(
  "/entry/:entryId",
  [
    authorizationMiddleware.checkPermission("logs", "read"), // CR0010
  ],
  getLogEntryDetails,
);
logRouter.get(
  "/logStatus/count",
  [
    // authorizationMiddleware.checkPermission("logs", "read"), // CR0010
    businessUnitMiddleware.verifyBusinessUnit,
  ],
  getlogStatusCount,
);
logRouter.get(
  "/general/templates",
  [
    authorizationMiddleware.checkPermission("logs", "read"), // CR0010
    businessUnitMiddleware.verifyBusinessUnit,
  ],
  getAllTemplates,
);
logRouter.patch(
  "/:logId",
  [
    authorizationMiddleware.checkPermission("logs", "update"), // CR0010
    validateLog,
    businessUnitMiddleware.checkLogDepartmentAccess,
  ],
  updateLogDetails,
); //CR0013 -> validatelog,businessUnitMiddlware
logRouter.patch(
  "/logStructure/:structureId",
  [
    authorizationMiddleware.checkPermission("logs", "update"), // CR0010
    businessUnitMiddleware.verifyBusinessUnit,
  ],
  updateLogStructureDetails,
);
if (process.env.DEV_API === "true") {
  logRouter.patch(
    "/:log/logStructures/:logStructure/templateSetPoints",
    // [validateLog, validateLogStructure],
    updateTemplateSetPoints,
  );
}
// logRouter.delete('/:logId',deleteLog)
logRouter.get(
  "/versions/:structureId",
  [
    authorizationMiddleware.checkPermission("logs", "read"), // CR0010
  ],
  versionDetails,
);
logRouter.get(
  "/templates/:templateId",
  [
    authorizationMiddleware.checkPermission("logs", "read"), // CR0010
  ],
  templateDetails,
);
logRouter.patch(
  "/templates/:templateId",
  [
    authorizationMiddleware.checkPermission("logs", "update"), // CR0010
    businessUnitMiddleware.verifyBusinessUnit,
  ],
  updateTemplateDetails,
);
logRouter.patch(
  "/templates/:templateId/updateDataSetFormula",
  [
    authorizationMiddleware.checkPermission("logs", "update"), // CR0010
    businessUnitMiddleware.verifyBusinessUnit,
  ],
  updateTemplateDataSetFormula,
);
logRouter.get(
  "/log/timePeriod",
  [
    authorizationMiddleware.checkPermission("logs", "read"), // CR0010
  ],
  timePeriodDetails,
);
logRouter.post(
  "/field/check-uniqueness",
  [
    authorizationMiddleware.checkPermission("logs", "create"), // CR0010
    businessUnitMiddleware.verifyBusinessUnit,
  ],
  checkUniquness,
);
logRouter.patch(
  "/entries/:entryId",
  [
    authorizationMiddleware.checkPermission("logs", "updateFillEntry"), // CR0010
  ],
  updateEntry,
);
logRouter.get(
  "/stats/:assetId",
  [
    authorizationMiddleware.checkPermission("logs", "update"), // CR0010
    authorizationMiddleware.checkPermission("logs", "read"), // CR0010
  ],
  getLogEntryStats,
);
logRouter.get(
  "/entries/:entryId",
  [
    authorizationMiddleware.checkPermission("logs", "read"), // CR0010
  ],
  getEntryDetails,
);
logRouter.patch(
  "/images/:entryId",
  [
    authorizationMiddleware.checkPermission("logs", "update"), // CR0010
    fileMiddleware.uploadMultiple,
    fileMiddleware.validateMultipleFileExtensionAndSize,
    fileMiddleware.validateFileUpload,
  ],
  uploadImage,
);
logRouter.patch("/notes/:entryId", uploadNotes);
logRouter.get(
  "/images/:entryId",
  [
    authorizationMiddleware.checkPermission("logs", "update"), // CR0010
    authorizationMiddleware.checkPermission("logs", "read"), // CR0010
  ],
  getImages,
);
logRouter.get(
  "/notes/:entryId",
  [
    authorizationMiddleware.checkPermission("logs", "read"), // CR0010
  ],
  getNotes,
);
logRouter.patch(
  "/:logId/pause",
  [
    authorizationMiddleware.checkPermission("logs", "update"), // CR0010
    validateLog,
    businessUnitMiddleware.checkLogDepartmentAccess,
  ],
  pauseEntries,
); //CR0013 -> validatelog,businessUnitMiddlware
logRouter.patch(
  "/:logId/resume",
  [
    authorizationMiddleware.checkPermission("logs", "update"), // CR0010
    validateLog,
    businessUnitMiddleware.checkLogDepartmentAccess,
  ],
  resumeEntries,
); //CR0013 -> validatelog,businessUnitMiddlware

logRouter.post(
  "/:logId/entries/:entryId/create-report",
  [
    authorizationMiddleware.checkPermission("logs", "create"), // CR0010
    validateLog,
    businessUnitMiddleware.checkLogDepartmentAccess,
    reportMiddleware.validateLogEntries,
    reportMiddleware.validateStatusForReport,
  ],
  getSingleEntryReport,
); //CR0013 -> validatelog,businessUnitMiddlware

logRouter.post(
  "/:logId/entries/:entryId/fields/:fieldId/images",
  [
    authorizationMiddleware.checkPermission("logs", "create"), // CR0010
    validateLog,
    businessUnitMiddleware.checkLogDepartmentAccess, //CR0013 -> validatelog,businessUnitMiddlware
    fileMiddleware.uploadMultiple,
    fileMiddleware.validateMultipleFileExtensionAndSize,
    fileMiddleware.validateFileUpload,
  ],
  addImages,
);

logRouter.get(
  "/:logId/entries/:entryId/fields/:fieldId/images",
  [
    authorizationMiddleware.checkPermission("logs", "read"), // CR0010
    validateLog,
    businessUnitMiddleware.checkLogDepartmentAccess,
  ],
  fetchLogFieldImages,
); //CR0013 -> validatelog,businessUnitMiddlware
logRouter.delete(
  "/delete",
  [
    authorizationMiddleware.checkPermission("logs", "delete"), // CR0010
    businessUnitMiddleware.verifyBusinessUnit,
    businessUnitMiddleware.checkLogBulkDepartmentAccess,
  ],
  deleteLog,
); //CR0013 -> validatelog,businessUnitMiddlware

module.exports = { logRouter };
