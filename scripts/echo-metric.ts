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
import { PHONEME_MAP } from './echo-pronunciation-map.ts';

const PRON = 'tmp/echo-pron/pron.csv';
const CMU_FILE = 'tmp/cmudict.dict';
const OUT = 'tmp/echo-pron';

export type Weights = {
  /** First consonant of the word. */ start: number;
  /** First consonant of the primary-stress syllable. */ stressOnset: number;
  /** First consonant of any other syllable, and later consonants of any onset cluster. */ onset: number;
  /** Syllable-final consonant. */ coda: number;
  /** Multiplier per English consonant skipped between two matched root consonants. */ decay: number;
  /** Primary-stress vowel. */ vStress: number;
  /** Any other vowel except unstressed AH0 (which counts 0). */ vOther: number;
};
/** Tuned against tmp/echo-pron/ratings.csv (ρ 0.73 → 0.78): codas stay below onsets (editor), stronger decay, vowels halved. */
export const WEIGHTS: Weights = { start: 3, stressOnset: 2, onset: 1, coda: 0.75, decay: 0.4, vStress: 0.5, vOther: 0.25 };

/** A phoneme with its Agalan letter and its role in the metric. */
type Seg = { letter: string; vowel: boolean; kind: 'start' | 'stressOnset' | 'onset' | 'coda' | 'vStress' | 'vOther' | 'schwa' };

/** Word-initial consonant clusters found at the start of ≥ 20 CMU words (drops loans such as *ts-*, *vl-*). */
let onsets: Set<string> | undefined;
function legalOnsets(): Set<string> {
  if (onsets) return onsets;
  const counts = new Map<string, number>();
  for (const line of readFileSync(CMU_FILE, 'utf8').split('\n')) {
    const phones = line.replace(/\s*#.*$/, '').trim().split(/\s+/).slice(1);
    const k = phones.findIndex((p) => /\d$/.test(p));
    if (k <= 0) continue;
    const cluster = phones.slice(0, k).join(' ');
    counts.set(cluster, (counts.get(cluster) ?? 0) + 1);
  }
  return (onsets = new Set([...counts].filter(([, n]) => n >= 20).map(([c]) => c)));
}

/**
 * Split one word's phonemes into syllables (a consonant cluster between vowels goes to the next
 * syllable as far as English allows it at the start of a word) and label each segment.
 * A cluster's first consonant gets the syllable's onset weight; the rest get `onset`.
 */
function segment(phones: string[], firstWord: boolean): Seg[] {
  const vowelIdx = phones.flatMap((p, i) => (/\d$/.test(p) ? [i] : []));
  const kinds: Seg['kind'][] = phones.map((p) => (p === 'AH0' ? 'schwa' : p.endsWith('1') ? 'vStress' : /\d$/.test(p) ? 'vOther' : 'coda'));
  const markOnset = (from: number, to: number) => {
    // phones[from..to) is the onset of the syllable whose vowel is phones[to].
    for (let i = from; i < to; i++) {
      const lead = i === from;
      kinds[i] = lead && from === 0 && firstWord ? 'start' : lead && phones[to].endsWith('1') ? 'stressOnset' : 'onset';
    }
  };
  if (vowelIdx.length) markOnset(0, vowelIdx[0]);
  for (let v = 1; v < vowelIdx.length; v++) {
    const a = vowelIdx[v - 1] + 1, b = vowelIdx[v];
    let from = b;
    for (let s = a; s < b; s++) if (legalOnsets().has(phones.slice(s, b).join(' '))) { from = s; break; }
    markOnset(from, b);
  }
  return phones.map((p, i) => {
    const letter = PHONEME_MAP[p.replace(/\d$/, '')];
    if (!letter) throw new Error(`unmapped phoneme ${p}`);
    return { letter, vowel: /\d$/.test(p), kind: kinds[i] };
  });
}

/** Raw score of `root` (V C V or V C V C V) against segments; `null` letters in the root match anything (the ceiling). */
function raw(root: (string | null)[], segs: Seg[], w: Weights): number {
  const weight = (s: Seg) => w[s.kind === 'schwa' ? 'vOther' : s.kind] * (s.kind === 'schwa' ? 0 : 1);
  const eq = (r: string | null, s: Seg) => r === null || r === s.letter;
  const cons = segs.flatMap((s, i) => (s.vowel ? [] : [i]));
  const vowelAfter = (i: number) => segs.slice(i + 1).find((s) => s.vowel);
  const vowelCredit = (r: string | null, s: Seg | undefined) => (s && eq(r, s) ? weight(s) : 0);
  const firstVowel = segs.find((s) => s.vowel);
  let best = 0;
  const c2s = root.length === 5 ? [-1, ...cons.keys()] : [-1];
  for (const k1 of [-1, ...cons.keys()]) {
    const m1 = k1 >= 0 && eq(root[1], segs[cons[k1]]);
    if (k1 >= 0 && !m1) continue;
    let pts = vowelCredit(root[0], firstVowel);
    if (m1) pts += weight(segs[cons[k1]]) + vowelCredit(root[2], vowelAfter(cons[k1]));
    let add2 = 0;
    for (const k2 of c2s) {
      if (k2 < 0 || k2 <= k1 || !eq(root[3], segs[cons[k2]])) continue;
      const decay = m1 ? w.decay ** (k2 - k1 - 1) : 1;
      add2 = Math.max(add2, weight(segs[cons[k2]]) * decay + vowelCredit(root[4], vowelAfter(cons[k2])));
    }
    best = Math.max(best, pts + add2);
  }
  return best;
}

/**
 * Echo of `root` against a label's CMU phonemes (`|` between words), 0–1: the best of the joined
 * label and each word, each divided by the best score any root of that length could get for it.
 */
export function echo(root: string, cmu: string, w: Weights = WEIGHTS): number {
  const words = cmu.split('|').map((s) => s.trim().split(/\s+/));
  const candidates = [words.flatMap((p, i) => segment(p, i === 0))];
  if (words.length > 1) candidates.push(...words.map((p) => segment(p, true)));
  const letters = [...root.replaceAll('j', 'y')]; // published roots still spell the glide `j`
  const wild = letters.map(() => null);
  return Math.max(...candidates.map((segs) => {
    const ceiling = raw(wild, segs, w);
    return ceiling ? raw(letters, segs, w) / ceiling : 0;
  }));
}

/** concrete label → CMU phonemes, from pron.csv. */
export function loadPron(): Map<string, string> {
  if (!existsSync(PRON)) throw new Error(`${PRON} missing: run node scripts/echo-pronunciation.ts`);
  return new Map(parseCsv(readFileSync(PRON, 'utf8')).rows.map((r) => [r.concrete, r.cmu]));
}

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
