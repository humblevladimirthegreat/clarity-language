import { classify, type ClassifyTables } from "./classify.js";
import { parseWithTables } from "./parse-core.js";
import { SentenceParseError } from "./sentence-parser.js";
import type {
  AnaphorBind,
  Clause,
  CoordShared,
  Ending,
  GPackage,
  IslandUnit,
  LexWord,
  MorphWordFamily,
  NpCoord,
  NpItem,
  ParseResult,
  PunctKind,
  SharedRecord,
  SharedRole,
  SpanUnit,
  Unit,
  Utterance,
  VpCoord,
} from "./types.js";
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
  kind: "join" | "span" | "island";
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
  raw: "^";
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
  m: "metaphorical",
  n: "named",
  r: "anaphor",
};

const JOIN_ENDING_SENSE: Record<Ending, string> = {
  l: "closed",
  m: "open",
  n: "named",
  r: "unspecified member",
};

export function endingSense(ending: Ending | undefined, word?: LexWord): string | undefined {
  if (!ending) return undefined;
  if (word?.reading === "join") return JOIN_ENDING_SENSE[ending];
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

export function glossFor(word: LexWord): string {
  if (word.overlay?.definition) return word.overlay.definition;

  if (word.reading === "unknown") return "unknown root";
  if (word.reading === "number") return "number";
  if (word.reading === "join") {
    return word.rootGloss?.literal ?? "join";
  }

  if (word.ending === "m") {
    return word.rootGloss?.metaphorical ?? word.rootGloss?.literal ?? word.reading;
  }
  if (word.ending === "n") {
    if (word.family.kind === "foreign") return word.family.payload;
    if (word.family.kind === "writingSpan") return word.family.payload || "proper";
    return word.rootGloss?.literal ?? "proper";
  }
  if (word.ending === "r") return "anaphor";

  return word.rootGloss?.literal ?? word.rootGloss?.metaphorical ?? word.reading;
}

function familyChips(family: MorphWordFamily): string[] {
  switch (family.kind) {
    case "content":
      return family.roots.map((root) => `stem ${root}`);
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
      if (family.typeVowel) chips.push(`type ${family.typeVowel}`);
      if (family.edgeVowel) chips.push(`edge ${family.edgeVowel}`);
      if (family.numberStem) chips.push(`num ${family.numberStem.marker}`);
      return chips;
    }
    case "spanClose":
      return [`span close ${family.flavor}`];
    case "reviser":
      return [`reviser ${family.form}`];
    case "joinMarker":
      return [`join ${family.series}`];
    case "writingSpan": {
      const marks = family.marks.length ? family.marks.join("") : "";
      return [`writing ${family.bracket}${marks}${family.anaphor ? "=" : ""}`];
    }
    case "foreign":
      return [family.opaque ? "opaque" : "foreign", family.payload];
    default:
      return [];
  }
}

export function chipsFor(word: LexWord): string[] {
  const chips: string[] = [];
  if (word.pos) chips.push(`/${word.pos}/`);
  if (word.ending) chips.push(`-${word.ending} ${endingSense(word.ending, word)}`);
  if (word.gl) chips.push("gl-");
  if (word.plural) chips.push("-sh");
  chips.push(...familyChips(word.family));
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
  if (word.plural) rows.push({ label: "plural", value: "-sh associative" });
  rows.push({ label: "family", value: word.family.kind });

  const family = word.family;
  if (family.kind === "content") {
    rows.push({ label: "roots", value: family.roots.join(" · ") });
  } else if (family.kind === "x") {
    rows.push({ label: "x family", value: family.xFamily });
    if (family.leftRoots.length) rows.push({ label: "host", value: family.leftRoots.join(" · ") });
    if (family.rightRoots?.length) {
      rows.push({ label: "right", value: family.rightRoots.join(" · ") });
    }
    if (family.roleVowel) rows.push({ label: "role vowel", value: family.roleVowel });
    if (family.stanceVowel) rows.push({ label: "stance", value: family.stanceVowel });
    if (family.typeVowel) rows.push({ label: "span type", value: family.typeVowel });
    if (family.edgeVowel) rows.push({ label: "span edge", value: family.edgeVowel });
  } else if (family.kind === "number") {
    rows.push({ label: "marker", value: String(family.stem.marker) });
    if (family.stem.digitlessExp) rows.push({ label: "exponent", value: family.stem.digitlessExp });
  } else if (family.kind === "reviser") {
    rows.push({ label: "form", value: family.form });
  } else if (family.kind === "joinMarker") {
    rows.push({ label: "series", value: family.series });
  } else if (family.kind === "spanClose") {
    rows.push({ label: "close", value: family.flavor });
  } else if (family.kind === "foreign") {
    rows.push({ label: family.opaque ? "opaque" : "foreign", value: family.payload });
  } else if (family.kind === "writingSpan") {
    rows.push({ label: "payload", value: family.payload });
  }

  if (word.overlay) {
    rows.push({ label: "overlay", value: `${word.overlay.senseForm} + ${word.overlay.pos}` });
    rows.push({ label: "definition", value: word.overlay.definition });
  }
  if (word.rootGloss?.literal) rows.push({ label: "literal", value: word.rootGloss.literal });
  if (word.rootGloss?.metaphorical) {
    rows.push({ label: "metaphorical", value: word.rootGloss.metaphorical });
  }

  return rows;
}

