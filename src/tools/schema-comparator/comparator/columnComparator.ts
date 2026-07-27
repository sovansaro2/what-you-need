/**
 * WYN Schema Comparator Engine - Column Comparator
 * Compares columns per table between current database columns and target SQL schema.
 */

import { normalizeDataType, normalizeDefaultValue } from '../parser/sqlSchemaParser';
import { ColumnDifference, InspectorColumnRecord, ParsedTable } from '../types';

export class ColumnComparator {
  public compare(
    currentColumns: InspectorColumnRecord[],
    targetTablesMap: Map<string, ParsedTable>
  ): ColumnDifference[] {
    const differences: ColumnDifference[] = [];

    // Group current columns by table -> columnName
    const currentColsByTable = new Map<string, Map<string, InspectorColumnRecord>>();
    for (const col of currentColumns) {
      const tblKey = col.table.toLowerCase();
      if (!currentColsByTable.has(tblKey)) {
        currentColsByTable.set(tblKey, new Map());
      }
      currentColsByTable.get(tblKey)!.set(col.columnName.toLowerCase(), col);
    }

    // 1. Iterate over Target Tables and Columns
    for (const [targetTableName, targetTable] of targetTablesMap.entries()) {
      const tblKey = targetTableName.toLowerCase();
      const currentCols = currentColsByTable.get(tblKey);

      for (const [targetColName, targetCol] of targetTable.columns.entries()) {
        const colKey = targetColName.toLowerCase();

        if (!currentCols || !currentCols.has(colKey)) {
          // Missing column in current database
          differences.push({
            table: targetTableName,
            column: targetColName,
            diffType: 'MISSING',
            target: `${targetCol.dataType}${targetCol.nullable ? '' : ' NOT NULL'}${targetCol.defaultValue ? ` DEFAULT ${targetCol.defaultValue}` : ''}`,
            description: `Column "${targetColName}" is missing in table "${targetTableName}".`,
          });
        } else {
          // Column exists -> Compare type, nullability, default
          const currentCol = currentCols.get(colKey)!;

          const normalizedCurrentType = normalizeDataType(currentCol.dataType);
          const normalizedTargetType = normalizeDataType(targetCol.dataType);

          if (!this.areTypesCompatible(normalizedCurrentType, normalizedTargetType)) {
            differences.push({
              table: targetTableName,
              column: targetColName,
              diffType: 'DATA_TYPE',
              current: currentCol.dataType,
              target: targetCol.dataType,
              description: `Data type mismatch for "${targetTableName}.${targetColName}": current "${currentCol.dataType}" vs target "${targetCol.dataType}".`,
            });
          }

          if (currentCol.nullable !== targetCol.nullable) {
            differences.push({
              table: targetTableName,
              column: targetColName,
              diffType: 'NULLABILITY',
              current: currentCol.nullable ? 'NULL' : 'NOT NULL',
              target: targetCol.nullable ? 'NULL' : 'NOT NULL',
              description: `Nullability mismatch for "${targetTableName}.${targetColName}": current is ${currentCol.nullable ? 'NULL' : 'NOT NULL'}, target expects ${targetCol.nullable ? 'NULL' : 'NOT NULL'}.`,
            });
          }

          const normCurDefault = normalizeDefaultValue(currentCol.defaultValue);
          const normTgtDefault = normalizeDefaultValue(targetCol.defaultValue);

          if (normCurDefault !== normTgtDefault && targetCol.defaultValue !== null) {
            differences.push({
              table: targetTableName,
              column: targetColName,
              diffType: 'DEFAULT_VALUE',
              current: currentCol.defaultValue,
              target: targetCol.defaultValue,
              description: `Default value mismatch for "${targetTableName}.${targetColName}": current "${currentCol.defaultValue || 'none'}" vs target "${targetCol.defaultValue || 'none'}".`,
            });
          }
        }
      }
    }

    // 2. Find Extra Columns in Current Database for existing Target Tables
    for (const [targetTableName, targetTable] of targetTablesMap.entries()) {
      const tblKey = targetTableName.toLowerCase();
      const currentCols = currentColsByTable.get(tblKey);
      if (!currentCols) continue;

      const targetColKeys = new Set(
        Array.from(targetTable.columns.keys()).map((c) => c.toLowerCase())
      );

      for (const [colKey, currentCol] of currentCols.entries()) {
        if (!targetColKeys.has(colKey)) {
          differences.push({
            table: currentCol.table,
            column: currentCol.columnName,
            diffType: 'EXTRA',
            current: `${currentCol.dataType}${currentCol.nullable ? '' : ' NOT NULL'}`,
            description: `Extra column "${currentCol.columnName}" found in current table "${currentCol.table}" that is not defined in target SQL schema.`,
          });
        }
      }
    }

    return differences;
  }

  private areTypesCompatible(typeA: string, typeB: string): boolean {
    if (typeA === typeB) return true;

    // Handle equivalent types in PostgreSQL
    const equivs = [
      ['character varying', 'varchar', 'text'],
      ['integer', 'int', 'int4'],
      ['bigint', 'int8'],
      ['smallint', 'int2'],
      ['timestamp with time zone', 'timestamptz'],
      ['timestamp without time zone', 'timestamp'],
      ['boolean', 'bool'],
    ];

    for (const group of equivs) {
      if (group.some((t) => typeA.startsWith(t)) && group.some((t) => typeB.startsWith(t))) {
        return true;
      }
    }

    return false;
  }
}
