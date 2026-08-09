import type { GoldExample, Pass1Pick, PoolEntry, PublishedRow } from "./metaphor-assign-data.js";

const PHASE5_RULES = `Phase 5 rules for metaphorical glosses:
- metaphorical is ONE lowercase English word or short hyphenated lemma (e.g. relief, self-care).
- It is the figurative extension of the emoji's immediate reading (literal), not a second unrelated root.
- The link must be teachable: a learner can see how literal leads to metaphorical.
- Prefer strong, memorable leaps over weak associations.
- If nothing in the list fits well, return fewer picks (or an empty array for pass 1).
- Do not reuse metaphors already taken (listed when provided).`;

export function pass1SystemPrompt(): string {
  return `You help assign English metaphor lemmas to emoji lexicon rows for the Agelan language dictionary.

${PHASE5_RULES}

Pass 1 task: recall — pick the best candidate rows from ONLY the provided chunk for the target metaphor lemma.
Return JSON only: an array of objects with keys emoji, score (0-10), rationale (one short line).
No mnemonics in pass 1. Score 0 means poor fit; 10 means excellent teachable literal→metaphor link.
Only use emoji values from the candidate list.`;
}

export function pass1UserPrompt(
  lemma: string,
  chunkRows: PublishedRow[],
  perChunkTop: number,
  usedMetaphors: string[],
): string {
  const used =
    usedMetaphors.length > 0
      ? `Already-used metaphors (do not propose rows for a different sense of these): ${usedMetaphors.slice(0, 100).join(", ")}${usedMetaphors.length > 100 ? ", ..." : ""}`
      : "No metaphors assigned yet.";

  const tsv = ["emoji\tliteral\tclarity\tsubgroup", ...chunkRows.map(rowToTsv)].join("\n");

  return `Target metaphor lemma: ${lemma}

${used}

Candidates (pick up to ${perChunkTop}):
${tsv}

Return a JSON array of up to ${perChunkTop} picks, best first.`;
}

export function pass2SystemPrompt(): string {
  return `You help finalize metaphor assignments for the Agelan language emoji lexicon.

${PHASE5_RULES}

Pass 2 task: precision — from the shortlist only, return exactly 5 ranked candidates (or fewer if pool < 5) with draft mnemonics.
Each mnemonic is a short English phrase linking literal → metaphorical.

Return JSON only:
{
  "candidates": [
    { "rank": 1, "emoji": "...", "mnemonic": "...", "teachability": 4, "rationale": "..." }
  ],
  "recommend_review": false
}

teachability is 1-5 (5 = best). Set recommend_review true if none of the options are good enough.`;
}

export function pass2UserPrompt(
  lemma: string,
  pool: PoolEntry[],
  goldExamples: GoldExample[],
  usedMetaphors: string[],
): string {
  const used =
    usedMetaphors.length > 0
      ? `Already-used metaphors: ${usedMetaphors.slice(0, 100).join(", ")}${usedMetaphors.length > 100 ? ", ..." : ""}`
      : "No metaphors assigned yet.";

  const examples =
    goldExamples.length > 0
      ? goldExamples
          .map(
            (ex) =>
              `- ${ex.emoji} literal=${ex.literal} → metaphorical=${ex.metaphorical}; mnemonic="${ex.mnemonic}"`,
          )
          .join("\n")
      : "(no examples)";

  const tsv = ["emoji\tliteral\tclarity\tsubgroup\tpass1_score", ...pool.map(poolToTsv)].join(
    "\n",
  );

  const targetCount = Math.min(5, pool.length);

  return `Target metaphor lemma: ${lemma}

${used}

Good examples from the lexicon:
${examples}

Shortlist (pick from these only):
${tsv}

Return exactly ${targetCount} ranked candidates with mnemonics using metaphorical="${lemma}".`;
}

function rowToTsv(row: PublishedRow): string {
  return `${row.emoji}\t${row.literal}\t${row.clarity}\t${row.subgroup}`;
}

function poolToTsv(row: PoolEntry): string {
  return `${row.emoji}\t${row.literal}\t${row.clarity}\t${row.subgroup}\t${row.score}`;
}

export function parsePass1Response(value: unknown): Pass1Pick[] {
  if (!Array.isArray(value)) {
    throw new Error("Pass 1 response must be a JSON array");
  }
  return value.map((item, i) => {
    if (!item || typeof item !== "object") {
      throw new Error(`Pass 1 item ${i} is not an object`);
    }
    const obj = item as Record<string, unknown>;
    const emoji = String(obj.emoji ?? "").trim();
    const score = Number(obj.score);
    const rationale = String(obj.rationale ?? "").trim();
    if (!emoji) throw new Error(`Pass 1 item ${i} missing emoji`);
    if (!Number.isFinite(score)) throw new Error(`Pass 1 item ${i} invalid score`);
    return { emoji, score, rationale };
  });
}

export type Pass2Response = {
  candidates: Array<{
    rank: number;
    emoji: string;
    mnemonic: string;
    teachability: number;
    rationale: string;
  }>;
  recommend_review: boolean;
};

export function parsePass2Response(value: unknown): Pass2Response {
  if (!value || typeof value !== "object") {
    throw new Error("Pass 2 response must be a JSON object");
  }
  const obj = value as Record<string, unknown>;
  if (!Array.isArray(obj.candidates)) {
    throw new Error("Pass 2 response missing candidates array");
  }
  const candidates = obj.candidates.map((item, i) => {
    if (!item || typeof item !== "object") {
      throw new Error(`Pass 2 candidate ${i} is not an object`);
    }
    const c = item as Record<string, unknown>;
    const rank = Number(c.rank);
    const emoji = String(c.emoji ?? "").trim();
    const mnemonic = String(c.mnemonic ?? "").trim();
    const teachability = Number(c.teachability);
    const rationale = String(c.rationale ?? "").trim();
    if (!Number.isInteger(rank) || rank < 1) {
      throw new Error(`Pass 2 candidate ${i} invalid rank`);
    }
    if (!emoji) throw new Error(`Pass 2 candidate ${i} missing emoji`);
    if (!Number.isFinite(teachability)) {
      throw new Error(`Pass 2 candidate ${i} invalid teachability`);
    }
    return { rank, emoji, mnemonic, teachability, rationale };
  });
  return {
    candidates,
    recommend_review: Boolean(obj.recommend_review),
  };
}
