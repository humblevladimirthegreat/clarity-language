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
    const result = parseText("zezadel gubuhal.");
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
    const result = parseText("yol zamun vowogal.");
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
    const result = parseText("yael zamun vowogal.");
    assert.equal(result.utterances[0]!.left.polars[0]?.raw, "yael");
    assert.equal(result.utterances[0]!.bodies[0]!.clause.units.length, 2);
  });
});

describe("parse — joins.md", () => {
  it("parses zezadel zagadal zam.", () => {
    const result = parseText("zezadel zagadal zam.");
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
    const result = parseText("zazawan gazaham theram barl zalahen vowogal.");
    const clause = result.utterances[0]!.bodies[0]!.clause;
    assert.ok(clause.dependent);
    assert.equal(clause.dependent!.orodo.raw, "barl");
    assert.equal(clause.dependent!.clause.units.length, 2);
  });

  it("parses hagom barl purpose dependent", () => {
    const result = parseText("zazawan vowogal hagom barl zalahen vehahel.");
    const clause = result.utterances[0]!.bodies[0]!.clause;
    assert.ok(clause.dependent);
    assert.equal(clause.dependent!.orodo.raw, "barl");
    assert.equal(clause.dependent!.clause.units.length, 2);
  });

  it("parses darl object with matrix verb before the opener", () => {
    const result = parseText("zazawan balahen vezebel darl zezadel varahal.");
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
    const result = parseText("daxal zezadel xuxul vowogal.");
    const spanUnit = result.utterances[0]!.bodies[0]!.clause.units.find((u) => u.kind === "span");
    assert.ok(spanUnit);
    if (spanUnit?.kind !== "span") return;
    assert.equal(spanUnit.span.open.raw, "daxal");
    assert.equal(spanUnit.span.close?.raw, "xuxul");
  });
});

describe("parse — SVO slots", () => {
  it("parses zar damun vozezol as subject, object, verb (roles.md)", () => {
    const result = parseText("zar damun vozezol.");
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
    const result = parseText("zazawan welavam homem badagul vowogal.");
    const units = result.utterances[0]!.bodies[0]!.clause.units;
    const h = units.find((u) => u.kind === "h");
    assert.ok(h && h.kind === "h");
    assert.equal(h.unit.modifiers[0]?.raw, "welavam");
    assert.equal(h.unit.bound?.raw, "badagul");
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
    assert.throws(() => parseText("zam zezadel zagadal."), SentenceParseError);
  });

  it("nests A zam B zal as [[A zam] B zal]", () => {
    const result = parseText("zezadel zam zagadal zal vowogal.");
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
    const result = parseText("zodogal gogal bazawan gubuhal vowogal.");
    const np = result.utterances[0]!.bodies[0]!.clause.units[0]!;
    assert.ok(np.kind === "np" && np.coord.parts[0]!.items[0]!.kind === "package");
    const pkg = np.coord.parts[0]!.items[0]!.package;
    assert.equal(pkg.adjs.length, 1);
    assert.equal(pkg.adjs[0]!.bound?.raw, "bazawan");
    assert.equal(pkg.adjs[0]!.boundAdjs?.[0]?.word.raw, "gubuhal");
  });

  it("attaches a number word after a hosted /b/ on /th/ as its amount (signed offset)", () => {
    const result = parseText("zazawan thunom bagazem g-3 vowogal.");
    const unit = result.utterances[0]!.bodies[0]!.clause.units[1]!;
    assert.ok(unit.kind === "h");
    assert.equal(unit.unit.bound?.raw, "bagazem");
    assert.equal(unit.unit.boundAmount?.raw, "g-3");
  });
});

