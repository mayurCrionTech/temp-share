// const config = require("../../../../ClonosFieldBridge_Backend/Transmitter/config/plc.config");

// async function fetchAllTagsOnly() {
//   const allTags = config.DEVICES.flatMap(device =>
//     device.tags.map(tag => ({
//       name: tag.name,
//       type: tag.type,
//       unit: tag.unit,
//       deviceType: device.type   // optional
//     }))
//   );

//   return allTags;
// }

// async function fetchAllTagsOnly({ searchTag, page, limit }) {
//   // 1. Flatten all tags
//   let allTags = config.DEVICES.flatMap(device =>
//     device.tags.map(tag => ({
//       name: tag.name,
//       type: tag.type,
//       unit: tag.unit,
//       deviceType: device.type
//     }))
//   );

//   // 2. Filter by tag name (case-insensitive)
//   if (searchTag) {
//     const search = searchTag.toLowerCase();
//     allTags = allTags.filter(t =>
//       t.name.toLowerCase().includes(search)
//     );
//   }

//   // 3. Pagination
//   const total = allTags.length;
//   const totalPages = Math.ceil(total / limit);
//   const startIndex = (page - 1) * limit;
//   const paginatedData = allTags.slice(startIndex, startIndex + limit);

//   return {
//     total,
//     page,
//     totalPages,
//     data: paginatedData
//   };
// }


// const config = require("../../../../ClonosFieldBridge_Backend/Transmitter/config/plc.config");
const {TagLive} = require("../../../models/mongoDB/tags/tagsModel"); 
const PlcController = require("../../../models/mongoDB/plcManagement/controllerModel");
const PlcTag=require("../../../models/mongoDB/plcManagement/controllerTagModel")
const {
  updatePlcConfig,
  updateDeviceInConfig,removeDeviceFromConfig,addTagToConfig,removeTagFromConfig,updateTagInConfig
}  = require("../../../utils/plcConfig/plcConfigWriter");
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
// const CONFIG_PATH = path.join(
//   // __dirname,
//   // "../../../../ClonosFieldBridge_Backend/Transmitter/config/plcConfig1.js"
//   // "C:/Users/User/Desktop/ClonosFieldBridge_Backend/Transmitter/config/plcConfig1.js"
//   "C:/FieldBridge/ClonosFieldBridge_Backend/ClonosFieldBridge_Backend/Transmitter/config/plcConfig1.js"

// );
const CONFIG_PATH = process.env.CONFIG_PATH;
async function getAllControllers() {
  // 1. DB DATA
  const dbControllers = await PlcController.find().sort({ createdAt: -1 });

  // 2. FILE DATA
  let fileControllers = [];

  if (fs.existsSync(CONFIG_PATH)) {
    delete require.cache[require.resolve(CONFIG_PATH)];
    const config = require(CONFIG_PATH);
    fileControllers = config.DEVICES || [];
  }

  return {
    plcControllers: dbControllers,
    plcConfigDevices: fileControllers
  };
}


// async function fetchAllTagsOnly({ searchTag = "", page = 1, limit = 20 }) {

//   // 1. Flatten config tags
//   let allTags = config.DEVICES.flatMap(device =>
//     device.tags.map(tag => ({
//       name: tag.name,
//       type: tag.type,
//       deviceType: device.type
//     }))
//   );

//   // 2. Filter by search
//   if (searchTag) {
//     const search = searchTag.toLowerCase();
//     allTags = allTags.filter(t =>
//       t.name.toLowerCase().includes(search)
//     );
//   }

//   // 3. Get DB values for these tag names
//   const tagNames = allTags.map(t => t.name);

//   const dbTags = await TagMock.find({
//     tagname: { $in: tagNames }
//   }).lean();

//   // Convert DB array → map for quick lookup
//   const dbMap = {};
//   dbTags.forEach(t => {
//     dbMap[t.tagname.toLowerCase()] = t;
//   });

//   // 4. Merge config + DB
//   const mergedTags = allTags.map(tag => {
//     const dbTag = dbMap[tag.name.toLowerCase()];

//     return {
//       _id: dbTag?._id ?? null,
//       name: tag.name,
//       type: tag.type,
//       deviceType: tag.deviceType,
//       value: dbTag?.latestValue ?? null,
//       unit: dbTag?.unit ?? null
//     };
//   });

//   // 5. Pagination
//   const total = mergedTags.length;
//   const totalPages = Math.ceil(total / limit) || 1;
//   const startIndex = (page - 1) * limit;
//   const paginatedData = mergedTags.slice(startIndex, startIndex + limit);

