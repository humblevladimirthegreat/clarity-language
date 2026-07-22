import assert from "node:assert/strict";

import { stripAllVariantSuffixes } from "./literal-normalizer.js";
import { clusterKey, familyConceptKey } from "./variant-cluster.js";

// stripAllVariantSuffixes
assert.equal(stripAllVariantSuffixes("person: light skin tone, blond hair"), "person");
assert.equal(stripAllVariantSuffixes("man: dark skin tone, bald"), "man");
assert.equal(stripAllVariantSuffixes("woman: medium skin tone, red hair"), "woman");

// family concept keys
assert.equal(familyConceptKey("kiss: woman, man, dark skin tone, light skin tone"), "kiss");
assert.equal(familyConceptKey("couple with heart: man, man"), "couple");
assert.equal(familyConceptKey("men holding hands: light skin tone"), "men-holding-hands");
assert.equal(familyConceptKey("woman and man holding hands"), "woman-and-man-holding-hands");
assert.equal(familyConceptKey("family: man, woman, boy"), "family");

// person cluster keys
assert.equal(
  clusterKey({ name: "person: light skin tone, blond hair", subgroup: "person" }),
  "person|person",
);
assert.equal(
  clusterKey({ name: "man: dark skin tone, beard", subgroup: "person" }),
  "person|man",
);

// person-sport multi-person
assert.equal(
  clusterKey({
    name: "people wrestling: light skin tone, medium skin tone",
    subgroup: "person-sport",
  }),
  "person-sport|wrestling",
);

console.log("variant-cluster tests passed");
