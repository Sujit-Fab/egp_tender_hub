// Isolated parser diagnosis using synthetic PDFs or the approved repository fixture.
// No emulators, credentials or HTTP harness. PDF contents are never logged.
import { appendFileSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { Worker } from 'node:worker_threads';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { acceptanceEnvironment, assertEmulators, blockExternalSockets, isolationStats } from './isolation.mjs';

const script = fileURLToPath(import.meta.url);
const environment = acceptanceEnvironment(process.cwd());
const modes = ['bounded', 'production-fixture', 'direct', 'raw-natural', 'canvas-natural', 'canvas-terminate', 'pdfjs-natural', 'pdfjs-terminate', 'pdfjs-batch', 'canvas-batch', 'empty-batch'];
const childMode = process.argv[2] === '--child' ? process.argv[3] : undefined;
if (childMode) {
  assertEmulators();
  const guard = blockExternalSockets();
  const eventFile = process.argv[5];
  const event = (phase, details = {}) => appendFileSync(eventFile, JSON.stringify({ at: new Date().toISOString(), phase, ...details }) + '\n');
  event('child-start', { executable: process.execPath, node: process.version, platform: process.platform, arch: process.arch, pid: process.pid });
  let cleanupStarted;
  let cleanupFinished;
  class TracedWorker extends Worker {
    constructor(...args) {
      super(...args);
      event('worker-created');
      this.on('online', () => event('worker-online'));
      this.on('message', value => event('worker-message', { ok: value?.ok === true, phase: value?.phase }));
      this.on('error', error => event('worker-error', { type: error.name, code: error.code }));
      this.on('exit', code => event('worker-exit', { code }));
    }
    terminate() {
      cleanupStarted = performance.now();
      event('worker-terminate-start');
      return super.terminate().then(code => {
        cleanupFinished = performance.now();
        event('worker-terminate-end', { code }); return code;
      });
    }
  }
  try {
    const bytes = ['bounded', 'production-fixture', 'direct', 'raw-natural'].includes(childMode) ? readFileSync(process.argv[4]) : undefined;
    const sdkRequire = createRequire(new URL('../../functions/index.js', import.meta.url));
    if (childMode === 'bounded' || childMode === 'production-fixture') {
      const { createBoundedParser } = sdkRequire('./tender-radar/parser.js');
      const count = childMode === 'production-fixture' ? 345 : 2;
      event('bounded-parse-start', { timeoutMs: 45000 });
      const parseStarted = performance.now();
      let result;
      let totalElapsedMs;
      try { result = await createBoundedParser({ WorkerClass: TracedWorker })(bytes, count); }
      finally {
        totalElapsedMs = performance.now() - parseStarted;
        event('bounded-timing', { deadlineMs: 45000,
          processingElapsedMs: cleanupStarted === undefined ? null : cleanupStarted - parseStarted,
          cleanupMs: cleanupFinished === undefined ? null : cleanupFinished - cleanupStarted,
          totalElapsedMs, cleanupVerified: cleanupFinished !== undefined });
      }
      if (result.ok !== true || result.records?.length !== count || new Set(result.records.map(record => record.tender_id)).size !== count) {
        throw new Error('Bounded parser verification failed');
      }
      event('bounded-parse-end', { ok: result.ok, count: result.records.length });
      if (cleanupFinished === undefined || totalElapsedMs > 45000) throw new Error('Production deadline exceeded or cleanup unverified');
    } else if (childMode === 'direct') {
      event('direct-import-start');
      const { parseAllTendersPdf, verifyTenders } = await import('../../functions/tender-radar/runtime/index.mjs');
      event('direct-parse-start');
      const result = await parseAllTendersPdf(bytes);
      const report = verifyTenders(result, { count: 2, ictSerials: [], amendmentSerials: [] });
      event('direct-parse-end', { status: report.status, count: result.records.length });
      if (report.status !== 'PASS') throw new Error('Synthetic verification failed');
    } else {
      event('probe-start', { mode: childMode });
      const raw = childMode === 'raw-natural';
      for (let iteration = 1; iteration <= (childMode.endsWith('-batch') ? 30 : 1); iteration++) {
      event('probe-iteration', { iteration });
      const worker = new TracedWorker(raw ? sdkRequire.resolve('./tender-radar/parser-worker.js') : new URL('./worker-probe.mjs', import.meta.url), {
        execArgv: [], workerData: raw ? { bytes: new Uint8Array(bytes), expectedCount: 2 } : { mode: childMode, eventFile },
        resourceLimits: { maxOldGenerationSizeMb: 256, maxYoungGenerationSizeMb: 32, stackSizeMb: 8 },
        stdout: true, stderr: true,
      });
      worker.stdout.on('data', () => {}); worker.stderr.on('data', () => {});
      await new Promise((resolve, reject) => {
        worker.once('error', reject);
        worker.once('exit', code => code === 0 || childMode.endsWith('-terminate') && code === 1 ? resolve() : reject(new Error('Worker failed')));
        worker.once('message', value => {
          if (raw && value?.ok !== true) { event('raw-parser-rejected'); process.exitCode = 1; }
          if (childMode.endsWith('-terminate')) void worker.terminate();
        });
      });
      }
      event('probe-end');
    }
    event('child-success', { isolationStats });
  } catch (error) {
    event('child-error', { type: error.name, code: error.code, isolationStats });
    process.exitCode = 1;
  } finally { await guard.closeConnections(); event('child-cleanup', { isolationStats }); }
} else {
  const selected = process.argv.slice(2);
  if (!selected.length || selected.some(mode => !modes.includes(mode))) throw new Error(`Choose explicit modes: ${modes.join(', ')}`);
  const startedAt = new Date().toISOString();
  const directory = path.resolve('.cache/tender-radar', `worker-repro-${startedAt.replaceAll(':', '-')}`);
  mkdirSync(directory, { recursive: true });
  Object.assign(process.env, environment);
  assertEmulators();
  const guard = blockExternalSockets();
  const evidence = { startedAt, executable: process.execPath, node: process.version, versions: process.versions,
    platform: process.platform, arch: process.arch, project: environment.GCLOUD_PROJECT, acceptance: false, cases: [] };
  const save = () => writeFileSync(path.join(directory, 'results.json'), JSON.stringify(evidence, null, 2));
  save();
  let browser;
  try {
    const fixture = path.join(directory, 'synthetic.pdf');
    let syntheticPrepared = false;
    for (const mode of selected) {
      if (!syntheticPrepared && ['bounded', 'direct', 'raw-natural'].includes(mode)) {
        const { chromium } = await import('playwright');
        browser = await chromium.launch({ headless: true, args: ['--disable-background-networking', '--host-resolver-rules=MAP * ~NOTFOUND, EXCLUDE 127.0.0.1'] });
        evidence.chromium = { executable: chromium.executablePath(), version: browser.version() };
        const { syntheticPdf } = await import('./pdf.mjs');
        writeFileSync(fixture, await syntheticPdf(browser, [{ id: '910001' }, { id: '910002' }]));
        await browser.close(); browser = undefined;
        evidence.browserClosedBeforeParser = true; syntheticPrepared = true; save();
      }
      const eventFile = path.join(directory, `${mode}.jsonl`);
      writeFileSync(eventFile, '');
      const result = await new Promise(resolve => {
        const input = mode === 'production-fixture' ? path.resolve('test/fixtures/egp-all-tenders-2026-09-28.pdf') : fixture;
        const child = spawn(process.execPath, [script, '--child', mode, input, eventFile], { env: environment, stdio: 'ignore', windowsHide: true });
        let timedOut = false;
        const timer = setTimeout(() => { timedOut = true; child.kill(); }, mode.endsWith('-batch') ? 180000 : 120000);
        child.once('error', error => { clearTimeout(timer); resolve({ mode, type: error.name, code: error.code }); });
        child.once('exit', (code, signal) => { clearTimeout(timer); resolve({ mode, executable: process.execPath, pid: child.pid, code, signal, timedOut }); });
      });
      result.events = readFileSync(eventFile, 'utf8').trim().split('\n').filter(Boolean).map(line => JSON.parse(line));
      result.timing = result.events.find(event => event.phase === 'bounded-timing');
      evidence.cases.push(result); save();
      console.log(JSON.stringify({ mode, code: result.code, signal: result.signal, timedOut: result.timedOut,
        timing: result.timing, lastPhase: result.events.at(-1)?.phase, evidence: path.join(directory, 'results.json') }));
    }
  } finally {
    await browser?.close(); await guard.closeConnections();
    evidence.finishedAt = new Date().toISOString(); evidence.isolationStats = isolationStats; save();
  }
  process.exitCode = evidence.cases.some(result => result.code !== 0) ? 1 : 0;
}
