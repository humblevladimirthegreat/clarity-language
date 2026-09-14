# Morph-gloss report

Editor inventory from `npm run lint:agalan`. Grammar morph lines are **not** auto-retied.
Leftover `--check-ambiguity` hits fail CI. Suspected wrong grammar morph lines are listed here only.

## Leftover `--check-ambiguity`

_None._

## Suspected wrong grammar morph lines

### docs/grammar/ability.md:24

```
docs/grammar/ability.md:24  morph gloss mismatch
  agalan: `zululon vuwuruxam.`
  documented: z-Ululon | v-write-able-metaphor
  parser:     z-Ululon | v-authorship-able
```

### docs/grammar/causation.md:18

```
docs/grammar/causation.md:18  morph gloss mismatch
  agalan: `zezewel zaom.`
  documented: z-effort | z-and/or.open
  parser:     z-sweat | z-and/or.open
```

### docs/grammar/causation.md:216

```
docs/grammar/causation.md:216  morph gloss mismatch
  agalan: `zazawan gon.`
  documented: z-Azawan | g-has-to-be
  parser:     z-Azawan | g-exclusive-for
```

### docs/grammar/causation.md:233

```
docs/grammar/causation.md:233  morph gloss mismatch
  agalan: `zazawan vawalal hadorom badorol zululon velebel.`
  documented: z-Azawan | v-walk | h-if | b-next-clause | z-Ululon | v-sleep
  parser:     z-Azawan | v-walking | h-if | b-next-clause | z-Ululon | v-sleep
```

### docs/grammar/causation.md:251

```
docs/grammar/causation.md:251  morph gloss mismatch
  agalan: `zazawan vawalal hurugum badorol zululon velebel.`
  documented: z-Azawan | v-walk | h-because | b-next-clause | z-Ululon | v-sleep
  parser:     z-Azawan | v-walking | h-because | b-next-clause | z-Ululon | v-sleep
```

### docs/grammar/causation.md:273

```
docs/grammar/causation.md:273  morph gloss mismatch
  agalan: `haon bezewel hegegam.`
  documented: h-and/or | b-effort | h-CAUSE
  parser:     h-open-to | b-sweat | h-CAUSE
```

### docs/grammar/causation.md:288

```
docs/grammar/causation.md:288  morph gloss mismatch
  agalan: `haon bezewel holozoxor.`
  documented: h-and/or | b-effort | h-competence.prescription
  parser:     h-open-to | b-sweat | h-competence-x-prescription
```

### docs/grammar/causation.md:438

```
docs/grammar/causation.md:438  morph gloss mismatch
  agalan: `zazawan vawalal hurugum badorol zanunul.`
  documented: z-Azawan | v-walk | h-because | b-next-clause | z-rain
  parser:     z-Azawan | v-walking | h-because | b-next-clause | z-rain
```

### docs/grammar/causation.md:461

```
docs/grammar/causation.md:461  morph gloss mismatch
  agalan: `zazawan hodohom vawalal.`
  documented: z-Azawan | h-comment | v-walk
  parser:     z-Azawan | h-COMMENT | v-walking
```

### docs/grammar/causation.md:476

```
docs/grammar/causation.md:476  morph gloss mismatch
  agalan: `zuludul zaom hual.`
  documented: z-cloud | z-and/or.open | h-habitual
  parser:     z-cloud | z-and/or.open | h-always
```

### docs/grammar/commentary.md:16

```
docs/grammar/commentary.md:16  morph gloss mismatch
  agalan: `zazawan hodohom vawalal.`
  documented: z-Azawan | h-COMMENT-soft | v-walk
  parser:     z-Azawan | h-COMMENT | v-walking
```

### docs/grammar/commentary.md:26

```
docs/grammar/commentary.md:26  morph gloss mismatch
  agalan: `jol zuhubun hodohom velebel.`
  documented: j-yes | z-Uhubun | h-COMMENT-soft | v-sleep
  parser:     j-question | z-Uhubun | h-COMMENT | v-sleep
```

### docs/grammar/commentary.md:194

```
docs/grammar/commentary.md:194  morph gloss mismatch
  agalan: `zazawan hadezem vawalal.`
  documented: z-Azawan | h-LIVE | v-walk
  parser:     z-Azawan | h-LIVE | v-walking
```

### docs/grammar/commentary.md:256

```
docs/grammar/commentary.md:256  morph gloss mismatch
  agalan: `zazawan hadadem vawalal.`
  documented: z-Azawan | h-NOTIONAL-soft | v-walk
  parser:     z-Azawan | h-NOTIONAL | v-walking
```

### docs/grammar/commentary.md:433

```
docs/grammar/commentary.md:433  morph gloss mismatch
  agalan: `zazawan gelulul wuvuvum vawalal.`
  documented: z-Azawan | g-blue | w-WITNESSED | v-walk
  parser:     z-Azawan | g-blue | w-WITNESSED | v-walking
```

### docs/grammar/commentary.md:461

