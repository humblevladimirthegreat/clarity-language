/**
 * Echo metric, Step 2 (docs/proposals/echo-metric.md): pronunciation data.
 *
 * Looks up each published `concrete` label in the CMU Pronouncing Dictionary (first variant),
 * maps the phonemes to Agalan letters, and writes:
 *  - tmp/echo-pron/pron.csv: emoji, concrete, lookup word(s), CMU phonemes, Agalan sound string
 *  - tmp/echo-pron/report.md: coverage, labels missing from CMU, hyphen-only mismatches
 * Downloads cmudict into tmp/ on first run. With --write, respells `concrete` labels whose only
 * difference from a CMU entry is a hyphen (hot-dog ↔ hotdog) in data/lexicon-published.csv.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { loadCmu } from '../src/cmu-dict.ts';
import { toAgalan } from './echo-pronunciation-map.ts';

const CMU_FILE = 'tmp/cmudict.dict';
/** Pinned cmudict commit, so reruns give the same pronunciations. */
const CMU_URL = 'https://raw.githubusercontent.com/cmusphinx/cmudict/74790861f652b15e4ac49015a90074ad62a27690/cmudict.dict';
const LEXICON = 'data/lexicon-published.csv';
const OUT = 'tmp/echo-pron';
const WRITE = process.argv.includes('--write');

if (!existsSync(CMU_FILE)) {
  mkdirSync('tmp', { recursive: true });
  const res = await fetch(CMU_URL);
  if (!res.ok) throw new Error(`fetch ${CMU_URL}: ${res.status}`);
  writeFileSync(CMU_FILE, await res.text());
}

/** Chosen variant per word, plus overrides for labels CMU lacks. See src/cmu-dict.ts. */
const cmu = loadCmu();

function parseCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = '', q = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (q) {
      if (c === '"' && line[i + 1] === '"') { cur += '"'; i++; } else if (c === '"') q = false; else cur += c;
    } else if (c === '"') q = true;
    else if (c === ',') { out.push(cur); cur = ''; } else cur += c;
  }
  out.push(cur);
  return out;
}

/** Common English words (tmp/en_50k.txt from prototype-lexicon-revamp.ts) guard re-hyphenation against loans. */
const common = new Set(readFileSync('tmp/en_50k.txt', 'utf8').split('\n').map((l) => l.split(' ')[0]));

/** Hyphenated labels kept although CMU has the joined spelling, because the two-word form is more common. */
const KEEP_HYPHEN = new Set(['old-man']);

/** Single words that happen to split into two English words (tam + ale). */
const NOT_COMPOUNDS = new Set(['tamale', 'singlet', 'pinata', 'mahjong']);

const text = readFileSync(LEXICON, 'utf8');
const lines = text.split('\n');
const header = parseCsvLine(lines[0]);
const iEmoji = header.indexOf('emoji'), iConcrete = header.indexOf('concrete');

type Row = { emoji: string; label: string; lookup: string; phones: string; agalan: string; status: string };
const rows: Row[] = [];
const hyphenFixes: { line: number; from: string; to: string }[] = [];

for (let n = 1; n < lines.length; n++) {
  if (!lines[n].trim()) continue;
  const cols = parseCsvLine(lines[n]);
  const emoji = cols[iEmoji], label = cols[iConcrete].toLowerCase();
  let lookup = label, phones = cmu.get(label), status = 'exact';
  if (!phones) {
    // Hyphen-only difference: CMU has the joined spelling.
    const joined = label.replaceAll('-', '');
    const alt = joined !== label && cmu.has(joined) && !KEEP_HYPHEN.has(label) ? joined : undefined;
    if (alt) {
      hyphenFixes.push({ line: n, from: cols[iConcrete], to: alt });
      lookup = alt; phones = cmu.get(alt); status = 'hyphen-fix';
    }
  }
  if (!phones && !label.includes('-') && !NOT_COMPOUNDS.has(label)) {
    // Joined label missing from CMU: re-hyphenate when it splits into two common CMU words.
    const splits = [...Array(label.length).keys()].slice(3, -2)
      .map((i) => [label.slice(0, i), label.slice(i)])
      .filter(([a, b]) => cmu.has(a) && cmu.has(b) && common.has(a) && common.has(b));
    if (splits.length) {
      const [a, b] = splits.sort((x, y) => Math.min(y[0].length, y[1].length) - Math.min(x[0].length, x[1].length))[0];
      const to = `${a}-${b}`;
      hyphenFixes.push({ line: n, from: cols[iConcrete], to });
      lookup = `${a} ${b}`; phones = [...cmu.get(a)!, '|', ...cmu.get(b)!]; status = 'hyphen-fix';
    }
  }
  if (!phones && label.includes('-')) {
    const parts = label.split('-');
    if (parts.every((p) => cmu.has(p))) {
      lookup = parts.join(' ');
      phones = parts.flatMap((p, i) => [...(i ? ['|'] : []), ...cmu.get(p)!]);
      status = 'parts';
    }
  }
  if (!phones) { rows.push({ emoji, label, lookup: '', phones: '', agalan: '', status: 'missing' }); continue; }
  rows.push({ emoji, label, lookup, phones: phones.join(' '), agalan: toAgalan(phones), status });
}

if (WRITE && hyphenFixes.length) {
  for (const f of hyphenFixes) {
    const cols = parseCsvLine(lines[f.line]);
    if (cols[iConcrete] !== f.from) throw new Error(`line ${f.line} changed`);
    lines[f.line] = lines[f.line].replace(`,${f.from},`, `,${f.to},`);
  }
  writeFileSync(LEXICON, lines.join('\n'));
}

mkdirSync(OUT, { recursive: true });
const esc = (s: string) => (/[",]/.test(s) ? `"${s.replaceAll('"', '""')}"` : s);
writeFileSync(`${OUT}/pron.csv`, ['emoji,concrete,lookup,cmu,agalan,status',
  ...rows.map((r) => [r.emoji, r.label, r.lookup, r.phones, r.agalan, r.status].map(esc).join(','))].join('\n') + '\n');

const count = (s: string) => rows.filter((r) => r.status === s).length;
const missing = rows.filter((r) => r.status === 'missing');
writeFileSync(`${OUT}/report.md`, [
  '# Echo pronunciation coverage', '',
  `CMU entries (first variant): ${cmu.size}. Labels: ${rows.length}.`, '',
  `- exact: ${count('exact')}`,
  `- hyphen-only fix${WRITE ? ' (applied)' : ' (run with --write)'}: ${count('hyphen-fix')}`,
  `- hyphenated, looked up by parts: ${count('parts')}`,
  `- missing: ${missing.length}`, '',
  'Agalan string: capital = primary-stress vowel, `·` = unstressed AH0.', '',
  '## Hyphen-only fixes', '', ...hyphenFixes.map((f) => `- ${f.from} → ${f.to}`), '',
  '## Hyphenated, looked up by parts', '', ...rows.filter((r) => r.status === 'parts').map((r) => `- ${r.emoji} ${r.label}`), '',
  '## Missing from CMU (find a label that is in CMU)', '', ...missing.map((r) => `- ${r.emoji} ${r.label}`), '',
].join('\n'));

console.log(`exact ${count('exact')}, hyphen-fix ${count('hyphen-fix')}, parts ${count('parts')}, missing ${missing.length} → ${OUT}/report.md`);
