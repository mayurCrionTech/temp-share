const {
  LogModel,
  logStatus,
} = require("../../../models/mongoDB/logManagement/log_model");
const {
  LogEntryModel,
  status,
} = require("../../../models/mongoDB/logManagement/logEntry_model");
const {
  ReportModel,
  reportStatus,
} = require("../../../models/mongoDB/reportManagement/report_model");
const mongoDbManager = require("../../dBManagers/mongoDB_manager");
const {
  Assets,
} = require("../../../models/mongoDB/assetManagement/asset_model");
const paginationHandler = require("../../common/paginationHandler_manager");
const businessUnitManager = require("../../../managers/internalManagers/organizationManagement/businessUnit_manager");
const mongoose = require("mongoose");
const DashBoard = require("../../../models/mongoDB/dashboardManagement/dashboard_model");
const moment = require('moment-timezone');
const { LiveData, getLiveDataEntriesCollection } = require("../../../models/mongoDB/liveDataManagement/liveData_model");

// async function countLogStatus(reqQuery) {
//   try {
//     const returnObj = {
//       totalCount: 0,
//       completed: 0,
//       liveLogs: 0,
//       scheduled: 0,
//     };
//     const matchQuery = {
//       businessUnit: new mongoose.Types.ObjectId(reqQuery.businessUnit),
//     };
//     matchQuery.isActive = true;
//     const startDateAndTime = reqQuery.startDate;
//     const endDateAndTime = reqQuery.endDate;
//     if (startDateAndTime && endDateAndTime) {
//       matchQuery.createdAt = {
//         $gte: new Date(startDateAndTime),
//         $lte: new Date(endDateAndTime),
//       };
//     } else if (startDateAndTime) {
//       matchQuery.createdAt = { $gte: new Date(startDateAndTime) };
//     } else if (endDateAndTime) {
//       matchQuery.createdAt = { $lte: new Date(endDateAndTime) };
//     }
//     const aggregationPipeline = [
//       { $match: matchQuery },
//       {
//         $facet: {
//           totalCount: [{ $count: "count" }],
//           completed: [
//             { $match: { status: logStatus.COMPLETED } },
//             { $count: "count" },
//           ],
//           liveLogs: [
//             { $match: { status: logStatus.WORK_IN_PROGRESS } },
//             { $count: "count" },
//           ],
//           scheduled: [
//             { $match: { status: logStatus.SCHEDULED } },
//             { $count: "count" },
//           ],
//         },
//       },
//     ];

//     const results = await mongoDbManager.aggregation(
//       LogModel,
//       aggregationPipeline
//     );

//     const getCount = (arr) => (arr.length > 0 ? arr[0].count : 0);

//     returnObj.totalCount = getCount(results[0].totalCount);
//     returnObj.completed = getCount(results[0].completed);
//     returnObj.liveLogs = getCount(results[0].liveLogs);
//     returnObj.scheduled = getCount(results[0].scheduled);
//     return returnObj;
//   } catch (error) {
//     throw error;
//   }
// }


async function getLogComplianceStatsAndTable(reqQuery) {
  const { businessUnit, startDate, endDate, page = 1, limit = 10 } = reqQuery;

  // --- Base match query for logs ---
  const matchQuery = {
    businessUnit: new mongoose.Types.ObjectId(businessUnit),
    isActive: true
  };

  if (startDate && endDate) {
    matchQuery.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
  } else if (startDate) {
    matchQuery.createdAt = { $gte: new Date(startDate) };
  } else if (endDate) {
    matchQuery.createdAt = { $lte: new Date(endDate) };
  }

  // --- Pagination ---
  const skip = (Number(page) - 1) * Number(limit);
  const totalCount = await mongoDbManager.count(LogModel, matchQuery);

  // --- Fetch logs for current page ---
  const logs = await mongoDbManager.aggregation(LogModel,[
    { $match: matchQuery },
    {
      $lookup: {
        from: "users",
        let: { createdByStr: "$createdBy" },
        pipeline: [
          { $match: { $expr: { $eq: ["$_id", { $toObjectId: "$$createdByStr" }] } } },
          { $project: { name: 1 } }
        ],
        as: "creator"
      }
    },
    {
      $project: {
        name: 1,
        logNumber: 1,
        status: 1,
        createdByName: { $ifNull: [{ $arrayElemAt: ["$creator.name", 0] }, "-" ] },
        createdAt: 1
      }
    },
    { $sort: { createdAt: -1 } },
    { $skip: skip },
    { $limit: Number(limit) }
  ]);

  const pageLogIds = logs.map(log => log._id?.toString()).filter(Boolean);

  // --- 1) Global summary aggregation (all logs in range) ---
  const summaryAgg = await mongoDbManager.aggregation(LogEntryModel,[
    { $match: { 
        logId: { $in: pageLogIds },
  businessUnit: new mongoose.Types.ObjectId(businessUnit),
  ...(startDate || endDate ? { entryCreatedAt: matchQuery.createdAt } : {})
      } 
    },
    {
      $group: {
        _id: null,
        entryGenerated: { $sum: 1 },
        entryEntered: {
          $sum: { $cond: [{ $ne: ["$status", "pendingForApproval"] }, 1, 0] }
        },
        approval: { $sum: { $cond: [{ $eq: ["$status", "pendingForApproval"] }, 1, 0] } },
        overdue:  { $sum: { $cond: [{ $eq: ["$status", "overdue"] }, 1, 0] } },
        completed:{ $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] } }
      }
    }
  ]);

  const summaryStats = {
    approval:  summaryAgg[0]?.approval  || 0,
    overdue:   summaryAgg[0]?.overdue   || 0,
    completed: summaryAgg[0]?.completed || 0
  };

  // --- 2) Page-wise aggregation for table ---
  const logEntryAgg = await mongoDbManager.aggregation(LogEntryModel,[
    { $match: { logId: { $in: pageLogIds },
  businessUnit: new mongoose.Types.ObjectId(businessUnit),
  ...(startDate || endDate ? { entryCreatedAt: matchQuery.createdAt } : {})} },
    {
      $group: {
        _id: "$logId",
        entryGenerated: { $sum: 1 },
        entryEntered: { $sum: { $cond: [{ $eq: ["$status", "pendingForApproval"] }, 1, 0] } }
      }
    }
  ]);
  const logEntryMap = {};
  logEntryAgg.forEach(row => {
    logEntryMap[row._id] = {
      entryGenerated: row.entryGenerated,
      entryEntered: row.entryEntered
    };
  });

  // --- Compose table result ---
  const logsTable = logs.map((log, idx) => {
    const logId = log._id?.toString();
    const entryGenerated = logEntryMap[logId]?.entryGenerated || 0;
    const entryEntered = logEntryMap[logId]?.entryEntered || 0;
    const percentCompletion = entryGenerated
      ? ((entryEntered / entryGenerated) * 100).toFixed(2) + "%"
      : "0.00%";

    return {
      id: skip + idx + 1,
      name: log.name || "-",
      logNumber: log.logNumber || "-",
      status: log.status || "-",
      createdBy: log.createdByName,
      createdAt: log.createdAt
        ? new Date(log.createdAt).toLocaleString("en-IN", { hour12: true })
        : "-",
      entryGenerated,
      entryEntered,
      percentCompletion
    };
  });

  return { summaryStats, logsTable, totalCount };
}

async function fetchLogoFromBusinessUnit(businessUnitId) {
  try {
    const businessUnitData = await businessUnitManager.getBusinessUnit(
      businessUnitId,
      "logo1 logo2"
    );
    if (businessUnitData) {
      return {
        logo1: businessUnitData.logo1,
        logo2: businessUnitData.logo2,
      };
    } else {
      return {};
    }
  } catch (error) {
    throw error;
  }
}

async function fetchProcessDashBoardEntries(reqData, businessUnit) {
  try {
    let response = {};
    if (reqData.clientId == 2) {
      const clientData = await client2(reqData, businessUnit);
      let { results, counts, selectedKeys, page, limit } = clientData;
      selectedKeys.forEach((key, index) => {
        const totalItems = counts[index]?.[0]?.total || 0;
        const totalPages = totalItems === 0 ? 1 : Math.ceil(totalItems / limit);
        response[key] = {
          currentPage: page,
          totalPageCount: totalPages,
          totalDataCount: totalItems,
          data: results[index],
        };
      });
    } else {
      response = {};
    }

    return response;
  } catch (error) {
    throw error;
  }
}

async function getProcessDashBoardEntries(reqData, businessUnit) {
  try {
    let response = {};
    if (reqData.clientId == 3) {
      const clientData = await client3(reqData, businessUnit);
      let { results, counts, selectedKeys, page, limit } = clientData;
      selectedKeys.forEach((key, index) => {
        const totalItems = counts[index]?.[0]?.total || 0;
        const totalPages = totalItems === 0 ? 1 : Math.ceil(totalItems / limit);
        response[key] = {
          currentPage: page,
          totalPageCount: totalPages,
          totalDataCount: totalItems,
          data: results[index],
        };
      });
    } else {
      response = {};
    }

    return response;
  } catch (error) {
    throw error;
  }
}

