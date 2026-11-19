import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { parseCliArgs } from "./cli-args.js";

describe("parseCliArgs", () => {
  it("keeps Ageben inputs and known flags", () => {
    const parsed = parseCliArgs(["--check-lexicon", "zazozon vowurol.", "zalazun veruvol."]);
    assert.equal(parsed.checkLexicon, true);
    assert.deepEqual(parsed.args, ["zazozon vowurol.", "zalazun veruvol."]);
  });

  it("reads --json, which does not combine with --llm-prompt", () => {
    assert.equal(parseCliArgs(["--json", "zazozon vowurol."]).json, true);
    assert.equal(parseCliArgs(["zazozon vowurol."]).json, false);
    assert.throws(() => parseCliArgs(["--json", "--llm-prompt", "zal."]), /does not combine/);
  });

  it("rejects any other unknown flag", () => {
    assert.throws(() => parseCliArgs(["--pretty", "zal."]), /unknown flag --pretty/);
  });
});
