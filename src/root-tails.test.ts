import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { parseCompoundCsv, type CompoundRow } from "./lexicon-compounds.ts";
import { emptyPosEnglish, parsePublishedCsv, type PublishedRow } from "./lexicon-search.ts";
import { readData } from "./repo-paths.ts";
import { decode, encode, firstConsonant, placeTailRoots } from "./root-tails-place.ts";
import { hookClash, parseTailsCsv, tailMetrics, tailOf, validateTails, type TailRow } from "./root-tails.ts";

const published = (emoji: string, concrete: string, root: string): PublishedRow =>
  ({ emoji, concrete, root, abstract: "", mnemonic: "", englishByPos: "", posEnglish: emptyPosEnglish() });
const compound = (left: string, join: CompoundRow["join"], right: string): CompoundRow =>
  ({ stem: left + join + right, left, join, right, concrete: "x", abstract: "", mnemonic: "x" });

describe("lexicon-tails.csv", () => {
  it("covers every published five-letter row and passes every tail check", () => {
    const errors = validateTails(
      parseTailsCsv(readData("lexicon-tails.csv")),
      parsePublishedCsv(readData("lexicon-published.csv")),
      parseCompoundCsv(readData("lexicon-compounds.csv")),
    );
    assert.deepEqual(errors.map((e) => `${e.key}: ${e.reason}`), []);
  });
});

describe("tails", () => {
  it("spells a tail from kind and shape, and leaves a named row's vowel free", () => {
    assert.equal(tailOf("creature", "line"), "ze");
    assert.equal(tailOf("tool", "takes-away"), "wu");
    assert.equal(tailOf("named", ""), "n");
  });

  it("flags an l / m second consonant behind a three-letter onset", () => {
    const short = new Set(["aba"]);
    assert.ok(hookClash("abala", short));
    assert.ok(hookClash("abamo", short));
    assert.ok(!hookClash("abana", short));
    assert.ok(!hookClash("ebala", short));
  });

  it("maps a label's first English consonant to its Agazan letter", () => {
    assert.equal(firstConsonant("G L AE1 S AH0 Z"), "g");
    assert.equal(firstConsonant("EH1 R | K IH1 S"), "r");
    assert.equal(firstConsonant("AY1"), null);
    assert.equal(firstConsonant(""), null);
  });

  it("round-trips root codes", () => {
    for (const root of ["ababa", "uzuzu", "ehola"]) assert.equal(decode(encode(root)), root);
  });
});

describe("validateTails", () => {
  const rows = [published("🐈", "cat", "ozoma"), published("🗡️", "knife", "egeza"), published("🇫🇷", "france", "afaro"), published("⭐", "star", "aba")];
  const tail = (emoji: string, concrete: string, kind: string, shape: string, root: string): TailRow => ({ emoji, concrete, kind, shape, root });
  const good = [
    tail("🐈", "cat", "creature", "one", "ubezo"),
    tail("🗡️", "knife", "tool", "takes-away", "uhowu"),
    tail("🇫🇷", "france", "named", "", "agane"),
  ];
  const reasons = (tails: TailRow[], compounds: CompoundRow[] = []) => validateTails(tails, rows, compounds).map((e) => e.reason);

  it("accepts rows in their tails", () => {
    assert.deepEqual(reasons(good), []);
  });

  it("allows an unplaced row", () => {
    assert.deepEqual(reasons([good[0]!, good[1]!, { ...good[2]!, root: "" }]), []);
  });

  it("rejects a missing or extra row", () => {
    assert.ok(reasons(good.slice(1)).some((r) => r.includes("missing from lexicon-tails.csv")));
    assert.ok(reasons([...good, tail("🐕", "dog", "creature", "one", "ugezo")]).some((r) => r.includes("no published five-letter row")));
  });

  it("rejects a bad kind, a missing shape, and a shape on a named row", () => {
    assert.ok(reasons([{ ...good[0]!, kind: "animal" }, good[1]!, good[2]!]).some((r) => r.startsWith("kind must be")));
    assert.ok(reasons([{ ...good[0]!, shape: "" }, good[1]!, good[2]!]).some((r) => r.startsWith("shape must be")));
    assert.ok(reasons([good[0]!, good[1]!, { ...good[2]!, shape: "one" }]).some((r) => r.startsWith("a named row has no shape")));
  });

  it("rejects a root outside its tail, a repeated root, and a hook clash", () => {
    assert.ok(reasons([{ ...good[0]!, root: "ubeza" }, good[1]!, good[2]!]).some((r) => r.includes("does not end in its tail zo")));
    assert.ok(reasons([good[0]!, good[1]!, { ...good[2]!, root: "ubezo" }]).some((r) => r.includes("is also")));
    const nature = [published("🌳", "tree", "ehule")];
    const errors = validateTails([tail("🌳", "tree", "nature", "line", "abale")], [...nature, rows[3]!], []);
    assert.ok(errors.some((e) => e.reason.includes("reads as aba + join + hook")));
  });

  it("rejects a listed compound that the new roots split two ways", () => {
    // france + r + star, spelled uhona + r + aba, also reads uho + n + araba once bag is araba.
    const lexicon = [...rows, published("👜", "bag", "egeba"), published("🌙", "moon", "uho")];
    const tails = [...good.slice(0, 2), { ...good[2]!, root: "uhona" }, tail("👜", "bag", "body", "holds", "eraba")];
    const listed = [compound("afaro", "r", "aba")];
    assert.deepEqual(validateTails(tails, lexicon, listed).map((e) => e.reason), []);
    const clash = validateTails([...tails.slice(0, 3), { ...tails[3]!, root: "araba" }], lexicon, listed);
    assert.deepEqual(clash.map((e) => e.reason), ["compound spelled uhonaraba with the new roots splits two ways (uho+n+araba, uhona+r+aba)"]);
  });
});

