const { default: mongoose } = require("mongoose");
const {Assets} = require("../../../models/mongoDB/assetManagement/asset_model")
const {workOrders} = require("../../../models/mongoDB/maintenanceManagement/workOrder_model")
const paginationHandler = require("../../common/paginationHandler_manager");


// async function getAllAssetsMetrics() {
//   try {
//     // 🧠 Fetch assets and pre-filtered categories in parallel
//     const [assets, breakdownAssets, activeAssets] = await Promise.all([
//       Assets.find({ isDeleted: false }),
//       Assets.find({ isDeleted: false, status: "Breakdown" }),
//       Assets.find({ isDeleted: false, status: "Active" }),
//     ]);

//     let totals = {
//       operationalHours: 0,
//       workOrderHours: 0,
//       availabilityHours: 0,
//       utilizationHours: 0,
//       mtbfHours: 0,
//       mttrHours: 0,
//       upTime: 0,
//       downtimeHours: 0,
//       unplannedBreakdownHours: 0,
//     };

//     let counts = { mtbf: 0, mttr: 0 };

//     const now = new Date();

//     // ⚙️ Process each asset
//     for (const asset of assets) {
//       const installationDate = asset?.specifications?.manufacturingDetails?.installationDate;
//       if (!installationDate) continue;

//       const breakdownHours = asset.breakdownHours || 0;
//       const utilizationHours = asset.standbyHours || 0;
//       const availabilityHours = asset.availabilityHours || 0;
//       console.log("availabilityHours", availabilityHours)
//       // ⏱️ Total operational hours since installation
//       const operationalHours = (now - new Date(installationDate)) / 36e5; // 36e5 = 1000 * 60 * 60
//       totals.operationalHours += operationalHours;

//       // 📄 Fetch related work orders once per asset
//       const workOrderArray = await workOrders
//         .find({ asset: asset._id, isDeleted: false })
//         .select("estimatedDays estimatedHours isMaintenanceScheduled startAt endAt acceptTime completeTime");

//       // 🔢 Calculate total estimated work order hours
//       const workOrderHours = workOrderArray.reduce(
//         (sum, wo) => sum + (wo.estimatedDays || 0) * 24 + (wo.estimatedHours || 0),
//         0
//       );
//       totals.workOrderHours += workOrderHours;

//       // 📊 Aggregate totals
//       totals.availabilityHours += breakdownHours + workOrderHours;
//       totals.utilizationHours += utilizationHours + workOrderHours;
//       totals.unplannedBreakdownHours += breakdownHours;

//       // ⚙️ MTBF (Mean Time Between Failures)
//       const breakdownWOs = workOrderArray
//         .filter((wo) => !wo.isMaintenanceScheduled && wo.startAt && wo.endAt)
//         .sort((a, b) => new Date(a.startAt) - new Date(b.startAt));
//       console.log("breakdownWOs", breakdownWOs)
//       if (breakdownWOs.length > 1) {
//         const totalDiffHours = breakdownWOs
//           .slice(1)
//           .reduce((sum, wo, i) => {
//             const prevEnd = new Date(breakdownWOs[i].endAt);
//             const currStart = new Date(wo.startAt);
//             const diff = (currStart - prevEnd) / 36e5;
//             return diff > 0 ? sum + diff : sum;
//           }, 0);

//         totals.mtbfHours += totalDiffHours;
//         counts.mtbf++;
//     }
//     totals.upTime += availabilityHours;

//       // ⚒️ MTTR (Mean Time To Repair)
//       const mttrWOs = workOrderArray.filter(
//         (wo) => !wo.isMaintenanceScheduled && wo.acceptTime && wo.completeTime
//       );

//       if (mttrWOs.length > 0) {
//         const totalRepairHours = mttrWOs.reduce((sum, wo) => {
//           const diff = (new Date(wo.completeTime) - new Date(wo.acceptTime)) / 36e5;
//           return diff > 0 ? sum + diff : sum;
//         }, 0);

//         totals.mttrHours += totalRepairHours;
//         counts.mttr++;
//     }
//     console.log("breakdownHours", breakdownHours)
//     totals.downtimeHours += breakdownHours;
//     }

//     // 📈 Derived Metrics
//     const overallAvailability =
//       totals.operationalHours > 0
//         ? ((totals.operationalHours - totals.availabilityHours) / totals.operationalHours) * 100
//         : 0;

