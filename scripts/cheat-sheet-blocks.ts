// Generated blocks on cheat sheets (docs/meta/grammar-docs.md, "Cheat sheets").
//
// A sheet marks a block the data owns:
//
//   <!-- generated: SOURCE [key=value …] -->
//   …table…
//   <!-- /generated -->
//
// and this script rebuilds the table from the data. Without flags it is a check
// (the build runs it) and fails when a block is stale; `--write` refreshes every
// block in place.
//
// Sources:
// - `overlays` — rows of data/lexicon-overlays.csv, filtered by `pos=` and
//   `kind=` (`|`-separated). Sake rows are left out unless `kind=` names them;
//   the `sakes` source shows them by root. `skip=` / `take=` slice the sorted
//   rows so a too-tall table can split across `<PageBreak />` (same columns).
// - `sakes` — one row per sake root, as the `/th/` word for *serves* and *detracts from*.
// - `closed-words` — closed-root words with a fixed reading (special pronouns,
//   sentence linkers), read from data/closed-words.csv (kinds `pronoun` and `linker`).
// - `scope-profiles` — which word covers which: text order and the rules of their
//   own, from the family profiles (src/parse/scope-profiles.ts).
// - `boundaries` — what reaches into each box, from the boundary table
//   (src/parse/boundaries.ts); each cell links to the section that states it.
// - `discourse-slots` — what carries past a period and what ends it, from the
//   discourse slot table (src/parse/discourse-slots.ts).
//
// `--print SOURCE [key=value …]` prints one source's table and writes nothing.
//
// Every row links to the section that teaches it, with that section's stage.
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { loadClosedWords } from "../src/closed-words.js";
import { parseOverlayCsv, type OverlayRow } from "../src/lexicon-search.js";
import { overlaySpelling } from "../src/parse/classify.js";
import { pageSections, type Band, type PageSections } from "../src/lint/learning-order.js";
import { lineNumberAt } from "../src/retie/tokens.js";
import { BOUNDARIES, BOUNDARY_COLUMNS, type BoundaryCell, type BoundaryColumn, type NestedKind } from "../src/parse/boundaries.js";
import { DISCOURSE_SLOTS, END_EVENTS, type EndCell, type EndEvent, type SlotId } from "../src/parse/discourse-slots.js";
import { PROFILES, TEXT_ORDER, type FamilyProfile, type MemberProfile } from "../src/parse/scope-profiles.js";
import type { FrameFamily } from "../src/parse/scope.js";
import { pageRelPath } from "../docs/grammar/.vitepress/lib/reading-order.js";
import { grammarFile, readData, REPO_ROOT } from "../src/repo-paths.js";

const grammarDir = join(REPO_ROOT, "docs", "grammar");
const sheetsDir = join(grammarDir, "cheat-sheets");

export const BLOCK_RE = /(<!--\s*generated:\s*([\w-]+)((?:\s+[\w-]+=\S+)*)\s*-->\n)([\s\S]*?)(<!--\s*\/generated\s*-->)/g;

const STAGE: Record<Band, string> = { beginner: "B", intermediate: "I", advanced: "A" };

type Params = Record<string, string[]>;

// ---------------------------------------------------------------- sections

const pageCache = new Map<string, { title: string; sections: PageSections }>();

function page(file: string) {
  if (!pageCache.has(file)) {
    const markdown = readFileSync(grammarFile(file), "utf8");
    const title = /^#\s+(.+?)(?:\s*\{#[^}]+\})?\s*$/m.exec(markdown)?.[1] ?? file;
    pageCache.set(file, { title, sections: pageSections(file, markdown) });
  }
  return pageCache.get(file)!;
}

