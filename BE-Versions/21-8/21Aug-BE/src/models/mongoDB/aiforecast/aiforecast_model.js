/*
date            cr/qid      comments
23-march-2026     CR   aiforecast model added
*/
const mongoose = require("mongoose");

const AIForecastSchema = new mongoose.Schema(
  {
    tagId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TagLive",
      required: true,
      index: true,
    },
    timestamp: {
      type: Date,
      required: true,
      index: true,
    },
    predictedValue: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "AIForecast",
  AIForecastSchema,
  "aiforecast" 
);