async function fetchLatestProcessEntries(reqData, businessUnit) {
  try {
    const startDate = reqData.startDate ? new Date(reqData.startDate) : null;
    const endDate = reqData.endDate ? new Date(reqData.endDate) : null;
    const logQueryMap = {
      phosphoricAcid: {
        logId: "6720663786198fb719c661af",
        fieldName: "1134PA	LPH  (2 - 50)",
      },
      causticSoda: {
        logId: "6720663786198fb719c661af",
        fieldName: "1178NA         LPH (0 - 500)",
      }, // Replace with actual fieldId
      earthPowder: {
        logId: "67208077144438303ac8a93a",
        fieldName: "Bleaching earth dosing 630 A-% (0.5 - 2.0)",
      }, // Replace with actual fieldId
      coal: {
        logId: "6720d2218c7aa3d2b6a43a33",
        fieldName: "Coal Consumption in TONS",
      }, // Replace with actual fieldId
      steam: {
        logId: "6721b3f2dec4fc5217ac530c",
        fieldName: "STEAM PARAMETER Steam Totalizer 1- MT",
      }, // Replace with actual fieldId
      power: {
        logId: "6721cc92a0c31d13f8fe7e9e",
        fieldName: "Total Units (Eb+ Genset)",
      }, // Replace with actual fieldId
    };

    const rangeMap = {
      phosphoricAcid: { min: 2, max: 50 },
      causticSoda: { min: 0, max: 500 },
      earthPowder: { min: 0.5, max: 2.0 },
    };

    const unitsMap = {
      phosphoricAcid: "LPH",
      causticSoda: "LPH",
      earthPowder: "%",
      coal: "TONS",
      steam: "MT",
      power: "kWh",
    };

    // Execute queries in parallel
    const queries = Object.entries(logQueryMap).map(
      async ([key, { logId, fieldName }]) => {
        const filter = { logId, "data.fieldName": fieldName };
        if (businessUnit) {
          filter.businessUnit = new mongoose.Types.ObjectId(businessUnit);
        }
        if (startDate && endDate) {
          filter.entryCreatedAt = { $gte: startDate, $lte: endDate };
        } else if (startDate) {
          filter.entryCreatedAt = { $gte: startDate };
        } else if (endDate) {
          filter.entryCreatedAt = { $lte: endDate };
        }

        const latestEntry = await LogEntryModel.findOne(
          filter, // Match logId and fieldName
          {
            "data.$": 1,
            entryEnteredAt: 1,
            logId: 1,
            entryCreatedAt: 1,
            entryEnteredAt: 1,
          } // Project only matched data, logId, and entryEnteredAt
        )
          .sort({ entryEnteredAt: -1 }) // Sort by latest entry
          .lean(); // Optimize query

        return { key, latestEntry };
      }
    );

    const results = await Promise.all(queries);
    return results.reduce((acc, { key, latestEntry }) => {
      acc[key] = latestEntry
        ? {
            _id: latestEntry._id,
            logId: latestEntry.logId,
            entryCreatedAt: latestEntry.entryCreatedAt,
            entryEnteredAt: latestEntry.entryEnteredAt,
            fieldName: latestEntry.data[0]?.fieldName || "",
            fieldValue: latestEntry.data[0]?.fieldValue || "",
            units: unitsMap[key] || "",
            range: rangeMap[key] || "",
          }
        : "";
      return acc;
    }, {});
  } catch (error) {
    throw error;
  }
}

async function getLatestProcessEntries(reqData, businessUnit) {
  try {
    const startDate = reqData.startDate ? new Date(reqData.startDate) : null;
    const endDate = reqData.endDate ? new Date(reqData.endDate) : null;

    const logId = "680797f04f216d032cacfdd2";

    const fieldNames = [
      "AREA",
      "SAMPLE COLLECTED DATE",
      "OXYGEN (O2)",
      "NITROGEN  (N2)",
      "HYDROGEN (H2)",
      "METHANE(CH4)",
      "ETHYLENE (C2H4)",
      "ETHANE(C2H6)",
      "ACETYLENE (C2H2)",
      "PROPYLENE +PROPANE (C3H6+C3H8)",
      "CARBON DIOXIDE (Co2).",
      "CARBON MONOXIDE (N2).",
      "TOTAL COMBUSTIBLES (TDCG)",
    ];

    const filter = {
      logId,
      "data.fieldName": { $in: fieldNames },
    };

    // Uncomment if businessUnit filtering needed
    if (businessUnit) {
      filter.businessUnit = new mongoose.Types.ObjectId(businessUnit);
    }

    const rawEntries = await LogEntryModel.aggregate([
      { $match: filter },
      { $unwind: "$data" },
      { $match: { "data.fieldName": { $in: fieldNames } } },
      {
        $group: {
          _id: "$_id",
          logId: { $first: "$logId" },
          fieldData: { $push: "$data" },
        },
      },
      {
        $addFields: {
          sampleCollectedDate: {
            $let: {
              vars: {
                filtered: {
                  $filter: {
                    input: "$fieldData",
                    as: "item",
                    cond: {
                      $eq: ["$$item.fieldName", "SAMPLE COLLECTED DATE"],
                    },
                  },
                },
              },
              in: {
                $cond: [
                  {
                    $and: [
                      { $gt: [{ $size: "$$filtered" }, 0] },
                      {
                        $ne: [
                          { $arrayElemAt: ["$$filtered.fieldValue", 0] },
                          "",
                        ],
                      },
                    ],
                  },
                  { $toDate: { $arrayElemAt: ["$$filtered.fieldValue", 0] } },
                  null,
                ],
              },
            },
          },
        },
      },
      // Apply date filter on sampleCollectedDate
      {
        $match: {
          ...(startDate || endDate
            ? {
                sampleCollectedDate: {
                  ...(startDate && { $gte: startDate }),
                  ...(endDate && { $lte: endDate }),
                },
              }
            : {}),
        },
      },
      // Sort descending by sampleCollectedDate to get latest first
      { $sort: { sampleCollectedDate: -1 } },
      // Optionally limit to 1 to get only the latest entry
      { $limit: 1 },
    ]);

    const fieldToKeyMap = {
      AREA: "area",
      "SAMPLE COLLECTED DATE": "sampleCollectedDate",
      "OXYGEN (O2)": "oxygen",
      "NITROGEN  (N2)": "nitrogen",
      "HYDROGEN (H2)": "hydrogen",
      "METHANE(CH4)": "methane",
      "ETHYLENE (C2H4)": "ethylene",
      "ETHANE(C2H6)": "ethane",
      "ACETYLENE (C2H2)": "acetylene",
      "PROPYLENE +PROPANE (C3H6+C3H8)": "propylene+propane",
      "CARBON DIOXIDE (Co2).": "carbondioxide",
      "CARBON MONOXIDE (N2).": "carbonmonoxide",
      "TOTAL COMBUSTIBLES (TDCG)": "totalCombustibles",
    };

    const unitsMap = {
      oxygen: "O2",
      nitrogen: "N2",
      hydrogen: "H2",
      methane: "CH4",
      ethylene: "C2H4",
      ethane: "C2H6",
      acetylene: "C2H2",
      "propylene+propane": "C3H6+C3H8",
      carbondioxide: "Co2",
      carbonmonoxide: "N2",
      totalCombustibles: "TDCG",
    };

    const rangeMap = {
      hydrogen: { min: 0, max: 1000, normal: 150 },
      methane: { min: 0, max: 80, normal: 25 },
      ethylene: { min: 0, max: 150, normal: 20 },
      ethane: { min: 0, max: 35, normal: 10 },
      acetylene: { min: 0, max: 70, normal: 15 },
      carbondioxide: { min: 0, max: 15000, normal: 1000 },
      carbonmonoxide: { min: 0, max: 1000, normal: 500 },
      totalCombustibles: { min: 0, max: 4630, normal: 720 },
    };

    const finalResult = {};

    for (const entry of rawEntries) {
      const sampleCollectedDateObj = entry.fieldData.find(
        (f) => f.fieldName === "SAMPLE COLLECTED DATE"
      );

      for (const field of entry.fieldData) {
        const key = fieldToKeyMap[field.fieldName];
        if (!key) continue;

        // Set only if not already set (we need the latest one)
        if (!finalResult[key]) {
          finalResult[key] = {
            _id: entry._id,
            logId: entry.logId,
            sampleCollectedDate: sampleCollectedDateObj?.fieldValue || null,
            fieldName: field.fieldName,
            fieldValue: field.fieldValue || "",
            units: unitsMap[key] || "",
            range: rangeMap[key] || "",
          };
        }
      }
    }

    return finalResult;
  } catch (error) {
    throw error;
  }
}

