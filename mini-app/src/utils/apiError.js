export class ApiError extends Error {
  constructor(message, { status, fieldErrors = {}, errors = [] } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.fieldErrors = fieldErrors;
    this.errors = errors;
  }
}

export function getFieldError(fieldErrors, field) {
  return fieldErrors?.[field] || '';
}

export function hasFieldError(fieldErrors, field) {
  return Boolean(fieldErrors?.[field]);
}

export function fieldClass(fieldErrors, field, base = 'app-input') {
  return hasFieldError(fieldErrors, field)
    ? `${base} border-red-400 ring-2 ring-red-100 focus:border-red-500 focus:ring-red-100`
    : base;
}
