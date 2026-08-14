export { createClassifyTables } from "./classify.js";
export { parseWithTables as parse } from "./parse-core.js";
export {
  chipsFor,
  endingSense,
  glossFor,
  inspectErrorFrom,
  inspectText,
  morphDetails,
} from "./inspect.js";
export type {
  InspectConstruction,
  InspectError,
  InspectErrorToken,
  InspectIslandToken,
  InspectPunctToken,
  InspectRelated,
  InspectResult,
  InspectToken,
  InspectWhy,
  InspectWordToken,
} from "./inspect.js";
export type { ClassifyTables } from "./classify.js";
export type { LexWord } from "./types.js";
