/**
 * Dry run of docs/proposals/lexicon-revamp.md.
 *
 *   node scripts/prototype-lexicon-revamp.ts
 *
 * Reads data/lexicon-{published,overlays,compounds}.csv (read-only) and writes
 * tmp/lexicon-revamp/: the three CSVs respelled, reserved-roots.csv, root-changes.csv
 * (old → new per root) and report.md. Downloads the Unicode emoji list and an English
 * frequency list into tmp/ on first run. Nothing under data/ or docs/ changes.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { escapeCsvField, parseCsv } from '../src/csv.ts';
import * as converter from '../src/word-converter.ts';
import { longRootCandidates } from '../src/word-converter.ts';
import { echo as pronEcho, loadPron } from './echo-metric.ts';

const OUT = 'tmp/lexicon-revamp';
/**
 * Priority: lower = placed earlier, so it gets its best free spelling (ties: regret order).
 * Default = English frequency rank of the concrete label (OpenSubtitles 2018 top 50k,
 * hermitdave/FrequencyWords); a multi-word label ranks by its rarest word; unlisted words rank 50001.
 * PRIORITY_OVERRIDES replace the default. Short roots always outrank long ones.
 */
const FREQ_FILE = 'tmp/en_50k.txt';
const FREQ_URL = 'https://raw.githubusercontent.com/hermitdave/FrequencyWords/master/content/2018/en/en_50k.txt';
const EMOJI_TEST = 'tmp/emoji-test.txt';
const EMOJI_TEST_URL = 'https://unicode.org/Public/emoji/latest/emoji-test.txt';
async function fetchOnce(path: string, url: string) {
  if (existsSync(path)) return;
  mkdirSync('tmp', { recursive: true });
  const res = await fetch(url);
  if (!res.ok) throw new Error(`fetch ${url}: ${res.status}`);
  writeFileSync(path, await res.text());
}
await fetchOnce(EMOJI_TEST, EMOJI_TEST_URL);
await fetchOnce(FREQ_FILE, FREQ_URL);
const V = ['a', 'e', 'o', 'u'];
const C = ['b', 'd', 'g', 'h', 'y', 'l', 'm', 'n', 'r', 'v', 'w', 'z'];
const JOIN = new Set(['l', 'm', 'n', 'r']);

// ---- dry-run defaults for the proposal's open questions ----
const PINNED = new Set<string>();
/** Echo-first mode: skip domain / sibling spacing and the shared-prefix penalty (grammatical group floors stay). */
const IGNORE_CLOSE_PAIRS = true;
/**
 * How compounds are kept from splitting two ways:
 *  'prefix'  — no short root may start a long root whose 4th letter is l/m/n/r (proposal);
 *  'slot4'   — no long root has l/m/n/r as its second consonant;
 *  'listed'  — no blanket ban; only listed compounds are checked for a second split.
 */
const COMPOUND_RULE: 'prefix' | 'slot4' | 'listed' = 'slot4';
const SECOND_CONSONANT_BAN = COMPOUND_RULE === 'slot4';
/** Under slot4: a candidate with l/m/n/r second consonant is tried with its two consonants swapped (uzumu → umuzu). */
const SLOT4_SWAP = false;
const swapped = new Set<string>();
/** short=y rows (emoji → slot). Closed complexes onunu / egega / odoho are already overlay-backed. */
const MARKED: Record<string, string> = { '🤝': 'pronoun', '😐': 'pronoun', '🎤': 'pronoun', '🎧': 'pronoun' };
const RESERVED: string[] = [];
/** Priority overrides (emoji → number; lower = placed earlier). */
const PRIORITY_OVERRIDES: Record<string, number> = { '👓': 0 };
const JUDGMENT = new Set(['☯️', '🐹', '🪞', '👥', '🥼', '🌐']);

const jy = (s: string) => s.replace(/j/g, 'y');
/**
 * English spelling → sound, before the converter sees a label (SPELLING_TO_SOUND):
 *  - inflection: drop -ing (6+ letters) and -ed after a consonant (6+ letters): curling → curl;
 *  - merged / silent letters: ng → n, ph → f, th → s, gh → f after au/ou (laugh) else silent,
 *    final mb → m, initial kn / gn → n;
 *  - a stop after s at the end of a word is dropped: desk → des, list → lis.
 */
const SPELLING_TO_SOUND = true;
/** --pron-echo: score echo by pronunciation (scripts/echo-metric.ts, docs/proposals/echo-metric.md Step 3) instead of spelling. */
const PRON_ECHO = process.argv.includes('--pron-echo');
const soundSpell = (label: string, force = false) =>
  !SPELLING_TO_SOUND && !force
    ? label
    : label
        .toLowerCase()
        .split(/([^a-z]+)/)
        .map((w) => {
          if (!/^[a-z]+$/.test(w)) return w;
          if (w.length >= 6 && w.endsWith('ing')) w = w.slice(0, -3);
          else if (w.length >= 6 && /[^aeiou]ed$/.test(w)) w = w.slice(0, -2);
          w = w.replace(/^[kg]n/, 'n').replace(/mb$/, 'm');
          w = w.replace(/([ao]u)gh/g, '$1f').replace(/gh/g, '');
          w = w.replace(/ng/g, 'n').replace(/ph/g, 'f').replace(/th/g, 's');
          w = w.replace(/s[bdgptkc]$/, 's');
          return w;
        })
        .join('');
