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
  it("parses zuzazon voworel.", () => {
    const result = parseText("zuzazon voworel.");
    assert.equal(result.utterances.length, 1);
    const body = result.utterances[0]!.bodies[0]!;
    assert.equal(body.clause.units.length, 2);
    assert.equal(body.clause.units[0]!.kind, "np");
    assert.equal(body.clause.units[1]!.kind, "vp");
  });

  it("parses zezehal gumovol. as classification predicate", () => {
    const result = parseText("zezodol gubulol.");
    const units = result.utterances[0]!.bodies[0]!.clause.units;
    assert.equal(units.length, 2);
    assert.equal(units[0]!.kind, "np");
    assert.equal(units[1]!.kind, "predicate");
  });

  it("parses zuzazon godeyel. as subject + predicate adjective", () => {
    const result = parseText("zuzazon godeyel.");
    const units = result.utterances[0]!.bodies[0]!.clause.units;
    assert.equal(units.length, 2);
    assert.equal(units[1]!.kind, "predicate");
  });

  it("parses citation greeting uzazon.", () => {
    const result = parseText("uzazon.");
    assert.equal(result.utterances.length, 1);
    assert.equal(result.utterances[0]!.bodies[0]!.clause.units[0]!.kind, "np");
  });

  it("parses greeting bid uzazoxan. as vocative-shaped left edge", () => {
    const result = parseText("uzazoxan.");
    assert.equal(result.utterances[0]!.left.vocatives[0]?.raw, "uzazoxan");
    assert.equal(result.utterances[0]!.bodies.length, 0);
  });

  it("parses vocative yolozun.", () => {
    const result = parseText("yolozun.");
    assert.equal(result.utterances[0]!.left.vocatives[0]?.raw, "yolozun");
  });

  it("reads /y/ -l / -m as an interjection and -n as a vocative", () => {
    const left = parseText("yolozun yezul zolozun voworel.").utterances[0]!.left;
    assert.deepEqual(left.vocatives.map((w) => w.raw), ["yolozun"]);
    assert.deepEqual(left.interjections.map((w) => w.raw), ["yezul"]);
    assert.deepEqual(parseText("yezum.").utterances[0]!.left.interjections.map((w) => w.raw), ["yezum"]);
  });

  it("reads a /y/ span by its @ mark: named calls, unnamed is an interjection", () => {
    assert.deepEqual(parseText("y@<Sam>.").utterances[0]!.left.vocatives.map((w) => w.raw), ["y@<Sam>"]);
    assert.deepEqual(parseText("y<Amen>.").utterances[0]!.left.interjections.map((w) => w.raw), ["y<Amen>"]);
  });

  it("parses unhosted /b/ recipient plus verb", () => {
    const result = parseText("zuzazon bolozun vezeyel.");
    const units = result.utterances[0]!.bodies[0]!.clause.units;
    assert.equal(units.length, 3);
    assert.equal(units[0]!.kind, "np");
    assert.equal(units[1]!.kind, "np");
    assert.equal(units[2]!.kind, "vp");
    if (units[1]!.kind !== "np") return;
    assert.equal(units[1]!.coord.level, "b");
  });

  it("omits yal when recoverable", () => {
    const result = parseText("zuzazon voworel.");
    assert.equal(result.utterances[0]!.left.force, undefined);
    assert.equal(result.utterances[0]!.left.impliedForce, "yal");
  });

  it("parses yol question", () => {
    const result = parseText("yol zamun voworel.");
    assert.ok(result.utterances[0]!.left.force);
    assert.equal(result.utterances[0]!.left.force!.raw, "yol");
  });

  it("parses confirm tag as second utterance", () => {
    const result = parseText("zuzazon voworel. yael.");
    assert.equal(result.utterances.length, 2);
    assert.equal(result.utterances[1]!.left.polars[0]?.raw, "yael");
  });

  it("parses yam soft statement", () => {
    const result = parseText("yam zuzazon voworel.");
    assert.equal(result.utterances[0]!.left.force?.raw, "yam");
  });

  it("parses yel command with a period", () => {
    const result = parseText("yel vahohol.");
    assert.equal(result.utterances[0]!.left.force?.raw, "yel");
    assert.equal(result.utterances[0]!.bodies[0]!.punct, "period");
  });

  it("parses polar plus body", () => {
    const result = parseText("yael zamun voworel.");
    assert.equal(result.utterances[0]!.left.polars[0]?.raw, "yael");
    assert.equal(result.utterances[0]!.bodies[0]!.clause.units.length, 2);
  });
});

