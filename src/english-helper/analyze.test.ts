import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

import { analyzeEnglish, slotTier, type ClassSuggestion, type JobSuggestion, type LiveSuggestion, type RoleSuggestion, type RootSuggestion, type Slot } from "./analyze.js";
import { checkCase, parseCases } from "./cases.js";
import { lookupLexicon } from "./lexicon.js";
import { loadHelperData } from "./load.js";
import { WORDNET_INDEX_VERSION, type WordnetIndex } from "./wordnet-index.js";

const data = loadHelperData();

function slots(text: string, stage?: "beginner" | "intermediate" | "advanced") {
  return analyzeEnglish(data, text, { stage }).clauses.flatMap((c) => c.slots);
}

describe("cases.tsv", () => {
  it("holds every pinned behavior", () => {
    const cases = parseCases(readFileSync(new URL("./cases.tsv", import.meta.url), "utf8"));
    assert.ok(cases.length > 0);
    const failures = cases.flatMap((c) => {
      const why = checkCase(analyzeEnglish(data, c.english), c);
      return why ? [`cases.tsv:${c.line} ${c.english} [${c.slot}] ${c.expect}: ${why}`] : [];
    });
    assert.deepEqual(failures, []);
  });
});

describe("analyzeEnglish on the real docs and lexicon", () => {
  it("suggests a root with the word its role spells", () => {
    const dog = slots("Uzozen sees a dog.").find((s) => s.text === "dog")!;
    const root = dog.suggestions.find((s): s is RootSuggestion => s.kind === "lexicon")!;
    assert.equal(root.tier, "root");
    assert.equal(root.role, "d");
    assert.equal(root.word, `d${root.form}l`);
    assert.equal(root.roleLink, "clause.md#direct-object-d");
  });

  it("builds a house-cast name on its root with -n", () => {
    const name = slots("Uzozen walks.")[0]!;
    const root = name.suggestions.find((s): s is RootSuggestion => s.kind === "lexicon")!;
    assert.equal(root.name, true);
    assert.equal(root.word, "zuzozen");
    assert.ok(name.suggestions.some((s) => s.kind === "detector" && s.id === "proper-name"));
  });

  it("builds role compounds for a doer noun, usual role first", () => {
    const teacher = slots("The teacher sings.").find((s) => s.text === "teacher")!;
    const roles = teacher.suggestions.filter((s): s is RoleSuggestion => s.kind === "role");
    assert.deepEqual(roles.map((r) => [r.usual, r.link]), [[true, "roles.md#one-time-or-a-practice"], [false, "roles.md#role-compounds"]]);
    assert.equal(roles[0]!.form, `zwez${roles[0]!.root}l`);
    assert.equal(roles[1]!.form, `zwaz${roles[0]!.root}l`);
    assert.equal(teacher.suggestions[0]!.kind, "role");
  });

  it("stacks the noun before a doer into the stem", () => {
    const walker = slots("Uzozen sees a dog walker.").find((s) => s.text === "walker")!;
    const stacked = walker.suggestions.find((s): s is RoleSuggestion => s.kind === "role" && !!s.modifier)!;
    assert.equal(stacked.modifier!.english, "dog");
    assert.equal(stacked.form, `dwez${stacked.modifier!.root}x${stacked.root}l`);
  });

  it("lists every job of a multi-job word, in table order", () => {
    const by = slots("Uzozen walks by the station.").find((s) => s.text === "by")!;
    const jobs = by.suggestions.filter((s): s is JobSuggestion => s.kind === "job");
    assert.ok(jobs.length >= 3);
    const recipe = jobs.filter((j) => j.source.startsWith("english.md:"));
    assert.deepEqual(jobs.slice(0, recipe.length), recipe);
    const lines = recipe.map((j) => Number(j.source.split(":")[1]));
    assert.deepEqual(lines, [...lines].sort((a, b) => a - b));
  });

  it("skips articles and bare auxiliaries, and reports gaps", () => {
    const s = slots("The dog is walking.");
    assert.equal(slotTier(s.find((x) => x.text === "The")!), "skip");
    assert.equal(slotTier(s.find((x) => x.text === "is")!), "skip");
    const { gaps } = analyzeEnglish(data, "Uzozen walks zxqv.");
    assert.deepEqual(gaps.map((g) => g.lemma), ["zxqv"]);
  });

  it("hides sections above the chosen stage", () => {
    const advanced = (stage?: "beginner") =>
      slots("Uzozen walks by the station.", stage)
        .flatMap((s) => s.suggestions)
        .filter((s) => s.kind === "job" && data.sections.get(s.link)?.band === "intermediate").length;
    assert.ok(advanced() > 0);
    assert.equal(advanced("beginner"), 0);
  });

  it("spells an alias both ways", () => {
    const grateful = slots("I am grateful.").find((s) => s.text === "grateful")!;
    const alias = grateful.suggestions.find((s): s is RootSuggestion => s.kind === "lexicon" && s.tier === "alias")!;
    assert.equal(alias.word, undefined);
    assert.deepEqual(
      alias.sideWords!.map((w) => [w.side, w.word]),
      [
        ["concrete", `g${alias.form}l`],
        ["abstract", `g${alias.form}m`],
      ],
    );
  });

  it("spells no number word for one of several number words", () => {
    const many = slots("Uzozen sees twenty one books.").flatMap((s) => s.suggestions);
    assert.ok(!many.some((s) => s.kind === "detector" && s.form));
  });

  it("shows a doc example for a detector, through a recipe row's teach link", () => {
    const my = slots("My cat runs.").find((s) => s.text === "My")!;
    const possessive = my.suggestions.find((s) => s.kind === "detector" && s.id === "possessive-pronoun");
    assert.ok(possessive?.kind === "detector" && possessive.example);
    assert.equal(possessive.example.link, "ending-grids.md#genitive");
    assert.match(possessive.example.english, /\bmy\b/i);
  });

  it("shows a doc example for a grammar row whose form is only a pattern", () => {
    const that = slots("Uzozen is tired, and Olazun is that too.").flatMap((s) => s.suggestions);
    const patterns = that.filter((s): s is JobSuggestion => s.kind === "job" && /^\/[ɡw]\//.test(s.form));
    assert.ok(patterns.length > 0);
    assert.ok(patterns.every((j) => j.example));
    const spelled = that.filter((s): s is JobSuggestion => s.kind === "job" && /^[a-z]+$/.test(s.form));
    assert.ok(spelled.every((j) => !j.example));
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
      "motor carriage": [{ sense: "car", tier: "synonym", pos: "n" }],
      "big dog": [{ sense: "car", tier: "synonym", pos: "n" }],
    },
    routes: { cousin: { class: "kin" }, sister: { class: "kin" }, piglet: { class: "young", sense: "dog" } },
  };
  const withWordnet = { ...data, wordnet };
  const slotsOf = (text: string) => analyzeEnglish(withWordnet, text).clauses.flatMap((c) => c.slots);
  const root = (english: string) => lookupLexicon(data.lexicon, [english]).find((s) => s.tier === "root")!.form;
  const lexical = (slot: Slot) => slot.suggestions.filter((s): s is RootSuggestion => s.kind === "lexicon");

  it("falls back to a WordNet synonym, labeled with its lead", () => {
    const [lead] = lexical(slotsOf("Uzozen sees the automobile.").find((s) => s.text === "automobile")!);
    assert.equal(lead!.tier, "synonym");
    assert.equal(lead!.lead, "car");
    assert.equal(lead!.form, root("car"));
    assert.equal(lead!.word, `d${root("car")}l`);
  });

  it("joins a run on a WordNet phrase lead only when its last noun has no lexicon sense", () => {
    const carriage = slotsOf("Uzozen sees the motor carriage.").find((s) => s.text === "motor carriage")!;
    assert.equal(lexical(carriage)[0]!.lead, "car");
    assert.ok(slotsOf("Uzozen sees the big dog.").some((s) => s.text === "dog"));
  });

  it("offers a broader sense, only for the part of speech WordNet links", () => {
    assert.equal(lexical(slotsOf("Uzozen sees a pupper.").find((s) => s.text === "pupper")!)[0]!.tier, "broader");
    assert.equal(lexical(slotsOf("Uzozen sees the blarg.").find((s) => s.text === "blarg")!).length, 0);
  });

  it("routes a kin term to the kin sections, unless a cue row already does", () => {
    const cousin = slotsOf("My cousin walks.").find((s) => s.text === "cousin")!;
    const route = cousin.suggestions.find((s): s is ClassSuggestion => s.kind === "class")!;
    assert.equal(route.class, "kin");
    assert.ok(route.links.includes("initials.md#kin-generations"));
    const sister = slotsOf("My sister walks.").find((s) => s.text === "sister")!;
    assert.ok(!sister.suggestions.some((s) => s.kind === "class"));
  });

  it("says a young animal as the animal's root plus a /ɡ/ word", () => {
    const route = slotsOf("Uzozen sees a piglet.").find((s) => s.text === "piglet")!.suggestions.find((s): s is ClassSuggestion => s.kind === "class")!;
    assert.equal(route.class, "young");
    assert.equal(route.animal!.form, root("dog"));
    assert.equal(route.qualifier!.form, root("child"));
    assert.equal(route.phrase, `d${root("dog")}l g${root("child")}l`);
    assert.equal(route.links[0], "say-people-places.md#young-animals");
  });
});

describe("hooks", () => {
  const hookSlot = (text: string, word: string) => slots(text).find((s) => s.text === word)!;
  const roleWord = (slot: Slot) => slot.suggestions.find((s): s is RootSuggestion => s.kind === "lexicon")?.word;

  it("spells a preposition's hook with the landmark noun after it", () => {
    const jobs = hookSlot("A dog sleeps in the house.", "in").suggestions.filter((s): s is JobSuggestion => s.kind === "job");
    assert.ok(jobs.some((j) => j.phrase === `al ${roleWord(hookSlot("A dog sleeps in the house.", "house"))}`));
  });

  it("does not spell a range or same-role row as a place phrase", () => {
    const jobs = hookSlot("Uzozen walks from the house to the station.", "to").suggestions.filter((s): s is JobSuggestion => s.kind === "job");
    assert.ok(jobs.some((j) => j.phrase?.startsWith("ol ")));
    assert.ok(!jobs.some((j) => j.link.endsWith("#ranges") && j.phrase));
  });

  it("reads both columns of the -l / -m grid as cues", () => {
    assert.ok(hookSlot("A cloth sits over the table.", "over").suggestions.some((s) => s.kind === "job" && s.form.startsWith("aom")));
    assert.ok(hookSlot("Olazun sits among the guards.", "among").suggestions.some((s) => s.kind === "job" && s.form.startsWith("am")));
  });

  it("keeps the role of the phrase before a same-role hook", () => {
    assert.match(roleWord(hookSlot("Uzozen drinks coffee instead of tea.", "tea"))!, /^d/);
    assert.equal(roleWord(hookSlot("The family walks, except Uzozen.", "Uzozen")), "zuzozen");
    assert.match(roleWord(hookSlot("Uzozen sees the dog, except the cat.", "cat"))!, /^d/);
    assert.ok(hookSlot("The family walks, except Uzozen.", "except").suggestions.some((s) => s.kind === "detector" && s.id === "same-role-hook"));
  });

  it("falls back to an extra-noun hook for a preposition no row names", () => {
    const atop = hookSlot("The dog sleeps atop the house.", "atop");
    assert.deepEqual(atop.suggestions.map((s) => s.kind === "detector" && s.id), ["extra-noun-hook"]);
  });

});

describe("could not", () => {
  it("lists both couldn't jobs for the modal and its negative", () => {
    const slot = slots("She could not swim.").find((s) => s.text === "could not")!;
    const links = slot.suggestions.filter((s): s is JobSuggestion => s.kind === "job").map((j) => j.form);
    assert.ok(links.some((f) => f.includes("helam")));
    assert.ok(links.some((f) => f.includes("howam")));
  });
});

describe("compounds", () => {
  const root = (english: string) => lookupLexicon(data.lexicon, [english]).find((s) => s.tier === "root")!.form;
  const listed = (slot: Slot) => slot.suggestions.filter((s): s is RootSuggestion => s.kind === "lexicon" && s.tier === "compound");

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
    assert.equal(live.link, "compound-families.md#ordinary-compound-order");
  });

  it("keeps an adjective and a noun as two words", () => {
    const dog = slots("A blue dog ran.").find((s) => s.text === "dog")!;
    assert.ok(!dog.suggestions.some((s) => s.kind === "live" || (s.kind === "lexicon" && s.fromParts)));
  });
});
