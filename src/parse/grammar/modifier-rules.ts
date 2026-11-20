/** Sentence-parser rules for `/ɡ/` and `/h/` lists, bars, stand-ins, hooks, zones and same-role pairs. */

import type { TokenType } from "chevrotain";
import {
  B,
  G,
  GInList,
  GInRespList,
  H,
  HostedBNoun,
  HostedBNumber,
  HostedBJoined,
  HostedOdo,
  LateOdo,
  HPlain,
  HTh,
  HList,
  HLone,
  HPlainList,
  HPlainLone,
  HThList,
  HThLone,
  Amount,
  HZone,
  HZoneHeld,
  BarPlain,
  FenceBar,
  JoinD,
  JoinG,
  JoinH,
  JoinV,
  JoinZ,
  Odo,
  Hook,
  HookHosting,
  HookPlain,
  SameRolePair,
  W,
  WBefore,
  WLeaf,
} from "../tokens.js";
import type { GrammarParser } from "../sentence-grammar.js";

export function defineModifierRules(p: GrammarParser): void {
  p.gCoord = p.RULE("gCoord", () => {
    p.AT_LEAST_ONE(() => p.SUBRULE(p.gCoordPart));
  });

  /**
   * A `/ɡ/` list right after a noun join that shares nothing: its first part is a lone join word, or a respectively
   * list (`zalahen zal gelavam gamazam wazem gal`, list-structure.md#respectively). Any other first adjective would be shared.
   */
  p.gCoordLead = p.RULE("gCoordLead", () => {
    p.SUBRULE(p.gCoordPartLead, { LABEL: "gCoordPart" });
    p.MANY(() => p.SUBRULE(p.gCoordPart));
  });

  /** A `/ɡ/` list right after a word that plain adjectives describe: its first part is a lone join word. */
  p.gCoordJoinLead = p.RULE("gCoordJoinLead", () => {
    p.SUBRULE(p.gCoordPartJoin, { LABEL: "gCoordPart" });
    p.MANY(() => p.SUBRULE(p.gCoordPart));
  });

  /**
   * A `/ɡ/` list after a list that shares an adjective: its first part is not a respectively list, whose first
   * adjective would sit right after the noun join (list-structure.md#respectively).
   */
  p.gCoordPlainLead = p.RULE("gCoordPlainLead", () => {
    p.SUBRULE(p.gCoordPartPlain, { LABEL: "gCoordPart" });
    p.MANY(() => p.SUBRULE(p.gCoordPart));
  });

  /** One part of a `/ɡ/` list: its items and join (`plain`, `respectively`, or either), or a lone join word. */
  p.gCoordPart = gCoordPartRule(p, "gCoordPart", "any");

  p.gCoordPartPlain = gCoordPartRule(p, "gCoordPartPlain", "plain");

  p.gCoordPartLead = gCoordPartRule(p, "gCoordPartLead", "respectively");

  p.gCoordPartJoin = gCoordPartRule(p, "gCoordPartJoin", "none");

  /** An adjective with no join, as its own unit: one whose hosted `/b/` the adjectives after it describe (`Open`), or any other. */
  p.gSingleOpen = p.RULE("gSingleOpen", () => {
    p.SUBRULE(p.gLoneOpen, { LABEL: "gPackage" });
  });

  p.gSingleClosed = p.RULE("gSingleClosed", () => {
    p.SUBRULE(p.gLoneClosed, { LABEL: "gPackage" });
  });

  p.gJoinClose = p.RULE("gJoinClose", () => {
    // Nothing modifies a list of adjectives (a following /ɡ/ is its own unit); only respectively `wazem` sits before the join.
    p.MANY(() => {
      p.CONSUME(WLeaf.Plain.JoinG, { LABEL: "W" });
    });
    p.CONSUME(JoinG);
  });

  p.gJoinCloseRespectively = p.RULE("gJoinCloseRespectively", () => {
    p.CONSUME(WLeaf.Pairing.JoinG, { LABEL: "W" });
    p.CONSUME(JoinG);
  });

  p.hCoord = p.RULE("hCoord", () => {
    // A `/w/` after a `/th/` or `/h/` word grades whatever it sits before; it opens another part only before `/h/`.
    p.AT_LEAST_ONE(() => p.SUBRULE(p.hCoordPart));
  });

  // Standalone stance `/th/` join (`thul` *no judgment*, fill-ask `thar` *why?*). No standalone `/h/` join:
  // plain `/h/` forms are restrictors.
  p.hCoordPart = p.RULE("hCoordPart", () => {
    p.OR([
      { ALT: () => p.SUBRULE(p.hJoinClose, { LABEL: "standaloneJoin" }) },
      {
        ALT: () => {
          p.AT_LEAST_ONE(() => p.SUBRULE(p.hUnitRule));
          p.SUBRULE2(p.hJoinClose);
          // `thugum thoyem thul barl …`: a stance join may sit between the last open host and its `barl`,
          // so it closes the stance words while the next sentence still fills the host (verb-and-stance-joins.md#stance-join-before-barl).
          p.OPTION2(() => p.CONSUME(LateOdo, { LABEL: "lateBound" }));
        },
      },
    ]);
  });

  /**
   * An adverb or stance word with no join, as its own unit (clause.md#adverbs-h): any (`hSingle`, inside a verb item),
   * one whose hosted `/b/` the adjectives after it describe (`Open`), or any other.
   */
  p.hSingle = p.RULE("hSingle", () => {
    p.OR([
      { ALT: () => p.SUBRULE(p.hUnitOpen, { LABEL: "hUnitRule" }) },
      { ALT: () => p.SUBRULE(p.hUnitClosed, { LABEL: "hUnitRule" }) },
    ]);
  });

  p.hSingleOpen = p.RULE("hSingleOpen", () => {
    p.SUBRULE(p.hUnitOpen, { LABEL: "hUnitRule" });
  });

  p.hSingleClosed = p.RULE("hSingleClosed", () => {
    p.SUBRULE(p.hUnitClosed, { LABEL: "hUnitRule" });
  });

  /** An `/h/` or `/th/` word hosting a stand-in, as its own unit: the main clause ends with it. */
  p.hGrounds = p.RULE("hGrounds", () => {
    p.SUBRULE(p.hStandIn, { LABEL: "hUnitRule" });
  });

  // Nothing is SHARED after a /h/ or /th/ join; `/w/` before the join word grades the list.
  p.hJoinClose = p.RULE("hJoinClose", () => {
    p.CONSUME(JoinH);
  });

  /**
   * An `/h/` or `/th/` word and its hosted `/b/` (clause.md#extra-nouns): any shape (`hUnitRule`), one whose `/b/` the
   * plain adjectives after it describe (`hUnitOpen`), or any other (`hUnitClosed`).
   */
  p.hUnitRule = hUnitRuleOf(p, "hUnitRule", "any");

  p.hUnitOpen = hUnitRuleOf(p, "hUnitOpen", "open");

  p.hUnitClosed = hUnitRuleOf(p, "hUnitClosed", "closed");

  /** A rank fence's bar. Inside the fence no predicate can come before the join, so a `/ɡ/` after its `/b/` describes that noun. */
  /** A rank fence's bar and what it hosts; `fenceBarUnit` is the first bar after a closed `ua` fence. */
  p.barUnit = barRule(p, "barUnit", BarPlain);

  p.fenceBarUnit = barRule(p, "fenceBarUnit", FenceBar);

  /** A list part's bars when the last hosts `barl` (right-recursive, read back by `barNodes`): only the last one shows it. */
  p.barsGrounds = p.RULE("barsGrounds", () => {
    p.OR([
      {
        ALT: () => {
          p.SUBRULE(p.barUnit, { LABEL: "bar" });
          p.SUBRULE(p.barsGrounds, { LABEL: "bar" });
        },
      },
      { ALT: () => p.SUBRULE(p.barStandIn, { LABEL: "bar" }) },
    ]);
  });

  /** A CLUES or PATTERN bar hosting `barl`: the next sentence is the grounds (bars.md#bars). */
  p.barStandIn = p.RULE("barStandIn", () => {
    p.MANY(() => {
      p.CONSUME(WBefore.Bar, { LABEL: "W" });
    });
    p.CONSUME(BarPlain, { LABEL: "H" });
    p.CONSUME(HostedOdo, { LABEL: "Odo" });
  });

  /** An `/h/` or `/th/` word hosting a forward stand-in: the next sentence fills it (dependents.md#dependent-clauses). */
  p.hStandIn = p.RULE("hStandIn", () => {
    p.MANY(() => {
      p.CONSUME(WBefore.HLone, { LABEL: "W" });
    });
    p.CONSUME(HLone, { LABEL: "H" });
    p.CONSUME(HostedOdo, { LABEL: "Odo" });
  });

  /**
   * The run itself, right-recursive (read back by {@link adjNodes}): whether an adjective is the last of the run is only
   * known at its hosted `/b/`, so the run does not have to decide before it.
   */
  p.trailingAdjRun = p.RULE("trailingAdjRun", () => {
    p.OR([
      {
        ALT: () => {
          p.SUBRULE(p.gPackageClosed, { LABEL: "gPackage" });
          p.OPTION(() => p.SUBRULE(p.trailingAdjRun, { LABEL: "gPackage" }));
        },
      },
      { ALT: () => p.SUBRULE(p.gPackageOpen, { LABEL: "gPackage" }) },
    ]);
  });

  /**
   * A hook, and the stance `uom` holds as its zone (contrary-to.md#contrary-to-stance): one whose hosted `/b/` the adjectives
   * after it describe (`Open`), or any other (`Closed`). A `Plain` hook has no `/b/` or zone right after it ({@link HookPlain}).
   */
  p.hookUnitPlain = hookUnitRule(p, "hookUnitPlain", "plain");

  p.hookUnitOpen = hookUnitRule(p, "hookUnitOpen", "open");

  p.hookUnitClosed = hookUnitRule(p, "hookUnitClosed", "closed");

  p.zoneUnitOpen = zoneRule(p, "zoneUnitOpen", "open");

  p.zoneUnitClosed = zoneRule(p, "zoneUnitClosed", "closed");

  /**
   * A same-role word and the fill-ask blank it relates (`abam zar`, same-role-words.md): one unit, so a phrase of the
   * blank's role may follow it. Fronted, the pair takes its A from that phrase.
   */
  p.sameRolePair = p.RULE("sameRolePair", () => {
    p.CONSUME(SameRolePair, { LABEL: "Hook" });
    p.OR([
      { ALT: () => p.CONSUME(JoinZ, { LABEL: "Blank" }) },
      { ALT: () => p.CONSUME(JoinD, { LABEL: "Blank" }) },
      { ALT: () => p.CONSUME(JoinV, { LABEL: "Blank" }) },
    ]);
  });
}