const mappedSourceLetters = (input: string) => converter.mappedSourceLetters(soundSpell(input)).map(jy);
const ham = (a: string, b: string) => {
  if (a.length !== b.length) return Infinity;
  let d = 0;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) d++;
  return d;
};
const sharedPrefix = (a: string, b: string) => {
  let i = 0;
  while (i < a.length && i < b.length && a[i] === b[i]) i++;
  return i;
};
const PEN3 = [0, 1, 3, 0];
const PEN5 = [0, 1, 2, 4, 7, 0];
const prefixPen = (a: string, b: string) => (a.length === 3 ? PEN3 : PEN5)[Math.min(sharedPrefix(a, b), a.length)] ?? 0;
const forms = (n: number) => {
  let out = [''];
  for (let i = 0; i < n; i++) out = out.flatMap((p) => (i % 2 ? C : V).map((l) => p + l));
  return out;
};
const csvOut = (headers: string[], rows: Record<string, string>[]) =>
  [headers.join(','), ...rows.map((r) => headers.map((h) => escapeCsvField(r[h] ?? '')).join(','))].join('\n') + '\n';

// ---- emoji domains ----
const DOMAINS: [string, (g: string, s: string) => boolean][] = [
  ['faces & feelings', (g) => g === 'Smileys & Emotion'],
  ['people & roles', (g, s) => g === 'People & Body' && /^person-(role|fantasy|activity|sport)$/.test(s)],
  ['body & persons', (g) => g === 'People & Body'],
  ['animals', (g, s) => g === 'Animals & Nature' && s.startsWith('animal')],
  ['plants, land & sky', (g, s) => g === 'Animals & Nature' || s === 'sky & weather' || s === 'place-geographic'],
  ['food & drink', (g) => g === 'Food & Drink'],
  ['signs, symbols & time', (g, s) => g === 'Symbols' || s === 'time'],
  ['places & travel', (g) => g === 'Travel & Places'],
  ['games & events', (g) => g === 'Activities'],
  [
    'media, music & office',
    (g, s) =>
      g === 'Objects' &&
      /^(sound|music|musical-instrument|phone|computer|light & video|book-paper|money|mail|writing|office)$/.test(s),
  ],
  ['wearables, tools & household', (g) => g === 'Objects'],
  ['countries & flags', (g) => g === 'Flags'],
];
const emojiGroups = new Map<string, [string, string]>();
{
  let g = '', s = '';
  for (const line of readFileSync(EMOJI_TEST, 'utf8').split('\n')) {
    if (line.startsWith('# group:')) g = line.slice(8).trim();
    else if (line.startsWith('# subgroup:')) s = line.slice(11).trim();
    else if (line.includes(';') && !line.startsWith('#')) {
      const ch = String.fromCodePoint(...line.split(';')[0].trim().split(/\s+/).map((h) => parseInt(h, 16)));
      emojiGroups.set(ch, [g, s]);
      emojiGroups.set(ch.replace(/️/g, ''), [g, s]);
    }
  }
}

// ---- load ----
const pub = parseCsv(readFileSync('data/lexicon-published.csv', 'utf8'));
const ovl = parseCsv(readFileSync('data/lexicon-overlays.csv', 'utf8'));
const cmp = parseCsv(readFileSync('data/lexicon-compounds.csv', 'utf8'));

type Row = {
  i: number; emoji: string; concrete: string; abstract: string; orig: string; old: string;
  domain: string; sub: string; flag: boolean; pinned: boolean; marked: boolean; slot: string;
  groups: Set<string>; glosses: string[]; senses: string[]; root?: string; why?: string;
};
const rows: Row[] = pub.rows.map((r, i) => {
  const [g, s] = emojiGroups.get(r.emoji) ?? emojiGroups.get(r.emoji.replace(/️/g, '')) ?? ['?', '?'];
  const d = DOMAINS.find(([, m]) => m(g, s));
  if (!d) throw new Error(`no domain for ${r.emoji}`);
  return {
    i, emoji: r.emoji, concrete: r.concrete, abstract: r.abstract, orig: r.clarity, old: jy(r.clarity),
    domain: d[0], sub: s, flag: d[0] === 'countries & flags', pinned: PINNED.has(r.clarity),
    marked: r.emoji in MARKED, slot: MARKED[r.emoji] ?? '', groups: new Set(), glosses: [r.concrete, r.abstract].filter(Boolean),
    senses: [r.concrete, r.abstract, ...(r.english_by_pos ?? '').split(';').map((e) => e.split(':').slice(1).join(':'))]
      .map((x) => x.trim()).filter(Boolean),
  };
});
const byEmoji = new Map(rows.map((r) => [r.emoji, r]));
const freqRank = new Map<string, number>();
readFileSync(FREQ_FILE, 'utf8').split('\n').forEach((line, k) => {
  const w = line.split(' ')[0];
  if (w && !freqRank.has(w)) freqRank.set(w, k + 1);
});
const englishRank = (label: string) =>
  Math.max(...label.toLowerCase().split(/[^a-z]+/).filter(Boolean).map((w) => freqRank.get(w) ?? 50001));
