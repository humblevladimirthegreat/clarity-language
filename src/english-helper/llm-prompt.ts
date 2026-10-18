/**
 * English → Agazan prompt: the analyzer's skeleton for each input, short writing rules, the gloss core of the Agazan → English prompt (so the
 * model can read the examples), reader notes for the sections the analyzer points at, and doc
 * examples picked by the roots, forms, constructions and English words they share with the
 * input. Pure: the analyzer data and the example index come in from the caller, so the CLI and
 * the Inspect page build the same prompt.
 */
import { GLOSS_READER, renderCore, type ExamplePair, type PromptContext } from "../parse/llm-prompt.js";
import { analyzeEnglish, type Analysis, type AnalyzeOptions, type HelperData, type Suggestion } from "./analyze.js";
import { analysisLines } from "./describe.js";

export type HelperInput = { english: string; analysis: Analysis };
export type HelperPromptOptions = {
  /** Doc examples to show (default 6; 0 for none). */
  examples?: number;
};

/** Leads are guesses, so a doc example sharing one counts for less. */
const LEAD_TIERS = new Set(["alias", "synonym", "broader", "route", "live"]);
/** An English word counts for less than a root or construction: the doc sentences are short and share many. */
const ENGLISH_WEIGHT = 0.5;
/** Shown even when nothing new is covered, so the model sees more than one sentence (when two share anything). */
const MIN_EXAMPLES = 2;

/** Every root stem a suggestion builds on (`root:`), and every grammar-row word it spells (`word:`). */
function suggestionFeatures(s: Suggestion): [string, number][] {
  const lead = LEAD_TIERS.has(s.tier) ? 0.5 : 1;
  const words = (form: string): [string, number][] =>
    form
      .split(/[^a-z]+/)
      .filter((w) => w.length >= 3)
      .map((w) => [`word:${w}`, 1]);
  switch (s.kind) {
    case "lexicon":
      return [[`root:${s.form}`, lead]];
    case "role":
      return [[`root:${s.root}`, lead], ...(s.modifier ? [[`root:${s.modifier.root}`, lead] as [string, number]] : [])];
    case "live":
      return s.parts.map((p) => [`root:${p.form}`, lead]);
    case "class":
      return [s.animal, s.qualifier].filter((r) => r != null).map((r) => [`root:${r.form}`, lead]);
    case "job":
    case "entry":
      return words(s.form);
    case "detector":
      return [];
  }
}

/** The sections a suggestion points at, without the role-letter link every noun and verb carries. */
function suggestionLinks(s: Suggestion): string[] {
  switch (s.kind) {
    case "lexicon":
      return s.anchor ? [s.anchor] : [];
    case "class":
    case "detector":
      return s.links;
    default:
      return [s.link];
  }
}

const CONTENT = new Set(["noun", "verb", "adjective", "adverb"]);

/** What the input asks of an example: feature → how much it counts (before rarity). */
function inputFeatures(inputs: readonly HelperInput[], anchors: ReadonlyMap<string, string>): { wanted: Map<string, number>; links: Set<string> } {
  const wanted = new Map<string, number>();
  const want = (feature: string, weight: number) => wanted.set(feature, Math.max(weight, wanted.get(feature) ?? 0));
  const links = new Set<string>();
  for (const { analysis } of inputs) {
    for (const clause of analysis.clauses) {
      const suggestions = [...clause.detectors, ...clause.slots.flatMap((slot) => slot.suggestions)];
      for (const s of suggestions) {
        for (const [feature, weight] of suggestionFeatures(s)) want(feature, weight);
        for (const link of suggestionLinks(s)) links.add(link);
      }
      for (const slot of clause.slots) {
        if (!slot.skipped && CONTENT.has(slot.cls) && slot.lemma.length >= 3) want(`en:${slot.lemma.toLowerCase()}`, ENGLISH_WEIGHT);
      }
    }
  }
  for (const [id, anchor] of anchors) if (links.has(anchor)) want(`c:${id}`, 1);
  return { wanted, links };
}

type Indexed = { pair: ExamplePair; words: Set<string>; english: string[]; constructions: Set<string> };

