/**
 * Read-only access to Open English WordNet 2025 (WNDB format), all four parts of speech: synsets,
 * hypernyms, hyponyms, similar-to and derivation pointers. Used
 * by the compound-fill candidate pass and the English helper's reverse index
 * (scripts/english-helper-wordnet.ts). The dictionary is fetched once into `tmp/oewn-2025/`.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { inflateRawSync } from "node:zlib";

import { REPO_ROOT } from "./repo-paths.js";

const WORDNET_DIR = join(REPO_ROOT, "tmp", "oewn-2025");
const WORDNET_URL = "https://en-word.net/downloads/english-wordnet-2025.zip";

export const WORDNET_POS = ["n", "v", "a", "r"] as const;
export type WordnetPos = (typeof WORDNET_POS)[number];
const FILE_POS: Record<WordnetPos, string> = { n: "noun", v: "verb", a: "adj", r: "adv" };
const WORDNET_FILES = WORDNET_POS.flatMap((pos) => [`index.${FILE_POS[pos]}`, `data.${FILE_POS[pos]}`]);

export type Pointer = {
  /** `@` hypernym, `~` hyponym, `+` derivation, `&` similar-to, … */
  symbol: string;
  offset: number;
  pos: WordnetPos;
  /** Word numbers (1-based) for a lexical pointer; 0 for a pointer between whole synsets. */
  source: number;
  target: number;
};

export type Synset = {
  offset: number;
  pos: WordnetPos;
  /** Lemmas with `_` turned into spaces, in WordNet order. */
  words: string[];
  gloss: string;
  /** Offsets of direct hyponyms (`~`). Instance hyponyms (`~i`) are names and are left out. */
  hyponyms: number[];
  /** Offsets of direct hypernyms (`@`). */
  hypernyms: number[];
  pointers: Pointer[];
};

/** Files of a zip archive by path (stored or deflated entries). */
export function unzip(archive: Buffer): Map<string, Buffer> {
  const files = new Map<string, Buffer>();
  const end = archive.lastIndexOf(Buffer.from([0x50, 0x4b, 0x05, 0x06]));
  if (end < 0) throw new Error("not a zip archive");
  let pos = archive.readUInt32LE(end + 16);
  for (let n = archive.readUInt16LE(end + 10); n > 0; n--) {
    const method = archive.readUInt16LE(pos + 10);
    const size = archive.readUInt32LE(pos + 20);
    const nameLength = archive.readUInt16LE(pos + 28);
    const local = archive.readUInt32LE(pos + 42);
    const name = archive.subarray(pos + 46, pos + 46 + nameLength).toString("utf8");
    pos += 46 + nameLength + archive.readUInt16LE(pos + 30) + archive.readUInt16LE(pos + 32);
    const start = local + 30 + archive.readUInt16LE(local + 26) + archive.readUInt16LE(local + 28);
    const body = archive.subarray(start, start + size);
    if (!name.endsWith("/")) files.set(name, method === 8 ? inflateRawSync(body) : body);
  }
  return files;
}

export async function ensureWordnet(): Promise<string> {
  if (WORDNET_FILES.every((name) => existsSync(join(WORDNET_DIR, name)))) return WORDNET_DIR;
  const res = await fetch(WORDNET_URL);
  if (!res.ok) throw new Error(`fetch ${WORDNET_URL}: ${res.status}`);
  const files = unzip(Buffer.from(await res.arrayBuffer()));
  mkdirSync(WORDNET_DIR, { recursive: true });
  for (const name of WORDNET_FILES) {
    const body = files.get(`oewn2025/${name}`);
    if (!body) throw new Error(`${WORDNET_URL} has no oewn2025/${name}`);
    writeFileSync(join(WORDNET_DIR, name), body);
  }
  return WORDNET_DIR;
}

/** Parse one `data.*` line. Adjective satellites (`s`) count as `a`. */
export function parseDataLine(line: string): Synset {
  const [head = "", gloss = ""] = line.split(" | ");
  const parts = head.trim().split(" ");
  const offset = Number(parts[0]);
  const pos = (parts[2] === "s" ? "a" : parts[2]) as WordnetPos;
  const wordCount = parseInt(parts[3]!, 16);
  const words: string[] = [];
  let i = 4;
  // Adjective lemmas can carry a syntactic marker: `galore(ip)`.
  for (let w = 0; w < wordCount; w++, i += 2) words.push(parts[i]!.replace(/\(\w+\)$/, "").replace(/_/g, " "));
  const pointerCount = Number(parts[i++]);
  const pointers: Pointer[] = [];
  for (let p = 0; p < pointerCount; p++, i += 4) {
    const st = parts[i + 3]!;
    const target = parts[i + 2]!;
    pointers.push({
      symbol: parts[i]!,
      offset: Number(parts[i + 1]),
      pos: (target === "s" ? "a" : target) as WordnetPos,
      source: parseInt(st.slice(0, 2), 16),
      target: parseInt(st.slice(2), 16),
    });
  }
  const hyponyms = pointers.filter((p) => p.symbol === "~").map((p) => p.offset);
  const hypernyms = pointers.filter((p) => p.symbol === "@").map((p) => p.offset);
  return { offset, pos, words, gloss: gloss.trim(), hyponyms, hypernyms, pointers };
}

