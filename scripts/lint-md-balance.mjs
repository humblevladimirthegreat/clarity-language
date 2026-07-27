#!/usr/bin/env node
/**
 * Fail if Markdown emphasis markers (* / **) are left open at EOF.
 * Strips fenced code, inline code, and link destinations so morphology in
 * backticks does not confuse the scan. Catches the usual "rest of file
 * renders bold/italic" breakage from nested or mistyped **.
 *
 * Also flags lines whose *local* ** / * parity is odd — those are usually
 * the real typo; EOF imbalance is often just the cascade.
 *
 * Usage: node scripts/lint-md-balance.mjs [paths...]
 * Default: docs/, AGENTS.md, TODO.md, README.md (if present)
 */
import { readdir, readFile, access, stat } from "node:fs/promises";
import { join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(fileURLToPath(new URL("..", import.meta.url)));

async function exists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function collectMdFiles(entry, out = []) {
  const path = resolve(ROOT, entry);
  if (!(await exists(path))) return out;
  const st = await stat(path);
  if (st.isFile()) {
    if (path.endsWith(".md")) out.push(path);
    return out;
  }
  for (const name of await readdir(path)) {
    if (name === "node_modules" || name === ".git" || name === "dist") continue;
    await collectMdFiles(join(path, name), out);
  }
  return out;
}

/** Blank out protected spans so * inside them are ignored. */
function stripProtected(line) {
  let s = line;
  s = s.replace(/`[^`]*`/g, (m) => " ".repeat(m.length));
  s = s.replace(/!\[[^\]]*\]\([^)]*\)/g, (m) => " ".repeat(m.length));
  s = s.replace(/\]\([^)]*\)/g, (m) => " ".repeat(m.length));
  s = s.replace(/\]\[[^\]]*\]/g, (m) => " ".repeat(m.length));
  s = s.replace(/<[^>]+>/g, (m) => " ".repeat(m.length));
  s = s.replace(/\\[*_]/g, "  ");
  return s;
}

function isListMarkerStar(s, j) {
  return (
    s[j] === "*" &&
    (j === 0 || s[j - 1] === " ") &&
    s[j + 1] === " " &&
    !s.startsWith("**", j)
  );
}

/**
 * @returns {{
 *   strong: 0|1,
 *   em: 0|1,
 *   firstOpen: null | { line: number, col: number, marker: string },
 *   oddLines: { line: number, strong: 0|1, em: 0|1 }[],
 *   unclosedFence: boolean
 * }}
 */
function lintFile(text) {
  const lines = text.split(/\r?\n/);
  let inFence = false;
  let strong = 0;
  let em = 0;
  let firstOpen = null;
  /** @type {{ line: number, strong: 0|1, em: 0|1 }[]} */
  const oddLines = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.trim().startsWith("```")) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;

    const s = stripProtected(line);
    let lineStrong = 0;
    let lineEm = 0;
    let j = 0;
    while (j < s.length) {
      if (isListMarkerStar(s, j)) {
        j += 1;
        continue;
      }
      let marker;
      let advance;
      if (s.startsWith("***", j)) {
        marker = "***";
        advance = 3;
        strong ^= 1;
        em ^= 1;
        lineStrong ^= 1;
        lineEm ^= 1;
      } else if (s.startsWith("**", j)) {
        marker = "**";
        advance = 2;
        strong ^= 1;
        lineStrong ^= 1;
      } else if (s[j] === "*") {
        marker = "*";
        advance = 1;
        em ^= 1;
        lineEm ^= 1;
      } else {
        j += 1;
        continue;
      }
      if ((strong || em) && !firstOpen) {
        firstOpen = { line: i + 1, col: j + 1, marker };
      }
      if (!strong && !em) firstOpen = null;
      j += advance;
    }
    if (lineStrong || lineEm) {
      oddLines.push({
        line: i + 1,
        strong: /** @type {0|1} */ (lineStrong),
        em: /** @type {0|1} */ (lineEm),
      });
    }
  }

  return {
    strong: /** @type {0|1} */ (strong),
    em: /** @type {0|1} */ (em),
    firstOpen,
    oddLines,
    unclosedFence: inFence,
  };
}

async function main() {
  const args = process.argv.slice(2);
  const entries =
    args.length > 0 ? args : ["docs", "AGENTS.md", "TODO.md", "README.md"];

  const files = [];
  for (const e of entries) {
    await collectMdFiles(e, files);
  }
  files.sort();

  if (files.length === 0) {
    console.error("lint-md-balance: no .md files found");
    process.exit(2);
  }

  let failed = 0;
  for (const file of files) {
    const rel = relative(ROOT, file);
    const text = await readFile(file, "utf8");
    const { strong, em, firstOpen, oddLines, unclosedFence } = lintFile(text);

    if (unclosedFence) {
      failed += 1;
      console.error(`${rel}: unclosed fenced code block (\`\`\`) at EOF`);
    }
    for (const odd of oddLines) {
      failed += 1;
      const bits = [
        odd.strong ? "odd **" : null,
        odd.em ? "odd *" : null,
      ]
        .filter(Boolean)
        .join(", ");
      console.error(
        `${rel}:${odd.line}: ${bits} on this line (likely unclosed emphasis)`,
      );
    }
    if ((strong || em) && oddLines.length === 0) {
      failed += 1;
      const open = [
        strong ? "bold (**)" : null,
        em ? "italic (*)" : null,
      ]
        .filter(Boolean)
        .join(" and ");
      const where = firstOpen
        ? `${rel}:${firstOpen.line}:${firstOpen.col} (${firstOpen.marker})`
        : rel;
      console.error(
        `${rel}: unclosed ${open} at EOF — first left open at ${where}`,
      );
    } else if (strong || em) {
      console.error(
        `${rel}: (also unclosed at EOF — usually fixed by the odd-line hit(s) above)`,
      );
    }
  }

  if (failed > 0) {
    console.error(
      `\nlint-md-balance: ${failed} problem(s) in ${files.length} file(s)`,
    );
    process.exit(1);
  }
  console.log(`lint-md-balance: ok (${files.length} file(s))`);
}

main().catch((err) => {
  console.error(err);
  process.exit(2);
});
