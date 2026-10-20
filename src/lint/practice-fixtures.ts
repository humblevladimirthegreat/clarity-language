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
| *Uzozen* | \`uzozen\` | 🦢 |
| *Olazun* | \`olazun\` | 🦁 |
| *Uhelan* | \`uhelan\` | 🌺 |
| *see* | \`vawebol\` | 👁️ from *eye* |
| *sit* | \`vuhohol\` | 🪑 from *chair* |
| *walk* | \`vewurel\` | 🦶 from *foot* |

#### English → Egabon {#beginner-english-to-egabon}

**1.** *Uhelan sees Uzozen.*

::: details Show answer
\`zuhelan duzozen vawebol.\`

z-Uhelan | d-Uzozen | v-see

**Also correct:** \`duzozen zuhelan vawebol.\`, \`yal zuhelan duzozen vawebol.\`
:::

**2.** *Uzozen sits.*

::: details Show answer
\`zuzozen vuhohol.\`

z-Uzozen | v-sit
:::

**3.** *Olazun walks.*

::: details Show answer
\`zolazun vewurel.\`

z-Olazun | v-walk
:::

#### Egabon → English {#beginner-egabon-to-english}

**1.** \`zolazun duhelan vawebol.\`

::: details Show answer
z-Olazun | d-Uhelan | v-see

*Olazun sees Uhelan.*
:::

**2.** \`zuhelan vuhohol.\`

::: details Show answer
z-Uhelan | v-sit

*Uhelan sits.*
:::

**3.** \`zuhelan vewurel.\`

::: details Show answer
z-Uhelan | v-walk

*Uhelan walks.*
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
