const { validationResult } = require('express-validator');

const notFound = (req, res, next) => {
  res.status(404).json({ 
    success: false,
    message: `Not Found - ${req.originalUrl}` 
  });
};

// central error handler
const errorHandler = (err, req, res, next) => {
  console.error(err);
  const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
};

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ 
      success: false,
      message: 'Validation failed',
      errors: errors.array() 
    });
  }
  next();
};

module.exports = {
  notFound,
  errorHandler,
  handleValidationErrors
};