async function countData(
  logQueryMap,
  startDateAndTime,
  endDateAndTime,
  businessUnit
) {
  try {
    const countQueries = Object.entries(logQueryMap).map(
      ([key, { logId, fieldName }]) => {
        const countMatchQuery = {
          logId,
          businessUnit: new mongoose.Types.ObjectId(businessUnit),
        };
        if (startDateAndTime && endDateAndTime) {
          countMatchQuery.entryCreatedAt = {
            $gte: startDateAndTime,
            $lte: endDateAndTime,
          };
        } else if (startDateAndTime) {
          countMatchQuery.entryCreatedAt = { $gte: startDateAndTime };
        } else if (endDateAndTime) {
          countMatchQuery.entryCreatedAt = { $lte: endDateAndTime };
        }
        return LogEntryModel.aggregate([
          { $match: countMatchQuery },
          { $unwind: "$data" },
          { $match: { "data.fieldName": fieldName } },
          { $count: "total" },
        ]);
      }
    );

    const counts = await Promise.all(countQueries);
    return counts;
  } catch (error) {
    throw error;
  }
}

async function energyDashboard(reqQuery, businessUnit) {
  try {
    const {
      startDate,
      endDate,
      totalEnergyConsumed,
      ebConsumption,
      gensetConsumption,
      dailyPeak,
      monthlyOverview,
      sectionWise,
      dailyTrend,
    } = reqQuery;

    const page = reqQuery.page ? parseInt(reqQuery.page, 10) : 1;
    const limit = reqQuery.limit ? parseInt(reqQuery.limit, 10) : 8000000;
    const skip = (page - 1) * limit;

    const matchQuery = {
      logId: "6721cc92a0c31d13f8fe7e9e",
      businessUnit: new mongoose.Types.ObjectId(businessUnit),
    };

    if (startDate && endDate) {
      matchQuery.entryCreatedAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    } else if (startDate) {
      matchQuery.entryCreatedAt = { $gte: new Date(startDate) };
    } else if (endDate) {
      matchQuery.entryCreatedAt = { $lte: new Date(endDate) };
    }

    const facet = {};

    if (totalEnergyConsumed === "true") {
      facet.totalEnergyConsumed = [
        { $group: { _id: null, total: { $sum: "$totalUnits" } } },
      ];
    }

    if (ebConsumption === "true") {
      facet.ebConsumption = [
        { $group: { _id: null, total: { $sum: "$ebReading" } } },
      ];
    }

    if (gensetConsumption === "true") {
      facet.gensetEfficiency = [
        {
          $group: {
            _id: null,
            gensetTotal: { $sum: "$gensetReading" },
            totalEnergy: { $sum: "$totalUnits" },
          },
        },
      ];
    }

    if (dailyPeak === "true") {
      facet.dailyPeak = [
        { $group: { _id: "$date", dailyTotal: { $sum: "$totalUnits" } } },
        { $sort: { dailyTotal: -1 } },
        { $limit: 1 },
      ];
    }

    if (monthlyOverview === "true") {
      facet.monthlyOverview = [
        {
          $group: {
            _id: "$month",
            ebMonthlyTotal: { $sum: "$ebReading" },
            gensetMonthlyTotal: { $sum: "$gensetReading" },
          },
        },
        { $sort: { _id: 1 } },
      ];
    }

    if (sectionWise === "true") {
      facet.sectionWise = [
        { $unwind: "$data" },
        {
          $match: {
            "data.fieldName": {
              $in: [
                "Refinery ",
                "Cooling Tower",
                "Wax Press",
                "Tank Form ",
                "Wax Pre Heater ",
                "Acid Oil Plant",
                "Boiler ",
                "Thermosyphon",
                "Thermic Heater ",
                "WTP ",
                "ETP",
                "MEE",
                "STP ",
                "Packing Section ",
                "Ware House ",
                "Loading / Unloading Sump ",
                "Lighting ",
                "LAB ",
              ],
            },
          },
        },
        {
          $group: {
            _id: {
              date: "$date",
              section: "$data.fieldName",
            },
            fieldValue: {
              $first: {
                $convert: {
                  input: "$data.fieldValue",
                  to: "double",
                  onError: 0,
                  onNull: 0,
                },
              },
            },
          },
        },
        { $sort: { "_id.date": 1 } },
      ];
    }

    if (dailyTrend === "true") {
      // First, add a count operation for pagination
      facet.dailyTrendCount = [
        { $group: { _id: "$date" } },
        { $count: "total" },
      ];

      // Then, modify the dailyTrend pipeline to include pagination
      facet.dailyTrend = [
        { $group: { _id: "$date", totalUnits: { $sum: "$totalUnits" } } },
        {
          $group: {
            _id: null,
            maxTotal: { $max: "$totalUnits" }, // Get global max
            dates: { $push: "$$ROOT" }, // Preserve all daily entries
          },
        },
        { $unwind: "$dates" }, // Flatten array
        {
          $replaceRoot: {
            newRoot: { $mergeObjects: ["$dates", { maxTotal: "$maxTotal" }] },
          },
        },
        {
          $addFields: {
            isPeak: { $eq: ["$totalUnits", "$maxTotal"] }, // Flag peak entries
          },
        },
        { $project: { maxTotal: 0 } }, // Remove temporary field
        { $sort: { _id: 1 } }, // Sort by date
        { $skip: skip }, // Apply pagination here
        { $limit: limit }, // Apply pagination here
      ];
    }

    const pipeline = [
      { $match: matchQuery },
      {
        $addFields: {
          ebReading: {
            $convert: {
              input: {
                $first: {
                  $map: {
                    input: {
                      $filter: {
                        input: "$data",
                        as: "item",
                        cond: { $eq: ["$$item.fieldName", "EB Reading"] },
                      },
                    },
                    as: "matched",
                    in: "$$matched.fieldValue",
                  },
                },
              },
              to: "double",
              onError: 0,
              onNull: 0,
            },
          },
          gensetReading: {
            $convert: {
              input: {
                $first: {
                  $map: {
                    input: {
                      $filter: {
                        input: "$data",
                        as: "item",
                        cond: { $eq: ["$$item.fieldName", "Genset Reading "] },
                      },
                    },
                    as: "matched",
                    in: "$$matched.fieldValue",
                  },
                },
              },
              to: "double",
              onError: 0,
              onNull: 0,
            },
          },
        },
      },
      {
        $addFields: {
          totalUnits: { $add: ["$ebReading", "$gensetReading"] },
          // date: { $dateToString: { format: "%Y-%m-%d %H:%M:%S", date: "$entryCreatedAt" } },
          // month: { $dateToString: { format: "%Y-%m-%d %H:%M:%S", date: "$entryCreatedAt" } },
          date: { $dateToString: { date: "$entryCreatedAt" } },
          month: { $dateToString: { date: "$entryCreatedAt" } },
          // month: {  date: "$entryCreatedAt"  },
        },
      },
      { $facet: facet },
    ];

    const results = await LogEntryModel.aggregate(pipeline);
    const data = results[0];
    // Check if all data arrays in facet are empty (log not found or no match)
    // const allFacetDataEmpty = Object.values(data).every(arr => Array.isArray(arr) && arr.length === 0);

    // if (allFacetDataEmpty) {
    //   const error = new Error("No Dashboard data found for the specified criteria.");
    //   error.statusCode = 200;
    //   throw error;
    // }

    const countPipeline = [{ $match: matchQuery }, { $count: "total" }];
    const counts = await LogEntryModel.aggregate(countPipeline);
    const totalItems = counts?.[0]?.total || 0;
    const totalPages = totalItems === 0 ? 1 : Math.ceil(totalItems / limit);
    const response = {
      // logName: "POWER HOUSE 24-25",
      // logId: "66e83e6d4425d23b49a4562f",
      // businessUnit: "TUTICORIN",
      // frequency: "1Day"
    };

    if (data.totalEnergyConsumed?.length > 0) {
      response.totalEnergyConsumed = {
        value: data.totalEnergyConsumed[0]?.total,
        unit: "kWh",
      };
    } else {
      response.totalEnergyConsumed = "";
    }
    if (data.ebConsumption?.length > 0) {
      response.ebConsumption = {
        value: data.ebConsumption[0]?.total || 0,
        unit: "kWh",
      };
    } else {
      response.ebConsumption = "";
    }
    if (data.gensetEfficiency?.length > 0) {
      const gensetTotal = data.gensetEfficiency[0]?.gensetTotal || 0;
      const totalEnergy = data.gensetEfficiency[0]?.totalEnergy || 0;

      response.gensetConsumption = {
        value: gensetTotal,
        unit: "kWh",
        efficiency: totalEnergy > 0 ? (gensetTotal / totalEnergy) * 100 : 0,
      };
    } else {
      response.gensetConsumption = "";
    }
    if (data.dailyPeak?.length > 0) {
      response.peakConsumptionDay = {
        date: data.dailyPeak[0]?._id || null,
        value: data.dailyPeak[0]?.dailyTotal || 0,
        unit: "kWh",
      };
    } else {
      response.peakConsumptionDay = "";
    }

    if (data.monthlyOverview) {
      const responseData = data.monthlyOverview.map((item) => ({
        date: item._id,
        ebConsumption: item.ebMonthlyTotal,
        gensetConsumption: item.gensetMonthlyTotal,
        unit: "kWh",
      }));
      response.monthlyConsumptionOverview = paginationHandler.paginationResObj(
        page,
        totalPages,
        totalItems,
        responseData
      );
    }

    if (data.sectionWise) {
      const responseData = data.sectionWise.map((item) => ({
        date: item._id.date,
        section: item._id.section,
        value: item.fieldValue,
        unit: "kWh",
      }));
      response.sectionWiseConsumption = paginationHandler.paginationResObj(
        page,
        totalPages,
        totalItems,
        responseData
      );
    }

    if (data.dailyTrend) {
      const totalItems = data.dailyTrendCount[0]?.total || 0;
      const totalPages = totalItems === 0 ? 1 : Math.ceil(totalItems / limit);

      const responseData = data.dailyTrend.map((item) => ({
        date: item._id,
        value: item.totalUnits,
        unit: "kWh",
        isPeak: item.isPeak, // This will now work correctly
      }));

      // Use the correct property name that matches the request parameter
      response.dailyTrend = paginationHandler.paginationResObj(
        page,
        totalPages,
        totalItems,
        responseData
      );
    }
    return response;
  } catch (error) {
    console.log("error", error);
    throw error;
  }
}

