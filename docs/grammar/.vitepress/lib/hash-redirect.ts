/**
 * Retired band fragments on a parent path (`joins.html#intermediate`).
 * Amplify never sees hashes; the theme rewrites them in the browser.
 */
export type HashRedirect = {
  /** Grammar page file (`joins.md`). */
  page: string
  /** Retired fragment without `#` (`intermediate`). */
  hash: string
  /** Target grammar page file. Same as `page` means drop the hash and stay. */
  to: string
}

export const hashRedirects: HashRedirect[] = [
  { page: "causation.md", hash: "intermediate", to: "iff-fault.md" },
  { page: "causation.md", hash: "beginner", to: "causation.md" },
  { page: "predication.md", hash: "intermediate", to: "label-scope.md" },
  { page: "predication.md", hash: "beginner", to: "predication.md" },
  { page: "restrictors.md", hash: "intermediate", to: "more-occasions.md" },
  { page: "restrictors.md", hash: "beginner", to: "restrictors.md" },
  { page: "word-endings.md", hash: "intermediate", to: "proper-names.md" },
  { page: "word-endings.md", hash: "beginner", to: "word-endings.md" },
  { page: "speech-moves.md", hash: "intermediate", to: "speech-acts.md" },
  { page: "speech-moves.md", hash: "beginner", to: "speech-moves.md" },
  { page: "pronouns.md", hash: "intermediate", to: "tag-pronouns.md" },
  { page: "pronouns.md", hash: "beginner", to: "pronouns.md" },
  { page: "plurality.md", hash: "intermediate", to: "collectives.md" },
  { page: "plurality.md", hash: "beginner", to: "plurality.md" },
  { page: "questions.md", hash: "intermediate", to: "polar-inventory.md" },
  { page: "questions.md", hash: "beginner", to: "questions.md" },
  { page: "sakes.md", hash: "intermediate", to: "prescription.md" },
  { page: "sakes.md", hash: "beginner", to: "sakes.md" },
  { page: "intention.md", hash: "intermediate", to: "ability.md" },
  { page: "intention.md", hash: "beginner", to: "intention.md" },
  { page: "roles.md", hash: "intermediate", to: "viewpoint.md" },
  { page: "roles.md", hash: "beginner", to: "roles.md" },
  { page: "phonology.md", hash: "intermediate", to: "phonotactics.md" },
  { page: "phonology.md", hash: "advanced", to: "singability.md" },
  { page: "phonology.md", hash: "beginner", to: "phonology.md" },
  { page: "clause.md", hash: "intermediate", to: "left-bound.md" },
  { page: "clause.md", hash: "advanced", to: "emphasis.md" },
  { page: "clause.md", hash: "beginner", to: "clause.md" },
  { page: "spans.md", hash: "intermediate", to: "span-mention.md" },
  { page: "spans.md", hash: "advanced", to: "span-nesting.md" },
  { page: "spans.md", hash: "beginner", to: "spans.md" },
  { page: "numbers.md", hash: "intermediate", to: "number-markers.md" },
  { page: "numbers.md", hash: "advanced", to: "stacked-markers.md" },
  { page: "numbers.md", hash: "beginner", to: "numbers.md" },
  { page: "comparatives.md", hash: "intermediate", to: "comparative-arity.md" },
  { page: "comparatives.md", hash: "advanced", to: "stance-bars.md" },
  { page: "comparatives.md", hash: "beginner", to: "comparatives.md" },
  { page: "knowing.md", hash: "intermediate", to: "evidentiality.md" },
  { page: "knowing.md", hash: "advanced", to: "universality.md" },
  { page: "knowing.md", hash: "beginner", to: "knowing.md" },
  { page: "compounds.md", hash: "intermediate", to: "compound-families.md" },
  { page: "compounds.md", hash: "advanced", to: "root-tails.md" },
  { page: "compounds.md", hash: "beginner", to: "compounds.md" },
  { page: "dependents.md", hash: "intermediate", to: "sentence-linkers.md" },
  { page: "dependents.md", hash: "advanced", to: "stand-in-roles.md" },
  { page: "dependents.md", hash: "beginner", to: "dependents.md" },
  { page: "joins.md", hash: "intermediate", to: "rank-joins.md" },
  { page: "joins.md", hash: "advanced", to: "join-islands.md" },
  { page: "joins.md", hash: "beginner", to: "joins.md" },
  { page: "hooks.md", hash: "intermediate", to: "ending-grids.md" },
  { page: "hooks.md", hash: "advanced", to: "hook-compounds.md" },
  { page: "hooks.md", hash: "beginner", to: "hooks.md" },
  { page: "relations.md", hash: "intermediate", to: "of-relations.md" },
  { page: "relations.md", hash: "advanced", to: "as-of.md" },
  { page: "relations.md", hash: "beginner", to: "relations.md" },
  { page: "digitless-exponents.md", hash: "advanced", to: "special-values.md" },
  { page: "digitless-exponents.md", hash: "intermediate", to: "digitless-exponents.md" },
  { page: "numbers-applied.md", hash: "advanced", to: "initials.md" },
  { page: "numbers-applied.md", hash: "intermediate", to: "numbers-applied.md" },
  { page: "review.md", hash: "intermediate", to: "review-intermediate.md" },
  { page: "review.md", hash: "advanced", to: "review-advanced.md" },
  { page: "review.md", hash: "beginner", to: "review.md" },
  { page: "topic.md", hash: "intermediate", to: "topic.md" },
  { page: "fill-ask-roles.md", hash: "intermediate", to: "fill-ask-roles.md" },
  { page: "discourse-hooks.md", hash: "intermediate", to: "discourse-hooks.md" },
  { page: "join-across-roles.md", hash: "intermediate", to: "join-across-roles.md" },
  { page: "notional-standing.md", hash: "intermediate", to: "notional-standing.md" },
  { page: "feelings-permission.md", hash: "intermediate", to: "feelings-permission.md" },
  { page: "numeric-derivation.md", hash: "advanced", to: "numeric-derivation.md" },
]

/** VitePress route path (`/joins.html`) → grammar page file (`joins.md`). */
export function routePathToPage(path: string): string {
  const stem = path
    .split(/[?#]/, 1)[0]!
    .replace(/^\//, '')
    .replace(/\.html$/, '')
  return `${stem || 'index'}.md`
}

/** Grammar page file (`rank-joins.md`) → VitePress route path (`/rank-joins.html`). */
export function pageToRoutePath(page: string): string {
  const stem = page.replace(/\.md$/, '')
  return stem === 'index' ? '/' : `/${stem}.html`
}

/**
 * Where a retired band hash should go. `hash` may include `#`.
 * The replacement keeps `?query`; it never keeps the old fragment.
 */
export function applyHashRedirect(
  path: string | undefined,
  hash: string | undefined,
  map: readonly HashRedirect[] = hashRedirects,
): { path: string; hash: string } | undefined {
  const fragment = hash?.replace(/^#/, '')
  if (!fragment || !path) return
  const page = routePathToPage(path)
  const row = map.find((item) => item.page === page && item.hash === fragment)
  if (!row) return
  return { path: pageToRoutePath(row.to), hash: '' }
}
