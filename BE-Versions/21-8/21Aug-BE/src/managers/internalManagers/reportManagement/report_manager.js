/*
date            qid / cr#         comments
16-mar-2026     CR0002           filteration for REPORTLIST

*/
const {
  ChecklistEntryModel,
} = require("../../../models/mongoDB/checklistManagement/checklistEntry_model");
const {
  findMany,
  count,
  findAll,
  findOne,
  insertOne,
  aggregation,
  fetchAllAndPopulate,
  updateOne,
} = require("../../dBManagers/mongoDB_manager");
const paginationHandler = require("../../common/paginationHandler_manager");
const {
  ChecklistModel,
} = require("../../../models/mongoDB/checklistManagement/checklist_model");
const UserModel = require ("../../../models/mongoDB/userManagement/user_model")
const { generatePDF, generatePDFLandscape, generatePDFForSingleEntry,generateExcelLayoutLandscape, generateWorkOrderPDF } = require("./template");
const User = require("../../../models/mongoDB/userManagement/user_model");
const Department = require("../../../models/mongoDB/organizationManagement/department_model");
const Team = require("../../../models/mongoDB/userManagement/team_model");
const fileManager = require("../fileSystem/fileSystem_manager");
const {
  ReportModel,
} = require("../../../models/mongoDB/reportManagement/report_model");
const {
  Assets,
} = require("../../../models/mongoDB/assetManagement/asset_model");
const { LogModel } = require("../../../models/mongoDB/logManagement/log_model");
const {
  LogEntryModel,
  status,
} = require("../../../models/mongoDB/logManagement/logEntry_model");
const { DateTime } = require("luxon");
const { ObjectId } = require("mongodb");
const { default: mongoose } = require("mongoose");
const {
  LogStructureModel,
} = require("../../../models/mongoDB/logManagement/logStructure_model");
const BusinessUnit = require("../../../models/mongoDB/organizationManagement/businessUnit_model");
const log_manager = require("../logManagement/log_manager");
const { constructLogReportTemplateData, sendLogReportEmail } = require("../../../utils/emailService/templates/logReportEmailTemplate");
const fs = require("fs");
const XLSX = require('xlsx');
const formulaApproaches = {
  PROCESS_AT_FETCH_TIME: "PROCESS_AT_FETCH_TIME",
  PROCESS_AT_UPDATE_TIME: "PROCESS_AT_UPDATE_TIME",
}
const {
  workOrders,
} = require("../../../models/mongoDB/maintenanceManagement/workOrder_model");
const WorkOrderPartReplaced = require("../../../models/mongoDB/maintenanceManagement/workOrderPartReplaced_model");

let formulaApproach = formulaApproaches.PROCESS_AT_FETCH_TIME


const moduleData = async (
  module,
  entityStatus,
  pageNumber,
  pageLimit,
  entityName,
  businessUnit, // Added businessUnit as a parameter
  userId
) => {
  try {
    let query = {};

    // Add filters to the query based on the provided parameters
    if (entityStatus) {
      query.status = entityStatus;
    }
    if (entityName) {
      query.name = { $regex: entityName, $options: "i" };
    }
    if (businessUnit) {
      query.businessUnit = businessUnit; // Added businessUnit to the query
    }
    if (userId){
      const user = await findOne(User, { _id: userId }, { department: 1 });
      if (!user || !user.department) {
        throw new Error("User or department not found.");
      }
      const userDeptId = String(user.department);
      query.departments = { $in: [userDeptId] } ;
    }

    if (module === "Checklist") {
      const entitiesCount = await count(ChecklistModel, query);
      const totalPages = Math.ceil(entitiesCount / pageLimit);
      const entities = await findMany(
        ChecklistModel,
        query,
        pageNumber,
        pageLimit,
        { createdAt: "desc" },
        "desc",
        {
          _id: 1,
          name: 1,
          checklistNumber: 1,
          startDateAndTime: 1,
          endDateAndTime: 1,
        }
      );
      if (entities) {
        const result = {
          currentPage: +pageNumber,
          totalPageCount: totalPages,
          totalDataCount: entitiesCount,
          data: entities,
        };
        return result;
      }
    } else if (module === "Logs") {
      query.isActive = true
      const entitiesCount = await count(LogModel, query);
      const totalPages = Math.ceil(entitiesCount / pageLimit);
      const entities = await findMany(
        LogModel,
        query,
        pageNumber,
        pageLimit,
        { createdAt: "desc" },
        "desc",
        {
          _id: 1,
          name: 1,
          checklistNumber: 1,
          startDateAndTime: 1,
          endDateAndTime: 1,
        }
      );
      if (entities) {
        const result = {
          currentPage: +pageNumber,
          totalPageCount: totalPages,
          totalDataCount: entitiesCount,
          data: entities,
        };
        return result;
      }
    } else if (module === "Workorders"){
      query.isDeleted = false
      const entitiesCount = await count(workOrders, query);
      const totalPages = Math.ceil(entitiesCount / pageLimit);
      const entities = await findMany(
        workOrders,
        query,
        pageNumber,
        pageLimit,
        { createdAt: "desc" },
        "desc",
        {
          _id: 1,
          name: 1,
          number: 1,
          startAt: 1,
          endAt: 1,
        }
      );
      if (entities) {
        const result = {
          currentPage: +pageNumber,
          totalPageCount: totalPages,
          totalDataCount: entitiesCount,
          data: entities,
        };
        return result;
      }
    } 
    else {
      return null;
    }
  } catch (error) {
    throw error;
  }
};


const reportCreation = async (reqData, userId, reqHost, reqProtocol) => {
  try {
    let user = await findOne(User, { _id: userId }, { _id: 0, name: 1, email: 1 });
    user.name = user ? user.name || "Unknown" : "Unknown";
    const report = await generateReport(
      reqData,
      user,
      reqHost,
      reqProtocol
    );
    if (report) {
      return report;
    }
    throw "Report not created";
  } catch (error) {
    throw error;
  }
};

const entryReportCreation = async (entryId,logId, userId, reqHost, reqProtocol) => {
  try{
    let user = await findOne(User, { _id: userId }, { _id: 0, name: 1, email: 1 });
    user.name = user ? user.name || "Unknown" : "Unknown";
    const report = await generateReportForSingleEntry(
      entryId,logId, user, reqHost, reqProtocol
    );
    if (report) {
      return report;
    }
    throw "Report not created";
  }catch(error){
    throw error;
  }
}

