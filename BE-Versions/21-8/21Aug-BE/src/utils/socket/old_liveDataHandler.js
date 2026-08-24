const mongoose = require("mongoose");
const { TagHistory, TagLive } = require("../../models/mongoDB/tags/tagsModel");
const { startLiveDataDbEmitter } = require("./liveDataDbEmitter");
const subscriptions = {};
const SetpointDeviationEvent = require("../../models/mongoDB/logManagement/setpointDeviationEvent_model");
const {
  MaintenancePlan,
} = require("../../models/mongoDB/maintenanceManagement/maintenancePlan_model");// CR0028 Maintenance plan count increase

const specialLiveTags = new Set([
  "69a04dab9a054f2a74eb0622",
  // "69a04e1a1e5e302c5e7da956",// CR0028 Maintenance plan count increase
  "69a04e37223184550e7a71d0",
]);

const truckCounter = new Set(["69a2d5c599a6d75965a04e4c"]);
const setpointDeviationCounter = new Set(["69a93d6055b35dab3577b3b4"]);
const maintenanceExpiredCounter = new Set(["69a04e1a1e5e302c5e7da956"]);// CR0028 Maintenance plan count increase
let lastTruckValue = null;

// ─── Setpoint Deviation Watcher State ────────────────────────────────────────
const setpointDeviationTagName = "setpointDeviations";
let lastSetpointDeviationCount = null;
let setpointDeviationTagId = null; // will be resolved once on first run
//

function liveDataHandler(liveNamespace) {
  console.log("/live-data namespace mounted");

  liveNamespace.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    subscriptions[socket.id] = {
      tags: {},
      dataArrays: {},
      pointers: {},
    };

    socket.on("configure_batching", () => {
      console.log("Batch config ignored");
    });

    socket.on("join_room", async (payload) => {
      try {
        let data = payload;
        if (typeof payload === "string") {
          try {
            data = JSON.parse(payload);
          } catch (e) {
            console.error("Error parsing join_room payload:", e);
            return;
          }
        }

        const { room, tags } = data;
        if (!room || !Array.isArray(tags)) return;

        console.log(
          `[liveDataHandler] Client ${socket.id} joined room '${room}' with ${tags.length} tags.`,
        );
        socket.join(room);

        const sub = subscriptions[socket.id];
        sub.tags = {};
        sub.dataArrays = {};

        const mappedTags = [];

        for (const tag of tags) {
          const tagIdString = tag.id.toString();
          const tagObjectId = new mongoose.Types.ObjectId(tagIdString);

          // ✅ Special live tags
          // if (specialLiveTags.has(tagIdString)) {
          //   const liveDoc = await TagLive.findById(tagObjectId);
          //   if (!liveDoc) continue;

          //   socket.emit(tagIdString, {
          //     id: liveDoc._id.toString(),
          //     val: liveDoc.latestValue,
          //     timestamp: new Date(),
          //     health: liveDoc.health ?? true,
          //   });

          //   continue;
          // }

          // CR0028 Maintenance plan count increase
          if (specialLiveTags.has(tagIdString)) {
            const liveDoc = await TagLive.findById(tagObjectId);
            if (!liveDoc) continue;

            // emit initial value
            socket.emit(tagIdString, {
              id: liveDoc._id.toString(),
              val: liveDoc.latestValue,
              timestamp: new Date(),
              health: liveDoc.health ?? true,
            });

            // register into sub.tags so watcher keeps emitting
            if (!sub.tags[tagIdString]) {
              sub.tags[tagIdString] = [];
            }

            const alreadySubscribedSpecial = sub.tags[tagIdString].some(
              (t) =>
                t.mode === (tag.mode || "direct") &&
                t.key === (tag.key || tagIdString),
            );

            if (!alreadySubscribedSpecial) {
              sub.tags[tagIdString].push({
                mode: tag.mode || "direct",
                key: tag.key || tagIdString,
              });
            }

            continue;
          }
          // CR0028 Maintenance plan count increase

          // Truck counter tag
          if (truckCounter.has(tagIdString)) {
            const truckLive = await updateCounterFromStart(tagObjectId);

            if (truckLive) {
              socket.emit(tagIdString, {
                id: truckLive._id.toString(),
                val: truckLive.latestValue,
                timestamp: new Date(),
                health: truckLive.health ?? true,
              });
            }

            if (!sub.tags[tagIdString]) {
              sub.tags[tagIdString] = [];
            }

            const alreadySubscribedTruck = sub.tags[tagIdString].some(
              (t) =>
                t.mode === (tag.mode || "direct") &&
                t.key === (tag.key || tagIdString),
            );

            if (!alreadySubscribedTruck) {
              sub.tags[tagIdString].push({
                mode: tag.mode || "direct",
                key: tag.key || tagIdString,
              });
            }

            continue;
          }

          //  Setpoint deviation counter tag
          if (setpointDeviationCounter.has(tagIdString)) {
            const setpointLive = await updateSetpointDeviationCount();

            if (setpointLive) {
              socket.emit(tagIdString, {
                id: tagIdString,
                val: setpointLive.latestValue,
                timestamp: new Date(),
                health: setpointLive.health ?? true,
              });
            }

            if (!sub.tags[tagIdString]) {
              sub.tags[tagIdString] = [];
            }

            const alreadySubscribedSetpoint = sub.tags[tagIdString].some(
              (t) =>
                t.mode === (tag.mode || "direct") &&
                t.key === (tag.key || tagIdString),
            );

            if (!alreadySubscribedSetpoint) {
              sub.tags[tagIdString].push({
                mode: tag.mode || "direct",
                key: tag.key || tagIdString,
              });
            }

            continue;
          }

          if (setpointDeviationCounter.has(tagIdString)) {
            if (!sub.tags[tagIdString]) {
              sub.tags[tagIdString] = [];
            }

            const alreadySubscribed = sub.tags[tagIdString].some(
              (t) =>
                t.mode === (tag.mode || "direct") &&
                t.key === (tag.key || tagIdString),
            );

            if (!alreadySubscribed) {
              sub.tags[tagIdString].push({
                mode: tag.mode || "direct",
                key: tag.key || tagIdString,
              });
            }

            continue;
          }
// CR0028 Maintenance plan count increase
          if (maintenanceExpiredCounter.has(tagIdString)) {
  const maintenanceLive = await updateMaintenanceExpiredCount();

  if (maintenanceLive) {
    socket.emit(tagIdString, {
      id: tagIdString,
      val: maintenanceLive.latestValue,
      timestamp: new Date(),
      health: maintenanceLive.health ?? true,
    });
  }

  if (!sub.tags[tagIdString]) {
    sub.tags[tagIdString] = [];
  }

  const alreadySubscribedMaintenance = sub.tags[tagIdString].some(
    (t) =>
      t.mode === (tag.mode || "direct") &&
      t.key === (tag.key || tagIdString),
  );

  if (!alreadySubscribedMaintenance) {
    sub.tags[tagIdString].push({
      mode: tag.mode || "direct",
      key: tag.key || tagIdString,
    });
  }

  continue;
}
// CR0028 Maintenance plan count increase

          // ✅ Regular tags - add to mappedTags for chunk fetch
          if (!sub.tags[tag.id]) {
            sub.tags[tag.id] = [];
          }

          const alreadySubscribed = sub.tags[tag.id].some(
            (t) =>
              t.mode === (tag.mode || "direct") &&
              t.key === (tag.key || tag.id),
          );

          if (!alreadySubscribed) {
            sub.tags[tag.id].push({
              mode: tag.mode || "direct",
              key: tag.key || tag.id,
            });
          }

          mappedTags.push(tagObjectId);
        }

        // ✅ Global Playback Window Logic
        // const searchStartUTC = new Date("2026-02-20T18:30:00.000Z");
        // const searchEndUTC   = new Date("2026-02-21T18:29:59.000Z");
        // const CHUNK_SIZE_SECONDS = 600;

        // sub.searchStartUTC  = searchStartUTC;
        // sub.searchEndUTC    = searchEndUTC;
        // sub.mappedTagIds    = mappedTags;
        // sub.currentChunkStart = new Date(searchStartUTC.getTime());

        // let calcEnd = new Date(sub.currentChunkStart.getTime() + (CHUNK_SIZE_SECONDS * 1000) - 1);
        // if (calcEnd > searchEndUTC) calcEnd = new Date(searchEndUTC.getTime());
        // sub.currentChunkEnd = calcEnd;
        // ✅ Global Playback Window
        const searchStartUTC = new Date("2026-02-20T18:30:00.000Z");
        const searchEndUTC = new Date("2026-02-21T18:29:59.000Z");
        const CHUNK_SIZE_SECONDS = 600;

        // ✅ MAP CURRENT UTC TIME INTO DATA WINDOW - ADD HERE
        const now = new Date();
        const utcMidnightToday = new Date(
          Date.UTC(
            now.getUTCFullYear(),
            now.getUTCMonth(),
            now.getUTCDate(),
            0,
            0,
            0,
            0,
          ),
        );
        const msSinceMidnightUTC = now.getTime() - utcMidnightToday.getTime();
        const dataWindowMidnight = new Date("2026-02-21T00:00:00.000Z");
        const mappedStart = new Date(
          dataWindowMidnight.getTime() + msSinceMidnightUTC,
        );

        const clampedStart =
          mappedStart < searchStartUTC || mappedStart > searchEndUTC
            ? searchStartUTC
            : mappedStart;

        sub.searchStartUTC = searchStartUTC;
        sub.searchEndUTC = searchEndUTC;
        sub.mappedTagIds = mappedTags;
        sub.currentChunkStart = clampedStart; // ✅ starts from current time position

        let calcEnd = new Date(
          clampedStart.getTime() + CHUNK_SIZE_SECONDS * 1000 - 1,
        );
        if (calcEnd > searchEndUTC) calcEnd = new Date(searchEndUTC.getTime());
        sub.currentChunkEnd = calcEnd;

        await fetchAndCacheChunk(socket.id);

        if (!subscriptions[socket.id]) return;

        console.log(
          `[liveDataHandler] Socket ${socket.id} configured for sliding timeframe playback.`,
        );

        // ✅ Start master interval only once per socket
        if (!socket.masterInterval) {
          emitSecondStream(socket);

          socket.masterInterval = setInterval(() => {
            emitSecondStream(socket);
          }, 1000);
        }
      } catch (err) {
        console.error("JOIN_ROOM ERROR:", err);
      }
    });

    socket.on("internal_live_update", (payload) => {
      // 🔥 Respect the .env toggle: only broadcast if forwarding is enabled
      if (process.env.USE_LIVE_SOCKET_FORWARDING !== "true") {
        return; // Let the DB poller handle it instead
      }

      // payload format: { id, val, timestamp, health, assetId }
      console.log(`[liveDataHandler] Internal stream received for ${payload.id} -> ${payload.val}`);

      // Broadcast immediately without waiting for DB polling
      Object.entries(subscriptions).forEach(([subSocketId, sub]) => {
        if (!sub.tags || !sub.tags[payload.id]) return;

        const subSocket = liveNamespace.sockets.get(subSocketId);
        if (subSocket) {
          sub.tags[payload.id].forEach((tagSub) => {
            const emitKey = tagSub.mode === "batch" ? tagSub.key : payload.id;
            subSocket.emit(emitKey, payload);
          });
        }
      });
      console.log(`[liveDataHandler] Broadcast complete for ${payload.id}`);
    });

    socket.on("disconnect", () => {
      if (socket.masterInterval) {
        clearInterval(socket.masterInterval);
      }
      delete subscriptions[socket.id];
      console.log("Client disconnected:", socket.id);
    });
  });

  // 🔥 Initialize the DB polling fallback mechanisms with the proper namespace & sub lists
  startLiveDataDbEmitter(liveNamespace, subscriptions);
}

async function fetchAndCacheChunk(socketId) {
  const sub = subscriptions[socketId];
  if (!sub) return;
  if (sub.isFetching) return;

  sub.isFetching = true;

  try {
    const chunkStart = sub.currentChunkStart;
    const chunkEnd = sub.currentChunkEnd;
    const tagsIds = sub.mappedTagIds;

    const durationMs = chunkEnd.getTime() - chunkStart.getTime() + 1;
    const totalDurationSeconds = Math.floor(durationMs / 1000) || 1;

    console.log(
      `[liveDataHandler] Chunk-fetching DB from ${chunkStart.toISOString()} -> ${chunkEnd.toISOString()} (${totalDurationSeconds}s) for Socket ${socketId}...`,
    );

    const records = await TagHistory.find({
      tag_id: { $in: tagsIds },
      timestamp: { $gte: chunkStart, $lte: chunkEnd },
    })
      .sort({ timestamp: 1 })
      .lean();

    console.log(
      `[liveDataHandler] Found ${records.length} records for real-time playback window.`,
    );

    const freshDataArrays = {};
    const secondMap = {};

    for (const r of records) {
      const tId = r.tag_id.toString();
      if (!secondMap[tId]) secondMap[tId] = {};

      const rTime = new Date(r.timestamp).getTime();
      const sStart = chunkStart.getTime();
      const secOffset = Math.floor((rTime - sStart) / 1000);

      if (secOffset >= 0 && secOffset < totalDurationSeconds) {
        secondMap[tId][secOffset] = r;
      }
    }

    for (const objId of tagsIds) {
      const tId = objId.toString();
      const filledArray = new Array(totalDurationSeconds).fill(null);
      let lastKnown = null;

      for (let i = 0; i < totalDurationSeconds; i++) {
        if (secondMap[tId] && secondMap[tId][i]) {
          lastKnown = secondMap[tId][i];
        }
        filledArray[i] = lastKnown;
      }

      let carryOver = null;
      if (sub.dataArrays[tId] && sub.dataArrays[tId].length > 0) {
        carryOver = sub.dataArrays[tId][sub.dataArrays[tId].length - 1];
      }

      for (let i = 0; i < totalDurationSeconds; i++) {
        if (filledArray[i] !== null) break;
        if (carryOver) filledArray[i] = carryOver;
      }

      freshDataArrays[tId] = filledArray;
    }

    sub.dataArrays = freshDataArrays;
    sub.currentIndex = 0;
    sub.currentChunkDuration = totalDurationSeconds;
  } catch (error) {
    console.error(
      `[liveDataHandler] Error fetching sliding window chunk:`,
      error,
    );
  } finally {
    sub.isFetching = false;
  }
}

