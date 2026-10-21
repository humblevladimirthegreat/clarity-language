import assert from "node:assert/strict";
import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import { IPA_DIR, ipaClipFiles } from "./ipa-clips.ts";

describe("ipa clips", () => {
  it("hosts every clip a grammar page plays", () => {
    const missing = ipaClipFiles().filter((file) => !existsSync(join(IPA_DIR, file)));
    assert.deepEqual(missing, [], `add these to ${IPA_DIR} (see ATTRIBUTION.txt)`);
  });

  it("hosts no clip that no page plays", () => {
    const used = new Set(ipaClipFiles());
    assert.deepEqual(readdirSync(IPA_DIR).filter((name) => name.endsWith(".mp3") && !used.has(name)), []);
  });
});