const generateReportForSingleEntry = async (entryId,logId, user, reqHost, reqProtocol) => {
  try {
    const query = {
      status: {$in: ["pendingForApproval", "completed"]},
    };
      const log = await findOne(
        LogModel,
        { _id: logId },
        {
          name: 1,
          documentNumber: 1,
          assetId: 1,
          departments: 1,
          description: 1,
          teams: 1,
          assignees: 1,
          approvers : 1,
          approvedBy : 1,
          scheduledReportDetails: 1,
          startDateAndTime: 1,
          endDateAndTime: 1,
          businessUnit: 1,
          status  : 1
        }
      );
      if (log) {
        query.logId = logId;
        const [assignees, departments, teams, assetD, businessUnit, approvers, approvedBy] = await Promise.all([
          fetchUsers(log.assignees || []),
          fetchDepartments(log.departments || []),
          fetchTeams(log.teams || []),
          fetchAsset(log.assetId || ""),
          fetchBusinessUnit(log.businessUnit || ""),
          fetchUsers(log.approvers || []),
          fetchUsers(log.approvedBy || [])
        ]);
        const assigneeNames = assignees.map(
          (assignee) => assignee?.name || ""
        );
        const departmentNames = departments.map(
          (department) => department?.name || ""
        );
        // const approversName  = approvers.map(
        //   (approver) => approver?.name || ""
        // );
        //qid_074
        let approversName = approvers.map((approver) => approver?.name || "").filter(Boolean);
        if (approversName.length === 0) {
          approversName = [user?.name || "Unknown"];
        }
        //qid_074
        let approvedByName  = approvedBy.map(
          (approveBy) => approveBy?.name || ""
        );
        const teamNames = teams.map((team) => team?.name || "");
        //qid_074
        // const [dateStart, timeStart] = log.startDateAndTime.toISOString().split("T");
        // const [dateEnd, timeEnd] = log.endDateAndTime.toISOString().split("T");
        // const dateRange = `${dateStart} - ${dateEnd}`;
        //qid_074
        const assetGD = assetD ? assetD.generalDetails : null;
        const assetName = assetGD ? assetGD.name : "Not Available";

        //   let entries = await findOne(LogEntryModel, query, {});
        // if (entries && entries.status === "completed") {
        //   // Keep approvedByName as is for completed entries
        // }
        // else {
        //   approvedByName = []; // Set to empty array for non-completed entries
        // }

        //qid_074
        let entries = await findOne(LogEntryModel, query, {});
        const validatedBy = entries?.status === "completed"? user?.name || "-" : "-";
        const entryDate = entries?.createdAt ? new Date(entries.createdAt).toISOString().split("T")[0] : "Not Available";
        //qid_074

        const logItem = generatelogItem(
          log,
          departmentNames,
          assigneeNames,
          teamNames,
          approversName,
          approvedByName,
          // dateRange,
          entryDate, //qid_074
          assetName
        );
        const logName = log?.name ?? "Unknown";
        query._id = entryId;
        
        // let entries = await findOne(LogEntryModel, query, {}); moved up //qid_074

        if (formulaApproach == formulaApproaches.PROCESS_AT_FETCH_TIME) {
          entries = await log_manager.evaluateTemplate(entries); // Call the evaluateTemplate function
        }

        if (entries) {
          const {entriesItem,approvedByNames} = await processEntries([entries]);
          entriesItem.sort((a, b) => new Date(a.dop) - new Date(b.dop));
          const docFormat = "pdf";
          if (docFormat.toLowerCase() === "pdf") {
            const { filePath, reportN } = await generatePDFForSingleEntry(
              logItem,
              entriesItem.map(item => ({...item, status: entries.status})),
              logName,
              user.name,
              "Manual",
              businessUnit,
              approvedByNames,
              validatedBy, //qid_074
              null,
              null,
              null,
              entries.status
            );
            if (filePath) {
              const file = await fileManager.uploadFileInternal(
                filePath,
                log.businessUnit,
                reportN
              );
              if (file) {
                const fileData = await fileManager.transformFileObj(
                  file,
                  "download",
                  reqHost,
                  reqProtocol
                );
                const docId = fileData.id ? fileData.id : "";
                const url = fileData.url ? fileData.url : "";
                const name = fileData.name ? fileData.name : "Unknown";
                return { docId, url, name };
              }
            }
          } else {
            throw "Format is not supported";
          }
        }
        else{
          throw "No completed entries found to generate the report.";
        }
      }
      else{
        throw "Provide correct logId"
      }
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const generateReport = async (data, user, reqHost, reqProtocol) => {
  try {
    const {
      moduleName,
      moduleEntityName,
      moduleEntityId,
      startDateAndTime,
      endDateAndTime,
      format,
      type
    } = data;
    let reportType = type ? type: "portrait"
    let start = startDateAndTime ? startDateAndTime : null;
    let end = endDateAndTime ? endDateAndTime : null;
    const query = {
      entryCreatedAt: {
        $gte: start,
        $lte: end,
      },
         status: {$in: ["pendingForApproval", "completed"]},
    };
    if (moduleName === "checklist") {
      const checklist = await findOne(
        ChecklistModel,
        { _id: moduleEntityId },
        {
          name: 1,
          documentNumber: 1,
          assetId: 1,
          departments: 1,
          description: 1,
          teams: 1,
          assignees: 1,
          scheduledReportDetails: 1,
        }
      );
      if (checklist) {
        query.checklistId = moduleEntityId;
        const [assignees, departments, teams] = await Promise.all([
          fetchUsers(checklist.assignees || []),
          fetchDepartments(checklist.departments || []),
          fetchTeams(checklist.teams || []),
        ]);
        const assigneeNames = assignees.map(
          (assignee) => assignee?.name || "Unknown"
        );
        const departmentNames = departments.map(
          (department) => department?.name || "Unknown"
        );
        const teamNames = teams.map((team) => team?.name || "Unknown");
        const [dateStart, timeStart] = startDateAndTime.split("T");
        const [dateEnd, timeEnd] = endDateAndTime.split("T");
        const dateRange = `${dateStart} - ${dateEnd}`;
        const checklistItem = generateChecklistItem(
          checklist,
          assigneeNames,
          departmentNames,
          teamNames,
          dateRange
        );
        const entries = await findAll(ChecklistEntryModel, query, {});
        if (entries.length > 0) {
          const {entriesItem} = await processEntries(entries);
          const docFormat = format ? format : "pdf";
          if (docFormat.toLowerCase() === "pdf") {
            const { filePath, reportN } = await generatePDF(
              checklistItem,
              entriesItem,
              moduleEntityName,
              user.name,
              "Manual"
            );
            if (filePath) {
              const file = await fileManager.uploadFileInternal(
                filePath,
                reportN
              );
              if (file) {
                const fileData = await fileManager.transformFileObj(
                  file,
                  "download",
                  reqHost,
                  reqProtocol
                );
                return { docId: fileData.id, url: fileData.url };
              }
            }
          } else {
            throw "Format is not supported";
          }
        }
        throw "The entered time is not valid. Please check and try again.";
      }
    } else if (moduleName === "logs") {
      const log = await findOne(
        LogModel,
        { _id: moduleEntityId },
        {
          name: 1,
          documentNumber: 1,
          status: 1,
          assetId: 1,
          departments: 1,
          description: 1,
          teams: 1,
          assignees: 1,
          approvers: 1,
          approvedBy: 1,
          scheduledReportDetails: 1,
          startDateAndTime: 1,
          endDateAndTime: 1,
          businessUnit: 1,
        }
      );
      if (log) {
        query.logId = moduleEntityId;
        const [
          assignees,
          departments,
          teams,
          assetD,
          businessUnit,
          approvers,
          approvedBy,
        ] = await Promise.all([
          fetchUsers(log.assignees || []),
          fetchDepartments(log.departments || []),
          fetchTeams(log.teams || []),
          fetchAsset(log.assetId || ""),
          fetchBusinessUnit(log.businessUnit || ""),
          fetchUsers(log.approvers || []),
          fetchUsers(log.approvedBy || []),
        ]);
        const assigneeNames = assignees.map(
          (assignee) => assignee?.name || "Unknown"
        );
        const departmentNames = departments.map(
          (department) => department?.name || "Unknown"
        );
        // const approversName = approvers.map(
        //   (approver) => approver?.name || "Unknown"
        // );
        //qid_074
        let approversName = approvers.map((approver) => approver?.name || "").filter(Boolean);
        if (approversName.length === 0) {
          approversName = [user?.name || "Unknown"];
        }
        //qid_074
        const approvedByName = approvedBy.map(
          (approveBy) => approveBy?.name || "Unknown"
        );
        const teamNames = teams.map((team) => team?.name || "Unknown");
        const [dateStart, timeStart] = startDateAndTime.split("T");
        const [dateEnd, timeEnd] = endDateAndTime.split("T");
        const dateRange = `${dateStart} - ${dateEnd}`;
        const assetGD = assetD ? assetD.generalDetails : null;
        const assetName = assetGD ? assetGD.name : "Not Available";
        const logStartDate = log.startDateAndTime ? log.startDateAndTime : "";
        const logEndDate = log.endDateAndTime ? log.endDateAndTime : "";
        const currentDate = DateTime.now();
        // if (new Date(start) < new Date(logStartDate))
        //   throw "Please enter correct start date";
        if (new Date(end) > currentDate.toJSDate()) {
          throw "Please enter end date less than and equal to current date";
        }
        const logItem = generatelogItem(
          log,
          departmentNames,
          assigneeNames,
          teamNames,
          approversName,
          approvedByName,
          dateRange,
          assetName
        );
        const logName = log?.name ?? "Unknown";
        const entries = [];
        let fetchedEntries = await findAll(LogEntryModel, query, {});
        if (formulaApproach == formulaApproaches.PROCESS_AT_FETCH_TIME) {
          for (let i = 0; i < fetchedEntries.length; i++) {
            let entry = fetchedEntries[i];
            entry = await log_manager.evaluateTemplate(entry); // Call the evaluateTemplate function
            entries.push(entry);
          }
        } else {
          entries = fetchedEntries;
        }
        if (entries.length > 0) {
          const { entriesItem, approvedByNames } = await processEntries(
            entries
          );
          const allEntriesCompleted = entries.every((entry) => entry.status === "completed"); //qid_074
          entriesItem.sort((a, b) => new Date(a.dop) - new Date(b.dop));
          const docFormat = format ? format : "pdf";
          if (docFormat.toLowerCase() === "pdf") {
            let filePath, reportN;

            if (reportType == "landscape") {
              ({ filePath, reportN } = await generatePDFLandscape(
                logItem,
                entriesItem,
                logName,
                user.name,
                "Manual",
                businessUnit,
                approvedByNames,
                allEntriesCompleted //qid_074
              ));
            } else {
              ({ filePath, reportN } = await generatePDF(
                logItem,
                entriesItem,
                logName,
                user.name,
                "Manual",
                businessUnit,
                approvedByNames,
                allEntriesCompleted //qid_074
              ));
            }
            if (filePath) {
              query.status = "overdue";
              let fetchedOverDueEntries = await findMany(
                LogEntryModel,
                query,
                1,
                5,
                { ["entryCreatedAt"]: -1 },
                "desc"
              );
              const constructedOverDueEntries = fetchedOverDueEntries.map(
                (entry) => {
                  return {
                    entryRecurringId: entry.entryNumber,
                    scheduledTime: entry.entryCreatedAt,
                  };
                }
              );
              const fileContent = fs.readFileSync(filePath);
              //construct Filename by log name and concating current date with time in short
              const fileName = `${log.name}_${
                currentDate.toString().split("T")[0]
              }${currentDate.toString().split("T")[1].split(".")[0]}.pdf`;
              const attatchments = [
                { content: fileContent, filename: fileName,filePath: filePath },
              ];
              if (
                process.env.SEND_EMAIL_ON_GENERATE_REPORT == "true" &&
                process.env.SEND_EMAIL == "true"
              ) {
                const performanceMetricsTimersData =
                  await calculatePerformanceMetrics(query);
                const constructedData = await constructLogReportTemplateData(
                  user.name,
                  "Generated",
                  log.name,
                  { start: start, end: end },
                  currentDate.toString(),
                  constructedOverDueEntries,
                  [],
                  performanceMetricsTimersData,
                  attatchments
                );

                await sendLogReportEmail(
                  [user.email],
                  `Log Report ${log.name}`,
                  constructedData
                );
              }

              const file = await fileManager.uploadFileInternal(
                filePath,
                log.businessUnit,
                reportN
              );
              if (file) {
                const fileData = await fileManager.transformFileObj(
                  file,
                  "download",
                  reqHost,
                  reqProtocol
                );
                const docId = fileData.id ? fileData.id : "";
                const url = fileData.url ? fileData.url : "";
                const name = fileData.name ? fileData.name : "Unknown";
                return { docId, url, name };
              }
            }
          } else if (docFormat.toLowerCase() === "excel") {
            const { buffer, filePath } = generateExcelLayoutLandscape(
              logItem,
              entriesItem,
              user.name,
              "Manual",
              logName,
              businessUnit,
              approvedByNames,
              { output: "buffer" }
            );

            const file = await fileManager.uploadFileInternal(
              filePath,
              log.businessUnit,
              log.name,
              "logs",
              log._id,
              user._id,
              buffer
            );
            if (file) {
              const fileData = await fileManager.transformFileObj(
                file,
                "download",
                reqHost,
                reqProtocol
              );
              return {
                docId: fileData.id,
                url: fileData.url,
                name: fileData.name || "Unknown",
              };
            }
          } else {
            throw "Format is not supported";
          }
        }
        throw "The time entered is invalid, or there are no completed entries for this log. Please check and try again.";
      }
    } else if (moduleName === "workorders") {
      const workorderObj = await workOrders
        .findOne(
          { _id: moduleEntityId, isDeleted: false },
          {
            name: 1,
            number: 1,
            status: 1,
            asset: 1,
            departments: 1,
            description: 1,
            existingTeams: 1,
            localTeams: 1,
            assignees: 1,
            createdBy: 1,
            createdAt: 1,
            startAt: 1,
            endAt: 1,
            estimatedDays: 1,
            estimatedHours: 1,
            priority: 1,
            tasks: 1,
            businessUnit: 1,
            isMaintenanceScheduled: 1,
            acceptTime: 1,
            completeTime: 1,
          }
        )
        .populate("tasks");
      const spareReplacedObj = await WorkOrderPartReplaced.find({
        workOrder: moduleEntityId,
        isActive: true,
      }).populate("spare spareRequested");
      const spareUsed = spareReplacedObj.map((item) => ({
        name:
          item.spare?.name && item.spare?.specification
            ? `${item.spare?.name} - ${item.spare?.specification}`
            : item.spare?.name || item.spare?.specification || "",
        requestedQuantity: item.spareRequested
          ? item.spareRequested.requestedQuantity || "-"
          : "-", // if quantity is stored in spareRequested
        replacedQuantity: item.replacedQuantity || 0,
        remarks: item.remarks || "-",
      }));
      if (workorderObj) {
        const teamIds = workorderObj.existingTeams.map((item) => item.id);
        const [
          assignees,
          departments,
          existingTeams,
          assetD,
          businessUnit,
          createdBy,
        ] = await Promise.all([
          fetchUsers(workorderObj.assignees || []),
          fetchDepartments(workorderObj.departments || []),
          fetchTeams(teamIds || []),
          fetchAsset(workorderObj.asset || ""),
          fetchBusinessUnit(workorderObj.businessUnit || ""),
          fetchUser(workorderObj.createdBy || ""),
        ]);
        const assigneeNames = assignees.map(
          (assignee) => assignee?.name || "Unknown"
        );
        const departmentNames = departments.map(
          (department) => department?.name || "Unknown"
        );
        const createdByName = createdBy ? createdBy.name : "Not Available";
        const teamNames = existingTeams.map((team) => team?.name || "Unknown");
        const localTeams = workorderObj.localTeams.map(
          (localTeam) => localTeam.name
        );
        const [dateStart, timeStart] = workorderObj.startAt
          .toISOString()
          .split("T");
        const [dateEnd, timeEnd] = workorderObj.endAt.toISOString().split("T");
        const dateRange = `${dateStart} - ${dateEnd}`;
        const totalHours =
          (workorderObj.estimatedDays || 0) * 24 +
          (workorderObj.estimatedHours || 0);
        const estimationHours = `${totalHours} hour${
          totalHours !== 1 ? "s" : ""
        }`;
        const assetGD = assetD ? assetD.generalDetails : null;
        const assetName = assetGD ? assetGD.name : "Not Available";
        const differenceMs =
          workorderObj.completeTime - workorderObj.acceptTime;
        const durationMs = Math.abs(differenceMs);
        // const durationSeconds = durationMs / 1000;
        // const durationMinutes = durationMs / (1000 * 60);
        let actualDurationHours = durationMs / (1000 * 60 * 60) || 0;

        actualDurationHours = `${actualDurationHours.toFixed(2)} hours`;

        const workOrderItem = generateWorkOrderItem(
          workorderObj,
          departmentNames,
          assigneeNames,
          teamNames,
          createdByName,
          estimationHours,
          dateRange,
          assetName,
          actualDurationHours,
          localTeams
        );
        if (workorderObj.tasks.length > 0) {
          const formattedTasks = workorderObj.tasks.map((task) => ({
            description: task.description,
            status:
              task.isCompleted === true || task.isCompleted === "true"
                ? "Completed"
                : "Not Completed",
          }));
          const docFormat = format ? format : "pdf";
          if (docFormat.toLowerCase() === "pdf") {
            let filePath, reportN;
            ({ filePath, reportN } = await generateWorkOrderPDF(
              workOrderItem,
              workorderObj.status,
              formattedTasks,
              workorderObj.name,
              user.name,
              "Manual",
              businessUnit,
              createdByName,
              spareUsed
            ));

            const file = await fileManager.uploadFileInternal(
              filePath,
              workorderObj.businessUnit,
              reportN
            );
            if (file) {
              const fileData = await fileManager.transformFileObj(
                file,
                "download",
                reqHost,
                reqProtocol
              );
              const docId = fileData.id ? fileData.id : "";
              const url = fileData.url ? fileData.url : "";
              const name = fileData.name ? fileData.name : "Unknown";
              return { docId, url, name };
            }
          } else {
            throw "Format is not supported";
          }
        }
        throw "The time entered is invalid, or there are no completed entries for this log. Please check and try again.";
      }
    }
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const calculatePerformanceMetrics = async (query) => {
  // Clone query for user-specific calculations and add status filter
  const userQuery = { ...query, status: { $in: ["completed", "pendingForApproval"] } };

  // Fetch entries for user-specific calculations
  const userEntries = await findAll(LogEntryModel, userQuery, {});

  // Map user performances
  const userPerformance = userEntries.reduce((acc, entry) => {
    const userIds = entry.operatorIds || []; // Assuming operatorIds is the array of user IDs
    userIds.forEach((userId) => {
    if (!acc[userId]) {
      acc[userId] = {
        userId,
        totalEntries: 0,
        onTimeEntries: 0,
        totalResponseTime: 0, // In milliseconds
        totalEnteredEntries: 0,
      };
    }

    acc[userId].totalEntries++;

    const entryEnteredAt = new Date(entry.entryEnteredAt);
    const endTime = new Date(entry.endTime);
    const entryCreatedAt = new Date(entry.entryCreatedAt);

    if (!isNaN(entryEnteredAt) && !isNaN(endTime)) {
      const responseTime = entryEnteredAt - entryCreatedAt;

      if (entryEnteredAt <= endTime) {
        acc[userId].onTimeEntries++;
      }

      acc[userId].totalResponseTime += responseTime;
      acc[userId].totalEnteredEntries++;
    }
  });
    return acc;
  }, {});

  // Fetch user details and calculate averages
  const performanceArray = await Promise.all(
    Object.values(userPerformance).map(async (perf) => {
      const user = await findOne(UserModel, { _id: perf.userId }, { name: 1 });
      const avgResponseTime = perf.totalResponseTime / (perf.totalEnteredEntries || 1);
      return {
        userName: user?.name || "Unknown",
        onTimeEntries: perf.onTimeEntries,
        avgResponseTime: avgResponseTime / 60000, // Convert to minutes
      };
    })
  );

  // Sort and get top performers
  const topPerformers = performanceArray
    .filter((perf) => perf.onTimeEntries > 0)
    .sort((a, b) => b.onTimeEntries - a.onTimeEntries)
    .slice(0, 5);

  // Fetch all entries for overall calculations (remove status filter)
  delete query.status;
  const allEntries = await findAll(LogEntryModel, query, {});

  // Calculate overall metrics
  const overallMetrics = allEntries.reduce(
    (acc, entry) => {
      const entryEnteredAt = new Date(entry.entryEnteredAt);
      const entryCreatedAt = new Date(entry.entryCreatedAt);
      const endTime = new Date(entry.endTime);

      if (!isNaN(entryEnteredAt)) acc.totalEnteredEntries++;

      if (!isNaN(entryEnteredAt) && !isNaN(endTime)) {
        acc.totalResponseTime += entryEnteredAt - entryCreatedAt;
        if (entryEnteredAt <= endTime) {
          acc.onTimeEntries++;
        }
      }

      return acc;
    },
    { totalEnteredEntries: 0, totalResponseTime: 0, onTimeEntries: 0 }
  );

  return {
    topPerformers,
    totalEntries: allEntries.length || 0,
    onTimeEntries: overallMetrics.onTimeEntries || 0,
    onTimePercentage: ((overallMetrics.onTimeEntries / (allEntries.length || 1)) * 100) || 0,
    avgResponseTime: ((overallMetrics.totalResponseTime / (overallMetrics.totalEnteredEntries || 1)) / 60000) || 0, // Convert to minutes
  };
};


const fetchAsset = async (assetId) => {
  try {
    return findOne(
      Assets,
      { _id: assetId },
      { _id: 0, "generalDetails.name": 1 }
    );
  } catch (error) {
    throw error;
  }
};

const fetchUser = async (userId) => {
  try {
    return findOne(
      User,
      { _id: userId },
      { _id: 0, name: 1 }
    );
  } catch (error) {
    throw error;
  }
};

const fetchBusinessUnit = async (businessUnitId) => {
  try {
    return findOne(
      BusinessUnit,
      { _id: businessUnitId },
      { _id: 0, name: 1, logo1: 1, logo2: 1 }
    );
  } catch (error) {
    throw error;
  }
};


const fetchUsers = async (userIds) => {
  return Promise.all(
    userIds.map((id) => findOne(User, { _id: id }, { _id: 0, name: 1 }))
  );
};

const fetchDepartments = async (departmentIds) => {
  return Promise.all(
    departmentIds.map((id) =>
      findOne(Department, { _id: id }, { _id: 0, name: 1 })
    )
  );
};

const fetchTeams = async (teamIds) => {
  return Promise.all(
    teamIds.map((id) => findOne(Team, { _id: id }, { _id: 0, name: 1 }))
  );
};

const generateChecklistItem = (
  checklist,
  departmentNames,
  assigneeNames,
  teamNames,
  dateRange,
  assetName
) => {
  return [
    {
      leftSide: {
        key: "Checklist Name",
        value: checklist.name || "Not Available",
      },
      rightSide: { key: "Date Range", value: dateRange },
    },
    {
      leftSide: {
        key: "Document Number",
        value: checklist.documentNumber || "Not Available",
      },
      rightSide: {
        key: "Asset Name",
        value: assetName || "Not Available",
      },
    },
    {
      leftSide: {
        key: "Description",
        value: checklist.description || "Not Available",
      },
      rightSide: {
        key: "Departments",
        value: departmentNames.join(", ") || "Not Available",
      },
    },
    {
      leftSide: {
        key: "Assignees",
        value: assigneeNames.join(", ") || "Not Available",
      },
      rightSide: {
        key: "Teams",
        value: teamNames.join(", ") || "Not Available",
      },
    },
  ];
};
const transformFieldValue = (fieldValue) => {
  if (Array.isArray(fieldValue)) {
    const activeOption = fieldValue.filter((option) => option.isActive);
    const result = activeOption
      ? activeOption.map((item) => item.optionValue)
      : "";
    return result.join(",");
  }
  return fieldValue;
};
const processEntries = async (entries) => {
  let allApprovedByRaw = [];
  const processed = await Promise.all(
    entries.map(async (entry) => {
      const filledByName = await findOne(
        User,
        { _id: entry.updatedBy || null },
        { _id: 0, name: 1 }
      );

      const entryCreated = convertUTCToIST(entry.entryCreatedAt.toString());
      const entryUpdate = convertUTCToIST(entry.updatedAt.toString());
      const [dateCreated, timeCreated] = entryCreated.split("T");
      const datePartCreated = `${dateCreated} ${timeCreated}`;

      if (Array.isArray(entry.approvedBy)) {
        entry.approvedBy.forEach(item => {
          if (item ) {
            allApprovedByRaw.push({
              userId: item,
          
            });
          }
        });
      }

      return {
        dop: datePartCreated,
        filledBy: filledByName ? filledByName.name : "Not Available",
        filledTime: entryUpdate,
        dataFields: entry.data.map((field, index) => ({
          sNo: index + 1,
          assetName: "Not Available",
          fieldName: field.fieldName,
          fieldValue: transformFieldValue(field.fieldValue),
          remark: entry.remark || "Not Available",
        })),
      };
    })
  );

  const uniqueApprovedByIds = [...new Set(allApprovedByRaw.map(i => i.userId))];
  const users = await fetchUsers(uniqueApprovedByIds);

  const uniqueNames = [...new Set(users.map(e => e.name))];

  return { entriesItem: processed, approvedByNames: uniqueNames };
};

const scheduleReportGeneration = async (
  data,
  reportData,
  module,
  approvername,
  rangeStart,
  rangeEnd,
  startDateAndTime,
  endDateAndTime,
  reportNumber,
  approverId,
  kind
) => {
  try {
    const currentDate = DateTime.now();
    if (module === "checklist") {
      const [assetD, assigneesD, departmentsD, teamsD] = await Promise.all([
        fetchAsset(data.assetId || "Unknown"),
        fetchUsers(data.assignees || []),
        fetchDepartments(data.departments || []),
        fetchTeams(data.teams || []),
      ]);
      const assigneeNames = assigneesD.map(
        (assignee) => assignee?.name || "Unknown"
      );
      const departmentNames = departmentsD.map(
        (department) => department?.name || "Unknown"
      );
      const teamNames = teamsD.map((team) => team?.name || "Unknown");
      const dateStart = rangeStart.toFormat("yyyy-MM-dd");
      const dateEnd = rangeEnd.toFormat("yyyy-MM-dd");
      const dateRange = `${dateStart} - ${dateEnd}`;
      const checklist = await findOne(
        ChecklistModel,
        { _id: data.checklistId },
        {}
      );
      if (checklist) {
        const approver = checklist.scheduledReportDetails
          ? checklist.scheduledReportDetails.approver
            ? checklist.scheduledReportDetails.approver || ""
            : ""
          : "";
        const assetName = assetD
          ? assetD.generalDetails.name || "Unknown"
          : "Unknown";
        const checklistItem = generateChecklistItem(
          data,
          departmentNames,
          assigneeNames,
          teamNames,
          dateRange,
          assetName
        );
        const {entriesItem,approvedByNames} = await processEntries(reportData);
        const docFormat = "pdf";
        const checklistname = checklist.name
          ? checklist.name || "Unknown"
          : "Unknown";
        const recurr = data.scheduledReportDetails
          ? data.scheduledReportDetails.timePeriod || "day"
          : "day";
        if (docFormat.toLowerCase() === "pdf") {
          const { filePath, reportN } = await generatePDF(
            checklistItem,
            entriesItem,
            checklistname,
            approvername,
            recurr,            
          );
          if (filePath) {
            const file = await fileManager.uploadFileInternal(
              filePath,
              reportN
            );
            if (file) {
              await insertOne(ReportModel, {
                moduleName: module,
                moduleEntityId: data.checklistId,
                startDateAndTime,
                endDateAndTime,
                format: docFormat,
                documentId: file.id,
                createdBy: data.createdBy,
                reportCreatedAt: rangeEnd,
                status: "pendingForApproval",
                approver: approver,
              });
            }
          }
        } else {
          throw "Format is not supported";
        }
      }
    } else if (module === "logs") {
      const [assetD, assigneesD, departmentsD, teamsD, businessUnit, approvers, approvedBy] = await Promise.all([
        fetchAsset(data.assetId || "Unknown"),
        fetchUsers(data.assignees || []),
        fetchDepartments(data.departments || []),
        fetchTeams(data.teams || []),
        fetchBusinessUnit(data.businessUnit || ""),
        fetchUsers(data.approvers || []),
        fetchUsers(data.approvedBy || []),
      ]);
      const assigneeNames = assigneesD.map(
        (assignee) => assignee?.name || "Unknown"
      );
      const departmentNames = departmentsD.map(
        (department) => department?.name || "Unknown"
      );
      const approversName  = approvers.map(
        (approver) => approver?.name || "Unknown"
      );
      const approvedByName  = approvedBy.map(
        (approveBy) => approveBy?.name || "Unknown"
      );
      const teamNames = teamsD.map((team) => team?.name || "Unknown");
      const dateStart = rangeStart.toFormat("yyyy-MM-dd");
      const dateEnd = rangeEnd.toFormat("yyyy-MM-dd");
      const dateRange = `${dateStart} - ${dateEnd}`;
      const assetName = assetD
        ? assetD.generalDetails.name || "Unknown"
        : "Unknown";
      const logItem = generatelogItemScheduled(
        data,
        departmentNames,
        assigneeNames,
        teamNames,
        approversName,
        approvedByName,
        dateRange,
        assetName
      );
      const entries = [];
        // let fetchedEntries = await findAll(LogEntryModel, query, {});
        if (formulaApproach == formulaApproaches.PROCESS_AT_FETCH_TIME) {
          for (let i = 0; i < reportData.length; i++) {
            let entry = reportData[i];
            entry = await log_manager.evaluateTemplate(entry); // Call the evaluateTemplate function
            entries.push(entry);
          }
        } else {
          entries = reportData
        }
      const {entriesItem,approvedByNames} = await processEntries(entries);
      const docFormat = "pdf";
      const logName = data.name ? data.name || "Unknown" : "Unknown";
      const recurr = data.scheduledReportDetails
        ? data.scheduledReportDetails.timePeriod || "day"
        : "day";
      const frequency = data.scheduledReportDetails
        ? data.scheduledReportDetails.frequency || 1
        : 1;
      const createdBy = data.createdBy ? data.createdBy : "";
      if (docFormat.toLowerCase() === "pdf") {
        const { filePath, reportN } = await generatePDF(
          logItem,
          entriesItem,
          logName,
          approvername,
          "Automated",
          businessUnit,
          approvedByNames,
          frequency,
          recurr,
          reportNumber ? reportNumber : 1
        );
        if (filePath) {
          let log = data;
          const query = {
            entryCreatedAt: {
              $gte: rangeStart,
              $lte: rangeEnd,
            },
            logId:log.id
          };
          query.status = "overdue";
          let fetchedOverDueEntries = await findMany(LogEntryModel, query, 1, 5, { ["entryCreatedAt"]: -1 }, "desc");
          const constructedOverDueEntries = fetchedOverDueEntries.map((entry) => {
            return {
              entryRecurringId: entry.entryNumber,
              scheduledTime: entry.entryCreatedAt
            }
          })
          const fileContent = fs.readFileSync(filePath);
          //construct Filename by log name and concating current date with time in short
          const fileName = `${log.name}_${currentDate.toString().split('T')[0]}${currentDate.toString().split('T')[1].split('.')[0]}.pdf`
          const attatchments = [{ content: fileContent, filename: fileName, filePath:filePath }];
          if(process.env.SEND_EMAIL_ON_SCHEDULE_REPORT == "true" && process.env.SEND_EMAIL == "true"){
            const performanceMetricsTimersData = await calculatePerformanceMetrics(query)
          const constructedData = await constructLogReportTemplateData(approvername, "Scheduled", log.name, { start: rangeStart, end: rangeEnd }, currentDate.toString(), constructedOverDueEntries, [], performanceMetricsTimersData, attatchments)
          let approver = await findOne(User, { _id: approverId }, { _id: 0, name: 1, email: 1 });
          const emailNotificationRecipients = data.emailNotificationRecipients;
          const ccEmailNotificationRecipients = [];
          if (emailNotificationRecipients && emailNotificationRecipients.length > 0) {
            for (let i = 0; i < emailNotificationRecipients.length; i++) {
              let emailNotificationRecipientsUserObj = await findOne(User, { _id: emailNotificationRecipients[i] }, { _id: 0, name: 1, email: 1 });
              if (emailNotificationRecipientsUserObj) {
                ccEmailNotificationRecipients.push(emailNotificationRecipientsUserObj.email);
              }
            }
          }
          constructedData.cc=ccEmailNotificationRecipients
          
          await sendLogReportEmail([approver.email], `Log Report ${log.name}`, constructedData)
          }

          const file = await fileManager.uploadFileInternal(filePath, data.businessUnit, reportN);
          if (file) {
            const report = await insertOne(ReportModel, {
              moduleName: module,
              moduleEntityId: data.id,
              startDateAndTime,
              endDateAndTime,
              format: docFormat,
              documentId: file.id,
              createdBy: createdBy,
              reportCreatedAt: rangeEnd,
              status: "pendingForApproval",
              reportKind: kind,
              approver: approverId,
              reportNumber,
              reportName: reportN ? reportN : "Not Available",
              businessUnit:data.businessUnit,
            });
          }
        }
      } else {
        throw "Format is not supported";
      }
    }
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const getReportCount = async (userId, businessUnit) => {
  try {
    // Count total reports matching the userId and businessUnit
    const totalReport = await count(ReportModel, {
      $and: [
        {
          $or: [{ createdBy: userId }, { approver: userId }],
        },
        { businessUnit: businessUnit },
      ],
    });

    // Aggregation pipeline to get the count of reports by status
    const reportStatusAggregation = [
      {
        $match: {
          $and: [
            {
              $or: [{ createdBy: userId }, { approver: userId }],
            },
            {
              $or: [
                { status: "completed" },
                { status: "pendingForApproval" },
              ],
            },
            { businessUnit: businessUnit }, // Add businessUnit filter here
          ],
        },
      },
      {
        $group: {
          _id: null,
          completedChecklists: {
            $sum: {
              $cond: {
                if: { $eq: ["$status", "completed"] },
                then: 1,
                else: 0,
              },
            },
          },
          pendingForApproval: {
            $sum: {
              $cond: {
                if: { $eq: ["$status", "pendingForApproval"] },
                then: 1,
                else: 0,
              },
            },
          },
        },
      },
    ];

    const statusCounts = await aggregation(ReportModel, reportStatusAggregation);

    // Initialize completed and pending counts
    let completed;
    let pendingForApproval;
    if (statusCounts.length === 0) {
      completed = 0;
      pendingForApproval = 0;
    } else {
      completed = statusCounts[0].completedChecklists;
      pendingForApproval = statusCounts[0].pendingForApproval;
    }

    const result = {
      total: totalReport,
      completed,
      pendingForApproval,
    };

    // Return result or throw an error if null
    if (result) {
      return result;
    } else {
      throw "Failed to get status count for report";
    }
  } catch (error) {
    throw error;
  }
};

//start
//CR0002


// reportNumber stored as Number in DB → $regex fails on Number fields.
//         Fixed: match BOTH as string-regex AND as exact number.
//
//  status used RegExp objects inside $in → unreliable across drivers.
//         Fixed: use plain string array in $in.

const getAllReports = async (
  userId,
  page = 1,
  limit = 15,
  moduleName,      // route-level moduleName (may be null/undefined when filtering)
  allData,
  businessUnit,
  filterParams = {}  
) => {
  try {
    const pageNum  = parseInt(page,  10) || 1;
    const limitNum = parseInt(limit, 10) || 15;
    const skip     = (pageNum - 1) * limitNum;

    // ── STAGE 1: ReportModel-level match (fast, indexed, no joins needed) ────
    const reportMatch = { $and: [] };

    // Always scope to the requesting user
    reportMatch.$and.push({ $or: [{ createdBy: userId }, { approver: userId }] });

    if (businessUnit) {
      reportMatch.$and.push({ businessUnit });
    }

    // moduleName can come from route param OR from filter panel.
    const activeModuleName = moduleName || filterParams.moduleName;
    if (activeModuleName) {
      reportMatch.$and.push({
        moduleName: { $regex: activeModuleName.trim(), $options: "i" }
      });
    }

    // reportNumber — : stored as Number in DB → $regex fails.
    // Match as both string-regex (for string storage) AND exact Number (for numeric storage).
    if (filterParams.reportNumber !== undefined && filterParams.reportNumber !== null && filterParams.reportNumber !== "") {
      const rn = String(filterParams.reportNumber).trim();
      const rnNum = Number(rn);
      reportMatch.$and.push({
        $or: [
          { reportNumber: { $regex: rn, $options: "i" } },   // if stored as String
          ...(isNaN(rnNum) ? [] : [{ reportNumber: rnNum }]) // if stored as Number
        ]
      });
    }

    // reportName — string field, regex is correct
    if (filterParams.reportName !== undefined && filterParams.reportName !== "") {
      reportMatch.$and.push({
        reportName: { $regex: filterParams.reportName.trim(), $options: "i" }
      });
    }

    // status — : was using RegExp objects inside $in (unreliable).
    // Status values are exact known strings ("completed", "pendingForApproval"), use plain $in.
    if (filterParams.status !== undefined && filterParams.status !== "") {
      const statusMap = {
        "pending for approval": "pendingForApproval",
        "in progress": "inProgress",
        "completed": "completed"
      };

      const statuses = String(filterParams.status)
        .split(",")
        .map(s => s.trim().toLowerCase())
        .map(s => statusMap[s] || s.replace(/\s+/g, "")); // fallback remove spaces

      if (statuses.length > 0) {
        reportMatch.$and.push({ status: { $in: statuses } });
      }
    }

    const hasEntityFilters = !!(
      (filterParams.moduleEntityNumber !== undefined && filterParams.moduleEntityNumber !== "") ||
      (filterParams.asset              !== undefined && filterParams.asset              !== "") ||
      (filterParams.departments        !== undefined && filterParams.departments        !== "") ||
      (filterParams.assignees          !== undefined && filterParams.assignees          !== "")
    );

    // ── Sub-pipeline for Log entity ───
    // Injected inside $lookup so all joins happen inside MongoDB in one round-trip.
    const logSubPipeline = [
      {
        $match: {
          $expr: {
            $and: [
              { $eq: ["$$mod", "logs"] },
              { $eq: ["$_id", "$$eid"] }
            ]
          }
        }
      },
      {
        $addFields: {
          _assetOid: { $convert: { input: "$assetId", to: "objectId", onError: null, onNull: null } },
          _deptOids: {
            $map: {
              input: { $ifNull: ["$departments", []] }, as: "d",
              in: { $convert: { input: "$$d", to: "objectId", onError: null, onNull: null } }
            }
          },
          _asnOids: {
            $map: {
              input: { $ifNull: ["$assignees", []] }, as: "a",
              in: { $convert: { input: "$$a", to: "objectId", onError: null, onNull: null } }
            }
          }
        }
      },
      { $lookup: { from: "assets",      localField: "_assetOid", foreignField: "_id", as: "_assetDocs" } },
      { $lookup: { from: "departments", localField: "_deptOids", foreignField: "_id", as: "_deptDocs"  } },
      { $lookup: { from: "users",       localField: "_asnOids",  foreignField: "_id", as: "_asnDocs"   } },
      { $unwind:  { path: "$_assetDocs", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          name:               1,
          documentNumber:     1,
          // BUG 2 echo: logNumber may also be a Number; $toString makes regex work on it
          moduleEntityNumber: { $toString: { $ifNull: ["$logNumber", ""] } },
          asset:              { $ifNull: ["$_assetDocs.generalDetails.name", ""] },
          departments:        "$_deptDocs.name",   // array of strings
          assignees:          "$_asnDocs.name",    // array of strings
          moduleEntityStatus: "$status"
        }
      }
    ];

    const checklistSubPipeline = [
      {
        $match: {
          $expr: {
            $and: [
              { $eq: ["$$mod", "checklist"] },
              { $eq: ["$_id", "$$eid"] }
            ]
          }
        }
      },
      {
        $addFields: {
          _assetOid: { $convert: { input: "$assetId", to: "objectId", onError: null, onNull: null } },
          _deptOids: {
            $map: {
              input: { $ifNull: ["$departments", []] }, as: "d",
              in: { $convert: { input: "$$d", to: "objectId", onError: null, onNull: null } }
            }
          },
          _asnOids: {
            $map: {
              input: { $ifNull: ["$assignees", []] }, as: "a",
              in: { $convert: { input: "$$a", to: "objectId", onError: null, onNull: null } }
            }
          }
        }
      },
      { $lookup: { from: "assets",      localField: "_assetOid", foreignField: "_id", as: "_assetDocs" } },
      { $lookup: { from: "departments", localField: "_deptOids", foreignField: "_id", as: "_deptDocs"  } },
      { $lookup: { from: "users",       localField: "_asnOids",  foreignField: "_id", as: "_asnDocs"   } },
      { $unwind:  { path: "$_assetDocs", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          name:               1,
          documentNumber:     1,
          moduleEntityNumber: { $toString: { $ifNull: ["$checklistNumber", ""] } },
          asset:              { $ifNull: ["$_assetDocs.generalDetails.name", ""] },
          departments:        "$_deptDocs.name",
          assignees:          "$_asnDocs.name",
          moduleEntityStatus: "$status"
        }
      }
    ];

    // ── Base pipeline (shared between allData and paginated branches) ─────────
    const basePipeline = [
      { $match: reportMatch },
      {
        // Convert stored moduleEntityId string → ObjectId for $lookup join key
        $addFields: {
          _entityOid: {
            $convert: { input: "$moduleEntityId", to: "objectId", onError: null, onNull: null }
          }
        }
      },
      // Join log entity (sub-pipeline only executes when moduleName === "logs")
      {
        $lookup: {
          from: "logs",
          let:  { eid: "$_entityOid", mod: "$moduleName" },
          pipeline: logSubPipeline,
          as: "_logEntity"
        }
      },
      // Join checklist entity (sub-pipeline only executes when moduleName === "checklist")
      {
        $lookup: {
          from: "checklists",
          let:  { eid: "$_entityOid", mod: "$moduleName" },
          pipeline: checklistSubPipeline,
          as: "_checklistEntity"
        }
      },
      // BUG 6 FIX: unify BOTH into moduleEntityDetails so frontend manager can
      // always read report?.moduleEntityDetails?.* regardless of module type.
      {
        $addFields: {
          moduleEntityDetails: {
            $ifNull: [
              { $arrayElemAt: ["$_logEntity",       0] },
              { $arrayElemAt: ["$_checklistEntity", 0] }
            ]
          }
        }
      }
    ];

    // BUG 4 FIX: entity-level $match runs AFTER the $lookup stages above,
    // so resolved names / numbers are available for filtering.
    if (hasEntityFilters) {
      const entityMatch = {};

      if (filterParams.moduleEntityNumber !== undefined && filterParams.moduleEntityNumber !== "") {
        // moduleEntityNumber was projected as $toString so regex works on it
        entityMatch["moduleEntityDetails.moduleEntityNumber"] = {
          $regex: String(filterParams.moduleEntityNumber).trim(), $options: "i"
        };
      }
      if (filterParams.asset !== undefined && filterParams.asset !== "") {
        entityMatch["moduleEntityDetails.asset"] = {
          $regex: filterParams.asset.trim(), $options: "i"
        };
      }
      if (filterParams.departments !== undefined && filterParams.departments !== "") {
        // departments is an array of strings in the projected doc.
        // MongoDB $regex on an array field matches if ANY element matches.
        entityMatch["moduleEntityDetails.departments"] = {
          $regex: filterParams.departments.trim(), $options: "i"
        };
      }
      if (filterParams.assignees !== undefined && filterParams.assignees !== "") {
        entityMatch["moduleEntityDetails.assignees"] = {
          $regex: filterParams.assignees.trim(), $options: "i"
        };
      }

      basePipeline.push({ $match: entityMatch });
    }

    // ── $project to clean up internal pipeline fields ─────
    const cleanProject = {
      $project: {
        _id: 1, moduleName: 1, moduleEntityId: 1, format: 1, documentId: 1,
        createdBy: 1, reportCreatedAt: 1, status: 1, approver: 1,
        reportNumber: 1, reportName: 1,
        moduleEntityDetails: 1
      }
    };

    // ── Shape helper — builds the { reportDetails, moduleEntityDetails } object
    // that the frontend manager (reports-list-managers.js) expects ───
    const formatDoc = (doc) => ({
      reportDetails: {
        _id:             doc._id,
        moduleName:      doc.moduleName,
        moduleEntityId:  doc.moduleEntityId,
        format:          doc.format,
        documentId:      doc.documentId,
        createdBy:       doc.createdBy,
        reportCreatedAt: doc.reportCreatedAt,
        status:          doc.status,
        approver:        doc.approver,
        reportNumber:    doc.reportNumber,
        reportName:      doc.reportName
      },
      // BUG 6 FIX: was checklistDetails for checklist module — now always moduleEntityDetails
      moduleEntityDetails: doc.moduleEntityDetails || null
    });

    // ── allData branch ────
    if (allData === true || allData === "true") {
      const allDataPipeline = [
        ...basePipeline,
        { $sort: { reportCreatedAt: -1 } },
        cleanProject
      ];

      const allResults = await aggregation(ReportModel, allDataPipeline);
      if (!allResults || allResults.length === 0) {
        return { data: [] };
      }
      return {
        currentPage:    1,
        totalPageCount: 1,
        totalDataCount: allResults.length,
        data:           allResults.map(formatDoc)
      };
    }

    // ── Paginated branch — $facet gets count + page in ONE MongoDB round-trip ──
    const paginatedPipeline = [
      ...basePipeline,
      {
        $facet: {
          metadata: [{ $count: "total" }],
          data: [
            { $sort:  { reportCreatedAt: -1 } },
            { $skip:  skip },
            { $limit: limitNum },
            cleanProject
          ]
        }
      }
    ];

    const facetResult = await aggregation(ReportModel, paginatedPipeline);
    const total   = facetResult?.[0]?.metadata?.[0]?.total ?? 0;
    const rawData = facetResult?.[0]?.data ?? [];

    if (total === 0) {
      return { data: [] };
    }

    return {
      currentPage:    pageNum,
      totalPageCount: Math.ceil(total / limitNum),
      totalDataCount: total,
      data:           rawData.map(formatDoc)
    };
  } catch (error) {
    console.log(error);
    throw error;
  }
};

//End
const convertUTCToISTTime = (utcDate) => {
  const istDate = utcDate.toLocaleString("en-IN", {
  timeZone: "Asia/Kolkata",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false
})
return istDate;
};


const generateWorkOrderItem = (
  workorderObj,
  departmentNames,
  assigneeNames,
  teamNames,
  createdByName,
  estimationHours,
  dateRange,
  assetName,
  actualDurationHours,
  localTeams
) => {
  return [
    {
      leftSide: {
        key: "WorkOrder Name",
        value: workorderObj.name || "Not Available",
      },
      rightSide: { key: "Date Range", value: dateRange },
    },
    {
      leftSide: {
        key: "WorkOrder Number",
        value: workorderObj.number || "Not Available",
      },
      rightSide: {
        key: "Asset Name",
        value: assetName || "Not Available",
      },
    },
    {
      leftSide: {
        key: "Description",
        value: workorderObj.description || "Not Available",
      },
      rightSide: {
        key: "Department",
        value: departmentNames.join(", ") || "Not Available",
      },
    },
    {
      leftSide: {
        key: "Assignee",
        value: assigneeNames.join(", ") || "Not Available",
      },
      rightSide: {
        key: "Teams",
        value: teamNames.join(", ") || "Not Available",
      },
    },
    {
      leftSide: {
        key: "Estimation Hours",
        value: estimationHours || "Not Available",
      },
      rightSide: {
        key: "Local Teams",
        value: localTeams.join(", ") || "Not Available",
      }, 
    },
    {
      leftSide: {
        key: "Priority",
        value: workorderObj.priority || "Not Available",
      },
      rightSide: {
        key: "Created On",
        value: convertUTCToISTTime(workorderObj.createdAt) || "Not Available",
      }, 
    },
    {
      leftSide: {
        key: "Actual Hours",
        value: actualDurationHours || "Not Available",
      },
      rightSide: {
        key: "Maintenance Scheduled",
        value: workorderObj.isMaintenanceScheduled ? "True" : "False",
      }, 
    },
  ];
};


const generatelogItem = (
  log,
  departmentNames,
  assigneeNames,
  teamNames,
  approversName,
  approvedByName,
  dateRange,
  assetName
) => {
  return [
    {
      leftSide: {
        key: "Log Name",
        value: log.name || "Not Available",
      },
      rightSide: { key: "Date Range", value: dateRange },
    },
    {
      leftSide: {
        key: "Document Number",
        value: log.documentNumber || "Not Available",
      },
      rightSide: {
        key: "Asset Name",
        value: assetName || "Not Available",
      },
    },
    {
      leftSide: {
        key: "Description",
        value: log.description || "Not Available",
      },
      rightSide: {
        key: "Departments",
        value: departmentNames.join(", ") || "Not Available",
      },
    },
    {
      leftSide: {
        key: "Assignees",
        value: assigneeNames.join(", ") || "Not Available",
      },
      rightSide: {
        key: "Teams",
        value: teamNames.join(", ") || "Not Available",
      },
    },
    {
      leftSide: {
        key: "Approvers",
        value: approversName.join(", ") || "Not Available",
      },
      rightSide: {
        key: "Report Type",
        value: "Manual",
      },
    },
  ];
};

const generatelogItemScheduled = (
  log,
  departmentNames,
  assigneeNames,
  teamNames,
  approversName,
  approvedByName,
  dateRange,
  assetName
) => {
  return [
    {
      leftSide: {
        key: "Log Name",
        value: log.name || "Not Available",
      },
      rightSide: { key: "Date Range", value: dateRange },
    },
    {
      leftSide: {
        key: "Document Number",
        value: log.documentNumber || "Not Available",
      },
      rightSide: {
        key: "Asset Name",
        value: assetName || "Not Available",
      },
    },
    {
      leftSide: {
        key: "Description",
        value: log.description || "Not Available",
      },
      rightSide: {
        key: "Departments",
        value: departmentNames.join(", ") || "Not Available",
      },
    },
    {
      leftSide: {
        key: "Assignees",
        value: assigneeNames.join(", ") || "Not Available",
      },
      rightSide: {
        key: "Teams",
        value: teamNames.join(", ") || "Not Available",
      },
    },
    {
      leftSide: {
        key: "Approvers",
        value: approversName.join(", ") || "Not Available",
      },
      rightSide: {
        key: "Report Type",
        value: "Scheduled",
      },
    },
  ];
};

const convertUTCToIST = (utcString) => {
  // Create a Date object from the UTC string
  const utcDate = new Date(utcString);
  // Convert to IST by adding 5 hours and 30 minutes
  const istOffset = 5 * 60 * 60 * 1000 + 30 * 60 * 1000; // 5 hours 30 minutes in milliseconds
  const istDate = new Date(utcDate.getTime() + istOffset);
  // Format the date to ISO 8601 without time zone information
  return istDate.toISOString().slice(0, 19);
};

const reportDetails = async (reportId, userId, req) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(reportId)) {
      throw "Please added correct report id";
    }
    const report = await findOne(ReportModel, { _id: reportId }, {});
    if (!report) {
      throw "Please added correct report id";
    }
    const moduleEntityId = report.moduleEntityId;
    const moduleName = report.moduleName;
    const reportCreatedAt = report.reportCreatedAt
      ? report.reportCreatedAt
      : null;
    const reportStatus = report.status ? report.status : "Not available";
    let moduleEntityDetails;
    let entityStruture = {};
    if (moduleName === "logs" && moduleEntityId) {
      const logAgg = [
        {
          $match: {
            _id: new ObjectId(moduleEntityId),
          },
        },
        {
          $addFields: {
            assetId: { $toObjectId: "$assetId" },
            departments: {
              $map: {
                input: "$departments",
                as: "dept",
                in: { $toObjectId: "$$dept" },
              },
            },
            assignees: {
              $map: {
                input: "$assignees",
                as: "assignee",
                in: { $toObjectId: "$$assignee" },
              },
            },
            teams: {
              $map: {
                input: "$teams",
                as: "team",
                in: { $toObjectId: "$$team" },
              },
            },
            updatedBy: {
              $convert: {
                input: "$updatedBy",
                to: "objectId",
                onError: null,
                onNull: null,
              },
            },
            approver: {
              $convert: {
                input: "$scheduledReportDetails.approver",
                to: "objectId",
                onError: null,
                onNull: null,
              },
            },
            createdBy: {
              $convert: {
                input: "$createdBy",
                to: "objectId",
                onError: null,
                onNull: null,
              },
            },
          },
        },
        {
          $lookup: {
            from: "assets",
            localField: "assetId",
            foreignField: "_id",
            as: "assetDetails",
          },
        },
        {
          $unwind: {
            path: "$assetDetails",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: "departments",
            localField: "departments",
            foreignField: "_id",
            as: "departmentDetails",
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "assignees",
            foreignField: "_id",
            as: "assigneeDetails",
          },
        },
        {
          $lookup: {
            from: "teams",
            localField: "teams",
            foreignField: "_id",
            as: "teamDetails",
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "updatedBy",
            foreignField: "_id",
            as: "updatedDetails",
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "createdBy",
            foreignField: "_id",
            as: "createdDetails",
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "approver",
            foreignField: "_id",
            as: "approverDetails",
          },
        },
        {
          $addFields: {
            updatedBy: {
              $ifNull: [
                { $arrayElemAt: ["$updatedDetails.name", 0] },
                "Not Available",
              ],
            },
          },
        },
        {
          $addFields: {
            approverDetails: {
              $ifNull: [
                { $arrayElemAt: ["$approverDetails.name", 0] },
                "Not Available",
              ],
            },
          },
        },
        {
          $addFields: {
            createdBy: {
              $ifNull: [
                { $arrayElemAt: ["$createdDetails.name", 0] },
                "Not Available",
              ],
            },
          },
        },
        {
          $project: {
            _id: 1,
            logNumber: 1,
            name: 1,
            documentNumber: 1,
            isRecurrence: 1,
            timePeriod: 1,
            asset: "$assetDetails.generalDetails.name",
            departments: "$departmentDetails.name",
            assignees: "$assigneeDetails.name",
            createdAt: 1,
            updatedAt: 1,
            logStatus: "$status",
            isActive: 1,
            startDateAndTime: 1,
            endDateAndTime: 1,
            recurrenceDetails: 1,
            description: 1,
            teams: "$teamDetails.name",
            updatedBy: "$updatedBy",
            scheduledReportDetails: 1,
            approverName: "$approverDetails",
            approverId: "$scheduledReportDetails.approver",
            createdBy: "$createdBy",
          },
        },
      ];
      moduleEntityDetails = await aggregation(LogModel, logAgg);
      if (moduleEntityDetails.length > 0) {
        const structure = await findOne(
          LogStructureModel,
          { logId: moduleEntityId, isActive: true },
          { _id: 1, images: 1, note: 1 }
        );
        if (structure) {
          entityStruture["id"] = structure._id ? structure._id : "";
          entityStruture["images"] = structure.images ? structure.images : null;
          entityStruture["note"] = structure.note ? structure.note : null;
        }
      } else {
        throw "Please provide valid logId.";
      }
    }
    const documentId = report.documentId;
    const item = await fileManager.getFile(
      documentId,
      "stream",
      req.businessUnit,
      req.get("host"),
      req.protocol
    );
    let fileDetails;
    if (item){
      fileDetails = {
        _id: item.id.toString(),
        name: item.name || "",
        extension: item.extension || "",
        contentType: item.contentType || "",
        url: item.url || "",
        size: item.size || "",
        moduleName: "logs",
        moduleId: "",
      };
    }
    else{
      fileDetails=[];
    }
    const result = {
      moduleEntityDetails: moduleEntityDetails[0] || [],
      fileDetails: fileDetails || [],
      entityStruture: entityStruture ? entityStruture : null,
      reportDetails: {
        reportStatus,
        reportCreatedAt,
        reportId,
      },
    };
    return result;
  } catch (error) {
    console.log("error:", error);
    throw error;
  }
};

const approveReport = async (userId, reportId, reqData) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(reportId)) {
      throw "Please added correct report id";
    }
    const query = { _id: reportId, approver: userId };
    const report = await findOne(ReportModel, query, {
      _id: 0,
      comments: 1,
      createdBy: 1,
      logId: 1,
      operatorIds: 1,
      documentId: 1,
    });
    if (!report) {
      return {
        success: false,
        message:
          "You do not have the necessary access rights to perform this update.",
      };
    }
    const status = reqData.status;
    if (status === "revised") {
      const newComment = reqData ? reqData.comment || "" : "";
      if (!newComment) {
        return {
          success: false,
          message: "Please add comment",
        };
      }
      let comments = report ? report.comments || [] : [];
      let prevInd;
      if (comments.length > 0) {
        prevInd = comments[comments.length - 1].index;
        const newC = {
          index: prevInd + 1,
          comment: newComment,
          userId: userId,
          addedAt: Date.now(),
        };
        comments.push(newC);
        const update = { status,                      // Assuming status is coming from some other context
          comments,                    // Assuming comments is defined elsewhere
          documentId: null,             // Set documentId to actual null, not "null" (string)
          $push: {                      // Use $push to append the documentId string to the history array
            history: report.documentId  // Assuming report.documentId is a string
          }};
        const updated = await updateOne(ReportModel, query, update);
        updateFlag = updated ? updated.acknowledged || false : false;
        return {
          success: true,
          status: "Revised",
        };
      } else {
        const newC = {
          index: 1,
          comment: newComment,
          userId: userId,
          addedAt: Date.now(),
        };
        comments.push(newC);
        const update = { status,                      
          comments,                    
          documentId: null,             
          $push: {                      
            history: report.documentId  
          }};
        const updated = await updateOne(ReportModel, query, update);
        updateFlag = updated ? updated.acknowledged || false : false;
        return {
          success: true,
          status: "Revised",
        };
      }
    } else if (status === "approved" || status === "completed") {
      const update = { status: "completed" };
      const updated = await updateOne(ReportModel, query, update);
      dateFlag = updated ? updated.acknowledged || false : false;
      return {
        success: true,
        status: "Approved",
      };
    }
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const getAllComments = async (userId, reportId, page, limit) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(reportId)) {
      throw "Please added correct report id";
    }
    const report = await findOne(
      ReportModel,
      { _id: reportId, $or: [{ approver: userId }, { createdBy: userId }] },
      { comments: 1 }
    );
    const commentsDetails = report?.comments ?? [];
    if (commentsDetails.length > 0) {
      const notesD = await Promise.all(
        commentsDetails.map(async (item) => {
          const uploadedBy = await findOne(
            User,
            { _id: item.userId },
            { _id: 0, name: 1 }
          );
          return {
            name: uploadedBy.name ? uploadedBy.name : "Undefined",
            addedAt: item.addedAt,
            comment: item.comment,
            profilePhoto: "",
          };
        })
      );
      return notesD;
    } else {
      return [];
    }
  } catch (error) {
    throw error;
  }
};

