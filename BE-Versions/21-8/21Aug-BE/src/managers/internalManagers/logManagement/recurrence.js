const { DateTime, Duration } = require("luxon");
const User = require("../../../models/mongoDB/userManagement/user_model");
const { sendViaUserID } = require("../../../utils/socket/socketHandler");
const {
  constructNotification,
} = require("../../common/DataObjectConstructor_manager");
const { LogModel } = require("../../../models/mongoDB/logManagement/log_model");
const {
  LogEntryModel,
} = require("../../../models/mongoDB/logManagement/logEntry_model");
const {
  LogStructureModel,
} = require("../../../models/mongoDB/logManagement/logStructure_model");
const {
  findAll,
  findOne,
  updateOne,
  findOneLastEntry,
  insertOne,
} = require("../../dBManagers/mongoDB_manager");
const {
  LogTemplateModel,
} = require("../../../models/mongoDB/logManagement/template_model");
const { getAllUsers } = require("../userManagement/user_manager");

const createLogentries = async () => {
  try {
    const currentDate = DateTime.now();
    const currentDatePlusOne = currentDate.plus({ hours: 1, minutes: 0 });
    const currentDateMinusOne = currentDate.minus({ hours: 1, minutes: 0 });
    const schduledLogs = await findAll(
      LogModel,
      {
        $and: [
          {
            $or: [{ status: "scheduled" }, { status: "workInProgress" }],
          },
          { startDateAndTime: { $lte: currentDatePlusOne } },
          { endDateAndTime: { $gte: currentDateMinusOne } },
          { isActive: true },
        ],
      },
      {
        _id: 1,
        startDateAndTime: 1,
        endDateAndTime: 1,
        recurrenceDetails: 1,
        createdBy: 1,
        userSpecificDetails: 1,
        assignees: 1,
        isEntryStarted: 1,
        name: 1,
        assetId: 1,
        isUserCustomization: 1,
        businessUnit: 1,
        approvers:1,
        pausedAndResumedPeriods:1,
      }
    );
    // console.log("schduledLogs:", schduledLogs.length);
    // if (schduledLogs) {// commented line for CPU utilisation
    if (schduledLogs && schduledLogs.length > 0) {
          // Batch-fetch all unique createdBy users in a single query to eliminate N+1
          const uniqueCreatorIds = [...new Set(schduledLogs.map(l => l.createdBy?.toString()).filter(Boolean))];
          const creators = await User.find(
            { _id: { $in: uniqueCreatorIds } },
            { _id: 1, name: 1 }
          ).lean();
          const creatorNameMap = new Map(creators.map(u => [u._id.toString(), u.name || "unknown"]));

      for (let i = 0; i < schduledLogs.length; i++) {
        const {
          recurrenceDetails,
          startDateAndTime,
          endDateAndTime,
          createdBy,
          logId,
          userSpecificDetails,
          isEntryStarted,
          assignees,
          logName,
          assetId,
          isUserCustomization,
          businessUnit,
          approvers,
          pausedAndResumedPeriods,
        } = createRecurrenceBody(schduledLogs[i]);
        if (!businessUnit) continue;
        // commented below lines for CPU utilisation
        // const engineerName = await findOne(
        //   User,
        //   { _id: createdBy },
        //   { _id: 0, name: 1 }
        // );
        // const engineer_Name = engineerName
        //   ? engineerName.name || "unknown"
        //   : "unknown";
        const engineer_Name = creatorNameMap.get(createdBy?.toString()) || "unknown";
        if (
          recurrenceDetails === null &&
          assignees.length > 0 &&
          !isEntryStarted
        ) {
          generateEntry(
            convertDateFormat(startDateAndTime),
            (entryNumber = 1),
            logId,
            assignees,
            engineer_Name,
            (engineerId = createdBy),
            logName,
            isEntryStarted,
            "scheduled",
            {},
            assetId,
            assignees,
            businessUnit,
            approvers,
          );
          await updateOne(LogModel, { _id: logId }, { isActive: true });
        }
        if (
          currentDate < endDateAndTime &&
          recurrenceDetails !== null &&
          assignees.length > 0
        ) {
          await createEntry(
            recurrenceDetails,
            startDateAndTime,
            endDateAndTime,
            createdBy,
            logId,
            currentDate,
            currentDatePlusOne,
            userSpecificDetails,
            assignees,
            engineer_Name,
            (engineerId = createdBy),
            logName,
            isEntryStarted,
            assetId,
            isUserCustomization,
            businessUnit,
            approvers,
            pausedAndResumedPeriods,
          );
        } else if (currentDate > endDateAndTime) {
          const entries = await findAll(
            LogEntryModel,
            {
              logId,
              status: { $ne: "completed" },
            },
            { _id: 1 }
          );
          if (entries.length === 0) {
            await updateOne(
              LogModel,
              { _id: logId },
              { status: "completed", isActive: true }
            );
          }
        }
      }
    }
  } catch (err) {
    throw err;
  }
};
const createLogentriesForNonRecurrence = async (logId, assetId, assignee) => {
  try {
    const currentDate = DateTime.now();
    const lastEntry = await findOneLastEntry(LogEntryModel, { logId, operatorIds:{$in: [assignee] }});
    const currentMinute = currentDate.toFormat('yyyy-LL-dd HH:mm'); // Minute-level precision

    // Check if the last entry was created in the same minute as the current time
    if (lastEntry) {
      const lastEntryMinute = DateTime.fromJSDate(lastEntry.entryCreatedAt).toFormat('yyyy-LL-dd HH:mm');
      if (lastEntryMinute === currentMinute) {
        console.log("Skipping entry creation as one already exists for this minute.");
        return; // Skip this creation as an entry already exists for this minute
      }
    }

    const currentDatePlusOne = currentDate.plus({ hours: 1, minutes: 0 });
    let schduledLogs 
    if (logId) {
      schduledLogs = await findAll(
        LogModel,
        {
          $and: [
            { _id: logId },
            {
              $or: [{ status: "scheduled" }, { status: "workInProgress" }],
            },
            { endDateAndTime: { $gte: currentDate } },
            { isActive: true },
            { isRecurrence: false },
            { assignees: { $elemMatch: { $eq: assignee } } }
            
          ],
        },
        {
          _id: 1,
          startDateAndTime: 1,
          endDateAndTime: 1,
          recurrenceDetails: 1,
          createdBy: 1,
          userSpecificDetails: 1,
          assignees: 1,
          isEntryStarted: 1,
          name: 1,
          assetId: 1,
          businessUnit: 1,
          approvers:1,
        }
      );
    }
      else if (assetId) {
      schduledLogs = await findAll(
        LogModel,
        {
          $and: [
            { assetId },
            {
              $or: [{ status: "scheduled" }, { status: "workInProgress" }],
            },
            { assignees: { $elemMatch: { $eq: assignee } } },
            { endDateAndTime: { $gte: currentDate } },
            { isActive: true },
            { isRecurrence: false }
          ],
        },
        {
          _id: 1,
          startDateAndTime: 1,
          endDateAndTime: 1,
          recurrenceDetails: 1,
          createdBy: 1,
          userSpecificDetails: 1,
          assignees: 1,
          isEntryStarted: 1,
          name: 1,
          assetId: 1,
          businessUnit: 1,
          approvers:1,
        }
      );
    }  

    if (schduledLogs) {
      for (let i = 0; i < schduledLogs.length; i++) {
        const {
          recurrenceDetails,
          startDateAndTime,
          endDateAndTime,
          createdBy,
          logId,
          userSpecificDetails,
          isEntryStarted,
          assignees,
          logName,
          assetId,
          businessUnit,
          approvers
        } = createRecurrenceBody(schduledLogs[i]);
        if (!businessUnit) continue;
        const engineerName = await findOne(
          User,
          { _id: createdBy },
          { _id: 0, name: 1 }
        );
        const engineer_Name = engineerName
          ? engineerName.name || "unknown"
          : "unknown";
        if (
          recurrenceDetails === null &&
          assignees.length > 0 &&
          !isEntryStarted
        ) {
          generateEntry(
            convertDateFormat(startDateAndTime),
            (entryNumber = 1),
            logId,
            assignees,
            engineer_Name,
            (engineerId = createdBy),
            logName,
            isEntryStarted,
            "scheduled",
            {},
            assetId,
            assignees,
            businessUnit,
            approvers,
          );
          await updateOne(LogModel, { _id: logId }, { isActive: true });
        }
        if (
          currentDate < endDateAndTime &&
          recurrenceDetails !== null &&
          assignees.length > 0
        ) {
          await createEntry(
            recurrenceDetails,
            startDateAndTime,
            endDateAndTime,
            createdBy,
            logId,
            currentDate,
            currentDatePlusOne,
            userSpecificDetails,
            assignees,
            engineer_Name,
            (engineerId = createdBy),
            logName,
            isEntryStarted,
            assetId,
            businessUnit,
            approvers,
          );
        }
        
        else if (
          currentDate < endDateAndTime &&
          recurrenceDetails == null &&
          assignees.length > 0
        ) {
          const {
            rangeStart,
            rangeEnd,
            entryNumber,
            lastEntryId,
            lastEntryStatus,
          } = await findRange(
            startDateAndTime,
            endDateAndTime,
            currentDate,
            createdBy,
            logId
            );

          
          await generateEntry(
            currentDate,
            entryNumber,
            logId,
            assignees,
            engineer_Name,
            (engineerId = createdBy),
            logName,
            isEntryStarted,
            "scheduled",
            {},
            assetId,
            assignees,
            businessUnit,
            approvers,
          );
        }
        else if (currentDate > endDateAndTime) {
          const entries = await findAll(
            LogEntryModel,
            {
              logId,
              status: { $ne: "completed" },
            },
            { _id: 1 }
          );
          if (entries.length === 0) {
            await updateOne(
              LogModel,
              { _id: logId },
              { status: "completed", isActive: true }
            );
          } else {
            await updateOne(LogModel, { _id: logId }, { isActive: false });
          }
        }
      }
    }
  } catch (err) {
    throw err;
  }
};

