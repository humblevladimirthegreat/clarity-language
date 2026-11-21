/** Morph-gloss label builders: hooks, joins, numbers, content words ([glosses.md](../../docs/meta/glosses.md)). */

import { JOIN_SERIES } from "./series.js";
import { hookCompoundGloss, overlayKey, SAME_ROLE_POS, type ClassifyTables } from "./classify.js";
import { type ExtraNounHook } from "./hook-compounds.js";
import { type PublishedRow } from "../lexicon-search.js";
import { CLOSED } from "../closed-roots.js";
import { linkerEnglish } from "./linkers.js";
import { stripFlagSuffix } from "../flag-label.js";
import { type Ending, type LexOverlay, type LexWord, type NumberStem, type Pos } from "./types.js";
import { sensePieces } from "./morph-gloss.js";
import { houseCast, NUMBER_MARK_SUFFIX, specialPronoun, markedPronoun, JOIN_JOB_STANDALONE, LIST_VERB, JOIN_RELATION, HOOK_JOB, HOOK_IN_CLAUSE, HOOK_EXTRA_NOUN, FORCE_JOB, FORCE_JOB_SOFT, FORCE_JOB_FOR_NOW, POLAR_JOB, ABILITY_STANCE, REACH_VOWEL, SAKE_STANCE, SAKE_GRAIN, EMOTION_URGE, EMOTION_DURATION, GREETING_STANCE, roleFront, POINTER_ENDING, POINTER_VOWEL, type MorphGlossContext, formatNumberGroup, cardinalEnglish, ordinalEnglish } from "./morph-gloss-tables.js";

/** English / TAG body of one word (no PoS prefix). Overlay chips use this. */
export function senseLabel(
  word: LexWord,
  tables: ClassifyTables,
  ctx: MorphGlossContext = {},
): string {
  if (word.family.kind === "x" && word.family.xFamily === "holder") {
    const body = sensePieces(word, tables, ctx).join("-");
    return word.plural ? `${body}-x` : body;
  }
  const joiner =
    word.family.kind === "x" && (word.family.xFamily === "sake" || word.family.xFamily === "scope" || word.family.xFamily === "lateral")
      ? "-th-"
      : "-x-";
  let body = sensePieces(word, tables, ctx).join(joiner);
  // **-ln**: one thing the name applies to (proper-names.md#name-instance--ln).
  if (word.ending === "ln") body += ".instance";
  if (word.plural) return body ? `${body}-x` : "-x";
  return body;
}

/** **-n** names; **-ln** is one thing that name applies to, glossed as the name plus `.instance`. */
function isNameEnding(ending: Ending | undefined): boolean {
  return ending === "n" || ending === "ln";
}

export const WRITTEN_SPAN: Record<string, string> = { "[": "CITE", "(": "ASIDE", "<": "OPAQUE" };

/** Range hooks between two same-role words (ranges.md#ranges): -m `.approx`, -n `.named`, -r `some.`. */
const HOOK_SPAN: Record<string, string> = {
  oel: "through",
  oem: "through.approx",
  oen: "through.named",
  oer: "some.through",
  uel: "through-excluding",
  uem: "through-excluding.approx",
  uen: "through-excluding.named",
  uer: "some.through-excluding",
  ual: "outside",
  uam: "outside.approx",
  uan: "outside.named",
  uar: "some.outside",
  uol: "strictly-between",
  uom: "strictly-between.approx",
  uon: "strictly-between.named",
  uor: "some.strictly-between",
  aol: "taking-turns",
  aom: "taking-turns.approx",
  aon: "taking-turns.named",
  aor: "some.taking-turns",
};

export function hookLabel(form: string, ctx: MorphGlossContext): string {
  switch (ctx.hookJob) {
    case "span":
      return HOOK_SPAN[form] ?? form;
    case "resume":
    case "extraNoun":
    case "genitive":
    case "zone":
      return HOOK_EXTRA_NOUN[form] ?? form;
    case "discourse":
      return HOOK_JOB[form] ?? form;
    default:
      return HOOK_IN_CLAUSE[form] ?? HOOK_JOB[form] ?? form;
  }
}

/** On `/h/`, a hooked join's point-back names a time (hooked-joins.md#hooked-joins-time). */
const HOOKED_JOIN_TIME_RESUME: Record<string, string> = { ar: "within.then", er: "at.then", ur: "since.then" };

