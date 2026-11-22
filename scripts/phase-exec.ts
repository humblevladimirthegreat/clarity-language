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
// session id picked here, with CLAUDE_CODE_DISABLE_CLAUDE_MDS=1 in its environment so it starts without
// AGENTS.md (`claude -p --agent` ignores the agent file's `omitClaudeMd`). The executor writes its phase report to tmp/state/full-runs/<name>-phase-<N>.md;
// the process's own output goes to tmp/logs/phase-exec-<name>-phase-<N>.log. When the process starts, one
// line is appended to tmp/state/full-runs.jsonl (proposal, phase, rest, session, start); at exit that line is
// rewritten in place with end and exit added (a launcher that died keeps the start fields only). One
// result line is printed at exit:
//   phase-exec: <report path> exit <code> session <uuid>
//   phase-exec: FAIL report missing <report path> exit <code> session <uuid>
// The launcher exits with the process's exit code, or 1 when the report is missing or was not written
// during this run (a report older than the start counts as missing).
import { spawn } from "node:child_process";
import { randomUUID } from "node:crypto";
import { appendFileSync, closeSync, existsSync, mkdirSync, openSync, readFileSync, statSync, writeFileSync } from "node:fs";
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

/** The executor process's environment: this one's, with AGENTS.md and CLAUDE.md files turned off. */
export function claudeEnv(env: NodeJS.ProcessEnv = process.env): NodeJS.ProcessEnv {
  return { ...env, CLAUDE_CODE_DISABLE_CLAUDE_MDS: "1" };
}

/** Appends the start line of a run to the JSONL file. */
export function recordStart(file: string, entry: Record<string, unknown>): void {
  appendFileSync(file, `${JSON.stringify(entry)}\n`);
}

/** Rewrites the line of one session in place, adding the exit fields; appends the line when it is missing. */
export function recordEnd(file: string, session: string, fields: Record<string, unknown>): void {
  const lines = existsSync(file) ? readFileSync(file, "utf8").split("\n").filter(Boolean) : [];
  let found = false;
  const out = lines.map((l) => {
    try {
      const o = JSON.parse(l) as Record<string, unknown>;
      if (o.session === session) {
        found = true;
        return JSON.stringify({ ...o, ...fields });
      }
    } catch {
      /* keep a line that is not JSON as it is */
    }
    return l;
  });
  if (!found) out.push(JSON.stringify({ session, ...fields }));
  writeFileSync(file, `${out.join("\n")}\n`);
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
  const runs = tmpPath("state", "full-runs.jsonl");
  recordStart(runs, { proposal: `${args.name}.md`, phase: args.phase, rest: args.rest, session, start: start.toISOString() });
  const child = spawn("claude", claudeArgs(args, session), { cwd: REPO_ROOT, env: claudeEnv(), stdio: ["ignore", logFd, logFd] });
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
  recordEnd(runs, session, { end: end.toISOString(), exit, report: reportRel(args.name, args.phase) });
  console.log(resultLine(reportRel(args.name, args.phase), ok, exit, session));
  process.exit(ok ? exit : exit || 1);
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) void main();
