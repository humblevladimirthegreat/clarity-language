import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

// @ts-expect-error: a plain .mjs hook with no type declarations
import { check, inlineEditScript, rawTestRun } from "./guard-long-output.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const hook = join(root, "scripts", "hooks", "guard-long-output.mjs");
const words = (s: string) => s.split(/\s+/);
const raw = (command: string): boolean => check(command, root, root).rawTest;

describe("guard-long-output: raw test runs", () => {
  it("knows a direct node:test run", () => {
    assert.ok(rawTestRun(words("npx --no-install tsx --test src/a.test.ts")));
    assert.ok(rawTestRun(words("UPDATE_GOLDEN=1 tsx --test src/a.test.ts")));
    assert.ok(rawTestRun(words("node --test x.test.mjs")));
    assert.ok(rawTestRun(words("node_modules/.bin/tsx --test x.test.ts")));
    assert.ok(!rawTestRun(words("npx --no-install tsx scripts/test-helper.ts")));
    assert.ok(!rawTestRun(words("npm test -- src/a.test.ts")));
  });

  it("blocks one whose output reaches the transcript, even through 2>&1", () => {
    assert.ok(raw("npx --no-install tsx --test src/a.test.ts"));
    assert.ok(raw("cd src && tsx --test a.test.ts 2>&1"));
  });

  it("lets a filtered or redirected run through", () => {
    assert.ok(!raw("npx --no-install tsx --test src/a.test.ts 2>&1 | grep -E '^# (pass|fail)'"));
    assert.ok(!raw("tsx --test src/a.test.ts > tmp/scratch/out.log 2>&1"));
    assert.ok(!raw("npm test -- src/a.test.ts"));
  });

  it("exits 2 with the npm test advice when run as the hook", () => {
    const input = JSON.stringify({ tool_input: { command: "npx --no-install tsx --test src/a.test.ts" }, cwd: root });
    try {
      execFileSync("node", [hook], { input, stdio: ["pipe", "pipe", "pipe"] });
      assert.fail("the hook let a raw test run through");
    } catch (error) {
      const e = error as { status: number; stderr: Buffer };
      assert.equal(e.status, 2);
      assert.match(e.stderr.toString(), /npm test -- FILE/);
    }
  });
});

describe("guard-long-output: long Markdown", () => {
  it("still blocks a long page printed whole and allows a slice", () => {
    assert.ok(check("cat docs/meta/solver.md", root, root).markdown.length > 0);
    assert.equal(check("sed -n '1,40p' docs/meta/solver.md", root, root).markdown.length, 0);
  });

  it("lets style-editor print a long page whole, but not other agents", () => {
    assert.equal(check("cat docs/meta/solver.md", root, root, "style-editor").markdown.length, 0);
    assert.ok(check("cat docs/meta/solver.md", root, root, "proposal-worker").markdown.length > 0);
  });
});

describe("guard-long-output: inline edit scripts", () => {
  it("blocks a script file written from a heredoc", () => {
    assert.ok(inlineEditScript("cat > tmp/scratch/fix.mjs <<'EOF'\nconsole.log(1)\nEOF\nnode tmp/scratch/fix.mjs"));
    assert.ok(inlineEditScript("cat <<EOF > /tmp/x/fix.py\nprint(1)\nEOF"));
    assert.ok(inlineEditScript("tee tmp/scratch/fix.ts <<'EOF' >/dev/null\nx\nEOF"));
    assert.ok(inlineEditScript("cat >> src/a.test.ts <<'EOF'\nit('x', () => {});\nEOF"));
  });

  it("blocks inline interpreters that write a file", () => {
    assert.ok(inlineEditScript("python3 - docs/x.md <<'EOF'\ns=open(p).read()\nopen(p,'w').write(s)\nEOF"));
    assert.ok(inlineEditScript("python3 -c \"open('a','w').write('x')\""));
    assert.ok(inlineEditScript("node -e \"require('fs').writeFileSync('a', 'x')\""));
    assert.ok(inlineEditScript("node --input-type=module <<'EOF'\nimport {writeFileSync} from 'node:fs'; writeFileSync('a','b')\nEOF"));
    assert.ok(inlineEditScript("cd src && npx --no-install tsx -e \"import('node:fs').then(f => f.writeFileSync('a','b'))\""));
  });

  it("lets read-only probes, script files and redirects through", () => {
    assert.ok(!inlineEditScript("node -e \"console.log(require('./package.json').name)\""));
    assert.ok(!inlineEditScript("python3 - <<'EOF'\nprint(open('a').read()[:10])\nEOF"));
    assert.ok(!inlineEditScript("node tmp/scratch/fix.mjs"));
    assert.ok(!inlineEditScript("node -e \"console.log(1)\" > tmp/scratch/out.txt"));
    assert.ok(!inlineEditScript("cat > tmp/scratch/notes.txt <<'EOF'\nwriteFileSync(\nEOF"));
    assert.ok(!inlineEditScript("grep -n writeFileSync scripts/verify.ts"));
    assert.ok(!inlineEditScript("git commit -m \"$(cat <<'EOF'\nfix open(p,'w') in node script\nEOF\n)\""));
  });
});
