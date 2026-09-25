/**
 * Check Agalan words in docs/grammar/ code spans: they must parse, and
 * content / x-family host roots must be in the lexicon.
 *
 * Morph-gloss pairs (example blockquotes, Morph-column tables, and visible
 * morph lines in translation-exercise spoilers) are compared to the parser.
 * Teach blocks and exercises with loose English must include a morph unless
 * parser output is trivially redundant with that loose line.
 * Translation **Roots used here** English is checked against the lexicon.
 * On the number pages, shorthand number examples need a
 * pronunciation row that matches the spoken form computed from the shorthand.
 * Mismatches, leftover ambiguity, and missing morph glosses fail the run.
 * Findings print to stdout. Each file logs morph coverage counts.
 *
 * Run: npm run lint:agalan
 *      npm run lint:agalan -- [paths...] [--check-ambiguity] [--order-report]
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { basename, dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { emptySpanStats, lintAgalanMarkdown, lintAgalanSpans } from "../src/lint/agalan-docs.js";
import {
  formatMorphGlossFinding,
  lintMorphGlossMarkdown,
} from "../src/lint/morph-gloss-docs.js";
import {
  formatWordBankFinding,
  lintWordBankMarkdown,
} from "../src/lint/word-bank-docs.js";
import {
  parseOverlayCsv,
  parsePublishedCsv,
  validateOverlayPublishedHosts,
} from "../src/lexicon-search.js";
import {
  formatNumberSpeechFinding,
  lintNumberSpeechMarkdown,
  NUMBER_SPEECH_FILES,
} from "../src/lint/number-speech-docs.js";
import {
  anchorLinks,
  formatSection,
  learningOrder,
  pageSections,
  resolveAnchor,
  sectionAt,
  sidebarPage,
  type LearningOrder,
  type PageSections,
  type Section,
  withinSection,
} from "../src/lint/learning-order.js";
import { duplicateIds } from "../src/lint/grammar-anchors.js";
import { CONSTRUCTIONS as STATIC_CONSTRUCTIONS, constructionRegistry } from "../src/parse/constructions.js";
import { readingOrder } from "../docs/grammar/.vitepress/lib/reading-order.js";
import { loadDefaultTables } from "../src/parse/index.js";

/**
 * Static registry plus one `overlay.*` entry per closed overlay row. Overlay rows
 * are checked only by the report-only learning-order check until it is enforced
 * (docs/proposals/learning-order-check.md phase 7); the page-level coverage check
 * covers the static registry.
 */
const CONSTRUCTIONS = constructionRegistry(loadDefaultTables().overlays.values());
import { lineNumberAt } from "../src/retie/tokens.js";

const rootDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const grammarDir = join(rootDir, "docs", "grammar");

function listGrammarMarkdown(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    if (name === ".vitepress" || name === "public") {
      continue;
    }
    const full = join(dir, name);
    if (statSync(full).isDirectory()) {
      out.push(...listGrammarMarkdown(full));
    } else if (name.endsWith(".md")) {
      out.push(full);
    }
  }
  return out.sort();
}

function parseCli(argv: string[]): { paths: string[]; orderReport: boolean } {
  const paths: string[] = [];
  let orderReport = false;
  for (const arg of argv) {
    if (arg === "--help" || arg === "-h") {
      console.error(`Usage: npm run lint:agalan -- [paths...] [--check-ambiguity]

Checks backticked and fenced Agalan words under docs/grammar/.
Morph-gloss mismatches, leftover ambiguity, missing morph glosses, coverage
gaps, and translation word-bank English/lexicon mismatches fail.
--check-ambiguity is always on for the corpus (flag kept for callers).
--order-report lists every learning-order finding (the default prints counts).`);
      process.exit(0);
    }
    if (arg === "--check-ambiguity") {
      continue;
    }
    if (arg === "--order-report") {
      orderReport = true;
      continue;
    }
    if (arg.startsWith("-")) {
      console.error(`Unknown flag: ${arg}`);
      process.exit(2);
    }
    paths.push(arg);
  }
  return { paths, orderReport };
}

