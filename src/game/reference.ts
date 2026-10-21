/**
 * Which entity a noun means. Start simple: the only one in reach, adjectives narrowing; with several
 * left, the character asks which. *I* and *you* follow the turn; a role pointer reads the latest event
 * with someone in that part (pronouns.md#role-pointers).
 */
import type { LexWord } from "../parse/types.js";
import { entity, knownTo, roomOf, visibleTo } from "./world.js";
import type { Entity, EntityId, NounRef, World } from "./types.js";

export type Scope = "visible" | "known" | "search";

export type Resolution =
  | { ok: true; id: EntityId }
  | { ok: false; reason: "none"; root?: string }
  | { ok: false; reason: "ambiguous"; root: string; candidates: EntityId[] }
  | { ok: false; reason: "nobody"; word: LexWord };

export type RefContext = {
  world: World;
  /** Who is speaking (whose *I* this is). */
  speaker: EntityId;
  /** Who is spoken to. */
  listener?: EntityId;
  /** Whose view the reach is measured from (the speaker, or the one asked). */
  viewer: EntityId;
  scope: Scope;
};

function adjRoot(word: LexWord): string | undefined {
  return word.family.kind === "content" && word.family.roots.length === 1 ? word.family.roots[0] : undefined;
}

/** The viewer's room and the rooms its doors lead to: places you can name and go to. */
function roomsInReach(world: World, viewer: EntityId): Entity[] {
  const here = roomOf(world, viewer);
  if (!here) return [];
  const rooms = new Set([here]);
  for (const door of visibleTo(world, viewer)) for (const room of door.joins ?? []) rooms.add(room);
  return [...rooms].map((id) => entity(world, id));
}

function inReach(ctx: RefContext): Entity[] {
  const self = entity(ctx.world, ctx.viewer);
  const rooms = roomsInReach(ctx.world, ctx.viewer);
  const things = ctx.scope === "known" ? knownTo(ctx.world, ctx.viewer) : visibleTo(ctx.world, ctx.viewer, { hidden: ctx.scope === "search" });
  return [...new Map([self, ...things, ...rooms].map((e) => [e.id, e])).values()];
}

/** Entities a role pointer can reach: the latest event with someone in that part. */
function pointerTarget(world: World, role: "agent" | "patient" | "recipient"): EntityId | undefined {
  for (let i = world.events.length - 1; i >= 0; i -= 1) {
    const id = world.events[i]![role];
    if (id) return id;
  }
  return undefined;
}

export function resolveNoun(ref: NounRef, ctx: RefContext): Resolution {
  switch (ref.kind) {
    case "speaker":
      return { ok: true, id: ctx.speaker };
    case "listener":
      return ctx.listener ? { ok: true, id: ctx.listener } : { ok: false, reason: "nobody", word: ref.word };
    case "gap":
      return { ok: false, reason: "none" };
    case "pointer": {
      const id = pointerTarget(ctx.world, ref.role);
      return id ? { ok: true, id } : { ok: false, reason: "none" };
    }
    case "name": {
      const reach = inReach(ctx);
      // A name, or a kind used as a title (`yagayun` calls the guard; speech-moves.md#vocative).
      const named = reach.filter((e) => e.name === ref.root);
      const titled = named.length ? named : reach.filter((e) => e.root === ref.root);
      return pick(titled, ref.root, ref.adjs, false);
    }
    case "content":
      return pick(
        inReach(ctx).filter((e) => e.root === ref.root),
        ref.root,
        ref.adjs,
        ref.word.ending === "l",
      );
  }
}

function pick(found: Entity[], root: string, adjs: LexWord[], anyOne: boolean): Resolution {
  let left = found;
  for (const adj of adjs) {
    const prop = adjRoot(adj);
    if (prop) left = left.filter((e) => e.props.includes(prop) || e.root === prop);
  }
  if (left.length === 0) return { ok: false, reason: "none", root };
  // A first mention (**-l**) is any one of its kind; a known one (**-r**) must be the one both mean.
  if (left.length === 1 || anyOne) return { ok: true, id: left[0]!.id };
  return { ok: false, reason: "ambiguous", root, candidates: left.map((e) => e.id) };
}
