/**
 * Unit planning for one band: given the page-to-page dependencies from
 * `lint:ageben --deps` and a unit table, find the unit order that breaks the
 * fewest dependencies, list what still breaks, and suggest single sitting
 * moves that break fewer. Used by `npm run plan-units`.
 *
 * A dependency "breaks" when the page it needs comes later in the planned
 * order. Uses (an example needs a construction homed later) count before
 * links (a link points later): one use outweighs any number of links, since a
 * use needs an example rewritten and a link only a prose edit. Ties go to the
 * order with the fewest unit swaps from the table order.
 */

/** One row of `lint:ageben --deps`: `from` uses constructions homed on, or links to, `to`. */
export type DepRow = {
  from: string;
  to: string;
  uses: number;
  links: number;
  /** `id×n` list, space-separated. */
  constructions: string;
  /** `page:line` list, space-separated. */
  linkLines: string;
};

export type Unit = { name: string; pages: string[] };

export type Break = DepRow & { fromUnit: number; toUnit: number };

export type Plan = {
  /** Unit indices (into the table) in planned order. */
  order: number[];
  /** Pages in planned order: units in `order`, each unit's pages in `currentOrder`. */
  pages: string[];
  breaks: Break[];
  uses: number;
  links: number;
};

export type Move = { page: string; fromUnit: number; toUnit: number; plan: Plan };

/** Largest band the exact order search accepts: it is exponential in the unit count. */
export const MAX_UNITS = 20;

