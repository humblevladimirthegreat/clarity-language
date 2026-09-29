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
      "zazawan thumal vowogal xon zazar vezehel xon zazar vezebal.",
      "[z-Azawan | th-plan-atlas | v-walk | x-or-else | z-←Azawan | v-sing | x-or-else | z-←Azawan | v-sleep]",
    );
  });
  it("glosses the sequence fallback after an attempt", () => {
    expectLine(
      "zazawan thudor vowogal xon zazar vezehel.",
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
    expectLine("zamegul", "z-microphone");
    expectLine("zamegum", "z-performance");
    expectLine("zamegun", "z-speaker");
    expectLine("gazahal", "g-smile");
    expectLine("gazaham", "g-happy");
    expectLine("hunol", "h-fishing");
    expectLine("thunom", "th-WITNESSED");
    expectLine("gahazam", "g-home");
  });

  it("house-cast names and resumes", () => {
    expectLine("zazawan", "z-Azawan");
    expectLine("zalahen", "z-Alahen");
    expectLine("zahaben", "z-Ahaben");
    expectLine("zazawan. zazar", "z-Azawan . z-←Azawan");
    expectLine("zalahen. zalar", "z-Alahen . z-←Alahen");
    expectLine("zahaben. zahar", "z-Ahaben . z-←Ahaben");
  });

  it("mid-word x families", () => {
    expectLine("uhudexaloden", "wish-x-guidance");
    expectLine("yabebuxazovan", "y-Abebu-x-Azovan");
    expectLine("zuzuhexagavexedehen", "z-Uzuhe-x-Agave-x-Edehen");
    expectLine("vowogaxel", "v-walk-unable-temporary");
    expectLine("thuduthem", "th-competence-ought-offered");
    expectLine("zaxezeber", "z-agent-x-speech");
    expectLine("zaxavadal", "z-agent-x-fight");
    expectLine("zaxavadam", "z-agent-x-struggle");
    expectLine("zexezebal", "z-scene-x-sleep");
    expectLine("zoxezebel", "z-recipient-x-speech");
    expectLine("thexal", "th-ASIDE.multi[]");
    expectLine("xuxul", "x-span-close");
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
    expectLine("zagadalx g=+ vehahel.", "[z-cat-x | g-some-amount] | v-sit");
    expectLine("yol zagadalx g=+ vehahel.", "y-question | [z-cat-x | g-how-many] | v-sit");
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
    expectLine("zodogalx al zagadal.", "z-dog-x | including | z-cat");
    expectLine("zazawan ul bezedel vowogal oel bedehal.", "z-Azawan | [from | b-station] | v-walk | [toward | b-train]");
    expectLine("zazawan vezebal welavam al bahazal.", "z-Azawan | v-sleep | [[w-very | in] | b-house]");
    expectLine("zebedelx wal ul zazavul.", "z-plate-x | [w-never | except] | z-salad");
    expectLine("zazawan welavam homem badagul vowogal.", "z-Azawan | [[w-very | h-like] | b-duck] | v-walk");
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
    expectLine("zohan", "z-interlocutors");
    expectLine("zamegunx", "z-speaker-x");
    expectLine("zehodonx", "z-listener-x");
    expectLine("thodum", "th-LIVE");
    expectLine("thamom", "th-RESIDUE");
    expectLine("thunem", "th-FORMER");
    expectLine("thumar", "th-plan-sketch");
    expectLine("gogal", "g-SAME");
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
    expectLine("vadebal", "v-departure");
    expectLine("welavam", "w-very");
    expectLine("gelavam", "g-big");
    expectLine("al bahazal", "in | b-house");
    expectLine("ael bahavel", "using | b-hammer");
    expectLine("homem", "h-like");
    expectLine("gomem", "g-like");
    expectLine("gabom", "g-part-of");
    expectLine("gaham", "g-contents");
    expectLine("guwam", "g-material");
    expectLine("gagum", "g-origin");
    expectLine("hozam", "h-between");
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
      "yael zamegun zam zehodon zal gazaham.",
      "y-yes | [[z-speaker | z-and.open] | z-listener | z-and | g-happy]",
    );
  });

  it("ability + value motive", () => {
    expectLine(
      "yuel zamegun vowogaxel thuduthom.",
      "y-no | z-speaker | v-walk-unable-temporary | th-competence-motive-any-term",
    );
  });

  it("numbered alternative + unmet pleasure", () => {
    expectLine(
      "xrebul zehegom grewol zamegunx thozuthur.",
      "x-starting-with | [z-problem | g-1st] | z-speaker-x | th-pleasure-unmet-passing",
    );
  });

  it("literal key is not ideation solution", () => {
    expectLine("zegehul wezexel.", "z-key | w-ABIL-unable-temporary");
  });

  it("inclusive we", () => {
    expectLine(
      "yael xezadam zohan thumar vowogal vul.",
      "y-yes | x-therefore | z-interlocutors | th-plan-sketch | [v-walk | v-not]",
    );
  });

  it("resume with in-text antecedent", () => {
    expectLine(
      "yuhudexazovan. xazel zuhur thunom zerehel.",
      "y-Uhude-x-Azovan . x-however | z-←Uhude-x-Azovan | th-WITNESSED | z-rain",
    );
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
    const result = compareMorphGloss("zamegun", "z-microphone", tables);
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
      "zazawan ^ hegewem zodogal geredal ^ vahahal",
      "z-Azawan | SCOPE[h-possibility | [z-dog | g-red]] | v-see",
    );
  });

  it("mentions pass through the form, not the English lemma", () => {
    expectLine("z{odoga} gamazam", "z-MENTION[\"odoga\"] | g-small");
    expectLine("zoxol odogal gamazam", "z-MENTION.atomic[\"odogal\"] | g-small");
    expectLine(
      "z{zazawan vezehel} gamazam",
      "z-MENTION[\"zazawan vezehel\"] | g-small",
    );
    expectLine(
      "zazawan d@[onodan alahen] vogozam",
      "z-Azawan | d-NAME.CITE[Onodan | Alahen] | v-rejection",
    );
    expectLine(
      "zazawan d@{onodan} vogozam",
      "z-Azawan | d-NAME.MENTION[\"onodan\"] | v-rejection",
    );
  });

  it("ordinary -l on a sake host root uses literal sense, not sake overlay", () => {
    expectLine("zazawan gonal balahen", "z-Azawan | [g-knot | b-Alahen]");
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
    const md = `> \`yael zamegun zam zehodon zal gazaham.\`
>
> y-yes | [[z-speaker | z-and.open] | z-listener | z-and | g-happy]
>
> "Yes — you and I are happy."
`;
    const [pair] = extractExampleBlocks(md);
    assert.ok(pair);
    const result = compareMorphGloss(pair!.agazan, pair!.morph, tables);
    assert.equal(result.ok, true, `${result.expected} vs ${result.actual}`);
  });

  it("values bake stance and ending grain", () => {
    expectLine("zebezol gonathal", "z-present | g-relatedness-met-lasting");
    expectLine("zabezum wabathur gobom", "z-gathering | [w-autonomy-unmet-passing | g-stimulus]");
    expectLine("zezebel wuduthuraor gobom", "z-speech | [w-competence-unmet-passing-CIRCUM-SURGING | g-stimulus]");
    expectLine("zebeyum guduthamar", "z-draft | g-competence-met-any-term-INTERNAL-SURGING");
    expectLine("zemehol wonathumuer gobom", "z-memo | [w-relatedness-unmet-modifiable-RESISTING-SURGING | g-stimulus]");
    expectLine("gonathaluom", "g-relatedness-met-lasting-UNPLACED-FLOWING");
  });

  it("span interiors: cite and aside gloss English; mention passes through", () => {
    expectLine("zazawan vowogal th(hazaham)", "z-Azawan | v-walk | th-ASIDE[h-happy]");
    expectLine("yul zalahen v[vazadal]", "y-prohibition | z-Alahen | v-CITE[v-stop]");
    expectLine(
      "zazawan vowogal th(zalahen vezebal)",
      "z-Azawan | v-walk | th-ASIDE[z-Alahen | v-sleep]",
    );
    expectLine("zalahen daxol ahahol vezebel", "z-Alahen | d-CITE.atomic[judge] | v-tell");
  });

  it("viewpoint laterals keep compass on DIR", () => {
    expectLine("yel vowogal hewezathazawan", "y-command | v-walk | h-west-th-Azawan");
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
    expectLine("zazawarx vehahel", "z-←Azawan.full-x | v-sit");
  });

  it("quasi numeric derivation is English", () => {
    expectLine("zahaben gonalebezalrubul", "z-Ahaben | g-friend-l-quasi");
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
    expectLine("thovom zazawan vehahel.", "th-MAY | z-Azawan | v-sit");
    expectLine("zazawan wazaham thodum vahahal ahahalul.", "z-Azawan | [w-happy | th-LIVE] | v-see | eye-leave");
    expectLine("theram barl zazawan vehahel.", "[th-because | b-that-clause] | z-Azawan | v-sit");
    expectLine("thexal zazawan vehahel xuxul.", "th-ASIDE.multi[z-Azawan | v-sit]");
  });

  it("keeps time poles and restrictors on /h/", () => {
    assert.match(morphGlossLine("habum barl zazawan vehahel.", tables), /^\[h-before/);
  });
});

describe("morphGlossLine — stance joins and emphatic prohibition", () => {
  it("glosses /th/ join fences", () => {
    expectLine("zazawan vowogal thunom thul.", "z-Azawan | v-walk | th-WITNESSED | th-not");
    expectLine("zazawan vowogal theram balahen thul.", "z-Azawan | v-walk | [th-because | b-Alahen] | th-not");
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
