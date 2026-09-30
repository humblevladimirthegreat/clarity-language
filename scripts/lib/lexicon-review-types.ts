import type { ChatMessage } from "./llm-client.js";

/** What a check is asked about. `pair` subjects come from `pairs.jsonl`. */
export type SubjectKind = "row" | "compound" | "alias" | "role" | "pair";

/**
 * One thing to review, reduced to English fields. The model never sees Agazan, so `data`
 * carries concrete / abstract / mnemonic text only; `key` and `label` are for humans.
 */
export type Subject = {
  kind: SubjectKind;
  /** Stable id: emoji for published rows, stem for compounds, `emoji#alias`, `emoji#sense.pos`, `a|b` for pairs. */
  key: string;
  /** Human-facing label for reports (root or stem, never sent to the model). */
  label: string;
  /** Root hosts an overlay row: report, but never propose changing the root. */
  protected: boolean;
  data: Record<string, string>;
};

/** Normalized verdict: score 1–5, where the check's `flagged()` decides which end is a finding. */
export type Verdict = {
  score: number;
  reason: string;
  tag?: string;
};

export type Check = {
  id: string;
  description: string;
  kind: SubjectKind;
  select(subject: Subject): boolean;
  /** `variant` 0 and 1 phrase the same question differently (or swap pair order) to expose unstable answers. */
  prompt(subject: Subject, variant: 0 | 1): ChatMessage[];
  flagged(score: number): boolean;
};

export type ReviewRecord = {
  check: string;
  key: string;
  variant: 0 | 1;
  model: string;
  /** sha1 of model + messages: changes whenever the row text or the prompt changes. */
  cacheKey: string;
  score?: number;
  reason?: string;
  tag?: string;
  error?: string;
  ts: string;
};

export type Aggregate = {
  status: "ok" | "flagged" | "unstable" | "missing" | "error";
  meanScore: number | null;
  scores: number[];
  reasons: string[];
  tag?: string;
};

export type GoldLabel = "good" | "bad" | "borderline";

export type GoldEntry = {
  check: string;
  key: string;
  label: GoldLabel | "";
  note?: string;
  /** Read-only context so a human can label the file without the CSVs open. */
  view?: Record<string, string>;
};
