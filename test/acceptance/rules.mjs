import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { assertEmulators, PROJECT_ID, DATABASE_ID, FIRESTORE_HOST } from './isolation.mjs';

// CLI 15 supports only one startup rules file. Explicitly configure and read
// back rules for both databases before initializing clients or seeding data.
export async function loadAcceptanceRules() {
  assertEmulators();
  const content = await readFile('firestore.rules', 'utf8');
  for (const database of ['(default)', DATABASE_ID]) {
    const endpoint = `http://${FIRESTORE_HOST}/emulator/v1/projects/${PROJECT_ID}/databases/${database}:securityRules`;
    const response = await fetch(endpoint, { method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rules: { files: [{ name: 'firestore.rules', content }] } }),
      signal: AbortSignal.timeout(120000) });
    const result = await response.json();
    if (!response.ok || result.issues?.some(issue => issue.severity === 'ERROR')) {
      throw new Error('ACCEPTANCE: emulator rules loading failed');
    }
    const readback = await fetch(endpoint, { signal: AbortSignal.timeout(120000) });
    const loaded = await readback.json();
    if (!readback.ok || loaded.rules?.files?.length !== 1 || loaded.rules.files[0].content !== content) {
      throw new Error('ACCEPTANCE: emulator rules readback mismatch');
    }
  }
  return createHash('sha256').update(content).digest('hex');
}
