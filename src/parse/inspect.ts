import { classify, markMentions, type ClassifyTables } from "./classify.js";
import { morphGlossBrackets, senseLabel } from "./morph-gloss.js";
import type { WordBrackets } from "./gloss-structure.js";
import { visitResult, type Visitor } from "./ast-walk.js";
import { parseWithTables } from "./parse-core.js";
import { SentenceParseError } from "./sentence-parser.js";
import type {
  AnaphorBind,
  Ending,
  LexWord,
  MorphWordFamily,
  ParseResult,
  PunctKind,
  SharedRecord,
  SharedRole,
} from "./types.js";
import { scanChunks } from "./span-scan.js";
import { parseWord, WordParseError } from "./word.js";

export type InspectError = {
  message: string;
  expected?: string;
};

export type InspectWhy = {
  line: string;
  href: string;
};

export type InspectRelated = {
  label: string;
  raw: string;
  tokenIndex: number;
};

export type InspectConstruction = {
  kind: "join" | "island";
  label: string;
  tokenIndices: number[];
  triggerIndices: number[];
};

export type InspectWordToken = {
  kind: "word";
  raw: string;
  start: number;
  end: number;
  word: LexWord;
  gloss: string;
  chips: string[];
  /** Morph-gloss phrase brackets opening before / closing after this word. */
  brackets?: WordBrackets;
  why?: InspectWhy;
  related?: InspectRelated[];
};

export type InspectErrorToken = {
  kind: "error";
  raw: string;
  start: number;
  end: number;
  error: InspectError;
};

export type InspectPunctToken = {
  kind: "punct";
  raw: string;
  start: number;
  end: number;
  punct: PunctKind;
};

export type InspectIslandToken = {
  kind: "island";
  raw: "{" | "}";
  start: number;
  end: number;
};

export type InspectToken =
  | InspectWordToken
  | InspectErrorToken
  | InspectPunctToken
  | InspectIslandToken;

export type InspectResult = {
  tokens: InspectToken[];
  constructions: InspectConstruction[];
  sentenceWarning?: string;
};

const PUNCT: Record<string, PunctKind> = {
  ".": "period",
  "?": "qmark",
  "!": "bang",
};

const ENDING_SENSE: Record<Ending, string> = {
  l: "exact",
  m: "abstract",
  n: "named",
  r: "anaphor",
  rl: "stand-in",
  rm: "stand-in.open",
  rn: "stand-in lexicalized",
  rth: "stand-in backward",
};

const JOIN_ENDING_SENSE: Record<Ending, string> = {
  l: "closed",
  m: "open",
  n: "named",
  r: "unspecified member",
  rl: "stand-in locked",
  rm: "stand-in open",
  rn: "stand-in lexicalized",
  rth: "stand-in backward",
};

const GREETING_BID_GLOSS: Record<"a" | "e" | "o" | "u", string> = {
  a: "presence",
  o: "one ask",
  e: "a few minutes",
  u: "passing",
};

export function endingSense(ending: Ending | undefined, word?: LexWord): string | undefined {
  if (!ending) return undefined;
  if (word?.reading === "standInNamed") return "stand-in lexicalized";
  if (word?.reading === "standInBack") return "stand-in backward";
  if (word?.reading === "standIn") {
    if (ending === "rl") return "stand-in locked";
    if (ending === "rm") return "stand-in open";
    return ending;
  }
  if (word?.reading === "join") return JOIN_ENDING_SENSE[ending];
  if (word?.reading === "number") {
    const number: Record<Ending, string> = {
      l: "exact",
      m: "fuzzy",
      n: "named",
      r: "resume",
      rl: "stand-in",
      rm: "stand-in.open",
      rn: "stand-in lexicalized",
      rth: "stand-in backward",
    };
    return number[ending];
  }
  if (word?.reading === "ordinary" || word?.reading === "unknown") {
    const content: Record<Ending, string> = {
      l: "concrete",
      m: "abstract",
      n: "named",
      r: "anaphor",
      rl: "stand-in",
      rm: "stand-in.open",
      rn: "stand-in lexicalized",
      rth: "stand-in backward",
    };
    return content[ending];
  }
  return ENDING_SENSE[ending];
}