async function emitSecondStream(socket) {
  const sub = subscriptions[socket.id];
  if (!sub || !sub.tags || !sub.dataArrays) return;
  if (sub.isFetching) return;

  let currentIndex = sub.currentIndex;
  let totalDur = sub.currentChunkDuration || 600;

  if (currentIndex >= totalDur) {
    const CHUNK_SIZE_SECONDS = 600;
    let nextStartMs = sub.currentChunkEnd.getTime() + 1;

    if (nextStartMs > sub.searchEndUTC.getTime()) {
      console.log(
        `[liveDataHandler] Playback reached end. Looping back to start...`,
      );
      nextStartMs = sub.searchStartUTC.getTime();
    }

    const nextStart = new Date(nextStartMs);
    let nextEnd = new Date(nextStart.getTime() + CHUNK_SIZE_SECONDS * 1000 - 1);

    if (nextEnd > sub.searchEndUTC) {
      nextEnd = new Date(sub.searchEndUTC.getTime());
    }

    sub.currentChunkStart = nextStart;
    sub.currentChunkEnd = nextEnd;

    fetchAndCacheChunk(socket.id);
    return;
  }

  Object.keys(sub.tags).forEach((tagId) => {
    // ✅ Skip tags handled by their own watchers
    if (truckCounter.has(tagId) ||specialLiveTags.has(tagId) ||setpointDeviationCounter.has(tagId)|| maintenanceExpiredCounter.has(tagId)) return;

    const dataArray = sub.dataArrays[tagId];
    if (!dataArray) return;

    const doc = dataArray[currentIndex];
    if (!doc) return;

    const payload = {
      id: doc.tag_id.toString(),
      val: doc.value,
      timestamp: doc.timestamp,
      health: true,
    };

    const tagSubs = sub.tags[tagId];
    tagSubs.forEach((tagSub) => {
      socket.emit(tagSub.mode === "batch" ? tagSub.key : tagId, payload);
    });
  });

  // use this code when you need to reflect the changes in latestvalue and timestamp for each tag
  // for (const tagId of Object.keys(sub.tags)) {
  //   if (truckCounter.has(tagId) || specialLiveTags.has(tagId)) continue;

  //   const dataArray = sub.dataArrays[tagId];
  //   if (!dataArray) continue;

  //   const doc = dataArray[currentIndex];
  //   if (!doc) continue;

  //   const payload = {
  //     id: doc.tag_id.toString(),
  //     val: doc.value,
  //     timestamp: doc.timestamp,
  //     health: true
  //   };

  //   // ✅ now await works perfectly
  //   await TagLive.findByIdAndUpdate(
  //     doc.tag_id,
  //     { $set: { latestValue: doc.value, updatedAt: doc.timestamp } }
  //   );

  //   const tagSubs = sub.tags[tagId];
  //   tagSubs.forEach(tagSub => {
  //     socket.emit(tagSub.mode === "batch" ? tagSub.key : tagId, payload);
  //   });
  // }

  sub.currentIndex = currentIndex + 1;
}

async function updateCounterFromStart(tagObjectId) {
  const sourceTagId = new mongoose.Types.ObjectId("69a00015028f2974fee4abdf");

  const startDate = new Date("2026-02-20T18:30:00.000Z");
  const endDate = new Date("2026-02-21T18:29:59.000Z");

  const history = await TagHistory.find({
    tag_id: sourceTagId,
    timestamp: { $gte: startDate, $lte: endDate },
  }).sort({ timestamp: 1 });

  let previousValue = 0;
  let counter = 0;

  const sysTime = new Date().toISOString().split("T")[1].substring(0, 8);

  for (let record of history) {
    const recordTime = new Date(record.timestamp)
      .toISOString()
      .split("T")[1]
      .substring(0, 8);
    const currentValue = Number(record.value);

    if (previousValue === 0 && currentValue === 1) {
      counter++;
    }

    if (recordTime === sysTime) {
      console.log(`MATCH at ${recordTime} → Counter = ${counter}`);
      const data = await TagLive.findOneAndUpdate(
        { tagname: "ED_RCDI_Position_counts1" },
        { $set: { latestValue: counter } },
        { new: true },
      );
      return data;
    }

    previousValue = currentValue;
  }

  // console.log("No time match found. Final counter:", counter);
  return counter;
}

//CR0030 - Add view for websocket for truck count
// async function updateCounterFromStart(tagObjectId) {
//   const history = await mongoose.connection.db
//     .collection("liveData_transition_count_view")
//     .findOne({});

//   const counter = history?.total_0_to_1_transitions || 0;

//   console.log(`Counter = ${counter}`);

//   const data = await TagLive.findOneAndUpdate(
//     { tagname: "ED_RCDI_Position_counts1" },
//     { $set: { latestValue: counter } },
//     { new: true }
//   );

//   return data;
// }
//CR0030 -Add view for websocket for truck count

function truckLiveWatcher(liveNamespace) {
  console.log("Monitoring truck tag every 5 seconds...");

  const TRUCK_TAG_ID = "69a2d5c599a6d75965a04e4c";

  setInterval(async () => {
    try {
      const updatedDoc = await updateCounterFromStart();
      if (!updatedDoc) return;

      const newValue = updatedDoc.latestValue;

      // ✅ Only emit if value changed
      if (newValue === lastTruckValue) {
        console.log("No change, skipping emit. Value:", newValue);
        return;
      }

      lastTruckValue = newValue;

      const payload = {
        id: updatedDoc._id.toString(),
        val: newValue,
        timestamp: new Date(),
        health: updatedDoc.health ?? true,
      };

      Object.entries(subscriptions).forEach(([socketId, sub]) => {
        if (sub.tags && sub.tags[TRUCK_TAG_ID]) {
          const socket = liveNamespace.sockets.get(socketId);
          if (socket) {
            sub.tags[TRUCK_TAG_ID].forEach((tagSub) => {
              const emitKey =
                tagSub.mode === "batch" ? tagSub.key : TRUCK_TAG_ID;
              socket.emit(emitKey, payload);
              console.log(`🚀 Truck emitted to ${socketId}:`, newValue);
            });
          }
        }
      });
    } catch (err) {
      console.error("truckLiveWatcher error:", err);
    }
  }, 5000);
}

// ─── Setpoint Deviation Watcher ───────────────────────────────────────────────

async function updateSetpointDeviationCount() {
  const startDate = new Date("2026-02-26T00:00:00.000Z");
  const endDate = new Date("2026-02-27T23:59:59.000Z");

  // ✅ Fetch all deviation events in the date range, sorted by triggeredAt
  const events = await SetpointDeviationEvent.find({
    triggeredAt: { $gte: startDate, $lte: endDate },
  }).sort({ triggeredAt: 1 });

  // ✅ Match current system time (HH:mm:ss) against record's triggeredAt
  const sysTime = new Date().toISOString().split("T")[1].substring(0, 8);

  let totalCount = 0;
  const breakdown = {};
  let matchedCount = null;
  let matchedBreakdown = null;

  for (const event of events) {
    const recordTime = new Date(event.triggeredAt)
      .toISOString()
      .split("T")[1]
      .substring(0, 8);

    // ✅ Accumulate count up to this event
    totalCount++;
    const dtype = event.deviationType || "unknown";
    breakdown[dtype] = (breakdown[dtype] || 0) + 1;

    if (recordTime === sysTime) {
      console.log(
        `[SetpointDeviation] MATCH at ${recordTime} → Count = ${totalCount}`,
      );
      matchedCount = totalCount;
      matchedBreakdown = { ...breakdown };
      // do NOT break — keep looping in case multiple events share same second
    }
  }

  if (matchedCount === null) {
    // console.log(
    //   // "[SetpointDeviation] No time match found. Final count:",
    //   totalCount,
    // );
    const lastKnownTag = await TagLive.findOne({ tagname: setpointDeviationTagName });
    return lastKnownTag || null;
    // return null;
    // matchedCount = totalCount;
    // matchedBreakdown = { ...breakdown };
  }

  // ✅ Ensure the tag exists in tag_lives, create if missing
  const updatedTag = await TagLive.findOneAndUpdate(
    { tagname: setpointDeviationTagName },
    {
      $set: {
        latestValue: matchedCount,
        datatype: "INT",
        health: true,
      },
      $setOnInsert: {
        tagname: setpointDeviationTagName,
        isActive: true,
      },
    },
    { new: true, upsert: true },
  );

  // ✅ Cache the resolved tag _id so socket subscriptions can find it
  if (!setpointDeviationTagId && updatedTag) {
    setpointDeviationTagId = updatedTag._id.toString();
    console.log(
      `[SetpointDeviation] Tag resolved with id: ${setpointDeviationTagId}`,
    );
  }

  return updatedTag;
}

// function setpointDeviationWatcher(liveNamespace) {
//   console.log(
//     "[SetpointDeviation] Monitoring setpoint deviations every 5 seconds...",
//   );

//   setInterval(async () => {
//     try {

//       const updatedDoc = await updateSetpointDeviationCount();
//       console.log("[DEBUG] updatedDoc:", updatedDoc ? updatedDoc.latestValue : "NULL - no time match");
//       if (!updatedDoc) return;

//       const newValue = updatedDoc.latestValue;

//       // ✅ Only emit if value changed
//       if (newValue === lastSetpointDeviationCount) {
//         console.log(
//           "[SetpointDeviation] No change, skipping emit. Value:",
//           newValue,
//         );
//         return;
//       }

//       lastSetpointDeviationCount = newValue;

//       const tagIdStr = updatedDoc._id.toString();

// console.log("[DEBUG] tagIdStr from DB:", tagIdStr);
//       console.log("[DEBUG] current subscriptions tags:",
//         Object.entries(subscriptions).map(([sid, sub]) => ({
//           socketId: sid,
//           tags: Object.keys(sub.tags)
//         }))
//       );

//       const payload = {
//         id: tagIdStr,
//         val: newValue,
//         timestamp: new Date(),
//         health: updatedDoc.health ?? true,
//       };

//       // ✅ Emit to all subscribed sockets (matching by tag _id, same as truck)
//       Object.entries(subscriptions).forEach(([socketId, sub]) => {
//         if (sub.tags && sub.tags[tagIdStr]) {
//           const socket = liveNamespace.sockets.get(socketId);
//           if (socket) {
//             sub.tags[tagIdStr].forEach((tagSub) => {
//               const emitKey = tagSub.mode === "batch" ? tagSub.key : tagIdStr;
//               socket.emit(emitKey, payload);
//               console.log(
//                 `📊 SetpointDeviation emitted to ${socketId}:`,
//                 newValue,
//               );
//             });
//           }
//         }
//       });
//     } catch (err) {
//       console.error("[SetpointDeviation] setpointDeviationWatcher error:", err);
//     }
//   }, 5000);
// }

function setpointDeviationWatcher(liveNamespace) {
  const SETPOINT_TAG_ID = "69a93d6055b35dab3577b3b4"; // ← hardcoded like truck

  setInterval(async () => {
    try {
      const updatedDoc = await updateSetpointDeviationCount();
      if (!updatedDoc) return;

      const newValue = updatedDoc.latestValue;

      if (newValue === lastSetpointDeviationCount) {
        console.log("[SetpointDeviation] No change, skipping emit. Value:", newValue);
        return;
      }

      lastSetpointDeviationCount = newValue;

      const payload = {
        id: SETPOINT_TAG_ID, // ✅ always use the known tag ID
        val: newValue,
        timestamp: new Date(),
        health: updatedDoc.health ?? true,
      };

      Object.entries(subscriptions).forEach(([socketId, sub]) => {
        if (sub.tags && sub.tags[SETPOINT_TAG_ID]) {
          // ✅ match by known tag ID
          const socket = liveNamespace.sockets.get(socketId);
          if (socket) {
            sub.tags[SETPOINT_TAG_ID].forEach((tagSub) => {
              const emitKey = tagSub.mode === "batch" ? tagSub.key : SETPOINT_TAG_ID;
              socket.emit(emitKey, payload);
              console.log(`📊 SetpointDeviation emitted to ${socketId}:`, newValue);
            });
          }
        }
      });
    } catch (err) {
      console.error("[SetpointDeviation] setpointDeviationWatcher error:", err);
    }
  }, 5000);
}

// ─────────────────────────────────────────────────────────────────────────────
// CR0028 Maintenance plan count increase
async function updateMaintenanceExpiredCount() {
  const count = await MaintenancePlan.countDocuments({ 
    status: "expired",
    isDeleted: false  
  });

  const updatedTag = await TagLive.findByIdAndUpdate(
    new mongoose.Types.ObjectId("69a04e1a1e5e302c5e7da956"),
    { $set: { latestValue: count, health: true } },
    { new: true }
  );

  return updatedTag;
}

async function maintenanceExpiredWatcher(liveNamespace) {
  const MAINTENANCE_TAG_ID = "69a04e1a1e5e302c5e7da956";
  let lastMaintenanceExpiredCount = null;

  const initialDoc = await updateMaintenanceExpiredCount();
  if (initialDoc) {
    lastMaintenanceExpiredCount = initialDoc.latestValue;
  }

  setInterval(async () => {
    try {
      const updatedDoc = await updateMaintenanceExpiredCount();
      if (!updatedDoc) return;

      const newValue = updatedDoc.latestValue;

      if (newValue === lastMaintenanceExpiredCount) {
        return;
      }

      lastMaintenanceExpiredCount = newValue;

      const payload = {
        id: MAINTENANCE_TAG_ID,
        val: newValue,
        timestamp: new Date(),
        health: updatedDoc.health ?? true,
      };

      Object.entries(subscriptions).forEach(([socketId, sub]) => {
        if (sub.tags && sub.tags[MAINTENANCE_TAG_ID]) {
          const socket = liveNamespace.sockets.get(socketId);

          if (socket) {
            sub.tags[MAINTENANCE_TAG_ID].forEach((tagSub) => {
              const emitKey =
                tagSub.mode === "batch"
                  ? tagSub.key
                  : MAINTENANCE_TAG_ID;

              socket.emit(emitKey, payload);
            });
          }
        }
      });
    } catch (err) {
      console.error("[MaintenanceExpired] watcher error:", err);
    }
  }, 5000);
}
// CR0028 Maintenance plan count increase

module.exports = {
  truckLiveWatcher,
  liveDataHandler,
  setpointDeviationWatcher,
  maintenanceExpiredWatcher // CR0028 Maintenance plan count increase
};

// // const Asset = require("../../models/mongoDB/tags/assetTagsModel");
// // const {TagHistory,TagLive} = require("../../models/mongoDB/tags/tagsModel");
// // const batchConfig = { default: { frequency: 500, maxSize: 100 } };
// // const batchTimers = {}; // batchKey -> lastEmitTime
// // const mongoose = require("mongoose");

// // const { startDBLiveEmitter } = require("./liveDataDbEmitter");

// // module.exports = function liveDataHandler(liveNamespace) {
// //   console.log(" /live-data namespace mounted");