describe("parse — multipart names (word-endings.md#multipart-names)", () => {
  const onlyPackage = (text: string) => {
    const unit = parseText(text).utterances[0]!.bodies[0]!.clause.units;
    assert.equal(unit.length, 1);
    assert.equal(unit[0]!.kind, "np");
    const first = unit[0]!;
    const item = first.kind === "np" ? first.coord.parts[0]!.items[0] : undefined;
    return item?.kind === "package" ? item.package : undefined;
  };

  it("keeps a family name on a named citation (ohun gulowon)", () => {
    assert.deepEqual(onlyPackage("ohun gulowon")?.adjs.map((a) => a.word.raw), ["gulowon"]);
    assert.ok(isGreeting(parseText("ohun gulowon.").utterances[0]!.bodies[0]!.clause));
    assert.ok(isGreeting(parseText("glulowon ohun.").utterances[0]!.bodies[0]!.clause));
    assert.ok(!isGreeting(parseText("ohun gubulol.").utterances[0]!.bodies[0]!.clause));
  });

  it("reads zohun gulowon. as predication", () => {
    const units = parseText("zohun gulowon.").utterances[0]!.bodies[0]!.clause.units;
    assert.deepEqual(units.map((u) => u.kind), ["np", "predicate"]);
  });

  it("puts /ɡ/ after a call on the call", () => {
    const left = parseText("yohun gulowon.").utterances[0]!.left;
    assert.deepEqual(left.vocativeAdjs?.[0]?.adjs.map((a) => a.word.raw), ["gulowon"]);
    assert.equal(parseText("yohun gulowon.").utterances[0]!.bodies.length, 0);
    const gl = parseText("glulowon yohun.").utterances[0]!.left;
    assert.equal(gl.vocativeAdjs?.[0]?.glAdj?.word.raw, "glulowon");
    assert.equal(parseText("yolozun gubulol.").utterances[0]!.left.vocativeAdjs?.[0]?.adjs[0]?.word.raw, "gubulol");
  });

  it("puts the length bid on the given name; /ɡ/ + x + vowel stays ability", () => {
    const left = parseText("ohuxen gulowon.").utterances[0]!.left;
    assert.equal(left.vocatives[0]?.reading, "greeting");
    assert.equal(left.vocativeAdjs?.[0]?.adjs[0]?.word.raw, "gulowon");
    assert.equal(onlyPackage("ohun gulowoxen.")?.adjs[0]?.word.reading, "ability");
  });

  it("a /b/ right after the family name is hosted; after the verb it receives", () => {
    const hosted = onlyPackageAdjs("zohun gulowon bolozun vezeyel.");
    assert.equal(hosted?.hosted?.bound.raw, "bolozun");
    const units = parseText("zohun gulowon vezeyel bolozun.").utterances[0]!.bodies[0]!.clause.units;
    assert.deepEqual(units.map((u) => u.kind), ["np", "vp", "np"]);
  });

  function onlyPackageAdjs(text: string) {
    const unit = parseText(text).utterances[0]!.bodies[0]!.clause.units[0]!;
    const item = unit.kind === "np" ? unit.coord.parts[0]!.items[0] : undefined;
    return item?.kind === "package" ? item.package.adjs[0] : undefined;
  }
});

