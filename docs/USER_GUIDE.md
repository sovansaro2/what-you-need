# WYN Database Intelligence Toolkit — User Guide

Version: **1.0.0**

This guide describes the standard end-to-end workflow for database engineers, technical leads, and DevOps engineers using the WYN Database Intelligence Toolkit.

---

## 🔁 Standard 5-Step Workflow

```
[ Step 1: Inspect ] ➔ [ Step 2: Compare ] ➔ [ Step 3: Review Mapping ] ➔ [ Step 4: Plan ] ➔ [ Step 5: Validate & Approve ]
```

---

## Step 1: Inspect Live Database State

First, execute the Database Inspector to capture a comprehensive, read-only snapshot of your live database:

```bash
npm run db:inspect -- --exact
```

### What to check:
- Review `reports/db-inspector/database_inspector_report.md` to confirm the total number of tables, columns, indexes, foreign keys, and RLS policies detected.

---

## Step 2: Compare Schema Against Target Specification

Next, run the Schema Comparator against your desired target SQL DDL specification (`database_v1.sql`):

```bash
npm run db:compare
```

### What to check:
- Review `reports/schema-comparator/schema_comparison_report.md`.
- Inspect missing tables, missing columns, data type mismatches, and the **Schema Match Percentage**.

---

## Step 3: Compute Entity Mappings

If tables or columns have been renamed or restructured in the target schema, run entity mapping analysis:

```bash
npm run db:compare -- --mapping
```

### What to check:
- Open `reports/schema-comparator/mapping_report.json` or `table_mappings.json`.
- Verify candidate renames with high confidence scores (>= 80%).
- Ensure no current tables or columns are unexpectedly flagged as deprecated without a migration strategy.

---

## Step 4: Generate 6-Stage Migration Plan

Run the full migration planning engine to organize DDL actions into structured stages:

```bash
npm run db:compare -- --plan
```

### What to check:
- Review `reports/schema-comparator/migration_plan.md`.
- Verify the 6-stage execution schedule:
  1. Foundation & Enums
  2. Lookup Tables
  3. Core Entities
  4. Transactional / Ledger Tables
  5. Financial / Dependent Entities
  6. Constraints & Indexes
- Check `reports/schema-comparator/migration_risks.json` for locking, performance, or data loss hazards.

---

## Step 5: Execute Engineering Pre-Flight Validation

Run the Engineering Validation Engine to generate the official pre-flight approval report:

```bash
npm run db:validate
```

### What to check:
- Open `reports/schema-validator/approval_report.md`.
- Confirm the **Final Engineering Decision**:
  - `APPROVED`: Ready for execution.
  - `APPROVED WITH WARNINGS`: Review warnings and prepare required safeguards.
  - `REJECTED`: Blocking issues must be addressed before proceeding.
- Verify that Health Score meets or exceeds the required threshold of **80/100**.