function resolveTargets(paths: string[]): string[] {
  if (paths.length === 0) {
    return listGrammarMarkdown(grammarDir);
  }
  const out: string[] = [];
  for (const arg of paths) {
    const full = resolve(arg);
    const info = statSync(full);
    if (info.isDirectory()) {
      out.push(...listGrammarMarkdown(full));
    } else {
      out.push(full);
    }
  }
  return out;
}

function lintOverlayHosts(): number {
  const published = parsePublishedCsv(
    readFileSync(join(rootDir, "data", "lexicon-published.csv"), "utf8"),
  );
  const overlays = parseOverlayCsv(
    readFileSync(join(rootDir, "data", "lexicon-overlays.csv"), "utf8"),
  );
  const errors = validateOverlayPublishedHosts(overlays, published);
  if (errors.length === 0) {
    return 0;
  }
  console.error(`lexicon-overlays.csv: ${errors.length} hosted overlay(s) without a published root`);
  for (const err of errors) {
    console.error(`  row ${err.row ?? "?"} ${err.senseForm}: ${err.reason}`);
  }
  return errors.length;
}

type ConstructionUse = { id: string; section: Section };

/**
 * Check 2 of docs/proposals/parser-strictness.md: every construction is used by
 * an example on the page its anchor names. Returns the number of gaps.
 */
function checkConstructionCoverage(uses: readonly ConstructionUse[]): number {
  const unexercised: string[] = [];
  for (const [id, entry] of STATIC_CONSTRUCTIONS) {
    const page = entry.anchor.split("#")[0]!;
    if (uses.some((u) => u.id === id && u.section.page === page)) continue;
    const elsewhere = [...new Set(uses.filter((u) => u.id === id).map((u) => u.section.page))];
    const where = elsewhere.length > 0 ? `used on ${elsewhere.join(", ")}` : "used on no page";
    unexercised.push(`  ${id}  →  ${entry.anchor}  (${where}; ${entry.summary})`);
  }
  if (unexercised.length === 0) return 0;
  console.error(
    `\n${unexercised.length} construction(s) not exercised by their anchor page. ` +
      "Add a teach example on that page, or narrow or delete the production:",
  );
  for (const line of unexercised) console.error(line);
  return unexercised.length;
}

/**
 * Report-only (phase 1): uses and links that reach past the current section in
 * the learning order. Prints a summary; `--order-report` prints every finding.
 */
