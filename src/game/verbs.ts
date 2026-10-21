/**
 * Verb handlers. A verb is a root used as a verb, so a handler belongs to a root, named here by its
 * concrete sense. The first set: everyday acts, the spells (grow, burn, make, unmake), and giving.
 * A verb with no handler gets the *beyond your power yet* message, never silence.
 */
import { capitalize, clause, listEnglish, nameOf, narrate, refuse, speak, speakFixed, traitsOf, type Ctx } from "./context.js";
import { describeDrafts, greetingDrafts, listDrafts, reportDrafts, whereDrafts } from "./generate.js";
import { traitsOf as rootTraits } from "./objects.js";
import type { Scope } from "./reference.js";
import {
  addEntity,
  contents,
  doorBetween,
  entity,
  has,
  heldBy,
  isRoom,
  learn,
  moveTo,
  roomOf,
  sees,
  setState,
  visibleTo,
} from "./world.js";
import type { Act, EntityId, Outcome, WorldEvent } from "./types.js";

export type Doing = {
  ctx: Ctx;
  act: Act;
  /** Who acts; undefined when a thing was ordered to do it to itself. */
  actor?: EntityId;
  patient?: EntityId;
  recipient?: EntityId;
  place?: { hook: string; landmark: EntityId };
  verb: string;
};

export type Handler = {
  /** Plain and third-person English. */
  english: [string, string];
  /** Only the wizard works it (or a thing ordered to do it to itself). */
  spell?: boolean;
  /** A creature that obeys can be told to do it. */
  creature?: boolean;
  /** A thing called and ordered does it to itself (*Door, open!*). */
  selfPatient?: boolean;
  /** Where the object is looked for: `visible` (default), `search` (hidden things too), or `create` (the verb makes it). */
  patientScope?: Scope | "create";
  needsPatient?: boolean;
  run(d: Doing): Outcome;
};

const view = (ctx: Ctx) => ({ listener: ctx.world.player });

function eventOf(d: Doing, extra: Partial<WorldEvent> = {}): WorldEvent {
  return {
    turn: d.ctx.world.turn,
    verb: d.verb,
    ...(d.actor ? { agent: d.actor } : {}),
    ...(d.patient ? { patient: d.patient } : {}),
    ...(d.recipient ? { recipient: d.recipient } : {}),
    ...(d.place ? { place: d.place } : {}),
    ...extra,
  };
}

/** Record the event and narrate it as *who did what to whom*. */
function report(d: Doing, english: string, extra: Partial<WorldEvent> = {}): "ok" {
  const event = eventOf(d, extra);
  d.ctx.world.events.push(event);
  narrate(d.ctx, english, reportDrafts(d.ctx.gen, d.ctx.world, event, view(d.ctx), english));
  return "ok";
}

const who = (d: Doing) => (d.actor ? nameOf(d.ctx, d.actor) : "");
const the = (d: Doing, id: EntityId) => nameOf(d.ctx, id);
const holdsKind = (d: Doing, holder: EntityId, concrete: string) => heldBy(d.ctx.world, holder).find((e) => d.ctx.lex.concrete(e.root) === concrete);

/** What `viewer` sees around them, as one list. */
export function lookAround(d: Doing, viewer: EntityId): "ok" {
  const { ctx } = d;
  const things = visibleTo(ctx.world, viewer).filter((e) => !(e.place.rel === "held" && e.place.by === viewer));
  const room = roomOf(ctx.world, viewer);
  if (room) {
    const english = `${capitalize(who(d))} ${who(d) === "you" ? "are" : "is"} in ${the(d, room)}.`;
    narrate(ctx, english, whereDrafts(ctx.gen, ctx.world, viewer, "al", room, view(ctx), english));
  }
  if (!things.length) return report(d, clause(who(d), ["see", "sees"], "nothing else"));
  const english = clause(who(d), ["see", "sees"], listEnglish(things.map((e) => the(d, e.id))));
  const event = eventOf(d);
  ctx.world.events.push(event);
  narrate(ctx, english, listDrafts(ctx.gen, ctx.world, viewer, things.map((e) => e.id), d.verb, view(ctx), english));
  return "ok";
}