describe("parse — describing a call or reaction (speech-moves.md#describe-turn-word)", () => {
  const left = (text: string) => parseText(text).utterances[0]!.left;

  it("puts /ɡ/ after a reaction on the reaction", () => {
    assert.deepEqual(left("yezul geluzom.").interjectionMods?.[0]?.adjs.map((a) => a.word.raw), ["geluzom"]);
    assert.equal(parseText("yezul geluzom.").utterances[0]!.bodies.length, 0);
  });

  it("leans a gl- adjective, with its /w/ and hosted /b/, on the call or reaction after it", () => {
    assert.equal(left("gleluzom yezul.").interjectionMods?.[0]?.glAdj?.word.raw, "gleluzom");
    assert.equal(left("glugol buzazon yezul.").interjectionMods?.[0]?.glAdj?.hosted?.bound.raw, "buzazon");
    const call = left("weluzom glelamam yobenx.").vocativeAdjs?.[0]?.glAdj;
    assert.deepEqual([call?.modifiers.map((m) => m.raw), call?.word.raw], [["weluzom"], "glelamam"]);
  });

  it("grades a reaction with /w/ right before it, and keeps /w/ + hook a discourse hook", () => {
    assert.deepEqual(left("weluzom yezum.").interjectionMods?.[0]?.w?.map((w) => w.raw), ["weluzom"]);
    const hook = left("weluzom al zuzazon voworel.");
    assert.deepEqual([hook.hook?.raw, hook.hookModifiers?.map((w) => w.raw)], ["al", ["weluzom"]]);
  });

  it("leaves a /ɡ/ after an act word or a period in the body", () => {
    assert.deepEqual(parseText("yolozun yel guyelom.").utterances[0]!.bodies[0]!.clause.units.map((u) => u.kind), ["predicate"]);
    const [utt] = parseText("yezul. geluzom.").utterances;
    assert.equal(utt!.left.interjectionMods, undefined);
    assert.deepEqual(utt!.bodies[0]!.clause.units.map((u) => u.kind), ["predicate"]);
  });

  it("rejects /w/ on a call and describing words on a number cheer or span", () => {
    for (const text of ["weluzom yolozun.", "weluzom yrabarel.", "yrabarel geluzom.", "y<Amen> geluzom."]) {
      assert.throws(() => parseText(text), /speech-moves\.md#describe-turn-word/, text);
    }
  });
});

describe("parse — joins.md", () => {
  it("parses zezehal zagarel zam.", () => {
    const result = parseText("zezodol zegazol zam.");
    const unit = result.utterances[0]!.bodies[0]!.clause.units[0]!;
    assert.equal(unit.kind, "np");
    if (unit.kind !== "np") return;
    assert.equal(unit.coord.parts.length, 1);
    assert.equal(unit.coord.parts[0]!.items.length, 2);
    assert.equal(unit.coord.parts[0]!.items[0]!.kind, "package");
    assert.equal(unit.coord.parts[0]!.items[1]!.kind, "package");
    assert.equal(unit.coord.parts[0]!.join?.raw, "zam");
  });

  it("rejects frame echo zual zanudol zoharol zual", () => {
    assert.throws(() => parseText("zual zanudol zoharol zual."), SentenceParseError);
  });

  it("parses join scope island", () => {
    const result = parseText("zuzazon { zenenol zal } zam.");
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
    assert.throws(() => parseText("{ } zuzazon voworel."), /scope island needs words/);
    assert.throws(() => parseText("zuzazon { } zam."), /scope island needs words/);
  });

  it("parses nested left-associative VP joins", () => {
    const result = parseText("voworel vuzevol vol varuvel val.");
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
    const result = parseText("zuzazon gozumol thavem barl zolozun voworel.");
    const clause = result.utterances[0]!.bodies[0]!.clause;
    assert.ok(clause.dependent);
    assert.equal(clause.dependent!.orodo.raw, "barl");
    assert.equal(clause.dependent!.clause.units.length, 2);
  });

  it("parses an evidence clause: an inferred, pattern or deduced channel hosts barl", () => {
    for (const text of [
      "zoyel vehuhol thunem barl zuzazon voworel.",
      "zoyel vehuhol thobal barl zuzazon voworel.",
      "zoyel vehuhol thugum barl zuzazon voworel.",
    ]) {
      const clause = parseText(text).utterances[0]!.bodies[0]!.clause;
      assert.equal(clause.dependent?.orodo.raw, "barl", text);
      assert.equal(clause.dependent!.clause.units.length, 2, text);
    }
  });

  it("parses deduction: premises joined in the grounds, or under a pole (knowing.md#deduction)", () => {
    const asserted = parseText("zuzazon voworel thugul barl zolozun vuzevol xam zolozun varuvel.").utterances[0]!.bodies[0]!.clause;
    assert.equal(asserted.dependent?.orodo.raw, "barl");
    const valid = parseText("zuzazon voworel thugum thoyem barl zolozun vuzevol.").utterances[0]!.bodies[0]!.clause;
    assert.equal(valid.dependent?.orodo.raw, "barl");
  });

  it("parses like (humum) hosting barl: the model of the simile is an event", () => {
    const clause = parseText("zewolol vevubel humum barl zahebol vevubel.").utterances[0]!.bodies[0]!.clause;
    assert.equal(clause.dependent?.orodo.raw, "barl");
    assert.throws(() => parseText("zewolol vevubel humum burl zahebol vevubel."));
  });

  it("keeps clause joins after a stand-in inside its dependent", () => {
    const clause = parseText("zuzazon vugum dorl zolozun voworel xol zehalon varuvel.").utterances[0]!.bodies[0]!.clause;
    assert.equal(clause.units.some((unit) => unit.kind === "clauseCoord"), false);
    const dep = clause.dependent;
    assert.equal(dep?.orodo.raw, "dorl");
    const coord = dep?.clause.units[0];
    assert.ok(coord && coord.kind === "clauseCoord");
    assert.equal(coord.coord.links.length, 1);
    assert.equal(coord.coord.links[0]!.join.raw, "xol");
    const nested = parseText("zuzazon vezeyol thavem barl zolozun voworel thavem barl zehalon vuzevol xal zuzazon varuvel.").utterances[0]!.bodies[0]!.clause;
    const inner = nested.dependent?.clause.units[0];
    assert.ok(inner && inner.kind === "clauseCoord");
  });

  it("parses barl after a channel's offset as its grounds, not a recipient", () => {
    const clause = parseText("zoyel gulawul thobal bral barl zolozun veyorul.").utterances[0]!.bodies[0]!.clause;
    const host = clause.units.find((unit) => unit.kind === "h");
    assert.ok(host && host.kind === "h");
    assert.equal(host.unit.hosted?.bound.raw, "bral");
    assert.equal(host.unit.hosted?.grounds?.raw, "barl");
    assert.equal(clause.dependent?.orodo.raw, "barl");
  });

  it("parses hagom barl purpose dependent", () => {
    const result = parseText("zuzazon voworel hogom barl zolozun vehuhol.");
    const clause = result.utterances[0]!.bodies[0]!.clause;
    assert.ok(clause.dependent);
    assert.equal(clause.dependent!.orodo.raw, "barl");
    assert.equal(clause.dependent!.clause.units.length, 2);
  });

  it("parses darl object with matrix verb before the opener", () => {
    const result = parseText("zuzazon bolozun vezeyel darl zezodol varuvel.");
    const clause = result.utterances[0]!.bodies[0]!.clause;
    assert.ok(clause.dependent);
    assert.equal(clause.units.some((u) => u.kind === "vp"), true);
    assert.equal(clause.dependent!.orodo.raw, "darl");
    assert.equal(clause.dependent!.clause.units.length, 2);
  });

  it("parses dorl whether without inner yol", () => {
    const result = parseText("zuzazon vanobol dorl zolozun voworel.");
    const clause = result.utterances[0]!.bodies[0]!.clause;
    assert.ok(clause.dependent);
    assert.equal(clause.dependent!.orodo.raw, "dorl");
  });
});

describe("parse — comparatives manner scale", () => {
  it("attaches /h/ immediately after zel as SHARED, then the verb", () => {
    const result = parseText("zolozun zuzazon zel huhavem voworel.");
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
    assert.equal(shared.word.raw, "huhavem");
    assert.equal(shared.word.pos, "h");
  });
});

describe("parse — spans", () => {
  it("fills a role slot with a written span as one noun head", () => {
    const units = parseText("zuzazon vezeyel d[uzazon].").utterances[0]!.bodies[0]!.clause.units;
    const span = units.find((u) => u.kind === "np" && u.coord.level === "d");
    assert.ok(span && span.kind === "np");
    const item = span.coord.parts[0]!.items[0];
    assert.ok(item?.kind === "package");
    assert.equal(item.package.head.raw, "d[uzazon]");
  });

  it("anchors a role pointer on a span like any noun (pronouns.md#role-pointers)", () => {
    const result = parseText("zuzazon d[uzazon] vezeyel. zolozun duxar vezeyel.");
    const pointer = result.resolve!.anaphors.find((bind) => bind.pronoun.raw === "duxar");
    assert.equal(pointer?.antecedent?.raw, "d[uzazon]");
  });
});

describe("parse — SVO slots", () => {
  it("parses zar damegun vozulal as subject, object, verb (roles.md)", () => {
    const result = parseText("zar damun vozulal.");
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
    assert.equal(obj.package.head.raw, "damun");
  });
});

describe("parse — hosted /w/ before /b/", () => {
  it("parses simile with /w/ left of host, then /b/", () => {
    const result = parseText("zuzazon weluzom humum budazal voworel.");
    const units = result.utterances[0]!.bodies[0]!.clause.units;
    const h = units.find((u) => u.kind === "h");
    assert.ok(h && h.kind === "h");
    assert.equal(h.unit.modifiers[0]?.raw, "weluzom");
    assert.equal(h.unit.hosted?.bound.raw, "budazal");
  });

  it("parses extra-noun hook with restrictor /w/ left of the hook", () => {
    const result = parseText("zodozol vuzevol wal al bawuhol.");
    const units = result.utterances[0]!.bodies[0]!.clause.units;
    const hook = units.find((u) => u.kind === "hook");
    assert.ok(hook && hook.kind === "hook");
    assert.equal(hook.modifiers[0]?.raw, "wal");
  });

  it("parses discourse hook with /w/", () => {
    const result = parseText("weluzom al zuzazon voworel.");
    assert.equal(result.utterances[0]!.left.hook?.raw, "al");
    assert.equal(result.utterances[0]!.left.hookModifiers?.[0]?.raw, "weluzom");
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

  it("keeps a predicative /ɡ/ join as one list (zuzazon godozol gul)", () => {
    assert.deepEqual(gCoordOf("zuzazon godozol gul."), [{ items: ["godozol"], join: "gul", shared: [] }]);
  });

  it("starts a new /ɡ/ part after a closed /ɡ/ join (g+3 g+5 gal gadarem)", () => {
    assert.deepEqual(gCoordOf("g+3 g+5 gal gadarem."), [
      { items: ["g+3", "g+5"], join: "gal", shared: [] },
      { items: ["gadarem"], join: undefined, shared: [] },
    ]);
  });

  it("keeps an attributive list with an island on the noun", () => {
    const units = parseText("zodozol gerolol { gumazom gul } geluzom gal voworel.").utterances[0]!.bodies[0]!.clause.units;
    const np = units[0]!;
    assert.ok(np.kind === "np");
    const item = np.coord.parts[0]!.items[0]!;
    assert.ok(item.kind === "package");
    assert.deepEqual(
      item.package.adjCoord?.parts.map((part) => [part.items.map((i) => (i.kind === "adj" ? i.adj.word.raw : "{")), part.join?.raw]),
      [[["gerolol", "{", "geluzom"], "gal"]],
    );
    assert.deepEqual(item.package.adjs.map((a) => a.word.raw), ["gerolol", "gumazom", "geluzom"]);
  });
});

describe("parse — illegal fences", () => {
  it("rejects left fence zam zezehal zagarel", () => {
    assert.throws(() => parseText("zam zezodol zegazol."), SentenceParseError);
  });

  it("nests A zam B zal as [[A zam] B zal]", () => {
    const result = parseText("zezodol zam zegazol zal voworel.");
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
    const result = parseText("zodozol gugol buzazon gubulol voworel.");
    const np = result.utterances[0]!.bodies[0]!.clause.units[0]!;
    assert.ok(np.kind === "np" && np.coord.parts[0]!.items[0]!.kind === "package");
    const pkg = np.coord.parts[0]!.items[0]!.package;
    assert.equal(pkg.adjs.length, 1);
    assert.equal(pkg.adjs[0]!.hosted?.bound.raw, "buzazon");
    assert.equal(pkg.adjs[0]!.hosted?.adjs?.[0]?.word.raw, "gubulol");
  });

  it("attaches a number word after a hosted /b/ on /th/ as its amount (signed offset)", () => {
    const result = parseText("zuzazon thevom balarum g-3 voworel.");
    const unit = result.utterances[0]!.bodies[0]!.clause.units[1]!;
    assert.ok(unit.kind === "h");
    assert.equal(unit.unit.hosted?.bound.raw, "balarum");
    assert.equal(unit.unit.hosted?.amount?.raw, "g-3");
  });
});

describe("parse — as-of poles", () => {
  it("parses hosted ledger plus date /b/", () => {
    const result = parseText("zolozun hamom huhum b_#22,7 veyorum.");
    const h = result.utterances[0]!.bodies[0]!.clause.units.find((u) => u.kind === "h" && u.unit.word.raw === "huhum");
    assert.ok(h && h.kind === "h");
    assert.equal(h.unit.word.overlay?.gloss, "as-of.ledger");
    assert.equal(h.unit.hosted?.bound.raw, "b_#22,7");
  });

  it("parses stance as-of on /th/ beside a clause as-of on /h/", () => {
    const units = parseText("zolozun thuhum b_#22,7 thovum huhum b_#22,7 veyorul.").utterances[0]!.bodies[0]!.clause.units;
    const th = units.find((u) => u.kind === "h" && u.unit.word.raw === "thuhum");
    assert.ok(th && th.kind === "h");
    assert.equal(th.unit.word.overlay?.gloss, "as-of.ledger");
    assert.equal(th.unit.hosted?.bound.raw, "b_#22,7");
  });

  it("parses a fault pole hosting a stand-in, stacked after only-if", () => {
    parseText("zuzazon voworel tholum thavel barl zolozun vezeyel.");
    parseText("zumel wanathumol gobum bolozun thovum thavel barl zolozun vezeyel.");
  });

  it("parses as-of resume without /b/", () => {
    const result = parseText("zuzazon huhur voworel.");
    const h = result.utterances[0]!.bodies[0]!.clause.units.find((u) => u.kind === "h");
    assert.ok(h && h.kind === "h");
    assert.equal(h.unit.word.raw, "huhur");
    assert.equal(h.unit.hosted, undefined);
  });

  it("rejects as-of resume plus /b/", () => {
    assert.throws(() => parseText("zuzazon huhur b_#22,7 voworel."), SentenceParseError);
  });

  it("rejects as-of introduce without /b/", () => {
    assert.throws(() => parseText("zuzazon huhum voworel."), SentenceParseError);
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
    const result = parseText("zuzazon zolozun zel wuhum b_#22,7 gumahom.");
    const np = result.utterances[0]!.bodies[0]!.clause.units[0];
    assert.ok(np && np.kind === "np");
    const shared = np.coord.parts[0]!.shared[0];
    assert.ok(shared && "asOf" in shared);
    assert.equal(shared.asOf?.word.raw, "wuhum");
    assert.equal(shared.asOf?.bound?.raw, "b_#22,7");
    assert.equal(shared.word.raw, "gumahom");
  });

  it("parses bookmark as-of plus barl dependent", () => {
    const result = parseText("zoyel gulawum hamom thunem b+ huram barl zolozun veyorum.");
    const clause = result.utterances[0]!.bodies[0]!.clause;
    assert.ok(clause.dependent);
    const h = clause.units.find((u) => u.kind === "h" && u.unit.word.raw === "huram");
    assert.ok(h && h.kind === "h");
    assert.equal(h.unit.hosted?.bound.raw, "barl");
  });

  it("parses channel plus residue plus as-of", () => {
    const result = parseText("zolozun thevom hamom huhum b_#22,7 veyorum.");
    const hs = result.utterances[0]!.bodies[0]!.clause.units.filter((u) => u.kind === "h");
    assert.equal(hs.length, 3);
  });

  it("rejects two as-of /h/ hosts in one clause", () => {
    assert.throws(
      () => parseText("zuzazon huhum b_#22,7 huram b_#23,7 voworel."),
      SentenceParseError,
    );
  });

  it("parses event-noun /b/ on as-of", () => {
    const result = parseText("zamol hamom huhum beyorum.");
    const h = result.utterances[0]!.bodies[0]!.clause.units.find((u) => u.kind === "h" && u.unit.word.raw === "huhum");
    assert.ok(h && h.kind === "h");
    assert.equal(h.unit.hosted?.bound.raw, "beyorum");
  });

  it("parses extra-noun resume in as-of /b/", () => {
    const result = parseText("zolozun voworel ol b_#22,7. xolozun hamom huhum b=_#22,7 veyorum.");
    const second = result.utterances[0]!.bodies[1]!.clause.units.find((u) => u.kind === "h" && u.unit.word.raw === "huhum");
    assert.ok(second && second.kind === "h");
    assert.equal(second.unit.hosted?.bound.raw, "b=_#22,7");
  });

  it("parses /w/ as-of resume immediately before the adjective", () => {
    const result = parseText("zuzazon zolozun zel wuhur gumahom.");
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
    const result = parseText("zolozun voworel. zolozur vehuhol.");
    assert.ok(result.resolve);
    assert.equal(result.resolve.anaphors[0]?.antecedent?.raw, "zolozun");
  });

  it("marks yol zar voworel. as fill-ask", () => {
    const result = parseText("yol zar voworel.");
    assert.equal(result.resolve?.asks[0]?.kind, "fillAsk");
  });
});

describe("parse — spans.md written fences and closes", () => {
  it("puts a written span in its PoS slot, not only an NP head", () => {
    for (const text of ["zuzazon voworel th(hogawol).", "yul zolozun v[vuzahul].", "zolozun vezeyel th(zuzazon vezeyol)."]) {
      assert.doesNotThrow(() => parseText(text), text);
    }
  });

  it("keeps the editorial and close-all marks inside the written span", () => {
    for (const text of ["zolozun d[ubazom#] vezeyel.", "zolozun d[ubazom#|] vezeyel."]) {
      assert.doesNotThrow(() => parseText(text), text);
    }
  });
});

describe("parse — pronouns.md resume with no earlier match", () => {
  it("reads an opening resume of a lexicon stem as the one you both know", () => {
    for (const text of ["zolozun vanobol dozer.", "zoyer voworel.", "zodozor voworel.", "zebeholuruhar voworel.", "zolozun voworelar."]) {
      assert.doesNotThrow(() => parseText(text), text);
    }
    assert.throws(() => parseText("zadar voworel."), SentenceParseError);
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
      ["zuzazon thobam zel gozumol.", "thobam"],
      ["zuzazon thamam zel bral vevurol.", "thamam"],
      ["zugul thohum zuel garalom.", "thohum"],
      ["zedadal thegatham zoel gral.", "thegatham"],
      ["zugul thodom zuem garalom.", "thodom"],
      ["zolozun huboxal zoel hedarem voworel.", "huboxal"],
      ["zawuhol thumel zoel gubabom.", "thumel"],
      ["zugul thoyuyom zel gegabom.", "thoyuyom"],
      ["zuzazon thahomolozun zel gozumol.", "thahomolozun"],
    ] as const) {
      assert.equal(barOf(text)?.word.raw, raw, text);
    }
    const units = parseText("zuzazon dozolx thamam del gral vogadol.").utterances[0]!.bodies[0]!.clause.units;
    const object = units.find((u) => u.kind === "np" && u.coord.level === "d");
    assert.ok(object?.kind === "np" && object.coord.parts[0]!.items.some((i) => i.kind === "bar" && i.bar.word.raw === "thamam"));
  });

  it("keeps a bar's hosted /b/ and dated offset inside the fence", () => {
    assert.equal(barOf("zugul thewam bolozun zuel gegabom.")?.hosted?.bound.raw, "bolozun");
    const dated = barOf("zuzazon thevom bozarom gruwol zel gozumol.");
    assert.equal(dated?.hosted?.bound.raw, "bozarom");
    assert.equal(dated?.hosted?.amount?.raw, "gruwol");
  });

  it("ranks a closed universal fence against the bar after it", () => {
    for (const text of ["zuam gaxadamul thobam zel hral vubazom.", "zuan gaxadamul thobam zel hral vubazom.", "zual gegazol thobam zel gozumol."]) {
      const units = parseText(text).utterances[0]!.bodies[0]!.clause.units;
      const np = units[0]!;
      assert.ok(np.kind === "np", text);
      const [fence, ranked] = np.kind === "np" ? np.coord.parts : [];
      assert.equal(fence?.join?.family.kind === "joinMarker" && fence.join.family.series, "ua", text);
      assert.deepEqual(ranked?.items.map((i) => (i.kind === "bar" ? i.bar.word.raw : i.kind)), ["thobam"], text);
      assert.ok(!units.some((u) => u.kind === "h"), text);
    }
    // Only the `ua` fences rank as one item; `zul` + kind keeps the bar out.
    const units = parseText("zul gegazol thobam zel gozumol.").utterances[0]!.bodies[0]!.clause.units;
    assert.ok(units.some((u) => u.kind === "h" && u.unit.word.raw === "thobam"));
  });

  it("reads an adjective after a bar's hosted /b/ as describing that noun, inside the fence", () => {
    const bar = barOf("zuzazon thobam baxoleyolx gozumol zel gezeyol.");
    assert.equal(bar?.hosted?.bound.raw, "baxoleyolx");
    assert.deepEqual(bar?.hosted?.adjs?.map((a) => a.word.raw), ["gozumol"]);
    // On the clause too, an adjective after a `/th/` host's `/b/` describes that noun (clause.md#complex-chaining).
    const units = parseText("zuzazon thewam bolozun gozumol voworel.").utterances[0]!.bodies[0]!.clause.units;
    assert.ok(units.some((u) => u.kind === "h" && u.unit.hosted?.adjs?.[0]?.word.raw === "gozumol"));
  });

  it("keeps the ranked item's hook + /b/ before its bar inside the fence", () => {
    const part = fence("zugul om bamun thamam zel garalom.")!;
    assert.deepEqual(part.items.map((i) => i.kind), ["package", "bar"]);
    assert.equal(part.items[0]!.kind === "package" && part.items[0]!.package.adjs[0]?.hosted?.bound.raw, "bamun");
  });

  it("reads a stance word outside the fence on the claim", () => {
    const units = parseText("zuzazon zel gozumol thobam.").utterances[0]!.bodies[0]!.clause.units;
    assert.deepEqual(units.map((u) => u.kind), ["np", "h"]);
    assert.ok(units[0]!.kind === "np" && units[0]!.coord.parts[0]!.items.every((i) => i.kind === "package"));
  });

  it("ends the sentence at a bar's barl: the next words are the grounds", () => {
    const clause = parseText("zuzazon thunem barl zel gozumol zolozun vazomul.").utterances[0]!.bodies[0]!.clause;
    assert.equal(clause.units.length, 1);
    assert.deepEqual(clause.dependent?.clause.units.map((u) => u.kind), ["np", "vp"]);
  });
});

describe("parse — spans.md /y/ spans", () => {
  it("reads a written /y/ span by its @ mark: named calls, unnamed reacts", () => {
    assert.deepEqual(parseText("y@<Sam> yol zuzazon voworel.").utterances[0]!.left.vocatives.map((w) => w.raw), ["y@<Sam>"]);
    assert.deepEqual(parseText("y<Amen> zuzazon voworel.").utterances[0]!.left.interjections.map((w) => w.raw), ["y<Amen>"]);
  });

  it("takes a sentence linker after a written /y/ span", () => {
    assert.equal(parseText("y@<Sam> xezom zuzazon voworel.").utterances[0]!.bodies[0]!.linker?.raw, "xezom");
  });

  it("puts a written /y/ cite at the left edge too", () => {
    assert.deepEqual(parseText("y[uzazon] yol zolozun voworel.").utterances[0]!.left.interjections.map((w) => w.raw), ["y[uzazon]"]);
  });

  it("sets the topic with an /x/ cite or opaque span", () => {
    assert.equal(parseText("x@<Sam> zozan voworel.").utterances[0]!.bodies[0]!.linker?.raw, "x@<Sam>");
    assert.equal(parseText("x<odozo> zozan gumazom.").utterances[0]!.bodies[0]!.linker?.raw, "x<odozo>");
    assert.equal(parseText("x@[onoron olozun] zozan vezeyol.").utterances[0]!.bodies[0]!.linker?.raw, "x@[onoron olozun]");
  });
});

describe("parse — spans.md mention marker", () => {
  it("reads a gl- word right before a span as the mention marker", () => {
    const units = parseText("glelel z<odozo> gumazom.").utterances[0]!.bodies[0]!.clause.units;
    const np = units[0]!;
    assert.ok(np.kind === "np");
    const item = np.coord.parts[0]!.items[0];
    assert.ok(item?.kind === "package");
    assert.equal(item.package.glAdj?.word.reading, "mention");
    assert.equal(item.package.glAdj?.word.overlay?.gloss, "MENTION");
  });

  it("reads -n as the name-string marker", () => {
    const np = parseText("glelen d<onoron> vogegum.").utterances[0]!.bodies[0]!.clause.units.find((u) => u.kind === "np" && u.coord.level === "d")!;
    const item = np.kind === "np" ? np.coord.parts[0]!.items[0] : undefined;
    assert.ok(item?.kind === "package");
    assert.equal(item.package.glAdj?.word.overlay?.gloss, "NAME.MENTION");
  });

  it("puts the marker before a topic span", () => {
    const body = parseText("glelel x<odozo> zozan gumazom.").utterances[0]!.bodies[0]!;
    assert.equal(body.topicMarker?.raw, "glelel");
    assert.equal(body.linker?.raw, "x<odozo>");
  });

  it("lets a marked topic span be the whole sentence", () => {
    const body = parseText("glelel x<odozo>.").utterances[0]!.bodies[0]!;
    assert.equal(body.topicMarker?.raw, "glelel");
    assert.equal(body.linker?.raw, "x<odozo>");
  });

  it("keeps the same spelling an ordinary adjective anywhere else", () => {
    const word = parseText("glelel zodozol voworel.").utterances[0]!.bodies[0]!.clause.units[0]!;
    assert.ok(word.kind === "np");
    const item = word.coord.parts[0]!.items[0];
    assert.ok(item?.kind === "package");
    assert.equal(item.package.glAdj?.word.reading !== "mention", true);
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
      "zuzazon voworel uem thedel.",
      "zuzazon voworel uem thumel.",
      "zuzazon voworel uem thamam.",
      "zuzazon voworel uem thehum.",
      "zuzazon voworel uem thohum.",
      "zuzazon voworel uem thewam.",
      "zuzazon voworel uem thoyuyom.",
      "zuzazon voworel uem thewamolozun.",
    ]) {
      const { hook, units } = frameOf(text);
      assert.equal(hook.job, "frame", text);
      assert.equal(hook.frame?.word.pos, "th", text);
      assert.ok(!units.some((unit) => unit.kind === "h"), text);
    }
  });

  it("holds WANT, PLAN or DECISION after a holder as part of the frame", () => {
    for (const held of ["thohum", "thamam", "thehum"]) {
      const { hook, units } = frameOf(`zuzazon voworel uem thunemuzazon ${held}.`);
      assert.equal(hook.frame?.word.raw, "thunemuzazon", held);
      assert.equal(hook.heldIntention?.raw, held);
      assert.ok(!units.some((unit) => unit.kind === "h"), held);
    }
  });

  it("keeps the stance's hosted /b/ inside the frame", () => {
    const { hook } = frameOf("zuzazon vezeyel uem huxedem bolozun.");
    assert.equal(hook.frame?.word.raw, "huxedem");
    assert.equal(hook.frame?.hosted?.bound.raw, "bolozun");
  });

  it("takes the frame at the left edge too", () => {
    const result = parseText("uem thedel zuzazon voworel.");
    assert.equal(result.utterances[0]!.left.hook, undefined);
    const { hook } = frameOf("uem thedel zuzazon voworel.");
    assert.equal(hook.frame?.word.raw, "thedel");
  });

  it("leaves a stance elsewhere in the clause on the claim", () => {
    const { hook, units } = frameOf("zuzazon voworel uem thedel thegom.");
    assert.equal(hook.frame?.word.raw, "thedel");
    const claim = units.filter((unit) => unit.kind === "h");
    assert.deepEqual(claim.map((unit) => unit.kind === "h" && unit.unit.word.raw), ["thegom"]);
  });

  it("keeps uem + /b/ as an extra noun", () => {
    const { hook } = frameOf("zuzazon voworel uem burelal.");
    assert.equal(hook.job, "extraNoun");
    assert.equal(hook.frame, undefined);
  });
});

