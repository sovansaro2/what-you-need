# WYN Database Intelligence Toolkit — CLI Reference Guide

Version: **1.0.0**

This guide details all CLI commands, arguments, flags, inputs, outputs, and usage examples for the WYN Database Intelligence Toolkit.

---

## 0. Toolkit Environment Setup & Security Hardening

Before running any CLI commands, ensure your environment variables are configured. The toolkit enforces strict separation between Frontend (`VITE_*`) credentials and Toolkit administrative credentials (`SUPABASE_*`).

### Configuration Strategy
1. **Frontend App (`.env`)**: Uses `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
2. **CLI Toolkit (`.env.toolkit`)**: Uses `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`.

### Creating `.env.toolkit`
```bash
cp .env.toolkit.example .env.toolkit
```

Example `.env.toolkit`:
```env
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
OUTPUT_DIRECTORY="reports/db-inspector"
DEFAULT_SAMPLE_LIMIT=20
```

> ⚠️ **Security Enforcement:** The Database Inspector CLI will fail fast if `SUPABASE_SERVICE_ROLE_KEY` is missing. It will NEVER fall back to `VITE_SUPABASE_ANON_KEY` to prevent silent permission denial on PostgreSQL system catalogs.

---

## 1. Database Inspector (`npm run db:inspect`)

### Purpose
Introspects a live PostgreSQL or Supabase database and generates 14 detailed JSON reports inside `reports/db-inspector/`.

### Options & Flags
```
npm run db:inspect [-- [options]]

Options:
  --audit      Perform audit checks and security inspection
  --snapshot   Generate schema snapshot
  --all        Inspect all schemas (public, auth, storage, extensions, realtime)
  --exact      Use exact row counts (COUNT(*)) instead of fast estimates
  --fast       Use fast estimated row counts (default)
  --verbose    Enable verbose logging output
  --help, -h   Show help message
```

### Examples
```bash
# Basic inspection of public schema
npm run db:inspect

# Inspect with exact table row counts
npm run db:inspect -- --exact

# Full inspection across all database schemas including audit & snapshot
npm run db:inspect -- --all --audit --snapshot
```

### Outputs
- `reports/db-inspector/tables.json`
- `reports/db-inspector/columns.json`
- `reports/db-inspector/primary_keys.json`
- `reports/db-inspector/foreign_keys.json`
- `reports/db-inspector/constraints.json`
- `reports/db-inspector/indexes.json`
- `reports/db-inspector/rls_status.json`
- `reports/db-inspector/policies.json`
- `reports/db-inspector/functions.json`
- `reports/db-inspector/triggers.json`
- `reports/db-inspector/views.json`
- `reports/db-inspector/materialized_views.json`
- `reports/db-inspector/extensions.json`
- `reports/db-inspector/sequences.json`
- `reports/db-inspector/database_inspector_report.json`
- `reports/db-inspector/database_inspector_report.md`

---

## 2. Schema Comparator Engine (`npm run db:compare`)

### Purpose
Compares live database inspection reports against target SQL DDL specification (`database_v1.sql`), with optional Intelligent Entity Mapping and Migration Planning.

### Options & Flags
```
npm run db:compare [-- [options]]

Options:
  --target=<path>      Path to target SQL DDL file (default: database_v1.sql)
  --inputDir=<path>    Path to inspector report directory (default: reports/db-inspector)
  --outputDir=<path>   Path to output report directory (default: reports/schema-comparator)
  --mapping            Run Intelligent Entity Mapping Engine
  --plan               Run Migration Planning Engine (includes mapping)
  --summary            Generate summary report only
  --verbose            Enable verbose logging output
  --help, -h           Show help message
```

### Examples
```bash
# Basic schema comparison
npm run db:compare

# Run schema comparator with entity similarity mapping
npm run db:compare -- --mapping

# Full comparison with 6-stage migration planning engine
npm run db:compare -- --plan

# Compare against a custom target SQL file
npm run db:compare -- --target=docs/sql/target_v2.sql --plan
```

### Outputs
- `reports/schema-comparator/schema_comparison.json`
- `reports/schema-comparator/schema_comparison_report.md`
- `reports/schema-comparator/database_health.json`
- `reports/schema-comparator/mapping_report.json`
- `reports/schema-comparator/table_mappings.json`
- `reports/schema-comparator/column_mappings.json`
- `reports/schema-comparator/migration_plan.json`
- `reports/schema-comparator/migration_plan.md`
- `reports/schema-comparator/migration_dependencies.json`
- `reports/schema-comparator/migration_risks.json`

---

## 3. Engineering Validation Engine (`npm run db:validate`)

### Purpose
Executes pre-flight engineering quality validation gates across dependencies, mappings, migrations, rollbacks, risks, health score, and coverage dimensions.

### Options & Flags
```
npm run db:validate [-- [options]]

Options:
  --target=<path>         Path to target SQL DDL file (default: database_v1.sql)
  --inspectorDir=<path>   Path to inspector report directory (default: reports/db-inspector)
  --comparatorDir=<path>  Path to comparator report directory (default: reports/schema-comparator)
  --outputDir=<path>      Path to output report directory (default: reports/schema-validator)
  --verbose               Enable verbose logging output
  --help, -h              Show help message
```

### Examples
```bash
# Execute engineering validation engine
npm run db:validate

# Verbose validation run
npm run db:validate -- --verbose
```

### Outputs
- `reports/schema-validator/engineering_validation.json`
- `reports/schema-validator/engineering_validation.md`
- `reports/schema-validator/validation_summary.json`
- `reports/schema-validator/approval_report.md`
