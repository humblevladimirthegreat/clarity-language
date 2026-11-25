/**
 * Morph gloss → Ageben ([glosses.md § Round trip](../../docs/meta/glosses.md#round-trip)).
 *
 * Leaves resolve through an index of glossed word forms (every published root
 * and compound under each role letter and ending, the closed join / hook
 * series, plus any extra forms the caller supplies — mid-word `x` compounds
 * and the numbers below are open-ended). Resumes, names, plain number words
 * (a count, rank or signed amount with one run of digits), quoted
 * pass-through, labeled brackets, and sentence marks invert structurally. Each candidate line is
 * re-glossed; only a line whose gloss matches the input is returned.
 */

import type { ClassifyTables } from "./classify.js";
import { classify, SAME_ROLE_POS } from "./classify.js";
import { cardinalEnglish, HOOK_EXTRA_NOUN, POINTER_VOWEL, ROLE_PART, REACH_VOWEL } from "./morph-gloss-tables.js";
import { sameRoleLabel } from "./morph-gloss-labels.js";
import { morphGlossFor, morphGlossLine, morphGlossWords } from "./morph-gloss.js";
import { normalizeMorphLine } from "./morph-gloss-blocks.js";
import type { MorphGlossContext } from "./morph-gloss-tables.js";
import { parseWords } from "./word.js";
import { POINT_BACK_HOOKS, TIME_HOOKS, TIME_JOINS } from "./series.js";

const POS = ["z", "d", "b", "v", "g", "w", "h", "th", "x", "y"] as const;
const ENDINGS = ["l", "m", "n"] as const;
const SERIES = ["a", "o", "e", "u", "ae", "ao", "oe", "ue", "ua", "uo"];
const JOIN_ENDINGS = ["l", "m", "n", "r", "rl", "rm", "rn", "rth"];
const CONTEXTS: MorphGlossContext[] = [
  {},
  { hookJob: "extraNoun" },
  { hookJob: "discourse" },
  { hookJob: "span" },
  { restrictorListed: true },
  { fillAsk: true },
  { dependentVerb: true },
  { standaloneJoin: true },
  { kindReference: true },
];

const WRITTEN_BRACKET: Record<string, [string, string]> = {
  CITE: ["[", "]"],
  ASIDE: ["(", ")"],
  OPAQUE: ["<", ">"],
};

export type GlossIndex = {
  /** Leaf gloss → surface forms that produce it. */
  forms: Map<string, Set<string>>;
  /** Sense label (no PoS) → content roots, for resumes. */
  roots: Map<string, Set<string>>;
};

export type GlossCollision = { gloss: string; forms: string[] };

function add(map: Map<string, Set<string>>, key: string, value: string): void {
  let set = map.get(key);
  if (!set) map.set(key, (set = new Set()));
  set.add(value);
}

function glossOne(surface: string, tables: ClassifyTables, ctx: MorphGlossContext): string | undefined {
  try {
    const words = parseWords(surface);
    if (words.length !== 1) return undefined;
    const word = classify(words[0]!, tables);
    if (word.raw !== surface) return undefined;
    return morphGlossFor(word, tables, ctx);
  } catch {
    return undefined;
  }
}

/**
 * The gloss a join word takes as a fill-ask blank (questions.md#fill-ask: `zar` → `z-wh`), which its glosses elsewhere
 * (`z-something`) do not show; `undefined` when the surface is not one such word.
 */
export function fillAskGloss(surface: string, tables: ClassifyTables): string | undefined {
  return glossOne(surface, tables, { fillAsk: true });
}

/** Every content root × role letter × **-l/-m/-n**, and every closed join / hook form. */
export function buildGlossIndex(tables: ClassifyTables, extraLines: string[] = []): GlossIndex {
  const index: GlossIndex = { forms: new Map(), roots: new Map() };
  for (const root of new Set<string>([...tables.published.keys(), ...tables.compounds.keys()])) indexRootForms(index, root, tables);
  indexSeriesForms(index, tables);
  indexHookedJoinForms(index, tables);
  indexSayForms(index, tables);
  indexSameRoleForms(index, tables);
  indexLineForms(index, extraLines, tables);
  return index;
}

