import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
import { assertEmulators, PROJECT_ID, DATABASE_ID, FIRESTORE_HOST, emulatorCredential } from './isolation.mjs';

export async function startHarness(setPhase = () => {}) {
  assertEmulators();
  const require = createRequire(import.meta.url);
  const sdkRequire = createRequire(new URL('../../functions/index.js', import.meta.url));
  setPhase('load deployed Express and Admin SDK dependencies');
  const express = sdkRequire('express');
  const { initializeApp, deleteApp, cert } = sdkRequire('firebase-admin/app');
  const { getAuth } = sdkRequire('firebase-admin/auth');
  const { getFirestore, FieldValue } = sdkRequire('firebase-admin/firestore');
  setPhase('load Vite and React plugin');
  const { createServer } = await import('vite');
  const { default: react } = await import('@vitejs/plugin-react');
  const { createAuthorizer } = require('../../functions/tender-radar/auth');
  const { createIngestionService } = require('../../functions/tender-radar/ingestion');
  const { createPdfReader, registerTenderRadarRoutes } = require('../../functions/tender-radar/routes');
  const { createBoundedParser } = require('../../functions/tender-radar/parser');
  const { createTenderStore } = require('../../functions/tender-radar/store');
  setPhase('initialize emulator-only Admin SDK');
  const sdkApp = initializeApp({ projectId: PROJECT_ID, credential: emulatorCredential(cert) }, 'radar-acceptance');
  let db;
  let vite;
  let server;
  async function close() {
    const outcomes = await Promise.allSettled([
      Promise.resolve().then(() => vite?.close()),
      Promise.resolve().then(() => server && new Promise((resolve, reject) => {
        server.close(error => error ? reject(error) : resolve());
        server.closeAllConnections();
      })),
      Promise.resolve().then(() => db?.terminate()),
    ]);
    await deleteApp(sdkApp);
    const failed = outcomes.find(outcome => outcome.status === 'rejected');
    if (failed) throw failed.reason;
  }
  try {
  const auth = getAuth(sdkApp);
  db = getFirestore(sdkApp, DATABASE_ID);
  db.settings({ host: FIRESTORE_HOST, ssl: false });
  const store = createTenderStore(db, () => FieldValue.serverTimestamp());
  setPhase('seed emulator-only rollback precondition');
  await db.doc('acceptanceFaults/already-existing').create({ synthetic: true });
  let rollback = false;
  let rollbackAttempts = 0;
  const failingStore = createTenderStore({
    collection: name => db.collection(name),
    runTransaction(work) {
      return db.runTransaction(async transaction => {
        const result = await work(transaction);
        // The emulator must reject this create precondition at commit time,
        // atomically rolling back the preceding tender and receipt writes.
        transaction.create(db.doc('acceptanceFaults/already-existing'), { synthetic: true });
        rollbackAttempts++;
        return result;
      });
    },
  }, () => FieldValue.serverTimestamp());
  const service = createIngestionService({
    authorize: createAuthorizer({ verifyIdToken: (token, revoked) => auth.verifyIdToken(token, revoked),
      getUser: uid => auth.getUser(uid) }),
    readPdf: createPdfReader(express), parse: createBoundedParser(),
    loadCategories: async () => (await import('../../functions/tender-radar/runtime/categorizer.mjs')).TENDER_CATEGORY_KEYS,
    store: { inspect: batch => store.inspect(batch), persist: batch => (rollback ? failingStore : store).persist(batch) },
  });
  const app = express();
  registerTenderRadarRoutes(app, { service });
  setPhase('start isolated Vite server');
  vite = await createServer({ configFile: false, root: process.cwd(),
    envDir: path.resolve('.cache/tender-radar/config'), envPrefix: 'ACCEPTANCE_PUBLIC_',
    optimizeDeps: { entries: ['test/acceptance/index.html'] },
    server: { middlewareMode: true, host: '127.0.0.1', hmr: false,
      fs: { deny: ['.env', '.env.*', '*.{crt,pem}', '**/.git/**', '**/firebase-applet-config.json', '**/src/firebase.ts'] } },
    plugins: [{ name: 'isolated-firebase-bootstrap', enforce: 'pre', resolveId(source, importer) {
      if (source === '../firebase' && importer?.replaceAll('\\', '/').endsWith('/src/components/TenderRadarAdminUpload.tsx')) {
        return path.resolve('test/acceptance/firebase-browser.ts');
      }
      if (source.includes('firebase-applet-config') || source.replaceAll('\\', '/').endsWith('/src/firebase.ts')) {
        throw new Error('Production Firebase bootstrap is forbidden in acceptance.');
      }
      return null;
    } }, react()],
  });
  // This fixed harness entry needs module transformation, not Vite's injected
  // development client (which opens WebSockets even with server HMR disabled).
  app.get('/', async (request, response) => response.type('html').send(
    await readFile('test/acceptance/index.html', 'utf8')));
  app.use(vite.middlewares);
  server = await new Promise((resolve, reject) => {
    const instance = app.listen(4178, '127.0.0.1', () => resolve(instance)); instance.once('error', reject);
  });
  return { auth, db, service, setRollback(value) { rollback = value; },
    get rollbackAttempts() { return rollbackAttempts; },
    close,
  };
  } catch (error) {
    await close();
    throw error;
  }
}
