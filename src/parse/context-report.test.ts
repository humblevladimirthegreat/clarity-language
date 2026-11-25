import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { contextTokens, measureDecisions } from "./context-report.js";
import { loadDefaultTables } from "./index.js";

const tables = loadDefaultTables();

function decisionsAt(text: string, word: string) {
  const tokens = contextTokens(text, tables);
  const at = tokens.findIndex((t) => t.image === word);
  assert.ok(at >= 0, `${word} in ${text}`);
  return measureDecisions(tokens).filter((d) => d.at === at);
}

describe("context report", () => {
  it("a bl- word after its host is decided by the word before it", () => {
    const [hosted] = decisionsAt("zodozel vezuvel hewem blazozon.", "blazozon").filter((d) => d.pass === "hosted");
    assert.deepEqual(hosted && { to: hosted.to, ahead: hosted.ahead }, { to: "HostedBNoun", ahead: 0 });
  });

  it("a verb with more of its list after it waits for the join", () => {
    const [verb] = decisionsAt("zazozon vowurol dahelan vayebel val.", "vowurol").filter((d) => d.pass === "verbEnd");
    assert.deepEqual(verb && { to: verb.to, ahead: verb.ahead }, { to: "VPlainMore", ahead: 2 });
  });

  it("a decision that waits for a join settles at the join, one made by the word before it at itself", () => {
    const [more] = decisionsAt("zazozon vowurol dahelan vayebel val.", "vowurol").filter((d) => d.pass === "verbEnd");
    assert.equal(more?.settles, "join");
    const [hosted] = decisionsAt("zodozel vezuvel hewem blazozon.", "blazozon").filter((d) => d.pass === "hosted");
    assert.equal(hosted?.settles, "itself");
  });
});
