/**
 * Reads every doc example (src/parse/llm-examples.ts) and writes to `tmp/out/interpret-sweep/`:
 * - `unread.json`: `unread` counts by construction id, most first, with up to three sample sources each;
 * - `unsettled.json`: the doc examples that hold a pair still unsettled, by pair;
 * - `families.json`: one example per frame family and per order kind (for fixtures and review);
 * - `carried.json`: `carriedFrame` links by kind (channel, dated channel, holder, NOTIONAL), with up to five samples each
 *   (evidentiality.md#carry-forward);
 * - `coverage.json`: words placed nowhere or more than once (coverage.ts), by classification key, by construction id
 *   and by tree slot, with the share of sentences that have any.
 *
 * The coverage ratchet (`coverage-ratchet.json`): the totals of missing and doubled words may not rise, and a key with
 * no problems may not gain one. When the counts drop, lower the file to the new counts.
 */
import assert from "node:assert/strict";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";

import { loadDefaultTables, parse } from "../parse/index.js";
import { buildExampleIndex } from "../parse/llm-examples.js";
import { coverage, type WordSlot } from "./coverage.js";
import { allReadings, readParse } from "./read.js";
import { constructionFor, wordKey } from "./read-context.js";

const here = dirname(fileURLToPath(import.meta.url));
const rootDir = join(here, "..", "..");
const outDir = join(rootDir, "tmp", "out", "interpret-sweep");
const ratchetPath = join(here, "coverage-ratchet.json");

type Sample = { ageben: string; source: string; word: string; slot: string; places?: string[] };
type Group = { missing: number; doubled: number; samples: Sample[] };
type Ratchet = { missing: number; doubled: number; keys: Record<string, number> };

/** Groups by one name, most problems first, up to three samples each. */
class Groups {
  private rows = new Map<string, Group>();
  add(name: string, kind: "missing" | "doubled", sample: Sample): void {
    const row = this.rows.get(name) ?? { missing: 0, doubled: 0, samples: [] };
    row[kind]++;
    if (row.samples.length < 3) row.samples.push(sample);
    this.rows.set(name, row);
  }
  json(): Record<string, Group> {
    return Object.fromEntries([...this.rows.entries()].sort((a, b) => b[1].missing + b[1].doubled - (a[1].missing + a[1].doubled)));
  }
  counts(): Record<string, number> {
    return Object.fromEntries(Object.entries(this.json()).map(([name, row]) => [name, row.missing + row.doubled]));
  }
}

let ratchetNow: Ratchet | undefined;

