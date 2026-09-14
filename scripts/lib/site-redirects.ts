import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

export type PageMove = {
  from: string
  to: string
  note?: string
}

export type SiteRedirects = {
  pageMoves: PageMove[]
}

export const GRAMMAR_HOME = '/grammar/'
export const GRAMMAR_NOT_FOUND = '/grammar/404.html'

const DEFAULT_MAP = join(
  dirname(fileURLToPath(import.meta.url)),
  '../site-redirects.json',
)

export function loadSiteRedirects(path = DEFAULT_MAP): SiteRedirects {
  const parsed = JSON.parse(readFileSync(path, 'utf8')) as SiteRedirects
  if (!Array.isArray(parsed.pageMoves)) {
    throw new Error('site-redirects.json: pageMoves must be an array')
  }
  for (const move of parsed.pageMoves) {
    assertPublicPath(move.from, 'from')
    assertPublicPath(move.to, 'to')
    if (move.from === move.to) {
      throw new Error(`site-redirects.json: from and to are the same (${move.from})`)
    }
  }
  return parsed
}

function assertPublicPath(value: string, field: string): void {
  if (!value.startsWith('/') || value.includes('://') || value.includes('..')) {
    throw new Error(`site-redirects.json: ${field} must be a root-absolute path: ${value}`)
  }
}

export function stubHtml(move: PageMove): string {
  const toJson = JSON.stringify(move.to)
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <link rel="canonical" href="${escapeAttr(move.to)}" />
    <title>Moved</title>
    <script>
      location.replace(${toJson} + location.search + location.hash);
    </script>
  </head>
  <body>
    <p>This page moved to <a href="${escapeAttr(move.to)}">${escapeText(move.to)}</a>.</p>
  </body>
</html>
`
}

/** Root artifact: `/` → grammar home; Amplify SPA fallback → VitePress 404. */
export function rootIndexHtml(): string {
  const home = JSON.stringify(GRAMMAR_HOME)
  const notFound = JSON.stringify(GRAMMAR_NOT_FOUND)
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <link rel="canonical" href="${GRAMMAR_HOME}" />
    <title>Agalan Grammar</title>
    <script>
      (function () {
        var p = location.pathname;
        if (p === "/" || p === "/index.html" || p === "") {
          location.replace(${home} + location.search + location.hash);
          return;
        }
        location.replace(${notFound});
      })();
    </script>
  </head>
  <body>
    <p><a href="${GRAMMAR_HOME}">Agalan Grammar</a></p>
    <p>If you opened a specific page, it is not in the grammar.</p>
  </body>
</html>
`
}

export type AmplifyCustomRule = {
  source: string
  target: string
  status: string
  condition: null
}

/** Paste into Amplify Hosting → Rewrites and redirects. First match wins. */
export function amplifyRedirectRules(map: SiteRedirects): AmplifyCustomRule[] {
  const moves = map.pageMoves.map((move) => ({
    source: move.from,
    target: move.to,
    status: '301',
    condition: null,
  }))
  return [
    ...moves,
    {
      source: '/',
      target: GRAMMAR_HOME,
      status: '301',
      condition: null,
    },
    {
      source: '/<*>',
      target: GRAMMAR_NOT_FOUND,
      status: '404',
      condition: null,
    },
  ]
}

function escapeAttr(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;')
}

function escapeText(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;')
}
