/**
 * Gating from the docs: a line the game shows is within the player's reach when every construction it
 * uses is taught at or before the player's place on the cross-doc path, and every root it uses has been
 * introduced (docs/meta/learning-levels.md#cross-doc-path, docs/meta/lexicon.md#core-vocabulary-column).
 * The data comes from the grammar pages at build time ([build.ts](./build.ts)); this file stays browser-safe.
 */

export type GateSection = {
  /** `page.md#id`. */
  anchor: string;
  title: string;
  band: string;
};

export type GateData = {
  /** Banded sections in learning order; a position is an index here. */
  sections: GateSection[];
  /** Construction id → position of the section that teaches it. */
  homes: Record<string, number>;
  /** Core root → position of the checkpoint that introduces it. */
  coreRoots: Record<string, number>;
  /** Roots taught as grammar rather than vocabulary (house cast, specials, sakes): never gated as words. */
  grammarRoots: string[];
};

/** Where the player is: everything up to `position` is taught. `Infinity` opens everything (the sandbox). */
export type Progress = { position: number };

export const EVERYTHING: Progress = { position: Number.POSITIVE_INFINITY };

export type GateResult = {
  ok: boolean;
  /** Constructions taught after the player's position, or with no known home. */
  constructions: string[];
  /** Roots not yet introduced. */
  roots: string[];
};

/** Whether a line using `constructions` and `roots` is within reach; `newRoot` is the scene's one new root. */
export function gate(
  data: GateData,
  progress: Progress,
  constructions: Iterable<string>,
  roots: Iterable<string>,
  newRoot?: string,
): GateResult {
  if (progress.position === Number.POSITIVE_INFINITY) return { ok: true, constructions: [], roots: [] };
  const grammar = new Set(data.grammarRoots);
  const lateConstructions = [...new Set(constructions)].filter((id) => !((data.homes[id] ?? Number.POSITIVE_INFINITY) <= progress.position));
  const lateRoots = [...new Set(roots)].filter(
    (root) => root !== newRoot && !grammar.has(root) && !((data.coreRoots[root] ?? Number.POSITIVE_INFINITY) <= progress.position),
  );
  return { ok: lateConstructions.length === 0 && lateRoots.length === 0, constructions: lateConstructions, roots: lateRoots };
}

/** The furthest section a set of constructions needs: the earliest position at which a line using them all is in reach. */
export function neededPosition(data: GateData, constructions: Iterable<string>): number {
  let needed = -1;
  for (const id of constructions) needed = Math.max(needed, data.homes[id] ?? Number.POSITIVE_INFINITY);
  return needed;
}

/** Checkpoint sections (`### Practice`) in path order: the stops a tester can pretend to have reached. */
export function checkpointStops(data: GateData): { position: number; section: GateSection }[] {
  return data.sections.flatMap((section, position) => (/#[a-z]+-practice$/.test(section.anchor) ? [{ position, section }] : []));
}