//   return {
//     total,
//     page,
//     totalPages,
//     data: paginatedData
//   };
// }

async function fetchAllTagsOnly({ searchTag = "", page = 1, limit = 20 }) {
  try {

    // ---- YOUR EXISTING LOGIC START ----
    let config = { DEVICES: [] };

    if (fs.existsSync(CONFIG_PATH)) {
      delete require.cache[require.resolve(CONFIG_PATH)];
      console.log("CONFIG PATH:", CONFIG_PATH);
console.log("EXISTS:", fs.existsSync(CONFIG_PATH));
      config = require(CONFIG_PATH);
      console.log("CONFIG OBJECT:", config);
console.log("DEVICES:", config.DEVICES);
    }

    // 1. Flatten config tags
    let allTags = config.DEVICES.flatMap(device =>
      device.tags.map(tag => ({
        name: tag.name,
        type: tag.type,
        deviceType: device.type
      }))
    );

    // 2. Filter by search
    if (searchTag) {
      const search = searchTag.toLowerCase();
      allTags = allTags.filter(t =>
        t.name.toLowerCase().includes(search)
      );
    }

    // 3. Get DB values for these tag names
    const tagNames = allTags.map(t => t.name);

    const dbTags = await TagLive.find({
      tagname: { $in: tagNames }
    }).lean();

    // Convert DB array → map for quick lookup
    const dbMap = {};
    dbTags.forEach(t => {
      dbMap[t.tagname.toLowerCase()] = t;
    });

    // 4. Merge config + DB
    const mergedTags = allTags.map(tag => {
      const dbTag = dbMap[tag.name.toLowerCase()];

      return {
        _id: dbTag?._id ?? null,
        name: tag.name,
        type: tag.type,
        deviceType: tag.deviceType,
        value: dbTag?.latestValue ?? null,
        unit: dbTag?.unit ?? null
      };
    });

    // 5. Pagination
    const total = mergedTags.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const startIndex = (page - 1) * limit;
    const paginatedData = mergedTags.slice(startIndex, startIndex + limit);

    return {
      total,
      page,
      totalPages,
      data: paginatedData
    };

    // ---- YOUR EXISTING LOGIC END ----

  } catch (error) {
    throw error;
  }
}


/**
 * Validate network-specific settings
 */
function validateSettings(network, settings) {
  if (!settings) throw new Error("Settings object is required");

  switch (network) {
    case "Siemens":
      if (settings.rack == null || settings.slot == null) {
        throw new Error("Siemens requires rack and slot");
      }
      break;

    case "Modbus":
      if (settings.unitId == null) {
        throw new Error("Modbus requires unitId");
      }
      break;

    case "Ethernetip":
      if (settings.slot == null && settings.autoDiscover == null) {
        throw new Error("EthernetIP requires slot or autoDiscover");
      }
      break;

    default:
      // Future networks
      if (Object.keys(settings).length === 0) {
        throw new Error("Settings required for new network");
      }
  }
}

/**
 * Create Controller
 */
// async function createController(data) {
//   const { controllerName, network, ipAddress, settings, parameters } = data;

//   if (!controllerName || !network || !ipAddress) {
//     throw new Error("controllerName, network, ipAddress are required");
//   }

//   const networkName = network?.name; // "Modbus"
//   const networkId = network?.id;     // "modbus"

//   console.log("NNNNN",networkName,network)

//   validateSettings(networkId, settings);

//   // DB duplicate check
//   const exists = await PlcController.findOne({ ipAddress });
//   if (exists) {
//     throw new Error("Controller with this IP already exists in DB");
//   }

//   const parametersWithId = (parameters || []).map(param => ({
//     _id: new mongoose.Types.ObjectId(),
//     ...param
//   }));

//   // ---- SAVE IN DB (CAPS SAME AS FRONTEND) ----
//   const controller = await PlcController.create({
//     controllerName,
//     network: network,   // "Modbus"
//     ipAddress,
//     settings,
//     parameters: parametersWithId
//   });

//   // ---- SAVE IN FILE (LOWERCASE) ----
//   updatePlcConfig({
//     name: controller.controllerName,
//     type: networkId,        // "modbus"
//     ip: controller.ipAddress,
//     settings: controller.settings,
//     tags: controller.tags || []
//   });

//   return controller;
// }



// async function getAllControllers() {
//   const controllers = await PlcController.find().sort({ createdAt: -1 });

//   return {
//     count: controllers.length,
//     controllers
//   };
// }

