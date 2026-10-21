/**
 * Reachability check for a quest's abstract state: each action's preconditions and effects are data,
 * and a search confirms the goal is reachable from the start and from every reachable state. It walks the
 * quest's few variables, not the whole world, so it needs no planner.
 */

export type ModelState = Readonly<Record<string, string>>;
export type ModelAction = { name: string; pre: ModelState; post: ModelState };
export type QuestModel = { start: ModelState; actions: readonly ModelAction[]; goal: ModelState };

export type Reachability = {
  /** Every state reachable from the start. */
  states: number;
  goalFromStart: boolean;
  /** Reachable states from which the goal cannot be reached: dead ends. */
  deadEnds: ModelState[];
};

const key = (state: ModelState) => JSON.stringify(Object.keys(state).sort().map((k) => [k, state[k]]));
const holds = (state: ModelState, want: ModelState) => Object.entries(want).every(([k, v]) => state[k] === v);

export function checkReachability(model: QuestModel): Reachability {
  const states = new Map<string, ModelState>();
  const edges = new Map<string, Set<string>>();
  const queue: ModelState[] = [model.start];
  states.set(key(model.start), model.start);
  while (queue.length) {
    const state = queue.shift()!;
    const from = key(state);
    const out = new Set<string>();
    edges.set(from, out);
    for (const action of model.actions) {
      if (!holds(state, action.pre)) continue;
      const next = { ...state, ...action.post };
      const to = key(next);
      out.add(to);
      if (!states.has(to)) {
        states.set(to, next);
        queue.push(next);
      }
    }
  }
  // Backward from every goal state: whatever reaches one can still win.
  const winning = new Set([...states].filter(([, s]) => holds(s, model.goal)).map(([k]) => k));
  for (let grew = true; grew; ) {
    grew = false;
    for (const [from, out] of edges) {
      if (winning.has(from)) continue;
      if ([...out].some((to) => winning.has(to))) {
        winning.add(from);
        grew = true;
      }
    }
  }
  return {
    states: states.size,
    goalFromStart: winning.has(key(model.start)),
    deadEnds: [...states].filter(([k]) => !winning.has(k)).map(([, s]) => s),
  };
}
