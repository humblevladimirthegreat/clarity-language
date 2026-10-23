/** Peeled sittings not yet in a sidebar group. Inserted after their parent in `pathPages`. */
export type HoldingSitting = {
  parent: string
  page: string
  band: 'beginner' | 'intermediate' | 'advanced'
  title: string
}

export const holdingList: HoldingSitting[] = []
