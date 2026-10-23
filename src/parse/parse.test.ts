import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";

import { createClassifyTables } from "./classify.js";
import { isGreeting } from "./ast-walk.js";
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
  it("parses zazozon vowurol.", () => {
    const result = parseText("zazozon vowurol.");
    assert.equal(result.utterances.length, 1);
    const body = result.utterances[0]!.bodies[0]!;
    assert.equal(body.clause.units.length, 2);
    assert.equal(body.clause.units[0]!.kind, "np");
    assert.equal(body.clause.units[1]!.kind, "vp");
  });

  it("parses zuzehal gobovol. as classification predicate", () => {
    const result = parseText("zezedel gobulol.");
    const units = result.utterances[0]!.bodies[0]!.clause.units;
    assert.equal(units.length, 2);
    assert.equal(units[0]!.kind, "np");
    assert.equal(units[1]!.kind, "predicate");
  });

  it("parses zazozon geduyol. as subject + predicate adjective", () => {
    const result = parseText("zazozon geduyol.");
    const units = result.utterances[0]!.bodies[0]!.clause.units;
    assert.equal(units.length, 2);
    assert.equal(units[1]!.kind, "predicate");
  });

  it("parses citation greeting azozon.", () => {
    const result = parseText("azozon.");
    assert.equal(result.utterances.length, 1);
    assert.equal(result.utterances[0]!.bodies[0]!.clause.units[0]!.kind, "np");
  });

  it("parses greeting bid azozoxan. as vocative-shaped left edge", () => {
    const result = parseText("azozoxan.");
    assert.equal(result.utterances[0]!.left.vocatives[0]?.raw, "azozoxan");
    assert.equal(result.utterances[0]!.bodies.length, 0);
  });

  it("parses vocative yalazun.", () => {
    const result = parseText("yalazun.");
    assert.equal(result.utterances[0]!.left.vocatives[0]?.raw, "yalazun");
  });

  it("reads /y/ -l / -m as an interjection and -n as a vocative", () => {
    const left = parseText("yalazun yemel zalazun vowurol.").utterances[0]!.left;
    assert.deepEqual(left.vocatives.map((w) => w.raw), ["yalazun"]);
    assert.deepEqual(left.interjections.map((w) => w.raw), ["yemel"]);
    assert.deepEqual(parseText("yemem.").utterances[0]!.left.interjections.map((w) => w.raw), ["yemem"]);
  });

  it("reads a /y/ span by its @ mark: named calls, unnamed is an interjection", () => {
    assert.deepEqual(parseText("y@<Sam>.").utterances[0]!.left.vocatives.map((w) => w.raw), ["y@<Sam>"]);
    assert.deepEqual(parseText("y<Amen>.").utterances[0]!.left.interjections.map((w) => w.raw), ["y<Amen>"]);
  });

  it("parses unhosted /b/ recipient plus verb", () => {
    const result = parseText("zazozon balazun vezuyol.");
    const units = result.utterances[0]!.bodies[0]!.clause.units;
    assert.equal(units.length, 3);
    assert.equal(units[0]!.kind, "np");
    assert.equal(units[1]!.kind, "np");
    assert.equal(units[2]!.kind, "vp");
    if (units[1]!.kind !== "np") return;
    assert.equal(units[1]!.coord.level, "b");
  });

  it("omits yal when recoverable", () => {
    const result = parseText("zazozon vowurol.");
    assert.equal(result.utterances[0]!.left.force, undefined);
    assert.equal(result.utterances[0]!.left.impliedForce, "yal");
  });

  it("parses yol question", () => {
    const result = parseText("yel zuwen vowurol.");
    assert.ok(result.utterances[0]!.left.force);
    assert.equal(result.utterances[0]!.left.force!.raw, "yel");
  });

  it("parses confirm tag as second utterance", () => {
    const result = parseText("zazozon vowurol. yaol.");
    assert.equal(result.utterances.length, 2);
    assert.equal(result.utterances[1]!.left.polars[0]?.raw, "yaol");
  });

  it("parses yam soft statement", () => {
    const result = parseText("yam zazozon vowurol.");
    assert.equal(result.utterances[0]!.left.force?.raw, "yam");
  });

  it("parses yel command with a period", () => {
    const result = parseText("yol vehehal.");
    assert.equal(result.utterances[0]!.left.force?.raw, "yol");
    assert.equal(result.utterances[0]!.bodies[0]!.punct, "period");
  });

  it("parses polar plus body", () => {
    const result = parseText("yaol zuwen vowurol.");
    assert.equal(result.utterances[0]!.left.polars[0]?.raw, "yaol");
    assert.equal(result.utterances[0]!.bodies[0]!.clause.units.length, 2);
  });
});

