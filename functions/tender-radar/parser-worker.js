'use strict';

const { parentPort, workerData } = require('node:worker_threads');
const { EXTRACTION_LIMITS } = require('./limits');

(async () => {
  try {
    const { parseAllTendersPdf, verifyTenders } = await import('./runtime/index.mjs');
    const { categorizeAll } = await import('./runtime/categorizer.mjs');
    const result = await parseAllTendersPdf(workerData.bytes, EXTRACTION_LIMITS);
    const report = verifyTenders(result, {
      count: workerData.expectedCount,
      // Layout parsing independently checks these fields and emits errors when
      // unsupported. There are no fixture-specific IDs/counts in production.
      ictSerials: result.records.filter(r => r.type === 'ICT').map(r => r.serial_no),
      amendmentSerials: result.records.filter(r => r.has_amendment).map(r => r.serial_no),
    });
    if (report.status !== 'PASS') throw new Error('Verification failed');
    parentPort.postMessage({ ok: true, records: categorizeAll(result.records),
      warningCount: result.diagnostics.filter(d => d.severity === 'warning').length,
      infoCount: result.diagnostics.filter(d => d.severity === 'info').length });
  } catch {
    // Do not copy parser messages/diagnostics: they may contain PDF text.
    parentPort.postMessage({ ok: false });
  }
})();
