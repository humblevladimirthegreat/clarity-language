#!/usr/bin/env node
/** The `reading` CLI: prints the interpreter's readings of Ageben text (docs/meta/procedures/read-ageben.md). */
import { readFileSync } from "node:fs";
import { basename } from "node:path";

import type { ClassifyTables } from "../parse/classify.js";
import { loadDefaultTables } from "../parse/index.js";
import { morphGlossLine } from "../parse/morph-gloss.js";
import type { LexWord } from "../parse/types.js";
import { ask, type Match } from "./ask.js";
import { buildLog, readQuestion, type Log, type Turn } from "./log.js";
import { throughAntecedent } from "./match.js";
import { formatProbe, parseProbe, probeJson, runProbeCase, type ProgramView } from "./probe.js";
import { readText } from "./read.js";
import { cannotSayDraft, clashReply, firstReply, giveUpReply, noDraft, whyReply, yesDraft, type Reply } from "./reply.js";
import { clashes, couldBe, follows, giveUp, stands, type Answer, type Clash, type GiveUpResult, type Semantics, type SolveOptions, type StandsResult } from "./solve.js";
import type { LeftOut } from "./translate-types.js";
import type { Claim, Detail, Frame, Link, Reading, StanceList, Term } from "./types.js";

const USAGE = [
  "Usage: node scripts/reading.mjs [--json] '<Ageben text>' ['<Ageben text>' ...]",
  "       node scripts/reading.mjs [--json] --file <path>     (one input per line)",
  "       node scripts/reading.mjs [--json] - < inputs.txt    (one input per line)",
  "  Prints each input, then one block per reading (nested readings indented): frames, scope order, claim, links, unread.",
  "  --json  print the readings as JSON, each LexWord reduced to its position and text",
  "       node scripts/reading.mjs log [--json] [--window N] FILE",
  "  Reads FILE as a conversation (one turn per line, an optional `Name:` sets the speaker, `#` lines and blanks skipped);",
  "  prints each turn with its speaker, text, gloss, and readings. A line that does not parse goes to stderr and is skipped.",
  "       node scripts/reading.mjs ask [--json] [--widen] [--infer] [--window N] FILE '<question>'",
  "  Prints each reading in the FILE's log that answers the question: speaker, bound blanks, frame path (outermost first),",
  "  unsettled pairs, switches used, then the glosses of the question and of the sentence. No match prints `no match`.",
  "       node scripts/reading.mjs solve [--json] [--possible] [--defaults] [--closed] [--window N] FILE '<question>'",
  "  Asks the solver whether the question follows from the FILE's log (--possible: whether it could be so): the verdict,",
  "  the reply, why (each deciding reading with its turn), switches used, and readings left out of the program.",
  "  --defaults  everyday defaults for open universals; --closed  the unsaid is false",
  "       node scripts/reading.mjs clashes [--json] [--give-up] [--window N] FILE",
  "  Prints each smallest clash in the FILE's log, with its readings; --give-up adds a smallest set to give up.",
  "       node scripts/reading.mjs stands [--json] [--semantics grounded|stable|preferred] [--window N] FILE",
  "  Prints what stands in the FILE's log: each reading in, out or undecided, the attacks, and the extensions.",
  "       node scripts/reading.mjs probe [--json] [--program[=full]] [--terms a,b] [--case N|LABEL] [--possible] [--defaults] [--closed] FILE",
  "  FILE holds independent cases, each its own log: a line starting `---` starts one (the rest of the line is its label);",
  "  turn lines as `log` reads them; `? text` asks with follows, `?~ text` with couldBe (--possible: `?` too). A solve",
  "  fixture (`@ id` tags the next turn, `= English` skipped) is one case. Per case: turns that did not parse, left, notes,",
  "  each smallest clash or `no clash`, each question's verdict, because, switches and left. --program adds the case's own",
  "  program lines, not the generic rules every program shares (--program=full keeps them); --terms a,b keeps only program",
  "  lines naming one of those predicates (implies --program); --case N runs only the Nth case (1-based), --case LABEL the case",
  "  with that label. The program is for debugging one case or confirming a new row's terms; batch probes run without it.",
  "  --json prints one JSON object per line per case. A failing case is reported and the others still run.",
].join("\n");

