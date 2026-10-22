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

describe("morphGlossLine — join blanks", () => {
  it("glosses a hosted blank and -x after a join -r as a group", () => {
    expectLine("yol hewom blar zuzozen vowurel.", "y-question | [h-like | bl-wh] | z-Uzozen | v-walk");
    expectLine("zarx vowurel.", "z-something-x | v-walk");
  });
});

describe("morphGlossLine — hooked joins (hooks.md#hooked-joins)", () => {
  it("glosses the hook, -x-, the join, and brackets the landmark with it", () => {
    expectLine("zoxual blahehal vezuvol.", "[z-at-x-everything | bl-house] | v-sleep");
    expectLine("zomxuam bluwon vezuvol.", "[z-near-x-everything.open | bl-speaker] | v-sleep");
    expectLine("yol dexar bluwon.", "y-question | [d-for-x-wh | bl-speaker]");
    expectLine("zoxual blual vezuvol.", "[z-at-x-everything | bl-everything] | v-sleep");
    expectLine("zoxual blahehal gagozol vezuvol.", "[z-at-x-everything | bl-house | g-cat] | v-sleep");
  });
  it("glosses a point-back hook, and on /h/ a time", () => {
    expectLine("zuzozen vuhohol ol bahehal. zorxual vezuvol.", "z-Uzozen | v-sit | [at | b-house] . z-there-x-everything | v-sleep");
    expectLine("zuzozen vowurel halam blenulul. zawan vebal hurxal.", "z-Uzozen | v-walk | [h-after | bl-thunderstorm] . z-listener | v-hear | h-since.then-x-never");
    expectLine("zawan vebal huxam blenulul.", "z-listener | v-hear | [h-from-x-never.open | bl-thunderstorm]");
  });
});

describe("morphGlossLine — clause joins go between clauses", () => {
  it("groups a switched join over the list before it", () => {
    expectLine(
      "zuzozen vowurel xol zolazun varuvel xal zahelan vezuvol.",
      "[[z-Uzozen | v-walk | x-or-exactly-one | z-Olazun | v-run] | x-and | z-Ahelan | v-sleep]",
    );
  });
  it("reads a sentence-initial join as linking the whole next sentence", () => {
    expectLine(
      "zuzozen vowurel. xan zolazun varuvel xol zahelan vezuvol.",
      "z-Uzozen | v-walk . x-and-then | [z-Olazun | v-run | x-or-exactly-one | z-Ahelan | v-sleep]",
    );
  });
  it("takes a standalone join as a stand-in clause item", () => {
    expectLine("zuzozen vowurel xol xal.", "[z-Uzozen | v-walk | x-or-exactly-one | x-none]");
    expectLine("xual ul zuzozen vowurel.", "x-everything | except | z-Uzozen | v-walk");
  });
  it("glosses a resume of a resume as the original referent", () => {
    expectLine(
      "zuzozen thagel vowurel xon zuzozer vezuyol xon zuzozer vezuvol.",
      "[z-Uzozen | th-plan-atlas | v-walk | x-or-else | z-←Uzozen | v-sing | x-or-else | z-←Uzozen | v-sleep]",
    );
  });
  it("glosses the sequence fallback after an attempt", () => {
    expectLine(
      "zuzozen howar vowurel xon zuzozer vezuyol.",
      "[z-Uzozen | h-ATTEMPT-trial | v-walk | x-or-else | z-←Uzozen | v-sing]",
    );
  });
});

