import { parseSentence, treeToString } from "./index.js";

const input = process.argv.slice(2).join(" ").trim();

if (!input) {
  console.error("Usage: npm run parse -- <clarity text>");
  console.error('Example: npm run parse -- "Hawolel bamol deram, bohuzel ram."');
  process.exit(1);
}

const result = parseSentence(input);
console.log(treeToString(result));