async function createController(data) {
  try {

    const { controllerName, network, ipAddress, settings, parameters } = data;

    if (!controllerName || !network || !ipAddress) {
      throw new Error("controllerName, network, ipAddress are required");
    }

    const networkName = network?.name;
    const networkId = network?.id;

    validateSettings(networkId, settings);

    // DB duplicate check
    const exists = await PlcController.findOne({ ipAddress });
    if (exists) {
      throw new Error("Controller with this IP already exists in DB");
    }

    const parametersWithId = (parameters || []).map(param => ({
      _id: new mongoose.Types.ObjectId(),
      ...param
    }));

    // ---- SAVE IN DB ----
    const controller = await PlcController.create({
      controllerName,
      network,
      ipAddress,
      settings,
      parameters: parametersWithId
    });

    // ---- SAVE IN CONFIG FILE ----
    updatePlcConfig({
      name: controller.controllerName,
      type: networkId,
      ip: controller.ipAddress,
      settings: controller.settings,
      tags: controller.tags || []
    });

    return controller;

  } catch (error) {
    throw error;
  }
}


async function getAllControllers() {
  const controllers = await PlcController
    .find({ isActive: true })   // <-- IMPORTANT
    .sort({ createdAt: -1 });

  return {
    count: controllers.length,
    controllers
  };
}





async function getControllerById(id) {
  // Validate ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("Invalid controller ID");
  }

  const controller = await PlcController.findById(id);

  if (!controller) {
    throw new Error("Controller not found");
  }

  return controller;
}

// async function updateController(id, data) {
//   const { controllerName, ipAddress, parameters = [] } = data;

//   const controller = await PlcController.findById(id);
//   if (!controller) throw new Error("Controller not found");

//   const oldIp = controller.ipAddress;

//   // -------- NAME UPDATE --------
//   if (controllerName) {
//     controller.controllerName = controllerName;
//   }

//   // -------- IP UPDATE --------
//   if (ipAddress && ipAddress !== controller.ipAddress) {
//     const exists = await PlcController.findOne({ ipAddress });
//     if (exists) throw new Error("IP already exists");

//     controller.ipAddress = ipAddress;
//   }

//   // -------- ADD NEW PARAMETERS ONLY --------
//   if (parameters.length > 0) {
//     const newParams = parameters.map(p => ({
//       _id: new mongoose.Types.ObjectId(),
//       ...p
//     }));

//     controller.parameters.push(...newParams);
//   }

//   await controller.save();

//   // -------- CONFIG UPDATE --------
//   updateDeviceInConfig(oldIp, controller);

//   return controller;
// }

async function updateController(id, data) {
  const { controllerName, ipAddress, parameters } = data;

  // -------- FIND CONTROLLER --------
  const controller = await PlcController.findById(id);
  if (!controller) throw new Error("Controller not found");

  const oldIp = controller.ipAddress;

  // -------- UPDATE NAME --------
  if (controllerName && controllerName !== controller.controllerName) {
    controller.controllerName = controllerName;
  }

  // -------- UPDATE IP --------
  if (ipAddress && ipAddress !== controller.ipAddress) {
    const exists = await PlcController.findOne({ ipAddress });
    if (exists) throw new Error("IP already exists");
    controller.ipAddress = ipAddress;
  }

  // -------- PARAMETERS (ADD ONLY NEW) --------
  if (Array.isArray(parameters) && parameters.length > 0) {

    // Existing parameter names
    const existingNames = controller.parameters.map(p =>
      p.name.toLowerCase()
    );

    // Filter only new params
    const filteredParams = parameters.filter(
      p => !existingNames.includes(p.name.toLowerCase())
    );

    if (filteredParams.length > 0) {
      const newParams = filteredParams.map(p => ({
        _id: new mongoose.Types.ObjectId(),
        name: p.name,
        dataType: p.dataType,
        options: p.options || [],
        isDefault: p.isDefault || false
      }));

      controller.parameters.push(...newParams);
    }
  }

  // -------- SAVE DB --------
  await controller.save();

  // -------- UPDATE CONFIG FILE --------
  updateDeviceInConfig(oldIp, controller);

  return controller;
}

async function deleteController(id) {

  const controller = await PlcController.findById(id);
  if (!controller) throw new Error("Controller not found");

  // ---- SOFT DELETE DB ----
  controller.isActive = false;
  await controller.save();

  // ---- REMOVE FROM CONFIG FILE ----
  removeDeviceFromConfig(controller.ipAddress);

  return controller;
}