describe("morphGlossLine — SHARED only where it can describe the join", () => {
  it("leaves an /h/ after a set noun join on the verb", () => {
    expectLine("zuzozen zolazun zal huhunem vowurel.", "[z-Uzozen | z-Olazun | z-and] | h-intensity | v-walk");
  });
  it("keeps an /h/ after a rank noun join as the scale", () => {
    expectLine("zuzozen zolazun zel huhunem vowurel.", "[z-Uzozen | z-Olazun | z-rank/more | h-intensity] | v-walk");
  });
  it("reads a /ɡ/ after a /ɡ/ join as the next item, so adjective lists nest", () => {
    expectLine(
      "zudozol gerulel gamezom gul gelazom gal vowurel.",
      "[z-dog | [[g-red | g-small | g-not] | g-big | g-and]] | v-walk",
    );
  });
  it("leaves an /h/ after a /ɡ/ join on the verb", () => {
    expectLine("zudozol gerulel gamezom gal huhunem vowurel.", "[z-dog | [g-red | g-small | g-and]] | h-intensity | v-walk");
  });
  it("reads al / ul between number endpoints as a range", () => {
    expectLine("zudozol gragel al grazal vowurel.", "[z-dog | g-three] | through | g-five | v-walk");
    expectLine("zrawal ul zrazal.", "z-plus-infinity | through-excluding | z-five");
    expectLine("zragel ar zrazal.", "z-three | some.through | z-five");
  });
  it("keeps al literal when an endpoint has no digits or the kinds differ", () => {
    expectLine("zral al zrazal.", "z-more-than-one | including | z-five");
    expectLine("zragel al zredol.", "z-three | including | z-2nd");
  });
  it("reads stacked in-clause hooks as spans on any line", () => {
    expectLine("zaduhel oel zaduhel.", "z-down | through | z-down");
    expectLine("zragel ual zrazal.", "z-three | strictly-between | z-five");
    expectLine("zragel uel zrazal.", "z-three | outside | z-five");
    expectLine("zuzozen uar zahelan vezuvol.", "z-Uzozen | some.strictly-between | z-Ahelan | v-sleep");
  });
});