describe("parse — multipart names (proper-names.md#multipart-names)", () => {
  const onlyPackage = (text: string) => {
    const unit = parseText(text).utterances[0]!.bodies[0]!.clause.units;
    assert.equal(unit.length, 1);
    assert.equal(unit[0]!.kind, "np");
    const first = unit[0]!;
    const item = first.kind === "np" ? first.coord.parts[0]!.items[0] : undefined;
    return item?.kind === "package" ? item.package : undefined;
  };

  it("keeps a family name on a named citation (alon golowon)", () => {
    assert.deepEqual(onlyPackage("alon golowon")?.adjs.map((a) => a.word.raw), ["golowon"]);
    assert.ok(isGreeting(parseText("alon golowon.").utterances[0]!.bodies[0]!.clause));
    assert.ok(isGreeting(parseText("glolowon alon.").utterances[0]!.bodies[0]!.clause));
    assert.ok(!isGreeting(parseText("alon gobulol.").utterances[0]!.bodies[0]!.clause));
  });

  it("reads zalon golowon. as predication", () => {
    const units = parseText("zalon golowon.").utterances[0]!.bodies[0]!.clause.units;
    assert.deepEqual(units.map((u) => u.kind), ["np", "predicate"]);
  });

  it("puts /ɡ/ after a call on the call", () => {
    const left = parseText("yalon golowon.").utterances[0]!.left;
    assert.deepEqual(left.vocativeAdjs?.[0]?.adjs.map((a) => a.word.raw), ["golowon"]);
    assert.equal(parseText("yalon golowon.").utterances[0]!.bodies.length, 0);
    const gl = parseText("glolowon yalon.").utterances[0]!.left;
    assert.equal(gl.vocativeAdjs?.[0]?.glAdj?.word.raw, "glolowon");
    assert.equal(parseText("yalazun gobulol.").utterances[0]!.left.vocativeAdjs?.[0]?.adjs[0]?.word.raw, "gobulol");
  });

  it("puts the length bid on the given name; /ɡ/ + x + vowel stays ability", () => {
    const left = parseText("aloxon golowon.").utterances[0]!.left;
    assert.equal(left.vocatives[0]?.reading, "greeting");
    assert.equal(left.vocativeAdjs?.[0]?.adjs[0]?.word.raw, "golowon");
    assert.equal(onlyPackage("alon golowoxon.")?.adjs[0]?.word.reading, "ability");
  });

  it("a plain /b/ after the family name receives; a bl- word there is hosted", () => {
    const hosted = onlyPackageAdjs("zalon golowon blalazun vezuyol.");
    assert.equal(hosted?.hosted?.bound.raw, "blalazun");
    assert.equal(onlyPackageAdjs("zalon golowon balazun vezuyol.")?.hosted, undefined);
    const units = parseText("zalon golowon vezuyol balazun.").utterances[0]!.bodies[0]!.clause.units;
    assert.deepEqual(units.map((u) => u.kind), ["np", "vp", "np"]);
  });

  function onlyPackageAdjs(text: string) {
    const unit = parseText(text).utterances[0]!.bodies[0]!.clause.units[0]!;
    const item = unit.kind === "np" ? unit.coord.parts[0]!.items[0] : undefined;
    return item?.kind === "package" ? item.package.adjs[0] : undefined;
  }
});

