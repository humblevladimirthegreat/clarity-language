// Warns on a hand-written .ts / .mjs file over the line ceiling (docs/meta/code-layout.md#limits).
// A warning, never a failure: the build and `npm run verify` print each `warning: ` line and pass.
import { filesOver } from "./lib/deps.js";

const CEILING = 1500;
const ANCHOR = "docs/meta/code-layout.md#limits";

const over = filesOver(CEILING);

for (const { file, lines } of over) {
  console.log(
    `warning: ${file}:${CEILING + 1}  ${lines} lines, over the ${CEILING}-line ceiling; split it at the next clean point, never squeeze code or put it in an unrelated file to stay under (${ANCHOR})`,
  );
}
if (!over.length) console.log(`OK: every source file is within ${CEILING} lines.`);
