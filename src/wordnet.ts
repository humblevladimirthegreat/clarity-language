/**
 * Read-only access to Princeton WordNet 3.1 noun hyponyms (WNDB format), for the
 * compound-fill candidate pass. The dictionary is fetched once into `tmp/wordnet/`.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { gunzipSync } from "node:zlib";

import { REPO_ROOT } from "./repo-paths.js";

const WORDNET_DIR = join(REPO_ROOT, "tmp", "wordnet");
const WORDNET_URL = "https://registry.npmjs.org/wordnet-db/-/wordnet-db-3.1.14.tgz";
const NOUN_FILES = ["index.noun", "data.noun"] as const;

export type Synset = {
  offset: number;
  /** Lemmas with `_` turned into spaces, in WordNet order. */
  words: string[];
  gloss: string;
  /** Offsets of direct hyponyms (`~`). Instance hyponyms (`~i`) are names and are left out. */
  hyponyms: number[];
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

export async function ensureWordnet(): Promise<string> {
  if (NOUN_FILES.every((name) => existsSync(join(WORDNET_DIR, name)))) return WORDNET_DIR;
  const res = await fetch(WORDNET_URL);
  if (!res.ok) throw new Error(`fetch ${WORDNET_URL}: ${res.status}`);
  const files = untar(gunzipSync(Buffer.from(await res.arrayBuffer())));
  mkdirSync(WORDNET_DIR, { recursive: true });
  for (const name of NOUN_FILES) {
    const body = files.get(`package/dict/${name}`);
    if (!body) throw new Error(`${WORDNET_URL} has no dict/${name}`);
    writeFileSync(join(WORDNET_DIR, name), body);
  }
  return WORDNET_DIR;
}

/** Parse one `data.noun` line. */
export function parseDataLine(line: string): Synset {
  const [head = "", gloss = ""] = line.split(" | ");
  const parts = head.trim().split(" ");
  const offset = Number(parts[0]);
  const wordCount = parseInt(parts[3]!, 16);
  const words: string[] = [];
  let i = 4;
  for (let w = 0; w < wordCount; w++, i += 2) words.push(parts[i]!.replace(/_/g, " "));
  const pointerCount = Number(parts[i++]);
  const hyponyms: number[] = [];
  for (let p = 0; p < pointerCount; p++, i += 4) {
    if (parts[i] === "~") hyponyms.push(Number(parts[i + 1]));
  }
  return { offset, words, gloss: gloss.trim(), hyponyms };
}

export class NounWordnet {
  private readonly data: Buffer;
  private readonly index = new Map<string, number[]>();

  constructor(dir: string) {
    this.data = readFileSync(join(dir, "data.noun"));
    for (const line of readFileSync(join(dir, "index.noun"), "utf8").split("\n")) {
      if (!line || line.startsWith(" ")) continue;
      const parts = line.trim().split(" ");
      const senseCount = Number(parts[2]);
      this.index.set(parts[0]!, parts.slice(-senseCount).map(Number));
    }
  }

  /** `herb.n.01`, `herb.n` (every sense), or a bare lemma (every sense). */
  lookup(name: string): Synset[] {
    const match = /^(.+?)(?:\.n(?:\.(\d+))?)?$/.exec(name.trim().toLowerCase())!;
    const offsets = this.index.get(match[1]!.replace(/ /g, "_")) ?? [];
    const picked = match[2] ? [offsets[Number(match[2]) - 1]].filter((o) => o !== undefined) : offsets;
    return picked.map((offset) => this.synset(offset));
  }

  synset(offset: number): Synset {
    const end = this.data.indexOf(0x0a, offset);
    return parseDataLine(this.data.subarray(offset, end < 0 ? undefined : end).toString("utf8"));
  }

  /** Hyponyms down to `depth` levels (1 = direct only), each once, in walk order. */
  hyponyms(root: Synset, depth = 1): Array<Synset & { depth: number }> {
    const out: Array<Synset & { depth: number }> = [];
    const seen = new Set([root.offset]);
    let frontier = [root];
    for (let level = 1; level <= depth; level++) {
      const next: Synset[] = [];
      for (const synset of frontier) {
        for (const offset of synset.hyponyms) {
          if (seen.has(offset)) continue;
          seen.add(offset);
          const child = this.synset(offset);
          out.push({ ...child, depth: level });
          next.push(child);
        }
      }
      frontier = next;
    }
    return out;
  }
}
