// const logger = require("../../utils/logger");

// exports.successResponse = function (res, message, status = 200, result) {
//   return res.status(status).json({
//     message,
//     result,
//   });
// };

// exports.errorResponse = function (error, req, res, message, status = 500, errorInfo) {
//   const errorDetails = {
//     message: error?.message, // Error message
//     stack: error?.stack, // Error stack trace
//     name: error?.name, // Error name (e.g., 'Error', 'TypeError', etc.)
//     ...error // Include additional properties if any exist on the error object
//   };
//   logger.warn({
//     error: errorDetails,
//     reqData: {
//       reqBody: req.body,
//       reqQuery: req.query,
//       reqHeaders: req.headers,
//       reqMethod: req.method,
//       ip: req.ip,
//       reqOriginalURL: req.originalUrl,
//       reqCookies: req.cookies,
//       userId: req.userId
//     },
//     resData: {
//       resBody: res.body,
//       resHeaders: res.headers,
//       resStatusCode: res.statusCode,
//       errorInfo: errorInfo,
//       message: message

//     }
//   }, message)
//   return res.status(status).json({
//     message,
//     errorInfo,
//   });
// };

// CR0019 - Improper Error Handling 
// Updated - Whole file (above - old code)

// const logger = require("../../utils/logger"); 

// // Success response
// exports.successResponse = function (res, message, status = 200, result) {
//   return res.status(status).json({
//     success: true,
//     message,
//     result,
//   });
// };

// // Error response (SECURE)
// exports.errorResponse = function (error, req, res, message, status = 500) {
  
//   // Prepare safe error details for logging only (NOT for client)
//   const errorDetails = {
//     message: error?.message,
//     name: error?.name,
//     stack: error?.stack
//   };

//   // Log everything internally (safe)
//   logger.warn(
//     {
//       error: errorDetails,
//       reqData: {
//         reqBody: req.body,
//         reqQuery: req.query,
//         reqHeaders: req.headers,
//         reqMethod: req.method,
//         ip: req.ip,
//         reqOriginalURL: req.originalUrl,
//         reqCookies: req.cookies,
//         userId: req.userId
//       },
//       resData: {
//         resStatusCode: status,
//         message: message
//       }
//     },
//     message
//   );

 
//   // DO NOT send internal error details to client // prod only env
//   return res.status(status).json({
//     success: false,
//     message:message,
//     // message:
//     //   process.env.NODE_ENV_ERR === "production" 
//     //     ? "Something went wrong"
//     //     : message
//   });
// };


const logger = require("../../utils/logger");

exports.successResponse = function (res, message, status = 200, result) {
  return res.status(status).json({
    message,
    result,
  });
};

exports.errorResponse = function (error, req, res, message, status = 500, errorInfo) {
  const errorDetails = {
    message: error?.message,
    stack: error?.stack,
    name: error?.name,
    ...error
  };
  // Derive function name from the route handler on the matched route
  const fnName = req?.route?.stack?.[req.route.stack.length - 1]?.name || null;
  logger.warn(logger.enrichMeta(req, {
    error: errorDetails,
    reqData: {
      reqBody: req.body,
      reqQuery: req.query,
      reqHeaders: req.headers,
      reqMethod: req.method,
      ip: req.ip,
      reqOriginalURL: req.originalUrl,
      reqCookies: req.cookies,
    },
    resData: {
      resBody: res.body,
      resHeaders: res.headers,
      resStatusCode: res.statusCode,
      errorInfo: errorInfo,
      message: message
    }
  }, fnName), message)
  return res.status(status).json({
    message,
    errorInfo,
  });
};
