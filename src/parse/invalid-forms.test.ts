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
  { invalid: "yel yol zazawan vowogal.", rejection: "forcePair", valid: "yal yol zazawan vowogal." },
  { invalid: "yal yal zazawan vowogal.", rejection: "forcePair", valid: "yal zazawan vowogal." },
  { invalid: "zazawan vowogal em bamegun.", rejection: "genitiveHost", valid: "zazawan vowogal bazar em bamegun." },
  { invalid: "zazawan vowogal thodom em bamegun.", rejection: "genitiveHost", valid: "zazawan zodogal em bamegun vowogal." },
  { invalid: "em bamegun vowogal.", rejection: "genitiveHost", valid: "zazawan vowogal." },
  { invalid: "zazawan vowogal?", rejection: "sentenceEndMark", valid: "zazawan vowogal." },
  { invalid: "yel vahawal!", rejection: "sentenceEndMark", valid: "yel vahawal." },
  { invalid: "zazawan !?vowogal.", rejection: "toneStack", valid: "zazawan ?!vowogal." },
  { invalid: "zazawan ??vowogal.", rejection: "toneStack", valid: "zazawan !!vowogal." },
  { invalid: "! ! zazawan vowogal.", rejection: "toneStack", valid: "! zazawan vowogal." },
  { invalid: "! !zazawan vowogal.", rejection: "toneStack", valid: "! zazawan !vowogal." },
  { invalid: "zazawan vowogal ! .", rejection: "toneTarget", valid: "! zazawan vowogal." },
  { invalid: "zazawan vowogal !.", rejection: "toneTarget", valid: "zazawan !vowogal." },
  {
    invalid: "zazawan ^ hegewem zodogal geredal !^ vahahal.",
    rejection: "toneTarget",
    valid: "zazawan !^ hegewem zodogal geredal ^ vahahal.",
  },
  { invalid: "zazawan xazel vowogal.", rejection: "linkerMidSentence", valid: "xazel zazawan vowogal." },
  { invalid: "zazawan vowogal xul.", rejection: "clauseSingleItem", valid: "zazawan vowogal vul." },
  { invalid: "zazawan vowogal xam zalahen varahal xam.", rejection: "clauseSingleItem", valid: "zazawan vowogal xam zalahen varahal." },
  { invalid: "zazawan wowogalx vowogal.", rejection: "pluralOnPos", valid: "zazawanx vowogal." },
  { invalid: "zazawan vowogal hagabulx.", rejection: "pluralOnPos", valid: "zazawan vowogal hagabul." },
  { invalid: "yonatham zazawan vowogal.", rejection: "sakeSlot", valid: "zebezol gonathal." },
  { invalid: "zebeyum guduthemol.", rejection: "emotionTail", valid: "zebeyum guduthamol." },
  { invalid: "zebeyum guduthamon.", rejection: "emotionTail", valid: "zebeyum guduthamor." },
  { invalid: "zazawan wanegethal gamadam.", rejection: "labelScopeSlot", valid: "zazawan ganegethal." },
  { invalid: "zazawan gewezathal.", rejection: "labelScopeArrow", valid: "zazawan gewezathol bahazal." },
  { invalid: "zodogal vehahel gazavathol.", rejection: "landmarkLateralBound", valid: "zodogal vehahel gazavathol bahazal." },
  { invalid: "zual gagadalx.", rejection: "pluralKindAfterUniversal", valid: "zual gagadal." },
  { invalid: "zazawan vowogal oer.", rejection: "stackedHookResume", valid: "zrarel oer zraval." },
  { invalid: "zazawan zel h+2 vowogal.", rejection: "rankJoinNumberManner", valid: "zazawan zalahen zel h+ vowogal." },
  {
    invalid: "zazawan vowogal hodogom barl zalahen vezebal.",
    rejection: "standInHost",
    valid: "zazawan vowogal hazem barl zalahen vezebal.",
  },
  {
    invalid: "zazawan vowogal thazem barl zalahen vezebal.",
    rejection: "standInHost",
    valid: "zazawan vowogal hazem barl zalahen vezebal.",
  },
  {
    invalid: "theram darl zazawan vehahel.",
    rejection: "standInHost",
    valid: "theram barl zazawan vehahel.",
  },
  {
    invalid: "zazawan vowogal theram burl zalahen vezebal.",
    rejection: "standInHostUndo",
    valid: "zazawan vowogal thodom burl zalahen vezebal.",
  },
  {
    invalid: "zazawan vowogal thodom hazem barl zalahen vezebal.",
    rejection: "poleStack",
    valid: "zazawan vowogal hazem thodom barl zalahen vezebal.",
  },
  { invalid: "yol yael zazawan vowogal.", rejection: undefined, valid: "yol yael." },
  { invalid: "zazawan vowogal thodum barl zalahen vezebal.", rejection: "standInHost", valid: "zazawan vowogal thevem barl zalahen vezebal." },
  { invalid: "zazawan vowogal themam barl zalahen vezebal.", rejection: "standInHost", valid: "zazawan vowogal thabem barl zalahen vezebal." },
  { invalid: "zazawan vowogal thevem burl zalahen vezebal.", rejection: "standInHost", valid: "zazawan vowogal thevel barl zalahen vezebal." },
  { invalid: "zazawan vowogal theram thevem barl zalahen vezebal.", rejection: "poleStack", valid: "zazawan vowogal thevem theram barl zalahen vezebal." },
  { invalid: "zazawan vowogal thunom bral barl zalahen vezebal.", rejection: "standInHost", valid: "zazawan vowogal thabel bral barl zalahen vezebal." },
  {
    invalid: "zazawan vowogal theram hazem barl zalahen vezebal.",
    rejection: "poleStack",
    valid: "zazawan vowogal thebom theram barl zalahen vezebal.",
  },
  { invalid: "zalahen dagadal.", rejection: "objectNeedsVerb", valid: "zodogal om babagul." },
  { invalid: "zagar vowogal.", rejection: "shortResumeUnbound", valid: "zagadar vowogal." },
  { invalid: "zazawan vowogal hagar.", rejection: "shortResumeUnbound", valid: "zazawan vowogal. zazar vehahel." },
  { invalid: "zazawan g=+3.", rejection: "numberResumeUnbound", valid: "zalahen g+3. zazawan g=+3." },
  { invalid: "zam zezadel zagadal.", rejection: "leftFence", valid: "zezadel zagadal zam." },
  { invalid: "^ ^ zazawan vowogal.", rejection: "emptyIsland", valid: "^ zazawan zalahen zam ^ vowogal." },
  { invalid: "^ zazawan ^ vowogal.", rejection: "islandBinder", valid: "^ zazawan zalahen zam ^ vowogal." },
  { invalid: "zazawan ^ hegewem dodogal vahahal ^.", rejection: "islandOneSlot", valid: "zazawan ^ hegewem dodogal ^ vahahal." },
  { invalid: "^ hegewem zazawan vowogal ^.", rejection: "islandOneSlot", valid: "^ hegewem zazawan ^ vowogal." },
  { invalid: "zazawan ^ hegewem hahegem ^ vowogal.", rejection: "islandSlotRole", valid: "zazawan ^ hegewem zodogal ^ vahahal." },
  { invalid: "zalahen ^ hegewem gogal ^ bazawan.", rejection: "islandSlotRole", valid: "zalahen ^ hegewem gogal bazawan ^." },
  { invalid: "zalahen gogal ^ bazawan balahen bal ^.", rejection: "islandSlotRole", valid: "zalahen gogal bazawan." },
  { invalid: "zazawan henem vowogal.", rejection: "asOfIntroduceBound", valid: "zazawan henem b_#22,7 vowogal." },
  { invalid: "zazawan hener b_#22,7 vowogal.", rejection: "asOfResumeBound", valid: "zazawan hener vowogal." },
  {
    invalid: "zalahen thamom henem b_#22,7 humem b_#3 vadebal.",
    rejection: "asOfPerHost",
    valid: "zalahen thamom henem b_#22,7 vadebal.",
  },
  {
    invalid: "zalahen thenem b_#22,7 thumem b_#3 thovom vadebal.",
    rejection: "asOfPerHost",
    valid: "zalahen thenem b_#22,7 thovom henem b_#3 vadebal.",
  },
  { invalid: "zalahen thenem thovom vadebal.", rejection: "asOfIntroduceBound", valid: "zalahen thenem b_#22,7 thovom vadebal." },
  {
    invalid: "zazawan vahahal dagadal dodogal wazagum dal.",
    rejection: "respectivePartner",
    valid: "zazawan zalahen zal vahahal dagadal dodogal wazagum dal.",
  },
  {
    invalid: "zazawan zalahen zahaben zal vahahal dagadal dodogal wazagum dal.",
    rejection: "respectivePartner",
    valid: "zazawan zalahen zahaben zal vahahal dagadal dodogal debedul wazagum dal.",
  },
  { invalid: "zazawan vahahal wazagum gezebul dagadal.", rejection: "joinDetail", valid: "zazawan vahahal gezebul dagadal." },
  {
    invalid: "zazawan zalahen zal vahahal dagadal dodogal welavam dal.",
    rejection: "joinDetail",
    valid: "zazawan zalahen zal vahahal dagadal dodogal dal.",
  },
  {
    invalid: "zazawan zalahen zal vahahal dagadal dodogal wazagum dol.",
    rejection: "joinDetail",
    valid: "zazawan zalahen zal vahahal dagadal dodogal wazagum dal.",
  },
  // A second turn starts only after a period; only the legal force pairs stack.
  { invalid: "yol yol vezevul.", rejection: "forcePair", valid: "yol. yol vezevul." },
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
