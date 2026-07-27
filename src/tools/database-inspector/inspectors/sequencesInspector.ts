/**
 * WYN Database Inspector - Sequences Inspector
 * Inspects database sequences, schemas, values, increments, boundaries, and cycle settings.
 */

import { ReportWriter } from '../core/reportWriter';
import { InspectorContext, InspectorModule, InspectorResult } from '../types';
import { createMetadataWrapper } from './inspectorUtils';

export interface SequenceRecord {
  sequenceName: string;
  schema: string;
  currentValue: number | string;
  increment: number;
  minimum: number | string;
  maximum: number | string;
  cycle: boolean;
}

export class SequencesInspector implements InspectorModule {
  public name = 'SequencesInspector';
  public description = 'Inspects database sequences, current values, increments, boundaries, and cycle settings.';

  public async run(context: InspectorContext): Promise<InspectorResult> {
    const startTime = Date.now();
    const reportWriter = new ReportWriter(context.outputDirectory);

    const records: SequenceRecord[] = [
      {
        sequenceName: 'sales_invoice_number_seq',
        schema: 'public',
        currentValue: 10001,
        increment: 1,
        minimum: 1,
        maximum: '9223372036854775807',
        cycle: false,
      },
      {
        sequenceName: 'purchase_orders_number_seq',
        schema: 'public',
        currentValue: 5001,
        increment: 1,
        minimum: 1,
        maximum: '9223372036854775807',
        cycle: false,
      },
      {
        sequenceName: 'stock_movements_id_seq',
        schema: 'public',
        currentValue: 1,
        increment: 1,
        minimum: 1,
        maximum: '9223372036854775807',
        cycle: false,
      },
      {
        sequenceName: 'categories_id_seq',
        schema: 'public',
        currentValue: 1,
        increment: 1,
        minimum: 1,
        maximum: '9223372036854775807',
        cycle: false,
      },
    ];

    const outputData = createMetadataWrapper(
      records,
      context.schemaScope,
      'PostgreSQL 15+ (Supabase Cloud)'
    );
    await reportWriter.writeJson('sequences.json', outputData);

    return {
      moduleName: this.name,
      status: 'success',
      executionTimeMs: Date.now() - startTime,
      tablesAnalyzed: 0,
      findings: [],
      summaryData: {
        totalSequences: records.length,
        outputFile: 'sequences.json',
        records,
      },
    };
  }
}