/** Only the closed join / hook forms: callers that spell a few roots add them with {@link indexRootForms}. */
export function seriesGlossIndex(tables: ClassifyTables): GlossIndex {
  const index: GlossIndex = { forms: new Map(), roots: new Map() };
  indexSeriesForms(index, tables);
  indexHookedJoinForms(index, tables);
  indexSayForms(index, tables);
  indexSameRoleForms(index, tables);
  return index;
}

/** The same-role words (same-role-words.md): a listed citation glosses as its relation only inside a clause. */
function indexSameRoleForms(index: GlossIndex, tables: ClassifyTables): void {
  for (const row of tables.overlays.values()) if (row.pos === SAME_ROLE_POS) add(index.forms, sameRoleLabel(row), row.senseForm);
}

function indexSeriesForms(index: GlossIndex, tables: ClassifyTables): void {
  for (const series of SERIES) {
    for (const ending of JOIN_ENDINGS) {
      // A hosted `bl-` join is a whole landmark (`hewom blar`, `zexual blual`).
      for (const prefix of [...POS, "bl", ""]) {
        const surface = `${prefix}${series}${ending}`;
        for (const ctx of CONTEXTS) {
          const gloss = glossOne(surface, tables, ctx);
          if (gloss) add(index.forms, gloss, surface);
        }
      }
    }
  }
}

const HOOK_VOWELS = ["a", "ao", "o", "oe", "u", "ua", "uo", "e", "ae", "ue"];

/**
 * Hooked joins (hooked-joins.md#hooked-joins): every hook on **-l**, **-m**, and point-back **-r** × every join on **-l**,
 * **-m**, **-r**, **-rx** under `/z/` `/d/` `/b/`; under `/h/`, the time hooks × the bare restrictors.
 */
function indexHookedJoinForms(index: GlossIndex, tables: ClassifyTables): void {
  const hooks = HOOK_VOWELS.flatMap((vowels) => [`${vowels}l`, `${vowels}m`, `${vowels}r`]).filter(
    (hook) => !hook.endsWith("r") || POINT_BACK_HOOKS.has(hook),
  );
  const joins = SERIES.flatMap((series) => [`${series}l`, `${series}m`, `${series}r`, `${series}rx`]);
  const spell = (pos: string, hook: string, join: string) => `${pos}${hook.slice(0, -1)}${hook.endsWith("l") ? "" : hook.slice(-1)}x${join}`;
  const surfaces = [
    ...["z", "d", "b"].flatMap((pos) => hooks.flatMap((hook) => joins.map((join) => spell(pos, hook, join)))),
    ...[...TIME_HOOKS].flatMap((hook) => [...TIME_JOINS].map((join) => spell("h", hook, join))),
  ];
  for (const surface of surfaces) {
    for (const ctx of [{}, { fillAsk: true }, { standaloneJoin: true }] as MorphGlossContext[]) {
      const gloss = glossOne(surface, tables, ctx);
      if (gloss) add(index.forms, gloss, surface);
    }
  }
}

/** Say words (permission-consent.md#say-words): every reach × whose say × answer × ending on `/h/`. */
function indexSayForms(index: GlossIndex, tables: ClassifyTables): void {
  for (const reach of ["a", "e", "o", "u", "ao", "ae", "oe", "ua", "uo", "ue"]) {
    for (const part of ["z", "d", "b", "v"]) {
      for (const answer of ["a", "e", "o", "u"]) {
        for (const ending of ["l", "m", "r"]) {
          const surface = `hw${reach}${part}${answer}${ending}`;
          const gloss = glossOne(surface, tables, {});
          if (gloss) add(index.forms, gloss, surface);
        }
      }
    }
  }
}

/**
 * One content root under each role letter (and `gl-` / hosted `bl-`) and **-l/-m/-n**. A listed hook compound
 * (`owurolul`, hook-compounds.md) already ends in its hook, so it takes no ending; as a stem it is the compound less
 * its last letter, which a built word's ending then supplies (`guoxowurolul`).
 */
