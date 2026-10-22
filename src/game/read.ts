/**
 * Reads a parse into acts the engine can resolve: who does what to whom, what kind of turn it is, and
 * which parts the engine cannot read yet. Role letters give exact slots, so there is no guessing here;
 * anything outside the shapes below lands in `unsupported` and the turn says so, never silently.
 */
import { CLOSED } from "../closed-roots.js";
import { actWord } from "../parse/series.js";
import type { GPackage, LexWord, NpCoord, ParseResult, Unit, Utterance } from "../parse/types.js";
import type { Act, Force, NounRef } from "./types.js";

const FORCES: Record<string, Force> = { a: "statement", o: "question", e: "command", u: "prohibition" };
const POLARS: Record<string, Act["polar"]> = { ae: "yes", ue: "no", ao: "sure" };
const POINTER_ROLES: Record<string, "agent" | "patient" | "recipient"> = { z: "agent", d: "patient", b: "recipient" };

function contentRoot(word: LexWord): string | undefined {
  return word.family.kind === "content" && word.family.roots.length === 1 ? word.family.roots[0] : undefined;
}

/** The engine's reading of one noun phrase head, or a reason it cannot read it. */
function nounRef(word: LexWord, adjs: LexWord[], gaps: Set<LexWord>): NounRef | string {
  if (gaps.has(word)) return { kind: "gap", word };
  if (word.plural) return `a group (${word.raw})`;
  if (word.family.kind === "x" && word.family.xFamily === "pointer") {
    const role = POINTER_ROLES[word.family.part ?? ""];
    if (!role || word.family.scopeVowel !== "a" || word.family.pointerVowel !== "a" || word.ending !== "r") return `this role pointer (${word.raw})`;
    return { kind: "pointer", word, role };
  }
  if (word.family.kind === "content" && word.family.roots.length > 1) return `a compound word (${word.raw})`;
  const root = contentRoot(word);
  if (!root) return `this kind of word (${word.raw})`;
  if (word.ending === "n") {
    if (root === CLOSED.microphone) return { kind: "speaker", word };
    if (root === CLOSED.headphones) return { kind: "listener", word };
    return { kind: "name", word, root, adjs };
  }
  if (word.ending === "l" || word.ending === "r") return { kind: "content", word, root, adjs };
  return `the ${word.ending === "m" ? "abstract sense" : "ending"} of ${word.raw}`;
}

function adjWords(adjs: GPackage[], act: Act): LexWord[] {
  const out: LexWord[] = [];
  for (const adj of adjs) {
    if (adj.hosted) act.unsupported.push(`a word that completes ${adj.word.raw}`);
    act.ignored.push(...adj.modifiers);
    if (adj.asOf) act.unsupported.push(`as-of on ${adj.word.raw}`);
    out.push(adj.word);
  }
  return out;
}

/** The single item of a noun slot, a fill-ask blank, or a reason. */
function npSlot(coord: NpCoord, act: Act, gaps: Set<LexWord>): NounRef | undefined {
  const part = coord.parts[0];
  if (coord.parts.length !== 1 || !part) {
    act.unsupported.push("a joined list");
    return undefined;
  }
  if (part.items.length === 0 && part.join && gaps.has(part.join)) return { kind: "gap", word: part.join };
  const item = part.items[0];
  if (part.items.length !== 1 || part.join || !item || item.kind !== "package") {
    act.unsupported.push(part.join ? `a join (${part.join.raw})` : "a joined list");
    return undefined;
  }
  const pkg = item.package;
  if (pkg.glAdj) act.unsupported.push(`a left-bound adjective (${pkg.glAdj.word.raw})`);
  if (pkg.tag) act.unsupported.push(`a tag (${pkg.tag.raw})`);
  const ref = nounRef(pkg.head, adjWords(pkg.adjs, act), gaps);
  if (typeof ref === "string") {
    act.unsupported.push(ref);
    return undefined;
  }
  return ref;
}

function blankAct(force: Force, antecedents: Map<LexWord, LexWord>): Act {
  return { force, calls: [], interjections: [], predicate: [], places: [], ignored: [], unsupported: [], antecedents };
}