// A root's priority is its most frequent sense: concrete, abstract, or any english_by_pos meaning.
const priority = new Map<Row, number>(rows.map((r) => [r, Math.min(...r.senses.map(englishRank))]));
const overridden = new Set<Row>();
for (const [emoji, n] of Object.entries(PRIORITY_OVERRIDES)) {
  const r = byEmoji.get(emoji);
  if (r) priority.set(r, n), overridden.add(r);
}
const isJoinKind = (k: string) => k === 'join_act' || k === 'join_relation';
const subkind = (o: Record<string, string>) => (o.kind === 'benchmark' ? (JUDGMENT.has(o.emoji) ? 'judgment' : 'interest') : '');
for (const o of ovl.rows) {
  if (isJoinKind(o.kind) || !o.emoji) continue;
  const r = byEmoji.get(o.emoji)!;
  const sk = subkind(o);
  r.groups.add(`kind:${o.pos}/${o.kind}${sk ? '/' + sk : ''}`);
  r.groups.add(`pos:${o.pos}`);
  if (o.gloss) r.glosses.push(o.gloss.replace(/-interest$/, ''));
}
for (const r of rows) if (r.marked) r.groups.add(`pos:${r.slot}`);
const eligible = rows.filter((r) => r.groups.size > 0 && !r.pinned);

// ---- English echo metric ----
/**
 * Echo of a root against its concrete English label, 0–1. The label is read as sounds
 * (spelling → sound cleanup, always on here so every run is scored the same way, then the
 * converter's letter map). Points, exact matches only:
 *   1st consonant: 3 = the word's first consonant, 2 = its second, 1 = anywhere, 0 = absent;
 *   2nd consonant: 2 = the next consonant after the one matched, 1 = a later one, 0.5 = an earlier one;
 *   1st vowel: 1 = the word's first vowel; each later vowel: 0.5 = the vowel after the consonant before it.
 * Divided by the maximum: 7 for a long root, 4.5 for a short one.
 */
const spellingEcho = (label: string, root: string) => {
  const toks = converter.mappedSourceLetters(soundSpell(label, true)).map(jy);
  const isV = (t: string) => V.includes(t);
  const cons = toks.map((t, k) => [t, k] as const).filter(([t]) => !isV(t));
  const vowelAfter = (pos: number) => toks.slice(pos + 1).find(isV);
  let pts = 0;
  if (root[0] === toks.find(isV)) pts += 1;
  let i1 = -1;
  if (cons[0]?.[0] === root[1]) (pts += 3), (i1 = 0);
  else if (cons[1]?.[0] === root[1]) (pts += 2), (i1 = 1);
  else if ((i1 = cons.findIndex(([t]) => t === root[1])) >= 0) pts += 1;
  if (i1 >= 0 && vowelAfter(cons[i1][1]) === root[2]) pts += 0.5;
  if (root.length === 5) {
    let i2 = -1;
    if (i1 >= 0 && cons[i1 + 1]?.[0] === root[3]) (pts += 2), (i2 = i1 + 1);
    else if (i1 >= 0 && (i2 = cons.findIndex(([t], k) => k > i1 + 1 && t === root[3])) >= 0) pts += 1;
    else if ((i2 = cons.findIndex(([t]) => t === root[3])) >= 0) pts += i1 < 0 ? 1 : 0.5;
    if (i2 >= 0 && vowelAfter(cons[i2][1]) === root[4]) pts += 0.5;
  }
  return pts / (root.length === 5 ? 7 : 4.5);
};
const pronTable = loadPron();
const pron = PRON_ECHO ? pronTable : undefined;
const echoScore = (label: string, root: string) => {
  if (!pron) return spellingEcho(label, root);
  const cmu = pron.get(label);
  if (!cmu) throw new Error(`no pronunciation for ${label}: rerun scripts/echo-pronunciation.ts`);
  return pronEcho(root, cmu);
};
// ---- VCV placement: one constraint problem (annealing) ----
const reserved = new Set(RESERVED);
const LIMIT = 400;
const candCache = new Map<Row, string[]>();
const candidatesOf = (r: Row) => candCache.get(r) ?? candCache.set(r, candidatesFor(r)).get(r)!;
const STOPS = new Set(['b', 'd', 'g']);
const englishConsonants = (r: Row) => new Set(mappedSourceLetters(r.concrete).filter((t) => !V.includes(t)));
/** Long-root candidates from the pronunciation converter (src/word-converter.ts), best echo first. */
const candidatesFor = (r: Row) => {
  const cmu = pronTable.get(r.concrete);
  if (!cmu) throw new Error(`no pronunciation for ${r.concrete}: rerun scripts/echo-pronunciation.ts`);
  return longRootCandidates(cmu).slice(0, LIMIT);
};
// Prioritised long rows claim their best spelling before short roots are placed,
// so no short root can block them through the compound-split ban.
const early = rows
  .filter(() => false)
  .sort((a, b) => priority.get(a)! - priority.get(b)! || a.i - b.i);
const earlyTaken = new Set<string>();
const earlyRank = new Map<Row, number>();
for (const r of early) {
  const list = candidatesOf(r);
  const k = list.findIndex((w) => !earlyTaken.has(w));
  r.root = list[k];
  earlyRank.set(r, k);
  earlyTaken.add(r.root);
}
const fixedLong = [...rows.filter((r) => r.pinned).map((r) => r.old), ...earlyTaken];
const bannedPrefix = new Set(COMPOUND_RULE !== 'prefix' ? [] : fixedLong.filter((x) => JOIN.has(x[3])).map((x) => x.slice(0, 3)));
const movableLong = rows.filter((r) => !r.pinned && !r.flag && r.old.length === 5 && r.groups.size === 0);
const displaced = new Map<string, number>();
for (const r of movableLong) if (JOIN.has(r.old[3])) displaced.set(r.old.slice(0, 3), (displaced.get(r.old.slice(0, 3)) ?? 0) + 1);
const VCV = forms(3).filter((f) => !reserved.has(f) && !bannedPrefix.has(f) && !earlyTaken.has(f));

