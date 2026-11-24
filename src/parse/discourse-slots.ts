/**
 * The discourse slots (interpreter.md#discourse-slots): each piece of state that crosses a period, with what sets it,
 * what reads it, what ends it, whether each speaker keeps their own, and whether it reaches into a quote or an aside.
 * Nothing inside an aside sets a slot (spans.md#asides-th). Each cell
 * cites the section that states it; a cell no page states is `unstated` and keeps what the code does today, which it
 * names, as in the boundary table (interpreter.md#boundaries).
 *
 * Consulted by `carriedFrames` (carry.ts) for its end events and its per-speaker rule, and by the reader's
 * `pointBackLinks` (read.ts) for whether a point-back looks past a speaker change or out of a quote.
 */

/** The slots. */
export type SlotId = "carriedFrame" | "topic" | "standInBack" | "hookResume" | "supposition" | "sentenceBefore" | "answer";

/** What may end a slot's value. */
export type EndEvent = "newValue" | "statementWord" | "byTheWay" | "goodbye";

/** Whether an event ends the value. A goodbye that ends every speaker's value, not only its own speaker's, says so. */
export type EndCell =
  | { verdict: "ends"; anchor: string; everyone?: true }
  | { verdict: "keeps"; anchor: string }
  | { verdict: "unstated"; anchor: ""; today: "ends" | "keeps" };

/** Whether each speaker keeps a value of their own, or the speakers share one. */
export type KeptCell = { verdict: "speaker" | "shared"; anchor: string } | { verdict: "unstated"; anchor: ""; today: "speaker" | "shared" };

/** Whether the value from outside a quote reaches a reading inside it. */
export type QuoteCell = { verdict: "passes" | "blocks"; anchor: string } | { verdict: "unstated"; anchor: ""; today: "passes" | "blocks" };

/** Whether the value from outside an aside reaches a reading inside it. A stated cell the code does not follow yet says so. */
export type AsideCell = { verdict: "passes"; anchor: string; today?: "blocks" } | { verdict: "blocks"; anchor: string; today?: never };

export type SlotRow = {
  id: SlotId;
  what: string;
  setBy: string;
  /** What reads it, and the links that record a read (`kind key`, a key prefix ending in `:` covers its keys). */
  readBy: { what: string; links: readonly string[] };
  endedBy: Record<EndEvent, EndCell>;
  kept: KeptCell;
  quote: QuoteCell;
  aside: AsideCell;
  /** The sections that state the slot. */
  anchors: readonly string[];
};

export const SLOT_IDS: readonly SlotId[] = ["carriedFrame", "topic", "standInBack", "hookResume", "supposition", "sentenceBefore", "answer"];

export const END_EVENTS: Readonly<Record<EndEvent, string>> = {
  newValue: "a new value",
  statementWord: "a written statement word (`yal`, `yam`, `yar`) as the real act",
  byTheWay: "*by the way* (`xavedam`)",
  goodbye: "a goodbye",
};

const CARRY = "evidentiality.md#carry-forward";
const NOTIONAL = "notional.md#notional-as-if-framing";
const TOPIC = "topic.md#topic";
const TOPIC_QUOTE = "topic.md#topic-dependents";
const BACK = "stand-in-vowels.md#stand-in-back";
const RESUME = "in-clause-hooks.md#hook-resume";
const LINKERS = "sentence-linkers.md#sentence-linkers";
const ASIDES = "spans.md#asides-th";
const ASIDE_TOPIC = "quote-contents.md#topic-quotes";

/** Stated as passing into an aside: a back reference in it reads the value where the aside sits. */
const asidePasses = (anchor: string): AsideCell => ({ verdict: "passes", anchor });
const asideBlocks: AsideCell = { verdict: "blocks", anchor: ASIDES };

