// Agent summaries on grammar pages (docs/meta/grammar-docs.md#agent-summaries): format and placement on every page
// under docs/grammar/, coverage of teaching headings on stage pages, recipe pages and Claritish lessons
// (src/lint/agent-summaries.ts). The Ageben span checks skip HTML comments, so backticked forms in a summary are
// run through them here.
import { readFileSync } from "node:fs";
import { relative } from "node:path";

import { lintAgebenMarkdown, lintAgebenSpans } from "../src/lint/ageben-docs.js";
import { AGENT_SUMMARIES_ANCHOR, lintAgentSummaries, summaryBodiesOnly } from "../src/lint/agent-summaries.js";
import { listMarkdown } from "../src/markdown-files.js";
import { loadDefaultTables } from "../src/parse/index.js";
import { fillSelf } from "../src/learner-name.js";
import { lineNumberAt } from "../src/retie/tokens.js";
import { GRAMMAR_DIR, REPO_ROOT } from "../src/repo-paths.js";

const tables = loadDefaultTables();
const problems: string[] = [];
let summaries = 0;

for (const file of listMarkdown(GRAMMAR_DIR)) {
  const text = readFileSync(file, "utf8");
  const rel = relative(REPO_ROOT, file);
  const key = relative(GRAMMAR_DIR, file).replaceAll("\\", "/");
  for (const f of lintAgentSummaries(key, text)) problems.push(`  ${rel}:${f.line + 1}  agent-summary ${f.kind}  (${f.detail})`);

  const bodies = fillSelf(summaryBodiesOnly(text));
  if (!bodies.trim()) continue;
  summaries += bodies.split("\n").filter((l) => l.trim()).length;
  for (const issue of lintAgebenMarkdown(bodies, tables)) {
    const label = issue.kind === "parse" ? "does not parse" : "unknown root";
    problems.push(`  ${rel}:${lineNumberAt(bodies, issue.index)}  \`${issue.token}\`  agent-summary ${label}  (${issue.detail})`);
  }
  for (const issue of lintAgebenSpans(bodies, tables)) {
    problems.push(`  ${rel}:${lineNumberAt(bodies, issue.index)}  \`${issue.text}\`  agent-summary ${issue.kind}  (${issue.detail})`);
  }
}

if (problems.length) {
  console.error(`Agent summaries (${problems.length}):`);
  for (const p of problems) console.error(p);
  console.error(`Fix: put one \`<!-- Agent summary: … -->\` line directly under each teaching heading, none elsewhere, and write its forms as the page does (${AGENT_SUMMARIES_ANCHOR}).`);
  process.exitCode = 1;
} else {
  console.log(`OK: ${summaries} agent summaries are well formed and placed, and every page that has one covers its teaching headings.`);
}
