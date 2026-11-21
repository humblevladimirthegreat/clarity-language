/**
 * The solver for the browser: the same calls as `solve.ts`, loaded on the first call. `solve.ts` and `clingo-wasm`
 * come in as a separate chunk by a dynamic import, so a page that never asks pays nothing; in a browser `clingo-wasm`
 * resolves to its web build, which runs Clingo in a module worker it spawns on its first run. A bundler must emit
 * that worker as an ES module (Vite: `worker: { format: "es" }`).
 */
import type * as Solve from "./solve.js";

export type { Answer, BlankSite, Clash, ClashResult, FillAnswer, Filler, FillOptions, FillVerdict, GiveUpResult, Label, Semantics, SolveOptions, SolveSwitch, SolveVerdict, Standing, StandsOptions, StandsResult, WhyNotResult } from "./solve.js";

let loading: Promise<typeof Solve> | undefined;

/** The solver module, imported once. */
const solver = (): Promise<typeof Solve> => (loading ??= import("./solve.js"));

/** {@link Solve.follows}: does the question follow from the log? */
export async function follows(...args: Parameters<typeof Solve.follows>): ReturnType<typeof Solve.follows> {
  return (await solver()).follows(...args);
}

/** {@link Solve.couldBe}: could the question be so? */
export async function couldBe(...args: Parameters<typeof Solve.couldBe>): ReturnType<typeof Solve.couldBe> {
  return (await solver()).couldBe(...args);
}

/** {@link Solve.clashes}: the log's smallest clashes. */
export async function clashes(...args: Parameters<typeof Solve.clashes>): ReturnType<typeof Solve.clashes> {
  return (await solver()).clashes(...args);
}

/** {@link Solve.giveUp}: a smallest set of readings to give up. */
export async function giveUp(...args: Parameters<typeof Solve.giveUp>): ReturnType<typeof Solve.giveUp> {
  return (await solver()).giveUp(...args);
}

/** {@link Solve.whyNot}: the smallest clash a claim joins. */
export async function whyNot(...args: Parameters<typeof Solve.whyNot>): ReturnType<typeof Solve.whyNot> {
  return (await solver()).whyNot(...args);
}

/** {@link Solve.stands}: what stands, each reading in, out or undecided. */
export async function stands(...args: Parameters<typeof Solve.stands>): ReturnType<typeof Solve.stands> {
  return (await solver()).stands(...args);
}

/** {@link Solve.fill}: what fills each blank of a fill question. */
export async function fill(...args: Parameters<typeof Solve.fill>): ReturnType<typeof Solve.fill> {
  return (await solver()).fill(...args);
}
