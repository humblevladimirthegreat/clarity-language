/**
 * Echo metric, Step 2 (docs/proposals/echo-metric.md): pronunciation data.
 * The work is in src/echo-pronunciation.ts; convert-word --lexicon also rebuilds it when a label is new.
 *
 * Run: npx tsx scripts/echo-pronunciation.ts [--write]
 * With --write, respells `concrete` labels whose only difference from a CMU entry is a hyphen
 * (hot-dog ↔ hotdog) in data/lexicon-published.csv.
 */
import { relative } from 'node:path';
import { buildPronunciationCache } from '../src/echo-pronunciation.ts';
import { REPO_ROOT } from '../src/repo-paths.ts';

const report = await buildPronunciationCache({ write: process.argv.includes('--write') });
console.log(
  `exact ${report.exact}, hyphen-fix ${report.hyphenFix}, parts ${report.parts}, missing ${report.missing.length} → ${relative(REPO_ROOT, report.reportPath)}`,
);