/** A hooked join's hook, read off the extra-noun grid (`at`, `near`, `there`; hooked-joins.md#hooked-joins). */
export function hookedJoinHookLabel(hook: string, pos: Pos | undefined): string {
  if (pos === "h" && HOOKED_JOIN_TIME_RESUME[hook]) return HOOKED_JOIN_TIME_RESUME[hook];
  return HOOK_EXTRA_NOUN[hook] ?? hook;
}

export function joinMarkerLabel(word: LexWord, ctx: MorphGlossContext): string {
  const family = word.family;
  if (family.kind !== "joinMarker") return "join";
  const { series } = family;
  const ending = word.ending;

  if ((word.reading === "standInNamed" || ctx.dependentVerb) && word.pos === "v") {
    const verbalDependent: Record<string, [string, string]> = {
      a: ["state", "offer-as-view"],
      o: ["command", "request"],
      e: ["question", "invite-answer"],
      u: ["prohibit", "caution-against"],
      ae: ["agree", "tentatively-agree"],
      ue: ["decline-to", "hesitate-to"],
      ao: ["confirm", "tentatively-confirm"],
      uo: ["deny", "express-doubt"],
      ua: ["reject-premise", "question-framing"],
    };
    const action = verbalDependent[series] ?? verbalDependent.a!;
    return action[0];
  }

  if (word.reading === "standInNamed") {
    const namedContent: Record<string, string> = {
      a: "statement",
      o: "command",
      e: "question",
      u: "prohibition",
      ae: "agreement",
      ue: "decline",
      ao: "confirmation",
      uo: "denial",
      ua: "premise-rejection",
    };
    return namedContent[series] ?? "sentence-content";
  }

  if (word.reading === "standInBack") {
    const backContent: Record<string, string> = {
      a: "that-same-claim",
      o: "that-same-instruction",
      e: "that-same-question",
      u: "that-same-prohibition",
    };
    return backContent[series] ?? "that-same-content";
  }

  if (word.reading === "listVerb") return LIST_VERB[series] ?? "list-verb";
  if (word.reading === "joinRelation") {
    if (word.pos === "h" && series === "u") return "refusing";
    return JOIN_RELATION[series] ?? "join-relation";
  }

  if (word.pos === "y") {
    if (series.length === 1) {
      if (ending === "m") return FORCE_JOB_SOFT[series] ?? FORCE_JOB[series] ?? series;
      if (ending === "r") return FORCE_JOB_FOR_NOW[series] ?? FORCE_JOB[series] ?? series;
      return FORCE_JOB[series] ?? series;
    }
    const polar = POLAR_JOB[series];
    if (polar) {
      if (ending === "m") return `${polar}-soft`;
      if (ending === "r") return `${polar}-for-now`;
      return polar;
    }
  }

  if (word.reading === "restrictor") {
    return restrictorLabel(series, ending, ctx.restrictorListed, ctx.fillAsk);
  }

  return fenceJoinLabel(series, ending, word.pos, ctx);
}

function fenceJoinLabel(
  series: string,
  ending: Ending | undefined,
  pos: Pos | undefined,
  ctx: MorphGlossContext,
): string {
  if (ending === "rl" || ending === "rm") {
    const open = ending === "rm" ? ".open" : "";
    if (series === "e") return `whether-clause${open}`;
    if (series === "o") return `to-clause${open}`;
    if (series === "u") return `lest-clause${open}`;
    return `that-clause${open}`;
  }

  if (ending === "r") {
    if (ctx.fillAsk) {
      // Stance fill-ask asks for grounds, not a person.
      if (pos === "th" && series === "a") return "why";
      if (pos === "th" && series === "u") return "why-else";
      if (series === "u") return "wh-else";
      if (series === "e") return "any";
      if (series === "o") return "which-rank";
      return "wh";
    }
    if (series === "u") return "something-else";
    if (series === "e") return "anything";
    if (series === "o") return "whatever-ranks";
    return "something";
  }

  if (ending === "n" && pos === "x") {
    const sequence: Record<string, string> = { a: "and-then", e: "or-else", u: "and-then-not", ae: "and-or-else", uo: "and-before-that" };
    if (sequence[series]) return sequence[series];
  }

  if (ctx.kindReference && series === "ua" && ending === "n") return "the-kind";
  // Open **e** leaves the pick optional, so it is no longer *exactly one*.
  if (series === "e" && ending === "m") return "or.open";
  const job = (ctx.standaloneJoin ? JOIN_JOB_STANDALONE[series] : undefined) ?? JOIN_SERIES[series]?.job ?? series;
  if (ending === "m") return `${job}.open`;
  if (ending === "n") return `${job}.named`;
  return job;
}