function formatExpectation(item: { type: string; text?: string; description?: string }): string {
  if (item.type === "literal" && item.text) return `"${item.text}"`;
  if (item.type === "other" && item.description) return item.description;
  if (item.type === "end") return "end of word";
  if (item.type === "any") return "any character";
  return item.type;
}

export function inspectErrorFrom(error: unknown): InspectError {
  if (error instanceof WordParseError) {
    const expected = error.peggyError.expected
      ?.slice(0, 8)
      .map((item) => formatExpectation(item))
      .filter(Boolean);
    const unique = [...new Set(expected)];
    return {
      message: error.message,
      expected: unique.length > 0 ? unique.join(", ") : undefined,
    };
  }
  if (error instanceof Error) return { message: error.message };
  return { message: String(error) };
}

export function glossFor(word: LexWord, tables?: ClassifyTables): string {
  if (word.reading === "unknown" && !word.overlay) {
    if (word.potentialCompounds?.length) {
      return `unknown root (maybe ${word.potentialCompounds.map((c) => c.gloss).join(" / ")})`;
    }
    return "unknown root";
  }
  if (!tables) {
    return senseLabelFallback(word);
  }
  return senseLabel(word, tables);
}

function senseLabelFallback(word: LexWord): string {
  if (word.overlay) return word.overlay.gloss;
  if (word.reading === "greeting") {
    const family = word.family;
    if (family.kind === "x" && family.stanceVowel) {
      return GREETING_BID_GLOSS[family.stanceVowel];
    }
    return "greeting";
  }
  if (word.reading === "number") return "number";
  if (word.reading === "join") return word.rootGloss?.concrete ?? "join";
  if (word.ending === "m") {
    return word.rootGloss?.abstract ?? word.rootGloss?.concrete ?? word.reading;
  }
  if (word.ending === "n") {
    if (word.family.kind === "foreign") return word.family.payload;
    if (word.family.kind === "writingSpan") return word.family.payload || "proper";
    return word.rootGloss?.concrete ?? "proper";
  }
  if (word.ending === "r") return "anaphor";
  return word.rootGloss?.concrete ?? word.rootGloss?.abstract ?? word.reading;
}

function familyChips(family: MorphWordFamily): string[] {
  switch (family.kind) {
    case "content": {
      const chips = family.roots.map((root) => `stem ${root}`);
      return chips;
    }
    case "number": {
      const chips = [`number ${family.stem.marker}`];
      if (family.writingEndingMark) chips.push(`mark ${family.writingEndingMark}`);
      if (family.stem.digitlessExp) chips.push(`exp ${family.stem.digitlessExp}`);
      return chips;
    }
    case "x": {
      const chips = [`x ${family.xFamily}`];
      if (family.leftRoots.length) chips.push(`host ${family.leftRoots.join("+")}`);
      if (family.rightRoots?.length) chips.push(`right ${family.rightRoots.join("+")}`);
      if (family.roleVowel) chips.push(`role ${family.roleVowel}`);
      if (family.stanceVowel) chips.push(`stance ${family.stanceVowel}`);
      if (family.numberStem) chips.push(`num ${family.numberStem.marker}`);
      return chips;
    }
    case "hook":
      return [`hook ${family.form}`];
    case "hookCompound":
      return [`hook-compound ${family.hook}`, `stem ${family.leftRoot}`];
    case "joinMarker":
      return [`join ${family.series}`];
    case "writingSpan": {
      const marks = family.marks.length ? family.marks.join("") : "";
      return [`writing ${family.bracket}${marks}`];
    }
    case "foreign":
      return ["foreign", family.payload];
    default:
      return [];
  }
}

export function chipsFor(word: LexWord): string[] {
  const chips: string[] = [];
  if (word.pos) chips.push(`/${word.pos}/`);
  if (word.ending) chips.push(`-${word.ending} ${endingSense(word.ending, word)}`);
  if (word.gl) chips.push("gl-");
  if (word.plural) chips.push("-x");
  if ((word.reading === "standIn" || word.reading === "standInNamed" || word.reading === "standInBack") && word.family.kind === "joinMarker") {
    chips.push(`stand-in ${word.family.series}`);
  } else {
    chips.push(...familyChips(word.family));
  }
  if (word.hookCompound) chips.push(`hook ${word.hookCompound.hook}`);
  if (word.potentialCompounds?.length) chips.push("potential compound");
  chips.push(word.reading);
  return chips;
}