const createRecurrenceBody = (data) => {
  const recurrenceDetails = data.recurrenceDetails
    ? data.recurrenceDetails
    : null;
  const startDateAndTime = data.startDateAndTime ? data.startDateAndTime : "";
  const endDateAndTime = data.endDateAndTime ? data.endDateAndTime : "";
  const createdBy = data.createdBy ? data.createdBy : "";
  const logId = data._id ? data._id : "";
  const userSpecificDetails = data.userSpecificDetails
    ? data.userSpecificDetails
    : [];
  const isEntryStarted = data.isEntryStarted ? data.isEntryStarted : false;
  const assignees = data.assignees ? data.assignees : [];
  const logName = data.name ? data.name : "";
  const assetId = data.assetId ? data.assetId : "";
  const isUserCustomization = data.isUserCustomization
    ? data.isUserCustomization
    : false;
  const businessUnit = data.businessUnit ? data.businessUnit : "";
  const approvers = data.approvers ? data.approvers : [];
  const pausedAndResumedPeriods = data.pausedAndResumedPeriods ? data.pausedAndResumedPeriods : null;
  return {
    recurrenceDetails,
    startDateAndTime,
    endDateAndTime,
    createdBy,
    logId,
    userSpecificDetails,
    isEntryStarted,
    assignees,
    logName,
    assetId,
    isUserCustomization,
    businessUnit,
    approvers,
    pausedAndResumedPeriods,
  };
};