function restrictorLabel(
  series: string,
  ending: Ending | undefined,
  listed: boolean | undefined,
  fillAsk: boolean | undefined,
): string {
  if (ending === "r") {
    if (series === "a") return fillAsk ? "when" : "sometimes";
    if (series === "e") return "anytime";
    if (series === "u") return "some-other-time";
    if (series === "o") return fillAsk ? "when-best" : "preferred-time";
    if (series === "oe") return "equally-often";
    return `${series}-r`;
  }
  const open = ending === "m" ? ".open" : "";
  if (series === "a") {
    if (!listed) return `never${open}`;
    if (ending === "m") return "when.open";
    return "only-when";
  }
  if (series === "ua") return `${listed ? "always-except" : "always"}${open}`;
  if (series === "u") return `not-when${open}`;
  if (series === "e") return `when-one${open}`;
  if (series === "o") return `when-ranked${open}`;
  if (series === "oe") return `equally-when${open}`;
  if (series === "ae") return `when-any-of${open}`;
  if (series === "ue") return `anytime-except${open}`;
  if (series === "ao") return `when-in-order${open}`;
  if (series === "uo") return `when-last${open}`;
  return `${series}${open}`;
}

function numericKindLabel(stem: NumberStem, pos: Pos | undefined): string {
  const exp = stem.digitlessExp;
  const noMantissa = stem.groups.every((g) => !g.mantissa && !g.exponentDigits);
  if (noMantissa) {
    if (stem.marker === "+" && exp === "e") return "infinity";
    if (stem.marker === "+" && (exp === "e-" || exp === "-")) return "grain";
    if (stem.marker === "-" && exp === "e") return "void";
    if (stem.marker === "-" && (exp === "e-" || exp === "-e-" || exp === "-")) return "quasi";
    if (stem.marker === "#" && (exp === "e-" || exp === "-")) return "origin";
    if (stem.marker === "#" && exp === "e") return "telos";
    if ((stem.marker === "+" || stem.marker === "ra") && !exp) return "poly";
    if ((stem.marker === "-" || stem.marker === "ru") && !exp) return "de";
  }
  return numberLabel(stem, pos);
}

/** Stance `/th/` numbers (numbers.md § Number as stance): likelihood, virtually, source. */
function stanceNumberLabel(stem: NumberStem): string | null {
  const exp = stem.digitlessExp;
  const groups = stem.groups;
  if (groups.length === 0) {
    if (!exp) {
      if (stem.marker === "+") return "likely";
      if (stem.marker === "-") return "unlikely";
      if (stem.marker === "_") return "per-a-source";
      return null;
    }
    if (stem.marker === "+" && exp === "e") return "certain";
    if (stem.marker === "+" && exp === "0e") return "no-chance";
    if (stem.marker === "+" && exp === "1e") return "gazillion-percent-sure";
    if (stem.marker === "-" && exp === "e-") return "virtually";
    return null;
  }
  const body = groups.map(formatNumberGroup).filter(Boolean).join(",");
  if (stem.marker === "_" && !exp) return `per-source-${body}`;
  const only = groups[0]!;
  if (stem.marker === "#" && !exp && groups.length === 1 && only.mantissa !== undefined && !only.exponentDigits && !only.decimal && !only.percent) {
    return `${ordinalEnglish(Number(only.mantissa))}-hand`;
  }
  if (
    stem.marker === "+" &&
    !exp &&
    groups.length === 1 &&
    only.mantissa !== undefined &&
    !only.exponentDigits &&
    !only.percent
  ) {
    return `${only.mantissa}-percent-likely`;
  }
  return null;
}