const word = (w: LexWord): string => w.raw;
const words = (ws: LexWord[]): string => ws.map(word).join(" ");

/** One line for a term; a nested clause or quote shows its reading ids. */
export function formatTerm(term: Term | undefined): string {
  if (!term) return "-";
  const tail = (details?: Detail[], frames: Frame[] | undefined = "frames" in term ? term.frames : undefined): string =>
    (details?.length ? ` {${details.map(formatDetail).join("; ")}}` : "") + (frames?.length ? ` (${frames.map(formatFrame).join("; ")})` : "");
  switch (term.kind) {
    case "thing":
      return `${term.head.raw}${term.named ? " (named)" : ""}${tail(term.details)}`;
    case "speaker":
    case "listener":
      return `${term.kind} ${term.word.raw}${tail(term.details)}`;
    case "pronoun":
      return `pronoun ${term.word.raw}${term.antecedent ? ` -> ${formatTerm(term.antecedent)}` : ""}${tail(term.details)}`;
    case "blank":
      return `blank ${term.word.raw}${tail(term.details)}`;
    case "literal":
      return `literal ${term.word.raw}${tail(term.details)}`;
    case "number":
      return `number ${term.word.raw}${tail(term.details)}`;
    case "list":
      return `list ${term.join ? term.join.raw : "?"}(${term.members.map(formatTerm).join(", ")})${term.sharedDetails ? term.sharedDetails.map((d) => ` shared ${d.values.role ?? "-"} ${formatDetail(d)}`).join("") : term.shared.map((s) => ` shared ${s.role} ${s.shared.word.raw}`).join("")}${term.bound ? ` {${formatDetail(term.bound)}}` : ""}`;
    case "clause":
      return `clause ${term.reading.id}`;
    case "quote":
      return `quote ${term.word.raw} [${term.readings.map((r) => r.id).join(" ")}]${tail()}`;
  }
}

function formatDetail(d: Detail): string {
  const parts = [`${d.kind} ${d.key}`, words(d.words)];
  if (d.hosted) parts.push(`of ${formatTerm(d.hosted)}`);
  if (d.details?.length) parts.push(`{${d.details.map(formatDetail).join("; ")}}`);
  if (d.content?.length) parts.push(`[${d.content.map((r) => r.id).join(" ")}]`);
  if (d.frames?.length) parts.push(`(${d.frames.map(formatFrame).join("; ")})`);
  return parts.join(" ");
}

function formatFrame(f: Frame): string {
  const parts = [f.family, f.key, `"${words(f.words)}"`];
  // A tone mark has no word of its own (tone-marks.md#showing-your-tone).
  if (f.key === "edge:tone") parts.push(`mark ${f.values.mark} ${f.values.scope}`);
  if (f.party) parts.push(`party ${formatTerm(f.party)}`);
  if (f.hosted) parts.push(`hosted ${formatTerm(f.hosted)}`);
  if (f.member) parts.push(`member ${f.member}`);
  if (f.holderHost) parts.push("holderHost");
  if (f.occasions?.length) parts.push(`occasions "${words(f.occasions.flatMap((d) => d.words))}"`);
  if (f.content?.length) parts.push(`content [${f.content.map((r) => r.id).join(" ")}]`);
  if (f.inner?.length) parts.push(`inner (${f.inner.map(formatFrame).join("; ")})`);
  if (f.details?.length) parts.push(`{${f.details.map(formatDetail).join("; ")}}`);
  return parts.join(" ");
}

/** A stance list: its join, its members by word (an earlier list by its join), and the join's frame over the list. */
function formatStanceList(l: StanceList): string {
  const member = (m: Frame | StanceList): string => ("kind" in m ? `list ${word(m.join)}` : `"${words(m.words)}"`);
  const parts = [l.key, `"${word(l.join)}"`, `[${l.members.map(member).join(" | ")}]`];
  if (l.inner?.length) parts.push(`inner (${l.inner.map(formatFrame).join("; ")})`);
  if (l.details?.length) parts.push(`{${l.details.map(formatDetail).join("; ")}}`);
  return parts.join(" ");
}

const frameName = (f: Frame): string => `${f.key}${f.member ? `:${f.member}` : ""}`;

