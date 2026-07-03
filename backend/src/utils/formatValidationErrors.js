/**
 * Turn express-validator errors into a clear API response.
 */
function formatValidationErrors(errors) {
  const fieldErrors = {};

  for (const err of errors) {
    const field = err.path || err.param;
    if (!field) continue;
    if (!fieldErrors[field]) {
      fieldErrors[field] = err.msg;
    }
  }

  const messages = Object.values(fieldErrors);
  const message =
    messages.length === 1
      ? messages[0]
      : `Please fix the following: ${messages.join('; ')}`;

  return { message, fieldErrors, errors };
}

module.exports = { formatValidationErrors };
