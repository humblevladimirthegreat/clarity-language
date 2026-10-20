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

function expectLine(egabon: string, morph: string): void {
  assert.equal(morphGlossLine(egabon, tables), normalizeMorphLine(morph), egabon);
}

describe("morphGlossLine — clause joins go between clauses", () => {
  it("groups a switched join over the list before it", () => {
    expectLine(
      "zuzazon voworel xol zolozun varuvel xal zehalon vuzevol.",
      "[[z-Uzazon | v-walk | x-or-exactly-one | z-Olozun | v-run] | x-and | z-Ehalon | v-sleep]",
    );
  });
  it("reads a sentence-initial join as linking the whole next sentence", () => {
    expectLine(
      "zuzazon voworel. xan zolozun varuvel xol zehalon vuzevol.",
      "z-Uzazon | v-walk . x-and-then | [z-Olozun | v-run | x-or-exactly-one | z-Ehalon | v-sleep]",
    );
  });
  it("takes a standalone join as a stand-in clause item", () => {
    expectLine("zuzazon voworel xol xal.", "[z-Uzazon | v-walk | x-or-exactly-one | x-none]");
    expectLine("xual ul zuzazon voworel.", "x-everything | except | z-Uzazon | v-walk");
  });
  it("glosses a resume of a resume as the original referent", () => {
    expectLine(
      "zuzazon thamal voworel xon zuzazor vezeyol xon zuzazor vuzevol.",
      "[z-Uzazon | th-plan-atlas | v-walk | x-or-else | z-←Uzazon | v-sing | x-or-else | z-←Uzazon | v-sleep]",
    );
  });
  it("glosses the sequence fallback after an attempt", () => {
    expectLine(
      "zuzazon hudur voworel xon zuzazor vezeyol.",
      "[z-Uzazon | h-ATTEMPT-trial | v-walk | x-or-else | z-←Uzazon | v-sing]",
    );
  });
});

describe("morphGlossLine — SHARED only where it can describe the join", () => {
  it("leaves an /h/ after a set noun join on the verb", () => {
    expectLine("zuzazon zolozun zal huhavem voworel.", "[z-Uzazon | z-Olozun | z-and] | h-intensity | v-walk");
  });
  it("keeps an /h/ after a rank noun join as the scale", () => {
    expectLine("zuzazon zolozun zel huhavem voworel.", "[z-Uzazon | z-Olozun | z-rank/more | h-intensity] | v-walk");
  });
  it("reads a /ɡ/ after a /ɡ/ join as the next item, so adjective lists nest", () => {
    expectLine(
      "zodozol gerolol gumazom gul geluzom gal voworel.",
      "[z-dog | [[g-red | g-small | g-not] | g-big | g-and]] | v-walk",
    );
  });
  it("leaves an /h/ after a /ɡ/ join on the verb", () => {
    expectLine("zodozol gerolol gumazom gal huhavem voworel.", "[z-dog | [g-red | g-small | g-and]] | h-intensity | v-walk");
  });
  it("reads al / ul between number endpoints as a range", () => {
    expectLine("zodozol grarel al graval voworel.", "[z-dog | g-three] | through | g-five | v-walk");
    expectLine("zrabal ul zraval.", "z-plus-infinity | through-excluding | z-five");
    expectLine("zrarel ar zraval.", "z-three | some.through | z-five");
  });
  it("keeps al literal when an endpoint has no digits or the kinds differ", () => {
    expectLine("zral al zraval.", "z-more-than-one | including | z-five");
    expectLine("zrarel al zredul.", "z-three | including | z-2nd");
  });
  it("reads stacked in-clause hooks as spans on any line", () => {
    expectLine("zadahel oel zadahel.", "z-down | through | z-down");
    expectLine("zrarel ual zraval.", "z-three | strictly-between | z-five");
    expectLine("zrarel uel zraval.", "z-three | outside | z-five");
    expectLine("zuzazon uar zehalon vuzevol.", "z-Uzazon | some.strictly-between | z-Ehalon | v-sleep");
  });
});

