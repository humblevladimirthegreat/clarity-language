/**
 * The job each hook plays, decided once here after the sentence parses (hooks.md); the morph gloss and the
 * gloss brackets read it instead of re-deriving it from the flat word list
 * (proposals: parser-rule-consolidation A3).
 *
 * - `discourse`: glues the sentence to prior talk (left edge, or right after a clause join).
 * - `clause`: an in-clause hook with no `/b/` of its own to describe, or one right after a recipient `/b/` (same-role).
 * - `extraNoun`: a hook + `/b/` that adds a landmark to the clause or to a hosted landmark.
 * - `genitive`: `em` + `/b/` that belongs to the noun on its left (used-by).
 * - `stray`: `em` + `/b/` with no noun on its left; enforce rejects it.
 * - `span`: a hook between two same-kind endpoints.
 * - `resume`: a resume hook (`-r`) that points back.
 * - `frame`: `uem` + a `/th/` stance it holds as the opposing frame (sakes.md#contrary-to-stance).
 */
import { visitResult, visitUnit } from "./ast-walk.js";
import { topicEffect } from "./linkers.js";
import type { LexWord, ParseResult, Unit } from "./types.js";

export type HookJob = "discourse" | "clause" | "extraNoun" | "genitive" | "stray" | "span" | "resume" | "frame";

const SPAN_ENDPOINT_KIND: Record<string, string> = {
  "+": "scalar",
  "-": "scalar",
  ra: "scalar",
  ru: "scalar",
  "#": "rank",
  "#-": "rank",
  re: "rank",
  rue: "rank",
  _: "label",
  ro: "label",
  roe: "label",
  "#_": "label",
  ruo: "label",
};

/** Span endpoint kind: a number with digits, ±∞, or a first / last place (numbers-applied.md § Ranges). */
export function spanEndpointKind(word: LexWord | undefined): string | undefined {
  if (word?.family.kind !== "number") return undefined;
  const { stem } = word.family;
  const kind = SPAN_ENDPOINT_KIND[stem.marker];
  if (!kind) return undefined;
  if (stem.groups.length > 0 && !stem.digitlessExp) return kind;
  if (stem.groups.length === 0 && stem.digitlessExp === "e") return kind;
  if (stem.groups.length === 0 && stem.digitlessExp === "e-" && kind === "rank") return kind;
  return undefined;
}

/**
 * Span hook (hooks.md § Spans): `al` / `ul` between two same-kind number endpoints,
 * or a stacked `oe` / `ua` / `ue` hook between two same-role words.
 */
export function isSpanHook(word: LexWord, prev: LexWord | undefined, next: LexWord | undefined): boolean {
  if (word.family.kind !== "hook" || !prev || !next || prev.pos !== next.pos) return false;
  const vowels = word.family.form.slice(0, -1);
  if (vowels === "oe" || vowels === "ua" || vowels === "ue") return true;
  if (vowels !== "a" && vowels !== "u") return false;
  const kind = spanEndpointKind(prev);
  return kind !== undefined && kind === spanEndpointKind(next);
}


function unitWords(unit: Unit | undefined): LexWord[] {
  const words: LexWord[] = [];
  if (unit) visitUnit(unit, { word: (w) => words.push(w) });
  return words;
}

function isBNoun(unit: Unit | undefined): boolean {
  return unit?.kind === "np" && unit.coord.level === "b";
}

/** Does this unit's last `/b/` hang on a host (an `/h/` or `/ɡ/`), or on a hook that follows one? (clause.md § complex chaining) */
function endsInLandmark(units: Unit[], index: number): boolean {
  const unit = units[index];
  if (!unit) return false;
  if (unit.kind === "h") return Boolean(unit.unit.hosted);
  if (unit.kind === "predicate") return Boolean(unit.adj.hosted);
  if (unit.kind === "np" && unit.coord.level !== "b") {
    const part = unit.coord.parts.at(-1);
    const item = part && !part.join ? part.items.at(-1) : undefined;
    return item?.kind === "package" && Boolean(item.package.adjs.at(-1)?.hosted);
  }
  if (!isBNoun(unit)) return false;
  // A plain `/b/` is a landmark when a hook pairs it and the hook itself follows a landmark (or no `/b/`).
  const hook = units[index - 1];
  if (hook?.kind !== "hook") return false;
  const before = unitWords(units[index - 2]).filter((w) => w.pos !== "w").at(-1);
  return before?.pos !== "b" || endsInLandmark(units, index - 2);
}

