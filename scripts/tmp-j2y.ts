// One-off j → y respell for turn letter, number words, spoken number syllables, gloss prefixes.
// Content roots keep j. Usage: tsx j2y.ts [--write] [--raw] files...
import { readFileSync, writeFileSync } from "node:fs";
import { parseWord } from "../src/parse/word.js";
import { rewriteMarkdownCores } from "../src/retie/tokens.js";

const args = process.argv.slice(2);
const write = args.includes("--write");
const raw = args.includes("--raw");
const files = args.filter((a) => !a.startsWith("--"));

function tryParse(core: string) {
  try {
    return parseWord(core);
  } catch {
    return null;
  }
}

export function rewriteCore(core: string): string | null {
  if (!core.includes("j")) return null;
  // Morph-gloss PoS prefix: j-question, jl-…
  const gloss = /^j(l?-)/.exec(core);
  if (gloss && !tryParse(core)) return "y" + core.slice(1);
  const word = tryParse(core);
  if (!word) return null;
  if (word.family.kind === "number") {
    const out = core.replace(/j/g, "y");
    return out === core ? null : out;
  }
  if (core.startsWith("j") && word.pos === "y") return "y" + core.slice(1);
  return null;
}

let total = 0;
for (const file of files) {
  const input = readFileSync(file, "utf8");
  let text: string;
  const changes: { from: string; to: string }[] = [];
  if (raw) {
    text = input.replace(/[A-Za-z0-9+#_~@=%\-]{2,}/g, (tok) => {
      const out = rewriteCore(tok);
      if (out) changes.push({ from: tok, to: out });
      return out ?? tok;
    });
  } else {
    const res = rewriteMarkdownCores(input, rewriteCore);
    text = res.text;
    changes.push(...res.changes);
  }
  if (changes.length === 0) continue;
  total += changes.length;
  const tally = new Map<string, number>();
  for (const c of changes) tally.set(`${c.from} → ${c.to}`, (tally.get(`${c.from} → ${c.to}`) ?? 0) + 1);
  console.log(`${file}: ${changes.length}`);
  for (const [k, n] of tally) console.log(`  ${k}${n > 1 ? ` ×${n}` : ""}`);
  if (write) writeFileSync(file, text);
}
console.error(`total ${total}${write ? " (written)" : " (dry run)"}`);
