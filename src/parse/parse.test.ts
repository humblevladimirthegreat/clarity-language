import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";

import { createClassifyTables } from "./classify.js";
import { parse, SentenceParseError } from "./index.js";

const rootDir = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const tables = createClassifyTables(
  readFileSync(join(rootDir, "data", "lexicon-published.csv"), "utf8"),
  readFileSync(join(rootDir, "data", "lexicon-overlays.csv"), "utf8"),
  readFileSync(join(rootDir, "data", "lexicon-compounds.csv"), "utf8"),
);

function parseText(text: string) {
  return parse(text, tables);
}

describe("parse — clause.md beginner", () => {
  it("parses zazawan vowogal.", () => {
    const result = parseText("zazawan vowogal.");
    assert.equal(result.utterances.length, 1);
    const body = result.utterances[0]!.bodies[0]!;
    assert.equal(body.clause.units.length, 2);
    assert.equal(body.clause.units[0]!.kind, "np");
    assert.equal(body.clause.units[1]!.kind, "vp");
  });

  it("parses zezadel gubuhal. as classification predicate", () => {
    const result = parseText("zezedol gubuhel.");
    const units = result.utterances[0]!.bodies[0]!.clause.units;
    assert.equal(units.length, 2);
    assert.equal(units[0]!.kind, "np");
    assert.equal(units[1]!.kind, "predicate");
  });

  it("parses zazawan gedehol. as subject + predicate adjective", () => {
    const result = parseText("zazawan gedehol.");
    const units = result.utterances[0]!.bodies[0]!.clause.units;
    assert.equal(units.length, 2);
    assert.equal(units[1]!.kind, "predicate");
  });

  it("parses citation greeting azawan.", () => {
    const result = parseText("azawan.");
    assert.equal(result.utterances.length, 1);
    assert.equal(result.utterances[0]!.bodies[0]!.clause.units[0]!.kind, "np");
  });

  it("parses greeting bid azawaxan. as vocative-shaped left edge", () => {
    const result = parseText("azawaxan.");
    assert.equal(result.utterances[0]!.left.vocatives[0]?.raw, "azawaxan");
    assert.equal(result.utterances[0]!.bodies.length, 0);
  });

  it("parses vocative yalahen.", () => {
    const result = parseText("yalahen.");
    assert.equal(result.utterances[0]!.left.vocatives[0]?.raw, "yalahen");
  });

  it("reads /y/ -l / -m as an interjection and -n as a vocative", () => {
    const left = parseText("yalahen yezul zalahen vowogal.").utterances[0]!.left;
    assert.deepEqual(left.vocatives.map((w) => w.raw), ["yalahen"]);
    assert.deepEqual(left.interjections.map((w) => w.raw), ["yezul"]);
    assert.deepEqual(parseText("yezum.").utterances[0]!.left.interjections.map((w) => w.raw), ["yezum"]);
  });

  it("reads a /y/ span by its @ mark: named calls, unnamed is an interjection", () => {
    assert.deepEqual(parseText("y@<Sam>.").utterances[0]!.left.vocatives.map((w) => w.raw), ["y@<Sam>"]);
    assert.deepEqual(parseText("y<Amen>.").utterances[0]!.left.interjections.map((w) => w.raw), ["y<Amen>"]);
  });

  it("parses unhosted /b/ recipient plus verb", () => {
    const result = parseText("zazawan balahen vezebel.");
    const units = result.utterances[0]!.bodies[0]!.clause.units;
    assert.equal(units.length, 3);
    assert.equal(units[0]!.kind, "np");
    assert.equal(units[1]!.kind, "np");
    assert.equal(units[2]!.kind, "vp");
    if (units[1]!.kind !== "np") return;
    assert.equal(units[1]!.coord.level, "b");
  });

  it("omits yal when recoverable", () => {
    const result = parseText("zazawan vowogal.");
    assert.equal(result.utterances[0]!.left.force, undefined);
    assert.equal(result.utterances[0]!.left.impliedForce, "yal");
  });

  it("parses yol question", () => {
    const result = parseText("yol zamagon vowogal.");
    assert.ok(result.utterances[0]!.left.force);
    assert.equal(result.utterances[0]!.left.force!.raw, "yol");
  });

  it("parses confirm tag as second utterance", () => {
    const result = parseText("zazawan vowogal. yael.");
    assert.equal(result.utterances.length, 2);
    assert.equal(result.utterances[1]!.left.polars[0]?.raw, "yael");
  });

  it("parses yam soft statement", () => {
    const result = parseText("yam zazawan vowogal.");
    assert.equal(result.utterances[0]!.left.force?.raw, "yam");
  });

  it("parses yel command with a period", () => {
    const result = parseText("yel vahawal.");
    assert.equal(result.utterances[0]!.left.force?.raw, "yel");
    assert.equal(result.utterances[0]!.bodies[0]!.punct, "period");
  });

  it("parses polar plus body", () => {
    const result = parseText("yael zamagon vowogal.");
    assert.equal(result.utterances[0]!.left.polars[0]?.raw, "yael");
    assert.equal(result.utterances[0]!.bodies[0]!.clause.units.length, 2);
  });
});

