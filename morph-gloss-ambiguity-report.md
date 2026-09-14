# Morph-gloss report

Editor inventory from `npm run lint:agalan`. Grammar morph lines are **not** auto-retied.
Leftover `--check-ambiguity` hits fail CI. Suspected wrong grammar morph lines are listed here only.

## Leftover `--check-ambiguity`

_None._

## Suspected wrong grammar morph lines

### docs/grammar/causation.md:18

```
docs/grammar/causation.md:18  morph gloss mismatch
  agalan: `zezewel zaom.`
  documented: z-effort | z-and/or.open
  parser:     z-sweat | z-and/or.open
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

### docs/grammar/comparatives.md:50

```
docs/grammar/comparatives.md:50  morph gloss mismatch
  agalan: `zazawan zululon zel gomonam wogegal.`
  documented: z-Azawan | z-Ululon | z-rank/more | g-challenge | w-flood
  parser:     z-Azawan | z-Ululon | z-rank/more | g-challenge | w-ocean-wave
```

### docs/grammar/core.md:405

```
docs/grammar/core.md:405  morph gloss mismatch
  agalan: `hozal bazawan zululon vawalal.`
  documented: h-topic | b-Azawan | z-Ululon | v-walk
  parser:     h-hash | b-Azawan | z-Ululon | v-walk
```

### docs/grammar/numbers.md:315

```
docs/grammar/numbers.md:315  morph gloss mismatch
  agalan: `z+3 gelulun.`
  documented: z-three | g-blue
  parser:     z-three | g-Elulun
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

### docs/grammar/plurality.md:23

```
docs/grammar/plurality.md:23  morph gloss mismatch
  agalan: `zazawarx vajul.`
  documented: z-←Azawan-x | v-chair
  parser:     z-swan-x | v-chair
```

### docs/grammar/predication.md:24

```
docs/grammar/predication.md:24  morph gloss mismatch
  agalan: `zazawan gajanan.`
  documented: z-Azawan | g-Japanese
  parser:     z-Azawan | g-Ajanan
```

### docs/grammar/pronouns.md:275

```
docs/grammar/pronouns.md:275  morph gloss mismatch
  agalan: `zedonenx vajul.`
  documented: z-listener | v-chair
  parser:     z-listener-x | v-chair
```

### docs/grammar/questions.md:80

```
docs/grammar/questions.md:80  morph gloss mismatch
  agalan: `jol zar vejel dar?`
  documented: j-question | z-who | v-eye | d-what
  parser:     j-question | z-who | v-eye | d-who
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
  parser:     z-Oduna-x-Alanen | v-walk
```

### docs/grammar/reference-suffix.md:270

```
docs/grammar/reference-suffix.md:270  morph gloss mismatch
  agalan: `zabogoxululon.`
  documented: z-Book-Courage
  parser:     z-Abogo-x-Ululon
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
  parser:     z-Uhubun | v-sing | h-if | z-Azawan | v-walk | b-next-clause
```

### docs/grammar/restrictors.md:297

```
docs/grammar/restrictors.md:297  morph gloss mismatch
  agalan: `zazawan vawalal hanunul hunugul hol.`
  documented: z-Azawan | v-walk | h-rain | h-night | h-either-when
  parser:     z-Azawan | v-walk | h-rain | h-night | h-when-one
```

### docs/grammar/restrictors.md:332

```
docs/grammar/restrictors.md:332  morph gloss mismatch
  agalan: `zazawan vawalal hamubum hozorem hel.`
  documented: z-Azawan | v-walk | h-emergency | h-convenience | h-preferably-when
  parser:     z-Azawan | v-walk | h-emergency | h-convenience | h-when-ranked
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

### docs/grammar/roles.md:15

```
docs/grammar/roles.md:15  morph gloss mismatch
  agalan: `zaxuvugul vurunul.`
  documented: z-←agent-x-fight | v-run
  parser:     z-agent-x-fight | v-run
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
  parser:     j-command | v-walk | h-Eweze-x-Azawan
```

### docs/grammar/roles.md:246

```
docs/grammar/roles.md:246  morph gloss mismatch
  agalan: `jel zedonen vawalal hewezexedonen.`
  documented: j-command | z-listener | v-walk | h-west-x-listener
  parser:     j-command | z-listener | v-walk | h-Eweze-x-listener
```

### docs/grammar/roles.md:283

```
docs/grammar/roles.md:283  morph gloss mismatch
  agalan: `jel vawalal habal.`
  documented: j-command | v-walk | h-up
  parser:     j-command | v-walk | h-pray
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
  parser:     z-Azawan | v-walk | x-therefore | z-Ululon | v-run
```

### docs/grammar/spans.md:99

```
docs/grammar/spans.md:99  morph gloss mismatch
  agalan: `zazawan vawalal h(huzumum).`
  documented: z-Azawan | v-walk | h-happy
  parser:     z-Azawan | v-walk | h-huzumum
```

### docs/grammar/spans.md:122

```
docs/grammar/spans.md:122  morph gloss mismatch
  agalan: `jul zululon v[vozodol].`
  documented: j-prohibition | z-Ululon | v-halt
  parser:     j-prohibition | z-Ululon | v-vozodol
```

### docs/grammar/special-vocabulary.md:14

```
docs/grammar/special-vocabulary.md:14  morph gloss mismatch
  agalan: `zezehel wolozoxur hogegal hanedel.`
  documented: z-speech | w-competence-unmet-temporary | h-HIGH | h-CIRCUM
  parser:     z-speech | w-competence-x-unmet | h-ocean-wave | h-candle
```

### docs/grammar/values.md:51

```
docs/grammar/values.md:51  morph gloss mismatch
  agalan: `zawaral wonogoxal.`
  documented: z-wrapped-gift | w-relatedness-met-physical
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
  documented: z-Azawan | v-speech | h-relatedness-ought-endorse
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
  documented: z-Azawan | v-speech | h-relatedness-motive-internal
  parser:     z-Azawan | v-speech | h-relatedness-x-motive
```

### docs/grammar/values.md:327

```
docs/grammar/values.md:327  morph gloss mismatch
  agalan: `zazawan vezehel holozoxal honogoxem.`
  documented: z-Azawan | v-speech | h-competence-met-physical | h-relatedness-motive-internal
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
