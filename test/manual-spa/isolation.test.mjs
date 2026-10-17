import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';
import ts from 'typescript';
import { demoBootstrap, assertLoopbackLinks } from './build.mjs';
import { validateSpaReport } from './verify.mjs';
import { requiredSpaChecks } from './checks.mjs';
import { requiredScreenshots, validateVisualManifest } from './screenshots.mjs';
import { demoStorageUrl } from './std-persistence.mjs';

const source = readFileSync('src/firebase.ts', 'utf8');
test('namespace guard requires exactly one active loopback link and rejects all additional interfaces', () => {
  const lo = { ifname: 'lo', flags: ['LOOPBACK', 'UP', 'LOWER_UP'] };
  assert.doesNotThrow(() => assertLoopbackLinks([lo]));
  for (const links of [[], null, {}, [lo, { ifname: 'eth0', flags: ['UP'] }],
    [{ ifname: 'eth0', flags: ['UP'] }], [{ ifname: 'lo', flags: ['LOOPBACK'] }],
    [{ ifname: 'lo', flags: ['UP'] }], [{ ifname: 'lo' }]]) {
    assert.throws(() => assertLoopbackLinks(links), /loopback-only/);
  }
});
function load(origin = 'http://127.0.0.1:4179', account = 'admin') {
  const calls = [];
  const transformed = ts.transpileModule(demoBootstrap(source), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const module = { exports: {} };
  const sdk = {
    initializeApp(config) { calls.push(['app', config.projectId]); return {}; },
    getAuth: () => ({}), getFirestore(app, database) { calls.push(['db', database]); return {}; }, getStorage: () => ({}),
    connectAuthEmulator(auth, host) { calls.push(['auth', host]); },
    connectFirestoreEmulator(db, host, port) { calls.push(['firestore', host, port]); },
    connectStorageEmulator(storage, host, port) { calls.push(['storage', host, port]); },
    GoogleAuthProvider: class {}, doc: () => ({}),
    async getDocFromServer() { calls.push(['first-read']); },
    async signInWithEmailAndPassword(auth, email) { calls.push(['sign-in', email]); },
    signInWithPopup() { assert.fail('Google OAuth is forbidden'); },
  };
  vm.runInNewContext(transformed, { module, exports: module.exports, location: { origin },
    window: { prompt: () => account }, console: { log() {}, error() {} },
    require(name) { assert.ok(['firebase/app', 'firebase/auth', 'firebase/firestore', 'firebase/storage'].includes(name)); return sdk; },
  });
  return { calls, exports: module.exports };
}

test('full SPA connects every Firebase service to demo emulators before its first read', async () => {
  const loaded = load();
  assert.deepEqual(loaded.calls, [
    ['app', 'demo-tender-radar'], ['auth', 'http://127.0.0.1:9098'],
    ['db', 'ai-studio-7e6a1daf-95b8-46d0-a6ba-7cf295cd1701'],
    ['firestore', '127.0.0.1', 8085], ['storage', '127.0.0.1', 9198], ['first-read'],
  ]);
  await loaded.exports.loginWithGoogle();
  assert.deepEqual(loaded.calls.at(-1), ['sign-in', 'admin@example.invalid']);
  for (const account of ['owner-a', 'owner-b']) {
    const owner = load('http://127.0.0.1:4179', account);
    await owner.exports.loginWithGoogle();
    assert.deepEqual(owner.calls.at(-1), ['sign-in', `${account}@example.invalid`]);
  }
});

test('manual bootstrap rejects another origin before initializing Firebase', () => {
  assert.throws(() => load('https://egptenderhub.com'), /dedicated loopback origin/);
});

test('manual build fails closed if production bootstrap substitution no longer matches', () => {
  assert.throws(() => demoBootstrap(source.replace('export const auth = getAuth(app);', 'changed();')), /must be reviewed/);
});

test('SPA evidence gate rejects stale, incomplete, skipped, unsafe and wrong-source results', () => {
  const launch = { runId: 'synthetic-unique-run-identity', sourceRevision: 'source', startedAt: '2026-10-16T00:00:00Z' };
  const report = { ...launch, build: { sourceRevision: 'source' }, finishedAt: '2026-10-16T00:01:00Z',
    project: 'demo-tender-radar', database: 'ai-studio-7e6a1daf-95b8-46d0-a6ba-7cf295cd1701', rulesHash: 'rules',
    automated: true, complete: true, cleanupVerified: true, activeCheck: null, firstFailure: null,
    isolationStats: { blockedSockets: 0, credentialAttempts: 0 },
    checks: requiredSpaChecks.map(name => ({ name, status: 'passed' })),
    visual: { sourceRevision: 'source', runId: launch.runId,
      captures: requiredScreenshots.map(item => ({ ...item, sha256: 'a'.repeat(64) })) } };
  assert.equal(validateSpaReport(report, launch, 'source', 'rules').accepted, true);
  for (const mutate of [
    r => { r.runId = 'old-run'; }, r => { r.sourceRevision = 'old-source'; },
    r => { r.build.sourceRevision = 'old-source'; }, r => { r.complete = false; },
    r => { r.cleanupVerified = false; }, r => { r.checks[0].status = 'skipped'; },
    r => { r.checks.pop(); }, r => { r.project = 'production'; }, r => { r.rulesHash = 'different'; },
    r => { r.isolationStats.blockedSockets = 1; }, r => { r.isolationStats.credentialAttempts = 1; },
    r => { r.visual.captures.pop(); }, r => { r.visual.runId = 'stale'; },
    r => { r.activeCheck = requiredSpaChecks[0]; },
    r => { r.firstFailure = { name: requiredSpaChecks[0], status: 'failed' }; },
  ]) {
    const changed = structuredClone(report); mutate(changed);
    assert.throws(() => validateSpaReport(changed, launch, 'source', 'rules'));
  }
});

test('Storage persistence observer rejects non-demo origins and unexpected object paths', () => {
  const data = { storagePath: 'stds/123-synthetic-two-rows.pdf',
    url: 'http://127.0.0.1:9198/v0/b/demo-tender-radar.appspot.com/o/stds%2F123-synthetic-two-rows.pdf?alt=media&token=synthetic' };
  assert.equal(demoStorageUrl(data).origin, 'http://127.0.0.1:9198');
  for (const changed of [
    { ...data, url: data.url.replace('127.0.0.1', 'example.invalid') },
    { ...data, url: data.url.replace(':9198', ':9199') },
    { ...data, url: data.url.replace('demo-tender-radar', 'another-project') },
    { ...data, storagePath: '../unexpected' },
    { ...data, url: data.url.replace('alt=media', 'alt=metadata') },
  ]) assert.throws(() => demoStorageUrl(changed));
});

test('visual manifest requires all eight fixed views, exact identity and digests', () => {
  const visual = { sourceRevision: 'source', runId: 'run',
    captures: requiredScreenshots.map(item => ({ ...item, sha256: 'a'.repeat(64) })) };
  assert.doesNotThrow(() => validateVisualManifest(visual, 'source', 'run'));
  for (const mutate of [v => { v.sourceRevision = 'stale'; }, v => { v.runId = 'stale'; },
    v => { v.captures.pop(); }, v => { v.captures[0].file = '../profile.png'; },
    v => { v.captures[0].width = 10; }, v => { v.captures[0].sha256 = ''; },
    v => { v.captures[0] = v.captures[1]; }]) {
    const changed = structuredClone(visual); mutate(changed);
    assert.throws(() => validateVisualManifest(changed, 'source', 'run'));
  }
});
