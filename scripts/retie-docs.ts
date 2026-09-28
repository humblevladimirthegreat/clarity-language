/**
 * Retie Agalan in the docs, AGENTS.md / README.md, and source string literals
 * from the map dumped by convert-word --lexicon (which already retied the lexicon CSVs).
 *
 * Run: npm run retie-docs
 *      npm run retie-docs -- --write
 *      npm run retie-docs -- --map tmp/lexicon-retie-map.json --write
 *
 * Only spans the doc lint reads as Agalan are rewritten (plus emphasised prose runs that parse
 * as an Agalan sentence or phrase); other hits are listed for review. English copies follow
 * their Agalan: named-word names, quoted payloads, morph lines, and heading anchors.
 * A rewrite that stops parsing, moves an unmapped root, or rebinds a resume blocks `--write`,
 * as does a map whose old spellings the word grammar cannot read or that was already applied.
 */
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { basename, dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

import { CLOSED_ENTRIES } from "../src/closed-roots.js";
import { parseCompoundCsv, validateCompoundRows } from "../src/lexicon-compounds.js";
import { ensureFrequencyFile, loadFrequencyRanks } from "../src/lexicon-place.js";
import { fillSelf } from "../src/learner-name.js";
import { ENGLISH_IN_CODE, lintAgalanMarkdown, lintAgalanSpans } from "../src/lint/agalan-docs.js";
import { formatMorphGlossFinding, lintMorphGlossMarkdown } from "../src/lint/morph-gloss-docs.js";
import { formatNumberSpeechFinding, lintNumberSpeechMarkdown, NUMBER_SPEECH_FILES } from "../src/lint/number-speech-docs.js";
import { formatWordBankFinding, lintWordBankMarkdown } from "../src/lint/word-bank-docs.js";
import { hasClosedOverlay, type ClassifyTables } from "../src/parse/classify.js";
import { loadDefaultTables, morphGlossLine } from "../src/parse/index.js";
import { parseWord } from "../src/parse/word.js";
import { headingIdRenames, relinkMarkdown, relinkOverlayAnchors, type AnchorRenames } from "../src/retie/anchors.js";
import { mergeFollowPairs } from "../src/retie/follow.js";
import { finishFollow, rewriteMarkdown, type RetieMarkdownResult } from "../src/retie/markdown.js";
import {
  checkMapCollisions,
  parseRetieMapJson,
  RETIE_MAP_RELATIVE_PATH,
  unreadableOldRoots,
} from "../src/retie/map.js";
import { retieCore } from "../src/retie/rebuild.js";
import { antecedentStemRoots } from "../src/retie/resume.js";
import { rewriteSourceLiterals } from "../src/retie/source.js";
import { forEachMarkdownCodeToken, lineNumberAt, peelChunk } from "../src/retie/tokens.js";
import { lexiconConverted, retieTables, type RetieTables } from "../src/retie/tables.js";
import { verifyRetiedSpans } from "../src/retie/verify.js";

const rootDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const markdownDirs = [
  join(rootDir, "docs", "grammar"),
  join(rootDir, "docs", "examples"),
  join(rootDir, "docs", "meta"),
];
/** TODO.md is planning notes and is never retied. */
const topLevelMarkdown = ["AGENTS.md", "README.md"].map((name) => join(rootDir, name));
/** Page-level opt-out for records of past spellings (the marker on a line of its own, not quoted in prose). */
const RETIE_SKIP_RE = /^<!--\s*retie:\s*skip\s*-->\s*$/m;
const compoundsPath = join(rootDir, "data", "lexicon-compounds.csv");
const overlaysPath = join(rootDir, "data", "lexicon-overlays.csv");
const grammarDir = join(rootDir, "docs", "grammar");
/** Source whose string literals hold Agalan. The retie tool's own tests use their own maps. */
const sourceDirs = [join(rootDir, "src"), join(rootDir, "scripts"), join(grammarDir, ".vitepress")];
/** Skipped by the source scan. `closed-roots.ts` is resynced by emoji in `convert-word --lexicon`. */
const SOURCE_SKIP = [
  join(rootDir, "src", "retie"),
  join(rootDir, "src", "generated"),
  join(rootDir, "scripts", "retie-docs.ts"),
  join(rootDir, "src", "closed-roots.ts"),
  join(rootDir, "src", "closed-roots.test.ts"),
];
/** Frequency rank below which a word counts as common English for review. */
const COMMON_ENGLISH_RANK = 30000;

type CliOptions = {
  mapPath: string;
  write: boolean;
  force: boolean;
};

function parseArgs(argv: string[]): CliOptions {
  let mapPath = join(rootDir, RETIE_MAP_RELATIVE_PATH);
  let write = false;
  let force = false;

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]!;
    if (arg === "--write") {
      write = true;
      continue;
    }
    if (arg === "--force") {
      force = true;
      continue;
    }
    if (arg === "--map") {
      const value = argv[++i];
      if (!value) {
        throw new Error("Missing value for --map");
      }
      mapPath = value;
      continue;
    }
    if (arg === "--help" || arg === "-h") {
      printUsage();
      process.exit(0);
    }
    throw new Error(`Unknown argument: ${arg}`);
  }

  return { mapPath, write, force };
}

