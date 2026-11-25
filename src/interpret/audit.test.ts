// Matcher audit (ageben-interpreter M4): question / passage pairs from doc examples. Each expectation was decided from
// the grammar page named on the pair and from the two readings, not from the matcher's source. A pair the matcher gets
// wrong is written as the right expectation and marked `todo`, so it reports without failing the run. Pairs touched by a
// decision say which. A question is read against the log (`readQuestion`), as the log reads a new turn.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";

import { fullGlossIndex } from "../game/build.js";
import { createClassifyTables } from "../parse/classify.js";
import { glossToAgeben } from "../parse/gloss-inverse.js";
import { ask, type Match } from "./ask.js";
import { buildLog, readQuestion, type Turn } from "./log.js";
import { throughAntecedent, type PathFrame } from "./match.js";
import type { Reading, Term } from "./types.js";

const rootDir = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const tables = createClassifyTables(
  readFileSync(join(rootDir, "data", "lexicon-published.csv"), "utf8"),
  readFileSync(join(rootDir, "data", "lexicon-overlays.csv"), "utf8"),
  readFileSync(join(rootDir, "data", "lexicon-compounds.csv"), "utf8"),
  readFileSync(join(rootDir, "data", "word-slots.csv"), "utf8"),
);
const index = fullGlossIndex(tables);

/** A morph gloss (it has a `|` or opens with a role letter) is spelled with gloss-inverse; anything else is doc text. */
const spell = (s: string): string => (s.includes("|") || /^[a-z]+-/.test(s) ? glossToAgeben(s, tables, index) + "." : s);

/** A passage: each item is one speaker's text (doc text may hold several sentences: one turn per sentence). */
type Said = string | [speaker: string, text: string];
const passage = (...said: Said[]): Turn[] => {
  const out: Turn[] = [];
  for (const s of said) {
    const [speaker, text] = Array.isArray(s) ? s : ["A", s];
    for (const sentence of spell(text).split(/(?<=\.)\s+/)) out.push({ speaker, at: out.length, text: sentence });
  }
  return out;
};

