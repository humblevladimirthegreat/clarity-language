/**
 * Helpers for the head-by-head compound dictionary pass (proposal `compound-fill.md`):
 * resolve a root by seed or English label, report what a word is already covered by,
 * audit a head's compounds, and turn seed-keyed draft rows into validated stems.
 */
import {
  validateCompoundRows,
  type CompoundJoin,
  type CompoundRow,
} from "./lexicon-compounds.js";
import { posEnglishLemmaList, type OverlayRow, type PublishedRow } from "./lexicon-search.js";

/** Generic heads: only for a class name no narrower root covers. Keyed by seed so respelling is safe. */
export const GENERIC_HEAD_SEEDS = new Set(["𓄛", "𓉐", "🫙", "🧺"]);

export type Lexicon = {
  published: readonly PublishedRow[];
  compounds: readonly CompoundRow[];
  overlays: readonly OverlayRow[];
};

const norm = (s: string) => s.trim().toLowerCase();
const stripVs = (s: string) => s.replace(/️/g, "");

export type CueResult =
  | { ok: true; row: PublishedRow; via: CueTier }
  | { ok: false; reason: string; matches: PublishedRow[] };

export type CueTier = "seed" | "root" | "concrete" | "abstract" | "pos" | "alias";

/**
 * A published row named by seed (emoji or pictograph), root spelling, or English label.
 * Tiers are tried in order; the first tier with a match must match exactly one row.
 */
export function resolveCue(cue: string, published: readonly PublishedRow[]): CueResult {
  const key = norm(cue);
  if (!key) return { ok: false, reason: "empty cue", matches: [] };
  const tiers: Array<[CueTier, (row: PublishedRow) => boolean]> = [
    ["seed", (row) => !!row.emoji && stripVs(row.emoji) === stripVs(cue.trim())],
    ["root", (row) => row.root === key],
    ["concrete", (row) => norm(row.concrete) === key],
    ["abstract", (row) => norm(row.abstract) === key],
    ["pos", (row) => posEnglishLemmaList(row.posEnglish).includes(key)],
    ["alias", (row) => (row.englishAliases ?? []).some((alias) => norm(alias) === key)],
  ];
  for (const [tier, test] of tiers) {
    const matches = published.filter(test);
    if (matches.length === 1) return { ok: true, row: matches[0]!, via: tier };
    if (matches.length > 1) {
      return { ok: false, reason: `"${cue}" names ${matches.length} roots by ${tier}; use the seed`, matches };
    }
  }
  return { ok: false, reason: `"${cue}" names no published root`, matches: [] };
}

export function describeRow(row: PublishedRow): string {
  return `${row.emoji || "—"} ${row.concrete || "(no concrete)"}${row.abstract ? ` / ${row.abstract}` : ""}`;
}

export type CoverageKind =
  | "concrete"
  | "abstract"
  | "pos"
  | "alias"
  | "compound"
  | "compound-abstract"
  | "overlay";

export type CoverageHit = { kind: CoverageKind; form: string; label: string };

/** Every lexicon entry whose sense, English-by-PoS lemma, alias, or gloss is exactly `word`. */
export function senseCoverage(word: string, lexicon: Lexicon): CoverageHit[] {
  const key = norm(word);
  const hits: CoverageHit[] = [];
  for (const row of lexicon.published) {
    const label = describeRow(row);
    if (norm(row.concrete) === key) hits.push({ kind: "concrete", form: row.root, label });
    if (norm(row.abstract) === key) hits.push({ kind: "abstract", form: row.root, label });
    if (posEnglishLemmaList(row.posEnglish).includes(key)) hits.push({ kind: "pos", form: row.root, label });
    if ((row.englishAliases ?? []).some((alias) => norm(alias) === key)) {
      hits.push({ kind: "alias", form: row.root, label });
    }
  }
  for (const row of lexicon.compounds) {
    const label = `${row.concrete}${row.abstract ? ` / ${row.abstract}` : ""}`;
    if (norm(row.concrete) === key) hits.push({ kind: "compound", form: row.stem, label });
    if (norm(row.abstract) === key) hits.push({ kind: "compound-abstract", form: row.stem, label });
  }
  for (const row of lexicon.overlays) {
    if (norm(row.gloss) === key) hits.push({ kind: "overlay", form: row.senseForm, label: row.definition || row.gloss });
  }
  return hits;
}

export type HeadReport = {
  row: PublishedRow;
  generic: boolean;
  /** Compounds whose right member is this root. */
  headed: CompoundRow[];
  /** Compounds whose left member is this root. */
  modifying: CompoundRow[];
};

