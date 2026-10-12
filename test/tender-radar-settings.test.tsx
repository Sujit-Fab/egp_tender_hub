import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import test from 'node:test';
import vm from 'node:vm';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import ts from 'typescript';
import * as categories from '../src/lib/tender-radar/categorizer.ts';

// Evaluate the actual component module with inert Firebase imports. Session
// tests and static React rendering never initialize Firebase or contact a server.
const require = createRequire(import.meta.url);
const runtimeImports = new Map(['react', 'react/jsx-runtime', 'lucide-react'].map(name => [name, require(name)]));
const firebase = { auth: { currentUser: null }, db: {}, onAuthStateChanged: () => { throw new Error('Unexpected Auth call'); } };
const source = readFileSync(new URL('../src/components/TenderRadarSettings.tsx', import.meta.url), 'utf8');
const context = {
  exports: {},
  require(name: string) {
    if (name === '../firebase') return firebase;
    if (name === 'firebase/firestore') return {
      doc: () => { throw new Error('Unexpected Firestore call'); },
      getDoc: () => { throw new Error('Unexpected Firestore read'); },
      updateDoc: () => { throw new Error('Unexpected Firestore write'); },
    };
    if (name === '../lib/tender-radar/categorizer') return categories;
    if (runtimeImports.has(name)) return runtimeImports.get(name);
    throw new Error(`Unexpected dependency: ${name}`);
  },
};
vm.runInNewContext(ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022 },
}).outputText, context, { filename: 'TenderRadarSettings.tsx', timeout: 1000 });
const { createTenderRadarSession, TenderRadarPreferencesView, default: Settings } = context.exports as typeof import('../src/components/TenderRadarSettings');

