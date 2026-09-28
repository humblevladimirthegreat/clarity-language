import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { loadDefaultTables } from "../parse/index.js";
import { rewriteMarkdown } from "./markdown.js";
import { buildRootMap, checkMapCollisions, parseRetieMapJson, serializeRetieMap, type RetiePair } from "./map.js";
import { rewriteParsedWord } from "./rebuild.js";
import { parseWord } from "../parse/word.js";
import { lineNumberAt, peelChunk, retieCore } from "./tokens.js";
import { bridgeTables, verifyRetiedSpans } from "./verify.js";

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

describe("retieCore — Agalan tokens", () => {
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

  it("rewrites an isolated short resume whose parsed root is mapped", () => {
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
  it("keeps a short resume when the prefix collides with a mapped root", () => {
    const map = mapOf(["uhu", "edeme"]);
    const { text, changes } = rewriteMarkdown(
      "`zuhubun vorurul. zuhur vogogol.`",
      map,
    );
    assert.equal(text, "`zuhubun vorurul. zuhur vogogol.`");
    assert.equal(changes.length, 0);
  });

  it("keeps a short resume whose antecedent is in another code span", () => {
    const map = mapOf(["uhu", "edeme"]);
    const { text } = rewriteMarkdown("named `zuhubun` then `zuhur`.", map);
    assert.equal(text, "named `zuhubun` then `zuhur`.");
  });

  it("still remaps an unbound prefix that is the mapped root", () => {
    const map = mapOf(["uhu", "edeme"]);
    const { text } = rewriteMarkdown("see `zuhur` please", map);
    assert.equal(text, "see `zedemer` please");
  });

  it("respells a short resume from the antecedent’s new stem", () => {
    const map = mapOf(["azawa", "ululo"]);
    const { text } = rewriteMarkdown("`zazawan vawalal. zazar vayul.`", map);
    assert.equal(text, "`zululon vawalal. zulur vayul.`");
  });

  it("respells a full-root resume when that root moves", () => {
    const map = mapOf(["elebe", "ababa"]);
    const { text } = rewriteMarkdown("`zululon velebel. zazawan veleber.`", map);
    assert.equal(text, "`zululon vababal. zazawan vababar.`");
  });

  it("follows the bound antecedent, not a longer same-file stem", () => {
    const map = mapOf(["ele", "ogogo"]);
    const { text } = rewriteMarkdown(
      "`zululon velebel. zabogol gelem. zazawan veler.`",
      map,
    );
    assert.equal(text, "`zululon velebel. zabogol gogogom. zazawan vogogor.`");
  });

  it("keeps a compound-name short resume when the prefix root moves", () => {
    const map = mapOf(["ubu", "edeme"]);
    const { text } = rewriteMarkdown(
      "`yubunexunowen vawalal.` then `dubur vayul.`",
      map,
    );
    assert.equal(text, "`yubunexunowen vawalal.` then `dubur vayul.`");
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

  it("reties emphasised prose citations but only reports bare prose hits", () => {
    const { text, reviews } = rewriteMarkdown("The obono in prose, and *azawa* cited.", map);
    assert.equal(text, "The obono in prose, and *ululo* cited.");
    assert.deepEqual(reviews.map((r) => r.text), ["obono"]);
  });

  it("leaves English-class spans and text-fence English alone", () => {
    const input = "`obono is big` and\n```text\nthe obono is here\n```\n";
    const { text, reviews } = rewriteMarkdown(input, map);
    assert.equal(text, input);
    assert.equal(reviews.length, 2);
  });

  it("reties a text-fence line that reads as Agalan", () => {
    const { text } = rewriteMarkdown("```text\nzazawan vawalal.\n```\n", map);
    assert.equal(text, "```text\nzululon vawalal.\n```\n");
  });

  it("reports an unclassified span instead of rewriting it", () => {
    const input = "`zazawan means swan`";
    const { text, reviews } = rewriteMarkdown(input, map);
    assert.equal(text, input);
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
    const { text } = rewriteMarkdown("`zazawan vawalal xon zazar vuzunul xon zazar velebel.`", map);
    assert.equal(text, "`zululon vawalal xon zulur vuzunul xon zulur velebel.`");
  });

  it("reties a markdown fence as a page of its own", () => {
    const { text } = rewriteMarkdown("```markdown\n> `zazawan vawalal.`\n```\n", map);
    assert.equal(text, "```markdown\n> `zululon vawalal.`\n```\n");
  });

  it("reties an emphasised Agalan sentence in prose", () => {
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
    const { spans } = rewriteMarkdown("`zazawan vowogal. zazar vehahel.`", map);
    assert.deepEqual(verifyRetiedSpans(spans, map, tables), []);
  });

  it("catches a rewrite that changes something the map does not", () => {
    const spans = [{ before: "zazawan vowogal.", after: "zalahen vehahel.", index: 0, cls: "sentence" }];
    const failures = verifyRetiedSpans(spans, map, tables);
    assert.equal(failures.length, 1);
    assert.match(failures[0]!.detail, /owoga/);
  });

  it("reports a tree change with no new resume link as info", () => {
    const moved = mapOf(["obo", "azava"]);
    const spans = [{ before: "goyuthol bohohul.", after: "gazavathol bohohul.", index: 0, cls: "sentence" }];
    const failures = verifyRetiedSpans(spans, moved, bridgeTables(moved));
    assert.equal(failures.length, 1);
    assert.equal(failures[0]!.level, "info");
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
