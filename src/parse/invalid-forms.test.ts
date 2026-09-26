/**
 * Rejection tests (docs/proposals/parser-strictness.md § Negative tests).
 *
 * Each row: an input the parser must refuse, the rule that refuses it, and a
 * valid neighbor that must still parse. Rows with `rejection: undefined` are
 * refused by the sentence grammar itself (the production no longer exists).
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";

import { createClassifyTables } from "./classify.js";
import type { RejectionId } from "./constructions.js";
import { ConstructionError } from "./enforce.js";
import { parse } from "./index.js";

const rootDir = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const tables = createClassifyTables(
  readFileSync(join(rootDir, "data", "lexicon-published.csv"), "utf8"),
  readFileSync(join(rootDir, "data", "lexicon-overlays.csv"), "utf8"),
  readFileSync(join(rootDir, "data", "lexicon-compounds.csv"), "utf8"),
);

type Row = { invalid: string; rejection: RejectionId | undefined; valid: string };

const ROWS: Row[] = [
  { invalid: "zazawan vawalal?", rejection: "sentenceEndMark", valid: "zazawan vawalal." },
  { invalid: "jel vuzunel!", rejection: "sentenceEndMark", valid: "jel vuzunel." },
  { invalid: "zazawan !?vawalal.", rejection: "toneStack", valid: "zazawan ?!vawalal." },
  { invalid: "zazawan ??vawalal.", rejection: "toneStack", valid: "zazawan !!vawalal." },
  { invalid: "! ! zazawan vawalal.", rejection: "toneStack", valid: "! zazawan vawalal." },
  { invalid: "! !zazawan vawalal.", rejection: "toneStack", valid: "! zazawan !vawalal." },
  { invalid: "zazawan vawalal ! .", rejection: "toneTarget", valid: "! zazawan vawalal." },
  { invalid: "zazawan vawalal !.", rejection: "toneTarget", valid: "zazawan !vawalal." },
  {
    invalid: "zazawan ^ huzurem zodogol garedel !^ vejel.",
    rejection: "toneTarget",
    valid: "zazawan !^ huzurem zodogol garedel ^ vejel.",
  },
  { invalid: "zazawan xezebal vawalal.", rejection: "linkerMidSentence", valid: "xezebal zazawan vawalal." },
  { invalid: "zazawan wawalalx vawalal.", rejection: "pluralOnPos", valid: "zazawanx vawalal." },
  { invalid: "zazawan vawalal hogomolx.", rejection: "pluralOnPos", valid: "zazawan vawalal hogomol." },
  { invalid: "jonogotham zazawan vawalal.", rejection: "valueSlot", valid: "zawaral gonogothal." },
  { invalid: "zawaral gabenethal.", rejection: "valueRoot", valid: "zawaral gonogothal." },
  { invalid: "zual gagadalx.", rejection: "pluralKindAfterUniversal", valid: "zual gagadal." },
  { invalid: "zazawan zel h+ vawalal.", rejection: "rankJoinNumberManner", valid: "zululon zel hohogem vawalal." },
  {
    invalid: "zazawan vawalal hezazam barl zululon velebel.",
    rejection: "standInHost",
    valid: "zazawan vawalal hezebam barl zululon velebel.",
  },
  {
    invalid: "zazawan vawalal thezebam barl zululon velebel.",
    rejection: "standInHost",
    valid: "zazawan vawalal hezebam barl zululon velebel.",
  },
  {
    invalid: "thurugum darl zazawan vajul.",
    rejection: "standInHost",
    valid: "thurugum barl zazawan vajul.",
  },
  {
    invalid: "zazawan vawalal thurugum burl zululon velebel.",
    rejection: "standInHostUndo",
    valid: "zazawan vawalal thadorom burl zululon velebel.",
  },
  {
    invalid: "zazawan vawalal thadorom hezebam barl zululon velebel.",
    rejection: "poleStack",
    valid: "zazawan vawalal hezebam thadorom barl zululon velebel.",
  },
  { invalid: "jol jael zazawan vawalal.", rejection: undefined, valid: "jol jael." },
  {
    invalid: "zazawan vawalal thurugum hezebam barl zululon velebel.",
    rejection: "poleStack",
    valid: "zazawan vawalal theberom thurugum barl zululon velebel.",
  },
  { invalid: "zululon dagadal.", rejection: "objectNeedsVerb", valid: "zodogol om banabal." },
  { invalid: "zodor vawalal.", rejection: "shortResumeUnbound", valid: "zodogor vawalal." },
  { invalid: "zazawan vawalal hogor.", rejection: "shortResumeUnbound", valid: "zazawan vawalal. zazar vajul." },
  { invalid: "zazawan g+r.", rejection: "numberResumeUnbound", valid: "zululon g+. zazawan g+r." },
  { invalid: "zam zadagal zagadal.", rejection: "leftFence", valid: "zadagal zagadal zam." },
  { invalid: "^ ^ zazawan vawalal.", rejection: "emptyIsland", valid: "^ zazawan zululon zam ^ vawalal." },
  { invalid: "^ zazawan ^ vawalal.", rejection: "islandBinder", valid: "^ zazawan zululon zam ^ vawalal." },
  { invalid: "zazawan helerem vawalal.", rejection: "asOfIntroduceBound", valid: "zazawan helerem b_#22,7 vawalal." },
  { invalid: "zazawan helerer b_#22,7 vawalal.", rejection: "asOfResumeBound", valid: "zazawan helerer vawalal." },
  {
    invalid: "zululon thonenom helerem b_#22,7 hobomam b_#3 vebarul.",
    rejection: "asOfPerHost",
    valid: "zululon thonenom helerem b_#22,7 vebarul.",
  },
  // Grammar-level: a second turn starts only after a period.
  { invalid: "jol jol vazanal.", rejection: undefined, valid: "jol. jol vazanal." },
];

describe("invalid forms", () => {
  for (const row of ROWS) {
    it(`rejects ${row.invalid}`, () => {
      assert.throws(
        () => parse(row.invalid, tables),
        (error: unknown) =>
          row.rejection === undefined
            ? !(error instanceof ConstructionError)
            : error instanceof ConstructionError && error.rejection === row.rejection,
      );
      assert.doesNotThrow(() => parse(row.valid, tables), row.valid);
    });
  }
});