const convertDateFormat = (date) => {
  if (date) {
    return DateTime.fromJSDate(date);
  }
  return null;
};

const createEntry = async (
  recurrenceDetails,
  startDateAndTime,
  endDateAndTime,
  createdBy,
  logId,
  currentDate,
  currentDatePlusOne,
  userSpecificDetails,
  assignees,
  engineerName,
  engineerId,
  logName,
  isEntryStarted,
  assetId,
  isUserCustomization,
  businessUnit,
  approvers,
  pausedAndResumedPeriods = null,
) => {
  try {
    const timePeriod = recurrenceDetails.timePeriod
      ? recurrenceDetails.timePeriod
      : "hour";
    let recurDetails = {};
    recurDetails["frequency"] = recurrenceDetails.frequency
      ? recurrenceDetails.frequency
      : 1;
    recurDetails["timePeriod"] = timePeriod;
    // let getAssignessWithShift;
    // if (isUserCustomization)
    //   getAssignessWithShift = await getAssigneesShift(assignees);
    if (
      timePeriod === "hour" ||
      timePeriod === "day" ||
      timePeriod === "week"
    ) {
      const recurrOn = recurrenceDetails.recurrOn
        ? recurrenceDetails.recurrOn
        : "allDays";
      recurDetails["recurrOn"] = recurrOn;
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
      } else if (recurrOn === "custom") {
        occurDays = recurrenceDetails.occurDays
          ? recurrenceDetails.occurDays
          : [];
      }
      const {
        rangeStart,
        rangeEnd,
        entryNumber,
        lastEntryId,
        lastEntryStatus,
      } = await findRange(
        startDateAndTime,
        endDateAndTime,
        currentDate,
        createdBy,
        logId
      );
      const entryTime = await calculateEntryTimes(
        rangeStart,
        rangeEnd,
        recurDetails,
        isEntryStarted,
        pausedAndResumedPeriods,
      );
      let nextEntryNum = entryNumber;
      let entryStatus = "overdue";
      if (entryTime.length > 0) {
        if (lastEntryId && lastEntryStatus === "scheduled") {
          await updateOne(
            LogEntryModel,
            { _id: lastEntryId },
            { status: "overdue" }
          );
        }
        for (let i = 0; i < entryTime.length; i++) {
          if (i === entryTime.length - 1) {
            entryStatus = "scheduled";
          }
          const entryDay = entryTime[i].toFormat("cccc").toLowerCase();
          // if (isUserCustomization && occurDays.includes(entryDay)) {
          //   const operatorId = await findOperator(
          //     getAssignessWithShift,
          //     entryTime[i]
          //   );
          //   if (operatorId !== null) {
          //     await generateEntry(
          //       entryTime[i],
          //       nextEntryNum,
          //       logId,
          //       operatorId,
          //       engineerName,
          //       engineerId,
          //       logName,
          //       isEntryStarted,
          //       entryStatus,
          //       recurDetails,
          //       assetId,
          //       assignees,
          //       businessUnit
          //     );
          //     nextEntryNum++;
          //   } else {
          //     await generateEntry(
          //       entryTime[i],
          //       nextEntryNum,
          //       logId,
          //       assignees,
          //       engineerName,
          //       engineerId,
          //       logName,
          //       isEntryStarted,
          //       entryStatus,
          //       recurDetails,
          //       assetId,
          //       assignees,
          //       businessUnit
          //     );
          //   }
          // } else if (!isUserCustomization && occurDays.includes(entryDay)) {
          //   await generateEntry(
          //     entryTime[i],
          //     nextEntryNum,
          //     logId,
          //     assignees,
          //     engineerName,
          //     engineerId,
          //     logName,
          //     isEntryStarted,
          //     entryStatus,
          //     recurDetails,
          //     assetId,
          //     assignees,
          //     businessUnit
          //   );
          //   nextEntryNum++;
          // }
          if(occurDays.includes(entryDay)){
          await generateEntry(
            entryTime[i],
            nextEntryNum,
            logId,
            assignees,
            engineerName,
            engineerId,
            logName,
            isEntryStarted,
            entryStatus,
            recurDetails,
            assetId,
            assignees,
            businessUnit,
            approvers,
          );
          nextEntryNum++;
        }
        }
      }
    }

    else if (timePeriod === "month") {
      const specificDay = recurrenceDetails.specificDay || startDateAndTime;
      const frequency = recurrenceDetails.frequency || 1;
      let entryStatus = "overdue";
      const lastEntry = await findOneLastEntry(LogEntryModel, {
        createdBy,
        logId,
      });
    
      const lastEntryStatus = lastEntry?.status || "";
    
      if (lastEntry && lastEntryStatus === "scheduled") {
        await updateOne(
          LogEntryModel,
          { _id: lastEntry._id },
          { status: entryStatus }
        );
      }
      let entryNumber = lastEntry ? lastEntry.entryNumber + 1 : 1;
      // Always start from startDateAndTime
      let nextMonth = convertDateFormat(new Date(startDateAndTime));
      const now = convertDateFormat(new Date());
    
      while (nextMonth <= now) {
        await generateEntry(
          nextMonth,
          entryNumber,
          logId,
          assignees,
          engineerName,
          engineerId,
          logName,
          isEntryStarted,
          entryStatus,
          recurrenceDetails,
          assetId,
          assignees,
          businessUnit,
          approvers
        );
        nextMonth = nextMonth.plus({ months: frequency });
        entryNumber++;
      }
    }
     
    else if (timePeriod === "year") {
      let entryStatus = "overdue";
      const startYear = startDateAndTime.year;
      const time = +startDateAndTime.toFormat("HH:mm").split(":").join(".");
      const lastEntry = await findOneLastEntry(LogEntryModel, {
        createdBy,
        logId,
      });
      const entryNumber = lastEntry ? lastEntry.entryNumber + 1 : 1;
      if (lastEntry) {
        await updateOne(
          LogEntryModel,
          { _id: lastEntry._id },
          { status: entryStatus }
        );
        const lastEntryCreated = convertDateFormat(lastEntry.entryCreatedAt);
        const lastEntryYear = lastEntryCreated.year;
        if (startYear != lastEntryYear) {
          const entryTime = lastEntryCreated.plus({
            years: recurDetails.frequency,
          });
          const entryYear = entryTime.year;
          let yearDiff = entryYear - startYear;
          // if (userSpecificDetails.length > 0) {
          //   for (let i = 0; i < userSpecificDetails.length; i++) {
          //     const { operatorId, userRecurrenceDetails } =
          //       userSpecificDetails[i];
          //     for (let j = 0; j < userRecurrenceDetails.length; j++) {
          //       const { specificYear, shiftTiming } = userRecurrenceDetails[j];
          //       if (yearDiff === +specificYear) {
          //         const shiftTimeStart = +shiftTiming.from.replace(":", ".");
          //         const shiftTimeEnd = +shiftTiming.to.replace(":", ".");
          //         if (time >= shiftTimeStart && time <= shiftTimeEnd) {
          //           await generateEntry(
          //             entryTime,
          //             entryNumber,
          //             logId,
          //             operatorId,
          //             engineerName,
          //             engineerId,
          //             logName,
          //             isEntryStarted,
          //             entryStatus,
          //             {},
          //             assetId,
          //             assignees,
          //             businessUnit
          //           );
          //         }
          //       }
          //     }
          //   }
          // } 
          // else {
            await generateEntry(
              date,
              entryNumber,
              logId,
              assignees,
              engineerName,
              engineerId,
              logName,
              isEntryStarted,
              entryStatus,
              {},
              assetId,
              assignees,
              businessUnit,
              approvers,
            );
          // }
        }
      } else {
        const entryTime = startDateAndTime;
        // if (userSpecificDetails.length > 0) {
        //   for (let i = 0; i < userSpecificDetails.length; i++) {
        //     const { operatorId, userRecurrenceDetails } =
        //       userSpecificDetails[i];
        //     for (let j = 0; j < userRecurrenceDetails.length; j++) {
        //       const { specificYear, shiftTiming } = userRecurrenceDetails[j];
        //       if (yearDiff === +specificYear) {
        //         const shiftTimeStart = +shiftTiming.from.replace(":", ".");
        //         const shiftTimeEnd = +shiftTiming.to.replace(":", ".");
        //         if (time >= shiftTimeStart && time <= shiftTimeEnd) {
        //           await generateEntry(
        //             convertDateFormat(entryTime),
        //             entryNumber,
        //             logId,
        //             operatorId,
        //             engineerName,
        //             engineerId,
        //             logName,
        //             isEntryStarted,
        //             entryStatus,
        //             {},
        //             assetId,
        //             assignees,
        //             businessUnit
        //           );
        //         }
        //       }
        //     }
        //   }
        // } else {
          await generateEntry(
            convertDateFormat(entryTime),
            entryNumber,
            logId,
            assignees,
            engineerName,
            engineerId,
            logName,
            isEntryStarted,
            entryStatus,
            {},
            assetId,
            assignees,
            businessUnit,
            approvers,
          );
        // }
      }
    }
  } catch (err) {
    throw err;
  }
};