const postComment = async (userId, reportId, reqData) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(reportId)) {
      throw "Please added correct report id";
    }
    if (!reqData) {
      throw "Please add valid comment";
    }
    const query = {
      _id: reportId,
      $or: [{ approver: userId }, { createdBy: userId }],
    };
    const report = await findOne(ReportModel, query, {
      _id: 0,
      comments: 1,
      createdBy: 1,
      logId: 1,
      operatorIds: 1,
    });
    if (!report) {
      return {
        success: false,
        message:
          "You do not have the necessary access rights to perform this update.",
      };
    }
    const newComment = reqData ? reqData.comment || "" : "";
    let comments = report ? report.comments || [] : [];
    let prevInd;
    if (comments.length > 0) {
      prevInd = comments[comments.length - 1].index;
      const newC = {
        index: prevInd + 1,
        comment: newComment,
        userId: userId,
        addedAt: Date.now(),
      };
      comments.push(newC);
      const update = { comments: comments };
      const updated = await updateOne(ReportModel, query, update);
      updateFlag = updated ? updated.acknowledged || false : false;
      return {
        success: true,
        status: "Comment added",
      };
    } else {
      const newC = {
        index: 1,
        comment: newComment,
        userId: userId,
        addedAt: Date.now(),
      };
      comments.push(newC);
      const update = { comments: comments };
      const updated = await updateOne(ReportModel, query, update);
      updateFlag = updated ? updated.acknowledged || false : false;
      return {
        success: true,
        status: "Comment added",
      };
    }
  } catch (error) {
    throw error;
  }
};

