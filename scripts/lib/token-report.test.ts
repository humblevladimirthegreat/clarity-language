// Runs scripts/token-report.mjs on a small synthetic transcript folder built here (no real transcripts).
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, before, describe, it } from "node:test";

import { REPO_ROOT } from "../../src/repo-paths.js";

type Call = { name: string; input: Record<string, unknown>; result: string };

const usage = (ctx: number) => ({ input_tokens: 10, cache_read_input_tokens: ctx, cache_creation_input_tokens: 100, output_tokens: 50 });

/** A transcript: one assistant message and one tool result per call, then a closing message. */
function transcript(calls: Call[]): string {
  const out: object[] = [];
  const at = (n: number) => `2026-01-0${1 + (n % 2)}T10:00:0${n % 10}.000Z`;
  calls.forEach((c, i) => {
    const id = `toolu_${i}`;
    out.push({ type: "assistant", timestamp: at(i), message: { id: `msg_${i}`, usage: usage(1000 * (i + 1)), content: [{ type: "tool_use", id, name: c.name, input: c.input }] } });
    out.push({ type: "user", timestamp: at(i), message: { content: [{ type: "tool_result", tool_use_id: id, content: c.result }] } });
  });
  out.push({ type: "assistant", timestamp: at(9), message: { id: "msg_end", usage: usage(9000), content: [{ type: "text", text: "done" }] } });
  return out.map((o) => JSON.stringify(o)).join("\n") + "\n";
}

const bash = (command: string, result = "ok"): Call => ({ name: "Bash", input: { command }, result });

/** A main session: one API call with text and two tool calls, then one that writes its whole context again (a cache expiry). */
function mainTranscript(): string {
  const at = "2026-01-01T10:00:00.000Z";
  const out = [
    { type: "assistant", timestamp: at, message: { id: "m1", usage: { input_tokens: 10, cache_read_input_tokens: 2000, output_tokens: 100 }, content: [{ type: "text", text: "Looking at the docs folder first." }] } },
    { type: "assistant", timestamp: at, message: { id: "m1", usage: { input_tokens: 10, cache_read_input_tokens: 2000, output_tokens: 100 }, content: [{ type: "tool_use", id: "t1", name: "Bash", input: { command: "ls docs" } }] } },
    { type: "assistant", timestamp: at, message: { id: "m1", usage: { input_tokens: 10, cache_read_input_tokens: 2000, output_tokens: 100 }, content: [{ type: "tool_use", id: "t2", name: "Bash", input: { command: "ls src" } }] } },
    { type: "user", timestamp: at, message: { content: [{ type: "tool_result", tool_use_id: "t1", content: "SECRET-BODY-1" }] } },
    { type: "user", timestamp: at, message: { content: [{ type: "tool_result", tool_use_id: "t2", content: "x".repeat(720) }] } },
    { type: "assistant", timestamp: at, message: { id: "m2", usage: { input_tokens: 10, cache_creation: { ephemeral_5m_input_tokens: 40000 }, cache_creation_input_tokens: 40000, output_tokens: 100 }, content: [{ type: "tool_use", id: "t3", name: "Read", input: { file_path: "docs/a.md" } }] } },
    { type: "user", timestamp: at, message: { content: [{ type: "tool_result", tool_use_id: "t3", content: "SECRET-BODY-3" }] } },
    { type: "assistant", timestamp: at, message: { id: "m3", usage: { input_tokens: 10, cache_read_input_tokens: 40000, output_tokens: 10 }, content: [{ type: "text", text: "done" }] } },
  ];
  return out.map((o) => JSON.stringify(o)).join("\n") + "\n";
}

