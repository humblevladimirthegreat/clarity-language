import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";

import { fullGlossIndex } from "../game/build.js";
import { createClassifyTables } from "../parse/classify.js";
import { glossToAgeben } from "../parse/gloss-inverse.js";
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
    const ana = throughAntecedent(paid);
    assert.ok(ana.kind === "thing" && ana.named && ana.root === "azozo");
  });

  it("a frame on the question filters: only what was heard by REPORTED with no holder", () => {
    const heard = ask(question("y-question | z-wh | b-Azozon | v-pay | th-REPORTED"), log);
    assert.ok(heard.some((m) => m.entry?.at === 3));
    assert.ok(!heard.some((m) => m.entry?.at === 0));
  });

  it("a holder seam's channel filters: CLUES and REPORTED each match their own claim, and the holder must match", () => {
    const seams = buildLog(turns("z-Alazun | v-walk | th-CLUES-Azozon", "z-Alazun | v-walk | th-REPORTED-Azozon", "z-Alazun | v-walk | th-REPORTED-Alazun"), tables);
    const at = (gloss: string): number[] => ask(question(gloss), seams).map((m) => m.entry?.at ?? -1);
    assert.deepEqual(at("y-question | z-Alazun | v-walk | th-CLUES-Azozon"), [0]);
    assert.deepEqual(at("y-question | z-Alazun | v-walk | th-REPORTED-Azozon"), [1]);
    assert.deepEqual(at("y-question | z-Alazun | v-walk | th-REPORTED-Alazun"), [2]);
  });

  it("the host's referent wins when both sides resolve", () => {
    const sameAll = ask(question("y-question | z-wh | b-Azozon | v-pay"), log, { referent: () => "one" });
    assert.equal(sameAll.length, 5);
  });

  it("switches are off by default; widening needs the lexicon", () => {
    assert.ok(matches.every((m) => m.switches.length === 0 && m.unsettled.length === 0));
    assert.throws(() => ask(question("y-question | z-wh | b-Azozon | v-pay"), log, { switches: { widen: true } }), /lexicon/);
  });
});

