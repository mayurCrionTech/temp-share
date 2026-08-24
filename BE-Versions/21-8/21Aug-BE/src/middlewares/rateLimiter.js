/**
 * In-memory rate limiter middleware for API routes.
 * Configurable via env: RATE_LIMIT_WINDOW_MS (default 60000ms), RATE_LIMIT_MAX (default 100).
 * Applies per IP address.
 */
const WINDOW_MS = Number(process.env.RATE_LIMIT_WINDOW_MS) || 60000;
const MAX_REQUESTS = Number(process.env.RATE_LIMIT_MAX) || 100;

const requestCounts = new Map();

function rateLimiter(req, res, next) {
  try {
    const key = req.ip || req.connection.remoteAddress;
    const now = Date.now();

    if (!requestCounts.has(key)) {
      requestCounts.set(key, { count: 1, windowStart: now });
      return next();
    }

    const entry = requestCounts.get(key);
    if (now - entry.windowStart > WINDOW_MS) {
      entry.count = 1;
      entry.windowStart = now;
      return next();
    }

    entry.count++;
    if (entry.count > MAX_REQUESTS) {
      return res.status(429).json({
        message: "Too many requests. Please try again later.",
      });
    }

    next();
  } catch (err) {
    next();
  }
}

// Cleanup stale entries every 60 seconds
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of requestCounts) {
    if (now - entry.windowStart > WINDOW_MS * 2) {
      requestCounts.delete(key);
    }
  }
}, 60000);

module.exports = { rateLimiter };
