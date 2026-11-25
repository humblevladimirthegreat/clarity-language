/**
 * Built words (docs/meta/realizer.md#round-trip): a word built on a stem, written as its front, the seam and the stem's
 * label, as the morph gloss names it (glosses.md#round-trip). The reader records how the word was built in `values`
 * (`built` and its fields, interpreter.md#terms); the stem's label on the word's ending comes from the caller,
 * which reads it from the gloss index. A role word is its reach and part, then its stem (roles.md#role-compounds:
 * `z-episode-agent-teach`); a hook prefix its hook, `-x-`, then its stem (hook-compounds.md#hook-prefixes:
 * `z-against-x-fight`); a numeric prefix its number, `-x-`, then its stem (numeric-derivation.md: `d-two-x-commitment`,
 * `d-three.about-x-speech`); a label seam its host, `-th-`, then its reach (label-seams.md: `v-misstate-th-role`).
 */
import { EXTRA_NOUN } from "./details.js";
import { numericLabel } from "./numbers.js";
import { Unrealized } from "./terms.js";

const noRule = (detail: string): Unrealized => new Unrealized("noRule", detail);

/** A role word's part consonant, as the glosser labels it (roles.md#role-compounds, role-parts.md#content-of-the-event). */
export const ROLE_PART: Record<string, string> = {
  z: "agent",
  d: "patient",
  b: "recipient",
  h: "manner",
  g: "state",
  th: "stance",
  w: "extent",
  y: "move",
  x: "outcome",
  v: "event",
};

/** A role word's or label seam's reach vowel, as the glosser labels it (role-parts.md#reach). */
export const ROLE_REACH: Record<string, string> = {
  a: "type",
  e: "pair",
  o: "role",
  u: "episode",
  ae: "situation",
  ao: "using",
  oe: "toward-role",
  ua: "except-episode",
  ue: "except-pair",
  uo: "outside-role",
};

/** An ability vowel (can-and-cant.md#ability), as the glosser labels it. */
const ABILITY: Record<string, string> = { a: "able", o: "unable-temporary", e: "unable-modifiable", u: "unable-irreversible" };

/** The label of a vowel in `table`, or a `missingValue` throw when the view lacks it. */
function labelOf(table: Record<string, string>, vowel: string | undefined, what: string): string {
  const label = table[vowel ?? ""];
  if (!label) throw new Unrealized("missingValue", `a built word with no ${what} in the view`);
  return label;
}

/**
 * A built word's leaf under `pos`: `stem` is the label of its stem on the word's own ending (`teach`, `dog-x-walk`,
 * `commitment`), and `values` the reader's record of how the word was built. A mid-word compound and a listed hook
 * compound are their stem alone, which the caller already names.
 */
export function builtLeaf(values: Record<string, string>, pos: string, stem: string): string {
  switch (values.built) {
    case "compound":
    case "hookCompound":
      return `${pos}-${stem}`;
    case "role": {
      // A role word with an ability vowel (can-and-cant.md#ability: `gwuzaruyoxam`) ends in what it can do.
      const ability = values.stanceVowel ? `-${labelOf(ABILITY, values.stanceVowel, "ability vowel")}` : "";
      return `${pos}-${labelOf(ROLE_REACH, values.reach, "reach vowel")}-${labelOf(ROLE_PART, values.part, "part")}-${stem}${ability}`;
    }
    case "hookPrefix": {
      if (values.stemHook) throw noRule("a hook prefix on a hook-compound stem");
      const reach = values.reach ? `-th-${labelOf(ROLE_REACH, values.reach, "reach vowel")}` : "";
      return `${pos}-${labelOf(EXTRA_NOUN, values.hook, "hook")}-x-${stem}${reach}`;
    }
    case "numeric":
      return `${pos}-${numericLabel(values.number)}${values.approx ? ".about" : ""}-x-${stem}`;
    case "scope":
      return `${pos}-${stem}-th-${labelOf(ROLE_REACH, values.stanceVowel, "reach vowel")}`;
    default:
      throw noRule(`a word built as ${values.built ?? "?"}`);
  }
}
