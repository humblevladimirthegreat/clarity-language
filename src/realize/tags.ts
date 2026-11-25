/**
 * Tags for the realizer (tag-pronouns.md#naming-with-a-tag): a tag pronoun from the tag vowels and the ending the reader
 * records, and an assigning tag written right after the term its link names.
 */
import type { MeaningLink, MeaningTerm } from "./meaning.js";
import { Unrealized } from "./terms.js";

/** Each tag vowel by its letter name (letter-names.md#letter-names), as the glosser labels it. */
const LETTER: Record<string, string> = { a: "A", o: "O", e: "E", u: "U" };

/**
 * A tag's label without its role letter, from `values.tag` and `values.ending`: **-l** assigns (`tag.A`), **-r** recalls
 * (`←tag.A`), **-m** is A's part in the latest event (`←tag.A.part`), **-n** a pseudonym (`tag.A.name`); two stacked tags
 * join at `+` (`←tag.A+O`, tag-pronouns.md#tag-pairs).
 */
export function tagLabel(values: Record<string, string>): string {
  const letters = [...(values.tag ?? "")].map((v) => LETTER[v]);
  if (!letters.length || letters.some((l) => !l)) throw new Unrealized("missingValue", "a tag with no tag vowel in the view");
  const name = `tag.${letters.join("+")}`;
  switch (values.ending) {
    case "l":
      return name;
    case "r":
      return `←${name}`;
    case "m":
      return `←${name}.part`;
    case "n":
      return `${name}.name`;
    default:
      throw new Unrealized("missingValue", "a tag with no ending in the view");
  }
}

/**
 * The claim's assigning tags (`slot:tag` links), by the term each names: written right after that term in its role
 * (`zodozel zwal`), or after the whole list's last join. A tag link that names no term is left to the caller.
 */
export function assignedTags(links: readonly MeaningLink[]): { tags: Map<MeaningTerm, string>; rest: MeaningLink[] } {
  const tags = new Map<MeaningTerm, string>();
  const rest: MeaningLink[] = [];
  for (const link of links) {
    if (link.kind === "tag" && link.tagged && link.values?.tag && !tags.has(link.tagged)) tags.set(link.tagged, tagLabel(link.values));
    else rest.push(link);
  }
  return { tags, rest };
}