/** Short-root echo cost: metric points lost against the concrete English word (0 = perfect, 4.5 = none). */
const echo = (r: Row, f: string) => 4.5 * (1 - echoScore(r.concrete, f));
const E = eligible.length;
const shared = (a: Row, b: Row) => [...a.groups].filter((g) => b.groups.has(g));
type PairRule = { a: number; b: number; kind: boolean; bench: boolean; pos: boolean; sib: boolean; dom: boolean };
const pairs: PairRule[] = [];
for (let a = 0; a < E; a++)
  for (let b = a + 1; b < E; b++) {
    const A = eligible[a], B = eligible[b], s = shared(A, B);
    const kinds = (r: Row) => [...r.groups].filter((g) => g.startsWith('kind:')).map((g) => g.split('/').slice(0, 2).join('/'));
    const bench =
      [...A.groups].some((g) => /benchmark\/(judgment|interest)/.test(g)) &&
      [...B.groups].some((g) => /benchmark\/(judgment|interest)/.test(g)) &&
      ([...A.groups].some((g) => g.endsWith('judgment')) !== [...B.groups].some((g) => g.endsWith('judgment')));
    pairs.push({
      a, b, bench,
      kind: s.some((g) => g.startsWith('kind:')),
      pos: s.some((g) => g.startsWith('pos:')),
      sib: !IGNORE_CLOSE_PAIRS && A.sub === B.sub, dom: !IGNORE_CLOSE_PAIRS && A.domain === B.domain,
    });
    void kinds;
  }
const pairHard = (p: PairRule, x: string, y: string) => {
  let v = 0;
  const d = ham(x, y);
  if (d === 0) v++;
  if (p.kind && (d < 2 || x[1] === y[1])) v++;
  if (p.bench && (d < 2 || x.slice(0, 2) === y.slice(0, 2))) v++;
  if (p.dom && d < 2) v++;
  if (p.sib && x[1] === y[1] && d < 3) v++;
  return v;
};
const pairSoft = (p: PairRule, x: string, y: string) => {
  if (IGNORE_CLOSE_PAIRS) return 0;
  const w = p.kind ? 3 : p.pos || p.sib ? 2 : p.dom ? 1 : 0;
  return w * prefixPen(x, y);
};
const ECHO_W = 100, DISPLACE_W = 0;
// Priority on short roots:
//  - short roots always outrank long ones: a long root's wishes never constrain a short root;
//  - among short roots, frequent ones weigh their echo more, so they win contested shapes.
const longFirst = new Map<string, number>(); // VCV prefix → best priority of a long row whose 1st choice it would block
for (const r of rows) {
  if (r.groups.size || r.pinned || overridden.has(r)) continue;
  const first = candidatesOf(r)[0];
  if (!first || !JOIN.has(first[3])) continue;
  const k = first.slice(0, 3);
  longFirst.set(k, Math.min(longFirst.get(k) ?? Infinity, priority.get(r)!));
}
const shortRanks = eligible.map((r) => priority.get(r)!).sort((a, b) => a - b);
const echoScale = (r: Row) => 2 - shortRanks.indexOf(priority.get(r)!) / Math.max(1, shortRanks.length - 1);
const blocks = (_r: Row, _f: string) => false;
const unary = eligible.map((r) => new Map(VCV.map((f) => [f,
  ECHO_W * echoScale(r) * echo(r, f) + DISPLACE_W * (displaced.get(f) ?? 0) + (blocks(r, f) ? 1000 : 0)])));
const byVar: PairRule[][] = eligible.map(() => []);
for (const p of pairs) if (p.kind || p.bench || p.pos || p.sib || p.dom) (byVar[p.a].push(p), byVar[p.b].push(p));
const unique: number[][] = eligible.map((_, i) => eligible.map((_, j) => j).filter((j) => j !== i));

