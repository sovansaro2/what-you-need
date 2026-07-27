/**
 * WYN Schema Comparator Engine - Schema Comparator Core
 * Orchestrates parsing target DDL SQL schema, reading Inspector outputs, running all comparators, and calculating health metrics.
 */

import fs from 'fs';
import path from 'path';
import { SqlSchemaParser } from '../parser/sqlSchemaParser';
import { ColumnComparator } from './columnComparator';
import { ConstraintComparator } from './constraintComparator';
import { ForeignKeyComparator } from './foreignKeyComparator';
import { HealthCalculator } from './healthCalculator';
import { IndexComparator } from './indexComparator';
import { PrimaryKeyComparator } from './primaryKeyComparator';
import { TableComparator } from './tableComparator';
import {
  ComparatorOptions,
  InspectorColumnRecord,
  InspectorConstraintRecord,
  InspectorFKRecord,
  InspectorIndexRecord,
  InspectorPKRecord,
  InspectorTableRecord,
  ParsedSchema,
  SchemaComparison,
} from '../types';

export class SchemaComparator {
  private parser: SqlSchemaParser;
  private tableComparator: TableComparator;
  private columnComparator: ColumnComparator;
  private pkComparator: PrimaryKeyComparator;
  private fkComparator: ForeignKeyComparator;
  private constraintComparator: ConstraintComparator;
  private indexComparator: IndexComparator;
  private healthCalculator: HealthCalculator;

  constructor() {
    this.parser = new SqlSchemaParser();
    this.tableComparator = new TableComparator();
    this.columnComparator = new ColumnComparator();
    this.pkComparator = new PrimaryKeyComparator();
    this.fkComparator = new ForeignKeyComparator();
    this.constraintComparator = new ConstraintComparator();
    this.indexComparator = new IndexComparator();
    this.healthCalculator = new HealthCalculator();
  }

  public getTargetSchema(sqlPath: string): ParsedSchema {
    return this.parser.parseFile(sqlPath);
  }

  public compareSchemas(options: ComparatorOptions = {}): SchemaComparison {
    const targetSqlPath = options.targetSqlPath || path.resolve(process.cwd(), 'database_v1.sql');
    const inspectorDir = options.inspectorDir || path.resolve(process.cwd(), 'reports/db-inspector');

    // 1. Parse Target DDL SQL Schema
    const parsedTargetSchema = this.parser.parseFile(targetSqlPath);

    // 2. Read Inspector Outputs
    const currentTables = this.readJsonRecords<InspectorTableRecord>(inspectorDir, 'tables.json');
    const currentColumns = this.readJsonRecords<InspectorColumnRecord>(inspectorDir, 'columns.json');
    const currentPKs = this.readJsonRecords<InspectorPKRecord>(inspectorDir, 'primary_keys.json');
    const currentFKs = this.readJsonRecords<InspectorFKRecord>(inspectorDir, 'foreign_keys.json');
    const currentConstraints = this.readJsonRecords<InspectorConstraintRecord>(inspectorDir, 'constraints.json');
    const currentIndexes = this.readJsonRecords<InspectorIndexRecord>(inspectorDir, 'indexes.json');

    const schemaHashPath = path.join(inspectorDir, 'schema_hash.txt');
    let schemaHash = 'UNKNOWN_HASH';
    if (fs.existsSync(schemaHashPath)) {
      const rawText = fs.readFileSync(schemaHashPath, 'utf-8');
      const hashMatch = rawText.match(/Schema Hash:\s*([A-F0-9]{64})/i);
      if (hashMatch) {
        schemaHash = hashMatch[1];
      } else {
        schemaHash = rawText.split('\n')[0].trim();
      }
    }

    // 3. Execute Comparators
    const tableComparison = this.tableComparator.compare(
      currentTables,
      parsedTargetSchema.tables,
      currentColumns
    );

    const columnDifferences = this.columnComparator.compare(
      currentColumns,
      parsedTargetSchema.tables
    );

    const pkDifferences = this.pkComparator.compare(
      currentPKs,
      parsedTargetSchema.tables
    );

    const fkDifferences = this.fkComparator.compare(
      currentFKs,
      parsedTargetSchema.tables
    );

    const constraintDifferences = this.constraintComparator.compare(
      currentConstraints,
      parsedTargetSchema.tables
    );

    const indexDifferences = this.indexComparator.compare(
      currentIndexes,
      parsedTargetSchema.tables,
      parsedTargetSchema.indexes
    );

    // 4. Calculate Health Score
    const health = this.healthCalculator.calculate(
      tableComparison,
      columnDifferences,
      pkDifferences,
      fkDifferences,
      constraintDifferences,
      indexDifferences,
      parsedTargetSchema.tables,
      currentTables,
      currentFKs
    );

    // 5. Calculate Match Percentage & Summary
    const totalDifferences =
      tableComparison.missingTables.length +
      tableComparison.extraTables.length +
      columnDifferences.length +
      pkDifferences.length +
      fkDifferences.length +
      constraintDifferences.length +
      indexDifferences.length;

    const totalTargetObjects =
      parsedTargetSchema.tables.size +
      Array.from(parsedTargetSchema.tables.values()).reduce((acc, t) => acc + t.columns.size, 0) +
      parsedTargetSchema.indexes.length;

    const schemaMatchPercentage =
      totalTargetObjects > 0
        ? Math.max(0, Math.min(100, Math.round(((totalTargetObjects - totalDifferences) / totalTargetObjects) * 1000) / 10))
        : 100;

    const summary = {
      totalDifferences,
      missingTablesCount: tableComparison.missingTables.length,
      extraTablesCount: tableComparison.extraTables.length,
      columnDifferencesCount: columnDifferences.length,
      pkDifferencesCount: pkDifferences.length,
      fkDifferencesCount: fkDifferences.length,
      constraintDifferencesCount: constraintDifferences.length,
      indexDifferencesCount: indexDifferences.length,
      schemaMatchPercentage,
    };

    return {
      timestamp: new Date().toISOString(),
      targetFile: path.basename(targetSqlPath),
      schemaHash,
      summary,
      tableComparison,
      columnDifferences,
      pkDifferences,
      fkDifferences,
      constraintDifferences,
      indexDifferences,
      health,
    };
  }

  private readJsonRecords<T>(dir: string, filename: string): T[] {
    const filePath = path.join(dir, filename);
    if (!fs.existsSync(filePath)) {
      return [];
    }
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) return parsed as T[];
      if (parsed && Array.isArray(parsed.records)) return parsed.records as T[];
      return [];
    } catch {
      return [];
    }
  }
}
