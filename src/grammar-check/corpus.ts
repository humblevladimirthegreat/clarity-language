/** The Agazan sentences and phrases in docs/grammar/, as the parser checks see them. */
import { readFileSync } from "node:fs";
import { join, relative } from "node:path";

import { classifyAgazanSpan, walkAgazanSpans } from "../lint/agazan-docs.js";
import { listMarkdown } from "../markdown-files.js";
import { REPO_ROOT } from "../repo-paths.js";

export type DocSpan = { file: string; text: string };

/** Each distinct sentence or phrase span once, with the first page that has it. */
export function docSpans(root = REPO_ROOT): DocSpan[] {
  const spans = new Map<string, DocSpan>();
  for (const path of listMarkdown(join(root, "docs", "grammar"))) {
    const file = relative(root, path);
    walkAgazanSpans(readFileSync(path, "utf8"), {
      text: (span) => {
        const text = span.trim();
        const cls = classifyAgazanSpan(text);
        if ((cls === "sentence" || cls === "phrase") && !spans.has(text)) spans.set(text, { file, text });
      },
    });
  }
  return [...spans.values()];
}

/**
 * Inputs beyond the docs: each span with one word deleted (`drop`), or with two neighboring words swapped (`swap`),
 * the final period kept. Each distinct text once, and never a text that is itself a doc span.
 */
export function spanVariants(spans: DocSpan[], kinds: ("drop" | "swap")[] = ["drop"]): DocSpan[] {
  const seen = new Set(spans.map((s) => s.text));
  const out: DocSpan[] = [];
  const add = (file: string, words: string[], period: boolean) => {
    const text = words.join(" ") + (period ? "." : "");
    if (seen.has(text)) return;
    seen.add(text);
    out.push({ file, text });
  };
  for (const kind of kinds) {
    for (const { file, text } of spans) {
      const period = text.endsWith(".");
      const words = (period ? text.slice(0, -1) : text).split(" ");
      if (words.length < 2) continue;
      for (let i = 0; i < words.length; i++) {
        if (kind === "drop") add(file, words.filter((_, j) => j !== i), period);
        else if (i + 1 < words.length && words[i] !== words[i + 1]) {
          const swapped = [...words];
          [swapped[i], swapped[i + 1]] = [swapped[i + 1]!, swapped[i]!];
          add(file, swapped, period);
        }
      }
    }
  }
  return out;
}
