import assert from 'node:assert/strict';
import path from 'node:path';

export const requiredSpaChecks = [
  'Built SPA mounts with real styles and landing navigation',
  'Ordinary account cannot see admin ingestion controls',
  'English real parser preview and confirmation import exactly two rows',
  'English repeated import preserves exactly one receipt and two tenders',
  'English invalid PDF/count and changed inputs cannot confirm',
  'Bengali real parser preview, duplicate confirmation and invalid input',
  'Account switch removes the previous admin preview',
  'Refresh restores account but discards unconfirmed preview',
  'Narrow viewport renders the full app shell',
  'Local manifest and activated service worker control the built SPA',
  'Offline reload renders the precached app shell',
  'No uncaught browser errors or production connection attempts',
];

export async function runSpaChecks({ page, context, db, directory, record, pageErrors, blockedRequests }) {
  const results = [];
  const check = async (name, action) => {
    try { await action(); results.push({ name, status: 'passed' }); }
    catch (error) {
      // Keep evidence free of document text, tokens and SDK exception messages.
      results.push({ name, status: 'failed', error: error.name,
        location: error.stack?.split('\n').find(line => line.includes('/test/manual-spa/'))?.trim() });
    }
    await record(results.at(-1));
  };
  const header = page.locator('header');
  const admin = page.locator('section[aria-labelledby="radar-admin-heading"]');
  async function menu() { await header.getByAltText('Profile', { exact: true }).hover(); }
  async function login(account, lang = 'en') {
    await context.setOffline(false);
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto('http://127.0.0.1:4179');
    await page.waitForFunction(() => document.querySelector('#root header'));
    // Auth persistence is asynchronous: wait until either stable header state is available.
    await page.waitForFunction(() => [...document.querySelectorAll('header button')].some(b => b.textContent.includes('Login')) || document.querySelector('header img[alt="Profile"]'));
    if (await header.getByAltText('Profile', { exact: true }).count()) {
      await menu(); await header.getByRole('button', { name: 'Logout', exact: true }).click();
    }
    const button = header.getByRole('button', { name: 'Login', exact: true });
    await button.waitFor({ state: 'visible' });
    page.once('dialog', dialog => dialog.accept(account));
    await button.click();
    await header.getByAltText('Profile', { exact: true }).waitFor({ state: 'visible' });
    if (lang === 'bn') await header.getByRole('button', { name: 'বাংলা', exact: true }).click();
    await menu();
    await header.getByRole('button', { name: lang === 'en' ? 'Tender Radar' : 'টেন্ডার রাডার', exact: true }).click();
    await page.getByRole('heading', { name: 'Tender Radar', exact: true }).waitFor();
    if (account === 'admin') await admin.waitFor();
    else await page.getByText('Category preferences are available on Pro and Enterprise plans.', { exact: true }).waitFor();
  }
  const choose = async (count = '2', invalid = false) => {
    await page.locator('#radar-admin-file').setInputFiles(invalid ? {
      name: 'invalid.pdf', mimeType: 'application/pdf', buffer: Buffer.from('invalid PDF'),
    } : path.join(directory, 'synthetic-two-rows.pdf'));
    await page.locator('#radar-admin-count').fill(count);
  };
  const preview = async (lang = 'en') => {
    await admin.getByRole('button', { name: lang === 'en' ? 'Validate and preview' : 'যাচাই ও প্রিভিউ', exact: true }).click();
    await admin.getByRole('heading', { name: lang === 'en' ? 'PDF verified' : 'PDF যাচাই সফল', exact: true }).waitFor();
  };
  const confirm = lang => admin.getByRole('button', { name: lang === 'en' ? 'Confirm import' : 'আমদানি নিশ্চিত করুন', exact: true });
  const counts = async () => [(await db.collection('tenderRadarTenders').get()).size,
    (await db.collection('tenderRadarImports').get()).size];

  await check(requiredSpaChecks[0], async () => {
    assert.ok(await page.locator('#root').innerText());
    assert.ok(await page.locator('link[rel="stylesheet"]').count());
    await header.getByRole('button', { name: 'Login', exact: true }).waitFor();
    await page.getByRole('link', { name: 'Privacy Policy', exact: true }).first().click();
    await page.waitForURL('**/privacy');
    assert.match(await page.locator('#root').innerText(), /Privacy/);
  });
  await check(requiredSpaChecks[1], async () => {
    await login('ordinary'); assert.equal(await admin.count(), 0);
  });
  await check(requiredSpaChecks[2], async () => {
    await login('admin'); await choose(); await preview();
    assert.deepEqual(await counts(), [0, 0], 'preview must not persist');
    await confirm('en').click();
    await admin.getByRole('status').filter({ hasText: 'Import complete. New tenders saved: 2.' }).waitFor();
    assert.deepEqual(await counts(), [2, 1]);
  });
  await check(requiredSpaChecks[3], async () => {
    await login('admin'); await choose(); await preview(); await confirm('en').click();
    await admin.getByRole('status').filter({ hasText: 'No tenders were added.' }).waitFor();
    assert.deepEqual(await counts(), [2, 1]);
  });
  await check(requiredSpaChecks[4], async () => {
    await login('admin'); await choose('401');
    assert.equal(await admin.getByRole('button', { name: 'Validate and preview', exact: true }).isDisabled(), true);
    await choose('1');
    await admin.getByRole('button', { name: 'Validate and preview', exact: true }).click();
    await admin.getByRole('alert').waitFor(); assert.equal(await confirm('en').count(), 0);
    await choose('2', true);
    await admin.getByRole('button', { name: 'Validate and preview', exact: true }).click();
    await admin.getByRole('alert').waitFor(); assert.equal(await confirm('en').count(), 0);
    await choose(); await preview(); await page.locator('#radar-admin-count').fill('3');
    assert.equal(await confirm('en').count(), 0); assert.deepEqual(await counts(), [2, 1]);
  });
  await check(requiredSpaChecks[5], async () => {
    await login('admin', 'bn'); await choose(); await preview('bn'); await confirm('bn').click();
    await admin.getByRole('status').filter({ hasText: 'নতুন টেন্ডার যোগ হয়নি।' }).waitFor();
    await choose('2', true);
    await admin.getByRole('button', { name: 'যাচাই ও প্রিভিউ', exact: true }).click();
    await admin.getByRole('alert').waitFor(); assert.equal(await confirm('bn').count(), 0);
    assert.deepEqual(await counts(), [2, 1]);
  });
  await check(requiredSpaChecks[6], async () => {
    await login('admin'); await choose(); await preview();
    await menu(); await header.getByRole('button', { name: 'Logout', exact: true }).click();
    await admin.waitFor({ state: 'hidden' });
    await login('other'); assert.equal(await admin.count(), 0); assert.deepEqual(await counts(), [2, 1]);
  });
  await check(requiredSpaChecks[7], async () => {
    await login('admin'); await choose(); await preview(); await page.reload();
    await header.getByAltText('Profile', { exact: true }).waitFor(); await menu();
    await header.getByRole('button', { name: 'Tender Radar', exact: true }).click();
    await admin.waitFor(); assert.equal(await confirm('en').count(), 0);
  });
  await check(requiredSpaChecks[8], async () => {
    await page.setViewportSize({ width: 390, height: 844 });
    assert.equal(await header.isVisible(), true);
    assert.ok((await page.locator('#root').innerText()).length > 100);
    await page.setViewportSize({ width: 1440, height: 1000 });
  });
  await check(requiredSpaChecks[9], async () => {
    await page.reload();
    await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller));
    const manifestUrl = await page.locator('link[rel="manifest"]').getAttribute('href');
    const response = await page.request.get(new URL(manifestUrl, page.url()).href);
    assert.equal(response.ok(), true);
    assert.equal((await response.json()).name, 'eGPTenderHub DEMO acceptance');
  });
  await check(requiredSpaChecks[10], async () => {
    try {
      await context.setOffline(true); await page.reload();
      await page.locator('#root header').waitFor();
      assert.ok((await page.locator('#root').innerText()).length > 100);
    } finally { await context.setOffline(false); }
  });
  await check(requiredSpaChecks[11], async () => {
    assert.deepEqual(pageErrors, []);
    assert.equal(blockedRequests.some(origin => /gen-lang-client|(?:firebasestorage|firestore|identitytoolkit|securetoken)\.googleapis\.com/.test(origin)), false,
      'production service requests are forbidden even when blocked');
  });
  return results;
}
