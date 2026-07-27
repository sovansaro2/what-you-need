/**
 * WYN Schema Comparator Engine - Constraint Comparator
 * Compares CHECK and UNIQUE constraints per table between current database and target SQL schema.
 */

import { ConstraintDifference, InspectorConstraintRecord, ParsedTable } from '../types';

export class ConstraintComparator {
  public compare(
    currentConstraints: InspectorConstraintRecord[],
    targetTablesMap: Map<string, ParsedTable>
  ): ConstraintDifference[] {
    const differences: ConstraintDifference[] = [];

    // Group current constraints by table
    const currentConstraintsByTable = new Map<string, InspectorConstraintRecord[]>();
    for (const c of currentConstraints) {
      const tblKey = c.table.toLowerCase();
      if (!currentConstraintsByTable.has(tblKey)) {
        currentConstraintsByTable.set(tblKey, []);
      }
      currentConstraintsByTable.get(tblKey)!.push(c);
    }

    for (const [targetTableName, targetTable] of targetTablesMap.entries()) {
      const tblKey = targetTableName.toLowerCase();
      const currentList = currentConstraintsByTable.get(tblKey) || [];

      for (const targetConstraint of targetTable.constraints) {
        // Try matching by constraint name or by constraint type + definition similarity
        const matched = currentList.find((cur) => {
          if (cur.constraintName.toLowerCase() === targetConstraint.constraintName.toLowerCase()) {
            return true;
          }
          if (cur.constraintType.toUpperCase() === targetConstraint.constraintType.toUpperCase()) {
            return this.areConstraintDefinitionsSimilar(cur.definition, targetConstraint.definition);
          }
          return false;
        });

        if (!matched) {
          differences.push({
            table: targetTableName,
            constraintName: targetConstraint.constraintName,
            constraintType: targetConstraint.constraintType,
            diffType: 'MISSING_CONSTRAINT',
            target: targetConstraint.definition,
            description: `Missing ${targetConstraint.constraintType} constraint "${targetConstraint.constraintName}" on table "${targetTableName}". Target definition: ${targetConstraint.definition}`,
          });
        }
      }
    }

    // Check Extra constraints in current schema for target tables
    for (const [targetTableName, targetTable] of targetTablesMap.entries()) {
      const tblKey = targetTableName.toLowerCase();
      const currentList = currentConstraintsByTable.get(tblKey) || [];

      for (const cur of currentList) {
        // Ignore PK / FK constraints if present in InspectorConstraintRecord
        if (cur.constraintType === 'PRIMARY KEY' || cur.constraintType === 'FOREIGN KEY') {
          continue;
        }

        const isTarget = targetTable.constraints.some((tgt) => {
          if (tgt.constraintName.toLowerCase() === cur.constraintName.toLowerCase()) return true;
          if (tgt.constraintType.toUpperCase() === cur.constraintType.toUpperCase()) {
            return this.areConstraintDefinitionsSimilar(cur.definition, tgt.definition);
          }
          return false;
        });

        if (!isTarget) {
          differences.push({
            table: cur.table,
            constraintName: cur.constraintName,
            constraintType: cur.constraintType,
            diffType: 'EXTRA_CONSTRAINT',
            current: cur.definition,
            description: `Extra ${cur.constraintType} constraint "${cur.constraintName}" found on table "${cur.table}" in current database.`,
          });
        }
      }
    }

    return differences;
  }

  private areConstraintDefinitionsSimilar(defA: string, defB: string): boolean {
    if (!defA || !defB) return false;
    const cleanA = defA.replace(/\s+/g, '').replace(/[()"]/g, '').toLowerCase();
    const cleanB = defB.replace(/\s+/g, '').replace(/[()"]/g, '').toLowerCase();
    return cleanA === cleanB;
  }
}
