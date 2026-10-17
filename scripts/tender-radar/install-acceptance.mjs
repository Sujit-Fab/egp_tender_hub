import { spawn } from 'node:child_process';
import { mkdir } from 'node:fs/promises';
import { readFile } from 'node:fs/promises';
import { assertAcceptanceConfig } from '../../test/acceptance/config.mjs';
import { acceptanceEnvironment, PROJECT_ID } from '../../test/acceptance/isolation.mjs';

const env = acceptanceEnvironment(process.cwd());
assertAcceptanceConfig(JSON.parse(await readFile('firebase.acceptance.json', 'utf8')));
await mkdir(env.XDG_CONFIG_HOME, { recursive: true });
for (const args of [
  ['test/acceptance/node_modules/playwright/cli.js', 'install', ...(process.argv.includes('--with-deps') ? ['--with-deps'] : []), 'chromium'],
  ['test/acceptance/node_modules/firebase-tools/lib/bin/firebase.js', 'setup:emulators:firestore', '--project', PROJECT_ID,
    '--config', 'firebase.acceptance.json'],
]) {
  const status = await new Promise((resolve, reject) => {
    const child = spawn(process.execPath, args, { env, stdio: 'inherit', windowsHide: true });
    child.once('error', reject); child.once('exit', resolve);
  });
  if (status !== 0) { process.exitCode = status ?? 1; break; }
}
