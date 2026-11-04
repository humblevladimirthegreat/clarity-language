import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  allowlistRows,
  lintCheckpointInventory,
  practiceSettings,
  recipeBlocks,
  settingKey,
  type SittingCheckpoints,
} from "./checkpoint-inventory.js";

const allowlist = `### Beginner path

| Path | File | Status | Setting | Introduces | Sibling OK / notes |
|------|------|--------|---------|------------|--------------------|
| — | \`purpose.md\` | skip | — | — | orientation |
| 4 | \`a.md\` | **exists** | a bank | x | |

### Later

| Path | File | Band | Status | Setting | Introduces | Notes |
|------|------|------|--------|---------|------------|-------|
| 4 | \`b.md\` | Intermediate | **exists** | a harbor | y | |
| 5 | \`c.md\` | Advanced | skip | — | — | no translation |

## Settings

| File | Practice | Setting | From |
|------|----------|---------|------|
| \`say-x.md\` | \`#x-practice\` | a harbor | \`b.md\` |
`;

const orientation = ["purpose.md"];
const pages: SittingCheckpoints[] = [
  { page: "a.md", band: "beginner", settings: ["a bank"] },
  { page: "b.md", band: "intermediate", settings: ["a harbor"] },
  { page: "c.md", band: "advanced", settings: [] },
];

const recipes = [{ page: "say-x.md", id: "x-practice", setting: "a harbor" }];

const details = (input: Parameters<typeof lintCheckpointInventory>[0]) =>
  lintCheckpointInventory({ orientation, ...input }).map((f) => f.detail);

describe("allowlistRows", () => {
  it("reads both tables; no Band column is Beginner; — is no setting", () => {
    const rows = allowlistRows(allowlist);
    assert.deepEqual(
      rows.map((r) => [r.file, r.band, r.status, r.setting, r.notes]),
      [
        ["purpose.md", "beginner", "skip", "", "orientation"],
        ["a.md", "beginner", "exists", "a bank", ""],
        ["b.md", "intermediate", "exists", "a harbor", ""],
        ["c.md", "advanced", "skip", "", "no translation"],
      ],
    );
  });
});

describe("practiceSettings / recipeBlocks", () => {
  it("reads the setting inside each Practice section", () => {
    const md = "# A\n\n### Teach\n\n**Setting:** not this\n\n### Practice {#beginner-practice}\n\nLead.\n\n**Setting:** a bank.\n";
    assert.deepEqual(practiceSettings(md), ["a bank"]);
    assert.deepEqual(practiceSettings("# A\n\n### Practice\n\nNo setting.\n"), [undefined]);
  });
  it("names a recipe block by its H3", () => {
    const md = "## Practice\n\n### Comparing {#cmp-practice}\n\n**Setting:** a weighing room\n";
    assert.deepEqual(recipeBlocks("say-x.md", md), [{ page: "say-x.md", id: "cmp-practice", setting: "a weighing room" }]);
  });
  it("ignores case and a leading article", () => {
    assert.equal(settingKey("The Bank."), settingKey("a bank"));
  });
});

describe("lintCheckpointInventory", () => {
  it("passes a consistent inventory", () => {
    assert.deepEqual(details({ allowlist, pages, recipes }), []);
  });

  it("flags a sitting with no row and a row for no sitting", () => {
    const out = details({ allowlist, pages: [...pages.filter((p) => p.page !== "c.md"), { page: "d.md", band: "advanced", settings: [] }], recipes });
    assert.ok(out.some((d) => d.startsWith("no allowlist row")));
    assert.ok(out.some((d) => d.includes("`c.md` is not a sidebar sitting")));
  });

  it("checks band, status, and setting against the page", () => {
    const bad: SittingCheckpoints[] = [
      { page: "a.md", band: "beginner", settings: ["a vault"] },
      { page: "b.md", band: "advanced", settings: ["a harbor"] },
      { page: "c.md", band: "advanced", settings: ["a lab"] },
    ];
    const out = details({ allowlist, pages: bad, recipes });
    assert.ok(out.some((d) => d.includes('"a bank" does not match the page\'s "a vault"')));
    assert.ok(out.some((d) => d.includes("is advanced (front matter) but the row says intermediate")));
    assert.ok(out.some((d) => d.includes("`c.md` is **skip** but has a ### Practice")));
  });

  it("fails generate, an unknown status, and skip with no reason", () => {
    const md = allowlist.replace("| 4 | `a.md` | **exists** |", "| 4 | `a.md` | **generate** |").replace("| — | no translation |", "| — | — |");
    const out = details({ allowlist: md, pages, recipes });
    assert.ok(out.some((d) => d.includes("`a.md` is **generate**")));
    assert.ok(out.some((d) => d.includes("`c.md` is **skip** with no reason")));
  });

  it("flags a stage setting used twice, and a recipe reuse with no From", () => {
    const dup: SittingCheckpoints[] = pages.map((p) => (p.page === "a.md" ? { ...p, settings: ["The harbor"] } : p));
    const out = details({ allowlist: allowlist.replace("| a bank |", "| The harbor |"), pages: dup, recipes });
    assert.ok(out.some((d) => d.includes('setting "harbor" is also used by a.md')));
    const noFrom = allowlist.replace("| a harbor | `b.md` |", "| a harbor | — |");
    assert.ok(details({ allowlist: noFrom, pages, recipes }).some((d) => d.includes("name that page in From")));
  });

  it("flags a recipe block with no row", () => {
    const out = details({ allowlist, pages, recipes: [...recipes, { page: "say-x.md", id: "y-practice", setting: "a mill" }] });
    assert.deepEqual(out, ['practice block #y-practice ("a mill") has no row in the recipe settings table']);
  });
});
