/**
 * Tooling for the head-by-head compound pass (docs/meta/lexicon.md, "Adding compounds").
 * Roots are named by seed or English label, never by spelling.
 *
 * Run: npm run compound-fill -- heads                       (heads by compound count)
 *      npm run compound-fill -- heads 🐦 bird house          (one head: its row and compounds)
 *      npm run compound-fill -- synsets herb spice           (WordNet noun senses, to pick a synset)
 *      npm run compound-fill -- candidates herb.n.02 spice.n.02 [--depth N] [--max-rank N] [--all] [--triage]
 *      npm run compound-fill -- check basil mint parsley     (or `-` for one word per line on stdin)
 *      npm run compound-fill -- draft path/to/draft.csv [--write]
 *
 * candidates: hyponyms ranked by word frequency (a multiword lemma counts as unranked); covered
 * senses are hidden unless --all. For a broad head (bird.n.01) walk deep with a rank cap:
 * --depth 8 --max-rank 15000.
 *
 * Add --json to any command. The draft CSV has the header
 *   english,left,join,head,abstract,mnemonic
 * where `left` and `head` are seeds or English labels and `join` is l, m, n, or r.
 */
import { readFileSync, writeFileSync } from "node:fs";

import {
  DRAFT_HEADERS,
  describeRow,
  draftCompounds,
  headCounts,
  headReport,
  mnemonicPrefix,
  resolveCue,
  senseCoverage,
  type CoverageHit,
  type DraftRow,
  type Lexicon,
} from "../src/compound-fill.js";
import { parseCsv } from "../src/csv.js";
import { parseCompoundCsv, serializeCompoundCsv } from "../src/lexicon-compounds.js";
import { parseOverlayCsv, parsePublishedCsv } from "../src/lexicon-search.js";
import { ensureFrequencyFile, loadFrequencyRanks } from "../src/lexicon-place.js";
import { dataPath, REPO_ROOT } from "../src/repo-paths.js";
import { ensureWordnet, NounWordnet } from "../src/wordnet.js";

const compoundsPath = dataPath("lexicon-compounds.csv");
const TRIAGE = `${REPO_ROOT}/docs/proposals/ngsl-lexicon-triage.csv`;
/** Rank for a lemma outside the 50k frequency list, multiword lemmas included. */
const UNRANKED = 50001;

function usage(): never {
  console.error(readFileSync(new URL(import.meta.url), "utf8").split("*/")[0]!.replace(/^\/\*\*|^ \* ?/gm, ""));
  process.exit(2);
}

function loadLexicon(): Lexicon {
  return {
    published: parsePublishedCsv(readFileSync(dataPath("lexicon-published.csv"), "utf8")),
    compounds: parseCompoundCsv(readFileSync(compoundsPath, "utf8")),
    overlays: parseOverlayCsv(readFileSync(dataPath("lexicon-overlays.csv"), "utf8")),
  };
}

function table(headers: string[], rows: string[][]): string {
  const cell = (s: string) => s.replace(/\|/g, "\\|");
  return [
    `| ${headers.join(" | ")} |`,
    `|${headers.map(() => "---").join("|")}|`,
    ...rows.map((row) => `| ${row.map(cell).join(" | ")} |`),
  ].join("\n");
}

function formatHits(hits: CoverageHit[]): string {
  return hits.map((h) => `${h.kind}: ${h.label} (${h.form})`).join("; ") || "—";
}

function heads(cues: string[], lexicon: Lexicon, json: boolean): number {
  const byRoot = new Map(lexicon.published.map((row) => [row.root, row]));
  const label = (root: string) => (byRoot.get(root) ? describeRow(byRoot.get(root)!) : root);
  if (cues.length === 0) {
    const counts = headCounts(lexicon);
    if (json) {
      console.log(JSON.stringify(counts.map((c) => ({ ...c.row, count: c.count })), null, 2));
    } else {
      console.log(table(["head", "compounds"], counts.map((c) => [describeRow(c.row), String(c.count)])));
    }
    return 0;
  }
  let failed = 0;
  const reports = [];
  for (const cue of cues) {
    const hit = resolveCue(cue, lexicon.published);
    if (!hit.ok) {
      failed++;
      console.error(`${hit.reason}${hit.matches.length ? `: ${hit.matches.map(describeRow).join("; ")}` : ""}`);
      continue;
    }
    const report = headReport(hit.row, lexicon.compounds);
    reports.push(report);
    if (json) continue;
    console.log(`## ${describeRow(hit.row)} (${hit.row.root}, matched by ${hit.via})`);
    if (report.generic) console.log("Generic head: only for a class name no narrower root covers.");
    if (hit.row.englishAliases?.length) console.log(`Aliases: ${hit.row.englishAliases.join("; ")}`);
    console.log("");
    console.log(
      report.headed.length
        ? table(
            ["compound", "left", "join", "stem", "abstract"],
            report.headed.map((c) => [c.concrete, label(c.left), c.join, c.stem, c.abstract || "—"]),
          )
        : "No compounds on this head yet.",
    );
    if (report.modifying.length) {
      console.log(`\nAs left root: ${report.modifying.map((c) => c.concrete).join(", ")}`);
    }
    console.log("");
  }
  if (json) console.log(JSON.stringify(reports, null, 2));
  return failed ? 1 : 0;
}

