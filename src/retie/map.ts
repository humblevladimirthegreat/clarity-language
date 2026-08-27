/** Sidecar written by `convert-word --lexicon` and read by `retie-docs`. */

export const RETIE_MAP_RELATIVE_PATH = "tmp/lexicon-retie-map.json";

export type RetiePair = {
  emoji: string;
  literal: string;
  oldRoot: string;
  newRoot: string;
};

export type RetieMapFile = {
  generatedAt: string;
  pairs: RetiePair[];
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

export function serializeRetieMap(pairs: RetiePair[], generatedAt = new Date().toISOString()): string {
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
  const body: RetieMapFile = { generatedAt, pairs: unique };
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
  return buildRootMap(pairs);
}
