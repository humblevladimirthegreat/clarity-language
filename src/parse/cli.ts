#!/usr/bin/env node
import { parse, SentenceParseError } from "./index.js";

const raw = process.argv.slice(2);
const checkAmbiguity = raw.includes("--check-ambiguity");
const text = raw.filter((arg) => arg !== "--check-ambiguity").join(" ").trim();
if (!text) {
  console.error("Usage: npm run parse -- [--check-ambiguity] '<Agelan text>'");
  process.exit(1);
}

try {
  const result = parse(text, undefined, { checkAmbiguity });
  console.log(JSON.stringify(result, null, 2));
} catch (error) {
  if (error instanceof SentenceParseError) {
    console.error(error.message);
    process.exit(1);
  }
  throw error;
}
