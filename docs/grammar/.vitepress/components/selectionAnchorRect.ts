import type { RectLike } from './popoverPlacement.js'
import { unionRect } from './popoverPlacement.js'

export function tokenElement(root: Element, index: number): Element | null {
  return root.querySelector(`[${TOKEN_INDEX_ATTR}="${index}"]`)
}

export function tokenRangeRect(root: Element, start: number, end: number): RectLike | null {
  const rects: DOMRect[] = []
  for (let index = start; index <= end; index += 1) {
    const element = tokenElement(root, index)
    if (element) rects.push(element.getBoundingClientRect())
  }
  return rects.length > 0 ? unionRect(rects) : null
}

export function getInspectAnchorRect(
  root: Element,
  options: {
    selection?: Selection | null
    tokenIndices?: number[]
  },
): RectLike | null {
  const selection = options.selection ?? (typeof window !== 'undefined' ? window.getSelection() : null)
  if (selection && !selection.isCollapsed && selection.rangeCount > 0) {
    const range = selectionToTokenRange(selection, root)
    if (range) return selection.getRangeAt(0).getBoundingClientRect()
  }

  const indices = options.tokenIndices ?? []
  if (indices.length === 0) return null
  const sorted = [...indices].sort((a, b) => a - b)
  return tokenRangeRect(root, sorted[0]!, sorted[sorted.length - 1]!)
}