export function numberLabel(stem: NumberStem, pos: Pos | undefined): string {
  const exp = stem.digitlessExp;
  if (pos === "th") {
    const stance = stanceNumberLabel(stem);
    if (stance) return stance;
  }
  if (exp) {
    if (stem.marker === "#" && (exp === "e-" || exp === "-")) {
      return pos === "x" ? "starting-with" : "start-place";
    }
    if (stem.marker === "#" && exp === "e") {
      return pos === "x" ? "finally" : "last-place";
    }
    if (stem.marker === "+" && exp === "e") return "plus-infinity";
    if (stem.marker === "-" && exp === "e") return "minus-infinity";
  }

  if (stem.groups.length === 0 && !exp) {
    // Digitless signed amount on /b/ is an unmeasured offset (evidentiality.md#forecast).
    if (pos === "b" && stem.marker === "+") return "later";
    if (pos === "b" && stem.marker === "-") return "earlier";
    if (stem.marker === "+") return "more-than-one";
    if (stem.marker === "-") return "negative-unspecified";
    if (stem.marker === "#") return "some-rank";
    return String(stem.marker);
  }

  const first = stem.groups[0];
  const simpleMantissa =
    first?.mantissa !== undefined &&
    stem.groups.length === 1 &&
    !first.exponentDigits &&
    !first.percent &&
    !first.decimal &&
    !exp;
  if (simpleMantissa) {
    const value = Number(first.mantissa);
    if (stem.marker === "#-") return `${ordinalEnglish(value)}-from-end`;
    if (stem.marker === "#") return ordinalEnglish(value);
    if (stem.marker === "+") return cardinalEnglish(value);
    // `/h/` inverse is a partition (÷N, *half as*), not a negative (numbers.md § number as adverb).
    if (stem.marker === "-") return pos === "h" ? `divided-by-${cardinalEnglish(value)}` : `minus-${cardinalEnglish(value)}`;
  }

  const body = stem.groups.map(formatNumberGroup).filter(Boolean).join(",");
  if (stem.marker === "#_" || stem.marker === "rue") {
    return body ? `negative-label-${body}` : "negative-label";
  }
  if (stem.marker === "+-" || stem.marker === "rua") {
    return body ? `plus-minus-${body}` : "plus-minus-bound";
  }
  if (stem.marker === "_" || stem.marker === "re") {
    return body ? `_${body}` : "_";
  }
  if ((stem.marker === "+" || stem.marker === "ra") && !exp) return body;
  if ((stem.marker === "-" || stem.marker === "ru") && !exp) {
    if (pos === "h") return body ? `divided-by-${body}` : "divided-by";
    return body ? `minus-${body}` : "minus";
  }
  return [String(stem.marker), exp, body].filter(Boolean).join("-");
}

