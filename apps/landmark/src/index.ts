import { DecisionAuditMetadata, RiskLevel } from "@venus/agent-sdk";
import { MetaCognition, WeightedSignal } from "@venus/core-intelligence";
import { EthicalAI, EthicsGateResult } from "@venus/ethics";

export type DocumentType = "title_deed" | "survey_plan" | "registry_extract" | "tax_receipt" | "other";

export type DocumentInput = {
  documentType: DocumentType;
  storageUrl: string;
  integrityScore?: number;
};

export type Party = {
  fullName: string;
  nationalId?: string;
  phone?: string;
};

export type PropertyAnalysisRequest = {
  propertyRef: string;
  claimant: Party;
  documents: DocumentInput[];
  registryMatchScore?: number;
  ownershipVerificationScore?: number;
  fraudRiskScore?: number;
  historicalDisputesScore?: number;
  consentCaptured?: boolean;
};

export type TrustFactor = {
  name: string;
  weight: number;
  score: number;
  note: string;
};

export type RiskFinding = {
  code: string;
  severity: RiskLevel;
  detail: string;
  evidence: string[];
};

export type TrustScoreResponse = {
  analysisId: string;
  trustScore: number;
  confidence: "low" | "medium" | "high";
  riskLevel: RiskLevel;
  explanation: string;
  factors: TrustFactor[];
  findings: RiskFinding[];
  ethics: EthicsGateResult;
  humanReviewRequired: boolean;
  audit: DecisionAuditMetadata;
};

const TRUST_WEIGHTS = {
  ownership_verification: 0.3,
  document_integrity: 0.25,
  registry_match: 0.2,
  fraud_risk: 0.15,
  historical_disputes: 0.1
} as const;

export class LandmarkTrustEngine {
  analyze(input: PropertyAnalysisRequest): TrustScoreResponse {
    this.validateInput(input);

    const factors = this.toSignals(input);
    const meta = new MetaCognition();
    const evaluation = meta.evaluateResponse(factors);
    const trustScore = Number((evaluation.normalizedScore * 10).toFixed(1));
    const riskLevel = this.toRiskLevel(trustScore, evaluation.uncertainty);
    const findings = this.findRisks(factors, input);
    const explanation = this.buildExplanation(trustScore, findings, factors);
    const ethics = new EthicalAI().evaluateDecision({
      explanation,
      confidence: evaluation.confidence,
      riskLevel,
      usesPersonalData: true,
      consentCaptured: input.consentCaptured === true,
      fairnessSignals: {
        scoringCompleteness: factors.length === Object.keys(TRUST_WEIGHTS).length ? 1 : 0.7
      }
    });

    const humanReviewRequired = meta.requiresHumanReview(evaluation) || ethics.blocked || riskLevel === "high";

    return {
      analysisId: `analysis_${input.propertyRef.replace(/[^a-zA-Z0-9]/g, "_").toLowerCase()}`,
      trustScore,
      confidence: evaluation.confidence,
      riskLevel,
      explanation,
      factors: factors.map((factor) => ({
        name: factor.name,
        weight: factor.weight,
        score: Number((factor.score * 10).toFixed(1)),
        note: factor.note ?? "No additional note"
      })),
      findings,
      ethics,
      humanReviewRequired,
      audit: {
        requestId: `req_${input.propertyRef.replace(/[^a-zA-Z0-9]/g, "_").toLowerCase()}`,
        decisionVersion: "landmark-trust-v1",
        timestamp: new Date().toISOString()
      }
    };
  }

  private validateInput(input: PropertyAnalysisRequest): void {
    if (!input.propertyRef.trim()) throw new Error("propertyRef is required");
    if (!input.claimant.fullName.trim()) throw new Error("claimant.fullName is required");
    if (input.documents.length === 0) throw new Error("At least one document is required");
  }

  private toSignals(input: PropertyAnalysisRequest): WeightedSignal[] {
    const documentIntegrity = input.documents.reduce((sum, doc) => sum + (doc.integrityScore ?? 0.72), 0) / input.documents.length;
    const requiredDocumentTypes = new Set<DocumentType>(["title_deed", "survey_plan"]);
    const hasRequiredDocs = input.documents.some((doc) => requiredDocumentTypes.has(doc.documentType));

    return [
      {
        name: "ownership_verification",
        weight: TRUST_WEIGHTS.ownership_verification,
        score: input.ownershipVerificationScore ?? (input.claimant.nationalId ? 0.72 : 0.55),
        note: input.claimant.nationalId ? "Claimant identity has a national identifier." : "Claimant identity is incomplete."
      },
      {
        name: "document_integrity",
        weight: TRUST_WEIGHTS.document_integrity,
        score: hasRequiredDocs ? documentIntegrity : documentIntegrity * 0.72,
        note: hasRequiredDocs ? "Required ownership documents are present." : "Missing title deed or survey plan."
      },
      {
        name: "registry_match",
        weight: TRUST_WEIGHTS.registry_match,
        score: input.registryMatchScore ?? 0.5,
        note: input.registryMatchScore === undefined ? "Registry integration pending; default confidence applied." : "Registry score supplied."
      },
      {
        name: "fraud_risk",
        weight: TRUST_WEIGHTS.fraud_risk,
        score: input.fraudRiskScore ?? 0.65,
        note: "Higher score means lower fraud probability."
      },
      {
        name: "historical_disputes",
        weight: TRUST_WEIGHTS.historical_disputes,
        score: input.historicalDisputesScore ?? 0.7,
        note: "Higher score means fewer known dispute signals."
      }
    ];
  }

  private findRisks(factors: WeightedSignal[], input: PropertyAnalysisRequest): RiskFinding[] {
    const findings: RiskFinding[] = [];
    for (const factor of factors) {
      if (factor.score < 0.55) {
        findings.push({
          code: `LOW_${factor.name.toUpperCase()}`,
          severity: factor.score < 0.35 ? "high" : "medium",
          detail: factor.note ?? `${factor.name} is below acceptable threshold.`,
          evidence: [factor.name]
        });
      }
    }

    if (!input.consentCaptured) {
      findings.push({
        code: "CONSENT_REQUIRED",
        severity: "high",
        detail: "Consent must be captured before processing personally identifiable ownership data.",
        evidence: ["claimant"]
      });
    }

    return findings;
  }

  private toRiskLevel(trustScore: number, uncertainty: number): RiskLevel {
    if (trustScore < 5.5 || uncertainty >= 0.45) return "high";
    if (trustScore < 7.5 || uncertainty >= 0.25) return "medium";
    return "low";
  }

  private buildExplanation(trustScore: number, findings: RiskFinding[], factors: WeightedSignal[]): string {
    const strongest = [...factors].sort((a, b) => b.score - a.score)[0];
    const weakest = [...factors].sort((a, b) => a.score - b.score)[0];
    const riskSummary = findings.length === 0 ? "No material red flags were detected." : `${findings.length} risk finding(s) require review.`;
    return `Landmark produced a trust score of ${trustScore}/10. ${riskSummary} Strongest signal: ${strongest.name}. Weakest signal: ${weakest.name}.`;
  }
}

export function analyzeProperty(input: PropertyAnalysisRequest): TrustScoreResponse {
  return new LandmarkTrustEngine().analyze(input);
}
