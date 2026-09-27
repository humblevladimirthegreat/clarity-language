/**
 * Prototype: respell published roots so the first consonant names a meaning
 * domain, while keeping easily confused roots at least 2 letters apart.
 *
 *   node scripts/prototype-semantic-roots.ts [--spread | --strict-domain] [--flags-in-scheme]
 *
 * Domains come from Unicode's emoji groups / subgroups (the lexicon is
 * emoji-seeded). Writes tmp/semantic-roots.csv and tmp/semantic-roots-report.md.
 * Read-only for the lexicon — nothing under data/ or docs/ changes.
 *
 * Rules (all hard constraints):
 *   1. Every root is unique.
 *   2. Same subgroup (siblings like grin / smile / laugh): Hamming distance >= 2.
 *   3. Same domain: no 1-letter difference where the two letters are a
 *      confusable pair (CONFUSABLE below). With --strict-domain: no 1-letter
 *      difference at all inside a domain.
 *   4. Root shape stays V(CV)+ and length stays the same.
 * --spread: no domain letter. Domains only decide who must stay apart:
 *   same domain  — weighted distance >= 1.5 (a confusable swap counts 0.5),
 *                  so no plain 1-letter difference anywhere in a domain;
 *   same subgroup — weighted distance >= 2, and either clearly different first
 *                  consonants (not equal, not a confusable pair — listeners weight
 *                  word onsets) or weighted distance >= 3.
 *   Ties prefer a first consonant few domain-mates use.
 * Country flags keep their current (name-echo) spelling unless --flags-in-scheme:
 * 259 countries in one subgroup cannot all be 2 letters apart with a fixed
 * first consonant (at most 64 can). A 3-letter root that finds no free slot
 * grows to 5 letters.
 * Preference: the fewest letter changes from the current root, so English
 * sound hooks (`olove`) survive where the domain letter allows.
 */
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { escapeCsvField, parseCsv } from '../src/csv.ts';

const VOWELS = ['a', 'e', 'o', 'u'];
const CONSONANTS = ['b', 'd', 'g', 'h', 'j', 'l', 'm', 'n', 'r', 'v', 'w', 'z'];

/** Letters a listener could mishear for each other (voicing is free, so b~p~v~f, d~t, z~s). */
const CONFUSABLE: [string, string][] = [
  ['m', 'n'],
  ['b', 'v'],
  ['l', 'r'],
  ['d', 'z'],
  ['o', 'u'],
];

/** First consonant = domain. The hint word is only a memory cue. */
const DOMAINS: { letter: string; name: string; hint: string; match: (g: string, s: string) => boolean }[] = [
  { letter: 'm', name: 'faces & feelings', hint: 'mood', match: (g) => g === 'Smileys & Emotion' },
  {
    letter: 'j',
    name: 'people & roles',
    hint: 'job',
    match: (g, s) => g === 'People & Body' && /^person-(role|fantasy|activity|sport)$/.test(s),
  },
  { letter: 'b', name: 'body & persons', hint: 'body', match: (g) => g === 'People & Body' },
  { letter: 'w', name: 'animals', hint: 'wild', match: (g, s) => g === 'Animals & Nature' && s.startsWith('animal') },
  {
    letter: 'l',
    name: 'plants, land & sky',
    hint: 'leaf / land',
    match: (g, s) => g === 'Animals & Nature' || s === 'sky & weather' || s === 'place-geographic',
  },
  { letter: 'n', name: 'food & drink', hint: 'nom', match: (g) => g === 'Food & Drink' },
  { letter: 'z', name: 'signs, symbols & time', hint: 'zodiac', match: (g, s) => g === 'Symbols' || s === 'time' },
  { letter: 'd', name: 'places & travel', hint: 'destination', match: (g) => g === 'Travel & Places' },
  { letter: 'g', name: 'games & events', hint: 'game', match: (g) => g === 'Activities' },
  {
    letter: 'r',
    name: 'media, music & office',
    hint: 'record',
    match: (g, s) =>
      g === 'Objects' &&
      /^(sound|music|musical-instrument|phone|computer|light & video|book-paper|money|mail|writing|office)$/.test(s),
  },
  { letter: 'v', name: 'wearables, tools & household', hint: 'vest', match: (g) => g === 'Objects' },
  { letter: 'h', name: 'countries & flags', hint: 'homeland', match: (g) => g === 'Flags' },
];

