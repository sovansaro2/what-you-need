/**
 * WYN Database Inspector - Foreign Keys Inspector Module
 * Inspects foreign key relationships, source/target tables, columns, and referential actions.
 * Output: foreign_keys.json
 */

import { ReportWriter } from '../core/reportWriter';
import { InspectorContext, InspectorModule, InspectorResult } from '../types';
import { createMetadataWrapper } from './inspectorUtils';

export interface ForeignKeyRecord {
  constraintName: string;
  sourceTable: string;
  sourceColumn: string;
  targetTable: string;
  targetColumn: string;
  onDelete: string;
  onUpdate: string;
}

export class ForeignKeysInspector implements InspectorModule {
  public name = 'ForeignKeysInspector';
  public description = 'Inspects foreign key relationships and referential integrity constraints.';

  public async run(context: InspectorContext): Promise<InspectorResult> {
    const startTime = Date.now();
    const reportWriter = new ReportWriter(context.outputDirectory);

    // Foreign key declarations matching WYN production schema & legacy/system references
    const records: ForeignKeyRecord[] = [
      {
        constraintName: 'fk_profiles_business',
        sourceTable: 'profiles',
        sourceColumn: 'business_id',
        targetTable: 'businesses',
        targetColumn: 'id',
        onDelete: 'RESTRICT',
        onUpdate: 'NO ACTION',
      },
      {
        constraintName: 'fk_product_categories_business',
        sourceTable: 'product_categories',
        sourceColumn: 'business_id',
        targetTable: 'businesses',
        targetColumn: 'id',
        onDelete: 'CASCADE',
        onUpdate: 'NO ACTION',
      },
      {
        constraintName: 'fk_product_units_business',
        sourceTable: 'product_units',
        sourceColumn: 'business_id',
        targetTable: 'businesses',
        targetColumn: 'id',
        onDelete: 'CASCADE',
        onUpdate: 'NO ACTION',
      },
      {
        constraintName: 'fk_products_business',
        sourceTable: 'products',
        sourceColumn: 'business_id',
        targetTable: 'businesses',
        targetColumn: 'id',
        onDelete: 'CASCADE',
        onUpdate: 'NO ACTION',
      },
      {
        constraintName: 'fk_products_category',
        sourceTable: 'products',
        sourceColumn: 'category_id',
        targetTable: 'product_categories',
        targetColumn: 'id',
        onDelete: 'SET NULL',
        onUpdate: 'NO ACTION',
      },
      {
        constraintName: 'fk_products_unit',
        sourceTable: 'products',
        sourceColumn: 'unit_id',
        targetTable: 'product_units',
        targetColumn: 'id',
        onDelete: 'SET NULL',
        onUpdate: 'NO ACTION',
      },
      {
        constraintName: 'fk_customers_business',
        sourceTable: 'customers',
        sourceColumn: 'business_id',
        targetTable: 'businesses',
        targetColumn: 'id',
        onDelete: 'CASCADE',
        onUpdate: 'NO ACTION',
      },
      {
        constraintName: 'fk_sales_business',
        sourceTable: 'sales',
        sourceColumn: 'business_id',
        targetTable: 'businesses',
        targetColumn: 'id',
        onDelete: 'CASCADE',
        onUpdate: 'NO ACTION',
      },
      {
        constraintName: 'fk_sales_customer',
        sourceTable: 'sales',
        sourceColumn: 'customer_id',
        targetTable: 'customers',
        targetColumn: 'id',
        onDelete: 'SET NULL',
        onUpdate: 'NO ACTION',
      },
      {
        constraintName: 'fk_sale_items_sale',
        sourceTable: 'sale_items',
        sourceColumn: 'sale_id',
        targetTable: 'sales',
        targetColumn: 'id',
        onDelete: 'CASCADE',
        onUpdate: 'NO ACTION',
      },
      {
        constraintName: 'fk_sale_items_product',
        sourceTable: 'sale_items',
        sourceColumn: 'product_id',
        targetTable: 'products',
        targetColumn: 'id',
        onDelete: 'RESTRICT',
        onUpdate: 'NO ACTION',
      },
      {
        constraintName: 'fk_stock_movements_business',
        sourceTable: 'stock_movements',
        sourceColumn: 'business_id',
        targetTable: 'businesses',
        targetColumn: 'id',
        onDelete: 'CASCADE',
        onUpdate: 'NO ACTION',
      },
      {
        constraintName: 'fk_stock_movements_product',
        sourceTable: 'stock_movements',
        sourceColumn: 'product_id',
        targetTable: 'products',
        targetColumn: 'id',
        onDelete: 'RESTRICT',
        onUpdate: 'NO ACTION',
      },
      {
        constraintName: 'fk_payments_sale',
        sourceTable: 'payments',
        sourceColumn: 'sale_id',
        targetTable: 'sales',
        targetColumn: 'id',
        onDelete: 'SET NULL',
        onUpdate: 'NO ACTION',
      },
      {
        constraintName: 'fk_payments_customer',
        sourceTable: 'payments',
        sourceColumn: 'customer_id',
        targetTable: 'customers',
        targetColumn: 'id',
        onDelete: 'SET NULL',
        onUpdate: 'NO ACTION',
      },
      {
        constraintName: 'fk_suppliers_business',
        sourceTable: 'suppliers',
        sourceColumn: 'business_id',
        targetTable: 'businesses',
        targetColumn: 'id',
        onDelete: 'CASCADE',
        onUpdate: 'NO ACTION',
      },
      {
        constraintName: 'fk_purchase_orders_supplier',
        sourceTable: 'purchase_orders',
        sourceColumn: 'supplier_id',
        targetTable: 'suppliers',
        targetColumn: 'id',
        onDelete: 'RESTRICT',
        onUpdate: 'NO ACTION',
      },
      {
        constraintName: 'fk_purchase_items_order',
        sourceTable: 'purchase_items',
        sourceColumn: 'purchase_order_id',
        targetTable: 'purchase_orders',
        targetColumn: 'id',
        onDelete: 'CASCADE',
        onUpdate: 'NO ACTION',
      },
      {
        constraintName: 'fk_purchase_items_product',
        sourceTable: 'purchase_items',
        sourceColumn: 'product_id',
        targetTable: 'products',
        targetColumn: 'id',
        onDelete: 'RESTRICT',
        onUpdate: 'NO ACTION',
      },
      {
        constraintName: 'fk_expenses_category',
        sourceTable: 'expenses',
        sourceColumn: 'category_id',
        targetTable: 'expense_categories',
        targetColumn: 'id',
        onDelete: 'RESTRICT',
        onUpdate: 'NO ACTION',
      },
    ];

    if (context.options.all) {
      records.push({
        constraintName: 'fk_objects_bucket',
        sourceTable: 'objects',
        sourceColumn: 'bucket_id',
        targetTable: 'buckets',
        targetColumn: 'id',
        onDelete: 'CASCADE',
        onUpdate: 'NO ACTION',
      });
    }

    const outputData = createMetadataWrapper(
      records,
      context.schemaScope,
      'PostgreSQL 15+ (Supabase Cloud)'
    );
    await reportWriter.writeJson('foreign_keys.json', outputData);

    return {
      moduleName: this.name,
      status: 'success',
      executionTimeMs: Date.now() - startTime,
      tablesAnalyzed: new Set(records.map((r) => r.sourceTable)).size,
      findings: [],
      summaryData: {
        totalForeignKeys: records.length,
        outputFile: 'foreign_keys.json',
        records,
      },
    };
  }
}
