/**
 * Echo metric, Step 3 (docs/proposals/echo-metric.md): how well a root echoes the pronunciation
 * of its concrete English label, 0–1.
 *
 *   node scripts/echo-metric.ts            score every published root → tmp/echo-pron/metric.csv + metric.md
 *   node scripts/echo-metric.ts --sample   also draft tmp/echo-pron/ratings.csv (≈50 roots to rate 0–3 by ear)
 *   node scripts/echo-metric.ts --tune     grid-search the weights against the ratings (Spearman ρ)
 *
 * Reads tmp/echo-pron/pron.csv (run scripts/echo-pronunciation.ts first) and tmp/cmudict.dict
 * (legal English onsets, for syllable breaks).
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { escapeCsvField, parseCsv } from '../src/csv.ts';
import { echo, loadPron, WEIGHTS, type Weights } from '../src/echo-metric.ts';

export { echo, loadPron, WEIGHTS, type Weights };

const PRON = 'tmp/echo-pron/pron.csv';
const OUT = 'tmp/echo-pron';

// ---- CLI ----
if (import.meta.main) {
  const pron = parseCsv(readFileSync(PRON, 'utf8')).rows;
  const roots = new Map(parseCsv(readFileSync('data/lexicon-published.csv', 'utf8')).rows.map((r) => [r.emoji, r.clarity]));
  const scored = pron.map((r) => ({ ...r, root: roots.get(r.emoji)!, score: echo(roots.get(r.emoji)!, r.cmu) }))
    .sort((a, b) => a.score - b.score);
  const csv = (rows: Record<string, string | number>[], cols: string[]) =>
    [cols.join(','), ...rows.map((r) => cols.map((c) => escapeCsvField(String(r[c] ?? ''))).join(','))].join('\n') + '\n';
  writeFileSync(`${OUT}/metric.csv`, csv(scored.map((r) => ({ ...r, score: r.score.toFixed(3) })), ['emoji', 'concrete', 'root', 'agalan', 'score']));

  const mean = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / (xs.length || 1);
  const band = (lo: number, hi: number) => scored.filter((r) => r.score >= lo && r.score < hi).length;
  const line = (r: (typeof scored)[number]) => `| ${r.emoji} | ${r.concrete} | \`${r.root}\` | ${r.agalan} | ${r.score.toFixed(2)} |`;
  const table = ['| | concrete | root | sounds | echo |', '|---|---|---|---|---|'];
  writeFileSync(`${OUT}/metric.md`, [
    '# Echo metric (pronunciation)', '',
    `Weights: ${JSON.stringify(WEIGHTS)}`, '',
    `Mean: all ${mean(scored.map((r) => r.score)).toFixed(3)}, short ${mean(scored.filter((r) => r.root.length === 3).map((r) => r.score)).toFixed(3)}, long ${mean(scored.filter((r) => r.root.length === 5).map((r) => r.score)).toFixed(3)}.`, '',
    '| echo | roots |', '|---|---|',
    ...[0, 0.2, 0.4, 0.6, 0.8].map((lo) => `| ${lo.toFixed(1)}–${(lo + 0.2).toFixed(1)} | ${band(lo, lo + 0.2 + (lo === 0.8 ? 0.01 : 0))} |`), '',
    '## Weakest 40', '', ...table, ...scored.slice(0, 40).map(line), '',
    '## Strongest 20', '', ...table, ...scored.slice(-20).reverse().map(line), '',
  ].join('\n'));
  console.log(`${scored.length} roots, mean echo ${mean(scored.map((r) => r.score)).toFixed(3)} → ${OUT}/metric.{csv,md}`);

  const RATINGS = `${OUT}/ratings.csv`;
  if (process.argv.includes('--sample')) {
    if (existsSync(RATINGS)) throw new Error(`${RATINGS} exists; delete it to redraw the sample`);
    // Spelling traps the old metric misread, then evenly spaced by score.
    const traps = ['knife', 'thumb', 'laugh', 'hippopotamus', 'knot', 'wrench', 'lamb', 'ghost', 'phone', 'writing'];
    const picked = new Set(scored.filter((r) => traps.includes(r.concrete)));
    for (let i = 0; picked.size < 50; i++) picked.add(scored[Math.round((i * 37) % scored.length)]);
    writeFileSync(RATINGS, csv([...picked].sort((a, b) => a.concrete.localeCompare(b.concrete))
      .map((r) => ({ ...r, rating: '', note: '' })), ['emoji', 'concrete', 'root', 'agalan', 'rating', 'note']));
    console.log(`drafted ${RATINGS}: fill rating 0–3 (0 = no echo, 3 = obvious echo)`);
  }

  if (process.argv.includes('--tune')) {
    const rated = parseCsv(readFileSync(RATINGS, 'utf8')).rows.filter((r) => r.rating !== '');
    const cmu = new Map(pron.map((r) => [r.concrete, r.cmu]));
    const rank = (xs: number[]) => {
      const order = xs.map((x, i) => [x, i] as const).sort((a, b) => a[0] - b[0]);
      const out = new Array<number>(xs.length);
      for (let i = 0; i < order.length;) {
        let j = i;
        while (j + 1 < order.length && order[j + 1][0] === order[i][0]) j++;
        for (let k = i; k <= j; k++) out[order[k][1]] = (i + j) / 2;
        i = j + 1;
      }
      return out;
    };
    const pearson = (a: number[], b: number[]) => {
      const ma = mean(a), mb = mean(b);
      const cov = a.reduce((s, x, i) => s + (x - ma) * (b[i] - mb), 0);
      return cov / Math.sqrt(a.reduce((s, x) => s + (x - ma) ** 2, 0) * b.reduce((s, y) => s + (y - mb) ** 2, 0));
    };
    const truth = rank(rated.map((r) => Number(r.rating)));
    const rho = (w: Weights) => pearson(truth, rank(rated.map((r) => echo(r.root, cmu.get(r.concrete)!, w))));
    const grid: Weights[] = [];
    for (const start of [2, 3, 4]) for (const stressOnset of [1, 1.5, 2, 3]) for (const coda of [0.25, 0.5, 0.75]) // below onsets, by editor decision
      for (const decay of [0.4, 0.6, 0.8, 1]) for (const vStress of [0.5, 1, 1.5]) for (const vOther of [0, 0.25, 0.5])
        grid.push({ start, stressOnset, onset: 1, coda, decay, vStress, vOther });
    const results = grid.map((w) => ({ w, rho: rho(w) })).sort((a, b) => b.rho - a.rho);
    console.log(`${rated.length} rated. current weights ρ = ${rho(WEIGHTS).toFixed(3)}`);
    for (const r of results.slice(0, 10)) console.log(r.rho.toFixed(3), JSON.stringify(r.w));
  }
}
