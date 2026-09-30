/**
 * Coverage of the New General Service List (NGSL 1.2) against the lexicon CSVs
 * and the grammar docs. See the proposal ngsl-lexicon-fill.md.
 *
 * Run: npx tsx scripts/frequency-coverage.ts
 *      npx tsx scripts/frequency-coverage.ts --gaps-only
 *      npx tsx scripts/frequency-coverage.ts --json
 *      npx tsx scripts/frequency-coverage.ts --candidates   (also writes the triage file)
 *
 * Tags, first hit wins:
 *   root      published concrete / abstract / english_by_pos sense
 *   compound  lexicon-compounds.csv concrete / abstract
 *   overlay   lexicon-overlays.csv gloss
 *   grammar   a gloss or table row in docs/grammar is exactly this word
 *   covered   the mentions file says a grammar section teaches it
 *   mention   a gloss or table row mentions it among other English (unreviewed)
 *   example   only appears inside example or practice English
 *   stop      find-english drops it as a stop word (function word)
 *   gap       no hit, or reviewed as a gap in the mentions file
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";

import { parseCsv, serializeCsv } from "../src/csv.js";
import { collectEnglishEntries, searchEnglish, tokens } from "../src/find/english.js";
import { parseCompoundCsv, parseOverlayCsv, parsePublishedCsv, posEnglishLemmaList } from "../src/lexicon-search.js";
import { listMarkdown } from "../src/markdown-files.js";
import { loadDefaultTables } from "../src/parse/index.js";
import { dataPath, REPO_ROOT } from "../src/repo-paths.js";

const NGSL_URL = "https://www.newgeneralservicelist.com/s/";
const STATS = join(REPO_ROOT, "tmp", "NGSL_12_stats.csv");
const FORMS = join(REPO_ROOT, "tmp", "NGSL_12_lemmatized_for_research.csv");
const MENTIONS = join(REPO_ROOT, "docs", "proposals", "ngsl-lexicon-mentions.csv");
const OUT = join(REPO_ROOT, "tmp", "frequency-coverage.csv");
const TRIAGE = join(REPO_ROOT, "docs", "proposals", "ngsl-lexicon-triage.csv");
const TRIAGE_HEADERS = ["rank", "lemma", "sense", "stage", "candidates", "grammar_leads", "fix", "proposal", "note"];

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

/** Every sense cell split into single senses, lowercased. */
function senseIndex(cells: [string, string][]): Map<string, string> {
  const idx = new Map<string, string>();
  for (const [cell, label] of cells) {
    for (const sense of cell.toLowerCase().split(/[;,/]|\bor\b/).map((s) => s.trim()).filter(Boolean)) {
      if (!idx.has(sense)) idx.set(sense, label);
    }
  }
  return idx;
}

function loadVerdicts(): Map<string, { verdict: string; section: string }> {
  const out = new Map<string, { verdict: string; section: string }>();
  if (!existsSync(MENTIONS)) return out;
  for (const r of parseCsv(readFileSync(MENTIONS, "utf8")).rows) out.set(r["lemma"]!, { verdict: r["verdict"]!, section: r["section"] ?? "" });
  return out;
}

const args = process.argv.slice(2);
const json = args.includes("--json");
const gapsOnly = args.includes("--gaps-only");

const lemmas = await loadNgsl();

const published = parsePublishedCsv(readFileSync(dataPath("lexicon-published.csv"), "utf8"));
const rootIdx = senseIndex(
  published.flatMap((r) => [
    [r.concrete, `${r.root} ${r.emoji} ${r.concrete}`] as [string, string],
    [r.abstract, `${r.root} ${r.emoji} ${r.abstract}`] as [string, string],
    ...posEnglishLemmaList(r.posEnglish).map((l) => [l, `${r.root} ${r.emoji} ${l}`] as [string, string]),
  ]),
);
const compounds = parseCompoundCsv(readFileSync(dataPath("lexicon-compounds.csv"), "utf8"));
const compoundIdx = senseIndex(
  compounds.flatMap((r) => [[r.concrete, `${r.stem} ${r.concrete}`], [r.abstract, `${r.stem} ${r.abstract}`]] as [string, string][]),
);
const overlays = parseOverlayCsv(readFileSync(dataPath("lexicon-overlays.csv"), "utf8"));
const overlayIdx = senseIndex(overlays.map((r) => [r.gloss, `${r.pos}${r.senseForm} ${r.gloss}`] as [string, string]));

