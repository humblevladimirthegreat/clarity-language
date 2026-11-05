/**
 * Default order by speech act ([speech-moves.md](../../docs/grammar/beginner/speech-moves.md#act-word-order),
 * [clause.md](../../docs/grammar/beginner/clause.md#direct-object-d), [questions.md](../../docs/grammar/beginner/questions.md#fill-ask)).
 * Order carries no meaning (D-44), so any order parses; this lint only warns where a doc example leaves its act's
 * default order, which a listener leans on when the act word is missed.
 *
 * - statement and prohibition: verb late (no `/z/` or `/d/` after the verb)
 * - question: verb second (one phrase before it)
 * - fill-ask: every blank first, then the other words in statement order
 * - command: verb first (no `/z/`, `/d/`, or `/b/` before it)
 * - subject before object (a command names its listener after the verb)
 * - the recipient `/b/` right after the verb (clause.md#extra-nouns)
 *
 * Order is read in slots: `X HOOK Y` with one role on both sides (a same-role hook, range, or same-role word) is one
 * slot, and so is a range whose far end is a bare number (`dorelx gragel oer grazal`); a hook that describes the noun on
 * its left (`zodozel om bar`) belongs to that noun; a hook's `/b/` landmark, a measure `/b/` (`bezerom gradol`,
 * numbers-applied.md#measure-phrases), and every `/h/` / `/th/` unit is an `h` slot, which goes anywhere. A range hook
 * in **-r** under a question is a fill-ask blank, as the resolver records it (open-ranges.md#named-ranges). A stand-in (`darl`, `dorm`) sits where its dependent
 * puts it and is not checked. Verbless clauses and dependents are not checked.
 */
import { walkAgebenSpans, classifyAgebenSpan } from "./ageben-docs.js";
import { parseWithTables } from "../parse/parse-core.js";
import type { ClassifyTables } from "../parse/classify.js";
import type { BodyClause, Clause, ParseResult, Unit, Utterance } from "../parse/types.js";

export type ActKind = "statement" | "question" | "command" | "prohibition";

export type OrderFinding = {
  act: ActKind;
  /** The clause's slots in spoken order (`z d v`), with `h` for a slot that goes anywhere. */
  order: string;
  rule: string;
};

const ACTS: Record<string, ActKind> = { yal: "statement", yel: "question", yol: "command", yul: "prohibition" };

/** The real act: the outer of two stacked act words (speech-acts.md#stacked-acts), else the act word; none is a statement. */
export function utteranceAct(utterance: Utterance): ActKind | undefined {
  const word = utterance.left.leadForce ?? utterance.left.force;
  return word ? ACTS[word.raw] : "statement";
}

type Slot = { role: string; units: Unit[] };

/** Every word position (`at`) inside a unit. */
function positions(value: unknown, out = new Set<number>()): Set<number> {
  if (Array.isArray(value)) for (const item of value) positions(item, out);
  else if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    if (typeof record.raw === "string" && typeof record.at === "number") out.add(record.at);
    for (const child of Object.values(record)) positions(child, out);
  }
  return out;
}

function isStandIn(unit: Unit): boolean {
  return unit.kind === "np" && unit.coord.parts.some((part) =>
    part.items.some((item) => item.kind === "package" && item.package.head.reading.startsWith("standIn")),
  );
}

/** A unit noun with its amount (`bezerom gradol` *two meters*): says how much, like an `/h/` word. */
function isMeasure(unit: Unit): boolean {
  return unit.kind === "np" && unit.coord.level === "b" && unit.coord.parts.some((part) =>
    part.items.some((item) =>
      item.kind === "package" &&
      item.package.head.ending === "m" &&
      item.package.adjs.some((adj) => adj.word.reading === "number"),
    ),
  );
}

function role(unit: Unit | undefined): string | undefined {
  if (!unit) return undefined;
  if (unit.kind === "vp") return "v";
  if (unit.kind === "np" && !isStandIn(unit) && !isMeasure(unit)) return unit.coord.level;
  return undefined;
}


/** A clause's units as order slots. */
export function orderSlots(clause: Clause): Slot[] {
  const out: Slot[] = [];
  const units = clause.units;
  for (let i = 0; i < units.length; i++) {
    const unit = units[i]!;
    const previous = out.at(-1);
    if (unit.kind === "hook") {
      const next = units[i + 1];
      const nextRole = role(next);
      if (unit.onLeft && previous) {
        // Describes the noun on its left, landmark included.
        previous.units.push(unit);
        if (next?.kind === "np" && next.coord.level === "b") previous.units.push(units[++i]!);
      } else if (previous && nextRole && previous.role === nextRole) {
        // `X HOOK Y` in one role: one slot.
        previous.units.push(unit, units[++i]!);
      } else if (previous && next?.kind === "predicate") {
        // A range whose far end is a bare number (`dorelx gragel oer grazal`): one slot.
        previous.units.push(unit, units[++i]!);
      } else if (next?.kind === "np" && next.coord.level === "b") {
        out.push({ role: "h", units: [unit, units[++i]!] });
      } else {
        out.push({ role: "h", units: [unit] });
      }
      continue;
    }
    out.push({ role: role(unit) ?? "h", units: [unit] });
  }
  return out;
}