async function fetchLatestQualityEntries(reqData, businessUnit) {
  try {
    const startDate = reqData.startDate ? new Date(reqData.startDate) : null;
    const endDate = reqData.endDate ? new Date(reqData.endDate) : null;

    const logId = "6784e9794f8f21a6dce62987";

    const fieldMap = {
      FFA: "Raw oil_FFA ",
      Sediments: "Raw oil_Sediments.",
      "S1-FFA": "S1 Outlet_FFA",
      "S1 Soap": "S1 Outlet_Soap (ppm)",
      "S2-FFA": "S2 Outlet_FFA",
      "S2 Soap": "S2 Outlet_Soap",
      "S3 Outlet_FFA": "S3 Outlet_FFA",
      "S3 Outlet_Soap (ppm)": "S3 Outlet_Soap (ppm)",
      "Bleached oil_Colour": "Bleached oil_Colour",
      "Deo Final_Colour": "Deo Final_Colour",
      "Deo Final_FFA": "Deo Final_FFA",
      "Deo Final_TBHQ (ppm)": "Deo Final_TBHQ (ppm)",
    };

    const unitsMap = {
      FFA: "%",
      Sediments: "",
      "S1-FFA": "%",
      "S1 Soap": "ppm",
      "S2-FFA": "%",
      "S2 Soap": "ppm",
      "S3 Outlet_FFA": "%",
      "S3 Outlet_Soap (ppm)": "ppm",
      "Bleached oil_Colour": "",
      "Deo Final_Colour": "",
      "Deo Final_FFA": "%",
      "Deo Final_TBHQ (ppm)": "ppm",
    };

    const queries = Object.entries(fieldMap).map(async ([key, fieldName]) => {
      const filter = {
        logId,
        "data.fieldName": fieldName,
      };

      if (businessUnit) {
        filter.businessUnit = new mongoose.Types.ObjectId(businessUnit);
      }

      if (startDate || endDate) {
        filter.entryCreatedAt = {};
        if (startDate) filter.entryCreatedAt.$gte = startDate;
        if (endDate) filter.entryCreatedAt.$lte = endDate;
      }

      const latestEntry = await LogEntryModel.findOne(filter, {
        "data.$": 1,
        logId: 1,
        entryCreatedAt: 1,
        entryEnteredAt: 1,
      })
        .sort({ entryEnteredAt: -1 })
        .lean();

      return { key, latestEntry };
    });

    const results = await Promise.all(queries);

    return results.reduce((acc, { key, latestEntry }) => {
      acc[key] = latestEntry
        ? {
            _id: latestEntry._id,
            logId: latestEntry.logId,
            entryCreatedAt: latestEntry.entryCreatedAt,
            entryEnteredAt: latestEntry.entryEnteredAt,
            fieldName: latestEntry.data?.[0]?.fieldName || "",
            fieldValue: latestEntry.data?.[0]?.fieldValue || "",
            units: unitsMap[key] || null,
          }
        : "";
      return acc;
    }, {});
  } catch (error) {
    throw error;
  }
}

async function fetchQualityDashboard(reqData, businessUnit) {
  try {
    const startDateAndTime = reqData.startDate
      ? new Date(reqData.startDate)
      : null;
    const endDateAndTime = reqData.endDate ? new Date(reqData.endDate) : null;
    const logId = "6784e9794f8f21a6dce62987";

    const fieldMap = {
      FFA: "Raw oil_FFA ",
      Sediments: "Raw oil_Sediments.",
      "S1-FFA": "S1 Outlet_FFA",
      "S1 Soap": "S1 Outlet_Soap (ppm)",
      "S2-FFA": "S2 Outlet_FFA",
      "S2 Soap": "S2 Outlet_Soap",
      "S3 Outlet_FFA": "S3 Outlet_FFA",
      "S3 Outlet_Soap (ppm)": "S3 Outlet_Soap (ppm)",
      "Bleached oil_Colour": "Bleached oil_Colour",
      "Deo Final_Colour": "Deo Final_Colour",
      "Deo Final_FFA": "Deo Final_FFA",
      "Deo Final_TBHQ (ppm)": "Deo Final_TBHQ (ppm)",
    };

    const unitsMap = {
      FFA: "%",
      Sediments: "",
      "S1-FFA": "%",
      "S1 Soap": "ppm",
      "S2-FFA": "%",
      "S2 Soap": "ppm",
      "S3 Outlet_FFA": "%",
      "S3 Outlet_Soap (ppm)": "ppm",
      "Bleached oil_Colour": "",
      "Deo Final_Colour": "",
      "Deo Final_FFA": "%",
      "Deo Final_TBHQ (ppm)": "ppm",
    };

    const selectedKeys = Object.keys(reqData).filter((key) => fieldMap[key]);
    const invalidKeys = Object.keys(reqData).filter(
      (key) =>
        !fieldMap[key] &&
        ![
          "startDate",
          "endDate",
          "clientId",
          "businessUnit",
          "plantName",
        ].includes(key)
    );

    if (invalidKeys.length > 0) {
      throw new Error(
        `Invalid parameters provided in query: ${invalidKeys.join(", ")}`
      );
    }

    const filteredLogQueryMap = Object.fromEntries(
      selectedKeys.map((key) => [key, fieldMap[key]])
    );

    const matchQueryBase = {
      logId,
      businessUnit: new mongoose.Types.ObjectId(businessUnit),
    };

    if (startDateAndTime || endDateAndTime) {
      matchQueryBase.entryCreatedAt = {};
      if (startDateAndTime)
        matchQueryBase.entryCreatedAt.$gte = startDateAndTime;
      if (endDateAndTime) matchQueryBase.entryCreatedAt.$lte = endDateAndTime;
    }
    const queries = selectedKeys.map((key) => {
      const fieldName = fieldMap[key];
      const unit = unitsMap[key] || null;
      return LogEntryModel.aggregate([
        { $match: matchQueryBase },
        { $unwind: "$data" },
        { $match: { "data.fieldName": fieldName } },
        { $sort: { entryEnteredAt: -1 } },
        {
          $project: {
            _id: 1,
            logId: 1,
            entryEnteredAt: 1,
            entryCreatedAt: 1,
            fieldName: "$data.fieldName",
            fieldValue: "$data.fieldValue",
            units: { $literal: unit },
          },
        },
      ]);
    });

    const resultsArray = await Promise.all(queries);
    const results = {};
    selectedKeys.forEach((key, index) => {
      results[key] = resultsArray[index];
    });

    return results;
  } catch (error) {
    throw error;
  }
}