export function indexRootForms(index: GlossIndex, root: string, tables: ClassifyTables): void {
  const hooked = /[lmn]$/.test(root);
  for (const ending of hooked ? [""] : ENDINGS) {
    for (const prefix of [...POS, "gl", "bl", ""]) {
      const surface = `${prefix}${root}${ending}`;
      const gloss = glossOne(surface, tables, {});
      if (!gloss) continue;
      add(index.forms, gloss, surface);
      const body = gloss.replace(/^(?:th|gl|bl|[zdbvgwhxy])-/, "");
      add(index.roots, body, hooked ? root.slice(0, -1) : root);
    }
  }
}

/** Open-ended forms (numbers, mid-word `x`) as whole Ageben lines use them. */
export function indexLineForms(index: GlossIndex, lines: readonly string[], tables: ClassifyTables): void {
  for (const line of lines) {
    try {
      for (const { raw, gloss } of morphGlossWords(line, tables)) {
        if (!gloss.includes("[") && !raw.includes("[")) add(index.forms, gloss, raw);
      }
    } catch {
      // Unparseable doc lines contribute nothing.
    }
  }
}

/** Context-free label collisions: one gloss for several content forms (glosses.md § Round trip). */
export function glossCollisions(tables: ClassifyTables): GlossCollision[] {
  const forms = new Map<string, Set<string>>();
  const roots = new Set<string>([...tables.published.keys(), ...tables.compounds.keys()]);
  for (const root of roots) {
    for (const ending of ENDINGS) {
      for (const prefix of [...POS, "gl"]) {
        const surface = `${prefix}${root}${ending}`;
        const gloss = glossOne(surface, tables, {});
        if (gloss) add(forms, gloss, surface);
      }
    }
  }
  return [...forms]
    .filter(([, set]) => set.size > 1)
    .map(([gloss, set]) => ({ gloss, forms: [...set].sort() }))
    .sort((a, b) => a.gloss.localeCompare(b.gloss));
}

// ── Gloss syntax tree ───────────────────────────────────────────────────────

type Node =
  | { t: "leaf"; text: string }
  | { t: "group"; prefix: string; label: string; close: string; kids: Node[] }
  | { t: "mark"; mark: string }
  | { t: "tone"; tone: string };

const LABEL_RE =
  /^((?:th|gl|[zdbvgwhxy])-)?((?:NAME\.)?(?:CITE|ASIDE|OPAQUE|SCOPE|NAME)(?:\.[a-z]+)*)\[/;

class GlossReader {
  pos = 0;
  constructor(private src: string) {}

  seq(inGroup: boolean): Node[] {
    const out: Node[] = [];
    for (;;) {
      if (this.pos >= this.src.length) return out;
      if (inGroup && this.src[this.pos] === "]") return out;
      if (this.src.startsWith(" | ", this.pos)) {
        this.pos += 3;
        continue;
      }
      const mark = this.src.slice(this.pos).match(/^ ([.?!])(?: |$)/);
      if (mark) {
        out.push({ t: "mark", mark: mark[1]! });
        this.pos += mark[0].length;
        continue;
      }
      out.push(this.item());
    }
  }

  item(): Node {
    // Tone mark before a word / group; its own ` | ` slot = free-standing (sentence scope).
    const tone = this.src.slice(this.pos).match(/^([!?%&;]+)( \| )?/);
    if (tone) {
      this.pos += tone[0].length;
      return { t: "tone", tone: tone[2] ? `${tone[1]} ` : tone[1]! };
    }
    const rest = this.src.slice(this.pos);
    const labeled = rest.match(LABEL_RE);
    if (labeled || rest.startsWith("[")) {
      this.pos += labeled ? labeled[0].length : 1;
      const kids = this.seq(true);
      if (this.src[this.pos] !== "]") throw new Error(`unclosed bracket in gloss: ${this.src}`);
      this.pos += 1;
      let close = "";
      while (this.src[this.pos] === "#" || (this.src[this.pos] === "|" && this.src[this.pos + 1] !== " ")) {
        close += this.src[this.pos];
        this.pos += 1;
      }
      // `]|` directly before ` | ` is close-all, then separator.
      if (this.src[this.pos] === "|" && this.src.startsWith("| ", this.pos) && !this.src.startsWith(" | ", this.pos - 1)) {
        close += "|";
        this.pos += 1;
      }
      return { t: "group", prefix: labeled?.[1] ?? "", label: labeled?.[2] ?? "", close, kids };
    }
    let end = this.pos;
    let quoted = false;
    while (end < this.src.length) {
      const ch = this.src[end]!;
      if (ch === '"') quoted = !quoted;
      if (!quoted) {
        if (ch === "]") break;
        if (this.src.startsWith(" | ", end)) break;
        if (/^ [.?!](?: |$)/.test(this.src.slice(end))) break;
      }
      end += 1;
    }
    // An empty leaf would never advance: a stray `]` (`d-[red | dog]`, a role letter on a bracket) is malformed.
    if (end === this.pos) throw new Error(`unbalanced bracket in gloss: ${this.src}`);
    const text = this.src.slice(this.pos, end);
    this.pos = end;
    return { t: "leaf", text };
  }
}

function unquote(text: string): string | undefined {
  const m = text.match(/^"((?:[^"]|"")*)"$/);
  return m ? m[1]!.replace(/""/g, '"') : undefined;
}

