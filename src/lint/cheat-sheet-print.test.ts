import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  findingsFor,
  fingerprint,
  pageIndexOf,
  pageStartsWith,
  PAGE_CONTENT_PX,
  type SheetLayout,
} from "./cheat-sheet-print.ts";

describe("fingerprint", () => {
  it("drops permalink junk and case", () => {
    assert.equal(fingerprint("Role letters ​"), fingerprint("role letters"));
  });
});

describe("pageStartsWith", () => {
  it("accepts the slice at the top of the page", () => {
    assert.equal(pageStartsWith("Consonants cheat sheet How consonants are reused", "Consonants cheat sheet"), true);
  });

  it("accepts the lead paragraph when the PDF skips the H1", () => {
    assert.equal(pageStartsWith("How consonants are reused. Sounds, names, and digit", "How consonants are reused"), true);
  });

  it("rejects a heading that only appears later", () => {
    assert.equal(
      pageStartsWith("Consonants cheat sheet Role letters Endings Root-tail kinds", "Root-tail kinds"),
      false,
    );
  });
});

describe("pageIndexOf", () => {
  it("finds a unique later-page heading", () => {
    const pages = ["consonants cheat sheet role letters", "root-tail kinds a root's last consonant"];
    assert.equal(pageIndexOf(pages, "Root-tail kinds"), 1);
  });
});

describe("findingsFor", () => {
  const base = (): SheetLayout => ({
    id: "consonants",
    slices: [
      {
        first: "Consonants cheat sheet",
        firsts: ["Consonants cheat sheet", "How consonants are reused"],
        last: "associates or a group",
        heading: "consonants-cheat-sheet",
        heightPx: 800,
      },
    ],
    tables: [
      {
        firstRow: "Letter Job Stage",
        lastRow: "x continue glue this sentence",
        heading: "role-letters",
        heightPx: 200,
      },
    ],
    pdfPages: [{ text: "Consonants cheat sheet How consonants Role letters Letter Job Stage associates or a group", leftoverPt: 120 }],
    pageContentPx: PAGE_CONTENT_PX,
  });

  it("is clean when one slice fills one PDF page", () => {
    assert.deepEqual(findingsFor(base()), []);
  });

  it("flags an extra PDF page with no marker", () => {
    const sheet = base();
    sheet.pdfPages.push({ text: "Root-tail kinds z creatures", leftoverPt: 400 });
    const kinds = findingsFor(sheet).map((f) => f.kind);
    assert.ok(kinds.includes("unexpected-break"));
  });

  it("flags a table whose rows land on two pages", () => {
    const sheet = base();
    sheet.slices = [
      { first: "Consonants cheat sheet", firsts: ["Consonants cheat sheet"], last: "Letter Job Stage", heading: "h1", heightPx: 900 },
      { first: "x continue", firsts: ["x continue"], last: "associates or a group", heading: "other-jobs", heightPx: 200 },
    ];
    sheet.pdfPages = [
      { text: "Consonants cheat sheet Letter Job Stage z subject", leftoverPt: 10 },
      { text: "x continue associates or a group", leftoverPt: 500 },
    ];
    sheet.tables = [
      {
        firstRow: "Letter Job Stage z subject",
        lastRow: "x continue associates",
        heading: "role-letters",
        heightPx: 400,
      },
    ];
    const kinds = findingsFor(sheet).map((f) => f.kind);
    assert.ok(kinds.includes("split-table") || kinds.includes("table-too-tall"));
  });
});
