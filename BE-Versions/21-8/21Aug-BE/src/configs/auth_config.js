if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

module.exports = {
	SECRET: process.env.JWT_SECRET,
  EXPIRES_IN: process.env.JWT_EXPIRES_IN,
};
