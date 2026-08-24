const express = require("express");
const logEntryRouter = express.Router();

const {saveTheEntries, createLogEntry} = require("../../controllers/logManagement/log_controllers");

logEntryRouter.patch("/:entryId/save", saveTheEntries)
logEntryRouter.post("/:logId/create-entry", createLogEntry)


module.exports = { logEntryRouter };