let seed = 12345;
const rnd = () => ((seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);
const assign = eligible.map((r, i) => [...unary[i].entries()].sort((a, b) => a[1] - b[1])[0][0]);
const localCost = (i: number, f: string) => {
  let hard = 0, soft = unary[i].get(f)!;
  for (const p of byVar[i]) {
    const o = p.a === i ? p.b : p.a;
    hard += pairHard(p, f, assign[o]);
    soft += pairSoft(p, f, assign[o]);
  }
  for (const j of unique[i]) if (assign[j] === f && !byVar[i].some((p) => p.a === j || p.b === j)) hard++;
  return 1000 * hard + soft;
};
let best = [...assign], bestCost = Infinity;
const total = () => {
  let s = 0;
  for (let i = 0; i < E; i++) s += localCost(i, assign[i]);
  return s;
};
for (let restart = 0; restart < 6; restart++) {
  let T = 50;
  for (let step = 0; step < 400000; step++) {
    const i = Math.floor(rnd() * E);
    const f = VCV[Math.floor(rnd() * VCV.length)];
    const delta = localCost(i, f) - localCost(i, assign[i]);
    if (delta <= 0 || rnd() < Math.exp(-delta / T)) assign[i] = f;
    T = Math.max(0.05, T * 0.99997);
  }
  const c = total();
  if (c < bestCost) (bestCost = c), (best = [...assign]);
  for (let i = 0; i < E; i++) assign[i] = best[i];
}
eligible.forEach((r, i) => ((r.root = best[i]), (r.why = r.marked ? 'short (marked)' : 'short (overlay)')));
const vcvSet = new Set(eligible.map((r) => r.root!));
const shortBlocking = eligible.filter((r) => blocks(r, r.root!)).length;
const hardViol: string[] = [];
for (const p of pairs) if (pairHard(p, best[p.a], best[p.b]))
  hardViol.push(`${eligible[p.a].concrete} ${best[p.a]} / ${eligible[p.b].concrete} ${best[p.b]}`);

// ---- VCVCV pass ----
const taken = new Map<string, Row>();
for (const r of eligible) taken.set(r.root!, r);
for (const r of rows) if (r.pinned) (r.root = r.old), (r.why = 'pinned'), taken.set(r.root, r);
for (const r of early) (r.why = (r.root === r.old ? 'regenerated = today' : 'regenerated') + ' (priority override)'), taken.set(r.root!, r);
for (const o of ovl.rows) if (isJoinKind(o.kind)) taken.set(o.sense_form, null as unknown as Row);
const byDom = new Map<string, Row[]>();
const addDom = (r: Row) => (byDom.get(r.domain) ?? byDom.set(r.domain, []).get(r.domain)!).push(r);
const V5 = forms(5);
const vowelPattern = (x: string) => [x[0] === x[2], x[2] === x[4], x[0] === x[4]];
const soundPen = (old: string, f: string) => {
  if (old.length !== 5) return 0;
  const a = vowelPattern(old), b = vowelPattern(f);
  return a.reduce((n, v, k) => n + (v && !b[k] ? 0.5 : 0), 0);
};
const okLong = (r: Row, f: string) => {
  if (taken.has(f)) return false;
  if (JOIN.has(f[3]) && (SECOND_CONSONANT_BAN || (COMPOUND_RULE === 'prefix' && vcvSet.has(f.slice(0, 3))))) return false;
  if (r.flag || IGNORE_CLOSE_PAIRS) return true;
  for (const o of byDom.get(r.domain) ?? []) {
    if (o.root!.length !== 5) continue;
    const d = ham(f, o.root!);
    if (d < 2) return false;
    if (o.sub === r.sub && f[1] === o.root![1] && d < 3) return false;
  }
  return true;
};
const todo = rows.filter((r) => !r.root);
for (const r of rows) if (r.root && r.root.length === 5 && !r.flag) addDom(r);
// Fresh start: each row's five-letter candidates from the converter, best first.
const candList = new Map<Row, string[]>(todo.map((r) => [r, candidatesOf(r)]));
const rankOf = new Map<Row, number>(earlyRank);
const failed: Row[] = [];
// Regret order: the row that loses most by not getting its best free candidate goes first.
const pending = new Set(todo);
const ptr = new Map<Row, number>(todo.map((r) => [r, 0]));
const nextFree = (r: Row, from: number) => {
  const list = candList.get(r)!;
  for (let k = from; k < list.length; k++) if (okLong(r, list[k])) return k;
  return Infinity;
};
while (pending.size) {
  let pick: Row | undefined, pickKey = [-Infinity, 0];
  const top = Math.min(...[...pending].map((r) => priority.get(r) ?? Infinity));
  for (const r of pending) {
    if ((priority.get(r) ?? Infinity) !== top) continue;
    const a = nextFree(r, ptr.get(r)!);
    ptr.set(r, a);
    const b = a === Infinity ? Infinity : nextFree(r, a + 1);
    const regret = b === Infinity ? 1e6 : b - a;
    if (regret > pickKey[0] || (regret === pickKey[0] && a < pickKey[1])) (pick = r), (pickKey = [regret, a]);
  }
  const r = pick!;
  pending.delete(r);
  const k = ptr.get(r)!;
  if (k === Infinity) { failed.push(r); continue; }
  r.root = candList.get(r)![k];
  rankOf.set(r, k);
  r.why = r.root === r.old ? 'regenerated = today' : (r.old.length === 3 ? 'lengthened' : 'regenerated') + (r.flag ? ' (flag)' : '');
  taken.set(r.root, r);
  if (!r.flag) addDom(r);
}

// ---- rewrite overlays and compounds ----
const oldToNew = new Map(rows.map((r) => [r.orig, r.root ?? r.orig]));
const newOverlays = ovl.rows.map((o) => {
  const out = { ...o, subkind: subkind(o) };
  if (isJoinKind(o.kind) || !o.emoji) return out;
  const r = byEmoji.get(o.emoji)!;
  const at = o.sense_form.indexOf(r.orig);
  if (at < 0) throw new Error(`overlay ${o.sense_form} lacks ${r.orig}`);
  out.sense_form = jy(o.sense_form.slice(0, at)) + r.root + jy(o.sense_form.slice(at + r.orig.length));
  out.mnemonic = o.mnemonic;
  return out;
});
const newCompounds = cmp.rows.map((c) => {
  const left = oldToNew.get(c.left) ?? jy(c.left);
  const right = oldToNew.get(c.right) ?? jy(c.right);
  return { ...c, left, right, stem: left + c.join + right };
});
const overlaySenseSet = new Set(newOverlays.map((o) => `${o.pos}:${o.sense_form}`));
const overlayDupes = newOverlays.length - overlaySenseSet.size - (ovl.rows.length - new Set(ovl.rows.map((o) => `${o.pos}:${o.sense_form}`)).size);

// ---- checks ----
const allRoots = rows.map((r) => r.root!).filter(Boolean);
const dupRoots = allRoots.filter((x, k) => allRoots.indexOf(x) !== k);
const splitErrors: string[] = [];
const vcvAll = new Set(allRoots.filter((x) => x.length === 3));
for (const x of allRoots) if (x.length === 5 && JOIN.has(x[3]) && vcvAll.has(x.slice(0, 3))) splitErrors.push(`${x.slice(0, 3)} → ${x}`);
const prefixWarn: string[] = [];
for (const s of eligible)
  for (const l of rows)
    if (l.root!.length === 5 && l.root!.startsWith(s.root!) && !JOIN.has(l.root![3]) && [...s.groups].some((g) => g === `pos:${(l.groups.size ? '' : 'x')}`))
      prefixWarn.push(`${s.root} / ${l.root}`);
const compoundStems = newCompounds.map((c) => c.stem);
const compoundCollide = compoundStems.filter((s) => taken.has(s));
const rootSet = new Set(allRoots);
/** Every way to read `w` as root (join root)*. */
const splits = (w: string): string[][] => {
  const out: string[][] = [];
  for (const n of [3, 5]) {
    const head = w.slice(0, n);
    if (!rootSet.has(head)) continue;
    if (w.length === n) out.push([head]);
    else if (JOIN.has(w[n])) for (const rest of splits(w.slice(n + 1))) out.push([head, w[n], ...rest]);
  }
  return out;
};
const listedSplitErrors = newCompounds
  .map((c) => ({ c, ways: splits(c.stem) }))
  .filter(({ ways }) => ways.length > 1)
  .map(({ c, ways }) => `${c.concrete} \`${c.stem}\`: ${ways.map((w) => w.join(' ')).join(' | ')}`);
const allSplits = [...rows.map((r) => r.root!)].filter((x) => x.length === 5 && JOIN.has(x[3]) && rootSet.has(x.slice(0, 3))).length;

// stats: now vs revamp (non-flag, non-pinned, same length pairs)
const stat = (get: (r: Row) => string) => {
  let dom = 0, sib = 0, sib2 = 0, sibOnset = 0;
  const list = rows.filter((r) => !r.flag && !r.pinned);
  for (let a = 0; a < list.length; a++)
    for (let b = a + 1; b < list.length; b++) {
      const A = list[a], B = list[b];
      if (A.domain !== B.domain) continue;
      const x = get(A), y = get(B);
      if (x.length !== y.length) continue;
      const d = ham(x, y);
      if (A.sub === B.sub) {
        if (d < 2 || (x[1] === y[1] && d < 3)) sib++;
        if (d <= 2) sib2++;
        if (x[1] === y[1]) sibOnset++;
      } else if (d < 2) dom++;
    }
  return { dom, sib, sib2, sibOnset };
};
const sNow = stat((r) => r.orig), sNew = stat((r) => r.root!);

const echoOf = new Map(rows.map((r) => [r, echoScore(r.concrete, r.root!)]));
const echoToday = new Map(rows.map((r) => [r, echoScore(r.concrete, r.old)]));
const echoLines: string[] = [];
{
  const stats = (m: Map<Row, number>, pick: (r: Row) => boolean) => {
    const v = rows.filter(pick).map((r) => m.get(r)!).sort((a, b) => a - b);
    const mean = v.reduce((a, b) => a + b, 0) / v.length;
    return `mean ${mean.toFixed(3)}, median ${v[Math.floor(v.length / 2)].toFixed(3)}, < 0.4: ${v.filter((x) => x < 0.4).length} of ${v.length}`;
  };
  echoLines.push('## English echo (concrete label)', '', '| | Today | Dry run |', '|---|---|---|',
    `| All roots | ${stats(echoToday, () => true)} | ${stats(echoOf, () => true)} |`,
    `| Short roots (dry run) | ${stats(echoToday, (r) => r.groups.size > 0)} | ${stats(echoOf, (r) => r.groups.size > 0)} |`,
    `| Long roots (dry run) | ${stats(echoToday, (r) => r.groups.size === 0)} | ${stats(echoOf, (r) => r.groups.size === 0)} |`, '');
}

// ---- write ----
mkdirSync(OUT, { recursive: true });
const pubHeaders = [...pub.headers, 'short', 'pinned', 'slot', 'priority'];
writeFileSync(`${OUT}/lexicon-published.csv`, csvOut(pubHeaders, pub.rows.map((p, k) => {
  const r = rows[k];
  return { ...p, clarity: r.root ?? '', short: r.marked ? 'y' : '', pinned: r.pinned ? 'y' : '', slot: r.slot, priority: String(priority.get(r)) };
})));
const ovHeaders = [...ovl.headers.slice(0, 4), 'subkind', ...ovl.headers.slice(4)];
writeFileSync(`${OUT}/lexicon-overlays.csv`, csvOut(ovHeaders, newOverlays));
writeFileSync(`${OUT}/lexicon-compounds.csv`, csvOut(cmp.headers, newCompounds));
writeFileSync(`${OUT}/reserved-roots.csv`, csvOut(['root', 'reason'], RESERVED.map((root) => ({ root, reason: '' }))));
writeFileSync(`${OUT}/root-changes.csv`, csvOut(
  ['emoji', 'concrete', 'priority', 'domain', 'subgroup', 'old', 'new', 'echo_old', 'echo_new', 'letters_changed', 'reason', 'groups'],
  rows.map((r) => ({
    emoji: r.emoji, concrete: r.concrete, priority: String(priority.get(r)), domain: r.domain, subgroup: r.sub, old: r.orig, new: r.root ?? '',
    echo_old: echoToday.get(r)!.toFixed(2), echo_new: echoOf.get(r)!.toFixed(2),
    letters_changed: r.root && r.root.length === r.orig.length ? String(ham(r.root, r.orig)) : 'len',
    reason: r.root ? r.why! : 'FAILED', groups: [...r.groups].join(' '),
  })),
));

// report
const L: string[] = [];
const swappedRows = rows.filter((r) => r.root && swapped.has(`${r.emoji}:${r.root}`));
const count = (p: (r: Row) => boolean) => rows.filter(p).length;
const whyCounts = new Map<string, number>();
for (const r of rows) whyCounts.set(r.why ?? 'FAILED', (whyCounts.get(r.why ?? 'FAILED') ?? 0) + 1);
L.push('# Lexicon revamp — dry run', '', 'Generated from `data/*.csv` (unchanged). Defaults used for open questions:', '',
  `- pinned: ${[...PINNED].join(', ') || 'none'}`,
  `- short=y (slot \`pronoun\`): ${Object.keys(MARKED).map((e) => `${e} \`${byEmoji.get(e)!.orig}\``).join(', ')}`,
  `- reserved VCVs: ${RESERVED.length || 'none'}`,
  '- flags regenerated like every other row; join overlays not eligible',
  `- compound rule: **${COMPOUND_RULE}** (prefix = short-root prefix ban; slot4 = no l/m/n/r second consonant; listed = only listed compounds checked)`,
  `- VCV cost: ${ECHO_W} × echo distance + ${DISPLACE_W} × long roots displaced by the compound-split ban + shared-prefix penalty (kind ×3, position/sibling ×2, domain ×1); annealed`,
  (IGNORE_CLOSE_PAIRS ? '- **echo-first:** domain / sibling spacing and shared-prefix penalty off; grammatical group floors, uniqueness and compound-split ban kept\n' : '') + (SLOT4_SWAP && SECOND_CONSONANT_BAN ? '- **slot-4 swap:** a candidate with l/m/n/r as second consonant is used with its consonants swapped (dropped if both are l/m/n/r)\n' : '') + (PRON_ECHO ? '- **echo metric:** pronunciation (CMU, scripts/echo-metric.ts)\n' : '') + (SPELLING_TO_SOUND ? '- **spelling → sound:** -ing / -ed stripped; ng, gh, mb, kn, ph, th merged; final s+stop → s\n' : '') + '- long roots: regenerated from the concrete label (phoneme candidates from src/word-converter.ts, ranked by the pronunciation metric), placed by priority = English frequency rank of the most frequent sense; overrides: ' + (Object.keys(PRIORITY_OVERRIDES).join(' ') || 'none'), '');
const overlayN = eligible.filter((r) => !r.marked).length;
L.push('## Budget', '', `overlay ${overlayN} / marked ${eligible.length - overlayN} / pinned ${PINNED.size} / reserved ${RESERVED.length} / free ${192 - eligible.length - RESERVED.length} of 192 VCVs`, '');
L.push('## Outcome per root', '', '| Reason | Roots |', '|---|---|', ...[...whyCounts].sort((a, b) => b[1] - a[1]).map(([k, v]) => `| ${k} | ${v} |`), '');
const chg = new Map<string, number>();
for (const r of rows) if (r.root && r.root.length === r.orig.length) { const k = String(ham(r.root, r.orig)); chg.set(k, (chg.get(k) ?? 0) + 1); }
L.push('Same-length roots by letters changed (incl. j→y): ' + [...chg].sort().map(([k, v]) => `${k}: ${v}`).join(', '), '');
L.push(`Roots using a swapped candidate: ${swappedRows.length} — e.g. ${swappedRows.slice(0, 15).map((r) => `${r.concrete} \`${r.root}\``).join(', ')}`, '');
{
  let eng = 0, fill = 0, fillStops = 0;
  for (const r of rows) {
    const x = r.root!;
    if (x.length !== 5) continue;
    const e = englishConsonants(r);
    if (e.has(x[3])) eng++;
    else (fill++, STOPS.has(x[3]) && fillStops++);
  }
  L.push(`Second consonant of long roots: ${eng} from the English spelling, ${fill} filler (${fillStops} of them stops).`, '');
}
{
  const GROUPS: [string, string][] = [['stops b d g', 'bdg'], ['fricatives v z h', 'vzh'], ['glides w y', 'wyj'], ['l m n r', 'lmnr']];
  const pct = (list: string[]) => {
    const cs = list.flatMap((x) => [...x].filter((c) => !V.includes(c)));
    return GROUPS.map(([, g]) => ((cs.filter((c) => g.includes(c)).length / cs.length) * 100).toFixed(1) + '%');
  };
  const nf = rows.filter((r) => !r.flag);
  L.push('## Consonant groups (% of consonants)', '', `| | ${GROUPS.map(([n]) => n).join(' | ')} |`, `|---|${GROUPS.map(() => '---|').join('')}`,
    `| Current lexicon | ${pct(rows.map((r) => r.orig)).join(' | ')} |`,
    `| Dry run | ${pct(rows.map((r) => r.root!)).join(' | ')} |`,
    `| Dry run, non-flag | ${pct(nf.map((r) => r.root!)).join(' | ')} |`, '');
}
L.push(...echoLines);
L.push('## Checks', '',
  `- VCV hard-floor violations: ${hardViol.length}${hardViol.length ? ' — ' + hardViol.join('; ') : ''}`,
  `- duplicate roots: ${dupRoots.length}${dupRoots.length ? ' — ' + dupRoots.join(', ') : ''}`,
  `- long roots with l/m/n/r as second consonant: ${allRoots.filter((x) => x.length === 5 && JOIN.has(x[3])).length}`,
  ...(COMPOUND_RULE === 'prefix' ? [`- compound-split errors (VCV + l/m/n/r prefix of a VCVCV): ${splitErrors.length}`] : []),
  `- listed compounds that split two ways: ${listedSplitErrors.length}${listedSplitErrors.length ? ' — ' + listedSplitErrors.join('; ') : ''}`,
  `- long roots a short root + l/m/n/r could start (potential future splits): ${allSplits}`,
  `- failed to place: ${failed.length}${failed.length ? ' — ' + failed.map((r) => r.concrete).join(', ') : ''}`,
  `- compound stems colliding with roots: ${compoundCollide.length}`,
  `- new duplicate (pos, sense_form) overlay rows: ${overlayDupes}`,
  `- surface-collision check vs hooks / stand-ins / x-compound openers: **not run** (needs parser inventory; see open work 1 / 8)`, '');
L.push('## Close pairs (non-flag, non-pinned; same length)', '', '| | Now | Dry run |', '|---|---|---|',
  `| Same domain, distance 1 (non-siblings) | ${sNow.dom} | ${sNew.dom} |`,
  `| Siblings breaking rule 3 | ${sNow.sib} | ${sNew.sib} |`,
  `| Siblings, distance ≤ 2 | ${sNow.sib2} | ${sNew.sib2} |`,
  `| Siblings sharing first consonant | ${sNow.sibOnset} | ${sNew.sibOnset} |`, '');
// groups
const groupNames = [...new Set(eligible.flatMap((r) => [...r.groups]))].sort();
L.push('## Short-root groups', '');
for (const g of groupNames) {
  const members = eligible.filter((r) => r.groups.has(g));
  let close = '', cd = 9, lp = 0;
  for (let a = 0; a < members.length; a++)
    for (let b = a + 1; b < members.length; b++) {
      const d = ham(members[a].root!, members[b].root!);
      if (d < cd) (cd = d), (close = `${members[a].root} / ${members[b].root}`);
      lp = Math.max(lp, sharedPrefix(members[a].root!, members[b].root!));
    }
  L.push(`### \`${g}\` (${members.length})`, '',
    members.map((r) => `\`${r.orig}\`→**\`${r.root}\`** ${r.glosses.slice(-1)[0] ?? r.concrete}`).join(' · '), '',
    members.length > 1 ? `closest: ${close} (distance ${cd}); longest shared prefix ${lp}` : '', '');
}
const lengthened = rows.filter((r) => r.why?.startsWith('lengthened'));
L.push('## Lengthened VCV → VCVCV', '', lengthened.map((r) => `${r.emoji} ${r.concrete} \`${r.orig}\`→\`${r.root}\``).join(', '), '');
// converter rank
{
  const b = new Map<string, number>();
  const bucket = (k: number) => (k === 0 ? '1st choice' : k === 1 ? '2nd' : k < 5 ? '3rd–5th' : k < 20 ? '6th–20th' : '21st+');
  for (const [, k] of rankOf) b.set(bucket(k), (b.get(bucket(k)) ?? 0) + 1);
  L.push('## Converter choice used (regenerated rows)', '', '| Candidate | Roots |', '|---|---|',
    ...['1st choice', '2nd', '3rd–5th', '6th–20th', '21st+'].map((k) => `| ${k} | ${b.get(k) ?? 0} |`), '',
    'Roots that got their 21st+ candidate: ' + [...rankOf].filter(([, k]) => k >= 20).map(([r, k]) => `${r.concrete} \`${r.root}\` (#${k + 1})`).join(', '), '');
}
// letter statistics
{
  const letterTable = (label: string, list: string[]) => {
    const letters = [...V, ...C, ...(list.some((x) => x.includes('j')) ? ['j'] : [])];
    const total = new Map<string, number>(), pos: Map<string, number>[] = [0, 1, 2, 3, 4].map(() => new Map());
    for (const x of list) for (let k = 0; k < x.length; k++) {
      total.set(x[k], (total.get(x[k]) ?? 0) + 1);
      pos[k].set(x[k], (pos[k].get(x[k]) ?? 0) + 1);
    }
    const sum = [...total.values()].reduce((a, b) => a + b, 0);
    L.push(`### ${label} (${list.length} roots)`, '', '| Letter | Total | % | Pos 1 | Pos 2 | Pos 3 | Pos 4 | Pos 5 |', '|---|---|---|---|---|---|---|---|');
    for (const l of letters.sort((a, b) => (total.get(b) ?? 0) - (total.get(a) ?? 0)))
      L.push(`| \`${l}\` | ${total.get(l) ?? 0} | ${(((total.get(l) ?? 0) / sum) * 100).toFixed(1)} | ${pos.map((m) => m.get(l) ?? '').join(' | ')} |`);
    L.push('');
  };
  L.push('## Letter statistics', '', 'Counts every letter of every published root; positions are 1-based within the root.', '');
  letterTable('Current lexicon', rows.map((r) => r.orig));
  letterTable('Dry run', rows.map((r) => r.root!));
  letterTable('Dry run, non-flag', rows.filter((r) => !r.flag).map((r) => r.root!));
  const tail = new Map<string, number>();
  for (const r of lengthened) { const t = r.root!.slice(3); tail.set(t, (tail.get(t) ?? 0) + 1); }
  L.push('### Letters added when lengthening VCV → VCVCV', '', '| Added | Roots |', '|---|---|',
    ...[...tail].sort((a, b) => b[1] - a[1]).map(([t, n]) => `| \`-${t}\` | ${n} |`), '');
}
writeFileSync(`${OUT}/report.md`, L.join('\n') + '\n');
console.log(L.slice(0, 40).join('\n'));
