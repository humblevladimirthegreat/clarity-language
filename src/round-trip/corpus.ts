/**
 * The doc-example corpus the meaning-view test and the round trip share (docs/meta/realizer.md#round-trip): every doc
 * example read as a one-turn log and projected, once per process.
 */
import { buildLog } from "../interpret/log.js";
import type { Reading } from "../interpret/types.js";
import type { ClassifyTables } from "../parse/classify.js";
import { loadDefaultTables } from "../parse/index.js";
import { buildExampleIndex } from "../parse/llm-examples.js";
import { type MeaningReading, project } from "../realize/meaning.js";
import { GRAMMAR_DIR } from "../repo-paths.js";

/** One doc example with its readings (read as a one-turn log) and their projection. */
export type CorpusEntry = { ageben: string; source: string; readings: Reading[]; meanings: MeaningReading[] };

/** A doc example the log rejected, with the first line of why. */
export type Unparsed = { ageben: string; source: string; error: string };

/** The read examples; the ones that do not parse; and `<source> <ageben>: <message>` for each that did not project. */
export type Corpus = { entries: CorpusEntry[]; unparsed: Unparsed[]; failures: string[] };

/** The speaker of every one-turn log. Opaque: no reading depends on its spelling. */
const SPEAKER = "A";

/**
 * A text's top-level readings, read as one turn of a log (`buildLog`), so links and pronouns cross its sentences. Throws
 * with the log's reason when the turn is rejected.
 */
export function readTurn(text: string, tables: ClassifyTables, source?: string): Reading[] {
  const log = buildLog([{ speaker: SPEAKER, at: 0, text }], tables, source === undefined ? {} : { text: source });
  const rejected = log.rejected[0];
  if (rejected) throw new Error(rejected.error.split("\n")[0]);
  return log.readings;
}

const cache = new WeakMap<ClassifyTables, Corpus>();

/** Every doc example, read and projected once per process. */
export function corpus(tables: ClassifyTables = loadDefaultTables()): Corpus {
  const cached = cache.get(tables);
  if (cached) return cached;
  const out: Corpus = { entries: [], unparsed: [], failures: [] };
  for (const example of buildExampleIndex(GRAMMAR_DIR, tables)) {
    let readings: Reading[];
    try {
      readings = readTurn(example.ageben, tables, example.source);
    } catch (error) {
      out.unparsed.push({ ageben: example.ageben, source: example.source, error: (error as Error).message });
      continue; // The reader sweep reports these too.
    }
    try {
      out.entries.push({ ageben: example.ageben, source: example.source, readings, meanings: project(readings, tables) });
    } catch (error) {
      out.failures.push(`${example.source} ${example.ageben}: ${(error as Error).message}`);
    }
  }
  cache.set(tables, out);
  return out;
}
