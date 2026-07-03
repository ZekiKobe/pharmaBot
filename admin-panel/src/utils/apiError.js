export class ApiError extends Error {
  constructor(message, { status, fieldErrors = {}, errors = [] } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.fieldErrors = fieldErrors;
    this.errors = errors;
  }
}
