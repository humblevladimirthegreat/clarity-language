/**
 * The sandbox scene: two rooms of a school joined by a door, two people to talk to, and a few things.
 * Every thing names its lexicon row by concrete sense. Quest-critical things carry the quests that need them.
 */
import type { GameLexicon } from "./lexicon.js";
import type { Entity, EntityId, EntityState, Place, World } from "./types.js";

export type PlaceSpec = { room: string } | { at: string } | { in: string } | { heldBy: string };

export type ThingSpec = {
  id: string;
  /** Concrete sense of what it is. */
  thing: string;
  /** Concrete sense of the root its name uses. */
  name?: string;
  place: PlaceSpec;
  /** Concrete senses of its adjectives. */
  props?: string[];
  state?: EntityState[];
  critical?: string[];
  talks?: boolean;
  knows?: string[];
  joins?: [string, string];
};

export type SceneSpec = {
  /** The player's room. */
  start: string;
  rooms: { id: string; thing: string }[];
  things: ThingSpec[];
};

export const PLAYER: EntityId = "player";

export const SANDBOX: SceneSpec = {
  start: "hall",
  rooms: [
    { id: "hall", thing: "school" },
    { id: "study", thing: "room" },
  ],
  things: [
    { id: "guard", thing: "guard", name: "lion", place: { room: "hall" }, talks: true, knows: ["book"], critical: ["open-door", "deliver-book"] },
    { id: "teacher", thing: "teach", name: "hibiscus", place: { room: "study" }, talks: true, critical: ["deliver-book"] },
    { id: "door", thing: "door", place: { room: "hall" }, joins: ["hall", "study"], state: ["closed"], critical: ["open-door", "deliver-book"] },
    { id: "table", thing: "table", place: { room: "hall" } },
    { id: "magnifier", thing: "magnify", place: { at: "table" }, critical: ["deliver-book"] },
    { id: "bell", thing: "bell", place: { at: "table" } },
    { id: "drink", thing: "drink", place: { at: "table" } },
    { id: "chair", thing: "chair", place: { room: "hall" } },
    { id: "box", thing: "box", place: { room: "hall" }, state: ["closed"] },
    { id: "cookie", thing: "cookie", place: { in: "box" } },
    { id: "dog", thing: "dog", place: { room: "hall" } },
    { id: "money", thing: "money", place: { heldBy: "player" } },
    { id: "book", thing: "book", place: { room: "study" }, props: ["red"], state: ["hidden"], critical: ["ask-color", "deliver-book"] },
    { id: "seedling", thing: "seedling", place: { room: "study" } },
    { id: "wood", thing: "wood", place: { room: "study" } },
  ],
};

function placeOf(spec: PlaceSpec): Place {
  if ("room" in spec) return { rel: "room", room: spec.room };
  if ("at" in spec) return { rel: "at", of: spec.at };
  if ("in" in spec) return { rel: "in", of: spec.in };
  return { rel: "held", by: spec.heldBy };
}

/** A fresh world for `scene`. `playerRoot` is the learner's own name root (or the speaker special). */
export function buildWorld(scene: SceneSpec, lex: GameLexicon, playerRoot: string): World {
  const entities: Record<EntityId, Entity> = {};
  for (const room of scene.rooms) {
    entities[room.id] = { id: room.id, root: lex.root(room.thing), place: { rel: "room", room: room.id }, props: [], state: [], growth: 0 };
  }
  entities[PLAYER] = { id: PLAYER, root: playerRoot, name: playerRoot, place: { rel: "room", room: scene.start }, props: [], state: [], growth: 0, talks: true };
  for (const spec of scene.things) {
    entities[spec.id] = {
      id: spec.id,
      root: lex.root(spec.thing),
      ...(spec.name ? { name: lex.root(spec.name) } : {}),
      place: placeOf(spec.place),
      props: (spec.props ?? []).map((p) => lex.root(p)),
      state: [...(spec.state ?? [])],
      growth: 0,
      ...(spec.critical ? { critical: [...spec.critical] } : {}),
      ...(spec.talks ? { talks: true } : {}),
      ...(spec.knows ? { knows: [...spec.knows] } : {}),
      ...(spec.joins ? { joins: [...spec.joins] as [EntityId, EntityId] } : {}),
    };
  }
  return { turn: 0, entities, player: PLAYER, mentioned: [], events: [], facts: [], nextId: 1 };
}