const fetchHistory = async (reqData, reportId) => {
  try{
    const queryObj = queryBuilder(reqData, reportId);
    const fieldMapping = fieldMappings();
    const countData = await count(ReportModel, queryObj.query);

    // Handle cases where either page or limit is not provided
    if (queryObj.page === null && queryObj.limit === null) {
      queryObj.limit = countData || 1; // Set limit to the total number of records if no limit is provided
      queryObj.page = 1; // Set page to 1 if no page is provided
    } else if (queryObj.page === null) {
      queryObj.page = 1; // Set default page to 1 if not provided
    } else if (queryObj.limit === null) {
      queryObj.limit = countData; // Set limit to the total number of records if no limit is provided
    }

    if (queryObj.limit === 0 && queryObj.page > 1) {
      return paginationHandler.paginationResObj(
        queryObj.page,
        1,
        countData,
        []
      );
    }

    const populateFields = ["history"];

    const selectFields = [
      "history",
    ];

    let data = await fetchAllAndPopulate(
      ReportModel,
      queryObj.query,
      fieldMapping,
      queryObj.limit,
      queryObj.page,
      queryObj.sortOrder,
      populateFields,
      selectFields
    );
    if (data) {
      data = data.map((result) => {
        const { _id, ...rest } = result;
        return { ...rest, id: _id };
      });
    }

    const totalPages =
      countData === 0
        ? 0
        : queryObj.limit === 0
        ? 1
        : Math.ceil(countData / queryObj.limit);

    return paginationHandler.paginationResObj(
      queryObj.page,
      totalPages,
      countData,
      data
    );
    
  }catch(error){
    throw error;
  }
}

