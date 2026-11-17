import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";

import { fullGlossIndex } from "../game/build.js";
import { createClassifyTables } from "../parse/classify.js";
import { glossToAgeben } from "../parse/gloss-inverse.js";
import { parse } from "../parse/index.js";
import { PAIR_ROWS } from "../parse/scope.js";
import { allReadings, readParse, readText } from "./read.js";
import type { Frame, Reading, Term } from "./types.js";

const rootDir = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const tables = createClassifyTables(
  readFileSync(join(rootDir, "data", "lexicon-published.csv"), "utf8"),
  readFileSync(join(rootDir, "data", "lexicon-overlays.csv"), "utf8"),
  readFileSync(join(rootDir, "data", "lexicon-compounds.csv"), "utf8"),
);
const index = fullGlossIndex(tables);

/** Readings of a sentence written as morph gloss. */
function read(gloss: string): Reading[] {
  return readText(glossToAgeben(gloss, tables, index), tables);
}

const families = (reading: Reading): string[] => reading.frames.map((f) => f.family);
const orders = (reading: Reading): string[] => reading.order.map((o) => `${o.over.family}>${o.under.family} ${o.kind}`);
const frame = (reading: Reading, family: string): Frame => reading.frames.find((f) => f.family === family)!;

describe("reader: one fixture per frame family", () => {
  it("force and attitude: the act word's frame, the attitude outside the question", () => {
    const [reading] = read("y-question | th-hope | z-Azozon | v-walk");
    assert.deepEqual(families(reading!), ["force", "attitude"]);
    assert.equal(frame(reading!, "force").values.ask, "yesNo");
    assert.equal(frame(reading!, "attitude").anchor, "feelings.md#speaker-attitude");
  });

  it("polarity: a standalone /th/ join pairs by text order", () => {
    const [reading] = read("th-not | z-Azozon | v-walk | th-MAY");
    assert.deepEqual(families(reading!), ["polarity", "stance"]);
    assert.equal(frame(reading!, "polarity").key, "joinSeries:u:standalone");
  });

  it("say and binder: the say word's own fields are values", () => {
    const [reading] = read("h-episode-event-ALLOW-said | [z-everything | g-dog] | v-walk | th-not");
    assert.deepEqual(families(reading!), ["say", "binder", "polarity"]);
    const say = frame(reading!, "say").values;
    assert.ok(say.reach && say.part && say.answer, JSON.stringify(say));
  });

  it("stance and mirative: a channel and MIRATIVE commute, so no order is recorded", () => {
    const [reading] = read("th-CLUES | z-Azozon | v-walk | th-MIRATIVE");
    assert.deepEqual(families(reading!), ["stance", "mirative"]);
    assert.deepEqual(reading!.order, []);
  });

  it("holder: the holder seam over its stance, by word shape; the holder is the party", () => {
    const [reading] = read("z-Azozon | v-walk | th-not | th-MEMORY-Azozon");
    assert.deepEqual(families(reading!), ["polarity", "holder", "stance"]);
    assert.ok(orders(reading!).includes("holder>stance wordShape"));
    assert.equal(frame(reading!, "holder").party?.kind, "thing");
  });

  it("hinge: a `blarl` condition is the next sentence, through a grounds link", () => {
    const [reading, next] = read("y-question | th-MAY | z-Azozon | v-walk | [th-if | bl-that-clause] . z-Alazun | v-tell");
    assert.deepEqual(families(reading!), ["force", "stance", "hinge"]);
    const grounds = reading!.links.find((l) => l.kind === "grounds");
    assert.equal(grounds?.to, next!.id);
    assert.equal(grounds?.frame, frame(reading!, "hinge"));
  });

  it("intention: WANT and ATTEMPT", () => {
    assert.deepEqual(families(read("th-WANT-unstated | z-Azozon | v-walk")[0]!), ["intention"]);
    assert.deepEqual(families(read("z-Azozon | h-ATTEMPT-trial | v-walk")[0]!), ["intention"]);
  });

  it("ability, phase, notional", () => {
    assert.deepEqual(families(read("z-Azozon | h-ABIL | v-walk")[0]!), ["ability"]);
    assert.deepEqual(families(read("z-Azozon | h-still | v-walk")[0]!), ["phase"]);
    assert.deepEqual(families(read("th-NOTIONAL | z-Azozon | v-walk")[0]!), ["notional"]);
  });

  it("residue and occasion: FORMER covers a restrictor wherever it sits (a rule)", () => {
    const [reading] = read("z-Azozon | h-always | v-sing | h-FORMER");
    assert.deepEqual(families(reading!), ["occasion", "residue"]);
    assert.deepEqual(orders(reading!), ["residue>occasion rule"]);
  });

  it("contrary: the zone's stance is held inside the frame, not a frame on the claim", () => {
    const [reading] = read("z-Azozon | v-walk | [contrary-to | th-plan-itinerary]");
    assert.deepEqual(families(reading!), ["contrary"]);
    assert.deepEqual(frame(reading!, "contrary").inner?.map((f) => f.family), ["intention"]);
  });

  it("sake: stays outside the question", () => {
    const [reading] = read("y-question | z-Azozon | v-walk | th-physical-met-any-term");
    assert.deepEqual(orders(reading!), ["sake>force rule"]);
  });

  it("bar: nests in its rank fence and never pairs", () => {
    const [reading] = read("[z-Azozon | th-PATTERN | z-rank/more | g-sleepy]");
    assert.deepEqual(reading!.order, []);
    const list = reading!.claim.roles.z as Extract<Term, { kind: "list" }>;
    assert.equal(list.kind, "list");
    const bar = list.members.find((m) => m.kind === "thing" && m.frames?.some((f) => f.family === "bar"));
    assert.ok(bar, "a bar frame on a member of the fence");
  });

  it("quote: a cite is a nested reading with its own claim", () => {
    const [reading] = read("z-Azozon | v-tell | d-CITE[z-Alazun | v-walk]");
    const quote = frame(reading!, "quote");
    assert.equal(quote.content?.length, 1);
    assert.equal(quote.content![0]!.claim.roles.z?.kind, "thing");
    assert.equal(reading!.claim.roles.d?.kind, "quote");
  });

  it("unknown: a word with no lexicon row is an unknown frame and an unread entry", () => {
    // Not a root: a string the lexicon does not hold.
    const [reading] = readText("zoyel.", tables);
    assert.deepEqual(families(reading!), ["unknown"]);
    assert.equal(reading!.unread[0]?.reason, "unknownWord");
  });
});