function check(words: string[], lexicon: Lexicon, json: boolean): number {
  const rows = words.map((word) => ({ word, hits: senseCoverage(word, lexicon) }));
  if (json) console.log(JSON.stringify(rows, null, 2));
  else console.log(table(["word", "covered by"], rows.map((r) => [r.word, formatHits(r.hits)])));
  return 0;
}

async function synsets(lemmas: string[], json: boolean): Promise<number> {
  const wordnet = new NounWordnet(await ensureWordnet());
  const rows = lemmas.flatMap((lemma) =>
    wordnet.lookup(lemma).map((synset, i) => ({
      name: `${lemma.replace(/ /g, "_")}.n.${String(i + 1).padStart(2, "0")}`,
      words: synset.words,
      hyponyms: synset.hyponyms.length,
      gloss: synset.gloss,
    })),
  );
  if (json) console.log(JSON.stringify(rows, null, 2));
  else {
    console.log(
      table(
        ["synset", "words", "direct hyponyms", "gloss"],
        rows.map((r) => [r.name, r.words.join(", "), String(r.hyponyms), r.gloss.split(";")[0]!]),
      ),
    );
  }
  return rows.length ? 0 : 1;
}

type Candidate = {
  word: string;
  synonyms: string[];
  source: string;
  gloss: string;
  rank: number;
  hits: CoverageHit[];
};

async function candidates(
  synsets: string[],
  options: { depth: number; maxRank: number; all: boolean; triage: boolean },
  lexicon: Lexicon,
  json: boolean,
): Promise<number> {
  await ensureFrequencyFile();
  const freq = loadFrequencyRanks();
  const wordnet = synsets.length ? new NounWordnet(await ensureWordnet()) : undefined;
  const found = new Map<string, Candidate>();
  const add = (words: string[], source: string, gloss: string, rank?: number) => {
    const lemmas = words.filter((w) => w === w.toLowerCase());
    const word = lemmas[0];
    if (!word || found.has(word)) return;
    const hits = lemmas.flatMap((w) => senseCoverage(w, lexicon));
    const best = Math.min(...lemmas.map((w) => freq.get(w) ?? UNRANKED));
    found.set(word, { word, synonyms: lemmas.slice(1), source, gloss, rank: rank ?? best, hits });
  };

  let failed = 0;
  for (const name of synsets) {
    const roots = wordnet!.lookup(name);
    if (roots.length === 0) {
      failed++;
      console.error(`No WordNet noun synset for ${name}`);
      continue;
    }
    for (const root of roots) {
      for (const child of wordnet!.hyponyms(root, options.depth)) {
        add(child.words, `${name}${child.depth > 1 ? ` (depth ${child.depth})` : ""}`, child.gloss);
      }
    }
  }
  if (options.triage) {
    for (const row of parseCsv(readFileSync(TRIAGE, "utf8")).rows) {
      if (row.fix !== "Compound" || /^(Not )?applied/i.test(row.note ?? "")) continue;
      add([row.lemma!], "ngsl-triage", row.proposal ?? "", Number(row.rank));
    }
  }

  const list = [...found.values()].sort((a, b) => a.rank - b.rank || a.word.localeCompare(b.word));
  const ranked = list.filter((c) => c.rank <= options.maxRank);
  const shown = options.all ? ranked : ranked.filter((c) => c.hits.length === 0);
  if (json) {
    console.log(JSON.stringify(shown, null, 2));
  } else {
    console.log(
      table(
        ["word", "rank", "also", "source", "gloss", ...(options.all ? ["covered by"] : [])],
        shown.map((c) => [
          c.word,
          String(c.rank),
          c.synonyms.join(", ") || "—",
          c.source,
          c.gloss.split(";")[0]!.slice(0, 80),
          ...(options.all ? [formatHits(c.hits)] : []),
        ]),
      ),
    );
    const covered = ranked.length - ranked.filter((c) => c.hits.length === 0).length;
    if (!options.all && covered) console.log(`\n${covered} candidate(s) already covered; --all shows them.`);
  }
  return failed ? 1 : 0;
}

