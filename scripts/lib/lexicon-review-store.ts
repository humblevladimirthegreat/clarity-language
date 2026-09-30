import { createHash } from "node:crypto";
import { appendFileSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

import type { ChatMessage } from "./llm-client.js";
import { REVIEW_DIR } from "./lexicon-review-subjects.js";
import type { Aggregate, Check, ReviewRecord } from "./lexicon-review-types.js";

export function cacheKeyFor(model: string, messages: ChatMessage[]): string {
  return createHash("sha1").update(model).update("\0").update(JSON.stringify(messages)).digest("hex");
}

export function storePath(checkId: string, dir = REVIEW_DIR): string {
  return join(dir, `${checkId}.jsonl`);
}

/** Append-only JSONL results for one check; the newest record per cache key wins. */
export class ReviewStore {
  private readonly byCacheKey = new Map<string, ReviewRecord>();

  constructor(
    readonly checkId: string,
    private readonly dir = REVIEW_DIR,
  ) {
    const path = storePath(checkId, dir);
    if (!existsSync(path)) return;
    for (const line of readFileSync(path, "utf8").split("\n")) {
      if (!line.trim()) continue;
      const record = JSON.parse(line) as ReviewRecord;
      this.byCacheKey.set(record.cacheKey, record);
    }
  }

  get(cacheKey: string): ReviewRecord | undefined {
    return this.byCacheKey.get(cacheKey);
  }

  /** A successful record is final; an error record is retried on the next run. */
  isDone(cacheKey: string): boolean {
    const record = this.byCacheKey.get(cacheKey);
    return Boolean(record && record.error === undefined);
  }

  append(record: ReviewRecord): void {
    mkdirSync(this.dir, { recursive: true });
    appendFileSync(storePath(this.checkId, this.dir), `${JSON.stringify(record)}\n`, "utf8");
    this.byCacheKey.set(record.cacheKey, record);
  }

  get size(): number {
    return this.byCacheKey.size;
  }
}

/** Within one point of the flag boundary: a clear score on one pass needs no second opinion. */
export function nearFlag(check: Check, score: number): boolean {
  return check.flagged(score) || check.flagged(score - 1) || check.flagged(score + 1);
}

/**
 * Combine the two variant verdicts for one subject.
 * - flagged: both variants flag (a one-sided flag is noise)
 * - unstable: variants disagree by 2 or more points, routed to a human
 */
export function aggregate(check: Check, records: Array<ReviewRecord | undefined>): Aggregate {
  const present = records.filter((r): r is ReviewRecord => r !== undefined);
  if (present.length === 0) {
    return { status: "missing", meanScore: null, scores: [], reasons: [] };
  }
  if (present.some((r) => r.error !== undefined || r.score === undefined)) {
    return { status: "error", meanScore: null, scores: [], reasons: present.map((r) => r.error ?? "") };
  }
  const scores = present.map((r) => r.score!);
  const reasons = present.map((r) => r.reason ?? "");
  const tag = present.find((r) => r.tag)?.tag;
  const meanScore = scores.reduce((a, b) => a + b, 0) / scores.length;
  const base = { meanScore, scores, reasons, ...(tag ? { tag } : {}) };
  if (present.length < 2) {
    // A lone pass is final only when it is clearly outside the flag zone (adaptive runs skip pass 2 there).
    return { status: nearFlag(check, scores[0]!) ? "missing" : "ok", ...base };
  }
  if (Math.max(...scores) - Math.min(...scores) >= 2) return { status: "unstable", ...base };
  if (scores.every((s) => check.flagged(s))) return { status: "flagged", ...base };
  return { status: "ok", ...base };
}
