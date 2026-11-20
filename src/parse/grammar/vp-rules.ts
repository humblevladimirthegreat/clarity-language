/** Sentence-parser rules for verb phrases: verb lists and parts, verb items, and verb join closes. */

import type { TokenType } from "chevrotain";
import {
  B,
  HostedB,
  JoinV,
  V,
  VPlainEnd,
  VPlainMore,
  VContEnd,
  VContMore,
  JoinVEnd,
  JoinVMore,
  W,
  WBefore,
} from "../tokens.js";
import type { GrammarParser } from "../sentence-grammar.js";
import { npSet } from "./np-rules.js";

export function defineVpRules(p: GrammarParser): void {
  /**
   * A verb list: parts, each closed by its `/v/` join. An item is a verb and the `/h/`, `/d/` and `/b/` words before it,
   * so an item ends at its verb; the first item is a bare verb, since words before every verb are the clause's own and
   * cover every item (verb-and-stance-joins.md#vp-clause-forms). A verb or join marked `…More` has another verb after its
   * item words ({@link VPlainMore}), so the list goes on past it; one marked `…End` ends its part, or the list.
   *
   * The parts after the first come as a right-recursive tail (read back by `vpPartNodes`): after a join that another
   * verb follows, a part with verbs; after any other join, a lone join word as a part of its own, or nothing.
   */
  p.vpCoord = vpCoordRule(p, "vpCoord", "Closed");

  p.vpCoordOpen = vpCoordRule(p, "vpCoordOpen", "Open");

  p.vpTailAfterEndClosed = vpTailRule(p, "vpTailAfterEndClosed", "alone", "Closed");

  p.vpTailAfterEndOpen = vpTailRule(p, "vpTailAfterEndOpen", "alone", "Open");

  p.vpTailAfterMoreClosed = vpTailRule(p, "vpTailAfterMoreClosed", "later", "Closed");

  p.vpTailAfterMoreOpen = vpTailRule(p, "vpTailAfterMoreOpen", "later", "Open");

  /**
   * One part of a verb list, by where it stands (`First`, a lone join word `Alone`, or later) and its join: `More` when
   * another verb comes after it, else `End`, which shares an `Open` adverb or none or a `Closed` one.
   */
  p.vpCoordPartFirstEndOpen = vpCoordPartRule(p, "vpCoordPartFirstEndOpen", "first", "EndOpen");

  p.vpCoordPartFirstEndClosed = vpCoordPartRule(p, "vpCoordPartFirstEndClosed", "first", "EndClosed");

  p.vpCoordPartFirstMore = vpCoordPartRule(p, "vpCoordPartFirstMore", "first", "More");

  p.vpCoordPartAloneEndOpen = vpCoordPartRule(p, "vpCoordPartAloneEndOpen", "alone", "EndOpen");

  p.vpCoordPartAloneEndClosed = vpCoordPartRule(p, "vpCoordPartAloneEndClosed", "alone", "EndClosed");

  p.vpCoordPartAloneMore = vpCoordPartRule(p, "vpCoordPartAloneMore", "alone", "More");

  p.vpCoordPartEndOpen = vpCoordPartRule(p, "vpCoordPartEndOpen", "later", "EndOpen");

  p.vpCoordPartEndClosed = vpCoordPartRule(p, "vpCoordPartEndClosed", "later", "EndClosed");

  p.vpCoordPartMore = vpCoordPartRule(p, "vpCoordPartMore", "later", "More");

  /**
   * A verb with no join: one verb, and the `/b/` a pair-reach verb hosts. A {@link VCont} is never a lone verb: a second
   * verb in the clause takes a join (joins.md#right-close).
   */
  p.vpVerb = p.RULE("vpVerb", () => {
    p.CONSUME(VPlainEnd, { LABEL: "V" });
    p.OPTION(() => {
      p.CONSUME(HostedB, { LABEL: "B" });
    });
  });

  /**
   * The `/d/`, `/b/` and `/h/` units of a verb's item, as a chain like the clause's (read back by `vpItemNodes`): no
   * two noun phrases of one slot side by side, and no `/h/` list after another `/h/` unit.
   */
  p.vpItemsStart = vpItemsRule(p, "vpItemsStart", "start");

  p.vpItemsAfterD = vpItemsRule(p, "vpItemsAfterD", "d");

  p.vpItemsAfterB = vpItemsRule(p, "vpItemsAfterB", "b");

  p.vpItemsAfterH = vpItemsRule(p, "vpItemsAfterH", "h");

  p.vpItemsAfterHook = vpItemsRule(p, "vpItemsAfterHook", "hook");

  /** A `/d/` or `/b/` phrase in a verb's item: a list ending any way, or one noun. */
  p.vpItemUnitD = vpItemNpRule(p, "vpItemUnitD", "d");

  p.vpItemUnitB = vpItemNpRule(p, "vpItemUnitB", "b");

  p.vpItemUnitH = p.RULE("vpItemUnitH", () => {
    p.OR([
      { ALT: () => p.SUBRULE(p.hCoord) },
      { ALT: () => p.SUBRULE(p.hSingle, { LABEL: "hCoord" }) },
    ]);
  });

  /** A hook in a verb's item: an extra-noun hook, whose `/b/` comes next as its own unit (hooks.md#extra-noun). */
  p.vpItemUnitHook = p.RULE("vpItemUnitHook", () => {
    p.SUBRULE(p.hookUnitClosed, { LABEL: "hookUnit" });
  });

  p.vpItemUnitHSingle = p.RULE("vpItemUnitHSingle", () => {
    p.SUBRULE(p.hSingle, { LABEL: "hCoord" });
  });

  /**
   * A `/v/` join word that another verb follows (`More`), or that ends its part (`End`): sharing an adverb whose hosted
   * `/b/` the adjectives after it describe (`EndOpen`), or no adverb or any other (`EndClosed`).
   */
  p.vJoinCloseEndOpen = vJoinCloseRule(p, "vJoinCloseEndOpen", JoinVEnd, "open");

  p.vJoinCloseEndClosed = vJoinCloseRule(p, "vJoinCloseEndClosed", JoinVEnd, "closed");

  p.vJoinCloseMore = vJoinCloseRule(p, "vJoinCloseMore", JoinVMore, "any");
}