const ends = (anchor: string): EndCell => ({ verdict: "ends", anchor });
const keeps = (anchor: string): EndCell => ({ verdict: "keeps", anchor });
const unstatedEnd = (today: "ends" | "keeps"): EndCell => ({ verdict: "unstated", anchor: "", today });
const unstatedKept = (today: "speaker" | "shared"): KeptCell => ({ verdict: "unstated", anchor: "", today });
const unstatedQuote = (today: "passes" | "blocks"): QuoteCell => ({ verdict: "unstated", anchor: "", today });

/** Every event after the value's own sentence replaces it: it lasts one sentence. Today's behavior; no page states it. */
const ONE_SENTENCE: Record<EndEvent, EndCell> = {
  newValue: unstatedEnd("ends"),
  statementWord: unstatedEnd("ends"),
  byTheWay: unstatedEnd("ends"),
  goodbye: unstatedEnd("ends"),
};

/** The discourse slot table. */
export const DISCOURSE_SLOTS: readonly SlotRow[] = [
  {
    id: "carriedFrame",
    what: "the carried frame: a channel, holder or NOTIONAL, a dated channel with its offset",
    setBy: "a channel, NOTIONAL or holder on a statement's main clause",
    readBy: { what: "a later statement with no such frame of its own", links: ["carriedFrame carry:"] },
    endedBy: {
      newValue: ends(CARRY),
      statementWord: ends(CARRY),
      byTheWay: ends(CARRY),
      goodbye: { verdict: "ends", anchor: CARRY, everyone: true },
    },
    kept: { verdict: "speaker", anchor: CARRY },
    quote: { verdict: "blocks", anchor: CARRY },
    aside: asideBlocks,
    anchors: [CARRY, "holder.md#naming-a-holder", NOTIONAL, "dated-channel.md#counting-from-now"],
  },
  {
    id: "topic",
    what: "the topic",
    setBy: "an `/x/` introduce or return at the start of a sentence",
    readBy: { what: "the topic pronoun", links: ["anaphor anaphor:topic"] },
    endedBy: { newValue: ends(TOPIC), statementWord: keeps(TOPIC), byTheWay: ends(TOPIC), goodbye: ends(TOPIC) },
    kept: { verdict: "shared", anchor: TOPIC },
    quote: { verdict: "blocks", anchor: TOPIC_QUOTE },
    aside: asidePasses(ASIDE_TOPIC),
    anchors: [TOPIC, "topic.md#topic-pronoun"],
  },
  {
    id: "standInBack",
    what: "the latest content per act vowel",
    setBy: "a sentence, by its act vowel (none states), or a dependent a stand-in of that vowel fills",
    readBy: { what: "a stand-in on `-rth`", links: ["standInBack lexReading:standInBack"] },
    endedBy: { newValue: ends(BACK), statementWord: unstatedEnd("keeps"), byTheWay: unstatedEnd("keeps"), goodbye: unstatedEnd("keeps") },
    kept: unstatedKept("shared"),
    quote: { verdict: "blocks", anchor: BACK },
    aside: asidePasses(ASIDES),
    anchors: [BACK],
  },
  {
    id: "hookResume",
    what: "the latest extra-noun hook per vowel",
    setBy: "an extra-noun hook with a landmark (stacked vowels: per vowels)",
    readBy: { what: "an extra-noun hook on `-r` (`er`, `aor`)", links: ["hookResume hookJob:resume"] },
    endedBy: {
      newValue: unstatedEnd("ends"),
      statementWord: unstatedEnd("keeps"),
      byTheWay: unstatedEnd("keeps"),
      goodbye: unstatedEnd("keeps"),
    },
    kept: unstatedKept("shared"),
    quote: { verdict: "blocks", anchor: RESUME },
    aside: asidePasses(ASIDES),
    anchors: [RESUME],
  },
  {
    id: "supposition",
    what: "the NOTIONAL supposition a question points to",
    setBy: "a stated reading with a NOTIONAL frame",
    readBy: { what: "a question with a NOTIONAL frame", links: ["supposition link:supposition"] },
    endedBy: {
      newValue: unstatedEnd("ends"),
      statementWord: unstatedEnd("keeps"),
      byTheWay: unstatedEnd("keeps"),
      goodbye: unstatedEnd("keeps"),
    },
    kept: unstatedKept("shared"),
    quote: unstatedQuote("blocks"),
    aside: asideBlocks,
    anchors: [NOTIONAL],
  },
  {
    id: "sentenceBefore",
    what: "the sentence before",
    setBy: "every sentence",
    readBy: {
      what: "a sentence linker, a discourse hook, a polar word",
      links: ["linker unit:linker", "discourse edge:hook", "discourse hookJob:discourse", "polar edge:polar"],
    },
    endedBy: { ...ONE_SENTENCE, newValue: ends(LINKERS) },
    kept: unstatedKept("shared"),
    quote: unstatedQuote("blocks"),
    aside: asideBlocks,
    anchors: [LINKERS, "hooks.md#discourse-hooks", "questions.md#polar-particle"],
  },
  {
    id: "answer",
    what: "the question an answer fills",
    setBy: "a question",
    readBy: { what: "the reply right after it", links: ["answer answer:answer"] },
    endedBy: ONE_SENTENCE,
    kept: unstatedKept("shared"),
    quote: unstatedQuote("blocks"),
    aside: asideBlocks,
    anchors: ["questions.md#fill-ask"],
  },
];

