import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

import { parseCompoundCsv } from "../../src/lexicon-compounds.js";
import {
  parseOverlayCsv,
  parsePublishedCsv,
  senseFormRoot,
  type OverlayRow,
  type PublishedRow,
} from "../../src/lexicon-search.js";
import { REPO_ROOT, dataPath } from "../../src/repo-paths.js";
import type { Subject } from "./lexicon-review-types.js";

export const REVIEW_DIR = join(REPO_ROOT, "data", "lexicon-review");

/** English job of each role letter, for the `role-english` check. */
export const ROLE_ENGLISH: Record<string, string> = {
  z: "noun (subject)",
  d: "noun (object)",
  b: "noun (extra)",
  v: "verb",
  g: "adjective",
  w: "adverb modifying an adjective or adverb (degree word)",
  h: "adverb",
  th: "stance adverb",
  y: "word",
  x: "word",
};

export type LexiconData = {
  published: PublishedRow[];
  overlays: OverlayRow[];
  compounds: ReturnType<typeof parseCompoundCsv>;
};

export function loadLexiconData(): LexiconData {
  return {
    published: parsePublishedCsv(readFileSync(dataPath("lexicon-published.csv"), "utf8")),
    overlays: parseOverlayCsv(readFileSync(dataPath("lexicon-overlays.csv"), "utf8")),
    compounds: parseCompoundCsv(readFileSync(dataPath("lexicon-compounds.csv"), "utf8")),
  };
}

/** Roots and emoji that host at least one overlay row; the closed inventory teaches them. */
export function overlayHosts(overlays: OverlayRow[]): { roots: Set<string>; emoji: Set<string> } {
  const roots = new Set<string>();
  const emoji = new Set<string>();
  for (const o of overlays) {
    roots.add(senseFormRoot(o.senseForm));
    if (o.emoji) emoji.add(o.emoji);
  }
  return { roots, emoji };
}

export function isProtectedRow(row: PublishedRow, hosts: ReturnType<typeof overlayHosts>): boolean {
  return hosts.roots.has(row.root) || hosts.emoji.has(row.emoji);
}

export function rowSubjects(data: LexiconData): Subject[] {
  const hosts = overlayHosts(data.overlays);
  return data.published.map((row) => ({
    kind: "row" as const,
    key: row.emoji,
    label: row.root,
    protected: isProtectedRow(row, hosts),
    data: {
      concrete: row.concrete,
      abstract: row.abstract,
      mnemonic: row.mnemonic,
    },
  }));
}

export function aliasSubjects(data: LexiconData): Subject[] {
  const hosts = overlayHosts(data.overlays);
  const out: Subject[] = [];
  for (const row of data.published) {
    for (const alias of row.englishAliases ?? []) {
      out.push({
        kind: "alias",
        key: `${row.emoji}#${alias}`,
        label: `${row.root}#${alias}`,
        protected: isProtectedRow(row, hosts),
        data: { concrete: row.concrete, abstract: row.abstract, alias },
      });
    }
  }
  return out;
}

export function roleSubjects(data: LexiconData): Subject[] {
  const hosts = overlayHosts(data.overlays);
  const out: Subject[] = [];
  for (const row of data.published) {
    for (const sense of ["concrete", "abstract"] as const) {
      for (const [pos, lemma] of Object.entries(row.posEnglish[sense])) {
        if (!lemma) continue;
        out.push({
          kind: "role",
          key: `${row.emoji}#${sense}.${pos}`,
          label: `${row.root}#${sense}.${pos}`,
          protected: isProtectedRow(row, hosts),
          data: {
            sense: sense === "concrete" ? row.concrete : row.abstract,
            lemma,
            role: ROLE_ENGLISH[pos] ?? "word",
          },
        });
      }
    }
  }
  return out;
}

/** Compounds with the English sense of each member root (abstract when the member has no concrete). */
export function compoundSubjects(data: LexiconData): Subject[] {
  const hosts = overlayHosts(data.overlays);
  const byRoot = new Map(data.published.map((r) => [r.root, r]));
  const out: Subject[] = [];
  for (const c of data.compounds) {
    const left = byRoot.get(c.left);
    const right = byRoot.get(c.right);
    out.push({
      kind: "compound",
      key: c.stem,
      label: c.stem,
      protected: Boolean(
        (left && isProtectedRow(left, hosts)) || (right && isProtectedRow(right, hosts)),
      ),
      data: {
        left: left?.concrete || left?.abstract || "",
        right: right?.concrete || right?.abstract || "",
        concrete: c.concrete,
        abstract: c.abstract,
        mnemonic: c.mnemonic,
      },
    });
  }
  return out;
}

export function pairsPath(): string {
  return join(REVIEW_DIR, "pairs.jsonl");
}

export function pairSubjects(): Subject[] {
  const path = pairsPath();
  if (!existsSync(path)) return [];
  return readFileSync(path, "utf8")
    .split("\n")
    .filter(Boolean)
    .map((line) => JSON.parse(line) as Subject);
}

export function allSubjects(data: LexiconData): Subject[] {
  return [
    ...rowSubjects(data),
    ...aliasSubjects(data),
    ...roleSubjects(data),
    ...compoundSubjects(data),
    ...pairSubjects(),
  ];
}
