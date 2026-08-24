/**
 * Cron job worker process.
 * Spawned by cron.js via child_process.fork().
 * Receives a job name via process message, runs it, then exits.
 */

// Flag for logger.js: initializes Errsole with enableDashboard: false
// so it writes to the same SQLite log file without binding port 8001.
process.env.CRON_WORKER = "true";

const mongoose = require("mongoose");
const { mongoDbConfig } = require("../configs");

async function run() {
  const jobName = process.argv[2];
  if (!jobName) {
    console.error("cronWorker: no job name provided");
    process.exit(1);
  }

  try {
    await mongoose.connect(mongoDbConfig.MONGO_DB_URL, {
      maxPoolSize: 5,
      minPoolSize: 1,
      socketTimeoutMS: 45000,
      serverSelectionTimeoutMS: 10000,
    });

    // Pre-register models that are referenced via populate() but not
    // directly imported by the worker's require chain.
    require("../models/mongoDB/maintenanceManagement/tasks_model");

    switch (jobName) {
      case "schduledReportForLog": {
        const { schduledReportForLog } = require("../managers/internalManagers/logManagement/scheduledReport");
        await schduledReportForLog();
        break;
      }
      case "createScheduledWorkOrder": {
        const { createScheduledWorkOrder } = require("../managers/internalManagers/maintenanceManagement/recurrence");
        await createScheduledWorkOrder();
        break;
      }
      case "generateReportForShift": {
        const { generateReportForShift } = require("../managers/internalManagers/logManagement/scheduledReport");
        await generateReportForShift();
        break;
      }
      case "generatePackingPerformanceReport": {
        const { generatePackingPerformanceReport } = require("../managers/internalManagers/reportManagement/template");
        await generatePackingPerformanceReport();
        break;
      }
      case "runSyntheticAggregation":{
        const { runSyntheticAggregation } = require("../managers/internalManagers/plcManager/workOrderAggregation");
        await runSyntheticAggregation();
        break;
      }
      default:
        console.error(`cronWorker: unknown job "${jobName}"`);
        process.exit(1);
    }

    console.log(`cronWorker: ${jobName} completed`);
  } catch (err) {
    console.error(`cronWorker: ${jobName} failed:`, err.message);
  } finally {
    await mongoose.disconnect().catch(() => {});
    process.exit(0);
  }
}

run();
