import assert from "node:assert/strict";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

import { loadDefaultTables } from "../parse/index.js";
import { FindUsageError, parseFindArgs, passFiles, runPass, scanFile } from "./pass.js";
import { TERM_KEYS } from "./query.js";

const tables = loadDefaultTables();
const here = dirname(fileURLToPath(import.meta.url));
const fixtureMd = join(here, "fixtures/map-write.md");
const fixtureTs = join(here, "fixtures/map-write.ts");

describe("parseFindArgs", () => {
  it("reads queries and paths", () => {
    const options = parseFindArgs(["--word", "role=v", "--seq", "role=w", "role=g", "--json", "docs"]);
    assert.deepEqual(
      options.queries.map((q) => q.kind),
      ["word", "seq"],
    );
    assert.equal(options.output, "json");
    assert.deepEqual(options.paths, ["docs"]);
  });

  it("throws a usage error for a bad command line", () => {
    assert.throws(() => parseFindArgs([]), FindUsageError);
    assert.throws(() => parseFindArgs(["--word", "role=v", "--write"]), /--write needs --map/);
    assert.throws(() => parseFindArgs(["--construction", "/(/"]), /bad --construction regex/);
    assert.throws(() => parseFindArgs(["--seq", "..."]), /--seq needs at least one term/);
    assert.throws(() => parseFindArgs(["--values", "nope"]), /--values needs a key/);
  });

  it("reads ..., --same-clause, and the listing flags", () => {
    const options = parseFindArgs(["--same-clause", "--seq", "frame=binder", "...", "overlayKind=evidential"]);
    assert.equal(options.sameClause, true);
    const seq = options.queries[0]!;
    assert.ok(seq.kind === "seq" && seq.terms.length === 3 && seq.terms[1]!.length === 0);
    assert.deepEqual(parseFindArgs(["--values", "overlayKind"]).list, { kind: "values", key: "overlayKind" });
    assert.deepEqual(parseFindArgs(["--constructions"]).list, { kind: "constructions" });
  });

  it("--help carries every key", () => {
    try {
      parseFindArgs(["--help"]);
      assert.fail("expected help");
    } catch (error) {
      assert.ok(error instanceof FindUsageError && error.code === 0);
      for (const key of TERM_KEYS) assert.match(error.message, new RegExp(`^  ${key} `, "m"));
    }
  });
});

describe("scanFile", () => {
  it("returns plain records for a dry-run map", () => {
    const options = parseFindArgs(["--word", "family=joinMarker,series=e|o", "--map", "series=e:o,o:e"]);
    const record = scanFile(fixtureMd, options, tables);
    assert.ok(record.results.length > 0);
    assert.ok(record.replacements.length > 0);
    assert.deepEqual(record.parseErrors, []);
    assert.deepEqual(structuredClone(record), record);
  });
});

describe("runPass", () => {
  it("merges file records in walk order", () => {
    const options = parseFindArgs(["--word", "family=joinMarker"]);
    const files = passFiles([fixtureTs, fixtureMd, fixtureTs]);
    assert.deepEqual(files, [fixtureTs, fixtureMd]);
    const merged = runPass(files, options, tables);
    const each = files.flatMap((file) => scanFile(file, options, tables).results);
    assert.deepEqual(merged.results, each);
  });

  it("tallies values instead of listing hits", () => {
    const options = parseFindArgs(["--values", "family"]);
    const record = runPass([fixtureMd], options, tables);
    assert.deepEqual(record.results, []);
    assert.ok((record.tally.joinMarker ?? 0) > 0);
  });
});
