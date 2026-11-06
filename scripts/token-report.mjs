#!/usr/bin/env node
// Token spend report for this project's Claude Code transcripts (main sessions and their
// subagents/), so a change to agent rules can be checked against earlier numbers.
//
// Run: npm run token-report -- [--since 2026-11-04] [--until 2026-11-07] [--skip <session id>] [--dir <path>]
//   --since / --until  window on each transcript's first timestamp (default: the last 7 days)
//   --skip             leave out a session (for example the one running the report)
//   --dir              transcript folder (default ~/.claude/projects/<slug of this repo's path>)
//
// Costs are weighted by relative price: input 1×, cache write 2× (1 h) or 1.25× (5 min), cache
// read 0.1×, output 5×. Token sizes of carried items are estimated at 3.6 characters per token,
// the ratio the baseline below was measured with (the proposal's text says 2.5 for repo text and
// 4 for prose; at 2.5 every carry share reads about 1.4× higher). An item's carry cost is its
// tokens × (2 for the cache write + 0.1 × each later call). Shares are of the window's total.
//
// Baseline (2026-11-04 to 2026-11-06; 28 sessions, 21 subagents, 3,517 calls, ~73M weighted;
// from docs/proposals/agent-token-spend.md, Problem):
//   cache reads 66% of spend; context beyond the first 80k tokens of each call 32%
//   main sessions start ~46k, peak median ~205k over a median 74 calls; subagents start ~38k
//   exploration ~15% of main-session spend, ~25% of subagent spend; results over 2k tokens
//     are ~55-59% of exploration cost; duplicate reads ~20k tokens
//   saved outputs read whole: 10 times, ~156k tokens
//   proposal reads: 1.3% (orchestrators of subagent runs), 2.7% (single-session runs), 3.0% (subagents)
//   checks: 333 runs, 91 failed (lint ageben 39, test 15, lint forward links 6, lint cheat sheets 6);
//     47 re-runs with no edit, 15 log reads, 20 source greps after a failure; ~2% of spend
//   skill listing ~19.5k characters per context, ~1.8% of spend for the synced part; 0 skills invoked
//   subagents after the 2026-11-05 proposals.md rewrite: median peak ~64k, median cost ~137k
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

function parseArgs(argv) {
  const day = (d) => d.toISOString().slice(0, 10);
  const opts = {
    since: day(new Date(Date.now() - 7 * 86400e3)),
    until: "9999",
    skip: undefined,
    dir: path.join(os.homedir(), ".claude", "projects", root.replace(/[^A-Za-z0-9]/g, "-")),
  };
  for (let i = 0; i < argv.length; i++) {
    const flag = argv[i];
    const key = { "--since": "since", "--until": "until", "--skip": "skip", "--dir": "dir" }[flag];
    if (!key || argv[i + 1] === undefined) {
      console.error(`Unknown or incomplete argument: ${flag}\nUsage: npm run token-report -- [--since DATE] [--until DATE] [--skip SESSION] [--dir PATH]`);
      process.exit(2);
    }
    opts[key] = argv[++i];
  }
  return opts;
}

const opts = parseArgs(process.argv.slice(2));

// ---------- reading transcripts ----------

function firstTimestamp(lines) {
  for (const l of lines) {
    try {
      const o = JSON.parse(l);
      if (o.timestamp) return o.timestamp;
    } catch {
      /* partial line */
    }
  }
  return "";
}

