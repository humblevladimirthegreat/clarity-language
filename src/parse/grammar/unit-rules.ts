/** Sentence-parser rules for a clause's unit chain and its variants, hook chains, islands and citations. */

import { Citation, IslandClose, IslandOpen } from "../tokens.js";
import {
  LIST_ENDS,
  type ChainState,
  type ListEnd,
  type NpSlot,
  type ParserRule,
  type UnitEnd,
} from "../sentence-shapes.js";
import type { GrammarParser } from "../sentence-grammar.js";
import { npSet } from "./np-rules.js";
import { npPackageBody } from "./package-rules.js";

export function defineUnitRules(p: GrammarParser): void {
  /**
   * A clause's units, as a chain: each unit rule holds one unit and the rest of the clause (labeled `unit`), read by
   * {@link chainUnits}. The rule for what may follow depends on the unit before (clause.md, joins.md):
   * - Two noun phrases of one slot, or two verb phrases, never stand side by side; more than one goes in a join.
   *   A forward stand-in ends its phrase, so the next sentence may open with a noun of that slot.
   * - A joined `/ɡ/` or `/h/` list takes every adjective or adverb right before its join, so no list follows
   *   another `/ɡ/` or `/h/` unit. Unjoined adjectives and adverbs are separate units.
   * - A plain adjective describes the word before it (clause.md#adjectives-ɡ). So after a unit that ends **open**
   *   (a noun and its adjectives, a list's join, a hosted `/b/` that adjectives describe), no unit starts with a plain
   *   adjective: that adjective would describe the unit. Only a `/ɡ/` list that opens with its join word, or a
   *   respectively list, follows there (`*Open` rules).
   * - After a list whose join shares an adjective (`*Shared` rules), a respectively `/ɡ/` list does not follow: its
   *   adjectives start right at the join, so the first one is not shared (list-structure.md#respectively).
   */
  p.unit = unitChainRule(p, "unit", "start", "closed");

  /** The first clause item after a cross-period join: a unit chain that does not open with a hook. */
  p.unitAfterCross = unitChainRule(p, "unitAfterCross", "start", "closed", "none");

  /** The first unit of a body that may not open with a plain hook (see {@link sentence}), or a plain adjective either. */
  p.unitNoGlue = unitChainRule(p, "unitNoGlue", "start", "closed", "hosting");

  p.unitAfterTurn = unitChainRule(p, "unitAfterTurn", "start", "open", "hosting");

  p.unitOpen = unitChainRule(p, "unitOpen", "start", "open");

  p.unitAfterZ = unitChainRule(p, "unitAfterZ", "z", "closed");

  p.unitAfterZOpen = unitChainRule(p, "unitAfterZOpen", "z", "open");

  p.unitAfterZShared = unitChainRule(p, "unitAfterZShared", "z", "shared");

  p.unitAfterZBare = unitChainRule(p, "unitAfterZBare", "z", "bare");

  p.unitAfterD = unitChainRule(p, "unitAfterD", "d", "closed");

  p.unitAfterDOpen = unitChainRule(p, "unitAfterDOpen", "d", "open");

  p.unitAfterDShared = unitChainRule(p, "unitAfterDShared", "d", "shared");

  p.unitAfterDBare = unitChainRule(p, "unitAfterDBare", "d", "bare");

  p.unitAfterB = unitChainRule(p, "unitAfterB", "b", "closed");

  p.unitAfterBOpen = unitChainRule(p, "unitAfterBOpen", "b", "open");

  p.unitAfterBShared = unitChainRule(p, "unitAfterBShared", "b", "shared");

  p.unitAfterBBare = unitChainRule(p, "unitAfterBBare", "b", "bare");

  p.unitAfterZFree = unitChainRule(p, "unitAfterZFree", "zFree", "closed");

  p.unitAfterZFreeOpen = unitChainRule(p, "unitAfterZFreeOpen", "zFree", "open");

  p.unitAfterZFreeShared = unitChainRule(p, "unitAfterZFreeShared", "zFree", "shared");

  p.unitAfterZFreeBare = unitChainRule(p, "unitAfterZFreeBare", "zFree", "bare");

  p.unitAfterDFree = unitChainRule(p, "unitAfterDFree", "dFree", "closed");

  p.unitAfterDFreeOpen = unitChainRule(p, "unitAfterDFreeOpen", "dFree", "open");

  p.unitAfterDFreeShared = unitChainRule(p, "unitAfterDFreeShared", "dFree", "shared");

  p.unitAfterDFreeBare = unitChainRule(p, "unitAfterDFreeBare", "dFree", "bare");

  p.unitAfterBFree = unitChainRule(p, "unitAfterBFree", "bFree", "closed");

  p.unitAfterBFreeOpen = unitChainRule(p, "unitAfterBFreeOpen", "bFree", "open");

  p.unitAfterBFreeShared = unitChainRule(p, "unitAfterBFreeShared", "bFree", "shared");

  p.unitAfterBFreeBare = unitChainRule(p, "unitAfterBFreeBare", "bFree", "bare");

  p.unitAfterV = unitChainRule(p, "unitAfterV", "v", "closed");

  p.unitAfterVOpen = unitChainRule(p, "unitAfterVOpen", "v", "open");

  p.unitAfterG = unitChainRule(p, "unitAfterG", "g", "closed");

  p.unitAfterGOpen = unitChainRule(p, "unitAfterGOpen", "g", "open");

  p.unitAfterH = unitChainRule(p, "unitAfterH", "h", "closed");

  p.unitAfterHOpen = unitChainRule(p, "unitAfterHOpen", "h", "open");

  /** A unit chain that starts with a hook (read by {@link chainUnits} like any `unit` rule). */
  p.hookChain = unitChainRule(p, "hookChain", "start", "closed", "only");

  p.islandUnit = p.RULE("islandUnit", () => {
    p.CONSUME(IslandOpen);
    p.OPTION(() => p.SUBRULE(p.unit));
    p.CONSUME(IslandClose);
  });

  /**
   * A word with no role letter, with what describes it (`ohun galuden`, word-endings.md#citation-forms). It fills no
   * slot, so it is never a clause unit: it stands as a whole sentence ({@link sentence}).
   */
  p.citation = p.RULE("citation", () => {
    npPackageBody(p, [{ type: Citation, label: "Citation" }], { gl: p.glPackageCitation });
  });
}

