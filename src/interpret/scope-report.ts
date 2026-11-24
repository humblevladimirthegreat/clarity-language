/**
 * The scope report (`npm run scope-report`): for each grammar example, what each reading orders and links, so a change
 * to scope shows as a list of examples whose record changed. Walks the examples `npm run sweep` walks
 * (`forEachExample` in `accounting-walk.ts`); the script `scripts/scope-report.ts` saves, diffs and prints it.
 */
import { BOUNDARY_COLUMNS, boundaryCell, cellLabel, type BoundaryColumn, type NestedKind } from "../parse/boundaries.js";
import type { FrameFamily } from "../parse/scope.js";
import { explainPair, type PairSide } from "../parse/scope-profiles.js";
import type { Frame, Reading, StanceList } from "./types.js";

/** One reading, as plain strings so a record compares and diffs as text. */
export type ReadingRecord = {
  /** Where the reading sits: `s<offset>` from the example's first sentence, plus its clause path (`/m0`, `/d`, `/i3`, `/q2.0`). */
  at: string;
  /** The kind of nested reading, from the last path step: `member`, `dependent`, `island`, `quote`. Absent at top level. */
  nested?: string;
  /** Each frame's family, `family/member` where the resolve stage tags a member, in text order. */
  families: string[];
  /** `over > under kind anchor,…`. */
  order: string[];
  /** `a ~ b`. */
  unordered: string[];
  /** `key: member, …`; a member is a frame family or `list`. */
  stanceLists: string[];
  /** `kind key`, with ` -> <offset><path>` where the link names a reading, the offset relative to this reading's sentence. */
  links: string[];
};

export type ExampleRecord = { file: string; text: string; readings: ReadingRecord[] };

/** Records keyed `file: text` (a repeat on the same page gets ` #2`, …). */
export type ScopeReport = Record<string, ExampleRecord>;

/** What the walk hands the report: an example and every reading in it, nested ones included (`allReadings`). */
export type ReportExample = { file: string; text: string; allReadings: Reading[] };

const ID = /:(\d+)\.(\d+)((?:\/.*)?)$/;
const NESTED: Record<string, string> = { m: "member", d: "dependent", i: "island", q: "quote" };

const family = (f: Frame): string => (f.member ? `${f.family}/${f.member}` : f.family);
const stanceMember = (m: Frame | StanceList): string => ("family" in m ? family(m) : "list");

/** Records for an example's readings: sentence positions are offsets from the first sentence any of them names. */
export function recordReadings(all: Reading[]): ReadingRecord[] {
  const where = (id: string) => {
    const [, u = "", b = "", path = ""] = ID.exec(id) ?? [];
    return u ? { sentence: `${u}.${b}`, u: +u, b: +b, path } : undefined;
  };
  const sentences = new Map<string, { u: number; b: number }>();
  for (const id of all.flatMap((r) => [r.id, ...r.links.flatMap((l) => (l.to ? [l.to] : []))])) {
    const w = where(id);
    if (w) sentences.set(w.sentence, w);
  }
  const order = [...sentences.entries()].sort(([, a], [, b]) => a.u - b.u || a.b - b.b).map(([key]) => key);
  const index = (id: string) => {
    const w = where(id);
    return w ? { at: order.indexOf(w.sentence), path: w.path } : undefined;
  };
  return all.map((r) => {
    const self = index(r.id);
    const last = self?.path.split("/").pop()?.[0];
    const target = (to: string): string => {
      const t = index(to);
      if (!t || !self) return to;
      const offset = t.at - self.at;
      return `${offset > 0 ? "+" : ""}${offset}${t.path}`;
    };
    const record: ReadingRecord = {
      at: self ? `s${self.at}${self.path}` : r.id,
      families: r.frames.map(family),
      order: r.order.map((o) => `${family(o.over)} > ${family(o.under)} ${o.kind} ${o.anchors.join(",")}`.trimEnd()),
      unordered: r.unordered.map(([a, b]) => `${family(a)} ~ ${family(b)}`),
      stanceLists: (r.stanceLists ?? []).map((l) => `${l.key}: ${l.members.map(stanceMember).join(", ")}`),
      links: r.links.map((l) => `${l.kind} ${l.key}${l.to ? ` -> ${target(l.to)}` : ""}`),
    };
    if (last && NESTED[last]) record.nested = NESTED[last];
    return record;
  });
}

/** The report for a set of examples. */
export function scopeReport(examples: Iterable<ReportExample>): ScopeReport {
  const report: ScopeReport = {};
  for (const { file, text, allReadings } of examples) {
    let key = `${file}: ${text}`;
    for (let n = 2; key in report; n++) key = `${file}: ${text} #${n}`;
    report[key] = { file, text, readings: recordReadings(allReadings) };
  }
  return report;
}

/** One count: how many examples show the key, and the first example's text. */
export type Tally = { examples: number; sample: string };

/** Per section, the examples that show each key. */
export type ScopeCounts = Record<string, Record<string, Tally>>;

const side = (family: string): PairSide => {
  const [name = "", member] = family.split("/");
  return { family: name as FrameFamily, ...(member ? { member } : {}) };
};

/** For every two frames of a reading, the rule that decides the pair (`explainPair`, interpreter.md#family-profiles). */
const pairRules = (r: ReadingRecord): string[] =>
  r.families.flatMap((a, i) => r.families.slice(i + 1).map((b) => explainPair(side(a), side(b)))).filter((rule) => rule !== "never");

