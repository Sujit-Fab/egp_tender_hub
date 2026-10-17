import net from 'node:net';
import path from 'node:path';
import { generateKeyPairSync } from 'node:crypto';

export const PROJECT_ID = 'demo-tender-radar';
export const DATABASE_ID = 'ai-studio-7e6a1daf-95b8-46d0-a6ba-7cf295cd1701';
export const AUTH_HOST = '127.0.0.1:9098';
export const FIRESTORE_HOST = '127.0.0.1:8085';
export const APP_ORIGIN = 'http://127.0.0.1:4178';
export const isLoopback = host => ['127.0.0.1', '::1', '[::1]'].includes(host);
export const isolationStats = { blockedSockets: 0, credentialAttempts: 0 };

export function acceptanceEnvironment(root) {
  if (process.env.NODE_TLS_REJECT_UNAUTHORIZED === '0') throw new Error('Acceptance tooling requires TLS verification.');
  const environment = { ...process.env };
  for (const key of Object.keys(environment)) {
    if (/^(GOOGLE_|GCLOUD_|FIREBASE_|VITE_|CLOUDSDK_|GCP_|GCE_|GEMINI_|OPENAI_|AWS_|AZURE_)/.test(key) ||
        /^(NODE_OPTIONS|SSLKEYLOGFILE|HTTP_PROXY|HTTPS_PROXY|ALL_PROXY|NO_PROXY)$/i.test(key) ||
        /(?:API_KEY|ACCESS_TOKEN|AUTH_TOKEN|SECRET|CREDENTIALS)$/i.test(key)) delete environment[key];
  }
  const cache = path.join(root, '.cache/tender-radar');
  return { ...environment, GCLOUD_PROJECT: PROJECT_ID, GOOGLE_CLOUD_PROJECT: PROJECT_ID,
    FIREBASE_AUTH_EMULATOR_HOST: AUTH_HOST, FIRESTORE_EMULATOR_HOST: FIRESTORE_HOST,
    FIREBASE_EMULATORS_PATH: path.join(cache, 'emulators'), XDG_CONFIG_HOME: path.join(cache, 'config'),
    PLAYWRIGHT_BROWSERS_PATH: path.join(cache, 'browsers'), CI: 'true',
    JAVA_TOOL_OPTIONS: '-Xmx512m -Djava.net.preferIPv4Stack=true',
    FIREBASE_CLI_DISABLE_MOTD: 'true', FIREBASE_CLI_DISABLE_UPDATE_CHECK: 'true' };
}

export function assertEmulators() {
  if (process.env.FIREBASE_AUTH_EMULATOR_HOST !== AUTH_HOST ||
      process.env.FIRESTORE_EMULATOR_HOST !== FIRESTORE_HOST ||
      process.env.GCLOUD_PROJECT !== PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT !== PROJECT_ID || process.env.GOOGLE_APPLICATION_CREDENTIALS ||
      process.env.FIREBASE_TOKEN || process.env.GOOGLE_OAUTH_ACCESS_TOKEN) {
    throw new Error('Acceptance requires the exact demo project, loopback emulators and no credentials.');
  }
}

// Admin clients cannot silently obtain ADC. This credential is never called by
// emulator operations; any accidental credential fallback fails immediately.
export const noProductionCredential = {
  getAccessToken: async () => { isolationStats.credentialAttempts++; throw new Error('Production credentials are forbidden in acceptance.'); },
};

export function emulatorCredential(cert) {
  // Firestore requires an SDK-supported credential class. Generate a dummy
  // certificate in memory; it belongs to no real account and is never saved.
  const { privateKey } = generateKeyPairSync('rsa', { modulusLength: 2048,
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' }, publicKeyEncoding: { type: 'spki', format: 'pem' } });
  const credential = cert({ projectId: PROJECT_ID,
    clientEmail: `emulator-only@${PROJECT_ID}.iam.gserviceaccount.com`, privateKey });
  credential.getAccessToken = noProductionCredential.getAccessToken;
  return credential;
}

export function blockExternalSockets() {
  const original = net.Socket.prototype.connect;
  const sockets = new Set();
  net.Socket.prototype.connect = function (...args) {
    const values = Array.isArray(args[0]) ? args[0] : args;
    const first = values[0];
    const host = typeof first === 'object' ? first.host : values[1];
    if (!isLoopback(host)) { isolationStats.blockedSockets++; throw new Error('Acceptance blocked a non-loopback connection.'); }
    sockets.add(this);
    this.once('close', () => sockets.delete(this));
    return original.apply(this, args);
  };
  const restore = () => { net.Socket.prototype.connect = original; };
  restore.closeConnections = async () => {
    await Promise.all([...sockets].map(socket => new Promise(resolve => {
      socket.once('close', resolve);
      socket.destroy();
    })));
  };
  return restore;
}