//     const overallUtilization =
//       totals.operationalHours > 0
//         ? ((totals.operationalHours - totals.utilizationHours) / totals.operationalHours) * 100
//         : 0;
//     console.log("totals.upTime", totals.upTime)
//     console.log("totals.mtbfHours", totals.mtbfHours)
//     console.log("totals.mttrHours", totals.mttrHours)
//     console.log("totals.downtimeHours", totals.downtimeHours)
//     const avgMTBF = totals.upTime > 0 ? totals.mtbfHours / totals.upTime : 0;
//     const avgMTTR = totals.downtimeHours > 0 ? totals.mttrHours / totals.downtimeHours : 0;

//     // 🧾 Final result
//     return {
//       totalAssets: assets.length,
//       breakdownAssets: breakdownAssets.length,
//       activeAssets: activeAssets.length,
//       assetAvailability: Number(overallAvailability.toFixed(2)),
//       assetUtilization: Number(overallUtilization.toFixed(2)),
//       meanTimeBetweenFailures: Number(avgMTBF.toFixed(2)),
//       meanTimeToRepair: Number(avgMTTR.toFixed(2)),
//       downTime: Number(totals.unplannedBreakdownHours.toFixed(2)),
//     };
//   } catch (error) {
//     console.error("Error fetching asset metrics:", error.message);
//     throw error;
//   }
// }