describe("parse — describing a call or reaction (speech-acts.md#describe-turn-word)", () => {
  const left = (text: string) => parseText(text).utterances[0]!.left;

  it("puts /ɡ/ after a reaction on the reaction", () => {
    assert.deepEqual(left("yemel gelazem.").interjectionMods?.[0]?.adjs.map((a) => a.word.raw), ["gelazem"]);
    assert.equal(parseText("yemel gelazem.").utterances[0]!.bodies.length, 0);
  });

  it("leans a gl- adjective, with its /w/ and hosted /b/, on the call or reaction after it", () => {
    assert.equal(left("glelazem yemel.").interjectionMods?.[0]?.glAdj?.word.raw, "glelazem");
    assert.equal(left("glorel blazozon yemel.").interjectionMods?.[0]?.glAdj?.hosted?.bound.raw, "blazozon");
    const call = left("welazem glolamam yeyenx.").vocativeAdjs?.[0]?.glAdj;
    assert.deepEqual([call?.modifiers.map((m) => m.raw), call?.word.raw], [["welazem"], "glolamam"]);
  });

  it("grades a reaction with /w/ right before it, and keeps /w/ + hook a discourse hook", () => {
    assert.deepEqual(left("welazem yemem.").interjectionMods?.[0]?.w?.map((w) => w.raw), ["welazem"]);
    const hook = left("welazem al zazozon vowurol.");
    assert.deepEqual([hook.hook?.raw, hook.hookModifiers?.map((w) => w.raw)], ["al", ["welazem"]]);
  });

  it("leaves a /ɡ/ after an act word or a period in the body", () => {
    assert.deepEqual(parseText("yalazun yol guyulom.").utterances[0]!.bodies[0]!.clause.units.map((u) => u.kind), ["predicate"]);
    const [utt] = parseText("yemel. gelazem.").utterances;
    assert.equal(utt!.left.interjectionMods, undefined);
    assert.deepEqual(utt!.bodies[0]!.clause.units.map((u) => u.kind), ["predicate"]);
  });

  it("rejects /w/ on a call and describing words on a number cheer or span", () => {
    for (const text of ["welazem yalazun.", "welazem yrawagel.", "yrawagel gelazem.", "y<Amen> gelazem."]) {
      assert.throws(() => parseText(text), /speech-acts\.md#describe-turn-word/, text);
    }
  });
});

describe("parse — joins.md", () => {
  it("parses zuzehal zagorol zam.", () => {
    const result = parseText("zezedel zogozel zam.");
    const unit = result.utterances[0]!.bodies[0]!.clause.units[0]!;
    assert.equal(unit.kind, "np");
    if (unit.kind !== "np") return;
    assert.equal(unit.coord.parts.length, 1);
    assert.equal(unit.coord.parts[0]!.items.length, 2);
    assert.equal(unit.coord.parts[0]!.items[0]!.kind, "package");
    assert.equal(unit.coord.parts[0]!.items[1]!.kind, "package");
    assert.equal(unit.coord.parts[0]!.join?.raw, "zam");
  });

  it("rejects frame echo zual zonedul zuhorel zual", () => {
    assert.throws(() => parseText("zual zonedul zuhorel zual."), SentenceParseError);
  });

  it("parses join scope island", () => {
    const result = parseText("zazozon { zenewuweyenel zal } zam.");
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
    assert.throws(() => parseText("{ } zazozon vowurol."), /scope island needs words/);
    assert.throws(() => parseText("zazozon { } zam."), /scope island needs words/);
  });

  it("parses nested left-associative VP joins", () => {
    const result = parseText("vowurol vezuvel vel veruvol val.");
    const unit = result.utterances[0]!.bodies[0]!.clause.units[0]!;
    assert.equal(unit.kind, "vp");
    if (unit.kind !== "vp") return;
    assert.equal(unit.coord.parts.length, 2);
    assert.equal(unit.coord.parts[0]!.items.length, 2);
    assert.equal(unit.coord.parts[0]!.join?.raw, "vel");
    assert.equal(unit.coord.parts[1]!.items.length, 1);
    assert.equal(unit.coord.parts[1]!.join?.raw, "val");
  });
});

describe("parse — stand-in dependents", () => {
  it("parses theram barl dependent", () => {
    const result = parseText("zazozon guzemel thahum blarl zalazun vowurol.");
    const clause = result.utterances[0]!.bodies[0]!.clause;
    assert.ok(clause.dependent);
    assert.equal(clause.dependent!.orodo.raw, "blarl");
    assert.equal(clause.dependent!.clause.units.length, 2);
  });

  it("parses an evidence clause: an inferred, pattern or deduced channel hosts barl", () => {
    for (const text of [
      "zohel vehohel theyom blarl zazozon vowurol.",
      "zohel vehohel thubol blarl zazozon vowurol.",
      "zohel vehohel thanam blarl zazozon vowurol.",
    ]) {
      const clause = parseText(text).utterances[0]!.bodies[0]!.clause;
      assert.equal(clause.dependent?.orodo.raw, "blarl", text);
      assert.equal(clause.dependent!.clause.units.length, 2, text);
    }
  });

  it("parses deduction: premises joined in the grounds, or under a pole (evidentiality.md#deduction)", () => {
    const asserted = parseText("zazozon vowurol thanal blarl zalazun vezuvel xam zalazun veruvol.").utterances[0]!.bodies[0]!.clause;
    assert.equal(asserted.dependent?.orodo.raw, "blarl");
    const valid = parseText("zazozon vowurol thanam thohem blarl zalazun vezuvel.").utterances[0]!.bodies[0]!.clause;
    assert.equal(valid.dependent?.orodo.raw, "blarl");
  });

  it("parses like (hewem) hosting barl: the model of the simile is an event", () => {
    const clause = parseText("zawulol vavobol hewem blarl zahebal vavobol.").utterances[0]!.bodies[0]!.clause;
    assert.equal(clause.dependent?.orodo.raw, "blarl");
    assert.throws(() => parseText("zawulol vavobol hewem blurl zahebal vavobol."));
  });

  it("keeps clause joins after a stand-in inside its dependent", () => {
    const clause = parseText("zazozon vanam derl zalazun vowurol xel zahelan veruvol.").utterances[0]!.bodies[0]!.clause;
    assert.equal(clause.units.some((unit) => unit.kind === "clauseCoord"), false);
    const dep = clause.dependent;
    assert.equal(dep?.orodo.raw, "derl");
    const coord = dep?.clause.units[0];
    assert.ok(coord && coord.kind === "clauseCoord");
    assert.equal(coord.coord.links.length, 1);
    assert.equal(coord.coord.links[0]!.join.raw, "xel");
    const nested = parseText("zazozon vozuyel thahum blarl zalazun vowurol thahum blarl zahelan vezuvel xal zazozon veruvol.").utterances[0]!.bodies[0]!.clause;
    const inner = nested.dependent?.clause.units[0];
    assert.ok(inner && inner.kind === "clauseCoord");
  });

  it("parses barl after a channel's offset as its grounds, not a recipient", () => {
    const clause = parseText("zohel galewul thubol blral blarl zalazun vudurul.").utterances[0]!.bodies[0]!.clause;
    const host = clause.units.find((unit) => unit.kind === "h");
    assert.ok(host && host.kind === "h");
    assert.equal(host.unit.hosted?.bound.raw, "blral");
    assert.equal(host.unit.hosted?.grounds?.raw, "blarl");
    assert.equal(clause.dependent?.orodo.raw, "blarl");
  });

  it("parses hanem barl purpose dependent", () => {
    const result = parseText("zazozon vowurol hovam blarl zalazun vehohel.");
    const clause = result.utterances[0]!.bodies[0]!.clause;
    assert.ok(clause.dependent);
    assert.equal(clause.dependent!.orodo.raw, "blarl");
    assert.equal(clause.dependent!.clause.units.length, 2);
  });

  it("parses darl object with matrix verb before the opener", () => {
    const result = parseText("zazozon balazun vezuyol darl zezedel veruvol.");
    const clause = result.utterances[0]!.bodies[0]!.clause;
    assert.ok(clause.dependent);
    assert.equal(clause.units.some((u) => u.kind === "vp"), true);
    assert.equal(clause.dependent!.orodo.raw, "darl");
    assert.equal(clause.dependent!.clause.units.length, 2);
  });

  it("parses dorl whether without inner yol", () => {
    const result = parseText("zazozon vayebel derl zalazun vowurol.");
    const clause = result.utterances[0]!.bodies[0]!.clause;
    assert.ok(clause.dependent);
    assert.equal(clause.dependent!.orodo.raw, "derl");
  });
});

describe("parse — comparatives manner scale", () => {
  it("attaches /h/ immediately after zol as SHARED, then the verb", () => {
    const result = parseText("zalazun zazozon zol hahunom vowurol.");
    const units = result.utterances[0]!.bodies[0]!.clause.units;
    assert.equal(units.length, 2);
    assert.equal(units[0]!.kind, "np");
    assert.equal(units[1]!.kind, "vp");
    if (units[0]!.kind !== "np") return;
    const part = units[0]!.coord.parts[0]!;
    assert.equal(part.join?.raw, "zol");
    assert.equal(part.shared.length, 1);
    const shared = part.shared[0]!;
    assert.ok("word" in shared);
    assert.equal(shared.word.raw, "hahunom");
    assert.equal(shared.word.pos, "h");
  });
});

describe("parse — spans", () => {
  it("fills a role slot with a written span as one noun head", () => {
    const units = parseText("zazozon vezuyol d[azozon].").utterances[0]!.bodies[0]!.clause.units;
    const span = units.find((u) => u.kind === "np" && u.coord.level === "d");
    assert.ok(span && span.kind === "np");
    const item = span.coord.parts[0]!.items[0];
    assert.ok(item?.kind === "package");
    assert.equal(item.package.head.raw, "d[azozon]");
  });

  it("anchors a role pointer on a span like any noun (pronouns.md#role-pointers)", () => {
    const result = parseText("zazozon d[azozon] vezuyol. zalazun dwuder vezuyol.");
    const pointer = result.resolve!.anaphors.find((bind) => bind.pronoun.raw === "dwuder");
    assert.equal(pointer?.antecedent?.raw, "d[azozon]");
  });
});

describe("parse — SVO slots", () => {
  it("parses zar damegun vozulal as subject, object, verb (roles.md)", () => {
    const result = parseText("zar duwen vozulal.");
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
    assert.equal(obj.package.head.raw, "duwen");
  });
});

describe("parse — hosted /w/ before /b/", () => {
  it("parses simile with /w/ left of host, then /b/", () => {
    const result = parseText("zazozon welazem hewem bladozal vowurol.");
    const units = result.utterances[0]!.bodies[0]!.clause.units;
    const h = units.find((u) => u.kind === "h");
    assert.ok(h && h.kind === "h");
    assert.equal(h.unit.modifiers[0]?.raw, "welazem");
    assert.equal(h.unit.hosted?.bound.raw, "bladozal");
  });

  it("parses extra-noun hook with restrictor /w/ left of the hook", () => {
    const result = parseText("zodozel vezuvel wal al bohehal.");
    const units = result.utterances[0]!.bodies[0]!.clause.units;
    const hook = units.find((u) => u.kind === "hook");
    assert.ok(hook && hook.kind === "hook");
    assert.equal(hook.modifiers[0]?.raw, "wal");
  });

  it("parses discourse hook with /w/", () => {
    const result = parseText("welazem al zazozon vowurol.");
    assert.equal(result.utterances[0]!.left.hook?.raw, "al");
    assert.equal(result.utterances[0]!.left.hookModifiers?.[0]?.raw, "welazem");
  });
});

describe("parse — /ɡ/ join fences", () => {
  const gCoordOf = (text: string) => {
    const units = parseText(text).utterances[0]!.bodies[0]!.clause.units;
    const unit = units.find((u) => u.kind === "gCoord");
    assert.ok(unit?.kind === "gCoord", text);
    return unit.coord.parts.map((part) => ({
      items: part.items.map((item) => (item.kind === "adj" ? item.adj.word.raw : "{")),
      join: part.join?.raw,
      shared: part.shared.map((s) => ("raw" in s ? s.raw : s.word.raw)),
    }));
  };

  it("keeps a predicative /ɡ/ join as one list (zazozon godozel gul)", () => {
    assert.deepEqual(gCoordOf("zazozon godozel gul."), [{ items: ["godozel"], join: "gul", shared: [] }]);
  });

  it("starts a new /ɡ/ part after a closed /ɡ/ join (g+3 g+5 gal godurom)", () => {
    assert.deepEqual(gCoordOf("g+3 g+5 gal godurom."), [
      { items: ["g+3", "g+5"], join: "gal", shared: [] },
      { items: ["godurom"], join: undefined, shared: [] },
    ]);
  });

  it("keeps an attributive list with an island on the noun", () => {
    const units = parseText("zodozel gerulol { gamezem gul } gelazem gal vowurol.").utterances[0]!.bodies[0]!.clause.units;
    const np = units[0]!;
    assert.ok(np.kind === "np");
    const item = np.coord.parts[0]!.items[0]!;
    assert.ok(item.kind === "package");
    assert.deepEqual(
      item.package.adjCoord?.parts.map((part) => [part.items.map((i) => (i.kind === "adj" ? i.adj.word.raw : "{")), part.join?.raw]),
      [[["gerulol", "{", "gelazem"], "gal"]],
    );
    assert.deepEqual(item.package.adjs.map((a) => a.word.raw), ["gerulol", "gamezem", "gelazem"]);
  });
});

describe("parse — illegal fences", () => {
  it("rejects left fence zam zuzehal zagorol", () => {
    assert.throws(() => parseText("zam zezedel zogozel."), SentenceParseError);
  });

  it("nests A zam B zal as [[A zam] B zal]", () => {
    const result = parseText("zezedel zam zogozel zal vowurol.");
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
    const result = parseText("zodozel gorel blazozon gobulol vowurol.");
    const np = result.utterances[0]!.bodies[0]!.clause.units[0]!;
    assert.ok(np.kind === "np" && np.coord.parts[0]!.items[0]!.kind === "package");
    const pkg = np.coord.parts[0]!.items[0]!.package;
    assert.equal(pkg.adjs.length, 1);
    assert.equal(pkg.adjs[0]!.hosted?.bound.raw, "blazozon");
    assert.equal(pkg.adjs[0]!.hosted?.adjs?.[0]?.word.raw, "gobulol");
  });

  it("attaches a number word after a hosted /b/ on /th/ as its amount (signed offset)", () => {
    const result = parseText("zazozon thevum blagorum g-3 vowurol.");
    const unit = result.utterances[0]!.bodies[0]!.clause.units[1]!;
    assert.ok(unit.kind === "h");
    assert.equal(unit.unit.hosted?.bound.raw, "blagorum");
    assert.equal(unit.unit.hosted?.amount?.raw, "g-3");
  });
});

describe("parse — as-of poles", () => {
  it("parses hosted ledger plus date /b/", () => {
    const result = parseText("zalazun haram henam bl_#22,7 vudurum.");
    const h = result.utterances[0]!.bodies[0]!.clause.units.find((u) => u.kind === "h" && u.unit.word.raw === "henam");
    assert.ok(h && h.kind === "h");
    assert.equal(h.unit.word.overlay?.gloss, "as-of.ledger");
    assert.equal(h.unit.hosted?.bound.raw, "bl_#22,7");
  });

  it("parses stance as-of on /th/ beside a clause as-of on /h/", () => {
    const units = parseText("zalazun thenam bl_#22,7 thomam henam bl_#22,7 vudurul.").utterances[0]!.bodies[0]!.clause.units;
    const th = units.find((u) => u.kind === "h" && u.unit.word.raw === "thenam");
    assert.ok(th && th.kind === "h");
    assert.equal(th.unit.word.overlay?.gloss, "as-of.ledger");
    assert.equal(th.unit.hosted?.bound.raw, "bl_#22,7");
  });

  it("parses a fault pole hosting a stand-in, stacked after only-if", () => {
    parseText("zazozon vowurol thebem thahul blarl zalazun vezuyol.");
    parseText("zonal wawethumel goyom blalazun thomam thahul blarl zalazun vezuyol.");
  });

  it("parses as-of resume without /b/", () => {
    const result = parseText("zazozon henar vowurol.");
    const h = result.utterances[0]!.bodies[0]!.clause.units.find((u) => u.kind === "h");
    assert.ok(h && h.kind === "h");
    assert.equal(h.unit.word.raw, "henar");
    assert.equal(h.unit.hosted, undefined);
  });

  it("rejects as-of resume plus /b/", () => {
    assert.throws(() => parseText("zazozon henar bl_#22,7 vowurol."), SentenceParseError);
  });

  it("rejects as-of introduce without /b/", () => {
    assert.throws(() => parseText("zazozon henam vowurol."), SentenceParseError);
  });

  it("parses /ɡ/ ledger on a noun", () => {
    const result = parseText("zaral genam bl_#22,7.");
    const units = result.utterances[0]!.bodies[0]!.clause.units;
    const pred = units.find((u) => u.kind === "predicate");
    const np = units.find((u) => u.kind === "np");
    if (pred?.kind === "predicate") {
      assert.equal(pred.adj.word.raw, "genam");
      assert.equal(pred.adj.hosted?.bound.raw, "bl_#22,7");
      return;
    }
    assert.ok(np && np.kind === "np");
    const item = np.coord.parts[0]!.items[0];
    assert.equal(item?.kind, "package");
    if (item?.kind !== "package") return;
    const g = item.package.adjs[0];
    assert.equal(g?.word.raw, "genam");
    assert.equal(g?.hosted?.bound.raw, "b_#22,7");
  });

  it("parses /w/ as-of before a shared adjective", () => {
    const result = parseText("zazozon zalazun zol wenam b_#22,7 gamahum.");
    const np = result.utterances[0]!.bodies[0]!.clause.units[0];
    assert.ok(np && np.kind === "np");
    const shared = np.coord.parts[0]!.shared[0];
    assert.ok(shared && "asOf" in shared);
    assert.equal(shared.asOf?.word.raw, "wenam");
    assert.equal(shared.asOf?.bound?.raw, "b_#22,7");
    assert.equal(shared.word.raw, "gamahum");
  });

  it("parses bookmark as-of plus barl dependent", () => {
    const result = parseText("zohel galewum haram theyom bl+ hunom blarl zalazun vudurum.");
    const clause = result.utterances[0]!.bodies[0]!.clause;
    assert.ok(clause.dependent);
    const h = clause.units.find((u) => u.kind === "h" && u.unit.word.raw === "hunom");
    assert.ok(h && h.kind === "h");
    assert.equal(h.unit.hosted?.bound.raw, "blarl");
  });

  it("parses channel plus residue plus as-of", () => {
    const result = parseText("zalazun thevum haram henam bl_#22,7 vudurum.");
    const hs = result.utterances[0]!.bodies[0]!.clause.units.filter((u) => u.kind === "h");
    assert.equal(hs.length, 3);
  });

  it("rejects two as-of /h/ hosts in one clause", () => {
    assert.throws(
      () => parseText("zazozon henam bl_#22,7 hunom bl_#23,7 vowurol."),
      SentenceParseError,
    );
  });

  it("parses event-noun /b/ on as-of", () => {
    const result = parseText("zaral haram henam bludurum.");
    const h = result.utterances[0]!.bodies[0]!.clause.units.find((u) => u.kind === "h" && u.unit.word.raw === "henam");
    assert.ok(h && h.kind === "h");
    assert.equal(h.unit.hosted?.bound.raw, "bludurum");
  });

  it("parses extra-noun resume in as-of /b/", () => {
    const result = parseText("zalazun vowurol el b_#22,7. xalazun haram henam bl=_#22,7 vudurum.");
    const second = result.utterances[0]!.bodies[1]!.clause.units.find((u) => u.kind === "h" && u.unit.word.raw === "henam");
    assert.ok(second && second.kind === "h");
    assert.equal(second.unit.hosted?.bound.raw, "bl=_#22,7");
  });

  it("parses /w/ as-of resume immediately before the adjective", () => {
    const result = parseText("zazozon zalazun zol wenar gamahum.");
    const np = result.utterances[0]!.bodies[0]!.clause.units[0];
    assert.ok(np && np.kind === "np");
    const shared = np.coord.parts[0]!.shared[0];
    assert.ok(shared && "asOf" in shared);
    assert.equal(shared.asOf?.word.raw, "wenar");
    assert.equal(shared.asOf?.bound, undefined);
  });
});

describe("parse — stage 4 resolve", () => {
  it("attaches resolve to parse(text)", () => {
    const result = parseText("zalazun vowurol. zalazur vehohel.");
    assert.ok(result.resolve);
    assert.equal(result.resolve.anaphors[0]?.antecedent?.raw, "zalazun");
  });

  it("marks yol zar vowurol. as fill-ask", () => {
    const result = parseText("yel zar vowurol.");
    assert.equal(result.resolve?.asks[0]?.kind, "fillAsk");
  });

  it("marks a join -r under yol as a fill-ask blank, and a join -l as no blank", () => {
    for (const text of ["yel ol bar zayan vagedal.", "yel var zayan.", "yel har zayan vagedal.", "yel zarx vowurol."]) {
      const ask = parseText(text).resolve?.asks[0];
      assert.equal(ask?.kind, "fillAsk", text);
      assert.equal(ask?.gaps.length, 1, text);
    }
    assert.equal(parseText("yel zal vowurol.").resolve?.asks[0]?.kind, "yesNo");
  });
});

describe("parse — spans.md written fences and closes", () => {
  it("puts a written span in its PoS slot, not only an NP head", () => {
    for (const text of ["zazozon vowurol th(hugowul).", "yul zalazun v[vezohul].", "zalazun vezuyol th(zazozon vozuyel)."]) {
      assert.doesNotThrow(() => parseText(text), text);
    }
  });

  it("keeps the editorial and close-all marks inside the written span", () => {
    for (const text of ["zalazun d[abezum#] vezuyol.", "zalazun d[abezum#|] vezuyol."]) {
      assert.doesNotThrow(() => parseText(text), text);
    }
  });
});

describe("parse — pronouns.md resume with no earlier match", () => {
  it("reads an opening resume of a lexicon stem as the one you both know", () => {
    for (const text of ["zalazun vayebel donor.", "zoher vowurol.", "zodozer vowurol.", "zoyahehar vowurol.", "zalazun vowurolar."]) {
      assert.doesNotThrow(() => parseText(text), text);
    }
    assert.throws(() => parseText("zaber vowurol."), SentenceParseError);
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
      ["zazozon thubom zol guzemel.", "thubom"],
      ["zazozon thagom zol bral vevorol.", "thagom"],
      ["zanal thalom zuol garolem.", "thalom"],
      ["zedudal thudatham zoel gral.", "thudatham"],
      ["zanal thugem zuom garolem.", "thugem"],
      ["zalazun hodaxal zoel hadurom vowurol.", "hodaxal"],
      ["zohehal hwuvol zoel gabobem.", "hwuvol"],
      ["zanal thuwuyom zol gagebem.", "thuwuyom"],
      ["zazozon thabemalazun zol guzemel.", "thabemalazun"],
    ] as const) {
      assert.equal(barOf(text)?.word.raw, raw, text);
    }
    const units = parseText("zazozon dodelx thagom dol gral vagedal.").utterances[0]!.bodies[0]!.clause.units;
    const object = units.find((u) => u.kind === "np" && u.coord.level === "d");
    assert.ok(object?.kind === "np" && object.coord.parts[0]!.items.some((i) => i.kind === "bar" && i.bar.word.raw === "thagom"));
  });

  it("keeps a bar's hosted /b/ and dated offset inside the fence", () => {
    assert.equal(barOf("zanal thebam blalazun zuol gagebem.")?.hosted?.bound.raw, "blalazun");
    const dated = barOf("zazozon thevum blazurom grubal zol guzemel.");
    assert.equal(dated?.hosted?.bound.raw, "blazurom");
    assert.equal(dated?.hosted?.amount?.raw, "grubal");
  });

  it("ranks a closed universal fence against the bar after it", () => {
    for (const text of ["zuam gwuzadamul thubom zol hral vabezum.", "zuan gwuzadamul thubom zol hral vabezum.", "zual gogozel thubom zol guzemel."]) {
      const units = parseText(text).utterances[0]!.bodies[0]!.clause.units;
      const np = units[0]!;
      assert.ok(np.kind === "np", text);
      const [fence, ranked] = np.kind === "np" ? np.coord.parts : [];
      assert.equal(fence?.join?.family.kind === "joinMarker" && fence.join.family.series, "ua", text);
      assert.deepEqual(ranked?.items.map((i) => (i.kind === "bar" ? i.bar.word.raw : i.kind)), ["thubom"], text);
      assert.ok(!units.some((u) => u.kind === "h"), text);
    }
    // Only the `ua` fences rank as one item; `zul` + kind keeps the bar out.
    const units = parseText("zul gogozel thubom zol guzemel.").utterances[0]!.bodies[0]!.clause.units;
    assert.ok(units.some((u) => u.kind === "h" && u.unit.word.raw === "thubom"));
  });

  it("reads an adjective after a bar's hosted /b/ as describing that noun, inside the fence", () => {
    const bar = barOf("zazozon thubom blwozeluyolx guzemel zol gozuyel.");
    assert.equal(bar?.hosted?.bound.raw, "blwozeluyolx");
    assert.deepEqual(bar?.hosted?.adjs?.map((a) => a.word.raw), ["guzemel"]);
    // On the clause too, an adjective after a `/th/` host's `/b/` describes that noun (left-bound.md#complex-chaining).
    const units = parseText("zazozon thebam blalazun guzemel vowurol.").utterances[0]!.bodies[0]!.clause.units;
    assert.ok(units.some((u) => u.kind === "h" && u.unit.hosted?.adjs?.[0]?.word.raw === "guzemel"));
  });

  it("keeps the ranked item's hook + /b/ before its bar inside the fence", () => {
    const part = fence("zanal om buwen thagom zol garolem.")!;
    assert.deepEqual(part.items.map((i) => i.kind), ["package", "bar"]);
    assert.equal(part.items[0]!.kind === "package" && part.items[0]!.package.adjs[0]?.hosted?.bound.raw, "buwen");
  });

  it("reads a stance word outside the fence on the claim", () => {
    const units = parseText("zazozon zol guzemel thubom.").utterances[0]!.bodies[0]!.clause.units;
    assert.deepEqual(units.map((u) => u.kind), ["np", "h"]);
    assert.ok(units[0]!.kind === "np" && units[0]!.coord.parts[0]!.items.every((i) => i.kind === "package"));
  });

  it("ends the sentence at a bar's barl: the next words are the grounds", () => {
    const clause = parseText("zazozon theyom blarl zol guzemel zalazun veyamul.").utterances[0]!.bodies[0]!.clause;
    assert.equal(clause.units.length, 1);
    assert.deepEqual(clause.dependent?.clause.units.map((u) => u.kind), ["np", "vp"]);
  });
});