describe("parse — joins.md", () => {
  it("parses zezadel zagadal zam.", () => {
    const result = parseText("zezedol zagadul zam.");
    const unit = result.utterances[0]!.bodies[0]!.clause.units[0]!;
    assert.equal(unit.kind, "np");
    if (unit.kind !== "np") return;
    assert.equal(unit.coord.parts.length, 1);
    assert.equal(unit.coord.parts[0]!.items.length, 2);
    assert.equal(unit.coord.parts[0]!.items[0]!.kind, "package");
    assert.equal(unit.coord.parts[0]!.items[1]!.kind, "package");
    assert.equal(unit.coord.parts[0]!.join?.raw, "zam");
  });

  it("rejects frame echo zual zanayal zahawol zual", () => {
    assert.throws(() => parseText("zual zanayal zahawol zual."), SentenceParseError);
  });

  it("parses join scope island", () => {
    const result = parseText("zazawan ^ zenehul zal ^ zam.");
    const unit = result.utterances[0]!.bodies[0]!.clause.units[0]!;
    assert.equal(unit.kind, "np");
    if (unit.kind !== "np") return;
    assert.equal(unit.coord.parts.length, 1);
    assert.equal(unit.coord.parts[0]!.items.length, 2);
    assert.equal(unit.coord.parts[0]!.join?.raw, "zam");
    assert.equal(unit.coord.parts[0]!.items[0]!.kind, "package");
    assert.equal(unit.coord.parts[0]!.items[1]!.kind, "island");
  });

  it("rejects empty scope islands", () => {
    assert.throws(() => parseText("^ ^ zazawan vowogal."), /scope island needs words/);
    assert.throws(() => parseText("zazawan ^ ^ zam."), /scope island needs words/);
  });

  it("parses nested left-associative VP joins", () => {
    const result = parseText("vowogal vezebal vol varahal val.");
    const unit = result.utterances[0]!.bodies[0]!.clause.units[0]!;
    assert.equal(unit.kind, "vp");
    if (unit.kind !== "vp") return;
    assert.equal(unit.coord.parts.length, 2);
    assert.equal(unit.coord.parts[0]!.items.length, 2);
    assert.equal(unit.coord.parts[0]!.join?.raw, "vol");
    assert.equal(unit.coord.parts[1]!.items.length, 1);
    assert.equal(unit.coord.parts[1]!.join?.raw, "val");
  });
});

describe("parse — stand-in dependents", () => {
  it("parses theram barl dependent", () => {
    const result = parseText("zazawan gezebul thevem barl zalahen vowogal.");
    const clause = result.utterances[0]!.bodies[0]!.clause;
    assert.ok(clause.dependent);
    assert.equal(clause.dependent!.orodo.raw, "barl");
    assert.equal(clause.dependent!.clause.units.length, 2);
  });

  it("parses an evidence clause: an inferred or pattern channel hosts barl", () => {
    for (const text of ["zoyel vehahel thunem barl zazawan vowogal.", "zoyel vehahel thobal barl zazawan vowogal."]) {
      const clause = parseText(text).utterances[0]!.bodies[0]!.clause;
      assert.equal(clause.dependent?.orodo.raw, "barl", text);
      assert.equal(clause.dependent!.clause.units.length, 2, text);
    }
  });

  it("parses like (humum) hosting barl: the model of the simile is an event", () => {
    const clause = parseText("zewedul vuvudel humum barl zahadal vuvudel.").utterances[0]!.bodies[0]!.clause;
    assert.equal(clause.dependent?.orodo.raw, "barl");
    assert.throws(() => parseText("zewedul vuvudel humum burl zahadal vuvudel."));
  });

  it("keeps clause joins after a stand-in inside its dependent", () => {
    const clause = parseText("zazawan vubugam dorl zalahen vowogal xol zahaben varahal.").utterances[0]!.bodies[0]!.clause;
    assert.equal(clause.units.some((unit) => unit.kind === "clauseCoord"), false);
    const dep = clause.dependent;
    assert.equal(dep?.orodo.raw, "dorl");
    const coord = dep?.clause.units[0];
    assert.ok(coord && coord.kind === "clauseCoord");
    assert.equal(coord.coord.links.length, 1);
    assert.equal(coord.coord.links[0]!.join.raw, "xol");
    const nested = parseText("zazawan vezehel thevem barl zalahen vowogal thevem barl zahaben vezebal xal zazawan varahal.").utterances[0]!.bodies[0]!.clause;
    const inner = nested.dependent?.clause.units[0];
    assert.ok(inner && inner.kind === "clauseCoord");
  });

  it("parses barl after a channel's offset as its grounds, not a recipient", () => {
    const clause = parseText("zoyel galagal thobal bral barl zalahen vedabal.").utterances[0]!.bodies[0]!.clause;
    const host = clause.units.find((unit) => unit.kind === "h");
    assert.ok(host && host.kind === "h");
    assert.equal(host.unit.hosted?.bound.raw, "bral");
    assert.equal(host.unit.hosted?.grounds?.raw, "barl");
    assert.equal(clause.dependent?.orodo.raw, "barl");
  });

  it("parses hagom barl purpose dependent", () => {
    const result = parseText("zazawan vowogal hogom barl zalahen vehahel.");
    const clause = result.utterances[0]!.bodies[0]!.clause;
    assert.ok(clause.dependent);
    assert.equal(clause.dependent!.orodo.raw, "barl");
    assert.equal(clause.dependent!.clause.units.length, 2);
  });

  it("parses darl object with matrix verb before the opener", () => {
    const result = parseText("zazawan balahen vezebel darl zezedol varahal.");
    const clause = result.utterances[0]!.bodies[0]!.clause;
    assert.ok(clause.dependent);
    assert.equal(clause.units.some((u) => u.kind === "vp"), true);
    assert.equal(clause.dependent!.orodo.raw, "darl");
    assert.equal(clause.dependent!.clause.units.length, 2);
  });

  it("parses dorl whether without inner yol", () => {
    const result = parseText("zazawan vahahal dorl zalahen vowogal.");
    const clause = result.utterances[0]!.bodies[0]!.clause;
    assert.ok(clause.dependent);
    assert.equal(clause.dependent!.orodo.raw, "dorl");
  });
});

