import assert from "node:assert/strict";
import test from "node:test";
import { MetaCognition, ReasoningEngine } from "./index.js";

test("ReasoningEngine computes normalized weighted score", () => {
  const score = new ReasoningEngine().computeWeightedScore([
    { name: "a", weight: 0.7, score: 1 },
    { name: "b", weight: 0.3, score: 0.5 }
  ]);

  assert.equal(score, 0.85);
});

test("MetaCognition assigns low confidence when uncertainty is high", () => {
  const output = new MetaCognition().evaluateResponse([
    { name: "a", weight: 0.5, score: 1 },
    { name: "b", weight: 0.5, score: 0 }
  ]);

  assert.equal(output.confidence, "low");
});
