/**
 * Equal readings (docs/meta/interpreter.md#equal-readings): whether two texts say the same thing. Each side's readings
 * become a canonical form, and the two forms are compared. Comparison rules that fill in what the reader leaves out (the
 * omitted act word) live here, never in the reader (interpreter.md#reader-rules, rule 4). No Node API: the browser entry
 * exports it.
 */
import type { ClassifyTables } from "../parse/classify.js";
import { pairRow } from "../parse/scope.js";
import type { LexWord } from "../parse/types.js";
import { readText } from "./read.js";
import { numberBody } from "./read-context.js";
import type { Detail, Frame, FrameOrder, Link, Reading, StanceList, Term } from "./types.js";

export type EqualVerdict = "same" | "different" | "unsettled";

export type EqualResult = {
  verdict: EqualVerdict;
  /** `unsettled`: each unordered pair the two texts write in different text order, as its two canonical frames. */
  pairs?: [string, string][];
  /** A text that does not parse (its verdict is `different`): `<text>: <first line of the error>`. */
  error?: string;
};

/** An unordered pair, its two canonical frames in text order. */
export type UnorderedPair = { first: string; second: string };

/** The canonical form of a text's readings: one string per sentence, and every unordered pair with its text order. */
export type CanonicalReadings = { sentences: string[]; unordered: UnorderedPair[] };

/** The act word an omitted one stands for: the statement act `yal` (speech-moves.md#speech-act-statement-question-command). */
const STATEMENT_ACT = { family: "force", key: "edge:force", construction: "token.force", raw: "yal", values: { series: "a", ending: "l" } } as const;

/** Compare the readings of two texts with the tables the reader parses them with. */
export function sameReadings(textA: string, textB: string, tables: ClassifyTables): EqualResult {
  const sides: CanonicalReadings[] = [];
  for (const text of [textA, textB]) {
    try {
      sides.push(canonicalReadings(readText(text.normalize("NFC").trim(), tables)));
    } catch (error) {
      return { verdict: "different", error: `${text}: ${(error instanceof Error ? error.message : String(error)).split("\n")[0]}` };
    }
  }
  return compareCanonical(sides[0]!, sides[1]!);
}

/** Compare two canonical forms: an unordered pair in different text order first, then the sentences. */
export function compareCanonical(a: CanonicalReadings, b: CanonicalReadings): EqualResult {
  const pairs: [string, string][] = [];
  for (const left of a.unordered) {
    const flipped = b.unordered.some((right) => right.first === left.second && right.second === left.first);
    const kept = b.unordered.some((right) => right.first === left.first && right.second === left.second);
    if (flipped && !kept) pairs.push([left.first, left.second]);
  }
  if (pairs.length > 0) return { verdict: "unsettled", pairs };
  const same = a.sentences.length === b.sentences.length && a.sentences.every((s, i) => s === b.sentences[i]);
  return { verdict: same ? "same" : "different" };
}

/** The canonical form of a text's top-level readings, in sentence order. */
export function canonicalReadings(readings: Reading[]): CanonicalReadings {
  const ctx = new Canon(readings);
  const sentences = readings.map((reading) => stringify(ctx.reading(reading, true)));
  return { sentences, unordered: ctx.unordered };
}

type Json = null | boolean | number | string | Json[] | { [key: string]: Json | undefined };

/** JSON with sorted keys and undefined fields left out. */
function stringify(value: Json | undefined): string {
  if (value === undefined || value === null || typeof value !== "object") return JSON.stringify(value ?? null);
  if (Array.isArray(value)) return `[${value.map(stringify).join(",")}]`;
  const keys = Object.keys(value)
    .filter((k) => value[k] !== undefined)
    .sort();
  return `{${keys.map((k) => `${JSON.stringify(k)}:${stringify(value[k])}`).join(",")}}`;
}

/** A multiset: its members sorted by their canonical text. */
function multiset(values: Json[]): Json[] {
  return values.map((v) => [stringify(v), v] as const).sort(([x], [y]) => (x < y ? -1 : x > y ? 1 : 0)).map(([, v]) => v);
}

/**
 * A word's form. A number word compares by its role letter, value and ending, not its writing: "Both writings name the
 * same word" (number-markers.md#writing-preferred-shorthand), so `g+3` and `gragel`, `g~+12` and `grabadom` are one form.
 */
