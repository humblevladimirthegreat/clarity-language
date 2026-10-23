/**
 * Answering the player's questions from what the one asked knows: yes/no from the world and its past
 * events, and fill-asks (questions.md#fill-ask) with a fragment or a full clause.
 */
import { capitalize, clause, listEnglish, nameOf, refuse, remember, speak, speakFixed, type Ctx } from "./context.js";
import {
  adjectiveDrafts,
  citationDrafts,
  listDrafts,
  placeFragmentDrafts,
  reportDrafts,
  whichDrafts,
} from "./generate.js";
import { resolveNoun, type RefContext, type Resolution } from "./reference.js";
import { entity, has, heldBy, learn, roomOf, visibleTo } from "./world.js";
import type { Act, EntityId, EntityState, NounRef, Outcome, World } from "./types.js";

/** Verbs whose truth is a standing state of the doer (`sleep`, `chair` as *sit*) or of the thing (`door` as *open*, `fire` as *burn*). */
const DOER_STATES: Record<string, EntityState> = { sleep: "asleep", chair: "sitting" };
const THING_STATES: Record<string, EntityState> = { door: "open", fire: "burning" };
/** Adjectives that read as a state while it lasts (predication.md#in-progress). */
const STATE_ADJECTIVES: Record<string, EntityState> = { sleep: "asleep", fire: "burning" };

export type Truth = "yes" | "no" | "unknown";

function refFor(ctx: Ctx, answerer: EntityId): RefContext {
  return { world: ctx.world, speaker: ctx.world.player, listener: answerer, viewer: answerer, scope: "known" };
}

function rootOf(word: { family: { kind: string; roots?: string[] } }): string | undefined {
  return word.family.kind === "content" && word.family.roots?.length === 1 ? word.family.roots[0] : undefined;
}

/** Where a thing is, as a hook and a landmark (`al` + its room when it is loose there). */
export function whereIs(world: World, id: EntityId): { hook: string; landmark: EntityId } | undefined {
  const place = entity(world, id).place;
  if (place.rel === "room") return { hook: "al", landmark: place.room };
  if (place.rel === "in") return { hook: "al", landmark: place.of };
  if (place.rel === "at") return { hook: "el", landmark: place.of };
  return { hook: "ol", landmark: place.by };
}

function placeHolds(world: World, id: EntityId, hook: string, landmark: EntityId): boolean {
  const where = whereIs(world, id);
  if (!where) return false;
  if (where.landmark === landmark) return true;
  // *In the room* also holds of what sits at a table in that room.
  return hook === "al" && roomOf(world, id) === landmark;
}

/** Whether the act's claim holds, as `answerer` knows the world. */
export function truthOf(ctx: Ctx, act: Act, answerer: EntityId): Truth {
  const ref = refFor(ctx, answerer);
  const resolve = (noun: NounRef | undefined): Resolution | undefined => (noun ? resolveNoun(noun, ref) : undefined);
  const subject = resolve(act.subject);
  if (subject && !subject.ok) return subject.reason === "none" && !act.verb ? "no" : "unknown";
  const id = subject?.ok ? subject.id : undefined;
  const { world, lex } = ctx;

  if (id) {
    for (const adj of act.predicate) {
      const root = rootOf(adj);
      if (!root) return "unknown";
      const e = entity(world, id);
      const state = STATE_ADJECTIVES[lex.concrete(root)];
      if (!(e.props.includes(root) || e.root === root || (state && e.state.includes(state)))) return "no";
    }
    for (const place of act.places) {
      const landmark = resolve(place.landmark);
      if (!landmark?.ok || !placeHolds(world, id, place.hook, landmark.id)) return "no";
    }
  }
  if (!act.verb || "gap" in act.verb) return id ? "yes" : "unknown";

  const verb = lex.concrete(act.verb.root);
  const object = resolve(act.object);
  const recipient = resolve(act.recipient);
  if ((object && !object.ok) || (recipient && !recipient.ok)) return "no";
  const doerState = DOER_STATES[verb];
  if (doerState && id) return has(world, id, doerState) ? "yes" : "no";
  const thingState = THING_STATES[verb];
  const thing = object?.ok ? object.id : undefined;
  if (thingState && thing) return has(world, thing, thingState) ? "yes" : "no";
  if (verb === "eye" && id && thing) return visibleTo(world, id).some((e) => e.id === thing) ? "yes" : "no";
  if (verb === "luggage" && id && thing) return heldBy(world, id).some((e) => e.id === thing) ? "yes" : "no";
  const verbRoot = act.verb.root;
  const happened = world.events.some(
    (e) =>
      e.verb === verbRoot &&
      (!id || e.agent === id) &&
      (!thing || e.patient === thing) &&
      (!recipient?.ok || e.recipient === recipient.id),
  );
  return happened ? "yes" : "no";
}

function noteTold(world: World, fact: string): void {
  if (!world.facts.includes(fact)) world.facts.push(fact);
}

/** A yes/no question: `yael.` / `yuel.`, or the character says they cannot tell. */
export function answerYesNo(ctx: Ctx, act: Act, answerer: EntityId): Outcome {
  const truth = truthOf(ctx, act, answerer);
  const named = act.subject ? resolveNoun(act.subject, refFor(ctx, answerer)) : undefined;
  if (named?.ok) remember(ctx, [named.id]);
  if (truth === "unknown") return refuse(ctx, `${capitalize(nameOf(ctx, answerer))} cannot say.`, answerer);
  speakFixed(ctx, answerer, truth === "yes" ? "yes" : "no");
  const subject = act.subject ? resolveNoun(act.subject, refFor(ctx, answerer)) : undefined;
  if (subject?.ok) for (const adj of act.predicate) noteTold(ctx.world, `told:${subject.id}:${rootOf(adj) ?? adj.raw}`);
  return "ok";
}

