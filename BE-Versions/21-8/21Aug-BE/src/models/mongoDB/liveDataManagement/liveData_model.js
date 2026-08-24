// const mongoose = require("mongoose");

// const plcDataSchema = new mongoose.Schema(
//   {
//     tagName: {
//       type: String,
//       required: true,
//       trim: true,
//       index: true
//     },
//     value: {
//       type: Number,
//       required: true
//     },
//     timestamp: {
//       type: String,
//       required: true
//     },
//     dataType: {
//       type: String,
//       enum: ["BOOL", "INT", "REAL", "STRING", "DINT"],
//       default: "REAL"
//     },
//     quality: {
//       type: String,
//       enum: ["GOOD", "BAD", "UNCERTAIN"],
//       default: "GOOD"
//     },
//     source: {
//       type: String,
//       default: "PLC"
//     },
//     plcName: {
//       type: String,
//       required: false
//     },
//     unit:{
//       type: String,
//       required: false
//     },
//     db: {
//       type: Number,
//       required: false
//     }
//   },
//   {
//     timestamps: true,
//     collection: "plcDataEntries"
//   }
// );

// // plcDataSchema.index({ tagName: 1, timestamp: -1 });
// // plcDataSchema.index({ createdAt: -1 });

// const LiveDataModel = mongoose.model("plcDataEntries", plcDataSchema);

// module.exports = { LiveDataModel }
// models/liveData.model.js
const mongoose = require("mongoose");

const liveDataSchema = new mongoose.Schema(
  {
    tagName: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true
    },
    description: {
      type: String
    },
    asset: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "Asset",
      required: true
    },
    dataType: {
      type: String,
      enum: ["BOOL", "INT", "REAL", "STRING", "DINT"],
      default: "REAL"
    },
    latestValue: { type: Number, default: null },
    unit: {
      type: String
    },
    plcName: {
      type: String,
      required: true
    },

    db: {
      type: Number
    },
    source: {
      type: String,
      default: "PLC"
    },
    isActive: {
      type: Boolean,
      default: true
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true,
    collection: "liveData"
  }
);

liveDataSchema.index({ tagName: 1 });
liveDataSchema.index({ plcName: 1 });

const LiveData = mongoose.model("liveData", liveDataSchema);

function getLiveDataEntriesCollection() {
  const db = mongoose.connection.db;
  return db.collection("liveDataEntries");
}
module.exports = { LiveData , getLiveDataEntriesCollection };
