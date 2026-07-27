# WYN Database Intelligence Toolkit — Developer & Extension Guide

Version: **1.0.0**

This guide provides architectural instructions for developers who want to extend, maintain, or contribute new inspectors, validators, or mapping algorithms to the toolkit.

---

## 1. Directory Structure Overview

```
src/tools/
├── database-inspector/
│   ├── index.ts                     # CLI Entry Point
│   ├── config.ts                    # Connection & Environment loader
│   ├── core/                        # Runner & Supabase Client Factory
│   └── inspectors/                  # 14 Standard Inspector Modules
│       ├── baseInspector.ts         # Abstract Class / Interface
│       ├── tablesInspector.ts
│       ├── columnsInspector.ts
│       └── ...
│
├── schema-comparator/
│   ├── index.ts                     # CLI Entry Point
│   ├── comparator/                  # AST Parser & Diff Engine
│   ├── mapping/                     # Similarity & Matching Algorithms
│   ├── planner/                     # 6-Stage Migration & Risk Planner
│   ├── parser/                      # DDL & Report Readers
│   ├── report/                      # Markdown & JSON Writers
│   └── types/                       # Shared Types
│
└── schema-validator/
    ├── index.ts                     # CLI Entry Point
    ├── validators/                  # 7 Quality Validation Modules
    │   ├── dependencyValidator.ts
    │   ├── mappingValidator.ts
    │   ├── migrationValidator.ts
    │   ├── rollbackValidator.ts
    │   ├── riskValidator.ts
    │   ├── healthValidator.ts
    │   ├── coverageValidator.ts
    │   └── recommendationEngine.ts
    ├── report/                      # Approval Report Generators
    └── types/                       # Shared Types
```

---

## 2. How to Create a New Database Inspector

1. Create a new file in `src/tools/database-inspector/inspectors/myNewInspector.ts`.
2. Extend `BaseInspector`:

```typescript
import { BaseInspector } from './baseInspector';
import { InspectionResult } from '../types';

export class MyNewInspector extends BaseInspector {
  public name = 'MyNewInspector';
  public outputFile = 'my_new_data.json';

  public async inspect(client: any): Promise<InspectionResult> {
    // Query database information_schema or pg_catalog
    const { data, error } = await client.rpc('get_my_new_data');
    if (error) throw error;

    return {
      success: true,
      data,
      count: data.length,
    };
  }
}
```

3. Register the new inspector inside `src/tools/database-inspector/index.ts` under `runner.registerModules([...])`.

---

## 3. How to Create a New Validation Rule

1. Open or add a validator inside `src/tools/schema-validator/validators/`.
2. Return a structured `ValidationResult`:

```typescript
import { ValidationResult, ValidationFinding } from '../types';

export class MyCustomValidator {
  public validate(inputData: any): ValidationResult {
    const findings: ValidationFinding[] = [];
    let score = 100;

    // Execute validation logic
    if (/* condition */ false) {
      score -= 20;
      findings.push({
        id: 'CUSTOM-01',
        category: 'HEALTH',
        severity: 'WARNING',
        title: 'Custom Validation Finding',
        description: 'Details regarding the finding.',
        recommendation: 'Recommended corrective action.',
      });
    }

    return {
      category: 'Custom Validation',
      status: score === 100 ? 'PASSED' : 'WARNING',
      score,
      findings,
    };
  }
}
```

---

## 4. Coding Standards & Testing Strategy

- **Strict TypeScript**: Ensure `tsc --noEmit` compiles cleanly with zero errors before submitting code changes.
- **Read-Only Invariant**: Inspectors and validators must NEVER issue `INSERT`, `UPDATE`, `DELETE`, `DROP`, or `ALTER` statements against database connections.
- **Verification Command**:
  ```bash
  npm run lint && npm run build
  ```
