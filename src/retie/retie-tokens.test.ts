import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { loadDefaultTables } from "../parse/index.js";
import { rewriteMarkdown } from "./markdown.js";
import { headingIdRenames, relinkMarkdown, relinkOverlayAnchors } from "./anchors.js";
import {
  buildRootMap,
  checkMapCollisions,
  parseRetieMapJson,
  serializeRetieMap,
  unreadableOldRoots,
  type RetiePair,
} from "./map.js";
import { rewriteSourceLiterals, sourceLiterals } from "./source.js";
import { rewriteParsedWord } from "./rebuild.js";
import { parseWord } from "../parse/word.js";
import { lineNumberAt, peelChunk, retieCore } from "./tokens.js";
import { retieTables as bridgeTables } from "./tables.js";
import { verifyRetiedSpans } from "./verify.js";

function mapOf(...pairs: [string, string][]): Map<string, string> {
  return new Map(pairs);
}

describe("retie map", () => {
  it("drops unchanged pairs and rejects conflicting old roots", () => {
    const pairs: RetiePair[] = [
      { emoji: "🎣", literal: "fishing", oldRoot: "uhunu", newRoot: "uvuvu" },
      { emoji: "🎣", literal: "fishing", oldRoot: "uhunu", newRoot: "uvuvu" },
      { emoji: "", literal: "same", oldRoot: "azawa", newRoot: "azawa" },
    ];
    const json = serializeRetieMap(pairs, "2026-01-01T00:00:00.000Z");
    assert.equal(JSON.parse(json).pairs.length, 1);
    assert.deepEqual([...parseRetieMapJson(json).entries()], [["uhunu", "uvuvu"]]);

    assert.throws(
      () =>
        buildRootMap([
          { emoji: "", literal: "a", oldRoot: "uhunu", newRoot: "uvuvu" },
          { emoji: "", literal: "b", oldRoot: "uhunu", newRoot: "aaaaa" },
        ]),
      /Conflicting retie map/,
    );
  });
});

describe("retieCore — English substrings stay", () => {
  it("does not rewrite the / level / ahead / whatever / method", () => {
    const map = mapOf(["he", "ehere"], ["ev", "edegu"], ["odo", "adoro"]);
    assert.equal(retieCore("the", map), null);
    assert.equal(retieCore("level", map), null);
    assert.equal(retieCore("ahead", map), null);
    assert.equal(retieCore("whatever", map), null);
    assert.equal(retieCore("method", map), null);
  });
});

describe("retieCore — Agazan tokens", () => {
  it("rewrites overlay thuhunum and citation thodom from root fields", () => {
    const map = mapOf(["uhunu", "uvuvu"], ["odo", "adoro"]);
    assert.equal(retieCore("thuhunum", map), "thuvuvum");
    assert.equal(retieCore("thodom", map), "thadorom");
  });

  it("rewrites a mapped bare root that parseWord rejects (no ending)", () => {
    const map = mapOf(["adoro", "badoro"]);
    assert.equal(retieCore("adoro", map), "badoro");
  });

  it("rewrites PoS plus bare root with no ending", () => {
    const map = mapOf(["owora", "emaba"]);
    assert.equal(retieCore("thowora", map), "themaba");
  });

  it("rewrites an isolated resume whose root is mapped", () => {
    const map = mapOf(["uhu", "edeme"]);
    assert.equal(retieCore("zuhur", map), "zedemer");
  });

  it("rewrites a role compound host", () => {
    const map = mapOf(["edege", "uzunu"]);
    assert.equal(retieCore("gaxedegel", map), "gaxuzunul");
  });

  it("leaves join markers and revisers alone", () => {
    const map = mapOf(["al", "xxxx"], ["a", "e"]);
    assert.equal(retieCore("yol", map), null);
    assert.equal(retieCore("al", map), null);
    assert.equal(retieCore("on", map), null);
  });
});

