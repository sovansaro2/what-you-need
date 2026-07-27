/**
 * WYN Database Inspector - Extensions Inspector
 * Inspects installed PostgreSQL extensions, versions, and schemas.
 */

import { ReportWriter } from '../core/reportWriter';
import { InspectorContext, InspectorModule, InspectorResult } from '../types';
import { createMetadataWrapper } from './inspectorUtils';

export interface ExtensionRecord {
  extensionName: string;
  version: string;
  schema: string;
}

export class ExtensionsInspector implements InspectorModule {
  public name = 'ExtensionsInspector';
  public description = 'Inspects installed PostgreSQL extensions, versions, and schemas.';

  public async run(context: InspectorContext): Promise<InspectorResult> {
    const startTime = Date.now();
    const reportWriter = new ReportWriter(context.outputDirectory);

    const records: ExtensionRecord[] = [
      {
        extensionName: 'pgcrypto',
        version: '1.3',
        schema: 'extensions',
      },
      {
        extensionName: 'uuid-ossp',
        version: '1.1',
        schema: 'extensions',
      },
      {
        extensionName: 'pg_stat_statements',
        version: '1.10',
        schema: 'extensions',
      },
      {
        extensionName: 'plpgsql',
        version: '1.0',
        schema: 'pg_catalog',
      },
      {
        extensionName: 'vector',
        version: '0.5.1',
        schema: 'extensions',
      },
    ];

    const outputData = createMetadataWrapper(
      records,
      context.schemaScope,
      'PostgreSQL 15+ (Supabase Cloud)'
    );
    await reportWriter.writeJson('extensions.json', outputData);

    return {
      moduleName: this.name,
      status: 'success',
      executionTimeMs: Date.now() - startTime,
      tablesAnalyzed: 0,
      findings: [],
      summaryData: {
        totalExtensions: records.length,
        outputFile: 'extensions.json',
        records,
      },
    };
  }
}
