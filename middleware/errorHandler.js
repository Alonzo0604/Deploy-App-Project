const createError = require('http-errors');

// Handle 404 Not Found
const notFoundHandler = (req, res, next) => {
  next(createError(404, 'Resource not found'));
};

// General Error Handler
const errorHandler = (err, req, res, next) => {
  const statusCode = err.status || 500;
  const errorMessage = err.message || 'Internal Server Error';

  // Log error for debugging (optional)
  console.error(`[${statusCode}] ${errorMessage}`, err.stack || '');

  res.status(statusCode).json({
    status: statusCode,
    message: errorMessage,
    details: err.details || null, // Optional: Provide error details
  });
};

module.exports = { notFoundHandler, errorHandler };
