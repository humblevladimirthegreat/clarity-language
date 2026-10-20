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

| English | Agebon | Cue |
|---------|--------|-----|
| *Uzozen* | \`uzozen\` | 🦢 |
| *Olazun* | \`olazun\` | 🦁 |
| *Ahelan* | \`ahelan\` | 🌺 |
| *see* | \`vawebol\` | 👁️ from *eye* |
| *sit* | \`vuhohol\` | 🪑 from *chair* |
| *walk* | \`vowurel\` | 🦶 from *foot* |

#### English → Agebon {#beginner-english-to-agebon}

**1.** *Ahelan sees Uzozen.*

::: details Show answer
\`zahelan duzozen vawebol.\`

z-Ahelan | d-Uzozen | v-see

**Also correct:** \`duzozen zahelan vawebol.\`, \`yal zahelan duzozen vawebol.\`
:::

**2.** *Uzozen sits.*

::: details Show answer
\`zuzozen vuhohol.\`

z-Uzozen | v-sit
:::

**3.** *Olazun walks.*

::: details Show answer
\`zolazun vowurel.\`

z-Olazun | v-walk
:::

#### Agebon → English {#beginner-agebon-to-english}

**1.** \`zolazun dahelan vawebol.\`

::: details Show answer
z-Olazun | d-Ahelan | v-see

*Olazun sees Ahelan.*
:::

**2.** \`zahelan vuhohol.\`

::: details Show answer
z-Ahelan | v-sit

*Ahelan sits.*
:::

**3.** \`zahelan vowurel.\`

::: details Show answer
z-Ahelan | v-walk

*Ahelan walks.*
:::

#### Pick one {#beginner-pick-one}

**1.** *Uzozen sees Olazun.* \`zuzozen dolazun vawebol.\` or \`zolazun duzozen vawebol.\`

::: details Show answer
\`zuzozen dolazun vawebol.\`

z-Uzozen | d-Olazun | v-see

The one who sees takes **z-**.
:::

#### Fix it {#beginner-fix-it}

**1.** *Olazun sees Uzozen.* <!-- lint: error -->\`zuzozen dolazun vawebol.\`

::: details Show answer
\`zolazun duzozen vawebol.\`

z-Olazun | d-Uzozen | v-see

English order put Uzozen first; the seer takes **z-**.
:::

#### What changes {#beginner-what-changes}

**1.** \`zuzozen vuhohol.\` / \`zolazun vuhohol.\`

::: details Show answer
z-Uzozen | v-sit

z-Olazun | v-sit

Who sits changes.
:::
`;
