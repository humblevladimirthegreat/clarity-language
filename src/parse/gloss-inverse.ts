/**
 * Morph gloss → Agebon ([glosses.md § Round trip](../../docs/meta/glosses.md#round-trip)).
 *
 * Leaves resolve through an index of glossed word forms (every published root
 * and compound under each role letter and ending, the closed join / hook
 * series, plus any extra forms the caller supplies — numbers and mid-word `x`
 * compounds are open-ended). Resumes, names, quoted pass-through, labeled
 * brackets, and sentence marks invert structurally. Each candidate line is
 * re-glossed; only a line whose gloss matches the input is returned.
 */

import type { ClassifyTables } from "./classify.js";
import { classify } from "./classify.js";
import { POINTER_VOWEL, ROLE_PART, SCOPE_VOWEL, morphGlossFor, morphGlossLine, morphGlossWords, normalizeMorphLine } from "./morph-gloss.js";
import type { MorphGlossContext } from "./morph-gloss.js";
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

/** Every content root × role letter × **-l/-m/-n**, and every closed join / hook form. */
export function buildGlossIndex(tables: ClassifyTables, extraLines: string[] = []): GlossIndex {
  const index: GlossIndex = { forms: new Map(), roots: new Map() };
  for (const root of new Set<string>([...tables.published.keys(), ...tables.compounds.keys()])) indexRootForms(index, root, tables);
  indexSeriesForms(index, tables);
  indexHookedJoinForms(index, tables);
  indexSayForms(index, tables);
  indexLineForms(index, extraLines, tables);
  return index;
}

/** Only the closed join / hook forms: callers that spell a few roots add them with {@link indexRootForms}. */
export function seriesGlossIndex(tables: ClassifyTables): GlossIndex {
  const index: GlossIndex = { forms: new Map(), roots: new Map() };
  indexSeriesForms(index, tables);
  indexHookedJoinForms(index, tables);
  indexSayForms(index, tables);
  return index;
}