const findRange = async (start, end, currentDate, createdBy, logId) => {
  try {
    const startDate = convertDateFormat(start);
    const endDate = convertDateFormat(end);
    const lastEntry = await findOneLastEntry(LogEntryModel, {
      createdBy,
      logId,
    });
    const entryNumber = lastEntry ? lastEntry.entryNumber + 1 : 1;
    const lastEntryId = lastEntry ? lastEntry._id : "";
    const lastEntryStatus = lastEntry ? lastEntry.status : "";
    let rangeStart;
    let rangeEnd;
    let lastEntryDate;
    if (lastEntry) {
      lastEntryDate = lastEntry.entryCreatedAt;
      rangeStart = convertDateFormat(lastEntryDate);
    } else {
      rangeStart = startDate;
    }
    if (currentDate > end) {
      rangeEnd = endDate;
    } else {
      rangeEnd = currentDate;
    }
    return { rangeStart, rangeEnd, entryNumber, lastEntryId, lastEntryStatus };
  } catch (err) {
    throw err;
  }
};

const calculateEntryTimes = async (
  rangeStart,
  rangeEnd,
  recurDetails,
  isEntryStarted,
  pausedAndResumedPeriods,
) => {
  const frequency = recurDetails.frequency;
  const timePeriod = recurDetails.timePeriod;
  let duration;
  switch (timePeriod) {
    case "hour":
      duration = Duration.fromObject({ hours: frequency });
      break;
    case "day":
      duration = Duration.fromObject({ days: frequency });
      break;
    case "week":
      duration = Duration.fromObject({ weeks: frequency });
      break;
    case "month":
      duration = Duration.fromObject({ months: frequency });
      break;
    case "year":
      duration = Duration.fromObject({ years: frequency });
      break;
    default:
      throw new Error("Invalid time period");
  }
  let intervals = [];
  if (!isEntryStarted) {
    intervals.push(rangeStart);
  }
  let nextInterval = rangeStart.plus(duration);
  const isWithinPausePeriod = (date) => {
    for (const { pausedDate, resumedDate } of pausedAndResumedPeriods) {
      const pauseStart = convertDateFormat(pausedDate);
      const pauseEnd = resumedDate ? convertDateFormat(resumedDate) : null;
      if (pauseEnd) {
        if (date >= pauseStart && date <= pauseEnd) return true;
      } else {
        if (date >= pauseStart) return true;
      }
    }
    return false;
  };

  while (nextInterval <= rangeEnd) {
    if (!isWithinPausePeriod(nextInterval)) {
      intervals.push(nextInterval);
    }
    nextInterval = nextInterval.plus(duration);
  }
  return intervals;
};