describe("morphGlossLine — glosses.md single words", () => {
  it("senses-are-separate-roots table", () => {
    expectLine("zuwol", "z-microphone");
    expectLine("zuwom", "z-performance");
    expectLine("zuwon", "z-speaker");
    expectLine("gogowul", "g-quiet");
    expectLine("gogowum", "g-volume");
    expectLine("hevul", "h-fishing");
    expectLine("thevum", "th-MEMORY");
    expectLine("gaheham", "g-home");
  });

  it("house-cast names and resumes", () => {
    expectLine("zuzozen", "z-Uzozen");
    expectLine("zolazun", "z-Olazun");
    expectLine("zahelan", "z-Ahelan");
    expectLine("zuzozen. zuzozer", "z-Uzozen . z-←Uzozen");
    expectLine("zolazun. zolazur", "z-Olazun . z-←Olazun");
    expectLine("zahelan. zahelar", "z-Ahelan . z-←Ahelan");
  });

  it("mid-word x families", () => {
    expectLine("alexalowen", "wish-x-guidance");
    expectLine("yunoduxozalan", "y-Unodu-x-Ozalan");
    expectLine("zuzedoxugudaxududan", "z-Uzedo-x-Uguda-x-Ududan");
    expectLine("vowurexel", "v-walk-unable-temporary");
    expectLine("thuwathem", "th-competence-ought-offered");
    expectLine("zwazezuyer", "z-episode-agent-speech");
    expectLine("zwazavuvul", "z-episode-agent-fight");
    expectLine("zwazavuvum", "z-episode-agent-struggle");
    expectLine("zwabezuyel", "z-episode-recipient-speech");
    expectLine("xrewul", "x-starting-with");
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
    expectLine("zuzozen ul buyahel vowurel oel bedavel.", "z-Uzozen | [from | b-station] | v-walk | [toward | b-train]");
    expectLine("zuzozen vezuvol welazom al bahehal.", "z-Uzozen | v-sleep | [[w-very | in] | b-house]");
    expectLine("zuwodalx wal ul zazadal.", "z-plate-x | [w-never | except] | z-salad");
    expectLine("zuzozen welazom hewom bludozal vowurel.", "z-Uzozen | [[w-very | h-like] | bl-duck] | v-walk");
    expectLine("hal", "h-never");
    expectLine("har", "h-sometimes");
    expectLine("yol zahelan vowurel har.", "y-question | z-Ahelan | v-walk | h-when");
    expectLine("zuzozen vowurel herulal hal", "z-Uzozen | v-walk | h-rain | h-only-when");
    expectLine("hual", "h-always");
    expectLine("von", "v-choose");
    expectLine("gragel", "g-three");
    expectLine("g+3", "g-three.short");
    expectLine("g+12", "g-twelve");
    expectLine("grabadol", "g-twelve.spelled");
    expectLine("g+3 g+12", "g-three | g-twelve");
    expectLine("gral", "g-more-than-one");
    expectLine("g+", "g-more-than-one.short");
    expectLine("gredol", "g-2nd");
  });

  it("glosses a tag pronoun by its letter name, never the referent (glosses.md § Anaphors)", () => {
    expectLine("zudozol zwal dagozol dwel vawebol. zwer vowurel.", "[z-dog | z-tag.A] | [d-cat | d-tag.E] | v-see . z-←tag.E | v-walk");
    expectLine("zuzozen zwal vowurel. zolazun dwam vawebol.", "[z-Uzozen | z-tag.A] | v-walk . z-Olazun | d-←tag.A.part | v-see");
    expectLine("zuzozen zwal vowurel. zwarx vezuvol.", "[z-Uzozen | z-tag.A] | v-walk . z-←tag.A-x | v-sleep");
    expectLine("zudozol zagozol zam zwal vowurel.", "[[z-dog | z-cat | z-and.open] | z-tag.A] | v-walk");
    expectLine("zwal bwel vezuyel. zwaer vowurel.", "z-tag.A | b-tag.E | v-tell . z-←tag.A+E | v-walk");
  });

  it("scientific and percent number writing", () => {
    expectLine("g+27e12", "g-27e12");
    expectLine("g+25%", "g-25yo");
    expectLine("gragel", "g-three");
  });

  it("worked single-words table", () => {
    expectLine("yewuyal", "y-greeting");
    expectLine("uzozen.", "Uzozen");
    expectLine("yolazuxen", "y-Olazun-minutes");
    expectLine("yael", "y-yes");
    expectLine("yol", "y-question");
    expectLine("zawan", "z-listener");
    expectLine("zayan", "z-interlocutors");
    expectLine("zuwonx", "z-speaker-x");
    expectLine("zawanx", "z-listener-x");
    expectLine("thugom", "th-LIVE");
    expectLine("haram", "h-RESIDUE");
    expectLine("helam", "h-FORMER");
    expectLine("thager", "th-plan-sketch");
    expectLine("gorol", "g-SAME");
  });

  it("fill-ask zar is z-wh", () => {
    expectLine("yol zar vowurel", "y-question | z-wh | v-walk");
  });

  it("stand-in glosses and hostless ABIL", () => {
    expectLine("darl", "d-that-clause");
    expectLine("dorl", "d-whether-clause");
    expectLine("derl", "d-to-clause");
    expectLine("durl", "d-lest-clause");
    expectLine("darm", "d-that-clause.open");
    expectLine("hodaxel", "h-ABIL-unable-temporary");
  });

  it("lexicon senses use packed role English when present", () => {
    expectLine("vuhohol", "v-sit");
    expectLine("vawebol", "v-see");
    expectLine("vezuyel", "v-tell");
    expectLine("velurul", "v-departure");
    expectLine("welazom", "w-very");
    expectLine("gelazom", "g-big");
    expectLine("al bahehal", "[in | b-house]");
    expectLine("ael behowol", "[using | b-hammer]");
    expectLine("hewom", "h-like");
    expectLine("gewom", "g-like");
    expectLine("gobem", "g-part-of");
    expectLine("gadam", "g-contents");
    expectLine("gulem", "g-material");
    expectLine("gaham", "g-origin");
    expectLine("hedam", "h-between");
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
      "yael zuwon zam zawan zal guzemol.",
      "y-yes | [[z-speaker | z-and.open] | z-listener | z-and | g-sleepy]",
    );
  });

  it("ability + value motive", () => {
    expectLine(
      "yuel zuwon vowurexel thuwathom.",
      "y-no | z-speaker | v-walk-unable-temporary | th-competence-motive-any-term",
    );
  });

  it("numbered alternative + unmet pleasure", () => {
    expectLine(
      "xrewul zabevam grebal. zuwonx thodothur.",
      "x-starting-with | [z-problem | g-1st] . z-speaker-x | th-pleasure-unmet-passing",
    );
  });

  it("literal key is not ideation solution", () => {
    expectLine("zogewel wodaxel.", "z-key | w-ABIL-unable-temporary");
  });

  it("inclusive we", () => {
    expectLine(
      "yael xahem zayan thager vowurel vul.",
      "y-yes | x-therefore | z-interlocutors | th-plan-sketch | [v-walk | v-not]",
    );
  });

  it("resume with in-text antecedent", () => {
    expectLine(
      "yalexozalan. xezom zalexozalar thevum zerulal.",
      "y-Ale-x-Ozalan . x-however | z-←Ale-x-Ozalan | th-MEMORY | z-rain",
    );
  });
});