function formatClaim(c: Claim): string[] {
  const out: string[] = [];
  const bits = [`verb ${formatTerm(c.verb)}`];
  for (const role of ["z", "d", "b"] as const) if (c.roles[role]) bits.push(`${role} ${formatTerm(c.roles[role])}`);
  if (c.predicate.length) bits.push(`pred ${c.predicate.map(formatTerm).join(", ")}`);
  out.push(`claim ${bits.join(" | ")}`);
  if (c.clauses) out.push(`clauses ${formatTerm(c.clauses)}`);
  for (const d of c.details) out.push(`detail ${formatDetail(d)}`);
  return out;
}

function formatLink(l: Link): string {
  return `link ${l.kind} ${l.key} "${words(l.words)}"${l.to ? ` -> ${l.to}` : ""}${l.partners?.length ? ` with ${l.partners.map(formatTerm).join(", ")}` : ""}`;
}

/** Compact text for readings, nested readings (frame contents, details, terms) printed indented after their parent. */
export function formatReadings(readings: Reading[], indent = 0): string[] {
  const pad = "  ".repeat(indent);
  const out: string[] = [];
  for (const r of readings) {
    out.push(`${pad}${r.id}`);
    for (const f of r.frames) out.push(`${pad}  frame ${formatFrame(f)}`);
    for (const o of r.order) out.push(`${pad}  order ${frameName(o.over)} > ${frameName(o.under)} (${o.kind})`);
    for (const [a, b] of r.unordered) out.push(`${pad}  unordered ${frameName(a)} | ${frameName(b)}`);
    for (const l of r.stanceLists ?? []) out.push(`${pad}  stanceList ${formatStanceList(l)}`);
    for (const line of formatClaim(r.claim)) out.push(`${pad}  ${line}`);
    for (const l of r.links) out.push(`${pad}  ${formatLink(l)}`);
    for (const u of r.unread) out.push(`${pad}  unread ${u.construction}${u.key ? ` ${u.key}` : ""}${u.word ? ` "${u.word.raw}"` : ""} (${u.reason})`);
    for (const nested of nestedReadings(r)) out.push(...formatReadings([nested], indent + 1));
  }
  return out;
}

/** The readings held directly inside one reading, once each, in the order the lines above name them. */
function nestedReadings(r: Reading): Reading[] {
  const found: Reading[] = [];
  const seen = new Set<Reading>();
  const add = (list?: Reading[]): void => {
    for (const x of list ?? []) if (!seen.has(x)) (seen.add(x), found.push(x));
  };
  const term = (t: Term | undefined): void => {
    if (!t) return;
    if (t.kind === "clause") add([t.reading]);
    else if (t.kind === "quote") add(t.readings);
    else if (t.kind === "list") {
      t.members.forEach(term);
      if (t.bound) detail(t.bound);
      t.sharedDetails?.forEach(detail);
    }
    if ("details" in t) t.details?.forEach(detail);
  };
  const frame = (f: Frame): void => {
    add(f.content);
    term(f.party);
    term(f.hosted);
    f.inner?.forEach(frame);
    f.details?.forEach(detail);
  };
  const detail = (d: Detail): void => {
    add(d.content);
    term(d.hosted);
    d.details?.forEach(detail);
    d.frames?.forEach(frame);
  };
  r.frames.forEach(frame);
  term(r.claim.verb);
  Object.values(r.claim.roles).forEach(term);
  r.claim.predicate.forEach(term);
  r.claim.details.forEach(detail);
  term(r.claim.clauses);
  return found;
}

/** JSON replacer: a LexWord becomes `{ at, text }`; the parse-tree clause pointer is dropped. */
export function jsonReplacer(key: string, value: unknown): unknown {
  if (key === "source" && value && typeof value === "object") {
    const s = value as { utterance: number; body: number };
    return { utterance: s.utterance, body: s.body };
  }
  if (value && typeof value === "object" && "raw" in value && "reading" in value && "family" in value) {
    const w = value as LexWord;
    return { at: w.at, text: w.raw };
  }
  return value;
}

/** Circular-safe stringify: a repeated object prints as its id or `[seen]`. */
export function readingsJson(readings: Reading[]): string {
  return circularJson(readings);
}