// //   // const batchConfig = { default: { frequency: 500, maxSize: 100 } };
// //   const subscriptions = {}; // socketId -> { room, tags: { tagId: { mode, key } } }
// //   const systemState = {}; // Stores latest value for each tag

// //   // const subscriptions = {};

// //   liveNamespace.on("connection", (socket) => {
// //     console.log(" Client connected:", socket.id);

// //     // subscriptions[socket.id] ||= { socket, tags: {} }; // store socket ref

// //     socket.aiLastState = {};
// //     subscriptions[socket.id] ||= { socket, tags: {}, ai: false };

// //     // =====================================================
// //     // ================= RAW WS (POSTMAN) =================
// //     // =====================================================
// //     // socket.on("message", async (msg) => {
// //     //   socket.on("message", async(msg) => {
// //     //   console.log("POSTMAN MSG:", msg);

// //     //   try {
// //     //     const parsed = typeof msg === "string" ? JSON.parse(msg) : msg;

// //     //     if (parsed.event === "subscribe_ai_tags") {
// //     //       subscriptions[socket.id].ai = true;
// //     //       console.log("SUBSCRIBE HIT");

// //     //       const db = mongoose.connection.db;
// //     //       const aiDocs = await db.collection("aiTagData").find({}).toArray();

// //     //       for (const doc of aiDocs) {
// //     //         const payload = {
// //     //           id: doc.tagName,
// //     //           val: doc.val,
// //     //           timestamp: doc.timestamp,
// //     //           health: true,
// //     //           isForecasted: doc.isForecasted,
// //     //           latestTimestamp: doc.latestTimestamp,
// //     //         };

// //     //         socket.emit("ai_tag_update", payload);

// //     //         // if (socket.conn?.transport?.socket) {
// //     //         //   socket.conn.transport.socket.send(
// //     //         //     JSON.stringify({ type: "ai_tag_update", data: payload })
// //     //         //   );
// //     //         // }

// //     //         socket.aiLastState[doc.tagName] = JSON.stringify(doc.val);
// //     //       }
// //     //     }

// //     //   } catch (e) {
// //     //     console.log("Invalid WS message");
// //     //   }
// //     // });

// //     // JWT bypass for testing
// //     socket.userId = "TEST_USER";
// //     socket.businessUnit = "TEST_BU";
// //     socket.isSuperAdmin = true;
// //     socket.department = "TEST_DEPT";

// //     // subscriptions[socket.id] ||= { tags: {} };

// //     socket.on("configure_batching", (configs = []) => {
// //       configs.forEach((cfg) => {
// //         console.log("cfg",configs);
// //         if (!cfg.id) return;

// //         batchConfig[cfg.id] = {
// //           frequency: cfg.frequency || 500,
// //           maxSize: cfg.maxSize || 100,
// //         };
// //       });

// //       console.log("Batch Config Updated:", batchConfig);
// //     });

// //     // ----------------------------
// //     // ADD TAGS
// //     // ----------------------------
// //     // socket.on("add_tags", async ({ tags = [], assetName }) => {
// //     //   if (!assetName) return console.error("Asset name not provided");

// //     //   const asset = await Asset.findOne({ name: assetName });
// //     //   if (!asset) return console.error("Asset not found:", assetName);

// //     //   const newlyAdded = [];

// //     //   for (const tagObj of tags) {
// //     //     const { tagname, minValue = 0, maxValue = 100,unit = "" } = tagObj;
// //     //     systemState[tagname] ||= 0; // init system state

// //     //     let dbTag = await Tag.findOne({ tagname });

// //     //     if (!dbTag) {
// //     //       dbTag = new Tag({
// //     //         tagname,
// //     //         latestValue: (
// //     //           minValue +
// //     //           Math.random() * (maxValue - minValue)
// //     //         ).toFixed(3),
// //     //         unit,
// //     //         datatype: "REAL",
// //     //         assetId: [asset._id],
// //     //         isActive: true,
// //     //         plcName: "DEFAULT_PLC",
// //     //         ranges: { minValue, maxValue },
// //     //         updatedAt: new Date(),
// //     //       });
// //     //       await dbTag.save();
// //     //       newlyAdded.push(tagname);
// //     //     } else {
// //     //       if (!Array.isArray(dbTag.assetId))
// //     //         dbTag.assetId = dbTag.assetId ? [dbTag.assetId] : [];
// //     //       if (!dbTag.assetId.includes(asset._id)) dbTag.assetId.push(asset._id);
// //     //       if (unit) dbTag.unit = unit;
// //     //       dbTag.updatedAt = new Date();
// //     //       await dbTag.save();
// //     //       newlyAdded.push(tagname);
// //     //     }
// //     //   }

// //     //   socket.emit("tags_added", { assetName, addedTags: newlyAdded });
// //     //   console.log(`Added tags for asset ${assetName}:`, newlyAdded);
// //     // });

// //     socket.on("add_tags", async ({ tags = [] }) => {
// //   try {
// //     const newlyAdded = [];

// //     for (const tagObj of tags) {
// //       const {
// //         tagname,
// //         minValue = 0,
// //         maxValue = 100,
// //         unit = ""
// //       } = tagObj;

// //       systemState[tagname] ||= 0;

// //       let dbTag = await TagMock.findOne({ tagname });

// //       if (!dbTag) {
// //         dbTag = new TagMock({
// //           tagname,
// //           latestValue: (
// //             minValue + Math.random() * (maxValue - minValue)
// //           ).toFixed(3),
// //           unit,
// //           datatype: "REAL",
// //           isActive: true,
// //           plcName: "DEFAULT_PLC",
// //           ranges: { minValue, maxValue },
// //           updatedAt: new Date(),
// //           createdAt: new Date()
// //         });

// //         await dbTag.save();
// //         newlyAdded.push(tagname);
// //       } else {
// //         // update existing
// //         if (unit) dbTag.unit = unit;
// //         dbTag.updatedAt = new Date();
// //         await dbTag.save();
// //         newlyAdded.push(tagname);
// //       }
// //     }

// //     socket.emit("tags_added", { addedTags: newlyAdded });
// //     console.log("Added tags:", newlyAdded);

// //   } catch (err) {
// //     console.error("Error adding tags:", err);
// //   }
// // });

// //     // ----------------------------
// //     // JOIN ROOM
// //     // ----------------------------

// //     //     socket.on("join_room", payload => {
// //     //   const { room, tags } = payload;
// //     //   if (!room || !Array.isArray(tags)) return;

// //     //   socket.join(room);

// //     //   // Initialize subscription for this socket
// //     //   subscriptions[socket.id] ||= { room, tags: {} };

// //     //   tags.forEach(t => {
// //     //     // t.mode should be either "direct" or "batch"
// //     //     // t.key is used only for batch mode
// //     //     subscriptions[socket.id].tags[t.id] = {
// //     //       mode: t.mode || "direct",   // default is direct
// //     //       key: t.mode === "batch" ? t.key || "default" : undefined
// //     //     };

// //     //     // Initialize system state if not present
// //     //     systemState[t.id] ||= 0;
// //     //   });

// //     //   console.log(" JOIN_ROOM STATE:", subscriptions[socket.id]);
// //     // });

// //     // socket.on("join_room", async (payload) => {
// //     //   const { room, tags } = payload;
// //     //   console.log("./../.",room,tags)
// //     //   // if (!room || !Array.isArray(tags)) return;

// //     //   // socket.join(room);

// //     //   // // Initialize subscription for this socket
// //     //   // subscriptions[socket.id] ||= { room, tags: {} };

// //     //   // for (const t of tags) {
// //     //   //   // Find tag by name to get the MongoDB _id

// //     //   //   const tagDoc = await Tag.findOne({ _id: t.id });
// //     //   //   if (!tagDoc) continue;
// //     //   //   console.log("!!!!!", tagDoc);

// //     //   //   const tagId = tagDoc._id.toString(); // use GUID instead of tagname

// //     //   //   subscriptions[socket.id].tags[tagId] = {
// //     //   //     mode: t.mode || "direct", // default is direct
// //     //   //     key: t.mode === "batch" ? t.key || "default" : undefined,
// //     //   //   };

// //     //   //   // Initialize system state if not present
// //     //   //   systemState[tagId] ||= 0;
// //     //   // }

// //     //   // console.log(" JOIN_ROOM STATE:", subscriptions[socket.id]);
// //     // });

// //     socket.on("join_room", async (payload) => {
// //   try {
// //     const { room, tags } = payload;

// //     console.log("rooommmm", room, tags);

// //     const history1 = await TagHistory.find().limit(5);
// // console.log(history1);

// //     // console.log("History data:", history1);

// //   } catch (err) {
// //     console.error("ERROR INSIDE JOIN:", err);
// //   }
// // });

// // //       socket.join(room);

// // //       const history1 = await TagHistory.find(
// // //           // tag_id: new mongoose.Types.ObjectId(tagId),
// // //           // timestamp: { $gte: startUTC, $lte: endUTC }
// // //         );

// // //         console.log("...",history1)

// // // //       for (const tag of tags) {

// // // //         const tagId = tag.id;
// // // //         const mode = tag.mode;

// // // //         const nowIST = new Date();
// // // //         const startIST = new Date(nowIST);
// // // //         startIST.setHours(0, 0, 0, 0);

// // // //         const startUTC = istToUtc(startIST);
// // // //         const endUTC = istToUtc(nowIST);

// // // //         console.log("Querying between:", startUTC, endUTC);

// // // //         const now = new Date();
// // // //         const startOfDay = new Date(now);
// // // // startOfDay.setHours(0, 0, 0, 0);

// // // // const history = await TagHistory.find({
// // // //   tag_id: new mongoose.Types.ObjectId(tagId),
// // // //   timestamp: { $gte: startOfDay, $lte: now }
// // // // }).sort({ timestamp: 1 });

// // // // console.log("Now:", now);
// // // // console.log("Start of Day:", startOfDay);
// // // // console.log("History length:", history.length);

// // // //         const history1 = await TagHistory.find({
// // // //           tag_id: new mongoose.Types.ObjectId(tagId),
// // // //           timestamp: { $gte: startUTC, $lte: endUTC }
// // // //         }).sort({ timestamp: 1 });

// // // //         console.log("History length:", history1.length);

// // // //         if (!history1.length) continue;

// // // //         const streamKey = `${socket.id}_${tagId}`;

// // // //         let index = 0;

// // // //         replayStreams[streamKey] = setInterval(() => {

// // // //           if (index >= history1.length) {
// // // //             clearInterval(replayStreams[streamKey]);
// // // //             return;
// // // //           }

// // // //           socket.emit("tagData", {
// // // //             tagId,
// // // //             value: history1[index].value,
// // // //             timestamp: history1[index].timestamp,
// // // //             mode
// // // //           });

// // // //           index++;

// // // //         }, 1000);
// // // //       }
// // //     });

// //     // ----------------------------
// //     // CONTINUOUS EMISSION LOOP
// //     // ----------------------------

// //     setInterval(async () => {
// //       const now = new Date().toISOString();

// //       const db = mongoose.connection.db;
// //       const aiDocs = await db.collection("aiTagData").find({}).toArray();

// //       for (const clientSocket of liveNamespace.sockets.values()) {
// //         const sub = subscriptions[clientSocket.id];
// //         if (!sub) continue;

// //       // for (const socket of liveNamespace.sockets.values()) {
// //       //   const sub = subscriptions[socket.id];
// //       //   if (!sub || !sub.tags) continue;

// //         const batchBuckets = {};

// //         for (const [tagId, cfg] of Object.entries(sub.tags)) {
// //           // const tagDoc = await Tag.findOne({ tagname: tagId });
// //           const tagDoc = await Tag.findById(tagId);
// //           if (!tagDoc || !tagDoc.ranges) continue;

// //           const min = Number(tagDoc.ranges.minValue);
// //           const max = Number(tagDoc.ranges.maxValue);

// //           const value = Number((min + Math.random() * (max - min)).toFixed(3));

// //           tagDoc.latestValue = value;
// //           tagDoc.updatedAt = new Date();
// //           await tagDoc.save();

// //           const payload = {
// //             // id: tagId,
// //             id: tagDoc._id.toString(),
// //             val: value,
// //             health: true,
// //             timestamp: now,
// //           };

// //           if (cfg.mode === "direct") {
// //             // socket.emit(tagId, payload);
// //             // socket.emit(tagDoc._id.toString(), payload);
// //             clientSocket.emit(tagDoc._id.toString(), payload); // This ensures each connected client receives its own emission during the loop.(this is added so that every client can listen to all events)
// //           }

// //           // if (cfg.mode === "batch") {
// //           //   batchBuckets[cfg.key || "default"] ||= [];
// //           //   batchBuckets[cfg.key || "default"].push(payload);
// //           // }

// //           if (cfg.mode === "batch") {
// //             const batchKey = cfg.key || "default";
// //             const config = batchConfig[batchKey] || batchConfig.default;

// //             batchBuckets[batchKey] ||= [];
// //             batchTimers[batchKey] ||= 0;

// //             // SIZE CONTROL
// //             if (batchBuckets[batchKey].length < config.maxSize) {
// //               batchBuckets[batchKey].push(payload);
// //             }

// //             const nowTime = Date.now();

// //             // TIME CONTROL
// //             if (nowTime - batchTimers[batchKey] >= config.frequency) {
// //               // socket.emit(batchKey, batchBuckets[batchKey]);
// //               clientSocket.emit(batchKey, batchBuckets[batchKey]); // This ensures each connected client receives its own emission during the loop.(this is added so that every client can listen to all events)
// //               batchBuckets[batchKey] = [];
// //               batchTimers[batchKey] = nowTime;
// //             }
// //           }
// //         }

// //         // for (const [key, arr] of Object.entries(batchBuckets)) {
// //         //   socket.emit(key, arr);
// //         // }

// //         // ---------------- AI TAGS ----------------
// //         // if (sub.ai) {
// //           // for (const doc of aiDocs) {
// //           //   const currentStr = JSON.stringify(doc.val);
// //           //   const lastStr = clientSocket.aiLastState[doc.tagName];

// //           //   if (!lastStr || currentStr !== lastStr) {
// //           //     const payload = {
// //           //       id: doc.tagName,
// //           //       val: doc.val,
// //           //       timestamp: doc.timestamp,
// //           //       health: true,
// //           //       isForecasted: doc.isForecasted,
// //           //       latestTimestamp: doc.latestTimestamp,
// //           //     };

// //           //     clientSocket.emit("ai_tag_update", payload);

// //           //     if (clientSocket.conn?.transport?.socket) {
// //           //       clientSocket.conn.transport.socket.send(
// //           //         JSON.stringify({ type: "ai_tag_update", data: payload })
// //           //       );
// //           //     }