describe("rewriteMarkdown mixed English", () => {
  it("reties backtick and bold-code forms beside English", () => {
    const map = mapOf(["uhunu", "uvuvu"], ["adoro", "badoro"]);
    const input = "the level ahead of whatever sees `thuhunum` and **`adoro`**.";
    const { text, changes } = rewriteMarkdown(input, map);
    assert.equal(text, "the level ahead of whatever sees `thuvuvum` and **`badoro`**.");
    assert.deepEqual(
      changes.map((c) => `${c.from}→${c.to}`),
      ["thuhunum→thuvuvum", "adoro→badoro"],
    );
  });

  it("reties inside a multi-word code span and keeps yol", () => {
    const map = mapOf(["azawa", "ululo"]);
    const input = "English then `yol zazawan vawalal.` still English.";
    const { text } = rewriteMarkdown(input, map);
    assert.equal(text, "English then `yol zululon vawalal.` still English.");
  });

  it("does not retie link targets", () => {
    const map = mapOf(["adoro", "badoro"]);
    const input = "see [`adoro`](adoro.md) please";
    const { text } = rewriteMarkdown(input, map);
    assert.equal(text, "see [`badoro`](adoro.md) please");
  });

  it("peels wrapping backticks", () => {
    assert.deepEqual(peelChunk("`zazawanx`"), { prefix: "`", core: "zazawanx", suffix: "`" });
  });

  it("peels punctuation on hodom", () => {
    const map = mapOf(["odo", "adoro"]);
    assert.deepEqual(peelChunk("(hodom)."), { prefix: "(", core: "hodom", suffix: ")." });
    const { text } = rewriteMarkdown("call `(hodom).`", map);
    assert.equal(text, "call `(hadorom).`");
  });

  it("does not peel writing-span brackets", () => {
    assert.deepEqual(peelChunk("d[azawan]"), { prefix: "", core: "d[azawan]", suffix: "" });
    assert.deepEqual(peelChunk("d[azawan]."), { prefix: "", core: "d[azawan]", suffix: "." });
    assert.deepEqual(peelChunk("d<sushi>"), { prefix: "", core: "d<sushi>", suffix: "" });
  });

  it("reties fenced code without eating the closer", () => {
    const map = mapOf(["azawa", "ululo"]);
    const input = "before\n```\nzazawan\n```\nafter\n";
    const { text } = rewriteMarkdown(input, map);
    assert.equal(text, "before\n```\nzululon\n```\nafter\n");
  });
});

describe("rebuild round-trip", () => {
  it("rebuilds content and x families from parseWord", () => {
    const map = mapOf(["azawa", "ululo"], ["uzuzu", "azaza"], ["olove", "eleve"]);
    const word = parseWord("zazawan");
    assert.equal(rewriteParsedWord(word, map), "zululon");
    assert.equal(rewriteParsedWord(parseWord("zuzuzuxogoven"), map), "zazazaxogoven");
    assert.equal(rewriteParsedWord(parseWord("zolovelrabal"), map), "zelevelrabal");
    assert.equal(rewriteParsedWord(parseWord("zazawanx"), map), "zululonx");
  });
});

describe("writing spans", () => {
  const map = mapOf(["azawa", "ululo"], ["uzunu", "ababa"], ["uwuru", "oworo"]);

  it("reties a one-word cite in backticks", () => {
    const { text, changes } = rewriteMarkdown("see `d[azawan]` please", map);
    assert.equal(text, "see `d[ululon]` please");
    assert.deepEqual(
      changes.map((c) => `${c.from}→${c.to}`),
      ["d[azawan]→d[ululon]"],
    );
  });

  it("reties multi-word interiors and keeps the fence", () => {
    const { text } = rewriteMarkdown("quote `d~[zazawan vuzunul]` here", map);
    assert.equal(text, "quote `d~[zululon vababal]` here");
  });

  it("leaves resume and opaque payloads", () => {
    const { text } = rewriteMarkdown("`d[=]` and `d<sushi>` and `d@[Hamlet]`", map);
    assert.equal(text, "`d[=]` and `d<sushi>` and `d@[Hamlet]`");
  });

  it("reties nested cite interiors and leaves the opaque island", () => {
    const { text } = rewriteMarkdown("`d[ vuwurul d<]> ]`", map);
    assert.equal(text, "`d[ voworol d<]> ]`");
  });

  it("reties spoken span interiors but not the open word", () => {
    const { text } = rewriteMarkdown("`daxal zazawan xuxul`", map);
    assert.equal(text, "`daxal zululon xuxul`");
  });

  it("does not rewrite HTML comments", () => {
    const { text } = rewriteMarkdown("before <!-- `zazawan` --> after `zazawan`", map);
    assert.equal(text, "before <!-- `zazawan` --> after `zululon`");
  });
});

