/**
 * Core learner vocabulary (docs/proposals/exercise-standards.md § 3): each core root names the
 * stage checkpoint that introduces it, in the `core` column of the lexicon CSVs
 * (docs/meta/lexicon.md#core-vocabulary-column). The seed is the first checkpoint, in path
 * order, whose bank uses the root. {@link lintCoreCounts} checks converted checkpoints against
 * the column (docs/meta/translation-exercises.md#core-vocabulary).
 */
import { CLOSED } from "./closed-roots.js";
import { DEFAULT_SELF_ROOT, fillSelf } from "./learner-name.js";
import { bankUses, findRootsTable, practiceBank, type BankRow } from "./lint/word-bank-docs.js";
import { practiceRanges } from "./lint/practice-sections.js";
import { drillSections } from "./lint/drill-coverage.js";
import { BANDS, pageSections, type Band } from "./lint/learning-order.js";
import type { ClassifyTables } from "./parse/classify.js";
import { parseCompoundCsv } from "./lexicon-compounds.js";
import { parsePublishedCsv } from "./lexicon-search.js";
import { readData } from "./repo-paths.js";

/** Most new core roots one checkpoint may introduce. */
export const CORE_CAP = 5;

/** Fewest review roots a checkpoint uses, once that many core roots come before it. */
export const CORE_REVIEW_MIN = 3;

/** Roots taught as grammar, not vocabulary: house cast, the learner slot, discourse-role specials, topic / generic pronouns, the nine sakes. */
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
  CLOSED.ballot,
  CLOSED.toolbox,
  CLOSED.lightbulb,
  CLOSED.compass,
  CLOSED.knot,
  CLOSED.present,
  CLOSED.strawberry,
  CLOSED.lungs,
  CLOSED.egg,
]);

/** Which bank lists the root: legacy **Roots used here**, or converted **New words** / **Review**. */
export type BankGroup = "roots" | "new" | "review";

export type BankEntry = { root: string; english: string; agazan: string; group: BankGroup; /** 1-based. */ line: number };

export type Checkpoint = {
  /** `page.md#id` of the checkpoint heading (`### Practice`, or legacy `### Translation practice`). */
  anchor: string;
  page: string;
  band: Band;
  /** 1-based line of the checkpoint heading. */
  line: number;
  converted: boolean;
  /** On the level review page: review roots only (docs/meta/translation-exercises.md#level-reviews). */
  review: boolean;
  /** Counted bank roots, in table order, each once (no overlay words, no {@link NOT_CORE_ROOTS}). */
  entries: BankEntry[];
  /** Bank rows for {@link NOT_CORE_ROOTS} (house names, the learner slot, specials), each once. */
  cast: BankEntry[];
};

/**
 * Stage checkpoints in path order: every Beginner checkpoint in reading order, then Intermediate,
 * then Advanced. Put the level review page last in `readingOrder` so each review closes its level.
 */
