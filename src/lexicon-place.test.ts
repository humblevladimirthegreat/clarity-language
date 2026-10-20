import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { englishRank, loadFrequencyRanks, placePublishedRoots, rowPriority } from "./lexicon-place.ts";
import type { OverlayRow } from "./lexicon-search.ts";

describe("frequency priority", () => {
  it("ranks a common word ahead of an unlisted one", () => {
    const ranks = loadFrequencyRanks();
    assert.ok(englishRank("the", ranks) < englishRank("notawordzz", ranks));
    assert.equal(englishRank("notawordzz", ranks), 50001);
  });

  it("uses the rarest word of a multi-word label", () => {
    const ranks = loadFrequencyRanks();
    assert.equal(englishRank("the notawordzz", ranks), englishRank("notawordzz", ranks));
  });
});

describe("placement", () => {
  const overlay: OverlayRow = {
    senseForm: "alodom",
    pos: "th",
    emoji: "🗳️",
    kind: "sake",
    gloss: "autonomy",
    definition: "",
    mnemonic: "",
    anchor: "sakes.md#x",
  };

  it("ranks a row by its most frequent sense", () => {
    const ranks = loadFrequencyRanks();
    const grin = { emoji: "😀", concrete: "grin", abstract: "delight", englishByPos: "" };
    assert.equal(rowPriority(grin, ranks), Math.min(englishRank("grin", ranks), englishRank("delight", ranks)));
  });

  it("anneals an eligible row to three letters and gives an ordinary row its tail", async () => {
    const placed = await placePublishedRoots(
      [
        { emoji: "🗳️", concrete: "ballot", abstract: "autonomy", englishByPos: "" },
        { emoji: "😀", concrete: "grin", abstract: "delight", englishByPos: "", kind: "mind", shape: "holds" },
      ],
      [overlay],
      { annealRestarts: 1, annealSteps: 20, tailSteps: 100 },
    );
    const ballot = placed.find((row) => row.emoji === "🗳️")!;
    const grin = placed.find((row) => row.emoji === "😀")!;
    assert.equal(ballot.length, 3);
    assert.equal(ballot.root.length, 3);
    assert.equal(grin.length, 5);
    assert.match(grin.root, /^[aeou][bdghylmnrvwz][aeou]ma$/);
  });

  it("keeps a row's root length, and the other five-letter roots out of a re-placed row's way", async () => {
    const placed = await placePublishedRoots(
      [{ emoji: "🗳️", concrete: "ballot", abstract: "autonomy", englishByPos: "", root: "egemo", kind: "mind", shape: "one" }],
      [overlay],
      { kept: [{ emoji: "😀", root: "egema" }], tailSteps: 100 },
    );
    assert.equal(placed[0]!.length, 5);
    assert.match(placed[0]!.root, /^[aeou][bdghylmnrvwz][aeou]mo$/);
    assert.notEqual(placed[0]!.root.slice(0, 2), "eg");
  });

  it("refuses a five-letter row with no kind", async () => {
    await assert.rejects(
      placePublishedRoots([{ emoji: "😀", concrete: "grin", abstract: "delight", englishByPos: "" }], [], { tailSteps: 0 }),
      /need a kind and shape/,
    );
  });

  it("keeps a new root two letters and a consonant away from a kept root in the same overlay group", async () => {
    const compass: OverlayRow = { ...overlay, senseForm: "alodam", emoji: "🧭", gloss: "purpose" };
    const placed = await placePublishedRoots(
      [{ emoji: "🧭", concrete: "compass", abstract: "direction", englishByPos: "" }],
      [overlay, compass],
      { blocked: ["aba"], kept: [{ emoji: "🗳️", root: "aba" }], annealRestarts: 1, annealSteps: 20_000 },
    );
    const root = placed[0]!.root;
    assert.ok([...root].filter((letter, i) => letter !== "aba"[i]).length >= 2, root);
    assert.notEqual(root[1], "b", root);
  });
});
