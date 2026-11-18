import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";

import { CLOSED } from "../closed-roots.js";
import { fullGlossIndex } from "../game/build.js";
import { createClassifyTables } from "../parse/classify.js";
import { glossToAgeben } from "../parse/gloss-inverse.js";
import { blankSites, PASS_THROUGH, type Effect, type Held, type Host, type Referent } from "./host.js";
import { throughAntecedent } from "./match.js";
import { createSession, run, type TurnResult } from "./run.js";
import type { Term } from "./types.js";

const rootDir = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const tables = createClassifyTables(
  readFileSync(join(rootDir, "data", "lexicon-published.csv"), "utf8"),
  readFileSync(join(rootDir, "data", "lexicon-overlays.csv"), "utf8"),
  readFileSync(join(rootDir, "data", "lexicon-compounds.csv"), "utf8"),
);
const index = fullGlossIndex(tables);
const spell = (gloss: string): string => glossToAgeben(gloss, tables, index);

// The toy host's world: three people from the house cast. Ana is Azozon, Sam is Alazun, Lee is Ahelan.
const ANA = CLOSED.swan;
const SAM = CLOSED.lion;
const LEE = CLOSED.hibiscus;
const PEOPLE = new Set([ANA, SAM, LEE]);

type Toy = { host: Host; calls: { root: string; prohibition: boolean; roles: Record<string, string> }[]; told: string[] };

/** A toy host: names refer to the three people; every verb has a handler that records its call. */
function toy(overrides: Partial<Host> = {}): Toy {
  const calls: Toy["calls"] = [];
  const told: string[] = [];
  const refer = (term: Term): Referent<string> => {
    const t = throughAntecedent(term);
    return t.kind === "thing" && PEOPLE.has(t.root) ? { kind: "one", entity: t.root } : { kind: "none" };
  };
  const host: Host = {
    refer,
    handler: (root) => (action) => {
      calls.push({ root, prohibition: action.prohibition, roles: { ...action.roles } as Record<string, string> });
      return { ok: true, effects: [{ kind: "did", data: root }] };
    },
    told: (reading): Effect[] => {
      told.push(reading.id);
      return [{ kind: "noted" }];
    },
    ...overrides,
  };
  return { host, calls, told };
}

const PAID = "z-Alazun | b-Azozon | v-pay"; // Sam paid Ana.

const say = (t: Toy, ...glosses: string[]): TurnResult[] => {
  const session = createSession(t.host, tables);
  return glosses.map((g) => run(spell(g), session));
};
const shapes = (r: TurnResult): string[] => r.replies.map((x) => x.shape);

