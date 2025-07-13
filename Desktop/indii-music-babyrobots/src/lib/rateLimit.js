const rateLimit = {};

export const applyRateLimit = ({ req, res, limit = 10, windowMs = 60 * 1000 }) => {
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  if (!ip) {
    console.warn('Could not determine IP address for rate limiting.');
    return true; // Allow if IP cannot be determined
  }

  if (!rateLimit[ip]) {
    rateLimit[ip] = { count: 0, lastReset: Date.now() };
  }

  const now = Date.now();
  if (now - rateLimit[ip].lastReset > windowMs) {
    rateLimit[ip].count = 0;
    rateLimit[ip].lastReset = now;
  }

  rateLimit[ip].count++;

  if (rateLimit[ip].count > limit) {
    res.status(429).json({ message: 'Too many requests, please try again later.' });
    return false; // Block request
  }

  return true; // Allow request
};
