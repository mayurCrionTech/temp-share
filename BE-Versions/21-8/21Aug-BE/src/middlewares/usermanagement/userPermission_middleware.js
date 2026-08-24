/**
 * This file will contain the middlewares for valdiating the userPermission request body
 */
const userPermissionManager = require("../../managers/internalManagers/userManagement/userPermission_manager");
const apiResponseHandler = require("../../managers/common/apiResponseHandler_manager");



const validateUserPermission = async (req, res, next) => {

    if (req.body.userPermission || req.params.userPermission || req.query.userPermission) {// Check if userPermission is in req.params
        if (req.params.userPermission && typeof req.params.userPermission === 'string') {
            req.userPermission = req.params.userPermission;
        }
        else if (req.query.userPermission && typeof req.query.userPermission === 'string') {
            req.userPermission = req.query.userPermission;
        }
        // If not, check if userPermission is in req.body
        else if (req.body.userPermission && typeof req.body.userPermission === 'string') {
            req.userPermission = req.body.userPermission;
        }
        // If userPermission is not in req.params or req.body, return an error response
        else {
            return apiResponseHandler.errorResponse(null, req,
                res,
                "UserPermission id must be a non-empty string in req.params or req.body",
                400,
                null
            );
        }



        // Check if the userPermission with the given ID exists
        let checkExistingUserPermission = await userPermissionManager.checkExistingUserPermissionId(req.userPermission);

        if (checkExistingUserPermission) {
            next();
        } else {
            return apiResponseHandler.errorResponse(null, req,
                res,
                "Failed! UserPermission does not exist",
                400,
                null
            );
        }
    }
    else {
        next();
    }
}


const checkUserPermissionsIsArray = async (req, res, next) => {
    if (req.body.userPermissions && Array.isArray(req.body.userPermissions) && req.body.userPermissions.length > 0) {
        next();
    }
    else {
        return apiResponseHandler.errorResponse(null, req,
            res,
            "Permissions must be a non-empty array of objects",
            400,
            null
        );
    }
}
// Middleware function to validate each user permission object in the array
const validateUserPermissionsArray = async (req, res, next) => {
    try {
        for (const userPermission of req.body.userPermissions) {
            if (!userPermission.id || typeof userPermission.id !== 'string') {
                return apiResponseHandler.errorResponse(null, req,
                    res,
                    "userPermissionId must be a non-empty string in each permission object",
                    400,
                    null
                );
            }

            const existingUserPermission = await userPermissionManager.checkExistingUserPermissionId(userPermission.id);
            if (!existingUserPermission) {
                return apiResponseHandler.errorResponse(null, req,
                    res,
                    `Failed! UserPermission ${userPermission.id} does not exist`,
                    400,
                    null
                );
            }
        }
        next();
    } catch (error) {
        console.log("Error validating user permissions:", error);
        return apiResponseHandler.errorResponse(error, req, res, "Some internal server error", 500, null);
    }
};



const verifyUserPermissionReqBody = {
    validateUserPermission: validateUserPermission,
    checkUserPermissionsIsArray: checkUserPermissionsIsArray,
    validateUserPermissionsArray: validateUserPermissionsArray
};


module.exports = verifyUserPermissionReqBody

