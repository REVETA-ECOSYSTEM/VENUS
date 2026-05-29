# VENUS Cross-System Database Schema v1

## 1. Data Strategy

Use a hybrid persistence model:

- **PostgreSQL**: transactional truth (users, analyses, scores, audit index)
- **MongoDB**: raw extracted document payloads and OCR output
- **Neo4j**: entity relationships and fraud-pattern traversal
- **Redis**: job state, cache, short-lived session artifacts
- **Vector DB**: semantic retrieval for legal/policy and precedent explanation

## 2. PostgreSQL Core Tables

### users
- id (uuid, pk)
- email (unique)
- password_hash
- role (`admin|analyst|buyer|bank|government`)
- created_at
- updated_at

### properties
- id (uuid, pk)
- property_ref (unique)
- country_code
- region
- lga_or_city
- address_text
- geo_lat
- geo_lng
- created_at

### analyses
- id (uuid, pk)
- property_id (fk -> properties.id)
- requested_by (fk -> users.id)
- status (`queued|processing|completed|failed|needs_human_review`)
- confidence (`low|medium|high`)
- risk_level (`low|medium|high`)
- trust_score (numeric(4,2), 0-10)
- ethics_passed (boolean)
- human_review_required (boolean)
- created_at
- completed_at

### trust_factors
- id (uuid, pk)
- analysis_id (fk -> analyses.id)
- factor_name
- factor_weight (numeric(4,3))
- factor_score (numeric(4,3))
- notes

### risk_findings
- id (uuid, pk)
- analysis_id (fk -> analyses.id)
- code
- severity (`low|medium|high`)
- detail
- recommended_action

### audit_events
- id (uuid, pk)
- request_id
- analysis_id (nullable fk -> analyses.id)
- actor_type (`user|system|agent|admin`)
- actor_id
- event_type
- payload_hash
- metadata_json
- created_at

## 3. MongoDB Collections

### document_blobs
- _id
- analysis_id
- document_type
- source_uri
- checksum
- ocr_text
- extracted_entities
- parser_version
- created_at

### model_outputs
- _id
- analysis_id
- model_name
- prompt_or_policy_version
- raw_output
- token_usage
- created_at

## 4. Neo4j Graph Model

### Nodes
- `Property {id, propertyRef}`
- `Person {id, name, nationalIdHash}`
- `Organization {id, name}`
- `Document {id, type, checksum}`
- `Case {id, court, status}`

### Relationships
- `(Person)-[:CLAIMS_OWNERSHIP_OF]->(Property)`
- `(Document)-[:SUPPORTS_CLAIM]->(Person)`
- `(Property)-[:HAS_DISPUTE]->(Case)`
- `(Organization)-[:REGISTERED_PROPERTY]->(Property)`

## 5. Redis Keys

- `job:analysis:{id}` -> queue status / progress
- `cache:trust-score:{analysisId}` -> short-lived score cache
- `session:user:{id}` -> token session metadata

## 6. Governance Requirements

- PII minimization by default; hash identifiers where feasible.
- Data retention policy per region with explicit delete workflows.
- Audit event immutability via append-only semantics.
