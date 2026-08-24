const mongoose = require("mongoose");

const TriggeredRuleSchema = new mongoose.Schema(
  {
    tagId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TagLive",
      required: true,
      index: true,
    },
    operator: {
      type: String,
      required: true,
      enum: ["<", ">", "<=", ">=", "==", "!="],
    },
    threshold: {
      type: Number,
      required: true,
    },
    forecastedValue: {
      type: Number,
      required: true,
    },
  },
  { _id: false }
);

const DetectedDefectSchema = new mongoose.Schema(
  {
    defectName: {
      type: String,
      required: true,
    },
    triggeredRules: {
      type: [TriggeredRuleSchema],
      default: [],
    },
    confidenceScore: {
      type: Number,
      required: true,
    },
    riskLevel: {
      type: String,
      required: true,
      enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
    },
  },
  { _id: false }
);

const ForecastDefectSchema = new mongoose.Schema(
  {
    forecastTimestamp: {
      type: Date,
      required: true,
    },
    detectedDefects: {
      type: [DetectedDefectSchema],
      default: [],
    },
    firstDetectedAt: {
      type: Date,
    },
    lastStatusChangeAt: {
      type: Date,
    },
    lastUpdatedAt: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      required: true,
      enum: ["ACTIVE", "RESOLVED", "INACTIVE"],
      default: "ACTIVE",
    },
    acknowledged:{
      type: Boolean,
      default: false
    },
    acknowledgedBy: {
      type: String
    },
    acknowledgedAt:{
      type: Date
    }
  },
  {
    timestamps: true, // Set to true if you want createdAt and updatedAt automatically
    collection: "forecastDefects",
  }
);

module.exports = mongoose.model("ForecastDefect", ForecastDefectSchema, "forecastDefects");