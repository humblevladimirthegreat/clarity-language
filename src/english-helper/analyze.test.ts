import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { analyzeEnglish, slotTier, type JobSuggestion, type RoleSuggestion, type RootSuggestion } from "./analyze.js";
import { loadHelperData } from "./load.js";

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