function printUsage(): void {
  console.error(`Usage: npm run retie-docs -- [--map PATH] [--write] [--force]

Reads ${RETIE_MAP_RELATIVE_PATH} (from convert-word --lexicon) and reties Agalan in
docs/grammar/, docs/examples/, docs/meta/, AGENTS.md, README.md, string literals
under src/ (tests included), scripts/ and the grammar site, and overlay anchors.
convert-word --lexicon already retied the lexicon CSVs; this only checks them.
Default is a dry-run. --write refuses on a blocking finding (map collision, unreadable old
spelling, map already applied, parse or resume-bind change), unless --force.`);
}

function listSource(dir: string): string[] {
  if (!existsSync(dir) || SOURCE_SKIP.some((skip) => dir === skip)) {
    return [];
  }
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (name === "node_modules" || name === "cache" || name === "dist" || SOURCE_SKIP.includes(full)) {
      continue;
    }
    if (statSync(full).isDirectory()) {
      out.push(...listSource(full));
    } else if (/\.(ts|mts|mjs|vue)$/.test(name) && !name.endsWith(".d.ts")) {
      out.push(full);
    }
  }
  return out.sort();
}

function listMarkdown(dir: string): string[] {
  if (!existsSync(dir)) {
    return [];
  }
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    if (name === ".vitepress" || name === "public") {
      continue;
    }
    const full = join(dir, name);
    if (statSync(full).isDirectory()) {
      out.push(...listMarkdown(full));
    } else if (name.endsWith(".md")) {
      out.push(full);
    }
  }
  return out.sort();
}

/** Content roots spelled in code across the docs, for the collision check. */
/** Content roots of non-resume words in the docs. */
function rootsInUse(texts: string[]): Set<string> {
  const roots = new Set<string>();
  for (const text of texts) {
    forEachMarkdownCodeToken(text, ({ chunk }) => {
      const { core } = peelChunk(chunk);
      try {
        for (const root of antecedentStemRoots(parseWord(core))) roots.add(root);
      } catch {
        // not an Agalan word
      }
    });
  }
  return roots;
}

/**
 * Bare short resumes (a code span that is just the word, as in prose) whose reading the retie changed:
 * with no earlier word to bind, a resume reads as its stem's root, and the retie may have made that
 * stem another row's root (`zodor` ←dog became ←door). A resume inside a sentence is covered by the
 * per-span bind check. Code spans pair up by position: the retie never adds or removes one.
 */
function bareResumeDrift(
  before: string,
  after: string,
  map: ReadonlyMap<string, string>,
  tables: RetieTables,
  english: ReadonlySet<string>,
): { index: number; from: string; to: string; was: string; reads: string; keep?: string }[] {
  const bare = (text: string) => {
    const tokens: { chunk: string; index: number; block: number }[] = [];
    forEachMarkdownCodeToken(text, (token) => tokens.push(token));
    const perBlock = new Map<number, number>();
    for (const token of tokens) perBlock.set(token.block, (perBlock.get(token.block) ?? 0) + 1);
    return new Map(tokens.filter((token) => perBlock.get(token.block) === 1).map((token) => [token.block, token]));
  };
  const gloss = (core: string, t: ClassifyTables) => {
    try {
      return morphGlossLine(`${core}.`, t);
    } catch {
      return "(does not parse)";
    }
  };
  const beforeBare = bare(before);
  const out: { index: number; from: string; to: string; was: string; reads: string; keep?: string }[] = [];
  for (const [block, token] of bare(after)) {
    const { core } = peelChunk(token.chunk);
    const previous = beforeBare.get(block);
    const from = previous ? peelChunk(previous.chunk).core : "";
    if (!core || !from || english.has(core) || ENGLISH_IN_CODE.has(core)) continue;
    try {
      const word = parseWord(core);
      if (word.ending !== "r" || word.family.kind !== "content" || hasClosedOverlay(word, tables.current)) continue;
    } catch {
      continue;
    }
    const was = gloss(from, tables.old);
    const reads = gloss(core, tables.current);
    if (was === reads) continue;
    // The spelling that keeps the old reading when that reading was the stem's own root (`zerar` ←ear → `zemar`).
    let keep: string | undefined;
    try {
      const old = parseWord(from);
      if (old.family.kind === "content" && old.family.roots.every((root) => tables.old.published.has(root))) {
        const next = retieCore(from, map, { stems: new Set(), boundAntecedentRoots: old.family.roots });
        if (next && next !== core && gloss(next, tables.current) === was) keep = next;
      }
    } catch {
      // keep stays undefined
    }
    out.push({ index: token.index, from, to: core, was, reads, keep });
  }
  return out;
}