function transcripts() {
  const out = [];
  if (!fs.existsSync(opts.dir)) {
    console.error(`No transcripts at ${opts.dir}`);
    process.exit(1);
  }
  for (const f of fs.readdirSync(opts.dir)) {
    if (!f.endsWith(".jsonl")) continue;
    const session = f.slice(0, -6);
    if (session === opts.skip) continue;
    const file = path.join(opts.dir, f);
    const lines = fs.readFileSync(file, "utf8").split("\n").filter(Boolean);
    const start = firstTimestamp(lines);
    if (!start || start < opts.since || start >= opts.until) continue;
    out.push({ session, sub: false, lines, start });
    const subDir = path.join(opts.dir, session, "subagents");
    if (!fs.existsSync(subDir)) continue;
    for (const g of fs.readdirSync(subDir)) {
      if (!g.endsWith(".jsonl")) continue;
      let meta = {};
      try {
        meta = JSON.parse(fs.readFileSync(path.join(subDir, g.replace(/\.jsonl$/, ".meta.json")), "utf8"));
      } catch {
        /* no meta */
      }
      const subLines = fs.readFileSync(path.join(subDir, g), "utf8").split("\n").filter(Boolean);
      out.push({ session, sub: true, lines: subLines, start: firstTimestamp(subLines), desc: meta.description ?? "", type: meta.agentType ?? "" });
    }
  }
  return out;
}

const weight = (u = {}) =>
  (u.input_tokens ?? 0) +
  (u.cache_creation?.ephemeral_1h_input_tokens ?? 0) * 2 +
  (u.cache_creation?.ephemeral_5m_input_tokens ?? 0) * 1.25 +
  (u.cache_read_input_tokens ?? 0) * 0.1 +
  (u.output_tokens ?? 0) * 5;
const context = (u = {}) => (u.cache_read_input_tokens ?? 0) + (u.cache_creation_input_tokens ?? 0) + (u.input_tokens ?? 0);
const CHARS_PER_TOKEN = 3.6;
const repoTok = (s) => Math.ceil(s.length / CHARS_PER_TOKEN);
const proseTok = repoTok;
const resultText = (r) => (typeof r.content === "string" ? r.content : (r.content ?? []).map((c) => c.text ?? "").join("\n"));

// ---------- classifying ----------

const CHECK = /npm run (build|verify|lint\S*|grammar-check)\b|npm (run )?test\b|scripts\/(build|test)\.mjs|tsx --test/;
const EDIT_BASH = /sed -i|python3 - <<|--write\b|cat > |tee /;
const FAIL = /build FAILED|^✗ |✖ failing|^Failing tests|ℹ fail [1-9]|^Exit code [1-9]|verify: FAIL/m;

