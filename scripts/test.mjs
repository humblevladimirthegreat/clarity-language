#!/usr/bin/env node
// Test runner: splits the test files across a few shards that run in parallel. Each
// shard runs its files in one process (--test-isolation=none), so the sentence parser,
// whose construction takes seconds, is built once per shard instead of once per file.
// Each shard's output is buffered and printed when it fails (or with BUILD_VERBOSE).
// Arguments pass through to the test runner; file arguments replace the default set.
import { spawn } from "node:child_process";
import { globSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const tsx = join(root, "node_modules", ".bin", "tsx");

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
      if (code !== 0 || process.env.BUILD_VERBOSE) process.stdout.write(out);
      console.log(`${code === 0 ? "✓" : "✗"} shard ${index}/${shards}: ${count("pass")}/${count("tests")} passed (${secs}s)`);
      resolve(code);
    });
  });
}

const codes = await Promise.all(Array.from({ length: shards }, (_, i) => runShard(i + 1)));
process.exit(codes.some((code) => code !== 0) ? 1 : 0);
