/**
 * The meaning view (docs/meta/realizer.md#meaning-view): every doc example projects without a parse-tree word in it,
 * each term kind and link kind projects its meaning fields, and the realizer's files import only what the view allows.
 */
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";

import { loadDefaultTables, parse } from "../parse/index.js";
import { buildExampleIndex } from "../parse/llm-examples.js";
import { buildLog, readQuestion } from "../interpret/log.js";
import { allReadings, readParse } from "../interpret/read.js";
import type { Detail, Frame, Link, LinkKind, Reading, Term } from "../interpret/types.js";
import { Projector, project, type MeaningLink, type MeaningReading, type MeaningTerm } from "./meaning.js";

const here = dirname(fileURLToPath(import.meta.url));
const rootDir = join(here, "..", "..");

// ── Corpus ──

/** One doc example with its readings (as the reader sweep reads them) and their projection. */
type CorpusEntry = { ageben: string; source: string; readings: Reading[]; meanings: MeaningReading[] };

let corpusCache: { entries: CorpusEntry[]; failures: string[] } | undefined;

/** Every doc example, read and projected once per test run. */
function corpus(): { entries: CorpusEntry[]; failures: string[] } {
  if (corpusCache) return corpusCache;
  const tables = loadDefaultTables();
  const entries: CorpusEntry[] = [];
  const failures: string[] = [];
  for (const example of buildExampleIndex(join(rootDir, "docs", "grammar"), tables)) {
    let readings: Reading[];
    try {
      readings = readParse(parse(example.ageben, tables), { tables, text: example.source });
    } catch {
      continue; // The reader sweep reports these.
    }
    try {
      entries.push({ ageben: example.ageben, source: example.source, readings, meanings: project(readings, tables) });
    } catch (error) {
      failures.push(`${example.source} ${example.ageben}: ${(error as Error).message}`);
    }
  }
  corpusCache = { entries, failures };
  return corpusCache;
}

/** Every object and array reachable from `root`, each once (the view shares objects). */
function reachable(root: unknown): object[] {
  const out: object[] = [];
  const seen = new Set<object>();
  const visit = (value: unknown): void => {
    if (value === null || typeof value !== "object" || seen.has(value)) return;
    seen.add(value);
    out.push(value);
    for (const child of Array.isArray(value) ? value : Object.values(value)) visit(child);
  };
  visit(root);
  return out;
}

/** Every term in a reading and the readings nested in it: claim, lists, details, frames, stance lists, links, antecedents. */
function termsIn(readings: Reading[]): Term[] {
  const out: Term[] = [];
  const seen = new Set<object>();
  const term = (t: Term | undefined): void => {
    if (!t || seen.has(t)) return;
    seen.add(t);
    out.push(t);
    if (t.kind === "list") {
      t.members.forEach(term);
      t.sharedDetails?.forEach(detail);
      if (t.bound) detail(t.bound);
    }
    if (t.kind === "pronoun") term(t.antecedent);
    if ("details" in t) t.details?.forEach(detail);
    if ("frames" in t) t.frames?.forEach(frame);
  };
  const detail = (d: Detail): void => {
    if (seen.has(d)) return;
    seen.add(d);
    term(d.hosted);
    d.details?.forEach(detail);
    d.frames?.forEach(frame);
  };
  const frame = (f: Frame): void => {
    if (seen.has(f)) return;
    seen.add(f);
    term(f.party);
    term(f.hosted);
    f.inner?.forEach(frame);
    f.details?.forEach(detail);
  };
  for (const reading of allReadings(readings)) {
    const claim = reading.claim;
    [claim.verb, ...Object.values(claim.roles), ...claim.predicate, claim.clauses].forEach(term);
    claim.details.forEach(detail);
    reading.frames.forEach(frame);
    for (const link of reading.links) link.partners?.forEach(term);
  }
  return out;
}

/** The first doc example term that passes `pick`, with its example. */
function firstTerm(pick: (term: Term) => boolean): { entry: CorpusEntry; term: Term } | undefined {
  for (const entry of corpus().entries) {
    const term = termsIn(entry.readings).find(pick);
    if (term) return { entry, term };
  }
  return undefined;
}

