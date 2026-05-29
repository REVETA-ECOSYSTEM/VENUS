import assert from "node:assert/strict";
import test from "node:test";
import { routeRequest } from "./index.js";

test("health route returns ok", async () => {
  const response = await routeRequest("GET", "/health");
  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.body, { status: "ok" });
});

test("Landmark route delegates analysis", async () => {
  const response = await routeRequest("POST", "/landmark/analyze-property", {
    propertyRef: "ABJ-001",
    claimant: { fullName: "Tunde Bello", nationalId: "NIN-999" },
    consentCaptured: true,
    documents: [{ documentType: "title_deed", storageUrl: "https://storage.example/title.pdf", integrityScore: 0.9 }]
  });

  assert.equal(response.statusCode, 200);
  assert.equal((response.body as { audit: { decisionVersion: string } }).audit.decisionVersion, "landmark-trust-v1");
});
