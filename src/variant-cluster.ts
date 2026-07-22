/**
 * Mechanical variant clustering for lexicon.csv Phase 1 collapse.
 * See docs/lexicon-strategy.md.
 */

import {
  stripAllVariantSuffixes,
  stripSkinToneFragments,
  stripVariantSuffix,
} from "./literal-normalizer.js";

export interface LexiconRow {
  emoji: string;
  name: string;
  group: string;
  subgroup: string;
  literal?: string;
  clarity?: string;
  keep?: string;
}

export interface Cluster {
  clusterKey: string;
  prototypeIndex: number;
  memberIndices: number[];
}

const COMPONENT_SUBGROUPS = new Set(["skin-tone", "hair-style"]);

const HEART_COLOR_PATTERN =
  /^(red|pink|orange|yellow|green|blue|light blue|purple|brown|black|grey|white) heart$/i;

const GENDER_PREFIX =
  /^(?:people|person|men|man|women|woman|boys|boy|girls|girl)\s+/i;

/** Strip gender/role prefixes for clustering (broader than literal-normalizer). */
function normalizeGenderForCluster(name: string): string {
  let base = name
    .replace(/^(?:woman|man)\s+and\s+(?:woman|man)\s+/i, "")
    .replace(GENDER_PREFIX, "")
    .trim();
  base = base.replace(/^and\s+/i, "").trim();
  return base;
}

/** Map variant names to a shared cluster base (clustering only, not literal assignment). */
const CLUSTER_ALIASES: Record<string, string> = {
  "speaker low volume": "speaker",
  "speaker medium volume": "speaker",
  "speaker high volume": "speaker",
  "musical note": "musical note",
  "musical notes": "musical note",
};

