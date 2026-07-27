/**
 * WYN Schema Comparator Engine - Health Calculator
 * Calculates database health scores across 5 dimensions: Completeness, Integrity, Performance, Security, and Maintainability.
 * Produces overall score (0 - 100) and detailed diagnostic details for each dimension.
 */

import {
  ColumnDifference,
  ConstraintDifference,
  DatabaseHealth,
  ForeignKeyDifference,
  HealthCategory,
  IndexDifference,
  InspectorFKRecord,
  InspectorTableRecord,
  ParsedTable,
  PrimaryKeyDifference,
  TableComparisonResult,
} from '../types';

export class HealthCalculator {
  public calculate(
    tableComparison: TableComparisonResult,
    columnDifferences: ColumnDifference[],
    pkDifferences: PrimaryKeyDifference[],
    fkDifferences: ForeignKeyDifference[],
    constraintDifferences: ConstraintDifference[],
    indexDifferences: IndexDifference[],
    targetTablesMap: Map<string, ParsedTable>,
    currentTables: InspectorTableRecord[],
    currentFks: InspectorFKRecord[]
  ): DatabaseHealth {
    const totalTargetTables = targetTablesMap.size || 1;

    // 1. Completeness Score (Weight 25%)
    // Based on missing tables and missing columns
    const missingTablesCount = tableComparison.missingTables.length;
    const missingColumnsCount = columnDifferences.filter((c) => c.diffType === 'MISSING').length;

    let completenessScore = 100;
    completenessScore -= (missingTablesCount / totalTargetTables) * 60;
    completenessScore -= Math.min(missingColumnsCount * 4, 40);
    completenessScore = Math.max(0, Math.round(completenessScore));

    const completenessDetails: string[] = [];
    if (missingTablesCount > 0) {
      completenessDetails.push(`${missingTablesCount} target table(s) missing from current database.`);
    }
    if (missingColumnsCount > 0) {
      completenessDetails.push(`${missingColumnsCount} target column(s) missing from existing tables.`);
    }
    if (completenessDetails.length === 0) {
      completenessDetails.push('100% of target tables and columns are present in current database schema.');
    }

    // 2. Integrity Score (Weight 25%)
    // Based on PK mismatches, FK mismatches, and Constraint mismatches
    let integrityScore = 100;
    const missingPkCount = pkDifferences.filter((p) => p.diffType === 'MISSING_PK').length;
    const pkMismatchCount = pkDifferences.filter((p) => p.diffType === 'COLUMN_MISMATCH').length;
    const missingFkCount = fkDifferences.filter((f) => f.diffType === 'MISSING_FK').length;
    const fkMismatchCount = fkDifferences.filter((f) => f.diffType === 'DEFINITION_MISMATCH').length;
    const missingConstraintCount = constraintDifferences.filter((c) => c.diffType === 'MISSING_CONSTRAINT').length;

    integrityScore -= missingPkCount * 20;
    integrityScore -= pkMismatchCount * 10;
    integrityScore -= missingFkCount * 8;
    integrityScore -= fkMismatchCount * 4;
    integrityScore -= missingConstraintCount * 5;
    integrityScore = Math.max(0, Math.round(integrityScore));

    const integrityDetails: string[] = [];
    if (missingPkCount > 0) integrityDetails.push(`${missingPkCount} table(s) missing primary keys.`);
    if (missingFkCount > 0) integrityDetails.push(`${missingFkCount} foreign key constraint(s) missing.`);
    if (missingConstraintCount > 0) integrityDetails.push(`${missingConstraintCount} CHECK/UNIQUE constraint(s) missing.`);
    if (integrityDetails.length === 0) integrityDetails.push('Primary keys, foreign keys, and integrity constraints are fully aligned.');

    // 3. Performance Score (Weight 20%)
    // Based on missing indexes, index definition mismatches, and unindexed FK columns
    let performanceScore = 100;
    const missingIndexCount = indexDifferences.filter((i) => i.diffType === 'MISSING_INDEX').length;
    const indexMismatchCount = indexDifferences.filter((i) => i.diffType === 'DEFINITION_MISMATCH').length;

    performanceScore -= missingIndexCount * 7;
    performanceScore -= indexMismatchCount * 3;
    performanceScore = Math.max(0, Math.round(performanceScore));

    const performanceDetails: string[] = [];
    if (missingIndexCount > 0) performanceDetails.push(`${missingIndexCount} performance search or unique index(es) missing.`);
    if (indexMismatchCount > 0) performanceDetails.push(`${indexMismatchCount} index definition mismatch(es).`);
    if (performanceDetails.length === 0) performanceDetails.push('Indexes and performance structures are optimal.');

    // 4. Security Score (Weight 15%)
    // Based on business_id multi-tenant column presence and missing tenant constraints
    let securityScore = 100;
    let missingTenantCols = 0;

    for (const [tName, tObj] of targetTablesMap.entries()) {
      if (tObj.columns.has('business_id')) {
        const curTable = currentTables.find((ct) => ct.tableName.toLowerCase() === tName.toLowerCase());
        if (curTable) {
          const hasColInCur = columnDifferences.some(
            (cd) => cd.table.toLowerCase() === tName.toLowerCase() && cd.column === 'business_id' && cd.diffType === 'MISSING'
          );
          if (hasColInCur) missingTenantCols++;
        }
      }
    }

    securityScore -= missingTenantCols * 25;
    securityScore = Math.max(0, Math.round(securityScore));

    const securityDetails: string[] = [];
    if (missingTenantCols > 0) securityDetails.push(`${missingTenantCols} multi-tenant table(s) missing critical 'business_id' scoping column.`);
    if (securityDetails.length === 0) securityDetails.push('Multi-tenant scoping columns and tenant security structures are verified.');

    // 5. Maintainability Score (Weight 15%)
    // Based on extra unneeded tables, extra unneeded columns, and schema divergence
    let maintainabilityScore = 100;
    const extraTablesCount = tableComparison.extraTables.length;
    const extraColumnsCount = columnDifferences.filter((c) => c.diffType === 'EXTRA').length;

    maintainabilityScore -= extraTablesCount * 10;
    maintainabilityScore -= extraColumnsCount * 2;
    maintainabilityScore = Math.max(0, Math.round(maintainabilityScore));

    const maintainabilityDetails: string[] = [];
    if (extraTablesCount > 0) maintainabilityDetails.push(`${extraTablesCount} extra table(s) found in database that are not in target DDL.`);
    if (extraColumnsCount > 0) maintainabilityDetails.push(`${extraColumnsCount} extra column(s) detected.`);
    if (maintainabilityDetails.length === 0) maintainabilityDetails.push('Schema clean with no orphaned objects or extra drift.');

    // Overall Weighted Score (0 - 100)
    const overallScore = Math.round(
      completenessScore * 0.25 +
        integrityScore * 0.25 +
        performanceScore * 0.20 +
        securityScore * 0.15 +
        maintainabilityScore * 0.15
    );

    const getStatus = (score: number): 'EXCELLENT' | 'GOOD' | 'WARNING' | 'CRITICAL' => {
      if (score >= 90) return 'EXCELLENT';
      if (score >= 75) return 'GOOD';
      if (score >= 60) return 'WARNING';
      return 'CRITICAL';
    };

    const timestamp = new Date().toISOString();

    return {
      overallScore,
      completeness: {
        score: completenessScore,
        status: getStatus(completenessScore),
        details: completenessDetails,
        findingsCount: missingTablesCount + missingColumnsCount,
      },
      integrity: {
        score: integrityScore,
        status: getStatus(integrityScore),
        details: integrityDetails,
        findingsCount: missingPkCount + missingFkCount + missingConstraintCount,
      },
      performance: {
        score: performanceScore,
        status: getStatus(performanceScore),
        details: performanceDetails,
        findingsCount: missingIndexCount + indexMismatchCount,
      },
      security: {
        score: securityScore,
        status: getStatus(securityScore),
        details: securityDetails,
        findingsCount: missingTenantCols,
      },
      maintainability: {
        score: maintainabilityScore,
        status: getStatus(maintainabilityScore),
        details: maintainabilityDetails,
        findingsCount: extraTablesCount + extraColumnsCount,
      },
      timestamp,
    };
  }
}
