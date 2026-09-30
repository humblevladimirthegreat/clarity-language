import { englishCitationForms } from "../../src/lexicon-published-lint.js";
import { senseFormRoot, type OverlayRow, type PublishedRow } from "../../src/lexicon-search.js";
import type { ChatMessage } from "./llm-client.js";
import { isProtectedRow, overlayHosts, type LexiconData } from "./lexicon-review-subjects.js";
import type { Subject } from "./lexicon-review-types.js";

export type PairKind = "same-abstract" | "same-concrete" | "alias" | "embedding" | "cluster" | "overlay";

type Side = { id: string; text: string; protected: boolean };

const KIND_RANK: Record<PairKind, number> = {
  "same-abstract": 0,
  overlay: 1,
  "same-concrete": 2,
  alias: 3,
  cluster: 4,
  embedding: 5,
};

function rowSide(row: PublishedRow, hosts: ReturnType<typeof overlayHosts>): Side {
  const abstract = row.abstract ? `, abstract "${row.abstract}"` : "";
  return {
    id: row.emoji,
    text: `concrete "${row.concrete}"${abstract}`,
    protected: isProtectedRow(row, hosts),
  };
}

function overlaySide(o: OverlayRow): Side {
  return {
    id: `overlay:${o.senseForm}`,
    text: `special grammatical word "${o.gloss}"${o.definition ? ` (${o.definition})` : ""}`,
    protected: true,
  };
}

export function pairSubject(a: Side, b: Side, pairKind: PairKind, extra: Record<string, string> = {}): Subject {
  const [x, y] = a.id <= b.id ? [a, b] : [b, a];
  return {
    kind: "pair",
    key: `${x.id}|${y.id}`,
    label: pairKind,
    // An overlay pair is protected only when the published side is too.
    protected: pairKind === "overlay" ? (a.id.startsWith("overlay:") ? b : a).protected : x.protected && y.protected,
    data: { aText: x.text, bText: y.text, pairKind, ...extra },
  };
}

export type PairMap = Map<string, Subject>;

/** Keep the strongest reason when a pair is found more than once. */
export function addPair(map: PairMap, subject: Subject): void {
  const old = map.get(subject.key);
  if (!old) {
    map.set(subject.key, subject);
    return;
  }
  const a = subject.data.pairKind as PairKind;
  const b = old.data.pairKind as PairKind;
  if (KIND_RANK[a] < KIND_RANK[b]) map.set(subject.key, subject);
}

const forms = (word: string): Set<string> => (word ? englishCitationForms(word) : new Set());
const intersects = (a: Set<string>, b: Set<string>): boolean => {
  for (const x of a) if (b.has(x)) return true;
  return false;
};

/** Pairs found by spelling alone (inflection-aware); no model needed. */
export function exactPairs(data: LexiconData, map: PairMap = new Map()): PairMap {
  const hosts = overlayHosts(data.overlays);
  const rows = data.published.map((row) => ({
    row,
    abstract: forms(row.abstract),
    concrete: forms(row.concrete),
    aliases: new Set((row.englishAliases ?? []).flatMap((a) => [...forms(a)])),
    side: rowSide(row, hosts),
  }));

  for (let i = 0; i < rows.length; i++) {
    for (let j = i + 1; j < rows.length; j++) {
      const a = rows[i]!;
      const b = rows[j]!;
      if (intersects(a.abstract, b.abstract)) addPair(map, pairSubject(a.side, b.side, "same-abstract"));
      else if (intersects(a.concrete, b.concrete)) addPair(map, pairSubject(a.side, b.side, "same-concrete"));
      else if (
        intersects(a.aliases, b.abstract) ||
        intersects(a.aliases, b.concrete) ||
        intersects(b.aliases, a.abstract) ||
        intersects(b.aliases, a.concrete) ||
        intersects(a.aliases, b.aliases)
      ) {
        addPair(map, pairSubject(a.side, b.side, "alias"));
      }
    }
  }

  for (const overlay of data.overlays) {
    const gloss = forms(overlay.gloss);
    const hostRoot = senseFormRoot(overlay.senseForm);
    for (const r of rows) {
      if (r.row.root === hostRoot) continue;
      if (intersects(gloss, r.abstract) || intersects(gloss, r.concrete)) {
        addPair(map, pairSubject(overlaySide(overlay), r.side, "overlay"));
      }
    }
  }
  return map;
}

export function cosine(a: number[], b: number[]): number {
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i]! * b[i]!;
    na += a[i]! * a[i]!;
    nb += b[i]! * b[i]!;
  }
  return na && nb ? dot / Math.sqrt(na * nb) : 0;
}

