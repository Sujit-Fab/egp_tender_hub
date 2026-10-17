import { mkdir, readFile, writeFile, appendFile, rename } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { createRequire } from 'node:module';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { assertEmulators, PROJECT_ID, DATABASE_ID, FIRESTORE_HOST, emulatorCredential,
  blockExternalSockets, isolationStats } from '../acceptance/isolation.mjs';
import { loadAcceptanceRules } from '../acceptance/rules.mjs';
import { syntheticPdf } from '../acceptance/pdf.mjs';
import { assertLoopbackNamespace } from './build.mjs';
import { createCheckProgress, guardUnexpectedDialogs, sanitizedFailure } from './harness.mjs';
import { requiredSpaChecks } from './checks.mjs';

assertEmulators();
if (process.platform !== 'linux' || process.env.FIREBASE_STORAGE_EMULATOR_HOST !== '127.0.0.1:9198') {
  throw new Error('Manual session requires loopback-only Linux namespace.');
}
assertLoopbackNamespace();
const guard = blockExternalSockets();
const sdk = createRequire(new URL('../../functions/index.js', import.meta.url));
const express = sdk('express');
const { initializeApp, deleteApp, cert } = sdk('firebase-admin/app');
const { getFirestore, FieldValue } = sdk('firebase-admin/firestore');
const { getAuth } = sdk('firebase-admin/auth');
const { createAuthorizer } = sdk('./tender-radar/auth');
const { createIngestionService } = sdk('./tender-radar/ingestion');
const { createPdfReader, registerTenderRadarRoutes } = sdk('./tender-radar/routes');
const { createBoundedParser } = sdk('./tender-radar/parser');
const { createTenderStore } = sdk('./tender-radar/store');
const browserTools = createRequire(new URL('../acceptance/package.json', import.meta.url));
const { chromium } = browserTools('playwright');
const automated = process.argv.includes('--automated');
const root = path.resolve('.cache/tender-radar/manual-spa');
const directory = path.join(root, `run-${new Date().toISOString().replaceAll(':', '-')}-${randomUUID()}`);
await mkdir(directory, { recursive: true });
const report = { startedAt: new Date().toISOString(), project: PROJECT_ID, database: DATABASE_ID,
  build: JSON.parse(await readFile(path.join(root, 'build.json'), 'utf8')),
  manualAcceptanceComplete: false, cleanupVerified: false, isolationStats };
report.sourceRevision = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
if (report.sourceRevision !== report.build.sourceRevision) throw new Error('SPA build belongs to another source commit.');
report.automated = automated;
report.runId = process.env.TENDER_RADAR_SPA_RUN_ID;
if (!report.runId) throw new Error('Fresh launcher identity is required.');
report.evidenceDirectory = path.relative(process.cwd(), directory);
report.visual = { sourceRevision: report.sourceRevision, runId: report.runId, captures: [] };
report.coverage = { stdOwnerFiltering: 'UI-only; not authorization or confidentiality',
  storageRules: 'demo-only permissive signed-in stds access; production policy unverified',
  profileBehavior: 'not tested or changed', humanVisualReview: 'not_run', pwaInstallation: 'not_run' };
