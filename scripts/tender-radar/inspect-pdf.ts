import { readFile } from 'node:fs/promises';
import { extractPdfPages } from '../../lib/tender-radar/pdf.ts';

const [path, selection = '1,2,16,17,34'] = process.argv.slice(2);
if (!path) throw new Error('Usage: node --import tsx scripts/tender-radar/inspect-pdf.ts <pdf> [comma-separated pages]');
const selected = new Set(selection.split(',').map(Number));
for (const page of await extractPdfPages(await readFile(path))) {
  if (!selected.has(page.page)) continue;
  console.log(JSON.stringify({ page: page.page, headerBoxes: page.headerBoxes }));
  for (const item of page.items) console.log(JSON.stringify(item));
}
