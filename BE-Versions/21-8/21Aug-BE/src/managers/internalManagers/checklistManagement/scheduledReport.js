const { DateTime, Duration } = require("luxon");
const {
  findAll,
  findOneLastEntry,
  findOne,
} = require("../../dBManagers/mongoDB_manager");
const {
  ChecklistModel,
} = require("../../../models/mongoDB/checklistManagement/checklist_model");
const User = require("../../../models/mongoDB/userManagement/user_model");
const {
  ReportModel,
} = require("../../../models/mongoDB/reportManagement/report_model");
const {
  ChecklistEntryModel,
} = require("../../../models/mongoDB/checklistManagement/checklistEntry_model");
const {
  scheduleReportGeneration,
} = require("../reportManagement/report_manager");

const schduledReport = async () => {
  try {
    const indiaTimeZone = "Asia/Kolkata";
    const currentDate = DateTime.now().setZone(indiaTimeZone);
    const currentDatePlusOne = currentDate
      .plus({ hours: 6, minutes: 30 })
      .toISO();
    const currentDateMinusOne = currentDate
      .plus({ hours: 4, minutes: 30 })
      .toISO();
    const schduledReportForChecklist = await findAll(
      ChecklistModel,
      {
        $and: [
          {
            $or: [{ status: "scheduled" }, { status: "workInProgress" }],
          },
          { startDateAndTime: { $lte: currentDatePlusOne } },
          { endDateAndTime: { $gte: currentDateMinusOne } },
          { isScheduleReport: true },
        ],
      },
      {
        _id: 1,
        startDateAndTime: 1,
        endDateAndTime: 1,
        createdBy: 1,
        assignees: 1,
        departments: 1,
        teams: 1,
        isEntryStarted: 1,
        name: 1,
        scheduledReportDetails: 1,
        assetId: 1,
        description: 1,
        documentNumber: 1,
      }
    );
    if (schduledReportForChecklist) {
      for (let i = 0; i < schduledReportForChecklist.length; i++) {
        const checklistData = createSchduledReportBody(
          schduledReportForChecklist[i]
        );
        const formatedEndTime = checklistData.endDateAndTime
          ? convertDateFormat(checklistData.endDateAndTime)
          : null;
        const timePeriod = checklistData.scheduledReportDetails
          ? checklistData.scheduledReportDetails.timePeriod || "day"
          : "day";
        if (
          currentDate < formatedEndTime &&
          checklistData.scheduledReportDetails !== null
        ) {
          if (timePeriod === "month") {
            const specificDate = checklistData.scheduledReportDetails
              ? checklistData.scheduledReportDetails.specificDate
                ? checklistData.scheduledReportDetails.specificDate || ""
                : ""
              : "";
            await createSchduledReportForMonth(checklistData, currentDate);
          } else {
            await createSchduledReport(checklistData, currentDate);
          }
        }
      }
    }
  } catch (err) {
    throw err;
  }
};

const createSchduledReportBody = (data) => {
  const startDateAndTime = data.startDateAndTime ? data.startDateAndTime : "";
  const endDateAndTime = data.endDateAndTime ? data.endDateAndTime : "";
  const createdBy = data.createdBy ? data.createdBy : "";
  const checklistId = data._id ? data._id : "";
  const assignees = data.assignees ? data.assignees : [];
  const departments = data.departments ? data.departments : [];
  const teams = data.teams ? data.teams : [];
  const documentNumber = data.documentNumber
    ? data.documentNumber
    : "Not Available";
  const assetId = data.assetId ? data.assetId : "Not Available";
  const description = data.description ? data.description : "";
  const scheduledReportDetails = data.scheduledReportDetails
    ? data.scheduledReportDetails
    : [];
  const name = data.name ? data.name : "Unknown";
  return {
    startDateAndTime,
    endDateAndTime,
    createdBy,
    checklistId,
    assignees,
    departments,
    teams,
    name,
    scheduledReportDetails,
    documentNumber,
    assetId,
    description,
  };
};

const convertDateFormat = (date) => {
  if (date) {
    return DateTime.fromISO(date.toISOString().replace("Z", ""));
  }
  return null;
};

const createSchduledReport = async (checklistData, currentDate) => {
  try {
    const scheduleTime = checklistData.scheduledReportDetails
      ? checklistData.scheduledReportDetails.scheduleTime || "12:00"
      : "12:00";
    const timePeriod = checklistData.scheduledReportDetails
      ? checklistData.scheduledReportDetails.timePeriod || "day"
      : "day";
    const frequency = checklistData.scheduledReportDetails
      ? checklistData.scheduledReportDetails.frequency || 1
      : 1;
    const recurrOn = checklistData.scheduledReportDetails
      ? checklistData.scheduledReportDetails.recurrOn || "allDays"
      : "allDays";
    const approver = checklistData.scheduledReportDetails
      ? checklistData.scheduledReportDetails.approver || ""
      : "";
    let occurDays = [];
    if (recurrOn === "allDays") {
      occurDays = [
        "sunday",
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
      ];
    } else if (recurrOn === "onlyOnWeekDays") {
      occurDays = ["monday", "tuesday", "wednesday", "thursday", "friday"];
    }
    let generateReportFlag = false;
    const formatedEndTime = checklistData.endDateAndTime
      ? convertDateFormat(checklistData.endDateAndTime)
      : null;
    const formatedStartTime = checklistData.startDateAndTime
      ? convertDateFormat(checklistData.startDateAndTime)
      : null;
    const { rangeStart, rangeEnd, lastEntryDate } = await findRange(
      formatedStartTime,
      formatedEndTime,
      checklistData.createdBy,
      checklistData.checklistId,
      scheduleTime,
      timePeriod,
      frequency,
      currentDate
    );
    const entryDay = rangeStart.toFormat("cccc").toLowerCase();
    if (occurDays.includes(entryDay)) {
      generateReportFlag = true;
    }

    if (
      rangeStart &&
      rangeEnd &&
      lastEntryDate != rangeEnd &&
      generateReportFlag
    ) {
      const rangeEndPlusOne = rangeEnd.plus({ hours: 5, minutes: 30 }).toISO();
      const rangeStartPlusOne = rangeStart
        .plus({ hours: 5, minutes: 30 })
        .toISO();
      const getDataForReport = await findAll(ChecklistEntryModel, {
        $and: [
          {
            checklistId: checklistData.checklistId,
          },
          {
            status: "completed",
          },
          { entryCreatedAt: { $lte: rangeEndPlusOne } },
          { entryCreatedAt: { $gte: rangeStartPlusOne } },
        ],
      });
      const approverD = await findOne(
        User,
        { _id: approver },
        { _id: 0, name: 1 }
      );
      const approvername = approverD ? approverD.name || "Unknown" : "Unknown";
      if (getDataForReport.length > 0) {
        await scheduleReportGeneration(
          checklistData,
          getDataForReport,
          "checklist",
          approvername,
          rangeEnd,
          formatedStartTime,
          formatedEndTime
        );
      }
    }
  } catch (err) {
    console.log("err", err);
    throw err;
  }
};