const findOperator = async (userSpecificDetails, entryTime) => {
  try {
    const currentTimeInMinutes = timeToMinutes(entryTime.toFormat("HH:mm"));
    if (userSpecificDetails) {
      for (let i = 0; i < userSpecificDetails.length; i++) {
        const operatorId = userSpecificDetails[i].id
          ? userSpecificDetails[i].id
          : null;
        const shiftStartInMinutes = timeToMinutes(
          userSpecificDetails[i].shiftFrom
        );
        const shiftEndInMinutes = timeToMinutes(userSpecificDetails[i].shiftTo);
        if (shiftStartInMinutes < shiftEndInMinutes) {
          if (
            currentTimeInMinutes >= shiftStartInMinutes &&
            currentTimeInMinutes <= shiftEndInMinutes
          ) {
            return operatorId;
          }
        } else {
          if (
            currentTimeInMinutes >= shiftStartInMinutes ||
            currentTimeInMinutes <= shiftEndInMinutes
          ) {
            return operatorId;
          }
        }
      }
    }
    return null;
  } catch (err) {
    throw err;
  }
};

const timeToMinutes = (timeStr) => {
  const [hours, minutes] = timeStr.split(":").map(Number);
  return hours * 60 + minutes;
};

const binarySearch = (shifts, time) => {
  let left = 0,
    right = shifts.length - 1;
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (
      shifts[mid].shiftTimeStart <= time &&
      time <= shifts[mid].shiftTimeEnd
    ) {
      return shifts[mid].operatorId;
    } else if (time < shifts[mid].shiftTimeStart) {
      right = mid - 1;
    } else {
      left = mid + 1;
    }
  }
  return null;
};