const plain = <T,>(value: T): T => JSON.parse(JSON.stringify(value));
function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (error: Error) => void;
  const promise = new Promise<T>((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}
function setup(tier = 'pro') {
  let uid: string | null = 'account-a';
  const reads: string[] = [];
  const writes: { uid: string; categories: string[] }[] = [];
  const published: any[] = [];
  const store = {
    currentUid: () => uid,
    async read(id: string) { reads.push(id); return { subscriptionTier: tier, tenderCategories: ['IT & Equipment', 'unknown'] }; },
    async write(id: string, values: string[]) { writes.push({ uid: id, categories: plain(values) }); },
  };
  const session = createTenderRadarSession(store, state => published.push(plain(state)));
  return { session, store, reads, writes, published, switchAccount: (next: string | null) => { uid = next; } };
}

test('current Auth identity binds reads/writes and empty selection persists opt-out', async () => {
  const fixture = setup();
  await fixture.session.load();
  assert.deepEqual(fixture.reads, ['account-a']);
  assert.deepEqual(plain(fixture.session.snapshot().selected), ['IT & Equipment']);
  fixture.session.select([]);
  await fixture.session.save();
  assert.deepEqual(fixture.writes, [{ uid: 'account-a', categories: [] }]);
  assert.equal(fixture.session.snapshot().saved, true);
  assert.equal(fixture.session.snapshot().saving, false);
  fixture.switchAccount('account-b');
  await fixture.session.save();
  await fixture.session.load();
  assert.equal(fixture.writes.length, 1);
  assert.equal(fixture.reads.length, 1);
});

test('anonymous, free and unknown tiers cannot write; Pro/Enterprise remain supported', async () => {
  for (const tier of ['free', 'tampered', 'pro', 'enterprise']) {
    const fixture = setup(tier);
    await fixture.session.load();
    await fixture.session.save();
    assert.equal(fixture.writes.length, ['pro', 'enterprise'].includes(tier) ? 1 : 0);
  }
  const fixture = setup();
  fixture.switchAccount(null);
  await fixture.session.load();
  await fixture.session.save();
  assert.deepEqual(fixture.reads, []);
  assert.deepEqual(fixture.writes, []);
  assert.match(renderToStaticMarkup(<Settings />), /Sign in/);
});

test('read/save failures publish generic errors, reset flags and allow retry', async () => {
  const fixture = setup();
  const read = fixture.store.read;
  fixture.store.read = async () => { throw new Error('private backend detail'); };
  await fixture.session.load();
  assert.equal(fixture.session.snapshot().loading, false);
  assert.equal(fixture.session.snapshot().loaded, false);
  assert.match(fixture.session.snapshot().error!, /Could not load/);
  assert.doesNotMatch(fixture.session.snapshot().error!, /private/);
  await fixture.session.save();
  assert.equal(fixture.writes.length, 0);
  fixture.store.read = read;
  await fixture.session.load();
  const write = fixture.store.write;
  fixture.store.write = async () => { throw new Error('private provider detail'); };
  await fixture.session.save();
  assert.equal(fixture.session.snapshot().saving, false);
  assert.equal(fixture.session.snapshot().saved, false);
  assert.match(fixture.session.snapshot().error!, /Could not save/);
  fixture.store.write = write;
  await fixture.session.save();
  assert.equal(fixture.session.snapshot().error, null);
  assert.equal(fixture.session.snapshot().saved, true);
});

test('synchronous duplicate submits and selection edits cannot alter an in-flight save', async () => {
  const fixture = setup();
  await fixture.session.load();
  const pending = deferred<void>();
  const write = fixture.store.write;
  fixture.store.write = async (uid, values) => { await write(uid, values); await pending.promise; };
  const first = fixture.session.save();
  await fixture.session.save();
  fixture.session.select([]);
  assert.equal(fixture.writes.length, 1);
  assert.deepEqual(fixture.writes[0].categories, ['IT & Equipment']);
  assert.equal(fixture.session.snapshot().saving, true);
  pending.resolve();
  await first;
  assert.equal(fixture.session.snapshot().saving, false);
});

test('account switch/unmount discard late read success, read failure and save completion', async () => {
  for (const reject of [false, true]) {
    const fixture = setup();
    const pending = deferred<Awaited<ReturnType<typeof fixture.store.read>>>();
    fixture.store.read = () => pending.promise;
    const loading = fixture.session.load();
    const count = fixture.published.length;
    fixture.switchAccount('account-b');
    if (reject) pending.reject(new Error('old account read failed'));
    else pending.resolve({ subscriptionTier: 'pro', tenderCategories: ['Road & Highway'] });
    await loading;
    assert.equal(fixture.published.length, count);
    assert.equal(fixture.session.snapshot().loading, false);
  }
  const fixture = setup();
  await fixture.session.load();
  const pending = deferred<void>();
  fixture.store.write = () => pending.promise;
  const saving = fixture.session.save();
  const count = fixture.published.length;
  fixture.session.dispose();
  pending.resolve();
  await saving;
  assert.equal(fixture.published.length, count);
  assert.equal(fixture.session.snapshot().saving, false);
});

test('static component output has native named checkboxes, enabled empty save and accessible states', async () => {
  const fixture = setup();
  await fixture.session.load();
  fixture.session.select([]);
  const render = (changes = {}) => renderToStaticMarkup(<TenderRadarPreferencesView
    state={{ ...fixture.session.snapshot(), ...changes }} select={() => {}} save={() => {}} reload={() => {}} />);
  const html = render();
  assert.equal((html.match(/type="checkbox"/g) || []).length, 9);
  for (let index = 0; index < categories.TENDER_CATEGORY_KEYS.length; index++) {
    assert.ok(html.includes(`id="tender-radar-category-${index}"`));
    assert.ok(html.includes(`for="tender-radar-category-${index}"`));
    assert.ok(html.includes(`aria-describedby="tender-radar-category-${index}-description"`));
    const description = html.match(new RegExp(`<span id="tender-radar-category-${index}-description" class="([^"]*)"`));
    assert.ok(description);
    const tokens = description[1].split(/\s+/);
    assert.ok(tokens.includes('text-slate-600'));
    assert.ok(tokens.includes('dark:text-slate-300'));
  }
  assert.match(html, /<legend[^>]*>Tender categories/);
  assert.match(html, /<button type="submit" class="[^"]*">Save preferences<\/button>/);
  assert.doesNotMatch(html.match(/<button type="submit"[^>]*>/)![0], /\bdisabled=/);
  assert.match(render({ saving: true }), /<button type="submit" disabled="" class="[^"]*disabled:cursor-not-allowed/);
  assert.match(html, /Save to opt out/);
  assert.match(render({ saving: true }), /<fieldset disabled=""/);
  assert.match(render({ error: 'Could not save preferences.' }), /role="alert"/);
  assert.match(render({ saved: true }), /role="status"/);
  assert.match(render({ loaded: false, loading: true }), /Loading your preferences/);
  assert.match(render({ tier: 'free' }), /Pro and Enterprise/);
  assert.doesNotMatch(render({ tier: 'free' }), /type="checkbox"/);
});