const findRange = async (
  start,
  end,
  createdBy,
  checklistId,
  scheduleTime,
  timePeriod,
  frequency,
  currentDate
) => {
  const lastreport = await findOneLastEntry(ReportModel, {
    createdBy,
    moduleEntityId: checklistId,
  });
  let lastEntryDate;
  let rangeStart;
  let rangeEnd;
  if (lastreport) {
    lastEntryDate = convertDateFormat(lastreport.reportCreatedAt);
    rangeStart = lastEntryDate;
    rangeEnd = await calculateEndTime(
      rangeStart,
      scheduleTime,
      timePeriod,
      frequency
    );
  } else {
    const [hours, minutes] = scheduleTime.split(":").map(Number);
    rangeStart = start;
    rangeEnd = currentDate.set({
      hour: hours,
      minute: minutes,
      second: 0,
    });
  }
  return { rangeStart, rangeEnd, lastEntryDate };
};

const calculateEndTime = async (
  rangeStart,
  scheduleTime,
  timePeriod,
  frequency
) => {
  const [hours, minutes] = scheduleTime.split(":").map(Number);
  let duration;
  switch (timePeriod) {
    case "day":
      duration = Duration.fromObject({ days: frequency });
      break;
    case "week":
      duration = Duration.fromObject({ weeks: frequency });
      break;
    case "month":
      duration = Duration.fromObject({ months: frequency });
      break;
    default:
      throw new Error("Invalid time period");
  }
  let nextInterval = rangeStart.plus(duration);
  nextInterval = nextInterval.set({
    hour: hours,
    minute: minutes,
    second: 0,
  });
  return nextInterval;
};

const createSchduledReportForMonth = async (checklistData, currentDate) => {
  try {
    const frequency = checklistData.scheduledReportDetails
      ? checklistData.scheduledReportDetails.frequency || 1
      : 1;
    const scheduleTime = checklistData.scheduledReportDetails
      ? checklistData.scheduledReportDetails.scheduleTime || "12:00"
      : "12:00";
    const approver = checklistData.scheduledReportDetails
      ? checklistData.scheduledReportDetails.approver || ""
      : "";
    const formatedStartDate = checklistData.startDateAndTime
      ? convertDateFormat(checklistData.startDateAndTime)
      : null;
    const formatedEndTime = checklistData.endDateAndTime
      ? convertDateFormat(checklistData.endDateAndTime)
      : null;
    const createdBy = checklistData.createdBy ? checklistData.createdBy : "";
    const actualDate = formatedStartDate.plus({ months: frequency });
    const [hours, minutes] = scheduleTime.split(":").map(Number);
    let actualScheduleDate = actualDate.set({
      hour: hours,
      minute: minutes,
      second: 0,
    });
    const lastreport = await findOneLastEntry(ReportModel, {
      createdBy,
      moduleEntityId: checklistData.checklistId,
    });
    let rangeStart;
    let rangeEnd;
    if (lastreport) {
      const lastEntryDate = lastreport
        ? convertDateFormat(lastreport.reportCreatedAt) || ""
        : "";
      actualScheduleDate = actualScheduleDate.plus({ months: frequency });
      if (lastEntryDate < actualScheduleDate) {
        rangeStart = lastEntryDate.plus({ hours: 5, minutes: 30 }).toISO();
        rangeEnd = actualScheduleDate.plus({ hours: 5, minutes: 30 }).toISO();
      }
    } else {
      rangeStart = formatedStartDate.plus({ hours: 5, minutes: 30 }).toISO();
      rangeEnd = actualScheduleDate.plus({ hours: 5, minutes: 30 }).toISO();
    }
    const getDataForReport = await findAll(ChecklistEntryModel, {
      $and: [
        {
          checklistId: checklistData.checklistId,
        },
        {
          status: "completed",
        },
        { entryCreatedAt: { $lte: rangeEnd } },
        { entryCreatedAt: { $gte: rangeStart } },
      ],
    });
    const approverD = await findOne(
      User,
      { _id: approver },
      { _id: 0, name: 1 }
    );
    const approvername = approverD ? approverD.name || "Unknown" : "Unknown";
    if (getDataForReport.length > 0) {
      await scheduleReportGeneration(
        checklistData,
        getDataForReport,
        "checklist",
        approvername,
        actualScheduleDate,
        formatedStartDate,
        formatedEndTime
      );
    }
  } catch (err) {
    throw err;
  }
};

module.exports = { schduledReport };
