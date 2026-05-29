# VENUS System Analysis and Next Steps

## Executive Assessment

The repository has moved from concept to an executable technical baseline, but it is **not yet production MVP**. The current code proves that the core Landmark decision path can be composed from shared packages, tested, and routed through a minimal API gateway. The next phase must harden that path into a credible pilot-grade product.

Current state:

- **Strength:** contract-first monorepo with real TypeScript build/test wiring.
- **Strength:** first Landmark trust-score engine with explainability, risk findings, audit metadata, ethics gate, and human-review routing.
- **Gap:** API Gateway has no authentication, RBAC, schema validation, rate limiting, or structured error taxonomy.
- **Gap:** Landmark scoring is deterministic and useful for MVP wiring, but it is not evidence-backed by OCR, registry integrations, or persisted historical data yet.
- **Gap:** persistence is documented but not implemented; audit events are returned in-memory instead of written to append-only storage.
- **Gap:** placeholder apps/packages exist for the broader ecosystem; they should remain intentionally thin until Landmark validation proves revenue/user demand.

## System Readiness Scorecard

| Area | Current Readiness | Assessment | Next Required Step |
| --- | --- | --- | --- |
| Monorepo/tooling | Medium | Build/test pipeline exists and is repeatable. | Add CI workflow and package boundaries enforcement. |
| API Gateway | Low | Minimal router exists for local validation. | Add validation, auth, RBAC, and error handling. |
| Landmark engine | Medium | Core scoring path is executable and tested. | Split domain model, scoring policy, and persistence adapters. |
| Ethics/governance | Medium | Blocking gate exists with consent/fairness/explainability checks. | Add auditable policy versions and regression fixtures. |
| Persistence | Low | Schema is documented only. | Implement Postgres migrations and audit repository. |
| Document intelligence | Low | Document metadata is accepted but no OCR/parser exists. | Add upload abstraction and OCR provider interface. |
| Observability | Low | No request IDs, logs, metrics, or traces. | Add request context, structured logs, and correlation IDs. |
| Security | Low | No auth enforcement yet. | Implement JWT verification and role-based route guards. |

## Product Execution Priority

### Priority 1: Pilot-Credible Landmark Vertical Slice

Goal: prove one end-to-end workflow that a property buyer, bank analyst, or legal reviewer can trust.

Required path:

```text
Authenticated user
  -> submit property dossier
  -> validate request schema
  -> persist analysis request
  -> ingest document metadata / uploaded file reference
  -> compute trust score
  -> apply ethics/compliance gate
  -> persist audit event
  -> return score, explanation, risks, and review status
```

Acceptance criteria:

- Every request has a stable request ID.
- Every decision has a decision policy version.
- Every completed analysis writes an immutable audit event.
- Missing consent blocks automated approval and routes to human review.
- Low-confidence or high-risk outputs are never presented as final clearance.

### Priority 2: Evidence-Backed Scoring

The scoring engine must stop relying on default scores as soon as possible. Defaults are acceptable for plumbing tests, but not for market-facing trust claims.

Next implementation units:

1. `packages/data-access`: Postgres client abstraction and repositories.
2. `apps/landmark`: scoring policy module with explicit factor inputs.
3. `apps/landmark`: document parser interface for OCR/provider swap.
4. `packages/ethics`: versioned policy evaluation fixtures.
5. `apps/api-gateway`: request validation aligned with OpenAPI schemas.

### Priority 3: Compliance and Trust Infrastructure

Landmark is a trust product. If the audit layer is weak, the product promise is weak.

Must implement before pilot:

- Append-only `audit_events` table.
- Consent capture and retention metadata.
- PII minimization rules.
- Human-review queue state.
- Decision replay inputs for dispute resolution.

## Recommended Technical Architecture for the Next Sprint

Use a modular monolith runtime for the MVP, not distributed microservices yet.

Rationale:

- The team needs fast iteration and strict consistency more than independent service scaling.
- Landmark is the first monetizable workflow; splitting too early will slow validation.
- Package boundaries already preserve future service extraction options.

Target sprint architecture:

```text
apps/api-gateway
  ├─ auth middleware
  ├─ request validation
  ├─ route handlers
  └─ request context

apps/landmark
  ├─ domain types
  ├─ scoring policy
  ├─ risk analysis
  ├─ use cases
  └─ repositories/interfaces

packages/data-access
  ├─ postgres connection
  ├─ migrations
  ├─ analysis repository
  └─ audit repository

packages/ethics
  ├─ policy versions
  ├─ consent checks
  └─ explainability checks
```

## Immediate Engineering Backlog

### Sprint 1 — Make the MVP Real

1. Add API Gateway request validation and structured errors.
2. Add JWT/RBAC route guard with roles: `admin`, `analyst`, `buyer`, `bank`, `government`.
3. Add Postgres migration files for `users`, `properties`, `analyses`, `trust_factors`, `risk_findings`, and `audit_events`.
4. Add `AuditRepository` and write audit events from Landmark analysis.
5. Refactor Landmark scoring into separate `scoring-policy.ts`, `risk-policy.ts`, and `use-cases/analyze-property.ts`.
6. Add golden test fixtures for high-trust, medium-risk, high-risk, and consent-blocked cases.

### Sprint 2 — Add Evidence Inputs

1. Add document upload metadata model with checksum validation.
2. Add OCR provider interface with a deterministic local test adapter.
3. Add extracted entity model for owner names, plot references, survey numbers, and issuing authorities.
4. Connect extracted entities into trust factor inputs.
5. Add manual reviewer override model with mandatory reason codes.

### Sprint 3 — Pilot Hardening

1. Add structured logging and request correlation IDs.
2. Add rate limiting and payload-size limits.
3. Add environment config validation.
4. Add CI checks for build, lint, tests, and OpenAPI schema validation.
5. Add basic deployment container for API Gateway.

## Explicit Deferrals

Do not build these yet:

- Blockchain audit storage.
- Full multi-agent orchestration UI.
- World Engine simulation integration.
- Gamification / Xperia economy.
- Neo4j production graph integration.

These are strategically valid later, but they do not help validate the first revenue path.

## Decision for Next Implementation

Proceed with **Sprint 1: Make the MVP Real**.

The next PR should implement:

- API Gateway validation and structured errors.
- Data-access migration baseline.
- Audit repository interface and in-memory test adapter.
- Landmark use-case refactor that writes an audit event through a repository boundary.

This keeps the product moving from demo logic toward pilot-grade trust infrastructure without premature platform expansion.
