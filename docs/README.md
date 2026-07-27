# WYN Database Intelligence Toolkit (v1.0.0)

Welcome to the **What You Need (WYN) Database Intelligence Toolkit**, an enterprise-grade database inspection, schema comparison, intelligent entity mapping, migration planning, and pre-flight validation framework for PostgreSQL / Supabase environments.

---

## 🚀 Purpose

The WYN Database Intelligence Toolkit enables engineering teams to:
1. **Inspect**: Perform 14-point deep introspection of running PostgreSQL / Supabase databases.
2. **Compare**: Compare live physical database schemas against target SQL DDL specs (`database_v1.sql`).
3. **Map**: Dynamically compute similarity scores and propose renames for tables and columns using Levenshtein distance, token matching, and data type alignment.
4. **Plan**: Generate deterministic 6-stage migration plans with dependencies, risks, rollback strategies, and estimated execution times.
5. **Validate**: Perform 7-area quality assurance checks and health scoring before any DDL modifications are generated or executed.

---

## 🏗️ Architecture Pipeline

```
┌─────────────────────────┐
│   Database Inspector    │  inspects live PostgreSQL / Supabase DB (14 Inspectors)
└───────────┬─────────────┘
            │  reports/db-inspector/
            ▼
┌─────────────────────────┐
│    Schema Comparator    │  parses target SQL DDL & diffs against Inspector reports
└───────────┬─────────────┘
            │  reports/schema-comparator/schema_comparison.json
            ▼
┌─────────────────────────┐
│ Intelligent Mapping     │  computes table/column match types & rename confidences
└───────────┬─────────────┘
            │  reports/schema-comparator/table_mappings.json
            ▼
┌─────────────────────────┐
│ Migration Planning      │  builds 6-stage execution plan, risks & rollback steps
└───────────┬─────────────┘
            │  reports/schema-comparator/migration_plan.json
            ▼
┌─────────────────────────┐
│ Engineering Validator   │  validates dependencies, risks, health & outputs status
└───────────┬─────────────┘
            │  reports/schema-validator/engineering_validation.json
            ▼
  Approved Decision (APPROVED / APPROVED WITH WARNINGS / REJECTED)
```

---

## 📂 Project & Reports Folder Structure

```
.
├── database_v1.sql                        # Target DDL specification
├── docs/                                  # Complete Technical Documentation
│   ├── README.md
│   ├── ARCHITECTURE.md
│   ├── CLI_GUIDE.md
│   ├── USER_GUIDE.md
│   ├── DEVELOPER_GUIDE.md
│   ├── TROUBLESHOOTING.md
│   ├── CHANGELOG.md
│   ├── RELEASE_NOTES_v1.0.0.md
│   └── LICENSE.md
├── reports/                               # Generated JSON & Markdown artifacts
│   ├── db-inspector/                      # Live inspection reports (14 modules)
│   ├── schema-comparator/                 # Comparison, Mapping & Planning reports
│   └── schema-validator/                  # Validation & Approval reports
└── src/
    └── tools/
        ├── database-inspector/            # Inspector Engine
        ├── schema-comparator/             # Comparator, Mapper & Planner Engines
        └── schema-validator/              # Engineering Validator Engine
```

---

## 💻 CLI Commands Quick Reference

| Command | Description |
| :--- | :--- |
| `npm run db:inspect` | Inspects live Supabase/PostgreSQL database and generates 14 report JSON files |
| `npm run db:inspect -- --exact` | Runs inspection using exact `COUNT(*)` queries |
| `npm run db:inspect -- --all` | Inspects all schemas (`public`, `auth`, `storage`, `extensions`, `realtime`) |
| `npm run db:compare` | Compares live database state against target `database_v1.sql` |
| `npm run db:compare -- --mapping` | Runs Schema Comparator + Intelligent Entity Mapping Engine |
| `npm run db:compare -- --plan` | Runs Schema Comparator + Mapping + 6-Stage Migration Planning Engine |
| `npm run db:validate` | Runs Engineering Validation Engine across 7 quality gates |

---

## 🔒 Toolkit Environment Setup & Security Hardening

The WYN Database Intelligence Toolkit enforces **strict architectural separation** between the browser frontend environment and the Node.js backend CLI toolkit environment.

### Environment Credentials Separation

| Environment | Config File | Variables Used | Access Scope |
| :--- | :--- | :--- | :--- |
| **Frontend Browser App** | `.env` | `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` | Restricted row-level security (RLS) public access |
| **Toolkit / Node CLI Engine** | `.env.toolkit` | `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` | Full administrative database introspection privileges |

### Security Invariants
- **Service Role Required**: The CLI inspector (`npm run db:inspect`) requires `SUPABASE_SERVICE_ROLE_KEY` to query PostgreSQL system catalogs (`information_schema`, `pg_catalog`).
- **No Insecure Fallbacks**: The toolkit strictly forbids falling back to `VITE_SUPABASE_ANON_KEY` or `SUPABASE_ANON_KEY`. If `SUPABASE_SERVICE_ROLE_KEY` is missing, execution halts immediately with a descriptive engineering error.
- **Zero Client Secret Exposure**: `SUPABASE_SERVICE_ROLE_KEY` is never prefixed with `VITE_` and is never imported into frontend code bundles.

### Setting Up `.env.toolkit`
Copy `.env.toolkit.example` to `.env.toolkit` and configure your target project credentials:
```bash
cp .env.toolkit.example .env.toolkit
```

```env
# .env.toolkit
SUPABASE_URL="https://your-project-id.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key-here"

# Configuration Options
OUTPUT_DIRECTORY="reports/db-inspector"
DEFAULT_SAMPLE_LIMIT=20
```

---

## 📋 System Requirements

- **Node.js**: >= 18.x
- **TypeScript**: >= 5.x
- **PostgreSQL**: >= 12.x (or Supabase Postgres)
- **Environment Variables**:
  - `VITE_SUPABASE_URL` or `SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY` or `DATABASE_URL`

---

## 📄 License

MIT License. See [docs/LICENSE.md](LICENSE.md) for details.