/** `em` + `/b/` belongs to the noun phrase on its left; a plain recipient `/b/` is not one (hooks.md § whose). */
function genitiveHost(units: Unit[], index: number, afterTopic: boolean): "noun" | "recipient" | "none" {
  const prev = units[index - 1];
  if (!prev) return afterTopic && index === 0 ? "noun" : "none";
  switch (prev.kind) {
    case "np":
      if (prev.coord.level !== "b") return "noun";
      return endsInLandmark(units, index - 1) ? "noun" : "recipient";
    case "h":
      return prev.unit.hosted ? "noun" : "none";
    case "predicate":
    case "gCoord":
    case "span":
    case "writingSpan":
    case "island":
      return "noun";
    default:
      return "none";
  }
}

/** `afterTopic`: this clause opens right after a topic word, which is the noun a first hook describes (pronouns.md#topic). */
function hookJob(units: Unit[], index: number, afterJoin: boolean, afterTopic: boolean): HookJob {
  const unit = units[index];
  if (unit?.kind !== "hook") return "clause";
  if (unit.frame) return "frame";
  const { word } = unit;
  const prevWord = unitWords(units[index - 1]).filter((w) => w.pos !== "w").at(-1);
  const nextWord = unitWords(units[index + 1])[0];
  const nextIsB = isBNoun(units[index + 1]);

  let extraNoun = nextIsB && (prevWord?.pos !== "b" || (endsInLandmark(units, index - 1) && !isSpanHook(word, prevWord, nextWord)));
  if (nextIsB && word.family.kind === "hook" && word.family.form === "em") {
    const host = genitiveHost(units, index, afterTopic);
    if (host === "noun") return "genitive";
    // A bare `em bamegun` with nothing else is a citation of the form (*my*), like a lone join word.
    if (host === "none") return units.length === 2 && index === 0 ? "extraNoun" : "stray";
    extraNoun = false;
  }
  if (!extraNoun && !afterJoin && isSpanHook(word, prevWord, nextWord)) return "span";
  // A resume hook (-r) takes no /b/: mid-clause it points back to the landmark (hooks.md § point back).
  if (word.ending === "r" && !afterJoin) return "resume";
  if (extraNoun) return "extraNoun";
  return afterJoin ? "discourse" : "clause";
}

/** Give every in-clause hook unit its job. A hook right after a clause join opens that conjunct (discourse glue). */
export function assignHookJobs(result: ParseResult): void {
  const afterJoin = new WeakSet<object>();
  const afterTopic = new WeakSet<object>();
  const assign = (units: Unit[], clauseAfterJoin: boolean, clauseAfterTopic: boolean): void => {
    units.forEach((unit, index) => {
      if (unit.kind !== "hook") return;
      unit.job = hookJob(units, index, index === 0 && clauseAfterJoin, index === 0 && clauseAfterTopic);
      // A genitive, or an extra-noun hook right after a landmark `/b/`, describes what is on its left.
      const prevPos = unitWords(units[index - 1]).filter((w) => w.pos !== "w").at(-1)?.pos;
      if (unit.job === "genitive" || (unit.job === "extraNoun" && prevPos === "b")) unit.onLeft = true;
    });
  };
  visitResult(result, {
    enter(node) {
      if (node.kind === "body" && (node.body.topicSpan || (node.body.linker && ["introduce", "return"].includes(topicEffect(node.body.linker))))) {
        afterTopic.add(node.body.clause);
      }
      if (node.kind === "clause" && node.clause.linker && ["introduce", "return"].includes(topicEffect(node.clause.linker))) {
        afterTopic.add(node.clause);
      }
      if (node.kind === "clauseCoord") {
        node.coord.links.forEach((link, i) => {
          if (link.clause && (node.coord.first || i > 0)) afterJoin.add(link.clause);
        });
      }
      if (node.kind === "clause") assign(node.clause.units, afterJoin.has(node.clause), afterTopic.has(node.clause));
      if (node.kind === "island") assign(node.island.units, false, false);
    },
  });
}

/** Hook words' jobs by word position, for the morph gloss: left-edge hooks are discourse glue, unit hooks carry `job`, a hook pair inside a noun is extra-noun. */
export function hookJobsByPosition(result: ParseResult): Map<number, HookJob> {
  const jobs = new Map<number, HookJob>();
  visitResult(result, {
    enter(node) {
      if (node.kind === "utterance" && node.utterance.left.hook?.at !== undefined) jobs.set(node.utterance.left.hook.at, "discourse");
      if (node.kind === "clause") {
        for (const unit of node.clause.units) if (unit.kind === "hook" && unit.word.at !== undefined && unit.job) jobs.set(unit.word.at, unit.job);
      }
      if (node.kind === "island") {
        for (const unit of node.island.units) if (unit.kind === "hook" && unit.word.at !== undefined && unit.job) jobs.set(unit.word.at, unit.job);
      }
      if (node.kind === "gPackage" && node.pkg.word.family.kind === "hook" && node.pkg.word.at !== undefined) jobs.set(node.pkg.word.at, "extraNoun");
    },
  });
  return jobs;
}