describe("parse — comparatives manner scale", () => {
  it("attaches /h/ immediately after zel as SHARED, then the verb", () => {
    const result = parseText("zalahen zazawan zel hahegem vowogal.");
    const units = result.utterances[0]!.bodies[0]!.clause.units;
    assert.equal(units.length, 2);
    assert.equal(units[0]!.kind, "np");
    assert.equal(units[1]!.kind, "vp");
    if (units[0]!.kind !== "np") return;
    const part = units[0]!.coord.parts[0]!;
    assert.equal(part.join?.raw, "zel");
    assert.equal(part.shared.length, 1);
    const shared = part.shared[0]!;
    assert.ok("word" in shared);
    assert.equal(shared.word.raw, "hahegem");
    assert.equal(shared.word.pos, "h");
  });
});

describe("parse — spans", () => {
  const spanOf = (text: string) => {
    const unit = parseText(text).utterances[0]!.bodies[0]!.clause.units.find((u) => u.kind === "span");
    assert.ok(unit && unit.kind === "span");
    return unit.span;
  };

  it("parses an atomic open with exactly one interior token", () => {
    const span = spanOf("zazawan vezebel daxol azawan.");
    assert.equal(span.atom?.raw, "azawan");
    assert.equal(span.close, undefined);
  });

  it("runs a clause-scoped open to the clause end", () => {
    const span = spanOf("zazawan vezebel daxel zalahen valahal.");
    assert.equal(span.content[0]!.units.length, 2);
    assert.equal(span.close, undefined);
  });

  it("parses an empty open with no interior", () => {
    const span = spanOf("zazawan daxul vezebel.");
    assert.equal(span.content.length, 0);
    assert.equal(span.atom, undefined);
  });

  it("parses daxal … xuxul span", () => {
    const result = parseText("daxal zezedol xuxul vowogal.");
    const spanUnit = result.utterances[0]!.bodies[0]!.clause.units.find((u) => u.kind === "span");
    assert.ok(spanUnit);
    if (spanUnit?.kind !== "span") return;
    assert.equal(spanUnit.span.open.raw, "daxal");
    assert.equal(spanUnit.span.close?.raw, "xuxul");
  });
});

describe("parse — SVO slots", () => {
  it("parses zar damegun vozezol as subject, object, verb (roles.md)", () => {
    const result = parseText("zar damagon vozezol.");
    const units = result.utterances[0]!.bodies[0]!.clause.units;
    assert.equal(units.length, 3);
    assert.equal(units[0]!.kind, "np");
    assert.equal(units[1]!.kind, "np");
    assert.equal(units[2]!.kind, "vp");
    if (units[0]!.kind !== "np" || units[1]!.kind !== "np") return;
    assert.equal(units[0]!.coord.level, "z");
    assert.equal(units[0]!.coord.parts[0]!.join?.raw, "zar");
    assert.equal(units[1]!.coord.level, "d");
    const obj = units[1]!.coord.parts[0]!.items[0];
    assert.equal(obj?.kind, "package");
    if (obj?.kind !== "package") return;
    assert.equal(obj.package.head.raw, "damagon");
  });
});