/**
 * A link no doc example holds, from a log: a question's supposition link reaches back to a sentence stated earlier in
 * the log, and a doc example is read on its own.
 */
function logLink(kind: LinkKind): { entry: CorpusEntry; link: Link } | undefined {
  if (kind !== "supposition") return undefined;
  const tables = loadDefaultTables();
  const question = "yel zazozon theyum vowurol.";
  const readings = readQuestion(buildLog([{ speaker: "A", at: 0, text: "zazozon theyum vowurol." }], tables), question, tables);
  const link = readings[0]?.links.find((candidate) => candidate.kind === kind);
  return link && { entry: { ageben: question, source: "log", readings, meanings: project(readings, tables) }, link };
}

/** The first doc example link of a kind, with its example. */
function firstLink(kind: LinkKind): { entry: CorpusEntry; link: Link } | undefined {
  for (const entry of corpus().entries) {
    for (const reading of allReadings(entry.readings)) {
      const link = reading.links.find((candidate) => candidate.kind === kind);
      if (link) return { entry, link };
    }
  }
  return undefined;
}

// ── Import allowlist ──

type ImportStatement = { from: string; names: string[]; typeOnly: boolean };

/** The static and dynamic imports and re-exports in a source file. */
function importsOf(source: string): ImportStatement[] {
  const out: ImportStatement[] = [];
  const statement = /^\s*(?:import|export)\s+(type\s+)?([^;]*?)\s+from\s+["']([^"']+)["']/gm;
  for (const match of source.matchAll(statement)) {
    const clause = match[2]!;
    const braced = /\{([^}]*)\}/.exec(clause)?.[1] ?? "";
    const specifiers = braced.split(",").map((part) => part.trim()).filter(Boolean);
    const outside = clause.replace(/\{[^}]*\}/, "").replace(/,/g, " ").trim();
    const names = [...specifiers.map((part) => part.replace(/^type\s+/, "").split(/\s+as\s+/)[0]!), ...(outside ? [outside] : [])];
    const typeOnly = Boolean(match[1]) || (!outside && specifiers.length > 0 && specifiers.every((part) => part.startsWith("type ")));
    out.push({ from: match[3]!, names, typeOnly });
  }
  for (const match of source.matchAll(/^\s*import\s+["']([^"']+)["']/gm)) out.push({ from: match[1]!, names: [], typeOnly: false });
  for (const match of source.matchAll(/\b(?:import|require)\s*\(\s*["']([^"']+)["']/g)) out.push({ from: match[1]!, names: ["*"], typeOnly: false });
  return out;
}

/**
 * What a realizer file may import, by repo path: the view's inputs, the lexicon tables and the spelling path
 * (docs/meta/realizer.md#meaning-view). `names` limits a value import; `typeOnly` allows only `import type`.
 */
const REALIZE_IMPORTS: Readonly<Record<string, { typeOnly?: true; names?: readonly string[]; typeNames?: readonly string[] }>> = {
  "src/interpret/types.ts": { typeOnly: true },
  "src/interpret/read.ts": {},
  "src/parse/classify.ts": { typeOnly: true },
  "src/lexicon-search.ts": { typeOnly: true },
  "src/lexicon-compounds.ts": { typeOnly: true },
  "src/closed-roots.ts": {},
  "src/parse/gloss-inverse.ts": {},
  "src/interpret/reply.ts": { names: ["spell", "checkLine"], typeNames: ["Draft", "LineCheck"] },
};

/** Files under `src/realize/` the allowlist does not cover: the door itself. Test files are exempt too. */
const REALIZE_EXEMPT: ReadonlySet<string> = new Set(["meaning.ts"]);

