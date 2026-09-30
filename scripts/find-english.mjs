#!/usr/bin/env node
// Runs the find-english CLI (src/find-english/cli.ts); see lib/run-bundled.mjs.
import { runBundled } from "./lib/run-bundled.mjs";

await runBundled("find-english");
