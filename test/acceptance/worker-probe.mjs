import { parentPort, workerData } from 'node:worker_threads';
import Module, { createRequire } from 'node:module';
import { appendFileSync } from 'node:fs';
import { assertEmulators, blockExternalSockets } from './isolation.mjs';
assertEmulators();
blockExternalSockets();
const event = phase => { if (workerData.eventFile) appendFileSync(workerData.eventFile, JSON.stringify({ at: new Date().toISOString(), phase }) + '\n'); };
const originalLoad = Module._load;
Module._load = function (request, ...args) {
  const native = request === '@napi-rs/canvas' || request.endsWith('.node');
  if (native) event(request.endsWith('.node') ? 'native-addon-load-start' : 'canvas-load-start');
  let result;
  try { result = originalLoad.call(this, request, ...args); }
  catch (error) { if (native) event(`native-load-rejected-${error.code ?? error.name}`); throw error; }
  if (native) event(request.endsWith('.node') ? 'native-addon-load-end' : 'canvas-load-end');
  return result;
};
const require = createRequire(new URL('../../functions/index.js', import.meta.url));
event('worker-probe-import-start');
if (workerData.mode.startsWith('empty-')) await import('node:zlib');
else if (workerData.mode.startsWith('canvas-')) require('@napi-rs/canvas');
else await import('../../functions/node_modules/pdfjs-dist/legacy/build/pdf.mjs');
event('worker-probe-import-end');
parentPort.postMessage({ phase: 'module-imported' });
// Compare natural shutdown with termination of an otherwise identical worker.
if (workerData.mode.endsWith('-terminate')) parentPort.on('message', () => {});