describe("parse — as-of poles", () => {
  it("parses hosted ledger plus date /b/", () => {
    const result = parseText("zalahen thamom henem b_#22,7 vadebam.");
    const h = result.utterances[0]!.bodies[0]!.clause.units.find((u) => u.kind === "h" && u.unit.word.raw === "henem");
    assert.ok(h && h.kind === "h");
    assert.equal(h.unit.word.overlay?.gloss, "as-of.ledger");
    assert.equal(h.unit.bound?.raw, "b_#22,7");
  });

  it("parses stance as-of on /th/ beside a clause as-of on /h/", () => {
    const units = parseText("zalahen thenem b_#22,7 thovom henem b_#22,7 vadebal.").utterances[0]!.bodies[0]!.clause.units;
    const th = units.find((u) => u.kind === "h" && u.unit.word.raw === "thenem");
    assert.ok(th && th.kind === "h");
    assert.equal(th.unit.word.overlay?.gloss, "as-of.ledger");
    assert.equal(th.unit.bound?.raw, "b_#22,7");
  });

  it("parses a fault pole hosting a stand-in, stacked after only-if", () => {
    parseText("zazawan vowogal thebom theral barl zalahen vezebel.");
    parseText("zemehol wonathumol gobom balahen thovom theral barl zalahen vezebel.");
  });

  it("parses as-of resume without /b/", () => {
    const result = parseText("zazawan hener vowogal.");
    const h = result.utterances[0]!.bodies[0]!.clause.units.find((u) => u.kind === "h");
    assert.ok(h && h.kind === "h");
    assert.equal(h.unit.word.raw, "hener");
    assert.equal(h.unit.bound, undefined);
  });

  it("rejects as-of resume plus /b/", () => {
    assert.throws(() => parseText("zazawan hener b_#22,7 vowogal."), SentenceParseError);
  });

  it("rejects as-of introduce without /b/", () => {
    assert.throws(() => parseText("zazawan henem vowogal."), SentenceParseError);
  });

  it("parses /ɡ/ ledger on a noun", () => {
    const result = parseText("zamol genem b_#22,7.");
    const units = result.utterances[0]!.bodies[0]!.clause.units;
    const pred = units.find((u) => u.kind === "predicate");
    const np = units.find((u) => u.kind === "np");
    if (pred?.kind === "predicate") {
      assert.equal(pred.adj.word.raw, "genem");
      assert.equal(pred.adj.bound?.raw, "b_#22,7");
      return;
    }
    assert.ok(np && np.kind === "np");
    const item = np.coord.parts[0]!.items[0];
    assert.equal(item?.kind, "package");
    if (item?.kind !== "package") return;
    const g = item.package.adjs[0];
    assert.equal(g?.word.raw, "genem");
    assert.equal(g?.bound?.raw, "b_#22,7");
  });

  it("parses /w/ as-of before a shared adjective", () => {
    const result = parseText("zazawan zalahen zel wenem b_#22,7 gamadam.");
    const np = result.utterances[0]!.bodies[0]!.clause.units[0];
    assert.ok(np && np.kind === "np");
    const shared = np.coord.parts[0]!.shared[0];
    assert.ok(shared && "asOf" in shared);
    assert.equal(shared.asOf?.word.raw, "wenem");
    assert.equal(shared.asOf?.bound?.raw, "b_#22,7");
    assert.equal(shared.word.raw, "gamadam");
  });

  it("parses bookmark as-of plus barl dependent", () => {
    const result = parseText("zodol galagem thamom thevem b+ humem barl zalahen vadebam.");
    const clause = result.utterances[0]!.bodies[0]!.clause;
    assert.ok(clause.dependent);
    const h = clause.units.find((u) => u.kind === "h" && u.unit.word.raw === "humem");
    assert.ok(h && h.kind === "h");
    assert.equal(h.unit.bound?.raw, "barl");
  });

  it("parses channel plus residue plus as-of", () => {
    const result = parseText("zalahen thunom thamom henem b_#22,7 vadebam.");
    const hs = result.utterances[0]!.bodies[0]!.clause.units.filter((u) => u.kind === "h");
    assert.equal(hs.length, 3);
  });

  it("rejects two as-of /h/ hosts in one clause", () => {
    assert.throws(
      () => parseText("zazawan henem b_#22,7 humem b_#23,7 vowogal."),
      SentenceParseError,
    );
  });

  it("parses event-noun /b/ on as-of", () => {
    const result = parseText("zamol thamom henem badebam.");
    const h = result.utterances[0]!.bodies[0]!.clause.units.find((u) => u.kind === "h" && u.unit.word.raw === "henem");
    assert.ok(h && h.kind === "h");
    assert.equal(h.unit.bound?.raw, "badebam");
  });

  it("parses extra-noun resume in as-of /b/", () => {
    const result = parseText("zalahen vowogal ol b_#22,7. xalahen thamom henem b=_#22,7 vadebam.");
    const second = result.utterances[0]!.bodies[1]!.clause.units.find((u) => u.kind === "h" && u.unit.word.raw === "henem");
    assert.ok(second && second.kind === "h");
    assert.equal(second.unit.bound?.raw, "b=_#22,7");
  });

  it("parses /w/ as-of resume immediately before the adjective", () => {
    const result = parseText("zazawan zalahen zel wener gamadam.");
    const np = result.utterances[0]!.bodies[0]!.clause.units[0];
    assert.ok(np && np.kind === "np");
    const shared = np.coord.parts[0]!.shared[0];
    assert.ok(shared && "asOf" in shared);
    assert.equal(shared.asOf?.word.raw, "wener");
    assert.equal(shared.asOf?.bound, undefined);
  });
});

describe("parse — stage 4 resolve", () => {
  it("attaches resolve to parse(text)", () => {
    const result = parseText("zalahen vowogal. zalar vehahel.");
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
    for (const text of ["zazawan vowogal th(hazaham).", "yul zalahen v[vazadal].", "zalahen vezebel th(zazawan vezehel)."]) {
      assert.doesNotThrow(() => parseText(text), text);
    }
  });

  it("allows close-all right after an editorial close (written #|)", () => {
    assert.doesNotThrow(() => parseText("zalahen daxal abogam xuxur xuxum vezebel."));
    assert.throws(() => parseText("zalahen daxal abogam xuxul xuxum vezebel."), SentenceParseError);
  });
});
