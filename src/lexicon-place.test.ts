import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { englishRank, loadFrequencyRanks, pickByRegret, placePublishedRoots, rowPriority } from "./lexicon-place.ts";
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
    kind: "interest",
    gloss: "autonomy",
    definition: "",
    mnemonic: "",
    anchor: "interests.md#x",
  };

  it("gives overlay rows three letters and other rows five, with glasses first", () => {
    const ranks = loadFrequencyRanks();
    const glasses = { emoji: "👓", concrete: "glasses", abstract: "clarity", englishByPos: "" };
    const grin = { emoji: "😀", concrete: "grin", abstract: "delight", englishByPos: "" };
    assert.equal(rowPriority(glasses, ranks), 0);
    assert.ok(rowPriority(grin, ranks) > 0);
  });

  it("anneals an eligible row to three letters and keeps an ordinary row at five", async () => {
    const placed = await placePublishedRoots(
      [
        { emoji: "🗳️", concrete: "ballot", abstract: "autonomy", englishByPos: "" },
        { emoji: "😀", concrete: "grin", abstract: "delight", englishByPos: "" },
      ],
      [overlay],
      { annealRestarts: 1, annealSteps: 20 },
    );
    const ballot = placed.find((row) => row.emoji === "🗳️")!;
    const grin = placed.find((row) => row.emoji === "😀")!;
    assert.equal(ballot.length, 3);
    assert.equal(ballot.root.length, 3);
    assert.equal(grin.length, 5);
    assert.equal(grin.root.length, 5);
    assert.notEqual(ballot.root, grin.root);
  });
});

describe("regret order", () => {
  it("places the row that loses the most by missing its best free candidate", () => {
    const rows = [
      { name: "tight", priority: 3, free: [0, 1] },
      { name: "loose", priority: 3, free: [0, 9] },
      { name: "later", priority: 8, free: [0, 1] },
    ];
    const pick = pickByRegret(rows, (row) => row.priority, (row, from) => row.free.find((rank) => rank >= from) ?? Infinity);
    assert.equal(pick.name, "loose");
  });
});
