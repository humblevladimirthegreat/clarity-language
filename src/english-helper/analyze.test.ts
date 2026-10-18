import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { analyzeEnglish, slotTier, type ClassSuggestion, type JobSuggestion, type LiveSuggestion, type RoleSuggestion, type RootSuggestion, type Slot } from "./analyze.js";
import { lookupLexicon } from "./lexicon.js";
import { loadHelperData } from "./load.js";
import { WORDNET_INDEX_VERSION, type WordnetIndex } from "./wordnet-index.js";

const data = loadHelperData();

function slots(text: string, stage?: "beginner" | "intermediate" | "advanced") {
  return analyzeEnglish(data, text, { stage }).clauses.flatMap((c) => c.slots);
}

describe("analyzeEnglish on the real docs and lexicon", () => {
  it("suggests a root with the word its role spells", () => {
    const dog = slots("Azawan sees a dog.").find((s) => s.text === "dog")!;
    const root = dog.suggestions.find((s): s is RootSuggestion => s.kind === "lexicon")!;
    assert.equal(root.tier, "root");
    assert.equal(root.role, "d");
    assert.equal(root.word, `d${root.form}l`);
    assert.equal(root.roleLink, "clause.md#direct-object-d");
  });

  it("builds a house-cast name on its root with -n", () => {
    const name = slots("Azawan walks.")[0]!;
    const root = name.suggestions.find((s): s is RootSuggestion => s.kind === "lexicon")!;
    assert.equal(root.name, true);
    assert.equal(root.word, "zazawan");
    assert.ok(name.suggestions.some((s) => s.kind === "detector" && s.id === "proper-name"));
  });

  it("builds role compounds for a doer noun, usual role first", () => {
    const teacher = slots("The teacher sings.").find((s) => s.text === "teacher")!;
    const roles = teacher.suggestions.filter((s): s is RoleSuggestion => s.kind === "role");
    assert.deepEqual(roles.map((r) => [r.usual, r.link]), [[true, "roles.md#usual-role"], [false, "roles.md#role-compounds"]]);
    assert.equal(roles[0]!.form, `zax${roles[0]!.root}thel`);
    assert.equal(roles[1]!.form, `zax${roles[0]!.root}l`);
    assert.equal(teacher.suggestions[0]!.kind, "role");
  });

  it("stacks the noun before a doer into the stem", () => {
    const walker = slots("Azawan sees a dog walker.").find((s) => s.text === "walker")!;
    const stacked = walker.suggestions.find((s): s is RoleSuggestion => s.kind === "role" && !!s.modifier)!;
    assert.equal(stacked.modifier!.english, "dog");
    assert.equal(stacked.form, `dax${stacked.modifier!.root}x${stacked.root}thel`);
  });

  it("offers no role compound for a noun with a root of its own", () => {
    const dog = slots("The flower sings.").find((s) => s.text === "flower")!;
    assert.ok(!dog.suggestions.some((s) => s.kind === "role"));
  });

  it("lists every job of a multi-job word, in table order", () => {
    const by = slots("Azawan walks by the station.").find((s) => s.text === "by")!;
    const jobs = by.suggestions.filter((s): s is JobSuggestion => s.kind === "job");
    assert.ok(jobs.length >= 3);
    assert.ok(jobs.every((j) => j.source.startsWith("english.md:")));
  });

  it("points function words and clause grammar at their sections", () => {
    const analysis = analyzeEnglish(data, "My sister couldn't come yesterday.");
    const [clause] = analysis.clauses;
    const could = clause!.slots.find((s) => s.text === "could")!;
    assert.ok(could.suggestions.some((s) => s.kind === "detector" && s.links.includes("say-tense.md#can-may")));
    assert.ok(clause!.slots.find((s) => s.text === "sister")!.suggestions.some((s) => s.kind === "job" && s.link.startsWith("say-people-places.md#kin-words")));
    assert.ok(clause!.slots.find((s) => s.text === "not")!.suggestions.some((s) => s.kind === "detector" && s.id === "negation"));
    assert.ok(analyzeEnglish(data, "Azawan walked.").clauses[0]!.detectors.some((d) => d.id === "past"));
  });

  it("skips articles and bare auxiliaries, and reports gaps", () => {
    const s = slots("The dog is walking.");
    assert.equal(slotTier(s.find((x) => x.text === "The")!), "skip");
    assert.equal(slotTier(s.find((x) => x.text === "is")!), "skip");
    const { gaps } = analyzeEnglish(data, "Azawan walks zxqv.");
    assert.deepEqual(gaps.map((g) => g.lemma), ["zxqv"]);
  });

  it("hides sections above the chosen stage", () => {
    const advanced = (stage?: "beginner") =>
      slots("Azawan walks by the station.", stage)
        .flatMap((s) => s.suggestions)
        .filter((s) => s.kind === "job" && data.sections.get(s.link)?.band === "intermediate").length;
    assert.ok(advanced() > 0);
    assert.equal(advanced("beginner"), 0);
  });
});

