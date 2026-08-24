const { DateTime, Duration } = require("luxon");
const {
  findOneLastEntry,
  findOne,
} = require("../../dBManagers/mongoDB_manager");
const User = require("../../../models/mongoDB/userManagement/user_model");
const {
  ReportModel,
} = require("../../../models/mongoDB/reportManagement/report_model");
const {
  Shift,
} = require("../../../models/mongoDB/organizationManagement/shift_model");
const {
  scheduleReportGeneration,
} = require("../reportManagement/report_manager");
const {
  LogEntryModel,
} = require("../../../models/mongoDB/logManagement/logEntry_model");
const { LogModel } = require("../../../models/mongoDB/logManagement/log_model");
const {
  constructPauseLogTemplateData,
  sendPauseLogEmail,
} = require("../../../utils/emailService/templates/pauseLogEmailTemplate");

const schduledReportForLog = async () => {
  try {
    const currentDate = DateTime.now();
    const currentDatePlusOne = currentDate.plus({ hours: 1, minutes: 0 });
    const currentDateMinusOne = currentDate.minus({ hours: 1, minutes: 0 });
    const schduledReport = await LogModel.find({
        $or: [{ status: "scheduled" }, { status: "workInProgress" }],
        startDateAndTime: { $lte: currentDatePlusOne.toJSDate() },
        endDateAndTime: { $gte: currentDateMinusOne.toJSDate() },
        isScheduleReport: true,
        isActive: true,
      }, {
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
        businessUnit: 1,
        emailNotificationRecipients: 1,
        approvers: 1,
        isPaused: 1,
        pausedAndResumedPeriods: 1,
      }).lean();
    if (schduledReport) {
      for (let i = 0; i < schduledReport.length; i++) {
        const logData = createSchduledReportBody(schduledReport[i]);
        const formatedEndTime = logData.endDateAndTime
        ? convertDateFormat(logData.endDateAndTime)
        : null;
        if (
          currentDate < formatedEndTime &&
          logData.scheduledReportDetails !== null
        ) {
          await createSchduledReport(logData, currentDate);
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
  const id = data._id ? data._id : "";
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
  const businessUnit = data.businessUnit ? data.businessUnit: "Not Available"
  const emailNotificationRecipients = data.emailNotificationRecipients
    ? data.emailNotificationRecipients
    : [];
    const approvers = data.approvers ? data.approvers : "Not Available"
    const isPaused = data.isPaused ? data.isPaused : false;
    const pausedAndResumedPeriods = data.pausedAndResumedPeriods ? data.pausedAndResumedPeriods : [];
  return {
    startDateAndTime,
    endDateAndTime,
    createdBy,
    id,
    assignees,
    departments,
    teams,
    name,
    scheduledReportDetails,
    documentNumber,
    assetId,
    description,
    businessUnit,
    emailNotificationRecipients,
    approvers,
    isPaused,
    pausedAndResumedPeriods,
  };
};

const convertDateFormat = (date) => {
  if (date) {
    return DateTime.fromJSDate(date);
  }
  return null;
};

const createSchduledReport = async (logData, currentDate) => {
  try {
    const scheduleTime = logData.scheduledReportDetails
      ? logData.scheduledReportDetails.scheduleTime || "12:00"
      : "12:00";
    const timePeriod = logData.scheduledReportDetails
      ? logData.scheduledReportDetails.timePeriod || "day"
      : "day";
    const frequency = logData.scheduledReportDetails
      ? logData.scheduledReportDetails.frequency || 1
      : 1;
    const recurrOn = logData.scheduledReportDetails
      ? logData.scheduledReportDetails.recurrOn || "allDays"
      : "allDays";
    const approver = logData.scheduledReportDetails
      ? logData.scheduledReportDetails.approver || ""
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
    else if (recurrOn === "customWeekDays") {
      occurDays = logData.scheduledReportDetails.specificDays ? logData.scheduledReportDetails.specificDays : ["monday", "tuesday", "wednesday", "thursday", "friday"];
    }
    let generateReportFlag = true;
    const formatedEndTime = logData.endDateAndTime
      ? convertDateFormat(logData.endDateAndTime)
      : null;
    const formatedStartTime = logData.startDateAndTime
      ? convertDateFormat(logData.startDateAndTime)
      : null;
    const { rangeStart, rangeEnd, lastEntryDate, reportNumber } =
      await findRange(
        formatedStartTime,
        formatedEndTime,
        logData.createdBy,
        logData.id,
        scheduleTime,
        timePeriod,
        frequency,
        currentDate
      );
    if (!rangeStart || !rangeEnd) return;
    const entryDay = rangeEnd.toFormat("cccc").toLowerCase();
    if (!occurDays.includes(entryDay)) {
      generateReportFlag = false;
    }
    const rangeEndPlusFiveMinutes = rangeEnd.plus({ minutes: 10 })
    const rangeEndMinusFiveMinutes = rangeEnd.minus({minutes: 5 })
    const approverD = await findOne(
      User,
      { _id: approver },
      { _id: 0, name: 1 }
    );
    const approvername = approverD ? approverD.name || "Unknown" : "Unknown";
    if (
      currentDate >= rangeStart && 
      currentDate >= rangeEnd.plus({ hours: 1 }) &&
      rangeEnd &&
      lastEntryDate != rangeEnd &&
      generateReportFlag
    ) 
    {
      const getDataForReport = await LogEntryModel.find({
        logId: logData.id,
        status: { $in: ["completed", "pendingForApproval"] },
        entryCreatedAt: { $gte: rangeStart.toJSDate(), $lte: rangeEnd.toJSDate() },
      }).lean();

      if (getDataForReport.length > 0) {
        await scheduleReportGeneration(
          logData,
          getDataForReport,
          "logs",
          approvername,
          rangeStart,
          rangeEnd,
          formatedStartTime,
          formatedEndTime,
          reportNumber,
          approver,
          "frequency"
        );
      }
    }
    else {
      if (logData.isPaused == true) {
        // Check if the current time is within ±4 minutes of the scheduled time
        const currentTime = new Date();
        const currentHours = currentTime.getHours();
        const currentMinutes = currentTime.getMinutes();
        
        // Convert current time to format "HH:MM"
        const formattedCurrentTime = `${String(currentHours).padStart(2, '0')}:${String(currentMinutes).padStart(2, '0')}`;
        
        // Get scheduled time from logData
        const scheduledTime = logData.scheduledReportDetails.scheduleTime; // Format: "06:45"
        
        // Parse both times to calculate the difference in minutes
        const [schedHours, schedMinutes] = scheduledTime.split(':').map(Number);
        const [currHours, currMinutes] = formattedCurrentTime.split(':').map(Number);
        
        // Convert both times to minutes since midnight
        const scheduledTotalMinutes = schedHours * 60 + schedMinutes;
        const currentTotalMinutes = currHours * 60 + currMinutes;
        
        // Calculate absolute difference in minutes
        const timeDifference = Math.abs(scheduledTotalMinutes - currentTotalMinutes);
        
        // Check if time difference is within the 4-minute window
        if (timeDifference <= 4) {
          // Time is within the acceptable range, proceed with the existing logic
          const lastEntry = logData.pausedAndResumedPeriods?.[logData.pausedAndResumedPeriods.length - 1];
          const pausedByUserObj = await findOne(User, { _id: lastEntry.pausedBy }, { _id: 0, name: 1 });
          
          
          const constructedData = await constructPauseLogTemplateData(
            approvername, 
            logData.name, 
            pausedByUserObj.name, 
            new Date(lastEntry.pausedDate).toISOString(), 
            "is currently"
          );
          
          let approverObj = await findOne(User, { _id: approver }, { _id: 0, name: 1, email: 1 });
          const emailNotificationRecipients = logData.emailNotificationRecipients;
          const ccEmailNotificationRecipients = [];
          
          if (emailNotificationRecipients && emailNotificationRecipients.length > 0) {
            for (let i = 0; i < emailNotificationRecipients.length; i++) {
              let emailNotificationRecipientsUserObj = await findOne(
                User, 
                { _id: emailNotificationRecipients[i] }, 
                { _id: 0, name: 1, email: 1 }
              );
              
              if (emailNotificationRecipientsUserObj) {
                ccEmailNotificationRecipients.push(emailNotificationRecipientsUserObj.email);
              }
            }
          }
          
          constructedData.cc = ccEmailNotificationRecipients;
          await sendPauseLogEmail([approverObj.email], `Log Paused ${logData.name}`, constructedData);
        }
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
  logId,
  scheduleTime,
  timePeriod,
  frequency,
  currentDate
) => {
  const MAX_ITERATIONS = 500;
  const lastreport = await findOneLastEntry(ReportModel, {
    createdBy,
    moduleEntityId: logId,
    reportKind: "frequency"
  });

  let rangeStart;
  let rangeEnd;
  let lastEntryDate;
  let reportNumber;

  if (lastreport) {
    lastEntryDate = convertDateFormat(lastreport.reportCreatedAt);
    rangeStart = lastEntryDate;
    rangeEnd = await calculateEndTime(rangeStart, scheduleTime, timePeriod, frequency);
    reportNumber = lastreport.reportNumber ? lastreport.reportNumber + 1 : 1;
  } else {
    const [hours, minutes] = scheduleTime.split(":").map(Number);
    rangeStart = start;
    rangeEnd = currentDate.set({ hour: hours, minute: minutes, second: 0, millisecond: 0 });
    reportNumber = 1;
  }

  // Iterate forward through periods until we find one with entries or exceed currentDate
  for (let i = 0; i < MAX_ITERATIONS; i++) {
    if (rangeEnd > currentDate || rangeStart > currentDate) {
      break;
    }

    const hasEntries = await LogEntryModel.countDocuments({
      logId: logId,
      status: { $in: ["completed", "pendingForApproval"] },
      entryCreatedAt: { $gte: rangeStart.toJSDate(), $lte: rangeEnd.toJSDate() },
    });

    if (hasEntries > 0) {
      break;
    }

    // No entries in this range — advance to next period
    rangeStart = rangeEnd;
    rangeEnd = await calculateEndTime(rangeStart, scheduleTime, timePeriod, frequency);
  }

  return { rangeStart, rangeEnd, lastEntryDate, reportNumber };
};


const generateReportForShift = async () => {
  try {
    const currentDate = DateTime.now();
    const allLogs = await getAllLogsForReportGeneration();
    for (let log of allLogs) {
        const shifts = await getListOfShiftUsingBusinessUnit(log.businessUnit);
        for (let shift of shifts) {
          const [sHour, sMinute, sSecond] = shift.shiftHours.start
            .split(":")
            .map(Number);
          const [eHour, eMinute, eSecond] = shift.shiftHours.end
            .split(":")
            .map(Number);

          const shiftStart = currentDate.set({
            hour: sHour,
            minute: sMinute,
            second: 0,
            millisecond: 0,
          });
          const shiftEnd = currentDate.set({
            hour: eHour,
            minute: eMinute,
            second: 0,
            millisecond: 0,
          });
          const lastreport = await lastEntryReportDate(log._id, shiftStart);
          let lastReportDate;
          if(lastreport){
            lastReportDate = lastreport.reportCreatedAt
          }
          if (
            currentDate >= shiftStart &&
            currentDate >= shiftEnd.plus({ hours: 1 }) &&
             (!lastreport || lastReportDate < shiftEnd)
          ) {
            const entries = await getEntriesWithinRangeUsingLogId(
              log._id,
              shiftStart,
              shiftEnd
            );
            if (entries.length > 0) {
              const approver = await findOne(
                User,
                { _id: log.scheduledReportDetails.approver },
                { _id: 1, name: 1 }
              );
              const reportNumber = await getReportNumber(log._id);

              await scheduleReportGeneration(
                log,
                entries,
                "logs",
                approver.name,
                shiftStart,
                shiftEnd,
                log.startDateAndTime,
                log.endDateAndTime,
                reportNumber,
                approver._id,
                "shift" // distinguish between shift vs frequency
              );
            }
          }
        }
    }
  } catch (error) {
    throw error;
  }
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
    millisecond: 0,
  });
  return nextInterval;
};

module.exports = { schduledReportForLog, generateReportForShift };

async function getListOfShiftUsingBusinessUnit(businessUnitId) {
  const shifts = await Shift.find({
    businessUnit: businessUnitId,
    isDeleted: false,
  }).lean();
  return shifts;
}

async function getEntriesWithinRangeUsingLogId(logId, startTime, endTime) {
  const fetchedLogEntries = await LogEntryModel.find({
    logId: logId,
    status: { $in: ["completed", "pendingForApproval"] },
    entryCreatedAt: { $gte: startTime.toJSDate(), $lte: endTime.toJSDate() },
  }).lean();
  return fetchedLogEntries;
}

async function getAllLogsForReportGeneration() {
  const schduledReport = await LogModel.find({
    $or: [{ status: "scheduled" }, { status: "workInProgress" }],
    isScheduleReport: true,
    isActive: true,
  }, {
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
    businessUnit: 1,
    emailNotificationRecipients: 1,
    approvers: 1,
    isPaused: 1,
    pausedAndResumedPeriods: 1,
  }).lean();
  return schduledReport;
}

async function getReportNumber(logId) {
  let reportNumber;
  const lastreport = await findOneLastEntry(ReportModel, {
    moduleEntityId: logId,
    reportKind: "shift",
  });
  if(lastreport){
    reportNumber = lastreport.reportNumber
    ? lastreport.reportNumber + 1
    : 1;
  }
  else{
    reportNumber = 1;
  }
  return reportNumber;
}

async function lastEntryReportDate (logId, shiftStart){
  let lastEntryDate;
  const lastreport = await findOneLastEntry(ReportModel, {
      moduleEntityId: logId,
      reportKind: "shift",
    });
    if(lastreport){
      lastEntryDate = lastreport.reportCreatedAt
    }
    else{
      lastEntryDate = shiftStart
    }
    return lastreport;
}



// const { DateTime, Duration } = require("luxon");
// const {
//   findAll,
//   findOneLastEntry,
//   findOne,
// } = require("../../dBManagers/mongoDB_manager");
// const User = require("../../../models/mongoDB/userManagement/user_model");
// const {
//   ReportModel,
// } = require("../../../models/mongoDB/reportManagement/report_model");
// const {
//   Shift,
// } = require("../../../models/mongoDB/organizationManagement/shift_model");
// const {
//   scheduleReportGeneration,
// } = require("../reportManagement/report_manager");
// const {
//   LogEntryModel,
// } = require("../../../models/mongoDB/logManagement/logEntry_model");
// const { LogModel } = require("../../../models/mongoDB/logManagement/log_model");
// const {
//   constructPauseLogTemplateData,
//   sendPauseLogEmail,
// } = require("../../../utils/emailService/templates/pauseLogEmailTemplate");

// const schduledReportForLog = async () => {
//   try {
//     const currentDate = DateTime.now();
//     const currentDatePlusOne = currentDate.plus({ hours: 1, minutes: 0 });
//     const currentDateMinusOne = currentDate.minus({ hours: 1, minutes: 0 });
//     const schduledReport = await findAll(
//       LogModel,
//       {
//         $and: [
//           {
//             $or: [{ status: "scheduled" }, { status: "workInProgress" }],
//           },
//           { startDateAndTime: { $lte: currentDatePlusOne } },
//           { endDateAndTime: { $gte: currentDateMinusOne } },
//           { isScheduleReport: true },
//           { isActive: true },
//         ],
//       },
//       {
//         _id: 1,
//         startDateAndTime: 1,
//         endDateAndTime: 1,
//         createdBy: 1,
//         assignees: 1,
//         departments: 1,
//         teams: 1,
//         isEntryStarted: 1,
//         name: 1,
//         scheduledReportDetails: 1,
//         assetId: 1,
//         description: 1,
//         documentNumber: 1,
//         businessUnit: 1,
//         emailNotificationRecipients: 1,
//         approvers: 1,
//         isPaused: 1,
//         pausedAndResumedPeriods: 1,
//       }
//     );
//     if (schduledReport) {
//       for (let i = 0; i < schduledReport.length; i++) {
//         const logData = createSchduledReportBody(schduledReport[i]);
//         const formatedEndTime = logData.endDateAndTime
//         ? convertDateFormat(logData.endDateAndTime)
//         : null;
//         if (
//           currentDate < formatedEndTime &&
//           logData.scheduledReportDetails !== null
//         ) {
//           await createSchduledReport(logData, currentDate);
//         }
//       }
//     }
//   } catch (err) {
//     throw err;
//   }
// };

// const createSchduledReportBody = (data) => {
//   const startDateAndTime = data.startDateAndTime ? data.startDateAndTime : "";
//   const endDateAndTime = data.endDateAndTime ? data.endDateAndTime : "";
//   const createdBy = data.createdBy ? data.createdBy : "";
//   const id = data._id ? data._id : "";
//   const assignees = data.assignees ? data.assignees : [];
//   const departments = data.departments ? data.departments : [];
//   const teams = data.teams ? data.teams : [];
//   const documentNumber = data.documentNumber
//     ? data.documentNumber
//     : "Not Available";
//   const assetId = data.assetId ? data.assetId : "Not Available";
//   const description = data.description ? data.description : "";
//   const scheduledReportDetails = data.scheduledReportDetails
//     ? data.scheduledReportDetails
//     : [];
//   const name = data.name ? data.name : "Unknown";
//   const businessUnit = data.businessUnit ? data.businessUnit: "Not Available"
//   const emailNotificationRecipients = data.emailNotificationRecipients
//     ? data.emailNotificationRecipients
//     : [];
//     const approvers = data.approvers ? data.approvers : "Not Available"
//     const isPaused = data.isPaused ? data.isPaused : false;
//     const pausedAndResumedPeriods = data.pausedAndResumedPeriods ? data.pausedAndResumedPeriods : [];
//   return {
//     startDateAndTime,
//     endDateAndTime,
//     createdBy,
//     id,
//     assignees,
//     departments,
//     teams,
//     name,
//     scheduledReportDetails,
//     documentNumber,
//     assetId,
//     description,
//     businessUnit,
//     emailNotificationRecipients,
//     approvers,
//     isPaused,
//     pausedAndResumedPeriods,
//   };
// };

// const convertDateFormat = (date) => {
//   if (date) {
//     return DateTime.fromJSDate(date);
//   }
//   return null;
// };

// const createSchduledReport = async (logData, currentDate) => {
//   try {
//     const scheduleTime = logData.scheduledReportDetails
//       ? logData.scheduledReportDetails.scheduleTime || "12:00"
//       : "12:00";
//     const timePeriod = logData.scheduledReportDetails
//       ? logData.scheduledReportDetails.timePeriod || "day"
//       : "day";
//     const frequency = logData.scheduledReportDetails
//       ? logData.scheduledReportDetails.frequency || 1
//       : 1;
//     const recurrOn = logData.scheduledReportDetails
//       ? logData.scheduledReportDetails.recurrOn || "allDays"
//       : "allDays";
//     const approver = logData.scheduledReportDetails
//       ? logData.scheduledReportDetails.approver || ""
//       : "";
//     let occurDays = [];
//     if (recurrOn === "allDays") {
//       occurDays = [
//         "sunday",
//         "monday",
//         "tuesday",
//         "wednesday",
//         "thursday",
//         "friday",
//         "saturday",
//       ];
//     } else if (recurrOn === "onlyOnWeekDays") {
//       occurDays = ["monday", "tuesday", "wednesday", "thursday", "friday"];
//     }
//     else if (recurrOn === "customWeekDays") {
//       occurDays = logData.scheduledReportDetails.specificDays ? logData.scheduledReportDetails.specificDays : ["monday", "tuesday", "wednesday", "thursday", "friday"];
//     }
//     let generateReportFlag = true;
//     const formatedEndTime = logData.endDateAndTime
//       ? convertDateFormat(logData.endDateAndTime)
//       : null;
//     const formatedStartTime = logData.startDateAndTime
//       ? convertDateFormat(logData.startDateAndTime)
//       : null;
//     const { rangeStart, rangeEnd, lastEntryDate, reportNumber } =
//       await findRange(
//         formatedStartTime,
//         formatedEndTime,
//         logData.createdBy,
//         logData.id,
//         scheduleTime,
//         timePeriod,
//         frequency,
//         currentDate
//       );
//     const entryDay = rangeEnd.toFormat("cccc").toLowerCase();
//     if (!occurDays.includes(entryDay)) {
//       generateReportFlag = false;
//     }
//     const rangeEndPlusFiveMinutes = rangeEnd.plus({ minutes: 10 })
//     const rangeEndMinusFiveMinutes = rangeEnd.minus({minutes: 5 })
//     const approverD = await findOne(
//       User,
//       { _id: approver },
//       { _id: 0, name: 1 }
//     );
//     const approvername = approverD ? approverD.name || "Unknown" : "Unknown";
//     if (
//       currentDate >= rangeStart && 
//       currentDate >= rangeEnd.plus({ hours: 1 }) &&
//       rangeEnd &&
//       lastEntryDate != rangeEnd &&
//       generateReportFlag
//     ) 
//     {
//       const getDataForReport = await findAll(LogEntryModel, {
//         $and: [
//           {
//             logId: logData.id,
//           },
//           {
//             status: {$in:["completed", "pendingForApproval"]},
//           },
//           { entryCreatedAt: { $lte: rangeEnd } },
//           { entryCreatedAt: { $gte: rangeStart } },
//         ],
//       });

//       if (getDataForReport.length > 0) {
//         await scheduleReportGeneration(
//           logData,
//           getDataForReport,
//           "logs",
//           approvername,
//           rangeStart,
//           rangeEnd,
//           formatedStartTime,
//           formatedEndTime,
//           reportNumber,
//           approver,
//           "frequency"
//         );
//       }
//     }
//     else {
//       if (logData.isPaused == true) {
//         // Check if the current time is within ±4 minutes of the scheduled time
//         const currentTime = new Date();
//         const currentHours = currentTime.getHours();
//         const currentMinutes = currentTime.getMinutes();
        
//         // Convert current time to format "HH:MM"
//         const formattedCurrentTime = `${String(currentHours).padStart(2, '0')}:${String(currentMinutes).padStart(2, '0')}`;
        
//         // Get scheduled time from logData
//         const scheduledTime = logData.scheduledReportDetails.scheduleTime; // Format: "06:45"
        
//         // Parse both times to calculate the difference in minutes
//         const [schedHours, schedMinutes] = scheduledTime.split(':').map(Number);
//         const [currHours, currMinutes] = formattedCurrentTime.split(':').map(Number);
        
//         // Convert both times to minutes since midnight
//         const scheduledTotalMinutes = schedHours * 60 + schedMinutes;
//         const currentTotalMinutes = currHours * 60 + currMinutes;
        
//         // Calculate absolute difference in minutes
//         const timeDifference = Math.abs(scheduledTotalMinutes - currentTotalMinutes);
        
//         // Check if time difference is within the 4-minute window
//         if (timeDifference <= 4) {
//           // Time is within the acceptable range, proceed with the existing logic
//           const lastEntry = logData.pausedAndResumedPeriods?.[logData.pausedAndResumedPeriods.length - 1];
//           const pausedByUserObj = await findOne(User, { _id: lastEntry.pausedBy }, { _id: 0, name: 1 });
          
          
//           const constructedData = await constructPauseLogTemplateData(
//             approvername, 
//             logData.name, 
//             pausedByUserObj.name, 
//             new Date(lastEntry.pausedDate).toISOString(), 
//             "is currently"
//           );
          
//           let approverObj = await findOne(User, { _id: approver }, { _id: 0, name: 1, email: 1 });
//           const emailNotificationRecipients = logData.emailNotificationRecipients;
//           const ccEmailNotificationRecipients = [];
          
//           if (emailNotificationRecipients && emailNotificationRecipients.length > 0) {
//             for (let i = 0; i < emailNotificationRecipients.length; i++) {
//               let emailNotificationRecipientsUserObj = await findOne(
//                 User, 
//                 { _id: emailNotificationRecipients[i] }, 
//                 { _id: 0, name: 1, email: 1 }
//               );
              
//               if (emailNotificationRecipientsUserObj) {
//                 ccEmailNotificationRecipients.push(emailNotificationRecipientsUserObj.email);
//               }
//             }
//           }
          
//           constructedData.cc = ccEmailNotificationRecipients;
//           await sendPauseLogEmail([approverObj.email], `Log Paused ${logData.name}`, constructedData);
//         }
//       }
//     }
//   } catch (err) {
//     console.log("err", err);
//     throw err;
//   }
// };

// const findRange = async (
//   start,
//   end,
//   createdBy,
//   logId,
//   scheduleTime,
//   timePeriod,
//   frequency,
//   currentDate,
//   returnObj
// ) => {
//   if (returnObj&& returnObj.fetchedLogEntries && returnObj.fetchedLogEntries.length > 0) {
//     return returnObj;
//   }
//   let lastreport;

//   if (!returnObj){    
//     lastreport = await findOneLastEntry(ReportModel, {
//     createdBy,
//     moduleEntityId: logId,
//     reportKind: "frequency"
//     });
//   }
//   else {
//     lastreport = {reportCreatedAt: returnObj.rangeEnd, reportNumber: returnObj.reportNumber};
//   }
//   let lastEntryDate;
//   let rangeStart;
//   let rangeEnd;
//   let reportNumber;
//   if (lastreport) {
//     if(!returnObj) lastEntryDate = convertDateFormat(lastreport.reportCreatedAt);
//     else {lastEntryDate = (lastreport.reportCreatedAt)}
//     rangeStart = lastEntryDate;
   
//     rangeEnd = await calculateEndTime(
//       rangeStart,
//       scheduleTime,
//       timePeriod,
//       frequency
//     );
//     if(!returnObj) reportNumber = lastreport.reportNumber ? lastreport.reportNumber + 1 : 1;
//     else reportNumber = lastreport.reportNumber;
//   } else {
//     const [hours, minutes] = scheduleTime.split(":").map(Number);
//     rangeStart = start;
//     rangeEnd = currentDate.set({
//       hour: hours,
//       minute: minutes,
//       second: 0,
//       millisecond: 0,
//     });
//     reportNumber = lastreport?.reportNumber ?? 1;
//   }
//   const fetchedLogEntries = await findAll(LogEntryModel, {
//     $and: [
//       {
//         logId: logId,
//       },
//       {
//         status: {$in:["completed", "pendingForApproval"]},
//       },
//       { entryCreatedAt: { $lte: rangeEnd } },
//           { entryCreatedAt: { $gte: rangeStart } },
//     ],
//   });
// // console.log("rangeStart", rangeStart, rangeEnd)
//   returnObj = { rangeStart, rangeEnd, lastEntryDate, reportNumber, fetchedLogEntries };

//   if (rangeEnd > currentDate || rangeStart > currentDate) {
//     return { rangeStart, rangeEnd, lastEntryDate, reportNumber, fetchedLogEntries };
//   }
//   return await findRange (
//     start,
//     end,
//     createdBy,
//     logId,
//     scheduleTime,
//     timePeriod,
//     frequency,
//     currentDate,
//     returnObj
//   );
// };


// const generateReportForShift = async () => {
//   try {
//     const currentDate = DateTime.now();
//     const allLogs = await getAllLogsForReportGeneration();
//     for (let log of allLogs) {
//         const shifts = await getListOfShiftUsingBusinessUnit(log.businessUnit);
//         for (let shift of shifts) {
//           const [sHour, sMinute, sSecond] = shift.shiftHours.start
//             .split(":")
//             .map(Number);
//           const [eHour, eMinute, eSecond] = shift.shiftHours.end
//             .split(":")
//             .map(Number);

//           const shiftStart = currentDate.set({
//             hour: sHour,
//             minute: sMinute,
//             second: 0,
//             millisecond: 0,
//           });
//           const shiftEnd = currentDate.set({
//             hour: eHour,
//             minute: eMinute,
//             second: 0,
//             millisecond: 0,
//           });
//           const lastreport = await lastEntryReportDate(log._id, shiftStart);
//           let lastReportDate;
//           if(lastreport){
//             lastReportDate = lastreport.reportCreatedAt
//           }
//           if (
//             currentDate >= shiftStart &&
//             currentDate >= shiftEnd.plus({ hours: 1 }) &&
//              (!lastreport || lastReportDate < shiftEnd)
//           ) {
//             const entries = await getEntriesWithinRangeUsingLogId(
//               log._id,
//               shiftStart,
//               shiftEnd
//             );
//             if (entries.length > 0) {
//               const approver = await findOne(
//                 User,
//                 { _id: log.scheduledReportDetails.approver },
//                 { _id: 1, name: 1 }
//               );
//               const reportNumber = await getReportNumber(log._id);

//               await scheduleReportGeneration(
//                 log,
//                 entries,
//                 "logs",
//                 approver.name,
//                 shiftStart,
//                 shiftEnd,
//                 log.startDateAndTime,
//                 log.endDateAndTime,
//                 reportNumber,
//                 approver._id,
//                 "shift" // distinguish between shift vs frequency
//               );
//             }
//           }
//         }
//     }
//   } catch (error) {
//     throw error;
//   }
// };


// const calculateEndTime = async (
//   rangeStart,
//   scheduleTime,
//   timePeriod,
//   frequency
// ) => {
//   const [hours, minutes] = scheduleTime.split(":").map(Number);
//   let duration;
//   switch (timePeriod) {
//     case "day":
//       duration = Duration.fromObject({ days: frequency });
//       break;
//     case "week":
//       duration = Duration.fromObject({ weeks: frequency });
//       break;
//     case "month":
//       duration = Duration.fromObject({ months: frequency });
//       break;
//     default:
//       throw new Error("Invalid time period");
//   }
//   let nextInterval = rangeStart.plus(duration);
//   nextInterval = nextInterval.set({
//     hour: hours,
//     minute: minutes,
//     second: 0,
//     millisecond: 0,
//   });
//   return nextInterval;
// };

// module.exports = { schduledReportForLog, generateReportForShift };

// async function getListOfShiftUsingBusinessUnit(businessUnitId) {
//   const shifts = await findAll(Shift, {
//     businessUnit: businessUnitId,
//     isDeleted: false,
//   });
//   return shifts;
// }

// async function getEntriesWithinRangeUsingLogId(logId, startTime, endTime) {
//   const fetchedLogEntries = await findAll(LogEntryModel, {
//     $and: [
//       {
//         logId: logId,
//       },
//       {
//         status: { $in: ["completed", "pendingForApproval"] },
//       },
//       { entryCreatedAt: { $gte: startTime } },
//       { entryCreatedAt: { $lte: endTime } },
//     ],
//   });
//   return fetchedLogEntries;
// }

// async function getAllLogsForReportGeneration() {
//   const schduledReport = await findAll(
//     LogModel,
//     {
//       $and: [
//         {
//           $or: [{ status: "scheduled" }, { status: "workInProgress" }],
//         },
//         { isScheduleReport: true },
//         { isActive: true },
//       ],
//     },
//     {
//       _id: 1,
//       startDateAndTime: 1,
//       endDateAndTime: 1,
//       createdBy: 1,
//       assignees: 1,
//       departments: 1,
//       teams: 1,
//       isEntryStarted: 1,
//       name: 1,
//       scheduledReportDetails: 1,
//       assetId: 1,
//       description: 1,
//       documentNumber: 1,
//       businessUnit: 1,
//       emailNotificationRecipients: 1,
//       approvers: 1,
//       isPaused: 1,
//       pausedAndResumedPeriods: 1,
//     }
//   );
//   return schduledReport;
// }

// async function getReportNumber(logId) {
//   let reportNumber;
//   const lastreport = await findOneLastEntry(ReportModel, {
//     moduleEntityId: logId,
//     reportKind: "shift",
//   });
//   if(lastreport){
//     reportNumber = lastreport.reportNumber
//     ? lastreport.reportNumber + 1
//     : 1;
//   }
//   else{
//     reportNumber = 1;
//   }
//   return reportNumber;
// }

// async function lastEntryReportDate (logId, shiftStart){
//   let lastEntryDate;
//   const lastreport = await findOneLastEntry(ReportModel, {
//       moduleEntityId: logId,
//       reportKind: "shift",
//     });
//     if(lastreport){
//       lastEntryDate = lastreport.reportCreatedAt
//     }
//     else{
//       lastEntryDate = shiftStart
//     }
//     return lastreport;
// }