function formOf(word: LexWord | { raw: string }, pos?: string): string {
  const family = "family" in word ? word.family : undefined;
  if (family?.kind !== "number") return word.raw;
  const lex = word as LexWord;
  return `${pos ?? lex.pos ?? ""}(${numberBody(family.stem)})${lex.ending ?? ""}`;
}

const raw = (word: LexWord | { raw: string }): string => formOf(word);

class Canon {
  /** Each word's top-level sentence, so a referent names the sentence it was met in. */
  private readonly sentenceOf = new Map<LexWord, number>();
  /** The term each word heads, for a tag pair's second antecedent. */
  private readonly termOf = new Map<LexWord, Term>();
  private readonly frames = new Map<Frame, Json>();
  private readonly inProgress = new Set<object>();
  readonly unordered: UnorderedPair[] = [];

  constructor(readings: Reading[]) {
    readings.forEach((reading, index) => this.index(reading, index, new Set()));
  }

  /** Walks the reading (not the parse) for its words and terms. */
  private index(value: unknown, sentence: number, seen: Set<object>): void {
    if (value === null || typeof value !== "object" || seen.has(value)) return;
    seen.add(value);
    if (Array.isArray(value)) return value.forEach((v) => this.index(v, sentence, seen));
    if (typeof (value as LexWord).raw === "string") {
      if (!this.sentenceOf.has(value as LexWord)) this.sentenceOf.set(value as LexWord, sentence);
      return;
    }
    const term = value as Term;
    if (term.kind === "thing" && !this.termOf.has(term.head)) this.termOf.set(term.head, term);
    if ("word" in term && (term.kind === "pronoun" || term.kind === "speaker" || term.kind === "listener" || term.kind === "we") && !this.termOf.has(term.word)) {
      this.termOf.set(term.word, term);
    }
    for (const [key, child] of Object.entries(value)) {
      if (key === "source" || key === "bind" || key === "antecedent" || key === "partners" || key === "list" || key === "tagged") continue;
      this.index(child, sentence, seen);
    }
  }

  /** A reading: frames, details and links as multisets, roles by letter, frame order by canonical frame. */
  reading(reading: Reading, sentence: boolean): Json {
    const frames = reading.frames.map((f) => this.frame(f));
    const order: Json[] = reading.order.map((o) => this.order(o));
    const unordered: Json[] = reading.unordered.map(([x, y]) => multiset([this.frame(x), this.frame(y)]));
    for (const pair of reading.unordered) this.unordered.push(this.textOrder(reading, pair));
    // The omitted act word: a sentence with no force frame takes the statement act, with the order `yal` would bring.
    if (sentence && !reading.frames.some((f) => f.family === "force")) {
      const act: Json = { family: STATEMENT_ACT.family, key: STATEMENT_ACT.key, construction: STATEMENT_ACT.construction, words: [STATEMENT_ACT.raw], values: { ...STATEMENT_ACT.values } };
      for (const frame of reading.frames) {
        const placed = actOrder(frame);
        if (placed === "over") order.push({ over: act, under: this.frame(frame), kind: actKind(frame) });
        if (placed === "under") order.push({ over: this.frame(frame), under: act, kind: actKind(frame) });
        if (placed === "unsettled") unordered.push(multiset([act, this.frame(frame)]));
      }
      frames.push(act);
    }
    const claim = reading.claim;
    const roles: { [key: string]: Json } = {};
    for (const [letter, term] of Object.entries(claim.roles)) if (term) roles[letter] = this.term(term);
    return {
      frames: multiset(frames),
      order: multiset(order),
      unordered: multiset(unordered),
      stanceLists: reading.stanceLists ? multiset(reading.stanceLists.map((s) => this.stanceList(s))) : undefined,
      claim: {
        verb: claim.verb ? this.term(claim.verb) : undefined,
        roles,
        predicate: multiset(claim.predicate.map((t) => this.term(t))),
        details: this.details(claim.details),
        clauses: claim.clauses ? this.term(claim.clauses) : undefined,
      },
      links: multiset(reading.links.filter((l) => l.kind !== "anaphor").map((l) => this.link(l))),
      unread: multiset(reading.unread.map((u) => ({ construction: u.construction, key: u.key, reason: u.reason, word: u.word ? raw(u.word) : undefined }))),
    };
  }

  private readings(readings: Reading[] | undefined, sentence: boolean): Json | undefined {
    return readings?.map((r) => this.reading(r, sentence));
  }

