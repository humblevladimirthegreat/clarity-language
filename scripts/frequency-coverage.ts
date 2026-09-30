/**
 * Coverage of the most frequent English lemmas (OpenSubtitles tmp/en_50k.txt)
 * against the lexicon CSVs and the grammar docs. See the proposal
 * subtitle-frequency-fill.md.
 *
 * Run: npx tsx scripts/frequency-coverage.ts
 *      npx tsx scripts/frequency-coverage.ts --top 3000 --gaps-only
 *      npx tsx scripts/frequency-coverage.ts --json
 *
 * Tags, first hit wins:
 *   root      published concrete / abstract / english_by_pos sense
 *   compound  lexicon-compounds.csv concrete / abstract
 *   overlay   lexicon-overlays.csv gloss
 *   grammar   a gloss or table row in docs/grammar is exactly this word
 *   mention   a gloss or table row mentions it among other English
 *   stop      find-english drops it as a stop word (function word)
 *   example   only appears inside example or practice English
 *   gap       no hit
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";

import { serializeCsv } from "../src/csv.js";
import { collectEnglishEntries, searchEnglish, tokens } from "../src/find/english.js";
import { ensureFrequencyFile } from "../src/lexicon-place.js";
import { parseCompoundCsv, parseOverlayCsv, parsePublishedCsv, posEnglishLemmaList } from "../src/lexicon-search.js";
import { listMarkdown } from "../src/markdown-files.js";
import { loadDefaultTables } from "../src/parse/index.js";
import { dataPath, REPO_ROOT } from "../src/repo-paths.js";

const OUT = join(REPO_ROOT, "tmp", "frequency-coverage.csv");

/** Contraction fragments the subtitle tokenizer splits off. Grammar, not vocabulary. */
const DROP = new Set(["s", "t", "m", "re", "ll", "ve", "d", "don", "didn", "doesn", "isn", "aren", "wasn", "weren", "won", "wouldn", "couldn", "shouldn", "haven", "hasn", "hadn", "ain", "o", "y"]);

const IRREGULAR: Record<string, string> = {
  going: "go", gonna: "go", wanna: "want", gotta: "get", went: "go", gone: "go", goes: "go",
  am: "be", is: "be", are: "be", was: "be", were: "be", been: "be", being: "be",
  has: "have", had: "have", having: "have", does: "do", did: "do", done: "do", doing: "do",
  said: "say", says: "say", made: "make", got: "get", gotten: "get", took: "take", taken: "take",
  came: "come", saw: "see", seen: "see", knew: "know", known: "know", thought: "think",
  told: "tell", gave: "give", given: "give", found: "find", felt: "feel", left: "leave",
  kept: "keep", let: "let", meant: "mean", heard: "hear", brought: "bring", bought: "buy",
  sent: "send", spent: "spend", lost: "lose", paid: "pay", met: "meet", ran: "run",
  sat: "sit", stood: "stand", understood: "understand", wrote: "write", written: "write",
  spoke: "speak", spoken: "speak", broke: "break", broken: "break", chose: "choose", chosen: "choose",
  drove: "drive", driven: "drive", ate: "eat", eaten: "eat", fell: "fall", fallen: "fall",
  forgot: "forget", forgotten: "forget", began: "begin", begun: "begin", held: "hold",
  built: "build", caught: "catch", taught: "teach", fought: "fight", sold: "sell",
  slept: "sleep", woke: "wake", wore: "wear", won: "win", became: "become", hung: "hang",
  lied: "lie", led: "lead", lit: "light", shot: "shoot", stole: "steal", stolen: "steal",
  threw: "throw", thrown: "throw", flew: "fly", grew: "grow", grown: "grow", drew: "draw",
  drank: "drink", sang: "sing", swore: "swear", hid: "hide", hidden: "hide", rode: "ride",
  died: "die", dying: "die", lying: "lie", tied: "tie",
  men: "man", women: "woman", children: "child", people: "person", feet: "foot", teeth: "tooth",
  mice: "mouse", guys: "guy", lives: "life", wives: "wife", knives: "knife",
  better: "good", best: "good", worse: "bad", worst: "bad", more: "much", most: "much",
  less: "little", least: "little", further: "far", farther: "far",
  me: "i", my: "i", mine: "i", myself: "i", him: "he", his: "he", himself: "he",
  her: "she", hers: "she", herself: "she", us: "we", our: "we", ours: "we", ourselves: "we",
  them: "they", their: "they", theirs: "they", themselves: "they", your: "you", yours: "you",
  yourself: "you", its: "it", itself: "it",
};