export function morphDetails(word: LexWord): { label: string; value: string }[] {
  const rows: { label: string; value: string }[] = [
    { label: "surface", value: word.raw },
    { label: "reading", value: word.reading },
  ];
  if (word.pos) rows.push({ label: "PoS", value: word.pos });
  if (word.ending) {
    rows.push({ label: "ending", value: `-${word.ending} (${endingSense(word.ending, word)})` });
  }
  if (word.gl) rows.push({ label: "bound", value: "gl-" });
  if (word.plural) rows.push({ label: "plural", value: "-x associative" });
  rows.push({ label: "family", value: word.family.kind });

  const family = word.family;
  if (family.kind === "content") {
    rows.push({ label: "roots", value: family.roots.join(" · ") });
  }
  if (word.hookCompound) {
    rows.push({ label: "hook compound", value: word.hookCompound.stem });
    rows.push({ label: "fused hook", value: word.hookCompound.hook });
  }
  for (const candidate of word.potentialCompounds ?? []) {
    rows.push({
      label: "potential compound",
      value: `${candidate.left} · ${candidate.join} · ${candidate.right} (${candidate.gloss})`,
    });
  }
  if (family.kind === "x") {
    rows.push({ label: "x family", value: family.xFamily });
    if (family.leftRoots.length) rows.push({ label: "host", value: family.leftRoots.join(" · ") });
    if (family.rightRoots?.length) {
      rows.push({ label: "right", value: family.rightRoots.join(" · ") });
    }
    if (family.roleVowel) rows.push({ label: "role vowel", value: family.roleVowel });
    if (family.stanceVowel) rows.push({ label: "stance", value: family.stanceVowel });
  } else if (family.kind === "number") {
    rows.push({ label: "marker", value: String(family.stem.marker) });
    if (family.stem.digitlessExp) rows.push({ label: "exponent", value: family.stem.digitlessExp });
  } else if (family.kind === "hook") {
    rows.push({ label: "form", value: family.form });
  } else if (family.kind === "hookCompound") {
    rows.push({ label: "left", value: family.leftRoot + family.leftEnding });
    rows.push({ label: "fused hook", value: family.hook });
  } else if (family.kind === "joinMarker") {
    rows.push({
      label: word.reading === "standIn" || word.reading === "standInNamed" ? "stand-in" : "series",
      value: family.series,
    });
  } else if (family.kind === "foreign") {
    rows.push({ label: "foreign", value: family.payload });
  } else if (family.kind === "writingSpan") {
    rows.push({ label: "payload", value: family.payload });
  }

  if (word.overlay) {
    rows.push({ label: "overlay", value: `${word.overlay.senseForm} + ${word.overlay.pos}` });
    rows.push({ label: "kind", value: word.overlay.kind });
    rows.push({ label: "gloss", value: word.overlay.gloss });
    rows.push({ label: "definition", value: word.overlay.definition });
  }
  if (word.rootGloss?.concrete) rows.push({ label: "concrete", value: word.rootGloss.concrete });
  if (word.rootGloss?.abstract) {
    rows.push({ label: "abstract", value: word.rootGloss.abstract });
  }

  return rows;
}

