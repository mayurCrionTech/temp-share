const mongoose = require("mongoose");

const tagSchema = new mongoose.Schema(
  {
    controllerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PlcController",
      required: true,
      index: true
    },

    controllerName: {
      type: String,
      required: true
    },

    networkType: {
      type: String, // ethernet / modbus / siemens
      required: true
    },

    // for ethernet → string
    // for others → object
    value: {
      type: mongoose.Schema.Types.Mixed,
      required: true
    },

    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("PlcTag", tagSchema);
