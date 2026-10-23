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

| English | Ageben | Cue |
|---------|--------|-----|
| *Azozon* | \`azozon\` | 🦢 |
| *Alazun* | \`alazun\` | 🦁 |
| *Ahelan* | \`ahelan\` | 🌺 |
| *see* | \`vayebel\` | 👁️ from *eye* |
| *sit* | \`vehohel\` | 🪑 from *chair* |
| *walk* | \`vowurol\` | 🦶 from *foot* |

#### English → Ageben {#beginner-english-to-ageben}

**1.** *Ahelan sees Azozon.*

::: details Show answer
\`zahelan dazozon vayebel.\`

z-Ahelan | d-Azozon | v-see

**Also correct:** \`dazozon zahelan vayebel.\`, \`yal zahelan dazozon vayebel.\`
:::

**2.** *Azozon sits.*

::: details Show answer
\`zazozon vehohel.\`

z-Azozon | v-sit
:::

**3.** *Alazun walks.*

::: details Show answer
\`zalazun vowurol.\`

z-Alazun | v-walk
:::

#### Ageben → English {#beginner-ageben-to-english}

**1.** \`zalazun dahelan vayebel.\`

::: details Show answer
z-Alazun | d-Ahelan | v-see

*Alazun sees Ahelan.*
:::

**2.** \`zahelan vehohel.\`

::: details Show answer
z-Ahelan | v-sit

*Ahelan sits.*
:::

**3.** \`zahelan vowurol.\`

::: details Show answer
z-Ahelan | v-walk

*Ahelan walks.*
:::

#### Pick one {#beginner-pick-one}

**1.** *Azozon sees Alazun.* \`zazozon dalazun vayebel.\` or \`zalazun dazozon vayebel.\`

::: details Show answer
\`zazozon dalazun vayebel.\`

z-Azozon | d-Alazun | v-see

The one who sees takes **z-**.
:::

#### Fix it {#beginner-fix-it}

**1.** *Alazun sees Azozon.* <!-- lint: error -->\`zazozon dalazun vayebel.\`

::: details Show answer
\`zalazun dazozon vayebel.\`

z-Alazun | d-Azozon | v-see

English order put Azozon first; the seer takes **z-**.
:::

#### What changes {#beginner-what-changes}

**1.** \`zazozon vehohel.\` / \`zalazun vehohel.\`

::: details Show answer
z-Azozon | v-sit

z-Alazun | v-sit

Who sits changes.
:::
`;
