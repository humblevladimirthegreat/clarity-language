export const TOKEN_INDEX_ATTR = 'data-token-index'

export type TokenRange = {
  start: number
  end: number
}

export type InspectConstructionLike = {
  tokenIndices: number[]
}

export type TokenKindLike = {
  kind: string
}

function isTokenElement(node: Node): node is Element {
  return node.nodeType === 1 && (node as Element).hasAttribute(TOKEN_INDEX_ATTR)
}

export function tokenIndexFromElement(node: Node | null, root: Node): number | null {
  let current: Node | null = node
  while (current && current !== root) {
    if (isTokenElement(current)) {
      const index = Number(current.getAttribute(TOKEN_INDEX_ATTR))
      return Number.isFinite(index) ? index : null
    }
    current = current.parentNode
  }
  return null
}

export function selectionToTokenRange(
  selection: Selection | null,
  root: Node,
): TokenRange | null {
  if (!selection || selection.rangeCount === 0 || selection.isCollapsed) return null

  const anchorIndex = tokenIndexFromElement(selection.anchorNode, root)
  const focusIndex = tokenIndexFromElement(selection.focusNode, root)
  if (anchorIndex === null || focusIndex === null) return null

  return {
    start: Math.min(anchorIndex, focusIndex),
    end: Math.max(anchorIndex, focusIndex),
  }
}

export function isInspectableKind(kind: string): boolean {
  return kind === 'word' || kind === 'error' || kind === 'island'
}

export function normalizeTokenRange(
  range: TokenRange,
  tokens: TokenKindLike[],
): TokenRange | null {
  const indices: number[] = []
  for (let index = range.start; index <= range.end; index += 1) {
    const token = tokens[index]
    if (!token) continue
    if (isInspectableKind(token.kind)) indices.push(index)
  }
  if (indices.length === 0) return null
  return { start: indices[0]!, end: indices[indices.length - 1]! }
}

export function findCoveringConstruction(
  range: TokenRange,
  constructions: InspectConstructionLike[],
): number | null {
  const selected = new Set<number>()
  for (let index = range.start; index <= range.end; index += 1) selected.add(index)

  let best: { index: number; size: number } | null = null
  for (let index = 0; index < constructions.length; index += 1) {
    const group = constructions[index]!
    const covered = [...selected].every((tokenIndex) => group.tokenIndices.includes(tokenIndex))
    if (!covered) continue
    const size = group.tokenIndices.length
    if (!best || size < best.size) best = { index, size }
  }
  return best?.index ?? null
}

export function endingChipIndex(
  raw: string,
  ending: string,
  chips: string[],
  anchorOffset: number,
  focusOffset: number,
): number | null {
  if (!raw.endsWith(ending)) return null
  const start = Math.min(anchorOffset, focusOffset)
  const end = Math.max(anchorOffset, focusOffset)
  const endingStart = raw.length - ending.length
  if (start < endingStart || end > raw.length) return null
  const chipIndex = chips.findIndex((chip) => chip.includes(`-${ending}`))
  return chipIndex >= 0 ? chipIndex : null
}
