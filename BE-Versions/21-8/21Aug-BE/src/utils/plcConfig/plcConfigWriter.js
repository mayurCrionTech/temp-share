const fs = require("fs");
const path = require("path");

// const CONFIG_PATH = path.join(
//   // __dirname,
//   // "../../../ClonosFieldBridge_Backend/Transmitter/config/plcConfig1.js"
//   // "C:/Users/User/Desktop/ClonosFieldBridge_Backend/Transmitter/config/plcConfig1.js"
//   "C:/FieldBridge/ClonosFieldBridge_Backend/ClonosFieldBridge_Backend/Transmitter/config/plcConfig1.js"
  
// );
const CONFIG_PATH = process.env.CONFIG_PATH;
// const disableUser=require("../../../ClonosFieldBridge_Backend")

// function formatDevice(data) {
//   return {
//     name: data.controllerName,
//     type: data.network,
//     ip: data.ipAddress,
//     ...data.settings,
//     tags: data.tags || [] 
//   };
// }
function formatDevice(data) {
  return {
    name: data.name,              // controllerName
    type: data.type,              // network
    ip: data.ip,                  // ipAddress
    settings: data.settings || {},  // keep settings as object
    tags: data.tags || []         // keep tags
  };
}



// function writeConfig(devices) {
//   // Generate JS code instead of JSON
//   const deviceStrings = devices.map(dev => {
//     // Flatten settings into top-level keys
//     const settingsStr = Object.entries(dev.settings || {})
//       .map(([key, val]) => `${key}: ${JSON.stringify(val)}`)
//       .join(", ");

//     // Ensure tags are included
//     const tagsStr = `tags: []`;

//     return `{
//       name: "${dev.name}",
//       type: "${dev.type}",
//       ip: "${dev.ip}"
//       ${settingsStr ? `, ${settingsStr}` : ""}, 
//       ${tagsStr}
//     }`;
//   });

//   const content = `module.exports = {
//   DEVICES: [
//     ${deviceStrings.join(",\n    ")}
//   ]
// };`;

//   fs.writeFileSync(CONFIG_PATH, content, "utf8");
// }



// function updatePlcConfig(data) {
//   let devices = [];

//   // READ EXISTING FILE
//   if (fs.existsSync(CONFIG_PATH)) {
//     delete require.cache[require.resolve(CONFIG_PATH)];
//     const existing = require(CONFIG_PATH);
//     devices = existing.DEVICES || [];
//   }

//   // 🔴 DUPLICATE CHECK
//   const duplicate = devices.find(d => d.ip === data.ipAddress);
//   if (duplicate) {
//     throw new Error("Controller with this IP already exists in config file");
//   }

//   // ADD DEVICE
//   const device = formatDevice(data);
//   devices.push(device);

//   writeConfig(devices);
// }

// function writeConfig(devices) {
//   // Generate JS code
//   const deviceStrings = devices.map(dev => {
//     // Include all top-level keys as-is
//     const keyValues = Object.entries(dev)
//       .map(([key, val]) => {
//         if (typeof val === "string") return `${key}: "${val}"`;
//         if (Array.isArray(val)) return `${key}: ${JSON.stringify(val)}`;
//         return `${key}: ${val}`;
//       })
//       .join(", ");

//     return `{ ${keyValues} }`;
//   });

//   const content = `module.exports = {
//   DEVICES: [
//     ${deviceStrings.join(",\n    ")}
//   ]
// };`;

//   fs.writeFileSync(CONFIG_PATH, content, "utf8");
// }



function writeConfig(devices) {
  // Generate JS code for DEVICES array
  const deviceStrings = devices.map(dev => {
    const keyValues = Object.entries(dev)
      .map(([key, val]) => {
        if (typeof val === "string") return `${key}: "${val}"`;
        if (Array.isArray(val)) return `${key}: ${JSON.stringify(val)}`;
        return `${key}: ${JSON.stringify(val)}`;
      })
      .join(", ");
    return `{ ${keyValues} }`;
  });

  // Keep the constant part at the top
  const content = `require('dotenv').config();

module.exports = {
  API_ENDPOINT: process.env.API_ENDPOINT,
  POLL_INTERVAL: Number(process.env.POLL_INTERVAL) || 5000,
  SEND_INTERVAL: Number(process.env.SEND_INTERVAL) || 10000,
  BATCH_SIZE: Number(process.env.BATCH_SIZE) || 500,
  RETRY_INTERVAL: Number(process.env.RETRY_INTERVAL) || 600000, // 5 minutes
  ALERT_THRESHOLD: Number(process.env.ALERT_THRESHOLD) || 3600000, // 1 Hour

  DEVICES: [
    ${deviceStrings.join(",\n    ")}
  ]
};`;

  fs.writeFileSync(CONFIG_PATH, content, "utf8");
}


