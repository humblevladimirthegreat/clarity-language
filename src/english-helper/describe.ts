/**
 * English labels for analyzer output, shared by the CLI and the Inspect page's English helper.
 */
import type { Analysis, HelperData, RoleSuggestion, RootSuggestion, Slot, Suggestion, Tier } from "./analyze.js";
import { COMPOUND_LINKS } from "./detectors.js";
import type { ClauseFeatures } from "./tag.js";

/** How a WordNet lead relates to its sense: *similar to glad*, *a kind of sibling*. */
export function leadNote(tier: string, lead: string, via: string | undefined): string {
  if (tier === "synonym") return via === "similar" ? `similar to *${lead}*` : via === "derived" ? `derived from *${lead}*` : `same meaning as *${lead}*`;
  return via ? `a kind of *${via}*, a kind of *${lead}*` : `a kind of *${lead}*`;
}

/** *teach* → *teaches*, *walk* → *walks*, *carry* → *carries*. */
function thirdPerson(verb: string): string {
  if (/(s|sh|ch|x|z|o)$/.test(verb)) return `${verb}es`;
  if (/[^aeiou]y$/.test(verb)) return `${verb.slice(0, -1)}ies`;
  return `${verb}s`;
}

/** *usual role (a dog walker)* or *someone who walks dogs*. */
export function roleReading(s: RoleSuggestion): string {
  return s.usual ? `usual role (a ${s.modifier ? `${s.modifier.english} ` : ""}${s.noun})` : `someone who ${thirdPerson(s.verb)}${s.modifier ? ` ${s.modifier.english}s` : ""}`;
}

/** The clause features the detectors read, as short labels: `past · modal could · negated · statement`. */
export function featureLabels(f: ClauseFeatures): string[] {
  return [
    f.tense ?? "no verb tense",
    f.perfect && "perfect",
    f.progressive && "progressive",
    f.usedTo && "used to",
    f.modals.length && `modal ${f.modals.join("/")}`,
    f.negated && "negated",
    f.question ? "question" : "statement",
  ].filter((x): x is string => typeof x === "string");
}

