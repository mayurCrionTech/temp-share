const mongoose = require("mongoose");

const cronLogSchema = new mongoose.Schema(
  {
    jobName: { type: String, required: true },
    windowStart: { type: Date },
    windowEnd: { type: Date },

    startedAt: { type: Date, default: Date.now },
    endedAt: { type: Date },

    status: {
      type: String,
      enum: ["STARTED", "COMPLETED", "FAILED"],
      default: "STARTED"
    },

    message: { type: String }
  },
  { timestamps: true }
);

module.exports = mongoose.model("CronLog", cronLogSchema);