function draft(path: string, write: boolean, lexicon: Lexicon, json: boolean): number {
  const { headers, rows } = parseCsv(readFileSync(path, "utf8"));
  if (headers.join(",") !== DRAFT_HEADERS.join(",")) {
    throw new Error(`Draft header must be ${DRAFT_HEADERS.join(",")} (got ${headers.join(",")})`);
  }
  const drafts = rows.map((r) => Object.fromEntries(DRAFT_HEADERS.map((h) => [h, r[h] ?? ""])) as DraftRow);
  const results = draftCompounds(drafts, lexicon);
  const bad = results.filter((r) => r.errors.length);

  if (json) {
    console.log(JSON.stringify(results, null, 2));
  } else {
    console.log(
      table(
        ["English", "left", "boundary", "head", "stem", "abstract", "mnemonic", "problems"],
        results.map((r) => [
          r.draft.english,
          r.leftRow ? describeRow(r.leftRow) : r.draft.left,
          r.draft.join,
          r.headRow ? describeRow(r.headRow) : r.draft.head,
          r.compound?.stem ?? "—",
          r.draft.abstract || "—",
          r.draft.mnemonic ||
            (r.leftRow && r.headRow ? `(${mnemonicPrefix(r.leftRow, r.draft.join.replace(/^-/, ""), r.headRow)} is …)` : "—"),
          [...r.errors.map((e) => `**${e}**`), ...r.warnings].join("; ") || "—",
        ]),
      ),
    );
  }

  if (!write) return bad.length ? 1 : 0;
  if (bad.length) {
    console.error(`\nNot written: ${bad.length} draft row(s) have errors.`);
    return 1;
  }
  const next = [...lexicon.compounds, ...results.map((r) => r.compound!)];
  writeFileSync(compoundsPath, serializeCompoundCsv(next));
  console.error(
    `\nAppended ${results.length} row(s) to data/lexicon-compounds.csv. ` +
      "Next: npm run check-compounds, npm test, npm run cheat-sheet-blocks -- --write.",
  );
  return 0;
}

async function main(): Promise<number> {
  const args = process.argv.slice(2);
  const flag = (name: string) => {
    const at = args.indexOf(name);
    if (at < 0) return false;
    args.splice(at, 1);
    return true;
  };
  const value = (name: string) => {
    const at = args.indexOf(name);
    if (at < 0) return undefined;
    const [, v] = args.splice(at, 2);
    return v;
  };
  if (flag("--help") || flag("-h")) usage();
  const json = flag("--json");
  const all = flag("--all");
  const triage = flag("--triage");
  const write = flag("--write");
  const depth = Number(value("--depth") ?? 1);
  const maxRank = Number(value("--max-rank") ?? Infinity);
  const [command, ...rest] = args;
  const lexicon = loadLexicon();

  switch (command) {
    case "synsets":
      if (rest.length === 0) usage();
      return synsets(rest, json);
    case "heads":
      return heads(rest, lexicon, json);
    case "check": {
      const words = rest.length === 1 && rest[0] === "-"
        ? readFileSync(0, "utf8").split("\n").map((w) => w.trim()).filter(Boolean)
        : rest;
      if (words.length === 0) usage();
      return check(words, lexicon, json);
    }
    case "candidates": {
      if (rest.length === 0 && !triage) usage();
      return candidates(rest, { depth, maxRank, all, triage }, lexicon, json);
    }
    case "draft": {
      const path = rest[0];
      if (!path) usage();
      return draft(path, write, lexicon, json);
    }
    default:
      usage();
  }
}

main().then(
  (code) => process.exit(code),
  (err) => {
    console.error(err instanceof Error ? err.message : String(err));
    process.exit(1);
  },
);
