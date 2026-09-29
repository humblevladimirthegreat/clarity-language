/**
 * Checks a retie runs on each page before `--write`: which roots the docs use, bare resumes
 * whose reading changed, and lint findings the retie would add.
 */
import { basename } from "node:path";

import { fillSelf } from "../learner-name.js";
import { ENGLISH_IN_CODE, lintAgazanMarkdown, lintAgazanSpans } from "../lint/agazan-docs.js";
import { formatMorphGlossFinding, lintMorphGlossMarkdown } from "../lint/morph-gloss-docs.js";
import { formatNumberSpeechFinding, lintNumberSpeechMarkdown, NUMBER_SPEECH_FILES } from "../lint/number-speech-docs.js";
import { lintRetieFormat } from "../lint/retie-format.js";
import { formatWordBankFinding, lintWordBankMarkdown } from "../lint/word-bank-docs.js";
import { hasClosedOverlay, type ClassifyTables } from "../parse/classify.js";
import { morphGlossLine } from "../parse/morph-gloss.js";
import { parseWord } from "../parse/word.js";
import { retieCore } from "./rebuild.js";
import { antecedentStemRoots } from "./resume.js";
import type { RetieTables } from "./tables.js";
import { forEachMarkdownCodeToken, lineNumberAt, peelChunk } from "./tokens.js";

/** A bare resume whose reading the retie changed: `was` → `reads`, and `keep` restores `was` when some spelling does. */
export type BareResumeDrift = { index: number; from: string; to: string; was: string; reads: string; keep?: string };

/** Content roots of non-resume words in the docs. */
export function rootsInUse(texts: string[]): Set<string> {
  const roots = new Set<string>();
  for (const text of texts) {
    forEachMarkdownCodeToken(text, ({ chunk }) => {
      const { core } = peelChunk(chunk);
      try {
        for (const root of antecedentStemRoots(parseWord(core))) roots.add(root);
      } catch {
        // not an Agazan word
      }
    });
  }
  return roots;
}

/**
 * Bare short resumes (a code span that is just the word, as in prose) whose reading the retie changed:
 * with no earlier word to bind, a resume reads as its stem's root, and the retie may have made that
 * stem another row's root (`zodor` ←dog became ←door). A resume inside a sentence is covered by the
 * per-span bind check. Code spans pair up by position: the retie never adds or removes one.
 */
export function bareResumeDrift(
  before: string,
  after: string,
  map: ReadonlyMap<string, string>,
  tables: RetieTables,
  english: ReadonlySet<string>,
): BareResumeDrift[] {
  const bare = (text: string) => {
    const tokens: { chunk: string; index: number; block: number }[] = [];
    forEachMarkdownCodeToken(text, (token) => tokens.push(token));
    const perBlock = new Map<number, number>();
    for (const token of tokens) perBlock.set(token.block, (perBlock.get(token.block) ?? 0) + 1);
    return new Map(tokens.filter((token) => perBlock.get(token.block) === 1).map((token) => [token.block, token]));
  };
  const gloss = (core: string, t: ClassifyTables) => {
    try {
      return morphGlossLine(`${core}.`, t);
    } catch {
      return "(does not parse)";
    }
  };
  const beforeBare = bare(before);
  const out: BareResumeDrift[] = [];
  for (const [block, token] of bare(after)) {
    const { core } = peelChunk(token.chunk);
    const previous = beforeBare.get(block);
    const from = previous ? peelChunk(previous.chunk).core : "";
    if (!core || !from || english.has(core) || ENGLISH_IN_CODE.has(core)) continue;
    try {
      const word = parseWord(core);
      if (word.ending !== "r" || word.family.kind !== "content" || hasClosedOverlay(word, tables.current)) continue;
    } catch {
      continue;
    }
    const was = gloss(from, tables.old);
    const reads = gloss(core, tables.current);
    if (was === reads) continue;
    // The spelling that keeps the old reading when that reading was the stem's own root (`zerar` ←ear → `zemar`).
    let keep: string | undefined;
    try {
      const old = parseWord(from);
      if (old.family.kind === "content" && old.family.roots.every((root) => tables.old.published.has(root))) {
        const next = retieCore(from, map, { stems: new Set(), boundAntecedentRoots: old.family.roots });
        if (next && next !== core && gloss(next, tables.current) === was) keep = next;
      }
    } catch {
      // keep stays undefined
    }
    out.push({ index: token.index, from, to: core, was, reads, keep });
  }
  return out;
}

/** Doc-lint findings for one page (same checks as `npm run build`, minus site-wide ones). */
export function lintPage(rel: string, source: string, tables: ClassifyTables): string[] {
  const text = fillSelf(source);
  const out: string[] = [];
  for (const issue of lintAgazanMarkdown(text, tables)) {
    out.push(`${rel}:${lineNumberAt(text, issue.index)}  \`${issue.token}\`  ${issue.kind}  (${issue.detail})`);
  }
  for (const issue of lintAgazanSpans(text, tables)) {
    out.push(`${rel}:${lineNumberAt(text, issue.index)}  \`${issue.text}\`  ${issue.kind}  (${issue.detail})`);
  }
  for (const finding of lintMorphGlossMarkdown(text, tables).findings) {
    out.push(formatMorphGlossFinding(rel, finding));
  }
  for (const finding of lintWordBankMarkdown(source, tables)) {
    out.push(formatWordBankFinding(rel, finding));
  }
  for (const finding of lintRetieFormat(text, tables)) {
    out.push(`${rel}:${lineNumberAt(text, finding.index)}  retie-format  (${finding.detail})`);
  }
  // The build checks pronunciation rows on the number pages only.
  if (NUMBER_SPEECH_FILES.includes(basename(rel))) {
    for (const finding of lintNumberSpeechMarkdown(text)) {
      out.push(formatNumberSpeechFinding(rel, finding));
    }
  }
  return out;
}

/**
 * Lint findings a retie adds to a grammar page: the page before the retie against the old
 * lexicon, the page after against the current one.
 * Findings are compared without line numbers, so moved lines are not new.
 */
export function newLintFindings(rel: string, before: string, after: string, old: ClassifyTables, current: ClassifyTables): string[] {
  const key = (finding: string) => finding.replace(/^[^\s]+:\d+\s+/, "").replace(/\s+/g, " ");
  const baseline = new Map<string, number>();
  for (const finding of lintPage(rel, before, old)) {
    baseline.set(key(finding), (baseline.get(key(finding)) ?? 0) + 1);
  }
  return lintPage(rel, after, current).filter((finding) => {
    const left = baseline.get(key(finding)) ?? 0;
    if (left > 0) {
      baseline.set(key(finding), left - 1);
      return false;
    }
    return true;
  });
}
