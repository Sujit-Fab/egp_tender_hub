// Checks the Linux evidence gate without starting emulators or subprocesses.
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { acceptanceSummary } from './evidence.mjs';
import { requiredChecks } from './checks.mjs';
import { PROJECT_ID, DATABASE_ID } from './isolation.mjs';
import { assertAcceptanceConfig } from './config.mjs';
const currentRun = { runId: 'synthetic-current-run', sourceRevision: 'b'.repeat(40) };
const finished = { startedAt: '2026-10-14T00:00:00Z', finishedAt: '2026-10-14T00:01:00Z',
  ...currentRun,
  complete: true, cleanupVerified: true, project: PROJECT_ID, database: DATABASE_ID,
  rulesHash: 'a'.repeat(64), isolationStats: { blockedSockets: 0, credentialAttempts: 0 },
  results: requiredChecks.map(name => ({ name, status: 'passed' })) };
assert.equal(acceptanceSummary(finished, currentRun).accepted, true);
for (const patch of [{ complete: false }, { cleanupVerified: false }, { project: 'production-forbidden' },
  { database: '(default)' }, { finishedAt: undefined }, { isolationStats: { blockedSockets: 1, credentialAttempts: 0 } },
  { results: finished.results.slice(1) }, { results: finished.results.map((result, i) => i ? result : { ...result, status: 'skipped' }) }]) {
  assert.equal(acceptanceSummary({ ...finished, ...patch }, currentRun).accepted, false);
}
assert.equal(acceptanceSummary(finished, { ...currentRun, runId: 'older-run' }).accepted, false);
assert.equal(acceptanceSummary(finished, { ...currentRun, sourceRevision: 'c'.repeat(40) }).accepted, false);
for (const status of ['failed', 'blocked']) {
  assert.equal(acceptanceSummary({ ...finished, results: finished.results.map((result, i) => i ? result : { ...result, status }) }, currentRun).accepted, false);
}
const config = JSON.parse(await readFile('firebase.acceptance.json', 'utf8'));
assertAcceptanceConfig(config);
for (const unsafe of [{ ...config, functions: { source: 'functions' } }, { ...config, hosting: {} },
  { ...config, emulators: { ...config.emulators, functions: { host: '127.0.0.1', port: 5001 } } },
  { ...config, emulators: { ...config.emulators, auth: { host: 'example.invalid', port: 9098 } } }]) {
  assert.throws(() => assertAcceptanceConfig(unsafe));
}
const require = createRequire(new URL('./node_modules/firebase-tools/package.json', import.meta.url));
const YAML = require('yaml');
const workflow = YAML.parse(await readFile('.github/workflows/tender-radar-acceptance-linux.yml', 'utf8'));
assert.deepEqual(Object.keys(workflow.on), ['workflow_dispatch', 'pull_request']);
assert.deepEqual(workflow.on.pull_request.branches, ['main']);
assert.equal(workflow.jobs.acceptance['runs-on'], 'ubuntu-24.04');
assert.equal(workflow.permissions.contents, 'read');
const steps = workflow.jobs.acceptance.steps;
assert.equal(steps.find(step => step.uses === 'actions/setup-node@v4').with['node-version'], '22.23.2');
assert.equal(steps.find(step => step.uses === 'actions/setup-java@v4').with['java-version'], '21.0.12');
assert.ok(steps.some(step => step.run === 'node test/acceptance/verify-results.mjs'));
assert.ok(steps.some(step => step.uses === 'actions/upload-artifact@v4' && step.if === 'always()'));
assert.ok(steps.some(step => step.run === 'bash scripts/tender-radar/acceptance-linux.sh'));
assert.ok(!JSON.stringify(workflow).includes('secrets.'));
console.log('Linux workflow parsed; completed result accepted; interrupted, incomplete, skipped and unsafe results rejected. No acceptance run performed.');
