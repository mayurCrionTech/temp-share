const mongoose = require("mongoose");

const TagAnalyticsSchema = new mongoose.Schema({
  
  tagId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "tag_lives",
    required: true
  },

  tagName: {
    type: String,
    required: true
  },

  unit: {
    type: String,
    default: ""
  },

  value: {
    type: Number,   // latest value
    default: 0
  },

  sum: {
    type: Number,
    default: 0
  },

  avg: {
    type: Number,
    default: 0
  },

  minValue: {
    type: Number,
    default: 0
  },

  maxValue: {
    type: Number,
    default: 0
  },

  count: {
    type: Number,
    default: 0
  },

  first: {
    type: Number,
    default: 0
  },

  last: {
    type: Number,
    default: 0
  },

  startTime: {
    type: Date,
    required: true
  },

  endTime: {
    type: Date,
    required: true
  }

}, { 
  timestamps: { createdAt: true, updatedAt: false } 
});

TagAnalyticsSchema.index({ tagId: 1, startTime: 1 }, { unique: true });

module.exports = mongoose.model("TagAnalytics", TagAnalyticsSchema);