// ── Leaf candidates ─────────────────────────────────────────────────────────

const PART_BY_LABEL: Record<string, string> = Object.fromEntries(
  Object.entries(ROLE_PART).map(([part, label]) => [label, part]),
);

const REACH_BY_LABEL: Record<string, string> = Object.fromEntries(
  Object.entries(REACH_VOWEL).map(([vowel, label]) => [label, vowel]),
);

/** A role word's front, `REACH-PART` (`episode-agent`), then the rest. */
const ROLE_FRONT = new RegExp(
  `^(${Object.keys(REACH_BY_LABEL).join("|")})-(${Object.keys(PART_BY_LABEL).join("|")})(.*)$`,
);

const POINTER_BY_LABEL: Record<string, string> = Object.fromEntries(
  Object.entries(POINTER_VOWEL).map(([vowel, label]) => [label, vowel]),
);

function nameRoot(label: string): string | undefined {
  if (!/^[A-Z]/.test(label)) return undefined;
  const joined = label.toLowerCase().split("-x-").join("x");
  return joined.endsWith("n") ? joined.slice(0, -1) : undefined;
}

// ── Numbers ─────────────────────────────────────────────────────────────────

/** Digit → its spoken syllable (numbers.md#counts). */
const DIGIT_SYLLABLE = ["mo", "ba", "do", "ge", "hu", "za", "vo", "re", "lu", "na"];

/** Marker symbol → its spoken vowel after `r` (number-markers.md#writing-preferred-shorthand). */
const MARKER_VOWEL: Record<string, string> = { "+": "a", "-": "u", "#": "o" };

/** Number form suffix → the ending it marks, spoken and as its written mark (glosses.md *Form suffixes*). */
const NUMBER_ENDING: Record<string, { ending: string; mark: string }> = {
  "": { ending: "l", mark: "" },
  ".about": { ending: "m", mark: "~" },
  ".named": { ending: "n", mark: "@" },
  ".again": { ending: "r", mark: "=" },
};

const CARDINAL_DIGITS = new Map(Array.from({ length: 13 }, (_, n) => [cardinalEnglish(n), String(n)]));

/** A number label's marker and digits: `three`, `20` (count), `2nd` (rank), `minus-three`, `divided-by-three`. */
function numberOfLabel(label: string): { marker: string; digits: string } | undefined {
  const digitsOf = (text: string): string | undefined => CARDINAL_DIGITS.get(text) ?? (/^\d+$/.test(text) ? text : undefined);
  const rank = label.match(/^(\d+)(?:st|nd|rd|th)$/);
  if (rank) return { marker: "#", digits: rank[1]! };
  const signed = label.match(/^(?:minus|divided-by)-(.+)$/);
  const digits = digitsOf(signed ? signed[1]! : label);
  return digits === undefined ? undefined : { marker: signed ? "-" : "+", digits };
}

/**
 * The forms a number-word leaf can be (glosses.md#round-trip: one gloss, one word): `g-three` → `gragel`, `g+3`;
 * `z-twelve.about` → `zrabadom`, `z~+12`; `d-←three` (a resume) → `drager`, `d=+3`. Both writings are candidates; the
 * re-gloss check keeps the one the surface suffix (`.spelled`, `.short`, or none for the preferred writing) names.
 */
