import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  concatMono,
  KITTEN_AUDIO_TRIM,
  KITTEN_SAMPLE_RATE,
  trimAudio,
} from "./speak-audio.js";

describe("trimAudio", () => {
  it("trims trailing samples per Kitten convention", () => {
    const samples = new Float32Array(KITTEN_AUDIO_TRIM + 100);
    const trimmed = trimAudio(samples);
    assert.equal(trimmed.length, 100);
  });

  it("returns empty when shorter than trim", () => {
    assert.equal(trimAudio(new Float32Array(10)).length, 0);
  });
});

describe("concatMono", () => {
  it("concatenates float chunks", () => {
    const a = new Float32Array([0.1, 0.2]);
    const b = new Float32Array([0.3]);
    const out = concatMono([a, b]);
    assert.equal(out.length, 3);
    assert.ok(Math.abs((out[0] ?? 0) - 0.1) < 1e-6);
    assert.ok(Math.abs((out[1] ?? 0) - 0.2) < 1e-6);
    assert.ok(Math.abs((out[2] ?? 0) - 0.3) < 1e-6);
  });
});

describe("KITTEN_SAMPLE_RATE", () => {
  it("is 24 kHz", () => {
    assert.equal(KITTEN_SAMPLE_RATE, 24000);
  });
});
