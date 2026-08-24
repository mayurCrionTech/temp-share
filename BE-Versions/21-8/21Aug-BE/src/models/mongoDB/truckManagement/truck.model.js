const mongoose = require("mongoose");

const truckSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
    },
    truckCount: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("truck_counts", truckSchema);
