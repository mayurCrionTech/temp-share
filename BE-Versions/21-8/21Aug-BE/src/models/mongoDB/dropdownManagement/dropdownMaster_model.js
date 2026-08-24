/*
date              cr/qid      comments
17-march-2026     CR0001      model added for dropdown - dropdownMaster_model
*/
const mongoose = require("mongoose");

const dropdownMasterSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    code: {
      type: String,
      required: true,
      trim: true,
      // uppercase: true, 
    },

    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
  },
  {
    timestamps: true,
    collection: "dropdown_master",
  }
);

// unique per organization
dropdownMasterSchema.index({ code: 1, organization: 1 }, { unique: true });

module.exports = mongoose.model("DropdownMaster", dropdownMasterSchema);