```
docs/grammar/commentary.md:461  morph gloss mismatch
  agalan: `zazawan zadadel vejel.`
  documented: z-Azawan | z-theater | v-see
  parser:     z-Azawan | z-theater | v-eye
```

### docs/grammar/commentary.md:472

```
docs/grammar/commentary.md:472  morph gloss mismatch
  agalan: `zazawan huvuvum dabodol vejel.`
  documented: z-Azawan | h-WITNESSED | d-boot | v-see
  parser:     z-Azawan | h-WITNESSED | d-boot | v-eye
```

### docs/grammar/comparatives.md:16

```
docs/grammar/comparatives.md:16  morph gloss mismatch
  agalan: `zazawan zululon zel gomonam.`
  documented: z-Azawan | z-Ululon | z-rank/more | g-challenging
  parser:     z-Azawan | z-Ululon | z-rank/more | g-challenge
```

### docs/grammar/comparatives.md:33

```
docs/grammar/comparatives.md:33  morph gloss mismatch
  agalan: `zazawan zel gomonam.`
  documented: z-Azawan | z-rank/more | g-challenging
  parser:     z-Azawan | z-rank/more | g-challenge
```

### docs/grammar/comparatives.md:50

```
docs/grammar/comparatives.md:50  morph gloss mismatch
  agalan: `zazawan zululon zel gomonam wogegal.`
  documented: z-Azawan | z-Ululon | z-rank/more | g-challenging | w-flood
  parser:     z-Azawan | z-Ululon | z-rank/more | g-challenge | w-ocean-wave
```

### docs/grammar/comparatives.md:63

```
docs/grammar/comparatives.md:63  morph gloss mismatch
  agalan: `zazawan zululon zael gomonam.`
  documented: z-Azawan | z-Ululon | z-as…as | g-challenging
  parser:     z-Azawan | z-Ululon | z-as…as | g-challenge
```

### docs/grammar/comparatives.md:235

```
docs/grammar/comparatives.md:235  morph gloss mismatch
  agalan: `zululon zazawan zel hohogem vawalal.`
  documented: z-Ululon | z-Azawan | z-rank/more | h-intense | v-walk
  parser:     z-Ululon | z-Azawan | z-rank/more | h-intensity | v-walking
```

### docs/grammar/comparatives.md:260

```
docs/grammar/comparatives.md:260  morph gloss mismatch
  agalan: `zazawan zululon zal gomonam.`
  documented: z-Azawan | z-Ululon | z-and | g-challenging
  parser:     z-Azawan | z-Ululon | z-and | g-challenge
```

### docs/grammar/comparatives.md:283

```
docs/grammar/comparatives.md:283  morph gloss mismatch
  agalan: `zazawan zululon zel gomonam burulel g+2.`
  documented: z-Azawan | z-Ululon | z-rank/more | g-challenging | b-measurement | g-+2
  parser:     z-Azawan | z-Ululon | z-rank/more | g-challenge | b-ruler | g-two
```

### docs/grammar/core.md:16

```
docs/grammar/core.md:16  morph gloss mismatch
  agalan: `zodogol vawalal.`
  documented: z-dog | v-walk
  parser:     z-dog | v-walking
```

### docs/grammar/core.md:24

```
docs/grammar/core.md:24  morph gloss mismatch
  agalan: `zazawan vawalal.`
  documented: z-Azawan | v-walk
  parser:     z-Azawan | v-walking
```

### docs/grammar/core.md:36

```
docs/grammar/core.md:36  morph gloss mismatch
  agalan: `zodogol dagadal vejel.`
  documented: z-dog | d-cat | v-see
  parser:     z-dog | d-cat | v-eye
```

### docs/grammar/core.md:47

```
docs/grammar/core.md:47  morph gloss mismatch
  agalan: `zodogol gelulul vawalal.`
  documented: z-dog | g-blue | v-walk
  parser:     z-dog | g-blue | v-walking
```

### docs/grammar/core.md:58

```
docs/grammar/core.md:58  morph gloss mismatch
  agalan: `zodogol gelulul welem vawalal.`
  documented: z-dog | g-blue | w-size | v-walk
  parser:     z-dog | g-blue | w-size | v-walking
```

### docs/grammar/core.md:69

```
docs/grammar/core.md:69  morph gloss mismatch
  agalan: `zodogol hadazam vawalal.`
  documented: z-dog | h-haste | v-walk
  parser:     z-dog | h-haste | v-walking
```

### docs/grammar/core.md:125

```
docs/grammar/core.md:125  morph gloss mismatch
  agalan: `jel vawalal.`
  documented: j-command | v-walk
  parser:     j-command | v-walking
```

### docs/grammar/core.md:151

```
docs/grammar/core.md:151  morph gloss mismatch
  agalan: `zazawan dululon vezehel dadorol zodogol vurunul.`
  documented: z-Azawan | d-Ululon | v-tell | d-next-clause | z-dog | v-run
  parser:     z-Azawan | d-Ululon | v-speech | d-next-clause | z-dog | v-running
```

### docs/grammar/core.md:159

