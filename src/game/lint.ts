/**
 * Content lint for the wizard sandbox: every authored line spells from its gloss, parses one way with
 * lexicon roots, and uses no grammar past its quest's area; every quest's goal is reachable from every
 * reachable state; and every row the game names exists. `scripts/lint-game.ts` runs it in the build.
 */
import type { ClassifyTables } from "../parse/classify.js";
import { glossToAgeben } from "../parse/gloss-inverse.js";
import { unknownWords } from "../parse/lexicon-check.js";
import { parseWithTables } from "../parse/parse-core.js";
import { fullGlossIndex, spellFixed } from "./build.js";
import { FIXED, NOUN_ENGLISH } from "./generate.js";
import { neededPosition, type GateData } from "./gating.js";
import { gameLexicon } from "./lexicon.js";
import { OVERRIDES } from "./objects.js";
import { expandGloss, QUESTS } from "./quests.js";
import { checkReachability } from "./reachability.js";
import { SANDBOX } from "./scene.js";
import { HANDLERS } from "./verbs.js";

export type GameFinding = { where: string; detail: string };

/** Lines a quest's walkthrough spells to, with their constructions (for reports). */
export type SpelledLine = { gloss: string; ageben: string; constructions: string[] };

function checkLine(where: string, authored: string, tables: ClassifyTables, findings: GameFinding[]): SpelledLine | undefined {
  let ageben: string;
  let gloss = authored;
  try {
    gloss = expandGloss(authored, gameLexicon(tables));
    ageben = glossToAgeben(gloss, tables, fullGlossIndex(tables));
  } catch (error) {
    findings.push({ where, detail: `${gloss}: does not spell (${(error as Error).message})` });
    return undefined;
  }
  try {
    const result = parseWithTables(ageben, tables, { constructions: true, checkAmbiguity: true });
    if (result.ambiguity?.length) findings.push({ where, detail: `${ageben}: reads more than one way` });
    const unknown = unknownWords(result).map((w) => w.raw);
    if (unknown.length) findings.push({ where, detail: `${ageben}: not lexicon words: ${unknown.join(", ")}` });
    return { gloss, ageben, constructions: result.constructions ?? [] };
  } catch (error) {
    findings.push({ where, detail: `${ageben}: does not parse (${(error as Error).message.split("\n")[0]})` });
    return undefined;
  }
}

export function lintGame(tables: ClassifyTables, gate: GateData): GameFinding[] {
  const findings: GameFinding[] = [];
  const lex = gameLexicon(tables);

  const concretes = new Map<string, string>([
    ...Object.keys(HANDLERS).map((c) => [c, "verbs.ts HANDLERS"] as const),
    ...Object.keys(OVERRIDES).map((c) => [c, "objects.ts OVERRIDES"] as const),
    ...Object.values(OVERRIDES).flatMap((o) => (o.chases ?? []).map((c) => [c, "objects.ts OVERRIDES chases"] as const)),
    ...Object.keys(NOUN_ENGLISH).map((c) => [c, "generate.ts NOUN_ENGLISH"] as const),
    ...SANDBOX.rooms.map((r) => [r.thing, `scene.ts ${r.id}`] as const),
    ...SANDBOX.things.flatMap((t) => [t.thing, ...(t.name ? [t.name] : []), ...(t.props ?? [])].map((c) => [c, `scene.ts ${t.id}`] as const)),
  ]);
  for (const [concrete, where] of concretes) {
    try {
      lex.root(concrete);
    } catch {
      findings.push({ where, detail: `no published row has the concrete sense "${concrete}"` });
    }
  }

  try {
    spellFixed(tables);
  } catch (error) {
    findings.push({ where: "generate.ts FIXED", detail: (error as Error).message });
  }
  for (const [name, line] of Object.entries(FIXED)) checkLine(`generate.ts FIXED.${name}`, line.gloss, tables, findings);

  for (const quest of QUESTS) {
    const where = `quests.ts ${quest.id}`;
    const unknown = quest.needs.filter((id) => gate.homes[id] === undefined);
    if (unknown.length) findings.push({ where, detail: `needs constructions with no home section: ${unknown.join(", ")}` });
    const area = neededPosition(gate, quest.needs);
    for (const script of quest.walkthroughs) {
      for (const gloss of script) {
        const line = checkLine(where, gloss, tables, findings);
        if (!line) continue;
        const late = line.constructions.filter((id) => (gate.homes[id] ?? Number.POSITIVE_INFINITY) > area);
        if (late.length) {
          const homes = late.map((id) => `${id} (${gate.sections[gate.homes[id]!]?.anchor ?? "no home"})`);
          findings.push({ where, detail: `${line.ageben}: uses grammar past the quest's area (${gate.sections[area]?.anchor ?? "none"}): ${homes.join(", ")}` });
        }
      }
    }
    const reach = checkReachability(quest.model);
    if (!reach.goalFromStart) findings.push({ where, detail: "the goal is not reachable from the start" });
    for (const dead of reach.deadEnds.slice(0, 3)) findings.push({ where, detail: `dead end: ${JSON.stringify(dead)}` });
  }
  return findings;
}
