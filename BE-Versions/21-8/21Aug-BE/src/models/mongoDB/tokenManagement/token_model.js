/*
date              cr/qid      comments
13-march-2026     CR0016      [Added] - New Model for managing user login and logut with finger printing as well as secret key
*/
const mongoose = require("mongoose");

const tokenSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    token: {
      type: String,
      required: true,
    },
    userAgent: {
      type: String,
    },
    ip: {
      type: String,
    },
    secretKey: {
      type: String,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Token", tokenSchema);