/** Kept as-is: `agala` carries the language name. */
const PINNED = new Set(['agala']);

const EMOJI_TEST = 'tmp/emoji-test.txt';
const EMOJI_TEST_URL = 'https://unicode.org/Public/emoji/latest/emoji-test.txt';

async function loadEmojiGroups(): Promise<Map<string, [string, string]>> {
  if (!existsSync(EMOJI_TEST)) {
    mkdirSync('tmp', { recursive: true });
    const res = await fetch(EMOJI_TEST_URL);
    if (!res.ok) throw new Error(`fetch ${EMOJI_TEST_URL}: ${res.status}`);
    writeFileSync(EMOJI_TEST, await res.text());
  }
  const map = new Map<string, [string, string]>();
  let group = '';
  let sub = '';
  for (const line of readFileSync(EMOJI_TEST, 'utf8').split('\n')) {
    if (line.startsWith('# group:')) group = line.slice(8).trim();
    else if (line.startsWith('# subgroup:')) sub = line.slice(11).trim();
    else if (line.includes(';') && !line.startsWith('#')) {
      const ch = String.fromCodePoint(...line.split(';')[0].trim().split(/\s+/).map((h) => parseInt(h, 16)));
      map.set(ch, [group, sub]);
      map.set(ch.replace(/️/g, ''), [group, sub]);
    }
  }
  return map;
}

const confusable = new Set(CONFUSABLE.flatMap(([a, b]) => [a + b, b + a]));

/** Index of the single differing letter, -1 if identical, -2 if 2+ differ or lengths differ. */
function oneDiff(a: string, b: string): number {
  if (a.length !== b.length) return -2;
  let at = -1;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) {
      if (at !== -1) return -2;
      at = i;
    }
  }
  return at;
}

function hamming(a: string, b: string): number {
  let d = 0;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) d++;
  return d;
}

/** All V(CV)+ forms of `len` whose first consonant is `c1`. */
/** Letter differences, with a confusable pair counting 0.5. Different lengths count as far apart. */
function weighted(a: string, b: string): number {
  if (a.length !== b.length) return Infinity;
  let d = 0;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) d += confusable.has(a[i] + b[i]) ? 0.5 : 1;
  return d;
}

/** All V(CV)+ forms of `len` whose first consonant is `c1` (any consonant when null). */
function formsFor(len: number, c1: string | null): string[] {
  let out = [''];
  for (let i = 0; i < len; i++) {
    const letters = i % 2 === 0 ? VOWELS : i === 1 && c1 ? [c1] : CONSONANTS;
    out = out.flatMap((p) => letters.map((l) => p + l));
  }
  return out;
}

type Row = { emoji: string; concrete: string; old: string; group: string; sub: string; domain: string };
type Placed = Row & { root: string };

