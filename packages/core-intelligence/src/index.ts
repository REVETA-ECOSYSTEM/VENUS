import { ConfidenceLevel, toConfidenceLevel } from "@venus/agent-sdk";

export type WeightedSignal = {
  name: string;
  weight: number;
  score: number;
  note?: string;
};

export type DecisionEvaluation = {
  normalizedScore: number;
  confidence: ConfidenceLevel;
  uncertainty: number;
  factors: WeightedSignal[];
};

export class ReasoningEngine {
  computeWeightedScore(signals: WeightedSignal[]): number {
    if (signals.length === 0) {
      throw new Error("At least one weighted signal is required");
    }

    const totalWeight = signals.reduce((sum, signal) => sum + signal.weight, 0);
    if (totalWeight <= 0) {
      throw new Error("Total signal weight must be greater than zero");
    }

    const weightedTotal = signals.reduce((sum, signal) => {
      const boundedScore = Math.max(0, Math.min(1, signal.score));
      return sum + boundedScore * signal.weight;
    }, 0);

    return Number((weightedTotal / totalWeight).toFixed(4));
  }

  quantifyUncertainty(signals: WeightedSignal[]): number {
    const missingSignals = signals.filter((signal) => signal.score <= 0.01).length;
    const scoreSpread = Math.max(...signals.map((signal) => signal.score)) - Math.min(...signals.map((signal) => signal.score));
    return Number(Math.min(1, missingSignals * 0.15 + scoreSpread * 0.35).toFixed(4));
  }
}

export class MetaCognition {
  evaluateResponse(signals: WeightedSignal[]): DecisionEvaluation {
    const reasoning = new ReasoningEngine();
    const normalizedScore = reasoning.computeWeightedScore(signals);
    const uncertainty = reasoning.quantifyUncertainty(signals);
    const confidence = toConfidenceLevel(Math.max(0, normalizedScore - uncertainty / 2));

    return {
      normalizedScore,
      confidence,
      uncertainty,
      factors: signals
    };
  }

  requiresHumanReview(evaluation: DecisionEvaluation): boolean {
    return evaluation.confidence === "low" || evaluation.uncertainty >= 0.45;
  }
}
