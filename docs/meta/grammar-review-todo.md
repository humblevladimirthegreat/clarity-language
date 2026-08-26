# Grammar review TODOs

Open review items moved out of the learner-facing pages under `docs/grammar/` (grammar pages must not carry editor notes). Each entry names its source page. Resolve an item by editing that page; this file is the queue, not design authority.

## Language-design decisions

| Page | Item |
|------|------|
| `commentary.md` | Replace the **-n** COMMENT hold (“named loop”) with the usual proper reading |
| `commentary.md` | Remove the **-n** distinction on NOTIONAL hold endings |
| `coordination.md` | Come up with new readings for `zel`, `zem`, `zuem`, `zuel`; keep a consistent distinction between bare **-e-** (no descending order) and **-ue** (no ascending order) |
| `coordination.md` | Remove the two-beat frame echo feature from docs and parser |
| `plurality.md` | Consider removing **-sh** on verbs; examples are hard to come by, so it may not be needed |
| `plurality.md` | Consider removing the Advanced learning band |
| `roles.md` | Think of ways to remove the temptation to use bare spatial left/right; may require rethinking the whole viewpoint-lateral feature |
| `spans.md` | Consider changing the slash escape to just opaque |
| `numbers.md` | Introduce pronunciation and labels in Beginner; move the numeric short form to Intermediate |

## Structure / ownership

| Page | Item |
|------|------|
| `numbers.md` | Consider moving measurements, time, date into a new file |
| `plan-decision.md` | Consider whether plan/predict should be Beginner level |
| `special-vocabulary.md` | Is the CAUSE section needed here, or should it move into `causation.md`? |

## Content gaps (small)

| Page | Item |
|------|------|
| `pronouns.md` | Give an example (special pronouns section) |
| `pronouns.md` | Add a self-address example choosing some name |
| `values.md` | Add a mnemonic column for which letter means what |
| `vowel-series.md` | Explain stacks and how they relate to stacked **j** |
| `why-agelan.md` | Choose a different opening example (the *I think* one) |
| `why-agelan.md` | Separate the feature sections into short paragraphs with more natural wording |
| `why-agelan.md` | Avoid giving exact Agelan forms in the feature overview; describe them and link to the grammar docs |

## Tooling / site

| Page | Item |
|------|------|
| `roles.md` | Figure out why the page 404s on the web deploy |

## Follow-ups from applied changes

- **spans close flavors renamed** (`xuxur` truncated → editorial; `xuxun` reserved as proper close): the parser still uses the old names — update `SpanCloseFlavor` (`"truncated" | "sic"`) in `src/parse/types.ts` and regenerate `src/generated/word-parser.js` to match (`editorial`, `proper`).