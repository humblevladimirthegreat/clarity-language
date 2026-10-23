/**
 * Pinned analyzer behavior (cases.tsv): one line per behavior, English, the slot word, and an
 * expectation. Expectations name senses, sections and closed words, never root spellings, so a
 * retie never breaks them. analyze.test.ts runs the file; a worklist fix adds a line.
 *
 *   link:<page.md#id>   some suggestion links this section
 *   not:<page.md#id>    no suggestion links this section
 *   first:<kind>        the first suggestion is of this kind, tier, or detector id
 *   has:<kind>          some suggestion is of this kind, tier, or detector id
 *   sense:<sense>       a root with this English sense is suggested
 *   form:<word>         this closed word (a number word, a pronoun) is spelled
 *   scope:<seam>:<sense> a label-scope job spells its seam (`thao`) on a root with this sense
 *   sake:<role>-<stance><ending> a sake row spells a word of this shape (`g-thar`, `w-thur`; `none` for no word)
 *   no-gap              the word gets a suggestion, or is skipped as clause grammar
 *
 * An empty slot names the sentence's clause detectors (tense, question).
 */
import { splitSenses } from "./lexicon.js";
import { scopeSeam, suggestionLinks, type Analysis, type Suggestion } from "./analyze.js";

export type Case = { line: number; english: string; slot: string; expect: string; why: string };

export const CASE_KINDS = ["link", "not", "first", "has", "sense", "form", "scope", "sake", "no-gap"] as const;

/** Lines of cases.tsv: a header, `#` comments, and `english \t slot \t expect \t why` rows. */
export function parseCases(tsv: string): Case[] {
  const out: Case[] = [];
  tsv.split("\n").forEach((text, k) => {
    if (!text.trim() || text.startsWith("#") || k === 0) return;
    const [english = "", slot = "", expect = "", why = ""] = text.split("\t");
    out.push({ line: k + 1, english, slot, expect, why });
  });
  return out;
}

/** What a suggestion is, for `first:` and `has:`: its kind, its tier, and a detector's id. */
function kindsOf(s: Suggestion): string[] {
  return [s.kind, s.tier, ...(s.kind === "detector" ? [s.id] : [])];
}

/** The English senses a suggestion's roots carry. */
function sensesOf(s: Suggestion): string[] {
  const cells =
    s.kind === "lexicon"
      ? [s.sense, s.senses?.concrete, s.senses?.abstract]
      : s.kind === "role"
        ? [s.sense]
        : s.kind === "live"
          ? s.parts.map((p) => p.sense)
          : s.kind === "class"
            ? [s.animal?.sense, s.qualifier?.sense]
            : [];
  return cells.flatMap((c) => (c ? splitSenses(c) : []));
}

/** Every Ageben word a suggestion spells. */
function wordsOf(s: Suggestion): string[] {
  const texts =
    s.kind === "lexicon"
      ? [s.word, ...(s.sideWords ?? []).map((w) => w.word)]
      : s.kind === "class"
        ? [s.phrase]
        : s.kind === "job" || s.kind === "entry"
          ? [s.form, s.phrase]
          : [s.form];
  return texts.flatMap((t) => (t ? t.split(/\s+\/\s+|\s+/) : []));
}

/** Why the case fails, or undefined when it holds. */
export function checkCase(analysis: Analysis, c: Case): string | undefined {
  const [kind, ...rest] = c.expect.split(":");
  const value = rest.join(":");
  if (!(CASE_KINDS as readonly string[]).includes(kind!)) return `unknown expectation ${c.expect}`;
  let suggestions: Suggestion[];
  if (!c.slot) suggestions = analysis.clauses.flatMap((cl) => cl.detectors);
  else {
    const slot = analysis.clauses.flatMap((cl) => cl.slots).find((s) => s.text.toLowerCase() === c.slot.toLowerCase());
    if (!slot) return `no slot *${c.slot}* (slots: ${analysis.clauses.flatMap((cl) => cl.slots.map((s) => s.text)).join(", ")})`;
    if (kind === "no-gap") return slot.skipped || slot.suggestions.length ? undefined : "no suggestion";
    suggestions = slot.suggestions;
  }
  const shown = () => suggestions.map((s) => kindsOf(s).join("/")).join(", ") || "none";
  switch (kind) {
    case "link":
      return suggestions.some((s) => suggestionLinks(s).includes(value)) ? undefined : `links ${[...new Set(suggestions.flatMap(suggestionLinks))].join(", ") || "nothing"}`;
    case "not":
      return suggestions.some((s) => suggestionLinks(s).includes(value)) ? "links it" : undefined;
    case "first":
      return suggestions[0] && kindsOf(suggestions[0]).includes(value) ? undefined : `suggestions: ${shown()}`;
    case "has":
      return suggestions.some((s) => kindsOf(s).includes(value)) ? undefined : `suggestions: ${shown()}`;
    case "sense":
      return suggestions.some((s) => sensesOf(s).includes(value.toLowerCase())) ? undefined : `senses: ${[...new Set(suggestions.flatMap(sensesOf))].join(", ") || "none"}`;
    case "form":
      return suggestions.some((s) => wordsOf(s).includes(value)) ? undefined : `spells ${[...new Set(suggestions.flatMap(wordsOf))].join(" ") || "nothing"}`;
    case "sake": {
      const spelled = suggestions.flatMap((s) => (s.kind === "job" || s.kind === "entry") && s.link === "sakes.md#sake-inventory" && s.phrase ? [s.phrase] : []);
      if (value === "none") return spelled.length ? `spells ${spelled.join(" ")}` : undefined;
      const [role = "", tail = ""] = value.split("-");
      return spelled.some((w) => w.startsWith(role) && w.split(" ")[0]!.endsWith(tail)) ? undefined : `spells ${spelled.join(" ") || "nothing"}`;
    }
    case "scope": {
      const [seam, sense = ""] = value.split(":");
      const scoped = suggestions.filter((s) => scopeSeam(s) === seam);
      if (!scoped.length) return `no ${seam} job: ${shown()}`;
      const roots = analysis.clauses.flatMap((cl) => cl.slots).flatMap((sl) => sl.suggestions).filter((s) => sensesOf(s).includes(sense.toLowerCase()));
      const spelled = scoped.flatMap((s) => (s.kind === "job" || s.kind === "entry") && s.phrase ? [s.phrase] : []);
      const hit = spelled.some((word) => roots.some((r) => r.kind === "lexicon" ? word.includes(`${r.form}${seam}`) : r.kind === "role" && word.includes(`${r.root}${seam}`)));
      return hit ? undefined : `spells ${spelled.join(" ") || "nothing"} (roots for *${sense}*: ${roots.length})`;
    }
    default:
      return "no-gap needs a slot";
  }
}
