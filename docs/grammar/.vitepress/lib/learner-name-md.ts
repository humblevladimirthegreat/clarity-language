import type MarkdownIt from 'markdown-it'
import type StateCore from 'markdown-it/lib/rules_core/state_core.mjs'
import { hasSelfSlot } from '../../../../src/learner-name'

/**
 * `SELF` slots (the learner's own name) in grammar Markdown:
 * - an inline code span with a slot (`zSELFn vawalal.`) → `<SelfCode>`;
 * - an `agalan` fence → each line with a slot becomes `<SelfCode bare>`;
 * - a free-standing `SELF` in plain text (a morph-gloss line: `z-SELF`) → `<SelfGloss>`.
 * Static HTML shows the default (`ugobon` / `speaker`); the components swap in the chosen name.
 */
export function learnerNameSlots(md: MarkdownIt): void {
  const codeInline = md.renderer.rules.code_inline
  md.renderer.rules.code_inline = (tokens, idx, options, env, self) => {
    const content = tokens[idx].content
    if (!hasSelfSlot(content)) return codeInline!(tokens, idx, options, env, self)
    return `<SelfCode text="${escapeAttr(content)}" />`
  }

  const fence = md.renderer.rules.fence
  md.renderer.rules.fence = (tokens, idx, options, env, self) => {
    const token = tokens[idx]
    if (token.info.trim() !== 'agalan' || !hasSelfSlot(token.content)) {
      return fence!(tokens, idx, options, env, self)
    }
    const lines = token.content.replace(/\n$/, '').split('\n')
    const body = lines
      .map((line) => (hasSelfSlot(line) ? `<SelfCode bare text="${escapeAttr(line)}" />` : escapeText(line)))
      .join('\n')
    return `<div class="language-agalan"><span class="lang">agalan</span><pre><code>${body}</code></pre></div>\n`
  }

  md.core.ruler.push('learner_name_gloss', (state: StateCore) => {
    for (const block of state.tokens) {
      if (block.type !== 'inline' || !block.children) continue
      const out: typeof block.children = []
      for (const child of block.children) {
        if (child.type !== 'text' || !GLOSS_RE.test(child.content)) {
          out.push(child)
          continue
        }
        const parts = child.content.split(GLOSS_SPLIT_RE)
        parts.forEach((part, i) => {
          if (i % 2 === 1) {
            const html = new state.Token('html_inline', '', 0)
            html.content = '<SelfGloss />'
            out.push(html)
          } else if (part) {
            const text = new state.Token('text', '', 0)
            text.content = part
            out.push(text)
          }
        })
      }
      block.children = out
    }
  })
}

const GLOSS_RE = /(?<![A-Za-z0-9])SELF(?![A-Za-z0-9])/
const GLOSS_SPLIT_RE = /(?<![A-Za-z0-9])(SELF)(?![A-Za-z0-9])/

function escapeAttr(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

/** Escape code text for a Vue template (no `{{` interpolation). */
function escapeText(text: string): string {
  return escapeAttr(text).replace(/\{/g, '&#123;').replace(/\}/g, '&#125;')
}
