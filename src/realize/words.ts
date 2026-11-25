/**
 * Word labels for the realizer (docs/meta/realizer.md#round-trip): the morph-gloss leaf for a root under a role letter
 * and ending, read off the gloss index (`gloss-inverse.ts`), so the realizer never builds an English label or a
 * spelling itself. A thing's root reaches the realizer as its lexicon row's concrete sense (the meaning view's
 * `MeaningRoot`); a detail's root as its spelling in `values.root`.
 */
import type { ClassifyTables } from "../parse/classify.js";
import { indexRootForms, type GlossIndex } from "../parse/gloss-inverse.js";
import type { MeaningRoot } from "./meaning.js";

/** The word endings a plain content word takes: first mention concrete, abstract, and named (word-endings.md). */
export type Ending = "l" | "m" | "n";

type Lexicon = {
  /** Concrete sense → root; a sense two rows share maps to `undefined`. */
  rootOf: Map<string, string | undefined>;
  /** Root → its glossed forms, form → leaf gloss. */
  forms: Map<string, Map<string, string>>;
};

const lexicons = new WeakMap<ClassifyTables, Lexicon>();

function lexicon(tables: ClassifyTables): Lexicon {
  let lex = lexicons.get(tables);
  if (lex) return lex;
  const rootOf = new Map<string, string | undefined>();
  const note = (sense: string | undefined, root: string): void => {
    if (!sense) return;
    rootOf.set(sense, rootOf.has(sense) && rootOf.get(sense) !== root ? undefined : root);
  };
  for (const [root, row] of tables.published) note(row.concrete, root);
  for (const [root, row] of tables.compounds) if (!tables.published.get(root)?.concrete) note(row.concrete, root);
  lex = { rootOf, forms: new Map() };
  lexicons.set(tables, lex);
  return lex;
}

/** The root a meaning-view root names: its row's root for a sense, else its own spelling; undefined when a sense is shared. */
export function rootOf(root: MeaningRoot, tables: ClassifyTables): string | undefined {
  return "sense" in root ? lexicon(tables).rootOf.get(root.sense) : root.spelling;
}

/**
 * The leaf gloss of `root` under role letter `pos` with `ending` (`z-dog`, `v-see`, `h-haste`), as the gloss index
 * glosses that form; undefined when the index has no such form. The form is only a key into the index: the line the
 * realizer writes is spelled from the gloss by `spell`.
 */
export function leaf(pos: string, root: string, ending: Ending, tables: ClassifyTables): string | undefined {
  const lex = lexicon(tables);
  let forms = lex.forms.get(root);
  if (!forms) {
    const index: GlossIndex = { forms: new Map(), roots: new Map() };
    indexRootForms(index, root, tables);
    forms = new Map();
    for (const [gloss, surfaces] of index.forms) for (const surface of surfaces) forms.set(surface, gloss);
    lex.forms.set(root, forms);
  }
  return forms.get(`${pos}${root}${ending}`);
}
