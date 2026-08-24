/*
date            qid / cr#         comments
17-mar-2026     CR0002           filteration for LOG SCREEN

*/
// new 
const SetpointDeviationEvent = require("../../../models/mongoDB/logManagement/setpointDeviationEvent_model");
//
const {
  validateRequestBodyData,
  validateLogReq,
  validateTemplateStructure,
  validateTemplateBoundLimit,
} = require("../../../middlewares/logManagement/log_middlewares");
const { LogModel } = require("../../../models/mongoDB/logManagement/log_model");
const {
  LogEntryModel,
} = require("../../../models/mongoDB/logManagement/logEntry_model");
const {
  LogStructureModel,
} = require("../../../models/mongoDB/logManagement/logStructure_model");
const SetpointDeviation = require("../../../models/mongoDB/logManagement/setPointDeviation");
const {
  findOneLastEntry,
  findOne,
  insertOne,
  count,
  updateOne,
  aggregation,
  findMany,
  findAll,
  deleteOne,
  updateMany,
} = require("../../dBManagers/mongoDB_manager");
const { ObjectId } = require("mongodb");
const { DateTime } = require("luxon");
const {
  constructNotification,
} = require("../../common/DataObjectConstructor_manager");
const User = require("../../../models/mongoDB/userManagement/user_model");
const { sendViaUserID } = require("../../../utils/socket/socketHandler");
const {
  Assets,
} = require("../../../models/mongoDB/assetManagement/asset_model");
const BusinessUnitModel = require("../../../models/mongoDB/organizationManagement/businessUnit_model");
const {
  LogTemplateModel,
} = require("../../../models/mongoDB/logManagement/template_model");
const { createLogentries } = require("./recurrence");
const { getFiles } = require("../fileSystem/fileSystem_manager");
const { default: mongoose } = require("mongoose");
const { mongoDbManager } = require("../../dBManagers");
const { constructLogSetpointLimitBreachTemplateData, sendLogSetpointLimitBreachEmail } = require("../../../utils/emailService/templates/logSetpointLimitBreachEmailTemplate");
const { sendPauseLogEmail, constructPauseLogTemplateData } = require("../../../utils/emailService/templates/pauseLogEmailTemplate");
const { sendResumeLogEmail, constructResumeLogTemplateData } = require("../../../utils/emailService/templates/resumeLogEmailTemplate");
const apiResponseHandler = require("../../common/apiResponseHandler_manager");
const formulaApproaches = {
  PROCESS_AT_FETCH_TIME: "PROCESS_AT_FETCH_TIME",
  PROCESS_AT_UPDATE_TIME: "PROCESS_AT_UPDATE_TIME",
}
const paginationHandler = require("../../common/paginationHandler_manager");
const fileManager = require("../fileSystem/fileSystem_manager");


let formulaApproach = formulaApproaches.PROCESS_AT_FETCH_TIME

const logCreation = async (reqData, userId, isDraft) => {
  try {
    const validateReq = await validateLogReq(reqData, userId);
    if (!validateReq.success) {
      throw validateReq.message;
    } else if (validateReq.success) {
      const recurrenceDetails = reqData.recurrenceDetails
        ? reqData.recurrenceDetails
        : null;
      if (recurrenceDetails !== null) {
        const timePeriod = recurrenceDetails.timePeriod;
        if (timePeriod === "week") {
          const occurDays = recurrenceDetails.occurDays
            ? recurrenceDetails.occurDays
            : [];
          const startDateAndTime = reqData.startDateAndTime
            ? reqData.startDateAndTime
            : null;
          if (occurDays.length === 0 && startDateAndTime === null) {
            throw "Please provide startDateAndTime";
          } else if (occurDays.length === 0 && startDateAndTime !== null) {
            const formatStartDateAndTime = convertDateFormat(
              new Date(startDateAndTime)
            );
            const day = formatStartDateAndTime.toFormat("cccc").toLowerCase();
            reqData["recurrenceDetails"]["occurDays"] = [day];
          }
        } else if (timePeriod === "month") {
          const startDateAndTime = reqData.startDateAndTime
            ? reqData.startDateAndTime
            : null;
          reqData["recurrenceDetails"]["specificDay"] = startDateAndTime;
        }
      }
      const name = reqData.name ? reqData.name : null;
      if (name !== null) {
        const log = await findOne(LogModel, { name: name, businessUnit: reqData.businessUnit }, { _id: 1 });
        if (log) {
          throw "Log name already exist";
        }
      }
      const documentNumber = reqData.documentNumber
        ? reqData.documentNumber
        : null;
      if (documentNumber !== null) {
        const log = await findOne(LogModel, { documentNumber, businessUnit: reqData.businessUnit }, { _id: 1 });
        if (log) {
          throw "Log document number already exist";
        }
      }
      let start = reqData.startDateAndTime ? reqData.startDateAndTime : null;
      let end = reqData.endDateAndTime ? reqData.endDateAndTime : null;
      if (end < start) {
        throw "Please check. The log end date can't be earlier than the start date";
      }
      let logDoc;
      let previousLogs = await findOneLastEntry(LogModel, {});
      if (isDraft === "true") {
        logDoc = await insertOne(LogModel, {
          ...reqData,
          logNumber: previousLogs ? previousLogs.logNumber + 1 : 1,
          status: "draft",
          createdBy: userId,
          startDateAndTime: start,
          endDateAndTime: end,
          isActive: false,
        });
      } else {
        const reqValidation = validateRequestBodyData(reqData);
        if (reqValidation.success) {
          logDoc = await insertOne(LogModel, {
            ...reqData,
            logNumber: previousLogs ? previousLogs.logNumber + 1 : 1,
            createdBy: userId,
            startDateAndTime: start,
            endDateAndTime: end,
          });
        } else {
          throw reqValidation.message;
        }
      }
      if (logDoc) {
        return logDoc._id;
      } else {
        throw "Document is not saved in db";
      }
    }
  } catch (err) {
    console.log("err:", err);
    throw err;
  }
};

const templateCreation = async (reqData, userId, logId, isGeneralTemplate) => {
  try {
    if (isGeneralTemplate === "false") {
      const log = await findOne(LogModel, { _id: logId }, { _id: 0 });
      if (!log) {
        throw "Please provide valid logId";
      }
      const logPrevStatus = log?.status ?? "draft";
      if (logPrevStatus === "draft") {
        const logBody = {
          departments: log.departments ? log.departments : [],
          assignees: log.assignees ? log.assignees : [],
          startDateAndTime: log.startDateAndTime ? log.startDateAndTime : null,
          endDateAndTime: log.endDateAndTime ? log.endDateAndTime : null,
          name: log.name ? log.name : null,
          assetId: log.assetId ? log.assetId : null,
          businessUnit: reqData.businessUnit ? reqData.businessUnit : null,
          approvers : log.approvers ? log.approvers : null,
          emailNotificationRecipients : log.emailNotificationRecipients ? log.emailNotificationRecipients : null,
        };
        const validateLog = validateRequestBodyData(logBody);
        if (!validateLog.success) {
          throw "Please fill in all the mandatory fields for the log first.";
        }
        const prevlogStr = await findOne(
          LogStructureModel,
          { logId },
          { _id: 1 }
        );
        if (prevlogStr !== null) {
          throw "Log structure already defined";
        }
        const validateTemplateStr = await validateTemplateStructure(reqData);
        if (validateTemplateStr.success) {
          const template = await insertOne(LogTemplateModel, {
            isGeneralTemplate: false,
            templateName: null,
            createdBy: userId,
            ...reqData,
          });
          const logStr = await insertOne(LogStructureModel, {
            logId,
            version: 1,
            images: reqData.images ? reqData.images : null,
            note: reqData.note ? reqData.note : null,
            templateId: template._id.toString(),
            isActive: true,
            createdBy: userId,
            businessUnit: reqData.businessUnit
          });
          if (logStr) {
            const logUpdate = await updateOne(
              LogModel,
              { _id: logId },
              { status: "scheduled", isActive: true }
            );
            if (logUpdate) {
              createLogentries();
            }
            return {
              structureId: logStr._id,
              templateId: template._id,
            };
          } else {
            throw "Log structure is not created";
          }
        } else {
          throw validateTemplateStr.message;
        }
      } else {
        throw "Log structure already defined";
      }
    } else {
      const templateName = reqData.name;
      if (!templateName) {
        throw "Please provide name for template";
      }
      const nameValidation = await count(LogTemplateModel, { templateName });
      if (nameValidation !== 0) {
        throw "Duplicate template name, Please change the template name!";
      }
      const validateTemplateStr = await validateTemplateStructure(reqData);
      if (validateTemplateStr.success){
        const templateDoc = await insertOne(LogTemplateModel, {
          isGeneralTemplate: true,
          templateName,
          ...reqData,
          createdBy: userId,
        });
        if (templateDoc) {
          return {
            templateId: templateDoc._id,
          };
        } else {
          throw "Client side error";
        }
      }else {
          throw validateTemplateStr.message;
        }
    }
  } catch (err) {
    console.log("err:", err);
    throw err;
  }
};

const logsReturningIds = async (query) => {
  try {

    const logs = await findAll(
      LogModel,
      query,
      { _id: 1 }
    );
    if (logs) {
      return logs.map((log) => log._id.toString());
    }

  }
  catch (err) {
    console.log("err:", err);
    throw err;
  }
}

// const logWithAllDetails = async (userId, page = 1, limit = 15, businessUnit, name,departments) => {
//   try {
//     const nameMatch = name ? { name: { $regex: name, $options: "i" } } : {};
//     const logCount = await count(LogModel, {
//       $and: [
//         { $or: [{ createdBy: userId }, { assignees: userId }, {approvers: { $in: [userId] } }] },
//         { businessUnit: businessUnit },
//         { isActive: true },
//         nameMatch
//       ],
//     });

//     let logWithTemplateStatus;
//     let totalPages;

//     if (logCount) {
//       const skip = (page - 1) * limit;
//       const aggregationPipeline = [
//         {
//           $match: {
//             $and: [
//               { $or: [{ createdBy: userId }, { assignees: userId }, {approvers: { $in: [userId] } }] },
//               { businessUnit: businessUnit },
//               { isActive: true },
//               nameMatch
//             ],
//           },
//         },
//         {
//           $addFields: {
//             isUserDept: {
//               $cond: [
//                 { $gt: [{ $size: { $setIntersection: ["$departments", [departments]] } }, 0] }, // overlap check
//                 0, // belongs to user department(s)
//                 1  // others
//               ]
//             },
//             sortDept: {
//               $cond: [
//                 { $ifNull: [departments, false] }, // if departments param exists
//                 { $arrayElemAt: ["$generalDetails.departments", 0] }, // take first dept
//                 null
//               ]
//             }
//           }
//         },        
//         {
//           $addFields: {
//             assetId: {
//               $convert: {
//                 input: "$assetId",
//                 to: "objectId",
//                 onError: null,
//                 onNull: null,
//               },
//             },
//             departments: {
//               $map: {
//                 input: "$departments",
//                 as: "dept",
//                 in: { $toObjectId: "$$dept" },
//               },
//             },
//             assignees: {
//               $map: {
//                 input: "$assignees",
//                 as: "assignee",
//                 in: { $toObjectId: "$$assignee" },
//               },
//             },
//             approvers: {
//               $map: {
//                 input: "$approvers",
//                 as: "approver",
//                 in: { $toObjectId: "$$approver" },
//               },
//             },
//             emailNotificationRecipients: {
//               $map: {
//                 input: "$emailNotificationRecipients",
//                 as: "emailNotificationRecipient",
//                 in: { $toObjectId: "$$emailNotificationRecipient" },
//               },
//             },
//             criticalNotificationRecipients: {
//               $map: {
//                 input: "$criticalNotificationRecipients",
//                 as: "criticalNotificationRecipient",
//                 in: { $toObjectId: "$$criticalNotificationRecipient" },
//               },
//             },
//             teams: {
//               $map: {
//                 input: "$teams",
//                 as: "team",
//                 in: { $toObjectId: "$$team" },
//               },
//             },
//           },
//         },
//         {
//           $lookup: {
//             from: "assets",
//             localField: "assetId",
//             foreignField: "_id",
//             as: "assetDetails",
//           },
//         },
//         {
//           $unwind: {
//             path: "$assetDetails",
//             preserveNullAndEmptyArrays: true,
//           },
//         },
//         {
//           $lookup: {
//             from: "departments",
//             localField: "departments",
//             foreignField: "_id",
//             as: "departmentDetails",
//           },
//         },
//         {
//           $lookup: {
//             from: "users",
//             localField: "assignees",
//             foreignField: "_id",
//             as: "assigneeDetails",
//           },
//         },
//         {
//           $lookup: {
//             from: "users",
//             localField: "approvers",
//             foreignField: "_id",
//             as: "approverDetails",
//           },
//         },
//         {
//           $lookup: {
//             from: "users",
//             localField: "emailNotificationRecipients",
//             foreignField: "_id",
//             as: "emailNotificationRecipientDetails",
//           },
//         },
//         {
//           $lookup: {
//             from: "users",
//             localField: "criticalNotificationRecipients",
//             foreignField: "_id",
//             as: "criticalNotificationRecipientDetails",
//           },
//         },
//         {
//           $lookup: {
//             from: "teams",
//             localField: "teams",
//             foreignField: "_id",
//             as: "teamDetails",
//           },
//         },
//         {
//           $project: {
//             _id: 1,
//             generalDetails: {
//               _id: "$_id",
//               logNumber: "$logNumber",
//               name: "$name",
//               documentNumber: "$documentNumber",
//               isRecurrence: "$isRecurrence",
//               timePeriod: "$timePeriod",
//               templatesStatus: "$templatesStatus",
//               asset: "$assetDetails.generalDetails.name",
//               departments: "$departmentDetails.name",
//               assignees: "$assigneeDetails.name",
//               approvers: "$approverDetails.name",
//               emailNotificationRecipients:"$emailNotificationRecipientDetails.name",
//               criticalNotificationRecipients: "$criticalNotificationRecipientDetails.name",
//               teams: "$teamDetails.name",
//               frequency: "$recurrenceDetails.frequency",
//               timePeriod: "$recurrenceDetails.timePeriod",
//               createdAt: "$createdAt",
//               updatedAt: "$updatedAt",
//               logStatus: "$status",
//               note: "$structure.note",
//             },
//             isUserDept: 1
//           },
//         },
//         {
//           $sort: {
//             isUserDept: 1,
//             sortDept: 1,
//             "generalDetails.createdAt": -1,
//           },
//         },
//         {
//           $skip: +skip,
//         },
//         {
//           $limit: +limit,
//         },
//       ];
//       const logs = await aggregation(LogModel, aggregationPipeline);
//       const logIds = logs.map((i) => i._id.toString());
//       if (logIds.length > 0) {
//         const entryQuery = {
//           logId: { $in: logIds },
//           businessUnit: businessUnit
       

//         };
//         const templateStatusAggregation = [
//           {
//             $match: entryQuery,
//           },
//           {
//             $group: {
//               _id: {
//                 logId: "$logId",
//                 templateStatus: "$status",
//               },
//               count: { $sum: 1 },
//             },
//           },
//           {
//             $group: {
//               _id: "$_id.logId",
//               templateStatuses: {
//                 $push: {
//                   status: "$_id.templateStatus",
//                   count: "$count",
//                 },
//               },
//             },
//           },
//         ];
//         const templateStatus = await aggregation(
//           LogEntryModel,
//           templateStatusAggregation
//         );
//         const templateStatusMap = new Map(
//           templateStatus.map((item) => [item._id, item])
//         );

//          // Query templateId and version from LogStructureModel
//          const logStructureDocs = await findAll(
//           LogStructureModel,
//           { logId: { $in: logIds } },
//           { logId: 1, _id: 1, version: 1 }
//         );

//         const logStructureMap = new Map(
//           logStructureDocs.map((doc) => [doc.logId.toString(), doc])
//         );
//         logWithTemplateStatus = logs.map((log) => {
//           const templateStatusItem = templateStatusMap.get(
//             log.generalDetails._id.toString()
//           );

//           const logStructureItem = logStructureMap.get(
//             log.generalDetails._id.toString()
//           );

//           return {
//             ...log,
//             ...(templateStatusItem && {
//               templateStatuses: templateStatusItem.templateStatuses || null,
//             }),
//             ...(logStructureItem && {
//               structureId: logStructureItem._id || null,
//               version: logStructureItem.version || null,
//             }),
//           };          

//         });
//         totalPages = Math.ceil(logCount / limit);
//       }
//       const result = {
//         currentPage: +page,
//         totalPageCount: totalPages ? totalPages : 1,
//         totalDataCount: logCount,
//         data: logWithTemplateStatus ? logWithTemplateStatus : [],
//       };
//       if (result) {
//         return result;
//       } else {
//         return "Failed to retrieve logs.";
//       }
//     }
//     return "No logs.";




//     /*
//            },
//       ];

//       const [logDetails, templateStatus] = await Promise.all([
//         aggregation(LogModel, aggregationPipeline),
//         aggregation(LogEntryModel, templateStatusAggregation),
//       ]);

//       const templateStatusMap = new Map(
//         templateStatus.map((item) => [item._id, item])
//       );

//       logWithTemplateStatus = logDetails.map((log) => {
//         const templateStatusItem = templateStatusMap.get(
//           log.generalDetails._id.toString()
//         );
//         if (templateStatusItem) {
//           return {
//             ...log,
//             templateStatuses: templateStatusItem.templateStatuses
//               ? templateStatusItem.templateStatuses
//               : null,
//           };
//         } else {
//           return {
//             ...log,
//           };
//         }
//       });

//       totalPages = Math.ceil(logCount / limit);
//     }

