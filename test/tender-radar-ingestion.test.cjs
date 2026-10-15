'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { EventEmitter } = require('node:events');
const { createAuthorizer } = require('../functions/tender-radar/auth');
const { createIngestionService, validatePdf } = require('../functions/tender-radar/ingestion');
const { createTenderStore } = require('../functions/tender-radar/store');
const { createBoundedParser } = require('../functions/tender-radar/parser');
const { registerTenderRadarRoutes, createPdfReader } = require('../functions/tender-radar/routes');
const { createPublicError, getErrorStatus, serializeError } = require('../functions/tender-radar/errors');
const { MAX_PDF_BYTES } = require('../functions/tender-radar/limits');
const { PROJECT_ID, FIRESTORE_DATABASE_ID } = require('../functions/database-config');
const categories = import('../functions/tender-radar/runtime/categorizer.mjs');
const pdf = Buffer.from('%PDF-1.7\nsynthetic export bytes\n%%EOF\n');
const base = { serial_no: 1, tender_id: '1001', reference_no: 'synthetic-reference', nature: 'Works', title: 'Road maintenance',
  ministry: 'Synthetic Ministry', division: '', organization: 'Synthetic organization', procuring_entity: 'Synthetic entity',
  type: 'NCT', method: 'OTM', publishing_datetime: '01-Oct-2026 10:00', closing_datetime: '20-Oct-2026 10:00',
  has_amendment: false, source_pages: [1] };

// Transaction double stages writes, rolls back failures, serializes concurrent
// transactions, and rejects reads after writes. No SDK or network is loaded.
function memoryDatabase() {
  const data = new Map();
  let queue = Promise.resolve();
  let writes = 0;
  const db = {
    data, failCommit: false,
    collection: name => ({ doc: id => ({ path: `${name}/${id}` }) }),
    async getAll(...args) {
      const options = args.pop();
      assert.deepEqual(options.fieldMask, ['contentHash'], 'duplicate checks read no extracted tender contents');
      return args.map(ref => ({ ref, exists: data.has(ref.path), data: () => ({ contentHash: data.get(ref.path)?.contentHash }) }));
    },
    runTransaction(work) {
      const task = async () => {
        const staged = [];
        const result = await work({
          getAll(...refs) { assert.equal(staged.length, 0, 'transaction must finish all reads before writes'); return db.getAll(...refs); },
          create(ref, value) { assert.equal(data.has(ref.path), false); staged.push([ref.path, structuredClone(value)]); },
        });
        if (db.failCommit) throw new Error('PRIVATE_FIRESTORE_FAILURE');
        for (const [path, value] of staged) { data.set(path, value); writes++; }
        return result;
      };
      const result = queue.then(task, task);
      queue = result.catch(() => {});
      return result;
    },
    get writes() { return writes; },
  };
  return db;
}

function setup(options = {}) {
  const db = options.db || memoryDatabase();
  const calls = [];
  const authorize = createAuthorizer({
    async verifyIdToken(token, revoked) {
      calls.push(['authorize', revoked]);
      if (options.authError) throw options.authError;
      return options.decoded || { uid: 'synthetic-admin', admin: true };
    },
    async getUser() { return options.user || { uid: 'synthetic-admin', customClaims: { admin: true } }; },
  });
  const service = createIngestionService({ authorize,
    async readPdf(request) { calls.push(['read']); return request.rawBody; },
    async parse(bytes, count) {
      calls.push(['parse', count]);
      if (options.parseError) throw options.parseError;
      if (options.parsed) return options.parsed;
      const { categorizeAll } = await categories;
      return { records: categorizeAll(options.records || [structuredClone(base)]), warningCount: 0, infoCount: 0 };
    },
    loadCategories: async () => (await categories).TENDER_CATEGORY_KEYS,
    store: options.store || createTenderStore(db, () => 'synthetic-server-timestamp'),
  });
  const request = (extra = {}) => ({ rawBody: pdf, headers: { authorization: 'Bearer synthetic-token',
    'x-tender-radar-expected-count': String((options.records || [base]).length), ...extra } });
  return { db, service, calls, request };
}
async function rejects(action, code, status) {
  await assert.rejects(action, error => {
    assert.equal(serializeError(error).error.code, code);
    assert.equal(getErrorStatus(error), status);
    return true;
  });
}