async function getLiveDashboardInitialData(arg) {
  try {
    const { plcName, businessUnit } = arg;
    if (businessUnit.toString() == "6641959acbe6ea3941e60789") {
      // let results = await mongoDbManager.findDistinct(LiveData, plcName);
      // let results = await mongoDbManager.aggregation(LiveData, [
      //   { $group: { _id: { plcName: "$plcName" } } },
      // ]);
      // results = results.map((result) => result._id.plcName);

      // results = results.sort();
      // const sections = ["TANKFARM FLOW METERS", "TANK FARM", "REFINERY"];

      // const mappedResult = mapResultsToSections(sections, results);
      // const orderedResult = reorderMappedObject(mappedResult, "REFINERY");
      // return orderedResult;
      const result = {
        "REFINERY": "PLC_A",
        "TANKFARM FLOW METERS": "KRPL TANKFARM-FLOW METER E&H",
        "TANK FARM": "KRPL TANKFARM-TANK E&H",
        "ADDITIVES AND STEAM":"ADDITIVES AND STEAM"
      };
      return result;
    } else {
      return {};
    }

  } catch (error) {
    throw error;
  }
}
async function getLiveDashboardSectionData(plcName,date) {
  try {
    if (plcName === "PLC_A") {

      return await getPLCALiveData({plant_code:1018, material_code:1018, date}); 
     
    }
    // Section: TANK FARM TANK
    if (plcName === "KRPL TANKFARM-TANK E") {

     const result =  await getTankData(plcName);
     return result
     
    } else if (plcName === "KRPL TANKFARM-FLOW METER E") {

     const changes=  await  getFlowMeterSectionData()
     return changes
    
    } else if(plcName === "ADDITIVES"){

      const result= await getAdditives({plant_code: 1018,
        material_code: 1018,
        manufacture_date: date,});
      return result;

    }
    else {
      return {
        error: true,
        message: `Unsupported plcName: ${plcName}`,
      };
    }
  } catch (error) {
    console.error("Error in getSectionWiseData:", error);
    throw error;
  }
}

// async function getTankData(plcName) {
//   try {
//     plcName = "KRPL TANKFARM-TANK E&H";
//     // Fetch only active tags for this PLC
//     const tags = await mongoDbManager.aggregation(LiveData, [{ $match: { plcName: plcName} }]);

//     if (!tags.length) {
//       return {
//         section: "TANK DATA",
//         description: `No active tags found for ${plcName}`,
//         data: [],
//       };
//     }

//     // Extract unique tank names from tagName ("TANK 1 PRODUCT LEVEL" -> "TANK 1")
//     const tankNames = [...new Set(tags.map(t => t.tagName.split(" ")[0] + " " + t.tagName.split(" ")[1]))];

//     let data = tankNames.map((tankName) => {
//       // Get all tags belonging to this tank
//       const tankTags = tags.filter((t) => t.tagName.startsWith(tankName));

//       // Default productName by tank (you can replace this with a DB field if available)
//       const productMap = {
//         "TANK 1": "CRUDE SUNFLOWER OIL",
//         "TANK 2": "CRUDE SUNFLOWER OIL",
//         "TANK 3": "CRUDE SUNFLOWER OIL",
//         "TANK 4": "CRUDE SUNFLOWER OIL",
//         "TANK 5": "RSFO",
//         "TANK 6": "DEWAX OIL",
//         "TANK 7": "RSFO",
//         "TANK 8": "RBD",
//         "TANK 9": "SFAD",
//         "TANK 10": "ACID OIL",
//         "TANK 11": "ACID OIL SLUDGE",
//       };

//       let tagsArr = tankTags.map((tag) => ({
//         tagName: tag.tagName,
//         value: tag.latestValue ?? 0,
//         unit: tag.unit || "",
//         timestamp: tag.lastUpdated || tag.updatedAt,
//       }));

//       return {
//         tankName,
//         productName: productMap[tankName] || "UNKNOWN PRODUCT",
//         tags: tagsArr,
//       };
//     });
//     data = data.sort((a, b) => {
//       return a.tankName.split(" ")[1] - b.tankName.split(" ")[1];
//     });

//     return {
//       section: "TANK DATA",
//       description: "Using hot collection (latest values)",
//       data,
//     };
//   } catch (err) {
//     console.error("Error fetching tank data:", err);
//     return {
//       section: "TANK DATA",
//       description: "Error fetching data",
//       data: [],
//     };
//   }
// }
async function getTankData(plcName) {
  try {
    plcName = "KRPL TANKFARM-TANK E&H";

    const tags = await mongoDbManager.aggregation(LiveData, [
      { $match: { plcName } }
    ]);

    if (!tags.length) {
      return {
        section: "TANK DATA",
        description: `No active tags found for ${plcName}`,
        data: [],
      };
    }

    // Tank mapping for name + density
    const tankMap = {
      "TANK 1": { updatedName: "TANK 1-CSF", product: "CRUDE SUNFLOWER OIL", density: 0.91 ,capacity: 2957, maxLevel:15391.70,maxTemp:38},
      "TANK 2": { updatedName: "TANK 2-CSF", product: "CRUDE SUNFLOWER OIL", density: 0.91 ,capacity: 2953,maxLevel:15385,maxTemp:38 },
      "TANK 3": { updatedName: "TANK 3-CPO", product: "CRUDE SUNFLOWER OIL", density: 0.90 ,capacity: 2921,maxLevel:15396,maxTemp:38 },
      "TANK 4": { updatedName: "TANK 4-RPO", product: "CRUDE SUNFLOWER OIL", density: 0.90 ,capacity: 2922,maxLevel:15387.1,maxTemp:38},
      "TANK 5": { updatedName: "TANK 5-RSF", product: "RSFO", density: 0.91 ,capacity: 2953,maxLevel:15398.3,maxTemp:38},
      "TANK 6": { updatedName: "TANK 6-PFAD", product: "DEWAX OIL", density: 0.91 ,capacity: 1076,maxLevel:7862.8,maxTemp:38},
      "TANK 7": { updatedName: "TANK 7-RBD Palm Olein", product: "RSFO", density: 0.90, capacity: 1064,maxLevel:7866.1,maxTemp:38},
      "TANK 8": { updatedName: "TANK 8-Palm Stearin", product: "RBD", density: 0.90, capacity: 1063,maxLevel:7847.3,maxTemp:38},
      "TANK 9": { updatedName: "TANK 9-SFAD", product: "SFAD", density: 0.92 ,capacity: 182,maxLevel:1964,maxTemp:38},
      "TANK 10": { updatedName: "TANK 10-Acid Oil", product: "ACID OIL", density: 0.92, capacity: 182,maxLevel:1965.7,maxTemp:38},
      "TANK 11": { updatedName: "TANK 11-Acid Oil Sludge", product: "ACID OIL SLUDGE", density: 0.92, capacity: 181,maxLevel:1966.2,maxTemp:38}
    };

    // Extract "TANK X"
    const tankNames = [...new Set(
      tags.map(t => t.tagName.split(" ")[0] + " " + t.tagName.split(" ")[1])
    )];

    let data = tankNames.map(tankName => {
      // const tankTags = tags.filter(t => t.tagName.startsWith(tankName));
      const tankTags = tags.filter(t => {
        const match = t.tagName.match(/^TANK\s+\d+/i);
        return match && match[0] === tankName;
      });
      const mapInfo = tankMap[tankName] || { updatedName: tankName, product: "UNKNOWN PRODUCT", density: 1,capacity: 1};

      const tagsArr = tankTags.map(tag => {
        let value = tag.latestValue ?? 0;

        // ONLY convert KL → MT
        if (tag.unit === "KL") {
          value = value * mapInfo.density;  // KL × density = MT
        }

        return {
          tagName: tag.tagName,
          value,
          unit: tag.unit==="KL" ? "MT" : tag.unit,          // keep original unit
          timestamp: tag.lastUpdated || tag.updatedAt,
        };
      });

      return {
        tankName: mapInfo.updatedName,
        productName: mapInfo.product,
        tags: tagsArr,
        capacity: mapInfo.capacity,
        maxLevel:mapInfo.maxLevel,
        maxTemp:mapInfo.maxTemp
      };
    });

    // Sort by tank number
    data = data.sort((a, b) => {
      const numA = parseInt(a.tankName.match(/\d+/)?.[0] || 0);
      const numB = parseInt(b.tankName.match(/\d+/)?.[0] || 0);
      return numA - numB;
    });

    return {
      section: "TANK DATA",
      description: "Converted KL to MT based on density",
      data,
    };

  } catch (err) {
    console.error("Error fetching tank data:", err);
    return {
      section: "TANK DATA",
      description: "Error fetching data",
      data: [],
    };
  }
}