describe("morphGlossLine — glosses.md single words", () => {
  it("senses-are-separate-roots table", () => {
    expectLine("zamul", "z-microphone");
    expectLine("zamum", "z-performance");
    expectLine("zamun", "z-speaker");
    expectLine("gogawol", "g-quiet");
    expectLine("gogawom", "g-volume");
    expectLine("hevol", "h-fishing");
    expectLine("thevom", "th-MEMORY");
    expectLine("gawuhom", "g-home");
  });

  it("house-cast names and resumes", () => {
    expectLine("zuzazon", "z-Uzazon");
    expectLine("zolozun", "z-Olozun");
    expectLine("zehalon", "z-Ehalon");
    expectLine("zuzazon. zuzazor", "z-Uzazon . z-←Uzazon");
    expectLine("zolozun. zolozur", "z-Olozun . z-←Olozun");
    expectLine("zehalon. zehalor", "z-Ehalon . z-←Ehalon");
  });

  it("mid-word x families", () => {
    expectLine("ohuxulowon", "wish-x-guidance");
    expectLine("yanadoxazolon", "y-Anado-x-Azolon");
    expectLine("zuzudoxogadaxedadan", "z-Uzudo-x-Ogada-x-Edadan");
    expectLine("voworexel", "v-walk-unable-temporary");
    expectLine("thulothem", "th-competence-ought-offered");
    expectLine("zaxezeyer", "z-agent-x-speech");
    expectLine("zaxavavul", "z-agent-x-fight");
    expectLine("zaxavavum", "z-agent-x-struggle");
    expectLine("zexuzevol", "z-scene-x-sleep");
    expectLine("zoxezeyel", "z-recipient-x-speech");
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
    expectLine("zegazolx g=+ vehuhol.", "[z-cat-x | g-some-amount] | v-sit");
    expectLine("yol zegazolx g=+ vehuhol.", "y-question | [z-cat-x | g-how-many] | v-sit");
    expectLine("yol zuzazon vehuhol ol b=#.", "y-question | z-Uzazon | v-sit | [at | b-which-place]");
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
    expectLine("zuzazon vuzevol al bawuhol.", "z-Uzazon | v-sleep | [in | b-house]");
    expectLine("zodozolx al zegazol.", "z-dog-x | including | z-cat");
    expectLine("zuzazon ul buyehol voworel oel bodevel.", "z-Uzazon | [from | b-station] | v-walk | [toward | b-train]");
    expectLine("zuzazon vuzevol weluzom al bawuhol.", "z-Uzazon | v-sleep | [[w-very | in] | b-house]");
    expectLine("zoledalx wal ul zazadal.", "z-plate-x | [w-never | except] | z-salad");
    expectLine("zuzazon weluzom humum budazal voworel.", "z-Uzazon | [[w-very | h-like] | b-duck] | v-walk");
    expectLine("hal", "h-never");
    expectLine("har", "h-sometimes");
    expectLine("yol zehalon voworel har.", "y-question | z-Ehalon | v-walk | h-when");
    expectLine("zuzazon voworel hurelal hal", "z-Uzazon | v-walk | h-rain | h-only-when");
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
    expectLine("zodozol zwal degazol dwel vanobol. zwer voworel.", "[z-dog | z-tag.A] | [d-cat | d-tag.E] | v-see . z-←tag.E | v-walk");
    expectLine("zuzazon zwal voworel. zolozun dwam vanobol.", "[z-Uzazon | z-tag.A] | v-walk . z-Olozun | d-←tag.A.part | v-see");
    expectLine("zuzazon zwal voworel. zwarx vuzevol.", "[z-Uzazon | z-tag.A] | v-walk . z-←tag.A-x | v-sleep");
    expectLine("zodozol zegazol zam zwal voworel.", "[[z-dog | z-cat | z-and.open] | z-tag.A] | v-walk");
    expectLine("zwal bwel vezeyel. zwaer voworel.", "z-tag.A | b-tag.E | v-tell . z-←tag.A+E | v-walk");
  });

  it("scientific and percent number writing", () => {
    expectLine("g+27e12", "g-27e12");
    expectLine("g+25%", "g-25yo");
    expectLine("grarel", "g-three");
  });

  it("worked single-words table", () => {
    expectLine("yeweyol", "y-greeting");
    expectLine("uzazon.", "Uzazon");
    expectLine("yolozuxen", "y-Olozun-minutes");
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
    expectLine("yol zar voworel", "y-question | z-wh | v-walk");
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
    expectLine("vehuhol", "v-sit");
    expectLine("vanobol", "v-see");
    expectLine("vezeyel", "v-tell");
    expectLine("veyorul", "v-departure");
    expectLine("weluzom", "w-very");
    expectLine("geluzom", "g-big");
    expectLine("al bawuhol", "[in | b-house]");
    expectLine("ael bahawol", "[using | b-hammer]");
    expectLine("humum", "h-like");
    expectLine("gumum", "g-like");
    expectLine("gobom", "g-part-of");
    expectLine("gahem", "g-contents");
    expectLine("guwum", "g-material");
    expectLine("gagum", "g-origin");
    expectLine("hazam", "h-between");
    expectLine("zanobol", "z-eye");
    expectLine("hohagel", "h-hash");
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
      "yuel zamun voworexel thulothom.",
      "y-no | z-speaker | v-walk-unable-temporary | th-competence-motive-any-term",
    );
  });

  it("numbered alternative + unmet pleasure", () => {
    expectLine(
      "xrebul zayovam grewol. zamunx thozothur.",
      "x-starting-with | [z-problem | g-1st] . z-speaker-x | th-pleasure-unmet-passing",
    );
  });

  it("literal key is not ideation solution", () => {
    expectLine("zegewol wuboxel.", "z-key | w-ABIL-unable-temporary");
  });

  it("inclusive we", () => {
    expectLine(
      "yael xodum zahan thamar voworel vul.",
      "y-yes | x-therefore | z-interlocutors | th-plan-sketch | [v-walk | v-not]",
    );
  });

  it("resume with in-text antecedent", () => {
    expectLine(
      "yohuxazolon. xezom zohuxazolor thevom zurelal.",
      "y-Ohu-x-Azolon . x-however | z-←Ohu-x-Azolon | th-MEMORY | z-rain",
    );
  });
});

