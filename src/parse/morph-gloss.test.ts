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

function expectLine(ageben: string, morph: string): void {
  assert.equal(morphGlossLine(ageben, tables), normalizeMorphLine(morph), ageben);
}

describe("morphGlossLine — join blanks", () => {
  it("glosses a hosted blank and -x after a join -r as a group", () => {
    expectLine("yel hewem blar zazozon vowurol.", "y-question | [h-like | bl-wh] | z-Azozon | v-walk");
    expectLine("zarx vowurol.", "z-something-x | v-walk");
  });
});

describe("morphGlossLine — hooked joins (hooked-joins.md#hooked-joins)", () => {
  it("glosses the hook, -x-, the join, and brackets the landmark with it", () => {
    expectLine("zexual blohehal vezuvel.", "[z-at-x-everything | bl-house] | v-sleep");
    expectLine("zemxuam bluwen vezuvel.", "[z-near-x-everything.open | bl-speaker] | v-sleep");
    expectLine("yel doxar bluwen.", "y-question | [d-for-x-wh | bl-speaker]");
    expectLine("zexual blual vezuvel.", "[z-at-x-everything | bl-everything] | v-sleep");
    expectLine("zexual blohehal gogozel vezuvel.", "[z-at-x-everything | bl-house | g-cat] | v-sleep");
  });
  it("glosses a point-back hook, and on /h/ a time", () => {
    expectLine("zazozon vehohel el bohehal. zerxual vezuvel.", "z-Azozon | v-sit | [at | b-house] . z-there-x-everything | v-sleep");
    expectLine("zazozon vowurol halam blanulul. zawan vebal hurxal.", "z-Azozon | v-walk | [h-after | bl-thunderstorm] . z-listener | v-hear | h-since.then-x-never");
    expectLine("zawan vebal huxam blanulul.", "z-listener | v-hear | [h-from-x-never.open | bl-thunderstorm]");
  });
});

describe("morphGlossLine — clause joins go between clauses", () => {
  it("groups a switched join over the list before it", () => {
    expectLine(
      "zazozon vowurol xel zalazun veruvol xal zahelan vezuvel.",
      "[[z-Azozon | v-walk | x-or-exactly-one | z-Alazun | v-run] | x-and | z-Ahelan | v-sleep]",
    );
  });
  it("reads a sentence-initial join as linking the whole next sentence", () => {
    expectLine(
      "zazozon vowurol. xan zalazun veruvol xel zahelan vezuvel.",
      "z-Azozon | v-walk . x-and-then | [z-Alazun | v-run | x-or-exactly-one | z-Ahelan | v-sleep]",
    );
  });
  it("takes a standalone join as a stand-in clause item", () => {
    expectLine("zazozon vowurol xel xal.", "[z-Azozon | v-walk | x-or-exactly-one | x-none]");
    expectLine("xual ul zazozon vowurol.", "x-everything | except | z-Azozon | v-walk");
  });
  it("glosses a resume of a resume as the original referent", () => {
    expectLine(
      "zazozon thagol vowurol xen zazozor vozuyel xen zazozor vezuvel.",
      "[z-Azozon | th-plan-atlas | v-walk | x-or-else | z-←Azozon | v-sing | x-or-else | z-←Azozon | v-sleep]",
    );
  });
  it("glosses the sequence fallback after an attempt", () => {
    expectLine(
      "zazozon howar vowurol xen zazozor vozuyel.",
      "[z-Azozon | h-ATTEMPT-trial | v-walk | x-or-else | z-←Azozon | v-sing]",
    );
  });
});

describe("morphGlossLine — SHARED only where it can describe the join", () => {
  it("leaves an /h/ after a set noun join on the verb", () => {
    expectLine("zazozon zalazun zal hahunom vowurol.", "[z-Azozon | z-Alazun | z-and] | h-intensity | v-walk");
  });
  it("keeps an /h/ after a rank noun join as the scale", () => {
    expectLine("zazozon zalazun zol hahunom vowurol.", "[z-Azozon | z-Alazun | z-rank/more | h-intensity] | v-walk");
  });
  it("reads a /ɡ/ after a /ɡ/ join as the next item, so adjective lists nest", () => {
    expectLine(
      "zodozel gerulol gamezem gul gelazem gal vowurol.",
      "[z-dog | [[g-red | g-small | g-not] | g-big | g-and]] | v-walk",
    );
  });
  it("leaves an /h/ after a /ɡ/ join on the verb", () => {
    expectLine("zodozel gerulol gamezem gal hahunom vowurol.", "[z-dog | [g-red | g-small | g-and]] | h-intensity | v-walk");
  });
  it("reads al / ul between number endpoints as a range", () => {
    expectLine("zodozel gragel al grazal vowurol.", "[z-dog | g-three] | through | g-five | v-walk");
    expectLine("zrawal ul zrazal.", "z-plus-infinity | through-excluding | z-five");
    expectLine("zragel ar zrazal.", "z-three | some.through | z-five");
  });
  it("keeps al literal when an endpoint has no digits or the kinds differ", () => {
    expectLine("zral al zrazal.", "z-more-than-one | including | z-five");
    expectLine("zragel al zrodol.", "z-three | including | z-2nd");
  });
  it("reads stacked in-clause hooks as spans on any line", () => {
    expectLine("zoduhol oel zoduhol.", "z-down | through | z-down");
    expectLine("zragel ual zrazal.", "z-three | strictly-between | z-five");
    expectLine("zragel uol zrazal.", "z-three | outside | z-five");
    expectLine("zazozon uar zahelan vezuvel.", "z-Azozon | some.strictly-between | z-Ahelan | v-sleep");
  });
});

