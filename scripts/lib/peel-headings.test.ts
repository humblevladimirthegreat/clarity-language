import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { peelHeadings } from "./peel-headings.ts";

const PARENT = `---
band: intermediate
---

# Speech acts and tone marks {#speech-acts-and-tone-marks}

### Speech act: firm and soft {#speech-act}

Soft [tone](#tone-marks). Including *-r*.

#### For now (**-r**) {#act-r}

Provisional.

### Doubling an act word {#doubled-act}

Repeat.

### Tone marks {#tone-marks}

Marks on a [request](#speech-act).

### Practice {#intermediate-practice}

Drill.
`;

describe("peelHeadings", () => {
  const result = peelHeadings({
    parentPage: "speech-acts.md",
    parentMarkdown: PARENT,
    ids: ["speech-act"],
    newPage: "firm-soft.md",
    title: "Firm and soft",
    band: "beginner",
  });

  it("copies the H3 cluster, including nested H4s, onto a beginner sitting", () => {
    assert.match(result.sitting, /^---\nband: beginner\n---\n/);
    assert.match(result.sitting, /# Firm and soft \{#firm-and-soft\}/);
    assert.match(result.sitting, /### Speech act: firm and soft \{#speech-act\}/);
    assert.match(result.sitting, /#### For now \(\*\*-r\*\*\) \{#act-r\}/);
    assert.doesNotMatch(result.sitting, /### Tone marks/);
    assert.doesNotMatch(result.sitting, /### Practice/);
  });

  it("leaves the remaining H3s and the checkpoint on the parent", () => {
    assert.match(result.parent, /^---\nband: intermediate\n---\n/);
    assert.match(result.parent, /# Speech acts and tone marks \{#speech-acts-and-tone-marks\}/);
    assert.doesNotMatch(result.parent, /### Speech act: firm and soft/);
    assert.match(result.parent, /### Doubling an act word \{#doubled-act\}/);
    assert.match(result.parent, /### Tone marks \{#tone-marks\}/);
    assert.match(result.parent, /### Practice \{#intermediate-practice\}/);
  });

  it("rewrites same-page links that now cross files", () => {
    assert.match(result.sitting, /Soft \[tone\]\(speech-acts.md#tone-marks\)/);
    assert.match(result.parent, /Marks on a \[request\]\(firm-soft.md#speech-act\)/);
  });

  it("maps every moved id, including nested H4s", () => {
    assert.equal(result.linkMap.get("speech-acts.md#speech-act"), "firm-soft.md#speech-act");
    assert.equal(result.linkMap.get("speech-acts.md#act-r"), "firm-soft.md#act-r");
    assert.equal(result.linkMap.get("speech-acts.md#tone-marks"), undefined);
    assert.deepEqual(result.hashRedirects, []);
  });
});

describe("peelHeadings, non-contiguous H3s", () => {
  const md = `---
band: intermediate
---

# Numbers in use {#numbers-in-use}

### Digit-strings {#digit-strings}

Codes.

#### Fields {#code-fields}

Commas.

### Letter codes {#letter-codes}

Letters.

### Time {#time}

Clock, see [fields](#code-fields).

### Ranges {#ranges}

From-to.
`;

  const result = peelHeadings({
    parentPage: "numbers-applied.md",
    parentMarkdown: md,
    ids: ["digit-strings", "time"],
    newPage: "digit-strings.md",
    title: "Digits and time",
    band: "beginner",
  });

  it("moves the named clusters and leaves the in-between sitting", () => {
    assert.match(result.sitting, /### Digit-strings \{#digit-strings\}/);
    assert.match(result.sitting, /#### Fields \{#code-fields\}/);
    assert.match(result.sitting, /### Time \{#time\}/);
    assert.doesNotMatch(result.sitting, /### Letter codes/);
    assert.match(result.parent, /### Letter codes \{#letter-codes\}/);
    assert.match(result.parent, /### Ranges \{#ranges\}/);
    assert.doesNotMatch(result.parent, /### Digit-strings/);
    assert.doesNotMatch(result.parent, /### Time/);
    assert.match(result.sitting, /Clock, see \[fields\]\(#code-fields\)/);
  });

  it("does not eat characters off the heading that follows a cut", () => {
    assert.match(result.parent, /\n\n### Letter codes \{#letter-codes\}\n/);
  });
});
