/**
 * Writes src/generated/english-wordnet.json, the English helper's WordNet reverse index
 * (src/english-helper/wordnet-index.ts): English words with no lexicon sense → the lexicon
 * senses WordNet relates them to, and the classes the lexicon leaves out on purpose.
 *
 * Run: npm run english-helper-wordnet   (after a lexicon CSV change; the staleness test says when)
 *
 * Fetches Open English WordNet 2025 into tmp/oewn-2025/ (and the WordNet 3.1 index files, for
 * SemCor counts, into tmp/wordnet-3.1/) once. The output holds English words only, never root
 * spellings, so it is committed and neither the site build nor CI needs WordNet.
 *
 * - synonym: shares a synset with a sense, both within their first SYNONYM_RANK senses; or an
 *   adjective WordNet lists as similar to one; or a word derived from one (*hasty* ← *haste*).
 * - broader: a hyponym one or two levels under one of a sense's first BROADER_RANK senses.
 * - routes: hyponyms of *relative* (kin), and animals whose gloss opens *young* / *female* /
 *   *male*, with the nearest lexicon sense above them.
 * Words the lexicon already has are left out (the ladder never falls through to them), and so
 * are words with no sense tagged in SemCor (WordNet's frequency hint), which keeps the file small
 * enough for the browser.
 */
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { gzipSync } from "node:zlib";

import nlp from "compromise";

import { buildLexiconIndex } from "../src/english-helper/lexicon.js";
import { WORDNET_INDEX_VERSION, wordnetInputs, type RouteClass, type WordnetEntry, type WordnetIndex, type WordnetRoute } from "../src/english-helper/wordnet-index.js";
import { parseCompoundCsv, parseOverlayCsv, parsePublishedCsv } from "../src/lexicon-search.js";
import { dataPath, REPO_ROOT } from "../src/repo-paths.js";
import { ensureSemcorCounts, ensureWordnet, Wordnet, WORDNET_POS, type Synset } from "../src/wordnet.js";

const OUT = `${REPO_ROOT}/src/generated/english-wordnet.json`;
const SYNONYM_RANK = 3;
const BROADER_RANK = 4;
/** A lemma counts as a member of a synset only when the synset is among its first senses. */
const MEMBER_RANK = 3;
/** Entries kept per word and part of speech. */
const MAX_ENTRIES = 4;

const published = parsePublishedCsv(readFileSync(dataPath("lexicon-published.csv"), "utf8"));
const compounds = parseCompoundCsv(readFileSync(dataPath("lexicon-compounds.csv"), "utf8"));
const overlays = parseOverlayCsv(readFileSync(dataPath("lexicon-overlays.csv"), "utf8"));
const lexicon = buildLexiconIndex(published, compounds, overlays);
const wn = new Wordnet(await ensureWordnet(), await ensureSemcorCounts());

/** A lexicon key as WordNet spells it (`living-room` is in WordNet both ways). */
const wnForm = (key: string) => (wn.offsets(key, "n").length || wn.offsets(key, "v").length ? key : key.replace(/-/g, " "));
const direct = new Set([...lexicon.keys()].flatMap((k) => [k, k.replace(/-/g, " ")]));

function rank(lemma: string, synset: Synset): number {
  const r = wn.offsets(lemma, synset.pos).indexOf(synset.offset);
  return r < 0 ? Infinity : r;
}

const found = new Map<string, (WordnetEntry & { score: number })[]>();
/** English words compromise knows: with SemCor tags, the frequency hint. */
const known = (nlp.world() as { model: { one: { lexicon: Record<string, string> } } }).model.one.lexicon;
const common = (lemma: string) => wn.tagged(lemma) > 0 || lemma in known;

function add(lemma: string, entry: WordnetEntry, score: number): void {
  if (lemma !== lemma.toLowerCase() || direct.has(lemma) || /\d/.test(lemma) || !common(lemma)) return;
  const list = found.get(lemma) ?? [];
  const same = list.find((e) => e.sense === entry.sense && e.pos === entry.pos);
  if (same && same.score <= score) return;
  if (same) list.splice(list.indexOf(same), 1);
  list.push({ ...entry, score });
  found.set(lemma, list);
}

/**
 * Extra children for the broader tier. OEWN files role nouns (*architect*, *banker*) under
 * *doer*, a causal agent, not under *person* as WordNet 3.1 did.
 */
const grafts = new Map([[wn.lookup("person.n.01")[0]!.offset, wn.hyponyms(wn.lookup("doer.n.01")[0]!)]]);

/**
 * Senses with a root, compound or overlay row. A root takes its part of speech at use time, so
 * each is read in every WordNet part of speech (*walk* the noun and the verb).
 */
const targets = [...lexicon].filter(([, list]) => list.some((s) => s.tier !== "alias")).map(([key]) => ({ sense: key, form: wnForm(key) }));

