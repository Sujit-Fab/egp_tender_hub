// Temporary diagnosis only: does not change application or acceptance behavior.
import { acceptanceEnvironment, blockExternalSockets, isolationStats } from '../acceptance/isolation.mjs';
import { assertLoopbackNamespace } from './build.mjs';
import { createRequire } from 'node:module';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createDiagnosticPhaseReporter } from './diagnostic-phases.mjs';
import { createUploadFetchObserver } from './upload-fetch-observer.mjs';
import { clearOwnedEmulatorRegistration } from './owned-emulator-registration.mjs';

const results = [];
const phase = createDiagnosticPhaseReporter();
const output = path.resolve('.cache/tender-radar/std-delete-diagnostic.json');
const ownDirectory = path.resolve('.cache/tender-radar/std-delete-diagnostic-' + randomUUID());
const require = createRequire(import.meta.url);
let emulator, app, deleteApp, guard, EmulatorRegistry;
let failed = false;
const bounded = async (work, ms) => {
  let timer;
  try {
    return await Promise.race([Promise.resolve().then(work), new Promise((_, reject) => {
      timer = setTimeout(() => reject(Object.assign(new Error(), { code: 'diagnostic-timeout' })), ms);
    })]);
  } finally { clearTimeout(timer); }
};
const safeCode = error => typeof error?.code === 'string' &&
  /^(storage\/[a-z-]+|EPERM|ENOENT|EACCES|EADDRINUSE|ERR_ASSERTION|diagnostic-timeout)$/.test(error.code)
  ? error.code : 'diagnostic-failed';
