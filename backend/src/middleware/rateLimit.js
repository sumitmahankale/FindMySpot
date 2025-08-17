/* eslint-env node */
// Simple in-memory rate limiter (per IP + route) for burst control.
// For production, replace with Redis or a library like express-rate-limit.

const WINDOW_MS = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10); // 1 min
const MAX_REQUESTS = parseInt(process.env.RATE_LIMIT_MAX || '100', 10); // per window

const buckets = new Map();

module.exports = function rateLimit(req, res, next) {
  const key = `${req.ip}:${req.baseUrl || ''}:${req.path}`;
  const now = Date.now();
  let entry = buckets.get(key);
  if (!entry) {
    entry = { count: 1, start: now };
    buckets.set(key, entry);
    return next();
  }
  if (now - entry.start > WINDOW_MS) {
    // Reset window
    entry.count = 1;
    entry.start = now;
    return next();
  }
  entry.count += 1;
  if (entry.count > MAX_REQUESTS) {
    return res.status(429).json({ error: 'Too many requests, slow down' });
  }
  return next();
};
