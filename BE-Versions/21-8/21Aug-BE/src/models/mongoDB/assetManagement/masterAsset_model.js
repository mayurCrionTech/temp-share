// masterAsset.model.js
const mongoose = require("mongoose");

const masterAssetSchema = new mongoose.Schema({
  familyKey: {
    type: String,
    required: true,
    // unique: true,            // each family has ONE master
    lowercase: true,
    trim: true
  },

  templateData: {
    type: Object,            // all common fields stored here
    required: true
  },
   flag: {
    type: Number,
    enum: [0, 1],            // 1 = latest template
    default: 0
  },

  
},{
  timestamps: true
});

module.exports = mongoose.model("MasterAsset", masterAssetSchema);
