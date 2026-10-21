// Browser entry for the wizard sandbox page (docs/grammar/.vitepress/components/WizardSandbox.vue).
// Node-only pieces (build.ts: gate data, the doc-derived error table, spelled fixed lines) reach the page
// through its data loader.
export { createEngine } from "./engine.js";
export type { Engine, EngineData, EngineOptions } from "./engine.js";
export { checkpointStops, EVERYTHING, gate } from "./gating.js";
export type { GateData, GateResult, GateSection, Progress } from "./gating.js";
export { exportTurnLog, logEntry } from "./log.js";
export type { LogEntry } from "./log.js";
export { QUESTS } from "./quests.js";
export type { Quest } from "./quests.js";
export { PLAYER } from "./scene.js";
export { traitsOf } from "./objects.js";
export { entity, heldBy, roomOf, visibleTo } from "./world.js";
export type { Entity, EntityId, ErrorCard, GateCheck, Line, Outcome, Spoken, TurnResult, World } from "./types.js";
