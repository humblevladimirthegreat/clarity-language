/**
 * Retie a Markdown page, gated by the same span classes the doc lint uses
 * ([agalan-docs.ts](../lint/agalan-docs.ts)): only text that reads as Agalan is rewritten.
 * Anything that would change but is not clearly Agalan becomes a review item instead.
 */
import {
  classifyAgalanSpan,
  decodeEntities,
  HTML_CODE_RE,
  LINT_MARKER_RE,
  SPOKEN_OPAQUE_RE,
} from "../lint/agalan-docs.js";
import { fillSelf } from "../learner-name.js";
import type { ClassifyTables } from "../parse/classify.js";
import {
  collectContentStems,
  forEachPlainChunk,
  peelChunk,
  resumeRewrite,
  rewritePlainTokens,
  transformMarkdown,
  type CodeSpanMeta,
  type RetieChange,
} from "./tokens.js";
import { retieCore } from "./rebuild.js";

export type RetieReview = {
  text: string;
  index: number;
  reason: string;
};

/** One rewritten piece of code, kept so the caller can parse before and after. */
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
};

const REWRITE_CLASSES = new Set(["sentence", "phrase", "word", "template"]);

/** Pass `tables` from `bridgeTables(map)` when the lexicon CSVs may already hold the new roots. */
export function rewriteMarkdown(
  input: string,
  map: ReadonlyMap<string, string>,
  tables?: ClassifyTables,
): RetieMarkdownResult {
  const stems = collectContentStems(input);
  const changes: RetieChange[] = [];
  const reviews: RetieReview[] = [];
  const spans: RetiedSpan[] = [];

  const wouldChange = (text: string): boolean => {
    const probe: RetieChange[] = [];
    rewritePlainTokens(text, (core) => retieCore(core, map, { stems }), 0, probe);
    return probe.length > 0;
  };

  const rewriteAgalan = (text: string, index: number, cls: string): string => {
    const rewrite = resumeRewrite(map, stems, text, tables);
    let out = "";
    let at = 0;
    // A spoken opaque span's interior is foreign text, not Agalan words.
    for (const match of text.matchAll(new RegExp(SPOKEN_OPAQUE_RE.source, "g"))) {
      const innerStart = match.index! + match[1]!.length;
      const innerEnd = match.index! + match[0].length - match[2]!.length;
      out += rewritePlainTokens(text.slice(at, innerStart), rewrite, index + at, changes);
      out += text.slice(innerStart, innerEnd);
      at = innerEnd;
    }
    out += rewritePlainTokens(text.slice(at), rewrite, index + at, changes);
    if (out !== text) {
      spans.push({ before: text, after: out, index, cls });
    }
    return out;
  };

  /** One inline span or one fence line, routed by its lint class. */
  const rewriteLine = (text: string, index: number, onlyReadsAsAgalan = false): string => {
    if (!text.trim()) return text;
    // Classify with the learner-name slot filled, as the lint does (`zSELFn` → `zeman`).
    const cls = classifyAgalanSpan(fillSelf(text));
    const allowed = onlyReadsAsAgalan ? cls !== "template" && REWRITE_CLASSES.has(cls) : REWRITE_CLASSES.has(cls);
    if (allowed) {
      return rewriteAgalan(text, index, cls);
    }
    if (wouldChange(text)) {
      reviews.push({
        text,
        index,
        reason:
          cls === "unclassified"
            ? "mixes Agalan and other words; not retied"
            : onlyReadsAsAgalan
              ? "text-fence line with an old root; not retied"
              : "reads as English but holds an old root; not retied",
      });
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
      return rewriteAgalan(text, index, "marked-fragment");
    }
    if (meta.kind === "fence") {
      const info = meta.info.split(/\s+/)[0] ?? "";
      if (info === "markdown" || info === "md") {
        // Example Markdown shown as source: retie it as a page of its own.
        const inner = rewriteMarkdown(text, map, tables);
        for (const change of inner.changes) changes.push({ ...change, index: change.index + index });
        for (const review of inner.reviews) reviews.push({ ...review, index: review.index + index });
        for (const span of inner.spans) spans.push({ ...span, index: span.index + index });
        return inner.text;
      }
      // Unmarked fences fail the lint anyway; treat them like `agalan` so the retie is not lost.
      return eachLine(text, index, rewriteLine, info !== "" && info !== "agalan");
    }
    return rewriteLine(text, index);
  };

  /** An HTML `<code>` body (used where a span holds `<…>`, which Vue would read as a tag). */
  const htmlCode = (body: string, index: number): string => {
    const cls = classifyAgalanSpan(fillSelf(decodeEntities(body)));
    return REWRITE_CLASSES.has(cls) ? rewriteAgalan(body, index, cls) : rewriteLine(body, index);
  };

  /** Prose: an emphasised run that reads as Agalan (`*zazawan vawalal.*`) reties as a span. */
  const proseTokens = (text: string, index: number): string => {
    let out = "";
    let at = 0;
    for (const match of text.matchAll(/(?<!\*)\*([^*\n]+)\*(?!\*)/g)) {
      const inner = match[1]!;
      if (!/\s/.test(inner.trim())) continue; // one word: handled as a citation below
      const cls = classifyAgalanSpan(fillSelf(inner));
      if (cls !== "sentence" && cls !== "phrase") continue;
      const innerStart = match.index! + 1;
      out += proseWords(text.slice(at, innerStart), index + at);
      out += rewriteAgalan(inner, index + innerStart, cls);
      at = innerStart + inner.length;
    }
    return out + proseWords(text.slice(at), index + at);
  };

  /** Prose words: only emphasised citations (`*azawa*`) retie; other hits are reported. */
  const proseWords = (text: string, index: number): string =>
    forEachPlainChunk(text, index, (chunk, chunkIndex) => {
      const { prefix, core, suffix } = peelChunk(chunk);
      if (!core) return chunk;
      const next = retieCore(core, map, { stems });
      if (next == null || next === core) return chunk;
      if (!prefix.includes("*")) {
        reviews.push({ text: chunk, index: chunkIndex, reason: "prose word matches an old root; not retied" });
        return chunk;
      }
      changes.push({ from: core, to: next, index: chunkIndex + prefix.length });
      return `${prefix}${next}${suffix}`;
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
  return { text, changes, reviews, spans };
}

/** Whether `index` falls inside a fenced block (odd number of fence lines before it). */
function insideFence(input: string, index: number): boolean {
  const before = input.slice(0, index);
  return ((before.match(/^(?:```|~~~)/gm)?.length ?? 0) % 2) === 1;
}