const assignOperatorToEntry = async (
  userSpecificDetails,
  time,
  date,
  entryNumber,
  logId
) => {
  for (let i = 0; i < userSpecificDetails.length; i++) {
    const { operatorId, userRecurrenceDetails } = userSpecificDetails[i];
    for (let j = 0; j < userRecurrenceDetails.length; j++) {
      const { shiftTiming } = userRecurrenceDetails[j];
      const shiftTimeStart = +shiftTiming.from.replace(":", ".");
      const shiftTimeEnd = +shiftTiming.to.replace(":", ".");
      if (time >= shiftTimeStart && time <= shiftTimeEnd) {
        await generateEntry(
          date,
          entryNumber,
          logId,
          operatorId,
          engineerName,
          engineerId,
          logName
        );
      }
    }
  }
};

const generateEntry = async (
  entryTime,
  entryNumber,
  logId,
  operatorIds,
  engineerName,
  engineerId,
  logName,
  isEntryStarted,
  entryStatus,
  recurDetails = null,
  assetId,
  assignees = [],
  businessUnit,
  approvers,
) => {
  try {
    let endTime;
    if (
      recurDetails !== null &&
      entryTime &&
      recurDetails.timePeriod === "hour"
    ) {
      const freq = recurDetails.frequency ? recurDetails.frequency : 1;
      endTime = entryTime.plus({ hours: freq, minutes: 0 });
    } else {
      endTime = entryTime
        .plus({ days: 1 })
        .set({ hour: 2, minute: 0, second: 0, millisecond: 0 });
    }
    if (!isEntryStarted) {
      await updateOne(
        LogModel,
        { _id: logId },
        { status: "workInProgress", isEntryStarted: true }
      );
    }
    let entry;
    if (logId && entryTime) {
      entry = await findOne(
        LogEntryModel,
        {
          logId,
          entryCreatedAt: entryTime,
        },
        {}
      );
    }
    if (!entry) {
      const logStructure = await findOne(
        LogStructureModel,
        { logId, isActive: true },
        {}
      );
      if (logStructure) {
        const templateId = logStructure.templateId
          ? logStructure.templateId
          : "";
        if (templateId) {
          const template = await findOne(
            LogTemplateModel,
            { _id: templateId },
            { dataSets: 1 }
          );
          const logIdString = logId.toString();
          if (template !== null) {
            const modifiedDataSets = (template.dataSets || []).map((item) => {
              return {
                ...item,
                isFormula: item.formula ? true : false, // add isFormula only if formula exists
              };
            });
            const insertData = {
              logId: logIdString,
              data: modifiedDataSets,
              createdBy: logStructure ? logStructure.createdBy : null,
              entryCreatedAt: entryTime,
              entryNumber,
              operatorIds,
              status: entryStatus,
              templateId,
              endTime,
              assetId,
              businessUnit,
              approvers
            };
            const createdEntry=await insertOne(LogEntryModel, { ...insertData });
            const entryId = createdEntry._id; // added to navigate from notification
            const covertToIST = entryTime.plus({ hours: 5, minutes: 30 });
            const updateDate = covertToIST.toFormat("dd/MM/yyyy");
            const updateTime = covertToIST.toFormat("HH:mm");
            const updateEntryTime = `${updateDate} ${updateTime}`;
            const notificationArray = [];
            if (operatorIds.length > 0) {
              for (let i = 0; i < assignees.length; i++) {
                const notificationBody = constructNotification(
                  "scheduled",
                  `is scheduled by ${engineerName} at ${updateEntryTime}`,
                  {
                    id: entryId,
                    name: logName,
                  },
                  "logs",
                  engineerId,
                  businessUnit
                );
                const obj = { notificationBody, sender: assignees[i] };
                notificationArray.push(obj);
              }
              handleSendNotification(notificationArray);
            }
            //  else {
            //   const notificationBody = constructNotification(
            //     "scheduled",
            //     `is scheduled by ${engineerName} at ${updateEntryTime}`,
            //     {
            //       id: logId,
            //       name: logName,
            //     },
            //     "logs",
            //     engineerId
            //   );
            //   await sendViaUserID("notification", operatorId, notificationBody);
            // }
          }
        }
      }
    }
  } catch (err) {
    throw err;
  }
};