function updatePlcConfig(data) {
  let devices = [];

  // READ EXISTING FILE
  if (fs.existsSync(CONFIG_PATH)) {
    delete require.cache[require.resolve(CONFIG_PATH)];
    const existing = require(CONFIG_PATH);
    devices = existing.DEVICES || [];
  }

  // DUPLICATE CHECK
  const duplicate = devices.find(d => d.ip === data.ip);
  if (duplicate) {
    throw new Error("Controller with this IP already exists in config file");
  }

  // ADD DEVICE (merge top-level settings)
  const device = {
    name: data.name,
    type: data.type,
    ip: data.ip,
    ...data.settings,   // flatten settings into top-level
    tags: data.tags || []
  };

  devices.push(device);

  // WRITE BACK
  writeConfig(devices);
}

function updateDeviceInConfig(oldIp, controller) {
  let devices = [];

  // READ EXISTING
  if (fs.existsSync(CONFIG_PATH)) {
    delete require.cache[require.resolve(CONFIG_PATH)];
    const existing = require(CONFIG_PATH);
    devices = existing.DEVICES || [];
  }

  const index = devices.findIndex(d => d.ip === oldIp);
  if (index === -1) {
    throw new Error("Device not found in config file");
  }

  // keep existing extra fields like rack, slot, unitId, tags
  const existingDevice = devices[index];

  devices[index] = {
    ...existingDevice,
    name: controller.controllerName,
    ip: controller.ipAddress,
    type:
      typeof controller.network === "object"
        ? controller.network.id
        : controller.network
  };

  writeConfig(devices);
}

function removeDeviceFromConfig(ip) {
  let devices = [];

  if (fs.existsSync(CONFIG_PATH)) {
    delete require.cache[require.resolve(CONFIG_PATH)];
    const existing = require(CONFIG_PATH);
    devices = existing.DEVICES || [];
  }

  // Remove device by IP
  devices = devices.filter(d => d.ip !== ip);

  writeConfig(devices);
}

// function addTagToConfig(controllerName, tag) {
//   let devices = [];

//   if (fs.existsSync(CONFIG_PATH)) {
//     delete require.cache[require.resolve(CONFIG_PATH)];
//     const existing = require(CONFIG_PATH);
//     devices = existing.DEVICES || [];
//   }

//   const device = devices.find(d => d.name === controllerName);
//   if (!device) throw new Error("Controller not found in config");

//   device.tags = device.tags || [];

//   const duplicate = device.tags.find(t => t.name === tag.name);
//   if (duplicate) throw new Error("Tag already exists in config");

//   device.tags.push(tag);

//   writeConfig(devices);
// }

function addTagToConfig(controllerName, tag) {
  let devices = [];

  if (fs.existsSync(CONFIG_PATH)) {
    delete require.cache[require.resolve(CONFIG_PATH)];
    const existing = require(CONFIG_PATH);
    devices = existing.DEVICES || [];
  }

  const device = devices.find(d => d.name === controllerName);
  if (!device) throw new Error("Controller not found in config");

  device.tags = device.tags || [];

  // -------- ETHERNET (STRING) --------
  if (typeof tag === "string") {
    if (device.tags.includes(tag)) {
      throw new Error("Tag already exists in config");
    }

    device.tags.push(tag);
  }

  // -------- MODBUS / SIEMENS (OBJECT) --------
  else {
    const duplicate = device.tags.find(t => t.name === tag.name);
    if (duplicate) {
      throw new Error("Tag already exists in config");
    }

    device.tags.push(tag);
  }

  writeConfig(devices);
}

