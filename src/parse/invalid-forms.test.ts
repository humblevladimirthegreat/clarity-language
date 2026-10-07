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
  { invalid: "zazawan glubuhel.", rejection: "glNoNoun", valid: "glubuhel zazawan." },
  { invalid: "zazawan dedehal glubuhel vahahal.", rejection: "glNoNoun", valid: "zazawan glubuhel dedehal vahahal." },
  { invalid: "yel yol zazawan vowogal.", rejection: "forcePair", valid: "yal yol zazawan vowogal." },
  { invalid: "yal yal zazawan vowogal.", rejection: "forcePair", valid: "yal zazawan vowogal." },
  { invalid: "zazawan vowogal em bamun.", rejection: "genitiveHost", valid: "zazawan vowogal bazawar em bamun." },
  { invalid: "zazawan vowogal thoyem em bamun.", rejection: "genitiveHost", valid: "zazawan zodogal em bamun vowogal." },
  { invalid: "em bamun vowogal.", rejection: "genitiveHost", valid: "zazawan vowogal." },
  { invalid: "zazawan vowogal?", rejection: "sentenceEndMark", valid: "zazawan vowogal." },
  { invalid: "yel vahawal!", rejection: "sentenceEndMark", valid: "yel vahawal." },
  { invalid: "zazawan !!!vowogal.", rejection: "toneStack", valid: "zazawan !!vowogal." },
  { invalid: "zazawan ???vowogal.", rejection: "toneStack", valid: "zazawan ??vowogal." },
  { invalid: "! ! zazawan vowogal.", rejection: "toneStack", valid: "! zazawan vowogal." },
  { invalid: "! !zazawan vowogal.", rejection: "toneStack", valid: "! zazawan !vowogal." },
  { invalid: "zazawan vowogal ! .", rejection: "toneTarget", valid: "! zazawan vowogal." },
  { invalid: "zazawan vowogal !.", rejection: "toneTarget", valid: "zazawan !vowogal." },
  {
    invalid: "zazawan { hegewem zodogal geredal !} vahahal.",
    rejection: "toneTarget",
    valid: "zazawan !{ hegewem zodogal geredal } vahahal.",
  },
  { invalid: "zazawan xezom vowogal.", rejection: "linkerMidSentence", valid: "xezom zazawan vowogal." },
  // Topic words (pronouns.md#topic) sit where linkers do: at the start of a sentence, never after a join or a stand-in.
  { invalid: "zazawan xalahen zozan vowogal.", rejection: "linkerMidSentence", valid: "xalahen zazawan vowogal." },
  { invalid: "zazawan vezebel darl xalahen zozan vowogal.", rejection: "linkerMidSentence", valid: "xalahen zazawan vezebel darl zozan vowogal." },
  { invalid: "xodum.", rejection: undefined, valid: "xazawan." },
  { invalid: "xodumx zazawan vowogal.", rejection: "pluralOnPos", valid: "xazawanx zazawan vowogal." },
  { invalid: "zozan vowogal.", rejection: "topicUnbound", valid: "xazawan zozan vowogal." },
  { invalid: "xazawan zobenx vowogal.", rejection: "genericPlural", valid: "xazawan zoben vowogal." },
  { invalid: "zunanx vowogal.", rejection: "nonspecificPlural", valid: "zobelx vowogal." },
  { invalid: "xunan.", rejection: "topicNonspecific", valid: "xoben." },
  { invalid: "xazawan zozan vowogal. xozan zozan vehahel.", rejection: "topicOfTopic", valid: "xazawan zozan vowogal. xazawar zozan vehahel." },
  { invalid: "xazawan zozan vowogal. zozar vehahel.", rejection: "topicOfTopic", valid: "xazawan zozan vowogal. zozan vehahel." },
  { invalid: "zazawan zwal vowogal. ywar.", rejection: "tagSlot", valid: "zazawan zwal vowogal. yazawar." },
  { invalid: "zazawan zwal vowogal. xwar zalahen vahahal.", rejection: "tagSlot", valid: "zazawan zwal vowogal. xazawar zalahen vahahal." },
  { invalid: "zazawan zwal vowogal. vwal.", rejection: "tagSlot", valid: "zazawan zwal vowogal. zwar vowogal." },
  { invalid: "zazawan zwal vowogal. zwarl vowogal.", rejection: "tagEnding", valid: "zazawan zwal vowogal. zwan vowogal." },
  { invalid: "zodogal zwal vowogal. zwan vahahal.", rejection: "tagNameUnbound", valid: "zazawan zwal vowogal. zwan vahahal." },
  { invalid: "zodogalx zwalx vowogal.", rejection: "tagPlural", valid: "zodogalx zwal vowogal." },
  { invalid: "zamun zwal vowogal.", rejection: "tagPronoun", valid: "zazawan zwal vowogal." },
  { invalid: "xazawan zozan zwal vowogal.", rejection: "tagPronoun", valid: "xazawan zozan vowogal." },
  { invalid: "zunan zwal vowogal.", rejection: "tagPronoun", valid: "zwal vowogal." },
  { invalid: "zazawan zwal vowogal. zwar zwel varahal.", rejection: "tagPronoun", valid: "zazawan zwal vowogal. zaxar zwel varahal." },
  { invalid: "zodogal zagadul zam zwael vowogal.", rejection: "tagPairAssign", valid: "zodogal zwal zagadul zwel zam vowogal. zwaer varahal." },
  { invalid: "zazawan zwal vowogal. zwaer varahal.", rejection: "tagUnbound", valid: "zazawan zwal zalahen zwel zam vowogal. zwaer varahal." },
  { invalid: "zazawan zwal vowogal. dwamx vahahal.", rejection: "tagPlural", valid: "zazawan zwal vowogal. zwarx vahahal." },
  { invalid: "zazawan vowogal xul.", rejection: "clauseSingleItem", valid: "zazawan vowogal vul." },
  { invalid: "zazawan vowogal xam zalahen varahal xam.", rejection: "clauseSingleItem", valid: "zazawan vowogal xam zalahen varahal." },
  { invalid: "zazawan wowogalx vowogal.", rejection: "pluralOnPos", valid: "zazawanx vowogal." },
  { invalid: "zazawan vowogal hamelx.", rejection: "pluralOnPos", valid: "zazawan vowogal hamel." },
  { invalid: "yagadulx.", rejection: "pluralInterjection", valid: "yagadunx." },
  { invalid: "yanatham zazawan vowogal.", rejection: "sakeSlot", valid: "zebel ganathal." },
  { invalid: "zebeyom gulothemol.", rejection: "emotionTail", valid: "zebeyom gulothamol." },
  { invalid: "zebeyom gulothamon.", rejection: "emotionTail", valid: "zebeyom gulothamor." },
  { invalid: "zebel ganathan.", rejection: "sakeEnding", valid: "zebel ganathal." },
  { invalid: "zebel ganathanar.", rejection: "sakeEnding", valid: "zebel ganathamar." },
  { invalid: "zebel ganathel.", rejection: "prescriptionSlot", valid: "zebel ganathol." },
  { invalid: "zabezam wanathel gobum.", rejection: "prescriptionSlot", valid: "zalahen vabayal thanathel." },
  { invalid: "zabezam wanathumal gobum balahen.", rejection: "feelingLandmark", valid: "zabezam wanathumol gobum balahen." },
  { invalid: "zazawan wanegethal gamadam.", rejection: "labelScopeSlot", valid: "zazawan ganegethal." },
  { invalid: "zazawan gulothaol.", rejection: "sakeStackedVowel", valid: "zazawan gulothal." },
  { invalid: "zazawan gewezathal.", rejection: "labelScopeArrow", valid: "zazawan gewezathol bahazal." },
  { invalid: "zodogal vehahel gazavathol.", rejection: "landmarkLateralBound", valid: "zodogal vehahel gazavathol bahazal." },
  { invalid: "zual gagadulx.", rejection: "pluralKindAfterUniversal", valid: "zual gagadul." },
  { invalid: "zazawan vowogal oer.", rejection: "stackedHookResume", valid: "zrarel oer zraval." },
  { invalid: "aor zazawan vowogal.", rejection: "hookDiscourseStack", valid: "zazawan vowogal aor." },
  { invalid: "zavahal aol zazawan.", rejection: "hookSameRoleStack", valid: "zavahal am zazawan." },
  { invalid: "uel zalahen varahal.", rejection: "hookDiscourseStack", valid: "xagezal zalahen varahal." },
  { invalid: "zavahal ar zazawan.", rejection: "hookResumeNoun", valid: "zavahal al zazawan." },
  { invalid: "zazawan zel h+2 vowogal.", rejection: "rankJoinNumberManner", valid: "zazawan zalahen zel h+ vowogal." },
  { invalid: "zazawan vowogal th-3.", rejection: "stanceNumber", valid: "zazawan vowogal th+70." },
  { invalid: "zazawan vowogal th#-2.", rejection: "stanceNumber", valid: "zazawan vowogal th#2." },
  { invalid: "zazawan vowogal th#1.", rejection: "handDepth", valid: "zazawan vowogal thewam th#2." },
  { invalid: "zalahen thodom thredul vedabal.", rejection: "handDepthChannel", valid: "zalahen thewam thredul vedabal." },
  { invalid: "zalahen thevom thredul vedabal.", rejection: "handDepthChannel", valid: "zalahen thunem thredul vedabal." },
  { invalid: "zalahen therem vezebal.", rejection: "retiredChannelRoot", valid: "zalahen thewal bagahol vezebal." },
  { invalid: "zazawan thozem vowogal.", rejection: "retiredChannelRoot", valid: "zazawan thavom vowogal." },
  { invalid: "zodogal wrarel gelavam.", rejection: "degreeNumber", valid: "zodogal wrubul gelavam." },
  { invalid: "zodogal wredul gelavam.", rejection: "degreePlaceFrame", valid: "zazawan zel wredul gelavam." },
  { invalid: "zazawan zalahen zel wredul gelavam.", rejection: "degreePlaceFrame", valid: "zazawan zuel wredul gelavam." },
  { invalid: "zazawan thevem zel gezebul.", rejection: "barKind", valid: "zazawan thobam zel gezebul." },
  { invalid: "zazawan thezum zel gezebul.", rejection: "barKind", valid: "zazawan zel gezebul thezum." },
  { invalid: "zazawan thovum zel gezebul.", rejection: "barKind", valid: "zazawan thahom zel gezebul." },
  { invalid: "zazawan thehum zel gezebul.", rejection: "barKind", valid: "zazawan thohum zel gezebul." },
  { invalid: "zazawan thudum zel gezebul.", rejection: "barKind", valid: "zazawan thenom zel gezebul." },
  { invalid: "zedehel thedel zel gral.", rejection: "barKind", valid: "zedehel thegol zel gral." },
  { invalid: "zazawan zalahen thobam zel gezebul.", rejection: "barCount", valid: "zazawan zalahen zel gezebul." },
  { invalid: "zazawan thobam thevom zel gezebul.", rejection: "barCount", valid: "zazawan thobam zel gezebul thevom." },
  { invalid: "zazawan thevom bazazam grawol zel gezebul.", rejection: "channelOffsetSign", valid: "zazawan thevom bazazam gruwol zel gezebul." },
  { invalid: "zazawan thewam barl zel gezebul zalahen vezugel.", rejection: "standInHost", valid: "zazawan thunem barl zel gezebul zalahen vezugel." },
 { invalid: "zazawan vowogal varahal vaor.", rejection: "stackedJoinResume", valid: "zazawan vowogal varahal var." },
  { invalid: "zazawan vowogal xuar zalahen varahal.", rejection: "stackedJoinResume", valid: "zazawan vowogal xur zalahen varahal." },
  { invalid: "zebeval gaor bebeyal.", rejection: "stackedJoinResume", valid: "zebeval gar bebeyal." },
  { invalid: "yol zodogal zuar.", rejection: "stackedJoinResume", valid: "yol zodogal zur." },
  { invalid: "zebedal gazawaln.", rejection: "nameInstanceSlot", valid: "zebedal gazawan." },
  { invalid: "zalahen vazawaln.", rejection: "nameInstanceSlot", valid: "zalahen dazawaln vahahal." },
  { invalid: "zamuln vowogal.", rejection: "nameInstanceSlot", valid: "zamun vowogal." },
  { invalid: "y^@<Sam> zalahen vowogal.", rejection: "nameInstanceSlot", valid: "y@<Sam> zalahen vowogal." },
  { invalid: "zalahen g^@<iPhone> vahahal.", rejection: "nameInstanceSlot", valid: "zalahen dovavol g@<iPhone> vahahal." },
  { invalid: "zazawan vowogal harth.", rejection: "standInRole", valid: "zazawan vowogal henum barth." },
  { invalid: "zazawan gubuhel garn.", rejection: "standInRole", valid: "zazawan gubuhel." },
  { invalid: "zazawan vowogal tharl zalahen vehahel.", rejection: "standInRole", valid: "zazawan vowogal thevem barl zalahen vehahel." },
  { invalid: "zalahen vedabal gadadal.", rejection: "predicateAfterVerb", valid: "zalahen gadadal. zalahar vedabal." },
  { invalid: "vaxedehol.", rejection: "roleCompoundSlot", valid: "zaxedehol vowogal." },
  { invalid: "zalahen vowogal haxedehol.", rejection: "roleCompoundSlot", valid: "zalahen vowogal humum baxedehol." },
  { invalid: "yaxedehol.", rejection: "roleCompoundSlot", valid: "yaxedehon." },
  { invalid: "zaxamun vowogal.", rejection: "roleCompoundStem", valid: "zaxamul vowogal." },
  { invalid: "zalahen zamuthan.", rejection: "labelScopeStem", valid: "zalahen zamuthal." },
  { invalid: "zalahen zazawaxon vowogal.", rejection: "abilitySlot", valid: "azawaxon." },
  { invalid: "zodogaxal vowogal.", rejection: "abilitySlot", valid: "zalahen vowogaxal." },
  { invalid: "yael yal.", rejection: "polarOrder", valid: "yael." },
  { invalid: "yael yol zar vowogal.", rejection: "polarOrder", valid: "yael. yol zar vowogal." },
  { invalid: "yael yuel.", rejection: "polarOrder", valid: "yael." },
  { invalid: "zazawan d(zalahen vowogal) vezebel.", rejection: "spanSlot", valid: "zazawan vezebel th(zalahen vowogal)." },
  { invalid: "zazawan vowogal th[sic].", rejection: "spanSlot", valid: "zalahen v<google> dazawan." },
  { invalid: "zazawan w<very> gamazam.", rejection: "spanSlot", valid: "zazawan welavam gamazam." },
  { invalid: "x(hagawal) zozan vowogal.", rejection: "spanSlot", valid: "x@<Sam> zozan vowogal." },
  { invalid: "y(hagawal).", rejection: "ySpanType", valid: "y[azawan]." },
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
  { invalid: "zadar vowogal.", rejection: "resumeUnbound", valid: "zadahur vowogal." },
  { invalid: "zalahen vowogal. zalar vehahel.", rejection: "resumeUnbound", valid: "zalahen vowogal. zalaher vehahel." },
  { invalid: "zaxar vowogal.", rejection: "pointerUnbound", valid: "zazawan vowogal. zaxar vehahel." },
  { invalid: "zazawan vowogal. vaxar.", rejection: "pointerSlot", valid: "zazawan vowogal. zalahen vowogar." },
  { invalid: "zalahen vehahel hewezathaxar.", rejection: "pointerUnbound", valid: "zazawan vowogal. zalahen vehahel hewezathaxar." },
  { invalid: "zazawan vowogal. dexor vahahal.", rejection: "pointerOtherRole", valid: "zazawan vowogal. dexar vahahal." },
  { invalid: "zazawan dalahen vabahel. zaxem genehem.", rejection: "pointerShareSelf", valid: "zazawan dalahen vabahel. zaxam genehem." },
  { invalid: "zazawan dalahen vabahel. zaxamx genehem.", rejection: "pointerSharePlural", valid: "zazawan dalahen vabahel. zaxam genehem." },
  { invalid: "dugugol vahahal. zaxul varahal.", rejection: "pointerNewUnsaid", valid: "dugugol vahahal. zaxur varahal." },
  { invalid: "zamun vowogal. zaxal vehahel.", rejection: "pointerNewSpecial", valid: "zamun vowogal. zaxar vehahel." },
  { invalid: "zaxer vowogal.", rejection: "pointerOwnSlot", valid: "zazawan vahahal daxer." },
  { invalid: "zazawan g=+3.", rejection: "numberResumeUnbound", valid: "zalahen g+3. zazawan g=+3." },
  { invalid: "zazawan vowogal. zwar vezebal.", rejection: "tagUnbound", valid: "zazawan zwal vowogal. zwar vezebal." },
  { invalid: "zazawan zwal vowogal. zwer vezebal.", rejection: "tagUnbound", valid: "zazawan zwel vowogal. zwer vezebal." },
  { invalid: "azawan. alahen. zazawan zwal vowogal. azawan. alahen. zwar vowogal.", rejection: "tagUnbound", valid: "azawan. alahen. zazawan zwal vowogal. zwar vowogal." },
  { invalid: "zazawan vowogal. z=#1x vezebal.", rejection: "numberPlural", valid: "zazawan vowogal. z_90x vezebal." },
  { invalid: "z+90x.", rejection: "numberPlural", valid: "zazawan vowogal huwem b_90x." },
  { invalid: "zam zezedol zagadul.", rejection: "leftFence", valid: "zezedol zagadul zam." },
  { invalid: "{ } zazawan vowogal.", rejection: "emptyIsland", valid: "{ zazawan zalahen zam } vowogal." },
  { invalid: "{ zazawan } vowogal.", rejection: "islandBinder", valid: "{ zazawan zalahen zam } vowogal." },
  { invalid: "zazawan { hegewem dodogal vahahal }.", rejection: "islandOneSlot", valid: "zazawan { hegewem dodogal } vahahal." },
  { invalid: "{ hegewem zazawan vowogal }.", rejection: "islandOneSlot", valid: "{ hegewem zazawan } vowogal." },
  { invalid: "zazawan { hegewem hahegem } vowogal.", rejection: "islandSlotRole", valid: "zazawan { hegewem zodogal } vahahal." },
  { invalid: "zalahen { hegewem gugol } bazawan.", rejection: "islandSlotRole", valid: "zalahen { hegewem gugol bazawan }." },
  { invalid: "zalahen gugol { bazawan balahen bal }.", rejection: "islandSlotRole", valid: "zalahen gugol bazawan." },
  { invalid: "zazawan huhum vowogal.", rejection: "asOfIntroduceBound", valid: "zazawan huhum b_#22,7 vowogal." },
  { invalid: "zazawan huhur b_#22,7 vowogal.", rejection: "asOfResumeBound", valid: "zazawan huhur vowogal." },
  { invalid: "zazawan huhum brul vowogal.", rejection: "asOfOffset", valid: "zehon thuhum brul thegathem vezebel." },
  { invalid: "zazawan zalahen zel wuhum brul gamadam.", rejection: "asOfOffset", valid: "zazawan zalahen zel wuhum b_#22,7 gamadam." },
  { invalid: "zazawan thevom brarel vowogal.", rejection: "channelOffsetSign", valid: "zazawan thevom bagazem grurel vowogal." },
  { invalid: "zazawan thodom brul vowogal.", rejection: "channelOffsetSign", valid: "zalahen thunem bagazem grazol vezebal." },
  { invalid: "zalahen thamam brul vowogal.", rejection: "channelOffsetSign", valid: "zalahen thamam bral vowogal." },
  { invalid: "zazawan vowogal habam bazazam grurel.", rejection: "poleOffsetWarrant", valid: "yel zehon vaheham homam bazazam grawol." },
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
  {
    invalid: "zazawan zalahen zahaben zal gelavam gamazam wazem gal.",
    rejection: "respectivePartner",
    valid: "zazawan zalahen zal gelavam gamazam wazem gal.",
  },
  {
    invalid: "zazawan zalahen zal vowogal varahal wazem vol.",
    rejection: "joinDetail",
    valid: "zazawan zalahen zal vowogal varahal wazem val.",
  },
  { invalid: "zazawan zalahen zal gelavam wazem gal.", rejection: "joinDetail", valid: "zazawan zalahen zal gelavam gal." },
  {
    invalid: "zazawan zalahen zal dagadul dodogal wazem dar vahahal.",
    rejection: "joinDetail",
    valid: "zazawan zalahen zal dagadul dodogal wazem dam vahahal.",
  },
  {
    invalid: "zazawan zalahen zal dagadul dodogal wazem dan vahahal.",
    rejection: "joinDetail",
    valid: "zazawan zalahen zal dagadul dodogal wazem dal vahahal.",
  },
  // `uem` + a stance: the stance must say what the event goes against (sakes.md#contrary-to-stance).
  { invalid: "zazawan vowogal uem thegom.", rejection: "frameKind", valid: "zazawan vowogal uem thedem." },
  { invalid: "zazawan vezebel uem thuxegom balahen.", rejection: "frameKind", valid: "zazawan vezebel uem thuxedem balahen." },
  { invalid: "zazawan vowogal uem thanatham.", rejection: "frameKind", valid: "zazawan vowogal thanathum balahen." },
  { invalid: "zazawan vowogal uem thezum.", rejection: "frameKind", valid: "zazawan vowogal uem thahom." },
  { invalid: "zazawan vowogal uem thovum.", rejection: "frameKind", valid: "zazawan vowogal uem thamam." },
  { invalid: "zazawan vowogal uem thobam barl zalahen vezebal.", rejection: "standInHost", valid: "zazawan vowogal thobam barl zalahen vezebal." },
  // An in-clause hook pairs two phrases in the same clause role (hooks.md#including-am-al).
  { invalid: "zazawan al vowogal.", rejection: "hookSameRole", valid: "zavahal al zazawan vowogal." },
  { invalid: "zazawan vowogal al hevegem.", rejection: "hookSameRole", valid: "zazawan vowogal uem thevegem." },
  // Only `ul` takes `barl` (hooks.md#since); *contrary to* an event is `hezom barl`.
  { invalid: "zazawan vowogal uem barl zalahen vezebal.", rejection: "hookStandIn", valid: "zazawan vowogal hezom barl zalahen vezebal." },
  { invalid: "zazawan vowogal el barl zalahen vezebal.", rejection: "hookStandIn", valid: "zazawan vowogal ul barl zalahen vezebal." },
  // The sentence after `barl` needs more than a stance word (dependents.md#dependent-clauses).
  { invalid: "zazawan vowogal hezom barl thedel.", rejection: "dependentStanceOnly", valid: "zazawan vowogal uem thedel." },
  { invalid: "zazawan vowogal hezom barl thedel thewam.", rejection: "dependentStanceOnly", valid: "zazawan vowogal hezom barl thulothuruor." },
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
