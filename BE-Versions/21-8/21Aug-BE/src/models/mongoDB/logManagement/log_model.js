const mongoose = require("mongoose");

const logStatus = {
  DRAFT: "draft",
  SCHEDULED: "scheduled",
  OVERDUE: "overdue",
  COMPLETED: "completed",
  WORK_IN_PROGRESS: "workInProgress",
  PENDING_FOR_APPROVAL: "pendingForApproval",
};

const timePeriod = {
  HOUR: "hour",
  DAY: "day",
  WEEK: "week",
  MONTH: "month",
  // YEAR: "year",
};

const recurrOn = {
  All_DAYS: "allDays",
  ONLY_ON_WEEK_DAYS: "onlyOnWeekDays",
  CUSTOM: "custom",
};

const reurrOnForReport = {
  All_DAYS: "allDays",
  ONLY_ON_WEEK_DAYS: "onlyOnWeekDays",
  CUSTOM_WEEK_DAYS: "customWeekDays",
};

const timePeriodForReport = {
  DAY: "day",
  WEEK: "week",
  MONTH: "month",
};

const days = {
  SUNDAY: "sunday",
  MONDAY: "monday",
  TUESDAY: "tuesday",
  WEDNESDAY: "wednesday",
  THRUSDAY: "thursday",
  FRIDAY: "friday",
  SATURDAY: "saturday",
};

const specificDayRecurrenceSchema = new mongoose.Schema({
  type: {
    type: String,
    default: null,
  },
  day: {
    type: String,
    default: null,
  },
  weekDay: {
    type: String,
    default: null,
  },
  occurrence: {
    type: String,
    default: null,
  },
  date: {
    type: String,
    default: null,
  },
});

const recurrenceDetailsSchema = new mongoose.Schema({
  frequency: {
    type: Number,
    required: true,
  },
  timePeriod: {
    type: String,
    enum: Object.values(timePeriod),
    required: true,
  },
  recurrOn: {
    type: String,
    enum: Object.values(recurrOn),
  },
  occurDays: {
    type: [String],
    enum: Object.values(days),
    default: [],
  },
  specificDay: {
    type: String,
    default: null,
  },
});

const PausedAndResumedSchema = new mongoose.Schema({
  pausedDate: {
    type: Date,
  },
  reason:{
    type: String,
    required: true
  },
  resumedDate: {
    type: Date,
  },
  pausedBy:{
    type: String,
    required: true,
  }
}, { _id: false });
// const userRecurrenceSchema = new mongoose.Schema({
//   occurDays: {
//     type: [String],
//     default: [],
//   },
//   specificYear: {
//     type: String,
//     default: null,
//   },
//   shiftTiming: {
//     type: mongoose.Schema.Types.Mixed,
//     default: {},
//   },
// });

// const userSpecificDetailsSchema = new mongoose.Schema({
//   operatorId: {
//     type: String,
//   },
//   userRecurrenceDetails: {
//     type: [userRecurrenceSchema],
//     default: [],
//   },
// });

const scheduledReportSchema = new mongoose.Schema({
  scheduleTime: {
    type: String,
    required: true,
  },
  approver: {
    type: String,
    required: true,
  },
  frequency: {
    type: String,
    required: true,
  },
  timePeriod: {
    type: String,
    enum: Object.values(timePeriodForReport),
    required: true,
  },
  recurrOn: {
    type: String,
    enum: Object.values(reurrOnForReport),
  },
  specificDays: {
    type: [String],
    enum: Object.values(days),
    default: [],
  },
});

const logSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      maxLength: 50,
    },
    logNumber: {
      type: Number,
    },
    description: {
      type: String,
      maxLength: 1000,
    },
    documentNumber: {
      type: String,
      maxLength: 20,
      default: null,
    },
    assetId: {
      type: String,
    },
    departments: {
      type: [String],
    },
    teams: {
      type: [String],
    },
    assignees: {
      type: [String],
    },
    emailNotificationRecipients: {
      type: [String],
      default: [],
    },
    criticalNotificationRecipients:{
      type: [String],
      default: [],
    },
    approvers:{
      type: [String],
    },
    approvedBy:{
      type: [String],
    },
    status: {
      type: String,
      enum: Object.values(logStatus),
      default: "draft",
    },
    startDateAndTime: {
      type: Date,
    },
    endDateAndTime: {
      type: Date,
    },
    isRecurrence: {
      type: Boolean,
      default: false,
    },
    isStaticGeneration: {
      type: Boolean,
    },
    isScheduleReport: {
      type: Boolean,
    },
    pausedAndResumedPeriods:{
      type: [PausedAndResumedSchema],
      default : [],
    },
    isPaused:{
      type: Boolean,
      default: false
    },
    createdBy: {
      type: String,
    },
    updatedBy: {
      type: String,
      default: "",
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    recurrenceDetails: {
      type: recurrenceDetailsSchema,
      default: null,
    },
    isUserCustomization:{
      type: Boolean,
      default: false,
    },
    // userSpecificDetails: {
    //   type: [userSpecificDetailsSchema],
    //   default: [],
    // },
    isEntryStarted: {
      type: Boolean,
      default: false,
    },
    scheduledReportDetails: {
      type: scheduledReportSchema,
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

logSchema.index({ createdBy: 1, businessUnit: 1, assetId:1 });
logSchema.index({ createdBy: 1, businessUnit: 1, name:1 });
logSchema.index({ assignees: 1, businessUnit: 1, name:1, status:1 });
logSchema.index({ assignees: 1, businessUnit: 1, assetId:1 });
logSchema.index({ approvers: 1, businessUnit: 1, name:1, status:1  });
logSchema.index({ approvers: 1, businessUnit: 1, assetId:1  });
logSchema.index({ operatorIds: 1, businessUnit:1, status:1 });
logSchema.index({ operatorIds: 1, businessUnit:1, assetId:1 });
logSchema.index({ status: 1 });
logSchema.index({ name: 1, businessUnit:1 });
logSchema.index({ documentNumber: 1, businessUnit:1 });
logSchema.index({ status: 1, startDateAndTime:1,endDateAndTime:1,isActive:1  });
logSchema.index({isActive:1 });




const LogModel = mongoose.model("log", logSchema);

module.exports = { LogModel , logStatus};
