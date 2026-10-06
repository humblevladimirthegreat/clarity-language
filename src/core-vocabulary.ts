/**
 * Core learner vocabulary (docs/proposals/exercise-standards.md § 3): each core root names the
 * stage checkpoint that introduces it, in the `core` column of the lexicon CSVs
 * (docs/meta/lexicon.md#core-vocabulary-column). The seed is the first checkpoint, in path
 * order, whose **Roots used here** bank uses the root.
 */
import { CLOSED } from "./closed-roots.js";
import { DEFAULT_SELF_ROOT, fillSelf } from "./learner-name.js";
import { bankUses, findRootsTable, practiceRanges } from "./lint/word-bank-docs.js";
import { drillSections } from "./lint/drill-coverage.js";
import { BANDS, pageSections, type Band } from "./lint/learning-order.js";
import type { ClassifyTables } from "./parse/classify.js";

/** Most new core roots one checkpoint may introduce. */
export const CORE_CAP = 5;

/** Roots taught as grammar, not vocabulary: house cast, the learner slot, discourse-role specials, topic / generic pronouns. */
export const NOT_CORE_ROOTS: ReadonlySet<string> = new Set([
  CLOSED.swan,
  CLOSED.lion,
  CLOSED.hibiscus,
  DEFAULT_SELF_ROOT,
  CLOSED.microphone,
  CLOSED.headphones,
  CLOSED.handshake,
  CLOSED.neutral,
  CLOSED.star,
  CLOSED.person,
]);

export type BankEntry = { root: string; english: string; agazan: string };

export type Checkpoint = {
  /** `page.md#id` of the `### Translation practice` heading. */
  anchor: string;
  page: string;
  band: Band;
  /** Counted bank roots, in table order, each once (no overlay words, no {@link NOT_CORE_ROOTS}). */
  entries: BankEntry[];
};

/** Stage checkpoints in path order: every Beginner checkpoint in reading order, then Intermediate, then Advanced. */
export function stageCheckpoints(
  readingOrder: readonly string[],
  readPage: (page: string) => string | undefined,
  tables: ClassifyTables,
): Checkpoint[] {
  const pages = new Map<string, { raw: string[]; lines: string[]; sections: ReturnType<typeof pageSections>["sections"] }>();
  for (const page of readingOrder) {
    const markdown = readPage(page);
    if (markdown === undefined) continue;
    // `SELF` fills to the default root, which the bank's `SELFn` row then names; lines stay aligned.
    pages.set(page, {
      raw: markdown.split("\n"),
      lines: fillSelf(markdown).split(/\r?\n/),
      sections: pageSections(page, markdown).sections,
    });
  }

  const out: Checkpoint[] = [];
  for (const band of BANDS) {
    for (const page of readingOrder) {
      const p = pages.get(page);
      if (!p) continue;
      const ranges = practiceRanges(p.lines);
      for (const section of drillSections(p.sections, band)) {
        const line = lineOfOffset(p.raw, section.offset);
        const range = ranges.find((r) => r.start === line);
        const table = range ? findRootsTable(p.lines, range.start, range.end) : null;
        const entries: BankEntry[] = [];
        const seen = new Set<string>();
        for (const row of table?.rows ?? []) {
          if (!row.agazan) continue;
          for (const { root, overlay } of bankUses(row.agazan, tables)) {
            // A closed overlay word is grammar, taught by its owning section.
            if (overlay || NOT_CORE_ROOTS.has(root) || seen.has(root)) continue;
            seen.add(root);
            entries.push({ root, english: row.english ?? "", agazan: row.agazan });
          }
        }
        out.push({ anchor: `${page}#${section.slug}`, page, band, entries });
      }
    }
  }
  return out;
}

/** Root → anchor of the first checkpoint that uses it. */
export function firstAppearance(checkpoints: readonly Checkpoint[]): Map<string, string> {
  const core = new Map<string, string>();
  for (const checkpoint of checkpoints) {
    for (const { root } of checkpoint.entries) {
      if (!core.has(root)) core.set(root, checkpoint.anchor);
    }
  }
  return core;
}

export type CheckpointReport = { checkpoint: Checkpoint; fresh: BankEntry[]; review: BankEntry[]; overCap: boolean };

/** Per checkpoint: roots it introduces under `core`, and roots met at an earlier checkpoint. */
export function coreReport(checkpoints: readonly Checkpoint[], core: ReadonlyMap<string, string>): CheckpointReport[] {
  return checkpoints.map((checkpoint) => {
    const fresh = checkpoint.entries.filter((e) => core.get(e.root) === checkpoint.anchor);
    const review = checkpoint.entries.filter((e) => core.get(e.root) !== checkpoint.anchor);
    return { checkpoint, fresh, review, overCap: fresh.length > CORE_CAP };
  });
}

function lineOfOffset(lines: readonly string[], offset: number): number {
  let at = 0;
  for (let i = 0; i < lines.length; i++) {
    if (at >= offset) return i;
    at += lines[i]!.length + 1;
  }
  return lines.length;
}