describe("parse — spans.md /y/ spans", () => {
  it("reads a written /y/ span by its @ mark: named calls, unnamed reacts", () => {
    assert.deepEqual(parseText("y@<Sam> yel zazozon vowurol.").utterances[0]!.left.vocatives.map((w) => w.raw), ["y@<Sam>"]);
    assert.deepEqual(parseText("y<Amen> zazozon vowurol.").utterances[0]!.left.interjections.map((w) => w.raw), ["y<Amen>"]);
  });

  it("takes a sentence linker after a written /y/ span", () => {
    assert.equal(parseText("y@<Sam> xezem zazozon vowurol.").utterances[0]!.bodies[0]!.linker?.raw, "xezem");
  });

  it("puts a written /y/ cite at the left edge too", () => {
    assert.deepEqual(parseText("y[azozon] yel zalazun vowurol.").utterances[0]!.left.interjections.map((w) => w.raw), ["y[azozon]"]);
  });

  it("sets the topic with an /x/ cite or opaque span", () => {
    assert.equal(parseText("x@<Sam> zalen vowurol.").utterances[0]!.bodies[0]!.linker?.raw, "x@<Sam>");
    assert.equal(parseText("x<kimchi> zalen gamezem.").utterances[0]!.bodies[0]!.linker?.raw, "x<kimchi>");
    assert.equal(parseText("x@[onuren alazun] zalen vozuyel.").utterances[0]!.bodies[0]!.linker?.raw, "x@[onuren alazun]");
  });
});

