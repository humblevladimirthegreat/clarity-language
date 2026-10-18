#!/usr/bin/env node
// Runs the English helper CLI (src/english-helper/cli.ts); see lib/run-bundled.mjs.
import { runBundled } from "./lib/run-bundled.mjs";

await runBundled("english-helper");
