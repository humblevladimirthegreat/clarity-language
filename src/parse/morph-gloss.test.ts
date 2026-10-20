import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";

import { createClassifyTables } from "./classify.js";
import {
  compareMorphGloss,
  extractExampleBlocks,
  extractTeachBlocks,
  morphGlossLine,
  morphRedundantWithLoose,
  normalizeMorphLine,
} from "./morph-gloss.js";

const rootDir = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const tables = createClassifyTables(
  readFileSync(join(rootDir, "data", "lexicon-published.csv"), "utf8"),
  readFileSync(join(rootDir, "data", "lexicon-overlays.csv"), "utf8"),
  readFileSync(join(rootDir, "data", "lexicon-compounds.csv"), "utf8"),
);

function expectLine(agebon: string, morph: string): void {
  assert.equal(morphGlossLine(agebon, tables), normalizeMorphLine(morph), agebon);
}

describe("morphGlossLine — clause joins go between clauses", () => {
  it("groups a switched join over the list before it", () => {
    expectLine(
      "zuzozen vewurel xol zolazun varuvel xal zuhelan vezuvol.",
      "[[z-Uzozen | v-walk | x-or-exactly-one | z-Olazun | v-run] | x-and | z-Uhelan | v-sleep]",
    );
  });
  it("reads a sentence-initial join as linking the whole next sentence", () => {
    expectLine(
      "zuzozen vewurel. xan zolazun varuvel xol zuhelan vezuvol.",
      "z-Uzozen | v-walk . x-and-then | [z-Olazun | v-run | x-or-exactly-one | z-Uhelan | v-sleep]",
    );
  });
  it("takes a standalone join as a stand-in clause item", () => {
    expectLine("zuzozen vewurel xol xal.", "[z-Uzozen | v-walk | x-or-exactly-one | x-none]");
    expectLine("xual ul zuzozen vewurel.", "x-everything | except | z-Uzozen | v-walk");
  });
  it("glosses a resume of a resume as the original referent", () => {
    expectLine(
      "zuzozen thamal vewurel xon zuzozer vezuyol xon zuzozer vezuvol.",
      "[z-Uzozen | th-plan-atlas | v-walk | x-or-else | z-←Uzozen | v-sing | x-or-else | z-←Uzozen | v-sleep]",
    );
  });
  it("glosses the sequence fallback after an attempt", () => {
    expectLine(
      "zuzozen hudur vewurel xon zuzozer vezuyol.",
      "[z-Uzozen | h-ATTEMPT-trial | v-walk | x-or-else | z-←Uzozen | v-sing]",
    );
  });
});

describe("morphGlossLine — SHARED only where it can describe the join", () => {
  it("leaves an /h/ after a set noun join on the verb", () => {
    expectLine("zuzozen zolazun zal hahuvem vewurel.", "[z-Uzozen | z-Olazun | z-and] | h-intensity | v-walk");
  });
  it("keeps an /h/ after a rank noun join as the scale", () => {
    expectLine("zuzozen zolazun zel hahuvem vewurel.", "[z-Uzozen | z-Olazun | z-rank/more | h-intensity] | v-walk");
  });
  it("reads a /ɡ/ after a /ɡ/ join as the next item, so adjective lists nest", () => {
    expectLine(
      "zudozol gerulel gamezom gul gelazom gal vewurel.",
      "[z-dog | [[g-red | g-small | g-not] | g-big | g-and]] | v-walk",
    );
  });
  it("leaves an /h/ after a /ɡ/ join on the verb", () => {
    expectLine("zudozol gerulel gamezom gal hahuvem vewurel.", "[z-dog | [g-red | g-small | g-and]] | h-intensity | v-walk");
  });
  it("reads al / ul between number endpoints as a range", () => {
    expectLine("zudozol grarel al graval vewurel.", "[z-dog | g-three] | through | g-five | v-walk");
    expectLine("zrabal ul zraval.", "z-plus-infinity | through-excluding | z-five");
    expectLine("zrarel ar zraval.", "z-three | some.through | z-five");
  });
  it("keeps al literal when an endpoint has no digits or the kinds differ", () => {
    expectLine("zral al zraval.", "z-more-than-one | including | z-five");
    expectLine("zrarel al zredul.", "z-three | including | z-2nd");
  });
  it("reads stacked in-clause hooks as spans on any line", () => {
    expectLine("zaduhel oel zaduhel.", "z-down | through | z-down");
    expectLine("zrarel ual zraval.", "z-three | strictly-between | z-five");
    expectLine("zrarel uel zraval.", "z-three | outside | z-five");
    expectLine("zuzozen uar zuhelan vezuvol.", "z-Uzozen | some.strictly-between | z-Uhelan | v-sleep");
  });
});

