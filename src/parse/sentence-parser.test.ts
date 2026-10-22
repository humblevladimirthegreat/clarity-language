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
    const words = ["zuzozen", "vawalal"].map((w) => classify(parseWord(w), tables));
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
    const result = parseSentenceTokens(tokens("yul yul vazawdzorzal."));
    assert.equal(result.utterances.length, 1);
    assert.equal(result.utterances[0]!.left.leadForce?.raw, "yul");
    assert.equal(result.utterances[0]!.left.force?.raw, "yul");
    assert.equal(result.utterances[0]!.bodies.length, 1);
  });

  it("starts a new turn after a period, not a stack", () => {
    const result = parseSentenceTokens(tokens("yol. yol vazawdzorzal."));
    assert.equal(result.utterances.length, 2);
    assert.equal(result.utterances[0]!.left.leadForce, undefined);
  });

  it("continues a turn with a plain sentence, and gives each body the period after its own sentence", () => {
    const result = parseSentenceTokens(tokens("yol. zuzozen vowurel"));
    assert.equal(result.utterances.length, 1);
    assert.equal(result.utterances[0]!.bodies[0]!.punct, undefined);
    assert.equal(parseSentenceTokens(tokens("yol. zuzozen vowurel.")).utterances[0]!.bodies[0]!.punct, "period");
  });

  it("reads a /w/ + hook after a period as discourse glue, as at the start (hooks.md#hook-w)", () => {
    const result = parseSentenceTokens(tokens("zuzozen vowurel. wewem al zolazun vezuvol."));
    assert.equal(result.utterances.length, 2);
    assert.equal(result.utterances[1]!.left.hook?.raw, "al");
    assert.equal(result.utterances[1]!.left.hookModifiers?.[0]?.raw, "wewem");
  });

  it("parses two stacked act words, outer first (speech-moves.md#stacked-acts)", () => {
    const left = parseSentenceTokens(tokens("yal yol zar vegemal.")).utterances[0]!.left;
    assert.equal(left.leadForce?.raw, "yal");
    assert.equal(left.force?.raw, "yol");
    for (const [text, outer, inner] of [
      ["yam yom zuzozen vowurel.", "yam", "yom"],
      ["yel yol vanuvul dobogal zawan.", "yel", "yol"],
      ["yol yal zar vanuvul dobogal.", "yol", "yal"],
      ["yel yem vowurel.", "yel", "yem"],
      ["yal yal zuzozen vowurel.", "yal", "yal"],
    ] as const) {
      const stacked = parseSentenceTokens(tokens(text)).utterances[0]!.left;
      assert.equal(stacked.leadForce?.raw, outer, text);
      assert.equal(stacked.force?.raw, inner, text);
    }
  });

  it("attaches a factor number after an equative scale only", () => {
    const factorOf = (text: string) => {
      const unit = parseSentenceTokens(tokens(text)).utterances[0]!.bodies[0]!.clause.units[0]!;
      return unit.kind === "np" ? unit.coord.parts.find((p) => p.join)?.factor?.raw : undefined;
    };
    assert.equal(factorOf("zuzozen zolazun zoel gelazom hradol."), "hradol");
    assert.equal(factorOf("zuzozen zolazun zel gelazom hradol."), undefined);
    assert.equal(factorOf("zuzozen zolazun zoel gelazom hral."), undefined);
  });

  it("takes digitless bral as a shared time scale after a rank join only", () => {
    const sharedOf = (text: string) => {
      const unit = parseSentenceTokens(tokens(text)).utterances[0]!.bodies[0]!.clause.units[0]!;
      const part = unit.kind === "np" ? unit.coord.parts.find((p) => p.join) : undefined;
      return part?.shared.map((item) => item.word.raw);
    };
    assert.deepEqual(sharedOf("zuzozen zolazun zel bral vovurel."), ["bral"]);
    assert.deepEqual(sharedOf("zuzozen zolazun zal bral vovurel."), []);
  });

  it("reads a sentence-initial hook with /b/ after it as an extra-noun hook", () => {
    const utt = parseSentenceTokens(tokens("ol bahehal zuzozen vowurel.")).utterances[0]!;
    assert.equal(utt.left.hook, undefined);
    assert.equal(utt.bodies[0]!.clause.units[0]!.kind, "hook");
    const vocative = parseSentenceTokens(tokens("yuzozen ol bahehal zolazun vowurel.")).utterances[0]!;
    assert.equal(vocative.left.hook, undefined);
    assert.equal(parseSentenceTokens(tokens("al zuzozen vowurel.")).utterances[0]!.left.hook?.raw, "al");
  });

  it("puts a /ɡ/ after an /h/ host's /b/ on that landmark, but not after a /th/ offset", () => {
    const last = (text: string) => parseSentenceTokens(tokens(text)).utterances[0]!.bodies[0]!.clause.units.at(-1)!;
    const like = last("zuzozen vowurel hewom bluzozen gubulel.");
    assert.equal(like.kind === "h" ? like.unit.hosted?.adjs?.[0]?.word.raw : undefined, "gubulel");
    assert.equal(last("zuzozen thubem blral gamahum.").kind, "predicate");
  });

  it("lets a kin number on an /h/ host's landmark host its own /b/, but keeps a count as the amount", () => {
    const last = (text: string) => parseSentenceTokens(tokens(text)).utterances[0]!.bodies[0]!.clause.units.at(-1)!;
    const kin = last("zuzozen vowurel han bleyol grewubal blawan.");
    assert.equal(kin.kind === "h" ? kin.unit.hosted?.amount : "not h", undefined);
    assert.equal(kin.kind === "h" ? kin.unit.hosted?.adjs?.[0]?.hosted?.bound.raw : undefined, "blawan");
    const offset = last("zuzozen vowurel halam bluzurem grabal.");
    assert.equal(offset.kind === "h" ? offset.unit.hosted?.amount?.raw : undefined, "grabal");
  });

  it("puts a /ɡ/ after a SHARED relation's /b/ on that landmark", () => {
    const shared = parseSentenceTokens(tokens("zudozol zagozol zal gobem blahehar gamezom.")).utterances[0]!.bodies[0]!.clause.units;
    assert.equal(shared.length, 1);
    const unit = shared[0]!;
    const part = unit.kind === "np" ? unit.coord.parts.find((p) => p.join) : undefined;
    const pair = part?.shared[0];
    assert.equal(pair && "hosted" in pair ? pair.hosted?.adjs?.[0]?.word.raw : undefined, "gamezom");
  });

  it("puts a hook + /b/ before a join word on the item before it", () => {
    const units = parseSentenceTokens(tokens("zuzozen zudozol em buzozer zal vowurel.")).utterances[0]!.bodies[0]!.clause.units;
    assert.equal(units.length, 2);
    const np = units[0]!;
    const items = np.kind === "np" ? np.coord.parts[0]!.items : [];
    assert.equal(items.length, 2);
    const dog = items[1]!;
    const hook = dog.kind === "package" ? dog.package.adjs[0] : undefined;
    assert.equal(hook?.word.raw, "em");
    assert.equal(hook?.hosted?.bound.raw, "buzozer");
  });

  it("keeps a hook that is not right before a join word on the clause", () => {
    const units = parseSentenceTokens(tokens("zudozol em buzozen zagozol zal vowurel.")).utterances[0]!.bodies[0]!.clause.units;
    assert.equal(units[1]!.kind, "hook");
  });

  it("reads a signed measure on a time pole with no channel", () => {
    const units = parseSentenceTokens(tokens("yel zawan vuhamum harum bluzurem grabal.")).utterances[0]!.bodies[0]!.clause.units;
    const pole = units.at(-1)!;
    assert.equal(pole.kind === "h" ? pole.unit.word.raw : undefined, "harum");
    assert.equal(pole.kind === "h" ? pole.unit.hosted?.amount?.raw : undefined, "grabal");
  });

  it("reads a command with only a /ɡ/ body", () => {
    const units = parseSentenceTokens(tokens("yel gayulem.")).utterances[0]!.bodies[0]!.clause.units;
    assert.deepEqual(units.map((u) => u.kind), ["predicate"]);
  });

  it("keeps a stance join fence after /th/ words", () => {
    const units = parseSentenceTokens(tokens("zuzozen vawalal thuvuvum thul.")).utterances[0]!.bodies[0]!.clause.units;
    const raws = units.flatMap((u) => (u.kind === "h" ? [u.unit.word.raw] : []));
    assert.deepEqual(raws, ["thuvuvum", "thul"]);
  });

  it("parses a standalone stance join with no /th/ words before it", () => {
    const units = parseSentenceTokens(tokens("yol zuzozen vawalal thar.")).utterances[0]!.bodies[0]!.clause.units;
    const raws = units.flatMap((u) => (u.kind === "h" ? [u.unit.word.raw] : []));
    assert.deepEqual(raws, ["thar"]);
  });

  it("rejects leftover tokens after a complete clause", () => {
    assert.throws(() => parseSentenceTokens(tokens("zuzozen vawalal yol.")), SentenceParseError);
  });
});