const plain = (s: string) => s.replace(/[*`]/g, "").replace(/\s*\{#[^}]+\}$/, "").trim();

/** A section's title, its site link (`/page#id`), and its stage letter. */
function sectionRef(anchor: string): { title: string; href: string; stage: string } {
  const [file, id] = anchor.split("#") as [string, string | undefined];
  const p = page(file);
  const section = id ? p.sections.anchors.get(id) : undefined;
  if (id && !section) throw new Error(`anchor ${anchor} lands in no section`);
  const title = !section || section.level <= 2 ? plain(p.title) : plain(section.title);
  const href = `/${file.replace(/\.md$/, "")}${id ? `#${id}` : ""}`;
  return { title, href, stage: section?.band ? STAGE[section.band] : "" };
}

/** `[Section title](/page#id)` and the section's stage letter. */
function sectionCell(anchor: string): { link: string; stage: string } {
  const { title, href, stage } = sectionRef(anchor);
  return { link: `[${title}](${href})`, stage };
}

/** `[text](/page#id)`: a cell that links its own words to the section that states it. */
const linkedText = (text: string, anchor: string) => `[${text}](${sectionRef(anchor).href})`;

/** The latest stage among a row's sections (B before I before A). */
function latestStage(anchors: readonly string[]): string {
  const order = Object.values(STAGE);
  return anchors.map((a) => sectionRef(a).stage).reduce((best, s) => (order.indexOf(s) > order.indexOf(best) ? s : best), "");
}

// ---------------------------------------------------------------- sources

const cell = (s: string) => s.replace(/\|/g, "\\|");

function table(header: string[], rows: string[][]): string {
  const line = (r: string[]) => `| ${r.join(" | ")} |`;
  const rule = `|${header.map((h) => "-".repeat(h.length + 2)).join("|")}|`;
  return [line(header), rule, ...rows.map(line)].join("\n") + "\n";
}

const overlays = () => parseOverlayCsv(readData("lexicon-overlays.csv"));

function overlayRows(params: Params): string {
  const pos = params.pos;
  const kind = params.kind;
  const skip = Number((params.skip ?? ["0"])[0]);
  const takeRaw = params.take?.[0];
  const take = takeRaw == null ? undefined : Number(takeRaw);
  if (!Number.isInteger(skip) || skip < 0) throw new Error(`skip= needs a non-negative integer`);
  if (take != null && (!Number.isInteger(take) || take < 0)) throw new Error(`take= needs a non-negative integer`);
  const rows = overlays()
    .filter((o) => (!pos || pos.includes(o.pos)) && (kind ? kind.includes(o.kind) : o.kind !== "sake"))
    .map((o) => ({ form: overlaySpelling(o), o }))
    .sort((a, b) => a.form.localeCompare(b.form))
    .slice(skip, take == null ? undefined : skip + take);
  return table(
    ["Ageben", "English", "Taught in", "Stage"],
    rows.map(({ form, o }) => {
      const { link, stage } = sectionCell(o.anchor);
      return [`\`${form}\``, cell(o.definition || o.gloss), link, stage];
    }),
  );
}

function sakeRows(): string {
  const byRoot = new Map<string, OverlayRow>();
  for (const o of overlays()) {
    if (o.kind === "sake" && o.pos === "th") byRoot.set(o.senseForm.replace(/[lmnr]$/, ""), o);
  }
  return table(
    ["Serves", "Detracts from", "Sake", "Taught in", "Stage"],
    [...byRoot]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([root, o]) => {
        const { link, stage } = sectionCell(o.anchor);
        return [`\`th${root}tham\``, `\`th${root}thum\``, cell(o.definition.replace(/ sake\b/, "")), link, stage];
      }),
  );
}

/** Kinds of data/closed-words.csv rows the cheat sheets show. */
const SHOWN_CLOSED_KINDS: ReadonlySet<string> = new Set(["pronoun", "linker"]);

function closedWordRows(): string {
  return table(
    ["Ageben", "English", "Taught in", "Stage"],
    loadClosedWords()
      .filter((w) => SHOWN_CLOSED_KINDS.has(w.kind))
      .sort((a, b) => a.form.localeCompare(b.form))
      .map((w) => {
        const { link, stage } = sectionCell(w.anchor);
        return [`\`${w.form}\``, w.english, link, stage];
      }),
  );
}

// ---------------------------------------------------------------- scope

/** Learner names of the frame families that have a profile. */
const FAMILY_NAMES: Partial<Record<FrameFamily, string>> = {
  force: "the act word",
  call: "a call",
  stance: "a stance word",
  hinge: "a *because* or *if* hinge",
  polarity: "*not*",
  mirative: "MIRATIVE",
  attitude: "your attitude",
  sake: "a sake word on the clause",
  contrary: "*contrary to* with its stance",
  say: "a say word",
  holder: "the seam word of a holder",
  intention: "a want, plan, decision, or try",
  ability: "*can*",
  phase: "*already*, *still*, or *yet*",
  residue: "RESIDUE or FORMER",
  notional: "NOTIONAL",
  occasion: "a restrictor",
  binder: "an *every* phrase or a newly mentioned noun",
};

/** Learner names of the profile members a rule names. */
const MEMBER_NAMES: Record<string, string> = {
  repeat: "a doubled act word",
  greeting: "a greeting",
  channel: "a channel",
  "speaker-attitude": "your attitude",
  feeling: "a feeling word",
  aim: "a want, plan, or decision",
  former: "FORMER",
};

function familyName(family: FrameFamily): string {
  const name = FAMILY_NAMES[family];
  if (!name) throw new Error(`no learner name for the frame family \`${family}\` (FAMILY_NAMES)`);
  return name;
}

function memberName(member: MemberProfile): string {
  const name = MEMBER_NAMES[member.id];
  if (!name) throw new Error(`no learner name for the profile member \`${member.id}\` (MEMBER_NAMES)`);
  return name;
}

/** First letter up, past any leading emphasis. */
const cap = (s: string) => s.replace(/^([*_]*)(\p{L})/u, (_, mark: string, letter: string) => mark + letter.toUpperCase());

/** `a, b, or c` */
function orList(items: string[]): string {
  return items.length <= 2 ? items.join(" or ") : `${items.slice(0, -1).join(", ")}, or ${items.at(-1)}`;
}

type RuleRow = { word: string; rule: string; anchors: string[] };

/** A member's own rules: what it claims, what it stays outside of, and its cases against other families. */
function memberRules(m: MemberProfile): RuleRow[] {
  const word = cap(memberName(m));
  const rows: RuleRow[] = [];
  if (m.claims === false) rows.push({ word, rule: "Claims nothing: it takes no carried frame and ends none", anchors: [m.anchor] });
  if (m.escapes?.includes("carried")) rows.push({ word, rule: "Stays yours, outside a carried frame", anchors: [m.anchor] });
  const groups: { order: "commutes" | "over"; anchors: string[]; with: FrameFamily[] }[] = [];
  for (const c of m.cases ?? []) {
    const same = groups.find((g) => g.order === c.order && g.anchors.join() === c.anchors.join());
    if (same) same.with.push(c.with);
    else groups.push({ order: c.order, anchors: [...c.anchors], with: [c.with] });
  }
  for (const g of groups) {
    const others = orList(g.with.map(familyName));
    const rule = g.order === "commutes" ? `Its order with ${others} changes nothing` : `Covers ${others}, wherever it sits`;
    rows.push({ word, rule, anchors: g.anchors });
  }
  return rows;
}

function familyRules(p: FamilyProfile): RuleRow[] {
  const word = cap(familyName(p.family));
  const rows: RuleRow[] = [];
  if (p.order === "covers") rows.push({ word, rule: "Covers its whole clause, wherever it sits", anchors: [p.orderAnchor!] });
  if (p.order === "commutes") rows.push({ word, rule: "Changes nothing claimed, so its place changes nothing", anchors: [p.orderAnchor!] });
  if (p.remark) rows.push({ word, rule: "A remark: stays yours and outside what is asked", anchors: [p.remark] });
  if (p.escapes?.holder) rows.push({ word, rule: "Stays yours under a holder", anchors: [p.escapes.holder] });
  if (p.holderSeam) rows.push({ word, rule: "A holder named on the word covers it, by the word's shape", anchors: [p.holderSeam] });
  if (p.underSeam) rows.push({ word, rule: "Under a holder it is the holder's, and the seam word covers it, before or after", anchors: [p.underSeam] });
  return [...rows, ...(p.members ?? []).flatMap(memberRules)];
}

function profileRows(): string {
  const textOrder = PROFILES.filter((p) => p.order === "text").map((p) => familyName(p.family));
  const rows: RuleRow[] = [
    { word: cap(textOrder.join("; ")), rule: "The earlier covers the later", anchors: [TEXT_ORDER] },
    ...PROFILES.flatMap(familyRules),
  ];
  return table(
    ["Word", "Rule", "Taught in", "Stage"],
    rows.map((r) => [r.word, r.rule, r.anchors.map((a) => sectionCell(a).link).join(", "), latestStage(r.anchors)]),
  );
}

/** Learner names of the boxes (kinds of nested reading). */
const BOX_NAMES: Record<NestedKind, string> = {
  member: "A clause in a join",
  standInDependent: "A dependent a stand-in names",
  slotDependent: "A dependent in a slot",
  grounds: "The next sentence, when a stand-in points to it",
  island: "An island, or a verb-list item with words of its own",
  quote: "A quote",
  aside: "An aside",
};

/** Short learner headers of the boundary columns, in the table's column order. */
const BOUNDARY_HEADERS: Record<BoundaryColumn, string> = {
  outerFrames: "Framing words around it",
  holder: "Holder around it",
  carryStart: "A channel in it starts your frame",
  carryEnd: "A frame in it ends yours",
  carried: "Your carried frame",
  binder: "*Every* phrase, new noun",
  boundTag: "Bound tag",
  tone: "Tone mark at the start",
};

/** `yes` / `no` linked to the section that states it; a dash where no page states it yet. */
function verdictCell(verdict: string, anchor: string, words: Record<string, string>): string {
  return verdict === "unstated" ? "—" : linkedText(words[verdict]!, anchor);
}

function boundaryRows(): string {
  const columns = Object.keys(BOUNDARY_COLUMNS) as BoundaryColumn[];
  return table(
    ["Box", ...columns.map((c) => BOUNDARY_HEADERS[c]), "Stage"],
    BOUNDARIES.map((row) => {
      const cells: BoundaryCell[] = columns.map((c) => row.cells[c]);
      const anchors = cells.map((c) => c.anchor).filter(Boolean);
      return [BOX_NAMES[row.kind], ...cells.map((c) => verdictCell(c.verdict, c.anchor, { passes: "yes", blocks: "no" })), latestStage(anchors)];
    }),
  );
}

/** Learner names of the slots and of what reads each. */
const SLOT_NAMES: Record<SlotId, { what: string; readBy: string }> = {
  carriedFrame: { what: "Your frame: a channel, a holder, or NOTIONAL", readBy: "Your later statements with no frame of their own" },
  topic: { what: "The topic", readBy: "A topic pronoun" },
  standInBack: { what: "The latest content of each kind", readBy: "A stand-in on `-rth`" },
  hookResume: { what: "The latest landmark", readBy: "A hook on `-r`" },
  supposition: { what: "The NOTIONAL supposition", readBy: "A question with NOTIONAL" },
  sentenceBefore: { what: "The sentence before", readBy: "A sentence linker, a discourse hook, or a polar word" },
  answer: { what: "A question's blank", readBy: "The sentence right after the question" },
};

const EVENT_NAMES: Record<EndEvent, string> = {
  newValue: "a new one",
  statementWord: "a written statement word",
  byTheWay: "*by the way*",
  goodbye: "a goodbye",
};

/**
 * An event that ends the value, linked. A goodbye whose own sentence no page states yet says only that it ends the
 * value for the sentences after it; an unstated cell says no page states it yet.
 */
function endCell(event: EndEvent, cell: EndCell): string | undefined {
  const name = EVENT_NAMES[event];
  if (cell.verdict === "unstated") return `${name} (no page says yet)`;
  if (cell.verdict === "keeps") return undefined;
  if (cell.eventSentence) return linkedText(`${name}, for the sentences after it`, cell.anchor);
  return linkedText(cell.everyone ? `${name} by either speaker` : name, cell.anchor);
}

function slotRows(): string {
  const events = Object.keys(END_EVENTS) as EndEvent[];
  return table(
    ["What carries", "Read by", "Ends with", "Speakers", "Into a quote", "Into an aside", "Stage"],
    DISCOURSE_SLOTS.map((row) => {
      const names = SLOT_NAMES[row.id];
      const ends = events.map((e) => endCell(e, row.endedBy[e])).filter((c): c is string => c !== undefined);
      const anchors = [...events.map((e) => row.endedBy[e].anchor), row.kept.anchor, row.quote.anchor, row.aside.anchor].filter(Boolean);
      return [
        names.what,
        names.readBy,
        ends.join(", "),
        verdictCell(row.kept.verdict, row.kept.anchor, { speaker: "each their own", shared: "shared" }),
        verdictCell(row.quote.verdict, row.quote.anchor, { passes: "yes", blocks: "no" }),
        verdictCell(row.aside.verdict, row.aside.anchor, { passes: "yes", blocks: "no" }),
        latestStage(anchors),
      ];
    }),
  );
}

const SOURCES: Record<string, (params: Params) => string> = {
  overlays: overlayRows,
  sakes: sakeRows,
  "closed-words": closedWordRows,
  "scope-profiles": profileRows,
  boundaries: boundaryRows,
  "discourse-slots": slotRows,
};

// ---------------------------------------------------------------- main

function parseParams(text: string): Params {
  const out: Params = {};
  for (const m of text.matchAll(/([\w-]+)=(\S+)/g)) out[m[1]!] = m[2]!.split("|");
  return out;
}

function sheetFiles(): string[] {
  return readdirSync(sheetsDir).filter((f) => f.endsWith(".md"));
}

/** `--print SOURCE [key=value …]`: one source's table on stdout; nothing is written. */
function printSource(source: string | undefined, paramText: string): void {
  const make = source ? SOURCES[source] : undefined;
  if (!make) {
    console.error(`--print needs a source (known: ${Object.keys(SOURCES).join(", ")})`);
    process.exitCode = 1;
    return;
  }
  process.stdout.write(make(parseParams(paramText)));
}

function refreshSheets(): void {
  const write = process.argv.includes("--write");
  const problems: string[] = [];
  let blocks = 0;

  for (const file of sheetFiles()) {
    const path = join(sheetsDir, file);
    const markdown = readFileSync(path, "utf8");
    if (!markdown.includes("<!-- generated:")) continue;
    let stale = false;
    const next = markdown.replace(BLOCK_RE, (whole, open: string, source: string, paramText: string, body: string, close: string, index: number) => {
      blocks++;
      const where = `${file}:${lineNumberAt(markdown, index)}`;
      const make = SOURCES[source];
      if (!make) {
        problems.push(`${where}: unknown generated source \`${source}\` (known: ${Object.keys(SOURCES).join(", ")})`);
        return whole;
      }
      let fresh: string;
      try {
        fresh = make(parseParams(paramText));
      } catch (e) {
        problems.push(`${where}: ${(e as Error).message}`);
        return whole;
      }
      if (fresh === body) return whole;
      stale = true;
      if (!write) problems.push(`${where}: generated \`${source}\` block is stale`);
      return open + fresh + close;
    });
    if (stale && write) {
      writeFileSync(path, next);
      console.log(`refreshed ${file}`);
    }
  }

  if (problems.length) {
    console.error(`Cheat sheet generated blocks (${problems.length}):`);
    for (const p of problems) console.error(`  ${p}`);
    if (!write) console.error("Run `npm run cheat-sheet-blocks -- --write` to refresh.");
    process.exitCode = 1;
  } else {
    console.log(`OK: ${blocks} generated cheat sheet block(s) ${write ? "written" : "up to date"}.`);
  }
}

const printAt = process.argv.indexOf("--print");
if (printAt >= 0) printSource(process.argv[printAt + 1], process.argv.slice(printAt + 2).join(" "));
else refreshSheets();
