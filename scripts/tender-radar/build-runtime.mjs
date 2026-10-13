import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import ts from 'typescript';

// Compile the actual parser and canonical matcher into the Functions upload
// directory. No source duplication, bundler, fixture or credential packaging.
const root = fileURLToPath(new URL('../../', import.meta.url));
const output = path.join(root, 'functions/tender-radar/runtime');
const sources = ['lib/tender-radar/index.ts', 'lib/tender-radar/pdf.ts',
  'lib/tender-radar/parser.ts', 'lib/tender-radar/verify.ts', 'lib/tender-radar/types.ts',
  'src/lib/tender-radar/categorizer.ts'];
await mkdir(output, { recursive: true });
for (const source of sources) {
  const compiled = ts.transpileModule(await readFile(path.join(root, source), 'utf8'), {
    fileName: source,
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 },
  }).outputText.replace(/(from\s+['"]\.\/[^'"]+)\.ts(['"])/g, '$1.mjs$2');
  await writeFile(path.join(output, path.basename(source, '.ts') + '.mjs'), compiled, 'utf8');
}
console.log('Built Tender Radar parser and canonical categories for Functions.');
