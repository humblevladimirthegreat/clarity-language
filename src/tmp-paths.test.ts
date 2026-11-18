import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, utimesSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, describe, it } from "node:test";

import { SCRATCH_MAX_AGE_MS, strayTmpEntries, sweepScratch, tmpPath, tmpRel, TMP_ROOT } from "./tmp-paths.js";

const root = mkdtempSync(join(tmpdir(), "tmp-paths-"));
after(() => rmSync(root, { recursive: true, force: true }));

function touch(path: string, ageMs: number, now: number): void {
  writeFileSync(path, "x");
  const when = new Date(now - ageMs);
  utimesSync(path, when, when);
}

describe("tmp paths", () => {
  it("places a file in its tier", () => {
    assert.equal(tmpPath("cache", "cmudict.dict"), join(TMP_ROOT, "cache", "cmudict.dict"));
    assert.equal(tmpRel("logs", "build-last.log"), "tmp/logs/build-last.log");
  });

  it("sweeps scratch entries whose newest file is older than a week", () => {
    const now = Date.now();
    const dir = join(root, "scratch");
    mkdirSync(join(dir, "old-dir"), { recursive: true });
    mkdirSync(join(dir, "live-dir"), { recursive: true });
    touch(join(dir, "old.mjs"), SCRATCH_MAX_AGE_MS + 1000, now);
    touch(join(dir, "new.mjs"), 1000, now);
    touch(join(dir, "old-dir", "a.md"), SCRATCH_MAX_AGE_MS + 1000, now);
    touch(join(dir, "live-dir", "a.md"), SCRATCH_MAX_AGE_MS + 1000, now);
    touch(join(dir, "live-dir", "b.md"), 1000, now);
    for (const name of ["old-dir", "live-dir"]) {
      const when = new Date(now - SCRATCH_MAX_AGE_MS - 1000);
      utimesSync(join(dir, name), when, when);
    }
    assert.deepEqual(sweepScratch(now, dir).sort(), ["old-dir", "old.mjs"]);
    assert.deepEqual(sweepScratch(now, join(root, "missing")), []);
  });

  it("lists what sits outside the tiers", () => {
    const dir = join(root, "tmp");
    mkdirSync(join(dir, "cache"), { recursive: true });
    mkdirSync(join(dir, "loose-dir"), { recursive: true });
    writeFileSync(join(dir, "loose.txt"), "x");
    writeFileSync(join(dir, "state"), "a file named like a tier");
    assert.deepEqual(strayTmpEntries(dir), ["loose-dir", "loose.txt", "state"]);
  });
});
