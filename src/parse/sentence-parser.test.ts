import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";

import { createClassifyTables } from "./classify.js";
import { parseSentenceTokens, SentenceParseError } from "./sentence-parser.js";
import { tokenizeUtterance, tokensFromLexWords, punctToken } from "./tokenize.js";
import { classify } from "./classify.js";
import { parseWord } from "./word.js";

const rootDir = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const tables = createClassifyTables(
  readFileSync(join(rootDir, "data", "lexicon-published.csv"), "utf8"),
  readFileSync(join(rootDir, "data", "lexicon-overlays.csv"), "utf8"),
  readFileSync(join(rootDir, "data", "lexicon-compounds.csv"), "utf8"),
);

function tokens(text: string) {
  return tokenizeUtterance(text, tables);
}

describe("sentence-parser synthetic", () => {
  it("parses a lone subject-verb from classified words plus period", () => {
    const words = ["zazawan", "vawalal"].map((w) => classify(parseWord(w), tables));
    const stream = [...tokensFromLexWords(words), punctToken("period")];
    const result = parseSentenceTokens(stream);
    assert.equal(result.utterances[0]!.bodies[0]!.clause.units.length, 2);
  });

  it("parses polar-only turn yael.", () => {
    const result = parseSentenceTokens(tokens("yael."));
    assert.equal(result.utterances[0]!.left.polars[0]?.raw, "yael");
    assert.equal(result.utterances[0]!.bodies.length, 0);
  });

  it("parses emphatic yul yul as one prohibition", () => {
    const result = parseSentenceTokens(tokens("yul yul vazanal."));
    assert.equal(result.utterances.length, 1);
    assert.equal(result.utterances[0]!.left.leadForce?.raw, "yul");
    assert.equal(result.utterances[0]!.left.force?.raw, "yul");
    assert.equal(result.utterances[0]!.bodies.length, 1);
  });

  it("does not fold other repeated act words", () => {
    // A second turn starts only after a period; `yol` is not an echo like `yul yul`.
    const result = parseSentenceTokens(tokens("yol. yol vazanal."));
    assert.equal(result.utterances.length, 2);
    assert.equal(result.utterances[0]!.left.leadForce, undefined);
  });

  it("parses yal yol / yam yol as a rhetorical question", () => {
    const left = parseSentenceTokens(tokens("yal yol zar vegehel.")).utterances[0]!.left;
    assert.equal(left.leadForce?.raw, "yal");
    assert.equal(left.force?.raw, "yol");
    assert.equal(parseSentenceTokens(tokens("yam yol zazawan vowogal.")).utterances[0]!.left.leadForce?.raw, "yam");
  });

  it("attaches a factor number after an equative scale only", () => {
    const factorOf = (text: string) => {
      const unit = parseSentenceTokens(tokens(text)).utterances[0]!.bodies[0]!.clause.units[0]!;
      return unit.kind === "np" ? unit.coord.parts.find((p) => p.join)?.factor?.raw : undefined;
    };
    assert.equal(factorOf("zazawan zalahen zeol gelavam hradul."), "hradul");
    assert.equal(factorOf("zazawan zalahen zel gelavam hradul."), undefined);
    assert.equal(factorOf("zazawan zalahen zeol gelavam hral."), undefined);
  });

  it("takes digitless bral as a shared time scale after a rank join only", () => {
    const sharedOf = (text: string) => {
      const unit = parseSentenceTokens(tokens(text)).utterances[0]!.bodies[0]!.clause.units[0]!;
      const part = unit.kind === "np" ? unit.coord.parts.find((p) => p.join) : undefined;
      return part?.shared.map((item) => item.word.raw);
    };
    assert.deepEqual(sharedOf("zazawan zalahen zel bral vevahal."), ["bral"]);
    assert.deepEqual(sharedOf("zazawan zalahen zal bral vevahal."), []);
  });

  it("reads a sentence-initial hook with /b/ after it as an extra-noun hook", () => {
    const utt = parseSentenceTokens(tokens("ol bahazal zazawan vowogal.")).utterances[0]!;
    assert.equal(utt.left.hook, undefined);
    assert.equal(utt.bodies[0]!.clause.units[0]!.kind, "hook");
    const vocative = parseSentenceTokens(tokens("yazawan ol bahazal zalahen vowogal.")).utterances[0]!;
    assert.equal(vocative.left.hook, undefined);
    assert.equal(parseSentenceTokens(tokens("al zazawan vowogal.")).utterances[0]!.left.hook?.raw, "al");
  });

  it("puts a /ɡ/ after an /h/ host's /b/ on that landmark, but not after a /th/ offset", () => {
    const last = (text: string) => parseSentenceTokens(tokens(text)).utterances[0]!.bodies[0]!.clause.units.at(-1)!;
    const like = last("zazawan vowogal humum bazawan gubuhel.");
    assert.equal(like.kind === "h" ? like.unit.hosted?.adjs?.[0]?.word.raw : undefined, "gubuhel");
    assert.equal(last("zazawan thobam bral gamadam.").kind, "predicate");
  });

  it("lets a kin number on an /h/ host's landmark host its own /b/, but keeps a count as the amount", () => {
    const last = (text: string) => parseSentenceTokens(tokens(text)).utterances[0]!.bodies[0]!.clause.units.at(-1)!;
    const kin = last("zazawan vowogal han bobel grebuwol behon.");
    assert.equal(kin.kind === "h" ? kin.unit.hosted?.amount : "not h", undefined);
    assert.equal(kin.kind === "h" ? kin.unit.hosted?.adjs?.[0]?.hosted?.bound.raw : undefined, "behon");
    const offset = last("zazawan vowogal henum bazazam grawol.");
    assert.equal(offset.kind === "h" ? offset.unit.hosted?.amount?.raw : undefined, "grawol");
  });

  it("puts a /ɡ/ after a SHARED relation's /b/ on that landmark", () => {
    const shared = parseSentenceTokens(tokens("zodogal zagadul zal gobom bahazar gamazam.")).utterances[0]!.bodies[0]!.clause.units;
    assert.equal(shared.length, 1);
    const unit = shared[0]!;
    const part = unit.kind === "np" ? unit.coord.parts.find((p) => p.join) : undefined;
    const pair = part?.shared[0];
    assert.equal(pair && "hosted" in pair ? pair.hosted?.adjs?.[0]?.word.raw : undefined, "gamazam");
  });

  it("puts a hook + /b/ before a join word on the item before it", () => {
    const units = parseSentenceTokens(tokens("zazawan zodogal em bazawar zal vowogal.")).utterances[0]!.bodies[0]!.clause.units;
    assert.equal(units.length, 2);
    const np = units[0]!;
    const items = np.kind === "np" ? np.coord.parts[0]!.items : [];
    assert.equal(items.length, 2);
    const dog = items[1]!;
    const hook = dog.kind === "package" ? dog.package.adjs[0] : undefined;
    assert.equal(hook?.word.raw, "em");
    assert.equal(hook?.hosted?.bound.raw, "bazawar");
  });

  it("keeps a hook that is not right before a join word on the clause", () => {
    const units = parseSentenceTokens(tokens("zodogal em bazawan zagadul zal vowogal.")).utterances[0]!.bodies[0]!.clause.units;
    assert.equal(units[1]!.kind, "hook");
  });

  it("reads a signed measure on a time pole with no channel", () => {
    const units = parseSentenceTokens(tokens("yel zehon vaheham homam bazazam grawol.")).utterances[0]!.bodies[0]!.clause.units;
    const pole = units.at(-1)!;
    assert.equal(pole.kind === "h" ? pole.unit.word.raw : undefined, "homam");
    assert.equal(pole.kind === "h" ? pole.unit.hosted?.amount?.raw : undefined, "grawol");
  });

  it("reads a command with only a /ɡ/ body", () => {
    const units = parseSentenceTokens(tokens("yel geyayem.")).utterances[0]!.bodies[0]!.clause.units;
    assert.deepEqual(units.map((u) => u.kind), ["predicate"]);
  });

  it("keeps a stance join fence after /th/ words", () => {
    const units = parseSentenceTokens(tokens("zazawan vawalal thuvuvum thul.")).utterances[0]!.bodies[0]!.clause.units;
    const raws = units.flatMap((u) => (u.kind === "h" ? [u.unit.word.raw] : []));
    assert.deepEqual(raws, ["thuvuvum", "thul"]);
  });

  it("parses a standalone stance join with no /th/ words before it", () => {
    const units = parseSentenceTokens(tokens("yol zazawan vawalal thar.")).utterances[0]!.bodies[0]!.clause.units;
    const raws = units.flatMap((u) => (u.kind === "h" ? [u.unit.word.raw] : []));
    assert.deepEqual(raws, ["thar"]);
  });

  it("rejects leftover tokens after a complete clause", () => {
    assert.throws(() => parseSentenceTokens(tokens("zazawan vawalal yol.")), SentenceParseError);
  });
});
