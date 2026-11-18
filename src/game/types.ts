/**
 * Shared types of the wizard sandbox engine (docs/proposals: `wizard-adventure.md`, milestone 1).
 * World state is plain JSON so a turn log, a walkthrough, or a reset can copy it.
 */
export type EntityId = string;

/** Where an entity is: loose in a room, at or on another entity, inside a container, or held. */
export type Place =
  | { rel: "room"; room: EntityId }
  | { rel: "at"; of: EntityId }
  | { rel: "in"; of: EntityId }
  | { rel: "held"; by: EntityId };

/**
 * `hidden`: in its place but not seen until found. `away`: a character who left and comes back.
 * `gone`: unmade (only a thing no quest needs).
 */
export type EntityState = "open" | "closed" | "asleep" | "sitting" | "burning" | "hidden" | "ashes" | "gone" | "away" | "wet";

export type Entity = {
  id: EntityId;
  /** Lexicon root of what it is. */
  root: string;
  /** Root of its name, called and resumed with **-n** (characters). */
  name?: string;
  place: Place;
  /** Adjective roots that hold of it (a colour). */
  props: string[];
  state: EntityState[];
  /** Steps grown past its lexicon size. */
  growth: number;
  /** Quests that need it: it is never lost for good (see quests.ts). */
  critical?: string[];
  /** For an `away` character: turns until it comes back. */
  returnsIn?: number;
  /** Rooms a door joins. */
  joins?: [EntityId, EntityId];
  /** Entities whose place this character knows even while they are hidden. */
  knows?: EntityId[];
  /** Turned into a speaking character: answers questions and takes commands. */
  talks?: boolean;
};

/** One thing that happened, for narration, role pointers, and yes/no questions about the past. */
export type WorldEvent = {
  turn: number;
  /** Verb root. */
  verb: string;
  agent?: EntityId;
  patient?: EntityId;
  recipient?: EntityId;
  place?: { hook: string; landmark: EntityId };
};

export type World = {
  turn: number;
  entities: Record<EntityId, Entity>;
  player: EntityId;
  /** Who the player is talking to: the latest call. */
  addressee?: EntityId;
  /** Entities named so far in the transcript: later mentions resume them with **-r**. */
  mentioned: EntityId[];
  events: WorldEvent[];
  /** Quest facts reached, by quest id (`asked-color`, `book-delivered`). */
  facts: string[];
  nextId: number;
};

/** How far a noun reaches from a viewer: what it sees, what it knows of, or what a search turns up (hidden things too). */
export type Scope = "visible" | "known" | "search";

/** How a turn ended. `parse`: did not parse; `beyond`: parsed, but the game cannot do it yet; `refused`: someone could not or would not. */
export type Outcome = "ok" | "parse" | "beyond" | "refused";

/** A line the game writes in Ageben, with its morph gloss, free English, and what reading it needs. */
export type Spoken = {
  ageben: string;
  gloss: string;
  english: string;
  constructions: string[];
  roots: string[];
};

export type GateCheck = { ok: boolean; constructions: string[]; roots: string[] };

export type Line =
  | { kind: "player"; ageben: string; gloss?: string }
  /** A character speaks; `gate` says whether the line is within the player's level (speech shows in Ageben either way). */
  | { kind: "speech"; speaker: EntityId; spoken: Spoken; gate: GateCheck }
  /** Narration in Ageben when `gate.ok`, else in English, the other one tap away. */
  | { kind: "narration"; english: string; spoken?: Spoken; gate?: GateCheck }
  /** A near miss: the likely meaning, modelled in Ageben, said by `speaker` (or the narrator). */
  | { kind: "recast"; speaker?: EntityId; spoken: Spoken; why?: string; source?: string }
  /** Several near misses: the player picks one. */
  | { kind: "choice"; speaker?: EntityId; options: Spoken[] }
  | { kind: "beyond"; english: string; parts: string[] }
  | { kind: "refusal"; speaker?: EntityId; english: string; spoken?: Spoken; gate?: GateCheck }
  | { kind: "confused"; speaker?: EntityId; spoken?: Spoken; card: ErrorCard }
  /** Words the engine read past without acting on them (an adverb). */
  | { kind: "note"; english: string }
  | { kind: "quest"; quest: string; english: string };

/** The parser's own report, behind a toggle. */
export type ErrorCard = { message: string; expected?: string; anchor?: string; kind: string };

export type TurnResult = {
  input: string;
  outcome: Outcome;
  lines: Line[];
  /** Morph gloss of what the player said (or of the recast that ran). */
  gloss?: string;
  constructions?: string[];
  /** The Ageben that actually ran, when a recast replaced the input. */
  ran?: string;
};