describe("reader: pair kinds copied from the resolve stage", () => {
  it("rule: text order, the earlier over the later", () => {
    const [reading] = read("h-episode-event-ALLOW-said | [z-everything | g-dog] | v-walk | th-not");
    assert.deepEqual(orders(reading!), ["say>binder rule", "say>polarity rule", "binder>polarity rule"]);
    assert.ok(reading!.order.every((o) => reading!.frames.includes(o.over) && reading!.frames.includes(o.under)));
  });

  it("word shape: the holder over its host", () => {
    const [reading] = read("z-Alazun | th-REPORTED-Azozon | v-departure | th-not");
    assert.ok(orders(reading!).includes("holder>stance wordShape"));
  });

  it("commutes: nothing recorded (see the stance fixture); unsettled: no row is unsettled today", () => {
    assert.deepEqual(PAIR_ROWS.filter((row) => row.kind === "unsettled"), []);
    for (const gloss of ["th-CLUES | z-Azozon | v-walk | th-MIRATIVE", "th-not | z-Azozon | v-walk | th-MAY"]) {
      assert.deepEqual(read(gloss)[0]!.unordered, []);
    }
  });
});

describe("reader: claim, links and nesting", () => {
  it("points into the parse tree, never a copy", () => {
    const result = parse(glossToAgeben("z-Azozon | v-walk", tables, index), tables);
    const [reading] = readParse(result, { tables });
    assert.equal(reading!.source.clause, result.utterances[0]!.bodies[0]!.clause);
    const z = reading!.claim.roles.z;
    assert.ok(z?.kind === "thing" && z.named);
    assert.equal(reading!.claim.verb?.kind, "thing");
  });

  it("a joined role is a list term", () => {
    const [reading] = read("[z-Azozon | z-Alazun | z-and] | v-walk");
    const z = reading!.claim.roles.z;
    assert.ok(z?.kind === "list" && z.members.length === 2);
  });

  it("lists nested readings with allReadings", () => {
    const readings = allReadings(read("z-Azozon | v-tell | d-CITE[z-Alazun | v-walk]"));
    assert.equal(readings.length, 2);
  });
});

