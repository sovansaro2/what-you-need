# WYN Database Intelligence Toolkit — Troubleshooting Guide

Version: **1.0.0**

This guide provides diagnostics and resolution steps for common issues encountered when running the WYN Database Intelligence Toolkit.

---

## 1. Supabase / PostgreSQL Connection Issues

### Issue
```
❌ Error: Could not connect to Supabase database. Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.
```

### Cause
Environment variables required to connect to the live database are not set in `.env` or system environment.

### Solution
1. Ensure `.env` contains valid connection credentials:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```
2. Verify network connectivity to the database host.

---

## 2. Missing Report Files

### Issue
```
❌ Error: ENOENT: no such file or directory, open 'reports/db-inspector/tables.json'
```

### Cause
`npm run db:compare` or `npm run db:validate` was run before executing `npm run db:inspect`.

### Solution
Always execute the workflow sequentially:
```bash
# Step 1
npm run db:inspect
# Step 2
npm run db:compare -- --plan
# Step 3
npm run db:validate
```

---

## 3. Low Health Score / Validation REJECTED

### Issue
`approval_report.md` shows Status `REJECTED` or `Health Score: 19 / 100`.

### Cause
Target DDL specification (`database_v1.sql`) contains tables or columns that do not yet exist in the live database.

### Resolution
1. This is the **expected status** when comparing a target production schema specification against an unmigrated database.
2. Review `reports/schema-comparator/schema_comparison_report.md` for missing tables.
3. Review `reports/schema-comparator/migration_plan.md` to view the step-by-step DDL migration tasks required to bring the database to 100% target match.
4. After applying migration DDL to your database, re-run `npm run db:inspect` followed by `npm run db:compare` and `npm run db:validate` to observe the health score rise to 100 / 100.

---

## 4. Permission Errors on Introspection

### Issue
`Permission denied for table pg_catalog.pg_policies` or missing system catalog data.

### Solution
Ensure the database user configured in `SUPABASE_SERVICE_ROLE_KEY` or `DATABASE_URL` has administrative or service_role access permissions to query `information_schema` and `pg_catalog`.
