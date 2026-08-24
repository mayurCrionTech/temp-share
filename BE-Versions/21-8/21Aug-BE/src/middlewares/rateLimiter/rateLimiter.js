/*
date              cr/qid      comments
07-april-2026     CR0009      [Added] - added rate limiter middleware
*/

const rateLimit = require("express-rate-limit");

// Login limiter
const loginLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 mins
  // max: 5,
  max: 10, // 10 attempts //updated from 5 to 10 to allow attempts //CR0009
  //   message: "Too many login attempts. Try again later.",
  message: {
    status: 429,
    message: "Too many requests, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// General API limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 100,
  message: {
    status: 429,
    message: "Too many requests, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const uploadLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 min
  max: 5,
  message: {
    status: 429,
    message: "Upload limit exceeded. Try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  loginLimiter,
  apiLimiter,
  uploadLimiter,
};
