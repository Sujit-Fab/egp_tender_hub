import { writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { requiredChecks } from './checks.mjs';
import { assertEmulators, blockExternalSockets, PROJECT_ID, AUTH_HOST, APP_ORIGIN, isolationStats } from './isolation.mjs';

assertEmulators();
const restoreSockets = blockExternalSockets();
const { chromium } = await import('playwright');
const { startHarness } = await import('./server.mjs');
const { syntheticPdf } = await import('./pdf.mjs');
const { loadAcceptanceRules } = await import('./rules.mjs');
const startedAt = new Date().toISOString();
let rulesHash;
const results = [];
const runIdentity = { runId: process.env.TENDER_RADAR_ACCEPTANCE_RUN_ID,
  sourceRevision: process.env.TENDER_RADAR_ACCEPTANCE_SOURCE_REVISION };
async function saveProgress() {
  await mkdir('.cache/tender-radar', { recursive: true });
  await writeFile(`.cache/tender-radar/progress-${startedAt.replaceAll(':', '-')}.json`, JSON.stringify({
    ...runIdentity, startedAt, updatedAt: new Date().toISOString(), complete: false, project: PROJECT_ID,
    rulesHash, isolationStats, requiredChecks, results,
  }, null, 2));
}
const requireCheck = (condition, label) => { if (!condition) throw new Error(`ACCEPTANCE: ${label}`); };
async function check(name, action) {
  try { await action(); results.push({ name, status: 'passed' }); console.log(`PASSED: ${name}`); }
  catch (error) {
    results.push({ name, status: 'failed', reason: error.message?.startsWith('ACCEPTANCE:') ? error.message : error.name,
      frames: error.stack?.split('\n').slice(1).map(frame => frame.replaceAll('\\', '/').match(/(run\.mjs:\d+:\d+)/)?.[1]).filter(Boolean).slice(0, 4) });
    console.error(`FAILED: ${name} (${results.at(-1).reason})`);
  }
  await saveProgress();
}
let harness;
let browser;
let phase = 'start real SDK and local HTTP harness';
const blockedRequests = [];
try {
  phase = 'load and verify repository rules for default and named emulator databases';
  rulesHash = await loadAcceptanceRules();
  results.push({ name: 'Rules: repository rules loaded and read back on both emulator databases', status: 'passed' });
  await saveProgress();
  phase = 'start real SDK and local HTTP harness';
  harness = await startHarness(value => { phase = value; });
  for (const account of ['admin', 'ordinary', 'other', 'disabled', 'revoked', 'removed']) {
    await harness.auth.createUser({ uid: account, email: `${account}@example.invalid`, password: 'Emulator-only-password-2026' });
    if (account !== 'ordinary') await harness.auth.setCustomUserClaims(account, { admin: true });
  }
  async function token(account) {
    const response = await fetch(`http://${AUTH_HOST}/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=demo-only-key`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: `${account}@example.invalid`, password: 'Emulator-only-password-2026', returnSecureToken: true }),
    });
    requireCheck(response.ok, 'emulator sign-in');
    return (await response.json()).idToken;
  }
  const adminToken = await token('admin');
  const ordinaryToken = await token('ordinary');
  const disabledToken = await token('disabled');
  const revokedToken = await token('revoked');
  const removedToken = await token('removed');
  await harness.auth.updateUser('disabled', { disabled: true });
  // Move tokensValidAfterTime past the issued token, avoiding second-level races.
  await new Promise(resolve => setTimeout(resolve, 1100));
  await harness.auth.revokeRefreshTokens('revoked');
  await harness.auth.setCustomUserClaims('removed', {});
  phase = 'launch installed Chromium';
  browser = await chromium.launch({ headless: true, args: ['--disable-background-networking',
    '--host-resolver-rules=MAP * ~NOTFOUND, EXCLUDE 127.0.0.1'] });
  phase = 'generate tagged synthetic PDF';
  const bytes = await syntheticPdf(browser, [{ id: '910001' }, { id: '910002' }]);
  const hash = value => createHash('sha256').update(value).digest('hex');
  async function request(action, pdf, count, bearer = adminToken, previewHash) {
    const headers = { 'Content-Type': 'application/pdf', 'X-Tender-Radar-Expected-Count': String(count) };
    if (bearer) headers.Authorization = `Bearer ${bearer}`;
    if (previewHash) headers['X-Tender-Radar-Preview-Hash'] = previewHash;
    const response = await fetch(`${APP_ORIGIN}/api/tender-radar/${action}`, { method: 'POST', headers, body: pdf });
    return { status: response.status, value: await response.json() };
  }
  const sizes = async () => ({ tenders: (await harness.db.collection('tenderRadarTenders').get()).size,
    imports: (await harness.db.collection('tenderRadarImports').get()).size });
  await check('Isolation: missing/non-loopback emulator configuration fails closed', async () => {
    const original = process.env.FIRESTORE_EMULATOR_HOST;
    try {
      for (const value of ['', 'firestore.googleapis.com:443']) {
        process.env.FIRESTORE_EMULATOR_HOST = value;
        let denied = false; try { assertEmulators(); } catch { denied = true; }
        requireCheck(denied, 'invalid emulator host must be denied');
      }
    } finally { process.env.FIRESTORE_EMULATOR_HOST = original; }
    let denied = false; try { await fetch('https://example.com'); } catch { denied = true; }
    requireCheck(denied, 'external socket must be denied');
    isolationStats.blockedSockets = 0;
  });
  await check('HTTP: missing/ordinary/disabled/revoked/removed admin authorization rejected', async () => {
    for (const bearer of [null, ordinaryToken, disabledToken, revokedToken, removedToken]) {
      for (const action of ['preview', 'confirm']) {
        const response = await request(action, bytes, 2, bearer, 'forged');
        requireCheck([401, 403].includes(response.status), 'unauthorized request must be rejected');
      }
    }
    requireCheck((await sizes()).tenders === 0 && (await sizes()).imports === 0, 'authorization failures must not write');
  });
  await check('HTTP: real parser preview and real SDK atomic ingestion/provenance', async () => {
    const preview = await request('preview', bytes, 2);
    requireCheck(preview.status === 200 && preview.value.totalCount === 2, `synthetic PDF must pass actual parser (HTTP ${preview.status}, ${preview.value.error?.code ?? 'no error code'})`);
    requireCheck((await sizes()).tenders === 0 && (await sizes()).imports === 0, 'preview must not write');
    const confirm = await request('confirm', bytes, 2, adminToken, preview.value.previewHash);
    requireCheck(confirm.status === 200 && confirm.value.createdCount === 2, 'confirmation must import two rows');
    const tender = (await harness.db.doc('tenderRadarTenders/910001').get()).data();
    const receipt = (await harness.db.doc(`tenderRadarImports/${hash(bytes)}`).get()).data();
    requireCheck(tender?.importedBy === 'admin' && tender.importedAt?.toMillis() > 0 &&
      tender.category === 'Road & Highway' && receipt?.createdCount === 2 && receipt.importedAt?.toMillis() > 0,
    'canonical category and real server timestamps/provenance');
  });
  await check('HTTP: parallel and repeated confirmations create exactly one receipt/batch', async () => {
    const parallel = await syntheticPdf(browser, [{ id: '920001' }]);
    const preview = await request('preview', parallel, 1);
    requireCheck(preview.status === 200, 'parallel preview');
    const before = await sizes();
    const outcomes = await Promise.all([1, 2].map(() => request('confirm', parallel, 1, adminToken, preview.value.previewHash)));
    requireCheck(outcomes.every(r => r.status === 200) && outcomes.reduce((n, r) => n + r.value.createdCount, 0) === 1,
      'parallel confirmations must be idempotent');
    const repeated = await request('confirm', parallel, 1, adminToken, preview.value.previewHash);
    requireCheck(repeated.value.status === 'already_imported' && repeated.value.createdCount === 0, 'repeated confirmation');
    const after = await sizes();
    requireCheck(after.tenders === before.tenders + 1 && after.imports === before.imports + 1, 'only one transaction persisted');
  });
  await check('HTTP: overlapping exports skip identical existing content and reject duplicate IDs within a PDF', async () => {
    const overlap = await syntheticPdf(browser, [{ id: '910001' }, { id: '925001' }]);
    const preview = await request('preview', overlap, 2);
    requireCheck(preview.status === 200 && preview.value.duplicateCount === 1 && preview.value.newCount === 1, 'overlap preview');
    const response = await request('confirm', overlap, 2, adminToken, preview.value.previewHash);
    requireCheck(response.status === 200 && response.value.createdCount === 1 && response.value.duplicateCount === 1, 'overlap import');
    const duplicateIds = await syntheticPdf(browser, [{ id: '925002' }, { id: '925002' }]);
    requireCheck((await request('preview', duplicateIds, 2)).status === 422, 'duplicate IDs fail actual verification');
  });
  await check('HTTP: real SDK commit precondition failure rolls back tender and receipt writes', async () => {
    const rollbackPdf = await syntheticPdf(browser, [{ id: '930001' }]);
    const preview = await request('preview', rollbackPdf, 1);
    requireCheck(preview.status === 200, 'rollback preview');
    const before = await sizes();
    const beforeRollbackAttempts = harness.rollbackAttempts;
    harness.setRollback(true);
    try {
      const response = await request('confirm', rollbackPdf, 1, adminToken, preview.value.previewHash);
      requireCheck(response.status === 503, 'injected transaction abort must fail safely');
    } finally { harness.setRollback(false); }
    requireCheck(harness.rollbackAttempts > beforeRollbackAttempts, 'failure must reach the real SDK create precondition');
    const after = await sizes();
    requireCheck(JSON.stringify(before) === JSON.stringify(after) &&
      !(await harness.db.doc('tenderRadarTenders/930001').get()).exists &&
      !(await harness.db.doc(`tenderRadarImports/${hash(rollbackPdf)}`).get()).exists, 'no partially staged documents persist');
    requireCheck((await request('confirm', rollbackPdf, 1, adminToken, preview.value.previewHash)).value.createdCount === 1,
      'retry after abort succeeds');
  });
  await check('HTTP: amendments and conflicts introduced after preview reject the whole batch', async () => {
    const amendment = await syntheticPdf(browser, [{ id: '910001', amendment: true, closing: '25-Oct-2026 10:00' }, { id: '940001' }]);
    const preview = await request('preview', amendment, 2);
    requireCheck(preview.status === 200 && preview.value.conflictCount === 1, 'amendment conflict preview');
    const before = await sizes();
    requireCheck((await request('confirm', amendment, 2, adminToken, preview.value.previewHash)).status === 409, 'amendment rejected');
    requireCheck(JSON.stringify(before) === JSON.stringify(await sizes()), 'amendment writes nothing');
    const raced = await syntheticPdf(browser, [{ id: '940002' }, { id: '940003' }]);
    const racePreview = await request('preview', raced, 2);
    requireCheck(racePreview.status === 200, 'race preview');
    await harness.db.doc('tenderRadarTenders/940002').create({ contentHash: 'synthetic-conflict' });
    requireCheck((await request('confirm', raced, 2, adminToken, racePreview.value.previewHash)).status === 409, 'conflict race rejected');
    requireCheck(!(await harness.db.doc('tenderRadarTenders/940003').get()).exists &&
      !(await harness.db.doc(`tenderRadarImports/${hash(raced)}`).get()).exists, 'conflict leaves no new tender/receipt');
  });
  await check('HTTP: invalid PDF/count and tampered digest cannot persist', async () => {
    const before = await sizes();
    requireCheck((await request('preview', Buffer.from('not a PDF'), 1)).status === 422, 'invalid PDF rejected');
    requireCheck((await request('preview', bytes, 3)).status === 422, 'wrong count rejected');
    requireCheck((await request('confirm', bytes, 2, adminToken, '0'.repeat(64))).status === 409, 'tampered hash rejected');
    requireCheck(JSON.stringify(before) === JSON.stringify(await sizes()), 'invalid input writes nothing');
  });

  // No traces/screenshots or response/token logging. Browser requests are
  // checked before dispatch, including WebSocket destinations.
  async function context() {
    const ctx = await browser.newContext({ serviceWorkers: 'block' });
    ctx.setDefaultTimeout(60000);
    await ctx.route('**/*', route => {
      const url = new URL(route.request().url());
      if (url.protocol === 'http:' && url.hostname === '127.0.0.1' && ['4178', '9098', '8085'].includes(url.port)) return route.continue();
      blockedRequests.push(url.hostname === '127.0.0.1' ? 'unexpected-loopback-port' : 'non-loopback-request'); return route.abort();
    });
    await ctx.routeWebSocket('**/*', socket => { blockedRequests.push('unexpected-websocket'); socket.close(); });
    return ctx;
  }
  await check('Rules: named database denies direct create/update/delete including nested paths for ordinary/admin/anonymous clients', async () => {
    const ctx = await context(); const page = await ctx.newPage();
    await page.goto(APP_ORIGIN);
    for (const account of [null, 'anonymous', 'ordinary', 'admin']) {
      if (account === 'anonymous') await page.evaluate(() => window.acceptance.anonymous());
      if (account && account !== 'anonymous') { await page.getByRole('button', { name: `Sign in ${account}`, exact: true }).click();
        await page.waitForFunction(uid => window.acceptance.auth.currentUser?.uid === uid, account); }
      if (account === 'ordinary') await page.evaluate(() => window.acceptance.createProfile());
      for (const collection of ['tenderRadarImports', 'tenderRadarTenders', 'tenderRadarImports/nested/children', 'tenderRadarTenders/nested/children']) {
        await harness.db.doc(`${collection}/direct-client-test`).set({ synthetic: true });
        for (const operation of ['create', 'update', 'delete']) {
          const result = await page.evaluate(([collection, operation]) => window.acceptance.directWrite(collection, operation), [collection, operation]);
          requireCheck(result === 'permission-denied', 'repository rules must deny every direct write on named database');
        }
      }
    }
    await ctx.close();
  });
  for (const lang of ['en', 'bn']) {
    await check(`Browser ${lang}: keyboard, invalid PDF, refresh and sign-out discard preview`, async () => {
      const ctx = await context(); const page = await ctx.newPage();
      try {
        await page.goto(APP_ORIGIN);
        await page.getByRole('button', { name: 'Sign in admin', exact: true }).click();
        await page.locator('#radar-admin-heading').waitFor();
        if (lang === 'bn') await page.getByRole('button', { name: 'Switch language', exact: true }).click();
        const file = page.locator('#radar-admin-file');
        const count = page.locator('#radar-admin-count');
        const submit = page.locator('button[type=submit]');
        const confirm = page.getByRole('button', { name: lang === 'en' ? 'Confirm import' : 'আমদানি নিশ্চিত করুন', exact: true });
        await file.setInputFiles({ name: 'invalid.pdf', mimeType: 'application/pdf', buffer: Buffer.from('not a PDF') });
        await count.fill('1'); await count.focus(); await page.keyboard.press('Tab');
        requireCheck(await submit.evaluate(element => document.activeElement === element), 'count tabs to preview button');
        await page.keyboard.press('Enter'); await page.getByRole('alert').waitFor();
        requireCheck(await confirm.count() === 0, 'invalid PDF produces no confirmation');
        await file.setInputFiles({ name: 'synthetic.pdf', mimeType: 'application/pdf', buffer: bytes });
        await count.fill('2'); await submit.focus(); await page.keyboard.press('Enter'); await confirm.waitFor();
        await page.reload(); await page.locator('#radar-admin-heading').waitFor();
        if (lang === 'bn') await page.getByRole('button', { name: 'Switch language', exact: true }).click();
        requireCheck(await submit.isDisabled() && await confirm.count() === 0, 'refresh discards file and preview');
        await file.setInputFiles({ name: 'synthetic.pdf', mimeType: 'application/pdf', buffer: bytes });
        await count.fill('2'); await submit.click(); await confirm.waitFor();
        await page.getByRole('button', { name: 'Sign out', exact: true }).click();
        await page.waitForFunction(() => window.acceptance.auth.currentUser === null && !document.querySelector('#radar-admin-heading'));
        await page.getByRole('button', { name: 'Sign in admin', exact: true }).click(); await page.locator('#radar-admin-heading').waitFor();
        requireCheck(await submit.isDisabled() && await confirm.count() === 0, 'sign-out discards file and preview');
      } finally { await ctx.close(); }
    });
    await check(`Browser ${lang}: preview/confirmation, changed files/counts, retry and double-click protection`, async () => {
      const ctx = await context(); const page = await ctx.newPage();
      try {
        await page.goto(APP_ORIGIN);
        await page.getByRole('button', { name: 'Sign in ordinary', exact: true }).click();
        await page.waitForFunction(() => window.acceptance.auth.currentUser?.uid === 'ordinary');
        requireCheck(await page.locator('#radar-admin-heading').count() === 0, 'ordinary users must not see upload panel');
        await page.getByRole('button', { name: 'Sign in admin', exact: true }).click();
        await page.locator('#radar-admin-heading').waitFor();
        if (lang === 'bn') await page.getByRole('button', { name: 'Switch language', exact: true }).click();
        const uiPdf = await syntheticPdf(browser, [{ id: lang === 'en' ? '950001' : '950002' }]);
        const otherPdf = await syntheticPdf(browser, [{ id: lang === 'en' ? '951001' : '951002' }]);
        const upload = buffer => page.locator('#radar-admin-file').setInputFiles({ name: 'synthetic.pdf', mimeType: 'application/pdf', buffer });
        const previewButton = page.locator('button[type=submit]');
        const confirmButton = page.getByRole('button', { name: lang === 'en' ? 'Confirm import' : 'আমদানি নিশ্চিত করুন', exact: true });
        let previews = 0;
        page.on('request', request => { if (request.url().endsWith('/api/tender-radar/preview')) previews++; });
        const preview = async () => {
          const before = previews;
          await previewButton.evaluate(button => { button.click(); button.click(); });
          await confirmButton.waitFor();
          requireCheck(previews === before + 1, 'double click sends one preview');
        };
        await upload(uiPdf); await page.locator('#radar-admin-count').fill('1'); await preview();
        await page.locator('#radar-admin-count').fill('2');
        requireCheck(await confirmButton.count() === 0, 'count edit invalidates preview');
        await previewButton.click(); await page.getByRole('alert').waitFor();
        await page.locator('#radar-admin-count').fill('1'); await preview();
        await upload(otherPdf); requireCheck(await confirmButton.count() === 0, 'file edit invalidates preview');
        await upload(uiPdf);
        await ctx.route('**/api/tender-radar/preview', route => route.fulfill({ status: 503, contentType: 'application/json', body: '{"error":{"code":"SERVICE_UNAVAILABLE"}}' }), { times: 1 });
        await previewButton.click(); await page.getByRole('alert').waitFor();
        await preview();
        const beforeFailedConfirmation = await sizes();
        harness.setRollback(true);
        try { await confirmButton.click(); await page.getByRole('alert').waitFor(); }
        finally { harness.setRollback(false); }
        requireCheck(JSON.stringify(beforeFailedConfirmation) === JSON.stringify(await sizes()), 'failed browser confirmation is atomic');
        requireCheck(await confirmButton.count() === 0, 'confirmation retry requires fresh preview');
        await preview();
        let confirmations = 0;
        page.on('request', request => { if (request.url().endsWith('/api/tender-radar/confirm')) confirmations++; });
        const before = await sizes();
        await confirmButton.evaluate(button => { button.click(); button.click(); });
        await page.waitForFunction(() => !document.querySelector('button[type=button]')?.textContent?.includes('Confirm import') &&
          [...document.querySelectorAll('[role=status]')].some(node => /Import complete|আমদানি সম্পন্ন/.test(node.textContent)));
        requireCheck(confirmations === 1, 'double click sends one confirmation');
        const after = await sizes(); requireCheck(after.tenders === before.tenders + 1 && after.imports === before.imports + 1, 'browser import persists exactly once');
      } finally { await ctx.close(); }
    });
    await check(`Browser ${lang}: tampered preview cannot hide server amendment conflicts`, async () => {
      const ctx = await context(); const page = await ctx.newPage();
      try {
        await page.goto(APP_ORIGIN); await page.getByRole('button', { name: 'Sign in admin', exact: true }).click();
        await page.locator('#radar-admin-heading').waitFor();
        if (lang === 'bn') await page.getByRole('button', { name: 'Switch language', exact: true }).click();
        const changed = await syntheticPdf(browser, [{ id: '910001', amendment: true }]);
        await ctx.route('**/api/tender-radar/preview', async route => {
          const response = await route.fetch(); const preview = await response.json();
          preview.conflictCount = 0; preview.newCount = 1; // malicious browser modification
          await route.fulfill({ response, json: preview });
        });
        await page.locator('#radar-admin-file').setInputFiles({ name: 'synthetic.pdf', mimeType: 'application/pdf', buffer: changed });
        await page.locator('#radar-admin-count').fill('1'); await page.locator('button[type=submit]').click();
        const confirm = page.getByRole('button', { name: lang === 'en' ? 'Confirm import' : 'আমদানি নিশ্চিত করুন', exact: true });
        await confirm.waitFor(); const before = await sizes(); await confirm.click(); await page.getByRole('alert').waitFor();
        requireCheck(JSON.stringify(before) === JSON.stringify(await sizes()), 'tampered conflict preview cannot write');
        requireCheck(await confirm.count() === 0, 'failed confirmation discards preview');
      } finally { await ctx.close(); }
    });
    await check(`Browser ${lang}: account switching discards delayed preview and cannot confirm as another user`, async () => {
      const ctx = await context(); const page = await ctx.newPage();
      try {
        await page.goto(APP_ORIGIN); await page.getByRole('button', { name: 'Sign in admin', exact: true }).click();
        await page.locator('#radar-admin-heading').waitFor();
        if (lang === 'bn') await page.getByRole('button', { name: 'Switch language', exact: true }).click();
        let release; const delayed = new Promise(resolve => { release = resolve; });
        let arrived; const requested = new Promise(resolve => { arrived = resolve; });
        await ctx.route('**/api/tender-radar/preview', async route => {
          const response = await route.fetch(); arrived(); await delayed;
          try { await route.fulfill({ response }); } catch { /* the session aborts the request */ }
        });
        await page.locator('#radar-admin-file').setInputFiles({ name: 'synthetic.pdf', mimeType: 'application/pdf', buffer: bytes });
        await page.locator('#radar-admin-count').fill('2'); await page.locator('button[type=submit]').click(); await requested;
        await page.getByRole('button', { name: 'Sign in ordinary', exact: true }).click();
        await page.waitForFunction(() => window.acceptance.auth.currentUser?.uid === 'ordinary'); release();
        await page.waitForFunction(() => !document.querySelector('#radar-admin-heading'));
        await page.getByRole('button', { name: 'Sign in other', exact: true }).click(); await page.locator('#radar-admin-heading').waitFor();
        requireCheck(await page.locator('button[type=submit]').isDisabled(), 'new account starts with no selected file/preview');
        requireCheck(await page.getByRole('button', { name: lang === 'en' ? 'Confirm import' : 'আমদানি নিশ্চিত করুন', exact: true }).count() === 0,
          'stale preview cannot cross accounts');
      } finally { await ctx.close(); }
    });
  }
  await check('Isolation: browser and SDK made no non-loopback requests or credential fallback attempts', async () => {
    requireCheck(blockedRequests.length === 0 && isolationStats.blockedSockets === 0 && isolationStats.credentialAttempts === 0,
      `all browser/SDK connections are emulator/local only with no credential fallback (non-loopback=${blockedRequests.filter(value => value === 'non-loopback-request').length}, loopback-port=${blockedRequests.filter(value => value === 'unexpected-loopback-port').length}, websocket=${blockedRequests.filter(value => value === 'unexpected-websocket').length}, sockets=${isolationStats.blockedSockets}, credentials=${isolationStats.credentialAttempts})`);
  });
} catch (error) {
  results.push({ name: 'Acceptance prerequisites/harness', status: 'blocked', reason: phase,
    errorType: error.name, errorCode: typeof error.code === 'number' || /^[A-Z_]+$/.test(error.code ?? '') ? error.code : undefined,
    frames: error.stack?.split('\n').slice(1, 5).map(frame => frame.replaceAll('\\', '/').match(/([^/\s()]+:\d+:\d+)/)?.[1]).filter(Boolean),
    detail: error.message?.startsWith('ACCEPTANCE:') ? error.message : undefined });
  console.error(`BLOCKED: ${phase}. Non-loopback sockets and production credentials remain forbidden.`);
} finally {
  const cleanup = await Promise.allSettled([browser?.close(), harness?.close()]);
  await restoreSockets.closeConnections();
  if (cleanup.some(result => result.status === 'rejected')) {
    results.push({ name: 'Harness cleanup', status: 'failed', reason: 'Local resource cleanup failed' });
  }
  // Retain the socket guard through evidence writing and process exit.
  await mkdir('.cache/tender-radar', { recursive: true });
  for (const name of requiredChecks) {
    if (!results.some(result => result.name === name)) results.push({ name, status: 'skipped', reason: 'Harness blocked before this check ran' });
  }
  const evidence = JSON.stringify({ ...runIdentity, startedAt, finishedAt: new Date().toISOString(), complete: true,
    cleanupVerified: cleanup.every(result => result.status === 'fulfilled'), rulesHash, project: PROJECT_ID,
    database: 'ai-studio-7e6a1daf-95b8-46d0-a6ba-7cf295cd1701', isolationStats, results }, null, 2);
  await writeFile('.cache/tender-radar/results.json', evidence);
  await writeFile(`.cache/tender-radar/results-${startedAt.replaceAll(':', '-')}.json`, evidence);
  const totals = Object.fromEntries(['passed', 'failed', 'skipped', 'blocked'].map(status => [status, results.filter(result => result.status === status).length]));
  console.log('Acceptance totals:', JSON.stringify(totals));
  process.exitCode = totals.failed || totals.blocked || totals.skipped ? 1 : 0;
}
