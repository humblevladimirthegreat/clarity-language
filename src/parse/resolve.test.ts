import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";

import { createClassifyTables } from "./classify.js";
import { parse } from "./index.js";

const rootDir = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const tables = createClassifyTables(
  readFileSync(join(rootDir, "data", "lexicon-published.csv"), "utf8"),
  readFileSync(join(rootDir, "data", "lexicon-overlays.csv"), "utf8"),
  readFileSync(join(rootDir, "data", "lexicon-compounds.csv"), "utf8"),
);

function parseText(text: string) {
  return parse(text, tables);
}

function resolveOf(text: string) {
  const result = parseText(text);
  assert.ok(result.resolve);
  return result.resolve;
}

describe("resolve — content anaphors (pronouns.md#resume-r)", () => {
  it("binds zululor to ululo by whole stem", () => {
    const { anaphors } = resolveOf("zululon vawalal. zululor vayul.");
    assert.equal(anaphors.length, 1);
    assert.equal(anaphors[0]!.kind, "content");
    assert.equal(anaphors[0]!.pronoun.raw, "zululor");
    assert.equal(anaphors[0]!.antecedent?.raw, "zululon");
  });

  it("pins a resume to one sense with -rl / -rm (pronouns.md#resume-sense)", () => {
    const { anaphors } = resolveOf("zuzazon dodozol vanobol. zolozun dodozom vanobol. zuzazon dodozorl vanobol. zolozun dodozorm vanobol. zuzazon dodozor vanobol.");
    assert.deepEqual(
      anaphors.map((bind) => bind.antecedent?.raw),
      ["dodozol", "dodozom", "dodozorm"],
    );
  });

  it("reads a pinned resume as the one both know when that sense never came up", () => {
    const { anaphors } = resolveOf("zodozol vawalal. zodozorm vayul.");
    assert.equal(anaphors[0]?.antecedent, undefined);
  });

  it("never binds a short cut of the root", () => {
    assert.throws(() => parseText("zululon vawalal. zulur vayul."), /whole stem/);
  });

  it("binds zodavar to the dog, skipping the book", () => {
    const { anaphors } = resolveOf("zodaval vuluzul. zabadol gelel. zodavar vawalal.");
    assert.equal(anaphors[0]!.pronoun.raw, "zodavar");
    assert.equal(anaphors[0]!.antecedent?.raw, "zodaval");
  });

  it("binds vawalar to the prior verb (pronouns.md intermediate)", () => {
    const { anaphors } = resolveOf("zuzazon vawalal. zululon vawalar.");
    assert.equal(anaphors[0]!.pronoun.raw, "vawalar");
    assert.equal(anaphors[0]!.antecedent?.raw, "vawalal");
  });

  it("matches a compound only on its whole stem (bed is not bedroom)", () => {
    const part = resolveOf("zebeholuruhal voworel. zebehor vehuhol.");
    assert.equal(part.anaphors[0]!.antecedent, undefined);
    const whole = resolveOf("zebeholuruhal voworel. zebeholuruhar vehuhol.");
    assert.equal(whole.anaphors[0]!.antecedent?.raw, "zebeholuruhal");
  });

  it("matches a hook compound only on its whole stem (walk is not enter)", () => {
    assert.equal(resolveOf("zuzazon voworelal. zolozun voworer.").anaphors[0]!.antecedent, undefined);
    assert.equal(resolveOf("zuzazon voworelal. zolozun voworelar.").anaphors[0]!.antecedent?.raw, "voworelal");
  });

  it("leaves an opening resume unresolved", () => {
    const { anaphors } = resolveOf("zodoner vawalal.");
    assert.equal(anaphors[0]!.pronoun.raw, "zodoner");
    assert.equal(anaphors[0]!.antecedent, undefined);
  });

  it("binds an ability resume on its whole stem and keeps the ability (intention.md#ability)", () => {
    const { anaphors } = resolveOf("zuzazon voworexal. zugobon voworexar.");
    assert.equal(anaphors[0]!.pronoun.raw, "voworexar");
    assert.equal(anaphors[0]!.antecedent?.raw, "voworexal");
  });

  it("does not bind statement zar as a content anaphor", () => {
    const { anaphors, asks } = resolveOf("zar vawalal.");
    assert.equal(anaphors.length, 0);
    assert.equal(asks[0]!.kind, "none");
  });

  it("leaves an opening full-root ability resume unresolved", () => {
    const { anaphors } = resolveOf("zuzazon voworexar.");
    assert.equal(anaphors[0]!.pronoun.raw, "voworexar");
    assert.equal(anaphors[0]!.antecedent, undefined);
  });
});