export function whyFor(word: LexWord, sharedRole?: SharedRole): InspectWhy {
  const family = word.family;

  if (family.kind === "x" && family.xFamily === "valueAbility") {
    if (word.reading === "value") {
      return { line: "values, not role", href: "values.html" };
    }
    return { line: "ability, not values", href: "ability.html#ability" };
  }
  if (family.kind === "x" && family.xFamily === "role") {
    return { line: "role compound", href: "roles.html#role-compounds" };
  }
  if (family.kind === "spanClose" || (family.kind === "x" && family.xFamily === "span")) {
    return { line: "span fence", href: "spans.html" };
  }
  if (family.kind === "x" && family.xFamily === "numeric") {
    return { line: "numeric derivation", href: "numeric-derivation.html#numeric-derivation" };
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
    if (sharedRole === "continuum") {
      return { line: `continuum join ${family.series}`, href: "numbers.html#ranges" };
    }
    return { line: `join ${family.series}`, href: "coordination.html" };
  }
  if (family.kind === "reviser") {
    return { line: "reviser", href: "revisers.html" };
  }
  if (family.kind === "number" || word.reading === "number") {
    return { line: "number stem", href: "numbers.html" };
  }
  if (word.reading === "mood") {
    return { line: "closed mood", href: "commentary.html" };
  }
  if (word.reading === "joinAct" || word.reading === "joinRelation") {
    return { line: "join extra", href: "join-extras.html" };
  }
  if (word.ending === "r" && word.reading !== "value" && word.reading !== "ability") {
    return { line: "anaphor", href: "pronouns.html" };
  }
  if (word.plural) {
    return { line: "associative plural", href: "plurality.html#associative" };
  }

  return { line: "word form", href: "core.html" };
}

type Cursor = {
  tokens: InspectToken[];
  used: boolean[];
};

function takeRaw(cursor: Cursor, raw: string): number | undefined {
  for (let i = 0; i < cursor.tokens.length; i++) {
    if (cursor.used[i]) continue;
    const token = cursor.tokens[i]!;
    if (token.kind === "punct") continue;
    if (token.raw === raw) {
      cursor.used[i] = true;
      return i;
    }
  }
  return undefined;
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
  if (role === "continuum") return `continuum join ${series}`;
  if (role === "distribute") return `distribute join ${series}`;
  return `join ${series}`;
}

function walkGPackage(cursor: Cursor, pack: GPackage, into: number[]) {
  pushIndex(into, takeRaw(cursor, pack.word.raw));
  if (pack.bound) pushIndex(into, takeRaw(cursor, pack.bound.raw));
  for (const mod of pack.modifiers) pushIndex(into, takeRaw(cursor, mod.raw));
}

function walkShared(cursor: Cursor, shared: CoordShared[], into: number[]) {
  for (const item of shared) {
    if ("word" in item && "modifiers" in item) walkGPackage(cursor, item, into);
    else pushIndex(into, takeRaw(cursor, item.raw));
  }
}

function walkNpItem(cursor: Cursor, item: NpItem, constructions: InspectConstruction[], into: number[]) {
  if (item.kind === "package") {
    const pack = item.package;
    if (pack.glAdj) walkGPackage(cursor, pack.glAdj, into);
    pushIndex(into, takeRaw(cursor, pack.head.raw));
    for (const adj of pack.adjs) walkGPackage(cursor, adj, into);
    return;
  }
  walkIsland(cursor, item.island, constructions, into);
}

