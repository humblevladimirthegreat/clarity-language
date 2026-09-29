#!/usr/bin/env node
// Runs the parse CLI (src/parse/cli.ts); see lib/run-bundled.mjs.
import { runBundled } from "./lib/run-bundled.mjs";

await runBundled("parse");
