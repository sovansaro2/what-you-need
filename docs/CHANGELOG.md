# Changelog — WYN Database Intelligence Toolkit

All notable changes to the WYN Database Intelligence Toolkit are documented in this file.

---

## [1.0.0] - 2026-07-27 — Production Release

### Added
- **Database Inspector Engine (`db:inspect`)**:
  - Implemented 14 inspection modules (Tables, Columns, PKs, FKs, Constraints, Indexes, RLS, Policies, Functions, Triggers, Views, Materialized Views, Extensions, Sequences).
  - Exact and Fast table row estimation modes.
  - Multi-schema inspection support (`public`, `auth`, `storage`, `extensions`, `realtime`).
  - Schema snapshot generation and audit log tracking.

- **Schema Comparator Engine (`db:compare`)**:
  - Target SQL DDL parser for table structures, types, constraints, primary keys, foreign keys, and indexes.
  - Granular schema diffing against live database inspector reports.
  - Health score metric computation.

- **Intelligent Entity Mapping Engine (`--mapping`)**:
  - Levenshtein distance & Jaccard token similarity matching.
  - Column overlap ratio and data type alignment checks.
  - Automated candidate rename confidence scoring (0-100%).
  - Deprecated table and column detection.

- **Migration Planning Engine (`--plan`)**:
  - Deterministic 6-Stage execution planner (Foundation, Lookups, Core, Ledger, Finance, Constraints).
  - Dependency graph ordering and circular reference handling.
  - Categorized risk matrix (`DATA_LOSS`, `LOCKING`, `PERFORMANCE`, etc.).
  - Automated stage-by-stage rollback plan generator.

- **Engineering Validation Engine (`db:validate`)**:
  - 7 Quality Validation Gates (Dependency, Mapping, Migration, Rollback, Risk, Health, Coverage).
  - Automated approval decision engine (`APPROVED`, `APPROVED WITH WARNINGS`, `REJECTED`).
  - Markdown & JSON approval reports (`approval_report.md`).

- **CLI & Developer Experience**:
  - Help flag support (`--help` / `-h`) across all tools.
  - Complete documentation suite (`docs/`).
