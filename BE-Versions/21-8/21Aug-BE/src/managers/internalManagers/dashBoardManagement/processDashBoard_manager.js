const {
  LiveData,
  getLiveDataEntriesCollection,
} = require("../../../models/mongoDB/liveDataManagement/liveData_model");
const { LogModel } = require("../../../models/mongoDB/logManagement/log_model");
const {
  LogEntryModel,
} = require("../../../models/mongoDB/logManagement/logEntry_model");
const { mongoDbManager } = require("../../dBManagers");

const getAllProcesssMetrics = async (businessUnit) => {
  try {
    if (businessUnit.toString() == "6641959acbe6ea3941e60789") {
      const metrics = {};

      metrics.throughput = await getProductionThroughputPercentage(
        businessUnit
      );
      metrics.productionLoss = await getProductionLoss(businessUnit);
      metrics.materialUtilization = await getMaterialUtilizationEfficiency(
        businessUnit
      );
      const downtimeCounts = await getProcessDowntimeCounts(
        businessUnit
      )
      metrics.totalProcesses= downtimeCounts.totalProcesses
        metrics.processesUnderDowntime= downtimeCounts.processesUnderDowntime

      return {
        yieldPercentage: metrics?.yieldPercentage || 0,
        productionLoss: metrics?.productionLoss || 0,
        throughput: metrics?.throughput || 0,
        efficiency: metrics?.efficiency || 0,
        changeoverTime: metrics?.changeoverTime || 0,
        materialUtilization: metrics?.materialUtilization || 0,
        totalProcesses: metrics.totalProcesses,
        processesUnderDowntime: metrics.processesUnderDowntime,
      };
    } else {
      return {};
    }
  } catch (error) {
    console.error("Error fetching dashboards:", error);
    throw error;
  }
};

