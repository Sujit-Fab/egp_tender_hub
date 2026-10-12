'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { createAuthorizer } = require('../functions/tender-radar/auth');
const { createPublicError, getErrorStatus, serializeError } = require('../functions/tender-radar/errors');
const requestId = '12345678-1234-4123-8123-123456789abc';
const markers = ['PRIVATE_TOKEN_MARKER', 'PRIVATE_EMAIL_MARKER@example.invalid', 'PRIVATE_CLAIM_MARKER', 'PRIVATE_SDK_MARKER', 'PRIVATE_STACK_MARKER', 'C:/private/INTERNAL_PATH_MARKER', 'PRIVATE_UID_MARKER'];
function safe(value) {
  const serialized = JSON.stringify(value);
  for (const marker of markers) assert.equal(serialized.includes(marker), false);
}
function shape(response) {
  assert.deepEqual(Object.keys(response), ['error']);
  assert.deepEqual(Object.keys(response.error).sort(), ['code', 'message', 'requestId', 'retryable']);
}

test('unknown/raw exceptions cannot select codes or expose any private fields', () => {
  const raw = Object.assign(new Error(markers.join(' ')), {
    code: 'AUTH_REQUIRED', cause: markers[3], token: markers[0], email: markers[1],
    claims: markers[2], stack: markers[4], path: markers[5], uid: markers[6],
    toJSON() { throw new Error('must not invoke foreign serialization'); },
  });
  const response = serializeError(raw, { createRequestId: () => requestId });
  assert.deepEqual(response, { error: { code: 'INTERNAL_ERROR', message: 'An internal error occurred.', requestId, retryable: false } });
  assert.equal(getErrorStatus(raw), 500); shape(response); safe(response);
});
test('public errors serialize only allowlisted predefined data', () => {
  for (const [code, status, retryable] of [['AUTH_REQUIRED', 401, false], ['ADMIN_REQUIRED', 403, false], ['SERVICE_UNAVAILABLE', 503, true], ['INTERNAL_ERROR', 500, false]]) {
    const error = createPublicError(code);
    Object.assign(error, { message: markers[3], stack: markers[4], cause: markers[5], token: markers[0], email: markers[1], claims: markers[2] });
    const response = serializeError(error, { createRequestId: () => requestId });
    assert.equal(getErrorStatus(error), status); assert.equal(response.error.code, code);
    assert.equal(response.error.retryable, retryable); shape(response); safe(response); safe(error);
  }
  assert.equal(getErrorStatus(createPublicError('unrecognized')), 500);
});
test('request IDs use only trusted generator, never raw caller IDs', () => {
  const error = createPublicError('AUTH_REQUIRED');
  assert.equal(serializeError(error, { requestId: markers[0], createRequestId: () => requestId }).error.requestId, requestId);
  for (const createRequestId of [() => markers[0], () => { throw new Error(markers[3]); }]) {
    const response = serializeError(error, { createRequestId });
    assert.match(response.error.requestId, /^[0-9a-f-]{36}$/); safe(response);
  }
});
test('Auth success/failure emits no application logs or private error serialization', async () => {
  const logs = [];
  const originals = {};
  for (const method of ['log', 'info', 'warn', 'error', 'debug', 'trace']) {
    originals[method] = console[method]; console[method] = (...args) => logs.push(args);
  }
  try {
    for (const stage of ['success', 'verify', 'lookup', 'non-admin']) {
      const raw = Object.assign(new Error(markers.join(' ')), { code: 'auth/internal-error', stack: markers[4], cause: markers[5] });
      const authorize = createAuthorizer({
        async verifyIdToken() { if (stage === 'verify') throw raw; return { uid: markers[6], admin: true, email: markers[1], private: markers[2] }; },
        async getUser() { if (stage === 'lookup') throw raw; return { uid: markers[6], email: markers[1], customClaims: { admin: stage !== 'non-admin', private: markers[2] } }; },
      });
      const input = { headers: { authorization: `Bearer ${markers[0]}` }, body: { private: markers[2] } };
      if (stage === 'success') {
        const principal = await authorize(input);
        assert.deepEqual(principal, { uid: markers[6] });
        assert.deepEqual(Object.keys(principal), ['uid']);
      } else {
        await assert.rejects(() => authorize(input), error => {
          assert.equal(getErrorStatus(error), stage === 'non-admin' ? 403 : 503);
          const response = serializeError(error); shape(response); safe(response); safe(error);
          assert.equal(Object.hasOwn(error, 'cause'), false);
          return true;
        });
      }
    }
    assert.deepEqual(logs, []);
  } finally {
    for (const method of Object.keys(originals)) console[method] = originals[method];
  }
});

test('caller response mutation cannot contaminate later errors', () => {
  const first = serializeError(createPublicError('AUTH_REQUIRED'), { createRequestId: () => requestId });
  Object.assign(first.error, { code: markers[0], message: markers[1], retryable: true, cause: markers[3] });
  first.extra = markers[2];
  const later = serializeError(createPublicError('AUTH_REQUIRED'), { createRequestId: () => requestId });
  assert.deepEqual(later, { error: { code: 'AUTH_REQUIRED', message: 'Authentication is required.', requestId, retryable: false } });
  shape(later); safe(later);
});
test('normal responses have different random request IDs', () => {
  const error = createPublicError('AUTH_REQUIRED');
  const first = serializeError(error); const second = serializeError(error);
  assert.notEqual(first.error.requestId, second.error.requestId);
  assert.match(first.error.requestId, /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
  assert.match(second.error.requestId, /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
});
for (const kind of ['invalid', 'throwing']) {
  test(`${kind} primary generator uses valid fallback`, () => {
    const calls = [];
    const response = serializeError(createPublicError('AUTH_REQUIRED'), {
      createRequestId() { calls.push('primary'); if (kind === 'throwing') throw new Error(markers[3]); return markers[0]; },
      createFallbackRequestId() { calls.push('fallback'); return requestId; },
    });
    assert.deepEqual(calls, ['primary', 'fallback']);
    assert.equal(response.error.requestId, requestId); shape(response); safe(response);
  });
  test(`both ${kind} generators return sentinel and JSON serialization stays safe`, () => {
    const calls = [];
    const dependencies = {
      createRequestId() { calls.push('primary'); if (kind === 'throwing') throw new Error(markers[3]); return markers[0]; },
      createFallbackRequestId() { calls.push('fallback'); if (kind === 'throwing') throw new Error(markers[4]); return markers[1]; },
    };
    const error = createPublicError('SERVICE_UNAVAILABLE', dependencies);
    const expected = { error: { code: 'SERVICE_UNAVAILABLE', message: 'The service is temporarily unavailable.', requestId: '00000000-0000-4000-8000-000000000000', retryable: true } };
    assert.deepEqual(serializeError(error, dependencies), expected);
    assert.deepEqual(calls, ['primary', 'fallback']);
    let encoded;
    assert.doesNotThrow(() => { encoded = JSON.stringify(error); });
    assert.deepEqual(JSON.parse(encoded), expected);
    assert.deepEqual(calls, ['primary', 'fallback', 'primary', 'fallback']);
    shape(JSON.parse(encoded)); safe(JSON.parse(encoded));
  });
}
test('valid primary ID skips fallback and literal request ID is ignored', () => {
  const response = serializeError(createPublicError('AUTH_REQUIRED'), {
    requestId: markers[0], createRequestId: () => requestId,
    createFallbackRequestId() { assert.fail('fallback must not run'); },
  });
  assert.equal(response.error.requestId, requestId); safe(response);
});