/** Each rule the clause breaks, in a fixed order. */
function clauseFindings(clause: Clause, act: ActKind, blanks: Set<number>): string[] {
  const all = orderSlots(clause);
  // What follows a stand-in is its dependent, placed by its own rule.
  const standIn = all.findIndex((s) => s.units.some(isStandIn));
  const slots = standIn < 0 ? all : all.slice(0, standIn);
  const hasBlank = (slot: Slot) => [...positions(slot.units)].some((at) => blanks.has(at));
  // A hook or same-role word that the blank completes comes first with it (`yel alam zar …`).
  const isBlank = (slot: Slot, i: number) =>
    hasBlank(slot) || (slot.units.length === 1 && slot.units[0]!.kind === "hook" && !!slots[i + 1] && hasBlank(slots[i + 1]!));
  const fillAsk = act === "question" && slots.some(isBlank);
  // A fill-ask's blanks come first; the rest is read in statement order.
  const lastBlank = fillAsk ? Math.max(...slots.map((s, i) => (isBlank(s, i) ? i : -1))) : -1;
  const rest = slots.slice(lastBlank + 1);
  const verb = rest.findIndex((s) => s.role === "v");
  if (verb < 0) return [];
  const rules: string[] = [];
  const before = rest.slice(0, verb).map((s) => s.role);
  const after = rest.slice(verb + 1).map((s) => s.role);

  if (fillAsk) {
    if (!slots.slice(0, lastBlank).every(isBlank)) rules.push("fill-ask: every blank first");
    if (after.some((r) => r === "z" || r === "d")) rules.push("fill-ask: statement order after the blank");
  } else if (act === "question") {
    if (before.length !== 1) rules.push("question: verb second");
  } else if (act === "command") {
    if (before.some((r) => r === "z" || r === "d" || r === "b")) rules.push("command: verb first");
  } else if (after.some((r) => r === "z" || r === "d")) {
    rules.push(`${act}: verb late`);
  }

  const roles = rest.map((s) => s.role);
  const z = roles.indexOf("z");
  const d = roles.indexOf("d");
  // A command names its listener after the verb (`yol guyulom zawan`, label-reach.md#label-reach).
  if (act !== "command" && z >= 0 && d >= 0 && d < z) rules.push("subject before object");
  if (act !== "command" && before.includes("b")) rules.push("/b/ right after the verb");
  return rules;
}

function bodyClauses(body: BodyClause): Clause[] {
  if (body.fragment) return [];
  const out: Clause[] = [];
  const walk = (clause: Clause) => {
    const only = clause.units.length === 1 ? clause.units[0] : undefined;
    if (only?.kind !== "clauseCoord") return void out.push(clause);
    if (only.coord.first) walk(only.coord.first);
    for (const link of only.coord.links) if (link.clause) walk(link.clause);
  };
  walk(body.clause);
  return out;
}

/** Where a parsed sentence leaves its act's default order. */
export function orderFindings(result: ParseResult): OrderFinding[] {
  const out: OrderFinding[] = [];
  result.utterances.forEach((utterance, index) => {
    const act = utteranceAct(utterance);
    if (!act) return;
    const blanks = new Set<number>();
    for (const ask of result.resolve?.asks ?? []) {
      if (ask.utteranceIndex === index && ask.kind === "fillAsk") for (const gap of ask.gaps) if (gap.at !== undefined) blanks.add(gap.at);
    }
    for (const body of utterance.bodies) {
      for (const clause of bodyClauses(body)) {
        const order = orderSlots(clause).map((s) => s.role).join(" ");
        for (const rule of clauseFindings(clause, act, blanks)) out.push({ act, order, rule });
      }
    }
  });
  return out;
}

export type WordOrderWarning = { text: string; index: number; rule: string; order: string };

/** The same words in any order (a demonstration pair shows one sentence both ways). */
function wordsKey(text: string): string {
  return text.replace(/[.?!;%&]/g, " ").split(/\s+/).filter(Boolean).sort().join(" ");
}

export type ParsedSentence = { text: string; index: number; result: ParseResult; moved?: boolean };

/**
 * A page's sentences that leave their act's default order. A moved sentence is not reported when the same page also
 * shows the same words in default order: that pair teaches that moving changes nothing (clause.md#direct-object-d).
 * Nor is one marked `<!-- lint: moved -->`: the example is about where a word stands.
 */
export function wordOrderWarnings(sentences: readonly ParsedSentence[]): WordOrderWarning[] {
  const moved: (WordOrderWarning & { key: string })[] = [];
  const inDefault = new Set<string>();
  for (const { text, index, result, moved: marked } of sentences) {
    const key = wordsKey(text);
    const findings = orderFindings(result);
    if (findings.length === 0) inDefault.add(key);
    if (marked) continue;
    for (const f of findings) moved.push({ text, index, rule: f.rule, order: f.order, key });
  }
  return moved.filter((w) => !inDefault.has(w.key)).map(({ key: _key, ...w }) => w);
}

/** Sentences marked `<!-- lint: moved -->` that are already in their act's default order: the marker is stale. */
export function staleMovedMarkers(sentences: readonly ParsedSentence[]): ParsedSentence[] {
  return sentences.filter((s) => s.moved && orderFindings(s.result).length === 0);
}

/** {@link wordOrderWarnings} for one page's markdown, parsing its sentence spans. */
export function lintWordOrder(markdown: string, tables: ClassifyTables): WordOrderWarning[] {
  const sentences: ParsedSentence[] = [];
  const add = (span: string, index: number, moved: boolean) => {
    if (classifyAgebenSpan(span) !== "sentence") return;
    try {
      sentences.push({ text: span.trim(), index, result: parseWithTables(span.trim(), tables), moved });
    } catch {
      // The span lint reports sentences that do not parse.
    }
  };
  walkAgebenSpans(markdown, {
    text: (span, index) => add(span, index, false),
    moved: (span, index) => add(span, index, true),
  });
  return wordOrderWarnings(sentences);
}
