import { spawn, execFileSync } from 'node:child_process';
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import path from 'node:path';
import net from 'node:net';
import { PROJECT_ID, DATABASE_ID, acceptanceEnvironment } from '../../test/acceptance/isolation.mjs';
import { requiredChecks } from '../../test/acceptance/checks.mjs';
import { assertAcceptanceConfig } from '../../test/acceptance/config.mjs';
import { acceptanceSummary } from '../../test/acceptance/evidence.mjs';

const root = process.cwd();
const cache = path.join(root, '.cache/tender-radar');
const environment = acceptanceEnvironment(root);
await mkdir(path.join(cache, 'config'), { recursive: true });
const currentRun = { runId: randomUUID(), startedAt: new Date().toISOString(),
  sourceRevision: execFileSync('git', ['rev-parse', 'HEAD'], { env: environment, encoding: 'utf8' }).trim() };
if (!/^[a-f0-9]{40}$/.test(currentRun.sourceRevision)) throw new Error('Acceptance requires an identified source revision.');
environment.TENDER_RADAR_ACCEPTANCE_RUN_ID = currentRun.runId;
environment.TENDER_RADAR_ACCEPTANCE_SOURCE_REVISION = currentRun.sourceRevision;
await writeFile(path.join(cache, 'current-run.json'), JSON.stringify(currentRun, null, 2));
async function writeEvidence(evidence) {
  const value = JSON.stringify(evidence, null, 2);
  await writeFile(path.join(cache, 'results.json'), value);
  await writeFile(path.join(cache, `results-${evidence.startedAt.replaceAll(':', '-')}.json`), value);
}
async function interrupted(reason, exitCode) {
  const files = (await readdir(cache)).filter(name => /^progress-.*\.json$/.test(name)).sort().reverse();
  let progress;
  for (const file of files) {
    const candidate = JSON.parse(await readFile(path.join(cache, file), 'utf8'));
    if (candidate.runId === currentRun.runId) { progress = candidate; break; }
  }
  const results = [...(progress?.results ?? []), { name: 'Acceptance process', status: 'blocked', reason, exitCode }];
  for (const name of requiredChecks) {
    if (!results.some(result => result.name === name)) results.push({ name, status: 'skipped', reason: 'Current run did not complete this required check' });
  }
  await writeEvidence({ ...currentRun, startedAt: progress?.startedAt ?? currentRun.startedAt,
    finishedAt: new Date().toISOString(), complete: false, cleanupVerified: false,
    project: PROJECT_ID, database: DATABASE_ID, rulesHash: progress?.rulesHash,
    isolationStats: progress?.isolationStats, results });
}
await interrupted('Current run has not completed');
try {
  assertAcceptanceConfig(JSON.parse(await readFile('firebase.acceptance.json', 'utf8')));
  for (const port of [9098, 8085, 9152, 4402, 4502, 4178]) {
    await new Promise((resolve, reject) => {
      const server = net.createServer();
      server.once('error', () => reject(new Error('Acceptance port occupied')));
      server.listen(port, '127.0.0.1', () => server.close(resolve));
    });
  }
  const diagnostic = process.argv.includes('--diagnostic');
  // Only demo Auth/Firestore; this configuration rejects all deployment targets.
  const status = await new Promise((resolve, reject) => {
    const child = spawn(process.execPath, ['test/acceptance/node_modules/firebase-tools/lib/bin/firebase.js',
      'emulators:exec', '--project', PROJECT_ID, '--config', 'firebase.acceptance.json', '--only', 'auth,firestore',
      diagnostic ? 'node test/acceptance/diagnostic.mjs' : 'node test/acceptance/run.mjs'],
    { cwd: root, env: environment, stdio: 'inherit', windowsHide: true });
    child.once('error', reject); child.once('exit', code => resolve(code ?? 1));
  });
  if (diagnostic) { process.exitCode = status; }
  else {
    const evidence = JSON.parse(await readFile(path.join(cache, 'results.json'), 'utf8'));
    const summary = acceptanceSummary(evidence, currentRun);
    if (!evidence.complete || evidence.runId !== currentRun.runId || status !== 0 && summary.accepted) {
      await interrupted('Suite or emulator launcher exited before verified completion', status);
    }
    process.exitCode = status === 0 && summary.accepted ? 0 : 1;
    if (process.exitCode) console.error('Acceptance remains incomplete or failed; current-run evidence retained.');
  }
} catch {
  await interrupted('Current run launcher could not complete');
  console.error('BLOCKED: isolated acceptance launcher failed.');
  process.exitCode = 1;
}
