/** Sentence-parser rules for noun phrases: one set per slot, their lists, parts and join closes. */

import { B, HostedB, Factor, HScale, BScale, FenceBar, ItemHook, WBefore } from "../tokens.js";
import {
  CLOSE_ENDS,
  LIST_ENDS,
  NP_HEAD,
  NP_JOIN,
  NP_W_TARGET,
  PART_ENDS,
  type ChainState,
  type CloseEnd,
  type ListEnd,
  type NpSlot,
  type ParserRule,
  type PartEnd,
  type PartStart,
} from "../sentence-shapes.js";
import type { GrammarParser } from "../sentence-grammar.js";
import { npPackageRule } from "./package-rules.js";

export function defineNpRules(p: GrammarParser): void {
  /**
   * Noun-phrase lists and phrases, one set of rules per slot (`/z/`, `/d/`, `/b/`), from {@link npRules}. The shape is
   * the same at each slot; only the head and join tokens differ, so a phrase can only be read at the slot its words carry.
   */
  p.npSets = { z: npRules(p, "z"), d: npRules(p, "d"), b: npRules(p, "b") };
}

export function npSet(p: GrammarParser, level: NpSlot) {
  return p.npSets[level];
}

/**
 * One slot's rules. A list is one or more parts, each closed by its join; it ends as its last part does (see the
 * `unit` rules), and in a `Grounds` list the last part's bar hosts `barl`, so the main clause ends with the list and the
 * next sentence is the grounds (bars.md#bars). The parts after the first come as a right-recursive rest
 * (read back by `npPartNodes`), so a part's end is known before deciding whether more follow:
 * - After a part a group tag closes (`Tagged`), the next part may open with a new tag (`zwal zodogal zam`); after any
 *   other part it may not: a tag right after a join names the whole list (tag-pronouns.md#naming-with-a-tag).
 * - A part that opens with a bar ({@link FenceBar}) follows a closed `ua` fence, so it is never the first part.
 */
export function npRules(p: GrammarParser, level: NpSlot) {
  const starts = ["First", "Rest", "Free"] as const;
  const rules = {
    close: Object.fromEntries(CLOSE_ENDS.map((end) => [end, npJoinCloseRule(p, level, end)])) as Record<CloseEnd, ParserRule>,
    part: Object.fromEntries(
      starts.map((start) => [start, Object.fromEntries(PART_ENDS.map((end) => [end, npCoordPartRule(p, level, start, end)]))]),
    ) as Record<PartStart, Record<PartEnd, ParserRule>>,
    list: Object.fromEntries(
      starts.map((start) => [start, Object.fromEntries(LIST_ENDS.map((end) => [end, npCoordRule(p, level, start, end)]))]),
    ) as Record<PartStart, Record<ListEnd, ParserRule>>,
    pkg: npPackageRule(p, level, "Package"),
    noun: npPackageRule(p, level, "Noun"),
    nounTagged: npPackageRule(p, level, "NounTagged"),
    standIn: npPackageRule(p, level, "StandIn"),
    standInTagged: npPackageRule(p, level, "StandInTagged"),
    tag: npPackageRule(p, level, "Tag"),
  };
  return {
    ...rules,
    coordClosed: rules.list.First.Closed,
    coordShared: rules.list.First.Shared,
    coordOpen: rules.list.First.Open,
    coordBare: rules.list.First.Bare,
  };
}

/**
 * A list (`First`), the rest of one after an untagged part (`Rest`), or a list that does not open with a tag (`Free`,
 * see {@link ChainState}), ending as `end`: one part that is the last, or a part and the rest after it.
 */
function npCoordRule(p: GrammarParser, level: NpSlot, start: PartStart, end: ListEnd) {
  return p.RULE(`${level}Coord${start === "First" ? "" : start}${end}`, () => {
    const { part, list } = npSet(p, level);
    const parts = part[start];
    const label = { LABEL: `${level}CoordPart` };
    const lastEnds = end === "Closed" ? (["Closed", "Tagged"] as const) : end === "GroundsClosed" ? (["GroundsClosed", "GroundsTagged"] as const) : ([end] as const);
    p.or(1, [
      ...lastEnds.map((last, i) => ({ ALT: () => p.subrule(i + 1, parts[last], label) })),
      ...(["Bare", "Open", "Shared", "Closed", "Tagged"] as const).map((mid, i) => ({
        ALT: () => {
          p.subrule(i + 20, parts[mid], label);
          // After a group tag the rest starts as a list does; after any other part, as `Rest`.
          p.subrule(i + 30, list[mid === "Tagged" ? "First" : "Rest"][end], label);
        },
      })),
    ]);
  });
}

/**
 * One part of a list: items, then any bars, then the join, then a tag naming the list. `start`: a list's first part,
 * or one after a group tag (`First`: it may open with a new tag), one after any other part (`Rest`: it may open with
 * a {@link FenceBar}), or the first part of a list that may not open with a tag (`Free`). `end`: as its join (see
 * {@link npJoinCloseRule}), `Tagged` when a group tag closes it; `Grounds…` when its last bar hosts `barl`.
 */
