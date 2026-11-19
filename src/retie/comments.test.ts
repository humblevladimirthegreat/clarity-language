import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { loadDefaultTables } from "../parse/index.js";
import { rewriteSourceComments, sourceComments } from "./comments.js";
import { SOURCE_RETIE_SKIP_RE } from "./source.js";

const ctx = {
  map: new Map([["azawa", "ululo"]]),
  tables: loadDefaultTables(),
  follow: { names: new Map([["Azawan", "Ululon"]]), words: new Map() },
  english: new Set(["one", "the"]),
  currentRoots: new Set(["ululo"]),
};

describe("sourceComments", () => {
  it("finds line, block and JSDoc comments, not comment-like text in strings or regexes", () => {
    const source = [
      "/** Doc `zazawan`. */",
      'const url = "http://x"; // tail',
      "const re = /\\/\\/ not a comment/;",
      "function f() {",
      "  /* inner */",
      "}",
      "",
    ].join("\n");
    assert.deepEqual(
      sourceComments(source).map((comment) => comment.text),
      ["/** Doc `zazawan`. */", "// tail", "/* inner */"],
    );
  });

  it("reads only the script blocks of a Vue file", () => {
    const source = "<template><!-- `zazawan` --></template>\n<script setup lang=\"ts\">\n// `zazawan`\n</script>\n";
    const [comment] = sourceComments(source, "X.vue");
    assert.equal(comment?.text, "// `zazawan`");
    assert.equal(source.slice(comment!.index, comment!.index + comment!.text.length), comment!.text);
  });
});

describe("rewriteSourceComments", () => {
  it("reties backticked Ageben and leaves English, names and bare words alone", () => {
    const source = [
      "/**",
      " * A sentence (`zazawan vawalal.`): Azawan talks; azawa stays.",
      " */",
      "// one more: `zazawan`",
      'const s = "zazawan";',
      "",
    ].join("\n");
    const { text, changes } = rewriteSourceComments(source, "x.ts", ctx);
    assert.equal(
      text,
      source.replace("`zazawan vawalal.`", "`zululon vawalal.`").replace("`zazawan`", "`zululon`"),
    );
    assert.equal(changes.length, 2);
  });

  it("keeps a test's own fixture root in its comments", () => {
    const source = 'const root = "azawa";\n// fixture word `zazawan`\n';
    assert.equal(rewriteSourceComments(source, "x.test.ts", ctx).text, source);
  });
});

describe("source retie skip marker", () => {
  it("is a comment on a line of its own", () => {
    assert.match("import x;\n// retie: skip\n", SOURCE_RETIE_SKIP_RE);
    assert.doesNotMatch("// a file opts out with `// retie: skip`\n", SOURCE_RETIE_SKIP_RE);
  });
});