async function getAllAssetsMetrics(businessUnit) {
  try {
    // Fetch all asset data in parallel
    const [assets, breakdownAssets, activeAssets] = await Promise.all([
      Assets.find({
        isDeleted: false,
        "generalDetails.businessUnit": businessUnit,
      }),
      Assets.countDocuments({
        isDeleted: false,
        status: "Breakdown",
        "generalDetails.businessUnit": businessUnit,
      }),
      Assets.countDocuments({
        isDeleted: false,
        status: "Active",
        "generalDetails.businessUnit": businessUnit,
      }),
    ]);

    if (!assets.length) return { message: "No assets found" };

    const assetIds = assets.map((a) => a._id);
    // const assetId = new mongoose.Types.ObjectId("690d6ba086210f258f2eaba5");

    // Fetch all related work orders at once
    const allWorkOrders = await workOrders
      .find({
        // asset: assetId,
        asset: { $in: assetIds },
        isDeleted: false,
      })
      .select(
        "asset estimatedDays estimatedHours isMaintenanceScheduled startAt endAt acceptTime completeTime"
      );

    // Totals
    let totals = {
      operationalHours: 0,
      workOrderHours: 0,
      availabilityHours: 0,
      utilizationHours: 0,
      mtbfHours: 0,
      mttrHours: 0,
      upTime: 0,
      downtimeHours: 0,
      unplannedBreakdownHours: 0,
      plannedHours: 0,
      totalWoCount: 0,
      standbyHours: 0,
    };
    totals.totalWoCount = allWorkOrders.length;

    let counts = { mtbfIntervals: 0, mttr: 0 };
    const now = new Date();

    // Process all assets
    for (const asset of assets) {
      const installationDate =
        asset?.specifications?.manufacturingDetails?.installationDate;
      if (!installationDate) continue;

      const breakdownHours = asset.breakdownHours || 0;
      // --- Standby Hours Calculation from statusHistory ---
      let standbyHours = 0;
      if (asset.statusHistory && asset.statusHistory.length > 0) {
        for (const s of asset.statusHistory) {
          if (s.status === "Standby") {
            const start = new Date(s.startTime);
            const end = s.endTime ? new Date(s.endTime) : new Date();
            const diffHours = (end - start) / (1000 * 60 * 60);
            standbyHours += diffHours;
          }
        }
      }
      totals.standbyHours += standbyHours;
      // console.log(standbyHours);
      // Total operational hours
      const operationalHours = (now - new Date(installationDate)) / 36e5;
      totals.operationalHours += operationalHours;

      // Filter related work orders
      const workOrderArray = allWorkOrders.filter(
        (wo) => wo.asset.toString() === asset._id.toString()
      );

      // Total estimated work order hours
      const workOrderHours = workOrderArray.reduce(
        (sum, wo) =>
          sum + (wo.estimatedDays || 0) * 24 + (wo.estimatedHours || 0),
        0
      );
      totals.workOrderHours += workOrderHours;

      // Sum planned and unplanned hours
      workOrderArray.forEach((wo) => {
        if (wo.startAt && wo.endAt) {
          const diff = (new Date(wo.endAt) - new Date(wo.startAt)) / 36e5; // hours
          if (wo.isMaintenanceScheduled) totals.plannedHours += diff;
          else totals.unplannedBreakdownHours += diff;
        }
      });

      // totals.utilizationHours += standbyHours;

      // MTBF
      const breakdownWOs = workOrderArray
        .filter(
          (wo) =>
            !wo.isMaintenanceScheduled &&
            wo.startAt &&
            wo.endAt &&
            new Date(wo.endAt) >= new Date(wo.startAt)
        )
        .sort((a, b) => new Date(a.startAt) - new Date(b.startAt));

      if (breakdownWOs.length > 1) {
        let intervalsSumHours = 0;
        let intervalsCount = 0;
        for (let i = 1; i < breakdownWOs.length; i++) {
          const prevEnd = new Date(breakdownWOs[i - 1].endAt);
          const currStart = new Date(breakdownWOs[i].startAt);
          const diffHours = (currStart - prevEnd) / 36e5;
          if (diffHours > 0) {
            intervalsSumHours += diffHours;
            intervalsCount++;
          }
        }
        totals.mtbfHours += intervalsSumHours;
        counts.mtbfIntervals += intervalsCount;
      }

      // MTTR
      const mttrWOs = workOrderArray.filter(
        (wo) => !wo.isMaintenanceScheduled && wo.startAt && wo.endAt
      );
      if (mttrWOs.length > 0) {
        mttrWOs.forEach((wo) => {
          const start = new Date(wo.startAt);
          const end = new Date(wo.endAt);
          const diffHours = (end - start) / 36e5;
          if (diffHours > 0) {
            totals.mttrHours += diffHours;
            counts.mttr++;
          }
        });
      }
    }

    // Downtime = planned + unplanned hours
    totals.downtimeHours = totals.unplannedBreakdownHours + totals.plannedHours;
    //  /totals.totalWoCount;

    // Derived Metrics
    const overallAvailability =
      totals.operationalHours > 0
        ? ((totals.operationalHours - totals.downtimeHours) /
            totals.operationalHours) *
          100
        : 0;
    // console.log(
    //   "overallAvailability",
    //   overallAvailability,
    //   totals.operationalHours,
    //   totals.downtimeHours
    // );
    // Availability in hours
    const availableHours = totals.operationalHours - totals.downtimeHours;

    // Asset Utilization = (Availability - Standby) / Availability
    const overallUtilization =
      availableHours > 0
        ? ((availableHours - totals.standbyHours) / availableHours) * 100
        : 0;
         
    const avgMTBF =
      counts.mtbfIntervals > 0 ? totals.mtbfHours / counts.mtbfIntervals : 0;
    const avgMTTR = counts.mttr > 0 ? totals.mttrHours / counts.mttr : 0;

    const Downtime = totals.downtimeHours / totals.totalWoCount;

    // Return summary
    return {
      totalAssets: assets.length,
      breakdownAssets: breakdownAssets,
      activeAssets: activeAssets,
      assetAvailability: Number(overallAvailability.toFixed(2)),
      assetUtilization: Number(overallUtilization.toFixed(2)),
      meanTimeBetweenFailures: Number(avgMTBF.toFixed(2)),
      meanTimeToRepair: Number(avgMTTR.toFixed(2)),
      downTime: Number(Downtime.toFixed(2)),
    };
  } catch (error) {
    console.error("Error fetching asset metrics:", error.message);
    throw error;
  }
}

