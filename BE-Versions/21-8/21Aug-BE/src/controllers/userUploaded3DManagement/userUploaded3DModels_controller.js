const { successResponse, errorResponse } = require('../../managers/common/apiResponseHandler_manager');
const userUploaded3DManager = require('../../managers/internalManagers/userUpload3DManagement/userUpload3D_manager');

exports.addUserUploaded3Dmodel = async (req, res) => {
  try {
    const created = await userUploaded3DManager.createUserUploaded3D({
      body: req.body,
      userId: req.userId,
    });

    return successResponse(
      res,
      'UserUploaded Model created successfully',
      201,
      { id: created._id }
    );
  } catch (error) {
    console.error(error);
    return errorResponse(res, error);
  }
};

exports.editUserUploaded3DModel = async (req, res) => {
  try {
    const { userUploaded3DId } = req.params;

    if (!userUploaded3DId) {
      return errorResponse(res, 'userUploaded3DId is required', 400);
    }



    await userUploaded3DManager.editUserUploaded3D({
      userUploaded3DId,
      body: req.body,
      userId: req.userId,
    });

    return successResponse(
      res,
      'UserUploaded3D updated successfully',
      200,
      { id: userUploaded3DId },
      true
    );
  } catch (error) {
    console.error('Edit UserUploaded3D Error:', error);
    return errorResponse(res, error);
  }
};

exports.getAllUserUploaded3DModels = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const result = await userUploaded3DManager.getAllUserUploaded3D(
      { page,
        limit,
        businessUnit: req.businessUnit,
        host: req.get('host'),
        protocol: req.protocol,
       }
    );

    return successResponse(
      res,
      'userUploaded3DModel fetched successfully',
      200,
      result,
      true
    );
  } catch (error) {
    console.error('Error fetching userUploaded3DModels:', error);
    return errorResponse(res, error.message, 500);
  }
};

exports.getUserUploaded3DById = async (req, res) => {
  try {
    const { userUploaded3DId } = req.params;

    const result = await userUploaded3DManager.getUserUploaded3DById({
      userUploaded3DId,
      businessUnit: req.businessUnit,
      host: req.get('host'),
      protocol: req.protocol,
    });

    if (!result) {
      return successResponse(res, 'userUploaded3dModel not found', {}, 200, false);
    }

    return successResponse(
      res,
      'userUploaded3dModel fetched successfully',
      200,
      result,
      false
    );
  } catch (error) {
    console.error('Error fetching userUploaded3DById:', error);
    return errorResponse(res, error.message, 500);
  }
};

exports.deleteUserUploaded3DModel = async (req, res) => {
  try {
    await userUploaded3DManager.deleteUserUploaded3D({
      modelIds: req.body.modelIds,
      userId: req.userId,
    });

    return successResponse(
      res,
      'UserUploaded3D models deleted successfully',
      200,
      null,
      false
    );
  } catch (error) {
    console.log('Error', error);
    return errorResponse(res, error);
  }
};

