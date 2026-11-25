/** Binding checks on what resolve bound: tags, pointers and resumes, and an as-of word's bound noun. */
import { type ClassifyTables, isAsOfOverlay } from "./classify.js";
import { ConstructionError } from "./enforce.js";
import { parseHookCompoundCite } from "./hook-compounds.js";
import { rolePronounRoots, isGenericPronoun } from "./resolve.js";
import type { AnaphorBind, LexWord } from "./types.js";

/** What resolve bound each pronoun, tag and pointer to: an unbound or misbound one has no reading. */
export function enforceBindings(anaphors: AnaphorBind[], tables: ClassifyTables): void {
  for (const bind of anaphors) {
    if (bind.kind === "pointer") enforcePointer(bind);
    if (bind.kind === "tag" && bind.boundRebind) throw new ConstructionError("tagBoundRebind", bind.pronoun.raw);
    if (bind.antecedent) continue;
    if (bind.kind === "tag" && bind.boundExpired) throw new ConstructionError("tagBoundExpired", bind.pronoun.raw);
    if (bind.kind === "number") throw new ConstructionError("numberResumeUnbound", bind.pronoun.raw);
    if (bind.kind === "tag" && bind.placeholderHeld) throw new ConstructionError("tagNameHeld", bind.pronoun.raw);
    if (bind.kind === "tag" && bind.pairMixed) throw new ConstructionError("tagPairMixed", bind.pronoun.raw);
    if (bind.kind === "tag" && bind.pronoun.ending !== "l") throw new ConstructionError("tagUnbound", bind.pronoun.raw);
    if (bind.kind === "topic") throw new ConstructionError("topicUnbound", bind.pronoun.raw);
    if (bind.kind === "landmark") throw new ConstructionError("hookedJoinUnbound", bind.pronoun.raw);
    if (bind.kind === "content" && !isLexiconStemResume(bind.pronoun, tables)) {
      throw new ConstructionError("resumeUnbound", bind.pronoun.raw);
    }
  }
}

/**
 * Role pointers (pronouns.md#role-pointers): nouns only, never their own slot, never unbound; the new-one and share
 * endings have their own limits.
 */
function enforcePointer(bind: AnaphorBind): void {
  const word = bind.pronoun;
  if (word.pos !== "z" && word.pos !== "d" && word.pos !== "b") throw new ConstructionError("pointerSlot", word.raw);
  if (word.ending === "m" && bind.pointerVowel === "o") throw new ConstructionError("pointerShareSelf", word.raw);
  if (word.ending === "m" && word.plural) throw new ConstructionError("pointerSharePlural", word.raw);
  if (word.ending === "l" && bind.pointerVowel === "u") throw new ConstructionError("pointerNewUnsaid", word.raw);
  if (bind.ownSlot) throw new ConstructionError("pointerOwnSlot", word.raw);
  if (bind.pointerVowel === "a" && bind.part === "g") throw new ConstructionError("pointerOtherState", word.raw);
  if (bind.pointerVowel === "a" && bind.part === "w") throw new ConstructionError("pointerOtherExtent", word.raw);
  if (!bind.antecedent) throw new ConstructionError("pointerUnbound", word.raw);
  if (word.ending === "l" && bind.antecedent.family.kind === "content") {
    const special = bind.antecedent.family.roots.some((root) => rolePronounRoots().has(root)) || isGenericPronoun(bind.antecedent);
    if (special) throw new ConstructionError("pointerNewSpecial", word.raw);
  }
}

/**
 * With no antecedent, **-r** on a lexicon stem is the one you both already know: a published root,
 * a listed compound, or a hook compound on a published root (`vowogalar`). Any other stem needs an
 * earlier word with that whole stem, so the readings never compete.
 */
function isLexiconStemResume(word: LexWord, tables: ClassifyTables): boolean {
  if (word.family.kind !== "content") return true;
  const stem = word.family.roots.join("");
  if (tables.published.has(stem) || tables.compounds.has(stem)) return true;
  return ["l", "m"].some((ending) => {
    const parts = parseHookCompoundCite(stem + ending);
    return Boolean(parts && tables.published.has(parts.leftRoot) && parts.stem === stem + ending);
  });
}

export function enforceAsOfWord(word: LexWord, bound: LexWord | undefined): void {
  if (word.family.kind === "x" && word.family.landmark && !bound) throw new ConstructionError("landmarkLateralBound", word.raw);
  if (!isAsOfOverlay(word)) return;
  if (word.ending === "r" && bound) throw new ConstructionError("asOfResumeBound", `${word.raw} ${bound.raw}`);
  if (word.ending !== "r" && !bound) throw new ConstructionError("asOfIntroduceBound", word.raw);
}
