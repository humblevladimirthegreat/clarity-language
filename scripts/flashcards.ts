/**
 * Vocabulary flashcard decks for Anki (`vocab-flashcards.md`).
 *
 * Run: npm run flashcards                         every pack: tmp/out/flashcards/ageben-<pack>.apkg (and claritish.apkg), and one
 *                                                 .tsv per note type (ageben-<pack>.tsv, -overlay.tsv, -set.tsv)
 *      npm run flashcards -- --pack beginner,everything   only these packs (beginner, intermediate, advanced, everything, claritish)
 *                                                 claritish: tmp/out/flashcards/claritish.apkg and .tsv, Claritish note type
 *      npm run flashcards -- --out <dir>          another output directory
 *      npm run flashcards -- --tsv-only           skip the genanki step and the Anki check (no .venv needed)
 *
 * After packaging, scripts/flashcards-check.py imports every pack into a throwaway Anki collection.
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

type Options ={ packs: PackId[]; out: string; tsvOnly: boolean };

function parseArgs(argv: string[]): Options {
  const options: Options = { packs: [...PACK_IDS], out: tmpPath("out", "flashcards"), tsvOnly: false };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]!;
    if (arg === "--tsv-only") options.tsvOnly = true;
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

function main(): void {
  const options = parseArgs(process.argv.slice(2));
  const pages = lessonPages();
  const inputs = loadFlashcardInputs(pages, levelReviewPages);
  const notes = buildNotes(inputs);
  const python = join(REPO_ROOT, ".venv", "bin", "python");
  if (!options.tsvOnly && !existsSync(python)) {
    throw new Error("no .venv/bin/python: create it with `python3 -m venv .venv && .venv/bin/pip install -r requirements.txt`, or pass --tsv-only");
  }
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
  if (packed.length > 0) {
    const check = spawnSync(python, [join(REPO_ROOT, "scripts", "flashcards-check.py"), ...packed], { stdio: "inherit" });
    if (check.status !== 0) process.exit(check.status ?? 1);
  }
}

main();