```
docs/grammar/core.md:159  morph gloss mismatch
  agalan: `zazawan vuzunul hurugum badorol zululon vawalal.`
  documented: z-Azawan | v-sing | h-because | b-next-clause | z-Ululon | v-walk
  parser:     z-Azawan | v-sing | h-because | b-next-clause | z-Ululon | v-walking
```

### docs/grammar/core.md:191

```
docs/grammar/core.md:191  morph gloss mismatch
  agalan: `zodogol vawalal. xezazal zagadal vurunul.`
  documented: z-dog | v-walk | x-therefore | z-cat | v-run
  parser:     z-dog | v-walking | x-therefore | z-cat | v-running
```

### docs/grammar/core.md:366

```
docs/grammar/core.md:366  morph gloss mismatch
  agalan: `jam zazawan vawalal.`
  documented: j-statement | z-Azawan | v-walk
  parser:     j-statement | z-Azawan | v-walking
```

### docs/grammar/core.md:405

```
docs/grammar/core.md:405  morph gloss mismatch
  agalan: `hozal bazawan zululon vawalal.`
  documented: h-topic | b-Azawan | z-Ululon | v-walk
  parser:     h-hash | b-Azawan | z-Ululon | v-walking
```

### docs/grammar/core.md:420

```
docs/grammar/core.md:420  morph gloss mismatch
  agalan: `zodogol gonunul bazawan gelulul.`
  documented: z-dog | g-same | b-Azawan | g-blue
  parser:     z-dog | g-SAME | b-Azawan | g-blue
```

### docs/grammar/core.md:468

```
docs/grammar/core.md:468  morph gloss mismatch
  agalan: `zazawan guzumum hurugum badorol zululon vawalal hurugum badorol zuhubun velebel.`
  documented: z-Azawan | g-happy | h-because | b-next-clause | z-Ululon | v-walk | h-because | b-next-clause | z-Uhubun | v-sleep
  parser:     z-Azawan | g-happy | h-because | b-next-clause | z-Ululon | v-walking | h-because | b-next-clause | z-Uhubun | v-sleep
```

### docs/grammar/joins.md:53

```
docs/grammar/joins.md:53  morph gloss mismatch
  agalan: `zazawan vawalal zululon vurunul xam.`
  documented: z-Azawan | v-walk | z-Ululon | v-run | x-and.open
  parser:     z-Azawan | v-walking | z-Ululon | v-running | x-and.open
```

### docs/grammar/joins.md:64

```
docs/grammar/joins.md:64  morph gloss mismatch
  agalan: `zadedal zogovel zol.`
  documented: z-tea | z-coffee | z-or
  parser:     z-tea | z-coffee | z-or-exactly-one
```

### docs/grammar/joins.md:99

```
docs/grammar/joins.md:99  morph gloss mismatch
  agalan: `gomonam gul.`
  documented: g-challenging | g-not
  parser:     g-challenge | g-not
```

### docs/grammar/joins.md:121

```
docs/grammar/joins.md:121  morph gloss mismatch
  agalan: `zual.`
  documented: z-everything
  parser:     z-everything-but
```

### docs/grammar/joins.md:134

```
docs/grammar/joins.md:134  morph gloss mismatch
  agalan: `zazawan zel.`
  documented: z-Azawan | z-rank
  parser:     z-Azawan | z-rank/more
```

### docs/grammar/joins.md:436

```
docs/grammar/joins.md:436  morph gloss mismatch
  agalan: `zazawan zululon zael gomonam.`
  documented: z-Azawan | z-Ululon | z-as…as | g-challenging
  parser:     z-Azawan | z-Ululon | z-as…as | g-challenge
```

### docs/grammar/joins.md:494

```
docs/grammar/joins.md:494  morph gloss mismatch
  agalan: `zual gagadal.`
  documented: z-everything | g-cat
  parser:     z-everything-but | g-cat
```

### docs/grammar/joins.md:511

```
docs/grammar/joins.md:511  morph gloss mismatch
  agalan: `zodogol zagadal zal gomonam.`
  documented: z-dog | z-cat | z-and | g-challenging
  parser:     z-dog | z-cat | z-and | g-challenge
```

### docs/grammar/numbers-applied.md:60

```
docs/grammar/numbers-applied.md:60  morph gloss mismatch
  agalan: `zazawan burulel g+2 vawalal.`
  documented: z-Azawan | b-measurement | g-+2 | v-walk
  parser:     z-Azawan | b-ruler | g-two | v-walking
```

### docs/grammar/numbers-applied.md:104

```
docs/grammar/numbers-applied.md:104  morph gloss mismatch
  agalan: `zazawan zululon zel gomonam burulel g+2.`
  documented: z-Azawan | z-Ululon | z-rank | g-challenging | b-measurement | g-+2
  parser:     z-Azawan | z-Ululon | z-rank/more | g-challenge | b-ruler | g-two
```

### docs/grammar/numbers-applied.md:121

```
docs/grammar/numbers-applied.md:121  morph gloss mismatch
  agalan: `z+3 z+5 zel gumel.`
  documented: z-+3 | z-+5 | z-rank | g-time
  parser:     z-three | z-five | z-rank/more | g-time
```