describe("parse — hosted /w/ before /b/", () => {
  it("parses simile with /w/ left of host, then /b/", () => {
    const result = parseText("zazawan welavam humum badagul vowogal.");
    const units = result.utterances[0]!.bodies[0]!.clause.units;
    const h = units.find((u) => u.kind === "h");
    assert.ok(h && h.kind === "h");
    assert.equal(h.unit.modifiers[0]?.raw, "welavam");
    assert.equal(h.unit.hosted?.bound.raw, "badagul");
  });

  it("parses extra-noun hook with restrictor /w/ left of the hook", () => {
    const result = parseText("zodogal vezebal wal al bahazal.");
    const units = result.utterances[0]!.bodies[0]!.clause.units;
    const hook = units.find((u) => u.kind === "hook");
    assert.ok(hook && hook.kind === "hook");
    assert.equal(hook.modifiers[0]?.raw, "wal");
  });

  it("parses discourse hook with /w/", () => {
    const result = parseText("welavam al zazawan vowogal.");
    assert.equal(result.utterances[0]!.left.hook?.raw, "al");
    assert.equal(result.utterances[0]!.left.hookModifiers?.[0]?.raw, "welavam");
  });
});

describe("parse — /ɡ/ join fences", () => {
  const gCoordOf = (text: string) => {
    const units = parseText(text).utterances[0]!.bodies[0]!.clause.units;
    const unit = units.find((u) => u.kind === "gCoord");
    assert.ok(unit?.kind === "gCoord", text);
    return unit.coord.parts.map((part) => ({
      items: part.items.map((item) => (item.kind === "adj" ? item.adj.word.raw : "^")),
      join: part.join?.raw,
      shared: part.shared.map((s) => ("raw" in s ? s.raw : s.word.raw)),
    }));
  };

  it("keeps a predicative /ɡ/ join as one list (zazawan godogal gul)", () => {
    assert.deepEqual(gCoordOf("zazawan godogal gul."), [{ items: ["godogal"], join: "gul", shared: [] }]);
  });

  it("starts a new /ɡ/ part after a closed /ɡ/ join (g+3 g+5 gal gadaham)", () => {
    assert.deepEqual(gCoordOf("g+3 g+5 gal gadaham."), [
      { items: ["g+3", "g+5"], join: "gal", shared: [] },
      { items: ["gadaham"], join: undefined, shared: [] },
    ]);
  });

  it("keeps an attributive list with an island on the noun", () => {
    const units = parseText("zodogal geredal ^ gamazam gul ^ gelavam gal vowogal.").utterances[0]!.bodies[0]!.clause.units;
    const np = units[0]!;
    assert.ok(np.kind === "np");
    const item = np.coord.parts[0]!.items[0]!;
    assert.ok(item.kind === "package");
    assert.deepEqual(
      item.package.adjCoord?.parts.map((part) => [part.items.map((i) => (i.kind === "adj" ? i.adj.word.raw : "^")), part.join?.raw]),
      [[["geredal", "^", "gelavam"], "gal"]],
    );
    assert.deepEqual(item.package.adjs.map((a) => a.word.raw), ["geredal", "gamazam", "gelavam"]);
  });
});

describe("parse — illegal fences", () => {
  it("rejects left fence zam zezadel zagadal", () => {
    assert.throws(() => parseText("zam zezedol zagadul."), SentenceParseError);
  });

  it("nests A zam B zal as [[A zam] B zal]", () => {
    const result = parseText("zezedol zam zagadul zal vowogal.");
    const np = result.utterances[0]!.bodies[0]!.clause.units[0]!;
    assert.ok(np.kind === "np");
    assert.deepEqual(
      np.coord.parts.map((part) => [part.items.length, part.join?.raw]),
      [
        [1, "zam"],
        [1, "zal"],
      ],
    );
  });

  it("attaches an adjective after a hosted pair to the extra noun", () => {
    const result = parseText("zodogal gugol bazawan gubuhel vowogal.");
    const np = result.utterances[0]!.bodies[0]!.clause.units[0]!;
    assert.ok(np.kind === "np" && np.coord.parts[0]!.items[0]!.kind === "package");
    const pkg = np.coord.parts[0]!.items[0]!.package;
    assert.equal(pkg.adjs.length, 1);
    assert.equal(pkg.adjs[0]!.hosted?.bound.raw, "bazawan");
    assert.equal(pkg.adjs[0]!.hosted?.adjs?.[0]?.word.raw, "gubuhel");
  });

  it("attaches a number word after a hosted /b/ on /th/ as its amount (signed offset)", () => {
    const result = parseText("zazawan thevom bagazem g-3 vowogal.");
    const unit = result.utterances[0]!.bodies[0]!.clause.units[1]!;
    assert.ok(unit.kind === "h");
    assert.equal(unit.unit.hosted?.bound.raw, "bagazem");
    assert.equal(unit.unit.hosted?.amount?.raw, "g-3");
  });
});

