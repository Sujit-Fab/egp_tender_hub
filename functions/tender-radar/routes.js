'use strict';

const { createAuthorizer } = require('./auth');
const { createPublicError, getErrorStatus, serializeError } = require('./errors');
const { createIngestionService } = require('./ingestion');
const { createTenderStore } = require('./store');
const { createBoundedParser } = require('./parser');
const { MAX_PDF_BYTES } = require('./limits');
const { PROJECT_ID, FIRESTORE_DATABASE_ID } = require('../database-config');

function createPdfReader(express) {
  const raw = express.raw({ type: 'application/pdf', limit: MAX_PDF_BYTES });
  return async request => {
    if (request.headers?.['content-type']?.split(';')[0].trim().toLowerCase() !== 'application/pdf' ||
        request.headers?.['content-encoding']) throw createPublicError('INVALID_PDF');
    // Cloud Functions has already consumed the stream. Local Express has not.
    if (Buffer.isBuffer(request.rawBody)) return request.rawBody;
    await new Promise((resolve, reject) => raw(request, {}, error => {
      if (error) reject(createPublicError(error.type === 'entity.too.large' ? 'PDF_TOO_LARGE' : 'INVALID_PDF'));
      else resolve();
    }));
    return request.body;
  };
}

function registerTenderRadarRoutes(app, { express, admin, service: injectedService } = {}) {
  let service = injectedService;
  const parse = createBoundedParser();
  function getService() {
    if (service) return service;
    const { getFirestore, FieldValue } = require('firebase-admin/firestore');
    const { getAuth } = require('firebase-admin/auth');
    const firebaseApp = admin.app();
    // Never silently point at another project when running outside production.
    if (firebaseApp.options.projectId !== PROJECT_ID) throw createPublicError('SERVICE_UNAVAILABLE');
    const auth = getAuth(firebaseApp);
    service = createIngestionService({
      authorize: createAuthorizer({ verifyIdToken: (token, revoked) => auth.verifyIdToken(token, revoked),
        getUser: uid => auth.getUser(uid) }),
      readPdf: createPdfReader(express), parse,
      store: createTenderStore(getFirestore(firebaseApp, FIRESTORE_DATABASE_ID), () => FieldValue.serverTimestamp()),
      loadCategories: async () => (await import('./runtime/categorizer.mjs')).TENDER_CATEGORY_KEYS,
    });
    return service;
  }
  for (const action of ['preview', 'confirm']) {
    app.post(`/api/tender-radar/${action}`, async (request, response) => {
      response.set('Cache-Control', 'no-store');
      try { response.json(await getService()[action](request)); }
      catch (error) { response.status(getErrorStatus(error)).json(serializeError(error)); }
    });
  }
}

module.exports = { registerTenderRadarRoutes, createPdfReader };
