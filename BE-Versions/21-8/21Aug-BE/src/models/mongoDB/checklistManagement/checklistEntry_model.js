const mongoose = require("mongoose");

const status = {
  SCHEDULED: "scheduled",
  OVERDUE: "overdue",
  COMPLETED: "completed",
  REVISED: "revised",
  PENDING_FOR_APPROVAL: "pendingForApproval",
};

const fieldTypes = {
  MULTIPLE_CHOICE: "multipleChoice",
  CHECKBOXES: "checkboxes",
  DROPDOWN: "dropdown",
  TEXT: "text",
  NUMBER: "number",
  DATE: "date",
};

const commentSchema = new mongoose.Schema({
  index: {
    type: Number,
  },
  comment: {
    type: String,
  },
});

const checklistEntrySchema = new mongoose.Schema(
  {
    entryNumber: {
      type: Number,
      default: 1,
      index: true,
    },
    checklistId: {
      type: String,
      required: true,
    },
    checklistStructureId: {
      type: String,
    },
    status: {
      type: String,
      enum: Object.values(status),
      default: "scheduled",
    },
    data: [
      {
        fieldName: {
          type: String,
          required: true,
        },
        fieldValue: {
          type: mongoose.Schema.Types.Mixed,
          required: true,
        },
        type: {
          type: String,
          enum: Object.values(fieldTypes),
          required: true,
        },
        index: {
          type: Number,
          required: true,
        },
        asset: {
          type: String,
        },
      },
    ],
    createdBy: {
      type: String,
    },
    updatedBy: {
      type: String,
      default: null,
    },
    entryCreatedAt: {
      type: Date,
      required: true,
    },
    operatorId: {
      type: String,
    },
    comments: {
      type: [commentSchema],
      default: null,
    },
    templateId:{
      type:String
    }
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

const ChecklistEntryModel = mongoose.model(
  "checklistEntries",
  checklistEntrySchema
);

module.exports = { ChecklistEntryModel };
