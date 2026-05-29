import { randomUUID } from "node:crypto";

export type AgentType =
  | "api-gateway"
  | "orchestrator"
  | "landmark"
  | "novigate"
  | "odysseia"
  | "xperia"
  | "world-engine"
  | "ethics"
  | "core-intelligence";

export type RiskLevel = "low" | "medium" | "high";
export type ConfidenceLevel = "low" | "medium" | "high";

export type AgentMetadata = {
  confidence?: number;
  risk_level?: RiskLevel;
  requires_human?: boolean;
};

export type AgentMessage<TPayload = unknown, TContext extends Record<string, unknown> = Record<string, unknown>> = {
  id: string;
  timestamp: number;
  source: AgentType;
  target: AgentType;
  intent: string;
  context: TContext;
  payload: TPayload;
  metadata: AgentMetadata;
};

export type DecisionAuditMetadata = {
  requestId: string;
  decisionVersion: string;
  timestamp: string;
};

export function createAgentMessage<TPayload>(input: Omit<AgentMessage<TPayload>, "id" | "timestamp"> & { id?: string; timestamp?: number }): AgentMessage<TPayload> {
  if (!input.intent.trim()) {
    throw new Error("AgentMessage intent is required");
  }

  const confidence = input.metadata.confidence;
  if (confidence !== undefined && (confidence < 0 || confidence > 1)) {
    throw new Error("AgentMessage metadata.confidence must be between 0 and 1");
  }

  return {
    ...input,
    id: input.id ?? randomUUID(),
    timestamp: input.timestamp ?? Date.now()
  };
}

export function toConfidenceLevel(confidence: number): ConfidenceLevel {
  if (confidence >= 0.8) return "high";
  if (confidence >= 0.55) return "medium";
  return "low";
}
