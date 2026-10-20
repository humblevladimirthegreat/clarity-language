/**
 * Published roots the tooling names directly: house cast, discourse-role specials, `/x/` linkers,
 * compass arrows, sake roots, the language's own root, greeting, and template sample fillers. Each entry is
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
  swan: { emoji: "🦢", root: "uzazo" },
  lion: { emoji: "🦁", root: "olozu" },
  hibiscus: { emoji: "🌺", root: "ehalo" },
  // discourse-role specials (**-n**)
  microphone: { emoji: "🎤", root: "amu" },
  headphones: { emoji: "🎧", root: "eho" },
  handshake: { emoji: "🤝", root: "aha" },
  neutral: { emoji: "😐", root: "una" },
  // topic pronoun (`zozan`, pronouns.md#topic-pronoun) and generic pronoun (`zoben`)
  star: { emoji: "⭐", root: "oza" },
  person: { emoji: "🧑", root: "obe" },
  // the language's own name
  glasses: { emoji: "👓", root: "egabo" },
  // greeting turn (`yeweval`)
  wave: { emoji: "👋", root: "eweyo" },
  // *during* (`huwem`): its `/b/` can be a role pointer's scene
  gemini: { emoji: "♊", root: "uwe" },
  // `/x/` linkers
  zebra: { emoji: "🦓", root: "ezo" },
  clock: { emoji: "🕰️", root: "ogere" },
  film: { emoji: "🎞️", root: "evewe" },
  construction: { emoji: "🚧", root: "egahu" },
  fries: { emoji: "🍟", root: "avado" },
  // compass arrows (east is also *therefore*)
  north: { emoji: "⬆️", root: "onahe" },
  northeast: { emoji: "↗️", root: "unohe" },
  east: { emoji: "➡️", root: "odu" },
  southeast: { emoji: "↘️", root: "oyohe" },
  south: { emoji: "⬇️", root: "ozahe" },
  southwest: { emoji: "↙️", root: "uwehe" },
  west: { emoji: "⬅️", root: "owehe" },
  northwest: { emoji: "↖️", root: "anohe" },
  // no channel on `/th/` (knowing.md#evidentiality): a record is REPORTED, a tale NOTIONAL
  record: { emoji: "⏺️", root: "ere" },
  scroll: { emoji: "📜", root: "oze" },
  // no intention on `/h/` (intention.md#plan): PLAN and DECISION are `/th/` stances
  map: { emoji: "🗺️", root: "ama" },
  check: { emoji: "✅", root: "ehu" },
  // template sample filler
  walk: { emoji: "🚶", root: "owore" },
  // the nine sake roots (sakes.md#sake-inventory); knot, tool and ballot are also template sample fillers
  ballot: { emoji: "🗳️", root: "ahu" },
  tool: { emoji: "🧰", root: "ulo" },
  lightbulb: { emoji: "💡", root: "ado" },
  compass: { emoji: "🧭", root: "ame" },
  knot: { emoji: "🪢", root: "ana" },
  present: { emoji: "🎁", root: "ebe" },
  strawberry: { emoji: "🍓", root: "ozo" },
  lungs: { emoji: "🫁", root: "oyu" },
  egg: { emoji: "🥚", root: "ega" },
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

const CLOSED_NAMES = Object.keys(CLOSED_ROWS) as ClosedName[];

/** Bumped whenever {@link CLOSED} is respelled, so values built from it are rebuilt. */
let version = 0;
/** The lexicon whose spellings {@link CLOSED} holds right now, when one was given. */
let activeLexicon: object | undefined;

/**
 * A value built from {@link CLOSED} (a set of roots, a gloss table), rebuilt after
 * {@link withLexiconClosedRoots} respells it. Never copy a closed root into a module constant.
 */
export function closedDerived<T>(build: () => T): () => T {
  let builtAt = -1;
  let value: T;
  return () => {
    if (builtAt !== version) {
      value = build();
      builtAt = version;
    }
    return value;
  };
}

type LexiconRows = ReadonlyMap<string, { emoji: string; root: string }>;

const ROOTS_BY_LEXICON = new WeakMap<object, Record<ClosedName, string>>();

/**
 * Closed roots as a lexicon spells them, by emoji. An entry whose emoji the lexicon lacks
 * (a test fixture) keeps this file's spelling.
 */
export function closedRootsIn(published: LexiconRows): Record<ClosedName, string> {
  let roots = ROOTS_BY_LEXICON.get(published);
  if (!roots) {
    const byEmoji = new Map<string, string>();
    for (const row of published.values()) if (row.emoji) byEmoji.set(row.emoji, row.root);
    roots = Object.fromEntries(
      CLOSED_NAMES.map((name) => [name, byEmoji.get(CLOSED_ROWS[name].emoji) ?? CLOSED_ROWS[name].root]),
    ) as Record<ClosedName, string>;
    ROOTS_BY_LEXICON.set(published, roots);
  }
  return roots;
}

/**
 * Run `fn` with {@link CLOSED} spelled as `published` spells it. Parse, gloss and classify entry
 * points call this with their tables, so text read against another lexicon (the pre-retie side of
 * a retie) reads its house cast, pronouns and arrows with that lexicon's spellings.
 */
export function withLexiconClosedRoots<T>(published: LexiconRows, fn: () => T): T {
  if (activeLexicon === published) return fn();
  const roots = closedRootsIn(published);
  const previous = activeLexicon;
  const saved = CLOSED_NAMES.some((name) => CLOSED[name] !== roots[name]) ? { ...CLOSED } : undefined;
  activeLexicon = published;
  if (saved) {
    Object.assign(CLOSED, roots);
    version += 1;
  }
  try {
    return fn();
  } finally {
    activeLexicon = previous;
    if (saved) {
      Object.assign(CLOSED, saved);
      version += 1;
    }
  }
}

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
