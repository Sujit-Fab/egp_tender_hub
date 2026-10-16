import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
import { validateVisualManifest } from './screenshots.mjs';
import { requiredSpaChecks } from './checks.mjs';
import { PROJECT_ID, DATABASE_ID } from '../acceptance/isolation.mjs';

export function validateSpaReport(report, launch, sourceRevision, rulesHash) {
  assert.equal(report.runId, launch.runId);
  assert.ok(typeof report.runId === 'string' && report.runId.length > 20);
  for (const identity of [report.sourceRevision, launch.sourceRevision, report.build.sourceRevision]) assert.equal(identity, sourceRevision);
  assert.equal(report.project, PROJECT_ID); assert.equal(report.database, DATABASE_ID);
  assert.equal(report.rulesHash, rulesHash);
  assert.equal(report.automated, true); assert.equal(report.complete, true); assert.equal(report.cleanupVerified, true);
  assert.equal(report.isolationStats.blockedSockets, 0); assert.equal(report.isolationStats.credentialAttempts, 0);
  assert.equal(report.checks.length, requiredSpaChecks.length);
  assert.deepEqual(report.checks.map(c => c.name).sort(), [...requiredSpaChecks].sort());
  assert.ok(report.checks.every(c => c.status === 'passed'));
  assert.ok(Date.parse(report.startedAt) >= Date.parse(launch.startedAt));
  assert.ok(Date.parse(report.finishedAt) >= Date.parse(report.startedAt));
  validateVisualManifest(report.visual, sourceRevision, launch.runId);
  return { sourceRevision, passed: requiredSpaChecks.length, failed: 0, skipped: 0, blocked: 0, accepted: true };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const root = '.cache/tender-radar/manual-spa/';
  const report = JSON.parse(await readFile(root + 'latest-session.json', 'utf8'));
  const launch = JSON.parse(await readFile(root + 'launch.json', 'utf8'));
  const source = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
  const hash = createHash('sha256').update(await readFile('firestore.rules')).digest('hex');
  const summary = validateSpaReport(report, launch, source, hash);
  const directory = path.resolve(report.evidenceDirectory);
  assert.equal(path.dirname(directory), path.resolve(root));
  assert.ok(path.basename(directory).startsWith('run-'));
  const savedManifest = JSON.parse(await readFile(path.join(directory, 'screenshots/manifest.json'), 'utf8'));
  assert.deepEqual(savedManifest, report.visual);
  for (const capture of report.visual.captures) {
    const bytes = await readFile(path.join(directory, 'screenshots', capture.file));
    assert.equal(bytes.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
    assert.equal(createHash('sha256').update(bytes).digest('hex'), capture.sha256);
  }
  console.log(JSON.stringify({ ...summary, screenshotsVerified: report.visual.captures.length, pwaInstallation: 'not_run' }));
}
