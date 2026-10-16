import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

export function demoStorageUrl(data) {
  assert.ok(typeof data.storagePath === 'string' && /^stds\/\d+-synthetic-two-rows\.pdf$/.test(data.storagePath));
  const url = new URL(data.url);
  assert.equal(url.origin, 'http://127.0.0.1:9198');
  assert.equal(url.username, ''); assert.equal(url.password, '');
  assert.equal(url.pathname, '/v0/b/demo-tender-radar.appspot.com/o/' + encodeURIComponent(data.storagePath));
  assert.equal(url.searchParams.get('alt'), 'media');
  assert.ok(url.searchParams.get('token'));
  return url;
}

export async function checkStdPersistence({ page, db, auth, directory, login, manage, uploaded, captureManagement }) {
  const fixture = await readFile(path.join(directory, 'synthetic-two-rows.pdf'));
  const stored = new Map();
  for (const [account, title] of [['owner-a', 'Synthetic STD A'], ['owner-b', 'Synthetic STD B']]) {
    const user = await auth.getUser(account);
    assert.notEqual(user.customClaims?.admin, true);
    const profile = (await db.doc(`users/${account}`).get()).data();
    assert.equal(profile.role, 'user'); assert.equal(profile.subscriptionTier, 'enterprise');
    await login(account); await manage();
    const form = page.locator('form').filter({ has: page.getByRole('button', { name: 'Upload Document', exact: true }) });
    await form.locator('input[type="text"]').fill(title);
    await form.locator('input[type="file"]').setInputFiles(path.join(directory, 'synthetic-two-rows.pdf'));
    await form.getByRole('button', { name: 'Upload Document', exact: true }).click();
    await uploaded().getByRole('heading', { name: title, exact: true }).waitFor();
    const docs = await db.collection('stds').where('authorUid', '==', account).get();
    assert.equal(docs.size, 1);
    const snapshot = docs.docs[0];
    const data = snapshot.data();
    assert.equal(data.id, snapshot.id);
    assert.equal(data.title, title); assert.equal(data.authorUid, account);
    assert.equal(data.category, 'Goods'); assert.equal(data.method, 'OTM');
    assert.equal(data.valueMin, 0); assert.equal(data.valueMax, 5000000);
    assert.ok(data.createdAt.toMillis() > 0);
    const url = demoStorageUrl(data);
    stored.set(account, { id: snapshot.id, url });
    await page.reload(); await manage();
    await uploaded().getByRole('heading', { name: title, exact: true }).waitFor();
    assert.equal((await db.doc(`stds/${snapshot.id}`).get()).exists, true);
    // Independent Node request: no browser cache or DOM state can establish
    // persistence. Never log or publish the synthetic download-token URL.
    const response = await fetch(url, { redirect: 'error', signal: AbortSignal.timeout(10000) });
    assert.equal(response.status, 200);
    assert.deepEqual(Buffer.from(await response.arrayBuffer()), fixture);
    if (account === 'owner-a') await captureManagement();
    if (account === 'owner-b') assert.equal(await uploaded().getByRole('heading', { name: 'Synthetic STD A', exact: true }).count(), 0);
  }
  for (const [account, ownTitle, otherTitle] of [
    ['owner-a', 'Synthetic STD A', 'Synthetic STD B'], ['owner-b', 'Synthetic STD B', 'Synthetic STD A'],
  ]) {
    await login(account); await manage();
    await uploaded().getByRole('heading', { name: ownTitle, exact: true }).waitFor();
    assert.equal(await uploaded().getByRole('heading', { name: otherTitle, exact: true }).count(), 0);
    const row = uploaded().locator('div').filter({ has: page.getByRole('heading', { name: ownTitle, exact: true }) })
      .filter({ has: page.getByRole('link', { name: 'View', exact: true }) }).last();
    await row.getByRole('button').click();
    await uploaded().getByRole('heading', { name: ownTitle, exact: true }).waitFor({ state: 'hidden' });
    const { id, url } = stored.get(account);
    assert.equal((await db.doc(`stds/${id}`).get()).exists, false);
    const response = await fetch(url, { redirect: 'error', signal: AbortSignal.timeout(10000) });
    assert.equal(response.status, 404, 'Storage object must be deleted, not just hidden from the list');
    await response.body?.cancel();
    await page.reload(); await manage();
    assert.equal(await uploaded().getByRole('heading', { name: ownTitle, exact: true }).count(), 0);
  }
  assert.equal((await db.collection('stds').get()).size, 0);
}
