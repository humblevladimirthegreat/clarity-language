/**
 * Translation prompt for an LLM that has never seen Agazan (docs/proposals/llm-gloss-prompt.md):
 * a fixed core that teaches the morph-gloss notation, a legend trimmed to what the input uses,
 * doc examples picked by shared constructions, and the task. Pure: the example index and the
 * label glosses come in from llm-examples.ts.
 */
import { MORPH_FORM_SUFFIXES, ROLE_VOWEL } from "./morph-gloss.js";

/** One doc example: its gloss, its free English split into sentence and note, and its features. */
export type ExamplePair = {
  gloss: string;
  sentence: string;
  note: string | null;
  /** Construction IDs the parse used ([constructions.ts](./constructions.ts)). */
  constructions: string[];
  /** SMALLCAPS labels in the gloss. */
  labels: string[];
  /** `page.md:line` of the Agazan line. */
  source: string;
};

/**
 * The fixed core: what every gloss uses. Plain English, gloss notation only, no Agazan.
 * The unit test fails when the morph line can print a prefix, role, or form suffix with no line here.
 */
export const GLOSS_READER = {
  layout: [
    "Words are separated by ` | `. Sentences are separated by ` . `.",
    "`[ … ]` groups the words that fill one slot. Nesting shows what modifies what: `[z-dog | g-blue]` is a blue dog, `[in | b-house]` is in the house.",
    "A join word comes last in its bracket and says how the items combine: `[d-tea | d-coffee | d-or-exactly-one]` = tea or coffee, exactly one of them. With one item before it, a closed join says that item is the whole list: `[z-X | z-and]` = just X, nothing more (`.open` is what leaves a list open).",
    "`LABEL[ … ]` is a package: `CITE[…]` quoted wording, `ASIDE[…]` a side remark, `SCOPE[…]` a group that a word scopes over, `NAME[…]` a titled phrase. `OPAQUE[\"…\"]` is a foreign word or raw writing: keep it as written.",
  ],
  /** One line per written prefix (clause.md#role-letters), plus prefix-less hooks under `""`. */
  prefixes: {
    y: "a turn word before the sentence: a call (`y-Azawan` = Azawan, …), a reaction, yes / no, or the speech act (`y-question` asks, `y-command` orders)",
    z: "subject: who acts, or who or what the sentence is about",
    d: "direct object: who or what is acted on",
    b: "extra noun: alone, the one the act is to or for; in a bracket after a relation word, that word's object (`[in | b-house]`)",
    v: "verb",
    g: "adjective. After a noun in a bracket it describes that noun; alone in a clause with no verb it is what the subject is (`z-dog | g-big` = the dog is big)",
    gl: "adjective written before the noun it describes",
    w: "detail (often degree) on the next `g-`, `h-`, or `th-` word",
    h: "adverb: how, when, where; with a `b-` noun in its bracket, a relation (`[h-while | b-month]`). A plan, decision, try, ability, consent, RESIDUE or FORMER on `h-` covers the whole sentence; a plan or decision does not say the act happens",
    th: "what is in a mind: by default the speaker's stance on the claim (how they know it, how sure they are, why, as if, a want, a plan, a decision, a feeling), never the subject's: `z-X | th-WANT-unstated | v-sing` = I want X to sing, and `z-X | th-plan-itinerary | v-go` = I plan for X to go. With a person joined to a channel (`th-CLUES-Azawan`), that person's view",
    x: "links this sentence to the one before (`x-however`), or names the topic",
    "": "no prefix: a hook. Between two words of the same role it relates them, and the right one is what holds: `d-tea | instead | d-coffee` = coffee instead of tea. With a `b-` noun in its bracket it is a relation (`[from | b-dog]`)",
  } as Record<string, string>,
  /** Role names in `ROLE-x-verb` and pointers (roles.md#role-compounds). */
  roles: {
    agent: "the doer",
    patient: "the one it happens to",
    recipient: "the extra party (the one told, given to)",
    scene: "where or when it happens",
    instrument: "the tool it is done with",
    goal: "where it heads",
    source: "where it comes out of",
    path: "the way it goes",
    result: "what it makes",
    bearer: "the one it goes against (who pays or loses)",
  } as Record<string, string>,
  pieces: [
    "`-x-` inside one word joins the pieces of a compound. `ROLE-x-verb` names someone by their part in that kind of event: `z-agent-x-teach` = someone who teaches.",
    "A trailing `-x` adds associates: `z-Azawan-x` = Azawan and their people; `y-listener-x` = all of you. On a kind of thing, not a name, it is just several of that kind: `z-dog-x` = dogs (no others added). On a verb or adjective, they do it or are it as a group.",
    "`←X` refers back to X, mentioned earlier: `z-←Azawan` = Azawan again (he, she, they); `z-←agent-x-teach` = the one who taught, in that earlier event.",
    "`←ROLE.same` = whoever had that part in the latest sentence that had one (he, she, it, they). `.self` = this sentence's own ROLE (themself). `.other` = the other one, an earlier and different one. `.unsaid` = whoever it was, when that sentence left the part unsaid.",
    "A dot joins the pieces of one label: words of one English phrase (`in.other.words`), or a variant of the word (`CLUES.strong`, `as-of.ledger`).",
    "A time amount in a bracket right after a stance word dates the event from now: `[th-REPORTED | [b-hour | g-three]]` = in three hours, `g-minus-three` = three hours ago; `[b-day | g-one]` = tomorrow. `b-+-e-` = a moment from now (about to), `b---e-` = a moment ago (just); with `.about`, soon / recently.",
    "`_` before digits marks a label, code, clock time, or date written in digits, not an amount (`h-_15,30` = at 15:30). `g-2nd` is an ordinal.",
    "`tag.A` names the phrase before it \"A\" for later; `←tag.A` is that one again.",
    "A tone mark before a word colors that word; alone before the sentence it colors the whole sentence: `!` strong feeling, `?` unsure, `%` joking, `&` this one and not another, `;` warm.",
  ],
  /** Form suffixes the emitter appends ({@link MORPH_FORM_SUFFIXES}). */
  suffixes: {
    ".open": "the list or range is open: there may be more (and so on, among others)",
    ".new": "a new one of the same kind (one, another)",
    ".part": "their part in the event (what they did), not the person",
    ".same": "see `←ROLE.same` above",
    ".self": "see `←ROLE.same` above",
    ".other": "see `←ROLE.same` above",
    ".unsaid": "see `←ROLE.same` above",
    ".instance": "one thing the name applies to (an Azawan, one of them)",
    ".about": "approximately; on a quoted span, a paraphrase",
    ".named": "used as a fixed name or title",
    ".again": "the same number as before",
    ".name": "the name tagged earlier",
    ".spelled": "a writing choice only; ignore",
    ".short": "a writing choice only; ignore",
  } as Record<string, string>,
  /** Variant tails of closed overlay labels (`CLUES.strong`); the legend shows the ones a gloss uses. */
  tails: {
    ".strong": "strong evidence",
    ".weak": "weak evidence",
    ".firm": "against a firm expectation",
    ".mild": "against a loose expectation",
    ".lasting": "not expected to change back",
    ".for-now": "paused, expected to resume",
    ".maybe-never": "the change may never come",
    ".fault": "and the reason broke a norm (blame)",
    ".share": "one reason among others",
    ".ledger": "as of a stated time, as the records stood then",
    ".bookmark": "as of a supposed time the speaker is not claiming",
  } as Record<string, string>,
  /** Capital labels that are not stance tags: always explained in the core. */
  labels: {
    SELF: "the speaker's own name: translate as I / me",
    TOPIC: "the current topic (it, them)",
    ONE: "people in general (one, you)",
  } as Record<string, string>,
  rules: [
    "Capitalized words like Azawan, Alahen, Ahaben are personal names.",
    "No tense is marked on the verb. Use the present by default. Use the past when the gloss puts the event before now (a past date or day, MEMORY, RESIDUE, FORMER, a past as-of) or reports an event that is over (hearsay or clues about something that happened, a quote). Use will for a forecast or a later date. Never add a time word the gloss does not have.",
    "Keep vague things vague: do not add a gender, a time, or a count the gloss leaves open. Use they / them for a person whose gender is not given.",
  ],
};

