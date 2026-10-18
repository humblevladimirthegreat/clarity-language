/**
 * Coverage of the New General Service List (NGSL 1.2: 2809 lemmas, about 92% of general
 * English, CC BY-SA 4.0) against the lexicon CSVs and the grammar docs. The two NGSL files
 * are downloaded into tmp/ on first run.
 *
 * Run: npx tsx scripts/frequency-coverage.ts
 *      npx tsx scripts/frequency-coverage.ts --gaps-only
 *      npx tsx scripts/frequency-coverage.ts --json
 *
 * Tags, first hit wins (root through overlay are the shared ladder in src/english-helper/lexicon.ts):
 *   root      published concrete / abstract / english_by_pos sense
 *   alias     published english_aliases synonym (search-only; not a sense match)
 *   compound  lexicon-compounds.csv concrete / abstract
 *   overlay   lexicon-overlays.csv gloss
 *   grammar   a gloss or table row in docs/grammar is exactly this word
 *   mention   a gloss or table row mentions it among other English (unreviewed)
 *   example   only appears inside example or practice English
 *   stop      find-english drops it as a stop word (function word)
 *   gap       no hit
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";

import { parseCsv, serializeCsv } from "../src/csv.js";
import { loadGrammarEntries } from "../src/find/entries-cache.js";
import { searchEnglish, tokens } from "../src/find/english.js";
import { buildLexiconIndex, lookupLexicon, type LexiconSuggestion } from "../src/english-helper/lexicon.js";
import { parseCompoundCsv, parseOverlayCsv, parsePublishedCsv } from "../src/lexicon-search.js";
import { dataPath, REPO_ROOT } from "../src/repo-paths.js";

const NGSL_URL = "https://www.newgeneralservicelist.com/s/";
const STATS = join(REPO_ROOT, "tmp", "NGSL_12_stats.csv");
const FORMS = join(REPO_ROOT, "tmp", "NGSL_12_lemmatized_for_research.csv");
const OUT = join(REPO_ROOT, "tmp", "frequency-coverage.csv");

async function ensure(path: string): Promise<string> {
  if (!existsSync(path)) {
    const url = NGSL_URL + path.split("/").pop();
    const res = await fetch(url);
    if (!res.ok) throw new Error(`fetch ${url}: ${res.status}`);
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, await res.text());
  }
  return readFileSync(path, "utf8").replace(/^﻿/, "").replace(/\r/g, "");
}

type Lemma = { rank: number; lemma: string; perMillion: number; forms: string[] };

async function loadNgsl(): Promise<Lemma[]> {
  const forms = new Map<string, string[]>();
  for (const line of (await ensure(FORMS)).split("\n")) {
    if (!line.trim() || line.startsWith("#")) continue;
    const [head, ...rest] = line.split(",").map((w) => w.trim().toLowerCase());
    if (head) forms.set(head, rest.filter(Boolean));
  }
  return parseCsv(await ensure(STATS)).rows.map((r) => {
    const lemma = r["Lemma"]!.trim().toLowerCase();
    return { rank: Number(r["SFI Rank"]), lemma, perMillion: Number(r["Adjusted Frequency per Million (U)"]), forms: forms.get(lemma) ?? [] };
  });
}

const args = process.argv.slice(2);
const json = args.includes("--json");
const gapsOnly = args.includes("--gaps-only");

const lemmas = await loadNgsl();

const published = parsePublishedCsv(readFileSync(dataPath("lexicon-published.csv"), "utf8"));
const compounds = parseCompoundCsv(readFileSync(dataPath("lexicon-compounds.csv"), "utf8"));
const overlays = parseOverlayCsv(readFileSync(dataPath("lexicon-overlays.csv"), "utf8"));
const lexicon = buildLexiconIndex(published, compounds, overlays);

function label(s: LexiconSuggestion, english: string): string {
  if (s.tier === "overlay") return `${s.pos}${s.form} ${s.sense}`;
  if (s.tier === "compound") return `${s.form} ${s.sense}`;
  return `${s.form} ${s.emoji} ${english}`;
}

const entries = loadGrammarEntries();

type Row = { rank: number; lemma: string; per_million: number; tag: string; hit: string };
const rows: Row[] = lemmas.map((l) => {
  const base = { rank: l.rank, lemma: l.lemma, per_million: l.perMillion };
  const words = [l.lemma, ...l.forms];
  const best = lookupLexicon(lexicon, words)[0];
  if (best) return { ...base, tag: best.tier, hit: label(best, words.find((w) => lexicon.get(w)?.includes(best)) ?? l.lemma) };
  if (tokens(l.lemma).length === 0) return { ...base, tag: "stop", hit: "" };
  const sections = words.slice(0, 4).flatMap((w) => searchEnglish(entries, w));
  const h = sections
    .flatMap((s) => s.hits)
    .filter((x) => (x.entry.kind === "gloss" || x.entry.kind === "table") && x.score >= 3)
    .sort((a, b) => b.score - a.score || a.entry.tokens.length - b.entry.tokens.length)[0];
  if (h && h.score >= 4) return { ...base, tag: "grammar", hit: `${h.entry.page}#${h.entry.slug} \`${h.entry.form}\`` };
  if (h) return { ...base, tag: "mention", hit: `${h.entry.page}#${h.entry.slug} \`${h.entry.form}\`` };
  if (sections.length) return { ...base, tag: "example", hit: `${sections[0]!.page}#${sections[0]!.slug}` };
  return { ...base, tag: "gap", hit: "" };
});

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, serializeCsv(["rank", "lemma", "per_million", "tag", "hit"], rows));

const shown = gapsOnly ? rows.filter((r) => ["gap", "example", "mention"].includes(r.tag)) : rows;
if (json) console.log(JSON.stringify(shown, null, 2));
else {
  const tally = new Map<string, number>();
  for (const r of rows) tally.set(r.tag, (tally.get(r.tag) ?? 0) + 1);
  console.log(`NGSL ${rows.length} lemmas → ${relative(process.cwd(), OUT)}`);
  for (const [tag, n] of [...tally].sort((a, b) => b[1] - a[1])) console.log(`  ${tag.padEnd(9)} ${n}`);
  if (gapsOnly) for (const r of shown) console.log(`${String(r.rank).padStart(5)}  ${r.tag.padEnd(8)} ${r.lemma}`);
}
