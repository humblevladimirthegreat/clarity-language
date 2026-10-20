import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { emptyPosEnglish, parseOverlayCsv, parsePublishedCsv, type PublishedRow } from "./lexicon-search.ts";
import { readData } from "./repo-paths.ts";
import { decode, encode, firstConsonant, placeTailRoots } from "./root-tails-place.ts";
import { evenSpreadPairs, holderClash, holderHostForms, hookClash, tailMetrics, tailOf, validateRootTails } from "./root-tails.ts";

const published = (emoji: string, concrete: string, root: string, kind = "", shape = ""): PublishedRow =>
  ({ emoji, concrete, root, kind, shape, abstract: "", mnemonic: "", englishByPos: "", posEnglish: emptyPosEnglish() });

describe("lexicon-published.csv tails", () => {
  it("gives every five-letter row a kind, a shape and a root in its tail, clear of the hook and holder checks", () => {
    const errors = validateRootTails(
      parsePublishedCsv(readData("lexicon-published.csv")),
      holderHostForms(parseOverlayCsv(readData("lexicon-overlays.csv"))),
    );
    assert.deepEqual(errors.map((e) => `${e.key}: ${e.reason}`), []);
  });
});

describe("tails", () => {
  it("spells a tail from kind and shape", () => {
    assert.equal(tailOf("creature", "order"), "ze");
    assert.equal(tailOf("tool", "takes-away"), "wu");
  });

  it("flags an l / m second consonant behind a three-letter onset", () => {
    const short = new Set(["aba"]);
    assert.ok(hookClash("abala", short));
    assert.ok(hookClash("abamo", short));
    assert.ok(!hookClash("abana", short));
    assert.ok(!hookClash("ebala", short));
  });

  it("flags a root that starts with a /th/ holder host form", () => {
    const hosts = holderHostForms(parseOverlayCsv(readData("lexicon-overlays.csv")));
    const host = [...hosts][0]!;
    assert.match(host, /^[aeou][bdghylmnrvwz][aeou][lmr]$/);
    assert.ok(holderClash(`${host}u`, hosts));
    assert.ok(!holderClash(`${host.slice(0, 3)}vu`, hosts));
  });

  it("maps a label's first English consonant to its Egabon letter", () => {
    assert.equal(firstConsonant("G L AE1 S AH0 Z"), "g");
    assert.equal(firstConsonant("EH1 R | K IH1 S"), "r");
    assert.equal(firstConsonant("AY1"), null);
    assert.equal(firstConsonant(""), null);
  });

  it("round-trips root codes", () => {
    for (const root of ["ababa", "uzuzu", "ehola"]) assert.equal(decode(encode(root)), root);
  });
});

describe("validateRootTails", () => {
  const good = [
    published("🐈", "cat", "ubezo", "creature", "one"),
    published("🗡️", "knife", "uhowu", "tool", "takes-away"),
    published("🇫🇷", "france-flag", "avranza", "named"),
    published("⭐", "star", "aba"),
  ];
  const reasons = (rows: PublishedRow[]) => validateRootTails(rows).map((e) => e.reason);

  it("accepts rows in their tails", () => {
    assert.deepEqual(reasons(good), []);
  });

  it("rejects a bad kind, a missing shape, a shape on a named row, and a tail on a three-letter row", () => {
    assert.ok(reasons([{ ...good[0]!, kind: "animal" }]).some((r) => r.startsWith("kind must be")));
    assert.ok(reasons([{ ...good[0]!, shape: "" }]).some((r) => r.startsWith("shape must be")));
    assert.ok(reasons([{ ...good[2]!, shape: "one" }]).some((r) => r.startsWith("a named row has no shape")));
    assert.ok(reasons([{ ...good[3]!, kind: "sign" }]).some((r) => r.includes("3-letter root has no kind")));
  });

  it("rejects a named row without a place-name root, and two places on one root", () => {
    assert.ok(reasons([{ ...good[2]!, root: "agane" }]).some((r) => r.includes("is not a place-name root")));
    assert.ok(reasons([good[2]!, published("🇫🇮", "finland-flag", "avranza", "named")]).some((r) => r.includes("is also 🇫🇷's")));
  });

  it("rejects a root outside its tail and a hook clash", () => {
    assert.ok(reasons([{ ...good[0]!, root: "ubeza" }]).some((r) => r.includes("does not end in its tail zo")));
    assert.ok(reasons([published("🌳", "tree", "abale", "nature", "order"), good[3]!]).some((r) => r.includes("reads as aba + join + hook")));
  });
});