function circularJson(value: unknown): string {
  const stack: unknown[] = [];
  return JSON.stringify(
    value,
    function (this: unknown, key: string, value: unknown) {
      const v = jsonReplacer(key, value);
      if (v && typeof v === "object") {
        while (stack.length && stack[stack.length - 1] !== this) stack.pop();
        if (stack.includes(v)) return "[seen]";
        stack.push(v);
      }
      return v;
    },
    2,
  );
}

/** The turns of a conversation file: one per line, `Name:` sets the speaker, which carries to the lines after it. */
export function parseConversation(text: string): { turns: (Turn & { line: number })[] } {
  const turns: (Turn & { line: number })[] = [];
  let speaker = "speaker";
  text.split("\n").forEach((raw, i) => {
    let line = raw.trim();
    if (!line || line.startsWith("#")) return;
    const named = /^([A-Za-z][A-Za-z0-9_-]*):\s*(.*)$/.exec(line);
    if (named) {
      speaker = named[1]!;
      line = named[2]!.trim();
    }
    if (line) turns.push({ speaker, at: turns.length, text: line, line: i + 1 });
  });
  return { turns };
}

const glossOf = (text: string, tables: ClassifyTables): string => {
  try {
    return morphGlossLine(text, tables, { strict: true });
  } catch (error) {
    return `no gloss: ${error instanceof Error ? error.message.split("\n")[0] : String(error)}`;
  }
};

/** Build the log of a conversation file; a turn that does not parse is reported on stderr with its line and skipped. */
export function conversationLog(file: string, tables: ClassifyTables, window?: number): Log {
  const { turns } = parseConversation(readFileSync(file, "utf8"));
  const log = buildLog(turns, tables, window === undefined ? {} : { window });
  for (const r of log.rejected) console.error(`${file}:${(turns[r.at] as { line: number }).line}: skipped: ${r.error.split("\n")[0]}`);
  return log;
}

/** Text for `log`: each turn, then its readings. */
export function formatLog(log: Log, tables: ClassifyTables): string[] {
  const out: string[] = [];
  for (const e of log.entries) {
    out.push(`[${e.at}] ${e.speaker}: ${e.text}`, `  gloss ${glossOf(e.text, tables)}`);
    out.push(...formatReadings(e.readings).map((l) => `  ${l}`));
  }
  return out;
}

const showTerm = (t: Term): string => formatTerm(throughAntecedent(t));

