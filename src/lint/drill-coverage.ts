/**
 * Drill coverage: every construction family taught in a band on a page is
 * practiced by that page's same-band translation drill
 * (`### Translation practice {#<band>-translation-practice}`). Either drill
 * direction counts. Page + band pairs marked **skip** in the allowlist of
 * docs/meta/drill-generation.md are exempt.
 */
import { BANDS, formatSection, withinSection, type Band, type LearningOrder, type Section } from "./learning-order.js";

/** Parser productions name the same lesson at different parse levels: one family. */
export const PARSER_SEGMENTS = new Set(["sentence", "token", "word", "reading", "resolve"]);

export type Family = { home: Section; ids: string[]; parser: boolean };

/**
 * Constructions that share a home section and a first ID segment (`overlay`,
 * `value`, `span`, …), usually the rows of one table. Parser productions are one
 * family per home.
 */
export function constructionFamilies(homes: ReadonlyMap<string, Section | undefined>): Family[] {
  const families = new Map<string, Family>();
  for (const [id, home] of homes) {
    if (!home) continue;
    const segment = id.split(".", 1)[0]!;
    const parser = PARSER_SEGMENTS.has(segment);
    const key = `${formatSection(home)} ${parser ? "parser" : segment}`;
    let family = families.get(key);
    if (!family) families.set(key, (family = { home, ids: [], parser }));
    family.ids.push(id);
  }
  return [...families.values()];
}

/**
 * `page|band` keys of allowlist rows with Status **skip**. A table with no Band
 * column (the Beginner path) is Beginner.
 */
export function drillSkips(markdown: string): Set<string> {
  const skips = new Set<string>();
  let header: string[] | undefined;
  for (const line of markdown.split("\n")) {
    if (!line.trimStart().startsWith("|")) {
      header = undefined;
      continue;
    }
    const cells = line.trim().replace(/^\||\|$/g, "").split("|").map((c) => c.trim());
    if (!header) {
      header = cells.map((c) => c.toLowerCase());
      continue;
    }
    if (cells.every((c) => /^:?-+:?$/.test(c))) continue;
    const at = (name: string) => {
      const i = header!.indexOf(name);
      return i < 0 ? undefined : cells[i]?.replace(/[`*]/g, "").trim();
    };
    const file = at("file");
    const status = at("status")?.toLowerCase();
    if (!file || status !== "skip") continue;
    const band = (at("band")?.toLowerCase() ?? "beginner") as Band;
    if (BANDS.includes(band)) skips.add(`${file}|${band}`);
  }
  return skips;
}

/** Drill sections on a page in one band (`Translation practice` headings). */
export function drillSections(sections: readonly Section[], band: Band): Section[] {
  return sections.filter((s) => s.band === band && !s.ignored && /^translation practice\b/i.test(s.title));
}

/** `page|band` pairs with more than one drill section: each band has one checkpoint. */
export function duplicateDrills(order: LearningOrder): { key: string; drills: Section[] }[] {
  const out: { key: string; drills: Section[] }[] = [];
  for (const ps of order.pages.values()) {
    if (!order.readingOrder.includes(ps.page)) continue;
    for (const band of BANDS) {
      const drills = drillSections(ps.sections, band);
      if (drills.length > 1) out.push({ key: `${ps.page}|${band}`, drills });
    }
  }
  return out;
}

export type ConstructionUse = { id: string; section: Section };

export type DrillCoverage = {
  /** `page|band` pairs that home a family but have no drill section. */
  missing: string[];
  /** Families whose drill sections trace no member. */
  uncovered: { family: Family; drills: Section[] }[];
  covered: number;
};

export function drillCoverage(
  order: LearningOrder,
  families: readonly Family[],
  uses: readonly ConstructionUse[],
  skips: ReadonlySet<string>,
): DrillCoverage {
  const missing = new Set<string>();
  const uncovered: DrillCoverage["uncovered"] = [];
  let covered = 0;
  for (const family of families) {
    const { home } = family;
    if (family.parser || !home.band || home.ignored || !order.readingOrder.includes(home.page)) continue;
    const key = `${home.page}|${home.band}`;
    if (skips.has(key)) continue;
    const drills = drillSections(order.pages.get(home.page)?.sections ?? [], home.band);
    if (drills.length === 0) {
      missing.add(key);
      continue;
    }
    if (uses.some((u) => family.ids.includes(u.id) && drills.some((d) => withinSection(d, u.section)))) covered += 1;
    else uncovered.push({ family, drills });
  }
  return { missing: [...missing], uncovered, covered };
}
