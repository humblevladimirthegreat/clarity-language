#!/usr/bin/env node
/** The `reading` CLI: prints the interpreter's readings of Ageben text (docs/meta/procedures/read-ageben.md). */
import { readFileSync } from "node:fs";
import { basename } from "node:path";

import { loadDefaultTables } from "../parse/index.js";
import type { LexWord } from "../parse/types.js";
import { readText } from "./read.js";
import type { Claim, Detail, Frame, Link, Reading, Term } from "./types.js";

const USAGE = [
  "Usage: node scripts/reading.mjs [--json] '<Ageben text>' ['<Ageben text>' ...]",
  "       node scripts/reading.mjs [--json] --file <path>     (one input per line)",
  "       node scripts/reading.mjs [--json] - < inputs.txt    (one input per line)",
  "  Prints each input, then one block per reading (nested readings indented): frames, scope order, claim, links, unread.",
  "  --json  print the readings as JSON, each LexWord reduced to its position and text",
].join("\n");

const word = (w: LexWord): string => w.raw;
const words = (ws: LexWord[]): string => ws.map(word).join(" ");

/** One line for a term; a nested clause or quote shows its reading ids. */
export function formatTerm(term: Term | undefined): string {
  if (!term) return "-";
  const tail = (details?: Detail[]): string => (details?.length ? ` {${details.map(formatDetail).join("; ")}}` : "");
  switch (term.kind) {
    case "thing":
      return `${term.head.raw}${term.named ? " (named)" : ""}${tail(term.details)}`;
    case "speaker":
    case "listener":
      return `${term.kind} ${term.word.raw}${tail(term.details)}`;
    case "pronoun":
      return `pronoun ${term.word.raw}${term.antecedent ? ` -> ${formatTerm(term.antecedent)}` : ""}${tail(term.details)}`;
    case "blank":
      return `blank ${term.word.raw}${tail(term.details)}`;
    case "literal":
      return `literal ${term.word.raw}${tail(term.details)}`;
    case "number":
      return `number ${term.word.raw}${tail(term.details)}`;
    case "list":
      return `list ${term.join ? term.join.raw : "?"}(${term.members.map(formatTerm).join(", ")})${term.sharedDetails ? term.sharedDetails.map((d) => ` shared ${d.values.role ?? "-"} ${formatDetail(d)}`).join("") : term.shared.map((s) => ` shared ${s.role} ${s.shared.word.raw}`).join("")}${term.bound ? ` {${formatDetail(term.bound)}}` : ""}`;
    case "clause":
      return `clause ${term.reading.id}`;
    case "quote":
      return `quote ${term.word.raw} [${term.readings.map((r) => r.id).join(" ")}]`;
  }
}

function formatDetail(d: Detail): string {
  const parts = [`${d.kind} ${d.key}`, words(d.words)];
  if (d.hosted) parts.push(`of ${formatTerm(d.hosted)}`);
  if (d.details?.length) parts.push(`{${d.details.map(formatDetail).join("; ")}}`);
  if (d.content?.length) parts.push(`[${d.content.map((r) => r.id).join(" ")}]`);
  return parts.join(" ");
}

function formatFrame(f: Frame): string {
  const parts = [f.family, f.key, `"${words(f.words)}"`];
  if (f.party) parts.push(`party ${formatTerm(f.party)}`);
  if (f.hosted) parts.push(`hosted ${formatTerm(f.hosted)}`);
  if (f.member) parts.push(`member ${f.member}`);
  if (f.holderHost) parts.push("holderHost");
  if (f.content?.length) parts.push(`content [${f.content.map((r) => r.id).join(" ")}]`);
  if (f.inner?.length) parts.push(`inner (${f.inner.map(formatFrame).join("; ")})`);
  if (f.details?.length) parts.push(`{${f.details.map(formatDetail).join("; ")}}`);
  return parts.join(" ");
}

const frameName = (f: Frame): string => `${f.key}${f.member ? `:${f.member}` : ""}`;

function formatClaim(c: Claim): string[] {
  const out: string[] = [];
  const bits = [`verb ${formatTerm(c.verb)}`];
  for (const role of ["z", "d", "b"] as const) if (c.roles[role]) bits.push(`${role} ${formatTerm(c.roles[role])}`);
  if (c.predicate.length) bits.push(`pred ${c.predicate.map(formatTerm).join(", ")}`);
  out.push(`claim ${bits.join(" | ")}`);
  if (c.clauses) out.push(`clauses ${formatTerm(c.clauses)}`);
  for (const d of c.details) out.push(`detail ${formatDetail(d)}`);
  return out;
}

function formatLink(l: Link): string {
  return `link ${l.kind} ${l.key} "${words(l.words)}"${l.to ? ` -> ${l.to}` : ""}`;
}