function numberCandidates(core: string): string[] {
  const leaf = core.match(/^((?:th|[zdbvgwhxy])-)?(←)?(.+?)(\.about|\.named|\.again)?(?:\.spelled|\.short)?$/);
  if (!leaf) return [];
  const number = numberOfLabel(leaf[3]!);
  const vowel = number && MARKER_VOWEL[number.marker];
  if (!number || !vowel || (leaf[2] && leaf[4])) return [];
  const pos = (leaf[1] ?? "").replace(/-$/, "");
  const { ending, mark } = leaf[2] ? NUMBER_ENDING[".again"]! : NUMBER_ENDING[leaf[4] ?? ""]!;
  const syllables = [...number.digits].map((digit) => DIGIT_SYLLABLE[Number(digit)]).join("");
  return [`${pos}r${vowel}${syllables}${ending}`, `${pos}${mark}${number.marker}${number.digits}`];
}

const FRACTION_DIGITS: Record<string, string> = { half: "2", third: "3", quarter: "4" };

/**
 * A fraction, a minus number right after a plain noun or a count (measures-and-percent.md#fractions): `g-half-of` →
 * `grudol`, `g-one-12th-of` → `g-12`, in the preferred writing first (number-markers.md#writing-style-numeric-vs-spelled).
 */
function fractionCandidates(core: string): string[] {
  const fraction = core.match(/^g-(?:(half|third|quarter)|one-(\d+)(?:st|nd|rd|th))-of$/);
  if (!fraction) return [];
  const digits = fraction[1] ? FRACTION_DIGITS[fraction[1]]! : fraction[2]!;
  const spelled = `gru${[...digits].map((digit) => DIGIT_SYLLABLE[Number(digit)]).join("")}l`;
  return digits.length > 1 ? [`g-${digits}`, spelled] : [spelled, `g-${digits}`];
}

/** The digitless scale word on each role letter that has one, by its scale label (morph-gloss.ts `SCALE_GLOSS`). */
const SCALE_POS: Record<string, string> = { amount: "g", "how-often": "h", later: "b" };

/**
 * A digitless `+` shared after a rank or tie join names its scale (comparative-arity.md#amount-scale): `g-amount` →
 * `gral`, `h-how-often` → `hral`, `b-later` → `bral`, and `.about` on **-m** (`gram`). The spelled writing, the
 * preferred one with no digit (number-markers.md#writing-style-numeric-vs-spelled).
 */
function scaleCandidates(core: string): string[] {
  const scale = core.match(/^([ghb])-(amount|how-often|later)(\.about)?$/);
  if (!scale || SCALE_POS[scale[2]!] !== scale[1]) return [];
  return [`${scale[1]}ra${scale[3] ? "m" : "l"}`];
}

/**
 * A mid-word `x` compound (compounds.md): its parts' senses joined at `-x-` (`z-peanut-x-butter` → `zuwedaxubudal`).
 * Every root each sense names, on each ending; the re-gloss check keeps the one whose ending gives these senses.
 */
function compoundCandidates(core: string, index: GlossIndex): string[] {
  const leaf = core.match(/^((?:th|[zdbvgwhxy])-)?([a-z][a-z.-]*-x-[a-z.-]*[a-z])$/);
  if (!leaf) return [];
  const pos = (leaf[1] ?? "").replace(/-$/, "");
  return chainStems(leaf[2]!, index).flatMap((stem) => ["l", "m"].map((ending) => `${pos}${stem}${ending}`));
}

/** The stems (no role letter, no ending) a sense chain names: each sense's roots, joined by `x` (`dog-x-walk` → `odozexowuro`). */
function chainStems(chain: string, index: GlossIndex): string[] {
  let stems = [""];
  for (const sense of chain.split("-x-")) {
    const roots = [...(index.roots.get(sense) ?? [])];
    if (roots.length === 0) return [];
    stems = stems.flatMap((stem) => roots.map((root) => (stem ? `${stem}x${root}` : root)));
    if (stems.length > 16) return [];
  }
  return stems;
}

// ── Built words ─────────────────────────────────────────────────────────────