describe("reader sweep over the doc examples", () => {
  it("reads every doc example without throwing", () => {
    const tables = loadDefaultTables();
    const examples = buildExampleIndex(join(rootDir, "docs", "grammar"), tables);
    assert.ok(examples.length > 500, `only ${examples.length} examples`);
    const unread = new Map<string, { count: number; samples: string[] }>();
    const unsettled = new Map<string, string[]>();
    const families = new Map<string, { ageben: string; gloss: string; source: string }>();
    const failures: string[] = [];
    const carried = new Map<string, { links: number; sentences: number; samples: string[] }>();
    const byKey = new Groups();
    const byConstruction = new Groups();
    const bySlot = new Groups();
    const totals = { examples: 0, examplesWithProblem: 0, utterances: 0, utterancesWithProblem: 0, words: 0, missing: 0, doubled: 0, pointerOnly: 0 };
    for (const example of examples) {
      let readings;
      let result;
      try {
        result = parse(example.ageben, tables);
        readings = readParse(result, { tables, text: example.source });
      } catch (error) {
        failures.push(`${example.source} ${example.ageben}: ${(error as Error).message}`);
        continue;
      }
      const cover = coverage(result, readings);
      const sample = (entry: WordSlot, places?: string[]): Sample => ({
        ageben: example.ageben,
        source: example.source,
        word: entry.word.raw,
        slot: entry.slot,
        ...(places ? { places } : {}),
      });
      const problem = new Set<number>();
      for (const entry of cover.missing) {
        const key = wordKey(entry.word);
        byKey.add(key, "missing", sample(entry));
        byConstruction.add(constructionFor(key, entry.word), "missing", sample(entry));
        bySlot.add(entry.slot, "missing", sample(entry));
        problem.add(entry.utterance);
      }
      for (const entry of cover.doubled) {
        const key = wordKey(entry.word);
        const places = entry.places.map((p) => `${p.reading} ${p.place}`);
        byKey.add(key, "doubled", sample(entry, places));
        byConstruction.add(constructionFor(key, entry.word), "doubled", sample(entry, places));
        bySlot.add(entry.slot, "doubled", sample(entry, places));
        problem.add(entry.utterance);
      }
      totals.examples++;
      if (problem.size) totals.examplesWithProblem++;
      totals.utterances += result.utterances.length;
      totals.utterancesWithProblem += problem.size;
      totals.words += cover.words.length;
      totals.missing += cover.missing.length;
      totals.doubled += cover.doubled.length;
      totals.pointerOnly += cover.pointerOnly.length;

      for (const reading of allReadings(readings)) {
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
        const kinds = new Set<string>();
        for (const link of reading.links) {
          if (link.kind !== "carriedFrame") continue;
          const kind = link.anchor === "dated-channel.md#counting-from-now" ? "dated" : link.key.replace(/^carry:/, "");
          const row = carried.get(kind) ?? { links: 0, sentences: 0, samples: [] };
          row.links++;
          if (!kinds.has(kind)) {
            kinds.add(kind);
            row.sentences++;
            const text = `${example.source}: ${example.ageben}`;
            if (row.samples.length < 5 && !row.samples.includes(text)) row.samples.push(text);
          }
          carried.set(kind, row);
        }
      }
    }
    mkdirSync(outDir, { recursive: true });
    const sorted = [...unread.entries()].sort((a, b) => b[1].count - a[1].count);
    writeFileSync(join(outDir, "unread.json"), JSON.stringify(Object.fromEntries(sorted), null, 2) + "\n");
    writeFileSync(join(outDir, "unsettled.json"), JSON.stringify(Object.fromEntries(unsettled), null, 2) + "\n");
    writeFileSync(join(outDir, "carried.json"), JSON.stringify(Object.fromEntries([...carried.entries()].sort()), null, 2) + "\n");
    writeFileSync(join(outDir, "families.json"), JSON.stringify(Object.fromEntries(families), null, 2) + "\n");
    const pct = (n: number, of: number): string => `${((100 * n) / Math.max(of, 1)).toFixed(1)}%`;
    const report = {
      totals: {
        ...totals,
        examplesWithProblemShare: pct(totals.examplesWithProblem, totals.examples),
        utterancesWithProblemShare: pct(totals.utterancesWithProblem, totals.utterances),
      },
      byKey: byKey.json(),
      byConstruction: byConstruction.json(),
      bySlot: bySlot.json(),
    };
    writeFileSync(join(outDir, "coverage.json"), JSON.stringify(report, null, 2) + "\n");
    ratchetNow = { missing: totals.missing, doubled: totals.doubled, keys: byKey.counts() };
    assert.deepEqual(failures, []);
  });

  it("coverage ratchet: missing and doubled words do not rise, and a clean key stays clean", () => {
    assert.ok(ratchetNow, "the sweep did not run");
    const stored = JSON.parse(readFileSync(ratchetPath, "utf8")) as Ratchet;
    const now = ratchetNow;
    const gained = Object.keys(now.keys).filter((key) => !(key in stored.keys));
    assert.deepEqual(gained, [], `keys with no coverage problems before now have some (coverage.ts; tmp/out/interpret-sweep/coverage.json)`);
    assert.ok(now.missing <= stored.missing, `missing words rose: ${stored.missing} → ${now.missing} (tmp/out/interpret-sweep/coverage.json)`);
    assert.ok(now.doubled <= stored.doubled, `doubled words rose: ${stored.doubled} → ${now.doubled} (tmp/out/interpret-sweep/coverage.json)`);
  });
});
