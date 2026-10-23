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

  it("pins a resume to one sense with -rl / -rm (tag-pronouns.md#resume-sense)", () => {
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
    const { anaphors } = resolveOf("zudaval vulazul. zunedol gegel. zudavar vawalal.");
    assert.equal(anaphors[0]!.pronoun.raw, "zudavar");
    assert.equal(anaphors[0]!.antecedent?.raw, "zudaval");
  });

  it("binds vawalar to the prior verb (pronouns.md intermediate)", () => {
    const { anaphors } = resolveOf("zuzozen vawalal. zululon vawalar.");
    assert.equal(anaphors[0]!.pronoun.raw, "vawalar");
    assert.equal(anaphors[0]!.antecedent?.raw, "vawalal");
  });

  it("matches a compound only on its whole stem (bed is not bedroom)", () => {
    const part = resolveOf("zobahohal vowurel. zobahor vuhohol.");
    assert.equal(part.anaphors[0]!.antecedent, undefined);
    const whole = resolveOf("zobahohal vowurel. zobahohar vuhohol.");
    assert.equal(whole.anaphors[0]!.antecedent?.raw, "zobahohal");
  });

  it("matches a hook compound only on its whole stem (walk is not enter)", () => {
    assert.equal(resolveOf("zuzozen vowurelal. zolazun vowurer.").anaphors[0]!.antecedent, undefined);
    assert.equal(resolveOf("zuzozen vowurelal. zolazun vowurelar.").anaphors[0]!.antecedent?.raw, "vowurelal");
  });

  it("leaves an opening resume unresolved", () => {
    const { anaphors } = resolveOf("zodogonor vawalal.");
    assert.equal(anaphors[0]!.pronoun.raw, "zodogonor");
    assert.equal(anaphors[0]!.antecedent, undefined);
  });

  it("binds an ability resume on its whole stem and keeps the ability (ability.md#ability)", () => {
    const { anaphors } = resolveOf("zuzozen vowurexal. zugobon vowurexar.");
    assert.equal(anaphors[0]!.pronoun.raw, "vowurexar");
    assert.equal(anaphors[0]!.antecedent?.raw, "vowurexal");
  });

  it("does not bind statement zar as a content anaphor", () => {
    const { anaphors, asks } = resolveOf("zar vawalal.");
    assert.equal(anaphors.length, 0);
    assert.equal(asks[0]!.kind, "none");
  });

  it("leaves an opening full-root ability resume unresolved", () => {
    const { anaphors } = resolveOf("zuzozen vowurexar.");
    assert.equal(anaphors[0]!.pronoun.raw, "vowurexar");
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
    assert.deepEqual(pointers("zuzozen vowurel. zwazar vuhohol."), ["zwazar→zuzozen"]);
    assert.deepEqual(pointers("zuzozen dolazun vawebol. zwadar varuvel."), ["zwadar→dolazun"]);
  });

  it("a on a core role skips predicates without that slot", () => {
    assert.deepEqual(pointers("zuzozen dolazun vawebol. zuzozen vowurel. zwadar varuvel."), ["zwadar→dolazun"]);
    assert.deepEqual(pointers("zuzozen vezuyel darl. verulal. zwazar vowurel."), ["zwazar→zuzozen"]);
  });

  it("o: the nearest earlier predicate with someone else in that role", () => {
    assert.deepEqual(pointers("zuzozen vowurel. zolazun varuvel. zolazun vuhohol. zwazor vezuvol."), ["zwazor→zuzozen"]);
  });

  it("o compares referents, so a resumed name is the same person", () => {
    assert.throws(() => parseText("zuzozen vowurel. zuzozer vuhohol. zwazor vezuvol."), /needs an earlier predicate/);
  });

  it("e: this clause's predicate", () => {
    assert.deepEqual(pointers("zuzozen vawebol dwazer."), ["dwazer→zuzozen"]);
  });

  it("the extra party is a verb's unhosted /b/ or a /ɡ/ predicate's hosted /b/", () => {
    assert.deepEqual(pointers("zuzozen bolazun vezuyel darl. zwabar varuvel."), ["zwabar→bolazun"]);
    assert.deepEqual(pointers("zuzozen gawom blolazun. zwabar varuvel."), ["zwabar→blolazun"]);
  });

  it("a joined slot is one group", () => {
    assert.deepEqual(pointers("zuzozen zolazun zal vowurel. zwazarx vuhohol."), ["zwazarx→zal"]);
    assert.deepEqual(pointers("zuzozen zolazun zel gamahum. zwazarx varuvel."), ["zwazarx→zel"]);
  });

  it("span interiors add no anchors", () => {
    assert.deepEqual(pointers("zuzozen vowurel. d[zolazun varuvel] vawebol. zwazar vuhohol."), ["zwazar→zuzozen"]);
  });

  it("is no holder and no facing anchor: a seam resumes the person (viewpoint.md#viewpoint-laterals)", () => {
    assert.throws(() => parseText("zuzozen vowurel. zolazun theyemaxar velurul."));
    assert.throws(() => parseText("zuzozen vowurel. zolazun vuhohol howuhethwazar."));
    const lateral = resolveOf("zuzozen vowurel. zolazun vuhohol howuhethuzozer.").anaphors.find((a) => a.pronoun.raw === "howuhethuzozer");
    assert.equal(lateral?.antecedent?.raw, "zuzozen");
  });

  it("-l: a new one of the participant's kind, never the same referent", () => {
    assert.deepEqual(pointers("zuzozen dugedol vawebol. zolazun dwadal vawebol."), ["dwadal→dugedol"]);
    const { anaphors } = resolveOf("zuzozen dugedol vawebol. zolazun dwadal vawebol. zudozol dwadar vawebol.");
    assert.equal(anaphors.find((a) => a.pronoun.raw === "dwadar")?.antecedent?.raw, "dwadal");
  });

  it("-m: the participant's part, not the participant", () => {
    assert.deepEqual(pointers("zuzozen dolazun vanuvul. zwazam genamum."), ["zwazam→zuzozen"]);
  });

  it("u: the latest predicate that left that role unsaid", () => {
    assert.deepEqual(pointers("dugedol vawebol. zwazur varuvel."), ["zwazur→vawebol"]);
    assert.deepEqual(pointers("dugedol vawebol. zwazum genamum."), ["zwazum→vawebol"]);
    assert.throws(() => parseText("zuzozen vowurel. zwazur vuhohol."), /earlier predicate/);
  });

  it("rejects a share with e or -x, a new one with u or on a special pronoun", () => {
    assert.throws(() => parseText("zuzozen dolazun vanuvul. zwazem genamum."), /never takes the self vowel/);
    assert.throws(() => parseText("zuzozen dolazun vanuvul. zwazamx genamum."), /takes no -x/);
    assert.throws(() => parseText("dugedol vawebol. zwazul varuvel."), /unsaid pointer/);
    assert.throws(() => parseText("zuwon vowurel. zwazal vuhohol."), /special, topic, or generic/);
  });

  it("rejects pointers with no referent, on the wrong slot, or e on its own slot", () => {
    assert.throws(() => parseText("zwazar vowurel."), /needs an earlier predicate/);
    assert.throws(() => parseText("zuzozen vowurel. vwazar."), /fills \/z\//);
    assert.throws(() => parseText("zwazer vowurel."), /not the one it fills/);
  });
});

