import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { parseCliArgs } from "./cli-args.js";

describe("parseCliArgs", () => {
  it("keeps Agebon inputs and known flags", () => {
    const parsed = parseCliArgs(["--check-lexicon", "zazozon vowurol.", "zalazun veruvol."]);
    assert.equal(parsed.checkLexicon, true);
    assert.deepEqual(parsed.args, ["zazozon vowurol.", "zalazun veruvol."]);
  });

  it("rejects --json: several inputs already print a JSON array", () => {
    assert.throws(() => parseCliArgs(["--json", "zazozon vowurol."]), /unknown flag --json/);
  });

  it("rejects any other unknown flag", () => {
    assert.throws(() => parseCliArgs(["--pretty", "zal."]), /unknown flag --pretty/);
  });
});
