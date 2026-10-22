/**
 * The sentence generator's shapes. Each shape writes a morph gloss from world state, plus its English;
 * the voice spells the gloss and parses it, so the generator can show an odd line but never an unparsed one.
 * Shapes give alternatives in preference order when a first mention or a resume might read another way.
 * First shapes: yes/no answer, fill answer (fragment and full clause), describing a thing, reporting an
 * action, and the greeting and thanks chunks.
 */
import { CLOSED, namedEnglish } from "../closed-roots.js";
import type { GameLexicon } from "./lexicon.js";
import type { Voice } from "./voice.js";
import { entity } from "./world.js";
import type { EntityId, Spoken, World, WorldEvent } from "./types.js";

/** English for a thing whose concrete sense is not a noun (`magnify` is a *magnifier*). */
export const NOUN_ENGLISH: Record<string, string> = {
  magnify: "magnifier",
  teach: "teacher",
  footprints: "footprints",
  eye: "eye",
  speech: "speech",
  construct: "builder",
};

/** Things English counts as stuff, not one of a kind (*some wood*). */
const MASS_NOUNS = new Set(["wood", "water", "money"]);

/** Hooks the generator writes, by English (hooks.md#extra-noun). */
export const HOOK_ENGLISH: Record<string, string> = { ol: "at", al: "in", ul: "from", el: "for" };

/** Fixed lines: glosses spelled at build time, with their English. */
export const FIXED = {
  confused: { gloss: "y-question", english: "Huh?" },
  yes: { gloss: "y-yes", english: "Yes." },
  no: { gloss: "y-no", english: "No." },
  sure: { gloss: "y-sure", english: "Sure." },
  thanks: { gloss: "th-relatedness-met-any-term", english: "Thank you, that meant a lot to me." },
} as const;

/** Whose *I* and *you* a line uses. */
export type View = { speaker?: EntityId; listener?: EntityId };

export type Draft = { gloss: string; english: string; mentions: EntityId[] };

export type Generator = {
  voice: Voice;
  lex: GameLexicon;
  /** The first draft that spells and parses. */
  say(drafts: Draft[]): (Spoken & { mentions: EntityId[] }) | undefined;
  fixed(line: keyof typeof FIXED): Spoken | undefined;
  /** English for an entity: *I*, *you*, a name, or *the* / *a* thing. */
  english(world: World, id: EntityId, view: View): string;
  /** A noun leaf for an entity in slot `pos`; `fresh` writes a first mention (**-l**) even for a known thing. */
  mention(world: World, id: EntityId, pos: string, view: View, fresh?: boolean): string;
  nounEnglish(root: string): string;
  verbLeaf(root: string): string;
  hookLeaf(hook: string): string;
};

export function createGenerator(voice: Voice, lex: GameLexicon): Generator {
  const nounEnglish = (root: string) => {
    const concrete = lex.concrete(root);
    return NOUN_ENGLISH[concrete] ?? concrete.replace(/-/g, " ");
  };
  const gen: Generator = {
    voice,
    lex,
    say(drafts) {
      for (const draft of drafts) {
        const spoken = voice.say(draft.gloss, draft.english);
        if (spoken) return { ...spoken, mentions: draft.mentions };
      }
      return undefined;
    },
    fixed: (line) => voice.say(FIXED[line].gloss, FIXED[line].english),
    english(world, id, view) {
      if (id === view.speaker) return "I";
      if (id === view.listener) return "you";
      const e = entity(world, id);
      if (e.name) return namedEnglish(e.name);
      const noun = nounEnglish(e.root);
      if (world.mentioned.includes(id)) return `the ${noun}`;
      return MASS_NOUNS.has(lex.concrete(e.root)) ? `some ${noun}` : `${/^[aeiou]/.test(noun) ? "an" : "a"} ${noun}`;
    },
    mention(world, id, pos, view, fresh = false) {
      if (id === view.speaker) return voice.leaf(pos, CLOSED.microphone, "n");
      if (id === view.listener) return voice.leaf(pos, CLOSED.headphones, "n");
      const e = entity(world, id);
      if (e.name) return voice.leaf(pos, e.name, "n");
      return voice.leaf(pos, e.root, !fresh && world.mentioned.includes(id) ? "r" : "l");
    },
    nounEnglish,
    verbLeaf: (root) => voice.leaf("v", root, "l"),
    hookLeaf: (hook) => HOOK_ENGLISH[hook] ?? hook,
  };
  return gen;
}

