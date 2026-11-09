/**
 * Plain-Markdown copies of the grammar site for AI agents, written after the
 * VitePress build: `/llms.txt` (index), `/llms-full.txt` (every page in one
 * file), `/llms/<section>.txt` (one sidebar section each), and
 * `/grammar/<page>.md` beside each `.html` page.
 */
import { existsSync, readFileSync } from 'node:fs'
import { dirname, join, posix } from 'node:path'

import {
  cheatSheetSidebar,
  claritishLessons,
  type LessonLink,
  orientation,
  recipePages,
  sidebarGroups,
} from '../../docs/grammar/.vitepress/lib/reading-order.ts'
import { AGENT_BUNDLE_PATH } from './agent-bundle.ts'
import { parseCompoundCsv } from '../../src/lexicon-compounds.ts'
import { parsePublishedCsv } from '../../src/lexicon-search.ts'
import { GRAMMAR_DIR, readData } from '../../src/repo-paths.ts'

export const SITE_ORIGIN = 'https://clarityconlang.com'
const GRAMMAR_URL = `${SITE_ORIGIN}/grammar/`

export type LlmsPage = { title: string; slug: string; markdown: string }
export type LlmsSection = { title: string; slug: string; pages: LlmsPage[] }

/** Public slug (no extension) for a sidebar link: `/` → `index`, `/claritish/` → `claritish/index`. */
export function linkSlug(link: string): string {
  const path = link.split(/[?#]/, 1)[0]!.replace(/^\//, '').replace(/\.(?:md|html)$/, '')
  return path === '' || path.endsWith('/') ? `${path}index` : path
}

/** Disk path under `docs/grammar/` for a public slug (stage pages sit in band folders). */
function sourceFile(slug: string): string {
  for (const dir of ['', 'beginner/', 'intermediate/', 'advanced/']) {
    const file = join(GRAMMAR_DIR, `${dir}${slug}.md`)
    if (existsSync(file)) return file
  }
  throw new Error(`llms-txt: no source for /${slug}`)
}

/** Absolute site URL for a link target written on the page with public slug `fromSlug`. */
export function resolveLink(target: string, fromSlug: string): string {
  if (/^[a-z][a-z0-9+.-]*:/i.test(target)) return target
  const hashAt = target.indexOf('#')
  const path = hashAt < 0 ? target : target.slice(0, hashAt)
  const hash = hashAt < 0 ? '' : target.slice(hashAt)
  if (path === '') return `${GRAMMAR_URL}${fromSlug}.html${hash}`
  const joined = path.startsWith('/') ? path.slice(1) : posix.join(posix.dirname(fromSlug), path)
  if (/\.(?:png|jpe?g|svg|gif|mp3|ogg|wav|pdf|txt|json|csv)$/i.test(joined)) return `${GRAMMAR_URL}${joined}${hash}`
  return `${GRAMMAR_URL}${linkSlug(`/${joined}`)}.html${hash}`
}

/**
 * Page Markdown as an agent should read it: frontmatter, HTML comments, Vue
 * components and heading ids removed; `@include`s inlined; links made absolute.
 * Fenced code is left as written.
 */
export function cleanPageMarkdown(source: string, slug: string, file: string): string {
  let text = source.replace(/^---\n[\s\S]*?\n---\n/, '')
  text = text.replace(/<!--@include:\s*(\S+?)\s*-->/g, (_, rel: string) => {
    const included = readFileSync(join(dirname(file), rel), 'utf8')
    return included.replace(/^---\n[\s\S]*?\n---\n/, '')
  })
  const out: string[] = []
  let fence: string | null = null
  for (const line of text.split('\n')) {
    const fenceMatch = /^\s*(`{3,}|~{3,})/.exec(line)
    if (fence) {
      out.push(line)
      if (fenceMatch && fenceMatch[1]!.startsWith(fence)) fence = null
      continue
    }
    if (fenceMatch) {
      fence = fenceMatch[1]!
      out.push(line)
      continue
    }
    out.push(cleanProseLine(line, slug))
  }
  return out
    .join('\n')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function cleanProseLine(line: string, slug: string): string {
  return line
    .replace(/[ \t]*<\/?[A-Z][A-Za-z]*\b[^>]*?\/?>/g, '')
    .replace(/^(#{1,6} .*?)\s*\{#[\w-]+\}\s*$/, '$1')
    .replace(/<code>(.*?)<\/code>/g, (_, code: string) => `\`${decodeEntities(code)}\``)
    .replace(/\]\(([^)\s]+)\)/g, (_, target: string) => `](${resolveLink(target, slug)})`)
    .replace(/[ \t]+$/, '')
}

function decodeEntities(text: string): string {
  return text.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&amp;/g, '&')
}

