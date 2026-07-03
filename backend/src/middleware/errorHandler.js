const multer = require('multer');
const logger = require('../utils/logger');

const errorHandler = (err, req, res, _next) => {
  logger.error(`${err.message}`, { stack: err.stack });

  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ success: false, message: messages.join(', ') });
  }

  if (err.code === 11000) {
    return res.status(400).json({ success: false, message: 'Duplicate field value entered.' });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({ success: false, message: 'Invalid ID format.' });
  }

  if (err instanceof multer.MulterError) {
    const imageField = req.file?.fieldname || (req.route?.path?.includes('payment') ? 'screenshot' : 'medicineImage');
    const message = err.code === 'LIMIT_FILE_SIZE' ? 'Image must be under 5MB' : err.message;
    return res.status(400).json({
      success: false,
      message,
      fieldErrors: { [imageField]: message },
    });
  }

  if (err.message === 'Only image files are allowed') {
    const imageField = req.file?.fieldname || (req.route?.path?.includes('payment') ? 'screenshot' : 'medicineImage');
    return res.status(400).json({
      success: false,
      message: err.message,
      fieldErrors: { [imageField]: 'Only image files are allowed (JPEG, PNG, GIF, WebP)' },
    });
  }

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal server error',
  });
};

module.exports = errorHandler;