describe("morphGlossLine — glosses.md single words", () => {
  it("senses-are-separate-roots table", () => {
    expectLine("zuwel", "z-microphone");
    expectLine("zuwem", "z-performance");
    expectLine("zuwen", "z-speaker");
    expectLine("gugowul", "g-quiet");
    expectLine("gugowum", "g-volume");
    expectLine("hevul", "h-fishing");
    expectLine("thevum", "th-MEMORY");
    expectLine("goheham", "g-home");
  });

  it("house-cast names and resumes", () => {
    expectLine("zazozon", "z-Azozon");
    expectLine("zalazun", "z-Alazun");
    expectLine("zahelan", "z-Ahelan");
    expectLine("zazozon. zazozor", "z-Azozon . z-←Azozon");
    expectLine("zalazun. zalazur", "z-Alazun . z-←Alazun");
    expectLine("zahelan. zahelar", "z-Ahelan . z-←Ahelan");
  });

  it("mid-word x families", () => {
    expectLine("aloxolowon", "wish-x-guidance");
    expectLine("yaboduxezalan", "y-Abodu-x-Ezalan");
    expectLine("zuzedexogudaxedudan", "z-Uzede-x-Oguda-x-Edudan");
    expectLine("vowuroxol", "v-walk-unable-temporary");
    expectLine("thuwathem", "th-competence-ought-offered");
    expectLine("zwuzezuyor", "z-episode-agent-speech");
    expectLine("zwuzuvuvul", "z-episode-agent-fight");
    expectLine("zwuzuvuvum", "z-episode-agent-struggle");
    expectLine("zwubezuyol", "z-episode-recipient-speech");
    expectLine("xrowul", "x-starting-with");
  });

  it("joins, revisers, numbers", () => {
    expectLine("zam", "z-and.open");
    expectLine("zal", "z-and");
    expectLine("vam", "v-and.open");
    expectLine("del", "d-or-exactly-one");
    expectLine("zel", "z-or-exactly-one");
    expectLine("zol", "z-rank/more");
    expectLine("zoel", "z-equal-rank");
    expectLine("zogozelx g=+ vehohel.", "[z-cat-x | g-some-amount] | v-sit");
    expectLine("yel zogozelx g=+ vehohel.", "y-question | [z-cat-x | g-how-many] | v-sit");
    expectLine("yel zazozon vehohel el b=#.", "y-question | z-Azozon | v-sit | [at | b-which-place]");
    expectLine("zoem", "z-equal-rank.open");
    expectLine("zar", "z-something");
    expectLine("zul", "z-not");
    expectLine("gul", "g-not");
    expectLine("zual", "z-everything-but");
    expectLine("xan", "x-and-then");
    expectLine("el", "instead");
    expectLine("am", "additionally.open");
    expectLine("al", "additionally");
    expectLine("ol", "in.other.words");
    expectLine("aol", "in.fact");
    expectLine("ul", "except");
    expectLine("zazozon vezuvel al bohehal.", "z-Azozon | v-sleep | [in | b-house]");
    expectLine("zodozelx al zogozel.", "z-dog-x | including | z-cat");
    expectLine("zazozon ul bawahol vowurol oel bedavol.", "z-Azozon | [from | b-station] | v-walk | [toward | b-train]");
    expectLine("zazozon vezuvel welazem al bohehal.", "z-Azozon | v-sleep | [[w-very | in] | b-house]");
    expectLine("zuyodalx wal ul zazudal.", "z-plate-x | [w-never | except] | z-salad");
    expectLine("zazozon welazem hewem bladozal vowurol.", "z-Azozon | [[w-very | h-like] | bl-duck] | v-walk");
    expectLine("hal", "h-never");
    expectLine("har", "h-sometimes");
    expectLine("yel zahelan vowurol har.", "y-question | z-Ahelan | v-walk | h-when");
    expectLine("zazozon vowurol herulal hal", "z-Azozon | v-walk | h-rain | h-only-when");
    expectLine("hual", "h-always");
    expectLine("ven", "v-choose");
    expectLine("gragel", "g-three");
    expectLine("g+3", "g-three.short");
    expectLine("g+12", "g-twelve");
    expectLine("grabadol", "g-twelve.spelled");
    expectLine("g+3 g+12", "g-three | g-twelve");
    expectLine("gral", "g-more-than-one");
    expectLine("g+", "g-more-than-one.short");
    expectLine("grodol", "g-2nd");
  });

  it("glosses a tag pronoun by its letter name, never the referent (glosses.md § Anaphors)", () => {
    expectLine("zodozel zwal dogozel dwol vayebel. zwor vowurol.", "[z-dog | z-tag.A] | [d-cat | d-tag.O] | v-see . z-←tag.O | v-walk");
    expectLine("zazozon zwal vowurol. zalazun dwam vayebel.", "[z-Azozon | z-tag.A] | v-walk . z-Alazun | d-←tag.A.part | v-see");
    expectLine("zazozon zwal vowurol. zwarx vezuvel.", "[z-Azozon | z-tag.A] | v-walk . z-←tag.A-x | v-sleep");
    expectLine("zodozel zogozel zam zwal vowurol.", "[[z-dog | z-cat | z-and.open] | z-tag.A] | v-walk");
    expectLine("zwal bwol vezuyol. zwaor vowurol.", "z-tag.A | b-tag.O | v-tell . z-←tag.A+O | v-walk");
  });

  it("scientific and percent number writing", () => {
    expectLine("g+27e12", "g-27e12");
    expectLine("g+25%", "g-25yo");
    expectLine("gragel", "g-three");
  });

  it("worked single-words table", () => {
    expectLine("yowuyal", "y-greeting");
    expectLine("azozon.", "Azozon");
    expectLine("yalazuxon", "y-Alazun-minutes");
    expectLine("yaol", "y-yes");
    expectLine("yel", "y-question");
    expectLine("zawan", "z-listener");
    expectLine("zayan", "z-interlocutors");
    expectLine("zuwenx", "z-speaker-x");
    expectLine("zawanx", "z-listener-x");
    expectLine("thugem", "th-LIVE");
    expectLine("haram", "h-RESIDUE");
    expectLine("helam", "h-FORMER");
    expectLine("thagor", "th-plan-sketch");
    expectLine("gorel", "g-SAME");
  });

  it("fill-ask zar is z-wh", () => {
    expectLine("yel zar vowurol", "y-question | z-wh | v-walk");
  });

  it("stand-in glosses and hostless ABIL", () => {
    expectLine("darl", "d-that-clause");
    expectLine("derl", "d-whether-clause");
    expectLine("dorl", "d-to-clause");
    expectLine("durl", "d-lest-clause");
    expectLine("darm", "d-that-clause.open");
    expectLine("hodaxol", "h-ABIL-unable-temporary");
  });

  it("lexicon senses use packed role English when present", () => {
    expectLine("vehohel", "v-sit");
    expectLine("vayebel", "v-see");
    expectLine("vezuyol", "v-tell");
    expectLine("vudurul", "v-departure");
    expectLine("welazem", "w-very");
    expectLine("gelazem", "g-big");
    expectLine("al bohehal", "[in | b-house]");
    expectLine("aol bohowel", "[using | b-hammer]");
    expectLine("hewem", "h-like");
    expectLine("gewem", "g-like");
    expectLine("gobom", "g-part-of");
    expectLine("gadam", "g-contents");
    expectLine("gulom", "g-material");
    expectLine("gaham", "g-origin");
    expectLine("hedam", "h-between");
    expectLine("zayebel", "z-eye");
    expectLine("hehugol", "h-hash");
    expectLine("yam", "y-soft-statement");
    expectLine("yom", "y-request");
    expectLine("yum", "y-soft-prohibition");
    expectLine("yal", "y-statement");
    expectLine("yol", "y-command");
  });
});

