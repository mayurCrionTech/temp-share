const jwt = require("jsonwebtoken");
const config = require("../../configs/auth_config");
const apiResponseHandler = require("../../managers/common/apiResponseHandler_manager");
// CR0016
const Token = require("../../models/mongoDB/tokenManagement/token_model");
const { securityConfig } = require("../../configs/index.js");
const crypto = require("crypto");


// const verifyToken = (req, res, next) => {
//   // let token = req.headers["x-access-token"];
//   if (!req.headers.authorization) {
//     return apiResponseHandler.errorResponse(null, req, 
//       res,
//       "Unauthorized! No token provided!",
//       401
//     );
//   }
//   const token = req.headers.authorization.split(" ")[1];
//   if (!token) {
//     return apiResponseHandler.errorResponse(null, req, 
//         res,
//         "Unauthorized! No token provided!",
//         401
//       );
//   }
//   jwt.verify(token, config.SECRET, (err, decoded) => {
//     if (err) {
//         return apiResponseHandler.errorResponse(err, req, 
//             res,
//             "Unauthorized! Invalid token provided!",
//             401
//           );
//     }
//     req.userId = decoded.id;
//     req.businessUnit = decoded.businessUnit;
//     next();
//   });
// };

// const verifyToken = (req, res, next) => {
  
//   if (!req.headers.authorization) {
//     return apiResponseHandler.errorResponse(null, req,
//       res,
//       "Unauthorized! No token provided!",
//       401
//     );
//   }
//   const token = req.headers.authorization.split(" ")[1];
  
  
//   if (!token) {
//     return apiResponseHandler.errorResponse(null, req,
//       res,
//       "Unauthorized! No token provided!",
//       401
//     );
//   }

//   verifyTokenAndGetUser(token)
//     .then((decoded) => {
//       req.userId = decoded.id;
//       req.businessUnit = decoded.businessUnit;
//       req.isSuperAdmin = decoded.isSuperAdmin;
//       req.department = decoded.department;
//       next();
//     })
    
//     .catch((error) => {
//       return apiResponseHandler.errorResponse(error, req,
//         res,
//         "Unauthorized! Invalid token provided!",
//         401
//       );
//     });
// };

// CR0016
const verifyToken = async (req, res, next) => {
  try {
    if (!req.headers.authorization) {
      return apiResponseHandler.errorResponse(null, req, res,
        "Unauthorized! No token provided!", 401
      );
    }

    const token = req.headers.authorization.split(" ")[1];

    if (!token) {
      return apiResponseHandler.errorResponse(null, req, res,
        "Unauthorized! No token provided!", 401
      );
    }

    // 1: Verify JWT
    const decoded = await verifyTokenAndGetUser(token);

    // 2: Check token in DB
    // const tokenDoc = await Token.findOne({ token });
    const tokenDoc = await Token.findOne({
      token,
      userId: decoded.id
    });

    if (!tokenDoc) {
      return apiResponseHandler.errorResponse(null, req, res,
        "Unauthorized! Token revoked or invalid!", 401
      );
    }

    // 3: Check User-Agent (fingerprint)
    const currentUA = req.headers["user-agent"];

    if (tokenDoc.userAgent !== currentUA) {
      return apiResponseHandler.errorResponse(null, req, res,
        "Unauthorized! Device mismatch detected!", 401
      );
    }

    // 4: Optional IP check
    const currentIP = req.ip;

    if (tokenDoc.ip && tokenDoc.ip !== currentIP) {
      return apiResponseHandler.errorResponse(null, req, res,
        "Unauthorized! IP missmatch!", 401
      );
    }

    // 5: secretKey

    const incomingKey = req.headers["x-device-key"];

    const hashedIncoming = crypto
      .createHmac("sha256", securityConfig.SECRET_HMAC_KEY)
      .update(incomingKey || "")
      .digest("hex");


    if (!incomingKey || tokenDoc.secretKey !== hashedIncoming) {
      return apiResponseHandler.errorResponse(null, req, res,
      "Unauthorized! Invalid device key!", 401
      );
    }

    // Attach user data
    req.user = decoded;
    req.userId = decoded.id;
    req.businessUnit = decoded.businessUnit;
    req.isSuperAdmin = decoded.isSuperAdmin;
    req.department = decoded.department;

    next();

  } catch (error) {
    return apiResponseHandler.errorResponse(error, req, res,
      "Unauthorized! Invalid token provided!", 401
    );
  }
};

const verifyIsSuperAdmin = async (req, res, next) => {
  // Validate request
  if (!req.isSuperAdmin) {
    return apiResponseHandler.errorResponse(null, req,
      res,
      "Unauthorized! User is not super admin",
      401,
      null
    );
  }
  next();
};

// New function to verify token
const verifyTokenAndGetUser = (token) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, config.SECRET, (err, decoded) => {
      if (err) {
        return reject(err);
      }
      resolve(decoded);
    });
  });
};

// Function to verify token and return userId
const getUserIdFromToken = async (token, client) => {
  try {
    const decoded = await verifyTokenAndGetUser(token);
    return decoded.id;
  } catch (err) {
    console.log("Error", err);
    client.emit("error", { status: 400, message: "Invalid token" });
  }
};

module.exports = {
  verifyToken,
  getUserIdFromToken,
  verifyIsSuperAdmin,
 
};
// module.exports = authJwtMiddleware;