const BY_ID = new Map(DISCOURSE_SLOTS.map((row) => [row.id, row]));

export function slotRow(id: SlotId): SlotRow {
  return BY_ID.get(id)!;
}

/** Whether the code ends the slot's value at the event (an unstated cell keeps today's behavior). */
export function endsAt(id: SlotId, event: EndEvent): boolean {
  const cell = slotRow(id).endedBy[event];
  return (cell.verdict === "unstated" ? cell.today : cell.verdict) === "ends";
}

/** Whether a goodbye ends every speaker's value, not only its own speaker's. */
export function goodbyeEndsEveryone(id: SlotId): boolean {
  const cell = slotRow(id).endedBy.goodbye;
  return cell.verdict === "ends" && cell.everyone === true;
}

/** Whether the value from outside a quote reaches a reading inside it (an unstated cell keeps today's behavior). */
export function reachesQuote(id: SlotId): boolean {
  const cell = slotRow(id).quote;
  return (cell.verdict === "unstated" ? cell.today : cell.verdict) === "passes";
}

/** Whether each speaker keeps a value of their own (an unstated cell keeps today's behavior). */
export function perSpeaker(id: SlotId): boolean {
  const cell = slotRow(id).kept;
  return (cell.verdict === "unstated" ? cell.today : cell.verdict) === "speaker";
}

/** A cell's label: its verdict, `unstated (today: …)`, or `passes (today: blocks)`. */
export function slotCellLabel(cell: EndCell | KeptCell | QuoteCell | AsideCell): string {
  if (cell.verdict === "unstated") return `unstated (today: ${cell.today})`;
  if ("today" in cell && cell.today) return `${cell.verdict} (today: ${cell.today})`;
  return "everyone" in cell && cell.everyone ? `${cell.verdict} (every speaker's)` : cell.verdict;
}

/** Every cell with its row and column, in table order. */
export function slotCells(): { id: SlotId; column: EndEvent | "kept" | "quote" | "aside"; cell: EndCell | KeptCell | QuoteCell | AsideCell }[] {
  return DISCOURSE_SLOTS.flatMap((row) => [
    ...(Object.keys(END_EVENTS) as EndEvent[]).map((column) => ({ id: row.id, column, cell: row.endedBy[column] })),
    { id: row.id, column: "kept" as const, cell: row.kept },
    { id: row.id, column: "quote" as const, cell: row.quote },
    { id: row.id, column: "aside" as const, cell: row.aside },
  ]);
}

/** The slot a link (`kind key`) reads, if any. */
export function slotOfLink(kindKey: string): SlotId | undefined {
  return DISCOURSE_SLOTS.find((row) => row.readBy.links.some((l) => (l.endsWith(":") ? kindKey.startsWith(l) : kindKey === l)))?.id;
}