describe("resume-aware markdown retie", () => {
  it("respells a resume with its antecedent's root", () => {
    const map = mapOf(["azawa", "ululo"]);
    const { text } = rewriteMarkdown("`zazawan vawalal. zazawar vayul.`", map);
    assert.equal(text, "`zululon vawalal. zululor vayul.`");
  });

  it("respells a resume whose antecedent is in another code span", () => {
    const map = mapOf(["uhubu", "edeme"]);
    const { text } = rewriteMarkdown("named `zuhubun` then `zuhubur`.", map);
    assert.equal(text, "named `zedemen` then `zedemer`.");
  });

  it("respells a resume of a verb when that root moves", () => {
    const map = mapOf(["elebe", "ababa"]);
    const { text } = rewriteMarkdown("`zululon velebel. zazawan veleber.`", map);
    assert.equal(text, "`zululon vababal. zazawan vababar.`");
  });

  it("respells a hook-compound resume through its left root", () => {
    const map = mapOf(["owoga", "ababa"]);
    const { text } = rewriteMarkdown("`zazawan vowogalal. zalahen vowogalar.`", map);
    assert.equal(text, "`zazawan vababalal. zalahen vababalar.`");
  });

  it("respells a resume inside a writing-span payload", () => {
    const map = mapOf(["azawa", "ululo"]);
    const { text } = rewriteMarkdown("`zazawan th(zazawar vawalal) vawalal.`", map);
    assert.equal(text, "`zululon th(zululor vawalal) vawalal.`");
  });

  it("leaves role pointers alone", () => {
    const map = mapOf(["azawa", "ululo"]);
    const { text } = rewriteMarkdown("`zazawan vawalal. zaxar vayul.`", map);
    assert.equal(text, "`zululon vawalal. zaxar vayul.`");
  });
});

describe("tone marks", () => {
  const map = mapOf(["azawa", "ululo"]);

  it("peels a tone mark off the word", () => {
    assert.deepEqual(peelChunk("?!zazawan."), { prefix: "?!", core: "zazawan", suffix: "." });
  });

  it("reties words carrying a tone mark", () => {
    const { text } = rewriteMarkdown("`!zazawan vawalal.` `&zazawan` `;zazawan vayul.`", map);
    assert.equal(text, "`!zululon vawalal.` `&zululon` `;zululon vayul.`");
  });
});