describe("parse — whose plan or decision (holder)", () => {
  const hUnits = (text: string) =>
    parseText(text).utterances[0]!.bodies[0]!.clause.units.flatMap((unit) => (unit.kind === "h" ? [unit.unit] : []));

  it("gives someone else's PLAN or DECISION through a holder, not a /b/", () => {
    for (const mood of ["thamam", "thehum"]) {
      const [holder, word] = hUnits(`zuzazon thunemolozun ${mood} voworel.`);
      assert.equal(holder?.word.raw, "thunemolozun", mood);
      assert.equal(word?.word.raw, mood);
      assert.equal(word?.hosted, undefined, mood);
    }
  });

  it("keeps PLAN's /b/ for a later offset", () => {
    const [plan] = hUnits("zuzazon thamam bral voworel.");
    assert.equal(plan?.hosted?.bound.raw, "bral");
  });
});

describe("negation scope at a fence or a pole", () => {
  it("reads zual + kind + zul as not every K (joins.md#not-every)", () => {
    const units = parseText("zual gegazol zul vuzevol.").utterances[0]!.bodies[0]!.clause.units;
    const np = units[0]!;
    assert.equal(np.kind, "np");
    if (np.kind !== "np") return;
    assert.deepEqual(np.coord.parts.map((part) => part.join?.raw), ["zual", "zul"]);
    assert.equal(np.coord.parts[0]!.shared[0]!.word.raw, "gegazol");
  });

  it("keeps a stance join before barl in the main sentence and barl on the pole", () => {
    const clause = parseText("zuzazon vodeyel thugum thoyem thul barl zuzazon gaxodeyethel.").utterances[0]!.bodies[0]!.clause;
    const hs = clause.units.flatMap((u) => (u.kind === "h" ? [u.unit] : []));
    assert.deepEqual(hs.map((h) => h.word.raw), ["thugum", "thoyem", "thul"]);
    assert.equal(hs[1]!.hosted?.bound.raw, "barl");
    assert.equal(hs[1]!.hosted?.afterJoin, true);
    assert.equal(clause.dependent?.orodo.raw, "barl");
  });

  it("leaves barl off a pole that already has its /b/", () => {
    const clause = parseText("zuzazon voworel thavem burelal thul barl zolozun varuvel.").utterances[0]!.bodies[0]!.clause;
    const pole = clause.units.find((u) => u.kind === "h" && u.unit.word.raw === "thavem");
    assert.equal(pole?.kind === "h" && pole.unit.hosted?.bound.raw, "burelal");
  });
});

