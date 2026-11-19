import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";

import { fullGlossIndex } from "../game/build.js";
import { createClassifyTables } from "../parse/classify.js";
import { glossToAgeben } from "../parse/gloss-inverse.js";
import { readText } from "./read.js";
import { asMember, claimMemberLists, collective, compoundHeads, memberList, universalInstance } from "./steps.js";
import type { Reading, Term } from "./types.js";

const rootDir = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const tables = createClassifyTables(
  readFileSync(join(rootDir, "data", "lexicon-published.csv"), "utf8"),
  readFileSync(join(rootDir, "data", "lexicon-overlays.csv"), "utf8"),
  readFileSync(join(rootDir, "data", "lexicon-compounds.csv"), "utf8"),
);
const index = fullGlossIndex(tables);
const read = (gloss: string): Reading => readText(glossToAgeben(gloss, tables, index) + ".", tables)[0]!;
const role = (gloss: string, letter: "z" | "d"): Term => read(gloss).claim.roles[letter]!;
const rootOf = (gloss: string): string => {
  const term = role(`z-Azozon | d-${gloss} | v-see`, "d");
  assert.equal(term.kind, "thing");
  return (term as Extract<Term, { kind: "thing" }>).root;
};

describe("steps: widen", () => {
  it("compounds.md#two-roots-one-word: a dictionary compound's head is its right root, in turn; a plain root has none", () => {
    assert.deepEqual(compoundHeads(role("z-Azozon | d-doorbell | v-see", "d"), tables), [rootOf("bell")]);
    assert.ok(compoundHeads(role("z-Azozon | d-firehouse | v-see", "d"), tables).includes(rootOf("house")));
    assert.deepEqual(compoundHeads(role("z-Azozon | d-bell | v-see", "d"), tables), []);
  });

  it("compounds.md: an x compound's head is its last root; a tail suffix is no head", () => {
    const x = readText("zazozon duwedaxubudal vayebel.", tables)[0]!.claim.roles.d!;
    assert.deepEqual(compoundHeads(x, tables).slice(0, 1), [rootOf("butter")]);
    assert.ok(!compoundHeads(role("z-Azozon | d-bedroom | v-see", "d"), tables).includes(rootOf("house")));
  });
});

describe("steps: infer", () => {
  it("joins.md: an and-list with members is a member list; a lone name is not", () => {
    assert.ok(memberList(role("[z-Azozon | z-Alazun | z-and] | v-walk", "z")));
    assert.ok(!memberList(role("z-Azozon | v-walk", "z")));
  });

  it("collectives.md: a collective -x verb is collective, a plain verb is not", () => {
    assert.ok(collective(read("[z-Azozon | z-Alazun | z-and] | v-walk-x").claim));
    assert.ok(!collective(read("[z-Azozon | z-Alazun | z-and] | v-walk").claim));
  });

  it("list-structure.md#respectively: one list, paired lists in one group, unpaired lists none, collective none", () => {
    const one = read("[z-Azozon | z-Alazun | z-and] | v-walk");
    assert.deepEqual([...claimMemberLists(one.claim, one).entries()], [[one.claim.roles.z, undefined]]);
    const paired = read("[z-Azozon | z-Alazun | z-and] | [d-cat | d-dog | w-respectively | d-and] | v-see");
    const groups = claimMemberLists(paired.claim, paired);
    assert.equal(groups.size, 2);
    assert.ok(groups.get(paired.claim.roles.z!) !== undefined && groups.get(paired.claim.roles.z!) === groups.get(paired.claim.roles.d!));
    const unpaired = read("[z-Azozon | z-Alazun | z-and] | [d-cat | d-dog | d-and] | v-see");
    assert.equal(claimMemberLists(unpaired.claim, unpaired).size, 0);
    const together = read("[z-Azozon | z-Alazun | z-and] | v-walk-x");
    assert.equal(claimMemberLists(together.claim, together).size, 0);
  });

  it("list-structure.md#shared-after-the-join: a member takes the SHARED details after the join", () => {
    const list = role("[z-cat | z-dog | z-and | g-small] | v-sleep", "z");
    assert.ok(memberList(list));
    const shared = list.sharedDetails ?? [];
    assert.equal(shared.length, 1);
    const member = asMember(list.members[0]!, list);
    assert.ok("details" in member && member.details?.includes(shared[0]!));
    const bare = role("[z-cat | z-dog | z-and] | v-sleep", "z");
    assert.ok(memberList(bare));
    assert.equal(asMember(bare.members[0]!, bare), bare.members[0]);
  });

  it("universals-domains.md#universals-domains-generics: closed zual + kind gives an instance; open or with leftovers does not", () => {
    const instance = universalInstance(role("[z-everything | g-cat] | v-sleep", "z"));
    assert.ok(instance?.kind === "thing" && instance.root === rootOf("cat"));
    assert.equal(universalInstance(readText("zuam gogozel vezuvel.", tables)[0]!.claim.roles.z!), undefined);
    assert.equal(universalInstance(readText("zual gogozel zul vezuvel.", tables)[0]!.claim.roles.z!), undefined);
    assert.equal(universalInstance(role("z-Azozon | v-sleep", "z")), undefined);
  });

  it("universals-domains.md#universals-domains-generics: closed zul + kind (no K) gives the instance its denial covers", () => {
    const none = readText("zul gobozal vewobol.", tables)[0]!.claim.roles.z!;
    const instance = universalInstance(none, "u");
    assert.ok(instance?.kind === "thing" && instance.root === rootOf("penguin"));
    assert.equal(universalInstance(none), undefined);
    assert.equal(universalInstance(readText("zual gogozel vezuvel.", tables)[0]!.claim.roles.z!, "u"), undefined);
  });
});
