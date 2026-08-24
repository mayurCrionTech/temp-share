// const mongoose = require("mongoose");

// const controllerSchema = new mongoose.Schema(
//   {
//     controllerName: {
//       type: String,
//       required: true,
//       trim: true
//     },

//     network: {
//       type: String,
//       required: true,
//       lowercase: true,
//       trim: true
//     },

//     ipAddress: {
//       type: String,
//       required: true,
//       unique: true
//     },

//     // Dynamic PLC configuration
//     settings: {
//       type: mongoose.Schema.Types.Mixed,
//       default: {}
//     },

//     isActive: {
//       type: Boolean,
//       default: true
//     }
//   },
//   { timestamps: true }
// );

// module.exports = mongoose.model("PlcController", controllerSchema);


const mongoose = require("mongoose");

const parameterSchema = new mongoose.Schema(
  {
    _id: {
      type: mongoose.Schema.Types.ObjectId, // Unique ID for each parameter
      default: () => new mongoose.Types.ObjectId()
    },
    // name: { type: String, required: true },
     name: { type: String, trim: true, default: null },
    dataType: { type: String, required: true }, // e.g., "text", "number"
    options: { type: [String], default: [] },   // optional, for dropdowns
    isDefault: { type: Boolean, default: false } // default vs user-added
  },
  { _id: false } // Mongoose uses the _id we define, don't auto-add another
);

const networkSchema = new mongoose.Schema(
  {
    name: { type: String, required: true }, // "Modbus"
    id: { type: String, required: true }    // "modbus"
  },
  { _id: false }
);

const controllerSchema = new mongoose.Schema(
  {
    controllerName: {
      type: String,
      required: true,
      trim: true
    },

    network: {
      type: networkSchema,   // <-- OBJECT now
      required: true
    },

    ipAddress: {
      type: String,
      required: true,
      unique: true
    },

    settings: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },

    parameters: {
      type: [parameterSchema], // Array of parameters (default + custom)
      default: []
    },

    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("PlcController", controllerSchema);