### docs/grammar/numbers-applied.md:157

```
docs/grammar/numbers-applied.md:157  morph gloss mismatch
  agalan: `zagadalx g+25%.`
  documented: z-cat-assoc | g-+25jo
  parser:     z-cat-x | g-25
```

### docs/grammar/numbers-applied.md:340

```
docs/grammar/numbers-applied.md:340  morph gloss mismatch
  agalan: `z+5 zel.`
  documented: z-+5 | z-rank
  parser:     z-five | z-rank/more
```

### docs/grammar/numbers.md:315

```
docs/grammar/numbers.md:315  morph gloss mismatch
  agalan: `z+3 gelulun.`
  documented: z-three | g-blue
  parser:     z-three | g-Elulun
```

### docs/grammar/numbers.md:398

```
docs/grammar/numbers.md:398  morph gloss mismatch
  agalan: `g+27e12`
  documented: g-27e12
  parser:     g-+-27
```

### docs/grammar/numbers.md:491

```
docs/grammar/numbers.md:491  morph gloss mismatch
  agalan: `zululon vawalal h+3.`
  documented: z-Ululon | v-walk | h-three-times
  parser:     z-Ululon | v-walking | h-three
```

### docs/grammar/numbers.md:607

```
docs/grammar/numbers.md:607  morph gloss mismatch
  agalan: `zabogol g#-2.`
  documented: z-book | g-2nd-from-end
  parser:     z-book | g-second-from-end
```

### docs/grammar/numeric-derivation.md:14

```
docs/grammar/numeric-derivation.md:14  morph gloss mismatch
  agalan: `zolovexrabal.`
  documented: z-love-x-+e
  parser:     z-love-x-infinity
```

### docs/grammar/numeric-derivation.md:60

```
docs/grammar/numeric-derivation.md:60  morph gloss mismatch
  agalan: `zuhubun geberelonogoxrubul.`
  documented: z-Uhubun | g-friend-x--e-
  parser:     z-Uhubun | g-eberelonogo-x---e-
```

### docs/grammar/numeric-derivation.md:100

```
docs/grammar/numeric-derivation.md:100  morph gloss mismatch
  agalan: `zazawan dabenexradul vejel.`
  documented: z-Azawan | d-commitment-x-+2 | v-see
  parser:     z-Azawan | d-pen-x-two | v-eye
```

### docs/grammar/plan-decision.md:14

```
docs/grammar/plan-decision.md:14  morph gloss mismatch
  agalan: `zazawan howoram vawalal.`
  documented: z-Azawan | h-PLAN-sketch | v-walk
  parser:     z-Azawan | h-plan-sketch | v-walking
```

### docs/grammar/plan-decision.md:34

```
docs/grammar/plan-decision.md:34  morph gloss mismatch
  agalan: `zululon howoral vawalal.`
  documented: z-Ululon | h-PLAN-itinerary | v-walk
  parser:     z-Ululon | h-plan-itinerary | v-walking
```

### docs/grammar/plan-decision.md:51

```
docs/grammar/plan-decision.md:51  morph gloss mismatch
  agalan: `helezom vanunul.`
  documented: h-PREDICT | v-rain
  parser:     h-predict | v-rain
```

### docs/grammar/plan-decision.md:215

```
docs/grammar/plan-decision.md:215  morph gloss mismatch
  agalan: `zazawan howoral hegegel vawalal.`
  documented: z-Azawan | h-PLAN-itinerary | h-DECISION-irreversible | v-walk
  parser:     z-Azawan | h-plan-itinerary | h-DECISION-irreversible | v-walking
```

### docs/grammar/plan-decision.md:226

```
docs/grammar/plan-decision.md:226  morph gloss mismatch
  agalan: `helezom habawam vanunul.`
  documented: h-PREDICT | h-PATTERN | v-rain
  parser:     h-predict | h-PATTERN | v-rain
```

### docs/grammar/plurality.md:13

```
docs/grammar/plurality.md:13  morph gloss mismatch
  agalan: `zazawanx vawalal.`
  documented: z-Azawan-x | v-walk
  parser:     z-Azawan-x | v-walking
```

### docs/grammar/plurality.md:23

```
docs/grammar/plurality.md:23  morph gloss mismatch
  agalan: `zazawarx vajul.`
  documented: z-←Azawan-x | v-sit
  parser:     z-swan-x | v-chair
```

### docs/grammar/plurality.md:31

```
docs/grammar/plurality.md:31  morph gloss mismatch
  agalan: `zagadalx vajul.`
  documented: z-cat-x | v-sit
  parser:     z-cat-x | v-chair
```

### docs/grammar/plurality.md:58

```
docs/grammar/plurality.md:58  morph gloss mismatch
  agalan: `zedonenx vawalal.`
  documented: z-listener-x | v-walk
  parser:     z-listener-x | v-walking