describe("parse — as-of poles", () => {
  it("parses hosted ledger plus date /b/", () => {
    const result = parseText("zalahen thamom huhum b_#22,7 vedabam.");
    const h = result.utterances[0]!.bodies[0]!.clause.units.find((u) => u.kind === "h" && u.unit.word.raw === "huhum");
    assert.ok(h && h.kind === "h");
    assert.equal(h.unit.word.overlay?.gloss, "as-of.ledger");
    assert.equal(h.unit.hosted?.bound.raw, "b_#22,7");
  });

  it("parses stance as-of on /th/ beside a clause as-of on /h/", () => {
    const units = parseText("zalahen thuhum b_#22,7 thovum huhum b_#22,7 vedabal.").utterances[0]!.bodies[0]!.clause.units;
    const th = units.find((u) => u.kind === "h" && u.unit.word.raw === "thuhum");
    assert.ok(th && th.kind === "h");
    assert.equal(th.unit.word.overlay?.gloss, "as-of.ledger");
    assert.equal(th.unit.hosted?.bound.raw, "b_#22,7");
  });

  it("parses a fault pole hosting a stand-in, stacked after only-if", () => {
    parseText("zazawan vowogal tholum thevel barl zalahen vezebel.");
    parseText("zumel wanathumol gobum balahen thovum thevel barl zalahen vezebel.");
  });

  it("parses as-of resume without /b/", () => {
    const result = parseText("zazawan huhur vowogal.");
    const h = result.utterances[0]!.bodies[0]!.clause.units.find((u) => u.kind === "h");
    assert.ok(h && h.kind === "h");
    assert.equal(h.unit.word.raw, "huhur");
    assert.equal(h.unit.hosted, undefined);
  });

  it("rejects as-of resume plus /b/", () => {
    assert.throws(() => parseText("zazawan huhur b_#22,7 vowogal."), SentenceParseError);
  });

  it("rejects as-of introduce without /b/", () => {
    assert.throws(() => parseText("zazawan huhum vowogal."), SentenceParseError);
  });

  it("parses /ɡ/ ledger on a noun", () => {
    const result = parseText("zamol guhum b_#22,7.");
    const units = result.utterances[0]!.bodies[0]!.clause.units;
    const pred = units.find((u) => u.kind === "predicate");
    const np = units.find((u) => u.kind === "np");
    if (pred?.kind === "predicate") {
      assert.equal(pred.adj.word.raw, "guhum");
      assert.equal(pred.adj.hosted?.bound.raw, "b_#22,7");
      return;
    }
    assert.ok(np && np.kind === "np");
    const item = np.coord.parts[0]!.items[0];
    assert.equal(item?.kind, "package");
    if (item?.kind !== "package") return;
    const g = item.package.adjs[0];
    assert.equal(g?.word.raw, "guhum");
    assert.equal(g?.hosted?.bound.raw, "b_#22,7");
  });

  it("parses /w/ as-of before a shared adjective", () => {
    const result = parseText("zazawan zalahen zel wuhum b_#22,7 gamadam.");
    const np = result.utterances[0]!.bodies[0]!.clause.units[0];
    assert.ok(np && np.kind === "np");
    const shared = np.coord.parts[0]!.shared[0];
    assert.ok(shared && "asOf" in shared);
    assert.equal(shared.asOf?.word.raw, "wuhum");
    assert.equal(shared.asOf?.bound?.raw, "b_#22,7");
    assert.equal(shared.word.raw, "gamadam");
  });

  it("parses bookmark as-of plus barl dependent", () => {
    const result = parseText("zoyel galagam thamom thunem b+ huram barl zalahen vedabam.");
    const clause = result.utterances[0]!.bodies[0]!.clause;
    assert.ok(clause.dependent);
    const h = clause.units.find((u) => u.kind === "h" && u.unit.word.raw === "huram");
    assert.ok(h && h.kind === "h");
    assert.equal(h.unit.hosted?.bound.raw, "barl");
  });

  it("parses channel plus residue plus as-of", () => {
    const result = parseText("zalahen thevom thamom huhum b_#22,7 vedabam.");
    const hs = result.utterances[0]!.bodies[0]!.clause.units.filter((u) => u.kind === "h");
    assert.equal(hs.length, 3);
  });

  it("rejects two as-of /h/ hosts in one clause", () => {
    assert.throws(
      () => parseText("zazawan huhum b_#22,7 huram b_#23,7 vowogal."),
      SentenceParseError,
    );
  });

  it("parses event-noun /b/ on as-of", () => {
    const result = parseText("zamol thamom huhum bedabam.");
    const h = result.utterances[0]!.bodies[0]!.clause.units.find((u) => u.kind === "h" && u.unit.word.raw === "huhum");
    assert.ok(h && h.kind === "h");
    assert.equal(h.unit.hosted?.bound.raw, "bedabam");
  });

  it("parses extra-noun resume in as-of /b/", () => {
    const result = parseText("zalahen vowogal ol b_#22,7. xalahen thamom huhum b=_#22,7 vedabam.");
    const second = result.utterances[0]!.bodies[1]!.clause.units.find((u) => u.kind === "h" && u.unit.word.raw === "huhum");
    assert.ok(second && second.kind === "h");
    assert.equal(second.unit.hosted?.bound.raw, "b=_#22,7");
  });

  it("parses /w/ as-of resume immediately before the adjective", () => {
    const result = parseText("zazawan zalahen zel wuhur gamadam.");
    const np = result.utterances[0]!.bodies[0]!.clause.units[0];
    assert.ok(np && np.kind === "np");
    const shared = np.coord.parts[0]!.shared[0];
    assert.ok(shared && "asOf" in shared);
    assert.equal(shared.asOf?.word.raw, "wuhur");
    assert.equal(shared.asOf?.bound, undefined);
  });
});