describe("morphGlossLine — glosses.md single words", () => {
  it("senses-are-separate-roots table", () => {
    expectLine("zamul", "z-microphone");
    expectLine("zamum", "z-performance");
    expectLine("zamun", "z-speaker");
    expectLine("gogowul", "g-quiet");
    expectLine("gogowum", "g-volume");
    expectLine("hevol", "h-fishing");
    expectLine("thevom", "th-MEMORY");
    expectLine("gaheham", "g-home");
  });

  it("house-cast names and resumes", () => {
    expectLine("zuzozen", "z-Uzozen");
    expectLine("zolazun", "z-Olazun");
    expectLine("zuhelan", "z-Uhelan");
    expectLine("zuzozen. zuzozer", "z-Uzozen . z-←Uzozen");
    expectLine("zolazun. zolazur", "z-Olazun . z-←Olazun");
    expectLine("zuhelan. zuhelar", "z-Uhelan . z-←Uhelan");
  });

  it("mid-word x families", () => {
    expectLine("ohuxalowen", "wish-x-guidance");
    expectLine("yunoduxezalan", "y-Unodu-x-Ezalan");
    expectLine("zuzedoxugudaxududan", "z-Uzedo-x-Uguda-x-Ududan");
    expectLine("vewurexel", "v-walk-unable-temporary");
    expectLine("thulothem", "th-competence-ought-offered");
    expectLine("zaxezuyer", "z-agent-x-speech");
    expectLine("zaxavuvul", "z-agent-x-fight");
    expectLine("zaxavuvum", "z-agent-x-struggle");
    expectLine("zexezuvol", "z-scene-x-sleep");
    expectLine("zoxezuyel", "z-recipient-x-speech");
    expectLine("xrebul", "x-starting-with");
  });

  it("joins, revisers, numbers", () => {
    expectLine("zam", "z-and.open");
    expectLine("zal", "z-and");
    expectLine("vam", "v-and.open");
    expectLine("dol", "d-or-exactly-one");
    expectLine("zol", "z-or-exactly-one");
    expectLine("zel", "z-rank/more");
    expectLine("zoel", "z-equal-rank");
    expectLine("zagozolx g=+ vuhohol.", "[z-cat-x | g-some-amount] | v-sit");
    expectLine("yol zagozolx g=+ vuhohol.", "y-question | [z-cat-x | g-how-many] | v-sit");
    expectLine("yol zuzozen vuhohol ol b=#.", "y-question | z-Uzozen | v-sit | [at | b-which-place]");
    expectLine("zoem", "z-equal-rank.open");
    expectLine("zar", "z-something");
    expectLine("zul", "z-not");
    expectLine("gul", "g-not");
    expectLine("zual", "z-everything-but");
    expectLine("xan", "x-and-then");
    expectLine("ol", "instead");
    expectLine("am", "additionally.open");
    expectLine("al", "additionally");
    expectLine("el", "in.other.words");
    expectLine("ael", "in.fact");
    expectLine("ul", "except");
    expectLine("zuzozen vezuvol al bahehal.", "z-Uzozen | v-sleep | [in | b-house]");
    expectLine("zudozolx al zagozol.", "z-dog-x | including | z-cat");
    expectLine("zuzozen ul buyahel vewurel oel bedavel.", "z-Uzozen | [from | b-station] | v-walk | [toward | b-train]");
    expectLine("zuzozen vezuvol welazom al bahehal.", "z-Uzozen | v-sleep | [[w-very | in] | b-house]");
    expectLine("zuwodalx wal ul zazadal.", "z-plate-x | [w-never | except] | z-salad");
    expectLine("zuzozen welazom humum budozal vewurel.", "z-Uzozen | [[w-very | h-like] | b-duck] | v-walk");
    expectLine("hal", "h-never");
    expectLine("har", "h-sometimes");
    expectLine("yol zuhelan vewurel har.", "y-question | z-Uhelan | v-walk | h-when");
    expectLine("zuzozen vewurel herulal hal", "z-Uzozen | v-walk | h-rain | h-only-when");
    expectLine("hual", "h-always");
    expectLine("von", "v-choose");
    expectLine("grarel", "g-three");
    expectLine("g+3", "g-three.short");
    expectLine("g+12", "g-twelve");
    expectLine("grawodul", "g-twelve.spelled");
    expectLine("g+3 g+12", "g-three | g-twelve");
    expectLine("gral", "g-more-than-one");
    expectLine("g+", "g-more-than-one.short");
    expectLine("gredul", "g-2nd");
  });

  it("glosses a tag pronoun by its letter name, never the referent (glosses.md § Anaphors)", () => {
    expectLine("zudozol zwal dagozol dwel vawebol. zwer vewurel.", "[z-dog | z-tag.A] | [d-cat | d-tag.E] | v-see . z-←tag.E | v-walk");
    expectLine("zuzozen zwal vewurel. zolazun dwam vawebol.", "[z-Uzozen | z-tag.A] | v-walk . z-Olazun | d-←tag.A.part | v-see");
    expectLine("zuzozen zwal vewurel. zwarx vezuvol.", "[z-Uzozen | z-tag.A] | v-walk . z-←tag.A-x | v-sleep");
    expectLine("zudozol zagozol zam zwal vewurel.", "[[z-dog | z-cat | z-and.open] | z-tag.A] | v-walk");
    expectLine("zwal bwel vezuyel. zwaer vewurel.", "z-tag.A | b-tag.E | v-tell . z-←tag.A+E | v-walk");
  });

  it("scientific and percent number writing", () => {
    expectLine("g+27e12", "g-27e12");
    expectLine("g+25%", "g-25yo");
    expectLine("grarel", "g-three");
  });

  it("worked single-words table", () => {
    expectLine("yewuyal", "y-greeting");
    expectLine("uzozen.", "Uzozen");
    expectLine("yolazuxen", "y-Olazun-minutes");
    expectLine("yael", "y-yes");
    expectLine("yol", "y-question");
    expectLine("zehon", "z-listener");
    expectLine("zahan", "z-interlocutors");
    expectLine("zamunx", "z-speaker-x");
    expectLine("zehonx", "z-listener-x");
    expectLine("thodom", "th-LIVE");
    expectLine("hamom", "h-RESIDUE");
    expectLine("henom", "h-FORMER");
    expectLine("thamar", "th-plan-sketch");
    expectLine("gugol", "g-SAME");
  });

  it("fill-ask zar is z-wh", () => {
    expectLine("yol zar vewurel", "y-question | z-wh | v-walk");
  });

  it("stand-in glosses and hostless ABIL", () => {
    expectLine("darl", "d-that-clause");
    expectLine("dorl", "d-whether-clause");
    expectLine("derl", "d-to-clause");
    expectLine("durl", "d-lest-clause");
    expectLine("darm", "d-that-clause.open");
    expectLine("huboxel", "h-ABIL-unable-temporary");
  });

  it("lexicon senses use packed role English when present", () => {
    expectLine("vuhohol", "v-sit");
    expectLine("vawebol", "v-see");
    expectLine("vezuyel", "v-tell");
    expectLine("verurul", "v-departure");
    expectLine("welazom", "w-very");
    expectLine("gelazom", "g-big");
    expectLine("al bahehal", "[in | b-house]");
    expectLine("ael behowol", "[using | b-hammer]");
    expectLine("humum", "h-like");
    expectLine("gumum", "g-like");
    expectLine("gobom", "g-part-of");
    expectLine("gahem", "g-contents");
    expectLine("guwum", "g-material");
    expectLine("gagum", "g-origin");
    expectLine("hazam", "h-between");
    expectLine("zawebol", "z-eye");
    expectLine("hahugel", "h-hash");
    expectLine("yam", "y-soft-statement");
    expectLine("yem", "y-request");
    expectLine("yum", "y-soft-prohibition");
    expectLine("yal", "y-statement");
    expectLine("yel", "y-command");
  });
});