//     const result = {
//       currentPage: +page,
//       totalPageCount: totalPages ? totalPages : 1,
//       totalDataCount: logCount,
//       data: logWithTemplateStatus ? logWithTemplateStatus : [],
//     };

//     return result || "Failed to retrieve logs.";
//     */
//   } catch (err) {
//     console.log(err);
//     throw err;
//   }
// };


//start
//CR0002

const logWithAllDetails = async (
  userId,
  page = 1,
  limit = 15,
  businessUnit,
  filters = {}
) => {
  try {

    const {
      name,
      logNumber,
      documentNumber,
      asset,
      timePeriod,
      departments,
      createdAt
    } = filters;

    const nameMatch = name ? { name: { $regex: name, $options: "i" } } : {};

    // FIX 1: logNumber is stored as a Number in MongoDB.
    // $regex cannot run on a Number field — it causes a 400 cast error.
    // Solution: use $expr + $toString so the number is cast to string first.
    const logNumberMatch = logNumber
      ? {
          $expr: {
            $regexMatch: {
              input: { $toString: "$logNumber" },
              regex: logNumber,
              options: "i"
            }
          }
        }
      : {};

    const documentNumberMatch = documentNumber
      ? { documentNumber: { $regex: documentNumber, $options: "i" } }
      : {};

    // assetMatch references "assetDetails.generalDetails.name" which only exists
    // AFTER a $lookup aggregation stage. It must NOT be used in count() which
    // runs a plain query on the raw collection. It is applied inside the
    // aggregation pipeline only (after $lookup + $unwind).
    const assetMatch = asset
      ? { "assetDetails.generalDetails.name": { $regex: asset, $options: "i" } }
      : {};

    const timePeriodMatch = timePeriod
      ? { timePeriod: { $regex: timePeriod, $options: "i" } }
      : {};

let departmentMatch = {};
if (departments) {
  if (mongoose.Types.ObjectId.isValid(departments)) {
    // ObjectId (user's own dept from base payload) → use directly
    departmentMatch = { departments: { $in: [departments] } };
  } else {
    // Name string typed in filter → pre-lookup to get IDs
    const deptCollection = mongoose.connection.collection("departments");
    const matchingDepts = await deptCollection
      .find({ name: { $regex: departments.trim(), $options: "i" } }, { projection: { _id: 1 } })
      .toArray();
    const deptIds = matchingDepts.map(d => d._id.toString());
    departmentMatch = { departments: { $in: deptIds.length > 0 ? deptIds : ["__no_match__"] } };
  }
}

    // FIX 2: Use setUTCHours so the day boundary is always midnight UTC,
    // matching how MongoDB stores Date values (always in UTC internally).
    const createdAtMatch = createdAt
      ? (() => {
          const d = new Date(createdAt);
          if (isNaN(d.getTime())) return {};
          const start = new Date(d);
          start.setUTCHours(0, 0, 0, 0);
          const end = new Date(d);
          end.setUTCHours(23, 59, 59, 999);
          return { createdAt: { $gte: start, $lte: end } };
        })()
      : {};

    // Base match — does NOT include assetMatch because that field is only
    // available after a $lookup in the aggregation pipeline.
    const baseMatch = {
      $and: [
        { $or: [{ createdBy: userId }, { assignees: userId }, { approvers: { $in: [userId] } }] },
        { businessUnit: businessUnit },
        { isActive: true },
        nameMatch,
        logNumberMatch,
        documentNumberMatch,
        timePeriodMatch,
        createdAtMatch,
        departmentMatch
      ]
    };

    // FIX 3: When asset filter is active, count() on the raw collection returns 0
    // because "assetDetails.generalDetails.name" doesn't exist before $lookup.
    // Run a mini aggregation with $lookup + $match + $count instead.
    let logCount;
    if (asset) {
      const countPipeline = [
        { $match: baseMatch },
        {
          $addFields: {
            assetId: {
              $convert: { input: "$assetId", to: "objectId", onError: null, onNull: null }
            }
          }
        },
        { $lookup: { from: "assets", localField: "assetId", foreignField: "_id", as: "assetDetails" } },
        { $unwind: { path: "$assetDetails", preserveNullAndEmptyArrays: true } },
        { $match: assetMatch },
        { $count: "total" }
      ];
      const countResult = await aggregation(LogModel, countPipeline);
      logCount = countResult[0]?.total ?? 0;
    } else {
      logCount = await count(LogModel, baseMatch);
    }
//End
    let logWithTemplateStatus;
    let totalPages;

    if (logCount) {
      const skip = (page - 1) * limit;
      const aggregationPipeline = [
        {
          $match: baseMatch
        },
        {
          $addFields: {
            assetId: {
              $convert: {
                input: "$assetId",
                to: "objectId",
                onError: null,
                onNull: null
              }
            },
            departments: {
              $map: {
                input: "$departments",
                as: "dept",
                in: { $toObjectId: "$$dept" }
              }
            }
          }
        },

        {
          $lookup: {
            from: "assets",
            localField: "assetId",
            foreignField: "_id",
            as: "assetDetails"
}
        },
        {
          $unwind: {
            path: "$assetDetails",
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $match: assetMatch
        },
        {
          $lookup: {
            from: "departments",
            localField: "departments",
            foreignField: "_id",
            as: "departmentDetails"
          }
        },
        {
          $project: {
            _id: 1,
            generalDetails: {
              _id: "$_id",
              logNumber: "$logNumber",
              name: "$name",
              documentNumber: "$documentNumber",
              isRecurrence: "$isRecurrence",
              timePeriod: "$timePeriod",
              asset: "$assetDetails.generalDetails.name",
              departments: "$departmentDetails.name",
              createdAt: "$createdAt",
              updatedAt: "$updatedAt",
              logStatus: "$status"
            }
          }
        },
        {
          $sort: {
            "generalDetails.createdAt": -1
          }
        },
        {
          $skip: +skip
        },
        {
          $limit: +limit
        }
      ];

      const logs = await aggregation(LogModel, aggregationPipeline);
      const logIds = logs.map((i) => i._id.toString());
      if (logIds.length > 0) {

        const entryQuery = {
          logId: { $in: logIds },
          businessUnit: businessUnit
  };
        const templateStatusAggregation = [
          { $match: entryQuery },
          {
            $group: {
              _id: {
                logId: "$logId",
                templateStatus: "$status"
              },
              count: { $sum: 1 }
            }
          },
          {
            $group: {
              _id: "$_id.logId",
              templateStatuses: {
                $push: {
                  status: "$_id.templateStatus",
                  count: "$count"
                }
              }
            }
          }
        ];
        const templateStatus = await aggregation(
          LogEntryModel,
          templateStatusAggregation
        );
        const templateStatusMap = new Map(
          templateStatus.map((item) => [item._id, item])
        );

        logWithTemplateStatus = logs.map((log) => {
          const templateStatusItem = templateStatusMap.get(
            log.generalDetails._id.toString()
          );

          return {
            ...log,
            ...(templateStatusItem && {
              templateStatuses: templateStatusItem.templateStatuses
            })
          };
        });
        totalPages = Math.ceil(logCount / limit);
      }
        return {
        currentPage: +page,
        totalPageCount: totalPages ? totalPages : 1,
        totalDataCount: logCount,
        data: logWithTemplateStatus ? logWithTemplateStatus : []
      };

    }

    return {
      currentPage: 1,
      totalPageCount: 1,
      totalDataCount: 0,
      data: []
    };

  } catch (err) {
    console.log(err);
    throw err;
  }
};
//End

const checkExistingLog = async (id) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return false;
    }
    const query = { _id: id };
    const existingLog = await mongoDbManager.findOne(LogModel, query);
    return existingLog;
  } catch (error) {
    throw error;
  }
};
const checkExistingLogStructure = async (logStructureId, logId) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(logStructureId)) {
      return false;
    }
    const query = { _id: logStructureId };
    if (logId) {
      query.logId = logId;
    }
    const existingLogStructure = await mongoDbManager.findOne(
      LogStructureModel,
      query
    );
    return existingLogStructure;
  } catch (error) {
    throw error;
  }
};


