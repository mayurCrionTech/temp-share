const Asset = require("../../../models/mongoDB/tags/assetTagsModel");

async function createAsset(assetData) {
  const newAsset = await Asset.create(assetData);
  return newAsset;
}

module.exports = { createAsset };
