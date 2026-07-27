/**
 * WYN Intelligent Mapping Engine - Table Mapping Module
 * Maps database tables between CURRENT and TARGET schemas.
 */

import { ParsedSchema, InspectorTableRecord, TableComparisonResult, TableMapping } from '../types';
import { SemanticMatcher } from './semanticMatcher';
import { ConfidenceCalculator } from './confidenceCalculator';
import { RiskAnalyzer } from './riskAnalyzer';

export class TableMapper {
  private semanticMatcher = new SemanticMatcher();

  public mapTables(
    targetSchema: ParsedSchema,
    inspectorTables: InspectorTableRecord[],
    tableComparison: TableComparisonResult
  ): TableMapping[] {
    const mappings: TableMapping[] = [];

    const currentTableNames = new Set(inspectorTables.map((t) => t.tableName.toLowerCase()));
    const targetTableNames = new Set(Array.from(targetSchema.tables.keys()).map((t) => t.toLowerCase()));

    // 1. Direct Matches
    tableComparison.matchingTables.forEach((tableName) => {
      mappings.push({
        currentTable: tableName,
        targetTable: tableName,
        matchType: 'DIRECT_MATCH',
        confidenceScore: 100,
        confidenceLevel: 'VERY_HIGH',
        risk: 'LOW',
        reason: 'Exact table name match between current database and target DDL.',
      });
    });

    // 2. Renamed Candidates
    const mappedCurrent = new Set<string>(tableComparison.matchingTables.map((t) => t.toLowerCase()));
    const mappedTarget = new Set<string>(tableComparison.matchingTables.map((t) => t.toLowerCase()));

    tableComparison.renamedCandidates.forEach((candidate) => {
      const confidenceLevel = ConfidenceCalculator.getLevel(candidate.confidenceScore);
      const risk = RiskAnalyzer.evaluateTableRisk('RENAME_CANDIDATE', candidate.confidenceScore);

      mappings.push({
        currentTable: candidate.currentName,
        targetTable: candidate.targetName,
        matchType: 'RENAME_CANDIDATE',
        confidenceScore: candidate.confidenceScore,
        confidenceLevel,
        risk,
        reason: candidate.reason,
      });

      mappedCurrent.add(candidate.currentName.toLowerCase());
      mappedTarget.add(candidate.targetName.toLowerCase());
    });

    // 3. New Tables (Missing in current DB)
    tableComparison.missingTables.forEach((targetTable) => {
      if (!mappedTarget.has(targetTable.toLowerCase())) {
        mappings.push({
          currentTable: null,
          targetTable,
          matchType: 'NEW_TABLE',
          confidenceScore: 100,
          confidenceLevel: 'VERY_HIGH',
          risk: 'LOW',
          reason: 'Table is newly introduced in target DDL and missing in current database.',
        });
        mappedTarget.add(targetTable.toLowerCase());
      }
    });

    // 4. Deprecated Tables (Extra in current DB)
    tableComparison.extraTables.forEach((currentTable) => {
      if (!mappedCurrent.has(currentTable.toLowerCase())) {
        mappings.push({
          currentTable,
          targetTable: currentTable,
          matchType: 'DEPRECATED_TABLE',
          confidenceScore: 90,
          confidenceLevel: 'HIGH',
          risk: 'HIGH',
          reason: 'Table exists in current database but is not defined in target DDL.',
        });
        mappedCurrent.add(currentTable.toLowerCase());
      }
    });

    return mappings;
  }
}