// //           //     clientSocket.aiLastState[doc.tagName] = currentStr;
// //           //   }
// //           // }
// //         // } (if you want to subscribe then get data for ai uncomment if(sub.ai))
// //       }
// //     }, 500);

// //     // ----------------------------
// //     // DISCONNECT
// //     // ----------------------------
// //     socket.on("disconnect", () => {
// //       delete subscriptions[socket.id];
// //       console.log(` Client disconnected: ${socket.id}`);
// //     });
// //   });
// //   // Start DB emitter and give it access to subscriptions
// //   startDBLiveEmitter(liveNamespace, subscriptions);
// // };

// // const mongoose = require("mongoose");
// // const { TagHistory } = require("../../models/mongoDB/tags/tagsModel");

// // module.exports = function liveDataHandler(liveNamespace) {

// //   console.log("/live-data namespace mounted");

// //   const batchConfig = { default: { frequency: 500, maxSize: 100 } };
// //   const subscriptions = {}; // socketId -> { tags }

// //   liveNamespace.on("connection", (socket) => {

// //     console.log("Client connected:", socket.id);

// //     subscriptions[socket.id] = { tags: {} };

// //     // =====================================================
// //     // CONFIGURE BATCHING
// //     // =====================================================
// //     socket.on("configure_batching", (configs = []) => {

// //       configs.forEach(cfg => {
// //         if (!cfg.id) return;

// //         batchConfig[cfg.id] = {
// //           frequency: cfg.frequency || 500,
// //           maxSize: cfg.maxSize || 100
// //         };
// //       });

// //       console.log("Updated batchConfig:", batchConfig);
// //     });

// //     // =====================================================
// //     // JOIN ROOM
// //     // =====================================================
// //     socket.on("join_room", async (payload) => {

// //       try {

// //         const { room, tags } = payload;

// //         if (!room || !Array.isArray(tags)) return;

// //         socket.join(room);

// //         console.log("JOIN ROOM:", room, tags);

// //         // Store subscription
// //         tags.forEach(t => {
// //           subscriptions[socket.id].tags[t.id] = {
// //             mode: t.mode || "direct",
// //             key: t.key || "default"
// //           };
// //         });

// //         // Current IST
// //         const nowIST = new Date();

// //         // Convert IST → UTC
// //         const nowUTC = new Date(nowIST.getTime() - (5.5 * 60 * 60 * 1000));

// //         // Allow +30 sec forward search
// //         const searchEndUTC = new Date(nowUTC.getTime() + 30 * 1000);

// //         console.log("Searching history between:", nowUTC, searchEndUTC);

// //         for (const tag of tags) {

// //           const tagObjectId = new mongoose.Types.ObjectId(tag.id);

// //           // Fetch next 60 seconds of data
// //           const historyDocs = await TagHistory.find({
// //             tag_id: tagObjectId,
// //             timestamp: { $gte: nowUTC, $lte: searchEndUTC }
// //           })
// //           .sort({ timestamp: 1 })
// //           .limit(60);

// //           if (!historyDocs.length) {
// //             console.log("No history found for:", tag.id);
// //             continue;
// //           }

// //           let index = 0;

// //           const interval = setInterval(() => {

// //             if (index >= historyDocs.length) {
// //               clearInterval(interval);
// //               return;
// //             }

// //             const doc = historyDocs[index];

// //             const emitPayload = {
// //               id: tag.id,
// //               val: doc.value, // change if your field name differs
// //               timestamp: doc.timestamp,
// //               health: true
// //             };

// //             const sub = subscriptions[socket.id]?.tags[tag.id];
// //             if (!sub) return;

// //             // ================= DIRECT =================
// //             if (sub.mode === "direct") {
// //               socket.emit(tag.id, emitPayload);
// //             }

// //             // ================= BATCH =================
// //             if (sub.mode === "batch") {

// //               const batchKey = sub.key || "default";
// //               const config = batchConfig[batchKey] || batchConfig.default;

// //               if (!socket.batchStore) socket.batchStore = {};
// //               if (!socket.batchTimers) socket.batchTimers = {};

// //               socket.batchStore[batchKey] ||= [];
// //               socket.batchTimers[batchKey] ||= Date.now();

// //               socket.batchStore[batchKey].push(emitPayload);

// //               const now = Date.now();

// //               if (
// //                 socket.batchStore[batchKey].length >= config.maxSize ||
// //                 now - socket.batchTimers[batchKey] >= config.frequency
// //               ) {
// //                 socket.emit(batchKey, socket.batchStore[batchKey]);
// //                 socket.batchStore[batchKey] = [];
// //                 socket.batchTimers[batchKey] = now;
// //               }
// //             }

// //             index++;

// //           }, 1000); // emit every second

// //         }

// //       } catch (err) {
// //         console.error("JOIN_ROOM ERROR:", err);
// //       }

// //     });

// //     // =====================================================
// //     // DISCONNECT
// //     // =====================================================
// //     socket.on("disconnect", () => {
// //       delete subscriptions[socket.id];
// //       console.log("Client disconnected:", socket.id);
// //     });

// //   });
// // };

// // const mongoose = require("mongoose");
// // const { TagHistory } = require("../../models/mongoDB/tags/tagsModel");

// // module.exports = function liveDataHandler(liveNamespace) {

// //   console.log("/live-data namespace mounted");

// //   // ================================
// //   // BATCH CONFIG DEFAULT
// //   // ================================
// //   const batchConfig = {
// //     default: { frequency: 500, maxSize: 100 }
// //   };

// //   // socketId -> { tags: { tagId: { mode, key } } }
// //   const subscriptions = {};

// //   liveNamespace.on("connection", (socket) => {

// //     console.log("Client connected:", socket.id);

// //     subscriptions[socket.id] = { tags: {} };

// //     // =============================================
// //     // CONFIGURE BATCHING
// //     // =============================================
// //     socket.on("configure_batching", (configs = []) => {

// //       configs.forEach(cfg => {
// //         if (!cfg.id) return;

// //         batchConfig[cfg.id] = {
// //           frequency: cfg.frequency || 500,
// //           maxSize: cfg.maxSize || 100
// //         };
// //       });

// //       console.log("Updated batchConfig:", batchConfig);
// //     });

// //     // =============================================
// //     // JOIN ROOM (START STREAMING)
// //     // =============================================
// //     socket.on("join_room", async (payload) => {

// //       try {

// //         const { room, tags } = payload;

// //         if (!room || !Array.isArray(tags)) return;

// //         socket.join(room);

// //         console.log("JOIN ROOM:", room);

// //         // Store subscriptions
// //         tags.forEach(t => {
// //           subscriptions[socket.id].tags[t.id] = {
// //             mode: t.mode || "direct",
// //             key: t.key || "default"
// //           };
// //         });

// //         // =============================================
// //         // FIXED DB RANGE (Your Data Range)
// //         // =============================================
// //         const searchStartUTC = new Date("2026-02-20T18:30:00.000Z");
// //         const searchEndUTC   = new Date("2026-02-21T18:29:59.000Z");

// //         console.log("Searching history between:", searchStartUTC, searchEndUTC);

// //         for (const tag of tags) {

// //           const tagObjectId = new mongoose.Types.ObjectId(tag.id);

// //           const historyDocs = await TagHistory.find({
// //             tag_id: tagObjectId,
// //             timestamp: { $gte: searchStartUTC, $lte: searchEndUTC }
// //           })
// //           .sort({ timestamp: 1 });

// //           if (!historyDocs.length) {
// //             console.log("No history found for:", tag.id);
// //             continue;
// //           }

// //           let index = 0;

// //           // Store interval reference
// //           if (!socket.tagIntervals) socket.tagIntervals = {};

// //           // Clear previous interval if exists
// //           if (socket.tagIntervals[tag.id]) {
// //             clearInterval(socket.tagIntervals[tag.id]);
// //           }

// //           socket.tagIntervals[tag.id] = setInterval(() => {

// //             // Stop if unsubscribed
// //             if (!subscriptions[socket.id]?.tags[tag.id]) {
// //               clearInterval(socket.tagIntervals[tag.id]);
// //               delete socket.tagIntervals[tag.id];
// //               return;
// //             }

// //             const doc = historyDocs[index];

// //             const emitPayload = {
// //               id: tag.id,
// //               val: doc.value,
// //               timestamp: doc.timestamp,
// //               health: true
// //             };

// //             const sub = subscriptions[socket.id]?.tags[tag.id];
// //             if (!sub) return;

// //             // ================= DIRECT MODE =================
// //             if (sub.mode === "direct") {
// //               socket.emit(tag.id, emitPayload);
// //             }

// //             // ================= BATCH MODE =================
// //             if (sub.mode === "batch") {

// //               const batchKey = sub.key || "default";
// //               const config = batchConfig[batchKey] || batchConfig.default;

// //               if (!socket.batchStore) socket.batchStore = {};
// //               if (!socket.batchTimers) socket.batchTimers = {};

// //               socket.batchStore[batchKey] ||= [];
// //               socket.batchTimers[batchKey] ||= Date.now();

// //               socket.batchStore[batchKey].push(emitPayload);

// //               const now = Date.now();

// //               if (
// //                 socket.batchStore[batchKey].length >= config.maxSize ||
// //                 now - socket.batchTimers[batchKey] >= config.frequency
// //               ) {
// //                 socket.emit(batchKey, socket.batchStore[batchKey]);
// //                 socket.batchStore[batchKey] = [];
// //                 socket.batchTimers[batchKey] = now;
// //               }
// //             }

// //             index++;

// //             // 🔁 Loop replay when finished
// //             if (index >= historyDocs.length) {
// //               index = 0;
// //             }

// //           }, 1000); // Emit every second
// //         }

// //       } catch (err) {
// //         console.error("JOIN_ROOM ERROR:", err);
// //       }

// //     });

// //     // =============================================
// //     // UNSUBSCRIBE TAGS
// //     // =============================================
// //     socket.on("unsubscribe_tags", (tagIds = []) => {

// //       tagIds.forEach(tagId => {

// //         delete subscriptions[socket.id]?.tags[tagId];

// //         if (socket.tagIntervals?.[tagId]) {
// //           clearInterval(socket.tagIntervals[tagId]);
// //           delete socket.tagIntervals[tagId];
// //         }

// //       });

// //     });

// //     // =============================================
// //     // DISCONNECT
// //     // =============================================
// //     socket.on("disconnect", () => {

// //       // Clear all intervals
// //       if (socket.tagIntervals) {
// //         Object.values(socket.tagIntervals).forEach(interval => {
// //           clearInterval(interval);
// //         });
// //       }

// //       delete subscriptions[socket.id];

// //       console.log("Client disconnected:", socket.id);
// //     });

// //   });
// // };

// // const mongoose = require("mongoose");
// // const { TagHistory } = require("../../models/mongoDB/tags/tagsModel");

// // module.exports = function liveDataHandler(liveNamespace) {

// //   console.log("/live-data namespace mounted");

// //   const batchConfig = {
// //     default: { frequency: 500, maxSize: 100 }
// //   };

// //   const subscriptions = {};

// //   liveNamespace.on("connection", (socket) => {

// //     console.log("Client connected:", socket.id);

// //     subscriptions[socket.id] = { tags: {} };

// //     socket.tagIntervals = {};
// //     socket.batchIntervals = {};
// //     socket.batchStore = {};

// //     // =============================================
// //     // CONFIGURE BATCHING
// //     // =============================================
// //     socket.on("configure_batching", (configs = []) => {

// //       configs.forEach(cfg => {
// //         if (!cfg.id) return;

// //         batchConfig[cfg.id] = {
// //           frequency: cfg.frequency || 500,
// //           maxSize: cfg.maxSize || 100
// //         };
// //       });

// //       console.log("Updated batchConfig:", batchConfig);
// //     });

// //     // =============================================
// //     // JOIN ROOM
// //     // =============================================
// //     socket.on("join_room", async (payload) => {

// //       try {

// //         const { room, tags } = payload;
// //         if (!room || !Array.isArray(tags)) return;

// //         socket.join(room);
// //         console.log("JOIN ROOM:", room);

// //         tags.forEach(t => {
// //           subscriptions[socket.id].tags[t.id] = {
// //             mode: t.mode || "direct",
// //             key: t.key || "default"
// //           };
// //         });

// //         // Your available DB range
// //         const searchStartUTC = new Date("2026-02-20T18:30:00.000Z");
// //         const searchEndUTC   = new Date("2026-02-21T18:29:59.000Z");

// //         for (const tag of tags) {

// //           const tagObjectId = new mongoose.Types.ObjectId(tag.id);

// //           const historyDocs = await TagHistory.find({
// //             tag_id: tagObjectId,
// //             timestamp: { $gte: searchStartUTC, $lte: searchEndUTC }
// //           }).sort({ timestamp: 1 });

// //           if (!historyDocs.length) {
// //             console.log("No history found for:", tag.id);
// //             continue;
// //           }

// //           // Convert DB timestamps to seconds-of-day (UTC)
// //           const docsWithSeconds = historyDocs.map(doc => {
// //             const d = new Date(doc.timestamp);
// //             const seconds =
// //               d.getUTCHours() * 3600 +
// //               d.getUTCMinutes() * 60 +
// //               d.getUTCSeconds();

// //             return { ...doc.toObject(), seconds };
// //           });

// //           // Current UTC time-of-day
// //           const now = new Date();
// //           const currentUTCSeconds =
// //             now.getUTCHours() * 3600 +
// //             now.getUTCMinutes() * 60 +
// //             now.getUTCSeconds();

// //           // Find correct starting index
// //           let index = docsWithSeconds.findIndex(
// //             d => d.seconds >= currentUTCSeconds
// //           );

// //           if (index === -1) index = 0;

// //           // Clear previous interval if exists
// //           if (socket.tagIntervals[tag.id]) {
// //             clearInterval(socket.tagIntervals[tag.id]);
// //           }

// //           // =============================================
// //           // MAIN 1-SECOND STREAM
// //           // =============================================
// //           socket.tagIntervals[tag.id] = setInterval(() => {

// //             if (!subscriptions[socket.id]?.tags[tag.id]) {
// //               clearInterval(socket.tagIntervals[tag.id]);
// //               delete socket.tagIntervals[tag.id];
// //               return;
// //             }

// //             const doc = docsWithSeconds[index];

// //             const emitPayload = {
// //               id: tag.id,
// //               val: doc.value,
// //               timestamp: doc.timestamp,
// //               health: true
// //             };

// //             const sub = subscriptions[socket.id]?.tags[tag.id];
// //             if (!sub) return;

// //             // ================= DIRECT =================
// //             if (sub.mode === "direct") {
// //               socket.emit(tag.id, emitPayload);
// //             }