const checkExistingReport = async (reportId) => {
  try{
    const existingReport = await findOne(ReportModel,{_id:reportId})
    return existingReport;
  }catch(error){
    throw error;
  }
}

const regenerateReport = async (reportId, userId, reqHost, reqProtocol) => {
  try {
    const existingReport = await checkExistingReport(reportId);
      const data = {
          moduleName: existingReport.moduleName,
          moduleEntityName: existingReport.moduleEntityName,
          moduleEntityId: existingReport.moduleEntityId,
          startDateAndTime: existingReport.startDateAndTime.toString(),
          endDateAndTime: new Date().toString(),
          format: existingReport.format
      };
    if(existingReport.moduleName === "logs"){
      existingReport.moduleEntityName = await getNameById(existingReport.moduleEntityId, LogModel);
    }
    else if(existingReport.moduleName === "checklist"){
      existingReport.moduleEntityName = await getNameById(existingReport.moduleEntityId, ChecklistModel);
    }
    else{
      existingReport.moduleEntityName = ""
    } 
    let user = await findOne(User, { _id: userId }, { _id: 0, name: 1, email: 1 });
    user.name = user ? user.name || "Unknown" : "Unknown";
    const report = await generateReport(
      data,
      user,
      reqHost,
      reqProtocol
    );
    const updated = await updateOne(ReportModel, { _id: reportId }, { documentId: report.docId, status:"pendingForApproval"})
  } catch (error) {
    throw error;
  }
};

