/**
 * Phase 3 duplicate cull for lexicon.csv.
 * Cluster by group|subgroup|literal; pick one winner per cluster.
 * See docs/lexicon-strategy.md.
 */

import { prototypeScore, type LexiconRow } from "./variant-cluster.js";

/** Preferred Unicode name for clusters where prototypeScore picks the wrong emoji. */
export const WINNER_OVERRIDES: Record<string, string> = {
  "Smileys & Emotion|face-affection|kiss": "face blowing a kiss",
  "Smileys & Emotion|face-smiling|laugh": "face with tears of joy",
  "Symbols|other-symbol|check": "check mark button",
  "Travel & Places|sky & weather|lightning": "high voltage",
  "Travel & Places|place-building|castle": "castle",
  "Travel & Places|place-building|post-office": "post office",
  "People & Body|hand-fingers-open|raised-hand": "raised hand",
  "People & Body|hand-single-finger|point-up": "index pointing up",
  "People & Body|person-gesture|deaf": "deaf person",
  "People & Body|person-role|pregnant": "pregnant person",
  "People & Body|person-activity|partying": "people with bunny ears",
};

export function duplicateClusterKey(row: Pick<LexiconRow, "group" | "subgroup" | "literal">): string {
  const literal = (row.literal ?? "").trim();
  return `${row.group}|${row.subgroup}|${literal}`;
}

export function isDropA(row: LexiconRow): boolean {
  return !(row.literal ?? "").trim();
}

export interface LiteralDuplicateCluster {
  clusterKey: string;
  memberIndices: number[];
  winnerIndex: number;
}

export function buildDuplicateClusters(
  rows: LexiconRow[],
  options: { groupFilter?: string } = {},
): LiteralDuplicateCluster[] {
  const { groupFilter } = options;
  const byKey = new Map<string, number[]>();

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]!;
    if (groupFilter && row.group !== groupFilter) {
      continue;
    }
    if (isDropA(row)) {
      continue;
    }
    const key = duplicateClusterKey(row);
    const members = byKey.get(key) ?? [];
    members.push(i);
    byKey.set(key, members);
  }

  const clusters: LiteralDuplicateCluster[] = [];
  for (const [clusterKey, memberIndices] of byKey) {
    if (memberIndices.length <= 1) {
      continue;
    }
    clusters.push({
      clusterKey,
      memberIndices,
      winnerIndex: pickWinner(rows, memberIndices, clusterKey),
    });
  }

  return clusters;
}

/** Pick the best row index among cluster members. */
export function pickWinner(
  rows: LexiconRow[],
  memberIndices: number[],
  clusterKey?: string,
): number {
  const key = clusterKey ?? duplicateClusterKey(rows[memberIndices[0]!]!);
  const overrideName = WINNER_OVERRIDES[key];

  if (overrideName) {
    const overrideIdx = memberIndices.find(
      (i) => rows[i]!.name.toLowerCase() === overrideName.toLowerCase(),
    );
    if (overrideIdx !== undefined) {
      return overrideIdx;
    }
  }

  let winnerIndex = memberIndices[0]!;
  let bestScore = prototypeScore(rows[winnerIndex]!.name);

  for (let j = 1; j < memberIndices.length; j++) {
    const idx = memberIndices[j]!;
    const score = prototypeScore(rows[idx]!.name);
    if (score > bestScore || (score === bestScore && idx < winnerIndex)) {
      bestScore = score;
      winnerIndex = idx;
    }
  }

  return winnerIndex;
}

export interface CullResult {
  kept: number;
  culled: number;
  dropA: number;
  clusters: number;
  singletons: number;
}

export interface ApplyCullOptions {
  groupFilter?: string;
  /** Only update rows in the filtered group; leave other rows' keep unchanged. */
  scoped?: boolean;
}

export function applyCull(rows: LexiconRow[], options: ApplyCullOptions = {}): CullResult {
  const { groupFilter, scoped = Boolean(groupFilter) } = options;
  let kept = 0;
  let culled = 0;
  let dropA = 0;
  let singletons = 0;

  const duplicateClusters = buildDuplicateClusters(rows, { groupFilter });
  const winnerIndices = new Set<number>();
  for (const cluster of duplicateClusters) {
    winnerIndices.add(cluster.winnerIndex);
  }

  const duplicateMemberIndices = new Set<number>();
  for (const cluster of duplicateClusters) {
    for (const idx of cluster.memberIndices) {
      duplicateMemberIndices.add(idx);
    }
  }

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]!;

    if (scoped && groupFilter && row.group !== groupFilter) {
      continue;
    }

    if (isDropA(row)) {
      row.keep = "n";
      dropA++;
      culled++;
      continue;
    }

    if (!duplicateMemberIndices.has(i)) {
      row.keep = "y";
      singletons++;
      kept++;
      continue;
    }

    if (winnerIndices.has(i)) {
      row.keep = "y";
      kept++;
    } else {
      row.keep = "n";
      culled++;
    }
  }

  return {
    kept,
    culled,
    dropA,
    clusters: duplicateClusters.length,
    singletons,
  };
}

