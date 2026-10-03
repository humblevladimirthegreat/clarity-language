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

function expectLine(agazan: string, morph: string): void {
  assert.equal(morphGlossLine(agazan, tables), normalizeMorphLine(morph), agazan);
}

describe("morphGlossLine — clause joins go between clauses", () => {
  it("groups a switched join over the list before it", () => {
    expectLine(
      "zazawan vowogal xol zalahen varahal xal zahaben vezebal.",
      "[[z-Azawan | v-walk | x-or-exactly-one | z-Alahen | v-run] | x-and | z-Ahaben | v-sleep]",
    );
  });
  it("reads a sentence-initial join as linking the whole next sentence", () => {
    expectLine(
      "zazawan vowogal. xan zalahen varahal xol zahaben vezebal.",
      "z-Azawan | v-walk . x-and-then | [z-Alahen | v-run | x-or-exactly-one | z-Ahaben | v-sleep]",
    );
  });
  it("takes a standalone join as a stand-in clause item", () => {
    expectLine("zazawan vowogal xol xal.", "[z-Azawan | v-walk | x-or-exactly-one | x-none]");
    expectLine("xual ul zazawan vowogal.", "x-everything | except | z-Azawan | v-walk");
  });
  it("glosses a resume of a resume as the original referent", () => {
    expectLine(
      "zazawan thamal vowogal xon zazawar vezehel xon zazawar vezebal.",
      "[z-Azawan | th-plan-atlas | v-walk | x-or-else | z-←Azawan | v-sing | x-or-else | z-←Azawan | v-sleep]",
    );
  });
  it("glosses the sequence fallback after an attempt", () => {
    expectLine(
      "zazawan thudur vowogal xon zazawar vezehel.",
      "[z-Azawan | th-ATTEMPT-trial | v-walk | x-or-else | z-←Azawan | v-sing]",
    );
  });
});

describe("morphGlossLine — SHARED only where it can describe the join", () => {
  it("leaves an /h/ after a set noun join on the verb", () => {
    expectLine("zazawan zalahen zal hahegem vowogal.", "[z-Azawan | z-Alahen | z-and] | h-intensity | v-walk");
  });
  it("keeps an /h/ after a rank noun join as the scale", () => {
    expectLine("zazawan zalahen zel hahegem vowogal.", "[z-Azawan | z-Alahen | z-rank/more | h-intensity] | v-walk");
  });
  it("reads a /ɡ/ after a /ɡ/ join as the next item, so adjective lists nest", () => {
    expectLine(
      "zodogal geredal gamazam gul gelavam gal vowogal.",
      "[z-dog | [[g-red | g-small | g-not] | g-big | g-and]] | v-walk",
    );
  });
  it("leaves an /h/ after a /ɡ/ join on the verb", () => {
    expectLine("zodogal geredal gamazam gal hahegem vowogal.", "[z-dog | [g-red | g-small | g-and]] | h-intensity | v-walk");
  });
  it("reads al / ul between number endpoints as a span", () => {
    expectLine("zodogal grarel al graval vowogal.", "[z-dog | g-three] | through | g-five | v-walk");
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
    expectLine("zazawan uar zahaben vezebal.", "z-Azawan | some.strictly-between | z-Ahaben | v-sleep");
  });
});

