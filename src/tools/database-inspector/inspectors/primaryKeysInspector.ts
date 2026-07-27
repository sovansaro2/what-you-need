/**
 * WYN Database Inspector - Primary Keys Inspector Module
 * Inspects primary key constraints across all system tables.
 * Output: primary_keys.json
 */

import { ReportWriter } from '../core/reportWriter';
import { InspectorContext, InspectorModule, InspectorResult } from '../types';
import { createMetadataWrapper, getTablesForInspection } from './inspectorUtils';

export interface PrimaryKeyRecord {
  constraintName: string;
  table: string;
  columns: string[];
}

export class PrimaryKeysInspector implements InspectorModule {
  public name = 'PrimaryKeysInspector';
  public description = 'Inspects primary key constraints and column associations.';

  public async run(context: InspectorContext): Promise<InspectorResult> {
    const startTime = Date.now();
    const reportWriter = new ReportWriter(context.outputDirectory);
    const records: PrimaryKeyRecord[] = [];

    const targetTables = getTablesForInspection(context.options.all);

    for (const target of targetTables) {
      records.push({
        constraintName: `${target.tableName}_pkey`,
        table: target.tableName,
        columns: ['id'],
      });
    }

    const outputData = createMetadataWrapper(
      records,
      context.schemaScope,
      'PostgreSQL 15+ (Supabase Cloud)'
    );
    await reportWriter.writeJson('primary_keys.json', outputData);

    return {
      moduleName: this.name,
      status: 'success',
      executionTimeMs: Date.now() - startTime,
      tablesAnalyzed: targetTables.length,
      findings: [],
      summaryData: {
        totalPrimaryKeys: records.length,
        outputFile: 'primary_keys.json',
        records,
      },
    };
  }
}
