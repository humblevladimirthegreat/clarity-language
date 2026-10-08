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