// //             // ================= BATCH =================
// //             if (sub.mode === "batch") {

// //               const batchKey = sub.key || "default";
// //               const config = batchConfig[batchKey] || batchConfig.default;

// //               socket.batchStore[batchKey] ||= [];
// //               socket.batchStore[batchKey].push(emitPayload);

// //               // Create batch interval once
// //               if (!socket.batchIntervals[batchKey]) {

// //                 socket.batchIntervals[batchKey] = setInterval(() => {

// //                   const data = socket.batchStore[batchKey];

// //                   if (data && data.length > 0) {
// //                     socket.emit(batchKey, data);
// //                     socket.batchStore[batchKey] = [];
// //                   }

// //                 }, config.frequency);
// //               }

// //               // Immediate flush if maxSize reached
// //               if (socket.batchStore[batchKey].length >= config.maxSize) {
// //                 socket.emit(batchKey, socket.batchStore[batchKey]);
// //                 socket.batchStore[batchKey] = [];
// //               }
// //             }

// //             index++;

// //             // Loop when finished
// //             if (index >= docsWithSeconds.length) {
// //               index = 0;
// //             }

// //           }, 1000);
// //         }

// //       } catch (err) {
// //         console.error("JOIN_ROOM ERROR:", err);
// //       }

// //     });

// //     // =============================================
// //     // UNSUBSCRIBE
// //     // =============================================
// //     socket.on("unsubscribe_tags", (tagIds = []) => {

// //       tagIds.forEach(tagId => {

// //         delete subscriptions[socket.id]?.tags[tagId];

// //         if (socket.tagIntervals[tagId]) {
// //           clearInterval(socket.tagIntervals[tagId]);
// //           delete socket.tagIntervals[tagId];
// //         }
// //       });
// //     });

// //     // =============================================
// //     // DISCONNECT
// //     // =============================================
// //     socket.on("disconnect", () => {

// //       if (socket.tagIntervals) {
// //         Object.values(socket.tagIntervals).forEach(clearInterval);
// //       }

// //       if (socket.batchIntervals) {
// //         Object.values(socket.batchIntervals).forEach(clearInterval);
// //       }

// //       delete subscriptions[socket.id];

// //       console.log("Client disconnected:", socket.id);
// //     });

// //   });
// // };

// // const mongoose = require("mongoose");
// // const { TagHistory } = require("../../models/mongoDB/tags/tagsModel");

// // module.exports = function liveDataHandler(liveNamespace) {

// //   console.log("/live-data namespace mounted");

// //   const subscriptions = {};

// //   liveNamespace.on("connection", (socket) => {

// //     console.log("Client connected:", socket.id);

// //     subscriptions[socket.id] = { tags: {} };
// //     socket.tagIntervals = {};

// //     // =============================================
// //     // IGNORE BATCH CONFIG
// //     // =============================================
// //     socket.on("configure_batching", () => {
// //       console.log("Batch config ignored (1 record per minute mode)");
// //     });

// //     // =============================================
// //     // JOIN ROOM
// //     // =============================================
// //     socket.on("join_room", async (payload) => {

// //       try {

// //         const { room, tags } = payload;
// //         if (!room || !Array.isArray(tags)) return;

// //         socket.join(room);

// //         tags.forEach(t => {
// //           subscriptions[socket.id].tags[t.id] = {
// //             mode: t.mode || "direct",
// //             key: t.key || "default"
// //           };
// //         });

// //         const searchStartUTC = new Date("2026-02-20T18:30:00.000Z");
// //         const searchEndUTC   = new Date("2026-02-21T18:29:59.000Z");

// //         for (const tag of tags) {

// //           const tagObjectId = new mongoose.Types.ObjectId(tag.id);

// //           const historyDocs = await TagHistory.find({
// //             tag_id: tagObjectId,
// //             timestamp: { $gte: searchStartUTC, $lte: searchEndUTC }
// //           }).sort({ timestamp: 1 });

// //           if (!historyDocs.length) continue;

// //           // 🔥 Group by minute
// //           const minuteMap = {};

// //           historyDocs.forEach(doc => {

// //             const d = new Date(doc.timestamp);
// //             const minuteKey =
// //               d.getUTCHours() * 60 + d.getUTCMinutes();

// //             if (!minuteMap[minuteKey]) {
// //               minuteMap[minuteKey] = {
// //                 first: doc,   // for batch
// //                 last: doc     // for direct
// //               };
// //             } else {
// //               minuteMap[minuteKey].last = doc;
// //             }
// //           });

// //           const minuteKeys = Object.keys(minuteMap)
// //             .map(Number)
// //             .sort((a, b) => a - b);

// //           if (!minuteKeys.length) continue;

// //           // 🔥 Start from current UTC minute
// //           const now = new Date();
// //           const currentUTCMinute =
// //             now.getUTCHours() * 60 + now.getUTCMinutes();

// //           let index = minuteKeys.findIndex(m => m >= currentUTCMinute);
// //           if (index === -1) index = 0;

// //           // Clear previous interval
// //           if (socket.tagIntervals[tag.id]) {
// //             clearInterval(socket.tagIntervals[tag.id]);
// //           }

// //           // =============================================
// //           // 🔥 EMIT ONE RECORD PER MINUTE
// //           // =============================================
// //           socket.tagIntervals[tag.id] = setInterval(() => {

// //             if (!subscriptions[socket.id]?.tags[tag.id]) {
// //               clearInterval(socket.tagIntervals[tag.id]);
// //               delete socket.tagIntervals[tag.id];
// //               return;
// //             }

// //             const minuteKey = minuteKeys[index];
// //             const minuteData = minuteMap[minuteKey];

// //             const sub = subscriptions[socket.id]?.tags[tag.id];
// //             if (!sub) return;

// //             // DIRECT → LAST record of minute
// //             if (sub.mode === "direct") {

// //               socket.emit(tag.id, minuteData.last);

// //             }

// //             // BATCH → FIRST record of minute
// //             if (sub.mode === "batch") {

// //               const batchKey = sub.key || "default";
// //               socket.emit(batchKey, [minuteData.first]);

// //             }

// //             index++;
// //             if (index >= minuteKeys.length) {
// //               index = 0; // loop
// //             }

// //           },30000); // 🔥 Every 1 minute

// //         }

// //       } catch (err) {
// //         console.error("JOIN_ROOM ERROR:", err);
// //       }

// //     });

// //     // =============================================
// //     // UNSUBSCRIBE
// //     // =============================================
// //     socket.on("unsubscribe_tags", (tagIds = []) => {

// //       tagIds.forEach(tagId => {

// //         delete subscriptions[socket.id]?.tags[tagId];

// //         if (socket.tagIntervals[tagId]) {
// //           clearInterval(socket.tagIntervals[tagId]);
// //           delete socket.tagIntervals[tagId];
// //         }
// //       });

// //     });

// //     // =============================================
// //     // DISCONNECT
// //     // =============================================
// //     socket.on("disconnect", () => {

// //       if (socket.tagIntervals) {
// //         Object.values(socket.tagIntervals).forEach(clearInterval);
// //       }

// //       delete subscriptions[socket.id];

// //       console.log("Client disconnected:", socket.id);
// //     });

// //   });
// // };

// const mongoose = require("mongoose");
// const { TagHistory } = require("../../models/mongoDB/tags/tagsModel");

// module.exports = function liveDataHandler(liveNamespace) {

//   console.log("/live-data namespace mounted");

//   const subscriptions = {};

//   liveNamespace.on("connection", (socket) => {

//     console.log("Client connected:", socket.id);

//     subscriptions[socket.id] = {
//       tags: {},
//       minuteMaps: {},
//       minuteKeys: {},
//       pointers: {}
//     };

//     // =============================================
//     socket.on("configure_batching", () => {
//       console.log("Batch config ignored");
//     });

//     // =============================================
//     socket.on("join_room", async (payload) => {

//       try {

//         const { room, tags } = payload;
//         if (!room || !Array.isArray(tags)) return;

//         socket.join(room);

//         const searchStartUTC = new Date("2026-02-20T18:30:00.000Z");
//         const searchEndUTC   = new Date("2026-02-21T18:29:59.000Z");

//         for (const tag of tags) {

//           const tagObjectId = new mongoose.Types.ObjectId(tag.id);

//           const historyDocs = await TagHistory.find({
//             tag_id: tagObjectId,
//             timestamp: { $gte: searchStartUTC, $lte: searchEndUTC }
//           }).sort({ timestamp: 1 });

//           if (!historyDocs.length) continue;

//           const minuteMap = {};

//           historyDocs.forEach(doc => {

//             const d = new Date(doc.timestamp);
//             const minuteKey =
//               d.getUTCHours() * 60 + d.getUTCMinutes();

//             if (!minuteMap[minuteKey]) {
//               minuteMap[minuteKey] = {
//                 first: doc,
//                 last: doc
//               };
//             } else {
//               minuteMap[minuteKey].last = doc;
//             }
//           });

//           const minuteKeys = Object.keys(minuteMap)
//             .map(Number)
//             .sort((a, b) => a - b);

//           if (!minuteKeys.length) continue;

//           //  START FROM CURRENT UTC MINUTE
//           const now = new Date();
//           const currentUTCMinute =
//             now.getUTCHours() * 60 + now.getUTCMinutes();

//           let startIndex =
//             minuteKeys.findIndex(m => m >= currentUTCMinute);

//           if (startIndex === -1) startIndex = 0;

//           // subscriptions[socket.id].tags[tag.id] = {
//           //   mode: tag.mode || "direct",
//           //   key: tag.key || "default"
//           // };

//           if (!subscriptions[socket.id].tags[tag.id]) {
//   subscriptions[socket.id].tags[tag.id] = [];
// }

// subscriptions[socket.id].tags[tag.id].push({
//   mode: tag.mode || "direct",
//   key: tag.key || "default"
// });

//           subscriptions[socket.id].minuteMaps[tag.id] = minuteMap;
//           subscriptions[socket.id].minuteKeys[tag.id] = minuteKeys;
//           subscriptions[socket.id].pointers[tag.id] = startIndex;
//         }

//         //  START ONLY ONE MASTER INTERVAL
//         if (!socket.masterInterval) {

//           socket.masterInterval = setInterval(() => {

//             const sub = subscriptions[socket.id];
//             if (!sub) return;

//             Object.keys(sub.tags).forEach(tagId => {

//               const minuteMap  = sub.minuteMaps[tagId];
//               const minuteKeys = sub.minuteKeys[tagId];
//               let pointer      = sub.pointers[tagId];

//               if (!minuteKeys?.length) return;

//               const minuteKey  = minuteKeys[pointer];
//               const minuteData = minuteMap[minuteKey];
//               // const tagSub     = sub.tags[tagId];

//               // if (tagSub.mode === "direct") {
//               //   socket.emit(tagId, minuteData.last);
//               // }

//               // if (tagSub.mode === "batch") {
//               //   socket.emit(tagSub.key, [minuteData.first]);
//               // }

//               const tagSubs = sub.tags[tagId];

// tagSubs.forEach(tagSub => {

//   if (tagSub.mode === "direct") {
//     socket.emit(tagId, minuteData.last);
//   }

//   if (tagSub.mode === "batch") {
//     socket.emit(tagSub.key, [minuteData.first]);
//   }

// });

//               pointer++;
//               if (pointer >= minuteKeys.length) {
//                 pointer = 0;
//               }

//               sub.pointers[tagId] = pointer;

//             });

//           }, 1000); //  SAME 1 sec for ALL tags
//         }

//       } catch (err) {
//         console.error("JOIN_ROOM ERROR:", err);
//       }

//     });

//     // =============================================
//     socket.on("disconnect", () => {

//       if (socket.masterInterval) {
//         clearInterval(socket.masterInterval);
//       }

//       delete subscriptions[socket.id];

//       console.log("Client disconnected:", socket.id);
//     });

//   });
// };

// const Asset = require("../../models/mongoDB/tags/assetTagsModel");
// const {TagHistory,TagLive} = require("../../models/mongoDB/tags/tagsModel");
// const batchConfig = { default: { frequency: 500, maxSize: 100 } };
// const batchTimers = {}; // batchKey -> lastEmitTime
// const mongoose = require("mongoose");

// const { startDBLiveEmitter } = require("./liveDataDbEmitter");

// module.exports = function liveDataHandler(liveNamespace) {
//   console.log(" /live-data namespace mounted");

//   // const batchConfig = { default: { frequency: 500, maxSize: 100 } };
//   const subscriptions = {}; // socketId -> { room, tags: { tagId: { mode, key } } }
//   const systemState = {}; // Stores latest value for each tag

//   // const subscriptions = {};

//   liveNamespace.on("connection", (socket) => {
//     console.log(" Client connected:", socket.id);

//     // subscriptions[socket.id] ||= { socket, tags: {} }; // store socket ref

//     socket.aiLastState = {};
//     subscriptions[socket.id] ||= { socket, tags: {}, ai: false };

//     // =====================================================
//     // ================= RAW WS (POSTMAN) =================
//     // =====================================================
//     // socket.on("message", async (msg) => {
//     //   socket.on("message", async(msg) => {
//     //   console.log("POSTMAN MSG:", msg);

//     //   try {
//     //     const parsed = typeof msg === "string" ? JSON.parse(msg) : msg;

//     //     if (parsed.event === "subscribe_ai_tags") {
//     //       subscriptions[socket.id].ai = true;
//     //       console.log("SUBSCRIBE HIT");

//     //       const db = mongoose.connection.db;
//     //       const aiDocs = await db.collection("aiTagData").find({}).toArray();

//     //       for (const doc of aiDocs) {
//     //         const payload = {
//     //           id: doc.tagName,
//     //           val: doc.val,
//     //           timestamp: doc.timestamp,
//     //           health: true,
//     //           isForecasted: doc.isForecasted,
//     //           latestTimestamp: doc.latestTimestamp,
//     //         };

//     //         socket.emit("ai_tag_update", payload);

//     //         // if (socket.conn?.transport?.socket) {
//     //         //   socket.conn.transport.socket.send(
//     //         //     JSON.stringify({ type: "ai_tag_update", data: payload })
//     //         //   );
//     //         // }

//     //         socket.aiLastState[doc.tagName] = JSON.stringify(doc.val);
//     //       }
//     //     }

//     //   } catch (e) {
//     //     console.log("Invalid WS message");
//     //   }
//     // });

//     // JWT bypass for testing
//     socket.userId = "TEST_USER";
//     socket.businessUnit = "TEST_BU";
//     socket.isSuperAdmin = true;
//     socket.department = "TEST_DEPT";

//     // subscriptions[socket.id] ||= { tags: {} };