function indexSeriesForms(index: GlossIndex, tables: ClassifyTables): void {
  for (const series of SERIES) {
    for (const ending of JOIN_ENDINGS) {
      // A hosted `bl-` join is a whole landmark (`hewom blar`, `zoxual blual`).
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
 * Hooked joins (hooks.md#hooked-joins): every hook on **-l**, **-m**, and point-back **-r** × every join on **-l**,
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

/** Say words (feelings-permission.md#say-words): every scope × whose say × answer × ending on `/h/`. */
function indexSayForms(index: GlossIndex, tables: ClassifyTables): void {
  for (const scope of ["a", "e", "o", "u", "ao", "ae", "oe", "ua", "uo", "ue"]) {
    for (const part of ["z", "d", "b", "v"]) {
      for (const answer of ["a", "e", "o", "u"]) {
        for (const ending of ["l", "m", "r"]) {
          const surface = `hw${scope}${part}${answer}${ending}`;
          const gloss = glossOne(surface, tables, {});
          if (gloss) add(index.forms, gloss, surface);
        }
      }
    }
  }
}

/** One content root under each role letter (and `gl-` / hosted `bl-`) and **-l/-m/-n**. */
export function indexRootForms(index: GlossIndex, root: string, tables: ClassifyTables): void {
  for (const ending of ENDINGS) {
    for (const prefix of [...POS, "gl", "bl", ""]) {
      const surface = `${prefix}${root}${ending}`;
      const gloss = glossOne(surface, tables, {});
      if (!gloss) continue;
      add(index.forms, gloss, surface);
      const body = gloss.replace(/^(?:th|gl|bl|[zdbvgwhxy])-/, "");
      add(index.roots, body, root);
    }
  }
}

/** Open-ended forms (numbers, mid-word `x`) as whole Agebon lines use them. */
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

const SCOPE_BY_LABEL: Record<string, string> = Object.fromEntries(
  Object.entries(SCOPE_VOWEL).map(([vowel, label]) => [label, vowel]),
);

/** A role word's front, `SCOPE-PART` (`episode-agent`), then the rest. */
const ROLE_FRONT = new RegExp(
  `^(${Object.keys(SCOPE_BY_LABEL).join("|")})-(${Object.keys(PART_BY_LABEL).join("|")})(.*)$`,
);

const POINTER_BY_LABEL: Record<string, string> = Object.fromEntries(
  Object.entries(POINTER_VOWEL).map(([vowel, label]) => [label, vowel]),
);

function nameRoot(label: string): string | undefined {
  if (!/^[A-Z]/.test(label)) return undefined;
  const joined = label.toLowerCase().split("-x-").join("x");
  return joined.endsWith("n") ? joined.slice(0, -1) : undefined;
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

  // Tag pronoun: `tag.A` → `wa` + **-l**; `←tag.A` is **-r**, `←tag.A.part` is **-m**, `←tag.A.name` is **-n**; a pair `←tag.A+E` is `wae`.
  const tag = core.match(/^((?:th|gl|bl|[zdbvgwhxy])-)?(←)?tag\.([AEOU](?:\+[AEOU])?)(\.part|\.name)?$/);
  if (tag) {
    const ending = !tag[2] ? "l" : tag[4] === ".part" ? "m" : tag[4] === ".name" ? "n" : "r";
    out.add(`${(tag[1] ?? "").replace(/-$/, "")}w${tag[3]!.replace("+", "").toLowerCase()}${ending}${suffix}`);
    return [...out];
  }

  const resume = core.match(/^((?:th|gl|bl|[zdbvgwhxy])-)?←(.*)$/);
  if (resume) {
    const pos = (resume[1] ?? "").replace(/-$/, "");
    let body = resume[2]!;
    const front = body.match(ROLE_FRONT);
    // Role pointer: `←episode-agent.same` → `w` + `a` + `z` + `a` + **-r**; `.new` is **-l**, `.part` is **-m**.
    const pointer = front?.[3]!.match(/^\.([a-z]+)(?:\.(new|part))?$/);
    if (front && pointer && POINTER_BY_LABEL[pointer[1]!] !== undefined) {
      const ending = pointer[2] === "new" ? "l" : pointer[2] === "part" ? "m" : "r";
      out.add(`${pos}w${SCOPE_BY_LABEL[front[1]!]}${PART_BY_LABEL[front[2]!]}${POINTER_BY_LABEL[pointer[1]!]}${ending}${suffix}`);
      return [...out];
    }
    // Role-compound resume: `←episode-agent-write` → `w` + `a` + `z` + resumed stem + **-r**.
    let roleFront = "";
    if (front?.[3]!.startsWith("-")) {
      roleFront = `w${SCOPE_BY_LABEL[front[1]!]}${PART_BY_LABEL[front[2]!]}`;
      body = front[3]!.slice(1);
    }
    const quoted = unquote(body);
    const roots = quoted !== undefined ? [quoted] : [...(index.roots.get(body) ?? [])];
    // A resume of **-ln** keeps the instance label (`←Azawan.instance`); the stem is the name's.
    const name = nameRoot(body.replace(/\.instance$/, ""));
    if (name) roots.push(name);
    for (const root of roots) out.add(`${pos}${roleFront}${root}r${suffix}`);
  }

  const named_ = core.match(/^((?:th|gl|[zdbvgwhxy])-)?([A-Z].*?)(\.instance)?$/);
  if (named_) {
    const root = nameRoot(named_[2]!);
    // `Azawan.instance` is **-ln**, one thing the name applies to (word-endings.md#name-instance--ln).
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
      if (alts.length === 0) throw new Error(`no Agebon form glosses as ${node.text}`);
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
 * Rebuild Agebon from a morph gloss line. Throws when no form sequence
 * re-glosses to exactly this line (a non-invertible gloss).
 */
export function glossToAgebon(gloss: string, tables: ClassifyTables, index: GlossIndex): string {
  const target = normalizeMorphLine(gloss);
  const pieces = assemble(new GlossReader(target).seq(false), index, tables);
  return resolve(pieces, tables, (w) => w, target)[0]!;
}
