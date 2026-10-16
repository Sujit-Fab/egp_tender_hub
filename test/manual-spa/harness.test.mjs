import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { mkdtemp, readFile, writeFile, rename } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { withDemoAccountPrompt, guardUnexpectedDialogs, DEMO_PROMPT,
  HarnessError, createCheckProgress, createDemoAccountSession } from './harness.mjs';
import { waitForCommittedDeletion, waitForCommittedUpload } from './std-persistence.mjs';

function deferred() {
  let resolve, reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}
function dialog(options = {}) {
  const calls = [];
  return { calls, type: () => options.type ?? 'prompt', message: () => options.message ?? DEMO_PROMPT,
    async accept(value) { calls.push(['accept', value]); await options.accept?.(); },
    async dismiss() { calls.push(['dismiss']); await options.dismiss?.(); } };
}
const code = expected => error => error instanceof HarnessError && error.code === expected;

test('prompt action awaits acceptance and always removes its owned listener', async () => {
  const page = new EventEmitter();
  const gate = deferred();
  const item = dialog({ accept: () => gate.promise });
  let finished = false;
  const pending = withDemoAccountPrompt(page, 'owner-a', () => page.emit('dialog', item)).then(() => { finished = true; });
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(finished, false);
  gate.resolve(); await pending;
  assert.deepEqual(item.calls, [['accept', 'owner-a']]);
  assert.equal(page.listenerCount('dialog'), 0);
});

test('duplicate dialog fails the action and never accepts twice', async () => {
  const page = new EventEmitter();
  const gate = deferred();
  const item = dialog({ dismiss: async () => { throw new Error('already handled'); } });
  await assert.rejects(withDemoAccountPrompt(page, 'admin', () => {
    page.emit('dialog', item); page.emit('dialog', item); return gate.promise;
  }), code('DUPLICATE_DIALOG'));
  gate.reject(new Error('late trigger failure must remain handled'));
  assert.equal(item.calls.filter(([kind]) => kind === 'accept').length, 1);
  assert.equal(page.listenerCount('dialog'), 0);
});

test('already-handled acceptance rejection is awaited and sanitized', async () => {
  const page = new EventEmitter();
  const item = dialog({ accept: async () => { throw new Error('PRIVATE_DIALOG_TEXT'); } });
  await assert.rejects(withDemoAccountPrompt(page, 'admin', () => page.emit('dialog', item)), code('DIALOG_HANDLING_FAILED'));
  assert.equal(page.listenerCount('dialog'), 0);
});

test('failed click cannot leave a stale listener that accepts the next login', async () => {
  const page = new EventEmitter();
  await assert.rejects(withDemoAccountPrompt(page, 'ordinary', () => { throw new Error('synthetic click failure'); }));
  assert.equal(page.listenerCount('dialog'), 0);
  const stale = dialog(); page.emit('dialog', stale);
  assert.deepEqual(stale.calls, []);
  const next = dialog();
  await withDemoAccountPrompt(page, 'owner-b', () => page.emit('dialog', next));
  assert.deepEqual(next.calls, [['accept', 'owner-b']]);
});

test('unexpected type or message fails closed without accepting its content', async () => {
  for (const options of [{ type: 'alert' }, { type: 'confirm' }, { message: 'PRIVATE_UNEXPECTED_PROMPT' }]) {
    const page = new EventEmitter(); const item = dialog(options);
    await assert.rejects(withDemoAccountPrompt(page, 'admin', () => page.emit('dialog', item)), code('UNEXPECTED_DIALOG'));
    assert.equal(item.calls.some(([kind]) => kind === 'accept'), false);
    assert.equal(page.listenerCount('dialog'), 0);
  }
});

