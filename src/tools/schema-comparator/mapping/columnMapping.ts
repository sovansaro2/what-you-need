/**
 * WYN Intelligent Mapping Engine - Column Mapping Module
 * Maps table columns between CURRENT and TARGET schemas.
 */

import { ParsedSchema, InspectorColumnRecord, ColumnDifference, ColumnMapping } from '../types';
import { SemanticMatcher } from './semanticMatcher';
import { ConfidenceCalculator } from './confidenceCalculator';
import { RiskAnalyzer } from './riskAnalyzer';

export class ColumnMapper {
  private semanticMatcher = new SemanticMatcher();

  public mapColumns(
    targetSchema: ParsedSchema,
    inspectorColumns: InspectorColumnRecord[],
    columnDiffs: ColumnDifference[]
  ): ColumnMapping[] {
    const mappings: ColumnMapping[] = [];

    // Group inspector columns by table
    const currentColsByTable = new Map<string, Map<string, InspectorColumnRecord>>();
    inspectorColumns.forEach((col) => {
      const tbl = col.table.toLowerCase();
      if (!currentColsByTable.has(tbl)) {
        currentColsByTable.set(tbl, new Map());
      }
      currentColsByTable.get(tbl)!.set(col.columnName.toLowerCase(), col);
    });

    // Iterate through all target tables and target columns
    targetSchema.tables.forEach((targetTable, targetTableName) => {
      const tblLower = targetTableName.toLowerCase();
      const currentCols = currentColsByTable.get(tblLower) || new Map();

      targetTable.columns.forEach((targetCol, targetColName) => {
        const colLower = targetColName.toLowerCase();
        const currentCol = currentCols.get(colLower);

        if (currentCol) {
          // Both exist with same name
          const typeMatch = this.normalizeDataType(currentCol.dataType) === this.normalizeDataType(targetCol.dataType);
          const nullabilityMatch = currentCol.nullable === targetCol.nullable;
          const defaultMatch = String(currentCol.defaultValue || '').trim() === String(targetCol.defaultValue || '').trim();

          let matchType: ColumnMapping['matchType'] = 'DIRECT_MATCH';
          let score = 100;
          let reason = 'Exact column match on name, type, nullability, and default value.';

          if (!typeMatch) {
            matchType = 'TYPE_COMPATIBLE';
            score = 85;
            reason = `Column exists but data type differs (Current: ${currentCol.dataType}, Target: ${targetCol.dataType}).`;
          } else if (!defaultMatch) {
            matchType = 'DEFAULT_COMPATIBLE';
            score = 95;
            reason = `Column exists with matching type, but default value differs.`;
          } else if (!nullabilityMatch) {
            matchType = 'SEMANTIC_COMPATIBLE';
            score = 90;
            reason = `Column exists with matching type, but nullability constraint differs.`;
          }

          mappings.push({
            table: targetTableName,
            currentColumn: currentCol.columnName,
            targetColumn: targetCol.name,
            matchType,
            confidenceScore: score,
            confidenceLevel: ConfidenceCalculator.getLevel(score),
            typeMatch,
            nullabilityMatch,
            defaultMatch,
            risk: RiskAnalyzer.evaluateColumnRisk(matchType, typeMatch, nullabilityMatch),
            reason,
          });
        } else {
          // Column exists in target but not in current table with exact name -> check for candidate rename or NEW_COLUMN
          let bestRenameMatch: { colName: string; score: number } | null = null;

          currentCols.forEach((curC) => {
            const sim = this.semanticMatcher.calculateNameSimilarity(curC.columnName, targetCol.name);
            if (sim >= 70) {
              if (!bestRenameMatch || sim > bestRenameMatch.score) {
                bestRenameMatch = { colName: curC.columnName, score: sim };
              }
            }
          });

          if (bestRenameMatch) {
            const curColObj = currentCols.get(bestRenameMatch.colName.toLowerCase())!;
            const typeMatch = this.normalizeDataType(curColObj.dataType) === this.normalizeDataType(targetCol.dataType);

            mappings.push({
              table: targetTableName,
              currentColumn: curColObj.columnName,
              targetColumn: targetCol.name,
              matchType: 'RENAME_CANDIDATE',
              confidenceScore: bestRenameMatch.score,
              confidenceLevel: ConfidenceCalculator.getLevel(bestRenameMatch.score),
              typeMatch,
              nullabilityMatch: curColObj.nullable === targetCol.nullable,
              defaultMatch: curColObj.defaultValue === targetCol.defaultValue,
              risk: 'MEDIUM',
              reason: `Candidate column rename from '${curColObj.columnName}' to '${targetCol.name}' with ${bestRenameMatch.score}% semantic similarity.`,
            });
          } else {
            mappings.push({
              table: targetTableName,
              currentColumn: null,
              targetColumn: targetCol.name,
              matchType: 'NEW_COLUMN',
              confidenceScore: 100,
              confidenceLevel: 'VERY_HIGH',
              typeMatch: true,
              nullabilityMatch: true,
              defaultMatch: true,
              risk: 'LOW',
              reason: `New column '${targetCol.name}' in target schema missing in current database.`,
            });
          }
        }
      });
    });

    // Also check for DEPRECATED_COLUMNs (columns in current DB not in target schema)
    currentColsByTable.forEach((colsMap, tblName) => {
      const targetTable = Array.from(targetSchema.tables.values()).find(
        (t) => t.name.toLowerCase() === tblName
      );
      if (targetTable) {
        colsMap.forEach((curCol) => {
          const existsInTarget = Array.from(targetTable.columns.values()).some(
            (tc) => tc.name.toLowerCase() === curCol.columnName.toLowerCase()
          );
          const mappedAsRename = mappings.some(
            (m) =>
              m.table.toLowerCase() === tblName &&
              m.currentColumn?.toLowerCase() === curCol.columnName.toLowerCase()
          );

          if (!existsInTarget && !mappedAsRename) {
            mappings.push({
              table: targetTable.name,
              currentColumn: curCol.columnName,
              targetColumn: curCol.columnName,
              matchType: 'DEPRECATED_COLUMN',
              confidenceScore: 90,
              confidenceLevel: 'HIGH',
              typeMatch: false,
              nullabilityMatch: false,
              defaultMatch: false,
              risk: 'HIGH',
              reason: `Column '${curCol.columnName}' exists in current table '${targetTable.name}' but is omitted in target schema.`,
            });
          }
        });
      }
    });

    return mappings;
  }

  private normalizeDataType(dataType: string): string {
    const dt = dataType.toLowerCase().trim();
    if (dt.includes('character varying') || dt.includes('varchar')) return 'varchar';
    if (dt.includes('timestamp')) return 'timestamp';
    if (dt.includes('int8') || dt.includes('bigint')) return 'bigint';
    if (dt.includes('int4') || dt.includes('integer') || dt.includes('int')) return 'integer';
    if (dt.includes('numeric') || dt.includes('decimal')) return 'numeric';
    if (dt.includes('bool')) return 'boolean';
    return dt;
  }
}
