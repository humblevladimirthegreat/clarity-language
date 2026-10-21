import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { loadDefaultTables } from "../parse/index.js";
import { glossToAgebon } from "../parse/gloss-inverse.js";
import { parseWithTables } from "../parse/parse-core.js";
import { buildGameData, fullGlossIndex } from "./build.js";
import { createEngine, type Engine } from "./engine.js";
import {
  adjectiveDrafts,
  citationDrafts,
  describeDrafts,
  greetingDrafts,
  listDrafts,
  placeFragmentDrafts,
  reportDrafts,
  whereDrafts,
  whichDrafts,
} from "./generate.js";
import { checkpointStops } from "./gating.js";
import { gameLexicon } from "./lexicon.js";
import { expandGloss, QUESTS } from "./quests.js";
import { entity } from "./world.js";
import type { Line, TurnResult } from "./types.js";

const tables = loadDefaultTables();
const data = buildGameData(tables);
const index = fullGlossIndex(tables);
const lex = gameLexicon(tables);
const spell = (gloss: string) => glossToAgebon(expandGloss(gloss, lex), tables, index);
const fresh = () => createEngine(tables, data);
const play = (engine: Engine, ...glosses: string[]) => glosses.map((gloss) => engine.turn(spell(gloss)));
const kinds = (result: TurnResult) => result.lines.map((line) => line.kind);

/** Every Agebon line the game wrote this turn. */
function written(lines: Line[]): string[] {
  return lines.flatMap((line) => {
    if (line.kind === "speech" || line.kind === "recast") return [line.spoken.agebon];
    if ((line.kind === "narration" || line.kind === "refusal") && line.spoken) return [line.spoken.agebon];
    return [];
  });
}

describe("walkthroughs", () => {
  for (const quest of QUESTS) {
    quest.walkthroughs.forEach((script, n) => {
      it(`${quest.id} #${n + 1} reaches its goal`, () => {
        const engine = fresh();
        for (const result of play(engine, ...script)) assert.equal(result.outcome, "ok", `${result.input}: ${JSON.stringify(result.lines)}`);
        assert.ok(quest.goal(engine.world));
        assert.ok(engine.world.facts.includes(`quest:${quest.id}`));
      });
    });
  }

  it("writes only Agebon that parses one way", () => {
    for (const quest of QUESTS) {
      const engine = fresh();
      const lines = [...engine.opening(), ...quest.walkthroughs[0]!.flatMap((gloss) => engine.turn(spell(gloss)).lines)];
      for (const agebon of written(lines)) {
        const result = parseWithTables(agebon, tables, { checkAmbiguity: true });
        assert.deepEqual(result.ambiguity, [], agebon);
      }
    }
  });
});

describe("the three failures", () => {
  it("a sentence that does not parse", () => {
    const result = fresh().turn("qqq zzz.");
    assert.equal(result.outcome, "parse");
    assert.ok(kinds(result).includes("confused"));
  });

  it("a verb with no handler is beyond the game, not wrong", () => {
    const result = fresh().turn(spell("z-speaker | d-dog | v-think"));
    assert.equal(result.outcome, "beyond");
    assert.ok(kinds(result).includes("beyond"));
  });

  it("a command with no one listening is refused", () => {
    const result = fresh().turn(spell("y-command | v-open | d-door"));
    assert.equal(result.outcome, "refused");
    assert.ok(kinds(result).includes("refusal"));
  });

  it("grammar the engine cannot read yet is beyond the game", () => {
    const result = fresh().turn(spell("[z-dog | z-cat | z-and] | v-sleep"));
    assert.equal(result.outcome, "beyond");
  });
});

