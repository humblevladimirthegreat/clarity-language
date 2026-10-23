/**
 * Rename the language everywhere: the name is the 👓 root + -n (docs/meta/language-name.md),
 * and `retie-docs` never respells it, so after a retie that moves 👓 this pass catches the name up.
 *
 * Run: npm run rename-language                       (dry run: old name from package.json, new from 👓 + n)
 *      npm run rename-language -- --write
 *      npm run rename-language -- --from <old> --to <new> --write
 *
 * Every tracked text file: `Ageben` / `ageben` / `AGEBEN` take the same casing of the new name;
 * any other casing is listed for review and left as is. The old root (name minus -n) is respelled
 * only in docs/meta/language-name.md, since elsewhere it may now be another row's root.
 * Tracked paths carrying the name are `git mv`ed, except published grammar pages
 * (Markdown under docs/grammar/ outside .vitepress/), whose slugs must stay
 * name-stable (`purpose.md`, `claritish/learn.md`, `cheat-sheets/to-english.md`).
 * A grammar page whose path still carries the name is a block: rename it first.
 * If a published page were moved, it would get a `pageMoves` row; `from` URLs
 * and existing notes are never rewritten. `--write` refuses a dirty tree unless `--force`.
 */
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { CLOSED } from "../src/closed-roots.js";
import { REPO_ROOT } from "../src/repo-paths.js";

type PageMove = { from: string; to: string; note?: string };

const REDIRECTS = "scripts/site-redirects.json";
/** The one page that names the root beside the name (introduction.md is retied with the root). */
const ROOT_PAGES = ["docs/meta/language-name.md"];
const GRAMMAR_PREFIX = "docs/grammar/";

/** Learner-facing Markdown: public slugs must not track the language name, so they are never moved. */
function isPublishedGrammarPage(file: string): boolean {
  return file.startsWith(GRAMMAR_PREFIX) && file.endsWith(".md") && !file.includes("/.vitepress/");
}

function parseArgs(argv: string[]) {
  const options = { write: false, force: false, from: "", to: "" };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--write") options.write = true;
    else if (arg === "--force") options.force = true;
    else if (arg === "--from" || arg === "--to") {
      const value = argv[++i];
      if (!value) throw new Error(`${arg} needs a name`);
      options[arg === "--from" ? "from" : "to"] = value.toLowerCase();
    } else throw new Error(`Unknown option: ${arg}`);
  }
  return options;
}

const git = (...args: string[]) => execFileSync("git", args, { cwd: REPO_ROOT, encoding: "utf8" });
const capitalize = (word: string) => word.charAt(0).toUpperCase() + word.slice(1);
const escapeRe = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** The new name in the casing of `match`, or undefined for a casing the pass does not know. */
function recase(match: string, to: string): string | undefined {
  if (match === match.toLowerCase()) return to;
  if (match === match.toUpperCase()) return to.toUpperCase();
  if (match === capitalize(match.toLowerCase())) return capitalize(to);
  return undefined;
}

const options = parseArgs(process.argv.slice(2));
const packageName = (JSON.parse(readFileSync(join(REPO_ROOT, "package.json"), "utf8")) as { name: string }).name;
const from = options.from || packageName.toLowerCase();
const to = options.to || `${CLOSED.glasses}n`;
if (!/^[a-z]+$/.test(from) || !/^[a-z]+$/.test(to)) throw new Error(`Names must be letters only: ${from} → ${to}`);
if (from === to) {
  console.log(`Language name already current: ${capitalize(to)} (👓 ${CLOSED.glasses} + n).`);
  process.exit(0);
}
const oldRoot = from.endsWith("n") ? from.slice(0, -1) : undefined;
const newRoot = to.endsWith("n") ? to.slice(0, -1) : undefined;
const nameRe = new RegExp(escapeRe(from), "gi");
const rootRe = oldRoot && newRoot ? new RegExp(`\\b${escapeRe(oldRoot)}\\b`, "g") : undefined;

const tracked = git("ls-files", "-z").split("\0").filter(Boolean);
const texts = new Map<string, string>();
for (const file of tracked) {
  let buffer: Buffer;
  try {
    buffer = readFileSync(join(REPO_ROOT, file));
  } catch {
    continue; // tracked but deleted in the working tree
  }
  if (!buffer.includes(0)) texts.set(file, buffer.toString("utf8"));
}

