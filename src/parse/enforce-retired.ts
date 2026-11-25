/**
 * Retired shapes: forms the language closed by a design decision (docs/meta/design-decisions.md), one row per
 * rejection id, each citing its D-id. A row checks either one word or an `/h/` unit with its hosted noun.
 */
import { standInKind } from "./classify.js";
import { CLOSED } from "../closed-roots.js";
import { ConstructionError } from "./enforce.js";
import type { RejectionId } from "./constructions.js";
import type { HUnit, LexWord } from "./types.js";

type RetiredId = Extract<RejectionId, `retired${string}`>;

/** A retired shape: the decision that closed it, and the test on a word (with its one content root) or on an `/h/` unit. */
type Retired = { decision: string } & (
  | { word: (word: LexWord, stemRoot: string | undefined) => boolean }
  | { hUnit: (unit: HUnit) => boolean }
);

export const RETIRED: Record<RetiredId, Retired> = {
  // **-n** on the neutral root is unassigned: *someone* is `zeyel zar` or a tag (joins.md#unspecified-member-r-phrase).
  retiredSomeone: { decision: "D-69", word: (word, stemRoot) => stemRoot === CLOSED.neutral && word.ending === "n" },
  // The record and scroll roots are no channel: a record is REPORTED, a tale NOTIONAL (evidentiality.md#evidentiality).
  retiredChannelRoot: {
    decision: "D-42",
    word: (word, stemRoot) => word.pos === "th" && (stemRoot === CLOSED.record || stemRoot === CLOSED.scroll) && word.ending !== "n",
  },
  // The green, no-entry and memo roots are no stance: permission, a ban and a requirement are say words (permission-consent.md#say-words).
  retiredDeonticRoot: {
    decision: "D-46",
    word: (word, stemRoot) =>
      word.pos === "th" && (stemRoot === CLOSED.green || stemRoot === CLOSED.noEntry || stemRoot === CLOSED.memo) && word.ending !== "n",
  },
  // The map and check roots are no `/h/` word: a plan or decision is in a mind, a `/th/` stance (intention.md#plan).
  retiredIntentionRoot: {
    decision: "D-48",
    word: (word, stemRoot) => word.pos === "h" && (stemRoot === CLOSED.map || stemRoot === CLOSED.check) && word.ending !== "n",
  },
  // The purpose hinge is no `/h/` word: an aim is in a mind, a `/th/` stance (dependents.md#so-that).
  retiredPurposeHinge: { decision: "D-64", word: (word, stemRoot) => word.pos === "h" && stemRoot === CLOSED.goal && word.ending === "m" },
  // NOT YET is no `/h/` word: it waits on an expectation, which is in a mind, a `/th/` stance (already-still-yet.md#stage-of-change).
  retiredNotYet: { decision: "D-76", word: (word, stemRoot) => word.pos === "h" && stemRoot === CLOSED.seedling && word.ending !== "n" },
  // WHEREAS hosts no noun: *despite* weighs a thing against an expectation, and an expectation is in a mind, so it is
  // `thezem` + a `bl-` noun only (dependents.md#hinges). `hezem` takes a stand-in.
  retiredDespiteHinge: {
    decision: "D-76",
    hUnit: (unit) => {
      const bound = unit.hosted?.bound;
      if (unit.word.pos !== "h" || unit.word.overlay?.gloss !== "whereas" || !bound) return false;
      return !(unit.hosted?.grounds || standInKind(bound) || bound.family.kind === "number");
    },
  },
};

const ROWS = Object.entries(RETIRED) as [RetiredId, Retired][];

/** Throws for a word in a retired shape; `stemRoot` is its one content root, if it has exactly one. */
export function enforceRetiredWord(word: LexWord, stemRoot: string | undefined): void {
  for (const [id, row] of ROWS) if ("word" in row && row.word(word, stemRoot)) throw new ConstructionError(id, word.raw);
}

/** Throws for an `/h/` unit in a retired shape, citing the word and its hosted noun. */
export function enforceRetiredHUnit(unit: HUnit): void {
  for (const [id, row] of ROWS) if ("hUnit" in row && row.hUnit(unit)) throw new ConstructionError(id, `${unit.word.raw} ${unit.hosted!.bound!.raw}`);
}
