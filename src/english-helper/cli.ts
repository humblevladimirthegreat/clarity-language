/**
 * English → Agazan helper: per-clause root and grammar suggestions for English input.
 *
 *   node scripts/english-helper.mjs 'My sister could not come.'
 *   node scripts/english-helper.mjs 'He saw/n the saw.' --stage beginner
 *   node scripts/english-helper.mjs 'Azawan walks.' --json
 *
 * Suggestion-only: it never writes the Agazan sentence. A word with several jobs lists them
 * all; pick by meaning and open the linked section. Force a reading with `word/n`, `/v`,
 * `/adj` or `/adv`. Words with no suggestion are listed as gaps with the forms tried.
 */
import { BANDS, type Band } from "../lint/learning-order.js";
import { analyzeEnglish, slotTier, type Analysis, type HelperData, type Slot, type Suggestion } from "./analyze.js";
import { featureLabels, leadNote, plainTitle, roleReading } from "./describe.js";
import { COMPOUND_LINKS } from "./detectors.js";
import { loadHelperData } from "./load.js";

function usage(message: string, code = 2): never {
  console.error(`${message}\nusage: english-helper.mjs '<english>' ['<english>'…] [--json] [--stage ${BANDS.join("|")}]`);
  process.exit(code);
}

const inputs: string[] = [];
let json = false;
let stage: Band | undefined;
const args = process.argv.slice(2);
for (let i = 0; i < args.length; i++) {
  const arg = args[i]!;
  if (arg === "--json") json = true;
  else if (arg === "--stage") {
    const value = args[++i];
    if (!BANDS.includes(value as Band)) usage(`--stage needs one of ${BANDS.join(", ")}`);
    stage = value as Band;
  } else if (arg === "--help" || arg === "-h") usage("Suggest Agazan roots and grammar sections for English.", 0);
  else if (arg.startsWith("--")) usage(`unknown flag ${arg}`);
  else inputs.push(arg);
}
if (inputs.length === 0) usage("give at least one English sentence");

const data = loadHelperData();
const results = inputs.map((input) => ({ input, analysis: analyzeEnglish(data, input, { stage }) }));

function link(data: HelperData, target: string): string {
  const title = data.sections.get(target)?.title;
  return title ? `${target} (${plainTitle(title)})` : target;
}

