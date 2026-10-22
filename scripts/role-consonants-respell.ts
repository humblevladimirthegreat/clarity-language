/**
 * One-off respelling for the role-consonant proposal (docs/proposals/role-consonant-compounds.md, step 2):
 * role compounds and role pointers move from role vowel(s) + `x` to role letter + `w` + V1 + part consonant.
 *
 *   role compound  `zaxuduyel` → `zwazuduyel`  (bare: V1 `a`)    `guxanathom` → `gwodanam` (scope moves to V1)
 *   role pointer   `zaxar`     → `zwazar`      `duxal` → `dwadal`   `daoxar` → `dwadar` (a result is the `d` part)
 *
 * Role vowel → part consonant: `a` → `z`, `u` → `d`, `o` → `b`, `ao` → `d`. The hooked parts (`e`, `ae`, `oe`, `ua`,
 * `uo`, `ue`), a pointer in a holder seam or a viewpoint lateral, and a stacked held pointer have no new spelling yet:
 * they are listed for a hand rewrite and never changed. A bare role compound whose English reads as a profession is
 * listed as an `e` candidate (the practiced role).
 *
 * Only spans the doc lint reads as Agebon are rewritten: Markdown code spans and fences, string literals in source,
 * and whole cells of TSV / CSV / JSON data.
 *
 * Run: npx tsx scripts/role-consonants-respell.ts            (dry run: report in tmp/role-consonants-respell.md)
 *      npx tsx scripts/role-consonants-respell.ts --write    (apply)
 */
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";

import { classify } from "../src/parse/classify.js";
import { loadDefaultTables } from "../src/parse/index.js";
import type { MorphWord } from "../src/parse/types.js";
import { parseWord } from "../src/parse/word.js";
import { REPO_ROOT } from "../src/repo-paths.js";
import { sourceLiterals } from "../src/retie/source.js";
import { lineNumberAt, peelChunk, rewritePlainTokens, transformMarkdown, type RetieChange } from "../src/retie/tokens.js";

const write = process.argv.includes("--write");
const tables = loadDefaultTables();

/** Role vowel → part consonant. A result (`ao`) sits in `/d/`, so it is the `d` part. */
const PART: Readonly<Record<string, string>> = { a: "z", u: "d", o: "b", ao: "d" };
const HOOKED = new Set(["e", "ae", "oe", "ua", "uo", "ue"]);

type Outcome =
  | { kind: "respell"; to: string; family: "compound" | "pointer"; bare: boolean }
  | { kind: "hand"; family: "compound" | "pointer"; reason: string };

function prefixOf(word: MorphWord): string {
  return `${word.bl ? "bl" : word.gl ? "gl" : ""}${word.pos ?? ""}`;
}

/** The new spelling of one word, or why it needs a hand rewrite; undefined when it is not a role compound or pointer. */
function respellWord(core: string): Outcome | undefined {
  if (!core.includes("x")) return undefined;
  let word: MorphWord;
  try {
    word = parseWord(core);
  } catch {
    return undefined;
  }
  const family = word.family;
  if (family.kind !== "x") return undefined;
  const tail = `${word.ending ?? ""}${word.plural ? "x" : ""}`;
  if (family.xFamily === "role") {
    const role = family.roleVowel ?? "";
    if (HOOKED.has(role)) return { kind: "hand", family: "compound", reason: `hooked part \`${role}\`` };
    const v1 = family.scopeVowel ?? "a";
    const ability = family.stanceVowel ? `x${family.stanceVowel}` : "";
    const to = `${prefixOf(word)}w${v1}${PART[role]}${(family.rightRoots ?? []).join("x")}${ability}${tail}`;
    return { kind: "respell", to, family: "compound", bare: !family.scopeVowel };
  }
  if (family.xFamily === "pointer") {
    const role = family.roleVowel ?? "";
    if (family.leftRoots.length > 0) return { kind: "hand", family: "pointer", reason: "held pointer on a host" };
    if (HOOKED.has(role)) return { kind: "hand", family: "pointer", reason: `hooked part \`${role}\`` };
    return { kind: "respell", to: `${prefixOf(word)}wa${PART[role]}${family.pointerVowel}${tail}`, family: "pointer", bare: false };
  }
  if (family.xFamily === "lateral" && family.roleVowel) {
    return { kind: "hand", family: "pointer", reason: "pointer anchoring a viewpoint lateral" };
  }
  if (family.xFamily === "ability") {
    // A holder seam reads its pointer only once classified (`theyemaxar`).
    const lex = classify(word, tables);
    if (lex.family.kind === "x" && lex.family.xFamily === "holder" && lex.family.roleVowel) {
      return { kind: "hand", family: "pointer", reason: "pointer in a holder seam" };
    }
  }
  return undefined;
}