function unitChain(p: GrammarParser, state: ChainState, end: UnitEnd): ParserRule {
  const rules: Record<UnitEnd, Partial<Record<ChainState, ParserRule>>> = {
    closed: {
      start: p.unit,
      z: p.unitAfterZ,
      d: p.unitAfterD,
      b: p.unitAfterB,
      v: p.unitAfterV,
      g: p.unitAfterG,
      h: p.unitAfterH,
      zFree: p.unitAfterZFree,
      dFree: p.unitAfterDFree,
      bFree: p.unitAfterBFree,
    },
    open: {
      start: p.unitOpen,
      v: p.unitAfterVOpen,
      z: p.unitAfterZOpen,
      d: p.unitAfterDOpen,
      b: p.unitAfterBOpen,
      g: p.unitAfterGOpen,
      h: p.unitAfterHOpen,
      zFree: p.unitAfterZFreeOpen,
      dFree: p.unitAfterDFreeOpen,
      bFree: p.unitAfterBFreeOpen,
    },
    shared: {
      z: p.unitAfterZShared,
      d: p.unitAfterDShared,
      b: p.unitAfterBShared,
      zFree: p.unitAfterZFreeShared,
      dFree: p.unitAfterDFreeShared,
      bFree: p.unitAfterBFreeShared,
    },
    bare: {
      z: p.unitAfterZBare,
      d: p.unitAfterDBare,
      b: p.unitAfterBBare,
      zFree: p.unitAfterZFreeBare,
      dFree: p.unitAfterDFreeBare,
      bFree: p.unitAfterBFreeBare,
    },
  };
  return rules[end][state]!;
}

/**
 * Every kind of unit: its rule, the CST label builders read it by, the state it leaves the chain in, and how it
 * ends (see the `unit` rules). `after` lists the endings of the unit before that a kind may follow, when not all of
 * them. The grammar is LR(1) (`npm run grammar-check`), so the order of the kinds chooses nothing.
 */
