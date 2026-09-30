/** Sidecar written by `convert-word --lexicon` and read by `retie-docs`. */

export const RETIE_MAP_RELATIVE_PATH = "tmp/lexicon-retie-map.json";

export type RetiePair = {
  emoji: string;
  literal: string;
  oldRoot: string;
  newRoot: string;
};

/** A lexical compound whose stem moved because a part root moved (`abedelohohu` → `abedelahaza`). */
export type CompoundStemPair = {
  /** Compound rows have no emoji; kept empty for the shared pair shape. */
  emoji?: string;
  oldStem: string;
  newStem: string;
};

export type RetieMapFile = {
  generatedAt: string;
  pairs: RetiePair[];
  /** Compound stems, which docs spell as one opaque root, so they retie like roots. */
  compounds?: CompoundStemPair[];
};

export function buildRootMap(pairs: RetiePair[]): Map<string, string> {
  const map = new Map<string, string>();
  for (const pair of pairs) {
    const oldRoot = pair.oldRoot.trim();
    const newRoot = pair.newRoot.trim();
    if (!oldRoot || !newRoot || oldRoot === newRoot) {
      continue;
    }
    const existing = map.get(oldRoot);
    if (existing !== undefined && existing !== newRoot) {
      throw new Error(`Conflicting retie map for ${oldRoot}: ${existing} vs ${newRoot}`);
    }
    map.set(oldRoot, newRoot);
  }
  return map;
}

export function serializeRetieMap(
  pairs: RetiePair[],
  generatedAt = new Date().toISOString(),
  compounds: CompoundStemPair[] = [],
): string {
  const changed = pairs.filter((p) => p.oldRoot && p.newRoot && p.oldRoot !== p.newRoot);
  const map = buildRootMap(changed);
  const unique: RetiePair[] = [];
  const seen = new Set<string>();
  for (const pair of changed) {
    if (seen.has(pair.oldRoot)) {
      continue;
    }
    seen.add(pair.oldRoot);
    unique.push({
      emoji: pair.emoji,
      literal: pair.literal,
      oldRoot: pair.oldRoot,
      newRoot: map.get(pair.oldRoot) ?? pair.newRoot,
    });
  }
  const moved = compounds.filter((c) => c.oldStem && c.newStem && c.oldStem !== c.newStem);
  const body: RetieMapFile = { generatedAt, pairs: unique, ...(moved.length > 0 ? { compounds: moved } : {}) };
  return `${JSON.stringify(body, null, 2)}\n`;
}

export function parseRetieMapJson(text: string): Map<string, string> {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text) as unknown;
  } catch {
    throw new Error("Retie map is not valid JSON");
  }
  if (!parsed || typeof parsed !== "object" || !Array.isArray((parsed as RetieMapFile).pairs)) {
    throw new Error("Retie map must be an object with a pairs array");
  }
  const pairs = (parsed as RetieMapFile).pairs;
  for (const pair of pairs) {
    if (!pair || typeof pair.oldRoot !== "string" || typeof pair.newRoot !== "string") {
      throw new Error("Retie map pairs need oldRoot and newRoot strings");
    }
  }
  const compounds = (parsed as RetieMapFile).compounds ?? [];
  for (const pair of compounds) {
    if (!pair || typeof pair.oldStem !== "string" || typeof pair.newStem !== "string") {
      throw new Error("Retie map compounds need oldStem and newStem strings");
    }
  }
  return buildRootMap([
    ...pairs,
    ...compounds.map((c) => ({ emoji: c.emoji ?? "", literal: "", oldRoot: c.oldStem, newRoot: c.newStem })),
  ]);
}

/**
 * Old spellings the current word grammar cannot read. The retie parses each old word, so a
 * spelling-rule change made between building the map and the retie (`j` → `y`) hides every
 * word that used it. Do such passes before `convert-word --lexicon` or after the retie.
 */
export function unreadableOldRoots(map: ReadonlyMap<string, string>, parses: (word: string) => boolean): string[] {
  // A root takes an ending; a hook-compound stem (`awalalul`) already ends in one.
  return [...map.keys()].filter((oldRoot) => !parses(`z${oldRoot}l`) && !parses(`z${oldRoot}`));
}

export type MapCollision = {
  newRoot: string;
  reason: string;
};

/**
 * New spellings that would read as something else after the retie:
 * an unrelated word already spelled with the new root, or an English word in code.
 */
export function checkMapCollisions(
  map: ReadonlyMap<string, string>,
  context: { rootsInUse: ReadonlySet<string>; englishWords: ReadonlySet<string> },
): MapCollision[] {
  const collisions: MapCollision[] = [];
  for (const newRoot of new Set(map.values())) {
    if (context.englishWords.has(newRoot)) {
      collisions.push({ newRoot, reason: "is an English word the doc lint treats as English in code" });
    }
    if (context.rootsInUse.has(newRoot) && !map.has(newRoot)) {
      collisions.push({ newRoot, reason: "already spells a root used in the docs that is not moving" });
    }
  }
  return collisions;
}
