'use strict';

const { randomUUID } = require('node:crypto');

const definitions = Object.freeze({
  AUTH_REQUIRED: Object.freeze({ status: 401, message: 'Authentication is required.', retryable: false }),
  ADMIN_REQUIRED: Object.freeze({ status: 403, message: 'Administrator access is required.', retryable: false }),
  SERVICE_UNAVAILABLE: Object.freeze({ status: 503, message: 'The service is temporarily unavailable.', retryable: true }),
  INTERNAL_ERROR: Object.freeze({ status: 500, message: 'An internal error occurred.', retryable: false }),
  INVALID_PDF: Object.freeze({ status: 422, message: 'Upload a supported e-GP PDF within the stated limits.', retryable: false }),
  INVALID_COUNT: Object.freeze({ status: 400, message: 'Expected tender count must be between 1 and 400.', retryable: false }),
  PDF_TOO_LARGE: Object.freeze({ status: 413, message: 'The PDF exceeds the 10 MiB upload limit.', retryable: false }),
  PARSER_FAILED: Object.freeze({ status: 422, message: 'The PDF could not be verified. Check the layout and expected tender count.', retryable: false }),
  PARSER_TIMEOUT: Object.freeze({ status: 422, message: 'PDF validation exceeded the processing limit.', retryable: false }),
  PREVIEW_CHANGED: Object.freeze({ status: 409, message: 'Validate this PDF again before confirming the import.', retryable: false }),
  TENDER_CONFLICT: Object.freeze({ status: 409, message: 'An existing tender ID has different content. Review the conflict before importing.', retryable: false }),
});
const knownErrors = new WeakMap();

// Only locally created errors select public codes. Foreign exceptions are never inspected.
function publicCode(error) {
  return error !== null && (typeof error === 'object' || typeof error === 'function')
    ? knownErrors.get(error) || 'INTERNAL_ERROR' : 'INTERNAL_ERROR';
}

function createPublicError(code, requestIdDependencies) {
  const safeCode = Object.hasOwn(definitions, code) ? code : 'INTERNAL_ERROR';
  const error = new Error(definitions[safeCode].message);
  knownErrors.set(error, safeCode);
  Object.defineProperty(error, 'toJSON', { value: () => serializeError(error, requestIdDependencies) });
  return error;
}

function getErrorStatus(error) {
  return definitions[publicCode(error)].status;
}

function safeGeneratedId(generator) {
  try {
    const value = generator();
    return typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
      ? value : undefined;
  } catch { return undefined; }
}

function serializeError(error, { createRequestId = randomUUID, createFallbackRequestId = randomUUID } = {}) {
  // Both generators are trusted dependencies, never request-derived values.
  const requestId = safeGeneratedId(createRequestId) || safeGeneratedId(createFallbackRequestId) ||
    '00000000-0000-4000-8000-000000000000';
  const code = publicCode(error);
  const { message, retryable } = definitions[code];
  return { error: { code, message, requestId, retryable } };
}

module.exports = { createPublicError, getErrorStatus, serializeError };
