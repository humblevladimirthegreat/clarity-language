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
  path: string,
  hash: string,
  map: readonly HashRedirect[] = hashRedirects,
): { path: string; hash: string } | undefined {
  const fragment = hash.replace(/^#/, '')
  if (!fragment) return
  const page = routePathToPage(path)
  const row = map.find((item) => item.page === page && item.hash === fragment)
  if (!row) return
  return { path: pageToRoutePath(row.to), hash: '' }
}