function suggestionLine(data: HelperData, s: Suggestion): string {
  switch (s.kind) {
    case "lexicon": {
      const role = s.role ? `/${s.role}/ ` : "";
      const word = s.word ? `  → \`${s.word}\`` : "";
      const where = s.anchor ? `  ${s.pos ? `on /${s.pos}/ ` : ""}→ ${link(data, s.anchor)}` : "";
      const byPos = s.roles?.length ? `  [english_by_pos: ${s.roles.join(", ")}]` : "";
      const sense = s.name ? `name on "${s.sense}" + -n` : `"${s.sense}"${s.side ? ` (${s.side})` : ""}`;
      const lead = s.lead ? `  (WordNet lead: ${leadNote(s.tier, s.lead, s.via)})` : "";
      const parts = s.fromParts ? `  (dictionary word for *${s.fromParts.left}* + *${s.fromParts.head}* → ${link(data, COMPOUND_LINKS.listed)})` : "";
      return `${s.tier.padEnd(8)} ${role}${s.emoji ? `${s.emoji} ` : ""}${s.form}  ${sense}${word}${where}${byPos}${lead}${parts}`;
    }
    case "class": {
      if (s.class === "kin") return `route    kin term  → ${s.links.map((l) => link(data, l)).join(" · ")}`;
      const animal = s.animal ? `${s.animal.emoji ? `${s.animal.emoji} ` : ""}${s.animal.form} "${s.animal.sense}"${s.animal.word ? ` \`${s.animal.word}\`` : ""}` : "the animal's root";
      const qualifier = s.qualifier ? `${s.qualifier.emoji ? `${s.qualifier.emoji} ` : ""}${s.qualifier.form} *${s.class}*` : `*${s.class}*`;
      const phrase = s.phrase ? `\`${s.phrase}\`  ` : "";
      return `route    ${s.class} animal: ${phrase}${animal} + /ɡ/ ${qualifier}  → ${s.links.map((l) => link(data, l)).join(" · ")}`;
    }
    case "live": {
      const parts = s.parts.map((p) => `${p.emoji ? `${p.emoji} ` : ""}${p.form} "${p.sense}"`).join(" + ");
      return `live     /${s.role}/ \`${s.form}\`  ${parts}, built on the spot  → ${link(data, s.link)}`;
    }
    case "job":
      return `${s.itch}  \`${s.form}\`${s.phrase ? `  say \`${s.phrase}\`` : ""}  → ${link(data, s.link)}`;
    case "detector":
      return `${s.label}  → ${s.links.map((l) => link(data, l)).join(" · ")}`;
    case "role": {
      const reading = roleReading(s);
      const parts = s.modifier ? `${s.modifier.root} + ${s.root}` : s.root;
      return `route    role compound \`${s.form}\`  ${reading}; ${s.emoji ? `${s.emoji} ` : ""}${parts} "${s.sense}"  → ${link(data, s.link)}`;
    }
    case "entry":
      return `grammar  \`${s.form}\` "${s.english}"${s.phrase ? `  say \`${s.phrase}\`` : ""}  → ${link(data, s.link)}`;
  }
}

function featureLine(analysis: Analysis["clauses"][number]): string {
  return featureLabels(analysis.features).join(" · ");
}

function printSlot(slot: Slot, width: number): void {
  const head = `  ${slot.text.padEnd(width)}`;
  const reading = slot.reading ? `  (${slot.reading})` : "";
  if (slot.skipped) {
    console.log(`${head}  (no word of its own)`);
    return;
  }
  if (slot.suggestions.length === 0) {
    console.log(`${head}  gap: no suggestion${reading}`);
    return;
  }
  const jobs = slot.suggestions.filter((s) => s.kind === "job");
  const others = slot.suggestions.filter((s) => s.kind !== "job");
  const lines = others.map((s) => suggestionLine(data, s));
  if (jobs.length > 1) lines.push(`${jobs.length} jobs [pick one]:`, ...jobs.map((s) => `  ${suggestionLine(data, s)}`));
  else if (jobs.length === 1) lines.push(suggestionLine(data, jobs[0]!));
  console.log(`${head}  ${slot.cls}${reading}`);
  for (const line of lines) console.log(`  ${" ".repeat(width)}    ${line}`);
}

if (json) {
  console.log(JSON.stringify(results, (key, value) => (key === "tags" ? undefined : value), 2));
} else {
  for (const { input, analysis } of results) {
    if (inputs.length > 1) console.log(`== ${input}`);
    analysis.clauses.forEach((clause, n) => {
      console.log(`clause ${n + 1}  "${clause.text}"   [${featureLine(clause)}]`);
      for (const d of clause.detectors) console.log(`  ${"(clause)".padEnd(10)}  ${suggestionLine(data, d)}`);
      const width = Math.max(8, ...clause.slots.map((s) => s.text.length));
      for (const slot of clause.slots) printSlot(slot, width);
    });
    if (analysis.gaps.length) {
      console.log("gaps:");
      for (const g of analysis.gaps) console.log(`  ${g.word} (${g.cls}; tried ${g.tried.join(", ")})`);
    }
    const tally = new Map<string, number>();
    for (const slot of analysis.clauses.flatMap((c) => c.slots)) tally.set(slotTier(slot), (tally.get(slotTier(slot)) ?? 0) + 1);
    console.log(`tiers: ${[...tally].map(([t, n]) => `${t} ${n}`).join(", ")}`);
    if (inputs.length > 1) console.log();
  }
}
