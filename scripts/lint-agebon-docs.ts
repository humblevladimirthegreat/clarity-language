/**
 * Check Agebon words in docs/grammar/ code spans: they must parse, and
 * content / x-family host roots must be in the lexicon.
 *
 * Morph-gloss pairs (example blockquotes, Morph-column tables, and visible
 * morph lines in translation-exercise spoilers) are compared to the parser.
 * Teach blocks and exercises with loose English must include a morph unless
 * parser output is trivially redundant with that loose line.
 * Translation **Roots used here** English is checked against the lexicon; each
 * bank lists every content root its drills use, and every row is used.
 * Converted checkpoints (`### Practice`) follow the template, and their decision items and
 * **Also correct:** variants pass the item rules (src/lint/practice-item-rules.ts). Their
 * **New words** / **Review** bank has the template columns and a cue on every new row, and
 * its roots match the `core` column in path order (src/core-vocabulary.ts).
 * The level review page comes after every stage page: it introduces no roots, and each band's
 * items link back to every stage checkpoint of that level (src/lint/level-review.ts).
 * Free English lines on top-level grammar pages are checked for the sentence-and-note shape
 * (src/lint/free-english.ts); so are table English cells that translate an Agebon phrase or
 * sentence, there and on cheat sheets, for shape and parentheses inside the sentence.
 * On the number pages, shorthand number examples need a
 * pronunciation row that matches the spoken form computed from the shorthand.
 * Mismatches, leftover ambiguity, and missing morph glosses fail the run.
 * Findings print to stdout. Each file logs morph coverage counts.
 *
 * Run: npm run lint:agebon
 *      npm run lint:agebon -- [paths...] [--check-ambiguity] [--order-report]
 */
import { readFileSync } from "node:fs";
import { basename, dirname, join, relative, resolve } from "node:path";

import { emptySpanStats, lintAgebonMarkdown, lintAgebonSpans, lintBareRoots, lintNativeOpaque } from "../src/lint/agebon-docs.js";
import { lintStaleNames } from "../src/lint/stale-names.js";
import {
  formatMorphGlossFinding,
  lintMorphGlossMarkdown,
} from "../src/lint/morph-gloss-docs.js";
import { lintFreeEnglish, lintTableEnglish } from "../src/lint/free-english.js";
import { lintPracticeItems } from "../src/lint/practice-item-rules.js";
import {
  formatPracticeBankFinding,
  formatWordBankFinding,
  formatWordBankUsageFinding,
  lintPracticeBank,
  lintWordBankMarkdown,
  lintWordBankUsage,
} from "../src/lint/word-bank-docs.js";
import { lintCoreCounts, lintLookAlikes, stageCheckpoints, storedCore } from "../src/core-vocabulary.js";
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
  formatSection,
  learningOrder,
  pageSections,
  sectionAt,
  type LearningOrder,
  type PageSections,
} from "../src/lint/learning-order.js";
import { constructionCoverageGaps, constructionHomes, learningOrderFindings } from "../src/lint/construction-order.js";
import { duplicateIds } from "../src/lint/grammar-anchors.js";
import { glossLabels, lintTerminology, TERMINOLOGY_PAGE } from "../src/lint/terminology-docs.js";
import { lintRetieFormat } from "../src/lint/retie-format.js";
import {
  constructionFamilies,
  drillCoverage,
  drillSkips,
  duplicateDrills,
  type ConstructionUse,
} from "../src/lint/drill-coverage.js";
import { CONSTRUCTIONS as STATIC_CONSTRUCTIONS, constructionRegistry } from "../src/parse/constructions.js";
import { holdingList } from "../docs/grammar/.vitepress/lib/holding-list.js";
import { lessonPages, levelReviewPage, pathPages } from "../docs/grammar/.vitepress/lib/reading-order.js";
import { lintLevelReview } from "../src/lint/level-review.js";
import { loadDefaultTables } from "../src/parse/index.js";
import { lineNumberAt } from "../src/retie/tokens.js";
import { fillSelf } from "../src/learner-name.js";
import { listMarkdown } from "../src/markdown-files.js";
import { REPO_ROOT, readData } from "../src/repo-paths.js";

/**
 * Static registry plus one `overlay.*` entry per closed overlay row. The
 * learning-order check covers every entry; the page-level coverage check covers
 * the static registry.
 */
