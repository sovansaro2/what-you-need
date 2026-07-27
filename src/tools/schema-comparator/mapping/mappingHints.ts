/**
 * WYN Intelligent Mapping Engine - Migration Hints Generator
 * Produces actionable migration hints for renames, ledger evolutions, numeric mappings, and type casts.
 */

import { TableMapping, ColumnMapping, MigrationHint } from '../types';

export class MigrationHintsGenerator {
  public generateHints(
    tableMappings: TableMapping[],
    columnMappings: ColumnMapping[]
  ): MigrationHint[] {
    const hints: MigrationHint[] = [];

    // 1. Table Rename Hints
    tableMappings.forEach((tm) => {
      if (tm.matchType === 'RENAME_CANDIDATE' && tm.currentTable) {
        if (tm.currentTable === 'categories' && tm.targetTable === 'product_categories') {
          hints.push({
            sourceEntity: tm.currentTable,
            targetEntity: tm.targetTable,
            hintType: 'RENAME',
            hint: 'Likely rename from legacy category table.',
            recommendation: 'Preserve primary key IDs and update foreign key references.',
          });
        } else if (tm.currentTable.includes('transaction') && tm.targetTable.includes('movement')) {
          hints.push({
            sourceEntity: tm.currentTable,
            targetEntity: tm.targetTable,
            hintType: 'LEDGER_EVOLUTION',
            hint: 'Likely ledger evolution from legacy transactions to immutable stock movements.',
            recommendation: 'Transform movement types and calculate running balance ledger.',
          });
        } else {
          hints.push({
            sourceEntity: tm.currentTable,
            targetEntity: tm.targetTable,
            hintType: 'RENAME',
            hint: `Candidate table rename with ${tm.confidenceScore}% confidence (${tm.reason}).`,
            recommendation: 'Rename table safely using ALTER TABLE RENAME TO prior to applying column changes.',
          });
        }
      }
    });

    // 2. Column Hints
    columnMappings.forEach((cm) => {
      if (cm.matchType === 'RENAME_CANDIDATE' && cm.currentColumn) {
        hints.push({
          sourceEntity: `${cm.table}.${cm.currentColumn}`,
          targetEntity: `${cm.table}.${cm.targetColumn}`,
          hintType: 'RENAME',
          hint: `Candidate column rename in '${cm.table}' from '${cm.currentColumn}' to '${cm.targetColumn}'.`,
          recommendation: 'Rename column using ALTER TABLE RENAME COLUMN to avoid data loss.',
        });
      } else if (cm.matchType === 'TYPE_COMPATIBLE' && cm.currentColumn) {
        hints.push({
          sourceEntity: `${cm.table}.${cm.currentColumn}`,
          targetEntity: `${cm.table}.${cm.targetColumn}`,
          hintType: 'TYPE_CAST',
          hint: `Data type modification for '${cm.table}.${cm.targetColumn}'.`,
          recommendation: 'Verify explicit type casting expressions (USING clause) during column type alteration.',
        });
      }

      if (cm.currentColumn === 'stock_quantity' && cm.targetColumn === 'current_stock') {
        hints.push({
          sourceEntity: `${cm.table}.stock_quantity`,
          targetEntity: `${cm.table}.current_stock`,
          hintType: 'DIRECT_NUMERIC',
          hint: 'Direct numeric inventory quantity mapping.',
          recommendation: 'Transfer numeric stock totals directly and re-verify non-negative constraints.',
        });
      }
    });

    return hints;
  }
}