async function getFlowMeterSectionData() {
  try {
    const plcName = "KRPL TANKFARM-FLOW METER E&H"; // hot collection uses exact plcName
    const DEFAULT_MAX_VALUE = 40;


    // Fetch all latest tag entries from hot collection
    let pipeline = [
      { $match: { plcName: plcName, tagName: { $exists: true } } },
    ];
    const allTags = await mongoDbManager.aggregation(LiveData, pipeline);

    // Group tags by their pipeline/group identifier
    const tagGroups = {};

    for (const tag of allTags) {
      const tagName = tag.tagName.toUpperCase().trim();

      // If tag ends with -TOT, remove it to get base key
      const groupKey = tagName.endsWith("-TOT")
        ? tagName.replace(/-TOT$/, "")
        : tagName;

      if (!tagGroups[groupKey]) {
        tagGroups[groupKey] = { flowRateTag: null, totalizerTag: null };
      }

      if (tagName.endsWith("-TOT")) {
        tagGroups[groupKey].totalizerTag = tag;
      } else {
        tagGroups[groupKey].flowRateTag = tag;
      }
    }

    // Build result array
    const resultArray = [];

    for (const group in tagGroups) {
      const { flowRateTag, totalizerTag } = tagGroups[group];
      if (!flowRateTag || !totalizerTag) continue;

      resultArray.push({
        group,
        flowRateTag: flowRateTag.tagName,
        averageFlowRate: flowRateTag.latestValue,
        unitOfFlowRate: flowRateTag.unit,
        totalizerTag: totalizerTag.tagName,
        totalizerValue: totalizerTag.latestValue,
        unitOfToatalizer: totalizerTag.unit,
        totalizerTimestamp: totalizerTag.lastUpdated,
        maxValue: DEFAULT_MAX_VALUE,
      });
    }

    resultArray.sort((a, b) => a.group.localeCompare(b.group));

    return {
      section: "FLOW METER",
      description: "Using hot collection (latest values)",
      data: resultArray,
    };
  } catch (error) {
    console.error("Error in getFlowMeterSectionData:", error);
    throw error;
  }
}



async function getPLCALiveData(params) {
  let { material_code, plant_code, date } = params;
  const shifts = ["A", "B", "C"];
  const MATERIAL_TAG_MAP = {
    RSF010: "FT-816B.1", // DIO Final
    CSF010: "FT 1101", // Crude Inlet
  };

  const LiveDataEntries = getLiveDataEntriesCollection();
  const CSF_RSF_OIL_DENSITY = 0.92;

  const shiftEndTimeMap = {
    A: "14:00:00",
    B: "22:00:00",
    C: "06:00:00",
  };

  // Default date → today (UTC)
  if (!date) {
    const now = new Date();
    const year = now.getUTCFullYear();
    const month = (now.getUTCMonth() + 1).toString().padStart(2, "0");
    const day = now.getUTCDate().toString().padStart(2, "0");
    date = `${year}-${month}-${day}`;
  }

  // Convert IST to UTC
  function getUTCDateFromIST(h, m = 0, d, mo, y) {
    const istDate = new Date(Date.UTC(y, mo - 1, d, h, m));
    return new Date(istDate.getTime() - 5.5 * 60 * 60 * 1000);
  }

  // Generate shift windows in UTC
  function getShiftWindowsUTCFromIST(dateStr) {
    const [year, month, day] = dateStr.split("-").map(Number);

    return {
      A: {
        start: getUTCDateFromIST(6, 0, day, month, year),
        end: getUTCDateFromIST(14, 0, day, month, year),
      },
      B: {
        start: getUTCDateFromIST(14, 0, day, month, year),
        end: getUTCDateFromIST(22, 0, day, month, year),
      },
      C: {
        start: getUTCDateFromIST(22, 0, day, month, year),
        end: getUTCDateFromIST(6, 0, day + 1, month, year),
      },
    };
  }

  const shiftWindows = getShiftWindowsUTCFromIST(date);

  // Fetch latest live values from hot collection
  const [crudeInletAvg, dioFinalAvg] = await Promise.all([
    LiveData.findOne({ tagName: "FT 1101" }).sort({ timestamp: -1 }).lean(),
    LiveData.findOne({ tagName: "FT-816B.1" }).sort({ timestamp: -1 }).lean(),
  ]);

  // Fetch shift-wise production from historical entries
async function fetchShiftWiseProduction(tagName) {
  const tagDoc = await mongoDbManager.findOne(LiveData, { tagName, plcName: "PLC_A" });
  if (!tagDoc) return { result: [], totalProductionForTag: 0 };

  const tagId = tagDoc._id;
  let result = [];
  let totalProductionForTag = 0;

  const now = new Date(); // current UTC time

  for (const shift of shifts) {
    const window = shiftWindows[shift];
    const isFutureShift = now < window.start;

    // Always fetch up to min(now, window.end) — handles ongoing shifts
    // const windowEnd = now < window.end ? now : window.end;

    const agg = await LiveDataEntries.aggregate([
      { $match: { tagId, timestamp: { $gte: window.start, $lte: window.end } } },
      { $sort: { timestamp: 1 } },
      {
        $group: {
          _id: null,
          firstValue: { $first: "$value" },
          firstValueTimestamp: { $first: "$timestamp" },
          lastValue: { $last: "$value" },
          lastValueTimestamp: { $last: "$timestamp" },
        },
      },
    ]).toArray();
    // console.log(agg);

    if (isFutureShift) {
      // shift not started yet
      result.push({
        shift,
        MFMProductionEntryData: {
          quantity: 0,
          uom: "KG",
          timestamp: shiftEndTimeMap[shift],
        },
      });
      continue;
    }

    if (!agg || agg.length === 0) {
      // no data in this period (yet)
      // result.push({
      //   shift,
      //   MFMProductionEntryData: {
      //     quantity: 0,
      //     uom: "KG",
      //     timestamp: shiftEndTimeMap[shift],
      //   },
      // });
      continue;
    }

    const { firstValue, lastValue } = agg[0];
    if (firstValue == null || lastValue == null) {
      result.push({
        shift,
        MFMProductionEntryData: {
          quantity: 0,
          uom: "KG",
          timestamp: shiftEndTimeMap[shift],
        },
      });
      continue;
    }

    // Compute partial or full delta
    let totalLitres = lastValue - firstValue;
    if (totalLitres < 0) totalLitres = 0;

    const totalKg = totalLitres * 1000;
    totalProductionForTag += totalKg;

    result.push({
      shift,
      MFMProductionEntryData: {
        quantity: Number(totalKg.toFixed(3)),
        uom: "KG",
        timestamp: shiftEndTimeMap[shift],
      },
    });
  }

  // result.sort((a, b) => shifts.indexOf(a.shift) - shifts.indexOf(b.shift));

  return { result, totalProductionForTag };
}



  const [rsfResult, csfResult] = await Promise.all([
    fetchShiftWiseProduction("FQ-816B.1-1"),
    fetchShiftWiseProduction("FQ-1101-1"),
  ]);
  
  const rsfProduction = rsfResult.result;
  const csfProduction = csfResult.result;
  // console.log(rsfProduction, csfProduction);

  const totalProductionEntry = rsfResult.totalProductionForTag;

  let totalLoss = 0;
  const productionLoss = shifts.map((shift) => {
    const rsf = rsfProduction.find((d) => d.shift === shift);
    const csf = csfProduction.find((d) => d.shift === shift);
    const lossQuantity =
    (rsf?.MFMProductionEntryData.quantity ?? 0) -
      (csf?.MFMProductionEntryData.quantity ?? 0) 

    totalLoss += Number(lossQuantity.toFixed(3));

    return {
      shift,
      MFMProductionLossData: {
        quantity: Number(lossQuantity.toFixed(3)),
        uom: "KG",
        timestamp: shiftEndTimeMap[shift],
      },
    };
  });

  return {
    liveData: [
      {
        name: "Crude Inlet",
        averageRateOfFlow: crudeInletAvg?.latestValue ?? null,
        unit: crudeInletAvg?.unit ?? null,
        latestTimestamp: crudeInletAvg?.lastUpdated ?? null,
        maximum:36000
      },
      {
        name: "Dio Final",
        averageRateOfFlow: dioFinalAvg?.latestValue ?? null,
        unit: dioFinalAvg?.unit ?? null,
        latestTimestamp: dioFinalAvg?.lastUpdated ?? null,
        maximum:35000
      },
    ],
    ShiftWiseMFMProductionEntry: rsfProduction,
    ShiftWiseMFMProductionLoss: productionLoss,
    ShiftWisetotalMFMProductionLoss: Number(totalLoss.toFixed(3)),
    ShiftWisetotalMFMProductionEntry: Number(totalProductionEntry.toFixed(2)),
  };
}



function reorderMappedObject(obj, keyToMoveFirst) {
  if (!obj.hasOwnProperty(keyToMoveFirst)) return obj;

  const reordered = {
    [keyToMoveFirst]: obj[keyToMoveFirst],
  };

  for (const key in obj) {
    if (key !== keyToMoveFirst) {
      reordered[key] = obj[key];
    }
  }

  return reordered;
}
function mapResultsToSections(sections, results) {
  const mapped = {};
  for (let i = 0; i < sections.length; i++) {
    mapped[sections[i]] = results[i] || null;
  }
  return mapped;
}

async function getPlants(businessUnit) {
  try {
    if (businessUnit == "670d76f0e19b9be1de25f1aa") {
      const plants = ["Plant4"];
      return plants;
    } else {
      return [];
    }
  } catch (error) {
    throw error;
  }
}

async function getPowerBiDashBoards(businessUnit) {
  try {
    const dashboards = await mongoDbManager.findMany(DashBoard, {
      businessUnit: new mongoose.Types.ObjectId(businessUnit),
      isActive: true,
    });

    if (dashboards && dashboards.length > 0) {
      return dashboards;
    } else {
      return [];
    }
  } catch (error) {
    console.error("Error fetching dashboards:", error);
    throw error;
  }
}

