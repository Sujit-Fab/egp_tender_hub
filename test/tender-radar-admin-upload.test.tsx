import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import vm from 'node:vm';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import ts from 'typescript';
import * as upload from '../src/lib/tender-radar/admin-upload.ts';

const preview: upload.UploadPreview = { fileHash: 'a'.repeat(64), previewHash: 'b'.repeat(64), totalCount: 1,
  byCategory: { 'Road & Highway': 1 }, newCount: 1, duplicateCount: 0, conflictCount: 0,
  alreadyImported: false, warningCount: 0, infoCount: 0 };
const result: upload.ImportResult = { batchId: 'a'.repeat(64), status: 'imported', createdCount: 1, duplicateCount: 0, totalCount: 1 };
const file = () => new File(['synthetic PDF'], 'synthetic.pdf', { type: 'application/pdf' });
function deferred<T>() {
  let resolve!: (value: T) => void; let reject!: (error: Error) => void;
  const promise = new Promise<T>((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}

test('confirmation requires preview; file/count changes invalidate it; successful import cannot double-submit', async () => {
  const calls: unknown[][] = [];
  const session = upload.createAdminUploadSession('admin', { currentUid: () => 'admin',
    async request(...args) { calls.push(args); return args[0] === 'preview' ? preview : result; } }, () => {});
  session.select(file(), '1');
  await session.confirm(); assert.equal(calls.length, 0);
  await session.preview(); assert.equal(session.snapshot().preview?.totalCount, 1);
  session.select(file(), '2'); assert.equal(session.snapshot().preview, null);
  await session.confirm(); assert.equal(calls.length, 1);
  session.select(file(), '1'); await session.preview();
  await session.confirm(); await session.confirm();
  assert.equal(calls.length, 3);
  assert.equal(calls[2][3], preview.previewHash);
  assert.equal(session.snapshot().result?.createdCount, 1);
  assert.equal(session.snapshot().preview, null);
});

test('busy requests block edits/duplicates, conflicts block confirmation, and errors discard preview', async () => {
  const pending = deferred<upload.UploadPreview>();
  let calls = 0;
  const session = upload.createAdminUploadSession('admin', { currentUid: () => 'admin',
    async request(action) { calls++; if (action === 'confirm') throw new Error('PRIVATE_NETWORK_TEXT'); return pending.promise; } }, () => {});
  const selected = file(); session.select(selected, '1');
  const waiting = session.preview(); await session.preview(); session.select(null, '9');
  assert.equal(calls, 1); assert.equal(session.snapshot().file, selected);
  pending.resolve(preview); await waiting; await session.confirm();
  assert.equal(session.snapshot().error, true); assert.equal(session.snapshot().preview, null);
  assert.equal(JSON.stringify(session.snapshot()).includes('PRIVATE_NETWORK_TEXT'), false);
  const blocked = upload.createAdminUploadSession('admin', { currentUid: () => 'admin',
    async request() { return { ...preview, conflictCount: 1 }; } }, () => {});
  blocked.select(file(), '1'); await blocked.preview(); await blocked.confirm();
  assert.equal(blocked.snapshot().result, null);
});

test('invalid inputs do not send requests', async () => {
  let calls = 0;
  const session = upload.createAdminUploadSession('admin', { currentUid: () => 'admin',
    async request() { calls++; return preview; } }, () => {});
  for (const count of ['', '0', '401', '1.5', '-1', '01']) {
    session.select(file(), count); await session.preview();
  }
  session.select(null, '1'); await session.preview();
  session.select(new File([new Uint8Array(10 * 1024 * 1024 + 1)], 'oversized.pdf'), '1'); await session.preview();
  assert.equal(calls, 0);
});

test('account switching/disposal aborts requests and drops late completion', async () => {
  let uid: string | null = 'admin';
  let signal: AbortSignal | null = null;
  const states: upload.UploadState[] = [];
  const pending = deferred<upload.UploadPreview>();
  const session = upload.createAdminUploadSession('admin', { currentUid: () => uid,
    async request(action, file, count, hash, requestSignal) { signal = requestSignal; return pending.promise; } }, state => states.push(state));
  session.select(file(), '1'); const waiting = session.preview();
  const before = states.length; uid = 'other'; session.dispose();
  pending.resolve(preview); await waiting;
  assert.equal(signal!.aborted, true); assert.equal(states.length, before);
  await session.confirm(); assert.equal(states.length, before);
});

function loadComponent() {
  const require = createRequire(import.meta.url);
  let authListener: ((user: any) => Promise<void>) | null = null;
  let effect: (() => () => void) | null = null;
  let slot = 0;
  const slots: any[] = [];
  const firebase = { auth: { currentUser: null as any }, onAuthStateChanged(auth: unknown, callback: any) {
    authListener = callback; return () => {};
  } };
  const requests: any[] = [];
  const context = {
    exports: {},
    fetch: async (url: string, options: any) => { requests.push([url, options]); return { ok: true, json: async () => preview }; },
    require(name: string) {
      if (name === 'react') return { ...React,
        useState(initial: unknown) { const index = slot++; if (!(index in slots)) slots[index] = initial; return [slots[index], (value: unknown) => { slots[index] = value; }]; },
        useRef(initial: unknown) { const index = slot++; if (!(index in slots)) slots[index] = { current: initial }; return slots[index]; },
        useEffect(callback: any) { effect ||= callback; },
      };
      if (name === 'react/jsx-runtime') return require(name);
      if (name === '../firebase') return firebase;
      if (name === '../lib/tender-radar/admin-upload') return upload;
      throw new Error(`Unexpected import ${name}`);
    },
  };
  vm.runInNewContext(ts.transpileModule(readFileSync(new URL('../src/components/TenderRadarAdminUpload.tsx', import.meta.url), 'utf8'), {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
  }).outputText, context, { timeout: 1000 });
  const exports = context.exports as typeof import('../src/components/TenderRadarAdminUpload');
  const render = () => { slot = 0; return exports.default({}); };
  render(); const dispose = effect!();
  return { exports, render, dispose, firebase, requests, listener: (user: any) => authListener!(user) };
}

test('production admin component requires a fresh admin claim and clears on sign-out', async () => {
  const mounted = loadComponent();
  const user = { uid: 'admin', isAnonymous: false, getIdTokenResult: async (refresh: boolean) => {
    assert.equal(refresh, true); return { claims: { admin: false } };
  }, getIdToken: async () => 'synthetic-token' };
  mounted.firebase.auth.currentUser = user;
  await mounted.listener(user); assert.equal(mounted.render(), null);
  user.getIdTokenResult = async refresh => { assert.equal(refresh, true); return { claims: { admin: true } }; };
  await mounted.listener(user); assert.ok(mounted.render());
  mounted.firebase.auth.currentUser = null; await mounted.listener(null);
  assert.equal(mounted.render(), null); assert.equal(mounted.requests.length, 0);
  mounted.dispose();
});

test('production component never sends a token obtained after an account switch', async () => {
  const mounted = loadComponent(); const token = deferred<string>();
  const user = { uid: 'admin', isAnonymous: false, getIdTokenResult: async () => ({ claims: { admin: true } }), getIdToken: async () => token.promise };
  mounted.firebase.auth.currentUser = user; await mounted.listener(user);
  mounted.render()!.props.select(file(), '1'); mounted.render()!.props.preview();
  mounted.firebase.auth.currentUser = { uid: 'other' };
  token.resolve('synthetic-private-token'); await new Promise(resolve => setImmediate(resolve));
  assert.equal(mounted.requests.length, 0); mounted.dispose();
});

test('preview UI shows validation/category totals, labels, disabled conflict confirmation and both languages', () => {
  const { exports, dispose } = loadComponent();
  const state: upload.UploadState = { file: file(), count: '1', busy: null, preview: { ...preview, conflictCount: 1 }, result: null, error: false };
  const markup = (lang: 'en' | 'bn') => renderToStaticMarkup(React.createElement(exports.AdminUploadView, {
    state, lang, select() {}, preview() {}, confirm() {},
  }));
  const en = markup('en'); assert.match(en, /Verified rows/); assert.match(en, /Road &amp; Highway: 1/);
  assert.match(en, /<label for="radar-admin-file"/); assert.match(en, /<label for="radar-admin-count"/);
  assert.match(en, /<button type="button" disabled=""[^>]*>Confirm import/);
  assert.match(en, /role="alert"/); assert.match(en, /Email delivery remains disabled/);
  assert.match(markup('bn'), /আমদানি নিশ্চিত করুন/); dispose();
});
