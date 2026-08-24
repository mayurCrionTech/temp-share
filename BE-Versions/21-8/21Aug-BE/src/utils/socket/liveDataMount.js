const { getIOInstance } = require("./ioInstance");
const {liveDataHandler} = require("./liveDataHandler");
const { startDBLiveEmitter } = require("./liveDataDbEmitter");
let liveNamespace=null

function mountLiveDataNamespace() {
  const io = getIOInstance();
  liveNamespace=io.of("/live-data")
  liveDataHandler(liveNamespace)
  // liveDataHandler(liveNamespace);
  // startDBLiveEmitter(liveNamespace);
}

function getLiveNamespace() {
  return liveNamespace
}

module.exports = { mountLiveDataNamespace,getLiveNamespace };