export interface CullReport {
  totalRows: number;
  dropARows: number;
  duplicateClusters: number;
  rowsInDuplicateClusters: number;
  singletonRows: number;
  projectedKeepY: number;
  largestClusters: {
    clusterKey: string;
    memberCount: number;
    winnerEmoji: string;
    winnerName: string;
    literal: string;
  }[];
}

export function buildCullReport(rows: LexiconRow[], options: { groupFilter?: string } = {}): CullReport {
  const { groupFilter } = options;
  const filtered = groupFilter ? rows.filter((r) => r.group === groupFilter) : rows;
  const dropARows = filtered.filter(isDropA).length;
  const clusters = buildDuplicateClusters(rows, { groupFilter });
  const rowsInDuplicateClusters = clusters.reduce((sum, c) => sum + c.memberIndices.length, 0);

  const duplicateMemberIndices = new Set<number>();
  for (const cluster of clusters) {
    for (const idx of cluster.memberIndices) {
      duplicateMemberIndices.add(idx);
    }
  }

  const withLiteralIndices: number[] = [];
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]!;
    if (groupFilter && row.group !== groupFilter) {
      continue;
    }
    if (!isDropA(row)) {
      withLiteralIndices.push(i);
    }
  }
  const singletonRows = withLiteralIndices.filter((i) => !duplicateMemberIndices.has(i)).length;

  const largestClusters = clusters
    .map((c) => {
      const winner = rows[c.winnerIndex]!;
      const literal = (winner.literal ?? "").trim();
      return {
        clusterKey: c.clusterKey,
        memberCount: c.memberIndices.length,
        winnerEmoji: winner.emoji,
        winnerName: winner.name,
        literal,
      };
    })
    .sort((a, b) => b.memberCount - a.memberCount)
    .slice(0, 15);

  const projectedKeepY = singletonRows + clusters.length;

  return {
    totalRows: filtered.length,
    dropARows,
    duplicateClusters: clusters.length,
    rowsInDuplicateClusters,
    singletonRows,
    projectedKeepY,
    largestClusters,
  };
}

export interface AuditIssue {
  kind: string;
  message: string;
}

export function auditCull(rows: LexiconRow[]): AuditIssue[] {
  const issues: AuditIssue[] = [];

  const keepCounts = { y: 0, n: 0, empty: 0 };
  for (const row of rows) {
    const k = (row.keep ?? "").trim();
    if (k === "y") keepCounts.y++;
    else if (k === "n") keepCounts.n++;
    else keepCounts.empty++;
  }

  if (keepCounts.empty > 0) {
    issues.push({
      kind: "incomplete",
      message: `${keepCounts.empty} rows have empty keep (expected 0)`,
    });
  }

  const dropA = rows.filter(isDropA);
  const badDropA = dropA.filter((r) => (r.keep ?? "").trim() !== "n");
  if (badDropA.length > 0) {
    issues.push({
      kind: "drop-a",
      message: `${badDropA.length} Drop A rows (empty literal) do not have keep=n`,
    });
  }

  const keptWithLiteral = rows.filter((r) => (r.keep ?? "").trim() === "y" && !isDropA(r));
  const byKey = new Map<string, LexiconRow[]>();
  for (const row of keptWithLiteral) {
    const key = duplicateClusterKey(row);
    const arr = byKey.get(key) ?? [];
    arr.push(row);
    byKey.set(key, arr);
  }

  const dupKeepY = [...byKey.entries()].filter(([, arr]) => arr.length > 1);
  if (dupKeepY.length > 0) {
    issues.push({
      kind: "duplicate-keep-y",
      message: `${dupKeepY.length} group|subgroup|literal clusters have multiple keep=y rows`,
    });
  }

  const keptWithEmptyLiteral = rows.filter((r) => (r.keep ?? "").trim() === "y" && isDropA(r));
  if (keptWithEmptyLiteral.length > 0) {
    issues.push({
      kind: "keep-y-empty-literal",
      message: `${keptWithEmptyLiteral.length} rows have keep=y but empty literal`,
    });
  }

  const clarityFilled = rows.filter((r) => (r.clarity ?? "").trim());
  if (clarityFilled.length > 0) {
    issues.push({
      kind: "clarity-premature",
      message: `${clarityFilled.length} rows have clarity set (Phase 4 not started)`,
    });
  }

  return issues;
}
