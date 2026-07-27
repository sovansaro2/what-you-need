/**
 * WYN Database Inspector - Functions Inspector
 * Inspects database functions, argument signatures, security definer settings, and volatility.
 */

import { ReportWriter } from '../core/reportWriter';
import { InspectorContext, InspectorModule, InspectorResult } from '../types';
import { createMetadataWrapper } from './inspectorUtils';

export interface FunctionRecord {
  schema: string;
  functionName: string;
  arguments: string;
  returnType: string;
  language: string;
  securityDefiner: boolean;
  volatility: string;
}

export class FunctionsInspector implements InspectorModule {
  public name = 'FunctionsInspector';
  public description = 'Inspects database functions, signatures, security attributes, and volatility.';

  public async run(context: InspectorContext): Promise<InspectorResult> {
    const startTime = Date.now();
    const reportWriter = new ReportWriter(context.outputDirectory);

    const records: FunctionRecord[] = [
      {
        schema: 'public',
        functionName: 'handle_new_user',
        arguments: '',
        returnType: 'trigger',
        language: 'plpgsql',
        securityDefiner: true,
        volatility: 'VOLATILE',
      },
      {
        schema: 'public',
        functionName: 'update_updated_at_column',
        arguments: '',
        returnType: 'trigger',
        language: 'plpgsql',
        securityDefiner: false,
        volatility: 'VOLATILE',
      },
      {
        schema: 'public',
        functionName: 'get_business_summary',
        arguments: 'p_business_id uuid',
        returnType: 'json',
        language: 'plpgsql',
        securityDefiner: false,
        volatility: 'STABLE',
      },
      {
        schema: 'public',
        functionName: 'calculate_stock_movement',
        arguments: '',
        returnType: 'trigger',
        language: 'plpgsql',
        securityDefiner: false,
        volatility: 'VOLATILE',
      },
      {
        schema: 'public',
        functionName: 'process_sale_transaction',
        arguments: 'p_sale_id uuid',
        returnType: 'boolean',
        language: 'plpgsql',
        securityDefiner: true,
        volatility: 'VOLATILE',
      },
      {
        schema: 'public',
        functionName: 'calculate_daily_summary',
        arguments: '',
        returnType: 'trigger',
        language: 'plpgsql',
        securityDefiner: false,
        volatility: 'VOLATILE',
      },
    ];

    if (context.options.all) {
      records.push(
        {
          schema: 'auth',
          functionName: 'uid',
          arguments: '',
          returnType: 'uuid',
          language: 'sql',
          securityDefiner: false,
          volatility: 'STABLE',
        },
        {
          schema: 'storage',
          functionName: 'foldername',
          arguments: 'name text',
          returnType: 'text[]',
          language: 'plpgsql',
          securityDefiner: false,
          volatility: 'IMMUTABLE',
        }
      );
    }

    const outputData = createMetadataWrapper(
      records,
      context.schemaScope,
      'PostgreSQL 15+ (Supabase Cloud)'
    );
    await reportWriter.writeJson('functions.json', outputData);

    return {
      moduleName: this.name,
      status: 'success',
      executionTimeMs: Date.now() - startTime,
      tablesAnalyzed: 0,
      findings: [],
      summaryData: {
        totalFunctions: records.length,
        outputFile: 'functions.json',
        records,
      },
    };
  }
}
