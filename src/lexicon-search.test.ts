import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";

import {
  attachOverlays,
  createLexiconIndex,
  createOverlayIndex,
  parseOverlayCsv,
  parsePublishedCsv,
  searchLexicon,
  splitPosPrefixedQuery,
  tokenizeLiteral,
} from "./lexicon-search.js";

const rootDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const publishedPath = join(rootDir, "data", "lexicon-published.csv");
const overlayPath = join(rootDir, "data", "lexicon-overlays.csv");

describe("tokenizeLiteral", () => {
  it("expands hyphenated literals into searchable tokens", () => {
    const tokens = tokenizeLiteral("nervous-laugh");
    assert.match(tokens, /nervous/);
    assert.match(tokens, /laugh/);
    assert.match(tokens, /nervous-laugh/);
  });
});

describe("splitPosPrefixedQuery", () => {
  it("strips a PoS letter before a vowel-initial sense-form", () => {
    assert.deepEqual(splitPosPrefixedQuery("van"), { pos: "v", stem: "an" });
    assert.deepEqual(splitPosPrefixedQuery("huhunum"), { pos: "h", stem: "uhunum" });
    assert.deepEqual(splitPosPrefixedQuery("gan"), { pos: "g", stem: "an" });
  });

  it("leaves gloss queries and bare stems alone", () => {
    assert.deepEqual(splitPosPrefixedQuery("hearsay"), { pos: null, stem: "hearsay" });
    assert.deepEqual(splitPosPrefixedQuery("an"), { pos: null, stem: "an" });
    assert.deepEqual(splitPosPrefixedQuery("uze"), { pos: null, stem: "uze" });
  });
});

describe("overlay csv", () => {
  it("parses overlay rows with definition and mnemonic", () => {
    const overlays = parseOverlayCsv(readFileSync(overlayPath, "utf8"));
    assert.ok(overlays.length > 0);
    const witnessed = overlays.find((row) => row.senseForm === "uhunum" && row.pos === "h");
    assert.ok(witnessed);
    assert.match(witnessed.definition, /witnessed/i);
    assert.ok(witnessed.mnemonic.length > 0);
  });
});

describe("searchLexicon", () => {
  const rows = parsePublishedCsv(readFileSync(publishedPath, "utf8"));
  const overlays = parseOverlayCsv(readFileSync(overlayPath, "utf8"));
  const index = createLexiconIndex(rows);
  const overlayIndex = createOverlayIndex(overlays);
  const attached = attachOverlays(rows, overlays);

  it('finds "laugh" via literal and hyphen tokenization', () => {
    const results = searchLexicon(index, rows, "laugh", { limit: 50, overlays, overlayIndex });
    const literals = results.map((r) => r.literal);
    assert.ok(literals.includes("laugh"));
    assert.ok(literals.includes("nervous-laugh"));
  });

  it('finds metaphorical "happy" on smile / uze', () => {
    const results = searchLexicon(index, rows, "happy", { limit: 20, overlays, overlayIndex });
    const hit = results.find((r) => r.clarity === "uze");
    assert.ok(hit, "expected smile/uze among happy results");
    assert.equal(hit.literal, "smile");
    assert.ok(hit.matchFields.includes("metaphorical"));
  });

  it('finds clarity root "uze"', () => {
    const results = searchLexicon(index, rows, "uze", { limit: 10, overlays, overlayIndex });
    assert.ok(results.some((r) => r.clarity === "uze"));
    const top = results[0];
    assert.equal(top?.clarity, "uze");
    assert.ok(top?.matchFields.includes("clarity"));
  });

  it("finds evidential sense_form uhunum and attaches overlays to fishing row", () => {
    const results = searchLexicon(index, rows, "uhunum", { limit: 10, overlays, overlayIndex });
    const hit = results.find((r) => r.clarity === "uhunu");
    assert.ok(hit, "expected fishing/uhunu for uhunum query");
    assert.ok(hit.overlays.some((o) => o.senseForm === "uhunum" && o.pos === "h"));
  });

  it("attaches benchmark overlays to published roots", () => {
    const onugoIndex = rows.findIndex((r) => r.clarity === "onugo");
    assert.ok(onugoIndex >= 0);
    const rowOverlays = attached.get(onugoIndex) ?? [];
    assert.ok(rowOverlays.some((o) => o.senseForm === "onugon" && o.pos === "z"));
  });

  it("finds join-act overlay van without a published row", () => {
    const results = searchLexicon(index, rows, "van", { limit: 10, overlays, overlayIndex });
    const hit = results.find(
      (r) => r.overlayOnly && r.overlays[0]?.senseForm === "an" && r.overlays[0]?.pos === "v",
    );
    assert.ok(hit, "expected overlay-only an+v for van query");
    assert.equal(hit.clarity, "an");
    assert.match(hit.literal, /includes/i);
    assert.ok(hit.mnemonic.length > 0);
  });

  it("shares join stems across v/g/h with distinct pos rows", () => {
    const anRows = overlays.filter((o) => o.senseForm === "an");
    assert.deepEqual(
      anRows.map((o) => o.pos).sort(),
      ["g", "h", "v"],
    );
    const gan = searchLexicon(index, rows, "gan", { limit: 10, overlays, overlayIndex }).find(
      (r) => r.overlayOnly && r.overlays[0]?.senseForm === "an" && r.overlays[0]?.pos === "g",
    );
    assert.ok(gan);
    assert.equal(gan.clarity, "an");
  });

  it("finds evidential via spelled word huhunum", () => {
    const results = searchLexicon(index, rows, "huhunum", { limit: 10, overlays, overlayIndex });
    const hit = results.find((r) => r.clarity === "uhunu");
    assert.ok(hit, "expected fishing/uhunu for huhunum query");
    assert.ok(hit.overlays.some((o) => o.senseForm === "uhunum" && o.pos === "h"));
  });

  it("finds overlay rows by definition text", () => {
    const results = searchLexicon(index, rows, "hearsay", { limit: 10, overlays, overlayIndex });
    assert.ok(results.some((r) => r.overlays.some((o) => o.senseForm === "erarem")));
  });
});
