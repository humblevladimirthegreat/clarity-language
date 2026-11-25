/**
 * Ageben set notes that teach endings once (`vocab-flashcards.md`, endings taught once): the scale note at
 * `sakes.md#beginner-practice` (`-l` settled · `-m` default · `-r` passing), and one ending note per
 * {@link SCALE_ENDING_KINDS} kind at the kind's first `-l` / `-r` checkpoint. Those kinds' `-l` / `-r` forms
 * get no word note ({@link coveredByEndingNote}); lexical endings keep theirs.
 */
import {
  anchorCheckpoint,
  checkpointTag,
  coveredByEndingNote,
  noteGuid,
  SCALE_ENDING_KINDS,
  SET_MODEL,
  type AnchorCheckpoint,
  type FlashcardInputs,
  type SetNote,
} from "./flashcards.js";
import { anchorUrl } from "./flashcards-overlays.js";
import { STANCE_GRADE_BY_ENDING } from "./parse/overlay-grade.js";
import type { OverlayRow } from "./lexicon-search.js";

export type EndingNoteInputs = Pick<FlashcardInputs, "overlays" | "checkpoints" | "anchorSection">;

const ENDINGS = ["l", "m", "r"] as const;
type Ending = (typeof ENDINGS)[number];

/** The checkpoint that drills the scale note, and the section that teaches the scale. */
export const SCALE_CHECKPOINT = "sakes.md#beginner-practice";
export const SCALE_ANCHOR = "sakes.md#settled-to-passing";
/** The settled-to-passing scale, as the design words it. */
const SCALE_READINGS: Record<Ending, string> = STANCE_GRADE_BY_ENDING;

/** GUID and note key of the scale note, and of a kind's ending note. */
export const SCALE_NOTE_KEY = "scale";
export function endingNoteKey(kind: string): string {
  return `endings:${kind}`;
}

const escapeHtml = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** One cloze blank per ending, each followed by its reading: `{{c1::<code>-l</code>}} <i>settled</i> · …`. */
export function endingCloze(readings: Record<Ending, string>): string {
  return ENDINGS.map((e, i) => `{{c${i + 1}::<code>-${e}</code>}} <i>${escapeHtml(readings[e])}</i>`).join(" · ");
}

/**
 * The reading an ending adds to a gloss: the part after the last `.` (`MEMORY.strong`, `already.for-now`),
 * else after an upper-case head and `-` (`WANT-passing`), spaced (`for now`). Undefined for a bare gloss
 * (`MEMORY`, `already`): the `-m` default.
 */
export function endingReading(gloss: string): string | undefined {
  const suffix = /\.([^.]+)$/.exec(gloss)?.[1] ?? /^[A-Z]+-(.+)$/.exec(gloss)?.[1];
  return suffix?.replace(/-/g, " ");
}

function setNote(key: string, cp: AnchorCheckpoint, fields: SetNote["fields"], tags: string[]): SetNote {
  return { source: "set", model: SET_MODEL, key, guid: noteGuid("set", key, ""), fields, tags: [...tags, `ageben::stage::${cp.band}`, cp.tag], core: "" };
}

/** The scale note, at {@link SCALE_CHECKPOINT}. */
export function scaleNote(inputs: Pick<FlashcardInputs, "checkpoints">): SetNote {
  const checkpoint = inputs.checkpoints.find((c) => c.anchor === SCALE_CHECKPOINT && !c.review);
  if (!checkpoint) throw new Error(`scale note: ${SCALE_CHECKPOINT} is not a stage checkpoint`);
  const id = SCALE_CHECKPOINT.split("#")[1]!;
  const cp: AnchorCheckpoint = { page: checkpoint.page, band: checkpoint.band, id, anchor: checkpoint.anchor, tag: checkpointTag(checkpoint.page, checkpoint.band) };
  const fields = { text: endingCloze(SCALE_READINGS), title: "Settled-to-passing scale", link: anchorUrl(SCALE_ANCHOR), mnemonic: "" };
  return setNote(SCALE_NOTE_KEY, cp, fields, ["ageben::overlay"]);
}

/**
 * The ending note of a scale-ending kind: its covered `-l` / `-r` rows and the `-m` rows of the same stems
 * give one reading per ending, which every form of the kind must share. At the first checkpoint of a covered
 * row; the link is that checkpoint's first covered row, in CSV order. The forms line lists the `-m` forms.
 */
export function endingNote(kind: string, inputs: EndingNoteInputs): SetNote {
  const covered = inputs.overlays.filter((r) => r.kind === kind && coveredByEndingNote(r));
  if (covered.length === 0) throw new Error(`ending note ${kind}: no -l / -r rows`);
  const stems = new Set(covered.map((r) => r.senseForm.slice(0, -1)));
  const members = inputs.overlays.filter((r) => r.kind === kind && stems.has(r.senseForm.slice(0, -1)) && /[lmr]$/.test(r.senseForm));
  const readings = {} as Record<Ending, string>;
  for (const e of ENDINGS) {
    const found = new Set(members.filter((r) => r.senseForm.endsWith(e)).map((r) => endingReading(r.gloss) ?? SCALE_READINGS.m));
    if (found.size !== 1) throw new Error(`ending note ${kind}: -${e} reads ${found.size === 0 ? "nothing" : [...found].join(" / ")}`);
    readings[e] = [...found][0]!;
  }
  const index = new Map(inputs.checkpoints.map((c, i) => [c.anchor, i]));
  const placed = covered.map((row) => {
    const cp = anchorCheckpoint(row.anchor, inputs);
    if (!cp) throw new Error(`overlay ${row.senseForm}@${row.pos}: anchor ${row.anchor} maps to no checkpoint`);
    return { row, cp, at: index.get(cp.anchor)! };
  });
  const first = placed.reduce((a, b) => (b.at < a.at ? b : a));
  const forms = [...new Set(members.filter((r) => r.senseForm.endsWith("m")).map((r: OverlayRow) => r.senseForm))];
  const fields = {
    text: `${endingCloze(readings)}<br><span class="forms">${forms.map((f) => `<code>${f}</code>`).join(" · ")}</span>`,
    title: `${kind[0]!.toUpperCase()}${kind.slice(1)} endings`,
    link: anchorUrl(first.row.anchor),
    mnemonic: "",
  };
  return setNote(endingNoteKey(kind), first.cp, fields, ["ageben::overlay", `ageben::overlay::${kind}`]);
}

/** The scale note, then one ending note per {@link SCALE_ENDING_KINDS} kind, in checkpoint order. */
export function endingNotes(inputs: EndingNoteInputs): SetNote[] {
  const index = new Map(inputs.checkpoints.map((c, i) => [checkpointTag(c.page, c.band), i]));
  const at = (n: SetNote) => index.get(n.tags.find((t) => t.startsWith("ageben::cp::"))!) ?? -1;
  const notes = [scaleNote(inputs), ...[...SCALE_ENDING_KINDS].map((kind) => endingNote(kind, inputs))];
  return notes.map((note, order) => ({ note, order })).sort((a, b) => at(a.note) - at(b.note) || a.order - b.order).map((n) => n.note);
}
