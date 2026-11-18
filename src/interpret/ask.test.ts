import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";

import { fullGlossIndex } from "../game/build.js";
import { createClassifyTables } from "../parse/classify.js";
import { glossToAgeben } from "../parse/gloss-inverse.js";
import type { LexWord } from "../parse/types.js";
import { ask, type Match } from "./ask.js";
import { buildLog, type Turn } from "./log.js";
import { readingTree, throughAntecedent, type PathFrame } from "./match.js";
import { readText } from "./read.js";
import type { Reading, Term } from "./types.js";

const rootDir = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const tables = createClassifyTables(
  readFileSync(join(rootDir, "data", "lexicon-published.csv"), "utf8"),
  readFileSync(join(rootDir, "data", "lexicon-overlays.csv"), "utf8"),
  readFileSync(join(rootDir, "data", "lexicon-compounds.csv"), "utf8"),
);
const index = fullGlossIndex(tables);
const spell = (gloss: string): string => glossToAgeben(gloss, tables, index) + ".";

/** One speaker's turns, one per morph-gloss sentence. */
const turns = (...glosses: string[]): Turn[] => glosses.map((g, at) => ({ speaker: "A", at, text: spell(g) }));
const question = (gloss: string): Reading => readText(spell(gloss), tables, { text: "q" })[0]!;

