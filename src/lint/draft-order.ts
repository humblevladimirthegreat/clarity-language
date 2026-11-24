/**
 * `parse.mjs --at <page>[#<id>]`: the constructions a draft uses whose home comes after
 * a point in the reading order. It reads the order, the homes, and the registry the way
 * the learning-order check of `lint:ageben` does (docs/meta/learning-levels.md#learning-order-check),
 * so a draft that passes here passes there once it is spliced at that point.
 */
import { readFileSync } from "node:fs";

import { pageRelPath, pathPages } from "../../docs/grammar/.vitepress/lib/reading-order.js";
import { fillSelf } from "../learner-name.js";
import type { ConstructionEntry } from "../parse/constructions.js";
import { grammarFile } from "../repo-paths.js";
import { constructionHomes } from "./construction-order.js";
import {
  formatSection,
  learningOrder,
  pageSections,
  type LearningOrder,
  type PageSections,
  type Section,
} from "./learning-order.js";

/** Where a draft will sit: everything at or before `position` is taught by then. */
export type OrderPoint = { label: string; position: number };

export type LaterConstruction = { id: string; home: Section };

/** The learning order of every stage page on disk, as `lint:ageben` builds it. */
export function stageLearningOrder(): LearningOrder {
  const readingOrder = pathPages();
  const pages = new Map<string, PageSections>();
  for (const page of readingOrder) {
    pages.set(page, pageSections(page, fillSelf(readFileSync(grammarFile(page), "utf8"))));
  }
  return learningOrder(readingOrder, pages);
}

/**
 * `clause`, `clause.md`, `beginner/clause.md`, or `docs/grammar/beginner/clause.md`, with an
 * optional `#id`. With an id the point is that section, as the lint compares; with a page alone
 * it is the page's last banded section, so anything homed on the page passes. Throws an Error
 * that says what is wrong with `spec`.
 */
export function orderPoint(order: LearningOrder, spec: string): OrderPoint {
  const hash = spec.indexOf("#");
  const pagePart = (hash < 0 ? spec : spec.slice(0, hash)).replace(/^\.\//, "").replace(/^docs\/grammar\//, "");
  const id = hash < 0 ? undefined : spec.slice(hash + 1);
  const rel = pagePart.endsWith(".md") ? pagePart : `${pagePart}.md`;
  const page = rel.split("/").pop()!;
  if (!order.readingOrder.includes(page) || (rel.includes("/") && pageRelPath(page) !== rel)) {
    throw new Error(
      `--at ${spec}: ${rel} is not on the reading order (a recipe page or a cheat sheet is off it; check a recipe page by its **Needs:** line)`,
    );
  }
  const sections = order.pages.get(page)?.sections ?? [];
  if (id === undefined) {
    const positions = sections.flatMap((s) => (s.position === undefined ? [] : [s.position]));
    if (positions.length === 0) throw new Error(`--at ${spec}: ${page} has no banded section`);
    return { label: page, position: Math.max(...positions) };
  }
  const section = order.pages.get(page)?.anchors.get(id);
  if (!section) throw new Error(`--at ${spec}: ${page} has no heading or <a id> "${id}"`);
  if (section.position === undefined) {
    throw new Error(`--at ${spec}: #${id} is outside every band (a See also section or an unbanded heading); name a banded section`);
  }
  return { label: `${page}#${id}`, position: section.position };
}

/**
 * The constructions in `ids` whose home comes after `point`, once each, in input order.
 * A home that does not resolve or lies outside every band is skipped: the lint reports it.
 */
export function laterConstructions(
  order: LearningOrder,
  registry: ReadonlyMap<string, ConstructionEntry>,
  point: OrderPoint,
  ids: readonly string[],
): LaterConstruction[] {
  const homes = constructionHomes(order, registry);
  const out: LaterConstruction[] = [];
  for (const id of new Set(ids)) {
    const home = homes.get(id);
    if (home?.position !== undefined && home.position > point.position) out.push({ id, home });
  }
  return out;
}

/** The finding line, in the lint's wording. */
export function formatLater(later: LaterConstruction, point: OrderPoint): string {
  return `learning-order  ${later.id}  →  ${formatSection(later.home)}  (taught after ${point.label}: rewrite with forms taught by here)`;
}