function readUnits(units: Unit[], act: Act, gaps: Set<LexWord>): void {
  for (let i = 0; i < units.length; i += 1) {
    const unit = units[i]!;
    switch (unit.kind) {
      case "np": {
        const ref = npSlot(unit.coord, act, gaps);
        if (!ref) break;
        if (unit.coord.level === "z") {
          if (act.subject) act.unsupported.push("two subjects");
          act.subject = ref;
        } else if (unit.coord.level === "d") {
          if (act.object) act.unsupported.push("two objects");
          act.object = ref;
        } else {
          if (act.recipient) act.unsupported.push("two extra nouns");
          act.recipient = ref;
        }
        break;
      }
      case "vp": {
        const part = unit.coord.parts[0];
        const verb = part?.items[0];
        if (unit.coord.parts.length !== 1 || !part || part.items.length > 1 || part.hostedVerbs || part.itemUnits || part.sharedUnits) {
          act.unsupported.push("a joined list of verbs");
          break;
        }
        if (!verb && part.join && gaps.has(part.join)) {
          act.verb = { gap: part.join };
          break;
        }
        const root = verb && !part.join ? contentRoot(verb) : undefined;
        if (!verb || !root || verb.plural) {
          act.unsupported.push(verb ? `this verb (${verb.raw})` : "a verb join");
          break;
        }
        if (verb.ending !== "l") act.unsupported.push(`the ${verb.ending === "m" ? "abstract sense" : "ending"} of ${verb.raw}`);
        act.verb = { word: verb, root };
        break;
      }
      case "predicate":
        act.predicate.push(...adjWords([unit.adj], act));
        break;
      case "gCoord": {
        const part = unit.coord.parts[0];
        if (unit.coord.parts.length === 1 && part && part.items.length === 0 && part.join && gaps.has(part.join)) act.predicate.push(part.join);
        else act.unsupported.push("a joined list of adjectives");
        break;
      }
      case "h": {
        const word = unit.unit.word;
        if (word.pos === "h" && !unit.unit.hosted) act.ignored.push(...unit.unit.modifiers, word);
        else act.unsupported.push(word.pos === "th" ? `a stance (${word.raw})` : `this adverb (${word.raw})`);
        break;
      }
      case "hook": {
        const next = units[i + 1];
        if (unit.job !== "extraNoun" || next?.kind !== "np" || next.coord.level !== "b" || unit.modifiers.length || unit.frame || unit.heldIntention) {
          act.unsupported.push(`this hook (${unit.word.raw})`);
          break;
        }
        const landmark = npSlot(next.coord, act, gaps);
        if (landmark) act.places.push({ hook: unit.word.raw, word: unit.word, landmark });
        i += 1;
        break;
      }
      default:
        act.unsupported.push(unit.kind === "clauseCoord" ? "two joined clauses" : unit.kind === "linker" ? "a linker" : unit.kind === "island" ? "a scope island" : "a span");
    }
  }
}

/** Every sentence of every turn, as acts. A turn's act word carries to the sentences after its first. */
export function readActs(result: ParseResult): Act[] {
  const antecedents = new Map<LexWord, LexWord>();
  for (const bind of result.resolve?.anaphors ?? []) if (bind.antecedent) antecedents.set(bind.pronoun, bind.antecedent);
  const acts: Act[] = [];
  result.utterances.forEach((utterance, index) => {
    const ask = result.resolve?.asks.find((a) => a.utteranceIndex === index);
    const gaps = new Set(ask?.gaps ?? []);
    acts.push(...readUtterance(utterance, gaps, antecedents));
  });
  return acts;
}

function readUtterance(utterance: Utterance, gaps: Set<LexWord>, antecedents: Map<LexWord, LexWord>): Act[] {
  const { left } = utterance;
  const act = actWord(left);
  const series = act?.family.kind === "joinMarker" ? act.family.series : "a";
  const force = FORCES[series] ?? "statement";
  const first = blankAct(force, antecedents);
  if (act && !FORCES[series]) first.unsupported.push(`this act word (${act.raw})`);
  if (left.leadForce) first.unsupported.push(`a stacked act word (${left.leadForce.raw} ${left.force?.raw ?? ""})`);
  if (left.hook) first.unsupported.push(`a discourse hook (${left.hook.raw})`);
  for (const call of left.vocatives) {
    if (call.ending === "n" && contentRoot(call)) first.calls.push(call);
    else first.unsupported.push(`this call (${call.raw})`);
  }
  first.interjections.push(...left.interjections);
  for (const polar of left.polars) {
    const reading = polar.family.kind === "joinMarker" ? POLARS[polar.family.series] : undefined;
    if (reading && !first.polar) first.polar = reading;
    else first.unsupported.push(`this answer word (${polar.raw})`);
  }
  if (utterance.bodies.length === 0) return [first];
  return utterance.bodies.map((body, i) => {
    const act = i === 0 ? first : blankAct(force, antecedents);
    if (body.linker) act.unsupported.push(`a linker (${body.linker.raw})`);
    if (body.topicMarker) act.unsupported.push("a topic span");
    if (body.clause.dependent) act.unsupported.push("a dependent clause");
    const units = body.clause.units;
    const only = units[0];
    // A lone named citation with no role letter: the speaker's own name, as a greeting (word-endings.md#greeting).
    if (units.length === 1 && only?.kind === "np" && only.coord.parts.length === 1) {
      const item = only.coord.parts[0]!.items[0];
      const head = item?.kind === "package" ? item.package.head : undefined;
      if (head && !head.pos && head.ending === "n" && contentRoot(head) && only.coord.parts[0]!.items.length === 1) {
        act.greeting = head;
        return act;
      }
    }
    readUnits(units, act, gaps);
    // With no verb, the subject's adjectives say what it is (predication.md#beginner); with a verb they pick which one.
    if (!act.verb && act.subject && act.subject.kind !== "gap" && act.subject.kind !== "speaker" && act.subject.kind !== "listener" && act.subject.kind !== "pointer") {
      act.predicate.push(...act.subject.adjs);
      act.subject = { ...act.subject, adjs: [] };
    }
    return act;
  });
}
