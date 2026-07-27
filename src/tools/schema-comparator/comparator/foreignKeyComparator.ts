/**
 * WYN Schema Comparator Engine - Foreign Key Comparator
 * Compares foreign keys per table between current database and target SQL schema.
 */

import { ForeignKeyDifference, InspectorFKRecord, ParsedTable } from '../types';

export class ForeignKeyComparator {
  public compare(
    currentFKs: InspectorFKRecord[],
    targetTablesMap: Map<string, ParsedTable>
  ): ForeignKeyDifference[] {
    const differences: ForeignKeyDifference[] = [];

    // Group current FKs by table
    const currentFksByTable = new Map<string, InspectorFKRecord[]>();
    for (const fk of currentFKs) {
      const tblKey = fk.sourceTable.toLowerCase();
      if (!currentFksByTable.has(tblKey)) {
        currentFksByTable.set(tblKey, []);
      }
      currentFksByTable.get(tblKey)!.push(fk);
    }

    for (const [targetTableName, targetTable] of targetTablesMap.entries()) {
      const tblKey = targetTableName.toLowerCase();
      const currentTableFks = currentFksByTable.get(tblKey) || [];

      for (const targetFk of targetTable.foreignKeys) {
        // Find matching current FK by sourceColumn + targetTable
        const matchedFk = currentTableFks.find(
          (cur) =>
            cur.sourceColumn.toLowerCase() === targetFk.sourceColumn.toLowerCase() &&
            cur.targetTable.toLowerCase() === targetFk.targetTable.toLowerCase()
        );

        if (!matchedFk) {
          differences.push({
            table: targetTableName,
            constraintName: targetFk.constraintName,
            sourceColumn: targetFk.sourceColumn,
            targetTable: targetFk.targetTable,
            diffType: 'MISSING_FK',
            target: targetFk,
            description: `Foreign key on "${targetTableName}.${targetFk.sourceColumn}" referencing "${targetFk.targetTable}(${targetFk.targetColumn})" is missing.`,
          });
        } else {
          // Compare onDelete behavior if specified
          const curOnDelete = (matchedFk.onDelete || 'NO ACTION').toUpperCase();
          const tgtOnDelete = (targetFk.onDelete || 'NO ACTION').toUpperCase();

          if (curOnDelete !== tgtOnDelete) {
            differences.push({
              table: targetTableName,
              constraintName: matchedFk.constraintName,
              sourceColumn: targetFk.sourceColumn,
              targetTable: targetFk.targetTable,
              diffType: 'DEFINITION_MISMATCH',
              current: matchedFk,
              target: targetFk,
              description: `Foreign key ON DELETE mismatch for "${targetTableName}.${targetFk.sourceColumn}": current is ${curOnDelete}, target expects ${tgtOnDelete}.`,
            });
          }
        }
      }
    }

    // Check Extra FKs in current schema for existing target tables
    for (const [targetTableName, targetTable] of targetTablesMap.entries()) {
      const tblKey = targetTableName.toLowerCase();
      const currentTableFks = currentFksByTable.get(tblKey) || [];

      for (const curFk of currentTableFks) {
        const matchesTarget = targetTable.foreignKeys.some(
          (tgt) =>
            tgt.sourceColumn.toLowerCase() === curFk.sourceColumn.toLowerCase() &&
            tgt.targetTable.toLowerCase() === curFk.targetTable.toLowerCase()
        );

        if (!matchesTarget) {
          differences.push({
            table: curFk.sourceTable,
            constraintName: curFk.constraintName,
            sourceColumn: curFk.sourceColumn,
            targetTable: curFk.targetTable,
            diffType: 'EXTRA_FK',
            current: curFk,
            description: `Extra foreign key "${curFk.constraintName}" on "${curFk.sourceTable}.${curFk.sourceColumn}" referencing "${curFk.targetTable}" in current database.`,
          });
        }
      }
    }

    return differences;
  }
}
