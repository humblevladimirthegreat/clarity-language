/** Words in a parse result that the lexicon does not know, with the compound reading the parser would offer. */
export type UnknownWord = {
  raw: string;
  /** `left+join+right` readings over published roots (display only); empty when the word splits nowhere. */
  maybeCompound: string[];
};

/**
 * The parser accepts any well-formed root, so a parse that succeeds says nothing about whether the
 * lexicon has the word. Walk a parse result and list every word whose reading is `unknown`; an
 * unlisted compound stem shows up here with its possible split. Words the lexicon lists
 * (published roots, `lexicon-compounds.csv` stems, overlays) are not reported.
 */
export function unknownWords(result: unknown): UnknownWord[] {
  const found: UnknownWord[] = [];
  const seen = new Set<string>();
  const visit = (node: unknown): void => {
    if (Array.isArray(node)) {
      for (const item of node) visit(item);
      return;
    }
    if (!node || typeof node !== "object") return;
    const word = node as {
      raw?: unknown;
      reading?: unknown;
      potentialCompounds?: { left: string; join: string; right: string }[];
    };
    if (typeof word.raw === "string" && word.reading === "unknown" && !seen.has(word.raw)) {
      seen.add(word.raw);
      found.push({
        raw: word.raw,
        maybeCompound: (word.potentialCompounds ?? []).map((c) => `${c.left}+${c.join}+${c.right}`),
      });
    }
    for (const value of Object.values(node)) visit(value);
  };
  visit(result);
  return found;
}
