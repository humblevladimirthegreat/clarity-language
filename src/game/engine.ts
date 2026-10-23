/**
 * One turn: parse, resolve, apply. A sentence that does not parse gets a recast when a near form exists;
 * one that parses but has no handler (or uses grammar the engine cannot read yet) says so in the game's
 * voice; a character who cannot act says so in character. The three failures always look different.
 */
import { CLOSED } from "../closed-roots.js";
import type { ClassifyTables } from "../parse/classify.js";
import { ConstructionError } from "../parse/enforce.js";
import { glossToAgeben } from "../parse/gloss-inverse.js";
import { inspectErrorFrom } from "../parse/inspect.js";
import { morphGlossLine } from "../parse/morph-gloss.js";
import { parseWithTables } from "../parse/parse-core.js";
import type { LexWord, ParseResult } from "../parse/types.js";
import { WordParseError } from "../parse/word.js";
import { answerFill, answerYesNo, truthOf, unresolved } from "./answers.js";
import { capitalize, nameOf, narrate, refuse, remember, speak, speakFixed, traitsOf, type Ctx } from "./context.js";
import { createGenerator, greetingDrafts, type Generator } from "./generate.js";
import { EVERYTHING, gate, type GateData, type Progress } from "./gating.js";
import { gameLexicon, type GameLexicon } from "./lexicon.js";
import { QUESTS, type Quest } from "./quests.js";
import { readActs } from "./read.js";
import { nearMisses, SEED_RULES, type RecastRule } from "./recast.js";
import { resolveNoun, type RefContext, type Scope } from "./reference.js";
import { buildWorld, SANDBOX, type SceneSpec } from "./scene.js";
import { chase, handlerFor, lookAround, type Doing } from "./verbs.js";
import { createVoice, lineRoots, unknownWordsIn, type Voice } from "./voice.js";
import { entity, has, roomOf, sees, setState, visibleTo } from "./world.js";
import type { Act, EntityId, ErrorCard, Line, NounRef, Outcome, Spoken, TurnResult, World } from "./types.js";

/** What the engine reads from the build: gate data, the doc-derived error table, and fixed lines already spelled. */
export type EngineData = {
  gate: GateData;
  rules: RecastRule[];
  spelled: Record<string, string>;
};

export type EngineOptions = {
  /** The learner's own name root; unset, the speaker special. */
  playerRoot?: string;
  scene?: SceneSpec;
  progress?: Progress;
};

export type Engine = {
  world: World;
  progress: Progress;
  lex: GameLexicon;
  gen: Generator;
  voice: Voice;
  quests: Quest[];
  turn(input: string): TurnResult;
  /** Where the player starts and what they see. */
  opening(): Line[];
  reset(): Line[];
};

const BEYOND = "The words are true, but beyond your power yet.";

type Attempt =
  | { ok: true; result: ParseResult; unknown: string[] }
  | { ok: false; card: ErrorCard };

function attempt(text: string, tables: ClassifyTables): Attempt {
  try {
    const result = parseWithTables(text, tables, { constructions: true });
    return { ok: true, result, unknown: unknownWordsIn(result) };
  } catch (error) {
    const info = inspectErrorFrom(error);
    const kind = error instanceof ConstructionError ? error.rejection : error instanceof WordParseError ? "word" : "sentence";
    return {
      ok: false,
      card: { kind, message: info.message, ...(info.expected ? { expected: info.expected } : {}), ...(error instanceof ConstructionError ? { anchor: error.anchor } : {}) },
    };
  }
}

function contentRoot(word: LexWord): string | undefined {
  return word.family.kind === "content" && word.family.roots.length === 1 ? word.family.roots[0] : undefined;
}

