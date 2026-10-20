/**
 * Test fixtures for converted checkpoints: a small lexicon with the house names, *see*, *sit*
 * and *walk*, and a `### Practice` section with a **New words** bank and every item type that
 * passes all checks.
 */
import { createClassifyTablesFromRows, type ClassifyTables } from "../parse/classify.js";
import { loadDefaultTables } from "../parse/index.js";
import { emptyPosEnglish, parseEnglishByPos } from "../lexicon-search.js";

/**
 * Six rows spelled as the published lexicon spells their emoji, so a retie that respells
 * {@link PRACTICE} and the tests built on it leaves this lexicon in step with them.
 */
export function houseTables(): ClassifyTables {
  const published = [...loadDefaultTables().published.values()];
  const row = (emoji: string, concrete: string, englishByPos = "") => {
    const root = published.find((candidate) => candidate.emoji === emoji)?.root;
    if (!root) throw new Error(`practice fixture: no published row for ${emoji}`);
    return {
      emoji,
      concrete,
      abstract: "",
      root,
      mnemonic: "",
      englishByPos,
      posEnglish: englishByPos ? parseEnglishByPos(englishByPos, { concrete }) : emptyPosEnglish(),
    };
  };
  return createClassifyTablesFromRows(
    [
      row("🦢", "swan"),
      row("🦁", "lion"),
      row("🌺", "hibiscus"),
      row("👁️", "eye", "v:see"),
      row("🪑", "chair", "v:sit"),
      row("🚶", "foot", "v:walk"),
    ],
    [],
  );
}

/** A converted checkpoint with every item type; every check passes on it. */
export const PRACTICE = `### Practice {#beginner-practice}

**Setting:** a park

**New words:**

| English | Egabon | Cue |
|---------|--------|-----|
| *Uzazon* | \`uzazon\` | 🦢 |
| *Olozun* | \`olozun\` | 🦁 |
| *Ehalon* | \`ehalon\` | 🌺 |
| *see* | \`vanobol\` | 👁️ from *eye* |
| *sit* | \`vehuhol\` | 🪑 from *chair* |
| *walk* | \`voworel\` | 🦶 from *foot* |

#### English → Egabon {#beginner-english-to-egabon}

**1.** *Ehalon sees Uzazon.*

::: details Show answer
\`zehalon duzazon vanobol.\`

z-Ehalon | d-Uzazon | v-see

**Also correct:** \`duzazon zehalon vanobol.\`, \`yal zehalon duzazon vanobol.\`
:::

**2.** *Uzazon sits.*

::: details Show answer
\`zuzazon vehuhol.\`

z-Uzazon | v-sit
:::

**3.** *Olozun walks.*

::: details Show answer
\`zolozun voworel.\`

z-Olozun | v-walk
:::

#### Egabon → English {#beginner-egabon-to-english}

**1.** \`zolozun dehalon vanobol.\`

::: details Show answer
z-Olozun | d-Ehalon | v-see

*Olozun sees Ehalon.*
:::

**2.** \`zehalon vehuhol.\`

::: details Show answer
z-Ehalon | v-sit

*Ehalon sits.*
:::

**3.** \`zehalon voworel.\`

::: details Show answer
z-Ehalon | v-walk

*Ehalon walks.*
:::

#### Pick one {#beginner-pick-one}

**1.** *Uzazon sees Olozun.* \`zuzazon dolozun vanobol.\` or \`zolozun duzazon vanobol.\`

::: details Show answer
\`zuzazon dolozun vanobol.\`

z-Uzazon | d-Olozun | v-see

The one who sees takes **z-**.
:::

#### Fix it {#beginner-fix-it}

**1.** *Olozun sees Uzazon.* <!-- lint: error -->\`zuzazon dolozun vanobol.\`

::: details Show answer
\`zolozun duzazon vanobol.\`

z-Olozun | d-Uzazon | v-see

English order put Uzazon first; the seer takes **z-**.
:::

#### What changes {#beginner-what-changes}

**1.** \`zuzazon vehuhol.\` / \`zolozun vehuhol.\`

::: details Show answer
z-Uzazon | v-sit

z-Olozun | v-sit

Who sits changes.
:::
`;