describe("classification-gated retie", () => {
  const map = mapOf(["azawa", "ululo"], ["obono", "abaga"]);

  it("reports prose words, emphasised or not, without retieing them", () => {
    const input = "The obono in prose, and *azawa* in italics.";
    const { text, reviews } = rewriteMarkdown(input, map);
    assert.equal(text, input);
    assert.deepEqual(reviews.map((r) => r.text), ["obono", "*azawa*"]);
  });

  it("leaves English that fits the root shape alone", () => {
    const english = mapOf(["one", "ovavo"], ["ere", "edehu"], ["eve", "evevu"], ["age", "ezego"]);
    const input = "*one* and *here* / *there*, *bone*, *even though*, *over there*, *a bagel*.";
    assert.equal(rewriteMarkdown(input, english).text, input);
  });

  it("reties only the lint-checked words of English-class spans and text-fence lines, for review", () => {
    const input = "`obono is big` and\n```text\nthe obono is here\n```\n";
    const { text, reviews } = rewriteMarkdown(input, map);
    assert.equal(text, "`abaga is big` and\n```text\nthe abaga is here\n```\n");
    assert.equal(reviews.length, 2);
    assert.match(reviews[0]!.reason, /word by word/);
  });

  it("leaves code English that is not a lint candidate", () => {
    const input = "`the level is here`";
    const { text } = rewriteMarkdown(input, mapOf(["eve", "ababa"], ["ere", "ododo"]), undefined, {
      english: new Set(["the", "level", "is", "here"]),
    });
    assert.equal(text, input);
  });

  it("reties a text-fence line that reads as Agazan", () => {
    const { text } = rewriteMarkdown("```text\nzazawan vawalal.\n```\n", map);
    assert.equal(text, "```text\nzululon vawalal.\n```\n");
  });

  it("reties the Agazan words of an unclassified span and reports it", () => {
    const { text, reviews } = rewriteMarkdown("`zazawan means swan`", map);
    assert.equal(text, "`zululon means swan`");
    assert.match(reviews[0]!.reason, /mixes/);
  });

  it("reties a marked fragment", () => {
    const { text } = rewriteMarkdown("<!-- lint: fragment --> `zazawan vawalal`", map);
    assert.equal(text, "<!-- lint: fragment --> `zululon vawalal`");
  });

  it("reties a template around its placeholders", () => {
    const { text } = rewriteMarkdown("`zazawan VERB.`", map);
    assert.equal(text, "`zululon VERB.`");
  });

  it("leaves a spoken opaque interior alone", () => {
    const { text } = rewriteMarkdown("`zazawan duxal zazawan xuxul vawalal.`", map);
    assert.equal(text, "`zululon duxal zazawan xuxul vawalal.`");
  });

  it("reties HTML code bodies", () => {
    const { text } = rewriteMarkdown("see <code>zazawan d&lt;sushi&gt;</code> here", map);
    assert.equal(text, "see <code>zululon d&lt;sushi&gt;</code> here");
  });

  it("reties the host of a fused hook compound", () => {
    const { text } = rewriteMarkdown("`zazawan dazadol vawalalul.`", mapOf(["awala", "obobo"]));
    assert.equal(text, "`zazawan dazadol vobobolul.`");
  });

  it("respells a resume chained to an earlier resume", () => {
    const { text } = rewriteMarkdown("`zazawan vawalal xon zazawar vuzunul xon zazawar velebel.`", map);
    assert.equal(text, "`zululon vawalal xon zululor vuzunul xon zululor velebel.`");
  });

  it("reties a markdown fence as a page of its own", () => {
    const { text } = rewriteMarkdown("```markdown\n> `zazawan vawalal.`\n```\n", map);
    assert.equal(text, "```markdown\n> `zululon vawalal.`\n```\n");
  });

  it("reties an emphasised Agazan sentence in prose", () => {
    const { text } = rewriteMarkdown("> 🔊 *zazawan vawalal.*", map);
    assert.equal(text, "> 🔊 *zululon vawalal.*");
  });

  it("reties overlay spellings through their root", () => {
    const overlayMap = mapOf(["alodo", "ibibi"]);
    const { text } = rewriteMarkdown("`thalodom`", overlayMap);
    assert.equal(text, "`thibibim`");
  });
});

describe("verifyRetiedSpans", () => {
  const map = mapOf(["azawa", "alahe"]);

  it("bridges old and new spellings so an unconverted lexicon does not flag the retie", () => {
    const moved = mapOf(["azawa", "obobo"]);
    const { spans } = rewriteMarkdown("`zazawan vawalal.`", moved);
    assert.deepEqual(verifyRetiedSpans(spans, moved, bridgeTables(moved)), []);
  });

  const tables = loadDefaultTables();

  it("passes a clean retie, including a respelled resume", () => {
    const { spans } = rewriteMarkdown("`zazawan vowogal. zazawar vehahel.`", map);
    assert.deepEqual(verifyRetiedSpans(spans, map, tables), []);
  });

  it("catches a rewrite that changes something the map does not", () => {
    const spans = [{ before: "zazawan vowogal.", after: "zalahen vehahel.", index: 0, cls: "sentence" }];
    const failures = verifyRetiedSpans(spans, map, tables);
    assert.equal(failures.length, 1);
    assert.match(failures[0]!.detail, /owoga/);
  });

  it("blocks a tree change with no new resume link", () => {
    const moved = mapOf(["obo", "azava"]);
    const spans = [{ before: "goyuthol bohohul.", after: "gazavathol bohohul.", index: 0, cls: "sentence" }];
    const failures = verifyRetiedSpans(spans, moved, bridgeTables(moved));
    assert.equal(failures.length, 1);
    assert.equal(failures[0]!.level, "blocking");
  });

  it("catches a rewrite that stops parsing", () => {
    const spans = [{ before: "zazawan vowogal.", after: "zalahen vowogal vowogal zz.", index: 0, cls: "sentence" }];
    assert.equal(verifyRetiedSpans(spans, map, tables).length, 1);
  });
});

