// test-socket-client.js
const { io } = require("socket.io-client");

const SERVER_URL = "http://localhost:3000"; // change to your server URL/port
const NAMESPACE = "/live-data";             // change if different

const socket = io(`${SERVER_URL}${NAMESPACE}`, {
  transports: ["websocket"],
});

socket.on("connect", () => {
  console.log("✅ Connected:", socket.id);

  // Replace with real tag IDs from your DB
  const tags = [
    { id: "PUT_A_REAL_TAG_OBJECTID_HERE", mode: "direct" },
  ];

  socket.emit("join_room", { room: "test-room", tags });
  console.log("➡️ join_room sent with tags:", tags);
});

// Listen for events keyed by tag id (since mode="direct" emits on tagId itself)
tags => {}; // no-op, just for clarity

socket.onAny((event, data) => {
  console.log(`📩 [${new Date().toISOString()}] event="${event}"`, data);
});

socket.on("disconnect", (reason) => {
  console.log("❌ Disconnected:", reason);
});

socket.on("connect_error", (err) => {
  console.error("⚠️ Connection error:", err.message);
});