const getLog = async (logId, userId) => {
  try {
    const logAgg = [
      {
        $match: {
          _id: new ObjectId(logId),
          $or: [{ createdBy: userId }, { assignees: userId }, {approvers: { $in: [userId] } }]
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
          approvers: {
            $map: {
              input: "$approvers",
              as: "approver",
              in: { $toObjectId: "$$approver" },
            },
          },
          emailNotificationRecipients: {
            $map: {
              input: "$emailNotificationRecipients",
              as: "emailNotificationRecipient",
              in: { $toObjectId: "$$emailNotificationRecipient" },
            },
          },
          criticalNotificationRecipients: {
            $map: {
              input: "$criticalNotificationRecipients",
              as: "criticalNotificationRecipient",
              in: { $toObjectId: "$$criticalNotificationRecipient" },
            },
          },
          approvedBy: {
            $map: {
              input: "$approvedBy",
              as: "approvedBy",
              in: { $toObjectId: "$$approvedBy" },
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
          from: "users",
          localField: "approvers",
          foreignField: "_id",
          as: "approverDetails",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "emailNotificationRecipients",
          foreignField: "_id",
          as: "emailNotificationRecipientDetails",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "criticalNotificationRecipients",
          foreignField: "_id",
          as: "criticalNotificationRecipientDetails",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "approvedBy",
          foreignField: "_id",
          as: "approvedByDetails",
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
          as: "userDetails",
        },
      },
      {
        $addFields: {
          updatedBy: {
            $ifNull: [
              { $arrayElemAt: ["$userDetails.name", 0] },
              "Not Available",
            ],
          },
        },
      },
      {
        $project: {
          _id: "$_id",
          logNumber: "$logNumber",
          name: "$name",
          documentNumber: "$documentNumber",
          isRecurrence: "$isRecurrence",
          timePeriod: "$timePeriod",
          templatesStatus: "$templatesStatus",
          asset: "$assetDetails.generalDetails.name",
          departments: "$departmentDetails.name",
          departmentObject: {
            $map: {
              input: "$departmentDetails",
              as: "department",
              in: { _id: "$$department._id", name: "$$department.name" },
            },
          },
          assignees: "$assigneeDetails.name",
          assigneeObject: {
            $map: {
              input: "$assigneeDetails",
              as: "assignee",
              in: { _id: "$$assignee._id", name: "$$assignee.name" },
            },
          },
          approvers: {
            $map: {
              input: "$approverDetails",
              as: "approver",
              in: { _id: "$$approver._id", name: "$$approver.name" },
            },
          },
          approvedBy: {
            $map: {
              input: "$approvedByDetails",
              as: "approvedBy",
              in: { _id: "$$approvedBy._id", name: "$$approvedBy.name" },
            },
          },
          emailNotificationRecipients: {
            $map: {
              input: "$emailNotificationRecipientDetails",
              as: "recipient",
              in: { _id: "$$recipient._id", name: "$$recipient.name" },
            },
          },
          criticalNotificationRecipients: {
            $map: {
              input: "$criticalNotificationRecipientDetails",
              as: "criticalRecipient",
              in: { _id: "$$criticalRecipient._id", name: "$$criticalRecipient.name" },
            },
          },
          createdAt: "$createdAt",
          updatedAt: "$updatedAt",
          logStatus: "$status",
          isPaused: "$isPaused",
          isActive: "$isActive",
          startDateAndTime: "$startDateAndTime",
          endDateAndTime: "$endDateAndTime",
          recurrenceDetails: "$recurrenceDetails",
          userSpecificDetails: "$userSpecificDetails",
          description: 1,
          teams: "$teamDetails.name",
          updatedBy: "$updatedBy",
        },
      },
    ];
    const log = await aggregation(LogModel, logAgg);
    if (log.length > 0) {
      const structureId = await findOne(
        LogStructureModel,
        { logId: logId, isActive: true },
        { _id: 1 }
      );
      if (structureId) {
        return {
          ...log[0],
          structureId: structureId._id,
        };
      } else {
        return {
          ...log[0],
        };
      }
    } else {
      throw "You cant access this log. Please provide valid logId.";
    }
  } catch (err) {
    console.log(err);
    throw err;
  }
};

const deleteAndTransferLogs = async (logIds = [], userId) => {
  try {
    const logs = await LogModel.find({
      _id: { $in: logIds },
      isActive: true
    });
    if (!logs.length) {
      throw "No valid logs found";
    }

    // Permission validation
    for (const log of logs) {
      const isUserCustomization = log.isUserCustomization || true;
      const assignees = log.assignees || [];
      const createdBy = log.createdBy || "";

      if (isUserCustomization) {
        const hasAccess =
          assignees.includes(userId) || createdBy.toString() === userId;

        if (!hasAccess) {
          throw "You don't have access to one or more logs";
        }
      }
    }

    // Soft delete
    const result = await LogModel.updateMany(
      { _id: { $in: logIds } },
      {
        $set: {
          isActive: false,
          updatedBy: userId,
        }
      }
    );

    return {
      matched: result.matchedCount,
      modified: result.modifiedCount
    };
  } catch (err) {
    console.error(err);
    throw err;
  }
};

const getEntries = async (logId, userId, page = 1, limit = 15, status) => {
  try {
    const log = await findOne(LogModel, { _id: logId }, {});
    if (log === null) {
      throw "Please provide valid logId";
    }
    const query = {
      logId,
      $or: [{ createdBy: userId }, { operatorIds: userId }, {approvers: { $in: [userId] } }] 
    };

    const isUserCustomization = log.isUserCustomization
      ? log.isUserCustomization
      : false;
    const assignees = log.assignees ? log.assignees : [];
    const createdBy = log.createdBy ? log.createdBy : "";
    if (isUserCustomization) {
      const validuser = assignees.filter((i) => i === userId);
      if (validuser.length === 0 && createdBy !== userId) {
        throw "You don't have access to the entries";
      }
    }
    if (status) {
      query.status = status;
    }
    // const entriesCount = await count(LogEntryModel, query);
    const finalQuery = buildLogEntryQuery(query,userId) //added - earlier it was missed (27/3/26)
    const entriesCount = await /*count(LogEntryModel, query)*/count(LogEntryModel, finalQuery);//CR0002
    if (entriesCount > 0) {
      const totalPages = Math.ceil(entriesCount / limit);
      const skip = (page - 1) * limit;
      const entryAgg = [
        {
          $match: query,
        },
        {
          $addFields: {
            updatedBy: {
              $toObjectId: "$updatedBy",
            },
            createdBy: {
              $toObjectId: "$createdBy",
            },
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "updatedBy",
            foreignField: "_id",
            as: "userDetails",
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "createdBy",
            foreignField: "_id",
            as: "createdByDetails",
          },
        },
        {
          $addFields: {
            updatedBy: {
              $ifNull: [
                { $arrayElemAt: ["$userDetails.name", 0] },
                "Not Available",
              ],
            },
            createdBy: {
              $ifNull: [
                { $arrayElemAt: ["$createdByDetails.name", 0] },
                "Not Available",
              ],
            },
          },
        },
        {
          $project: {
            logId: 1,
            entryNumber: 1,
            entryCreatedAt: 1,
            logId: 1,
            status: 1,
            updatedBy: 1,
            createdAt: 1,
            createdBy: 1,
          },
        },
        {
          $sort: { createdAt: -1 },
        },
        {
          $skip: +skip,
        },
        {
          $limit: +limit,
        },
      ];
      const data = await aggregation(LogEntryModel, entryAgg);
      if (data) {
        const result = {
          currentPage: page,
          totalPageCount: totalPages,
          totalDataCount: entriesCount,
          data: data ? data : [],
        };
        return result;
      }
    } else {
      const result = {
        currentPage: page,
        totalPageCount: 1,
        totalDataCount: 0,
        data: [],
      };
      return result;
    }
  } catch (err) {
    throw err;
  }
};

const getVersions = async (logId, userId, paginationDetails) => {
  try {
    const log = await findOne(LogModel, { _id: logId }, { _id: 1 });
    if (log === null) {
      throw "Please provide valid logId";
    }
    const query = {
      logId,
      createdBy: userId,
    };
    const versionsCount = await count(LogStructureModel, query);
    if (versionsCount) {
      const totalPages = Math.ceil(versionsCount / paginationDetails.pageSize);
      const data = await findMany(
        LogStructureModel,
        query,
        paginationDetails.pageNumber,
        paginationDetails.pageSize,
        paginationDetails.sort,
        paginationDetails.sortOrder,
        {}
      );
      if (data) {
        const result = {
          currentPage: +paginationDetails.pageNumber,
          totalPageCount: totalPages,
          totalDataCount: versionsCount,
          data: data ? data : [],
        };
        return result;
      } else {
        const result = {
          currentPage: +paginationDetails.pageNumber,
          totalPageCount: 1,
          totalDataCount: 0,
          data: [],
        };
        return result;
      }
    }
  } catch (err) {
    throw err;
  }
};

const entryDetails = async (entryId, userId) => {
  try {
    const entryAgg = [
      {
        $match: { _id: new ObjectId(entryId),
          $or: [{ createdBy: userId }, { operatorIds: userId }, {approvers: { $in: [userId] } }]
         },
      },
      {
        $addFields: {
          updatedBy: {
            $convert: {
              input: "$updatedBy",
              to: "objectId",
              onError: null,
              onNull: null,
            },
          },
          asset: {
            $convert: {
              input: "$asset",
              to: "objectId",
              onError: null,
              onNull: null,
            },
          },
          approvers: {
            $map: {
              input: "$approvers",
              as: "approver",
              in: { $toObjectId: "$$approver" },
            },
          },
          approvedBy: {
            $map: {
              input: "$approvedBy",
              as: "approvedBy",
              in: { $toObjectId: "$$approvedBy" },
            },
          },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "updatedBy",
          foreignField: "_id",
          as: "userDetails",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "approvers",
          foreignField: "_id",
          as: "approverDetails",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "approvedBy",
          foreignField: "_id",
          as: "approvedByDetails",
        },
      },
      {
        $addFields: {
          updatedBy: {
            $ifNull: [
              { $arrayElemAt: ["$userDetails.name", 0] },
              "Not Available",
            ],
          },
        },
      },
      {
        $project: {
          _id: 1,
          entryNumber: 1,
          entryCreatedAt: 1,
          logId: 1,
          status: 1,
          approvers:"$approverDetails.name",
          approvedBy:"$approvedByDetails.name",
          updatedBy: 1,
          createdAt: 1,
          updatedAt: 1,
          data: 1,
          templateId: 1,
        },
      },
    ];
    const entry = await aggregation(LogEntryModel, entryAgg);
    if (entry.length > 0) {
      const assets = await findAll(
        Assets,
        {},
        { _id: 1, "generalDetails.name": 1 }
      );
      const dataSets = entry[0].data;
      const assetLookup = assets.reduce((acc, asset) => {
        acc[asset._id.toString()] = asset.generalDetails.name;
        return acc;
      }, {});
      const updatedEntryData = dataSets.map((entry) => {
        const assetIdString = entry.asset ? entry.asset.toString() || "" : "";
        if (assetLookup[assetIdString]) {
          entry.asset = assetLookup[assetIdString];
        }
        return entry;
      });
      const logAgg = [
        {
          $match: {
            _id: new ObjectId(entry[0].logId),
            $or: [{ createdBy: userId }, { assignees: userId }, {approvers: { $in: [userId] } }] 
          },
        },
        {
          $addFields: {
            assetId: {
              $convert: {
                input: "$assetId",
                to: "objectId",
                onError: null,
                onNull: null,
              },
            },
            departments: {
              $map: {
                input: "$departments",
                as: "department",
                in: {
                  $toObjectId: "$$department",
                },
              },
            },
            assignees: {
              $map: {
                input: "$assignees",
                as: "assignee",
                in: {
                  $toObjectId: "$$assignee",
                },
              },
            },
            approvers: {
              $map: {
                input: "$approvers",
                as: "approver",
                in: { $toObjectId: "$$approver" },
              },
            },
            emailNotificationRecipients: {
              $map: {
                input: "$emailNotificationRecipients",
                as: "emailNotificationRecipient",
                in: { $toObjectId: "$$emailNotificationRecipient" },
              },
            },
            criticalNotificationRecipients: {
              $map: {
                input: "$criticalNotificationRecipients",
                as: "criticalNotificationRecipient",
                in: { $toObjectId: "$$criticalNotificationRecipient" },
              },
            },            
            teams: {
              $map: {
                input: "$teams",
                as: "team",
                in: {
                  $toObjectId: "$$team",
                },
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
            from: "users",
            localField: "approvers",
            foreignField: "_id",
            as: "approverDetails",
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "emailNotificationRecipients",
            foreignField: "_id",
            as: "emailNotificationRecipientDetails",
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "criticalNotificationRecipients",
            foreignField: "_id",
            as: "criticalNotificationRecipientDetails",
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
          $project: {
            _id: "$_id",
            logNumber: "$logNumber",
            name: "$name",
            documentNumber: "$documentNumber",
            isRecurrence: "$isRecurrence",
            timePeriod: "$timePeriod",
            templatesStatus: "$templatesStatus",
            asset: {
              id: "$assetDetails._id",
              name: "$assetDetails.generalDetails.name"
            },
            departments: "$departmentDetails.name",
            assignees: "$assigneeDetails.name",
            approvers:"$approverDetails.name",
            emailNotificationRecipients:"$emailNotificationRecipientDetails.name",
            criticalNotificationRecipients:"$criticalNotificationRecipientDetails.name",
            createdAt: "$createdAt",
            updatedAt: "$updatedAt",
            logStatus: "$status",
            isActive: "$isActive",
            startDateAndTime: "$startDateAndTime",
            endDateAndTime: "$endDateAndTime",
            recurrenceDetails: "$recurrenceDetails",
            userSpecificDetails: "$userSpecificDetails",
            description: 1,
            teams: "$teamDetails.name",
          },
        },
      ];
      const log = await aggregation(LogModel, logAgg);
      const logStr = await findOne(LogStructureModel, {
        logId: entry[0].logId,
      });
      let logEntryResult = entry[0]
      if (formulaApproach == formulaApproaches.PROCESS_AT_FETCH_TIME) {
        logEntryResult = await evaluateTemplate(entry[0]); // Call the evaluateTemplate function
      }
      const result = {
        logEntry: logEntryResult,
        logDetails: log[0] ? log[0] : [],
        image: logStr ? logStr.images || null : null,
        note: logStr ? logStr.note || null : null,
      };
      return result;
    } else {
      throw "You cant access this entry details. Provide correct entryId";
    }
  } catch (err) {
    console.log(err);
    throw err;
  }
};

const logCount = async (userId, businessUnit) => {
  try {
    const [totalLog, completedLogs] = await Promise.all([
      findAll(
        LogModel,
        {
          $and: [
            { $or: [{ createdBy: userId }, { assignees: userId }, {approvers: { $in: [userId] } }] },
            { businessUnit: businessUnit },
            {isActive: true},
          ],
        },
        { _id: 1 }
      ),
      count(LogModel, {
        $and: [
          { $or: [{ createdBy: userId }, { assignees: userId }, {approvers: { $in: [userId] } }] },
          { businessUnit: businessUnit },
          {isActive: true},
          { status: "completed" },
        ],
      }),
    ]);

//     count(LogEntryModel, {
//       $and: [
//         {
//           $or: [
//             { createdBy: userId },
//             { operatorId: userId },
//           ],
//         },
//         { businessUnit: businessUnit },
//         { status: "pendingForApproval" },
//       ],
//     }),
//     ]);

// const result = {
//   total: totalLog,
//   completed: completedLogs,
    //   pendingForApproval: pendingLogs,
    
    if (totalLog.length > 0) {
      const logIds = totalLog.map((i) => i._id.toString());
      const entryQuery = {
        logId: { $in: logIds },
        status: "pendingForApproval",
        businessUnit: businessUnit
      };
      const pendingLogs = await count(LogEntryModel, entryQuery);
      return {
        total: totalLog.length,
        completed: completedLogs,
        pendingForApproval: pendingLogs,
      };
    }
    return {
      total: 0,
      completed: 0,
      pendingForApproval: 0,
    };
  } catch (err) {
    throw new Error(`Failed to get status count for log: ${err.message}`);
  }
};


const getTemplates = async (paginationDetails, businessUnit) => {
  try {
    const templateCount = await count(LogTemplateModel, {
      $and: [{ isGeneralTemplate: true }, { businessUnit: businessUnit }],
    });
    if (templateCount) {
      const totalPages = Math.ceil(templateCount / paginationDetails.pageSize);
      const templates = await findMany(
        LogTemplateModel,
        { $and: [{ isGeneralTemplate: true }, { businessUnit: businessUnit }] },
        paginationDetails.pageNumber,
        paginationDetails.pageSize,
        paginationDetails.sort,
        paginationDetails.sortOrder,
        { _id: 1, templateName: 1, createdBy: 1, createdAt: 1 }
      );
      if (templates) {
        const result = {
          currentPage: +paginationDetails.pageNumber,
          totalPageCount: totalPages,
          totalDataCount: templateCount,
          data: templates ? templates : [],
        };
        return result;
      } else {
        const result = {
          currentPage: +paginationDetails.pageNumber,
          totalPageCount: 1,
          totalDataCount: 0,
          data: [],
        };
        return result;
      }
    }
  } catch (err) {
    throw err;
  }
};


const updateLog = async (logId, userId, updateData) => {
  try {
    let draftStatus = updateData.isDraft;
    if (draftStatus === undefined) draftStatus = true;
    const log = await findOne(LogModel, { _id: logId }, { _id: 0 , emailNotificationRecipients:1, criticalNotificationRecipients:1 });
    if (!log) {
      throw "Please provide correct logId";
    }
    let newBody;
    if (log && updateData) {
      let existingData = log;
      for (let key in updateData) {
        if (existingData[key] || existingData[key] === null) {
          existingData[key] = updateData[key];
        } else if (!existingData[key]) {
          existingData[key] = updateData[key];
        }
      }
      const logPrevStatus = log?.status ?? "draft";
      existingData.status = logPrevStatus !== "draft" ? logPrevStatus : "draft";
      function removeIdKeys(obj, seen = new Set()) {
        if (Array.isArray(obj)) {
          obj.forEach((item, index) => {
            if (typeof item === "object" && item !== null && !seen.has(item)) {
              seen.add(item);
              removeIdKeys(item, seen);
            }
          });
        } else if (obj && typeof obj === "object") {
          seen.add(obj);
          for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
              if (key.startsWith("_id")) {
                delete obj[key];
              } else if (
                typeof obj[key] === "object" &&
                obj[key] !== null &&
                !seen.has(obj[key])
              ) {
                removeIdKeys(obj[key], seen);
              }
            }
          }
        }
        return obj;
      }
      newBody = removeIdKeys(existingData);
      if (!draftStatus) {
        const reqValidation = await validateRequestBodyData(newBody);
        if (!reqValidation.success) {
          throw reqValidation.message;
        }
      }
    }
    const emailNotificationRecipients = updateData.emailNotificationRecipients ?? log.emailNotificationRecipients
    const criticalNotificationRecipients = updateData.criticalNotificationRecipients ?? log.criticalNotificationRecipients
    if(emailNotificationRecipients && criticalNotificationRecipients){
      const emailSet = new Set(emailNotificationRecipients);
      // Filter out any ID from critical that exists in email
      const duplicates = criticalNotificationRecipients.filter(
      id => emailSet.has(id) || id === userId
      );
      if(duplicates.length > 0 ){
        throw `The email and critical notification recipients have same user IDs`
      }
    }
    else if(emailNotificationRecipients && emailNotificationRecipients.includes(userId)){
      throw  `The current user ID cannot be in the email notification recipients.`
    } else if(criticalNotificationRecipients &&  criticalNotificationRecipients.includes(userId)) {
       throw `The current user ID cannot be in the critical notification recipients.`
    }

    const logName = updateData.name;
    if (logName !== undefined) {
      const checkNameUniquness = await findAll(
        LogModel,
        {
          name: logName,
          _id: { $ne: logId },
        },
        { _id: 1 }
      );
      if (checkNameUniquness.length > 0) {
        throw "Log name already exist";
      }
    }
    const docNum = updateData.documentNumber;
    if (docNum !== undefined) {
      const documentNumberUniquness = await findAll(
        LogModel,
        {
          documentNumber: docNum,
          _id: { $ne: logId },
        },
        { _id: 1 }
      );
      if (documentNumberUniquness.length > 0) {
        throw "Log document number already exist";
      }
    }
    newBody = { updatedBy: userId, ...updateData };
    if (
      draftStatus &&
      (updateData.recurrenceDetails || updateData.userSpecificDetails)
    ) {
      delete newBody.recurrenceDetails;
      delete newBody.userSpecificDetails;
    }
    newBody.updatedBy = userId;
    const updateLog = await updateOne(LogModel, { _id: logId }, newBody);
    if (updateLog.acknowledged) {
      return updateLog.acknowledged;
    }
  } catch (err) {
    console.log(err);
    throw err;
  }
};

const updateLogStructure = async (structureId, userId, updateData) => {
  try {
    const oldLogStructure = await findOne(
      LogStructureModel,
      { _id: structureId },
      {}
    );
    if (!oldLogStructure) {
      throw "Invalid structureId.";
    }
    const up = await updateOne(
      LogStructureModel,
      { _id: structureId },
      { isActive: false }
    );
    let newVersion = oldLogStructure ? oldLogStructure.version + 1 : null;
    const logId = oldLogStructure ? oldLogStructure.logId : null;
    const oldUserId = oldLogStructure
      ? oldLogStructure.createdBy || null
      : null;
      const validatedData = await validateTemplateStructure(updateData);

      if (!validatedData.success) {
        throw validatedData.message;
      }
    const newTemplate = await insertOne(LogTemplateModel, {
      dataSets: validatedData.dataSets,
      createdBy: oldUserId,
      updatedBy: userId,
      businessUnit: updateData.businessUnit
    });
    const logStructureData = {
      logId,
      version: newVersion,
      isActive: true,
      images: updateData.images
        ? updateData.images
        : oldLogStructure.images || null,
      note: updateData.note ? updateData.note : oldLogStructure.note || null,
      templateId: newTemplate ? newTemplate._id.toString() || null : null,
      createdBy: oldUserId,
      updatedBy: userId,
      businessUnit: updateData.businessUnit
    };
    const newStructure = await insertOne(LogStructureModel, logStructureData);
    if (newStructure) {
      return { structureId: newStructure._id };
    }
    return "Log structure updated successfully";
  } catch (err) {
    throw err;
  }
};

const getVersionDetails = async (structureId) => {
  try {
    const aggregationPipeline = [
      {
        $match: {
          _id: new ObjectId(structureId),
        },
      },
      {
        $addFields: {
          templateIdObj: { $toObjectId: "$templateId" },
        },
      },
      {
        $lookup: {
          from: "logtemplates",
          localField: "templateIdObj",
          foreignField: "_id",
          as: "template",
        },
      },
      {
        $addFields: {
          template: { $arrayElemAt: ["$template", 0] },
        },
      },
      {
        $project: {
          _id: 1,
          images: 1,
          note: 1,
          dataSets: "$template.dataSets",
          templateId: "$template._id",
        },
      },
    ];
    const data = await aggregation(LogStructureModel, aggregationPipeline);
    if (data.length > 0) {
      const updateData = await updateDataSets(data[0]);
      return data;
    } else {
      throw "Please provide valid structure id.";
    }
  } catch (err) {
    throw err;
  }
};

const updateDataSets = async (result) => {
  let dataSets = result.dataSets;
  for (let i = 0; i < dataSets.length; i++) {
    const assetId = dataSets[i].asset;
    const assetDetails = await fetchAsset(assetId);
    const assetName = assetDetails?.generalDetails?.name ?? "";
    const assetD = { assetId, assetName };
    dataSets[i].asset = assetD;
  }
  return result;
};

const fetchAsset = async (assetId) => {
  try {
    return findOne(
      Assets,
      { _id: assetId },
      { _id: 0, "generalDetails.name": 1 }
    );
  } catch (err) {
    throw err;
  }
};

const getTemplateDetails = async (templateId) => {
  try {
    const templateDetails = await findOne(
      LogTemplateModel,
      { _id: templateId },
      { _id: 0, dataSets: 1, createdBy: 1 }
    );
    if (templateDetails) {
      return templateDetails;
    } else {
      throw "Please provide valid template id";
    }
  } catch (err) {
    throw err;
  }
};

const getAllSchduledLog = async () => {
  try {
    const logs = await findAll(LogModel, { status: "scheduled" }, {});
    if (logs) {
      return logs;
    } else {
      throw "There is no logs";
    }
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

const fillTheEntries = async (entryId, userId, reqData) => {
  let templateId = null;
  let engineerId = null;
  let notificationsHasToSend = [];
  let emailNotificationsToSend = [];
  try {
    if (!mongoose.Types.ObjectId.isValid(entryId)) throw "Please provide correct entryId";
    const entryData = await findOne(
      LogEntryModel,
      { _id: entryId },
      { data: 1, createdBy: 1, logId: 1, templateId: 1, operatorIds: 1,assetId: 1 }
    );
    if (!entryData) throw "Please provide correct entryId";
    const log = await findOne(
      LogModel,
      { _id: entryData.logId },
      {
        name: 1,
        assignees: 1,
        isUserCustomization: 1,
        createdBy: 1,
        emailNotificationRecipients: 1,
        criticalNotificationRecipients: 1,
        businessUnit: 1,
      }
    );
    if (!log) throw "Related to this entry no log exists.";

    const isUserCustomization = log.isUserCustomization || false;
    if (!isUserCustomization) {
      if (!log.assignees.includes(userId)) throw "You don't have access to fill entry";
    } else {
      if (!entryData.operatorIds.includes(userId)) throw "You don't have access to fill entry";
    }

    const filledBy = userId;
    const logName = log.name || "Unknown";
    const operatorName = (await findOne(User, { _id: userId }, { name: 1 }))?.name || "Unknown";
    engineerId = entryData.createdBy || "";
    templateId = entryData.templateId || "";

    const templateMap = new Map();
    const entryDataMap = new Map();
    const requestDataMap = new Map();
    if (templateId) {
      const { dataSets = [] } = await findOne(LogTemplateModel, { _id: templateId }, { dataSets: 1 });
      for (const item of dataSets) templateMap.set(item.index, item);
    }

    for (const item of entryData.data) entryDataMap.set(item.index, item);
    for (const item of reqData.data) requestDataMap.set(item.index, item);

    for (const [index, reqField] of requestDataMap.entries()) {
      const templateField = templateMap.get(index);
      const entryField = entryDataMap.get(index);

      const isFormula = entryField?.isFormula || false;
      const isMandatory = entryField?.isMandatory || false;
      const breakDown = reqField?.breakDown || false;

      const fieldDetails = entryField || { index, fieldName: templateField?.fieldName, fieldValue: null };

      const updatedValue = reqField?.fieldValue !== undefined ? reqField.fieldValue : fieldDetails.fieldValue;
      const updatedType = reqField?.type || fieldDetails.type;

      if (!isFormula && isMandatory && (updatedValue === undefined || updatedValue === null || updatedValue === "" || (Array.isArray(updatedValue) && updatedValue.length === 0)) && !breakDown) {
        throw `Field value for index ${index} cannot be empty`;
      }

      switch (updatedType) {
        case "text":
        case "date":
          if (isMandatory && !breakDown && typeof updatedValue !== "string") {
            throw `Field value for index ${index} must be a string`;
          }
          if (updatedType === "date" && isMandatory && isNaN(new Date(updatedValue).getTime())) {
            throw `Field value for index ${index} is not a valid date`;
          }
          fieldDetails.fieldValue = updatedValue;
         fieldDetails.fieldEnteredBy = userId;
        fieldDetails.fieldEnteredAt = new Date();
        fieldDetails.isFilled = true;
          break;

        case "number":
          if (isMandatory && typeof updatedValue !== "number") {
            throw `Field value for index ${index} must be a number`;
          }
          fieldDetails.fieldValue = updatedValue;
          fieldDetails.fieldEnteredBy = userId;
        fieldDetails.fieldEnteredAt = new Date();
        fieldDetails.isFilled = true;
          const LB = templateField?.lowerBound ?? null;
          const UB = templateField?.upperBound ?? null;
          const CLB = templateField?.criticalLowerBound ?? null;
          const CUB = templateField?.criticalUpperBound ?? null;

      //--//
      // new
      let deviationType = null;

      if (CLB !== null && updatedValue <= CLB) {
        deviationType = "criticalLowerBound";
      } else if (LB !== null && updatedValue <= LB) {
        deviationType = "lowerBound";
      } else if (CUB !== null && updatedValue >= CUB) {
        deviationType = "criticalUpperBound";
      } else if (UB !== null && updatedValue >= UB) {
        deviationType = "upperBound";
      }

      if (deviationType) {
        // await SetpointDeviationEvent.create({
        //   templateId,
        //   logStructureId: entryData._id,
        //   logId: log._id,
        //   entryId: entryId,
        //   assetId: entryData.assetId,
        //   fieldName: fieldDetails.fieldName,
        //   deviationType,
        //   value: updatedValue,
        //   triggeredAt: new Date(),
        // });
        await SetpointDeviationEvent.create({
          
          sourceDetails: {
          sourceType: "log",
          templateId,
          logStructureId: entryData._id,
          logId: log._id,
          entryId: entryId,
          fieldId: fieldDetails._id,
          },
          assetId: entryData.assetId || null,
          // fieldName: fieldDetails.fieldName,
          deviationType,
          value: updatedValue,
          triggeredAt: new Date(),
        });
      }
//--//

          // for setpoint storing
      await trackDeviationsForEntry({
      templateId,
      logStructureId: entryData._id,
      logId: log._id,
      entryId: entryId,
      assetId: entryData.assetId,
      fieldName: fieldDetails.fieldName,
      fieldValue:typeof updatedValue === "number" ? updatedValue: Number(updatedValue),
      bounds: {
        lowerBound: LB,
        upperBound: UB,
        criticalLowerBound: CLB,
        criticalUpperBound: CUB,
      }
    });



          if (CUB !== null && CLB !== null && (updatedValue < CLB || updatedValue > CUB)) {
            const cond = updatedValue > CUB ? " Critical Upper" : "Critical Lower";
            notificationsHasToSend.push(constructNotification("setLimitBreached", `- ${fieldDetails.fieldName}, has breached the ${cond} set limit. Immediate Action Required.`, { id: entryId, name: logName }, "logs", userId, log.businessUnit));
            if (process.env.SEND_EMAIL_ON_SETPOINT_LIMIT_BREACH === "true" && process.env.SEND_EMAIL === "true") {
              emailNotificationsToSend.push({
                logCreatorId: log.createdBy,
                limitType: cond,
                logName,
                fieldName: fieldDetails.fieldName,
                currentValue: updatedValue,
                setpointLimit: updatedValue > CUB ? CUB : CLB,
                breachTime: new Date(),
                detectedBy: operatorName,
                emailNotificationRecipients: log.criticalNotificationRecipients || [],
                severity: "",
              });
            }
          } else if (UB !== null && LB !== null && (updatedValue < LB || updatedValue > UB)) {
            const cond = updatedValue > UB ? "Upper" : "Lower";
            notificationsHasToSend.push(constructNotification("setLimitBreached", `- ${fieldDetails.fieldName}, has breached the ${cond} set limit. Immediate Action Required.`, { id: entryId, name: logName }, "logs", userId, log.businessUnit));
            if (process.env.SEND_EMAIL_ON_SETPOINT_LIMIT_BREACH === "true" && process.env.SEND_EMAIL === "true") {
              emailNotificationsToSend.push({
                logCreatorId: log.createdBy,
                limitType: cond,
                logName,
                fieldName: fieldDetails.fieldName,
                currentValue: updatedValue,
                setpointLimit: updatedValue > UB ? UB : LB,
                breachTime: new Date(),
                detectedBy: operatorName,
                emailNotificationRecipients: log.emailNotificationRecipients || [],
                severity: "Warning",
              });
            }
          }
          break;

        case "multiplechoice":
        case "checkboxes":
        case "dropdown":
          if (!Array.isArray(updatedValue)) {
            throw `Field value for index ${index} must be array`;
          }
          const validIds = fieldDetails.fieldValue?.map((i) => i._id) || [];
          for (const v of updatedValue) {
            if (typeof v !== "string" || !validIds.includes(v)) {
              throw `Invalid value for index ${index}`;
            }
          }
          fieldDetails.fieldEnteredBy = userId,
          fieldDetails.fieldEnteredAt = new Date(),
          fieldDetails.isFilled = true,
          fieldDetails.fieldValue = fieldDetails.fieldValue.map((item) => ({
            ...item,
            isActive: updatedValue.includes(item._id),
          }));
          break;
      }

      entryDataMap.set(index, fieldDetails);
    }

    entryData.data = Array.from(entryDataMap.values());

    const updated = await LogEntryModel.updateOne(
      { _id: entryId },
      {
        data: entryData.data,
        status: "pendingForApproval",
        updatedBy: userId,
        enteredBy: filledBy,
        entryEnteredAt: new Date(),
      }
    );

    if (updated?.acknowledged) {
      notificationsHasToSend.push(await constructNotification("dataEntryUpdate", `has been Updated by ${operatorName}.`, { id: entryId, name: logName }, "logs", userId, log.businessUnit));
    }
    handleSendNotification(notificationsHasToSend, engineerId);
    if (emailNotificationsToSend.length > 0) {
      await processAndSendEmailNotifications(emailNotificationsToSend);
    }
    return updated;
  } catch (err) {
    throw err;
  }
};

const saveEntries = async (entryId, userId, reqData) => {
  let templateId = null;
  let engineerId = null;
  let notificationsHasToSend = [];
  let emailNotificationsToSend = [];
  try {
    if (!mongoose.Types.ObjectId.isValid(entryId)) {
      throw "Please provide correct entryId";
    }

    let filledBy;
    const entryData = await findOne(
      LogEntryModel,
      { _id: entryId },
      { data: 1, createdBy: 1, logId: 1, templateId: 1, operatorIds: 1 }
    );
    if (!entryData) {
      throw "Please provide correct entryId";
    }

    const logId = entryData.logId || "";
    const log = await findOne(
      LogModel,
      { _id: logId },
      {
        name: 1,
        assignees: 1,
        isUserCustomization: 1,
        createdBy: 1,
        emailNotificationRecipients: 1,
        criticalNotificationRecipients: 1,
        businessUnit: 1,
      }
    );
    if (!log) {
      throw "Related to this entry no log exists.";
    }

    const isUserCustomization = log.isUserCustomization || false;
    if (!isUserCustomization) {
      const assignees = log.assignees || [];
      const userExists = assignees.includes(userId);
      if (!userExists) throw "You don't have access to fill entry";
      else filledBy = userId;
    } else {
      const operatorIds = entryData.operatorIds;
      if (!operatorIds.includes(userId))
        throw "You don't have access to fill entry";
      filledBy = userId;
    }

    const logName = log.name || "Unknown";
    const user = await findOne(User, { _id: userId }, { name: 1 });
    const operatorName = user?.name || "Unknown";

    engineerId = entryData.createdBy || "";
    templateId = entryData.templateId || "";

    const entryDataSetsMap = new Map();
    const templateMap = new Map();
    const requestDataMap = new Map();

    if (templateId) {
      const data = await findOne(
        LogTemplateModel,
        { _id: templateId },
        { dataSets: 1 }
      );
      if (data.dataSets.length > 0) {
        data.dataSets.forEach((item) => {
          templateMap.set(item.index, item);
        });
      }
    }

    if (entryData.data.length > 0) {
      entryData.data.forEach((item) => entryDataSetsMap.set(item.index, item));
    }

    const data = reqData.data;
    for (let i = 0; i < data.length; i++) {
      const item = data[i];
      if (!item.index) throw `Index is required in request data`;
      if (!item.type) throw `Type is required in index ${item.index}`;

      const breakDown = item.breakDown || false;
      let fieldDetails = entryDataSetsMap.get(item.index);
      if (!fieldDetails) continue;

      const fieldType = fieldDetails.type;
      if (fieldType !== item.type) {
        throw `Please provide correct type for index ${item.index}`;
      }

      if (
        item.hasOwnProperty("fieldValue") &&
        item.fieldValue !== null &&
        item.fieldValue !== undefined &&
        breakDown === false
      ) {
        if (item.type === "text") {
          if (typeof item.fieldValue !== "string") {
            throw `Field value for index ${item.index} should be a string`;
          }
        } else if (item.type === "date") {
          if (
            typeof item.fieldValue !== "string" &&
            isNaN(new Date(item.fieldValue).getTime())
          ) {
            throw `Field value for index ${item.index} should be a valid date string`;
          }
        } else if (item.type === "number") {
          if (typeof item.fieldValue !== "number") {
            throw `Field value for index ${item.index} should be a number`;
          }
        } else if (
          item.type === "multiplechoice" ||
          item.type === "dropdown" ||
          item.type === "checkboxes"
        ) {
          if (!Array.isArray(item.fieldValue)) {
            throw `Field value for index ${item.index} should be an array of strings`;
          }
          for (const val of item.fieldValue) {
            if (typeof val !== "string") {
              throw `Each item in field value for index ${item.index} should be a string`;
            }
          }
        }
      }

      requestDataMap.set(item.index, item);
    }
    for (let i = 0; i < reqData.data.length; i++) {
      const reqEntry = reqData.data[i];
      const breakDown = reqEntry.breakDown || false;

      let fieldDetails = entryDataSetsMap.get(reqEntry.index);
      const templateField = templateMap.get(reqEntry.index);
      const requestDataField = requestDataMap.get(reqEntry.index);
      if (!requestDataField) continue;

      let updatedFieldValue = requestDataField;
      if (updatedFieldValue.type === "number" && breakDown === false) {
        let updateValue;
        const rawValue = updatedFieldValue.fieldValue;
        if (rawValue === undefined || rawValue === null || rawValue === "") {
          updateValue = ""; // preserve as blank string
        } else if (!isNaN(rawValue)) {
          updateValue = Number(rawValue);
        }
        // const updateValue = +updatedFieldValue.fieldValue;
        const LB = templateField.lowerBound ?? null;
        const UB = templateField.upperBound ?? null;
        const CUB = templateField.criticalUpperBound ?? null;
        const CLB = templateField.criticalLowerBound ?? null;
        fieldDetails.fieldValue = updateValue;
        fieldDetails.fieldEnteredBy = userId;
        fieldDetails.fieldEnteredAt = new Date();
        fieldDetails.isFilled = true;
        if (
          CUB !== null &&
          CLB !== null &&
          (updateValue < CLB || updateValue > CUB)
        ) {
          const fieldName = fieldDetails.fieldName || "Unknown";
          const cond = updateValue > CUB ? " Critical Upper" : "Critical Lower";
          const notificationBody = constructNotification(
            "setLimitBreached",
            `- ${fieldName}, has breached the ${cond} set limit. Immediate Action Required.`,
            { id: entryId, name: logName },
            "logs",
            userId,
            log.businessUnit
          );
          notificationsHasToSend.push(notificationBody);
          if (
            process.env.SEND_EMAIL_ON_SETPOINT_LIMIT_BREACH === "true" &&
            process.env.SEND_EMAIL === "true"
          ) {
            emailNotificationsToSend.push({
              logCreatorId: log.createdBy,
              limitType: cond,
              logName: logName,
              fieldName: fieldDetails.fieldName,
              currentValue: updateValue,
              setpointLimit: updateValue > CUB ? CUB : CLB,
              breachTime: templateField.entryEnteredAt || new Date(),
              detectedBy: operatorName,
              emailNotificationRecipients:
                log.criticalNotificationRecipients || [],
              severity: "",
            });
          }
        } else if (
          UB !== null &&
          LB !== null &&
          (updateValue > UB || updateValue < LB)
        ) {
          const fieldName = fieldDetails.fieldName || "Unknown";
          const cond = updateValue > UB ? "Upper" : "Lower";
          const notificationBody = constructNotification(
            "setLimitBreached",
            `- ${fieldName}, has breached the ${cond} set limit. Immediate Action Required.`,
            { id: entryId, name: logName },
            "logs",
            userId,
            log.businessUnit
          );
          notificationsHasToSend.push(notificationBody);
          if (
            process.env.SEND_EMAIL_ON_SETPOINT_LIMIT_BREACH === "true" &&
            process.env.SEND_EMAIL === "true"
          ) {
            emailNotificationsToSend.push({
              logCreatorId: log.createdBy,
              limitType: cond,
              logName: logName,
              fieldName: fieldDetails.fieldName,
              currentValue: updateValue,
              setpointLimit: updateValue > UB ? UB : LB,
              breachTime: templateField.entryEnteredAt || new Date(),
              detectedBy: operatorName,
              emailNotificationRecipients:
                log.emailNotificationRecipients || [],
              severity: "Warning",
            });
          }
        }
      } else if (
        (updatedFieldValue.type === "text" ||
          updatedFieldValue.type === "date") &&
        breakDown === false
      ) {
        fieldDetails.fieldValue = updatedFieldValue.fieldValue;
        fieldDetails.fieldEnteredBy = userId;
        fieldDetails.isFilled = true;
        fieldDetails.fieldEnteredAt = new Date();
      } else if (
        ["multiplechoice", "checkboxes", "dropdown"].includes(
          updatedFieldValue.type
        ) &&
        breakDown === false
      ) {
        const fieldValues = updatedFieldValue.fieldValue || [];
        const entryFieldValue = fieldDetails.fieldValue || [];
        fieldDetails.fieldValue = fieldDetails.fieldValue.map((option) => {
          return {
            ...option,
            isActive: fieldValues.includes(option._id),
          };
        });
        fieldDetails.fieldEnteredBy= userId,
        fieldDetails.fieldEnteredAt= new Date(),
        fieldDetails.isFilled= true
      } else if (breakDown) {
        fieldDetails.breakDown = true;
        fieldDetails.fieldEnteredBy = userId;
        fieldDetails.fieldEnteredAt = new Date();
        fieldDetails.isFilled = true;
      }

      if (updatedFieldValue !== undefined) {
        const existingIndex = entryData.data.findIndex(
          (item) => item._id.toString() === fieldDetails._id.toString()
        );
        if (existingIndex !== -1) {
          entryData.data[existingIndex] = fieldDetails;
        } else {
          entryData.data.push(fieldDetails);
        }
      }
    }

    const updated = await LogEntryModel.updateOne(
      { _id: entryId },
      {
        data: entryData.data,
        status: "inProgress",
        updatedBy: userId,
        enteredBy: filledBy,
        entryEnteredAt: new Date(),
      }
    );

    const updateFlag = updated ? updated.acknowledged || false : false;
    if (updateFlag) {
      const notificationBody = await constructNotification(
        "dataEntryUpdate",
        `has been Updated by ${operatorName}.`,
        { id: entryId, name: logName },
        "logs",
        userId,
        log.businessUnit
      );
      notificationsHasToSend.push(notificationBody);
    }

    handleSendNotification(notificationsHasToSend, engineerId);
    if (emailNotificationsToSend.length > 0) {
      await processAndSendEmailNotifications(emailNotificationsToSend);
    }

    return updated;
  } catch (err) {
    throw err;
  }
};

async function processAndSendEmailNotifications(emailNotifications) {
  let userForEmail, constructedData, logName, fieldName;
  const ccEmailNotificationRecipients = new Set();
  for (let notification of emailNotifications) {
    userForEmail = await findOne(User, { _id: notification.logCreatorId }, { name: 1, email: 1 });
    logName = notification.logName
    fieldName = notification.fieldName
    constructedData = await constructLogSetpointLimitBreachTemplateData(
      userForEmail.name,
      emailNotifications,
      [],
      [],
    );
    
    if (notification.emailNotificationRecipients && notification.emailNotificationRecipients.length > 0) {
      for (let i = 0; i < notification.emailNotificationRecipients.length; i++) {
        let emailNotificationRecipientsUserObj = await findOne(
          User, 
          { _id: notification.emailNotificationRecipients[i] }, 
          { _id: 0, name: 1, email: 1 }
        );
        
        if (emailNotificationRecipientsUserObj) {
          ccEmailNotificationRecipients.add(emailNotificationRecipientsUserObj.email);
        }
      }
    }
    
    constructedData.cc = Array.from(ccEmailNotificationRecipients);
    
  }
  await sendLogSetpointLimitBreachEmail(
    [userForEmail.email], 
    `Immediate Action Required: ${logName} - ${fieldName} has breached its limit`, 
    constructedData
  );
}

const updateTemplate = async (templateId, userId, updateData) => {
  try {
    const oldTemplate = await findOne(
      LogTemplateModel,
      { _id: templateId },
      { createdBy: 1, templateName: 1 }
    );
    if (!oldTemplate) {
      throw "Invalid templateId.";
    }
    if (userId === oldTemplate.createdBy && updateData) {
      let templateName = updateData.name;
      if (templateName && templateName !== oldTemplate.templateName) {
        const nameCheck = await findOne(
          LogTemplateModel,
          { templateName: templateName },
          { createdBy: 1, name: 1 }
        );
        if (nameCheck) {
          throw "Duplicate template name, Please change the template name!";
        }
      }
      templateName = updateData.name
        ? updateData.name
        : oldTemplate.templateName;
      const updated = await updateOne(
        LogTemplateModel,
        { _id: templateId },
        { ...updateData, templateName }
      );
      if (updated) {
        return updated.acknowledged;
      }
    }
    return "You don't have access to update template";
  } catch (err) {
    console.log(err);
    throw err;
  }
};
const updateTemplateFormula = async (req) => {
  const { templateId } = req.params; 
  const { dataSets } = req.body; 
  try {

    let template = await  LogTemplateModel.findOne({ _id: templateId });
    if (!template) {
      throw "Invalid templateId.";
    }

    for (const dataSet of dataSets) {
      const { _id, formula } = dataSet;
      if (!mongoose.Types.ObjectId.isValid(_id)) {
        console.warn(`Invalid _id: ${_id}`);
        throw new Error(`Invalid _id: ${_id}`);
      }

      // // Find the specific data field in the template's dataSets array
      // const fieldToUpdate = template.dataSets.find(field => field._id.toString() === id);
      // if (!fieldToUpdate) {
      //   return res.status(400).json({ message: `Field with id ${id} not found in template.` });
      // }

      // Find the specific data field in the template's dataSets array
  
      const existingDataSet = template.dataSets.find(ds => ds._id.toString() === _id);
      if (!existingDataSet) {
        throw new Error(`Field '${_id}' not found in the template`);
      }
      if (formula) {
        // Validate the formula by processing it
        try {
          const result = await validateFormula(formula); // Using current date as entryCreatedAt for validation
          existingDataSet.formula = formula; // Update the dataset with the new formula
          await updateLogEntrywhenFormulaAdded(existingDataSet.fieldName, templateId);
        } catch (error) {
          throw new Error(`Formula validation failed for '${_id}': ${error.message}` );
        }
      }
    }

    template.updatedBy = req.userId;
    // Step 4: Save the updated template
    await template.save();
  

     
    
    return "You don't have access to update template";
  } catch (err) {
    console.log(err);
    throw err;
  }
};


async function fetchExistingTemplate(id) {
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return false;
    }
    const query = { _id: id };
    const existingTemplate = await mongoDbManager.findOne(
      LogTemplateModel,
      query
    );
    return existingTemplate;
  } catch (error) {
    throw error;
  }
}

const updateSetPoints = async (templateId, updateData) => {
  try {
    const existingTemplate = await fetchExistingTemplate(templateId);    
    if (!existingTemplate) {
      throw new Error("Template not found");
    }

    if (existingTemplate.createdBy !== updateData.userId) {
      throw new Error(
        "Failed! Only the template owner can edit the existing template"
      );
    }

    if (!Array.isArray(existingTemplate.dataSets)) {
      throw new Error("Invalid template structure: dataSets not found");
    }

    if (!Array.isArray(updateData.dataSets)) {
      throw new Error("Datasets should be an array");
    }

    // Create maps for existing datasets by _id and fieldName
    const existingDataSetsById = new Map(
      existingTemplate.dataSets.map((ds) => [ds._id.toString(), ds])
    );
    const existingDataSetsByFieldName = new Map(
      existingTemplate.dataSets.map((ds) => [ds.fieldName, ds])
    );

    await Promise.all(updateData.dataSets.map(async (updateDataSet) => {
      if (!updateDataSet._id && !updateDataSet.fieldName) {
        throw new Error(
          "Each dataSet in updateData must have either _id or fieldName"
        );
      }

      if (updateDataSet._id && updateDataSet.fieldName) {
        throw new Error(
          "Cannot pass both _id and fieldName in the same dataSet"
        );
      }

      let dataSetToUpdate = null;

      // Try to find dataset by _id
      if (updateDataSet._id) {
        dataSetToUpdate = existingDataSetsById.get(
          updateDataSet._id.toString()
        );
      }

      // If not found by _id, try to find dataset by fieldName
      if (!dataSetToUpdate && updateDataSet.fieldName) {
        dataSetToUpdate = existingDataSetsByFieldName.get(
          updateDataSet.fieldName
        );
      }

      if (!dataSetToUpdate) {
        throw new Error(
          `DataSet with ${
            updateDataSet._id
              ? `_id: ${updateDataSet._id}`
              : `fieldName: ${updateDataSet.fieldName}`
          } not found in the existing template`
        );
      }

      if (dataSetToUpdate.type === "number") {
        await validateTemplateBoundLimit(updateDataSet);
        // Apply updates if type is 'number'
        Object.assign(dataSetToUpdate, updateDataSet);
      }
    }));

    const updated = await updateOne(
      LogTemplateModel,
      { _id: templateId },
      { $set: { dataSets: existingTemplate.dataSets, updatedBy: updateData.userId } }
    );

    if (!updated) {
      throw new Error("Failed to update template");
    }

    return updated.acknowledged;
  } catch (err) {
    console.log(err);
    throw err; // Ensure proper error handling upstream
  }
};


const checkFieldUniqueness = async (fieldValue, businessUnit) => {
  try {
    const existingDoc = await findAll(LogModel, {
      ...fieldValue,
      businessUnit: businessUnit,
    });

    if (existingDoc.length > 0) {
      return { isunique: false };
    } else {
      return { isunique: true };
    }
  } catch (err) {
    throw err;
  }
};

const updateStatus = async (entryIds, userId, reqData) => {
  try {
    const query = { _id: entryIds[0], 
      $or: [
      { createdBy: userId }, // Matches documents created by userId
      { approvers: { $in: [userId] } } // Matches documents where userId is in approvers array
    ],};
    const entry = await findOne(LogEntryModel, query, {
      _id: 0,
      comments: 1,
      createdBy: 1,
      approvers: 1,
      logId: 1,
      operatorIds: 1,
      businessUnit:1,
    });
    if (!entry) {
      throw "You do not have the necessary access rights to perform this update.";
    }
    const engineerName = await findOne(
      User,
      { _id: userId },
      { _id: 0, name: 1 }
    );
    const engineer_Name = engineerName
      ? engineerName.name || "unknown"
      : "unknown";
    const logId = entry ? entry.logId || "" : "";
    const operatorIds = entry ? entry.operatorIds || "" : "";
    let log;
    let logName;
    let updateFlag;
    let entryStatus;
    let endDateAndTime;
    if (logId) {
      log = await findOne(
        LogModel,
        { _id: logId },
        { _id: 0, name: 1, endDateAndTime: 1, businessUnit: 1}
      );
      logName = log ? log.name || "Unknown" : "Unknown";
      endDateAndTime = log ? log.endDateAndTime || "" : "";
    }
    const status = reqData.status;
    if (status === "revised") {
      const newComment = reqData ? reqData.comment || "" : "";
      if (!newComment) {
        throw "Please add comment";
      }
      let comments = entry ? entry.comments || [] : [];
      let prevInd;
      if (comments.length > 0) {
        prevInd = comments[comments.length - 1].index;
        const newC = {
          index: prevInd + 1,
          comment: newComment,
        };
        comments.push(newC);
        const update = { status, comments: comments };
        const updated = await updateOne(LogEntryModel, query, update);
        updateFlag = updated ? updated.acknowledged || false : false;
        entryStatus = "revised";
      } else {
        const newC = {
          index: 1,
          comment: newComment,
        };
        comments.push(newC);
        const update = { status, comments: comments };
        const updated = await updateOne(LogEntryModel, query, update);
        updateFlag = updated ? updated.acknowledged || false : false;
        entryStatus = "revised";
      }
      for(let operatorId of operatorIds){
        await SendNotificationForStatusUpdate (updateFlag, operatorId, entryStatus, engineer_Name, logName, entryIds[0], userId, entry.businessUnit )
      }
    } else if (status === "approved" || status === "completed") {
      const entriesData  = await findAll(
          LogEntryModel,
          {
            _id: { $in: entryIds }, // Matches documents with _id in entryIds
            $or: [
              { createdBy: userId }, // Matches documents created by userId
              { approvers: { $in: [userId] } } // Matches documents where userId is in approvers array
            ],
            status: "pendingForApproval"       // Ensures only documents created by userId
          },
        ); 
        const updates = entriesData.map(async (entry) => {
          
          if (!entry.approvedBy.includes(userId)) {
            entry.approvedBy.push(userId);
          }

          const allApproved =
            entry.approvers.every((approver) =>
              entry.approvedBy.includes(approver)
            );
        
          const entryApprovedByAndApprovedAt = entry.entryApprovedByAndApprovedAt || [];

          const alreadyApproved = entryApprovedByAndApprovedAt.some(
            (item) => String(item.approvedBy) === String(userId)
          );

          if (!alreadyApproved) {
            entryApprovedByAndApprovedAt.push({
              approvedBy: userId,
              approvedAt: DateTime.now(),
            });
          }
          const updatedFields = {
            approvedBy: entry.approvedBy,
            ...(allApproved ? { status: "completed" } : {}),
            entryApprovedByAndApprovedAt: entryApprovedByAndApprovedAt,
            ...(allApproved ? { entryCompletedAt: DateTime.now() } : {}),
            updatedAt: DateTime.now(),
          };
          return LogEntryModel.updateOne(
            { _id: entry._id },
            { $set: updatedFields }
          );
        });
        
        // Wait for all updates to complete
        const updateResults = await Promise.all(updates);
        const updatesSuccessful = updateResults.every(result => result.acknowledged);
      if (updatesSuccessful) {
        const currentDate = DateTime.now();
        if (currentDate > endDateAndTime) {
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
              { status: "completed", isActive: false }
            );
          }
        }
      }
      updateFlag = updatesSuccessful ? updatesSuccessful || false : false;
      entryStatus = "approved";
      for (let entryId of entryIds){
        const entryData = await findOne(LogEntryModel, { _id: entryId, createdBy: userId}, { operatorIds: 1 });
        const currentOperatorIds = entryData ? entryData.operatorIds || operatorIds : operatorIds;
        for(let currentOperatorId of currentOperatorIds){
          await SendNotificationForStatusUpdate(updateFlag, currentOperatorId ,entryStatus, engineer_Name, logName, entryId, userId, entry.businessUnit)
        }
      }
    }
    return true;
  } catch (err) {
    throw err;
  }
};

async function SendNotificationForStatusUpdate (updateFlag, operatorId, entryStatus, engineer_Name, logName, entryId, userId, businessUnit ) {
  try{
    const notificationBody = await constructNotification(
        `approve`,
        `has been ${entryStatus} by ${engineer_Name}.`,
        {
          id: entryId,
          name: logName,
        },
        "logs",
        userId,
        businessUnit
      );
      if (updateFlag && mongoose.Types.ObjectId.isValid(operatorId)) {
        await sendViaUserID("notification", operatorId, notificationBody);
      }
  }catch(error){
    throw error;
  }
}

const updateTheEntries = async (entryId, userId, reqData) => {
  let templateId = null;
  let engineerId = null;
  let notificationsHasToSend = [];
  let emailNotificationsToSend = [];
  try {
    if (!mongoose.Types.ObjectId.isValid(entryId)) {
      throw "Please provide correct entryId";
    }
    if (
      !reqData ||
      reqData === undefined ||
      Object.keys(reqData).length === 0
    ) {
      throw "Please provide correct data";
    }
    const entryData = await findOne(
      LogEntryModel,
      { _id: entryId, createdBy: userId },
      {}
    );
    if (!entryData) {
      throw "Please provide correct entryId.";
    }
    // if (entryData.data.length !== reqData.data.length) {
    //   throw "Request data is not correct";
    // }
    const logId = entryData ? entryData.logId || "" : "";
    const log = await findOne(
      LogModel,
      { _id: logId },
      { name: 1, assignees: 1, isUserCustomization: 1, createdBy: 1, emailNotificationRecipients: 1, criticalNotificationRecipients: 1, businessUnit: 1 }
    );
    if (!log) {
      throw "Related to this entry no log exists.";
    }
    const logName = log ? log.name || "Unknown" : "Unknown";
    engineerId = entryData ? entryData.createdBy || "" : "";
    templateId = entryData.templateId ? entryData.templateId : "";
    const engineerName = await findOne(
      User,
      { _id: userId },
      { _id: 0, name: 1 }
    );
    const engineer_Name = engineerName
      ? engineerName.name || "unknown"
      : "unknown";
    const operatorIds = entryData ? entryData.operatorIds || "" : "";
    let updateFlag;
    const entryDataSetsMap = new Map();
    const templateMap = new Map();
    const requestDataMap = new Map();
    if (templateId) {
      const data = await findOne(
        LogTemplateModel,
        { _id: templateId },
        { dataSets: 1 }
      );
      if (data.dataSets.length > 0) {
        data.dataSets.forEach((item) => {
          templateMap.set(item.index, item);
        });
      }
    }
    if (entryData.data.length > 0) {
      entryData.data.forEach((item) => entryDataSetsMap.set(item.index, item));
    }
    const data = reqData.data;
    for (let i = 0; i < data.length; i++) {
      const item = data[i];
      if (!item.index) {
        throw "Index is required in request data";
      }
      if (!item.type) {
        throw `Type is required in index ${item.index}`;
      }
      const breakDown = item.breakDown ? item.breakDown : false;
      let fieldDetails = entryDataSetsMap.get(item.index);
      const fieldType = fieldDetails.type;
      const isFormula = fieldDetails.isFormula === true;
      const isMandatory = fieldDetails.isMandatory;
      if (fieldType !== item.type) {
        throw `Please provide correct type of index ${item.index}`;
      }
      if (!isFormula && isMandatory &&
        (item.fieldValue === undefined ||
          item.fieldValue === null ||
          (typeof item.fieldValue === "string" && item.fieldValue === "") ||
          (Array.isArray(item.fieldValue) && item.fieldValue.length === 0)) &&
        breakDown === false
      ) {
        throw `Field value for index ${item.index} cannot be empty`;
      }
      if (item.type === "text" && breakDown === false && !isFormula && isMandatory) {
        if (typeof item.fieldValue !== "string") {
          throw `Field value for index ${
            item.index
          } not valid structure.The type of requested field is ${typeof item.fieldValue} but valid field type is ${
            item.type
          }`;
        }
      } else if (item.type === "date" && breakDown === false && !isFormula && isMandatory) {
        if (typeof item.fieldValue !== "string") {
          throw `Field value for index ${
            item.index
          } not valid structure.The type of requested field is ${typeof item.fieldValue} but valid field type is ${
            item.type
          }`;
        }
        const date = new Date(item.fieldValue);
        if (isNaN(date.getTime())) {
          throw `Field value for index ${item.index} not valid date.
          }`;
        }
      } else if (item.type === "number" && !isFormula && isMandatory) {
        if (typeof item.fieldValue !== "number") {
          throw `Field value for index ${
            item.index
          } not valid structure.The type of requested field is ${typeof item.fieldValue} but valid field type is ${
            item.type
          }`;
        }
      } else if (item.type === "multiplechoice" && !isFormula  && isMandatory) {
        if (typeof item.fieldValue !== "object") {
          throw `Field value for index ${
            item.index
          } not valid structure.The type of requested field is ${typeof item.fieldValue} but valid field type is Array`;
        }
      } else if (item.type === "dropdown" && !isFormula && isMandatory) {
        if (typeof item.fieldValue !== "object") {
          throw `Field value for index ${
            item.index
          } not valid structure.The type of requested field is ${typeof item.fieldValue} but valid field type is Array`;
        }
      } else if (item.type === "checkboxes" && breakDown === false && !isFormula && isMandatory) {
        if (typeof item.fieldValue !== "object") {
          throw `Field value for index ${
            item.index
          } not valid structure.The type of requested field is ${typeof item.fieldValue} but valid field type is Array`;
        }
      }
      requestDataMap.set(item.index, item);
    }
    for (let i = 0; i < data.length; i++) {
      const reqEntry = data[i];
      const breakDown = reqEntry.breakDown ? reqEntry.breakDown : false;
      let fieldDetails = entryDataSetsMap.get(reqEntry.index);
      const templateField = templateMap.get(reqEntry.index);
      let updatedFieldValue = requestDataMap.get(reqEntry.index);
      if (reqEntry.type === "number" && breakDown === false) {
        const updateValue = +updatedFieldValue.fieldValue;
        const LB = templateField.lowerBound ?? null;
        const UB = templateField.upperBound ?? null;
        const CUB = templateField.criticalUpperBound ?? null;
        const CLB = templateField.criticalLowerBound ?? null;
        fieldDetails.fieldValue = updateValue;

        // for setpoint storing
      await trackDeviationsForEntry({
      templateId,
      logStructureId: entryData._id,
      logId: log._id,
      entryId: entryId,
      assetId: entryData.assetId,
      fieldName: fieldDetails.fieldName,
      fieldValue: updateValue,
      bounds: {
        lowerBound: LB,
        upperBound: UB,
        criticalLowerBound: CLB,
        criticalUpperBound: CUB,
      }
    });

        if(CUB !== null &&
          CLB !== null &&
          (updateValue < CLB || updateValue > CUB) 
        ){
          flag = true;
          const fieldName = fieldDetails.fieldName
            ? fieldDetails.fieldName
            : "Unknown";
          const cond = updateValue > UB ? "Upper" : "Lower";
          const notificationBody = constructNotification(
            "setLimitBreached",
            `- ${fieldName}, Critical level reached. Immediate attention required.`,
            {
              id: entryId,
              name: logName,
            },
            "logs",
            userId,
            log.businessUnit
          );
          notificationsHasToSend.push(notificationBody);
           if (process.env.SEND_EMAIL_ON_SETPOINT_LIMIT_BREACH == "true" && process.env.SEND_EMAIL == "true") {
            // Store email data to send later
            emailNotificationsToSend.push({
              logCreatorId: log.createdBy,
              limitType: cond,
              logName: logName,
              fieldName: fieldDetails.fieldName,
              currentValue: updateValue,
              setpointLimit: updateValue > UB ? UB : LB,
              breachTime: undefined,
              detectedBy: engineer_Name,
              emailNotificationRecipients: log.criticalNotificationRecipients || [],
              severity:""
            });
          }
        }

        else if (
          UB !== null &&
          LB !== null &&
          (updateValue > UB || updateValue < LB) 
        ) {
          flag = true;
          const fieldName = fieldDetails.fieldName
            ? fieldDetails.fieldName
            : "Unknown";
          const cond = updateValue > UB ? "Upper" : "Lower";
          const notificationBody = constructNotification(
            "setLimitBreached",
            `- ${fieldName}, has breached the ${cond} set limit. Immediate Action Required.`,
            {
              id: entryId,
              name: logName,
            },
            "logs",
            userId,
            log.businessUnit
          );
          notificationsHasToSend.push(notificationBody);
          if (process.env.SEND_EMAIL_ON_SETPOINT_LIMIT_BREACH == "true" && process.env.SEND_EMAIL == "true") {
            // Store email data to send later
            emailNotificationsToSend.push({
              logCreatorId: log.createdBy,
              limitType: cond,
              logName: logName,
              fieldName: fieldDetails.fieldName,
              currentValue: updateValue,
              setpointLimit: updateValue > UB ? UB : LB,
              breachTime: undefined,
              detectedBy: engineer_Name,
              emailNotificationRecipients: log.emailNotificationRecipients || [],
              severity: "Warning",
            });
          }
        } 
        // else if (
        //   CP1 !== null &&
        //   CP2 !== null &&
        //   CP1 <= updateValue &&
        //   CP2 >= updateValue
        // ) {
        //   flag = true;
        //   const fieldName = fieldDetails.fieldName
        //     ? fieldDetails.fieldName
        //     : "Unknown";
        //   const notificationBody = constructNotification(
        //     "setLimitBreached",
        //     `- ${fieldName}, Critical level reached. Immediate attention required.`,
        //     {
        //       id: entryId,
        //       name: logName,
        //     },
        //     "logs",
        //     userId
        //   );
        //   notificationsHasToSend.push(notificationBody);
        // }
      } else if (
        (reqEntry.type === "text" || reqEntry.type === "date") &&
        breakDown === false
      ) {
        fieldDetails.fieldValue = updatedFieldValue.fieldValue;
      } else if (
        (reqEntry.type === "multiplechoice" ||
          reqEntry.type === "checkboxes" ||
          reqEntry.type === "dropdown") &&
        breakDown === false
      ) {
        const fieldValues = updatedFieldValue ? updatedFieldValue.fieldValue : [];
        const entryFieldValue = fieldDetails.fieldValue
          ? fieldDetails.fieldValue
          : [];
        const entryIds = entryFieldValue.map((item) => item._id);
        fieldValues.forEach((item) => {
          if (item === "") {
            throw `Please provide valid field value for index ${reqEntry.index}.It can't be empty`;
          }
          if (typeof item !== "object") {
            throw `Please provide valid field value for index ${reqEntry.index}.It should be array of object`;
          }
          if (!entryIds.includes(item.id)) {
            throw `Please provide valid field value for index ${reqEntry.index}.Provided field id is not valid`;
          }
        });
        if (fieldValues.length > entryFieldValue.length) {
          throw `Please provide valid field value for index ${reqEntry.index}.Its length exceeds the existing field values.`;
        }
        let count = 0;
        fieldDetails.fieldValue = fieldDetails.fieldValue.map((option) => {
         const matched = fieldValues.find(fv => fv.id === option._id);
        if (matched) {
          count++;
          return { ...option, isActive: matched.isActive };
        }
          return option;
        });
      } else if (breakDown) {
        fieldDetails.breakDown = true;
      }

      if (updatedFieldValue !== undefined) {
        entryDataSetsMap.set(reqEntry.index, fieldDetails);
      }
    }
    const newBody = {
      ...entryData.toObject(),
      data: entryData.data,
      status: "completed",
      updatedBy: userId,
    };
    const deleteOld = await deleteOne(LogEntryModel, { _id: entryId });
    if (deleteOld.acknowledged) await insertOne(LogEntryModel, newBody);
    for (let operatorId of operatorIds){
    if (mongoose.Types.ObjectId.isValid(operatorId)) {
      const notificationBody = constructNotification(
        "revise",
        `has been revised by ${engineer_Name}.`,
        {
          id: entryId,
          name: logName,
        },
        "logs",
        userId,
        log.businessUnit
      );
        await sendViaUserID("notification", operatorId, notificationBody);
      }
    }
    handleSendNotification(notificationsHasToSend, engineerId);
    if (emailNotificationsToSend.length > 0) {
      await processAndSendEmailNotifications(emailNotificationsToSend);
    }
    
    return true;
  } catch (err) {
    console.log("err", err);
    throw err;
  }
};

const logEntryStats = async (userId, assetId) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(assetId)) {
      throw "Please provide correct assetId";
    }
    const asset = await findOne(Assets, { _id: assetId }, {});
    if (!asset) {
      throw "Please provide correct assetId";
    }
    let newLogs = 0;
    let pendingForApprovals = 0;
    let overdues = 0;
    const logs = await findAll(LogModel, { assetId }, { _id: 1 });
    if (logs.length > 0) {
      for (let i = 0; i < logs.length; i++) {
        const logId = logs[i]._id.toString();
        const logEntryStatusAggregation = [
          // {
          //   $match: {
          //     $or: [
          //       { status: "scheduled" },
          //       { status: "pendingForApproval" },
          //       { status: "overdue" },
          //     ],
          //     $or: [
          //         { operatorIds: {$in:userId} },
          //         { createdBy: userId }
          //     ],
          //     logId,
          //   },
          // },
          {
            $match: {
              $and: [
                {
                  $or: [
                    { status: "scheduled" },
                    { status: "pendingForApproval" },
                    { status: "overdue" },
                  ]
                },
                {
                  $or: [
                    { operatorIds: { $in: [userId] } },
                    { createdBy: userId },
                    {approvers: { $in :[userId]}}
                  ]
                },
                { logId: logId }
              ]
            }
          },
          {
            $group: {
              _id: null,
              scheduledLogs: {
                $sum: {
                  $cond: {
                    if: { $eq: ["$status", "scheduled"] },
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
              overdue: {
                $sum: {
                  $cond: {
                    if: { $eq: ["$status", "overdue"] },
                    then: 1,
                    else: 0,
                  },
                },
              },
            },
          },
        ];
        const statusCounts = await aggregation(
          LogEntryModel,
          logEntryStatusAggregation
        );
        if (statusCounts.length > 0) {
          newLogs += +statusCounts[0].scheduledLogs;
          pendingForApprovals += +statusCounts[0].pendingForApproval;
          overdues += +statusCounts[0].overdue;
        }
      }
    }
    return {
      newLogs,
      pendingForApprovals,
      overdues,
    };
  } catch (err) {
    throw err;
  }
};

async function handleSendNotification(notificationsHasToSend, sender) {
  // console.log('notificationsHasToSend:', notificationsHasToSend)
  const sendPromises = notificationsHasToSend.map(async (notification) => {
    try {
      await sendViaUserID("notification", sender, notification);
    } catch (error) {
      console.error(`Failed to send notification to user ${sender}:`, error);
    }
  });
  await Promise.all(sendPromises);
}

//CR0002
// Start SUMIT 03-03-2026 ---------------------

const buildLogEntryQuery = (reqQuery, userId) => {
  const query = {};

  // ================= STATUS FILTER =================
  if (reqQuery.status) {
    query.status = {
      $in: reqQuery.status
        .split(",")
        .map((s) => new RegExp(`^${s.trim()}$`, "i")),
    };
  }

  // ================= LOG ID FILTER =================
  if (reqQuery.logId && mongoose.Types.ObjectId.isValid(reqQuery.logId)) {
    query.logId = new mongoose.Types.ObjectId(reqQuery.logId);
  }

  // ================= ASSET FILTER (ObjectId) =================
  if (reqQuery.assetId && mongoose.Types.ObjectId.isValid(reqQuery.assetId)) {
    query.assetId = new mongoose.Types.ObjectId(reqQuery.assetId);
  }

  // ================= CREATED DATE FILTER =================
  if (reqQuery.createdAt) {
    query.createdAt = {
      $gte: new Date(reqQuery.createdAt + "T00:00:00.000Z"),
      $lte: new Date(reqQuery.createdAt + "T23:59:59.999Z"),
    };
  }

  if (reqQuery.createdAt_lte) {
    query.createdAt = {
      ...query.createdAt,
      $lte: new Date(reqQuery.createdAt_lte),
    };
  }

  if (reqQuery.createdAt_gte) {
    query.createdAt = {
      ...query.createdAt,
      $gte: new Date(reqQuery.createdAt_gte),
    };
  }

  // ================= ACCESS CONTROL =================
  query.$or = [
    { createdBy: userId },
    { operatorIds: { $in: [userId] } },
    { approvers: { $in: [userId] } },
  ];

  return query;
};




const allEntries = async (query, userId, page = 1, limit = 15, allData, allDetails) => {
  try {
    const finalQuery = buildLogEntryQuery(query, userId);
    
    const { assetId, logId, status } = query;

const [validateQueryResult, entriesCountResult] = await Promise.all([
  validateEntryQuery(assetId, logId, status, userId),
  count(LogEntryModel, finalQuery)   // Use finalQuery for counting to ensure consistency with data retrieval
]);
//End

    if (!validateQueryResult.success) {
      throw new Error(validateQueryResult.message);
    }

    const entriesCount = entriesCountResult;
    if (!entriesCount) {
      return { 
        currentPage: page, 
        totalPageCount: 1, 
        totalDataCount: 0, 
        data: [] 
      };
    }
    
    // Optimize pagination calculation
    const totalPages = Math.ceil(entriesCount / limit);
    const skip = allData === "true" ? 0 : (page - 1) * limit;
    const currentLimit = allData === "true" ? entriesCount : limit;

    // Optimized Aggregation Pipeline
    const entryAgg = [
      { $match: finalQuery },
      // { $match: query }, //SUMIT 17-03-2026 
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: currentLimit },
      {
        $addFields: {
          createdBy: {
            $convert: {
              input: "$createdBy",
              to: "objectId",
              onError: null,
              onNull: null,
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
          logId: {
            $convert: {
              input: "$logId",
              to: "objectId",
              onError: null,
              onNull: null,
            },
          },
          assetId: {
            $convert: {
              input: "$assetId",
              to: "objectId",
              onError: null,
              onNull: null,
            },
          },
        },
      },
      // Parallel Lookups with Optimized Matching
      {
        $lookup: {
          from: "users",
          let: { 
            updatedById: "$updatedBy",
            createdById: "$createdBy"
          },
          pipeline: [
            { 
              $match: { 
                $expr: { 
                  $or: [
                    { $eq: ["$_id", "$$updatedById"] },
                    { $eq: ["$_id", "$$createdById"] }
                  ] 
                } 
              } 
            },
            { $project: { name: 1, _id: 1 } }
          ],
          as: "userDetails"
        }
      },
      {
        $lookup: {
          from: "logs",
          localField: "logId",
          foreignField: "_id",
          pipeline: [{ $project: { logNumber: 1, name: 1 } }],
          as: "logDetails"
        }
      },
      {
        $lookup: {
          from: "assets",
          localField: "assetId",
          foreignField: "_id",
          pipeline: [{ $project: { "assetName": "$generalDetails.name" } }],
          as: "assetDetails"
        }
      },

      {
        $addFields: {
          updatedBy: { 
            $ifNull: [
              { $arrayElemAt: [
                "$userDetails",
                { $indexOfArray: ["$userDetails._id", "$updatedBy"] }
              ] },
              { name: "Not Available" }
            ] 
          },
          createdBy: { 
            $ifNull: [
              { $arrayElemAt: [
                "$userDetails",
                { $indexOfArray: ["$userDetails._id", "$createdBy"] }
              ] },
              { name: "Not Available" }
            ]
          },
          assetName: { 
            $ifNull: [{ $arrayElemAt: ["$assetDetails.assetName", 0] }, "No Asset Name"] 
          },
          logNumber: { 
            $ifNull: [{ $arrayElemAt: ["$logDetails.logNumber", 0] }, "No Log Number"] 
          },
          logName: { 
            $ifNull: [{ $arrayElemAt: ["$logDetails.name", 0] }, "No Log Name"] 
          }
        }
      },
      
      
      // Final Projection

      {
        $project: {
          logId: 1,
          entryNumber: 1,
          entryCreatedAt: 1,
          endTime: 1,
          status: 1,
          createdAt: 1,
          assetId: 1,
          updatedBy: "$updatedBy.name",
          createdBy: "$createdBy.name",
          assetName: 1,  // Directly use extracted field
          logNumber: 1,  //  Directly use extracted field
          logName: 1,    //  Directly use extracted field
          ...(allDetails === "true" && { data: 1 })
        }
      }
      
    ];
    
    // Run aggregation with performance optimization
    const data = await aggregation(LogEntryModel, entryAgg, { 
      allowDiskUse: true,
      maxTimeMS: 30000 // Timeout to prevent long-running queries
    });
    let updatedEntries = data;
    // console.log("data", data)
    // Optimized Asset Details Retrieval
    if (allDetails === "true") {
      // Update the data field inside each entry
      const assets = await findAll(Assets, {}, { _id: 1, "generalDetails.name": 1 });
      const assetLookup = assets.reduce((acc, asset) => {
        acc[asset._id.toString()] = asset.generalDetails.name;
        return acc;
      }, {});

      updatedEntries = data.map((entry) => {
        entry.data = entry.data || []; // Ensure data exists
        entry.data = entry.data.map((entryData) => {
          const assetIdString = entryData.asset ? entryData.asset.toString() : "";
          entryData.assetId = assetIdString;
          entryData.asset = assetLookup[assetIdString] || "";
          return entryData;
        });
        return entry;
      });
    }

    return {
      currentPage: page,
      totalPageCount: totalPages,
      totalDataCount: entriesCount,
      data,
    };

  } catch (err) {
    throw new Error(err.message || "An error occurred while fetching entries");
  }
};


// const allEntries = async (query, userId, page = 1, limit = 15, allData, allDetails) => {
//   try {
//     const { assetId, logId, status, logIds } = query;
    
//     // Optimize query handling
//     if (logIds) {
//       query.logId = logIds;
//       delete query.logIds;
//     }
    
//     // Parallel validation to reduce initial overhead
//     const [validateQueryResult, entriesCountResult] = await Promise.all([
//       validateEntryQuery(assetId, logId, status, userId),
//       count(LogEntryModel, query)
//     ]);

//     if (!validateQueryResult.success) {
//       throw new Error(validateQueryResult.message);
//     }

//     const entriesCount = entriesCountResult;
//     if (!entriesCount) {
//       return { 
//         currentPage: page, 
//         totalPageCount: 1, 
//         totalDataCount: 0, 
//         data: [] 
//       };
//     }
    
//     // Optimize pagination calculation
//     const totalPages = Math.ceil(entriesCount / limit);
//     const skip = allData === "true" ? 0 : (page - 1) * limit;
//     const currentLimit = allData === "true" ? entriesCount : limit;

//     // Optimized Aggregation Pipeline
//     const entryAgg = [
//       { $match: finalQuery },
//       // { $match: query }, //SUMIT 03-03-2026 
//       { $sort: { createdAt: -1 } },
//       { $skip: skip },
//       { $limit: currentLimit },
//       {
//         $addFields: {
//           createdBy: {
//             $convert: {
//               input: "$createdBy",
//               to: "objectId",
//               onError: null,
//               onNull: null,
//             },
//           },
//           updatedBy: {
//             $convert: {
//               input: "$updatedBy",
//               to: "objectId",
//               onError: null,
//               onNull: null,
//             },
//           },
//           logId: {
//             $convert: {
//               input: "$logId",
//               to: "objectId",
//               onError: null,
//               onNull: null,
//             },
//           },
//           assetId: {
//             $convert: {
//               input: "$assetId",
//               to: "objectId",
//               onError: null,
//               onNull: null,
//             },
//           },
//         },
//       },
//       // Parallel Lookups with Optimized Matching
//       {
//         $lookup: {
//           from: "users",
//           let: { 
//             updatedById: "$updatedBy",
//             createdById: "$createdBy"
//           },
//           pipeline: [
//             { 
//               $match: { 
//                 $expr: { 
//                   $or: [
//                     { $eq: ["$_id", "$$updatedById"] },
//                     { $eq: ["$_id", "$$createdById"] }
//                   ] 
//                 } 
//               } 
//             },
//             { $project: { name: 1, _id: 1 } }
//           ],
//           as: "userDetails"
//         }
//       },
//       {
//         $lookup: {
//           from: "logs",
//           localField: "logId",
//           foreignField: "_id",
//           pipeline: [{ $project: { logNumber: 1, name: 1 } }],
//           as: "logDetails"
//         }
//       },
//       {
//         $lookup: {
//           from: "assets",
//           localField: "assetId",
//           foreignField: "_id",
//           pipeline: [{ $project: { "assetName": "$generalDetails.name" } }],
//           as: "assetDetails"
//         }
//       },

//       {
//         $addFields: {
//           updatedBy: { 
//             $ifNull: [
//               { $arrayElemAt: [
//                 "$userDetails",
//                 { $indexOfArray: ["$userDetails._id", "$updatedBy"] }
//               ] },
//               { name: "Not Available" }
//             ] 
//           },
//           createdBy: { 
//             $ifNull: [
//               { $arrayElemAt: [
//                 "$userDetails",
//                 { $indexOfArray: ["$userDetails._id", "$createdBy"] }
//               ] },
//               { name: "Not Available" }
//             ]
//           },
//           assetName: { 
//             $ifNull: [{ $arrayElemAt: ["$assetDetails.assetName", 0] }, "No Asset Name"] 
//           },
//           logNumber: { 
//             $ifNull: [{ $arrayElemAt: ["$logDetails.logNumber", 0] }, "No Log Number"] 
//           },
//           logName: { 
//             $ifNull: [{ $arrayElemAt: ["$logDetails.name", 0] }, "No Log Name"] 
//           }
//         }
//       },
      
      
//       // Final Projection

//       {
//         $project: {
//           logId: 1,
//           entryNumber: 1,
//           entryCreatedAt: 1,
//           endTime: 1,
//           status: 1,
//           createdAt: 1,
//           assetId: 1,
//           updatedBy: "$updatedBy.name",
//           createdBy: "$createdBy.name",
//           assetName: 1,  // Directly use extracted field
//           logNumber: 1,  //  Directly use extracted field
//           logName: 1,    //  Directly use extracted field
//           ...(allDetails === "true" && { data: 1 })
//         }
//       }
      
//     ];
    
//     // Run aggregation with performance optimization
//     const data = await aggregation(LogEntryModel, entryAgg, { 
//       allowDiskUse: true,
//       maxTimeMS: 30000 // Timeout to prevent long-running queries
//     });
//     let updatedEntries = data;
//     // console.log("data", data)
//     // Optimized Asset Details Retrieval
//     if (allDetails === "true") {
//       // Update the data field inside each entry
//       const assets = await findAll(Assets, {}, { _id: 1, "generalDetails.name": 1 });
//       const assetLookup = assets.reduce((acc, asset) => {
//         acc[asset._id.toString()] = asset.generalDetails.name;
//         return acc;
//       }, {});

//       updatedEntries = data.map((entry) => {
//         entry.data = entry.data || []; // Ensure data exists
//         entry.data = entry.data.map((entryData) => {
//           const assetIdString = entryData.asset ? entryData.asset.toString() : "";
//           entryData.assetId = assetIdString;
//           entryData.asset = assetLookup[assetIdString] || "";
//           return entryData;
//         });
//         return entry;
//       });
//     }

//     return {
//       currentPage: page,
//       totalPageCount: totalPages,
//       totalDataCount: entriesCount,
//       data,
//     };

//   } catch (err) {
//     throw new Error(err.message || "An error occurred while fetching entries");
//   }
// };



const particularEntryDetails = async (entryId, userId) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(entryId)) {
      throw "Please provide correct entryId";
    }
    const entryAgg = [
      {
        $match: { _id: new ObjectId(entryId),
          $or: [{ createdBy: userId }, { operatorIds: userId }, {approvers: { $in: [userId] } }] 
         },
      },
      {
        $addFields: {
          updatedBy: {
            $convert: {
              input: "$updatedBy",
              to: "objectId",
              onError: null,
              onNull: null,
            },
          },
          approvers: {
            $map: {
              input: "$approvers",
              as: "approver",
              in: { $toObjectId: "$$approver" },
            },
          },
          approvedBy: {
            $map: {
              input: "$approvedBy",
              as: "approvedBy",
              in: { $toObjectId: "$$approvedBy" },
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
          from: "users",
          localField: "updatedBy",
          foreignField: "_id",
          as: "userDetails",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "approvers",
          foreignField: "_id",
          as: "approverDetails",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "approvedBy",
          foreignField: "_id",
          as: "approvedByDetails",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "createdBy",
          foreignField: "_id",
          as: "createdByDetails",
        },
      },
      {
        $addFields: {
          updatedBy: {
            $ifNull: [
              { $arrayElemAt: ["$userDetails.name", 0] },
              "Not Available",
            ],
          },
          createdBy: {
            $ifNull: [
              { $arrayElemAt: ["$createdByDetails.name", 0] },
              "Not Available",
            ],
          },
        },
      },
      {
        $project: {
          _id: 1,
          entryNumber: 1,
          entryCreatedAt: 1,
          logId: 1,
          status: 1,
          assetId: 1,
          approvers:"$approverDetails.name",
          approvedBy:"$approvedByDetails.name",
          updatedBy: 1,
          createdAt: 1,
          updatedAt: 1,
          templateId: 1,
          data: 1,
          createdBy: 1,
        },
      },
    ];
    const entry = await aggregation(LogEntryModel, entryAgg);
    if (entry.length > 0) {
      const assets = await findAll(
        Assets,
        {},
        { _id: 1, "generalDetails.name": 1 }
      );
      let logEntryResult = entry[0]
      if (formulaApproach == formulaApproaches.PROCESS_AT_FETCH_TIME) {
        logEntryResult = await evaluateTemplate(entry[0]); // Call the evaluateTemplate function
      }
      const dataSets = logEntryResult.data;
      const assetLookup = assets.reduce((acc, asset) => {
        acc[asset._id.toString()] = asset.generalDetails.name;
        return acc;
      }, {});
      const updatedEntryData = dataSets.map((entry) => {
        const assetIdString = entry.asset ? entry.asset.toString() || "" : "";
        if (assetLookup[assetIdString]) {
          entry.asset = assetLookup[assetIdString];
          entry.assetId = assetIdString;
        } else {
          entry.asset = "";
          entry.assetId = assetIdString;
        }
        return entry;
      });
      return entry[0];
    } else {
      throw "You cant access this entry details.";
    }
  } catch (err) {
    console.log(err);
    throw err;
  }
};

const uploadEntryImages = async (data, entryId, userId) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(entryId)) {
      throw "Please provide correct entryId";
    }
    const entry = await findOne(LogEntryModel, { _id: entryId }, { images: 1 });
    if (entry === null) {
      throw "Please provide correct entryId";
    }
    const docIds = entry.images ? entry.images : [];
    for (let i = 0; i < data.length; i++) {
      const doc = data[i];
      if (doc && doc.id) {
        docIds.push(doc.id.toString());
      }
    }
    let responseBody;
    if (docIds.length > 0) {
      responseBody = docIds.map((item) => {
        return {
          imageId: item._id ? item._id.toString() : "",
          uploadedBy: userId,
          addedAt: new Date(),
        };
      });
    }
    const update = await updateOne(
      LogEntryModel,
      { _id: entryId },
      { images: responseBody }
    );
    if (update.acknowledged) {
      return true;
    }
    throw "Please provide correct entryId";
  } catch (err) {
    throw err;
  }
};

