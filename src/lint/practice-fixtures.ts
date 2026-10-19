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

| English | Agazan | Cue |
|---------|--------|-----|
| *Azawan* | \`azawan\` | 🦢 |
| *Alahen* | \`alahen\` | 🦁 |
| *Ahaben* | \`ahaben\` | 🌺 |
| *see* | \`vahahal\` | 👁️ from *eye* |
| *sit* | \`vehahel\` | 🪑 from *chair* |
| *walk* | \`vowogal\` | 🦶 from *foot* |

#### English → Agazan {#beginner-english-to-agazan}

**1.** *Ahaben sees Azawan.*

::: details Show answer
\`zahaben dazawan vahahal.\`

z-Ahaben | d-Azawan | v-see

**Also correct:** \`dazawan zahaben vahahal.\`, \`yal zahaben dazawan vahahal.\`
:::

**2.** *Azawan sits.*

::: details Show answer
\`zazawan vehahel.\`

z-Azawan | v-sit
:::

**3.** *Alahen walks.*

::: details Show answer
\`zalahen vowogal.\`

z-Alahen | v-walk
:::

#### Agazan → English {#beginner-agazan-to-english}

**1.** \`zalahen dahaben vahahal.\`

::: details Show answer
z-Alahen | d-Ahaben | v-see

*Alahen sees Ahaben.*
:::

**2.** \`zahaben vehahel.\`

::: details Show answer
z-Ahaben | v-sit

*Ahaben sits.*
:::

**3.** \`zahaben vowogal.\`

::: details Show answer
z-Ahaben | v-walk

*Ahaben walks.*
:::

#### Pick one {#beginner-pick-one}

**1.** *Azawan sees Alahen.* \`zazawan dalahen vahahal.\` or \`zalahen dazawan vahahal.\`

::: details Show answer
\`zazawan dalahen vahahal.\`

z-Azawan | d-Alahen | v-see

The one who sees takes **z-**.
:::

#### Fix it {#beginner-fix-it}

**1.** *Alahen sees Azawan.* <!-- lint: error -->\`zazawan dalahen vahahal.\`

::: details Show answer
\`zalahen dazawan vahahal.\`

z-Alahen | d-Azawan | v-see

English order put Azawan first; the seer takes **z-**.
:::

#### What changes {#beginner-what-changes}

**1.** \`zazawan vehahel.\` / \`zalahen vehahel.\`

::: details Show answer
z-Azawan | v-sit

z-Alahen | v-sit

Who sits changes.
:::
`;
