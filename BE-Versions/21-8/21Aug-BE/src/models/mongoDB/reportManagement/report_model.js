const mongoose = require("mongoose");
const { reportschema } = require("../../../utils/swaggerDocs/schemas/reportManagement/report_schema");

const type = {
  CHECKLIST: "checklist",
  LOGS: "logs",
};

const format = {
  PDF: "pdf",
};
const reportStatus = {
  COMPLETED: "completed",
  REVISED: "revised",
  PENDING_FOR_APPROVAL: "pendingForApproval",
};
const reportType = {
  PORTRAIT :"portrait",
  LANDSCAPE: "landscape"
}

const commentSchema = new mongoose.Schema({
  index: {
    type: Number,
  },
  comment: {
    type: String,
  },
  userId: {
    type: String,
  },
  addedAt: {
    type: Date,
    default: null,
  },
});

const reportSchema = new mongoose.Schema(
  {
    businessUnit: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "BusinessUnit",
      required: true
    },
    moduleName: {
      type: String,
      enum: Object.values(type),
      default: "checklist",
    },
    moduleEntityId: {
      type: String,
      default: null,
    },
    startDateAndTime: {
      type: Date,
      required: true,
    },
    endDateAndTime: {
      type: Date,
      required: true,
    },
    format: {
      type: String,
      enum: Object.values(format),
      default: "pdf",
    },
    documentId: {
      type: String,
      default: null,
    },
    history: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'File'  // Reference to the 'files' collection
    }],
    createdBy: {
      type: String,
    },
    reportCreatedAt: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(reportStatus),
      default: "pendingForApproval",
    },
    approver: {
      type: String,
    },
    reportType:{
      type: String,
      enum: Object.values(reportType),
      default:"portrait"
    },
    reportKind:{
      type: String,
      enum:["shift", "frequency"]
    },
    reportNumber: {
      type: Number,
    },
    reportName: {
      type: String,
    },
    comments: {
      type: [commentSchema],
      default: null,
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

reportSchema.index({createdBy:1,businessUnit:1, status:1})
reportSchema.index({approver:1,businessUnit:1, status:1})
reportSchema.index({createdBy:1,businessUnit:1, moduleName:1})
reportSchema.index({approver:1,businessUnit:1, moduleName:1})

const ReportModel = mongoose.model("report", reportSchema);

module.exports = { ReportModel ,reportStatus};
