#!/usr/bin/env node
import { parse, SentenceParseError } from "./index.js";

const text = process.argv.slice(2).join(" ").trim();
if (!text) {
  console.error("Usage: npm run parse -- '<Agelan text>'");
  process.exit(1);
}

try {
  const result = parse(text);
  console.log(JSON.stringify(result, null, 2));
} catch (error) {
  if (error instanceof SentenceParseError) {
    console.error(error.message);
    process.exit(1);
  }
  throw error;
}
