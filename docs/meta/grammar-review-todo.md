# Grammar review TODOs

Open review items moved out of the learner-facing pages under `docs/grammar/` (grammar pages must not carry editor notes). Each entry names its source page. Resolve an item by editing that page; this file is the queue, not design authority.

## Language-design decisions

| Page | Item |
|------|------|
| `commentary.md` | Replace the **-n** COMMENT hold (“named loop”) with the usual proper reading |
| `commentary.md` | Remove the **-n** distinction on NOTIONAL hold endings |
| `coordination.md` | ~~Come up with new readings for `zel`, `zem`, `zuem`, `zuel`~~ **done**: bare **e** = no favorite (`zel` / `zem` *I'm easy*); bare **ue** = no least / no veto (`zuel` / `zuem` *I don't mind*) |
| `plurality.md` | Consider removing **-sh** on verbs; examples are hard to come by, so it may not be needed |
| `plurality.md` | Consider removing the Advanced learning band |
| `roles.md` | Think of ways to remove the temptation to use bare spatial left/right; may require rethinking the whole viewpoint-lateral feature |
| `spans.md` | Consider changing the slash escape to just opaque |

## Structure / ownership

| Page | Item |
|------|------|
| `plan-decision.md` | Consider whether plan/predict should be Beginner level |
| `special-vocabulary.md` | Is the CAUSE section needed here, or should it move into `causation.md`? |

## Tooling / site

| Page | Item |
|------|------|
| `roles.md` | Figure out why the page 404s on the web deploy |

## Follow-ups from applied changes

- ~~**spans close flavors renamed**~~ **done**: parser regenerated with `editorial` / `proper` (`SpanCloseFlavor` in `src/parse/types.ts`, `grammar/word.peggy`, `src/generated/word-parser.js`); typecheck and the full test suite pass.