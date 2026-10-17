import { PROJECT_ID, DATABASE_ID } from './isolation.mjs';
import { requiredChecks } from './checks.mjs';
export function acceptanceSummary(evidence, currentRun) {
  const results = evidence.results ?? [];
  const passed = results.filter(result => result.status === 'passed').length;
  const complete = evidence.complete === true;
  const cleanupVerified = evidence.cleanupVerified === true;
  const accepted = complete && cleanupVerified &&
    typeof evidence.runId === 'string' && evidence.runId.length > 0 && evidence.runId === currentRun?.runId &&
    /^[a-f0-9]{40}$/.test(evidence.sourceRevision ?? '') && evidence.sourceRevision === currentRun?.sourceRevision &&
    Number.isFinite(Date.parse(evidence.startedAt)) && Number.isFinite(Date.parse(evidence.finishedAt)) &&
    Date.parse(evidence.finishedAt) >= Date.parse(evidence.startedAt) &&
    evidence.project === PROJECT_ID && evidence.database === DATABASE_ID &&
    /^[a-f0-9]{64}$/.test(evidence.rulesHash ?? '') &&
    evidence.isolationStats?.blockedSockets === 0 && evidence.isolationStats?.credentialAttempts === 0 &&
    results.length === requiredChecks.length && passed === requiredChecks.length &&
    requiredChecks.every(name => results.some(result => result.name === name && result.status === 'passed'));
  return { complete, cleanupVerified, passed, accepted };
}
