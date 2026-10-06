import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import { CLOSED } from "./closed-roots.js";
import { CORE_CAP, coreReport, firstAppearance, stageCheckpoints, type Checkpoint } from "./core-vocabulary.js";
import { parseCompoundCsv } from "./lexicon-compounds.js";
import { parsePublishedCsv } from "./lexicon-search.js";
import { pageSections } from "./lint/learning-order.js";
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

describe("coreReport", () => {
  it("splits new from review and flags a checkpoint over the cap", () => {
    const roots = Array.from({ length: CORE_CAP + 1 }, (_, i) => `r${i}`);
    const checkpoints: Checkpoint[] = [
      { anchor: "a.md#x", page: "a.md", band: "beginner", entries: roots.map((root) => ({ root, english: root, agazan: root })) },
      { anchor: "b.md#x", page: "b.md", band: "beginner", entries: [{ root: "r0", english: "r0", agazan: "r0" }] },
    ];
    const [first, second] = coreReport(checkpoints, firstAppearance(checkpoints));
    assert.equal(first!.fresh.length, CORE_CAP + 1);
    assert.equal(first!.overCap, true);
    assert.deepEqual(second!.review.map((e) => e.root), ["r0"]);
    assert.equal(second!.overCap, false);
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
      if (!section?.band || !/^translation practice\b/i.test(section.title)) bad.push(`${key}: ${core}`);
    }
    assert.deepEqual(bad, []);
  });
});
