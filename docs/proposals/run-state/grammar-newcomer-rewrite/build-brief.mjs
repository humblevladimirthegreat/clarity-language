// Writes a rewrite unit's brief from the stage digest.
// Usage: node docs/proposals/run-state/grammar-newcomer-rewrite/build-brief.mjs <ID> "<page> <page>" "<unit note>"
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const [id, pages, note = ""] = process.argv.slice(2);
if (!id || !pages) throw new Error('usage: build-brief.mjs <ID> "<page> <page>" "<unit note>"');
const dir = path.dirname(fileURLToPath(import.meta.url));
const digest = fs.readFileSync(path.join(dir, "stage-digest.txt"), "utf8");
const list = pages.split(/\s+/).filter(Boolean);
for (const p of list) if (!fs.existsSync(p)) throw new Error("no such page: " + p);

const out = `Brief: grammar-newcomer-rewrite, unit ${id} (rewrite unit)

You are a proposal-worker running one rewrite unit.

## Your page(s), in reading order

${list.map((p) => "- " + p).join("\n")}
${note ? "\n" + note + "\n" : ""}
## Tooling

- \`npm run -s outline -- FILE --summaries\` prints each heading with its agent summary.
- The build lints agent summaries (format; and once a page has any summary, coverage of every
  teaching heading). Its rules: docs/meta/grammar-docs.md#agent-summaries.

## May edit

${list.join(", ")}. Nothing else; report anything else that needs a change.

## Digest

${digest}`;
fs.mkdirSync(path.join(dir, "briefs"), { recursive: true });
fs.writeFileSync(path.join(dir, "briefs", id + ".txt"), out);
console.log(`${id}: ${out.split("\n").length} lines`);
