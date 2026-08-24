const {
  ChecklistEntryModel,
} = require("../../../models/mongoDB/checklistManagement/checklistEntry_model");
const {
  ChecklistStructureModel,
} = require("../../../models/mongoDB/checklistManagement/checklistStructure_model");
const {
  ChecklistModel,
  ChecklistHistoryModel,
} = require("../../../models/mongoDB/checklistManagement/checklist_model");
const {
  TemplateModel,
} = require("../../../models/mongoDB/checklistManagement/template_model");
const {
  count,
  insertOne,
  updateOne,
  aggregation,
  findOne,
  findMany,
  findOneLastEntry,
  findAll,
} = require("../../dBManagers/mongoDB_manager");
const {
  validateRequestBodyData,
} = require("../../../middlewares/checklistManagement/checklist_middlewares");
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
const { schduledCheklist } = require("./recurrence");

const checklistCreation = async (reqData, userId, isDraft) => {
  try {
    const name = reqData.name ? reqData.name : null;
    if (name !== null) {
      const checklist = await findOne(
        ChecklistModel,
        { name: name },
        { _id: 1 }
      );
      if (checklist) {
        throw "Checklist name already exist";
      }
    }
    const documentNumber = reqData.documentNumber
      ? reqData.documentNumber
      : null;
    if (documentNumber !== null) {
      const checklist = await findOne(
        ChecklistModel,
        { documentNumber },
        { _id: 1 }
      );
      if (checklist) {
        throw "Checklist document number already exist";
      }
    }
    let start = reqData.startDateAndTime
      ? convertDateToIso(reqData.startDateAndTime)
      : null;
    let end = reqData.endDateAndTime
      ? convertDateToIso(reqData.endDateAndTime)
      : null;
    let checkListDoc;
    let previousChecklists = await findOneLastEntry(ChecklistModel, {});
    if (isDraft === "true") {
      checkListDoc = await insertOne(ChecklistModel, {
        ...reqData,
        checklistNumber: previousChecklists
          ? previousChecklists.checklistNumber + 1
          : 1,
        status: "draft",
        createdBy: userId,
        startDateAndTime: start,
        endDateAndTime: end,
        isActive: false,
      });
    } else {
      const reqValidation = await validateRequestBodyData(reqData);
      if (reqValidation.success) {
        checkListDoc = await insertOne(ChecklistModel, {
          ...reqData,
          checklistNumber: previousChecklists
            ? previousChecklists.checklistNumber + 1
            : 1,
          createdBy: userId,
          startDateAndTime: start,
          endDateAndTime: end,
        });
      } else {
        throw reqValidation.message;
      }
    }
    if (checkListDoc) {
      return checkListDoc._id;
    } else {
      throw "Document is not saved in db";
    }
  } catch (err) {
    throw err;
  }
};

