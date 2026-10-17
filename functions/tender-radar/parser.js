'use strict';

const { Worker } = require('node:worker_threads');
const path = require('node:path');
const { createPublicError } = require('./errors');

function createBoundedParser({ WorkerClass = Worker, timeoutMs = 45000, maxConcurrent = 2 } = {}) {
  let running = 0;
  return async function parse(bytes, expectedCount) {
    if (running >= maxConcurrent) throw createPublicError('SERVICE_UNAVAILABLE');
    running++;
    try {
      return await new Promise((resolve, reject) => {
        let worker;
        let timer;
        let finished = false;
        const finish = (error, result) => {
          if (finished) return;
          finished = true;
          clearTimeout(timer);
          const stop = worker ? worker.terminate() : Promise.resolve();
          Promise.resolve(stop).catch(() => {}).finally(() => error ? reject(error) : resolve(result));
        };
        try {
          worker = new WorkerClass(path.join(__dirname, 'parser-worker.js'), {
            // This packaged JavaScript needs no development/test preloaders.
            execArgv: [],
            workerData: { bytes: new Uint8Array(bytes), expectedCount },
            resourceLimits: { maxOldGenerationSizeMb: 256, maxYoungGenerationSizeMb: 32, stackSizeMb: 8 },
            stdout: true, stderr: true,
          });
          // Drain and discard SDK/worker output rather than leaking PDF text.
          worker.stdout?.on('data', () => {});
          worker.stderr?.on('data', () => {});
          worker.on('message', value => value?.ok === true
            ? finish(null, value) : finish(createPublicError('PARSER_FAILED')));
          worker.on('error', () => finish(createPublicError('PARSER_FAILED')));
          worker.on('exit', () => { if (!finished) finish(createPublicError('PARSER_FAILED')); });
          timer = setTimeout(() => finish(createPublicError('PARSER_TIMEOUT')), timeoutMs);
        } catch { finish(createPublicError('SERVICE_UNAVAILABLE')); }
      });
    } finally { running--; }
  };
}

module.exports = { createBoundedParser };
