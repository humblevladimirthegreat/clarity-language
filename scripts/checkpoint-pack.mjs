#!/usr/bin/env node
/**
 * Pre-computed context for one checkpoint unit, so a checkpoint subagent reads one short file
 * instead of grepping the lexicon and earlier pages.
 *
 * Run: node scripts/checkpoint-pack.mjs --unit I6 --band Intermediate verb-and-stance-joins.md in-clause-hooks.md
 *
 * Writes tmp/checkpoint-pack/<unit>.md (allowlist rows, baseline errors from tmp/verify-baseline.json,
 * settings already in use, and `core-vocabulary --for` output per page) and
 * tmp/checkpoint-pack/free-roots.tsv (published roots with an empty `core` cell). Rebuild it right
 * before each unit: every unit claims roots and settings.
 */
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "..");
const OUT = join(ROOT, "tmp", "checkpoint-pack");

const args = process.argv.slice(2);
let unit, band;
const pages = [];
for (let i = 0; i < args.length; i++) {
  if (args[i] === "--unit") unit = args[++i];
  else if (args[i] === "--band") band = args[++i];
  else if (args[i].endsWith(".md")) pages.push(args[i]);
  else throw new Error(`Unknown argument: ${args[i]}`);
}
if (!unit || !band || pages.length === 0) throw new Error("usage: --unit ID --band Beginner|Intermediate|Advanced page.md…");
const bandLc = band.toLowerCase();

function parseCsv(text) {
  const rows = [];
  let row = [], field = "", quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') quoted = false;
      else field += c;
    } else if (c === '"') quoted = true;
    else if (c === ",") { row.push(field); field = ""; }
    else if (c === "\n") { row.push(field); rows.push(row); row = []; field = ""; }
    else if (c !== "\r") field += c;
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  const [head, ...body] = rows;
  return body.filter((r) => r.length > 1).map((r) => Object.fromEntries(head.map((h, j) => [h, r[j] ?? ""])));
}

mkdirSync(OUT, { recursive: true });

// Free roots.
const lexicon = parseCsv(readFileSync(join(ROOT, "data", "lexicon-published.csv"), "utf8"));
const free = lexicon.filter((r) => !r.core);
writeFileSync(
  join(OUT, "free-roots.tsv"),
  "# Published roots with an empty core cell (free for New words): concrete, root, kind, other English\n" +
    free.map((r) => [r.concrete, r.root, r.kind, [r.english_by_pos, r.english_aliases].filter(Boolean).join("; ")].join("\t")).join("\n") +
    "\n",
);

// Allowlist rows and settings in use.
const allowlist = readFileSync(join(ROOT, "docs", "meta", "procedures", "drill-generation.md"), "utf8").split("\n");
const rowFor = (page) => allowlist.find((l) => l.includes(`| \`${page}\` |`) && l.includes(`| ${band} |`)) ?? allowlist.find((l) => l.includes(`| \`${page}\` |`));
const settings = new Set();
function walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (name.startsWith(".")) continue;
    if (statSync(p).isDirectory()) walk(p);
    else if (name.endsWith(".md")) {
      for (const m of readFileSync(p, "utf8").matchAll(/^\*\*Setting:\*\*\s*(.+)$/gm)) settings.add(m[1].trim().replace(/\.$/, ""));
    }
  }
}
walk(join(ROOT, "docs", "grammar"));

// Baseline errors.
const baselinePath = join(ROOT, "tmp", "verify-baseline.json");
const baseline = existsSync(baselinePath) ? JSON.parse(readFileSync(baselinePath, "utf8")).keys : [];

// Sidebar order, for the nearest earlier checkpoint of a page that has none yet.
const order = [...readFileSync(join(ROOT, "docs", "grammar", ".vitepress", "lib", "reading-order.ts"), "utf8").matchAll(/link: '\/([a-z0-9-]+)'/g)].map((m) => `${m[1]}.md`);

function spacing(page) {
  try {
    return execFileSync("npx", ["--no-install", "tsx", "scripts/core-vocabulary.ts", "--for", `${page}:${bandLc}`, "--limit", "25"], { cwd: ROOT, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
  } catch {
    return undefined;
  }
}

const out = [`# Checkpoint pack: unit ${unit} (${band})`, "", "Built by `scripts/checkpoint-pack.mjs`. New words: grep `tmp/checkpoint-pack/free-roots.tsv`.", "", "## Allowlist rows (verbatim)", ""];
for (const page of pages) out.push(rowFor(page) ?? `(no allowlist row for ${page})`);
out.push("", "## Baseline errors on these pages (what this unit must clear)", "");
for (const page of pages) for (const k of baseline.filter((k) => k.includes(page))) out.push(`- ${k.replace(/^lint ageben \| /, "")}`);
out.push("", "## Settings already in use (pick a new one that is not a near-synonym)", "", [...settings].sort().join(" · "));
for (const page of pages) {
  out.push("", `## Vocabulary spacing for ${page}`, "", "```");
  let text = spacing(page);
  if (!text) {
    const before = order.slice(0, order.indexOf(page)).reverse();
    for (const prev of before) {
      text = spacing(prev);
      if (text) {
        out.push(`(${page} has no checkpoint yet; this is the nearest earlier ${bandLc} checkpoint, ${prev}. Its Review list is a close proxy; ignore its "May introduce" list.)`);
        break;
      }
    }
  }
  out.push((text ?? `(no earlier ${bandLc} checkpoint)`).trimEnd(), "```");
}
writeFileSync(join(OUT, `${unit}.md`), out.join("\n") + "\n");
console.log(`tmp/checkpoint-pack/${unit}.md (${out.length} lines); free-roots.tsv (${free.length} roots)`);