function walkNp(
  cursor: Cursor,
  coord: NpCoord,
  constructions: InspectConstruction[],
  sharedRoles: Map<string, SharedRole>,
  into: number[],
) {
  const indices: number[] = [];
  const triggers: number[] = [];
  const joins: LexWord[] = [];
  for (const part of coord.parts) {
    for (const item of part.items) walkNpItem(cursor, item, constructions, indices);
    if (part.join) {
      const idx = takeRaw(cursor, part.join.raw);
      pushIndex(indices, idx);
      pushIndex(triggers, idx);
      joins.push(part.join);
    }
    walkShared(cursor, part.shared, indices);
  }
  if (triggers.length > 0) {
    constructions.push({
      kind: "join",
      label: joinLabel(joins, sharedRoles),
      tokenIndices: indices,
      triggerIndices: triggers,
    });
  }
  into.push(...indices);
}

function walkVp(
  cursor: Cursor,
  coord: VpCoord,
  constructions: InspectConstruction[],
  sharedRoles: Map<string, SharedRole>,
  into: number[],
) {
  const indices: number[] = [];
  const triggers: number[] = [];
  const joins: LexWord[] = [];
  for (const part of coord.parts) {
    for (const item of part.items) pushIndex(indices, takeRaw(cursor, item.raw));
    if (part.join) {
      const idx = takeRaw(cursor, part.join.raw);
      pushIndex(indices, idx);
      pushIndex(triggers, idx);
      joins.push(part.join);
    }
    walkShared(cursor, part.shared, indices);
  }
  if (triggers.length > 0) {
    constructions.push({
      kind: "join",
      label: joinLabel(joins, sharedRoles),
      tokenIndices: indices,
      triggerIndices: triggers,
    });
  }
  into.push(...indices);
}

function walkSpan(
  cursor: Cursor,
  span: SpanUnit,
  constructions: InspectConstruction[],
  sharedRoles: Map<string, SharedRole>,
  into: number[],
) {
  const indices: number[] = [];
  const open = takeRaw(cursor, span.open.raw);
  pushIndex(indices, open);
  for (const clause of span.content) walkClause(cursor, clause, constructions, sharedRoles, indices);
  const close = takeRaw(cursor, span.close.raw);
  pushIndex(indices, close);
  constructions.push({
    kind: "span",
    label: "span fence",
    tokenIndices: indices,
    triggerIndices: [open, close].filter((i): i is number => i !== undefined),
  });
  into.push(...indices);
}

function walkIsland(
  cursor: Cursor,
  island: IslandUnit,
  constructions: InspectConstruction[],
  into: number[],
  sharedRoles: Map<string, SharedRole> = new Map(),
) {
  const indices: number[] = [];
  const start = takeCaret(cursor);
  pushIndex(indices, start);
  for (const unit of island.units) walkUnit(cursor, unit, constructions, sharedRoles, indices);
  const end = takeCaret(cursor);
  pushIndex(indices, end);
  constructions.push({
    kind: "island",
    label: "adjunct island",
    tokenIndices: indices,
    triggerIndices: [start, end].filter((i): i is number => i !== undefined),
  });
  into.push(...indices);
}

function walkUnit(
  cursor: Cursor,
  unit: Unit,
  constructions: InspectConstruction[],
  sharedRoles: Map<string, SharedRole>,
  into: number[],
) {
  switch (unit.kind) {
    case "np":
      walkNp(cursor, unit.coord, constructions, sharedRoles, into);
      break;
    case "vp":
      walkVp(cursor, unit.coord, constructions, sharedRoles, into);
      break;
    case "predicate":
      walkGPackage(cursor, unit.adj, into);
      break;
    case "h":
      pushIndex(into, takeRaw(cursor, unit.unit.word.raw));
      if (unit.unit.bound) pushIndex(into, takeRaw(cursor, unit.unit.bound.raw));
      break;
    case "linker":
    case "reviser":
    case "writingSpan":
      pushIndex(into, takeRaw(cursor, unit.word.raw));
      break;
    case "span":
      walkSpan(cursor, unit.span, constructions, sharedRoles, into);
      break;
    case "island":
      walkIsland(cursor, unit.island, constructions, into, sharedRoles);
      break;
    case "clauseCoord": {
      const indices: number[] = [];
      const triggers: number[] = [];
      const joins: LexWord[] = [];
      for (const part of unit.coord.parts) {
        for (const clause of part.clauses) {
          walkClause(cursor, clause, constructions, sharedRoles, indices);
        }
        const idx = takeRaw(cursor, part.join.raw);
        pushIndex(indices, idx);
        pushIndex(triggers, idx);
        joins.push(part.join);
      }
      if (triggers.length > 0) {
        constructions.push({
          kind: "join",
          label: joinLabel(joins, sharedRoles),
          tokenIndices: indices,
          triggerIndices: triggers,
        });
      }
      into.push(...indices);
      break;
    }
    default:
      break;
  }
}

