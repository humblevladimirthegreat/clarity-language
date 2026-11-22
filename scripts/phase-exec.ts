// Starts one phase executor of a full run as a top-level `claude -p` process, and waits for it.
//
// Run: npm run phase-exec -- <proposal> <phase> [--rest] [--model MODEL] [--effort LEVEL]
//   <proposal>  the proposal's file name, with or without `.md`, or its path (it must exist under docs/proposals/)
//   <phase>     the phase number
//   --rest      the prompt says *the rest of phase N* (the phase was started before and stopped part way)
//   --model     the executor's model (default opus)
//   --effort    the executor's effort: low, medium, high, xhigh or max (default high)
//
// The process runs `--agent phase-executor` with `--permission-mode auto`, `--strict-mcp-config` and a
// session id picked here. The executor writes its phase report to tmp/state/full-runs/<name>-phase-<N>.md;
// the process's own output goes to tmp/logs/phase-exec-<name>-phase-<N>.log. When the process exits, one
// line is appended to tmp/state/full-runs.jsonl (proposal, phase, rest, session, start, end, exit) and one
// result line is printed:
//   phase-exec: <report path> exit <code> session <uuid>
//   phase-exec: FAIL report missing <report path> exit <code> session <uuid>
// The launcher exits with the process's exit code, or 1 when the report is missing or was not written
// during this run (a report older than the start counts as missing).
import { spawn } from "node:child_process";
import { randomUUID } from "node:crypto";
import { appendFileSync, closeSync, existsSync, mkdirSync, openSync, statSync } from "node:fs";
import { basename, dirname, join } from "node:path";
import { pathToFileURL } from "node:url";

import { REPO_ROOT } from "../src/repo-paths.js";
import { tmpPath, tmpRel } from "../src/tmp-paths.js";

export const EFFORTS = ["low", "medium", "high", "xhigh", "max"] as const;

export type PhaseExecArgs = { name: string; phase: number; rest: boolean; model: string; effort: string };

const USAGE = "Usage: npm run phase-exec -- <proposal> <phase> [--rest] [--model MODEL] [--effort LEVEL]";

/** Parses the launcher's arguments; throws an Error whose message names the problem and the usage. */
export function parseArgs(argv: string[]): PhaseExecArgs {
  const positional: string[] = [];
  let rest = false;
  let model = "opus";
  let effort = "high";
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]!;
    if (arg === "--rest") rest = true;
    else if (arg === "--model" || arg === "--effort") {
      const value = argv[++i];
      if (!value || value.startsWith("--")) throw new Error(`${arg} needs a value\n${USAGE}`);
      if (arg === "--model") model = value;
      else effort = value;
    } else if (arg.startsWith("--")) throw new Error(`unknown option ${arg}\n${USAGE}`);
    else positional.push(arg);
  }
  if (positional.length !== 2) throw new Error(`expected a proposal and a phase, got ${positional.length} argument(s)\n${USAGE}`);
  const [proposal, phaseText] = positional as [string, string];
  if (!/^[1-9]\d*$/.test(phaseText)) throw new Error(`the phase must be a positive whole number, got ${phaseText}\n${USAGE}`);
  if (!(EFFORTS as readonly string[]).includes(effort)) throw new Error(`--effort must be one of ${EFFORTS.join(", ")}, got ${effort}`);
  const name = basename(proposal).replace(/\.md$/, "");
  if (!/^[a-z0-9][a-z0-9-]*$/.test(name)) throw new Error(`not a proposal file name: ${proposal}`);
  return { name, phase: Number(phaseText), rest, model, effort };
}

/** The repo-relative staging path of a phase's report. */
export function reportRel(name: string, phase: number): string {
  return tmpRel("state", "full-runs", `${name}-phase-${phase}.md`);
}

/** The one-line prompt the executor starts from. */
export function buildPrompt(args: PhaseExecArgs, session: string): string {
  const what = args.rest ? `the rest of phase ${args.phase}` : `phase ${args.phase}`;
  return `Carry out ${what} of \`${args.name}.md\` as a full-run phase executor. Your session id is \`${session}\`; write your report to \`${reportRel(args.name, args.phase)}\`.`;
}

/** The `claude` arguments for one executor process. */
export function claudeArgs(args: PhaseExecArgs, session: string): string[] {
  return [
    "-p",
    buildPrompt(args, session),
    "--agent",
    "phase-executor",
    "--model",
    args.model,
    "--effort",
    args.effort,
    "--permission-mode",
    "auto",
    "--strict-mcp-config",
    "--session-id",
    session,
  ];
}

/** The result line printed when the process exits. */
export function resultLine(report: string, ok: boolean, exit: number, session: string): string {
  return `phase-exec: ${ok ? "" : "FAIL report missing "}${report} exit ${exit} session ${session}`;
}

function proposalExists(name: string): boolean {
  const root = join(REPO_ROOT, "docs", "proposals");
  return ["in-progress", "ready", "ideas", "rejected"].some((dir) => existsSync(join(root, dir, `${name}.md`)));
}

async function main(): Promise<void> {
  let args: PhaseExecArgs;
  try {
    args = parseArgs(process.argv.slice(2));
  } catch (e) {
    console.error(`phase-exec: ${(e as Error).message}`);
    process.exit(2);
  }
  if (!proposalExists(args.name)) {
    console.error(`phase-exec: no proposal ${args.name}.md under docs/proposals/`);
    process.exit(2);
  }
  const session = randomUUID();
  const report = tmpPath("state", "full-runs", `${args.name}-phase-${args.phase}.md`);
  const log = tmpPath("logs", `phase-exec-${args.name}-phase-${args.phase}.log`);
  mkdirSync(dirname(report), { recursive: true });
  mkdirSync(dirname(log), { recursive: true });
  const logFd = openSync(log, "w");
  const start = new Date();
  const child = spawn("claude", claudeArgs(args, session), { cwd: REPO_ROOT, stdio: ["ignore", logFd, logFd] });
  for (const signal of ["SIGINT", "SIGTERM"] as const) process.on(signal, () => child.kill(signal));
  const exit = await new Promise<number>((resolve) => {
    child.on("error", (e) => {
      appendFileSync(log, `\nphase-exec: could not start claude: ${e.message}\n`);
      resolve(127);
    });
    child.on("close", (code, signal) => resolve(code ?? (signal ? 128 : 1)));
  });
  closeSync(logFd);
  const end = new Date();
  const ok = existsSync(report) && statSync(report).mtimeMs >= start.getTime();
  const entry = { proposal: `${args.name}.md`, phase: args.phase, rest: args.rest, session, start: start.toISOString(), end: end.toISOString(), exit };
  appendFileSync(tmpPath("state", "full-runs.jsonl"), `${JSON.stringify(entry)}\n`);
  console.log(resultLine(reportRel(args.name, args.phase), ok, exit, session));
  process.exit(ok ? exit : exit || 1);
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) void main();