export function xPieces(word: LexWord, tables: ClassifyTables, antecedent?: LexWord): string[] {
  const family = word.family;
  if (family.kind !== "x") return [];

  if (family.xFamily === "role") {
    // Reach, part, then the stem; a stem compound keeps its `-x-` (`episode-agent-dog-x-walk`).
    const host = (family.rightRoots ?? []).map((root) =>
      rootSense(root, word.ending, tables, {
        named: isNameEnding(word.ending),
        pos: word.pos,
      }),
    );
    const ability = family.stanceVowel ? `-${ABILITY_STANCE[family.stanceVowel] ?? family.stanceVowel}` : "";
    return [`${roleFront(family.reachVowel, family.part)}-${host.join("-x-")}${ability}`];
  }

  if (family.xFamily === "hookPrefix") {
    // The hook, the seam, then the stem; a stem compound keeps its `-x-` (`against-x-house-x-walk`), and label reach
    // keeps its `-th-` joiner (`against-x-fight-th-role`; hook-compounds.md#hook-prefixes).
    const roots = family.rightRoots ?? [];
    const stem = family.stemHook
      ? hookCompoundGloss(
          { leftRoot: roots[0]!, leftEnding: family.stemHook.leftEnding, hook: family.stemHook.hook as ExtraNounHook, stem: `${roots[0]}${family.stemHook.leftEnding}${family.stemHook.hook}` },
          word.pos,
          tables,
        ).concrete ?? roots[0]!
      : roots.map((root) => rootSense(root, word.ending, tables, { named: isNameEnding(word.ending), pos: word.pos })).join("-x-");
    const reach = family.reachVowel ? `-th-${REACH_VOWEL[family.reachVowel] ?? "reach"}` : "";
    return [`${HOOK_EXTRA_NOUN[family.hook ?? ""] ?? "hook"}-x-${stem}${reach}`];
  }

  if (family.xFamily === "sake" || family.xFamily === "ability") {
    const hostRoot = family.leftRoots[0] ?? "host";
    const host =
      tables.hostlessAbilityRoot && hostRoot === tables.hostlessAbilityRoot
        ? "ABIL"
        : rootSense(hostRoot, word.ending, tables, {
            named: word.reading === "greeting" || isNameEnding(word.ending),
            sake: word.reading === "sake",
            pos: word.pos,
          });
    // Ability / greeting bids: one hyphenated english slot (`walking-unable-temporary`,
    // `Name-minutes`). Values keep a visible `-th-` joiner (`competence-th-motive`).
    if (word.reading === "greeting") {
      const stance = GREETING_STANCE[family.stanceVowel ?? ""] ?? family.stanceVowel ?? "greeting";
      return [`${host}-${stance}`];
    }
    if (word.reading === "sake") {
      const stance = SAKE_STANCE[family.stanceVowel ?? ""] ?? family.stanceVowel ?? "stance";
      const horizon = family.horizon ?? word.ending;
      const grain =
        family.stanceVowel && horizon
          ? SAKE_GRAIN[family.stanceVowel]?.[horizon]
          : undefined;
      if (family.horizon) {
        const urge = EMOTION_URGE[family.locus ?? ""];
        const duration = EMOTION_DURATION[word.ending ?? ""] ?? word.ending;
        return [[host, stance, grain, urge, duration].filter(Boolean).join("-")];
      }
      return grain ? [`${host}-${stance}-${grain}`] : [host, stance];
    }
    const stance = ABILITY_STANCE[family.stanceVowel ?? ""] ?? family.stanceVowel ?? "ability";
    // Ability resume (`vowoxar`): the resumed host keeps the ability (can-and-cant.md#ability).
    if (word.ending === "r" && antecedent) {
      const antecedentFamily = antecedent.family;
      const resumed =
        antecedentFamily.kind === "x" && antecedentFamily.xFamily === "ability"
          ? rootSense(antecedentFamily.leftRoots[0] ?? "host", antecedent.ending, tables, { pos: antecedent.pos })
          : senseLabel(antecedent, tables, {});
      return [`←${resumed}-${stance}`];
    }
    return [`${host}-${stance}`];
  }

  if (family.xFamily === "scope") {
    const host = family.leftRoots.map((root) => rootSense(root, word.ending, tables, { named: isNameEnding(word.ending), pos: word.pos }));
    return [...host, REACH_VOWEL[family.stanceVowel ?? ""] ?? "reach"];
  }

  if (family.xFamily === "numeric") {
    // The number, the seam, then the stem (`infinity-x-love`, `three.about-x-speech`; numeric-derivation.md).
    const stem = (family.rightRoots ?? []).map((root) =>
      rootSense(root, word.ending, tables, { named: isNameEnding(word.ending), pos: word.pos }),
    );
    const num = family.numberStem ? numericKindLabel(family.numberStem, word.pos) : "num";
    return [`${num}${family.approx ? ".about" : ""}`, ...stem];
  }

  if (family.xFamily === "holder") {
    const host = tables.overlays.get(overlayKey("th", `${family.leftRoots[0]}${family.grade ?? "m"}`))?.gloss ?? family.leftRoots[0]!;
    // Holder -r resumes the person whose view it is (holder.md#naming-a-holder).
    if (word.ending === "r") {
      const resumed: LexWord = { ...word, overlay: undefined, family: { kind: "content", roots: family.rightRoots ?? [] } };
      return [host, ...sensePieces(resumed, tables, { antecedent })];
    }
    const holder = (family.rightRoots ?? []).map((root, i, all) =>
      rootSense(root, word.ending, tables, {
        named: isNameEnding(word.ending),
        nameLast: isNameEnding(word.ending) && i === all.length - 1,
        pos: word.pos,
        holder: true,
      }),
    );
    return [host, holder.join("-x-")];
  }

  if (family.xFamily === "lateral") {
    const dir = rootSense(family.leftRoots[0]!, "l", tables, { named: false, pos: word.pos });
    // **-r** resumes the facing anchor (`howuhethuzozer`, viewpoint.md#viewpoint-laterals).
    if (word.ending === "r" && !family.landmark) {
      const resumed: LexWord = { ...word, overlay: undefined, family: { kind: "content", roots: family.rightRoots ?? [] } };
      return [dir, ...sensePieces(resumed, tables, { antecedent })];
    }
    const anchors = (family.rightRoots ?? []).map((root, i, all) =>
      rootSense(root, word.ending, tables, {
        named: isNameEnding(word.ending),
        nameLast: isNameEnding(word.ending) && i === all.length - 1,
        pos: word.pos,
      }),
    );
    return [dir, family.landmark ? "landmark" : anchors.join("-x-")];
  }

  const named = isNameEnding(word.ending);
  const unpackCitation = word.ending === "n" && !word.pos;
  const all = [...family.leftRoots, ...(family.rightRoots ?? [])];
  return all.map((root, i) =>
    rootSense(root, word.ending, tables, {
      named: named && !unpackCitation,
      nameLast: named && !unpackCitation && i === all.length - 1,
      citationEtymology: unpackCitation,
      pos: word.pos,
    }),
  );
}