  /** An unordered pair's frames in text order: by first word, else by place in `frames` (a tone mark has no word). */
  private textOrder(reading: Reading, [x, y]: [Frame, Frame]): UnorderedPair {
    const at = (f: Frame): number => f.words[0]?.at ?? reading.frames.indexOf(f) - 0.5;
    const [first, second] = at(x) <= at(y) ? [x, y] : [y, x];
    return { first: stringify(this.frame(first)), second: stringify(this.frame(second)) };
  }

  private order(o: FrameOrder): Json {
    return { over: this.frame(o.over), under: this.frame(o.under), kind: o.kind };
  }

  frame(frame: Frame): Json {
    const known = this.frames.get(frame);
    if (known !== undefined) return known;
    const value: Json = {
      family: frame.family,
      key: frame.key,
      construction: frame.construction,
      words: this.frameWords(frame),
      values: { ...frame.values },
      party: frame.party ? this.term(frame.party) : undefined,
      // A quote frame's content is talk with its own act word; other content is a nested clause.
      content: this.readings(frame.content, frame.family === "quote"),
      hosted: frame.hosted ? this.term(frame.hosted) : undefined,
      inner: frame.inner ? multiset(frame.inner.map((f) => this.frame(f))) : undefined,
      details: frame.details ? this.details(frame.details) : undefined,
      // A restrictor's occasions are its list, in text order, as a join's items are (restrictors.md#only-when-never-hal).
      occasions: frame.occasions ? frame.occasions.map((d) => this.detail(d)) : undefined,
      member: frame.member,
      holderHost: frame.holderHost,
    };
    this.frames.set(frame, value);
    return value;
  }

  /**
   * A frame's words. A new member brought in by an `-l` pointer (joins.md#new-member-in-a-statement) keeps the
   * antecedent's head written out, as the pointer's term does (pronouns.md#a-new-one), so `dwudel` compares as `dodozel`.
   */
  private frameWords(frame: Frame): Json[] {
    const hosted = frame.hosted;
    if (frame.key === "slot:newMember" && hosted?.kind === "pronoun" && hosted.word === frame.words[0] && hosted.word.ending === "l") {
      const written = this.term(hosted);
      if (written !== null && typeof written === "object" && !Array.isArray(written) && typeof written.head === "string") {
        return [written.head, ...frame.words.slice(1).map(raw)];
      }
    }
    return frame.words.map(raw);
  }

  private details(details: Detail[]): Json {
    return multiset(details.map((d) => this.detail(d)));
  }

  private detail(detail: Detail): Json {
    return {
      kind: detail.kind,
      key: detail.key,
      construction: detail.construction,
      words: detail.words.map(raw),
      values: { ...detail.values },
      content: this.readings(detail.content, false),
      hosted: detail.hosted ? this.term(detail.hosted) : undefined,
      details: detail.details ? this.details(detail.details) : undefined,
      frames: detail.frames ? multiset(detail.frames.map((f) => this.frame(f))) : undefined,
    };
  }

  private stanceList(list: StanceList): Json {
    return {
      key: list.key,
      join: raw(list.join),
      values: { ...list.values },
      members: list.members.map((m) => ("kind" in m && m.kind === "stanceList" ? this.stanceList(m) : this.frame(m as Frame))),
      inner: list.inner ? multiset(list.inner.map((f) => this.frame(f))) : undefined,
      details: list.details ? this.details(list.details) : undefined,
    };
  }

  private link(link: Link): Json {
    return {
      kind: link.kind,
      key: link.key,
      words: link.words.map(raw),
      shared: link.shared ? { join: raw(link.shared.join), role: link.shared.role } : undefined,
      answer: link.answer ? { form: link.answer.form, blanks: link.answer.blanks.map(raw) } : undefined,
      frame: link.frame ? this.frame(link.frame) : undefined,
      coveredBy: link.coveredBy ? multiset(link.coveredBy.map((f) => this.frame(f))) : undefined,
      partners: link.partners?.map((t) => this.term(t)),
    };
  }

  /** A term's own modifiers: details as a multiset, word-reach frames as a multiset. */
  private extras(term: { details?: Detail[]; frames?: Frame[] }): { details?: Json; frames?: Json } {
    return {
      details: term.details && term.details.length > 0 ? this.details(term.details) : undefined,
      frames: term.frames && term.frames.length > 0 ? multiset(term.frames.map((f) => this.frame(f))) : undefined,
    };
  }

