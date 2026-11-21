/**
 * Isolated `claude -p` calls for the model evals (llm-eval.ts, english-helper-eval.ts) and the
 * usage-window probe (usage-window.ts), and the seeded shuffle the evals sample with. Each call runs from an empty directory with no tools,
 * settings, MCP, or project files, and reports its cost and tokens.
 */
import { spawn } from "node:child_process";

/** Tokens one call used: input counts cache reads and writes too. */
export type Tokens = { input: number; output: number };
export type CallResult = { text: string; structured?: unknown; models: string[]; cost: number; tokens: Tokens };

/** The flags that isolate a `claude -p` call: no tools, settings, MCP, or session file. */
function isolatedArgs(model: string, system: string): string[] {
  return ["-p", "--model", model, "--tools", "", "--setting-sources", "", "--strict-mcp-config", "--no-session-persistence", "--system-prompt", system];
}

/** One isolated `claude -p` call from `cwd`, which should be an empty directory. */
export function claude(cwd: string, model: string, system: string, prompt: string, schema?: object): Promise<CallResult> {
  const args = [...isolatedArgs(model, system), "--output-format", "json"];
  if (schema) args.push("--json-schema", JSON.stringify(schema));
  return new Promise((resolve, reject) => {
    const child = spawn("claude", args, { cwd, stdio: ["pipe", "pipe", "pipe"] });
    let stdout = "";
    let stderr = "";
    const timer = setTimeout(() => child.kill("SIGKILL"), 300_000);
    child.stdout.on("data", (chunk) => (stdout += chunk));
    child.stderr.on("data", (chunk) => (stderr += chunk));
    child.on("error", reject);
    child.on("close", (code) => {
      clearTimeout(timer);
      try {
        const json = JSON.parse(stdout) as {
          is_error?: boolean;
          result?: string;
          structured_output?: unknown;
          modelUsage?: Record<string, unknown>;
          total_cost_usd?: number;
          usage?: { input_tokens?: number; cache_creation_input_tokens?: number; cache_read_input_tokens?: number; output_tokens?: number };
        };
        if (json.is_error) throw new Error(json.result ?? "is_error");
        const models = Object.keys(json.modelUsage ?? {});
        // The CLI may spend a little on a helper model; the answer must come from the one asked for.
        if (!models.includes(model)) throw new Error(`asked for ${model}, got ${models.join(", ")}`);
        const u = json.usage ?? {};
        const tokens = { input: (u.input_tokens ?? 0) + (u.cache_creation_input_tokens ?? 0) + (u.cache_read_input_tokens ?? 0), output: u.output_tokens ?? 0 };
        resolve({ text: json.result ?? "", structured: json.structured_output, models, cost: json.total_cost_usd ?? 0, tokens });
      } catch (error) {
        reject(new Error(`claude exited ${code}: ${error instanceof Error ? error.message : error}\n${stderr.slice(0, 500)}`));
      }
    });
    child.stdin.end(prompt);
  });
}

/** One usage window: the share used (0-100) and when it resets (Unix epoch seconds). */
export type UsageWindow = { used_percentage: number; resets_at: number };
export type UsageWindows = { five_hour?: UsageWindow; seven_day?: UsageWindow; cost: number };

/**
 * The account's subscription usage windows, read from the `rate_limit_event` a minimal haiku call
 * streams back (about 600 input tokens, under $0.001). Runs from a fresh empty directory outside
 * the repo so no project instructions load. Rejects when the response carries no windows
 * (no subscription) or the call fails.
 */
export function usageWindows(cwd: string): Promise<UsageWindows> {
  const args = [...isolatedArgs("haiku", "Reply with ok."), "--max-turns", "1", "--disable-slash-commands", "--output-format", "stream-json", "--verbose"];
  return new Promise((resolve, reject) => {
    const child = spawn("claude", args, { cwd, stdio: ["pipe", "pipe", "pipe"] });
    let stdout = "";
    let stderr = "";
    const timer = setTimeout(() => child.kill("SIGKILL"), 90_000);
    child.stdout.on("data", (chunk) => (stdout += chunk));
    child.stderr.on("data", (chunk) => (stderr += chunk));
    child.on("error", reject);
    child.on("close", (code) => {
      clearTimeout(timer);
      type Window = { utilization?: number; resetsAt?: number };
      let windows: Record<string, Window> | undefined;
      let cost = 0;
      let failure: string | undefined;
      for (const line of stdout.split("\n")) {
        if (!line.startsWith("{")) continue;
        let event: { type?: string; is_error?: boolean; result?: string; total_cost_usd?: number; rate_limit_info?: { unifiedWindows?: Record<string, Window> } };
        try {
          event = JSON.parse(line);
        } catch {
          continue;
        }
        if (event.type === "rate_limit_event") windows = event.rate_limit_info?.unifiedWindows ?? windows;
        if (event.type === "result") {
          cost = event.total_cost_usd ?? 0;
          if (event.is_error) failure = event.result ?? "is_error";
        }
      }
      const pick = (w?: Window): UsageWindow | undefined =>
        typeof w?.utilization === "number" && typeof w.resetsAt === "number" ? { used_percentage: Math.round(w.utilization * 1000) / 10, resets_at: w.resetsAt } : undefined;
      const result = { five_hour: pick(windows?.five_hour), seven_day: pick(windows?.seven_day), cost };
      if (failure || (!result.five_hour && !result.seven_day)) {
        reject(new Error(`claude exited ${code}: ${failure ?? "no usage windows in the response (is this a subscription login?)"}\n${stderr.slice(0, 500)}`));
      } else resolve(result);
    });
    child.stdin.end("ok");
  });
}

export async function withRetry<T>(run: () => Promise<T>, tries = 3): Promise<T> {
  for (let attempt = 1; ; attempt++) {
    try {
      return await run();
    } catch (error) {
      if (attempt >= tries) throw error;
      await new Promise((r) => setTimeout(r, 5000 * attempt));
    }
  }
}

/** Mulberry32: a seeded random source, so a rerun samples the same items. */
export function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffle<T>(items: readonly T[], random: () => number): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [out[i], out[j]] = [out[j]!, out[i]!];
  }
  return out;
}
