const {
  MaintenancePlan,
} = require("../../../models/mongoDB/maintenanceManagement/maintenancePlan_model");
const{workOrders} = require("../../../models/mongoDB/maintenanceManagement/workOrder_model")
const { mongoDbManager } = require("../../dBManagers/index");
const { DateTime, Duration } = require("luxon");
const workOrderManager = require("./workOrder_manager");
const workOrderTaskManager = require("../../internalManagers/maintenanceManagement/workOrderTask_manager");
const fileManager = require("../../internalManagers/fileSystem/fileSystem_manager")
const assetHistory_manager = require("../assetManagement/assetHistory_manager");
const { AssetHistory } = require("../../../models/mongoDB/assetManagement/assetHistory_model");
const DataHandler = require("../../common/DataObjectConstructor_manager");

const createScheduledWorkOrder = async () => {
  try {
    await updateAssetHistoryForMaintenance()
    const currentDate = DateTime.now();
    const currentDatePlusOne = currentDate.plus({ hours: 1, minutes: 0 });
    const currentDateMinusOne = currentDate.minus({ hours: 1, minutes: 0 });
    const maintenanceDetails = await MaintenancePlan.find({
      $and: [
        { status: "scheduled" },
        { startAt: { $lte: currentDatePlusOne } },
        { endAt: { $gte: currentDateMinusOne } },
        { isDeleted: false },
      ],
    }).populate("tasks");

    for (let maintenanceDetail of maintenanceDetails) {
      if (
        maintenanceDetail.recurrenceDetails === null &&
        maintenanceDetail.isWorkOrderCreated === false
      ) {
        const entryTime = convertDateFormat(maintenanceDetail.startAt)
        const nextInterval = convertDateFormat(maintenanceDetail.endAt)
        await createWorkOrderForNonRecurrenceManintenance(maintenanceDetail, entryTime, nextInterval, maintenanceDetail.createdBy);
      } else if (
        currentDate < maintenanceDetail.endAt &&
        maintenanceDetail.recurrenceDetails !== null
      ) {
        const timePeriod = maintenanceDetail.recurrenceDetails.timePeriod
          ? maintenanceDetail.recurrenceDetails.timePeriod
          : "hour";
        let recurDetails = {};
        recurDetails["frequency"] = maintenanceDetail.recurrenceDetails.frequency
          ?maintenanceDetail.recurrenceDetails.frequency
          : 1;
        recurDetails["timePeriod"] = timePeriod;

        if (
          timePeriod === "hour" ||
          timePeriod === "day" ||
          timePeriod === "week"
        ) {
          const recurrOn = maintenanceDetail.recurrenceDetails.recurrOn
            ? maintenanceDetail.recurrenceDetails.recurrOn
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
            occurDays = [
              "monday",
              "tuesday",
              "wednesday",
              "thursday",
              "friday",
            ];
          } else if (recurrOn === "custom") {
            occurDays = maintenanceDetail.recurrenceDetails.occurDays
              ? maintenanceDetail.recurrenceDetails.occurDays
              : [];
          }
          const {
            rangeStart,
            rangeEnd,
          } = await findRange(
            maintenanceDetail.startAt,
            maintenanceDetail.endAt,
            currentDate,
            maintenanceDetail._id
          );
          const entryTimeObj = await calculateEntryTimes(
            rangeStart,
            rangeEnd,
            recurDetails,
            maintenanceDetail.isWorkOrderCreated
          );
          const entryTime = entryTimeObj.intervals
          const nextInterval = entryTimeObj.nextInterval
          if (entryTime.length > 0) {
            for (let i = 0; i < entryTime.length; i++) {
              const entryDay = entryTime[i].toFormat("cccc").toLowerCase();
              if (occurDays.includes(entryDay)) {
                  await createWorkOrderWithManintenanceDetails(maintenanceDetail, entryTime[i], nextInterval, maintenanceDetail.createdBy)
              }
            }
          }
        }else if (timePeriod === "month") {
          // const specificDate = maintenanceDetail.recurrenceDetails.specificDay
          //   ? maintenanceDetail.recurrenceDetails.specificDay
          //   : maintenanceDetail.startAt;
          // let specificDay = convertDateFormat(new Date(specificDate))
          // specificDay = specificDay.toFormat("cccc").toLowerCase();
            const {
              rangeStart,
              rangeEnd,
            } = await findRange(
              maintenanceDetail.startAt,
              maintenanceDetail.endAt,
              currentDate,
              maintenanceDetail._id
            );
            console.log("rangeEnd",rangeEnd)
            const entryTimeObj = await calculateEntryTimes(
              rangeStart,
              rangeEnd,
              recurDetails,
              maintenanceDetail.isWorkOrderCreated
            );
            const entryTime = entryTimeObj.intervals
            const nextInterval = entryTimeObj.nextInterval
            console.log("entryTime",entryTime)
            console.log("maintenanceDetail._id",maintenanceDetail.isWorkOrderCreated)
            if (entryTime.length > 0) {
              for (let i = 0; i < entryTime.length; i++) {
                // const entryDay = entryTime[i].toFormat("cccc").toLowerCase();
                // if (specificDay.includes(entryDay)) {
                    await createWorkOrderWithManintenanceDetails(maintenanceDetail, entryTime[i], nextInterval, maintenanceDetail.createdBy)
                // }
              }
            }
        }
      }
    }
  } catch (error) {
    throw error;
  }
};