const join = (parts: (string | undefined)[]) => parts.filter(Boolean).join(" | ");

/** Report an action: who did what to whom (statement order: subject, object, verb, recipient, then the place). */
export function reportDrafts(gen: Generator, world: World, event: WorldEvent, view: View, english: string): Draft[] {
  const drafts: Draft[] = [];
  const mentions = [event.agent, event.patient, event.recipient, event.place?.landmark].filter((id): id is EntityId => !!id);
  for (const fresh of [false, true]) {
    const m = (id: EntityId | undefined, pos: string) => (id ? gen.mention(world, id, pos, view, fresh) : undefined);
    const place = event.place ? `[${gen.hookLeaf(event.place.hook)} | ${m(event.place.landmark, "b")}]` : undefined;
    drafts.push({ gloss: join([m(event.agent, "z"), m(event.patient, "d"), gen.verbLeaf(event.verb), m(event.recipient, "b"), place]), english, mentions });
  }
  return drafts;
}

/** A list as the object: `z-listener | [d-dog | d-table | d-and] | v-see` (joins.md#beginner). */
export function listDrafts(gen: Generator, world: World, subject: EntityId, items: EntityId[], verb: string, view: View, english: string): Draft[] {
  const drafts: Draft[] = [];
  for (const fresh of [false, true]) {
    const objects = items.map((id) => gen.mention(world, id, "d", view, fresh));
    const list = objects.length === 1 ? objects[0]! : `[${objects.join(" | ")} | d-and]`;
    drafts.push({ gloss: join([gen.mention(world, subject, "z", view), list, gen.verbLeaf(verb)]), english, mentions: items });
  }
  return drafts;
}

/** Describe a thing: `z-←book | g-red`. */
export function describeDrafts(gen: Generator, world: World, id: EntityId, prop: string, view: View, english: string): Draft[] {
  return [{ gloss: join([gen.mention(world, id, "z", view), gen.voice.leaf("g", prop, "l")]), english, mentions: [id] }];
}

/** Say where a thing is: `z-book | [at | b-←table]`. */
export function whereDrafts(gen: Generator, world: World, id: EntityId, hook: string, landmark: EntityId, view: View, english: string): Draft[] {
  return [false, true].map((fresh) => ({
    gloss: `${gen.mention(world, id, "z", view, fresh)} | [${gen.hookLeaf(hook)} | ${gen.mention(world, landmark, "b", view, fresh)}]`,
    english,
    mentions: [id, landmark],
  }));
}

/** A place as a fragment answer: `[in | b-←room]` (fill-ask-roles.md#where). */
export function placeFragmentDrafts(gen: Generator, world: World, hook: string, landmark: EntityId, view: View, english: string): Draft[] {
  return [false, true].map((fresh) => ({
    gloss: `[${gen.hookLeaf(hook)} | ${gen.mention(world, landmark, "b", view, fresh)}]`,
    english,
    mentions: [landmark],
  }));
}

/** A one-word answer as a citation (`uzozen.`, questions.md#fill-ask). */
export function citationDrafts(gen: Generator, world: World, id: EntityId, english: string): Draft[] {
  const e = entity(world, id);
  const leaf = e.name ? gen.voice.leaf("", e.name, "n") : gen.voice.leaf("", e.root, "l");
  return [{ gloss: leaf, english, mentions: [id] }];
}

/** An adjective as the answer to *what is it like?* (fill-ask-roles.md#what-kind). */
export function adjectiveDrafts(gen: Generator, prop: string, english: string): Draft[] {
  return [{ gloss: gen.voice.leaf("g", prop, "l"), english, mentions: [] }];
}

/** A greeting: the speaker's own name as a citation (word-endings.md#greeting). */
export function greetingDrafts(gen: Generator, nameRoot: string): Draft[] {
  return [{ gloss: gen.voice.leaf("", nameRoot, "n"), english: "Hello.", mentions: [] }];
}

/** Which one? `y-question | g-wh | z-←dog` (*What is the dog like?*, fill-ask-roles.md#what-kind). */
export function whichDrafts(gen: Generator, root: string): Draft[] {
  return [{ gloss: `y-question | g-wh | ${gen.voice.leaf("z", root, "r")}`, english: `Which ${gen.nounEnglish(root)}?`, mentions: [] }];
}
