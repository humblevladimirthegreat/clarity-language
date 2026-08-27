import type { MorphWord, MorphWordFamily } from "../parse/types.js";

function posPrefix(word: MorphWord): string {
  if (!word.pos) {
    return "";
  }
  return word.gl ? `${word.pos}l` : word.pos;
}

function endingAndPlural(word: MorphWord): string {
  return `${word.ending ?? ""}${word.plural ? "sh" : ""}`;
}

function mapRoots(roots: string[], map: ReadonlyMap<string, string>): string[] {
  return roots.map((root) => map.get(root) ?? root);
}

function rootsChanged(before: string[], after: string[]): boolean {
  return before.length !== after.length || before.some((root, i) => root !== after[i]);
}

export function rewriteParsedWord(word: MorphWord, map: ReadonlyMap<string, string>): string | null {
  const family = word.family;
  if (family.kind === "content") {
    const next = mapRoots(family.roots, map);
    if (!rootsChanged(family.roots, next)) {
      return null;
    }
    return `${posPrefix(word)}${next.join("x")}${endingAndPlural(word)}`;
  }
  if (family.kind !== "x") {
    return null;
  }
  const left = mapRoots(family.leftRoots, map);
  const right = mapRoots(family.rightRoots ?? [], map);
  const leftChanged = rootsChanged(family.leftRoots, left);
  const rightChanged = rootsChanged(family.rightRoots ?? [], right);
  if (!leftChanged && !rightChanged) {
    return null;
  }
  return rebuildX(word, family, left, family.rightRoots ? right : undefined);
}

function rebuildX(
  word: MorphWord,
  family: Extract<MorphWordFamily, { kind: "x" }>,
  left: string[],
  right: string[] | undefined,
): string | null {
  const prefix = posPrefix(word);
  const tail = endingAndPlural(word);
  switch (family.xFamily) {
    case "span":
      return null;
    case "role": {
      const host = right?.[0] ?? "";
      if (!family.roleVowel || !host) {
        return null;
      }
      return `${prefix}${family.roleVowel}x${host}${tail}`;
    }
    case "valueAbility": {
      const host = left[0] ?? "";
      if (!host || !family.stanceVowel) {
        return null;
      }
      return `${prefix}${host}x${family.stanceVowel}${tail}`;
    }
    case "numeric": {
      const oldHost = family.leftRoots[0] ?? "";
      const newHost = left[0] ?? "";
      if (!oldHost || !newHost) {
        return null;
      }
      const afterPrefix = word.raw.slice(prefix.length);
      if (!afterPrefix.startsWith(oldHost)) {
        return null;
      }
      return `${prefix}${newHost}${afterPrefix.slice(oldHost.length)}`;
    }
    case "compound": {
      const rightParts = right ?? [];
      if (left.length === 0 || rightParts.length === 0) {
        return null;
      }
      return `${prefix}${left.join("x")}x${rightParts.join("x")}${tail}`;
    }
    default:
      return null;
  }
}
