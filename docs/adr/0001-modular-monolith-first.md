# ADR 0001: Modular Monolith First for Landmark MVP

## Status

Accepted

## Context

VENUS is intended to become a multi-agent decision-intelligence ecosystem. The long-term architecture can support multiple apps, agents, and infrastructure services. However, the first business-critical goal is to validate Landmark as the revenue-driving trust engine for property verification.

A distributed microservice architecture would introduce operational complexity before product-market validation:

- cross-service auth and networking
- distributed tracing requirements
- deployment overhead
- harder local development
- premature database ownership boundaries

## Decision

Build the Landmark MVP as a modular monolith across strongly separated workspace packages:

- `apps/api-gateway` owns public routing, auth, request validation, and response mapping.
- `apps/landmark` owns property verification use cases and scoring policies.
- `packages/core-intelligence` owns shared reasoning primitives.
- `packages/ethics` owns governance and compliance policy checks.
- `packages/data-access` owns persistence adapters and repository interfaces.
- `packages/agent-sdk` owns cross-agent message and decision metadata contracts.

## Consequences

Positive:

- Faster iteration and simpler deployment for pilot validation.
- Strong package boundaries preserve future extraction paths.
- Easier to enforce audit consistency and transaction boundaries.
- Lower infrastructure cost during pre-pilot development.

Negative:

- The system will need explicit extraction criteria before scaling individual domains.
- Package boundaries must be actively enforced to prevent a hidden monolith.
- Long-running document/OCR jobs may require queue workers earlier than other components.

## Extraction Criteria

Extract a package/app into an independent service only when at least two of these are true:

1. It needs independent horizontal scaling.
2. It has a separate deployment cadence.
3. It has materially different data ownership or compliance requirements.
4. It blocks development velocity inside the modular monolith.
5. It has a clear external API contract and operational owner.
