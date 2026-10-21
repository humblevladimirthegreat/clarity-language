/**
 * `--verify`: the parser's existing checks on an Agebon draft, to show beside its English: a
 * sentence parse, the lexicon check (`parse.mjs --check-lexicon`), and the morph gloss the
 * Inspect page shows. With the helper data it also lines up each content word's sense with the
 * English word whose suggestions named its root, so a parse that reads *pray* for *grateful*
 * shows up before the round trip.
 */
import type { ClassifyTables } from "../parse/classify.js";
import { unknownWords, type UnknownWord } from "../parse/lexicon-check.js";
import { morphGlossLine } from "../parse/morph-gloss.js";
import { parseWithTables } from "../parse/parse-core.js";
import { analyzeEnglish, type Analysis, type HelperData, type Suggestion } from "./analyze.js";

type Side = "concrete" | "abstract";

/**
 * One content word of the draft: the sense its ending picks, the other side's sense, and the
 * English word that suggested the root. `check` says why to look again: the English matched the
 * root only as a search word (`alias`), only on the other side (`other-side`), in a grammar row
 * that spells it differently (`spelled`, the row's word), or not at all.
 */
export type WordSense = {
  raw: string;
  root: string;
  side: Side;
  sense: string;
  other?: string;
  english?: string;
  check?: "alias" | "other-side" | "spelled" | "unmatched";
  spelled?: string;
  /** Matched by a grammar row that spells this word, not by a root suggestion. */
  row?: true;
};

export type Verified = { english: string; agebon: string; gloss?: string; error?: string; unknown: UnknownWord[]; words?: WordSense[] };

type WordNode = { raw: string; ending?: string; family: { kind: string; roots?: string[] }; rootGloss?: { concrete?: string; abstract?: string } };

