import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { parseDataLine, untar } from "./wordnet.js";

describe("wordnet", () => {
  it("parses a data.noun line, keeping plain hyponyms only", () => {
    const line =
      "07827392 13 n 02 herb 0 sweet_basil 0 003 @ 07825399 n 0000 ~ 07827554 n 0000 ~i 09999999 n 0000 | aromatic potherb  ";
    const synset = parseDataLine(line);
    assert.equal(synset.offset, 7827392);
    assert.deepEqual(synset.words, ["herb", "sweet basil"]);
    assert.deepEqual(synset.hyponyms, [7827554]);
    assert.equal(synset.gloss, "aromatic potherb");
  });

  it("parses a verb line's pointers and an adjective satellite's similar-to and derivation", () => {
    const verb = parseDataLine("01904930 38 v 01 walk 0 002 @ 01835496 v 0000 + 00284669 n 0101 02 + 08 00 | use one's feet to advance  ");
    assert.equal(verb.pos, "v");
    assert.deepEqual(verb.hypernyms, [1835496]);
    assert.deepEqual(verb.pointers[1], { symbol: "+", offset: 284669, pos: "n", source: 1, target: 1 });
    const adj = parseDataLine("00117620 00 s 02 hasty 0 hurried 0 002 & 00116940 a 0000 + 05060189 n 0101 | excessively quick  ");
    assert.equal(adj.pos, "a");
    assert.deepEqual(adj.words, ["hasty", "hurried"]);
    assert.deepEqual(adj.pointers.map((p) => [p.symbol, p.pos, p.source]), [["&", "a", 0], ["+", "n", 1]]);
  });

  it("drops an adjective's syntactic marker", () => {
    assert.deepEqual(parseDataLine("00001740 00 a 01 galore(ip) 0 000 | in plenty  ").words, ["galore"]);
  });

  it("reads files out of a ustar archive", () => {
    const header = Buffer.alloc(512);
    header.write("package/dict/index.noun", 0);
    header.write("00000000005\0", 124);
    header.write("0", 156);
    const body = Buffer.alloc(512);
    body.write("hello");
    const files = untar(Buffer.concat([header, body, Buffer.alloc(1024)]));
    assert.equal(files.get("package/dict/index.noun")?.toString(), "hello");
  });
});
