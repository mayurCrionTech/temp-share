// const mongoose = require("mongoose");

// const setpointDeviationEventSchema = new mongoose.Schema(
//   {
//     templateId: {
//       type: mongoose.Schema.Types.ObjectId,
//       required: true,
//       index: true,
//     },

//     logStructureId: {
//       type: mongoose.Schema.Types.ObjectId,
//       required: true,
//       index: true,
//     },

//     logId: {
//       type: mongoose.Schema.Types.ObjectId,
//       required: true,
//       index: true,
//     },

//     entryId: {
//       type: mongoose.Schema.Types.ObjectId,
//       required: true,
//       index: true,
//     },

//     assetId: {
//       type: mongoose.Schema.Types.ObjectId,
//       required: true,
//       index: true,
//     },

//     fieldName: {
//       type: String,
//       required: true,
//     },

//     deviationType: {
//       type: String,
//       enum: [
//         "criticalLowerBound",
//         "lowerBound",
//         "upperBound",
//         "criticalUpperBound",
//       ],
//       required: true,
//     },

//     value: {
//       type: Number,
//       required: true,
//     },

//     triggeredAt: {
//       type: Date,
//       default: Date.now,
//       index: true,
//     },
//   },
//   { timestamps: true },
// );

// module.exports = mongoose.model(
//   "SetpointDeviationEvent",
//   setpointDeviationEventSchema,
//   "setpointDeviationEvents",
// );

// api - http://localhost:3333/api/v1/logs/deviations

// const mongoose = require("mongoose");

// const setpointDeviationEventSchema = new mongoose.Schema(
//   {
//     // sourceType: {
//     //   type: String,
//     //   enum: ["log", "plcLiveData"],
//     //   required: true,
//     //   index: true,
//     // },

//     sourceDetails: {
//       type: Object,
//       required: true,
//     },

//     assetId: {
//       type: mongoose.Schema.Types.ObjectId,
//       index: true,
//     },

//     // fieldName: {
//     //   type: String,
//     //   required: true,
//     // },

//     deviationType: {
//       type: String,
//       required: true,
//     },

//     value: {
//       type: Number,
//       required: true,
//     },

//     triggeredAt: {
//       type: Date,
//       default: Date.now,
//       index: true,
//     },
//   },
//   { timestamps: true }
// );

// module.exports = mongoose.model(
//   "SetpointDeviationEvent",
//   setpointDeviationEventSchema,
//   "setpointDeviationEvents"
// );

const mongoose = require("mongoose");

const setpointDeviationEventSchema = new mongoose.Schema(
  {
    // sourceType: {
    //   type: String,
    //   enum: ["log", "plcLiveData"],
    //   required: true,
    //   index: true,
    // },

    sourceDetails: {
      type: Object,
      required: true,
    },

    assetId: {
      type: mongoose.Schema.Types.ObjectId,
      index: true,
    },

    // fieldName: {
    //   type: String,
    //   required: true,
    // },

    deviationType: {
      type: String,
      required: true,
    },

    value: {
      type: Number,
      required: true,
    },

    // liveDataRefs: [
    //   {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: "TagHistory",
    //   },
    // ],

    liveDataRefs: {
      type: Array,
      default: [],
    },

    triggeredAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model(
  "SetpointDeviationEvent",
  setpointDeviationEventSchema,
  "setpointDeviationEvents",
);