/** Say what a container holds, one line each. */
function showContents(d: Doing, container: EntityId): void {
  const { ctx } = d;
  for (const inside of contents(ctx.world, container)) {
    const english = `${capitalize(the(d, inside.id))} is ${inside.place.rel === "in" ? "in" : "at"} ${the(d, container)}.`;
    narrate(ctx, english, whereDrafts(ctx.gen, ctx.world, inside.id, inside.place.rel === "in" ? "al" : "ol", container, view(ctx), english));
  }
}

function describe(d: Doing, id: EntityId): void {
  const { ctx } = d;
  const e = entity(ctx.world, id);
  for (const prop of e.props) {
    const english = `${capitalize(the(d, id))} is ${ctx.lex.concrete(prop)}.`;
    narrate(ctx, english, describeDrafts(ctx.gen, ctx.world, id, prop, view(ctx), english));
  }
  if (traitsOf(ctx, id).container && has(ctx.world, id, "open")) showContents(d, id);
}

function move(d: Doing, verb: [string, string]): Outcome {
  const { ctx } = d;
  const actor = d.actor!;
  if (!d.place) return report(d, clause(who(d), verb, "around"));
  const here = roomOf(ctx.world, actor);
  const landmark = entity(ctx.world, d.place.landmark);
  let target: EntityId | undefined;
  if (isRoom(landmark)) target = landmark.id;
  else if (landmark.joins && here) target = landmark.joins.find((room) => room !== here);
  if (!target) return report(d, clause(who(d), verb, `to ${the(d, landmark.id)}`));
  if (target === here) return refuse(ctx, `${capitalize(who(d))} ${who(d) === "you" ? "are" : "is"} already in ${the(d, target)}.`);
  const door = here ? doorBetween(ctx.world, here, target) : undefined;
  if (!door) return refuse(ctx, `There is no way from here to ${the(d, target)}.`);
  if (has(ctx.world, door.id, "closed")) return refuse(ctx, `${capitalize(the(d, door.id))} is closed.`);
  moveTo(ctx.world, actor, { rel: "room", room: target });
  const outcome = report(d, clause(who(d), verb, `into ${the(d, target)}`));
  if (actor === ctx.world.player) {
    if (ctx.world.addressee && !sees(ctx.world, actor, ctx.world.addressee)) delete ctx.world.addressee;
    lookAround({ ...d, verb: ctx.lex.root("eye"), patient: undefined, place: undefined }, actor);
  }
  return outcome;
}

/** Something a quest needs is never lost for good: the act fails in the world's own terms. */
function protect(d: Doing, id: EntityId, english: string): Outcome | undefined {
  return entity(d.ctx.world, id).critical?.length ? refuse(d.ctx, english) : undefined;
}