describe("WordNet tiers and routes", () => {
  // A hand-built index, so these tests pin the analyzer, not the generated file.
  const wordnet: WordnetIndex = {
    version: WORDNET_INDEX_VERSION,
    inputs: "",
    entries: {
      automobile: [{ sense: "car", tier: "synonym", pos: "n" }],
      pupper: [{ sense: "dog", tier: "broader", pos: "n" }],
      blarg: [{ sense: "car", tier: "synonym", pos: "v" }],
    },
    routes: { cousin: { class: "kin" }, sister: { class: "kin" }, piglet: { class: "young", sense: "dog" } },
  };
  const withWordnet = { ...data, wordnet };
  const slotsOf = (text: string) => analyzeEnglish(withWordnet, text).clauses.flatMap((c) => c.slots);
  const root = (english: string) => lookupLexicon(data.lexicon, [english]).find((s) => s.tier === "root")!.form;
  const lexical = (slot: Slot) => slot.suggestions.filter((s): s is RootSuggestion => s.kind === "lexicon");

  it("falls back to a WordNet synonym, labeled with its lead", () => {
    const [lead] = lexical(slotsOf("Azawan sees the automobile.").find((s) => s.text === "automobile")!);
    assert.equal(lead!.tier, "synonym");
    assert.equal(lead!.lead, "car");
    assert.equal(lead!.form, root("car"));
    assert.equal(lead!.word, `d${root("car")}l`);
  });

  it("offers a broader sense, only for the part of speech WordNet links", () => {
    assert.equal(lexical(slotsOf("Azawan sees a pupper.").find((s) => s.text === "pupper")!)[0]!.tier, "broader");
    assert.equal(lexical(slotsOf("Azawan sees the blarg.").find((s) => s.text === "blarg")!).length, 0);
  });

  it("routes a kin term to the kin sections, unless a cue row already does", () => {
    const cousin = slotsOf("My cousin walks.").find((s) => s.text === "cousin")!;
    const route = cousin.suggestions.find((s): s is ClassSuggestion => s.kind === "class")!;
    assert.equal(route.class, "kin");
    assert.ok(route.links.includes("numbers-applied.md#kin-generations"));
    const sister = slotsOf("My sister walks.").find((s) => s.text === "sister")!;
    assert.ok(!sister.suggestions.some((s) => s.kind === "class"));
  });

  it("says a young animal as the animal's root plus a /ɡ/ word", () => {
    const route = slotsOf("Azawan sees a piglet.").find((s) => s.text === "piglet")!.suggestions.find((s): s is ClassSuggestion => s.kind === "class")!;
    assert.equal(route.class, "young");
    assert.equal(route.animal!.form, root("dog"));
    assert.equal(route.qualifier!.form, root("child"));
    assert.equal(route.phrase, `d${root("dog")}l g${root("child")}l`);
    assert.equal(route.links[0], "say-people-places.md#young-animals");
  });
});

describe("compounds", () => {
  const root = (english: string) => lookupLexicon(data.lexicon, [english]).find((s) => s.tier === "root")!.form;
  const listed = (slot: Slot) => slot.suggestions.filter((s): s is RootSuggestion => s.kind === "lexicon" && s.tier === "compound");

  it("matches a multi-word compound sense as one slot", () => {
    const slot = slots("We sat in the living room.").find((s) => s.text === "living room")!;
    assert.equal(slot.cls, "noun");
    assert.equal(listed(slot)[0]?.sense, "living-room");
  });

  it("shows the listed compound first when two words' roots are its parts", () => {
    const book = slots("She read a school book.").find((s) => s.text === "book")!;
    const [first] = book.suggestions;
    assert.equal(first?.kind === "lexicon" && first.tier, "compound");
    assert.deepEqual(first?.kind === "lexicon" && first.fromParts, { left: "school", head: "book" });
  });

  it("builds a live x compound from two nouns with roots, ranked last", () => {
    const shop = slots("The cat sat in the tea shop.").find((s) => s.text === "shop")!;
    const live = shop.suggestions.at(-1) as LiveSuggestion;
    assert.equal(live.kind, "live");
    assert.equal(live.stem, `${root("tea")}x${root("shop")}`);
    assert.equal(live.form, `b${live.stem}l`);
    assert.equal(live.link, "x-compounds.md#ordinary-compound-order");
  });

  it("keeps an adjective and a noun as two words", () => {
    const dog = slots("A blue dog ran.").find((s) => s.text === "dog")!;
    assert.ok(!dog.suggestions.some((s) => s.kind === "live" || (s.kind === "lexicon" && s.fromParts)));
  });
});