async function getAssetsActiveHoursLast12Months (page, limit) {
  try {
    const totalAssets = await Assets.countDocuments({ isDeleted: false });

    const assets = await Assets.find({ isDeleted: false }).select(
      "generalDetails.name statusHistory"
    )
    .skip((page - 1) * limit)
    .limit(limit);;

    const now = new Date();
    const months = [];

    // 🗓️ Create an array for the last 12 months (latest → oldest)
    for (let i = 0; i < 12; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        year: d.getFullYear(),
        month: d.getMonth(), // 0-based month index
        label: d.toLocaleString("default", { month: "short", year: "numeric" }),
      });
    }

    const responseData = [];

    assets.forEach((asset) => {
      const monthlyHours = months.map(() => 0); // initialize all 12 months with 0

      (asset.statusHistory || []).forEach((period) => {
        if (period.status !== "Active" || !period.startTime) return;

        const start = new Date(period.startTime);
        const end = new Date(period.endTime || new Date());

        months.forEach((m, idx) => {
          const monthStart = new Date(m.year, m.month, 1);
          const monthEnd = new Date(m.year, m.month + 1, 0, 23, 59, 59, 999);
           
          // Skip if no overlap in this month
          if (start > monthEnd || end < monthStart) return;

          // Calculate overlapping duration
          const activeStart = start < monthStart ? monthStart : start;
          const activeEnd = end > monthEnd ? monthEnd : end;
          const diffHours = (activeEnd - activeStart) / (1000 * 60 * 60);

          if (diffHours > 0) monthlyHours[idx] += diffHours;
        });
      });

      responseData.push({
        assetId: asset._id,
        assetName: asset.generalDetails?.name || "Unnamed Asset",
        monthlyActiveHours: monthlyHours.map((h) => Number(h.toFixed(2))),
      });
    });
    const totalPages = totalAssets === 0 ? 0 : limit === 0 ? 1 : Math.ceil(totalAssets / limit);
    
    const data = paginationHandler.paginationResObj(page, totalPages, totalAssets, responseData);

    // Final structure
    const result = {
      months: months.map((m) => m.label), // ["Oct 2025", "Sep 2025", ..., "Nov 2024"]
      assets: data,
    };

    return result;
  } catch (error) {
    console.error("Error calculating asset active hours:", error);
    throw error
  }
};


async function getWorkOrdersOnTimeCompletionLast12Months(page, limit) {
  try {
    const now = new Date();
    const months = [];

    // 🗓️ Generate last 12 months (latest → oldest)
    for (let i = 0; i < 12; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        year: d.getFullYear(),
        month: d.getMonth(),
        label: d.toLocaleString("default", { month: "short", year: "numeric" }),
      });
    }

    //  Count total assets for pagination
    const totalAssets = await Assets.countDocuments({ isDeleted: false });
    // const totalPages = Math.ceil(totalAssets / limit);
    
    //  Fetch paginated assets
    const assets = await Assets.find({ isDeleted: false })
    .select("generalDetails.name")
    .skip((page - 1) * limit)
    .limit(limit);
    
    const responseData = [];

    for (let asset of assets) {
      const workOrderArray = await workOrders.find({
        asset: asset._id,
        isDeleted: false,
      }).select("estimatedDays estimatedHours startAt endAt acceptTime completeTime");

      // Initialize arrays for 12 months
      const monthlyPlannedHours = months.map(() => 0);
      const monthlyExecutedHours = months.map(() => 0);

      for (let wo of workOrderArray) {
        const plannedHours = (wo.estimatedDays || 0) * 24 + (wo.estimatedHours || 0);

        // 🟩 Planned hours (based on startAt month)
        if (wo.startAt) {
          const startDate = new Date(wo.startAt);
          const monthIndex = months.findIndex(
            (m) => m.year === startDate.getFullYear() && m.month === startDate.getMonth()
          );
          if (monthIndex !== -1) monthlyPlannedHours[monthIndex] += plannedHours;
        }

        // 🟦 Executed hours (based on completeTime month)
        if (wo.acceptTime && wo.completeTime) {
          const accept = new Date(wo.acceptTime);
          const complete = new Date(wo.completeTime);
          const diffHours = (complete - accept) / (1000 * 60 * 60);

          const monthIndex = months.findIndex(
            (m) => m.year === complete.getFullYear() && m.month === complete.getMonth()
          );
          if (monthIndex !== -1 && diffHours > 0) {
            monthlyExecutedHours[monthIndex] += diffHours;
          }
        }
      }

      responseData.push({
        assetId: asset._id,
        assetName: asset.generalDetails?.name || "Unnamed Asset",
        monthlyPlannedHours: monthlyPlannedHours.map((h) => Number(h.toFixed(2))),
        monthlyExecutedHours: monthlyExecutedHours.map((h) => Number(h.toFixed(2))),
      });
    }
    const totalPages = totalAssets === 0 ? 0 : limit === 0 ? 1 : Math.ceil(totalAssets / limit);
    
    const data = paginationHandler.paginationResObj(page, totalPages, totalAssets, responseData);
    // 🧾 Final paginated response
    return {
      months: months.map((m) => m.label),
      assets: data,
    };
  } catch (error) {
    console.error("Error calculating monthly work order hours:", error);
    throw error;
  }
}


module.exports = {
    getAllAssetsMetrics,
    getAssetsActiveHoursLast12Months,
    getWorkOrdersOnTimeCompletionLast12Months,

}

