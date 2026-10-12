import { readFile } from 'node:fs/promises';
import { parseAllTendersPdf } from '../../lib/tender-radar/index.ts';

const [path] = process.argv.slice(2);
if (!path) throw new Error('Usage: node --import tsx scripts/tender-radar/parse-pdf.ts <pdf>');
const result = await parseAllTendersPdf(await readFile(path));
console.log(JSON.stringify(result, null, 2));
if (result.diagnostics.some(d => d.severity === 'error')) process.exitCode = 1;