function updateTagInConfig(controllerName, tagName, newValue) {
  if (!controllerName || !tagName) return;

  delete require.cache[require.resolve(CONFIG_PATH)];
  const config = require(CONFIG_PATH);
  const devices = config.DEVICES || [];

  const device = devices.find(
    d => (d.name || "").toLowerCase().trim() === controllerName.toLowerCase().trim()
  );
  if (!device || !Array.isArray(device.tags)) return;

  const tagIndex = device.tags.findIndex(t =>
    typeof t === "string"
      ? t.toLowerCase().trim() === tagName.toLowerCase().trim()
      : (t.name || "").toLowerCase().trim() === tagName.toLowerCase().trim()
  );

  if (tagIndex === -1) return;

  const existingTag = device.tags[tagIndex];

  if (typeof existingTag === "object") {
    // Merge newValue directly into the tag object
    Object.assign(existingTag, newValue);
    device.tags[tagIndex] = existingTag;
  } else {
    // If it was a string, replace with object
    device.tags[tagIndex] = { name: tagName, ...newValue };
  }

  writeConfig(devices);
}



function removeTagFromConfig(controllerName, tagName) {

  if (!controllerName || !tagName) {
    console.log("Missing controllerName or tagName");
    return;
  }

  try {
    // CLEAR CACHE
    delete require.cache[require.resolve(CONFIG_PATH)];

    const config = require(CONFIG_PATH);
    let devices = config.DEVICES || [];

    const ctrlName = controllerName.toLowerCase().trim();
    const tName = tagName.toLowerCase().trim();

    const device = devices.find(
      d => (d.name || "").toLowerCase().trim() === ctrlName
    );

    if (!device) {
      console.log("Controller not found in config");
      return;
    }

    if (!Array.isArray(device.tags)) {
      device.tags = [];
      return;
    }

    const before = device.tags.length;

    device.tags = device.tags.filter(t => {
      if (!t) return false;

      if (typeof t === "string") {
        return t.toLowerCase().trim() !== tName;
      }

      return (t.name || "").toLowerCase().trim() !== tName;
    });

    const after = device.tags.length;

    console.log(`Tags before: ${before}, after: ${after}`);

    // WRITE BACK
    writeConfig(devices);

  } catch (err) {
    console.log("Error removing tag:", err.message);
  }
}






module.exports = {
  updatePlcConfig,
  updateDeviceInConfig,
  removeDeviceFromConfig,
  addTagToConfig,
  updateTagInConfig,
  removeTagFromConfig
};








// const fs = require("fs");
// const path = require("path");

// const CONFIG_PATH = path.join(
//   __dirname,
//   "../../../ClonosFieldBridge_Backend/Transmitter/config/plcConfig1.js"
// );

// function writeConfig(devices) {
//   const deviceStrings = devices.map(dev => {
//     const keyValues = Object.entries(dev)
//       .map(([key, val]) => {
//         if (typeof val === "string") return `${key}: "${val}"`;
//         if (Array.isArray(val)) return `${key}: ${JSON.stringify(val)}`;
//         return `${key}: ${val}`;
//       })
//       .join(", ");

//     return `{ ${keyValues} }`;
//   });

//   const content = `module.exports = {
//   DEVICES: [
//     ${deviceStrings.join(",\n    ")}
//   ]
// };`;

//   fs.writeFileSync(CONFIG_PATH, content, "utf8");
// }

// function readDevices() {
//   if (!fs.existsSync(CONFIG_PATH)) return [];

//   delete require.cache[require.resolve(CONFIG_PATH)];
//   const existing = require(CONFIG_PATH);
//   return existing.DEVICES || [];
// }

// /* ---------------- CREATE DEVICE ---------------- */
// function addDevice(data) {
//   let devices = readDevices();

//   const duplicate = devices.find(d => d.ip === data.ip);
//   if (duplicate) {
//     throw new Error("Controller with this IP already exists in config file");
//   }

//   const device = {
//     name: data.name,
//     type: data.type,
//     ip: data.ip,
//     ...data.settings,
//     tags: data.tags || []
//   };

//   devices.push(device);
//   writeConfig(devices);
// }

// /* ---------------- UPDATE DEVICE ---------------- */
// function updateDevice(previousIp, controller) {
//   let devices = readDevices();

//   const index = devices.findIndex(d => d.ip === previousIp);
//   if (index === -1) return;

//   const oldDevice = devices[index];

//   // Only update allowed fields
//   devices[index] = {
//     ...oldDevice, // keeps rack, slot, unitId, tags
//     name: controller.controllerName,
//     ip: controller.ipAddress
//   };

//   writeConfig(devices);
// }

// module.exports = {
//   addDevice,
//   updateDevice
// };
