import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";

import {
  attachOverlays,
  createLexiconIndex,
  createOverlayIndex,
  parseEnglishAliases,
  parseEnglishByPos,
  parseOverlayCsv,
  parsePublishedCsv,
  searchLexicon,
  splitPosPrefixedQuery,
  tokenizeConcrete,
  validateOverlayPublishedHosts,
} from "./lexicon-search.js";

const rootDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const publishedPath = join(rootDir, "data", "lexicon-published.csv");
const overlayPath = join(rootDir, "data", "lexicon-overlays.csv");

describe("tokenizeConcrete", () => {
  it("expands hyphenated literals into searchable tokens", () => {
    const tokens = tokenizeConcrete("nervous-laugh");
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
      concrete: "nose",
      abstract: "intuition",
    });
    assert.equal(map.concrete.v, "smell");
    assert.equal(map.abstract.v, "intuit");
    assert.equal(map.concrete.h, undefined);
  });

  it("rejects packing that copies the sense lemma", () => {
    assert.throws(() => parseEnglishByPos("v:eye", { concrete: "eye", abstract: "perception" }));
    assert.throws(() =>
      parseEnglishByPos("m.v:perception", { concrete: "eye", abstract: "perception" }),
    );
  });

  it("rejects m. when there is no abstract sense", () => {
    assert.throws(() => parseEnglishByPos("m.v:intuit", { concrete: "hand" }));
  });
});

describe("parseEnglishAliases", () => {
  it("reads ;-separated search cues", () => {
    assert.deepEqual(parseEnglishAliases("say; speak"), ["say", "speak"]);
    assert.deepEqual(parseEnglishAliases(""), []);
  });

  it("rejects a cue that repeats the concrete or abstract sense, duplicates, and empty pieces", () => {
    assert.throws(() => parseEnglishAliases("tell", { concrete: "tell" }), /repeats the concrete or abstract/);
    assert.throws(() => parseEnglishAliases("say; say"), /duplicate/);
    assert.throws(() => parseEnglishAliases("say;;speak"), /empty piece/);
    assert.throws(() => parseEnglishAliases("v:say"), /bad english_aliases/);
  });

  it("makes search find a root by an alias without touching its role English", () => {
    const rows = parsePublishedCsv(readFileSync(publishedPath, "utf8"));
    const index = createLexiconIndex([
      { ...rows[0]!, concrete: "tell", abstract: "", englishAliases: ["say", "speak"] },
    ]);
    const hits = searchLexicon(index, [{ ...rows[0]!, concrete: "tell", abstract: "", englishAliases: ["say", "speak"] }], "speak");
    assert.equal(hits.length, 1);
    assert.ok(hits[0]!.matchFields.includes("english_aliases"));
  });
});

