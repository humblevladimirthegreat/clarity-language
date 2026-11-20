/** Sentence-parser rules for noun and `/ɡ/` packages, as-of pairs, shared scales and shared adverbs. */

import type { TokenType } from "chevrotain";
import {
  B,
  G,
  GGlBefore,
  GPlain,
  GShareable,
  GAdj,
  GInList,
  GInRespList,
  H,
  HostedBNoun,
  HostedBNumber,
  HSharedV,
  HScale,
  BScale,
  JoinB,
  Odo,
  W,
  WBefore,
  type WGroupName,
  type WTarget,
} from "../tokens.js";
import { NP_HEAD, wOf, wTargetOfHead, type NpSlot, type ParserRule } from "../sentence-shapes.js";
import type { GrammarParser } from "../sentence-grammar.js";
import { closedTail, hostedOrStandIn, joinedHosted, landmarkHosted, trailingAdjs } from "./modifier-rules.js";

export function definePackageRules(p: GrammarParser): void {
  /** An as-of `/w/` and its bound, by the adjective it grades (`asOfWPair` before any plain adjective). */
  p.asOfWPairs = Object.fromEntries(
    (["G", "Shareable", "GAdj", "GInList", "GInRespList", "GlZ", "GlD", "GlB", "GlTurn", "GlCitation"] as const).map((target) => [
      target,
      asOfWPairRule(p, target === "G" ? "asOfWPair" : `asOfWPair${target}`, target),
    ]),
  ) as Record<WTarget | WGroupName, ParserRule>;

  /**
   * Adjective packages, one rule per shape (each keeps its `/w/` words and hosted `/b/`):
   * - `gPackageOpen`: a plain adjective whose hosted `/b/` the adjectives after it describe; `gPackageClosed`: any other.
   *   They describe the word before them, whatever their run ({@link GAdj}).
   * - `gLone…`: an adjective unit of its own ({@link GAdj}); `gShared…` / `gPackage` (any shape): the adjective a noun
   *   join shares ({@link GShareable}).
   * - `gListItem` / `gRespItem`: an item of a joined `/ɡ/` list, where a plain adjective after its `/b/` is the next item.
   * - `glPackage`: a `gl-` adjective, which leans on the noun or call after it (left-bound-adjectives.md#left-bound-adjectives).
   */
  p.gPackageOpen = gPackageRule(p, "gPackageOpen", GPlain, "open");

  p.gPackageClosed = gPackageRule(p, "gPackageClosed", GPlain, "closed");

  p.gLoneOpen = gPackageRule(p, "gLoneOpen", GAdj, "open");

  p.gLoneClosed = gPackageRule(p, "gLoneClosed", GAdj, "closed");

  p.gSharedOpen = gPackageRule(p, "gSharedOpen", GShareable, "open");

  p.gSharedClosed = gPackageRule(p, "gSharedClosed", GShareable, "closed");

  p.gListItem = gPackageRule(p, "gListItem", GInList, "item");

  p.gRespItem = gPackageRule(p, "gRespItem", GInRespList, "item");

  p.glPackageZ = gPackageRule(p, "glPackageZ", GGlBefore.Z, "any");

  p.glPackageD = gPackageRule(p, "glPackageD", GGlBefore.D, "any");

  p.glPackageB = gPackageRule(p, "glPackageB", GGlBefore.B, "any");

  p.glPackageTurn = gPackageRule(p, "glPackageTurn", GGlBefore.Turn, "any");

  p.glPackageCitation = gPackageRule(p, "glPackageCitation", GGlBefore.Citation, "any");

  // The one hosted /b/ slot may hold a join: more /b/ members closed by a /b/ join word.
  p.boundJoinTail = p.RULE("boundJoinTail", () => {
    p.MANY(() => p.CONSUME(B));
    p.CONSUME(JoinB);
  });

  p.sharedAdjOpen = p.RULE("sharedAdjOpen", () => {
    p.SUBRULE(p.gSharedOpen, { LABEL: "gPackage" });
  });

  p.sharedAdjClosed = p.RULE("sharedAdjClosed", () => {
    p.SUBRULE(p.gSharedClosed, { LABEL: "gPackage" });
  });

  /** A rank join's scale: an `/h/` or `/th/` word (with its hosted `/b/` or stand-in), or a digitless `/b/` number. */
  p.sharedScale = p.RULE("sharedScale", () => {
    p.OR([
      { ALT: () => p.SUBRULE(p.hScaleClosed, { LABEL: "hUnitRule" }) },
      { ALT: () => p.CONSUME(BScale, { LABEL: "scale" }) },
    ]);
  });

  p.sharedScaleOpen = p.RULE("sharedScaleOpen", () => {
    p.SUBRULE(p.hScaleOpen, { LABEL: "hUnitRule" });
  });

  /** An `/h/` or `/th/` scale word and what it hosts, in any shape, `Open` or `Closed` (see {@link landmarkHosted}). */
  p.hScaleOpen = hScaleRule(p, "hScaleOpen", "open");

  p.hScaleClosed = hScaleRule(p, "hScaleClosed", "closed");

  /** The adverb a verb list's join shares (it covers every verb). */
  p.sharedAdverb = p.RULE("sharedAdverb", () => p.SUBRULE(p.hSharedUnit, { LABEL: "hUnitRule" }));

  p.sharedAdverbOpen = p.RULE("sharedAdverbOpen", () => p.SUBRULE(p.hSharedUnitOpen, { LABEL: "hUnitRule" }));

  p.sharedAdverbClosed = p.RULE("sharedAdverbClosed", () => p.SUBRULE(p.hSharedUnitClosed, { LABEL: "hUnitRule" }));

  /** The shared adverb and what it hosts, as any `/h/` word takes it, in any shape, `Open` or `Closed` (see {@link landmarkHosted}). */
  p.hSharedUnit = hSharedUnitRule(p, "hSharedUnit", "any");

  p.hSharedUnitOpen = hSharedUnitRule(p, "hSharedUnitOpen", "open");

  p.hSharedUnitClosed = hSharedUnitRule(p, "hSharedUnitClosed", "closed");
}