test('missing, non-admin, revoked and anonymous authorization blocks parsing and persistence', async () => {
  for (const options of [{ missing: true }, { decoded: { uid: 'synthetic-admin' } },
    { authError: { code: 'auth/id-token-revoked' } },
    { decoded: { uid: 'synthetic-admin', admin: true, firebase: { sign_in_provider: 'anonymous' } } },
    { user: { uid: 'synthetic-admin', disabled: true, customClaims: { admin: true } } },
    { user: { uid: 'synthetic-admin', customClaims: {} } }]) {
    const s = setup(options);
    const input = s.request();
    if (options.missing) delete input.headers.authorization;
    for (const action of ['preview', 'confirm']) {
      await assert.rejects(() => s.service[action](input), error => [401, 403].includes(getErrorStatus(error)));
    }
    assert.equal(s.calls.some(([name]) => name === 'parse' || name === 'read'), false);
    assert.equal(s.db.writes, 0);
  }
});

test('invalid count, empty/non-PDF/truncated/oversized files never invoke the parser', async () => {
  for (const count of ['0', '401', '01', '-1', '1.5', 'NaN', undefined]) {
    const s = setup();
    await rejects(() => s.service.preview(s.request({ 'x-tender-radar-expected-count': count })), 'INVALID_COUNT', 400);
    assert.equal(s.calls.some(([name]) => name === 'read'), false);
  }
  for (const bytes of [null, Buffer.alloc(0), Buffer.from('not a PDF document'), Buffer.from('%PDF-1.7\ntruncated'), Buffer.alloc(MAX_PDF_BYTES + 1)]) {
    const s = setup();
    await assert.rejects(() => s.service.preview({ ...s.request(), rawBody: bytes }), error => [413, 422].includes(getErrorStatus(error)));
    assert.equal(s.calls.some(([name]) => name === 'parse'), false);
    assert.equal(s.db.writes, 0);
  }
  assert.doesNotThrow(() => validatePdf(pdf));
});

test('parser errors and invalid records cannot reach persistence or leak extracted text', async () => {
  for (const options of [{ parseError: createPublicError('PARSER_FAILED') },
    { parsed: { records: [] } }, { records: [{ ...base, tender_id: '../forged' }] },
    { records: [{ ...base, title: '' }] }, { records: [{ ...base, source_pages: [101] }] },
    { records: [{ ...base, serial_no: 2 }] }, { records: [base, { ...base, serial_no: 2 }] }]) {
    const s = setup(options);
    await rejects(() => s.service.preview(s.request()), 'PARSER_FAILED', 422);
    assert.equal(s.db.writes, 0);
  }
  const s = setup({ parseError: new Error('PRIVATE_EXTRACTED_TEXT') });
  await assert.rejects(() => s.service.preview(s.request()), error => {
    assert.equal(JSON.stringify(serializeError(error)).includes('PRIVATE_EXTRACTED_TEXT'), false);
    return true;
  });
});

test('preview categorizes actual parsed records and performs no writes; confirm reparses before atomic persistence', async () => {
  const s = setup();
  const preview = await s.service.preview(s.request());
  assert.equal(preview.totalCount, 1);
  assert.equal(preview.byCategory['Road & Highway'], 1);
  assert.equal(preview.newCount, 1);
  assert.equal(preview.conflictCount, 0);
  assert.equal(s.db.writes, 0);
  assert.equal(Object.hasOwn(preview, 'records'), false, 'preview returns aggregate validation, not PDF contents');
  await rejects(() => s.service.confirm(s.request()), 'PREVIEW_CHANGED', 409);
  assert.equal(s.db.writes, 0);
  const result = await s.service.confirm(s.request({ 'x-tender-radar-preview-hash': preview.previewHash }));
  assert.equal(result.createdCount, 1);
  assert.equal(result.status, 'imported');
  assert.equal(s.db.writes, 2, 'tender and import receipt are committed together');
  assert.equal(s.db.data.get('tenderRadarTenders/1001').category, 'Road & Highway');
  assert.equal(s.db.data.get('tenderRadarTenders/1001').importedBy, 'synthetic-admin');
  assert.equal(s.calls.filter(([name]) => name === 'parse').length, 3);
});

test('changed file or row count invalidates preview before writes', async () => {
  const s = setup();
  const preview = await s.service.preview(s.request());
  await rejects(() => s.service.confirm({ ...s.request({ 'x-tender-radar-preview-hash': preview.previewHash }),
    rawBody: Buffer.from('%PDF-1.7\ndifferent synthetic export\n%%EOF') }), 'PREVIEW_CHANGED', 409);
  await rejects(() => s.service.confirm(s.request({ 'x-tender-radar-preview-hash': preview.previewHash,
    'x-tender-radar-expected-count': '2' })), 'PARSER_FAILED', 422);
  assert.equal(s.db.writes, 0);
});

