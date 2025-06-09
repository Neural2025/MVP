const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  logger.error('Error occurred:', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  // Default error
  let error = {
    status: 'error',
    message: 'Internal server error'
  };

  // Validation errors
  if (err.message.includes('required') || err.message.includes('exceeds') || err.message.includes('malicious')) {
    return res.status(400).json({
      status: 'error',
      message: err.message
    });
  }

  // Rate limit errors
  if (err.status === 429) {
    return res.status(429).json({
      status: 'error',
      message: 'Too many requests, please try again later'
    });
  }

  // API errors
  if (err.message.includes('API') || err.message.includes('DeepSeek')) {
    return res.status(502).json({
      status: 'error',
      message: 'External API error, please try again later'
    });
  }

  // JSON parsing errors
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      status: 'error',
      message: 'Invalid JSON format'
    });
  }

  // Default 500 error
  res.status(500).json(error);
};

module.exports = errorHandler;
