import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import { CLOSED } from "./closed-roots.js";
import {
  CORE_CAP,
  CORE_REVIEW_MIN,
  coreReport,
  findCheckpoint,
  firstAppearance,
  lintCoreCounts,
  spacingPlan,
  stageCheckpoints,
  type BankEntry,
  type BankGroup,
  type Checkpoint,
} from "./core-vocabulary.js";
import { parseCompoundCsv } from "./lexicon-compounds.js";
import { parsePublishedCsv } from "./lexicon-search.js";
import { pageSections } from "./lint/learning-order.js";
import { PRACTICE_TITLE_RE } from "./lint/practice-sections.js";
import { loadDefaultTables } from "./parse/index.js";
import { readData, REPO_ROOT } from "./repo-paths.js";

const tables = loadDefaultTables();
const [dog, book, walk] = ["dog", "book", "walk"].map((sense) => {
  const row = [...tables.published.values()].find((r) => r.concrete === sense);
  assert.ok(row, `published row for *${sense}*`);
  return row.root;
}) as [string, string, string];

const page = (beginner: string, intermediate: string) => `# Page

## Beginner

### Translation practice {#beginner-translation-practice}

**Roots used here:**

| English | Agazan |
|---------|--------|
${beginner}

#### English → Agazan

## Intermediate

### Translation practice {#intermediate-translation-practice}

**Roots used here:**

| English | Agazan |
|---------|--------|
${intermediate}

#### English → Agazan
`;

describe("stageCheckpoints", () => {
  const pages: Record<string, string> = {
    "a.md": page(`| *Azawan* | \`${CLOSED.swan}n\` |\n| *dog* | \`${dog}l\` |`, `| *book* | \`${book}l\` |`),
    "b.md": page(`| *dog* | \`${dog}l\` |\n| *walk* | \`v${CLOSED.walk}l\` |`, `| *dog* | \`${dog}l\` |`),
  };
  const checkpoints = stageCheckpoints(["a.md", "b.md"], (p) => pages[p], tables);

  it("orders every Beginner checkpoint before any Intermediate one", () => {
    assert.deepEqual(
      checkpoints.map((c) => c.anchor),
      [
        "a.md#beginner-translation-practice",
        "b.md#beginner-translation-practice",
        "a.md#intermediate-translation-practice",
        "b.md#intermediate-translation-practice",
      ],
    );
  });

  it("leaves house names out", () => {
    assert.deepEqual(checkpoints[0]!.entries.map((e) => e.root), [dog]);
  });

  it("assigns each root its first checkpoint", () => {
    const core = firstAppearance(checkpoints);
    assert.equal(core.get(dog), "a.md#beginner-translation-practice");
    assert.equal(core.get(walk), "b.md#beginner-translation-practice");
    assert.equal(core.get(book), "a.md#intermediate-translation-practice");
  });
});

function entry(root: string, group: BankGroup, line = 1): BankEntry {
  return { root, english: root, agazan: root, group, line };
}

function cp(anchor: string, converted: boolean, entries: BankEntry[], cast: BankEntry[] = [], review = false): Checkpoint {
  const page = anchor.split("#")[0]!;
  return { anchor, page, band: "beginner", line: 1, converted, review, entries, cast };
}

describe("stageCheckpoints, converted", () => {
  const md = `# Page

## Beginner

### Practice {#beginner-practice}

**New words:**

| English | Agazan | Cue |
|---------|--------|-----|
| *Azawan* | \`${CLOSED.swan}n\` | 🦢 |
| *dog* | \`${dog}l\` | 🐕 |

**Review:**

| English | Agazan |
|---------|--------|
| *book* | \`${book}l\` |

#### English → Agazan
`;
  const [checkpoint] = stageCheckpoints(["a.md"], () => md, tables);

  it("reads New words and Review, with groups and lines", () => {
    assert.equal(checkpoint!.anchor, "a.md#beginner-practice");
    assert.equal(checkpoint!.converted, true);
    assert.deepEqual(checkpoint!.entries.map((e) => [e.root, e.group, e.line]), [[dog, "new", 12], [book, "review", 18]]);
    assert.deepEqual(checkpoint!.cast.map((e) => [e.root, e.group]), [[CLOSED.swan, "new"]]);
  });
});