test('forged preview records and categories cannot replace server-parsed content', async () => {
  const s = setup();
  const preview = await s.service.preview(s.request());
  const forged = { ...s.request({ 'x-tender-radar-preview-hash': '0'.repeat(64) }),
    body: { records: [{ ...base, category: 'Others', title: 'Forged title' }], conflictCount: 0,
      previewHash: preview.previewHash, databaseId: '(default)' } };
  await rejects(() => s.service.confirm(forged), 'PREVIEW_CHANGED', 409);
  assert.equal(s.db.writes, 0);
  forged.headers['x-tender-radar-preview-hash'] = preview.previewHash;
  await s.service.confirm(forged);
  const stored = s.db.data.get('tenderRadarTenders/1001');
  assert.equal(stored.title, base.title);
  assert.equal(stored.category, 'Road & Highway');
  assert.equal(s.calls.filter(([name]) => name === 'parse').length, 3);
});

test('a changed amendment blocks the entire batch and preserves the original tender', async () => {
  const first = setup();
  const preview = await first.service.preview(first.request());
  await first.service.confirm(first.request({ 'x-tender-radar-preview-hash': preview.previewHash }));
  const original = structuredClone(first.db.data.get('tenderRadarTenders/1001'));
  const next = setup({ db: first.db, records: [{ ...base, has_amendment: true,
    closing_datetime: '25-Oct-2026 10:00' }, { ...base, tender_id: '1002', serial_no: 2 }] });
  const input = { ...next.request(), rawBody: Buffer.from('%PDF-1.7\nsynthetic amendment export\n%%EOF') };
  const amended = await next.service.preview(input);
  assert.equal(amended.conflictCount, 1);
  await rejects(() => next.service.confirm({ ...input, headers: { ...input.headers,
    'x-tender-radar-preview-hash': amended.previewHash } }), 'TENDER_CONFLICT', 409);
  assert.deepEqual(first.db.data.get('tenderRadarTenders/1001'), original);
  assert.equal(first.db.data.size, 2);
  assert.equal(first.db.writes, 2);
});

test('concurrent and repeated confirmation creates one batch and one tender', async () => {
  const s = setup();
  const p = await s.service.preview(s.request());
  const request = () => s.request({ 'x-tender-radar-preview-hash': p.previewHash });
  const results = await Promise.all([s.service.confirm(request()), s.service.confirm(request())]);
  assert.deepEqual(results.map(r => r.status).sort(), ['already_imported', 'imported']);
  assert.equal(results.reduce((n, r) => n + r.createdCount, 0), 1);
  assert.equal(s.db.writes, 2);
  assert.equal((await s.service.preview(s.request())).alreadyImported, true);
  assert.equal((await s.service.confirm(request())).createdCount, 0);
  assert.equal(s.db.writes, 2);
});

test('overlapping files skip identical tender content despite changed page provenance', async () => {
  const first = setup();
  const p = await first.service.preview(first.request());
  await first.service.confirm(first.request({ 'x-tender-radar-preview-hash': p.previewHash }));
  const second = setup({ db: first.db, records: [{ ...base, source_pages: [2] }, { ...base, serial_no: 2, tender_id: '1002' }] });
  const input = { ...second.request(), rawBody: Buffer.from('%PDF-1.7\nsecond synthetic export\n%%EOF') };
  const next = await second.service.preview(input);
  assert.equal(next.newCount, 1); assert.equal(next.duplicateCount, 1);
  const result = await second.service.confirm({ ...input, headers: { ...input.headers, 'x-tender-radar-preview-hash': next.previewHash } });
  assert.equal(result.createdCount, 1); assert.equal(result.duplicateCount, 1);
  assert.deepEqual(first.db.data.get('tenderRadarTenders/1001').source_pages, [1]);
  assert.equal(first.db.data.size, 4);
});

test('existing tender conflicts, including a race after preview, block all writes', async () => {
  const s = setup({ records: [base, { ...base, serial_no: 2, tender_id: '1002' }] });
  const p = await s.service.preview(s.request());
  s.db.data.set('tenderRadarTenders/1001', { contentHash: 'different-content' });
  const conflict = await s.service.preview(s.request());
  assert.equal(conflict.conflictCount, 1);
  await rejects(() => s.service.confirm(s.request({ 'x-tender-radar-preview-hash': p.previewHash })), 'TENDER_CONFLICT', 409);
  assert.equal(s.db.writes, 0); assert.equal(s.db.data.size, 1);
});

