/**
 * WYN Engineering Validation Engine - Mapping Validator
 * Validates entity mapping confidence, unmapped tables/columns, and duplicate mapping conflicts.
 */

import { ValidationResult, ValidationFinding } from '../types';

export class MappingValidator {
  public validate(mappingReport: any, tableMappings: any[], columnMappings: any[]): ValidationResult {
    const findings: ValidationFinding[] = [];
    let score = 100;

    const tMappings = tableMappings || mappingReport?.tableMappings || [];
    const cMappings = columnMappings || mappingReport?.columnMappings || [];

    // 1. Check for Low Confidence Candidate Renames (< 80% or < 70%)
    tMappings.forEach((tm: any, idx: number) => {
      if (tm.matchType === 'RENAME_CANDIDATE' && tm.confidenceScore < 80) {
        score -= 10;
        findings.push({
          id: `MAP-CONF-TBL-${idx + 1}`,
          category: 'MAPPING',
          severity: tm.confidenceScore < 60 ? 'CRITICAL' : 'WARNING',
          title: `Low Confidence Table Rename Candidate`,
          description: `Candidate rename from '${tm.currentTable}' to '${tm.targetTable}' has low confidence score (${tm.confidenceScore}%).`,
          recommendation: `Review table structure manually or verify rename candidate in configuration.`,
        });
      }
    });

    cMappings.forEach((cm: any, idx: number) => {
      if (cm.matchType === 'RENAME_CANDIDATE' && cm.confidenceScore < 80) {
        score -= 5;
        findings.push({
          id: `MAP-CONF-COL-${idx + 1}`,
          category: 'MAPPING',
          severity: cm.confidenceScore < 60 ? 'CRITICAL' : 'WARNING',
          title: `Low Confidence Column Rename Candidate`,
          description: `Candidate rename in '${cm.table}' from '${cm.currentColumn}' to '${cm.targetColumn}' has low confidence (${cm.confidenceScore}%).`,
          recommendation: `Confirm column semantics and ensure explicit renaming SQL or data migration is planned.`,
        });
      }
    });

    // 2. Unmapped / Deprecated Tables & Columns Check
    const deprecatedTables = tMappings.filter((tm: any) => tm.matchType === 'DEPRECATED_TABLE');
    if (deprecatedTables.length > 0) {
      findings.push({
        id: `MAP-UNMAPPED-TBL`,
        category: 'MAPPING',
        severity: 'INFO',
        title: `Deprecated Current Tables Unmapped in Target`,
        description: `${deprecatedTables.length} current table(s) omit target mappings (e.g. '${deprecatedTables.map((t: any) => t.currentTable).slice(0, 3).join("', '")}').`,
        recommendation: `Verify whether deprecated tables require archiving before deletion.`,
      });
    }

    const deprecatedCols = cMappings.filter((cm: any) => cm.matchType === 'DEPRECATED_COLUMN');
    if (deprecatedCols.length > 0) {
      findings.push({
        id: `MAP-UNMAPPED-COL`,
        category: 'MAPPING',
        severity: 'INFO',
        title: `Deprecated Current Columns Unmapped in Target`,
        description: `${deprecatedCols.length} current column(s) omit target mappings.`,
        recommendation: `Ensure no essential business data is orphaned in omitted columns.`,
      });
    }

    // 3. Duplicate Target Mappings Check
    const targetTableCounts = new Map<string, string[]>();
    tMappings.forEach((tm: any) => {
      if (tm.currentTable) {
        const list = targetTableCounts.get(tm.targetTable) || [];
        list.push(tm.currentTable);
        targetTableCounts.set(tm.targetTable, list);
      }
    });

    targetTableCounts.forEach((sources, targetTable) => {
      if (sources.length > 1) {
        score -= 15;
        findings.push({
          id: `MAP-DUP-TBL-${targetTable}`,
          category: 'MAPPING',
          severity: 'CRITICAL',
          title: `Duplicate Table Mapping Conflict`,
          description: `Multiple current tables [${sources.join(', ')}] are mapped to the same target table '${targetTable}'.`,
          recommendation: `Resolve multi-source table merge explicitly using structured table migration logic.`,
        });
      }
    });

    const targetColCounts = new Map<string, string[]>();
    cMappings.forEach((cm: any) => {
      if (cm.currentColumn) {
        const key = `${cm.table}.${cm.targetColumn}`;
        const list = targetColCounts.get(key) || [];
        list.push(cm.currentColumn);
        targetColCounts.set(key, list);
      }
    });

    targetColCounts.forEach((sources, key) => {
      if (sources.length > 1) {
        score -= 15;
        findings.push({
          id: `MAP-DUP-COL-${key}`,
          category: 'MAPPING',
          severity: 'CRITICAL',
          title: `Duplicate Column Mapping Conflict`,
          description: `Multiple current columns [${sources.join(', ')}] are mapped to target column '${key}'.`,
          recommendation: `Deconflict column mappings so that each target column originates from a single source column or explicit formula.`,
        });
      }
    });

    score = Math.max(0, score);
    const status = score === 100 ? 'PASSED' : findings.some((f) => f.severity === 'CRITICAL') ? 'FAILED' : 'WARNING';

    return {
      category: 'Mapping Validation',
      status,
      score,
      findings,
    };
  }
}