export function whyFor(word: LexWord, sharedRole?: SharedRole): InspectWhy {
  const family = word.family;

  if (family.kind === "x" && family.xFamily === "sake") {
    return { line: "sakes (sake + th)", href: "sakes.html" };
  }
  if (family.kind === "x" && family.xFamily === "lateral" && family.landmark) {
    return { line: "landmark lateral (the /b/ landmark's own facing)", href: "roles.html#landmark-facing" };
  }
  if (family.kind === "x" && family.xFamily === "holder") {
    return { line: "holder (whose view the clause reports)", href: "knowing.html#holder" };
  }
  if (family.kind === "x" && family.xFamily === "lateral") {
    return { line: "viewpoint lateral", href: "roles.html#viewpoint-laterals" };
  }
  if (family.kind === "x" && family.xFamily === "ability") {
    if (word.reading === "greeting") {
      return { line: "greeting bid, not ability", href: "x-compounds.html#conversation-length" };
    }
    return { line: "ability, not sakes", href: "intention.html#ability" };
  }
  if (family.kind === "x" && family.xFamily === "role") {
    return { line: "role compound", href: "roles.html#role-compounds" };
  }
  if (family.kind === "x" && (family.xFamily === "pointer" || family.pointerVowel)) {
    return { line: "role pointer", href: "pronouns.html#role-pointers" };
  }
  if (family.kind === "writingSpan") {
    return { line: "span fence", href: "spans.html" };
  }
  if (family.kind === "x" && family.xFamily === "numeric") {
    return { line: "numeric derivation", href: "numeric-derivation.html#numeric-derivation" };
  }
  if (word.hookCompound) {
    return { line: "hook compound", href: "hooks.html#hook-compounds" };
  }
  if (word.lexicalCompound) {
    return { line: "lexical compound", href: "x-compounds.html#lexical-compounds" };
  }
  if (word.potentialCompounds?.length) {
    return { line: "lexical compound (unlisted)", href: "x-compounds.html#lexical-compounds" };
  }
  if (family.kind === "x" && family.xFamily === "compound") {
    return { line: "ordinary compound", href: "x-compounds.html#families-by-shape" };
  }
  if (family.kind === "x") {
    return { line: "mid-word x family", href: "x-compounds.html#families-by-shape" };
  }
  if (family.kind === "joinMarker") {
    if (sharedRole === "scale" || sharedRole === "equative") {
      return { line: `rank join ${family.series}`, href: "comparatives.html" };
    }
    return { line: `join ${family.series}`, href: "joins.html" };
  }
  if (family.kind === "hook") {
    return { line: "hook", href: "hooks.html" };
  }
  if (family.kind === "number" || word.reading === "number") {
    return { line: "number stem", href: "numbers.html" };
  }
  if (word.reading === "overlay") {
    const kind = word.overlay?.kind;
    if (kind === "locative") return { line: "locative relation", href: "relations.html#locative-relations" };
    if (kind === "of_relation") return { line: "of relation", href: "relations.html#of-relations" };
    if (kind === "similative") return { line: "simile", href: "relations.html#similative" };
    if (kind === "exchange") return { line: "exchange", href: "relations.html#exchange" };
    if (kind === "proxy") return { line: "proxy", href: "relations.html#proxy" };
    if (kind === "stimulus") return { line: "sake stimulus", href: "sakes.html#stimulus" };
    if (kind === "plan" || kind === "predict" || kind === "decision" || kind === "attempt" || kind === "want") {
      return { line: "closed mood", href: "intention.html" };
    }
    return { line: "closed mood", href: "knowing.html" };
  }
  if (word.reading === "joinAct" || word.reading === "joinRelation") {
    return { line: "join-series form", href: "join-across-roles.html" };
  }
  if (word.ending === "r" && word.reading !== "sake" && word.reading !== "ability" && word.reading !== "greeting") {
    return { line: "anaphor", href: "pronouns.html" };
  }
  if (word.plural) {
    return { line: "associative plural", href: "plurality.html#associative" };
  }

  return { line: "word form", href: "clause.html" };
}

type Cursor = {
  tokens: InspectToken[];
  used: boolean[];
  /** Word position (`LexWord.at`) to token index. */
  byAt: Map<number, number>;
};

function makeCursor(tokens: InspectToken[]): Cursor {
  const byAt = new Map<number, number>();
  tokens.forEach((token, i) => {
    if (token.kind === "word" && token.word.at !== undefined) byAt.set(token.word.at, i);
  });
  return { tokens, used: tokens.map(() => false), byAt };
}

function takeWord(cursor: Cursor, word: LexWord): number | undefined {
  if (word.at === undefined) return undefined;
  const i = cursor.byAt.get(word.at);
  if (i === undefined || cursor.used[i]) return undefined;
  cursor.used[i] = true;
  return i;
}

function takeCaret(cursor: Cursor): number | undefined {
  for (let i = 0; i < cursor.tokens.length; i++) {
    if (cursor.used[i]) continue;
    if (cursor.tokens[i]!.kind === "island") {
      cursor.used[i] = true;
      return i;
    }
  }
  return undefined;
}

function pushIndex(into: number[], index: number | undefined) {
  if (index !== undefined) into.push(index);
}