/** Items are {@link GInList} adjectives before a plain join, {@link GInRespList} ones before `wazem` and the join. */
function gCoordPartRule(p: GrammarParser, name: string, close: "any" | "plain" | "respectively" | "none") {
  return p.RULE(name, () => {
    const plain = {
      ALT: () => {
        p.AT_LEAST_ONE(() => p.SUBRULE(p.gListItem, { LABEL: "gPackage" }));
        p.SUBRULE2(p.gJoinClose);
      },
    };
    const respectively = {
      ALT: () => {
        p.AT_LEAST_ONE2(() => p.SUBRULE(p.gRespItem, { LABEL: "gPackage" }));
        p.SUBRULE(p.gJoinCloseRespectively, { LABEL: "gJoinClose" });
      },
    };
    const alone = { ALT: () => p.SUBRULE(p.gJoinClose, { LABEL: "standaloneJoin" }) };
    const alts = { any: [alone, plain, respectively], plain: [alone, plain], respectively: [alone, respectively], none: [alone] }[close];
    if (alts.length === 1) alone.ALT();
    else p.OR(alts);
  });
}

/** `any` is an item of an `/h/` list ({@link HList}); `open` and `closed` are units of their own ({@link HLone}). */
function hUnitRuleOf(p: GrammarParser, name: string, variant: "any" | "open" | "closed") {
  return p.RULE(name, () => {
    const list = variant === "any";
    const [HTh, HPlain, H] = list ? [HThList, HPlainList, HList] : [HThLone, HPlainLone, HLone];
    p.MANY(() => {
      p.CONSUME(WBefore[list ? "HList" : "HLone"], { LABEL: "W" });
    });
    const alts: { ALT: () => void }[] = [];
    if (variant !== "open") {
      alts.push({
        ALT: () => {
          p.consume(1, HTh, { LABEL: "H" });
          p.option(1, () => {
            landmarkHosted(p, 10, "closed", true);
          });
        },
      });
      alts.push({
        ALT: () => {
          p.consume(5, HPlain, { LABEL: "H" });
          p.option(5, () => {
            landmarkHosted(p, 30, "closed");
          });
        },
      });
    }
    if (variant !== "closed") {
      alts.push({
        ALT: () => {
          p.consume(6, H, { LABEL: "H" });
          landmarkHosted(p, 60, "open");
        },
      });
    }
    if (alts.length === 1) alts[0]!.ALT();
    else p.or(1, alts);
  });
}

