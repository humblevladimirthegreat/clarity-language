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
]
