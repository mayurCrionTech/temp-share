const mongoose = require("mongoose");

const tagSchema = new mongoose.Schema(
  {
    tagname: { type: String, required: true },
    description: { type: String },
    datatype: {
      type: String,
      enum: ["REAL", "INT", "BOOL", "STRING", "COLOR"],
      required: true,
    },
    latestValue: { type: mongoose.Schema.Types.Mixed },
    unit: { type: String },
    plcName: { type: String },
    assetId: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Asset", default: [] },
    ],
    isActive: { type: Boolean, default: true },
    ranges: {
      minValue: Number,
      maxValue: Number,
    },
    health: { type: Boolean, default: true }, // new field
    plcMetadata: { dbAddress: { type: String, default: "01" } }, // new field
  },

  { timestamps: true },
);

const TagLive = mongoose.model("Tag_Live", tagSchema);
// Model name = liveData (just for code usage)
// Collection name = liveData_test (actual Mongo collection)
const liveDataSchema = new mongoose.Schema({}, { strict: false });
liveDataSchema.index({ timestamp: 1, tag_id: 1 });
const TagHistory  = mongoose.model("TagHistory", liveDataSchema, "liveData_test");

function getLiveDataCollection() {
  const db = mongoose.connection.db;
  return db.collection("liveData_test");
}

// module.exports = { LiveData, getLiveDataCollection };

// module.exports = mongoose.model("Tag_Live", tagSchema);
// SINGLE EXPORT
module.exports = {
  TagLive,
  TagHistory ,
  getLiveDataCollection,
};