describe("morphGlossLine — act -r and linker endings", () => {
  it("act words with -r are just formed or for now", () => {
    expectLine("yar zuzozen vowurel.", "y-provisional-statement | z-Uzozen | v-walk");
    expectLine("yor zuzozen vowurel.", "y-working-question | z-Uzozen | v-walk");
    expectLine("yer vowurel.", "y-command-for-now | v-walk");
    expectLine("yur vowurel.", "y-hold-off | v-walk");
  });

  it("linkers default to -m; -l is the firm link where taught", () => {
    expectLine("xezom zuzozen vowurel.", "x-however | z-Uzozen | v-walk");
    expectLine("xezol zuzozen vowurel.", "x-nevertheless | z-Uzozen | v-walk");
    expectLine("xahel zuzozen vowurel.", "x-it-follows | z-Uzozen | v-walk");
    expectLine("xegohul zuzozen vowurel.", "x-on-the-contrary | z-Uzozen | v-walk");
  });
});

describe("morphGlossLine — restrictor -r vs -l", () => {
  it("har is sometimes / when, not never", () => {
    expectLine("hal", "h-never");
    expectLine("zolazun vowurel hal.", "z-Olazun | v-walk | h-never");
    expectLine("har", "h-sometimes");
    expectLine("zolazun varuvel har.", "z-Olazun | v-run | h-sometimes");
    expectLine("yol zahelan vowurel har.", "y-question | z-Ahelan | v-walk | h-when");
  });
  it("her is the first-ranked occasion; under a question it asks when is best (restrictors.md)", () => {
    expectLine("zuzozen vowurel her.", "z-Uzozen | v-walk | h-preferred-time");
    expectLine("yol zayan vowurel her.", "y-question | z-interlocutors | v-walk | h-when-best");
    expectLine("yol zayan vowurel herulal hanurul her.", "y-question | z-interlocutors | v-walk | h-rain | h-night | h-when-best");
  });
});

