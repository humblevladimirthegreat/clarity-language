import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";

import {
  factorizationsForStem,
  parseCompoundCsv,
  retieCompoundRows,
  validateCompoundRows,
} from "./lexicon-compounds.js";
import { parsePublishedCsv } from "./lexicon-search.js";

const rootDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const publishedRoots = new Set(
  parsePublishedCsv(readFileSync(join(rootDir, "data", "lexicon-published.csv"), "utf8"))
    .map((row) => row.clarity)
    .filter(Boolean),
);

describe("lexicon-compounds", () => {
  it("validates the seed lexicon-compounds.csv", () => {
    const csv = readFileSync(join(rootDir, "data", "lexicon-compounds.csv"), "utf8");
    const rows = parseCompoundCsv(csv);
    const errors = validateCompoundRows(rows, publishedRoots);
    assert.equal(errors.length, 0, errors.map((e) => e.reason).join("; "));
  });

  it("rejects stem that is already a published root", () => {
    const stem = [...publishedRoots][0]!;
    const errors = validateCompoundRows(
      [
        {
          emoji: "",
          stem,
          left: stem.slice(0, 3),
          join: "l",
          right: "abede",
          literal: "bad",
          metaphorical: "",
          mnemonic: "",
        },
      ],
      publishedRoots,
    );
    assert.ok(errors.some((e) => /published simple root/.test(e.reason)));
  });

  it("rejects ambiguous factorization (sunlight-style)", () => {
    const published = new Set(["unu", "uluhu", "unulu", "uhu"]);
    const errors = validateCompoundRows(
      [
        {
          emoji: "",
          stem: "unululuhu",
          left: "unu",
          join: "l",
          right: "uluhu",
          literal: "sunlight",
          metaphorical: "",
          mnemonic: "",
        },
      ],
      published,
    );
    assert.ok(errors.some((e) => /ambiguous factorization/.test(e.reason)));
    const alts = factorizationsForStem("unululuhu", published);
    assert.ok(alts.length >= 2);
  });

  it("rejects invalid join letter", () => {
    const errors = validateCompoundRows(
      [
        {
          emoji: "",
          stem: "ohohuxabede",
          left: "ohohu",
          join: "x" as "l",
          right: "abede",
          literal: "bad",
          metaphorical: "",
          mnemonic: "",
        },
      ],
      publishedRoots,
    );
    assert.ok(errors.some((e) => /join must be/.test(e.reason)));
  });

  it("reties left/right and recomputes stem", () => {
    const { rows, changes } = retieCompoundRows(
      [
        {
          emoji: "🛏️",
          stem: "ohohulabede",
          left: "ohohu",
          join: "l",
          right: "abede",
          literal: "bedroom",
          metaphorical: "",
          mnemonic: "",
        },
      ],
      new Map([["ohohu", "ahaha"]]),
    );
    assert.equal(rows[0]?.stem, "ahahalabede");
    assert.equal(rows[0]?.left, "ahaha");
    assert.equal(rows[0]?.right, "abede");
    assert.equal(changes.some((c) => c.field === "stem" && c.to === "ahahalabede"), true);
  });
});
