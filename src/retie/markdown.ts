/**
 * Retie a Markdown page, gated by the same span classes the doc lint uses
 * ([ageben-docs.ts](../lint/ageben-docs.ts)): only text that reads as Ageben is rewritten.
 * Anything that would change but is not clearly Ageben becomes a review item instead.
 */
import {
  classifyAgebenSpan,
  decodeEntities,
  ENGLISH_IN_CODE,
  HTML_CODE_RE,
  isAgebenLintCandidate,
  LINT_MARKER_RE,
} from "../lint/ageben-docs.js";
import { fillSelf } from "../learner-name.js";
import type { ClassifyTables } from "../parse/classify.js";
import {
  forEachPlainChunk,
  peelChunk,
  resumeRewrite,
  rewritePlainTokens,
  transformMarkdown,
  type CodeSpanMeta,
  type CoreRewrite,
  type RetieChange,
} from "./tokens.js";
import { loadDefaultTables, parse } from "../parse/index.js";
import { extractMorphPairs } from "../lint/morph-gloss-docs.js";
import { morphPairsMatching, reglossMarkdown, type ReglossEdit } from "../regloss.js";
import { followPairs, followProse, mergeFollowPairs, type FollowPairs } from "./follow.js";
import { retieCore } from "./rebuild.js";
import { asRetieTables, type RetieTables } from "./tables.js";

export type RetieReview = {
  text: string;
  index: number;
  reason: string;
};

/** One piece of Ageben code (rewritten or not), kept so the caller can parse before and after. */
export type RetiedSpan = {
  before: string;
  after: string;
  index: number;
  /** Lint class of the span; `sentence` / `phrase` are whole-parse checked. */
  cls: string;
};

export type RetieMarkdownResult = {
  text: string;
  changes: RetieChange[];
  reviews: RetieReview[];
  spans: RetiedSpan[];
  /** English names and quoted payloads rewritten after their Ageben. */
  followChanges: RetieChange[];
  /** Name / payload pairs this page's code changes imply (for other pages that mention them). */
  followPairs: FollowPairs;
  /** Morph lines that matched the parser before the retie, regenerated after it. */
  reglossEdits: ReglossEdit[];
};

export type RewriteOptions = {
  /** Pairs from other pages (a house-cast name in prose where this page has no code for it). */
  follow?: FollowPairs;
  /** Common English words: never retied word by word inside a line that is not a whole Ageben span. */
  english?: ReadonlySet<string>;
  /** Leave names, quoted payloads and morph lines for the caller's `finishFollow` (after every page is read). */
  deferFollow?: boolean;
  /** Words never respelled or reviewed (the language's own name, renamed by hand). */
  keep?: ReadonlySet<string>;
};

const REWRITE_CLASSES = new Set(["sentence", "phrase", "word", "template"]);

