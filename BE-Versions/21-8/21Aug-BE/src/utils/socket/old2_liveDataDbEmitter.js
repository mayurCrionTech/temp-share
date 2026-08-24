const { TagLive } = require("../../models/mongoDB/tags/tagsModel");

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

  // Skip DB polling when socket forwarding is active
  if (process.env.USE_LIVE_SOCKET_FORWARDING === "true") {
    console.log(
      "Skipping legacy DB polling interval (Pure M2M Socket Mode Active)",
    );
    return;
  }

  emitterInterval = setInterval(async () => {
    try {
      // Safety: if subscriptions missing
      if (!subscriptions || typeof subscriptions !== "object") return;

      // Check if anyone subscribed
      let hasSubscriber = false;

      for (const sub of Object.values(subscriptions)) {
        if (sub?.tags && Object.keys(sub.tags).length > 0) {
          hasSubscriber = true;
          break;
        }
      }

      // No subscribers → skip DB polling
      if (!hasSubscriber) return;

      // Fetch only active tags
      const tags = await TagLive.find({ isActive: true });

      for (const tagDoc of tags) {
        const tagId = tagDoc._id.toString();

        // Skip tags handled by their own watchers
        if (watcherManagedTags.has(tagId)) continue;

        // Create payload every time
        const payload = {
          id: tagId,
          val: tagDoc.latestValue,
          // timestamp: new Date(),
          timestamp: tagDoc.updatedAt || new Date(),
          health: tagDoc.health,
          assetId: tagDoc.assetId || [],
        };

        // Emit to matching subscribers EVERY TIME
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
      }
    } catch (err) {
      console.error("Error fetching tags from DB:", err.message);
    }
  }, 2000);
}

module.exports = { startLiveDataDbEmitter };

// in .env -> USE_LIVE_SOCKET_FORWARDING=false
