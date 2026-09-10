const SORTABLE = new Set(['english', 'agalan'])

export function headerCells(table: HTMLTableElement): Element[] {
  const fromHead = table.querySelectorAll('thead th, thead td')
  if (fromHead.length) return [...fromHead]
  const firstRow = table.querySelector('tr')
  return firstRow ? [...firstRow.children] : []
}

export function headerLabels(table: HTMLTableElement): string[] {
  return headerCells(table).map((cell) => normalizeLabel(cell.textContent ?? ''))
}

export function isRootsUsedTable(table: HTMLTableElement): boolean {
  const labels = headerLabels(table).map((label) => label.toLowerCase())
  return labels.includes('english') && labels.includes('agalan')
}

export function cellSortKey(text: string): string {
  return text.replace(/\s+/g, ' ').trim().toLocaleLowerCase('en')
}

function normalizeLabel(text: string): string {
  return text.replace(/\s+/g, ' ').trim()
}

function bodyRows(table: HTMLTableElement): HTMLTableRowElement[] {
  const inBody = [...table.querySelectorAll('tbody tr')]
  if (inBody.length) return inBody as HTMLTableRowElement[]
  return [...table.querySelectorAll('tr')].slice(1) as HTMLTableRowElement[]
}

function sortableColumnIndexes(labels: string[]): number[] {
  return labels.flatMap((label, index) => (SORTABLE.has(label.toLowerCase()) ? [index] : []))
}

export function enhanceRootsTables(root: ParentNode): () => void {
  const cleanups: Array<() => void> = []
  const tables = [...root.querySelectorAll('table')].filter((el): el is HTMLTableElement => {
    if (el.tagName !== 'TABLE') return false
    return isRootsUsedTable(el as HTMLTableElement)
  })

  for (const table of tables) {
    if (table.dataset.rootsSort === '1') continue
    const cleanup = enhanceOne(table)
    if (cleanup) cleanups.push(cleanup)
  }

  return () => {
    for (const cleanup of cleanups) cleanup()
  }
}

function enhanceOne(table: HTMLTableElement): (() => void) | undefined {
  const heads = headerCells(table)
  const original = bodyRows(table)
  const parent = original[0]?.parentElement
  if (!heads.length || !parent) return undefined

  const labels = headerLabels(table)
  const sortable = sortableColumnIndexes(labels)
  if (!sortable.length) return undefined

  let sortIndex: number | null = null
  let direction: 'asc' | 'desc' | null = null

  table.dataset.rootsSort = '1'
  table.classList.add('roots-used-table')

  const listeners: Array<{ el: HTMLButtonElement; fn: () => void }> = []

  for (const index of sortable) {
    const th = heads[index]
    if (!th) continue
    th.setAttribute('aria-sort', 'none')
    const label = labels[index] ?? ''
    const button = table.ownerDocument.createElement('button')
    button.type = 'button'
    button.className = 'roots-sort-btn'
    button.textContent = label
    button.setAttribute('aria-label', `Sort by ${label}`)
    th.replaceChildren(button)

    const onClick = () => {
      if (sortIndex !== index) {
        sortIndex = index
        direction = 'asc'
      } else if (direction === 'asc') {
        direction = 'desc'
      } else {
        sortIndex = null
        direction = null
      }
      applySort()
    }
    button.addEventListener('click', onClick)
    listeners.push({ el: button, fn: onClick })
  }

  function applySort() {
    for (const index of sortable) {
      const th = heads[index]
      if (!th) continue
      if (sortIndex === index && direction) {
        th.setAttribute('aria-sort', direction === 'asc' ? 'ascending' : 'descending')
      } else {
        th.setAttribute('aria-sort', 'none')
      }
    }

    const ordered =
      sortIndex === null || direction === null
        ? original
        : [...original].sort((a, b) => {
            const left = cellSortKey(a.children[sortIndex]?.textContent ?? '')
            const right = cellSortKey(b.children[sortIndex]?.textContent ?? '')
            const cmp = left.localeCompare(right, 'en')
            return direction === 'asc' ? cmp : -cmp
          })

    for (const row of ordered) parent.append(row)
  }

  return () => {
    for (const { el, fn } of listeners) el.removeEventListener('click', fn)
    for (const index of sortable) {
      const th = heads[index]
      if (!th) continue
      th.removeAttribute('aria-sort')
      th.replaceChildren(labels[index] ?? '')
    }
    for (const row of original) parent.append(row)
    delete table.dataset.rootsSort
    table.classList.remove('roots-used-table')
  }
}
