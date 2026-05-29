import assert from "node:assert/strict";
import test from "node:test";
import { analyzeProperty } from "./index.js";

test("Landmark analysis returns governed trust output", () => {
  const output = analyzeProperty({
    propertyRef: "LAGOS-IKJ-001",
    claimant: { fullName: "Ada Okafor", nationalId: "NIN-123" },
    consentCaptured: true,
    registryMatchScore: 0.82,
    ownershipVerificationScore: 0.88,
    fraudRiskScore: 0.77,
    historicalDisputesScore: 0.8,
    documents: [
      { documentType: "title_deed", storageUrl: "https://storage.example/title.pdf", integrityScore: 0.91 },
      { documentType: "survey_plan", storageUrl: "https://storage.example/survey.pdf", integrityScore: 0.86 }
    ]
  });

  assert.equal(output.analysisId, "analysis_lagos_ikj_001");
  assert.ok(output.trustScore >= 8);
  assert.equal(output.ethics.blocked, false);
  assert.equal(output.audit.decisionVersion, "landmark-trust-v1");
});

test("Landmark routes missing-consent cases to human review", () => {
  const output = analyzeProperty({
    propertyRef: "LAGOS-IKJ-002",
    claimant: { fullName: "Ada Okafor" },
    documents: [{ documentType: "other", storageUrl: "https://storage.example/other.pdf", integrityScore: 0.4 }]
  });

  assert.equal(output.ethics.compliant, false);
  assert.equal(output.ethics.blocked, true);
  assert.equal(output.humanReviewRequired, true);
  assert.ok(output.findings.some((finding) => finding.code === "CONSENT_REQUIRED"));
});