describe("tailMetrics", () => {
  it("counts same-kind pairs that share their first two letters, and nothing else", () => {
    const m = tailMetrics([
      { root: "abazo", kind: "creature" },
      { root: "abezo", kind: "creature" },
      { root: "abuze", kind: "creature" },
      { root: "ebazo", kind: "creature" },
      { root: "adazo", kind: "creature" },
      { root: "abawo", kind: "tool" },
    ]);
    assert.equal(m.confusing, 3);
    assert.equal(m.flag, 0);
    assert.equal(m.nonFlag, 3);
    assert.equal(m.mixed, 0);
    assert.deepEqual(m.byKind.get("creature"), { rows: 5, pairs: 3, possible: 10 });
    assert.deepEqual(m.byKind.get("tool"), { rows: 1, pairs: 0, possible: 0 });
  });

  it("separates flag pairs from other same-kind pairs", () => {
    const m = tailMetrics([
      { root: "abane", kind: "named", concrete: "japan-flag" },
      { root: "abano", kind: "named", concrete: "france-flag" },
      { root: "abanu", kind: "named", concrete: "crest" },
      { root: "ebane", kind: "named", concrete: "spain-flag" },
      { root: "abage", kind: "sign", concrete: "aries" },
      { root: "abege", kind: "sign", concrete: "taurus" },
    ]);
    assert.equal(m.flag, 1);
    assert.equal(m.nonFlag, 1);
    assert.equal(m.mixed, 2);
    assert.equal(m.confusing, 4);
    assert.equal(m.flagRows, 3);
    assert.equal(m.nonFlagRows, 3);
    assert.equal(m.flagPossible, 3);
    assert.equal(m.nonFlagPossible, 1);
    assert.equal(m.mixedPossible, 3);
  });

  it("floors a kind's pairs at an even spread over the 48 prefixes", () => {
    assert.equal(evenSpreadPairs(48), 0);
    assert.equal(evenSpreadPairs(50), 2);
    assert.equal(evenSpreadPairs(100), 4 * 3 + 44 * 1);
  });
});

describe("placeTailRoots", () => {
  it("places every row in its tail, apart, and clear of the hook check", () => {
    const rows = [
      ...Array.from({ length: 30 }, (_, i) => ({ kind: "nature" as const, shape: "one" as const, cmu: "" })),
      ...Array.from({ length: 10 }, () => ({ kind: "sign" as const, shape: "order" as const, cmu: "" })),
    ];
    const shortRoots = new Set(["aba", "aga", "ozo"]);
    const { roots, unmet } = placeTailRoots({ rows, shortRoots, compounds: [], steps: 20_000 });
    assert.deepEqual(unmet, []);
    assert.equal(new Set(roots).size, roots.length);
    roots.slice(0, 30).forEach((root) => {
      assert.match(root, /^[aeou][bdghylmnrvwz][aeou]lo$/);
      assert.ok(!shortRoots.has(root.slice(0, 3)), root);
    });
    roots.slice(30).forEach((root) => assert.match(root, /^[aeou][bdghylmnrvwz][aeou]ge$/));
    // 30 rows of one kind fit in its 48 first-two-letter prefixes, so none share them.
    assert.equal(new Set(roots.slice(0, 30).map((root) => root.slice(0, 2))).size, 30);
  });

  it("keeps every root clear of the holder check", () => {
    // Every counting (`r`) onset's first three letters spell a host + `r`: the placer must skip each one.
    const holderHosts = new Set(["abar", "ebor", "uzur"]);
    const rows = Array.from({ length: 40 }, () => ({ kind: "counting" as const, shape: "one" as const, cmu: "" }));
    const { roots, unmet } = placeTailRoots({ rows, shortRoots: new Set(), holderHosts, compounds: [], steps: 5_000 });
    assert.deepEqual(unmet, []);
    for (const root of roots) assert.ok(!holderHosts.has(root.slice(0, 4)), root);
  });

  it("never leaves a listed compound with a second split", () => {
    // Every VCV is a three-letter root, so the counting row's stem `VCVro r aba` reads two ways
    // whenever a body / holds row takes `o r aba`; the placer must skip that root.
    const shortRoots = new Set<string>();
    for (const a of "aeou") for (const c of "bdghylmnrvwz") for (const b of "aeou") shortRoots.add(a + c + b);
    const rows = [
      { kind: "counting" as const, shape: "one" as const, cmu: "" },
      ...Array.from({ length: 48 }, () => ({ kind: "body" as const, shape: "holds" as const, cmu: "" })),
    ];
    const { roots, unmet } = placeTailRoots({ rows, shortRoots, compounds: [{ left: 0, join: "r", right: "aba" }], steps: 20_000 });
    assert.deepEqual(unmet, []);
    assert.ok(!roots.includes(`${roots[0]!.slice(4)}raba`), roots[0]!);
  });
});
