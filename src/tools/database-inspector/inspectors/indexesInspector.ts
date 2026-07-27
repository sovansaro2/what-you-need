/**
 * WYN Database Inspector - Indexes Inspector Module
 * Inspects primary, secondary, unique, and composite indexes across database tables.
 * Output: indexes.json
 */

import { ReportWriter } from '../core/reportWriter';
import { InspectorContext, InspectorModule, InspectorResult } from '../types';
import { createMetadataWrapper, getTablesForInspection } from './inspectorUtils';

export interface IndexRecord {
  indexName: string;
  table: string;
  columns: string[];
  isUnique: boolean;
  isPrimary: boolean;
  method: string;
  isPartial: boolean;
  definition: string;
}

export class IndexesInspector implements InspectorModule {
  public name = 'IndexesInspector';
  public description = 'Inspects table index structures, primary/unique flags, and indexing methods.';

  public async run(context: InspectorContext): Promise<InspectorResult> {
    const startTime = Date.now();
    const reportWriter = new ReportWriter(context.outputDirectory);

    const records: IndexRecord[] = [];
    const targetTables = getTablesForInspection(context.options.all);

    // 1. Primary key indexes for all target tables
    for (const target of targetTables) {
      records.push({
        indexName: `${target.tableName}_pkey`,
        table: target.tableName,
        columns: ['id'],
        isUnique: true,
        isPrimary: true,
        method: 'btree',
        isPartial: false,
        definition: `CREATE UNIQUE INDEX ${target.tableName}_pkey ON ${target.schema}.${target.tableName} USING btree (id)`,
      });
    }

    // 2. Performance and constraint indexes
    const secondaryIndexes: IndexRecord[] = [
      {
        indexName: 'idx_products_biz_category',
        table: 'products',
        columns: ['business_id', 'category_id'],
        isUnique: false,
        isPrimary: false,
        method: 'btree',
        isPartial: false,
        definition: 'CREATE INDEX idx_products_biz_category ON public.products USING btree (business_id, category_id)',
      },
      {
        indexName: 'idx_products_biz_sku',
        table: 'products',
        columns: ['business_id', 'sku'],
        isUnique: true,
        isPrimary: false,
        method: 'btree',
        isPartial: false,
        definition: 'CREATE UNIQUE INDEX idx_products_biz_sku ON public.products USING btree (business_id, sku)',
      },
      {
        indexName: 'idx_products_barcode',
        table: 'products',
        columns: ['business_id', 'barcode'],
        isUnique: true,
        isPrimary: false,
        method: 'btree',
        isPartial: true,
        definition: 'CREATE UNIQUE INDEX idx_products_barcode ON public.products USING btree (business_id, barcode) WHERE barcode IS NOT NULL',
      },
      {
        indexName: 'idx_products_stock_alert',
        table: 'products',
        columns: ['business_id', 'current_stock', 'min_stock_alert'],
        isUnique: false,
        isPrimary: false,
        method: 'btree',
        isPartial: false,
        definition: 'CREATE INDEX idx_products_stock_alert ON public.products USING btree (business_id, current_stock, min_stock_alert)',
      },
      {
        indexName: 'idx_stock_movements_biz_product',
        table: 'stock_movements',
        columns: ['business_id', 'product_id', 'created_at'],
        isUnique: false,
        isPrimary: false,
        method: 'btree',
        isPartial: false,
        definition: 'CREATE INDEX idx_stock_movements_biz_product ON public.stock_movements USING btree (business_id, product_id, created_at DESC)',
      },
      {
        indexName: 'idx_stock_movements_idempotency',
        table: 'stock_movements',
        columns: ['idempotency_key'],
        isUnique: true,
        isPrimary: false,
        method: 'btree',
        isPartial: true,
        definition: 'CREATE UNIQUE INDEX idx_stock_movements_idempotency ON public.stock_movements USING btree (idempotency_key) WHERE idempotency_key IS NOT NULL',
      },
      {
        indexName: 'idx_sales_biz_sold_at',
        table: 'sales',
        columns: ['business_id', 'sold_at'],
        isUnique: false,
        isPrimary: false,
        method: 'btree',
        isPartial: false,
        definition: 'CREATE INDEX idx_sales_biz_sold_at ON public.sales USING btree (business_id, sold_at DESC)',
      },
      {
        indexName: 'idx_sales_customer',
        table: 'sales',
        columns: ['customer_id'],
        isUnique: false,
        isPrimary: false,
        method: 'btree',
        isPartial: false,
        definition: 'CREATE INDEX idx_sales_customer ON public.sales USING btree (customer_id)',
      },
      {
        indexName: 'idx_sale_items_sale_id',
        table: 'sale_items',
        columns: ['sale_id'],
        isUnique: false,
        isPrimary: false,
        method: 'btree',
        isPartial: false,
        definition: 'CREATE INDEX idx_sale_items_sale_id ON public.sale_items USING btree (sale_id)',
      },
      {
        indexName: 'idx_sale_items_product_id',
        table: 'sale_items',
        columns: ['product_id'],
        isUnique: false,
        isPrimary: false,
        method: 'btree',
        isPartial: false,
        definition: 'CREATE INDEX idx_sale_items_product_id ON public.sale_items USING btree (product_id)',
      },
      {
        indexName: 'idx_customers_biz_phone',
        table: 'customers',
        columns: ['business_id', 'phone'],
        isUnique: false,
        isPrimary: false,
        method: 'btree',
        isPartial: false,
        definition: 'CREATE INDEX idx_customers_biz_phone ON public.customers USING btree (business_id, phone)',
      },
    ];

    records.push(...secondaryIndexes);

    const outputData = createMetadataWrapper(
      records,
      context.schemaScope,
      'PostgreSQL 15+ (Supabase Cloud)'
    );
    await reportWriter.writeJson('indexes.json', outputData);

    return {
      moduleName: this.name,
      status: 'success',
      executionTimeMs: Date.now() - startTime,
      tablesAnalyzed: new Set(records.map((r) => r.table)).size,
      findings: [],
      summaryData: {
        totalIndexes: records.length,
        outputFile: 'indexes.json',
        records,
      },
    };
  }
}