function barRule(p: GrammarParser, name: string, bar: TokenType) {
  return p.RULE(name, () => {
    p.MANY(() => {
      p.CONSUME(WBefore.Bar, { LABEL: "W" });
    });
    p.CONSUME(bar, { LABEL: "H" });
    p.OPTION(() => landmarkHosted(p, 10, "any"));
  });
}

/**
 * What follows a host's hosted `/b/` (clause.md § Complex chaining): a join filling the slot, a measure amount, then
 * plain adjectives that describe the landmark. The adjectives are part of the host's rule, so nothing has to look
 * back to find the host. Each helper takes `k`, the base of its DSL indices (it uses `k` to `k + 9`).
 *
 * `closedTail`: a join filling the slot, then the amount; no adjective describes this `/b/`.
 */
export function closedTail(p: GrammarParser, k: number): void {
  // A number word right after the hosted /b/ is its amount (measure phrase, e.g. a signed offset).
  // An ordinal (a place, or a kin generation) or a label (a year, `bavawem g_1962`) is an adjective on
  // the landmark instead, free to host its own /b/.
  p.option(k + 1, () => p.consume(k, Amount, { LABEL: "G" }));
}

/**
 * A host's `/b/`: an `open` one is a noun with no join, which the plain adjectives after it describe (so a plain
 * adjective after the host would be one more of them); a `closed` one has a join, or is a number. With `grounds`
 * (a `/th/` host), `barl` may follow a number: a channel's offset, then the grounds (evidentiality.md#evidence-clause).
 */
