/**
 * World state queries and changes. A door sits in both rooms it joins; a thing is seen when it shares
 * the viewer's room, is not hidden, and is not shut inside a closed container.
 */
import type { GameLexicon } from "./lexicon.js";
import { traitsOf, type Traits } from "./objects.js";
import type { Entity, EntityId, EntityState, Place, World } from "./types.js";

export function entity(world: World, id: EntityId): Entity {
  const found = world.entities[id];
  if (!found) throw new Error(`no entity ${id}`);
  return found;
}

export function has(world: World, id: EntityId, state: EntityState): boolean {
  return entity(world, id).state.includes(state);
}

export function setState(world: World, id: EntityId, state: EntityState, on = true): void {
  const e = entity(world, id);
  const rest = e.state.filter((s) => s !== state);
  e.state = on ? [...rest, state] : rest;
}

export function traits(world: World, id: EntityId, lex: GameLexicon): Traits {
  return traitsOf(entity(world, id).root, lex);
}

/** The room an entity is in (a room is its own room). */
export function roomOf(world: World, id: EntityId): EntityId | undefined {
  const seen = new Set<EntityId>();
  let current = entity(world, id);
  for (;;) {
    if (seen.has(current.id)) return undefined;
    seen.add(current.id);
    const place = current.place;
    if (place.rel === "room") return place.room === current.id ? current.id : place.room;
    const next = place.rel === "held" ? place.by : place.of;
    current = entity(world, next);
  }
}

/** The rooms an entity can be seen from: its own, and both sides of a door. */
export function roomsOf(world: World, id: EntityId): EntityId[] {
  const joins = entity(world, id).joins;
  if (joins) return [...joins];
  const room = roomOf(world, id);
  return room ? [room] : [];
}

/** Out of play: unmade, or a character who has left for now. */
export function absent(world: World, id: EntityId): boolean {
  const e = entity(world, id);
  return e.state.includes("gone") || e.state.includes("away");
}

/** Whether `viewer` can see `id` now. With `hidden`, things hidden in the room count too (searching). */
export function sees(world: World, viewer: EntityId, id: EntityId, { hidden = false }: { hidden?: boolean } = {}): boolean {
  if (viewer === id) return true;
  if (absent(world, id) || (!hidden && has(world, id, "hidden"))) return false;
  const room = roomOf(world, viewer);
  if (!room || !roomsOf(world, id).includes(room)) return false;
  const place = entity(world, id).place;
  if (place.rel === "in") return has(world, place.of, "open") && sees(world, viewer, place.of, { hidden });
  if (place.rel === "at" || place.rel === "held") return sees(world, viewer, place.rel === "at" ? place.of : place.by, { hidden });
  return true;
}

/** Everything `viewer` can see, rooms excluded. */
export function visibleTo(world: World, viewer: EntityId, options: { hidden?: boolean } = {}): Entity[] {
  return Object.values(world.entities).filter((e) => !isRoom(e) && e.id !== viewer && sees(world, viewer, e.id, options));
}

export function isRoom(e: Entity): boolean {
  return e.place.rel === "room" && e.place.room === e.id;
}

/** Entities a character knows about: what it sees, plus what it was told or always knew. */
export function knownTo(world: World, viewer: EntityId): Entity[] {
  const known = new Set(visibleTo(world, viewer).map((e) => e.id));
  for (const id of entity(world, viewer).knows ?? []) if (world.entities[id] && !absent(world, id)) known.add(id);
  return [...known].map((id) => entity(world, id));
}

export function learn(world: World, viewer: EntityId, id: EntityId): void {
  const e = entity(world, viewer);
  if (!(e.knows ?? []).includes(id)) e.knows = [...(e.knows ?? []), id];
}

export function moveTo(world: World, id: EntityId, place: Place): void {
  entity(world, id).place = place;
}

export function heldBy(world: World, holder: EntityId): Entity[] {
  return Object.values(world.entities).filter((e) => e.place.rel === "held" && e.place.by === holder && !absent(world, e.id));
}

export function contents(world: World, container: EntityId): Entity[] {
  return Object.values(world.entities).filter((e) => (e.place.rel === "in" || e.place.rel === "at") && e.place.of === container && !absent(world, e.id));
}

/** A new entity of `root` at `place`. */
export function addEntity(world: World, root: string, place: Place, extra: Partial<Entity> = {}): EntityId {
  const id = `e${world.nextId++}`;
  world.entities[id] = { id, root, place, props: [], state: [], growth: 0, ...extra };
  return id;
}

/** The door between two rooms, if any. */
export function doorBetween(world: World, a: EntityId, b: EntityId): Entity | undefined {
  return Object.values(world.entities).find((e) => e.joins && e.joins.includes(a) && e.joins.includes(b));
}

/** A deep copy (the world is plain JSON). */
export function cloneWorld(world: World): World {
  return structuredClone(world);
}
