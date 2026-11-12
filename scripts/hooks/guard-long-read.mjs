#!/usr/bin/env node
/**
 * PreToolUse hook on Bash: refuse a command that prints a long Markdown file
 * (under docs/, or AGENTS.md / TODO.md) whole to the transcript, and say how
 * to read it in slices instead. Wired in .claude/settings.json.
 *
 * Blocked: `cat`, `less`, `more`, `bat` or `nl` whose output reaches the
 * transcript (the last stage of a pipeline, no redirect) when the Markdown
 * files it names total more than LIMIT lines. Allowed: `cat x.md | grep …`,
 * `cat > x.md <<EOF`, `sed -n 'A,Bp'`, `grep`, `head`, `tail`, and files
 * outside the guarded paths.
 *
 * Exit 2 with a message on stderr blocks the call and shows the message to
 * the model; exit 0 lets it run. Any internal error lets the call run.
 */
import { existsSync, readFileSync, statSync } from "node:fs";
import { isAbsolute, relative, resolve } from "node:path";

const LIMIT = 150;
const PRINTERS = new Set(["cat", "less", "more", "bat", "nl"]);

function stripHeredocs(command) {
  const lines = command.split("\n");
  const out = [];
  let tag = null;
  for (const line of lines) {
    if (tag !== null) {
      if (line.trim() === tag) tag = null;
      continue;
    }
    out.push(line);
    const m = /<<-?\s*['"]?([A-Za-z_][A-Za-z0-9_]*)['"]?/.exec(line);
    if (m) tag = m[1];
  }
  return out.join("\n");
}

function tokens(stage) {
  const result = [];
  const re = /'([^']*)'|"([^"]*)"|(\S+)/g;
  let m;
  while ((m = re.exec(stage)) !== null) result.push(m[1] ?? m[2] ?? m[3]);
  return result;
}

function guarded(file, root) {
  const rel = relative(root, file);
  if (rel.startsWith("..") || isAbsolute(rel)) return false;
  if (!rel.endsWith(".md")) return false;
  return rel.startsWith("docs/") || rel === "AGENTS.md" || rel === "TODO.md";
}

function lineCount(file) {
  try {
    if (!existsSync(file) || !statSync(file).isFile()) return 0;
    return readFileSync(file, "utf8").split("\n").length;
  } catch {
    return 0;
  }
}

function check(command, cwd, root) {
  const text = stripHeredocs(command);
  let dir = cwd;
  const offenders = [];
  // Split into commands on ; && || and newlines, then each into pipeline stages.
  for (const statement of text.split(/;|&&|\|\||\n/)) {
    const stages = statement.split("|");
    stages.forEach((stage, index) => {
      const words = tokens(stage);
      if (words.length === 0) return;
      if (words[0] === "cd" && words[1]) {
        dir = resolve(dir, words[1]);
        return;
      }
      if (!PRINTERS.has(words[0])) return;
      if (index !== stages.length - 1) return; // output feeds another command
      if (/(^|\s)\d?>/.test(stage) || stage.includes("<<")) return; // writes a file
      const files = words
        .slice(1)
        .filter((w) => !w.startsWith("-"))
        .map((w) => resolve(dir, w))
        .filter((f) => guarded(f, root));
      if (files.length === 0) return;
      offenders.push(...files.map((f) => [relative(root, f), lineCount(f)]));
    });
  }
  // The limit applies to the whole call: two mid-size files in one command count together.
  const total = offenders.reduce((sum, [, n]) => sum + n, 0);
  return total > LIMIT ? offenders : [];
}

function main() {
  let input;
  try {
    input = JSON.parse(readFileSync(0, "utf8"));
  } catch {
    process.exit(0);
  }
  const command = input?.tool_input?.command;
  if (typeof command !== "string") process.exit(0);
  const root = process.env.CLAUDE_PROJECT_DIR || input.cwd || process.cwd();
  const offenders = check(command, input.cwd || root, root);
  if (offenders.length === 0) process.exit(0);
  const list = offenders.map(([f, n]) => `${f} (${n} lines)`).join(", ");
  const first = offenders[0][0];
  process.stderr.write(
    `Blocked: this prints ${list} whole (over ${LIMIT} lines in one call). ` +
      `List the headings with line ranges first: npm run -s outline -- ${first}\n` +
      `Then read only the ranges you need, one file per call: sed -n 'A,Bp' ${first} ` +
      `(or the Read tool with offset and limit). A procedure you must read in full: read it alone with the Read tool.\n`,
  );
  process.exit(2);
}

try {
  main();
} catch {
  process.exit(0);
}
