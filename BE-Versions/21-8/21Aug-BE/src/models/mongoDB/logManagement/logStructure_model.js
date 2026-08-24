const mongoose = require("mongoose");

const status = {
  DRAFT: "draft",
  SCHEDULED: "scheduled",
  OVERDUE: "overdue",
  COMPLETED: "completed",
  REVISED: "revised",
  PENDING_FOR_APPROVAL: "pendingForApproval",
};

const logStructureSchema = new mongoose.Schema(
  {
    logId: {
      type: String,
    },
    version: {
      type: Number,
      default: 1,
    },
    images: {
      type: [String],
      required: false,
    },
    note: {
      type: String,
      required: false,
    },
    templateId: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: String,
      default: null,
    },
    updatedBy: {
      type: String,
      default: null,
    },
    businessUnit: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "BusinessUnit",
      required: true
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

logStructureSchema.index({logId:1, isActive:1})
logStructureSchema.index({logId:1, createdBy:1,businessUnit:1})
logStructureSchema.index({logId:1, templateId:1,businessUnit:1})


const LogStructureModel = mongoose.model("logStructure", logStructureSchema);

module.exports = { LogStructureModel };