function indexed(pair: ExamplePair): Indexed {
  return {
    pair,
    words: new Set(pair.agazan.toLowerCase().split(/[^a-z]+/).filter(Boolean)),
    english: pair.sentence.toLowerCase().split(/[^a-z']+/).filter(Boolean),
    constructions: new Set(pair.constructions),
  };
}

/** Whether an example has a feature. An English lemma matches its inflections (*walk* → *walks*, *walked*). */
function has(example: Indexed, feature: string): boolean {
  const colon = feature.indexOf(":");
  const kind = feature.slice(0, colon);
  const value = feature.slice(colon + 1);
  switch (kind) {
    case "root":
      return [...example.words].some((w) => w.includes(value));
    case "word":
      return example.words.has(value);
    case "c":
      return example.constructions.has(value);
    case "en":
      return example.english.some((w) => w === value || (w.startsWith(value) && w.length - value.length <= 3));
    default:
      return false;
  }
}

/**
 * Greedy pick: each next example covers the most input features not already covered, weighted by
 * rarity across the index, less a small cost for length. Stops when nothing new is covered, once
 * {@link MIN_EXAMPLES} are in; an example that shares no feature with the input is never picked.
 */
export function selectHelperExamples(
  wanted: ReadonlyMap<string, number>,
  index: readonly ExamplePair[],
  count: number,
): ExamplePair[] {
  if (count <= 0 || index.length === 0) return [];
  const pool = index.map(indexed);
  const hits = new Map<Indexed, string[]>();
  const df = new Map<string, number>();
  for (const example of pool) {
    const found = [...wanted.keys()].filter((f) => has(example, f));
    hits.set(example, found);
    for (const f of found) df.set(f, (df.get(f) ?? 0) + 1);
  }
  const weight = (f: string) => (wanted.get(f) ?? 0) * Math.log(pool.length / (df.get(f) ?? pool.length));
  const covered = new Set<string>();
  const gain = (example: Indexed) => hits.get(example)!.reduce((sum, f) => sum + (covered.has(f) ? 0 : weight(f)), 0);
  const total = (example: Indexed) => hits.get(example)!.reduce((sum, f) => sum + weight(f), 0);
  const picked: Indexed[] = [];
  while (picked.length < count) {
    let top: Indexed | undefined;
    let topScore = -Infinity;
    for (const example of pool) {
      // An example that shares nothing with the input is never shown, even to fill the minimum.
      if (picked.includes(example) || hits.get(example)!.length === 0) continue;
      const g = gain(example);
      if (picked.length >= MIN_EXAMPLES && g <= 0) continue;
      // Past the new features, what the example repeats breaks ties; near-ties go to the shorter sentence.
      const score = g + 0.1 * total(example) - 0.002 * example.pair.agazan.length;
      if (score > topScore) {
        top = example;
        topScore = score;
      }
    }
    if (!top) break;
    picked.push(top);
    for (const f of hits.get(top)!) covered.add(f);
  }
  return picked.map((example) => example.pair);
}

/** One spelled suggestion taken apart (`role letter + root + ending`), so the rules point at the input's own words. */
function illustration(inputs: readonly HelperInput[]): string | undefined {
  for (const { analysis } of inputs) {
    for (const s of analysis.clauses.flatMap((clause) => clause.slots.flatMap((slot) => slot.suggestions))) {
      if (s.kind !== "lexicon" || !s.word || !s.role || s.name || !s.word.startsWith(s.role + s.form)) continue;
      const ending = s.word.slice(s.role.length + s.form.length);
      if (ending.length !== 1) continue;
      return `\`${s.word}\` = role letter \`${s.role}\` + root \`${s.form}\` (${JSON.stringify(s.sense)}) + ending \`-${ending}\``;
    }
  }
  return undefined;
}

/** How to write a word and a clause (clause.md#beginner, word-endings.md#beginner). Plain English, no fixed Agazan. */
function writingRules(inputs: readonly HelperInput[]): string[] {
  const example = illustration(inputs);
  return [
    "## How to write Agazan",
    "",
    `- Each word of a sentence is one lowercase word: role letter + root + ending, with no hyphen or space${example ? ` (${example})` : ""}. The role letter is the word's job, and it is the same as the gloss prefix described below: \`z\` subject, \`d\` direct object, \`b\` extra noun, \`v\` verb, \`g\` adjective, \`gl\` adjective before its noun, \`w\` degree, \`h\` adverb, \`th\` stance, \`y\` turn word, \`x\` link. \`th\` is one letter.`,
    "- The ending: `-l` for a first mention in the root's everyday, concrete sense; `-m` for the root's abstract sense; `-n` for a name.",
    "- A root line in the analysis gives the root, its sense, and (after `→`) the whole word when the analyzer could build it. It guesses the role letter and ending from the English, so change them to fit your sentence.",
    "- A grammar line gives an English cue, the form the teaching section writes for that job (in backticks), and the section. The examples below show many of these forms in sentences.",
    "- Usual order: subject, direct object, verb, then the extra noun that receives (who is given or told). An adjective goes right after its noun; a `w` word goes right before the word it grades; `h` and `th` words may go anywhere. A `b` word right after a `g`, `h` or `th` word completes that word, so keep a recipient away from them.",
    "- End each statement with a period. Words the analysis marks as having no word of their own (articles, bare auxiliaries) are not written.",
  ];
}

/** Reader notes for the constructions the suggested sections teach and the examples use. */
function readerNotes(links: ReadonlySet<string>, examples: readonly ExamplePair[], context: PromptContext): string[] {
  const ids = new Set<string>();
  for (const [id, anchor] of context.anchors ?? []) if (links.has(anchor)) ids.add(id);
  for (const pair of examples) for (const id of pair.constructions) ids.add(id);
  const out = new Set<string>();
  for (const id of [...ids].sort()) {
    const reader = context.readers.get(id);
    if (reader) out.add(reader);
  }
  return [...out];
}

function legend(examples: readonly ExamplePair[], context: PromptContext): string[] {
  const out: string[] = [];
  const labels = [...new Set(examples.flatMap((pair) => pair.labels))].sort();
  for (const label of labels) {
    const text = GLOSS_READER.labels[label] ?? context.labelGlosses.get(label);
    if (text) out.push(`- \`${label}\`: ${text}`);
  }
  const shown = examples.map((pair) => pair.gloss).join(" ");
  for (const [tail, text] of Object.entries(GLOSS_READER.tails)) {
    if (new RegExp(`[A-Za-z]\\${tail}(?![A-Za-z-])`).test(shown)) out.push(`- \`${tail}\` after a word: ${text}`);
  }
  return out;
}

/** The whole prompt for `inputs` (one numbered English line each when there are several). */
export function buildHelperPrompt(
  inputs: readonly HelperInput[],
  data: HelperData,
  context: PromptContext,
  options: HelperPromptOptions = {},
): string {
  const several = inputs.length > 1;
  const { wanted, links } = inputFeatures(inputs, context.anchors ?? new Map());
  const englishInputs = new Set(inputs.map((input) => input.english.trim().toLowerCase()));
  const pool = context.index.filter((pair) => !englishInputs.has(pair.sentence.trim().toLowerCase()));
  const examples = selectHelperExamples(wanted, pool, options.examples ?? 6);

  const out: string[] = [];
  out.push(
    several
      ? "Translate the numbered English lines below into Agazan, a constructed language you have not seen. An analyzer has looked up each English word in the Agazan lexicon and grammar; its suggestions follow. Take the words from them."
      : "Translate the English below into Agazan, a constructed language you have not seen. An analyzer has looked up each English word in the Agazan lexicon and grammar; its suggestions follow. Take the words from them.",
  );
  out.push("", ...writingRules(inputs));
  out.push("", renderCore());
  out.push("", "In the examples, each gloss word is one Agazan word, in the same order, and its prefix is that word's role letter.");

  const tags = [...legend(examples, context), ...readerNotes(links, examples, context).map((reader) => `- ${reader}`)];
  if (tags.length > 0) out.push("", "## Tags and constructions used here", "", ...tags);

  out.push("", "## Analysis", "");
  out.push(
    "Each slot is an English word: its word class, then one line per suggestion. A root line starts with its tier: `root` (a lexicon sense), `compound` (a dictionary compound), `overlay`, or a lead that may not fit: `alias` (a search word, not a sense), `synonym` / `broader` (WordNet: same meaning, or a kind of), `route` (built from a pattern the docs teach), `live` (a compound built on the spot). Lines under `N jobs [pick one]` are alternatives: pick by meaning. A `gap` has no suggestion.",
    "",
  );
  inputs.forEach(({ english, analysis }, k) => {
    out.push(several ? `### ${k + 1}. ${english}` : `### ${english}`, "", "```", ...analysisLines(data, analysis), "```", "");
  });
  out.pop();

  if (examples.length > 0) {
    out.push("", "## Examples", "");
    for (const pair of examples) {
      out.push(`AGAZAN: ${pair.agazan}`, `Gloss: ${pair.gloss}`, `English: "${pair.sentence}"${pair.note ? ` (${pair.note})` : ""}`, "");
    }
    out.pop();
  }

  out.push("", "## Task", "");
  out.push(
    "- Take every root and grammar form from the analysis. Never make up a root or a spelling.",
    "- The analyzer matches words, not meanings. Choosing between suggestions, and rephrasing by meaning, is your job: for a gap, say the same thing with suggested roots if you can (*a room for sleeping* for a word with no root), or leave it out and name it in the note.",
    "- Leads are guesses: use one only when its sense fits the sentence.",
    "- Keep who does what to whom, negation, and the speaker's stance. Do not add what the English does not say.",
    "- If you can run commands in the Agazan repository, check each draft before you reply: `node scripts/english-helper.mjs '<english>' --verify '<draft>'` shows the parse error, or the word-by-word gloss and any word the lexicon does not know. Fix every error. Then run `node scripts/parse.mjs --llm-prompt '<draft>'`, answer that prompt, and compare its English with the input. Revise when the meaning differs.",
  );
  const shape = "AGAZAN: <sentence> (<note>)";
  out.push(
    "",
    several
      ? `Reply with exactly one line per English line, starting with its number: \`1 ${shape}\`. The note is optional: name any English word you could not translate, or a choice the reader should know about. Nothing else.`
      : `Reply with exactly one line: \`${shape}\`. The note is optional: name any English word you could not translate, or a choice the reader should know about. Nothing else.`,
  );

  out.push("", several ? "## English lines" : "## English", "");
  inputs.forEach(({ english }, k) => out.push(several ? `${k + 1} ${english}` : english));
  return out.join("\n") + "\n";
}

/** Analyze each English line, then build the prompt: shared by the CLI and the Inspect page. */
export function promptForEnglish(
  texts: readonly string[],
  data: HelperData,
  context: PromptContext,
  options: HelperPromptOptions & AnalyzeOptions = {},
): string {
  const { examples, ...analyze } = options;
  const inputs = texts.map((english) => ({ english, analysis: analyzeEnglish(data, english, analyze) }));
  return buildHelperPrompt(inputs, data, context, examples === undefined ? {} : { examples });
}
