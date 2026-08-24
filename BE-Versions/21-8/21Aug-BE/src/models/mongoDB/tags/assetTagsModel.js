const mongoose = require("mongoose");

const assetSchema = new mongoose.Schema(
  {
    name: { type: String, required: true }, // "Pump 01"
    code: { type: String }, // "PUMP_01"
    description: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Asset_mock", assetSchema);
