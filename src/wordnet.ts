/**
 * Read-only access to Open English WordNet 2025 (WNDB format), all four parts of speech: synsets,
 * hypernyms, hyponyms, similar-to and derivation pointers. Used
 * by the compound-fill candidate pass and the English helper's reverse index
 * (scripts/english-helper-wordnet.ts). The dictionary is fetched once into `tmp/oewn-2025/`.
 *
 * OEWN carries no SemCor tag counts, so the frequency hint comes from the Princeton WordNet 3.1
 * index files (`ensureSemcorCounts`), matched by lemma.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { gunzipSync, inflateRawSync } from "node:zlib";

import { REPO_ROOT } from "./repo-paths.js";

const WORDNET_DIR = join(REPO_ROOT, "tmp", "oewn-2025");
const WORDNET_URL = "https://en-word.net/downloads/english-wordnet-2025.zip";
const SEMCOR_DIR = join(REPO_ROOT, "tmp", "wordnet-3.1");
const SEMCOR_URL = "https://registry.npmjs.org/wordnet-db/-/wordnet-db-3.1.14.tgz";

export const WORDNET_POS = ["n", "v", "a", "r"] as const;
export type WordnetPos = (typeof WORDNET_POS)[number];
const FILE_POS: Record<WordnetPos, string> = { n: "noun", v: "verb", a: "adj", r: "adv" };
const INDEX_FILES = WORDNET_POS.map((pos) => `index.${FILE_POS[pos]}`);
const WORDNET_FILES = [...INDEX_FILES, ...WORDNET_POS.map((pos) => `data.${FILE_POS[pos]}`)];

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

/** Files of a ustar archive by path. */
export function untar(archive: Buffer): Map<string, Buffer> {
  const files = new Map<string, Buffer>();
  let pos = 0;
  while (pos + 512 <= archive.length) {
    const header = archive.subarray(pos, pos + 512);
    if (header.every((byte) => byte === 0)) break;
    const field = (start: number, length: number) =>
      header.subarray(start, start + length).toString("utf8").replace(/\0.*$/s, "");
    const name = [field(345, 155), field(0, 100)].filter(Boolean).join("/");
    const size = parseInt(field(124, 12).trim() || "0", 8);
    const type = field(156, 1);
    pos += 512;
    if (type === "" || type === "0") files.set(name, archive.subarray(pos, pos + size));
    pos += Math.ceil(size / 512) * 512;
  }
  return files;
}

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

/** Fetch `names` out of the archive at `url` into `dir`, once. */
async function ensureFiles(dir: string, url: string, names: string[], extract: (archive: Buffer) => Map<string, Buffer>, prefix: string): Promise<string> {
  if (names.every((name) => existsSync(join(dir, name)))) return dir;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`fetch ${url}: ${res.status}`);
  const files = extract(Buffer.from(await res.arrayBuffer()));
  mkdirSync(dir, { recursive: true });
  for (const name of names) {
    const body = files.get(`${prefix}${name}`);
    if (!body) throw new Error(`${url} has no ${prefix}${name}`);
    writeFileSync(join(dir, name), body);
  }
  return dir;
}

export const ensureWordnet = () => ensureFiles(WORDNET_DIR, WORDNET_URL, WORDNET_FILES, unzip, "oewn2025/");

/** Princeton WordNet 3.1 index files, read only for their SemCor tag counts. */
export const ensureSemcorCounts = () => ensureFiles(SEMCOR_DIR, SEMCOR_URL, INDEX_FILES, (a) => untar(gunzipSync(a)), "package/dict/");

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

/** `index.*` lines as lemma, synset offsets (most frequent first) and SemCor-tagged sense count. */
function* indexLines(dir: string, pos: WordnetPos): Generator<[string, number[], number]> {
  for (const line of readFileSync(join(dir, `index.${FILE_POS[pos]}`), "utf8").split("\n")) {
    if (!line || line.startsWith(" ")) continue;
    const parts = line.trim().split(" ");
    const senseCount = Number(parts[2]);
    yield [parts[0]!, parts.slice(-senseCount).map(Number), Number(parts[parts.length - senseCount - 1])];
  }
}

export class Wordnet {
  private readonly data = new Map<WordnetPos, Buffer>();
  private readonly index = new Map<WordnetPos, Map<string, number[]>>();
  /** Lemma → how many of its senses are tagged in SemCor, all parts of speech: a frequency hint. */
  private readonly taggedCounts = new Map<string, number>();

  /** `countsDir` holds index files whose SemCor tag counts back `tagged` (`ensureSemcorCounts`). */
  constructor(dir: string, countsDir?: string) {
    for (const pos of WORDNET_POS) {
      this.data.set(pos, readFileSync(join(dir, `data.${FILE_POS[pos]}`)));
      const index = new Map<string, number[]>();
      for (const [lemma, offsets] of indexLines(dir, pos)) index.set(lemma, offsets);
      this.index.set(pos, index);
      if (!countsDir) continue;
      for (const [lemma, , tagged] of indexLines(countsDir, pos)) {
        if (tagged) this.taggedCounts.set(lemma, (this.taggedCounts.get(lemma) ?? 0) + tagged);
      }
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

  /** Senses of `lemma` tagged in the SemCor corpus (0 for a rare word). */
  tagged(lemma: string): number {
    return this.taggedCounts.get(lemma.toLowerCase().replace(/ /g, "_")) ?? 0;
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
