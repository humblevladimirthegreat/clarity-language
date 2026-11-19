import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { fullGlossIndex } from "../game/build.js";
import { glossToAgeben } from "../parse/gloss-inverse.js";
import { loadDefaultTables } from "../parse/index.js";
import { houseTables } from "../lint/practice-fixtures.js";
import { canonicalReadings, compareCanonical, sameReadings } from "./equal.js";
import { readText } from "./read.js";
import type { Reading } from "./types.js";

/** Ported from src/lint/reading-equivalence.test.ts, with the tables that lint loads. */
describe("sameReadings: the practice-item cases", () => {
  const tables = houseTables();
  const verdict = (a: string, b: string): string => sameReadings(a, b, tables).verdict;

  it("matches a legal reordering", () => {
    assert.equal(verdict("zahelan dazozon vayebel.", "dazozon vayebel zahelan."), "same");
  });

  it("matches an explicit yal against the omitted one", () => {
    assert.equal(verdict("zahelan dazozon vayebel.", "yal zahelan dazozon vayebel."), "same");
  });

  it("matches a role pointer against a resume of the same one", () => {
    assert.equal(verdict("zazozon vowurol. zwuzer vehohel.", "zazozon vowurol. zazozor vehohel."), "same");
  });

  it("matches a hook phrase or an adverb moved as a whole", () => {
    assert.equal(verdict("zazozon vowurol el balazun.", "el balazun zazozon vowurol."), "same");
    assert.equal(verdict("zazozon hehohel hayebel vowurol.", "hehohel zazozon hayebel vowurol."), "same");
  });

  it("does not match a resume against a new noun of the same kind", () => {
    assert.equal(verdict("zazozon vehohel. zazozon vayebel.", "zazozon vehohel. zazozor vayebel."), "different");
  });

  it("does not match a pointer in -l or -m against one in -r", () => {
    assert.equal(verdict("zazozon dalazun vayebel. zahelan dwudel vayebel.", "zazozon dalazun vayebel. zahelan dwuder vayebel."), "different");
    assert.equal(verdict("zazozon dalazun vayebel. zahelan dwuzem vayebel.", "zazozon dalazun vayebel. zahelan dwuzer vayebel."), "different");
  });

  it("does not match a role compound against the event's own resume", () => {
    assert.equal(verdict("zazozon vehohel. zwuzehoher vowurol.", "zazozon vehohel. zehoher vowurol."), "different");
  });

  it("does not match swapped hook sides or swapped hooks", () => {
    assert.equal(verdict("zazozon el zalazun vayebel.", "zalazun el zazozon vayebel."), "different");
    assert.equal(verdict("ul balazun zazozon ol bahelan vowurol.", "ol balazun zazozon ul bahelan vowurol."), "different");
  });

  it("reordered /h/ words before a restrictor: the reading holds no occasion list, so the details compare as a set", () => {
    // The old lint kept /h/ words in text order (`different`). The reading leaves the restrictor's occasion words as
    // plain adverb details, so this compares `same`; recorded, not settled here.
    assert.equal(verdict("zazozon hehohel hayebel huol vowurol.", "zazozon hayebel hehohel huol vowurol."), "same");
  });

  it("does not match swapped role letters", () => {
    assert.equal(verdict("zahelan dazozon vayebel.", "zazozon dahelan vayebel."), "different");
  });

  it("does not match a resume in another slot, or a different root", () => {
    assert.equal(verdict("zazozon vehohel. dazozon vayebel.", "zazozon vehohel. zazozor vayebel."), "different");
    assert.equal(verdict("zahelan dazozon vayebel.", "zahelan dalazun vayebel."), "different");
  });

  it("does not match another speech act", () => {
    assert.equal(verdict("zahelan dazozon vayebel.", "yam zahelan dazozon vayebel."), "different");
  });

  it("reports which side does not parse", () => {
    const result = sameReadings("zahelan dazozon vayebel.", "zahelan vayebel azozon.", tables);
    assert.equal(result.verdict, "different");
    assert.match(result.error ?? "", /^zahelan vayebel azozon\.:/);
  });
});

