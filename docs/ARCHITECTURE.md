# WYN Database Intelligence Toolkit — Architecture Specification

Version: **1.0.0**  
Status: **Production Ready**

---

## 1. Overview

The WYN Database Intelligence Toolkit is architected as a modular, read-only intelligence pipeline. It acts as an automated database architect that introspects, compares, maps, plans, and validates schema migrations without generating unverified SQL or modifying live data.

---

## 2. Core Architecture Pipeline

```
┌───────────────────────────────────────────────────────────────────────────┐
│ 1. DATABASE INSPECTOR (src/tools/database-inspector)                    │
│    Introspects live PostgreSQL database across 14 database dimensions.   │
│    Output: reports/db-inspector/*.json                                    │
└─────────────────────────────────────┬─────────────────────────────────────┘
                                      │
                                      ▼
┌───────────────────────────────────────────────────────────────────────────┐
│ 2. SCHEMA COMPARATOR (src/tools/schema-comparator/comparator)             │
│    Parses target SQL DDL (database_v1.sql) using AST/Regex parser.         │
│    Diffs target schema against live database inspector reports.           │
│    Output: reports/schema-comparator/schema_comparison.json              │
└─────────────────────────────────────┬─────────────────────────────────────┘
                                      │
                                      ▼
┌───────────────────────────────────────────────────────────────────────────┐
│ 3. INTELLIGENT MAPPING ENGINE (src/tools/schema-comparator/mapping)       │
│    Computes entity similarities, rename confidences, and data types.      │
│    Output: reports/schema-comparator/table_mappings.json, etc.           │
└─────────────────────────────────────┬─────────────────────────────────────┘
                                      │
                                      ▼
┌───────────────────────────────────────────────────────────────────────────┐
│ 4. MIGRATION PLANNING ENGINE (src/tools/schema-comparator/planner)       │
│    Schedules DDL tasks into a 6-stage execution matrix with risk assessment. │
│    Output: reports/schema-comparator/migration_plan.json                 │
└─────────────────────────────────────┬─────────────────────────────────────┘
                                      │
                                      ▼
┌───────────────────────────────────────────────────────────────────────────┐
│ 5. ENGINEERING VALIDATION ENGINE (src/tools/schema-validator)            │
│    Validates dependencies, mappings, migrations, rollbacks, and risks.     │
│    Produces final status: APPROVED, APPROVED WITH WARNINGS, or REJECTED.   │
│    Output: reports/schema-validator/approval_report.md                    │
└───────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Module Details

### 3.1 Database Inspector (`src/tools/database-inspector`)
- **Inspectors**: Tables, Columns, Primary Keys, Foreign Keys, Constraints, Indexes, Row Level Security (RLS), Policies, Functions, Triggers, Views, Materialized Views, Extensions, Sequences.
- **Features**: Fast/Exact row counting, schema isolation (`public`, `auth`, `storage`, etc.), snapshot generation, and audit trail logging.

### 3.2 Schema Comparator (`src/tools/schema-comparator/comparator`)
- **SQL Parser**: Extracts table structures, column definitions, data types, constraints, defaults, primary keys, foreign keys, and indexes from target SQL.
- **Diff Engine**: Computes missing tables, missing columns, type mismatches, missing indexes, missing FKs, constraint differences, and overall schema match percentage.

### 3.3 Intelligent Mapping Engine (`src/tools/schema-comparator/mapping`)
- **Similarity Algorithms**: Levenshtein Distance, Jaccard Token Match, Column Overlap Ratio, and Data Type Compatibility matrix.
- **Match Types**: `EXACT_MATCH`, `RENAME_CANDIDATE` (Confidence score >= 80%), `NEW_TABLE`, `DEPRECATED_TABLE`.

### 3.4 Migration Planning Engine (`src/tools/schema-comparator/planner`)
- **6-Stage Migration Matrix**:
  1. `Stage 1`: Foundation & Enums (`CREATE TYPE`, Extensions)
  2. `Stage 2`: Lookup Tables (`CREATE TABLE` for dimension/reference tables)
  3. `Stage 3`: Core Entities (`CREATE TABLE` for primary business entities)
  4. `Stage 4`: Transactional & Ledger Tables
  5. `Stage 5`: Financial & Dependent Entities
  6. `Stage 6`: Constraints & Indexes (`ADD CONSTRAINT`, `CREATE INDEX`)
- **Risk Assessment Matrix**: Categorizes risks into `DATA_LOSS`, `LOCKING`, `PERFORMANCE`, `CONSTRAINT_FAILURE`, `APPLICATION_COMPATIBILITY`.
- **Rollback Planning**: Generates stage-by-stage reverse execution steps and safety safeguards.

### 3.5 Engineering Validation Engine (`src/tools/schema-validator`)
- **Validation Gates**:
  1. `Dependency Validator`: Circular FK detection, stage ordering correctness.
  2. `Mapping Validator`: Low-confidence renames, duplicate mapping conflicts.
  3. `Migration Validator`: Task completeness for missing target objects.
  4. `Rollback Validator`: Verification of automated/manual rollback paths.
  5. `Risk Validator`: Verification of mitigations for critical/high risks.
  6. `Health Validator`: Score verification against minimum threshold (80/100).
  7. `Coverage Validator`: Operational dimension check across all objects.
- **Final Decision Output**: `APPROVED`, `APPROVED WITH WARNINGS`, or `REJECTED`.

---

## 4. Safety Guarantee & Design Constraints

1. **Read-Only Operations**: Zero write transactions or DDL executions are issued against target or live databases.
2. **Deterministic Output**: All reports are formatted as reproducible JSON and clean Markdown documents.
3. **Strict TypeScript**: Compiled with standard TypeScript strict mode (`tsc --noEmit`).