function walkClause(
  cursor: Cursor,
  clause: Clause,
  constructions: InspectConstruction[],
  sharedRoles: Map<string, SharedRole>,
  into: number[],
) {
  for (const unit of clause.units) walkUnit(cursor, unit, constructions, sharedRoles, into);
  if (clause.dependent) {
    pushIndex(into, takeRaw(cursor, clause.dependent.odo.raw));
    walkClause(cursor, clause.dependent.clause, constructions, sharedRoles, into);
  }
}

function walkUtterance(
  cursor: Cursor,
  utterance: Utterance,
  constructions: InspectConstruction[],
  sharedRoles: Map<string, SharedRole>,
) {
  const left = utterance.left;
  for (const voc of left.vocatives) takeRaw(cursor, voc.raw);
  for (const polar of left.polars) takeRaw(cursor, polar.raw);
  if (left.reviser) takeRaw(cursor, left.reviser.raw);
  if (left.force) takeRaw(cursor, left.force.raw);
  const sink: number[] = [];
  for (const body of utterance.bodies) {
    if (body.linker) takeRaw(cursor, body.linker.raw);
    walkClause(cursor, body.clause, constructions, sharedRoles, sink);
  }
}

function findWordIndex(tokens: InspectToken[], raw: string, before?: number): number | undefined {
  let found: number | undefined;
  const limit = before ?? tokens.length;
  for (let i = 0; i < limit; i++) {
    const token = tokens[i]!;
    if (token.kind === "word" && token.raw === raw) found = i;
  }
  return found;
}

function findPronounIndex(tokens: InspectToken[], bind: AnaphorBind): number | undefined {
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i]!;
    if (token.kind === "word" && token.raw === bind.pronoun.raw && token.word.ending === "r") {
      return i;
    }
  }
  return undefined;
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
    const pronounIdx = findPronounIndex(tokens, bind);
    if (pronounIdx === undefined) continue;
    const token = tokens[pronounIdx];
    if (token?.kind !== "word") continue;
    if (!bind.antecedent) {
      addRelated(token, { label: "no prior match", raw: "—", tokenIndex: pronounIdx });
      continue;
    }
    const antIdx = findWordIndex(tokens, bind.antecedent.raw, pronounIdx);
    if (antIdx === undefined) continue;
    addRelated(token, { label: "antecedent", raw: bind.antecedent.raw, tokenIndex: antIdx });
    const ant = tokens[antIdx];
    if (ant?.kind === "word") {
      addRelated(ant, { label: "anaphor", raw: bind.pronoun.raw, tokenIndex: pronounIdx });
    }
  }

  for (const group of constructions) {
    if (group.kind === "span") {
      const [open, close] = group.triggerIndices;
      if (open !== undefined && close !== undefined) {
        const openTok = tokens[open];
        const closeTok = tokens[close];
        if (openTok?.kind === "word" && closeTok) {
          addRelated(openTok, { label: "span close", raw: closeTok.raw, tokenIndex: close });
        }
        if (closeTok?.kind === "word" && openTok) {
          addRelated(closeTok, { label: "span open", raw: openTok.raw, tokenIndex: open });
        }
      }
    }
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
  const cursor: Cursor = { tokens, used: tokens.map(() => false) };
  for (const utterance of parsed.utterances) {
    walkUtterance(cursor, utterance, constructions, sharedRoles);
  }
  return constructions;
}

/** Per-word inspect stream. Sentence AST is optional; word cards do not require it. */
export function inspectText(text: string, tables: ClassifyTables): InspectResult {
  const tokens: InspectToken[] = [];
  const re = /\S+/g;
  let match: RegExpExecArray | null;
  let allWordsOk = true;

  while ((match = re.exec(text)) !== null) {
    const chunk = match[0]!;
    const chunkStart = match.index;

    if (chunk === "^") {
      tokens.push({ kind: "island", raw: "^", start: chunkStart, end: chunkStart + 1 });
      continue;
    }

    const last = chunk.slice(-1);
    const punct = PUNCT[last];
    const wordText = punct ? chunk.slice(0, -1) : chunk;

    if (wordText) {
      const start = chunkStart;
      const end = chunkStart + wordText.length;
      try {
        const word = classify(parseWord(wordText), tables);
        tokens.push({
          kind: "word",
          raw: word.raw,
          start,
          end,
          word,
          gloss: glossFor(word),
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

  attachWhy(tokens, []);

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
