import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { buildRootMap, parseRetieMapJson, serializeRetieMap, type RetiePair } from "./map.js";
import { rewriteParsedWord } from "./rebuild.js";
import { parseWord } from "../parse/word.js";
import { lineNumberAt, peelChunk, retieCore, rewriteMarkdown } from "./tokens.js";

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
    const input = "see [adoro](adoro.md) please";
    const { text } = rewriteMarkdown(input, map);
    assert.equal(text, "see [badoro](adoro.md) please");
  });

  it("peels wrapping backticks", () => {
    assert.deepEqual(peelChunk("`zazawanx`"), { prefix: "`", core: "zazawanx", suffix: "`" });
  });

  it("peels punctuation on hodom", () => {
    const map = mapOf(["odo", "adoro"]);
    assert.deepEqual(peelChunk("(hodom)."), { prefix: "(", core: "hodom", suffix: ")." });
    const { text } = rewriteMarkdown("call (hodom).", map);
    assert.equal(text, "call (hadorom).");
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
    const { text } = rewriteMarkdown("`zazawan vawalal. zazar vajul.`", map);
    assert.equal(text, "`zululon vawalal. zulur vajul.`");
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
      "`yubunexunowen vawalal.` then `dubur vajul.`",
      map,
    );
    assert.equal(text, "`yubunexunowen vawalal.` then `dubur vajul.`");
  });
});

describe("lineNumberAt", () => {
  it("counts newlines before the index", () => {
    assert.equal(lineNumberAt("a\nb\nc", 0), 1);
    assert.equal(lineNumberAt("a\nb\nc", 2), 2);
    assert.equal(lineNumberAt("a\nb\nc", 4), 3);
  });
});