describe("token-report", () => {
  let dir = "";
  before(() => {
    dir = mkdtempSync(join(tmpdir(), "ageben-token-report-"));
    writeFileSync(join(dir, "aaaa1111.jsonl"), mainTranscript());
    const subs = join(dir, "aaaa1111", "subagents");
    mkdirSync(subs, { recursive: true });
    const unit = (id: string, desc: string, extra: Call[]) => {
      writeFileSync(join(subs, `agent-${id}.meta.json`), JSON.stringify({ description: desc, agentType: "general-purpose" }));
      writeFileSync(
        join(subs, `agent-${id}.jsonl`),
        transcript([
          bash(`cat > tmp/scratch/${desc.toLowerCase().replace(" ", "-")}-sweep.ts <<'EOF'\nconsole.log(1)\nEOF`),
          bash(`npx --no-install tsx tmp/scratch/${desc.toLowerCase().replace(" ", "-")}-sweep.ts`),
          bash("grep -n 'zorp quux' src/a.ts | head"),
          ...extra,
        ]),
      );
    };
    unit("b1b1b1", "Unit B1", [bash("node scripts/reading.mjs probe tmp/scratch/p.txt"), bash("npm run -s verify -- --fast", "verify: PASS")]);
    unit("b2b2b2", "Unit B2", []);
    unit("b3b3b3", "Unit B3", []);
  });
  after(() => rmSync(dir, { recursive: true, force: true }));

  const run = (...args: string[]) => execFileSync("node", ["scripts/token-report.mjs", "--dir", dir, "--since", "2020-01-01", ...args], { cwd: REPO_ROOT, encoding: "utf8" });

  it("reports the whole folder by default", () => {
    assert.match(run(), /1 sessions, 3 subagents/);
  });

  it("--agent picks subagents by description text or id prefix", () => {
    assert.match(run("--agent", "unit b2"), /0 sessions, 1 subagents/);
    assert.match(run("--agent", "b3b3"), /0 sessions, 1 subagents/);
    assert.match(run("--agent", "nothing like it"), /No transcript .* matches --agent nothing like it/);
  });

  it("--session picks that session and its subagents; with --agent only the matching subagents", () => {
    assert.match(run("--session", "aaaa"), /1 sessions, 3 subagents/);
    assert.match(run("--session", "aaaa", "--agent", "B1"), /0 sessions, 1 subagents/);
    assert.match(run("--session", "zzzz"), /No transcript .* matches --session zzzz/);
  });

  it("--calls prints one line per tool call with the repo's kinds", () => {
    const out = run("--agent", "Unit B1", "--calls");
    const lines = out.slice(out.indexOf("## Tool calls")).split("\n").filter((l) => /^ +\d+ /.test(l));
    assert.deepEqual(
      lines.map((l) => l.trim().split(/\s{2,}|\s+(?=\d+k)/)[0]?.replace(/^\d+\s+/, "")),
      ["scripted edit", "one-off tool", "exploration", "probe", "check"],
    );
    assert.match(lines[0] ?? "", /^\s+1 scripted edit\s+0k\s+1k\s+\d+k\s+\d+k\s+[\d.]+%  Bash: cat > tmp\/scratch\/unit-b1-sweep\.ts/);
    assert.match(lines[4] ?? "", /^\s+5 check .* 5k /);
  });

  const callRows = (out: string) => out.slice(out.indexOf("## Tool calls")).split("\n").filter((l) => /^ +\d+ /.test(l));

  it("--calls shows each API call's cost once, and a cache expiry as one large cost", () => {
    const rows = callRows(run("--session", "aaaa", "--calls"));
    // input 10 + read 200 + output 500 = 710; then 10 + 40000 × 1.25 + 500 = 50510
    assert.match(rows[0] ?? "", /^\s+1 exploration\s+0k\s+2k\s+1k\s/);
    assert.match(rows[1] ?? "", /^\s+2 exploration\s+0k\s+2k\s+"\s/);
    assert.match(rows[2] ?? "", /^\s+3 exploration\s+0k\s+40k\s+51k\s/);
  });

  it("--top keeps the costliest rows per transcript, in call order, and counts the rest", () => {
    const out = run("--session", "aaaa", "--calls", "--top", "2");
    const calls = out.slice(out.indexOf("## Tool calls"));
    const main = /aaaa1111 main[^\n]*\n((?: {4}[^\n]*\n)*)/.exec(calls)?.[1] ?? "";
    assert.deepEqual(main.split("\n").filter((l) => /^ +\d+ /.test(l)).map((l) => l.trim().split(" ")[0]), ["1", "3"]);
    assert.match(main, /… 1 rows left out \(--top 2\)/);
  });

  it("--show prints the text before each call, its input, and its result's size, never the body", () => {
    const out = run("--session", "aaaa", "--show", "main:1-2");
    assert.match(out, /^## Tool calls 1-2 of aaaa1111 main/);
    assert.match(out, /1 exploration {2}cost 1k .*\n {4}text: Looking at the docs folder first\.\n {4}input: ls docs\n {4}result: 13 chars/);
    assert.match(out, /2 exploration {2}cost " \(API call shared with the call before; 1k\).*\n {4}input: ls src\n {4}result: 720 chars, ~0k tokens/);
    assert.doesNotMatch(out, /SECRET-BODY|## Spend|text: Looking.*\n.*\n.*\n.*\n {4}text/);
    assert.match(run("--show", "b2b2:1-1"), /sub b2b2b2 Unit B2[\s\S]*input: cat > tmp\/scratch\/unit-b2-sweep\.ts/);
  });

  it("a listing over 200 rows prints each transcript's 10 costliest and saves the rest under tmp/logs", () => {
    const big = mkdtempSync(join(tmpdir(), "ageben-token-report-big-"));
    try {
      writeFileSync(join(big, "cccc3333.jsonl"), transcript(Array.from({ length: 205 }, (_, i) => bash(`ls dir${i}`))));
      const out = execFileSync("node", ["scripts/token-report.mjs", "--dir", big, "--since", "2020-01-01", "--calls"], { cwd: REPO_ROOT, encoding: "utf8" });
      assert.match(out, /205 rows: each transcript's 10 costliest here; the full listing is in tmp\/logs\/token-report-calls\.txt/);
      assert.equal(callRows(out).length, 10);
      assert.match(out, /… 195 rows left out \(see tmp\/logs\/token-report-calls\.txt\)/);
      const saved = readFileSync(join(REPO_ROOT, "tmp/logs/token-report-calls.txt"), "utf8");
      assert.equal(callRows(saved).length, 205);
    } finally {
      rmSync(big, { recursive: true, force: true });
    }
  });

  it("lists shapes that recur in 3 or more subagents, with the unit stem replaced", () => {
    const out = run();
    const shapes = out.slice(out.indexOf("## Recurring shapes"), out.indexOf("## Skills"));
    assert.match(shapes, /3\s+3\s+write scratch\/\*-sweep\.ts/);
    assert.match(shapes, /3\s+3\s+run scratch\/\*-sweep\.ts/);
    assert.match(shapes, /3\s+3\s+grep zorp quux/);
    assert.doesNotMatch(shapes, /probe|verify/);
  });
});
