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
    const { anaphors } = resolveOf("zululon vuwalal. zululor vayul.");
    assert.equal(anaphors.length, 1);
    assert.equal(anaphors[0]!.kind, "content");
    assert.equal(anaphors[0]!.pronoun.raw, "zululor");
    assert.equal(anaphors[0]!.antecedent?.raw, "zululon");
  });

  it("pins a resume to one sense with -rl / -rm (tag-pronouns.md#resume-sense)", () => {
    const { anaphors } = resolveOf("zazozon dodozel vayebel. zalazun dodozem vayebel. zazozon dodozerl vayebel. zalazun dodozerm vayebel. zazozon dodozer vayebel.");
    assert.deepEqual(
      anaphors.map((bind) => bind.antecedent?.raw),
      ["dodozel", "dodozem", "dodozerm"],
    );
  });

  it("reads a pinned resume as the one both know when that sense never came up", () => {
    const { anaphors } = resolveOf("zodozel vuwalal. zodozerm vayul.");
    assert.equal(anaphors[0]?.antecedent, undefined);
  });

  it("never binds a short cut of the root", () => {
    assert.throws(() => parseText("zululon vuwalal. zulur vayul."), /whole stem/);
  });

  it("binds zudavar to the dog, skipping the book", () => {
    const { anaphors } = resolveOf("zudaval vulazul. zabedel gegol. zudavar vuwalal.");
    assert.equal(anaphors[0]!.pronoun.raw, "zudavar");
    assert.equal(anaphors[0]!.antecedent?.raw, "zudaval");
  });

  it("binds vuwalar to the prior verb (pronouns.md intermediate)", () => {
    const { anaphors } = resolveOf("zazozon vuwalal. zululon vuwalar.");
    assert.equal(anaphors[0]!.pronoun.raw, "vuwalar");
    assert.equal(anaphors[0]!.antecedent?.raw, "vuwalal");
  });

  it("matches a compound only on its whole stem (bed is not bedroom)", () => {
    const part = resolveOf("zoyahehal vowurol. zoyaher vehohel.");
    assert.equal(part.anaphors[0]!.antecedent, undefined);
    const whole = resolveOf("zoyahehal vowurol. zoyahehar vehohel.");
    assert.equal(whole.anaphors[0]!.antecedent?.raw, "zoyahehal");
  });

  it("matches a hook compound only on its whole stem (walk is not enter)", () => {
    assert.equal(resolveOf("zazozon vowurolal. zalazun vowuror.").anaphors[0]!.antecedent, undefined);
    assert.equal(resolveOf("zazozon vowurolal. zalazun vowurolar.").anaphors[0]!.antecedent?.raw, "vowurolal");
  });

  it("leaves an opening resume unresolved", () => {
    const { anaphors } = resolveOf("zodogonor vuwalal.");
    assert.equal(anaphors[0]!.pronoun.raw, "zodogonor");
    assert.equal(anaphors[0]!.antecedent, undefined);
  });

  it("binds an ability resume on its whole stem and keeps the ability (can-and-cant.md#ability)", () => {
    const { anaphors } = resolveOf("zazozon vowuroxal. zugobon vowuroxar.");
    assert.equal(anaphors[0]!.pronoun.raw, "vowuroxar");
    assert.equal(anaphors[0]!.antecedent?.raw, "vowuroxal");
  });

  it("does not bind statement zar as a content anaphor", () => {
    const { anaphors, asks } = resolveOf("zar vuwalal.");
    assert.equal(anaphors.length, 0);
    assert.equal(asks[0]!.kind, "none");
  });

  it("leaves an opening full-root ability resume unresolved", () => {
    const { anaphors } = resolveOf("zazozon vowuroxar.");
    assert.equal(anaphors[0]!.pronoun.raw, "vowuroxar");
    assert.equal(anaphors[0]!.antecedent, undefined);
  });
});

