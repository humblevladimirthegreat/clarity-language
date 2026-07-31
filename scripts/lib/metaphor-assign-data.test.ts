import assert from "node:assert/strict";

import {
  chunkEmptyRowsRandom,
  createSeededRng,
  enrichPass2Candidates,
  isValidLemma,
  mergePass1Picks,
  seededShuffle,
  slugLemma,
  splitIntoChunks,
  validateApply,
  type PublishedRow,
  type StagingFile,
} from "./metaphor-assign-data.js";

function row(emoji: string, literal: string, metaphorical = ""): PublishedRow {
  return {
    emoji,
    literal,
    clarity: "xxx",
    metaphorical,
    mnemonic: metaphorical ? "cue" : "REVIEW",
    group: "G",
    subgroup: "sub",
  };
}

// seededShuffle determinism
const items = ["a", "b", "c", "d", "e"];
assert.deepEqual(seededShuffle(items, 42), seededShuffle(items, 42));
assert.notDeepEqual(seededShuffle(items, 42), seededShuffle(items, 43));

// splitIntoChunks
assert.deepEqual(splitIntoChunks([1, 2, 3, 4, 5], 2), [[1, 2, 3], [4, 5]]);
assert.deepEqual(splitIntoChunks([], 3), []);

// chunkEmptyRowsRandom produces chunkCount chunks (or fewer if tiny input)
const empty = [row("😀", "grin"), row("😂", "laugh"), row("😊", "smile"), row("😢", "cry")];
const chunks = chunkEmptyRowsRandom(empty, 7, 2);
assert.equal(chunks.length, 2);
assert.equal(chunks[0]!.length + chunks[1]!.length, 4);

// mergePass1Picks dedupe + top 50
const rowByEmoji = new Map([
  ["😀", row("😀", "grin")],
  ["😂", row("😂", "laugh")],
  ["😊", row("😊", "smile")],
]);
const merged = mergePass1Picks(
  [
    { emoji: "😀", score: 5, rationale: "a" },
    { emoji: "😀", score: 9, rationale: "b" },
    { emoji: "😂", score: 7, rationale: "c" },
    { emoji: "🚫", score: 10, rationale: "unknown" },
  ],
  rowByEmoji,
  50,
);
assert.equal(merged.length, 2);
assert.equal(merged[0]!.emoji, "😀");
assert.equal(merged[0]!.score, 9);
assert.equal(merged[1]!.emoji, "😂");

// slugLemma + isValidLemma
assert.equal(slugLemma("Self Care"), "self-care");
assert.equal(isValidLemma("relief"), true);
assert.equal(isValidLemma("Bad Lemma"), false);

// validateApply
const staging: StagingFile = {
  lemma: "relief",
  model: "test",
  seed: 1,
  pass1: { chunk_count: 1, per_chunk_top: 1, chunks: [], pool: [] },
  pass2: {
    candidates: [
      {
        rank: 1,
        emoji: "😅",
        literal: "nervous-laugh",
        clarity: "eno",
        subgroup: "face-smiling",
        mnemonic: "tension breaks into relief",
        teachability: 4,
        rationale: "ok",
      },
    ],
    gold_examples: [],
    recommend_review: false,
  },
  human: { decision: null, chosen_rank: null, mnemonic_final: null, notes: "" },
};

const published = [row("😅", "nervous-laugh"), row("😂", "laugh", "amusement")];
let v = validateApply(staging, published);
assert.equal(v.ok, false);
assert.ok(v.errors.some((e) => e.includes("decision")));

staging.human.decision = "accept";
staging.human.chosen_rank = 1;
v = validateApply(staging, published);
assert.equal(v.ok, true);
assert.equal(v.emoji, "😅");
assert.equal(v.mnemonic, "tension breaks into relief");

staging.human.decision = "REVIEW";
v = validateApply(staging, published);
assert.equal(v.ok, true);

// enrichPass2Candidates
const enriched = enrichPass2Candidates(
  [{ rank: 1, emoji: "😅", mnemonic: "m", teachability: 3, rationale: "r" }],
  rowByEmoji,
);
assert.equal(enriched.length, 0); // 😅 not in rowByEmoji

const enriched2 = enrichPass2Candidates(
  [{ rank: 1, emoji: "😀", mnemonic: "m", teachability: 3, rationale: "r" }],
  rowByEmoji,
);
assert.equal(enriched2[0]!.literal, "grin");

// createSeededRng produces values in [0, 1)
const rng = createSeededRng(123);
for (let i = 0; i < 20; i++) {
  const n = rng();
  assert.ok(n >= 0 && n < 1);
}

console.log("metaphor-assign-data tests passed");
