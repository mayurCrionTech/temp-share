const mongoose = require("mongoose");

const checklistStatus = {
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
  YEAR: "year",
};

const recurrOn = {
  All_DAYS: "allDays",
  ONLY_ON_WEEK_DAYS: "onlyOnWeekDays",
  CUSTOM: "custom",
};

const reurrOnForReport = {
  All_DAYS: "allDays",
  ONLY_ON_WEEK_DAYS: "onlyOnWeekDays",
};

const timePeriodForReport = {
  DAY: "day",
  WEEK: "week",
  MONTH: "month",
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
    default: 0,
  },
  timePeriod: {
    type: String,
    enum: Object.values(timePeriod),
    default: "hour",
  },
  recurrOn: {
    type: String,
    enum: Object.values(recurrOn),
  },
  occurDays: {
    type: [String],
    default: [],
  },
  specificDay: {
    type: specificDayRecurrenceSchema,
    default: null,
  },
});

const userRecurrenceSchema = new mongoose.Schema({
  occurDays: {
    type: [String],
    default: [],
  },
  specificYear: {
    type: String,
    default: null,
  },
  shiftTiming: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
});

const userSpecificDetailsSchema = new mongoose.Schema({
  operatorId: {
    type: String,
  },
  userRecurrenceDetails: {
    type: [userRecurrenceSchema],
    default: [],
  },
});

const scheduledReportSchema = new mongoose.Schema({
  scheduleTime: {
    type: String,
  },
  approver: {
    type: String,
  },
  frequency: {
    type: String,
  },
  timePeriod: {
    type: String,
    enum: Object.values(timePeriodForReport),
    default:"day"
  },
  recurrOn: {
    type: String,
    enum: Object.values(reurrOnForReport),
  },
  specificDate: {
    type: String,
  },
});

const checklistSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      maxLength: 50,
    },
    checklistNumber: {
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
    status: {
      type: String,
      enum: Object.values(checklistStatus),
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
    createdBy: {
      type: String,
    },
    updatedBy: {
      type: String,
      default: "",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    recurrenceDetails: {
      type: recurrenceDetailsSchema,
      default: null,
    },
    userSpecificDetails: {
      type: [userSpecificDetailsSchema],
      default: [],
    },
    isEntryStarted: {
      type: Boolean,
      default: false,
    },
    scheduledReportDetails: {
      type: scheduledReportSchema,
      default: null,
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

const ChecklistModel = mongoose.model("checklist", checklistSchema);

module.exports = { ChecklistModel };
