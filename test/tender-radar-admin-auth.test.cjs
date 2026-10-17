'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { createAuthorizer } = require('../functions/tender-radar/auth');
const { getErrorStatus, serializeError } = require('../functions/tender-radar/errors');

function setup({ decoded = { uid: 'verified-user', admin: true }, user = { uid: 'verified-user', customClaims: { admin: true } }, verifyError, lookupError } = {}) {
  const calls = [];
  const adapter = {
    async verifyIdToken(...args) { calls.push(['verify', ...args]); if (verifyError) throw verifyError; return decoded; },
    async getUser(...args) { calls.push(['getUser', ...args]); if (lookupError) throw lookupError; return user; },
  };
  return { authorize: createAuthorizer(adapter), calls };
}
const request = () => ({ headers: { authorization: 'Bearer synthetic-token' } });
async function rejects(authorize, input, status, code) {
  await assert.rejects(() => authorize(input), error => {
    assert.equal(getErrorStatus(error), status);
    assert.equal(serializeError(error).error.code, code);
    return true;
  });
}

for (const [name, header] of [['missing header', undefined], ['wrong scheme', 'Basic synthetic-token'], ['empty Bearer', 'Bearer '], ['multiple credentials', 'Bearer a, Bearer b'], ['newline', 'Bearer a\nb'], ['array header', ['Bearer a']]]) {
  test(name, async () => {
    const { authorize, calls } = setup();
    await rejects(authorize, { headers: { authorization: header } }, 401, 'AUTH_REQUIRED');
    assert.deepEqual(calls, []);
  });
}
for (const [name, code] of [['invalid', 'auth/invalid-id-token'], ['malformed', 'auth/argument-error'], ['expired', 'auth/id-token-expired'], ['revoked', 'auth/id-token-revoked'], ['wrong-project', 'auth/argument-error'], ['disabled', 'auth/user-disabled']]) {
  test(`${name} verification rejected without user lookup`, async () => {
    const { authorize, calls } = setup({ verifyError: Object.assign(new Error('synthetic SDK failure'), { code }) });
    await rejects(authorize, request(), 401, 'AUTH_REQUIRED');
    assert.deepEqual(calls, [['verify', 'synthetic-token', true]]);
  });
}
test('anonymous provider rejected even with admin claim', async () => {
  const { authorize, calls } = setup({ decoded: { uid: 'verified-user', admin: true, firebase: { sign_in_provider: 'anonymous' } } });
  await rejects(authorize, request(), 401, 'AUTH_REQUIRED');
  assert.equal(calls.length, 1);
});
for (const admin of [undefined, false, 'true', 1]) {
  test(`token admin must be boolean true: ${String(admin)}`, async () => {
    const { authorize, calls } = setup({ decoded: { uid: 'verified-user', admin } });
    let downstream = 0;
    await rejects(async input => { const principal = await authorize(input); downstream++; return principal; }, request(), 403, 'ADMIN_REQUIRED');
    assert.equal(downstream, 0);
    assert.equal(calls.length, 1);
  });
  test(`current admin must be boolean true: ${String(admin)}`, async () => {
    const { authorize } = setup({ user: { uid: 'verified-user', customClaims: { admin } } });
    let downstream = 0;
    await rejects(async input => { await authorize(input); downstream++; }, request(), 403, 'ADMIN_REQUIRED');
    assert.equal(downstream, 0);
  });
}
test('removed current claim rejects stale admin token', async () => {
  const { authorize } = setup({ user: { uid: 'verified-user' } });
  await rejects(authorize, request(), 403, 'ADMIN_REQUIRED');
});
test('success returns only verified UID and ignores request authority', async () => {
  const { authorize, calls } = setup();
  const input = request();
  input.body = input.query = { uid: 'forged', email: 'forged@example.invalid', role: 'admin', admin: true };
  Object.assign(input.headers, { uid: 'forged', email: 'forged@example.invalid', role: 'admin', admin: true });
  assert.deepEqual(await authorize(input), { uid: 'verified-user' });
  assert.deepEqual(calls, [['verify', 'synthetic-token', true], ['getUser', 'verified-user']]);
});
test('request admin flags cannot authorize a non-admin', async () => {
  const { authorize } = setup({ decoded: { uid: 'verified-user' } });
  await rejects(authorize, { ...request(), body: { admin: true, role: 'admin', uid: 'forged' } }, 403, 'ADMIN_REQUIRED');
});
for (const user of [null, { uid: 'verified-user', disabled: true, customClaims: { admin: true } }]) {
  test('missing/disabled current user fails closed', async () => {
    await rejects(setup({ user }).authorize, request(), 401, 'AUTH_REQUIRED');
  });
}
test('missing current user SDK error is authentication failure', async () => {
  await rejects(setup({ lookupError: { code: 'auth/user-not-found' } }).authorize, request(), 401, 'AUTH_REQUIRED');
});
test('mismatched lookup identity fails closed', async () => {
  await rejects(setup({ user: { uid: 'other', customClaims: { admin: true } } }).authorize, request(), 503, 'SERVICE_UNAVAILABLE');
});
for (const stage of ['verifyError', 'lookupError']) {
  test(`${stage} infrastructure failure is sanitized/retryable`, async () => {
    const { authorize } = setup({ [stage]: Object.assign(new Error('private infrastructure message'), { code: 'auth/internal-error' }) });
    await assert.rejects(() => authorize(request()), error => {
      assert.equal(getErrorStatus(error), 503);
      assert.equal(serializeError(error).error.retryable, true);
      assert.equal(error.message, 'The service is temporarily unavailable.');
      return true;
    });
  });
}
for (const adapter of [undefined, {}, { verifyIdToken() {} }]) {
  test('unavailable adapter fails closed', async () => {
    await rejects(createAuthorizer(adapter), request(), 503, 'SERVICE_UNAVAILABLE');
  });
}
test('factory has no calls or shared principal state', async () => {
  const first = setup(); const second = setup({ decoded: { uid: 'other', admin: true }, user: { uid: 'other', customClaims: { admin: true } } });
  assert.deepEqual(first.calls, []); assert.deepEqual(second.calls, []);
  const [a, b] = await Promise.all([first.authorize(request()), second.authorize(request())]);
  a.uid = 'mutated';
  assert.deepEqual(b, { uid: 'other' });
  assert.deepEqual(await first.authorize(request()), { uid: 'verified-user' });
});