const templateCreation = async (
  reqData,
  userId,
  checklistId,
  isGeneralTemplate
) => {
  try {
    if (isGeneralTemplate === "false") {
      const prevchecklistStr = await findOne(
        ChecklistStructureModel,
        { checklistId },
        { _id: 1 }
      );
      if (prevchecklistStr !== null) {
        throw "Checklist structure already defined";
      }
      const template = await insertOne(TemplateModel, {
        isGeneralTemplate: false,
        templateName: null,
        createdBy: userId,
        ...reqData,
      });
      const checklistStr = await insertOne(ChecklistStructureModel, {
        checklistId,
        version: 1,
        images: reqData.images ? reqData.images : null,
        note: reqData.note ? reqData.note : null,
        templateId: template._id.toString(),
        isActive: true,
        createdBy: userId,
      });
      if (checklistStr) {
        const updateChecklist = await updateOne(
          ChecklistModel,
          { _id: checklistId, isActive: true },
          { status: "scheduled" }
        );
        // if (updateChecklist) {
        //   schduledCheklist();
        // }
        return {
          structureId: checklistStr._id,
          templateId: template._id,
        };
      } else {
        throw "Checklist structure is not created";
      }
    } else {
      const templateName = reqData.name;
      if (!templateName) {
        throw "Please provide name for template";
      }
      const nameValidation = await count(TemplateModel, { templateName });
      if (nameValidation !== 0) {
        throw "Duplicate template name, Please change the template name!";
      }
      const templateDoc = await insertOne(TemplateModel, {
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
    }
  } catch (err) {
    throw err;
  }
};

const checklistWithAllDetails = async (userId, page = 1, limit = 15) => {
  try {
    const checklistCount = await count(ChecklistModel, {
      $or: [{ createdBy: userId }, { assignees: userId }],
    });
    let checklistWithTemplateStatus;
    let totalPages;
    if (checklistCount) {
      const skip = (page - 1) * limit;
      const aggregationPipeline = [
        {
          $match: {
            $or: [{ createdBy: userId }, { assignees: userId }],
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
          $project: {
            _id: 0,
            generalDetails: {
              _id: "$_id",
              checklistNumber: "$checklistNumber",
              name: "$name",
              documentNumber: "$documentNumber",
              isRecurrence: "$isRecurrence",
              timePeriod: "$timePeriod",
              templatesStatus: "$templatesStatus",
              asset: "$assetDetails.generalDetails.name",
              departments: "$departmentDetails.name",
              assignees: "$assigneeDetails.name",
              teams: "$teamDetails.name",
              frequency: "$recurrenceDetails.frequency",
              timePeriod: "$recurrenceDetails.timePeriod",
              createdAt: "$createdAt",
              updatedAt: "$updatedAt",
              checklistStatus: "$status",
              note: "$structure.note",
            },
          },
        },
        {
          $skip: +skip,
        },
        {
          $limit: +limit,
        },
        {
          $sort: {
            "generalDetails.createdAt": -1,
          },
        },
      ];
      const templateStatusAggregation = [
        {
          $match: {
            $or: [{ createdBy: userId }, { operatorId: userId }],
          },
        },
        {
          $group: {
            _id: {
              checklistId: "$checklistId",
              templateStatus: "$status",
            },
            count: { $sum: 1 },
          },
        },
        {
          $group: {
            _id: "$_id.checklistId",
            templateStatuses: {
              $push: {
                status: "$_id.templateStatus",
                count: "$count",
              },
            },
          },
        },
      ];
      const [checklistDetails, templateStatus] = await Promise.all([
        aggregation(ChecklistModel, aggregationPipeline),
        aggregation(ChecklistEntryModel, templateStatusAggregation),
      ]);
      const templateStatusMap = new Map(
        templateStatus.map((item) => [item._id, item])
      );
      checklistWithTemplateStatus = checklistDetails.map((checklist) => {
        const templateStatusItem = templateStatusMap.get(
          checklist.generalDetails._id.toString()
        );
        if (templateStatusItem) {
          return {
            ...checklist,
            templateStatuses: templateStatusItem.templateStatuses
              ? templateStatusItem.templateStatuses
              : null,
          };
        } else {
          return {
            ...checklist,
          };
        }
      });
      totalPages = Math.ceil(checklistCount / limit);
    }
    const result = {
      currentPage: +page,
      totalPageCount: totalPages ? totalPages : 1,
      totalDataCount: checklistCount,
      data: checklistWithTemplateStatus ? checklistWithTemplateStatus : [],
    };
    if (result) {
      return result;
    } else {
      return "Failed to retrieve checklists.";
    }
  } catch (err) {
    console.log(err);
    throw err;
  }
};

const getChecklist = async (checklistId, userId) => {
  try {
    const checklistAgg = [
      {
        $match: {
          _id: new ObjectId(checklistId),
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
        $project: {
          _id: "$_id",
          checklistNumber: "$checklistNumber",
          name: "$name",
          documentNumber: "$documentNumber",
          isRecurrence: "$isRecurrence",
          timePeriod: "$timePeriod",
          templatesStatus: "$templatesStatus",
          asset: "$assetDetails.generalDetails.name",
          departments: "$departmentDetails.name",
          assignees: "$assigneeDetails.name",
          createdAt: "$createdAt",
          updatedAt: "$updatedAt",
          checklistStatus: "$status",
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
    const checklist = await aggregation(ChecklistModel, checklistAgg);
    if (checklist) {
      const structureId = await findOne(
        ChecklistStructureModel,
        { checklistId: checklistId, isActive: true },
        { _id: 1 }
      );
      if (structureId) {
        return {
          ...checklist[0],
          structureId: structureId._id,
        };
      } else {
        return {
          ...checklist[0],
        };
      }
    } else {
      throw "Failed to retrieve checklist";
    }
  } catch (err) {
    console.log(err);
    throw err;
  }
};

const getEntries = async (
  checklistId,
  userId,
  page = 1,
  limit = 15,
  status
) => {
  try {
    const query = {
      checklistId,
      $or: [{ operatorId: userId }, { createdBy: userId }],
    };
    if (status) {
      query.status = status;
    }
    const entriesCount = await count(ChecklistEntryModel, query);
    if (entriesCount) {
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
            checklistId: "$_id",
            entryNumber: 1,
            entryCreatedAt: 1,
            checklistId: 1,
            status: 1,
            updatedBy: 1,
            createdAt: 1,
          },
        },
        {
          $skip: +skip,
        },
        {
          $limit: +limit,
        },
        {
          $sort: {
            createdAt: -1,
          },
        },
      ];
      const data = await aggregation(ChecklistEntryModel, entryAgg);
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

const getVersions = async (checklistId, userId, paginationDetails) => {
  try {
    const query = {
      checklistId,
      createdBy: userId,
    };
    const versionsCount = await count(ChecklistStructureModel, query);
    if (versionsCount) {
      const totalPages = Math.ceil(versionsCount / paginationDetails.pageSize);
      const data = await findMany(
        ChecklistStructureModel,
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
        $match: { _id: new ObjectId(entryId) },
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
          _id: 1,
          entryNumber: 1,
          entryCreatedAt: 1,
          checklistId: 1,
          status: 1,
          updatedBy: 1,
          createdAt: 1,
          updatedAt: 1,
          data: 1,
        },
      },
    ];
    const entry = await aggregation(ChecklistEntryModel, entryAgg);
    if (entry) {
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
      const checklistAgg = [
        {
          $match: {
            _id: new ObjectId(entry[0].checklistId),
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
            from: "teams",
            localField: "teams",
            foreignField: "_id",
            as: "teamDetails",
          },
        },
        {
          $project: {
            _id: "$_id",
            checklistNumber: "$checklistNumber",
            name: "$name",
            documentNumber: "$documentNumber",
            isRecurrence: "$isRecurrence",
            timePeriod: "$timePeriod",
            templatesStatus: "$templatesStatus",
            asset: "$assetDetails.generalDetails.name",
            departments: "$departmentDetails.name",
            assignees: "$assigneeDetails.name",
            createdAt: "$createdAt",
            updatedAt: "$updatedAt",
            checklistStatus: "$status",
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
      const checklist = await aggregation(ChecklistModel, checklistAgg);
      const checklistStr = await findOne(ChecklistStructureModel, {
        checklistId: entry[0].checklistId,
      });
      const result = {
        checklistEntry: entry[0],
        checklistDetails: checklist[0] ? checklist[0] : [],
        image: checklistStr ? checklistStr.images || null : null,
        note: checklistStr ? checklistStr.note || null : null,
      };
      return result;
    } else {
      throw "Failed to retrieve entry details";
    }
  } catch (err) {
    console.log(err);
    throw err;
  }
};

const checklistCount = async (userId) => {
  try {
    const totalChecklist = await count(ChecklistModel, {
      $or: [{ createdBy: userId }, { assignees: userId }],
    });
    const checklistStatusAggregation = [
      {
        $match: {
          $or: [{ createdBy: userId }, { assignees: userId }],
          $or: [{ status: "completed" }, { status: "pendingForApproval" }],
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
    const statusCounts = await aggregation(
      ChecklistModel,
      checklistStatusAggregation
    );
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
      total: totalChecklist,
      completed,
      pendingForApproval,
    };
    if (result) {
      return result;
    } else {
      throw "Failed to get status count for checklist";
    }
  } catch (err) {
    throw err;
  }
};

const getTemplates = async (paginationDetails) => {
  try {
    const templateCount = await count(TemplateModel, {
      isGeneralTemplate: true,
    });
    if (templateCount) {
      const totalPages = Math.ceil(templateCount / paginationDetails.pageSize);
      const templates = await findMany(
        TemplateModel,
        { isGeneralTemplate: true },
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

const updateChecklist = async (checklistId, userId, updateData) => {
  try {
    let draftStatus = updateData.isDraft;
    if (draftStatus === undefined) draftStatus = true;
    const checklist = await findOne(
      ChecklistModel,
      { _id: checklistId },
      { _id: 0 }
    );
    let newBody;
    if (checklist && updateData) {
      let existingData = checklist;
      for (let key in updateData) {
        if (existingData[key] || existingData[key] === null) {
          existingData[key] = updateData[key];
        } else if (!existingData[key]) {
          existingData[key] = updateData[key];
        }
      }
      existingData.status = "scheduled";
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
    const checklistName = updateData.name;
    if (checklistName !== undefined) {
      const checkNameUniquness = await findAll(
        ChecklistModel,
        {
          name: checklistName,
          _id: { $ne: checklistId },
        },
        { _id: 1 }
      );
      if (checkNameUniquness.length > 0) {
        throw "Checklist name already exist";
      }
    }
    const docNum = updateData.documentNumber;
    if (docNum !== undefined) {
      const documentNumberUniquness = await findAll(
        ChecklistModel,
        {
          documentNumber: docNum,
          _id: { $ne: checklistId },
        },
        { _id: 1 }
      );
      if (documentNumberUniquness.length > 0) {
        throw "Checklist document number already exist";
      }
    }
    let data = { updatedBy: userId, ...updateData };
    if (
      draftStatus &&
      (updateData.recurrenceDetails || updateData.userSpecificDetails)
    ) {
      delete data.recurrenceDetails;
      delete data.userSpecificDetails;
    }
    const updateChecklist = await updateOne(
      ChecklistModel,
      { _id: checklistId },
      newBody
    );
    if (updateChecklist.acknowledged) {
      return updateChecklist.acknowledged;
    }
  } catch (err) {
    console.log(err);
    throw err;
  }
};

const updateChecklistStructure = async (structureId, userId, updateData) => {
  try {
    const oldChecklistStructure = await findOne(
      ChecklistStructureModel,
      { _id: structureId },
      {}
    );
    if (!oldChecklistStructure) {
      throw "Invalid structureId.";
    }
    const up = await updateOne(
      ChecklistStructureModel,
      { _id: structureId },
      { isActive: false }
    );
    let newVersion = oldChecklistStructure
      ? oldChecklistStructure.version + 1
      : null;
    const checklistId = oldChecklistStructure
      ? oldChecklistStructure.checklistId
      : null;
    const oldUserId = oldChecklistStructure
      ? oldChecklistStructure.createdBy || null
      : null;
    const newTemplate = await insertOne(TemplateModel, {
      dataSets: updateData.dataSets,
      createdBy: oldUserId,
      updatedBy: userId,
    });
    const checklistStructureData = {
      checklistId,
      version: newVersion,
      isActive: true,
      images: updateData.images
        ? updateData.images
        : oldChecklistStructure.images || null,
      note: updateData.note
        ? updateData.note
        : oldChecklistStructure.note || null,
      templateId: newTemplate ? newTemplate._id.toString() || null : null,
      createdBy: oldUserId,
      updatedBy: userId,
    };
    const newStructure = await insertOne(
      ChecklistStructureModel,
      checklistStructureData
    );
    if (newStructure) {
      return { structureId: newStructure._id };
    }
    return "Checklist structure updated successfully";
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
          from: "checklisttemplates",
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
        },
      },
    ];
    const data = await aggregation(
      ChecklistStructureModel,
      aggregationPipeline
    );
    if (data) {
      return data;
    } else {
      return "Failed to retrieve checklist version details";
    }
  } catch (err) {
    throw err;
  }
};

const getTemplateDetails = async (templateId) => {
  try {
    const templateDetails = await findOne(
      TemplateModel,
      { _id: templateId },
      { _id: 0, dataSets: 1, createdBy: 1 }
    );
    if (templateDetails) {
      return templateDetails;
    } else {
      throw "There is no templates";
    }
  } catch (err) {
    throw err;
  }
};

const getAllSchduledChecklist = async () => {
  try {
    const checklists = await findAll(
      ChecklistModel,
      { status: "scheduled" },
      {}
    );
    if (checklists) {
      return checklists;
    } else {
      throw "There is no checklists";
    }
  } catch (err) {
    throw err;
  }
};

const convertDateToIso = (dateTimeStr) => {
  const dt = DateTime.fromISO(dateTimeStr, { zone: "UTC" });
  return dt.toISO();
};

const fillTheEntries = async (entryId, userId, reqData, businessUnit) => {
  try {
    const entryData = await findOne(
      ChecklistEntryModel,
      { _id: entryId },
      { data: 1, createdBy: 1, checklistId: 1, templateId: 1 }
    );
    if (!entryData) {
      throw "Please select correct entry";
    }
    if (entryData.data.length !== reqData.data.length) {
      throw "Request data is not correct";
    }
    const checklistId = entryData ? entryData.checklistId || "" : "";
    const checklist = await findOne(
      ChecklistModel,
      { _id: checklistId },
      { name: 1 }
    );
    const checklistName = checklist ? checklist.name || "Unknown" : "Unknown";
    const user = await findOne(User, { _id: userId }, { name: 1 });
    const operatorName = user ? user.name || "Unknown" : "Unknown";
    const engineerId = entryData ? entryData.createdBy || "" : "";
    const templateId = entryData.templateId ? entryData.templateId : "";
    const entryDataSetsMap = new Map();
    if (templateId) {
      const data = await findOne(
        TemplateModel,
        { _id: templateId },
        { dataSets: 1 }
      );
      if (data.dataSets.length > 0) {
        data.dataSets.forEach((item) => entryDataSetsMap.set(item.index, item));
      }
    }
    reqData.data.forEach((item) => {
      if (!item.index) {
        throw "Index is required in request data";
      }
      if (
        item.fieldValue === undefined ||
        item.fieldValue === null ||
        (typeof item.fieldValue === "string" &&
          item.fieldValue.trim() === "") ||
        (Array.isArray(item.fieldValue) && item.fieldValue.length === 0)
      ) {
        throw `Field value for index ${item.index} cannot be empty`;
      }
    });
    const requestDataMap = new Map();
    reqData.data.forEach((item) =>
      requestDataMap.set(item.index, item.fieldValue)
    );

    for (let i = 0; i < entryData.data.length; i++) {
      const entry = entryData.data[i];
      const updatedFieldValue = requestDataMap.get(entry.index);
      const fieldDetails = entryDataSetsMap.get(entry.index);
      if (fieldDetails.type === "number") {
        const updateValue = +updatedFieldValue;
        const LB = fieldDetails.lowerBound
          ? fieldDetails.lowerBound || null
          : null;
        const UB = fieldDetails.upperBound
          ? fieldDetails.upperBound || null
          : null;
        const CP1 = fieldDetails.criticalPoint1
          ? fieldDetails.criticalPoint1 || ""
          : "";
        const CP2 = fieldDetails.criticalPoint2
          ? fieldDetails.criticalPoint2 || ""
          : "";
        if ((LB && updateValue < LB) || (UB && updateValue > UB)) {
          throw `The entered value of ${fieldDetails.fieldName} exceeds the threshold limit.`;
        }
        if (
          (CP1 && CP1 <= updateValue) ||
          (CP2 && CP2 <= updateValue) ||
          (CP1 && CP2 && CP1 <= updateValue && CP2 >= updateValue) ||
          (CP1 && CP2 && CP1 <= updateValue && CP2 <= updateValue)
        ) {
          const notificationBody = constructNotification(
            "setLimitBreached",
            `Critical level reached. Immediate attention required.`,
            {
              id: entryId,
              name: checklistName,
            },
            "checklists",
            userId,
            businessUnit
          );
          await sendViaUserID("notification", engineerId, notificationBody);
        }
      }
      if (updatedFieldValue !== undefined) {
        entryData.data[i].fieldValue = updatedFieldValue;
      }
    }

    const updated = await ChecklistEntryModel.updateOne(
      { _id: entryId },
      {
        data: entryData.data,
        status: "pendingForApproval",
        updatedBy: userId,
      }
    );

    const updateFlag = updated ? updated.acknowledged || false : false;
    if (updateFlag) {
      const notificationBody = await constructNotification(
        "dataEntryUpdate",
        `has been Updated by ${operatorName}.`,
        {
          id: entryId,
          name: checklistName,
        },
        "checklists",
        userId,
        businessUnit
      );
      await sendViaUserID("notification", engineerId, notificationBody);
    }

    return updated;
  } catch (err) {
    console.log(err)
    throw err;
  }
};

const updateTemplate = async (templateId, userId, updateData) => {
  try {
    const oldTemplate = await findOne(
      TemplateModel,
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
          TemplateModel,
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
        TemplateModel,
        { _id: templateId },
        { ...updateData, templateName }
      );
      if (updated) {
        return updated.acknowledged;
      }
    }
    return "You don't have access to update template";
  } catch (err) {
    throw err;
  }
};

const checkFieldUniqueness = async (fieldValue) => {
  try {
    const existingDoc = await findAll(ChecklistModel, fieldValue);
    if (existingDoc.length > 0) {
      return { isunique: false };
    } else {
      return { isunique: true };
    }
  } catch (err) {
    throw err;
  }
};

const updateStatus = async (entryId, userId, reqData, businessUnit) => {
  try {
    const query = { _id: entryId, createdBy: userId };
    const entry = await findOne(ChecklistEntryModel, query, {
      _id: 0,
      comments: 1,
      createdBy: 1,
      checklistId: 1,
      operatorId: 1,
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
    const checklistId = entry ? entry.checklistId || "" : "";
    const operatorId = entry ? entry.operatorId || "" : "";
    let checklistName;
    let updateFlag;
    let entryStatus;
    if (checklistId) {
      const checklist = await findOne(
        ChecklistModel,
        { _id: checklistId },
        { _id: 0, name: 1 }
      );
      checklistName = checklist ? checklist.name || "Unknown" : "Unknown";
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
        const updated = await updateOne(ChecklistEntryModel, query, update);
        updateFlag = updated ? updated.acknowledged || false : false;
        entryStatus = "revised";
      } else {
        const newC = {
          index: 1,
          comment: newComment,
        };
        comments.push(newC);
        const update = { status, comments: comments };
        const updated = await updateOne(ChecklistEntryModel, query, update);
        updateFlag = updated ? updated.acknowledged || false : false;
        entryStatus = "revised";
      }
    } else if (status === "approved" || status === "completed") {
      const update = { status: "completed" };
      const updated = await updateOne(ChecklistEntryModel, query, update);
      updateFlag = updated ? updated.acknowledged || false : false;
      entryStatus = "approved";
    }
    const notificationBody = await constructNotification(
      `approve`,
      `has been ${entryStatus} by ${engineer_Name}.`,
      {
        id: entryId,
        name: checklistName,
      },
      "checklists",
      userId,
      businessUnit
    );
    if (updateFlag) {
      await sendViaUserID("notification", operatorId, notificationBody);
    }
    return true;
  } catch (err) {
    throw err;
  }
};

const updateTheEntries = async (entryId, userId, reqData, businessUnit) => {
  try {
    const entryData = await findOne(
      ChecklistEntryModel,
      { _id: entryId, createdBy: userId },
      { data: 1, createdBy: 1, updatedBy: 1, checklistId: 1, operatorId: 1 }
    );
    if (!entryData) {
      throw "You do not have the necessary access rights to perform this update.";
    }
    if (entryData.data.length !== reqData.data.length) {
      throw "Request data is not correct";
    }
    const engineerName = await findOne(
      User,
      { _id: userId },
      { _id: 0, name: 1 }
    );
    const engineer_Name = engineerName
      ? engineerName.name || "unknown"
      : "unknown";
    const checklistId = entryData ? entryData.checklistId || "" : "";
    const operatorId = entryData ? entryData.operatorId || "" : "";
    let checklistName;
    let updateFlag;
    let entryStatus;
    if (checklistId) {
      const checklist = await findOne(
        ChecklistModel,
        { _id: checklistId },
        { _id: 0, name: 1 }
      );
      checklistName = checklist ? checklist.name || "Unknown" : "Unknown";
    }
    reqData.data.forEach((item) => {
      if (!item.index) {
        throw "Index is required in request data";
      }
      if (
        item.fieldValue === undefined ||
        item.fieldValue === null ||
        (typeof item.fieldValue === "string" &&
          item.fieldValue.trim() === "") ||
        (Array.isArray(item.fieldValue) && item.fieldValue.length === 0)
      ) {
        throw `Field value for index ${item.index} cannot be empty`;
      }
    });

    const requestDataMap = new Map();
    reqData.data.forEach((item) =>
      requestDataMap.set(item.index, item.fieldValue)
    );

    for (let i = 0; i < entryData.data.length; i++) {
      const entry = entryData.data[i];
      const updatedFieldValue = requestDataMap.get(entry.index);
      if (updatedFieldValue !== undefined) {
        entryData.data[i].fieldValue = updatedFieldValue;
      }
    }

    const updated = await ChecklistEntryModel.updateOne(
      { _id: entryId },
      {
        data: entryData.data,
        status: "completed",
        updatedBy: userId,
      }
    );
    updateFlag = updated ? updated.acknowledged || false : false;
    const notificationBody = await constructNotification(
      "revise",
      `has been approved by ${engineer_Name}.`,
      {
        id: entryId,
        name: checklistName,
      },
      "checklists",
      userId,
      businessUnit
    );
    if (updateFlag) {
      await sendViaUserID("notification", operatorId, notificationBody);
    }
    return true;
  } catch (err) {
    console.log("err", err);
    throw err;
  }
};

module.exports = {
  checklistCreation,
  templateCreation,
  checklistWithAllDetails,
  getChecklist,
  getEntries,
  getVersions,
  entryDetails,
  checklistCount,
  getTemplates,
  updateChecklist,
  updateChecklistStructure,
  getVersionDetails,
  getTemplateDetails,
  getAllSchduledChecklist,
  fillTheEntries,
  updateTemplate,
  checkFieldUniqueness,
  updateStatus,
  updateTheEntries,
};
