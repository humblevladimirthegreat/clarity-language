/**
 * Retired fragments on a grammar path: band fragments (`joins.html#intermediate`)
 * and H3s that moved to another page (`a.html#x` → `b.html#x`).
 * Amplify never sees hashes; the theme rewrites them in the browser.
 * `npm run move-heading` and `npm run peel-headings` write the H3 rows.
 */
export type HashRedirect = {
  /** Grammar page file (`joins.md`). */
  page: string
  /** Retired fragment without `#` (`intermediate`). */
  hash: string
  /** Target grammar page file. Same as `page` with no `toHash` means drop the hash and stay. */
  to: string
  /** Fragment to land on, without `#`. Omitted: the old fragment is dropped (page top). */
  toHash?: string
}

export const hashRedirects: HashRedirect[] = [
  { page: "causation.md", hash: "intermediate", to: "because-and-iff.md" },
  { page: "causation.md", hash: "beginner", to: "causation.md" },
  { page: "predication.md", hash: "intermediate", to: "label-reach.md" },
  { page: "predication.md", hash: "beginner", to: "predication.md" },
  { page: "restrictors.md", hash: "intermediate", to: "more-occasions.md" },
  { page: "restrictors.md", hash: "beginner", to: "restrictors.md" },
  { page: "word-endings.md", hash: "intermediate", to: "proper-names.md" },
  { page: "word-endings.md", hash: "beginner", to: "word-endings.md" },
  { page: "speech-moves.md", hash: "intermediate", to: "more-turn-words.md" },
  { page: "speech-moves.md", hash: "beginner", to: "speech-moves.md" },
  { page: "pronouns.md", hash: "intermediate", to: "tag-pronouns.md" },
  { page: "pronouns.md", hash: "beginner", to: "pronouns.md" },
  { page: "plurality.md", hash: "intermediate", to: "collectives.md" },
  { page: "plurality.md", hash: "beginner", to: "plurality.md" },
  { page: "questions.md", hash: "intermediate", to: "polar-inventory.md" },
  { page: "questions.md", hash: "beginner", to: "questions.md" },
  { page: "sakes.md", hash: "intermediate", to: "for-a-sake.md" },
  { page: "sakes.md", hash: "beginner", to: "sakes.md" },
  { page: "intention.md", hash: "intermediate", to: "want-and-decide.md" },
  { page: "intention.md", hash: "beginner", to: "intention.md" },
  { page: "roles.md", hash: "intermediate", to: "viewpoint.md" },
  { page: "roles.md", hash: "beginner", to: "roles.md" },
  { page: "phonology.md", hash: "intermediate", to: "phonotactics.md" },
  { page: "phonology.md", hash: "advanced", to: "singability.md" },
  { page: "phonology.md", hash: "beginner", to: "phonology.md" },
  { page: "clause.md", hash: "intermediate", to: "longer-chains.md" },
  { page: "clause.md", hash: "advanced", to: "tone-marks.md", toHash: "emphasis-and-clefts" },
  { page: "clause.md", hash: "beginner", to: "clause.md" },
  { page: "spans.md", hash: "intermediate", to: "spans-as-words.md" },
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
  { page: "joins.md", hash: "advanced", to: "join-limits.md" },
  { page: "joins.md", hash: "beginner", to: "joins.md" },
  { page: "hooks.md", hash: "intermediate", to: "in-clause-hooks.md" },
  { page: "hooks.md", hash: "advanced", to: "hook-compounds.md" },
  { page: "hooks.md", hash: "beginner", to: "hooks.md" },
  { page: "relations.md", hash: "intermediate", to: "of-relations.md" },
  { page: "relations.md", hash: "advanced", to: "as-of.md" },
  { page: "relations.md", hash: "beginner", to: "relations.md" },
  { page: "digitless-exponents.md", hash: "advanced", to: "special-values.md" },
  { page: "digitless-exponents.md", hash: "intermediate", to: "digitless-exponents.md" },
  { page: "measures-and-percent.md", hash: "advanced", to: "initials.md" },
  { page: "measures-and-percent.md", hash: "intermediate", to: "measures-and-percent.md" },
  { page: "review.md", hash: "intermediate", to: "review-intermediate.md" },
  { page: "review.md", hash: "advanced", to: "review-advanced.md" },
  { page: "review.md", hash: "beginner", to: "review.md" },
  { page: "topic.md", hash: "intermediate", to: "topic.md" },
  { page: "fill-ask-roles.md", hash: "intermediate", to: "fill-ask-roles.md" },
  { page: "discourse-hooks.md", hash: "intermediate", to: "discourse-hooks.md" },
  { page: "verb-and-stance-joins.md", hash: "intermediate", to: "verb-and-stance-joins.md" },
  { page: "residue-and-former.md", hash: "intermediate", to: "residue-and-former.md" },
  { page: "feelings.md", hash: "intermediate", to: "feelings.md" },
  { page: "numeric-derivation.md", hash: "advanced", to: "numeric-derivation.md" },
  { page: "more-turn-words.md", hash: "tone-marks", to: "tone-marks.md" },
  { page: "more-turn-words.md", hash: "speech-acts-and-tone-marks", to: "more-turn-words.md" },
  { page: "rank-joins.md", hash: "universals-domains-generics", to: "universals-domains.md" },
  { page: "rank-joins.md", hash: "not-every", to: "universals-domains.md" },
  { page: "rank-joins.md", hash: "kind-reference", to: "universals-domains.md" },
  { page: "rank-joins.md", hash: "generic-neighbors", to: "universals-domains.md" },
  { page: "rank-joins.md", hash: "kind-domains", to: "universals-domains.md" },
  { page: "rank-joins.md", hash: "generics", to: "universals-domains.md" },
  { page: "rank-joins.md", hash: "every-k", to: "universals-domains.md" },
  { page: "hook-compounds.md", hash: "hooked-joins", to: "hooked-joins.md" },
  { page: "hook-compounds.md", hash: "hooked-joins-hooks", to: "hooked-joins.md" },
  { page: "hook-compounds.md", hash: "hooked-joins-endings", to: "hooked-joins.md" },
  { page: "hook-compounds.md", hash: "hooked-joins-point-back", to: "hooked-joins.md" },
  { page: "hook-compounds.md", hash: "hooked-joins-time", to: "hooked-joins.md" },
  { page: "hook-compounds.md", hash: "hooked-joins-clause", to: "hooked-joins.md" },
  { page: "verb-and-stance-joins.md", hash: "vp-clause-forms", to: "verb-and-stance-joins.md" },
  { page: "verb-and-stance-joins.md", hash: "vowels--endings", to: "verb-and-stance-joins.md" },
  { page: "verb-and-stance-joins.md", hash: "ending-senses-clause-joins", to: "verb-and-stance-joins.md" },
  { page: "evidentiality.md", hash: "holder", to: "holder.md" },
  { page: "evidentiality.md", hash: "holder-seam", to: "holder.md" },
  { page: "for-a-sake.md", hash: "contrary-to-stance", to: "contrary-to.md", toHash: "contrary-to-stance" },
  { page: "residue-and-former.md", hash: "channel-zone", to: "contrary-to.md", toHash: "channel-zone" },
  { page: "roles.md", hash: "role-pointers-family", to: "pronouns.md", toHash: "role-pointers" },
  { page: "proper-names.md", hash: "number-word-exception", to: "number-markers.md", toHash: "number-endings" },
  { page: "measures-and-percent.md", hash: "letter-codes", to: "number-markers.md", toHash: "letter-codes" },
  { page: "measures-and-percent.md", hash: "number-ranges", to: "ranges.md", toHash: "number-ranges" },
  { page: "proper-names.md", hash: "continue-x", to: "sentence-linkers.md", toHash: "continue-x" },
  { page: "dependents.md", hash: "continue-x", to: "speech-moves.md", toHash: "continue-x" },
  { page: "singability.md", hash: "thinking-sounds", to: "phonology.md", toHash: "thinking-sounds" },
  { page: "label-reach.md", hash: "command-property", to: "more-turn-words.md", toHash: "command-property" },
  { page: "sentence-linkers.md", hash: "orthography-and-prosody-periods", to: "sentence-linkers.md", toHash: "past-a-period" },
  { page: "sentence-linkers.md", hash: "result-hinge", to: "more-hinges.md", toHash: "result-hinge" },
  { page: "sentence-linkers.md", hash: "time-hinge-on-noun", to: "more-hinges.md", toHash: "time-hinge-on-noun" },
  { page: "stand-in-roles.md", hash: "nested-dependents", to: "nested-dependents.md", toHash: "nested-dependents" },
  { page: "try.md", hash: "decision-revisability", to: "want-and-decide.md", toHash: "decision-revisability" },
  { page: "try.md", hash: "decision", to: "want-and-decide.md", toHash: "decision" },
  { page: "try.md", hash: "decision-mood", to: "want-and-decide.md", toHash: "decision-mood" },
  { page: "try.md", hash: "decision-changeability", to: "want-and-decide.md", toHash: "decision-changeability" },
  { page: "comparative-arity.md", hash: "bars", to: "bars.md", toHash: "bars" },
  { page: "residue-and-former.md", hash: "channel-bars", to: "bars.md", toHash: "channel-bars" },
  { page: "tag-pronouns.md", hash: "reciprocal", to: "collectives.md", toHash: "reciprocal" },
  { page: "tag-pronouns.md", hash: "addressing-several-people", to: "collectives.md", toHash: "addressing-several-people" },
  { page: "tag-pronouns.md", hash: "how-english-approximates-r", to: "resume-sense.md", toHash: "how-english-approximates-r" },
  { page: "tag-pronouns.md", hash: "resume-sense", to: "resume-sense.md", toHash: "resume-sense" },
  { page: "tag-pronouns.md", hash: "cross-role-recast", to: "resume-sense.md", toHash: "cross-role-recast" },
  { page: "longer-chains.md", hash: "degree-w", to: "very-and-slightly.md", toHash: "degree-w" },
  { page: "longer-chains.md", hash: "no-subject", to: "no-subject.md", toHash: "no-subject" },
  { page: "in-clause-hooks.md", hash: "discourse", to: "discourse-hooks.md", toHash: "discourse" },
  { page: "discourse-hooks.md", hash: "parallel-chains", to: "in-clause-hooks.md", toHash: "parallel-chains" },
  { page: "discourse-hooks.md", hash: "hook-resume", to: "in-clause-hooks.md", toHash: "hook-resume" },
  { page: "rank-joins.md", hash: "shared-after-the-join", to: "list-structure.md", toHash: "shared-after-the-join" },
  { page: "rank-joins.md", hash: "scope-fence-p-join", to: "list-structure.md", toHash: "scope-fence-p-join" },
  { page: "rank-joins.md", hash: "respectively", to: "list-structure.md", toHash: "respectively" },
  { page: "rank-joins.md", hash: "fence-nesting", to: "list-structure.md", toHash: "fence-nesting" },
  { page: "rank-joins.md", hash: "exclusivity-and-denying-a-whole-list", to: "set-joins.md", toHash: "exclusivity-and-denying-a-whole-list" },
  { page: "rank-joins.md", hash: "full-single-item-and-standalone-inventories", to: "set-joins.md", toHash: "full-single-item-and-standalone-inventories" },
  { page: "spans-as-words.md", hash: "quote-acts", to: "quote-contents.md", toHash: "quote-acts" },
  { page: "spans-as-words.md", hash: "topic-quotes", to: "quote-contents.md", toHash: "topic-quotes" },
  { page: "usually-vs-must.md", hash: "universality", to: "usually-vs-must.md", toHash: "generalization" },
  { page: "join-limits.md", hash: "scope-islands-join", to: "scope-islands.md", toHash: "scope-islands" },
  { page: "resume-sense.md", hash: "resume-one-sense", to: "resume-sense.md", toHash: "resume-further" },
  { page: "collectives.md", hash: "the-group-as-one", to: "collectives.md", toHash: "groups-further" },
  { page: "label-reach.md", hash: "how-a-kind-holds", to: "label-reach.md", toHash: "how-a-label-holds" },
  { page: "universals-domains.md", hash: "every-and-none", to: "universals-domains.md", toHash: "talking-about-a-whole-kind" },
  { page: "set-joins.md", hash: "and-or-and-the-full-set-map", to: "set-joins.md", toHash: "set-joins" },
  { page: "comparative-arity.md", hash: "place-on-a-scale-sitting", to: "comparative-arity.md", toHash: "ranking-on-any-scale" },
  { page: "speech-moves.md", hash: "thinking-sounds", to: "phonology.md", toHash: "thinking-sounds" },
  { page: "rhetorical-questions.md", hash: "rhetorical", to: "more-turn-words.md", toHash: "rhetorical" },
  { page: "rhetorical-questions.md", hash: "quiz", to: "more-turn-words.md", toHash: "quiz" },
  { page: "rhetorical-questions.md", hash: "stacked-questions", to: "more-turn-words.md", toHash: "stacked-questions" },
  { page: "rhetorical-questions.md", hash: "rhetorical-questions", to: "more-turn-words.md", toHash: "rhetorical" },
  { page: "live-and-memory.md", hash: "live-vs-memory", to: "knowing.md", toHash: "live-vs-memory" },
  { page: "live-and-memory.md", hash: "memory-record", to: "knowing.md", toHash: "memory-record" },
  { page: "live-and-memory.md", hash: "memory", to: "knowing.md", toHash: "memory" },
  { page: "live-and-memory.md", hash: "record-past", to: "knowing.md", toHash: "record-past" },
  { page: "live-and-memory.md", hash: "live", to: "knowing.md", toHash: "live" },
  { page: "live-and-memory.md", hash: "reconstructive-catch", to: "knowing.md", toHash: "reconstructive-catch" },
  { page: "live-and-memory.md", hash: "live-and-memory", to: "knowing.md", toHash: "live-vs-memory" },
  { page: "extra-noun-hooks.md", hash: "genitive", to: "social-ties.md", toHash: "genitive" },
  { page: "emphasis.md", hash: "emphasis-and-clefts", to: "tone-marks.md", toHash: "emphasis-and-clefts" },
  { page: "emphasis.md", hash: "english-emphasis", to: "tone-marks.md", toHash: "emphasis-and-clefts" },
  { page: "join-limits.md", hash: "named-phrase-n", to: "named-phrases.md", toHash: "named-phrase-n" },
  { page: "join-limits.md", hash: "named-list", to: "named-phrases.md", toHash: "named-list" },
  { page: "stacked-markers.md", hash: "ambient-magnitude-casual", to: "digitless-exponents.md", toHash: "ambient-magnitude-casual" },
  { page: "stacked-markers.md", hash: "ambient-magnitude", to: "digitless-exponents.md", toHash: "ambient-magnitude" },
  { page: "singability.md", hash: "rhythm-and-stress", to: "phonology.md", toHash: "rhythm-and-stress" },
  { page: "feelings.md", hash: "feeling-no-object", to: "how-you-feel.md", toHash: "feeling-no-object" },
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
 * Where a retired hash should go. `hash` may include `#`.
 * The caller keeps `?query`. The result's `hash` is the row's `toHash`, or `''`
 * (drop the fragment) for band rows.
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
  return { path: pageToRoutePath(row.to), hash: row.toHash ?? '' }
}
