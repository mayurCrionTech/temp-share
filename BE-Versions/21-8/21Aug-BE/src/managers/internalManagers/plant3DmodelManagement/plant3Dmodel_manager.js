const {
  Plant3DModel,
  modelTypeEnum,
} = require("../../../models/mongoDB/plant3dManagement/plant3d_Model");
const UserUploaded3DModel = require("../../../models/mongoDB/userUploaded3DModels/userUploaded3DModels_Model");
const File = require("../../../models/mongoDB/fileSystem/fileSystem_model");
const { mongoDbManager } = require("../../dBManagers");
const fileManager = require("../fileSystem/fileSystem_manager");

/**
 * CREATE
 */
const createNewPlant3DModel = async ({ body, userId }) => {
  try {
    const plant3DDetails = {};

    const propertiesToExtract = [
      "name",
      "assetId",
      "modelId",
      "floor",
      "elevation",
      "longitude",
      "latitude",
      "location",
      "position",
      "rotation",
    ];

    propertiesToExtract.forEach((property) => {
      if (body[property] !== undefined) {
        plant3DDetails[property] = body[property];
      }
    });

    plant3DDetails.type = modelTypeEnum.PLANT3D_MODEL;
    plant3DDetails.isActive = true;
    plant3DDetails.createdBy = userId;
    plant3DDetails.updatedBy = userId;

    return await mongoDbManager.insertOne(Plant3DModel, plant3DDetails);
  } catch (error) {
    throw error;
  }
};

/**
 * GET ALL
 */
const getAllPlant3D = async ({ page, limit, businessUnit, host, protocol }) => {
  try {
    const skip = (page - 1) * limit;

    const plant3Ds = await mongoDbManager.findManyWithPopulate(
      Plant3DModel,
      { isActive: true },
      limit,
      skip,
      { createdAt: -1 }
    );

    const totalPlant3Ds = await mongoDbManager.count(Plant3DModel, {
      isActive: true,
    });
    const totalPages = Math.ceil(totalPlant3Ds / limit);

    const data = await Promise.all(
      plant3Ds.map((plant) =>
        enrichPlant3D({
          plant,
          businessUnit,
          host,
          protocol,
        })
      )
    );

    return {
      page,
      totalPages,
      totalDataCount: totalPlant3Ds,
      data,
    };
  } catch (error) {
    throw error;
  }
};

/**
 * GET BY ID
 */
const getPlant3DById = async ({ plant3DId, businessUnit, host, protocol }) => {
  try {
    const plant = await mongoDbManager.findOne(Plant3DModel, {
      _id: plant3DId,
      isActive: true,
    });

    if (!plant) return null;

    return enrichPlant3D({
      plant,
      businessUnit,
      host,
      protocol,
    });
  } catch (error) {
    throw error;
  }
};

/**
 * EDIT
 */
const editPlant3D = async ({ body, userId }) => {
  try {
    const { plant3DId, model, layoutImage } = body;

    const updatePayload = {};
    const propertiesToUpdate = [
      "name",
      "assetId",
      "modelId",
      "position",
      "rotation",
      "floor",
      "elevation",
      "longitude",
      "latitude",
      "location",
    ];

    propertiesToUpdate.forEach((property) => {
      if (body[property] !== undefined) {
        updatePayload[property] = body[property];
      }
    });

    const payload = {
      ...updatePayload,
      updatedBy: userId,
    };
    await mongoDbManager.updateOne(Plant3DModel, { _id: plant3DId }, payload);

    const plant3D = await mongoDbManager.findOne(Plant3DModel, {
      _id: plant3DId,
    });

    if (model?.id || layoutImage?.id) {
      const userUploadedUpdate = { updatedBy: userId };

      if (model?.id) userUploadedUpdate.path3D = model.id;
      if (layoutImage?.id) userUploadedUpdate.path2D = layoutImage.id;

      await UserUploaded3DModel.updateOne(
        { _id: plant3D.modelId },
        { $set: userUploadedUpdate }
      );
    }
  } catch (error) {
    throw error;
  }
};

/**
 * DELETE
 */
const deletePlant3D = async ({ plant3DIds, userId }) => {
  try {
    if (!plant3DIds.length) return;

    await mongoDbManager.updateMany(
      Plant3DModel,
      { _id: { $in: plant3DIds } },
      { isActive: false, updatedBy: userId }
    );
  } catch (error) {
    throw error;
  }
};

const enrichPlant3D = async ({ plant, businessUnit, host, protocol }) => {
  let model = null;

  if (plant.modelId) {
    const userModel = await mongoDbManager.findOne(UserUploaded3DModel, {
      _id: plant.modelId,
    });

    if (userModel) {
      let file3D = null;
      let file2D = null;

      // ---------- 3D FILE ----------
      if (userModel.path3D) {
        const fileDoc3D = await mongoDbManager.findOne(File, {
          _id: userModel.path3D,
        });

        if (fileDoc3D) {
          const fileResponse3D = await fileManager.getFile(
            fileDoc3D._id,
            "production",
            businessUnit,
            host,
            protocol
          );

          file3D = {
            url: fileResponse3D?.url || null,
            name: fileDoc3D.name,
            extension: fileDoc3D.extension,
            size: fileDoc3D.size,
            type: fileDoc3D.contentType,
            fileId: fileDoc3D._id,
          };
        }
      }

      // ---------- 2D FILE ----------
      if (userModel.path2D) {
        const fileDoc2D = await mongoDbManager.findOne(File, {
          _id: userModel.path2D,
        });
        if (fileDoc2D) {
          const fileResponse2D = await fileManager.getFile(
            fileDoc2D._id,
            "production",
            businessUnit,
            host,
            protocol
          );

          file2D = {
            url: fileResponse2D?.url || null,
            name: fileDoc2D.name,
            extension: fileDoc2D.extension,
            size: fileDoc2D.size,
            type: fileDoc2D.contentType,
            fileId: fileDoc2D._id,
          };
        }
      }

      model = {
        id: userModel._id,
        name: userModel.name,
        version: userModel.version,
        isActive: userModel.isActive,
        model3d: file3D,
        model2d: file2D,
      };
    }
  }

  return {
    id: plant._id,
    name: plant.name || "",
    asset: plant.asset || null,
    model,
    type: plant.type || "",
    location: plant.location || "",
    latitude: plant.latitude || 0,
    longitude: plant.longitude || 0,
    elevation: plant.elevation || 0,
    floor: plant.floor || "",
    position: plant.position || {},
    rotation: plant.rotation || {},
    isActive: plant.isActive,
    createdBy: plant.createdBy || null,
    updatedBy: plant.updatedBy || null,
    createdDate: plant.createdAt || null,
    updatedDate: plant.updatedAt || null,
  };
};

module.exports = {
  createNewPlant3DModel,
  getAllPlant3D,
  getPlant3DById,
  editPlant3D,
  deletePlant3D,
};
