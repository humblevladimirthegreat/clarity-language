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

/**
 * CMU variant to use for a word whose first pronunciation is the wrong sense
 * (`tear` 2 = *teer*, `st` 2 = *saint*). Every other word uses its first variant.
 */
const VARIANTS: Record<string, number> = { tear: 2, wind: 2, id: 2, un: 2, us: 2, st: 2, record: 2 };

/** `word(2)` lines are variants. Trailing `# comment` dropped. */
const cmu = new Map<string, string[]>();
const variants = new Map<string, string[][]>();
for (const line of readFileSync(CMU_FILE, 'utf8').split('\n')) {
  const [head, ...rest] = line.replace(/\s*#.*$/, '').trim().split(/\s+/);
  if (!head || rest.length === 0) continue;
  const word = head.replace(/\(\d+\)$/, '');
  if (!variants.has(word)) variants.set(word, []);
  variants.get(word)!.push(rest);
}
for (const [word, list] of variants) {
  const pick = Object.hasOwn(VARIANTS, word) ? VARIANTS[word] : 1;
  if (!list[pick - 1]) throw new Error(`${word} has no CMU variant ${pick}`);
  cmu.set(word, list[pick - 1]);
}

/** Our own pronunciations (CMU phonemes) for labels CMU lacks and no CMU word replaces. */
const OVERRIDES: Record<string, string> = {
  hibiscus: 'HH AY0 B IH1 S K AH0 S',
  khanda: 'K AA1 N D AH0',
  unlink: 'AH0 N L IH1 NG K',
  interrobang: 'IH0 N T EH1 R AH0 B AE2 NG',
  tamale: 'T AH0 M AA1 L IY0',
  tempura: 'T EH0 M P UH1 R AH0',
  pinata: 'P IY0 N Y AA1 T AH0',
  mahjong: 'M AA1 ZH AA2 NG',
  sagittarius: 'S AE2 JH IH0 T EH1 R IY0 AH0 S',
  ophiuchus: 'AO2 F IY0 UW1 K AH0 S',
  // Places: keyed by the whole label, one primary stress per word, `|` between words.
  uae: 'Y UW2 EY2 IY1',
  'bouvet-island': 'B UW0 V EY1 | AY1 L AH0 N D',
  'cote-d-ivoire': 'K OW1 T | D IY0 V W AA1 R',
  'clipperton-island': 'K L IH1 P ER0 T AH0 N | AY1 L AH0 N D',
  czechia: 'CH EH1 K IY0 AH0',
  ceuta: 'S EY1 UW0 T AH0',
  'faroe-islands': 'F EH1 R OW0 | AY1 L AH0 N D Z',
  'guinea-bissau': 'G IH1 N IY0 | B IH0 S AW1',
  chagos: 'CH AA1 G OW0 S',
  nauru: 'N AA0 UW1 R UW0',
  niue: 'N IY0 UW1 EY0',
  'pitcairn-islands': 'P IH1 T K EH0 R N | AY1 L AH0 N D Z',
  svalbard: 'S V AA1 L B AA0 R',
  'sint-maarten': 'S IH1 N T | M AA1 R T AH0 N',
  eswatini: 'EH2 S W AA0 T IY1 N IY0',
  'turks-caicos': 'T ER1 K S | K EY1 K OW0 S',
  tokelau: 'T OW1 K AH0 L AW0',
  'timor-leste': 'T IY1 M AO0 R | L EH1 S T EY0',
  turkiye: 'T ER1 K IY0 Y EH0',
};
for (const [word, phones] of Object.entries(OVERRIDES)) {
  if (cmu.has(word)) throw new Error(`override ${word} is already in CMU`);
  cmu.set(word, phones.split(' '));
}

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
