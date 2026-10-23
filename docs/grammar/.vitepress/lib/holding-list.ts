/** Type kept for `peel-band`’s dry-run row. The regroup emptied this list. */
export type HoldingSitting = {
  parent: string
  page: string
  band: 'beginner' | 'intermediate' | 'advanced'
  title: string
}

export const holdingList: HoldingSitting[] = []