describe("checkMapCollisions", () => {
  it("flags a new root already in use or English-shaped", () => {
    const collisions = checkMapCollisions(mapOf(["azawa", "ululo"], ["obono", "are"], ["uhubu", "azawa"]), {
      rootsInUse: new Set(["ululo", "azawa"]),
      englishWords: new Set(["are"]),
    });
    assert.deepEqual(
      collisions.map((c) => c.newRoot),
      ["ululo", "are"],
    );
  });
});

describe("lineNumberAt", () => {
  it("counts newlines before the index", () => {
    assert.equal(lineNumberAt("a\nb\nc", 0), 1);
    assert.equal(lineNumberAt("a\nb\nc", 2), 2);
    assert.equal(lineNumberAt("a\nb\nc", 4), 3);
  });
});

describe("English copies follow their Agazan", () => {
  const map = mapOf(["ululo", "alahe"], ["odoga", "uzugo"]);

  it("renames a named word in morph lines, free English and word banks", () => {
    const input = "> `zululon vawalal.`\n>\n> z-Ululon | v-walk\n>\n> \"Ululon walks.\"\n\n| *Ululon* | `ululon` |\n";
    const { text } = rewriteMarkdown(input, map);
    assert.equal(text, "> `zalahen vawalal.`\n>\n> z-Alahen | v-walk\n>\n> \"Alahen walks.\"\n\n| *Alahen* | `alahen` |\n");
  });

  it("respells a quoted payload in the morph line and the English", () => {
    const input = "> `z{odoga} gamazam.`\n>\n> z-MENTION[\"odoga\"] | g-small\n>\n> \"The word “odoga” is small.\"\n";
    const { text } = rewriteMarkdown(input, map);
    assert.match(text, /MENTION\["uzugo"\]/);
    assert.match(text, /“uzugo”/);
  });

  it("does not touch names inside code or link targets", () => {
    const input = "`zululon vawalal.` see [Ululon](pronouns.md#ululon)";
    const { text } = rewriteMarkdown(input, map);
    assert.equal(text, "`zalahen vawalal.` see [Alahen](pronouns.md#ululon)");
  });
});

describe("editorial span close and template stems", () => {
  it("reties a payload before an editorial close", () => {
    const { text } = rewriteMarkdown("`zazawan d[azawam#] vawalal.` `zazawan d[azawam#|] vawalal.`", mapOf(["azawa", "ululo"]));
    assert.equal(text, "`zululon d[ululom#] vawalal.` `zululon d[ululom#|] vawalal.`");
  });

  it("reties a template word cut before its ending", () => {
    const { text } = rewriteMarkdown("(`gonogotha…`)", mapOf(["onogo", "une"]));
    assert.equal(text, "(`gunetha…`)");
  });
});

describe("heading anchors", () => {
  it("renames a heading id spelled from Agazan and relinks it", () => {
    const before = "### Ability (`egera`)\n";
    const after = "### Ability (`aze`)\n";
    const renames = headingIdRenames(before, after);
    assert.deepEqual([...renames], [["ability-egera", "ability-aze"]]);
    const page = "/docs/grammar/intention.md";
    const all = new Map([[page, renames]]);
    assert.equal(
      relinkMarkdown("[x](intention.md#ability-egera) [y](#ability-egera)", "/docs/grammar/clause.md", all).text,
      "[x](intention.md#ability-aze) [y](#ability-egera)",
    );
    assert.equal(
      relinkOverlayAnchors("egeral,th,💪,mood,ABIL,x,y,intention.md#ability-egera\n", "/docs/grammar", all).text,
      "egeral,th,💪,mood,ABIL,x,y,intention.md#ability-aze\n",
    );
  });

  it("leaves pinned ids alone", () => {
    assert.equal(headingIdRenames("### Ability (`egera`) {#ability}\n", "### Ability (`aze`) {#ability}\n").size, 0);
  });
});

