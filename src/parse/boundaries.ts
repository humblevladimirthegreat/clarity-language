/**
 * The boundary table (interpreter.md#boundaries): for each kind of nested reading, what passes into it from the
 * reading around it. Each cell cites the section that states it; a cell no page states is `unstated` and keeps what the
 * code does today, which it names.
 *
 * How a cell that passes reaches the nested reading:
 * - `copy`: the nested clause's scope record holds the outer frame, ordered against its own (`clauseScopes`).
 * - `nesting`: the nested reading sits inside the outer one, so the outer frame covers it through the tree (reader rule 2,
 *   interpreter.md#reader-rules); nothing is copied.
 * - `link`: through a link, as the grounds link carries a `blarl` sentence into its frame.
 * - `resolve`: the resolve stage's walk keeps it open across the boundary (a bound-tag reach).
 * - `sentence`: the nested reading is a sentence of its own, and the rule for sentences applies to it.
 */

/** The kinds of nested reading. */
export type NestedKind = "member" | "standInDependent" | "slotDependent" | "grounds" | "island" | "quote" | "aside";

/** What might pass into a nested reading. */
export type BoundaryColumn = "outerFrames" | "holder" | "carryStart" | "carryEnd" | "carried" | "binder" | "boundTag" | "tone";

export type BoundaryVia = "copy" | "nesting" | "link" | "resolve" | "sentence";

export type BoundaryCell =
  | { verdict: "passes"; via: BoundaryVia; anchor: string; today?: "blocks" }
  | { verdict: "blocks"; anchor: string; today?: never }
  | { verdict: "unstated"; anchor: ""; today: "passes"; via: BoundaryVia }
  | { verdict: "unstated"; anchor: ""; today: "blocks" };

export type BoundaryRow = { kind: NestedKind; what: string; cells: Record<BoundaryColumn, BoundaryCell> };

export const NESTED_KINDS: readonly NestedKind[] = ["member", "standInDependent", "slotDependent", "grounds", "island", "quote", "aside"];

export const BOUNDARY_COLUMNS: Readonly<Record<BoundaryColumn, string>> = {
  outerFrames: "the outer clause's whole-clause frames, the turn's edge frames among them",
  holder: "the outer clause's holder",
  carryStart: "a channel, NOTIONAL or holder inside starts a carried frame",
  carryEnd: "a new frame inside ends a carried frame",
  carried: "a carried frame on the sentence",
  binder: "a binder's reach (`zual`, a new member)",
  boundTag: "a bound tag's reach",
  tone: "a free-standing tone mark at the start of the sentence",
};

const CARRY = "evidentiality.md#carry-forward";
const HOLDER = "holder.md#what-the-holder-covers";
const UA = "joins.md#everything-ua";
const BOUND = "universals-domains.md#bound-tags";
const ISLANDS = "scope-islands.md#scope-islands";
const TONE = "tone-marks.md#showing-your-tone";
const QUOTE_TOPICS = "quote-contents.md#topic-quotes";
const ASIDES = "spans.md#asides-th";
const CLAUSE_JOINS = "joins.md#clause-joins";
const DEPENDENTS = "dependents.md#dependent-clauses";
const QUOTE_ACTS = "quote-contents.md#quote-acts";

const passes = (via: BoundaryVia, anchor: string): BoundaryCell => ({ verdict: "passes", via, anchor });
const blocks = (anchor: string): BoundaryCell => ({ verdict: "blocks", anchor });
const unstated = (today: "passes" | "blocks", via?: BoundaryVia): BoundaryCell =>
  today === "passes" ? { verdict: "unstated", anchor: "", today, via: via ?? "nesting" } : { verdict: "unstated", anchor: "", today };