describe("parse — spans.md mention marker", () => {
  it("reads a gl- word right before a span as the mention marker", () => {
    const units = parseText("glegol z<kimchi> gamezem.").utterances[0]!.bodies[0]!.clause.units;
    const np = units[0]!;
    assert.ok(np.kind === "np");
    const item = np.coord.parts[0]!.items[0];
    assert.ok(item?.kind === "package");
    assert.equal(item.package.glAdj?.word.reading, "mention");
    assert.equal(item.package.glAdj?.word.overlay?.gloss, "MENTION");
  });

  it("reads -n as the name-string marker", () => {
    const np = parseText("glegon d<Hamlet> vuyugum.").utterances[0]!.bodies[0]!.clause.units.find((u) => u.kind === "np" && u.coord.level === "d")!;
    const item = np.kind === "np" ? np.coord.parts[0]!.items[0] : undefined;
    assert.ok(item?.kind === "package");
    assert.equal(item.package.glAdj?.word.overlay?.gloss, "NAME.MENTION");
  });

  it("puts the marker before a topic span", () => {
    const body = parseText("glegol x<kimchi> zalen gamezem.").utterances[0]!.bodies[0]!;
    assert.equal(body.topicMarker?.raw, "glegol");
    assert.equal(body.linker?.raw, "x<kimchi>");
  });

  it("lets a marked topic span be the whole sentence", () => {
    const body = parseText("glegol x<kimchi>.").utterances[0]!.bodies[0]!;
    assert.equal(body.topicMarker?.raw, "glegol");
    assert.equal(body.linker?.raw, "x<kimchi>");
  });

  it("keeps the same spelling an ordinary adjective anywhere else", () => {
    const word = parseText("glegol zodozel vowurol.").utterances[0]!.bodies[0]!.clause.units[0]!;
    assert.ok(word.kind === "np");
    const item = word.coord.parts[0]!.items[0];
    assert.ok(item?.kind === "package");
    assert.equal(item.package.glAdj?.word.reading !== "mention", true);
  });
});

