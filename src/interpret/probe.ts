/** `reading.mjs probe`: many independent solver cases in one file, each its own log with its own questions (docs/meta/solver.md#cli). */
import type { ClassifyTables } from "../parse/classify.js";
import { buildLog, readQuestion, type Log, type Turn } from "./log.js";
import { clashes, couldBe, fill, follows, type Answer, type ClashResult, type FillAnswer, type SolveOptions } from "./solve.js";
import { ownProgram, translate } from "./translate.js";
import type { LeftOut } from "./translate-types.js";
import type { Reading } from "./types.js";

/** A fill question (`ask:fillAsk`): `solve` and `probe` send it to the fill job, not to `follows` / `couldBe`. */
export const isFillAsk = (question: Reading): boolean => question.frames.some((f) => f.family === "force" && f.values.ask === "fillAsk");

/** A question in a case: asked with `follows`, or `couldBe` (`?~`, or `?` under `--possible`); a fill question with `fill`, `couldBe` brave. */
export type ProbeQuestion = { text: string; job: "follows" | "couldBe"; line: number };

/** A turn of a case, with its file line and the fixture label (`@ id`) before it, when there is one. */
export type ProbeTurn = Turn & { line: number; tag?: string };

export type ProbeCase = { label: string; line: number; turns: ProbeTurn[]; questions: ProbeQuestion[] };

/** What one case gave: each part filled as far as the case got; `error` when it stopped early. */
export type ProbeResult = {
  label: string;
  line: number;
  /** Each turn's readings, by reading id, with the turn's fixture tag. */
  turns: { at: number; speaker: string; text: string; tag?: string; readings: string[] }[];
  rejected: { line: number; text: string; error: string }[];
  left: LeftOut[];
  notes: { reading: string; key: string; construction: string }[];
  clashes?: ClashResult;
  questions: (ProbeQuestion & { answer?: Answer | FillAnswer; error?: string })[];
  program?: string;
  error?: string;
  /** The log, for formatting reading ids with their turns; not in JSON. */
  log?: Log;
};

const SPEAKER = /^([A-Za-z][A-Za-z0-9_-]*):\s*(.*)$/;

/** What `--program` prints: the case's own lines, or every line with `full`; `terms` keeps only lines naming one of those predicates. */
export type ProgramView = { full?: boolean; terms?: string[] };

/** The program text a view asks for: own lines by default, the whole text for `full`, then only lines with a `name(` of `terms`. */
export function programView(program: string, view: ProgramView): string {
  let text = view.full ? program : ownProgram(program);
  if (view.terms?.length) {
    const names = view.terms.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
    const mention = new RegExp(`(?<![\\w])(?:${names.join("|")})\\(`);
    text = text.split("\n").filter((l) => mention.test(l)).join("\n");
  }
  return text;
}

/**
 * The cases of a probe file. A line starting `---` starts a case (the rest of the line is its label); `#` lines and
 * blanks are skipped; `Name:` sets the speaker for the case's later turns; `? text` and `?~ text` are questions.
 * A solve fixture's lines read too: `@ id` tags the next turn, `= English` is skipped, so a fixture file is one case,
 * one log, as `translate.test.ts` reads it.
 */
export function parseProbe(text: string, possible = false): ProbeCase[] {
  const cases: ProbeCase[] = [];
  let current: ProbeCase | undefined;
  let speaker = "speaker";
  let tag: string | undefined;
  const open = (label: string, line: number): ProbeCase => {
    current = { label, line, turns: [], questions: [] };
    cases.push(current);
    speaker = "speaker";
    tag = undefined;
    return current;
  };
  text.split("\n").forEach((raw, i) => {
    let line = raw.trim();
    if (line.startsWith("---")) return void open(line.replace(/^-+/, "").trim(), i + 1);
    if (!line || line.startsWith("#") || line.startsWith("=")) return;
    const c = current ?? open("", i + 1);
    if (line.startsWith("@")) return void (tag = line.slice(1).trim());
    if (line.startsWith("?")) {
      const couldBeAsked = line.startsWith("?~");
      const q = line.slice(couldBeAsked ? 2 : 1).trim();
      if (q) c.questions.push({ text: q, job: couldBeAsked || possible ? "couldBe" : "follows", line: i + 1 });
      return;
    }
    const named = SPEAKER.exec(line);
    if (named) {
      speaker = named[1]!;
      line = named[2]!.trim();
    }
    if (!line) return;
    c.turns.push({ speaker, at: c.turns.length, text: line, line: i + 1, ...(tag ? { tag } : {}) });
    tag = undefined;
  });
  return cases.filter((c) => c.turns.length || c.questions.length);
}

const firstLine = (error: unknown): string => (error instanceof Error ? error.message : String(error)).split("\n")[0]!;