function kindOf(name, input = {}) {
  if (name === "Read") {
    const p = input.file_path ?? "";
    if (/tool-results|\/tasks\/.*\.output$/.test(p)) return "exploration: saved output";
    if (/docs\/proposals\//.test(p)) return "proposal read";
    return "exploration";
  }
  if (name === "Grep" || name === "Glob") return "exploration";
  if (name === "Edit" || name === "Write" || name === "NotebookEdit") return "edit";
  if (name === "Agent" || name === "SendMessage") return "subagent";
  if (name === "Skill") return "skill";
  if (name !== "Bash") return "other tool";
  const c = (input.command ?? "").replace(/^cd [^;&]+(;|&&)\s*/, "");
  if (CHECK.test(c)) return "check";
  if (EDIT_BASH.test(c)) return "edit";
  if (/tool-results|\/tasks\/\S+\.output/.test(c)) return "exploration: saved output";
  if (/docs\/proposals\/\S+\.md/.test(c) && /^\s*(cat|sed -n|head|tail|less)\b/.test(c)) return "proposal read";
  if (/^\s*(cat|sed -n|head|tail|awk|grep|rg|find|ls|wc|diff)\b|git (diff|show|log|grep)|scripts\/(find|find-english|parse|pegs)\.mjs|page-lines/.test(c)) {
    return "exploration";
  }
  if (/^\s*git /.test(c)) return "git";
  return "bash other";
}

/** The failing step names a check result shows. */
function failedSteps(text) {
  const named = /^failed: (.+)$/m.exec(text);
  if (named) return named[1].split(", ").map((s) => s.trim());
  const steps = [...text.matchAll(/^✗ (?!shard)(.+?) \(\d/gm)].map((m) => m[1]);
  if (steps.length) return steps;
  if (/✖ failing|^Failing tests|ℹ fail [1-9]/m.test(text)) return ["test"];
  return ["(other)"];
}

// ---------- per-transcript pass ----------

function analyse(t) {
  const usage = new Map();
  const order = [];
  const tools = new Map();
  const items = []; // { kind, tok, at, label, big }
  const events = []; // check / edit / log-peek / src-grep, in order
  const skills = [];
  let listing;
  for (const l of t.lines) {
    let o;
    try {
      o = JSON.parse(l);
    } catch {
      continue;
    }
    if (o.type === "assistant" && o.message?.id) {
      if (!usage.has(o.message.id)) order.push(o.message.id);
      usage.set(o.message.id, o.message.usage);
      for (const c of o.message.content ?? []) {
        if (c.type === "tool_use") {
          const kind = kindOf(c.name, c.input);
          tools.set(c.id, { name: c.name, input: c.input ?? {}, kind });
          const inputTok = repoTok(JSON.stringify(c.input ?? {}));
          items.push({ kind: kind === "edit" || kind === "subagent" ? kind : "tool input", tok: inputTok, at: order.length });
          if (kind === "edit") events.push({ type: "edit" });
          if (c.name === "Skill") skills.push(c.input?.skill ?? "?");
        } else if (c.type === "text") {
          items.push({ kind: "assistant text", tok: proseTok(c.text ?? ""), at: order.length });
        }
      }
    } else if (o.type === "user" && Array.isArray(o.message?.content)) {
      for (const c of o.message.content) {
        if (c.type === "tool_result") {
          const tool = tools.get(c.tool_use_id);
          const text = resultText(c);
          const kind = tool?.kind ?? "other tool";
          const label = tool?.name === "Bash" ? (tool.input.command ?? "").slice(0, 70) : (tool?.input.file_path ?? tool?.input.pattern ?? tool?.name ?? "?");
          items.push({ kind, tok: repoTok(text), at: order.length + 1, label: `${tool?.name ?? "?"}: ${label}`.replace(/\s+/g, " ") });
          if (kind === "check") events.push({ type: "check", fail: FAIL.test(text), steps: FAIL.test(text) ? failedSteps(text) : [] });
          else if (kind.startsWith("exploration")) {
            const cmd = tool?.name === "Bash" ? tool.input.command ?? "" : tool?.input.file_path ?? "";
            if (/tmp\/\S*\.log|tool-results|\/tasks\/\S+\.output/.test(cmd)) events.push({ type: "log peek" });
            else if (/\b(grep|rg)\b/.test(cmd) && /\b(src|scripts)\//.test(cmd)) events.push({ type: "src grep" });
            else if (tool?.name === "Grep" && /\b(src|scripts)\b/.test(tool.input.path ?? "")) events.push({ type: "src grep" });
          }
        } else if (c.type === "text") {
          items.push({ kind: o.isMeta ? "reminders" : "user text", tok: proseTok(c.text ?? ""), at: order.length + 1 });
        }
      }
    } else if (o.type === "user" && typeof o.message?.content === "string") {
      items.push({ kind: "user text", tok: proseTok(o.message.content), at: order.length + 1 });
    } else if (o.type === "attachment") {
      const text = (o.rendered ?? []).map((x) => x.content ?? "").join("") || (o.attachment?.content ?? "");
      if (o.attachment?.type === "skill_listing") {
        const content = String(o.attachment.content ?? text);
        const syncedChars = content
          .split(/\n(?=- )/)
          .filter((entry) => entry.startsWith("- anthropic-skills:"))
          .reduce((a, entry) => a + entry.length, 0);
        listing = { names: o.attachment.names ?? [], chars: content.length, syncedChars };
        items.push({ kind: "skill listing", tok: proseTok(content), at: order.length + 1 });
      } else if (text) items.push({ kind: "reminders", tok: proseTok(text), at: order.length + 1 });
    }
  }
  const n = order.length;
  const calls = order.map((id) => usage.get(id) ?? {});
  const cost = calls.reduce((a, u) => a + weight(u), 0);
  const comp = { input: 0, cacheWrite: 0, cacheRead: 0, output: 0, above80k: 0 };
  for (const u of calls) {
    comp.input += u.input_tokens ?? 0;
    comp.cacheWrite += (u.cache_creation?.ephemeral_1h_input_tokens ?? 0) * 2 + (u.cache_creation?.ephemeral_5m_input_tokens ?? 0) * 1.25;
    comp.cacheRead += (u.cache_read_input_tokens ?? 0) * 0.1;
    comp.output += (u.output_tokens ?? 0) * 5;
    comp.above80k += Math.max(0, context(u) - 80_000) * 0.1;
  }
  for (const it of items) {
    const later = Math.max(0, n - it.at);
    it.carry = later > 0 ? it.tok * (2 + 0.1 * Math.max(0, later - 1)) : 0;
    it.early = it.at <= n / 4;
  }
  // Fix loops: after a failed check, until the next edit.
  const loop = { checks: 0, failed: 0, rerunNoEdit: 0, logPeeks: 0, srcGreps: 0, steps: {} };
  let failing = false;
  let editedSinceFail = true;
  for (const e of events) {
    if (e.type === "edit") {
      editedSinceFail = true;
      continue;
    }
    if (e.type === "check") {
      loop.checks++;
      if (failing && !editedSinceFail) loop.rerunNoEdit++;
      failing = e.fail;
      editedSinceFail = false;
      if (e.fail) {
        loop.failed++;
        for (const s of e.steps) loop.steps[s] = (loop.steps[s] ?? 0) + 1;
      }
      continue;
    }
    if (failing && !editedSinceFail && e.type === "log peek") loop.logPeeks++;
    if (failing && !editedSinceFail && e.type === "src grep") loop.srcGreps++;
  }
  const ctxs = calls.map(context);
  return { ...t, lines: undefined, n, cost, comp, items, loop, skills, listing, ctx0: ctxs[0] ?? 0, ctxMax: Math.max(0, ...ctxs) };
}

// ---------- report ----------

const all = transcripts().map(analyse).filter((x) => x.n > 0);
const total = all.reduce((a, x) => a + x.cost, 0);
if (!total) {
  console.log(`No API calls in ${opts.dir} between ${opts.since} and ${opts.until}.`);
  process.exit(0);
}
const pct = (x, of = total) => `${((100 * x) / of).toFixed(1)}%`;
const k = (x) => `${Math.round(x / 1000)}k`;
const median = (xs) => {
  const s = [...xs].sort((a, b) => a - b);
  return s.length ? s[s.length >> 1] : 0;
};
const sum = (xs, f) => xs.reduce((a, x) => a + f(x), 0);
const mains = all.filter((x) => !x.sub);
const subs = all.filter((x) => x.sub);

console.log(`Token report ${opts.since} → ${opts.until === "9999" ? "now" : opts.until}`);
console.log(
  `${mains.length} sessions, ${subs.length} subagents, ${sum(all, (x) => x.n).toLocaleString("en")} API calls, ${(total / 1e6).toFixed(1)}M weighted tokens`,
);

console.log("\n## Spend by component");
for (const key of ["cacheRead", "cacheWrite", "output", "input"]) console.log(`  ${key.padEnd(12)} ${pct(sum(all, (x) => x.comp[key]))}`);
console.log(`  context beyond the first 80k of each call: ${pct(sum(all, (x) => x.comp.above80k))}`);
for (const [name, group] of [["main sessions", mains], ["subagents", subs]]) {
  if (!group.length) continue;
  console.log(`  ${name}: start ~${k(median(group.map((x) => x.ctx0)))}, median peak ~${k(median(group.map((x) => x.ctxMax)))}, median ${median(group.map((x) => x.n))} calls, ${pct(sum(group, (x) => x.cost))} of spend`);
}

console.log("\n## Carry cost by content kind (share of that group's spend)");
for (const [name, group] of [["main", mains], ["subagent", subs]]) {
  if (!group.length) continue;
  const gcost = sum(group, (x) => x.cost);
  const byKind = {};
  for (const x of group) for (const it of x.items) {
    const b = (byKind[it.kind] ??= { tok: 0, carry: 0, n: 0, early: 0, big: 0 });
    b.tok += it.tok;
    b.carry += it.carry;
    b.n++;
    if (it.early) b.early += it.carry;
    if (it.tok > 2000) b.big += it.carry;
  }
  console.log(`  ${name}: kind, items, tokens, carry, from first quarter, from results over 2k`);
  for (const [kind, b] of Object.entries(byKind).sort((a, b) => b[1].carry - a[1].carry).slice(0, 12)) {
    console.log(`    ${kind.padEnd(28)} ${String(b.n).padStart(6)} ${k(b.tok).padStart(7)} ${pct(b.carry, gcost).padStart(7)} ${pct(b.early, b.carry || 1).padStart(7)} ${pct(b.big, b.carry || 1).padStart(7)}`);
  }
}
const largest = all
  .flatMap((x) => x.items.filter((it) => it.label).map((it) => ({ ...it, who: `${x.session.slice(0, 8)} ${x.sub ? "sub " : "main"}` })))
  .sort((a, b) => b.carry - a.carry)
  .slice(0, 10);
console.log("  largest single items: carry, tokens, transcript, what");
for (const it of largest) console.log(`    ${pct(it.carry).padStart(6)} ${k(it.tok).padStart(6)}  ${it.who}  ${it.kind}: ${it.label}`);

console.log("\n## Fix loops");
const loops = all.map((x) => x.loop);
const steps = {};
for (const l of loops) for (const [s, c] of Object.entries(l.steps)) steps[s] = (steps[s] ?? 0) + c;
console.log(`  check runs ${sum(loops, (l) => l.checks)}, failed ${sum(loops, (l) => l.failed)}`);
console.log(`  failing steps: ${Object.entries(steps).sort((a, b) => b[1] - a[1]).map(([s, c]) => `${s} ${c}`).join(", ") || "none"}`);
console.log(`  after a failure, before the next edit: re-runs ${sum(loops, (l) => l.rerunNoEdit)}, log / saved-output reads ${sum(loops, (l) => l.logPeeks)}, src/ or scripts/ greps ${sum(loops, (l) => l.srcGreps)}`);

console.log("\n## Subagents: start, calls, peak context, weighted cost, description");
for (const s of [...subs].sort((a, b) => (a.start < b.start ? -1 : 1))) {
  console.log(`  ${s.start.slice(0, 16).replace("T", " ")}  ${String(s.n).padStart(4)}  ${k(s.ctxMax).padStart(5)}  ${k(s.cost).padStart(6)}  ${s.desc || s.type}`);
}
if (subs.length) console.log(`  median peak ~${k(median(subs.map((x) => x.ctxMax)))}, median cost ~${k(median(subs.map((x) => x.cost)))}`);

console.log("\n## Skills");
const invoked = {};
for (const x of all) for (const s of x.skills) invoked[s] = (invoked[s] ?? 0) + 1;
console.log(`  invoked: ${Object.entries(invoked).map(([s, c]) => `${s} ${c}`).join(", ") || "none"}`);
const listings = all.filter((x) => x.listing);
if (listings.length) {
  const latest = [...listings].sort((a, b) => (a.start < b.start ? 1 : -1))[0];
  const synced = latest.listing.names.filter((n) => n.startsWith("anthropic-skills:"));
  console.log(`  listing in the latest transcript (${latest.session.slice(0, 8)}): ${latest.listing.names.length} skills, ${latest.listing.chars.toLocaleString("en")} characters, ${synced.length} synced (anthropic-skills:*)`);
  const listingCarry = sum(all, (x) => sum(x.items.filter((it) => it.kind === "skill listing"), (it) => it.carry));
  const syncedShare = sum(listings, (x) => x.listing.syncedChars) / (sum(listings, (x) => x.listing.chars) || 1);
  console.log(`  skill listing carry: ${pct(listingCarry)} of spend, about ${pct(listingCarry * syncedShare)} for the synced part (${pct(syncedShare, 1)} of its characters)`);
}
