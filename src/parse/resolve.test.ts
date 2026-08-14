import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";

import { createClassifyTables } from "./classify.js";
import { parse } from "./index.js";
import { letterPrefix } from "./resolve.js";

const rootDir = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const tables = createClassifyTables(
  readFileSync(join(rootDir, "data", "lexicon-published.csv"), "utf8"),
  readFileSync(join(rootDir, "data", "lexicon-overlays.csv"), "utf8"),
);

function parseText(text: string) {
  return parse(text, tables);
}

function resolveOf(text: string) {
  const result = parseText(text);
  assert.ok(result.resolve);
  return result.resolve;
}

describe("letterPrefix (pronouns.md)", () => {
  it("cuts through the 2nd vowel", () => {
    assert.equal(letterPrefix("ulonu"), "ulo");
    assert.equal(letterPrefix("ogodo"), "ogo");
    assert.equal(letterPrefix("ogobo"), "ogo");
    assert.equal(letterPrefix("azawa"), "aza");
    assert.equal(letterPrefix("awu"), "awu");
  });
});

describe("resolve — content anaphors (pronouns.md)", () => {
  it("binds zulor to ulonu by letter prefix", () => {
    const { anaphors } = resolveOf("zulonun vawul. zulor vahural.");
    assert.equal(anaphors.length, 1);
    assert.equal(anaphors[0]!.kind, "content");
    assert.equal(anaphors[0]!.match, "letter");
    assert.equal(anaphors[0]!.pronoun.raw, "zulor");
    assert.equal(anaphors[0]!.antecedent?.raw, "zulonun");
  });

  it("binds zogor to the most recent ogo… stem (book, not dog)", () => {
    const { anaphors } = resolveOf("zogodol vezelel. zogobol gelebal. zogor vawul.");
    assert.equal(anaphors[0]!.match, "letter");
    assert.equal(anaphors[0]!.pronoun.raw, "zogor");
    assert.equal(anaphors[0]!.antecedent?.raw, "zogobol");
  });

  it("binds full-root zogodor to the dog, skipping the book", () => {
    const { anaphors } = resolveOf("zogodol vezelel. zogobol gelebal. zogodor vawul.");
    assert.equal(anaphors[0]!.match, "fullRoot");
    assert.equal(anaphors[0]!.pronoun.raw, "zogodor");
    assert.equal(anaphors[0]!.antecedent?.raw, "zogodol");
  });

  it("binds zazawar to azawa by full root", () => {
    const { anaphors } = resolveOf("zazawan vawul. zazawar vahural.");
    assert.equal(anaphors[0]!.match, "fullRoot");
    assert.equal(anaphors[0]!.antecedent?.raw, "zazawan");
  });

  it("binds vawur to the prior verb (pronouns.md intermediate)", () => {
    const { anaphors } = resolveOf("zazawan vawul. zulonun vawur.");
    assert.equal(anaphors[0]!.pronoun.raw, "vawur");
    assert.equal(anaphors[0]!.match, "fullRoot");
    assert.equal(anaphors[0]!.antecedent?.raw, "vawul");
  });

  it("leaves dangling zulor unresolved", () => {
    const { anaphors } = resolveOf("zulor vawul.");
    assert.equal(anaphors[0]!.pronoun.raw, "zulor");
    assert.equal(anaphors[0]!.antecedent, undefined);
  });

  it("does not bind statement zar as a content anaphor", () => {
    const { anaphors, asks } = resolveOf("zar vawul.");
    assert.equal(anaphors.length, 0);
    assert.equal(asks[0]!.kind, "none");
  });

  it("does not bind value-channel -r as an anaphor", () => {
    const { anaphors } = resolveOf("zazawan hobolaxar.");
    assert.equal(
      anaphors.filter((a) => a.pronoun.raw === "hobolaxar").length,
      0,
    );
  });
});

describe("resolve — span and number anaphors", () => {
  it("binds writing d[=] to the most recent cite (spans.md)", () => {
    const { anaphors } = resolveOf("d[hi] vawul. d[=] vahural.");
    const span = anaphors.find((a) => a.kind === "span");
    assert.ok(span);
    assert.equal(span!.typeVowel, "a");
    assert.equal(span!.pronoun.raw, "d[=]");
    assert.equal(span!.antecedent?.raw, "d[hi]");
  });

  it("binds g=+ to the prior scalar (numbers.md)", () => {
    const { anaphors } = resolveOf("z+3 vawul. z=+ vahural.");
    const num = anaphors.find((a) => a.kind === "number");
    assert.ok(num);
    assert.equal(num!.pronoun.raw, "z=+");
    assert.equal(num!.antecedent?.raw, "z+3");
  });
});

describe("resolve — role anaphors (roles.md)", () => {
  it("binds zaxozower to the prior conflict verb", () => {
    const { anaphors } = resolveOf("zumogon vozowel. zaxozower vurunul.");
    const role = anaphors.find((a) => a.kind === "role");
    assert.ok(role);
    assert.equal(role!.pronoun.raw, "zaxozower");
    assert.equal(role!.roleVowel, "a");
    assert.equal(role!.antecedent?.raw, "vozowel");
  });
});

describe("resolve — yes/no vs fill-ask (questions.md)", () => {
  it("classifies jol zumogon vawul. as yes/no", () => {
    const { asks } = resolveOf("jol zumogon vawul.");
    assert.equal(asks[0]!.kind, "yesNo");
    assert.equal(asks[0]!.gaps.length, 0);
  });

  it("classifies jol zar vawul. as fill-ask", () => {
    const { asks, anaphors } = resolveOf("jol zar vawul.");
    assert.equal(asks[0]!.kind, "fillAsk");
    assert.equal(asks[0]!.gaps.map((g) => g.raw).join(" "), "zar");
    assert.equal(anaphors.length, 0);
  });

  it("orders fill-all gaps zar … dar", () => {
    const { asks } = resolveOf("jol zar vejol dar.");
    assert.equal(asks[0]!.kind, "fillAsk");
    assert.deepEqual(
      asks[0]!.gaps.map((g) => g.raw),
      ["zar", "dar"],
    );
  });

  it("classifies jom zar vawul. as fill-ask", () => {
    const { asks } = resolveOf("jom zar vawul.");
    assert.equal(asks[0]!.kind, "fillAsk");
  });
});

describe("resolve — SHARED /ɡ/ (comparatives.md / numbers.md)", () => {
  it("reads rank + SHARED scale as scale", () => {
    const { shared } = resolveOf("zazawan zulonun zel gonudam.");
    assert.equal(shared.length, 1);
    assert.equal(shared[0]!.role, "scale");
    assert.equal(shared[0]!.join.raw, "zel");
    assert.equal(shared[0]!.shared.word.raw, "gonudam");
  });

  it("reads set a + SHARED as distribute", () => {
    const { shared } = resolveOf("zogodol zagadal zal gonudam.");
    assert.equal(shared[0]!.role, "distribute");
  });

  it("reads ae + SHARED as equative", () => {
    const { shared } = resolveOf("zazawan zulonun zael gonudam.");
    assert.equal(shared[0]!.role, "equative");
  });

  it("reads two number endpoints + SHARED as continuum", () => {
    const { shared } = resolveOf("z+3 z+5 zel gumedul.");
    assert.equal(shared[0]!.role, "continuum");
    assert.equal(shared[0]!.shared.word.raw, "gumedul");
  });

  it("does not treat bare z+3 z+5 zel as a continuum", () => {
    const { shared } = resolveOf("z+3 z+5 zel.");
    assert.equal(shared.length, 0);
  });
});
