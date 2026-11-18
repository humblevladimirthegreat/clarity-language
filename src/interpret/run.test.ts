import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";

import { CLOSED } from "../closed-roots.js";
import { fullGlossIndex } from "../game/build.js";
import { createClassifyTables } from "../parse/classify.js";
import { glossToAgeben } from "../parse/gloss-inverse.js";
import { PASS_THROUGH, type Effect, type Held, type Host, type Referent } from "./host.js";
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
const spell = (gloss: string): string => glossToAgeben(gloss, tables, index) + ".";

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
    assert.equal(r!.replies[1]!.ageben, spell(PAID));
  });

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

  it("the pass-through list cites a grammar section on every row and holds none of these families", () => {
    for (const row of PASS_THROUGH) assert.ok(row.anchors.length > 0 && row.anchors.every((a) => /^[a-z-]+\.md#[a-z-]+$/.test(a)), row.family);
    for (const [family] of FRAMED) assert.ok(!PASS_THROUGH.some((row) => row.family === family), family);
  });
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
