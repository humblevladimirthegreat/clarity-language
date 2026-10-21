import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { QUESTS } from "./quests.js";
import { checkReachability, type QuestModel } from "./reachability.js";

describe("checkReachability", () => {
  for (const quest of QUESTS) {
    it(`${quest.id}: the goal is reachable from every reachable state`, () => {
      const result = checkReachability(quest.model);
      assert.ok(result.goalFromStart);
      assert.deepEqual(result.deadEnds, []);
    });
  }

  it("finds a dead end", () => {
    const model: QuestModel = {
      start: { key: "whole" },
      actions: [
        { name: "burn the key", pre: { key: "whole" }, post: { key: "ash" } },
        { name: "open the door", pre: { key: "whole" }, post: { door: "open" } },
      ],
      goal: { door: "open" },
    };
    const result = checkReachability(model);
    assert.ok(result.goalFromStart);
    assert.deepEqual(result.deadEnds, [{ key: "ash" }]);
  });
});