describe("ask: stance lists on the path", () => {
  const walks = question("y-question | z-Azozon | v-walk");

  it("verb-and-stance-joins.md#stance-joins: *not because of the rain* keeps the claim and denies its ground", () => {
    const [m] = ask(walks, buildLog(turns("z-Azozon | v-walk | [[th-because | bl-rain] | th-not]"), tables));
    assert.deepEqual(pathOf(m!), ["hinge denied"]);
    assert.equal(m!.path.stanceLists.length, 1);
    const because = ask(question("y-question | z-Azozon | v-walk | [th-because | bl-rain]"), buildLog(turns("z-Azozon | v-walk | [[th-because | bl-rain] | th-not]"), tables));
    // The question's *because of the rain* passes: the target carries that ground, denied, and the path says so.
    assert.equal(because.length, 1);
    assert.deepEqual(pathOf(because[0]!), ["hinge denied"]);
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

describe("ask: switches", () => {
  /** One speaker's turns, as written text (forms the gloss index cannot spell). */
  const raw = (...texts: string[]): Turn[] => texts.map((text, at) => ({ speaker: "A", at, text }));
  const lexicon = tables;
  const found = (q: string, said: Turn[], switches: Match["switches"] = []): string[][] =>
    ask(question(q), buildLog(said, tables), {
      lexicon,
      switches: Object.fromEntries(switches.map((s) => [s, true])),
    }).map((m) => m.switches);

  it("compounds.md#two-roots-one-word: widen matches a dictionary compound on its head, and says so", () => {
    const said = turns("z-Azozon | d-doorbell | v-see");
    assert.deepEqual(found("y-question | z-Azozon | d-bell | v-see", said), []);
    assert.deepEqual(found("y-question | z-Azozon | d-bell | v-see", said, ["widen"]), [["widen"]]);
    // The head is not the compound: a question about the doorbell does not find a bell.
    assert.deepEqual(found("y-question | z-Azozon | d-doorbell | v-see", turns("z-Azozon | d-bell | v-see"), ["widen"]), []);
  });

  it("widen: an x compound's last root, a compound inside a compound, and no head for a tail suffix", () => {
    assert.deepEqual(found("y-question | z-Azozon | d-butter | v-see", raw("zazozon duwedaxubudal vayebel."), ["widen"]), [["widen"]]);
    assert.deepEqual(found("y-question | z-Azozon | d-house | v-see", turns("z-Azozon | d-firehouse | v-see"), ["widen"]), [["widen"]]);
    assert.deepEqual(found("y-question | z-Azozon | d-house | v-see", turns("z-Azozon | d-bedroom | v-see"), ["widen"]), []);
  });

  it("joins.md: infer matches one member of a stated and-list, and says so", () => {
    const said = turns("[z-Azozon | z-Alazun | z-and] | v-walk");
    assert.deepEqual(found("y-question | z-Azozon | v-walk", said), []);
    assert.deepEqual(found("y-question | z-Azozon | v-walk", said, ["infer"]), [["infer"]]);
    assert.deepEqual(found("y-question | z-Ahelan | v-walk", said, ["infer"]), []);
    // A blank binds the whole list without a switch.
    assert.deepEqual(found("y-question | z-wh | v-walk", said, ["infer"]), [[]]);
  });

  it("universals-domains.md#universals-domains-generics: infer answers *does a cat sleep?* from closed zual + kind (decision 18 (b))", () => {
    // The question's *a cat* is a new member, no filter, so the universal reading answers it through infer.
    const every = turns("[z-everything | g-cat] | v-sleep");
    assert.deepEqual(found("y-question | z-cat | v-sleep", every), []);
    assert.deepEqual(found("y-question | z-cat | v-sleep", every, ["infer"]), [["infer"]]);
    assert.deepEqual(found("y-question | z-dog | v-sleep", every, ["infer"]), []);
  });

  it("list-structure.md#respectively: paired lists give members at the same place; unpaired lists infer nothing", () => {
    const paired = turns("[z-Azozon | z-Alazun | z-and] | [d-cat | d-dog | w-respectively | d-and] | v-see");
    assert.deepEqual(found("y-question | z-Azozon | d-cat | v-see", paired, ["infer"]), [["infer"]]);
    assert.deepEqual(found("y-question | z-Alazun | d-dog | v-see", paired, ["infer"]), [["infer"]]);
    assert.deepEqual(found("y-question | z-Azozon | d-dog | v-see", paired, ["infer"]), []);
    const unpaired = turns("[z-Azozon | z-Alazun | z-and] | [d-cat | d-dog | d-and] | v-see");
    assert.deepEqual(found("y-question | z-Azozon | d-cat | v-see", unpaired, ["infer"]), []);
  });

  // pronouns.md: `uwen` is the speaker in this conversation, so *did I walk?* is about the asker.
  it("a speaker term in the question fits only readings the asker said", () => {
    const log = buildLog(
      [
        { speaker: "A", at: 0, text: "zuwen vowurol." },
        { speaker: "B", at: 1, text: "zuwen vezuvel." },
      ],
      tables,
    );
    const said = (text: string, asker?: string): number[] => ask(readText(text, tables, { text: "q" })[0]!, log, {}, asker === undefined ? {} : { asker }).map((m) => m.entry?.at ?? -1);
    assert.deepEqual(said("yel zuwen vowurol.", "A"), [0]);
    assert.deepEqual(said("yel zuwen vowurol.", "B"), []);
    assert.deepEqual(said("yel zuwen vezuvel.", "B"), [1]);
    // An asker the caller does not name fits any speaker.
    assert.deepEqual(said("yel zuwen vowurol."), [0]);
  });
});
