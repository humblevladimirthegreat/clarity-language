import { chatCompletionJson, type ChatMessage, type ChatOptions, type LlmClientConfig } from "./llm-client.js";
import { parseVerdict } from "./lexicon-review-checks.js";
import { cacheKeyFor, nearFlag, type ReviewStore } from "./lexicon-review-store.js";
import type { Check, Subject, Verdict } from "./lexicon-review-types.js";

export type AskFn = (messages: ChatMessage[]) => Promise<Verdict>;

export type Reasoning = NonNullable<ChatOptions["reasoningEffort"]> | "default";

/** The cache key must change with the reasoning setting, since it changes the answers. */
export function modelTag(model: string, reasoning: Reasoning): string {
  return reasoning === "default" ? model : `${model}@${reasoning}`;
}

/** Temperature 0 and a fixed seed so a rerun of the same prompt gives the same answer. */
export function llmAsk(config: LlmClientConfig, reasoning: Reasoning = "default", seed = 1): AskFn {
  const reasoningEffort = reasoning === "default" ? undefined : reasoning;
  return (messages) =>
    chatCompletionJson(
      config,
      messages,
      { temperature: 0, maxTokens: 2048, seed, ...(reasoningEffort ? { reasoningEffort } : {}) },
      parseVerdict,
    );
}

export type RunOptions = {
  check: Check;
  subjects: Subject[];
  model: string;
  store: ReviewStore;
  ask: AskFn;
  variants?: Array<0 | 1>;
  /**
   * Ask pass 0 for every subject, then pass 1 only where pass 0 landed within a point of the
   * flag boundary. Clear scores keep a single pass; about a third of the calls of a full run.
   */
  adaptive?: boolean;
  limit?: number;
  /** Restrict to these subject keys or labels (roots / stems). */
  only?: Set<string>;
  onProgress?: (info: { done: number; total: number; asked: number; etaMs: number }) => void;
  now?: () => Date;
};

export type RunSummary = { total: number; asked: number; cached: number; errors: number };

export function selectSubjects(options: Pick<RunOptions, "check" | "subjects" | "only" | "limit">): Subject[] {
  let picked = options.subjects.filter((s) => s.kind === options.check.kind && options.check.select(s));
  if (options.only && options.only.size > 0) {
    picked = picked.filter((s) => options.only!.has(s.key) || options.only!.has(s.label));
  }
  if (options.limit !== undefined) picked = picked.slice(0, options.limit);
  return picked;
}

/** Ask every (subject, variant) not already cached; one failed call is recorded and skipped, not fatal. */
export async function runCheck(options: RunOptions): Promise<RunSummary> {
  const { check, model, store, ask } = options;
  const subjects = selectSubjects(options);
  const now = options.now ?? (() => new Date());
  const summary: RunSummary = { total: 0, asked: 0, cached: 0, errors: 0 };
  const started = Date.now();

  const pass = async (list: Subject[], variant: 0 | 1, offset: number, total: number): Promise<void> => {
    let done = offset;
    for (const subject of list) {
      const messages = check.prompt(subject, variant);
      const cacheKey = cacheKeyFor(model, messages);
      done++;
      if (store.isDone(cacheKey)) {
        summary.cached++;
        continue;
      }
      const base = { check: check.id, key: subject.key, variant, model, cacheKey, ts: now().toISOString() };
      try {
        store.append({ ...base, ...(await ask(messages)) });
      } catch (err) {
        summary.errors++;
        store.append({ ...base, error: err instanceof Error ? err.message : String(err) });
      }
      summary.asked++;
      const perCall = (Date.now() - started) / summary.asked;
      options.onProgress?.({ done, total, asked: summary.asked, etaMs: perCall * (total - done) });
    }
  };

  if (options.adaptive) {
    await pass(subjects, 0, 0, subjects.length);
    const second = subjects.filter((s) => {
      const record = store.get(cacheKeyFor(model, check.prompt(s, 0)));
      return record?.score !== undefined && nearFlag(check, record.score);
    });
    summary.total = subjects.length + second.length;
    await pass(second, 1, 0, second.length);
    return summary;
  }

  const variants = options.variants ?? [0, 1];
  summary.total = subjects.length * variants.length;
  let offset = 0;
  for (const variant of variants) {
    await pass(subjects, variant, offset, summary.total);
    offset += subjects.length;
  }
  return summary;
}
