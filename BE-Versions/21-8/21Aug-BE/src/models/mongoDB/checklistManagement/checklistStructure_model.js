const mongoose = require("mongoose");


const status = {
  DRAFT: "draft",
  SCHEDULED: "scheduled",
  OVERDUE: "overdue",
  COMPLETED: "completed",
  REVISED: "revised",
  PENDING_FOR_APPROVAL: "pendingForApproval",
};

const ChecklisttStructureSchema = new mongoose.Schema(
  {
    checklistId: {
      type: String,
    },
    version: {
      type: Number,
      default:1
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
      default:null
    },
    updatedBy: {
      type: String,
      default:null
    }
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

const ChecklistStructureModel = mongoose.model("checklistStructure", ChecklisttStructureSchema);

module.exports = { ChecklistStructureModel };
