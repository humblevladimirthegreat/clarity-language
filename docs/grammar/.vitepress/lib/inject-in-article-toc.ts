import type MarkdownIt from 'markdown-it'
import type StateCore from 'markdown-it/lib/rules_core/state_core.mjs'

/** Insert VitePress `[[toc]]` tokens after the title + lead, before the first later heading. */
export function injectInArticleToc(md: MarkdownIt): void {
  md.core.ruler.push('inject_in_article_toc', (state: StateCore) => {
    const frontmatter = state.env?.frontmatter as Record<string, unknown> | undefined
    if (frontmatter?.outline === false) return

    const tokens = state.tokens
    if (tokens.some((token) => token.type === 'toc_open')) return

    let h1Close = -1
    for (let i = 0; i < tokens.length; i++) {
      if (tokens[i].type !== 'heading_open' || tokens[i].tag !== 'h1') continue
      for (let j = i + 1; j < tokens.length; j++) {
        if (tokens[j].type === 'heading_close' && tokens[j].tag === 'h1') {
          h1Close = j
          break
        }
      }
      break
    }
    if (h1Close < 0) return

    let insertAt = h1Close + 1
    while (insertAt < tokens.length && tokens[insertAt].type !== 'heading_open') {
      insertAt++
    }
    if (insertAt >= tokens.length) return

    const rest = tokens.slice(insertAt)
    const hasTocLevels = rest.some(
      (token) => token.type === 'heading_open' && (token.tag === 'h2' || token.tag === 'h3'),
    )
    if (!hasTocLevels) return

    const detailsOpen = new state.Token('html_block', '', 0)
    detailsOpen.content = '<details class="in-article-toc" open>\n<summary>On this page</summary>\n'
    const tocOpen = new state.Token('toc_open', 'nav', 1)
    tocOpen.attrSet('class', 'table-of-contents')
    const tocBody = new state.Token('toc_body', '', 0)
    tocBody.hidden = true
    const tocClose = new state.Token('toc_close', 'nav', -1)
    const detailsClose = new state.Token('html_block', '', 0)
    detailsClose.content = '</details>\n'

    tokens.splice(insertAt, 0, detailsOpen, tocOpen, tocBody, tocClose, detailsClose)
  })
}
