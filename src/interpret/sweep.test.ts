/**
 * Reads every doc example (src/parse/llm-examples.ts) and writes to `tmp/interpret-sweep/`:
 * - `unread.json`: `unread` counts by construction id, most first, with up to three sample sources each;
 * - `unsettled.json`: the doc examples that hold a pair still unsettled, by pair;
 * - `families.json`: one example per frame family and per order kind (for fixtures and review).
 */
import assert from "node:assert/strict";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";

import { loadDefaultTables, parse } from "../parse/index.js";
import { buildExampleIndex } from "../parse/llm-examples.js";
import { allReadings, readParse } from "./read.js";

const rootDir = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const outDir = join(rootDir, "tmp", "interpret-sweep");

describe("reader sweep over the doc examples", () => {
  it("reads every doc example without throwing", () => {
    const tables = loadDefaultTables();
    const examples = buildExampleIndex(join(rootDir, "docs", "grammar"), tables);
    assert.ok(examples.length > 500, `only ${examples.length} examples`);
    const unread = new Map<string, { count: number; samples: string[] }>();
    const unsettled = new Map<string, string[]>();
    const families = new Map<string, { ageben: string; gloss: string; source: string }>();
    const failures: string[] = [];
    for (const example of examples) {
      let readings;
      try {
        readings = allReadings(readParse(parse(example.ageben, tables), { tables, text: example.source }));
      } catch (error) {
        failures.push(`${example.source} ${example.ageben}: ${(error as Error).message}`);
        continue;
      }
      for (const reading of readings) {
        for (const entry of reading.unread) {
          const id = `${entry.construction} (${entry.reason})`;
          const row = unread.get(id) ?? { count: 0, samples: [] };
          row.count++;
          if (row.samples.length < 3) row.samples.push(`${example.source}: ${example.ageben}`);
          unread.set(id, row);
        }
        for (const [a, b] of reading.unordered) {
          const pair = [a.family, b.family].sort().join(" × ");
          unsettled.set(pair, [...(unsettled.get(pair) ?? []), `${example.source}: ${example.ageben}`]);
        }
        const sample = { ageben: example.ageben, gloss: example.gloss, source: example.source };
        for (const frame of reading.frames) if (!families.has(frame.family)) families.set(frame.family, sample);
        for (const order of reading.order) if (!families.has(`order:${order.kind}`)) families.set(`order:${order.kind}`, sample);
      }
    }
    mkdirSync(outDir, { recursive: true });
    const sorted = [...unread.entries()].sort((a, b) => b[1].count - a[1].count);
    writeFileSync(join(outDir, "unread.json"), JSON.stringify(Object.fromEntries(sorted), null, 2) + "\n");
    writeFileSync(join(outDir, "unsettled.json"), JSON.stringify(Object.fromEntries(unsettled), null, 2) + "\n");
    writeFileSync(join(outDir, "families.json"), JSON.stringify(Object.fromEntries(families), null, 2) + "\n");
    assert.deepEqual(failures, []);
  });
});
