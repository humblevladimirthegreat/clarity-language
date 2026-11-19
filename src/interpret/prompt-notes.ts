/**
 * Structure lines for the translation prompt (`node scripts/parse.mjs --llm-prompt --structure`): plain English on how
 * the whole-clause frames of a passage fit together, built from the readings (docs/meta/interpreter.md#parse-or-reading)
 * through the inspector's sentence notes ({@link notesFromReadings}). Per sentence with two or more whole-clause frames
 * (carried frames count): what covers what, which pairs are not settled, and which frames carry over from an earlier
 * sentence. The lines copy the reading's `order`, `unordered` and `carriedFrame` links; they never order a pair
 * themselves (interpreter.md#reader-rules). Each frame is named by its word's gloss as the prompt's morph gloss prints
 * it, so the model can find it, with a short gist the first time.
 */
import type { ClassifyTables } from "../parse/classify.js";
import { morphGlossWords } from "../parse/morph-gloss.js";
import { parseWithTables } from "../parse/parse-core.js";
import type { LexWord, ParseResult } from "../parse/types.js";
import { notesFromReadings, type InspectNotes } from "./inspect-notes.js";
import { allReadings, readParse } from "./read.js";
import type { FrameFamily, Reading } from "./types.js";

/** What each frame family does, in a few plain words for the model (no grammar terms). */
export const FAMILY_GISTS: Readonly<Partial<Record<FrameFamily, string>>> = {
  force: "the kind of speech act",
  polarity: "not",
  say: "who has a say",
  stance: "how it is known or how sure",
  holder: "whose view",
  hinge: "a link to another clause",
  intention: "a plan, want, or decision",
  ability: "can or cannot",
  phase: "already, still, not yet, or no longer",
  residue: "an earlier state",
  notional: "as if",
  mirative: "it turns out",
  contrary: "contrary to what was expected",
  occasion: "when or how often",
  sake: "for whose sake",
  attitude: "the speaker's feeling about it",
  bar: "measured against a bar",
  quote: "a quote",
  binder: "which one: a particular one or any",
  call: "who is called",
};

function withFinalStop(text: string): string {
  return /[.]$/.test(text) ? text : `${text}.`;
}

/** The passage as one text, inputs joined as `promptForPassage` joins them. */
export function passageText(inputs: readonly string[]): string {
  return inputs.map((input) => withFinalStop(input.trim())).join(" ");
}

type PassageNotes = {
  notes: InspectNotes;
  /** Each word's gloss, by word position (`LexWord.at`). */
  glosses: string[];
  /** Sentence number (from 1) of a reading, nested ones included. */
  sentenceOf: (id: string) => number | undefined;
  sentences: number;
  /** Where sentence n sits, in the prompt's own terms: `line L` (`, sentence k`) when there are several inputs. */
  place: (n: number) => string;
};

/** Parse and read the passage the prompt glosses (inputs joined as `promptForPassage` joins them). */
function readPassage(
  inputs: readonly string[],
  tables: ClassifyTables,
  minFrames: number,
  parsed?: ParseResult,
): PassageNotes {
  const text = passageText(inputs);
  const glosses = morphGlossWords(text, tables).map((word) => word.gloss);
  const top = readParse(parsed ?? parseWithTables(text, tables), { tables });
  const indices = (words: readonly LexWord[]): number[] =>
    words.flatMap((w) => (w.at !== undefined && w.at < glosses.length ? [w.at] : []));
  const notes = notesFromReadings(top, indices, minFrames);
  const key = (r: Reading) => `${r.source.utterance}.${r.source.body}`;
  const number = new Map<string, number>();
  for (const reading of top) if (!number.has(key(reading))) number.set(key(reading), number.size + 1);
  const byId = new Map(allReadings(top).map((r) => [r.id, r]));
  const sentenceOf = (id: string) => {
    const reading = byId.get(id);
    return reading ? number.get(key(reading)) : undefined;
  };
  // Several inputs are numbered lines in the prompt; one input with several sentences counts them.
  const perInput =
    inputs.length > 1
      ? inputs.map((input) => {
          const own = readParse(parseWithTables(withFinalStop(input.trim()), tables), { tables });
          return new Set(own.map(key)).size;
        })
      : [number.size];
  const place = (n: number): string => {
    if (inputs.length === 1) return `sentence ${n}`;
    let k = n;
    for (const [i, count] of perInput.entries()) {
      if (k <= count) return count > 1 ? `line ${i + 1}, sentence ${k}` : `line ${i + 1}`;
      k -= count;
    }
    return `sentence ${n}`;
  };
  return { notes, glosses, sentenceOf, sentences: number.size, place };
}