function reportLearningOrder(order: LearningOrder, allUses: readonly ConstructionUse[], full: boolean): void {
  // Pages off the sidebar and `## See also` sections are not checked.
  const checked = (s: Section) => order.readingOrder.includes(s.page) && !s.ignored;
  const uses = allUses.filter((u) => checked(u.section));
  const homes = new Map<string, Section | undefined>();
  for (const [id, entry] of CONSTRUCTIONS) homes.set(id, resolveAnchor(order, entry.anchor));

  const unresolved = [...homes].filter(([, h]) => !h).map(([id]) => `  ${id}  →  ${CONSTRUCTIONS.get(id)!.anchor}`);
  const unbandedHomes = [...homes].filter(([, h]) => h && h.position === undefined).map(([id, h]) => `  ${id}  →  ${formatSection(h!)}`);

  // Taught at home: some span in the home heading's subtree traces the construction.
  const notAtHome: string[] = [];
  for (const [id, home] of homes) {
    if (!home || uses.some((u) => u.id === id && withinSection(home, u.section))) continue;
    const elsewhere = [...new Set(uses.filter((u) => u.id === id).map((u) => formatSection(u.section)))];
    const where = elsewhere.length > 0 ? `used in ${elsewhere.slice(0, 3).join(", ")}${elsewhere.length > 3 ? ", …" : ""}` : "used nowhere";
    notAtHome.push(`  ${id}  →  ${formatSection(home)}  (${where})`);
  }

  const forward = new Map<string, { home: Section; sections: Set<string> }>();
  const unbandedUses = new Map<string, number>();
  for (const u of uses) {
    const home = homes.get(u.id);
    if (!home || home.position === undefined) continue;
    if (u.section.position === undefined) {
      const key = formatSection(u.section);
      unbandedUses.set(key, (unbandedUses.get(key) ?? 0) + 1);
      continue;
    }
    if (home.position <= u.section.position) continue;
    let f = forward.get(u.id);
    if (!f) forward.set(u.id, (f = { home, sections: new Set() }));
    f.sections.add(formatSection(u.section));
  }

  const links: string[] = [];
  for (const ps of order.pages.values()) {
    if (!order.readingOrder.includes(ps.page)) continue;
    const markdown = pageMarkdown.get(ps.page)!;
    for (const link of anchorLinks(ps.page, markdown)) {
      const from = sectionAt(ps.sections, link.index);
      const to = resolveAnchor(order, `${link.page}#${link.anchor}`);
      if (from.ignored || from.position === undefined || to?.position === undefined || to.position <= from.position) continue;
      links.push(`  ${ps.page}:${lineNumberAt(markdown, link.index)}  ${formatSection(from)}  →  ${formatSection(to)}`);
    }
  }

  const forwardUses = [...forward.values()].reduce((n, f) => n + f.sections.size, 0);
  const unbandedCount = [...unbandedUses.values()].reduce((n, c) => n + c, 0);
  console.log(
    `\nLearning order (report only): ${forward.size} construction(s) used before their home section ` +
      `(${forwardUses} section use(s)); ${links.length} forward link(s); ` +
      `${notAtHome.length} construction(s) not taught in their home section; ` +
      `${unresolved.length + unbandedHomes.length} home anchor(s) unresolved or outside every band; ` +
      `${unbandedCount} use(s) outside every band.` +
      (full ? "" : " Run with --order-report for details."),
  );
  if (!full) return;
  if (unresolved.length > 0) {
    console.log("\nHome anchors that do not resolve:");
    for (const line of unresolved) console.log(line);
  }
  if (unbandedHomes.length > 0) {
    console.log("\nHome anchors outside every band:");
    for (const line of unbandedHomes) console.log(line);
  }
  if (notAtHome.length > 0) {
    console.log("\nConstructions not taught in their home section:");
    for (const line of notAtHome) console.log(line);
  }
  if (unbandedUses.size > 0) {
    console.log("\nUses outside every band (section: construction uses):");
    for (const [key, n] of unbandedUses) console.log(`  ${key}: ${n}`);
  }
  if (forward.size > 0) {
    console.log("\nConstructions used before their home section (home, then earlier sections that use it):");
    const rows = [...forward].sort(([, a], [, b]) => a.home.position! - b.home.position!);
    for (const [id, f] of rows) {
      console.log(`  ${id}  →  ${formatSection(f.home)}`);
      for (const s of f.sections) console.log(`      ${s}`);
    }
  }
  if (links.length > 0) {
    console.log("\nForward links:");
    for (const line of links) console.log(line);
  }
}

const pageMarkdown = new Map<string, string>();

