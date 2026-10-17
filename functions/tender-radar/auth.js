'use strict';

const { createPublicError } = require('./errors');

const authenticationFailures = new Set([
  'auth/argument-error', 'auth/invalid-argument', 'auth/invalid-id-token',
  'auth/id-token-expired', 'auth/id-token-revoked', 'auth/user-disabled',
  'auth/user-not-found', 'auth/tenant-id-mismatch',
]);

function dependencyFailure(error) {
  // Read only the SDK's machine code; messages, claims and stack are never copied.
  let code;
  try { code = error && error.code; } catch { /* Unknown failures fail closed. */ }
  return createPublicError(authenticationFailures.has(code) ? 'AUTH_REQUIRED' : 'SERVICE_UNAVAILABLE');
}

// Adapter methods are invoked only when authorize is called; no SDK/global session state.
function createAuthorizer(adapter) {
  return async function authorize(request) {
    const header = request && request.headers && request.headers.authorization;
    if (typeof header !== 'string') throw createPublicError('AUTH_REQUIRED');
    const match = /^Bearer ([A-Za-z0-9._~+\/-]+=*)$/i.exec(header);
    if (!match) throw createPublicError('AUTH_REQUIRED');
    if (!adapter || typeof adapter.verifyIdToken !== 'function' || typeof adapter.getUser !== 'function') {
      throw createPublicError('SERVICE_UNAVAILABLE');
    }

    let decoded;
    try { decoded = await adapter.verifyIdToken(match[1], true); }
    catch (error) { throw dependencyFailure(error); }
    if (!decoded || typeof decoded.uid !== 'string' || !decoded.uid.trim() ||
        decoded.firebase?.sign_in_provider === 'anonymous') {
      throw createPublicError('AUTH_REQUIRED');
    }
    if (decoded.admin !== true) throw createPublicError('ADMIN_REQUIRED');

    let user;
    try { user = await adapter.getUser(decoded.uid); }
    catch (error) { throw dependencyFailure(error); }
    if (!user || user.disabled === true) throw createPublicError('AUTH_REQUIRED');
    if (user.uid !== decoded.uid) throw createPublicError('SERVICE_UNAVAILABLE');
    if (user.customClaims?.admin !== true) throw createPublicError('ADMIN_REQUIRED');
    return { uid: decoded.uid };
  };
}

module.exports = { createAuthorizer };
