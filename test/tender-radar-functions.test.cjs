const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

function loadFunctions() {
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
  const admin = { apps: [], initializeApp: () => admin.apps.push({}) };
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
      if (name === 'firebase-admin/firestore') return { getFirestore() { throw new Error('Unexpected database access'); } };
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
  return { exports: context.exports, routes, definitions };
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
