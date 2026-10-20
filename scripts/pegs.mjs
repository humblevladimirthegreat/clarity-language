#!/usr/bin/env node
// Runs the digit-pegs CLI (src/pegs/cli.ts); see lib/run-bundled.mjs.
import { runBundled } from "./lib/run-bundled.mjs";

await runBundled("pegs");
