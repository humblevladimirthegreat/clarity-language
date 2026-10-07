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
    const { anaphors } = resolveOf("zazawan dodogal vahahal. zalahen dodogam vahahal. zazawan dodogarl vahahal. zalahen dodogarm vahahal. zazawan dodogar vahahal.");
    assert.deepEqual(
      anaphors.map((bind) => bind.antecedent?.raw),
      ["dodogal", "dodogam", "dodogarm"],
    );
  });

  it("reads a pinned resume as the one both know when that sense never came up", () => {
    const { anaphors } = resolveOf("zodogal vawalal. zodogarm vayul.");
    assert.equal(anaphors[0]?.antecedent, undefined);
  });

  it("never binds a short cut of the root", () => {
    assert.throws(() => parseText("zululon vawalal. zulur vayul."), /whole stem/);
  });

  it("binds zadagar to the dog, skipping the book", () => {
    const { anaphors } = resolveOf("zadagal velebel. zabogul gelel. zadagar vawalal.");
    assert.equal(anaphors[0]!.pronoun.raw, "zadagar");
    assert.equal(anaphors[0]!.antecedent?.raw, "zadagal");
  });

  it("binds vawalar to the prior verb (pronouns.md intermediate)", () => {
    const { anaphors } = resolveOf("zazawan vawalal. zululon vawalar.");
    assert.equal(anaphors[0]!.pronoun.raw, "vawalar");
    assert.equal(anaphors[0]!.antecedent?.raw, "vawalal");
  });

  it("matches a compound only on its whole stem (bed is not bedroom)", () => {
    const part = resolveOf("zebedalahazal vowogal. zebedar vehahel.");
    assert.equal(part.anaphors[0]!.antecedent, undefined);
    const whole = resolveOf("zebedalahazal vowogal. zebedalahazar vehahel.");
    assert.equal(whole.anaphors[0]!.antecedent?.raw, "zebedalahazal");
  });

  it("matches a hook compound only on its whole stem (walk is not enter)", () => {
    assert.equal(resolveOf("zazawan vowogalal. zalahen vowogar.").anaphors[0]!.antecedent, undefined);
    assert.equal(resolveOf("zazawan vowogalal. zalahen vowogalar.").anaphors[0]!.antecedent?.raw, "vowogalal");
  });

  it("leaves an opening resume unresolved", () => {
    const { anaphors } = resolveOf("zodogor vawalal.");
    assert.equal(anaphors[0]!.pronoun.raw, "zodogor");
    assert.equal(anaphors[0]!.antecedent, undefined);
  });

  it("binds an ability resume on its whole stem and keeps the ability (intention.md#ability)", () => {
    const { anaphors } = resolveOf("zazawan vowogaxal. zugobon vowogaxar.");
    assert.equal(anaphors[0]!.pronoun.raw, "vowogaxar");
    assert.equal(anaphors[0]!.antecedent?.raw, "vowogaxal");
  });

  it("does not bind statement zar as a content anaphor", () => {
    const { anaphors, asks } = resolveOf("zar vawalal.");
    assert.equal(anaphors.length, 0);
    assert.equal(asks[0]!.kind, "none");
  });

  it("leaves an opening full-root ability resume unresolved", () => {
    const { anaphors } = resolveOf("zazawan vowogaxar.");
    assert.equal(anaphors[0]!.pronoun.raw, "vowogaxar");
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
    assert.deepEqual(pointers("zazawan vowogal. zaxar vehahel."), ["zaxar→zazawan"]);
    assert.deepEqual(pointers("zazawan dalahen vahahal. zuxar varahal."), ["zuxar→dalahen"]);
  });

  it("a on a core role skips predicates without that slot", () => {
    assert.deepEqual(pointers("zazawan dalahen vahahal. zazawan vowogal. zuxar varahal."), ["zuxar→dalahen"]);
    assert.deepEqual(pointers("zazawan vezebel darl. verehel. zaxar vowogal."), ["zaxar→zazawan"]);
  });

  it("o: the nearest earlier predicate with someone else in that role", () => {
    assert.deepEqual(pointers("zazawan vowogal. zalahen varahal. zalahen vehahel. zaxor vezebal."), ["zaxor→zazawan"]);
  });

  it("o compares referents, so a resumed name is the same person", () => {
    assert.throws(() => parseText("zazawan vowogal. zazawar vehahel. zaxor vezebal."), /needs an earlier predicate/);
  });

  it("e: this clause's predicate", () => {
    assert.deepEqual(pointers("zazawan vahahal daxer."), ["daxer→zazawan"]);
  });

  it("the extra party is a verb's unhosted /b/ or a /ɡ/ predicate's hosted /b/", () => {
    assert.deepEqual(pointers("zazawan balahen vezebel darl. zoxar varahal."), ["zoxar→balahen"]);
    assert.deepEqual(pointers("zazawan ganam balahen. zoxar varahal."), ["zoxar→balahen"]);
  });

  it("the scene is a place hook's /b/, else during's, else the event's own", () => {
    assert.deepEqual(pointers("zazawan vezebal al bahazal. zalahen dexar vahahal."), ["dexar→bahazal"]);
    assert.deepEqual(pointers("zazawan vezebal huwem bavodel. zalahen dexar vahahal."), ["dexar→bavodel"]);
    assert.deepEqual(pointers("zazawan vezebal. zalahen dexar vahahal."), ["dexar→vezebal"]);
  });

  it("a stacked role reads its paired hook's /b/, else the event's own", () => {
    assert.deepEqual(pointers("zazawan vavadal ael bodul. zalahen daexar vahahal."), ["daexar→bodul"]);
    assert.deepEqual(pointers("zazawan vavadal. zalahen daexar vahahal."), ["daexar→vavadal"]);
  });

  it("a joined slot is one group", () => {
    assert.deepEqual(pointers("zazawan zalahen zal vowogal. zaxarx vehahel."), ["zaxarx→zal"]);
    assert.deepEqual(pointers("zazawan zalahen zel gamadam. zaxarx varahal."), ["zaxarx→zel"]);
  });

  it("span interiors add no anchors", () => {
    assert.deepEqual(pointers("zazawan vowogal. d[zalahen varahal] vahahal. zaxar vehahel."), ["zaxar→zazawan"]);
  });

  it("fills the holder slot of a holder seam", () => {
    assert.deepEqual(pointers("zazawan vowogal. zalahen thunemaxar vedabal."), ["thunemaxar→zazawan"]);
  });

  it("is a viewpoint lateral's facing anchor (roles.md#viewpoint-laterals)", () => {
    assert.deepEqual(pointers("zazawan vowogal. zalahen vehahel hewezathaxar."), ["hewezathaxar→zazawan"]);
    assert.deepEqual(pointers("zazawan vowogal hewezathaxer."), ["hewezathaxer→zazawan"]);
    assert.throws(() => parseText("zalahen vehahel hewezathaxar."), /earlier predicate/);
  });

  it("-l: a new one of the participant's kind, never the same referent", () => {
    assert.deepEqual(pointers("zazawan dugugol vahahal. zalahen duxal vahahal."), ["duxal→dugugol"]);
    const { anaphors } = resolveOf("zazawan dugugol vahahal. zalahen duxal vahahal. zodogal duxar vahahal.");
    assert.equal(anaphors.find((a) => a.pronoun.raw === "duxar")?.antecedent?.raw, "duxal");
  });

  it("-m: the participant's part, not the participant", () => {
    assert.deepEqual(pointers("zazawan dalahen vabahel. zaxam genehem."), ["zaxam→zazawan"]);
  });

  it("u: the latest predicate that left that role unsaid", () => {
    assert.deepEqual(pointers("dugugol vahahal. zaxur varahal."), ["zaxur→vahahal"]);
    assert.deepEqual(pointers("dugugol vahahal. zaxum genehem."), ["zaxum→vahahal"]);
    assert.throws(() => parseText("zazawan vowogal. zaxur vehahel."), /earlier predicate/);
  });

  it("o on a stacked role counts only overt fillers", () => {
    assert.deepEqual(pointers("zazawan vavadal ael bodul. zalahen vavadal ael bedel. zazawan vavadal. zazawan daexor vahahal."), ["daexor→bodul"]);
  });

  it("rejects a share with e or -x, a new one with u or on a special pronoun", () => {
    assert.throws(() => parseText("zazawan dalahen vabahel. zaxem genehem."), /never takes the self vowel/);
    assert.throws(() => parseText("zazawan dalahen vabahel. zaxamx genehem."), /takes no -x/);
    assert.throws(() => parseText("dugugol vahahal. zaxul varahal."), /unsaid pointer/);
    assert.throws(() => parseText("zamun vowogal. zaxal vehahel."), /special, topic, or generic/);
    assert.throws(() => parseText("zazawan dalahen vabahel. zexom genehem."), /except the scene/);
  });

  it("rejects pointers with no referent, on the wrong slot, o on an implicit role, or e on its own slot", () => {
    assert.throws(() => parseText("zaxar vowogal."), /needs an earlier predicate/);
    assert.throws(() => parseText("zazawan vowogal. vaxar."), /fills \/z\//);
    assert.throws(() => parseText("zazawan vowogal. dexor vahahal."), /except the scene/);
    assert.throws(() => parseText("zaxer vowogal."), /not the one it fills/);
  });
});

