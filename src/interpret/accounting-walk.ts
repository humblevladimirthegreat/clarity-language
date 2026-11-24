/**
 * The translation accounting walk (docs/meta/solver.md): every grammar example the reading pass in `src/find/` reads,
 * through `translate()`, checking that each reading in the program used all its parts. `accounting.test.ts` asserts on
 * its result and `npm run sweep` (`scripts/sweep.ts`) counts it, so both run the same walk. Not the reader coverage
 * sweep (`sweep.test.ts`).
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

import type { Example } from "../find/examples.js";
import { passFiles } from "../find/pass.js";
import { collectFileSpans } from "../find/walk.js";
import type { ClassifyTables } from "../parse/classify.js";
import { tmpPath, tmpRel } from "../tmp-paths.js";
import { translate } from "./translate.js";
import type { Frame, Reading, Term } from "./types.js";

/** The parts of a reading, walked apart from the translator's own inventory: frames (and their inner frames), links, SHARED details, blanks. */
export function walked(reading: Reading): object[] {
  const out: object[] = [];
  const frame = (f: Frame): void => {
    out.push(f);
    f.inner?.forEach(frame);
  };
  reading.frames.forEach(frame);
  reading.stanceLists?.forEach((l) => l.inner?.forEach(frame));
  out.push(...reading.links);
  const term = (t: Term | undefined): void => {
    if (t?.kind === "list") {
      out.push(...(t.sharedDetails ?? []));
      t.members.forEach(term);
    }
    if (t?.kind === "blank") out.push(t);
  };
  [reading.claim.verb, reading.claim.roles.z, reading.claim.roles.d, reading.claim.roles.b, ...reading.claim.predicate].forEach(term);
  return out;
}

/** A reading left out of a program, with the example it came from. `key` is the frame key; `unused` the parts a reading of reason `unused` left. */
export type WalkLeft = { file: string; text: string; reading: string; reason: string; key: string; unused: string[] };

export type Walk = {
  /** Readings the programs kept. */
  kept: number;
  /** One line per silent drop: a throw, a reading with no accounting, a part the inventory misses, a kept reading with an unused part. */
  silent: string[];
  /** Examples where `translate()` threw. */
  threw: { file: string; text: string; message: string }[];
  /** Readings of reason `unused` that name no part. */
  unnamed: string[];
  /** Every reading left out, by example. */
  left: WalkLeft[];
};

/** Each grammar example under `docs/grammar` that has readings, with its file: the walk `npm run sweep` and `npm run scope-report` share. */
export function forEachExample(tables: ClassifyTables, visit: (file: string, example: Example) => void): void {
  for (const file of passFiles(["docs/grammar"])) {
    for (const example of collectFileSpans(file, readFileSync(file, "utf8"), tables).examples) {
      if (example.readings.length) visit(file, example);
    }
  }
}

/** A snapshot saved under `tmp/state/` by `--save`, or undefined when none is saved. */
export function readSnapshot<T>(name: string): T | undefined {
  const path = tmpPath("state", name);
  return existsSync(path) ? (JSON.parse(readFileSync(path, "utf8")) as T) : undefined;
}

/** Write a `--save` snapshot under `tmp/state/`; returns its repo-relative path. */
export function writeSnapshot(name: string, data: unknown): string {
  const path = tmpPath("state", name);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(data, null, 2)}\n`);
  return tmpRel("state", name);
}

/** Walk the grammar examples under `docs/grammar` through `translate()`. */
export function walkAccounting(tables: ClassifyTables): Walk {
  const walk: Walk = { kept: 0, silent: [], threw: [], unnamed: [], left: [] };
  forEachExample(tables, (file, example) => {
    let t: ReturnType<typeof translate>;
    try {
      t = translate({ readings: example.readings }, { lexicon: tables });
    } catch (e) {
      const message = (e as Error).message;
      walk.threw.push({ file, text: example.text, message });
      walk.silent.push(`${file}: ${example.text}: translate() threw ${message}`);
      return;
    }
    for (const id of t.readings) {
      walk.kept++;
      const reading = example.readings.find((r) => r.id === id);
      const account = t.accounting.get(id);
      if (!reading || !account) {
        walk.silent.push(`${file}: ${example.text}: ${id} has no accounting`);
        continue;
      }
      const inventory = new Set(account.parts.map((p) => p.of));
      const missed = walked(reading).filter((p) => !inventory.has(p));
      const unused = account.parts.filter((p) => !account.used.has(p.of)).map((p) => p.text);
      if (missed.length) walk.silent.push(`${file}: ${example.text}: ${id} has ${missed.length} part(s) the inventory misses`);
      if (unused.length) walk.silent.push(`${file}: ${example.text}: ${id} kept with ${unused.join(", ")}`);
    }
    for (const l of t.left) {
      const key = l.key ?? l.construction;
      walk.left.push({ file, text: example.text, reading: l.reading, reason: l.reason, key, unused: l.unused ?? [] });
      if (l.reason === "unused" && !l.unused?.length) walk.unnamed.push(`${file}: ${example.text}: unused names its parts`);
    }
  });
  return walk;
}