describe("run: statements", () => {
  it("a statement is logged, then told", () => {
    const t = toy();
    const session = createSession(t.host, tables);
    const r = run(spell(PAID), session);
    assert.equal(r.outcome, "ok");
    assert.equal(session.log.entries.length, 1);
    assert.deepEqual(t.told, [session.log.readings[0]!.id]);
    assert.deepEqual(r.effects.map((e) => e.kind), ["noted"]);
  });

  it("told can refuse a statement: the turn is refused with its reason and leaves the log as it was", () => {
    const told: string[] = [];
    const t = toy({ told: (reading) => (told.push(reading.id), reading.claim.roles.z ? { ok: false, reason: "cannot be found" } : []) });
    const session = createSession(t.host, tables);
    const r = run(spell(PAID), session);
    assert.equal(r.outcome, "refused");
    assert.equal(r.readings[0]!.refused, "cannot be found");
    assert.equal(told.length, 1);
    assert.equal(session.log.entries.length, 0);
    assert.equal(session.at, 0);
    const ok = run(spell("v-pay | b-Azozon"), session);
    assert.equal(ok.outcome, "ok");
    assert.equal(session.log.entries.length, 1);
  });

  for (const window of [undefined, 1]) {
    it(`a call-only turn is its own entry; another speaker's statement after it carries no call frame (window ${window ?? "all"})`, () => {
      const t = toy({ ...(window ? { window } : {}) });
      const session = createSession(t.host, tables);
      const call = run(spell("y-Ahelan"), session);
      assert.equal(call.outcome, "ok");
      session.speaker = "other";
      const told = run(spell(PAID), session);
      assert.equal(told.outcome, "ok", told.error ?? "");
      session.speaker = "user";
      const asked = run(spell("y-question | z-Alazun | b-Azozon | v-pay"), session);
      assert.equal(asked.outcome, "ok", asked.error ?? "");
      // A call closed by a period reaches its own turn only (sentence-linkers.md#past-a-period).
      assert.ok(!session.log.entries[1]!.readings[0]!.frames.some((f) => f.family === "call"));
      const [match] = asked.readings[0]!.matches!;
      assert.ok(!match!.path.frames.some((f) => f.frame.family === "call"));
      assert.deepEqual(shapes(asked), ["yes", "why"]);
      const done = run(spell("y-command | b-Azozon | v-pay"), session);
      assert.equal(done.outcome, "ok", done.error ?? "");
      assert.equal(t.calls.length, 1);
      const { entries } = session.log;
      assert.deepEqual(entries.map((e) => e.speaker), ["user", "other"]);
      assert.deepEqual(entries.map((e) => e.readings.length), [1, 1]);
      assert.ok(entries[0]!.readings[0]!.frames.some((f) => f.family === "call"));
      assert.ok(entries[1]!.readings[0]!.claim.roles.z);
      assert.deepEqual(t.told.length, 2);
    });
  }

  it("a call-only turn, then a statement in the same text: the statement has no call frame; a call before a body in one sentence keeps it", () => {
    const split = run(`${spell("y-Ahelan")}. ${spell(PAID)}.`, createSession(toy().host, tables));
    assert.equal(split.outcome, "ok", split.error ?? "");
    const [lone, statement] = split.readings.map((r) => r.reading);
    assert.ok(lone!.frames.some((f) => f.family === "call"));
    assert.ok(statement!.claim.roles.z);
    assert.ok(!statement!.frames.some((f) => f.family === "call"));
    const joined = say(toy(), `y-Ahelan | ${PAID}`)[0]!;
    assert.equal(joined.readings.length, 1);
    assert.ok(joined.readings[0]!.reading.frames.some((f) => f.family === "call"));
  });

  it("yes or an interjection closed by a period is its own move: the bare body after it has no polar link or interjection frame (sentence-linkers.md#past-a-period)", () => {
    for (const word of ["y-yes", "y-sleepy"]) {
      const split = run(`${spell(word)}. ${spell(PAID)}.`, createSession(toy().host, tables));
      assert.equal(split.outcome, "ok", split.error ?? "");
      assert.equal(split.readings.length, 2, word);
      const [lone, statement] = split.readings.map((r) => r.reading);
      assert.ok(lone!.links.some((l) => l.kind === "polar") || lone!.frames.some((f) => f.family === "attitude"), word);
      assert.ok(statement!.claim.roles.z, word);
      assert.deepEqual(statement!.links.filter((l) => l.kind === "polar"), [], word);
      assert.ok(!statement!.frames.some((f) => f.family === "attitude"), word);
      const joined = say(toy(), `${word} | ${PAID}`)[0]!;
      assert.equal(joined.readings.length, 1, word);
      const one = joined.readings[0]!.reading;
      assert.ok(one.links.some((l) => l.kind === "polar") || one.frames.some((f) => f.family === "attitude"), word);
    }
  });

  it("yes / no are statements: logged, then told (sentence-linkers.md#past-a-period)", () => {
    for (const gloss of ["y-yes", "y-no-soft"]) {
      const t = toy();
      const session = createSession(t.host, tables);
      const r = run(spell(gloss), session);
      assert.equal(r.outcome, "ok", r.error ?? "");
      assert.deepEqual(r.readings.map((x) => x.force), ["statement"]);
      assert.equal(session.log.entries.length, 1);
      assert.equal(t.told.length, 1);
    }
  });

  it("a greeting or an interjection alone makes no claim: logged as said and told; no handler runs, no question is asked", () => {
    for (const gloss of ["Azozon", "y-sleepy"]) {
      const t = toy();
      const session = createSession(t.host, tables);
      const r = run(spell(gloss), session);
      assert.equal(r.outcome, "ok", r.error ?? "");
      assert.deepEqual(r.readings.map((x) => x.force), ["said"]);
      assert.deepEqual(r.replies, []);
      assert.equal(session.log.entries.length, 1);
      assert.equal(t.told.length, 1);
      assert.equal(t.calls.length, 0);
    }
  });

  it("the re-parse window is the host's (decision 5)", () => {
    assert.equal(createSession({ window: 2 }, tables).log.options.window, 2);
    assert.equal(createSession({}, tables).log.options.window, undefined);
  });
});

