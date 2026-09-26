import type { ClassifyTables } from "../parse/classify.js";
import { parseWithTables } from "../parse/parse-core.js";

/**
 * Trace a template or fragment span ([learning-order-check](../../docs/meta/proposals.md)):
 * fill each slot with sample Agalan, parse, and keep only the constructions
 * every successful filling shares. What varies between fillings came from a filler,
 * so the intersection is what the template's own words exercise.
 *
 * Slots:
 * - `…` / `...` / an all-caps placeholder (`A`, `HOOK₁`, `BODY`) standing alone → a word or clause.
 * - `…` / a placeholder glued to letters (`…axal`, `h+…`, `…l#N`) → part of one word.
 * - a fragment (no slots) gets an implicit slot before and after it.
 */

const SLOT_RE = /…|\.\.\.|[A-Z][A-Z0-9₀-₉]*/g;
/** A character that continues a word (so a slot next to it is part of that word). */
const WORD_CHAR_RE = /[a-z0-9#+_~@=±-]/;

const WORD_FILLERS = ["zazawan", "vawalal", "gazawal", "bazawan", "zazawan vawalal", "dazawan", "hazawal", "wazawal"];
const NAMED_FILLERS: Record<string, string[]> = {
  HOOK: ["al", "am", "ul", "ol", "el", "aol"],
  BODY: ["zazawan vawalal", "vawalal"],
  LINKER: ["xal", "xol"],
  JOIN: ["zal", "zol", "zel"],
};
const LEADING_FILLERS = [
  "z", "d", "v", "g", "b", "h", "w", "x", "y", "th",
  "zazawa", "vawala", "gazawa", "gonogo", "golozo", "thonogo", "walodo",
  "g+", "g+2", "g~+", "g#", "grawozozo",
];
const TRAILING_FILLERS = ["", "l", "n", "m", "r", "2", "2l", "2n", "azawal", "azawan", "awalal", "a", "ul"];
const NUMBER_FILLERS = ["2", "3", "2l", "3l", "2n", "3n"];
const ROOT_FILLERS = ["azawa", "awala"];
/** Interest roots, for interest patterns (`g…tha…`). */
const INTEREST_FILLERS = ["onogo", "olozo"];

type Slot = { start: number; end: number; options: string[] };

function slotOptions(text: string, start: number, end: number): string[] {
  const name = text.slice(start, end);
  const before = start > 0 && WORD_CHAR_RE.test(text[start - 1]!);
  const after = end < text.length && WORD_CHAR_RE.test(text[end]!);
  if (!before && !after) {
    if (name === "…" || name === "...") return WORD_FILLERS;
    return NAMED_FILLERS[name.replace(/[0-9₀-₉]+$/, "")] ?? WORD_FILLERS;
  }
  if (name === "N") return NUMBER_FILLERS;
  if (name === "ROOT") return ROOT_FILLERS;
  if (name === "DIR") return ["eweze", "ubuzu"];
  if (name === "ANCHOR") return ["edone", "azawa"];
  if (before && after) return ["", ...ROOT_FILLERS, ...INTEREST_FILLERS, "a", "x", "l"];
  return after ? LEADING_FILLERS : TRAILING_FILLERS;
}

function findSlots(text: string): Slot[] {
  return [...text.matchAll(SLOT_RE)].map((match) => {
    const start = match.index!;
    const end = start + match[0].length;
    return { start, end, options: slotOptions(text, start, end) };
  });
}

function fill(text: string, slots: Slot[], picks: number[]): string {
  let out = "";
  let at = 0;
  slots.forEach((slot, i) => {
    out += text.slice(at, slot.start) + slot.options[picks[i]!]!;
    at = slot.end;
  });
  return out + text.slice(at);
}

const MAX_TRIES = 4000;
const MAX_SUCCESSES = 6;

function traceFilled(template: string, slots: Slot[], tables: ClassifyTables): string[] | null {
  let shared: Set<string> | null = null;
  let successes = 0;
  const picks = slots.map(() => 0);
  for (let tries = 0; tries < MAX_TRIES && successes < MAX_SUCCESSES; tries++) {
    const text = fill(template, slots, picks).replace(/\s+/g, " ").trim();
    const sentence = /[.?!]$/.test(text) ? text : `${text}.`;
    try {
      const ids = parseWithTables(sentence, tables, { constructions: true }).constructions ?? [];
      shared = shared ? new Set(ids.filter((id) => shared!.has(id))) : new Set(ids);
      successes += 1;
    } catch {
      // try the next filling
    }
    // Odometer over the slot options, last slot fastest.
    let i = slots.length - 1;
    while (i >= 0 && ++picks[i]! >= slots[i]!.options.length) picks[i--] = 0;
    if (i < 0) break;
  }
  return shared ? [...shared].sort() : null;
}

/** `…l+0` / `…m#N`: numeric-derivation shape in shorthand (numeric-derivation.md; real words are spelled). */
const DERIVATION_SHAPE_RE = /^…[lm]([+\-#_±~@=].*)$/;

/** The derivation shape exercises what the free number `g+0` does, on a numeric-derivation word. */
function traceDerivationShape(num: string, tables: ClassifyTables): string[] | null {
  const ids = traceFilled(`g${num}`, findSlots(`g${num}`), tables);
  if (!ids) return null;
  const derived = ids.map((id) => (id === "word.family.number" ? "word.family.x" : id));
  return [...new Set([...derived, "word.xFamily.numeric"])].sort();
}

/**
 * Retries when the template as written leaves out something every real use supplies:
 * the role letter before a bare fence (`[…]`, `{…}`), or the word ending (`…yo`).
 */
function variants(template: string): string[] {
  const out: string[] = [];
  // A shape that starts mid-word (`axROOT`, `DIRthANCHOR`) gets its role letter first, not a citation reading.
  if (/^([aeiou]|[A-Z]+[a-z])/.test(template)) out.push(...["z", "g", "d"].map((pos) => `${pos}${template}`));
  out.push(template);
  if (/^[[{(<^]/.test(template)) out.push(`d${template}`, `th${template}`);
  for (const word of [...out]) {
    if (/([a-z0-9]|[a-z][A-Z]+)$/.test(word)) out.push(`${word}l`, `${word}n`);
  }
  return out;
}

/**
 * Word-shape notation written with spaces (`ROOT x ROOT`, `DIR th ANCHOR`) is one word,
 * and `a/e/u/o` lists alternatives; this rewrites both into the slot syntax.
 */
function normalizeShape(template: string): string[] {
  const alternation = /(?<![a-z])([a-z]+(?:\/[a-z]+)+)(?![a-z])/.exec(template);
  const options = alternation
    ? alternation[1]!.split("/").map((option) => template.replace(alternation[1]!, option))
    : [template];
  return options.map((option) =>
    option.replace(/\b([A-Z][A-Z0-9₀-₉]*|[a-z]) (x|th) ([A-Z][A-Z0-9₀-₉]*)\b/g, "$1$2$3"),
  );
}

/** Constructions a template span exercises, or an error when no filling parses. */
export function traceTemplate(text: string, tables: ClassifyTables): string[] {
  const trimmed = text.trim();
  const shape = DERIVATION_SHAPE_RE.exec(trimmed);
  if (shape) {
    const ids = traceDerivationShape(shape[1]!.replace(/N/g, "2"), tables);
    if (ids) return ids;
  }
  // Each alternative (`a/e/u/o`) must parse; together they exercise what the template shows.
  const alternatives = normalizeShape(trimmed).map((shape) => {
    for (const variant of variants(shape)) {
      const ids = traceFilled(variant, findSlots(variant), tables);
      if (ids) return ids;
    }
    return null;
  });
  if (alternatives.every((ids) => ids)) return [...new Set(alternatives.flat() as string[])].sort();
  throw new Error("no filling of the template's slots parses");
}

const FRAGMENT_BEFORE = ["", "zazawan", "daxal zazawan", "doxal vawalal", "daxal daxal zazawan", "doxal doxal vawalal"];
const FRAGMENT_AFTER = ["", "zazawan", "vawalal"];

/** Constructions a fragment exercises: the fragment with context supplied before and after. */
export function traceFragment(text: string, tables: ClassifyTables): string[] {
  const trimmed = text.trim();
  const template = `\u0000 ${trimmed} \u0001`;
  const slots: Slot[] = [
    { start: 0, end: 1, options: FRAGMENT_BEFORE },
    { start: template.length - 1, end: template.length, options: FRAGMENT_AFTER },
  ];
  const ids = traceFilled(template, slots, tables);
  if (!ids) throw new Error("the fragment does not parse with any context before or after it");
  return ids;
}