async function createPowerBiDashboard(reqBody) {
  try {
    const dashboard = await mongoDbManager.insertOne(DashBoard, reqBody);
    return dashboard;
  } catch (error) {
    console.error("Error creating dashboard:", error);
    throw error;
  }
}

async function updatePowerBiDashboard(reqBody) {
  try {
    const updatedDashboard = await mongoDbManager.findOneAndUpdate(
      DashBoard,
      { _id: reqBody._id },
      reqBody,
      { new: true, upsert: true }
    );
    return updatedDashboard;
  } catch (error) {
    console.error("Error updating dashboard:", error);
    throw error;
  }
}
async function deletePowerBiDashboard(reqBody) {
  try {
    const result = await mongoDbManager.updateOne(
      DashBoard,
      {
        _id: reqBody._id,
        isActive: true,
      },
      { isActive: false }
    );
    return result;
  } catch (error) {
    console.error("Error deleting dashboard:", error);
    throw error;
  }
}

async function getAdditives({ plant_code, material_code, manufacture_date }) {
  // Map of code tag → { dbName, displayName }
  const TAG_MAP = {
    "FT-SAC/R-1": { dbName: "FT-SAC/R-1", displayName: "STEAM - FLOW (SF)",maxValue:9500 },
    "FQ-SAC/R-1": { dbName: "FQ-SAC/R-1", displayName: "STEAM - TOTALISER (SF)" },
    "P1178NA-1": { dbName: "1178NA", displayName: "CAUSTIC FLOW", maxValue:500 },
    "FQ-P1178NA-1": { dbName: "FQ-P1178NA-1", displayName: "CAUSTIC_TOTALIZER" },
    "P1134PA-1": { dbName: "1134PA", displayName: "PHOSPHORIC ACID FLOW", maxValue:60},
    "FQ-P1134PA-1": { dbName: "FQ-P1134PA-1", displayName: "PHOSPHORIC_TOTALIZER" },
  };

  const ADDITIVES_TAGS = Object.keys(TAG_MAP); // ["FT-SAC/R-1", ...]

  function getUTCDateFromIST(h, m = 0, d, mo, y) {
    const istDate = new Date(Date.UTC(y, mo - 1, d, h, m));
    return new Date(istDate.getTime() - 5.5 * 60 * 60 * 1000);
  }

  function getShiftWindowsUTCFromIST(dateStr) {
    const [year, month, day] = dateStr.split("-").map(Number);
    return {
      A: { start: getUTCDateFromIST(6, 0, day, month, year), end: getUTCDateFromIST(14, 0, day, month, year) },
      B: { start: getUTCDateFromIST(14, 0, day, month, year), end: getUTCDateFromIST(22, 0, day, month, year) },
      C: { start: getUTCDateFromIST(22, 0, day, month, year), end: getUTCDateFromIST(6, 0, day + 1, month, year) },
    };
  }

  const date = manufacture_date || new Date().toISOString().split("T")[0];
  const shifts = ["A", "B", "C"];
  const shiftEndTimeMap = { A: "14:00:00", B: "22:00:00", C: "06:00:00" };
  const shiftWindows = getShiftWindowsUTCFromIST(date);
  const now = new Date();

  const LiveDataEntries = getLiveDataEntriesCollection();

  const liveData = [];
  const totaliserData = [];

  for (const tag of ADDITIVES_TAGS) {
    const { dbName, displayName,maxValue = null } = TAG_MAP[tag];

    const doc = await LiveData.findOne({ tagName: dbName }).sort({ lastUpdated: -1 }).lean();
    if (!doc) continue;

    if (tag.startsWith("FQ-")) {
      // Totaliser
      const tagId = doc._id;
      const shiftData = [];

      for (const shift of shifts) {
        const window = shiftWindows[shift];

        const agg = await LiveDataEntries.aggregate([
          { $match: { tagId, timestamp: { $gte: window.start, $lte: window.end } } },
          { $sort: { timestamp: 1 } },
          { $group: { _id: null, firstValue: { $first: "$value" }, lastValue: { $last: "$value" } } }
        ]).toArray();

        let qty = 0;

        if (agg.length > 0) {
          qty = agg[0].lastValue - agg[0].firstValue;
          if (qty < 0) qty = 0;
        } else if (now >= window.start) {
          qty = doc.latestValue ?? 0;
        }

        shiftData.push({
          shift,
          MFMProductionEntryData: {
            quantity: Number(qty.toFixed(3)),
            uom: doc.unit,
            timestamp: shiftEndTimeMap[shift],
          },
        });
      }

      totaliserData.push({
        additiveName: displayName,
        data: shiftData,
      });

    } else {
      // Flow rate
      function formatValue(value) {
        if (value == null) return null;
        if (Math.abs(value) < 0.001) return Number(value.toExponential(3));
        return Number(value.toFixed(3));
      }

      liveData.push({
        name: displayName,
        averageRateOfFlow: formatValue(doc.latestValue),
        unit: doc.unit ?? null,
        latestTimestamp: doc.lastUpdated ?? null,
        maxValue:maxValue
      });
    }
  }

  return {
    liveData,
    ShiftWiseAdditiveConsumption: totaliserData,
  };
}



module.exports = {
  getLogComplianceStatsAndTable,
  fetchLogoFromBusinessUnit,
  fetchLatestProcessEntries,
  fetchProcessDashBoardEntries,
  energyDashboard,
  getProcessDashBoardEntries,
  getLatestProcessEntries,
  fetchLatestQualityEntries,
  fetchQualityDashboard,
  getPlants,
  getPowerBiDashBoards,
  createPowerBiDashboard,
  updatePowerBiDashboard,
  deletePowerBiDashboard,
  getLiveDashboardInitialData	,
  getLiveDashboardSectionData,
};

function queryBuilder(reqData) {
  const query = {
    isDeleted: false,
  };

  if (reqData.businessUnit) {
    query.businessUnit = reqData.businessUnit;
  }

  const page = reqData.page ? parseInt(reqData.page, 10) : null;
  const limit = reqData.limit ? parseInt(reqData.limit, 10) : null;
  const skip = page && limit ? (page - 1) * limit : 0;
  const sort = reqData.sort || "createdAt";
  const order = reqData.order === "asc" ? 1 : -1;
  const sortOrder = { [sort]: order };
  const listAll = reqData.listAll === "true";
  const allDetails = reqData.allDetails === "true";

  return {
    query,
    skip,
    page,
    limit,
    sortOrder,
    listAll,
    allDetails,
  };
}

async function client2(reqData, businessUnit) {
  try {
    const startDateAndTime = reqData.startDate
      ? new Date(reqData.startDate)
      : null;
    const endDateAndTime = reqData.endDate ? new Date(reqData.endDate) : null;
    const clientId = reqData.clientId;
    const page = reqData.page ? parseInt(reqData.page, 10) : 1;
    const limit = reqData.limit ? parseInt(reqData.limit, 10) : 8000000;
    const skip = (page - 1) * limit;

    const logQueryMap = {
      phosphoricAcid: {
        logId: "6720663786198fb719c661af",
        fieldName: "1134PA	LPH  (2 - 50)",
      },
      causticSoda: {
        logId: "6720663786198fb719c661af",
        fieldName: "1178NA         LPH (0 - 500)",
      }, // Replace with actual fieldId
      earthPowder: {
        logId: "67208077144438303ac8a93a",
        fieldName: "Bleaching earth dosing 630 A-% (0.5 - 2.0)",
      }, // Replace with actual fieldId
      coal: {
        logId: "6720d2218c7aa3d2b6a43a33",
        fieldName: "Coal Consumption in TONS",
      }, // Replace with actual fieldId
      steam: {
        logId: "6721b3f2dec4fc5217ac530c",
        fieldName: "STEAM PARAMETER Steam Totalizer 1- MT",
      }, // Replace with actual fieldId
      power: {
        logId: "6721cc92a0c31d13f8fe7e9e",
        fieldName: "Total Units (Eb+ Genset)",
      }, // Replace with actual fieldId
    };

    const rangeMap = {
      phosphoricAcid: { min: 2, max: 50 },
      causticSoda: { min: 0, max: 500 },
      earthPowder: { min: 0.5, max: 2.0 },
    };

    const unitsMap = {
      phosphoricAcid: "LPH",
      causticSoda: "LPH",
      earthPowder: "%",
      coal: "TONS",
      steam: "MT",
      power: "kWh",
    };

    // Extract query parameters from req.query
    let selectedKeys = Object.keys(reqData).filter((key) => logQueryMap[key]);
    const invalidKeys = Object.keys(reqData).filter(
      (key) =>
        !logQueryMap[key] &&
        !["startDate", "endDate", "page", "limit"].includes(key) &&
        !clientId
    );

    if (invalidKeys.length > 0) {
      throw new Error(
        `Invalid parameters provided in query: ${invalidKeys.join(", ")}`
      );
    }

    if (selectedKeys.length === 0) {
      selectedKeys = [];
    }

    // Filter logQueryMap based on query parameters
    const filteredLogQueryMap = Object.fromEntries(
      selectedKeys.map((key) => [key, logQueryMap[key]])
    );

    const queries = Object.entries(filteredLogQueryMap).map(
      ([key, { logId, fieldName }]) => {
        const matchQuery = {
          logId,
          businessUnit: new mongoose.Types.ObjectId(businessUnit),
        };
        if (startDateAndTime && endDateAndTime) {
          matchQuery.entryCreatedAt = {
            $gte: startDateAndTime,
            $lte: endDateAndTime,
          };
        } else if (startDateAndTime) {
          matchQuery.entryCreatedAt = { $gte: startDateAndTime };
        } else if (endDateAndTime) {
          matchQuery.entryCreatedAt = { $lte: endDateAndTime };
        }

        return LogEntryModel.aggregate([
          { $match: matchQuery },
          { $unwind: "$data" },
          { $match: { "data.fieldName": fieldName } },
          { $sort: { entryEnteredAt: -1 } },
          { $skip: skip },
          { $limit: limit },
          {
            $project: {
              _id: 1,
              logId: 1,
              entryEnteredAt: 1,
              entryCreatedAt: 1,
              fieldName: "$data.fieldName",
              fieldValue: "$data.fieldValue",
              units: { $literal: unitsMap[key] || null },
              range: { $literal: rangeMap[key] || null },
            },
          },
        ]);
      }
    );

    // Execute all queries in parallel
    const results = await Promise.all(queries);
    const counts = await countData(
      filteredLogQueryMap,
      startDateAndTime,
      endDateAndTime,
      businessUnit
    );

    return {
      results,
      counts,
      selectedKeys,
      page,
      limit,
    };
  } catch (error) {
    throw error;
  }
}