describe("resolve — role pointers (pronouns.md#role-pointers)", () => {
  function pointers(text: string): string[] {
    return resolveOf(text)
      .anaphors.filter((a) => a.kind === "pointer")
      .map((a) => `${a.pronoun.raw}→${a.antecedent?.raw}`);
  }

  it("a: the latest predicate with that role filled", () => {
    assert.deepEqual(pointers("zuzazon voworel. zaxar vehuhol."), ["zaxar→zuzazon"]);
    assert.deepEqual(pointers("zuzazon dolozun vanobol. zuxar varuvel."), ["zuxar→dolozun"]);
  });

  it("a on a core role skips predicates without that slot", () => {
    assert.deepEqual(pointers("zuzazon dolozun vanobol. zuzazon voworel. zuxar varuvel."), ["zuxar→dolozun"]);
    assert.deepEqual(pointers("zuzazon vezeyel darl. vurelal. zaxar voworel."), ["zaxar→zuzazon"]);
  });

  it("o: the nearest earlier predicate with someone else in that role", () => {
    assert.deepEqual(pointers("zuzazon voworel. zolozun varuvel. zolozun vehuhol. zaxor vuzevol."), ["zaxor→zuzazon"]);
  });

  it("o compares referents, so a resumed name is the same person", () => {
    assert.throws(() => parseText("zuzazon voworel. zuzazor vehuhol. zaxor vuzevol."), /needs an earlier predicate/);
  });

  it("e: this clause's predicate", () => {
    assert.deepEqual(pointers("zuzazon vanobol daxer."), ["daxer→zuzazon"]);
  });

  it("the extra party is a verb's unhosted /b/ or a /ɡ/ predicate's hosted /b/", () => {
    assert.deepEqual(pointers("zuzazon bolozun vezeyel darl. zoxar varuvel."), ["zoxar→bolozun"]);
    assert.deepEqual(pointers("zuzazon ganam bolozun. zoxar varuvel."), ["zoxar→bolozun"]);
  });

  it("the scene is a place hook's /b/, else during's, else the event's own", () => {
    assert.deepEqual(pointers("zuzazon vuzevol al bawuhol. zolozun dexar vanobol."), ["dexar→bawuhol"]);
    assert.deepEqual(pointers("zuzazon vuzevol huwem bovelul. zolozun dexar vanobol."), ["dexar→bovelul"]);
    assert.deepEqual(pointers("zuzazon vuzevol. zolozun dexar vanobol."), ["dexar→vuzevol"]);
  });

  it("a stacked role reads its paired hook's /b/, else the event's own", () => {
    assert.deepEqual(pointers("zuzazon vavavul ael bodul. zolozun daexar vanobol."), ["daexar→bodul"]);
    assert.deepEqual(pointers("zuzazon vavavul. zolozun daexar vanobol."), ["daexar→vavavul"]);
  });

  it("a joined slot is one group", () => {
    assert.deepEqual(pointers("zuzazon zolozun zal voworel. zaxarx vehuhol."), ["zaxarx→zal"]);
    assert.deepEqual(pointers("zuzazon zolozun zel gumahom. zaxarx varuvel."), ["zaxarx→zel"]);
  });

  it("span interiors add no anchors", () => {
    assert.deepEqual(pointers("zuzazon voworel. d[zolozun varuvel] vanobol. zaxar vehuhol."), ["zaxar→zuzazon"]);
  });

  it("fills the holder slot of a holder seam", () => {
    assert.deepEqual(pointers("zuzazon voworel. zolozun thunemaxar veyorul."), ["thunemaxar→zuzazon"]);
  });

  it("is a viewpoint lateral's facing anchor (roles.md#viewpoint-laterals)", () => {
    assert.deepEqual(pointers("zuzazon voworel. zolozun vehuhol howehethaxar."), ["howehethaxar→zuzazon"]);
    assert.deepEqual(pointers("zuzazon voworel howehethaxer."), ["howehethaxer→zuzazon"]);
    assert.throws(() => parseText("zolozun vehuhol howehethaxar."), /earlier predicate/);
  });

  it("-l: a new one of the participant's kind, never the same referent", () => {
    assert.deepEqual(pointers("zuzazon dogudol vanobol. zolozun duxal vanobol."), ["duxal→dogudol"]);
    const { anaphors } = resolveOf("zuzazon dogudol vanobol. zolozun duxal vanobol. zodozol duxar vanobol.");
    assert.equal(anaphors.find((a) => a.pronoun.raw === "duxar")?.antecedent?.raw, "duxal");
  });

  it("-m: the participant's part, not the participant", () => {
    assert.deepEqual(pointers("zuzazon dolozun vabavul. zaxam genumum."), ["zaxam→zuzazon"]);
  });

  it("u: the latest predicate that left that role unsaid", () => {
    assert.deepEqual(pointers("dogudol vanobol. zaxur varuvel."), ["zaxur→vanobol"]);
    assert.deepEqual(pointers("dogudol vanobol. zaxum genumum."), ["zaxum→vanobol"]);
    assert.throws(() => parseText("zuzazon voworel. zaxur vehuhol."), /earlier predicate/);
  });

  it("o on a stacked role counts only overt fillers", () => {
    assert.deepEqual(pointers("zuzazon vavavul ael bodul. zolozun vavavul ael bedel. zuzazon vavavul. zuzazon daexor vanobol."), ["daexor→bodul"]);
  });

  it("rejects a share with e or -x, a new one with u or on a special pronoun", () => {
    assert.throws(() => parseText("zuzazon dolozun vabavul. zaxem genumum."), /never takes the self vowel/);
    assert.throws(() => parseText("zuzazon dolozun vabavul. zaxamx genumum."), /takes no -x/);
    assert.throws(() => parseText("dogudol vanobol. zaxul varuvel."), /unsaid pointer/);
    assert.throws(() => parseText("zamun voworel. zaxal vehuhol."), /special, topic, or generic/);
    assert.throws(() => parseText("zuzazon dolozun vabavul. zexom genumum."), /except the scene/);
  });

  it("rejects pointers with no referent, on the wrong slot, o on an implicit role, or e on its own slot", () => {
    assert.throws(() => parseText("zaxar voworel."), /needs an earlier predicate/);
    assert.throws(() => parseText("zuzazon voworel. vaxar."), /fills \/z\//);
    assert.throws(() => parseText("zuzazon voworel. dexor vanobol."), /except the scene/);
    assert.throws(() => parseText("zaxer voworel."), /not the one it fills/);
  });
});

describe("resolve — span and number anaphors", () => {
  it("has no span resume: a span is an ordinary noun for a role pointer (spans.md)", () => {
    assert.throws(() => parseText("d[hi] vawalal. d[=] vayul."));
    const { anaphors } = resolveOf("zolozun d[hi] vezeyel. zuzazon duxar vanobol.");
    const pointer = anaphors.find((a) => a.kind === "pointer");
    assert.equal(pointer?.antecedent?.raw, "d[hi]");
  });

  it("binds digitful z=+3 to the prior scalar (numbers.md)", () => {
    const { anaphors } = resolveOf("z+3 vawalal. z=+3 vayul.");
    const num = anaphors.find((a) => a.kind === "number");
    assert.ok(num);
    assert.equal(num!.pronoun.raw, "z=+3");
    assert.equal(num!.antecedent?.raw, "z+3");
  });

  it("digitless z=+ is not a resume; under question it is a fill-ask (numbers.md#digitless)", () => {
    const statement = resolveOf("z+3 vawalal. z=+ vayul.");
    assert.equal(statement.anaphors.some((a) => a.kind === "number"), false);
    const question = resolveOf("yol zegazolx g=+ vayul.");
    assert.equal(question.asks[0]?.kind, "fillAsk");
    assert.equal(question.asks[0]?.gaps[0]?.raw, "g=+");
  });
});

describe("resolve — tag pronouns (pronouns.md#tag-pronouns)", () => {
  function tags(text: string): string[] {
    return resolveOf(text)
      .anaphors.filter((a) => a.kind === "tag")
      .map((a) => `${a.pronoun.raw}→${a.antecedent?.raw}`);
  }

  it("names the phrase right before it, and recalls it in any role", () => {
    assert.deepEqual(tags("zodozol zwal dogudol dwel vanobol. zegazol dwar vanobol. zwar voworel."), [
      "zwal→zodozol",
      "dwel→dogudol",
      "dwar→zodozol",
      "zwar→zodozol",
    ]);
  });

  it("rides on the package, so a tagged phrase is one item and one filler", () => {
    const result = parseText("zodozol gumahom zwal voworel.");
    const unit = result.utterances[0]!.bodies[0]!.clause.units[0]!;
    assert.equal(unit.kind, "np");
    if (unit.kind !== "np") return;
    const [item] = unit.coord.parts[0]!.items;
    assert.equal(unit.coord.parts[0]!.items.length, 1);
    assert.equal(item?.kind === "package" ? item.package.tag?.raw : undefined, "zwal");
  });

  it("introduces a new referent with no phrase before it", () => {
    assert.deepEqual(tags("zwal bwel vezeyel. zwer dogudol vogadol."), ["zwer→bwel"]);
  });

  it("tags each item of a list, and a tag listed first is new", () => {
    assert.deepEqual(tags("zodozol zwal zegazol zwel zam voworel. zwer varuvel."), ["zwal→zodozol", "zwel→zegazol", "zwer→zegazol"]);
    assert.deepEqual(tags("zwal zodozol zam voworel. zwar varuvel."), ["zwar→zwal"]);
  });

  it("tags a whole group after a closed fence", () => {
    assert.deepEqual(tags("zodozol zegazol zam zwal voworel. zwar varuvel."), ["zwal→zam", "zwar→zam"]);
    const share = resolveOf("zodozol zegazol zam zwal voworel. zuzazon dwam vanobol.").anaphors.find((a) => a.pronoun.raw === "dwam");
    assert.equal(share?.antecedent?.raw, "zam");
  });

  it("tags a role pointer, which then stays put", () => {
    assert.deepEqual(tags("zuzazon voworel. zaxar zwal varuvel. zolozun voworel. zwar vehuhol."), ["zwal→zaxar", "zwar→zaxar"]);
  });

  it("recalls two tags at once with a stacked vowel, and shares their parts in one event", () => {
    const { anaphors } = resolveOf("zodozol zwal zegazol zwel zam voworel. zwaer varuvel. zuzazon dwaem vanobol.");
    const pair = anaphors.find((a) => a.pronoun.raw === "zwaer");
    assert.deepEqual(pair?.antecedents?.map((word) => word.raw), ["zodozol", "zegazol"]);
    const share = anaphors.find((a) => a.pronoun.raw === "dwaem");
    assert.deepEqual(share?.antecedents?.map((word) => word.raw), ["zodozol", "zegazol"]);
    assert.deepEqual(tags("zwal bwel vezeyel. zwaerx varuvel."), ["zwaerx→zwal"]);
    assert.throws(() => parseText("zuzazon zwal voworel. zolozun zwel varuvel. zehalon dwaem vanobol."), /tag -r or -m/);
  });

  it("retro-tags a resume, and a newer assignment takes the tag over", () => {
    assert.deepEqual(tags("zodozol voworel. dodozor dwel zuzazon vanobol. zwer varuvel."), ["dwel→dodozor", "zwer→dodozor"]);
    assert.deepEqual(tags("zodozol zwal voworel. zegazol zwal varuvel. zwar vehuhol."), ["zwal→zodozol", "zwal→zegazol", "zwar→zegazol"]);
  });

  it("shares A's part in the latest earlier event A took part in, in whatever role", () => {
    const { anaphors } = resolveOf("zuzazon zwal dolozun vabavul. zehalon dwam vanobol.");
    const share = anaphors.find((a) => a.pronoun.raw === "dwam");
    assert.equal(share?.antecedent?.raw, "zuzazon");
    assert.equal(share?.roleVowel, "a");
    const object = resolveOf("zuzazon zwal voworel. zolozun dwar vabavul. zehalon dwam vanobol.").anaphors.find((a) => a.pronoun.raw === "dwam");
    assert.equal(object?.antecedent?.raw, "dwar");
    assert.equal(object?.roleVowel, "u");
  });

  it("keeps a tag through a topic change, and drops it after a goodbye", () => {
    assert.deepEqual(tags("zuzazon zwal voworel. xodozol zodozon vanobol. zwar varuvel."), ["zwal→zuzazon", "zwar→zuzazon"]);
    assert.deepEqual(tags("zuzazon zwal voworel. xavadom zodozol varuvel. zwar vehuhol."), ["zwal→zuzazon", "zwar→zuzazon"]);
    assert.throws(() => parseText("uzazon. olozun. zuzazon zwal voworel. uzazon. olozun. zehalon voworel. zwar vehuhol."), /tag -r or -m/);
  });

  it("rejects a recall or share with no assignment", () => {
    assert.throws(() => parseText("zwar voworel."), /tag -r or -m/);
    assert.throws(() => parseText("zuzazon dwam vanobol."), /tag -r or -m/);
  });
});

describe("resolve — topic (pronouns.md#topic)", () => {
  function topics(text: string): string[] {
    return resolveOf(text)
      .anaphors.filter((a) => a.kind === "topic")
      .map((a) => `${a.pronoun.raw}→${a.antecedent?.raw}`);
  }
  function pointers(text: string): string[] {
    return resolveOf(text)
      .anaphors.filter((a) => a.kind === "pointer")
      .map((a) => `${a.pronoun.raw}→${a.antecedent?.raw}`);
  }

  it("keeps one topic pronoun in every role", () => {
    const text = "xuzazon zozan dolozun vanobol. zolozur dozan vezeyel. zozan varuvel.";
    assert.deepEqual(topics(text), ["zozan→xuzazon", "dozan→xuzazon", "zozan→xuzazon"]);
  });

  it("takes a role compound as the topic, and returns to it by whole stem", () => {
    assert.deepEqual(topics("xaxodeyel zuzazon dozan vanobol. zozan varuvel."), ["dozan→xaxodeyel", "zozan→xaxodeyel"]);
    assert.deepEqual(topics("xaxodeyel. xuzazon. xaxodeyer. zozan varuvel."), ["zozan→xaxodeyer"]);
  });

  it("takes any compound as the topic", () => {
    assert.deepEqual(topics("xonedaxawudal zuzazon dozan vanobol. zozan varuvel."), ["dozan→xonedaxawudal", "zozan→xonedaxawudal"]);
    assert.deepEqual(topics("xuzazoxolozun. zozan varuvel."), ["zozan→xuzazoxolozun"]);
  });

  it("takes a kind as the topic", () => {
    assert.deepEqual(topics("xodozol zuzazon dozan vanobol. zozan varuvel."), ["dozan→xodozol", "zozan→xodozol"]);
  });

  it("is not set by being named first, being the subject, or as for", () => {
    assert.throws(() => parseText("zuzazon voworel. zozan vehuhol."), /topic pronoun/);
    assert.throws(() => parseText("hohagem buzazon zolozun voworel. zozan vehuhol."), /topic pronoun/);
  });

  it("holds through as for and a join, and a return restores it after a side topic", () => {
    assert.deepEqual(topics("xuzazon zozan voworel. hohagem bolozun zodozol varuvel. zozan vehuhol."), ["zozan→xuzazon", "zozan→xuzazon"]);
    assert.deepEqual(topics("xuzazon zozan voworel. xavadom zodozol varuvel. or xuzazor zozan vehuhol."), ["zozan→xuzazon", "zozan→xuzazor"]);
  });

  it("is cleared by next and by the way, and by a goodbye", () => {
    assert.throws(() => parseText("xuzazon zozan voworel. xavadom zodozol varuvel. zozan vehuhol."), /topic pronoun/);
    assert.throws(() => parseText("xuzazon zozan voworel. xevewem zodozol varuvel. zozan vehuhol."), /topic pronoun/);
    assert.throws(() => parseText("uzazon. olozun. xuzazon zozan voworel. uzazon. olozun. zozan vehuhol."), /topic pronoun/);
  });

  it("restarts the role pointers at every topic change", () => {
    assert.throws(() => parseText("zuzazon voworel. xolozun zaxar vehuhol."), /role pointer/);
    assert.deepEqual(pointers("zuzazon voworel. xuzazor zolozun varuvel. zaxar vehuhol."), ["zaxar→zolozun"]);
  });

  it("starts a new stretch when the current topic is returned to", () => {
    assert.throws(() => parseText("xuzazon zolozun voworel. xuzazor zaxar vehuhol."), /role pointer/);
  });

  it("lets a return to a linker stand as that linker again", () => {
    const text = "xuzazon zolozun voworel. xodum zehalon voworel. xodur zaxar vehuhol.";
    assert.deepEqual(pointers(text), ["zaxar→zehalon"]);
  });

  it("leaves a written quote's interior out of the topic and the tags", () => {
    assert.deepEqual(topics("xolozun zolozun vezeyel d[xuzazon zozan zodozol voworel]. zozan vehuhol."), ["zozan→xolozun"]);
    assert.throws(() => parseText("zolozun vezeyel d[zuzazon zwal voworel]. zwar vehuhol."), /tag -r or -m/);
  });

  it("takes -x on the topic pronoun, but never on the generic one", () => {
    assert.deepEqual(topics("x@<Sam> zozan voworel."), ["zozan→x@<Sam>"]);
    assert.deepEqual(topics("x<odozo> zozan gumazom."), ["zozan→x<odozo>"]);
    assert.deepEqual(topics("x@[onoron olozun] zozan vezeyol."), ["zozan→x@[onoron olozun]"]);
    assert.throws(() => parseText("zobenx voworel."), /generic pronoun/);
  });
});

describe("resolve — role anaphors (roles.md)", () => {
  it("binds zaxozowor to the prior conflict verb", () => {
    const { anaphors } = resolveOf("zar dugobon vozowol. zaxozowor vurunul.");
    const role = anaphors.find((a) => a.kind === "role");
    assert.ok(role);
    assert.equal(role!.pronoun.raw, "zaxozowor");
    assert.equal(role!.roleVowel, "a");
    assert.equal(role!.antecedent?.raw, "vozowol");
  });

  it("binds zexazabur as place of the prior scream verb", () => {
    const { anaphors } = resolveOf("zululon vazabul. zuzazon dexazabur vayagol.");
    const role = anaphors.find((a) => a.kind === "role");
    assert.ok(role);
    assert.equal(role!.pronoun.raw, "dexazabur");
    assert.equal(role!.roleVowel, "e");
    assert.equal(role!.antecedent?.raw, "vazabul");
  });

  it("binds zoxezeyor as recipient of the prior tell verb", () => {
    const { anaphors } = resolveOf("zuzazon vezeyol. zoxezeyor vurunul.");
    const role = anaphors.find((a) => a.kind === "role");
    assert.ok(role);
    assert.equal(role!.pronoun.raw, "zoxezeyor");
    assert.equal(role!.roleVowel, "o");
    assert.equal(role!.antecedent?.raw, "vezeyol");
  });
});

describe("resolve — yes/no vs fill-ask (questions.md)", () => {
  it("classifies yol zugobon vawalal. as yes/no", () => {
    const { asks } = resolveOf("yol zugobon vawalal.");
    assert.equal(asks[0]!.kind, "yesNo");
    assert.equal(asks[0]!.gaps.length, 0);
  });

  it("classifies yol zar vawalal. as fill-ask", () => {
    const { asks, anaphors } = resolveOf("yol zar vawalal.");
    assert.equal(asks[0]!.kind, "fillAsk");
    assert.equal(asks[0]!.gaps.map((g) => g.raw).join(" "), "zar");
    assert.equal(anaphors.length, 0);
  });

  it("orders fill-all gaps zar … dar", () => {
    const { asks } = resolveOf("yol zar veyel dar.");
    assert.equal(asks[0]!.kind, "fillAsk");
    assert.deepEqual(
      asks[0]!.gaps.map((g) => g.raw),
      ["zar", "dar"],
    );
  });

  it("classifies yom zar vawalal. as fill-ask", () => {
    const { asks } = resolveOf("yom zar vawalal.");
    assert.equal(asks[0]!.kind, "fillAsk");
  });

  it("gives a blank in a dorl dependent to the dependent, and one in a darl dependent to yol", () => {
    const whether = resolveOf("yol zehon vugul dorl zar voworel.").asks[0]!;
    assert.equal(whether.kind, "yesNo");
    assert.deepEqual(whether.inner?.map((g) => g.raw), ["zar"]);
    const that = resolveOf("yol zehon vovemol darl zar voworel.").asks[0]!;
    assert.equal(that.kind, "fillAsk");
    assert.deepEqual(that.gaps.map((g) => g.raw), ["zar"]);
    const both = resolveOf("yol zar vugul dorl zar voworel.").asks[0]!;
    assert.deepEqual(both.gaps.map((g) => g.raw), ["zar"]);
    assert.equal(both.inner?.length, 1);
  });
});

describe("resolve — SHARED (comparatives.md / numbers.md)", () => {
  it("reads rank + SHARED scale as scale", () => {
    const { shared } = resolveOf("zuzazon zululon zel gomonum.");
    assert.equal(shared.length, 1);
    assert.equal(shared[0]!.role, "scale");
    assert.equal(shared[0]!.join.raw, "zel");
    assert.equal(shared[0]!.shared.word.raw, "gomonum");
  });

  it("reads rank + SHARED manner /h/ as scale", () => {
    const { shared } = resolveOf("zululon zuzazon zel huhovom vawalal.");
    assert.equal(shared.length, 1);
    assert.equal(shared[0]!.role, "scale");
    assert.equal(shared[0]!.join.raw, "zel");
    assert.equal(shared[0]!.shared.word.raw, "huhovom");
  });

  it("reads ae + SHARED manner /h/ as equative", () => {
    const { shared } = resolveOf("zululon zuzazon zoel huhovom vawalal.");
    assert.equal(shared[0]!.role, "equative");
    assert.equal(shared[0]!.shared.word.raw, "huhovom");
  });

  it("reads set a + SHARED as distribute", () => {
    const { shared } = resolveOf("zodaval zegazol zal gomonum.");
    assert.equal(shared[0]!.role, "distribute");
  });

  it("reads ae + SHARED as equative", () => {
    const { shared } = resolveOf("zuzazon zululon zoel gomonum.");
    assert.equal(shared[0]!.role, "equative");
  });

  it("reads sequence oe with two numbers + SHARED as a scale, not a range", () => {
    const { shared } = resolveOf("z+3 z+5 zael gumedul.");
    assert.equal(shared[0]!.role, "scale");
    assert.equal(shared[0]!.shared.word.raw, "gumedul");
  });

  it("reads rank e with two numbers + SHARED as a scale, not a range", () => {
    const { shared } = resolveOf("z+3 z+5 zel gumedul.");
    assert.equal(shared[0]!.role, "scale");
  });

  it("leaves bare z+3 z+5 zel without SHARED", () => {
    const { shared } = resolveOf("z+3 z+5 zel.");
    assert.equal(shared.length, 0);
  });
});
