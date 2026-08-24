/*
date              cr/qid      comments
13-march-2026     CR0010      [Added] - Permission checking middleware added
*/

const apiResponseHandler = require("../../managers/common/apiResponseHandler_manager");

const checkPermission = (module, action) => {
  return (req, res, next) => {
    try {

      if (req.user?.isSuperAdmin) {
        return next();
      }

      const permissions = req.user?.permissions;

      if (!permissions?.[module]?.[action]) {
        return apiResponseHandler.errorResponse(
          null,
          req,
          res,
          "Unauthorized!",
          403,
          null,
        );
      }

      next();
    } catch (error) {
      return apiResponseHandler.errorResponse(
        error,
        req,
        res,
        "Authorization error",
        500,
        null,
      );
    }
  };
};

module.exports = { checkPermission };