describe("resolve — role pointers (pronouns.md#role-pointers)", () => {
  function pointers(text: string): string[] {
    return resolveOf(text)
      .anaphors.filter((a) => a.kind === "pointer")
      .map((a) => `${a.pronoun.raw}→${a.antecedent?.raw}`);
  }

  it("e: the latest predicate with that role filled", () => {
    assert.deepEqual(pointers("zazozon vowurol. zwuzer vehohel."), ["zwuzer→zazozon"]);
    assert.deepEqual(pointers("zazozon dalazun vayebel. zwuder veruvol."), ["zwuder→dalazun"]);
  });

  it("e on a core role skips predicates without that slot", () => {
    assert.deepEqual(pointers("zazozon dalazun vayebel. zazozon vowurol. zwuder veruvol."), ["zwuder→dalazun"]);
    assert.deepEqual(pointers("zazozon vezuyol darl. verulal. zwuzer vowurol."), ["zwuzer→zazozon"]);
  });

  it("a: the nearest earlier predicate with someone else in that role", () => {
    assert.deepEqual(pointers("zazozon vowurol. zalazun veruvol. zalazun vehohel. zwuzar vezuvel."), ["zwuzar→zazozon"]);
  });

  it("a compares referents, so a resumed name is the same person", () => {
    assert.throws(() => parseText("zazozon vowurol. zazozor vehohel. zwuzar vezuvel."), /needs an earlier predicate/);
  });

  it("o: this clause's predicate", () => {
    assert.deepEqual(pointers("zazozon vayebel dwuzor."), ["dwuzor→zazozon"]);
  });

  it("the extra party is a verb's unhosted /b/ or a /ɡ/ predicate's hosted /b/", () => {
    assert.deepEqual(pointers("zazozon balazun vezuyol darl. zwuber veruvol."), ["zwuber→balazun"]);
    assert.deepEqual(pointers("zazozon gawem blalazun. zwuber veruvol."), ["zwuber→blalazun"]);
  });

  it("a joined slot is one group", () => {
    assert.deepEqual(pointers("zazozon zalazun zal vowurol. zwuzerx vehohel."), ["zwuzerx→zal"]);
    assert.deepEqual(pointers("zazozon zalazun zol gamahum. zwuzerx veruvol."), ["zwuzerx→zol"]);
  });

  it("span interiors add no anchors", () => {
    assert.deepEqual(pointers("zazozon vowurol. d[zalazun veruvol] vayebel. zwuzer vehohel."), ["zwuzer→zazozon"]);
  });

  it("is no holder and no facing anchor: a seam resumes the person (viewpoint.md#viewpoint-laterals)", () => {
    assert.throws(() => parseText("zazozon vowurol. zalazun theyemaxar vudurul."));
    assert.throws(() => parseText("zazozon vowurol. zalazun vehohel howuhethwuzer."));
    const lateral = resolveOf("zazozon vowurol. zalazun vehohel hewuhothazozor.").anaphors.find((a) => a.pronoun.raw === "hewuhothazozor");
    assert.equal(lateral?.antecedent?.raw, "zazozon");
  });

  it("-l: a new one of the participant's kind, never the same referent", () => {
    assert.deepEqual(pointers("zazozon dugedel vayebel. zalazun dwudel vayebel."), ["dwudel→dugedel"]);
    const { anaphors } = resolveOf("zazozon dugedel vayebel. zalazun dwudel vayebel. zodozel dwuder vayebel.");
    assert.equal(anaphors.find((a) => a.pronoun.raw === "dwuder")?.antecedent?.raw, "dwudel");
  });

  it("-m: the participant's part, not the participant", () => {
    assert.deepEqual(pointers("zazozon dalazun vabuvul. zwuzem genemum."), ["zwuzem→zazozon"]);
  });

  it("u: the latest predicate that left that role unsaid", () => {
    assert.deepEqual(pointers("dugedel vayebel. zwuzur veruvol."), ["zwuzur→vayebel"]);
    assert.deepEqual(pointers("dugedel vayebel. zwuzum genemum."), ["zwuzum→vayebel"]);
    assert.throws(() => parseText("zazozon vowurol. zwuzur vehohel."), /earlier predicate/);
  });

  it("rejects a share with o or -x, a new one with u or on a special pronoun", () => {
    assert.throws(() => parseText("zazozon dalazun vabuvul. zwuzom genemum."), /never takes the self vowel/);
    assert.throws(() => parseText("zazozon dalazun vabuvul. zwuzemx genemum."), /takes no -x/);
    assert.throws(() => parseText("dugedel vayebel. zwuzul veruvol."), /unsaid pointer/);
    assert.throws(() => parseText("zuwen vowurol. zwuzel vehohel."), /special, topic, or generic/);
  });

  it("rejects pointers with no referent, on the wrong slot, or o on its own slot", () => {
    assert.throws(() => parseText("zwuzer vowurol."), /needs an earlier predicate/);
    assert.throws(() => parseText("zazozon vowurol. vwuzer."), /fills \/z\//);
    assert.throws(() => parseText("zwuzor vowurol."), /not the one it fills/);
  });
});

describe("resolve — content-rule pointers (viewpoint.md#content-of-the-event)", () => {
  function pointers(text: string): string[] {
    return resolveOf(text)
      .anaphors.filter((a) => a.kind === "pointer")
      .map((a) => `${a.pronoun.raw}→${a.antecedent?.raw}`);
  }

  it("h: a named manner, else the event's own", () => {
    assert.deepEqual(pointers("zazozon vowurol hadurom. dwuher vayebel."), ["dwuher→hadurom"]);
    assert.deepEqual(pointers("zazozon vowurol. dwuher vayebel."), ["dwuher→vowurol"]);
  });

  it("h skips restrictors, time poles, and say words", () => {
    assert.deepEqual(pointers("zazozon vowurol hual. dwuher vayebel."), ["dwuher→vowurol"]);
    assert.deepEqual(pointers("zazozon vowurol hwuvam. dwuher vayebel."), ["dwuher→vowurol"]);
  });

  it("g: the undergoer's state, else the doer's", () => {
    assert.deepEqual(pointers("zazozon dalazun vabuvul. dwuger vayebel."), ["dwuger→dalazun"]);
    assert.deepEqual(pointers("zazozon vowurol. dwuger vayebel."), ["dwuger→zazozon"]);
  });

  it("v: the latest event; w: that event's extent", () => {
    assert.deepEqual(pointers("zazozon vowurol. dwuver vayebel."), ["dwuver→vowurol"]);
    assert.deepEqual(pointers("zazozon vowurol. dwuwer vayebel."), ["dwuwer→vowurol"]);
    assert.deepEqual(pointers("zazozon vowurol. zalazun veruvol. dwuvar vayebel."), ["dwuvar→vowurol"]);
  });

  it("x: the next sentence after a consequence linker", () => {
    assert.deepEqual(pointers("zazozon vabuvul. xahom zalazun veyamul. dwuxer vayebel."), ["dwuxer→veyamul"]);
  });

  it("y: the latest turn", () => {
    assert.deepEqual(pointers("yal zazozon vowurol. yal dwuyer vayebel."), ["dwuyer→yal"]);
  });

  it("th: a named stance, else the event's own reason", () => {
    assert.deepEqual(pointers("zazozon vowurol thahum blarl zalazun veruvol. dwuther vayebel."), ["dwuther→thahum"]);
    assert.deepEqual(pointers("zazozon vowurol. dwuther vayebel."), ["dwuther→vowurol"]);
  });
});

describe("resolve — span and number anaphors", () => {
  it("has no span resume: a span is an ordinary noun for a role pointer (spans.md)", () => {
    assert.throws(() => parseText("d[hi] vuwalal. d[=] vayul."));
    const { anaphors } = resolveOf("zalazun d[hi] vezuyol. zazozon dwuder vayebel.");
    const pointer = anaphors.find((a) => a.kind === "pointer");
    assert.equal(pointer?.antecedent?.raw, "d[hi]");
  });

  it("binds digitful z=+3 to the prior scalar (numbers.md)", () => {
    const { anaphors } = resolveOf("z+3 vuwalal. z=+3 vayul.");
    const num = anaphors.find((a) => a.kind === "number");
    assert.ok(num);
    assert.equal(num!.pronoun.raw, "z=+3");
    assert.equal(num!.antecedent?.raw, "z+3");
  });

  it("digitless z=+ is not a resume; under question it is a fill-ask (digitless-exponents.md#digitless)", () => {
    const statement = resolveOf("z+3 vuwalal. z=+ vayul.");
    assert.equal(statement.anaphors.some((a) => a.kind === "number"), false);
    const question = resolveOf("yel zogozelx g=+ vayul.");
    assert.equal(question.asks[0]?.kind, "fillAsk");
    assert.equal(question.asks[0]?.gaps[0]?.raw, "g=+");
  });

  it("asks by the outer of two stacked act words (speech-acts.md#stacked-acts)", () => {
    assert.equal(resolveOf("yel yal zar vabuvul dubogal.").asks[0]?.kind, "fillAsk");
    assert.equal(resolveOf("yal yel zar vegemal.").asks[0]?.kind, "rhetorical");
    assert.equal(resolveOf("yol yel vabuvul dubogal zawan.").asks[0]?.kind, "rhetorical");
    assert.equal(resolveOf("yul yol dubogal vabuvul.").asks[0]?.kind, "none");
  });
});

describe("resolve — tag pronouns (tag-pronouns.md#tag-pronouns)", () => {
  function tags(text: string): string[] {
    return resolveOf(text)
      .anaphors.filter((a) => a.kind === "tag")
      .map((a) => `${a.pronoun.raw}→${a.antecedent?.raw}`);
  }

  it("names the phrase right before it, and recalls it in any role", () => {
    assert.deepEqual(tags("zodozel zwal dugedel dwol vayebel. zogozel dwar vayebel. zwar vowurol."), [
      "zwal→zodozel",
      "dwol→dugedel",
      "dwar→zodozel",
      "zwar→zodozel",
    ]);
  });

  it("rides on the package, so a tagged phrase is one item and one filler", () => {
    const result = parseText("zodozel gamahum zwal vowurol.");
    const unit = result.utterances[0]!.bodies[0]!.clause.units[0]!;
    assert.equal(unit.kind, "np");
    if (unit.kind !== "np") return;
    const [item] = unit.coord.parts[0]!.items;
    assert.equal(unit.coord.parts[0]!.items.length, 1);
    assert.equal(item?.kind === "package" ? item.package.tag?.raw : undefined, "zwal");
  });

  it("introduces a new referent with no phrase before it", () => {
    assert.deepEqual(tags("zwal bwol vezuyol. zwor dugedel vagedal."), ["zwor→bwol"]);
  });

  it("tags each item of a list, and a tag listed first is new", () => {
    assert.deepEqual(tags("zodozel zwal zogozel zwol zam vowurol. zwor veruvol."), ["zwal→zodozel", "zwol→zogozel", "zwor→zogozel"]);
    assert.deepEqual(tags("zwal zodozel zam vowurol. zwar veruvol."), ["zwar→zwal"]);
  });

  it("tags a whole group after a closed fence", () => {
    assert.deepEqual(tags("zodozel zogozel zam zwal vowurol. zwar veruvol."), ["zwal→zam", "zwar→zam"]);
    const share = resolveOf("zodozel zogozel zam zwal vowurol. zazozon dwam vayebel.").anaphors.find((a) => a.pronoun.raw === "dwam");
    assert.equal(share?.antecedent?.raw, "zam");
  });

  it("tags a role pointer, which then stays put", () => {
    assert.deepEqual(tags("zazozon vowurol. zwuzer zwal veruvol. zalazun vowurol. zwar vehohel."), ["zwal→zwuzer", "zwar→zwuzer"]);
  });

  it("recalls two tags at once with a stacked vowel, and shares their parts in one event", () => {
    const { anaphors } = resolveOf("zodozel zwal zogozel zwol zam vowurol. zwaor veruvol. zazozon dwaom vayebel.");
    const pair = anaphors.find((a) => a.pronoun.raw === "zwaor");
    assert.deepEqual(pair?.antecedents?.map((word) => word.raw), ["zodozel", "zogozel"]);
    const share = anaphors.find((a) => a.pronoun.raw === "dwaom");
    assert.deepEqual(share?.antecedents?.map((word) => word.raw), ["zodozel", "zogozel"]);
    assert.deepEqual(tags("zwal bwol vezuyol. zwaorx veruvol."), ["zwaorx→zwal"]);
    assert.throws(() => parseText("zazozon zwal vowurol. zalazun zwol veruvol. zahelan dwaom vayebel."), /tag -r or -m/);
  });

  it("retro-tags a resume, and a newer assignment takes the tag over", () => {
    assert.deepEqual(tags("zodozel vowurol. dodozer dwol zazozon vayebel. zwor veruvol."), ["dwol→dodozer", "zwor→dodozer"]);
    assert.deepEqual(tags("zodozel zwal vowurol. zogozel zwal veruvol. zwar vehohel."), ["zwal→zodozel", "zwal→zogozel", "zwar→zogozel"]);
  });

  it("shares A's part in the latest earlier event A took part in, in whatever role", () => {
    const { anaphors } = resolveOf("zazozon zwal dalazun vabuvul. zahelan dwam vayebel.");
    const share = anaphors.find((a) => a.pronoun.raw === "dwam");
    assert.equal(share?.antecedent?.raw, "zazozon");
    assert.equal(share?.part, "z");
    const object = resolveOf("zazozon zwal vowurol. zalazun dwar vabuvul. zahelan dwam vayebel.").anaphors.find((a) => a.pronoun.raw === "dwam");
    assert.equal(object?.antecedent?.raw, "dwar");
    assert.equal(object?.part, "d");
  });

  it("keeps a tag through a topic change, and drops it after a goodbye", () => {
    assert.deepEqual(tags("zazozon zwal vowurol. xodozel zodozen vayebel. zwar veruvol."), ["zwal→zazozon", "zwar→zazozon"]);
    assert.deepEqual(tags("zazozon zwal vowurol. xavedam zodozel veruvol. zwar vehohel."), ["zwal→zazozon", "zwar→zazozon"]);
    assert.throws(() => parseText("azozon. alazun. zazozon zwal vowurol. azozon. alazun. zahelan vowurol. zwar vehohel."), /tag -r or -m/);
  });

  it("rejects a recall or share with no assignment", () => {
    assert.throws(() => parseText("zwar vowurol."), /tag -r or -m/);
    assert.throws(() => parseText("zazozon dwam vayebel."), /tag -r or -m/);
  });
});

describe("resolve — topic (topic.md#topic)", () => {
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
    const text = "xazozon zalen dalazun vayebel. zalazur dalen vezuyol. zalen veruvol.";
    assert.deepEqual(topics(text), ["zalen→xazozon", "dalen→xazozon", "zalen→xazozon"]);
  });

  it("takes a role compound as the topic, and returns to it by whole stem", () => {
    assert.deepEqual(topics("xwuzeduyol zazozon dalen vayebel. zalen veruvol."), ["dalen→xwuzeduyol", "zalen→xwuzeduyol"]);
    assert.deepEqual(topics("xwuzeduyol. xazozon. xwuzeduyor. zalen veruvol."), ["zalen→xwuzeduyor"]);
  });

  it("takes any compound as the topic", () => {
    assert.deepEqual(topics("xuwedaxubudal zazozon dalen vayebel. zalen veruvol."), ["dalen→xuwedaxubudal", "zalen→xuwedaxubudal"]);
    assert.deepEqual(topics("xazozoxalazun. zalen veruvol."), ["zalen→xazozoxalazun"]);
  });

  it("takes a kind as the topic", () => {
    assert.deepEqual(topics("xodozel zazozon dalen vayebel. zalen veruvol."), ["dalen→xodozel", "zalen→xodozel"]);
  });

  it("is not set by being named first, being the subject, or as for", () => {
    assert.throws(() => parseText("zazozon vowurol. zalen vehohel."), /topic pronoun/);
    assert.throws(() => parseText("hehugom blazozon zalazun vowurol. zalen vehohel."), /topic pronoun/);
  });

  it("holds through as for and a join, and a return restores it after a side topic", () => {
    assert.deepEqual(topics("xazozon zalen vowurol. hehugom blalazun zodozel veruvol. zalen vehohel."), ["zalen→xazozon", "zalen→xazozon"]);
    assert.deepEqual(topics("xazozon zalen vowurol. xavedam zodozel veruvol. er xazozor zalen vehohel."), ["zalen→xazozon", "zalen→xazozor"]);
  });

  it("is cleared by next and by the way, and by a goodbye", () => {
    assert.throws(() => parseText("xazozon zalen vowurol. xavedam zodozel veruvol. zalen vehohel."), /topic pronoun/);
    assert.throws(() => parseText("xazozon zalen vowurol. xevewom zodozel veruvol. zalen vehohel."), /topic pronoun/);
    assert.throws(() => parseText("azozon. alazun. xazozon zalen vowurol. azozon. alazun. zalen vehohel."), /topic pronoun/);
  });

  it("restarts the role pointers at every topic change", () => {
    assert.throws(() => parseText("zazozon vowurol. xalazun zwuzer vehohel."), /role pointer/);
    assert.deepEqual(pointers("zazozon vowurol. xazozor zalazun veruvol. zwuzer vehohel."), ["zwuzer→zalazun"]);
  });

  it("starts a new stretch when the current topic is returned to", () => {
    assert.throws(() => parseText("xazozon zalazun vowurol. xazozor zwuzer vehohel."), /role pointer/);
  });

  it("lets a return to a linker stand as that linker again", () => {
    const text = "xazozon zalazun vowurol. xahom zahelan vowurol. xahor zwuzer vehohel.";
    assert.deepEqual(pointers(text), ["zwuzer→zahelan"]);
  });

  it("leaves a written quote's interior out of the topic and the tags", () => {
    assert.deepEqual(topics("xalazun zalazun vezuyol d[xazozon zalen zodozel vowurol]. zalen vehohel."), ["zalen→xalazun"]);
    assert.throws(() => parseText("zalazun vezuyol d[zazozon zwal vowurol]. zwar vehohel."), /tag -r or -m/);
  });

  it("takes -x on the topic pronoun, but never on the generic one", () => {
    assert.deepEqual(topics("x@<Sam> zalen vowurol."), ["zalen→x@<Sam>"]);
    assert.deepEqual(topics("x<odoze> zalen gamezem."), ["zalen→x<odoze>"]);
    assert.deepEqual(topics("x@[onuren alazun] zalen vozuyel."), ["zalen→x@[onuren alazun]"]);
    assert.throws(() => parseText("zeyenx vowurol."), /generic pronoun/);
  });
});

