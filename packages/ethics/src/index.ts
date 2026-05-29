import { ConfidenceLevel, RiskLevel } from "@venus/agent-sdk";

export type EthicsGateInput = {
  explanation: string;
  confidence: ConfidenceLevel;
  riskLevel: RiskLevel;
  usesPersonalData: boolean;
  consentCaptured: boolean;
  fairnessSignals?: Record<string, number>;
};

export type EthicsGateResult = {
  safe: boolean;
  fair: boolean;
  compliant: boolean;
  blocked: boolean;
  notes: string[];
};

export class EthicalAI {
  evaluateDecision(input: EthicsGateInput): EthicsGateResult {
    const notes: string[] = [];
    const safe = input.explanation.trim().length >= 24;
    if (!safe) notes.push("Decision explanation is insufficient for user trust.");

    const fairnessValues = Object.values(input.fairnessSignals ?? {});
    const fair = fairnessValues.every((value) => value >= 0.8);
    if (!fair) notes.push("One or more fairness signals are below the launch threshold.");

    const compliant = !input.usesPersonalData || input.consentCaptured;
    if (!compliant) notes.push("Personal data processing requires captured consent.");

    if (input.riskLevel === "high" && input.confidence === "low") {
      notes.push("High-risk, low-confidence decision must be routed to human review.");
    }

    return {
      safe,
      fair,
      compliant,
      blocked: !safe || !fair || !compliant,
      notes
    };
  }
}
