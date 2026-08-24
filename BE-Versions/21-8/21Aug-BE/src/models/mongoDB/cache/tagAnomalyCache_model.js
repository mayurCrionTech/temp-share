const mongoose = require("mongoose");

const tagAnomalyCacheSchema = new mongoose.Schema(
  {
    tagId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },

    breachDateTime: {
      type: Date,
      required: true,
      index: true,
    },

    // full UI-ready response
    payload: {
      type: Object,
      required: true,
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
    timestamps: true,
  }
);

// compound index
tagAnomalyCacheSchema.index({ tagId: 1, breachDateTime: -1 });

module.exports = mongoose.model(
  "tag_anomaly_cache",
  tagAnomalyCacheSchema
);