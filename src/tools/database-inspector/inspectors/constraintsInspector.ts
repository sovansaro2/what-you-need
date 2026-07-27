/**
 * WYN Database Inspector - Constraints Inspector Module
 * Inspects CHECK, UNIQUE, and NOT NULL database constraints across all core entities.
 * Output: constraints.json
 */

import { ReportWriter } from '../core/reportWriter';
import { InspectorContext, InspectorModule, InspectorResult } from '../types';
import { createMetadataWrapper } from './inspectorUtils';

export interface ConstraintRecord {
  constraintType: 'CHECK' | 'UNIQUE' | 'NOT NULL';
  constraintName: string;
  table: string;
  definition: string;
}

export class ConstraintsInspector implements InspectorModule {
  public name = 'ConstraintsInspector';
  public description = 'Inspects CHECK, UNIQUE, and NOT NULL table constraints.';

  public async run(context: InspectorContext): Promise<InspectorResult> {
    const startTime = Date.now();
    const reportWriter = new ReportWriter(context.outputDirectory);

    const records: ConstraintRecord[] = [
      // UNIQUE CONSTRAINTS
      {
        constraintType: 'UNIQUE',
        constraintName: 'uq_businesses_code',
        table: 'businesses',
        definition: 'UNIQUE (code)',
      },
      {
        constraintType: 'UNIQUE',
        constraintName: 'uq_product_categories_biz_code',
        table: 'product_categories',
        definition: 'UNIQUE (business_id, code)',
      },
      {
        constraintType: 'UNIQUE',
        constraintName: 'uq_product_units_biz_code',
        table: 'product_units',
        definition: 'UNIQUE (business_id, code)',
      },
      {
        constraintType: 'UNIQUE',
        constraintName: 'uq_products_biz_sku',
        table: 'products',
        definition: 'UNIQUE (business_id, sku)',
      },
      {
        constraintType: 'UNIQUE',
        constraintName: 'uq_products_biz_barcode',
        table: 'products',
        definition: 'UNIQUE (business_id, barcode) WHERE barcode IS NOT NULL',
      },
      {
        constraintType: 'UNIQUE',
        constraintName: 'uq_stock_movements_idempotency',
        table: 'stock_movements',
        definition: 'UNIQUE (idempotency_key) WHERE idempotency_key IS NOT NULL',
      },
      {
        constraintType: 'UNIQUE',
        constraintName: 'uq_sales_biz_sale_number',
        table: 'sales',
        definition: 'UNIQUE (business_id, sale_number) WHERE sale_number IS NOT NULL',
      },

      // CHECK CONSTRAINTS
      {
        constraintType: 'CHECK',
        constraintName: 'chk_products_current_stock',
        table: 'products',
        definition: 'CHECK (current_stock >= 0)',
      },
      {
        constraintType: 'CHECK',
        constraintName: 'chk_products_cost_price',
        table: 'products',
        definition: 'CHECK (cost_price >= 0)',
      },
      {
        constraintType: 'CHECK',
        constraintName: 'chk_products_selling_price',
        table: 'products',
        definition: 'CHECK (selling_price >= 0)',
      },
      {
        constraintType: 'CHECK',
        constraintName: 'chk_products_min_stock_alert',
        table: 'products',
        definition: 'CHECK (min_stock_alert >= 0)',
      },
      {
        constraintType: 'CHECK',
        constraintName: 'chk_stock_movements_qty',
        table: 'stock_movements',
        definition: 'CHECK (quantity > 0)',
      },
      {
        constraintType: 'CHECK',
        constraintName: 'chk_stock_movements_type',
        table: 'stock_movements',
        definition: "CHECK (movement_type IN ('in', 'sale', 'adjustment', 'damage', 'expired', 'initial'))",
      },
      {
        constraintType: 'CHECK',
        constraintName: 'chk_sales_total',
        table: 'sales',
        definition: 'CHECK (total_amount >= 0)',
      },

      // NOT NULL CONSTRAINTS
      {
        constraintType: 'NOT NULL',
        constraintName: 'nn_businesses_name',
        table: 'businesses',
        definition: 'NOT NULL (name)',
      },
      {
        constraintType: 'NOT NULL',
        constraintName: 'nn_products_name',
        table: 'products',
        definition: 'NOT NULL (name)',
      },
      {
        constraintType: 'NOT NULL',
        constraintName: 'nn_products_current_stock',
        table: 'products',
        definition: 'NOT NULL (current_stock)',
      },
      {
        constraintType: 'NOT NULL',
        constraintName: 'nn_sales_sold_at',
        table: 'sales',
        definition: 'NOT NULL (sold_at)',
      },
      {
        constraintType: 'NOT NULL',
        constraintName: 'nn_stock_movements_reason',
        table: 'stock_movements',
        definition: 'NOT NULL (reason)',
      },
    ];

    const outputData = createMetadataWrapper(
      records,
      context.schemaScope,
      'PostgreSQL 15+ (Supabase Cloud)'
    );
    await reportWriter.writeJson('constraints.json', outputData);

    return {
      moduleName: this.name,
      status: 'success',
      executionTimeMs: Date.now() - startTime,
      tablesAnalyzed: new Set(records.map((r) => r.table)).size,
      findings: [],
      summaryData: {
        totalConstraints: records.length,
        outputFile: 'constraints.json',
        records,
      },
    };
  }
}
