// Where *Use this* puts a drop-in, as text changes against the document
// (docs/meta/grammar-docs.md#claritish-track, placement). Pure and browser-safe.
import type { Cue, Span, Token } from "./match.js";

/**
 * `after-clause`: where English puts *probably*; `after-noun`: right after the English noun (a
 * thanks to something owned); `suffix`: a hyphen suffix on the English verb after the cue, which
 * replaces the cue (*I can't sing* → *I sing-xu*); `on-cue`: a hyphen suffix on the cue's last
 * word, which stays (*He's a liar* → *He's a liar-the*); `before-word`: a tone mark at the start of
 * the sentence, coloring all of it.
 */
export type Placement = "after-clause" | "after-noun" | "suffix" | "on-cue" | "before-word";

/** How an after-clause drop-in joins the clause: `space` (`closed thovum`), `comma` (`Thanks, thoyutham`), or `sentence` (`I'm late. thanathum behon`). */
export type Joiner = "space" | "comma" | "sentence";

export type PlaceOptions = {
  placement: Placement;
  joiner: Joiner;
  /** Remove the English cue, as the lesson's examples do. Ignored when the cue is the whole sentence and for `on-cue`; always so for `suffix`. */
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

/** Adverbs between *can't* and its verb (*I can't even sing*): the suffix skips them. */
const SKIP_TO_VERB = new Set(["even", "really", "just", "quite", "ever", "always", "still", "actually", "honestly", "possibly", "simply", "totally"]);

/** The verb a suffix attaches to: the first word after the cue, past any adverbs, before any punctuation. */
function suffixHost(cue: Cue): Token | undefined {
  for (const token of cue.sentence.tokens) {
    if (token.from < cue.to) continue;
    if (!token.word) return undefined;
    if (!SKIP_TO_VERB.has(token.norm)) return token;
  }
  return undefined;
}

/** Changes that place `form` for `cue`; none when a suffix has no verb to attach to. */
export function placeDropIn(cue: Cue, form: string, options: PlaceOptions): PlacedChange[] {
  const { sentence } = cue;
  const text = sentence.text;
  const base = sentence.from;
  const cueFrom = cue.from - base;
  const cueTo = cue.to - base;
  const atStart = OPENERS.test(text.slice(0, cueFrom));
  const outside = (t: Token) => t.word && (t.to <= cue.from || t.from >= cue.to);
  const wordsOutside = sentence.tokens.some(outside);
  const suffix = options.placement === "suffix";
  const onCue = options.placement === "on-cue";
  const drop = !onCue && (options.dropCue || suffix) && wordsOutside;

  const host = suffix ? suffixHost(cue) : onCue ? sentence.tokens.filter((t) => t.word && t.from >= cue.from && t.to <= cue.to).pop() : undefined;
  if ((suffix || onCue) && !host) return [];

  const changes: PlacedChange[] = [];
  let removal: Change | undefined;
  if (drop) removal = cueRemoval(text, cueFrom, cueTo, atStart);

  let at: number;
  let insert: string;
  if (host) {
    at = host.to - base;
    insert = form;
  } else if (options.placement === "before-word") {
    const first = sentence.tokens.find((t) => t.word && (!drop || outside(t)));
    at = (first?.from ?? base) - base;
    insert = form;
  } else if (options.placement === "after-noun" && options.noun) {
    at = options.noun.to - base;
    insert = ` ${form}`;
  } else if (options.joiner === "sentence") {
    at = text.length;
    insert = TERMINAL.test(text) ? ` ${form}.` : `. ${form}`;
  } else {
    at = clauseEnd(text, removal ? removal.to : cueTo);
    insert = `${options.joiner === "comma" ? "," : ""} ${form}`;
  }

  if (removal && at >= removal.from && at <= removal.to) {
    // The drop-in lands where the cue was cut (`closed, I think.` → `closed thovum.`); a tone mark
    // goes before the re-capitalized letter (`lol you're` → `%you're`).
    const merged = options.placement === "before-word" ? insert + removal.insert : removal.insert + insert;
    changes.push({ from: removal.from + base, to: removal.to + base, insert: merged, form });
  } else {
    if (removal) changes.push({ from: removal.from + base, to: removal.to + base, insert: removal.insert });
    changes.push({ from: at + base, to: at + base, insert, form });
  }
  return changes.sort((a, b) => a.from - b.from);
}

/**
 * Changes that replace a slash command (`/sure`) in `line` (at document offset `base`) with
 * `form`: a suffix joins the word before it (`sing /can` → `sing-xo`), a tone mark the word after
 * it, and any other drop-in takes the command's place. None when a suffix has no word before it.
 */
export function placeAtCommand(line: string, base: number, command: Span, form: string): PlacedChange[] {
  const before = line.slice(0, command.from - base);
  const after = line.slice(command.to - base);
  if (form.startsWith("-")) {
    const m = /\p{L}(\s?)$/u.exec(before);
    return m ? [{ from: command.from - m[1]!.length, to: command.to, insert: form, form }] : [];
  }
  if (!/[\p{L}\p{N}]/u.test(form)) {
    return [{ from: command.from, to: command.to + /^[ \t]*/.exec(after)![0].length, insert: form, form }];
  }
  return [{ from: command.from, to: command.to, insert: /^[\p{L}\p{N}]/u.test(after) ? `${form} ` : form, form }];
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