describe("resolve — span and number anaphors", () => {
  it("has no span resume: a span is an ordinary noun for a role pointer (spans.md)", () => {
    assert.throws(() => parseText("d[hi] vawalal. d[=] vayul."));
    const { anaphors } = resolveOf("zalahen d[hi] vezebel. zazawan duxar vahahal.");
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
    const question = resolveOf("yol zagadulx g=+ vayul.");
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
    assert.deepEqual(tags("zodogal zwal dugugol dwel vahahal. zagadul dwar vahahal. zwar vowogal."), [
      "zwal→zodogal",
      "dwel→dugugol",
      "dwar→zodogal",
      "zwar→zodogal",
    ]);
  });

  it("rides on the package, so a tagged phrase is one item and one filler", () => {
    const result = parseText("zodogal gamadam zwal vowogal.");
    const unit = result.utterances[0]!.bodies[0]!.clause.units[0]!;
    assert.equal(unit.kind, "np");
    if (unit.kind !== "np") return;
    const [item] = unit.coord.parts[0]!.items;
    assert.equal(unit.coord.parts[0]!.items.length, 1);
    assert.equal(item?.kind === "package" ? item.package.tag?.raw : undefined, "zwal");
  });

  it("introduces a new referent with no phrase before it", () => {
    assert.deepEqual(tags("zwal bwel vezebel. zwer dugugol vagadel."), ["zwer→bwel"]);
  });

  it("tags each item of a list, and a tag listed first is new", () => {
    assert.deepEqual(tags("zodogal zwal zagadul zwel zam vowogal. zwer varahal."), ["zwal→zodogal", "zwel→zagadul", "zwer→zagadul"]);
    assert.deepEqual(tags("zwal zodogal zam vowogal. zwar varahal."), ["zwar→zwal"]);
  });

  it("tags a whole group after a closed fence", () => {
    assert.deepEqual(tags("zodogal zagadul zam zwal vowogal. zwar varahal."), ["zwal→zam", "zwar→zam"]);
    const share = resolveOf("zodogal zagadul zam zwal vowogal. zazawan dwam vahahal.").anaphors.find((a) => a.pronoun.raw === "dwam");
    assert.equal(share?.antecedent?.raw, "zam");
  });

  it("tags a role pointer, which then stays put", () => {
    assert.deepEqual(tags("zazawan vowogal. zaxar zwal varahal. zalahen vowogal. zwar vehahel."), ["zwal→zaxar", "zwar→zaxar"]);
  });

  it("recalls two tags at once with a stacked vowel, and shares their parts in one event", () => {
    const { anaphors } = resolveOf("zodogal zwal zagadul zwel zam vowogal. zwaer varahal. zazawan dwaem vahahal.");
    const pair = anaphors.find((a) => a.pronoun.raw === "zwaer");
    assert.deepEqual(pair?.antecedents?.map((word) => word.raw), ["zodogal", "zagadul"]);
    const share = anaphors.find((a) => a.pronoun.raw === "dwaem");
    assert.deepEqual(share?.antecedents?.map((word) => word.raw), ["zodogal", "zagadul"]);
    assert.deepEqual(tags("zwal bwel vezebel. zwaerx varahal."), ["zwaerx→zwal"]);
    assert.throws(() => parseText("zazawan zwal vowogal. zalahen zwel varahal. zahaben dwaem vahahal."), /tag -r or -m/);
  });

  it("retro-tags a resume, and a newer assignment takes the tag over", () => {
    assert.deepEqual(tags("zodogal vowogal. dodogar dwel zazawan vahahal. zwer varahal."), ["dwel→dodogar", "zwer→dodogar"]);
    assert.deepEqual(tags("zodogal zwal vowogal. zagadul zwal varahal. zwar vehahel."), ["zwal→zodogal", "zwal→zagadul", "zwar→zagadul"]);
  });

  it("shares A's part in the latest earlier event A took part in, in whatever role", () => {
    const { anaphors } = resolveOf("zazawan zwal dalahen vabahel. zahaben dwam vahahal.");
    const share = anaphors.find((a) => a.pronoun.raw === "dwam");
    assert.equal(share?.antecedent?.raw, "zazawan");
    assert.equal(share?.roleVowel, "a");
    const object = resolveOf("zazawan zwal vowogal. zalahen dwar vabahel. zahaben dwam vahahal.").anaphors.find((a) => a.pronoun.raw === "dwam");
    assert.equal(object?.antecedent?.raw, "dwar");
    assert.equal(object?.roleVowel, "u");
  });

  it("keeps a tag through a topic change, and drops it after a goodbye", () => {
    assert.deepEqual(tags("zazawan zwal vowogal. xodogal zodogan vahahal. zwar varahal."), ["zwal→zazawan", "zwar→zazawan"]);
    assert.deepEqual(tags("zazawan zwal vowogal. xavazem zodogal varahal. zwar vehahel."), ["zwal→zazawan", "zwar→zazawan"]);
    assert.throws(() => parseText("azawan. alahen. zazawan zwal vowogal. azawan. alahen. zahaben vowogal. zwar vehahel."), /tag -r or -m/);
  });

  it("rejects a recall or share with no assignment", () => {
    assert.throws(() => parseText("zwar vowogal."), /tag -r or -m/);
    assert.throws(() => parseText("zazawan dwam vahahal."), /tag -r or -m/);
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
    const text = "xazawan zozan dalahen vahahal. zalaher dozan vezebel. zozan varahal.";
    assert.deepEqual(topics(text), ["zozan→xazawan", "dozan→xazawan", "zozan→xazawan"]);
  });

  it("takes a role compound as the topic, and returns to it by whole stem", () => {
    assert.deepEqual(topics("xaxedehol zazawan dozan vahahal. zozan varahal."), ["dozan→xaxedehol", "zozan→xaxedehol"]);
    assert.deepEqual(topics("xaxedehol. xazawan. xaxedehor. zozan varahal."), ["zozan→xaxedehor"]);
  });

  it("takes any compound as the topic", () => {
    assert.deepEqual(topics("xebeyaxabodel zazawan dozan vahahal. zozan varahal."), ["dozan→xebeyaxabodel", "zozan→xebeyaxabodel"]);
    assert.deepEqual(topics("xazawaxalahen. zozan varahal."), ["zozan→xazawaxalahen"]);
  });

  it("takes a kind as the topic", () => {
    assert.deepEqual(topics("xodogal zazawan dozan vahahal. zozan varahal."), ["dozan→xodogal", "zozan→xodogal"]);
  });

  it("is not set by being named first, being the subject, or as for", () => {
    assert.throws(() => parseText("zazawan vowogal. zozan vehahel."), /topic pronoun/);
    assert.throws(() => parseText("hahehom bazawan zalahen vowogal. zozan vehahel."), /topic pronoun/);
  });

  it("holds through as for and a join, and a return restores it after a side topic", () => {
    assert.deepEqual(topics("xazawan zozan vowogal. hahehom balahen zodogal varahal. zozan vehahel."), ["zozan→xazawan", "zozan→xazawan"]);
    assert.deepEqual(topics("xazawan zozan vowogal. xavazem zodogal varahal. or xazawar zozan vehahel."), ["zozan→xazawan", "zozan→xazawar"]);
  });

  it("is cleared by next and by the way, and by a goodbye", () => {
    assert.throws(() => parseText("xazawan zozan vowogal. xavazem zodogal varahal. zozan vehahel."), /topic pronoun/);
    assert.throws(() => parseText("xazawan zozan vowogal. xevavem zodogal varahal. zozan vehahel."), /topic pronoun/);
    assert.throws(() => parseText("azawan. alahen. xazawan zozan vowogal. azawan. alahen. zozan vehahel."), /topic pronoun/);
  });

  it("restarts the role pointers at every topic change", () => {
    assert.throws(() => parseText("zazawan vowogal. xalahen zaxar vehahel."), /role pointer/);
    assert.deepEqual(pointers("zazawan vowogal. xazawar zalahen varahal. zaxar vehahel."), ["zaxar→zalahen"]);
  });

  it("starts a new stretch when the current topic is returned to", () => {
    assert.throws(() => parseText("xazawan zalahen vowogal. xazawar zaxar vehahel."), /role pointer/);
  });

  it("lets a return to a linker stand as that linker again", () => {
    const text = "xazawan zalahen vowogal. xodum zahaben vowogal. xodur zaxar vehahel.";
    assert.deepEqual(pointers(text), ["zaxar→zahaben"]);
  });

  it("leaves a written quote's interior out of the topic and the tags", () => {
    assert.deepEqual(topics("xalahen zalahen vezebel d[xazawan zozan zodogal vowogal]. zozan vehahel."), ["zozan→xalahen"]);
    assert.throws(() => parseText("zalahen vezebel d[zazawan zwal vowogal]. zwar vehahel."), /tag -r or -m/);
  });

  it("takes -x on the topic pronoun, but never on the generic one", () => {
    assert.deepEqual(topics("x@<Sam> zozan vowogal."), ["zozan→x@<Sam>"]);
    assert.deepEqual(topics("x<odoga> zozan gamazam."), ["zozan→x<odoga>"]);
    assert.deepEqual(topics("x@[onodan alahen] zozan vezehel."), ["zozan→x@[onodan alahen]"]);
    assert.throws(() => parseText("zobenx vowogal."), /generic pronoun/);
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

  it("binds zexazagar as place of the prior scream verb", () => {
    const { anaphors } = resolveOf("zululon vazagal. zazawan dexazagar veyeyal.");
    const role = anaphors.find((a) => a.kind === "role");
    assert.ok(role);
    assert.equal(role!.pronoun.raw, "dexazagar");
    assert.equal(role!.roleVowel, "e");
    assert.equal(role!.antecedent?.raw, "vazagal");
  });

  it("binds zoxezeher as recipient of the prior tell verb", () => {
    const { anaphors } = resolveOf("zazawan vezehel. zoxezeher vurunul.");
    const role = anaphors.find((a) => a.kind === "role");
    assert.ok(role);
    assert.equal(role!.pronoun.raw, "zoxezeher");
    assert.equal(role!.roleVowel, "o");
    assert.equal(role!.antecedent?.raw, "vezehel");
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
    const whether = resolveOf("yol zehon vugul dorl zar vowogal.").asks[0]!;
    assert.equal(whether.kind, "yesNo");
    assert.deepEqual(whether.inner?.map((g) => g.raw), ["zar"]);
    const that = resolveOf("yol zehon vevegal darl zar vowogal.").asks[0]!;
    assert.equal(that.kind, "fillAsk");
    assert.deepEqual(that.gaps.map((g) => g.raw), ["zar"]);
    const both = resolveOf("yol zar vugul dorl zar vowogal.").asks[0]!;
    assert.deepEqual(both.gaps.map((g) => g.raw), ["zar"]);
    assert.equal(both.inner?.length, 1);
  });
});

describe("resolve — SHARED (comparatives.md / numbers.md)", () => {
  it("reads rank + SHARED scale as scale", () => {
    const { shared } = resolveOf("zazawan zululon zel gomonum.");
    assert.equal(shared.length, 1);
    assert.equal(shared[0]!.role, "scale");
    assert.equal(shared[0]!.join.raw, "zel");
    assert.equal(shared[0]!.shared.word.raw, "gomonum");
  });

  it("reads rank + SHARED manner /h/ as scale", () => {
    const { shared } = resolveOf("zululon zazawan zel hohogem vawalal.");
    assert.equal(shared.length, 1);
    assert.equal(shared[0]!.role, "scale");
    assert.equal(shared[0]!.join.raw, "zel");
    assert.equal(shared[0]!.shared.word.raw, "hohogem");
  });

  it("reads ae + SHARED manner /h/ as equative", () => {
    const { shared } = resolveOf("zululon zazawan zoel hohogem vawalal.");
    assert.equal(shared[0]!.role, "equative");
    assert.equal(shared[0]!.shared.word.raw, "hohogem");
  });

  it("reads set a + SHARED as distribute", () => {
    const { shared } = resolveOf("zadagal zagadul zal gomonum.");
    assert.equal(shared[0]!.role, "distribute");
  });

  it("reads ae + SHARED as equative", () => {
    const { shared } = resolveOf("zazawan zululon zoel gomonum.");
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
