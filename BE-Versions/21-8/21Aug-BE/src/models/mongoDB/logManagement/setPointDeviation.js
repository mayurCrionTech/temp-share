const mongoose = require("mongoose");

const setpointDeviationSchema = new mongoose.Schema(
  {
    templateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LogTemplate",
      required: true,
    },
    logStructureId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LogStructure",
    },
    logId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Log",
    },
    fieldName: {
      type: String,
      required: true,
    },
    assetId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Asset",
    },
    entryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LogEntry",
    },
    deviations: {
      lowerBound: {
        oldValue: Number,
        newValue: Number,
        deviation: Number,
      },
      upperBound: {
        oldValue: Number,
        newValue: Number,
        deviation: Number,
      },
      criticalLowerBound: {
        oldValue: Number,
        newValue: Number,
        deviation: Number,
      },
      criticalUpperBound: {
        oldValue: Number,
        newValue: Number,
        deviation: Number,
      },
    },
    //   source: {
    //     type: String,
    //     enum: ["logSetPoint", "liveData"],
    //     required: true
    //   },
    
  },
  
  {
    timestamps:true,
    collection: "setpointDeviations",
  }
);

// TTL: automatically delete records older than 1 year
setpointDeviationSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 31536000 }
);

module.exports = mongoose.model("SetpointDeviation", setpointDeviationSchema);
