#!/usr/bin/env node
import { previewPhonemes, previewSpeech, skipLabel } from "./plan.js";

const text = process.argv.slice(2).join(" ").trim();
if (!text) {
  console.error('Usage: npm run speak -- \'<Agelan text>\'');
  process.exit(1);
}

const speech = previewSpeech(text);
const phonemes = previewPhonemes(text);

if (speech.spoken.length === 0) {
  console.log("Nothing to speak.");
} else {
  console.log(`Spoken: ${speech.spoken.join(" ")}`);
  console.log(`IPA: ${phonemes.words.map((w) => w.ipa).join("  ")}`);
  console.log(`Engine: ${phonemes.engineText}`);
}

const notable = speech.skipped;
if (notable.length) {
  console.log("Skipped:");
  for (const item of notable) {
    console.log(`  ${item.raw} — ${skipLabel(item.reason)}`);
  }
}
