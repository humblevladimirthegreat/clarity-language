// The owned noun phrase a thanks can follow (*my old coat* `goyuthal`): `my`, any adjectives,
// then nouns, by compromise's term tags. Kept apart from match.ts so the editor loads
// compromise only when a thanks card asks for it.
import nlp from "compromise";

import type { Span } from "./match.js";

type TermJson = { offset: { start: number }; terms: { text: string; normal: string; post: string; tags: string[] }[] };

const NOT_NOUN = ["Date", "Pronoun", "Value", "Possessive"];

/** The first `my …` noun phrase in `text` (offsets relative to `base`), with its words. */
export function ownedNoun(text: string, base = 0): (Span & { text: string }) | undefined {
  const terms = nlp(text).terms().json({ offset: true }) as TermJson[];
  for (let i = 0; i < terms.length; i++) {
    const my = terms[i]!.terms[0]!;
    if (my.normal !== "my" || my.post.trim()) continue;
    let end = -1;
    for (let j = i + 1; j < terms.length; j++) {
      const term = terms[j]!.terms[0]!;
      if (NOT_NOUN.some((tag) => term.tags.includes(tag))) break;
      if (term.tags.includes("Noun")) end = j;
      else if (!term.tags.includes("Adjective")) break;
      if (term.post.trim()) break;
    }
    if (end < 0) continue;
    const from = terms[i]!.offset.start;
    const last = terms[end]!;
    const to = last.offset.start + last.terms[0]!.text.length;
    return { from: base + from, to: base + to, text: text.slice(from, to) };
  }
  return undefined;
}
