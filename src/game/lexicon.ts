/**
 * The game's view of the published lexicon. Game data names a row by its concrete sense (`door`,
 * `magnify`), never by its spelling, so a respelling reaches the game with no retie pass.
 */
import { senseFormRoot, type PublishedRow } from "../lexicon-search.js";
import type { ClassifyTables } from "../parse/classify.js";

export type GameLexicon = {
  tables: ClassifyTables;
  /** The published row for a root. */
  row(root: string): PublishedRow | undefined;
  /** Root of the row whose concrete sense is `concrete`; throws when no row has it. */
  root(concrete: string): string;
  /** Concrete sense of a root (the root itself when unpublished). */
  concrete(root: string): string;
  /** Roots whose concrete sense, abstract sense, or role English reads `label` (`see` → the eye root). */
  rootsLabelled(label: string): string[];
};

export function gameLexicon(tables: ClassifyTables): GameLexicon {
  const byConcrete = new Map<string, string>();
  const byLabel = new Map<string, Set<string>>();
  const label = (text: string, root: string) => {
    if (!text) return;
    let set = byLabel.get(text);
    if (!set) byLabel.set(text, (set = new Set()));
    set.add(root);
  };
  for (const row of tables.published.values()) {
    byConcrete.set(row.concrete, row.root);
    label(row.concrete, row.root);
    label(row.abstract, row.root);
    for (const map of [row.posEnglish.concrete, row.posEnglish.abstract]) for (const english of Object.values(map)) label(english ?? "", row.root);
  }
  // Closed overlay words gloss by their own label (`uwon` is *speaker*).
  for (const overlay of tables.overlays.values()) {
    const root = senseFormRoot(overlay.senseForm);
    if (tables.published.has(root)) label(overlay.gloss, root);
  }
  for (const compound of tables.compounds.values()) {
    label(compound.concrete, compound.stem);
    label(compound.abstract, compound.stem);
  }
  return {
    tables,
    row: (root) => tables.published.get(root),
    root(concrete) {
      const root = byConcrete.get(concrete);
      if (!root) throw new Error(`no published row has the concrete sense "${concrete}"`);
      return root;
    },
    concrete: (root) => tables.published.get(root)?.concrete ?? tables.compounds.get(root)?.concrete ?? root,
    rootsLabelled: (text) => [...(byLabel.get(text) ?? [])],
  };
}
