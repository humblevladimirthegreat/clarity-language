#!/usr/bin/env node
/**
 * Status line command, wired in .claude/settings.json. The terminal CLI pipes the session's status
 * JSON on stdin after each assistant message; the VS Code panel does not run it.
 *
 * Prints the usage windows (`5h 42% · 7d 18%`), overwrites tmp/state/rate-limits.json with the
 * reading, and appends it to tmp/state/rate-limits.jsonl when it differs from the last one. The
 * record shape is the one `npm run usage-window` writes (scripts/usage-window.ts), which reads the
 * same windows from anywhere. `rate_limits` is only present for subscribers, after the session's
 * first API response; when it is absent the snapshot records `rate_limits: null`.
 *
 * The windows are account-wide. Any error prints nothing and writes nothing.
 */
import { readFileSync, writeFileSync, renameSync, mkdirSync, appendFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

try {
  const input = JSON.parse(readFileSync(0, "utf8"));
  const window = (w) =>
    typeof w?.used_percentage === "number" && typeof w?.resets_at === "number" ? { used_percentage: w.used_percentage, resets_at: w.resets_at } : undefined;
  const raw = input?.rate_limits;
  const limits = raw ? { five_hour: window(raw.five_hour), seven_day: window(raw.seven_day) } : null;

  const dir = join(dirname(fileURLToPath(import.meta.url)), "..", "tmp", "state");
  mkdirSync(dir, { recursive: true });
  const file = join(dir, "rate-limits.json");
  let previous = null;
  try {
    previous = JSON.parse(readFileSync(file, "utf8")).rate_limits ?? null;
  } catch {
    /* first reading */
  }
  const record = { captured_at: Math.floor(Date.now() / 1000), source: "statusline", session_id: input?.session_id ?? null, rate_limits: limits };
  writeFileSync(`${file}.tmp`, `${JSON.stringify(record, null, 2)}\n`);
  renameSync(`${file}.tmp`, file);
  if (limits && JSON.stringify(limits) !== JSON.stringify(previous)) appendFileSync(join(dir, "rate-limits.jsonl"), `${JSON.stringify(record)}\n`);

  const pct = (w) => (w ? `${Math.round(w.used_percentage)}%` : "–");
  process.stdout.write(limits ? `5h ${pct(limits.five_hour)} · 7d ${pct(limits.seven_day)}` : "5h – · 7d –");
} catch {
  // A status line must never fail loudly.
}