describe("parse — one tree per sentence (syntactic-unambiguity batch 5a)", () => {
  const units = (text: string) => parseText(text).utterances[0]!.bodies[0]!.clause.units;

  it("reads a fronted hook as glue unless a /b/ word comes right after it", () => {
    assert.equal(parseText("al zuzazon voworel.").utterances[0]!.left.hook?.raw, "al");
    const since = parseText("ul barl zolozun vuzevol.").utterances[0]!;
    assert.equal(since.left.hook, undefined);
    const [hook] = since.bodies[0]!.clause.units;
    assert.ok(hook?.kind === "hook" && hook.job === "extraNoun");
    assert.ok(since.bodies[0]!.clause.dependent);
  });

  it("keeps an in-clause hook after a written act word", () => {
    const utterance = parseText("yal al zuzazon voworel.").utterances[0]!;
    assert.equal(utterance.left.hook, undefined);
    assert.equal(utterance.bodies[0]!.clause.units[0]!.kind, "hook");
  });

  it("gives a plain adjective after a call to the call", () => {
    const utterance = parseText("yohun gulowon.").utterances[0]!;
    assert.deepEqual(utterance.left.vocativeAdjs?.[0]?.adjs.map((a) => a.word.raw), ["gulowon"]);
    assert.equal(utterance.bodies.length, 0);
  });

  it("fills a hosted /b/ slot with the list that starts right after the host", () => {
    const [, , h] = units("zolozun vehuhol hazam bodevel buyehol bal.");
    assert.ok(h?.kind === "h");
    assert.deepEqual(h.unit.hosted?.boundJoin?.members.map((m) => m.raw), ["buyehol"]);
    assert.equal(h.unit.hosted?.boundJoin?.join.raw, "bal");
  });

  it("puts words between joined verbs on the later verb, and words before the first verb on the clause", () => {
    const list = units("zuzazon voworel dehalon vanobol val.");
    assert.equal(list.length, 2);
    const vp = list[1]!;
    assert.ok(vp.kind === "vp");
    assert.equal(vp.coord.parts[0]!.itemUnits?.[0]?.verb.raw, "vanobol");
    assert.deepEqual(units("zuzazon dolozun vonamol vul.").map((u) => u.kind), ["np", "np", "vp"]);
  });

  it("shares an /h/ after a verb join, but not a /th/ stance", () => {
    const shared = units("zuzazon voworel varuvel val huhavem.")[1]!;
    assert.ok(shared.kind === "vp");
    assert.deepEqual(shared.coord.parts[0]!.shared.map((s) => s.word.raw), ["huhavem"]);
    assert.deepEqual(units("zolozun veyorul vul thegem buzazon.").map((u) => u.kind), ["np", "vp", "h"]);
  });

  it("gives barl after a stance join to the pole", () => {
    const clause = parseText("zuzazon voworel thavem thul barl zolozun varuvel.").utterances[0]!.bodies[0]!.clause;
    assert.ok(clause.dependent);
    assert.ok(!clause.units.some((u) => u.kind === "np" && u.coord.level === "b"));
  });

  it("ranks a closed ua fence as one item only right after its join", () => {
    const [z] = units("zugul om bamun thamam zel garalom.");
    assert.ok(z?.kind === "np");
    assert.equal(z.coord.parts.length, 1);
    assert.equal(z.coord.parts[0]!.items.length, 2);
    // Right after a closed `ua` fence, the bar starts a part of its own that ranks the whole fence.
    const [fence] = units("zuam gaxadamul thobam zel hral vubazom.");
    assert.ok(fence?.kind === "np");
    assert.deepEqual(fence.coord.parts.map((p) => p.items.map((i) => i.kind)), [[], ["bar"]]);
  });
});