const getWeekdayNumber = (weekday) => {
  const weekdays = {
    monday: 1,
    tuesday: 2,
    wednesday: 3,
    thursday: 4,
    friday: 5,
    saturday: 6,
    sunday: 7,
  };
  return weekdays[weekday];
};

const getNthWeekdayOfCurrentMonth = (weekday, occurrence) => {
  const now = DateTime.local();
  const year = now.year;
  const month = now.month;
  const weekdayNumber = getWeekdayNumber(weekday);
  let dt = DateTime.local(year, month, 1);
  dt = dt.set({ weekday: weekdayNumber });
  dt = dt.plus({ weeks: occurrence - 1 });
  if (dt.month !== month) {
    return null;
  }
  return dt;
};

const getAssigneesShift = async (ids) => {
  try {
    let userIds = ids || [];
    const users = await getAllUsers(
      {},
      { ids: userIds, populateFields: "shift" }
    );
    const usersShift = users?.data ?? [];
    const shift = [];
    for (let i = 0; i < usersShift.length; i++) {
      obj = {
        id: usersShift[i].id ? usersShift[i].id.toString() : "",
        shiftName: usersShift[i].shift?.name ?? "Undefined",
        shiftFrom: usersShift[i].shift?.shiftHours?.start ?? "",
        shiftTo: usersShift[i].shift?.shiftHours?.end ?? "",
      };
      shift.push(obj);
    }
    return shift;
  } catch (error) {
    throw error;
  }
};

async function handleSendNotification(notificationsHasToSend) {
  const sendPromises = notificationsHasToSend.map(async (notification) => {
    try {
      await sendViaUserID(
        "notification",
        notification.sender,
        notification.notificationBody
      );
    } catch (error) {
      console.error(`Failed to send notification to user ${sender}:`, error);
    }
  });
  await Promise.all(sendPromises);
}

module.exports = { createLogentries, createLogentriesForNonRecurrence };