/**
 * The most whole-clause frames (carried included) any one sentence of the passage has; the eval's `--min-frames`
 * filter. 0 when no sentence has one.
 */
export function wholeClauseFrameCount(inputs: readonly string[], tables: ClassifyTables): number {
  const { notes } = readPassage(inputs, tables, 0);
  return Math.max(0, ...notes.sentences.map((s) => s.frames.length + s.carried.length));
}

/**
 * The structure lines for a passage, one plain-English line each, without list marks. Empty when no sentence has two or
 * more whole-clause frames, so the prompt is unchanged. `parsed` is the parse of {@link passageText}, when the caller
 * already has it.
 */
export function structureLines(inputs: readonly string[], tables: ClassifyTables, parsed?: ParseResult): string[] {
  const { notes, glosses, sentenceOf, sentences, place } = readPassage(inputs, tables, 2, parsed);
  const named = new Set<string>();
  const name = (at: readonly number[], families: readonly (FrameFamily | undefined)[]): string => {
    const gloss = `\`${at.map((i) => glosses[i]).join(" … ")}\``;
    const id = at.join(",");
    if (named.has(id)) return gloss;
    named.add(id);
    const gists = [...new Set(families.flatMap((f) => (f && FAMILY_GISTS[f] ? [FAMILY_GISTS[f]!] : [])))];
    return gists.length > 0 ? `${gloss} (${gists.join("; ")})` : gloss;
  };
  // A word may carry more than one frame (a holder fused with its channel): name it once, with every gist.
  const frameName = (token: number): string => {
    const onWord = notes.frames.filter((n) => n.tokenIndex === token);
    return name(onWord[0]?.tokenIndices ?? [token], onWord.map((n) => n.family));
  };

  const lines: string[] = [];
  for (const sentence of notes.sentences) {
    const n = sentenceOf(sentence.reading);
    const lead = (text: string) =>
      sentences > 1 && n !== undefined ? `In ${place(n)}, ${text}` : text.charAt(0).toUpperCase() + text.slice(1);

    // Pairs between frames on one word say nothing the gloss does not; a pair a chain already gives is left out.
    const pairs = new Map<string, [number, number]>();
    for (const c of sentence.covers) if (c.over !== c.under) pairs.set(`${c.over}>${c.under}`, [c.over, c.under]);
    const has = (a: number, b: number) => pairs.has(`${a}>${b}`);
    const direct = [...pairs.values()].filter(
      ([a, c]) => ![...pairs.values()].some(([x, b]) => x === a && b !== c && has(b, c)),
    );
    for (const [over, under] of direct) lines.push(lead(`${frameName(over)} covers ${frameName(under)}.`));

    const unsettled = new Map<string, [number, number]>();
    // Named in text order: the pair has no order to keep.
    for (const pair of sentence.unsettled) {
      const [a, b] = [...pair].sort((x, y) => x - y) as [number, number];
      if (a !== b) unsettled.set(`${a},${b}`, [a, b]);
    }
    for (const [a, b] of unsettled.values()) {
      lines.push(lead(`the order of ${frameName(a)} and ${frameName(b)} is not settled: either may cover the other.`));
    }

    for (const carried of sentence.carried) {
      const from = carried.from ? sentenceOf(carried.from) : undefined;
      const under = carried.coveredBy.map(frameName);
      lines.push(
        lead(
          `${name(carried.tokenIndices, [carried.family])} from ${from ? place(from) : "an earlier sentence"} still applies` +
            (under.length > 0 ? `, and ${under.join(" and ")} ${under.length > 1 ? "cover" : "covers"} it.` : "."),
        ),
      );
    }
  }
  return lines;
}
