/**
 * Ageben set notes over overlay word notes (`vocab-flashcards.md`, set notes): one cloze note per set, a
 * kind's word notes first taught at one checkpoint, three or more of them, `-m` forms only where the kind
 * has an ending note ({@link SCALE_ENDING_KINDS}: lexical `-l` / `-r` forms such as `elol` keep word notes
 * but stay out of the set). One blank per member, each followed
 * by its English; the other members show. A set note sorts after its members.
 */
import { anchorCheckpoint, coveredByEndingNote, noteGuid, SCALE_ENDING_KINDS, SET_MODEL, type FlashcardInputs, type OverlayNote, type SetNote } from "./flashcards.js";
import type { OverlayRow } from "./lexicon-search.js";

/** Fewest word notes that make a set. */
export const SET_MIN_MEMBERS = 3;

export type SetNoteInputs = Pick<FlashcardInputs, "overlays" | "checkpoints" | "anchorSection">;

const escapeHtml = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** A set note's key and GUID spelling: the kind at the checkpoint's page, `phasal@already-still-yet`. */
export function setNoteKey(kind: string, page: string): string {
  return `${kind}@${page.replace(/\.md$/, "")}`;
}

/** The checkpoint tag a note carries. */
function cpTag(note: { tags: readonly string[] }): string {
  const tag = note.tags.find((t) => t.startsWith("ageben::cp::"));
  if (!tag) throw new Error(`note ${"key" in note ? String(note.key) : "?"}: no checkpoint tag`);
  return tag;
}

/**
 * A member's English on the set note: the distinct glosses of its rows, in CSV order, joined with " / ",
 * hyphens spaced (`not-yet` → *not yet*).
 */
export function memberEnglish(rows: readonly Pick<OverlayRow, "gloss">[]): string {
  const glosses = [...new Set(rows.map((r) => r.gloss))];
  return glosses.map((g) => g.replace(/-/g, " ")).join(" / ");
}

/** One cloze blank per member, each followed by its English: `{{c1::<code>avem</code>}} <i>already</i> · …`. */
export function setCloze(members: readonly OverlayNote[], english: (member: OverlayNote) => string): string {
  return members.map((m, i) => `{{c${i + 1}::<code>${escapeHtml(m.fields.form)}</code>}} <i>${escapeHtml(english(m))}</i>`).join(" · ");
}

/** Members of a set note, by key: word notes in the order given (checkpoint, then CSV order). */
export function setMembers(wordNotes: readonly OverlayNote[]): Map<string, OverlayNote[]> {
  const groups = new Map<string, OverlayNote[]>();
  for (const note of wordNotes) {
    if (SCALE_ENDING_KINDS.has(note.fields.kind) && !note.fields.form.endsWith("m")) continue;
    const tag = cpTag(note);
    const page = tag.split("::")[2]!;
    const key = setNoteKey(note.fields.kind, page);
    groups.set(key, [...(groups.get(key) ?? []), note]);
  }
  for (const [key, members] of groups) if (members.length < SET_MIN_MEMBERS) groups.delete(key);
  return groups;
}

/**
 * One Ageben set note per set of {@link overlayWordNotes}, in the order of each set's first member. Its
 * checkpoint, stage and link are its first member's; its English per member comes from the overlay rows
 * of the member's form at that checkpoint. Mnemonic empty: the data has none for a set.
 */
export function overlaySetNotes(inputs: SetNoteInputs, wordNotes: readonly OverlayNote[]): SetNote[] {
  const notes: SetNote[] = [];
  for (const [key, members] of setMembers(wordNotes)) {
    const first = members[0]!;
    const kind = first.fields.kind;
    const tag = cpTag(first);
    // A member's rows at its word note's checkpoint: the rows the word note folded in.
    const rowsOf = (m: OverlayNote) =>
      inputs.overlays.filter((r) => r.senseForm === m.fields.form && !coveredByEndingNote(r) && anchorCheckpoint(r.anchor, inputs)?.tag === tag);
    const stage = first.tags.find((t) => t.startsWith("ageben::stage::"))!;
    notes.push({
      source: "set",
      model: SET_MODEL,
      key,
      guid: noteGuid("set", key, ""),
      fields: {
        text: setCloze(members, (m) => memberEnglish(rowsOf(m))),
        title: `${kind[0]!.toUpperCase()}${kind.slice(1).replace(/_/g, " ")} words`,
        link: first.fields.link,
        mnemonic: "",
      },
      tags: ["ageben::overlay", `ageben::overlay::${kind}`, stage, tag],
      core: "",
    });
  }
  return notes;
}