for (const [name, header] of [
  ['plain object header', {}], ['whitespace-only token', 'Bearer    '],
  ['leading whitespace', ' Bearer synthetic-token'], ['trailing whitespace', 'Bearer synthetic-token '],
  ['multiple separator spaces', 'Bearer  synthetic-token'], ['tab separator', 'Bearer\tsynthetic-token'],
]) {
  test(`${name} rejected by strict header policy`, async () => {
    const { authorize, calls } = setup();
    await rejects(authorize, { headers: { authorization: header } }, 401, 'AUTH_REQUIRED');
    assert.deepEqual(calls, []);
  });
}
for (const scheme of ['bearer', 'bEaReR']) {
  test(`${scheme} scheme accepted`, async () => {
    const { authorize, calls } = setup();
    assert.deepEqual(await authorize({ headers: { authorization: `${scheme} synthetic-token` } }), { uid: 'verified-user' });
    assert.deepEqual(calls, [['verify', 'synthetic-token', true], ['getUser', 'verified-user']]);
  });
}
for (const [name, uid] of [['empty', ''], ['whitespace-only', ' \t'], ['non-string', 123]]) {
  test(`${name} decoded UID rejected without lookup`, async () => {
    const { authorize, calls } = setup({ decoded: { uid, admin: true } });
    await rejects(authorize, request(), 401, 'AUTH_REQUIRED');
    assert.deepEqual(calls, [['verify', 'synthetic-token', true]]);
  });
}
for (const method of ['verifyIdToken', 'getUser']) {
  test(`${method} non-function fails closed`, async () => {
    let calls = 0;
    const adapter = { verifyIdToken() { calls++; }, getUser() { calls++; } };
    adapter[method] = 'not-a-function';
    await rejects(createAuthorizer(adapter), request(), 503, 'SERVICE_UNAVAILABLE');
    assert.equal(calls, 0);
  });
}
for (const stage of ['verifyError', 'lookupError']) {
  for (const kind of ['unknown code', 'throwing code getter']) {
    test(`${stage} ${kind} is sanitized retryable 503`, async () => {
      const failure = new Error('synthetic private error');
      if (kind === 'unknown code') failure.code = 'auth/unknown-synthetic-code';
      else Object.defineProperty(failure, 'code', { get() { throw new Error('synthetic getter failure'); } });
      const { authorize, calls } = setup({ [stage]: failure });
      await assert.rejects(() => authorize(request()), error => {
        assert.equal(getErrorStatus(error), 503);
        const response = serializeError(error);
        assert.equal(response.error.code, 'SERVICE_UNAVAILABLE');
        assert.equal(response.error.message, 'The service is temporarily unavailable.');
        assert.equal(response.error.retryable, true);
        assert.equal(Object.hasOwn(error, 'cause'), false);
        return true;
      });
      assert.equal(calls.length, stage === 'verifyError' ? 1 : 2);
    });
  }
}
