import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { respellInitials, titleInitials } from "./initials.js";

const PAGE = [
  "> `z@_nl vezuyol.`",
  ">",
  "> 🔊 `zrenulan vezuyol.`",
  ">",
  "> z-_nl.named | v-tell",
  ">",
  '> "The NL announces." (the office whose full title is *Book-Courage*)',
  "",
  "| `zanaxalazun` | long title | *Book-Courage* |",
  "| `z@_nl` (🔊 `zrenulan`) | initials | *the NL* |",
  "| `z=_nl` (🔊 `zrenular`) | resume | *that office again* |",
].join("\n");

describe("titleInitials", () => {
  it("takes each title root's first consonant, one letter per root", () => {
    assert.equal(titleInitials("zanaxalazun"), "nl");
    assert.equal(titleInitials("zanaxalazuxomun"), "nlm");
    assert.equal(titleInitials("zanan"), undefined);
  });
});

describe("respellInitials", () => {
  it("moves a handle, its 🔊 lines, its morph copy and its capitals with the title", () => {
    const text = PAGE.replace("zanaxalazun", "zanaxabazun");
    const result = respellInitials(PAGE, text, new Map([["zanaxalazun", "zanaxabazun"]]));
    assert.equal(
      result.text,
      PAGE.replace("zanaxalazun", "zanaxabazun")
        .replaceAll("_nl", "_nb")
        .replaceAll("zrenulan", "zrenubun")
        .replaceAll("zrenular", "zrenubur")
        .replaceAll("NL", "NB"),
    );
    assert.deepEqual(result.reviews, []);
    assert.ok(result.fixes.some((fix) => fix.from === "z=_nl" && fix.to === "z=_nb"));
  });

  it("leaves titles that share the old initials for review", () => {
    const before = `${PAGE}\n\nAlso \`zanaxalomun\`.`;
    const text = before.replace("zanaxalazun", "zanaxabazun");
    const result = respellInitials(before, text, new Map([["zanaxalazun", "zanaxabazun"]]));
    assert.equal(result.text, text);
    assert.equal(result.reviews.length, 1);
    assert.match(result.reviews[0]!.text, /zanaxalazun \/ zanaxalomun/);
  });

  it("changes nothing when the title's initials keep their letters", () => {
    const text = PAGE.replace("zanaxalazun", "zanaxalozun");
    const result = respellInitials(PAGE, text, new Map([["zanaxalazun", "zanaxalozun"]]));
    assert.equal(result.text, text);
    assert.deepEqual(result.fixes, []);
  });
});