describe("morphGlossLine — glosses.md single words", () => {
  it("senses-are-separate-roots table", () => {
    expectLine("zamagol", "z-microphone");
    expectLine("zamagom", "z-performance");
    expectLine("zamagon", "z-speaker");
    expectLine("gagawal", "g-quiet");
    expectLine("gagawam", "g-volume");
    expectLine("hevol", "h-fishing");
    expectLine("thevom", "th-WITNESSED");
    expectLine("gahazam", "g-home");
  });

  it("house-cast names and resumes", () => {
    expectLine("zazawan", "z-Azawan");
    expectLine("zalahen", "z-Alahen");
    expectLine("zahaben", "z-Ahaben");
    expectLine("zazawan. zazawar", "z-Azawan . z-←Azawan");
    expectLine("zalahen. zalaher", "z-Alahen . z-←Alahen");
    expectLine("zahaben. zahaber", "z-Ahaben . z-←Ahaben");
  });

  it("mid-word x families", () => {
    expectLine("ohuxaluden", "wish-x-guidance");
    expectLine("yabubaxazovan", "y-Abuba-x-Azovan");
    expectLine("zuzuhexagavexedehen", "z-Uzuhe-x-Agave-x-Edehen");
    expectLine("vowogaxel", "v-walk-unable-temporary");
    expectLine("thulothem", "th-competence-ought-offered");
    expectLine("zaxezeber", "z-agent-x-speech");
    expectLine("zaxavadal", "z-agent-x-fight");
    expectLine("zaxavadam", "z-agent-x-struggle");
    expectLine("zexezebal", "z-scene-x-sleep");
    expectLine("zoxezebel", "z-recipient-x-speech");
    expectLine("xrebul", "x-starting-with");
  });

  it("joins, revisers, numbers", () => {
    expectLine("zam", "z-and.open");
    expectLine("zal", "z-and");
    expectLine("vam", "v-and.open");
    expectLine("dol", "d-or-exactly-one");
    expectLine("zol", "z-or-exactly-one");
    expectLine("zel", "z-rank/more");
    expectLine("zael", "z-equal-rank");
    expectLine("zagadulx g=+ vehahel.", "[z-cat-x | g-some-amount] | v-sit");
    expectLine("yol zagadulx g=+ vehahel.", "y-question | [z-cat-x | g-how-many] | v-sit");
    expectLine("yol zazawan vehahel ol b=#.", "y-question | z-Azawan | v-sit | [at | b-which-place]");
    expectLine("zaem", "z-equal-rank.open");
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
    expectLine("zazawan vezebal al bahazal.", "z-Azawan | v-sleep | [in | b-house]");
    expectLine("zodogalx al zagadul.", "z-dog-x | including | z-cat");
    expectLine("zazawan ul bezedel vowogal oel bedehal.", "z-Azawan | [from | b-station] | v-walk | [toward | b-train]");
    expectLine("zazawan vezebal welavam al bahazal.", "z-Azawan | v-sleep | [[w-very | in] | b-house]");
    expectLine("zebedelx wal ul zazavul.", "z-plate-x | [w-never | except] | z-salad");
    expectLine("zazawan welavam humum badagul vowogal.", "z-Azawan | [[w-very | h-like] | b-duck] | v-walk");
    expectLine("hal", "h-never");
    expectLine("har", "h-sometimes");
    expectLine("yol zahaben vowogal har.", "y-question | z-Ahaben | v-walk | h-when");
    expectLine("zazawan vowogal herehel hal", "z-Azawan | v-walk | h-rain | h-only-when");
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

  it("glosses an ordinal pronoun by its place (glosses.md § Anaphors)", () => {
    expectLine("zazawan dalahen vahahal. zredur drewor vezebel.", "z-Azawan | d-Alahen | v-see . z-←2nd | d-←1st | v-tell");
    expectLine("zazawan vowogal. zruewor vezebal.", "z-Azawan | v-walk . z-←1st-from-end | v-sleep");
    expectLine("zazawan vowogal. zreworx vezebal.", "z-Azawan | v-walk . z-←1st-x | v-sleep");
  });

  it("scientific and percent number writing", () => {
    expectLine("g+27e12", "g-27e12");
    expectLine("g+25%", "g-25yo");
    expectLine("grarel", "g-three");
  });

  it("worked single-words table", () => {
    expectLine("yeweval", "y-greeting");
    expectLine("azawan.", "Azawan");
    expectLine("yalahexen", "y-Alahen-minutes");
    expectLine("yael", "y-yes");
    expectLine("yol", "y-question");
    expectLine("zehodon", "z-listener");
    expectLine("zahan", "z-interlocutors");
    expectLine("zamagonx", "z-speaker-x");
    expectLine("zehodonx", "z-listener-x");
    expectLine("thodom", "th-LIVE");
    expectLine("thamom", "th-RESIDUE");
    expectLine("thenom", "th-FORMER");
    expectLine("thamar", "th-plan-sketch");
    expectLine("gugol", "g-SAME");
  });

  it("fill-ask zar is z-who", () => {
    expectLine("yol zar vowogal", "y-question | z-who | v-walk");
  });

  it("stand-in glosses and hostless ABIL", () => {
    expectLine("darl", "d-that-clause");
    expectLine("dorl", "d-whether-clause");
    expectLine("derl", "d-to-clause");
    expectLine("durl", "d-lest-clause");
    expectLine("darm", "d-that-clause.open");
    expectLine("thezexel", "th-ABIL-unable-temporary");
  });

  it("lexicon senses use packed role English when present", () => {
    expectLine("vehahel", "v-sit");
    expectLine("vahahal", "v-see");
    expectLine("vezebel", "v-tell");
    expectLine("vedabal", "v-departure");
    expectLine("welavam", "w-very");
    expectLine("gelavam", "g-big");
    expectLine("al bahazal", "[in | b-house]");
    expectLine("ael bahavol", "[using | b-hammer]");
    expectLine("humum", "h-like");
    expectLine("gumum", "g-like");
    expectLine("gobom", "g-part-of");
    expectLine("gahem", "g-contents");
    expectLine("guwum", "g-material");
    expectLine("gagum", "g-origin");
    expectLine("hazam", "h-between");
    expectLine("zahahal", "z-eye");
    expectLine("hahehol", "h-hash");
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
      "yael zamagon zam zehodon zal gezebul.",
      "y-yes | [[z-speaker | z-and.open] | z-listener | z-and | g-sleepy]",
    );
  });

  it("ability + value motive", () => {
    expectLine(
      "yuel zamagon vowogaxel thulothom.",
      "y-no | z-speaker | v-walk-unable-temporary | th-competence-motive-any-term",
    );
  });

  it("numbered alternative + unmet pleasure", () => {
    expectLine(
      "xrebul zehegom grewol zamagonx thozothur.",
      "x-starting-with | [z-problem | g-1st] | z-speaker-x | th-pleasure-unmet-passing",
    );
  });

  it("literal key is not ideation solution", () => {
    expectLine("zegehul wezexel.", "z-key | w-ABIL-unable-temporary");
  });

  it("inclusive we", () => {
    expectLine(
      "yael xodum zahan thamar vowogal vul.",
      "y-yes | x-therefore | z-interlocutors | th-plan-sketch | [v-walk | v-not]",
    );
  });

  it("resume with in-text antecedent", () => {
    expectLine(
      "yohuxazovan. xezom zohuxazovar thevom zerehel.",
      "y-Ohu-x-Azovan . x-however | z-←Ohu-x-Azovan | th-WITNESSED | z-rain",
    );
  });
});

describe("morphGlossLine — act -r and linker endings", () => {
  it("act words with -r are just formed or for now", () => {
    expectLine("yar zazawan vowogal.", "y-provisional-statement | z-Azawan | v-walk");
    expectLine("yor zazawan vowogal.", "y-working-question | z-Azawan | v-walk");
    expectLine("yer vowogal.", "y-command-for-now | v-walk");
    expectLine("yur vowogal.", "y-hold-off | v-walk");
  });

  it("linkers default to -m; -l is the firm link where taught", () => {
    expectLine("xezom zazawan vowogal.", "x-however | z-Azawan | v-walk");
    expectLine("xezol zazawan vowogal.", "x-nevertheless | z-Azawan | v-walk");
    expectLine("xodul zazawan vowogal.", "x-it-follows | z-Azawan | v-walk");
    expectLine("xagezal zazawan vowogal.", "x-on-the-contrary | z-Azawan | v-walk");
  });
});

describe("morphGlossLine — restrictor -r vs -l", () => {
  it("har is sometimes / when, not never", () => {
    expectLine("hal", "h-never");
    expectLine("zalahen vowogal hal.", "z-Alahen | v-walk | h-never");
    expectLine("har", "h-sometimes");
    expectLine("zalahen varahal har.", "z-Alahen | v-run | h-sometimes");
    expectLine("yol zahaben vowogal har.", "y-question | z-Ahaben | v-walk | h-when");
  });
});

describe("compareMorphGloss", () => {
  it("passes an equal pair", () => {
    const result = compareMorphGloss("zazawan godogal.", "z-Azawan | g-dog", tables);
    assert.equal(result.ok, true);
    assert.equal(result.expected, "z-Azawan | g-dog");
    assert.equal(result.actual, "z-Azawan | g-dog");
  });

  it("fails a sense mismatch with expected/actual", () => {
    const result = compareMorphGloss("zamagon", "z-microphone", tables);
    assert.equal(result.ok, false);
    assert.equal(result.expected, "z-microphone");
    assert.equal(result.actual, "z-speaker");
    assert.equal(result.parseError, undefined);
  });

  it("fails unparseable Agazan as parse, not gloss mismatch", () => {
    const result = compareMorphGloss("z!!!", "z-nope", tables);
    assert.equal(result.ok, false);
    assert.ok(result.parseError);
  });

  it("emits scope island edges in morph gloss", () => {
    expectLine(
      "zazawan { hegewem zodogal geredal } vahahal",
      "z-Azawan | SCOPE[h-possibility | [z-dog | g-red]] | v-see",
    );
  });

  it("a mention is a marker word plus the span, and the span's interior stays as written", () => {
    expectLine("glelel z<odoga> gamazam", '[gl-MENTION | z-OPAQUE["odoga"]] | g-small');
    expectLine("glelel z<zazawan vezehel> gamazam", '[gl-MENTION | z-OPAQUE["zazawan vezehel"]] | g-small');
    expectLine("glelen d<onodan> vogozam", '[gl-NAME.MENTION | d-OPAQUE["onodan"]] | v-rejection');
    expectLine("zazawan d@[onodan alahen] vogozam", "z-Azawan | d-NAME.CITE[Onodan | Alahen] | v-rejection");
  });

  it("glosses -ln and ^@ as the name plus .instance (word-endings.md#name-instance--ln)", () => {
    expectLine("zalahen dazawaln vahahal", "z-Alahen | d-Azawan.instance | v-see");
    expectLine("zalahen dazawalnx vahahal", "z-Alahen | d-Azawan.instance-x | v-see");
    expectLine("zalahen d^@<iPhone> vahahal", 'z-Alahen | d-NAME.OPAQUE.instance["iPhone"] | v-see');
  });

  it("the mention marker's spelling is the ordinary adjective anywhere but before a span", () => {
    expectLine("glelel zodogal vowogal", "[gl-letters | z-dog] | v-walk");
  });

  it("ordinary -l on a sake host root uses literal sense, not sake overlay", () => {
    expectLine("zazawan ganal balahen", "z-Azawan | [g-knot | b-Alahen]");
  });

  it("morphRedundantWithLoose allows single-word citation skips", () => {
    assert.equal(morphRedundantWithLoose("azawal", "swan", tables), true);
    assert.equal(morphRedundantWithLoose("azawan.", '"Azawan."', tables), true);
    assert.equal(morphRedundantWithLoose("zazawan vehahel.", "Azawan sits.", tables), false);
    assert.equal(morphRedundantWithLoose("z!!!", "nope", tables), false);
  });

  it("extractTeachBlocks finds morph after a name line and loose quotes", () => {
    const md = `> \`azawan.\`
>
> Azawan
>
> "Azawan." (hello — the speaker is Azawan)
`;
    const [block] = extractTeachBlocks(md);
    assert.ok(block);
    assert.equal(block!.agazan, "azawan.");
    assert.equal(block!.morph, "Azawan");
    assert.equal(block!.loose, "Azawan.");
  });

  it("extractTeachBlocks allows omitted morph when only loose follows", () => {
    const md = `> \`azawal\`
>
> "swan"
`;
    const [block] = extractTeachBlocks(md);
    assert.ok(block);
    assert.equal(block!.morph, null);
    assert.equal(block!.loose, "swan");
  });

  it("extractTeachBlocks splits blockquotes separated by a blank line", () => {
    const md = `> \`yel vowogal.\`
>
> y-command | v-walk
>
> "Walk."

> \`! zazawan vowogal.\`
>
> ! | z-Azawan | v-walk
>
> "Azawan walks!"
`;
    const blocks = extractTeachBlocks(md);
    assert.equal(blocks.length, 2);
    assert.equal(blocks[1]!.agazan, "! zazawan vowogal.");
    assert.equal(blocks[1]!.morph, "! | z-Azawan | v-walk");
    assert.equal(blocks[1]!.loose, "Azawan walks!");
  });

  it("round-trips the yael census example block", () => {
    const md = `> \`yael zamagon zam zehodon zal gezebul.\`
>
> y-yes | [[z-speaker | z-and.open] | z-listener | z-and | g-sleepy]
>
> "Yes — you and I are sleepy."
`;
    const [pair] = extractExampleBlocks(md);
    assert.ok(pair);
    const result = compareMorphGloss(pair!.agazan, pair!.morph, tables);
    assert.equal(result.ok, true, `${result.expected} vs ${result.actual}`);
  });

  it("values bake stance and ending grain", () => {
    expectLine("zebel ganathal", "z-present | g-relatedness-met-lasting");
    expectLine("zabezam wahuthur gobum", "z-gathering | [w-autonomy-unmet-passing | g-stimulus]");
    expectLine("zezebel wulothuraor gobum", "z-speech | [w-competence-unmet-passing-CIRCUM-SURGING | g-stimulus]");
    expectLine("zebeyom gulothamar", "z-draft | g-competence-met-any-term-INTERNAL-SURGING");
    expectLine("zumel wanathumuer gobum", "z-memo | [w-relatedness-unmet-modifiable-RESISTING-SURGING | g-stimulus]");
    expectLine("ganathaluom", "g-relatedness-met-lasting-UNPLACED-FLOWING");
  });

  it("span interiors: cite and aside gloss English; an opaque interior passes through", () => {
    expectLine("zazawan vowogal th(hagawal)", "z-Azawan | v-walk | th-ASIDE[h-quiet]");
    expectLine("yul zalahen v[vazadal]", "y-prohibition | z-Alahen | v-CITE[v-stop]");
    expectLine(
      "zazawan vowogal th(zalahen vezebal)",
      "z-Azawan | v-walk | th-ASIDE[z-Alahen | v-sleep]",
    );
    expectLine("x@<Sam> zozan vowogal", 'x-NAME.OPAQUE["Sam"] | z-TOPIC | v-walk');
    expectLine("glelel x<odoga> zozan gamazam", '[gl-MENTION | x-OPAQUE["odoga"]] | z-TOPIC | g-small');
  });

  it("viewpoint laterals keep compass on DIR", () => {
    expectLine("yel vowogal hewezathazawan", "y-command | v-walk | h-west-th-Azawan");
  });

  it("a holder seam glosses its host overlay and the holder", () => {
    expectLine("zalahen thunemazawan vedabal", "z-Alahen | th-INFERRED-Azawan | v-departure");
    expectLine("zalahen thewarazawan vedabal", "z-Alahen | th-TOLD.weak-Azawan | v-departure");
    expectLine("zalahen thovulazawan vedabal", "z-Alahen | th-MAY-find-out-Azawan | v-departure");
    expectLine("zalahen thavomazawan vedabal", "z-Alahen | th-NOTIONAL-Azawan | v-departure");
  });

  it("a holder takes resume -r and associative -x like any noun", () => {
    expectLine(
      "zazawan vedabal. zalahen thunemazawar vehahel.",
      "z-Azawan | v-departure . z-Alahen | th-INFERRED-←Azawan | v-sit",
    );
    expectLine("zalahen thunemazawanx vedabal", "z-Alahen | th-INFERRED-Azawan-x | v-departure");
  });

  it("a hook + /b/ after a landmark describes that landmark; after a recipient it is same-role", () => {
    expectLine("zehodon al bahedem om bamagon vohal", "z-listener | [in | [b-locality | [near | b-speaker]]] | v-hatch");
    expectLine("zazawan vadazel hugem bavahel om bamagon", "z-Azawan | v-dance | [h-around | [b-fire | [near | b-speaker]]]");
    expectLine("zazawan balahen al bahaben vezebel", "z-Azawan | b-Alahen | including | b-Ahaben | v-tell");
  });

  it("em + /b/ goes inside the bracket of the noun on its left", () => {
    expectLine("zodogal gelavam em bamagon", "[z-dog | g-big | [used-by | b-speaker]]");
    expectLine("zodogal em bamagon gelavam", "[z-dog | [used-by | [b-speaker | g-big]]]");
    expectLine("zodogal gelavam al bahedem em bamagon", "[z-dog | g-big] | [in | [b-locality | [used-by | b-speaker]]]");
    expectLine("zazawan balahen em bamagon vezebel", "z-Azawan | b-Alahen | rather.open | b-speaker | v-tell");
  });

  it("label scope glosses its seam vowel", () => {
    expectLine("zalahen ganegethal", "z-Alahen | g-angry-th-once");
    expectLine("zazawan valahathel", "z-Azawan | v-lie-th-pattern");
    expectLine("zalahen ganagothul", "z-Alahen | g-anxious-th-name-only");
  });

  it("a tho verb hosts the /b/ right after it", () => {
    expectLine("zazawan valahathol balahen", "z-Azawan | [v-lie-th-relative | b-Alahen]");
  });

  it("house-cast resume without a same-line antecedent", () => {
    expectLine("zazawarx vehahel", "z-←Azawan-x | v-sit");
  });

  it("role pointers gloss their role and event, not the referent", () => {
    expectLine("zazawan vowogal. zaxar vehahel", "z-Azawan | v-walk . z-←agent.same | v-sit");
    expectLine("zazawan vahahal daxer", "z-Azawan | v-see | d-←agent.self");
    expectLine("zazawan vowogal. zaexarx vehahel", "z-Azawan | v-walk . z-←instrument.same-x | v-sit");
    expectLine("zazawan vowogal. zalahen thunemaxar vedabal", "z-Azawan | v-walk . z-Alahen | th-INFERRED-←agent.same | v-departure");
  });

  it("quasi numeric derivation is English", () => {
    expectLine("zahaben ganalobelrubul", "z-Ahaben | g-friend-l-quasi");
  });

  it("abstract numeric join is -m in the gloss", () => {
    expectLine("zalavamrabal", "z-love-m-infinity");
  });
});

describe("morphGlossLine — extra fixtures", () => {
  it("round-trips glosses.md example blocks that include their antecedents", () => {
    const glosses = readFileSync(join(rootDir, "docs", "meta", "glosses.md"), "utf8");
    const pairs = extractExampleBlocks(glosses);
    assert.ok(pairs.length >= 6);
    for (const pair of pairs) {
      if (pair.morph.includes("←")) continue;
      const result = compareMorphGloss(pair.agazan, pair.morph, tables);
      assert.equal(
        result.ok,
        true,
        `${pair.agazan} → documented ${pair.morph} vs parser ${result.actual}${result.parseError ? ` (${result.parseError})` : ""}`,
      );
    }
  });
});

describe("morphGlossLine — th stance letter", () => {
  it("glosses stance moods, /w/ on th, and th poles with stand-ins", () => {
    expectLine("thovum zazawan vehahel.", "th-MAY | z-Azawan | v-sit");
    expectLine("zazawan wezebul thodom vahahal ahahalul.", "z-Azawan | [w-sleepy | th-LIVE] | v-see | eye-leave");
    expectLine("thevem barl zazawan vehahel.", "[th-because | b-that-clause] | z-Azawan | v-sit");
    expectLine("thunem barl zazawan vehahel.", "[th-INFERRED | b-that-clause] | z-Azawan | v-sit");
    expectLine("thobal bral barl zazawan vehahel.", "[th-PATTERN.strong | [b-later | b-that-clause]] | z-Azawan | v-sit");
    expectLine("zazawan vehahel th(zalahen vowogal).", "z-Azawan | v-sit | th-ASIDE[z-Alahen | v-walk]");
  });

  it("keeps time poles and restrictors on /h/", () => {
    assert.match(morphGlossLine("habam barl zazawan vehahel.", tables), /^\[h-before/);
  });
});

describe("morphGlossLine — stance joins and emphatic prohibition", () => {
  it("glosses /th/ join fences", () => {
    expectLine("zazawan vowogal thevom thul.", "z-Azawan | v-walk | th-WITNESSED | th-not");
    expectLine("zazawan vowogal thevem balahen thul.", "z-Azawan | v-walk | [th-because | b-Alahen] | th-not");
  });

  it("glosses yul yul", () => {
    expectLine("yul yul vezevul.", "y-prohibition | y-prohibition | v-sneak");
  });
});

describe("morphGlossLine — tone marks", () => {
  it("copies attached and free-standing marks", () => {
    expectLine("zazawan vahahal ?dodogal.", "z-Azawan | v-see | ?d-dog");
    expectLine("! zazawan vowogal.", "! | z-Azawan | v-walk");
    expectLine("zazawan vahahal &dodogal.", "z-Azawan | v-see | &d-dog");
    expectLine("zazawan ; vowogal.", "z-Azawan | ; | v-walk");
    expectLine("%zazawan vowogal.", "%z-Azawan | v-walk");
  });
});

describe("morphGlossLine — standalone joins", () => {
  it("standalone reads none / everything; items keep list readings", () => {
    expectLine("zal vowogal.", "z-none | v-walk");
    expectLine("zam vowogal.", "z-none.open | v-walk");
    expectLine("zual vowogal.", "z-everything | v-walk");
    expectLine("zazawan vowogal ol bual.", "z-Azawan | v-walk | [at | b-everything]");
    expectLine("zazawan vahahal dal.", "z-Azawan | v-see | d-none");
    expectLine("zazawan zual vowogal.", "[z-Azawan | z-everything-but] | v-walk");
    expectLine("zazawan zalahen zal vowogal.", "[z-Azawan | z-Alahen | z-and] | v-walk");
  });
});

describe("morphGlossLine — kind reference", () => {
  it("zuan + shared kind reads the kind itself", () => {
    expectLine("zuan gagadul gezebul.", "[z-the-kind | g-cat] | g-sleepy");
    expectLine("zazawan duan gagadul vahahal.", "z-Azawan | [d-the-kind | g-cat] | v-see");
  });
});

describe("morphGlossLine — word position, not spelling", () => {
  it("does not read an in-clause hook as discourse because an earlier sentence opened with the same spelling", () => {
    const line = morphGlossLine("al zazawan vowogal. zazawan al zalahen zal vowogal.", tables);
    const second = line.split(" . ")[1] ?? "";
    assert.ok(!second.includes("additionally"), line);
  });
});

describe("morphGlossLine — topic and generic pronouns", () => {
  it("glosses the topic pronoun and its topic word", () => {
    expectLine(
      "xazawan zozan dalahen vahahal. zrewor dozan vezebel.",
      "x-Azawan | z-TOPIC | d-Alahen | v-see . z-←1st | d-TOPIC | v-tell",
    );
    expectLine("xazawanx zozanx vehahel.", "x-Azawan-x | z-TOPIC-x | v-sit");
    expectLine("xazawar zozan vehahel.", "x-←Azawan | z-TOPIC | v-sit");
  });
  it("glosses the generic pronoun, and either one as a holder", () => {
    expectLine("zoben vezebal.", "z-ONE | v-sleep");
    expectLine("xazawan thunemozan zalahen vedabal.", "x-Azawan | th-INFERRED-TOPIC | z-Alahen | v-departure");
    expectLine("thunemoben zalahen vedabal.", "th-INFERRED-ONE | z-Alahen | v-departure");
  });
  it("keeps the star and person roots ordinary on other endings", () => {
    expectLine("zozal vowogal.", "z-star | v-walk");
    expectLine("zobel vowogal.", "z-person | v-walk");
  });
  it("glosses a topic word with its own hooks, and the clearing linkers", () => {
    expectLine("xodogal em bazawan zalahen vahahal.", "x-dog | [used-by | b-Azawan] | z-Alahen | v-see");
    expectLine("xevavem zazawan vowogal.", "x-next | z-Azawan | v-walk");
    expectLine("hahehom bazawan zalahen vowogal.", "[h-as-for | b-Azawan] | z-Alahen | v-walk");
  });
});

describe("morphGlossLine — flag rows", () => {
  it("glosses -l as the flag, -n as the nativized name, -m as the demonym", () => {
    expectLine("zalahen vahahal dahebal.", "z-Alahen | v-see | d-japan-flag");
    expectLine("zalahen vahahal daheban.", "z-Alahen | v-see | d-Aheban");
    expectLine("zalahen gahebam.", "z-Alahen | g-japanese");
  });
});