const uploadEntryNotes = async (data, entryId, userId) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(entryId)) {
      throw "Please provide correct entryId";
    }
    const entry = await findOne(
      LogEntryModel,
      { _id: entryId },
      { _id: 0, notes: 1 }
    );
    if (entry === null) {
      throw "Please provide correct entryId";
    }
    const entryNotes = entry?.notes ? entry.notes : [];
    if (data && data.note) {
      entryNotes.push({
        userId: userId,
        note: data.note,
        addedAt: Date.now(),
      });
    }
    const updateBody = { notes: entryNotes };
    const update = await updateOne(LogEntryModel, { _id: entryId }, updateBody);
    if (update.acknowledged) {
      return true;
    }
    throw "Please provide correct entryId";
  } catch (err) {
    throw err;
  }
};

const getEntryImages = async (entryId, host, protocol) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(entryId)) {
      throw "Please provide correct entryId";
    }
    const entry = await findOne(LogEntryModel, { _id: entryId }, { images: 1, businessUnit: 1 });
    if (!entry) {
      throw "Please provide correct entryId";
    }
    let responseBody = [];
    const imagesDetails = entry.images ? entry.images : [];
    const imageIds = imagesDetails.map((item) => {
      return item.imageId;
    });
    if (imageIds.length > 0) {
      responseBody = await getFiles(imageIds, "view", entry.businessUnit, host, protocol);
      if (responseBody.data.length > 0) {
        const imagesD = await Promise.all(
          responseBody.data.map(async (item) => {
            const matchedImage = imagesDetails.find(
              (i) => item.id.toString() === i.imageId
            );
            if (matchedImage) {
              const uploadedBy = await findOne(
                User,
                { _id: matchedImage.uploadedBy },
                { _id: 1, name: 1, email:1 }
              );
              return {
                _id: item.id.toString(),
                name: item.name || "",
                extension: item.extension || "",
                contentType: item.contentType || "",
                url: item.url || "",
                size: item.size || "",
                moduleName: "logs",
                moduleId: "",
                uploadedBy: { id: uploadedBy?._id, name: uploadedBy?.name, email: uploadedBy?.email },
              };
            }
            return null;
          })
        );
        const filteredImagesD = imagesD.filter(Boolean);
        return filteredImagesD;
      }
    }
    else {
      throw "No image Present for this log"
    }
  } catch (err) {
    throw err;
  }
};