```

### docs/grammar/plurality.md:84

```
docs/grammar/plurality.md:84  morph gloss mismatch
  agalan: `zazawan dugobonx vejel.`
  documented: z-Azawan | d-speaker-x | v-see
  parser:     z-Azawan | d-speaker-x | v-eye
```

### docs/grammar/plurality.md:250

```
docs/grammar/plurality.md:250  morph gloss mismatch
  agalan: `zazawanx vawalal.`
  documented: z-Azawan-x | v-walk
  parser:     z-Azawan-x | v-walking
```

### docs/grammar/predication.md:14

```
docs/grammar/predication.md:14  morph gloss mismatch
  agalan: `zazawan gomonam.`
  documented: z-Azawan | g-challenging
  parser:     z-Azawan | g-challenge
```

### docs/grammar/predication.md:24

```
docs/grammar/predication.md:24  morph gloss mismatch
  agalan: `zazawan gajanan.`
  documented: z-Azawan | g-Japanese
  parser:     z-Azawan | g-Ajanan
```

### docs/grammar/pronouns.md:16

```
docs/grammar/pronouns.md:16  morph gloss mismatch
  agalan: `zazawan vawalal. zazar vajul.`
  documented: z-Azawan | v-walk | z-←Azawan | v-sit
  parser:     z-Azawan | v-walking | z-←Azawan | v-chair
```

### docs/grammar/pronouns.md:24

```
docs/grammar/pronouns.md:24  morph gloss mismatch
  agalan: `zodogol vawalal. zodor vajul.`
  documented: z-dog | v-walk | z-←dog | v-sit
  parser:     z-dog | v-walking | z-←dog | v-chair
```

### docs/grammar/pronouns.md:47

```
docs/grammar/pronouns.md:47  morph gloss mismatch
  agalan: `zululon vawalal.`
  documented: z-Ululon | v-walk
  parser:     z-Ululon | v-walking
```

### docs/grammar/pronouns.md:69

```
docs/grammar/pronouns.md:69  morph gloss mismatch
  agalan: `zahan vawalal.`
  documented: z-interlocutors | v-walk
  parser:     z-interlocutors | v-walking
```

### docs/grammar/pronouns.md:245

```
docs/grammar/pronouns.md:245  morph gloss mismatch
  agalan: `zazawan vawalal. zululon vurunul. xazawar velebel.`
  documented: z-Azawan | v-walk | z-Ululon | v-run | x-←Azawan | v-sleep
  parser:     z-Azawan | v-walking | z-Ululon | v-running | x-←Azawan | v-sleep
```

### docs/grammar/pronouns.md:257

```
docs/grammar/pronouns.md:257  morph gloss mismatch
  agalan: `zazawan vajul. zululon vazar.`
  documented: z-Azawan | v-sit | z-Ululon | v-←Azawan
  parser:     z-Azawan | v-chair | z-Ululon | v-←Azawan
```

### docs/grammar/pronouns.md:275

```
docs/grammar/pronouns.md:275  morph gloss mismatch
  agalan: `zedonenx vajul.`
  documented: z-listener | v-sit
  parser:     z-listener-x | v-chair
```

### docs/grammar/pronouns.md:421

```
docs/grammar/pronouns.md:421  morph gloss mismatch
  agalan: `zodogol vawalal. zawalar gelem.`
  documented: z-dog | v-walk | z-←walk | g-size
  parser:     z-dog | v-walking | z-←walking | g-size
```

### docs/grammar/questions.md:19

```
docs/grammar/questions.md:19  morph gloss mismatch
  agalan: `jol zazawan vawalal?`
  documented: j-question | z-Azawan | v-walk
  parser:     j-question | z-Azawan | v-walking
```

### docs/grammar/questions.md:33

```
docs/grammar/questions.md:33  morph gloss mismatch
  agalan: `jol zal vawalal?`
  documented: j-question | z-none | v-walk
  parser:     j-question | z-and | v-walking
```

### docs/grammar/questions.md:46

```
docs/grammar/questions.md:46  morph gloss mismatch
  agalan: `jol zar vawalal?`
  documented: j-question | z-who | v-walk
  parser:     j-question | z-who | v-walking
```

### docs/grammar/questions.md:80

```
docs/grammar/questions.md:80  morph gloss mismatch
  agalan: `jol zar vejel dar?`
  documented: j-question | z-who | v-see | d-what
  parser:     j-question | z-who | v-eye | d-who
```

### docs/grammar/questions.md:92

```
docs/grammar/questions.md:92  morph gloss mismatch
  agalan: `jol zar vejel dodogol?`
  documented: j-question | z-who | v-see | d-dog
  parser:     j-question | z-who | v-eye | d-dog
```

### docs/grammar/questions.md:150

```
docs/grammar/questions.md:150  morph gloss mismatch
  agalan: `zazawan vawalal. jael.`
  documented: z-Azawan | v-walk | j-yes
  parser:     z-Azawan | v-walking | j-yes
