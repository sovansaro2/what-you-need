/**
 * WYN Engineering Validation Engine - Coverage Validator
 * Validates verification coverage across Tables, Columns, Primary Keys, Foreign Keys, Constraints, and Indexes.
 */

import { ValidationResult, ValidationFinding } from '../types';

export class CoverageValidator {
  public validate(inspectorData: any, targetSchema: any, comparison: any): ValidationResult {
    const findings: ValidationFinding[] = [];
    let score = 100;

    const currentTablesCount = inspectorData?.tables?.length || 0;
    const currentColumnsCount = inspectorData?.columns?.length || 0;
    const currentPKCount = inspectorData?.primaryKeys?.length || 0;
    const currentFKCount = inspectorData?.foreignKeys?.length || 0;
    const currentConstraintsCount = inspectorData?.constraints?.length || 0;
    const currentIndexesCount = inspectorData?.indexes?.length || 0;

    const targetTablesCount = targetSchema?.tables?.size || Object.keys(targetSchema?.tables || {}).length || 0;

    // Check completeness of inspection dimensions
    const dimensions = [
      { name: 'Tables', count: currentTablesCount, targetCount: targetTablesCount },
      { name: 'Columns', count: currentColumnsCount },
      { name: 'Primary Keys', count: currentPKCount },
      { name: 'Foreign Keys', count: currentFKCount },
      { name: 'Constraints', count: currentConstraintsCount },
      { name: 'Indexes', count: currentIndexesCount },
    ];

    dimensions.forEach((dim) => {
      if (dim.count === 0 && dim.name !== 'Constraints') {
        score -= 10;
        findings.push({
          id: `COV-EMPTY-${dim.name.toUpperCase().replace(/\s+/g, '_')}`,
          category: 'COVERAGE',
          severity: 'WARNING',
          title: `Zero Coverage for ${dim.name}`,
          description: `No records inspected for '${dim.name}' in current database inspector report.`,
          recommendation: `Run 'npm run db:inspect' to ensure full inspection coverage of database ${dim.name.toLowerCase()}.`,
        });
      }
    });

    findings.push({
      id: `COV-SUMMARY`,
      category: 'COVERAGE',
      severity: 'INFO',
      title: `Schema Inspection & Comparison Coverage Summary`,
      description: `Covered ${currentTablesCount} Current Tables, ${currentColumnsCount} Columns, ${currentPKCount} Primary Keys, ${currentFKCount} Foreign Keys, ${currentConstraintsCount} Constraints, ${currentIndexesCount} Indexes against ${targetTablesCount} Target Tables.`,
    });

    score = Math.max(0, score);
    const status = score === 100 ? 'PASSED' : findings.some((f) => f.severity === 'CRITICAL') ? 'FAILED' : 'WARNING';

    return {
      category: 'Coverage Validation',
      status,
      score,
      findings,
    };
  }
}
