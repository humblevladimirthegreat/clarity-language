import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";

import {
  attachOverlays,
  createLexiconIndex,
  createOverlayIndex,
  parseEnglishByPos,
  parseOverlayCsv,
  parsePublishedCsv,
  searchLexicon,
  splitPosPrefixedQuery,
  tokenizeLiteral,
  validateOverlayPublishedHosts,
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

describe("parseEnglishByPos", () => {
  it("treats bare keys as literal and m. as metaphor-only", () => {
    const map = parseEnglishByPos("v:smell; m.v:intuit", {
      literal: "nose",
      metaphorical: "intuition",
    });
    assert.equal(map.literal.v, "smell");
    assert.equal(map.metaphorical.v, "intuit");
    assert.equal(map.literal.h, undefined);
  });

  it("rejects packing that copies the sense lemma", () => {
    assert.throws(() => parseEnglishByPos("v:eye", { literal: "eye", metaphorical: "perception" }));
    assert.throws(() =>
      parseEnglishByPos("m.v:perception", { literal: "eye", metaphorical: "perception" }),
    );
  });

  it("rejects m. when there is no metaphorical sense", () => {
    assert.throws(() => parseEnglishByPos("m.v:intuit", { literal: "hand" }));
  });
});

describe("overlay csv", () => {
  it("parses overlay rows with definition and mnemonic", () => {
    const overlays = parseOverlayCsv(readFileSync(overlayPath, "utf8"));
    assert.ok(overlays.length > 0);
    const witnessed = overlays.find((row) => /witnessed evidential/i.test(row.definition) && row.pos === "h");
    assert.ok(witnessed);
    assert.ok(witnessed.mnemonic.length > 0);
  });

  it("requires a published host for every hosted overlay", () => {
    const published = parsePublishedCsv(readFileSync(publishedPath, "utf8"));
    const overlays = parseOverlayCsv(readFileSync(overlayPath, "utf8"));
    const errors = validateOverlayPublishedHosts(overlays, published);
    assert.equal(errors.length, 0, errors.map((e) => e.reason).join("; "));
  });

  it("flags an overlay emoji with no published row", () => {
    const errors = validateOverlayPublishedHosts(
      [
        {
          senseForm: "ewonol",
          pos: "h",
          emoji: "⛅",
          kind: "universality",
          gloss: "COMMON",
          definition: "universality COMMON",
          mnemonic: "",
        },
      ],
      [],
    );
    assert.ok(errors.some((e) => /no published lexicon row/.test(e.reason)));
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

  it('finds metaphorical "happy" on smile', () => {
    const results = searchLexicon(index, rows, "happy", { limit: 20, overlays, overlayIndex });
    const hit = results.find((r) => r.literal === "smile");
    assert.ok(hit, "expected smile among happy results");
    assert.ok(hit.matchFields.includes("metaphorical"));
  });

  it("finds a published row by its clarity root", () => {
    const smile = rows.find((r) => r.literal === "smile");
    assert.ok(smile);
    const results = searchLexicon(index, rows, smile.clarity, { limit: 10, overlays, overlayIndex });
    assert.ok(results.some((r) => r.clarity === smile.clarity));
    const top = results[0];
    assert.equal(top?.clarity, smile.clarity);
    assert.ok(top?.matchFields.includes("clarity"));
  });

  it("finds live evidential overlay on the attest row", () => {
    const attest = rows.find((r) => r.literal === "attest");
    assert.ok(attest);
    const live = overlays.find((row) => /live evidential/i.test(row.definition) && row.pos === "h");
    assert.ok(live);
    const results = searchLexicon(index, rows, live.senseForm, { limit: 10, overlays, overlayIndex });
    const hit = results.find((r) => r.clarity === attest.clarity);
    assert.ok(hit, `expected attest/${attest.clarity} for ${live.senseForm} query`);
    assert.ok(hit.overlays.some((o) => o.senseForm === live.senseForm && o.pos === "h"));
  });

  it("finds evidential sense_form and attaches overlays to fishing row", () => {
    const fishing = rows.find((r) => r.literal === "fishing");
    assert.ok(fishing);
    const witnessed = overlays.find(
      (row) => /witnessed evidential/i.test(row.definition) && row.pos === "h",
    );
    assert.ok(witnessed);
    const results = searchLexicon(index, rows, witnessed.senseForm, { limit: 10, overlays, overlayIndex });
    const hit = results.find((r) => r.clarity === fishing.clarity);
    assert.ok(hit, `expected fishing/${fishing.clarity} for ${witnessed.senseForm} query`);
    assert.ok(hit.overlays.some((o) => o.senseForm === witnessed.senseForm && o.pos === "h"));
  });

  it("attaches benchmark overlays to published roots", () => {
    const ojuIndex = rows.findIndex((r) => r.clarity === "oju");
    assert.ok(ojuIndex >= 0);
    const rowOverlays = attached.get(ojuIndex) ?? [];
    assert.ok(rowOverlays.some((o) => o.senseForm === "ojun" && o.pos === "z"));
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

  it("finds evidential via spelled overlay word", () => {
    const fishing = rows.find((r) => r.literal === "fishing");
    assert.ok(fishing);
    const witnessed = overlays.find(
      (row) => /witnessed evidential/i.test(row.definition) && row.pos === "h",
    );
    assert.ok(witnessed);
    const spelled = `h${witnessed.senseForm}`;
    const results = searchLexicon(index, rows, spelled, { limit: 10, overlays, overlayIndex });
    const hit = results.find((r) => r.clarity === fishing.clarity);
    assert.ok(hit, `expected fishing/${fishing.clarity} for ${spelled} query`);
    assert.ok(hit.overlays.some((o) => o.senseForm === witnessed.senseForm && o.pos === "h"));
  });

  it("finds overlay rows by definition text", () => {
    const results = searchLexicon(index, rows, "hearsay", { limit: 10, overlays, overlayIndex });
    assert.ok(results.some((r) => r.overlays.some((o) => /hearsay/i.test(o.definition))));
  });

  it("finds eye via packed verb English see", () => {
    const results = searchLexicon(index, rows, "see", { limit: 20, overlays, overlayIndex });
    const hit = results.find((r) => r.literal === "eye");
    assert.ok(hit, "expected eye among see results");
    assert.ok(hit.matchFields.includes("english_by_pos"));
    assert.equal(hit.posEnglish.literal.v, "see");
  });

  it("finds nose metaphor packing intuit without treating it as literal see", () => {
    const results = searchLexicon(index, rows, "intuit", { limit: 20, overlays, overlayIndex });
    const hit = results.find((r) => r.literal === "nose");
    assert.ok(hit, "expected nose among intuit results");
    assert.equal(hit.posEnglish.metaphorical.v, "intuit");
    assert.equal(hit.posEnglish.literal.v, "smell");
  });
});
