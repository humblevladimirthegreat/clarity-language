import assert from "node:assert/strict";
import { describe, it } from "node:test";

import type { CompoundRow } from "./lexicon-compounds.ts";
import { annealShortRoots, englishRank, loadFrequencyRanks, placePublishedRoots, rowPriority, shortRootGuards } from "./lexicon-place.ts";
import type { OverlayRow } from "./lexicon-search.ts";
import { shortRootCandidates } from "./word-converter.ts";

const V = "aeou";
const C = "bdghylmnrvwz";

/** Every VCV but `keep`. */
function shortBut(...keep: string[]): string[] {
  const out: string[] = [];
  for (const a of V) for (const c of C) for (const b of V) if (!keep.includes(a + c + b)) out.push(a + c + b);
  return out;
}

/** Every five-letter root with this tail but `keep`. */
function tailBut(tail: string, ...keep: string[]): string[] {
  const out: string[] = [];
  for (const a of V) for (const c of C) for (const b of V) if (!keep.includes(a + c + b + tail)) out.push(a + c + b + tail);
  return out;
}

function compound(left: string, join: CompoundRow["join"], right: string): CompoundRow {
  return { stem: left + join + right, left, join, right, concrete: "", abstract: "", mnemonic: "", core: "" };
}

/** A short row as the anneal takes it. */
function shortItem(emoji: string, root: string, cmu: string, index: number) {
  return { row: { emoji, concrete: emoji, abstract: "", englishByPos: "", root }, index, groups: new Set<string>(), eligible: true, priority: index, cmu };
}

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
        { emoji: "🗳️", concrete: "ballot", abstract: "autonomy", englishByPos: "", kind: "title", shape: "holds" },
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
    assert.match(placed[0]!.root, /^[aeou][bdghylmnrvwz][aeou]me$/);
    assert.notEqual(placed[0]!.root.slice(0, 2), "eg");
  });

  it("refuses a five-letter row with no kind", async () => {
    await assert.rejects(
      placePublishedRoots([{ emoji: "😀", concrete: "grin", abstract: "delight", englishByPos: "" }], [], { tailSteps: 0 }),
      /need a kind, a shape/,
    );
  });

  it("keeps a new root from sharing its first two letters with a kept root in the same overlay group", async () => {
    const compass: OverlayRow = { ...overlay, senseForm: "alodam", emoji: "🧭", gloss: "purpose" };
    const placed = await placePublishedRoots(
      [{ emoji: "🧭", concrete: "compass", abstract: "direction", englishByPos: "", kind: "body", shape: "one" }],
      [overlay, compass],
      { blocked: ["aba"], kept: [{ emoji: "🗳️", root: "aba" }], annealRestarts: 1, annealSteps: 20_000 },
    );
    const root = placed[0]!.root;
    assert.notEqual(root.slice(0, 2), "ab", root);
    assert.match(root, /^[aeou]be$/);
  });

  it("never spells a root with an English word the doc lint reads as English", async () => {
    await assert.rejects(
      placePublishedRoots(
        [{ emoji: "🗳️", concrete: "ballot", abstract: "autonomy", englishByPos: "", kind: "counting", shape: "one" }],
        [overlay],
        {
          blocked: shortBut("are"),
          annealRestarts: 1,
          annealSteps: 20,
        },
      ),
      /no free form of the tail/,
    );
    assert.ok(!shortRootCandidates("AA1 R").includes("are"));
  });

  it("lets a short root start a kept l / m-second root", async () => {
    // Only a five-letter root fuses with a hook, so `abu` beside `abula` makes no hook compound.
    const placed = await placePublishedRoots(
      [{ emoji: "🗳️", concrete: "ballot", abstract: "autonomy", englishByPos: "", kind: "body", shape: "takes-away" }],
      [overlay],
      {
        blocked: shortBut("abu"),
        kept: [{ emoji: "🌹", root: "abula" }],
        annealRestarts: 1,
        annealSteps: 200,
      },
    );
    assert.equal(placed[0]!.root, "abu");
  });

  it("checks five-letter rows against a moved short root's new holder host", async () => {
    const fishing: OverlayRow = { ...overlay, senseForm: "evor", emoji: "🎣", kind: "evidential", gloss: "recalled" };
    const placed = await placePublishedRoots(
      [
        { emoji: "🎣", concrete: "fishing", abstract: "memory", englishByPos: "", root: "evo", kind: "doing", shape: "takes-away" },
        { emoji: "🎻", concrete: "violin", abstract: "harmony", englishByPos: "", kind: "counting", shape: "order", size: "none" },
      ],
      [fishing],
      { blocked: [...shortBut("uvu"), ...tailBut("ro", "uvuro", "ezoro")], annealRestarts: 1, annealSteps: 20, tailSteps: 100 },
    );
    assert.equal(placed.find((row) => row.emoji === "🎣")!.root, "uvu");
    // `uvuro` starts with the new host `uvur`.
    assert.equal(placed.find((row) => row.emoji === "🎻")!.root, "ezoro");
  });

  it("checks listed compounds through a moved short member's new spelling", async () => {
    const placed = await placePublishedRoots(
      [
        { emoji: "🎣", concrete: "fishing", abstract: "memory", englishByPos: "", root: "evo", kind: "doing", shape: "takes-away" },
        { emoji: "🔢", concrete: "number", abstract: "count", englishByPos: "", root: "anoro", kind: "counting", shape: "order", size: "medium" },
      ],
      [],
      {
        blocked: [...shortBut("uvu"), ...tailBut("ro", "anoro", "ezoro")],
        kept: [{ emoji: "🛶", root: "uvura" }, { emoji: "⛏️", root: "oro" }],
        compounds: [compound("evo", "r", "anoro")],
        annealRestarts: 1,
        annealSteps: 20,
        tailSteps: 100,
      },
    );
    assert.equal(placed.find((row) => row.emoji === "🎣")!.root, "uvu");
    // `uvuranoro` would also read `uvura` + n + `oro`.
    assert.equal(placed.find((row) => row.emoji === "🔢")!.root, "ezoro");
  });

  it("keeps two short rows from giving a listed compound a second split", () => {
    const items = [shortItem("🎧", "eho", "AA1 W AA0", 0), shortItem("💡", "ado", "EH1 W OW0", 1)];
    const blocked = new Set(shortBut("awa", "ewo", "ogo"));
    const anneal = (guards?: ReturnType<typeof shortRootGuards>) => {
      const placed = annealShortRoots(items, blocked, { restarts: 1, steps: 2_000, guards });
      return items.map((item) => placed.get(item));
    };
    // By echo alone, `awa` + `ewo` make `awalarewo` read `awala` + r + `ewo` too.
    assert.deepEqual(anneal(), ["awa", "ewo"]);
    const guards = shortRootGuards(items, blocked, {
      staticRoots: new Set(["arewo", "awala"]),
      keptLong: ["arewo", "awala"],
      overlays: [],
      compounds: [compound("eho", "l", "arewo")],
    });
    assert.ok(guards.conflicts.some((c) => c.form === "awa" && c.other === "ewo"), JSON.stringify(guards.conflicts));
    assert.notDeepEqual(anneal(guards), ["awa", "ewo"]);
  });

  it("refuses a kind + shape with more short rows than free forms of its tail", async () => {
    const rows = ["📕", "📗", "📘", "📙", "📓"].map((emoji) => ({
      emoji,
      concrete: "book",
      abstract: "",
      englishByPos: "",
      kind: "sign",
      shape: "holds",
    }));
    const overlays = rows.map((row) => ({ ...overlay, emoji: row.emoji, senseForm: `${row.emoji}m` }));
    await assert.rejects(placePublishedRoots(rows, overlays, { annealRestarts: 1, annealSteps: 20 }), /sign \/ holds has 5 rows and 4 free forms/);
  });
});
