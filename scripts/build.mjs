#!/usr/bin/env node
// Full build: generate the word parser (only when word.peggy changed), typecheck,
// pad exercise spoilers (rewrites docs, so it runs before anything reads them),
// then run tests, doc lints, eslint and the VitePress build in parallel.
// Every job's output is buffered and saved to tmp/build-last.log, in the order jobs finish,
// each followed by its `✓` / `✗ label (12.3s)` line (`npm run verify` reads that log).
// stdout carries only the status lines, warnings, `build ok` / `build FAILED`, and on failure
// a Failures footer: each failing job's issue lines with file:line, last. BUILD_VERBOSE=1 also
// prints every job's full output.
import { spawn } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { buildFooter } from "./lib/build-output.ts";
import { mtime } from "./lib/run-bundled.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const bin = (name) => join(root, "node_modules", ".bin", name);

const WARNING_LIMIT = 20;
const LOG = "tmp/build-last.log";
const verbose = Boolean(process.env.BUILD_VERBOSE);
const log = [];

/** A passing job's `warning:` lines: the first few, then how many more and where to see them all. */
function printWarnings(label, out) {
  const warnings = out.split("\n").filter((line) => line.startsWith("warning: "));
  for (const line of warnings.slice(0, WARNING_LIMIT)) console.log(line);
  if (warnings.length > WARNING_LIMIT) {
    console.log(`warning: … ${warnings.length - WARNING_LIMIT} more from ${label}; set BUILD_VERBOSE=1 or run that step alone to list them all`);
  }
}

function run(label, cmd, args, env = {}) {
  const start = Date.now();
  return new Promise((resolve) => {
    const child = spawn(cmd, args, {
      cwd: root,
      stdio: ["ignore", "pipe", "pipe"],
      env: { ...process.env, FORCE_COLOR: "0", ...env },
    });
    let out = "";
    child.stdout.on("data", (d) => (out += d));
    child.stderr.on("data", (d) => (out += d));
    child.on("close", (code) => {
      const secs = ((Date.now() - start) / 1000).toFixed(1);
      const status = `${code === 0 ? "✓" : "✗"} ${label} (${secs}s)`;
      if (verbose) process.stdout.write(out);
      else printWarnings(label, out);
      console.log(status);
      log.push(out, status);
      resolve({ label, code, out });
    });
  });
}

/** Write the full log, then end stdout with the footer for every failed job. */
function finish(failed) {
  const summary = `build ${failed.length ? "FAILED" : "ok"} in ${((Date.now() - t0) / 1000).toFixed(1)}s`;
  log.push(`\n${summary}`);
  if (failed.length) log.push(`failed: ${failed.map((r) => r.label).join(", ")}`);
  mkdirSync(join(root, "tmp"), { recursive: true });
  writeFileSync(join(root, LOG), `${log.join("\n")}\n`);
  console.log(`\n${summary}`);
  if (failed.length) {
    console.log("");
    for (const line of buildFooter(failed, LOG)) console.log(line);
  }
  process.exit(failed.length ? 1 : 0);
}

async function step(label, cmd, args) {
  const result = await run(label, cmd, args);
  if (result.code !== 0) finish([result]);
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
  // BUILD_SKIP_TEST=1 drops the test job (npm run verify -- --fast).
  ...(process.env.BUILD_SKIP_TEST ? [] : [run("test", "npm", ["test", "--silent"], { TEST_REPORT: "raw" })]),
  run("tsc vitepress", bin("tsc"), ["-p", "docs/grammar/.vitepress"]),
  run("lint md balance", "node", ["scripts/lint-md-balance.mjs"]),
  run("lint sidebar", bin("tsx"), ["scripts/lint-sidebar-pages.ts"]),
  run("lint forward links", bin("tsx"), ["scripts/lint-forward-links.ts"]),
  run("lint cheat sheets", bin("tsx"), ["scripts/lint-cheat-sheets.ts"]),
  run("lint claritish editor", bin("tsx"), ["scripts/lint-claritish-editor.ts"]),
  run("lint game", bin("tsx"), ["scripts/lint-game.ts"]),
  run("cheat sheet blocks", bin("tsx"), ["scripts/cheat-sheet-blocks.ts"]),
  run("lint ageben", bin("tsx"), ["scripts/lint-ageben-docs.ts"]),
  run("eslint", bin("eslint"), ["--cache", "--cache-location", "node_modules/.cache/eslint", "docs/grammar/.vitepress/components"]),
  run("docs:publish", "npm", ["run", "-s", "docs:publish"]),
  run("flashcards", "npm", ["run", "-s", "flashcards"]),
];
finish((await Promise.all(jobs)).filter((r) => r.code !== 0));
