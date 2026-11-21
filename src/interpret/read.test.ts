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
import { coverage } from "./coverage.js";
import { allReadings, readParse, readText } from "./read.js";
import type { Frame, Reading, StanceList, Term } from "./types.js";

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

  it("feelings.md: a feeling root on /th/ is a speaker attitude; the same root as a label is the claim", () => {
    const [stance] = read("z-Azozon | th-hostility | v-walk");
    assert.deepEqual(families(stance!), ["attitude"]);
    assert.equal(frame(stance!, "attitude").key, "slot:th");
    assert.equal(frame(stance!, "attitude").anchor, "feelings.md#speaker-attitude");
    const [label] = read("z-speaker | g-angry");
    assert.deepEqual(families(label!), []);
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

  it("occasion: a restrictor holds the run of /h/ words right before it, and a FORMER word there is an occasion", () => {
    const [reading] = read("z-Azozon | h-FORMER | h-always-except | v-sing");
    assert.deepEqual(families(reading!), ["occasion"]);
    assert.deepEqual(frame(reading!, "occasion").occasions?.map((d) => d.words[0]!.raw), ["helam"]);
    const [listed] = read("z-Azozon | v-walk | h-haste | h-rain | h-night | h-only-when");
    assert.deepEqual(frame(listed!, "occasion").occasions?.map((d) => d.words[0]!.raw), ["hadurom", "herulal", "hanurul"]);
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
/** The one stance list a reading has, closed by a join of this series. */
const stanceList = (reading: Reading, series: string): StanceList => {
  const lists = reading.stanceLists?.filter((l) => l.values.series === series) ?? [];
  assert.equal(lists.length, 1);
  return lists[0]!;
};
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

  it("hooked-joins.md:9: a free hook after a join is a detail of the clause, not the join's bound; its landmark is a new member", () => {
    const reading = one("z-everything | v-sleep | [at | b-house]");
    assert.deepEqual(reading.frames.map((f) => f.key), ["joinSeries:ua", "slot:newMember"]);
    assert.equal(reading.claim.details.length, 1);
    assert.equal(reading.claim.details[0]!.hosted?.kind, "thing");
    assert.equal(reading.frames[1]!.hosted, reading.claim.details[0]!.hosted);
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

  it("holder.md:57: an `-n` holder is a name, marked named as the same name in a role is; `-r` resumes it; a kind is not", () => {
    const party = (text: string): Term | undefined => frame(readText(text, tables).at(-1)!, "holder").party;
    const named = party("zalazun theyomazozon vudurul.");
    assert.ok(named?.kind === "thing" && named.named && named.root === "azozo");
    const role = readText("zazozon vowurol.", tables)[0]!.claim.roles.z;
    assert.ok(role?.kind === "thing" && role.named && role.root === "azozo");
    // R4a-4: `-r` is a pronoun whose antecedent is the name it resumes.
    const resumed = party("zazozon vowurol. zalazun theyomazozor vudurul.");
    const antecedent = resumed?.kind === "pronoun" ? resumed.antecedent : undefined;
    assert.ok(antecedent?.kind === "thing" && antecedent.named && antecedent.root === "azozo");
    const kind = party("zalazun theyomeyel vudurul.");
    assert.ok(kind?.kind === "thing" && !kind.named);
  });

  it("because-and-iff.md:41: a stacked `thebem` takes the `thahum` frame's condition", () => {
    const hinges = (reading: Reading): Frame[] => reading.frames.filter((f) => f.family === "hinge");
    const [needs, fact] = hinges(readText("zazozon vowurol thebem thahum blarl zalazun vezuvel.", tables)[0]!);
    assert.equal(needs?.values.gloss, "only-if");
    assert.equal(fact?.values.gloss, "because");
    assert.equal(fact?.hosted?.kind, "clause");
    assert.equal(needs?.hosted, fact?.hosted);
    const [nounNeeds, nounFact] = hinges(readText("zazozon vowurol thebem thahum blerulal.", tables)[0]!);
    assert.ok(nounFact?.hosted && nounNeeds?.hosted === nounFact.hosted);
    // `blarl` before a period: the next sentence is the condition of both, each through its own grounds link.
    const [first, next] = readText("zazozon vowurol thebem thahum blarl. zalazun vezuvel.", tables);
    const grounds = first!.links.filter((l) => l.kind === "grounds");
    assert.deepEqual(
      grounds.map((l) => [l.frame?.values.gloss, l.to]),
      [
        ["because", next!.id],
        ["only-if", next!.id],
      ],
    );
    // A lone `thebem` keeps its own condition.
    const [alone] = hinges(readText("zalazun vehohel thebem blarl zazozon vowurol.", tables)[0]!);
    assert.equal(alone?.hosted?.kind, "clause");
  });

  it("because-and-iff.md:18: a stacked `gebem` on a noun takes the `gahum` detail's condition", () => {
    const hinges = (reading: Reading) => {
      const z = reading.claim.roles.z;
      return z?.kind === "thing" ? z.details.filter((d) => d.key === "overlay:clause_hinge:g") : [];
    };
    const [needs, fact] = hinges(readText("zazozon gebem gahum blalazun.", tables)[0]!);
    assert.equal(needs?.values.gloss, "only-if");
    assert.equal(fact?.values.gloss, "because");
    assert.ok(fact?.hosted?.kind === "thing" && fact.hosted.root === "alazu");
    assert.equal(needs?.hosted, fact?.hosted);
    // A lone `gebem` keeps its own condition.
    const [pred] = readText("zazozon gebem blalazun.", tables)[0]!.claim.predicate;
    const alone = pred?.kind === "thing" ? pred.details[0] : undefined;
    assert.ok(alone?.hosted?.kind === "thing" && alone.hosted.root === "alazu");
  });

  it("list-structure.md#shared-after-the-join: a hook right after the join word is SHARED, each item's", () => {
    const reading = readText("zodozel zogozel zal om bahelan vowurol.", tables)[0]!;
    const z = reading.claim.roles.z;
    assert.ok(z?.kind === "list");
    const [hook] = z.sharedDetails ?? [];
    assert.equal(hook?.key, "hookJob:genitive");
    assert.equal(hook?.values.role, "distribute");
    assert.ok(hook?.hosted?.kind === "thing" && hook.hosted.root === "ahela");
    assert.equal(reading.claim.details.length, 0);
    // On the item before the join word, the hook is that item's alone.
    const item = readText("zazozon zodozel om bazozor zal vowurol.", tables)[0]!.claim.roles.z;
    assert.ok(item?.kind === "list" && !item.sharedDetails);
    // Anywhere else it is an extra noun of the clause.
    const clause = readText("zodozel zogozel zal gamahum om bahelan vowurol.", tables)[0]!;
    assert.deepEqual(clause.claim.details.map((d) => d.key), ["hookJob:genitive"]);
  });

  it("holder.md:84: a topic-pronoun holder carries the topic it is bound to", () => {
    const reading = readText("xazozon theyomalen zalazun vudurul.", tables)[0]!;
    const party = frame(reading, "holder").party;
    assert.ok(party?.kind === "pronoun" && party.antecedent?.kind === "thing" && party.antecedent.root === "azozo");
    assert.ok(reading.links.some((l) => l.key === "anaphor:topic"));
  });

  it("holder.md:9: a listener holder is the listener term, as `zawan` is in a role", () => {
    const reading = readText("zalazun theyomawan vudurul.", tables)[0]!;
    assert.equal(frame(reading, "holder").party?.kind, "listener");
  });

  it("contrary-to.md:113: a holder after `uom` has its party, and its channel with its gloss nests in it", () => {
    const inner = (text: string): Frame[] => frame(readText(text, tables).at(-1)!, "contrary").inner ?? [];
    const [holder] = inner("zazozon vowurol uom thebamalazun.");
    const channel = holder?.inner?.[0];
    assert.ok(holder?.family === "holder" && holder.party?.kind === "thing" && holder.party.named && holder.party.root === "alazu");
    assert.ok(channel?.family === "stance" && channel.holderHost && channel.member === "channel");
    assert.equal(channel?.values.gloss, "REPORTED");
    const plan = inner("zazozon vowurol uom theyomalazun thagom.");
    assert.deepEqual(plan.map((f) => f.family), ["holder", "intention"]);
    assert.equal(plan[0]!.inner?.[0]?.values.gloss, "CLUES");
    assert.equal(inner("zazozon vowurol uom theyomawan thagom.")[0]!.party?.kind, "listener");
    const topic = inner("xazozon zazozon vowurol uom thebamalen.")[0]!.party;
    assert.ok(topic?.kind === "pronoun" && topic.antecedent?.kind === "thing" && topic.antecedent.root === "azozo");
  });

  it("contrary-to.md:104: a holder covers a later `although` hinge", () => {
    const reading = one("z-Azozon | v-walk | th-CLUES-Alazun | [th-although | bl-rain]");
    assert.deepEqual(orders(reading), ["holder>stance wordShape", "holder>hinge rule", "stance>hinge rule"]);
    assert.equal(frame(reading, "hinge").hosted?.kind, "thing");
  });

  it("nested-dependents.md:11: a reason for a reason nests, and *Azozon is sleepy* is the predicate", () => {
    const reading = one("[z-Azozon | g-sleepy] | [th-because | bl-that-clause] | z-Alazun | v-walk | [th-because | bl-that-clause] | z-Ahelan | v-sleep");
    assert.equal(reading.claim.predicate.length, 1);
    const subject = reading.claim.roles.z;
    assert.ok(subject?.kind === "thing" && subject.details.length === 0);
    const middle = frame(reading, "hinge").hosted;
    assert.ok(middle?.kind === "clause");
    assert.deepEqual(middle.reading.unread, []);
    const inner = frame(middle.reading, "hinge").hosted;
    assert.ok(inner?.kind === "clause" && inner.reading.claim.verb?.kind === "thing");
    assert.equal(inner.reading.id, `${middle.reading.id}/d`);
  });

  it("predication.md:15: a bare property sentence and one before a hinge give the same predicate", () => {
    const bare = one("z-Azozon | g-sleepy");
    const hinged = one("[z-Azozon | g-sleepy] | [th-because | bl-that-clause] | z-Alazun | v-walk");
    for (const reading of [bare, hinged]) {
      assert.equal(reading.claim.predicate.length, 1);
      assert.equal(reading.claim.predicate[0]?.kind, "thing");
    }
    // A noun with its adjective under a verb keeps it as a detail.
    const described = one("[z-Azozon | g-sleepy] | v-walk");
    assert.equal(described.claim.predicate.length, 0);
  });

  it("list-structure.md:113: *respectively* names its partner list", () => {
    const reading = one("[z-Azozon | z-Alazun | z-and] | [v-walk | v-run | w-respectively | v-and]");
    const pairing = reading.links.find((l) => l.kind === "pairing");
    assert.equal(pairing?.partners?.length, 1);
    assert.equal(pairing!.partners![0], reading.claim.roles.z);
    assert.equal(asList(reading.claim.verb).join, pairing!.words[1]);
  });

  it("list-structure.md:93: a noun list pairs with a noun list of another role", () => {
    const reading = one("[z-Azozon | z-Alazun | z-Ahelan | z-and] | [d-cat | d-dog | d-bird | w-respectively | d-and] | v-see");
    const pairing = reading.links.find((l) => l.kind === "pairing");
    assert.deepEqual(pairing?.partners, [reading.claim.roles.z]);
  });

  it("joins.md:315: a different clause join closes the group before it", () => {
    const reading = one("[[z-Azozon | v-walk | x-or-exactly-one | z-Alazun | v-run] | x-and | z-Ahelan | v-sleep]");
    const outer = asList(reading.claim.clauses);
    assert.equal(outer.members.length, 2);
    const group = asList(outer.members[0]);
    assert.notEqual(group.join?.raw, outer.join?.raw);
    assert.equal(group.members.length, 2);
    assert.equal(outer.members[1]?.kind, "clause");
  });

  it("joins.md:317: a clause list closed and joined again nests on the left", () => {
    const reading = one("[[z-Azozon | v-walk | x-and | z-Alazun | v-run | x-and | z-Ahelan | v-sleep] | x-or-exactly-one | z-Azozon | v-sleep]");
    const outer = asList(reading.claim.clauses);
    const group = asList(outer.members[0]);
    assert.equal(group.members.length, 3);
    assert.ok(group.members.every((m) => m.kind === "clause"));
    assert.deepEqual(outer.parts.map((p) => p.join?.raw), [outer.join?.raw, undefined]);
  });

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
      const occasion = frame(one("z-listener | v-hear | [h-from-x-never.open | bl-storm]"), "occasion");
      assert.equal(occasion.hosted?.kind, "thing");
      assert.equal(occasion.values.hook, "ul");
    },
  );

  it("ought-for-a-sake.md:12: the sake's stake holder is a bound pronoun", () => {
    const sake = frame(one("z-Ahelan | v-sing | [th-physical-ought-invited | bl-←episode-agent.self]"), "sake");
    assert.ok(sake.party?.kind === "pronoun" && sake.party.antecedent?.kind === "thing");
  });

  it("clause.md:83: speaker attitude is a frame, under the new member before it", () => {
    const reading = one("z-dog | th-doubt | v-walk");
    assert.deepEqual(families(reading), ["binder", "attitude"]);
    assert.deepEqual(orders(reading), ["binder>attitude rule"]);
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

  it("universals-domains.md:242 and :254: *every dog sees a cat* and *a cat, every dog sees* differ in order (joins.md#everything-ua)", () => {
    const each = one("[[z-everything | g-dog] | z-tag.A] | [d-cat | d-tag.O] | v-see");
    assert.deepEqual(each.frames.map((f) => f.key), ["joinSeries:ua", "slot:newMember"]);
    assert.deepEqual(each.order.map((o) => `${o.over.key}>${o.under.key}`), ["joinSeries:ua>slot:newMember"]);
    assert.equal(each.claim.roles.d?.kind, "thing");
    assert.equal(each.frames[1]!.hosted, each.claim.roles.d);
    const single = one("[d-cat | d-tag.O] | [[z-everything | g-dog] | z-tag.A] | v-see");
    assert.deepEqual(single.order.map((o) => `${o.over.key}>${o.under.key}`), ["slot:newMember>joinSeries:ua"]);
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

describe("reader: every word in one place (R6a coverage fixes)", () => {
  /** The first reading of a sentence written as morph gloss, after checking that every word has exactly one place. */
  function placed(gloss: string): Reading {
    const result = parse(glossToAgeben(gloss, tables, index), tables);
    const readings = readParse(result, { tables });
    const cover = coverage(result, readings);
    assert.deepEqual(cover.missing.map((w) => w.word.raw), [], "missing");
    assert.deepEqual(cover.doubled.map((w) => w.word.raw), [], "doubled");
    return readings[0]!;
  }
  const list = (term: Term | undefined): Extract<Term, { kind: "list" }> => {
    assert.equal(term?.kind, "list");
    return term as Extract<Term, { kind: "list" }>;
  };

  it("as-of.md:62: a shared adjective is a detail on the list, with its as-of pair and bound", () => {
    const reading = placed("[z-Azozon | z-Alazun | z-rank/more | [[w-as-of.ledger | b-_22,7] | g-challenge]]");
    const [shared] = list(reading.claim.roles.z).sharedDetails ?? [];
    assert.equal(shared?.values.role, "scale");
    assert.equal(shared?.details?.[0]?.hosted?.kind, "number");
  });

  it("stance-bars.md:62: a bar's hosted `bl-` word is the bar frame's hosted", () => {
    const reading = placed("[z-book | [th-REPORTED | bl-Alazun] | z-rank/less | g-clarity]");
    const bar = list(reading.claim.roles.z).members[1];
    assert.ok(bar?.kind === "thing" && bar.frames?.[0]?.hosted?.kind === "thing");
  });

  it("hooked-joins.md:11: the binder frame keeps the join word and hosts the list", () => {
    const reading = placed("[z-at-x-everything | bl-house] | v-sleep");
    assert.equal(frame(reading, "binder").hosted, reading.claim.roles.z);
  });

  it("span-nesting.md:13: the quote frame hosts the quote term", () => {
    const reading = placed("z-Azozon | d-CITE[flaw]# | v-tell");
    assert.equal(frame(reading, "quote").hosted, reading.claim.roles.d);
  });

  it("joins.md:297: every join of a clause list is kept", () => {
    const reading = placed("[z-Azozon | v-walk | x-or-exactly-one | z-Alazun | v-run | x-or-exactly-one | z-Ahelan | v-sleep]");
    const clauses = list(reading.claim.clauses);
    assert.equal(clauses.parts.filter((p) => p.join).length, 2);
  });

  it("left-bound-adjectives.md:19: an adjective on a reaction is a detail on its frame", () => {
    const reading = placed("[gl-angry | y-dog]");
    assert.equal(frame(reading, "attitude").details?.[0]?.key, "slot:gl");
  });

  it("stand-in-roles.md:28: a verb stand-in's dependent nests on the verb", () => {
    const reading = placed("z-Azozon | v-confirm | z-Alazun | v-sit");
    const verb = reading.claim.verb;
    assert.ok(verb?.kind === "thing" && verb.details[0]?.kind === "dependent");
    assert.equal(reading.claim.details.length, 0);
  });

  it("scope-islands.md:62: a joined adjective list is read with its joins", () => {
    const reading = placed("[z-dog | [g-red | SCOPE[g-small | g-not] | g-and]] | v-walk");
    const subject = reading.claim.roles.z;
    assert.ok(subject?.kind === "thing");
    const adjectives = list(subject.details.find((d) => d.key === "unit:gCoord")?.hosted);
    assert.equal(adjectives.members.length, 2);
  });
});

describe("reader: scope rows the reader needs (R6b)", () => {
  it("more-turn-words.md:13: a doubled act word gives each word a force frame, and the two commute", () => {
    const result = parse(glossToAgeben("y-prohibition | y-prohibition | v-sneak", tables, index), tables);
    const [reading] = readParse(result, { tables });
    assert.deepEqual(coverage(result, [reading!]).missing, []);
    assert.deepEqual(reading!.frames.map((f) => `${f.key} ${f.member ?? ""}`), ["edge:force repeat", "edge:force repeat"]);
    assert.deepEqual(reading!.order, []);
  });

  it("more-turn-words.md#stacked-acts: the first act word, the real act, covers the second", () => {
    const [reading] = read("y-command | y-question | v-punch | d-box | z-listener");
    assert.deepEqual(reading!.frames.filter((f) => f.family === "force").map((f) => f.words[0]!.raw), ["yol", "yel"]);
    const acts = reading!.order.filter((o) => o.under.family === "force");
    assert.deepEqual(acts.map((o) => `${o.over.words[0]!.raw}>${o.under.words[0]!.raw} ${o.anchors[0]}`), ["yol>yel more-turn-words.md#stacked-acts"]);
  });

  it("comparative-arity.md#frequency-scale and feelings.md#feeling-whose-stake: a detail and a party, no frame", () => {
    const [scale] = read("[z-Azozon | z-Alazun | z-rank/more | h-how-often] | v-walk");
    assert.deepEqual(scale!.frames, []);
    const [stake] = read("[th-autonomy-unmet-irreversible-STAYING-OPEN | bl-Azozon]");
    assert.deepEqual(stake!.frames.map((f) => `${f.family} ${f.key}`), ["sake lexReading:sake"]);
    assert.equal(stake!.frames[0]!.party?.kind, "thing");
  });
});

describe("reader: new members, calls, greetings and bodiless turns (R6d)", () => {
  /** Readings of a text in morph gloss, after checking that every word has exactly one place. */
  function placedAll(gloss: string): Reading[] {
    const result = parse(glossToAgeben(gloss, tables, index), tables);
    const readings = readParse(result, { tables });
    const cover = coverage(result, readings);
    assert.deepEqual(cover.missing.map((w) => w.word.raw), [], "missing");
    assert.deepEqual(cover.doubled.map((w) => w.word.raw), [], "doubled");
    return readings;
  }
  const byWord = (reading: Reading): string[] => reading.order.map((o) => `${o.over.words[0]!.raw}>${o.under.words[0]!.raw}`);

  it("clause.md:97: concern covers the new dog, which covers the doubt (clause.md#which-covers-which, joins.md#everything-ua)", () => {
    const [reading] = placedAll("th-concern | z-dog | th-doubt | v-walk");
    const [concern, dog, doubt] = reading!.frames.map((f) => f.words[0]!.raw);
    assert.deepEqual(reading!.frames.map((f) => f.key), ["slot:th", "slot:newMember", "slot:th"]);
    assert.deepEqual(byWord(reading!), [`${concern}>${dog}`, `${concern}>${doubt}`, `${dog}>${doubt}`]);
    assert.equal(reading!.frames[1]!.hosted, reading!.claim.roles.z);
  });

  it("a new member and a standalone join follow text order", () => {
    const [reading] = placedAll("z-dog | v-walk | th-not");
    assert.deepEqual(orders(reading!), ["binder>polarity rule"]);
  });

  it("a named noun, and a list with one, bring in no new-member frame", () => {
    assert.deepEqual(families(one("z-Azozon | v-walk")), []);
    assert.deepEqual(families(one("[z-Azozon | z-dog | z-and] | v-walk")), []);
  });

  it("a new member's frame hosts its whole role phrase: `-r`, an and-list, `-m`, an `x` compound, a number (joins.md#everything-ua)", () => {
    const glosses = [
      "z-something | v-walk",
      "[z-person | z-something] | v-walk",
      "[z-dog | z-cat | z-and] | v-walk",
      "z-grace | v-walk",
      "z-peanut-x-butter | v-walk",
      "[z-cat-x | g-three] | v-walk",
    ];
    for (const gloss of glosses) {
      const [reading] = placedAll(gloss);
      assert.deepEqual(reading!.frames.map((f) => f.key), ["slot:newMember"], gloss);
      assert.equal(reading!.frames[0]!.hosted, reading!.claim.roles.z, gloss);
    }
  });

  it("a measure phrase brings in no new member; a counted noun does (measures-and-percent.md#units)", () => {
    const [measure] = placedAll("z-cost | [b-percentage-point | g-two] | v-rise");
    assert.deepEqual(measure!.frames.map((f) => `${f.key} ${f.words[0]?.pos}`), ["slot:newMember z"]);
    const [counted] = placedAll("z-Azozon | v-tell | [b-dog | g-two]");
    assert.deepEqual(counted!.frames.map((f) => f.key), ["slot:newMember"]);
  });

  it("a fill-ask blank and a title's words bring in no new member (questions.md#fill-ask, proper-names.md#titled-phrases)", () => {
    const [ask] = placedAll("y-question | z-wh | d-wh | v-see");
    assert.deepEqual(ask!.frames.map((f) => f.key), ["edge:force"]);
    assert.deepEqual(ask!.unordered, []);
    const [title] = placedAll("NAME[d-tea | instead | d-coffee]");
    assert.deepEqual(title!.frames, []);
  });

  it("a hook's landmark brings in a new member: its frame hosts the landmark and covers a later stance word", () => {
    const [reading] = placedAll("z-Azozon | v-sleep | [in | b-house] | th-MAY");
    assert.deepEqual(reading!.frames.map((f) => f.key), ["slot:newMember", "overlay:may:th"]);
    assert.deepEqual(orders(reading!), ["binder>stance rule"]);
    const hook = reading!.claim.details.find((d) => d.hosted);
    assert.equal(reading!.frames[0]!.hosted, hook?.hosted);
  });

  it("a role phrase of a verb-list item is a new member of that item's reading; a shared one, of the clause's", () => {
    const [reading] = placedAll("z-Azozon | [v-see | [d-bird | v-eat] | v-and] | th-MAY");
    assert.deepEqual(reading!.frames.map((f) => f.key), ["overlay:may:th"]);
    const verb = reading!.claim.verb;
    const item = verb?.kind === "list" ? verb.members.find((m) => m.kind === "clause") : undefined;
    const inner = item?.kind === "clause" ? item.reading : undefined;
    assert.deepEqual(inner?.frames.map((f) => f.key), ["slot:newMember"]);
    assert.equal(inner!.frames[0]!.hosted, inner!.claim.roles.d);
    const [shared] = placedAll("z-Azozon | [v-see | v-eat | v-and | d-bird]");
    assert.deepEqual(shared!.frames.map((f) => f.key), ["slot:newMember"]);
    assert.equal(shared!.frames[0]!.hosted, shared!.claim.roles.d);
  });

  it("a call commutes with every frame in its clause and is no force frame (speech-moves.md#vocative)", () => {
    const [reading] = placedAll("y-Azozon | y-question | z-Azozon | v-walk | th-MAY");
    assert.deepEqual(reading!.frames.map((f) => `${f.family} ${f.key}`), ["call edge:vocative", "force edge:force", "stance overlay:may:th"]);
    assert.deepEqual(orders(reading!), ["force>stance rule"]);
    assert.equal(reading!.frames[0]!.party?.kind, "thing");
  });

  it("a greeting gets a greeting frame; a one-name answer after the act word does not (word-endings.md#greeting, questions.md#fill-ask)", () => {
    const [greeting] = placedAll("Azozon");
    assert.deepEqual(greeting!.frames.map((f) => f.key), ["reading:greeting"]);
    assert.equal(greeting!.frames[0]!.hosted, greeting!.claim.roles.z);
    const [, answer] = placedAll("y-question | z-wh | v-walk . y-statement | Azozon");
    assert.deepEqual(answer!.frames.map((f) => f.key), ["edge:force"]);
  });

  it("a turn with no body has a scope record, matched by utterance", () => {
    const result = parse(glossToAgeben("y-Azozon | y-question", tables, index), tables);
    const record = result.resolve?.scope?.find((s) => s.bodiless);
    assert.equal(record?.utteranceIndex, 0);
    const [reading] = placedAll("y-Azozon | y-question");
    assert.deepEqual(reading!.frames.map((f) => f.family), ["call", "force"]);
    assert.deepEqual(reading!.order, []);
    assert.equal(reading!.frames[1]!.values.ask, "yesNo");
  });
});

describe("reader: tone marks (tone-marks.md#showing-your-tone)", () => {
  /** Readings of a gloss, with every word placed once. */
  function toned(gloss: string): { readings: Reading[]; all: Reading[] } {
    const result = parse(glossToAgeben(gloss, tables, index), tables);
    const readings = readParse(result, { tables });
    const cover = coverage(result, readings);
    assert.deepEqual(cover.missing.map((w) => w.word.raw), [], "missing");
    assert.deepEqual(cover.doubled.map((w) => w.word.raw), [], "doubled");
    return { readings, all: allReadings(readings) };
  }
  const tone = (frames: Frame[] | undefined): Frame => {
    const found = frames?.filter((f) => f.key === "edge:tone") ?? [];
    assert.equal(found.length, 1, "one tone frame");
    assert.equal(found[0]!.family, "attitude");
    assert.equal(found[0]!.anchor, "tone-marks.md#showing-your-tone");
    assert.deepEqual(found[0]!.words, [], "a tone has no word of its own");
    return found[0]!;
  };

  it("tone-marks.md:46: a mark on a word sits on that word's term (unsure about just the dog)", () => {
    const { readings } = toned("z-Azozon | ?d-dog | v-see");
    const dog = readings[0]!.claim.roles.d as Extract<Term, { kind: "thing" }>;
    assert.deepEqual(tone(dog.frames).values, { mark: "?", names: "unsure", scope: "word" });
    assert.ok(!readings[0]!.frames.some((f) => f.key === "edge:tone"), "not a whole-clause frame");
  });

  it("tone-marks.md:122: a mark on a span sits on the span's term", () => {
    const { readings } = toned("z-Azozon | ?d-CITE[Azozon] | v-tell");
    const quote = readings[0]!.claim.roles.d!;
    assert.equal(quote.kind, "quote");
    assert.equal(tone("frames" in quote ? quote.frames : undefined).values.scope, "span");
  });

  it("scope-islands.md:19: a mark before an island's brace frames the island's reading only", () => {
    const { readings, all } = toned("z-Ahelan | !SCOPE[h-possibility | d-untruth] | v-see");
    const island = all.find((r) => /\/i\d+$/.test(r.id))!;
    assert.deepEqual(tone(island.frames).values, { mark: "!", names: "strong", scope: "island" });
    assert.ok(!readings[0]!.frames.some((f) => f.key === "edge:tone"), "not the clause's frame");
  });

  it("tone-marks.md:52: a mark standing alone is a whole-clause attitude frame, ordered with the act word by its row", () => {
    const { readings } = toned("! | y-soft-question | z-Azozon | v-walk");
    const reading = readings[0]!;
    assert.deepEqual(families(reading), ["attitude", "force"]);
    assert.deepEqual(tone(reading.frames).values, { mark: "!", names: "strong", scope: "rest" });
    assert.deepEqual(orders(reading), ["attitude>force rule"]);
  });

  it("tone-marks.md:72: a stack is one mark with both names", () => {
    const { readings } = toned("?! | z-Alazun | d-dog | v-see");
    assert.equal(tone(readings[0]!.frames).values.names, "unsure strong");
  });

  it("tone-marks.md:128: a second free-standing mark takes over from its place on; the pair is not unordered", () => {
    const { readings } = toned("! | z-Azozon | % | d-dog | v-see");
    const reading = readings[0]!;
    assert.deepEqual(reading.unordered, []);
    assert.equal(tone(reading.frames).values.mark, "!");
    const dog = reading.claim.roles.d as Extract<Term, { kind: "thing" }>;
    assert.deepEqual(tone(dog.frames).values, { mark: "%", names: "joking", scope: "rest" });
    assert.equal(tone(reading.claim.verb && "frames" in reading.claim.verb ? reading.claim.verb.frames : undefined).values.mark, "%");
    const azozon = reading.claim.roles.z as Extract<Term, { kind: "thing" }>;
    assert.ok(!azozon.frames?.some((f) => f.key === "edge:tone"), "the earlier mark's word takes no later tone");
  });

  it("tone-marks.md:142: a free-standing mark mid-sentence colors only the words after it, with no clause frame", () => {
    const { readings } = toned("z-Azozon | ! | d-dog | v-see");
    const reading = readings[0]!;
    assert.ok(!reading.frames.some((f) => f.key === "edge:tone"), "not a whole-clause frame");
    assert.deepEqual(orders(reading), []);
    const dog = reading.claim.roles.d as Extract<Term, { kind: "thing" }>;
    assert.deepEqual(tone(dog.frames).values, { mark: "!", names: "strong", scope: "rest" });
    const azozon = reading.claim.roles.z as Extract<Term, { kind: "thing" }>;
    assert.ok(!azozon.frames?.some((f) => f.key === "edge:tone"), "the word before the mark is not colored");
  });
});

describe("reader: carried frames (evidentiality.md#carry-forward)", () => {
  /** Each sentence's carried links, as `kind:word->source` with the frame's family. */
  const carried = (readings: Reading[]): string[][] =>
    readings.map((r) =>
      r.links
        .filter((l) => l.kind === "carriedFrame")
        .map((l) => `${l.key}:${l.words[0]!.raw}->${l.to}:${l.frame?.family ?? "none"}`),
    );
  const ids = (readings: Reading[]): string[] => readings.map((r) => r.id);

  it("channel: later bare statements get a link to the reading that set it, never a copied frame", () => {
    const readings = read("z-Alazun | th-REPORTED | v-departure . z-Alazun | v-run . z-Alazun | v-sing");
    const [first] = ids(readings);
    const word = readings[0]!.frames.find((f) => f.family === "stance")!.words[0]!.raw;
    assert.deepEqual(carried(readings), [[], [`carry:channel:${word}->${first}:stance`], [`carry:channel:${word}->${first}:stance`]]);
    assert.deepEqual(families(readings[1]!), []);
    const link = readings[2]!.links.find((l) => l.kind === "carriedFrame")!;
    assert.equal(link.frame, frame(readings[0]!, "stance"));
    assert.equal(link.anchor, "evidentiality.md#carry-forward");
  });

  it("channel: a question neither takes nor ends it; a statement after an answer word takes it", () => {
    const readings = read("z-Alazun | th-REPORTED | v-departure . y-question | z-Alazun | v-run . y-yes | z-Alazun | v-sing");
    assert.deepEqual(carried(readings).map((c) => c.length), [0, 0, 1]);
  });

  it("a bare body after a question is a statement and takes the frame (sentence-linkers.md#past-a-period)", () => {
    const bare = read("y-question | z-Alazun | v-run . z-Alazun | v-sing");
    assert.deepEqual(bare.map(families), [["force"], []]);
    const framed = read("z-Alazun | th-REPORTED | v-departure . y-question | z-Alazun | v-run . z-Alazun | v-sing");
    assert.deepEqual(carried(framed).map((c) => c.length), [0, 0, 1]);
    assert.deepEqual(framed[2]!.frames, []);
  });

  it("a sentence linker after a question keeps the question; a bare body after a command is a statement", () => {
    const linked = read("y-question | z-Alazun | v-run . x-therefore | z-Alazun | v-sing");
    assert.deepEqual(linked.map(families), [["force"], ["force"]]);
    assert.equal(frame(linked[1]!, "force").words[0]!.raw, frame(linked[0]!, "force").words[0]!.raw);
    const command = read("y-command | z-Alazun | v-run . z-Alazun | v-sing");
    assert.deepEqual(command.map(families), [["force"], []]);
  });

  it("channel: a topic word or a linker keeps it", () => {
    const readings = read("z-Azozon | th-REPORTED | v-walk . x-Alazun | z-TOPIC | v-sit");
    assert.deepEqual(carried(readings).map((c) => c.length), [0, 1]);
  });

  it("channel: a new channel replaces it", () => {
    const readings = read("z-Alazun | th-REPORTED | v-departure . z-Azozon | th-MEMORY | v-walk . z-Azozon | v-sit");
    assert.deepEqual(carried(readings).map((c) => c.length), [0, 0, 1]);
    assert.equal(readings[2]!.links.find((l) => l.kind === "carriedFrame")!.to, readings[1]!.id);
  });

  it("channel: a written statement word, *by the way*, and a goodbye end it", () => {
    for (const end of ["y-statement | z-Alazun | v-sleep", "x-by-the-way | z-Alazun | v-sleep", "Alazun . z-Alazun | v-sleep"]) {
      const readings = read(`Alazun . z-Alazun | th-REPORTED | v-departure . ${end}`);
      assert.deepEqual(carried(readings).flat(), [], end);
    }
    // A rhetorical question is a statement first, so it ends the frame too.
    const rhetorical = read("z-Alazun | th-REPORTED | v-departure . y-statement | y-question | z-wh | v-care . z-Alazun | v-sleep");
    assert.deepEqual(carried(rhetorical).flat(), []);
  });

  it("dated channel: the offset carries with the channel; a new offset sets a new time", () => {
    const readings = read("z-Azozon | [th-MEMORY | [bl-day | g-minus-one]] | v-walk . z-Azozon | v-sit");
    const link = readings[1]!.links.find((l) => l.kind === "carriedFrame")!;
    assert.equal(link.words.length, 3);
    assert.equal(link.anchor, "dated-channel.md#counting-from-now");
    const again = read("z-Azozon | [th-MEMORY | [bl-day | g-minus-one]] | v-walk . z-Azozon | [th-MEMORY | [bl-hour | g-minus-three]] | v-sit . z-Azozon | v-sing");
    assert.equal(again[2]!.links.find((l) => l.kind === "carriedFrame")!.to, again[1]!.id);
  });

  it("holder: the holder and the channel it sits on carry together; a new frame ends them", () => {
    const readings = read("z-Alazun | th-CLUES-Azozon | v-departure . z-Alazun | v-sleep");
    assert.deepEqual(carried(readings)[1]!.map((c) => c.split(":")[1]), ["holder", "channel"]);
    assert.deepEqual(readings[1]!.links.filter((l) => l.kind === "carriedFrame").map((l) => l.frame?.family), ["holder", "stance"]);
    const ended = read("z-Alazun | th-CLUES-Azozon | v-departure . z-Azozon | th-NOTIONAL | v-walk . z-Azozon | v-sit");
    assert.deepEqual(carried(ended)[2]!.map((c) => c.split(":")[1]), ["notional"]);
  });

  it("notional: a made-up story carries; a channel of its own ends the supposition", () => {
    const story = read("z-Azozon | th-NOTIONAL | v-walk . z-Azozon | v-sit . z-Azozon | v-sing");
    assert.deepEqual(carried(story).map((c) => c.length), [0, 1, 1]);
    assert.equal(story[2]!.links.find((l) => l.kind === "carriedFrame")!.frame?.family, "notional");
    const supposed = read(
      "z-Azozon | th-NOTIONAL-suppose | g-role-agent-teach . x-it-follows | z-Azozon | v-teach . z-Azozon | v-teach | th-DEDUCED | [th-if | bl-that-clause] | [z-Azozon | g-role-agent-teach]",
    );
    assert.deepEqual(carried(supposed).map((c) => c.length), [0, 1, 0]);
  });

  it("notional ends a carried channel", () => {
    const readings = read("z-Alazun | th-REPORTED | v-departure . z-Azozon | th-NOTIONAL | v-walk . z-Azozon | v-sit");
    assert.equal(readings[2]!.links.find((l) => l.kind === "carriedFrame")!.key, "carry:notional");
  });

  // Decided 2026-11-18 (13a): a holder on MAY carries; the MAY stays on its own sentence (holder.md#naming-a-holder).
  it("holder on MAY: the holder carries, the MAY does not", () => {
    const readings = read("z-Alazun | th-MAY-Azozon | v-departure . z-Alazun | v-sleep");
    assert.deepEqual(carried(readings)[1]!.map((c) => c.split(":")[1]), ["holder"]);
  });

  // Decided 2026-11-18 (14a): only a channel on the main clause starts or ends a frame (evidentiality.md#carry-forward).
  it("a channel in a dependent or on one member of a clause join neither starts nor ends a frame", () => {
    for (const middle of [
      "[z-Azozon | th-MEMORY | v-walk | x-and.open | z-Alazun | v-run]",
      "[z-Azozon | v-walk | x-and.open | z-Alazun | th-MEMORY | v-run]",
      "z-Azozon | v-scream | [th-because | bl-that-clause] | z-Alazun | th-MEMORY | v-punch",
    ]) {
      const readings = read(`z-Alazun | th-REPORTED | v-departure . ${middle} . z-Alazun | v-sit`);
      assert.deepEqual(carried(readings).map((c) => c.map((s) => s.split("->")[1])), [[], [`${readings[0]!.id}:stance`], [`${readings[0]!.id}:stance`]], middle);
    }
  });

  // Decided 2026-11-18 (16a): grounds you state are your claims on the same footing (evidentiality.md#carry-forward).
  // The grounds after `blarl` is the body's nested dependent: the body takes the frame, and the dependent is inside it.
  it("the grounds after `blarl` sit inside a body that takes the frame", () => {
    const readings = read("z-Alazun | th-REPORTED | v-departure . z-Azozon | v-scream | [th-because | bl-that-clause] | z-Alazun | v-punch");
    assert.deepEqual(carried(readings).map((c) => c.length), [0, 1]);
    assert.equal(readings[1]!.links.find((l) => l.kind === "standIn")!.to, `${readings[1]!.id}/d`);
  });

  // Decided 2026-11-18 (15): a carried frame covers what you claim, never your own stance (evidentiality.md#carry-forward).
  it("a sentence that only wants, plans or decides neither takes nor ends the frame", () => {
    for (const stance of ["th-WANT-unstated", "th-plan-itinerary", "th-DECISION-modifiable"]) {
      const readings = read(`z-Alazun | th-REPORTED | v-departure . z-Alazun | ${stance} | v-sing . z-Alazun | v-run`);
      assert.deepEqual(carried(readings).map((c) => c.map((s) => s.split("->")[1])), [[], [], [`${readings[0]!.id}:stance`]], stance);
    }
  });

  it("an attitude or a feeling word leaves the claim under the frame and sits over it", () => {
    for (const [stance, family] of [["th-hostility", "attitude"], ["th-relatedness-met-any-term-STAYING-OPEN", "sake"]] as const) {
      const readings = read(`z-Alazun | th-REPORTED | v-departure . z-Alazun | ${stance} | v-run`);
      const link = readings[1]!.links.find((l) => l.kind === "carriedFrame")!;
      assert.equal(link.to, readings[0]!.id, stance);
      assert.deepEqual(link.coveredBy, [frame(readings[1]!, family)], stance);
    }
    const plainSake = read("z-Alazun | th-REPORTED | v-departure . z-Azozon | v-walk | th-physical-met-any-term");
    assert.equal(plainSake[1]!.links.find((l) => l.kind === "carriedFrame")!.coveredBy, undefined);
  });

  it("polarity, speech manner and a new channel are unchanged", () => {
    for (const body of ["z-Alazun | [v-run | v-not]", "th-clarity | z-Alazun | v-run"]) {
      const readings = read(`z-Alazun | th-REPORTED | v-departure . ${body}`);
      assert.deepEqual(carried(readings).map((c) => c.length), [0, 1], body);
    }
    const replaced = read("z-Alazun | th-REPORTED | v-departure . z-Azozon | th-hostility | th-MEMORY | v-walk . z-Azozon | v-sit");
    assert.deepEqual(carried(replaced).map((c) => c.length), [0, 0, 1]);
    assert.equal(replaced[2]!.links.find((l) => l.kind === "carriedFrame")!.to, replaced[1]!.id);
  });

  it("evidentiality.md: *I know who* after a written statement word takes no frame", () => {
    const readings = read("z-Alazun | [th-REPORTED | [bl-person | bl-something]] | v-departure . y-statement | z-speaker | v-knowledge | d-whether-clause | z-something");
    assert.deepEqual(carried(readings).flat(), []);
  });
});

describe("reader audit (R8): doc examples, one per test, checked against the doc's meaning", () => {
  it("hooked-joins.md:170: an `/h/` hooked join before `blarl` is an occasion whose stretch is the next clause", () => {
    const reading = one("z-listener | v-hear | [h-from-x-never | bl-that-clause] | z-interlocutors | v-go | [in | b-house]");
    assert.deepEqual(families(reading), ["occasion"]);
    assert.equal(frame(reading, "occasion").hosted?.kind, "clause");
  });

  it("english.md:221: *respectively* on a verb list pairs it with the subject list", () => {
    const reading = one("[z-Azozon | z-Alazun | z-and] | [v-walk | v-run | w-respectively | v-and]");
    const pairing = reading.links.find((l) => l.kind === "pairing");
    assert.deepEqual(pairing?.partners, [reading.claim.roles.z]);
    assert.equal(asList(reading.claim.verb).members.length, 2);
  });

  it("same-role-words.md:63: *before whom* is a fill ask with a blank on the same-role hook", () => {
    const reading = one("y-question | before.open | z-wh | z-Azozon | v-walk");
    assert.equal(frame(reading, "force").values.ask, "fillAsk");
    assert.equal(reading.claim.details[0]?.hosted?.kind, "blank");
  });

  it("verb-and-stance-joins.md:252: MAY covers a standalone *no judgment* by text order", () => {
    const reading = one("th-MAY | z-Azozon | v-walk | th-not");
    assert.deepEqual(orders(reading), ["stance>polarity rule"]);
  });

  it(
    "verb-and-stance-joins.md:186: a join between a hinge and `blarl` denies only the grounds: a stance list of one",
    () => {
      const reading = one("z-Azozon | v-walk | [th-because | th-not] | bl-that-clause | z-Alazun | v-run");
      assert.ok(!reading.frames.some((f) => f.family === "polarity"), "not a whole-clause frame");
      const list = stanceList(reading, "u");
      assert.deepEqual(list.members, [frame(reading, "hinge")]);
      assert.equal(list.inner?.[0]?.family, "polarity");
      assert.equal(frame(reading, "hinge").inner, undefined, "the hinge holds nothing");
    },
  );

  it(
    "in-clause-hooks.md:86: `never` on the hook covers the house after it (*never in a house*)",
    () => {
      const reading = one("z-dog | v-sleep | [[w-never | in] | b-house]");
      const house = reading.frames.find((f) => f.family === "binder" && f.words[0]?.raw === "bohahal");
      assert.ok(!house, "the house's binder sits under `never`, not over the clause");
    },
  );
});

describe("reader (R9): a `/th/` join that closes stance words reads as one stance list", () => {
  it("verb-and-stance-joins.md:154: `thul` after one hinge denies the grounds: a list of one, the claim stands", () => {
    const reading = one("z-Azozon | v-walk | [[th-because | bl-rain] | th-not]");
    const list = stanceList(reading, "u");
    assert.deepEqual(list.members, [frame(reading, "hinge")]);
    assert.deepEqual(list.inner?.map((f) => f.family), ["polarity"]);
    assert.deepEqual(families(reading), ["hinge"], "no whole-clause polarity");
  });

  it("verb-and-stance-joins.md:162: a rank join over two grounds is a list with no frame of its own", () => {
    const reading = one("z-Azozon | v-walk | [[th-because | bl-rain] | [th-if | bl-Alazun] | th-rank/more]");
    const list = stanceList(reading, "o");
    assert.deepEqual(list.members, reading.frames.filter((f) => f.family === "hinge"));
    assert.equal(list.inner, undefined);
    assert.equal(reading.claim.details.length, 0, "the join is not an adverb on the claim");
  });

  it("decision 17: `thul` after two grounds denies their list, not the clause", () => {
    const reading = one("z-Azozon | v-walk | [[th-because | bl-rain] | [th-if | bl-Alazun] | th-not]");
    const list = stanceList(reading, "u");
    assert.deepEqual(
      list.members.map((m) => ("kind" in m ? m.join.raw : m.words[0]?.raw)),
      reading.frames.filter((f) => f.family === "hinge").map((f) => f.words[0]?.raw),
      "both hinges, in text order",
    );
    assert.deepEqual(list.inner?.map((f) => f.family), ["polarity"]);
    assert.deepEqual(families(reading), ["hinge", "hinge"], "no whole-clause polarity");
    assert.equal(reading.unread.length, 0);
  });

  it("verb-and-stance-joins.md:246: `thul` right after MAY denies MAY: a list of one", () => {
    const reading = one("z-Azozon | v-walk | [th-MAY | th-not]");
    const list = stanceList(reading, "u");
    assert.deepEqual(list.members, [frame(reading, "stance")]);
    assert.deepEqual(list.inner?.map((f) => f.family), ["polarity"]);
    assert.deepEqual(families(reading), ["stance"]);
  });

  it("verb-and-stance-joins.md:198: a standalone join closes nothing, so it is no list", () => {
    const reading = one("z-Azozon | v-walk | th-not");
    assert.equal(reading.stanceLists, undefined);
    assert.deepEqual(families(reading), ["polarity"]);
  });
});

describe("reader (B0): *no K* and a range on a counted noun", () => {
  it("universals-domains.md:46: `zul` + kind is a binder over the list, its denial inside, its kind shared", () => {
    const reading = one("[z-no | g-cat] | v-sit");
    assert.deepEqual(families(reading), ["binder"]);
    const binder = frame(reading, "binder");
    assert.equal(binder.key, "joinSeries:u:kind");
    assert.deepEqual(binder.inner?.map((f) => `${f.family} ${f.key}`), ["polarity joinSeries:u"]);
    const z = asList(reading.claim.roles.z);
    assert.equal(binder.hosted, z);
    assert.deepEqual(z.members, []);
    assert.equal(z.frames, undefined, "the denial rides in the binder, not on the list");
    assert.deepEqual(z.shared.map((r) => r.role), ["kind"]);
    assert.deepEqual(z.sharedDetails?.map((d) => d.values.role), ["kind"]);
    assert.deepEqual(reading.links.map((l) => l.key), ["shared:kind"]);
    assert.equal(reading.unread.length, 0);
  });

  it("universals-domains.md:54: with no verb, `zul godozel` is the same binder; `zodozel zul` stays a list denial", () => {
    assert.equal(frame(one("[z-no | g-dog]"), "binder").key, "joinSeries:u:kind");
    const not = one("[z-dog | z-not] | v-walk");
    assert.deepEqual(families(not), []);
    assert.deepEqual(asList(not.claim.roles.z).frames?.map((f) => f.family), ["polarity"]);
  });

  it("ranges.md:136: a range on a counted noun sits on its number detail, both ends there, no predicate", () => {
    const reading = one("[z-dog | g-three] | through | g-five | v-walk");
    assert.deepEqual(reading.claim.predicate, []);
    assert.equal(reading.claim.details.length, 0);
    const z = reading.claim.roles.z;
    assert.ok(z?.kind === "thing");
    const number = z.details.find((d) => d.key === "lexReading:number")!;
    assert.equal(number.words[0]!.raw, "gragel");
    const range = number.details?.find((d) => d.kind === "range");
    assert.equal(range?.key, "hookJob:span");
    assert.equal(range?.words[0]!.raw, "oel");
    assert.ok(range?.hosted?.kind === "number" && range.hosted.word.raw === "grazal");
  });

  it("open-ranges.md:9: a ray on a counted noun reads the same way", () => {
    const reading = one("z-Alazun | [d-dog | g-plus-infinity] | through-excluding | g-three | v-see");
    assert.deepEqual(reading.claim.predicate, []);
    const d = reading.claim.roles.d;
    assert.ok(d?.kind === "thing");
    const range = d.details.find((x) => x.key === "lexReading:number")?.details?.[0];
    assert.equal(range?.words[0]!.raw, "uel");
    assert.ok(range?.hosted?.kind === "number" && range.hosted.word.raw === "gragel");
  });
});

describe("reader: links that point back past a period", () => {
  const linkOf = (reading: Reading, kind: string) => reading.links.find((l) => l.kind === kind);

  it("stand-in-vowels.md#stand-in-back: `-rth` stands for the most recent content of its vowel's kind", () => {
    // `durth`: the last *not* / *lest* content is the `durl` dependent, not the sentence before.
    const [first, second] = readText("zazozon vezuyol balazun durl vehohel. zalazun valom durth.", tables);
    assert.equal(linkOf(second!, "standInBack")?.to, first!.links.find((l) => l.kind === "standIn")?.to);
    assert.equal(linkOf(second!, "standInBack")?.to, `${first!.id}/d`);
    // `darth`: the last statement, the sentence itself (it ends after its dependents).
    const [said, so] = readText("zalazun vehohel. zazozon vezuyol darth.", tables);
    assert.equal(linkOf(so!, "standInBack")?.to, said!.id);
    // A question is not a statement: `darth` skips it to the statement before; `derth` takes it.
    const [statement, question, back] = readText("zalazun vehohel. yel zazozon vowurol. zazozon vezuyol darth.", tables);
    assert.notEqual(linkOf(back!, "standInBack")?.to, question!.id);
    assert.equal(linkOf(back!, "standInBack")?.to, statement!.id);
    const [asked, that] = readText("yel zalazun vehohel. zazozon vezuyol derth.", tables);
    assert.equal(linkOf(that!, "standInBack")?.to, asked!.id);
    // No content of that kind: no `to`.
    const [, none] = readText("yel zalazun vehohel. zazozon vezuyol darth.", tables);
    assert.equal(linkOf(none!, "standInBack")?.to, undefined);
  });

  it("in-clause-hooks.md#hook-resume: a point-back hook takes the landmark already in play", () => {
    const [first, second] = readText("zazozon vehohel el bohahal. zalazun vehohel er.", tables);
    const resume = linkOf(second!, "hookResume");
    assert.equal(resume?.to, first!.id);
    assert.equal(resume?.resumed?.key, "hookJob:extraNoun");
    assert.equal(resume?.resumed?.hosted?.kind === "thing" ? resume.resumed.hosted.head.raw : undefined, "bohahal");
    // Stacked vowels keep the extra they named: `aor` takes the `aol` landmark, not the later `ael` one.
    const [, writes] = readText("zazozon danal aol babewol ael behohel varuyol. zalazun varuyol aor.", tables);
    const means = linkOf(writes!, "hookResume")?.resumed?.hosted;
    assert.equal(means?.kind === "thing" ? means.head.raw : undefined, "babewol");
    // No earlier landmark: no `to`.
    assert.equal(linkOf(readText("zalazun vehohel er.", tables)[0]!, "hookResume")?.to, undefined);
  });

  it("hooks.md#discourse-hooks: `el` / `em` / `ul` / `um` on the left edge point to the claim before", () => {
    for (const hook of ["el", "em", "ul", "um"]) {
      const [first, second] = readText(`zalazun veruvol. ${hook} zalazun vezuvel.`, tables);
      assert.equal(linkOf(second!, "discourse")?.to, first!.id, hook);
    }
    const [, plain] = readText("zalazun veruvol. al zalazun vezuvel.", tables);
    assert.equal(linkOf(plain!, "discourse")?.to, undefined);
  });
});
