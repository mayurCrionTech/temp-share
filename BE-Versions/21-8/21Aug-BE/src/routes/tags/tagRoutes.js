const express = require("express");
const tagRouter = express.Router();
const tagController = require("../../controllers/tagManagement/tagController");

// GET /api/v1/tags
tagRouter.get("/", tagController.getAllTags);

// GET /api/v1/tags/assets/:assetId
tagRouter.get("/assets/:assetId/tags", tagController.getTagsByAssetId);

tagRouter.get("/history", tagController.getTagsHistory);

tagRouter.post("/live",tagController.getAllLiveTags);

// old api
// tagRouter.get("/anomaly",tagController.getAnomalyDetails); 

// new cache implementation with old endpoint
tagRouter.get("/anomaly",tagController.getAnomalyDetailsFast); 

tagRouter.get("/aiForeCast",tagController.getForeCastValues);

tagRouter.get("/forecastDefect", tagController.getForeCastDefectValues);

tagRouter.put("/forecastDefect/acknowledge", tagController.updateForeCastDefectValuesAcknowledged)

tagRouter.put("/anomaly/acknowledge", tagController.updateAnamolyAcknowledged)


module.exports = { tagRouter };