/** Words that look inflected but are their own lemma. */
const NO_FOLD = new Set(["news", "series", "species", "evening", "wedding", "during", "nothing", "something", "anything", "everything", "morning", "ceiling", "kidding"]);

type Lemma = { lemma: string; count: number; forms: string[] };

function loadCounts(path: string): Map<string, number> {
  const counts = new Map<string, number>();
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const [word, n] = line.trim().split(" ");
    if (word && n && /^[a-z]+$/.test(word) && !counts.has(word)) counts.set(word, Number(n));
  }
  return counts;
}

/** Base form, only when the base is itself listed and more frequent. */
function baseOf(word: string, counts: Map<string, number>): string {
  if (IRREGULAR[word]) return IRREGULAR[word]!;
  const own = counts.get(word) ?? 0;
  if (NO_FOLD.has(word)) return word;
  const ok = (b: string) => b.length >= 3 && (counts.get(b) ?? 0) > own;
  const cands: string[] = [];
  // Inflection only. -er / -est / -ly fold real words (butter → but, early → ear), so they stay separate lemmas.
  const rules: [RegExp, string][] = [[/ies$/, "y"], [/ied$/, "y"], [/es$/, ""], [/s$/, ""], [/ed$/, ""], [/ing$/, ""]];
  for (const [re, rep] of rules) if (re.test(word)) cands.push(word.replace(re, rep));
  // silent e: making → make, used → use (the stem before the e needs three letters: not seed → see)
  const e = word.match(/^(.{3,}?)(ed|ing)$/);
  if (e && !e[1]!.endsWith("e")) cands.push(`${e[1]}e`);
  // doubled consonant: stopped → stop, running → run
  const dbl = word.match(/^(.*([bdglmnprt]))\2(ed|ing)$/);
  if (dbl) cands.push(dbl[1]!);
  const hit = cands.filter(ok).sort((a, b) => (counts.get(b) ?? 0) - (counts.get(a) ?? 0))[0];
  return hit ? baseOf(hit, counts) : word;
}

function lemmatize(counts: Map<string, number>): Lemma[] {
  const byLemma = new Map<string, Lemma>();
  for (const [word, n] of counts) {
    if (DROP.has(word)) continue;
    const lemma = baseOf(word, counts);
    const entry = byLemma.get(lemma) ?? { lemma, count: 0, forms: [] };
    entry.count += n;
    entry.forms.push(word);
    byLemma.set(lemma, entry);
  }
  return [...byLemma.values()].sort((a, b) => b.count - a.count);
}

/** Every sense cell split into single senses, lowercased. */
function senses(cells: string[]): string[] {
  return cells.flatMap((c) => c.toLowerCase().split(/[;,/]|\bor\b/)).map((s) => s.trim()).filter(Boolean);
}

function senseIndex(cells: [string, string][], counts: Map<string, number>): Map<string, string> {
  const idx = new Map<string, string>();
  for (const [cell, label] of cells) {
    for (const sense of senses([cell])) {
      const key = sense.includes(" ") ? sense : baseOf(sense, counts);
      if (!idx.has(key)) idx.set(key, label);
      if (!idx.has(sense)) idx.set(sense, label);
    }
  }
  return idx;
}

const args = process.argv.slice(2);
const top = Number(args[args.indexOf("--top") + 1] || 0) || 3000;
const json = args.includes("--json");
const gapsOnly = args.includes("--gaps-only");

