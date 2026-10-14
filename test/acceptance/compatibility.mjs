import { spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import os from 'node:os';
import { acceptanceEnvironment, assertEmulators, blockExternalSockets, isolationStats } from './isolation.mjs';
const env = acceptanceEnvironment(process.cwd());
Object.assign(process.env, env);
assertEmulators();
const guard = blockExternalSockets();
const require = createRequire(new URL('./node_modules/firebase-tools/package.json', import.meta.url));
const semver = require('semver');
const packages = [
  'functions', 'functions/node_modules/pdfjs-dist', 'functions/node_modules/@napi-rs/canvas',
  'test/acceptance/node_modules/firebase-tools', 'test/acceptance/node_modules/playwright',
].map(directory => {
  const data = JSON.parse(readFileSync(path.join(directory, 'package.json'), 'utf8'));
  return { name: data.name, version: data.version, nodeRange: data.engines?.node,
    nodeCompatible: !data.engines?.node || semver.satisfies(process.versions.node, data.engines.node) };
});
const emulator = JSON.parse(readFileSync('test/acceptance/node_modules/firebase-tools/lib/emulator/downloadableEmulatorInfo.json', 'utf8')).firestore;
const java = spawnSync('java', ['-version'], { env, encoding: 'utf8', timeout: 30000, windowsHide: true });
if (java.status !== 0) throw new Error('Java version query failed');
const evidence = { at: new Date().toISOString(), acceptance: false,
  executable: process.execPath, node: process.version, arch: process.arch, platform: process.platform,
  osRelease: os.release(), packages,
  java: (java.stderr || java.stdout).trim(),
  firestoreEmulator: { version: emulator.version, installed: existsSync(path.join(env.FIREBASE_EMULATORS_PATH, emulator.downloadPathRelativeToCacheDir)) },
  browsers: JSON.parse(readFileSync('test/acceptance/node_modules/playwright-core/browsers.json', 'utf8')).browsers
    .filter(browser => browser.name.startsWith('chromium')).map(({ name, revision, browserVersion }) => ({ name, revision, browserVersion })),
  isolationStats,
};
await guard.closeConnections();
mkdirSync('.cache/tender-radar', { recursive: true });
writeFileSync('.cache/tender-radar/compatibility.json', JSON.stringify(evidence, null, 2));
console.log(JSON.stringify(evidence, null, 2));
process.exitCode = packages.every(item => item.nodeCompatible) && evidence.firestoreEmulator.installed ? 0 : 1;
