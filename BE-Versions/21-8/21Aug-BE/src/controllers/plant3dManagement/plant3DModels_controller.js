
const {
  successResponse,
  errorResponse,
} = require("../../managers/common/apiResponseHandler_manager");

const {
  createNewPlant3DModel,
  getAllPlant3D,
  getPlant3DById,
  editPlant3D,
  deletePlant3D,
} = require("../../managers/internalManagers/plant3DmodelManagement/plant3Dmodel_manager");

/**
 * CREATE
 */
exports.createPlant3DModel = async (req, res) => {
  try {

    const createdPlant3D = await createNewPlant3DModel({
      body: req.body,
      userId: req.userId,
    });

    req.plant3DId = createdPlant3D._id;

    return successResponse(res, "plant3D model created successfully", 201, {
      id: createdPlant3D._id,
    });
  } catch (error) {
    console.error("Error:", error);
    return errorResponse(res, error);
  }
};

/**
 * GET ALL
 */
exports.getAllPlant3DModels = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const result = await getAllPlant3D({ 
      page,
      limit,
      businessUnit: req.businessUnit,
      host: req.get('host'),
      protocol: req.protocol
    
    });

    return successResponse(
      res,
      "Plant3D models fetched successfully",
      200,
      result,
      true
    );
  } catch (error) {
    console.error("Error fetching Plant3D models:", error);
    return errorResponse(res, error.message, 500);
  }
};

/**
 * GET BY ID
 */
exports.getPlant3DById = async (req, res) => {
  try {
    const result = await getPlant3DById({
      plant3DId: req.params.plant3DId,
      businessUnit: req.businessUnit,
      host: req.get('host'),
      protocol: req.protocol
    });

    if (!result) {
      return successResponse(res, "Plant3D model not found", 200, {}, false);
    }

    return successResponse(
      res,
      "Plant3D model fetched successfully",
      200,
      result,
      false
    );
  } catch (error) {
    console.error("Error fetching Plant3D model:", error);
    return errorResponse(res, error.message, 500);
  }
};

/**
 * EDIT
 */
exports.editPlant3DModel = async (req, res) => {
  try {
    await editPlant3D({
      body: req.body,
      userId: req.userId,
    });

    return successResponse(
      res,
      "Plant3D updated successfully",
      200,
      null,
      false
    );
  } catch (error) {
    console.error("Error editing Plant3D:", error);
    return errorResponse(res, error.message, 500);
  }
};

/**
 * DELETE (single / bulk)
 */
exports.deletePlant3DModels = async (req, res) => {
  try {
    const plant3DIds = Array.isArray(req.body.plant3DIds)
      ? req.body.plant3DIds
      : req.params.plant3DId
      ? [req.params.plant3DId]
      : [];

    await deletePlant3D({
      plant3DIds,
      userId: req.userId,
    });

    return successResponse(
      res,
      "Plant3D deleted successfully",
      200,
      null,
      false
    );
  } catch (error) {
    console.error("Error deleting Plant3D:", error);
    return errorResponse(res, error);
  }
};
