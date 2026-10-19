// Claritish editor data (docs/meta/grammar-docs.md#claritish-track, journal editor): every flow choice resolves to a
// cheat sheet cell, every trigger is well formed, and each cued lesson's gap is covered.
// The checks live in src/claritish-editor/data.ts, which the editor page loads too.
import { buildEditorData } from "../src/claritish-editor/data.js";

const { data, problems } = buildEditorData();

if (problems.length) {
  console.error(`Claritish editor data has ${problems.length} problem(s):`);
  for (const p of problems) console.error(`  ${p}`);
  process.exitCode = 1;
} else {
  const outcomes = Object.values(data.flows).reduce((n, f) => n + Object.keys(f.outcomes).length, 0);
  console.log(`OK: ${data.triggers.length} trigger(s) in ${data.lessons.length} lesson(s); ${Object.keys(data.flows).length} flow(s) resolve to ${outcomes} form(s) on the cheat sheet.`);
}