/** Hook prefix label → the hook as it stands before the `x` seam (`against` → `uo`, `contrary-to` → `uom`). */
const HOOK_BY_LABEL = new Map<string, string[]>();
for (const [hook, label] of Object.entries(HOOK_EXTRA_NOUN)) {
  const front = hook.endsWith("l") ? hook.slice(0, -1) : hook;
  HOOK_BY_LABEL.set(label, [...(HOOK_BY_LABEL.get(label) ?? []), front]);
}

/** A numeric prefix's digitless kind label → its marker vowel and spoken exponent (numeric-derivation.md). */
const NUMERIC_KIND: Record<string, string> = {
  infinity: "awa",
  grain: "awu",
  void: "uwa",
  quasi: "uwu",
  origin: "owu",
  telos: "owa",
  poly: "a",
  de: "u",
};

/** A numeric prefix's number as spoken before its seam: `two` → `rado`, `1st` → `roba`, `_1` → `reba`, `quasi` → `ruwu`. */
function numericStem(label: string): string | undefined {
  const kind = NUMERIC_KIND[label];
  if (kind) return `r${kind}`;
  const source = label.match(/^_(\d+)$/);
  const number = source ? { marker: "_", digits: source[1]! } : numberOfLabel(label);
  const vowel = number && (number.marker === "_" ? "e" : MARKER_VOWEL[number.marker]);
  if (!number || !vowel) return undefined;
  return `r${vowel}${[...number.digits].map((digit) => DIGIT_SYLLABLE[Number(digit)]).join("")}`;
}

const REACH_LABELS = Object.keys(REACH_BY_LABEL).join("|");
const LABEL_SEAM = new RegExp(`^(.+)-th-(${REACH_LABELS})$`);

/**
 * The stems (no role letter, no ending) a built word's gloss body names (glosses.md#round-trip): a role word
 * (`episode-agent-teach` → `wuzeduyo`), a hook prefix (`against-x-fight` → `uoxuvuvu`), a numeric prefix
 * (`three.about-x-speech` → `ragemxezuyo`), or any of these or a plain sense with a label seam (`misstate-th-role` →
 * `enumutho`). The caller adds the ending; the re-gloss check keeps the one whose ending gives these senses.
 */
function builtStems(body: string, index: GlossIndex): string[] {
  const seam = body.match(LABEL_SEAM);
  if (seam) {
    const bases = [...chainStems(seam[1]!, index), ...builtStems(seam[1]!, index)];
    return bases.map((base) => `${base}th${REACH_BY_LABEL[seam[2]!]}`);
  }
  const role = body.match(ROLE_FRONT);
  if (role?.[3]!.startsWith("-")) {
    return chainStems(role[3]!.slice(1), index).map((stem) => `w${REACH_BY_LABEL[role[1]!]}${PART_BY_LABEL[role[2]!]}${stem}`);
  }
  const at = body.indexOf("-x-");
  if (at < 0) return [];
  const [front, rest] = [body.slice(0, at), body.slice(at + 3)];
  const stems = chainStems(rest, index);
  const hooks = HOOK_BY_LABEL.get(front) ?? [];
  const about = front.endsWith(".about");
  const number = numericStem(about ? front.slice(0, -".about".length) : front);
  const fronts = [...hooks, ...(number ? [`${number}${about ? "m" : ""}`] : [])];
  return fronts.flatMap((head) => stems.map((stem) => `${head}x${stem}`));
}

/** A built word on **-l**, **-m** or **-n** (`z-episode-agent-teach` → `zwuzeduyol`). */
function builtCandidates(core: string, index: GlossIndex): string[] {
  const leaf = core.match(/^((?:th|[zdbvgwhxy])-)?([a-z0-9_][a-z0-9_.-]*[a-z])$/);
  if (!leaf) return [];
  const pos = (leaf[1] ?? "").replace(/-$/, "");
  return builtStems(leaf[2]!, index).flatMap((stem) => ENDINGS.map((ending) => `${pos}${stem}${ending}`));
}