```

### docs/grammar/questions.md:345

```
docs/grammar/questions.md:345  morph gloss mismatch
  agalan: `jol zuhubun vawalal har?`
  documented: j-question | z-Uhubun | v-walk | h-when
  parser:     j-question | z-Uhubun | v-walking | h-never
```

### docs/grammar/questions.md:365

```
docs/grammar/questions.md:365  morph gloss mismatch
  agalan: `jol zazawan zal?`
  documented: j-question | z-Azawan | z-just
  parser:     j-question | z-Azawan | z-and
```

### docs/grammar/questions.md:510

```
docs/grammar/questions.md:510  morph gloss mismatch
  agalan: `jol zazawan zel?`
  documented: j-question | z-Azawan | z-rank
  parser:     j-question | z-Azawan | z-rank/more
```

### docs/grammar/reference-suffix.md:211

```
docs/grammar/reference-suffix.md:211  morph gloss mismatch
  agalan: `zuhubun vuzunun.`
  documented: z-Uhubun | v-Sing
  parser:     z-Uhubun | v-Uzunun
```

### docs/grammar/reference-suffix.md:238

```
docs/grammar/reference-suffix.md:238  morph gloss mismatch
  agalan: `zodunaxalanen vawalal.`
  documented: z-Odunaxalanen | v-walk
  parser:     z-Oduna-x-Alanen | v-walking
```

### docs/grammar/reference-suffix.md:259

```
docs/grammar/reference-suffix.md:259  morph gloss mismatch
  agalan: `zabogon vawalal.`
  documented: z-Abogon | v-walk
  parser:     z-Abogon | v-walking
```

### docs/grammar/reference-suffix.md:270

```
docs/grammar/reference-suffix.md:270  morph gloss mismatch
  agalan: `zabogoxululon.`
  documented: z-Book-Courage
  parser:     z-Abogo-x-Ululon
```

### docs/grammar/restrictors.md:13

```
docs/grammar/restrictors.md:13  morph gloss mismatch
  agalan: `zazawan vawalal hanunul hal.`
  documented: z-Azawan | v-walk | h-rain | h-only-when
  parser:     z-Azawan | v-walking | h-rain | h-only-when
```

### docs/grammar/restrictors.md:21

```
docs/grammar/restrictors.md:21  morph gloss mismatch
  agalan: `zululon vawalal hal.`
  documented: z-Ululon | v-walk | h-never
  parser:     z-Ululon | v-walking | h-never
```

### docs/grammar/restrictors.md:29

```
docs/grammar/restrictors.md:29  morph gloss mismatch
  agalan: `zazawan vawalal hadazam howom.`
  documented: z-Azawan | v-walk | h-haste | h-quietude
  parser:     z-Azawan | v-walking | h-haste | h-quietude
```

### docs/grammar/restrictors.md:63

```
docs/grammar/restrictors.md:63  morph gloss mismatch
  agalan: `zululon vurunul har.`
  documented: z-Ululon | v-run | h-sometimes
  parser:     z-Ululon | v-running | h-never
```

### docs/grammar/restrictors.md:77

```
docs/grammar/restrictors.md:77  morph gloss mismatch
  agalan: `jol zuhubun vawalal hanunul?`
  documented: j-question | z-Uhubun | v-walk | h-rain
  parser:     j-question | z-Uhubun | v-walking | h-rain
```

### docs/grammar/restrictors.md:145

```
docs/grammar/restrictors.md:145  morph gloss mismatch
  agalan: `zazawan velebel hanunul hunugul ham.`
  documented: z-Azawan | v-sleep | h-rain | h-night | h-when.open
  parser:     z-Azawan | v-sleep | h-rain | h-night | h-only-when.open
```

### docs/grammar/restrictors.md:281

```
docs/grammar/restrictors.md:281  morph gloss mismatch
  agalan: `zuhubun vuzunul hadorom zazawan vawalal badorol.`
  documented: z-Uhubun | v-sing | h-next-clause | z-Azawan | v-walk | b-next-clause
  parser:     z-Uhubun | v-sing | h-if | z-Azawan | v-walking | b-next-clause
```

### docs/grammar/restrictors.md:297

```
docs/grammar/restrictors.md:297  morph gloss mismatch
  agalan: `zazawan vawalal hanunul hunugul hol.`
  documented: z-Azawan | v-walk | h-rain | h-night | h-either-when
  parser:     z-Azawan | v-walking | h-rain | h-night | h-when-one
```

### docs/grammar/restrictors.md:332

```
docs/grammar/restrictors.md:332  morph gloss mismatch
  agalan: `zazawan vawalal hamubum hozorem hel.`
  documented: z-Azawan | v-walk | h-emergency | h-convenience | h-preferably-when
  parser:     z-Azawan | v-walking | h-emergency | h-convenience | h-when-ranked
```

### docs/grammar/restrictors.md:349

```
docs/grammar/restrictors.md:349  morph gloss mismatch
  agalan: `zazawan guzumum wanunul wunugul wol.`
  documented: z-Azawan | g-happy | w-rain | w-night | w-either-when
  parser:     z-Azawan | g-happy | w-rain | w-night | w-when-one