describe("morphGlossLine — glosses.md dialogue turns", () => {
  it("inclusive census turn", () => {
    expectLine(
      "yaol zuwen zam zawan zal guzemel.",
      "y-yes | [[z-speaker | z-and.open] | z-listener | z-and | g-sleepy]",
    );
  });

  it("ability + value motive", () => {
    expectLine(
      "yuol zuwen vowuroxol thuwathom.",
      "y-no | z-speaker | v-walk-unable-temporary | th-competence-motive-any-term",
    );
  });

  it("numbered alternative + unmet pleasure", () => {
    expectLine(
      "xrowul zobevam grobal. zuwenx thodethur.",
      "x-starting-with | [z-problem | g-1st] . z-speaker-x | th-pleasure-unmet-passing",
    );
  });

  it("literal key is not ideation solution", () => {
    expectLine("zegewol wodaxol.", "z-key | w-ABIL-unable-temporary");
  });

  it("inclusive we", () => {
    expectLine(
      "yaol xahom zayan thagor vowurol vul.",
      "y-yes | x-therefore | z-interlocutors | th-plan-sketch | [v-walk | v-not]",
    );
  });

  it("resume with in-text antecedent", () => {
    expectLine(
      "yaloxezalan. xezem zaloxezalar thevum zerulal.",
      "y-Alo-x-Ezalan . x-however | z-←Alo-x-Ezalan | th-MEMORY | z-rain",
    );
  });
});

describe("morphGlossLine — act -r and linker endings", () => {
  it("act words with -r are just formed or for now", () => {
    expectLine("yar zazozon vowurol.", "y-provisional-statement | z-Azozon | v-walk");
    expectLine("yer zazozon vowurol.", "y-working-question | z-Azozon | v-walk");
    expectLine("yor vowurol.", "y-command-for-now | v-walk");
    expectLine("yur vowurol.", "y-hold-off | v-walk");
  });

  it("linkers default to -m; -l is the firm link where taught", () => {
    expectLine("xezem zazozon vowurol.", "x-however | z-Azozon | v-walk");
    expectLine("xezel zazozon vowurol.", "x-nevertheless | z-Azozon | v-walk");
    expectLine("xahol zazozon vowurol.", "x-it-follows | z-Azozon | v-walk");
    expectLine("xugohul zazozon vowurol.", "x-on-the-contrary | z-Azozon | v-walk");
  });
});