function loadPage(item: LessonLink): LlmsPage {
  const slug = linkSlug(item.link)
  const file = sourceFile(slug)
  return { title: item.text, slug, markdown: cleanPageMarkdown(readFileSync(file, 'utf8'), slug, file) }
}

function cell(value: string): string {
  return value.replace(/\|/g, '\\|').replace(/\s+/g, ' ').trim()
}

/** The published roots and dictionary compounds as Markdown tables (the site's Lexicon page is an interactive search). */
export function lexiconMarkdown(): string {
  const roots = parsePublishedCsv(readData('lexicon-published.csv'))
  const compounds = parseCompoundCsv(readData('lexicon-compounds.csv'))
  const lines = [
    `# Lexicon`,
    '',
    `Every published root and dictionary compound. A root is a citation stem: add a role letter in front and a reference ending to use it in a sentence (${GRAMMAR_URL}clause.html#role-letters, ${GRAMMAR_URL}word-endings.html). Interactive search: ${GRAMMAR_URL}lexicon.html`,
    '',
    '## Roots',
    '',
    '| Root | Seed | Concrete | Abstract | Other English |',
    '|------|------|----------|----------|---------------|',
    ...roots.map(
      (row) =>
        `| ${cell(row.root)} | ${cell(row.emoji)} | ${cell(row.concrete)} | ${cell(row.abstract)} | ${cell(
          [row.englishByPos, (row.englishAliases ?? []).join('; ')].filter(Boolean).join('; '),
        )} |`,
    ),
    '',
    '## Dictionary compounds',
    '',
    '| Stem | Parts | Concrete | Abstract |',
    '|------|-------|----------|----------|',
    ...compounds.map(
      (row) =>
        `| ${cell(row.stem)} | ${cell([row.left, row.join, row.right].filter(Boolean).join(' + '))} | ${cell(
          row.concrete,
        )} | ${cell(row.abstract)} |`,
    ),
  ]
  return lines.join('\n')
}

/** Every page agents get, grouped as the sidebar groups them. Tool pages other than the lexicon are interactive and left out. */
export function llmsSections(): LlmsSection[] {
  const load = (items: readonly LessonLink[]) => items.map(loadPage)
  return [
    { title: 'Start here', slug: 'start-here', pages: load(orientation) },
    ...sidebarGroups.map((group) => ({ title: group.text, slug: group.text.toLowerCase(), pages: load(group.items) })),
    { title: 'Saying it in Ageben (recipes keyed by English)', slug: 'recipes', pages: load(recipePages) },
    { title: 'Cheat sheets', slug: 'cheat-sheets', pages: load(cheatSheetSidebar) },
    {
      title: 'Reference',
      slug: 'reference',
      pages: [
        loadPage({ text: 'Terminology', link: '/terminology' }),
        { title: 'Lexicon', slug: 'lexicon', markdown: lexiconMarkdown() },
      ],
    },
    {
      title: 'Claritish (Ageben words inside English)',
      slug: 'claritish',
      pages: load(claritishLessons.filter((item) => item.link !== '/claritish/editor')),
    },
  ]
}

const SUMMARY =
  'Ageben is a constructed language whose vocabulary and grammar encode psychologically useful distinctions (compassion, rationality, empowerment). This is its learner grammar.'

const NOTES = [
  '- Ageben examples are in backticks. Each page is plain Markdown; the HTML site adds audio, search, and interactive tools.',
  '- `SELF` in an example stands for the reader’s own name.',
  '- Stage pages are in learning order: Beginner, then Intermediate, then Advanced. A page uses only forms taught earlier in that order.',
  '- Ageben has a parser. To work out what an Ageben sentence means, or whether it is well formed, run it through the parser rather than guessing from the prose. There is no server API; run it one of these ways:',
  `  - If you can run code: download ${SITE_ORIGIN}/${AGENT_BUNDLE_PATH}, one file with the lexicon built in and no dependencies (Node 18+, Deno, Bun, or a browser). \`node ageben.mjs 'zoguvom thaber guwathum.'\` prints each input's word-by-word gloss, or its parse error and words the lexicon does not know, and exits 1 if any input fails. \`--prompt\` prints a prompt that explains the gloss notation and asks for an English translation (give it to yourself or another model); \`--json\` prints structured results; \`-\` reads one input per line from stdin; \`--help\` lists the rest. Imported as a module it exports \`check\`, \`report\`, \`inspect\`, \`parseTree\`, and \`translationPrompt\`.`,
  `  - If you can use a browser: open ${GRAMMAR_URL}inspect.html?text= followed by the URL-encoded Ageben. Click a word for its part of speech, reference ending, and gloss; **Copy Translation Prompt** copies the same prompt as \`--prompt\`.`,
]

