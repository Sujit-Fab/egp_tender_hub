import { syntheticPdf } from './pdf.mjs';
import { acceptanceEnvironment, blockExternalSockets } from './isolation.mjs';
Object.assign(process.env, acceptanceEnvironment(process.cwd()));
const { chromium } = await import('playwright');
const guard = blockExternalSockets();
const browser = await chromium.launch({ headless: true, args: ['--disable-background-networking', '--host-resolver-rules=MAP * ~NOTFOUND, EXCLUDE 127.0.0.1'] });
try {
  const { parseAllTendersPdf, verifyTenders } = await import('../../functions/tender-radar/runtime/index.mjs');
  for (const records of [[{ id: '910001' }, { id: '910002' }], [{ id: '910001', amendment: true }]]) {
    const result = await parseAllTendersPdf(await syntheticPdf(browser, records));
    const report = verifyTenders(result, { count: records.length, ictSerials: [], amendmentSerials: records.flatMap((r, i) => r.amendment ? [i + 1] : []) });
    console.log(JSON.stringify(report));
  }
} finally { await browser.close(); await guard.closeConnections(); }