describe("morphGlossLine — restrictor -r vs -l", () => {
  it("har is sometimes / when, not never", () => {
    expectLine("hal", "h-never");
    expectLine("zalazun vowurol hal.", "z-Alazun | v-walk | h-never");
    expectLine("har", "h-sometimes");
    expectLine("zalazun veruvol har.", "z-Alazun | v-run | h-sometimes");
    expectLine("yel zahelan vowurol har.", "y-question | z-Ahelan | v-walk | h-when");
  });
  it("hor is the first-ranked occasion; under a question it asks when is best (restrictors.md)", () => {
    expectLine("zazozon vowurol hor.", "z-Azozon | v-walk | h-preferred-time");
    expectLine("yel zayan vowurol hor.", "y-question | z-interlocutors | v-walk | h-when-best");
    expectLine("yel zayan vowurol herulal hanurul hor.", "y-question | z-interlocutors | v-walk | h-rain | h-night | h-when-best");
  });
});

describe("morphGlossLine — tags, xuen, hewel, pointer anchors", () => {
  it("every polar stance keeps its reading (polar-inventory.md#polar-stance-fuller-inventory)", () => {
    expectLine("yaol", "y-yes");
    expectLine("yael", "y-sure");
    expectLine("yuol", "y-no");
    expectLine("yuel", "y-refuse-option");
    expectLine("yual", "y-reject-frame");
    expectLine("yoel", "y-decline");
  });
  it("any polar word makes a tag after yol (polar-inventory.md#tags)", () => {
    expectLine("yom zayan vowurol. yel yael.", "y-request | z-interlocutors | v-walk . y-question | y-sure");
    expectLine("yom zawan vowurol. yel yuel.", "y-request | z-listener | v-walk . y-question | y-refuse-option");
    expectLine("zazozon vowurol. yel yuol.", "z-Azozon | v-walk . y-question | y-no");
  });
  it("xuen tells a sequence last first (clause-sequence.md#sequence)", () => {
    expectLine("zazozon vehohel xuon zazozor vowurol.", "[z-Azozon | v-sit | x-and-before-that | z-←Azozon | v-walk]");
  });
  it("hewel / gewel are exactly like (of-relations.md#exactly-like)", () => {
    expectLine("zazozon hewel bladozal vowurol.", "z-Azozon | [h-exactly-like | bl-duck] | v-walk");
    expectLine("zohehal gewel blazozon.", "z-house | [g-exactly-like | bl-Azozon]");
  });
  it("a viewpoint lateral's -r resumes its facing anchor (viewpoint.md#viewpoint-laterals)", () => {
    expectLine("zazozon vowurol. zalazun vehohel hewuhothazozor.", "z-Azozon | v-walk . z-Alazun | v-sit | h-west-th-←Azozon");
  });
});

