#!/usr/bin/env node
// Test runner: splits the test files across a few shards that run in parallel. Each
// shard runs its files in one process (--test-isolation=none), so the sentence parser,
// whose construction takes seconds, is built once per shard instead of once per file.
// Each shard's output is buffered and saved to tmp/test-last.log. stdout carries the shard lines
// and, on failure, each failing test's file:line, name, assertion, and the command to rerun it.
// BUILD_VERBOSE=1 prints every shard's full output instead; TEST_REPORT=raw (set by build.mjs)
// prints failing shards' full output, so the build log keeps it for `npm run verify`.
// Arguments pass through to the test runner; file arguments replace the default set.
import { spawn } from "node:child_process";
import { globSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { testFailureLines } from "./lib/build-output.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const tsx = join(root, "node_modules", ".bin", "tsx");
const LOG = "tmp/test-last.log";
const verbose = Boolean(process.env.BUILD_VERBOSE);
const raw = process.env.TEST_REPORT === "raw";

const SHARDS = 4;
const PATTERNS = [
  "src/**/*.test.ts",
  "docs/grammar/.vitepress/components/*.test.ts",
  "docs/grammar/.vitepress/lib/*.test.ts",
  "scripts/lib/*.test.ts",
];

const args = process.argv.slice(2);
const flags = args.filter((arg) => arg.startsWith("-"));
const named = args.filter((arg) => !arg.startsWith("-"));
const files = named.length ? named : globSync(PATTERNS, { cwd: root }).sort();
const shards = Math.max(1, Math.min(SHARDS, files.length));

function runShard(index) {
  const start = Date.now();
  const shardArgs = ["--test", "--test-isolation=none", `--test-shard=${index}/${shards}`, ...flags, ...files];
  return new Promise((resolve) => {
    const child = spawn(tsx, shardArgs, {
      cwd: root,
      stdio: ["ignore", "pipe", "pipe"],
      env: { ...process.env, FORCE_COLOR: process.stdout.isTTY ? "1" : "0" },
    });
    let out = "";
    child.stdout.on("data", (d) => (out += d));
    child.stderr.on("data", (d) => (out += d));
    child.on("close", (code) => {
      const secs = ((Date.now() - start) / 1000).toFixed(1);
      const count = (label) => out.match(new RegExp(`ℹ ${label} (\\d+)`))?.[1] ?? "?";
      if (verbose || (raw && code !== 0)) process.stdout.write(out);
      const status = `${code === 0 ? "✓" : "✗"} shard ${index}/${shards}: ${count("pass")}/${count("tests")} passed (${secs}s)`;
      console.log(status);
      resolve({ code, out: `${out}${status}\n` });
    });
  });
}

const results = await Promise.all(Array.from({ length: shards }, (_, i) => runShard(i + 1)));
const failed = results.filter((r) => r.code !== 0);
mkdirSync(join(root, "tmp"), { recursive: true });
writeFileSync(join(root, LOG), results.map((r) => r.out).join("\n"));
if (failed.length && !verbose && !raw) {
  console.log(`\nFailing tests (full output: ${LOG}; BUILD_VERBOSE=1 prints it all):`);
  for (const line of testFailureLines(failed.map((r) => r.out).join("\n"), root)) console.log(line);
}
process.exit(failed.length ? 1 : 0);