describe("resolve — content-rule pointers (viewpoint.md#content-of-the-event)", () => {
  function pointers(text: string): string[] {
    return resolveOf(text)
      .anaphors.filter((a) => a.kind === "pointer")
      .map((a) => `${a.pronoun.raw}→${a.antecedent?.raw}`);
  }

  it("h: a named manner, else the event's own", () => {
    assert.deepEqual(pointers("zuzozen vowurel hedurem. dwahar vawebol."), ["dwahar→hedurem"]);
    assert.deepEqual(pointers("zuzozen vowurel. dwahar vawebol."), ["dwahar→vowurel"]);
  });

  it("h skips restrictors, time poles, and say words", () => {
    assert.deepEqual(pointers("zuzozen vowurel hual. dwahar vawebol."), ["dwahar→vowurel"]);
    assert.deepEqual(pointers("zuzozen vowurel hwavam. dwahar vawebol."), ["dwahar→vowurel"]);
  });

  it("g: the undergoer's state, else the doer's", () => {
    assert.deepEqual(pointers("zuzozen dolazun vanuvul. dwagar vawebol."), ["dwagar→dolazun"]);
    assert.deepEqual(pointers("zuzozen vowurel. dwagar vawebol."), ["dwagar→zuzozen"]);
  });

  it("v: the latest event; w: that event's extent", () => {
    assert.deepEqual(pointers("zuzozen vowurel. dwavar vawebol."), ["dwavar→vowurel"]);
    assert.deepEqual(pointers("zuzozen vowurel. dwawar vawebol."), ["dwawar→vowurel"]);
    assert.deepEqual(pointers("zuzozen vowurel. zolazun varuvel. dwavor vawebol."), ["dwavor→vowurel"]);
  });

  it("x: the next sentence after a consequence linker", () => {
    assert.deepEqual(pointers("zuzozen vanuvul. xahem zolazun varemul. dwaxar vawebol."), ["dwaxar→varemul"]);
  });

  it("y: the latest turn", () => {
    assert.deepEqual(pointers("yal zuzozen vowurel. yal dwayar vawebol."), ["dwayar→yal"]);
  });

  it("th: a named stance, else the event's own reason", () => {
    assert.deepEqual(pointers("zuzozen vowurel thahum blarl zolazun varuvel. dwathar vawebol."), ["dwathar→thahum"]);
    assert.deepEqual(pointers("zuzozen vowurel. dwathar vawebol."), ["dwathar→vowurel"]);
  });
});