await ensureFrequencyFile();
const counts = loadCounts(join(REPO_ROOT, "tmp", "en_50k.txt"));
const lemmas = lemmatize(counts).slice(0, top);

const published = parsePublishedCsv(readFileSync(dataPath("lexicon-published.csv"), "utf8"));
const rootIdx = senseIndex(
  published.flatMap((r) => [
    [r.concrete, `${r.root} ${r.emoji} ${r.concrete}`] as [string, string],
    [r.abstract, `${r.root} ${r.emoji} ${r.abstract}`] as [string, string],
    ...posEnglishLemmaList(r.posEnglish).map((l) => [l, `${r.root} ${r.emoji} ${l}`] as [string, string]),
  ]),
  counts,
);
const compounds = parseCompoundCsv(readFileSync(dataPath("lexicon-compounds.csv"), "utf8"));
const compoundIdx = senseIndex(
  compounds.flatMap((r) => [[r.concrete, `${r.stem} ${r.concrete}`], [r.abstract, `${r.stem} ${r.abstract}`]] as [string, string][]),
  counts,
);
const overlays = parseOverlayCsv(readFileSync(dataPath("lexicon-overlays.csv"), "utf8"));
const overlayIdx = senseIndex(overlays.map((r) => [r.gloss, `${r.pos}${r.senseForm} ${r.gloss}`] as [string, string]), counts);

const tables = loadDefaultTables();
const entries = listMarkdown("docs/grammar").flatMap((file) =>
  collectEnglishEntries(readFileSync(file, "utf8"), relative(process.cwd(), file), tables),
);

type Row = { rank: number; lemma: string; forms: string; count: number; tag: string; hit: string };
const rows: Row[] = lemmas.map((l, i) => {
  const base = { rank: i + 1, lemma: l.lemma, forms: l.forms.slice(0, 6).join(" "), count: l.count };
  for (const [tag, idx] of [["root", rootIdx], ["compound", compoundIdx], ["overlay", overlayIdx]] as const) {
    const hit = idx.get(l.lemma) ?? l.forms.map((f) => idx.get(f)).find(Boolean);
    if (hit) return { ...base, tag, hit };
  }
  if (tokens(l.lemma).length === 0) return { ...base, tag: "stop", hit: "" };
  const sections = l.forms.slice(0, 3).flatMap((f) => searchEnglish(entries, f));
  const taught = sections
    .flatMap((s) => s.hits)
    .filter((h) => (h.entry.kind === "gloss" || h.entry.kind === "table") && h.score >= 3)
    .sort((a, b) => b.score - a.score || a.entry.tokens.length - b.entry.tokens.length);
  const h = taught[0];
  if (h) return { ...base, tag: h.score >= 4 ? "grammar" : "mention", hit: `${h.entry.page}#${h.entry.slug} \`${h.entry.form}\`` };
  if (sections.length) return { ...base, tag: "example", hit: `${sections[0]!.page}#${sections[0]!.slug}` };
  return { ...base, tag: "gap", hit: "" };
});

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, serializeCsv(["rank", "lemma", "forms", "count", "tag", "hit"], rows));

const shown = gapsOnly ? rows.filter((r) => r.tag === "gap" || r.tag === "example" || r.tag === "mention") : rows;
if (json) console.log(JSON.stringify(shown, null, 2));
else {
  const tally = new Map<string, number>();
  for (const r of rows) tally.set(r.tag, (tally.get(r.tag) ?? 0) + 1);
  console.log(`top ${rows.length} lemmas → ${relative(process.cwd(), OUT)}`);
  for (const [tag, n] of [...tally].sort((a, b) => b[1] - a[1])) console.log(`  ${tag.padEnd(9)} ${n}`);
  if (gapsOnly) for (const r of shown) console.log(`${String(r.rank).padStart(5)}  ${r.tag.padEnd(8)} ${r.lemma}`);
}
