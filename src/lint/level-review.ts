/**
 * Level reviews (docs/meta/translation-exercises.md#level-reviews): the review page holds one
 * `### Practice` per level band, read after every stage band of that level. Each item's answer
 * ends with a **Rule:** link to the stage section it tests, every stage checkpoint of the band
 * has at least one item pointing at its page, and the item counts follow the review mix.
 */
import { drillSections } from "./drill-coverage.js";
import { BANDS, resolveAnchor, withinSection, type LearningOrder, type Section } from "./learning-order.js";
import { practiceItems, type PracticeItem } from "./practice-items.js";

/** Items per review: one per stage checkpoint of the band, plus up to `extra`. */
export const REVIEW_EXTRA_ITEMS = 3;
/** Fewest items per translation direction. */
export const REVIEW_TRANSLATION_MIN = 3;
/** **Pick one** is at least this share of the items; **Fix it** + **What changes** at most `otherShare`. */
export const REVIEW_PICK_SHARE = 1 / 3;
export const REVIEW_OTHER_SHARE = 1 / 4;

export type LevelReviewFinding = { index: number; detail: string };

const RULE_LINK_RE = /^\*\*Rule:\*\*\s*\[[^\]]+\]\(([^)#\s]*)#([^)\s]+)\)\s*$/;

/**
 * Findings for `reviewPage` (its markdown as given to `pageSections`). `order` must list the
 * review page after the stage pages, so stage pages are every other page of its reading order.
 */
export function lintLevelReview(order: LearningOrder, reviewPage: string, markdown: string): LevelReviewFinding[] {
  const page = order.pages.get(reviewPage);
  if (!page) return [];
  const stagePages = order.readingOrder.filter((p) => p !== reviewPage);
  const { items } = practiceItems(markdown, { review: true });
  const findings: LevelReviewFinding[] = [];

  for (const band of BANDS) {
    const checkpoints = stagePages.flatMap((p) => drillSections(order.pages.get(p)?.sections ?? [], band));
    for (const drill of drillSections(page.sections, band)) {
      const inDrill = items.filter((item) => item.index >= drill.offset && item.index < drill.end);
      const covered = new Set<string>();
      for (const item of inDrill) {
        const target = ruleTarget(item, order, band, (detail) => findings.push({ index: item.index, detail: `${label(item)}: ${detail}` }));
        if (target) covered.add(target.page);
      }
      for (const c of checkpoints) {
        if (!covered.has(c.page)) {
          findings.push({ index: drill.offset, detail: `no item has a **Rule:** link to ${c.page} ${band}; give each ${band} page at least one item` });
        }
      }
      findings.push(...countFindings(inDrill, checkpoints.length, drill.offset));
    }
  }
  return findings;
}

/** The section an item's **Rule:** line links to, when it is a teaching section of this band. */
function ruleTarget(item: PracticeItem, order: LearningOrder, band: string, push: (detail: string) => void): Section | undefined {
  const rules = item.spoiler.filter((line) => line.kind === "rule");
  if (rules.length !== 1) {
    push(rules.length === 0 ? "answer needs a **Rule:** link to the section it tests" : "answer has more than one **Rule:** line");
    if (rules.length === 0) return undefined;
  }
  if (item.spoiler.at(-1)?.kind !== "rule") push("**Rule:** must be the last line of the answer");
  const m = RULE_LINK_RE.exec(rules[0]!.text);
  if (!m) {
    push("write the rule as **Rule:** [Section title](page.md#id)");
    return undefined;
  }
  const file = m[1]!.replace(/^\.\//, "").replace(/(?:\.html)?$/, "").replace(/(?:\.md)?$/, ".md");
  if (!m[1] || !order.readingOrder.includes(file)) {
    push(`**Rule:** must link a stage page section, not \`${m[1] || "this page"}\``);
    return undefined;
  }
  const section = resolveAnchor(order, `${file}#${m[2]}`);
  if (!section) {
    push(`**Rule:** link ${file}#${m[2]} names no section`);
    return undefined;
  }
  if (section.band !== band || section.ignored) {
    push(`**Rule:** link ${file}#${m[2]} is not in ${file} ${band}`);
    return undefined;
  }
  const drills = drillSections(order.pages.get(file)?.sections ?? [], band);
  if (drills.some((d) => withinSection(d, section))) {
    push(`**Rule:** link ${file}#${m[2]} is a checkpoint; link the section that teaches the rule`);
    return undefined;
  }
  return section;
}

function countFindings(items: readonly PracticeItem[], checkpoints: number, index: number): LevelReviewFinding[] {
  const out: LevelReviewFinding[] = [];
  const total = items.length;
  const max = checkpoints + REVIEW_EXTRA_ITEMS;
  if (total < checkpoints || total > max) out.push({ index, detail: `${total} item(s); a review has one per stage checkpoint of its level (${checkpoints}), at most ${max}` });
  for (const type of ["en-ag", "ag-en"] as const) {
    const n = items.filter((item) => item.type === type).length;
    if (n < REVIEW_TRANSLATION_MIN) out.push({ index, detail: `${n} ${LABEL[type]} item(s); use at least ${REVIEW_TRANSLATION_MIN}` });
  }
  const picks = items.filter((item) => item.type === "pick").length;
  const needPicks = Math.ceil(total * REVIEW_PICK_SHARE);
  if (picks < needPicks) out.push({ index, detail: `${picks} Pick one item(s); use at least ${needPicks} (a third of the review)` });
  const others = items.filter((item) => item.type === "fix" || item.type === "changes").length;
  const maxOthers = Math.floor(total * REVIEW_OTHER_SHARE);
  if (others > maxOthers) out.push({ index, detail: `${others} Fix it / What changes item(s); use at most ${maxOthers} (a quarter of the review)` });
  return out;
}

const LABEL: Record<PracticeItem["type"], string> = {
  "en-ag": "English → Agazan",
  "ag-en": "Agazan → English",
  pick: "Pick one",
  fix: "Fix it",
  changes: "What changes",
};

function label(item: PracticeItem): string {
  return `${LABEL[item.type]} ${item.number}`;
}