describe("morphGlossLine — glosses.md dialogue turns", () => {
  it("inclusive census turn", () => {
    expectLine(
      "yael zamun zam zehon zal gozumol.",
      "y-yes | [[z-speaker | z-and.open] | z-listener | z-and | g-sleepy]",
    );
  });

  it("ability + value motive", () => {
    expectLine(
      "yuel zamun vewurexel thulothom.",
      "y-no | z-speaker | v-walk-unable-temporary | th-competence-motive-any-term",
    );
  });

  it("numbered alternative + unmet pleasure", () => {
    expectLine(
      "xrebul zabevam grewol. zamunx thozothur.",
      "x-starting-with | [z-problem | g-1st] . z-speaker-x | th-pleasure-unmet-passing",
    );
  });

  it("literal key is not ideation solution", () => {
    expectLine("zogewel wuboxel.", "z-key | w-ABIL-unable-temporary");
  });

  it("inclusive we", () => {
    expectLine(
      "yael xodum zahan thamar vewurel vul.",
      "y-yes | x-therefore | z-interlocutors | th-plan-sketch | [v-walk | v-not]",
    );
  });

  it("resume with in-text antecedent", () => {
    expectLine(
      "yohuxezalan. xezom zohuxezalar thevom zerulal.",
      "y-Ohu-x-Ezalan . x-however | z-←Ohu-x-Ezalan | th-MEMORY | z-rain",
    );
  });
});

describe("morphGlossLine — act -r and linker endings", () => {
  it("act words with -r are just formed or for now", () => {
    expectLine("yar zuzozen vewurel.", "y-provisional-statement | z-Uzozen | v-walk");
    expectLine("yor zuzozen vewurel.", "y-working-question | z-Uzozen | v-walk");
    expectLine("yer vewurel.", "y-command-for-now | v-walk");
    expectLine("yur vewurel.", "y-hold-off | v-walk");
  });

  it("linkers default to -m; -l is the firm link where taught", () => {
    expectLine("xezom zuzozen vewurel.", "x-however | z-Uzozen | v-walk");
    expectLine("xezol zuzozen vewurel.", "x-nevertheless | z-Uzozen | v-walk");
    expectLine("xodul zuzozen vewurel.", "x-it-follows | z-Uzozen | v-walk");
    expectLine("xegohul zuzozen vewurel.", "x-on-the-contrary | z-Uzozen | v-walk");
  });
});