const nameOf = (term: Term): string => {
  const t = throughAntecedent(term);
  if (t.kind === "thing") return t.root;
  if (t.kind === "literal") return `<${t.payload}>`;
  if (t.kind === "list") return `list(${t.members.map(nameOf).join(",")})`;
  return t.kind;
};
const pathOf = (m: Match): string => {
  const frames = m.path.frames.map((pf: PathFrame) => {
    const party = pf.frame.party ? `(${nameOf(pf.frame.party)})` : "";
    const lists = pf.lists.map((l) => ` ${l.standing}${l.rank ? `#${l.rank}` : ""}`).join("");
    return `${pf.how === "carried" ? "carried " : ""}${pf.frame.family}${party}${lists}`;
  });
  return frames.join(", ");
};
/** One line per match: turn and speaker, bound blanks, frame path (outermost first), switches. */
const summary = (m: Match): string => {
  const bound = m.binding.blanks.map((b) => `${b.at}=${nameOf(b.term)}`).join(" ");
  const sw = m.switches.length ? ` +${m.switches.join("+")}` : "";
  return `${m.entry?.at}:${m.entry?.speaker} [${bound}] {${pathOf(m)}}${sw}`;
};

type Switches = { widen?: boolean; infer?: boolean };
const asked = (said: Turn[], q: string, switches: Switches = {}): Match[] => {
  const log = buildLog(said, tables);
  assert.deepEqual(log.rejected, []);
  const question: Reading = readQuestion(log, spell(q), tables)[0]!;
  return ask(question, log, { lexicon: tables, switches });
};
const found = (said: Turn[], q: string, switches: Switches = {}): string[] => asked(said, q, switches).map(summary);

describe("audit: roles", () => {
  it("A01 clause.md#role-letters: roles match by letter, not word order (clause.md:213)", () => {
    // Azozon paid Alazun, verb before the /b/. Who paid Alazun? Azozon.
    assert.deepEqual(found(passage("zazozon varal balazun."), "y-question | z-wh | b-Alazun | v-pay"), ["0:A [z=azozo] {}"]);
  });

  it("A02 clause.md#role-letters: no match across reversed roles (clause.md:217)", () => {
    const said = passage("zazozon balazun varal.");
    assert.deepEqual(found(said, "y-question | z-Alazun | b-Azozon | v-pay"), []);
    assert.deepEqual(found(said, "y-question | z-wh | b-Azozon | v-pay"), []);
  });
});

describe("audit: pronouns across sentences", () => {
  it("A03 pronouns.md#resume-r: a chain of resumes binds to the first naming (after pronouns.md:15)", () => {
    const [m, ...rest] = asked(passage("z-Azozon | v-walk", "z-←Azozon | v-sit", "z-←Azozon | v-sleep"), "y-question | z-wh | v-sleep");
    assert.equal(rest.length, 0);
    assert.equal(summary(m!), "2:A [z=azozo] {}");
    const said = m!.binding.blanks[0]!.term;
    assert.ok(said.kind === "pronoun" && said.antecedent?.kind === "pronoun", "the third sentence resumes the second");
  });

  it(
    "A04 pronouns.md#resume-r: a resume in the question matches the resumed noun of the log (pronouns.md:23)",
    () => {
      // A dog walks. The dog sits. Does the dog sit? Read against the log, the question's `-r` resumes the log's dog,
      // and the log's dog in sentence 2 is a resume of sentence 1's dog.
      assert.deepEqual(found(passage("zodozel vowurol. zodozer vehohel."), "yel zodozer vehohel."), ["1:A [] {}"]);
    },
  );
});

describe("audit: negation", () => {
  it(
    "A05 joins.md#negation-u: *Azozon does not walk* matches a question about walking, marked denied (verb-and-stance-joins.md:180)",
    () => {
      // The reading's verb is a one-member `u` list over *walk*; the matcher design gives a denied claim its match with
      // the denial on the path (*Ana says Lee never paid her*).
      const ms = asked(passage("zazozon vowurol vul."), "y-question | z-Azozon | v-walk");
      assert.equal(ms.length, 1);
      assert.ok(ms[0]!.path.frames.some((pf) => pf.frame.family === "polarity" || pf.lists.some((l) => l.standing === "denied")));
    },
  );

  it("A06 restrictors.md: *never* matches with the occasion frame on the path (restrictors.md:24)", () => {
    assert.deepEqual(found(passage("zalazun vowurol hal."), "y-question | z-wh | v-walk"), ["0:A [z=alazu] {occasion}"]);
  });
});

describe("audit: holder", () => {
  it("A07 holder.md#naming-a-holder: *Azozon says Alazun left* is reported by Azozon (holder.md:18)", () => {
    assert.deepEqual(
      found(passage("zalazun thebamazozon vudurul."), "y-question | z-wh | v-departure"),
      ["0:A [z=alazu] {holder(azozo), stance}"],
    );
  });

  const said = passage("zazozon vowurol. zalazun theyomazozor vudurul.");
  it("A08 holder.md#naming-a-holder: a resumed holder is Azozon (holder.md:65)", () => {
    assert.deepEqual(found(said, "y-question | z-Alazun | v-departure"), ["1:A [] {holder(azozo), stance}"]);
  });
  it(
    "A08 holder.md#naming-a-holder: a question naming the holder filters through the resumed holder (holder.md:65)",
    () => {
      assert.deepEqual(found(said, "y-question | z-Alazun | v-departure | th-CLUES-Azozon"), ["1:A [] {holder(azozo), stance}"]);
    },
  );
});

describe("audit: condition hinge", () => {
  it("A09 causation.md#if: *Azozon walks if it rains* matches under the hinge; a different hinge filters it out (causation.md:14)", () => {
    const said = passage("zazozon vowurol thohem blerulal.");
    assert.deepEqual(found(said, "y-question | z-Azozon | v-walk"), ["0:A [] {hinge}"]);
    assert.deepEqual(found(said, "y-question | z-Azozon | v-walk | [th-if | bl-rain]"), ["0:A [] {hinge}"]);
    assert.deepEqual(found(said, "y-question | z-Azozon | v-walk | [th-because | bl-rain]"), []);
  });
});

describe("audit: carried evidential frames", () => {
  const story = "zalazun thebam vudurul. zalazun veruvol. zalazun vozuyel.";

  it("A10 evidentiality.md#carry-forward: bare claims after a channel carry it; a channel on the question finds them (evidentiality.md:238)", () => {
    const said = passage(story);
    assert.deepEqual(found(said, "y-question | z-Alazun | v-sing"), ["2:A [] {carried stance}"]);
    assert.deepEqual(found(said, "y-question | z-wh | v-run | th-REPORTED"), ["1:A [z=alazu] {carried stance}"]);
  });

  it("A11 evidentiality.md#carry-forward: a reply by someone else neither takes nor ends the frame (after evidentiality.md:238)", () => {
    const said = passage(["A", "zalazun thebam vudurul."], ["B", "zalazun veruvol."], ["A", "zalazun vozuyel."]);
    assert.deepEqual(found(said, "y-question | z-Alazun | v-run"), ["1:B [] {}"]);
    assert.deepEqual(found(said, "y-question | z-Alazun | v-sing"), ["2:A [] {carried stance}"]);
  });

  it("A12 evidentiality.md#carry-forward: a plan takes no frame; an attitude stays outside the carried channel (evidentiality.md:256, :262)", () => {
    const plan = passage("zalazun thebam vudurul. zuwen thagom vowurol. zalazun veruvol.");
    assert.deepEqual(found(plan, "y-question | z-wh | v-walk"), ["1:A [z=speaker] {intention}"]);
    assert.deepEqual(found(plan, "y-question | z-Alazun | v-run"), ["2:A [] {carried stance}"]);
    const [m, ...rest] = asked(passage("zalazun thebam vudurul. zalazun thonumum veruvol."), "y-question | z-Alazun | v-run");
    assert.equal(rest.length, 0);
    assert.equal(summary(m!), "1:A [] {attitude, carried stance}");
    assert.deepEqual(m!.path.frames[1]!.coveredBy, [m!.path.frames[0]!.frame]);
  });
});

describe("audit: stance lists", () => {
  it("A13 verb-and-stance-joins.md#stance-joins: a ranked list keeps both grounds, first is main (verb-and-stance-joins.md:162)", () => {
    assert.deepEqual(
      found(passage("zazozon vowurol thahum blerulal thohem blalazun thol."), "y-question | z-Azozon | v-walk | [th-if | bl-Alazun]"),
      ["0:A [] {hinge ranked#1, hinge ranked#2}"],
    );
  });

  const denied = passage("zazozon vowurol thahum blerulal thul.");
  it("A14 verb-and-stance-joins.md#stance-joins: *not because of the rain* keeps the claim, denies the ground (verb-and-stance-joins.md:154)", () => {
    assert.deepEqual(found(denied, "y-question | z-Azozon | v-walk"), ["0:A [] {hinge denied}"]);
  });
  it(
    "A14 verb-and-stance-joins.md#stance-joins: asked *because of the rain?*, the denied ground answers it (verb-and-stance-joins.md:154)",
    () => {
      // The target carries a hinge of the family with equal values; its list denies it. As with *never paid*, the
      // match should come back with the denial on the path, so the consumer can answer *no*.
      assert.deepEqual(found(denied, "y-question | z-Azozon | v-walk | [th-because | bl-rain]"), ["0:A [] {hinge denied}"]);
    },
  );

  it("A15 verb-and-stance-joins.md#stance-join-reach: MAY then a standalone join; nothing denied, MAY covers the join (verb-and-stance-joins.md:252)", () => {
    const [m, ...rest] = asked(passage("thomam zazozon vowurol thul."), "y-question | z-Azozon | v-walk");
    assert.equal(rest.length, 0);
    assert.equal(summary(m!), "0:A [] {stance, polarity}");
    const order = m!.path.readings[0]!.order.map((o) => `${o.over.family}>${o.under.family}`);
    assert.ok(order.includes("stance>polarity"), order.join(" "));
  });
});

describe("audit: scope island", () => {
  const said = passage("zazozon { balazun hogugem } vezuyol.");
  it("A16 scope-islands.md#scope-islands: *possibly* reaches only Alazun, so the talking is not framed (scope-islands.md:54)", () => {
    assert.deepEqual(found(said, "y-question | z-Azozon | v-tell"), ["0:A [] {}"]);
    assert.deepEqual(found(said, "y-question | z-Azozon | v-tell | h-possibility"), []);
  });
  it("A16 scope-islands.md#scope-islands: the recipient inside the island is still the clause's /b/ (scope-islands.md:54)", () => {
    const matches = asked(said, "y-question | z-Azozon | b-Alazun | v-tell");
    assert.deepEqual(matches.map(summary), ["0:A [] {}"]);
    // The island, with its *possibly*, is on the match's path.
    const island = matches[0]!.path.islands?.[0];
    assert.ok(island, "the island reading is on the path");
    assert.deepEqual(island.claim.details.map((d) => d.words.map((w) => w.raw).join(" ")), ["hogugem"]);
  });
});

describe("audit: numbers and measures", () => {
  const said = passage("zalazun dragel vayebel. zazozon drager vayebel.");
  it("A17 number-markers.md#number-endings: a written number equals the spoken one; *about three* is not *three* (number-markers.md:85)", () => {
    assert.deepEqual(found(said, "yel zalazun d+3 vayebel."), ["0:A [] {}"]);
    assert.deepEqual(found(said, "yel zalazun dragem vayebel."), []);
  });
  it("A17 number-markers.md#number-endings: a number resume has the value it resumes (number-markers.md:85)", () => {
    assert.deepEqual(found(said, "y-question | z-Azozon | d-three | v-see"), ["1:A [] {}"]);
  });

  it("A18 measures-and-percent.md#measure-phrases: *about two hours* matches about, not exactly two (measures-and-percent.md:222)", () => {
    const walk = passage("zazozon vowurol bagorum gradom.");
    assert.deepEqual(found(walk, "yel zazozon vowurol bagorum gradol."), []);
    assert.deepEqual(found(walk, "yel zazozon vowurol bagorum gradom."), ["0:A [] {}"]);
  });

  it("A24 digitless-exponents.md#how-many: *how many hours?* binds the amount of the measure phrase (measures-and-percent.md:222)", () => {
    const walk = passage("zazozon vowurol bagorum gradom.");
    const matches = asked(walk, "yel zazozon vowurol bagorum grar.");
    assert.deepEqual(matches.map(summary), ["0:A [b/detail.0/number=number] {}"]);
    const bound = matches[0]!.binding.blanks[0]!.term;
    assert.equal(bound.kind === "number" ? bound.word.raw : bound.kind, "gradom");
    // A walk with no amount gives the blank nothing to bind.
    assert.deepEqual(found(passage("zazozon vowurol."), "yel zazozon vowurol bagorum grar."), []);
  });
});

describe("audit: literal", () => {
  it("A19 spans.md#loans: an opaque span matches by exact payload; a blank binds it (spans.md:67)", () => {
    const said = passage("zazozon d<kimchi> vayebel.");
    assert.deepEqual(found(said, "yel zazozon d<kimchi> vayebel."), ["0:A [] {}"]);
    assert.deepEqual(found(said, "yel zazozon d<Kimchi> vayebel."), []);
    assert.deepEqual(found(said, "y-question | z-Azozon | d-wh | v-see"), ["0:A [d=<kimchi>] {}"]);
  });
});

describe("audit: switches", () => {
  const said = passage("zazozon zalazun zal vowurol. zwuzer vehohel.");
  it("A20 joins.md (and-lists): infer finds a member of a stated list and says so; off, it does not (joins.md:44)", () => {
    assert.deepEqual(found(said, "y-question | z-Alazun | v-walk"), []);
    assert.deepEqual(found(said, "y-question | z-Alazun | v-walk", { infer: true }), ["0:A [] {} +infer"]);
  });
  it("A20 joins.md (and-lists): *they sit* resumes the list, so a blank binds it whole and infer reaches a member (joins.md:44)", () => {
    assert.deepEqual(found(said, "y-question | z-wh | v-sit"), ["1:A [z=list(azozo,alazu)] {}"]);
    assert.deepEqual(found(said, "y-question | z-Alazun | v-sit", { infer: true }), ["1:A [] {} +infer"]);
  });

  it("A21 compounds.md#dictionary-compounds: widen finds a doorbell on a question about a bell, and says so", () => {
    // Both phrases are new members, so the binder is on the path; decision 18 does not change this pair's outcome.
    const bell = passage("z-Azozon | d-doorbell | v-see");
    assert.deepEqual(found(bell, "y-question | z-Azozon | d-bell | v-see"), []);
    assert.deepEqual(found(bell, "y-question | z-Azozon | d-bell | v-see", { widen: true }), ["0:A [] {binder} +widen"]);
  });
});

describe("audit: decisions", () => {
  it("A22 decision 18 (b): a new-member phrase on the question is no filter, so it finds a resumed noun (pronouns.md:23)", () => {
    // *Does a dog sit?* The dog that sits is a resume, with no binder; the question's new member matches it by root.
    assert.deepEqual(found(passage("zodozel vowurol. zodozer vehohel."), "y-question | z-dog | v-sit"), ["1:A [] {}"]);
  });

  it("A23 decision 19: another speaker's goodbye ends your carried frame (word-endings.md#greeting, evidentiality.md#carry-forward)", () => {
    // B greets, then says the same greeting again: a goodbye. Decided (a): it ends A's frame, so the running is
    // A's own claim, with no carried stance.
    const said = passage(["A", "zalazun thebam vudurul."], ["B", "ahelan."], ["B", "ahelan."], ["A", "zalazun veruvol."]);
    assert.deepEqual(found(said, "y-question | z-Alazun | v-run"), ["3:A [] {}"]);
  });
});