describe("parse — one tree per sentence (syntactic-unambiguity batch 5b)", () => {
  const units = (text: string) => parseText(text).utterances[0]!.bodies[0]!.clause.units;

  it("gives a hook and its /b/ right before a join word to the last item", () => {
    const [z] = units("zodozol em buzazor zal voworel.");
    assert.ok(z?.kind === "np");
    assert.equal(z.coord.parts.length, 1);
    assert.deepEqual(z.coord.parts[0]!.items.map((i) => i.kind === "package" && i.package.adjs.map((a) => a.word.raw)), [["em"]]);
  });

  it("ends the main clause at a stand-in, so a stance join after barl opens the grounds", () => {
    const clause = parseText("zuzazon voworel thavem barl thul zolozun varuvel.").utterances[0]!.bodies[0]!.clause;
    assert.deepEqual(clause.units.map((u) => u.kind), ["np", "vp", "h"]);
    assert.deepEqual(clause.dependent?.clause.units.map((u) => u.kind), ["h", "np", "vp"]);
  });

  it("leans a gl- adjective on the noun past the adjectives that describe its /b/", () => {
    const [z, b] = units("glugol buzazon gugol zodozol bolozun voworel.");
    assert.ok(z?.kind === "np" && z.coord.level === "z");
    assert.ok(b?.kind === "np" && b.coord.level === "b");
  });

  it("takes an asking tag as a turn with no body", () => {
    const tag = parseText("yol yael.").utterances[0]!;
    assert.deepEqual(tag.left.polars.map((p) => p.raw), ["yael"]);
    assert.equal(tag.bodies.length, 0);
  });

  it("still takes a clearing linker alone", () => {
    assert.equal(parseText("xevewem.").utterances[0]!.bodies[0]!.linker?.raw, "xevewem");
  });
});