/** The boundary row of a nested reading the record's path names (a cite or an aside: `quote`). */
const ROW_OF_NESTED: Readonly<Record<string, NestedKind>> = { member: "member", island: "island", quote: "quote" };

/** The boundary row of the reading a link names: a dependent, by how it is named, and the `blarl` grounds. */
const ROW_OF_LINK: Readonly<Record<string, NestedKind>> = {
  "standIn lexReading:standIn": "standInDependent",
  "standIn slot:dependent": "slotDependent",
  "grounds slot:grounds": "grounds",
};

/** The boundary cells a reading crosses into, as `row column: verdict` (interpreter.md#boundaries). */
const boundaryKeys = (r: ReadingRecord): string[] => {
  const rows = new Set<NestedKind>();
  const own = r.nested ? ROW_OF_NESTED[r.nested] : undefined;
  if (own) rows.add(own);
  for (const l of r.links) {
    const row = ROW_OF_LINK[l.split(" -> ")[0] ?? ""];
    if (row && l.includes(" -> ")) rows.add(row);
  }
  const columns = Object.keys(BOUNDARY_COLUMNS) as BoundaryColumn[];
  return [...rows].flatMap((row) => columns.map((column) => `${row} ${column}: ${cellLabel(boundaryCell(row, column))}`));
};

const SECTIONS: [string, (r: ReadingRecord) => string[]][] = [
  ["frame families", (r) => r.families],
  ["pair rules", pairRules],
  ["order", (r) => r.order.map((o) => o.split(" ").slice(0, 4).join(" "))],
  ["unordered", (r) => r.unordered],
  ["stance lists", (r) => r.stanceLists.map((l) => l.split(": ")[0] ?? l)],
  ["nested readings", (r) => (r.nested ? [r.nested] : [])],
  ["links", (r) => r.links.map((l) => l.split(" -> ")[0] ?? l)],
  ["boundary cells", boundaryKeys],
];

/** Count examples per frame family, pair rule, order pair and kind, unordered pair, stance list, nested kind, link kind and key, and boundary cell. */
export function countReport(report: ScopeReport): ScopeCounts {
  const counts: ScopeCounts = Object.fromEntries(SECTIONS.map(([name]) => [name, {}]));
  for (const example of Object.values(report)) {
    for (const [name, keys] of SECTIONS) {
      const section = (counts[name] ??= {});
      for (const key of new Set(example.readings.flatMap(keys))) {
        const tally = (section[key] ??= { examples: 0, sample: example.text });
        tally.examples++;
      }
    }
  }
  return counts;
}

const sorted = (section: Record<string, Tally>) =>
  Object.entries(section).sort(([a, x], [b, y]) => y.examples - x.examples || a.localeCompare(b));

/** Stdout: totals, and per section the number of keys and examples. */
export function formatSummary(report: ScopeReport, counts: ScopeCounts): string[] {
  const records = Object.values(report);
  const readings = records.reduce((n, e) => n + e.readings.length, 0);
  const lines = [`${records.length} examples, ${readings} readings`];
  for (const [name, keys] of SECTIONS) {
    const shown = records.filter((e) => e.readings.some((r) => keys(r).length)).length;
    lines.push(`  ${name}: ${Object.keys(counts[name] ?? {}).length} keys, in ${shown} examples`);
  }
  return lines;
}

/** The full report: each section's counts with a sample text, then each example's record. */
export function formatReport(report: ScopeReport, counts: ScopeCounts): string[] {
  const lines = ["# Scope report", "", ...formatSummary(report, counts).map((l) => `    ${l}`)];
  for (const [name, section] of Object.entries(counts)) {
    lines.push("", `## ${name}`, "", "| key | examples | sample |", "| --- | --- | --- |");
    for (const [key, t] of sorted(section)) lines.push(`| \`${key}\` | ${t.examples} | ${t.sample} |`);
  }
  lines.push("", "## Examples");
  for (const [key, example] of Object.entries(report)) {
    lines.push("", `### ${key}`, "");
    for (const r of example.readings) {
      const parts = [r.nested, r.families.join(" "), ...r.order, ...r.unordered, ...r.stanceLists, ...r.links].filter(Boolean);
      lines.push(`- ${r.at}: ${parts.join("; ")}`);
    }
  }
  return lines;
}

/** Examples whose record changed, was added or was removed since `before`. */
export function diffReports(before: ScopeReport, after: ScopeReport): string[] {
  const lines: string[] = [];
  for (const key of new Set([...Object.keys(before), ...Object.keys(after)])) {
    const a = before[key];
    const b = after[key];
    if (!a) lines.push(`+ ${key}`);
    else if (!b) lines.push(`- ${key}`);
    else if (JSON.stringify(a.readings) !== JSON.stringify(b.readings)) {
      lines.push(`~ ${key}`);
      const was = a.readings.map((r) => JSON.stringify(r));
      const now = b.readings.map((r) => JSON.stringify(r));
      for (const r of was.filter((x) => !now.includes(x))) lines.push(`    - ${r}`);
      for (const r of now.filter((x) => !was.includes(x))) lines.push(`    + ${r}`);
    }
  }
  return lines;
}