/** Compact text for readings, nested readings (frame contents, details, terms) printed indented after their parent. */
export function formatReadings(readings: Reading[], indent = 0): string[] {
  const pad = "  ".repeat(indent);
  const out: string[] = [];
  for (const r of readings) {
    out.push(`${pad}${r.id}`);
    for (const f of r.frames) out.push(`${pad}  frame ${formatFrame(f)}`);
    for (const o of r.order) out.push(`${pad}  order ${frameName(o.over)} > ${frameName(o.under)} (${o.kind})`);
    for (const [a, b] of r.unordered) out.push(`${pad}  unordered ${frameName(a)} | ${frameName(b)}`);
    for (const line of formatClaim(r.claim)) out.push(`${pad}  ${line}`);
    for (const l of r.links) out.push(`${pad}  ${formatLink(l)}`);
    for (const u of r.unread) out.push(`${pad}  unread ${u.construction}${u.key ? ` ${u.key}` : ""}${u.word ? ` "${u.word.raw}"` : ""} (${u.reason})`);
    for (const nested of nestedReadings(r)) out.push(...formatReadings([nested], indent + 1));
  }
  return out;
}

/** The readings held directly inside one reading, once each, in the order the lines above name them. */
function nestedReadings(r: Reading): Reading[] {
  const found: Reading[] = [];
  const seen = new Set<Reading>();
  const add = (list?: Reading[]): void => {
    for (const x of list ?? []) if (!seen.has(x)) (seen.add(x), found.push(x));
  };
  const term = (t: Term | undefined): void => {
    if (!t) return;
    if (t.kind === "clause") add([t.reading]);
    else if (t.kind === "quote") add(t.readings);
    else if (t.kind === "list") {
      t.members.forEach(term);
      if (t.bound) detail(t.bound);
      t.sharedDetails?.forEach(detail);
    }
    if ("details" in t) t.details?.forEach(detail);
  };
  const frame = (f: Frame): void => {
    add(f.content);
    term(f.party);
    term(f.hosted);
    f.inner?.forEach(frame);
    f.details?.forEach(detail);
  };
  const detail = (d: Detail): void => {
    add(d.content);
    term(d.hosted);
    d.details?.forEach(detail);
    d.frames?.forEach(frame);
  };
  r.frames.forEach(frame);
  term(r.claim.verb);
  Object.values(r.claim.roles).forEach(term);
  r.claim.predicate.forEach(term);
  r.claim.details.forEach(detail);
  term(r.claim.clauses);
  return found;
}

/** JSON replacer: a LexWord becomes `{ at, text }`; the parse-tree clause pointer is dropped. */
export function jsonReplacer(key: string, value: unknown): unknown {
  if (key === "source" && value && typeof value === "object") {
    const s = value as { utterance: number; body: number };
    return { utterance: s.utterance, body: s.body };
  }
  if (value && typeof value === "object" && "raw" in value && "reading" in value && "family" in value) {
    const w = value as LexWord;
    return { at: w.at, text: w.raw };
  }
  return value;
}

/** Circular-safe stringify: a repeated object prints as its id or `[seen]`. */
export function readingsJson(readings: Reading[]): string {
  const stack: unknown[] = [];
  return JSON.stringify(
    readings,
    function (this: unknown, key: string, value: unknown) {
      const v = jsonReplacer(key, value);
      if (v && typeof v === "object") {
        while (stack.length && stack[stack.length - 1] !== this) stack.pop();
        if (stack.includes(v)) return "[seen]";
        stack.push(v);
      }
      return v;
    },
    2,
  );
}

function main(): void {
  const raw = process.argv.slice(2);
  let json = false;
  let file: string | undefined;
  const args: string[] = [];
  for (let i = 0; i < raw.length; i++) {
    const arg = raw[i]!;
    if (arg === "--json") json = true;
    else if (arg === "--file") file = raw[++i];
    else if (arg.startsWith("--")) {
      console.error(`unknown flag ${arg}\n${USAGE}`);
      process.exit(1);
    } else args.push(arg);
  }
  const readStdin = args.includes("-") || (!file && args.length === 0 && !process.stdin.isTTY);
  const inputs = [
    ...args.filter((a) => a !== "-"),
    ...(file ? readFileSync(file, "utf8").split("\n") : []),
    ...(readStdin ? readFileSync(0, "utf8").split("\n") : []),
  ]
    .map((t) => t.trim())
    .filter(Boolean);
  if (inputs.length === 0) {
    console.error(USAGE);
    process.exit(1);
  }
  const tables = loadDefaultTables();
  let failed = false;
  const results = inputs.map((input) => {
    try {
      return { input, readings: readText(input, tables), error: undefined };
    } catch (error) {
      failed = true;
      return { input, readings: undefined, error: error instanceof Error ? error.message : String(error) };
    }
  });
  if (json) {
    const objs = results.map((r) => (r.readings ? { input: r.input, readings: JSON.parse(readingsJson(r.readings)) } : r));
    console.log(JSON.stringify(objs.length === 1 ? objs[0] : objs, null, 2));
  } else {
    for (const r of results) {
      console.log(r.input);
      console.log(!r.readings ? `  ERROR ${r.error}` : formatReadings(r.readings).map((l) => `  ${l}`).join("\n"));
    }
  }
  if (failed) process.exit(1);
}

if (/^(reading\.mjs|cli\.bundle\.mjs)$/.test(basename(process.argv[1] ?? ""))) main();