const workOrderCreateObject = async (maintenanceDetail, entryTime, nextInterval) => {
  try {
    const obj = {
      name: await generateNumber(maintenanceDetail._id) + maintenanceDetail.name,
      description: maintenanceDetail.description,
      asset: maintenanceDetail.asset,
      departments: maintenanceDetail.departments,
      priority: maintenanceDetail.priority,
      startAt: entryTime || maintenanceDetail.startAt,
      endAt: nextInterval || maintenanceDetail.endAt,
      estimatedDays: maintenanceDetail.estimatedDays,
      estimatedHours: maintenanceDetail.estimatedHours,
      assignees: maintenanceDetail.assignees,
      existingTeams: maintenanceDetail.existingTeams,
      addToAssetHistory: maintenanceDetail.addToAssetHistory,
      localTeams: maintenanceDetail.localTeams,
      images: await updateFiles(maintenanceDetail, maintenanceDetail.createdBy, "images"),
      documents: await updateFiles(maintenanceDetail, maintenanceDetail.createdBy, "documents"),
      status: "scheduled",
      isMaintenanceScheduled: true,
      workOrderCreatedAt: entryTime,
      maintenanceId: maintenanceDetail._id,
      createdBy: maintenanceDetail.createdBy,
      updatedBy: maintenanceDetail.updatedBy,
      businessUnit:maintenanceDetail.businessUnit
    };
    return obj;
  } catch (error) {
    throw error;
  }
};

async function generateNumber(maintenanceId) {
  try {
    const lastWONumber = await mongoDbManager.count(workOrders, {
      isDeleted: false,
      maintenanceId: maintenanceId
    }); // Generates the workorder Number based on the count of workorder.
    let currentVersion = "1";
    if (lastWONumber !== null) {
      currentVersion = lastWONumber + 1;
    }
    const woNumber = "SHM-" + currentVersion;
    return woNumber;
  } catch (error) {
    throw error;
  }
};

async function updateFiles(maintenancePlanObject, userId, fileType) {
  try {
    const createdFiles = [];
    const files = maintenancePlanObject[fileType]; // Dynamically select 'documents' or 'images'
    
    if (files && files.length > 0) {
      const copiedFiles = await fileManager.copyToLocation(null, userId, "uploads",files);

      for (let file of copiedFiles) {
        const transformedFile = await fileManager.transformFileObj(
          file,
          "internal",
        );
        createdFiles.push(transformedFile);
      }
    return createdFiles;
    } else {
      return [];
    }
  } catch (error) {
    throw error;
  }
}


const updateMaintenancePlan = async (id) => {
  try {
    await mongoDbManager.updateOne(
      MaintenancePlan,
      { _id: id },
      {
        $set: {
          scheduledTime: Date.now(),
          isWorkOrderCreated: true,
        },
      }
    );
  } catch (error) {
    throw error;
  }
};

function createTaskObj(maintenanceDetail, workOrderId) {
  const tasks = maintenanceDetail.tasks;
  if (!Array.isArray(tasks)) {
    return [];
  }
  const taskObjects = tasks.map((task) => ({
    description: task.description || task.name, // Task description from req.body.tasks
    index: task.index || task.order,
    workOrderId: workOrderId, // The work order ID
    updatedBy: task.updatedBy, // User who updated
    createdBy: task.createdBy, // User who created
  }));
  // Return the array of task objects
  return taskObjects;
}

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
  return {intervals,nextInterval} ;
};

async function createWorkOrderWithManintenanceDetails (maintenanceDetail, entryTime, nextInterval, userId){
  try{
    if (maintenanceDetail._id && entryTime) {
      const entry = await mongoDbManager.findOne(
        workOrders,
        {
          maintenanceId: maintenanceDetail._id,
          workOrderCreatedAt: entryTime,
        },
        {}
      );
      if(!entry){

        const endTime = entryTime.plus(Duration.fromObject({ 
          [maintenanceDetail.recurrenceDetails.timePeriod + 's']: 
          maintenanceDetail.recurrenceDetails.frequency 
        }));

    const workOrderObjectToBeCreated =
          await workOrderCreateObject(maintenanceDetail, entryTime, endTime);
    const createdWorkOrder = await workOrderManager.createWorkOrder(
      workOrderObjectToBeCreated, userId
    );
    const taskObj = createTaskObj(maintenanceDetail, createdWorkOrder._id);
    const createdWorkOrderTasks =
      await workOrderTaskManager.createWorkOrderTasksManager(
        taskObj,
        createdWorkOrder._id
      );
    await updateMaintenancePlan(maintenanceDetail._id);
      }
    }
  }catch(error){
    throw error
  }
}