test('prompt timeout removes its listener and overlapping actions are rejected', async () => {
  const page = new EventEmitter();
  const pending = withDemoAccountPrompt(page, 'admin', () => {}, { timeoutMs: 20 });
  await assert.rejects(withDemoAccountPrompt(page, 'ordinary', () => {}), code('PROMPT_OVERLAP'));
  await assert.rejects(pending, code('PROMPT_TIMEOUT'));
  assert.equal(page.listenerCount('dialog'), 0);
  const late = dialog(); page.emit('dialog', late); assert.deepEqual(late.calls, []);
});

test('outside-action guard records unexpected dialogs but leaves expected prompts to the owner', async () => {
  const page = new EventEmitter(); const failures = [];
  const dispose = guardUnexpectedDialogs(page, error => failures.push(error.code));
  const expected = dialog();
  await withDemoAccountPrompt(page, 'admin', () => page.emit('dialog', expected));
  assert.deepEqual(failures, []);
  const unexpected = dialog({ type: 'alert' }); page.emit('dialog', unexpected);
  assert.deepEqual(failures, ['UNEXPECTED_DIALOG']);
  assert.deepEqual(unexpected.calls, [['dismiss']]);
  dispose(); assert.equal(page.listenerCount('dialog'), 0);
});

test('per-check progress is durable before the next action and remains incomplete on interruption', async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'radar-harness-progress-'));
  const file = path.join(directory, 'progress.json');
  const report = { complete: false, cleanupVerified: false };
  const progress = createCheckProgress(report, ['first', 'second'], async bytes => {
    await writeFile(file + '.tmp', bytes); await rename(file + '.tmp', file);
  });
  await progress.check('first', async () => {});
  const first = JSON.parse(await readFile(file, 'utf8'));
  assert.deepEqual(first.checks, [{ name: 'first', status: 'passed' }]);
  const entered = deferred(), leave = deferred();
  const pending = progress.check('second', async () => { entered.resolve(); await leave.promise; });
  await entered.promise;
  const interrupted = JSON.parse(await readFile(file, 'utf8'));
  assert.equal(interrupted.activeCheck, 'second');
  assert.equal(interrupted.complete, false); assert.equal(interrupted.cleanupVerified, false);
  assert.deepEqual(interrupted.checks, first.checks);
  leave.resolve(); await pending;
  const beforeCleanup = JSON.parse(await readFile(file, 'utf8'));
  assert.equal(beforeCleanup.checks.length, 2);
  assert.equal(beforeCleanup.complete, false); assert.equal(beforeCleanup.cleanupVerified, false);
});

test('first sanitized failure survives later failures and successful checks', async () => {
  const snapshots = [];
  const report = {};
  const progress = createCheckProgress(report, ['first', 'second', 'third'], async bytes => snapshots.push(JSON.parse(bytes)));
  const privateError = new Error('PRIVATE_CREDENTIAL_OR_DOCUMENT_TEXT');
  privateError.name = 'PRIVATE_NAME';
  privateError.stack = 'PRIVATE_URL\n at /workspace/test/manual-spa/checks.mjs:42:7';
  await progress.check('first', async () => { throw privateError; });
  await progress.check('second', async () => { throw new HarnessError('UNEXPECTED_DIALOG'); });
  await progress.check('third', async () => {});
  assert.deepEqual(report.firstFailure, { name: 'first', status: 'failed', error: 'Error', location: 'checks.mjs:42:7' });
  assert.equal(report.checks[1].code, 'UNEXPECTED_DIALOG');
  assert.equal(report.checks[2].status, 'passed');
  assert.equal(JSON.stringify(snapshots).includes('PRIVATE'), false);
});

test('unexpected dialog failure is persisted immediately and cannot become a passing action', async () => {
  const snapshots = [];
  const report = {};
  const progress = createCheckProgress(report, ['first'], async bytes => snapshots.push(JSON.parse(bytes)));
  await progress.check('first', async () => {
    await progress.noteFailure(new HarnessError('UNEXPECTED_DIALOG'));
    assert.equal(snapshots.at(-1).firstFailure.code, 'UNEXPECTED_DIALOG');
    assert.equal(snapshots.at(-1).activeCheck, 'first');
  });
  assert.equal(report.checks[0].status, 'failed');
});

