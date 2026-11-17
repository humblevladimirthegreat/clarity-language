#!/usr/bin/env node
// Runs the reading CLI (src/interpret/cli.ts); see lib/run-bundled.mjs.
import { runBundled } from "./lib/run-bundled.mjs";

await runBundled("interpret");
