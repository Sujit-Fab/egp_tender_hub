import { readFile } from 'node:fs/promises';
import { acceptanceSummary } from './evidence.mjs';
const evidence = JSON.parse(await readFile('.cache/tender-radar/results.json', 'utf8'));
const currentRun = JSON.parse(await readFile('.cache/tender-radar/current-run.json', 'utf8'));
const summary = acceptanceSummary(evidence, currentRun);
console.log(JSON.stringify(summary));
process.exitCode = summary.accepted ? 0 : 1;
