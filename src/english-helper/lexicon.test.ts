import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { parseCompoundCsv } from "../lexicon-compounds.js";
import { parseOverlayCsv, parsePublishedCsv } from "../lexicon-search.js";
import { buildLexiconIndex, lookupLexicon, rootsByForm, splitSenses } from "./lexicon.js";

const published = parsePublishedCsv(
  "emoji,concrete,root,kind,shape,size,abstract,mnemonic,english_by_pos,english_aliases,core\n" +
    "😀,grin,egevo,mind,one,,delight,m,v:smile,glad; joy,\n" +
    "🚶,walk,owoga,doing,order,,,m,,stroll,\n",
);
const compounds = parseCompoundCsv("stem,left,join,right,concrete,abstract,mnemonic,core\nowogalegevo,owoga,l,egevo,glad walk,,m,\n");
const overlays = parseOverlayCsv("sense_form,pos,emoji,kind,gloss,definition,mnemonic,anchor\nahum,th,🗳️,sake,autonomy,d,m,sakes.md#word-shape\n");
const index = buildLexiconIndex(published, compounds, overlays);

describe("splitSenses", () => {
  it("splits on ; , / and or", () => {
    assert.deepEqual(splitSenses("on / onto; upon or atop"), ["on", "onto", "upon", "atop"]);
  });
});

describe("buildLexiconIndex", () => {
  it("indexes senses with their side and english_by_pos roles", () => {
    assert.deepEqual(lookupLexicon(index, ["grin"]).map((s) => [s.tier, s.form, s.side]), [["root", "egevo", "concrete"]]);
    assert.deepEqual(lookupLexicon(index, ["delight"])[0]!.side, "abstract");
    assert.deepEqual(lookupLexicon(index, ["smile"])[0]!.roles, ["v"]);
  });

  it("keeps aliases, compounds and overlays in their own tiers", () => {
    assert.equal(lookupLexicon(index, ["glad"])[0]!.tier, "alias");
    assert.equal(lookupLexicon(index, ["glad walk"])[0]!.tier, "compound");
    assert.deepEqual(lookupLexicon(index, ["autonomy"]).map((s) => [s.tier, s.pos, s.anchor]), [["overlay", "th", "sakes.md#word-shape"]]);
  });

  it("ranks a root sense of any form above an alias of the lemma", () => {
    assert.deepEqual(lookupLexicon(index, ["stroll", "walk"]).map((s) => s.tier), ["root", "alias"]);
  });

  it("finds a name's root by form", () => {
    assert.equal(rootsByForm(index).get("owoga")!.sense, "walk");
  });
});
