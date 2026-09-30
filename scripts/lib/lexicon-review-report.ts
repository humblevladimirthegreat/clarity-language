import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { parseCsv, serializeCsv } from "../../src/csv.js";
import { aggregate, cacheKeyFor, ReviewStore } from "./lexicon-review-store.js";
import { selectSubjects } from "./lexicon-review-runner.js";
import { REVIEW_DIR } from "./lexicon-review-subjects.js";
import type { Aggregate, Check, ReviewRecord, Subject } from "./lexicon-review-types.js";

export type Finding = { subject: Subject; result: Aggregate };

export function recordsFor(
  check: Check,
  subject: Subject,
  model: string,
  store: ReviewStore,
): Array<ReviewRecord | undefined> {
  return ([0, 1] as const).map((variant) => store.get(cacheKeyFor(model, check.prompt(subject, variant))));
}

export function evaluate(check: Check, subjects: Subject[], model: string, store: ReviewStore): Finding[] {
  return selectSubjects({ check, subjects }).map((subject) => ({
    subject,
    result: aggregate(check, recordsFor(check, subject, model, store)),
  }));
}

/**
 * Give `bias-image` its input: rows whose `bias-prone` verdict flagged carry the bias tag in
 * their data, so only those rows are selected and the tag is part of the prompt.
 */
export function withBiasTags(subjects: Subject[], findings: Finding[]): Subject[] {
  const tags = new Map<string, string>();
  for (const f of findings) {
    if (f.result.status === "flagged" && f.result.tag) tags.set(f.subject.key, f.result.tag);
  }
  return subjects.map((s) =>
    s.kind === "row" && tags.has(s.key) ? { ...s, data: { ...s.data, biasTag: tags.get(s.key)! } } : s,
  );
}

const STATUS_ORDER: Record<Aggregate["status"], number> = {
  flagged: 0,
  unstable: 1,
  error: 2,
  ok: 3,
  missing: 4,
};

/** Flagged first, then unstable; within a status the most extreme mean score (per the check's direction) first. */
export function rankFindings(check: Check, findings: Finding[]): Finding[] {
  const severity = (f: Finding) => {
    const m = f.result.meanScore ?? 3;
    return check.flagged(1) ? m : -m;
  };
  return [...findings].sort(
    (a, b) =>
      STATUS_ORDER[a.result.status] - STATUS_ORDER[b.result.status] || severity(a) - severity(b),
  );
}

export function describe(subject: Subject): string {
  const d = subject.data;
  if (subject.kind === "pair") return `${d.aText ?? ""}  ↔  ${d.bText ?? ""}`;
  if (subject.kind === "alias") return `${d.concrete}/${d.abstract} ← alias "${d.alias}"`;
  if (subject.kind === "role") return `${d.sense} → ${d.lemma} (${d.role})`;
  if (subject.kind === "compound") return `${d.left} + ${d.right} = ${d.concrete}${d.abstract ? `/${d.abstract}` : ""}`;
  return d.abstract ? `${d.concrete} → ${d.abstract}` : d.concrete ?? "";
}

export function formatWorst(check: Check, findings: Finding[], worst: number): string {
  const ranked = rankFindings(check, findings).filter((f) => f.result.status !== "missing");
  const lines = [`${check.id}: ${check.description}`];
  const counts = new Map<string, number>();
  for (const f of findings) counts.set(f.result.status, (counts.get(f.result.status) ?? 0) + 1);
  lines.push([...counts].map(([k, v]) => `${k}=${v}`).join("  "));
  lines.push("");
  for (const f of ranked.slice(0, worst)) {
    const { result, subject } = f;
    if (result.status === "ok") break;
    const score = result.scores.join("/");
    const prot = subject.protected ? " [protected]" : "";
    const tag = result.tag ? ` {${result.tag}}` : "";
    lines.push(`${result.status.padEnd(8)} ${score.padEnd(4)} ${subject.label.padEnd(14)} ${describe(subject)}${prot}${tag}`);
    lines.push(`${"".padEnd(28)}${result.reasons.find(Boolean) ?? ""}`);
  }
  return lines.join("\n");
}

export const TRIAGE_HEADERS = [
  "key",
  "root",
  "checks_failed",
  "check",
  "status",
  "score",
  "what",
  "reason",
  "protected",
  "human_decision",
  "notes",
] as const;

export type TriageRow = Record<(typeof TRIAGE_HEADERS)[number], string>;

export function triagePath(dir = REVIEW_DIR): string {
  return join(dir, "triage.csv");
}

/** One row per (subject, failed check), grouped by subject, most failed checks first. */
export function buildTriage(
  perCheck: Array<{ check: Check; findings: Finding[] }>,
  existing: TriageRow[] = [],
): TriageRow[] {
  const prior = new Map(existing.map((r) => [`${r.check}\0${r.key}`, r]));
  const bySubject = new Map<string, TriageRow[]>();

  for (const { check, findings } of perCheck) {
    for (const { subject, result } of findings) {
      if (result.status !== "flagged" && result.status !== "unstable") continue;
      const old = prior.get(`${check.id}\0${subject.key}`);
      const row: TriageRow = {
        key: subject.key,
        root: subject.label,
        checks_failed: "",
        check: check.id,
        status: result.status,
        score: result.scores.join("/"),
        what: describe(subject),
        reason: [result.tag, result.reasons.find(Boolean)].filter(Boolean).join(": "),
        protected: subject.protected ? "yes" : "",
        human_decision: old?.human_decision ?? "",
        notes: old?.notes ?? "",
      };
      const list = bySubject.get(subject.key) ?? [];
      list.push(row);
      bySubject.set(subject.key, list);
    }
  }

  const groups = [...bySubject.values()].sort(
    (a, b) => b.length - a.length || minScore(a) - minScore(b),
  );
  return groups.flatMap((rows) => rows.map((r) => ({ ...r, checks_failed: String(rows.length) })));
}

function minScore(rows: TriageRow[]): number {
  return Math.min(...rows.map((r) => Number(r.score.split("/")[0]) || 3));
}

export function readTriage(path = triagePath()): TriageRow[] {
  if (!existsSync(path)) return [];
  return parseCsv(readFileSync(path, "utf8")).rows as TriageRow[];
}

export function serializeTriage(rows: TriageRow[]): string {
  return serializeCsv(TRIAGE_HEADERS, rows);
}
