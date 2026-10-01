/**
 * Echo metric, Step 2 (docs/proposals/echo-metric.md): pronunciation data.
 *
 * Looks up each published `concrete` label in the CMU Pronouncing Dictionary (first variant),
 * maps the phonemes to Agazan letters, and writes:
 *  - tmp/echo-pron/pron.csv: emoji, concrete, lookup word(s), CMU phonemes, Agazan sound string
 *  - tmp/echo-pron/report.md: coverage, labels missing from CMU, hyphen-only mismatches
 * Downloads cmudict into tmp/ on first run. With `write`, respells `concrete` labels whose only
 * difference from a CMU entry is a hyphen (hot-dog ↔ hotdog) in data/lexicon-published.csv.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import { CMU_PATH, loadCmu } from "./cmu-dict.ts";
import { parseCsvLine, serializeCsv } from "./csv.ts";
import { toAgazan } from "./pronunciation-map.ts";
import { REPO_ROOT, dataPath } from "./repo-paths.ts";

/** Pinned cmudict commit, so reruns give the same pronunciations. */
const CMU_URL = "https://raw.githubusercontent.com/cmusphinx/cmudict/74790861f652b15e4ac49015a90074ad62a27690/cmudict.dict";
const FREQ_FILE = join(REPO_ROOT, "tmp", "en_50k.txt");
const OUT = join(REPO_ROOT, "tmp", "echo-pron");

/** Hyphenated labels kept although CMU has the joined spelling, because the two-word form is more common. */
const KEEP_HYPHEN = new Set(["old-man"]);

/** Single words that happen to split into two English words (tam + ale). */
const NOT_COMPOUNDS = new Set(["tamale", "singlet", "pinata", "mahjong"]);

export type PronunciationReport = {
  exact: number;
  hyphenFix: number;
  parts: number;
  /** Labels with no pronunciation: add a CMU_OVERRIDES entry in src/cmu-dict.ts or relabel the row. */
  missing: { emoji: string; label: string }[];
  reportPath: string;
};

