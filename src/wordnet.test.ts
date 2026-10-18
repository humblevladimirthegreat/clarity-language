import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { deflateRawSync } from "node:zlib";

import { parseDataLine, unzip } from "./wordnet.js";

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

  it("reads stored and deflated files out of a zip archive", () => {
    const entries = [
      { name: "oewn2025/", method: 0, body: Buffer.alloc(0), size: 0 },
      { name: "oewn2025/index.noun", method: 0, body: Buffer.from("hello"), size: 5 },
      { name: "oewn2025/data.noun", method: 8, body: deflateRawSync("world world"), size: 11 },
    ];
    const locals: Buffer[] = [];
    const centrals: Buffer[] = [];
    let offset = 0;
    for (const { name, method, body, size } of entries) {
      const local = Buffer.alloc(30);
      local.writeUInt32LE(0x04034b50, 0);
      local.writeUInt16LE(method, 8);
      local.writeUInt32LE(body.length, 18);
      local.writeUInt32LE(size, 22);
      local.writeUInt16LE(name.length, 26);
      const central = Buffer.alloc(46);
      central.writeUInt32LE(0x02014b50, 0);
      central.writeUInt16LE(method, 10);
      central.writeUInt32LE(body.length, 20);
      central.writeUInt32LE(size, 24);
      central.writeUInt16LE(name.length, 28);
      central.writeUInt32LE(offset, 42);
      locals.push(local, Buffer.from(name), body);
      centrals.push(central, Buffer.from(name));
      offset += 30 + name.length + body.length;
    }
    const directory = Buffer.concat(centrals);
    const end = Buffer.alloc(22);
    end.writeUInt32LE(0x06054b50, 0);
    end.writeUInt16LE(entries.length, 10);
    end.writeUInt32LE(directory.length, 12);
    end.writeUInt32LE(offset, 16);
    const files = unzip(Buffer.concat([...locals, directory, end]));
    assert.deepEqual([...files.keys()], ["oewn2025/index.noun", "oewn2025/data.noun"]);
    assert.equal(files.get("oewn2025/index.noun")?.toString(), "hello");
    assert.equal(files.get("oewn2025/data.noun")?.toString(), "world world");
  });
});