/** The imports of one realizer file the allowlist refuses, one line each. */
function refusedImports(file: string, source: string): string[] {
  const out: string[] = [];
  for (const statement of importsOf(source)) {
    const target = statement.from.startsWith(".") ? relative(rootDir, resolve(dirname(file), statement.from)).replace(/\.js$/, ".ts") : statement.from;
    if (dirname(target) === "src/realize") continue;
    const rule = REALIZE_IMPORTS[target];
    const say = (why: string): number => out.push(`${relative(rootDir, file)}: ${statement.from} ${why}`);
    if (!rule) say("is not on the realizer's import allowlist");
    else if (rule.typeOnly && !statement.typeOnly) say("may be imported as types only");
    else if (rule.names && !statement.typeOnly) {
      const typeNames = new Set(rule.typeNames ?? []);
      const extra = statement.names.filter((name) => !rule.names!.includes(name) && !typeNames.has(name));
      if (extra.length) say(`may give only ${[...rule.names, ...typeNames].join(", ")}, not ${extra.join(", ")}`);
    } else if (rule.names && statement.typeOnly) {
      const extra = statement.names.filter((name) => !(rule.typeNames ?? []).includes(name));
      if (extra.length) say(`may give only the types ${(rule.typeNames ?? []).join(", ")}, not ${extra.join(", ")}`);
    }
  }
  return out;
}

// ── Tests ──