const nameOf = (term: Term): string => {
  const t = throughAntecedent(term);
  return t.kind === "thing" ? t.root : t.kind;
};
const bound = (m: Match): string => m.binding.blanks.map((b) => `${b.at}=${nameOf(b.term)}`).join(" ");
const pathOf = (m: Match): string[] =>
  m.path.frames.map((pf: PathFrame) => {
    const party = pf.frame.party ? `(${nameOf(pf.frame.party)})` : "";
    const lists = pf.lists.map((l) => ` ${l.standing}${l.rank ? `#${l.rank}` : ""}`).join("");
    return `${pf.how === "carried" ? "carried " : ""}${pf.frame.family}${party}${lists}`;
  });

// The five-sentence *who paid Ana?* example, with the house cast: Ana is Azozon, Sam is Alazun, Lee is Ahelan, and
// Kim is Abodun. *Her* is a resume pointing back to Azozon. *Yesterday* is left out.
const PAID = turns(
  "z-Alazun | b-Azozon | v-pay", // Sam paid Ana.
  "z-Ahelan | b-←Azozon | v-pay | h-never | th-REPORTED-Azozon", // Ana says Lee never paid her.
  "z-Azozon | v-departure | [th-if | bl-that-clause] | z-Abodun | b-←Azozon | v-pay", // If Kim pays her, Ana will leave.
  "z-Alazun | b-←Azozon | v-pay | h-two | th-REPORTED", // I heard that Sam paid her twice.
  "z-Azozon | b-Alazun | v-pay", // Ana paid Sam.
);

describe("ask: who paid Ana?", () => {
  const log = buildLog(PAID, tables);
  const matches = ask(question("y-question | z-wh | b-Azozon | v-pay"), log);

  it("four matches, one per sentence that says someone paid Ana; none for the reversed roles", () => {
    assert.deepEqual(
      matches.map((m) => `${m.entry?.at}: ${bound(m)}`),
      ["0: z=alazu", "1: z=ahela", "2: z=abodu", "3: z=alazu"],
    );
    assert.equal(log.rejected.length, 0);
  });

  it("each under its own frame path", () => {
    assert.deepEqual(
      matches.map((m) => pathOf(m)),
      [
        [],
        // Denied (never), reported by Ana (a holder on a REPORTED channel): text order; the scope is the reading's order.
        ["occasion", "holder(azozo)", "stance"],
        // Under a condition, in a sentence that takes Ana's report as a carried frame (evidentiality.md#carry-forward).
        ["carried holder(azozo)", "carried stance", "hinge"],
        // By hearsay.
        ["stance"],
      ],
    );
    const reported = matches[1]!.path.readings[0]!.order.map((o) => `${o.over.family}>${o.under.family}`);
    assert.ok(reported.includes("holder>occasion"), reported.join(" "));
    assert.equal(matches[2]!.path.readings.length, 2);
    assert.equal(matches[2]!.path.via[0]!.frame?.family, "hinge");
  });

  it("*her* in the hearsay sentence resolves to Ana through the pronoun before it", () => {
    const paid = matches[3]!.reading.claim.roles.b!;
    assert.equal(paid.kind, "pronoun");
    const pronouns = new Map<LexWord, Term>();
    readingTree(log.readings, pronouns);
    const ana = throughAntecedent(paid, pronouns);
    assert.ok(ana.kind === "thing" && ana.named && ana.root === "azozo");
  });

  it("a frame on the question filters: only what was heard by REPORTED with no holder", () => {
    const heard = ask(question("y-question | z-wh | b-Azozon | v-pay | th-REPORTED"), log);
    assert.ok(heard.some((m) => m.entry?.at === 3));
    assert.ok(!heard.some((m) => m.entry?.at === 0));
  });

  it("the host's referent wins when both sides resolve", () => {
    const sameAll = ask(question("y-question | z-wh | b-Azozon | v-pay"), log, { referent: () => "one" });
    assert.equal(sameAll.length, 5);
  });

  it("switches stay off until they land", () => {
    assert.throws(() => ask(question("y-question | z-wh | b-Azozon | v-pay"), log, { switches: { widen: true } }), /M2/);
    assert.ok(matches.every((m) => m.switches.length === 0 && m.unsettled.length === 0));
  });
});

describe("ask: stance lists on the path", () => {
  const walks = question("y-question | z-Azozon | v-walk");

  it("verb-and-stance-joins.md#stance-joins: *not because of the rain* keeps the claim and denies its ground", () => {
    const [m] = ask(walks, buildLog(turns("z-Azozon | v-walk | [[th-because | bl-rain] | th-not]"), tables));
    assert.deepEqual(pathOf(m!), ["hinge denied"]);
    assert.equal(m!.path.stanceLists.length, 1);
    const because = ask(question("y-question | z-Azozon | v-walk | [th-because | bl-rain]"), buildLog(turns("z-Azozon | v-walk | [[th-because | bl-rain] | th-not]"), tables));
    assert.equal(because.length, 0);
    const plain = ask(question("y-question | z-Azozon | v-walk | [th-because | bl-rain]"), buildLog(turns("z-Azozon | v-walk | [th-because | bl-rain]"), tables));
    assert.equal(plain.length, 1);
  });

  it("verb-and-stance-joins.md#stance-join-before-barl: the grounds sentence sits under the denied hinge", () => {
    const log = buildLog(turns("z-Azozon | v-walk | [th-because | th-not] | bl-that-clause | z-Alazun | v-run"), tables);
    const [m] = ask(question("y-question | z-Alazun | v-run"), log);
    assert.deepEqual(pathOf(m!), ["hinge denied"]);
    assert.equal(m!.path.readings.length, 2);
  });

  it("verb-and-stance-joins.md#stance-join-reach: *and not just maybe* denies the MAY", () => {
    const [m] = ask(walks, buildLog(turns("z-Azozon | v-walk | [th-MAY | th-not]"), tables));
    assert.deepEqual(pathOf(m!), ["stance denied"]);
  });

  it("rank-joins.md#rank-joins: a rank join over grounds ranks them, first is the main one", () => {
    const [m] = ask(walks, buildLog(turns("z-Azozon | v-walk | [[th-because | bl-rain] | [th-if | bl-Alazun] | th-rank/more]"), tables));
    assert.deepEqual(pathOf(m!), ["hinge ranked#1", "hinge ranked#2"]);
  });
});

describe("ask: carried frames and binders on the path", () => {
  it("evidentiality.md#carry-forward: your own attitude sits outside the carried channel", () => {
    const log = buildLog(turns("z-Alazun | th-REPORTED | v-departure", "z-Alazun | th-hostility | v-run"), tables);
    const [m] = ask(question("y-question | z-Alazun | v-run"), log);
    assert.deepEqual(pathOf(m!), ["attitude", "carried stance"]);
    assert.deepEqual(m!.path.frames[1]!.coveredBy, [m!.path.frames[0]!.frame]);
  });

  it("a new member is a binder frame on the path", () => {
    const log = buildLog(turns("z-Azozon | v-see | d-cat"), tables);
    const [m] = ask(question("y-question | z-wh | v-see | d-cat"), log);
    assert.equal(bound(m!), "z=azozo");
    assert.deepEqual(pathOf(m!), ["binder"]);
  });
});