describe("run: questions and shared replies", () => {
  it("yes, with why naming the reading that decided", () => {
    const [told, r] = say(toy(), PAID, "y-question | z-Alazun | b-Azozon | v-pay");
    assert.equal(r!.outcome, "ok");
    assert.deepEqual(shapes(r!), ["yes", "why"]);
    assert.equal(r!.replies[0]!.gloss, "y-yes");
    assert.deepEqual(r!.replies[1]!.because, told!.readings.map((x) => x.reading.id));
  });

  it("cannot say, when nothing logged or held decides", () => {
    const [, r] = say(toy(), PAID, "y-question | z-Azozon | b-Alazun | v-pay");
    assert.deepEqual(shapes(r!), ["cannotSay"]);
    assert.ok(r!.replies[0]!.ageben);
  });

  it("yes, from a statement said after a call: a call does not change what it claims (speech-moves.md#vocative)", () => {
    const [, told, r] = say(toy(), "y-Ahelan", PAID, "y-question | z-Alazun | b-Azozon | v-pay");
    assert.equal(r!.outcome, "ok");
    assert.deepEqual(shapes(r!), ["yes", "why"]);
    assert.deepEqual(r!.replies[1]!.because, told!.readings.map((x) => x.reading.id));
  });

  it("yes, from a statement with a first-mention landmark: the claim holds of one such thing (joins.md#new-member-in-a-statement)", () => {
    const [told, r] = say(toy(), "z-Alazun | v-go | [in | b-house]", "y-question | z-Alazun | v-go");
    assert.equal(r!.outcome, "ok");
    assert.deepEqual(shapes(r!), ["yes", "why"]);
    assert.deepEqual(r!.replies[1]!.because, told!.readings.map((x) => x.reading.id));
  });

  it("cannot say, from a statement with a speaker attitude and a first-mention noun: no grammar page settles that pair yet", () => {
    const [, r] = say(toy(), "z-Alazun | th-revelation | d-cat | v-see", "y-question | z-Alazun | v-see");
    assert.equal(r!.outcome, "ok");
    const [match] = r!.readings[0]!.matches!;
    const families = match!.path.frames.map((f) => `${f.frame.family}:${f.frame.key}`);
    assert.ok(families.includes("attitude:slot:th") && families.includes("binder:slot:newMember"), families.join(", "));
    assert.deepEqual(shapes(r!), ["cannotSay"]);
  });

  it("turns handed in without a period are closed by the log: a statement, then a command", () => {
    const t = toy();
    const session = createSession(t.host, tables);
    const told = run(spell(PAID), session);
    assert.equal(told.outcome, "ok", told.error ?? "");
    const done = run(spell("y-command | b-Azozon | v-pay"), session);
    assert.equal(done.outcome, "ok", done.error ?? "");
    assert.equal(t.calls.length, 1);
    assert.equal(session.log.entries.length, 1);
    assert.equal(session.log.rejected.length, 0);
  });

  it("no, from held state that does not hold", () => {
    const holds = (): Held[] => [{ holds: false, source: "ledger" }];
    const [r] = say(toy({ holds }), "y-question | z-Azozon | b-Alazun | v-pay");
    assert.deepEqual(shapes(r!), ["no", "why"]);
    assert.deepEqual(r!.replies[1]!.because, ["ledger"]);
  });

  it("a fill answer, as a fragment and as a full clause", () => {
    const [, r] = say(toy(), PAID, "y-question | z-wh | b-Azozon | v-pay");
    assert.deepEqual(shapes(r!), ["fillFragment", "fillClause", "why"]);
    assert.equal(r!.replies[0]!.gloss, "z-Alazun");
    assert.equal(r!.replies[1]!.gloss, "z-Alazun | b-Azozon | v-pay");
    assert.equal(r!.replies[1]!.ageben, `${spell(PAID)}.`);
  });

  it("a where blank in a detail, answered from held state keyed by its at", () => {
    const WHERE = "y-question | [at | b-wh] | z-Azozon | v-sit";
    const holds: Host["holds"] = (claim) => {
      const where = blankSites(claim).find((b) => b.detail);
      return where ? [{ holds: true, source: "map", answers: { [where.at]: { leaf: "[at | b-house]", english: "at the house" } } }] : [];
    };
    const [r] = say(toy({ holds }), WHERE);
    assert.equal(r!.outcome, "ok");
    assert.deepEqual(blankSites(r!.readings[0]!.reading.claim).map((b) => b.at), ["claim/detail.0/hosted"]);
    assert.deepEqual(shapes(r!), ["fillFragment", "fillClause", "why"]);
    assert.equal(r!.replies[0]!.gloss, "[at | b-house]");
    assert.ok(r!.replies[0]!.ageben);
    assert.equal(r!.replies[1]!.gloss, "[at | b-house] | z-Azozon | v-sit");
    assert.deepEqual(r!.replies[2]!.because, ["map"]);
  });

  const WHERE = "y-question | [at | b-wh] | z-Azozon | v-sit";
  const placeReplies = (r: TurnResult, landmark = "b-house"): void => {
    assert.equal(r.outcome, "ok");
    assert.deepEqual(shapes(r).slice(0, 2), ["fillFragment", "fillClause"]);
    assert.equal(r.replies[0]!.gloss, `[at | ${landmark}]`);
    assert.equal(r.replies[1]!.gloss, `[at | ${landmark}] | z-Azozon | v-sit`);
    assert.equal(r.replies[0]!.ageben, `${spell(`[at | ${landmark}]`)}.`);
    assert.equal(r.replies[1]!.ageben, `${spell(`[at | ${landmark}] | z-Azozon | v-sit`)}.`);
  };

  it("a where blank answered from the log (a named landmark): the question's hook and the landmark, as a fragment and a full clause", () => {
    const [, r] = say(toy(), "z-Azozon | v-sit | [at | b-Ahelan]", WHERE);
    placeReplies(r!, "b-Ahelan");
  });

  it("a where blank answered from held state that names the landmark alone", () => {
    const holds: Host["holds"] = (claim) => {
      const where = blankSites(claim).find((b) => b.detail);
      return where ? [{ holds: true, source: "map", answers: { [where.at]: { leaf: "b-house", english: "the house" } } }] : [];
    };
    const [r] = say(toy({ holds }), WHERE);
    placeReplies(r!);
  });

  for (const [what, question, at, leaf] of [
    ["a what-kind blank (gar)", "y-question | z-Azozon | g-wh", "predicate.0", "g-lion"],
    ["a verb blank (var)", "y-question | z-Azozon | v-wh", "verb", "v-sit"],
  ] as const) {
    it(`${what}: blankSites keys it by the matcher's at, and a held answer reaches a fill reply`, () => {
      const holds: Host["holds"] = (claim) => {
        const site = blankSites(claim).find((b) => b.at === at);
        return site ? [{ holds: true, source: "map", answers: { [site.at]: { leaf, english: leaf } } }] : [];
      };
      const [r] = say(toy({ holds }), question);
      assert.equal(r!.outcome, "ok", r!.error ?? "");
      assert.deepEqual(blankSites(r!.readings[0]!.reading.claim).map((b) => b.at), [at]);
      assert.equal(r!.replies[0]!.shape, "fillFragment");
      assert.equal(r!.replies[0]!.gloss, leaf);
      assert.deepEqual(r!.replies.at(-1)!.because, ["map"]);
    });
  }

  it("the host's verdict can refuse", () => {
    const [r] = say(toy({ verdict: () => ({ kind: "refused", reason: "private" }) }), "y-question | z-wh | b-Azozon | v-pay");
    assert.equal(r!.outcome, "refused");
    assert.equal(r!.readings[0]!.refused, "private");
  });
});

