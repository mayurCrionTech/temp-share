/*
date              cr/qid      comments
17-march-2026     CR0001      model added for dropdown - dropdownOption_model
*/

const mongoose = require("mongoose");

const dropdownOptionSchema = new mongoose.Schema(
  {
    dropdownId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DropdownMaster",
      required: true,
    },

    value: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
    collection: "dropdown_options",
  }
);

module.exports = mongoose.model("DropdownOption", dropdownOptionSchema);