/** Doc-lint findings for one page (same checks as `npm run build`, minus site-wide ones). */
function lintPage(rel: string, source: string, tables: ClassifyTables): string[] {
  const text = fillSelf(source);
  const out: string[] = [];
  for (const issue of lintAgalanMarkdown(text, tables)) {
    out.push(`${rel}:${lineNumberAt(text, issue.index)}  \`${issue.token}\`  ${issue.kind}  (${issue.detail})`);
  }
  for (const issue of lintAgalanSpans(text, tables)) {
    out.push(`${rel}:${lineNumberAt(text, issue.index)}  \`${issue.text}\`  ${issue.kind}  (${issue.detail})`);
  }
  for (const finding of lintMorphGlossMarkdown(text, tables).findings) {
    out.push(formatMorphGlossFinding(rel, finding));
  }
  for (const finding of lintWordBankMarkdown(source, tables)) {
    out.push(formatWordBankFinding(rel, finding));
  }
  // The build checks pronunciation rows on the number pages only.
  if (NUMBER_SPEECH_FILES.includes(basename(rel))) {
    for (const finding of lintNumberSpeechMarkdown(text)) {
      out.push(formatNumberSpeechFinding(rel, finding));
    }
  }
  return out;
}

/**
 * Lint findings a retie adds to a grammar page: the page before the retie against the old
 * lexicon, the page after against the current one.
 * Findings are compared without line numbers, so moved lines are not new.
 */
function newLintFindings(rel: string, before: string, after: string, old: ClassifyTables, current: ClassifyTables): string[] {
  const key = (finding: string) => finding.replace(/^[^\s]+:\d+\s+/, "").replace(/\s+/g, " ");
  const baseline = new Map<string, number>();
  for (const finding of lintPage(rel, before, old)) {
    baseline.set(key(finding), (baseline.get(key(finding)) ?? 0) + 1);
  }
  return lintPage(rel, after, current).filter((finding) => {
    const left = baseline.get(key(finding)) ?? 0;
    if (left > 0) {
      baseline.set(key(finding), left - 1);
      return false;
    }
    return true;
  });
}

async function commonEnglish(): Promise<Set<string>> {
  try {
    await ensureFrequencyFile();
  } catch {
    console.warn("English word list unavailable; English-word review limited to the doc lint's list.");
    return new Set(ENGLISH_IN_CODE);
  }
  const words = new Set(ENGLISH_IN_CODE);
  for (const [word, rank] of loadFrequencyRanks()) {
    if (rank <= COMMON_ENGLISH_RANK) words.add(word);
  }
  return words;
}

type MapFileState = { appliedAt?: string };

