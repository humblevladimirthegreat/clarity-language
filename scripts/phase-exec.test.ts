import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { buildPrompt, claudeArgs, parseArgs, reportRel, resultLine } from "./phase-exec.ts";

const UUID = "00000000-0000-4000-8000-000000000000";

describe("phase-exec arguments", () => {
  it("takes a proposal by name, file name or path, and defaults to opus at high effort", () => {
    for (const p of ["full-run-costs", "full-run-costs.md", "docs/proposals/in-progress/full-run-costs.md"]) {
      assert.deepEqual(parseArgs([p, "2"]), { name: "full-run-costs", phase: 2, rest: false, model: "opus", effort: "high" });
    }
  });

  it("--rest, --model and --effort, in any position", () => {
    assert.deepEqual(parseArgs(["--model", "sonnet", "x.md", "--rest", "3", "--effort", "xhigh"]), { name: "x", phase: 3, rest: true, model: "sonnet", effort: "xhigh" });
  });

  it("rejects a bad phase, effort, option or argument count", () => {
    assert.throws(() => parseArgs(["x", "0"]), /positive whole number/);
    assert.throws(() => parseArgs(["x", "2a"]), /positive whole number/);
    assert.throws(() => parseArgs(["x", "2", "--effort", "huge"]), /--effort must be one of/);
    assert.throws(() => parseArgs(["x", "2", "--model"]), /--model needs a value/);
    assert.throws(() => parseArgs(["x", "2", "--fast"]), /unknown option --fast/);
    assert.throws(() => parseArgs(["x"]), /expected a proposal and a phase/);
    assert.throws(() => parseArgs(["X Y", "1"]), /not a proposal file name/);
  });

  it("builds the prompt, the staging path and the claude flags", () => {
    const args = parseArgs(["full-run-costs", "2"]);
    assert.equal(reportRel("full-run-costs", 2), "tmp/state/full-runs/full-run-costs-phase-2.md");
    assert.equal(
      buildPrompt(args, UUID),
      `Carry out phase 2 of \`full-run-costs.md\` as a full-run phase executor. Your session id is \`${UUID}\`; write your report to \`tmp/state/full-runs/full-run-costs-phase-2.md\`.`,
    );
    assert.match(buildPrompt({ ...args, rest: true }, UUID), /^Carry out the rest of phase 2 of /);
    const flags = claudeArgs(args, UUID);
    assert.equal(flags[0], "-p");
    assert.deepEqual(flags.slice(2), ["--agent", "phase-executor", "--model", "opus", "--effort", "high", "--permission-mode", "auto", "--strict-mcp-config", "--session-id", UUID]);
  });

  it("prints one result line, marked FAIL when the report is missing", () => {
    assert.equal(resultLine("tmp/state/full-runs/x-phase-1.md", true, 0, UUID), `phase-exec: tmp/state/full-runs/x-phase-1.md exit 0 session ${UUID}`);
    assert.equal(resultLine("tmp/state/full-runs/x-phase-1.md", false, 0, UUID), `phase-exec: FAIL report missing tmp/state/full-runs/x-phase-1.md exit 0 session ${UUID}`);
  });
});
