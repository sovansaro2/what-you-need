/**
 * WYN Migration Planning Engine - Stage Planner
 * Categorizes database entities into 6 structured migration stages.
 */

import { ParsedSchema, MigrationStage, DependencyAnalysis } from '../types';

export class StagePlanner {
  public planStages(
    targetSchema: ParsedSchema,
    dependencies: DependencyAnalysis
  ): MigrationStage[] {
    const stage1Tables: string[] = []; // Foundation
    const stage2Tables: string[] = []; // Lookup
    const stage3Tables: string[] = []; // Core Inventory & Entities
    const stage4Tables: string[] = []; // Ledger & Transactions
    const stage5Tables: string[] = []; // Finance & Summaries

    dependencies.creationOrder.forEach((tableName) => {
      const name = tableName.toLowerCase();

      if (
        name.includes('category') ||
        name.includes('unit') ||
        name.includes('type') ||
        name.includes('status') ||
        name.includes('lookup') ||
        name.includes('tag') ||
        name.includes('setting')
      ) {
        stage2Tables.push(tableName);
      } else if (
        name.includes('product') ||
        name.includes('customer') ||
        name.includes('vendor') ||
        name.includes('supplier') ||
        name.includes('item') ||
        name.includes('user') ||
        name.includes('profile') ||
        name.includes('store') ||
        name.includes('warehouse')
      ) {
        stage3Tables.push(tableName);
      } else if (
        name.includes('movement') ||
        name.includes('transaction') ||
        name.includes('sale') ||
        name.includes('order') ||
        name.includes('payment') ||
        name.includes('receipt') ||
        name.includes('invoice') ||
        name.includes('ledger')
      ) {
        stage4Tables.push(tableName);
      } else if (
        name.includes('expense') ||
        name.includes('summary') ||
        name.includes('daily') ||
        name.includes('tax') ||
        name.includes('report') ||
        name.includes('analytic') ||
        name.includes('audit')
      ) {
        stage5Tables.push(tableName);
      } else {
        // Default based on dependency count: if no dependencies, stage 1 or 2, else stage 3
        const deps = dependencies.dependencyGraph[tableName]?.dependsOn || [];
        if (deps.length === 0) {
          stage1Tables.push(tableName);
        } else {
          stage3Tables.push(tableName);
        }
      }
    });

    const stages: MigrationStage[] = [
      {
        stageNumber: 1,
        stageId: 'STAGE_1_FOUNDATION',
        name: 'Foundation & Schemas',
        description: 'PostgreSQL extensions, schemas, base system settings, and core foundation tables.',
        tables: stage1Tables,
        taskCount: 0,
        estimatedDuration: '2s',
        risk: 'LOW',
      },
      {
        stageNumber: 2,
        stageId: 'STAGE_2_LOOKUPS',
        name: 'Lookup & Reference Tables',
        description: 'Product categories, units of measure, statuses, and reference domain models.',
        tables: stage2Tables,
        taskCount: 0,
        estimatedDuration: '3s',
        risk: 'LOW',
      },
      {
        stageNumber: 3,
        stageId: 'STAGE_3_CORE_INVENTORY',
        name: 'Core Entities & Inventory',
        description: 'Products, customers, suppliers, stores, and primary business entity tables.',
        tables: stage3Tables,
        taskCount: 0,
        estimatedDuration: '5s',
        risk: 'MEDIUM',
      },
      {
        stageNumber: 4,
        stageId: 'STAGE_4_LEDGER',
        name: 'Ledger & Transactions',
        description: 'Stock movements, sales orders, line items, payments, and transaction ledgers.',
        tables: stage4Tables,
        taskCount: 0,
        estimatedDuration: '8s',
        risk: 'HIGH',
      },
      {
        stageNumber: 5,
        stageId: 'STAGE_5_FINANCE',
        name: 'Finance & Analytics',
        description: 'Expenses, daily financial summaries, audit logs, and reporting structures.',
        tables: stage5Tables,
        taskCount: 0,
        estimatedDuration: '4s',
        risk: 'MEDIUM',
      },
      {
        stageNumber: 6,
        stageId: 'STAGE_6_CONSTRAINTS_INDEXES',
        name: 'Constraints & Indexes',
        description: 'Foreign key referential integrity constraints, unique/check constraints, and performance btree indexes.',
        tables: [],
        taskCount: 0,
        estimatedDuration: '6s',
        risk: 'MEDIUM',
      },
    ];

    return stages;
  }
}
