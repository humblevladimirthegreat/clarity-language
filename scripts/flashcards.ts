/**
 * Vocabulary flashcard decks for Anki (`vocab-flashcards.md`).
 *
 * Run: npm run flashcards                         every pack: tmp/out/flashcards/ageben-<pack>.apkg (and claritish.apkg), and one
 *                                                 .tsv per note type (ageben-<pack>.tsv, -overlay.tsv, -set.tsv)
 *      npm run flashcards -- --pack beginner,everything   only these packs (beginner, intermediate, advanced, everything, claritish)
 *                                                 claritish: tmp/out/flashcards/claritish.apkg and .tsv, Claritish note type
 *      npm run flashcards -- --out <dir>          another output directory
 *      npm run flashcards -- --tsv-only           skip the genanki step and the Anki check (no .venv needed)
 *      npm run flashcards -- --no-check           package, but skip the Anki check (no `anki` in .venv needed)
 *
 * After packaging, scripts/flashcards-check.py imports every pack into a throwaway Anki collection.
 * When .venv lacks `anki` (requirements-publish.txt only), the check is skipped with a warning, unless
 * flashcard code changed since origin/main: then it fails (docs/meta/flashcards.md#import-check).
 */
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

import { claritishLessons, lessonPages, levelReviewPages } from "../docs/grammar/.vitepress/lib/reading-order.js";
import { claritishPackJson, claritishTsv, loadClaritishPack } from "../src/flashcards-claritish.js";
import { buildNotes, loadFlashcardInputs, PACK_IDS, packJson, type PackId } from "../src/flashcards.js";
import { buildPack, noteCards, packTsvs } from "../src/flashcards-packs.js";
import { REPO_ROOT } from "../src/repo-paths.js";
import { tmpPath } from "../src/tmp-paths.js";

type Options ={ packs: PackId[]; out: string; tsvOnly: boolean; noCheck: boolean };

/** Paths whose change needs the Anki import check to run: the generator, packager and checker, and the Python pins. */
const CHECK_PATHS = /^(src\/flashcards|scripts\/flashcards|requirements[^/]*\.txt$)/;

function parseArgs(argv: string[]): Options {
  const options: Options = { packs: [...PACK_IDS], out: tmpPath("out", "flashcards"), tsvOnly: false, noCheck: false };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]!;
    if (arg === "--tsv-only") options.tsvOnly = true;
    else if (arg === "--no-check") options.noCheck = true;
    else if (arg === "--out" && argv[i + 1]) options.out = resolve(argv[++i]!);
    else if (arg === "--pack" && argv[i + 1]) {
      const packs = argv[++i]!.split(",");
      const bad = packs.filter((p) => !(PACK_IDS as readonly string[]).includes(p));
      if (bad.length > 0) throw new Error(`Unknown pack: ${bad.join(", ")}; use ${PACK_IDS.join(", ")}`);
      options.packs = packs as PackId[];
    } else throw new Error(`Unknown argument: ${arg}`);
  }
  return options;
}

/** Files changed since this branch left origin/main (HEAD when there is no remote), committed or not, plus untracked ones; undefined when git fails. */
function changedFiles(): string[] | undefined {
  const git = (...args: string[]) => {
    const run = spawnSync("git", args, { cwd: REPO_ROOT, encoding: "utf8" });
    return run.status === 0 ? run.stdout : undefined;
  };
  const base = git("merge-base", "HEAD", "origin/main")?.trim() || "HEAD";
  const diff = git("diff", "--name-only", base);
  const untracked = git("ls-files", "--others", "--exclude-standard");
  if (diff === undefined || untracked === undefined) return undefined;
  return `${diff}\n${untracked}`.split("\n").filter(Boolean);
}

/**
 * Whether to run the Anki import check. Without `anki` in .venv it is skipped with a warning,
 * unless flashcard code changed (or git can't tell): then the run fails before packaging.
 */
function shouldCheck(python: string): boolean {
  if (spawnSync(python, ["-c", "import anki"], { stdio: "ignore" }).status === 0) return true;
  const changed = changedFiles();
  const relevant = changed?.filter((path) => CHECK_PATHS.test(path));
  if (relevant === undefined || relevant.length > 0) {
    const why = relevant ? `flashcard code changed (${relevant.join(", ")})` : "git could not list changed files";
    throw new Error(`.venv has no anki and ${why}: \`.venv/bin/pip install -r requirements.txt\` to run the import check`);
  }
  console.log("warning: Anki import check skipped: .venv has no anki and no flashcard code changed since origin/main (install requirements.txt to run it)");
  return false;
}

function main(): void {
  const options = parseArgs(process.argv.slice(2));
  const pages = lessonPages();
  const inputs = loadFlashcardInputs(pages, levelReviewPages);
  const notes = buildNotes(inputs);
  const python = join(REPO_ROOT, ".venv", "bin", "python");
  if (!options.tsvOnly && !existsSync(python)) {
    throw new Error("no .venv/bin/python: create it with `python3 -m venv .venv && .venv/bin/pip install -r requirements.txt`, or pass --tsv-only");
  }
  const check = !options.tsvOnly && !options.noCheck && shouldCheck(python);
  mkdirSync(options.out, { recursive: true });

  const packed: string[] = [];
  const packageJson = (base: string, json: object) => {
    writeFileSync(`${base}.json`, `${JSON.stringify(json, null, 1)}\n`);
    const run = spawnSync(python, [join(REPO_ROOT, "scripts", "flashcards-package.py"), `${base}.json`, `${base}.apkg`], { stdio: "inherit" });
    if (run.status !== 0) process.exit(run.status ?? 1);
    packed.push(`${base}.json`);
  };
  for (const id of options.packs) {
    if (id === "claritish") {
      const pack = loadClaritishPack(claritishLessons);
      const base = join(options.out, "claritish");
      writeFileSync(`${base}.tsv`, claritishTsv(pack));
      if (!options.tsvOnly) {
        packageJson(base, claritishPackJson(pack));
      }
      console.log(`${id}: ${pack.notes.length} notes in ${pack.decks.length} deck(s), release ${pack.releaseId} → ${base}.${options.tsvOnly ? "tsv" : "apkg"}`);
      continue;
    }
    const pack = buildPack(id, notes, inputs);
    const base = join(options.out, `ageben-${id}`);
    for (const tsv of packTsvs(pack)) writeFileSync(`${base}${tsv.suffix}.tsv`, tsv.text);
    const packNotes = pack.decks.flatMap((d) => d.notes);
    const cards = packNotes.reduce((n, note) => n + noteCards(note), 0);
    if (!options.tsvOnly) {
      packageJson(base, packJson(pack));
    }
    console.log(`${id}: ${packNotes.length} notes, ${cards} cards in ${pack.decks.length} deck(s) → ${base}.${options.tsvOnly ? "tsv" : "apkg"}`);
  }
  if (check && packed.length > 0) {
    const run = spawnSync(python, [join(REPO_ROOT, "scripts", "flashcards-check.py"), ...packed], { stdio: "inherit" });
    if (run.status !== 0) process.exit(run.status ?? 1);
  }
}

main();