describe("parse — stage 4 resolve", () => {
  it("attaches resolve to parse(text)", () => {
    const result = parseText("zalahen vowogal. zalaher vehahel.");
    assert.ok(result.resolve);
    assert.equal(result.resolve.anaphors[0]?.antecedent?.raw, "zalahen");
  });

  it("marks yol zar vowogal. as fill-ask", () => {
    const result = parseText("yol zar vowogal.");
    assert.equal(result.resolve?.asks[0]?.kind, "fillAsk");
  });
});

describe("parse — spans.md written fences and closes", () => {
  it("puts a written span in its PoS slot, not only an NP head", () => {
    for (const text of ["zazawan vowogal th(hagawal).", "yul zalahen v[vazadal].", "zalahen vezebel th(zazawan vezehel)."]) {
      assert.doesNotThrow(() => parseText(text), text);
    }
  });

  it("allows close-all right after an editorial close (written #|)", () => {
    assert.doesNotThrow(() => parseText("zalahen daxal abogam xuxur xuxum vezebel."));
    assert.throws(() => parseText("zalahen daxal abogam xuxul xuxum vezebel."), SentenceParseError);
  });
});

describe("parse — pronouns.md resume with no earlier match", () => {
  it("reads an opening resume of a lexicon stem as the one you both know", () => {
    for (const text of ["zalahen vahahal dozer.", "zoyer vowogal.", "zodogar vowogal.", "zebedalahazar vowogal.", "zalahen vowogalar."]) {
      assert.doesNotThrow(() => parseText(text), text);
    }
    assert.throws(() => parseText("zadar vowogal."), SentenceParseError);
  });
});