export const HANDLERS: Record<string, Handler> = {
  eye: {
    english: ["see", "sees"],
    creature: true,
    run(d) {
      if (!d.patient) return lookAround(d, d.actor!);
      const outcome = report(d, clause(who(d), ["see", "sees"], the(d, d.patient)));
      describe(d, d.patient);
      return outcome;
    },
  },
  magnify: {
    english: ["find", "finds"],
    creature: true,
    patientScope: "search",
    needsPatient: true,
    run(d) {
      const { ctx } = d;
      const actor = d.actor!;
      const patient = d.patient!;
      if (!has(ctx.world, patient, "hidden")) return report(d, clause(who(d), ["find", "finds"], the(d, patient)));
      const known = (entity(ctx.world, actor).knows ?? []).includes(patient);
      if (!known) return refuse(ctx, `${capitalize(who(d))} search${who(d) === "you" ? "" : "es"}, but without knowing where to look, nothing turns up. Someone might know.`);
      if (traitsOf(ctx, patient).size === "small" && !holdsKind(d, actor, "magnify")) {
        return refuse(ctx, `${capitalize(the(d, patient))} is too small to spot without a magnifier.`);
      }
      setState(ctx.world, patient, "hidden", false);
      learn(ctx.world, actor, patient);
      return report(d, clause(who(d), ["find", "finds"], the(d, patient)));
    },
  },
  chair: {
    english: ["sit", "sits"],
    creature: true,
    run(d) {
      setState(d.ctx.world, d.actor!, "sitting");
      return report(d, clause(who(d), ["sit", "sits"], d.place ? `${d.place.hook === "ol" ? "at" : "in"} ${the(d, d.place.landmark)}` : "down"));
    },
  },
  speech: {
    english: ["talk", "talks"],
    run(d) {
      const { ctx } = d;
      if (d.patient) return refuse(ctx, "Telling someone a particular thing is beyond the game for now; talk to them, then ask or command.");
      if (!d.recipient) return report(d, clause(who(d), ["talk", "talks"]));
      const outcome = report(d, clause(who(d), ["talk", "talks"], `to ${the(d, d.recipient)}`));
      const listener = entity(ctx.world, d.recipient);
      if (d.actor === ctx.world.player && listener.talks) {
        ctx.world.addressee = d.recipient;
        if (listener.name) speak(ctx, d.recipient, greetingDrafts(ctx.gen, listener.name));
      }
      return outcome;
    },
  },
  money: {
    english: ["pay", "pays"],
    run(d) {
      const { ctx } = d;
      const actor = d.actor!;
      if (!d.recipient) return refuse(ctx, "Pay whom? Name who gets the money with a plain extra noun after the verb.");
      if (!traitsOf(ctx, d.recipient).animate) return refuse(ctx, `${capitalize(the(d, d.recipient))} cannot take money.`);
      const coins = d.patient ?? holdsKind(d, actor, "money")?.id;
      const place = coins ? entity(ctx.world, coins).place : undefined;
      if (!coins || place?.rel !== "held" || place.by !== actor) {
        return refuse(ctx, `${capitalize(who(d))} ${who(d) === "you" ? "have" : "has"} no money to give.`);
      }
      moveTo(ctx.world, coins, { rel: "held", by: d.recipient });
      const outcome = report(d, clause(who(d), ["pay", "pays"], the(d, d.recipient)), { patient: coins });
      if (entity(ctx.world, d.recipient).talks && d.recipient !== ctx.world.player) speakFixed(ctx, d.recipient, "thanks");
      return outcome;
    },
  },
  luggage: {
    english: ["carry", "carries"],
    needsPatient: true,
    run(d) {
      const { ctx } = d;
      const actor = d.actor!;
      const patient = d.patient!;
      const traits = traitsOf(ctx, patient);
      if (patient === actor) return refuse(ctx, `${capitalize(who(d))} cannot carry ${who(d) === "you" ? "yourself" : "themself"}.`);
      if (traits.animate) return refuse(ctx, `${capitalize(the(d, patient))} will not be carried.`);
      if (!traits.portable) return refuse(ctx, `${capitalize(the(d, patient))} is too big to carry.`);
      const place = entity(ctx.world, patient).place;
      if (place.rel === "held" && place.by === actor) return refuse(ctx, `${capitalize(who(d))} already ${who(d) === "you" ? "have" : "has"} ${the(d, patient)}.`);
      if (place.rel === "held") return refuse(ctx, `${capitalize(the(d, place.by))} has ${the(d, patient)}.`);
      moveTo(ctx.world, patient, { rel: "held", by: actor });
      return report(d, clause(who(d), ["pick up", "picks up"], the(d, patient)));
    },
  },
  footprints: { english: ["go", "goes"], creature: true, run: (d) => move(d, ["go", "goes"]) },
  walk: { english: ["walk", "walks"], creature: true, run: (d) => move(d, ["walk", "walks"]) },
  run: {
    english: ["run", "runs"],
    creature: true,
    run(d) {
      const outcome = move(d, ["run", "runs"]);
      if (outcome === "ok") chase(d.ctx, d.actor!);
      return outcome;
    },
  },
  door: {
    english: ["open", "opens"],
    selfPatient: true,
    needsPatient: true,
    run(d) {
      const { ctx } = d;
      const patient = d.patient!;
      if (!traitsOf(ctx, patient).openable) return refuse(ctx, `${capitalize(the(d, patient))} does not open.`);
      if (has(ctx.world, patient, "open")) return refuse(ctx, `${capitalize(the(d, patient))} is already open.`);
      setState(ctx.world, patient, "closed", false);
      setState(ctx.world, patient, "open");
      const outcome = report(d, d.actor ? clause(who(d), ["open", "opens"], the(d, patient)) : `${capitalize(the(d, patient))} swings open.`);
      if (traitsOf(ctx, patient).container) showContents(d, patient);
      return outcome;
    },
  },
  write: {
    english: ["write", "writes"],
    run(d) {
      return report(d, clause(who(d), ["write", "writes"], d.patient ? `on ${the(d, d.patient)}` : "a few lines"));
    },
  },
  peek: {
    english: ["peek", "peeks"],
    creature: true,
    run(d) {
      const { ctx } = d;
      const outcome = report(d, clause(who(d), ["peek", "peeks"], d.patient ? `at ${the(d, d.patient)}` : "around"));
      if (d.patient && traitsOf(ctx, d.patient).container) {
        if (contents(ctx.world, d.patient).length) showContents(d, d.patient);
        else narrate(ctx, `${capitalize(the(d, d.patient))} is empty.`);
      }
      return outcome;
    },
  },
  sleep: {
    english: ["sleep", "sleeps"],
    creature: true,
    run(d) {
      const { ctx } = d;
      if (d.actor === ctx.world.player) return report(d, "You doze for a moment and wake refreshed.");
      setState(ctx.world, d.actor!, "asleep");
      setState(ctx.world, d.actor!, "sitting", false);
      if (ctx.world.addressee === d.actor) delete ctx.world.addressee;
      return report(d, clause(who(d), ["fall asleep", "falls asleep"]));
    },
  },
  cutlery: {
    english: ["eat", "eats"],
    creature: true,
    needsPatient: true,
    run(d) {
      const { ctx } = d;
      const patient = d.patient!;
      if (!traitsOf(ctx, patient).edible) return refuse(ctx, `${capitalize(the(d, patient))} is not food.`);
      const kept = protect(d, patient, `${capitalize(the(d, patient))} is needed; it stays uneaten.`);
      if (kept) return kept;
      setState(ctx.world, patient, "gone");
      return report(d, clause(who(d), ["eat", "eats"], the(d, patient)));
    },
  },
  drink: {
    english: ["drink", "drinks"],
    creature: true,
    needsPatient: true,
    run(d) {
      const { ctx } = d;
      const patient = d.patient!;
      if (!traitsOf(ctx, patient).drinkable) return refuse(ctx, `${capitalize(the(d, patient))} is not something to drink.`);
      setState(ctx.world, patient, "gone");
      return report(d, clause(who(d), ["drink", "drinks"], the(d, patient)));
    },
  },
  pour: {
    english: ["pour", "pours"],
    needsPatient: true,
    run(d) {
      const { ctx } = d;
      const patient = d.patient!;
      if (!traitsOf(ctx, patient).pours) return refuse(ctx, `${capitalize(the(d, patient))} does not pour.`);
      setState(ctx.world, patient, "gone");
      const target = d.place?.landmark ?? d.recipient;
      const outcome = report(d, clause(who(d), ["pour out", "pours out"], `${the(d, patient)}${target ? ` on ${the(d, target)}` : ""}`));
      if (target && has(ctx.world, target, "burning")) {
        setState(ctx.world, target, "burning", false);
        setState(ctx.world, target, "wet");
        narrate(ctx, `The fire on ${the(d, target)} goes out.`);
      }
      return outcome;
    },
  },
  seedling: {
    english: ["grow", "grows"],
    spell: true,
    selfPatient: true,
    needsPatient: true,
    run(d) {
      const { ctx } = d;
      const patient = d.patient!;
      const e = entity(ctx.world, patient);
      if (!traitsOf(ctx, patient).physical) return refuse(ctx, `${capitalize(the(d, patient))} has no body to grow.`);
      e.growth += 1;
      if (e.growth >= 2 && e.place.rel === "held") {
        const room = roomOf(ctx.world, patient);
        if (room) moveTo(ctx.world, patient, { rel: "room", room });
      }
      return report(d, d.actor ? clause(who(d), ["make", "makes"], `${the(d, patient)} grow`) : `${capitalize(the(d, patient))} grows.`);
    },
  },
  fire: {
    english: ["burn", "burns"],
    spell: true,
    selfPatient: true,
    needsPatient: true,
    run(d) {
      const { ctx } = d;
      const patient = d.patient!;
      const traits = traitsOf(ctx, patient);
      if (traits.animate) return refuse(ctx, `You will not set fire to ${the(d, patient)}.`);
      if (!traits.flammable) return refuse(ctx, `${capitalize(the(d, patient))} will not burn.`);
      if (has(ctx.world, patient, "burning")) return refuse(ctx, `${capitalize(the(d, patient))} is already burning.`);
      setState(ctx.world, patient, "burning");
      return report(d, d.actor ? clause(who(d), ["set fire to", "sets fire to"], the(d, patient)) : `${capitalize(the(d, patient))} catches fire.`);
    },
  },
  construct: {
    english: ["make", "makes"],
    spell: true,
    patientScope: "create",
    run(d) {
      const { ctx, act } = d;
      const ref = act.object;
      if (!ref || ref.kind !== "content") return refuse(ctx, "Make what? Name a kind of thing as the object: a new one ends in -l.");
      if (!rootTraits(ref.root, ctx.lex).physical) return refuse(ctx, `${capitalize(ctx.gen.nounEnglish(ref.root))} has no body to make.`);
      const room = roomOf(ctx.world, d.actor ?? ctx.world.player)!;
      const props = ref.adjs.flatMap((adj) => (adj.family.kind === "content" && adj.family.roots.length === 1 ? [adj.family.roots[0]!] : []));
      const made = addEntity(ctx.world, ref.root, { rel: "room", room }, { props });
      const english = clause(who(d) || "you", ["make", "makes"], `a ${ctx.gen.nounEnglish(ref.root)}`);
      const event = eventOf({ ...d, patient: made });
      ctx.world.events.push(event);
      narrate(ctx, english, reportDrafts(ctx.gen, ctx.world, event, view(ctx), english));
      describe(d, made);
      chase(ctx, made);
      return "ok";
    },
  },
  eraser: {
    english: ["unmake", "unmakes"],
    spell: true,
    selfPatient: true,
    needsPatient: true,
    run(d) {
      const { ctx } = d;
      const patient = d.patient!;
      const e = entity(ctx.world, patient);
      if (e.talks) return refuse(ctx, `You cannot unmake ${the(d, patient)}.`);
      const kept = protect(d, patient, `${capitalize(the(d, patient))} flickers, but stays: someone needs it.`);
      if (kept) return kept;
      const room = roomOf(ctx.world, patient);
      for (const inside of contents(ctx.world, patient)) if (room) moveTo(ctx.world, inside.id, { rel: "room", room });
      const outcome = report(d, d.actor ? clause(who(d), ["unmake", "unmakes"], the(d, patient)) : `${capitalize(the(d, patient))} fades away.`);
      setState(ctx.world, patient, "gone");
      return outcome;
    },
  },
  present: {
    english: ["give", "gives"],
    needsPatient: true,
    run(d) {
      const { ctx } = d;
      const actor = d.actor!;
      const patient = d.patient!;
      if (!d.recipient) return refuse(ctx, "Give it to whom? Name who gets it with a plain extra noun after the verb.");
      const place = entity(ctx.world, patient).place;
      if (place.rel !== "held" || place.by !== actor) return refuse(ctx, `${capitalize(who(d))} ${who(d) === "you" ? "are" : "is"} not holding ${the(d, patient)}.`);
      if (d.recipient === actor) return refuse(ctx, `${capitalize(who(d))} already ${who(d) === "you" ? "have" : "has"} it.`);
      const recipient = entity(ctx.world, d.recipient);
      if (!recipient.talks) return refuse(ctx, `${capitalize(the(d, d.recipient))} sniffs ${the(d, patient)}, but does not take it.`);
      moveTo(ctx.world, patient, { rel: "held", by: d.recipient });
      const outcome = report(d, clause(who(d), ["give", "gives"], `${the(d, patient)} to ${the(d, d.recipient)}`));
      if (d.recipient !== ctx.world.player) speakFixed(ctx, d.recipient, "thanks");
      return outcome;
    },
  },
};

/** A chaser and its quarry free in one room: the chase is on, and the quarry runs off for a while. */
export function chase(ctx: Ctx, moved: EntityId): void {
  const { world } = ctx;
  const room = roomOf(world, moved);
  if (!room) return;
  const free = Object.values(world.entities).filter(
    (e) => roomOf(world, e.id) === room && !e.state.some((s) => s === "gone" || s === "away" || s === "asleep") && e.place.rel === "room",
  );
  for (const chaser of free) {
    for (const prey of free) {
      if (chaser.id === prey.id || (moved !== chaser.id && moved !== prey.id)) continue;
      if (!traitsOf(ctx, chaser.id).chases.includes(ctx.lex.concrete(prey.root))) continue;
      narrate(ctx, `${capitalize(nameOf(ctx, chaser.id))} chases ${nameOf(ctx, prey.id)} out of the room!`);
      setState(world, prey.id, "away");
      entity(world, prey.id).returnsIn = 3;
      return;
    }
  }
}

/** The handler for a verb root, if any. */
export function handlerFor(ctx: Ctx, verbRoot: string): Handler | undefined {
  return HANDLERS[ctx.lex.concrete(verbRoot)];
}