function unitKinds(p: GrammarParser): {
  rule: ParserRule;
  label: string;
  state: ChainState;
  end: UnitEnd;
  kind: ChainState | "list";
  after?: UnitEnd[];
  /** At the `…Free` state of its slot, a kind that may open with a bare tag (`never`), or its form that does not (`only`). */
  free?: "only" | "never";
}[] {
  const np = (level: NpSlot) => {
    const r = npSet(p, level);
    const unit = { label: `${level}Coord`, kind: level };
    const end = (listEnd: ListEnd) => listEnd.replace(/^Grounds/, "").toLowerCase() as UnitEnd;
    // A list whose last bar hosts `barl` ends the main clause, so the chain goes on as at the start (`…Free`).
    const lists = (start: "First" | "Free") =>
      LIST_ENDS.map((listEnd) => ({
        ...unit,
        rule: r.list[start][listEnd],
        state: listEnd.startsWith("Grounds") ? (`${level}Free` as const) : level,
        end: end(listEnd),
        free: start === "Free" ? ("only" as const) : ("never" as const),
      }));
    return [
      ...lists("First"),
      ...lists("Free"),
      { ...unit, rule: r.nounTagged, state: level, end: "closed" as const },
      { ...unit, rule: r.noun, state: level, end: "open" as const },
      { ...unit, rule: r.tag, state: level, end: "open" as const, free: "never" as const },
      { ...unit, rule: r.standInTagged, state: "start" as const, end: "closed" as const },
      { ...unit, rule: r.standIn, state: `${level}Free` as const, end: "open" as const },
    ];
  };
  const notOpen: UnitEnd[] = ["closed", "shared"];
  return [
    { rule: p.islandUnit, label: "islandUnit", state: "start", end: "closed", kind: "start" },
    ...np("z"),
    ...np("d"),
    ...np("b"),
    { rule: p.vpCoord, label: "vpCoord", state: "v", end: "closed", kind: "v" },
    { rule: p.vpCoordOpen, label: "vpCoord", state: "v", end: "open", kind: "v" },
    { rule: p.vpVerb, label: "vpCoord", state: "v", end: "closed", kind: "v" },
    { rule: p.gCoord, label: "gCoord", state: "g", end: "closed", kind: "g", after: ["closed"] },
    { rule: p.gCoordPlainLead, label: "gCoord", state: "g", end: "closed", kind: "g", after: ["shared"] },
    { rule: p.gCoordLead, label: "gCoord", state: "g", end: "closed", kind: "g", after: ["bare"] },
    { rule: p.gCoordJoinLead, label: "gCoord", state: "g", end: "closed", kind: "g", after: ["open"] },
    { rule: p.gSingleClosed, label: "gCoord", state: "g", end: "closed", kind: "list", after: notOpen },
    { rule: p.gSingleOpen, label: "gCoord", state: "g", end: "open", kind: "list", after: notOpen },
    { rule: p.hCoord, label: "hCoord", state: "h", end: "closed", kind: "h" },
    { rule: p.hSingleClosed, label: "hCoord", state: "h", end: "closed", kind: "list" },
    { rule: p.hSingleOpen, label: "hCoord", state: "h", end: "open", kind: "list" },
    { rule: p.hGrounds, label: "hCoord", state: "start", end: "closed", kind: "list" },
    { rule: p.hookUnitPlain, label: "hookUnit", state: "start", end: "closed", kind: "start" },
    { rule: p.hookUnitClosed, label: "hookUnit", state: "start", end: "closed", kind: "start" },
    { rule: p.hookUnitOpen, label: "hookUnit", state: "start", end: "open", kind: "start" },
    { rule: p.sameRolePair, label: "sameRolePair", state: "start", end: "closed", kind: "start" },
  ];
}

/**
 * `hooks`: which hook units may start the chain (`hosting`: only one with a `/b/` or zone right after the hook;
 * `only`: the chain starts with a hook).
 */
function unitChainRule(p: GrammarParser, name: string, state: ChainState, end: UnitEnd, hooks: "all" | "none" | "hosting" | "only" = "all") {
  return p.RULE(name, () => {
    const free = state.endsWith("Free");
    const kinds = unitKinds(p).filter(
      (kind) =>
        (state === "start" || free || kind.kind !== state) &&
        (`${kind.kind}Free` === state ? kind.free !== "never" : kind.free !== "only") &&
        (!kind.after || kind.after.includes(end)) &&
        (hooks !== "only" || kind.label === "hookUnit") &&
        !(kind.label === "hookUnit" && (hooks === "none" || (hooks === "hosting" && kind.rule === p.hookUnitPlain))),
    );
    p.or(
      1,
      kinds.map((kind, i) => ({
        ALT: () => {
          p.subrule(i + 1, kind.rule, { LABEL: kind.label });
          p.option(i + 1, () => {
            p.subrule(i + 1, unitChain(p, kind.state, kind.end), { LABEL: "unit" });
          });
        },
      })),
    );
  });
}