describe("parse — contrary to a stance (uom + /th/)", () => {
  const frameOf = (text: string) => {
    const units = parseText(text).utterances[0]!.bodies[0]!.clause.units;
    const hook = units.find((unit) => unit.kind === "hook");
    assert.ok(hook && hook.kind === "hook", text);
    return { hook, units };
  };

  it("holds the stance as the hook's frame, not a stance on the claim", () => {
    for (const text of [
      "zazozon vowurol uom thagom.",
      "zazozon vowurol uom thogem.",
      "zazozon vowurol uom thalom.",
      "zazozon vowurol uom thebam.",
      "zazozon vowurol uom thuwuyom.",
      "zazozon vowurol uom thebamalazun.",
    ]) {
      const { hook, units } = frameOf(text);
      assert.equal(hook.job, "frame", text);
      assert.equal(hook.frame?.word.pos, "th", text);
      assert.ok(!units.some((unit) => unit.kind === "h"), text);
    }
    for (const text of ["zazozon vowurol uom hwuvul.", "zazozon vowurol uom hwuvol."]) {
      const { hook, units } = frameOf(text);
      assert.equal(hook.job, "frame", text);
      assert.equal(hook.frame?.word.family.kind, "say", text);
      assert.ok(!units.some((unit) => unit.kind === "h"), text);
    }
  });

  it("holds WANT, PLAN or DECISION after a holder as part of the frame", () => {
    for (const held of ["thalom", "thagom", "thogem"]) {
      const { hook, units } = frameOf(`zazozon vowurol uom theyomazozon ${held}.`);
      assert.equal(hook.frame?.word.raw, "theyomazozon", held);
      assert.equal(hook.heldIntention?.raw, held);
      assert.ok(!units.some((unit) => unit.kind === "h"), held);
    }
  });

  it("keeps the stance's hosted /b/ inside the frame", () => {
    const { hook } = frameOf("zazozon vezuyol uom hwuvom blalazun.");
    assert.equal(hook.frame?.word.raw, "hwuvom");
    assert.equal(hook.frame?.hosted?.bound.raw, "blalazun");
  });

  it("takes the frame at the left edge too", () => {
    const result = parseText("uom hwuvul zazozon vowurol.");
    assert.equal(result.utterances[0]!.left.hook, undefined);
    const { hook } = frameOf("uom hwuvul zazozon vowurol.");
    assert.equal(hook.frame?.word.raw, "hwuvul");
  });

  it("leaves a stance elsewhere in the clause on the claim", () => {
    const { hook, units } = frameOf("zazozon vowurol uom hwuvul hwuvam.");
    assert.equal(hook.frame?.word.raw, "hwuvul");
    const claim = units.filter((unit) => unit.kind === "h");
    assert.deepEqual(claim.map((unit) => unit.kind === "h" && unit.unit.word.raw), ["hwuvam"]);
  });

  it("keeps uom + /b/ as an extra noun", () => {
    const { hook } = frameOf("zazozon vowurol uom berulal.");
    assert.equal(hook.job, "extraNoun");
    assert.equal(hook.frame, undefined);
  });
});