describe("parse — comparatives.md bars", () => {
  const fence = (text: string) => {
    const unit = parseText(text).utterances[0]!.bodies[0]!.clause.units[0]!;
    assert.equal(unit.kind, "np");
    return unit.kind === "np" ? unit.coord.parts[0]! : undefined;
  };
  const barOf = (text: string) => {
    const item = fence(text)!.items.find((i) => i.kind === "bar");
    return item?.kind === "bar" ? item.bar : undefined;
  };

  it("takes one /th/ stance word before a rank join as the fence's bar", () => {
    for (const [text, raw] of [
      ["zazawan thobam zel gezebul.", "thobam"],
      ["zazawan thamam zel bral vevahal.", "thamam"],
      ["zubugal thohum balahen zuel garagam.", "thohum"],
      ["zedehel thegatham zael gral.", "thegatham"],
      ["zubugal thodom zuem garagam.", "thodom"],
      ["zalahen thezexal zael hadehum vowogal.", "thezexal"],
      ["zahazal thumel zael gabezem.", "thumel"],
      ["zubugal thevegem zel gagazam.", "thevegem"],
      ["zazawan thahomalahen zel gezebul.", "thahomalahen"],
    ] as const) {
      assert.equal(barOf(text)?.word.raw, raw, text);
    }
    const units = parseText("zazawan dozolx thamam del gral vagadel.").utterances[0]!.bodies[0]!.clause.units;
    const object = units.find((u) => u.kind === "np" && u.coord.level === "d");
    assert.ok(object?.kind === "np" && object.coord.parts[0]!.items.some((i) => i.kind === "bar" && i.bar.word.raw === "thamam"));
  });

  it("keeps a bar's hosted /b/ and dated offset inside the fence", () => {
    assert.equal(barOf("zubugal thewam balahen zuel gagazam.")?.hosted?.bound.raw, "balahen");
    const dated = barOf("zazawan thevom bazazam gruwol zel gezebul.");
    assert.equal(dated?.hosted?.bound.raw, "bazazam");
    assert.equal(dated?.hosted?.amount?.raw, "gruwol");
  });

  it("ranks a closed universal fence against the bar after it", () => {
    for (const text of ["zuam gaxadadal thobam zel hral vabogam.", "zuan gaxadadal thobam zel hral vabogam.", "zual gagadul thobam zel gezebul."]) {
      const units = parseText(text).utterances[0]!.bodies[0]!.clause.units;
      const np = units[0]!;
      assert.ok(np.kind === "np", text);
      const [fence, ranked] = np.kind === "np" ? np.coord.parts : [];
      assert.equal(fence?.join?.family.kind === "joinMarker" && fence.join.family.series, "ua", text);
      assert.deepEqual(ranked?.items.map((i) => (i.kind === "bar" ? i.bar.word.raw : i.kind)), ["thobam"], text);
      assert.ok(!units.some((u) => u.kind === "h"), text);
    }
    // Only the `ua` fences rank as one item; `zul` + kind keeps the bar out.
    const units = parseText("zul gagadul thobam zel gezebul.").utterances[0]!.bodies[0]!.clause.units;
    assert.ok(units.some((u) => u.kind === "h" && u.unit.word.raw === "thobam"));
  });

  it("reads an adjective after a bar's hosted /b/ as describing that noun, inside the fence", () => {
    const bar = barOf("zazawan thobam baxelehalx gezebul zel gezehel.");
    assert.equal(bar?.hosted?.bound.raw, "baxelehalx");
    assert.deepEqual(bar?.hosted?.adjs?.map((a) => a.word.raw), ["gezebul"]);
    // On the clause, a channel's source keeps a later /ɡ/ as the predicate.
    const units = parseText("zazawan thewam balahen gezebul.").utterances[0]!.bodies[0]!.clause.units;
    assert.ok(units.some((u) => u.kind === "h" && !u.unit.hosted?.adjs));
  });

  it("keeps the ranked item's hook + /b/ before its bar inside the fence", () => {
    const part = fence("zubugal om bamagon thamam zel garagam.")!;
    assert.deepEqual(part.items.map((i) => i.kind), ["package", "bar"]);
    assert.equal(part.items[0]!.kind === "package" && part.items[0]!.package.adjs[0]?.hosted?.bound.raw, "bamagon");
  });

  it("reads a stance word outside the fence on the claim", () => {
    const units = parseText("zazawan zel gezebul thobam.").utterances[0]!.bodies[0]!.clause.units;
    assert.deepEqual(units.map((u) => u.kind), ["np", "h"]);
    assert.ok(units[0]!.kind === "np" && units[0]!.coord.parts[0]!.items.every((i) => i.kind === "package"));
  });

  it("ends the sentence at a bar's barl: the next words are the grounds", () => {
    const clause = parseText("zazawan thunem barl zel gezebul zalahen vezugel.").utterances[0]!.bodies[0]!.clause;
    assert.equal(clause.units.length, 1);
    assert.deepEqual(clause.dependent?.clause.units.map((u) => u.kind), ["np", "vp"]);
  });
});

describe("parse — spans.md /y/ spans", () => {
  it("puts a spoken /y/ span at the left edge, before the act word", () => {
    const left = parseText("yuxan sam xuxul yol zazawan vowogal.").utterances[0]!.left;
    assert.equal(left.force?.raw, "yol");
    assert.deepEqual(left.spans?.map((s) => [s.job, s.span.open.raw]), [["vocative", "yuxan"]]);
  });

  it("reads a spoken /y/ span by its ending: -n calls, -l / -m react", () => {
    const job = (text: string) => parseText(text).utterances[0]!.left.spans?.[0]?.job;
    assert.equal(job("yuxan sam xuxul zazawan vowogal."), "vocative");
    assert.equal(job("yaxon azawan yol zalahen vowogal."), "vocative");
    assert.equal(job("yuxam amen xuxul."), "interjection");
    assert.equal(job("yuxal amen xuxul."), "interjection");
  });

  it("opens a new turn with a /y/ span after a sentence end", () => {
    const result = parseText("zazawan vowogal. yuxan sam xuxul yol zalahen vowogal.");
    assert.equal(result.utterances.length, 2);
    assert.equal(result.utterances[1]!.left.spans?.[0]?.span.open.raw, "yuxan");
  });

  it("takes a sentence linker after a spoken /y/ span, as after a written one", () => {
    for (const text of ["y@<Sam> xezom zazawan vowogal.", "yuxan sam xuxul xezom zazawan vowogal.", "yuxon sam xezom zazawan vowogal."]) {
      assert.equal(parseText(text).utterances[0]!.bodies[0]!.linker?.raw, "xezom", text);
    }
  });

  it("puts a written /y/ cite at the left edge too", () => {
    assert.deepEqual(parseText("y[azawan] yol zalahen vowogal.").utterances[0]!.left.interjections.map((w) => w.raw), ["y[azawan]"]);
  });

  it("keeps an act word inside a spoken cite", () => {
    const span = parseText("zazawan daxal yol zalahen vowogal xuxul vezebel.").utterances[0]!.bodies[0]!.clause.units.find((u) => u.kind === "span");
    assert.ok(span && span.kind === "span");
    assert.equal(span.span.content[0]?.left?.force?.raw, "yol");
  });

  it("sets the topic with an /x/ cite, mention or opaque span", () => {
    assert.equal(parseText("x@<Sam> zozan vowogal.").utterances[0]!.bodies[0]!.linker?.raw, "x@<Sam>");
    assert.equal(parseText("x{odoga} zozan gamazam.").utterances[0]!.bodies[0]!.linker?.raw, "x{odoga}");
    assert.equal(parseText("x@[onodan alahen] zozan vezehel.").utterances[0]!.bodies[0]!.linker?.raw, "x@[onodan alahen]");
    assert.equal(parseText("xuxon Sam zozan vowogal.").utterances[0]!.bodies[0]!.topicSpan?.open.raw, "xuxon");
    assert.equal(parseText("xoxol odogal zozan gamazam.").utterances[0]!.bodies[0]!.topicSpan?.open.raw, "xoxol");
  });
});

