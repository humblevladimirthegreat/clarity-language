import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { loadDefaultTables, parse } from "../src/parse/index.js";

const rootDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const grammarDir = join(rootDir, "docs", "grammar");

function list(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) out.push(...list(full));
    else if (name.endsWith(".md")) out.push(full);
  }
  return out;
}

const files = list(grammarDir);
const tables = loadDefaultTables();
const sentences: { file: string; s: string; kind: string }[] = [];
for (const file of files) {
  const text = readFileSync(file, "utf8");
  const parts = text.split(/(?=### Translation practice)/);
  for (const part of parts.slice(1)) {
    const end = part.search(/\n## /);
    const block = end >= 0 ? part.slice(0, end) : part;
    const spoilerRe = /::: details[^\n]*\n`([^`]+)`\n:::/g;
    let m: RegExpExecArray | null;
    while ((m = spoilerRe.exec(block))) {
      const s = m[1].trim();
      if (/\s/.test(s) || /[.?!]$/.test(s)) sentences.push({ file, s, kind: "answer" });
    }
    const promptRe = /\*\*\d+\.\*\* `([^`]+)`/g;
    while ((m = promptRe.exec(block))) {
      const s = m[1].trim();
      if (/\s/.test(s) || /[.?!]$/.test(s)) sentences.push({ file, s, kind: "prompt" });
    }
  }
}

const t0 = performance.now();
let ok = 0,
  fail = 0;
const samples: unknown[] = [];
const errCounts = new Map<string, number>();
for (const { file, s, kind } of sentences) {
  try {
    parse(s, tables);
    ok++;
  } catch (e) {
    fail++;
    const err = e instanceof Error ? e.message.split("\n")[0]! : String(e);
    errCounts.set(err, (errCounts.get(err) ?? 0) + 1);
    if (samples.length < 18) {
      samples.push({
        file: file.replace(`${grammarDir}/`, ""),
        kind,
        s,
        err,
      });
    }
  }
}
const ms = performance.now() - t0;
console.log(
  JSON.stringify(
    {
      count: sentences.length,
      ok,
      fail,
      ms: Math.round(ms),
      per: +(ms / Math.max(sentences.length, 1)).toFixed(3),
      topErrors: [...errCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8),
      samples,
    },
    null,
    2,
  ),
);