describe("parse — whose plan or decision (holder)", () => {
  const hUnits = (text: string) =>
    parseText(text).utterances[0]!.bodies[0]!.clause.units.flatMap((unit) => (unit.kind === "h" ? [unit.unit] : []));

  it("gives someone else's PLAN or DECISION through a holder, not a /b/", () => {
    for (const mood of ["thagom", "thogem"]) {
      const [holder, word] = hUnits(`zazozon theyomalazun ${mood} vowurol.`);
      assert.equal(holder?.word.raw, "theyomalazun", mood);
      assert.equal(word?.word.raw, mood);
      assert.equal(word?.hosted, undefined, mood);
    }
  });

  it("keeps PLAN's /b/ for a later offset", () => {
    const [plan] = hUnits("zazozon thagom blral vowurol.");
    assert.equal(plan?.hosted?.bound.raw, "blral");
  });
});

describe("negation scope at a fence or a pole", () => {
  it("reads zual + kind + zul as not every K (universals-domains.md#not-every)", () => {
    const units = parseText("zual gogozel zul vezuvel.").utterances[0]!.bodies[0]!.clause.units;
    const np = units[0]!;
    assert.equal(np.kind, "np");
    if (np.kind !== "np") return;
    assert.deepEqual(np.coord.parts.map((part) => part.join?.raw), ["zual", "zul"]);
    assert.equal(np.coord.parts[0]!.shared[0]!.word.raw, "gogozel");
  });

  it("keeps a stance join before barl in the main sentence and barl on the pole", () => {
    const clause = parseText("zazozon veduyol thanam thohem thul blarl zazozon gwozeduyol.").utterances[0]!.bodies[0]!.clause;
    const hs = clause.units.flatMap((u) => (u.kind === "h" ? [u.unit] : []));
    assert.deepEqual(hs.map((h) => h.word.raw), ["thanam", "thohem", "thul"]);
    assert.equal(hs[1]!.hosted?.bound.raw, "blarl");
    assert.equal(hs[1]!.hosted?.afterJoin, true);
    assert.equal(clause.dependent?.orodo.raw, "blarl");
  });

  it("leaves barl off a pole that already has its /b/", () => {
    const clause = parseText("zazozon vowurol thahum blerulal thul barl zalazun veruvol.").utterances[0]!.bodies[0]!.clause;
    const pole = clause.units.find((u) => u.kind === "h" && u.unit.word.raw === "thahum");
    assert.equal(pole?.kind === "h" && pole.unit.hosted?.bound.raw, "blerulal");
  });
});