type Hit = { file: string; line: number; from: string; outcome: Outcome; context: string; own: string };
const hits: Hit[] = [];

function record(file: string, text: string, index: number, from: string, outcome: Outcome): void {
  const line = lineNumberAt(text, index);
  const lines = text.split("\n");
  // English for a doc example sits on the same line (table, practice prompt) or a few lines after it (quoted example).
  const context = lines.slice(Math.max(0, line - 3), line + 4).join("\n");
  hits.push({ file, line, from, outcome, context, own: lines[line - 1] ?? "" });
}

function rewriteCore(file: string, text: string): (core: string, index?: number) => string | null {
  return (core, index = 0) => {
    const outcome = respellWord(core);
    if (!outcome) return null;
    record(file, text, index, core, outcome);
    return outcome.kind === "respell" ? outcome.to : null;
  };
}

function rewriteMarkdownFile(file: string, text: string): string {
  const changes: RetieChange[] = [];
  return transformMarkdown(
    text,
    0,
    (code, index) => rewritePlainTokens(code, rewriteCore(file, text), index, changes),
    (prose) => prose,
  );
}

/** Letter runs in a plain string (a source literal or a data cell). */
function rewriteRuns(file: string, text: string, body: string, at: number): string {
  const rewrite = rewriteCore(file, text);
  return body.replace(/[a-z]+/g, (run, offset: number) => {
    const { core } = peelChunk(run);
    return (core && rewrite(core, at + offset)) ?? run;
  });
}

function rewriteSourceFile(file: string, text: string): string {
  let out = "";
  let at = 0;
  for (const literal of sourceLiterals(text, file)) {
    if (literal.escaped) continue;
    out += text.slice(at, literal.index) + rewriteRuns(file, text, literal.body, literal.index);
    at = literal.index + literal.body.length;
  }
  return out + text.slice(at);
}

function rewriteDataFile(file: string, text: string): string {
  return rewriteRuns(file, text, text, 0);
}

function walk(dir: string, keep: (name: string) => boolean): string[] {
  if (!existsSync(dir)) return [];
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    if (["node_modules", "generated", "proposals", "dist", "cache"].includes(name) || name.startsWith(".")) {
      if (name !== ".vitepress") continue;
    }
    const full = join(dir, name);
    if (statSync(full).isDirectory()) out.push(...walk(full, keep));
    else if (keep(name)) out.push(full);
  }
  return out;
}

const markdown = [
  ...walk(join(REPO_ROOT, "docs"), (name) => name.endsWith(".md")),
  ...["AGENTS.md", "TODO.md", "README.md"].map((name) => join(REPO_ROOT, name)).filter(existsSync),
];
const sources = [
  ...walk(join(REPO_ROOT, "src"), (name) => /\.(ts|vue)$/.test(name)),
  ...walk(join(REPO_ROOT, "docs", "grammar", ".vitepress"), (name) => /\.(ts|vue)$/.test(name)),
];
const data = [
  ...walk(join(REPO_ROOT, "src"), (name) => /\.(tsv|csv|json)$/.test(name)),
  ...walk(join(REPO_ROOT, "data"), (name) => /\.(tsv|csv|json)$/.test(name)),
];

let filesChanged = 0;
for (const [files, rewrite] of [
  [markdown, rewriteMarkdownFile],
  [sources, rewriteSourceFile],
  [data, rewriteDataFile],
] as const) {
  for (const path of new Set(files)) {
    const file = relative(REPO_ROOT, path);
    const text = readFileSync(path, "utf8");
    const next = rewrite(file, text);
    if (next !== text) {
      filesChanged += 1;
      if (write) writeFileSync(path, next);
    }
  }
}

