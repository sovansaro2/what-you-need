/**
 * WYN Schema Comparator Engine - Primary Key Comparator
 * Compares primary keys per table between current database and target SQL schema.
 */

import { InspectorPKRecord, ParsedTable, PrimaryKeyDifference } from '../types';

export class PrimaryKeyComparator {
  public compare(
    currentPKs: InspectorPKRecord[],
    targetTablesMap: Map<string, ParsedTable>
  ): PrimaryKeyDifference[] {
    const differences: PrimaryKeyDifference[] = [];

    // Map current PKs by table
    const currentPkByTable = new Map<string, InspectorPKRecord>();
    for (const pk of currentPKs) {
      currentPkByTable.set(pk.table.toLowerCase(), pk);
    }

    for (const [targetTableName, targetTable] of targetTablesMap.entries()) {
      const tblKey = targetTableName.toLowerCase();
      const currentPk = currentPkByTable.get(tblKey);
      const targetPk = targetTable.primaryKey;

      if (targetPk && !currentPk) {
        differences.push({
          table: targetTableName,
          diffType: 'MISSING_PK',
          targetColumns: targetPk.columns,
          description: `Primary key is missing on table "${targetTableName}". Target expects PK on (${targetPk.columns.join(', ')}).`,
        });
      } else if (!targetPk && currentPk) {
        differences.push({
          table: targetTableName,
          diffType: 'EXTRA_PK',
          currentColumns: currentPk.columns,
          description: `Extra primary key found on current table "${targetTableName}" on (${currentPk.columns.join(', ')}).`,
        });
      } else if (targetPk && currentPk) {
        const curCols = currentPk.columns.map((c) => c.toLowerCase()).sort().join(',');
        const tgtCols = targetPk.columns.map((c) => c.toLowerCase()).sort().join(',');

        if (curCols !== tgtCols) {
          differences.push({
            table: targetTableName,
            diffType: 'COLUMN_MISMATCH',
            currentColumns: currentPk.columns,
            targetColumns: targetPk.columns,
            description: `Primary key column mismatch on table "${targetTableName}": current (${currentPk.columns.join(', ')}) vs target (${targetPk.columns.join(', ')}).`,
          });
        }
      }
    }

    return differences;
  }
}
