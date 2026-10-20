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
    const { anaphors } = resolveOf("zuzozen dudozol vawebol. zolazun dudozom vawebol. zuzozen dudozorl vawebol. zolazun dudozorm vawebol. zuzozen dudozor vawebol.");
    assert.deepEqual(
      anaphors.map((bind) => bind.antecedent?.raw),
      ["dudozol", "dudozom", "dudozorm"],
    );
  });

  it("reads a pinned resume as the one both know when that sense never came up", () => {
    const { anaphors } = resolveOf("zudozol vawalal. zudozorm vayul.");
    assert.equal(anaphors[0]?.antecedent, undefined);
  });

  it("never binds a short cut of the root", () => {
    assert.throws(() => parseText("zululon vawalal. zulur vayul."), /whole stem/);
  });

  it("binds zudavar to the dog, skipping the book", () => {
    const { anaphors } = resolveOf("zudaval vulazul. zunedol gelel. zudavar vawalal.");
    assert.equal(anaphors[0]!.pronoun.raw, "zudavar");
    assert.equal(anaphors[0]!.antecedent?.raw, "zudaval");
  });

  it("binds vawalar to the prior verb (pronouns.md intermediate)", () => {
    const { anaphors } = resolveOf("zuzozen vawalal. zululon vawalar.");
    assert.equal(anaphors[0]!.pronoun.raw, "vawalar");
    assert.equal(anaphors[0]!.antecedent?.raw, "vawalal");
  });

  it("matches a compound only on its whole stem (bed is not bedroom)", () => {
    const part = resolveOf("zobaholurahal vewurel. zobahor vuhohol.");
    assert.equal(part.anaphors[0]!.antecedent, undefined);
    const whole = resolveOf("zobaholurahal vewurel. zobaholurahar vuhohol.");
    assert.equal(whole.anaphors[0]!.antecedent?.raw, "zobaholurahal");
  });

  it("matches a hook compound only on its whole stem (walk is not enter)", () => {
    assert.equal(resolveOf("zuzozen vewurelal. zolazun vewurer.").anaphors[0]!.antecedent, undefined);
    assert.equal(resolveOf("zuzozen vewurelal. zolazun vewurelar.").anaphors[0]!.antecedent?.raw, "vewurelal");
  });

  it("leaves an opening resume unresolved", () => {
    const { anaphors } = resolveOf("zodogonor vawalal.");
    assert.equal(anaphors[0]!.pronoun.raw, "zodogonor");
    assert.equal(anaphors[0]!.antecedent, undefined);
  });

  it("binds an ability resume on its whole stem and keeps the ability (intention.md#ability)", () => {
    const { anaphors } = resolveOf("zuzozen vewurexal. zugobon vewurexar.");
    assert.equal(anaphors[0]!.pronoun.raw, "vewurexar");
    assert.equal(anaphors[0]!.antecedent?.raw, "vewurexal");
  });

  it("does not bind statement zar as a content anaphor", () => {
    const { anaphors, asks } = resolveOf("zar vawalal.");
    assert.equal(anaphors.length, 0);
    assert.equal(asks[0]!.kind, "none");
  });

  it("leaves an opening full-root ability resume unresolved", () => {
    const { anaphors } = resolveOf("zuzozen vewurexar.");
    assert.equal(anaphors[0]!.pronoun.raw, "vewurexar");
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
    assert.deepEqual(pointers("zuzozen vewurel. zaxar vuhohol."), ["zaxar→zuzozen"]);
    assert.deepEqual(pointers("zuzozen dolazun vawebol. zuxar varuvel."), ["zuxar→dolazun"]);
  });

  it("a on a core role skips predicates without that slot", () => {
    assert.deepEqual(pointers("zuzozen dolazun vawebol. zuzozen vewurel. zuxar varuvel."), ["zuxar→dolazun"]);
    assert.deepEqual(pointers("zuzozen vezuyel darl. verulal. zaxar vewurel."), ["zaxar→zuzozen"]);
  });

  it("o: the nearest earlier predicate with someone else in that role", () => {
    assert.deepEqual(pointers("zuzozen vewurel. zolazun varuvel. zolazun vuhohol. zaxor vezuvol."), ["zaxor→zuzozen"]);
  });

  it("o compares referents, so a resumed name is the same person", () => {
    assert.throws(() => parseText("zuzozen vewurel. zuzozer vuhohol. zaxor vezuvol."), /needs an earlier predicate/);
  });

  it("e: this clause's predicate", () => {
    assert.deepEqual(pointers("zuzozen vawebol daxer."), ["daxer→zuzozen"]);
  });

  it("the extra party is a verb's unhosted /b/ or a /ɡ/ predicate's hosted /b/", () => {
    assert.deepEqual(pointers("zuzozen bolazun vezuyel darl. zoxar varuvel."), ["zoxar→bolazun"]);
    assert.deepEqual(pointers("zuzozen ganam bolazun. zoxar varuvel."), ["zoxar→bolazun"]);
  });

  it("the scene is a place hook's /b/, else during's, else the event's own", () => {
    assert.deepEqual(pointers("zuzozen vezuvol al bahehal. zolazun dexar vawebol."), ["dexar→bahehal"]);
    assert.deepEqual(pointers("zuzozen vezuvol huwem bevulul. zolazun dexar vawebol."), ["dexar→bevulul"]);
    assert.deepEqual(pointers("zuzozen vezuvol. zolazun dexar vawebol."), ["dexar→vezuvol"]);
  });

  it("a stacked role reads its paired hook's /b/, else the event's own", () => {
    assert.deepEqual(pointers("zuzozen vavuvul ael bodul. zolazun daexar vawebol."), ["daexar→bodul"]);
    assert.deepEqual(pointers("zuzozen vavuvul. zolazun daexar vawebol."), ["daexar→vavuvul"]);
  });

  it("a joined slot is one group", () => {
    assert.deepEqual(pointers("zuzozen zolazun zal vewurel. zaxarx vuhohol."), ["zaxarx→zal"]);
    assert.deepEqual(pointers("zuzozen zolazun zel gamahum. zaxarx varuvel."), ["zaxarx→zel"]);
  });

  it("span interiors add no anchors", () => {
    assert.deepEqual(pointers("zuzozen vewurel. d[zolazun varuvel] vawebol. zaxar vuhohol."), ["zaxar→zuzozen"]);
  });

  it("fills the holder slot of a holder seam", () => {
    assert.deepEqual(pointers("zuzozen vewurel. zolazun thunemaxar verurul."), ["thunemaxar→zuzozen"]);
  });

  it("is a viewpoint lateral's facing anchor (roles.md#viewpoint-laterals)", () => {
    assert.deepEqual(pointers("zuzozen vewurel. zolazun vuhohol howuhethaxar."), ["howuhethaxar→zuzozen"]);
    assert.deepEqual(pointers("zuzozen vewurel howuhethaxer."), ["howuhethaxer→zuzozen"]);
    assert.throws(() => parseText("zolazun vuhohol howuhethaxar."), /earlier predicate/);
  });

  it("-l: a new one of the participant's kind, never the same referent", () => {
    assert.deepEqual(pointers("zuzozen dugedol vawebol. zolazun duxal vawebol."), ["duxal→dugedol"]);
    const { anaphors } = resolveOf("zuzozen dugedol vawebol. zolazun duxal vawebol. zudozol duxar vawebol.");
    assert.equal(anaphors.find((a) => a.pronoun.raw === "duxar")?.antecedent?.raw, "duxal");
  });

  it("-m: the participant's part, not the participant", () => {
    assert.deepEqual(pointers("zuzozen dolazun vanuvul. zaxam genemum."), ["zaxam→zuzozen"]);
  });

  it("u: the latest predicate that left that role unsaid", () => {
    assert.deepEqual(pointers("dugedol vawebol. zaxur varuvel."), ["zaxur→vawebol"]);
    assert.deepEqual(pointers("dugedol vawebol. zaxum genemum."), ["zaxum→vawebol"]);
    assert.throws(() => parseText("zuzozen vewurel. zaxur vuhohol."), /earlier predicate/);
  });

  it("o on a stacked role counts only overt fillers", () => {
    assert.deepEqual(pointers("zuzozen vavuvul ael bodul. zolazun vavuvul ael bedel. zuzozen vavuvul. zuzozen daexor vawebol."), ["daexor→bodul"]);
  });

  it("rejects a share with e or -x, a new one with u or on a special pronoun", () => {
    assert.throws(() => parseText("zuzozen dolazun vanuvul. zaxem genemum."), /never takes the self vowel/);
    assert.throws(() => parseText("zuzozen dolazun vanuvul. zaxamx genemum."), /takes no -x/);
    assert.throws(() => parseText("dugedol vawebol. zaxul varuvel."), /unsaid pointer/);
    assert.throws(() => parseText("zamun vewurel. zaxal vuhohol."), /special, topic, or generic/);
    assert.throws(() => parseText("zuzozen dolazun vanuvul. zexom genemum."), /except the scene/);
  });

  it("rejects pointers with no referent, on the wrong slot, o on an implicit role, or e on its own slot", () => {
    assert.throws(() => parseText("zaxar vewurel."), /needs an earlier predicate/);
    assert.throws(() => parseText("zuzozen vewurel. vaxar."), /fills \/z\//);
    assert.throws(() => parseText("zuzozen vewurel. dexor vawebol."), /except the scene/);
    assert.throws(() => parseText("zaxer vewurel."), /not the one it fills/);
  });
});