/** A section title without Markdown marks. */
export function plainTitle(title: string): string {
  return title.replace(/[`*]/g, "");
}

/**
 * One suggestion as the Inspect page shows it: `form` is Agazan (copied on click when `copy`),
 * `note` is English with `*italic*` and `` `code` `` marks, `links` are `page.md#id` sections, and
 * `phrase` is a hook spelled with the landmark after it (copied on click).
 */
export type SuggestionChip = { tier: Tier; emoji?: string; form?: string; copy?: boolean; note: string; links: string[]; phrase?: string };

function senseNote(s: RootSuggestion): string {
  const parts = [s.name ? `name on "${s.sense}" + -n` : `"${s.sense}"`];
  if (s.lead) parts.push(leadNote(s.tier, s.lead, s.via));
  if (s.fromParts) parts.push(`dictionary word for *${s.fromParts.left}* + *${s.fromParts.head}*`);
  return parts.join("; ");
}

export function suggestionChip(s: Suggestion): SuggestionChip {
  switch (s.kind) {
    case "lexicon": {
      const links = [s.anchor, s.fromParts && COMPOUND_LINKS.listed, s.roleLink].filter((l): l is string => !!l);
      return { tier: s.tier, ...(s.emoji ? { emoji: s.emoji } : {}), form: s.word ?? s.form, copy: true, note: senseNote(s), links };
    }
    case "job":
      return { tier: s.tier, form: s.form, note: s.itch, links: [s.link], ...(s.phrase ? { phrase: s.phrase } : {}) };
    case "detector":
      return { tier: s.tier, note: s.label, links: s.links };
    case "entry":
      return { tier: s.tier, form: s.form, note: `"${s.english}"`, links: [s.link], ...(s.phrase ? { phrase: s.phrase } : {}) };
    case "role": {
      const parts = s.modifier ? `${s.modifier.root} + ${s.root}` : s.root;
      return { tier: s.tier, ...(s.emoji ? { emoji: s.emoji } : {}), form: s.form, copy: true, note: `role compound: ${roleReading(s)}; ${parts} "${s.sense}"`, links: [s.link] };
    }
    case "class": {
      if (s.class === "kin") return { tier: s.tier, note: "kin term", links: s.links };
      const animal = s.animal ? `"${s.animal.sense}"` : "the animal's root";
      const note = `${s.class} animal: ${animal} + *${s.class}*`;
      return { tier: s.tier, ...(s.animal?.emoji ? { emoji: s.animal.emoji } : {}), ...(s.phrase ? { form: s.phrase, copy: true } : {}), note, links: s.links };
    }
    case "live":
      return { tier: s.tier, form: s.form, copy: true, note: `${s.parts.map((p) => `"${p.sense}"`).join(" + ")}, built on the spot`, links: [s.link] };
  }
}

/** `page.md#id (Title)`, or the bare link when the section is unknown. */
function linkText(data: HelperData, target: string): string {
  const title = data.sections.get(target)?.title;
  return title ? `${target} (${plainTitle(title)})` : target;
}

/** One suggestion as one line of plain text: the CLI's output, and the skeleton in the helper prompt. */
export function suggestionLine(data: HelperData, s: Suggestion): string {
  const link = (target: string) => linkText(data, target);
  switch (s.kind) {
    case "lexicon": {
      const role = s.role ? `/${s.role}/ ` : "";
      const word = s.word ? `  → \`${s.word}\`` : "";
      const where = s.anchor ? `  ${s.pos ? `on /${s.pos}/ ` : ""}→ ${link(s.anchor)}` : "";
      const byPos = s.roles?.length ? `  [english_by_pos: ${s.roles.join(", ")}]` : "";
      const sense = s.name ? `name on "${s.sense}" + -n` : `"${s.sense}"${s.side ? ` (${s.side})` : ""}`;
      const lead = s.lead ? `  (WordNet lead: ${leadNote(s.tier, s.lead, s.via)})` : "";
      const parts = s.fromParts ? `  (dictionary word for *${s.fromParts.left}* + *${s.fromParts.head}* → ${link(COMPOUND_LINKS.listed)})` : "";
      return `${s.tier.padEnd(8)} ${role}${s.emoji ? `${s.emoji} ` : ""}${s.form}  ${sense}${word}${where}${byPos}${lead}${parts}`;
    }
    case "class": {
      if (s.class === "kin") return `route    kin term  → ${s.links.map(link).join(" · ")}`;
      const animal = s.animal ? `${s.animal.emoji ? `${s.animal.emoji} ` : ""}${s.animal.form} "${s.animal.sense}"${s.animal.word ? ` \`${s.animal.word}\`` : ""}` : "the animal's root";
      const qualifier = s.qualifier ? `${s.qualifier.emoji ? `${s.qualifier.emoji} ` : ""}${s.qualifier.form} *${s.class}*` : `*${s.class}*`;
      const phrase = s.phrase ? `\`${s.phrase}\`  ` : "";
      return `route    ${s.class} animal: ${phrase}${animal} + /ɡ/ ${qualifier}  → ${s.links.map(link).join(" · ")}`;
    }
    case "live": {
      const parts = s.parts.map((p) => `${p.emoji ? `${p.emoji} ` : ""}${p.form} "${p.sense}"`).join(" + ");
      return `live     /${s.role}/ \`${s.form}\`  ${parts}, built on the spot  → ${link(s.link)}`;
    }
    case "job":
      return `${s.itch}  \`${s.form}\`${s.phrase ? `  say \`${s.phrase}\`` : ""}  → ${link(s.link)}`;
    case "detector":
      return `${s.label}  → ${s.links.map(link).join(" · ")}`;
    case "role": {
      const reading = roleReading(s);
      const parts = s.modifier ? `${s.modifier.root} + ${s.root}` : s.root;
      return `route    role compound \`${s.form}\`  ${reading}; ${s.emoji ? `${s.emoji} ` : ""}${parts} "${s.sense}"  → ${link(s.link)}`;
    }
    case "entry":
      return `grammar  \`${s.form}\` "${s.english}"${s.phrase ? `  say \`${s.phrase}\`` : ""}  → ${link(s.link)}`;
  }
}

function slotLines(data: HelperData, slot: Slot, width: number): string[] {
  const head = `  ${slot.text.padEnd(width)}`;
  const reading = slot.reading ? `  (${slot.reading})` : "";
  if (slot.skipped) return [`${head}  (no word of its own)`];
  if (slot.suggestions.length === 0) return [`${head}  gap: no suggestion${reading}`];
  const jobs = slot.suggestions.filter((s) => s.kind === "job");
  const others = slot.suggestions.filter((s) => s.kind !== "job");
  const lines = others.map((s) => suggestionLine(data, s));
  if (jobs.length > 1) lines.push(`${jobs.length} jobs [pick one]:`, ...jobs.map((s) => `  ${suggestionLine(data, s)}`));
  else if (jobs.length === 1) lines.push(suggestionLine(data, jobs[0]!));
  return [`${head}  ${slot.cls}${reading}`, ...lines.map((line) => `  ${" ".repeat(width)}    ${line}`)];
}

/** The whole analysis as plain text: one block per clause, a line per slot and suggestion, then the gaps. */
export function analysisLines(data: HelperData, analysis: Analysis): string[] {
  const out: string[] = [];
  analysis.clauses.forEach((clause, n) => {
    out.push(`clause ${n + 1}  "${clause.text}"   [${featureLabels(clause.features).join(" · ")}]`);
    for (const d of clause.detectors) out.push(`  ${"(clause)".padEnd(10)}  ${suggestionLine(data, d)}`);
    const width = Math.max(8, ...clause.slots.map((s) => s.text.length));
    for (const slot of clause.slots) out.push(...slotLines(data, slot, width));
  });
  if (analysis.gaps.length) {
    out.push("gaps:");
    for (const g of analysis.gaps) out.push(`  ${g.word} (${g.cls}; tried ${g.tried.join(", ")})`);
  }
  return out;
}
