/**
 * Family profiles: the derived pair table equals the hand-written table it replaced (frozen below as it stood before
 * the profiles, with the rows a decision changed since: `force` × `contrary` (contrary-to.md#contrary-to-stance) and the
 * channel's cases (evidentiality.md#evidence-clause), and the seam word over a sake word (holder.md#what-the-holder-covers)), case by case and anchor by anchor, and `explainPair` names the
 * rule that decided a pair.
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { derivePairRows, EXCEPTIONS, explainPair, type PairRow } from "./scope-profiles.js";

/** The pair table before the profiles, one row per pair. */
const FROZEN: readonly PairRow[] = [
  {"pair":["force","say"],"kind":"rule","cases":[{"order":"over","over":"force","anchors":["speech-moves.md#speech-act-statement-question-command"]}]},
  {"pair":["force","sake"],"kind":"rule","cases":[{"order":"over","over":"sake","anchors":["for-a-sake.md#whose-stake"]}]},
  {"pair":["force","attitude"],"kind":"rule","cases":[{"order":"over","over":"attitude","anchors":["feelings.md#speaker-attitude"]}]},
  {"pair":["force","binder"],"kind":"rule","cases":[{"order":"over","over":"force","anchors":["speech-moves.md#speech-act-statement-question-command"]}]},
  {"pair":["force","hinge"],"kind":"rule","cases":[{"order":"over","over":"force","anchors":["causation.md#if"]}]},
  {"pair":["force","stance"],"kind":"rule","cases":[{"order":"over","over":"force","anchors":["want-and-decide.md#whose-intention"]}]},
  {"pair":["force","holder"],"kind":"rule","cases":[{"order":"over","over":"force","anchors":["holder.md#what-the-holder-covers"]}]},
  {"pair":["force","intention"],"kind":"rule","cases":[{"order":"over","over":"force","anchors":["want-and-decide.md#whose-intention"]}]},
  {"pair":["force","ability"],"kind":"rule","cases":[{"order":"over","over":"force","anchors":["speech-moves.md#speech-act-statement-question-command"]}]},
  {"pair":["force","phase"],"kind":"rule","cases":[{"order":"over","over":"force","anchors":["speech-moves.md#speech-act-statement-question-command"]}]},
  {"pair":["force","residue"],"kind":"rule","cases":[{"order":"over","over":"force","anchors":["speech-moves.md#speech-act-statement-question-command"]}]},
  {"pair":["force","notional"],"kind":"rule","cases":[{"order":"over","over":"force","anchors":["speech-moves.md#speech-act-statement-question-command"]}]},
  {"pair":["force","mirative"],"kind":"rule","cases":[{"order":"over","over":"mirative","anchors":["mirative.md#mirative"]}]},
  {"pair":["force","contrary"],"kind":"rule","cases":[{"order":"over","over":"contrary","anchors":["contrary-to.md#contrary-to-stance"]}]},
  {"pair":["force","occasion"],"kind":"rule","cases":[{"order":"over","over":"force","anchors":["speech-moves.md#speech-act-statement-question-command"]}]},
  {"pair":["say","sake"],"kind":"rule","cases":[{"order":"textOrder","anchors":["clause.md#which-covers-which"]}]},
  {"pair":["say","attitude"],"kind":"rule","cases":[{"order":"textOrder","anchors":["clause.md#which-covers-which"]}]},
  {"pair":["say","binder"],"kind":"rule","cases":[{"order":"textOrder","anchors":["clause.md#which-covers-which"]}]},
  {"pair":["say","hinge"],"kind":"rule","cases":[{"order":"textOrder","anchors":["clause.md#which-covers-which","dependents.md#hinges","stand-in-vowels.md#stand-in-back"]}]},
  {"pair":["say","stance"],"kind":"rule","cases":[{"order":"textOrder","anchors":["clause.md#which-covers-which"]}]},
  {"pair":["say","holder"],"kind":"rule","cases":[{"order":"over","over":"holder","anchors":["holder.md#what-the-holder-covers"]}]},
  {"pair":["say","intention"],"kind":"rule","cases":[{"order":"textOrder","anchors":["clause.md#which-covers-which"]}]},
  {"pair":["say","ability"],"kind":"rule","cases":[{"order":"textOrder","anchors":["clause.md#which-covers-which"]}]},
  {"pair":["say","phase"],"kind":"rule","cases":[{"order":"textOrder","anchors":["clause.md#which-covers-which"]}]},
  {"pair":["say","residue"],"kind":"rule","cases":[{"order":"textOrder","anchors":["clause.md#which-covers-which"]}]},
  {"pair":["say","notional"],"kind":"rule","cases":[{"order":"textOrder","anchors":["clause.md#which-covers-which"]}]},
  {"pair":["say","mirative"],"kind":"rule","cases":[{"order":"textOrder","anchors":["clause.md#which-covers-which"]}]},
  {"pair":["say","contrary"],"kind":"rule","cases":[{"order":"textOrder","anchors":["clause.md#which-covers-which"]}]},
  {"pair":["say","occasion"],"kind":"rule","cases":[{"order":"textOrder","anchors":["clause.md#which-covers-which"]}]},
  {"pair":["sake","attitude"],"kind":"commutes","cases":[{"order":"commutes","anchors":["mirative.md#mirative","feelings.md#speaker-attitude","for-a-sake.md#whose-stake","contrary-to.md#contrary-to-stance"]}]},
  {"pair":["sake","binder"],"kind":"rule","cases":[{"order":"textOrder","anchors":["clause.md#which-covers-which"]}]},
  {"pair":["sake","hinge"],"kind":"rule","cases":[{"order":"textOrder","anchors":["clause.md#which-covers-which","dependents.md#hinges","stand-in-vowels.md#stand-in-back"]}]},
  {"pair":["sake","stance"],"kind":"rule","cases":[{"order":"over","over":"stance","anchors":["holder.md#what-the-holder-covers"],"seam":true},{"order":"textOrder","anchors":["clause.md#which-covers-which","already-still-yet.md#stage-of-change"]}]},
  {"pair":["sake","holder"],"kind":"rule","cases":[{"order":"over","over":"holder","anchors":["holder.md#what-the-holder-covers"]}]},
  {"pair":["sake","intention"],"kind":"rule","cases":[{"order":"textOrder","anchors":["clause.md#which-covers-which"]}]},
  {"pair":["sake","ability"],"kind":"rule","cases":[{"order":"textOrder","anchors":["clause.md#which-covers-which"]}]},
  {"pair":["sake","phase"],"kind":"rule","cases":[{"order":"textOrder","anchors":["clause.md#which-covers-which"]}]},
  {"pair":["sake","residue"],"kind":"rule","cases":[{"order":"textOrder","anchors":["clause.md#which-covers-which"]}]},
  {"pair":["sake","notional"],"kind":"rule","cases":[{"order":"over","over":"notional","anchors":["holder.md#what-the-holder-covers"],"seam":true},{"order":"textOrder","anchors":["clause.md#which-covers-which"]}]},
  {"pair":["sake","mirative"],"kind":"commutes","cases":[{"order":"commutes","anchors":["mirative.md#mirative","feelings.md#speaker-attitude","for-a-sake.md#whose-stake","contrary-to.md#contrary-to-stance"]}]},
  {"pair":["sake","contrary"],"kind":"commutes","cases":[{"order":"commutes","anchors":["mirative.md#mirative","feelings.md#speaker-attitude","for-a-sake.md#whose-stake","contrary-to.md#contrary-to-stance"]}]},
  {"pair":["sake","occasion"],"kind":"rule","cases":[{"order":"textOrder","anchors":["clause.md#which-covers-which"]}]},
  {"pair":["attitude","binder"],"kind":"rule","cases":[{"order":"textOrder","anchors":["clause.md#which-covers-which"]}]},
  {"pair":["attitude","hinge"],"kind":"rule","cases":[{"order":"textOrder","anchors":["clause.md#which-covers-which","dependents.md#hinges","stand-in-vowels.md#stand-in-back"]}]},
  {"pair":["attitude","stance"],"kind":"rule","cases":[{"order":"commutes","anchors":["evidentiality.md#evidence-clause"],"when":{"stance":["channel"]}},{"order":"textOrder","anchors":["clause.md#which-covers-which","already-still-yet.md#stage-of-change"]}]},
  {"pair":["attitude","holder"],"kind":"rule","cases":[{"order":"over","over":"attitude","anchors":["holder.md#what-the-holder-covers"]}]},
  {"pair":["attitude","intention"],"kind":"rule","cases":[{"order":"textOrder","anchors":["clause.md#which-covers-which"]}]},
  {"pair":["attitude","ability"],"kind":"rule","cases":[{"order":"textOrder","anchors":["clause.md#which-covers-which"]}]},
  {"pair":["attitude","phase"],"kind":"rule","cases":[{"order":"textOrder","anchors":["clause.md#which-covers-which"]}]},
  {"pair":["attitude","residue"],"kind":"rule","cases":[{"order":"textOrder","anchors":["clause.md#which-covers-which"]}]},
  {"pair":["attitude","notional"],"kind":"rule","cases":[{"order":"textOrder","anchors":["clause.md#which-covers-which"]}]},
  {"pair":["attitude","mirative"],"kind":"commutes","cases":[{"order":"commutes","anchors":["mirative.md#mirative","feelings.md#speaker-attitude","for-a-sake.md#whose-stake","contrary-to.md#contrary-to-stance"]}]},
  {"pair":["attitude","contrary"],"kind":"commutes","cases":[{"order":"commutes","anchors":["mirative.md#mirative","feelings.md#speaker-attitude","for-a-sake.md#whose-stake","contrary-to.md#contrary-to-stance"]}]},
  {"pair":["attitude","occasion"],"kind":"rule","cases":[{"order":"textOrder","anchors":["clause.md#which-covers-which"]}]},
  {"pair":["binder","hinge"],"kind":"rule","cases":[{"order":"textOrder","anchors":["clause.md#which-covers-which","dependents.md#hinges"]}]},
  {"pair":["binder","stance"],"kind":"rule","cases":[{"order":"textOrder","anchors":["clause.md#which-covers-which","usually-vs-must.md#general-claims"]}]},
  {"pair":["binder","holder"],"kind":"rule","cases":[{"order":"over","over":"holder","anchors":["holder.md#what-the-holder-covers"]}]},
  {"pair":["binder","intention"],"kind":"rule","cases":[{"order":"textOrder","anchors":["clause.md#which-covers-which"]}]},
  {"pair":["binder","ability"],"kind":"rule","cases":[{"order":"textOrder","anchors":["clause.md#which-covers-which"]}]},
  {"pair":["binder","phase"],"kind":"rule","cases":[{"order":"textOrder","anchors":["clause.md#which-covers-which"]}]},
  {"pair":["binder","residue"],"kind":"rule","cases":[{"order":"textOrder","anchors":["clause.md#which-covers-which"]}]},
  {"pair":["binder","notional"],"kind":"rule","cases":[{"order":"textOrder","anchors":["clause.md#which-covers-which"]}]},
  {"pair":["binder","mirative"],"kind":"rule","cases":[{"order":"textOrder","anchors":["clause.md#which-covers-which"]}]},
  {"pair":["binder","contrary"],"kind":"rule","cases":[{"order":"textOrder","anchors":["clause.md#which-covers-which"]}]},
  {"pair":["binder","occasion"],"kind":"rule","cases":[{"order":"textOrder","anchors":["clause.md#which-covers-which"]}]},
  {"pair":["hinge","stance"],"kind":"rule","cases":[{"order":"over","over":"stance","anchors":["evidentiality.md#evidence-clause","usually-vs-must.md#how-things-work"],"when":{"stance":["channel"]}},{"order":"textOrder","anchors":["clause.md#which-covers-which","already-still-yet.md#stage-of-change","dependents.md#hinges","stand-in-vowels.md#stand-in-back"]}]},
  {"pair":["hinge","holder"],"kind":"rule","cases":[{"order":"over","over":"holder","anchors":["holder.md#what-the-holder-covers"]}]},
  {"pair":["hinge","intention"],"kind":"rule","cases":[{"order":"textOrder","anchors":["clause.md#which-covers-which","dependents.md#hinges","stand-in-vowels.md#stand-in-back"]}]},
  {"pair":["hinge","ability"],"kind":"rule","cases":[{"order":"textOrder","anchors":["clause.md#which-covers-which","dependents.md#hinges","stand-in-vowels.md#stand-in-back"]}]},
  {"pair":["hinge","phase"],"kind":"rule","cases":[{"order":"textOrder","anchors":["clause.md#which-covers-which","dependents.md#hinges","stand-in-vowels.md#stand-in-back"]}]},
  {"pair":["hinge","residue"],"kind":"rule","cases":[{"order":"textOrder","anchors":["clause.md#which-covers-which","dependents.md#hinges","stand-in-vowels.md#stand-in-back"]}]},
  {"pair":["hinge","notional"],"kind":"rule","cases":[{"order":"textOrder","anchors":["clause.md#which-covers-which","dependents.md#hinges","stand-in-vowels.md#stand-in-back"]}]},
  {"pair":["hinge","mirative"],"kind":"rule","cases":[{"order":"textOrder","anchors":["clause.md#which-covers-which","dependents.md#hinges","stand-in-vowels.md#stand-in-back"]}]},
  {"pair":["hinge","contrary"],"kind":"rule","cases":[{"order":"textOrder","anchors":["clause.md#which-covers-which","dependents.md#hinges","stand-in-vowels.md#stand-in-back"]}]},
  {"pair":["hinge","occasion"],"kind":"rule","cases":[{"order":"over","over":"occasion","anchors":["usually-vs-must.md#how-things-work"]}]},
  {"pair":["stance","holder"],"kind":"wordShape","cases":[{"order":"over","over":"holder","anchors":["holder.md#what-the-holder-covers"]}]},
  {"pair":["stance","intention"],"kind":"rule","cases":[{"order":"textOrder","anchors":["clause.md#which-covers-which","already-still-yet.md#stage-of-change"]}]},
  {"pair":["stance","ability"],"kind":"rule","cases":[{"order":"textOrder","anchors":["clause.md#which-covers-which"]}]},
  {"pair":["stance","phase"],"kind":"rule","cases":[{"order":"textOrder","anchors":["clause.md#which-covers-which","already-still-yet.md#stage-of-change"]}]},
  {"pair":["stance","residue"],"kind":"rule","cases":[{"order":"textOrder","anchors":["clause.md#which-covers-which"]}]},
  {"pair":["stance","notional"],"kind":"rule","cases":[{"order":"textOrder","anchors":["clause.md#which-covers-which","already-still-yet.md#stage-of-change"]}]},
  {"pair":["stance","mirative"],"kind":"rule","cases":[{"order":"commutes","anchors":["evidentiality.md#evidence-clause"],"when":{"stance":["channel"]}},{"order":"textOrder","anchors":["clause.md#which-covers-which","already-still-yet.md#stage-of-change"]}]},
  {"pair":["stance","contrary"],"kind":"commutes","cases":[{"order":"commutes","anchors":["contrary-to.md#contrary-to-stance"]}]},
  {"pair":["stance","occasion"],"kind":"rule","cases":[{"order":"textOrder","anchors":["clause.md#which-covers-which","usually-vs-must.md#general-claims"]}]},
  {"pair":["holder","intention"],"kind":"wordShape","cases":[{"order":"over","over":"holder","anchors":["want-and-decide.md#whose-intention"]}]},
  {"pair":["holder","ability"],"kind":"rule","cases":[{"order":"over","over":"holder","anchors":["holder.md#what-the-holder-covers"]}]},
  {"pair":["holder","phase"],"kind":"rule","cases":[{"order":"over","over":"holder","anchors":["holder.md#what-the-holder-covers"]}]},
  {"pair":["holder","residue"],"kind":"rule","cases":[{"order":"over","over":"holder","anchors":["holder.md#what-the-holder-covers"]}]},
  {"pair":["holder","notional"],"kind":"wordShape","cases":[{"order":"over","over":"holder","anchors":["notional.md#follow-up-endings-notional"]}]},
  {"pair":["holder","mirative"],"kind":"rule","cases":[{"order":"over","over":"holder","anchors":["holder.md#what-the-holder-covers"]}]},
  {"pair":["holder","contrary"],"kind":"rule","cases":[{"order":"over","over":"holder","anchors":["holder.md#what-the-holder-covers"]}]},
  {"pair":["holder","occasion"],"kind":"rule","cases":[{"order":"over","over":"holder","anchors":["holder.md#what-the-holder-covers"]}]},
  {"pair":["intention","ability"],"kind":"rule","cases":[{"order":"textOrder","anchors":["clause.md#which-covers-which"]}]},
  {"pair":["intention","phase"],"kind":"rule","cases":[{"order":"textOrder","anchors":["clause.md#which-covers-which"]}]},
  {"pair":["intention","residue"],"kind":"rule","cases":[{"order":"textOrder","anchors":["clause.md#which-covers-which"]}]},
  {"pair":["intention","notional"],"kind":"rule","cases":[{"order":"textOrder","anchors":["clause.md#which-covers-which"]}]},
  {"pair":["intention","mirative"],"kind":"rule","cases":[{"order":"textOrder","anchors":["clause.md#which-covers-which"]}]},
  {"pair":["intention","contrary"],"kind":"commutes","cases":[{"order":"commutes","anchors":["contrary-to.md#contrary-to-stance"]}]},
  {"pair":["intention","occasion"],"kind":"rule","cases":[{"order":"textOrder","anchors":["clause.md#which-covers-which"]}]},
  {"pair":["ability","phase"],"kind":"rule","cases":[{"order":"textOrder","anchors":["clause.md#which-covers-which"]}]},
  {"pair":["ability","residue"],"kind":"rule","cases":[{"order":"textOrder","anchors":["clause.md#which-covers-which"]}]},
  {"pair":["ability","notional"],"kind":"rule","cases":[{"order":"textOrder","anchors":["clause.md#which-covers-which"]}]},
  {"pair":["ability","mirative"],"kind":"rule","cases":[{"order":"textOrder","anchors":["clause.md#which-covers-which"]}]},
  {"pair":["ability","contrary"],"kind":"rule","cases":[{"order":"textOrder","anchors":["clause.md#which-covers-which"]}]},
  {"pair":["ability","occasion"],"kind":"rule","cases":[{"order":"textOrder","anchors":["clause.md#which-covers-which"]}]},
  {"pair":["phase","residue"],"kind":"rule","cases":[{"order":"textOrder","anchors":["clause.md#which-covers-which"]}]},
  {"pair":["phase","notional"],"kind":"rule","cases":[{"order":"textOrder","anchors":["clause.md#which-covers-which"]}]},
  {"pair":["phase","mirative"],"kind":"rule","cases":[{"order":"textOrder","anchors":["clause.md#which-covers-which"]}]},
  {"pair":["phase","contrary"],"kind":"rule","cases":[{"order":"textOrder","anchors":["clause.md#which-covers-which"]}]},
  {"pair":["phase","occasion"],"kind":"rule","cases":[{"order":"textOrder","anchors":["clause.md#which-covers-which"]}]},
  {"pair":["residue","notional"],"kind":"rule","cases":[{"order":"textOrder","anchors":["clause.md#which-covers-which"]}]},
  {"pair":["residue","mirative"],"kind":"rule","cases":[{"order":"textOrder","anchors":["clause.md#which-covers-which"]}]},
  {"pair":["residue","contrary"],"kind":"rule","cases":[{"order":"textOrder","anchors":["clause.md#which-covers-which"]}]},
  {"pair":["residue","occasion"],"kind":"rule","cases":[{"order":"over","over":"residue","anchors":["residue-and-former.md#former-climate"],"when":{"residue":["former"]}},{"order":"textOrder","anchors":["clause.md#which-covers-which"]}]},
  {"pair":["notional","mirative"],"kind":"rule","cases":[{"order":"textOrder","anchors":["clause.md#which-covers-which"]}]},
  {"pair":["notional","contrary"],"kind":"rule","cases":[{"order":"textOrder","anchors":["clause.md#which-covers-which"]}]},
  {"pair":["notional","occasion"],"kind":"rule","cases":[{"order":"textOrder","anchors":["clause.md#which-covers-which"]}]},
  {"pair":["mirative","contrary"],"kind":"commutes","cases":[{"order":"commutes","anchors":["mirative.md#mirative","feelings.md#speaker-attitude","for-a-sake.md#whose-stake","contrary-to.md#contrary-to-stance"]}]},
  {"pair":["mirative","occasion"],"kind":"rule","cases":[{"order":"textOrder","anchors":["clause.md#which-covers-which"]}]},
  {"pair":["contrary","occasion"],"kind":"rule","cases":[{"order":"textOrder","anchors":["clause.md#which-covers-which"]}]},
  {"pair":["stance","stance"],"kind":"rule","cases":[{"order":"textOrder","anchors":["clause.md#which-covers-which","already-still-yet.md#stage-of-change"]}]},
  {"pair":["polarity","force"],"kind":"rule","cases":[{"order":"over","over":"force","anchors":["speech-moves.md#speech-act-statement-question-command"]}]},
  {"pair":["polarity","stance"],"kind":"rule","cases":[{"order":"textOrder","anchors":["clause.md#which-covers-which","verb-and-stance-joins.md#standalone-stance-joins","verb-and-stance-joins.md#stance-join-reach"]}]},
  {"pair":["polarity","intention"],"kind":"rule","cases":[{"order":"textOrder","anchors":["clause.md#which-covers-which","verb-and-stance-joins.md#standalone-stance-joins","verb-and-stance-joins.md#stance-join-reach"]}]},
  {"pair":["polarity","hinge"],"kind":"rule","cases":[{"order":"textOrder","anchors":["clause.md#which-covers-which","dependents.md#hinges","stand-in-vowels.md#stand-in-back","verb-and-stance-joins.md#standalone-stance-joins","verb-and-stance-joins.md#stance-join-reach"]}]},
  {"pair":["polarity","ability"],"kind":"rule","cases":[{"order":"textOrder","anchors":["clause.md#which-covers-which","verb-and-stance-joins.md#standalone-stance-joins"]}]},
  {"pair":["polarity","say"],"kind":"rule","cases":[{"order":"textOrder","anchors":["clause.md#which-covers-which","verb-and-stance-joins.md#standalone-stance-joins"]}]},
  {"pair":["polarity","sake"],"kind":"rule","cases":[{"order":"textOrder","anchors":["clause.md#which-covers-which","verb-and-stance-joins.md#standalone-stance-joins","verb-and-stance-joins.md#stance-join-reach"]}]},
  {"pair":["polarity","attitude"],"kind":"rule","cases":[{"order":"textOrder","anchors":["clause.md#which-covers-which","verb-and-stance-joins.md#standalone-stance-joins","verb-and-stance-joins.md#stance-join-reach"]}]},
  {"pair":["polarity","binder"],"kind":"rule","cases":[{"order":"textOrder","anchors":["clause.md#which-covers-which"]}]},
  {"pair":["polarity","holder"],"kind":"rule","cases":[{"order":"over","over":"holder","anchors":["holder.md#what-the-holder-covers"]}]},
  {"pair":["polarity","phase"],"kind":"rule","cases":[{"order":"textOrder","anchors":["clause.md#which-covers-which","verb-and-stance-joins.md#standalone-stance-joins"]}]},
  {"pair":["polarity","residue"],"kind":"rule","cases":[{"order":"textOrder","anchors":["clause.md#which-covers-which","verb-and-stance-joins.md#standalone-stance-joins"]}]},
  {"pair":["polarity","notional"],"kind":"rule","cases":[{"order":"textOrder","anchors":["clause.md#which-covers-which","verb-and-stance-joins.md#standalone-stance-joins","verb-and-stance-joins.md#stance-join-reach"]}]},
  {"pair":["polarity","mirative"],"kind":"rule","cases":[{"order":"textOrder","anchors":["clause.md#which-covers-which","verb-and-stance-joins.md#standalone-stance-joins","verb-and-stance-joins.md#stance-join-reach"]}]},
  {"pair":["polarity","contrary"],"kind":"rule","cases":[{"order":"textOrder","anchors":["clause.md#which-covers-which","verb-and-stance-joins.md#standalone-stance-joins","verb-and-stance-joins.md#stance-join-reach"]}]},
  {"pair":["polarity","occasion"],"kind":"rule","cases":[{"order":"textOrder","anchors":["clause.md#which-covers-which","verb-and-stance-joins.md#standalone-stance-joins"]}]},
  {"pair":["binder","binder"],"kind":"rule","cases":[{"order":"textOrder","anchors":["clause.md#which-covers-which","joins.md#everything-ua"]}]},
  {"pair":["intention","intention"],"kind":"rule","cases":[{"order":"textOrder","anchors":["clause.md#which-covers-which","intention.md#plan"]}]},
  {"pair":["force","force"],"kind":"rule","cases":[{"order":"commutes","anchors":["more-turn-words.md#doubled-act"],"when":{"force":["repeat"]}},{"order":"textOrder","anchors":["more-turn-words.md#stacked-acts"]}]},
  {"pair":["call","force"],"kind":"commutes","cases":[{"order":"commutes","anchors":["speech-moves.md#vocative"]}]},
  {"pair":["call","polarity"],"kind":"commutes","cases":[{"order":"commutes","anchors":["speech-moves.md#vocative"]}]},
  {"pair":["call","say"],"kind":"commutes","cases":[{"order":"commutes","anchors":["speech-moves.md#vocative"]}]},
  {"pair":["call","stance"],"kind":"commutes","cases":[{"order":"commutes","anchors":["speech-moves.md#vocative"]}]},
  {"pair":["call","holder"],"kind":"commutes","cases":[{"order":"commutes","anchors":["speech-moves.md#vocative"]}]},
  {"pair":["call","hinge"],"kind":"commutes","cases":[{"order":"commutes","anchors":["speech-moves.md#vocative"]}]},
  {"pair":["call","intention"],"kind":"commutes","cases":[{"order":"commutes","anchors":["speech-moves.md#vocative"]}]},
  {"pair":["call","ability"],"kind":"commutes","cases":[{"order":"commutes","anchors":["speech-moves.md#vocative"]}]},
  {"pair":["call","phase"],"kind":"commutes","cases":[{"order":"commutes","anchors":["speech-moves.md#vocative"]}]},
  {"pair":["call","residue"],"kind":"commutes","cases":[{"order":"commutes","anchors":["speech-moves.md#vocative"]}]},
  {"pair":["call","notional"],"kind":"commutes","cases":[{"order":"commutes","anchors":["speech-moves.md#vocative"]}]},
  {"pair":["call","mirative"],"kind":"commutes","cases":[{"order":"commutes","anchors":["speech-moves.md#vocative"]}]},
  {"pair":["call","contrary"],"kind":"commutes","cases":[{"order":"commutes","anchors":["speech-moves.md#vocative"]}]},
  {"pair":["call","occasion"],"kind":"commutes","cases":[{"order":"commutes","anchors":["speech-moves.md#vocative"]}]},
  {"pair":["call","sake"],"kind":"commutes","cases":[{"order":"commutes","anchors":["speech-moves.md#vocative"]}]},
  {"pair":["call","attitude"],"kind":"commutes","cases":[{"order":"commutes","anchors":["speech-moves.md#vocative"]}]},
  {"pair":["call","binder"],"kind":"commutes","cases":[{"order":"commutes","anchors":["speech-moves.md#vocative"]}]},
  {"pair":["call","call"],"kind":"commutes","cases":[{"order":"commutes","anchors":["speech-moves.md#vocative"]}]},
];

