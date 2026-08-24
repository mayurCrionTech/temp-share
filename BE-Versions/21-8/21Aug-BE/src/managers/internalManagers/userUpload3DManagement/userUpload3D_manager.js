
const userUploaded3DModel = require('../../../models/mongoDB/userUploaded3DModels/userUploaded3DModels_Model');
const File = require('../../../models/mongoDB/fileSystem/fileSystem_model');
const fileManager = require('../fileSystem/fileSystem_manager');
const { mongoDbManager } = require('../../dBManagers');

const bytesToKB = (size) => (size / 1024).toFixed(2);

const createUserUploaded3D = async ({ body, userId }) => {
  try {
    const { name, model, layoutImage } = body;

  if (!name || !model || !layoutImage) {
    throw 'Name, model, and layoutImage are required.';
  }

  const userUploadedDoc = {
    name,
    displayName3D: model.name || '',
    path3D: model.id || '',
    size3D: bytesToKB(model.size) || '',
    extension3D: model.extension || '',
    type3D: model.contentType || '',

    displayName2D: layoutImage.name || '',
    path2D: layoutImage.id || '',
    size2D: bytesToKB(layoutImage.size) || '',
    extension2D: layoutImage.extension || '',
    type2D: layoutImage.contentType || '',

    createdBy: userId,
    updatedBy: userId,
    isActive: true,
    version: 1,
  };

  return mongoDbManager.insertOne(userUploaded3DModel, userUploadedDoc);
  } catch (error) {
    throw error;
  }
};

const editUserUploaded3D = async ({ userUploaded3DId, body, userId }) => {
try {
  
const existing = await mongoDbManager.findOne(userUploaded3DModel, { _id: userUploaded3DId, isActive: true });

  if (!existing) {
    throw 'UserUploaded Model not found or inactive';
  }

  const { name, model3d, model2d } = body;


  const updateDoc = {
    name: name || existing.name,

    displayName3D: model3d?.name || existing.displayName3D,
    path3D: model3d?.id || existing.path3D,
    size3D: model3d?.size ? bytesToKB(model3d.size) : existing.size3D,
    extension3D: model3d?.extension || existing.extension3D,
    type3D: model3d?.contentType || existing.type3D,

    displayName2D: model2d?.name || existing.displayName2D,
    path2D: model2d?.id || existing.path2D,
    size2D: model2d?.size ? bytesToKB(model2d.size) : existing.size2D,
    extension2D: model2d?.extension || existing.extension2D,
    type2D: model2d?.contentType || existing.type2D,

    updatedBy: userId,
    version: existing.version ? existing.version + 1 : 1,
  };

//   await userUploaded3DModel.updateOne({ _id: userUploaded3DId }, updateDoc);
  await mongoDbManager.updateOne(userUploaded3DModel, { _id: userUploaded3DId }, updateDoc);
} catch (error) {
  throw error;
}
};

const getAllUserUploaded3D = async ({ page, limit,businessUnit,  host,  protocol, }) => {
 try {
   const skip = (page - 1) * limit;

  const models = await mongoDbManager.findManyWithPopulate(userUploaded3DModel, { isActive: true }, limit, skip, { createdDate: -1 });

  const total = await mongoDbManager.count(userUploaded3DModel, { isActive: true });

  const data = await Promise.all(models.map((model) => enrichUserUploaded3D({
        model,
        businessUnit,
        host,
        protocol})));

  return {
    page,
    totalPages: Math.ceil(total / limit) || 1,
    totalDataCount: total,
    data,
  };
 } catch (error) {
  throw error
 }
};

const getUserUploaded3DById = async ({ userUploaded3DId, businessUnit, host, protocol }) => {
 try {
   if (!userUploaded3DId) return null;

  const model = await mongoDbManager.findOne(userUploaded3DModel, { _id: userUploaded3DId, isActive: true });
  if (!model) return null;

  return enrichUserUploaded3DSingle(model, businessUnit, host, protocol);
 } catch (error) {
  throw error
 }
};

const deleteUserUploaded3D = async ({ modelIds, userId }) => {
  try {
      await mongoDbManager.updateMany(userUploaded3DModel, { _id: { $in: modelIds } }, { $set: { isActive: false, updatedBy: userId } });

  } catch (error) {
    throw error    
  }
};

const enrichUserUploaded3D = async ({
  model,
  businessUnit,
  host,
  protocol,
}) => {
  try {
    let model3d = null;
  let model2d = null;

  // ---------- 3D FILE ----------
  if (model.path3D) {
    const file3D = await mongoDbManager.findOne(File, { _id: model.path3D });

    if (file3D) {
      const fileResponse = await fileManager.getFile(
        file3D._id,
        'production',
        businessUnit,
        host,
        protocol
      );

      model3d = {
        id: file3D._id,
        name: file3D.name,
        extension: file3D.extension,
        size: file3D.size,
        contentType: file3D.contentType,
        url: fileResponse?.url || null,
      };
    }
  }

  // ---------- 2D FILE ----------
  if (model.path2D) {
    const file2D = await mongoDbManager.findOne(File, { _id: model.path2D });

    if (file2D) {
      const fileResponse = await fileManager.getFile(
        file2D._id,
        'production',
        businessUnit,
        host,
        protocol
      );

      model2d = {
        id: file2D._id,
        name: file2D.name,
        extension: file2D.extension,
        size: file2D.size,
        contentType: file2D.contentType,
        url: fileResponse?.url || null,
      };
    }
  }

  return {
    id: model._id,
    name: model.name || '',
    version: model.version || 1,
    isActive: model.isActive,
    model3d,
    model2d,
    createdBy: model.createdBy || null,
    updatedBy: model.updatedBy || null,
    createdDate: model.createdDate || null,
    updatedDate: model.updatedDate || null,
  };
  } catch (error) {
    throw error
  }
};


const enrichUserUploaded3DSingle = async (model, businessUnit, host, protocol) => {
  try {
    const model3d = model.path3D
    ? await fileManager.getFile(model.path3D, 'production', businessUnit, host, protocol)
    : null;

  const model2d = model.path2D
    ? await fileManager.getFile(model.path2D, 'production', businessUnit, host, protocol)
    : null;

  return {
    id: model._id,
    name: model.name || '',
    version: model.version || 1,
    isActive: model.isActive,
    model3d: model3d
      ? {
          id: model3d._id,
          name: model3d.name,
          extension: model3d.extension,
          size: model3d.size,
          type: model3d.contentType,
          url: model3d.url,
        }
      : null,
    model2d: model2d
      ? {
          id: model2d._id,
          name: model2d.name,
          extension: model2d.extension,
          size: model2d.size,
          type: model2d.contentType,
          url: model2d.url,
        }
      : null,
    createdBy: model.createdBy || null,
    updatedBy: model.updatedBy || null,
    createdDate: model.createdDate || null,
    updatedDate: model.updatedDate || null,
  };
  } catch (error) {
    throw error
  }
};

module.exports = {
  createUserUploaded3D,
  editUserUploaded3D,
  getAllUserUploaded3D,
  getUserUploaded3DById,
  deleteUserUploaded3D,
};