describe("resolve — span and number anaphors", () => {
  it("has no span resume: a span is an ordinary noun for a role pointer (spans.md)", () => {
    assert.throws(() => parseText("d[hi] vawalal. d[=] vayul."));
    const { anaphors } = resolveOf("zolazun d[hi] vezuyel. zuzozen dwadar vawebol.");
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

  it("digitless z=+ is not a resume; under question it is a fill-ask (digitless-exponents.md#digitless)", () => {
    const statement = resolveOf("z+3 vawalal. z=+ vayul.");
    assert.equal(statement.anaphors.some((a) => a.kind === "number"), false);
    const question = resolveOf("yol zagozolx g=+ vayul.");
    assert.equal(question.asks[0]?.kind, "fillAsk");
    assert.equal(question.asks[0]?.gaps[0]?.raw, "g=+");
  });

  it("asks by the outer of two stacked act words (speech-acts.md#stacked-acts)", () => {
    assert.equal(resolveOf("yol yal zar vanuvul dobogal.").asks[0]?.kind, "fillAsk");
    assert.equal(resolveOf("yal yol zar vegemal.").asks[0]?.kind, "rhetorical");
    assert.equal(resolveOf("yel yol vanuvul dobogal zawan.").asks[0]?.kind, "rhetorical");
    assert.equal(resolveOf("yul yel dobogal vanuvul.").asks[0]?.kind, "none");
  });
});

describe("resolve — tag pronouns (tag-pronouns.md#tag-pronouns)", () => {
  function tags(text: string): string[] {
    return resolveOf(text)
      .anaphors.filter((a) => a.kind === "tag")
      .map((a) => `${a.pronoun.raw}→${a.antecedent?.raw}`);
  }

  it("names the phrase right before it, and recalls it in any role", () => {
    assert.deepEqual(tags("zudozol zwal dugedol dwel vawebol. zagozol dwar vawebol. zwar vowurel."), [
      "zwal→zudozol",
      "dwel→dugedol",
      "dwar→zudozol",
      "zwar→zudozol",
    ]);
  });

  it("rides on the package, so a tagged phrase is one item and one filler", () => {
    const result = parseText("zudozol gamahum zwal vowurel.");
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
    assert.deepEqual(tags("zudozol zwal zagozol zwel zam vowurel. zwer varuvel."), ["zwal→zudozol", "zwel→zagozol", "zwer→zagozol"]);
    assert.deepEqual(tags("zwal zudozol zam vowurel. zwar varuvel."), ["zwar→zwal"]);
  });

  it("tags a whole group after a closed fence", () => {
    assert.deepEqual(tags("zudozol zagozol zam zwal vowurel. zwar varuvel."), ["zwal→zam", "zwar→zam"]);
    const share = resolveOf("zudozol zagozol zam zwal vowurel. zuzozen dwam vawebol.").anaphors.find((a) => a.pronoun.raw === "dwam");
    assert.equal(share?.antecedent?.raw, "zam");
  });

  it("tags a role pointer, which then stays put", () => {
    assert.deepEqual(tags("zuzozen vowurel. zwazar zwal varuvel. zolazun vowurel. zwar vuhohol."), ["zwal→zwazar", "zwar→zwazar"]);
  });

  it("recalls two tags at once with a stacked vowel, and shares their parts in one event", () => {
    const { anaphors } = resolveOf("zudozol zwal zagozol zwel zam vowurel. zwaer varuvel. zuzozen dwaem vawebol.");
    const pair = anaphors.find((a) => a.pronoun.raw === "zwaer");
    assert.deepEqual(pair?.antecedents?.map((word) => word.raw), ["zudozol", "zagozol"]);
    const share = anaphors.find((a) => a.pronoun.raw === "dwaem");
    assert.deepEqual(share?.antecedents?.map((word) => word.raw), ["zudozol", "zagozol"]);
    assert.deepEqual(tags("zwal bwel vezuyel. zwaerx varuvel."), ["zwaerx→zwal"]);
    assert.throws(() => parseText("zuzozen zwal vowurel. zolazun zwel varuvel. zahelan dwaem vawebol."), /tag -r or -m/);
  });

  it("retro-tags a resume, and a newer assignment takes the tag over", () => {
    assert.deepEqual(tags("zudozol vowurel. dudozor dwel zuzozen vawebol. zwer varuvel."), ["dwel→dudozor", "zwer→dudozor"]);
    assert.deepEqual(tags("zudozol zwal vowurel. zagozol zwal varuvel. zwar vuhohol."), ["zwal→zudozol", "zwal→zagozol", "zwar→zagozol"]);
  });

  it("shares A's part in the latest earlier event A took part in, in whatever role", () => {
    const { anaphors } = resolveOf("zuzozen zwal dolazun vanuvul. zahelan dwam vawebol.");
    const share = anaphors.find((a) => a.pronoun.raw === "dwam");
    assert.equal(share?.antecedent?.raw, "zuzozen");
    assert.equal(share?.part, "z");
    const object = resolveOf("zuzozen zwal vowurel. zolazun dwar vanuvul. zahelan dwam vawebol.").anaphors.find((a) => a.pronoun.raw === "dwam");
    assert.equal(object?.antecedent?.raw, "dwar");
    assert.equal(object?.part, "d");
  });

  it("keeps a tag through a topic change, and drops it after a goodbye", () => {
    assert.deepEqual(tags("zuzozen zwal vowurel. xudozol zudozon vawebol. zwar varuvel."), ["zwal→zuzozen", "zwar→zuzozen"]);
    assert.deepEqual(tags("zuzozen zwal vowurel. xuvedam zudozol varuvel. zwar vuhohol."), ["zwal→zuzozen", "zwar→zuzozen"]);
    assert.throws(() => parseText("uzozen. olazun. zuzozen zwal vowurel. uzozen. olazun. zahelan vowurel. zwar vuhohol."), /tag -r or -m/);
  });

  it("rejects a recall or share with no assignment", () => {
    assert.throws(() => parseText("zwar vowurel."), /tag -r or -m/);
    assert.throws(() => parseText("zuzozen dwam vawebol."), /tag -r or -m/);
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
    const text = "xuzozen zalon dolazun vawebol. zolazur dalon vezuyel. zalon varuvel.";
    assert.deepEqual(topics(text), ["zalon→xuzozen", "dalon→xuzozen", "zalon→xuzozen"]);
  });

  it("takes a role compound as the topic, and returns to it by whole stem", () => {
    assert.deepEqual(topics("xwazuduyel zuzozen dalon vawebol. zalon varuvel."), ["dalon→xwazuduyel", "zalon→xwazuduyel"]);
    assert.deepEqual(topics("xwazuduyel. xuzozen. xwazuduyer. zalon varuvel."), ["zalon→xwazuduyer"]);
  });

  it("takes any compound as the topic", () => {
    assert.deepEqual(topics("xubedaxuyudal zuzozen dalon vawebol. zalon varuvel."), ["dalon→xubedaxuyudal", "zalon→xubedaxuyudal"]);
    assert.deepEqual(topics("xuzozexolazun. zalon varuvel."), ["zalon→xuzozexolazun"]);
  });

  it("takes a kind as the topic", () => {
    assert.deepEqual(topics("xudozol zuzozen dalon vawebol. zalon varuvel."), ["dalon→xudozol", "zalon→xudozol"]);
  });

  it("is not set by being named first, being the subject, or as for", () => {
    assert.throws(() => parseText("zuzozen vowurel. zalon vuhohol."), /topic pronoun/);
    assert.throws(() => parseText("hahugem bluzozen zolazun vowurel. zalon vuhohol."), /topic pronoun/);
  });

  it("holds through as for and a join, and a return restores it after a side topic", () => {
    assert.deepEqual(topics("xuzozen zalon vowurel. hahugem blolazun zudozol varuvel. zalon vuhohol."), ["zalon→xuzozen", "zalon→xuzozen"]);
    assert.deepEqual(topics("xuzozen zalon vowurel. xuvedam zudozol varuvel. or xuzozer zalon vuhohol."), ["zalon→xuzozen", "zalon→xuzozer"]);
  });

  it("is cleared by next and by the way, and by a goodbye", () => {
    assert.throws(() => parseText("xuzozen zalon vowurel. xuvedam zudozol varuvel. zalon vuhohol."), /topic pronoun/);
    assert.throws(() => parseText("xuzozen zalon vowurel. xuvewem zudozol varuvel. zalon vuhohol."), /topic pronoun/);
    assert.throws(() => parseText("uzozen. olazun. xuzozen zalon vowurel. uzozen. olazun. zalon vuhohol."), /topic pronoun/);
  });

  it("restarts the role pointers at every topic change", () => {
    assert.throws(() => parseText("zuzozen vowurel. xolazun zwazar vuhohol."), /role pointer/);
    assert.deepEqual(pointers("zuzozen vowurel. xuzozer zolazun varuvel. zwazar vuhohol."), ["zwazar→zolazun"]);
  });

  it("starts a new stretch when the current topic is returned to", () => {
    assert.throws(() => parseText("xuzozen zolazun vowurel. xuzozer zwazar vuhohol."), /role pointer/);
  });

  it("lets a return to a linker stand as that linker again", () => {
    const text = "xuzozen zolazun vowurel. xahem zahelan vowurel. xaher zwazar vuhohol.";
    assert.deepEqual(pointers(text), ["zwazar→zahelan"]);
  });

  it("leaves a written quote's interior out of the topic and the tags", () => {
    assert.deepEqual(topics("xolazun zolazun vezuyel d[xuzozen zalon zudozol vowurel]. zalon vuhohol."), ["zalon→xolazun"]);
    assert.throws(() => parseText("zolazun vezuyel d[zuzozen zwal vowurel]. zwar vuhohol."), /tag -r or -m/);
  });

  it("takes -x on the topic pronoun, but never on the generic one", () => {
    assert.deepEqual(topics("x@<Sam> zalon vowurel."), ["zalon→x@<Sam>"]);
    assert.deepEqual(topics("x<udozo> zalon gamezom."), ["zalon→x<udozo>"]);
    assert.deepEqual(topics("x@[enuron olazun] zalon vezuyol."), ["zalon→x@[enuron olazun]"]);
    assert.throws(() => parseText("zeyonx vowurel."), /generic pronoun/);
  });
});

describe("resolve — role anaphors (roles.md)", () => {
  it("binds zwazozowor to the prior conflict verb", () => {
    const { anaphors } = resolveOf("zar dugobon vozowol. zwazozowor vurunul.");
    const role = anaphors.find((a) => a.kind === "role");
    assert.ok(role);
    assert.equal(role!.pronoun.raw, "zwazozowor");
    assert.equal(role!.part, "z");
    assert.equal(role!.antecedent?.raw, "vozowol");
  });


  it("binds zwabezuyor as recipient of the prior tell verb", () => {
    const { anaphors } = resolveOf("zuzozen vezuyol. zwabezuyor vurunul.");
    const role = anaphors.find((a) => a.kind === "role");
    assert.ok(role);
    assert.equal(role!.pronoun.raw, "zwabezuyor");
    assert.equal(role!.part, "b");
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
    const whether = resolveOf("yol zawan vanal dorl zar vowurel.").asks[0]!;
    assert.equal(whether.kind, "yesNo");
    assert.deepEqual(whether.inner?.map((g) => g.raw), ["zar"]);
    const that = resolveOf("yol zawan vevemol darl zar vowurel.").asks[0]!;
    assert.equal(that.kind, "fillAsk");
    assert.deepEqual(that.gaps.map((g) => g.raw), ["zar"]);
    const both = resolveOf("yol zar vanal dorl zar vowurel.").asks[0]!;
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

describe("resolve — hooked-join point-back (hook-compounds.md#hooked-joins-point-back)", () => {
  const landmarkOf = (text: string) => resolveOf(text).anaphors.find((bind) => bind.kind === "landmark")?.antecedent?.raw;

  it("takes the latest landmark: a hook's /b/, a hosted bl- word, or a hooked join's", () => {
    assert.equal(landmarkOf("zuzozen vuhohol ol bahehal. zorxual vezuvol."), "bahehal");
    assert.equal(landmarkOf("zuzozen vuhohol ol bahehal. zoxual bluzahal vezuvol. zarxar vowurel."), "bluzahal");
    assert.equal(landmarkOf("zuzozen vowurel halam blenulul. zorxual vezuvol."), "blenulul");
  });

  it("on /h/, takes only a time landmark", () => {
    assert.equal(landmarkOf("zuzozen vowurel halam blenulul. zolazun vuhohol ol bahehal. zawan vebal hurxal."), "blenulul");
    assert.equal(landmarkOf("zuzozen vowurel huxal blovulul. zawan vebal hurxal."), "blovulul");
  });
});
