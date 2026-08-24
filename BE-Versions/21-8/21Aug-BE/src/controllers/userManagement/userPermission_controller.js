/**
 * This is the controller for the user resource
 */

const apiResponseHandler = require("../../managers/common/apiResponseHandler_manager");
const userPermissionManager = require("../../managers/internalManagers/userManagement/userPermission_manager");

exports.updateUserPermission = async (req, res) => {
	try {
		const userPermissionReqObj = updateUserPermissionObject(req);
		const userPermission = await userPermissionManager.updateUserPermission(
			req.params.userPermission,
			userPermissionReqObj
		);
		const message = "User permission updated successfully";
		return apiResponseHandler.successResponse(res, message, 200, null);
	} catch (error) {
		console.log("Error while updating user permission", error.message);
		return apiResponseHandler.errorResponse(error, req, res, "Some internal server error", 500, null);
	}
};

exports.updateMultipleUserPermissions = async (req, res) => {
	try {
		const userPermissions = await userPermissionManager.updateUserPermissions(
			req.body.userPermissions,
			req.userId
		);
		if (userPermissions.modifiedCount === req.body.userPermissions.length) {
			const message = "User permissions updated successfully";
			return apiResponseHandler.successResponse(res, message, 200, null);
		} else {
			return apiResponseHandler.errorResponse(null, req,
				res,
				"Some user permissions failed to update",
				500,
				null
			);
		}
	} catch (error) {
		console.log("Error while updating user permission", error.message);
		return apiResponseHandler.errorResponse(error, req, res, "Some internal server error", 500, null);
	}
};

const updateUserPermissionObject = (req) => {
	const updateObject = {
		updatedBy: req.userId
	};
	if (req.body.positivePermissions) {
		updateObject.positivePermissions = req.body.positivePermissions;
	}
	if (req.body.negativePermissions) {
		updateObject.negativePermissions = req.body.negativePermissions;
	}
	return updateObject;
};
