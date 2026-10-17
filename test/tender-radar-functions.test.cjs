const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

function loadFunctions({ getFirestore = () => { throw new Error('Unexpected database access'); } } = {}) {
  const routes = [];
  const definitions = {};
  const app = () => {};
  app.use = () => {};
  for (const method of ['get', 'post', 'delete']) {
    app[method] = (route, ...handlers) => routes.push({ method, route, handlers });
  }
  const express = () => app;
  express.json = () => () => {};
  const multer = () => ({ single: () => () => {} });
  multer.memoryStorage = () => ({});
  const admin = { apps: [], initializeApp: () => admin.apps.push({}), app: () => admin.apps[0] };
  const context = {
    exports: {},
    require(name) {
      if (name === 'firebase-functions/v2/https') return {
        onRequest: (options, handler) => { definitions.api = options; return handler; },
      };
      if (name === 'firebase-functions/v2/storage') return {
        onObjectFinalized: (options, handler) => { definitions.storage = options; return handler; },
      };
      if (name === 'firebase-admin') return admin;
      if (name === 'firebase-admin/firestore') return { getFirestore };
      if (name === './database-config') return require('../functions/database-config');
      if (name === './tender-radar/routes') return require('../functions/tender-radar/routes');
      if (name === 'express') return express;
      if (name === 'cors') return () => () => {};
      if (name === 'multer') return multer;
      if (name === 'rss-parser') return class Parser {};
      if (name === 'cheerio' || name === 'axios') return {};
      if (['fs', 'path', 'os'].includes(name)) return require(name);
      throw new Error(`Unexpected dependency: ${name}; no network-capable SDK is loaded in this test.`);
    },
  };
  vm.runInNewContext(readFileSync(path.join(__dirname, '../functions/index.js'), 'utf8'), context, {
    filename: 'functions/index.js', timeout: 1000,
  });
  return { exports: context.exports, routes, definitions, admin };
}

test('Functions module loads and preserves the existing API/Storage exports only', () => {
  const loaded = loadFunctions();
  assert.deepEqual(Object.keys(loaded.exports).sort(), ['api', 'onPdfUploaded']);
  assert.equal(typeof loaded.exports.api, 'function');
  assert.equal(typeof loaded.exports.onPdfUploaded, 'function');
  assert.equal(loaded.definitions.api.region, 'asia-south1');
  assert.equal(loaded.definitions.api.timeoutSeconds, 300);
  assert.equal(loaded.definitions.api.memory, '1GiB');
  assert.equal(loaded.definitions.storage.region, 'asia-south1');
});

for (const [method, route, request, operation] of [
  ['get', '/api/stds', {}, 'list'],
  ['post', '/api/stds/upload', { body: { title: 'Synthetic STD', valueMin: '0', valueMax: '1' }, file: { originalname: 'synthetic.pdf' } }, 'create'],
  ['delete', '/api/stds/:id', { params: { id: 'synthetic-id' } }, 'delete'],
]) {
  test(`legacy ${method.toUpperCase()} ${route} keeps the default database`, async () => {
    const selections = [];
    const operations = [];
    const db = { collection(name) {
      assert.equal(name, 'stds');
      return {
        orderBy(field, direction) {
          assert.equal(field, 'uploadedAt'); assert.equal(direction, 'desc');
          return { async get() { operations.push('list'); return { docs: [] }; } };
        },
        async add() { operations.push('create'); return { id: 'synthetic-id' }; },
        doc(id) {
          assert.equal(id, 'synthetic-id');
          return { async get() { return { exists: true }; }, async delete() { operations.push('delete'); } };
        },
      };
    } };
    const loaded = loadFunctions({ getFirestore(...args) { selections.push(args); return db; } });
    loaded.exports.api({}, {});
    const handler = loaded.routes.find(entry => entry.method === method && entry.route === route).handlers.at(-1);
    let responseBody;
    await handler(request, { status(code) { assert.fail(`Unexpected HTTP ${code}`); }, json(body) { responseBody = body; } });
    assert.ok(responseBody);
    assert.equal(selections.length, 1);
    assert.deepEqual(selections[0], [loaded.admin.app()], 'omit the database ID to preserve (default), never the Radar named database');
    assert.deepEqual(operations, [operation]);
  });
}

test('existing Express routes are preserved alongside admin preview/confirmation only', () => {
  const loaded = loadFunctions();
  loaded.exports.api({}, {});
  assert.deepEqual(loaded.routes.map(({ method, route }) => `${method.toUpperCase()} ${route}`), [
    'POST /api/tender-radar/preview', 'POST /api/tender-radar/confirm',
    'GET /api/notices', 'GET /api/stds', 'POST /api/stds/upload', 'DELETE /api/stds/:id',
    'POST /api/ai/extract', 'POST /api/ai/extract-file', 'POST /api/ai/analyze',
    'POST /api/ai/qa', 'POST /api/ai/foreign', 'POST /api/support/send', 'POST /api/pdf/extract',
  ]);
  assert.equal(loaded.routes.some(({ route }) => route === '/api/tender-radar/upload'), false);
  assert.equal(loaded.routes.some(({ route }) => route === '/api/tender-radar/trigger'), false);
  loaded.exports.api({}, {});
  assert.equal(loaded.routes.length, 13, 'cached app does not register routes twice');
});
