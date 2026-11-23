import assert from "node:assert/strict";
import { join } from "node:path";
import { describe, it } from "node:test";

import { GRAMMAR_DIR } from "../../src/repo-paths.js";
import { pageKeyArg, pageKeyFile, pageKeyOf, resolveLinkPage } from "./link-rewrite.ts";
import { findPageReferences } from "./retarget-id.ts";

describe("cheat-sheet page keys", () => {
  it("keys a cheat sheet by its folder, the stage page by its filename", () => {
    assert.equal(pageKeyArg("cheat-sheets/roles.md"), "cheat-sheets/roles.md");
    assert.equal(pageKeyArg("roles.md"), "roles.md");
    assert.equal(pageKeyOf(join(GRAMMAR_DIR, "cheat-sheets", "roles.md")), "cheat-sheets/roles.md");
    assert.equal(pageKeyFile("cheat-sheets/roles.md"), join(GRAMMAR_DIR, "cheat-sheets", "roles.md"));
  });

  it("resolves links into the folder to the sheet", () => {
    assert.equal(resolveLinkPage("clause.md", "/cheat-sheets/roles#x"), "cheat-sheets/roles.md");
    assert.equal(resolveLinkPage("cheat-sheets/roles.md", "/roles#x"), "roles.md");
    assert.equal(resolveLinkPage("", "../grammar/cheat-sheets/consonants.md#n"), "cheat-sheets/consonants.md");
  });

  it("page-refs finds the sheet's references, not the stage page's", () => {
    const text = "See [sheet](/cheat-sheets/roles#a) and [page](/roles#b), and cheat-sheets/roles.md#c.";
    const sheet = findPageReferences(text, join(GRAMMAR_DIR, "beginner", "clause.md"), "cheat-sheets/roles.md").map((r) => r.id);
    const stage = findPageReferences(text, join(GRAMMAR_DIR, "beginner", "clause.md"), "roles.md").map((r) => r.id);
    assert.deepEqual(sheet, ["a", "c"]);
    assert.deepEqual(stage, ["b"]);
  });
});
