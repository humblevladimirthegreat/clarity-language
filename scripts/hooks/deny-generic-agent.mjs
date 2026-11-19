#!/usr/bin/env node
/**
 * PreToolUse hook on Agent (and its old name, Task): deny a catch-all
 * subagent. The user can still start one by naming it explicitly. Wired in .claude/settings.json.
 *
 * Denied: `general-purpose`, `claude`, or no `subagent_type` (which starts
 * general-purpose). These carry every tool the session has and pay for them
 * on every turn; `proposal-worker` or a more specific agent usually fits
 * (docs/meta/procedures/proposals.md, step 6 of running with subagents).
 * Every other type, `fork` included, runs without a prompt.
 *
 * Prints a PreToolUse decision of "deny" on stdout; prints nothing (and the
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
      `Subagent type "${type}" is denied: it carries every tool and pays for them on every turn. ` +
      `Use a prebuilt agent instead: proposal-worker (units of work), Explore (read-only search), ` +
      `Plan, style-editor, checkpoint-writer, or fork. In the rare case where none fits, stop and ask the ` +
      `user. Summarize why you think a new agent type is warranted (what the prebuilt agents lack), what the new ` +
      `agent would do, and which tools it would have access to. Create the definition in .claude/agents/ and ` +
      `spawn it only with their OK.`;
    process.stdout.write(
      JSON.stringify({
        hookSpecificOutput: {
          hookEventName: "PreToolUse",
          permissionDecision: "deny",
          permissionDecisionReason: reason,
        },
      }),
    );
  }
} catch {
  // Never block on a hook failure.
}
process.exit(0);
