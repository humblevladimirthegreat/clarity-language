/**
 * Fail when Chromium's print PDF inserts a page that `<PageBreak />` did not
 * ask for, or splits a table. Not part of `npm test` or `npm run build`.
 *
 *   npm run lint:cheat-sheet-print
 *   npm run lint:cheat-sheet-print -- --all
 *   npm run lint:cheat-sheet-print -- --only consonants --calibrate
 *   npm run lint:cheat-sheet-print -- --url http://127.0.0.1:5173/grammar
 *
 * Needs Playwright's Chromium once: `npx playwright install chromium`.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { createServer } from "node:http";
import { join } from "node:path";
import { spawn, type ChildProcess } from "node:child_process";

import { cheatSheetSidebar, cheatSheetSlug } from "../docs/grammar/.vitepress/lib/reading-order.js";
import {
  findingsFor,
  PAGE_CONTENT_PX,
  type PdfPage,
  type SheetLayout,
  type Slice,
  type TableInfo,
} from "../src/lint/cheat-sheet-print.js";
import { REPO_ROOT } from "../src/repo-paths.js";

const PILOT = "consonants";
const OUT_DIR = join(REPO_ROOT, "tmp", "cheat-sheet-print");
const LETTER = { format: "Letter" as const, margin: { top: "0.4in", right: "0.4in", bottom: "0.4in", left: "0.4in" } };

type Sheet = { id: string; file: string; path: string };

type Options = {
  all: boolean;
  only: string[];
  calibrate: boolean;
  report: boolean;
  json: boolean;
  url: string | null;
  port: number;
};

function parseArgs(argv: string[]): Options {
  const options: Options = { all: false, only: [], calibrate: false, report: false, json: false, url: null, port: 4173 };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]!;
    if (arg === "--all") options.all = true;
    else if (arg === "--calibrate") options.calibrate = true;
    else if (arg === "--report") options.report = true;
    else if (arg === "--json") options.json = true;
    else if (arg === "--only") {
      const value = argv[++i];
      if (!value) throw new Error("--only needs a sheet id (consonants, claritish, …)");
      options.only.push(value);
    } else if (arg === "--url") {
      const value = argv[++i];
      if (!value) throw new Error("--url needs a grammar-site origin, e.g. http://127.0.0.1:5173/grammar");
      options.url = value.replace(/\/$/, "");
    } else if (arg === "--port") {
      const value = argv[++i];
      const port = Number(value);
      if (!Number.isInteger(port) || port <= 0) throw new Error("--port needs a positive integer");
      options.port = port;
    } else if (arg === "--help" || arg === "-h") {
      printUsage();
      process.exit(0);
    } else if (arg.startsWith("-")) {
      throw new Error(`Unknown argument: ${arg}`);
    } else {
      options.only.push(arg);
    }
  }
  return options;
}

function printUsage(): void {
  console.log(`Usage: npm run lint:cheat-sheet-print -- [options]

  (no args)     check the consonants pilot
  --only ID     one sheet (repeatable); IDs are sidebar slugs or claritish
  --all         every grammar sheet plus Claritish
  --calibrate   write each sheet's PDF under tmp/cheat-sheet-print/
  --report      print the report even when clean; do not fail
  --json        machine-readable report
  --url ORIGIN  use a running VitePress server (…/grammar)
  --port N      dev-server port when the script starts one (default 4173)
`);
}

function allSheets(): Sheet[] {
  const grammar = cheatSheetSidebar.map((row) => {
    const id = cheatSheetSlug(row.link);
    return { id, file: `cheat-sheets/${id}.md`, path: `/cheat-sheets/${id}.html` };
  });
  return [...grammar, { id: "claritish", file: "claritish/cheat-sheet.md", path: "/claritish/cheat-sheet.html" }];
}

function selectedSheets(options: Options): Sheet[] {
  const sheets = allSheets();
  if (options.all) return sheets;
  const want = options.only.length > 0 ? options.only : [PILOT];
  return want.map((id) => {
    const sheet = sheets.find((s) => s.id === id);
    if (!sheet) throw new Error(`unknown sheet id ${id} (try --all)`);
    return sheet;
  });
}

function waitForOutput(child: ChildProcess, pattern: RegExp, timeoutMs: number): Promise<void> {
  return new Promise((resolve, reject) => {
    let log = "";
    const timer = setTimeout(
      () => reject(new Error(`dev server did not start within ${timeoutMs}ms\n${log.slice(-2000)}`)),
      timeoutMs,
    );
    const onData = (chunk: string | Buffer) => {
      const text = chunk.toString();
      log += text;
      if (pattern.test(log)) {
        clearTimeout(timer);
        child.stdout?.off("data", onData);
        child.stderr?.off("data", onData);
        resolve();
      }
    };
    child.stdout?.on("data", onData);
    child.stderr?.on("data", onData);
    child.once("exit", (code) => {
      clearTimeout(timer);
      reject(new Error(`dev server exited ${code}\n${log.slice(-2000)}`));
    });
  });
}

async function freePort(preferred: number): Promise<number> {
  for (let port = preferred; port < preferred + 20; port++) {
    const ok = await new Promise<boolean>((resolve) => {
      const server = createServer();
      server.once("error", () => resolve(false));
      server.listen(port, "127.0.0.1", () => server.close(() => resolve(true)));
    });
    if (ok) return port;
  }
  throw new Error(`no free port near ${preferred}`);
}

async function withOrigin(options: Options, fn: (origin: string) => Promise<void>): Promise<void> {
  if (options.url) {
    await fn(options.url);
    return;
  }
  const port = await freePort(options.port);
  const bin = join(REPO_ROOT, "node_modules", "vitepress", "bin", "vitepress.js");
  const child = spawn(process.execPath, [bin, "dev", "docs/grammar", "--port", String(port), "--strictPort", "--host", "127.0.0.1"], {
    cwd: REPO_ROOT,
    stdio: ["ignore", "pipe", "pipe"],
    env: { ...process.env, BROWSER: "none" },
  });
  child.stdout?.setEncoding("utf8");
  child.stderr?.setEncoding("utf8");
  try {
    await waitForOutput(child, /https?:\/\/(?:localhost|127\.0\.0\.1):\d+/, 90_000);
    await fn(`http://127.0.0.1:${port}/grammar`);
  } finally {
    child.kill("SIGTERM");
  }
}

type DomDump = { slices: Slice[]; tables: TableInfo[] };

const COLLECT_DOM = `(() => {
  const root = document.querySelector(".vp-doc");
  if (!root) return { slices: [], tables: [] };
  const blocks = [...root.querySelectorAll("h1, h2, h3, p, table, pre, ul, ol, [data-page-break]")];
  const slices = [];
  let current = [];
  const textOf = (el) => (el.textContent || "").replace(/\\s+/g, " ").trim();
  const flush = () => {
    const parts = current.filter((el) => textOf(el));
    current = [];
    if (parts.length === 0) return;
    const texts = parts.map(textOf);
    const headingEl = parts.find((el) => /^H[1-3]$/.test(el.tagName));
    const first = parts[0];
    const last = parts[parts.length - 1];
    slices.push({
      first: texts[0],
      firsts: texts.slice(0, 3),
      last: texts[texts.length - 1],
      heading: (headingEl && (headingEl.id || textOf(headingEl))) || first.id || "",
      heightPx: last.getBoundingClientRect().bottom - first.getBoundingClientRect().top,
    });
  };
  for (const el of blocks) {
    if (el.matches && el.matches("[data-page-break]")) {
      flush();
      continue;
    }
    current.push(el);
  }
  flush();
  const tables = [...root.querySelectorAll("table")].map((table) => {
    const rows = [...table.rows];
    let heading = "";
    let prev = table.previousElementSibling;
    while (prev) {
      if (/^H[1-3]$/.test(prev.tagName)) {
        heading = prev.id || textOf(prev);
        break;
      }
      prev = prev.previousElementSibling;
    }
    return {
      firstRow: textOf(rows[0] || table),
      lastRow: textOf(rows[rows.length - 1] || table),
      heading,
      heightPx: table.getBoundingClientRect().height,
    };
  });
  return { slices, tables };
})()`;

async function collectDom(page: import("playwright").Page): Promise<DomDump> {
  return page.evaluate(COLLECT_DOM) as Promise<DomDump>;
}

async function pdfPages(data: Uint8Array): Promise<PdfPage[]> {
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  const task = pdfjs.getDocument({ data, disableFontFace: true });
  const doc = await task.promise;
  const pages: PdfPage[] = [];
  const marginPt = 0.4 * 72;
  try {
    for (let i = 1; i <= doc.numPages; i++) {
      const page = await doc.getPage(i);
      const viewport = page.getViewport({ scale: 1 });
      const content = await page.getTextContent();
      const parts: string[] = [];
      let maxTop = 0;
      for (const item of content.items) {
        if (!("str" in item) || !item.str.trim()) continue;
        parts.push(item.str);
        if ("transform" in item) {
          const y = viewport.height - item.transform[5]!;
          if (y > maxTop) maxTop = y;
        }
      }
      const leftoverPt = Math.max(0, viewport.height - marginPt - maxTop);
      pages.push({ text: parts.join(" ").replace(/\s+/g, " ").trim(), leftoverPt });
    }
  } finally {
    await task.destroy();
  }
  return pages;
}


type SheetReport = {
  id: string;
  file: string;
  intendedPages: number;
  pdfPages: number;
  slices: { heading: string; heightPx: number; leftoverPx: number; leftoverPt?: number }[];
  tables: { heading: string; heightPx: number }[];
  findings: ReturnType<typeof findingsFor>;
  calibrate?: string[];
};

async function lintSheet(
  browser: import("playwright").Browser,
  origin: string,
  sheet: Sheet,
  options: Options,
): Promise<SheetReport> {
  const page = await browser.newPage({ viewport: { width: 739, height: 1056 } });
  try {
    await page.goto(`${origin}${sheet.path}`, { waitUntil: "networkidle", timeout: 60_000 });
    await page.emulateMedia({ media: "print" });
    const dom = await collectDom(page);
    const pdfBuffer = await page.pdf({
      ...LETTER,
      printBackground: true,
      preferCSSPageSize: true,
      displayHeaderFooter: false,
    });
    const data = Uint8Array.from(pdfBuffer);
    const pdf = await pdfPages(data);
    const layout: SheetLayout = {
      id: sheet.id,
      slices: dom.slices,
      tables: dom.tables,
      pdfPages: pdf,
      pageContentPx: PAGE_CONTENT_PX,
    };
    const findings = findingsFor(layout);
    const calibrate: string[] = [];
    if (options.calibrate) {
      mkdirSync(OUT_DIR, { recursive: true });
      const pdfPath = join(OUT_DIR, `${sheet.id}.pdf`);
      writeFileSync(pdfPath, pdfBuffer);
      calibrate.push(pdfPath);
    }
    return {
      id: sheet.id,
      file: sheet.file,
      intendedPages: dom.slices.length,
      pdfPages: pdf.length,
      slices: dom.slices.map((s, i) => ({
        heading: s.heading,
        heightPx: s.heightPx,
        leftoverPx: Math.max(0, PAGE_CONTENT_PX - s.heightPx),
        leftoverPt: pdf[i]?.leftoverPt,
      })),
      tables: dom.tables.map((t) => ({ heading: t.heading, heightPx: t.heightPx })),
      findings,
      calibrate: calibrate.length ? calibrate : undefined,
    };
  } finally {
    await page.close();
  }
}

function printReport(reports: SheetReport[]): void {
  for (const report of reports) {
    console.log(
      `${report.id}\tintended ${report.intendedPages}\tPDF ${report.pdfPages}\t${report.file}`,
    );
    for (const [i, slice] of report.slices.entries()) {
      console.log(
        `  page ${i + 1}\t${Math.round(slice.heightPx)}px used\t${Math.round(slice.leftoverPx)}px leftover\t${slice.heading || "—"}`,
      );
    }
    for (const table of report.tables) {
      console.log(`  table\t${Math.round(table.heightPx)}px\t${table.heading || "—"}`);
    }
    for (const finding of report.findings) {
      console.log(`  ${finding.kind}\t${finding.detail}`);
    }
    if (report.findings.length === 0) console.log("  ok");
    for (const file of report.calibrate ?? []) console.log(`  wrote ${file}`);
  }
}

async function main(): Promise<void> {
  const options = parseArgs(process.argv.slice(2));
  const sheets = selectedSheets(options);

  let chromium: typeof import("playwright").chromium;
  try {
    ({ chromium } = await import("playwright"));
  } catch {
    throw new Error("playwright is not installed; run npm install and npx playwright install chromium");
  }

  const reports: SheetReport[] = [];
  await withOrigin(options, async (origin) => {
    const browser = await chromium.launch();
    try {
      for (const sheet of sheets) {
        reports.push(await lintSheet(browser, origin, sheet, options));
      }
    } finally {
      await browser.close();
    }
  });

  if (options.json) console.log(JSON.stringify(reports, null, 2));
  else printReport(reports);

  const failed = reports.filter((r) => r.findings.length > 0);
  if (!options.report && failed.length > 0) {
    console.error(`${failed.length} sheet(s) with unexpected print breaks`);
    process.exitCode = 1;
  }
}

try {
  await main();
} catch (err) {
  console.error(err instanceof Error ? err.stack ?? err.message : err);
  process.exitCode = 1;
}