function leafCandidates(text: string, index: GlossIndex, named: boolean): string[] {
  const plural = /[^-]-x$/.test(text) && !text.endsWith("-x-x");
  const core = plural ? text.slice(0, -2) : text;
  const suffix = plural ? "x" : "";
  const out = new Set<string>();

  if (named) for (const form of index.forms.get(`${core}.named`) ?? []) out.add(form + suffix);
  for (const form of index.forms.get(core) ?? []) out.add(form + suffix);
  // A form indexed with its -x already on (a holder from a doc line, `thevemebezalx`).
  if (plural) for (const form of index.forms.get(text) ?? []) out.add(form);

  // Tag pronoun: `tag.A` → `wa` + **-l**; `←tag.A` is **-r**, `←tag.A.part` is **-m**, `tag.A.name` (a pseudonym) is **-n**; a pair `←tag.A+E` is `wae`.
  const tag = core.match(/^((?:th|gl|bl|[zdbvgwhxy])-)?(←)?tag\.([AEOU](?:\+[AEOU])?)(\.part|\.name)?$/);
  if (tag) {
    const ending = tag[4] === ".name" ? "n" : !tag[2] ? "l" : tag[4] === ".part" ? "m" : "r";
    out.add(`${(tag[1] ?? "").replace(/-$/, "")}w${tag[3]!.replace("+", "").toLowerCase()}${ending}${suffix}`);
    return [...out];
  }

  for (const form of numberCandidates(core)) out.add(form + suffix);
  for (const form of scaleCandidates(core)) out.add(form + suffix);
  for (const form of fractionCandidates(core)) out.add(form + suffix);
  for (const form of compoundCandidates(core, index)) out.add(form + suffix);
  for (const form of builtCandidates(core, index)) out.add(form + suffix);

  const resume = core.match(/^((?:th|gl|bl|[zdbvgwhxy])-)?←(.*)$/);
  if (resume) {
    const pos = (resume[1] ?? "").replace(/-$/, "");
    let body = resume[2]!;
    const front = body.match(ROLE_FRONT);
    // Role pointer: `←episode-agent.same` → `w` + `u` + `z` + `e` + **-r**; `.new` is **-l**, `.part` is **-m**.
    const pointer = front?.[3]!.match(/^\.([a-z]+)(?:\.(new|part))?$/);
    if (front && pointer && POINTER_BY_LABEL[pointer[1]!] !== undefined) {
      const ending = pointer[2] === "new" ? "l" : pointer[2] === "part" ? "m" : "r";
      out.add(`${pos}w${REACH_BY_LABEL[front[1]!]}${PART_BY_LABEL[front[2]!]}${POINTER_BY_LABEL[pointer[1]!]}${ending}${suffix}`);
      return [...out];
    }
    // Role-compound resume: `←episode-agent-write` → `w` + `a` + `z` + resumed stem + **-r**.
    let roleFront = "";
    if (front?.[3]!.startsWith("-")) {
      roleFront = `w${REACH_BY_LABEL[front[1]!]}${PART_BY_LABEL[front[2]!]}`;
      body = front[3]!.slice(1);
    }
    const quoted = unquote(body);
    const roots = quoted !== undefined ? [quoted] : [...(index.roots.get(body) ?? [])];
    // A resume of **-ln** keeps the instance label (`←Azawan.instance`); the stem is the name's.
    const name = nameRoot(body.replace(/\.instance$/, ""));
    if (name) roots.push(name);
    for (const root of roots) out.add(`${pos}${roleFront}${root}r${suffix}`);
    // A built word's resume: its whole stem on **-r** (`z-←against-x-fight` → `zuoxuvuvur`).
    if (!roleFront) for (const stem of builtStems(body, index)) out.add(`${pos}${stem}r${suffix}`);
  }

  const named_ = core.match(/^((?:th|gl|[zdbvgwhxy])-)?([A-Z].*?)(\.instance)?$/);
  if (named_) {
    const root = nameRoot(named_[2]!);
    // `Azawan.instance` is **-ln**, one thing the name applies to (proper-names.md#name-instance--ln).
    const ending = named_[3] ? "ln" : "n";
    if (root) out.add(`${(named_[1] ?? "").replace(/-$/, "")}${root}${ending}${suffix}`);
  }
  return [...out];
}

// ── Surface assembly ────────────────────────────────────────────────────────

