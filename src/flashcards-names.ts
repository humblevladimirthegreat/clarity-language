/**
 * Ageben set notes for digit syllables and letter names: one cloze note per group of `data/sound-names.csv`
 * (`SOUND_NAME_GROUPS`). Each blank hides a name; the digit or letter it names shows beside it, and a vowel
 * also shows its English cue, because a vowel's name is the vowel itself. The note unlocks at the row's
 * `checkpoint`, which must be a stage checkpoint.
 */
import { checkpointTag, noteGuid, SET_MODEL, type FlashcardInputs, type SetNote } from "./flashcards.js";
import { anchorUrl } from "./flashcards-overlays.js";
import { SOUND_NAME_GROUPS, type SoundNameGroup, type SoundNameRow } from "./sound-names.js";

export type NameNoteInputs = Pick<FlashcardInputs, "soundNames" | "checkpoints">;

const escapeHtml = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** Note key and GUID spelling of a group's note. */
export function nameNoteKey(group: SoundNameGroup): string {
  return `names:${group}`;
}

/** One cloze blank per name, followed by what it names: `{{c1::<code>bu</code>}} <code>b</code>`. */
export function nameCloze(rows: readonly SoundNameRow[]): string {
  return rows
    .map((r, i) => {
      const named = r.group === "digits" ? escapeHtml(r.reading) : `<code>${escapeHtml(r.reading)}</code>`;
      const cue = r.group === "vowels" ? ` <i>${escapeHtml(r.cue)}</i>` : "";
      return `{{c${i + 1}::<code>${escapeHtml(r.form)}</code>}} ${named}${cue}`;
    })
    .join(" · ");
}

/** One set note per group that has rows, in {@link SOUND_NAME_GROUPS} order; the group's rows share one anchor and checkpoint. */
export function soundNameNotes(inputs: NameNoteInputs): SetNote[] {
  const notes: SetNote[] = [];
  for (const [group, title] of Object.entries(SOUND_NAME_GROUPS) as [SoundNameGroup, string][]) {
    const rows = inputs.soundNames.filter((r) => r.group === group);
    if (rows.length === 0) continue;
    const first = rows[0]!;
    for (const r of rows) {
      if (r.anchor !== first.anchor || r.checkpoint !== first.checkpoint) throw new Error(`sound names ${group}: ${r.form} differs from ${first.form} in anchor or checkpoint`);
    }
    const checkpoint = inputs.checkpoints.find((c) => c.anchor === first.checkpoint && !c.review);
    if (!checkpoint) throw new Error(`sound names ${group}: ${first.checkpoint} is not a stage checkpoint`);
    const key = nameNoteKey(group);
    notes.push({
      source: "set",
      model: SET_MODEL,
      key,
      guid: noteGuid("set", key, ""),
      fields: { text: nameCloze(rows), title, link: anchorUrl(first.anchor), mnemonic: "" },
      tags: ["ageben::names", `ageben::names::${group}`, `ageben::stage::${checkpoint.band}`, checkpointTag(checkpoint.page, checkpoint.band)],
      core: "",
    });
  }
  return notes;
}