/** The boundary table. */
export const BOUNDARIES: readonly BoundaryRow[] = [
  {
    kind: "member",
    what: "a clause-join member",
    cells: {
      outerFrames: passes("copy", CLAUSE_JOINS),
      holder: blocks(CLAUSE_JOINS),
      carryStart: blocks(CARRY),
      carryEnd: blocks(CARRY),
      carried: passes("nesting", CARRY),
      binder: passes("copy", UA),
      boundTag: passes("resolve", BOUND),
      tone: passes("copy", TONE),
    },
  },
  {
    kind: "standInDependent",
    what: "a dependent a stand-in names",
    cells: {
      outerFrames: blocks(DEPENDENTS),
      holder: passes("nesting", HOLDER),
      carryStart: blocks(CARRY),
      carryEnd: blocks(CARRY),
      carried: passes("nesting", CARRY),
      binder: passes("nesting", UA),
      boundTag: passes("resolve", BOUND),
      tone: passes("nesting", TONE),
    },
  },
  {
    kind: "slotDependent",
    what: "a dependent in a slot (an `/h/` stand-in or `Odo` slot)",
    cells: {
      outerFrames: blocks(DEPENDENTS),
      holder: passes("nesting", HOLDER),
      carryStart: blocks(CARRY),
      carryEnd: blocks(CARRY),
      carried: passes("nesting", CARRY),
      binder: passes("nesting", UA),
      boundTag: passes("resolve", BOUND),
      tone: passes("nesting", TONE),
    },
  },
  {
    kind: "grounds",
    what: "the `blarl` grounds: the next sentence, a frame's content",
    cells: {
      outerFrames: unstated("blocks"),
      holder: passes("link", HOLDER),
      carryStart: unstated("passes", "sentence"),
      carryEnd: unstated("passes", "sentence"),
      carried: unstated("passes", "sentence"),
      binder: passes("link", UA),
      boundTag: passes("resolve", BOUND),
      tone: unstated("blocks"),
    },
  },
  {
    kind: "island",
    what: "a scope island or a verb-list item with words of its own",
    cells: {
      outerFrames: passes("nesting", ISLANDS),
      holder: passes("nesting", HOLDER),
      carryStart: blocks(ISLANDS),
      carryEnd: blocks(ISLANDS),
      carried: passes("nesting", CARRY),
      binder: passes("nesting", UA),
      boundTag: passes("resolve", BOUND),
      tone: passes("nesting", TONE),
    },
  },
  {
    kind: "quote",
    what: "a cite (`[…]`)",
    cells: {
      outerFrames: blocks(QUOTE_ACTS),
      holder: blocks(QUOTE_ACTS),
      carryStart: blocks(CARRY),
      carryEnd: blocks(CARRY),
      carried: blocks(CARRY),
      binder: blocks(QUOTE_ACTS),
      boundTag: blocks(QUOTE_TOPICS),
      tone: blocks(TONE),
    },
  },
  {
    kind: "aside",
    what: "an aside (`(…)`)",
    cells: {
      outerFrames: blocks(ASIDES),
      holder: blocks(ASIDES),
      carryStart: blocks(ASIDES),
      carryEnd: blocks(CARRY),
      carried: blocks(ASIDES),
      binder: blocks(ASIDES),
      boundTag: blocks(ASIDES),
      tone: blocks(ASIDES),
    },
  },
];

const BY_KIND = new Map(BOUNDARIES.map((row) => [row.kind, row]));

export function boundaryCell(kind: NestedKind, column: BoundaryColumn): BoundaryCell {
  return BY_KIND.get(kind)!.cells[column];
}

/** What the code does at a cell: a stated cell's `today` where it differs, else the verdict; an unstated cell's `today`. */
export function todayOf(cell: BoundaryCell): "passes" | "blocks" {
  return cell.today ?? (cell.verdict === "passes" ? "passes" : "blocks");
}

/** Whether the code lets `column` pass into a `kind` reading by `via` (an unstated cell keeps today's behavior). */
export function crosses(kind: NestedKind, column: BoundaryColumn, via: BoundaryVia): boolean {
  const cell = boundaryCell(kind, column);
  return todayOf(cell) === "passes" && "via" in cell && cell.via === via;
}

/** A cell's label: `passes`, `blocks`, `unstated (today: …)`, or `passes (today: blocks)`. */
export function cellLabel(cell: BoundaryCell): string {
  if (cell.verdict === "unstated") return `unstated (today: ${cell.today})`;
  return cell.today ? `${cell.verdict} (today: ${cell.today})` : cell.verdict;
}

/** Every cell with its row and column, in table order. */
export function boundaryCells(): { kind: NestedKind; column: BoundaryColumn; cell: BoundaryCell }[] {
  return BOUNDARIES.flatMap((row) => (Object.keys(BOUNDARY_COLUMNS) as BoundaryColumn[]).map((column) => ({ kind: row.kind, column, cell: row.cells[column] })));
}
