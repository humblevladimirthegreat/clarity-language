#!/usr/bin/env node
/**
 * PreToolUse hook on Bash: refuse a command whose whole output would land in
 * the transcript when a repo command prints a summary and saves the rest to a
 * file. Wired in .claude/settings.json. Two rules:
 *
 * Long Markdown. `cat`, `less`, `more`, `bat` or `nl` whose output reaches the
 * transcript (the last stage of a pipeline, no redirect) when the Markdown
 * files it names (under docs/, or AGENTS.md / TODO.md) total more than LIMIT
 * lines: read it in slices instead. Allowed: `cat x.md | grep …`,
 * `cat > x.md <<EOF`, `sed -n 'A,Bp'`, `grep`, `head`, `tail`, and files
 * outside the guarded paths. The `style-editor` subagent is exempt: it reads
 * whole lesson pages to reword them (the hook input's `agent_type`).
 *
 * Raw test runs. `tsx --test` or `node --test` (also through `npx`) whose
 * output reaches the transcript: a failure prints every assertion's whole
 * input, such as a solver program under `assert.match`. `npm test -- FILE`
 * prints a capped footer and saves the full output to tmp/logs/test-last.log.
 * Allowed: piped into another command (`| grep -E '^# (pass|fail)'`) or
 * redirected to a file.
 *
 * Exit 2 with a message on stderr blocks the call and shows the message to
 * the model; exit 0 lets it run. Any internal error lets the call run.
 */
import { existsSync, readFileSync, statSync } from "node:fs";
import { basename, isAbsolute, relative, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const LIMIT = 150;
const PRINTERS = new Set(["cat", "less", "more", "bat", "nl"]);
/** Subagent types the long-Markdown rule does not apply to. */
const MARKDOWN_EXEMPT = new Set(["style-editor"]);

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

/** A direct node:test run: `tsx --test …`, `node --test …`, or either through `npx`, after any `VAR=value` words. */
export function rawTestRun(words) {
  const rest = words.filter((w) => !/^[A-Za-z_][A-Za-z0-9_]*=/.test(w));
  let i = 0;
  if (basename(rest[i] ?? "") === "npx") {
    i++;
    while (rest[i]?.startsWith("-")) i++;
  }
  return ["tsx", "node"].includes(basename(rest[i] ?? "")) && rest.slice(i + 1).includes("--test");
}

export function check(command, cwd, root, agentType) {
  const text = stripHeredocs(command);
  let dir = cwd;
  const offenders = [];
  let rawTest = false;
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
      if (index !== stages.length - 1) return; // output feeds another command
      if (/(^|\s)\d?>(?!&)/.test(stage) || stage.includes("<<")) return; // writes a file
      if (rawTestRun(words)) rawTest = true;
      if (!PRINTERS.has(words[0])) return;
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
  const exempt = MARKDOWN_EXEMPT.has(agentType ?? "");
  return { markdown: !exempt && total > LIMIT ? offenders : [], rawTest };
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
  const { markdown: offenders, rawTest } = check(command, input.cwd || root, root, input.agent_type);
  if (rawTest) {
    process.stderr.write(
      "Blocked: a direct tsx --test / node --test run prints each failure's whole input (a failed assert.match prints the full program). " +
        "Run npm test -- FILE (add --test-name-pattern=NAME for one test; env vars such as UPDATE_GOLDEN=1 pass through): " +
        "it prints a capped footer and saves the full output to tmp/logs/test-last.log. " +
        "To keep the raw run, pipe it into a filter (| grep -E '^# (pass|fail)') or redirect it to a file under tmp/scratch/.\n",
    );
    process.exit(2);
  }
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

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    main();
  } catch {
    process.exit(0);
  }
}
