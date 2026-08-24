let io = null;

function setIOInstance(socketServer) {
  io = socketServer;
}

function getIOInstance() {
  if (!io) {
    throw new Error("Socket.IO instance not initialized yet");
  }
  return io;
}

module.exports = {
  setIOInstance,
  getIOInstance,
};