for (const { sense, form } of targets) {
  for (const p of WORDNET_POS) {
    const synsets = wn.lookup(form, p);
    synsets.slice(0, SYNONYM_RANK).forEach((synset, r) => {
      for (const word of synset.words) if (word !== form && rank(word, synset) < MEMBER_RANK) add(word, { sense, tier: "synonym", pos: p }, r + rank(word, synset));
      if (r > 0) return;
      for (const similar of wn.related(synset, "&")) {
        for (const word of similar.words) if (rank(word, similar) < MEMBER_RANK) add(word, { sense, tier: "synonym", pos: "a", via: "similar" }, 10 + rank(word, similar));
      }
      // Only adjective links: noun ↔ verb derivations cross senses too freely (*stroller* the pram → *stroll*).
      for (const d of wn.derived(synset, form)) if (p === "a" || d.pos === "a") add(d.word, { sense, tier: "synonym", pos: d.pos, via: "derived" }, 20);
    });
    if (p !== "n" && p !== "v") continue;
    synsets.slice(0, BROADER_RANK).forEach((synset, r) => {
      for (const child of [...wn.hyponyms(synset), ...(grafts.get(synset.offset) ?? [])]) {
        for (const word of child.words) if (rank(word, child) < MEMBER_RANK) add(word, { sense, tier: "broader", pos: p }, 30 + r + rank(word, child));
        for (const grandchild of wn.hyponyms(child)) {
          for (const word of grandchild.words) {
            if (rank(word, grandchild) < MEMBER_RANK) add(word, { sense, tier: "broader", pos: p, via: child.words[0]! }, 40 + r + rank(word, grandchild));
          }
        }
      }
    });
  }
}

const routes = new Map<string, WordnetRoute>();
function addRoute(synset: Synset, route: WordnetRoute): void {
  for (const word of synset.words) {
    if (word !== word.toLowerCase() || direct.has(word) || routes.has(word) || rank(word, synset) >= MEMBER_RANK) continue;
    routes.set(word, route);
  }
}
for (const relative of wn.lookup("relative.n.01")) {
  addRoute(relative, { class: "kin" });
  for (const kin of wn.hyponyms(relative, 8)) addRoute(kin, { class: "kin" });
}
const SEXED: [RegExp, RouteClass][] = [
  [/^(an? )?(young|immature|newborn|baby)\b/, "young"],
  [/^(an? )?((adult|mature) )*female\b/, "female"],
  [/^(an? )?((adult|mature|uncastrated|castrated) )*male\b/, "male"],
];
const CLASS_WORDS = new Set(["young", "female", "male", "adult", "baby", "animal"]);
const youngOffsets = new Set(wn.lookup("young.n.01").flatMap((y) => [y.offset, ...wn.hyponyms(y, 8).map((s) => s.offset)]));
const [animalRoot] = wn.lookup("animal.n.01");
/** A word's first noun sense that is a kind of animal, when it has a root row. */
function animalSense(word: string): Synset | undefined {
  if (CLASS_WORDS.has(word) || !lexicon.get(word)?.some((s) => s.tier === "root")) return undefined;
  return wn.lookup(word).find((s) => wn.ancestors(s).some((a) => a.offset === animalRoot!.offset));
}
for (const synset of wn.hyponyms(animalRoot!, 20)) {
  const cls = SEXED.find(([re]) => re.test(synset.gloss))?.[1] ?? (youngOffsets.has(synset.offset) ? "young" : undefined);
  if (!cls) continue;
  // The nearest rooted animal up the tree, unless the gloss names a narrower one
  // (*kitten*, *young domestic cat*, sits under *young mammal*, not *cat*).
  const above = wn.ancestors(synset).flatMap((a) => a.words).find((w) => animalSense(w));
  const glossed = synset.gloss.split(/[;(]/)[0]!.split(/\s+/).find((w) => animalSense(w));
  const narrower = glossed && (!above || wn.ancestors(animalSense(glossed)!).some((a) => a.words.includes(above)));
  const sense = narrower ? glossed : above;
  addRoute(synset, { class: cls, ...(sense ? { sense } : {}) });
}

const sortKeys = <T>(map: Map<string, T>) => Object.fromEntries([...map].sort((a, b) => (a[0] < b[0] ? -1 : 1)));
const entries = new Map(
  [...found].map(([word, list]) => {
    const sorted = list.sort((a, b) => a.score - b.score || (a.sense < b.sense ? -1 : 1));
    return [word, sorted.filter((e) => sorted.filter((o) => o.pos === e.pos).indexOf(e) < MAX_ENTRIES).map(({ score: _, ...e }) => e)];
  }),
);
const index: WordnetIndex = {
  version: WORDNET_INDEX_VERSION,
  inputs: createHash("sha256").update(wordnetInputs(lexicon)).digest("hex"),
  entries: sortKeys(entries),
  routes: sortKeys(routes),
};
const body = `${JSON.stringify(index)}\n`;
writeFileSync(OUT, body);
const kb = (n: number) => `${(n / 1024).toFixed(0)} KB`;
console.log(`${entries.size} words, ${routes.size} routes → src/generated/english-wordnet.json (${kb(body.length)}, ${kb(gzipSync(body).length)} gzipped)`);