/** The `limit` most similar distinct pairs at or above `minSim`, best first. */
export function topPairs(
  vectors: number[][],
  limit: number,
  minSim: number,
): Array<{ i: number; j: number; sim: number }> {
  const out: Array<{ i: number; j: number; sim: number }> = [];
  for (let i = 0; i < vectors.length; i++) {
    for (let j = i + 1; j < vectors.length; j++) {
      const sim = cosine(vectors[i]!, vectors[j]!);
      if (sim >= minSim) out.push({ i, j, sim });
    }
  }
  return out.sort((x, y) => y.sim - x.sim).slice(0, limit);
}

export type EmbedFn = (texts: string[]) => Promise<number[][]>;

export type EmbeddingOptions = { maxRowPairs: number; maxOverlayPairs: number; minSim: number };

/**
 * Ranked embedding candidates: the closest published-abstract pairs, and the closest overlay
 * gloss against a published abstract. Ranking by similarity (not a fixed cutoff) keeps the list
 * a reviewable size; nomic similarities all sit high, so an absolute threshold does not.
 */
export async function embeddingPairs(
  data: LexiconData,
  embed: EmbedFn,
  options: EmbeddingOptions,
  map: PairMap = new Map(),
): Promise<PairMap> {
  const hosts = overlayHosts(data.overlays);
  const rows = data.published.filter((r) => r.abstract);
  const overlays = data.overlays;
  const vectors = await embed([
    ...rows.map((r) => `clustering: ${r.abstract}`),
    ...overlays.map((o) => `clustering: ${o.gloss}`),
  ]);
  const rowVecs = vectors.slice(0, rows.length);
  const overlayVecs = vectors.slice(rows.length);

  for (const { i, j, sim } of topPairs(rowVecs, options.maxRowPairs, options.minSim)) {
    addPair(map, pairSubject(rowSide(rows[i]!, hosts), rowSide(rows[j]!, hosts), "embedding", { sim: sim.toFixed(3) }));
  }

  const overlayHits: Array<{ k: number; i: number; sim: number }> = [];
  for (let k = 0; k < overlays.length; k++) {
    const hostRoot = senseFormRoot(overlays[k]!.senseForm);
    for (let i = 0; i < rows.length; i++) {
      if (rows[i]!.root === hostRoot) continue;
      const sim = cosine(overlayVecs[k]!, rowVecs[i]!);
      if (sim >= options.minSim) overlayHits.push({ k, i, sim });
    }
  }
  overlayHits.sort((a, b) => b.sim - a.sim);
  for (const { k, i, sim } of overlayHits.slice(0, options.maxOverlayPairs)) {
    addPair(map, pairSubject(overlaySide(overlays[k]!), rowSide(rows[i]!, hosts), "overlay", { sim: sim.toFixed(3) }));
  }
  return map;
}

/** One prompt holding every unique abstract word; the model names groups of near-synonyms. */
export function clusterMessages(words: string[]): ChatMessage[] {
  return [
    {
      role: "system",
      content:
        'You are an English lexicographer. You are given a list of English words used as dictionary glosses. Find groups of words that are near-synonyms or that a learner would easily confuse. Reply with JSON only: {"groups": [["word","word"], ...]}. Use only words from the list, exactly as written. Skip words that have no near-synonym in the list. A group has 2-6 words.',
    },
    { role: "user", content: `Words:\n${words.join("\n")}` },
  ];
}

export function parseClusterResponse(value: unknown, known: Set<string>): string[][] {
  const groups = (value as { groups?: unknown })?.groups;
  if (!Array.isArray(groups)) throw new Error("expected {groups: [[...]]}");
  return groups
    .filter((g): g is unknown[] => Array.isArray(g))
    .map((g) => [...new Set(g.filter((w): w is string => typeof w === "string" && known.has(w)))])
    .filter((g) => g.length >= 2);
}

/** Every pair of rows inside a group, for rows whose abstract is one of the group's words. */
export function clusterPairs(data: LexiconData, groups: string[][], map: PairMap = new Map()): PairMap {
  const hosts = overlayHosts(data.overlays);
  const byAbstract = new Map<string, PublishedRow[]>();
  for (const row of data.published) {
    if (!row.abstract) continue;
    byAbstract.set(row.abstract, [...(byAbstract.get(row.abstract) ?? []), row]);
  }
  for (const group of groups) {
    const members = group.flatMap((w) => byAbstract.get(w) ?? []);
    for (let i = 0; i < members.length; i++) {
      for (let j = i + 1; j < members.length; j++) {
        const a = members[i]!;
        const b = members[j]!;
        if (a.abstract === b.abstract) continue;
        addPair(map, pairSubject(rowSide(a, hosts), rowSide(b, hosts), "cluster"));
      }
    }
  }
  return map;
}

export function countByKind(map: PairMap): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const s of map.values()) {
    const k = s.data.pairKind ?? "?";
    counts[k] = (counts[k] ?? 0) + 1;
  }
  return counts;
}
