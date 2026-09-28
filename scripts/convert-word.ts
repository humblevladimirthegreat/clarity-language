/**
 * Convert English text to an Agazan root from its CMU pronunciation.
 *
 * Run: npm run convert-word -- fishing
 *      npm run convert-word -- --unique fishing
 *      npm run convert-word -- --lexicon
 *      npm run convert-word -- --lexicon --only breaker
 *
 * --lexicon also writes tmp/lexicon-retie-map.json for npm run retie-docs.
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { escapeCsvField, parseCsv } from "../src/csv.js";
import {
  parseCompoundCsv,
  retieCompoundRows,
  serializeCompoundCsv,
  validateCompoundRows,
  type CompoundRow,
  type CompoundValidationError,
} from "../src/lexicon-compounds.js";
import { resyncClosedRootsSource } from "../src/closed-roots.js";
import { placePublishedRoots } from "../src/lexicon-place.js";
import { isJoinOverlayKind, parseOverlayCsv } from "../src/lexicon-search.js";
import { RETIE_MAP_RELATIVE_PATH, serializeRetieMap, type RetiePair } from "../src/retie/map.js";
import { retieCore } from "../src/retie/rebuild.js";
import {
  CLARITY_CONSONANTS,
  CLARITY_VOWELS,
  letterDistribution,
  toClarityWord,
  toUniqueClarityWord,
} from "../src/word-converter.js";

const rootDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const publishedPath = join(rootDir, "data", "lexicon-published.csv");
const overlayPath = join(rootDir, "data", "lexicon-overlays.csv");
const compoundsPath = join(rootDir, "data", "lexicon-compounds.csv");
const closedRootsPath = join(rootDir, "src", "closed-roots.ts");

const OVERLAY_HEADERS = ["sense_form", "pos", "emoji", "kind", "gloss", "definition", "mnemonic", "anchor"];

type CliOptions = {
  lexicon: boolean;
  only: string[];
  input: string;
  unique: boolean;
  syllables: number;
};

function parseArgs(argv: string[]): CliOptions {
  let unique = false;
  let lexicon = false;
  let syllables = 2;
  const only: string[] = [];
  const parts: string[] = [];

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]!;
    if (arg === "--unique") {
      unique = true;
      continue;
    }
    if (arg === "--lexicon") {
      lexicon = true;
      continue;
    }
    if (arg === "--only") {
      const value = argv[++i];
      if (!value) {
        throw new Error("Missing value for --only");
      }
      for (const part of value.split(",")) {
        const trimmed = part.trim();
        if (trimmed) {
          only.push(trimmed);
        }
      }
      continue;
    }
    if (arg === "--syllables") {
      const value = argv[++i];
      if (!value || Number.isNaN(Number(value))) {
        throw new Error("Missing or invalid value for --syllables");
      }
      syllables = Number(value);
      continue;
    }
    if (arg === "--help" || arg === "-h") {
      printUsage();
      process.exit(0);
    }
    parts.push(arg);
  }

  const input = parts.join(" ").trim();
  if (!lexicon && !input) {
    printUsage();
    throw new Error("Missing input text");
  }
  if (only.length > 0 && !lexicon) {
    throw new Error("--only requires --lexicon");
  }

  return { lexicon, only, input, unique, syllables };
}

function printUsage(): void {
  console.error(`Usage: npm run convert-word -- <english> [--unique] [--syllables N]
       npm run convert-word -- --lexicon [--only LITERAL|EMOJI|ROOT]

--lexicon rewrites the published/overlay/compound CSVs and dumps tmp/lexicon-retie-map.json.
Eligible rows (overlay-backed, or the marked pronouns) take annealed three-letter roots.
Every other row takes a five-letter root, frequent senses first, regret order on ties.
--only limits --lexicon to matching published rows (repeatable or comma-separated).

Examples:
  npm run convert-word -- fishing
  npm run convert-word -- --unique fishing
  npm run convert-word -- --lexicon
  npm run convert-word -- --lexicon --only breaker`);
}

function pct(count: number, total: number): string {
  if (total === 0) {
    return "0.0%";
  }
  return `${((100 * count) / total).toFixed(1)}%`;
}

function serializeCsv(headers: string[], rows: Record<string, string>[]): string {
  const lines = [
    headers.join(","),
    ...rows.map((row) => headers.map((h) => escapeCsvField(row[h] ?? "")).join(",")),
  ];
  return `${lines.join("\n")}\n`;
}

/**
 * Respell an overlay sense form through the word grammar, the same way the docs are retied:
 * `uxerenel` (role vowel + `x` + root) keeps its role vowel and moves only the root.
 * `null` when the form does not spell `oldRoot` where the parser finds it.
 */
function retieSenseForm(senseForm: string, pos: string, oldRoot: string, newRoot: string): string | null {
  if (!oldRoot || oldRoot === newRoot) {
    return senseForm;
  }
  // Parsed with its PoS, as it is written in a sentence (a bare `uxerenel` is not a word).
  const next = retieCore(`${pos}${senseForm}`, new Map([[oldRoot, newRoot]]));
  return next?.startsWith(pos) ? next.slice(pos.length) : null;
}