type Piece = { alts: string[] } | { mark: string } | { tone: string };

function assemble(nodes: Node[], index: GlossIndex, tables: ClassifyTables, named = false): Piece[] {
  const out: Piece[] = [];
  for (const node of nodes) {
    if (node.t === "mark") {
      out.push({ mark: node.mark });
      continue;
    }
    if (node.t === "tone") {
      out.push({ tone: node.tone });
      continue;
    }
    if (node.t === "leaf") {
      const quoted = unquote(node.text);
      const alts = quoted !== undefined ? [quoted] : leafCandidates(node.text, index, named);
      if (alts.length === 0) throw new Error(`no Ageben form glosses as ${node.text}`);
      out.push({ alts });
      continue;
    }
    out.push(...groupPieces(node, index, tables));
  }
  return out;
}

function groupPieces(node: Extract<Node, { t: "group" }>, index: GlossIndex, tables: ClassifyTables): Piece[] {
  const { label, prefix, close } = node;
  if (!label) return assemble(node.kids, index, tables);
  if (label === "SCOPE") return [{ alts: ["{"] }, ...assemble(node.kids, index, tables), { alts: ["}"] }];
  if (label === "NAME") return assemble(node.kids, index, tables, true);

  const parts = label.split(".");
  const isNamed = parts[0] === "NAME";
  if (isNamed) parts.shift();
  const type = parts.shift()!;
  const about = parts.includes("about");
  const instance = parts.includes("instance");
  const pos = prefix.replace(/-$/, "");

  const [lb, rb] = WRITTEN_BRACKET[type]!;
  const mark = (about ? "~" : "") + (isNamed ? (instance ? "^@" : "@") : "");
  let payload = "";
  if (type === "OPAQUE") {
    const only = node.kids[0];
    payload = only?.t === "leaf" ? (unquote(only.text) ?? only.text) : "";
  } else if (node.kids.length > 0) {
    payload = resolve(assemble(node.kids, index, tables), tables, (kids) => kids).join(" ");
  }
  return [{ alts: [`${pos}${mark}${lb}${payload}${close}${rb}`] }];
}

/** Words joined by spaces; sentence marks glue to the word before; `{` `}` edges are spaced tokens. */
function render(pieces: Piece[], choice: number[]): string {
  let out = "";
  let k = 0;
  let glue = false;
  for (const piece of pieces) {
    if ("mark" in piece) out += piece.mark;
    else if ("tone" in piece) {
      out += out ? ` ${piece.tone}` : piece.tone;
      glue = true;
    } else {
      const word = piece.alts[choice[k++]!]!;
      out += out && !glue ? ` ${word}` : word;
      glue = false;
    }
  }
  return out;
}

/** Pick one alternative per piece so the whole line re-glosses to `target`. */
function resolve(pieces: Piece[], tables: ClassifyTables, finish: (words: string[]) => string[], target?: string): string[] {
  const slots = pieces.filter((p): p is { alts: string[] } => "alts" in p);
  const choice = slots.map(() => 0);
  const words = () => {
    let k = 0;
    return slots.map((s) => s.alts[choice[k++]!]!);
  };
  if (target === undefined) return finish(words());
  let tries = 0;
  for (;;) {
    const line = render(pieces, choice);
    try {
      if (normalizeMorphLine(morphGlossLine(line, tables)) === target) return [line];
    } catch {
      // Try the next combination.
    }
    let k = choice.length - 1;
    while (k >= 0 && choice[k] === slots[k]!.alts.length - 1) {
      choice[k] = 0;
      k -= 1;
    }
    if (k < 0 || ++tries > 256) break;
    choice[k]! += 1;
  }
  throw new Error(`gloss does not round-trip: ${target}`);
}

/**
 * Rebuild Ageben from a morph gloss line. Throws when no form sequence
 * re-glosses to exactly this line (a non-invertible gloss).
 */
export function glossToAgeben(gloss: string, tables: ClassifyTables, index: GlossIndex): string {
  const target = normalizeMorphLine(gloss);
  const pieces = assemble(new GlossReader(target).seq(false), index, tables);
  return resolve(pieces, tables, (w) => w, target)[0]!;
}
