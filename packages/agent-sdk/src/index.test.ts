import assert from "node:assert/strict";
import test from "node:test";
import { createAgentMessage, toConfidenceLevel } from "./index.js";

test("createAgentMessage fills id and timestamp", () => {
  const message = createAgentMessage({
    source: "api-gateway",
    target: "landmark",
    intent: "analyze_property",
    context: {},
    payload: { propertyRef: "LAGOS-1" },
    metadata: { confidence: 0.8, risk_level: "low" }
  });

  assert.ok(message.id.length > 10);
  assert.equal(message.intent, "analyze_property");
});

test("toConfidenceLevel maps numeric confidence", () => {
  assert.equal(toConfidenceLevel(0.81), "high");
  assert.equal(toConfidenceLevel(0.6), "medium");
  assert.equal(toConfidenceLevel(0.2), "low");
});