describe("lintCoreCounts", () => {
  const details = (checkpoints: Checkpoint[], core: Record<string, string>) =>
    lintCoreCounts(checkpoints, new Map(Object.entries(core))).map((f) => `${f.page} ${f.detail}`);
  // Three legacy checkpoints introduce r1..r3, so a later converted one owes CORE_REVIEW_MIN review roots.
  const legacy = [cp("a.md#x", false, [entry("r1", "roots")]), cp("b.md#x", false, [entry("r2", "roots")]), cp("c.md#x", false, [entry("r3", "roots")])];
  const earlier = { r1: "a.md#x", r2: "b.md#x", r3: "c.md#x" };
  const review = ["r1", "r2", "r3"].map((r) => entry(r, "review"));

  it("passes new roots introduced here and review roots introduced earlier", () => {
    assert.equal(CORE_REVIEW_MIN, 3);
    assert.deepEqual(details([...legacy, cp("d.md#p", true, [entry("n1", "new"), ...review])], { ...earlier, n1: "d.md#p" }), []);
  });

  it("does not check legacy checkpoints", () => {
    const over = Array.from({ length: CORE_CAP + 1 }, (_, i) => entry(`n${i}`, "roots"));
    assert.deepEqual(details([cp("a.md#x", false, over)], {}), []);
  });

  it("caps new roots", () => {
    const fresh = Array.from({ length: CORE_CAP + 1 }, (_, i) => entry(`n${i}`, "new"));
    const core = Object.fromEntries(fresh.map((e) => [e.root, "a.md#p"]));
    assert.deepEqual(details([cp("a.md#p", true, fresh)], core), [`a.md ${CORE_CAP + 1} new core roots; at most ${CORE_CAP}`]);
  });

  it("needs review roots once enough come before, and none on the first checkpoint", () => {
    assert.deepEqual(details([cp("a.md#p", true, [entry("n1", "new")])], { n1: "a.md#p" }), []);
    assert.deepEqual(details([...legacy, cp("d.md#p", true, review.slice(0, 2))], earlier), ["d.md 2 review root(s); use at least 3 from earlier checkpoints"]);
    assert.deepEqual(details([legacy[0]!, cp("d.md#p", true, [review[0]!])], { r1: "a.md#x" }), []);
  });

  it("places each root by its core cell", () => {
    const converted = cp("d.md#p", true, [entry("n1", "new"), entry("n2", "new"), entry("r1", "new"), ...review.slice(1), entry("n3", "review"), entry("n4", "review")]);
    const core = { ...earlier, n2: "e.md#p", n4: "d.md#p" };
    assert.deepEqual(details([...legacy, converted, cp("e.md#p", false, [])], core), [
      "d.md *n1* `n1` is not core: set its core cell to d.md#p",
      "d.md *n2* `n2` is pulled forward: move its core cell from e.md#p to d.md#p",
      "d.md *r1* `r1` was introduced at a.md#x: move it to **Review**",
      "d.md *n3* `n3` is not core: move it to **New words** and set its core cell to d.md#p",
      "d.md *n4* `n4` is introduced at d.md#p, not before this checkpoint: move it to **New words** and its core cell to d.md#p",
      "d.md core cell of n4 names this checkpoint, but **New words** does not list it: move the cell to the next checkpoint that uses it, or clear it",
    ]);
  });

  it("puts a house name under New words only where it is first met", () => {
    const swan = (group: BankGroup) => entry(CLOSED.swan, group);
    const word = `*${CLOSED.swan}* \`${CLOSED.swan}\``;
    assert.deepEqual(details([cp("a.md#p", true, [], [swan("new")]), cp("b.md#p", true, [], [swan("review")])], {}), []);
    assert.deepEqual(details([cp("a.md#x", false, [], [swan("roots")]), cp("b.md#p", true, [], [swan("new")])], {}), [
      `b.md ${word} was met at an earlier checkpoint: move it to **Review**`,
    ]);
    assert.deepEqual(details([cp("a.md#p", true, [], [swan("review")])], {}), [`a.md ${word} is first met here: move it to **New words**`]);
  });

  it("lets a level review introduce nothing", () => {
    const swan = entry(CLOSED.swan, "new");
    const level = cp("review.md#beginner-practice", true, [entry("n1", "new"), ...review], [swan], true);
    const before = cp("d.md#p", true, [entry("n1", "new"), ...review], [entry(CLOSED.swan, "new")]);
    assert.deepEqual(details([...legacy, before, level], { ...earlier, n1: "d.md#p" }), [
      "review.md *n1* `n1`: a level review introduces no words; list it under **Review**",
      `review.md *${CLOSED.swan}* \`${CLOSED.swan}\`: a level review introduces no words; list it under **Review**`,
    ]);
    assert.deepEqual(details([...legacy, cp("review.md#beginner-practice", true, review, [], true)], earlier), []);
  });
});