describe("resolve — span and number anaphors", () => {
  it("has no span resume: a span is an ordinary noun for a role pointer (spans.md)", () => {
    assert.throws(() => parseText("d[hi] vawalal. d[=] vayul."));
    const { anaphors } = resolveOf("zolazun d[hi] vezuyel. zuzozen duxar vawebol.");
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
    const question = resolveOf("yol zagozolx g=+ vayul.");
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
    assert.deepEqual(tags("zudozol zwal dugedol dwel vawebol. zagozol dwar vawebol. zwar vewurel."), [
      "zwal→zudozol",
      "dwel→dugedol",
      "dwar→zudozol",
      "zwar→zudozol",
    ]);
  });

  it("rides on the package, so a tagged phrase is one item and one filler", () => {
    const result = parseText("zudozol gamahum zwal vewurel.");
    const unit = result.utterances[0]!.bodies[0]!.clause.units[0]!;
    assert.equal(unit.kind, "np");
    if (unit.kind !== "np") return;
    const [item] = unit.coord.parts[0]!.items;
    assert.equal(unit.coord.parts[0]!.items.length, 1);
    assert.equal(item?.kind === "package" ? item.package.tag?.raw : undefined, "zwal");
  });

  it("introduces a new referent with no phrase before it", () => {
    assert.deepEqual(tags("zwal bwel vezuyel. zwer dugedol vagedal."), ["zwer→bwel"]);
  });

  it("tags each item of a list, and a tag listed first is new", () => {
    assert.deepEqual(tags("zudozol zwal zagozol zwel zam vewurel. zwer varuvel."), ["zwal→zudozol", "zwel→zagozol", "zwer→zagozol"]);
    assert.deepEqual(tags("zwal zudozol zam vewurel. zwar varuvel."), ["zwar→zwal"]);
  });

  it("tags a whole group after a closed fence", () => {
    assert.deepEqual(tags("zudozol zagozol zam zwal vewurel. zwar varuvel."), ["zwal→zam", "zwar→zam"]);
    const share = resolveOf("zudozol zagozol zam zwal vewurel. zuzozen dwam vawebol.").anaphors.find((a) => a.pronoun.raw === "dwam");
    assert.equal(share?.antecedent?.raw, "zam");
  });

  it("tags a role pointer, which then stays put", () => {
    assert.deepEqual(tags("zuzozen vewurel. zaxar zwal varuvel. zolazun vewurel. zwar vuhohol."), ["zwal→zaxar", "zwar→zaxar"]);
  });

  it("recalls two tags at once with a stacked vowel, and shares their parts in one event", () => {
    const { anaphors } = resolveOf("zudozol zwal zagozol zwel zam vewurel. zwaer varuvel. zuzozen dwaem vawebol.");
    const pair = anaphors.find((a) => a.pronoun.raw === "zwaer");
    assert.deepEqual(pair?.antecedents?.map((word) => word.raw), ["zudozol", "zagozol"]);
    const share = anaphors.find((a) => a.pronoun.raw === "dwaem");
    assert.deepEqual(share?.antecedents?.map((word) => word.raw), ["zudozol", "zagozol"]);
    assert.deepEqual(tags("zwal bwel vezuyel. zwaerx varuvel."), ["zwaerx→zwal"]);
    assert.throws(() => parseText("zuzozen zwal vewurel. zolazun zwel varuvel. zuhelan dwaem vawebol."), /tag -r or -m/);
  });

  it("retro-tags a resume, and a newer assignment takes the tag over", () => {
    assert.deepEqual(tags("zudozol vewurel. dudozor dwel zuzozen vawebol. zwer varuvel."), ["dwel→dudozor", "zwer→dudozor"]);
    assert.deepEqual(tags("zudozol zwal vewurel. zagozol zwal varuvel. zwar vuhohol."), ["zwal→zudozol", "zwal→zagozol", "zwar→zagozol"]);
  });

  it("shares A's part in the latest earlier event A took part in, in whatever role", () => {
    const { anaphors } = resolveOf("zuzozen zwal dolazun vanuvul. zuhelan dwam vawebol.");
    const share = anaphors.find((a) => a.pronoun.raw === "dwam");
    assert.equal(share?.antecedent?.raw, "zuzozen");
    assert.equal(share?.roleVowel, "a");
    const object = resolveOf("zuzozen zwal vewurel. zolazun dwar vanuvul. zuhelan dwam vawebol.").anaphors.find((a) => a.pronoun.raw === "dwam");
    assert.equal(object?.antecedent?.raw, "dwar");
    assert.equal(object?.roleVowel, "u");
  });

  it("keeps a tag through a topic change, and drops it after a goodbye", () => {
    assert.deepEqual(tags("zuzozen zwal vewurel. xudozol zudozon vawebol. zwar varuvel."), ["zwal→zuzozen", "zwar→zuzozen"]);
    assert.deepEqual(tags("zuzozen zwal vewurel. xuvedam zudozol varuvel. zwar vuhohol."), ["zwal→zuzozen", "zwar→zuzozen"]);
    assert.throws(() => parseText("uzozen. olazun. zuzozen zwal vewurel. uzozen. olazun. zuhelan vewurel. zwar vuhohol."), /tag -r or -m/);
  });

  it("rejects a recall or share with no assignment", () => {
    assert.throws(() => parseText("zwar vewurel."), /tag -r or -m/);
    assert.throws(() => parseText("zuzozen dwam vawebol."), /tag -r or -m/);
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
    const text = "xuzozen zozan dolazun vawebol. zolazur dozan vezuyel. zozan varuvel.";
    assert.deepEqual(topics(text), ["zozan→xuzozen", "dozan→xuzozen", "zozan→xuzozen"]);
  });

  it("takes a role compound as the topic, and returns to it by whole stem", () => {
    assert.deepEqual(topics("xaxuduyel zuzozen dozan vawebol. zozan varuvel."), ["dozan→xaxuduyel", "zozan→xaxuduyel"]);
    assert.deepEqual(topics("xaxuduyel. xuzozen. xaxuduyer. zozan varuvel."), ["zozan→xaxuduyer"]);
  });

  it("takes any compound as the topic", () => {
    assert.deepEqual(topics("xubedaxuyudal zuzozen dozan vawebol. zozan varuvel."), ["dozan→xubedaxuyudal", "zozan→xubedaxuyudal"]);
    assert.deepEqual(topics("xuzozexolazun. zozan varuvel."), ["zozan→xuzozexolazun"]);
  });

  it("takes a kind as the topic", () => {
    assert.deepEqual(topics("xudozol zuzozen dozan vawebol. zozan varuvel."), ["dozan→xudozol", "zozan→xudozol"]);
  });

  it("is not set by being named first, being the subject, or as for", () => {
    assert.throws(() => parseText("zuzozen vewurel. zozan vuhohol."), /topic pronoun/);
    assert.throws(() => parseText("hahugem buzozen zolazun vewurel. zozan vuhohol."), /topic pronoun/);
  });

  it("holds through as for and a join, and a return restores it after a side topic", () => {
    assert.deepEqual(topics("xuzozen zozan vewurel. hahugem bolazun zudozol varuvel. zozan vuhohol."), ["zozan→xuzozen", "zozan→xuzozen"]);
    assert.deepEqual(topics("xuzozen zozan vewurel. xuvedam zudozol varuvel. or xuzozer zozan vuhohol."), ["zozan→xuzozen", "zozan→xuzozer"]);
  });

  it("is cleared by next and by the way, and by a goodbye", () => {
    assert.throws(() => parseText("xuzozen zozan vewurel. xuvedam zudozol varuvel. zozan vuhohol."), /topic pronoun/);
    assert.throws(() => parseText("xuzozen zozan vewurel. xuvewem zudozol varuvel. zozan vuhohol."), /topic pronoun/);
    assert.throws(() => parseText("uzozen. olazun. xuzozen zozan vewurel. uzozen. olazun. zozan vuhohol."), /topic pronoun/);
  });

  it("restarts the role pointers at every topic change", () => {
    assert.throws(() => parseText("zuzozen vewurel. xolazun zaxar vuhohol."), /role pointer/);
    assert.deepEqual(pointers("zuzozen vewurel. xuzozer zolazun varuvel. zaxar vuhohol."), ["zaxar→zolazun"]);
  });

  it("starts a new stretch when the current topic is returned to", () => {
    assert.throws(() => parseText("xuzozen zolazun vewurel. xuzozer zaxar vuhohol."), /role pointer/);
  });

  it("lets a return to a linker stand as that linker again", () => {
    const text = "xuzozen zolazun vewurel. xodum zuhelan vewurel. xodur zaxar vuhohol.";
    assert.deepEqual(pointers(text), ["zaxar→zuhelan"]);
  });

  it("leaves a written quote's interior out of the topic and the tags", () => {
    assert.deepEqual(topics("xolazun zolazun vezuyel d[xuzozen zozan zudozol vewurel]. zozan vuhohol."), ["zozan→xolazun"]);
    assert.throws(() => parseText("zolazun vezuyel d[zuzozen zwal vewurel]. zwar vuhohol."), /tag -r or -m/);
  });

  it("takes -x on the topic pronoun, but never on the generic one", () => {
    assert.deepEqual(topics("x@<Sam> zozan vewurel."), ["zozan→x@<Sam>"]);
    assert.deepEqual(topics("x<udozo> zozan gamezom."), ["zozan→x<udozo>"]);
    assert.deepEqual(topics("x@[onuron olazun] zozan vezuyol."), ["zozan→x@[onuron olazun]"]);
    assert.throws(() => parseText("zobenx vewurel."), /generic pronoun/);
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

  it("binds zexezobur as place of the prior scream verb", () => {
    const { anaphors } = resolveOf("zululon vezobul. zuzozen dexezobur vayugol.");
    const role = anaphors.find((a) => a.kind === "role");
    assert.ok(role);
    assert.equal(role!.pronoun.raw, "dexezobur");
    assert.equal(role!.roleVowel, "e");
    assert.equal(role!.antecedent?.raw, "vezobul");
  });

  it("binds zoxezuyor as recipient of the prior tell verb", () => {
    const { anaphors } = resolveOf("zuzozen vezuyol. zoxezuyor vurunul.");
    const role = anaphors.find((a) => a.kind === "role");
    assert.ok(role);
    assert.equal(role!.pronoun.raw, "zoxezuyor");
    assert.equal(role!.roleVowel, "o");
    assert.equal(role!.antecedent?.raw, "vezuyol");
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
    const whether = resolveOf("yol zehon vugul dorl zar vewurel.").asks[0]!;
    assert.equal(whether.kind, "yesNo");
    assert.deepEqual(whether.inner?.map((g) => g.raw), ["zar"]);
    const that = resolveOf("yol zehon vovemol darl zar vewurel.").asks[0]!;
    assert.equal(that.kind, "fillAsk");
    assert.deepEqual(that.gaps.map((g) => g.raw), ["zar"]);
    const both = resolveOf("yol zar vugul dorl zar vewurel.").asks[0]!;
    assert.deepEqual(both.gaps.map((g) => g.raw), ["zar"]);
    assert.equal(both.inner?.length, 1);
  });
});

describe("resolve — SHARED (comparatives.md / numbers.md)", () => {
  it("reads rank + SHARED scale as scale", () => {
    const { shared } = resolveOf("zuzozen zululon zel gomoldam.");
    assert.equal(shared.length, 1);
    assert.equal(shared[0]!.role, "scale");
    assert.equal(shared[0]!.join.raw, "zel");
    assert.equal(shared[0]!.shared.word.raw, "gomoldam");
  });

  it("reads rank + SHARED manner /h/ as scale", () => {
    const { shared } = resolveOf("zululon zuzozen zel huhevom vawalal.");
    assert.equal(shared.length, 1);
    assert.equal(shared[0]!.role, "scale");
    assert.equal(shared[0]!.join.raw, "zel");
    assert.equal(shared[0]!.shared.word.raw, "huhevom");
  });

  it("reads ae + SHARED manner /h/ as equative", () => {
    const { shared } = resolveOf("zululon zuzozen zoel huhevom vawalal.");
    assert.equal(shared[0]!.role, "equative");
    assert.equal(shared[0]!.shared.word.raw, "huhevom");
  });

  it("reads set a + SHARED as distribute", () => {
    const { shared } = resolveOf("zudaval zagozol zal gomoldam.");
    assert.equal(shared[0]!.role, "distribute");
  });

  it("reads ae + SHARED as equative", () => {
    const { shared } = resolveOf("zuzozen zululon zoel gomoldam.");
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