describe("tailMetrics", () => {
  it("counts neighbors, core pairs and the position that differs", () => {
    const m = tailMetrics(["abazo", "agazo", "abezo", "uzuzu"], new Set(["abazo", "agazo"]));
    assert.equal(m.withNeighbor, 3);
    assert.equal(m.corePairs, 1);
    assert.deepEqual(m.pairsAt, [0, 1, 1, 0, 0]);
  });
});

describe("placeTailRoots", () => {
  it("places every row in its tail, apart, and clear of the hook check", () => {
    const rows = [
      ...Array.from({ length: 30 }, (_, i) => ({ kind: "nature" as const, shape: "one" as const, cmu: "", coreRank: i < 10 ? i : null })),
      ...Array.from({ length: 10 }, () => ({ kind: "named" as const, shape: "" as const, cmu: "", coreRank: null })),
    ];
    const shortRoots = new Set(["aba", "aga", "ozo"]);
    const { roots, unmet } = placeTailRoots({ rows, shortRoots, compounds: [], steps: 20_000 });
    assert.deepEqual(unmet, []);
    assert.equal(new Set(roots).size, roots.length);
    roots.slice(0, 30).forEach((root) => {
      assert.match(root, /^[aeou][bdghylmnrvwz][aeou]lo$/);
      assert.ok(!shortRoots.has(root.slice(0, 3)), root);
    });
    roots.slice(30).forEach((root) => assert.match(root, /^[aeou][bdghylmnrvwz][aeou]n[aeou]$/));
    const cell = roots.slice(0, 30);
    for (const a of cell) for (const b of cell) {
      const diff = [...a].flatMap((letter, i) => (letter === b[i] ? [] : [i]));
      if (diff.length === 1) assert.equal(diff[0], 1, `${a} ~ ${b}`);
    }
  });

  it("never leaves a listed compound with a second split", () => {
    // Every VCV is a three-letter root, so the named row's stem `VCVnV r aba` reads two ways
    // whenever a body / holds row takes `V r aba`; the placer must skip that root.
    const shortRoots = new Set<string>();
    for (const a of "aeou") for (const c of "bdghylmnrvwz") for (const b of "aeou") shortRoots.add(a + c + b);
    const rows = [
      { kind: "named" as const, shape: "" as const, cmu: "", coreRank: 0 },
      ...Array.from({ length: 48 }, () => ({ kind: "body" as const, shape: "holds" as const, cmu: "", coreRank: null })),
    ];
    const { roots, unmet } = placeTailRoots({ rows, shortRoots, compounds: [{ left: 0, join: "r", right: "aba" }], steps: 20_000 });
    assert.deepEqual(unmet, []);
    assert.ok(!roots.includes(`${roots[0]!.slice(4)}raba`), roots[0]!);
  });
});
