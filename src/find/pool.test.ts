import assert from "node:assert/strict";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

import { loadDefaultTables } from "../parse/index.js";
import { FindUsageError, parseFindArgs, passFiles, runPass, scopePass } from "./pass.js";
import { passJobs, poolPass, runTasks, type PassTask } from "./pool.js";

const tables = loadDefaultTables();
const here = dirname(fileURLToPath(import.meta.url));
const fixtureMd = join(here, "fixtures/map-write.md");
const fixtureTs = join(here, "fixtures/map-write.ts");

describe("--jobs", () => {
  it("reads a positive count and refuses anything else", () => {
    assert.equal(parseFindArgs(["--word", "role=v", "--jobs", "3"]).jobs, 3);
    assert.equal(parseFindArgs(["--word", "role=v"]).jobs, undefined);
    assert.throws(() => parseFindArgs(["--word", "role=v", "--jobs", "0"]), FindUsageError);
    assert.throws(() => parseFindArgs(["--word", "role=v", "--jobs"]), /--jobs needs a positive whole number/);
  });

  it("caps the job count at the file count", () => {
    assert.equal(passJobs({ jobs: 8 }, 3), 3);
    assert.equal(passJobs({ jobs: 2 }, 0), 1);
  });
});

describe("inline pool (--jobs 1)", () => {
  it("poolPass matches runPass", async () => {
    const options = parseFindArgs(["--word", "family=joinMarker", "--jobs", "1"]);
    const files = passFiles([fixtureTs, fixtureMd]);
    assert.deepEqual(await poolPass(files, options, "unused-inline"), runPass(files, options, tables));
  });

  it("scope tasks match scopePass, in task order", async () => {
    const options = parseFindArgs(["--word", "family=joinMarker", "--jobs", "1"]);
    const files = [fixtureMd, fixtureTs];
    const tasks: PassTask[] = files.map((file) => ({ kind: "scope", file, rev: false, filter: true }));
    const replies = await runTasks(tasks, options, 1, "unused-inline");
    const records = replies.flatMap((reply) => (reply.kind === "scope" ? reply.records : []));
    assert.deepEqual(records, scopePass(files, options));
  });
});
