const schedule = require("node-schedule");
const { fork } = require("child_process");
const path = require("path");
const {
  createLogentries,
} = require("../managers/internalManagers/logManagement/recurrence");

const { runSyntheticAggregation } = require("../managers/internalManagers/plcManager/workOrderAggregation");
const { ensureDailyTruckCount } = require("../managers/internalManagers/truckManagement/truckCountCorn");
const {
  scheduleCronForTags,
} = require("../managers/internalManagers/tagManagement/tagCronManager");

const workerPath = path.join(__dirname, "cronWorker.js");

// Track running workers to prevent overlapping runs of the same job
const runningJobs = new Map();
let logEntriesRunning = false;

function runJobInProcess(jobName) {
  if (runningJobs.has(jobName)) {
    console.log(`Cron: skipping ${jobName} - previous run still active`);
    return;
  }

  console.log(`Cron: spawning worker for ${jobName}`);
  const child = fork(workerPath, [jobName], {
    stdio: ["ignore", "pipe", "pipe", "ipc"],
  });

  runningJobs.set(jobName, child);

  child.stdout.on("data", (data) => {
    process.stdout.write(`[${jobName}] ${data}`);
  });

  child.stderr.on("data", (data) => {
    process.stderr.write(`[${jobName}] ${data}`);
  });

  child.on("exit", (code) => {
    runningJobs.delete(jobName);
    if (code !== 0) {
      console.error(`Cron: ${jobName} worker exited with code ${code}`);
    }
  });

  child.on("error", (err) => {
    runningJobs.delete(jobName);
    console.error(`Cron: ${jobName} worker error:`, err.message);
  });
}

const jobHourly = schedule.scheduleJob("*/5 * * * *", async function () {
  console.log("Cron: dispatching jobs");

  // createLogentries runs on main thread because it uses Socket.IO for notifications
  if (!logEntriesRunning) {
    logEntriesRunning = true;
    try {
      await createLogentries();
    } catch (err) {
      console.error("Cron: createLogentries failed:", err.message);
    } finally {
      logEntriesRunning = false;
    }
  } else {
    console.log("Cron: skipping createLogentries - previous run still active");
  }

  // These 3 don't need Socket.IO, so they run in separate child processes
  runJobInProcess("schduledReportForLog");
  runJobInProcess("createScheduledWorkOrder");
  runJobInProcess("generateReportForShift");
  runJobInProcess("runSyntheticAggregation");
});

// new
// corn for synthetic tags
// const jobSynthetic = schedule.scheduleJob("*/1 * * * *", async function () {
//   await runSyntheticAggregation();
// //  await ensureDailyTruckCount();

// });

// insert truck as default if not present on the day
const jobTruckCount = schedule.scheduleJob(
  { rule: "0 0 6 * * *", tz: "Asia/Kolkata" },
  async function () {
    // console.log("Running 6AM IST Truck Count Job");
    await ensureDailyTruckCount();
  },
);

const jobDailyAt1225 = schedule.scheduleJob("12 25 0 * * *", function () {
  runJobInProcess("generatePackingPerformanceReport");
});

let isCronRunning = false;

const jobHourlyAnalytics = schedule.scheduleJob("0 * * * *", async function () {
  if (isCronRunning) {
    // console.log("Hourly cron already running");
    return;
  }

  isCronRunning = true;

  try {
    // console.log("Hourly Analytics Cron Triggered");
    await scheduleCronForTags();
  } catch (err) {
    console.error(err);
  } finally {
    isCronRunning = false;
  }
});

module.exports = { jobHourly, jobDailyAt1225,jobHourlyAnalytics,jobTruckCount };












// const schedule = require("node-schedule");
// const {
//   schduledCheklist,
// } = require("../managers/internalManagers/checklistManagement/recurrence");
// const {
//   schduledReport,
// } = require("../managers/internalManagers/checklistManagement/scheduledReport");
// const {
//   createLogentries,
// } = require("../managers/internalManagers/logManagement/recurrence");
// const {
//   schduledReportForLog,
//   generateReportForShift,
// } = require("../managers/internalManagers/logManagement/scheduledReport");
// const {
//   createScheduledWorkOrder,
// } = require("../managers/internalManagers/maintenanceManagement/recurrence");
// const {
//   generatePackingPerformanceReport,
// } = require("../managers/internalManagers/reportManagement/template");

// const {
//   scheduleCronForTags,
// } = require("../managers/internalManagers/tagManagement/tagCronManager");

// // new
// const { runSyntheticAggregation } = require("../managers/internalManagers/plcManager/workOrderAggregation");
// const { ensureDailyTruckCount } = require("../managers/internalManagers/truckManagement/truckCountCorn");


// // Schedule a job to run every hour at the 0th minute
// const jobHourly = schedule.scheduleJob("*/5 * * * *", function () {
//   console.log("This job runs every hour at the 5th minute.");
//   // schduledCheklist(); // To generate entries
//   createLogentries();
//   // schduledReport(); //to genrate report
//   schduledReportForLog();
//   createScheduledWorkOrder();
//   generateReportForShift();
//   runSyntheticAggregation(); // newly added for synthetic tags
// });

// // new
// // corn for synthetic tags
// const jobSynthetic = schedule.scheduleJob("*/1 * * * *", async function () {
//   await runSyntheticAggregation();
// //  await ensureDailyTruckCount();

// });

// // shift/day
// // const jobSynthetic = schedule.scheduleJob(
// //   { rule: "0 0 6 * * *", tz: "Asia/Kolkata" },
// //   async function () {
// //     console.log("Running Synthetic Aggregation");
// //     await runSyntheticAggregation();
// //   },
// // );

// // insert truck as default if not present on the day
// const jobTruckCount = schedule.scheduleJob(
//   { rule: "0 0 6 * * *", tz: "Asia/Kolkata" },
//   async function () {
//     // console.log("Running 6AM IST Truck Count Job");
//     await ensureDailyTruckCount();
//   },
// );

// const jobDailyAt1225 = schedule.scheduleJob("12 25 0 * * *", function () {
//   console.log("Running daily job at 00:25:12");
//   generatePackingPerformanceReport();
// });

// // const jobEveryOneMinute = schedule.scheduleJob("*/1 * * * *", function () {
// //   console.log("This job runs every  minutes.");
// //   schduledCheklist();
// // });

// // module.exports = { jobHourly, jobDailyAt1225  };

// // const jobHourlyAnalytics = schedule.scheduleJob("0 * * * *", async function () {

// //   console.log("Hourly Analytics Cron Triggered");
// //   await scheduleCronForTags()
// // })

// let isCronRunning = false;

// const jobHourlyAnalytics = schedule.scheduleJob("0 * * * *", async function () {
//   if (isCronRunning) {
//     // console.log("Hourly cron already running");
//     return;
//   }

//   isCronRunning = true;

//   try {
//     // console.log("Hourly Analytics Cron Triggered");
//     await scheduleCronForTags();
//   } catch (err) {
//     console.error(err);
//   } finally {
//     isCronRunning = false;
//   }
// });

// module.exports = {
//   jobHourlyAnalytics,
//   jobHourly,
//   jobDailyAt1225,
//   jobSynthetic,
//   jobTruckCount,
// };
