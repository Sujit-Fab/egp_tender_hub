import { spawn } from 'node:child_process';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import net from 'node:net';
import { acceptanceEnvironment, PROJECT_ID } from '../../test/acceptance/isolation.mjs';
import { assertLoopbackNamespace } from '../../test/manual-spa/build.mjs';

const mode = process.argv[2];
const environment = acceptanceEnvironment(process.cwd());
environment.FIREBASE_STORAGE_EMULATOR_HOST = '127.0.0.1:9198';
const cache = path.resolve('.cache/tender-radar/manual-spa');
await mkdir(cache, { recursive: true });
const config = JSON.parse(await readFile('firebase.manual-spa.json', 'utf8'));
if (JSON.stringify(Object.keys(config).sort()) !== JSON.stringify(['emulators', 'firestore', 'storage']) ||
    config.firestore.rules !== 'firestore.rules' || config.storage.rules !== 'test/manual-spa/storage.rules' ||
    JSON.stringify(config.emulators) !== JSON.stringify({
      auth: { host: '127.0.0.1', port: 9098 },
      firestore: { host: '127.0.0.1', port: 8085, websocketPort: 9152 },
      storage: { host: '127.0.0.1', port: 9198 }, hub: { host: '127.0.0.1', port: 4402 },
      logging: { host: '127.0.0.1', port: 4502 }, ui: { enabled: false }, singleProjectMode: true,
    })) throw new Error('Unexpected manual emulator configuration.');

if (mode === 'prepare' || mode === 'prepare-storage') {
  await mkdir(environment.XDG_CONFIG_HOME, { recursive: true });
  for (const args of [
    ...(mode === 'prepare' ? [['scripts/tender-radar/install-acceptance.mjs', '--with-deps']] : []),
    ['test/acceptance/node_modules/firebase-tools/lib/bin/firebase.js', 'setup:emulators:storage',
      '--project', PROJECT_ID, '--config', 'firebase.manual-spa.json'],
  ]) {
    const code = await new Promise((resolve, reject) => {
      const child = spawn(process.execPath, args, { env: environment, stdio: 'inherit' });
      child.once('error', reject); child.once('exit', resolve);
    });
    if (code !== 0) { process.exitCode = code ?? 1; break; }
  }
} else if (mode === 'build') {
  // Re-exec with credential/key variables removed before importing build tools.
  const child = spawn(process.execPath, ['scripts/tender-radar/manual-spa.mjs', 'build-clean'], { env: environment, stdio: 'inherit' });
  child.once('error', () => { process.exitCode = 1; });
  child.once('exit', code => { process.exitCode = code ?? 1; });
} else if (mode === 'build-clean') {
  const { buildManualSpa } = await import('../../test/manual-spa/build.mjs');
  await buildManualSpa();
} else if (mode === 'manual' || mode === 'ci') {
  if (process.platform !== 'linux') throw new Error('Use the Linux namespace wrapper.');
  assertLoopbackNamespace();
  await readFile(path.join(cache, 'build/index.html'));
  environment.TENDER_RADAR_SPA_RUN_ID = randomUUID();
  await writeFile(path.join(cache, 'launch.json'), JSON.stringify({
    runId: environment.TENDER_RADAR_SPA_RUN_ID,
    sourceRevision: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
    startedAt: new Date().toISOString(),
  }, null, 2));
  for (const port of [9098, 8085, 9152, 9198, 4402, 4502, 4179]) {
    await new Promise((resolve, reject) => {
      const server = net.createServer(); server.once('error', reject);
      server.listen(port, '127.0.0.1', () => server.close(resolve));
    });
  }
  const child = spawn(process.execPath, ['test/acceptance/node_modules/firebase-tools/lib/bin/firebase.js',
    'emulators:exec', '--project', PROJECT_ID, '--config', 'firebase.manual-spa.json',
    '--only', 'auth,firestore,storage', `node test/manual-spa/session.mjs${mode === 'ci' ? ' --automated' : ''}`], { env: environment, stdio: 'inherit' });
  child.once('error', () => { process.exitCode = 1; });
  child.once('exit', code => { process.exitCode = code ?? 1; });
} else throw new Error('Choose prepare, build, or launch via manual-spa-linux.sh.');
