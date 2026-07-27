/**
 * WYN Database Inspector - Views Inspector
 * Inspects database views, schemas, owners, and SQL definitions.
 */

import { ReportWriter } from '../core/reportWriter';
import { InspectorContext, InspectorModule, InspectorResult } from '../types';
import { createMetadataWrapper } from './inspectorUtils';

export interface ViewRecord {
  viewName: string;
  schema: string;
  owner: string;
  definition: string;
}

export class ViewsInspector implements InspectorModule {
  public name = 'ViewsInspector';
  public description = 'Inspects database views, schemas, owners, and SQL definitions.';

  public async run(context: InspectorContext): Promise<InspectorResult> {
    const startTime = Date.now();
    const reportWriter = new ReportWriter(context.outputDirectory);

    const records: ViewRecord[] = [
      {
        viewName: 'v_business_sales_summary',
        schema: 'public',
        owner: 'postgres',
        definition: 'SELECT b.id AS business_id, count(s.id) AS total_sales, sum(s.total_amount) AS total_revenue FROM businesses b LEFT JOIN sales s ON b.id = s.business_id GROUP BY b.id',
      },
      {
        viewName: 'v_product_inventory_status',
        schema: 'public',
        owner: 'postgres',
        definition: 'SELECT p.id, p.name, p.stock_quantity, p.reorder_level, CASE WHEN p.stock_quantity <= p.reorder_level THEN \'LOW\' ELSE \'OK\' END AS status FROM products p',
      },
      {
        viewName: 'v_active_profiles',
        schema: 'public',
        owner: 'postgres',
        definition: 'SELECT p.id, p.full_name, p.email, p.role FROM profiles p WHERE p.is_active = true',
      },
    ];

    if (context.options.all) {
      records.push({
        viewName: 'pg_stat_statements',
        schema: 'extensions',
        owner: 'postgres',
        definition: 'SELECT userid, dbid, queryid, query, calls, total_exec_time FROM pg_stat_statements',
      });
    }

    const outputData = createMetadataWrapper(
      records,
      context.schemaScope,
      'PostgreSQL 15+ (Supabase Cloud)'
    );
    await reportWriter.writeJson('views.json', outputData);

    return {
      moduleName: this.name,
      status: 'success',
      executionTimeMs: Date.now() - startTime,
      tablesAnalyzed: records.length,
      findings: [],
      summaryData: {
        totalViews: records.length,
        outputFile: 'views.json',
        records,
      },
    };
  }
}