const getProductionThroughputPercentage = async (businessUnit) => {
  try {
    const TAG_NAME = "FQ-816B.1-1"; // Finished Goods Flow Meter (DEO Final Outlet)

    // ---- TARGET VALUE (IMPORTANT) ----
    const TARGET_THROUGHPUT_KG_HR = 15759.68; // <-- replace with real target
    // ----------------------------------

    const tagDoc = await mongoDbManager.findOne(LiveData, {
      tagName: TAG_NAME,
      plcName: "PLC_A",
    });

    if (!tagDoc) {
      return 0;
    }

    const tagId = tagDoc._id;

    // Full day window across 3 shifts
    const now = new Date();
    const year = now.getUTCFullYear();
    const month = now.getUTCMonth();
    const day = now.getUTCDate();

    // IST → UTC conversion is already baked in
    const shiftWindows = {
      A: {
        start: new Date(Date.UTC(year, month, day, 0, 30)), // 06:00 IST
        end: new Date(Date.UTC(year, month, day, 8, 30)), // 14:00 IST
      },
      B: {
        start: new Date(Date.UTC(year, month, day, 8, 30)), // 14:00 IST
        end: new Date(Date.UTC(year, month, day, 16, 30)), // 22:00 IST
      },
      C: {
        start: new Date(Date.UTC(year, month, day, 16, 30)), // 22:00 IST
        end: new Date(Date.UTC(year, month, day + 1, 0, 30)), // Next day 06:00 IST
      },
    };

    const start = shiftWindows.A.start;
    const end = shiftWindows.C.end;
    const LiveDataEntries = getLiveDataEntriesCollection();

    const agg = await LiveDataEntries.aggregate([
      {
        $match: {
          tagId,
          timestamp: { $gte: start, $lte: end },
        },
      },
      { $sort: { timestamp: 1 } },
      {
        $group: {
          _id: null,
          firstValue: { $first: "$value" },
          lastValue: { $last: "$value" },
          firstTimestamp: { $first: "$timestamp" },
          lastTimestamp: { $last: "$timestamp" },
        },
      },
    ]).toArray();

    if (!agg || agg.length === 0) {
      return 0;
    }

    const { firstValue, lastValue, firstTimestamp, lastTimestamp } = agg[0];

    if (firstValue == null || lastValue == null) {
      return 0;
    }

    // Total litres converted to KG
    let totalLitres = lastValue - firstValue;
    if (totalLitres < 0) totalLitres = 0;

    const totalKG = totalLitres * 1000;

    const durationHrs =
      (new Date(lastTimestamp) - new Date(firstTimestamp)) / (1000 * 60 * 60);

    const kgPerHour =
      durationHrs > 0 ? Number((totalKG / durationHrs).toFixed(3)) : 0;

    // ---- FINAL THROUGHOUT PERCENTAGE ----
    const throughputPercentage = TARGET_THROUGHPUT_KG_HR
      ? Number(((kgPerHour / TARGET_THROUGHPUT_KG_HR) * 100).toFixed(2))
      : 0;

    // console.log("throughputPercentage");

    return throughputPercentage;
  } catch (err) {
    console.error("Throughput calculation error:", err);
    throw err;
  }
};
const getProductionLoss = async (businessUnit) => {
  try {
    const TAG_FEED = "FQ-1101-1"; // Crude inlet / feed
    const TAG_FINISHED = "FQ-816B.1-1"; // DEO Final outlet (finished product)

    const getTotalKgFromTag = async (tagName) => {
      const tagDoc = await mongoDbManager.findOne(LiveData, {
        tagName,
        plcName: "PLC_A",
      });
      if (!tagDoc) return 0;

      const tagId = tagDoc._id;

      // We use one full day from Shift A → Shift C
      const now = new Date();
      const year = now.getUTCFullYear();
      const month = now.getUTCMonth();
      const day = now.getUTCDate();

      // IST → UTC conversion is already baked in
      const shiftWindows = {
        A: {
          start: new Date(Date.UTC(year, month, day, 0, 30)), // 06:00 IST
          end: new Date(Date.UTC(year, month, day, 8, 30)), // 14:00 IST
        },
        B: {
          start: new Date(Date.UTC(year, month, day, 8, 30)), // 14:00 IST
          end: new Date(Date.UTC(year, month, day, 16, 30)), // 22:00 IST
        },
        C: {
          start: new Date(Date.UTC(year, month, day, 16, 30)), // 22:00 IST
          end: new Date(Date.UTC(year, month, day + 1, 0, 30)), // Next day 06:00 IST
        },
      };

      const start = shiftWindows.A.start;
      const end = shiftWindows.C.end;
      const LiveDataEntries = getLiveDataEntriesCollection();

      const agg = await LiveDataEntries.aggregate([
        {
          $match: {
            tagId,
            timestamp: { $gte: start, $lte: end },
          },
        },
        { $sort: { timestamp: 1 } },
        {
          $group: {
            _id: null,
            firstValue: { $first: "$value" },
            lastValue: { $last: "$value" },
          },
        },
      ]).toArray();

      if (!agg.length) return 0;

      const { firstValue, lastValue } = agg[0];
      if (firstValue == null || lastValue == null) return 0;

      let deltaLitres = lastValue - firstValue;
      if (deltaLitres < 0) deltaLitres = 0;

      return deltaLitres * 1000; // Convert to KG
    };

    // Fetch values in parallel
    const [totalFeedKG, totalFinishedKG] = await Promise.all([
      getTotalKgFromTag(TAG_FEED),
      getTotalKgFromTag(TAG_FINISHED),
    ]);
    // console.log("totalFeedKG", totalFeedKG);
    // console.log("totalFinishedKG", totalFinishedKG);

    // Formula
    const productionLossKG = totalFeedKG - totalFinishedKG;

    // Convert to percentage
    const productionLossPercent =
      totalFeedKG > 0 ? (productionLossKG / totalFeedKG) * 100 : 0;

    return Number(productionLossPercent.toFixed(2));
    // const productionLossKG = totalFeedKG - totalFinishedKG;

    // return  Number(productionLossKG.toFixed(3))
  } catch (err) {
    console.error("Production Loss calculation error:", err);
    throw err;
  }
};
const getMaterialUtilizationEfficiency = async (businessUnit) => {
  try {

    const now = new Date();
    const year = now.getUTCFullYear();
    const month = now.getUTCMonth();
    const day = now.getUTCDate();

    const shiftWindows = {
      A: {
        start: new Date(Date.UTC(year, month, day, 0, 30)), // 06:00 IST
        end: new Date(Date.UTC(year, month, day, 8, 30)), // 14:00 IST
      },
      B: {
        start: new Date(Date.UTC(year, month, day, 8, 30)), // 14:00 IST
        end: new Date(Date.UTC(year, month, day, 16, 30)), // 22:00 IST
      },
      C: {
        start: new Date(Date.UTC(year, month, day, 16, 30)), // 22:00 IST
        end: new Date(Date.UTC(year, month, day + 1, 0, 30)), // Next day 06:00 IST
      },
    };

    const start = shiftWindows.A.start;
    const end = shiftWindows.C.end;


    const TAG_CRUDE = "FQ-1101-1";
    const TAG_OUTPUT = "FQ-816B.1-1";
    const TAG_STEAM = "FQ-SAC/R-1";
    const TAG_CAUSTIC = " FQ-P1178NA-1"; // you wanted space included
    const TAG_PHOSPHORIC = "FQ-P1134PA-1";
    const TAG_HOTWATER = "FQ-1104NA-W-1";

    const ENERGY_TO_KG_FACTOR = 0.086;


    const getKgFromTag = async (tagName) => {
      const tagDoc = await mongoDbManager.findOne(LiveData, {
        tagName,
        plcName: "PLC_A",
      });
      // console.log(tagDoc, "tagDoc");

      if (!tagDoc) return 0;

      const tagId = tagDoc._id;
      const LiveDataEntries = getLiveDataEntriesCollection();

      const agg = await LiveDataEntries.aggregate([
        { $match: { tagId, timestamp: { $gte: start, $lte: end } } },
        { $sort: { timestamp: 1 } },
        {
          $group: {
            _id: null,
            firstValue: { $first: "$value" },
            lastValue: { $last: "$value" },
          },
        },
      ]).toArray();

      if (!agg.length) return 0;

      let delta = agg[0].lastValue - agg[0].firstValue;
      if (delta < 0) delta = 0;

      return delta * 1000; // Liters → KG (your rule)
    };


    const [crudeKG, outputKG, steamKG, causticKG, phosphoricKG, hotWaterKG] =
      await Promise.all([
        getKgFromTag(TAG_CRUDE),
        getKgFromTag(TAG_OUTPUT),
        getKgFromTag(TAG_STEAM),
        // getKgFromTag(TAG_CAUSTIC),
        null,
        // getKgFromTag(TAG_PHOSPHORIC),
        null,
        getKgFromTag(TAG_HOTWATER),
      ]);

    const energyLog = await getLogValue(
      "POWER HOUSE 24-25",
      "Refinery ",
      businessUnit,
      "ENERGY",
      start,
      end
    );

    const energyKwh = energyLog ?? 0;
    const energyKG = energyKwh * ENERGY_TO_KG_FACTOR;
    // console.log(energyKwh, energyKG, "material utilization");

    const totalInputKG =
      crudeKG + steamKG  + hotWaterKG;

    if (totalInputKG === 0) {
      return 0;
    }

    const muePercent = (outputKG / totalInputKG) * 100;

    return Number(muePercent.toFixed(2));
  } catch (err) {
    console.error("Material Utilization calculation error:", err);
    throw err;
  }
};