describe("morphGlossLine — act -r and linker endings", () => {
  it("act words with -r are just formed or for now", () => {
    expectLine("yar zuzazon voworel.", "y-provisional-statement | z-Uzazon | v-walk");
    expectLine("yor zuzazon voworel.", "y-working-question | z-Uzazon | v-walk");
    expectLine("yer voworel.", "y-command-for-now | v-walk");
    expectLine("yur voworel.", "y-hold-off | v-walk");
  });

  it("linkers default to -m; -l is the firm link where taught", () => {
    expectLine("xezom zuzazon voworel.", "x-however | z-Uzazon | v-walk");
    expectLine("xezol zuzazon voworel.", "x-nevertheless | z-Uzazon | v-walk");
    expectLine("xodul zuzazon voworel.", "x-it-follows | z-Uzazon | v-walk");
    expectLine("xegahul zuzazon voworel.", "x-on-the-contrary | z-Uzazon | v-walk");
  });
});

describe("morphGlossLine — restrictor -r vs -l", () => {
  it("har is sometimes / when, not never", () => {
    expectLine("hal", "h-never");
    expectLine("zolozun voworel hal.", "z-Olozun | v-walk | h-never");
    expectLine("har", "h-sometimes");
    expectLine("zolozun varuvel har.", "z-Olozun | v-run | h-sometimes");
    expectLine("yol zehalon voworel har.", "y-question | z-Ehalon | v-walk | h-when");
  });
  it("her is the first-ranked occasion; under a question it asks when is best (restrictors.md)", () => {
    expectLine("zuzazon voworel her.", "z-Uzazon | v-walk | h-preferred-time");
    expectLine("yol zahan voworel her.", "y-question | z-interlocutors | v-walk | h-when-best");
    expectLine("yol zahan voworel hurelal hanurol her.", "y-question | z-interlocutors | v-walk | h-rain | h-night | h-when-best");
  });
});

describe("morphGlossLine — tags, xuen, humul, pointer anchors", () => {
  it("any polar word makes a tag after yol (questions.md#tags)", () => {
    expectLine("yem zahan voworel. yol yaol.", "y-request | z-interlocutors | v-walk . y-question | y-sure");
    expectLine("yem zehon voworel. yol yuol.", "y-request | z-listener | v-walk . y-question | y-refuse-option");
    expectLine("zuzazon voworel. yol yuel.", "z-Uzazon | v-walk . y-question | y-no");
  });
  it("xuen tells a sequence last first (join-across-roles.md#sequence)", () => {
    expectLine("zuzazon vehuhol xuen zuzazor voworel.", "[z-Uzazon | v-sit | x-and-before-that | z-←Uzazon | v-walk]");
  });
  it("humul / gumul are exactly like (relations.md#exactly-like)", () => {
    expectLine("zuzazon humul budazal voworel.", "z-Uzazon | [h-exactly-like | b-duck] | v-walk");
    expectLine("zawuhol gumul buzazon.", "z-house | [g-exactly-like | b-Uzazon]");
  });
  it("a role pointer as a viewpoint lateral's facing anchor (roles.md#viewpoint-laterals)", () => {
    expectLine("zuzazon voworel. zolozun vehuhol howehethaxar.", "z-Uzazon | v-walk . z-Olozun | v-sit | h-west-th-←agent.same");
    expectLine("zuzazon voworel howehethaxer.", "z-Uzazon | v-walk | h-west-th-←agent.self");
  });
});

