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

  it("rejects pointers with no referent, on the wrong slot, o on an implicit role, or e on its own slot", () => {
    assert.throws(() => parseText("zaxar vowogal."), /needs an earlier predicate/);
    assert.throws(() => parseText("zazawan vowogal. vaxar."), /fills \/z\//);
    assert.throws(() => parseText("zazawan vowogal. dexor vahahal."), /takes only the doer/);
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

describe("resolve — ordinal pronouns (pronouns.md#ordinal-pronouns)", () => {
  function ordinals(text: string): string[] {
    return resolveOf(text)
      .anaphors.filter((a) => a.kind === "ordinal")
      .map((a) => `${a.pronoun.raw}→${a.antecedent?.raw}`);
  }

  it("numbers names by first -n mention, in any role", () => {
    assert.deepEqual(ordinals("zazawan dalahen vahahal. zalahen drewor vezebel. zrewor varahal."), [
      "drewor→zazawan",
      "zrewor→zazawan",
    ]);
  });

  it("counts greetings and calls as introductions", () => {
    assert.deepEqual(ordinals("azawan. alahen. zredur drewor vahahal."), ["zredur→alahen", "drewor→azawan"]);
    assert.deepEqual(ordinals("yalahen. zrewor vowogal."), ["zrewor→yalahen"]);
  });

  it("counts from the end with #-", () => {
    assert.deepEqual(ordinals("zazawan vowogal. zahaben vehahel. zruewor vezebal."), ["zruewor→zahaben"]);
  });

  it("gives a group name its own number, and takes -x", () => {
    assert.deepEqual(ordinals("zazawan vowogal. zazawanx vowogal. zredur vezebal. z=#1x vezebal."), [
      "zredur→zazawanx",
      "z=#1x→zazawan",
    ]);
  });

  it("skips special pronouns", () => {
    assert.deepEqual(ordinals("zamagon vowogal. zazawan vowogal. zrewor vezebal."), ["zrewor→zazawan"]);
  });

  it("restarts the count after a goodbye", () => {
    assert.deepEqual(ordinals("azawan. alahen. azawan. alahen. zahaben vowogal. zrewor vezebal."), ["zrewor→zahaben"]);
  });

  it("is not a number antecedent", () => {
    const { anaphors } = resolveOf("zazawan vowogal. zalahen vowogal. zredur vezebal.");
    assert.equal(anaphors.some((a) => a.kind === "number"), false);
  });
});

describe("resolve — topic (pronouns.md#topic)", () => {
  function topics(text: string): string[] {
    return resolveOf(text)
      .anaphors.filter((a) => a.kind === "topic")
      .map((a) => `${a.pronoun.raw}→${a.antecedent?.raw}`);
  }
  function ordinals(text: string): string[] {
    return resolveOf(text)
      .anaphors.filter((a) => a.kind === "ordinal")
      .map((a) => `${a.pronoun.raw}→${a.antecedent?.raw}`);
  }

  it("keeps one topic pronoun in every role, and counts only the others", () => {
    const text = "xazawan zozan dalahen vahahal. zrewor dozan vezebel. zozan varahal.";
    assert.deepEqual(topics(text), ["zozan→xazawan", "dozan→xazawan", "zozan→xazawan"]);
    assert.deepEqual(ordinals(text), ["zrewor→dalahen"]);
  });

  it("takes a kind as the topic, and a name inside the stretch gets no number", () => {
    assert.deepEqual(topics("xodogal zazawan dozan vahahal. zozan varahal."), ["dozan→xodogal", "zozan→xodogal"]);
    assert.deepEqual(ordinals("xazawan zazawan vowogal. zalahen varahal. zrewor vehahel."), ["zrewor→zalahen"]);
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

  it("restarts the ordinal count and the role pointers at every topic change", () => {
    assert.throws(() => parseText("zazawan dalahen vahahal. xalahen zrewor vowogal."), /ordinal pronoun/);
    assert.throws(() => parseText("zazawan vowogal. xalahen zaxar vehahel."), /role pointer/);
    assert.deepEqual(ordinals("zazawan vowogal. xazawar zalahen varahal. zrewor vehahel."), ["zrewor→zalahen"]);
  });

  it("starts a new stretch when the current topic is returned to", () => {
    assert.deepEqual(ordinals("xazawan zalahen vowogal. xazawar zahaben vowogal. zrewor vehahel."), ["zrewor→zahaben"]);
  });

  it("lets a return to a linker stand as that linker again", () => {
    const text = "xazawan zalahen vowogal. xodum zahaben vowogal. xodur zrewor vehahel.";
    assert.deepEqual(ordinals(text), ["zrewor→zalahen"]);
  });

  it("leaves a written quote's interior out of the topic and the count", () => {
    assert.deepEqual(topics("xalahen zalahen vezebel d[xazawan zozan zodogal vowogal]. zozan vehahel."), ["zozan→xalahen"]);
    assert.deepEqual(ordinals("zalahen vezebel d[zazawan vowogal]. zrewor vehahel."), ["zrewor→zalahen"]);
  });

  it("takes -x on the topic pronoun, but never on the generic one", () => {
    assert.deepEqual(topics("x@<Sam> zozan vowogal."), ["zozan→x@<Sam>"]);
    assert.deepEqual(topics("x<odoga> zozan gamazam."), ["zozan→x<odoga>"]);
    assert.deepEqual(topics("x@[onodan alahen] zozan vezehel."), ["zozan→x@[onodan alahen]"]);
    assert.throws(() => parseText("zobenx vowogal."), /generic pronoun/);
    assert.deepEqual(ordinals("zoben vowogal. zazawan vehahel. zrewor vezebal."), ["zrewor→zazawan"]);
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
    const whether = resolveOf("yol zehodon vubugal dorl zar vowogal.").asks[0]!;
    assert.equal(whether.kind, "yesNo");
    assert.deepEqual(whether.inner?.map((g) => g.raw), ["zar"]);
    const that = resolveOf("yol zehodon vevegal darl zar vowogal.").asks[0]!;
    assert.equal(that.kind, "fillAsk");
    assert.deepEqual(that.gaps.map((g) => g.raw), ["zar"]);
    const both = resolveOf("yol zar vubugal dorl zar vowogal.").asks[0]!;
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
    const { shared } = resolveOf("zululon zazawan zael hohogem vawalal.");
    assert.equal(shared[0]!.role, "equative");
    assert.equal(shared[0]!.shared.word.raw, "hohogem");
  });

  it("reads set a + SHARED as distribute", () => {
    const { shared } = resolveOf("zadagal zagadul zal gomonum.");
    assert.equal(shared[0]!.role, "distribute");
  });

  it("reads ae + SHARED as equative", () => {
    const { shared } = resolveOf("zazawan zululon zael gomonum.");
    assert.equal(shared[0]!.role, "equative");
  });

  it("reads sequence oe with two numbers + SHARED as a scale, not a range", () => {
    const { shared } = resolveOf("z+3 z+5 zoel gumedul.");
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