async function createWorkOrderForNonRecurrenceManintenance (maintenanceDetail, entryTime, nextInterval, userId){
  try{
    if (maintenanceDetail._id && entryTime) {
      const entry = await mongoDbManager.findOne(
        workOrders,
        {
          maintenanceId: maintenanceDetail._id,
          workOrderCreatedAt: entryTime,
        },
        {}
      );
      if(!entry){

        const endTime =nextInterval

    const workOrderObjectToBeCreated =
          await workOrderCreateObject(maintenanceDetail, entryTime, endTime);
    const createdWorkOrder = await workOrderManager.createWorkOrder(
      workOrderObjectToBeCreated, userId
    );
    const taskObj = createTaskObj(maintenanceDetail, createdWorkOrder._id);
    const createdWorkOrderTasks =
      await workOrderTaskManager.createWorkOrderTasksManager(
        taskObj,
        createdWorkOrder._id
      );
    await updateMaintenancePlan(maintenanceDetail._id);
      }
    }
  }catch(error){
    throw error
  }
}

const findRange = async (start, end, currentDate, maintenanceId) => {
  try {
    const startDate = convertDateFormat(start);
    const endDate = convertDateFormat(end);
    const lastEntry = await mongoDbManager.findOneLastEntry(workOrders, {
      maintenanceId,
    });
    let rangeStart;
    let rangeEnd;
    let lastEntryDate;
    if (lastEntry) {
      lastEntryDate = lastEntry.workOrderCreatedAt;
      rangeStart = convertDateFormat(lastEntryDate);
    } else {
      rangeStart = startDate;
    }
    if (currentDate > end) {
      rangeEnd = endDate;
    } else {
      rangeEnd = currentDate;
    }
    return { rangeStart, rangeEnd };
  } catch (err) {
    throw err;
  }
};

const convertDateFormat = (date) => {
  if (date) {
    return DateTime.fromJSDate(date);
  }
  return null;
};


const updateAssetHistoryForMaintenance = async () => {
  try{
    const maintenanceDetails = await MaintenancePlan.find({
      $and: [
        { status: "scheduled" },
        { isDeleted: false },
        { addToAssetHistory : true},
        {addedToAssetHistory: false}
      ],
    })
    for (let maintenanceDetail of maintenanceDetails){
      let isFirstTime = false;
      if (maintenanceDetail.recurrenceDetails === null){
        const name = `SHM-1${maintenanceDetail.name}`;
        const objectToBeCreated = DataHandler.constructHistory("WorkOrderCreated",  name, maintenanceDetail.asset, maintenanceDetail.startAt, "planned", null, "workOrders", maintenanceDetail.businessUnit)
        await assetHistory_manager.createAssetHistoryManager([objectToBeCreated]);
      }else{
        let recurDetails = {};
        recurDetails["frequency"] = maintenanceDetail.recurrenceDetails.frequency
        ?maintenanceDetail.recurrenceDetails.frequency
        : 1;
        recurDetails["timePeriod"] = maintenanceDetail.recurrenceDetails.timePeriod
        ? maintenanceDetail.recurrenceDetails.timePeriod
        : "hour";
        const startDate = convertDateFormat(maintenanceDetail.startAt);
        const endDate = convertDateFormat(maintenanceDetail.endAt);
        const Entries = await calculateEntryTimes(startDate,endDate,recurDetails,isFirstTime)
        isFirstTime = true
        const intervals = Entries.intervals
        const bulkCreateData = []
        let lastWONumber = 1;
        for (let i = 0; i < intervals.length - 1; i++){
          const interval = intervals[i];
          const currentVersion = lastWONumber; // Use the current value of the counter
          lastWONumber++; // Increment the counter for the next iteration
          const name = `SHM-${currentVersion}${maintenanceDetail.name}`;
          const entry = await assetHistory_manager.checkIfAssetHistoryExists(maintenanceDetail.asset, name, interval.toUTC())
          if(!entry){
            const objectToBeCreated = DataHandler.constructHistory(
              "WorkOrderCreated",
              name,
              maintenanceDetail.asset,
              interval.toUTC(),
              "planned",
              null,
              "workOrders",
              maintenanceDetail.businessUnit,
            );
            // await assetHistory_manager.createAssetHistory("WorkOrderCreated",  maintenanceDetail.name, maintenanceDetail.asset, interval.toUTC(), "planned", "")
            bulkCreateData.push(objectToBeCreated)
          }
        }
        if (bulkCreateData.length > 0) {
          await assetHistory_manager.createAssetHistoryManager(bulkCreateData);
        }
      }
      await updateMaintenacePlanWithAssetHistory(maintenanceDetail._id)
    }
  }catch(error){
    throw error;
  }
}

const updateMaintenacePlanWithAssetHistory = async (maintenanceId) => {
  try{
    await mongoDbManager.updateOne(MaintenancePlan,{_id:maintenanceId},{addedToAssetHistory: true})
  }catch(error){
    throw error;
  }
}




module.exports = {
  createScheduledWorkOrder,
};
