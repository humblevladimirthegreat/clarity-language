#!/usr/bin/env node
// Runs the find CLI (src/find/cli.ts); see lib/run-bundled.mjs.
import { runBundled } from "./lib/run-bundled.mjs";

await runBundled("find");
