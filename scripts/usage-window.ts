/**
 * Reads the account's 5-hour and 7-day usage windows with one minimal haiku call (under $0.001),
 * for the usage gate of a full run (docs/meta/procedures/full-execution.md#usage-gate).
 *
 *   npm run usage-window                        print `5h 6% (resets …) · 7d 44% (resets …)`
 *   npm run usage-window -- --label "before phase 2"   tag the reading, for --deltas
 *   npm run usage-window -- --json              print the saved record instead
 *   npm run usage-window -- --deltas            what each phase cost: every "after X" reading
 *                                               against the latest earlier "before X" (no probe)
 *
 * Each probe overwrites tmp/state/rate-limits.json and appends to tmp/state/rate-limits.jsonl, in
 * the same record shape the status line (scripts/statusline.mjs) writes. The windows are
 * account-wide: every session, subagent and claude.ai chat counts toward them. Exits 1 when the
 * probe fails or the login has no subscription windows, and then writes nothing.
 */
import { appendFileSync, mkdirSync, mkdtempSync, readFileSync, renameSync, rmSync, writeFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { tmpPath } from "../src/tmp-paths.js";
import { usageWindows, type UsageWindow } from "./lib/claude-cli.js";

type Reading = {
  captured_at: number;
  source: "probe" | "statusline";
  session_id: string | null;
  label?: string;
  cost_usd?: number;
  rate_limits: { five_hour?: UsageWindow; seven_day?: UsageWindow } | null;
};

const SNAPSHOT = tmpPath("state", "rate-limits.json");
const HISTORY = tmpPath("state", "rate-limits.jsonl");

const argv = process.argv.slice(2);
const flag = (name: string) => argv.includes(name);
const labelAt = argv.indexOf("--label");
const label = labelAt >= 0 ? argv[labelAt + 1] : undefined;
if (labelAt >= 0 && !label) {
  console.error('Usage: npm run usage-window -- [--label TEXT] [--json] | --deltas');
  process.exit(1);
}

const when = (epoch: number) =>
  new Date(epoch * 1000).toLocaleString("en-GB", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit", timeZoneName: "short" });
const show = (name: string, w?: UsageWindow) => (w ? `${name} ${w.used_percentage}% (resets ${when(w.resets_at)})` : `${name} –`);

function history(): Reading[] {
  if (!existsSync(HISTORY)) return [];
  return readFileSync(HISTORY, "utf8")
    .split("\n")
    .filter(Boolean)
    .flatMap((line) => {
      try {
        return [JSON.parse(line) as Reading];
      } catch {
        return [];
      }
    });
}

function deltas(): void {
  const rows = history();
  let printed = 0;
  rows.forEach((after, i) => {
    if (!after.label?.startsWith("after ")) return;
    const name = after.label.slice("after ".length);
    const before = rows
      .slice(0, i)
      .reverse()
      .find((r) => r.label === `before ${name}`);
    if (!before) return;
    const delta = (key: "five_hour" | "seven_day") => {
      const a = after.rate_limits?.[key];
      const b = before.rate_limits?.[key];
      if (!a || !b) return "–";
      if (a.resets_at !== b.resets_at) return "window reset";
      return `+${Math.round((a.used_percentage - b.used_percentage) * 10) / 10}`;
    };
    const minutes = Math.round((after.captured_at - before.captured_at) / 60);
    console.log(`${name}: 5h ${delta("five_hour")}, 7d ${delta("seven_day")}, ${minutes} min`);
    printed++;
  });
  if (!printed) console.log(`No "before X" / "after X" reading pairs in ${HISTORY}.`);
}

async function probe(): Promise<void> {
  const cwd = mkdtempSync(join(tmpdir(), "usage-probe-"));
  try {
    const windows = await usageWindows(cwd);
    const reading: Reading = {
      captured_at: Math.floor(Date.now() / 1000),
      source: "probe",
      session_id: null,
      ...(label ? { label } : {}),
      cost_usd: windows.cost,
      rate_limits: { five_hour: windows.five_hour, seven_day: windows.seven_day },
    };
    mkdirSync(dirname(SNAPSHOT), { recursive: true });
    writeFileSync(`${SNAPSHOT}.tmp`, `${JSON.stringify(reading, null, 2)}\n`);
    renameSync(`${SNAPSHOT}.tmp`, SNAPSHOT);
    appendFileSync(HISTORY, `${JSON.stringify(reading)}\n`);
    console.log(
      flag("--json")
        ? JSON.stringify(reading, null, 2)
        : `${show("5h", windows.five_hour)} · ${show("7d", windows.seven_day)} · probe $${windows.cost.toFixed(4)}`,
    );
  } catch (error) {
    console.error(`usage-window: ${error instanceof Error ? error.message : error}`);
    process.exitCode = 1;
  } finally {
    rmSync(cwd, { recursive: true, force: true });
  }
}

if (flag("--deltas")) deltas();
else await probe();