/** A verb list that ends `Open` (its last join shares an adverb whose hosted `/b/` adjectives describe) or `Closed`. */
function vpCoordRule(p: GrammarParser, name: string, end: "Open" | "Closed") {
  return p.RULE(name, () => vpParts(p, "first", end));
}

/** The parts after a join: lone join words after an `End` join (`alone`), parts with verbs after a `More` one (`later`). */
function vpTailRule(p: GrammarParser, name: string, at: "alone" | "later", end: "Open" | "Closed") {
  return p.RULE(name, () => vpParts(p, at, end));
}

/**
 * One part, then the rest of the list: the part is the last one (its join `End`, sharing as the list ends), or the
 * tail goes on, after an `End` join with lone join words and after a `More` join with a part with verbs.
 */
function vpParts(p: GrammarParser, at: "first" | "alone" | "later", end: "Open" | "Closed"): void {
  const parts = {
    first: { EndOpen: p.vpCoordPartFirstEndOpen, EndClosed: p.vpCoordPartFirstEndClosed, More: p.vpCoordPartFirstMore },
    alone: { EndOpen: p.vpCoordPartAloneEndOpen, EndClosed: p.vpCoordPartAloneEndClosed, More: p.vpCoordPartAloneMore },
    later: { EndOpen: p.vpCoordPartEndOpen, EndClosed: p.vpCoordPartEndClosed, More: p.vpCoordPartMore },
  }[at];
  const afterEnd = end === "Open" ? p.vpTailAfterEndOpen : p.vpTailAfterEndClosed;
  const afterMore = end === "Open" ? p.vpTailAfterMoreOpen : p.vpTailAfterMoreClosed;
  p.OR([
    { ALT: () => p.SUBRULE(parts[`End${end}`], { LABEL: "vpCoordPart" }) },
    ...(["EndOpen", "EndClosed"] as const).map((close, i) => ({
      ALT: () => {
        p.subrule(i + 2, parts[close], { LABEL: "vpCoordPart" });
        p.subrule(i + 4, afterEnd, { LABEL: "vpCoordPart" });
      },
    })),
    {
      ALT: () => {
        p.SUBRULE6(parts.More, { LABEL: "vpCoordPart" });
        p.SUBRULE7(afterMore, { LABEL: "vpCoordPart" });
      },
    },
  ]);
}