async function main() {
  const strictDomain = process.argv.includes('--strict-domain');
  const spread = process.argv.includes('--spread');
  const flagsInScheme = process.argv.includes('--flags-in-scheme');
  const exempt = (r: Row) => PINNED.has(r.old) || (!flagsInScheme && r.domain === 'h');
  const lengthened: Placed[] = [];
  const groups = await loadEmojiGroups();
  const csv = parseCsv(readFileSync('data/lexicon-published.csv', 'utf8')).rows;

  const rows: Row[] = csv.map((r) => {
    const [group, sub] = groups.get(r.emoji) ?? groups.get(r.emoji.replace(/️/g, '')) ?? ['?', '?'];
    const d = DOMAINS.find((d) => d.match(group, sub));
    if (!d) throw new Error(`no domain for ${r.emoji} ${group} / ${sub}`);
    return { emoji: r.emoji, concrete: r.concrete, old: r.clarity, group, sub, domain: d.letter };
  });

  const taken = new Map<string, Placed>();
  const byDomain = new Map<string, Placed[]>();
  const placed: Placed[] = [];
  const failed: Row[] = [];

  const ok = (cand: string, row: Row): boolean => {
    if (taken.has(cand)) return false;
    if (spread) {
      for (const other of byDomain.get(row.domain) ?? []) {
        const w = weighted(cand, other.root);
        if (w < 1.5) return false;
        if (other.sub !== row.sub) continue;
        if (w < 2) return false;
        const sameOnset = cand[1] === other.root[1] || confusable.has(cand[1] + other.root[1]);
        if (sameOnset && w < 3) return false;
      }
      return true;
    }
    for (const other of byDomain.get(row.domain) ?? []) {
      const at = oneDiff(cand, other.root);
      if (at < 0) continue;
      if (other.sub === row.sub || strictDomain) return false;
      if (confusable.has(cand[at] + other.root[at])) return false;
    }
    return true;
  };

  const place = (row: Row, root: string) => {
    const p = { ...row, root };
    taken.set(root, p);
    placed.push(p);
    if (!byDomain.has(row.domain)) byDomain.set(row.domain, []);
    byDomain.get(row.domain)!.push(p);
  };

  // Pinned first, then roots whose current spelling already fits (cheapest), then the rest.
  const fits = (r: Row) => spread || r.old[1] === r.domain;
  const order = [
    ...rows.filter((r) => exempt(r)),
    ...rows.filter((r) => !exempt(r) && fits(r)),
    ...rows.filter((r) => !exempt(r) && !fits(r)),
  ];
  const formCache = new Map<string, string[]>();
  for (const row of order) {
    if (exempt(row)) {
      place(row, row.old);
      continue;
    }
    let hit: string | undefined;
    for (const len of row.old.length === 3 ? [3, 5] : [row.old.length]) {
      const key = spread ? `${len}` : `${len}${row.domain}`;
      if (!formCache.has(key)) formCache.set(key, formsFor(len, spread ? null : row.domain));
      const target = row.old.slice(0, 1) + row.domain + row.old.slice(2);
      const mates = byDomain.get(row.domain) ?? [];
      const onsetUse = (f: string) => mates.filter((m) => m.root[1] === f[1]).length;
      hit = formCache
        .get(key)!
        .map((f) => [f, hamming(f, row.old), spread ? onsetUse(f) : hamming(f, target)] as const)
        .sort((a, b) => a[1] - b[1] || a[2] - b[2] || (a[0] < b[0] ? -1 : 1))
        .find(([f]) => ok(f, row))?.[0];
      if (hit) break;
    }
    if (hit) {
      place(row, hit);
      if (hit.length !== row.old.length) lengthened.push(taken.get(hit)!);
    } else failed.push(row);
  }

  // ---- report ----
  const lines: string[] = [];
  const n = rows.length;
  const changes = (p: Placed) => hamming(p.root, p.old);
  const dist = new Map<number, number>();
  for (const p of placed.filter((p) => !exempt(p))) dist.set(changes(p), (dist.get(changes(p)) ?? 0) + 1);

  let oldNeighbors = 0;
  let newSameSub = 0;
  let newSameDomainConf = 0;
  let newAnyNeighbors = 0;
  const olds = rows.map((r) => r.old);
  for (let i = 0; i < olds.length; i++)
    for (let j = i + 1; j < olds.length; j++) if (oneDiff(olds[i], olds[j]) >= 0) oldNeighbors++;
  for (let i = 0; i < placed.length; i++)
    for (let j = i + 1; j < placed.length; j++) {
      const a = placed[i];
      const b = placed[j];
      const at = oneDiff(a.root, b.root);
      if (at < 0) continue;
      newAnyNeighbors++;
      if (a.sub === b.sub) newSameSub++;
      else if (a.domain === b.domain && confusable.has(a.root[at] + b.root[at])) newSameDomainConf++;
    }
  let oldSameSub = 0;
  for (let i = 0; i < rows.length; i++)
    for (let j = i + 1; j < rows.length; j++)
      if (rows[i].sub === rows[j].sub && oneDiff(rows[i].old, rows[j].old) >= 0) oldSameSub++;

  lines.push(`# Semantic-root prototype${spread ? ' (spread)' : strictDomain ? ' (strict domain)' : ''}`, '');
  const exemptCount = rows.filter(exempt).length;
  lines.push(
    `Roots: ${n}. Placed by the scheme: ${placed.length - exemptCount}. Kept as-is (exempt): ${exemptCount}. ` +
      `3→5 letters: ${lengthened.length}. Failed: ${failed.length}.`,
    '',
  );
  lines.push('## Domains (first consonant)', '', '| Letter | Domain | Cue | Roots |', '|---|---|---|---|');
  for (const d of DOMAINS)
    lines.push(`| \`${d.letter}\` | ${d.name} | ${d.hint} | ${rows.filter((r) => r.domain === d.letter).length} |`);
  if (lengthened.length)
    lines.push('', `3→5 letters: ${lengthened.map((p) => `${p.concrete} \`${p.old}\`→\`${p.root}\``).join(', ')}`);
  lines.push('', '## Letters changed from the current root (scheme roots only)', '', '| Changes | Roots |', '|---|---|');
  for (const k of [...dist.keys()].sort()) lines.push(`| ${k} | ${dist.get(k)} |`);
  lines.push('', '## One-letter neighbours', '', '| | Now | Prototype |', '|---|---|---|');
  lines.push(`| All pairs | ${oldNeighbors} | ${newAnyNeighbors} |`);
  lines.push(`| Same subgroup (siblings) | ${oldSameSub} | ${newSameSub} |`);
  lines.push(`| Same domain, confusable letters | — | ${newSameDomainConf} |`);
  const sib = (key: (x: Row & { root?: string }) => string) => {
    let pairs = 0, onset = 0, two = 0;
    const list = placed.filter((p) => !exempt(p));
    for (let i = 0; i < list.length; i++)
      for (let j = i + 1; j < list.length; j++) {
        const a = list[i], b = list[j];
        if (a.sub !== b.sub || a.domain !== b.domain) continue;
        const x = key(a), y = key(b);
        if (x.length !== y.length) continue;
        pairs++;
        if (x[1] === y[1]) onset++;
        if (hamming(x, y) <= 2) two++;
      }
    return { pairs, onset, two };
  };
  const so = sib((r) => r.old), sn = sib((r) => r.root!);
  lines.push('', '## Sibling spacing (scheme roots, same subgroup, same length)', '', '| | Now | Prototype |', '|---|---|---|');
  lines.push(`| Share first consonant | ${so.onset} / ${so.pairs} | ${sn.onset} / ${sn.pairs} |`);
  lines.push(`| Differ in only 1–2 letters | ${so.two} / ${so.pairs} | ${sn.two} / ${sn.pairs} |`);
  if (failed.length) {
    lines.push('', '## Failed', '');
    for (const f of failed) lines.push(`- ${f.emoji} ${f.concrete} \`${f.old}\` (${f.sub})`);
  }
  lines.push('', '## Sample (first 5 per domain)', '');
  for (const d of DOMAINS) {
    const s = placed.filter((p) => p.domain === d.letter).slice(0, 5);
    lines.push(`- **${d.letter}** ${s.map((p) => `${p.emoji} ${p.concrete} \`${p.old}\`→\`${p.root}\``).join(', ')}`);
  }

  mkdirSync('tmp', { recursive: true });
  const suffix = (spread ? '-spread' : '') + (strictDomain ? '-strict' : '') + (flagsInScheme ? '-flags' : '');
  const byEmoji = new Map(placed.map((p) => [p.emoji, p]));
  writeFileSync(
    `tmp/semantic-roots${suffix}.csv`,
    'emoji,concrete,group,subgroup,domain,old,new,changes\n' +
      rows
        .map((r) => {
          const p = byEmoji.get(r.emoji);
          return [r.emoji, r.concrete, r.group, r.sub, r.domain, r.old, p?.root ?? '', p ? changes(p) : '']
            .map((v) => escapeCsvField(String(v)))
            .join(',');
        })
        .join('\n') +
      '\n',
  );
  writeFileSync(`tmp/semantic-roots${suffix}-report.md`, lines.join('\n') + '\n');
  console.log(lines.join('\n'));
}

await main();
