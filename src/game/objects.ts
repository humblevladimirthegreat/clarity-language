/**
 * Objects from root tails: every published root's `kind`, `shape` and `size` columns
 * (docs/meta/lexicon.md#root-tails) give it default behavior, so any root can appear in the world and act
 * sensibly. The engine reads the columns, not the spelling. {@link OVERRIDES} adds the interactions that
 * make play fun and fixes rows whose category is right for spelling but odd in play; it never edits the lexicon.
 */
import type { PublishedRow } from "../lexicon-search.js";
import type { GameLexicon } from "./lexicon.js";

export type SizeClass = "small" | "medium" | "big" | "none";

export type Traits = {
  /** Has a body you could point at. */
  physical: boolean;
  size: SizeClass;
  /** Moves and reacts on its own (creature, person). */
  animate: boolean;
  /** Talks and takes commands (person). */
  person: boolean;
  edible: boolean;
  drinkable: boolean;
  /** Holds other things inside. */
  container: boolean;
  /** Opens and closes (a container, a door). */
  openable: boolean;
  /** Can be entered (a place that holds). */
  enterable: boolean;
  /** Small enough to carry. */
  portable: boolean;
  /** Big enough to block a way. */
  blocks: boolean;
  /** Pours (a liquid). */
  pours: boolean;
  flammable: boolean;
  /** Grows (a plant, a creature). */
  grows: boolean;
  /** Cuts, hides or harms (`takes-away`). */
  harmful: boolean;
  /** Leads somewhere (`order`: paths, ladders, stages). */
  path: boolean;
  /** Takes a command from anyone who calls it (a cat does as it likes). */
  obeys: boolean;
  /** Concrete senses of the creatures it chases when both are free in a room. */
  chases: string[];
  /** Poured on something burning, puts it out. */
  quenches: boolean;
};

/** Kinds whose rows name a thing with a body even when the row has no size (a three-letter root has none). */
const BODY_KINDS = new Set(["creature", "person", "body", "place", "nature", "food", "tool"]);
/** Kinds that hold things inside when their shape is `holds`. */
const CONTAINER_KINDS = new Set(["tool", "body", "sign"]);

/** Fixes and interactions by concrete sense. */
export const OVERRIDES: Record<string, Partial<Traits>> = {
  book: { physical: true, size: "small", portable: true, flammable: true, container: false },
  money: { physical: true, size: "small", portable: true, container: false },
  bell: { container: false },
  door: { physical: true, size: "big", openable: true, portable: false },
  cutlery: { edible: false, container: false },
  drink: { drinkable: true, pours: true, edible: false, container: false, portable: true, size: "small" },
  water: { drinkable: true, pours: true, quenches: true },
  wood: { flammable: true },
  dog: { chases: ["cat"] },
  cat: { obeys: false },
};

function sizeOf(row: PublishedRow): SizeClass | "" {
  const size = row.size ?? "";
  return size === "small" || size === "medium" || size === "big" || size === "none" ? size : "";
}

/** Default traits from a row's tail columns. */
export function tailTraits(row: PublishedRow): Traits {
  const kind = row.kind ?? "";
  const shape = row.shape ?? "";
  const rawSize = sizeOf(row);
  const substance = rawSize === "none";
  const physical = (rawSize !== "" && rawSize !== "none") || (rawSize === "" && BODY_KINDS.has(kind)) || (substance && (kind === "nature" || kind === "food"));
  const size: SizeClass = substance ? "none" : rawSize === "" ? "medium" : rawSize;
  const animate = kind === "creature" || kind === "person";
  const place = kind === "place";
  const container = physical && !substance && shape === "holds" && CONTAINER_KINDS.has(kind);
  return {
    physical,
    size,
    animate,
    person: kind === "person",
    edible: physical && kind === "food" && shape !== "holds",
    drinkable: physical && kind === "food" && shape === "holds" && substance,
    container,
    openable: container,
    enterable: place && shape === "holds",
    portable: physical && !animate && !place && !substance && size !== "big",
    blocks: physical && size === "big",
    pours: substance && kind === "nature" && shape === "holds",
    flammable: physical && kind === "nature" && !substance,
    grows: physical && ((kind === "nature" && shape === "order") || kind === "creature"),
    harmful: shape === "takes-away",
    path: shape === "order",
    obeys: animate,
    chases: [],
    quenches: false,
  };
}

const BODILESS: Traits = {
  physical: false,
  size: "none",
  animate: false,
  person: false,
  edible: false,
  drinkable: false,
  container: false,
  openable: false,
  enterable: false,
  portable: false,
  blocks: false,
  pours: false,
  flammable: false,
  grows: false,
  harmful: false,
  path: false,
  obeys: false,
  chases: [],
  quenches: false,
};

/** Traits of a root: its tail defaults, then its override. Unpublished roots (compounds) have no body yet. */
export function traitsOf(root: string, lex: GameLexicon): Traits {
  const row = lex.row(root);
  if (!row) return BODILESS;
  return { ...tailTraits(row), ...OVERRIDES[row.concrete] };
}