const getEntryNotes = async (entryId) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(entryId)) {
      throw "Please provide correct entryId";
    }
    const entry = await findOne(LogEntryModel, { _id: entryId });
    if (!entry) {
      throw "Please provide correct entryId";
    }
    const notesDetails = entry.notes ? entry.notes : [];
    if (notesDetails.length > 0) {
      const notesD = await Promise.all(
        notesDetails.map(async (item) => {
          const uploadedBy = await findOne(
            User,
            { _id: item.userId },
            { _id: 0, name: 1 }
          );
          return {
            name: uploadedBy.name ? uploadedBy.name : "Undefined",
            addedAt: item.addedAt,
            note: item.note,
            profilePhoto: "",
          };
        })
      );
      return notesD;
    }
    throw "No Notes for this entry.";
  } catch (err) {
    throw err;
  }
};

const getAllEntryData = async (query, entriesCount) => {
  try {
    const entryAgg = [
      { $match: query },
      {
        $addFields: {
          updatedBy: {
            $convert: {
              input: "$updatedBy",
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
          logId: {
            $convert: {
              input: "$logId",
              to: "objectId",
              onError: null,
              onNull: null,
            },
          },
          assetId: {
            $convert: {
              input: "$assetId",
              to: "objectId",
              onError: null,
              onNull: null,
            },
          },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "updatedBy",
          foreignField: "_id",
          as: "userDetails",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "createdBy",
          foreignField: "_id",
          as: "createdByDetails",
        },
      },
      {
        $lookup: {
          from: "logs",
          localField: "logId",
          foreignField: "_id",
          as: "logDetails",
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
        $addFields: {
          updatedBy: {
            $ifNull: [
              { $arrayElemAt: ["$userDetails.name", 0] },
              "Not Available",
            ],
          },
          createdBy: {
            $ifNull: [
              { $arrayElemAt: ["$createdByDetails.name", 0] },
              "Not Available",
            ],
          },
        },
      },
      {
        $addFields: {
          logDetails: {
            $ifNull: [{ $arrayElemAt: ["$logDetails", 0] }, "Not Available"],
          },
        },
      },
      {
        $addFields: {
          assetName: {
            $ifNull: [
              { $arrayElemAt: ["$assetDetails.generalDetails.name", 0] },
              "Not Available",
            ],
          },
        },
      },
      {
        $project: {
          logId: 1,
          entryNumber: 1,
          entryCreatedAt: 1,
          endTime: 1,
          status: 1,
          updatedBy: 1,
          createdAt: 1,
          assetId: 1,
          assetName: "$assetName",
          logNumber: "$logDetails.logNumber",
          logName: "$logDetails.name",
          createdBy: "$createdBy",
        },
      },
      {
        $sort: { createdAt: -1 },
      },
    ];
    const data = await aggregation(LogEntryModel, entryAgg);
    return data;
  } catch (err) {
    console.log("err:", err);
    throw err;
  }
};

const validateEntryQuery = async (assetId, logId, status, userId) => {
  try {
    if (status) {
      const validStatus = [
        "scheduled",
        "overdue",
        "completed",
        "revised",
        "pendingforapproval",
        "inprogress"
      ];
      let statusType = typeof status;
      const provideStatus = statusType === "object" ? status["$in"] : [status];
      const unmatchedElements = provideStatus.filter(
        (item) => !validStatus.includes(item.toLowerCase())
      );
      if (unmatchedElements.length > 0) {
        return {
          success: false,
          message:
            "Provide correct status. The correct status are scheduled, overdue, completed, revised, pendingForApproval",
        };
      }
    }
    if (assetId) {
      if (!mongoose.Types.ObjectId.isValid(assetId)) {
        return {
          success: false,
          message: "Please provide correct assetId",
        };
      }
      const asset = await findOne(Assets, { _id: assetId }, {});
      if (!asset)
        return {
          success: false,
          message: "Please provide correct assetId",
        };
    }
    if (logId) {
      if (!mongoose.Types.ObjectId.isValid(logId)) {
        return { success: false, message: "Please provide correct logId" };
      }
      const log = await findOne(LogModel, { _id: logId }, {});
      if (!log)
        return { success: false, message: "Please provide correct logId" };
    }
    if (userId) {
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return { success: false, message: "Please provide correct userId" };
      }
      const user = await findOne(User, { _id: userId }, {});
      if (!user)
        return { success: false, message: "Please provide correct userId" };
    }
    return { success: true };
  } catch (err) {
    throw err;
  }
};

const updateFieldWhenImagesAdded = async (fieldId, logId, entryId, imageIds) => {
  try{
    if (!Array.isArray(imageIds)) {
      imageIds = [imageIds];
    }
    const updateFieldWithImageId = await mongoDbManager.updateOne(
      LogEntryModel,
      { "data._id": fieldId, logId:logId, _id:entryId }, // Cast workOrderId to ObjectId
      { $push: { "data.$.images": { $each: imageIds } } } // Use $each to push the array
    );
    return updateFieldWithImageId;
  }catch(error){
    console.log("Error", error);
    throw error;
  }
};

const getFieldImages = async (logId, entryId, fieldId, reqQuery, reqHost, reqProtocol, businessUnit) => {
  try {
    const fileDocuments =[];
    let page = reqQuery.page ? parseInt(reqQuery.page, 10) : 0;
    let limit = reqQuery.limit ? parseInt(reqQuery.limit, 10) : 200;
    const sort = reqQuery.sort || "createdAt";
    const order = reqQuery.order === "asc" ? 1 : -1;
    const sortOrder = { [sort]: order };
    if (isNaN(page) || page < 1) page = 1;
    if (isNaN(limit) || limit < 1) limit = 200;
    const result = await LogEntryModel.aggregate([
      { 
        $match: { 
          logId: logId, 
          _id: new mongoose.Types.ObjectId(entryId),
          businessUnit: new mongoose.Types.ObjectId(businessUnit)
        } 
      },
      { 
        $project: {
          data: {
            $arrayElemAt: [
              {
                $filter: {
                  input: "$data",
                  as: "item",
                  cond: { $eq: ["$$item._id", new mongoose.Types.ObjectId(fieldId)] }
                }
              },
              0  // Get the first matched object instead of returning an array
            ]
          }
        }
      },
      { 
        $lookup: {
          from: "files", 
          localField: "data.images",  // Array of image IDs
          foreignField: "_id", 
          as: "data.images"  // Store populated images separately
        }
      },
      { 
        $addFields: {
          totalImages: { $size: "$data.images" },  // Get total image count
          data: {
            images: { 
              $slice: ["$data.images", (page - 1) * (limit), limit] 
            }
          }
        }
      }
    ]);  
    const getImages = result[0];
    if (getImages.data.images && getImages.data.images.length > 0) {
          for (let document of getImages.data.images) {
            const images = await fileManager.transformFileObj(
              document,
              "download",
              reqHost,
              reqProtocol
            );
            fileDocuments.push(images);
          }
          getImages.data.images = fileDocuments;
        }
        const countData = getImages.totalImages
        const totalPages =
        countData === 0
          ? 0
          : limit === 0
          ? 1
          : Math.ceil(countData / limit);

            return paginationHandler.paginationResObj(
              page,
              totalPages,
              countData,
              fileDocuments
            );
  } catch (error) {
    console.log("Error:", error);
    throw error;
  }
};


// Object to handle operations
const operations = {
  add: (a, b) => a + b,
  subtract: (a, b) => a - b,
  multiply: (a, b) => a * b,
  divide: (a, b) => {
    if (b === 0) throw new Error("Division by zero error");
    return a / b;
  },
  power: (base, exponent) => Math.pow(base, exponent),
  sqrt: (value) => Math.sqrt(value),
  root: (value, degree) => Math.pow(value, 1 / degree), // For nth root
};




async function validateFormula(formula, referenceStack = new Map()) {
  if (formula.type === "constant") {
    return true; // Constants are always valid
  } else if (formula.type === "reference") {
    // Validate reference formula
    return await validateResolveReference(formula, referenceStack);
  } else if (formula.type === "formula") {
    // Validate left and right operands
    const leftValid = await validateFormula(formula.left, referenceStack); // Validate left operand
    const rightValid = await validateFormula(formula.right, referenceStack); // Validate right operand

    // Ensure both left and right values are valid before checking the operation
    if (!leftValid || !rightValid) {
      throw new Error("Invalid formula");
    }

    // Ensure the operation exists in the operations object
    if (!(formula.operation in operations)) {
      console.warn(`Unknown operation: ${formula.operation}`);
      throw new Error(`Unknown operation: ${formula.operation}`);
    }

    return true; // Return true if everything is valid
  } else {
    console.warn(`Invalid formula type: ${formula.type}`);
    throw new Error(`Invalid formula type: ${formula.type}`);
  }
}

async function validateResolveReference(formula, referenceStack = new Map()) {
  try {
    const { logId, templateId, dataEntryId } = formula.value;

    // Validate logId and templateId
    if (!mongoose.Types.ObjectId.isValid(logId)) {
      console.warn(`Invalid logId: ${logId}`);
      throw new Error("Invalid logId");
    }

    if (!mongoose.Types.ObjectId.isValid(templateId)) {
      console.warn(`Invalid templateId: ${templateId}`);
      throw new Error("Invalid templateId");
    }

    if (!mongoose.Types.ObjectId.isValid(dataEntryId)) {
      console.warn(`Invalid dataEntryId: ${dataEntryId}`);
      throw new Error("Invalid dataEntryId");
    }

    // Check for circular reference
    const referenceKey = `${logId}-${templateId}-${dataEntryId}`;
    if (referenceStack.has(referenceKey)) {
      console.warn(`Circular reference detected: ${referenceKey}`);
      throw new Error(`Circular reference detected: ${referenceKey}`);
    }

    // Add current reference to the stack
    referenceStack.set(referenceKey, null); // Mark it as processing

    // Check if log exists
    const existingLog = await LogModel.findOne({ _id: logId });
    if (!existingLog) {
      console.warn(`Log not found: ${logId}`);
      throw new Error(`Log not found: ${logId}`);
    }

    // Check if log structure exists
    const logStructure = await LogStructureModel.findOne({ logId: logId, templateId: templateId });
    if (!logStructure) {
      console.warn(`Log structure not found for logId: ${logId}, templateId: ${templateId}`);
      throw new Error(`Log structure not found for logId: ${logId}, templateId: ${templateId}`);
    }

    // Check if log template exists
    const query = {
      _id: new mongoose.Types.ObjectId(templateId),
      'dataSets._id': dataEntryId,
    };
    const projection = {
      'dataSets.$': 1, // $ operator projects the matched element in the `data` array
    };
    const logTemplate = await LogTemplateModel.findOne(query, projection);
    if (!logTemplate) {
      console.warn(`Log template not found for templateId: ${templateId} and dataEntryId: ${dataEntryId}`);
      throw new Error(`Log template not found for templateId: ${templateId} and dataEntryId: ${dataEntryId}`);
    }

    // Remove the current reference from the stack before returning
    referenceStack.delete(referenceKey);

    return true; // Return true if everything passes
  } catch (error) {
    console.error("Error in validateResolveReference:", error);
    throw error;
  }
}

async function resolveReference(formula, entryCreatedAt, referenceStack = new Map()) {
  if (formula.type === "constant") {
    return formula.value; // Directly return the constant value
  } else if (formula.type === "reference") {
    const { logId, templateId, dataEntryId } = formula.value;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(logId)) {
      console.warn(`Invalid logId: ${logId}`);
      throw new Error("Invalid logId");
    }
    if (!mongoose.Types.ObjectId.isValid(templateId)) {
      console.warn(`Invalid templateId: ${templateId}`);
      throw new Error("Invalid templateId");
    }

    // Check for circular reference
    // const referenceKey = `${logId}-${templateId}-${dataEntryId}`;
    // if (referenceStack.has(referenceKey)) {
    //   console.warn(`Circular reference detected: ${referenceKey}`);
    //   return '';  // Return empty to avoid circular reference
    // }

    // Check if already resolved
    // if (referenceStack.has(referenceKey)) {
    //   return referenceStack.get(referenceKey); // Return cached value
    // }

    const existingLog = await LogModel.findOne({ _id: logId });
    if (!existingLog) {
      console.warn(`Log not found: ${logId}`);
      throw new Error(`Log not found: ${logId}`);
    }

    // Check if log template exists
    const logTemplate = await LogTemplateModel.findOne({ _id: templateId, 'dataSets._id': dataEntryId }, {
      'dataSets.$': 1
    });

    if (!logTemplate) {
      console.warn(`Log template not found for templateId: ${templateId}`);
      throw new Error(`Log template not found for templateId: ${templateId}`);
    }

    // Mark it as processing
    // referenceStack.set(referenceKey, null); // Mark it as processing

    const normalizedEntryCreatedAt = new Date(entryCreatedAt);
    normalizedEntryCreatedAt.setSeconds(0, 0);  // Set seconds and milliseconds to 0
    const toleranceMs = 2 * 60 * 1000; // ±2 minutes

    const query = {
      logId,
      templateId,
      'data._id': dataEntryId,
      entryCreatedAt: {
        $gte: new Date(normalizedEntryCreatedAt.getTime() - toleranceMs),
        $lte: new Date(normalizedEntryCreatedAt.getTime() + toleranceMs),
      },
    };
    const projection = {
      'data.$': 1, // $ operator projects the matched element in the `data` array
      entryCreatedAt: 1,
    };

    let result;
    if (logTemplate.dataSets[0].formula) {
      result = await processFormula(logTemplate.dataSets[0].formula, entryCreatedAt, referenceStack);
    } else {
      const logEntry = await LogEntryModel.findOne(query, projection);
      if (!logEntry) {
        return ""; // If log entry is not found, return a default value like 0
      }
      result = logEntry.data[0].fieldValue;
    }

    // Cache the resolved value
    // referenceStack.set(referenceKey, Number(result)); // Ensure result is a number
    if (result === null || result === '') {
      return '';
    }
    return Number(result); // Return the resolved field value
  }
}

// Updated processFormula function to handle formulas more robustly
async function processFormula(formula, entryCreatedAt, referenceStack = new Map()) {
  if (formula.type === "constant") {
    return formula.value; // Return constant directly
  } else if (formula.type === "reference") {
    const resolvedValue = await resolveReference(formula, entryCreatedAt, referenceStack);
    if (resolvedValue === null || resolvedValue === '') {
      return ""; // Default to 0 if the reference can't be resolved
    }
    return resolvedValue;
  } else if (formula.type === "formula") {
    const leftValue = await processFormula(formula.left, entryCreatedAt, referenceStack); // Process left operand
    const rightValue = await processFormula(formula.right, entryCreatedAt, referenceStack); // Process right operand

    // Perform the operation based on the defined operation using the operations object
    if (!(formula.operation in operations)) {
      throw new Error(`Unknown operation: ${formula.operation}`);
    }

    // Ensure that both left and right values are valid before performing the operation
    if (leftValue !== null && leftValue !== '' && rightValue !== null && rightValue !== '') {
      return operations[formula.operation](leftValue, rightValue);
    } else {
      return ""; // Default to 0 if any part is unresolved
    }
  }
}

// Example usage of the evaluateTemplate function
async function evaluateTemplate(entry) {
  try {
    const templateId = entry.templateId;
    const template = await LogTemplateModel.findById(templateId);
    if (!template) {
      throw new Error(`Template with ID ${templateId} not found`);
    }

    // Iterate over the datasets and evaluate formulas
    for (let i = 0; i < template.dataSets.length; i++) {
      const dataSet = template.dataSets[i];

      if (dataSet.formula) {
        const result = await processFormula(dataSet.formula, entry.entryCreatedAt);
        if (dataSet.type === 'number' && result !== undefined) {
          entry.data[i].fieldValue = result;
        }
      }
    }
    return entry;
  } catch (error) {
    console.error("Error evaluating template:", error);
    throw error;
  }
}


async function checkExistingLogEntries(logId, entryId){
  try{
    const entryData = await mongoDbManager.findOne(LogEntryModel, {_id: entryId, logId: logId});
    if(entryData){
      return entryData
    }
  }catch(error){
    throw error;
  }
}

async function checkExistingLogFieldIds(fieldId, logId, entryId, userId){
  try{
    const entryData = await mongoDbManager.findOne(LogEntryModel, {"data._id": fieldId, logId: logId, _id:entryId, $or: [{ createdBy: userId }, { operatorIds: userId }, {approvers: { $in: [userId] } }] });
    if(entryData){
      return entryData
    }
  }catch(error){
    throw error;
  }
};

async function pauseLogEntries(logId, userId, reqBody){
  try{
    const log = await findOne(LogModel,{ _id: logId }, { pausedAndResumedPeriods: 1 , name:1, createdBy:1, emailNotificationRecipients:1});
    if (!log) {
      throw "Log not found.";
    }
    const createdByObj = await findUser(log.createdBy);
    const updatedByObj = await findUser(userId);
    const emailNotificationRecipientEmail = await findUsers(log.emailNotificationRecipients)
    const emailNotificationRecipientMailIds = emailNotificationRecipientEmail.map(user => user.email);  
    // Check if the last pause entry is still active (without a resumedDate)
    const lastEntry = log.pausedAndResumedPeriods?.[log.pausedAndResumedPeriods.length - 1];
    if (lastEntry && lastEntry.resumedDate === null) {
      throw ("Log is already paused. Please resume before pausing again.");
    }
    const updates = await updateOne(LogModel, {_id: logId}, {
      $push: {
        pausedAndResumedPeriods: {
          pausedDate: new Date(), // Store current date as pause time
          reason: reqBody.reason,
          resumedDate: null, // Initially null
          pausedBy: userId
        },
      },
      $set: { isPaused: true }
    })
    if(updates.acknowledged){
      const constructedData = await constructPauseLogTemplateData(createdByObj.name, log.name, updatedByObj.name, new Date().toISOString(), "has been",emailNotificationRecipientMailIds, reqBody.reason )
      await sendPauseLogEmail([createdByObj.email], `Log Paused ${log.name}`, constructedData)
    }
    return updates;
  }catch(error){
    throw error;
  }
};

async function resumeLogEntries(logId, userId){
  try{
    const log = await findOne(LogModel, {_id: logId, "pausedAndResumedPeriods.resumedDate": null, isPaused: true}, {name:1, createdBy:1, emailNotificationRecipients:1})
    if(!log){
      throw "Log Already resumed!"
    }
    const createdByObj = await findUser(log.createdBy);
    const updatedByObj = await findUser(userId);
    const emailNotificationRecipientEmail = await findUsers(log.emailNotificationRecipients)
    const emailNotificationRecipientMailIds = emailNotificationRecipientEmail.map(user => user.email);

    const updates = await updateOne(LogModel, {_id: logId, "pausedAndResumedPeriods.resumedDate": null}, {
      $set: {
        "pausedAndResumedPeriods.$.resumedDate": new Date(), // Store resume date
        isPaused: false
      },
    })
    if(updates.acknowledged){
    const constructedData = await constructResumeLogTemplateData(createdByObj.name, log.name, updatedByObj.name, emailNotificationRecipientMailIds )
    await sendResumeLogEmail([createdByObj.email], `Log Resumed ${log.name}`, constructedData)
    }
    return updates;
  }catch(error){
    throw error;
  }
};


async function findUsers(userIds){
  try{
    const userArray = await findAll(User, { _id: { $in: userIds } }, {name:1, email:1});
    if(userArray.length > 0){
      return userArray;
    }
    else{
      return [];
    }
  }catch(error){
    throw error;
  }
}

async function findUser(userId){
  try{
    const userObj = await findOne(User, { _id: userId }, {name:1, email:1});
    if(userObj){
      return userObj;
    }
    else{
      return {};
    }
  }catch(error){
    throw error;
  }
}

async function validateLogFieldIds(req, res) {
  try {
    const { logId, entryId, fieldId } = req.params;
    if (!logId || !entryId || !fieldId) {
      apiResponseHandler.errorResponse(
        null,
        req,
        res,
        "Provide logId, entryId, and fieldId in req.params",
        400,
        null
      );
      return false;
    }

    // Check if the IDs are valid MongoDB ObjectIds
    if (
      !mongoose.isValidObjectId(logId) ||
      !mongoose.isValidObjectId(entryId) ||
      !mongoose.isValidObjectId(fieldId)
    ) {
       apiResponseHandler.errorResponse(
        null,
        req,
        res,
        "Invalid logId, entryId, or fieldId format",
        400,
        null
      );
      return false;
    }

    // Attach validated params to the request object
    req.logId = logId;
    req.entryId = entryId;
    req.fieldId = fieldId;

    // Check if the field IDs exist in the database
    const checkLog = await checkExistingLogFieldIds(fieldId, logId, entryId, req.userId);
    if (!checkLog) {
      apiResponseHandler.errorResponse(
        null,
        req,
        res,
        "You cant access this Log. Please Provide valid logId, entryId, and fieldId",
        400,
        null
      );
      return false;
    }
    return true;
    // Proceed if all validations pass
  } catch (error) {
    console.error("Error validating log field IDs:", error);
    throw error;
  }
}

async function updateLogEntrywhenFormulaAdded(fieldName, templateId) {
  try {
    const updates = await LogEntryModel.updateMany(
      { templateId: templateId, "data.fieldName": fieldName }, // Find the document that contains `fieldName`
      { $set: { "data.$[elem].isFormula": true } }, // Update `isFormula` only in the matched element
      { arrayFilters: [{ "elem.fieldName": fieldName }] } // Apply update only to the correct object
    );
    return updates;
  } catch (error) {
    console.error("Error updating log entry:", error);
    throw error;
  }
}

const fetchLogs = async (businessUnit, name, page = 1, limit = 15) => {
  try {
    const nameMatch = name ? { name: { $regex: name, $options: "i" } } : {};
    const query = {
      $and: [
        { businessUnit: businessUnit },
        nameMatch,
        { isActive: true },
      ]
    };

    const logCount = await count(LogModel, query);
    if (!logCount) return "No logs.";

    const skip = (page - 1) * limit;

    const aggregationPipeline = [
      {
        $match: query,
      },
      {
        $addFields: {
          assetId: {
            $convert: {
              input: "$assetId",
              to: "objectId",
              onError: null,
              onNull: null,
            },
          },
          logIdStr: {
            $toString: "$_id",
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
          from: "logstructures",
          let: { logIdStr: "$logIdStr" },
          pipeline: [
            { $match: { $expr: { $eq: ["$logId", "$$logIdStr"] } } },
            { $sort: { version: -1 } },
            { $limit: 1 }, 
          ],
          as: "logStructure",
        },
      },
      {
        $unwind: {
          path: "$logStructure",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $group: {
          _id: "$_id",
          name: { $first: "$name" },
          asset: { $first: "$assetDetails.generalDetails.name" },
          structureId: { $first: "$logStructure._id" },
          createdAt: { $first: "$createdAt" },
        },
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
      {
        $skip: +skip,
      },
      {
        $limit: +limit,
      },
      {
        $project: {
          _id: 1,
          name: 1,
          asset: 1,
          structureId: 1,
        },
      },
    ];

    const logs = await aggregation(LogModel, aggregationPipeline);

    const result = {
      currentPage: +page,
      totalPageCount: Math.ceil(logCount / limit),
      totalDataCount: logCount,
      data: logs,
    };

    return result;

  } catch (err) {
    console.error(err);
    throw err;
  }
};

// for setpoint storing

const trackDeviationsForEntry = async (entry) => {
  try {
    if (!entry || !entry.templateId || typeof entry.fieldValue !== "number") return;

    const { templateId, logStructureId, assetId, entryId, logId, fieldName, fieldValue, bounds } = entry;
    const { lowerBound = null, upperBound = null, criticalLowerBound = null, criticalUpperBound = null } = bounds || {};

    // Calculate deviations correctly
    const deviations = {
      lowerBound: {
        oldValue: lowerBound,
        newValue: fieldValue,
        deviation: lowerBound !== null && fieldValue < lowerBound ? fieldValue - lowerBound : 0,
      },
      upperBound: {
        oldValue: upperBound,
        newValue: fieldValue,
        deviation: upperBound !== null && fieldValue > upperBound ? fieldValue - upperBound : 0,
      },
      criticalLowerBound: {
        oldValue: criticalLowerBound,
        newValue: fieldValue,
        deviation: criticalLowerBound !== null && fieldValue < criticalLowerBound ? fieldValue - criticalLowerBound : 0,
      },
      criticalUpperBound: {
        oldValue: criticalUpperBound,
        newValue: fieldValue,
        deviation: criticalUpperBound !== null && fieldValue > criticalUpperBound ? fieldValue - criticalUpperBound : 0,
      },
    };

    // Save only if any deviation is non-zero
    const hasDeviation = Object.values(deviations).some(d => d.deviation !== 0);
    if (!hasDeviation) return; // nothing to save

    await SetpointDeviation.create({
      templateId,
      logStructureId: logStructureId || null,
      assetId: assetId || null,
      entryId: entryId || null,
      logId: logId || null,
      fieldName,
      deviations,
    });

  } catch (err) {
    console.error("Error tracking deviations for entry:", err);
  }
};




module.exports = {
  checkExistingLog,
  checkExistingLogStructure,
  logCreation,
  templateCreation,
  logWithAllDetails,
  getLog,
  getEntries,
  getVersions,
  entryDetails,
  logCount,
  getTemplates,
  updateLog,
  updateLogStructure,
  getVersionDetails,
  getTemplateDetails,
  getAllSchduledLog,
  fillTheEntries,
  updateTemplate,
  updateTemplateFormula,
  evaluateTemplate,
  updateSetPoints,
  checkFieldUniqueness,
  updateStatus,
  updateTheEntries,
  logEntryStats,
  allEntries,
  particularEntryDetails,
  uploadEntryImages,
  uploadEntryNotes,
  getEntryImages,
  getEntryNotes,
  logsReturningIds,
  checkExistingLogEntries,
  pauseLogEntries,
  resumeLogEntries,
  updateFieldWhenImagesAdded,
  checkExistingLogFieldIds,
  validateLogFieldIds,
  getFieldImages,
  updateLogEntrywhenFormulaAdded,
  fetchLogs,
  saveEntries,
  trackDeviationsForEntry,
  deleteAndTransferLogs
};
