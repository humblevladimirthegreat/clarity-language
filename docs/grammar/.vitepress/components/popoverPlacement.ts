export type RectLike = {
  left: number
  top: number
  width: number
  height: number
  right: number
  bottom: number
}

export type PopoverPlacement = {
  top: number
  left: number
  placement: 'above' | 'below'
}

export function computePopoverPlacement(
  anchor: RectLike,
  popoverWidth: number,
  popoverHeight: number,
  gap = 8,
  viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1024,
  viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 768,
): PopoverPlacement {
  const spaceBelow = viewportHeight - anchor.bottom
  const spaceAbove = anchor.top
  const placeBelow = spaceBelow >= popoverHeight + gap || spaceBelow >= spaceAbove

  const top = placeBelow
    ? anchor.bottom + gap
    : anchor.top - popoverHeight - gap

  let left = anchor.left + anchor.width / 2 - popoverWidth / 2
  left = Math.max(8, Math.min(left, viewportWidth - popoverWidth - 8))

  return { top, left, placement: placeBelow ? 'below' : 'above' }
}

export function unionRect(rects: RectLike[]): RectLike {
  if (rects.length === 0) {
    return { left: 0, top: 0, width: 0, height: 0, right: 0, bottom: 0 }
  }
  let left = rects[0]!.left
  let top = rects[0]!.top
  let right = rects[0]!.right
  let bottom = rects[0]!.bottom
  for (let index = 1; index < rects.length; index += 1) {
    const rect = rects[index]!
    left = Math.min(left, rect.left)
    top = Math.min(top, rect.top)
    right = Math.max(right, rect.right)
    bottom = Math.max(bottom, rect.bottom)
  }
  return { left, top, right, bottom, width: right - left, height: bottom - top }
}
