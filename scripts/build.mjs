#!/usr/bin/env node
// Full build: generate the word parser (only when word.peggy changed), typecheck,
// pad exercise spoilers (rewrites docs, so it runs before anything reads them),
// then run tests, doc lints, eslint and the VitePress build in parallel.
// Each parallel job's output is buffered and printed when it finishes.
import { spawn } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { mtime } from "./lib/run-bundled.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const bin = (name) => join(root, "node_modules", ".bin", name);

function run(label, cmd, args, { buffer = false } = {}) {
  const start = Date.now();
  return new Promise((resolve) => {
    const child = spawn(cmd, args, {
      cwd: root,
      stdio: buffer ? ["ignore", "pipe", "pipe"] : "inherit",
      env: { ...process.env, FORCE_COLOR: process.stdout.isTTY ? "1" : "0" },
    });
    let out = "";
    child.stdout?.on("data", (d) => (out += d));
    child.stderr?.on("data", (d) => (out += d));
    child.on("close", (code) => {
      const secs = ((Date.now() - start) / 1000).toFixed(1);
      if (buffer && (code !== 0 || process.env.BUILD_VERBOSE)) process.stdout.write(out);
      console.log(`${code === 0 ? "✓" : "✗"} ${label} (${secs}s)`);
      resolve({ label, code, out });
    });
  });
}

async function step(label, cmd, args) {
  const { code } = await run(label, cmd, args);
  if (code !== 0) process.exit(code);
}

const t0 = Date.now();

const grammar = join(root, "src", "parse", "word.peggy");
const generated = join(root, "src", "generated", "word-parser.js");
if (mtime(generated) < mtime(grammar)) {
  await step("generate:word", "npm", ["run", "-s", "generate:word"]);
}

await step("tsc", bin("tsc"), []);

await step("pad spoiler blanks", bin("tsx"), ["scripts/pad-exercise-spoiler-blanks.ts"]);

const jobs = [
  run("test", "npm", ["test", "--silent"], { buffer: true }),
  run("tsc vitepress", bin("tsc"), ["-p", "docs/grammar/.vitepress"], { buffer: true }),
  run("lint md balance", "node", ["scripts/lint-md-balance.mjs"], { buffer: true }),
  run("lint sidebar", bin("tsx"), ["scripts/lint-sidebar-pages.ts"], { buffer: true }),
  run("lint cheat sheets", bin("tsx"), ["scripts/lint-cheat-sheets.ts"], { buffer: true }),
  run("cheat sheet blocks", bin("tsx"), ["scripts/cheat-sheet-blocks.ts"], { buffer: true }),
  run("lint agazan", bin("tsx"), ["scripts/lint-agazan-docs.ts"], { buffer: true }),
  run("eslint", bin("eslint"), ["--cache", "--cache-location", "node_modules/.cache/eslint", "docs/grammar/.vitepress/components"], { buffer: true }),
  run("docs:publish", "npm", ["run", "-s", "docs:publish"], { buffer: true }),
];
const failed = (await Promise.all(jobs)).filter((r) => r.code !== 0);

console.log(`\nbuild ${failed.length ? "FAILED" : "ok"} in ${((Date.now() - t0) / 1000).toFixed(1)}s`);
if (failed.length) {
  console.log(`failed: ${failed.map((r) => r.label).join(", ")}`);
  process.exit(1);
}