//     socket.on("configure_batching", (configs = []) => {
//       configs.forEach((cfg) => {
//         console.log("cfg",configs);
//         if (!cfg.id) return;

//         batchConfig[cfg.id] = {
//           frequency: cfg.frequency || 500,
//           maxSize: cfg.maxSize || 100,
//         };
//       });

//       console.log("Batch Config Updated:", batchConfig);
//     });

//     // ----------------------------
//     // ADD TAGS
//     // ----------------------------
//     // socket.on("add_tags", async ({ tags = [], assetName }) => {
//     //   if (!assetName) return console.error("Asset name not provided");

//     //   const asset = await Asset.findOne({ name: assetName });
//     //   if (!asset) return console.error("Asset not found:", assetName);

//     //   const newlyAdded = [];

//     //   for (const tagObj of tags) {
//     //     const { tagname, minValue = 0, maxValue = 100,unit = "" } = tagObj;
//     //     systemState[tagname] ||= 0; // init system state

//     //     let dbTag = await Tag.findOne({ tagname });

//     //     if (!dbTag) {
//     //       dbTag = new Tag({
//     //         tagname,
//     //         latestValue: (
//     //           minValue +
//     //           Math.random() * (maxValue - minValue)
//     //         ).toFixed(3),
//     //         unit,
//     //         datatype: "REAL",
//     //         assetId: [asset._id],
//     //         isActive: true,
//     //         plcName: "DEFAULT_PLC",
//     //         ranges: { minValue, maxValue },
//     //         updatedAt: new Date(),
//     //       });
//     //       await dbTag.save();
//     //       newlyAdded.push(tagname);
//     //     } else {
//     //       if (!Array.isArray(dbTag.assetId))
//     //         dbTag.assetId = dbTag.assetId ? [dbTag.assetId] : [];
//     //       if (!dbTag.assetId.includes(asset._id)) dbTag.assetId.push(asset._id);
//     //       if (unit) dbTag.unit = unit;
//     //       dbTag.updatedAt = new Date();
//     //       await dbTag.save();
//     //       newlyAdded.push(tagname);
//     //     }
//     //   }

//     //   socket.emit("tags_added", { assetName, addedTags: newlyAdded });
//     //   console.log(`Added tags for asset ${assetName}:`, newlyAdded);
//     // });

//     socket.on("add_tags", async ({ tags = [] }) => {
//   try {
//     const newlyAdded = [];

//     for (const tagObj of tags) {
//       const {
//         tagname,
//         minValue = 0,
//         maxValue = 100,
//         unit = ""
//       } = tagObj;

//       systemState[tagname] ||= 0;

//       let dbTag = await TagMock.findOne({ tagname });

//       if (!dbTag) {
//         dbTag = new TagMock({
//           tagname,
//           latestValue: (
//             minValue + Math.random() * (maxValue - minValue)
//           ).toFixed(3),
//           unit,
//           datatype: "REAL",
//           isActive: true,
//           plcName: "DEFAULT_PLC",
//           ranges: { minValue, maxValue },
//           updatedAt: new Date(),
//           createdAt: new Date()
//         });

//         await dbTag.save();
//         newlyAdded.push(tagname);
//       } else {
//         // update existing
//         if (unit) dbTag.unit = unit;
//         dbTag.updatedAt = new Date();
//         await dbTag.save();
//         newlyAdded.push(tagname);
//       }
//     }

//     socket.emit("tags_added", { addedTags: newlyAdded });
//     console.log("Added tags:", newlyAdded);

//   } catch (err) {
//     console.error("Error adding tags:", err);
//   }
// });

//     // ----------------------------
//     // JOIN ROOM
//     // ----------------------------

//     //     socket.on("join_room", payload => {
//     //   const { room, tags } = payload;
//     //   if (!room || !Array.isArray(tags)) return;

//     //   socket.join(room);

//     //   // Initialize subscription for this socket
//     //   subscriptions[socket.id] ||= { room, tags: {} };

//     //   tags.forEach(t => {
//     //     // t.mode should be either "direct" or "batch"
//     //     // t.key is used only for batch mode
//     //     subscriptions[socket.id].tags[t.id] = {
//     //       mode: t.mode || "direct",   // default is direct
//     //       key: t.mode === "batch" ? t.key || "default" : undefined
//     //     };

//     //     // Initialize system state if not present
//     //     systemState[t.id] ||= 0;
//     //   });

//     //   console.log(" JOIN_ROOM STATE:", subscriptions[socket.id]);
//     // });

//     // socket.on("join_room", async (payload) => {
//     //   const { room, tags } = payload;
//     //   console.log("./../.",room,tags)
//     //   // if (!room || !Array.isArray(tags)) return;

//     //   // socket.join(room);

//     //   // // Initialize subscription for this socket
//     //   // subscriptions[socket.id] ||= { room, tags: {} };

//     //   // for (const t of tags) {
//     //   //   // Find tag by name to get the MongoDB _id

//     //   //   const tagDoc = await Tag.findOne({ _id: t.id });
//     //   //   if (!tagDoc) continue;
//     //   //   console.log("!!!!!", tagDoc);

//     //   //   const tagId = tagDoc._id.toString(); // use GUID instead of tagname

//     //   //   subscriptions[socket.id].tags[tagId] = {
//     //   //     mode: t.mode || "direct", // default is direct
//     //   //     key: t.mode === "batch" ? t.key || "default" : undefined,
//     //   //   };

//     //   //   // Initialize system state if not present
//     //   //   systemState[tagId] ||= 0;
//     //   // }

//     //   // console.log(" JOIN_ROOM STATE:", subscriptions[socket.id]);
//     // });

//     socket.on("join_room", async (payload) => {
//   try {
//     const { room, tags } = payload;

//     console.log("rooommmm", room, tags);

//     const history1 = await TagHistory.find().limit(5);
// console.log(history1);

//     // console.log("History data:", history1);

//   } catch (err) {
//     console.error("ERROR INSIDE JOIN:", err);
//   }
// });

// //       socket.join(room);

// //       const history1 = await TagHistory.find(
// //           // tag_id: new mongoose.Types.ObjectId(tagId),
// //           // timestamp: { $gte: startUTC, $lte: endUTC }
// //         );

// //         console.log("...",history1)

// // //       for (const tag of tags) {

// // //         const tagId = tag.id;
// // //         const mode = tag.mode;

// // //         const nowIST = new Date();
// // //         const startIST = new Date(nowIST);
// // //         startIST.setHours(0, 0, 0, 0);

// // //         const startUTC = istToUtc(startIST);
// // //         const endUTC = istToUtc(nowIST);

// // //         console.log("Querying between:", startUTC, endUTC);

// // //         const now = new Date();
// // //         const startOfDay = new Date(now);
// // // startOfDay.setHours(0, 0, 0, 0);

// // // const history = await TagHistory.find({
// // //   tag_id: new mongoose.Types.ObjectId(tagId),
// // //   timestamp: { $gte: startOfDay, $lte: now }
// // // }).sort({ timestamp: 1 });

// // // console.log("Now:", now);
// // // console.log("Start of Day:", startOfDay);
// // // console.log("History length:", history.length);

// // //         const history1 = await TagHistory.find({
// // //           tag_id: new mongoose.Types.ObjectId(tagId),
// // //           timestamp: { $gte: startUTC, $lte: endUTC }
// // //         }).sort({ timestamp: 1 });

// // //         console.log("History length:", history1.length);

// // //         if (!history1.length) continue;

// // //         const streamKey = `${socket.id}_${tagId}`;

// // //         let index = 0;

// // //         replayStreams[streamKey] = setInterval(() => {

// // //           if (index >= history1.length) {
// // //             clearInterval(replayStreams[streamKey]);
// // //             return;
// // //           }

// // //           socket.emit("tagData", {
// // //             tagId,
// // //             value: history1[index].value,
// // //             timestamp: history1[index].timestamp,
// // //             mode
// // //           });

// // //           index++;

// // //         }, 1000);
// // //       }
// //     });

//     // ----------------------------
//     // CONTINUOUS EMISSION LOOP
//     // ----------------------------

//     setInterval(async () => {
//       const now = new Date().toISOString();

//       const db = mongoose.connection.db;
//       const aiDocs = await db.collection("aiTagData").find({}).toArray();

//       for (const clientSocket of liveNamespace.sockets.values()) {
//         const sub = subscriptions[clientSocket.id];
//         if (!sub) continue;

//       // for (const socket of liveNamespace.sockets.values()) {
//       //   const sub = subscriptions[socket.id];
//       //   if (!sub || !sub.tags) continue;

//         const batchBuckets = {};

//         for (const [tagId, cfg] of Object.entries(sub.tags)) {
//           // const tagDoc = await Tag.findOne({ tagname: tagId });
//           const tagDoc = await Tag.findById(tagId);
//           if (!tagDoc || !tagDoc.ranges) continue;

//           const min = Number(tagDoc.ranges.minValue);
//           const max = Number(tagDoc.ranges.maxValue);

//           const value = Number((min + Math.random() * (max - min)).toFixed(3));

//           tagDoc.latestValue = value;
//           tagDoc.updatedAt = new Date();
//           await tagDoc.save();

//           const payload = {
//             // id: tagId,
//             id: tagDoc._id.toString(),
//             val: value,
//             health: true,
//             timestamp: now,
//           };

//           if (cfg.mode === "direct") {
//             // socket.emit(tagId, payload);
//             // socket.emit(tagDoc._id.toString(), payload);
//             clientSocket.emit(tagDoc._id.toString(), payload); // This ensures each connected client receives its own emission during the loop.(this is added so that every client can listen to all events)
//           }

//           // if (cfg.mode === "batch") {
//           //   batchBuckets[cfg.key || "default"] ||= [];
//           //   batchBuckets[cfg.key || "default"].push(payload);
//           // }

//           if (cfg.mode === "batch") {
//             const batchKey = cfg.key || "default";
//             const config = batchConfig[batchKey] || batchConfig.default;

//             batchBuckets[batchKey] ||= [];
//             batchTimers[batchKey] ||= 0;

//             // SIZE CONTROL
//             if (batchBuckets[batchKey].length < config.maxSize) {
//               batchBuckets[batchKey].push(payload);
//             }

//             const nowTime = Date.now();

//             // TIME CONTROL
//             if (nowTime - batchTimers[batchKey] >= config.frequency) {
//               // socket.emit(batchKey, batchBuckets[batchKey]);
//               clientSocket.emit(batchKey, batchBuckets[batchKey]); // This ensures each connected client receives its own emission during the loop.(this is added so that every client can listen to all events)
//               batchBuckets[batchKey] = [];
//               batchTimers[batchKey] = nowTime;
//             }
//           }
//         }

//         // for (const [key, arr] of Object.entries(batchBuckets)) {
//         //   socket.emit(key, arr);
//         // }

//         // ---------------- AI TAGS ----------------
//         // if (sub.ai) {
//           // for (const doc of aiDocs) {
//           //   const currentStr = JSON.stringify(doc.val);
//           //   const lastStr = clientSocket.aiLastState[doc.tagName];

//           //   if (!lastStr || currentStr !== lastStr) {
//           //     const payload = {
//           //       id: doc.tagName,
//           //       val: doc.val,
//           //       timestamp: doc.timestamp,
//           //       health: true,
//           //       isForecasted: doc.isForecasted,
//           //       latestTimestamp: doc.latestTimestamp,
//           //     };

//           //     clientSocket.emit("ai_tag_update", payload);

//           //     if (clientSocket.conn?.transport?.socket) {
//           //       clientSocket.conn.transport.socket.send(
//           //         JSON.stringify({ type: "ai_tag_update", data: payload })
//           //       );
//           //     }

//           //     clientSocket.aiLastState[doc.tagName] = currentStr;
//           //   }
//           // }
//         // } (if you want to subscribe then get data for ai uncomment if(sub.ai))
//       }
//     }, 500);

//     // ----------------------------
//     // DISCONNECT
//     // ----------------------------
//     socket.on("disconnect", () => {
//       delete subscriptions[socket.id];
//       console.log(` Client disconnected: ${socket.id}`);
//     });
//   });
//   // Start DB emitter and give it access to subscriptions
//   startDBLiveEmitter(liveNamespace, subscriptions);
// };

// const mongoose = require("mongoose");
// const { TagHistory } = require("../../models/mongoDB/tags/tagsModel");

// module.exports = function liveDataHandler(liveNamespace) {

//   console.log("/live-data namespace mounted");

//   const batchConfig = { default: { frequency: 500, maxSize: 100 } };
//   const subscriptions = {}; // socketId -> { tags }

//   liveNamespace.on("connection", (socket) => {

//     console.log("Client connected:", socket.id);

//     subscriptions[socket.id] = { tags: {} };

//     // =====================================================
//     // CONFIGURE BATCHING
//     // =====================================================
//     socket.on("configure_batching", (configs = []) => {

//       configs.forEach(cfg => {
//         if (!cfg.id) return;

//         batchConfig[cfg.id] = {
//           frequency: cfg.frequency || 500,
//           maxSize: cfg.maxSize || 100
//         };
//       });

//       console.log("Updated batchConfig:", batchConfig);
//     });

//     // =====================================================
//     // JOIN ROOM
//     // =====================================================
//     socket.on("join_room", async (payload) => {

//       try {

//         const { room, tags } = payload;

//         if (!room || !Array.isArray(tags)) return;

//         socket.join(room);

//         console.log("JOIN ROOM:", room, tags);

//         // Store subscription
//         tags.forEach(t => {
//           subscriptions[socket.id].tags[t.id] = {
//             mode: t.mode || "direct",
//             key: t.key || "default"
//           };
//         });

//         // Current IST
//         const nowIST = new Date();

//         // Convert IST → UTC
//         const nowUTC = new Date(nowIST.getTime() - (5.5 * 60 * 60 * 1000));

//         // Allow +30 sec forward search
//         const searchEndUTC = new Date(nowUTC.getTime() + 30 * 1000);

//         console.log("Searching history between:", nowUTC, searchEndUTC);

//         for (const tag of tags) {

//           const tagObjectId = new mongoose.Types.ObjectId(tag.id);

//           // Fetch next 60 seconds of data
//           const historyDocs = await TagHistory.find({
//             tag_id: tagObjectId,
//             timestamp: { $gte: nowUTC, $lte: searchEndUTC }
//           })
//           .sort({ timestamp: 1 })
//           .limit(60);

//           if (!historyDocs.length) {
//             console.log("No history found for:", tag.id);
//             continue;
//           }

//           let index = 0;

//           const interval = setInterval(() => {

//             if (index >= historyDocs.length) {
//               clearInterval(interval);
//               return;
//             }