test('storage outage is sanitized and atomic failures leave no tenders or receipts', async () => {
  const s = setup(); const p = await s.service.preview(s.request()); s.db.failCommit = true;
  await rejects(() => s.service.confirm(s.request({ 'x-tender-radar-preview-hash': p.previewHash })), 'SERVICE_UNAVAILABLE', 503);
  assert.equal(s.db.data.size, 0);
  const store = createTenderStore({ getAll: async () => { throw new Error('PRIVATE_FIRESTORE_FAILURE'); } }, () => {});
  const failing = setup({ store });
  await rejects(() => failing.service.preview(failing.request()), 'SERVICE_UNAVAILABLE', 503);
});

test('Firebase rawBody and local raw streams enforce MIME, encoding and size contracts', async () => {
  let rawCalls = 0;
  const read = createPdfReader({ raw(options) {
    assert.equal(options.limit, MAX_PDF_BYTES);
    return (request, response, next) => { rawCalls++; request.body = pdf; next(); };
  } });
  assert.equal(await read({ headers: { 'content-type': 'application/pdf' }, rawBody: pdf }), pdf);
  assert.equal(rawCalls, 0);
  assert.equal(await read({ headers: { 'content-type': 'application/pdf' } }), pdf);
  for (const headers of [{}, { 'content-type': 'text/plain' }, { 'content-type': 'application/pdf', 'content-encoding': 'gzip' }]) {
    await rejects(() => read({ headers, rawBody: pdf }), 'INVALID_PDF', 422);
  }
  const oversized = createPdfReader({ raw: () => (req, res, next) => next({ type: 'entity.too.large' }) });
  await rejects(() => oversized({ headers: { 'content-type': 'application/pdf' } }), 'PDF_TOO_LARGE', 413);
});

test('HTTP endpoints use private error envelopes and no email/upload trigger routes', async () => {
  const routes = new Map();
  registerTenderRadarRoutes({ post: (route, handler) => routes.set(route, handler) }, {
    service: { preview: async () => { throw new Error('PRIVATE_EXTRACTED_TEXT'); }, confirm: async () => ({ status: 'imported' }) },
  });
  assert.deepEqual([...routes.keys()], ['/api/tender-radar/preview', '/api/tender-radar/confirm']);
  const response = { headers: {}, set(key, value) { this.headers[key] = value; }, status(value) { this.code = value; return this; }, json(value) { this.body = value; } };
  await routes.get('/api/tender-radar/preview')({}, response);
  assert.equal(response.code, 500); assert.equal(response.headers['Cache-Control'], 'no-store');
  assert.equal(response.body.error.code, 'INTERNAL_ERROR');
  assert.equal(JSON.stringify(response.body).includes('PRIVATE_EXTRACTED_TEXT'), false);
});

test('worker timeouts terminate parsing; worker failures never forward messages or leave concurrency claims', async () => {
  let stopped = 0;
  class HungWorker extends EventEmitter { terminate() { stopped++; return Promise.resolve(0); } }
  const parse = createBoundedParser({ WorkerClass: HungWorker, timeoutMs: 10, maxConcurrent: 1 });
  const pending = parse(pdf, 1);
  await rejects(() => parse(pdf, 1), 'SERVICE_UNAVAILABLE', 503);
  await rejects(() => pending, 'PARSER_TIMEOUT', 422);
  await rejects(() => parse(pdf, 1), 'PARSER_TIMEOUT', 422);
  assert.equal(stopped, 2);
  class BrokenWorker extends HungWorker { constructor() { super(); queueMicrotask(() => this.emit('error', new Error('PRIVATE_WORKER_TEXT'))); } }
  await rejects(() => createBoundedParser({ WorkerClass: BrokenWorker })(pdf, 1), 'PARSER_FAILED', 422);
});