describe("recasts", () => {
  it("recasts a near miss to the one verb the game can do", () => {
    const engine = fresh();
    play(engine, "y-{guard}");
    const door = spell("y-command | v-open | d-door");
    const slip = door.replace(/^yel v(\w)/, (_, vowel: string) => `yel v${vowel === "e" ? "o" : "e"}`);
    const result = engine.turn(slip);
    const recast = result.lines.find((line) => line.kind === "recast");
    assert.ok(recast, JSON.stringify(result.lines));
    assert.equal(result.ran?.replace(/\.$/, ""), door);
    assert.ok(entity(engine.world, "door").state.includes("open"));
  });

  it("reads a typed gloss as the Agebon it glosses", () => {
    const result = fresh().turn("z-speaker d-door v-see");
    assert.equal(result.outcome, "ok");
    assert.equal(result.ran?.replace(/\.$/, ""), spell("z-speaker | d-door | v-see"));
  });

  it("fixes capitals and a hyphen after the role letter", () => {
    const see = spell("z-speaker | d-door | v-see");
    const result = fresh().turn(see.toUpperCase().replace(/^Z/, "Z-"));
    assert.equal(result.outcome, "ok", JSON.stringify(result.lines));
  });
});

describe("no dead ends", () => {
  it("a needed thing cannot be unmade", () => {
    const engine = fresh();
    play(engine, "y-{guard}", "y-command | v-open | d-door", "z-speaker | v-go | [in | b-←room]");
    const result = engine.turn(spell("z-speaker | d-←book | v-find"));
    assert.equal(result.outcome, "refused");
    assert.equal(engine.turn(spell("z-speaker | d-door | v-eraser")).outcome, "refused");
    assert.ok(!entity(engine.world, "door").state.includes("gone"));
  });

  it("a needed thing survives a fire", () => {
    const engine = fresh();
    play(engine, "y-{guard}", "y-question | [at | b-wh] | z-←book", "z-speaker | d-←magnify | v-carry", "y-command | v-open | d-door", "z-speaker | v-go | [in | b-←room]", "z-speaker | d-←book | v-find");
    assert.equal(engine.turn(spell("z-speaker | d-←book | v-fire")).outcome, "ok");
    engine.turn(spell("z-speaker | v-sleep"));
    const book = entity(engine.world, "book");
    assert.ok(!book.state.includes("gone") && !book.state.includes("burning"));
  });

  it("a sleeping guard wakes when called", () => {
    const engine = fresh();
    play(engine, "y-{guard}", "y-command | v-sleep");
    assert.equal(engine.turn(spell("y-question | z-←book | g-red")).outcome, "refused");
    play(engine, "y-{guard}");
    assert.equal(engine.turn(spell("y-question | z-←book | g-red")).outcome, "ok");
  });
});

describe("generator shapes", () => {
  it("each first shape spells and parses on the sandbox world", () => {
    const engine = fresh();
    const { gen, world } = engine;
    const view = { speaker: "guard", listener: world.player };
    const red = lex.root("red");
    const drafts = [
      reportDrafts(gen, world, { turn: 1, verb: lex.root("present"), agent: "guard", patient: "book", recipient: world.player }, view, "I give you a book."),
      listDrafts(gen, world, "guard", ["dog", "door"], lex.root("eye"), view, "I see a dog and a door."),
      describeDrafts(gen, world, "book", red, view, "A red book."),
      whereDrafts(gen, world, "book", "al", "study", view, "A book in a room."),
      placeFragmentDrafts(gen, world, "ol", "table", view, "At a table."),
      citationDrafts(gen, world, "dog", "A dog."),
      adjectiveDrafts(gen, red, "Red."),
      greetingDrafts(gen, entity(world, "guard").name!),
      whichDrafts(gen, lex.root("dog")),
    ];
    for (const draft of drafts) assert.ok(gen.say(draft), draft[0]?.gloss ?? "no draft");
    for (const line of ["confused", "yes", "no", "sure", "thanks"] as const) assert.ok(gen.fixed(line), line);
  });
});

describe("gating", () => {
  it("narration stays English until its grammar is reached", () => {
    const first = checkpointStops(data.gate)[0]!;
    const engine = createEngine(tables, data, { progress: { position: first.position } });
    const narration = engine.opening().filter((line) => line.kind === "narration");
    assert.ok(narration.length > 0);
    for (const line of narration) assert.ok(line.kind === "narration" && line.gate && !line.gate.ok, JSON.stringify(line));
  });

  it("everything is open in the sandbox", () => {
    const narration = fresh().opening().filter((line) => line.kind === "narration");
    for (const line of narration) assert.ok(line.kind === "narration" && line.gate?.ok);
  });
});