```

### docs/grammar/revisers.md:53

```
docs/grammar/revisers.md:53  morph gloss mismatch
  agalan: `zahadal ul zazawan.`
  documented: z-team | except | z-Azawan
  parser:     z-handball | except | z-Azawan
```

### docs/grammar/revisers.md:93

```
docs/grammar/revisers.md:93  morph gloss mismatch
  agalan: `al zazawan vawalal.`
  documented: additionally | z-Azawan | v-walk
  parser:     additionally | z-Azawan | v-walking
```

### docs/grammar/revisers.md:265

```
docs/grammar/revisers.md:265  morph gloss mismatch
  agalan: `zahadal an zazawan.`
  documented: z-team | including.named | z-Azawan
  parser:     z-handball | including.unspecified | z-Azawan
```

### docs/grammar/revisers.md:290

```
docs/grammar/revisers.md:290  morph gloss mismatch
  agalan: `zahadal am zazawan ul zululon.`
  documented: z-team | including.open | z-Azawan | except | z-Ululon
  parser:     z-handball | including.open | z-Azawan | except | z-Ululon
```

### docs/grammar/revisers.md:306

```
docs/grammar/revisers.md:306  morph gloss mismatch
  agalan: `vurunul om vawalal.`
  documented: v-run | instead.open | v-walk
  parser:     v-running | instead.open | v-walking
```

### docs/grammar/revisers.md:330

```
docs/grammar/revisers.md:330  morph gloss mismatch
  agalan: `jazawan al zululon vawalal.`
  documented: j-Azawan | additionally | z-Ululon | v-walk
  parser:     j-Azawan | additionally | z-Ululon | v-walking
```

### docs/grammar/revisers.md:469

```
docs/grammar/revisers.md:469  morph gloss mismatch
  agalan: `z+3 ul z+5 zal gurulel.`
  documented: z-three | except | z-five | z-and | g-measurement
  parser:     z-three | except | z-five | z-and | g-ruler
```

### docs/grammar/roles.md:15

```
docs/grammar/roles.md:15  morph gloss mismatch
  agalan: `zaxuvugul vurunul.`
  documented: z-←agent-x-fight | v-run
  parser:     z-agent-x-fight | v-running
```

### docs/grammar/roles.md:73

```
docs/grammar/roles.md:73  morph gloss mismatch
  agalan: `zazawan duvugul vejel.`
  documented: z-Azawan | d-fight | v-see
  parser:     z-Azawan | d-fight | v-eye
```

### docs/grammar/roles.md:85

```
docs/grammar/roles.md:85  morph gloss mismatch
  agalan: `zazawan gaxuvugum.`
  documented: z-Azawan | g-←agent-x-fight
  parser:     z-Azawan | g-agent-x-fight
```

### docs/grammar/roles.md:230

```
docs/grammar/roles.md:230  morph gloss mismatch
  agalan: `jel vawalal hewezexazawan.`
  documented: j-command | v-walk | h-west-x-Azawan
  parser:     j-command | v-walking | h-Eweze-x-Azawan
```

### docs/grammar/roles.md:238

```
docs/grammar/roles.md:238  morph gloss mismatch
  agalan: `jel vawalal hewezel.`
  documented: j-command | v-walk | h-west
  parser:     j-command | v-walking | h-west
```

### docs/grammar/roles.md:246

```
docs/grammar/roles.md:246  morph gloss mismatch
  agalan: `jel zedonen vawalal hewezexedonen.`
  documented: j-command | z-listener | v-walk | h-west-x-listener
  parser:     j-command | z-listener | v-walking | h-Eweze-x-listener
```

### docs/grammar/roles.md:283

```
docs/grammar/roles.md:283  morph gloss mismatch
  agalan: `jel vawalal habal.`
  documented: j-command | v-walk | h-up
  parser:     j-command | v-walking | h-pray
```

### docs/grammar/roles.md:305

```
docs/grammar/roles.md:305  morph gloss mismatch
  agalan: `zabogol gewezexazawan berel.`
  documented: z-book | g-west-x-Azawan | b-tree
  parser:     z-book | g-Eweze-x-Azawan | b-tree
```

### docs/grammar/roles.md:474

```
docs/grammar/roles.md:474  morph gloss mismatch
  agalan: `zazawan vawalal. xezazal zululon vurunul.`
  documented: z-Azawan | v-walk | x-east | z-Ululon | v-run
  parser:     z-Azawan | v-walking | x-therefore | z-Ululon | v-running
```

### docs/grammar/spans.md:18

```
docs/grammar/spans.md:18  morph gloss mismatch
  agalan: `zazawan d[azawan] vezehel.`
  documented: z-Azawan | d-Azawan | v-tell
  parser:     z-Azawan | d-Azawan | v-speech
```

### docs/grammar/spans.md:55

```
docs/grammar/spans.md:55  morph gloss mismatch
  agalan: `jol zululon d[=] vezehel.`
  documented: j-question | z-Ululon | d-←cite | v-tell
  parser:     j-question | z-Ululon | d-←cite | v-speech