function npCoordPartRule(p: GrammarParser, level: NpSlot, start: PartStart, end: PartEnd) {
  return p.RULE(`${level}CoordPart${start === "First" ? "" : start}${end}`, () => {
    const { pkg, tag, close } = npSet(p, level);
    const groupTag = NP_HEAD[level].tag;
    const grounds = end.startsWith("Grounds");
    const shape = end.replace(/^Grounds/, "") as CloseEnd | "Tagged";
    // The join and a tag **-l** right after it, which names the whole list (`zodogal zagadul zam zwal`, tag-pronouns.md#naming-with-a-tag).
    const ending = (k: number, label: string) => {
      if (shape !== "Tagged") {
        p.subrule(k, close[shape], { LABEL: label });
        return;
      }
      p.or(k + 20, CLOSE_ENDS.map((c) => ({ ALT: () => p.subrule(k, close[c], { LABEL: label }) })));
      p.consume(k + 30, groupTag, { LABEL: "groupTag" });
    };
    // Items, then any bars, then the join; `k` keeps each alternative's DSL calls distinct.
    const items = (k: number, first: () => void) => {
      first();
      p.many(k, () => p.subrule(k, pkg, { LABEL: "npConjunct" }));
      // A hook + `/b/` right before the join word, or before a rank fence's bar, belongs to the last item (joins.md § SHARED after the join).
      p.option(k, () => {
        p.consume(k, ItemHook, { LABEL: "itemHook" });
        p.consume(k, B, { LABEL: "itemHookBound" });
      });
      // A stance word before a rank join is the comparee: the bar (comparatives.md § bars). A CLUES or PATTERN bar
      // may host `barl`: the next sentence is the grounds (bars.md#bars).
      if (grounds) p.subrule(k, p.barsGrounds, { LABEL: "bar" });
      else p.many(k + 1, () => p.subrule(k, p.barUnit, { LABEL: "bar" }));
      ending(k, "npJoinClose");
    };
    const alts: { ALT: () => void }[] = [
      { ALT: () => items(7, () => p.SUBRULE(pkg, { LABEL: "npConjunct" })) },
    ];
    // A new tag listed with other items goes first (`zwal zodogal zam`, tag-pronouns.md#naming-with-a-tag).
    if (start === "First") alts.push({ ALT: () => items(5, () => p.SUBRULE(tag, { LABEL: "npConjunct" })) });
    if (!grounds) alts.push({ ALT: () => ending(1, "standaloneJoin") });
    if (start === "Rest" && !grounds) {
      // A bar right after a closed `ua` fence (`zuam gagadul thobam zel …`): the whole fence is the one ranked item,
      // nested by right-close (comparatives.md § every bar, joins.md § fence nesting).
      alts.push({
        ALT: () => {
          p.SUBRULE2(p.fenceBarUnit, { LABEL: "bar" });
          p.MANY3(() => {
            p.SUBRULE3(p.barUnit, { LABEL: "bar" });
          });
          ending(3, "npJoinClose");
        },
      });
    }
    if (alts.length === 1) alts[0]!.ALT();
    else p.OR(alts);
  });
}

/**
 * A list's join word, and what the join shares (list-structure.md#shared-after-the-join): an adjective after any join, a
 * scale after a rank join ({@link HScale}, {@link BScale}), then the factor after an equative's scale. `Bare`: nothing
 * shared; `Open`: an adjective or scale whose hosted `/b/` the adjectives after it describe; `Shared`: any other
 * adjective; `Closed`: a scale, or a factor.
 */
function npJoinCloseRule(p: GrammarParser, level: NpSlot, variant: CloseEnd) {
  return p.RULE(`${level}JoinClose${variant}`, () => {
    // A `/w/` right before the join word details the list (respectively `wazem`, joins.md § Respectively).
    p.MANY(() => {
      p.CONSUME(WBefore[NP_W_TARGET[level]], { LABEL: "W" });
    });
    p.CONSUME(NP_JOIN[level]);
    // A hooked join's landmark: the `bl-` word right after it (hooked-joins.md#hooked-joins).
    p.OPTION3(() => p.CONSUME3(HostedB, { LABEL: "joinLandmark" }));
    const label = { LABEL: "sharedAfterJoin" };
    if (variant === "Open") {
      p.OR([
        { ALT: () => p.SUBRULE(p.sharedAdjOpen, label) },
        { ALT: () => p.SUBRULE(p.sharedScaleOpen, label) },
      ]);
    } else if (variant === "Shared") {
      p.SUBRULE(p.sharedAdjClosed, label);
    } else if (variant === "Closed") {
      // Factor right after an equative's shared scale: `oe` + `h+2` = *twice as … as* (comparatives.md § factor).
      p.OR2([
        {
          ALT: () => {
            p.SUBRULE(p.sharedScale, label);
            p.OPTION2(() => p.CONSUME(Factor, { LABEL: "factor" }));
          },
        },
        {
          ALT: () => {
            p.SUBRULE2(p.sharedAdjClosed, label);
            p.CONSUME2(Factor, { LABEL: "factor" });
          },
        },
      ]);
    }
  });
}
