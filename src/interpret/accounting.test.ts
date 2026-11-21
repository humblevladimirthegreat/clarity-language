/**
 * The accounting guard (docs/meta/solver.md): every frame, link, SHARED detail and blank of a reading in the program
 * was used by a row; a reading with anything unused is in `left` with reason `unused`. The sweep runs every grammar
 * example the reading pass in `src/find/` reads through `translate()`, so the next silent drop fails here.
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { loadDefaultTables } from "../parse/index.js";
import { walkAccounting } from "./accounting-walk.js";
import { buildLog } from "./log.js";
import { translate } from "./translate.js";

const tables = loadDefaultTables();
const logOf = (texts: string[]) => buildLog(texts.map((text, at) => ({ speaker: "a", at, text })), tables);
const program = (...texts: string[]) => translate(logOf(texts), { lexicon: tables });

describe("accounting guard: grammar examples", () => {
  it("translate() never throws, and every reading in the program used all its parts; the rest are left as unused", () => {
    const walk = walkAccounting(tables);
    assert.deepEqual(walk.unnamed, [], "unused names its parts");
    assert.ok(walk.kept > 1000, `the sweep reads the grammar examples (kept ${walk.kept})`);
    assert.deepEqual(walk.silent.slice(0, 20), [], `${walk.silent.length} silent drop(s)`);
  });
});

describe("accounting guard: the drops it catches", () => {
  const left = (...texts: string[]) => program(...texts).left.map((l) => `${l.reason} ${l.key ?? l.construction}`);

  it("R4a-11: a say word over an and list uses the list (each member for allow, the whole term for a ban)", () => {
    assert.deepEqual(left("zazozon zalazun zal vowurol hwuval."), []);
    assert.deepEqual(left("zazozon zalazun zal vowurol hwuvul."), []);
  });

  it("R4c-1, R4c-2: a tie and a superlative use their SHARED word; a denied tie, an open tie with a factor and a place from the bottom stay left; D22, a place uses it", () => {
    assert.deepEqual(left("zazozon zalazun zoel gamahum."), []);
    assert.deepEqual(left("zahelan zol guzemel."), []);
    assert.deepEqual(left("zazozon zalazun zoel gamahum thul."), ["unused shared:equative"]);
    assert.deepEqual(left("zazozon zalazun zoem gelazem hradol."), ["unused shared:equative"]);
    assert.deepEqual(left("zahelan zol wrogel gelazem."), []);
    assert.deepEqual(left("zahelan zuol wrodol gelazem."), ["noRow joinSeries:uo"]);
  });

  it("R4b-16, R4b-17: a resume pronoun under a universal hinge is the member; a denied one stays left (R4e decision 2)", () => {
    assert.deepEqual(left("zual geyel gwozeduyol thehom blarl zeyer veduyol."), []);
    assert.deepEqual(left("zual gogozel vezuvel thohem thul blarl zogozer guzemel."), ["noRow overlay:clause_hinge:th"]);
  });

  it("a person as a /ɡ/ hinge's outcome is left (R4e-7, D15)", () => {
    assert.deepEqual(left("zazozon gohem blerulal."), ["noRow overlay:clause_hinge:g"]);
    // R4b-8 (D15): a person's name as the outcome of `gahum` or the `gebem gahum` stack stays left too.
    assert.deepEqual(left("zazozon gahum blerulal."), ["noRow overlay:clause_hinge:g"]);
    assert.deepEqual(left("zazozon gebem gahum blerulal."), ["noRow overlay:clause_hinge:g"]);
  });

  it("a range end with no value does not order (open-ranges.md), and translate() does not throw", () => {
    assert.doesNotThrow(() => program("zazozon dugavalx grodol oel growal vayebel."));
  });

  it("R4c-5: a hosting /ɡ/ word and a hook after a noun join, and a verb join's /h/ or /d/, use their SHARED parts", () => {
    assert.deepEqual(left("zalazun degodel dededel dal gegunum blahelan vozedal."), []);
    assert.deepEqual(left("zodozel zogozel zal om bahelan vowurol."), []);
    assert.deepEqual(left("zazozon vowurol veruvol val hahunom."), []);
    assert.deepEqual(left("zazozon vozedal vayebel val dobodel."), []);
  });

  it("R4c-8: a carried channel is used on a bare sentence", () => {
    assert.deepEqual(left("zalazun thebam throgel vudurul.", "zalazun vudurul vul."), []);
  });

  it("R4d-1: lk6, a linker on a question keeps the question's act, so both readings stay left only for edge:force; R4d-2: a verdict on a fill question stays unused", () => {
    assert.deepEqual(left("yel zawan vowurol. xahom zawan veruvol."), ["noRow edge:force", "noRow edge:force"]);
    assert.deepEqual(left("yel zar vowurol.", "yaol."), ["noRow edge:force", "unused edge:polar"]);
  });
  it("a plain and list, a hinge, and a resumed pronoun are kept", () => {
    assert.deepEqual(left("zazozon zalazun zal vowurol."), []);
    assert.deepEqual(left("zual gogozel vowurol."), []);
    assert.deepEqual(left("zazozon vowurol.", "zazozorx vehohel."), []);
  });

  it("a fill question's blank is unused (the solver strips the force frame, as here)", () => {
    const readings = logOf(["yel zar vowurol."]).readings.map((r) => ({ ...r, frames: r.frames.filter((f) => f.key !== "edge:force") }));
    const t = translate({ readings }, { lexicon: tables });
    assert.deepEqual(
      t.left.map((l) => [l.reason, l.key]),
      [["unused", "blank"]],
    );
  });
});