test('checkpoint write failure aborts and out-of-order checks cannot be accepted', async () => {
  const report = {};
  const broken = createCheckProgress(report, ['first'], async () => { throw new Error('synthetic disk failure'); });
  await assert.rejects(broken.check('first', async () => assert.fail('must not start without checkpoint')));
  assert.equal(report.checks.length, 0);
  const progress = createCheckProgress({}, ['first'], async () => {});
  await assert.rejects(progress.check('other', async () => {}), code('INVALID_CHECK_SEQUENCE'));
});

test('optimistic UI removal cannot pass until independent server deletion is observed', async () => {
  let reads = 0;
  await waitForCommittedDeletion(async () => ++reads < 3, { timeoutMs: 1000, intervalMs: 0 });
  assert.equal(reads, 3);
});

test('persistent, stalled and malformed deletion reads fail closed within the bound', async () => {
  await assert.rejects(waitForCommittedDeletion(async () => true, { timeoutMs: 20, intervalMs: 1 }));
  await assert.rejects(waitForCommittedDeletion(() => new Promise(() => {}), { timeoutMs: 20 }));
  await assert.rejects(waitForCommittedDeletion(async () => undefined));
});

test('persisted session restoration must finish before logout or a subsequent login', async () => {
  const restore = deferred();
  const calls = [];
  const session = createDemoAccountSession({
    async waitForRestoredSession() { calls.push('restoring'); await restore.promise; calls.push('restored'); },
    async signOut() { calls.push('sign-out'); },
    async waitForSignedOut() { calls.push('signed-out'); },
    async signIn(account) { calls.push(account); },
  });
  await session.login('ordinary');
  assert.deepEqual(calls, ['signed-out', 'ordinary']);
  const next = session.login('owner-a');
  await new Promise(resolve => setImmediate(resolve));
  assert.deepEqual(calls, ['signed-out', 'ordinary', 'restoring']);
  restore.resolve(); await next;
  assert.deepEqual(calls, ['signed-out', 'ordinary', 'restoring', 'restored', 'sign-out', 'signed-out', 'owner-a']);
});

test('explicit logout prevents the next login from waiting for an already-ended session', async () => {
  let restores = 0, signOuts = 0;
  const session = createDemoAccountSession({
    async waitForRestoredSession() { restores++; }, async signOut() { signOuts++; },
    async waitForSignedOut() {}, async signIn() {},
  });
  await session.login('admin'); await session.logout(); await session.login('other');
  assert.equal(restores, 1); assert.equal(signOuts, 1);
});

test('failed sign-in is not recorded as a restored session', async () => {
  let restores = 0, attempts = 0;
  const session = createDemoAccountSession({
    async waitForRestoredSession() { restores++; }, async signOut() {}, async waitForSignedOut() {},
    async signIn() { if (++attempts === 1) throw new HarnessError('PROMPT_TIMEOUT'); },
  });
  await assert.rejects(session.login('admin'), code('PROMPT_TIMEOUT'));
  await session.login('other'); assert.equal(restores, 0);
});

test('optimistic upload requires exactly one independently committed document', async () => {
  let reads = 0;
  const committed = { size: 1, docs: ['synthetic-document'] };
  const result = await waitForCommittedUpload(async () => ++reads < 3 ? { size: 0 } : committed,
    { timeoutMs: 1000, intervalMs: 0 });
  assert.equal(result, committed); assert.equal(reads, 3);
});

test('duplicate and never-committed uploads cannot pass the server-state wait', async () => {
  let duplicateReads = 0;
  await assert.rejects(waitForCommittedUpload(async () => { duplicateReads++; return { size: 2 }; }));
  assert.equal(duplicateReads, 1);
  await assert.rejects(waitForCommittedUpload(async () => ({ size: 0 }), { timeoutMs: 20, intervalMs: 1 }));
});