describe("sameReadings: frames, islands and pronouns", () => {
  const tables = loadDefaultTables();
  const index = fullGlossIndex(tables);
  const ageben = (gloss: string): string => glossToAgeben(gloss, tables, index);
  const verdict = (a: string, b: string): string => sameReadings(ageben(a), ageben(b), tables).verdict;
  const read = (gloss: string): Reading[] => readText(ageben(gloss), tables);

  const EVERY = "[[z-everything | g-dog] | z-tag.A] | [d-cat | d-tag.O] | v-see";
  const SINGLE = "[d-cat | d-tag.O] | [[z-everything | g-dog] | z-tag.A] | v-see";

  it("frame order differing is `different` (universals-domains.md: *every dog sees a cat* and *a cat, every dog sees*)", () => {
    assert.equal(verdict(EVERY, SINGLE), "different");
  });

  it("the omitted act word brings the order `yal` would", () => {
    assert.equal(verdict("z-dog | v-walk | th-not", "y-statement | z-dog | v-walk | th-not"), "same");
    assert.equal(verdict("th-concern | z-dog | th-doubt | v-walk", "y-statement | th-concern | z-dog | th-doubt | v-walk"), "same");
  });

  it("an unsettled pair in two text orders is `unsettled`; in one text order it compares as usual", () => {
    // No pair is unsettled in the pair table today, so the pair is made unsettled here: the reader's `order` entry moves to `unordered`.
    const unsettle = (readings: Reading[]): Reading[] => {
      for (const reading of readings) {
        reading.unordered = reading.order.map((o) => [o.under, o.over]);
        reading.order = [];
      }
      return readings;
    };
    const every = canonicalReadings(unsettle(read(EVERY)));
    const single = canonicalReadings(unsettle(read(SINGLE)));
    const result = compareCanonical(every, single);
    assert.equal(result.verdict, "unsettled");
    assert.equal(result.pairs?.length, 1);
    assert.equal(compareCanonical(every, canonicalReadings(unsettle(read(EVERY)))).verdict, "same");
  });

  it("a frame inside an island compares inside it, wherever the island sits", () => {
    const island = "z-Ahelan | SCOPE[h-possibility | d-untruth] | v-see";
    assert.equal(verdict(island, "SCOPE[h-possibility | d-untruth] | z-Ahelan | v-see"), "same");
    assert.equal(verdict(island, "z-Ahelan | h-possibility | d-untruth | v-see"), "different");
  });

  it("an `-l` pronoun is its antecedent written out; an `-m` pronoun is a share of it", () => {
    const first = `${ageben("z-Azozon | d-dog | v-see")}.`;
    const l = `${first} zahelan dwudel vayebel.`;
    const r = `${first} zahelan dwuder vayebel.`;
    const m = `${first} zahelan dwudem vayebel.`;
    const written = ageben("z-Azozon | d-dog | v-see . z-Ahelan | d-dog | v-see");
    // An `-l` pointer brings in a new member as the noun it copies would (joins.md#new-member-in-a-statement), so it
    // compares as the first mention written out.
    assert.equal(sameReadings(l, written, tables).verdict, "same");
    // After a name, `-l` is a new thing that name applies to (pronouns.md#a-new-one): a new member, not the one named.
    const named = "zazozon dalazun vayebel.";
    assert.equal(sameReadings(`${named} zahelan dwudel vayebel.`, `${named} zahelan dalazun vayebel.`, tables).verdict, "different");
    assert.equal(sameReadings(r, written, tables).verdict, "different");
    assert.equal(sameReadings(m, r, tables).verdict, "different");
    assert.equal(sameReadings(m, l, tables).verdict, "different");
  });

  it("a speaker attitude and a first-mention noun: the earlier covers the later (feelings.md#speaker-attitude)", () => {
    const order = (text: string): string[] => readText(text, tables)[0]!.order.map((o) => `${o.over.key}>${o.under.key}`);
    // *There is a jar, and I doubt it was found*: the new member comes first and covers the attitude.
    assert.deepEqual(order("dadal thevemem vumewel."), ["slot:newMember>slot:th"]);
    // *I doubt that a jar was found*: the attitude comes first and covers the new member.
    assert.deepEqual(order("thevemem dadal vumewel."), ["slot:th>slot:newMember"]);
    assert.equal(sameReadings("dadal thevemem vumewel.", "thevemem dadal vumewel.", tables).verdict, "different");
  });
});