describe("run: commands", () => {
  it("a command resolves its roles and runs the handler", () => {
    const t = toy();
    const [r] = say(t, "y-command | b-Azozon | v-pay");
    assert.equal(r!.outcome, "ok");
    assert.deepEqual(t.calls.map((c) => [c.prohibition, c.roles]), [[false, { b: ANA }]]);
    assert.deepEqual(r!.effects.map((e) => e.kind), ["did"]);
  });

  it("a prohibition reaches the handler as one", () => {
    const t = toy();
    const [r] = say(t, "y-prohibition | b-Azozon | v-pay");
    assert.equal(r!.outcome, "ok");
    assert.deepEqual(t.calls.map((c) => c.prohibition), [true]);
  });

  it("pass-through frames: a call, a doubled act word, a speaker attitude", () => {
    for (const gloss of ["y-Azozon | y-command | y-command | b-Azozon | v-pay", "y-command | th-revelation | b-Azozon | v-pay"]) {
      const t = toy();
      const [r] = say(t, gloss);
      assert.equal(r!.outcome, "ok", gloss);
      assert.equal(t.calls.length, 1, gloss);
    }
  });

  it("refused: the handler says no, or a role refers to nothing", () => {
    const no = toy({ handler: () => () => ({ ok: false, reason: "busy" }) });
    assert.equal(say(no, "y-command | b-Azozon | v-pay")[0]!.outcome, "refused");
    const t = toy({ refer: () => ({ kind: "none" }) });
    const [r] = say(t, "y-command | b-Azozon | v-pay");
    assert.equal(r!.outcome, "refused");
    assert.equal(t.calls.length, 0);
  });

  it("which one?, when a role refers to several", () => {
    const t = toy({ refer: () => ({ kind: "several", entities: [ANA, LEE] }) });
    const [r] = say(t, "y-command | b-Azozon | v-pay");
    assert.equal(r!.outcome, "refused");
    assert.deepEqual(shapes(r!), ["whichOne"]);
    assert.equal(r!.replies[0]!.gloss, "y-question | b-wh");
    assert.equal(t.calls.length, 0);
  });
});

