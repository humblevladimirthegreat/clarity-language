import assert from "node:assert/strict";

import {
  normalizeModelId,
  resolveLlmConfig,
} from "./llm-client.js";

assert.equal(normalizeModelId("openai:qwen/qwen3.6-27b"), "qwen/qwen3.6-27b");
assert.equal(normalizeModelId("qwen/qwen3.6-27b"), "qwen/qwen3.6-27b");

const withLmStudio = resolveLlmConfig({
  LM_STUDIO_BASE_URL: "http://host.docker.internal:1234/v1/",
  LM_STUDIO_MODEL: "openai:qwen/qwen3.6-27b",
  OPENAI_API_KEY: "test-key",
  LLM_REQUEST_TIMEOUT_MS: "120000",
});
assert.equal(withLmStudio.baseUrl, "http://host.docker.internal:1234/v1");
assert.equal(withLmStudio.model, "qwen/qwen3.6-27b");
assert.equal(withLmStudio.apiKey, "test-key");
assert.equal(withLmStudio.requestTimeoutMs, 120000);

const legacy = resolveLlmConfig({
  OPENAI_BASE_URL: "http://127.0.0.1:1234/v1",
  METAPHOR_ASSIGN_MODEL: "my-model",
});
assert.equal(legacy.baseUrl, "http://127.0.0.1:1234/v1");
assert.equal(legacy.model, "my-model");

const lmStudioWins = resolveLlmConfig({
  LM_STUDIO_BASE_URL: "http://host.docker.internal:1234/v1",
  OPENAI_BASE_URL: "http://127.0.0.1:9999/v1",
});
assert.equal(lmStudioWins.baseUrl, "http://host.docker.internal:1234/v1");

console.log("llm-client tests passed");
