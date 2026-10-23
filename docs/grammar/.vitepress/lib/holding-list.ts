/** Peeled sittings not yet in a sidebar group. Inserted after their parent in `pathPages`. */
export type HoldingSitting = {
  parent: string
  page: string
  band: 'beginner' | 'intermediate' | 'advanced'
  title: string
}

export const holdingList: HoldingSitting[] = [
  { parent: "causation.md", page: "iff-fault.md", band: "intermediate", title: "Iff, fault, and CAUSE" },
  { parent: "predication.md", page: "label-scope.md", band: "intermediate", title: "Label scope" },
  { parent: "restrictors.md", page: "more-occasions.md", band: "intermediate", title: "More occasions" },
  { parent: "word-endings.md", page: "proper-names.md", band: "intermediate", title: "Proper names and titled phrases" },
  { parent: "speech-moves.md", page: "speech-acts.md", band: "intermediate", title: "Speech acts and tone marks" },
  { parent: "pronouns.md", page: "tag-pronouns.md", band: "intermediate", title: "Tag pronouns and resume sense" },
  { parent: "plurality.md", page: "collectives.md", band: "intermediate", title: "Collectives" },
  { parent: "questions.md", page: "polar-inventory.md", band: "intermediate", title: "Polar inventory and rhetorical" },
  { parent: "sakes.md", page: "prescription.md", band: "intermediate", title: "Prescription and motive" },
  { parent: "intention.md", page: "ability.md", band: "intermediate", title: "Ability, decision, and try" },
  { parent: "roles.md", page: "viewpoint.md", band: "intermediate", title: "Viewpoint and landmark" },
  { parent: "phonology.md", page: "phonotactics.md", band: "intermediate", title: "Phonotactics and letter names" },
  { parent: "phonology.md", page: "singability.md", band: "advanced", title: "Singability and speech edges" },
  { parent: "clause.md", page: "left-bound.md", band: "intermediate", title: "Left-bound adjectives and chaining" },
  { parent: "clause.md", page: "emphasis.md", band: "advanced", title: "Emphasis and audible start" },
  { parent: "spans.md", page: "span-mention.md", band: "intermediate", title: "Mention and scope islands" },
  { parent: "spans.md", page: "span-nesting.md", band: "advanced", title: "Editorial close and nesting" },
  { parent: "numbers.md", page: "number-markers.md", band: "intermediate", title: "Word shape, markers, and endings" },
  { parent: "numbers.md", page: "stacked-markers.md", band: "advanced", title: "End-relative and stacked markers" },
  { parent: "comparatives.md", page: "comparative-arity.md", band: "intermediate", title: "Comparative arity and scales" },
  { parent: "comparatives.md", page: "stance-bars.md", band: "advanced", title: "Stance bars" },
  { parent: "knowing.md", page: "evidentiality.md", band: "intermediate", title: "Evidentiality" },
  { parent: "knowing.md", page: "universality.md", band: "advanced", title: "Universality and dated channel" },
  { parent: "compounds.md", page: "compound-families.md", band: "intermediate", title: "Compound families" },
  { parent: "compounds.md", page: "root-tails.md", band: "advanced", title: "Root tails" },
  { parent: "dependents.md", page: "sentence-linkers.md", band: "intermediate", title: "Sentence linkers and stand-ins" },
  { parent: "dependents.md", page: "stand-in-roles.md", band: "advanced", title: "Lexicalized stand-ins" },
  { parent: "joins.md", page: "rank-joins.md", band: "intermediate", title: "Rank joins" },
  { parent: "joins.md", page: "join-islands.md", band: "advanced", title: "Join islands and role grid" },
  { parent: "hooks.md", page: "ending-grids.md", band: "intermediate", title: "Ending grids" },
  { parent: "hooks.md", page: "hook-compounds.md", band: "advanced", title: "Hook compounds" },
  { parent: "relations.md", page: "of-relations.md", band: "intermediate", title: "Of-relations and social ties" },
  { parent: "relations.md", page: "as-of.md", band: "advanced", title: "As-of" },
  { parent: "digitless-exponents.md", page: "special-values.md", band: "advanced", title: "Special values, hyperbole, number as stance" },
  { parent: "numbers-applied.md", page: "initials.md", band: "advanced", title: "Initials, rays, named ranges" },
]