export function stageCheckpoints(
  readingOrder: readonly string[],
  readPage: (page: string) => string | undefined,
  tables: ClassifyTables,
  reviewPage?: string,
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
        const converted = range?.converted ?? false;
        const rows: { row: BankRow; group: BankGroup }[] = [];
        if (range && converted) {
          const bank = practiceBank(p.lines, range);
          for (const row of bank.newWords?.rows ?? []) rows.push({ row, group: "new" });
          for (const row of bank.review?.rows ?? []) rows.push({ row, group: "review" });
        } else if (range) {
          for (const row of findRootsTable(p.lines, range.start, range.end)?.rows ?? []) rows.push({ row, group: "roots" });
        }
        const entries: BankEntry[] = [];
        const cast: BankEntry[] = [];
        const seen = new Set<string>();
        for (const { row, group } of rows) {
          if (!row.agazan) continue;
          for (const { root, overlay } of bankUses(row.agazan, tables)) {
            // A closed overlay word is grammar, taught by its owning section.
            if (overlay || seen.has(root)) continue;
            seen.add(root);
            const entry = { root, english: row.english ?? "", agazan: row.agazan, group, line: row.lineIndex + 1 };
            (NOT_CORE_ROOTS.has(root) ? cast : entries).push(entry);
          }
        }
        out.push({ anchor: `${page}#${section.slug}`, page, band, line: line + 1, converted, review: page === reviewPage, entries, cast });
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

/** The checkpoint named by `page.md#id`, or by `page.md:band` (which works before and after conversion). */
export function findCheckpoint(checkpoints: readonly Checkpoint[], spec: string): number {
  const band = /^(.+\.md):(\w+)$/.exec(spec);
  const index = band
    ? checkpoints.findIndex((c) => c.page === band[1] && c.band === band[2]!.toLowerCase())
    : checkpoints.findIndex((c) => c.anchor === spec);
  if (index < 0) {
    throw new Error(`No stage checkpoint ${spec}; use page.md#id or page.md:band, one of:\n  ${checkpoints.map((c) => c.anchor).join("\n  ")}`);
  }
  return index;
}

export type SpacingWord = {
  root: string;
  english: string;
  /** Bank form from the nearest checkpoint that lists the root; the bare root when none does. */
  agazan: string;
  /** The root's `core` cell. */
  core: string;
};

export type ReviewWord = SpacingWord & {
  /** Latest earlier checkpoint whose bank uses the root (its introducing checkpoint when none does). */
  lastUsed: string;
  /** Checkpoints from {@link lastUsed} to this one. */
  gap: number;
};

export type SpacingPlan = {
  checkpoint: Checkpoint;
  /** Roots whose core cell names this checkpoint: its bank order first, then lexicon order. */
  introduce: SpacingWord[];
  /** Core roots introduced at later checkpoints, in path order: candidates to pull forward. */
  pullForward: SpacingWord[];
  /** Roots introduced at earlier checkpoints, unused longest first. */
  review: ReviewWord[];
};

/**
 * Vocabulary choices for checkpoint `index` (docs/meta/translation-exercises.md#core-vocabulary):
 * what it may introduce, what it could pull forward, and review roots ranked by how long the path
 * has gone without them. `gloss` supplies English for a root no bank lists.
 */
export function spacingPlan(
  checkpoints: readonly Checkpoint[],
  core: ReadonlyMap<string, string>,
  index: number,
  gloss: (root: string) => string | undefined = () => undefined,
): SpacingPlan {
  const checkpoint = checkpoints[index]!;
  const order = new Map(checkpoints.map((c, i) => [c.anchor, i]));
  // Root → checkpoint indexes whose bank uses it, ascending.
  const uses = new Map<string, number[]>();
  checkpoints.forEach((c, i) => {
    for (const { root } of c.entries) uses.set(root, [...(uses.get(root) ?? []), i]);
  });
  const word = (root: string, near: number): SpacingWord => {
    const at = uses.get(root) ?? [];
    // Prefer the latest use at or before `near`, else the first use after it.
    const pick = [...at].reverse().find((i) => i <= near) ?? at[0];
    const e = pick === undefined ? undefined : checkpoints[pick]!.entries.find((x) => x.root === root);
    return { root, english: e?.english ?? gloss(root) ?? root, agazan: e?.agazan ?? root, core: core.get(root)! };
  };

  const introduce: SpacingWord[] = [];
  const pullForward: { at: number; w: SpacingWord }[] = [];
  const review: { intro: number; w: ReviewWord }[] = [];
  const bankOrder = new Map(checkpoint.entries.map((e, i) => [e.root, i]));
  for (const [root, cell] of core) {
    const intro = order.get(cell);
    if (intro === undefined) continue;
    if (intro === index) introduce.push(word(root, index));
    else if (intro > index) pullForward.push({ at: intro, w: word(root, intro) });
    else {
      const last = (uses.get(root) ?? []).filter((i) => i < index).at(-1) ?? intro;
      review.push({ intro, w: { ...word(root, last), lastUsed: checkpoints[last]!.anchor, gap: index - last } });
    }
  }
  const rank = (root: string) => bankOrder.get(root) ?? bankOrder.size;
  introduce.sort((a, b) => rank(a.root) - rank(b.root));
  pullForward.sort((a, b) => a.at - b.at);
  review.sort((a, b) => b.w.gap - a.w.gap || a.intro - b.intro);
  return {
    checkpoint,
    introduce,
    pullForward: pullForward.map((p) => p.w),
    review: review.map((r) => r.w),
  };
}

/** Root / stem → `core` cell, from both lexicon CSVs (empty cells left out). */
export function storedCore(): Map<string, string> {
  const core = new Map<string, string>();
  for (const row of parsePublishedCsv(readData("lexicon-published.csv"))) if (row.core) core.set(row.root, row.core);
  for (const row of parseCompoundCsv(readData("lexicon-compounds.csv"))) if (row.core) core.set(row.stem, row.core);
  return core;
}

export type CoreFinding = { page: string; line: number; detail: string };

/**
 * Converted checkpoints against the `core` column, in path order: each **New words** root is
 * introduced here, each **Review** root earlier; at most {@link CORE_CAP} new and at least
 * {@link CORE_REVIEW_MIN} review (fewer only when fewer core roots come before); no core cell
 * names this checkpoint for a root its **New words** leaves out; and house names, the learner
 * slot, and specials sit under **New words** only on the first checkpoint whose bank lists them.
 * A level review has no **New words**: every root it uses was introduced before it.
 * Legacy checkpoints are not checked.
 */
export function lintCoreCounts(checkpoints: readonly Checkpoint[], core: ReadonlyMap<string, string>): CoreFinding[] {
  const order = new Map(checkpoints.map((c, i) => [c.anchor, i]));
  const firstCast = new Map<string, number>();
  checkpoints.forEach((c, i) => {
    for (const { root } of c.cast) if (!firstCast.has(root)) firstCast.set(root, i);
  });
  const introducedBefore = (i: number): number => [...core.values()].filter((anchor) => (order.get(anchor) ?? Infinity) < i).length;

  const findings: CoreFinding[] = [];
  checkpoints.forEach((c, i) => {
    if (!c.converted) return;
    const push = (line: number, detail: string) => findings.push({ page: c.page, line, detail });
    const word = (e: BankEntry) => `*${e.english}* \`${e.agazan}\``;
    const fresh = c.entries.filter((e) => e.group === "new");
    const review = c.entries.filter((e) => e.group === "review");

    if (c.review) {
      for (const e of [...fresh, ...c.cast.filter((x) => x.group === "new")]) {
        push(e.line, `${word(e)}: a level review introduces no words; list it under **Review**`);
      }
    }
    for (const e of c.review ? [] : fresh) {
      const cell = core.get(e.root);
      const at = cell === undefined ? undefined : order.get(cell);
      if (cell === undefined) push(e.line, `${word(e)} is not core: set its core cell to ${c.anchor}`);
      else if (at === undefined || at > i) push(e.line, `${word(e)} is pulled forward: move its core cell from ${cell} to ${c.anchor}`);
      else if (at < i) push(e.line, `${word(e)} was introduced at ${cell}: move it to **Review**`);
    }
    for (const e of review) {
      const cell = core.get(e.root);
      const at = cell === undefined ? undefined : order.get(cell);
      if (cell === undefined) push(e.line, `${word(e)} is not core: move it to **New words** and set its core cell to ${c.anchor}`);
      else if (at === undefined || at >= i) push(e.line, `${word(e)} is introduced at ${cell}, not before this checkpoint: move it to **New words** and its core cell to ${c.anchor}`);
    }

    if (fresh.length > CORE_CAP) push(c.line, `${fresh.length} new core roots; at most ${CORE_CAP}`);
    const need = Math.min(CORE_REVIEW_MIN, introducedBefore(i));
    if (review.length < need) push(c.line, `${review.length} review root(s); use at least ${need} from earlier checkpoints`);

    const listed = new Set(fresh.map((e) => e.root));
    for (const [root, cell] of core) {
      if (cell === c.anchor && !listed.has(root)) {
        push(c.line, `core cell of ${root} names this checkpoint, but **New words** does not list it: move the cell to the next checkpoint that uses it, or clear it`);
      }
    }

    for (const e of c.review ? [] : c.cast) {
      const first = firstCast.get(e.root) === i;
      if (e.group === "new" && !first) push(e.line, `${word(e)} was met at an earlier checkpoint: move it to **Review**`);
      if (e.group === "review" && first) push(e.line, `${word(e)} is first met here: move it to **New words**`);
    }
  });
  return findings;
}

function lineOfOffset(lines: readonly string[], offset: number): number {
  let at = 0;
  for (let i = 0; i < lines.length; i++) {
    if (at >= offset) return i;
    at += lines[i]!.length + 1;
  }
  return lines.length;
}