describe("morphGlossLine — restrictor -r vs -l", () => {
  it("har is sometimes / when, not never", () => {
    expectLine("hal", "h-never");
    expectLine("zolazun vewurel hal.", "z-Olazun | v-walk | h-never");
    expectLine("har", "h-sometimes");
    expectLine("zolazun varuvel har.", "z-Olazun | v-run | h-sometimes");
    expectLine("yol zuhelan vewurel har.", "y-question | z-Uhelan | v-walk | h-when");
  });
  it("her is the first-ranked occasion; under a question it asks when is best (restrictors.md)", () => {
    expectLine("zuzozen vewurel her.", "z-Uzozen | v-walk | h-preferred-time");
    expectLine("yol zahan vewurel her.", "y-question | z-interlocutors | v-walk | h-when-best");
    expectLine("yol zahan vewurel herulal henurul her.", "y-question | z-interlocutors | v-walk | h-rain | h-night | h-when-best");
  });
});

describe("morphGlossLine — tags, xuen, humul, pointer anchors", () => {
  it("any polar word makes a tag after yol (questions.md#tags)", () => {
    expectLine("yem zahan vewurel. yol yaol.", "y-request | z-interlocutors | v-walk . y-question | y-sure");
    expectLine("yem zehon vewurel. yol yuol.", "y-request | z-listener | v-walk . y-question | y-refuse-option");
    expectLine("zuzozen vewurel. yol yuel.", "z-Uzozen | v-walk . y-question | y-no");
  });
  it("xuen tells a sequence last first (join-across-roles.md#sequence)", () => {
    expectLine("zuzozen vuhohol xuen zuzozer vewurel.", "[z-Uzozen | v-sit | x-and-before-that | z-←Uzozen | v-walk]");
  });
  it("humul / gumul are exactly like (relations.md#exactly-like)", () => {
    expectLine("zuzozen humul budozal vewurel.", "z-Uzozen | [h-exactly-like | b-duck] | v-walk");
    expectLine("zahehal gumul buzozen.", "z-house | [g-exactly-like | b-Uzozen]");
  });
  it("a role pointer as a viewpoint lateral's facing anchor (roles.md#viewpoint-laterals)", () => {
    expectLine("zuzozen vewurel. zolazun vuhohol howuhethaxar.", "z-Uzozen | v-walk . z-Olazun | v-sit | h-west-th-←agent.same");
    expectLine("zuzozen vewurel howuhethaxer.", "z-Uzozen | v-walk | h-west-th-←agent.self");
  });
});