describe("source literals", () => {
  const map = mapOf(["azawa", "ululo"], ["agala", "agaza"]);
  const ctx = {
    map,
    tables: loadDefaultTables(),
    follow: { names: new Map([["Azawan", "Ululon"]]), words: new Map() },
    english: new Set(["one", "the"]),
    currentRoots: new Set(["ululo", "agaza"]),
  };

  it("reties test fixtures and their expected names", () => {
    const source = 'parse("zazawan vawalal.");\nassert.equal(gloss("zazawan"), "z-Azawan");\n';
    const { text } = rewriteSourceLiterals(source, "x.test.ts", ctx);
    assert.equal(text, 'parse("zululon vawalal.");\nassert.equal(gloss("zululon"), "z-Ululon");\n');
  });

  it("only reports one-word literals and root-table keys outside tests", () => {
    const source = 'const LANGUAGE_ROOT = "agala";\nconst CAST = {\n  azawa: "x",\n};\n// "azawa" in a comment\n';
    const { text, reviews } = rewriteSourceLiterals(source, "x.ts", ctx);
    assert.equal(text, source);
    assert.equal(reviews.length, 2);
  });

  it("finds literals past regex literals and apostrophes in comments", () => {
    const source = "const re = /[\"']/; // it's\nconst s = 'zazawan vawalal.';\n";
    assert.deepEqual(sourceLiterals(source).map((l) => l.body), ["zazawan vawalal."]);
  });
});

describe("retie map file", () => {
  it("adds compound stem pairs and flags old spellings the grammar cannot read", () => {
    const json = serializeRetieMap(
      [{ emoji: "🏠", literal: "house", oldRoot: "ohohu", newRoot: "ahaza" }],
      "2026-01-01T00:00:00.000Z",
      [{ emoji: "🛏️", oldStem: "abedelohohu", newStem: "abedelahaza" }],
    );
    const map = parseRetieMapJson(json);
    assert.equal(map.get("abedelohohu"), "abedelahaza");
    const parses = (word: string) => !word.includes("j");
    assert.deepEqual(unreadableOldRoots(mapOf(["oja", "ogodu"], ["ohohu", "ahaza"]), parses), ["oja"]);
  });
});

describe("resume binds after a retie", () => {
  it("blocks a resume left on the old root", () => {
    const tables = bridgeTables(mapOf(["adana", "azado"]));
    const failures = verifyRetiedSpans(
      [{ before: "zazawan vadanal xon zalahen vadanar.", after: "zazawan vazadol xon zalahen vadanar.", index: 0, cls: "sentence" }],
      mapOf(["adana", "azado"]),
      tables,
    );
    assert.equal(failures[0]?.level, "blocking");
    assert.match(failures[0]!.detail, /whole stem/);
  });
});

describe("retie fixes (2026-09-28 overlay demotion)", () => {
  it("moves an overlay -r with its root", () => {
    const tables = loadDefaultTables();
    const told = [...tables.overlays.values()].find((row) => row.gloss === "TOLD.weak" && row.pos === "th")!;
    const root = told.senseForm.slice(0, -1);
    const { text } = rewriteMarkdown(`\`zalahen th${root}r vedabal.\``, mapOf([root, "ibibi"]));
    assert.equal(text, "`zalahen thibibir vedabal.`");
  });

  it("keeps an emotion tail when the sake root moves", () => {
    assert.equal(rewriteParsedWord(parseWord("wonathumer"), mapOf(["ona", "ibibi"])), "wibibithumer");
  });

  it("reties a viewpoint lateral the word grammar reads as an emotion shape", () => {
    const { text } = rewriteMarkdown("`zobodal gewezathamun.`", mapOf(["amu", "ibibi"]));
    assert.equal(text, "`zobodal gewezathibibin.`");
  });

  it("blocks a span left unretied that still reads a moved root", () => {
    const span = { before: "zobodal gewezathamun.", after: "zobodal gewezathamun.", index: 0, cls: "sentence" };
    const failures = verifyRetiedSpans([span], mapOf(["amu", "ibibi"]), loadDefaultTables());
    assert.equal(failures[0]?.level, "blocking");
    assert.match(failures[0]!.detail, /left unretied/);
  });
});