const collisions = [...texts].filter(([, text]) => text.toLowerCase().includes(to)).map(([file]) => file);
// After a rename, `--from <old> --force` catches stragglers (say, edits merged later) despite the new name being everywhere.
if (collisions.length > 0 && !options.force) {
  console.error(
    `The new name "${to}" already occurs in: ${collisions.join(", ")}. Pick another --to, clear those first, or pass --force.`,
  );
  process.exit(1);
}

const review: string[] = [];
const rewritten = new Map<string, string>();
let total = 0;
for (const [file, text] of texts) {
  if (file === REDIRECTS) continue;
  let count = 0;
  let next = text.replace(nameRe, (match, offset: number) => {
    const replaced = recase(match, to);
    if (replaced === undefined) {
      const line = text.slice(0, offset).split("\n").length;
      review.push(`${file}:${line}  unknown casing "${match}" left as is`);
      return match;
    }
    count += 1;
    return replaced;
  });
  if (rootRe && ROOT_PAGES.includes(file)) {
    next = next.replace(rootRe, () => {
      count += 1;
      return newRoot!;
    });
  }
  if (count > 0) {
    rewritten.set(file, next);
    total += count;
    console.log(`${file}  ${count}`);
  }
}

const namedPaths = tracked.filter((file) => file.toLowerCase().includes(from));
const blockedPages = namedPaths.filter(isPublishedGrammarPage);
for (const file of blockedPages) {
  console.log(
    `blocking  ${file}  grammar slug carries the language name; pick a name-stable filename first (purpose.md, claritish/learn.md, cheat-sheets/to-english.md)`,
  );
}
const moves = namedPaths
  .filter((file) => !isPublishedGrammarPage(file))
  .map((file) => ({ file, next: file.replace(nameRe, (match) => recase(match, to) ?? match) }))
  .filter(({ file, next }) => file !== next);
for (const { file, next } of moves) console.log(`move  ${file} → ${next}`);

// Old public URLs keep working if a published page is moved: retarget rows, then add a row per move.
// Published pages are excluded from `moves`, so this is empty unless that filter changes.
const pageUrl = (file: string) => `/grammar/${file.slice(GRAMMAR_PREFIX.length).replace(/\.md$/, ".html")}`;
const redirects = JSON.parse(texts.get(REDIRECTS)!) as { pageMoves: PageMove[] };
const urlMoves = moves
  .filter(({ file }) => isPublishedGrammarPage(file))
  .map(({ file, next }) => ({ from: pageUrl(file), to: pageUrl(next) }));
for (const row of redirects.pageMoves) {
  const target = urlMoves.find((move) => move.from === row.to);
  if (target) {
    console.log(`redirect  ${row.from}: ${row.to} → ${target.to}`);
    row.to = target.to;
  }
}
for (const move of urlMoves) {
  console.log(`redirect  ${move.from} → ${move.to}`);
  redirects.pageMoves.push({
    ...move,
    note: `Public URL after the language was renamed ${capitalize(from)} → ${capitalize(to)}.`,
  });
}

for (const line of review) console.log(`review  ${line}`);
console.log(
  `\n${capitalize(from)} → ${capitalize(to)}: ${total} replacements in ${rewritten.size} files; ${moves.length} moves; ${urlMoves.length} new redirects; ${review.length} to review`,
);

if (blockedPages.length > 0) {
  console.error(
    `${blockedPages.length} grammar page slug(s) still carry the language name. Rename those files to a stable slug, then rerun.`,
  );
  process.exit(1);
}
if (!options.write) {
  console.log("Dry run. Pass --write to apply.");
  process.exit(0);
}
if (!options.force && git("status", "--porcelain", "--untracked-files=no").trim() !== "") {
  console.error("Working tree has uncommitted changes. Commit them first, or pass --force.");
  process.exit(1);
}
for (const [file, text] of rewritten) writeFileSync(join(REPO_ROOT, file), text);
if (urlMoves.length > 0) writeFileSync(join(REPO_ROOT, REDIRECTS), `${JSON.stringify(redirects, null, 2)}\n`);
for (const { file, next } of moves) {
  git("mv", "--", file, next);
}
console.log(
  [
    "Written. Next:",
    "  npm run build && npm test && npm run grammar-check",
    "  then paste dist/amplify-redirects.json into Amplify (docs/meta/site-redirects.md).",
  ].join("\n"),
);