describe("compareMorphGloss", () => {
  it("passes an equal pair", () => {
    const result = compareMorphGloss("zazozon godozel.", "z-Azozon | g-dog", tables);
    assert.equal(result.ok, true);
    assert.equal(result.expected, "z-Azozon | g-dog");
    assert.equal(result.actual, "z-Azozon | g-dog");
  });

  it("fails a sense mismatch with expected/actual", () => {
    const result = compareMorphGloss("zuwen", "z-microphone", tables);
    assert.equal(result.ok, false);
    assert.equal(result.expected, "z-microphone");
    assert.equal(result.actual, "z-speaker");
    assert.equal(result.parseError, undefined);
  });

  it("fails unparseable Ageben as parse, not gloss mismatch", () => {
    const result = compareMorphGloss("z!!!", "z-nope", tables);
    assert.equal(result.ok, false);
    assert.ok(result.parseError);
  });

  it("emits scope island edges in morph gloss", () => {
    expectLine(
      "zazozon { hogugem zodozel gerulol } vayebel",
      "z-Azozon | SCOPE[h-possibility | [z-dog | g-red]] | v-see",
    );
  });

  it("a mention is a marker word plus the span: a one-word cite or an opaque interior stays as written", () => {
    expectLine("glegol z[odoze] gamezem", '[gl-MENTION | z-CITE["odoze"]] | g-small');
    expectLine("glegol z[zazozon vozuyel] gamezem", "[gl-MENTION | z-CITE[z-Azozon | v-sing]] | g-small");
    expectLine("glegol z<kimchi> gamezem", '[gl-MENTION | z-OPAQUE["kimchi"]] | g-small');
    expectLine("glegon d[onuren] vuyugum", "[gl-NAME.MENTION | d-CITE[Onuren]] | v-rejection");
    expectLine("zazozon d@[onuren alazun] vuyugum", "z-Azozon | d-NAME.CITE[Onuren | Alazun] | v-rejection");
  });

  it("glosses -ln and ^@ as the name plus .instance (proper-names.md#name-instance--ln)", () => {
    expectLine("zalazun dazozoln vayebel", "z-Alazun | d-Azozon.instance | v-see");
    expectLine("zalazun dazozolnx vayebel", "z-Alazun | d-Azozon.instance-x | v-see");
    expectLine("zalazun d^@<iPhone> vayebel", 'z-Alazun | d-NAME.OPAQUE.instance["iPhone"] | v-see');
  });

  it("the mention marker's spelling is the ordinary adjective anywhere but before a span", () => {
    expectLine("glegol zodozel vowurol", "[gl-letters | z-dog] | v-walk");
  });

  it("ordinary -l on a sake host root uses literal sense, not sake overlay", () => {
    expectLine("zazozon gawel blalazun", "z-Azozon | [g-knot | bl-Alazun]");
  });

  it("morphRedundantWithLoose allows single-word citation skips", () => {
    assert.equal(morphRedundantWithLoose("azozol", "swan", tables), true);
    assert.equal(morphRedundantWithLoose("azozon.", '"Azozon."', tables), true);
    assert.equal(morphRedundantWithLoose("zazozon vehohel.", "Azozon sits.", tables), false);
    assert.equal(morphRedundantWithLoose("z!!!", "nope", tables), false);
  });

  it("extractTeachBlocks finds morph after a name line and loose quotes", () => {
    const md = `> \`azozon.\`
>
> Azozon
>
> "Azozon." (hello — the speaker is Azozon)
`;
    const [block] = extractTeachBlocks(md);
    assert.ok(block);
    assert.equal(block!.ageben, "azozon.");
    assert.equal(block!.morph, "Azozon");
    assert.equal(block!.loose, "Azozon.");
  });

  it("extractTeachBlocks allows omitted morph when only loose follows", () => {
    const md = `> \`azozol\`
>
> "swan"
`;
    const [block] = extractTeachBlocks(md);
    assert.ok(block);
    assert.equal(block!.morph, null);
    assert.equal(block!.loose, "swan");
  });

  it("extractTeachBlocks splits blockquotes separated by a blank line", () => {
    const md = `> \`yel vowurol.\`
>
> y-command | v-walk
>
> "Walk."

> \`! zazozon vowurol.\`
>
> ! | z-Azozon | v-walk
>
> "Azozon walks!"
`;
    const blocks = extractTeachBlocks(md);
    assert.equal(blocks.length, 2);
    assert.equal(blocks[1]!.ageben, "! zazozon vowurol.");
    assert.equal(blocks[1]!.morph, "! | z-Azozon | v-walk");
    assert.equal(blocks[1]!.loose, "Azozon walks!");
  });

  it("round-trips the yael census example block", () => {
    const md = `> \`yaol zuwen zam zawan zal guzemel.\`
>
> y-yes | [[z-speaker | z-and.open] | z-listener | z-and | g-sleepy]
>
> "Yes — you and I are sleepy."
`;
    const [pair] = extractExampleBlocks(md);
    assert.ok(pair);
    const result = compareMorphGloss(pair!.ageben, pair!.morph, tables);
    assert.equal(result.ok, true, `${result.expected} vs ${result.actual}`);
  });

  it("values bake stance and ending grain", () => {
    expectLine("zewal gawethal", "z-present | g-relatedness-met-lasting");
    expectLine("zabowam wunathur goyom", "z-gathering | [w-autonomy-unmet-passing | g-stimulus]");
    expectLine("zezuyol wuwathuraer goyom", "z-speech | [w-competence-unmet-passing-CIRCUM-SURGING | g-stimulus]");
    expectLine("zobewom guwathamar", "z-draft | g-competence-met-any-term-INTERNAL-SURGING");
    expectLine("zonal wawethumuor goyom", "z-memo | [w-relatedness-unmet-modifiable-RESISTING-SURGING | g-stimulus]");
    expectLine("gawethaluem", "g-relatedness-met-lasting-UNPLACED-FLOWING");
  });

  it("span interiors: cite and aside gloss English; an opaque interior passes through", () => {
    expectLine("zazozon vowurol th(hugowul)", "z-Azozon | v-walk | th-ASIDE[h-quiet]");
    expectLine("yul zalazun v[vezohul]", "y-prohibition | z-Alazun | v-CITE[v-stop]");
    expectLine(
      "zazozon vowurol th(zalazun vezuvel)",
      "z-Azozon | v-walk | th-ASIDE[z-Alazun | v-sleep]",
    );
    expectLine("x@<Sam> zalen vowurol", 'x-NAME.OPAQUE["Sam"] | z-TOPIC | v-walk');
    expectLine("glegol x[odoze] zalen gamezem", '[gl-MENTION | x-CITE["odoze"]] | z-TOPIC | g-small');
  });

  it("viewpoint laterals keep compass on DIR", () => {
    expectLine("yol vowurol hewuhothazozon", "y-command | v-walk | h-west-th-Azozon");
  });

  it("a holder seam glosses its host overlay and the holder", () => {
    expectLine("zalazun theyomazozon vudurul", "z-Alazun | th-CLUES-Azozon | v-departure");
    expectLine("zalazun thebarazozon vudurul", "z-Alazun | th-REPORTED.weak-Azozon | v-departure");
    expectLine("zalazun thomalazozon vudurul", "z-Alazun | th-MAY-find-out-Azozon | v-departure");
    expectLine("zalazun theyumazozon vudurul", "z-Alazun | th-NOTIONAL-Azozon | v-departure");
  });

  it("a holder takes resume -r and associative -x like any noun", () => {
    expectLine(
      "zazozon vudurul. zalazun theyomazozor vehohel.",
      "z-Azozon | v-departure . z-Alazun | th-CLUES-←Azozon | v-sit",
    );
    expectLine("zalazun theyomazozonx vudurul", "z-Alazun | th-CLUES-Azozon-x | v-departure");
  });

  it("a hook + /b/ after a landmark describes that landmark; after a recipient it is same-role", () => {
    expectLine("zawan al bahaham em buwen vavel", "z-listener | [in | [b-locality | [near | b-speaker]]] | v-hatch");
    expectLine("zazozon vunurol hevam blavulul em buwen", "z-Azozon | v-dance | [h-around | [bl-fire | [near | b-speaker]]]");
    expectLine("zazozon balazun al bahelan vezuyol", "z-Azozon | b-Alazun | including | b-Ahelan | v-tell");
  });

  it("stacked extra-noun -r points back (hooks.md § Point back)", () => {
    expectLine("zazozon vehohel aer", "z-Azozon | v-sit | on.it");
    expectLine("zalazun varuyol aor", "z-Alazun | v-write | with.it");
    expectLine("zazozon vowurol uer", "z-Azozon | v-walk | through.there");
  });

  it("em + /b/ goes inside the bracket of the noun on its left", () => {
    expectLine("zodozel gelazem om buwen", "[z-dog | g-big | [used-by | b-speaker]]");
    expectLine("zodozel om buwen gelazem", "[z-dog | [used-by | [b-speaker | g-big]]]");
    expectLine("zodozel gelazem al bahaham om buwen", "[z-dog | g-big] | [in | [b-locality | [used-by | b-speaker]]]");
    expectLine("zazozon balazun om buwen vezuyol", "z-Azozon | b-Alazun | rather.open | b-speaker | v-tell");
  });

  it("label scope glosses its seam vowel", () => {
    expectLine("zalazun gonumuthul", "z-Alazun | g-angry-th-episode");
    expectLine("zazozon vulamuthol", "z-Azozon | v-lie-th-role");
    expectLine("zalazun ganomuthal", "z-Alazun | g-anxious-th-type");
    expectLine("zalazun gwozeduyol", "z-Alazun | g-role-agent-teach");
    expectLine("zazozon vulamuthel blalazun", "z-Azozon | [v-lie-th-pair | bl-Alazun]");
    expectLine("zazozon vulamuthael", "z-Azozon | v-lie-th-situation");
    expectLine("zalazun gonumuthael blerulal", "z-Alazun | [g-angry-th-situation | bl-rain]");
    expectLine("zazozon vulamuthual", "z-Azozon | v-lie-th-except-episode");
    expectLine("zalazun gwaozeduyol", "z-Alazun | g-using-agent-teach");
    expectLine("zalazun gwoezeduyol", "z-Alazun | g-toward-role-agent-teach");
    expectLine("zalazun gwuozeduyol", "z-Alazun | g-outside-role-agent-teach");
    expectLine("zazozon gonumuthuel blalazun", "z-Azozon | [g-angry-th-except-pair | bl-Alazun]");
  });

  it("a pair-scope verb hosts the /b/ right after it", () => {
    expectLine("zazozon vulamuthel blalazun", "z-Azozon | [v-lie-th-pair | bl-Alazun]");
  });

  it("house-cast resume without a same-line antecedent", () => {
    expectLine("zazozorx vehohel", "z-←Azozon-x | v-sit");
  });

  it("role pointers gloss their role and event, not the referent", () => {
    expectLine("zazozon vowurol. zwuzer vehohel", "z-Azozon | v-walk . z-←episode-agent.same | v-sit");
    expectLine("zazozon vayebel dwuzor", "z-Azozon | v-see | d-←episode-agent.self");
    expectLine("zazozon zalazun zal vowurol. zwuzerx vehohel", "[z-Azozon | z-Alazun | z-and] | v-walk . z-←episode-agent.same-x | v-sit");
    expectLine("zazozon vowurol. dwuher vayebel", "z-Azozon | v-walk . d-←episode-manner.same | v-see");
    expectLine("zazozon vowurol. dwuver vayebel", "z-Azozon | v-walk . d-←episode-event.same | v-see");
    expectLine("dwahowurol", "d-type-manner-walk");
  });

  it("numeric prefix glosses the number, the seam, then the stem", () => {
    expectLine("zahelan gruwuxahuyayel", "z-Ahelan | g-quasi-x-friend");
    expectLine("zrawaxolamal", "z-infinity-x-love");
    expectLine("zazozon dragemxezuyol vayebel", "z-Azozon | d-three.about-x-speech | v-see");
  });
});