/** `clause` or `/clause` or `beginner/clause.md` → `clause.md`. */
export function pageName(s: string): string {
  const leaf = s.trim().replace(/^.*\//, "");
  return leaf.endsWith(".md") ? leaf : `${leaf}.md`;
}

/** Parses `lint:ageben --deps` output (header row first). */
export function parseDeps(tsv: string): DepRow[] {
  const lines = tsv.split("\n").filter((l) => l.trim() !== "");
  if (lines[0]?.startsWith("from\t")) lines.shift();
  return lines.map((line) => {
    const [from = "", to = "", uses = "0", links = "0", constructions = "", linkLines = ""] = line.split("\t");
    return { from: pageName(from), to: pageName(to), uses: Number(uses), links: Number(links), constructions, linkLines };
  });
}

/**
 * Unit tables from Markdown: under each `#`-heading naming a band (`### Beginner`),
 * a table with a `Unit` column and a `Sittings` column (comma-separated pages).
 * Returns band (lowercase) → units.
 */
export function parseUnitTables(markdown: string): Map<string, Unit[]> {
  const out = new Map<string, Unit[]>();
  let band: string | undefined;
  let unitCol = -1;
  let pagesCol = -1;
  for (const line of markdown.split("\n")) {
    const heading = /^#+\s+(Beginner|Intermediate|Advanced)\b/i.exec(line);
    if (heading) {
      band = heading[1]!.toLowerCase();
      unitCol = pagesCol = -1;
      continue;
    }
    if (/^#/.test(line)) {
      band = undefined;
      continue;
    }
    if (!band || !line.trim().startsWith("|")) continue;
    const cells = line.trim().replace(/^\||\|$/g, "").split("|").map((c) => c.trim());
    if (unitCol < 0) {
      unitCol = cells.findIndex((c) => /^unit$/i.test(c));
      pagesCol = cells.findIndex((c) => /^sittings$/i.test(c));
      continue;
    }
    if (pagesCol < 0 || cells.every((c) => /^:?-+:?$/.test(c))) continue;
    const pages = cells[pagesCol]!.split(",").map((p) => p.trim()).filter(Boolean).map(pageName);
    const units = out.get(band) ?? [];
    units.push({ name: cells[unitCol]!.replace(/^\*+|\*+$/g, ""), pages });
    out.set(band, units);
  }
  return out;
}

/** Unit-table problems for one band: pages missing from every unit, unknown pages, pages in two units. */
export function membershipProblems(units: readonly Unit[], bandPages: readonly string[]): string[] {
  const problems: string[] = [];
  const seen = new Map<string, string>();
  for (const u of units) {
    for (const p of u.pages) {
      if (!bandPages.includes(p)) problems.push(`${p} (in ${u.name}) is not a sitting of this band`);
      const other = seen.get(p);
      if (other) problems.push(`${p} is in both ${other} and ${u.name}`);
      seen.set(p, u.name);
    }
  }
  for (const p of bandPages) if (!seen.has(p)) problems.push(`${p} is in no unit`);
  return problems;
}

/** Pages of each unit sorted by their place in `currentOrder` (which satisfies every use). */
function sortedUnits(units: readonly Unit[], currentOrder: readonly string[]): string[][] {
  const at = (p: string) => {
    const i = currentOrder.indexOf(p);
    return i < 0 ? Number.MAX_SAFE_INTEGER : i;
  };
  return units.map((u) => [...u.pages].sort((a, b) => at(a) - at(b)));
}

/**
 * The exact best unit order: dynamic programming over subsets of units. Placing
 * unit `u` after the set `S` breaks every dependency from a unit in `S` on `u`,
 * so the cost of an order is a sum over its prefixes.
 */
export function planUnits(units: readonly Unit[], deps: readonly DepRow[], currentOrder: readonly string[]): Plan {
  const n = units.length;
  if (n > MAX_UNITS) throw new Error(`${n} units: the exact search handles at most ${MAX_UNITS}`);
  const unitOf = new Map<string, number>();
  units.forEach((u, i) => u.pages.forEach((p) => unitOf.set(p, i)));
  const inBand = deps.filter((d) => unitOf.has(d.from) && unitOf.has(d.to));

  // Weights: uses ≫ links ≫ unit swaps from the table order. Each tier's
  // scale exceeds the largest possible total of the tier below, so the sum
  // compares lexicographically and stays an exact integer.
  const swapScale = 1;
  const linkScale = (n * n) / 2 + 1;
  const totalLinks = inBand.reduce((s, d) => s + d.links, 0);
  const useScale = linkScale * (totalLinks + 1);
  // need[v][u]: cost of placing unit v before unit u.
  const need = Array.from({ length: n }, () => new Float64Array(n));
  for (const d of inBand) {
    const v = unitOf.get(d.from)!;
    const u = unitOf.get(d.to)!;
    if (u !== v) need[v]![u]! += d.uses * useScale + d.links * linkScale;
  }
  for (let v = 0; v < n; v++) for (let u = 0; u < v; u++) need[v]![u]! += swapScale;

  const size = 1 << n;
  // add[u][S]: cost of placing u right after the set S.
  const add = Array.from({ length: n }, () => new Float64Array(size));
  for (let u = 0; u < n; u++) {
    const row = add[u]!;
    for (let s = 1; s < size; s++) {
      const low = 31 - Math.clz32(s & -s);
      row[s] = row[s & (s - 1)]! + need[low]![u]!;
    }
  }
  const best = new Float64Array(size).fill(Infinity);
  const last = new Int8Array(size).fill(-1);
  best[0] = 0;
  for (let s = 1; s < size; s++) {
    for (let rest = s; rest; rest &= rest - 1) {
      const u = 31 - Math.clz32(rest & -rest);
      const prev = s & ~(1 << u);
      const c = best[prev]! + add[u]![prev]!;
      // Equal costs: prefer the lower-numbered last unit, for a stable answer.
      if (c < best[s]!) {
        best[s] = c;
        last[s] = u;
      }
    }
  }
  const order: number[] = [];
  for (let s = size - 1; s; s &= ~(1 << last[s]!)) order.unshift(last[s]!);
  return describePlan(units, order, inBand, currentOrder);
}

/** The pages and breaks of one unit order. */
export function describePlan(
  units: readonly Unit[],
  order: readonly number[],
  deps: readonly DepRow[],
  currentOrder: readonly string[],
): Plan {
  const sorted = sortedUnits(units, currentOrder);
  const pages = order.flatMap((u) => sorted[u]!);
  const pos = new Map(pages.map((p, i) => [p, i]));
  const unitOf = new Map<string, number>();
  units.forEach((u, i) => u.pages.forEach((p) => unitOf.set(p, i)));
  const breaks: Break[] = deps
    .filter((d) => pos.has(d.from) && pos.has(d.to) && pos.get(d.to)! > pos.get(d.from)!)
    .map((d) => ({ ...d, fromUnit: unitOf.get(d.from)!, toUnit: unitOf.get(d.to)! }))
    .sort((a, b) => b.uses - a.uses || b.links - a.links);
  return {
    order: [...order],
    pages,
    breaks,
    uses: breaks.reduce((s, b) => s + b.uses, 0),
    links: breaks.reduce((s, b) => s + b.links, 0),
  };
}

/** Whether plan `a` breaks fewer dependencies than `b` (uses first, then links). */
export function better(a: Pick<Plan, "uses" | "links">, b: Pick<Plan, "uses" | "links">): boolean {
  return a.uses < b.uses || (a.uses === b.uses && a.links < b.links);
}

/**
 * Single sitting moves that break fewer dependencies than `plan`, best first.
 * Only pages on either end of a broken dependency are tried, each into every
 * other unit; `allowed` filters a candidate table (size limits, for example).
 */
export function suggestMoves(
  units: readonly Unit[],
  deps: readonly DepRow[],
  currentOrder: readonly string[],
  plan: Plan,
  allowed: (units: readonly Unit[]) => boolean = () => true,
): Move[] {
  const candidates = [...new Set(plan.breaks.flatMap((b) => [b.from, b.to]))];
  const moves: Move[] = [];
  for (const page of candidates) {
    const fromUnit = units.findIndex((u) => u.pages.includes(page));
    if (fromUnit < 0 || units[fromUnit]!.pages.length <= 1) continue;
    for (let toUnit = 0; toUnit < units.length; toUnit++) {
      if (toUnit === fromUnit) continue;
      const moved = units.map((u, i) => ({
        name: u.name,
        pages: i === fromUnit ? u.pages.filter((p) => p !== page) : i === toUnit ? [...u.pages, page] : [...u.pages],
      }));
      if (!allowed(moved)) continue;
      const next = planUnits(moved, deps, currentOrder);
      if (better(next, plan)) moves.push({ page, fromUnit, toUnit, plan: next });
    }
  }
  return moves.sort((a, b) => a.plan.uses - b.plan.uses || a.plan.links - b.plan.links);
}