describe("compareMorphGloss", () => {
  it("passes an equal pair", () => {
    const result = compareMorphGloss("zuzozen gudozol.", "z-Uzozen | g-dog", tables);
    assert.equal(result.ok, true);
    assert.equal(result.expected, "z-Uzozen | g-dog");
    assert.equal(result.actual, "z-Uzozen | g-dog");
  });

  it("fails a sense mismatch with expected/actual", () => {
    const result = compareMorphGloss("zamun", "z-microphone", tables);
    assert.equal(result.ok, false);
    assert.equal(result.expected, "z-microphone");
    assert.equal(result.actual, "z-speaker");
    assert.equal(result.parseError, undefined);
  });

  it("fails unparseable Agebon as parse, not gloss mismatch", () => {
    const result = compareMorphGloss("z!!!", "z-nope", tables);
    assert.equal(result.ok, false);
    assert.ok(result.parseError);
  });

  it("emits scope island edges in morph gloss", () => {
    expectLine(
      "zuzozen { hegugom zudozol gerulel } vawebol",
      "z-Uzozen | SCOPE[h-possibility | [z-dog | g-red]] | v-see",
    );
  });

  it("a mention is a marker word plus the span: a one-word cite or an opaque interior stays as written", () => {
    expectLine("glelel z[udozo] gamezom", '[gl-MENTION | z-CITE["udozo"]] | g-small');
    expectLine("glelel z[zuzozen vezuyol] gamezom", "[gl-MENTION | z-CITE[z-Uzozen | v-sing]] | g-small");
    expectLine("glelel z<kimchi> gamezom", '[gl-MENTION | z-OPAQUE["kimchi"]] | g-small');
    expectLine("glelen d[onuron] vegugum", "[gl-NAME.MENTION | d-CITE[Onuron]] | v-rejection");
    expectLine("zuzozen d@[onuron olazun] vegugum", "z-Uzozen | d-NAME.CITE[Onuron | Olazun] | v-rejection");
  });

  it("glosses -ln and ^@ as the name plus .instance (word-endings.md#name-instance--ln)", () => {
    expectLine("zolazun duzozeln vawebol", "z-Olazun | d-Uzozen.instance | v-see");
    expectLine("zolazun duzozelnx vawebol", "z-Olazun | d-Uzozen.instance-x | v-see");
    expectLine("zolazun d^@<iPhone> vawebol", 'z-Olazun | d-NAME.OPAQUE.instance["iPhone"] | v-see');
  });

  it("the mention marker's spelling is the ordinary adjective anywhere but before a span", () => {
    expectLine("glelel zudozol vewurel", "[gl-letters | z-dog] | v-walk");
  });

  it("ordinary -l on a sake host root uses literal sense, not sake overlay", () => {
    expectLine("zuzozen ganal bolazun", "z-Uzozen | [g-knot | b-Olazun]");
  });

  it("morphRedundantWithLoose allows single-word citation skips", () => {
    assert.equal(morphRedundantWithLoose("uzozel", "swan", tables), true);
    assert.equal(morphRedundantWithLoose("uzozen.", '"Uzozen."', tables), true);
    assert.equal(morphRedundantWithLoose("zuzozen vuhohol.", "Uzozen sits.", tables), false);
    assert.equal(morphRedundantWithLoose("z!!!", "nope", tables), false);
  });

  it("extractTeachBlocks finds morph after a name line and loose quotes", () => {
    const md = `> \`uzozen.\`
>
> Uzozen
>
> "Uzozen." (hello — the speaker is Uzozen)
`;
    const [block] = extractTeachBlocks(md);
    assert.ok(block);
    assert.equal(block!.agebon, "uzozen.");
    assert.equal(block!.morph, "Uzozen");
    assert.equal(block!.loose, "Uzozen.");
  });

  it("extractTeachBlocks allows omitted morph when only loose follows", () => {
    const md = `> \`uzozel\`
>
> "swan"
`;
    const [block] = extractTeachBlocks(md);
    assert.ok(block);
    assert.equal(block!.morph, null);
    assert.equal(block!.loose, "swan");
  });

  it("extractTeachBlocks splits blockquotes separated by a blank line", () => {
    const md = `> \`yel vewurel.\`
>
> y-command | v-walk
>
> "Walk."

> \`! zuzozen vewurel.\`
>
> ! | z-Uzozen | v-walk
>
> "Uzozen walks!"
`;
    const blocks = extractTeachBlocks(md);
    assert.equal(blocks.length, 2);
    assert.equal(blocks[1]!.agebon, "! zuzozen vewurel.");
    assert.equal(blocks[1]!.morph, "! | z-Uzozen | v-walk");
    assert.equal(blocks[1]!.loose, "Uzozen walks!");
  });

  it("round-trips the yael census example block", () => {
    const md = `> \`yael zamun zam zehon zal gozumol.\`
>
> y-yes | [[z-speaker | z-and.open] | z-listener | z-and | g-sleepy]
>
> "Yes — you and I are sleepy."
`;
    const [pair] = extractExampleBlocks(md);
    assert.ok(pair);
    const result = compareMorphGloss(pair!.agebon, pair!.morph, tables);
    assert.equal(result.ok, true, `${result.expected} vs ${result.actual}`);
  });

  it("values bake stance and ending grain", () => {
    expectLine("zebel ganathal", "z-present | g-relatedness-met-lasting");
    expectLine("zabowam wahuthur gobum", "z-gathering | [w-autonomy-unmet-passing | g-stimulus]");
    expectLine("zezuyel wulothuraor gobum", "z-speech | [w-competence-unmet-passing-CIRCUM-SURGING | g-stimulus]");
    expectLine("zebewem gulothamar", "z-draft | g-competence-met-any-term-INTERNAL-SURGING");
    expectLine("zumel wanathumuer gobum", "z-memo | [w-relatedness-unmet-modifiable-RESISTING-SURGING | g-stimulus]");
    expectLine("ganathaluom", "g-relatedness-met-lasting-UNPLACED-FLOWING");
  });

  it("span interiors: cite and aside gloss English; an opaque interior passes through", () => {
    expectLine("zuzozen vewurel th(hogowul)", "z-Uzozen | v-walk | th-ASIDE[h-quiet]");
    expectLine("yul zolazun v[vozohul]", "y-prohibition | z-Olazun | v-CITE[v-stop]");
    expectLine(
      "zuzozen vewurel th(zolazun vezuvol)",
      "z-Uzozen | v-walk | th-ASIDE[z-Olazun | v-sleep]",
    );
    expectLine("x@<Sam> zozan vewurel", 'x-NAME.OPAQUE["Sam"] | z-TOPIC | v-walk');
    expectLine("glelel x[udozo] zozan gamezom", '[gl-MENTION | x-CITE["udozo"]] | z-TOPIC | g-small');
  });

  it("viewpoint laterals keep compass on DIR", () => {
    expectLine("yel vewurel howuhethuzozen", "y-command | v-walk | h-west-th-Uzozen");
  });

  it("a holder seam glosses its host overlay and the holder", () => {
    expectLine("zolazun thunemuzozen verurul", "z-Olazun | th-CLUES-Uzozen | v-departure");
    expectLine("zolazun thewaruzozen verurul", "z-Olazun | th-REPORTED.weak-Uzozen | v-departure");
    expectLine("zolazun thovuluzozen verurul", "z-Olazun | th-MAY-find-out-Uzozen | v-departure");
    expectLine("zolazun thavomuzozen verurul", "z-Olazun | th-NOTIONAL-Uzozen | v-departure");
  });

  it("a holder takes resume -r and associative -x like any noun", () => {
    expectLine(
      "zuzozen verurul. zolazun thunemuzozer vuhohol.",
      "z-Uzozen | v-departure . z-Olazun | th-CLUES-←Uzozen | v-sit",
    );
    expectLine("zolazun thunemuzozenx verurul", "z-Olazun | th-CLUES-Uzozen-x | v-departure");
  });

  it("a hook + /b/ after a landmark describes that landmark; after a recipient it is same-role", () => {
    expectLine("zehon al behaham om bamun vohal", "z-listener | [in | [b-locality | [near | b-speaker]]] | v-hatch");
    expectLine("zuzozen vayurel hugem bavulul om bamun", "z-Uzozen | v-dance | [h-around | [b-fire | [near | b-speaker]]]");
    expectLine("zuzozen bolazun al buhelan vezuyel", "z-Uzozen | b-Olazun | including | b-Uhelan | v-tell");
  });

  it("stacked extra-noun -r points back (hooks.md § Point back)", () => {
    expectLine("zuzozen vuhohol aor", "z-Uzozen | v-sit | on.it");
    expectLine("zolazun varayel aer", "z-Olazun | v-write | with.it");
    expectLine("zuzozen vewurel uor", "z-Uzozen | v-walk | through.there");
  });

  it("em + /b/ goes inside the bracket of the noun on its left", () => {
    expectLine("zudozol gelazom em bamun", "[z-dog | g-big | [used-by | b-speaker]]");
    expectLine("zudozol em bamun gelazom", "[z-dog | [used-by | [b-speaker | g-big]]]");
    expectLine("zudozol gelazom al behaham em bamun", "[z-dog | g-big] | [in | [b-locality | [used-by | b-speaker]]]");
    expectLine("zuzozen bolazun em bamun vezuyel", "z-Uzozen | b-Olazun | rather.open | b-speaker | v-tell");
  });

  it("label scope glosses its seam vowel", () => {
    expectLine("zolazun gunomuthal", "z-Olazun | g-angry-th-episode");
    expectLine("zuzozen valamuthel", "z-Uzozen | v-lie-th-role");
    expectLine("zolazun ganumuthul", "z-Olazun | g-anxious-th-type");
    expectLine("zolazun gaxuduyethel", "z-Olazun | g-agent-x-teach-th-role");
    expectLine("zuzozen valamuthol bolazun", "z-Uzozen | [v-lie-th-pair | b-Olazun]");
    expectLine("zuzozen valamuthaol bolazun", "z-Uzozen | [v-lie-th-on-pair | b-Olazun]");
    expectLine("zuzozen valamuthual", "z-Uzozen | v-lie-th-except-episode");
    expectLine("zolazun gaxuduyethael", "z-Olazun | g-agent-x-teach-th-using");
    expectLine("zolazun gaxuduyethoel", "z-Olazun | g-agent-x-teach-th-toward-role");
    expectLine("zolazun gaxuduyethuel", "z-Olazun | g-agent-x-teach-th-outside-role");
    expectLine("zuzozen gunomuthuol bolazun", "z-Uzozen | [g-angry-th-except-pair | b-Olazun]");
  });

  it("a pair-scope verb hosts the /b/ right after it", () => {
    expectLine("zuzozen valamuthol bolazun", "z-Uzozen | [v-lie-th-pair | b-Olazun]");
  });

  it("house-cast resume without a same-line antecedent", () => {
    expectLine("zuzozerx vuhohol", "z-←Uzozen-x | v-sit");
  });

  it("role pointers gloss their role and event, not the referent", () => {
    expectLine("zuzozen vewurel. zaxar vuhohol", "z-Uzozen | v-walk . z-←agent.same | v-sit");
    expectLine("zuzozen vawebol daxer", "z-Uzozen | v-see | d-←agent.self");
    expectLine("zuzozen vewurel. zaexarx vuhohol", "z-Uzozen | v-walk . z-←instrument.same-x | v-sit");
    expectLine("zuzozen vewurel. zolazun thunemaxar verurul", "z-Uzozen | v-walk . z-Olazun | th-CLUES-←agent.same | v-departure");
  });

  it("quasi numeric derivation is English", () => {
    expectLine("zuhelan gahuyayolrubul", "z-Uhelan | g-friend-l-quasi");
  });

  it("abstract numeric join is -m in the gloss", () => {
    expectLine("zulamamrabal", "z-love-m-infinity");
  });
});