describe("morphGlossLine — extra fixtures", () => {
  it("round-trips glosses.md example blocks that include their antecedents", () => {
    const glosses = readFileSync(join(rootDir, "docs", "meta", "glosses.md"), "utf8");
    const pairs = extractExampleBlocks(glosses);
    assert.ok(pairs.length >= 6);
    for (const pair of pairs) {
      if (pair.morph.includes("←")) continue;
      const result = compareMorphGloss(pair.ageben, pair.morph, tables);
      assert.equal(
        result.ok,
        true,
        `${pair.ageben} → documented ${pair.morph} vs parser ${result.actual}${result.parseError ? ` (${result.parseError})` : ""}`,
      );
    }
  });
});

describe("morphGlossLine — th stance letter", () => {
  it("glosses stance moods, /w/ on th, and th poles with stand-ins", () => {
    expectLine("thomam zazozon vehohel.", "th-MAY | z-Azozon | v-sit");
    expectLine("zazozon wuzemel thugem vayebel ayebelul.", "z-Azozon | [w-sleepy | th-LIVE] | v-see | eye-leave");
    expectLine("thahum blarl zazozon vehohel.", "[th-because | bl-that-clause] | z-Azozon | v-sit");
    expectLine("theyom blarl zazozon vehohel.", "[th-CLUES | bl-that-clause] | z-Azozon | v-sit");
    expectLine("thanal blarl zazozon vehohel.", "[th-DEDUCED.strong | bl-that-clause] | z-Azozon | v-sit");
    expectLine("thubol blral blarl zazozon vehohel.", "[th-PATTERN.strong | [bl-later | bl-that-clause]] | z-Azozon | v-sit");
    expectLine("zazozon vehohel th(zalazun vowurol).", "z-Azozon | v-sit | th-ASIDE[z-Alazun | v-walk]");
  });

  it("keeps time poles and restrictors on /h/", () => {
    assert.match(morphGlossLine("habam blarl zazozon vehohel.", tables), /^\[h-before/);
  });
});

describe("morphGlossLine — stance joins and emphatic prohibition", () => {
  it("glosses /th/ join fences", () => {
    expectLine("zazozon vowurol thevum thul.", "z-Azozon | v-walk | th-MEMORY | th-not");
    expectLine("zazozon vowurol thahum blalazun thul.", "z-Azozon | v-walk | [th-because | bl-Alazun] | th-not");
  });

  it("glosses yul yul", () => {
    expectLine("yul yul vozuyul.", "y-prohibition | y-prohibition | v-sneak");
  });

  it("glosses each stacked act word on its own", () => {
    expectLine("yol yem vowurol zawan.", "y-command | y-soft-question | v-walk | z-listener");
  });
});

describe("morphGlossLine — tone marks", () => {
  it("copies attached and free-standing marks", () => {
    expectLine("zazozon vayebel ?dodozel.", "z-Azozon | v-see | ?d-dog");
    expectLine("! zazozon vowurol.", "! | z-Azozon | v-walk");
    expectLine("zazozon vayebel &dodozel.", "z-Azozon | v-see | &d-dog");
    expectLine("zazozon ; vowurol.", "z-Azozon | ; | v-walk");
    expectLine("%zazozon vowurol.", "%z-Azozon | v-walk");
  });
});

describe("morphGlossLine — standalone joins", () => {
  it("standalone reads none / everything; items keep list readings", () => {
    expectLine("zal vowurol.", "z-none | v-walk");
    expectLine("zam vowurol.", "z-none.open | v-walk");
    expectLine("zual vowurol.", "z-everything | v-walk");
    expectLine("zazozon vowurol el bual.", "z-Azozon | v-walk | [at | b-everything]");
    expectLine("zazozon vayebel dal.", "z-Azozon | v-see | d-none");
    expectLine("zazozon zual vowurol.", "[z-Azozon | z-everything-but] | v-walk");
    expectLine("zazozon zalazun zal vowurol.", "[z-Azozon | z-Alazun | z-and] | v-walk");
  });
});

describe("morphGlossLine — kind reference", () => {
  it("zuan + shared kind reads the kind itself", () => {
    expectLine("zuan gogozel guzemel.", "[z-the-kind | g-cat] | g-sleepy");
    expectLine("zazozon duan gogozel vayebel.", "z-Azozon | [d-the-kind | g-cat] | v-see");
  });
});

describe("morphGlossLine — word position, not spelling", () => {
  it("does not read an in-clause hook as discourse because an earlier sentence opened with the same spelling", () => {
    const line = morphGlossLine("al zazozon vowurol. zazozon al zalazun zal vowurol.", tables);
    const second = line.split(" . ")[1] ?? "";
    assert.ok(!second.includes("additionally"), line);
  });
});

describe("morphGlossLine — topic and generic pronouns", () => {
  it("glosses the topic pronoun and its topic word", () => {
    expectLine(
      "xazozon zalen dalazun vayebel. zalazur dalen vezuyol.",
      "x-Azozon | z-TOPIC | d-Alazun | v-see . z-←Alazun | d-TOPIC | v-tell",
    );
    expectLine("xazozonx zalenx vehohel.", "x-Azozon-x | z-TOPIC-x | v-sit");
    expectLine("xazozor zalen vehohel.", "x-←Azozon | z-TOPIC | v-sit");
  });
  it("glosses the generic pronoun, and either one as a holder", () => {
    expectLine("zeyen vezuvel.", "z-ONE | v-sleep");
    expectLine("xazozon theyomalen zalazun vudurul.", "x-Azozon | th-CLUES-TOPIC | z-Alazun | v-departure");
    expectLine("theyomeyen zalazun vudurul.", "th-CLUES-ONE | z-Alazun | v-departure");
  });
  it("keeps the star and person roots ordinary on other endings", () => {
    expectLine("zalel vowurol.", "z-star | v-walk");
    expectLine("zeyel vowurol.", "z-person | v-walk");
  });
  it("glosses a topic word with its own hooks, and the clearing linkers", () => {
    expectLine("xodozel om bazozon zalazun vayebel.", "x-dog | [used-by | b-Azozon] | z-Alazun | v-see");
    expectLine("xevewom zazozon vowurol.", "x-next | z-Azozon | v-walk");
    expectLine("hehugom blazozon zalazun vowurol.", "[h-as-for | bl-Azozon] | z-Alazun | v-walk");
  });
});

describe("morphGlossLine — flag rows", () => {
  it("glosses -l as the flag, -n as the nativized name, -m as the demonym", () => {
    expectLine("zalazun vayebel dazabanal.", "z-Alazun | v-see | d-japan-flag");
    expectLine("zalazun vayebel dazabanan.", "z-Alazun | v-see | d-Azabanan");
    expectLine("zalazun gazabanam.", "z-Alazun | g-japanese");
  });
});

describe("morphGlossLine — verb-phrase join items", () => {
  it("puts an /h/ or /d/ before a later verb inside that verb's item", () => {
    expectLine("zazozon vowurol hadurom veruvol val.", "z-Azozon | [v-walk | [h-haste | v-run] | v-and]");
    expectLine("zazozon vugudol dabedal vehohel val.", "z-Azozon | [v-cooking | [d-popcorn | v-sit] | v-and]");
  });

  it("puts the words between the subject and the first verb in the first item, and leaves a joinless verb chain flat", () => {
    expectLine("zazozon hadurom vugudol veruvol val.", "z-Azozon | [[h-haste | v-cooking] | v-run | v-and]");
    expectLine(
      "zazozon dabedal vugudol hevam blavulul vehohel val.",
      "z-Azozon | [[d-popcorn | v-cooking] | [[h-around | bl-fire] | v-sit] | v-and]",
    );
    expectLine("zazozon bahelan vezuyol bazozon varal val.", "z-Azozon | [[b-Ahelan | v-tell] | [b-Azozon | v-pay] | v-and]");
    expectLine("zazozon vowurol hadurom veruvol.", "z-Azozon | v-walk | h-haste | v-run");
  });

  it("shares words before the subject, and /d/ /b/ /h/ after the join", () => {
    expectLine("dabedal zazozon vugudol vagedal val.", "d-popcorn | z-Azozon | [v-cooking | v-eat | v-and]");
    expectLine("hadurom zazozon vugudol veruvol val.", "h-haste | z-Azozon | [v-cooking | v-run | v-and]");
    expectLine("h_15,30 zazozon vowurol veruvol val.", "h-_15,30 | z-Azozon | [v-walk | v-run | v-and]");
    expectLine("zazozon vugudol vagedal val dabedal.", "z-Azozon | [v-cooking | v-eat | v-and | d-popcorn]");
    expectLine("zazozon vugudol veruvol val hadurom.", "z-Azozon | [v-cooking | v-run | v-and | h-haste]");
    expectLine("zazozon vugudol vagedal val bahelan hahunom.", "z-Azozon | [v-cooking | v-eat | v-and | b-Ahelan | h-intensity]");
    expectLine("dabedal vugudol vagedal val zazozon.", "d-popcorn | [v-cooking | v-eat | v-and] | z-Azozon");
  });

  it("keeps a /th/ word at the edge of the first item outside it, and one inside it in its bracket", () => {
    expectLine("zazozon thevemem vowurol veruvol val.", "z-Azozon | th-doubt | [v-walk | v-run | v-and]");
    expectLine("zazozon dabedal thevemem vugudol vagedal val.", "z-Azozon | [[d-popcorn | th-doubt | v-cooking] | v-eat | v-and]");
  });

  it("leaves a one-verb denial as it is", () => {
    expectLine("zazozon dabedal vayebel vul.", "z-Azozon | d-popcorn | [v-see | v-not]");
  });

  it("takes an extra-noun hook into the item of the verb after it", () => {
    expectLine("zazozon vowurol ul b_9 veruvol val.", "z-Azozon | [v-walk | [[from | b-_9] | v-run] | v-and]");
    expectLine("zazozon vowurol ul barl zalazun vezuvel.", "z-Azozon | v-walk | [from | b-that-clause] | z-Alazun | v-sleep");
  });
});

describe("morphGlossLine — from … to", () => {
  it("reads ul X oel Y as one unit, wherever it sits", () => {
    expectLine("zazozon ul b_9 oel b_17 vowurol.", "z-Azozon | [from | b-_9 | toward | b-_17] | v-walk");
    expectLine("zazozon vowurol veruvol val ul b_9 oel b_17.", "z-Azozon | [v-walk | v-run | v-and] | [from | b-_9 | toward | b-_17]");
    expectLine("zazozon vowurol ul b_9 oel b_17 veruvol val.", "z-Azozon | [v-walk | [[from | b-_9 | toward | b-_17] | v-run] | v-and]");
  });

  it("keeps the straddling form as two extra nouns", () => {
    expectLine("zazozon ul b_9 vowurol oel b_17.", "z-Azozon | [from | b-_9] | v-walk | [toward | b-_17]");
  });
});
