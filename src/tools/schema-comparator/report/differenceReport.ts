/**
 * WYN Schema Comparator Engine - Difference Report Generator
 * Generates an executive Markdown report detailing schema comparisons, differences, health scores, and engineering recommendations.
 */

import { SchemaComparison } from '../types';

export class DifferenceReportGenerator {
  public generateMarkdown(comparison: SchemaComparison): string {
    const { summary, health, tableComparison, columnDifferences, pkDifferences, fkDifferences, constraintDifferences, indexDifferences } = comparison;

    const lines: string[] = [];

    lines.push(`# WYN Database Schema Comparison Report`);
    lines.push(`**Target Schema:** \`${comparison.targetFile}\` | **Schema Hash:** \`${comparison.schemaHash}\` | **Generated:** \`${comparison.timestamp}\``);
    lines.push(``);
    lines.push(`---`);
    lines.push(``);

    // 1. Executive Summary & Health
    lines.push(`## 1. Executive Summary`);
    lines.push(``);
    lines.push(`| Metric | Value | Status |`);
    lines.push(`| :--- | :---: | :---: |`);
    lines.push(`| **Overall Database Health** | **${health.overallScore} / 100** | **${this.getHealthBadge(health.overallScore)}** |`);
    lines.push(`| **Schema Match Rate** | **${summary.schemaMatchPercentage}%** | ${summary.schemaMatchPercentage >= 95 ? '✅ PASS' : '⚠️ ATTENTION'} |`);
    lines.push(`| **Total Differences** | **${summary.totalDifferences}** | ${summary.totalDifferences === 0 ? '✅ IN SYNC' : '🚨 DRIFT DETECTED'} |`);
    lines.push(`| **Missing Tables** | ${summary.missingTablesCount} | ${summary.missingTablesCount === 0 ? '✅' : '🔴'} |`);
    lines.push(`| **Column Differences** | ${summary.columnDifferencesCount} | ${summary.columnDifferencesCount === 0 ? '✅' : '🟡'} |`);
    lines.push(`| **FK Differences** | ${summary.fkDifferencesCount} | ${summary.fkDifferencesCount === 0 ? '✅' : '🟡'} |`);
    lines.push(`| **Constraint Differences** | ${summary.constraintDifferencesCount} | ${summary.constraintDifferencesCount === 0 ? '✅' : '🟡'} |`);
    lines.push(`| **Index Differences** | ${summary.indexDifferencesCount} | ${summary.indexDifferencesCount === 0 ? '✅' : '🟡'} |`);
    lines.push(``);

    // 2. Health Breakdown
    lines.push(`## 2. Health Breakdown`);
    lines.push(``);
    lines.push(`| Dimension | Score | Status | Findings | Key Details |`);
    lines.push(`| :--- | :---: | :---: | :---: | :--- |`);
    lines.push(`| **Completeness** | ${health.completeness.score}/100 | ${health.completeness.status} | ${health.completeness.findingsCount} | ${health.completeness.details[0] || 'N/A'} |`);
    lines.push(`| **Integrity** | ${health.integrity.score}/100 | ${health.integrity.status} | ${health.integrity.findingsCount} | ${health.integrity.details[0] || 'N/A'} |`);
    lines.push(`| **Performance** | ${health.performance.score}/100 | ${health.performance.status} | ${health.performance.findingsCount} | ${health.performance.details[0] || 'N/A'} |`);
    lines.push(`| **Security** | ${health.security.score}/100 | ${health.security.status} | ${health.security.findingsCount} | ${health.security.details[0] || 'N/A'} |`);
    lines.push(`| **Maintainability** | ${health.maintainability.score}/100 | ${health.maintainability.status} | ${health.maintainability.findingsCount} | ${health.maintainability.details[0] || 'N/A'} |`);
    lines.push(``);

    // 3. Table Level Comparison
    lines.push(`## 3. Table Level Comparison`);
    lines.push(``);
    if (tableComparison.missingTables.length > 0) {
      lines.push(`### 🔴 Missing Tables (${tableComparison.missingTables.length})`);
      lines.push(`The following target tables are absent in the current database:`);
      tableComparison.missingTables.forEach((t) => lines.push(`- \`${t}\``));
      lines.push(``);
    } else {
      lines.push(`- ✅ All target tables exist in the current database.`);
      lines.push(``);
    }

    if (tableComparison.extraTables.length > 0) {
      lines.push(`### ℹ️ Extra Tables in Current Database (${tableComparison.extraTables.length})`);
      lines.push(`The following tables exist in current database but are not defined in target DDL:`);
      tableComparison.extraTables.forEach((t) => lines.push(`- \`${t}\``));
      lines.push(``);
    }

    if (tableComparison.renamedCandidates.length > 0) {
      lines.push(`### 💡 Candidate Renamed Tables (${tableComparison.renamedCandidates.length})`);
      tableComparison.renamedCandidates.forEach((c) => {
        lines.push(`- \`${c.currentName}\` -> \`${c.targetName}\` (Confidence: **${c.confidenceScore}%**, ${c.reason})`);
      });
      lines.push(``);
    }

    // 4. Column Differences
    lines.push(`## 4. Column Differences`);
    lines.push(``);
    if (columnDifferences.length > 0) {
      lines.push(`| Table | Column | Issue Type | Current | Target | Description |`);
      lines.push(`| :--- | :--- | :---: | :--- | :--- | :--- |`);
      columnDifferences.forEach((cd) => {
        lines.push(`| \`${cd.table}\` | \`${cd.column}\` | \`${cd.diffType}\` | ${cd.current ? `\`${cd.current}\`` : '—'} | ${cd.target ? `\`${cd.target}\`` : '—'} | ${cd.description} |`);
      });
      lines.push(``);
    } else {
      lines.push(`- ✅ No column differences detected.`);
      lines.push(``);
    }

    // 5. Primary & Foreign Keys
    lines.push(`## 5. Primary & Foreign Key Differences`);
    lines.push(``);
    if (pkDifferences.length > 0) {
      lines.push(`### Primary Keys`);
      pkDifferences.forEach((pkd) => lines.push(`- **${pkd.table}**: ${pkd.description}`));
      lines.push(``);
    }
    if (fkDifferences.length > 0) {
      lines.push(`### Foreign Keys`);
      fkDifferences.forEach((fkd) => lines.push(`- **${fkd.table}** (\`${fkd.sourceColumn}\` -> \`${fkd.targetTable}\`): ${fkd.description}`));
      lines.push(``);
    }
    if (pkDifferences.length === 0 && fkDifferences.length === 0) {
      lines.push(`- ✅ All Primary and Foreign Keys match the target specification.`);
      lines.push(``);
    }

    // 6. Constraints & Indexes
    lines.push(`## 6. Constraints & Index Differences`);
    lines.push(``);
    if (constraintDifferences.length > 0) {
      lines.push(`### Constraints`);
      constraintDifferences.forEach((cd) => lines.push(`- **${cd.table}** [\`${cd.constraintName || 'unnamed'}\`]: ${cd.description}`));
      lines.push(``);
    }
    if (indexDifferences.length > 0) {
      lines.push(`### Indexes`);
      indexDifferences.forEach((id) => lines.push(`- **${id.table}** [\`${id.indexName}\`]: ${id.description}`));
      lines.push(``);
    }
    if (constraintDifferences.length === 0 && indexDifferences.length === 0) {
      lines.push(`- ✅ All CHECK/UNIQUE constraints and performance indexes are in sync.`);
      lines.push(``);
    }

    // 7. Engineering Recommendations
    lines.push(`## 7. Engineering Recommendations`);
    lines.push(``);
    const recs = this.generateRecommendations(comparison);
    recs.forEach((r) => lines.push(r));
    lines.push(``);

    return lines.join('\n');
  }

  private getHealthBadge(score: number): string {
    if (score >= 90) return '🟢 EXCELLENT';
    if (score >= 75) return '🔵 GOOD';
    if (score >= 60) return '🟡 WARNING';
    return '🔴 CRITICAL';
  }

  private generateRecommendations(comparison: SchemaComparison): string[] {
    const recs: string[] = [];
    const { summary, health, tableComparison, columnDifferences, fkDifferences } = comparison;

    if (summary.totalDifferences === 0) {
      recs.push(`1. **Schema Fully In Sync:** Current database match rate is 100%. No DDL adjustments are needed.`);
      return recs;
    }

    let priority = 1;

    if (tableComparison.missingTables.length > 0) {
      recs.push(`${priority++}. **[HIGH] Provision Missing Tables:** Create missing tables (${tableComparison.missingTables.map((t) => `\`${t}\``).join(', ')}) to establish complete core schema structures.`);
    }

    if (columnDifferences.some((c) => c.diffType === 'MISSING')) {
      const missingColsCount = columnDifferences.filter((c) => c.diffType === 'MISSING').length;
      recs.push(`${priority++}. **[HIGH] Add Missing Columns:** Add ${missingColsCount} missing columns across existing tables to support full application capabilities.`);
    }

    if (fkDifferences.some((f) => f.diffType === 'MISSING_FK')) {
      recs.push(`${priority++}. **[MEDIUM] Restore Missing Foreign Keys:** Ensure referential integrity constraints are properly declared across tenant models.`);
    }

    if (health.performance.score < 90) {
      recs.push(`${priority++}. **[MEDIUM] Build Search & Foreign Key Indexes:** Create missing search and btree indexes to ensure query performance and prevent full-table scans.`);
    }

    if (tableComparison.extraTables.length > 0) {
      recs.push(`${priority++}. **[LOW] Audit Unreferenced Tables:** Review ${tableComparison.extraTables.length} extra database tables not part of the standard v1 specification.`);
    }

    return recs;
  }
}
