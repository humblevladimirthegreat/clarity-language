/**
 * English labels for analyzer output, shared by the CLI and the Inspect page's English helper.
 */
import type { RoleSuggestion, RootSuggestion, Suggestion, Tier } from "./analyze.js";
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