export function headReport(row: PublishedRow, compounds: readonly CompoundRow[]): HeadReport {
  return {
    row,
    generic: GENERIC_HEAD_SEEDS.has(row.emoji),
    headed: compounds.filter((c) => c.right === row.root),
    modifying: compounds.filter((c) => c.left === row.root),
  };
}

/** Published heads by number of compounds, most first. Hook-headed compounds are skipped. */
export function headCounts(lexicon: Lexicon): Array<{ row: PublishedRow; count: number }> {
  const byRoot = new Map(lexicon.published.map((row) => [row.root, row]));
  const counts = new Map<string, number>();
  for (const c of lexicon.compounds) {
    if (byRoot.has(c.right)) counts.set(c.right, (counts.get(c.right) ?? 0) + 1);
  }
  return [...counts]
    .map(([root, count]) => ({ row: byRoot.get(root)!, count }))
    .sort((a, b) => b.count - a.count || a.row.concrete.localeCompare(b.row.concrete));
}

/** One draft line: roots named by seed or label, never by spelling by hand. */
export type DraftRow = {
  english: string;
  left: string;
  join: string;
  head: string;
  abstract: string;
  mnemonic: string;
};

export const DRAFT_HEADERS = ["english", "left", "join", "head", "abstract", "mnemonic"] as const;

export type DraftResult = {
  draft: DraftRow;
  leftRow?: PublishedRow;
  headRow?: PublishedRow;
  compound?: CompoundRow;
  errors: string[];
  warnings: string[];
};

/** The house mnemonic opening for a draft: `<left sense> specifying <head>`. */
export function mnemonicPrefix(left: PublishedRow, join: string, head: PublishedRow): string {
  const leftSense = join === "m" ? left.abstract : left.concrete;
  return `${leftSense} specifying ${head.concrete}`;
}

/**
 * Resolve each draft to a compound row and validate the whole batch together with the
 * existing compounds (so two drafts cannot collide either). Warnings cover what the
 * validator does not: alias collisions, generic heads, and the mnemonic pattern.
 */
export function draftCompounds(drafts: readonly DraftRow[], lexicon: Lexicon): DraftResult[] {
  const results: DraftResult[] = drafts.map((draft) => {
    const errors: string[] = [];
    const warnings: string[] = [];
    const left = resolveCue(draft.left, lexicon.published);
    const head = resolveCue(draft.head, lexicon.published);
    if (!left.ok) errors.push(`left: ${left.reason}`);
    if (!head.ok) errors.push(`head: ${head.reason}`);
    const join = draft.join.trim().replace(/^-/, "");
    const result: DraftResult = { draft, errors, warnings };
    if (!left.ok || !head.ok) return result;
    result.leftRow = left.row;
    result.headRow = head.row;

    if (join === "m" && !left.row.abstract.trim()) {
      errors.push(`join -m reads the left root's abstract, but ${describeRow(left.row)} has none`);
    }
    if (GENERIC_HEAD_SEEDS.has(head.row.emoji)) {
      warnings.push(`generic head ${describeRow(head.row)}: check that no narrower root covers it`);
    }
    const english = draft.english.trim();
    const abstract = draft.abstract.trim();
    for (const sense of [english, abstract].filter(Boolean)) {
      for (const hit of senseCoverage(sense, lexicon)) {
        if (hit.kind === "pos" || hit.kind === "alias") {
          warnings.push(`"${sense}" is already ${hit.kind} English on ${hit.label} (${hit.form})`);
        }
      }
    }
    const prefix = mnemonicPrefix(left.row, join, head.row);
    if (draft.mnemonic.trim() && !draft.mnemonic.trim().startsWith(prefix)) {
      warnings.push(`mnemonic does not open with "${prefix}"`);
    }

    result.compound = {
      stem: `${left.row.root}${join}${head.row.root}`,
      left: left.row.root,
      join: join as CompoundJoin,
      right: head.row.root,
      concrete: english,
      abstract,
      mnemonic: draft.mnemonic.trim(),
      core: "",
    };
    return result;
  });

  const resolved = results.filter((r) => r.compound);
  const roots = new Set(lexicon.published.map((row) => row.root).filter(Boolean));
  const senses = new Set(
    lexicon.published.flatMap((row) => [row.concrete, row.abstract]).map(norm).filter(Boolean),
  );
  const firstDraftRow = lexicon.compounds.length + 2;
  const errors = validateCompoundRows(
    [...lexicon.compounds, ...resolved.map((r) => r.compound!)],
    roots,
    senses,
  );
  for (const err of errors) {
    if (err.row === undefined || err.row < firstDraftRow) continue;
    resolved[err.row - firstDraftRow]!.errors.push(err.reason);
  }
  return results;
}