describe("compareMorphGloss", () => {
  it("passes an equal pair", () => {
    const result = compareMorphGloss("zuzazon godozol.", "z-Uzazon | g-dog", tables);
    assert.equal(result.ok, true);
    assert.equal(result.expected, "z-Uzazon | g-dog");
    assert.equal(result.actual, "z-Uzazon | g-dog");
  });

  it("fails a sense mismatch with expected/actual", () => {
    const result = compareMorphGloss("zamun", "z-microphone", tables);
    assert.equal(result.ok, false);
    assert.equal(result.expected, "z-microphone");
    assert.equal(result.actual, "z-speaker");
    assert.equal(result.parseError, undefined);
  });

  it("fails unparseable Egabon as parse, not gloss mismatch", () => {
    const result = compareMorphGloss("z!!!", "z-nope", tables);
    assert.equal(result.ok, false);
    assert.ok(result.parseError);
  });

  it("emits scope island edges in morph gloss", () => {
    expectLine(
      "zuzazon { hegegom zodozol gerolol } vanobol",
      "z-Uzazon | SCOPE[h-possibility | [z-dog | g-red]] | v-see",
    );
  });

  it("a mention is a marker word plus the span, and the span's interior stays as written", () => {
    expectLine("glelel z<odozo> gumazom", '[gl-MENTION | z-OPAQUE["odozo"]] | g-small');
    expectLine("glelel z<zuzazon vezeyol> gumazom", '[gl-MENTION | z-OPAQUE["zuzazon vezeyol"]] | g-small');
    expectLine("glelen d<onoron> vogegum", '[gl-NAME.MENTION | d-OPAQUE["onoron"]] | v-rejection');
    expectLine("zuzazon d@[onoron olozun] vogegum", "z-Uzazon | d-NAME.CITE[Onoron | Olozun] | v-rejection");
  });

  it("glosses -ln and ^@ as the name plus .instance (word-endings.md#name-instance--ln)", () => {
    expectLine("zolozun duzazoln vanobol", "z-Olozun | d-Uzazon.instance | v-see");
    expectLine("zolozun duzazolnx vanobol", "z-Olozun | d-Uzazon.instance-x | v-see");
    expectLine("zolozun d^@<iPhone> vanobol", 'z-Olozun | d-NAME.OPAQUE.instance["iPhone"] | v-see');
  });

  it("the mention marker's spelling is the ordinary adjective anywhere but before a span", () => {
    expectLine("glelel zodozol voworel", "[gl-letters | z-dog] | v-walk");
  });

  it("ordinary -l on a sake host root uses literal sense, not sake overlay", () => {
    expectLine("zuzazon ganal bolozun", "z-Uzazon | [g-knot | b-Olozun]");
  });

  it("morphRedundantWithLoose allows single-word citation skips", () => {
    assert.equal(morphRedundantWithLoose("uzazol", "swan", tables), true);
    assert.equal(morphRedundantWithLoose("uzazon.", '"Uzazon."', tables), true);
    assert.equal(morphRedundantWithLoose("zuzazon vehuhol.", "Uzazon sits.", tables), false);
    assert.equal(morphRedundantWithLoose("z!!!", "nope", tables), false);
  });

  it("extractTeachBlocks finds morph after a name line and loose quotes", () => {
    const md = `> \`uzazon.\`
>
> Uzazon
>
> "Uzazon." (hello — the speaker is Uzazon)
`;
    const [block] = extractTeachBlocks(md);
    assert.ok(block);
    assert.equal(block!.egabon, "uzazon.");
    assert.equal(block!.morph, "Uzazon");
    assert.equal(block!.loose, "Uzazon.");
  });

  it("extractTeachBlocks allows omitted morph when only loose follows", () => {
    const md = `> \`uzazol\`
>
> "swan"
`;
    const [block] = extractTeachBlocks(md);
    assert.ok(block);
    assert.equal(block!.morph, null);
    assert.equal(block!.loose, "swan");
  });

  it("extractTeachBlocks splits blockquotes separated by a blank line", () => {
    const md = `> \`yel voworel.\`
>
> y-command | v-walk
>
> "Walk."

> \`! zuzazon voworel.\`
>
> ! | z-Uzazon | v-walk
>
> "Uzazon walks!"
`;
    const blocks = extractTeachBlocks(md);
    assert.equal(blocks.length, 2);
    assert.equal(blocks[1]!.egabon, "! zuzazon voworel.");
    assert.equal(blocks[1]!.morph, "! | z-Uzazon | v-walk");
    assert.equal(blocks[1]!.loose, "Uzazon walks!");
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
    const result = compareMorphGloss(pair!.egabon, pair!.morph, tables);
    assert.equal(result.ok, true, `${result.expected} vs ${result.actual}`);
  });

  it("values bake stance and ending grain", () => {
    expectLine("zebel ganathal", "z-present | g-relatedness-met-lasting");
    expectLine("zubawam wahuthur gobum", "z-gathering | [w-autonomy-unmet-passing | g-stimulus]");
    expectLine("zezeyel wulothuraor gobum", "z-speech | [w-competence-unmet-passing-CIRCUM-SURGING | g-stimulus]");
    expectLine("zebewom gulothamar", "z-draft | g-competence-met-any-term-INTERNAL-SURGING");
    expectLine("zumel wanathumuer gobum", "z-memo | [w-relatedness-unmet-modifiable-RESISTING-SURGING | g-stimulus]");
    expectLine("ganathaluom", "g-relatedness-met-lasting-UNPLACED-FLOWING");
  });

  it("span interiors: cite and aside gloss English; an opaque interior passes through", () => {
    expectLine("zuzazon voworel th(hogawol)", "z-Uzazon | v-walk | th-ASIDE[h-quiet]");
    expectLine("yul zolozun v[vuzahul]", "y-prohibition | z-Olozun | v-CITE[v-stop]");
    expectLine(
      "zuzazon voworel th(zolozun vuzevol)",
      "z-Uzazon | v-walk | th-ASIDE[z-Olozun | v-sleep]",
    );
    expectLine("x@<Sam> zozan voworel", 'x-NAME.OPAQUE["Sam"] | z-TOPIC | v-walk');
    expectLine("glelel x<odozo> zozan gumazom", '[gl-MENTION | x-OPAQUE["odozo"]] | z-TOPIC | g-small');
  });

  it("viewpoint laterals keep compass on DIR", () => {
    expectLine("yel voworel howehethuzazon", "y-command | v-walk | h-west-th-Uzazon");
  });

  it("a holder seam glosses its host overlay and the holder", () => {
    expectLine("zolozun thunemuzazon veyorul", "z-Olozun | th-CLUES-Uzazon | v-departure");
    expectLine("zolozun thewaruzazon veyorul", "z-Olozun | th-REPORTED.weak-Uzazon | v-departure");
    expectLine("zolozun thovuluzazon veyorul", "z-Olozun | th-MAY-find-out-Uzazon | v-departure");
    expectLine("zolozun thavomuzazon veyorul", "z-Olozun | th-NOTIONAL-Uzazon | v-departure");
  });

  it("a holder takes resume -r and associative -x like any noun", () => {
    expectLine(
      "zuzazon veyorul. zolozun thunemuzazor vehuhol.",
      "z-Uzazon | v-departure . z-Olozun | th-CLUES-←Uzazon | v-sit",
    );
    expectLine("zolozun thunemuzazonx veyorul", "z-Olozun | th-CLUES-Uzazon-x | v-departure");
  });

  it("a hook + /b/ after a landmark describes that landmark; after a recipient it is same-role", () => {
    expectLine("zehon al bahuhom om bamun vohal", "z-listener | [in | [b-locality | [near | b-speaker]]] | v-hatch");
    expectLine("zuzazon vudarol hugem bavalul om bamun", "z-Uzazon | v-dance | [h-around | [b-fire | [near | b-speaker]]]");
    expectLine("zuzazon bolozun al behalon vezeyel", "z-Uzazon | b-Olozun | including | b-Ehalon | v-tell");
  });

  it("stacked extra-noun -r points back (hooks.md § Point back)", () => {
    expectLine("zuzazon vehuhol aor", "z-Uzazon | v-sit | on.it");
    expectLine("zolozun vuruyel aer", "z-Olozun | v-write | with.it");
    expectLine("zuzazon voworel uor", "z-Uzazon | v-walk | through.there");
  });

  it("em + /b/ goes inside the bracket of the noun on its left", () => {
    expectLine("zodozol geluzom em bamun", "[z-dog | g-big | [used-by | b-speaker]]");
    expectLine("zodozol em bamun geluzom", "[z-dog | [used-by | [b-speaker | g-big]]]");
    expectLine("zodozol geluzom al bahuhom em bamun", "[z-dog | g-big] | [in | [b-locality | [used-by | b-speaker]]]");
    expectLine("zuzazon bolozun em bamun vezeyel", "z-Uzazon | b-Olozun | rather.open | b-speaker | v-tell");
  });

  it("label scope glosses its seam vowel", () => {
    expectLine("zolozun gonemuthal", "z-Olozun | g-angry-th-episode");
    expectLine("zuzazon vulamuthel", "z-Uzazon | v-lie-th-role");
    expectLine("zolozun ganumuthul", "z-Olozun | g-anxious-th-type");
    expectLine("zolozun gaxodeyethel", "z-Olozun | g-agent-x-teach-th-role");
    expectLine("zuzazon vulamuthol bolozun", "z-Uzazon | [v-lie-th-pair | b-Olozun]");
    expectLine("zuzazon vulamuthaol bolozun", "z-Uzazon | [v-lie-th-on-pair | b-Olozun]");
    expectLine("zuzazon vulamuthual", "z-Uzazon | v-lie-th-except-episode");
    expectLine("zolozun gaxodeyethael", "z-Olozun | g-agent-x-teach-th-using");
    expectLine("zolozun gaxodeyethoel", "z-Olozun | g-agent-x-teach-th-toward-role");
    expectLine("zolozun gaxodeyethuel", "z-Olozun | g-agent-x-teach-th-outside-role");
    expectLine("zuzazon gonemuthuol bolozun", "z-Uzazon | [g-angry-th-except-pair | b-Olozun]");
  });

  it("a pair-scope verb hosts the /b/ right after it", () => {
    expectLine("zuzazon vulamuthol bolozun", "z-Uzazon | [v-lie-th-pair | b-Olozun]");
  });

  it("house-cast resume without a same-line antecedent", () => {
    expectLine("zuzazorx vehuhol", "z-←Uzazon-x | v-sit");
  });

  it("role pointers gloss their role and event, not the referent", () => {
    expectLine("zuzazon voworel. zaxar vehuhol", "z-Uzazon | v-walk . z-←agent.same | v-sit");
    expectLine("zuzazon vanobol daxer", "z-Uzazon | v-see | d-←agent.self");
    expectLine("zuzazon voworel. zaexarx vehuhol", "z-Uzazon | v-walk . z-←instrument.same-x | v-sit");
    expectLine("zuzazon voworel. zolozun thunemaxar veyorul", "z-Uzazon | v-walk . z-Olozun | th-CLUES-←agent.same | v-departure");
  });

  it("quasi numeric derivation is English", () => {
    expectLine("zehalon ganalobelrubul", "z-Ehalon | g-friend-l-quasi");
  });

  it("abstract numeric join is -m in the gloss", () => {
    expectLine("zelamamrabal", "z-love-m-infinity");
  });
});