// A profession is a standing role, so its bare compound takes V1 `e` (`zaxobebun` *the doctor* → `zwezobebun`).
const AGENT_NOUN = /\b(?:a|an|the|my|your|our|their|his|her|its|one|every|some|no)\s+([a-z]+(?:er|or|ist|ian|ant|ent|eer|ee|ive|ess))\b/gi;
const NOT_AGENT = new Set([
  "other", "another", "under", "never", "water", "after", "order", "together", "either", "neither", "letter", "number",
  "paper", "dinner", "summer", "winter", "weather", "corner", "river", "silver", "flower", "power", "tower", "answer",
  "matter", "center", "chapter", "border", "door", "floor", "color", "error", "mirror", "favor", "honor", "event",
  "moment", "present", "parent", "agent", "patient", "recipient", "student", "talent", "content", "comment", "element",
  "accident", "argument", "elephant", "plant", "giant", "instant", "restaurant", "cancer", "computer", "hammer", "ladder",
  "monster", "sister", "brother", "mother", "father", "daughter", "partner", "member", "neighbor", "stranger", "finger",
  "shoulder", "winner", "loser", "dancer", "singer", "reader", "speaker", "listener", "owner", "lover", "helper",
  "earlier", "later", "longer", "different", "inner", "guess", "prior", "nor", "lent", "referent", "holder", "current",
]);
/** Grammar words, not English for the example. */
const GRAMMAR_NOUN = new Set(["doer", "undergoer", "actor", "giver", "receiver", "pointer", "participant", "linker", "adjective", "consent"]);
function professionWord(context: string, own: string): string | undefined {
  // Only the English: a quoted translation or an emphasised gloss nearby, or the hit's own table row.
  const quoted = [...context.matchAll(/"([^"\n]+)"|\*([^*\n]+)\*/g)].map((match) => match[1] ?? match[2]);
  const english = [...quoted, own.replace(/`[^`]*`/g, "")].join(" | ");
  for (const match of english.matchAll(AGENT_NOUN)) {
    const noun = match[1]!.toLowerCase();
    if (!NOT_AGENT.has(noun) && !GRAMMAR_NOUN.has(noun)) return noun;
  }
  return undefined;
}

const respelled = hits.filter((hit) => hit.outcome.kind === "respell");
const hand = hits.filter((hit) => hit.outcome.kind === "hand");
const bare = respelled.filter((hit) => hit.outcome.kind === "respell" && hit.outcome.family === "compound" && hit.outcome.bare);
const candidates = bare
  .filter((hit) => hit.file.endsWith(".md"))
  .map((hit) => ({ hit, noun: professionWord(hit.context, hit.own) }))
  .filter((row) => row.noun);

const count = (list: Hit[], family: string) => list.filter((hit) => hit.outcome.family === family).length;
const where = (hit: Hit) => `${hit.file}:${hit.line}`;
const lines: string[] = [
  "# Role-consonant respelling report",
  "",
  `${write ? "Applied" : "Dry run"}: ${count(respelled, "compound")} role compound(s) and ${count(respelled, "pointer")} pointer(s) ${write ? "respelled" : "to respell"} in ${filesChanged} file(s); ${hand.length} form(s) left for a hand rewrite; ${candidates.length} bare compound(s) whose English may be a profession (\`e\` candidates).`,
  "",
  "## Hand rewrite",
  "",
  "| Where | Form | Why |",
  "|-------|------|-----|",
  ...hand.map((hit) => `| ${where(hit)} | \`${hit.from}\` | ${hit.outcome.kind === "hand" ? hit.outcome.reason : ""} |`),
  "",
  "## Profession candidates (`e`)",
  "",
  "| Where | Form | New (`a`) | English noun |",
  "|-------|------|-----------|--------------|",
  ...candidates.map(({ hit, noun }) => `| ${where(hit)} | \`${hit.from}\` | \`${hit.outcome.kind === "respell" ? hit.outcome.to : ""}\` | ${noun} |`),
  "",
  "## Respellings",
  "",
  "| Where | Old | New |",
  "|-------|-----|-----|",
  ...respelled.map((hit) => `| ${where(hit)} | \`${hit.from}\` | \`${hit.outcome.kind === "respell" ? hit.outcome.to : ""}\` |`),
  "",
];
const report = join(REPO_ROOT, "tmp", "role-consonants-respell.md");
writeFileSync(report, lines.join("\n"));
console.log(lines[2]);
console.log(`→ ${relative(REPO_ROOT, report)}`);
