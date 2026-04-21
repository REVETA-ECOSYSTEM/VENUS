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

> Initial scaffolding only. Service-level implementations begin in next iteration.
