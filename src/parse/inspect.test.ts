import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";

import { createClassifyTables } from "./classify.js";
import { inspectText } from "./inspect.js";

const rootDir = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const tables = createClassifyTables(
  readFileSync(join(rootDir, "data", "lexicon-published.csv"), "utf8"),
  readFileSync(join(rootDir, "data", "lexicon-overlays.csv"), "utf8"),
  readFileSync(join(rootDir, "data", "lexicon-compounds.csv"), "utf8"),
);

describe("inspectText", () => {
  it("tokenizes zazozon with PoS, named ending, and published gloss", () => {
    const result = inspectText("zazozon vowurol.", tables);
    const first = result.tokens[0];
    assert.equal(first?.kind, "word");
    if (first?.kind !== "word") return;
    assert.equal(first.raw, "zazozon");
    assert.equal(first.word.pos, "z");
    assert.equal(first.word.ending, "n");
    assert.ok(first.gloss.length > 0);
    assert.ok(first.chips.some((chip) => chip.startsWith("/z/")));
    assert.ok(first.chips.some((chip) => chip.includes("-n")));
    assert.equal(result.sentenceWarning, undefined);

    const punct = result.tokens.at(-1);
    assert.equal(punct?.kind, "punct");
    if (punct?.kind === "punct") assert.equal(punct.punct, "period");
  });

  it("uses overlay definition for closed mood", () => {
    const witnessed = [...tables.overlays.values()].find(
      (o) => o.pos === "th" && /memory evidential/i.test(o.definition),
    );
    assert.ok(witnessed);
    const result = inspectText(`th${witnessed.senseForm}`, tables);
    const token = result.tokens[0];
    assert.equal(token?.kind, "word");
    if (token?.kind !== "word") return;
    assert.equal(token.word.reading, "overlay");
    assert.equal(token.gloss, "MEMORY");
  });

  it("marks unknown foreign payloads", () => {
    const result = inspectText("d<english>l", tables);
    const token = result.tokens[0];
    assert.equal(token?.kind, "word");
    if (token?.kind !== "word") return;
    assert.equal(token.word.reading, "unknown");
    assert.equal(token.gloss, "unknown root");
  });

  it("shows potential lexical compounds for an unlisted stem", () => {
    const result = inspectText("zoyahelozezul.", tables);
    const token = result.tokens[0];
    assert.equal(token?.kind, "word");
    if (token?.kind !== "word") return;
    assert.equal(token.word.reading, "unknown");
    assert.deepEqual(
      token.word.potentialCompounds?.map(({ left, join, right }) => [left, join, right]),
      [["oyahe", "l", "ozezu"]],
    );
    assert.match(token.gloss, /^unknown root \(maybe bed-l scorpion\)$/);
    assert.ok(token.chips.includes("potential compound"));

    const listed = inspectText("zoyahehal.", tables).tokens[0];
    assert.equal(listed?.kind, "word");
    if (listed?.kind !== "word") return;
    assert.equal(listed.word.potentialCompounds, undefined);
  });

  it("keeps a Peggy failure as an error token beside valid words", () => {
    const result = inspectText("zazozon zolovexrabal vowurol.", tables);
    const kinds = result.tokens.map((token) => token.kind);
    assert.deepEqual(kinds, ["word", "error", "word", "punct"]);
    const err = result.tokens[1];
    assert.equal(err?.kind, "error");
    if (err?.kind !== "error") return;
    assert.equal(err.raw, "zolovexrabal");
    assert.ok(err.error.message.length > 0);
    assert.equal(result.sentenceWarning, undefined);
  });

  it("surfaces a sentence warning when words parse but the clause does not", () => {
    const result = inspectText("zazozon vowurol yol.", tables);
    assert.ok(result.tokens.some((token) => token.kind === "word"));
    assert.ok(result.sentenceWarning);
    assert.equal(result.constructions.length, 0);
  });

  it("groups a right-close join as a construction", () => {
    const result = inspectText("zezedel zogozel zam.", tables);
    const zam = result.tokens.find((token) => token.kind === "word" && token.raw === "zam");
    assert.equal(zam?.kind, "word");
    if (zam?.kind !== "word") return;
    assert.equal(zam.gloss, "and.open");
    const join = result.constructions.find((group) => group.kind === "join");
    assert.ok(join);
    const raws = join!.tokenIndices.map((i) => result.tokens[i]!.raw);
    assert.deepEqual(raws, ["zezedel", "zogozel", "zam"]);
    const zamIdx = result.tokens.findIndex((token) => token.raw === "zam");
    assert.ok(join!.triggerIndices.includes(zamIdx));
  });

  it("reads the mention marker before a span", () => {
    const result = inspectText("glegol z<kimchi> gamezem.", tables);
    const marker = result.tokens.find((token) => token.kind === "word" && token.raw === "glegol");
    assert.ok(marker?.kind === "word");
    assert.equal(marker.word.reading, "mention");
  });

  it("links -r to its antecedent", () => {
    const result = inspectText("zalazun vowurol. zalazur vehohel.", tables);
    const pronoun = result.tokens.find((token) => token.kind === "word" && token.raw === "zalazur");
    assert.equal(pronoun?.kind, "word");
    if (pronoun?.kind !== "word") return;
    const ant = pronoun.related?.find((rel) => rel.label === "antecedent");
    assert.equal(ant?.raw, "zalazun");
    assert.equal(result.tokens[ant!.tokenIndex]?.raw, "zalazun");
  });

  it("Why links hook compounds", () => {
    const token = inspectText("vowurolul", tables).tokens[0];
    assert.equal(token?.kind, "word");
    if (token?.kind !== "word") return;
    assert.equal(token.why?.line, "hook compound");
    assert.equal(token.why?.href, "hooks.html#hook-compounds");
    assert.match(token.gloss, /leave/i);
  });

  it("Why distinguishes sakes from role compounds", () => {
    const sake = inspectText("thunathal", tables).tokens[0];
    assert.equal(sake?.kind, "word");
    if (sake?.kind !== "word") return;
    assert.equal(sake.why?.line, "sakes (sake + th)");
    assert.equal(sake.why?.href, "sakes.html");

    const role = inspectText("zwuzozulal", tables).tokens[0];
    assert.equal(role?.kind, "word");
    if (role?.kind !== "word") return;
    assert.equal(role.why?.line, "role compound");
    assert.equal(role.why?.href, "roles.html#role-compounds");
  });
});

describe("inspectText — phrase brackets", () => {
  it("marks bracket opens and closes on word tokens", () => {
    const shown = inspectText("yaol zuwen zam zawan zal guzemel.", tables)
      .tokens.filter((token) => token.kind === "word")
      .map((token) =>
        token.kind === "word"
          ? `${(token.brackets?.open ?? []).join("")}${token.raw}${(token.brackets?.close ?? []).join("")}`
          : "",
      )
      .join(" ");
    assert.equal(shown, "yaol [[zuwen zam] zawan zal guzemel]");
  });

  it("brackets a mention marker with its span", () => {
    const tokens = inspectText("glegol z<kimchi> gamezem.", tables).tokens;
    const marker = tokens.find((token) => token.raw === "glegol");
    assert.ok(marker?.kind === "word");
    assert.deepEqual(marker.brackets?.open, ["["]);
  });
});