test('packaged worker verifies the actual 345-row fixture within the production deadline, without logging contents', { timeout: 75000 }, async () => {
  const path = require('node:path');
  const pdfjsPackage = require.resolve('pdfjs-dist/package.json', { paths: [path.join(__dirname, '../functions')] });
  assert.ok(pdfjsPackage.startsWith(path.resolve(__dirname, '../functions/node_modules') + path.sep),
    'worker integration must use the deployable Functions dependency, not a root fallback');
  assert.equal(JSON.parse(readFileSync(pdfjsPackage, 'utf8')).version, '5.5.207');
  const bytes = readFileSync(require('node:path').join(__dirname, 'fixtures/egp-all-tenders-2026-09-28.pdf'));
  // Exercise the deployed 45-second deadline, including worker startup.
  const { Worker } = require('node:worker_threads');
  let cleanupStarted;
  let cleanupFinished;
  class TimedWorker extends Worker {
    terminate() {
      cleanupStarted = performance.now();
      return super.terminate().then(code => { cleanupFinished = performance.now(); return code; });
    }
  }
  const parse = createBoundedParser({ WorkerClass: TimedWorker });
  const started = performance.now();
  let result;
  let totalElapsedMs;
  try { result = await parse(bytes, 345); }
  finally {
    totalElapsedMs = performance.now() - started;
    console.log('Production fixture timing:', JSON.stringify({ deadlineMs: 45000,
      processingElapsedMs: cleanupStarted === undefined ? null : cleanupStarted - started,
      cleanupMs: cleanupFinished === undefined ? null : cleanupFinished - cleanupStarted,
      totalElapsedMs, cleanupVerified: cleanupFinished !== undefined }));
  }
  assert.ok(cleanupFinished !== undefined, 'real worker cleanup must complete');
  assert.ok(totalElapsedMs <= 45000, 'fixture including cleanup must finish within the actual production deadline');
  assert.equal(result.records.length, 345);
  assert.equal(new Set(result.records.map(r => r.tender_id)).size, 345);
  const keys = (await categories).TENDER_CATEGORY_KEYS;
  assert.equal(result.records.every(r => keys.includes(r.category)), true);
  await rejects(() => parse(pdf, 1), 'PARSER_FAILED', 422);
});

test('prepared database configuration matches the owner-confirmed frontend and rules target', () => {
  const config = JSON.parse(readFileSync(require.resolve('../firebase-applet-config.json'), 'utf8'));
  const firebase = JSON.parse(readFileSync(require.resolve('../firebase.json'), 'utf8'));
  assert.equal(PROJECT_ID, config.projectId);
  assert.equal(FIRESTORE_DATABASE_ID, config.firestoreDatabaseId);
  assert.equal(firebase.firestore[0].database, FIRESTORE_DATABASE_ID);
});

test('actual route wiring selects the named database and rejects another project before accessing it', async () => {
  const path = require('node:path');
  const vm = require('node:vm');
  const source = readFileSync(require.resolve('../functions/tender-radar/routes'), 'utf8');
  async function invoke(projectId) {
    const selected = [];
    const db = memoryDatabase();
    const firebaseApp = { options: { projectId } };
    const module = { exports: {} };
    const context = { module, exports: module.exports, Buffer, require(name) {
      if (name === 'firebase-admin/firestore') return { getFirestore(app, id) {
        assert.equal(app, firebaseApp); selected.push(id); return db;
      }, FieldValue: { serverTimestamp: () => 'synthetic-time' } };
      if (name === 'firebase-admin/auth') return { getAuth: () => ({
        verifyIdToken: async () => ({ uid: 'synthetic-user', admin: false }),
        getUser: async () => { throw new Error('Non-admin must never reach lookup'); },
      }) };
      if (name === './parser') return { createBoundedParser: () => async () => { throw new Error('Non-admin must never parse'); } };
      return require(path.resolve(__dirname, '../functions/tender-radar', name));
    } };
    vm.runInNewContext(source, context, { timeout: 1000 });
    const handlers = new Map();
    module.exports.registerTenderRadarRoutes({ post: (route, handler) => handlers.set(route, handler) }, {
      express: { raw: () => () => { throw new Error('Non-admin must never read the PDF'); } },
      admin: { app: () => firebaseApp },
    });
    const response = { set() {}, status(value) { this.code = value; return this; }, json(value) { this.body = value; } };
    await handlers.get('/api/tender-radar/preview')({ headers: { authorization: 'Bearer synthetic-token' }, rawBody: pdf }, response);
    assert.equal(db.writes, 0);
    return { selected, response };
  }
  const correct = await invoke(PROJECT_ID);
  assert.deepEqual(correct.selected, ['ai-studio-7e6a1daf-95b8-46d0-a6ba-7cf295cd1701']);
  assert.equal(correct.response.code, 403);
  const wrong = await invoke('another-project');
  assert.equal(wrong.selected.length, 0); assert.equal(wrong.response.code, 503);
});

test('top-level PDF extractor enforces each ingestion resource limit on the real fixture', { timeout: 120000 }, async () => {
  const { extractPdfPages } = await import('../functions/tender-radar/runtime/index.mjs');
  const bytes = readFileSync(require('node:path').join(__dirname, 'fixtures/egp-all-tenders-2026-09-28.pdf'));
  for (const limit of [{ maxPages: 1 }, { maxItems: 1 }, { maxTextCharacters: 1 }, { maxOperatorsPerPage: 1 }]) {
    await assert.rejects(() => extractPdfPages(bytes, limit), /PDF .+ limit exceeded/);
  }
});
