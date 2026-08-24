/*
date              cr/qid      comments
17-march-2026     CR0001      model added for dropdown - dropdownOptionDisabled_model
*/

const mongoose = require("mongoose");

const dropdownOptionDisabledSchema = new mongoose.Schema(
  {
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },

    businessUnit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BusinessUnit",
      required: true,
    },

    dropdownId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DropdownMaster",
      required: true,
    },

    optionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DropdownOption",
      required: true,
    },
  },
  {
    timestamps: true,
    collection: "dropdown_option_disabled",
  }
);

// prevent duplicate disable
dropdownOptionDisabledSchema.index(
  { businessUnit: 1, optionId: 1 },
  { unique: true }
);

module.exports = mongoose.model(
  "DropdownOptionDisabled",
  dropdownOptionDisabledSchema
);