describe("run: a framed command fails closed", () => {
  const FRAMED: [string, string][] = [
    ["hinge", "y-command | v-sit | [th-if | bl-that-clause] | z-Abodun | v-departure"],
    ["binder", "y-command | [z-everything | g-cat] | v-sleep"],
    ["holder", "y-command | z-Alazun | v-walk | th-REPORTED-Azozon"],
  ];
  for (const [family, gloss] of FRAMED) {
    it(`under a ${family}: beyond, names the frame, calls no handler, even when the host accepts everything`, () => {
      const t = toy({ accepts: () => [] });
      const session = createSession(t.host, tables);
      const r = run(spell(gloss), session);
      assert.equal(r.outcome, "beyond");
      assert.ok(
        r.beyond.some((p) => p.kind === "frame" && p.frame?.family === family),
        r.beyond.map((p) => p.name).join(", "),
      );
      assert.equal(t.calls.length, 0);
      assert.equal(session.log.entries.length, 0);
    });
  }

  it("a sake or feeling word on the clause is your remark: the command runs and calls its handler; under a condition it is still beyond (for-a-sake.md#whose-stake, how-you-feel.md#feeling-word)", () => {
    for (const gloss of ["y-command | v-walk | th-physical-met-any-term", "y-command | v-walk | [th-relatedness-motive-any-term | bl-Alazun]"]) {
      const t = toy();
      const r = run(spell(gloss), createSession(t.host, tables));
      assert.equal(r.outcome, "ok", r.beyond.map((p) => p.name).join(", "));
      assert.ok(r.readings[0]!.reading.frames.some((f) => f.family === "sake"));
      assert.equal(t.calls.length, 1);
    }
    const feeling = toy();
    const f = run(spell("y-command | v-walk | th-relatedness-met-any-term-STAYING-OPEN"), createSession(feeling.host, tables));
    assert.equal(f.outcome, "ok", "a feeling word says how you feel (how-you-feel.md#feeling-word)");
    assert.equal(feeling.calls.length, 1);
    const t = toy({ accepts: () => [] });
    const r = run(spell("y-command | v-sit | th-physical-met-any-term | [th-if | bl-that-clause] | z-Abodun | v-departure"), createSession(t.host, tables));
    assert.equal(r.outcome, "beyond");
    assert.ok(r.beyond.some((p) => p.kind === "frame" && p.frame?.family === "hinge"));
    assert.ok(!r.beyond.some((p) => p.kind === "frame" && p.frame?.family === "sake"));
    assert.equal(t.calls.length, 0);
  });

  it("the pass-through list cites a grammar section on every row and holds none of these families", () => {
    for (const row of PASS_THROUGH) assert.ok(row.anchors.length > 0 && row.anchors.every((a) => /^[a-z-]+\.md#[a-z-]+$/.test(a)), row.family);
    for (const [family] of FRAMED) assert.ok(!PASS_THROUGH.some((row) => row.family === family && !row.key && !row.when), family);
  });
});

describe("run: a first-mention noun on a command (joins.md#new-member-in-a-command)", () => {
  const OPEN_A_DOOR = "y-command | v-open | d-door";
  const oneDoor = (): Referent<string> => ({ kind: "one", entity: "door-1" });

  it("a lone first-mention noun passes through; refer picks it and the handler runs", () => {
    const t = toy({ refer: oneDoor });
    const [r] = say(t, OPEN_A_DOOR);
    assert.equal(r!.outcome, "ok", r!.beyond.map((p) => p.name).join(", "));
    assert.deepEqual(t.calls.map((c) => c.roles), [{ d: "door-1" }]);
  });

  it("which one?, when the noun has two candidate referents", () => {
    const t = toy({ refer: () => ({ kind: "several", entities: ["door-1", "door-2"] }) });
    const [r] = say(t, OPEN_A_DOOR);
    assert.equal(r!.outcome, "refused");
    assert.deepEqual(shapes(r!), ["whichOne"]);
    assert.equal(t.calls.length, 0);
  });

  const STILL_BEYOND: [string, string][] = [
    ["a universal", "y-command | v-open | [d-everything | g-door]"],
    ["an -r join", "y-command | v-open | d-something"],
    ["a numbered noun", "y-command | v-open | [d-door-x | g-three]"],
    ["an and-list", "y-command | v-open | [d-door | d-box | d-and]"],
    ["two first-mention nouns", "y-command | b-cat | v-pay | d-box"],
  ];
  for (const [what, gloss] of STILL_BEYOND) {
    it(`${what} stays beyond, names the binder, calls no handler`, () => {
      const t = toy({ refer: oneDoor, accepts: () => [] });
      const [r] = say(t, gloss);
      assert.equal(r!.outcome, "beyond");
      assert.ok(
        r!.beyond.some((p) => p.kind === "frame" && p.frame?.family === "binder"),
        r!.beyond.map((p) => p.name).join(", "),
      );
      assert.equal(t.calls.length, 0);
    });
  }
});

describe("run: the other outcomes", () => {
  it("parse: a turn that does not parse", () => {
    const r = run("zalazun yol vehohel.", createSession(toy().host, tables));
    assert.equal(r.outcome, "parse");
    assert.ok(r.error);
  });

  it("beyond: the host does not accept a part; the log is unchanged", () => {
    const session = createSession(toy({ accepts: () => ["payment"] }).host, tables);
    const r = run(spell(PAID), session);
    assert.equal(r.outcome, "beyond");
    assert.deepEqual(r.beyond.map((p) => [p.kind, p.name]), [["accepts", "payment"]]);
    assert.equal(session.log.entries.length, 0);
  });

  it("beyond: no handler for the verb", () => {
    const r = say(toy({ handler: () => undefined }), "y-command | b-Azozon | v-pay")[0]!;
    assert.equal(r.outcome, "beyond");
    assert.deepEqual(r.beyond.map((p) => p.kind), ["handler"]);
  });
});