/** The one reading of a one-clause gloss. */
const one = (gloss: string): Reading => read(gloss)[0]!;
type ListTerm = Extract<Term, { kind: "list" }>;
const asList = (term: Term | undefined): ListTerm => {
  assert.equal(term?.kind, "list");
  return term as ListTerm;
};

describe("reader audit (R4): doc examples, one per test, checked against the doc's meaning", () => {
  // Not a doc example: the R2 say/binder fixture, audited because the CLI shows its list as `zual()`.
  it("audit suspect: *every dog* keeps its kind on the list's shared record", () => {
    const z = asList(one("h-episode-event-ALLOW-said | [z-everything | g-dog] | v-walk | th-not").claim.roles.z);
    assert.deepEqual(z.members, []);
    assert.equal(z.shared.length, 1);
    assert.equal(z.shared[0]!.role, "kind");
  });

  it("causation.md:32: a command over an `if` hinge by text order; the condition clause is hosted", () => {
    const reading = one("y-command | v-walk | [th-if | bl-that-clause] | z-Alazun | v-sit");
    assert.deepEqual(families(reading), ["force", "hinge"]);
    assert.deepEqual(orders(reading), ["force>hinge rule"]);
    assert.equal(reading.claim.roles.z, undefined);
    const hosted = frame(reading, "hinge").hosted;
    assert.ok(hosted?.kind === "clause" && hosted.reading.claim.roles.z?.kind === "thing");
  });

  it("holder.md:141: the holder covers the no-judgment join (a rule) and its own channel (word shape)", () => {
    const reading = one("z-Azozon | v-walk | th-not | th-MEMORY-Azozon");
    assert.deepEqual(families(reading), ["polarity", "holder", "stance"]);
    assert.ok(orders(reading).includes("holder>polarity rule"));
    assert.ok(orders(reading).includes("holder>stance wordShape"));
  });

  it("review-intermediate.md:451: a say word's fields", () => {
    const say = frame(one("z-Alazun | v-sit | h-episode-event-ALLOW-rule"), "say").values;
    assert.deepEqual([say.reach, say.part, say.answer], ["u", "v", "a"]);
  });

  it("contrary-to.md:55: a say word inside a `whereas` clause stays in that clause", () => {
    const reading = one("z-speaker | v-sleep | [h-whereas | bl-that-clause] | z-speaker | v-walk | h-episode-agent-ALLOW-rule");
    assert.deepEqual(families(reading), ["hinge"]);
    const hosted = frame(reading, "hinge").hosted;
    assert.ok(hosted?.kind === "clause");
    assert.deepEqual(families(hosted.reading), ["say"]);
    assert.equal(hosted.reading.frames[0]!.values.part, "z");
  });

  it("hooked-joins.md:9: a free hook after a join is a detail of the clause, not the join's bound", () => {
    const reading = one("z-everything | v-sleep | [at | b-house]");
    assert.deepEqual(families(reading), ["binder"]);
    assert.equal(reading.claim.details.length, 1);
    assert.equal(reading.claim.details[0]!.hosted?.kind, "thing");
  });

  it("stance-bars.md:36: REPORTED as a bar on a member of the rank fence, not a clause stance", () => {
    const reading = one("[z-book | th-REPORTED | z-rank/less | g-clarity]");
    assert.ok(!families(reading).includes("stance"));
    const z = asList(reading.claim.roles.z);
    assert.ok(z.members.some((m) => m.kind === "thing" && m.frames?.some((f) => f.family === "bar")));
    assert.equal(z.shared[0]?.role, "scale");
  });

  it("usually-vs-must.md:26: a channel before *every* covers it by text order", () => {
    const reading = one("th-DEDUCED.strong | [z-everything | g-role-agent-teach] | v-teach");
    assert.deepEqual(orders(reading), ["stance>binder rule"]);
    assert.equal(asList(reading.claim.roles.z).shared[0]?.role, "kind");
  });

  it("special-values.md:77: a channel's time offset is hosted on the channel", () => {
    const stance = frame(one("z-Azozon | [th-MEMORY | bl---e-] | v-walk"), "stance");
    assert.equal(stance.member, "channel");
    assert.equal(stance.hosted?.kind, "number");
  });

  it("already-still-yet.md:66: MAY over not-yet by text order", () => {
    assert.deepEqual(orders(one("z-Alazun | th-MAY | th-not-yet | v-departure")), ["stance>phase rule"]);
  });

  it("evidentiality.md:101: a hand-count number after a channel, text order", () => {
    const reading = one("z-Alazun | th-REPORTED | th-3rd-hand | v-departure");
    assert.deepEqual(families(reading), ["stance", "stance"]);
    assert.deepEqual(orders(reading), ["stance>stance rule"]);
  });

  it("holder.md:12: the holder is the party and sits over its channel by word shape", () => {
    const reading = one("z-Alazun | th-CLUES-Azozon | v-departure");
    assert.deepEqual(orders(reading), ["holder>stance wordShape"]);
    assert.equal(frame(reading, "holder").party?.kind, "thing");
  });

  it("contrary-to.md:104: a holder covers a later `although` hinge", () => {
    const reading = one("z-Azozon | v-walk | th-CLUES-Alazun | [th-although | bl-rain]");
    assert.deepEqual(orders(reading), ["holder>stance wordShape", "holder>hinge rule", "stance>hinge rule"]);
    assert.equal(frame(reading, "hinge").hosted?.kind, "thing");
  });

  it(
    "nested-dependents.md:11: a reason for a reason nests, and *Azozon is sleepy* is the predicate",
    { todo: "needs parser records: the dependent clause holds the inner `blarl` clause flat (no nested `dependent`), and `guzemel` before a hinge is an adjective on the subject's package, not a predicate unit" },
    () => {
      const reading = one("[z-Azozon | g-sleepy] | [th-because | bl-that-clause] | z-Alazun | v-walk | [th-because | bl-that-clause] | z-Ahelan | v-sleep");
      assert.equal(reading.claim.predicate.length, 1);
      const middle = frame(reading, "hinge").hosted;
      assert.ok(middle?.kind === "clause");
      assert.deepEqual(middle.reading.unread, []);
      const inner = frame(middle.reading, "hinge").hosted;
      assert.ok(inner?.kind === "clause" && inner.reading.claim.verb?.kind === "thing");
    },
  );

  it(
    "can-and-cant.md:100: one ability frame that says *unable* and *temporary*",
    () => {
      const reading = one("z-Azozon | h-ABIL-unable-temporary");
      assert.deepEqual(families(reading), ["ability"]);
      assert.equal(frame(reading, "ability").values.stanceVowel, "o");
    },
  );

  it("as-of.md:17: RESIDUE is a frame and the as-of clock time a time detail", () => {
    const reading = one("z-Alazun | h-RESIDUE | [h-as-of.ledger | bl-_22,7] | v-departure");
    assert.deepEqual(families(reading), ["residue"]);
    assert.equal(frame(reading, "residue").member, "residue");
    assert.equal(reading.claim.details[0]?.hosted?.kind, "number");
  });

  it("contrary-to.md:11: the plan sits inside the contrary frame", () => {
    const reading = one("z-Azozon | v-walk | [contrary-to | th-plan-itinerary]");
    assert.deepEqual(families(reading), ["contrary"]);
    assert.deepEqual(frame(reading, "contrary").inner?.map((f) => f.family), ["intention"]);
  });

  it(
    "hooked-joins.md:127: *never since the thunderstorm* keeps the hook that bounds the times",
    () => {
      const occasion = frame(one("z-listener | v-hear | [h-from-x-never.open | bl-thunderstorm]"), "occasion");
      assert.equal(occasion.hosted?.kind, "thing");
      assert.equal(occasion.values.hook, "ul");
    },
  );

  it("ought-for-a-sake.md:12: the sake's stake holder is a bound pronoun", () => {
    const sake = frame(one("z-Ahelan | v-sing | [th-physical-ought-invited | bl-←episode-agent.self]"), "sake");
    assert.ok(sake.party?.kind === "pronoun" && sake.party.antecedent?.kind === "thing");
  });

  it("clause.md:83: speaker attitude is a frame", () => {
    assert.deepEqual(families(one("z-dog | th-doubt | v-walk")), ["attitude"]);
  });

  it("span-nesting.md:13: a faulty quote is a nested reading in the object role", () => {
    const reading = one("z-Azozon | d-CITE[flaw]# | v-tell");
    assert.equal(frame(reading, "quote").content?.length, 1);
    assert.equal(reading.claim.roles.d?.kind, "quote");
  });

  it("usually-vs-must.md:20: a weak pattern channel over *always* by text order", () => {
    const reading = one("th-PATTERN.weak | z-Azozon | h-always | v-walk");
    assert.deepEqual(orders(reading), ["stance>occasion rule"]);
    assert.equal(frame(reading, "stance").member, "channel");
  });

  it("residue-and-former.md:42: FORMER covers *always* though it comes later (a rule)", () => {
    assert.deepEqual(orders(one("z-Azozon | h-always | v-sing | h-FORMER")), ["residue>occasion rule"]);
  });

  it("universals-domains.md:242: *every dog sees a cat* (known gap: the new-member phrase has no frame)", () => {
    const reading = one("[[z-everything | g-dog] | z-tag.A] | [d-cat | d-tag.O] | v-see");
    assert.deepEqual(families(reading), ["binder"]);
    assert.deepEqual(reading.order, []);
    assert.equal(reading.claim.roles.d?.kind, "thing");
  });

  it("want-and-decide.md:48: WANT before PLAN, text order", () => {
    assert.deepEqual(orders(one("z-speaker | th-WANT-lasting | th-plan-itinerary | v-walk")), ["intention>intention rule"]);
  });

  it("stand-in-vowels.md:126: a plan covers a later `because` hinge", () => {
    const reading = one("th-plan-itinerary | z-Azozon | v-walk | [th-because | bl-that-clause] | z-Alazun | v-tell");
    assert.deepEqual(orders(reading), ["intention>hinge rule"]);
    assert.ok(reading.links.some((l) => l.kind === "standIn"));
  });

  it(
    "list-structure.md:113: *respectively* pairs the subjects with the verbs",
    () => {
      const reading = one("[z-Azozon | z-Alazun | z-and] | [v-walk | v-run | w-respectively | v-and]");
      assert.equal(asList(reading.claim.verb).members.length, 2);
      const verb = asList(reading.claim.verb);
      const pairing = reading.links.find((l) => l.kind === "pairing");
      assert.ok(pairing && pairing.words.includes(verb.join!), JSON.stringify(reading.links.map((l) => l.kind)));
    },
  );

  it(
    "verb-and-stance-joins.md:32: *sees Ahelan* keeps Ahelan as the object of see",
    () => {
      const verb = asList(one("z-Azozon | [v-walk | [d-Ahelan | v-see] | v-and]").claim.verb);
      const see = verb.members[1]!;
      assert.ok(see.kind === "clause" && see.reading.claim.roles.d?.kind === "thing" && see.reading.claim.verb);
    },
  );

  it(
    "hooked-joins.md:11: *everyone at the house* keeps its bound on the list",
    () => {
      const reading = one("[z-at-x-everything | bl-house] | v-sleep");
      assert.deepEqual(families(reading), ["binder"]);
      const z = asList(reading.claim.roles.z);
      assert.ok(z.values.hook && z.bound?.values.hook === z.values.hook && z.bound.hosted?.kind === "thing");
    },
  );

  it(
    "hooked-joins.md:80: *for whom?* asks with a blank bounded by *for me*",
    () => {
      const reading = one("y-question | [d-for-x-wh | bl-speaker]");
      assert.equal(frame(reading, "force").values.ask, "fillAsk");
      const d = reading.claim.roles.d;
      assert.ok(d?.kind === "blank" && d.details?.[0]?.hosted?.kind === "speaker");
    },
  );

  it(
    "fill-ask-jobs.md:13: *what kind of dog?* puts a blank term on the adjective",
    () => {
      const reading = one("y-question | g-wh | z-dog");
      assert.equal(frame(reading, "force").values.ask, "fillAsk");
      assert.equal(reading.claim.predicate[0]?.kind, "blank");
    },
  );
});