describe("meaning view", () => {
  it("projects every doc example, with no parse-tree word in the view", () => {
    const { entries, failures } = corpus();
    assert.ok(entries.length > 500, `only ${entries.length} examples`);
    assert.deepEqual(failures, [], "examples whose readings did not project");
    const withRaw: string[] = [];
    for (const entry of entries) if (reachable(entry.meanings).some((value) => !Array.isArray(value) && "raw" in value)) withRaw.push(`${entry.source} ${entry.ageben}`);
    assert.deepEqual(withRaw.slice(0, 10), [], `${withRaw.length} examples hold an object with a \`raw\` field`);
  });

  it("keeps each unordered pair in text order", () => {
    for (const entry of corpus().entries) {
      for (const [reading, meaning] of allReadings(entry.readings).map((r) => [r, viewOf(entry, r)] as const)) {
        for (const [a, b] of meaning.unordered) {
          const at = (index: number): number => reading.frames[index]!.words[0]?.at ?? Infinity;
          assert.ok(at(a) <= at(b), `${entry.source} ${entry.ageben}: unordered pair out of text order`);
        }
      }
    }
  });

  const tables = loadDefaultTables();
  const termKinds: { kind: Term["kind"]; check: (term: Term, view: MeaningTerm) => void }[] = [
    {
      kind: "thing",
      check: (term, view) => {
        const t = term as Extract<Term, { kind: "thing" }>;
        const v = view as Extract<MeaningTerm, { kind: "thing" }>;
        assert.equal(v.named, t.named);
        assert.equal(v.name, t.named ? t.root : undefined);
        const family = t.head.family;
        if (family.kind === "content" && family.roots.join("") === t.root && family.roots.every((root) => tables.published.get(root)?.concrete)) {
          if (family.roots.length === 1 || !tables.compounds.get(t.root)?.concrete) assert.deepEqual(v.stem, [family.roots.map((root) => ({ sense: tables.published.get(root)!.concrete }))]);
        }
      },
    },
    { kind: "speaker", check: () => {} },
    { kind: "listener", check: () => {} },
    { kind: "we", check: () => {} },
    {
      kind: "pronoun",
      check: (term, view) => {
        const t = term as Extract<Term, { kind: "pronoun" }>;
        const v = view as Extract<MeaningTerm, { kind: "pronoun" }>;
        assert.equal(v.sort, t.sort);
        assert.equal(v.bind, t.bind?.kind);
        assert.equal(v.antecedent?.kind, t.antecedent?.kind);
      },
    },
    { kind: "blank", check: () => {} },
    { kind: "literal", check: (term, view) => assert.equal((view as { payload: string }).payload, (term as { payload: string }).payload) },
    { kind: "number", check: (term, view) => assert.deepEqual((view as { stem: unknown }).stem, (term as { stem: unknown }).stem) },
    {
      kind: "list",
      check: (term, view) => {
        const t = term as Extract<Term, { kind: "list" }>;
        const v = view as Extract<MeaningTerm, { kind: "list" }>;
        assert.deepEqual(v.members.map((m) => m.kind), t.members.map((m) => m.kind));
        assert.deepEqual(v.parts.map((p) => p.members.length), t.parts.map((p) => p.members.length));
        assert.deepEqual(v.shared, t.shared.map((record) => ({ role: record.role })));
        assert.deepEqual(v.values, t.values);
      },
    },
    { kind: "clause", check: (term, view) => assert.equal((view as { reading: MeaningReading }).reading.id, (term as { reading: Reading }).reading.id) },
    { kind: "quote", check: (term, view) => assert.deepEqual((view as { readings: MeaningReading[] }).readings.map((r) => r.id), (term as { readings: Reading[] }).readings.map((r) => r.id)) },
  ];
  for (const { kind, check } of termKinds) {
    it(`projects a ${kind} term`, () => {
      const found = firstTerm((term) => term.kind === kind);
      assert.ok(found, `no doc example has a ${kind} term`);
      const view = new Projector(tables).term(found.term);
      assert.equal(view.kind, kind);
      const sourceDetails = "details" in found.term ? found.term.details : undefined;
      assert.equal("details" in view ? view.details?.length : undefined, sourceDetails?.length);
      check(found.term, view);
      assert.ok(!reachable(view).some((value) => !Array.isArray(value) && "raw" in value), `${found.entry.source}: a word in the view`);
    });
  }

  const linkKinds: LinkKind[] = ["anaphor", "linker", "discourse", "hookResume", "standIn", "standInBack", "shared", "verbShared", "pairing", "answer", "polar", "tag", "topic", "grounds", "carriedFrame", "supposition"];
  for (const kind of linkKinds) {
    it(`projects a ${kind} link`, () => {
      const found = firstLink(kind) ?? logLink(kind);
      assert.ok(found, `no doc example has a ${kind} link`);
      const link = found.link;
      const view: MeaningLink = new Projector(tables).link(link);
      assert.equal(view.kind, link.kind);
      assert.equal(view.key, link.key);
      assert.equal(view.to, link.to);
      assert.deepEqual(view.values, link.values);
      assert.equal(view.bind, link.bind?.kind);
      assert.deepEqual(view.shared, link.shared && { role: link.shared.role });
      assert.equal(view.answer?.blanks, link.answer?.blanks.length);
      assert.equal(view.answer?.askIndex, link.answer?.askIndex);
      assert.equal(view.frame?.key, link.frame?.key);
      assert.deepEqual(view.coveredBy?.map((f) => f.key), link.coveredBy?.map((f) => f.key));
      assert.deepEqual(view.partners?.map((p) => p.kind), link.partners?.map((p) => p.kind));
      assert.equal(view.resumed?.key, link.resumed?.key);
      assert.ok(!reachable(view).some((value) => !Array.isArray(value) && "raw" in value), `${found.entry.source}: a word in the view`);
    });
  }

  it("refuses a realizer import off the allowlist", () => {
    const file = join(here, "probe.ts");
    assert.deepEqual(
      refusedImports(
        file,
        [
          'import type { Reading } from "../interpret/types.js";',
          'import { readText } from "../interpret/read.js";',
          'import { spell, type Draft } from "../interpret/reply.js";',
          'import type { ClassifyTables } from "../parse/classify.js";',
          'import { project } from "./meaning.js";',
        ].join("\n"),
      ),
      [],
    );
    assert.equal(refusedImports(file, 'import { morphGlossFor } from "../parse/morph-gloss.js";').length, 1);
    assert.equal(refusedImports(file, 'import { sameReadings } from "../interpret/types.js";').length, 1);
    assert.equal(refusedImports(file, 'import { answerLeaf } from "../interpret/reply.js";').length, 1);
    assert.equal(refusedImports(file, 'const m = await import("../parse/index.js");').length, 1);
  });

  it("realizer files import only the view's inputs, lexicon tables and the spelling path", () => {
    const files = readdirSync(here).filter((name) => name.endsWith(".ts") && !name.endsWith(".test.ts") && !REALIZE_EXEMPT.has(name));
    const refused = files.flatMap((name) => refusedImports(join(here, name), readFileSync(join(here, name), "utf8")));
    assert.deepEqual(refused, []);
  });
});

/** The projection of one of an example's readings (nested ones included), by id. */
function viewOf(entry: CorpusEntry, reading: Reading): MeaningReading {
  const all = reachable(entry.meanings).filter((value): value is MeaningReading => !Array.isArray(value) && "claim" in value && "id" in value);
  const view = all.find((candidate) => candidate.id === reading.id);
  assert.ok(view, `${entry.source}: no view for ${reading.id}`);
  return view;
}
