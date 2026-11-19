#!/usr/bin/env node
/**
 * PreToolUse hook on Agent (and its old name, Task): ask the user before a
 * catch-all subagent starts. Wired in .claude/settings.json.
 *
 * Asked: `general-purpose`, `claude`, or no `subagent_type` (which starts
 * general-purpose). These carry every tool the session has and pay for them
 * on every turn; `proposal-worker` or a more specific agent usually fits
 * (docs/meta/procedures/proposals.md, step 6 of running with subagents).
 * Every other type, `fork` included, runs without a prompt.
 *
 * Prints a PreToolUse decision of "ask" on stdout; prints nothing (and the
 * call goes on) otherwise. Any internal error lets the call run.
 */
import { readFileSync } from "node:fs";

const GENERIC = new Set(["general-purpose", "claude"]);

try {
  const input = JSON.parse(readFileSync(0, "utf8"));
  const raw = input?.tool_input?.subagent_type;
  const type = typeof raw === "string" && raw.trim() !== "" ? raw.trim() : "general-purpose";
  if (GENERIC.has(type)) {
    const reason =
      `Subagent type "${type}" carries every tool and is used only with the user's OK. ` +
      `Prefer proposal-worker (or Explore for read-only search) unless the user asked for this one.`;
    process.stdout.write(
      JSON.stringify({
        hookSpecificOutput: {
          hookEventName: "PreToolUse",
          permissionDecision: "ask",
          permissionDecisionReason: reason,
        },
      }),
    );
  }
} catch {
  // Never block on a hook failure.
}
process.exit(0);
