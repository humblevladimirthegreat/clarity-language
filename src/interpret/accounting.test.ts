/**
 * The accounting guard (docs/meta/solver.md): every frame, link, SHARED detail and blank of a reading in the program
 * was used by a row; a reading with anything unused is in `left` with reason `unused`. The sweep runs every grammar
 * example the reading pass in `src/find/` reads through `translate()`, so the next silent drop fails here.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

import { passFiles } from "../find/pass.js";
import { collectFileSpans } from "../find/walk.js";
import { loadDefaultTables } from "../parse/index.js";
import { buildLog } from "./log.js";
import { translate } from "./translate.js";
import type { Frame, Reading, Term } from "./types.js";

const tables = loadDefaultTables();
const logOf = (texts: string[]) => buildLog(texts.map((text, at) => ({ speaker: "a", at, text })), tables);
const program = (...texts: string[]) => translate(logOf(texts), { lexicon: tables });

/** The parts of a reading, walked here apart from the translator's own inventory: frames (and their inner frames), links, SHARED details, blanks. */
function walked(reading: Reading): object[] {
  const out: object[] = [];
  const frame = (f: Frame): void => {
    out.push(f);
    f.inner?.forEach(frame);
  };
  reading.frames.forEach(frame);
  reading.stanceLists?.forEach((l) => l.inner?.forEach(frame));
  out.push(...reading.links);
  const term = (t: Term | undefined): void => {
    if (t?.kind === "list") {
      out.push(...(t.sharedDetails ?? []));
      t.members.forEach(term);
    }
    if (t?.kind === "blank") out.push(t);
  };
  [reading.claim.verb, reading.claim.roles.z, reading.claim.roles.d, reading.claim.roles.b, ...reading.claim.predicate].forEach(term);
  return out;
}

describe("accounting guard: grammar examples", () => {
  it("every reading in the program used all its parts; the rest are left as unused", () => {
    const silent: string[] = [];
    let kept = 0;
    for (const file of passFiles(["docs/grammar"])) {
      for (const example of collectFileSpans(file, readFileSync(file, "utf8"), tables).examples) {
        if (!example.readings.length) continue;
        let t: ReturnType<typeof translate>;
        try {
          t = translate({ readings: example.readings }, { lexicon: tables });
        } catch {
          continue; // A translator crash is not the guard's to report.
        }
        for (const id of t.readings) {
          kept++;
          const reading = example.readings.find((r) => r.id === id);
          const account = t.accounting.get(id);
          if (!reading || !account) {
            silent.push(`${file}: ${example.text}: ${id} has no accounting`);
            continue;
          }
          const inventory = new Set(account.parts.map((p) => p.of));
          const missed = walked(reading).filter((p) => !inventory.has(p));
          const unused = account.parts.filter((p) => !account.used.has(p.of)).map((p) => p.text);
          if (missed.length) silent.push(`${file}: ${example.text}: ${id} has ${missed.length} part(s) the inventory misses`);
          if (unused.length) silent.push(`${file}: ${example.text}: ${id} kept with ${unused.join(", ")}`);
        }
        for (const l of t.left) if (l.reason === "unused") assert.ok(l.unused?.length, `${file}: ${example.text}: unused names its parts`);
      }
    }
    assert.ok(kept > 1000, `the sweep reads the grammar examples (kept ${kept})`);
    assert.deepEqual(silent.slice(0, 20), [], `${silent.length} silent drop(s)`);
  });
});

describe("accounting guard: the drops it catches", () => {
  const left = (...texts: string[]) => program(...texts).left.map((l) => `${l.reason} ${l.key ?? l.construction}`);

  it("R4a-11: a say word over an and list uses the list (each member for allow, the whole term for a ban)", () => {
    assert.deepEqual(left("zazozon zalazun zal vowurol hwuval."), []);
    assert.deepEqual(left("zazozon zalazun zal vowurol hwuvul."), []);
  });

  it("R4c-1, R4c-2: a tie and a superlative use their SHARED word; a denied tie, an open tie with a factor and a place on the scale stay left", () => {
    assert.deepEqual(left("zazozon zalazun zoel gamahum."), []);
    assert.deepEqual(left("zahelan zol guzemel."), []);
    assert.deepEqual(left("zazozon zalazun zoel gamahum thul."), ["unused shared:equative"]);
    assert.deepEqual(left("zazozon zalazun zoem gelazem hradol."), ["unused shared:equative"]);
    assert.deepEqual(left("zahelan zol wrogel gelazem."), ["unused shared:scale"]);
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
