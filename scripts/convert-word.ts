/**
 * Place Egabon roots: published rows (--lexicon), or one English word.
 *
 * Run: npm run convert-word -- fishing                          (three-letter root by English echo)
 *      npm run convert-word -- fishing --kind doing --shape one (five-letter root-tails root)
 *      npm run convert-word -- --lexicon --only breaker
 *      npm run convert-word -- --lexicon --all
 *      npm run convert-word -- --report
 *
 * --lexicon requires --only or --all (never re-places the whole lexicon by default).
 * --lexicon also writes tmp/lexicon-retie-map.json for npm run retie-docs.
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { parseCsv, serializeCsv } from "../src/csv.js";
import {
  parseCompoundCsv,
  retieCompoundRows,
  serializeCompoundCsv,
  validateCompoundRows,
} from "../src/lexicon-compounds.js";
import { resyncClosedRootsSource } from "../src/closed-roots.js";
import { lookupPronunciation } from "../src/cmu-dict.js";
import { loadPron } from "../src/echo-metric.js";
import { placePublishedRoots } from "../src/lexicon-place.js";
import { isJoinOverlayKind, parseOverlayCsv, parsePublishedCsv } from "../src/lexicon-search.js";
import { holderHostForms, tailFieldsError, validateRootTails, type Kind, type Shape } from "../src/root-tails.js";
import { placeTailRoots } from "../src/root-tails-place.js";
import { RETIE_MAP_RELATIVE_PATH, serializeRetieMap, type RetiePair } from "../src/retie/map.js";
import {
  EGABON_CONSONANTS,
  EGABON_VOWELS,
  letterDistribution,
  toEgabonWord,
} from "../src/word-converter.js";
import { REPO_ROOT, dataPath } from "../src/repo-paths.js";
import { printTailsReport } from "./lib/tails-report.js";
import { compoundPartDrift, retieSenseForm, rowMatchesOnly } from "../src/retie/lexicon.js";

const publishedPath = dataPath("lexicon-published.csv");
const overlayPath = dataPath("lexicon-overlays.csv");
const compoundsPath = dataPath("lexicon-compounds.csv");
const closedRootsPath = join(REPO_ROOT, "src", "closed-roots.ts");

const OVERLAY_HEADERS = ["sense_form", "pos", "emoji", "kind", "gloss", "definition", "mnemonic", "anchor"];

type CliOptions = {
  lexicon: boolean;
  report: boolean;
  steps?: number;
  all: boolean;
  only: string[];
  input: string;
  kind: string;
  shape: string;
};

function parseArgs(argv: string[]): CliOptions {
  let lexicon = false;
  let report = false;
  let steps: number | undefined;
  let all = false;
  let kind = "";
  let shape = "";
  const only: string[] = [];
  const parts: string[] = [];

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]!;
    if (arg === "--lexicon") {
      lexicon = true;
      continue;
    }
    if (arg === "--report") {
      report = true;
      continue;
    }
    if (arg === "--kind" || arg === "--shape") {
      const value = argv[++i];
      if (!value) throw new Error(`Missing value for ${arg}`);
      if (arg === "--kind") kind = value;
      else shape = value;
      continue;
    }
    if (arg === "--steps") {
      const value = argv[++i];
      if (!value || !Number.isInteger(Number(value)) || Number(value) < 0) {
        throw new Error("Missing or invalid value for --steps");
      }
      steps = Number(value);
      continue;
    }
    if (arg === "--all") {
      all = true;
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
    if (arg === "--help" || arg === "-h") {
      printUsage();
      process.exit(0);
    }
    parts.push(arg);
  }

  const input = parts.join(" ").trim();
  if (report) {
    if (lexicon || input) {
      throw new Error("--report takes no other mode or input");
    }
    return { lexicon, report, all, only, input, kind, shape };
  }
  if (steps !== undefined && !lexicon) {
    throw new Error("--steps requires --lexicon");
  }
  if ((kind || shape) && (lexicon || !input)) {
    throw new Error("--kind and --shape go with one English word");
  }
  if (!lexicon && !input) {
    printUsage();
    throw new Error("Missing input text");
  }
  if (only.length > 0 && !lexicon) {
    throw new Error("--only requires --lexicon");
  }
  if (all && !lexicon) {
    throw new Error("--all requires --lexicon");
  }
  if (all && only.length > 0) {
    throw new Error("--all and --only are mutually exclusive");
  }
  if (lexicon && !all && only.length === 0) {
    printUsage();
    throw new Error("--lexicon requires --only <row> or --all (re-places the whole lexicon)");
  }

  return { lexicon, report, steps, all, only, input, kind, shape };
}

function printUsage(): void {
  console.error(`Usage: npm run convert-word -- <english> [--kind KIND [--shape SHAPE]]
       npm run convert-word -- --lexicon (--only LITERAL|EMOJI|ROOT | --all) [--steps N]
       npm run convert-word -- --report

<english> alone prints the best three-letter root by English echo. With --kind (and --shape,
except for a named row) it prints the five-letter root-tails root that word would take beside
the published lexicon.
--lexicon rewrites the published/overlay/compound CSVs and dumps tmp/lexicon-retie-map.json.
A row keeps its root's length; a new row takes an annealed three-letter root when it is
overlay-backed (or a marked pronoun), and a root-tails five-letter root from its kind and shape otherwise.
--only limits --lexicon to matching published rows (repeatable or comma-separated); every other
root stays put.
--all re-places every five-letter row and keeps the three-letter roots; --lexicon needs one of
--only or --all. --steps sets the five-letter annealing steps.
--report prints the root-tails report for the published lexicon.

Examples:
  npm run convert-word -- fishing
  npm run convert-word -- knife --kind tool --shape takes-away
  npm run convert-word -- --lexicon --only breaker
  npm run convert-word -- --lexicon --all`);
}

function pct(count: number, total: number): string {
  if (total === 0) {
    return "0.0%";
  }
  return `${((100 * count) / total).toFixed(1)}%`;
}

async function convertLexicon(only: string[], steps?: number): Promise<void> {
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
  // --all keeps the three-letter roots; --only places just the rows it names.
  const isTarget = (row: Record<string, string>) =>
    only.length > 0 ? rowMatchesOnly(row, only) : (row.root ?? "").trim().length !== 3;

  for (const row of rows) {
    const root = (row.root ?? "").trim();
    if (!root) {
      continue;
    }
    if (!isTarget(row)) {
      used.add(root);
    }
  }

  // Old root → emoji, taken before any row is respelled, to check compound parts afterwards.
  const emojiByOldRoot = new Map(
    rows.filter((row) => (row.root ?? "").trim()).map((row) => [(row.root ?? "").trim(), (row.emoji ?? "").trim()]),
  );
  const assigned: string[] = [];
  const oldToNewByEmoji = new Map<string, { oldRoot: string; newRoot: string }>();
  const retiePairs: RetiePair[] = [];
  let skipped = 0;
  let failed = 0;
  let changed = 0;
  let kept = 0;

  const targets = rows.filter(isTarget);
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
        root: (row.root ?? "").trim(),
        kind: (row.kind ?? "").trim(),
        shape: (row.shape ?? "").trim(),
      }];
    }),
    overlays,
    {
      blocked: used,
      kept: rows
        .filter((row) => !isTarget(row) && (row.root ?? "").trim())
        .map((row) => ({ emoji: (row.emoji ?? "").trim(), root: (row.root ?? "").trim() })),
      compounds: compoundRows,
      tailSteps: steps,
    },
  );
  // a seedless row is keyed by its concrete label
  const byKey = new Map(placed.map((item) => [item.emoji || item.concrete, item]));
  for (const row of targets) {
    const literal = (row.concrete ?? "").trim();
    if (!literal) continue;
    const previous = (row.root ?? "").trim();
    const neu = byKey.get((row.emoji ?? "").trim() || literal)?.root;
    if (!neu) {
      failed += 1;
      console.error(`no placement for ${literal}`);
      continue;
    }
    row.root = neu;
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
    rows.map((row) => (row.root ?? "").trim()).filter(Boolean),
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
    new Map(rows.map((row) => [(row.emoji ?? "").trim(), (row.root ?? "").trim()])),
  );
  if (closed.missing.length > 0) {
    throw new Error(`src/closed-roots.ts names emoji with no published row: ${closed.missing.join(" ")}`);
  }
  const placedRows = parsePublishedCsv(serializeCsv(headers, rows));
  const tailErrors = validateRootTails(placedRows, holderHostForms(overlays));
  if (tailErrors.length > 0) {
    throw new Error(`Root tails after placement:\n${tailErrors.map((e) => `  ${e.key}: ${e.reason}`).join("\n")}`);
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

  const tmpDir = join(REPO_ROOT, "tmp");
  mkdirSync(tmpDir, { recursive: true });
  const retieMapPath = join(REPO_ROOT, RETIE_MAP_RELATIVE_PATH);
  const compoundStems = compoundRows.flatMap((row, i) => {
    const newStem = retiedCompounds.rows[i]!.stem;
    return newStem === row.stem ? [] : [{ oldStem: row.stem, newStem }];
  });
  writeFileSync(retieMapPath, serializeRetieMap(retiePairs, undefined, compoundStems));

  const dist = letterDistribution(assigned.length > 0 ? assigned : rows.map((r) => (r.root ?? "").trim()).filter(Boolean));
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
    for (const v of EGABON_VOWELS) {
      console.log(`  ${v}  ${dist.vowels[v]}  ${pct(dist.vowels[v], dist.vowelTokens)}`);
    }
    console.log(`consonants (${dist.consonantTokens} tokens):`);
    for (const c of EGABON_CONSONANTS) {
      console.log(`  ${c}  ${dist.consonants[c]}  ${pct(dist.consonants[c], dist.consonantTokens)}`);
    }
    console.log(`letters: ${dist.letters}`);
  }
  printTailsReport(placedRows, loadPron());
}

/** The five-letter root one English word would take beside the published lexicon, which stays put. */
function tailRootFor(input: string, kind: string, shape: string): string {
  const error = tailFieldsError(kind, shape);
  if (error) throw new Error(error);
  const published = parsePublishedCsv(readFileSync(publishedPath, "utf8"));
  const overlays = parseOverlayCsv(readFileSync(overlayPath, "utf8"));
  const shortRoots = new Set(published.map((row) => row.root).filter((root) => root.length === 3));
  const kept = published.filter((row) => row.root.length === 5);
  const blocked = new Set(overlays.filter((o) => isJoinOverlayKind(o.kind)).map((o) => o.senseForm));
  const { roots } = placeTailRoots({
    rows: [
      { kind: kind as Kind, shape: shape as Shape | "", cmu: lookupPronunciation(input) },
      ...kept.map((row) => ({ kind: row.kind as Kind, shape: "" as const, cmu: "", fixed: row.root })),
    ],
    shortRoots,
    holderHosts: holderHostForms(overlays),
    blocked,
    compounds: [],
    steps: 0,
  });
  return roots[0]!;
}

async function main(): Promise<void> {
  const options = parseArgs(process.argv.slice(2));
  if (options.report) {
    printTailsReport(parsePublishedCsv(readFileSync(publishedPath, "utf8")), loadPron());
    return;
  }
  if (options.lexicon) {
    await convertLexicon(options.only, options.steps);
    return;
  }
  console.log(options.kind ? tailRootFor(options.input, options.kind, options.shape) : toEgabonWord(options.input));
}

try {
  await main();
} catch (err) {
  const message = err instanceof Error ? err.message : String(err);
  console.error(message);
  process.exit(1);
}