describe("resolve — role anaphors (roles.md)", () => {
  it("binds zwazozowor to the prior conflict verb", () => {
    const { anaphors } = resolveOf("zar dugobon vozowol. zwuzozowor varunul.");
    const role = anaphors.find((a) => a.kind === "role");
    assert.ok(role);
    assert.equal(role!.pronoun.raw, "zwuzozowor");
    assert.equal(role!.part, "z");
    assert.equal(role!.antecedent?.raw, "vozowol");
  });


  it("binds zwabozuyer as recipient of the prior tell verb", () => {
    const { anaphors } = resolveOf("zazozon vozuyel. zwubozuyer varunul.");
    const role = anaphors.find((a) => a.kind === "role");
    assert.ok(role);
    assert.equal(role!.pronoun.raw, "zwubozuyer");
    assert.equal(role!.part, "b");
    assert.equal(role!.antecedent?.raw, "vozuyel");
  });
});

describe("resolve — yes/no vs fill-ask (questions.md)", () => {
  it("classifies yol zugobon vuwalal. as yes/no", () => {
    const { asks } = resolveOf("yel zugobon vuwalal.");
    assert.equal(asks[0]!.kind, "yesNo");
    assert.equal(asks[0]!.gaps.length, 0);
  });

  it("classifies yol zar vuwalal. as fill-ask", () => {
    const { asks, anaphors } = resolveOf("yel zar vuwalal.");
    assert.equal(asks[0]!.kind, "fillAsk");
    assert.equal(asks[0]!.gaps.map((g) => g.raw).join(" "), "zar");
    assert.equal(anaphors.length, 0);
  });

  it("orders fill-all gaps zar … dar", () => {
    const { asks } = resolveOf("yel zar veyol dar.");
    assert.equal(asks[0]!.kind, "fillAsk");
    assert.deepEqual(
      asks[0]!.gaps.map((g) => g.raw),
      ["zar", "dar"],
    );
  });

  it("classifies yom zar vuwalal. as fill-ask", () => {
    const { asks } = resolveOf("yem zar vuwalal.");
    assert.equal(asks[0]!.kind, "fillAsk");
  });

  it("gives a blank in a dorl dependent to the dependent, and one in a darl dependent to yol", () => {
    const whether = resolveOf("yel zawan vanal derl zar vowurol.").asks[0]!;
    assert.equal(whether.kind, "yesNo");
    assert.deepEqual(whether.inner?.map((g) => g.raw), ["zar"]);
    const that = resolveOf("yel zawan vevemel darl zar vowurol.").asks[0]!;
    assert.equal(that.kind, "fillAsk");
    assert.deepEqual(that.gaps.map((g) => g.raw), ["zar"]);
    const both = resolveOf("yel zar vanal derl zar vowurol.").asks[0]!;
    assert.deepEqual(both.gaps.map((g) => g.raw), ["zar"]);
    assert.equal(both.inner?.length, 1);
  });
});