const tables = loadDefaultTables();
const entries = listMarkdown("docs/grammar").flatMap((file) =>
  collectEnglishEntries(readFileSync(file, "utf8"), relative(process.cwd(), file), tables),
);
const verdicts = loadVerdicts();

type Row = { rank: number; lemma: string; per_million: number; tag: string; hit: string };
const rows: Row[] = lemmas.map((l) => {
  const base = { rank: l.rank, lemma: l.lemma, per_million: l.perMillion };
  const words = [l.lemma, ...l.forms];
  for (const [tag, idx] of [["root", rootIdx], ["compound", compoundIdx], ["overlay", overlayIdx]] as const) {
    const hit = words.map((w) => idx.get(w)).find(Boolean);
    if (hit) return { ...base, tag, hit };
  }
  if (tokens(l.lemma).length === 0) return { ...base, tag: "stop", hit: "" };
  const sections = words.slice(0, 4).flatMap((w) => searchEnglish(entries, w));
  const h = sections
    .flatMap((s) => s.hits)
    .filter((x) => (x.entry.kind === "gloss" || x.entry.kind === "table") && x.score >= 3)
    .sort((a, b) => b.score - a.score || a.entry.tokens.length - b.entry.tokens.length)[0];
  if (h && h.score >= 4) return { ...base, tag: "grammar", hit: `${h.entry.page}#${h.entry.slug} \`${h.entry.form}\`` };
  const v = verdicts.get(l.lemma);
  if (v) return { ...base, tag: v.verdict === "covered" ? "covered" : "gap", hit: v.section };
  if (h) return { ...base, tag: "mention", hit: `${h.entry.page}#${h.entry.slug} \`${h.entry.form}\`` };
  if (sections.length) return { ...base, tag: "example", hit: `${sections[0]!.page}#${sections[0]!.slug}` };
  return { ...base, tag: "gap", hit: "" };
});

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, serializeCsv(["rank", "lemma", "per_million", "tag", "hit"], rows));

/** WordNet 3.0 synonyms: lemma → every word sharing a synset with it (any part of speech). */
function loadWordNetSynonyms(): Map<string, Set<string>> {
  const dir = join(REPO_ROOT, "tmp", "WordNet-3.0", "dict");
  const syn = new Map<string, Set<string>>();
  if (!existsSync(dir)) throw new Error(`missing ${dir}: extract WordNet-3.0.tar.gz (wordnetcode.princeton.edu/3.0) into tmp/`);
  for (const pos of ["noun", "verb", "adj", "adv"]) {
    for (const line of readFileSync(join(dir, `data.${pos}`), "utf8").split("\n")) {
      if (!line || line.startsWith(" ")) continue;
      const f = line.split(" ");
      const n = parseInt(f[3]!, 16);
      const words = Array.from({ length: n }, (_, i) => f[4 + i * 2]!.toLowerCase().replace(/\(.*\)$/, "").replace(/_/g, " "));
      for (const w of words) {
        const set = syn.get(w) ?? new Set<string>();
        for (const o of words) if (o !== w) set.add(o);
        syn.set(w, set);
      }
    }
  }
  return syn;
}

/**
 * Published rows whose concrete or abstract sense is a WordNet synonym of the lemma.
 * Candidates for the synonym / new-sense triage, not decisions.
 */
function candidates(l: Lemma, synonyms: Map<string, Set<string>>): string {
  const syn = synonyms.get(l.lemma) ?? new Set<string>();
  const hits: string[] = [];
  for (const [sense, label] of rootIdx) if (syn.has(sense) && !hits.includes(label)) hits.push(`${label} (${sense})`);
  return hits.slice(0, 8).join("; ");
}