async function getControllerParameters(controllerId) {
  const controller = await PlcController.findById(controllerId);
  if (!controller) throw new Error("Controller not found");
  return controller.parameters;
}

// async function createTag(data) {
//   const { controllerId, controllerName, tag } = data;

//   if (!tag) throw new Error("Tag data required");

//   // -------- FIND CONTROLLER --------
//   let controller;

//   if (controllerId) {
//     controller = await PlcController.findById(controllerId);
//   } else if (controllerName) {
//     controller = await PlcController.findOne({ controllerName });
//   }

//   if (!controller) throw new Error("Controller not found");

//   // -------- DUPLICATE CHECK DB --------
//   controller.tags = controller.tags || [];

//   const exists = controller.tags.find(t => t.name === tag.name);
//   if (exists) throw new Error("Tag already exists in DB");

//   // -------- SAVE TO DB --------
//   controller.tags.push(tag);
//   await controller.save();

//   // -------- SAVE TO CONFIG FILE --------
//   addTagToConfig(controller.controllerName, tag);

//   return tag;
// }

async function createTag(data) {
  const { controllerId, controllerName,...tag } = data;

  console.log("L:L:L:L:L:",data)

  if (!controllerId) throw new Error("ControllerId required");
  if (!tag) throw new Error("Tag required");

  const controller = await PlcController.findById(controllerId);
  if (!controller) throw new Error("Controller not found");

  const network = controller.network?.id?.toLowerCase();
  controller.tags = controller.tags || [];

  let tagValue;

  // -------- ETHERNET --------
if (network === "ethernet" || network === "ethernetip") {

  // tag is object because of ...tag
  const tagStrings = Object.values(tag).filter(v => typeof v === "string");

  if (!tagStrings.length) {
    throw new Error("Ethernet tag must be string");
  }

  for (const t of tagStrings) {
    if (controller.tags.includes(t)) {
      throw new Error(`Duplicate tag: ${t}`);
    }

    controller.tags.push(t);

    // save each tag separately in tag collection
    await PlcTag.create({
      controllerId: controller._id,
      controllerName: controller.controllerName,
      networkType: network,
      value: t
    });

    addTagToConfig(controller.controllerName, t);
  }

  await controller.save();
  return tagStrings;
}

  // -------- OTHERS --------
  else {
    if (!tag.name) throw new Error("Tag name required");

    const duplicate = controller.tags.find(t => t.name === tag.name);
    if (duplicate) throw new Error("Duplicate tag");

    tagValue = tag;
    controller.tags.push(tag);
  }

  // SAVE CONTROLLER
  await controller.save();

  // SAVE TAG COLLECTION
  await PlcTag.create({
    controllerId: controller._id,
    controllerName: controller.controllerName,
    networkType: network,
    value: tagValue
  });

  // SAVE CONFIG FILE
  addTagToConfig(controller.controllerName, tagValue);

  return tagValue;
}



// async function getAllTags(reqData = {}) {
//   try {
//     const page = reqData.page ? parseInt(reqData.page) : 1;
//     const limit = 15; // fixed per page
//     const skip = (page - 1) * limit;

//     const countData = await PlcTag.countDocuments({ isActive: true });

//     let data = await PlcTag
//       .find({ isActive: true })
//       .sort({ createdAt: -1 })
//       .skip(skip)
//       .limit(limit)
//       .lean();

//     data = data.map(tag => {
//       const { _id, ...rest } = tag;
//       return { ...rest, id: _id };
//     });

//     const totalPages = Math.ceil(countData / limit) || 1;

//     return {
//       page,
//       totalPages,
//       total: countData,
//       data
//     };

//   } catch (err) {
//     throw err;
//   }
// }