describe("resolve — SHARED (comparatives.md / numbers.md)", () => {
  it("reads rank + SHARED scale as scale", () => {
    const { shared } = resolveOf("zazozon zululon zol gomoldam.");
    assert.equal(shared.length, 1);
    assert.equal(shared[0]!.role, "scale");
    assert.equal(shared[0]!.join.raw, "zol");
    assert.equal(shared[0]!.shared.word.raw, "gomoldam");
  });

  it("reads rank + SHARED manner /h/ as scale", () => {
    const { shared } = resolveOf("zululon zazozon zol hohevem vuwalal.");
    assert.equal(shared.length, 1);
    assert.equal(shared[0]!.role, "scale");
    assert.equal(shared[0]!.join.raw, "zol");
    assert.equal(shared[0]!.shared.word.raw, "hohevem");
  });

  it("reads ae + SHARED manner /h/ as equative", () => {
    const { shared } = resolveOf("zululon zazozon zoel hohevem vuwalal.");
    assert.equal(shared[0]!.role, "equative");
    assert.equal(shared[0]!.shared.word.raw, "hohevem");
  });

  it("reads set a + SHARED as distribute", () => {
    const { shared } = resolveOf("zudaval zogozel zal gomoldam.");
    assert.equal(shared[0]!.role, "distribute");
  });

  it("reads ae + SHARED as equative", () => {
    const { shared } = resolveOf("zazozon zululon zoel gomoldam.");
    assert.equal(shared[0]!.role, "equative");
  });

  it("reads sequence oe with two numbers + SHARED as a scale, not a range", () => {
    const { shared } = resolveOf("z+3 z+5 zaol gumedul.");
    assert.equal(shared[0]!.role, "scale");
    assert.equal(shared[0]!.shared.word.raw, "gumedul");
  });

  it("reads rank e with two numbers + SHARED as a scale, not a range", () => {
    const { shared } = resolveOf("z+3 z+5 zol gumedul.");
    assert.equal(shared[0]!.role, "scale");
  });

  it("leaves bare z+3 z+5 zel without SHARED", () => {
    const { shared } = resolveOf("z+3 z+5 zol.");
    assert.equal(shared.length, 0);
  });
});

describe("resolve — hooked-join point-back (hooked-joins.md#hooked-joins-point-back)", () => {
  const landmarkOf = (text: string) => resolveOf(text).anaphors.find((bind) => bind.kind === "landmark")?.antecedent?.raw;

  it("takes the latest landmark: a hook's /b/, a hosted bl- word, or a hooked join's", () => {
    assert.equal(landmarkOf("zazozon vehohel el bohehal. zerxual vezuvel."), "bohehal");
    assert.equal(landmarkOf("zazozon vehohel el bohehal. zexual bluzahal vezuvel. zarxar vowurol."), "bluzahal");
    assert.equal(landmarkOf("zazozon vowurol halam blanulul. zerxual vezuvel."), "blanulul");
  });

  it("on /h/, takes only a time landmark", () => {
    assert.equal(landmarkOf("zazozon vowurol halam blanulul. zalazun vehohel el bohehal. zawan vebal hurxal."), "blanulul");
    assert.equal(landmarkOf("zazozon vowurol huxal blovulul. zawan vebal hurxal."), "blovulul");
  });
});