/** Role names the emitter prints (`ROLE_VOWEL`); re-exported for the coverage test. */
export const EMITTED_ROLES: readonly string[] = [...new Set(Object.values(ROLE_VOWEL))];
export const EMITTED_SUFFIXES: readonly string[] = MORPH_FORM_SUFFIXES;

export function renderCore(): string {
  const lines: string[] = ["## How to read the gloss", ""];
  for (const line of GLOSS_READER.layout) lines.push(`- ${line}`);
  lines.push("", "Each word is `prefix-english`. The prefix is the word's job:", "");
  for (const [prefix, text] of Object.entries(GLOSS_READER.prefixes)) {
    lines.push(prefix ? `- \`${prefix}-\` ${text}` : `- ${text}`);
  }
  lines.push("", "Roles (in `ROLE-x-verb` and `←ROLE.same`):", "");
  lines.push(
    Object.entries(GLOSS_READER.roles)
      .map(([role, text]) => `${role} = ${text}`)
      .join("; ") + ".",
  );
  lines.push("");
  for (const line of GLOSS_READER.pieces) lines.push(`- ${line}`);
  lines.push("", "Endings after a dot:", "");
  const grouped = new Map<string, string[]>();
  for (const [suffix, text] of Object.entries(GLOSS_READER.suffixes)) {
    grouped.set(text, [...(grouped.get(text) ?? []), suffix]);
  }
  for (const [text, suffixes] of grouped) {
    if (text.startsWith("see ")) continue;
    lines.push(`- ${suffixes.map((s) => `\`${s}\``).join(" / ")}: ${text}`);
  }
  lines.push("");
  for (const line of GLOSS_READER.rules) lines.push(`- ${line}`);
  return lines.join("\n");
}

const LABEL_RE = /(?<![A-Za-z])([A-Z]{2,}(?:-[A-Z]+)*)(?![a-z])/g;

/**
 * SMALLCAPS labels in a gloss line (quoted payloads skipped). A hyphenated run is one label
 * (`ON-BEHALF`), several joined (`CLUES-TOPIC`, `AIMED-FLOWING`), or both (`ON-BEHALF-FLOWING`),
 * so every contiguous sub-run is listed; the legend keeps the ones it can explain.
 */
export function glossLabels(gloss: string): string[] {
  const flat = gloss.replace(/"(?:[^"]|"")*"/g, '""');
  const out = new Set<string>();
  for (const m of flat.matchAll(LABEL_RE)) {
    const pieces = m[1]!.split("-");
    for (let i = 0; i < pieces.length; i++) {
      for (let j = i + 1; j <= pieces.length; j++) {
        const run = pieces.slice(i, j).join("-");
        if (run.length > 1) out.add(run);
      }
    }
  }
  return [...out].sort();
}

/** Labels the core already explains, or that packages explain (`CITE[`), need no legend line. */
const CORE_LABELS = new Set(["CITE", "ASIDE", "SCOPE", "NAME", "OPAQUE"]);

export function normalizeGloss(gloss: string): string {
  return gloss.replace(/\s+/g, " ").trim();
}

/** Features an example can share with the input: construction IDs plus `label:X`. */
function features(constructions: readonly string[], labels: readonly string[]): string[] {
  return [...constructions, ...labels.map((label) => `label:${label}`)];
}

/** Inverse document frequency of each feature across the index. */
export function featureWeights(index: readonly ExamplePair[]): Map<string, number> {
  const df = new Map<string, number>();
  for (const pair of index) {
    for (const f of new Set(features(pair.constructions, pair.labels))) df.set(f, (df.get(f) ?? 0) + 1);
  }
  const n = index.length || 1;
  const weights = new Map<string, number>();
  for (const [f, count] of df) weights.set(f, Math.log(n / count));
  return weights;
}

export type SelectOptions = {
  /** How many examples (default 4). */
  count?: number;
  /** Glosses never to pick (the input's own). */
  exclude?: Iterable<string>;
  weights?: Map<string, number>;
};

/** A feature at least this weight (in about a third of the index or fewer) is rare enough to pick an example for. */
const RARE_WEIGHT = 1;
/** Examples shown even when nothing rare is shared, so the model still sees the reply format. */
const MIN_EXAMPLES = 2;

/**
 * Greedy pick: each next example covers the most rare input features not already covered,
 * less a small cost for features the input does not use. Picking stops when no example covers a
 * new rare feature, once {@link MIN_EXAMPLES} are in. A note example is added when one shares a
 * rare feature with the input; at least one pick has no note when the pool allows.
 */
export function selectExamples(
  input: { constructions: readonly string[]; labels: readonly string[] },
  index: readonly ExamplePair[],
  options: SelectOptions = {},
): ExamplePair[] {
  const count = options.count ?? 4;
  if (count <= 0) return [];
  const weights = options.weights ?? featureWeights(index);
  const weight = (f: string) => weights.get(f) ?? 0;
  const exclude = new Set([...(options.exclude ?? [])].map(normalizeGloss));
  const wanted = new Set(features(input.constructions, input.labels));
  const pool = index.filter((pair) => !exclude.has(normalizeGloss(pair.gloss)));

  const covered = new Set<string>();
  const score = (pair: ExamplePair) => {
    let gain = 0;
    let extra = 0;
    for (const f of new Set(features(pair.constructions, pair.labels))) {
      if (wanted.has(f)) {
        if (!covered.has(f)) gain += weight(f);
      } else {
        extra += weight(f);
      }
    }
    return gain - 0.1 * extra;
  };
  const best = (candidates: ExamplePair[]) => {
    let top: ExamplePair | undefined;
    let topScore = -Infinity;
    for (const pair of candidates) {
      const s = score(pair);
      // Ties go to the shorter gloss: less to read, fewer stray tags.
      if (s > topScore || (s === topScore && top && pair.gloss.length < top.gloss.length)) {
        top = pair;
        topScore = s;
      }
    }
    return top;
  };

  const rare = (f: string) => wanted.has(f) && weight(f) >= RARE_WEIGHT;
  const sharesRare = (pair: ExamplePair) => features(pair.constructions, pair.labels).some(rare);
  const addsRare = (pair: ExamplePair) => features(pair.constructions, pair.labels).some((f) => rare(f) && !covered.has(f));

  const picked: ExamplePair[] = [];
  const take = (pair: ExamplePair) => {
    picked.push(pair);
    for (const f of features(pair.constructions, pair.labels)) covered.add(f);
  };
  while (picked.length < count) {
    const next = best(pool.filter((pair) => !picked.includes(pair) && addsRare(pair)));
    if (!next) break;
    take(next);
  }
  while (picked.length < Math.min(count, MIN_EXAMPLES)) {
    const next = best(pool.filter((pair) => !picked.includes(pair)));
    if (!next) break;
    take(next);
  }

  // Show both shapes: a note exists, and most sentences need none. A note example must share
  // something rare, or the model learns to annotate the wrong thing. With no room left, greedy
  // order puts the weakest pick last, so a swap replaces it.
  const ensure = (hasNote: boolean, relevant: boolean) => {
    if (picked.length === 0 || picked.some((pair) => (pair.note != null) === hasNote)) return;
    const room = picked.length < count;
    // A swap pushes out a pick, so its replacement must be relevant too.
    const needRare = relevant || !room;
    const swap = best(
      pool.filter((pair) => !picked.includes(pair) && (pair.note != null) === hasNote && (!needRare || sharesRare(pair))),
    );
    if (!swap) return;
    if (room) picked.push(swap);
    else picked[picked.length - 1] = swap;
  };
  ensure(true, true);
  if (picked.length > 1) ensure(false, false);
  return picked;
}

export type PromptOptions = {
  /** Ask for the sentence only, no note. */
  loose?: boolean;
  /** Examples to show (default 4; 0 for legend only). */
  examples?: number;
};

export type PromptContext = {
  index: readonly ExamplePair[];
  /** SMALLCAPS label → plain-English gloss (terminology.md closed labels). */
  labelGlosses: ReadonlyMap<string, string>;
  /** Construction ID → reader note (only constructions that have one). */
  readers: ReadonlyMap<string, string>;
  weights?: Map<string, number>;
};

function formatEnglish(pair: Pick<ExamplePair, "sentence" | "note">, loose: boolean): string {
  return loose || pair.note == null ? `"${pair.sentence}"` : `"${pair.sentence}" (${pair.note})`;
}

/**
 * The whole prompt for one passage. `glosses` has one line per input (numbered when there are
 * several); `constructions` are the passage's construction IDs.
 */
export function buildPrompt(
  glosses: readonly string[],
  constructions: readonly string[],
  context: PromptContext,
  options: PromptOptions = {},
): string {
  const loose = options.loose ?? false;
  const several = glosses.length > 1;
  const labels = [...new Set(glosses.flatMap(glossLabels))].sort();

  const examples = selectExamples({ constructions, labels }, context.index, {
    count: options.examples ?? 4,
    exclude: glosses,
    weights: context.weights,
  });

  const out: string[] = [];
  out.push(
    several
      ? "Below is a word-by-word gloss of a short passage in a constructed language, one numbered line per input. Translate it into English."
      : "Below is a word-by-word gloss of a sentence in a constructed language. Translate it into English.",
  );
  out.push("", renderCore());

  // Legend: tags in the input and in the examples, then construction notes for the input.
  const legendLabels = [...new Set([...labels, ...examples.flatMap((pair) => pair.labels)])]
    .filter((label) => !CORE_LABELS.has(label))
    .sort();
  const legend: string[] = [];
  for (const label of legendLabels) {
    const text = GLOSS_READER.labels[label] ?? context.labelGlosses.get(label);
    if (text) legend.push(`- \`${label}\`: ${text}`);
  }
  const shown = [...glosses, ...examples.map((pair) => pair.gloss)].join(" ");
  for (const [tail, text] of Object.entries(GLOSS_READER.tails)) {
    if (new RegExp(`[A-Za-z]\\${tail}(?![A-Za-z-])`).test(shown)) legend.push(`- \`${tail}\` after a word: ${text}`);
  }
  // Several constructions can share one note (the bar productions, the scope vowels).
  const readers = new Set<string>();
  for (const id of [...new Set(constructions)].sort()) {
    const reader = context.readers.get(id);
    if (reader && !readers.has(reader)) {
      readers.add(reader);
      legend.push(`- ${reader}`);
    }
  }
  if (legend.length > 0) out.push("", "## Tags used here", "", ...legend);

  if (examples.length > 0) {
    out.push("", "## Examples", "");
    for (const pair of examples) {
      out.push(`Gloss: ${pair.gloss}`, `ENGLISH: ${formatEnglish(pair, loose)}`, "");
    }
    out.pop();
  }

  out.push("", "## Task", "");
  out.push(
    "Write what a fluent English speaker would say. Keep who does what to whom, negation, and any stance that changes the claim (whose view it is, how it is known, a plan or a want).",
    'When English has a natural phrase for a tag ("it looks like", "I can see it", "as I remember", "used to"), put it in the sentence. The examples show the usual phrase for each tag: reuse it.',
    "Do not add a source, reason, time, or count the gloss does not have.",
  );
  if (loose) {
    out.push("Give the sentence only, with no note.");
  } else {
    out.push(
      "If the gloss marks something your sentence still leaves out (whose feeling or clue it is, whether a list is closed or open, cause versus blame, who a pointer refers to), add one short plain-English note in parentheses after the sentence. Otherwise add nothing, and never a note that repeats the sentence. A note never uses gloss tags or grammar terms, and is about the meaning, never about the gloss: no note on what the gloss leaves unsaid, on tense, or on how you read it.",
    );
  }
  const shape = loose ? 'ENGLISH: "<sentence>"' : 'ENGLISH: "<sentence>" (<note>), with the note optional';
  out.push(
    several
      ? `Reply with exactly one line per gloss line, starting with its number: \`1 ${shape}\`. Nothing else.`
      : `Reply with exactly one line: \`${shape}\`. Nothing else.`,
  );

  out.push("", several ? "## Gloss lines" : "## Gloss", "");
  glosses.forEach((gloss, k) => out.push(several ? `${k + 1} ${gloss}` : gloss));
  return out.join("\n") + "\n";
}