async function getAllTags({ page, limit }) {

  const skip = (page - 1) * limit;
  const filter = { isActive: true };

  const total = await PlcTag.countDocuments(filter);

  const data = await PlcTag
    .find(filter)
    .sort({ createdAt: -1, _id: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  const formattedData = data.map(item => {
    const { _id, ...rest } = item;
    return { id: _id, ...rest };
  });

  return {
    page,
    totalPages: Math.ceil(total / limit),
    total,
    data: formattedData
  };
}

async function getTagById(tagId) {

  // Validate ObjectId
  if (!mongoose.Types.ObjectId.isValid(tagId)) {
    throw new Error("Invalid Tag ID");
  }

  const tag = await PlcTag.findOne({
    _id: tagId,
    isActive: true
  })

  if (!tag) {
    throw new Error("Tag not found");
  }

  return {
    success: true,
    tag
  };
}

// async function getTagById(tagId, req) {
//   try {
//     const queryObj = queryBuilder(req.query);
//     const fieldMapping = fieldMappings(queryObj.constructedPopulateFields);

//     const populateFields = [
//       "controllerId"
//     ];

//     const selectFields = [
//       "controllerId",
//       "controllerName",
//       "networkType",
//       "value",
//       "isActive",
//       "createdAt",
//       "updatedAt"
//     ];

//     // ---------- OBJECT ID ----------
//     tagId = new mongoose.Types.ObjectId(tagId);

//     // ---------- AGG PIPELINE ----------
//     let datum = await buildSingleAggregationPipeline(
//       PlcTag,          // Model
//       tagId,           // _id
//       queryObj.query,  // extra filters
//       fieldMapping,
//       populateFields,
//       selectFields
//     );

//     // ---------- NOT FOUND ----------
//     if (!datum) return null;

//     // ---------- CLEANUP / TRANSFORM ----------
//     // remove empty value object
//     if (datum.value && Object.keys(datum.value).length === 0) {
//       delete datum.value;
//     }

//     // optional: controller flatten
//     if (datum.controllerId && typeof datum.controllerId === "object") {
//       datum.controller = {
//         id: datum.controllerId._id,
//         name: datum.controllerId.controllerName
//       };
//       delete datum.controllerId;
//     }

//     // ---------- FINAL RESPONSE ----------
//     const { _id, ...rest } = datum;
//     return { ...rest, id: _id };

//   } catch (err) {
//     throw err;
//   }
// }


async function updateTag(tagId, data) {
  if (!mongoose.Types.ObjectId.isValid(tagId)) {
    throw new Error("Invalid Tag ID");
  }

  const tag = await PlcTag.findById(tagId);
  if (!tag || !tag.isActive) throw new Error("Tag not found");

  // ❌ Name change not allowed
  if (data.name && data.name !== tag.name) {
    throw new Error("Tag name cannot be changed");
  }

  // Merge any updates into `value` object
  if (data.value) {
    tag.value = { ...tag.value, ...data.value }; // <-- add new keys or update existing
  }

  // Optional: merge extra config values if sent
  if (data.config) {
    tag.config = { ...tag.config, ...data.config };
    // Also merge config values into value if needed
    tag.value = { ...tag.value, ...data.config };
  }

  await tag.save();

  console.log("?>?>?>>>>>>",tag.controllerName, tag.name, tag.value)

  // Update in config file
  updateTagInConfig(tag.controllerName, tag.value?.name, tag.value);

  return { success: true, tag };
}


async function deleteTag(tagId) {

  if (!mongoose.Types.ObjectId.isValid(tagId)) {
    throw new Error("Invalid Tag ID");
  }

  const tag = await PlcTag.findById(tagId);
  if (!tag || !tag.isActive) throw new Error("Tag not found");

  // SOFT DELETE
  tag.isActive = false;
  await tag.save();

  // REMOVE FROM CONFIG FILE
  // removeTagFromConfig(tag.controllerName, tag.name);
  removeTagFromConfig(tag.controllerName, tag.value?.name);


  return { success: true, message: "Tag deleted" };
}

async function getTagsByControllerId(controllerId) {

  if (!mongoose.Types.ObjectId.isValid(controllerId)) {
    throw new Error("Invalid Controller ID");
  }

  const tags = await PlcTag
    .find({
      controllerId: controllerId,
      isActive: true   // only active tags
    })
    .sort({ createdAt: -1 });

  return {
    count: tags.length,
    tags
  };
}





module.exports = { fetchAllTagsOnly,createController,getAllControllers,getControllerById,
  updateController,deleteController,getControllerParameters,createTag,getAllTags,getTagById,updateTag,deleteTag,getTagsByControllerId};



function queryBuilder(reqData) {
  const query = {
    isActive: true,
    ...(reqData.name && {
      controllerName: { $regex: reqData.name, $options: "i" }
    }),
    ...(reqData.networkType && {
      networkType: reqData.networkType
    })
  };

  const page = reqData.page ? parseInt(reqData.page, 10) : null;
  const limit = reqData.limit ? parseInt(reqData.limit, 10) : null;
  const sort = reqData.sort || "createdAt";
  const order = reqData.order === "asc" ? 1 : -1;
  const sortOrder = { [sort]: order };

  return {
    query,
    page,
    limit,
    sortOrder
  };
}