function vpCoordPartRule(p: GrammarParser, name: string, at: "first" | "alone" | "later", close: "EndOpen" | "EndClosed" | "More") {
  return p.RULE(name, () => {
    const join = { EndOpen: p.vJoinCloseEndOpen, EndClosed: p.vJoinCloseEndClosed, More: p.vJoinCloseMore }[close];
    const alone = { ALT: () => p.SUBRULE(join, { LABEL: "standaloneJoin" }) };
    if (at === "alone") {
      alone.ALT();
      return;
    }
    // A verb, and the `/b/` a pair-reach verb hosts.
    const verb = (k: number, type: TokenType) => {
      p.consume(k, type, { LABEL: "V" });
      p.option(k, () => {
        p.consume(k, HostedB, { LABEL: "B" });
      });
    };
    const items = (k: number) => p.option(k + 10, () => p.subrule(k, p.vpItemsStart, { LABEL: "vpItemUnit" }));
    const verbs = {
      ALT: () => {
        const [end, more] = at === "first" ? [VPlainEnd, VPlainMore] : [VContEnd, VContMore];
        if (at === "later") items(1);
        p.or(2, [
          { ALT: () => verb(1, end) },
          {
            ALT: () => {
              // Each later verb comes after its item's `/h/`, `/d/` and `/b/` words; whether it is the last one shows at the verb.
              verb(2, more);
              items(3);
              p.MANY(() => {
                verb(3, VContMore);
                items(4);
              });
              verb(4, VContEnd);
            },
          },
        ]);
        p.SUBRULE2(join, { LABEL: "vJoinClose" });
      },
    };
    if (at === "first") p.OR([alone, verbs]);
    else verbs.ALT();
  });
}

function vpItemsRule(p: GrammarParser, name: string, state: "start" | "d" | "b" | "h" | "hook") {
  return p.RULE(name, () => {
    // A hook with its `/b/` (an extra noun) is item material too, so `ul b_9 oel b_17` before a verb is that verb's.
    const kinds = [
      { kind: "d", unit: p.vpItemUnitD, next: () => p.vpItemsAfterD },
      { kind: "b", unit: p.vpItemUnitB, next: () => p.vpItemsAfterB },
      { kind: "h", unit: state === "h" ? p.vpItemUnitHSingle : p.vpItemUnitH, next: () => p.vpItemsAfterH },
      { kind: "hook", unit: p.vpItemUnitHook, next: () => p.vpItemsAfterHook },
    ].filter((k) => k.kind !== state || k.kind === "h" || k.kind === "hook");
    p.or(
      1,
      kinds.map((k, i) => ({
        ALT: () => {
          p.subrule(i + 1, k.unit, { LABEL: "vpItemUnit" });
          p.option(i + 1, () => p.subrule(i + 11, k.next(), { LABEL: "vpItemUnit" }));
        },
      })),
    );
  });
}

function vpItemNpRule(p: GrammarParser, name: string, level: "d" | "b") {
  return p.RULE(name, () => {
    const r = npSet(p, level);
    const label = { LABEL: `${level}Coord` };
    p.OR(
      [r.coordClosed, r.coordShared, r.coordOpen, r.coordBare, r.noun].map((rule, i) => ({ ALT: () => p.subrule(i + 1, rule, label) })),
    );
  });
}

function vJoinCloseRule(p: GrammarParser, name: string, join: TokenType, shared: "open" | "closed" | "any") {
  return p.RULE(name, () => {
    // A `/w/` right before the join word is respectively `wazem` (joins.md § Respectively).
    p.MANY(() => {
      p.CONSUME(WBefore.JoinV, { LABEL: "W" });
    });
    p.CONSUME(join, { LABEL: "JoinV" });
    // Only a shared /h/ follows a verb join (it covers every verb); a /ɡ/ there is not shared, and a /th/ there is on the claim.
    const adverb = { open: p.sharedAdverbOpen, closed: p.sharedAdverbClosed, any: p.sharedAdverb }[shared];
    if (shared === "open") p.SUBRULE(adverb, { LABEL: "sharedAfterJoin" });
    else p.OPTION(() => p.SUBRULE2(adverb, { LABEL: "sharedAfterJoin" }));
  });
}