const CONSTRUCTIONS = constructionRegistry(loadDefaultTables().overlays.values());
const grammarDir = join(REPO_ROOT, "docs", "grammar");
const cheatSheetsDir = join(grammarDir, "cheat-sheets");
const metaDir = join(REPO_ROOT, "docs", "meta");
/** A record of past spellings (docs/meta/retie.md#skipped) keeps its old names. */
const RETIE_SKIP_RE = /^<!--\s*retie:\s*skip\s*-->\s*$/m;

function parseCli(argv: string[]): { paths: string[]; orderReport: boolean } {
  const paths: string[] = [];
  let orderReport = false;
  for (const arg of argv) {
    if (arg === "--help" || arg === "-h") {
      console.error(`Usage: npm run lint:agebon -- [paths...] [--check-ambiguity]

Checks backticked and fenced Agebon words under docs/grammar/.
Morph-gloss mismatches, leftover ambiguity, missing morph glosses, coverage
gaps, and translation word-bank English/lexicon mismatches fail. Word banks
must list every drill content root, and every row must be used.
--check-ambiguity is always on for the corpus (flag kept for callers).
--order-report lists every learning-order finding (the default prints counts).
Families not practiced in their page band's translation drill fail.`);
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
  return paths.length === 0 ? listMarkdown(grammarDir) : paths.flatMap((arg) => listMarkdown(resolve(arg)));
}

function lintOverlayHosts(): number {
  const published = parsePublishedCsv(
    readData("lexicon-published.csv"),
  );
  const overlays = parseOverlayCsv(
    readData("lexicon-overlays.csv"),
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

/** Prints construction-coverage gaps; returns their number. */
function checkConstructionCoverage(uses: readonly ConstructionUse[]): number {
  const extraPages = new Map<string, string[]>();
  for (const sitting of holdingList) {
    const list = extraPages.get(sitting.parent) ?? [];
    list.push(sitting.page);
    extraPages.set(sitting.parent, list);
  }
  const gaps = constructionCoverageGaps(STATIC_CONSTRUCTIONS, uses, extraPages);
  if (gaps.length === 0) return 0;
  console.error(
    `\n${gaps.length} construction(s) not exercised by their anchor page. ` +
      "Add a teach example on that page, or narrow or delete the production:",
  );
  for (const gap of gaps) {
    const where = gap.usedOn.length > 0 ? `used on ${gap.usedOn.join(", ")}` : "used on no page";
    console.error(`  ${gap.id}  →  ${gap.anchor}  (${where}; ${gap.summary})`);
  }
  return gaps.length;
}

/**
 * Prints learning-order findings: failing ones always, forward links only with
 * `--order-report`. Returns the number of failing findings.
 */
function reportLearningOrder(order: LearningOrder, uses: readonly ConstructionUse[], full: boolean): number {
  const { unresolved, unbandedHomes, notAtHome, unbandedUses, forward, links, failures } = learningOrderFindings(
    order,
    CONSTRUCTIONS,
    uses,
    pageMarkdown,
  );
  const forwardUses = [...forward.values()].reduce((n, f) => n + f.sections.size, 0);
  const unbandedCount = [...unbandedUses.values()].reduce((n, c) => n + c, 0);
  console.log(
    `\nLearning order: ${forward.size} construction(s) used before their home section ` +
      `(${forwardUses} section use(s)); ${links.length} forward link(s); ` +
      `${notAtHome.length} construction families not taught in their home section; ` +
      `${unresolved.length + unbandedHomes.length} home anchor(s) unresolved or outside every band; ` +
      `${unbandedCount} use(s) outside every band.` +
      (full ? "" : " Forward links are report-only; run with --order-report to list them."),
  );
  if (unresolved.length > 0) {
    console.log("\nHome anchors that do not resolve:");
    for (const line of unresolved) console.log(`  ${line}`);
  }
  if (unbandedHomes.length > 0) {
    console.log("\nHome anchors outside every band:");
    for (const line of unbandedHomes) console.log(`  ${line}`);
  }
  if (notAtHome.length > 0) {
    console.log("\nConstruction families not taught in their home section (no member traced there):");
    for (const { ids, home, usedIn } of notAtHome) {
      const where = usedIn.length > 0 ? `used in ${usedIn.slice(0, 3).join(", ")}${usedIn.length > 3 ? ", …" : ""}` : "used nowhere";
      console.log(`  ${ids.join(", ")}  →  ${formatSection(home)}  (${where})`);
    }
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
  if (full && links.length > 0) {
    console.log("\nForward links (report only):");
    for (const line of links) console.log(`  ${line}`);
  }
  return failures;
}

/**
 * Drill coverage: each family is practiced by its page's same-band translation
 * drill. A missing drill section and an unpracticed family both fail and always
 * print. Returns the number of findings.
 */
function reportDrillCoverage(order: LearningOrder, uses: readonly ConstructionUse[]): number {
  const homes = constructionHomes(order, CONSTRUCTIONS);
  const skips = drillSkips(readFileSync(join(REPO_ROOT, "docs", "meta", "drill-generation.md"), "utf8"));
  const checked = uses.filter((u) => !u.section.ignored);
  const { missing, uncovered, covered } = drillCoverage(order, constructionFamilies(homes), checked, skips);
  console.log(
    `\nDrill coverage: ${covered} construction famil(ies) practiced in their band's drill; ` +
      `${uncovered.length} not practiced; ${missing.length} page band(s) with no translation practice; ${duplicateDrills(order).length} with more than one.`,
  );
  if (missing.length > 0) {
    console.log("\nPage bands with taught families but no translation practice:");
    for (const key of missing) {
      const [page, band] = key.split("|");
      console.log(`  ${page}  ${band}  (expected ### Practice {#${band}-practice})`);
    }
  }
  const duplicates = duplicateDrills(order);
  if (duplicates.length > 0) {
    console.log("\nPage bands with more than one translation practice section (merge them into one):");
    for (const { key, drills } of duplicates) console.log(`  ${key.replace("|", "  ")}  (${drills.map(formatSection).join(", ")})`);
  }
  if (uncovered.length > 0) {
    console.log("\nFamilies not practiced in their band's drill:");
    for (const { family, drills } of uncovered) {
      console.log(`  ${family.ids.join(", ")}  →  ${drills.map(formatSection).join(", ")}  (taught at ${formatSection(family.home)})`);
    }
  }
  return missing.length + uncovered.length + duplicates.length;
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
  let practiceCount = 0;
  let speechCount = 0;
  let spanCount = 0;
  let duplicateIdCount = 0;
  let retieFormatCount = 0;
  let freeEnglishCount = 0;
  let staleNameCount = 0;
  const reportStaleNames = (rel: string, text: string) => {
    for (const issue of lintStaleNames(text, tables)) {
      staleNameCount += 1;
      console.error(`${rel}:${lineNumberAt(text, issue.index)}  \`${issue.name}\`  stale-name  (spelled like a name, but its root is not in the lexicon; write the current name)`);
    }
  };
  const spanStats = emptySpanStats();
  const pages = new Map<string, PageSections>();
  const uses: ConstructionUse[] = [];

  for (const file of files) {
    const source = readFileSync(file, "utf8");
    // `SELF` slots are checked as the unset default (`zeman`, `z-speaker`); no newlines change.
    const original = fillSelf(source);
    const rel = relative(REPO_ROOT, file);
    const issues = lintAgebonMarkdown(original, tables);
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
      for (const finding of lintRetieFormat(original, tables)) {
        retieFormatCount += 1;
        console.error(`${rel}:${lineNumberAt(original, finding.index)}  retie-format  (${finding.detail})`);
      }
      for (const finding of lintFreeEnglish(original, tables)) {
        freeEnglishCount += 1;
        console.error(`${rel}:${lineNumberAt(original, finding.index)}  free-english ${finding.kind}  (${finding.detail})`);
      }
      const ps = pageSections(basename(file), original);
      pages.set(ps.page, ps);
      pageMarkdown.set(ps.page, original);
      used = (id, index) => uses.push({ id, section: sectionAt(ps.sections, index) });
    }
    if (dirname(file) === grammarDir || dirname(file) === cheatSheetsDir) {
      for (const finding of lintTableEnglish(original, tables)) {
        freeEnglishCount += 1;
        console.error(`${rel}:${lineNumberAt(original, finding.index)}  free-english ${finding.kind}  (${finding.detail})`);
      }
    }
    for (const issue of lintBareRoots(original, tables)) {
      spanCount += 1;
      console.error(`${rel}:${lineNumberAt(original, issue.index)}  \`${issue.text}\`  bare-root  (root ${issue.root} is not in the lexicon; write the current root)`);
    }
    reportStaleNames(rel, source);
    for (const issue of lintNativeOpaque(original, tables)) {
      spanCount += 1;
      console.error(`${rel}:${lineNumberAt(original, issue.index)}  \`${issue.text}\`  native-opaque  (<${issue.payload}> reads as Agebon; an opaque span holds foreign text, so write a foreign word or put Agebon in a cite […])`);
    }
    for (const issue of lintAgebonSpans(original, tables, spanStats, used)) {
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

    const review = dirname(file) === grammarDir && basename(file) === levelReviewPage;
    for (const finding of lintPracticeItems(original, tables, { review, page: basename(file) })) {
      practiceCount += 1;
      console.error(`${rel}:${lineNumberAt(original, finding.index)}  practice-item  (${finding.detail})`);
    }

    const bankFindings = lintWordBankMarkdown(source, tables);
    for (const finding of bankFindings) {
      bankCount += 1;
      console.log(formatWordBankFinding(rel, finding));
    }
    for (const finding of lintWordBankUsage(source, tables)) {
      bankCount += 1;
      console.log(formatWordBankUsageFinding(rel, finding));
    }
    for (const finding of lintPracticeBank(source, tables)) {
      bankCount += 1;
      console.error(formatPracticeBankFinding(rel, finding));
    }

    if (dirname(file) === grammarDir && NUMBER_SPEECH_FILES.includes(basename(file))) {
      for (const finding of lintNumberSpeechMarkdown(original)) {
        speechCount += 1;
        console.log(formatNumberSpeechFinding(rel, finding));
      }
    }
  }

  let terminologyCount = 0;
  const terminology = pageMarkdown.get(TERMINOLOGY_PAGE);
  if (terminology !== undefined) {
    const names = new Map<string, string>();
    for (const [page, md] of pageMarkdown) {
      const h1 = /^# (.+)$/m.exec(md)?.[1];
      if (h1) names.set(page, h1.replace(/\s*\{#[^}]+\}\s*$/, "").trim());
    }
    for (const item of lessonPages()) names.set(item.page, item.title);
    for (const finding of lintTerminology(terminology, pageMarkdown, tables, glossLabels(tables.overlays.values()), names)) {
      terminologyCount += 1;
      console.error(`docs/grammar/${TERMINOLOGY_PAGE}:${lineNumberAt(terminology, finding.index)}  terminology  (${finding.detail})`);
    }
  }

  if (paths.length === 0) {
    for (const file of listMarkdown(metaDir)) {
      const source = readFileSync(file, "utf8");
      if (!RETIE_SKIP_RE.test(source)) reportStaleNames(relative(REPO_ROOT, file), source);
    }
  }

  let coverageCount = 0;
  let orderCount = 0;
  let drillCount = 0;
  let coreCount = 0;
  let lookAlikeCount = 0;
  let reviewCount = 0;
  if (paths.length === 0) {
    // The level review page comes last, so each of its bands closes that level.
    const orderPages = pathPages();
    const order = learningOrder(orderPages, pages);
    coverageCount = checkConstructionCoverage(uses);
    orderCount = reportLearningOrder(order, uses, orderReport);
    drillCount = reportDrillCoverage(order, uses);
    const checkpoints = stageCheckpoints(orderPages, (page) => pageMarkdown.get(page), tables, levelReviewPage);
    const core = storedCore();
    for (const finding of lintCoreCounts(checkpoints, core)) {
      coreCount += 1;
      console.error(`docs/grammar/${finding.page}:${finding.line}  core-vocabulary  (${finding.detail})`);
    }
    for (const finding of lintLookAlikes(checkpoints, core)) {
      lookAlikeCount += 1;
      console.error(`docs/grammar/${finding.page}:${finding.line}  look-alike  (${finding.detail})`);
    }
    const reviewMarkdown = pageMarkdown.get(levelReviewPage);
    if (reviewMarkdown !== undefined) {
      for (const finding of lintLevelReview(order, levelReviewPage, reviewMarkdown)) {
        reviewCount += 1;
        console.error(`docs/grammar/${levelReviewPage}:${lineNumberAt(reviewMarkdown, finding.index)}  level-review  (${finding.detail})`);
      }
    }
  }

  if (count > 0) {
    console.error(`\n${count} Agebon word issue(s) in docs/grammar/.`);
  }
  if (spanCount > 0) {
    console.error(`\n${spanCount} Agebon sentence / span issue(s) in docs/grammar/.`);
  }
  if (staleNameCount > 0) {
    console.error(`\n${staleNameCount} stale name(s). A house or example name follows its root; respell it from the lexicon.`);
  }
  if (duplicateIdCount > 0) {
    console.error(
      `\n${duplicateIdCount} duplicate id(s). Give each heading a unique id (rename it, or pin one with {#id}); drop an <a id> that repeats its heading's id.`,
    );
  }
  if (retieFormatCount > 0) {
    console.error(
      `\n${retieFormatCount} retie-format issue(s). Pin an English heading id, put Agebon in backticks, or fix the shared-prefix mark (docs/meta/grammar-docs.md).`,
    );
  }
  if (terminologyCount > 0) {
    console.error(`\n${terminologyCount} terminology.md issue(s). Update the entry to match its teaching page.`);
  }
  if (freeEnglishCount > 0) {
    console.error(
      `\n${freeEnglishCount} free English issue(s). Write "sentence" (note) with a plain-English note (docs/meta/glosses.md#free-english-sentence-and-note).`,
    );
  }
  if (morphCount > 0) {
    console.log(`\n${morphCount} morph-gloss issue(s).`);
  }
  if (bankCount > 0) {
    console.log(`\n${bankCount} translation word-bank issue(s).`);
  }
  if (practiceCount > 0) {
    console.error(
      `\n${practiceCount} checkpoint item issue(s). Follow the template and decision-item rules (docs/meta/translation-exercises.md#template, #item-types).`,
    );
  }

  if (speechCount > 0) {
    console.log(`\n${speechCount} number pronunciation issue(s).`);
  }
  if (coreCount > 0) {
    console.error(
      `\n${coreCount} core-vocabulary issue(s). Match **New words** / **Review** to the core column, or retarget the cells (docs/meta/translation-exercises.md#core-vocabulary).`,
    );
  }
  if (lookAlikeCount > 0) {
    console.error(
      `\n${lookAlikeCount} look-alike issue(s). Keep roots apart only in the middle vowel out of nearby checkpoints. A swapped word must still fit each item: reread them, and rewrite any that the new word makes false or odd (docs/meta/translation-exercises.md#look-alikes).`,
    );
  }
  if (reviewCount > 0) {
    console.error(
      `\n${reviewCount} level-review issue(s). One item per stage checkpoint, each ending with a **Rule:** link to its section (docs/meta/translation-exercises.md#level-reviews).`,
    );
  }
  if (orderCount > 0) {
    console.error(
      `\n${orderCount} learning-order issue(s). Rewrite the example with forms already taught, or move the home section earlier (docs/proposals/learning-order-check.md, No previews).`,
    );
  }

  if (drillCount > 0) {
    console.error(
      `\n${drillCount} drill-coverage issue(s). Add ### Practice {#<band>-practice}, or an item in it that uses the family, or merge duplicate sections (docs/meta/drill-generation.md), or mark the page + band skip in its allowlist.`,
    );
  }

  const fail =
    hostIssues +
    count +
    spanCount +
    staleNameCount +
    duplicateIdCount +
    retieFormatCount +
    freeEnglishCount +
    morphCount +
    terminologyCount +
    bankCount +
    practiceCount +
    speechCount +
    coverageCount +
    orderCount +
    drillCount +
    coreCount +
    lookAlikeCount +
    reviewCount;
  if (fail > 0) {
    process.exit(1);
  }
  console.log("OK: overlay hosts match the published lexicon.");
  console.log("OK: Agebon words in docs/grammar/ parse as legal and match the lexicon.");
  console.log(
    `OK: code spans — ${spanStats.sentence} sentence(s) and ${spanStats.phrase} phrase(s) parsed; ` +
      `${spanStats.template} template(s) and ${spanStats["marked-fragment"]} fragment(s) traced; ` +
      `${spanStats["marked-error"]} Fix it wrong form(s); ` +
      `${spanStats.word} single word(s), ${spanStats.english} English, ${spanStats["text-fence"]} text fence(s); 0 unclassified.`,
  );
  console.log(
    `OK: ${morphChecked} morph gloss(es) compared; ${morphRedundantOmitted} redundant-omitted / ${morphWithLoose} with loose English; glosses match the parser.`,
  );
  console.log("OK: every heading and <a id> on a grammar page is unique.");
  console.log("OK: translation word-bank English matches the lexicon.");
  if (paths.length === 0) console.log("OK: converted checkpoint banks match the core vocabulary; level reviews cover their levels.");
  console.log("OK: checkpoint items follow the template; decision items and Also correct variants check out.");
  console.log("OK: number pronunciation rows match their shorthand.");
  if (paths.length === 0) {
    console.log(`OK: ${STATIC_CONSTRUCTIONS.size} constructions, all exercised by their anchor page.`);
    console.log("OK: learning order — every construction is taught at home and used no earlier.");
  }
}

try {
  main();
} catch (err) {
  const message = err instanceof Error ? err.message : String(err);
  console.error(message);
  process.exit(1);
}
