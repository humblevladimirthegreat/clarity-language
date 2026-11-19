/**
 * Worker threads for a find pass. A pass is a list of per-file tasks; with one
 * job they run inline, otherwise in workers (`worker.ts`, bundled beside the CLI)
 * that get the CLI arguments and build their own queries. Files go out largest
 * first; replies come back as plain records and are returned in task order, so
 * output is the same with any job count. A file is scanned by one worker, which
 * writes it under `--write`.
 */
import { statSync } from "node:fs";
import { availableParallelism } from "node:os";
import { Worker } from "node:worker_threads";

import type { ClassifyTables } from "../parse/classify.js";
import { loadDefaultTables } from "../parse/index.js";
import { CURRENT_PARSER } from "./examples.js";
import { mergeRecords, scanFile, scopeFile, type FileRecord, type FindOptions } from "./pass.js";
import type { ImportedParser } from "./rev-parser.js";
import type { ScopeParser, ScopeRecord } from "./scope-diff.js";

/** One file's work: a query scan (`runPass`), or a scope pass with the current parser or the one at `--diff` REV. */
export type PassTask = { kind: "scan"; file: string } | { kind: "scope"; file: string; rev: boolean; filter: boolean };

export type TaskReply =
  | { kind: "scan"; record: FileRecord }
  | { kind: "scope"; records: ScopeRecord[]; sawScope: boolean };

/** What a worker starts with: the CLI arguments, the cwd paths are relative to, and the `--diff` parser bundle. */
export type WorkerSetup = { args: string[]; cwd: string; revModule?: string; rev?: string };

/** Main thread to worker: run this task; `null` closes the worker. */
export type WorkerRequest = { index: number; task: PassTask } | null;
/** Worker to main thread: the task's reply, or the error that stopped it. */
export type WorkerReply = { index: number; reply: TaskReply } | { index: number; error: string };

/** What tasks run against: the parsed options and the parsers. */
export type TaskContext = { options: FindOptions; tables: ClassifyTables; revParser?: ImportedParser; cwd: string };

export function currentContext(options: FindOptions, revParser?: ImportedParser, cwd = process.cwd()): TaskContext {
  return { options, tables: loadDefaultTables(), revParser, cwd };
}

export function runTask(task: PassTask, context: TaskContext): TaskReply {
  const { options, tables, revParser, cwd } = context;
  if (task.kind === "scan") return { kind: "scan", record: scanFile(task.file, options, tables, cwd) };
  if (task.rev && !revParser) throw new Error("find: a --diff task without the parser at REV");
  const parser: ScopeParser = task.rev ? revParser! : { tables, ...CURRENT_PARSER };
  const records = scopeFile(task.file, options, parser, task.filter, cwd);
  return { kind: "scope", records, sawScope: revParser?.sawScope() ?? false };
}

/**
 * Default worker count. One per spare core (`availableParallelism() - 1`) measured slower than
 * inline on a 12-thread machine (per-thread warm-up and contention), so the default stays inline
 * until the orchestrator picks one; `--jobs N` opts in.
 */
export const DEFAULT_JOBS = 1;

/** Spare cores, the design's default: `availableParallelism() - 1`, at least 1. */
export function spareCores(): number {
  return Math.max(1, availableParallelism() - 1);
}

/** Worker count: `--jobs`, else `DEFAULT_JOBS`, capped at the file count. */
export function passJobs(options: Pick<FindOptions, "jobs">, fileCount: number): number {
  const wanted = options.jobs ?? DEFAULT_JOBS;
  return Math.max(1, Math.min(wanted, fileCount));
}

/**
 * Runs `tasks` with `jobs` workers started from `workerUrl` (inline when `jobs` is 1)
 * and returns the replies in task order. `revParser` is the `--diff` parser; workers
 * import it again from its bundle path.
 */
export async function runTasks(
  tasks: PassTask[],
  options: FindOptions,
  jobs: number,
  workerUrl: URL | string,
  revParser?: ImportedParser & { module: string; sha: string },
): Promise<TaskReply[]> {
  if (jobs <= 1) {
    const context = currentContext(options, revParser);
    return tasks.map((task) => runTask(task, context));
  }
  const replies: TaskReply[] = new Array(tasks.length);
  const sizes = new Map<string, number>();
  const size = (file: string) => {
    if (!sizes.has(file)) sizes.set(file, statSync(file).size);
    return sizes.get(file)!;
  };
  const queue = tasks.map((task, index) => ({ task, index })).sort((a, b) => size(b.task.file) - size(a.task.file) || a.index - b.index);
  const setup: WorkerSetup = { args: options.args, cwd: process.cwd(), revModule: revParser?.module, rev: revParser?.sha };
  const workers: Worker[] = [];
  try {
    await new Promise<void>((resolve, reject) => {
      let pending = tasks.length;
      const feed = (worker: Worker) => {
        const next = queue.shift();
        worker.postMessage((next ?? null) satisfies WorkerRequest);
      };
      for (let i = 0; i < jobs; i++) {
        const worker = new Worker(workerUrl, { workerData: setup });
        workers.push(worker);
        worker.on("message", (message: WorkerReply) => {
          if ("error" in message) {
            reject(new Error(`find worker failed on ${tasks[message.index]!.file}: ${message.error}`));
            return;
          }
          replies[message.index] = message.reply;
          if (--pending === 0) resolve();
          else feed(worker);
        });
        worker.on("error", reject);
        worker.on("exit", (code) => {
          if (code !== 0) reject(new Error(`find worker exited with code ${code}`));
        });
        feed(worker);
      }
    });
  } finally {
    await Promise.all(workers.map((worker) => worker.terminate()));
  }
  return replies;
}

/** `runPass` in workers: one scan task per file, merged in walk order. */
export async function poolPass(files: string[], options: FindOptions, workerUrl: URL | string): Promise<FileRecord> {
  const tasks: PassTask[] = files.map((file) => ({ kind: "scan", file }));
  const replies = await runTasks(tasks, options, passJobs(options, files.length), workerUrl);
  return mergeRecords(replies.map((reply) => (reply as Extract<TaskReply, { kind: "scan" }>).record));
}

/**
 * Both `--diff` passes in one pool: the current parse (filtered by the queries) and the parse at REV
 * (every example). Returns each side's records in walk order and whether REV ever returned a scope record.
 */
export async function poolScopeDiff(
  files: string[],
  options: FindOptions,
  workerUrl: URL | string,
  revParser: ImportedParser & { module: string; sha: string },
): Promise<{ now: ScopeRecord[]; atRev: ScopeRecord[]; sawScope: boolean }> {
  const tasks: PassTask[] = [
    ...files.map((file): PassTask => ({ kind: "scope", file, rev: false, filter: true })),
    ...files.map((file): PassTask => ({ kind: "scope", file, rev: true, filter: false })),
  ];
  const replies = (await runTasks(tasks, options, passJobs(options, files.length), workerUrl, revParser)) as Extract<
    TaskReply,
    { kind: "scope" }
  >[];
  const now = replies.slice(0, files.length).flatMap((reply) => reply.records);
  const rev = replies.slice(files.length);
  return { now, atRev: rev.flatMap((reply) => reply.records), sawScope: revParser.sawScope() || rev.some((reply) => reply.sawScope) };
}