/** Every one-root content word in the parse tree, in sentence order. */
function contentWords(tree: unknown, agebon: string): WordNode[] {
  const out: WordNode[] = [];
  const walk = (node: unknown) => {
    if (Array.isArray(node)) return node.forEach(walk);
    if (!node || typeof node !== "object") return;
    const word = node as Partial<WordNode>;
    if (typeof word.raw === "string" && word.family?.kind === "content" && word.family.roots?.length === 1 && word.rootGloss) out.push(word as WordNode);
    for (const value of Object.values(node)) if (value && typeof value === "object") walk(value);
  };
  walk(tree);
  const order = agebon.toLowerCase().split(/[^a-z_+#~-]+/);
  // A shared word sits in the tree more than once (a ranking bracket repeats its scale): keep as many as the draft writes.
  const left = new Map<string, number>();
  for (const raw of order) left.set(raw, (left.get(raw) ?? 0) + 1);
  const once = out.filter((w) => {
    const n = left.get(w.raw) ?? 0;
    left.set(w.raw, n - 1);
    return n > 0;
  });
  return once.sort((a, b) => order.indexOf(a.raw) - order.indexOf(b.raw));
}

type RootMatch = { english: string; side?: Side; alias: boolean };
/** A grammar row's spelled words, and the English word it was suggested for. */
type FormMatch = { english: string; words: string[] };

/** Root → the English words whose suggestions name it, with the side each one meant; and the words grammar rows spell. */
function suggestedRoots(data: HelperData, english: string, analysis = analyzeEnglish(data, english)): { roots: Map<string, RootMatch[]>; forms: FormMatch[] } {
  const roots = new Map<string, RootMatch[]>();
  const forms: FormMatch[] = [];
  const addForm = (text: string, form: string | undefined) => {
    const words = (form ?? "").toLowerCase().split(/\s+/).map((w) => w.replace(/[.,?!]+$/, "")).filter(Boolean);
    if (words.length) forms.push({ english: text, words });
  };
  const add = (root: string, match: RootMatch) => roots.set(root, [...(roots.get(root) ?? []), match]);
  const visit = (text: string, s: Suggestion) => {
    switch (s.kind) {
      case "lexicon":
        return add(s.form, { english: text, ...(s.side ? { side: s.side } : {}), alias: s.tier === "alias" });
      case "role":
        return add(s.root, { english: text, alias: false });
      case "live":
        return s.parts.forEach((p) => add(p.form, { english: text, alias: false }));
      case "class":
        if (s.animal) add(s.animal.form, { english: text, side: "concrete", alias: false });
        return;
      case "job":
      case "entry":
        addForm(text, s.form);
        addForm(text, s.phrase);
        return;
      case "detector":
        addForm(text, s.form);
    }
  };
  for (const clause of analysis.clauses) for (const slot of clause.slots) for (const s of slot.suggestions) visit(slot.text, s);
  return { roots, forms };
}

function senseOf(word: WordNode, suggested: ReturnType<typeof suggestedRoots> | undefined): WordSense | undefined {
  const side: Side | undefined = word.ending === "l" ? "concrete" : word.ending === "m" ? "abstract" : undefined;
  const root = word.family.roots![0]!;
  const sense = side && word.rootGloss?.[side];
  if (!side || !sense) return undefined;
  const otherSide: Side = side === "concrete" ? "abstract" : "concrete";
  const out: WordSense = { raw: word.raw, root, side, sense, ...(word.rootGloss?.[otherSide] ? { other: word.rootGloss[otherSide] } : {}) };
  if (!suggested) return out;
  const matches = suggested.roots.get(root) ?? [];
  const same = matches.find((m) => !m.alias && (!m.side || m.side === side));
  // A grammar row that spells the word (`bazazam grubal` for *yesterday*) suggested it too.
  const exact = suggested.forms.find((f) => f.words.includes(word.raw));
  const other = matches.find((m) => !m.alias && m.side === otherSide);
  const near = suggested.forms.flatMap((f) => f.words.filter((w) => w.includes(root)).map((w) => ({ english: f.english, spelled: w })))[0];
  const alias = matches.find((m) => m.alias);
  if (same) out.english = same.english;
  else if (exact) Object.assign(out, { english: exact.english, row: true });
  else if (other) Object.assign(out, { english: other.english, check: "other-side" });
  else if (near) Object.assign(out, { english: near.english, check: "spelled", spelled: near.spelled });
  else if (alias) Object.assign(out, { english: alias.english, check: "alias" });
  else out.check = "unmatched";
  return out;
}

/** `analysis`: the English's analysis, when the caller already has it. */
export function verifyDraft(english: string, agebon: string, tables: ClassifyTables, data?: HelperData, analysis?: Analysis): Verified {
  try {
    const tree = parseWithTables(agebon, tables);
    const unknown = unknownWords(tree);
    const suggested = data ? suggestedRoots(data, english, analysis) : undefined;
    const words = contentWords(tree, agebon).flatMap((w) => senseOf(w, suggested) ?? []);
    return { english, agebon, gloss: morphGlossLine(agebon, tables), unknown, ...(data ? { words } : {}) };
  } catch (error) {
    return { english, agebon, error: error instanceof Error ? error.message : String(error), unknown: [] };
  }
}

const ENDING: Record<Side, string> = { concrete: "-l", abstract: "-m" };

/** `gebevol  ebevo -l "pray" (-m "gratitude")  ← *grateful*: a search word for this root; check the sense` */
function wordLine(w: WordSense, width: number): string {
  const otherSide: Side = w.side === "concrete" ? "abstract" : "concrete";
  const other = w.other ? ` (${ENDING[otherSide]} "${w.other}")` : "";
  const head = `  ${w.raw.padEnd(width)}  ${w.root} ${ENDING[w.side]} "${w.sense}"${other}`;
  switch (w.check) {
    case "alias":
      return `${head}  ← *${w.english}*: a search word for this root; check the sense`;
    case "other-side":
      return `${head}  ← *${w.english}* matched the ${ENDING[otherSide]} sense "${w.other}"`;
    case "spelled":
      return `${head}  ← *${w.english}*: its grammar row spells \`${w.spelled}\``;
    case "unmatched":
      return `${head}  ← no English word suggested this root`;
    default:
      return `${head}  ← *${w.english}*`;
  }
}

export function verifiedLines(v: Verified): string[] {
  const out = [`English: ${v.english}`, `Agebon:  ${v.agebon}`];
  if (v.error) out.push(`parse error: ${v.error}`);
  if (v.gloss) out.push(`gloss:   ${v.gloss}`);
  for (const word of v.unknown) {
    const hint = word.maybeCompound.length > 0 ? ` (unlisted compound? ${word.maybeCompound.join(" / ")})` : "";
    out.push(`not in the lexicon: ${word.raw}${hint}`);
  }
  if (v.words?.length) {
    const width = Math.max(...v.words.map((w) => w.raw.length));
    out.push("senses:", ...v.words.map((w) => wordLine(w, width)));
  }
  const checks = v.words?.filter((w) => w.check).length ?? 0;
  if (!v.error && v.unknown.length === 0) {
    out.push(`ok: parses, every word is in the lexicon${checks ? `; ${checks} sense${checks === 1 ? "" : "s"} to check above` : ""}`);
  }
  return out;
}