describe("morphGlossLine — extra fixtures", () => {
  it("round-trips glosses.md example blocks that include their antecedents", () => {
    const glosses = readFileSync(join(rootDir, "docs", "meta", "glosses.md"), "utf8");
    const pairs = extractExampleBlocks(glosses);
    assert.ok(pairs.length >= 6);
    for (const pair of pairs) {
      if (pair.morph.includes("←")) continue;
      const result = compareMorphGloss(pair.agebon, pair.morph, tables);
      assert.equal(
        result.ok,
        true,
        `${pair.agebon} → documented ${pair.morph} vs parser ${result.actual}${result.parseError ? ` (${result.parseError})` : ""}`,
      );
    }
  });
});

describe("morphGlossLine — th stance letter", () => {
  it("glosses stance moods, /w/ on th, and th poles with stand-ins", () => {
    expectLine("thovum zuzozen vuhohol.", "th-MAY | z-Uzozen | v-sit");
    expectLine("zuzozen wozumol thodom vawebol awebolul.", "z-Uzozen | [w-sleepy | th-LIVE] | v-see | eye-leave");
    expectLine("thavem barl zuzozen vuhohol.", "[th-because | b-that-clause] | z-Uzozen | v-sit");
    expectLine("thunem barl zuzozen vuhohol.", "[th-CLUES | b-that-clause] | z-Uzozen | v-sit");
    expectLine("thugul barl zuzozen vuhohol.", "[th-DEDUCED.strong | b-that-clause] | z-Uzozen | v-sit");
    expectLine("thobal bral barl zuzozen vuhohol.", "[th-PATTERN.strong | [b-later | b-that-clause]] | z-Uzozen | v-sit");
    expectLine("zuzozen vuhohol th(zolazun vewurel).", "z-Uzozen | v-sit | th-ASIDE[z-Olazun | v-walk]");
  });

  it("keeps time poles and restrictors on /h/", () => {
    assert.match(morphGlossLine("habam barl zuzozen vuhohol.", tables), /^\[h-before/);
  });
});

describe("morphGlossLine — stance joins and emphatic prohibition", () => {
  it("glosses /th/ join fences", () => {
    expectLine("zuzozen vewurel thevom thul.", "z-Uzozen | v-walk | th-MEMORY | th-not");
    expectLine("zuzozen vewurel thavem bolazun thul.", "z-Uzozen | v-walk | [th-because | b-Olazun] | th-not");
  });

  it("glosses yul yul", () => {
    expectLine("yul yul vazuyul.", "y-prohibition | y-prohibition | v-sneak");
  });
});

describe("morphGlossLine — tone marks", () => {
  it("copies attached and free-standing marks", () => {
    expectLine("zuzozen vawebol ?dudozol.", "z-Uzozen | v-see | ?d-dog");
    expectLine("! zuzozen vewurel.", "! | z-Uzozen | v-walk");
    expectLine("zuzozen vawebol &dudozol.", "z-Uzozen | v-see | &d-dog");
    expectLine("zuzozen ; vewurel.", "z-Uzozen | ; | v-walk");
    expectLine("%zuzozen vewurel.", "%z-Uzozen | v-walk");
  });
});

describe("morphGlossLine — standalone joins", () => {
  it("standalone reads none / everything; items keep list readings", () => {
    expectLine("zal vewurel.", "z-none | v-walk");
    expectLine("zam vewurel.", "z-none.open | v-walk");
    expectLine("zual vewurel.", "z-everything | v-walk");
    expectLine("zuzozen vewurel ol bual.", "z-Uzozen | v-walk | [at | b-everything]");
    expectLine("zuzozen vawebol dal.", "z-Uzozen | v-see | d-none");
    expectLine("zuzozen zual vewurel.", "[z-Uzozen | z-everything-but] | v-walk");
    expectLine("zuzozen zolazun zal vewurel.", "[z-Uzozen | z-Olazun | z-and] | v-walk");
  });
});

describe("morphGlossLine — kind reference", () => {
  it("zuan + shared kind reads the kind itself", () => {
    expectLine("zuan gagozol gozumol.", "[z-the-kind | g-cat] | g-sleepy");
    expectLine("zuzozen duan gagozol vawebol.", "z-Uzozen | [d-the-kind | g-cat] | v-see");
  });
});

describe("morphGlossLine — word position, not spelling", () => {
  it("does not read an in-clause hook as discourse because an earlier sentence opened with the same spelling", () => {
    const line = morphGlossLine("al zuzozen vewurel. zuzozen al zolazun zal vewurel.", tables);
    const second = line.split(" . ")[1] ?? "";
    assert.ok(!second.includes("additionally"), line);
  });
});

describe("morphGlossLine — topic and generic pronouns", () => {
  it("glosses the topic pronoun and its topic word", () => {
    expectLine(
      "xuzozen zozan dolazun vawebol. zolazur dozan vezuyel.",
      "x-Uzozen | z-TOPIC | d-Olazun | v-see . z-←Olazun | d-TOPIC | v-tell",
    );
    expectLine("xuzozenx zozanx vuhohol.", "x-Uzozen-x | z-TOPIC-x | v-sit");
    expectLine("xuzozer zozan vuhohol.", "x-←Uzozen | z-TOPIC | v-sit");
  });
  it("glosses the generic pronoun, and either one as a holder", () => {
    expectLine("zoben vezuvol.", "z-ONE | v-sleep");
    expectLine("xuzozen thunemozan zolazun verurul.", "x-Uzozen | th-CLUES-TOPIC | z-Olazun | v-departure");
    expectLine("thunemoben zolazun verurul.", "th-CLUES-ONE | z-Olazun | v-departure");
  });
  it("keeps the star and person roots ordinary on other endings", () => {
    expectLine("zozal vewurel.", "z-star | v-walk");
    expectLine("zobel vewurel.", "z-person | v-walk");
  });
  it("glosses a topic word with its own hooks, and the clearing linkers", () => {
    expectLine("xudozol em buzozen zolazun vawebol.", "x-dog | [used-by | b-Uzozen] | z-Olazun | v-see");
    expectLine("xuvewem zuzozen vewurel.", "x-next | z-Uzozen | v-walk");
    expectLine("hahugem buzozen zolazun vewurel.", "[h-as-for | b-Uzozen] | z-Olazun | v-walk");
  });
});

describe("morphGlossLine — flag rows", () => {
  it("glosses -l as the flag, -n as the nativized name, -m as the demonym", () => {
    expectLine("zolazun vawebol dazabanal.", "z-Olazun | v-see | d-japan-flag");
    expectLine("zolazun vawebol dazabanan.", "z-Olazun | v-see | d-Azabanan");
    expectLine("zolazun gazabanam.", "z-Olazun | g-japanese");
  });
});

describe("morphGlossLine — verb-phrase join items", () => {
  it("puts an /h/ or /d/ before a later verb inside that verb's item", () => {
    expectLine("zuzozen vewurel hodurem varuvel val.", "z-Uzozen | [v-walk | [h-haste | v-run] | v-and]");
    expectLine("zuzozen vugudel duredal vuhohol val.", "z-Uzozen | [v-cooking | [d-popcorn | v-sit] | v-and]");
  });

  it("puts the words between the subject and the first verb in the first item, and leaves a joinless verb chain flat", () => {
    expectLine("zuzozen hodurem vugudel varuvel val.", "z-Uzozen | [[h-haste | v-cooking] | v-run | v-and]");
    expectLine(
      "zuzozen duredal vugudel hugem bavulul vuhohol val.",
      "z-Uzozen | [[d-popcorn | v-cooking] | [[h-around | b-fire] | v-sit] | v-and]",
    );
    expectLine("zuzozen buhelan vezuyel buzozen vamol val.", "z-Uzozen | [[b-Uhelan | v-tell] | [b-Uzozen | v-pay] | v-and]");
    expectLine("zuzozen vewurel hodurem varuvel.", "z-Uzozen | v-walk | h-haste | v-run");
  });

  it("shares words before the subject, and /d/ /b/ /h/ after the join", () => {
    expectLine("duredal zuzozen vugudel vagedal val.", "d-popcorn | z-Uzozen | [v-cooking | v-eat | v-and]");
    expectLine("hodurem zuzozen vugudel varuvel val.", "h-haste | z-Uzozen | [v-cooking | v-run | v-and]");
    expectLine("h_15,30 zuzozen vewurel varuvel val.", "h-_15,30 | z-Uzozen | [v-walk | v-run | v-and]");
    expectLine("zuzozen vugudel vagedal val duredal.", "z-Uzozen | [v-cooking | v-eat | v-and | d-popcorn]");
    expectLine("zuzozen vugudel varuvel val hodurem.", "z-Uzozen | [v-cooking | v-run | v-and | h-haste]");
    expectLine("zuzozen vugudel vagedal val buhelan hahuvem.", "z-Uzozen | [v-cooking | v-eat | v-and | b-Uhelan | h-intensity]");
    expectLine("duredal vugudel vagedal val zuzozen.", "d-popcorn | [v-cooking | v-eat | v-and] | z-Uzozen");
  });

  it("keeps a /th/ word at the edge of the first item outside it, and one inside it in its bracket", () => {
    expectLine("zuzozen thovemom vewurel varuvel val.", "z-Uzozen | th-doubt | [v-walk | v-run | v-and]");
    expectLine("zuzozen duredal thovemom vugudel vagedal val.", "z-Uzozen | [[d-popcorn | th-doubt | v-cooking] | v-eat | v-and]");
  });

  it("leaves a one-verb denial as it is", () => {
    expectLine("zuzozen duredal vawebol vul.", "z-Uzozen | d-popcorn | [v-see | v-not]");
  });

  it("takes an extra-noun hook into the item of the verb after it", () => {
    expectLine("zuzozen vewurel ul b_9 varuvel val.", "z-Uzozen | [v-walk | [[from | b-_9] | v-run] | v-and]");
    expectLine("zuzozen vewurel ul barl zolazun vezuvol.", "z-Uzozen | v-walk | [from | b-that-clause] | z-Olazun | v-sleep");
  });
});

describe("morphGlossLine — from … to", () => {
  it("reads ul X oel Y as one unit, wherever it sits", () => {
    expectLine("zuzozen ul b_9 oel b_17 vewurel.", "z-Uzozen | [from | b-_9 | toward | b-_17] | v-walk");
    expectLine("zuzozen vewurel varuvel val ul b_9 oel b_17.", "z-Uzozen | [v-walk | v-run | v-and] | [from | b-_9 | toward | b-_17]");
    expectLine("zuzozen vewurel ul b_9 oel b_17 varuvel val.", "z-Uzozen | [v-walk | [[from | b-_9 | toward | b-_17] | v-run] | v-and]");
  });

  it("keeps the straddling form as two extra nouns", () => {
    expectLine("zuzozen ul b_9 vewurel oel b_17.", "z-Uzozen | [from | b-_9] | v-walk | [toward | b-_17]");
  });
});