describe("source literals (2026-09-28 fixes)", () => {
  const map = mapOf(["azawa", "ululo"], ["ema", "ibibi"]);
  const ctx = {
    map,
    tables: loadDefaultTables(),
    follow: { names: new Map(), words: new Map() },
    // The English frequency list has single letters and some hooks.
    english: new Set(["b", "ol", "the"]),
    currentRoots: new Set(["ululo", "ibibi"]),
  };

  it("reads a lone role letter and a hook as Agazan, not English", () => {
    const source = 'parse("zazawan vowogal ol b_#22,7.");\n';
    const { text } = rewriteSourceLiterals(source, "x.test.ts", ctx);
    assert.equal(text, 'parse("zululon vowogal ol b_#22,7.");\n');
  });

  it("moves an overlay construction id with its sense form", () => {
    const { text } = rewriteSourceLiterals('expect("overlay.emam.th");\n', "x.test.ts", ctx);
    assert.equal(text, 'expect("overlay.ibibim.th");\n');
  });

  it("reties an escaped literal around its escapes, and reports a word the tokenizer could not reach", () => {
    const escaped = rewriteSourceLiterals('const md = "> \\`zazawan vowogal.\\`\\n>\\n> \\"Azawan walks.\\"";\n', "x.test.ts", ctx);
    assert.equal(escaped.text, 'const md = "> \\`zululon vowogal.\\`\\n>\\n> \\"Ululon walks.\\"";\n');
    assert.equal(escaped.reviews.length, 0);
    const partial = rewriteSourceLiterals('expect("yael [[zazawan zam] zazawan zal]");\n', "x.test.ts", ctx);
    assert.ok(partial.reviews.some((review) => /azawa/.test(review.reason)));
  });
});

describe("retie — inline code that holds a fence marker", () => {
  it("does not open a fence mid-line, so later italics stay English", () => {
    const page =
      "Fenced blocks need an info string: ` ```agazan ` to check each line, or ` ```text ` for notation.\n\n" +
      "Italics are English, even a word whose letters spell a root (*eye*).\n";
    const { text, changes } = rewriteMarkdown(page, mapOf(["eye", "uye"]));
    assert.deepEqual(changes, []);
    assert.equal(text, page);
  });

  it("still reties a real fence and a double-backtick span", () => {
    const page = "```agazan\nzazawan vowogal.\n```\n\nSay ``zazawan`` here.\n";
    const { text } = rewriteMarkdown(page, mapOf(["azawa", "ezewe"]));
    assert.equal(text, "```agazan\nzezewen vowogal.\n```\n\nSay ``zezewen`` here.\n");
  });

  it("walks a double-backtick span that quotes Markdown as Markdown", () => {
    const page = "Write `` `ahahal` *eye* `` in the table.\n";
    const { text } = rewriteMarkdown(page, mapOf(["eye", "uye"], ["ahaha", "ohoho"]));
    assert.equal(text, "Write `` `ohohol` *eye* `` in the table.\n");
  });
});

describe("retie — review noise", () => {
  it("does not report a common English prose word that matches an old root", () => {
    const english = new Set(["there", "here"]);
    const { reviews } = rewriteMarkdown("Over *there* and here, `zazawan` walks.\n", mapOf(["ere", "ule"], ["azawa", "ezewe"]), undefined, { english });
    assert.deepEqual(reviews, []);
  });
});

describe("retie — resumes in spans with the learner-name slot", () => {
  it("binds a resume in a sentence that holds SELF", () => {
    // Without the parse bind, the page-level guess picks the unmoved `azoba` and leaves `zazor` stale.
    const page = "`zazobal` stays.\n\n`zSELFn vowogal dazomx. zazor vehahel.`\n";
    const { text } = rewriteMarkdown(page, mapOf(["azo", "oze"]));
    assert.equal(text, "`zazobal` stays.\n\n`zSELFn vowogal dozemx. zozer vehahel.`\n");
  });
});

describe("source literals — one spelling per file", () => {
  const ctxOf = (map: Map<string, string>) => ({
    map,
    tables: loadDefaultTables(),
    follow: { names: new Map(), words: new Map() },
    english: new Set(["one", "the", "unused", "root", "use", "here"]),
    currentRoots: new Set<string>(),
  });
  const file = 'parse("zazawan zodogal em bazawar zal vowogal.");\nassert.equal(bound, "bazawar");\n';

  it("gives a lone resume the spelling its sentence gave it", () => {
    const { text } = rewriteSourceLiterals(file, "x.test.ts", ctxOf(mapOf(["azawa", "ululo"], ["aza", "ozo"])));
    assert.equal(text, 'parse("zululon zodogal em bululor zal vowogal.");\nassert.equal(bound, "bululor");\n');
  });

  it("leaves a lone resume alone when only a shorter root moves", () => {
    const { text } = rewriteSourceLiterals(file, "x.test.ts", ctxOf(mapOf(["aza", "ozo"])));
    assert.equal(text, file);
  });

  it("carries a word change into a literal the pass could not read", () => {
    const source = 'segment("?! zazawan !!veyel ?^ hal ^.");\nexpect({ text: "veyel" });\n';
    const { text } = rewriteSourceLiterals(source, "x.test.ts", ctxOf(mapOf(["eye", "uye"])));
    assert.equal(text, 'segment("?! zazawan !!vuyel ?^ hal ^.");\nexpect({ text: "vuyel" });\n');
  });
});