describe("parse — one tree per sentence (syntactic-unambiguity batch 5a)", () => {
  const units = (text: string) => parseText(text).utterances[0]!.bodies[0]!.clause.units;

  it("reads a fronted hook as glue unless a /b/ word comes right after it", () => {
    assert.equal(parseText("al zazozon vowurol.").utterances[0]!.left.hook?.raw, "al");
    const since = parseText("ul barl zalazun vezuvel.").utterances[0]!;
    assert.equal(since.left.hook, undefined);
    const [hook] = since.bodies[0]!.clause.units;
    assert.ok(hook?.kind === "hook" && hook.job === "extraNoun");
    assert.ok(since.bodies[0]!.clause.dependent);
  });

  it("keeps an in-clause hook after a written act word", () => {
    const utterance = parseText("yal al zazozon vowurol.").utterances[0]!;
    assert.equal(utterance.left.hook, undefined);
    assert.equal(utterance.bodies[0]!.clause.units[0]!.kind, "hook");
  });

  it("gives a plain adjective after a call to the call", () => {
    const utterance = parseText("yalon golowon.").utterances[0]!;
    assert.deepEqual(utterance.left.vocativeAdjs?.[0]?.adjs.map((a) => a.word.raw), ["golowon"]);
    assert.equal(utterance.bodies.length, 0);
  });

  it("fills a hosted /b/ slot with the list that starts right after the host", () => {
    const [, , h] = units("zalazun vehohel hedam bledavol blawahol bal.");
    assert.ok(h?.kind === "h");
    assert.deepEqual(h.unit.hosted?.boundJoin?.members.map((m) => m.raw), ["blawahol"]);
    assert.equal(h.unit.hosted?.boundJoin?.join.raw, "bal");
  });

  it("puts words between joined verbs on the later verb, and words before the first verb on the clause", () => {
    const list = units("zazozon vowurol dahelan vayebel val.");
    assert.equal(list.length, 2);
    const vp = list[1]!;
    assert.ok(vp.kind === "vp");
    assert.equal(vp.coord.parts[0]!.itemUnits?.[0]?.verb.raw, "vayebel");
    assert.deepEqual(units("zazozon dalazun venamol vul.").map((u) => u.kind), ["np", "np", "vp"]);
  });

  it("shares an /h/ after a verb join, but not a /th/ stance", () => {
    const shared = units("zazozon vowurol veruvol val hahunom.")[1]!;
    assert.ok(shared.kind === "vp");
    assert.deepEqual(shared.coord.parts[0]!.shared.map((s) => s.word.raw), ["hahunom"]);
    assert.deepEqual(units("zalazun vudurul vul thewom blazozon.").map((u) => u.kind), ["np", "vp", "h"]);
  });

  it("gives barl after a stance join to the pole", () => {
    const clause = parseText("zazozon vowurol thahum thul blarl zalazun veruvol.").utterances[0]!.bodies[0]!.clause;
    assert.ok(clause.dependent);
    assert.ok(!clause.units.some((u) => u.kind === "np" && u.coord.level === "b"));
  });

  it("ranks a closed ua fence as one item only right after its join", () => {
    const [z] = units("zanal om buwen thagom zol garolem.");
    assert.ok(z?.kind === "np");
    assert.equal(z.coord.parts.length, 1);
    assert.equal(z.coord.parts[0]!.items.length, 2);
    // Right after a closed `ua` fence, the bar starts a part of its own that ranks the whole fence.
    const [fence] = units("zuam gwuzadamul thubom zol hral vabezum.");
    assert.ok(fence?.kind === "np");
    assert.deepEqual(fence.coord.parts.map((p) => p.items.map((i) => i.kind)), [[], ["bar"]]);
  });
});

describe("parse — one tree per sentence (syntactic-unambiguity batch 5b)", () => {
  const units = (text: string) => parseText(text).utterances[0]!.bodies[0]!.clause.units;

  it("gives a hook and its /b/ right before a join word to the last item", () => {
    const [z] = units("zodozel om bazozor zal vowurol.");
    assert.ok(z?.kind === "np");
    assert.equal(z.coord.parts.length, 1);
    assert.deepEqual(z.coord.parts[0]!.items.map((i) => i.kind === "package" && i.package.adjs.map((a) => a.word.raw)), [["om"]]);
  });

  it("ends the main clause at a stand-in, so a stance join after barl opens the grounds", () => {
    const clause = parseText("zazozon vowurol thahum blarl thul zalazun veruvol.").utterances[0]!.bodies[0]!.clause;
    assert.deepEqual(clause.units.map((u) => u.kind), ["np", "vp", "h"]);
    assert.deepEqual(clause.dependent?.clause.units.map((u) => u.kind), ["h", "np", "vp"]);
  });

  it("leans a gl- adjective on the noun past the adjectives that describe its /b/", () => {
    const [z, b] = units("glorel blazozon gorel zodozel balazun vowurol.");
    assert.ok(z?.kind === "np" && z.coord.level === "z");
    assert.ok(b?.kind === "np" && b.coord.level === "b");
  });

  it("takes an asking tag as a turn with no body", () => {
    const tag = parseText("yel yaol.").utterances[0]!;
    assert.deepEqual(tag.left.polars.map((p) => p.raw), ["yaol"]);
    assert.equal(tag.bodies.length, 0);
  });

  it("still takes a clearing linker alone", () => {
    assert.equal(parseText("xevewom.").utterances[0]!.bodies[0]!.linker?.raw, "xevewom");
  });
});