const getNameById = async (id, model) => {
  try{
    const document = await findOne(model,{_id:id})
    if(document){
      return document.name
    }
    else{
      throw "Report regeneration failed! Log not present."
    }
  }catch(error){
    throw error
  }
}
const generateExcelComplianceReport=async({ startDate, endDate }) =>{

  // 1. Fetch logs in the date-range
  const logs = await LogModel.find({
    createdAt: {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    },
    isActive: true
  }).select('_id name logNumber description status departments teams assignees createdAt updatedAt');

  const logIds = logs.map(log => log._id.toString());

  // Details map for summary/enrichment
  const logDetailsMap = {};
  logs.forEach(log => {
    logDetailsMap[log._id.toString()] = {
      name: log.name,
      logNumber: log.logNumber,
      description: log.description,
      status: log.status,
      departments: Array.isArray(log.departments) ? log.departments.join(', ') : log.departments,
      teams: Array.isArray(log.teams) ? log.teams.join(', ') : log.teams,
      assignees: Array.isArray(log.assignees) ? log.assignees.join(', ') : log.assignees,
      createdAt: log.createdAt,
      updatedAt: log.updatedAt
    };
  });

  // 2. Fetch all log entries for those logs in the date range
  const entries = await LogEntryModel.find({
    logId: { $in: logIds },
    entryCreatedAt: {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    }
  }).select('logId status entryEnteredAt approvedBy entryCreatedAt entryCompletedAt createdBy enteredBy');

  // Group entries by logId
  const entriesByLog = {};
  entries.forEach(entry => {
    const logId = entry.logId.toString();
    if (!entriesByLog[logId]) {
      entriesByLog[logId] = {
        totalGenerated: 0,
        totalEntered: 0,
        totalApproved: 0,
        entries: []
      };
    }
    entriesByLog[logId].totalGenerated++;
    entriesByLog[logId].entries.push(entry);
    if (entry.entryEnteredAt) entriesByLog[logId].totalEntered++;
    if (entry.status === 'completed' || (entry.approvedBy && entry.approvedBy.length > 0)) entriesByLog[logId].totalApproved++;
  });

  // 3. Build summary/detailed sheets
  const summaryData = [];
  const detailedData = [];
  logIds.forEach((logId, index) => {
    const logDetails = logDetailsMap[logId];
    const logData = entriesByLog[logId] || { totalGenerated: 0, totalEntered: 0, totalApproved: 0, entries: [] };
    const entryCompletion = logData.totalGenerated > 0
      ? ((logData.totalEntered / logData.totalGenerated) * 100).toFixed(2)
      : "0.00";
    const approvalPercent = logData.totalGenerated > 0
      ? ((logData.totalApproved / logData.totalGenerated) * 100).toFixed(2)
      : "0.00";
    summaryData.push({
      'S.No': index + 1,
      // 'Log ID': logId,
      // 'Log Number': logDetails?.logNumber || 'N/A',
      'Log Name': logDetails?.name || 'N/A',
      // 'Description': logDetails?.description || 'N/A',
      // 'Status': logDetails?.status || 'N/A',
      // 'Departments': logDetails?.departments || 'N/A',
      // 'Teams': logDetails?.teams || 'N/A',
      // 'Assignees': logDetails?.assignees || 'N/A',
      // 'Created Date': logDetails?.createdAt ? new Date(logDetails.createdAt).toLocaleDateString() : 'N/A',
      // 'Updated Date': logDetails?.updatedAt ? new Date(logDetails.updatedAt).toLocaleDateString() : 'N/A',
      'Logs Entry Generated': logData.totalGenerated,
      'Logs Entry Entered': logData.totalEntered,
      // 'Logs Entry Approved': logData.totalApproved,
      '% of Entry Completion': `${entryCompletion}%`,
      // '% of Entry Approval': `${approvalPercent}%`
    });
    if (logData.entries.length > 0) {
      logData.entries.forEach((entry, eIdx) => {
        detailedData.push({
          'S.No': `${index + 1}.${eIdx + 1}`,
          'Log ID': logId,
          'Log Number': logDetails?.logNumber || 'N/A',
          'Log Name': logDetails?.name || 'N/A',
          'Entry Status': entry.status || 'N/A',
          'Entry Created Date': entry.entryCreatedAt ? new Date(entry.entryCreatedAt).toLocaleDateString() : 'N/A',
          'Entry Entered Date': entry.entryEnteredAt ? new Date(entry.entryEnteredAt).toLocaleDateString() : 'Not Entered',
          'Entry Completed Date': entry.entryCompletedAt ? new Date(entry.entryCompletedAt).toLocaleDateString() : 'Not Completed',
          'Created By': entry.createdBy || 'N/A',
          'Entered By': entry.enteredBy || 'N/A',
          'Approved By': Array.isArray(entry.approvedBy) && entry.approvedBy.length > 0 ? entry.approvedBy.join(', ') : 'Not Approved',
          'Is Entered': entry.entryEnteredAt ? 'Yes' : 'No',
          'Is Approved': (entry.status === 'completed' || (entry.approvedBy && entry.approvedBy.length > 0)) ? 'Yes' : 'No'
        });
      });
    } else {
      detailedData.push({
        'S.No': `${index + 1}.0`,
        'Log ID': logId,
        'Log Number': logDetails?.logNumber || 'N/A',
        'Log Name': logDetails?.name || 'N/A',
        'Entry Status': 'No Entries',
        'Entry Created Date': 'N/A',
        'Entry Entered Date': 'N/A',
        'Entry Completed Date': 'N/A',
        'Created By': 'N/A',
        'Entered By': 'N/A',
        'Approved By': 'N/A',
        'Is Entered': 'No',
        'Is Approved': 'No'
      });
    }
  });

  // --- Ensure at least headers exist if no data ---
const summaryHeaders = [
  'S.No', 'Log Name', 'Logs Entry Generated', 'Logs Entry Entered', '% of Entry Completion'
];

const detailedHeaders = [
  'S.No', 'Log ID', 'Log Number', 'Log Name', 'Entry Status',
  'Entry Created Date', 'Entry Entered Date', 'Entry Completed Date',
  'Created By', 'Entered By', 'Approved By', 'Is Entered', 'Is Approved'
];

if (summaryData.length === 0) {
  const emptySummaryRow = {};
  summaryHeaders.forEach(header => emptySummaryRow[header] = '');
  summaryData.push(emptySummaryRow);
}

if (detailedData.length === 0) {
  const emptyDetailedRow = {};
  detailedHeaders.forEach(header => emptyDetailedRow[header] = '');
  detailedData.push(emptyDetailedRow);
}
// --- End of edit ---
  // Excel: buffer only
  const workbook = XLSX.utils.book_new();
  const summaryWorksheet = XLSX.utils.json_to_sheet(summaryData);
  const detailedWorksheet = XLSX.utils.json_to_sheet(detailedData);
  summaryWorksheet['!cols'] = [
    {wch: 5}, {wch: 25}, {wch:12}, {wch:30},{wch:40}, {wch:12}, {wch:15},{wch:15},{wch:15},{wch:14},{wch:14}, {wch:13},{wch:13},{wch:13},{wch:18},{wch:18}
  ];
  detailedWorksheet['!cols'] = [
    {wch: 8}, {wch:25},{wch:12},{wch:30},{wch:15},{wch:15},{wch:15},{wch:15},{wch:15},{wch:15},{wch:20},{wch:10},{wch:10}
  ];
  XLSX.utils.book_append_sheet(workbook, summaryWorksheet, 'Summary Report');
  XLSX.utils.book_append_sheet(workbook, detailedWorksheet, 'Detailed Entries');
  const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });
  return buffer;
}


