import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { loadDefaultTables } from "../parse/index.js";
import { collectExamples } from "./examples.js";
import { matchQuery } from "./pass.js";
import { hitWord, matchesTerm, parseTerm, type FoundWord } from "./query.js";

const tables = loadDefaultTables();

function wordOf(text: string, raw: string): FoundWord {
  const [example] = collectExamples(`\`${text}\``, tables);
  assert.ok(example, `${text} should parse`);
  const word = example.words.find((w) => w.word.raw === raw);
  assert.ok(word, `${raw} in ${text}`);
  return word;
}

describe("frames from readings", () => {
  it("finds a frame in a scope island's reading, with clause reach there", () => {
    // The island is its own reading; its new member is a binder over that chunk only.
    const member = wordOf("zazozon { hogugem zodozel gerulol } vayebel.", "zodozel");
    assert.deepEqual(member.frameEntries, [{ values: ["binder"], reach: "clause" }]);
    assert.ok(matchesTerm(member, parseTerm("frame=binder,reach=clause")));
  });

  it("gives a stance on one adjective adjective reach, not clause reach", () => {
    const mood = wordOf("zazozon wevum guzemel vezuvel.", "wevum");
    assert.deepEqual(hitWord(mood).reach, ["adjective"]);
    assert.ok(matchesTerm(mood, parseTerm("frame=stance")));
    assert.ok(matchesTerm(mood, parseTerm("frame=stance,reach=adjective")));
    assert.ok(!matchesTerm(mood, parseTerm("frame=stance,reach=clause")));
  });

  it("reach=clause keeps whole-clause frames; frame and reach hold of one frame", () => {
    const channel = wordOf("zazozon hual vowurol thubor.", "thubor");
    assert.deepEqual(channel.frames, ["stance", "stance/channel"]);
    assert.ok(matchesTerm(channel, parseTerm("frame=stance/channel,reach=clause")));
    // *No K*: the fence is a binder over the clause, and its denial is held in the binder.
    const fence = wordOf("zul gogozel vehohel.", "zul");
    assert.ok(matchesTerm(fence, parseTerm("frame=binder,reach=clause")));
    assert.ok(matchesTerm(fence, parseTerm("frame=polarity,reach=nested")));
    assert.ok(!matchesTerm(fence, parseTerm("frame=polarity,reach=clause")));
    assert.ok(matchesTerm(fence, parseTerm("frame=polarity,reach!=clause")));
  });

  it("keeps nested readings for --over / --under / --unordered", () => {
    const [example] = collectExamples("`zazozon { hogugem zodozel gerulol } vayebel.`", tables);
    assert.ok(example!.allReadings.some((reading) => /\/i\d+$/.test(reading.id)));
    assert.equal(matchQuery(example!, { kind: "unordered" }), null);
  });
});
