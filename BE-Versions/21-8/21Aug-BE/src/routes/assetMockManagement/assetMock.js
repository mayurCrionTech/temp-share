const express = require("express");
const assetRouters = express.Router();
const assetController = require("../../controllers/assetMock/assetController");

assetRouters.post("/", assetController.createAsset);

module.exports = { assetRouters };