function joinLabel(joins: LexWord[], shared: Map<string, SharedRole>): string {
  const first = joins[0];
  const series = first?.family.kind === "joinMarker" ? first.family.series : "join";
  const role = first ? shared.get(first.raw) : undefined;
  if (role === "scale") return `rank join ${series}`;
  if (role === "equative") return `equative join ${series}`;
  if (role === "distribute") return `distribute join ${series}`;
  return `join ${series}`;
}

type ConstructionFrame = { indices: number[]; triggers: number[]; joins: LexWord[]; open?: number; close?: number };

/** Join / span / island constructions as a handler set over the AST walk ([ast-walk.ts](./ast-walk.ts)). */
function constructionVisitor(
  cursor: Cursor,
  constructions: InspectConstruction[],
  sharedRoles: Map<string, SharedRole>,
): Visitor {
  const newFrame = (): ConstructionFrame => ({ indices: [], triggers: [], joins: [] });
  const stack: ConstructionFrame[] = [newFrame()];
  const top = () => stack[stack.length - 1]!;
  const close = (): ConstructionFrame => {
    const frame = stack.pop()!;
    top().indices.push(...frame.indices);
    return frame;
  };
  return {
    word(word, slot) {
      const idx = takeWord(cursor, word);
      pushIndex(top().indices, idx);
    },
    join(join) {
      const idx = takeWord(cursor, join);
      pushIndex(top().indices, idx);
      pushIndex(top().triggers, idx);
      top().joins.push(join);
    },
    enter(node) {
      if (node.kind === "np" || node.kind === "g" || node.kind === "vp" || node.kind === "clauseCoord") {
        stack.push(newFrame());
      }
      if (node.kind === "island") {
        stack.push(newFrame());
        const start = takeCaret(cursor);
        pushIndex(top().indices, start);
        top().open = start;
      }
    },
    exit(node) {
      if (node.kind === "np" || node.kind === "g" || node.kind === "vp" || node.kind === "clauseCoord") {
        const frame = close();
        if (frame.triggers.length > 0) {
          constructions.push({
            kind: "join",
            label: joinLabel(frame.joins, sharedRoles),
            tokenIndices: frame.indices,
            triggerIndices: frame.triggers,
          });
        }
      } else if (node.kind === "island") {
        const end = takeCaret(cursor);
        pushIndex(top().indices, end);
        top().close = end;
        const frame = close();
        constructions.push({
          kind: "island",
          label: "adjunct island",
          tokenIndices: frame.indices,
          triggerIndices: [frame.open, frame.close].filter((i): i is number => i !== undefined),
        });
      }
    },
  };
}

function findWordIndex(tokens: InspectToken[], word: LexWord): number | undefined {
  if (word.at === undefined) return undefined;
  const i = tokens.findIndex((token) => token.kind === "word" && token.word.at === word.at);
  return i < 0 ? undefined : i;
}

function addRelated(token: InspectWordToken, item: InspectRelated) {
  token.related ??= [];
  if (token.related.some((rel) => rel.tokenIndex === item.tokenIndex && rel.label === item.label)) {
    return;
  }
  token.related.push(item);
}

function attachRelated(
  tokens: InspectToken[],
  constructions: InspectConstruction[],
  anaphors: AnaphorBind[],
) {
  for (const bind of anaphors) {
    const pronounIdx = findWordIndex(tokens, bind.pronoun);
    if (pronounIdx === undefined) continue;
    const token = tokens[pronounIdx];
    if (token?.kind !== "word") continue;
    if (!bind.antecedent) {
      addRelated(token, { label: "no prior match", raw: "—", tokenIndex: pronounIdx });
      continue;
    }
    const antIdx = findWordIndex(tokens, bind.antecedent);
    if (antIdx === undefined) continue;
    addRelated(token, { label: "antecedent", raw: bind.antecedent.raw, tokenIndex: antIdx });
    const ant = tokens[antIdx];
    if (ant?.kind === "word") {
      addRelated(ant, { label: "anaphor", raw: bind.pronoun.raw, tokenIndex: pronounIdx });
    }
  }

  for (const group of constructions) {
    if (group.kind === "join") {
      for (const idx of group.tokenIndices) {
        const token = tokens[idx];
        if (token?.kind !== "word") continue;
        for (const other of group.tokenIndices) {
          if (other === idx) continue;
          const mate = tokens[other];
          if (!mate) continue;
          addRelated(token, { label: "join mate", raw: mate.raw, tokenIndex: other });
        }
      }
    }
  }
}