async function client3(reqData, businessUnit) {
  try {
    const startDateAndTime = reqData.startDate ? reqData.startDate : null;
    const endDateAndTime = reqData.endDate ? reqData.endDate : null;
    const clientId = reqData.clientId;
    const page = reqData.page ? parseInt(reqData.page, 10) : 1;
    const limit = reqData.limit ? parseInt(reqData.limit, 10) : 8000000;
    const skip = (page - 1) * limit;

    const logQueryMap = {
      area: { logId: "680797f04f216d032cacfdd2", fieldName: "AREA" },
      sampleCollectedDate: {
        logId: "680797f04f216d032cacfdd2",
        fieldName: "SAMPLE COLLECTED DATE",
      },
      oxygen: { logId: "680797f04f216d032cacfdd2", fieldName: "OXYGEN (O2)" },
      nitrogen: {
        logId: "680797f04f216d032cacfdd2",
        fieldName: "NITROGEN  (N2)",
      },
      hydrogen: {
        logId: "680797f04f216d032cacfdd2",
        fieldName: "HYDROGEN (H2)",
      },
      methane: { logId: "680797f04f216d032cacfdd2", fieldName: "METHANE(CH4)" },
      ethylene: {
        logId: "680797f04f216d032cacfdd2",
        fieldName: "ETHYLENE (C2H4)",
      },
      ethane: { logId: "680797f04f216d032cacfdd2", fieldName: "ETHANE(C2H6)" },
      acetylene: {
        logId: "680797f04f216d032cacfdd2",
        fieldName: "ACETYLENE (C2H2)",
      },
      propylenePropane: {
        logId: "680797f04f216d032cacfdd2",
        fieldName: "PROPYLENE +PROPANE (C3H6+C3H8)",
      },
      carbondioxide: {
        logId: "680797f04f216d032cacfdd2",
        fieldName: "CARBON DIOXIDE (Co2).",
      },
      carbonmonoxide: {
        logId: "680797f04f216d032cacfdd2",
        fieldName: "CARBON MONOXIDE (N2).",
      },
      totalCombustibles: {
        logId: "680797f04f216d032cacfdd2",
        fieldName: "TOTAL COMBUSTIBLES (TDCG)",
      },
    };

    const rangeMap = {
      hydrogen: { min: 0, max: 1000, normal: 150 },
      methane: { min: 0, max: 80, normal: 25 },
      ethylene: { min: 0, max: 150, normal: 20 },
      ethane: { min: 0, max: 35, normal: 10 },
      acetylene: { min: 0, max: 70, normal: 15 },
      carbondioxide: { min: 0, max: 15000, normal: 1000 },
      carbonmonoxide: { min: 0, max: 1000, normal: 500 },
      totalCombustibles: { min: 0, max: 4630, normal: 720 },
    };

    const unitsMap = {
      oxygen: "O2",
      nitrogen: "N2",
      hydrogen: "H2",
      methane: "CH4",
      ethylene: "C2H4",
      ethane: "C2H6",
      acetylene: "C2H2",
      propylenePropane: "C3H6+C3H8",
      carbondioxide: "Co2",
      carbonmonoxide: "N2",
      totalCombustibles: "TDCG",
    };

    // Extract query parameters from req.query
    let selectedKeys = Object.keys(reqData).filter((key) => logQueryMap[key]);
    const invalidKeys = Object.keys(reqData).filter(
      (key) =>
        !logQueryMap[key] &&
        !["startDate", "endDate", "page", "limit"].includes(key) &&
        !clientId
    );

    if (invalidKeys.length > 0) {
      throw new Error(
        `Invalid parameters provided in query: ${invalidKeys.join(", ")}`
      );
    }

    if (selectedKeys.length === 0) {
      selectedKeys = [];
    }

    // Filter logQueryMap based on query parameters
    const filteredLogQueryMap = Object.fromEntries(
      selectedKeys.map((key) => [key, logQueryMap[key]])
    );

    const queries = Object.entries(filteredLogQueryMap).map(
      ([key, { logId, fieldName }]) => {
        const matchQuery = {
          logId,
          businessUnit: new mongoose.Types.ObjectId(businessUnit),
        };

        return LogEntryModel.aggregate([
          { $match: matchQuery },

          // {
          //   $addFields: {
          //     sampleCollectedDate: {
          //       $arrayElemAt: [
          //         {
          //           $map: {
          //             input: {
          //               $filter: {
          //                 input: "$data",
          //                 as: "item",
          //                 cond: {
          //                   $eq: ["$$item.fieldName", "SAMPLE COLLECTED DATE"],
          //                 },
          //               },
          //             },
          //             as: "f",
          //             in: {
          //               $convert: {
          //                 input: "$$f.fieldValue",
          //                 // to: "date",
          //                 onError: null,
          //                 onNull: null,
          //               },
          //             },
          //           },
          //         },
          //         0,
          //       ],
          //     },
          //   },
          // },

          {
            $addFields: {
              sampleCollectedDate: {
                $arrayElemAt: [
                  {
                    $map: {
                      input: {
                        $filter: {
                          input: "$data",
                          as: "item",
                          cond: {
                            $eq: ["$$item.fieldName", "SAMPLE COLLECTED DATE"],
                          },
                        },
                      },
                      as: "f",
                      in: "$$f.fieldValue",
                    },
                  },
                  0,
                ],
              },
            },
          },

          ...(startDateAndTime || endDateAndTime
            ? [
                {
                  $match: {
                    ...(startDateAndTime && {
                      sampleCollectedDate: { $gte: startDateAndTime },
                    }),
                    ...(endDateAndTime && {
                      sampleCollectedDate: {
                        ...(startDateAndTime ? { $gte: startDateAndTime } : {}),
                        $lte: endDateAndTime,
                      },
                    }),
                  },
                },
              ]
            : []),

          { $unwind: "$data" },
          { $match: { "data.fieldName": fieldName } },
          { $sort: { sampleCollectedDate: -1 } },
          { $skip: skip },
          { $limit: limit },
          {
            $project: {
              _id: 1,
              logId: 1,
              sampleCollectedDate: 1,
              fieldName: "$data.fieldName",
              fieldValue: "$data.fieldValue",
              units: { $literal: unitsMap[key] || "" },
              range: { $literal: rangeMap[key] || "" },
            },
          },
        ]);
      }
    );

    // Execute all queries in parallel
    const results = await Promise.all(queries);
    const resultsWithPeakFlag = results.map((dataArray) => {
      if (!dataArray || dataArray.length === 0) return [];

      const maxFieldValue = Math.max(
        ...dataArray.map((item) => item.fieldValue || 0)
      );

      return dataArray.map((item) => ({
        ...item,
        isPeak: item.fieldValue === maxFieldValue,
      }));
    });
    const counts = await countData(
      filteredLogQueryMap,
      startDateAndTime,
      endDateAndTime,
      businessUnit
    );

    return {
      results: resultsWithPeakFlag,
      counts,
      selectedKeys,
      page,
      limit,
    };
  } catch (error) {
    throw error;
  }
}