/**
 * A noun package: any head in a list (`Package`). A lone phrase is a noun or written span (`Noun`), a forward
 * stand-in (`StandIn`), which ends its sentence's main clause, or a bare tag **-l** as a new referent (`Tag`).
 * A tag **-l** right after the head and its adjectives names that phrase (tag-pronouns.md#naming-with-a-tag); a lone noun
 * or stand-in with one is `…Tagged`, since a plain adjective after the tag no longer describes the noun.
 */
export function npPackageRule(p: GrammarParser, level: NpSlot, variant: "Package" | "Noun" | "NounTagged" | "StandIn" | "StandInTagged" | "Tag") {
  const head = NP_HEAD[level];
  const noun = { type: head.noun, label: undefined };
  const span = { type: head.span, label: "WritingSpan" };
  const tag = { type: head.tag, label: level.toUpperCase() };
  // A stand-in in a list is one whose run reaches the list's join ({@link OdoZList}); any other is a phrase of its own.
  const heads = {
    Package: [noun, { type: head.standInList, label: "Odo" }, span],
    Noun: [noun, span],
    NounTagged: [noun, span],
    StandIn: [{ type: head.standInLone, label: "Odo" }],
    StandInTagged: [{ type: head.standInLone, label: "Odo" }],
    Tag: [tag],
  }[variant];
  const tagged = { Package: "optional", NounTagged: "required", StandInTagged: "required" } as const;
  return p.RULE(`${level}${variant}`, () =>
    npPackageBody(p, heads, {
      gl: { z: p.glPackageZ, d: p.glPackageD, b: p.glPackageB }[level],
      tag: head.tag,
      tagged: variant in tagged ? tagged[variant as keyof typeof tagged] : "none",
    }),
  );
}

export function npPackageBody(p: GrammarParser,
  heads: { type: TokenType; label: string | undefined }[],
  { gl, tag, tagged = "none" }: { gl: ParserRule; tag?: TokenType; tagged?: "none" | "optional" | "required" },
): void {
  p.OPTION(() => p.SUBRULE(gl, { LABEL: "gPackage" }));
  p.or(
    1,
    heads.map(({ type, label }, i) => ({ ALT: () => p.consume(i + 1, type, label ? { LABEL: label } : undefined) })),
  );
  // A `gl-` adjective leans on the next noun, so it ends this package (left-bound-adjectives.md#left-bound-adjectives).
  trailingAdjs(p, 1);
  if (tag && tagged === "optional") p.OPTION3(() => p.CONSUME(tag, { LABEL: "tag" }));
  if (tag && tagged === "required") p.CONSUME2(tag, { LABEL: "tag" });
}

function asOfWPairRule(p: GrammarParser, name: string, target: WTarget | WGroupName) {
  return p.RULE(name, () => {
    p.CONSUME(wOf("AsOf", target), { LABEL: "W" });
    // The as-of bound is a /b/ noun, never a stand-in (relations.md § as-of).
    p.OPTION(() => p.CONSUME(B));
  });
}

function gPackageRule(p: GrammarParser, name: string, head: TokenType, shape: "any" | "open" | "closed" | "item") {
  return p.RULE(name, () => {
    // Plain `/w/` words, then at most one as-of pair, which more plain `/w/` words may follow.
    const target = wTargetOfHead(head);
    const asOf = p.asOfWPairs[target];
    p.MANY(() => {
      p.CONSUME(wOf("Plain", target), { LABEL: "W" });
    });
    p.OPTION(() => {
      p.SUBRULE(asOf, { LABEL: "asOfWPair" });
      p.MANY2(() => {
        p.CONSUME2(wOf("Plain", target), { LABEL: "W" });
      });
    });
    p.CONSUME(head, { LABEL: "G" });
    if (shape === "open") {
      landmarkHosted(p, 10, "open");
    } else if (shape === "item") {
      p.OPTION2(() => {
        p.OR([
          { ALT: () => joinedHosted(p, 20) },
          {
            ALT: () => {
              p.OR2([
                { ALT: () => p.CONSUME2(HostedBNoun, { LABEL: "B" }) },
                { ALT: () => p.CONSUME3(HostedBNumber, { LABEL: "B" }) },
              ]);
              closedTail(p, 10);
            },
          },
        ]);
      });
    } else {
      p.OPTION2(() => landmarkHosted(p, 10, shape));
    }
  });
}

function hScaleRule(p: GrammarParser, name: string, shape: "any" | "open" | "closed") {
  return p.RULE(name, () => {
    p.MANY(() => {
      p.CONSUME(WBefore.HScale, { LABEL: "W" });
    });
    p.CONSUME(HScale, { LABEL: "H" });
    hostedOrStandIn(p, shape, false);
  });
}

function hSharedUnitRule(p: GrammarParser, name: string, shape: "any" | "open" | "closed") {
  return p.RULE(name, () => {
    p.MANY(() => {
      p.CONSUME(WBefore.HSharedV, { LABEL: "W" });
    });
    p.CONSUME(HSharedV, { LABEL: "H" });
    hostedOrStandIn(p, shape, false);
  });
}