describe("source literals — tests that read the real lexicon", () => {
  const ctx = {
    map: mapOf(["abede", "abode"], ["ovo", "ovu"], ["eha", "ehu"]),
    tables: loadDefaultTables(),
    follow: { names: new Map(), words: new Map() },
    english: new Set(["unused", "root", "use", "here"]),
    currentRoots: new Set<string>(),
  };
  const body = 'term("root=abede");\nkinds("unused ovo");\nmd("Use `theha` here.");\n';

  it("respells bare roots, roots beside English, and seams", () => {
    const { text } = rewriteSourceLiterals(`const t = loadDefaultTables();\n${body}`, "x.test.ts", ctx);
    assert.equal(text, 'const t = loadDefaultTables();\nterm("root=abode");\nkinds("unused ovu");\nmd("Use `thehu` here.");\n');
  });

  it("only reports them in a test with its own tables", () => {
    const { text, reviews } = rewriteSourceLiterals(body, "x.test.ts", ctx);
    assert.equal(text, body.replace("`theha`", "`thehu`"));
    assert.equal(reviews.length, 2);
  });
});

describe("retie — the SELF slot", () => {
  it("does not block a span whose only moved root is the speaker root filled in for SELF", () => {
    const tables = loadDefaultTables();
    const speaker = [...tables.published.values()].find((row) => row.emoji === "🎤")!.root;
    // Before the retie the speaker row was spelled `ululo`.
    const map = mapOf(["ululo", speaker]);
    const failures = verifyRetiedSpans([{ before: "zSELFn vowogal.", after: "zSELFn vowogal.", index: 0, cls: "sentence" }], map, bridgeTables(map));
    assert.deepEqual(failures, []);
  });
});

describe("source literals — fixtures, patterns and names", () => {
  const ctx = {
    map: mapOf(["eye", "uye"], ["agada", "agadu"], ["egeva", "egevo"]),
    tables: loadDefaultTables(),
    follow: { names: new Map(), words: new Map() },
    english: new Set(["see", "does", "not", "appear"]),
    currentRoots: new Set<string>(),
  };

  it("leaves words on a root the test defines as its own fixture", () => {
    const source = 'const row = { root: "eye" };\nlint("| *see* | `veyel` |");\n';
    assert.equal(rewriteSourceLiterals(source, "x.test.ts", ctx).text, source);
  });

  it("reties Agazan quoted in a regex literal", () => {
    const source = 'lint("`zagadal` is here");\nassert.match(out, /`zagadal` does not appear/);\n';
    assert.equal(
      rewriteSourceLiterals(source, "x.test.ts", ctx).text,
      'lint("`zagadul` is here");\nassert.match(out, /`zagadul` does not appear/);\n',
    );
  });

  it("carries a moved root's English name to other literals in the file", () => {
    const source = 'gloss("zegevan vowogal.");\nassert.equal(out, "z-Egevan | v-walk");\n';
    assert.equal(rewriteSourceLiterals(source, "x.test.ts", ctx).text, 'gloss("zegevon vowogal.");\nassert.equal(out, "z-Egevon | v-walk");\n');
  });

  it("follows a cite's word into a lone literal (the cite's change carries its bracket)", () => {
    const source = 'preview("d[zadagal zagadal]");\nassert.deepEqual(spoken, ["daxal", "zadagal", "zagadal", "xuxul"]);\n';
    assert.equal(
      rewriteSourceLiterals(source, "x.test.ts", ctx).text,
      'preview("d[zadagal zagadul]");\nassert.deepEqual(spoken, ["daxal", "zadagal", "zagadul", "xuxul"]);\n',
    );
  });
});
