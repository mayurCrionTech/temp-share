const express = require("express");
const {
  createChecklist,
  createTemplate,
  getAllChecklists,
  getChecklistDetails,
  getChecklistEntries,
  getChecklistVersions,
  getChecklistEntryDetails,
  getchecklistStatusCount,
  getAllTemplates,
  updateChecklistDetails,
  updateChecklistStructureDetails,
  deleteChecklist,
  versionDetails,
  templateDetails,
  fillChecklistEntries,
  updateTemplateDetails,
  timePeriodDetails,
  checkUniquness,
  updateEntryStatus,
  updateEntry,
} = require("../../controllers/checklistManagement/checklist_controllers");
const {
  schduledCheklist,
} = require("../../managers/internalManagers/checklistManagement/recurrence");

const checklistRouter = express.Router();

/**
 * @swagger
 * tags:
 *   name: Checklist
 *   description: APIs for Checklist
 */

checklistRouter.post("/general-details", createChecklist);
checklistRouter.post("/create-template", createTemplate);
checklistRouter.patch("/fill-entries/:entryId", fillChecklistEntries);
checklistRouter.get("/", getAllChecklists);
checklistRouter.get("/:checklistId", getChecklistDetails);
checklistRouter.get("/:checklistId/entries", getChecklistEntries);
checklistRouter.get("/:checklistId/versions", getChecklistVersions);
checklistRouter.get("/entry/:entryId", getChecklistEntryDetails);
checklistRouter.get("/checklistStatus/count", getchecklistStatusCount);
checklistRouter.get("/general/templates", getAllTemplates);
checklistRouter.patch("/:checklistId", updateChecklistDetails);
checklistRouter.patch(
  "/checklistStructure/:structureId",
  updateChecklistStructureDetails
);
// checklistRouter.delete('/:checklistId',deleteChecklist)
checklistRouter.get("/versions/:structureId", versionDetails);
checklistRouter.get("/templates/:templateId", templateDetails);
checklistRouter.patch("/templates/:templateId", updateTemplateDetails);
checklistRouter.get("/checklist/timePeriod", timePeriodDetails);
checklistRouter.post("/field/check-uniqueness", checkUniquness);
checklistRouter.patch("/entry-status/:entryId", updateEntryStatus);
checklistRouter.patch("/entries/:entryId", updateEntry);

module.exports = { checklistRouter };
