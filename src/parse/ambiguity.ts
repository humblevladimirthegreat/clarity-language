import { classifyHits, type ClassifyHit, type ClassifyTables } from "./classify.js";
import { segmentUtterance } from "./tokenize.js";
import type { AmbiguityConflict } from "./types.js";
import { parseWord, probeMorphWord } from "./word.js";

function morphSignature(word: { family: unknown; pos?: string; ending?: string; gl?: boolean; plural?: boolean }): string {
  return JSON.stringify({
    pos: word.pos,
    gl: word.gl,
    ending: word.ending,
    plural: word.plural,
    family: word.family,
  });
}

function formalClassifyPair(a: ClassifyHit, b: ClassifyHit): boolean {
  const sources = new Set([a.source, b.source]);
  if (sources.has("overlay") && sources.has("published")) return true;
  if (sources.has("overlay") && sources.has("foreign")) return true;
  if (sources.has("overlay") && (sources.has("sake") || sources.has("ability"))) return true;
  if (sources.has("restrictor") && sources.has("join")) return true;
  if ((sources.has("sake") || sources.has("ability")) && sources.has("published")) return true;
  if (sources.has("number") && sources.has("published")) return true;
  if (sources.has("overlay") && sources.has("join")) {
    const readings = new Set([a.reading, b.reading]);
    if (readings.has("joinAct") || readings.has("joinRelation") || readings.has("overlay")) return true;
  }
  return false;
}

function classifyConflicts(surface: string, hits: ClassifyHit[]): AmbiguityConflict[] {
  const leftover: ClassifyHit[][] = [];
  for (let i = 0; i < hits.length; i++) {
    for (let j = i + 1; j < hits.length; j++) {
      const a = hits[i]!;
      const b = hits[j]!;
      if (!formalClassifyPair(a, b)) leftover.push([a, b]);
    }
  }
  if (leftover.length === 0) return [];
  return leftover.map(([a, b]) => ({
    surface,
    stage: "classify" as const,
    sources: [a!.source, b!.source],
    detail: `${a!.source}:${a!.reading} vs ${b!.source}:${b!.reading}`,
  }));
}

function morphConflicts(surface: string): AmbiguityConflict[] {
  const hits = probeMorphWord(surface);
  const top = hits.filter((h) => !h.source.startsWith("body"));
  const bodies = hits.filter((h) => h.source.startsWith("body"));

  const conflicts: AmbiguityConflict[] = [];

  const distinctTop = new Map<string, string>();
  for (const hit of top) {
    distinctTop.set(morphSignature(hit.word), hit.source);
  }
  if (distinctTop.size > 1) {
    conflicts.push({
      surface,
      stage: "morph",
      sources: [...distinctTop.values()],
      detail: [...distinctTop.entries()].map(([sig, src]) => `${src}:${sig}`).join(" | "),
    });
  }

  const distinctBody = new Map<string, string>();
  for (const hit of bodies) {
    distinctBody.set(morphSignature(hit.word), hit.source);
  }
  if (distinctBody.size > 1) {
    conflicts.push({
      surface,
      stage: "morph",
      sources: [...distinctBody.values()],
      detail: [...distinctBody.entries()].map(([sig, src]) => `${src}:${sig}`).join(" | "),
    });
  }

  return conflicts;
}

/** Residual first-match collisions with no grammar rule that names a winner. */
export function collectAmbiguity(text: string, tables: ClassifyTables): AmbiguityConflict[] {
  const conflicts: AmbiguityConflict[] = [];
  const seen = new Set<string>();

  for (const segment of segmentUtterance(text)) {
    if (segment.kind !== "word") continue;
    const surface = segment.text;
    let chosen;
    try {
      chosen = parseWord(surface);
    } catch {
      continue;
    }

    for (const conflict of morphConflicts(surface)) {
      const key = `${conflict.stage}:${conflict.surface}:${conflict.detail}`;
      if (seen.has(key)) continue;
      seen.add(key);
      conflicts.push(conflict);
    }

    for (const conflict of classifyConflicts(surface, classifyHits(chosen, tables))) {
      const key = `${conflict.stage}:${conflict.surface}:${conflict.detail}`;
      if (seen.has(key)) continue;
      seen.add(key);
      conflicts.push(conflict);
    }
  }

  return conflicts;
}