/** Text for one match of `ask`. */
export function formatMatch(m: Match, query: string, tables: ClassifyTables): string[] {
  const out = [`match ${m.reading.id}${m.entry ? ` [${m.entry.at}] ${m.entry.speaker}` : ""}`];
  for (const b of m.binding.blanks) out.push(`  bound ${b.at} = ${showTerm(b.term)}`);
  m.path.frames.forEach((pf, i) => {
    const lists = pf.lists.map((l) => ` ${l.standing}${l.rank ? `#${l.rank}` : ""}`).join("");
    out.push(`  path ${i + 1} ${pf.how === "carried" ? "carried " : ""}${pf.reading.id}: ${formatFrame(pf.frame)}${lists}`);
  });
  for (const [a, b] of m.unsettled) out.push(`  unsettled ${frameName(a)} | ${frameName(b)}`);
  if (m.switches.length) out.push(`  switches ${m.switches.join(", ")}`);
  out.push(`  query gloss ${glossOf(query, tables)}`);
  if (m.entry) out.push(`  sentence gloss ${glossOf(m.entry.text, tables)}`);
  return out;
}

function conversation(command: "log" | "ask", raw: string[]): void {
  let json = false;
  let widen = false;
  let infer = false;
  let window: number | undefined;
  const args: string[] = [];
  for (let i = 0; i < raw.length; i++) {
    const arg = raw[i]!;
    if (arg === "--json") json = true;
    else if (arg === "--widen" && command === "ask") widen = true;
    else if (arg === "--infer" && command === "ask") infer = true;
    else if (arg === "--window") {
      window = Number(raw[++i]);
      if (!Number.isInteger(window) || window < 0) (console.error(`--window needs a whole number\n${USAGE}`), process.exit(1));
    } else if (arg.startsWith("--")) (console.error(`unknown flag ${arg}\n${USAGE}`), process.exit(1));
    else args.push(arg);
  }
  if (args.length !== (command === "log" ? 1 : 2)) (console.error(USAGE), process.exit(1));
  const tables = loadDefaultTables();
  const log = conversationLog(args[0]!, tables, window);
  const plain = (e: Turn): Turn => ({ speaker: e.speaker, at: e.at, text: e.text });
  if (command === "log") {
    if (json) console.log(circularJson({ turns: log.entries.map((e) => ({ ...plain(e), readings: e.readings })), rejected: log.rejected }));
    else for (const l of formatLog(log, tables)) console.log(l);
    return;
  }
  const query = args[1]!.trim();
  let question: Reading | undefined;
  try {
    question = readQuestion(log, query, tables)[0];
  } catch (error) {
    console.error(`query: ${error instanceof Error ? error.message.split("\n")[0] : String(error)}`);
    process.exit(1);
  }
  if (!question) (console.error("query: holds no sentence"), process.exit(1));
  const matches = ask(question, log, { lexicon: tables, switches: { widen, infer } });
  if (json) console.log(circularJson(matches.map((m) => ({ ...m, entry: m.entry ? plain(m.entry) : undefined }))));
  else if (matches.length === 0) console.log("no match");
  else for (const m of matches) for (const l of formatMatch(m, query, tables)) console.log(l);
}

/** The solver's options a solve or clashes command names. */
type SolveFlags = { json: boolean; possible: boolean; defaults: boolean; closed: boolean; giveUp: boolean; program?: ProgramView; case?: string; semantics?: Semantics; window?: number; args: string[] };

type SolveCommand = "solve" | "clashes" | "stands" | "probe";

function solveFlags(command: SolveCommand, raw: string[]): SolveFlags {
  const flags: SolveFlags = { json: false, possible: false, defaults: false, closed: false, giveUp: false, args: [] };
  const asks = command === "solve" || command === "probe";
  for (let i = 0; i < raw.length; i++) {
    const arg = raw[i]!;
    if (arg === "--json") flags.json = true;
    else if (arg === "--possible" && asks) flags.possible = true;
    else if (arg === "--defaults" && asks) flags.defaults = true;
    else if (arg === "--closed" && asks) flags.closed = true;
    else if ((arg === "--program" || arg === "--program=full") && command === "probe") flags.program = { ...flags.program, ...(arg === "--program=full" ? { full: true } : {}) };
    else if ((arg === "--terms" || arg.startsWith("--terms=")) && command === "probe") {
      const list = arg === "--terms" ? raw[++i] : arg.slice("--terms=".length);
      const terms = (list ?? "").split(",").map((t) => t.trim()).filter(Boolean);
      if (!terms.length) (console.error(`--terms needs predicate names, a,b\n${USAGE}`), process.exit(1));
      flags.program = { ...flags.program, terms };
    } else if ((arg === "--case" || arg.startsWith("--case=")) && command === "probe") {
      const id = arg === "--case" ? raw[++i] : arg.slice("--case=".length);
      if (!id) (console.error(`--case needs a number or a label\n${USAGE}`), process.exit(1));
      flags.case = id;
    }
    else if (arg === "--give-up" && command === "clashes") flags.giveUp = true;
    else if (arg === "--semantics" && command === "stands") {
      const s = raw[++i];
      if (s !== "grounded" && s !== "stable" && s !== "preferred") (console.error(`--semantics needs grounded, stable or preferred\n${USAGE}`), process.exit(1));
      flags.semantics = s;
    }
    else if (arg === "--window" && command !== "probe") {
      flags.window = Number(raw[++i]);
      if (!Number.isInteger(flags.window) || flags.window < 0) (console.error(`--window needs a whole number\n${USAGE}`), process.exit(1));
    } else if (arg.startsWith("--")) (console.error(`unknown flag ${arg}\n${USAGE}`), process.exit(1));
    else flags.args.push(arg);
  }
  if (flags.args.length !== (command === "solve" ? 2 : 1)) (console.error(USAGE), process.exit(1));
  return flags;
}

/** The reply to a solver answer: yes, no, or cannot say spelled; *these cannot all hold* for `both`; else its English. */
export function answerReply(answer: Answer, tables: ClassifyTables): Reply | undefined {
  if (answer.verdict === "yes") return firstReply("yes", [yesDraft()], tables);
  if (answer.verdict === "no") return firstReply("no", [noDraft()], tables);
  if (answer.verdict === "unknown") return firstReply("cannotSay", [cannotSayDraft(tables)], tables);
  if (answer.verdict === "both") return clashReply(answer.because);
  return undefined;
}

/** One line per reading id: the id, then its turn when the log has it. */
function readingLines(ids: readonly string[], log: Log, indent: string): string[] {
  const turnOf = new Map(log.entries.flatMap((e) => e.readings.map((r) => [r.id, e] as const)));
  return ids.map((id) => {
    const e = turnOf.get(id);
    return `${indent}${id}${e ? ` [${e.at}] ${e.speaker}: ${e.text}` : ""}`;
  });
}

const leftLines = (left: readonly LeftOut[]): string[] => left.map((l) => `left ${l.reading} ${l.construction}: ${l.reason}`);

/** Text for `solve`: verdict, reply, why with each deciding turn, switches, readings left out. */
export function formatAnswer(answer: Answer, log: Log, tables: ClassifyTables): string[] {
  const out = [`verdict ${answer.verdict}`];
  const reply = answerReply(answer, tables);
  if (reply) out.push(`reply ${reply.english}${reply.ageben ? ` ${reply.ageben}` : ""}`);
  if (answer.english) out.push(`english ${answer.english}`);
  if (answer.because.length && answer.verdict !== "both") out.push(`why ${whyReply(answer.because).english}`);
  out.push(...readingLines(answer.because, log, "  "));
  if (answer.switches.length) out.push(`switches ${answer.switches.join(", ")}`);
  out.push(...leftLines(answer.left));
  return out;
}

/** Text for `stands`: each reading with its label and turn, the attacks, and the extensions. */
export function formatStands(result: StandsResult, log: Log): string[] {
  const out: string[] = [];
  if (result.refused) out.push(`refused ${result.refused}`);
  else {
    out.push(`semantics ${result.semantics}`);
    if (result.english) out.push(`english ${result.english}`);
    for (const s of result.stands) out.push(...readingLines([s.reading], log, `${s.label}${s.credulous && s.label !== "in" ? " (credulous)" : ""} `));
    for (const [a, b] of result.attacks) out.push(`attack ${a} -> ${b}`);
    for (const e of result.extensions) out.push(`extension {${e.join(", ")}}`);
  }
  out.push(...leftLines(result.left));
  return out;
}

/** Text for `clashes`: each clash's reply, atom, switches and readings; then the set to give up, when asked. */
export function formatClashes(result: { clashes: Clash[]; left: LeftOut[]; refused?: string }, log: Log, give?: GiveUpResult): string[] {
  const out: string[] = [];
  if (result.refused) out.push(`refused ${result.refused}`);
  else if (result.clashes.length === 0) out.push("no clash");
  for (const c of result.clashes) {
    out.push(`clash ${c.english}`, `  atom ${c.atom}`);
    if (c.switches.length) out.push(`  switches ${c.switches.join(", ")}`);
    out.push(...readingLines(c.readings, log, "  "));
  }
  if (give) {
    if (give.refused) out.push(`give up refused ${give.refused}`);
    else out.push(`give up ${giveUpReply(give.giveUp).english}`, ...readingLines(give.giveUp, log, "  "));
  }
  out.push(...leftLines(result.left));
  return out;
}

async function solveCommand(command: SolveCommand, raw: string[]): Promise<void> {
  const flags = solveFlags(command, raw);
  if (command === "probe") return probeCommand(flags);
  const tables = loadDefaultTables();
  const log = conversationLog(flags.args[0]!, tables, flags.window);
  const options: SolveOptions = { lexicon: tables, defaults: flags.defaults, closedWorld: flags.closed };
  if (command === "stands") {
    const result = await stands(log, { ...options, semantics: flags.semantics });
    if (flags.json) console.log(JSON.stringify(result, null, 2));
    else for (const l of formatStands(result, log)) console.log(l);
    if (result.refused) process.exitCode = 1;
    return;
  }
  if (command === "clashes") {
    const result = await clashes(log, options);
    const give = flags.giveUp ? await giveUp(log, options) : undefined;
    if (flags.json) console.log(JSON.stringify({ ...result, ...(give ? { giveUp: give } : {}) }, null, 2));
    else for (const l of formatClashes(result, log, give)) console.log(l);
    if (result.refused) process.exitCode = 1;
    return;
  }
  const query = flags.args[1]!.trim();
  let question: Reading | undefined;
  try {
    question = readQuestion(log, query, tables)[0];
  } catch (error) {
    console.error(`query: ${error instanceof Error ? error.message.split("\n")[0] : String(error)}`);
    process.exit(1);
  }
  if (!question) (console.error("query: holds no sentence"), process.exit(1));
  const answer = await (flags.possible ? couldBe : follows)(log, question, options);
  if (flags.json) console.log(JSON.stringify({ ...answer, reply: answerReply(answer, tables) }, null, 2));
  else for (const l of formatAnswer(answer, log, tables)) console.log(l);
  if (answer.verdict === "refused") process.exitCode = 1;
}

/** `probe`: each case of the FILE run on its own; only a usage error or an unreadable FILE exits 1. */
async function probeCommand(flags: SolveFlags): Promise<void> {
  let text: string;
  try {
    text = readFileSync(flags.args[0]!, "utf8");
  } catch (error) {
    console.error(`${flags.args[0]}: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }
  const tables = loadDefaultTables();
  const options: SolveOptions = { lexicon: tables, defaults: flags.defaults, closedWorld: flags.closed };
  const cases = parseProbe(text, flags.possible);
  // --case N is the 1-based index among the file's cases; otherwise the case whose label is exactly LABEL.
  const chosen = flags.case === undefined ? undefined : /^\d+$/.test(flags.case) ? Number(flags.case) - 1 : cases.findIndex((c) => c.label === flags.case);
  if (chosen !== undefined && !cases[chosen]) (console.error(`--case ${flags.case}: no such case (the file has ${cases.length})`), process.exit(1));
  for (const [i, c] of cases.entries()) {
    if (chosen !== undefined && i !== chosen) continue;
    const result = await runProbeCase(c, tables, options, flags.program);
    console.log(flags.json ? probeJson(result) : formatProbe(result, i).join("\n"));
  }
}

async function main(): Promise<void> {
  const raw = process.argv.slice(2);
  if (raw[0] === "log" || raw[0] === "ask") return conversation(raw[0], raw.slice(1));
  if (raw[0] === "solve" || raw[0] === "clashes" || raw[0] === "stands" || raw[0] === "probe") return solveCommand(raw[0], raw.slice(1));
  let json = false;
  let file: string | undefined;
  const args: string[] = [];
  for (let i = 0; i < raw.length; i++) {
    const arg = raw[i]!;
    if (arg === "--json") json = true;
    else if (arg === "--file") file = raw[++i];
    else if (arg.startsWith("--")) {
      console.error(`unknown flag ${arg}\n${USAGE}`);
      process.exit(1);
    } else args.push(arg);
  }
  const readStdin = args.includes("-") || (!file && args.length === 0 && !process.stdin.isTTY);
  const inputs = [
    ...args.filter((a) => a !== "-"),
    ...(file ? readFileSync(file, "utf8").split("\n") : []),
    ...(readStdin ? readFileSync(0, "utf8").split("\n") : []),
  ]
    .map((t) => t.trim())
    .filter(Boolean);
  if (inputs.length === 0) {
    console.error(USAGE);
    process.exit(1);
  }
  const tables = loadDefaultTables();
  let failed = false;
  const results = inputs.map((input) => {
    try {
      return { input, readings: readText(input, tables), error: undefined };
    } catch (error) {
      failed = true;
      return { input, readings: undefined, error: error instanceof Error ? error.message : String(error) };
    }
  });
  if (json) {
    const objs = results.map((r) => (r.readings ? { input: r.input, readings: JSON.parse(readingsJson(r.readings)) } : r));
    console.log(JSON.stringify(objs.length === 1 ? objs[0] : objs, null, 2));
  } else {
    for (const r of results) {
      console.log(r.input);
      console.log(!r.readings ? `  ERROR ${r.error}` : formatReadings(r.readings).map((l) => `  ${l}`).join("\n"));
    }
  }
  if (failed) process.exit(1);
}

if (/^(reading\.mjs|cli\.bundle\.mjs)$/.test(basename(process.argv[1] ?? ""))) await main();