/** `/llms.txt`: title, summary, and one link per page's Markdown copy. */
export function llmsIndex(sections: LlmsSection[]): string {
  const lines = [
    '# Ageben',
    '',
    `> ${SUMMARY}`,
    '',
    ...NOTES,
    `- Everything below in one file (very large): ${SITE_ORIGIN}/llms-full.txt. Each section below is also one file, linked under its heading.`,
  ]
  for (const section of sections) {
    lines.push('', `## ${section.title}`, '', `Whole section: ${sectionUrl(section)}`, '')
    for (const page of section.pages) lines.push(`- [${page.title}](${GRAMMAR_URL}${page.slug}.md)`)
  }
  return `${lines.join('\n')}\n`
}

/** Published path of one section's bundle, relative to the site root. */
export function sectionPath(section: LlmsSection): string {
  return `llms/${section.slug}.txt`
}

function sectionUrl(section: LlmsSection): string {
  return `${SITE_ORIGIN}/${sectionPath(section)}`
}

function sectionBody(section: LlmsSection): string[] {
  const parts = ['', '', `<!-- Section: ${section.title} -->`]
  for (const page of section.pages) {
    parts.push('', '---', '', `Source: ${GRAMMAR_URL}${page.slug}.html`, '', page.markdown)
  }
  return parts
}

/** `/llms-full.txt`: every page in order, each under a source line. */
export function llmsFull(sections: LlmsSection[]): string {
  const parts = ['# Ageben', '', `> ${SUMMARY}`, '', ...NOTES, ...sections.flatMap(sectionBody)]
  return `${parts.join('\n')}\n`
}

/** `/llms/<section>.txt`: one section's pages, under the same header as the full file. */
export function llmsSectionFile(section: LlmsSection): string {
  const parts = [`# Ageben: ${section.title}`, '', `> ${SUMMARY}`, '', ...NOTES, ...sectionBody(section)]
  return `${parts.join('\n')}\n`
}

/** Every agent file keyed by its path from the site root (`llms.txt`, `llms/beginner.txt`, `grammar/clause.md`). */
export function llmsFiles(): Map<string, string> {
  const sections = llmsSections()
  const files = new Map<string, string>([
    ['llms.txt', llmsIndex(sections)],
    ['llms-full.txt', llmsFull(sections)],
  ])
  for (const section of sections) files.set(sectionPath(section), llmsSectionFile(section))
  for (const page of sections.flatMap((section) => section.pages)) {
    files.set(`grammar/${page.slug}.md`, `${page.markdown}\n`)
  }
  return files
}

/** Request path (no query) that the dev server should answer from `llmsFiles`, or null. */
export function llmsDevPath(url: string): string | null {
  if (url.includes('?')) return null
  const path = decodeURIComponent(url).replace(/^\//, '')
  if (/^llms(?:-full)?\.txt$/.test(path) || /^llms\/[a-z-]+\.txt$/.test(path)) return path
  if (/^grammar\/[a-z0-9/-]+\.md$/.test(path)) return path
  return null
}

/**
 * Vite plugin: serve the agent files under `npm run dev`, generated from the
 * docs on each request. `.md` requests the browser makes as module imports
 * (VitePress page loads) pass through to VitePress.
 */
export function llmsDevPlugin() {
  return {
    name: 'ageben-llms-txt-dev',
    apply: 'serve' as const,
    configureServer(server: { middlewares: { use: (fn: DevMiddleware) => void } }) {
      server.middlewares.use((req, res, next) => {
        const path = llmsDevPath(req.url ?? '')
        if (!path || req.headers['sec-fetch-dest'] === 'script') return next()
        const body = llmsFiles().get(path)
        if (body === undefined) return next()
        res.setHeader('Content-Type', `${path.endsWith('.md') ? 'text/markdown' : 'text/plain'}; charset=utf-8`)
        res.end(body)
      })
    },
  }
}

type DevMiddleware = (
  req: { url?: string; headers: Record<string, string | string[] | undefined> },
  res: { setHeader: (name: string, value: string) => void; end: (body: string) => void },
  next: () => void,
) => void
