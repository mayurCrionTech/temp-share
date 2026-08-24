// // const config = require("../../../config/config");
// const config=require("../../../ClonosFieldBridge_Backend/Transmitter/config/plc.config")

// exports.getAllPlcs = (req, res) => {
//   try {
//     res.json({
//       success: true,
//       data: config.DEVICES
//     });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// exports.getTagsByPlc = (req, res) => {
//   try {
//     const { plcName } = req.params;

//     const plc = config.DEVICES.find(
//       d => d.name.toLowerCase() === plcName.toLowerCase()
//     );

//     if (!plc) {
//       return res.status(404).json({
//         success: false,
//         message: "PLC not found"
//       });
//     }

//     res.json({
//       success: true,
//       plc: plc.name,
//       count: plc.tags.length,
//       tags: plc.tags
//     });

//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// };




const apiResponseHandler = require("../../managers/common/apiResponseHandler_manager");
const plcManager = require("../../managers/internalManagers/plcManager/plcManager");

exports.getAllTagsOnly = async (req, res) => {
  try {
    const tags = await plcManager.fetchAllTagsOnly();

    res.json({
      success: true,
      count: tags.length,
      data: tags
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};


exports.getAllTagsOnly = async (req, res) => {
  try {
    const { tag = "", page = 1, limit = 20 } = req.query;

    const result = await plcManager.fetchAllTagsOnly({
      searchTag: tag,
      page: Number(page),
      limit: Number(limit)
    });

    res.json({
      success: true,
      count: result.total,
      page: result.page,
      totalPages: result.totalPages,
      data: result.data
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// exports.getAllTagsOnly = async (req, res) => {
//   try {
//     const { tag = "", page = 1, limit = 20 } = req.query;

//     const result = await plcManager.fetchAllTagsOnly({
//       searchTag: tag,
//       page: Number(page),
//       limit: Number(limit)
//     });

//     return apiResponseHandler.successResponse(
//       res,
//       "Tags fetched successfully",
//       200,
//       result
//     );

//   } catch (error) {
//     console.error("Error fetching tags:", error.message);

//     return apiResponseHandler.errorResponse(
//       error,
//       req,
//       res,
//       "Failed to fetch tags",
//       500
//     );
//   }
// };



exports.createController = async (req, res) => {
  try {
    const result = await plcManager.createController(req.body);

    res.status(201).json({
      success: true,
      data: result
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

// exports.createController = async (req, res) => {
//   try {
//     const controllerData = req.body;

//     const createdController = await plcManager.createController(controllerData);

//     return apiResponseHandler.successResponse(
//       res,
//       "Controller created successfully",
//       201,
//       createdController
//     );

//   } catch (error) {
//     console.error("Error creating controller:", error.message);

//     return apiResponseHandler.errorResponse(
//       error,
//       req,
//       res,
//       "Failed to create controller",
//       500
//     );
//   }
// };


exports.getAllControllers = async (req, res) => {
  try {
    const result = await plcManager.getAllControllers();

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

exports.getControllersById = async (req, res) => {
  try {
    const result = await plcManager.getControllerById(req.params.controllerId);
    const network={"network":result.network,"id":result.network}
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (err) {
    res.status(404).json({
      success: false,
      message: err.message
    });
  }
};

// controllers/plcController.js
exports.updateController = async (req, res) => {
  try {
    const result = await plcManager.updateController(
      req.params.controllerId,
      req.body
    );

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};


exports.deleteController = async (req, res) => {
  try {
    const result = await plcManager.deleteController(
      req.params.controllerId
    );

    res.status(200).json({
      success: true,
      message: "Controller deleted successfully",
      data: result
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

exports.getParameters = async (req, res) => {
  try {
    const id = req.params.controllerId; // <-- comes from URL
    const params = await plcManager.getControllerParameters(id);
    res.json(params);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.createTag = async (req, res) => {
  try {
    const result = await plcManager.createTag(req.body);

    res.status(201).json({
      success: true,
      data: result
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};


// exports.getAllTags = async (req, res) => {
//   try {
//     console.log(">?<?<?<?<?")
//     const result = await plcManager.getAllTags();
//     res.json(result);
//   } catch (err) {
//     res.status(400).json({ message: err.message });
//   }
// };

// exports.getAllTags = async (req, res) => {
//   try {
//     const result = await plcManager.getAllTags();

//     return apiResponseHandler.successResponse(
//       res,
//       "Tags fetched successfully",
//       200,
//       result
//     );

//   } catch (error) {
//     console.error("Error fetching tags:", error.message);

//     return apiResponseHandler.errorResponse(
//       error,
//       req,
//       res,
//       "Failed to fetch tags",
//       500
//     );
//   }
// };

exports.getAllTags = async (req, res) => {
  try {
    const { page, limit } = req.query;

    const result = await plcManager.getAllTags({
      page: Number(page),
      limit: Number(limit)
    });

    return apiResponseHandler.successResponse(
      res,
      "Tags fetched successfully",
      200,
      result
    );

  } catch (error) {
    return apiResponseHandler.errorResponse(
      error,
      req,
      res,
      "Failed to fetch tags",
      500
    );
  }
};

exports.getTagById = async (req, res) => {
  try {
    const { tagId } = req.params;

    const result = await plcManager.getTagById(tagId);

    res.json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// exports.getTagById = async (req, res) => {
//   try {
//     const { tagId } = req.params;

//     const result = await plcManager.getTagById(tagId);

//     return apiResponseHandler.successResponse(
//       res,
//       "Tag fetched successfully",
//       200,
//       result
//     );

//   } catch (error) {
//     return apiResponseHandler.errorResponse(
//       error,
//       req,
//       res,
//       "Failed to fetch tag",
//       500
//     );
//   }
// };



exports.updateTag = async (req, res) => {
  try {
    const result = await plcManager.updateTag(req.params.tagId, req.body);
    res.json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteTag = async (req, res) => {
  try {
    const result = await plcManager.deleteTag(req.params.tagId);
    res.json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// plcController.js
exports.getTagsByControllerId = async (req, res) => {
  try {
    const controllerId = req.params.controllerId;

    const result = await plcManager.getTagsByControllerId(controllerId);

    res.json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};