```

### docs/grammar/spans.md:99

```
docs/grammar/spans.md:99  morph gloss mismatch
  agalan: `zazawan vawalal h(huzumum).`
  documented: z-Azawan | v-walk | h-happy
  parser:     z-Azawan | v-walking | h-huzumum
```

### docs/grammar/spans.md:122

```
docs/grammar/spans.md:122  morph gloss mismatch
  agalan: `jul zululon v[vozodol].`
  documented: j-prohibition | z-Ululon | v-halt
  parser:     j-prohibition | z-Ululon | v-vozodol
```

### docs/grammar/spans.md:271

```
docs/grammar/spans.md:271  morph gloss mismatch
  agalan: `zazawan daxol azawan vezehel.`
  documented: z-Azawan | d-cite.atomic | Azawan | v-tell
  parser:     z-Azawan | d-cite-x-atomic | Azawan | v-speech
```

### docs/grammar/spans.md:311

```
docs/grammar/spans.md:311  morph gloss mismatch
  agalan: `zululon daxal zazawan vuzunul xuxul vezehel.`
  documented: z-Ululon | d-cite.multi | z-Azawan | v-sing | x-close | v-tell
  parser:     z-Ululon | d-cite-x-multi | z-Azawan | v-sing | x-span-close | v-speech
```

### docs/grammar/spans.md:555

```
docs/grammar/spans.md:555  morph gloss mismatch
  agalan: `zazawan daxal azawan xuxur vezehel.`
  documented: z-Azawan | d-cite.multi | Azawan | x-close.editorial | v-tell
  parser:     z-Azawan | d-cite-x-multi | Azawan | x-span-close-editorial | v-speech
```

### docs/grammar/special-vocabulary.md:14

```
docs/grammar/special-vocabulary.md:14  morph gloss mismatch
  agalan: `zezehel wolozoxur hogegal hanedel.`
  documented: z-dialogue | w-competence-unmet-temporary | h-HIGH | h-CIRCUM
  parser:     z-speech | w-competence-x-unmet | h-ocean-wave | h-candle
```

### docs/grammar/special-vocabulary.md:58

```
docs/grammar/special-vocabulary.md:58  morph gloss mismatch
  agalan: `zazawan zagegol g#2 vezehel.`
  documented: z-Azawan | z-solution | g-second | v-tell
  parser:     z-Azawan | z-solution | g-second | v-speech
```

### docs/grammar/special-vocabulary.md:211

```
docs/grammar/special-vocabulary.md:211  morph gloss mismatch
  agalan: `zazawan hual vawalal harogul.`
  documented: z-Azawan | h-always | v-walk | h-COMMON
  parser:     z-Azawan | h-always | v-walking | h-COMMON
```

### docs/grammar/values.md:51

```
docs/grammar/values.md:51  morph gloss mismatch
  agalan: `zawaral wonogoxal.`
  documented: z-gift | w-relatedness-met-physical
  parser:     z-wrapped-gift | w-relatedness-x-met
```

### docs/grammar/values.md:70

```
docs/grammar/values.md:70  morph gloss mismatch
  agalan: `zohohul wolozoxal.`
  documented: z-house | w-competence-met-physical
  parser:     z-house | w-competence-x-met
```

### docs/grammar/values.md:95

```
docs/grammar/values.md:95  morph gloss mismatch
  agalan: `zazawan vezehel honogoxom.`
  documented: z-Azawan | v-tell | h-relatedness-ought-endorse
  parser:     z-Azawan | v-speech | h-relatedness-x-prescription
```

### docs/grammar/values.md:120

```
docs/grammar/values.md:120  morph gloss mismatch
  agalan: `zazegel walodoxur.`
  documented: z-gathering | w-autonomy-unmet-temporary
  parser:     z-basket | w-autonomy-x-unmet
```

### docs/grammar/values.md:285

```
docs/grammar/values.md:285  morph gloss mismatch
  agalan: `zazawan vezehel honogoxem.`
  documented: z-Azawan | v-tell | h-relatedness-motive-internal
  parser:     z-Azawan | v-speech | h-relatedness-x-motive
```

### docs/grammar/values.md:327

```
docs/grammar/values.md:327  morph gloss mismatch
  agalan: `zazawan vezehel holozoxal honogoxem.`
  documented: z-Azawan | v-tell | h-competence-met-physical | h-relatedness-motive-internal
  parser:     z-Azawan | v-speech | h-competence-x-met | h-relatedness-x-motive
```

### docs/grammar/x-compounds.md:16

```
docs/grammar/x-compounds.md:16  morph gloss mismatch
  agalan: `zuzuzuxogoven.`
  documented: z-Sushi-Coffee
  parser:     z-Uzuzu-x-Ogoven
```

### docs/grammar/x-compounds.md:192

```
docs/grammar/x-compounds.md:192  morph gloss mismatch
  agalan: `zuzuzuxogovexadedan.`
  documented: z-Sushi-Coffee-Tea
  parser:     z-Uzuzu-x-Ogove-x-Adedan
```