export function writingSpanLabel(
  word: LexWord,
  tables: ClassifyTables,
  ctx: MorphGlossContext,
): string {
  const family = word.family;
  if (family.kind !== "writingSpan") return "span";
  const payload = family.payload;
  const stem = payload.endsWith("n") ? payload.slice(0, -1) : payload;
  if (houseCast()[stem] && payload.endsWith("n")) return houseCast()[stem]!;
  if (houseCast()[payload]) return houseCast()[payload]!;
  return payload;
}

export function contentBody(word: LexWord, roots: string[], tables: ClassifyTables): string {
  if (word.overlay) return overlayLabel(word.overlay);
  if (word.dictionaryCompound) {
    if (isNameEnding(word.ending)) return titleAgebenName(roots[0] ?? "compound", true);
    const lemma = word.ending === "m" ? word.rootGloss?.abstract : word.rootGloss?.concrete;
    return hyphenEnglish(lemma || word.rootGloss?.concrete || roots[0] || "compound");
  }
  if (word.hookCompound) {
    return hyphenEnglish(
      word.rootGloss?.concrete || word.rootGloss?.abstract || word.hookCompound.stem,
    );
  }
  const linker = linkerEnglish(word);
  if (linker) return linker;
  if (word.pos === "y" && word.ending === "l" && roots.length === 1 && roots[0] === CLOSED.wave) return "greeting";
  if (roots.length === 1) {
    return rootSense(roots[0]!, word.ending, tables, {
      named: isNameEnding(word.ending),
      sake: word.reading === "sake",
      pos: word.pos,
    });
  }
  return roots
    .map((root) =>
      rootSense(root, word.ending, tables, {
        named: isNameEnding(word.ending),
        sake: word.reading === "sake",
        pos: word.pos,
      }),
    )
    .join("-x-");
}

function overlayLabel(overlay: LexOverlay): string {
  return overlay.pos === SAME_ROLE_POS ? sameRoleLabel(overlay) : overlay.gloss;
}

/** A same-role word glosses its ending like a hook's: open on **-m**, closed on **-l** (`before.open`, `like.closed`). */
export function sameRoleLabel(row: { gloss: string; senseForm: string }): string {
  return `${row.gloss}.${row.senseForm.endsWith("l") ? "closed" : "open"}`;
}

function packedRoleLemma(
  row: PublishedRow,
  ending: Ending | undefined,
  pos: Pos | undefined,
): string | undefined {
  if (!pos) return undefined;
  const bank = ending === "m" ? row.posEnglish.abstract : row.posEnglish.concrete;
  return bank[pos];
}

export function rootSense(
  root: string,
  ending: Ending | undefined,
  tables: ClassifyTables,
  opts: {
    named?: boolean;
    nameLast?: boolean;
    sake?: boolean;
    citationEtymology?: boolean;
    pos?: Pos;
    /** A holder seam's name: a noun for that person, so a marked pronoun glosses as one. */
    holder?: boolean;
  } = {},
): string {
  if (opts.citationEtymology) {
    const row = tables.published.get(root);
    return hyphenEnglish(row?.abstract || row?.concrete || root);
  }

  if (opts.sake && tables.sakeGloss.has(root)) return tables.sakeGloss.get(root)!;

  const compound = tables.compounds.get(root);
  if (compound && ending !== "n" && !opts.named) {
    const lemma =
      ending === "m"
        ? compound.abstract || compound.concrete
        : compound.concrete || compound.abstract;
    if (lemma) return hyphenEnglish(lemma);
  }

  if (root === CLOSED.microphone && ending !== "m") {
    return ending === "l" ? "microphone" : "speaker";
  }

  const nounSlot = opts.holder || opts.pos === undefined || opts.pos === "z" || opts.pos === "d" || opts.pos === "b";
  if (ending === "n" && nounSlot && markedPronoun()[root]) return markedPronoun()[root]!;

  if (ending === "n" || opts.named) {
    if (houseCast()[root]) return houseCast()[root]!;
    if (specialPronoun()[root]) return specialPronoun()[root]!;
    if (opts.named) return titleAgebenName(root, opts.nameLast !== false);
  }

  if (tables.sakeGloss.has(root) && opts.sake) {
    return tables.sakeGloss.get(root)!;
  }

  const row = tables.published.get(root);
  const packed = row ? packedRoleLemma(row, ending, opts.pos) : undefined;
  if (packed) return hyphenEnglish(packed);
  if (ending === "m") return hyphenEnglish(row?.abstract || row?.concrete || root);
  if (row?.concrete) return hyphenEnglish(ending === "n" ? stripFlagSuffix(row.concrete) : row.concrete);
  if (row?.abstract) return hyphenEnglish(row.abstract);
  return root;
}

