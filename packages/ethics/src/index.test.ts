import assert from "node:assert/strict";
import test from "node:test";
import { EthicalAI } from "./index.js";

test("EthicalAI blocks personal-data decisions without consent", () => {
  const output = new EthicalAI().evaluateDecision({
    explanation: "This decision contains enough explanation for user review.",
    confidence: "medium",
    riskLevel: "medium",
    usesPersonalData: true,
    consentCaptured: false
  });

  assert.equal(output.compliant, false);
  assert.equal(output.blocked, true);
});