describe("morphGlossLine — tags, xuen, hewol, pointer anchors", () => {
  it("every polar stance keeps its reading (questions.md#polar-stance-fuller-inventory)", () => {
    expectLine("yael", "y-yes");
    expectLine("yaol", "y-sure");
    expectLine("yuel", "y-no");
    expectLine("yuol", "y-refuse-option");
    expectLine("yual", "y-reject-frame");
    expectLine("yoel", "y-decline");
  });
  it("any polar word makes a tag after yol (questions.md#tags)", () => {
    expectLine("yem zayan vowurel. yol yaol.", "y-request | z-interlocutors | v-walk . y-question | y-sure");
    expectLine("yem zawan vowurel. yol yuol.", "y-request | z-listener | v-walk . y-question | y-refuse-option");
    expectLine("zuzozen vowurel. yol yuel.", "z-Uzozen | v-walk . y-question | y-no");
  });
  it("xuen tells a sequence last first (join-across-roles.md#sequence)", () => {
    expectLine("zuzozen vuhohol xuen zuzozer vowurel.", "[z-Uzozen | v-sit | x-and-before-that | z-←Uzozen | v-walk]");
  });
  it("hewol / gewol are exactly like (relations.md#exactly-like)", () => {
    expectLine("zuzozen hewol bludozal vowurel.", "z-Uzozen | [h-exactly-like | bl-duck] | v-walk");
    expectLine("zahehal gewol bluzozen.", "z-house | [g-exactly-like | bl-Uzozen]");
  });
  it("a viewpoint lateral's -r resumes its facing anchor (roles.md#viewpoint-laterals)", () => {
    expectLine("zuzozen vowurel. zolazun vuhohol howuhethuzozer.", "z-Uzozen | v-walk . z-Olazun | v-sit | h-west-th-←Uzozen");
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
    const result = compareMorphGloss("zuwon", "z-microphone", tables);
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
    expectLine("glegel z[udozo] gamezom", '[gl-MENTION | z-CITE["udozo"]] | g-small');
    expectLine("glegel z[zuzozen vezuyol] gamezom", "[gl-MENTION | z-CITE[z-Uzozen | v-sing]] | g-small");
    expectLine("glegel z<kimchi> gamezom", '[gl-MENTION | z-OPAQUE["kimchi"]] | g-small');
    expectLine("glegen d[enuron] vegugum", "[gl-NAME.MENTION | d-CITE[Enuron]] | v-rejection");
    expectLine("zuzozen d@[enuron olazun] vegugum", "z-Uzozen | d-NAME.CITE[Enuron | Olazun] | v-rejection");
  });

  it("glosses -ln and ^@ as the name plus .instance (word-endings.md#name-instance--ln)", () => {
    expectLine("zolazun duzozeln vawebol", "z-Olazun | d-Uzozen.instance | v-see");
    expectLine("zolazun duzozelnx vawebol", "z-Olazun | d-Uzozen.instance-x | v-see");
    expectLine("zolazun d^@<iPhone> vawebol", 'z-Olazun | d-NAME.OPAQUE.instance["iPhone"] | v-see');
  });

  it("the mention marker's spelling is the ordinary adjective anywhere but before a span", () => {
    expectLine("glegel zudozol vowurel", "[gl-letters | z-dog] | v-walk");
  });

  it("ordinary -l on a sake host root uses literal sense, not sake overlay", () => {
    expectLine("zuzozen gawol blolazun", "z-Uzozen | [g-knot | bl-Olazun]");
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
    const md = `> \`yel vowurel.\`
>
> y-command | v-walk
>
> "Walk."

> \`! zuzozen vowurel.\`
>
> ! | z-Uzozen | v-walk
>
> "Uzozen walks!"
`;
    const blocks = extractTeachBlocks(md);
    assert.equal(blocks.length, 2);
    assert.equal(blocks[1]!.agebon, "! zuzozen vowurel.");
    assert.equal(blocks[1]!.morph, "! | z-Uzozen | v-walk");
    assert.equal(blocks[1]!.loose, "Uzozen walks!");
  });

  it("round-trips the yael census example block", () => {
    const md = `> \`yael zuwon zam zawan zal guzemol.\`
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
    expectLine("zewal gawothal", "z-present | g-relatedness-met-lasting");
    expectLine("zabowam wunathur goyem", "z-gathering | [w-autonomy-unmet-passing | g-stimulus]");
    expectLine("zezuyel wuwathuraor goyem", "z-speech | [w-competence-unmet-passing-CIRCUM-SURGING | g-stimulus]");
    expectLine("zebewem guwathamar", "z-draft | g-competence-met-any-term-INTERNAL-SURGING");
    expectLine("zonal wawothumuer goyem", "z-memo | [w-relatedness-unmet-modifiable-RESISTING-SURGING | g-stimulus]");
    expectLine("gawothaluom", "g-relatedness-met-lasting-UNPLACED-FLOWING");
  });

  it("span interiors: cite and aside gloss English; an opaque interior passes through", () => {
    expectLine("zuzozen vowurel th(hogowul)", "z-Uzozen | v-walk | th-ASIDE[h-quiet]");
    expectLine("yul zolazun v[vozohul]", "y-prohibition | z-Olazun | v-CITE[v-stop]");
    expectLine(
      "zuzozen vowurel th(zolazun vezuvol)",
      "z-Uzozen | v-walk | th-ASIDE[z-Olazun | v-sleep]",
    );
    expectLine("x@<Sam> zalon vowurel", 'x-NAME.OPAQUE["Sam"] | z-TOPIC | v-walk');
    expectLine("glegel x[udozo] zalon gamezom", '[gl-MENTION | x-CITE["udozo"]] | z-TOPIC | g-small');
  });

  it("viewpoint laterals keep compass on DIR", () => {
    expectLine("yel vowurel howuhethuzozen", "y-command | v-walk | h-west-th-Uzozen");
  });

  it("a holder seam glosses its host overlay and the holder", () => {
    expectLine("zolazun theyemuzozen velurul", "z-Olazun | th-CLUES-Uzozen | v-departure");
    expectLine("zolazun thebaruzozen velurul", "z-Olazun | th-REPORTED.weak-Uzozen | v-departure");
    expectLine("zolazun thomaluzozen velurul", "z-Olazun | th-MAY-find-out-Uzozen | v-departure");
    expectLine("zolazun theyumuzozen velurul", "z-Olazun | th-NOTIONAL-Uzozen | v-departure");
  });

  it("a holder takes resume -r and associative -x like any noun", () => {
    expectLine(
      "zuzozen velurul. zolazun theyemuzozer vuhohol.",
      "z-Uzozen | v-departure . z-Olazun | th-CLUES-←Uzozen | v-sit",
    );
    expectLine("zolazun theyemuzozenx velurul", "z-Olazun | th-CLUES-Uzozen-x | v-departure");
  });

  it("a hook + /b/ after a landmark describes that landmark; after a recipient it is same-role", () => {
    expectLine("zawan al behaham om buwon vavol", "z-listener | [in | [b-locality | [near | b-speaker]]] | v-hatch");
    expectLine("zuzozen vanurel hevam blavulul om buwon", "z-Uzozen | v-dance | [h-around | [bl-fire | [near | b-speaker]]]");
    expectLine("zuzozen bolazun al bahelan vezuyel", "z-Uzozen | b-Olazun | including | b-Ahelan | v-tell");
  });

  it("stacked extra-noun -r points back (hooks.md § Point back)", () => {
    expectLine("zuzozen vuhohol aor", "z-Uzozen | v-sit | on.it");
    expectLine("zolazun varayel aer", "z-Olazun | v-write | with.it");
    expectLine("zuzozen vowurel uor", "z-Uzozen | v-walk | through.there");
  });

  it("em + /b/ goes inside the bracket of the noun on its left", () => {
    expectLine("zudozol gelazom em buwon", "[z-dog | g-big | [used-by | b-speaker]]");
    expectLine("zudozol em buwon gelazom", "[z-dog | [used-by | [b-speaker | g-big]]]");
    expectLine("zudozol gelazom al behaham em buwon", "[z-dog | g-big] | [in | [b-locality | [used-by | b-speaker]]]");
    expectLine("zuzozen bolazun em buwon vezuyel", "z-Uzozen | b-Olazun | rather.open | b-speaker | v-tell");
  });

  it("label scope glosses its seam vowel", () => {
    expectLine("zolazun gunemuthal", "z-Olazun | g-angry-th-episode");
    expectLine("zuzozen valamuthel", "z-Uzozen | v-lie-th-role");
    expectLine("zolazun ganumuthul", "z-Olazun | g-anxious-th-type");
    expectLine("zolazun gwezuduyel", "z-Olazun | g-role-agent-teach");
    expectLine("zuzozen valamuthol blolazun", "z-Uzozen | [v-lie-th-pair | bl-Olazun]");
    expectLine("zuzozen valamuthaol blolazun", "z-Uzozen | [v-lie-th-on-pair | bl-Olazun]");
    expectLine("zuzozen valamuthual", "z-Uzozen | v-lie-th-except-episode");
    expectLine("zolazun gwaezuduyel", "z-Olazun | g-using-agent-teach");
    expectLine("zolazun gwoezuduyel", "z-Olazun | g-toward-role-agent-teach");
    expectLine("zolazun gwuezuduyel", "z-Olazun | g-outside-role-agent-teach");
    expectLine("zuzozen gunemuthuol blolazun", "z-Uzozen | [g-angry-th-except-pair | bl-Olazun]");
  });

  it("a pair-scope verb hosts the /b/ right after it", () => {
    expectLine("zuzozen valamuthol blolazun", "z-Uzozen | [v-lie-th-pair | bl-Olazun]");
  });

  it("house-cast resume without a same-line antecedent", () => {
    expectLine("zuzozerx vuhohol", "z-←Uzozen-x | v-sit");
  });

  it("role pointers gloss their role and event, not the referent", () => {
    expectLine("zuzozen vowurel. zwazar vuhohol", "z-Uzozen | v-walk . z-←episode-agent.same | v-sit");
    expectLine("zuzozen vawebol dwazer", "z-Uzozen | v-see | d-←episode-agent.self");
    expectLine("zuzozen zolazun zal vowurel. zwazarx vuhohol", "[z-Uzozen | z-Olazun | z-and] | v-walk . z-←episode-agent.same-x | v-sit");
    expectLine("zuzozen vowurel. dwahar vawebol", "z-Uzozen | v-walk . d-←episode-manner.same | v-see");
    expectLine("zuzozen vowurel. dwavar vawebol", "z-Uzozen | v-walk . d-←episode-event.same | v-see");
    expectLine("dwahowurel", "d-episode-manner-walk");
  });

  it("numeric prefix glosses the number, the seam, then the stem", () => {
    expectLine("zahelan gruwuxahuyayol", "z-Ahelan | g-quasi-x-friend");
    expectLine("zrawaxolamal", "z-infinity-x-love");
    expectLine("zuzozen dragemxezuyel vawebol", "z-Uzozen | d-three.about-x-speech | v-see");
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
    expectLine("thomam zuzozen vuhohol.", "th-MAY | z-Uzozen | v-sit");
    expectLine("zuzozen wuzemol thugom vawebol awebolul.", "z-Uzozen | [w-sleepy | th-LIVE] | v-see | eye-leave");
    expectLine("thahum blarl zuzozen vuhohol.", "[th-because | bl-that-clause] | z-Uzozen | v-sit");
    expectLine("theyem blarl zuzozen vuhohol.", "[th-CLUES | bl-that-clause] | z-Uzozen | v-sit");
    expectLine("thanal blarl zuzozen vuhohol.", "[th-DEDUCED.strong | bl-that-clause] | z-Uzozen | v-sit");
    expectLine("thubel blral blarl zuzozen vuhohol.", "[th-PATTERN.strong | [bl-later | bl-that-clause]] | z-Uzozen | v-sit");
    expectLine("zuzozen vuhohol th(zolazun vowurel).", "z-Uzozen | v-sit | th-ASIDE[z-Olazun | v-walk]");
  });

  it("keeps time poles and restrictors on /h/", () => {
    assert.match(morphGlossLine("habam blarl zuzozen vuhohol.", tables), /^\[h-before/);
  });
});

describe("morphGlossLine — stance joins and emphatic prohibition", () => {
  it("glosses /th/ join fences", () => {
    expectLine("zuzozen vowurel thevum thul.", "z-Uzozen | v-walk | th-MEMORY | th-not");
    expectLine("zuzozen vowurel thahum blolazun thul.", "z-Uzozen | v-walk | [th-because | bl-Olazun] | th-not");
  });

  it("glosses yul yul", () => {
    expectLine("yul yul vazuyul.", "y-prohibition | y-prohibition | v-sneak");
  });
});

describe("morphGlossLine — tone marks", () => {
  it("copies attached and free-standing marks", () => {
    expectLine("zuzozen vawebol ?dudozol.", "z-Uzozen | v-see | ?d-dog");
    expectLine("! zuzozen vowurel.", "! | z-Uzozen | v-walk");
    expectLine("zuzozen vawebol &dudozol.", "z-Uzozen | v-see | &d-dog");
    expectLine("zuzozen ; vowurel.", "z-Uzozen | ; | v-walk");
    expectLine("%zuzozen vowurel.", "%z-Uzozen | v-walk");
  });
});

describe("morphGlossLine — standalone joins", () => {
  it("standalone reads none / everything; items keep list readings", () => {
    expectLine("zal vowurel.", "z-none | v-walk");
    expectLine("zam vowurel.", "z-none.open | v-walk");
    expectLine("zual vowurel.", "z-everything | v-walk");
    expectLine("zuzozen vowurel ol bual.", "z-Uzozen | v-walk | [at | b-everything]");
    expectLine("zuzozen vawebol dal.", "z-Uzozen | v-see | d-none");
    expectLine("zuzozen zual vowurel.", "[z-Uzozen | z-everything-but] | v-walk");
    expectLine("zuzozen zolazun zal vowurel.", "[z-Uzozen | z-Olazun | z-and] | v-walk");
  });
});

describe("morphGlossLine — kind reference", () => {
  it("zuan + shared kind reads the kind itself", () => {
    expectLine("zuan gagozol guzemol.", "[z-the-kind | g-cat] | g-sleepy");
    expectLine("zuzozen duan gagozol vawebol.", "z-Uzozen | [d-the-kind | g-cat] | v-see");
  });
});

describe("morphGlossLine — word position, not spelling", () => {
  it("does not read an in-clause hook as discourse because an earlier sentence opened with the same spelling", () => {
    const line = morphGlossLine("al zuzozen vowurel. zuzozen al zolazun zal vowurel.", tables);
    const second = line.split(" . ")[1] ?? "";
    assert.ok(!second.includes("additionally"), line);
  });
});

describe("morphGlossLine — topic and generic pronouns", () => {
  it("glosses the topic pronoun and its topic word", () => {
    expectLine(
      "xuzozen zalon dolazun vawebol. zolazur dalon vezuyel.",
      "x-Uzozen | z-TOPIC | d-Olazun | v-see . z-←Olazun | d-TOPIC | v-tell",
    );
    expectLine("xuzozenx zalonx vuhohol.", "x-Uzozen-x | z-TOPIC-x | v-sit");
    expectLine("xuzozer zalon vuhohol.", "x-←Uzozen | z-TOPIC | v-sit");
  });
  it("glosses the generic pronoun, and either one as a holder", () => {
    expectLine("zeyon vezuvol.", "z-ONE | v-sleep");
    expectLine("xuzozen theyemalon zolazun velurul.", "x-Uzozen | th-CLUES-TOPIC | z-Olazun | v-departure");
    expectLine("theyemeyon zolazun velurul.", "th-CLUES-ONE | z-Olazun | v-departure");
  });
  it("keeps the star and person roots ordinary on other endings", () => {
    expectLine("zalol vowurel.", "z-star | v-walk");
    expectLine("zeyol vowurel.", "z-person | v-walk");
  });
  it("glosses a topic word with its own hooks, and the clearing linkers", () => {
    expectLine("xudozol em buzozen zolazun vawebol.", "x-dog | [used-by | b-Uzozen] | z-Olazun | v-see");
    expectLine("xuvewem zuzozen vowurel.", "x-next | z-Uzozen | v-walk");
    expectLine("hahugem bluzozen zolazun vowurel.", "[h-as-for | bl-Uzozen] | z-Olazun | v-walk");
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
    expectLine("zuzozen vowurel hedurem varuvel val.", "z-Uzozen | [v-walk | [h-haste | v-run] | v-and]");
    expectLine("zuzozen vugudel duredal vuhohol val.", "z-Uzozen | [v-cooking | [d-popcorn | v-sit] | v-and]");
  });

  it("puts the words between the subject and the first verb in the first item, and leaves a joinless verb chain flat", () => {
    expectLine("zuzozen hedurem vugudel varuvel val.", "z-Uzozen | [[h-haste | v-cooking] | v-run | v-and]");
    expectLine(
      "zuzozen duredal vugudel hevam blavulul vuhohol val.",
      "z-Uzozen | [[d-popcorn | v-cooking] | [[h-around | bl-fire] | v-sit] | v-and]",
    );
    expectLine("zuzozen bahelan vezuyel buzozen varal val.", "z-Uzozen | [[b-Ahelan | v-tell] | [b-Uzozen | v-pay] | v-and]");
    expectLine("zuzozen vowurel hedurem varuvel.", "z-Uzozen | v-walk | h-haste | v-run");
  });

  it("shares words before the subject, and /d/ /b/ /h/ after the join", () => {
    expectLine("duredal zuzozen vugudel vagedal val.", "d-popcorn | z-Uzozen | [v-cooking | v-eat | v-and]");
    expectLine("hedurem zuzozen vugudel varuvel val.", "h-haste | z-Uzozen | [v-cooking | v-run | v-and]");
    expectLine("h_15,30 zuzozen vowurel varuvel val.", "h-_15,30 | z-Uzozen | [v-walk | v-run | v-and]");
    expectLine("zuzozen vugudel vagedal val duredal.", "z-Uzozen | [v-cooking | v-eat | v-and | d-popcorn]");
    expectLine("zuzozen vugudel varuvel val hedurem.", "z-Uzozen | [v-cooking | v-run | v-and | h-haste]");
    expectLine("zuzozen vugudel vagedal val bahelan huhunem.", "z-Uzozen | [v-cooking | v-eat | v-and | b-Ahelan | h-intensity]");
    expectLine("duredal vugudel vagedal val zuzozen.", "d-popcorn | [v-cooking | v-eat | v-and] | z-Uzozen");
  });

  it("keeps a /th/ word at the edge of the first item outside it, and one inside it in its bracket", () => {
    expectLine("zuzozen thevemom vowurel varuvel val.", "z-Uzozen | th-doubt | [v-walk | v-run | v-and]");
    expectLine("zuzozen duredal thevemom vugudel vagedal val.", "z-Uzozen | [[d-popcorn | th-doubt | v-cooking] | v-eat | v-and]");
  });

  it("leaves a one-verb denial as it is", () => {
    expectLine("zuzozen duredal vawebol vul.", "z-Uzozen | d-popcorn | [v-see | v-not]");
  });

  it("takes an extra-noun hook into the item of the verb after it", () => {
    expectLine("zuzozen vowurel ul b_9 varuvel val.", "z-Uzozen | [v-walk | [[from | b-_9] | v-run] | v-and]");
    expectLine("zuzozen vowurel ul barl zolazun vezuvol.", "z-Uzozen | v-walk | [from | b-that-clause] | z-Olazun | v-sleep");
  });
});

describe("morphGlossLine — from … to", () => {
  it("reads ul X oel Y as one unit, wherever it sits", () => {
    expectLine("zuzozen ul b_9 oel b_17 vowurel.", "z-Uzozen | [from | b-_9 | toward | b-_17] | v-walk");
    expectLine("zuzozen vowurel varuvel val ul b_9 oel b_17.", "z-Uzozen | [v-walk | v-run | v-and] | [from | b-_9 | toward | b-_17]");
    expectLine("zuzozen vowurel ul b_9 oel b_17 varuvel val.", "z-Uzozen | [v-walk | [[from | b-_9 | toward | b-_17] | v-run] | v-and]");
  });

  it("keeps the straddling form as two extra nouns", () => {
    expectLine("zuzozen ul b_9 vowurel oel b_17.", "z-Uzozen | [from | b-_9] | v-walk | [toward | b-_17]");
  });
});
