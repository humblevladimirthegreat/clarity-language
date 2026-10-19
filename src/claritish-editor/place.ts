// Where *Use this* puts a drop-in, as text changes against the document
// (docs/meta/grammar-docs.md#claritish-track, placement). Pure and browser-safe.
import type { Cue, Span } from "./match.js";

/** `after-clause`: where English puts *probably*; `after-noun`: right after the English noun (a thanks to something owned). */
export type Placement = "after-clause" | "after-noun";

/** How an after-clause drop-in joins the clause: `space` (`closed thovum`), `comma` (`Thanks, thoyutham`), or `sentence` (`I'm late. thanathum behon`). */
export type Joiner = "space" | "comma" | "sentence";

export type PlaceOptions = {
  placement: Placement;
  joiner: Joiner;
  /** Remove the English cue, as the lesson's examples do. Ignored when the cue is the whole sentence. */
  dropCue: boolean;
  /** The owned noun phrase, for `after-noun`. */
  noun?: Span;
};

/** A replacement against the original document, as CodeMirror takes it. */
export type Change = { from: number; to: number; insert: string };

const OPENERS = /^[\s"“'‘(]*$/;
const TERMINAL = /[.!?…]+["”’')\]]*$/;

/** A change whose insert holds the drop-in names it in `form`. */
export type PlacedChange = Change & { form?: string };

/** Changes that place `form` for `cue`. */
export function placeDropIn(cue: Cue, form: string, options: PlaceOptions): PlacedChange[] {
  const { sentence } = cue;
  const text = sentence.text;
  const base = sentence.from;
  const cueFrom = cue.from - base;
  const cueTo = cue.to - base;
  const atStart = OPENERS.test(text.slice(0, cueFrom));
  const wordsOutside = sentence.tokens.some((t) => t.word && (t.to <= cue.from || t.from >= cue.to));
  const drop = options.dropCue && wordsOutside;

  const changes: PlacedChange[] = [];
  let removal: Change | undefined;
  if (drop) removal = cueRemoval(text, cueFrom, cueTo, atStart);

  let at: number;
  let insert: string;
  if (options.placement === "after-noun" && options.noun) {
    at = options.noun.to - base;
    insert = ` ${form}`;
  } else if (options.joiner === "sentence") {
    at = text.length;
    insert = TERMINAL.test(text) ? ` ${form}.` : `. ${form}`;
  } else {
    at = clauseEnd(text, removal ? removal.to : cueTo);
    insert = `${options.joiner === "comma" ? "," : ""} ${form}`;
  }

  if (removal && at === removal.to) {
    // The drop-in lands where the cue was cut (`closed, I think.` → `closed thovum.`).
    changes.push({ from: removal.from + base, to: removal.to + base, insert: removal.insert + insert, form });
  } else {
    if (removal) changes.push({ from: removal.from + base, to: removal.to + base, insert: removal.insert });
    changes.push({ from: at + base, to: at + base, insert, form });
  }
  return changes.sort((a, b) => a.from - b.from);
}

/** The cut that removes the cue with its commas and spacing, re-capitalizing a sentence start. */
function cueRemoval(text: string, from: number, to: number, atStart: boolean): Change {
  const before = text.slice(0, from);
  const after = text.slice(to);
  if (atStart) {
    // `I think the store …`, `Probably, the store …`
    const end = to + /^[\s,]*/.exec(after)![0].length;
    const next = text[end] ?? "";
    const capital = /^\p{Lu}/u.test(text.slice(from)) && /\p{Ll}/u.test(next);
    return { from, to: capital ? end + 1 : end, insert: capital ? next.toUpperCase() : "" };
  }
  const lead = /[\s,]*$/.exec(before)![0];
  if (/^\s*[,;:]/.test(after) && lead.includes(",")) {
    // `The store, I think, is closed.`: cut from the first comma to the second.
    return { from: from - lead.length, to: to + /^\s*,/.exec(after)![0].length, insert: "" };
  }
  if (/^\s*[,;:.!?…]/.test(after) || /^\s*$/.test(after)) {
    // `The store is closed, I think.`
    return { from: from - lead.length, to, insert: "" };
  }
  // `The store is probably closed.`
  return { from, to: to + /^\s*/.exec(after)![0].length, insert: "" };
}

/** Offset of the clause end at or after `from`: the next clause punctuation or dash, else the end. */
function clauseEnd(text: string, from: number): number {
  const m = /[,;:.!?…]|\s[—–]\s/.exec(text.slice(from));
  if (!m) return text.trimEnd().length;
  let at = from + m.index;
  while (at > 0 && /\s/.test(text[at - 1]!)) at--;
  return at;
}

/** `changes` applied to `text` that starts at document offset `base`, with the inserted form's span in the result. */
export function applyChanges(text: string, changes: readonly PlacedChange[], base = 0): { text: string; form?: Span } {
  let out = "";
  let cursor = 0;
  let form: Span | undefined;
  for (const change of [...changes].sort((a, b) => a.from - b.from)) {
    const from = change.from - base;
    out += text.slice(cursor, from);
    if (change.form) {
      const start = out.length + change.insert.lastIndexOf(change.form);
      form = { from: start, to: start + change.form.length };
    }
    out += change.insert;
    cursor = change.to - base;
  }
  return { text: out + text.slice(cursor), form };
}