function rowMatchesOnly(row: Record<string, string>, only: string[]): boolean {
  if (only.length === 0) {
    return true;
  }
  const literal = (row.concrete ?? "").trim();
  const emoji = (row.emoji ?? "").trim();
  const root = (row.clarity ?? "").trim();
  return only.some((filter) => filter === literal || filter === emoji || filter === root);
}

/**
 * Compound parts that no longer name the same published row: each part's old root belonged to
 * an emoji, and after the retie the part must be that emoji's new root (catches chained substitution).
 */
function compoundPartDrift(
  before: CompoundRow[],
  after: CompoundRow[],
  emojiByOldRoot: ReadonlyMap<string, string>,
  rows: Record<string, string>[],
): CompoundValidationError[] {
  const rootByEmoji = new Map(rows.map((row) => [(row.emoji ?? "").trim(), (row.clarity ?? "").trim()]));
  const errors: CompoundValidationError[] = [];
  before.forEach((row, i) => {
    for (const field of ["left", "right"] as const) {
      const emoji = emojiByOldRoot.get(row[field]);
      if (!emoji) continue;
      const expected = rootByEmoji.get(emoji);
      const got = after[i]![field];
      if (expected && got !== expected) {
        errors.push({ row: i + 2, stem: after[i]!.stem, reason: `${field} ${row[field]} (${emoji}) became ${got}, expected ${expected}` });
      }
    }
  });
  return errors;
}

