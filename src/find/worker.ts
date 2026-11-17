/**
 * find worker thread: rebuilds the queries from the CLI arguments, loads the
 * `--diff` parser from its bundle when there is one, then runs each task the
 * main thread sends and posts back its plain reply (`pool.ts`). Bundled beside
 * the CLI as `dist/find/worker.bundle.mjs`.
 */
import { parentPort, workerData } from "node:worker_threads";

import { parseFindArgs } from "./pass.js";
import { currentContext, runTask, type WorkerReply, type WorkerRequest, type WorkerSetup } from "./pool.js";
import { importRevParser } from "./rev-parser.js";

const port = parentPort;
if (!port) throw new Error("find worker must run in a worker thread");

const setup = workerData as WorkerSetup;
const revParser = setup.revModule ? await importRevParser(setup.revModule, setup.rev ?? "REV") : undefined;
const context = currentContext(parseFindArgs(setup.args), revParser, setup.cwd);

port.on("message", (request: WorkerRequest) => {
  if (request === null) {
    port.close();
    return;
  }
  let message: WorkerReply;
  try {
    message = { index: request.index, reply: runTask(request.task, context) };
  } catch (error) {
    message = { index: request.index, error: (error as Error).stack ?? String(error) };
  }
  port.postMessage(message);
});
