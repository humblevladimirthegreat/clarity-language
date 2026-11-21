// Runs scripts/token-report.mjs on a small synthetic transcript folder built here (no real transcripts).
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
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

describe("token-report", () => {
  let dir = "";
  before(() => {
    dir = mkdtempSync(join(tmpdir(), "ageben-token-report-"));
    writeFileSync(join(dir, "aaaa1111.jsonl"), transcript([bash("ls docs")]));
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
    assert.match(lines[0] ?? "", /^\s+1 scripted edit\s+0k\s+1k\s+\d+k\s+[\d.]+%  Bash: cat > tmp\/scratch\/unit-b1-sweep\.ts/);
    assert.match(lines[4] ?? "", /^\s+5 check .* 5k /);
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