describe("parse — contrary to a stance (uem + /th/)", () => {
  const frameOf = (text: string) => {
    const units = parseText(text).utterances[0]!.bodies[0]!.clause.units;
    const hook = units.find((unit) => unit.kind === "hook");
    assert.ok(hook && hook.kind === "hook", text);
    return { hook, units };
  };

  it("holds the stance as the hook's frame, not a stance on the claim", () => {
    for (const text of [
      "zazawan vowogal uem thedel.",
      "zazawan vowogal uem thumel.",
      "zazawan vowogal uem thamam.",
      "zazawan vowogal uem thehum.",
      "zazawan vowogal uem thohum.",
      "zazawan vowogal uem thewam.",
      "zazawan vowogal uem thevegem.",
      "zazawan vowogal uem thewamalahen.",
    ]) {
      const { hook, units } = frameOf(text);
      assert.equal(hook.job, "frame", text);
      assert.equal(hook.frame?.word.pos, "th", text);
      assert.ok(!units.some((unit) => unit.kind === "h"), text);
    }
  });

  it("keeps the stance's hosted /b/ inside the frame", () => {
    const { hook } = frameOf("zazawan vezebel uem thuxedem balahen.");
    assert.equal(hook.frame?.word.raw, "thuxedem");
    assert.equal(hook.frame?.hosted?.bound.raw, "balahen");
  });

  it("takes the frame at the left edge too", () => {
    const result = parseText("uem thedel zazawan vowogal.");
    assert.equal(result.utterances[0]!.left.hook, undefined);
    const { hook } = frameOf("uem thedel zazawan vowogal.");
    assert.equal(hook.frame?.word.raw, "thedel");
  });

  it("leaves a stance elsewhere in the clause on the claim", () => {
    const { hook, units } = frameOf("zazawan vowogal uem thedel thegom.");
    assert.equal(hook.frame?.word.raw, "thedel");
    const claim = units.filter((unit) => unit.kind === "h");
    assert.deepEqual(claim.map((unit) => unit.kind === "h" && unit.unit.word.raw), ["thegom"]);
  });

  it("keeps uem + /b/ as an extra noun", () => {
    const { hook } = frameOf("zazawan vowogal uem berehel.");
    assert.equal(hook.job, "extraNoun");
    assert.equal(hook.frame, undefined);
  });
});

describe("parse — whose want, plan, or decision (hosted /b/)", () => {
  const hUnits = (text: string) =>
    parseText(text).utterances[0]!.bodies[0]!.clause.units.flatMap((unit) => (unit.kind === "h" ? [unit.unit] : []));

  it("hosts the person on WANT, PLAN, and DECISION", () => {
    for (const text of ["zazawan thohum balahen vowogal.", "zazawan thamam balahen vowogal.", "zazawan thehum balahen vowogal."]) {
      const [mood] = hUnits(text);
      assert.equal(mood?.hosted?.bound.raw, "balahen", text);
    }
  });

  it("moves a plan's date to a time pole when the plan has an owner", () => {
    const [plan, pole] = hUnits("zazawan thamam balahen vowogal huwem bral.");
    assert.equal(plan?.hosted?.bound.raw, "balahen");
    assert.equal(pole?.word.raw, "huwem");
    assert.equal(pole?.hosted?.bound.raw, "bral");
  });
});
