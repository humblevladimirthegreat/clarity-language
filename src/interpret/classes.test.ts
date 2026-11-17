import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";

import { constructionRegistry } from "../parse/constructions.js";
import { loadDefaultTables } from "../parse/index.js";
import { FRAME_KEYS, pairRow, type FrameFamily } from "../parse/scope.js";
import { CLASSES, constructionKey } from "./classes.js";

const rootDir = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const note = readFileSync(join(rootDir, "docs", "meta", "interpreter.md"), "utf8");
const section = (heading: string, next: string): string => note.slice(note.indexOf(heading), note.indexOf(next));
const overlays = [...loadDefaultTables().overlays.values()];

/** The note's classification table: key → [class, first anchor]. */
const noteRows = new Map<string, [string, string]>();
for (const m of section("## Classification table", "## Links").matchAll(/^\| (\w+) \| `([^`]+)` \| ([^|]+?) \|([^|]*?)\|(.*)\|$/gm)) {
  noteRows.set(`${m[1]}:${m[2]}`, [m[3]!.trim(), m[4]!.trim().match(/^`([^`]+)`/)?.[1] ?? ""]);
}

describe("classification table (interpreter.md#classification-table)", () => {
  it("transcribes every row of the note, with its class and anchor", () => {
    assert.ok(noteRows.size > 170, `parsed only ${noteRows.size} note rows`);
    const wrong: string[] = [];
    for (const [key, [cls, anchor]] of noteRows) {
      const row = CLASSES[key];
      if (!row) wrong.push(`${key}: missing`);
      else if (row.cls !== cls || row.anchor !== anchor) wrong.push(`${key}: ${row.cls} ${row.anchor} ≠ note ${cls} ${anchor}`);
    }
    assert.deepEqual(wrong, []);
  });

  it("takes every frame row from scope.ts, and every frame row of the note is one", () => {
    for (const [key, row] of Object.entries(FRAME_KEYS)) assert.equal(CLASSES[key]?.cls, `frame:${row.family}`, key);
    const noteFrames = [...noteRows].filter(([, [cls]]) => cls.startsWith("frame:")).map(([key]) => key);
    assert.deepEqual(noteFrames.filter((key) => !FRAME_KEYS[key]), []);
  });

  it("maps every construction id to a row (interpreter.md#construction-ids)", () => {
    const unmapped = [...constructionRegistry(overlays).keys()].filter((id) => {
      const key = constructionKey(id, overlays);
      return !key || !CLASSES[key];
    });
    assert.deepEqual(unmapped, [], "classify each new construction in docs/meta/interpreter.md and src/interpret/classes.ts");
  });

  it("maps construction ids as the note's Construction ids section lists them", () => {
    const listed = new Map<string, string>();
    for (const m of section("## Construction ids", "\n## Z").matchAll(/^\| `([^`]+)` \| (.*) \|$/gm)) {
      for (const id of m[2]!.matchAll(/`([^`]+)`/g)) listed.set(id[1]!, m[1]!);
    }
    assert.ok(listed.size > 300, `parsed only ${listed.size} ids from the note`);
    const differ = [...listed].filter(([id, key]) => constructionKey(id, overlays) !== key).map(([id, key]) => `${id}: note ${key}`);
    assert.deepEqual(differ, []);
  });
});

describe("pair table coverage (interpreter.md#pair-table)", () => {
  it("has a row for every two families that can share a clause", () => {
    const families = [...new Set(Object.values(FRAME_KEYS).filter((row) => row.reach === "clause").map((row) => row.family))].filter(
      (family) => !["bar", "quote", "unknown"].includes(family),
    ) as FrameFamily[];
    const missing: string[] = [];
    for (let i = 0; i < families.length; i++) {
      for (let j = i + 1; j < families.length; j++) if (!pairRow(families[i]!, families[j]!)) missing.push(`${families[i]} × ${families[j]}`);
    }
    // Same-family pairs: stance has a row; binder and intention are the scope statements' rows.
    for (const family of ["stance", "binder", "intention"] as const) if (!pairRow(family, family)) missing.push(`${family} × ${family}`);
    assert.deepEqual(missing, []);
  });
});