export type Hyponym = Synset & { depth: number };



export class Wordnet {
  private readonly data = new Map<WordnetPos, Buffer>();
  private readonly index = new Map<WordnetPos, Map<string, number[]>>();
  constructor(dir: string) {
    for (const pos of WORDNET_POS) {
      this.data.set(pos, readFileSync(join(dir, `data.${FILE_POS[pos]}`)));
      const index = new Map<string, number[]>();
      for (const line of readFileSync(join(dir, `index.${FILE_POS[pos]}`), "utf8").split("\n")) {
        if (!line || line.startsWith(" ")) continue;
        const parts = line.trim().split(" ");
        index.set(parts[0]!, parts.slice(-Number(parts[2])).map(Number));
      }
      this.index.set(pos, index);
    }
  }

  /**
   * `herb.n.01`, `herb.n` (every noun sense), or a bare lemma (every sense of `pos`, nouns by
   * default). Senses come in WordNet order, most frequent first.
   */
  lookup(name: string, pos: WordnetPos = "n"): Synset[] {
    const match = /^(.+?)(?:\.([nvar])(?:\.(\d+))?)?$/.exec(name.trim().toLowerCase())!;
    const p = (match[2] as WordnetPos | undefined) ?? pos;
    const offsets = this.index.get(p)!.get(match[1]!.replace(/ /g, "_")) ?? [];
    const picked = match[3] ? [offsets[Number(match[3]) - 1]].filter((o) => o !== undefined) : offsets;
    return picked.map((offset) => this.synset(offset, p));
  }

  /** Synset offsets for `lemma`, most frequent sense first. */
  offsets(lemma: string, pos: WordnetPos): number[] {
    return this.index.get(pos)!.get(lemma.toLowerCase().replace(/ /g, "_")) ?? [];
  }

  /** Every lemma in the index for `pos`, with `_` as spaces. */
  lemmas(pos: WordnetPos): string[] {
    return [...this.index.get(pos)!.keys()].map((l) => l.replace(/_/g, " "));
  }

  synset(offset: number, pos: WordnetPos = "n"): Synset {
    const data = this.data.get(pos)!;
    const end = data.indexOf(0x0a, offset);
    return parseDataLine(data.subarray(offset, end < 0 ? undefined : end).toString("utf8"));
  }

  /** Synsets a pointer leads to, by symbol (`&` similar-to, `+` derivation, …). */
  related(synset: Synset, symbol: string): Synset[] {
    return synset.pointers.filter((p) => p.symbol === symbol).map((p) => this.synset(p.offset, p.pos));
  }

  /**
   * Words a lexical `+` pointer links to from `lemma` in this synset (*hasty* → *haste*),
   * with the target's part of speech.
   */
  derived(synset: Synset, lemma: string): { word: string; pos: WordnetPos }[] {
    const n = synset.words.indexOf(lemma) + 1;
    if (!n) return [];
    return synset.pointers
      .filter((p) => p.symbol === "+" && p.source === n)
      .map((p) => ({ word: this.synset(p.offset, p.pos).words[p.target - 1]!, pos: p.pos }))
      .filter((d) => d.word);
  }

  /** Every hypernym above `synset`, nearest first, each once. */
  ancestors(synset: Synset): Synset[] {
    const out: Synset[] = [];
    const seen = new Set([synset.offset]);
    let frontier = [synset];
    while (frontier.length) {
      const next: Synset[] = [];
      for (const s of frontier) {
        for (const offset of s.hypernyms) {
          if (seen.has(offset)) continue;
          seen.add(offset);
          const parent = this.synset(offset, s.pos);
          out.push(parent);
          next.push(parent);
        }
      }
      frontier = next;
    }
    return out;
  }

  /** Hyponyms down to `depth` levels (1 = direct only), each once, in walk order. */
  hyponyms(root: Synset, depth = 1): Hyponym[] {
    const out: Hyponym[] = [];
    const seen = new Set([root.offset]);
    let frontier = [root];
    for (let level = 1; level <= depth; level++) {
      const next: Synset[] = [];
      for (const synset of frontier) {
        for (const offset of synset.hyponyms) {
          if (seen.has(offset)) continue;
          seen.add(offset);
          const child = this.synset(offset, synset.pos);
          out.push({ ...child, depth: level });
          next.push(child);
        }
      }
      frontier = next;
    }
    return out;
  }
}