const getTableCards = async (businessUnit, page = 1, limit = 10) => {
  try {
    if (businessUnit.toString() == "6641959acbe6ea3941e60789") {
      const { start, end } = getShiftWindow24Hr();

      const additiveResult = await getAdditiveConsumption(
        businessUnit,
        start,
        end,
        page,
        limit
      );
      const steamResult = await getSteamThermalEnergy(
        businessUnit,
        start,
        end,
        page,
        limit
      );
      const energyResult = await getEnergyConsumption(
        businessUnit,
        start,
        end,
        page,
        limit
      );
      const downtimeResult = await getProcessDowntimeForConfig(businessUnit, start, end, page, limit);

      

      return {
        additiveConsumption: additiveResult,
        energyConsumption: energyResult,
        steamThermalEnergy: steamResult,
        spi: [],
        reworkRatio: [],
        cycleTimeVariance: [],
        downtime: downtimeResult,
        waterConsumption: [],
      };
    } else {
      return {};
    }
  } catch (error) {
    console.error("Error in getTableCards:", error);
    throw error;
  }
};

const getAdditiveConsumption = async (
  businessUnit,
  start,
  end,
  page = 1,
  limit = 10
) => {
  const processConfig = [
    {
      processName: "Neutralization",
      additives: [
        { name: "Caustic Soda", type: "live", tag: "FQ-P1178NA-1" },
        { name: "Phosphoric Acid", type: "live", tag: "FQ-P1134PA-1" },
      ],
    },
    // {
    //   processName: "Dewaxing",
    //   additives: [{ name: "Steam", type: "live", tag: "FQ-SAC/R-1" }],
    // },
    // {
    //   processName: "Energy",
    //   additives: [
    //     {
    //       name: "Total Units (Eb+ Genset) ",
    //       type: "log",
    //       logName: "POWER HOUSE 24-25",
    //     },
    //   ],
    // },
    {
      processName: "Bleaching",
      additives: [
        {
          name: "Bleaching earth dosing 630 A-% (0.5 - 2.0)",
          type: "log",
          logName: "BLEACHER SECTION  24 -25",
        },
      ],
    },
    // {
    //   processName: "Deodorization",
    //   additives: [
    //     {
    //       name: "Coal Consumption in TONS",
    //       type: "log",
    //       logName: "BOILER SFTS 24-25",
    //     },
    //   ],
    // },
  ];

  const OUTPUT_TAG = "FT-816B.1-1";

  const outputKG = await getLiveKG(OUTPUT_TAG, start, end);

  const results = [];

  // Use for..of so we can await inside loop
  for (const process of processConfig) {
    let totalAdditiveKG = 0;
    const additiveNames = [];

    for (const item of process.additives) {
      additiveNames.push(item.name);
      if (item.type === "live") {
        totalAdditiveKG += await getLiveKG(item.tag, start, end);
      } else if (item.type === "log") {
        // Fetch from logs
        totalAdditiveKG += await getLogValue(
          item.logName,
          item.name,
          businessUnit,
          start,
          end
        );
      }
    }

    const perUnit = outputKG > 0 ? totalAdditiveKG / outputKG : 0;

    results.push({
      processName: process.processName,
      additivesAdded: additiveNames.join(", "),
      perUnit: Number(perUnit.toFixed(4)),
      totalAdditiveKG,
      outputKG,
    });
  }

  const totalDataCount = results.length;
  const totalPageCount = Math.ceil(totalDataCount / limit) || 1;

  const safePage = Math.min(Math.max(page, 1), totalPageCount);
  const startIndex = (safePage - 1) * limit;

  const paginatedData = results.slice(startIndex, startIndex + limit);

  return {
    currentPage: safePage,
    totalPageCount,
    totalDataCount,
    data: paginatedData,
  };
};
const getSteamThermalEnergy = async (
  businessUnit,
  start,
  end,
  page = 1,
  limit = 10
) => {
  // Dynamic config – add more steam items anytime here
  const steamConfig = [
    {
      processName: "Steam Generation",
      items: [
        { name: "Steam Totalizer", type: "live", tag: "FQ-SAC/R-1" }
      ]
    }
  ];

  const results = [];

  for (const steam of steamConfig) {
    let totalSteamKG = 0;
    const itemNames = [];

    for (const item of steam.items) {
      itemNames.push(item.name);

      if (item.type === "live") {
        totalSteamKG += await getLiveKG(item.tag, start, end);
      } else if (item.type === "log") {
        totalSteamKG += await getLogValue(
          item.logName,
          item.name,
          businessUnit,
          start,
          end
        );
      }
    }

    results.push({
      processName: steam.processName,
      itemsUsed: itemNames.join(", "),
      totalSteamKG: Number(totalSteamKG.toFixed(4)),
    });
  }

  const totalDataCount = results.length;
  const totalPageCount = Math.ceil(totalDataCount / limit) || 1;

  const safePage = Math.min(Math.max(page, 1), totalPageCount);
  const startIndex = (safePage - 1) * limit;

  const paginatedData = results.slice(startIndex, startIndex + limit);

  return {
    currentPage: safePage,
    totalPageCount,
    totalDataCount,
    data: paginatedData,
  };
};
const getEnergyConsumption = async (businessUnit, start, end, page = 1, limit = 5) => {
  try {
    const logName = "POWER HOUSE 24-25";

    // Fetch the log document
    const log = await LogModel.findOne({
      name: logName,
      businessUnit,
    });

    if (!log) {
      return {
        currentPage: 1,
        totalPageCount: 1,
        totalDataCount: 0,
        data: []
      };
    }

    // Fetch latest log entry
    const logEntry = await LogEntryModel.findOne({
      logId: log._id,
      status: { $in: ["pendingForApproval", "approved", "completed"] }
    }).sort({ entryCreatedAt: -1 });

    if (!logEntry || !Array.isArray(logEntry.data)) {
      return {
        currentPage: 1,
        totalPageCount: 1,
        totalDataCount: 0,
        data: []
      };
    }

    // Extract rows from field index 4 → 27
    const energyRows = logEntry.data.slice(4, 28).map((row) => ({
      parameterName: row.fieldName,
      value: row.fieldValue,
      unit: row.unit || null,
    }));

    const totalDataCount = energyRows.length;
    const totalPageCount = Math.ceil(totalDataCount / limit) || 1;

    const safePage = Math.min(Math.max(page, 1), totalPageCount);
    const startIndex = (safePage - 1) * limit;

    const paginated = energyRows.slice(startIndex, startIndex + limit);

    return {
      currentPage: safePage,
      totalPageCount,
      totalDataCount,
      data: paginated,
    };
  } catch (error) {
    console.error("Error in getEnergyConsumption:", error);
    throw error;
  }
};
const getProcessDowntimeForConfig = async (
  businessUnit,
  start,
  end,
  page = 1,
  limit = 10
) => {
  // Configurable logs – add any logName + processName here
  const downtimeConfig = [
    { processName: "Neutralisation", logName: "NEUTRALISATION" },
    { processName: "Bleaching", logName: "BLEACHER SECTION LOG" },
    { processName: "Dewaxing", logName: "DEWAX SECTION 24 - 25" },
    { processName: "Deodorization", logName: "DEODORISATION SECTION 24 - 25" },
  ];

  const results = [];

  for (const config of downtimeConfig) {
    const log = await LogModel.findOne({
      name: config.logName,
      businessUnit,
    });
    // console.log("log:", log);

    let downtimeMinutes = 0;

    if (log && Array.isArray(log.pausedAndResumedPeriods)) {
      // console.log("log.pausedAndResumedPeriods:", log.pausedAndResumedPeriods);
      downtimeMinutes = calculateDowntimeForLog(log.pausedAndResumedPeriods, start, end);
    }

    results.push({
      processName: config.processName,
      logName: config.logName,
      downtime: downtimeMinutes??0,
    });
  }

  // Pagination
  const totalDataCount = results.length;
  const totalPageCount = Math.ceil(totalDataCount / limit) || 1;
  const safePage = Math.min(Math.max(page, 1), totalPageCount);
  const startIndex = (safePage - 1) * limit;
  const paginatedData = results.slice(startIndex, startIndex + limit);

  return {
    currentPage: safePage,
    totalPageCount,
    totalDataCount,
    data: paginatedData,
  };
};
const getProcessDowntimeCounts = async (businessUnit, start, end) => {
  const downtimeConfig = [
    { processName: "Neutralisation", logName: "NEUTRALISATION" },
    { processName: "Bleaching", logName: "BLEACHER SECTION LOG" },
    { processName: "Dewaxing", logName: "DEWAX SECTION 24 - 25" },
    { processName: "Deodorization", logName: "DEODORISATION SECTION 24 - 25" },
  ];

  let totalProcesses = downtimeConfig.length;
  let processesUnderDowntime = 0;

  for (const config of downtimeConfig) {
    const log = await LogModel.findOne({
      name: config.logName,
      businessUnit,
    }).lean();

    if (log?.pausedAndResumedPeriods?.length) {
      const downtimeMinutes = calculateDowntimeForLog(
        log.pausedAndResumedPeriods,
        start,
        end
      );

      if (downtimeMinutes > 0) {
        processesUnderDowntime++;
      }
    }
  }

  return {
    totalProcesses,
    processesUnderDowntime,
  };
};