// Suppress SDK, emulator and Java-runtime diagnostics before importing them.
for (const method of ['log', 'warn', 'error', 'info', 'debug']) console[method] = () => {};
try {
  assert.equal(process.platform, 'linux');
  assertLoopbackNamespace(); // OS isolation covers Java as well as Node.
  const clean = acceptanceEnvironment(process.cwd());
  for (const key of Object.keys(process.env)) if (!(key in clean)) delete process.env[key];
  Object.assign(process.env, clean);
  delete process.env.STORAGE_EMULATOR_DEBUG;
  delete process.env.DEBUG;
  guard = blockExternalSockets();
  const base = '../acceptance/node_modules/firebase-tools/lib/';
  require(base + 'logger.js').logger.silent = true;
  const { StorageEmulator } = require(base + 'emulator/storage/index.js');
  ({ EmulatorRegistry } = require(base + 'emulator/registry.js'));
  class DiagnosticStorage extends StorageEmulator {
    getPersistenceTmpDir() { return ownDirectory; }
  }
  emulator = new DiagnosticStorage({ projectId: 'demo-tender-radar', host: '127.0.0.1', port: 9198,
    auto_download: false, rules: { name: path.resolve('test/manual-spa/storage.rules'),
      content: await readFile('test/manual-spa/storage.rules', 'utf8') } });
  await bounded(() => EmulatorRegistry.start(emulator), 30000);
  phase.enter('authentication');
  const firebase = await import('firebase/app');
  deleteApp = firebase.deleteApp;
  const { getStorage, connectStorageEmulator, ref, uploadBytes, getDownloadURL, deleteObject } = await import('firebase/storage');
  const { createMockUserToken } = await import('@firebase/util');
  app = firebase.initializeApp({ projectId: 'demo-tender-radar', apiKey: 'demo-only',
    storageBucket: 'demo-tender-radar.appspot.com' }, 'std-delete-diagnostic');
  const storage = getStorage(app);
  connectStorageEmulator(storage, '127.0.0.1', 9198, { mockUserToken: { sub: 'owner-a' } });
  const object = ref(storage, 'stds/diagnostic-synthetic.pdf');
  const expectedUploadToken = createMockUserToken({ sub: 'owner-a' }, 'demo-tender-radar');
  phase.enter('upload');
  const originalFetch = globalThis.fetch;
  globalThis.fetch = createUploadFetchObserver(originalFetch, expectedUploadToken, results);
  try {
    await bounded(() => uploadBytes(object, new Uint8Array([1, 2, 3])), 10000);
  } finally {
    globalThis.fetch = originalFetch;
    results.push({ status: 0, code: 'socket-guard-count', blockedSockets: isolationStats.blockedSockets });
  }
  phase.enter('downloadReference');
  const url = new URL(await bounded(() => getDownloadURL(object), 10000));
  assert.equal(url.origin, 'http://127.0.0.1:9198');
  assert.equal(url.pathname, '/v0/b/demo-tender-radar.appspot.com/o/' + encodeURIComponent(object.fullPath));
  const metadataUrl = new URL(url); metadataUrl.search = '';
  phase.enter('authentication');
  const token = createMockUserToken({ sub: 'owner-a' }, 'demo-tender-radar');
  const headers = { Authorization: `Bearer ${token}` };
  const observe = async (target, authorization) => {
    assert.equal(target.origin, 'http://127.0.0.1:9198');
    const response = await fetch(target, { headers: authorization, redirect: 'error', signal: AbortSignal.timeout(10000) });
    let code = null;
    if (response.status >= 400 && response.headers.get('content-type')?.includes('application/json')) {
      const body = await response.json();
      if (Number.isInteger(body?.error?.code)) code = body.error.code;
    } else await response.body?.cancel();
    results.push({ status: response.status, code });
    return response.status;
  };
  // Fixed record order: token read before, authenticated read before,
  // token read after deletion, authenticated read after deletion.
  assert.equal(await observe(url), 200);
  assert.equal(await observe(metadataUrl, headers), 200);
  phase.enter('delete');
  await bounded(() => deleteObject(object), 10000);
  phase.enter('absenceCheck');
  await observe(url); // Capture the unknown status; do not assume the hypothesis.
  assert.equal(await observe(metadataUrl, headers), 404); // Independent absence.
  assert.equal(isolationStats.blockedSockets, 0);
  assert.equal(isolationStats.credentialAttempts, 0);
} catch (error) {
  failed = true;
  results.push(phase.failureRecord());
  results.push({ status: 0, code: safeCode(error) });
} finally {
  // Pinned emulator internals are used only to clean up partial startup.
  // Capture the owned Java handle before stop() clears it; never scan processes.
  const child = emulator?._rulesRuntime?._childprocess;
  const outcomes = await Promise.allSettled([
    bounded(() => app && deleteApp(app), 5000),
    bounded(() => emulator?._rulesRuntime.stop(), 5000),
    bounded(() => emulator?._rulesManager.stop(), 5000),
    bounded(() => emulator?.destroyServer?.(), 5000),
    bounded(() => emulator?._persistence.deleteAll(), 5000),
    bounded(() => guard?.closeConnections(), 5000),
  ]);
  if (child && child.exitCode === null && child.signalCode === null) {
    await bounded(() => new Promise((resolve, reject) => {
      child.once('exit', resolve);
      if (!child.kill('SIGKILL')) reject(new Error());
    }), 5000).catch(() => { failed = true; });
  }
  if (emulator && EmulatorRegistry) clearOwnedEmulatorRegistration(EmulatorRegistry, emulator);
  const cleanupVerified = outcomes.every(result => result.status === 'fulfilled') &&
    (!child || child.exitCode !== null || child.signalCode !== null) &&
    (!emulator || EmulatorRegistry?.get(emulator.getName()) !== emulator);
  if (!cleanupVerified) failed = true;
  results.push({ status: 0, code: cleanupVerified ? 'cleanup-verified' : 'cleanup-failed' });
  await mkdir(path.dirname(output), { recursive: true });
  await writeFile(output, JSON.stringify(results) + '\n');
  process.stdout.write(JSON.stringify(results) + '\n');
}
if (failed) process.exitCode = 1;