function cannotSay(ctx: Ctx, answerer: EntityId): Outcome {
  return refuse(ctx, `${capitalize(nameOf(ctx, answerer))} does not know.`, answerer);
}

/** A resolution that failed: ask which one, or say there is none. */
export function unresolved(ctx: Ctx, res: Exclude<Resolution, { ok: true }>, asker: EntityId | undefined): Outcome {
  if (res.reason === "ambiguous") {
    if (asker && speak(ctx, asker, whichDrafts(ctx.gen, res.root))) return "refused";
    return refuse(ctx, `Which ${ctx.gen.nounEnglish(res.root)}? There is more than one.`);
  }
  if (res.reason === "nobody") return refuse(ctx, "No one is listening to be *you*. Call someone first.");
  const what = res.root ? ctx.gen.nounEnglish(res.root) : "one";
  return refuse(ctx, asker ? `${capitalize(nameOf(ctx, asker))} knows of no ${what} here.` : `There is no ${what} here.`, asker);
}

/** A fill-ask: name what fills the blank. */
export function answerFill(ctx: Ctx, act: Act, answerer: EntityId): Outcome {
  const { world } = ctx;
  const ref = refFor(ctx, answerer);
  const view = { speaker: answerer, listener: world.player };
  const subject = act.subject && act.subject.kind !== "gap" ? resolveNoun(act.subject, ref) : undefined;
  if (subject && !subject.ok) return unresolved(ctx, subject, answerer);
  const id = subject?.ok ? subject.id : undefined;
  if (id) remember(ctx, [id]);

  // Where? (`el bar`, `al bar`; fill-ask-jobs.md#where)
  if (act.places.some((p) => p.landmark.kind === "gap")) {
    if (!id) return cannotSay(ctx, answerer);
    const where = whereIs(world, id);
    if (!where) return cannotSay(ctx, answerer);
    const english = `${where.hook === "al" ? "In" : "At"} ${nameOf(ctx, where.landmark, view)}.`;
    if (!speak(ctx, answerer, placeFragmentDrafts(ctx.gen, world, where.hook, where.landmark, view, english))) return cannotSay(ctx, answerer);
    learn(world, world.player, id);
    noteTold(world, `told-place:${id}`);
    return "ok";
  }

  // What is it like? (`gar`; fill-ask-jobs.md#what-kind)
  if (act.predicate.some((w) => w.reading === "join")) {
    const prop = id ? entity(world, id).props[0] : undefined;
    if (!id || !prop) return cannotSay(ctx, answerer);
    speak(ctx, answerer, adjectiveDrafts(ctx.gen, prop, `${capitalize(ctx.lex.concrete(prop))}.`));
    noteTold(world, `told:${id}:${prop}`);
    return "ok";
  }

  const verb = act.verb && !("gap" in act.verb) ? act.verb.root : undefined;
  const concrete = verb ? ctx.lex.concrete(verb) : undefined;

  // Do what? (`var`)
  if (act.verb && "gap" in act.verb) {
    if (!id) return cannotSay(ctx, answerer);
    const state = entity(world, id).state;
    const doing = Object.entries({ ...DOER_STATES, fire: "burning" as EntityState }).find(([, s]) => state.includes(s));
    if (!doing) return refuse(ctx, `${capitalize(nameOf(ctx, id, view))} is not doing anything in particular.`, answerer);
    const event = { turn: world.turn, verb: ctx.lex.root(doing[0]), agent: id };
    const english = `${capitalize(nameOf(ctx, id, view))} is ${doing[1]}.`;
    return speak(ctx, answerer, reportDrafts(ctx.gen, world, event, view, english)) ? "ok" : cannotSay(ctx, answerer);
  }

  // Who? (`zar`)
  if (act.subject?.kind === "gap" && concrete) {
    const state = DOER_STATES[concrete];
    const doers = state
      ? Object.values(world.entities).filter((e) => e.state.includes(state) && !e.state.includes("gone")).map((e) => e.id)
      : [...new Set(world.events.filter((e) => e.verb === verb && e.agent).map((e) => e.agent!))].reverse();
    const who = doers[0];
    if (!who) return refuse(ctx, state ? `No one here is ${state}.` : `${capitalize(nameOf(ctx, answerer))} has not seen anyone do that.`, answerer);
    return speak(ctx, answerer, citationDrafts(ctx.gen, world, who, `${capitalize(nameOf(ctx, who, view))}.`)) ? "ok" : cannotSay(ctx, answerer);
  }

  // What? (`dar`)
  if (act.object?.kind === "gap" && id && verb && concrete) {
    let things: EntityId[];
    if (concrete === "eye") things = visibleTo(world, id).map((e) => e.id);
    else if (concrete === "luggage") things = heldBy(world, id).map((e) => e.id);
    else things = [...new Set(world.events.filter((e) => e.verb === verb && e.agent === id && e.patient).map((e) => e.patient!))].reverse();
    if (!things.length) return cannotSay(ctx, answerer);
    const shown = things.slice(0, 5);
    const verbs: [string, string] = concrete === "eye" ? ["see", "sees"] : concrete === "luggage" ? ["carry", "carries"] : ["did that to", "did that to"];
    const english = clause(nameOf(ctx, id, view), verbs, listEnglish(shown.map((t) => nameOf(ctx, t, view))));
    const drafts = shown.length === 1 ? citationDrafts(ctx.gen, world, shown[0]!, english) : listDrafts(ctx.gen, world, id, shown, verb, view, english);
    return speak(ctx, answerer, drafts) ? "ok" : cannotSay(ctx, answerer);
  }

  return cannotSay(ctx, answerer);
}
