import assert from 'node:assert/strict';
export function assertAcceptanceConfig(config) {
  assert.deepEqual(config, {
    firestore: { rules: 'firestore.rules' },
    emulators: {
      auth: { host: '127.0.0.1', port: 9098 },
      firestore: { host: '127.0.0.1', port: 8085, websocketPort: 9152 },
      hub: { host: '127.0.0.1', port: 4402 },
      logging: { host: '127.0.0.1', port: 4502 },
      ui: { enabled: false }, singleProjectMode: true,
    },
  }, 'Acceptance configuration must contain only the exact loopback Auth/Firestore setup.');
}
