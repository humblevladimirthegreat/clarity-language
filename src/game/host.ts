/**
 * The wizard as an interpreter host (the interpreter plan's host section): `refer` finds a term's entity in the scene,
 * `holds` reads live world state for a question, `handler` runs a verb on a command, `told` does what a statement does
 * in the world, and `accepts` names what the game cannot act on yet. The loop (src/interpret/run.ts) dispatches; this
 * file never walks the parse tree for meaning, only the readings it is handed.
 */
import type { LexWord } from "../parse/types.js";
import { blankSites, type Bound, type Held, type Host, type Referent, type Refusal, type RoleLetter, type Verdict } from "../interpret/host.js";
import { throughAntecedent } from "../interpret/match.js";
import { defaultVerdict } from "../interpret/run.js";
import type { Claim, Frame, Reading, Term } from "../interpret/types.js";
import { capitalize, nameOf, narrate, refuse, remember, speak, speakFixed, traitsOf, type Ctx } from "./context.js";
import { greetingDrafts, whichDrafts } from "./generate.js";
import { handlerFor, type Doing } from "./verbs.js";
import { entity, has, heldBy, knownTo, learn, roomOf, sees, setState, visibleTo } from "./world.js";
import type { Entity, EntityId, EntityState, Outcome, Scope, World } from "./types.js";

/** The referent of a command's object whose verb makes it (`construct`): nothing in the scene yet. */
export const UNMADE = "";

/** Verbs whose truth is a standing state of the doer (`sleep`, `chair` as *sit*) or of the thing (`door` as *open*, `fire` as *burn*). */
const DOER_STATES: Record<string, EntityState> = { sleep: "asleep", chair: "sitting" };
const THING_STATES: Record<string, EntityState> = { door: "open", fire: "burning" };
/** Adjectives that read as a state while it lasts (predication.md#in-progress). */
const STATE_ADJECTIVES: Record<string, EntityState> = { sleep: "asleep", fire: "burning" };

const ROLES: readonly RoleLetter[] = ["z", "d", "b"];

