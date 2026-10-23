/**
 * The school's scenarios, played in the sandbox: each quest names the grammar it needs by construction id
 * (its area follows from them), a goal over world state, an abstract model for the reachability check,
 * and walkthrough scripts written as morph gloss (spelled by gloss-inverse, so a respelling needs no retie).
 * A name in a gloss is a `{concrete}` slot (`y-{guard}`), filled from the lexicon by {@link expandGloss}.
 */
import { namedEnglish } from "../closed-roots.js";
import type { GameLexicon } from "./lexicon.js";
import type { QuestModel } from "./reachability.js";
import type { World } from "./types.js";

/** Fill each `{concrete}` slot with the name label of that row's root (`y-{guard}` is the guard called by title). */
export function expandGloss(gloss: string, lex: GameLexicon): string {
  return gloss.replace(/\{([a-z-]+)\}/g, (_, concrete: string) => namedEnglish(lex.root(concrete)));
}

export type Quest = {
  id: string;
  title: string;
  /** Construction ids the quest is about; the furthest one's section is its area. */
  needs: string[];
  goal(world: World): boolean;
  /** Shown when the goal is reached. */
  done: string;
  model: QuestModel;
  /** Ways through, one sentence per line as morph gloss, each from a fresh sandbox. */
  walkthroughs: string[][];
};

const heldBy = (world: World, id: string, by: string) => {
  const place = world.entities[id]?.place;
  return place?.rel === "held" && place.by === by;
};

/** Calling someone and the one called dozing off: in every model, so a sleeping character is never a dead end. */
const CALLS = [
  { name: "call the guard", pre: { player: "hall" }, post: { called: "guard", guard: "awake" } },
  { name: "the guard falls asleep", pre: { called: "guard" }, post: { called: "none", guard: "asleep" } },
] as const;

export const QUESTS: Quest[] = [
  {
    id: "open-door",
    title: "Call the guard and have the door opened",
    needs: ["sentence.turnWord.Vocative", "force.e"],
    goal: (world) => world.entities.door?.state.includes("open") ?? false,
    done: "The way to the study is open.",
    model: {
      start: { player: "hall", called: "none", guard: "awake", door: "closed" },
      actions: [
        ...CALLS,
        { name: "the guard opens the door", pre: { called: "guard", guard: "awake", door: "closed" }, post: { door: "open" } },
        { name: "the door opens at your word", pre: { door: "closed" }, post: { door: "open" } },
      ],
      goal: { door: "open" },
    },
    walkthroughs: [
      ["y-{guard}", "y-command | v-open | d-door"],
      ["y-{door} | y-command | v-open"],
    ],
  },
  {
    id: "ask-color",
    title: "Ask whether the book is red",
    // *The book* is a resume (pronouns.md#resume-r), so this quest sits after the calls-and-commands stretch of the path.
    needs: ["sentence.turnWord.Vocative", "force.o", "resolve.content.unbound"],
    goal: (world) => world.facts.some((fact) => fact.startsWith("told:book:")),
    done: "Now you know the colour of the book.",
    model: {
      start: { player: "hall", called: "none", guard: "awake", told: "no" },
      actions: [...CALLS, { name: "ask about the book", pre: { called: "guard", guard: "awake" }, post: { told: "yes" } }],
      goal: { told: "yes" },
    },
    walkthroughs: [["y-{guard}", "y-question | z-←book | g-red"]],
  },
  {
    id: "deliver-book",
    title: "Ask where the book is, find it with the magnifier, and give it to the teacher",
    needs: ["force.o", "resolve.content.unbound", "hook.al", "hook.el"],
    goal: (world) => heldBy(world, "book", "teacher"),
    done: "The teacher has the book back.",
    model: {
      start: { player: "hall", called: "none", guard: "awake", door: "closed", knows: "no", magnifier: "table", book: "hidden" },
      actions: [
        ...CALLS,
        { name: "ask the guard where the book is", pre: { called: "guard", guard: "awake" }, post: { knows: "yes" } },
        { name: "pick up the magnifier", pre: { player: "hall", magnifier: "table" }, post: { magnifier: "player" } },
        { name: "give the magnifier to the guard", pre: { player: "hall", magnifier: "player" }, post: { magnifier: "guard" } },
        { name: "the guard gives it back", pre: { called: "guard", guard: "awake", magnifier: "guard" }, post: { magnifier: "player" } },
        { name: "give the magnifier to the teacher", pre: { player: "study", magnifier: "player" }, post: { magnifier: "teacher" } },
        { name: "the teacher gives it back", pre: { player: "study", called: "teacher", magnifier: "teacher" }, post: { magnifier: "player" } },
        { name: "call the teacher", pre: { player: "study" }, post: { called: "teacher" } },
        { name: "the guard opens the door", pre: { called: "guard", guard: "awake", door: "closed" }, post: { door: "open" } },
        { name: "the door opens at your word", pre: { door: "closed" }, post: { door: "open" } },
        { name: "go into the study", pre: { player: "hall", door: "open" }, post: { player: "study", called: "none" } },
        { name: "go back to the hall", pre: { player: "study", door: "open" }, post: { player: "hall", called: "none" } },
        { name: "find the book", pre: { player: "study", book: "hidden", knows: "yes", magnifier: "player" }, post: { book: "found" } },
        { name: "pick up the book", pre: { player: "study", book: "found" }, post: { book: "player" } },
        { name: "give the book to the teacher", pre: { player: "study", book: "player" }, post: { book: "teacher" } },
        { name: "give the book to the guard", pre: { player: "hall", book: "player" }, post: { book: "guard" } },
        { name: "the guard gives the book back", pre: { called: "guard", guard: "awake", book: "guard" }, post: { book: "player" } },
      ],
      goal: { book: "teacher" },
    },
    walkthroughs: [
      [
        "y-{guard}",
        "y-question | [at | b-wh] | z-←book",
        "z-speaker | d-←magnify | v-carry",
        "y-command | v-open | d-door",
        "z-speaker | v-go | [in | b-←room]",
        "z-speaker | d-←book | v-find",
        "z-speaker | d-←book | v-carry",
        "z-speaker | d-←book | v-present | b-{hibiscus}",
      ],
    ],
  },
];
