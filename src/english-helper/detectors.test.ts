import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { detectorLinks } from "./detectors.js";
import { loadSections } from "./load.js";

describe("detector table", () => {
  it("links only sections that exist", () => {
    const sections = loadSections();
    const missing = [...new Set(detectorLinks())].filter((link) => !sections.has(link));
    assert.deepEqual(missing, []);
  });
});