function slugifyKey(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

const PERSON_BASE_LITERALS: Record<string, string> = {
  baby: "baby",
  child: "child",
  boy: "boy",
  girl: "girl",
  person: "person",
  man: "man",
  woman: "woman",
  "older person": "older-person",
  "old man": "old-man",
  "old woman": "old-woman",
};

/** Family subgroup cluster base — strips skin tones, keeps concept only. */
export function familyConceptKey(name: string): string {
  const base = stripSkinToneFragments(name).toLowerCase().trim();
  if (base === "family" || base.startsWith("family:")) return "family";
  if (base === "kiss" || base.startsWith("kiss:")) return "kiss";
  if (base.startsWith("couple with heart")) return "couple";
  if (base.startsWith("woman and man holding hands")) return "woman-and-man-holding-hands";
  if (base.startsWith("women holding hands")) return "women-holding-hands";
  if (base.startsWith("men holding hands")) return "men-holding-hands";
  if (base.startsWith("people holding hands")) return "holding-hands";
  return slugifyKey(base);
}

function personClusterBase(name: string): string {
  const base = stripAllVariantSuffixes(name).toLowerCase().trim();
  return PERSON_BASE_LITERALS[base] ?? slugifyKey(base);
}

/** Derive a cluster key for grouping near-duplicate rows within a subgroup. */
export function clusterKey(row: Pick<LexiconRow, "name" | "subgroup">): string {
  const { name, subgroup } = row;

  if (COMPONENT_SUBGROUPS.has(subgroup)) {
    return `${subgroup}|${name}`;
  }

  if (subgroup === "family") {
    return `${subgroup}|${familyConceptKey(name)}`;
  }

  if (subgroup === "person") {
    return `${subgroup}|${personClusterBase(name)}`;
  }

  let base = normalizeGenderForCluster(stripAllVariantSuffixes(name));

  const alias = CLUSTER_ALIASES[base.toLowerCase()];
  if (alias) {
    base = alias;
  }

  if (subgroup.startsWith("face-")) {
    base = base.replace(/\s+with\s+.+$/i, "");
  }

  if (subgroup === "heart" && HEART_COLOR_PATTERN.test(base)) {
    return `${subgroup}|${slugifyKey(base)}`;
  }

  return `${subgroup}|${slugifyKey(base)}`;
}

/** Higher score = better prototype candidate (unqualified / default presentation). */
export function prototypeScore(name: string): number {
  let score = 0;
  if (!/:\s*(?:light|medium-light|medium|medium-dark|dark) skin tone/i.test(name)) {
    score += 100;
  }
  if (!/:\s*(?:red|curly|white|blond) hair/i.test(name)) {
    score += 50;
  }
  if (!/:\s*bald/i.test(name)) {
    score += 50;
  }
  if (!/:\s*beard/i.test(name)) {
    score += 50;
  }
  if (/^person\s+/i.test(name)) {
    score += 40;
  }
  if (/^(?:man|woman|boy|girl)\s+/i.test(name)) {
    score -= 20;
  }
  score -= name.length * 0.01;
  return score;
}

export function buildClusters(rows: LexiconRow[]): Cluster[] {
  const byKey = new Map<string, number[]>();

  for (let i = 0; i < rows.length; i++) {
    const key = clusterKey(rows[i]!);
    const members = byKey.get(key) ?? [];
    members.push(i);
    byKey.set(key, members);
  }

  const clusters: Cluster[] = [];
  for (const [key, memberIndices] of byKey) {
    let prototypeIndex = memberIndices[0]!;
    let bestScore = prototypeScore(rows[prototypeIndex]!.name);

    for (let j = 1; j < memberIndices.length; j++) {
      const idx = memberIndices[j]!;
      const score = prototypeScore(rows[idx]!.name);
      if (score > bestScore) {
        bestScore = score;
        prototypeIndex = idx;
      }
    }

    clusters.push({ clusterKey: key, prototypeIndex, memberIndices });
  }

  return clusters;
}

export interface PropagateResult {
  clustersPropagated: number;
  rowsUpdated: number;
  clustersWaiting: number;
}

/** Copy prototype literal to cluster members. */
export function propagateLiterals(
  rows: LexiconRow[],
  clusters: Cluster[],
  options: { force?: boolean } = {},
): PropagateResult {
  const { force = false } = options;
  let clustersPropagated = 0;
  let rowsUpdated = 0;
  let clustersWaiting = 0;

  for (const cluster of clusters) {
    const prototype = rows[cluster.prototypeIndex]!;
    const literal = (prototype.literal ?? "").trim();
    if (!literal) {
      if (cluster.memberIndices.length > 1) {
        clustersWaiting++;
      }
      continue;
    }

    let clusterUpdated = false;
    for (const idx of cluster.memberIndices) {
      if (idx === cluster.prototypeIndex) {
        continue;
      }
      const current = (rows[idx]!.literal ?? "").trim();
      if (!current || (force && current !== literal)) {
        rows[idx]!.literal = literal;
        rowsUpdated++;
        clusterUpdated = true;
      }
    }

    if (clusterUpdated) {
      clustersPropagated++;
    }
  }

  return { clustersPropagated, rowsUpdated, clustersWaiting };
}

export interface ClusterReport {
  totalRows: number;
  totalClusters: number;
  multiMemberClusters: number;
  skinToneRows: number;
  genderVariantRows: number;
  largestClusters: { clusterKey: string; prototypeEmoji: string; memberCount: number; hasLiteral: boolean }[];
}

export function buildClusterReport(rows: LexiconRow[], clusters: Cluster[]): ClusterReport {
  const multi = clusters.filter((c) => c.memberIndices.length > 1);
  const skinToneRows = rows.filter((r) => /skin tone/i.test(r.name)).length;
  const genderVariantRows = rows.filter((r) =>
    /^(?:man|woman|boy|girl)\s+/i.test(r.name),
  ).length;

  const largestClusters = multi
    .map((c) => {
      const prototype = rows[c.prototypeIndex]!;
      return {
        clusterKey: c.clusterKey,
        prototypeEmoji: prototype.emoji,
        memberCount: c.memberIndices.length,
        hasLiteral: Boolean((prototype.literal ?? "").trim()),
      };
    })
    .sort((a, b) => b.memberCount - a.memberCount)
    .slice(0, 15);

  return {
    totalRows: rows.length,
    totalClusters: clusters.length,
    multiMemberClusters: multi.length,
    skinToneRows,
    genderVariantRows,
    largestClusters,
  };
}
