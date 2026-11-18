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
import type { ParseResult } from "../parse/types.js";
import { WordParseError } from "../parse/word.js";
import { readQuestion } from "../interpret/log.js";
import { createSession, run } from "../interpret/run.js";
import type { Session } from "../interpret/host.js";
import type { Reading } from "../interpret/types.js";
import { capitalize, nameOf, narrate, refuse, speak, type Ctx } from "./context.js";
import { createGenerator, type Generator } from "./generate.js";
import { EVERYTHING, gate, type GateData, type Progress } from "./gating.js";
import { gameLexicon, type GameLexicon } from "./lexicon.js";
import { QUESTS, type Quest } from "./quests.js";
import { createGameHost, type GameHost } from "./host.js";
import { nearMisses, SEED_RULES, type RecastRule } from "./recast.js";
import { buildWorld, SANDBOX, type SceneSpec } from "./scene.js";
import { chase, handlerFor, lookAround } from "./verbs.js";
import { createVoice, lineRoots, unknownWordsIn, type Voice } from "./voice.js";
import { entity, roomOf, sees, setState } from "./world.js";
import type { EntityId, ErrorCard, Line, Outcome, Spoken, TurnResult, World } from "./types.js";

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

export function createEngine(tables: ClassifyTables, data: EngineData, options: EngineOptions = {}): Engine {
  const lex = gameLexicon(tables);
  const voice = createVoice(tables, data.spelled);
  const gen = createGenerator(voice, lex);
  const scene = options.scene ?? SANDBOX;
  const playerRoot = options.playerRoot ?? CLOSED.microphone;
  const rules = [...SEED_RULES, ...data.rules];
  // The discourse specials gloss by role (*speaker*, *listener*), not by their row's sense, so a typed gloss finds them here.
  for (const root of [CLOSED.microphone, CLOSED.headphones, CLOSED.handshake, CLOSED.person]) voice.learn(root);

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
      session = createSession(host, tables, { speaker: "player" });
      return opening();
    },
  };

  const ctxFor = (lines: Line[]): Ctx => ({ world: engine.world, lex, gen, gateData: data.gate, progress: engine.progress, lines });
  /** The turn being played: the host writes its lines here. */
  let current: Ctx = ctxFor([]);
  const host: GameHost = createGameHost(() => current);
  let session: Session<EntityId> = createSession(host, tables, { speaker: "player" });

  function opening(): Line[] {
    const lines: Line[] = [];
    const ctx = ctxFor(lines);
    lookAround({ ctx, actor: ctx.world.player, verb: lex.root("eye") }, ctx.world.player);
    ctx.world.events = [];
    return lines;
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
    const readings = readingsOf(ctx, ageben);
    if (!readings) return undefined;
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
      outcome = perform(ctx, text);
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
        if (fit) fits.push({ miss, ...fit, doable: (readingsOf(ctx, fit.spoken.ageben, false) ?? []).every((r) => r.claim.verb?.kind !== "thing" || !!handlerFor(ctx, r.claim.verb.root)) });
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
        outcome = perform(ctx, fit.spoken.ageben);
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

  /**
   * The readings of a line against the conversation so far, if the game can act on all of them: nothing unread or
   * unordered, nothing the host does not accept, and (with `refer`) every role found in the scene.
   */
  function readingsOf(ctx: Ctx, ageben: string, refer = true): Reading[] | undefined {
    let readings: Reading[];
    current = ctx;
    try {
      readings = readQuestion(session.log, ageben, tables, { speaker: session.speaker });
    } catch {
      return undefined;
    }
    for (const reading of readings) {
      if (reading.unread.length || reading.unordered.length || host.accepts!(reading).length) return undefined;
      if (!refer) continue;
      for (const role of ["z", "d", "b"] as const) {
        const term = reading.claim.roles[role];
        if (term && term.kind !== "blank" && host.refer!(term, { reading, role }).kind !== "one") return undefined;
      }
    }
    return readings;
  }

  /** Run a line through the interpreter loop with this turn's lines, and write what it did. */
  function perform(ctx: Ctx, text: string): Outcome {
    current = ctx;
    const before = ctx.lines.length;
    const turn = run(text, session);
    if (turn.outcome === "parse") {
      ctx.lines.push({ kind: "confused", card: { kind: "sentence", message: turn.error ?? "The sentence did not read." } });
      return "parse";
    }
    if (turn.outcome === "beyond") {
      ctx.lines.push({ kind: "beyond", english: BEYOND, parts: turn.beyond.map((part) => (part.kind === "handler" ? `the verb ${lex.concrete(part.name)}` : part.kind === "accepts" ? part.name : `${part.kind}: ${part.name}`)) });
      return "beyond";
    }
    const answerer = ctx.world.addressee;
    for (const reply of turn.replies) {
      if (reply.gloss && answerer) speak(ctx, answerer, [{ gloss: reply.gloss, english: reply.english, mentions: [] }]);
    }
    if (turn.outcome === "refused" && !ctx.lines.slice(before).some((line) => line.kind === "refusal" || line.kind === "speech")) {
      const reason = turn.readings.find((r) => r.outcome === "refused")?.refused ?? "";
      refuse(ctx, /no referent/.test(reason) ? "There is no such thing here." : /several/.test(reason) ? "Which one? There is more than one." : reason);
    }
    return turn.outcome;
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
