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
  { invalid: "zazawan vowogal em bamagon.", rejection: "genitiveHost", valid: "zazawan vowogal bazar em bamagon." },
  { invalid: "zazawan vowogal thoyem em bamagon.", rejection: "genitiveHost", valid: "zazawan zodogal em bamagon vowogal." },
  { invalid: "em bamagon vowogal.", rejection: "genitiveHost", valid: "zazawan vowogal." },
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
  { invalid: "zazawan xezol vowogal.", rejection: "linkerMidSentence", valid: "xezol zazawan vowogal." },
  { invalid: "zazawan vowogal xul.", rejection: "clauseSingleItem", valid: "zazawan vowogal vul." },
  { invalid: "zazawan vowogal xam zalahen varahal xam.", rejection: "clauseSingleItem", valid: "zazawan vowogal xam zalahen varahal." },
  { invalid: "zazawan wowogalx vowogal.", rejection: "pluralOnPos", valid: "zazawanx vowogal." },
  { invalid: "zazawan vowogal hamelx.", rejection: "pluralOnPos", valid: "zazawan vowogal hamel." },
  { invalid: "yanatham zazawan vowogal.", rejection: "sakeSlot", valid: "zebel ganathal." },
  { invalid: "zebeyom gulothemol.", rejection: "emotionTail", valid: "zebeyom gulothamol." },
  { invalid: "zebeyom gulothamon.", rejection: "emotionTail", valid: "zebeyom gulothamor." },
  { invalid: "zazawan wanegethal gamadam.", rejection: "labelScopeSlot", valid: "zazawan ganegethal." },
  { invalid: "zazawan gewezathal.", rejection: "labelScopeArrow", valid: "zazawan gewezathol bahazal." },
  { invalid: "zodogal vehahel gazavathol.", rejection: "landmarkLateralBound", valid: "zodogal vehahel gazavathol bahazal." },
  { invalid: "zual gagadulx.", rejection: "pluralKindAfterUniversal", valid: "zual gagadul." },
  { invalid: "zazawan vowogal oer.", rejection: "stackedHookResume", valid: "zrarel oer zraval." },
  { invalid: "zazawan zel h+2 vowogal.", rejection: "rankJoinNumberManner", valid: "zazawan zalahen zel h+ vowogal." },
  {
    invalid: "zazawan vowogal hodogom barl zalahen vezebal.",
    rejection: "standInHost",
    valid: "zazawan vowogal hezom barl zalahen vezebal.",
  },
  {
    invalid: "zazawan vowogal thezom barl zalahen vezebal.",
    rejection: "standInHost",
    valid: "zazawan vowogal hezom barl zalahen vezebal.",
  },
  {
    invalid: "thevem darl zazawan vehahel.",
    rejection: "standInHost",
    valid: "thevem barl zazawan vehahel.",
  },
  {
    invalid: "zazawan vowogal thevem burl zalahen vezebal.",
    rejection: "standInHostUndo",
    valid: "zazawan vowogal thoyem burl zalahen vezebal.",
  },
  {
    invalid: "zazawan vowogal thoyem hezom barl zalahen vezebal.",
    rejection: "poleStack",
    valid: "zazawan vowogal hezom thoyem barl zalahen vezebal.",
  },
  { invalid: "yol yael zazawan vowogal.", rejection: undefined, valid: "yol yael." },
  { invalid: "zazawan vowogal thodom barl zalahen vezebal.", rejection: "standInHost", valid: "zazawan vowogal thunem barl zalahen vezebal." },
  { invalid: "zazawan vowogal thewam barl zalahen vezebal.", rejection: "standInHost", valid: "zazawan vowogal thobam barl zalahen vezebal." },
  { invalid: "zazawan vowogal thunem burl zalahen vezebal.", rejection: "standInHost", valid: "zazawan vowogal thunel barl zalahen vezebal." },
  { invalid: "zazawan vowogal thevem thunem barl zalahen vezebal.", rejection: "poleStack", valid: "zazawan vowogal thunem thevem barl zalahen vezebal." },
  { invalid: "zazawan vowogal thevom brul barl zalahen vezebal.", rejection: "standInHost", valid: "zazawan vowogal thobal bral barl zalahen vezebal." },
  {
    invalid: "zazawan vowogal thevem hezom barl zalahen vezebal.",
    rejection: "poleStack",
    valid: "zazawan vowogal tholum thevem barl zalahen vezebal.",
  },
  { invalid: "zalahen dagadul.", rejection: "objectNeedsVerb", valid: "zodogal om babagul." },
  { invalid: "zadar vowogal.", rejection: "shortResumeUnbound", valid: "zadahur vowogal." },
  { invalid: "zazawan vowogal hadar.", rejection: "shortResumeUnbound", valid: "zazawan vowogal. zazar vehahel." },
  { invalid: "zazawan g=+3.", rejection: "numberResumeUnbound", valid: "zalahen g+3. zazawan g=+3." },
  { invalid: "zam zezedol zagadul.", rejection: "leftFence", valid: "zezedol zagadul zam." },
  { invalid: "^ ^ zazawan vowogal.", rejection: "emptyIsland", valid: "^ zazawan zalahen zam ^ vowogal." },
  { invalid: "^ zazawan ^ vowogal.", rejection: "islandBinder", valid: "^ zazawan zalahen zam ^ vowogal." },
  { invalid: "zazawan ^ hegewem dodogal vahahal ^.", rejection: "islandOneSlot", valid: "zazawan ^ hegewem dodogal ^ vahahal." },
  { invalid: "^ hegewem zazawan vowogal ^.", rejection: "islandOneSlot", valid: "^ hegewem zazawan ^ vowogal." },
  { invalid: "zazawan ^ hegewem hahegem ^ vowogal.", rejection: "islandSlotRole", valid: "zazawan ^ hegewem zodogal ^ vahahal." },
  { invalid: "zalahen ^ hegewem gugol ^ bazawan.", rejection: "islandSlotRole", valid: "zalahen ^ hegewem gugol bazawan ^." },
  { invalid: "zalahen gugol ^ bazawan balahen bal ^.", rejection: "islandSlotRole", valid: "zalahen gugol bazawan." },
  { invalid: "zazawan huhum vowogal.", rejection: "asOfIntroduceBound", valid: "zazawan huhum b_#22,7 vowogal." },
  { invalid: "zazawan huhur b_#22,7 vowogal.", rejection: "asOfResumeBound", valid: "zazawan huhur vowogal." },
  { invalid: "zazawan huhum brul vowogal.", rejection: "asOfOffset", valid: "zehodon thuhum brul thegathem vezebel." },
  { invalid: "zazawan zalahen zel wuhum brul gamadam.", rejection: "asOfOffset", valid: "zazawan zalahen zel wuhum b_#22,7 gamadam." },
  { invalid: "zazawan thevom brarel vowogal.", rejection: "channelOffsetSign", valid: "zazawan thevom bagazem grurel vowogal." },
  { invalid: "zazawan thodom brul vowogal.", rejection: "channelOffsetSign", valid: "zalahen thunem bagazem grazol vezebal." },
  { invalid: "zalahen thamam brul vowogal.", rejection: "channelOffsetSign", valid: "zalahen thamam bral vowogal." },
  { invalid: "zazawan vowogal habam bazazam grurel.", rejection: "poleOffsetWarrant", valid: "yel zehodon vaheham homam bazazam grawol." },
  { invalid: "zazawan vowogal homam bazazam grawol.", rejection: "poleOffsetWarrant", valid: "zazawan thamam vowogal homam bazazam grawol." },
  {
    invalid: "zalahen thamom huhum b_#22,7 huram b_#3 vedabal.",
    rejection: "asOfPerHost",
    valid: "zalahen thamom huhum b_#22,7 vedabal.",
  },
  {
    invalid: "zalahen thuhum b_#22,7 thuram b_#3 thovum vedabal.",
    rejection: "asOfPerHost",
    valid: "zalahen thuhum b_#22,7 thovum huhum b_#3 vedabal.",
  },
  { invalid: "zalahen thuhum thovum vedabal.", rejection: "asOfIntroduceBound", valid: "zalahen thuhum b_#22,7 thovum vedabal." },
  {
    invalid: "zazawan vahahal dagadul dodogal wazem dal.",
    rejection: "respectivePartner",
    valid: "zazawan zalahen zal vahahal dagadul dodogal wazem dal.",
  },
  {
    invalid: "zazawan zalahen zahaben zal vahahal dagadul dodogal wazem dal.",
    rejection: "respectivePartner",
    valid: "zazawan zalahen zahaben zal vahahal dagadul dodogal debedul wazem dal.",
  },
  { invalid: "zazawan vahahal wazem gezebul dagadul.", rejection: "joinDetail", valid: "zazawan vahahal gezebul dagadul." },
  {
    invalid: "zazawan zalahen zal vahahal dagadul dodogal welavam dal.",
    rejection: "joinDetail",
    valid: "zazawan zalahen zal vahahal dagadul dodogal dal.",
  },
  {
    invalid: "zazawan zalahen zal vahahal dagadul dodogal wazem dol.",
    rejection: "joinDetail",
    valid: "zazawan zalahen zal vahahal dagadul dodogal wazem dal.",
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