const key = (row: PairRow): string => [...row.pair].sort().join("|");
const byPair = (rows: readonly PairRow[]) => new Map(rows.map((row) => [key(row), { kind: row.kind, cases: row.cases }]));

describe("family profiles", () => {
  it("derive the pair table as it stood", () => {
    const derived = derivePairRows();
    assert.equal(derived.length, FROZEN.length);
    assert.deepEqual(byPair(derived), byPair(FROZEN));
  });

  it("name the rule that decided a pair", () => {
    assert.equal(explainPair("call", "holder"), "call");
    assert.equal(explainPair("force", "say"), "edge");
    assert.equal(explainPair("force", "sake"), "escape:force");
    assert.equal(explainPair("force", "contrary"), "escape:force");
    assert.equal(explainPair("holder", "attitude"), "escape:holder");
    assert.equal(explainPair("mirative", "contrary"), "escape:each-other");
    assert.equal(explainPair("holder", "occasion"), "covers:holder");
    assert.equal(explainPair("sake", "holder"), "covers:holder");
    assert.equal(explainPair("hinge", "holder"), "covers:holder");
    assert.equal(explainPair("stance", "holder"), "seam:holder");
    assert.equal(explainPair({ family: "stance", member: "channel" }, "hinge"), "member:channel");
    assert.equal(explainPair({ family: "stance", member: "may" }, "hinge"), "text");
    assert.equal(explainPair({ family: "stance", member: "channel", holderHost: true }, "sake"), "seam-word");
    assert.equal(explainPair({ family: "notional", holderHost: true }, "sake"), "seam-word");
    assert.equal(explainPair({ family: "stance", member: "channel" }, "sake"), "text");
    assert.equal(explainPair("hinge", "occasion"), "exception:hinge-occasion");
    assert.equal(explainPair("bar", "stance"), "never");
  });

  it("list each exception once, with a reason", () => {
    assert.equal(new Set(EXCEPTIONS.map((e) => e.id)).size, EXCEPTIONS.length);
    for (const e of EXCEPTIONS) assert.ok(e.reason.length > 0, e.id);
  });
});