module.exports = {
  moduleData,
  reportCreation,
  scheduleReportGeneration,
  getReportCount,
  getAllReports,
  reportDetails,
  approveReport,
  getAllComments,
  postComment,
  fetchHistory,
  checkExistingReport,
  regenerateReport,
  generateReport,
  entryReportCreation,
  generateExcelComplianceReport 
};

function fieldMappings() {
  return {
    history: {
      localField: "history",
      collection: `files`,
      fieldsToInclude: [ "_id",
        "name",
        "extension",
        "contentType",
        "size",
        "storageLocation",
        "moduleName",
        "moduleId"], // Example fields to include
    },
    approver: {
      localField: "approver",
      collection: "users",
      fieldsToInclude: ["name", "email", "id"], // Example fields to include
    },
    createdBy: {
      localField: "createdBy",
      collection: "users",
      fieldsToInclude: ["name", "email", "id"], // Example fields to include
    },
  };
}

function queryBuilder(reqData, reportId) {
  const query = {
    ...(reqData.name && {
      name: { $regex: reqData.name, $options: "i" },
    }),
    ...(reportId && {
      _id: new mongoose.Types.ObjectId(reportId),
    }),
    // ...(reqData.department && {
    // 	"departments": new mongoose.Types.ObjectId(reqData.department)
    // }),
    // ...(reqData.createdAt && { createdAt: req.createdAt }),
    // ...(reqData.updatedAt && { updatedAt: req.updatedAt })
  };

  const page = reqData.page ? parseInt(reqData.page, 10) : null;
  const limit = reqData.limit ? parseInt(reqData.limit, 10) : null;
  const skip = page && limit ? (page - 1) * limit : 0;
  const sort = reqData.sort || "createdAt";
  const order = reqData.order === "asc" ? 1 : -1;
  const sortOrder = { [sort]: order };

  return {
    query,
    skip,
    page,
    limit,
    sortOrder,
  };
}