function titleAgebenName(root: string, withN: boolean): string {
  const stem = withN ? `${root}n` : root;
  return stem.charAt(0).toUpperCase() + stem.slice(1);
}

function hyphenEnglish(text: string): string {
  return text.trim().toLowerCase().replace(/\s+/g, "-").replace(/[()]/g, "");
}

/**
 * Whether a number word is preferred in shorthand ([numbers § Style](../../docs/grammar/number-markers.md#writing-style-numeric-vs-spelled)):
 * more than one digit in total (mantissa and exponent), or a digit-string label.
 * Zero or one digit is preferred spelled (`gral`, `gragel`, `grawamol`).
 */
export function prefersNumberShorthand(stem: NumberStem): boolean {
  if (stem.marker === "_" || stem.calendarOrdinal) return true;
  let digits = (stem.digitlessExp ?? "").replace(/[^0-9]/g, "").length;
  for (const g of stem.groups) digits += `${g.mantissa ?? ""}${g.exponentDigits ?? ""}`.replace(/[^0-9]/g, "").length;
  return digits > 1;
}

/** Side-by-side number words (a range, a list of values) share one surface: shorthand if any needs it. */
export function markShorthandRuns(words: LexWord[], ctxByIndex: MorphGlossContext[]): void {
  let start = 0;
  while (start < words.length) {
    let end = start;
    while (end < words.length && words[end]!.family.kind === "number") end++;
    if (end - start > 1) {
      const run = words.slice(start, end);
      if (run.some((w) => w.family.kind === "number" && prefersNumberShorthand(w.family.stem))) {
        for (let i = start; i < end; i++) ctxByIndex[i]!.shorthandRun = true;
      }
    }
    start = Math.max(end, start + 1);
  }
}

/**
 * Marks a number word written in its non-preferred surface: `.spelled` on a spelled word
 * that prefers shorthand (`grababal` for `g+11`), `.short` on shorthand that prefers
 * spelling (`g+`, `g+3`). The preferred surface is unmarked.
 */
export function numberSurfaceSuffix(raw: string, stem: NumberStem, ctx: MorphGlossContext): string {
  const spelled = /^(?:th|[zdbvgwhxy])?[a-z][a-z']*$/.test(raw);
  const short = ctx.shorthandRun || prefersNumberShorthand(stem);
  if (spelled) return short ? ".spelled" : "";
  return short ? "" : ".short";
}

/**
 * SMALLCAPS labels the morph line prints from its own tables (overlay glosses add the
 * rest). terminology.md must list each one (src/lint/terminology-docs.ts).
 */
export const MORPH_GLOSS_LABELS: readonly string[] = [
  ...new Set([
    ...Object.values(EMOTION_URGE),
    ...Object.values(EMOTION_DURATION),
    ...Object.values(WRITTEN_SPAN),
    "MENTION",
    "ABIL",
    "SCOPE",
    "NAME",
  ]),
];

/**
 * Form suffixes the morph line appends to a sense label ([glosses.md § Round trip](../../docs/meta/glosses.md#round-trip)).
 * The translation prompt explains each one (llm-prompt.ts `GLOSS_READER`).
 */
export const MORPH_FORM_SUFFIXES: readonly string[] = [
  ...new Set([
    ".open",
    ".instance",
    ".spelled",
    ".short",
    ".name",
    ...Object.values(NUMBER_MARK_SUFFIX),
    ...Object.values(POINTER_ENDING),
    ...Object.values(POINTER_VOWEL).map((vowel) => `.${vowel}`),
  ]),
];