//             const doc = historyDocs[index];

//             const emitPayload = {
//               id: tag.id,
//               val: doc.value, // change if your field name differs
//               timestamp: doc.timestamp,
//               health: true
//             };

//             const sub = subscriptions[socket.id]?.tags[tag.id];
//             if (!sub) return;

//             // ================= DIRECT =================
//             if (sub.mode === "direct") {
//               socket.emit(tag.id, emitPayload);
//             }

//             // ================= BATCH =================
//             if (sub.mode === "batch") {

//               const batchKey = sub.key || "default";
//               const config = batchConfig[batchKey] || batchConfig.default;

//               if (!socket.batchStore) socket.batchStore = {};
//               if (!socket.batchTimers) socket.batchTimers = {};

//               socket.batchStore[batchKey] ||= [];
//               socket.batchTimers[batchKey] ||= Date.now();

//               socket.batchStore[batchKey].push(emitPayload);

//               const now = Date.now();

//               if (
//                 socket.batchStore[batchKey].length >= config.maxSize ||
//                 now - socket.batchTimers[batchKey] >= config.frequency
//               ) {
//                 socket.emit(batchKey, socket.batchStore[batchKey]);
//                 socket.batchStore[batchKey] = [];
//                 socket.batchTimers[batchKey] = now;
//               }
//             }

//             index++;

//           }, 1000); // emit every second

//         }

//       } catch (err) {
//         console.error("JOIN_ROOM ERROR:", err);
//       }

//     });

//     // =====================================================
//     // DISCONNECT
//     // =====================================================
//     socket.on("disconnect", () => {
//       delete subscriptions[socket.id];
//       console.log("Client disconnected:", socket.id);
//     });

//   });
// };

// const mongoose = require("mongoose");
// const { TagHistory } = require("../../models/mongoDB/tags/tagsModel");

// module.exports = function liveDataHandler(liveNamespace) {

//   console.log("/live-data namespace mounted");

//   // ================================
//   // BATCH CONFIG DEFAULT
//   // ================================
//   const batchConfig = {
//     default: { frequency: 500, maxSize: 100 }
//   };

//   // socketId -> { tags: { tagId: { mode, key } } }
//   const subscriptions = {};

//   liveNamespace.on("connection", (socket) => {

//     console.log("Client connected:", socket.id);

//     subscriptions[socket.id] = { tags: {} };

//     // =============================================
//     // CONFIGURE BATCHING
//     // =============================================
//     socket.on("configure_batching", (configs = []) => {

//       configs.forEach(cfg => {
//         if (!cfg.id) return;

//         batchConfig[cfg.id] = {
//           frequency: cfg.frequency || 500,
//           maxSize: cfg.maxSize || 100
//         };
//       });

//       console.log("Updated batchConfig:", batchConfig);
//     });

//     // =============================================
//     // JOIN ROOM (START STREAMING)
//     // =============================================
//     socket.on("join_room", async (payload) => {

//       try {

//         const { room, tags } = payload;

//         if (!room || !Array.isArray(tags)) return;

//         socket.join(room);

//         console.log("JOIN ROOM:", room);

//         // Store subscriptions
//         tags.forEach(t => {
//           subscriptions[socket.id].tags[t.id] = {
//             mode: t.mode || "direct",
//             key: t.key || "default"
//           };
//         });

//         // =============================================
//         // FIXED DB RANGE (Your Data Range)
//         // =============================================
//         const searchStartUTC = new Date("2026-02-20T18:30:00.000Z");
//         const searchEndUTC   = new Date("2026-02-21T18:29:59.000Z");

//         console.log("Searching history between:", searchStartUTC, searchEndUTC);

//         for (const tag of tags) {

//           const tagObjectId = new mongoose.Types.ObjectId(tag.id);

//           const historyDocs = await TagHistory.find({
//             tag_id: tagObjectId,
//             timestamp: { $gte: searchStartUTC, $lte: searchEndUTC }
//           })
//           .sort({ timestamp: 1 });

//           if (!historyDocs.length) {
//             console.log("No history found for:", tag.id);
//             continue;
//           }

//           let index = 0;

//           // Store interval reference
//           if (!socket.tagIntervals) socket.tagIntervals = {};

//           // Clear previous interval if exists
//           if (socket.tagIntervals[tag.id]) {
//             clearInterval(socket.tagIntervals[tag.id]);
//           }

//           socket.tagIntervals[tag.id] = setInterval(() => {

//             // Stop if unsubscribed
//             if (!subscriptions[socket.id]?.tags[tag.id]) {
//               clearInterval(socket.tagIntervals[tag.id]);
//               delete socket.tagIntervals[tag.id];
//               return;
//             }

//             const doc = historyDocs[index];

//             const emitPayload = {
//               id: tag.id,
//               val: doc.value,
//               timestamp: doc.timestamp,
//               health: true
//             };

//             const sub = subscriptions[socket.id]?.tags[tag.id];
//             if (!sub) return;

//             // ================= DIRECT MODE =================
//             if (sub.mode === "direct") {
//               socket.emit(tag.id, emitPayload);
//             }

//             // ================= BATCH MODE =================
//             if (sub.mode === "batch") {

//               const batchKey = sub.key || "default";
//               const config = batchConfig[batchKey] || batchConfig.default;

//               if (!socket.batchStore) socket.batchStore = {};
//               if (!socket.batchTimers) socket.batchTimers = {};

//               socket.batchStore[batchKey] ||= [];
//               socket.batchTimers[batchKey] ||= Date.now();

//               socket.batchStore[batchKey].push(emitPayload);

//               const now = Date.now();

//               if (
//                 socket.batchStore[batchKey].length >= config.maxSize ||
//                 now - socket.batchTimers[batchKey] >= config.frequency
//               ) {
//                 socket.emit(batchKey, socket.batchStore[batchKey]);
//                 socket.batchStore[batchKey] = [];
//                 socket.batchTimers[batchKey] = now;
//               }
//             }

//             index++;

//             // 🔁 Loop replay when finished
//             if (index >= historyDocs.length) {
//               index = 0;
//             }

//           }, 1000); // Emit every second
//         }

//       } catch (err) {
//         console.error("JOIN_ROOM ERROR:", err);
//       }

//     });

//     // =============================================
//     // UNSUBSCRIBE TAGS
//     // =============================================
//     socket.on("unsubscribe_tags", (tagIds = []) => {

//       tagIds.forEach(tagId => {

//         delete subscriptions[socket.id]?.tags[tagId];

//         if (socket.tagIntervals?.[tagId]) {
//           clearInterval(socket.tagIntervals[tagId]);
//           delete socket.tagIntervals[tagId];
//         }

//       });

//     });

//     // =============================================
//     // DISCONNECT
//     // =============================================
//     socket.on("disconnect", () => {

//       // Clear all intervals
//       if (socket.tagIntervals) {
//         Object.values(socket.tagIntervals).forEach(interval => {
//           clearInterval(interval);
//         });
//       }

//       delete subscriptions[socket.id];

//       console.log("Client disconnected:", socket.id);
//     });

//   });
// };

// const mongoose = require("mongoose");
// const { TagHistory } = require("../../models/mongoDB/tags/tagsModel");

// module.exports = function liveDataHandler(liveNamespace) {

//   console.log("/live-data namespace mounted");

//   const batchConfig = {
//     default: { frequency: 500, maxSize: 100 }
//   };

//   const subscriptions = {};

//   liveNamespace.on("connection", (socket) => {

//     console.log("Client connected:", socket.id);

//     subscriptions[socket.id] = { tags: {} };

//     socket.tagIntervals = {};
//     socket.batchIntervals = {};
//     socket.batchStore = {};

//     // =============================================
//     // CONFIGURE BATCHING
//     // =============================================
//     socket.on("configure_batching", (configs = []) => {

//       configs.forEach(cfg => {
//         if (!cfg.id) return;

//         batchConfig[cfg.id] = {
//           frequency: cfg.frequency || 500,
//           maxSize: cfg.maxSize || 100
//         };
//       });

//       console.log("Updated batchConfig:", batchConfig);
//     });

//     // =============================================
//     // JOIN ROOM
//     // =============================================
//     socket.on("join_room", async (payload) => {

//       try {

//         const { room, tags } = payload;
//         if (!room || !Array.isArray(tags)) return;

//         socket.join(room);
//         console.log("JOIN ROOM:", room);

//         tags.forEach(t => {
//           subscriptions[socket.id].tags[t.id] = {
//             mode: t.mode || "direct",
//             key: t.key || "default"
//           };
//         });

//         // Your available DB range
//         const searchStartUTC = new Date("2026-02-20T18:30:00.000Z");
//         const searchEndUTC   = new Date("2026-02-21T18:29:59.000Z");

//         for (const tag of tags) {

//           const tagObjectId = new mongoose.Types.ObjectId(tag.id);

//           const historyDocs = await TagHistory.find({
//             tag_id: tagObjectId,
//             timestamp: { $gte: searchStartUTC, $lte: searchEndUTC }
//           }).sort({ timestamp: 1 });

//           if (!historyDocs.length) {
//             console.log("No history found for:", tag.id);
//             continue;
//           }

//           // Convert DB timestamps to seconds-of-day (UTC)
//           const docsWithSeconds = historyDocs.map(doc => {
//             const d = new Date(doc.timestamp);
//             const seconds =
//               d.getUTCHours() * 3600 +
//               d.getUTCMinutes() * 60 +
//               d.getUTCSeconds();

//             return { ...doc.toObject(), seconds };
//           });

//           // Current UTC time-of-day
//           const now = new Date();
//           const currentUTCSeconds =
//             now.getUTCHours() * 3600 +
//             now.getUTCMinutes() * 60 +
//             now.getUTCSeconds();

//           // Find correct starting index
//           let index = docsWithSeconds.findIndex(
//             d => d.seconds >= currentUTCSeconds
//           );

//           if (index === -1) index = 0;

//           // Clear previous interval if exists
//           if (socket.tagIntervals[tag.id]) {
//             clearInterval(socket.tagIntervals[tag.id]);
//           }

//           // =============================================
//           // MAIN 1-SECOND STREAM
//           // =============================================
//           socket.tagIntervals[tag.id] = setInterval(() => {

//             if (!subscriptions[socket.id]?.tags[tag.id]) {
//               clearInterval(socket.tagIntervals[tag.id]);
//               delete socket.tagIntervals[tag.id];
//               return;
//             }

//             const doc = docsWithSeconds[index];

//             const emitPayload = {
//               id: tag.id,
//               val: doc.value,
//               timestamp: doc.timestamp,
//               health: true
//             };

//             const sub = subscriptions[socket.id]?.tags[tag.id];
//             if (!sub) return;

//             // ================= DIRECT =================
//             if (sub.mode === "direct") {
//               socket.emit(tag.id, emitPayload);
//             }

//             // ================= BATCH =================
//             if (sub.mode === "batch") {

//               const batchKey = sub.key || "default";
//               const config = batchConfig[batchKey] || batchConfig.default;

//               socket.batchStore[batchKey] ||= [];
//               socket.batchStore[batchKey].push(emitPayload);

//               // Create batch interval once
//               if (!socket.batchIntervals[batchKey]) {

//                 socket.batchIntervals[batchKey] = setInterval(() => {

//                   const data = socket.batchStore[batchKey];

//                   if (data && data.length > 0) {
//                     socket.emit(batchKey, data);
//                     socket.batchStore[batchKey] = [];
//                   }

//                 }, config.frequency);
//               }

//               // Immediate flush if maxSize reached
//               if (socket.batchStore[batchKey].length >= config.maxSize) {
//                 socket.emit(batchKey, socket.batchStore[batchKey]);
//                 socket.batchStore[batchKey] = [];
//               }
//             }

//             index++;

//             // Loop when finished
//             if (index >= docsWithSeconds.length) {
//               index = 0;
//             }

//           }, 1000);
//         }

//       } catch (err) {
//         console.error("JOIN_ROOM ERROR:", err);
//       }

//     });

//     // =============================================
//     // UNSUBSCRIBE
//     // =============================================
//     socket.on("unsubscribe_tags", (tagIds = []) => {

//       tagIds.forEach(tagId => {

//         delete subscriptions[socket.id]?.tags[tagId];

//         if (socket.tagIntervals[tagId]) {
//           clearInterval(socket.tagIntervals[tagId]);
//           delete socket.tagIntervals[tagId];
//         }
//       });
//     });

//     // =============================================
//     // DISCONNECT
//     // =============================================
//     socket.on("disconnect", () => {

//       if (socket.tagIntervals) {
//         Object.values(socket.tagIntervals).forEach(clearInterval);
//       }

//       if (socket.batchIntervals) {
//         Object.values(socket.batchIntervals).forEach(clearInterval);
//       }

//       delete subscriptions[socket.id];

//       console.log("Client disconnected:", socket.id);
//     });

//   });
// };

// const mongoose = require("mongoose");
// const { TagHistory } = require("../../models/mongoDB/tags/tagsModel");

// module.exports = function liveDataHandler(liveNamespace) {

//   console.log("/live-data namespace mounted");

//   const subscriptions = {};

//   liveNamespace.on("connection", (socket) => {

//     console.log("Client connected:", socket.id);

//     subscriptions[socket.id] = { tags: {} };
//     socket.tagIntervals = {};

//     // =============================================
//     // IGNORE BATCH CONFIG
//     // =============================================
//     socket.on("configure_batching", () => {
//       console.log("Batch config ignored (1 record per minute mode)");
//     });

//     // =============================================
//     // JOIN ROOM
//     // =============================================
//     socket.on("join_room", async (payload) => {

//       try {

//         const { room, tags } = payload;
//         if (!room || !Array.isArray(tags)) return;

//         socket.join(room);

//         tags.forEach(t => {
//           subscriptions[socket.id].tags[t.id] = {
//             mode: t.mode || "direct",
//             key: t.key || "default"
//           };
//         });

//         const searchStartUTC = new Date("2026-02-20T18:30:00.000Z");
//         const searchEndUTC   = new Date("2026-02-21T18:29:59.000Z");

//         for (const tag of tags) {

//           const tagObjectId = new mongoose.Types.ObjectId(tag.id);

//           const historyDocs = await TagHistory.find({
//             tag_id: tagObjectId,
//             timestamp: { $gte: searchStartUTC, $lte: searchEndUTC }
//           }).sort({ timestamp: 1 });

//           if (!historyDocs.length) continue;

//           // 🔥 Group by minute
//           const minuteMap = {};

//           historyDocs.forEach(doc => {

//             const d = new Date(doc.timestamp);
//             const minuteKey =
//               d.getUTCHours() * 60 + d.getUTCMinutes();