describe("overlay csv", () => {
  it("parses overlay rows with definition and mnemonic", () => {
    const overlays = parseOverlayCsv(readFileSync(overlayPath, "utf8"));
    assert.ok(overlays.length > 0);
    const witnessed = overlays.find((row) => /witnessed evidential/i.test(row.definition) && row.pos === "th");
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
          kind: "evidential",
          gloss: "PATTERN",
          definition: "pattern evidential",
          mnemonic: "",
          anchor: "knowing.md#evidentiality",
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

  it('finds "laugh" via literal and "down" via hyphen tokenization', () => {
    const results = searchLexicon(index, rows, "laugh", { limit: 50, overlays, overlayIndex });
    assert.ok(results.map((r) => r.concrete).includes("laugh"));
    const down = searchLexicon(index, rows, "down", { limit: 50, overlays, overlayIndex });
    assert.ok(down.map((r) => r.concrete).includes("thumbs-down"));
  });

  it('finds abstract "goodwill" on smile', () => {
    const results = searchLexicon(index, rows, "goodwill", { limit: 20, overlays, overlayIndex });
    const hit = results.find((r) => r.concrete === "smile");
    assert.ok(hit, "expected smile among goodwill results");
    assert.ok(hit.matchFields.includes("abstract"));
  });

  it("finds a published row by its root", () => {
    const smile = rows.find((r) => r.concrete === "smile");
    assert.ok(smile);
    const results = searchLexicon(index, rows, smile.root, { limit: 10, overlays, overlayIndex });
    assert.ok(results.some((r) => r.root === smile.root));
    const top = results[0];
    assert.equal(top?.root, smile.root);
    assert.ok(top?.matchFields.includes("root"));
  });

  it("finds live evidential overlay on the attest row", () => {
    const attest = rows.find((r) => r.concrete === "attest");
    assert.ok(attest);
    const live = overlays.find((row) => /live evidential/i.test(row.definition) && row.pos === "th");
    assert.ok(live);
    const results = searchLexicon(index, rows, live.senseForm, { limit: 10, overlays, overlayIndex });
    const hit = results.find((r) => r.root === attest.root);
    assert.ok(hit, `expected attest/${attest.root} for ${live.senseForm} query`);
    assert.ok(hit.overlays.some((o) => o.senseForm === live.senseForm && o.pos === "th"));
  });

  it("finds evidential sense_form and attaches overlays to fishing row", () => {
    const fishing = rows.find((r) => r.concrete === "fishing");
    assert.ok(fishing);
    const witnessed = overlays.find(
      (row) => /witnessed evidential/i.test(row.definition) && row.pos === "th",
    );
    assert.ok(witnessed);
    const results = searchLexicon(index, rows, witnessed.senseForm, { limit: 10, overlays, overlayIndex });
    const hit = results.find((r) => r.root === fishing.root);
    assert.ok(hit, `expected fishing/${fishing.root} for ${witnessed.senseForm} query`);
    assert.ok(hit.overlays.some((o) => o.senseForm === witnessed.senseForm && o.pos === "th"));
  });

  it("finds join-act overlay van without a published row", () => {
    const results = searchLexicon(index, rows, "van", { limit: 10, overlays, overlayIndex });
    const hit = results.find(
      (r) => r.overlayOnly && r.overlays[0]?.senseForm === "an" && r.overlays[0]?.pos === "v",
    );
    assert.ok(hit, "expected overlay-only an+v for van query");
    assert.equal(hit.root, "an");
    assert.match(hit.concrete, /includes/i);
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
    assert.equal(gan.root, "an");
  });

  it("finds evidential via spelled overlay word", () => {
    const fishing = rows.find((r) => r.concrete === "fishing");
    assert.ok(fishing);
    const witnessed = overlays.find(
      (row) => /witnessed evidential/i.test(row.definition) && row.pos === "th",
    );
    assert.ok(witnessed);
    const spelled = `h${witnessed.senseForm}`;
    const results = searchLexicon(index, rows, spelled, { limit: 10, overlays, overlayIndex });
    const hit = results.find((r) => r.root === fishing.root);
    assert.ok(hit, `expected fishing/${fishing.root} for ${spelled} query`);
    assert.ok(hit.overlays.some((o) => o.senseForm === witnessed.senseForm && o.pos === "th"));
  });

  it("finds overlay rows by definition text", () => {
    const results = searchLexicon(index, rows, "hearsay", { limit: 10, overlays, overlayIndex });
    assert.ok(results.some((r) => r.overlays.some((o) => /hearsay/i.test(o.definition))));
  });

  it("finds eye via packed verb English see", () => {
    const results = searchLexicon(index, rows, "see", { limit: 20, overlays, overlayIndex });
    const hit = results.find((r) => r.concrete === "eye");
    assert.ok(hit, "expected eye among see results");
    assert.ok(hit.matchFields.includes("english_by_pos"));
    assert.equal(hit.posEnglish.concrete.v, "see");
  });

  it("finds nose metaphor packing intuit without treating it as literal see", () => {
    const results = searchLexicon(index, rows, "intuit", { limit: 20, overlays, overlayIndex });
    const hit = results.find((r) => r.concrete === "nose");
    assert.ok(hit, "expected nose among intuit results");
    assert.equal(hit.posEnglish.abstract.v, "intuit");
    assert.equal(hit.posEnglish.concrete.v, "smell");
  });
});
