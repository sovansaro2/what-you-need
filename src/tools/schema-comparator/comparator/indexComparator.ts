/**
 * WYN Schema Comparator Engine - Index Comparator
 * Compares indexes (unique, composite, partial) per table between current database and target SQL schema.
 */

import { IndexDifference, InspectorIndexRecord, ParsedIndex, ParsedTable } from '../types';

export class IndexComparator {
  public compare(
    currentIndexes: InspectorIndexRecord[],
    targetTablesMap: Map<string, ParsedTable>,
    globalTargetIndexes: ParsedIndex[] = []
  ): IndexDifference[] {
    const differences: IndexDifference[] = [];

    // Filter out primary key indexes from current
    const nonPkCurrentIndexes = currentIndexes.filter((idx) => !idx.isPrimary);

    // Group current indexes by table
    const currentIndexesByTable = new Map<string, InspectorIndexRecord[]>();
    for (const idx of nonPkCurrentIndexes) {
      const tblKey = idx.table.toLowerCase();
      if (!currentIndexesByTable.has(tblKey)) {
        currentIndexesByTable.set(tblKey, []);
      }
      currentIndexesByTable.get(tblKey)!.push(idx);
    }

    // Collect all target indexes
    const targetIndexesByTable = new Map<string, ParsedIndex[]>();
    for (const [tblName, tbl] of targetTablesMap.entries()) {
      targetIndexesByTable.set(tblName.toLowerCase(), [...tbl.indexes]);
    }
    for (const gIdx of globalTargetIndexes) {
      const tblKey = gIdx.table.toLowerCase();
      if (!targetIndexesByTable.has(tblKey)) {
        targetIndexesByTable.set(tblKey, []);
      }
      const existing = targetIndexesByTable.get(tblKey)!;
      if (!existing.some((e) => e.indexName.toLowerCase() === gIdx.indexName.toLowerCase())) {
        existing.push(gIdx);
      }
    }

    for (const [targetTableName, targetTable] of targetTablesMap.entries()) {
      const tblKey = targetTableName.toLowerCase();
      const currentList = currentIndexesByTable.get(tblKey) || [];
      const targetList = targetIndexesByTable.get(tblKey) || [];

      for (const targetIdx of targetList) {
        // Match by indexName or by column composition + uniqueness
        const matched = currentList.find((cur) => {
          if (cur.indexName.toLowerCase() === targetIdx.indexName.toLowerCase()) {
            return true;
          }
          const curCols = cur.columns.map((c) => c.toLowerCase()).join(',');
          const tgtCols = targetIdx.columns.map((c) => c.toLowerCase()).join(',');
          return curCols === tgtCols && cur.isUnique === targetIdx.isUnique;
        });

        if (!matched) {
          differences.push({
            table: targetTableName,
            indexName: targetIdx.indexName,
            diffType: 'MISSING_INDEX',
            isUniqueMismatch: false,
            isPartialMismatch: false,
            target: targetIdx,
            description: `Missing ${targetIdx.isUnique ? 'UNIQUE ' : ''}index "${targetIdx.indexName}" on table "${targetTableName}" (${targetIdx.columns.join(', ')}).`,
          });
        } else {
          // Compare uniqueness or partial condition
          const isUniqueMismatch = matched.isUnique !== targetIdx.isUnique;
          const isPartialMismatch = (matched.isPartial || false) !== targetIdx.isPartial;

          if (isUniqueMismatch || isPartialMismatch) {
            differences.push({
              table: targetTableName,
              indexName: matched.indexName,
              diffType: 'DEFINITION_MISMATCH',
              isUniqueMismatch,
              isPartialMismatch,
              current: matched,
              target: targetIdx,
              description: `Index definition mismatch for "${matched.indexName}" on "${targetTableName}": uniqueness current ${matched.isUnique} vs target ${targetIdx.isUnique}, partial current ${matched.isPartial || false} vs target ${targetIdx.isPartial}.`,
            });
          }
        }
      }
    }

    // Check Extra indexes in current database for target tables
    for (const [targetTableName] of targetTablesMap.entries()) {
      const tblKey = targetTableName.toLowerCase();
      const currentList = currentIndexesByTable.get(tblKey) || [];
      const targetList = targetIndexesByTable.get(tblKey) || [];

      for (const cur of currentList) {
        const matchesTarget = targetList.some((tgt) => {
          if (tgt.indexName.toLowerCase() === cur.indexName.toLowerCase()) return true;
          const curCols = cur.columns.map((c) => c.toLowerCase()).join(',');
          const tgtCols = tgt.columns.map((c) => c.toLowerCase()).join(',');
          return curCols === tgtCols;
        });

        if (!matchesTarget) {
          differences.push({
            table: cur.table,
            indexName: cur.indexName,
            diffType: 'EXTRA_INDEX',
            current: cur,
            description: `Extra index "${cur.indexName}" found on table "${cur.table}" in current database.`,
          });
        }
      }
    }

    return differences;
  }
}