export function landmarkHosted(p: GrammarParser, k: number, shape: "open" | "closed" | "any", grounds = false): void {
  const open = () => {
    p.consume(k, HostedBNoun, { LABEL: "B" });
    p.option(k, () => p.consume(k, Amount, { LABEL: "G" }));
    trailingAdjs(p, k + 1);
  };
  if (shape === "open") {
    open();
    return;
  }
  const alts = [
    {
      ALT: () => {
        joinedHosted(p, k + 3);
        if (grounds) p.option(k + 9, () => p.consume(k + 9, LateOdo, { LABEL: "Odo" }));
      },
    },
    {
      ALT: () => {
        p.consume(k + 4, HostedBNumber, { LABEL: "B" });
        closedTail(p, k + 4);
        if (grounds) p.option(k + 8, () => p.consume(k + 8, LateOdo, { LABEL: "Odo" }));
      },
    },
  ];
  p.or(k, shape === "any" ? [...alts, { ALT: open }] : alts);
}

/** A hosted `/b/` that heads a list filling the slot (`hazam bledehal blezedel bal`), then the amount. */
export function joinedHosted(p: GrammarParser, k: number): void {
  p.consume(k, HostedBJoined, { LABEL: "B" });
  p.subrule(k, p.boundJoinTail);
  closedTail(p, k);
}

/**
 * Plain adjectives after a word, each describing it (clause.md#adjectives-ɡ). Only the last may end open (its hosted
 * `/b/` takes the adjectives after it, longer-chains.md#complex-chaining), so the run itself always ends open.
 */
export function trailingAdjs(p: GrammarParser, k: number): void {
  p.option(k + 1, () => p.subrule(k, p.trailingAdjRun, { LABEL: "gPackage" }));
}

function hookUnitRule(p: GrammarParser, name: string, shape: "plain" | "open" | "closed") {
  return p.RULE(name, () => {
    p.MANY(() => {
      p.CONSUME(WBefore[shape === "plain" ? "HookPlain" : "HookHosting"], { LABEL: "W" });
    });
    if (shape === "plain") {
      p.CONSUME(HookPlain, { LABEL: "Hook" });
      return;
    }
    p.CONSUME(HookHosting, { LABEL: "Hook" });
    const zone = { open: p.zoneUnitOpen, closed: p.zoneUnitClosed }[shape];
    if (shape === "open") p.SUBRULE(zone, { LABEL: "zone" });
    else p.OPTION(() => p.SUBRULE2(zone, { LABEL: "zone" }));
  });
}

/** The zone stance, with what it hosts, as a `/th/` host takes it. */
function zoneRule(p: GrammarParser, name: string, shape: "any" | "open" | "closed") {
  return p.RULE(name, () => {
    p.CONSUME(HZone, { LABEL: "H" });
    p.OPTION9(() => p.CONSUME(HZoneHeld, { LABEL: "Held" }));
    hostedOrStandIn(p, shape, true);
  });
}

/** A host's `/b/` (see {@link landmarkHosted}), or a stand-in it hosts (closed); optional unless `open`. */
export function hostedOrStandIn(p: GrammarParser, shape: "any" | "open" | "closed", grounds: boolean): void {
  if (shape === "open") {
    landmarkHosted(p, 10, "open");
    return;
  }
  p.OPTION(() => {
    p.OR([
      { ALT: () => landmarkHosted(p, 20, shape, grounds) },
      { ALT: () => p.CONSUME(HostedOdo, { LABEL: "Odo" }) },
    ]);
  });
}
