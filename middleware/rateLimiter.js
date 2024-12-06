const rateLimit = require('express-rate-limit');

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: 100, // Maksimal 100 permintaan per 15 menit
  message: { message: 'Too many requests, please try again later.' },
});

module.exports = { apiLimiter };