/**
 * Pre-filter for the translation test: grammar rows that teach one of the lemma's
 * forms or WordNet synonyms (gloss or table row, word run inside it). Leads, not verdicts.
 */
function grammarLeads(l: Lemma, synonyms: Map<string, Set<string>>): string {
  const own = new Set([l.lemma, ...l.forms]);
  const cues = [...own, ...[...(synonyms.get(l.lemma) ?? [])].filter((w) => !own.has(w) && tokens(w).length > 0)];
  const seen = new Set<string>();
  const leads: { score: number; text: string }[] = [];
  for (const cue of cues) {
    for (const s of searchEnglish(entries, cue)) {
      for (const h of s.hits) {
        if ((h.entry.kind !== "gloss" && h.entry.kind !== "table") || h.score < 3 || h.via) continue;
        const key = `${h.entry.page}#${h.entry.slug}`;
        if (seen.has(key)) continue;
        seen.add(key);
        const via = own.has(cue) ? "" : ` (via ${cue})`;
        leads.push({ score: h.score - (via ? 0.5 : 0), text: `${key.replace("docs/grammar/", "")} \`${h.entry.form}\`${via}` });
      }
    }
  }
  return leads.sort((a, b) => b.score - a.score).slice(0, 4).map((x) => x.text).join("; ");
}

/** `translate` when a root candidate or grammar lead might already cover it; `triage` when neither does. */
function stageOf(cand: string, leads: string): string {
  return cand || leads ? "translate" : "triage";
}

if (args.includes("--candidates")) {
  // Keep triage decisions already written; refresh only the candidates column.
  const kept = new Map<string, Record<string, string>>();
  if (existsSync(TRIAGE)) for (const r of parseCsv(readFileSync(TRIAGE, "utf8")).rows) kept.set(`${r["lemma"]}|${r["sense"]}`, r);
  const byLemma = new Map(lemmas.map((l) => [l.lemma, l]));
  const synonyms = loadWordNetSynonyms();
  const out: Record<string, string>[] = [];
  for (const r of rows.filter((x) => x.tag === "gap" || x.tag === "example")) {
    const prior = [...kept.values()].filter((k) => k["lemma"] === r.lemma);
    const cand = candidates(byLemma.get(r.lemma)!, synonyms);
    const leads = grammarLeads(byLemma.get(r.lemma)!, synonyms);
    if (prior.length) for (const k of prior) out.push({ ...k, rank: String(r.rank), stage: k["stage"] || stageOf(cand, leads), candidates: cand, grammar_leads: leads });
    else out.push({ rank: String(r.rank), lemma: r.lemma, sense: "", stage: stageOf(cand, leads), candidates: cand, grammar_leads: leads, fix: "", proposal: "", note: r.tag === "example" ? "example only" : "" });
  }
  writeFileSync(TRIAGE, serializeCsv(TRIAGE_HEADERS, out));
  console.log(`${out.length} triage rows → ${relative(process.cwd(), TRIAGE)} (${out.filter((o) => o["candidates"]).length} with root candidates, ${out.filter((o) => o["grammar_leads"]).length} with grammar leads, ${out.filter((o) => !o["candidates"] && !o["grammar_leads"]).length} with neither)`);
}

const shown = gapsOnly ? rows.filter((r) => ["gap", "example", "mention"].includes(r.tag)) : rows;
if (json) console.log(JSON.stringify(shown, null, 2));
else {
  const tally = new Map<string, number>();
  for (const r of rows) tally.set(r.tag, (tally.get(r.tag) ?? 0) + 1);
  console.log(`NGSL ${rows.length} lemmas → ${relative(process.cwd(), OUT)}`);
  for (const [tag, n] of [...tally].sort((a, b) => b[1] - a[1])) console.log(`  ${tag.padEnd(9)} ${n}`);
  if (gapsOnly) for (const r of shown) console.log(`${String(r.rank).padStart(5)}  ${r.tag.padEnd(8)} ${r.lemma}`);
}