async function main(): Promise<void> {
  const options = parseArgs(process.argv.slice(2));
  if (!existsSync(options.mapPath)) {
    throw new Error(
      `Retie map not found: ${options.mapPath}\nRun npm run convert-word -- --lexicon first, or pass --map.`,
    );
  }

  const mapText = readFileSync(options.mapPath, "utf8");
  const map = parseRetieMapJson(mapText);
  const mapState = JSON.parse(mapText) as MapFileState;
  // Pre-retie text reads against the old lexicon, retied text against the current one.
  const tables = retieTables(map);
  const english = await commonEnglish();
  // A dated log of past spellings (`<!-- retie: skip -->`) keeps them: retieing it would rewrite history.
  const markdownFiles = [...markdownDirs.flatMap((dir) => listMarkdown(dir)), ...topLevelMarkdown.filter(existsSync)].filter(
    (file) => {
      if (!RETIE_SKIP_RE.test(readFileSync(file, "utf8"))) return true;
      console.log(`${relative(rootDir, file)}  skipped (retie: skip)`);
      return false;
    },
  );
  const sources = new Map(markdownFiles.map((file) => [file, readFileSync(file, "utf8")]));
  let total = 0;
  let blocking = 0;
  let warnings = 0;
  let info = 0;
  let reviewCount = 0;
  const block = (line: string) => {
    blocking += 1;
    console.error(line);
  };
  const review = (line: string) => {
    reviewCount += 1;
    console.log(line);
  };

  // The map must be applied once: its new roots are often other rows' old roots.
  if (mapState.appliedAt) {
    block(`map  already applied at ${mapState.appliedAt}; a second retie would chain old → new → newer`);
  }
  // Old spellings the word grammar cannot read would be skipped silently.
  for (const oldRoot of unreadableOldRoots(map, (word) => {
    try {
      parseWord(word);
      return true;
    } catch {
      return false;
    }
  })) {
    block(`map  old root ${oldRoot} is not a legal spelling now; do spelling-rule passes before convert-word --lexicon or after the retie`);
  }
  for (const collision of checkMapCollisions(map, {
    rootsInUse: rootsInUse([...sources.values()]),
    englishWords: ENGLISH_IN_CODE,
  })) {
    block(`collision  ${collision.newRoot}  ${collision.reason}`);
  }

  // convert-word --lexicon retied the compound CSV once; retieing it again here would chain.
  const publishedRoots = new Set(loadDefaultTables().published.keys());
  for (const error of validateCompoundRows(parseCompoundCsv(readFileSync(compoundsPath, "utf8")), publishedRoots)) {
    block(`${relative(rootDir, compoundsPath)}:${error.row ?? "?"}  ${error.stem ?? ""}  ${error.reason}`);
  }

  if (!lexiconConverted(publishedRoots, map)) {
    block("data/lexicon-published.csv still spells the old roots (run convert-word --lexicon first)");
  }

  // Closed roots named in code must already follow the lexicon (convert-word --lexicon resyncs them),
  // or the lint below glosses house names, pronouns and linkers from stale spellings.
  const rootByEmoji = new Map([...loadDefaultTables().published.values()].map((row) => [row.emoji, row.clarity]));
  for (const entry of CLOSED_ENTRIES) {
    const published = rootByEmoji.get(entry.emoji);
    if (published !== entry.root) {
      block(`src/closed-roots.ts  ${entry.name} ${entry.emoji} spells ${entry.root}, lexicon has ${published ?? "no row"} (run convert-word --lexicon)`);
    }
  }

  // Pass 1: code. Pass 2: English copies, with name pairs from every page
  // (a house-cast name can sit in prose on a page with no code for it).
  const firstPass = new Map<string, RetieMarkdownResult>();
  for (const file of markdownFiles) {
    firstPass.set(file, rewriteMarkdown(sources.get(file)!, map, tables, { deferFollow: true, english }));
  }
  const follow = mergeFollowPairs(...[...firstPass.values()].map((result) => result.followPairs));
  const results = new Map<string, RetieMarkdownResult>();
  for (const file of markdownFiles) {
    results.set(file, finishFollow(sources.get(file)!, firstPass.get(file)!, follow, tables));
  }

  // A bare short resume in prose reads as its stem's root; the retie can change which root that is.
  for (const [file, result] of results) {
    for (const drift of bareResumeDrift(sources.get(file)!, result.text, map, tables, english)) {
      warnings += 1;
      console.warn(
        `${relative(rootDir, file)}:${lineNumberAt(result.text, drift.index)}  warning  bare resume \`${drift.from}\` → \`${drift.to}\` read ${drift.was}, now reads ${drift.reads}; check the prose around it${drift.keep ? ` (\`${drift.keep}\` keeps ${drift.was})` : ""}`,
      );
    }
  }

  // Heading ids spelled from Agalan move with it; links and overlay anchors follow.
  const renames: AnchorRenames = new Map();
  for (const file of markdownFiles) {
    const moved = headingIdRenames(sources.get(file)!, results.get(file)!.text);
    if (moved.size > 0) renames.set(file, moved);
  }

  const written: { file: string; text: string }[] = [];
  for (const file of markdownFiles) {
    const original = sources.get(file)!;
    const result = results.get(file)!;
    const rel = relative(rootDir, file);
    for (const item of result.reviews) {
      review(`${rel}:${lineNumberAt(original, item.index)}  review  \`${item.text}\`  (${item.reason})`);
    }
    for (const failure of verifyRetiedSpans(result.spans, map, tables)) {
      const line = lineNumberAt(original, failure.span.index);
      const rendered = `${rel}:${line}  ${failure.level}  \`${failure.span.before}\` → \`${failure.span.after}\`  (${failure.detail})`;
      if (failure.level === "info") {
        info += 1;
        console.log(rendered);
      } else if (failure.level === "warning") {
        warnings += 1;
        console.warn(rendered);
      } else {
        block(rendered);
      }
    }
    for (const change of result.changes) {
      console.log(`${rel}:${lineNumberAt(original, change.index)}  ${change.from} → ${change.to}`);
      if (english.has(change.from)) {
        review(`${rel}:${lineNumberAt(original, change.index)}  review  ${change.from} is also an English word; check it was Agalan`);
      }
    }
    for (const change of result.followChanges) {
      console.log(`${rel}  english  ${change.from} → ${change.to}`);
    }
    for (const edit of result.reglossEdits) {
      console.log(`${rel}:${edit.line + 1}  morph  ${edit.from} → ${edit.to}`);
    }
    const relinked = relinkMarkdown(result.text, file, renames);
    for (const change of relinked.changes) {
      console.log(`${rel}  anchor  ${change.from} → ${change.to}`);
    }
    const count = result.changes.length + result.followChanges.length + result.reglossEdits.length + relinked.changes.length;
    if (count === 0) {
      continue;
    }
    total += count;
    written.push({ file, text: relinked.text });
  }

  const overlayOriginal = readFileSync(overlaysPath, "utf8");
  const overlayRelinked = relinkOverlayAnchors(overlayOriginal, grammarDir, renames);
  for (const change of overlayRelinked.changes) {
    console.log(`${relative(rootDir, overlaysPath)}  anchor  ${change.from} → ${change.to}`);
  }
  if (overlayRelinked.changes.length > 0) {
    total += overlayRelinked.changes.length;
    written.push({ file: overlaysPath, text: overlayRelinked.text });
  }

  // Source: root tables, sample fillers, test fixtures.
  const currentRoots = publishedRoots;
  for (const file of sourceDirs.flatMap((dir) => listSource(dir))) {
    const original = readFileSync(file, "utf8");
    const result = rewriteSourceLiterals(original, file, { map, tables: tables.old, follow, english, currentRoots });
    const rel = relative(rootDir, file);
    for (const item of result.reviews) {
      review(`${rel}:${lineNumberAt(original, item.index)}  review  ${item.reason}`);
    }
    for (const change of result.changes) {
      console.log(`${rel}:${lineNumberAt(original, change.index)}  ${change.from} → ${change.to}`);
    }
    if (result.text !== original) {
      total += result.changes.length;
      written.push({ file, text: result.text });
    }
  }

  // Same checks `npm run build` makes on grammar pages, before anything is written.
  const current = tables.current;
  let lintCount = 0;
  for (const { file, text } of written.filter(({ file }) => file.startsWith(`${grammarDir}/`) && file.endsWith(".md"))) {
    for (const finding of newLintFindings(relative(rootDir, file), sources.get(file)!, text, tables.old, current)) {
      lintCount += 1;
      block(`lint  ${finding}`);
    }
  }
  if (lintCount > 0) {
    console.error(`${lintCount} lint finding(s) the retie would add to grammar pages (blocking).`);
  }

  const summary = `${total} reties in ${written.length} files; ${reviewCount} to review; ${warnings} warning; ${info} info; ${blocking} blocking`;
  if (!options.write) {
    console.log(`Dry-run: ${summary}. Pass --write to apply.`);
    return;
  }
  if (blocking > 0 && !options.force) {
    throw new Error(`Not written: ${summary}. Fix the map or pass --force.`);
  }
  for (const { file, text } of written) {
    writeFileSync(file, text);
  }
  const stamped = { ...(JSON.parse(mapText) as object), appliedAt: new Date().toISOString() };
  writeFileSync(options.mapPath, `${JSON.stringify(stamped, null, 2)}\n`);
  console.log(`Wrote ${summary}. Stamped ${relative(rootDir, options.mapPath)} as applied.`);

  console.log("Next: npm run build and npm test, then read the review list above.");
}

main().catch((err: unknown) => {
  const message = err instanceof Error ? err.message : String(err);
  console.error(message);
  process.exit(1);
});