//             if (!minuteMap[minuteKey]) {
//               minuteMap[minuteKey] = {
//                 first: doc,   // for batch
//                 last: doc     // for direct
//               };
//             } else {
//               minuteMap[minuteKey].last = doc;
//             }
//           });

//           const minuteKeys = Object.keys(minuteMap)
//             .map(Number)
//             .sort((a, b) => a - b);

//           if (!minuteKeys.length) continue;

//           // 🔥 Start from current UTC minute
//           const now = new Date();
//           const currentUTCMinute =
//             now.getUTCHours() * 60 + now.getUTCMinutes();

//           let index = minuteKeys.findIndex(m => m >= currentUTCMinute);
//           if (index === -1) index = 0;

//           // Clear previous interval
//           if (socket.tagIntervals[tag.id]) {
//             clearInterval(socket.tagIntervals[tag.id]);
//           }

//           // =============================================
//           // 🔥 EMIT ONE RECORD PER MINUTE
//           // =============================================
//           socket.tagIntervals[tag.id] = setInterval(() => {

//             if (!subscriptions[socket.id]?.tags[tag.id]) {
//               clearInterval(socket.tagIntervals[tag.id]);
//               delete socket.tagIntervals[tag.id];
//               return;
//             }

//             const minuteKey = minuteKeys[index];
//             const minuteData = minuteMap[minuteKey];

//             const sub = subscriptions[socket.id]?.tags[tag.id];
//             if (!sub) return;

//             // DIRECT → LAST record of minute
//             if (sub.mode === "direct") {

//               socket.emit(tag.id, minuteData.last);

//             }

//             // BATCH → FIRST record of minute
//             if (sub.mode === "batch") {

//               const batchKey = sub.key || "default";
//               socket.emit(batchKey, [minuteData.first]);

//             }

//             index++;
//             if (index >= minuteKeys.length) {
//               index = 0; // loop
//             }

//           },30000); // 🔥 Every 1 minute

//         }

//       } catch (err) {
//         console.error("JOIN_ROOM ERROR:", err);
//       }

//     });

//     // =============================================
//     // UNSUBSCRIBE
//     // =============================================
//     socket.on("unsubscribe_tags", (tagIds = []) => {

//       tagIds.forEach(tagId => {

//         delete subscriptions[socket.id]?.tags[tagId];

//         if (socket.tagIntervals[tagId]) {
//           clearInterval(socket.tagIntervals[tagId]);
//           delete socket.tagIntervals[tagId];
//         }
//       });

//     });

//     // =============================================
//     // DISCONNECT
//     // =============================================
//     socket.on("disconnect", () => {

//       if (socket.tagIntervals) {
//         Object.values(socket.tagIntervals).forEach(clearInterval);
//       }

//       delete subscriptions[socket.id];

//       console.log("Client disconnected:", socket.id);
//     });

//   });
// };

// code commentedddddd

//

// function emitStream(socket) {

//     const sub = subscriptions[socket.id];
//     if (!sub) return;

//     Object.keys(sub.tags).forEach(tagId => {

//       const minuteMap = sub.minuteMaps[tagId];
//       const minuteKeys = sub.minuteKeys[tagId];
//       let pointer = sub.pointers[tagId];

//       if (!minuteMap || !minuteKeys?.length) return;

//       const minuteData = minuteMap[minuteKeys[pointer]];
//       if (!minuteData) return;

//       const doc = minuteData.last;
//       if (!doc) return;

//       const payload = {
//         id: doc.tag_id,
//         val: doc.value,
//         timestamp: doc.timestamp,
//         health: true
//       };

//       const tagSubs = sub.tags[tagId];

//       tagSubs.forEach(tagSub => {
//         socket.emit(
//           tagSub.mode === "batch" ? tagSub.key : tagId,
//           payload
//         );
//       });

//       pointer++;
//       if (pointer >= minuteKeys.length) pointer = 0;

//       sub.pointers[tagId] = pointer;

//     });
//   }

// function truckLiveWatcher(liveNamespace) {
//   console.log("Monitoring tag_lives every 5 seconds...");

//   setInterval(async () => {

//     const updatedDoc = await updateCounterFromStart();

//     if (!updatedDoc) return;

//     const newValue = updatedDoc.latestValue;
//     console.log("ooooo",updatedDoc)

//     console.log("L:L:L:::newValue", newValue,lastTruckValue)

//     // Emit ONLY if changed
//     if (newValue !== lastTruckValue) {

//       console.log("L:L:L:::inside emitttt")

//       lastTruckValue = newValue

//       liveNamespace.emit(
//         updatedDoc._id.toString(),
//         {
//           id: updatedDoc._id.toString(),
//           val: newValue,
//           timestamp: new Date(),
//           health: updatedDoc.health ?? true
//         }
//       );

//     //   socket.emit(updatedDoc._id.toString(), {
//     //   id: updatedDoc._id.toString(),
//     //   val: newValue,
//     //   timestamp: new Date(),
//     //   health: updatedDoc.health ?? true
//     // });

//       console.log("🚀 Truck counter emitted:", newValue);
//     }

//   }, 5000);
// }

// const mongoose = require("mongoose");
// const {TagHistory} = require("../../models/mongoDB/tags/tagsModel");
// const subscriptions = {};

// module.exports = function liveDataHandler(liveNamespace) {

//   console.log("/live-data namespace mounted");

//   liveNamespace.on("connection", (socket) => {

//     console.log("Client connected:", socket.id);

//     subscriptions[socket.id] = {
//       tags: {}, dataArrays: {}, isFetching: false, currentIndex: 0
//     };

//     socket.on("configure_batching", () => {
//       console.log("Batch config ignored");
//     });

//     socket.on("join_room", async (payload) => {

//       try {
//         let data = payload;
//         if (typeof payload === "string") {
//           try {
//             data = JSON.parse(payload);
//           } catch (e) {
//             console.error("Error parsing join_room payload:", e);
//             return;
//           }
//         }

//         const {room, tags} = data;
//         if (!room || !Array.isArray(tags)) return;

//         console.log(`[liveDataHandler] Client ${socket.id} joined room '${room}' with ${tags.length} tags.`);
//         socket.join(room);

//         const sub = subscriptions[socket.id];
//         sub.tags = {};
//         sub.dataArrays = {};

//         const mappedTags = [];
//         for (const tag of tags) {
//           if (!sub.tags[tag.id]) {
//             sub.tags[tag.id] = [];
//           }
//           sub.tags[tag.id].push({
//             mode: tag.mode || "direct", key: tag.key || tag.id
//           });
//           mappedTags.push(new mongoose.Types.ObjectId(tag.id));
//         }

//         // Global Playback Window Logic
//         const searchStartUTC = new Date("2026-02-20T18:30:00.000Z");
//         const searchEndUTC = new Date("2026-02-21T18:29:59.000Z");

//         const CHUNK_SIZE_SECONDS = 600; // 10 minutes exactly

//         sub.searchStartUTC = searchStartUTC;
//         sub.searchEndUTC = searchEndUTC;
//         sub.mappedTagIds = mappedTags;

//         sub.currentChunkStart = new Date(searchStartUTC.getTime());

//         let calcEnd = new Date(sub.currentChunkStart.getTime() + (CHUNK_SIZE_SECONDS * 1000) - 1);
//         if (calcEnd > searchEndUTC) calcEnd = new Date(searchEndUTC.getTime());
//         sub.currentChunkEnd = calcEnd;

//         await fetchAndCacheChunk(socket.id);

//         if (!subscriptions[socket.id]) return;

//         console.log(`[liveDataHandler] Socket ${socket.id} configured for sliding timeframe playback.`);

//         // 🔥 START STREAMING IMMEDIATELY
//         if (!socket.masterInterval) {
//           emitSecondStream(socket);

//           socket.masterInterval = setInterval(() => {
//             emitSecondStream(socket);
//           }, 1000);
//         }

//       } catch (err) {
//         console.error("JOIN_ROOM ERROR:", err);
//       }

//     });

//     socket.on("disconnect", () => {
//       if (socket.masterInterval) {
//         clearInterval(socket.masterInterval);
//       }
//       delete subscriptions[socket.id];
//       console.log("Client disconnected:", socket.id);
//     });

//   });
// };

// async function fetchAndCacheChunk(socketId) {
//   const sub = subscriptions[socketId];
//   if (!sub) return;
//   if (sub.isFetching) return;

//   sub.isFetching = true;

//   try {
//     const chunkStart = sub.currentChunkStart;
//     const chunkEnd = sub.currentChunkEnd;
//     const tagsIds = sub.mappedTagIds;
//     const durationMs = chunkEnd.getTime() - chunkStart.getTime() + 1; // E.g. usually 600,000ms
//     const totalDurationSeconds = Math.floor(durationMs / 1000) || 1; // Usually 600

//     console.log(`[liveDataHandler] Chunk-fetching DB from ${chunkStart.toISOString()} -> ${chunkEnd.toISOString()} (${totalDurationSeconds}s) for Socket ${socketId}...`);

//     // Only grab exactly what we need
//     const records = await TagHistory.find({
//       tag_id: {$in: tagsIds}, timestamp: {$gte: chunkStart, $lte: chunkEnd}
//     })
//       .sort({timestamp: 1})
//       .lean();

//     console.log(`[liveDataHandler] Found ${records.length} records for real-time playback window.`);

//     const freshDataArrays = {};

//     const secondMap = {};
//     for (const r of records) {
//       const tId = r.tag_id.toString();
//       if (!secondMap[tId]) secondMap[tId] = {};

//       const rTime = new Date(r.timestamp).getTime();
//       const sStart = chunkStart.getTime();
//       const secOffset = Math.floor((rTime - sStart) / 1000);

//       if (secOffset >= 0 && secOffset < totalDurationSeconds) {
//         secondMap[tId][secOffset] = r;
//       }
//     }

//     for (const objId of tagsIds) {
//       const tId = objId.toString();
//       const filledArray = new Array(totalDurationSeconds).fill(null);
//       let lastKnown = null;

//       for (let i = 0; i < totalDurationSeconds; i++) {
//         if (secondMap[tId] && secondMap[tId][i]) {
//           lastKnown = secondMap[tId][i];
//         }
//         filledArray[i] = lastKnown;
//       }

//       let carryOver = null;
//       if (sub.dataArrays[tId] && sub.dataArrays[tId].length > 0) {
//         carryOver = sub.dataArrays[tId][sub.dataArrays[tId].length - 1];
//       }

//       for (let i = 0; i < totalDurationSeconds; i++) {
//         if (filledArray[i] !== null) break;
//         if (carryOver) {
//           filledArray[i] = carryOver;
//         }
//       }

//       freshDataArrays[tId] = filledArray;
//     }

//     sub.dataArrays = freshDataArrays;
//     sub.currentIndex = 0;
//     sub.currentChunkDuration = totalDurationSeconds;

//   } catch (error) {
//     console.error(`[liveDataHandler] Error fetching sliding window chunk:`, error);
//   } finally {
//     sub.isFetching = false;
//   }
// }

// async function emitSecondStream(socket) {
//   const sub = subscriptions[socket.id];
//   if (!sub || !sub.tags || !sub.dataArrays) return;
//   if (sub.isFetching) return;

//   let currentIndex = sub.currentIndex;
//   let totalDur = sub.currentChunkDuration || 600;

//   if (currentIndex >= totalDur) {

//     const CHUNK_SIZE_SECONDS = 600;
//     let nextStartMs = sub.currentChunkEnd.getTime() + 1;

//     if (nextStartMs > sub.searchEndUTC.getTime()) {
//       console.log(`[liveDataHandler] Playback reached end of hardcoded duration (${sub.searchEndUTC.toISOString()}). Looping back to start...`);
//       nextStartMs = sub.searchStartUTC.getTime();
//     }

//     const nextStart = new Date(nextStartMs);
//     let nextEnd = new Date(nextStart.getTime() + (CHUNK_SIZE_SECONDS * 1000) - 1);

//     if (nextEnd > sub.searchEndUTC) {
//       nextEnd = new Date(sub.searchEndUTC.getTime());
//     }

//     sub.currentChunkStart = nextStart;
//     sub.currentChunkEnd = nextEnd;

//     fetchAndCacheChunk(socket.id);
//     return;
//   }

//   Object.keys(sub.tags).forEach(tagId => {

//     const dataArray = sub.dataArrays[tagId];
//     if (!dataArray) return;

//     const doc = dataArray[currentIndex];
//     if (!doc) return;

//     const payload = {
//       id: doc.tag_id.toString(), val: doc.value, timestamp: doc.timestamp, health: true
//     };

//     const tagSubs = sub.tags[tagId];
//     tagSubs.forEach(tagSub => {
//       socket.emit(tagSub.mode === "batch" ? tagSub.key : tagId, payload);
//     });

//   });

//   updateCounterFromStart();
//   sub.currentIndex = currentIndex + 1;
// }

// async function updateCounterFromStart() {

//   const sourceTagId = new mongoose.Types.ObjectId(
//     "69a00015028f2974fee4abdf"
//   );

//   const startDate = new Date("2026-02-20T18:30:00.000Z");
//   const endDate = new Date("2026-02-21T18:29:59.000Z");

//   const history = await TagHistory.find({
//     tag_id: sourceTagId,
//     timestamp: {
//       $gte: startDate,
//       $lte: endDate
//     }
//   }).sort({ timestamp: 1 });

//   console.log("Scanning from:", startDate);
//   console.log("Scanning till:", endDate);

//   let previousValue = 0;
//   let counter = 0;

//   // ⭐ System UTC time (HH:mm:ss)
//   const sysTime = new Date()
//     .toISOString()
//     .split("T")[1]
//     .substring(0, 8);

//   console.log("System time to match:", sysTime);

//   for (let record of history) {

//     const recordTime = new Date(record.timestamp)
//       .toISOString()
//       .split("T")[1]
//       .substring(0, 8);

//     const currentValue = Number(record.value);

//     // ✅ Rising edge detection
//     if (previousValue === 0 && currentValue === 1) {
//       counter++;
//       console.log(`Rising edge at ${recordTime} → Counter = ${counter}`);
//     }

//     // ✅ Check if record time matches system time → break and return counter
//     if (recordTime === sysTime) {
//       console.log(`MATCH FOUND at ${recordTime} → Counter = ${counter}`);
//       await TagLive.findOneAndUpdate(
//         { tagname: "ED_RCDI_Position_counts1" },
//         { $set: { latestValue: counter } },
//         { new: true }
//       );
//       console.log(`Saved latestValue = ${counter} to ED_RCDI_Position_counts1`);
//       return counter;
//     }

//     previousValue = currentValue;
//   }

//   console.log("No time match found. Final counter:", counter);
//   return counter;
// }
