import { classify, type ClassifyTables } from "./classify.js";
import { parseSentenceTokens, SentenceParseError } from "./sentence-parser.js";
import { tokenizeUtterance } from "./tokenize.js";
import type { Ending, LexWord, MorphWordFamily, PunctKind } from "./types.js";
import { parseWord, WordParseError } from "./word.js";

export type InspectError = {
  message: string;
  expected?: string;
};

export type InspectWordToken = {
  kind: "word";
  raw: string;
  start: number;
  end: number;
  word: LexWord;
  gloss: string;
  chips: string[];
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

export function endingSense(ending: Ending | undefined): string | undefined {
  if (!ending) return undefined;
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
  if (word.ending) chips.push(`-${word.ending} ${ENDING_SENSE[word.ending]}`);
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
    rows.push({ label: "ending", value: `-${word.ending} (${ENDING_SENSE[word.ending]})` });
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

function trySentenceWarning(text: string, tables: ClassifyTables): string | undefined {
  try {
    const tokens = tokenizeUtterance(text, tables);
    if (tokens.length === 0) return undefined;
    parseSentenceTokens(tokens);
    return undefined;
  } catch (error) {
    if (error instanceof SentenceParseError) return error.message;
    if (error instanceof Error) return error.message;
    return String(error);
  }
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

  const sentenceWarning =
    allWordsOk && tokens.some((token) => token.kind === "word")
      ? trySentenceWarning(text, tables)
      : undefined;

  return { tokens, sentenceWarning };
}
