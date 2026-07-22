/**
 * Propagate prototype literals to variant rows (Phase 1 collapse).
 * Alias for: npm run collapse-variants propagate
 */
import { runPropagate } from "./collapse-variants.js";

const force = process.argv.includes("--force");
runPropagate({ force });