function contentRoot(word: LexWord): string | undefined {
  return word.family.kind === "content" && word.family.roots.length === 1 ? word.family.roots[0] : undefined;
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

/** A pointer word's role (pronouns.md#role-pointers): only the plain `/u e/ -r` pointers are read. */
const POINTER_ROLES: Record<string, "agent" | "patient" | "recipient"> = { z: "agent", d: "patient", b: "recipient" };

const isPointer = (word: LexWord) => word.family.kind === "x" && word.family.xFamily === "pointer";

function pointerRole(word: LexWord): "agent" | "patient" | "recipient" | undefined {
  if (word.family.kind !== "x" || word.family.reachVowel !== "u" || word.family.pointerVowel !== "e" || word.ending !== "r") return undefined;
  return POINTER_ROLES[word.family.part ?? ""];
}

/** Which entity a term means, or why it means none. */
export type Resolution =
  | { ok: true; id: EntityId }
  | { ok: false; reason: "none"; root?: string }
  | { ok: false; reason: "ambiguous"; root: string; candidates: EntityId[] }
  | { ok: false; reason: "nobody"; word: LexWord };

/** Where a term is looked for: who says *I* and *you*, whose view the reach is measured from, and how far it reaches. */
type Reach = { world: World; speaker: EntityId; listener?: EntityId; viewer: EntityId; scope: Scope };

/** Why the game cannot read a term in a role yet; undefined when it can. */
function unreadable(term: Term): string | undefined {
  switch (term.kind) {
    case "speaker":
    case "listener":
    case "blank":
      return undefined;
    case "thing":
      return term.head.plural ? `a group (${term.head.raw})` : undefined;
    case "pronoun": {
      const word = term.word;
      if (isPointer(word)) return pointerRole(word) ? undefined : `this role pointer (${word.raw})`;
      const to = throughAntecedent(term);
      if (to.kind === "speaker" || to.kind === "listener") return undefined;
      return (to.kind === "thing" ? to.root : contentRoot(word)) ? undefined : `this pronoun (${word.raw})`;
    }
    default:
      return `a ${term.kind} in a role`;
  }
}

/** Adjectives on a term that narrow which one it is. */
const adjsOf = (t: Term): LexWord[] => ("details" in t && t.details ? t.details.flatMap((d) => d.words).filter((w) => !!contentRoot(w)) : []);

/** The viewer's room and the rooms its doors lead to: places you can name and go to. */
function roomsInReach(world: World, viewer: EntityId): Entity[] {
  const here = roomOf(world, viewer);
  if (!here) return [];
  const rooms = new Set([here]);
  for (const door of visibleTo(world, viewer)) for (const room of door.joins ?? []) rooms.add(room);
  return [...rooms].map((id) => entity(world, id));
}

function inReach(reach: Reach): Entity[] {
  const self = entity(reach.world, reach.viewer);
  const rooms = roomsInReach(reach.world, reach.viewer);
  const things = reach.scope === "known" ? knownTo(reach.world, reach.viewer) : visibleTo(reach.world, reach.viewer, { hidden: reach.scope === "search" });
  return [...new Map([self, ...things, ...rooms].map((e) => [e.id, e])).values()];
}

/** The latest event with someone in that part: what a role pointer reaches. */
function pointerTarget(world: World, role: "agent" | "patient" | "recipient"): EntityId | undefined {
  for (let i = world.events.length - 1; i >= 0; i -= 1) {
    const id = world.events[i]![role];
    if (id) return id;
  }
  return undefined;
}

function pick(found: Entity[], root: string, adjs: LexWord[], anyOne: boolean): Resolution {
  let left = found;
  for (const adj of adjs) {
    const prop = contentRoot(adj);
    if (prop) left = left.filter((e) => e.props.includes(prop) || e.root === prop);
  }
  if (left.length === 0) return { ok: false, reason: "none", root };
  // A first mention (**-l**) is any one of its kind; a known one (**-r**) must be the one both mean.
  if (left.length === 1 || anyOne) return { ok: true, id: left[0]!.id };
  return { ok: false, reason: "ambiguous", root, candidates: left.map((e) => e.id) };
}

/** A noun by its root: a name, or a kind used as a title (`yagayun` calls the guard; speech-moves.md#vocative). */
function byRoot(reach: Reach, root: string, named: boolean, adjs: LexWord[], firstMention: boolean): Resolution {
  const found = inReach(reach);
  if (!named) return pick(found.filter((e) => e.root === root), root, adjs, firstMention);
  const byName = found.filter((e) => e.name === root);
  return pick(byName.length ? byName : found.filter((e) => e.root === root), root, adjs, false);
}

/**
 * Which entity a term means. Start simple: the only one in reach, adjectives narrowing; with several left, the
 * character asks which. *I* and *you* follow the turn; a role pointer reads the latest event with someone in that part.
 */
function resolveTerm(term: Term, reach: Reach): Resolution {
  if (unreadable(term)) return { ok: false, reason: "none" };
  const listener = (word: LexWord): Resolution => (reach.listener ? { ok: true, id: reach.listener } : { ok: false, reason: "nobody", word });
  switch (term.kind) {
    case "speaker":
      return { ok: true, id: reach.speaker };
    case "listener":
      return listener(term.word);
    case "thing":
      return byRoot(reach, term.root, term.named, adjsOf(term), term.head.ending === "l");
    case "pronoun": {
      const word = term.word;
      if (isPointer(word)) {
        const id = pointerTarget(reach.world, pointerRole(word)!);
        return id ? { ok: true, id } : { ok: false, reason: "none" };
      }
      const to = throughAntecedent(term);
      if (to.kind === "speaker") return { ok: true, id: reach.speaker };
      if (to.kind === "listener") return listener(word);
      const root = to.kind === "thing" ? to.root : contentRoot(word)!;
      return byRoot(reach, root, to.kind === "thing" && to.named, adjsOf(to), word.ending === "l");
    }
    default:
      return { ok: false, reason: "none" };
  }
}

function asReferent(res: Resolution): Referent<EntityId> {
  if (res.ok) return { kind: "one", entity: res.id };
  if (res.reason === "ambiguous") return { kind: "several", entities: res.candidates };
  return { kind: "none" };
}

const callFrames = (reading: Reading): Frame[] => reading.frames.filter((f) => f.family === "call" && f.party);
const placeDetails = (claim: Claim) => claim.details.filter((d) => d.kind === "place" && d.hosted && d.words[0]);

export type GameHost = Host<EntityId>;

/** The wizard's host over the current turn's context (`ctx()` gives the world and the lines being written). */
export function createGameHost(ctx: () => Ctx): GameHost {
  /** A term's entity from `viewer`'s view: speaker is the player, listener the one called. */
  function resolve(term: Term, viewer: EntityId, scope: Scope): Resolution {
    const { world } = ctx();
    return resolveTerm(term, { world, speaker: world.player, ...(world.addressee ? { listener: world.addressee } : {}), viewer, scope });
  }

  /** Who a reading's call addresses: the call on it, else the latest call. */
  function callee(reading: Reading): EntityId | undefined {
    const { world } = ctx();
    for (const frame of callFrames(reading)) {
      const res = resolve(frame.party!, world.player, "visible");
      if (res.ok) return res.id;
    }
    return world.addressee;
  }

  /** Apply a reading's calls: the one called becomes the addressee. A call that finds no one is refused. */
  function applyCalls(reading: Reading): Outcome {
    const c = ctx();
    for (const frame of callFrames(reading)) {
      const res = resolve(frame.party!, c.world.player, "visible");
      if (!res.ok) return unresolved(c, res, undefined);
      if (res.id === c.world.player) return refuse(c, "You call your own name. No one else answers.");
      c.world.addressee = res.id;
    }
    return "ok";
  }

  /** A talking character the player can address now, or the refusal that says why not. */
  function listener(c: Ctx): { id: EntityId } | { reason: string } {
    const id = c.world.addressee;
    if (!id || !sees(c.world, c.world.player, id)) return { reason: refuseWith(c, "No one is listening. Call someone first.") };
    if (has(c.world, id, "asleep")) return { reason: refuseWith(c, `${capitalize(nameOf(c, id))} is asleep. Call them to wake them.`) };
    if (!entity(c.world, id).talks) return { reason: refuseWith(c, `${capitalize(nameOf(c, id))} cannot answer.`) };
    return { id };
  }

  function respondToCall(c: Ctx, id: EntityId): void {
    const e = entity(c.world, id);
    if (e.talks) {
      if (has(c.world, id, "asleep")) {
        setState(c.world, id, "asleep", false);
        narrate(c, `${capitalize(nameOf(c, id))} wakes up.`);
      }
      if (e.name) speak(c, id, greetingDrafts(c.gen, e.name));
    } else if (traitsOf(c, id).animate) {
      narrate(c, `${capitalize(nameOf(c, id))} looks up at you.`);
    } else {
      narrate(c, `${capitalize(nameOf(c, id))} waits for your word.`);
    }
  }

  /** Whether a claim holds, as `answerer` knows the world. */
  function truth(c: Ctx, claim: Claim, bound: Bound<EntityId>, answerer: EntityId): "yes" | "no" | "unknown" {
    const { world, lex } = c;
    const subject = bound.z;
    if (subject && subject.kind !== "one") return subject.kind === "none" && !claim.verb ? "no" : "unknown";
    const id = subject?.kind === "one" ? subject.entity : undefined;
    if (id) {
      for (const p of claim.predicate) {
        if (p.kind !== "thing") return "unknown";
        const e = entity(world, id);
        const state = STATE_ADJECTIVES[lex.concrete(p.root)];
        if (!(e.props.includes(p.root) || e.root === p.root || (state && e.state.includes(state)))) return "no";
      }
      for (const place of placeDetails(claim)) {
        const landmark = resolve(place.hosted!, answerer, "known");
        if (!landmark.ok || !placeHolds(world, id, place.words[0]!.raw, landmark.id)) return "no";
      }
    }
    const verb = claim.verb;
    if (!verb || verb.kind !== "thing") return id ? "yes" : "unknown";
    const concrete = lex.concrete(verb.root);
    const object = bound.d;
    const recipient = bound.b;
    if ((object && object.kind !== "one") || (recipient && recipient.kind !== "one")) return "no";
    const thing = object?.kind === "one" ? object.entity : undefined;
    const to = recipient?.kind === "one" ? recipient.entity : undefined;
    const doerState = DOER_STATES[concrete];
    if (doerState && id) return has(world, id, doerState) ? "yes" : "no";
    const thingState = THING_STATES[concrete];
    if (thingState && thing) return has(world, thing, thingState) ? "yes" : "no";
    if (concrete === "eye" && id && thing) return visibleTo(world, id).some((e) => e.id === thing) ? "yes" : "no";
    if (concrete === "luggage" && id && thing) return heldBy(world, id).some((e) => e.id === thing) ? "yes" : "no";
    return world.events.some((e) => e.verb === verb.root && (!id || e.agent === id) && (!thing || e.patient === thing) && (!to || e.recipient === to)) ? "yes" : "no";
  }

  function boundFrom(claim: Claim, viewer: EntityId): Bound<EntityId> {
    const out: Bound<EntityId> = {};
    for (const role of ROLES) {
      const term = claim.roles[role];
      if (term && term.kind !== "blank") out[role] = asReferent(resolve(term, viewer, "known"));
    }
    return out;
  }

  /** Resolve the rest of the clause from the actor's view and run the verb's handler. */
  function doVerb(c: Ctx, reading: Reading, actor: EntityId | undefined, forced?: EntityId): Outcome {
    const { world } = c;
    const verb = reading.claim.verb;
    if (!verb || verb.kind !== "thing") return refuse(c, "Say what to do with a verb.");
    const handler = handlerFor(c, verb.root)!;
    if (handler.spell && actor && actor !== world.player) return refuse(c, "Only you can work magic.");
    if (!actor && !handler.selfPatient) return refuse(c, "Someone has to do that.");
    const asker = actor && actor !== world.player && entity(world, actor).talks ? actor : undefined;
    const viewer = actor ?? world.player;
    const find = (term: Term | undefined, scope: Scope) => {
      if (!term) return { ok: true as const, id: undefined };
      if (term.kind === "blank") return { ok: false as const, outcome: refuse(c, "A blank belongs in a question.") };
      const res = resolve(term, viewer, scope);
      return res.ok ? { ok: true as const, id: res.id } : { ok: false as const, outcome: unresolved(c, res, asker) };
    };
    const { roles } = reading.claim;
    const patient = forced ? { ok: true as const, id: forced } : handler.patientScope === "create" ? { ok: true as const, id: undefined } : find(roles.d, handler.patientScope ?? "visible");
    if (!patient.ok) return patient.outcome;
    const recipient = find(roles.b, "visible");
    if (!recipient.ok) return recipient.outcome;
    const first = placeDetails(reading.claim)[0];
    const landmark = find(first?.hosted, "visible");
    if (!landmark.ok) return landmark.outcome;
    if (handler.needsPatient && !patient.id && handler.patientScope !== "create") {
      return refuse(c, `${capitalize(handler.english[0])} what? Name it as the object, with \`/d/\`.`);
    }
    remember(c, [patient.id, recipient.id, landmark.id].filter((id): id is EntityId => !!id));
    const doing: Doing = {
      ctx: c,
      reading,
      verb: verb.root,
      ...(actor ? { actor } : {}),
      ...(patient.id ? { patient: patient.id } : {}),
      ...(recipient.id ? { recipient: recipient.id } : {}),
      ...(first && landmark.id ? { place: { hook: first.words[0]!.raw, landmark: landmark.id } } : {}),
    };
    return handler.run(doing);
  }

  function prohibit(c: Ctx, reading: Reading, actor: EntityId): Outcome {
    const verb = reading.claim.verb?.kind === "thing" ? c.lex.concrete(reading.claim.verb.root) : "";
    const state = verb === "sleep" ? "asleep" : verb === "chair" ? "sitting" : undefined;
    if (state && has(c.world, actor, state)) {
      setState(c.world, actor, state, false);
      narrate(c, `${capitalize(nameOf(c, actor))} stops.`);
    } else if (entity(c.world, actor).talks) {
      speakFixed(c, actor, "sure");
    } else {
      narrate(c, `${capitalize(nameOf(c, actor))} stays as it is.`);
    }
    return "ok";
  }

  /** A command or prohibition to the one called. */
  function command(c: Ctx, reading: Reading, prohibition: boolean, z: EntityId | undefined): Outcome {
    const { world } = c;
    if (applyCalls(reading) === "refused") return "refused";
    const actor = world.addressee;
    if (!actor || !sees(world, world.player, actor)) return refuse(c, "No one is listening. Call someone first.");
    if (z !== undefined && z !== actor) return refuse(c, "A command goes to the one you called.");
    const verb = reading.claim.verb as Extract<Term, { kind: "thing" }>;
    const handler = handlerFor(c, verb.root)!;
    const e = entity(world, actor);
    const name = capitalize(nameOf(c, actor));
    if (has(world, actor, "asleep")) return refuse(c, `${name} is asleep. Call them to wake them.`);
    if (prohibition) return prohibit(c, reading, actor);
    if (e.talks) {
      if (handler.spell) return refuse(c, `${name} cannot work magic. Only you can.`, actor);
      speakFixed(c, actor, "sure");
      return doVerb(c, reading, actor);
    }
    const traits = traitsOf(c, actor);
    if (traits.animate) {
      if (!traits.obeys) return refuse(c, `${name} ignores you.`);
      if (!handler.creature) return refuse(c, `${name} cannot do that.`);
      return doVerb(c, reading, actor);
    }
    if (handler.selfPatient && !reading.claim.roles.d) return doVerb(c, reading, undefined, actor);
    return refuse(c, `${name} cannot do that.`);
  }

  /** A statement: a call wakes the one called; *I do X* does it; anything else the one called confirms or denies. */
  function state(c: Ctx, reading: Reading): Outcome {
    const { world } = c;
    const { claim } = reading;
    const bodyless = !claim.verb && !Object.keys(claim.roles).length && !claim.predicate.length && !claim.details.length;
    if (applyCalls(reading) === "refused") return "refused";
    if (bodyless) {
      if (callFrames(reading).length) {
        respondToCall(c, world.addressee!);
        return "ok";
      }
      const who = world.addressee && sees(world, world.player, world.addressee) ? world.addressee : undefined;
      narrate(c, who ? `${capitalize(nameOf(c, who))} waits.` : "Nothing happens.");
      return "ok";
    }
    if (claim.verb?.kind === "blank") return refuse(c, "A blank belongs in a question.");
    if (claim.verb && claim.roles.z?.kind === "speaker") return doVerb(c, reading, world.player);
    if (claim.verb && !claim.roles.z) return refuse(c, "Nothing happens: the sentence names no one who does it. Say who acts, or call someone and command them.");
    const who = world.addressee && sees(world, world.player, world.addressee) && entity(world, world.addressee).talks && !has(world, world.addressee, "asleep") ? world.addressee : undefined;
    if (!who) {
      narrate(c, "You say it aloud. Nothing changes.");
      return "ok";
    }
    const said = truth(c, claim, boundFrom(claim, who), who);
    if (said === "unknown") return refuse(c, `${capitalize(nameOf(c, who))} cannot say.`, who);
    speakFixed(c, who, said === "yes" ? "yes" : "no");
    return "ok";
  }

  /** Live state for a question, as the one asked knows it. Fill answers are noun leaves keyed by blank site. */
  function holds(claim: Claim, bound: Bound<EntityId>): Held[] {
    const c = ctx();
    const { world } = c;
    const answerer = world.addressee;
    if (!answerer) return [];
    const view = { speaker: answerer, listener: world.player };
    const id = bound.z?.kind === "one" ? bound.z.entity : undefined;
    if (id) remember(c, [id]);
    const sites = blankSites(claim);
    if (!sites.length) {
      const said = truth(c, claim, bound, answerer);
      if (said === "unknown") return [];
      // Hearing the answer is what the ask-color quest waits for (W2 moves this to the log).
      if (id) for (const p of claim.predicate) if (p.kind === "thing") noteTold(world, `told:${id}:${p.root}`);
      return [{ holds: said === "yes", source: `${nameOf(c, answerer)}` }];
    }
    const answers: NonNullable<Held["answers"]> = {};
    for (const site of sites) {
      if (site.detail && site.at.endsWith("/hosted")) {
        // Where? (fill-ask-jobs.md#where)
        const where = id ? whereIs(world, id) : undefined;
        if (!id || !where) continue;
        answers[site.at] = { leaf: c.gen.mention(world, where.landmark, "b", view), english: nameOf(c, where.landmark, view) };
        learn(world, world.player, id);
        noteTold(world, `told-place:${id}`);
      } else if (site.at === "z" && claim.verb?.kind === "thing") {
        // Who? (`zar`)
        const verb = claim.verb.root;
        const doerState = DOER_STATES[c.lex.concrete(verb)];
        const doers = doerState
          ? Object.values(world.entities).filter((e) => e.state.includes(doerState) && !e.state.includes("gone")).map((e) => e.id)
          : [...new Set(world.events.filter((e) => e.verb === verb && e.agent).map((e) => e.agent!))].reverse();
        if (doers[0]) answers.z = { leaf: c.gen.mention(world, doers[0], "z", view), english: nameOf(c, doers[0], view) };
      } else if (site.at === "d" && id && claim.verb?.kind === "thing") {
        // What? (`dar`)
        const verb = claim.verb.root;
        const concrete = c.lex.concrete(verb);
        const things =
          concrete === "eye"
            ? visibleTo(world, id).map((e) => e.id)
            : concrete === "luggage"
              ? heldBy(world, id).map((e) => e.id)
              : [...new Set(world.events.filter((e) => e.verb === verb && e.agent === id && e.patient).map((e) => e.patient!))].reverse();
        if (things[0]) answers.d = { leaf: c.gen.mention(world, things[0], "d", view), english: nameOf(c, things[0], view) };
      }
    }
    return Object.keys(answers).length ? [{ holds: true, source: nameOf(c, answerer), answers }] : [];
  }

  /** Parts of a reading the game cannot act on yet. */
  function accepts(reading: Reading): string[] {
    const c = ctx();
    const out: string[] = [];
    const { claim } = reading;
    const terms = [...ROLES.map((r) => claim.roles[r]), ...claim.predicate, ...placeDetails(claim).map((d) => d.hosted)];
    for (const term of terms) {
      if (!term) continue;
      const why = unreadable(term);
      if (why) out.push(why);
    }
    if (claim.clauses) out.push("a clause join");
    const force = reading.frames.find((f) => f.family === "force")?.values.series;
    const verb = claim.verb;
    if ((!force || force === "a") && verb?.kind === "thing" && claim.roles.z?.kind === "speaker" && !handlerFor(c, verb.root)) {
      out.push(`the verb ${verb.head.raw}`);
    }
    return out;
  }

  return {
    refer(term, site) {
      const c = ctx();
      const { world } = c;
      if (site.side) {
        const viewer = site.side === "query" ? (world.addressee ?? world.player) : world.player;
        return asReferent(resolve(term, viewer, "known"));
      }
      const reading = site.reading;
      const viewer = (reading && callee(reading)) ?? world.player;
      let scope: Scope = "visible";
      if (site.role === "d" && reading?.claim.verb?.kind === "thing") {
        const patientScope = handlerFor(c, reading.claim.verb.root)?.patientScope;
        if (patientScope === "create") return { kind: "one", entity: UNMADE };
        if (patientScope) scope = patientScope;
      }
      return asReferent(resolve(term, viewer, scope));
    },
    holds,
    handler(root) {
      if (!handlerFor(ctx(), root)) return undefined;
      return (action) => {
        const out = command(ctx(), action.reading, action.prohibition, action.roles.z);
        return out === "ok" ? { ok: true } : { ok: false, reason: out };
      };
    },
    told(reading) {
      const out = state(ctx(), reading);
      return out === "ok" ? [] : ({ ok: false, reason: out } satisfies Refusal);
    },
    verdict(question, matches, held): Verdict {
      const found = listener(ctx());
      if ("reason" in found) return { kind: "refused", reason: found.reason };
      return defaultVerdict(question, matches, held);
    },
    accepts,
  };
}

function refuseWith(c: Ctx, english: string): string {
  refuse(c, english);
  return english;
}

function noteTold(world: World, fact: string): void {
  if (!world.facts.includes(fact)) world.facts.push(fact);
}

/** A resolution that failed: ask which one, or say there is none. */
export function unresolved(c: Ctx, res: Exclude<Resolution, { ok: true }>, asker: EntityId | undefined): Outcome {
  if (res.reason === "ambiguous") {
    if (asker && speak(c, asker, whichDrafts(c.gen, res.root))) return "refused";
    return refuse(c, `Which ${c.gen.nounEnglish(res.root)}? There is more than one.`);
  }
  if (res.reason === "nobody") return refuse(c, "No one is listening to be *you*. Call someone first.");
  const what = res.root ? c.gen.nounEnglish(res.root) : "one";
  return refuse(c, asker ? `${capitalize(nameOf(c, asker))} knows of no ${what} here.` : `There is no ${what} here.`, asker);
}

