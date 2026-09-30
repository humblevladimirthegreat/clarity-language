import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { seededShuffle } from "./metaphor-assign-data.js";
import { REVIEW_DIR } from "./lexicon-review-subjects.js";
import { describe } from "./lexicon-review-report.js";
import type { GoldEntry, GoldLabel, Subject } from "./lexicon-review-types.js";

export function goldPath(dir = REVIEW_DIR): string {
  return join(dir, "gold.jsonl");
}

export function readGold(path = goldPath()): GoldEntry[] {
  if (!existsSync(path)) return [];
  return readFileSync(path, "utf8")
    .split("\n")
    .filter((l) => l.trim())
    .map((l) => JSON.parse(l) as GoldEntry);
}

export type CalibrationResult = {
  n: number;
  accuracy: number;
  /** Fraction of human-`bad` entries the check flagged. */
  recall: number;
  /** Fraction of flags that were human-`bad`. */
  precision: number;
  falsePositives: string[];
  misses: string[];
  verdict: "KEEP" | "REWORK" | "TOO-FEW";
};

export const GATE = { accuracy: 0.8, recall: 0.7, minLabeled: 10 } as const;

/** Borderline labels are ignored: they are where the check is allowed to disagree. */
export function scoreCalibration(
  items: Array<{ key: string; label: GoldLabel; flagged: boolean }>,
): CalibrationResult {
  const judged = items.filter((i) => i.label === "good" || i.label === "bad");
  const bad = judged.filter((i) => i.label === "bad");
  const flagged = judged.filter((i) => i.flagged);
  const correct = judged.filter((i) => (i.label === "bad") === i.flagged).length;
  const caught = bad.filter((i) => i.flagged).length;
  const accuracy = judged.length ? correct / judged.length : 0;
  const recall = bad.length ? caught / bad.length : 0;
  const precision = flagged.length ? flagged.filter((i) => i.label === "bad").length / flagged.length : 0;
  const verdict =
    judged.length < GATE.minLabeled || bad.length === 0
      ? "TOO-FEW"
      : accuracy >= GATE.accuracy && recall >= GATE.recall
        ? "KEEP"
        : "REWORK";
  return {
    n: judged.length,
    accuracy,
    recall,
    precision,
    falsePositives: flagged.filter((i) => i.label === "good").map((i) => i.key),
    misses: bad.filter((i) => !i.flagged).map((i) => i.key),
    verdict,
  };
}

/**
 * Stratified sample for hand labeling: a third are `suspect` subjects (the caller decides what
 * looks dubious), the rest random. `subjects` should already be filtered to what the check selects.
 */
export function sampleForGold(
  subjects: Subject[],
  checkIds: string[],
  size: number,
  seed: number,
  suspect: (s: Subject) => boolean,
): GoldEntry[] {
  const pool = subjects;
  const suspects = seededShuffle(pool.filter(suspect), seed).slice(0, Math.floor(size / 3));
  const taken = new Set(suspects.map((s) => s.key));
  const rest = seededShuffle(pool.filter((s) => !taken.has(s.key)), seed + 1).slice(0, size - suspects.length);
  return [...suspects, ...rest].flatMap((s) =>
    checkIds.map((check) => ({
      check,
      key: s.key,
      label: "" as const,
      note: "",
      view: { root: s.label, what: describe(s), mnemonic: s.data.mnemonic ?? "" },
    })),
  );
}