describe("morphGlossLine — extra fixtures", () => {
  it("round-trips glosses.md example blocks that include their antecedents", () => {
    const glosses = readFileSync(join(rootDir, "docs", "meta", "glosses.md"), "utf8");
    const pairs = extractExampleBlocks(glosses);
    assert.ok(pairs.length >= 6);
    for (const pair of pairs) {
      if (pair.morph.includes("←")) continue;
      const result = compareMorphGloss(pair.egabon, pair.morph, tables);
      assert.equal(
        result.ok,
        true,
        `${pair.egabon} → documented ${pair.morph} vs parser ${result.actual}${result.parseError ? ` (${result.parseError})` : ""}`,
      );
    }
  });
});

describe("morphGlossLine — th stance letter", () => {
  it("glosses stance moods, /w/ on th, and th poles with stand-ins", () => {
    expectLine("thovum zuzazon vehuhol.", "th-MAY | z-Uzazon | v-sit");
    expectLine("zuzazon wozumol thodom vanobol anobolul.", "z-Uzazon | [w-sleepy | th-LIVE] | v-see | eye-leave");
    expectLine("thavem barl zuzazon vehuhol.", "[th-because | b-that-clause] | z-Uzazon | v-sit");
    expectLine("thunem barl zuzazon vehuhol.", "[th-CLUES | b-that-clause] | z-Uzazon | v-sit");
    expectLine("thugul barl zuzazon vehuhol.", "[th-DEDUCED.strong | b-that-clause] | z-Uzazon | v-sit");
    expectLine("thobal bral barl zuzazon vehuhol.", "[th-PATTERN.strong | [b-later | b-that-clause]] | z-Uzazon | v-sit");
    expectLine("zuzazon vehuhol th(zolozun voworel).", "z-Uzazon | v-sit | th-ASIDE[z-Olozun | v-walk]");
  });

  it("keeps time poles and restrictors on /h/", () => {
    assert.match(morphGlossLine("habam barl zuzazon vehuhol.", tables), /^\[h-before/);
  });
});

describe("morphGlossLine — stance joins and emphatic prohibition", () => {
  it("glosses /th/ join fences", () => {
    expectLine("zuzazon voworel thevom thul.", "z-Uzazon | v-walk | th-MEMORY | th-not");
    expectLine("zuzazon voworel thavem bolozun thul.", "z-Uzazon | v-walk | [th-because | b-Olozun] | th-not");
  });

  it("glosses yul yul", () => {
    expectLine("yul yul vezeyul.", "y-prohibition | y-prohibition | v-sneak");
  });
});

describe("morphGlossLine — tone marks", () => {
  it("copies attached and free-standing marks", () => {
    expectLine("zuzazon vanobol ?dodozol.", "z-Uzazon | v-see | ?d-dog");
    expectLine("! zuzazon voworel.", "! | z-Uzazon | v-walk");
    expectLine("zuzazon vanobol &dodozol.", "z-Uzazon | v-see | &d-dog");
    expectLine("zuzazon ; voworel.", "z-Uzazon | ; | v-walk");
    expectLine("%zuzazon voworel.", "%z-Uzazon | v-walk");
  });
});

describe("morphGlossLine — standalone joins", () => {
  it("standalone reads none / everything; items keep list readings", () => {
    expectLine("zal voworel.", "z-none | v-walk");
    expectLine("zam voworel.", "z-none.open | v-walk");
    expectLine("zual voworel.", "z-everything | v-walk");
    expectLine("zuzazon voworel ol bual.", "z-Uzazon | v-walk | [at | b-everything]");
    expectLine("zuzazon vanobol dal.", "z-Uzazon | v-see | d-none");
    expectLine("zuzazon zual voworel.", "[z-Uzazon | z-everything-but] | v-walk");
    expectLine("zuzazon zolozun zal voworel.", "[z-Uzazon | z-Olozun | z-and] | v-walk");
  });
});

describe("morphGlossLine — kind reference", () => {
  it("zuan + shared kind reads the kind itself", () => {
    expectLine("zuan gegazol gozumol.", "[z-the-kind | g-cat] | g-sleepy");
    expectLine("zuzazon duan gegazol vanobol.", "z-Uzazon | [d-the-kind | g-cat] | v-see");
  });
});

describe("morphGlossLine — word position, not spelling", () => {
  it("does not read an in-clause hook as discourse because an earlier sentence opened with the same spelling", () => {
    const line = morphGlossLine("al zuzazon voworel. zuzazon al zolozun zal voworel.", tables);
    const second = line.split(" . ")[1] ?? "";
    assert.ok(!second.includes("additionally"), line);
  });
});

describe("morphGlossLine — topic and generic pronouns", () => {
  it("glosses the topic pronoun and its topic word", () => {
    expectLine(
      "xuzazon zozan dolozun vanobol. zolozur dozan vezeyel.",
      "x-Uzazon | z-TOPIC | d-Olozun | v-see . z-←Olozun | d-TOPIC | v-tell",
    );
    expectLine("xuzazonx zozanx vehuhol.", "x-Uzazon-x | z-TOPIC-x | v-sit");
    expectLine("xuzazor zozan vehuhol.", "x-←Uzazon | z-TOPIC | v-sit");
  });
  it("glosses the generic pronoun, and either one as a holder", () => {
    expectLine("zoben vuzevol.", "z-ONE | v-sleep");
    expectLine("xuzazon thunemozan zolozun veyorul.", "x-Uzazon | th-CLUES-TOPIC | z-Olozun | v-departure");
    expectLine("thunemoben zolozun veyorul.", "th-CLUES-ONE | z-Olozun | v-departure");
  });
  it("keeps the star and person roots ordinary on other endings", () => {
    expectLine("zozal voworel.", "z-star | v-walk");
    expectLine("zobel voworel.", "z-person | v-walk");
  });
  it("glosses a topic word with its own hooks, and the clearing linkers", () => {
    expectLine("xodozol em buzazon zolozun vanobol.", "x-dog | [used-by | b-Uzazon] | z-Olozun | v-see");
    expectLine("xevewem zuzazon voworel.", "x-next | z-Uzazon | v-walk");
    expectLine("hohagem buzazon zolozun voworel.", "[h-as-for | b-Uzazon] | z-Olozun | v-walk");
  });
});

describe("morphGlossLine — flag rows", () => {
  it("glosses -l as the flag, -n as the nativized name, -m as the demonym", () => {
    expectLine("zolozun vanobol dohunal.", "z-Olozun | v-see | d-japan-flag");
    expectLine("zolozun vanobol dohunan.", "z-Olozun | v-see | d-Ohunan");
    expectLine("zolozun gohunam.", "z-Olozun | g-japanese");
  });
});

describe("morphGlossLine — verb-phrase join items", () => {
  it("puts an /h/ or /d/ before a later verb inside that verb's item", () => {
    expectLine("zuzazon voworel hedarem varuvel val.", "z-Uzazon | [v-walk | [h-haste | v-run] | v-and]");
    expectLine("zuzazon vugudol doradal vehuhol val.", "z-Uzazon | [v-cooking | [d-popcorn | v-sit] | v-and]");
  });

  it("puts the words between the subject and the first verb in the first item, and leaves a joinless verb chain flat", () => {
    expectLine("zuzazon hedarem vugudol varuvel val.", "z-Uzazon | [[h-haste | v-cooking] | v-run | v-and]");
    expectLine(
      "zuzazon doradal vugudol hugem bavalul vehuhol val.",
      "z-Uzazon | [[d-popcorn | v-cooking] | [[h-around | b-fire] | v-sit] | v-and]",
    );
    expectLine("zuzazon behalon vezeyel buzazon vamol val.", "z-Uzazon | [[b-Ehalon | v-tell] | [b-Uzazon | v-pay] | v-and]");
    expectLine("zuzazon voworel hedarem varuvel.", "z-Uzazon | v-walk | h-haste | v-run");
  });

  it("shares words before the subject, and /d/ /b/ /h/ after the join", () => {
    expectLine("doradal zuzazon vugudol vogadol val.", "d-popcorn | z-Uzazon | [v-cooking | v-eat | v-and]");
    expectLine("hedarem zuzazon vugudol varuvel val.", "h-haste | z-Uzazon | [v-cooking | v-run | v-and]");
    expectLine("h_15,30 zuzazon voworel varuvel val.", "h-_15,30 | z-Uzazon | [v-walk | v-run | v-and]");
    expectLine("zuzazon vugudol vogadol val doradal.", "z-Uzazon | [v-cooking | v-eat | v-and | d-popcorn]");
    expectLine("zuzazon vugudol varuvel val hedarem.", "z-Uzazon | [v-cooking | v-run | v-and | h-haste]");
    expectLine("zuzazon vugudol vogadol val behalon huhavem.", "z-Uzazon | [v-cooking | v-eat | v-and | b-Ehalon | h-intensity]");
    expectLine("doradal vugudol vogadol val zuzazon.", "d-popcorn | [v-cooking | v-eat | v-and] | z-Uzazon");
  });

  it("keeps a /th/ word at the edge of the first item outside it, and one inside it in its bracket", () => {
    expectLine("zuzazon thovemom voworel varuvel val.", "z-Uzazon | th-doubt | [v-walk | v-run | v-and]");
    expectLine("zuzazon doradal thovemom vugudol vogadol val.", "z-Uzazon | [[d-popcorn | th-doubt | v-cooking] | v-eat | v-and]");
  });

  it("leaves a one-verb denial as it is", () => {
    expectLine("zuzazon doradal vanobol vul.", "z-Uzazon | d-popcorn | [v-see | v-not]");
  });

  it("takes an extra-noun hook into the item of the verb after it", () => {
    expectLine("zuzazon voworel ul b_9 varuvel val.", "z-Uzazon | [v-walk | [[from | b-_9] | v-run] | v-and]");
    expectLine("zuzazon voworel ul barl zolozun vuzevol.", "z-Uzazon | v-walk | [from | b-that-clause] | z-Olozun | v-sleep");
  });
});

describe("morphGlossLine — from … to", () => {
  it("reads ul X oel Y as one unit, wherever it sits", () => {
    expectLine("zuzazon ul b_9 oel b_17 voworel.", "z-Uzazon | [from | b-_9 | toward | b-_17] | v-walk");
    expectLine("zuzazon voworel varuvel val ul b_9 oel b_17.", "z-Uzazon | [v-walk | v-run | v-and] | [from | b-_9 | toward | b-_17]");
    expectLine("zuzazon voworel ul b_9 oel b_17 varuvel val.", "z-Uzazon | [v-walk | [[from | b-_9 | toward | b-_17] | v-run] | v-and]");
  });

  it("keeps the straddling form as two extra nouns", () => {
    expectLine("zuzazon ul b_9 voworel oel b_17.", "z-Uzazon | [from | b-_9] | v-walk | [toward | b-_17]");
  });
});