const calculateDowntimeForLog = (pausedAndResumedPeriods) => {
  if (!pausedAndResumedPeriods || !pausedAndResumedPeriods.length) return 0;

  let totalDowntimeMs = 0;

  pausedAndResumedPeriods.forEach(period => {
    const pausedTime = new Date(period.pausedDate);
    const resumedTime = period.resumedDate ? new Date(period.resumedDate) : new Date();

    // Total downtime for this period
    totalDowntimeMs += resumedTime - pausedTime;
  });
    const totalHours = totalDowntimeMs / 1000 / 60 / 60; // convert ms → hours


  return Number(totalHours.toFixed(2)); // downtime in minutes
};



const getLiveKG = async (tag, start, end) => {
  const tagDoc = await LiveData.findOne({ tagName: tag, plcName: "PLC_A" });
  if (!tagDoc) return 0;

  const tagId = tagDoc._id;
  const LiveDataEntries = getLiveDataEntriesCollection();

  const agg = await LiveDataEntries.aggregate([
    { $match: { tagId, timestamp: { $gte: start, $lte: end } } },
    { $sort: { timestamp: 1 } },
    {
      $group: {
        _id: null,
        firstValue: { $first: "$value" },
        lastValue: { $last: "$value" },
      },
    },
  ]).toArray();

  if (!agg.length) return 0;

  const delta = Math.max(agg[0].lastValue - agg[0].firstValue, 0);
  return delta; // value in KG
};

// Returns 24hr shift window (UTC)
const getShiftWindow24Hr = () => {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth();
  const day = now.getUTCDate();

  return {
    start: new Date(Date.UTC(year, month, day, 0, 30)), // 06:00 IST
    end: new Date(Date.UTC(year, month, day + 1, 0, 30)), // Next day 06:00 IST
  };
};


const getLogValue = async (
  logName,
  parameterName,
  businessUnit,
  start,
  end
) => {
    
  const log = await LogModel.findOne({
    name: logName,
    businessUnit,
    // startDateAndTime: { $lte: end },
    // endDateAndTime: { $gte: start }
  });
  if (!log) return 0;

  const logEntry = await LogEntryModel.findOne({
    logId: log._id,
    // entryCreatedAt: { $gte: start, $lte: end },
    status: { $in: ["pendingForApproval", "approved", "completed"] }, // optional, include other statuses if needed
  }).sort({ entryCreatedAt: -1 });

  if (!logEntry) return 0;

  // Find the field value in the entry
  const field = logEntry.data.find((d) => d.fieldName === parameterName);
  // console.log(field, "field");
  return field?.fieldValue ?? 0;
};

module.exports = {
  getAllProcesssMetrics,
  getTableCards,
};