report.complete = false;
const atomicWrite = async (file, bytes) => {
  await writeFile(file + '.tmp', bytes);
  await rename(file + '.tmp', file);
};
const progress = createCheckProgress(report, requiredSpaChecks, async bytes => {
  await atomicWrite(path.join(directory, 'progress.json'), bytes);
  await atomicWrite(path.join(root, 'latest-session.json'), bytes);
});
await progress.checkpoint();
const record = value => appendFile(path.join(directory, 'events.jsonl'), JSON.stringify({ at: new Date().toISOString(), ...value }) + '\n');
await writeFile(path.join(directory, 'failures.md'), '# Manual full-SPA/PWA results\n\nRecord each checklist item as PASS / FAIL / BLOCKED / NOT RUN.\n\n| Item | Status | Account / language | Steps | Expected | Actual | Console source line |\n|---|---|---|---|---|---|---|\n');
console.log(`Manual run evidence: ${directory}`);
await writeFile(path.join(root, 'latest-run.txt'), directory + '\n');
let sdkApp;
let db;
let server;
let browser;
let context;
const disposeDialogGuards = [];
let progressWriteFailed = false;
let suiteReturned = false;
let phase = 'rules';
try {
  report.rulesHash = await loadAcceptanceRules();
  phase = 'demo accounts';
  sdkApp = initializeApp({ projectId: PROJECT_ID, credential: emulatorCredential(cert) }, 'manual-spa');
  const auth = getAuth(sdkApp);
  db = getFirestore(sdkApp, DATABASE_ID);
  db.settings({ host: FIRESTORE_HOST, ssl: false });
  for (const account of ['admin', 'ordinary', 'other', 'owner-a', 'owner-b']) {
    await auth.createUser({ uid: account, email: `${account}@example.invalid`, emailVerified: true,
      displayName: `Demo ${account}`, password: 'Emulator-only-password-2026' });
    if (account === 'admin') await auth.setCustomUserClaims(account, { admin: true });
    await db.doc(`users/${account}`).set({ uid: account, email: `${account}@example.invalid`,
      displayName: `Demo ${account}`, role: account === 'admin' ? 'admin' : 'user',
      subscriptionTier: account === 'admin' || account.startsWith('owner-') ? 'enterprise' : 'free', scansThisMonth: 0,
      createdAt: FieldValue.serverTimestamp() });
  }
  const app = express();
  app.use((request, response, next) => {
    response.set('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: http://127.0.0.1:9198; font-src 'self' data:; connect-src 'self' http://127.0.0.1:9098 http://127.0.0.1:8085 http://127.0.0.1:9198; worker-src 'self' blob:; frame-src 'self' blob:; object-src 'none'; base-uri 'self'; form-action 'self'");
    response.set('Cache-Control', 'no-store');
    next();
  });
  registerTenderRadarRoutes(app, { service: createIngestionService({
    authorize: createAuthorizer({ verifyIdToken: (token, revoked) => auth.verifyIdToken(token, revoked), getUser: uid => auth.getUser(uid) }),
    readPdf: createPdfReader(express), parse: createBoundedParser(),
    loadCategories: async () => (await import('../../functions/tender-radar/runtime/categorizer.mjs')).TENDER_CATEGORY_KEYS,
    store: createTenderStore(db, () => FieldValue.serverTimestamp()),
  }) });
  app.use('/api', (request, response) => response.status(503).json({ error: 'Unavailable in isolated manual acceptance; no live integrations.' }));
  app.use(express.static(path.join(root, 'build')));
  app.get('*', (request, response) => response.sendFile(path.join(root, 'build/index.html')));
  phase = 'local server';
  server = await new Promise((resolve, reject) => {
    const instance = app.listen(4179, '127.0.0.1', () => resolve(instance)); instance.once('error', reject);
  });
  phase = 'synthetic fixture';
  browser = await chromium.launch({ headless: true, args: ['--disable-background-networking', '--host-resolver-rules=MAP * ~NOTFOUND, EXCLUDE 127.0.0.1'] });
  await writeFile(path.join(directory, 'synthetic-two-rows.pdf'), await syntheticPdf(browser, [{ id: '910001' }, { id: '910002' }]));
  await browser.close(); browser = undefined;
  phase = 'manual browser';
  context = await chromium.launchPersistentContext(path.join(directory, 'browser-profile'), {
    headless: automated, acceptDownloads: true, viewport: { width: 1440, height: 1000 },
    args: ['--disable-background-networking', '--host-resolver-rules=MAP * ~NOTFOUND, EXCLUDE 127.0.0.1'],
  });
  await context.route('**/*', async route => {
    const url = new URL(route.request().url());
    if (url.protocol === 'http:' && url.hostname === '127.0.0.1' && ['4179', '9098', '8085', '9198'].includes(url.port)) return route.continue();
    await record({ type: 'blocked-browser-request', origin: url.origin });
    await route.abort();
  });
  const pageErrors = [];
  const blockedRequests = [];
  context.on('request', request => {
    if (!request.url().startsWith('http://127.0.0.1:')) blockedRequests.push(new URL(request.url()).origin);
  });
  context.on('page', page => {
    page.setDefaultTimeout(15000);
    page.on('pageerror', error => { void record({ type: 'page-error', name: error.name }); });
    page.on('pageerror', error => pageErrors.push(error.name));
    // Keep native prompts/confirmations visible for the human, rather than
    // Playwright's default automatic dismissal when no dialog listener exists.
    if (!automated) page.on('dialog', () => {});
    else disposeDialogGuards.push(guardUnexpectedDialogs(page, error => {
      pageErrors.push('HarnessError');
      void progress.noteFailure(error).catch(() => { progressWriteFailed = true; process.exitCode = 1; });
    }));
  });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:4179');
  await page.waitForFunction(() => document.getElementById('root')?.childElementCount > 0);
  await page.waitForFunction(async () => Boolean((await navigator.serviceWorker.getRegistration())?.active));
  await record({ type: 'spa-mounted-and-service-worker-ready' });
  if (automated) {
    const { runSpaChecks } = await import('./checks.mjs');
    report.checks = await runSpaChecks({ page, context, db, auth, directory, record, pageErrors, blockedRequests,
      visual: report.visual, progress });
    suiteReturned = true;
    if (report.firstFailure || report.checks.some(check => check.status !== 'passed')) process.exitCode = 1;
  } else {
  console.log(`DEMO manual SPA ready: http://127.0.0.1:4179 (use ONLY the Chromium window opened here).\nEvidence and synthetic PDF: ${directory}\nSign in prompts for admin, ordinary, other, owner-a or owner-b. Close every manual browser window to stop.\nDo not use real documents or accounts. Live AI/email/support endpoints are disabled.`);
  await new Promise(resolve => context.once('close', resolve));
  context = undefined;
  }
} catch (error) {
  report.failedPhase = phase;
  await progress.noteFailure(error).catch(() => { progressWriteFailed = true; });
  await record({ type: 'startup-failure', phase, ...sanitizedFailure(error) });
  console.error(`Manual environment failed during ${phase}; see ${directory}.`);
  process.exitCode = 1;
} finally {
  const outcomes = await Promise.allSettled([
    context?.close(), browser?.close(), db?.terminate(),
    server && new Promise((resolve, reject) => { server.close(error => error ? reject(error) : resolve()); server.closeAllConnections(); }),
  ]);
  for (const dispose of disposeDialogGuards) dispose();
  outcomes.push(...await Promise.allSettled([sdkApp && deleteApp(sdkApp), guard.closeConnections()]));
  await progress.flush().catch(() => { progressWriteFailed = true; });
  report.cleanupVerified = !progressWriteFailed && outcomes.every(result => result.status === 'fulfilled');
  report.complete = automated && suiteReturned && report.checks.length === requiredSpaChecks.length && !progressWriteFailed;
  report.finishedAt = new Date().toISOString();
  await atomicWrite(path.join(directory, 'session.json'), JSON.stringify(report, null, 2));
  await atomicWrite(path.join(root, 'latest-session.json'), JSON.stringify(report, null, 2));
  if (automated) console.log('Full SPA acceptance:', JSON.stringify({
    sourceRevision: report.sourceRevision, complete: report.complete, cleanupVerified: report.cleanupVerified,
    passed: report.checks?.filter(check => check.status === 'passed').length ?? 0,
    failed: report.checks?.filter(check => check.status === 'failed').length ?? 0,
  }));
  if (report.firstFailure || !report.cleanupVerified || isolationStats.blockedSockets || isolationStats.credentialAttempts) process.exitCode = 1;
}