/** Pass `tables` from `retieTables(map)`: pre-retie text is read against `old`, retied text against `current`. */
export function rewriteMarkdown(
  input: string,
  map: ReadonlyMap<string, string>,
  tables?: ClassifyTables | RetieTables,
  options: RewriteOptions = {},
): RetieMarkdownResult {
  const changes: RetieChange[] = [];
  const reviews: RetieReview[] = [];
  const spans: RetiedSpan[] = [];

  const pair = asRetieTables(tables ?? loadDefaultTables());
  const parseTables = pair.old;
  const english = options.english ?? ENGLISH_IN_CODE;
  const keep = options.keep ?? new Set<string>();
  const guard = (rewrite: CoreRewrite): CoreRewrite => (core, at) => (keep.has(core) ? null : rewrite(core, at));
  const parses = (text: string): boolean => {
    try {
      parse(text.trim(), parseTables);
      return true;
    } catch {
      return false;
    }
  };

  const wouldChange = (text: string): boolean => {
    const probe: RetieChange[] = [];
    rewritePlainTokens(text, guard((core) => retieCore(core, map)), 0, probe);
    return probe.length > 0;
  };

  const rewriteAgeben = (text: string, index: number, cls: string): string => {
    const base = guard(resumeRewrite(map, parseTables));
    // A template or fragment can cut a word before its ending (`gonogotha…`): retie it with a filler ending.
    const rewrite: CoreRewrite =
      cls === "template" || cls === "marked-fragment"
        ? (core, at) => {
            const direct = base(core, at);
            const cut = /^([a-z]+)(…?)$/.exec(core);
            if (direct != null || !cut) return direct;
            const filled = base(`${cut[1]}l`, at);
            return filled?.endsWith("l") ? `${filled.slice(0, -1)}${cut[2]}` : null;
          }
        : base;
    const out = rewritePlainTokens(text, rewrite, index, changes);
    // Unchanged spans are kept too: verify checks that none still holds a moved root.
    spans.push({ before: text, after: out, index, cls });
    return out;
  };

  /** One inline span or one fence line, routed by its lint class. */
  const rewriteLine = (text: string, index: number, onlyReadsAsAgeben = false): string => {
    if (!text.trim()) return text;
    // Classify with the learner-name slot filled, as the lint does (`zSELFn` → `zeman`).
    const cls = classifyAgebenSpan(fillSelf(text));
    const allowed = onlyReadsAsAgeben ? cls !== "template" && REWRITE_CLASSES.has(cls) : REWRITE_CLASSES.has(cls);
    if (allowed) {
      return rewriteAgeben(text, index, cls);
    }
    if (wouldChange(text)) {
      // The doc lint checks every word in code that looks like Ageben, whatever the line is,
      // so those words must move with the lexicon. Other words stay; the line is reviewed.
      const before = changes.length;
      const out = rewritePlainTokens(
        text,
        guard((core) => (isAgebenLintCandidate(core) && !english.has(core) ? retieCore(core, map) : null)),
        index,
        changes,
      );
      // Notation between Ageben words (`owogal + ul → owogalul`) has no English to check.
      const notation = (text.match(/[^\s`]+/g) ?? []).every((chunk) => {
        const { core } = peelChunk(chunk);
        return !/[A-Za-z]/.test(chunk) || (isAgebenLintCandidate(core) && !english.has(core));
      });
      if (notation && changes.length > before) return out;
      reviews.push({
        text,
        index,
        reason: `${
          cls === "unclassified"
            ? "mixes Ageben and other words"
            : onlyReadsAsAgeben
              ? "text-fence line that is not a whole Ageben span"
              : "reads as English"
        }; ${changes.length > before ? "retied word by word, check the English around it" : "holds an old root, not retied"}`,
      });
      return out;
    }
    return text;
  };

  const eachLine = (text: string, index: number, visit: typeof rewriteLine, textFence: boolean): string => {
    let offset = 0;
    return text
      .split("\n")
      .map((line) => {
        const next = visit(line, index + offset, textFence);
        offset += line.length + 1;
        return next;
      })
      .join("\n");
  };

  const code = (text: string, index: number, meta: CodeSpanMeta): string => {
    const marker = meta.marker ? LINT_MARKER_RE.exec(meta.marker)?.[1] : undefined;
    if (marker === "fragment") {
      return rewriteAgeben(text, index, "marked-fragment");
    }
    if (meta.kind === "fence") {
      const info = meta.info.split(/\s+/)[0] ?? "";
      if (info === "markdown" || info === "md") {
        // Example Markdown shown as source: retie it as a page of its own.
        const inner = rewriteMarkdown(text, map, pair, options);
        for (const change of inner.changes) changes.push({ ...change, index: change.index + index });
        for (const review of inner.reviews) reviews.push({ ...review, index: review.index + index });
        for (const span of inner.spans) spans.push({ ...span, index: span.index + index });
        return inner.text;
      }
      // Unmarked fences fail the lint anyway; treat them like `ageben` so the retie is not lost.
      const reviewed = reviews.length;
      const out = eachLine(text, index, rewriteLine, info !== "" && info !== "ageben");
      // A letter-names fence is respelled from its word afterwards (letter-names.ts): nothing to review.
      if (meta.marker && /^retie:\s*letter-names$/.test(meta.marker)) reviews.length = reviewed;
      return out;
    }
    return rewriteLine(text, index);
  };

  /** An HTML `<code>` body (used where a span holds `<…>`, which Vue would read as a tag). */
  const htmlCode = (body: string, index: number): string => {
    const cls = classifyAgebenSpan(fillSelf(decodeEntities(body)));
    return REWRITE_CLASSES.has(cls) ? rewriteAgeben(body, index, cls) : rewriteLine(body, index);
  };

  /** Prose: an emphasised multi-word run that parses as an Ageben sentence or phrase (`*zazawan vawalal.*`) reties as a span. */
  const proseTokens = (text: string, index: number): string => {
    let out = "";
    let at = 0;
    for (const match of text.matchAll(/(?<!\*)\*([^*\n]+)\*(?!\*)/g)) {
      const inner = match[1]!;
      if (!/\s/.test(inner.trim())) continue; // one word: never retied (proseWords)
      const cls = classifyAgebenSpan(fillSelf(inner));
      if (cls !== "sentence" && cls !== "phrase") continue;
      // Classification is by shape: *even though* and *over there* are phrase-shaped English.
      if (!parses(fillSelf(inner))) continue;
      const innerStart = match.index! + 1;
      out += proseWords(text.slice(at, innerStart), index + at);
      const before = changes.length;
      out += rewriteAgeben(inner, index + innerStart, cls);
      for (const change of changes.slice(before)) change.prose = true;
      at = innerStart + inner.length;
    }
    return out + proseWords(text.slice(at), index + at);
  };

  /**
   * Prose words are never retied. A lone word cannot be told from English (*one*, *here*,
   * *bone* all fit the root shape), and emphasis in prose is English glosses; Ageben in
   * prose is in code. Hits are reported for review, except common English words (*there*, *over*).
   */
  const proseWords = (text: string, index: number): string =>
    forEachPlainChunk(text, index, (chunk, chunkIndex) => {
      const { prefix, core } = peelChunk(chunk);
      if (!core || english.has(core.toLowerCase()) || keep.has(core)) return chunk;
      const next = retieCore(core, map);
      if (next == null || next === core) return chunk;
      reviews.push({
        text: chunk,
        index: chunkIndex,
        reason: prefix.includes("*")
          ? "emphasised prose word matches an old root; read as English, not retied"
          : "prose word matches an old root; not retied",
      });
      return chunk;
    });

  // HTML `<code>` bodies can hold `[`, which the Markdown walk would read as a link start,
  // so split them out first (outside fenced blocks).
  let text = "";
  let at = 0;
  for (const match of input.matchAll(new RegExp(HTML_CODE_RE.source, "g"))) {
    if (insideFence(input, match.index!)) continue;
    const bodyStart = match.index! + "<code>".length;
    text += transformMarkdown(input.slice(at, bodyStart), at, code, proseTokens);
    text += htmlCode(match[1]!, bodyStart);
    at = bodyStart + match[1]!.length;
  }
  text += transformMarkdown(input.slice(at), at, code, proseTokens);

  const pagePairs = followPairs(changes, pair);
  const result = { text, changes, reviews, spans, followChanges: [], followPairs: pagePairs, reglossEdits: [] };
  if (options.deferFollow) return result;
  return finishFollow(input, result, options.follow ? mergeFollowPairs(pagePairs, options.follow) : pagePairs, pair);
}

/**
 * English copies of changed spellings (names, quoted payloads), then morph lines that matched
 * the parser before the retie. Run once per page: a second pass would chain name pairs.
 */
export function finishFollow(
  input: string,
  result: RetieMarkdownResult,
  pairs: FollowPairs,
  tables: ClassifyTables | RetieTables = loadDefaultTables(),
): RetieMarkdownResult {
  const { old, current } = asRetieTables(tables);
  const followed = followProse(result.text, pairs);
  let text = followed.text;
  let reglossEdits: ReglossEdit[] = [];
  if (result.changes.length > 0 || followed.changes.length > 0) {
    const matchedBefore = morphPairsMatching(input, old);
    if (extractMorphPairs(text).length === matchedBefore.length) {
      const regloss = reglossMarkdown(text, current, (_pair, i) => matchedBefore[i] === true);
      text = regloss.text;
      reglossEdits = regloss.edits;
    }
  }
  return { ...result, text, followChanges: followed.changes, reglossEdits };
}

/** Whether `index` falls inside a fenced block (odd number of fence lines before it). */
function insideFence(input: string, index: number): boolean {
  const before = input.slice(0, index);
  return ((before.match(/^(?:```|~~~)/gm)?.length ?? 0) % 2) === 1;
}