function attachWhy(tokens: InspectToken[], sharedRecords: SharedRecord[]) {
  const roleByRaw = new Map<string, SharedRole>();
  for (const rec of sharedRecords) roleByRaw.set(rec.join.raw, rec.role);

  for (const token of tokens) {
    if (token.kind !== "word") continue;
    const role =
      token.word.family.kind === "joinMarker" ? roleByRaw.get(token.word.raw) : undefined;
    token.why = whyFor(token.word, role);
  }
}

function constructionsFromParse(
  tokens: InspectToken[],
  parsed: ParseResult,
): InspectConstruction[] {
  const constructions: InspectConstruction[] = [];
  const sharedRoles = new Map<string, SharedRole>();
  for (const rec of parsed.resolve?.shared ?? []) sharedRoles.set(rec.join.raw, rec.role);
  visitResult(parsed, constructionVisitor(makeCursor(tokens), constructions, sharedRoles));
  return constructions;
}

/** Per-word inspect stream. Sentence AST is optional; word cards do not require it. */
export function inspectText(text: string, tables: ClassifyTables): InspectResult {
  const tokens: InspectToken[] = [];
  let allWordsOk = true;
  let wordCount = 0;

  for (const { text: chunk, start: chunkStart } of scanChunks(text)) {

    if (chunk === "{" || chunk === "}") {
      tokens.push({ kind: "island", raw: chunk, start: chunkStart, end: chunkStart + 1 });
      continue;
    }

    const last = chunk.slice(-1);
    const punct = PUNCT[last];
    const wordText = punct ? chunk.slice(0, -1) : chunk;

    if (wordText) {
      const start = chunkStart;
      const end = chunkStart + wordText.length;
      try {
        const word = { ...classify(parseWord(wordText), tables), at: wordCount };
        wordCount += 1;
        tokens.push({
          kind: "word",
          raw: word.raw,
          start,
          end,
          word,
          gloss: glossFor(word, tables),
          chips: chipsFor(word),
        });
      } catch (error) {
        allWordsOk = false;
        tokens.push({
          kind: "error",
          raw: wordText,
          start,
          end,
          error: inspectErrorFrom(error),
        });
      }
    }

    if (punct) {
      const start = chunkStart + wordText.length;
      tokens.push({
        kind: "punct",
        raw: last,
        start,
        end: start + 1,
        punct,
      });
    }
  }

  const wordTokens = tokens.filter((token): token is InspectWordToken => token.kind === "word");
  const marked = markMentions(wordTokens.map((token) => token.word), tables);
  wordTokens.forEach((token, i) => {
    if (marked[i] === token.word) return;
    token.word = marked[i]!;
    token.gloss = glossFor(token.word, tables);
    token.chips = chipsFor(token.word);
  });

  attachWhy(tokens, []);
  if (allWordsOk) attachBrackets(tokens, text, tables);

  if (!allWordsOk || !tokens.some((token) => token.kind === "word")) {
    return { tokens, constructions: [] };
  }

  try {
    const parsed = parseWithTables(text, tables);
    const constructions = constructionsFromParse(tokens, parsed);
    attachRelated(tokens, constructions, parsed.resolve?.anaphors ?? []);
    attachWhy(tokens, parsed.resolve?.shared ?? []);
    return { tokens, constructions };
  } catch (error) {
    const sentenceWarning =
      error instanceof SentenceParseError
        ? error.message
        : error instanceof Error
          ? error.message
          : String(error);
    return { tokens, constructions: [], sentenceWarning };
  }
}

/** Phrase brackets per word token, in surface order (glosses.md § Phrase brackets). */
function attachBrackets(tokens: InspectToken[], text: string, tables: ClassifyTables): void {
  let brackets: WordBrackets[];
  try {
    brackets = morphGlossBrackets(text, tables);
  } catch {
    return;
  }
  let k = 0;
  for (const token of tokens) {
    if (token.kind !== "word") continue;
    const marks = brackets[k++];
    if (marks && (marks.open.length || marks.close.length)) token.brackets = marks;
  }
}
