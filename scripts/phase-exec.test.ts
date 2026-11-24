import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { buildPrompt, claudeArgs, claudeEnv, parseArgs, recordEnd, recordStart, reportRel, resultLine } from "./phase-exec.ts";

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

  it("starts the process without AGENTS.md, keeping the rest of the environment", () => {
    assert.deepEqual(claudeEnv({ PATH: "/bin", HOME: "/h" }), {
      PATH: "/bin",
      HOME: "/h",
      CLAUDE_CODE_DISABLE_CLAUDE_MDS: "1",
      CLAUDE_CODE_PRINT_BG_WAIT_CEILING_MS: "0",
    });
  });

  it("prints one result line, marked FAIL when the report is missing", () => {
    assert.equal(resultLine("tmp/state/full-runs/x-phase-1.md", true, 0, UUID), `phase-exec: tmp/state/full-runs/x-phase-1.md exit 0 session ${UUID}`);
    assert.equal(resultLine("tmp/state/full-runs/x-phase-1.md", false, 0, UUID), `phase-exec: FAIL report missing tmp/state/full-runs/x-phase-1.md exit 0 session ${UUID}`);
  });
});

describe("phase-exec run record", () => {
  const read = (f: string) => readFileSync(f, "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l));
  it("writes the start line, then rewrites only that session's line with the exit fields", () => {
    const f = join(mkdtempSync(join(tmpdir(), "phase-exec-")), "full-runs.jsonl");
    recordStart(f, { proposal: "a.md", phase: 1, session: "s1", start: "t1" });
    recordStart(f, { proposal: "a.md", phase: 2, session: "s2", start: "t2" });
    assert.deepEqual(read(f)[0], { proposal: "a.md", phase: 1, session: "s1", start: "t1" });
    recordEnd(f, "s1", { end: "t3", exit: 0, report: "r.md" });
    const lines = read(f);
    assert.equal(lines.length, 2);
    assert.deepEqual(lines[0], { proposal: "a.md", phase: 1, session: "s1", start: "t1", end: "t3", exit: 0, report: "r.md" });
    assert.deepEqual(lines[1], { proposal: "a.md", phase: 2, session: "s2", start: "t2" });
  });
});
