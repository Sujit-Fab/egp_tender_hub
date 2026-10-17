import { mkdir, writeFile } from 'node:fs/promises';
import { acceptanceEnvironment, assertEmulators, blockExternalSockets,
  PROJECT_ID, AUTH_HOST, FIRESTORE_HOST, isolationStats } from './isolation.mjs';

const guard = blockExternalSockets();
const startedAt = new Date().toISOString();
let harness;
let phase = 'verify isolated environment';
let failure;
let cleanupFailed = false;
function sanitized(error) {
  return { type: /^[A-Za-z]+Error$|^Error$/.test(error.name) ? error.name : 'Error',
    code: typeof error.code === 'number' || /^[A-Z_]+$/.test(error.code ?? '') ? error.code : undefined,
    frames: error.stack?.split('\n').slice(1, 5).map(frame =>
      frame.replaceAll('\\', '/').match(/([^/\s()]+:\d+:\d+)/)?.[1]).filter(Boolean) };
}
try {
  process.env = acceptanceEnvironment(process.cwd());
  assertEmulators();
  if (process.env.GOOGLE_CLOUD_PROJECT !== PROJECT_ID || !PROJECT_ID.startsWith('demo-') ||
      process.env.FIREBASE_AUTH_EMULATOR_HOST !== AUTH_HOST || process.env.FIRESTORE_EMULATOR_HOST !== FIRESTORE_HOST) {
    throw new Error('Invalid isolated environment');
  }
  phase = 'verify running loopback emulators and load repository rules';
  const { loadAcceptanceRules } = await import('./rules.mjs');
  await loadAcceptanceRules();
  const { startHarness } = await import('./server.mjs');
  harness = await startHarness(value => { phase = value; console.log(`DIAGNOSTIC: ${phase}`); });
} catch (error) {
  failure = { phase, ...sanitized(error) };
  process.exitCode = 1;
} finally {
  // Keep the guard installed through cleanup, result writing and process exit.
  // Failed initialization also closes its resources inside startHarness.
  try { await harness?.close(); }
  catch (error) { cleanupFailed = true; failure ??= { phase: 'harness cleanup', ...sanitized(error) }; process.exitCode = 1; }
  try { await guard.closeConnections(); }
  catch (error) { cleanupFailed = true; failure ??= { phase: 'socket cleanup', ...sanitized(error) }; process.exitCode = 1; }
  if (isolationStats.blockedSockets || isolationStats.credentialAttempts) process.exitCode = 1;
  const evidence = { startedAt, finishedAt: new Date().toISOString(), project: PROJECT_ID,
    authHost: AUTH_HOST, firestoreHost: FIRESTORE_HOST, guardRetainedUntilExit: true,
    cleanupFailed, isolationStats, status: process.exitCode ? 'failed' : 'passed', failure };
  await mkdir('.cache/tender-radar', { recursive: true });
  await writeFile('.cache/tender-radar/diagnostic.json', JSON.stringify(evidence, null, 2));
  await writeFile(`.cache/tender-radar/diagnostic-${startedAt.replaceAll(':', '-')}.json`, JSON.stringify(evidence, null, 2));
  console.log(JSON.stringify(evidence));
  // SDK retry timers must not keep a completed diagnostic alive. All harness
  // resources and tracked sockets have been closed, and the guard stays active.
  process.exit(process.exitCode ?? 0);
}
