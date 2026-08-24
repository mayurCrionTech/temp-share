const crypto = require("crypto");

const requestContext = (req, res, next) => {
  req.transactionId = crypto.randomUUID();
  next();
};

module.exports = { requestContext };