function main(): void {
  const { paths, orderReport } = parseCli(process.argv.slice(2));
  const hostIssues = lintOverlayHosts();
  const files = resolveTargets(paths);
  const tables = loadDefaultTables();
  let count = 0;
  let morphCount = 0;
  let morphChecked = 0;
  let morphWithLoose = 0;
  let morphRedundantOmitted = 0;
  let bankCount = 0;
  let speechCount = 0;
  let spanCount = 0;
  let duplicateIdCount = 0;
  const spanStats = emptySpanStats();
  const pages = new Map<string, PageSections>();
  const uses: ConstructionUse[] = [];

  for (const file of files) {
    const original = readFileSync(file, "utf8");
    const rel = relative(rootDir, file);
    const issues = lintAgalanMarkdown(original, tables);
    for (const issue of issues) {
      count += 1;
      const line = lineNumberAt(original, issue.index);
      const label = issue.kind === "parse" ? "does not parse" : "unknown root";
      console.error(`${rel}:${line}  \`${issue.token}\`  ${label}  (${issue.detail})`);
    }

    let used: ((id: string, index: number) => void) | undefined;
    if (dirname(file) === grammarDir) {
      for (const id of duplicateIds(original)) {
        duplicateIdCount += 1;
        console.error(`${rel}  #${id}  id is used more than once on the page (headings and <a id> share one namespace)`);
      }
      const ps = pageSections(basename(file), original);
      pages.set(ps.page, ps);
      pageMarkdown.set(ps.page, original);
      used = (id, index) => uses.push({ id, section: sectionAt(ps.sections, index) });
    }
    for (const issue of lintAgalanSpans(original, tables, spanStats, used)) {
      spanCount += 1;
      const line = lineNumberAt(original, issue.index);
      console.error(`${rel}:${line}  \`${issue.text}\`  ${issue.kind}  (${issue.detail})`);
    }

    const morphResult = lintMorphGlossMarkdown(original, tables);
    morphChecked += morphResult.checked;
    morphWithLoose += morphResult.withLooseEnglish;
    morphRedundantOmitted += morphResult.redundantOmitted;
    const cov = morphResult.withLooseEnglish
      ? `${morphResult.comparedWithLoose} checked, ${morphResult.redundantOmitted} redundant-omitted / ${morphResult.withLooseEnglish} with loose English; `
      : "";
    console.log(`${rel}: ${cov}${morphResult.checked} morph gloss(es) compared to parser`);
    for (const finding of morphResult.findings) {
      morphCount += 1;
      console.log(formatMorphGlossFinding(rel, finding));
    }

    const bankFindings = lintWordBankMarkdown(original, tables);
    for (const finding of bankFindings) {
      bankCount += 1;
      console.log(formatWordBankFinding(rel, finding));
    }

    if (dirname(file) === grammarDir && NUMBER_SPEECH_FILES.includes(basename(file))) {
      for (const finding of lintNumberSpeechMarkdown(original)) {
        speechCount += 1;
        console.log(formatNumberSpeechFinding(rel, finding));
      }
    }
  }

  let coverageCount = 0;
  if (paths.length === 0) {
    const order = learningOrder(readingOrder.map((item) => sidebarPage(item.link)), pages);
    coverageCount = checkConstructionCoverage(uses);
    reportLearningOrder(order, uses, orderReport);
  }

  if (count > 0) {
    console.error(`\n${count} Agalan word issue(s) in docs/grammar/.`);
  }
  if (spanCount > 0) {
    console.error(`\n${spanCount} Agalan sentence / span issue(s) in docs/grammar/.`);
  }
  if (duplicateIdCount > 0) {
    console.error(
      `\n${duplicateIdCount} duplicate id(s). Give each heading a unique id (rename it, or pin one with {#id}); drop an <a id> that repeats its heading's id.`,
    );
  }
  if (morphCount > 0) {
    console.log(`\n${morphCount} morph-gloss issue(s).`);
  }
  if (bankCount > 0) {
    console.log(`\n${bankCount} translation word-bank issue(s).`);
  }

  if (speechCount > 0) {
    console.log(`\n${speechCount} number pronunciation issue(s).`);
  }

  const fail = hostIssues + count + spanCount + duplicateIdCount + morphCount + bankCount + speechCount + coverageCount;
  if (fail > 0) {
    process.exit(1);
  }
  console.log("OK: overlay hosts match the published lexicon.");
  console.log("OK: Agalan words in docs/grammar/ parse as legal and match the lexicon.");
  console.log(
    `OK: code spans — ${spanStats.sentence} sentence(s) and ${spanStats.phrase} phrase(s) parsed; ` +
      `${spanStats.word} single word(s), ${spanStats.template} template(s), ${spanStats.english} English, ` +
      `${spanStats["marked-fragment"]} marked fragment(s), ${spanStats["marked-skip"]} marked skip(s); 0 unclassified.`,
  );
  console.log(
    `OK: ${morphChecked} morph gloss(es) compared; ${morphRedundantOmitted} redundant-omitted / ${morphWithLoose} with loose English; glosses match the parser.`,
  );
  console.log("OK: every heading and <a id> on a grammar page is unique.");
  console.log("OK: translation word-bank English matches the lexicon.");
  console.log("OK: number pronunciation rows match their shorthand.");
  if (paths.length === 0) {
    console.log(`OK: ${STATIC_CONSTRUCTIONS.size} constructions, all exercised by their anchor page.`);
  }
}

try {
  main();
} catch (err) {
  const message = err instanceof Error ? err.message : String(err);
  console.error(message);
  process.exit(1);
}
