/**
 * WYN Schema Comparator Engine - Table Comparator
 * Compares tables between current database inspector output and target SQL schema.
 * Identifies missing tables, extra tables, matching tables, and candidate renamed tables.
 */

import {
  InspectorColumnRecord,
  InspectorTableRecord,
  ParsedTable,
  RenamedCandidate,
  TableComparisonResult,
} from '../types';

export class TableComparator {
  public compare(
    currentTables: InspectorTableRecord[],
    targetTablesMap: Map<string, ParsedTable>,
    currentColumns: InspectorColumnRecord[] = []
  ): TableComparisonResult {
    const currentSet = new Set(currentTables.map((t) => t.tableName.toLowerCase()));
    const targetSet = new Set(Array.from(targetTablesMap.keys()).map((t) => t.toLowerCase()));

    const missingTables: string[] = [];
    const extraTables: string[] = [];
    const matchingTables: string[] = [];

    // Find missing and matching tables
    for (const targetName of targetTablesMap.keys()) {
      if (currentSet.has(targetName.toLowerCase())) {
        matchingTables.push(targetName);
      } else {
        missingTables.push(targetName);
      }
    }

    // Find extra tables
    for (const currentTable of currentTables) {
      if (!targetSet.has(currentTable.tableName.toLowerCase())) {
        extraTables.push(currentTable.tableName);
      }
    }

    // Identify candidate renames between missing and extra tables
    const renamedCandidates = this.detectRenamedCandidates(
      missingTables,
      extraTables,
      targetTablesMap,
      currentColumns
    );

    return {
      missingTables: missingTables.sort(),
      extraTables: extraTables.sort(),
      matchingTables: matchingTables.sort(),
      renamedCandidates,
    };
  }

  private detectRenamedCandidates(
    missingTables: string[],
    extraTables: string[],
    targetTablesMap: Map<string, ParsedTable>,
    currentColumns: InspectorColumnRecord[]
  ): RenamedCandidate[] {
    const candidates: RenamedCandidate[] = [];

    // Map current columns by table
    const currentColumnsByTable = new Map<string, Set<string>>();
    for (const col of currentColumns) {
      const tbl = col.table.toLowerCase();
      if (!currentColumnsByTable.has(tbl)) {
        currentColumnsByTable.set(tbl, new Set());
      }
      currentColumnsByTable.get(tbl)!.add(col.columnName.toLowerCase());
    }

    for (const missingName of missingTables) {
      const targetTable = targetTablesMap.get(missingName);
      if (!targetTable) continue;

      const targetColSet = new Set(
        Array.from(targetTable.columns.keys()).map((c) => c.toLowerCase())
      );
      if (targetColSet.size === 0) continue;

      for (const extraName of extraTables) {
        const extraColSet = currentColumnsByTable.get(extraName.toLowerCase());
        if (!extraColSet || extraColSet.size === 0) continue;

        // Calculate Jaccard similarity between column sets
        let intersection = 0;
        for (const col of targetColSet) {
          if (extraColSet.has(col)) intersection++;
        }

        const union = new Set([...Array.from(targetColSet), ...Array.from(extraColSet)]).size;
        const similarity = union > 0 ? (intersection / union) * 100 : 0;

        if (similarity >= 65) {
          candidates.push({
            currentName: extraName,
            targetName: missingName,
            confidenceScore: Math.round(similarity),
            reason: `${intersection} matching columns out of ${union} total columns (${Math.round(similarity)}% similarity)`,
          });
        }
      }
    }

    return candidates;
  }
}
