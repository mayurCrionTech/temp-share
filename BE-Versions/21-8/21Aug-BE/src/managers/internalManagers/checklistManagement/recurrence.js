const {
  ChecklistEntryModel,
} = require("../../../models/mongoDB/checklistManagement/checklistEntry_model");
const {
  ChecklistStructureModel,
} = require("../../../models/mongoDB/checklistManagement/checklistStructure_model");
const {
  ChecklistModel,
} = require("../../../models/mongoDB/checklistManagement/checklist_model");
const {
  TemplateModel,
} = require("../../../models/mongoDB/checklistManagement/template_model");
const {
  findAll,
  findOneLastEntry,
  updateOne,
  findOne,
  insertOne,
} = require("../../dBManagers/mongoDB_manager");
const { DateTime, Duration } = require("luxon");
const User = require("../../../models/mongoDB/userManagement/user_model");
const { sendViaUserID } = require("../../../utils/socket/socketHandler");
const {
  constructNotification,
} = require("../../common/DataObjectConstructor_manager");

const schduledCheklist = async () => {
  try {
    const indiaTimeZone = "Asia/Kolkata";
    const currentDate = DateTime.now().setZone(indiaTimeZone);
    const currentDatePlusOne = currentDate
      .plus({ hours: 6, minutes: 30 })
      .toISO();
    const currentDateMinusOne = currentDate
      .plus({ hours: 4, minutes: 30 })
      .toISO();
    const schduledChecklists = await findAll(
      ChecklistModel,
      {
        $and: [
          {
            $or: [{ status: "scheduled" }, { status: "workInProgress" }],
          },
          { startDateAndTime: { $lte: currentDatePlusOne } },
          { endDateAndTime: { $gte: currentDateMinusOne } },
          {
            isRecurrence: true,
          },
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
      }
    );
    if (schduledChecklists) {
      for (let i = 0; i < schduledChecklists.length; i++) {
        const {
          recurrenceDetails,
          startDateAndTime,
          endDateAndTime,
          createdBy,
          checklistId,
          userSpecificDetails,
          isEntryStarted,
          assignees,
          checklistName,
        } = createRecurrenceBody(schduledChecklists[i]);
        const formatedEndTime = endDateAndTime
          ? convertDateFormat(endDateAndTime)
          : null;
        const formatedStartTime = startDateAndTime
          ? convertDateFormat(startDateAndTime)
          : null;
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
            formatedStartTime,
            (entryNumber = 1),
            checklistId,
            assignees[0],
            engineer_Name,
            (engineerId = createdBy),
            checklistName,
            isEntryStarted
          );
        }
        if (
          currentDate < formatedEndTime &&
          recurrenceDetails !== null &&
          assignees.length > 0
        ) {
          await createEntry(
            recurrenceDetails,
            formatedStartTime,
            formatedEndTime,
            createdBy,
            checklistId,
            currentDate,
            currentDatePlusOne,
            userSpecificDetails,
            assignees,
            engineer_Name,
            (engineerId = createdBy),
            checklistName,
            isEntryStarted
          );
        } else if (currentDate > formatedEndTime) {
          const entries = await findAll(
            ChecklistEntryModel,
            {
              checklistId,
              status: { $ne: "completed" },
            },
            { _id: 1 }
          );
          if (entries.length === 0) {
            await updateOne(
              ChecklistModel,
              { _id: checklistId },
              { status: "pendingForApproval" }
            );
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
  const checklistId = data._id ? data._id : "";
  const userSpecificDetails = data.userSpecificDetails
    ? data.userSpecificDetails
    : [];
  const isEntryStarted = data.isEntryStarted ? data.isEntryStarted : false;
  const assignees = data.assignees ? data.assignees : [];
  const checklistName = data.name ? data.name : "";
  return {
    recurrenceDetails,
    startDateAndTime,
    endDateAndTime,
    createdBy,
    checklistId,
    userSpecificDetails,
    isEntryStarted,
    assignees,
    checklistName,
  };
};

const convertDateFormat = (date) => {
  if (date) {
    return DateTime.fromISO(date.toISOString().replace("Z", ""));
  }
  return null;
};

const createEntry = async (
  recurrenceDetails,
  startDateAndTime,
  endDateAndTime,
  createdBy,
  checklistId,
  currentDate,
  currentDatePlusOne,
  userSpecificDetails,
  assignees,
  engineerName,
  engineerId,
  checklistName,
  isEntryStarted
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
        checklistId
      );
      const entryTime = await calculateEntryTimes(
        rangeStart,
        rangeEnd,
        recurDetails,
        isEntryStarted
      );
      let nextEntryNum = entryNumber;
      let entryStatus = "overdue";
      if (entryTime.length > 0) {
        if (lastEntryId && lastEntryStatus === "scheduled") {
          await updateOne(
            ChecklistEntryModel,
            { _id: lastEntryId },
            { status: "overdue" }
          );
        }
        for (let i = 0; i < entryTime.length; i++) {
          if (i === entryTime.length - 1) {
            entryStatus = "scheduled";
          }
          const entryDay = entryTime[i].toFormat("cccc").toLowerCase();

          // if (userSpecificDetails.length > 0 && occurDays.includes(entryDay)) {
          //   const operatorId = await findOperator(
          //     userSpecificDetails,
          //     occurDays,
          //     entryTime[i]
          //   );
          //   if (operatorId !== null) {
          //     await generateEntry(
          //       entryTime[i],
          //       nextEntryNum,
          //       checklistId,
          //       operatorId,
          //       engineerName,
          //       engineerId,
          //       checklistName,
          //       isEntryStarted,
          //       entryStatus
          //     );
          //     nextEntryNum++;
          //   }
          // } else if (occurDays.includes(entryDay)) {
            if (occurDays.includes(entryDay)) {
            await generateEntry(
              entryTime[i],
              nextEntryNum,
              checklistId,
              assignees,
              engineerName,
              engineerId,
              checklistName,
              isEntryStarted,
              entryStatus
            );
            nextEntryNum++;
          }
        }
      }
    } else if (timePeriod === "month") {
      const specificDay = recurrenceDetails.specificDay
        ? recurrenceDetails.specificDay
        : {};
      const timeOfStart = startDateAndTime.toFormat("HH:mm");
      const [hour, minute] = timeOfStart.split(":");
      let entryStatus = "overdue";
      const lastEntry = await findOneLastEntry(ChecklistEntryModel, {
        createdBy,
        checklistId,
      });
      const lastEntryStatus = lastEntry ? lastEntry.status || "" : "";
      if (lastEntry && lastEntryStatus === "scheduled") {
        await updateOne(
          ChecklistEntryModel,
          { _id: lastEntry._id },
          { status: entryStatus }
        );
      }
      const entryCreatedAt = lastEntry ? lastEntry.entryCreatedAt || "" : "";
      const entryNumber = lastEntry ? lastEntry.entryNumber + 1 : 1;
      const currentDateOnly = currentDate.toFormat("dd/MM/yyyy");
      switch (specificDay.type) {
        case "monthlyDay":
          const nextMonthDate = await calculateEntryTimes(
            startDateAndTime,
            currentDatePlusOne,
            recurDetails
          );
          for (let i = 0; i < nextMonthDate.length; i++) {
            if (i === nextMonthDate.length - 1) {
              entryStatus = "scheduled";
            }
            const date = nextMonthDate[i];
            const timeOnly = +date.toFormat("HH:mm").split(":").join(".");
            if (
              userSpecificDetails.length > 0 &&
              entryCreatedAt !== date.toISO()
            ) {
              await assignOperatorToEntry(
                userSpecificDetails,
                timeOnly,
                date,
                entryNumber,
                checklistId
              );
            } else if (entryCreatedAt !== date.toISO()) {
              await generateEntry(
                date,
                entryNumber,
                checklistId,
                assignees[0],
                engineerName,
                engineerId,
                checklistName,
                isEntryStarted,
                entryStatus
              );
            }
          }
          break;
        case "monthlyWeekday":
          const weekDay = specificDay.weekDay
            ? specificDay.weekDay.toLowerCase()
            : "";
          const entryDate = getNthWeekdayOfCurrentMonth(
            weekDay,
            specificDay.occurrence
          );
          const exactEntryDateAndTime = entryDate.set({
            hour: hour,
            minute: minute,
            second: 0,
          });
          const exactDate = exactEntryDateAndTime.toFormat("dd/MM/yyyy");
          const timeOfEntry = exactEntryDateAndTime
            .toFormat("HH:mm")
            .split(":")
            .join(".");
          if (entryDate !== null) {
            if (
              exactDate == currentDateOnly &&
              userSpecificDetails.length > 0 &&
              entryCreatedAt !== exactEntryDateAndTime.toISO()
            ) {
              await assignOperatorToEntry(
                userSpecificDetails,
                timeOfEntry,
                exactEntryDateAndTime,
                entryNumber,
                checklistId
              );
            } else if (entryCreatedAt !== exactEntryDateAndTime.toISO()) {
              await generateEntry(
                exactEntryDateAndTime,
                entryNumber,
                checklistId,
                assignees[0],
                engineerName,
                engineerId,
                checklistName,
                isEntryStarted,
                entryStatus
              );
            }
          }
          break;
        case "specificDate":
          const date = DateTime.fromFormat(specificDay.date, "dd/MM/yyyy", {
            zone: "Asia/Calcutta",
          });
          const specificEntryDateAndTime = date.set({
            hour: hour,
            minute: minute,
            second: 0,
          });
          const specificDate = specificEntryDateAndTime.toFormat("dd/MM/yyyy");
          const entryTime = specificEntryDateAndTime
            .toFormat("HH:mm")
            .split(":")
            .join(".");
          if (
            specificDate === currentDateOnly &&
            entryCreatedAt !== specificEntryDateAndTime.toISO()
          ) {
            if (userSpecificDetails.length > 0) {
              await assignOperatorToEntry(
                userSpecificDetails,
                entryTime,
                specificEntryDateAndTime,
                entryNumber,
                checklistId
              );
            } else if (entryCreatedAt !== specificEntryDateAndTime.toISO()) {
              await generateEntry(
                specificEntryDateAndTime,
                entryNumber,
                checklistId,
                assignees[0],
                engineerName,
                engineerId,
                checklistName,
                isEntryStarted,
                entryStatus
              );
            }
          }
          break;
        default:
          console.error(`Unknown type: ${specificDay.type}`);
      }
    } else if (timePeriod === "year") {
      let entryStatus = "overdue";
      const startYear = startDateAndTime.year;
      const time = +startDateAndTime.toFormat("HH:mm").split(":").join(".");
      const lastEntry = await findOneLastEntry(ChecklistEntryModel, {
        createdBy,
        checklistId,
      });
      const entryNumber = lastEntry ? lastEntry.entryNumber + 1 : 1;
      if (lastEntry) {
        await updateOne(
          ChecklistEntryModel,
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
          //             checklistId,
          //             operatorId,
          //             engineerName,
          //             engineerId,
          //             checklistName,
          //             isEntryStarted,
          //             entryStatus
          //           );
          //         }
          //       }
          //     }
          //   }
          // } else {
            await generateEntry(
              date,
              entryNumber,
              checklistId,
              assignees[0],
              engineerName,
              engineerId,
              checklistName,
              isEntryStarted,
              entryStatus
            );
          // }
        }
      } else {
        if (userSpecificDetails.length > 0) {
          for (let i = 0; i < userSpecificDetails.length; i++) {
            const { operatorId, userRecurrenceDetails } =
              userSpecificDetails[i];
            for (let j = 0; j < userRecurrenceDetails.length; j++) {
              const { specificYear, shiftTiming } = userRecurrenceDetails[j];
              if (yearDiff === +specificYear) {
                const shiftTimeStart = +shiftTiming.from.replace(":", ".");
                const shiftTimeEnd = +shiftTiming.to.replace(":", ".");
                if (time >= shiftTimeStart && time <= shiftTimeEnd) {
                  await generateEntry(
                    entryTime,
                    entryNumber,
                    checklistId,
                    operatorId,
                    engineerName,
                    engineerId,
                    checklistName,
                    isEntryStarted,
                    entryStatus
                  );
                }
              }
            }
          }
        } else {
          await generateEntry(
            date,
            entryNumber,
            checklistId,
            assignees,
            engineerName,
            engineerId,
            checklistName,
            isEntryStarted,
            entryStatus
          );
        }
      }
    }
  } catch (err) {
    throw err;
  }
};

const findRange = async (start, end, currentDate, createdBy, checklistId) => {
  try {
    const lastEntry = await findOneLastEntry(ChecklistEntryModel, {
      createdBy,
      checklistId,
    });
    const entryNumber = lastEntry ? lastEntry.entryNumber + 1 : 1;
    const lastEntryId = lastEntry ? lastEntry._id : "";
    const lastEntryStatus = lastEntry ? lastEntry.status : "";
    let rangeStart;
    let rangeEnd;
    let lastEntryDate;
    if (lastEntry) {
      lastEntryDate = convertDateFormat(lastEntry.entryCreatedAt);
      rangeStart = lastEntryDate;
    } else {
      rangeStart = start;
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
  isEntryStarted
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
  while (nextInterval <= rangeEnd) {
    intervals.push(nextInterval);
    nextInterval = nextInterval.plus(duration);
  }
  return intervals;
};

const findOperator = async (
  userSpecificDetails,
  recurrOccurDays,
  entryTime
) => {
  try {
    const shiftMap = new Map();
    const timeOnly = +entryTime.toFormat("HH:mm").split(":").join(".");
    if (userSpecificDetails) {
      for (let i = 0; i < userSpecificDetails.length; i++) {
        const operatorId = userSpecificDetails[i].operatorId
          ? userSpecificDetails[i].operatorId
          : null;
        const userRecurrenceDetails = userSpecificDetails[i]
          .userRecurrenceDetails
          ? userSpecificDetails[i].userRecurrenceDetails
          : [];
        for (let j = 0; j < userRecurrenceDetails.length; j++) {
          const { occurDays, shiftTiming } = userRecurrenceDetails[j];
          const shiftTimeStart = +shiftTiming.from.replace(":", ".");
          const shiftTimeEnd = +shiftTiming.to.replace(":", ".");
          for (let k = 0; k < occurDays.length; k++) {
            const day = occurDays[k];
            if (!shiftMap.has(day)) {
              shiftMap.set(day, []);
            }
            shiftMap
              .get(day)
              .push({ shiftTimeStart, shiftTimeEnd, operatorId });
          }
        }
      }
      for (const [day, shifts] of shiftMap) {
        shifts.sort((a, b) => a.shiftTimeStart - b.shiftTimeStart);
      }
      for (let i = 0; i < recurrOccurDays.length; i++) {
        const day = recurrOccurDays[i];
        if (shiftMap.has(day)) {
          const shifts = shiftMap.get(day);
          const operatorId = binarySearch(shifts, timeOnly);
          if (operatorId) {
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
  checklistId
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
          checklistId,
          operatorId,
          engineerName,
          engineerId,
          checklistName
        );
      }
    }
  }
};

const generateEntry = async (
  entryTime,
  entryNumber,
  checklistId,
  operatorIds,
  engineerName,
  engineerId,
  checklistName,
  isEntryStarted,
  entryStatus
) => {
  try {
    if (!isEntryStarted) {
      await updateOne(
        ChecklistModel,
        { _id: checklistId },
        { status: "workInProgress", isEntryStarted: true }
      );
    }
    let entry;
    if (checklistId && entryTime) {
      entry = await findOne(
        ChecklistEntryModel,
        {
          checklistId,
          entryCreatedAt: entryTime.plus({ hours: 5, minutes: 30 }),
        },
        {}
      );
    }
    if (!entry) {
      const checklistStructure = await findOne(
        ChecklistStructureModel,
        { checklistId, isActive: true },
        {}
      );
      if (checklistStructure) {
        const templateId = checklistStructure.templateId
          ? checklistStructure.templateId
          : "";
        if (templateId) {
          const template = await findOne(
            TemplateModel,
            { _id: templateId },
            { dataSets: 1 }
          );
          const checklistIdString = checklistId.toString();
          if (template !== null) {
            const insertData = {
              checklistId: checklistIdString,
              data: template ? template.dataSets || null : null,
              createdBy: checklistStructure
                ? checklistStructure.createdBy
                : null,
              entryCreatedAt: entryTime.plus({ hours: 5, minutes: 30 }),
              entryNumber,
              operatorIds,
              status: entryStatus,
              templateId,
            };
            await insertOne(ChecklistEntryModel, { ...insertData });
            for(let operatorId of operatorIds){
              const notificationBody = await constructNotification(
                "scheduled",
                `is scheduled by ${engineerName} at ${entryTime}`,
                {
                  id: checklistId,
                  name: checklistName,
                },
                "checklists",
                engineerId
              );
              await sendViaUserID("notification", operatorId, notificationBody);
            }
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

module.exports = { schduledCheklist };
