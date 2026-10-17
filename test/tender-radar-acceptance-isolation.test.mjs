import test from 'node:test';
import assert from 'node:assert/strict';
import net from 'node:net';
import { acceptanceEnvironment, assertEmulators, blockExternalSockets, noProductionCredential,
  PROJECT_ID, DATABASE_ID, emulatorCredential } from './acceptance/isolation.mjs';
import { createRequire } from 'node:module';

test('acceptance database matches production ID while the project is exclusively demo', () => {
  const require = createRequire(import.meta.url);
  assert.equal(DATABASE_ID, require('../functions/database-config').FIRESTORE_DATABASE_ID);
  assert.equal(PROJECT_ID, 'demo-tender-radar');
  assert.notEqual(PROJECT_ID, require('../functions/database-config').PROJECT_ID);
});
test('child environment strips credential/project variables and isolates CLI configuration', () => {
  const prior = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  process.env.GOOGLE_APPLICATION_CREDENTIALS = 'synthetic-forbidden-file';
  try {
    const environment = acceptanceEnvironment(process.cwd());
    assert.equal(environment.GOOGLE_APPLICATION_CREDENTIALS, undefined);
    assert.equal(environment.FIREBASE_TOKEN, undefined);
    assert.equal(environment.GCLOUD_PROJECT, PROJECT_ID);
    assert.match(environment.XDG_CONFIG_HOME, /tender-radar/);
  } finally {
    if (prior === undefined) delete process.env.GOOGLE_APPLICATION_CREDENTIALS;
    else process.env.GOOGLE_APPLICATION_CREDENTIALS = prior;
  }
});
test('missing, non-loopback or wrong-project emulator environment fails closed', () => {
  const original = { ...process.env };
  try {
    const environment = acceptanceEnvironment(process.cwd());
    for (const key of ['GOOGLE_APPLICATION_CREDENTIALS', 'FIREBASE_TOKEN', 'GOOGLE_OAUTH_ACCESS_TOKEN']) delete process.env[key];
    Object.assign(process.env, environment);
    assert.doesNotThrow(assertEmulators);
    for (const [key, value] of [['FIRESTORE_EMULATOR_HOST', ''], ['FIRESTORE_EMULATOR_HOST', 'firestore.googleapis.com:443'],
      ['FIREBASE_AUTH_EMULATOR_HOST', ''], ['FIREBASE_AUTH_EMULATOR_HOST', 'example.invalid:9098'], ['GCLOUD_PROJECT', 'production-project'],
      ['GOOGLE_CLOUD_PROJECT', 'production-project'],
      ['GOOGLE_APPLICATION_CREDENTIALS', 'synthetic-forbidden-file']]) {
      Object.assign(process.env, environment); delete process.env.GOOGLE_APPLICATION_CREDENTIALS;
      process.env[key] = value;
      assert.throws(assertEmulators, /Acceptance requires/);
    }
  } finally {
    for (const key of Object.keys(process.env)) if (!(key in original)) delete process.env[key];
    Object.assign(process.env, original);
  }
});
test('non-loopback sockets and credential fallback are blocked before dispatch', async () => {
  const restore = blockExternalSockets();
  try {
    for (const host of ['example.invalid', '169.254.169.254', 'localhost']) {
      const socket = new net.Socket();
      assert.throws(() => socket.connect({ host, port: 443 }), /blocked a non-loopback/);
      socket.destroy();
    }
    await assert.rejects(noProductionCredential.getAccessToken, /Production credentials are forbidden/);
  } finally { restore(); }
});
test('loopback SDK sockets are permitted', async () => {
  const restore = blockExternalSockets();
  const server = net.createServer(socket => socket.end());
  try {
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    await new Promise((resolve, reject) => {
      const socket = net.connect({ host: '127.0.0.1', port: server.address().port });
      socket.on('error', reject); socket.on('close', resolve);
    });
  } finally { await new Promise(resolve => server.close(resolve)); restore(); }
});

test('guard closes tracked loopback connections while continuing to deny external sockets', async () => {
  const guard = blockExternalSockets();
  const server = net.createServer();
  let peer;
  server.on('connection', socket => { peer = socket; });
  try {
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    const socket = net.connect({ host: '127.0.0.1', port: server.address().port });
    await new Promise((resolve, reject) => { socket.once('connect', resolve); socket.once('error', reject); });
    await guard.closeConnections();
    assert.equal(socket.destroyed, true);
    const external = new net.Socket();
    assert.throws(() => external.connect({ host: 'example.invalid', port: 443 }), /blocked a non-loopback/);
    external.destroy();
  } finally { peer?.destroy(); await new Promise(resolve => server.close(resolve)); guard(); }
});
test('dummy certificate initializes the deployed Firestore SDK without ADC and cannot obtain an access token', async () => {
  const require = createRequire(new URL('../functions/index.js', import.meta.url));
  const { cert, initializeApp, deleteApp } = require('firebase-admin/app');
  const { getFirestore } = require('firebase-admin/firestore');
  const credential = emulatorCredential(cert);
  const app = initializeApp({ projectId: PROJECT_ID, credential }, 'radar-isolation-test');
  const db = getFirestore(app, DATABASE_ID);
  try {
    db.settings({ host: '127.0.0.1:8085', ssl: false });
    assert.equal(db.databaseId, DATABASE_ID);
    await assert.rejects(credential.getAccessToken, /Production credentials are forbidden/);
  } finally { await db.terminate(); await deleteApp(app); }
});
