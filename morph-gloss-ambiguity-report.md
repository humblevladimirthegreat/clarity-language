# Morph-gloss report

Editor inventory from `npm run lint:agalan`. Grammar morph lines are **not** auto-retied.
Leftover `--check-ambiguity` hits fail CI. Suspected wrong grammar morph lines are listed here only.

## Leftover `--check-ambiguity`

_None._

## Suspected wrong grammar morph lines

### docs/grammar/numeric-derivation.md:60

```
docs/grammar/numeric-derivation.md:60  morph gloss mismatch
  agalan: `zuhubun geberelonogoxrubul.`
  documented: z-Uhubun | g-friend-x--e-
  parser:     z-Uhubun | g-eberelonogo-x---e-
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

### docs/grammar/roles.md:305

```
docs/grammar/roles.md:305  morph gloss mismatch
  agalan: `zabogol gewezexazawan berel.`
  documented: z-book | g-west-x-Azawan | b-tree
  parser:     z-book | g-Eweze-x-Azawan | b-tree
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
  agalan: `zazegem walodoxur.`
  documented: z-gathering | w-autonomy-unmet-temporary
  parser:     z-gathering | w-autonomy-x-unmet
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
