# VENUS

AI-native decision intelligence ecosystem for trusted property verification (Landmark), knowledge intelligence (Novigate), human development (Odysseia), engagement (Xperia), and simulation (World Engine).

## Execution Status

This repository is scaffolded for Phase 1 execution with:

- Production-oriented monorepo structure
- Contract-first API specification
- Cross-system data model and schema plan
- Governance, ethics, and audit requirements

## Monorepo Structure

- `apps/` user-facing and domain services
- `packages/` shared intelligence, ethics, SDK, UI, and data access
- `infrastructure/` docker, kubernetes, and terraform deployment assets
- `docs/` product, architecture, contracts, and schema documentation

## Immediate Build Focus

1. Landmark MVP vertical slice (upload → analysis → trust score → risk report)
2. API gateway and auth
3. Ethics + audit enforcement in decision pipeline
4. Postgres-first persistence with async document processing

## Quick Start

```bash
pnpm install
pnpm -r build
```

The repository now includes a first executable Landmark trust-score vertical slice, shared intelligence/ethics packages, and a minimal API gateway route for local validation.


## Implemented MVP Slice

- `packages/agent-sdk`: typed agent messages, decision audit metadata, and confidence helpers.
- `packages/core-intelligence`: weighted decision scoring and meta-cognition confidence review.
- `packages/ethics`: blocking ethics/compliance gate for explainability, fairness, and consent.
- `apps/landmark`: Landmark trust-score engine with risk findings, audit metadata, and human-review routing.
- `apps/api-gateway`: minimal HTTP/router entrypoint for health checks and Landmark analysis.


## Planning Docs

- [System architecture](docs/system-architecture.md)
- [API contract v1](docs/api-contract-v1.yaml)
- [Database schema v1](docs/database-schema-v1.md)
- [Execution plan v1](docs/execution-plan-v1.md)
- [System analysis and next steps](docs/system-analysis-next-steps.md)
- [ADR 0001: Modular Monolith First](docs/adr/0001-modular-monolith-first.md)