/** Rebuild tmp/echo-pron from the published lexicon (downloading cmudict on first run). */
export async function buildPronunciationCache(options: { write?: boolean } = {}): Promise<PronunciationReport> {
  const write = options.write ?? false;
  if (!existsSync(CMU_PATH)) {
    mkdirSync(dirname(CMU_PATH), { recursive: true });
    const res = await fetch(CMU_URL);
    if (!res.ok) throw new Error(`fetch ${CMU_URL}: ${res.status}`);
    writeFileSync(CMU_PATH, await res.text());
  }

  /** Chosen variant per word, plus overrides for labels CMU lacks. See src/cmu-dict.ts. */
  const cmu = loadCmu();
  /** Common English words guard re-hyphenation against loans; without the list, nothing is re-hyphenated. */
  const common = new Set(existsSync(FREQ_FILE) ? readFileSync(FREQ_FILE, "utf8").split("\n").map((l) => l.split(" ")[0]) : []);

  const lexicon = dataPath("lexicon-published.csv");
  const lines = readFileSync(lexicon, "utf8").split("\n");
  const header = parseCsvLine(lines[0]!);
  const iEmoji = header.indexOf("emoji");
  const iConcrete = header.indexOf("concrete");

  type Row = { emoji: string; label: string; lookup: string; phones: string; agazan: string; status: string };
  const rows: Row[] = [];
  const hyphenFixes: { line: number; from: string; to: string }[] = [];

  for (let n = 1; n < lines.length; n++) {
    const csvLine = lines[n]!;
    if (!csvLine.trim()) continue;
    const cols = parseCsvLine(csvLine);
    const emoji = cols[iEmoji]!;
    const concrete = cols[iConcrete]!;
    const label = concrete.toLowerCase();
    let lookup = label;
    let phones = cmu.get(label);
    let status = "exact";
    if (!phones) {
      // Hyphen-only difference: CMU has the joined spelling.
      const joined = label.replaceAll("-", "");
      const alt = joined !== label && cmu.has(joined) && !KEEP_HYPHEN.has(label) ? joined : undefined;
      if (alt) {
        hyphenFixes.push({ line: n, from: concrete, to: alt });
        lookup = alt;
        phones = cmu.get(alt);
        status = "hyphen-fix";
      }
    }
    if (!phones && !label.includes("-") && !NOT_COMPOUNDS.has(label)) {
      // Joined label missing from CMU: re-hyphenate when it splits into two common CMU words.
      const splits = [...Array(label.length).keys()]
        .slice(3, -2)
        .map((i): [string, string] => [label.slice(0, i), label.slice(i)])
        .filter(([a, b]) => cmu.has(a) && cmu.has(b) && common.has(a) && common.has(b));
      if (splits.length) {
        const [a, b] = splits.sort((x, y) => Math.min(y[0].length, y[1].length) - Math.min(x[0].length, x[1].length))[0]!;
        hyphenFixes.push({ line: n, from: concrete, to: `${a}-${b}` });
        lookup = `${a} ${b}`;
        phones = [...cmu.get(a)!, "|", ...cmu.get(b)!];
        status = "hyphen-fix";
      }
    }
    if (!phones && label.includes("-")) {
      const parts = label.split("-");
      if (parts.every((p) => cmu.has(p))) {
        lookup = parts.join(" ");
        phones = parts.flatMap((p, i) => [...(i ? ["|"] : []), ...cmu.get(p)!]);
        status = "parts";
      }
    }
    if (!phones) {
      rows.push({ emoji, label, lookup: "", phones: "", agazan: "", status: "missing" });
      continue;
    }
    rows.push({ emoji, label, lookup, phones: phones.join(" "), agazan: toAgazan(phones), status });
  }

  if (write && hyphenFixes.length) {
    for (const f of hyphenFixes) {
      const csvLine = lines[f.line]!;
      if (parseCsvLine(csvLine)[iConcrete] !== f.from) throw new Error(`line ${f.line} changed`);
      lines[f.line] = csvLine.replace(`,${f.from},`, `,${f.to},`);
    }
    writeFileSync(lexicon, lines.join("\n"));
  }

  mkdirSync(OUT, { recursive: true });
  writeFileSync(
    join(OUT, "pron.csv"),
    serializeCsv(
      ["emoji", "concrete", "lookup", "cmu", "agazan", "status"],
      rows.map((r) => ({ ...r, concrete: r.label, cmu: r.phones })),
    ),
  );

  const count = (s: string) => rows.filter((r) => r.status === s).length;
  const missing = rows.filter((r) => r.status === "missing");
  const reportPath = join(OUT, "report.md");
  writeFileSync(
    reportPath,
    [
      "# Echo pronunciation coverage",
      "",
      `CMU entries (first variant): ${cmu.size}. Labels: ${rows.length}.`,
      "",
      `- exact: ${count("exact")}`,
      `- hyphen-only fix${write ? " (applied)" : " (run with --write)"}: ${count("hyphen-fix")}`,
      `- hyphenated, looked up by parts: ${count("parts")}`,
      `- missing: ${missing.length}`,
      "",
      "Agazan string: capital = primary-stress vowel, `·` = unstressed AH0.",
      "",
      "## Hyphen-only fixes",
      "",
      ...hyphenFixes.map((f) => `- ${f.from} → ${f.to}`),
      "",
      "## Hyphenated, looked up by parts",
      "",
      ...rows.filter((r) => r.status === "parts").map((r) => `- ${r.emoji} ${r.label}`),
      "",
      "## Missing from CMU (find a label that is in CMU)",
      "",
      ...missing.map((r) => `- ${r.emoji} ${r.label}`),
      "",
    ].join("\n"),
  );

  return {
    exact: count("exact"),
    hyphenFix: count("hyphen-fix"),
    parts: count("parts"),
    missing: missing.map((r) => ({ emoji: r.emoji, label: r.label })),
    reportPath,
  };
}