  /** A term; `pos` writes a thing's head with another PoS letter (an `-l` pronoun's antecedent written out). */
  term(term: Term, pos?: string): Json {
    if (this.inProgress.has(term)) return { cycle: term.kind };
    this.inProgress.add(term);
    try {
      return this.termBody(term, pos);
    } finally {
      this.inProgress.delete(term);
    }
  }

  private termBody(term: Term, pos?: string): Json {
    switch (term.kind) {
      case "thing": {
        const from = term.head.pos ?? "";
        const head =
          term.head.family.kind === "number"
            ? formOf(term.head, pos)
            : pos !== undefined && term.head.raw.startsWith(from)
              ? pos + term.head.raw.slice(from.length)
              : term.head.raw;
        return { kind: "thing", head, ...this.extras(term) };
      }
      case "speaker":
      case "listener":
      case "we":
      case "blank":
      case "number":
        return { kind: term.kind, word: raw(term.word), ...this.extras(term) };
      case "literal":
        return { kind: "literal", word: raw(term.word), payload: term.payload, ...this.extras(term) };
      case "pronoun":
        return this.pronoun(term);
      case "list":
        return {
          kind: "list",
          values: { ...term.values },
          parts: term.parts.map((part) => ({ members: part.members.map((m) => this.term(m)), join: part.join ? raw(part.join) : undefined })),
          shared: multiset(term.shared.map((s) => ({ join: raw(s.join), role: s.role }))),
          frames: term.frames && term.frames.length > 0 ? multiset(term.frames.map((f) => this.frame(f))) : undefined,
          bound: term.bound ? this.detail(term.bound) : undefined,
          sharedDetails: term.sharedDetails ? this.details(term.sharedDetails) : undefined,
        };
      case "clause":
        return { kind: "clause", reading: this.reading(term.reading, false) };
      case "quote":
        return { kind: "quote", readings: this.readings(term.readings, true), ...this.extras(term) };
    }
  }

  /**
   * A bound pronoun by its referent, keeping its ending's sense (pronouns.md): `-r` the one meant, `-l` the antecedent
   * written out (pronouns.md#a-new-one), `-m` a share of it. A role compound keeps its reach and part. An unbound
   * pronoun compares by form.
   */
  private pronoun(term: Extract<Term, { kind: "pronoun" }>): Json {
    const { word, bind, antecedent } = term;
    if (!bind?.antecedent || !antecedent) return { kind: "pronoun", word: raw(word), ...this.extras(term) };
    const role = bind.kind === "role";
    if (word.ending === "l" && !role) {
      const written = this.term(antecedent, word.pos ?? "");
      return written !== null && typeof written === "object" && !Array.isArray(written) ? { ...written, ...this.extras(term) } : written;
    }
    const words = bind.antecedents ?? [bind.antecedent];
    const refs = words.map((w, i) => this.referent(i === 0 ? antecedent : this.termOf.get(w), w));
    return {
      kind: "referent",
      pos: word.pos ?? "",
      ending: word.ending === "r" ? undefined : word.ending,
      sense: word.resumeSense,
      plural: word.plural,
      role: role ? "role" : undefined,
      part: role || word.ending === "m" ? bind.part : undefined,
      refs,
      ...this.extras(term),
    };
  }

  /** The one a word names: through a chain of `-r` pronouns to the first mention, with the sentence it was met in. */
  private referent(term: Term | undefined, word: LexWord): Json {
    if (term?.kind === "pronoun" && term.word.ending === "r" && term.bind?.antecedent && term.antecedent && !term.bind.antecedents) {
      return this.referent(term.antecedent, term.bind.antecedent);
    }
    return { sentence: this.sentenceOf.get(word) ?? null, term: term ? this.term(term) : raw(word) };
  }
}

/** Where the statement act sits against a whole-clause frame, from the pair table (interpreter.md#pair-table). */
function actOrder(frame: Frame): "over" | "under" | "unsettled" | undefined {
  const row = pairRow("force", frame.family);
  // No row: the decided rule, text order; the act word is on the turn's left edge, so it is earlier.
  if (!row) return "over";
  const found = row.cases.find((c) => !c.when || Object.entries(c.when).some(([family, members]) => frame.family === family && frame.member !== undefined && (members as string[]).includes(frame.member)));
  if (!found || found.order === "commutes") return undefined;
  if (found.order === "unsettled") return "unsettled";
  if (found.order === "over") return found.over === "force" ? "over" : "under";
  return "over";
}

function actKind(frame: Frame): string {
  return pairRow("force", frame.family)?.kind === "wordShape" ? "wordShape" : "rule";
}
