/**
 * Published roots the tooling names directly: house cast, discourse-role specials, `/x/` linkers,
 * compass arrows, the language's own root, greeting, and template sample fillers. Each entry is
 * tied to its published row by emoji, so a lexicon retie cannot leave it stale:
 * `npm run retie-docs -- --write` resyncs every `root` here from `data/lexicon-published.csv`
 * ({@link resyncClosedRootsSource}), and `closed-roots.test.ts` fails when one drifts from its row.
 *
 * Code outside this file never spells a root as a string literal; it reads {@link CLOSED}.
 * No Node imports (the grammar site bundles this).
 */

type ClosedRow = { emoji: string; root: string };

const CLOSED_ROWS = {
  // house cast
  swan: { emoji: "🦢", root: "azawa" },
  lion: { emoji: "🦁", root: "alahe" },
  hibiscus: { emoji: "🌺", root: "ahabe" },
  // discourse-role specials (**-n**)
  microphone: { emoji: "🎤", root: "amu" },
  headphones: { emoji: "🎧", root: "ohe" },
  handshake: { emoji: "🤝", root: "oha" },
  neutral: { emoji: "😐", root: "onu" },
  // the language's own name
  glasses: { emoji: "👓", root: "agaza" },
  // greeting turn (`yeweval`)
  wave: { emoji: "👋", root: "eweva" },
  // `/x/` linkers
  zebra: { emoji: "🦓", root: "aze" },
  clock: { emoji: "🕰️", root: "agaga" },
  film: { emoji: "🎞️", root: "evave" },
  construction: { emoji: "🚧", root: "agoza" },
  // compass arrows (east is also *therefore*)
  north: { emoji: "⬆️", root: "onova" },
  northeast: { emoji: "↗️", root: "anove" },
  east: { emoji: "➡️", root: "ezada" },
  southeast: { emoji: "↘️", root: "azove" },
  south: { emoji: "⬇️", root: "azava" },
  southwest: { emoji: "↙️", root: "azawe" },
  west: { emoji: "⬅️", root: "eweza" },
  northwest: { emoji: "↖️", root: "onove" },
  // template sample fillers
  walk: { emoji: "🚶", root: "owoga" },
  ballot: { emoji: "🗳️", root: "aba" },
  knot: { emoji: "🪢", root: "ona" },
  toolbox: { emoji: "🧰", root: "udu" },
} as const satisfies Record<string, ClosedRow>;

export type ClosedName = keyof typeof CLOSED_ROWS;

/** Current spelling of each closed root, by name (`CLOSED.swan` = Azawan's root). */
export const CLOSED: Record<ClosedName, string> = Object.fromEntries(
  Object.entries(CLOSED_ROWS).map(([name, row]) => [name, row.root]),
) as Record<ClosedName, string>;

/** Every closed entry with its emoji (for the drift test and the resync). */
export const CLOSED_ENTRIES: ReadonlyArray<{ name: ClosedName } & ClosedRow> = Object.entries(CLOSED_ROWS).map(
  ([name, row]) => ({ name: name as ClosedName, ...row }),
);

/** English name of a named root: the root + **-n**, capitalised (`azawa` → *Azawan*). */
export function namedEnglish(root: string): string {
  return `${root.charAt(0).toUpperCase()}${root.slice(1)}n`;
}

const ENTRY_RE = /(\{ emoji: ")([^"]+)(", root: ")([a-z]+)(" \})/g;

/**
 * This file's source with every `root` respelled to the published root of its emoji.
 * `rootByEmoji` is the published lexicon (emoji → root). Returns the new source, the
 * respellings made, and any emoji with no published row (the caller must stop on those).
 */
export function resyncClosedRootsSource(
  source: string,
  rootByEmoji: ReadonlyMap<string, string>,
): { text: string; changes: Array<{ emoji: string; from: string; to: string }>; missing: string[] } {
  const changes: Array<{ emoji: string; from: string; to: string }> = [];
  const missing: string[] = [];
  const text = source.replace(ENTRY_RE, (whole, open: string, emoji: string, mid: string, root: string, close: string) => {
    const next = rootByEmoji.get(emoji);
    if (next === undefined) {
      missing.push(emoji);
      return whole;
    }
    if (next === root) return whole;
    changes.push({ emoji, from: root, to: next });
    return `${open}${emoji}${mid}${next}${close}`;
  });
  return { text, changes, missing };
}