export function createEngine(tables: ClassifyTables, data: EngineData, options: EngineOptions = {}): Engine {
  const lex = gameLexicon(tables);
  const voice = createVoice(tables, data.spelled);
  const gen = createGenerator(voice, lex);
  const scene = options.scene ?? SANDBOX;
  const playerRoot = options.playerRoot ?? CLOSED.microphone;
  const rules = [...SEED_RULES, ...data.rules];
  // The discourse specials gloss by role (*speaker*, *listener*), not by their row's sense, so a typed gloss finds them here.
  for (const root of [CLOSED.microphone, CLOSED.headphones, CLOSED.handshake, CLOSED.neutral, CLOSED.person]) voice.learn(root);

  const engine: Engine = {
    world: buildWorld(scene, lex, playerRoot),
    progress: options.progress ?? EVERYTHING,
    lex,
    gen,
    voice,
    quests: QUESTS,
    turn: (input) => runTurn(input),
    opening: () => opening(),
    reset() {
      engine.world = buildWorld(scene, lex, playerRoot);
      return opening();
    },
  };

  const ctxFor = (lines: Line[]): Ctx => ({ world: engine.world, lex, gen, gateData: data.gate, progress: engine.progress, lines });

  function opening(): Line[] {
    const lines: Line[] = [];
    const ctx = ctxFor(lines);
    lookAround({ ctx, act: blankAct(), actor: ctx.world.player, verb: lex.root("eye") }, ctx.world.player);
    ctx.world.events = [];
    return lines;
  }

  /** The player's view: *I* is the player, *you* the one called. */
  function playerRef(ctx: Ctx, scope: Scope, viewer = ctx.world.player): RefContext {
    return { world: ctx.world, speaker: ctx.world.player, ...(ctx.world.addressee ? { listener: ctx.world.addressee } : {}), viewer, scope };
  }

  /** Unlocked roots: everything in the sandbox, else the core roots reached. */
  function unlockedRoots(): string[] {
    const all = [...tables.published.keys()];
    if (engine.progress.position === Number.POSITIVE_INFINITY) return all;
    return all.filter((root) => (data.gate.coreRoots[root] ?? Number.POSITIVE_INFINITY) <= engine.progress.position);
  }

  function spellGloss(gloss: string): string | undefined {
    for (const leaf of gloss.split(" | ")) {
      const label = leaf.replace(/^(?:th|gl|[zdbvgwhxy])-/, "").replace(/^←/, "");
      for (const root of lex.rootsLabelled(label)) voice.learn(root);
    }
    try {
      return glossToAgeben(gloss, tables, voice.index);
    } catch {
      return undefined;
    }
  }

  /** A near miss counts only if it parses one way, every noun resolves in the scene, and its grammar is unlocked. */
  function viable(ctx: Ctx, ageben: string): { spoken: Spoken; result: ParseResult } | undefined {
    let result: ParseResult;
    try {
      result = parseWithTables(ageben, tables, { constructions: true, checkAmbiguity: true });
    } catch {
      return undefined;
    }
    if (result.ambiguity?.length || unknownWordsIn(result).length) return undefined;
    const acts = readActs(result);
    if (acts.some((act) => act.unsupported.length)) return undefined;
    for (const act of acts) {
      const nouns = [act.subject, act.object, act.recipient, ...act.places.map((p) => p.landmark)].filter(
        (n): n is NounRef => !!n && n.kind !== "gap" && !(n === act.object && act.verb && !("gap" in act.verb) && handlerFor(ctx, act.verb.root)?.patientScope === "create"),
      );
      for (const noun of nouns) if (!resolveNoun(noun, playerRef(ctx, "known")).ok) return undefined;
      for (const call of act.calls) {
        const root = contentRoot(call);
        if (!root || !resolveNoun({ kind: "name", word: call, root, adjs: [] }, playerRef(ctx, "visible")).ok) return undefined;
      }
    }
    const roots = lineRoots(result);
    if (!gate(data.gate, engine.progress, result.constructions ?? [], roots).ok) return undefined;
    let gloss = "";
    try {
      gloss = morphGlossLine(ageben, tables);
    } catch {
      // A gloss is shown when it can be made; the candidate still runs.
    }
    return { spoken: { ageben, gloss, english: "", constructions: result.constructions ?? [], roots }, result };
  }

  function runTurn(input: string): TurnResult {
    const text = input.trim();
    const lines: Line[] = [];
    const ctx = ctxFor(lines);
    engine.world.turn += 1;
    let gloss: string | undefined;
    try {
      gloss = morphGlossLine(text, tables);
    } catch {
      gloss = undefined;
    }
    lines.push({ kind: "player", ageben: text, ...(gloss ? { gloss } : {}) });
    const tried = attempt(text, tables);
    let outcome: Outcome;
    let ran: string | undefined;
    let constructions: string[] | undefined;

    if (tried.ok && tried.unknown.length === 0) {
      constructions = tried.result.constructions;
      outcome = perform(ctx, tried.result);
    } else {
      const card: ErrorCard = tried.ok
        ? { kind: "unknown-root", message: `The lexicon has no root for ${tried.unknown.join(", ")}.` }
        : tried.card;
      const misses = nearMisses(text, card.kind, {
        rules,
        roots: unlockedRoots(),
        known: (root) => tables.published.has(root) || tables.compounds.has(root),
        spellGloss,
      });
      let fits: { miss: (typeof misses)[number]; spoken: Spoken; result: ParseResult; doable: boolean }[] = [];
      for (const miss of misses) {
        const fit = viable(ctx, miss.ageben);
        if (fit) fits.push({ miss, ...fit, doable: readActs(fit.result).every((act) => !act.verb || "gap" in act.verb || !!handlerFor(ctx, act.verb.root)) });
      }
      // The likely meaning is the fewest edits away, and one the game can act on: a verb with no handler loses to one with a handler.
      const best = Math.min(...fits.map((fit) => fit.miss.tier));
      fits = fits.filter((fit) => fit.miss.tier === best);
      if (fits.some((fit) => fit.doable)) fits = fits.filter((fit) => fit.doable);
      fits = fits.slice(0, 4);
      const listener = ctx.world.addressee && sees(ctx.world, ctx.world.player, ctx.world.addressee) && entity(ctx.world, ctx.world.addressee).talks ? ctx.world.addressee : undefined;
      if (fits.length === 1) {
        const fit = fits[0]!;
        lines.push({
          kind: "recast",
          ...(listener ? { speaker: listener } : {}),
          spoken: { ...fit.spoken, english: "Ah, you mean…?" },
          ...(fit.miss.why ? { why: fit.miss.why } : {}),
          ...(fit.miss.source ? { source: fit.miss.source } : {}),
        });
        ran = fit.spoken.ageben;
        constructions = fit.result.constructions;
        outcome = perform(ctx, fit.result);
      } else if (fits.length > 1) {
        lines.push({ kind: "choice", ...(listener ? { speaker: listener } : {}), options: fits.map((f) => f.spoken) });
        outcome = "parse";
      } else {
        const spoken = listener ? gen.fixed("confused") : undefined;
        lines.push({ kind: "confused", ...(listener ? { speaker: listener } : {}), ...(spoken ? { spoken } : {}), card });
        outcome = "parse";
      }
    }
    tick(ctx);
    checkQuests(ctx);
    return { input: text, outcome, lines, ...(gloss ? { gloss } : {}), ...(constructions ? { constructions } : {}), ...(ran ? { ran } : {}) };
  }

  function perform(ctx: Ctx, result: ParseResult): Outcome {
    for (const act of readActs(result)) {
      if (act.unsupported.length) {
        ctx.lines.push({ kind: "beyond", english: BEYOND, parts: act.unsupported });
        return "beyond";
      }
      const outcome = performAct(ctx, act);
      if (outcome !== "ok") return outcome;
      if (act.ignored.length) ctx.lines.push({ kind: "note", english: `The game passes over ${act.ignored.map((w) => w.raw).join(", ")}: it reads the words, but they change nothing yet.` });
    }
    return "ok";
  }

  function respondToCall(ctx: Ctx, id: EntityId): void {
    const e = entity(ctx.world, id);
    if (e.talks) {
      if (has(ctx.world, id, "asleep")) {
        setState(ctx.world, id, "asleep", false);
        narrate(ctx, `${capitalize(nameOf(ctx, id))} wakes up.`);
      }
      if (e.name) speak(ctx, id, greetingDrafts(gen, e.name));
    } else if (traitsOf(ctx, id).animate) {
      narrate(ctx, `${capitalize(nameOf(ctx, id))} looks up at you.`);
    } else {
      narrate(ctx, `${capitalize(nameOf(ctx, id))} waits for your word.`);
    }
  }

  /** A talking character the player can address now, or the refusal that says why not. */
  function listener(ctx: Ctx): { id: EntityId } | { outcome: Outcome } {
    const id = ctx.world.addressee;
    if (!id || !sees(ctx.world, ctx.world.player, id)) return { outcome: refuse(ctx, "No one is listening. Call someone first.") };
    if (has(ctx.world, id, "asleep")) return { outcome: refuse(ctx, `${capitalize(nameOf(ctx, id))} is asleep. Call them to wake them.`) };
    return { id };
  }

  function performAct(ctx: Ctx, act: Act): Outcome {
    const { world } = ctx;
    for (const call of act.calls) {
      const root = contentRoot(call)!;
      const res = resolveNoun({ kind: "name", word: call, root, adjs: [] }, playerRef(ctx, "visible"));
      if (!res.ok) return unresolved(ctx, res, undefined);
      if (res.id === world.player) return refuse(ctx, "You call your own name. No one else answers.");
      world.addressee = res.id;
    }
    const bodyless = !act.subject && !act.object && !act.recipient && !act.verb && !act.predicate.length && !act.places.length;
    if (act.greeting) return greet(ctx, act.greeting);
    if (bodyless) {
      if (act.calls.length && act.force === "statement" && !act.polar) {
        respondToCall(ctx, world.addressee!);
        return "ok";
      }
      const who = world.addressee && sees(world, world.player, world.addressee) ? world.addressee : undefined;
      const name = who ? capitalize(nameOf(ctx, who)) : undefined;
      if (act.polar) narrate(ctx, name ? `${name} nods.` : "You nod to yourself.");
      else if (act.interjections.length) narrate(ctx, name ? `${name} looks at you.` : "Your voice rings in the room.");
      else if (act.force === "question") narrate(ctx, name ? `${name} waits for your question.` : "No one answers.");
      else narrate(ctx, name ? `${name} waits.` : "Nothing happens.");
      return "ok";
    }
    if (act.force === "question") return ask(ctx, act);
    if (act.force === "command" || act.force === "prohibition") return command(ctx, act);
    return state(ctx, act);
  }

  function greet(ctx: Ctx, word: LexWord): Outcome {
    const { world } = ctx;
    const talkers = visibleTo(world, world.player).filter((e) => e.talks && !has(world, e.id, "asleep"));
    if (contentRoot(word) !== entity(world, world.player).name) {
      const who = talkers[0]?.id;
      if (who) speakFixed(ctx, who, "no");
      return refuse(ctx, "A greeting is your own name. That one is not yours.", who);
    }
    if (!talkers.length) {
      narrate(ctx, "You greet the room. No one is here to answer.");
      return "ok";
    }
    for (const e of talkers) if (e.name) speak(ctx, e.id, greetingDrafts(gen, e.name));
    return "ok";
  }

  function ask(ctx: Ctx, act: Act): Outcome {
    const found = listener(ctx);
    if ("outcome" in found) return found.outcome;
    const answerer = found.id;
    if (!entity(ctx.world, answerer).talks) return refuse(ctx, `${capitalize(nameOf(ctx, answerer))} cannot answer.`);
    const gap =
      [act.subject, act.object, act.recipient, ...act.places.map((p) => p.landmark)].some((n) => n?.kind === "gap") ||
      (act.verb !== undefined && "gap" in act.verb) ||
      act.predicate.some((w) => w.reading === "join");
    return gap ? answerFill(ctx, act, answerer) : answerYesNo(ctx, act, answerer);
  }

  function state(ctx: Ctx, act: Act): Outcome {
    const { world } = ctx;
    if (act.verb && "gap" in act.verb) return refuse(ctx, "A blank belongs in a question.");
    if (act.verb && act.subject?.kind === "speaker") return doVerb(ctx, act, world.player);
    if (act.verb && !act.subject) return refuse(ctx, "Nothing happens: the sentence names no one who does it. Say who acts, or call someone and command them.");
    const who = world.addressee && sees(world, world.player, world.addressee) && entity(world, world.addressee).talks && !has(world, world.addressee, "asleep") ? world.addressee : undefined;
    if (!who) {
      narrate(ctx, "You say it aloud. Nothing changes.");
      return "ok";
    }
    const truth = truthOf(ctx, act, who);
    if (truth === "unknown") return refuse(ctx, `${capitalize(nameOf(ctx, who))} cannot say.`, who);
    speakFixed(ctx, who, truth === "yes" ? "yes" : "no");
    return "ok";
  }

  function command(ctx: Ctx, act: Act): Outcome {
    const { world } = ctx;
    const actor = world.addressee;
    if (!actor || !sees(world, world.player, actor)) return refuse(ctx, "No one is listening. Call someone first.");
    if (!act.verb || "gap" in act.verb) {
      ctx.lines.push({ kind: "beyond", english: BEYOND, parts: ["a command with no verb"] });
      return "beyond";
    }
    if (act.subject) {
      const subject = resolveNoun(act.subject, playerRef(ctx, "visible"));
      if (!subject.ok || subject.id !== actor) {
        ctx.lines.push({ kind: "beyond", english: BEYOND, parts: ["a command to someone other than the one called"] });
        return "beyond";
      }
    }
    const handler = handlerFor(ctx, act.verb.root);
    if (!handler) {
      ctx.lines.push({ kind: "beyond", english: BEYOND, parts: [`the verb ${act.verb.word.raw}`] });
      return "beyond";
    }
    const e = entity(world, actor);
    const name = capitalize(nameOf(ctx, actor));
    if (has(world, actor, "asleep")) return refuse(ctx, `${name} is asleep. Call them to wake them.`);
    if (act.force === "prohibition") return prohibit(ctx, act, actor);
    if (e.talks) {
      if (handler.spell) return refuse(ctx, `${name} cannot work magic. Only you can.`, actor);
      speakFixed(ctx, actor, "sure");
      return doVerb(ctx, act, actor);
    }
    const traits = traitsOf(ctx, actor);
    if (traits.animate) {
      if (!traits.obeys) return refuse(ctx, `${name} ignores you.`);
      if (!handler.creature) return refuse(ctx, `${name} cannot do that.`);
      return doVerb(ctx, act, actor);
    }
    if (handler.selfPatient && !act.object) return doVerb(ctx, act, undefined, actor);
    return refuse(ctx, `${name} cannot do that.`);
  }

  function prohibit(ctx: Ctx, act: Act, actor: EntityId): Outcome {
    const verb = act.verb && !("gap" in act.verb) ? lex.concrete(act.verb.root) : "";
    const state = verb === "sleep" ? "asleep" : verb === "chair" ? "sitting" : undefined;
    if (state && has(ctx.world, actor, state)) {
      setState(ctx.world, actor, state, false);
      narrate(ctx, `${capitalize(nameOf(ctx, actor))} stops.`);
    } else if (entity(ctx.world, actor).talks) {
      speakFixed(ctx, actor, "sure");
    } else {
      narrate(ctx, `${capitalize(nameOf(ctx, actor))} stays as it is.`);
    }
    return "ok";
  }

  /** Resolve the rest of the clause from the actor's view and run the verb's handler. */
  function doVerb(ctx: Ctx, act: Act, actor: EntityId | undefined, forced?: EntityId): Outcome {
    const { world } = ctx;
    const verb = act.verb && !("gap" in act.verb) ? act.verb : undefined;
    if (!verb) return refuse(ctx, "Say what to do with a verb.");
    const handler = handlerFor(ctx, verb.root);
    if (!handler) {
      ctx.lines.push({ kind: "beyond", english: BEYOND, parts: [`the verb ${verb.word.raw}`] });
      return "beyond";
    }
    if (handler.spell && actor && actor !== world.player) return refuse(ctx, "Only you can work magic.");
    if (!actor && !handler.selfPatient) return refuse(ctx, "Someone has to do that.");
    const asker = actor && actor !== world.player && entity(world, actor).talks ? actor : undefined;
    const viewer = actor ?? world.player;
    const find = (noun: NounRef | undefined, scope: Scope) => {
      if (!noun) return { ok: true as const, id: undefined };
      if (noun.kind === "gap") return { ok: false as const, outcome: refuse(ctx, "A blank belongs in a question.") };
      const res = resolveNoun(noun, playerRef(ctx, scope, viewer));
      return res.ok ? { ok: true as const, id: res.id } : { ok: false as const, outcome: unresolved(ctx, res, asker) };
    };
    const patient = forced ? { ok: true as const, id: forced } : handler.patientScope === "create" ? { ok: true as const, id: undefined } : find(act.object, handler.patientScope ?? "visible");
    if (!patient.ok) return patient.outcome;
    const recipient = find(act.recipient, "visible");
    if (!recipient.ok) return recipient.outcome;
    const first = act.places[0];
    const landmark = find(first?.landmark, "visible");
    if (!landmark.ok) return landmark.outcome;
    if (handler.needsPatient && !patient.id && handler.patientScope !== "create") {
      return refuse(ctx, `${capitalize(handler.english[0])} what? Name it as the object, with \`/d/\`.`);
    }
    remember(ctx, [patient.id, recipient.id, landmark.id].filter((id): id is EntityId => !!id));
    const doing: Doing = {
      ctx,
      act,
      verb: verb.root,
      ...(actor ? { actor } : {}),
      ...(patient.id ? { patient: patient.id } : {}),
      ...(recipient.id ? { recipient: recipient.id } : {}),
      ...(first && landmark.id ? { place: { hook: first.hook, landmark: landmark.id } } : {}),
    };
    return handler.run(doing);
  }

  /** After each turn: fires burn out (a needed thing survives singed), and whoever ran off comes back. */
  function tick(ctx: Ctx): void {
    const { world } = ctx;
    for (const e of Object.values(world.entities)) {
      // A fire lit this turn burns until the next, so there is time to put it out.
      if (e.state.includes("burning") && !world.events.some((ev) => ev.turn === world.turn && ev.patient === e.id && lex.concrete(ev.verb) === "fire")) {
        setState(world, e.id, "burning", false);
        if (e.critical?.length) narrate(ctx, `The fire on ${nameOf(ctx, e.id)} dies down. It is singed, but whole.`);
        else {
          setState(world, e.id, "gone");
          setState(world, e.id, "ashes");
          narrate(ctx, `${capitalize(nameOf(ctx, e.id))} burns to ashes.`);
        }
      }
      if (e.state.includes("away") && e.returnsIn !== undefined) {
        e.returnsIn -= 1;
        if (e.returnsIn <= 0) {
          setState(world, e.id, "away", false);
          delete e.returnsIn;
          if (roomOf(world, e.id) === roomOf(world, world.player)) narrate(ctx, `${capitalize(nameOf(ctx, e.id))} comes back.`);
          chase(ctx, e.id);
        }
      }
    }
  }

  function checkQuests(ctx: Ctx): void {
    const { world } = ctx;
    for (const quest of engine.quests) {
      const fact = `quest:${quest.id}`;
      if (world.facts.includes(fact) || !quest.goal(world)) continue;
      world.facts.push(fact);
      ctx.lines.push({ kind: "quest", quest: quest.id, english: `${quest.title}: done. ${quest.done}` });
    }
  }

  return engine;
}

function blankAct(): Act {
  return { force: "statement", calls: [], interjections: [], predicate: [], places: [], ignored: [], unsupported: [], antecedents: new Map() };
}
