// const {TagLive} = require("../../models/mongoDB/tags/tagsModel");
// let lastEmitted = {}; // track last emitted value per tag

// function startDBLiveEmitter(liveNamespace, subscriptions) {
//   console.log("Starting DB polling for live updates...");

//   setInterval(async () => {
//     try {
//       const tags = await TagLive.find({ isActive: true });

//       tags.forEach((tagDoc) => {
//         const lastValue = lastEmitted[tagDoc.tagname];

//         // Emit only if value changed
//         if (lastValue !== tagDoc.latestValue) {
//           const payload = {
//             id: tagDoc.tagname,
//             val: tagDoc.latestValue,
//             timestamp: tagDoc.updatedAt || new Date(),
//             health: tagDoc.health,
//             assetId: tagDoc.assetId,
//           };

//           // ---- Print in VS Code console ----
//           console.log(" EMITTING LIVE_DATA:", payload);

//           // ---- Emit to subscribed sockets ----
//           Object.values(subscriptions).forEach((sub) => {
//             if (!sub || !sub.tags) return;

//             const cfg = sub.tags[tagDoc.tagname];
//             if (!cfg) return;

//             if (cfg.mode === "direct") {
//               sub.socket.emit("live_data", payload);
//             }
//             // handle batch mode here if needed
//           });

//           lastEmitted[tagDoc.tagname] = tagDoc.latestValue;
//         }
//       });
//     } catch (err) {
//       console.error(" Error fetching tags from DB:", err.message);
//     }
//   }, 500);
// }

// module.exports = { startDBLiveEmitter };


// const { TagLive } = require("../../models/mongoDB/tags/tagsModel");

// let lastEmitted = {};
// let emitterInterval = null;

// function startDBLiveEmitter(liveNamespace, subscriptions) {

//   console.log("Starting DB polling for live updates...");

//   // ✅ Prevent multiple intervals
//   if (emitterInterval) return;

//   emitterInterval = setInterval(async () => {

//     try {

//       // ⭐ CHECK SUBSCRIPTIONS FIRST
//       let hasSubscriber = false;

//       for (const sub of Object.values(subscriptions)) {
//         if (sub?.tags && Object.keys(sub.tags).length > 0) {
//           hasSubscriber = true;
//           break;
//         }
//       }

//       // If nobody subscribed → skip DB polling
//       if (!hasSubscriber) return;

//       const tags = await TagLive.find({ isActive: true });

//       // for (const tagDoc of tags) {

//       //   const lastValue = lastEmitted[tagDoc.tagname];

//       //   if (lastValue !== tagDoc.latestValue) {

//       //     const payload = {
//       //       id: tagDoc.tagname,
//       //       val: tagDoc.latestValue,
//       //       timestamp: tagDoc.updatedAt || new Date(),
//       //       health: tagDoc.health,
//       //       assetId: tagDoc.assetId || [],
//       //     };

//       //     console.log(" EMITTING LIVE_DATA:", payload);

//       //     for (const sub of Object.values(subscriptions)) {

//       //       if (!sub?.tags) continue;

//       //       const cfg = sub.tags[tagDoc._id?.toString()];
//       //       if (!cfg) continue;

//       //       if (cfg.mode === "direct") {
//       //         sub.socket.emit("live_data", payload);
//       //       }

//       //     }

//       //     lastEmitted[tagDoc.tagname] = tagDoc.latestValue;
//       //   }
//       // }

//       for (const tagDoc of tags) {

//   const tagId = tagDoc._id.toString();
//   const lastValue = lastEmitted[tagId];

//   if (lastValue !== tagDoc.latestValue) {

//     const payload = {
//       id: tagId,
//       val: tagDoc.latestValue,
//       timestamp: tagDoc.updatedAt || new Date(),
//       health: tagDoc.health,
//       assetId: tagDoc.assetId || [],
//     };

//     console.log("EMITTING LIVE_DATA:", payload);

//     for (const sub of Object.values(subscriptions)) {
//       if (!sub?.tags) continue;

//       const cfg = sub.tags[tagId];
//       if (!cfg) continue;

//       if (cfg.mode === "direct") {
//         sub.socket.emit("live_data", payload);
//       }
//     }

//     lastEmitted[tagId] = tagDoc.latestValue;
//   }
// }

//     } catch (err) {
//       console.error(" Error fetching tags from DB:", err.message);
//     }

//   }, 2000);
// }

// module.exports = { startDBLiveEmitter };


const { TagLive } = require("../../models/mongoDB/tags/tagsModel");

let lastEmitted = {};
let emitterInterval = null;
// CR0028 Maintenance plan count increase
const watcherManagedTags = new Set([
  "69a2d5c599a6d75965a04e4c", // truck counter
  "69a93d6055b35dab3577b3b4", // setpoint deviation
  "69a04e1a1e5e302c5e7da956", // maintenance expired 
  "69a04dab9a054f2a74eb0622", // special live tag
  "69a04e37223184550e7a71d0", // special live tag
]);
// CR0028 Maintenance plan count increase

function startLiveDataDbEmitter(liveNamespace, subscriptions = {}) {
  console.log("Starting DB polling for live updates...");

  // Prevent multiple intervals
  if (emitterInterval) return;

  // Toggle fallback based on env
  // 🔥 Completely skip initializing the interval if socket forwarding is active
  if (process.env.USE_LIVE_SOCKET_FORWARDING === "true") {
    console.log("Skipping legacy DB polling interval (Pure M2M Socket Mode Active)");
    return;
  }

  emitterInterval = setInterval(async () => {
    try {
      //  Safety: if subscriptions missing
      if (!subscriptions || typeof subscriptions !== "object") return;

      //  Check if anyone subscribed
      let hasSubscriber = false;

      for (const sub of Object.values(subscriptions)) {
        if (sub?.tags && Object.keys(sub.tags).length > 0) {
          hasSubscriber = true;
          break;
        }
      }

      //  No subscribers → Skip DB polling
      if (!hasSubscriber) return;

      //  Fetch only active tags
      const tags = await TagLive.find({ isActive: true });

      for (const tagDoc of tags) {
        const tagId = tagDoc._id.toString();
        if (watcherManagedTags.has(tagId)) continue; // CR0028 Maintenance plan count increase
        const lastValue = lastEmitted[tagId];

        //  Emit only if value changed
        if (lastValue !== tagDoc.latestValue) {
          const payload = {
            id: tagId,
            val: tagDoc.latestValue,
            timestamp: tagDoc.updatedAt || new Date(),
            health: tagDoc.health,
            assetId: tagDoc.assetId || [],
          };

          // console.log("EMITTING LIVE_DATA:", payload);

          //  Emit to matching subscribers
          Object.entries(subscriptions).forEach(([subSocketId, sub]) => {
            if (!sub?.tags || !sub.tags[tagId]) return;

            const subSocket = liveNamespace.sockets.get(subSocketId);
            if (subSocket) {
              sub.tags[tagId].forEach((tagSub) => {
                const emitKey = tagSub.mode === "batch" ? tagSub.key : tagId;
                subSocket.emit(emitKey, payload);
              });
            }
          });

          //  Track last emitted value
          lastEmitted[tagId] = tagDoc.latestValue;
        }
      }
    } catch (err) {
      console.error("Error fetching tags from DB:", err.message);
    }
  }, 2000);
}

module.exports = { startLiveDataDbEmitter };