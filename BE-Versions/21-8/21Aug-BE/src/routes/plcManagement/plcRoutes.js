const express = require("express");
const plcRouters = express.Router();
const plcController = require("../../controllers/plcManagement/plcController");

// GET /api/v1/tags
plcRouters.get("/", plcController.getAllTagsOnly);

plcRouters.get("/controllers/tags", plcController.getAllTags);


plcRouters.post("/createController",plcController.createController);
plcRouters.get("/controllers",plcController.getAllControllers);
plcRouters.get("/controllers/:controllerId",plcController.getControllersById);
plcRouters.put("/controllers/:controllerId", plcController.updateController);
plcRouters.delete("/controllers/:controllerId", plcController.deleteController);

plcRouters.get("/controllers/:controllerId/parameters", plcController.getParameters);

plcRouters.post("/controllers/tags", plcController.createTag);
plcRouters.get("/controllers/tags/:tagId",plcController.getTagById)
plcRouters.put("/controllers/tags/:tagId",plcController.updateTag)
plcRouters.delete("/controllers/tags/:tagId",plcController.deleteTag)
// plcRoutes.js
plcRouters.get("/controllers/:controllerId/tags", plcController.getTagsByControllerId);







module.exports = { plcRouters };