describe("coreReport", () => {
  it("splits new from review and flags a checkpoint over the cap", () => {
    const roots = Array.from({ length: CORE_CAP + 1 }, (_, i) => `r${i}`);
    const checkpoints = [cp("a.md#x", false, roots.map((root) => entry(root, "roots"))), cp("b.md#x", false, [entry("r0", "roots")])];
    const [first, second] = coreReport(checkpoints, firstAppearance(checkpoints));
    assert.equal(first!.fresh.length, CORE_CAP + 1);
    assert.equal(first!.overCap, true);
    assert.deepEqual(second!.review.map((e) => e.root), ["r0"]);
    assert.equal(second!.overCap, false);
  });
});

describe("spacingPlan", () => {
  // r1, r2 introduced at a; r2 reused at b; this is c; n1 is c's, n2 and n3 later.
  const checkpoints = [
    cp("a.md#x", false, [entry("r1", "roots"), entry("r2", "roots")]),
    cp("b.md#x", false, [entry("r2", "roots"), entry("r3", "roots")]),
    cp("c.md#p", true, [entry("n1", "new"), entry("r2", "review")]),
    cp("d.md#x", false, [entry("n3", "roots")]),
    cp("e.md#x", false, [entry("n2", "roots"), entry("r1", "roots")]),
  ];
  const core = new Map(Object.entries({ r1: "a.md#x", r2: "a.md#x", r3: "b.md#x", n4: "c.md#p", n1: "c.md#p", n2: "e.md#x", n3: "d.md#x" }));
  const plan = spacingPlan(checkpoints, core, 2, (root) => `gloss ${root}`);

  it("introduces this checkpoint's core roots, bank order first", () => {
    assert.deepEqual(plan.introduce.map((w) => [w.root, w.english, w.agazan]), [["n1", "n1", "n1"], ["n4", "gloss n4", "n4"]]);
  });

  it("offers later core roots in path order", () => {
    assert.deepEqual(plan.pullForward.map((w) => [w.root, w.core]), [["n3", "d.md#x"], ["n2", "e.md#x"]]);
  });

  it("ranks earlier roots by the stretch since their last use, ignoring this checkpoint and later ones", () => {
    assert.deepEqual(plan.review.map((w) => [w.root, w.gap, w.lastUsed]), [["r1", 2, "a.md#x"], ["r2", 1, "b.md#x"], ["r3", 1, "b.md#x"]]);
  });

  it("finds a checkpoint by anchor or by page and band", () => {
    assert.equal(findCheckpoint(checkpoints, "c.md#p"), 2);
    assert.equal(findCheckpoint(checkpoints, "b.md:Beginner"), 1);
    assert.throws(() => findCheckpoint(checkpoints, "z.md:beginner"), /No stage checkpoint z\.md:beginner/);
  });
});

describe("core column", () => {
  it("names an existing stage checkpoint in every non-empty cell", () => {
    const cells = [
      ...parsePublishedCsv(readData("lexicon-published.csv")).map((r) => ({ key: r.root, core: r.core })),
      ...parseCompoundCsv(readData("lexicon-compounds.csv")).map((r) => ({ key: r.stem, core: r.core })),
    ].filter((c) => c.core);
    const bad: string[] = [];
    for (const { key, core } of cells) {
      const [file, id] = core!.split("#") as [string, string | undefined];
      let markdown: string;
      try {
        markdown = readFileSync(join(REPO_ROOT, "docs", "grammar", file), "utf8");
      } catch {
        bad.push(`${key}: ${core} (no page)`);
        continue;
      }
      const section = id ? pageSections(file, markdown).anchors.get(id) : undefined;
      if (!section?.band || !PRACTICE_TITLE_RE.test(section.title)) bad.push(`${key}: ${core}`);
    }
    assert.deepEqual(bad, []);
  });
});