/** Run one case: its log, what the program leaves out, its notes and clashes, then each question. Never throws. */
export async function runProbeCase(c: ProbeCase, tables: ClassifyTables, options: SolveOptions, program?: ProgramView): Promise<ProbeResult> {
  const result: ProbeResult = { label: c.label, line: c.line, turns: [], rejected: [], left: [], notes: [], questions: [] };
  try {
    const log = buildLog(c.turns.map(({ speaker, at, text }) => ({ speaker, at, text })), tables);
    result.log = log;
    result.turns = log.entries.map((e) => ({ at: e.at, speaker: e.speaker, text: e.text, ...(c.turns[e.at]?.tag ? { tag: c.turns[e.at]!.tag } : {}), readings: e.readings.map((r) => r.id) }));
    result.rejected = log.rejected.map((r) => ({ line: c.turns[r.at]!.line, text: r.text, error: r.error.split("\n")[0]! }));
    // The program the jobs start from, with the same switches `prepare` writes.
    const switches = { widen: !!options.widen, defaults: !!options.defaults, closed: !!options.closedWorld };
    const t = translate(log, { lexicon: options.lexicon, switches });
    result.left = t.left;
    result.notes = t.notes.map((n) => ({ reading: n.reading, key: n.frame.key, construction: n.frame.construction }));
    if (program) result.program = programView(t.program, program);
    result.clashes = await clashes(log, options);
    for (const q of c.questions) {
      try {
        const question = readQuestion(log, q.text, tables)[0];
        if (!question) result.questions.push({ ...q, error: "holds no sentence" });
        else if (isFillAsk(question)) result.questions.push({ ...q, answer: await fill(log, question, { ...options, possible: q.job === "couldBe" }) });
        else result.questions.push({ ...q, answer: await (q.job === "couldBe" ? couldBe : follows)(log, question, options) });
      } catch (error) {
        result.questions.push({ ...q, error: firstLine(error) });
      }
    }
  } catch (error) {
    result.error = firstLine(error);
  }
  return result;
}

/** One reading id, with its fixture tag when the turn has one: `t:0.0=s1`. */
function idText(id: string, r: ProbeResult): string {
  const tag = r.turns.find((t) => t.readings.includes(id))?.tag;
  return tag ? `${id}=${tag}` : id;
}

const leftText = (l: LeftOut, r: ProbeResult): string => `${idText(l.reading, r)} ${l.reason} ${l.key ?? l.construction}`;

/** Text for one case: header, turns that did not parse, left, notes, clashes, each question; then the program. */
export function formatProbe(r: ProbeResult, index: number): string[] {
  const out = [`=== ${r.label || `case ${index + 1}`} (line ${r.line})`];
  for (const x of r.rejected) out.push(`skipped line ${x.line}: ${x.text}: ${x.error}`);
  if (r.error) out.push(`error ${r.error}`);
  for (const l of r.left) out.push(`left ${leftText(l, r)}`);
  for (const n of r.notes) out.push(`note ${idText(n.reading, r)} ${n.key}`);
  if (r.clashes?.refused) out.push(`clashes refused ${r.clashes.refused}`);
  else if (r.clashes && r.clashes.clashes.length === 0) out.push("no clash");
  for (const c of r.clashes?.clashes ?? []) {
    out.push(`clash ${c.readings.map((id) => idText(id, r)).join(" ")} atom ${c.atom}${c.switches.length ? ` switches ${c.switches.join(",")}` : ""}`);
  }
  const caseLeft = new Set(r.left.map((l) => `${l.reading} ${l.key ?? l.construction}`));
  for (const q of r.questions) {
    const head = `${q.job === "couldBe" ? "?~" : "?"} ${q.text}`;
    if (q.error) {
      out.push(`${head} -> error ${q.error}`);
      continue;
    }
    const a = q.answer!;
    const parts = [`${head} -> ${a.verdict}`];
    // A fill answer's fillers, each bracketed: one term per blank, a fill-all tuple comma-joined.
    if ("fillers" in a && a.fillers.length) parts.push(a.fillers.map((f) => `[${f.term.join(", ")}]`).join(" "));
    if (a.because.length) parts.push(`because ${a.because.map((id) => idText(id, r)).join(" ")}`);
    if (a.switches.length) parts.push(`switches ${a.switches.join(",")}`);
    out.push(parts.join(" "));
    // Left-out readings the case already lists are not repeated; the question's own (beyond) are.
    for (const l of a.left.filter((l) => !caseLeft.has(`${l.reading} ${l.key ?? l.construction}`))) out.push(`  left ${leftText(l, r)}`);
    if ((a.verdict === "refused" || a.verdict === "beyond") && a.english) out.push(`  ${a.verdict} ${a.english}`);
  }
  if (r.program !== undefined) out.push("program:", ...r.program.split("\n").filter(Boolean).map((l) => `  ${l}`));
  return out;
}

/** One case as a JSON object (one line), without the log. */
export function probeJson(r: ProbeResult): string {
  const { log: _log, ...rest } = r;
  return JSON.stringify(rest);
}
