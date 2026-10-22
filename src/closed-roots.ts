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
  swan: { emoji: "🦢", root: "uzoze" },
  lion: { emoji: "🦁", root: "olazu" },
  hibiscus: { emoji: "🌺", root: "ahela" },
  // discourse-role specials (**-n**)
  microphone: { emoji: "🎤", root: "uwo" },
  headphones: { emoji: "🎧", root: "awa" },
  handshake: { emoji: "🤝", root: "aya" },
  neutral: { emoji: "😐", root: "umo" },
  // topic pronoun (`zozan`, topic.md#topic-pronoun) and generic pronoun (`zoben`)
  star: { emoji: "⭐", root: "alo" },
  person: { emoji: "🧑", root: "eyo" },
  // the language's own name
  glasses: { emoji: "👓", root: "agebo" },
  // greeting turn (`yeweval`)
  wave: { emoji: "👋", root: "ewuya" },
  // *during* (`huwem`): its `/b/` can be a role pointer's scene
  gemini: { emoji: "♊", root: "ere" },
  // `/x/` linkers
  zebra: { emoji: "🦓", root: "ezo" },
  clock: { emoji: "🕰️", root: "egore" },
  film: { emoji: "🎞️", root: "uvewe" },
  construction: { emoji: "🚧", root: "egohu" },
  fries: { emoji: "🍟", root: "uveda" },
  // compass arrows (east is also *therefore*)
  north: { emoji: "⬆️", root: "onuhe" },
  northeast: { emoji: "↗️", root: "unuhe" },
  east: { emoji: "➡️", root: "ahe" },
  southeast: { emoji: "↘️", root: "ezuhe" },
  south: { emoji: "⬇️", root: "azuhe" },
  southwest: { emoji: "↙️", root: "uzuhe" },
  west: { emoji: "⬅️", root: "owuhe" },
  northwest: { emoji: "↖️", root: "anuhe" },
  // no channel on `/th/` (knowing.md#evidentiality): a record is REPORTED, a tale NOTIONAL
  record: { emoji: "⏺️", root: "ego" },
  scroll: { emoji: "📜", root: "one" },
  // no intention on `/h/` (intention.md#plan): PLAN and DECISION are `/th/` stances
  map: { emoji: "🗺️", root: "age" },
  check: { emoji: "✅", root: "ogo" },
  // no deontic on `/th/` (sakes.md#say-words): permission, a ban, and a requirement are say words on `/h/`
  green: { emoji: "🟢", root: "ole" },
  noEntry: { emoji: "⛔", root: "egu" },
  memo: { emoji: "📝", root: "ona" },
  // template sample filler
  walk: { emoji: "🚶", root: "owure" },
  // the nine sake roots (sakes.md#sake-inventory); knot, tool and ballot are also template sample fillers
  ballot: { emoji: "🗳️", root: "una" },
  tool: { emoji: "🧰", root: "uwa" },
  lightbulb: { emoji: "💡", root: "owo" },
  compass: { emoji: "🧭", root: "ure" },
  knot: { emoji: "🪢", root: "awo" },
  present: { emoji: "🎁", root: "ewa" },
  strawberry: { emoji: "🍓", root: "odo" },
  lungs: { emoji: "🫁", root: "oba" },
  egg: { emoji: "🥚", root: "uda" },
} as const satisfies Record<string, ClosedRow>;

export type ClosedName = keyof typeof CLOSED_ROWS;

/** Current spelling of each closed root, by name (`CLOSED.swan` = the swan house name's root). */
export const CLOSED: Record<ClosedName, string> = Object.fromEntries(
  Object.entries(CLOSED_ROWS).map(([name, row]) => [name, row.root]),
) as Record<ClosedName, string>;

/** Every closed entry with its emoji (for the drift test and the resync). */
export const CLOSED_ENTRIES: ReadonlyArray<{ name: ClosedName } & ClosedRow> = Object.entries(CLOSED_ROWS).map(
  ([name, row]) => ({ name: name as ClosedName, ...row }),
);

/** The house cast: the three single-root names examples use for people (grammar-docs.md#house-cast). */
export const HOUSE_CAST: readonly ClosedName[] = ["swan", "lion", "hibiscus"];

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
