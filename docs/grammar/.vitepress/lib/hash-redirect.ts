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

export const hashRedirects: HashRedirect[] = []

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
