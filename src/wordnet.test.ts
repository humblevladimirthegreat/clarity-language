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
