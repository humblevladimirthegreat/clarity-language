/**
 * What one turn works with: the world, the generator, the gate, and the lines it writes. Speech always
 * shows in Ageben (with its gate result for testers); narration shows in Ageben only when the gate passes.
 */
import type { Draft, Generator, View } from "./generate.js";
import { gate, type GateData, type Progress } from "./gating.js";
import type { GameLexicon } from "./lexicon.js";
import type { Traits } from "./objects.js";
import { traits as traitsIn } from "./world.js";
import type { EntityId, Line, Spoken, World } from "./types.js";

export type Ctx = {
  world: World;
  lex: GameLexicon;
  gen: Generator;
  gateData: GateData;
  progress: Progress;
  lines: Line[];
};

export function traitsOf(ctx: Ctx, id: EntityId): Traits {
  return traitsIn(ctx.world, id, ctx.lex);
}

function gated(ctx: Ctx, spoken: Spoken) {
  return gate(ctx.gateData, ctx.progress, spoken.constructions, spoken.roots);
}

/** Entities now named in the conversation: later lines resume them with **-r**. */
export function remember(ctx: Ctx, mentions: EntityId[]): void {
  for (const id of mentions) if (!ctx.world.mentioned.includes(id)) ctx.world.mentioned.push(id);
}

/** A character speaks the first draft that spells; false (and nothing written) when none does. */
export function speak(ctx: Ctx, who: EntityId, drafts: Draft[]): boolean {
  const spoken = ctx.gen.say(drafts);
  if (!spoken) return false;
  remember(ctx, spoken.mentions);
  ctx.lines.push({ kind: "speech", speaker: who, spoken, gate: gated(ctx, spoken) });
  return true;
}

export function speakFixed(ctx: Ctx, who: EntityId, line: Parameters<Generator["fixed"]>[0]): boolean {
  const spoken = ctx.gen.fixed(line);
  if (!spoken) return false;
  ctx.lines.push({ kind: "speech", speaker: who, spoken, gate: gated(ctx, spoken) });
  return true;
}

/** Narration: Ageben when every construction and root in it is unlocked, else English. */
export function narrate(ctx: Ctx, english: string, drafts: Draft[] = []): void {
  const spoken = drafts.length ? ctx.gen.say(drafts) : undefined;
  if (!spoken) {
    ctx.lines.push({ kind: "narration", english });
    return;
  }
  remember(ctx, spoken.mentions);
  ctx.lines.push({ kind: "narration", english, spoken, gate: gated(ctx, spoken) });
}

/** Someone cannot or will not (or nobody is there to): in character when `who` is set, else in the narrator's voice. */
export function refuse(ctx: Ctx, english: string, who?: EntityId, drafts: Draft[] = []): "refused" {
  const spoken = drafts.length ? ctx.gen.say(drafts) : undefined;
  if (spoken) remember(ctx, spoken.mentions);
  ctx.lines.push({ kind: "refusal", ...(who ? { speaker: who } : {}), english, ...(spoken ? { spoken, gate: gated(ctx, spoken) } : {}) });
  return "refused";
}

/** English name of an entity in the narrator's view (the player is *you*). */
export function nameOf(ctx: Ctx, id: EntityId, view: View = { listener: ctx.world.player }): string {
  return ctx.gen.english(ctx.world, id, view);
}

/** `You open` / `The guard opens`: a subject and a verb that agree. */
export function clause(subject: string, verb: [string, string], rest = ""): string {
  const plain = subject === "you" || subject === "I";
  const text = `${subject} ${plain ? verb[0] : verb[1]}${rest ? ` ${rest}` : ""}.`;
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/** `a, b and c`. */
export function listEnglish(items: string[]): string {
  return items.length < 2 ? (items[0] ?? "") : `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}
