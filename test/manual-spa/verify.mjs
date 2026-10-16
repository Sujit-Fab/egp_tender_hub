import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
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
  return { sourceRevision, passed: requiredSpaChecks.length, failed: 0, skipped: 0, blocked: 0, accepted: true };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const root = '.cache/tender-radar/manual-spa/';
  const report = JSON.parse(await readFile(root + 'latest-session.json', 'utf8'));
  const launch = JSON.parse(await readFile(root + 'launch.json', 'utf8'));
  const source = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
  const hash = createHash('sha256').update(await readFile('firestore.rules')).digest('hex');
  console.log(JSON.stringify(validateSpaReport(report, launch, source, hash)));
}
