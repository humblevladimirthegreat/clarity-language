/**
 * Where constructions are used relative to where they are taught: the anchor-page
 * coverage check and the learning-order check run by `lint:agazan` over the full corpus.
 */
import type { ConstructionEntry } from "../parse/constructions.js";
import { lineNumberAt } from "../retie/tokens.js";
import { constructionFamilies, type ConstructionUse } from "./drill-coverage.js";
import {
  anchorLinks,
  formatSection,
  resolveAnchor,
  sectionAt,
  withinSection,
  type LearningOrder,
  type Section,
} from "./learning-order.js";

type Registry = ReadonlyMap<string, ConstructionEntry>;

/** Each construction's home section (its anchor resolved), `undefined` when the anchor does not resolve. */
export function constructionHomes(order: LearningOrder, registry: Registry): Map<string, Section | undefined> {
  const homes = new Map<string, Section | undefined>();
  for (const [id, entry] of registry) homes.set(id, resolveAnchor(order, entry.anchor));
  return homes;
}

export type CoverageGap = { id: string; anchor: string; summary: string; usedOn: string[] };

/**
 * Check 2 of docs/proposals/parser-strictness.md: every construction is used by
 * an example on the page its anchor names. One gap per construction that is not.
 */
export function constructionCoverageGaps(registry: Registry, uses: readonly ConstructionUse[]): CoverageGap[] {
  const gaps: CoverageGap[] = [];
  for (const [id, entry] of registry) {
    const page = entry.anchor.split("#")[0]!;
    if (uses.some((u) => u.id === id && u.section.page === page)) continue;
    const usedOn = [...new Set(uses.filter((u) => u.id === id).map((u) => u.section.page))];
    gaps.push({ id, anchor: entry.anchor, summary: entry.summary, usedOn });
  }
  return gaps;
}

export type LearningOrderFindings = {
  /** `id  →  anchor` for home anchors that resolve to no heading. */
  unresolved: string[];
  /** `id  →  section` for homes outside every band. */
  unbandedHomes: string[];
  /** Families with no member traced in their home section's subtree. */
  notAtHome: { ids: string[]; home: Section; usedIn: string[] }[];
  /** Uses outside every band, counted per section. */
  unbandedUses: Map<string, number>;
  /** Constructions used in a section before their home, with those sections. */
  forward: Map<string, { home: Section; sections: Set<string> }>;
  /** `page:line  from  →  to` for links that point later in the reading order (report only). */
  links: string[];
  /** Everything except `links`: the findings that fail the run. */
  failures: number;
};

/**
 * Learning order: uses that reach past the current section. Fails on a use before
 * its home, a family not taught at home, a home anchor that does not resolve to a
 * banded heading, and a use outside every band. Forward links are report-only
 * (a link is how a page says "covered later").
 */
export function learningOrderFindings(
  order: LearningOrder,
  registry: Registry,
  allUses: readonly ConstructionUse[],
  pageMarkdown: ReadonlyMap<string, string>,
): LearningOrderFindings {
  // Pages off the sidebar and `## See also` sections are not checked.
  const checked = (s: Section) => order.readingOrder.includes(s.page) && !s.ignored;
  const uses = allUses.filter((u) => checked(u.section));
  const homes = constructionHomes(order, registry);

  const unresolved = [...homes].filter(([, h]) => !h).map(([id]) => `${id}  →  ${registry.get(id)!.anchor}`);
  const unbandedHomes = [...homes]
    .filter(([, h]) => h && h.position === undefined)
    .map(([id, h]) => `${id}  →  ${formatSection(h!)}`);

  // Taught at home, per family: a family is the constructions that share a home
  // section and a first ID segment (`overlay`, `value`, `span`, …), usually the
  // rows of one table. A representative example covers the family, so it passes
  // when some span in the home heading's subtree traces any member. Parser
  // productions (`sentence`, `token`, `word`, `reading`, `resolve`) are one
  // family: they name the same lesson at different parse levels.
  const notAtHome: LearningOrderFindings["notAtHome"] = [];
  for (const { home, ids } of constructionFamilies(homes)) {
    if (uses.some((u) => ids.includes(u.id) && withinSection(home, u.section))) continue;
    const usedIn = [...new Set(uses.filter((u) => ids.includes(u.id)).map((u) => formatSection(u.section)))];
    notAtHome.push({ ids, home, usedIn });
  }

  const forward: LearningOrderFindings["forward"] = new Map();
  const unbandedUses = new Map<string, number>();
  for (const u of uses) {
    const home = homes.get(u.id);
    if (!home || home.position === undefined) continue;
    if (u.section.position === undefined) {
      const key = formatSection(u.section);
      unbandedUses.set(key, (unbandedUses.get(key) ?? 0) + 1);
      continue;
    }
    if (home.position <= u.section.position) continue;
    let f = forward.get(u.id);
    if (!f) forward.set(u.id, (f = { home, sections: new Set() }));
    f.sections.add(formatSection(u.section));
  }

  const links: string[] = [];
  for (const ps of order.pages.values()) {
    if (!order.readingOrder.includes(ps.page)) continue;
    const markdown = pageMarkdown.get(ps.page)!;
    for (const link of anchorLinks(ps.page, markdown)) {
      const from = sectionAt(ps.sections, link.index);
      const to = resolveAnchor(order, `${link.page}#${link.anchor}`);
      if (from.ignored || from.position === undefined || to?.position === undefined || to.position <= from.position) continue;
      links.push(`${ps.page}:${lineNumberAt(markdown, link.index)}  ${formatSection(from)}  →  ${formatSection(to)}`);
    }
  }

  const unbandedCount = [...unbandedUses.values()].reduce((n, c) => n + c, 0);
  const failures = forward.size + notAtHome.length + unresolved.length + unbandedHomes.length + unbandedCount;
  return { unresolved, unbandedHomes, notAtHome, unbandedUses, forward, links, failures };
}