async function convertLexicon(only: string[]): Promise<void> {
  const { headers, rows } = parseCsv(readFileSync(publishedPath, "utf8"));
  const overlays = parseOverlayCsv(readFileSync(overlayPath, "utf8"));
  const compoundRows = parseCompoundCsv(readFileSync(compoundsPath, "utf8"));
  const used = new Set<string>();
  for (const row of compoundRows) {
    if (row.stem) used.add(row.stem);
  }

  const selected = rows.filter((row) => rowMatchesOnly(row, only));
  if (only.length > 0 && selected.length === 0) {
    throw new Error(`--only matched no published rows: ${only.join(", ")}`);
  }

  for (const row of rows) {
    const root = (row.clarity ?? "").trim();
    if (!root) {
      continue;
    }
    if (!rowMatchesOnly(row, only)) {
      used.add(root);
    }
  }

  // Old root → emoji, taken before any row is respelled, to check compound parts afterwards.
  const emojiByOldRoot = new Map(
    rows.filter((row) => (row.clarity ?? "").trim()).map((row) => [(row.clarity ?? "").trim(), (row.emoji ?? "").trim()]),
  );
  const assigned: string[] = [];
  const oldToNewByEmoji = new Map<string, { oldRoot: string; newRoot: string }>();
  const retiePairs: RetiePair[] = [];
  let skipped = 0;
  let failed = 0;
  let changed = 0;
  let kept = 0;

  const targets = only.length > 0 ? selected : rows;
  for (const row of targets) {
    if (!(row.concrete ?? "").trim()) skipped += 1;
  }
  const placed = await placePublishedRoots(
    targets.flatMap((row) => {
      const concrete = (row.concrete ?? "").trim();
      if (!concrete) return [];
      return [{
        emoji: (row.emoji ?? "").trim(),
        concrete,
        abstract: (row.abstract ?? "").trim(),
        englishByPos: (row.english_by_pos ?? "").trim(),
      }];
    }),
    overlays,
    { blocked: used },
  );
  const byEmoji = new Map(placed.map((item) => [item.emoji, item]));
  for (const row of targets) {
    const literal = (row.concrete ?? "").trim();
    if (!literal) continue;
    const previous = (row.clarity ?? "").trim();
    const neu = byEmoji.get((row.emoji ?? "").trim())?.root;
    if (!neu) {
      failed += 1;
      console.error(`no placement for ${literal}`);
      continue;
    }
    row.clarity = neu;
    assigned.push(neu);
    if (row.emoji) oldToNewByEmoji.set(row.emoji, { oldRoot: previous, newRoot: neu });
    if (neu !== previous) {
      changed += 1;
      retiePairs.push({
        emoji: (row.emoji ?? "").trim(),
        literal,
        oldRoot: previous,
        newRoot: neu,
      });
      console.log(`CHG  ${literal} ${previous} -> ${neu}`);
    } else {
      kept += 1;
      if (only.length > 0) console.log(`KEEP ${literal} ${neu}`);
    }
  }

  const overlaySenseBefore = overlays.map((overlay) => overlay.senseForm);
  const overlayErrors: string[] = [];
  for (const overlay of overlays) {
    if (isJoinOverlayKind(overlay.kind)) {
      continue;
    }
    if (!overlay.emoji) {
      continue;
    }
    const mapped = oldToNewByEmoji.get(overlay.emoji);
    if (!mapped) {
      continue;
    }
    const next = retieSenseForm(overlay.senseForm, overlay.pos, mapped.oldRoot, mapped.newRoot);
    if (next == null) {
      overlayErrors.push(`${overlay.senseForm} (${overlay.pos}): does not spell ${mapped.oldRoot}; respell it to ${mapped.newRoot} by hand`);
      continue;
    }
    overlay.senseForm = next;
  }
  if (overlayErrors.length > 0) {
    throw new Error(`Overlay sense forms the retie could not respell:\n${overlayErrors.join("\n")}`);
  }
  const overlaysChanged = overlays.some((overlay, index) => overlay.senseForm !== overlaySenseBefore[index]);

  const rootMap = new Map(retiePairs.map((pair) => [pair.oldRoot, pair.newRoot]));
  const retiedCompounds = retieCompoundRows(compoundRows, rootMap);
  const publishedRoots = new Set(
    rows.map((row) => (row.clarity ?? "").trim()).filter(Boolean),
  );
  const compoundErrors = [
    ...validateCompoundRows(retiedCompounds.rows, publishedRoots),
    ...compoundPartDrift(compoundRows, retiedCompounds.rows, emojiByOldRoot, rows),
  ];
  if (compoundErrors.length > 0) {
    const detail = compoundErrors.map((e) => `row ${e.row ?? "?"} ${e.stem ?? ""}: ${e.reason}`).join("\n");
    throw new Error(`Invalid lexicon-compounds.csv after retie:\n${detail}`);
  }

  // Closed roots named in code follow their emoji's new spelling (src/closed-roots.ts).
  const closedSource = readFileSync(closedRootsPath, "utf8");
  const closed = resyncClosedRootsSource(
    closedSource,
    new Map(rows.map((row) => [(row.emoji ?? "").trim(), (row.clarity ?? "").trim()])),
  );
  if (closed.missing.length > 0) {
    throw new Error(`src/closed-roots.ts names emoji with no published row: ${closed.missing.join(" ")}`);
  }

  if (changed > 0) {
    writeFileSync(publishedPath, serializeCsv(headers, rows));
  }
  if (overlaysChanged) {
    writeFileSync(
      overlayPath,
      serializeCsv(
        OVERLAY_HEADERS,
        overlays.map((overlay) => ({
          sense_form: overlay.senseForm,
          pos: overlay.pos,
          emoji: overlay.emoji,
          kind: overlay.kind,
          gloss: overlay.gloss,
          definition: overlay.definition,
          mnemonic: overlay.mnemonic,
          anchor: overlay.anchor,
        })),
      ),
    );
  }
  if (retiedCompounds.changes.length > 0) {
    writeFileSync(compoundsPath, serializeCompoundCsv(retiedCompounds.rows));
  }
  if (closed.changes.length > 0) {
    writeFileSync(closedRootsPath, closed.text);
  }

  const tmpDir = join(rootDir, "tmp");
  mkdirSync(tmpDir, { recursive: true });
  const retieMapPath = join(rootDir, RETIE_MAP_RELATIVE_PATH);
  const compoundStems = compoundRows.flatMap((row, i) => {
    const newStem = retiedCompounds.rows[i]!.stem;
    return newStem === row.stem ? [] : [{ emoji: row.emoji, oldStem: row.stem, newStem }];
  });
  writeFileSync(retieMapPath, serializeRetieMap(retiePairs, undefined, compoundStems));

  const dist = letterDistribution(assigned.length > 0 ? assigned : rows.map((r) => (r.clarity ?? "").trim()).filter(Boolean));
  console.log(`assigned: ${assigned.length}`);
  console.log(`skipped: ${skipped}`);
  console.log(`failed: ${failed}`);
  console.log(`roots kept: ${kept}`);
  console.log(`roots changed: ${changed}`);
  console.log(`compound fields retied: ${retiedCompounds.changes.length}`);
  console.log(`closed roots in code respelled: ${closed.changes.map((c) => `${c.emoji} ${c.from} -> ${c.to}`).join(", ") || "none"}`);
  console.log(`retie map: ${RETIE_MAP_RELATIVE_PATH}`);
  if (assigned.length > 0) {
    console.log("");
    console.log(`vowels (${dist.vowelTokens} tokens):`);
    for (const v of CLARITY_VOWELS) {
      console.log(`  ${v}  ${dist.vowels[v]}  ${pct(dist.vowels[v], dist.vowelTokens)}`);
    }
    console.log(`consonants (${dist.consonantTokens} tokens):`);
    for (const c of CLARITY_CONSONANTS) {
      console.log(`  ${c}  ${dist.consonants[c]}  ${pct(dist.consonants[c], dist.consonantTokens)}`);
    }
    console.log(`letters: ${dist.letters}`);
  }
}

async function main(): Promise<void> {
  const options = parseArgs(process.argv.slice(2));
  if (options.lexicon) {
    await convertLexicon(options.only);
    return;
  }
  const root = options.unique
    ? toUniqueClarityWord(options.input, new Set())
    : toClarityWord(options.input, options.syllables);
  console.log(root);
}

try {
  await main();
} catch (err) {
  const message = err instanceof Error ? err.message : String(err);
  console.error(message);
  process.exit(1);
}
