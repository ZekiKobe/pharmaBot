const { validationResult } = require('express-validator');
const { formatValidationErrors } = require('../utils/formatValidationErrors');

const validate = (req, res, next) => {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    const { message, fieldErrors, errors } = formatValidationErrors(result.array());
    return res.status(400).json({
      success: false,
      message,
      fieldErrors,
      errors,
    });
  }
  next();
};

module.exports = validate;
