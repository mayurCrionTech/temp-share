const mongoose = require("mongoose");

const status = {
  SCHEDULED: "scheduled",
  OVERDUE: "overdue",
  COMPLETED: "completed",
  REVISED: "revised",
  PENDING_FOR_APPROVAL: "pendingForApproval",
  INPROGRESS: "inProgress"
};

const fieldTypes = {
  MULTIPLE_CHOICE: "multiplechoice",
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

const entryApprovedByAndApprovedAtSchema = new mongoose.Schema({
  approvedBy: {
    type: String,
  },
  approvedAt: {
    type: Date,
  },
});

const noteSchema = new mongoose.Schema({
  userId: {
    type: String,
  },
  note: {
    type: String,
  },
  addedAt: {
    type: Date,
  },
});

const imageSchema = new mongoose.Schema({
  uploadedBy: {
    type: String,
  },
  imageId: {
    type: String,
  },
  addedAt: {
    type: Date,
  },
});

const logEntrySchema = new mongoose.Schema(
  {
    entryNumber: {
      type: Number,
      default: 1,
      index: true,
    },
    logId: {
      type: String,
      required: true,
    },
    logStructureId: {
      type: String,
    },
    status: {
      type: String,
      enum: Object.values(status),
      default: "scheduled",
    },
    approvers:{
      type: [String],
    },
    approvedBy:{
      type: [String],
      default:[],
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
        breakDown: {
          type: Boolean,
          default: false,
        },
        isFormula:{
          type: Boolean,
          default: false
        },
        isMandatory:{
          type: Boolean,
          default: true
        },
        isFilled:{
          type: Boolean,
          default:false
        },
        fieldEnteredBy:{
           type: String,
        },
        fieldEnteredAt:{
          type: Date,
        },
        images:[{
            type: mongoose.SchemaTypes.ObjectId,
            ref:"File",
            default: []
          }],
      },
    ],
    createdBy: {
      type: String,
    },
    updatedBy: {
      type: String,
      default: null,
    },
    entryEnteredAt: {
      type: Date,
    },
    entryCreatedAt: {
      type: Date,
      required: true,
    },
    entryCompletedAt: {
      type: Date,
    },
    entryApprovedByAndApprovedAt: {
      type: [entryApprovedByAndApprovedAtSchema],
      default: null,
    },
    operatorIds: {
      type: Array,
    },
    enteredBy:{
      type: String,
    },
    comments: {
      type: [commentSchema],
      default: null,
    },
    templateId: {
      type: String,
    },
    endTime: {
      type: Date,
      default: null,
    },
    assetId: {
      type: String,
    },
    images: {
      type: [imageSchema],
      default: null,
    },
    notes: {
      type: [noteSchema],
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

logEntrySchema.index({logId:1,status:1,isActive:1})
logEntrySchema.index({logId:1,operatorIds:1,status:1})
logEntrySchema.index({logId:1,entryCreatedAt:1})
logEntrySchema.index({logId:1,createdBy:1,status:1})
logEntrySchema.index({status:1})
logEntrySchema.index({logId:1,businessUnit:1})
logEntrySchema.index({logId:1,approvers:1,status:1})
logEntrySchema.index({logId:1,businessUnit:1,status:1})
logEntrySchema.index({approvers:1,status:1})
logEntrySchema.index({createdBy:1,status:1})

// Compound indexes for cron job queries (recurrence + scheduled reports)
logEntrySchema.index({logId:1,entryCreatedAt:-1, status:1})
logEntrySchema.index({logId:1,status:1,entryCreatedAt:1,entryCreatedAt:1})
logEntrySchema.index({createdBy:1,logId:1,_id:-1})




const LogEntryModel = mongoose.model("logEntries", logEntrySchema);

module.exports = { LogEntryModel , status};
