/**
 * WYN Intelligent Mapping Engine - Main Engine
 * Orchestrates table, column, relationship mapping, risk evaluation, confidence analysis, and report writing.
 */

import fs from 'fs';
import path from 'path';
import {
  ParsedSchema,
  InspectorTableRecord,
  InspectorColumnRecord,
  InspectorFKRecord,
  TableComparisonResult,
  ColumnDifference,
  MappingReport,
} from '../types';
import { TableMapper } from './tableMapping';
import { ColumnMapper } from './columnMapping';
import { RelationshipMapper } from './relationshipMapping';
import { ConfidenceCalculator } from './confidenceCalculator';
import { MigrationHintsGenerator } from './mappingHints';

export class MappingEngine {
  private tableMapper = new TableMapper();
  private columnMapper = new ColumnMapper();
  private relationshipMapper = new RelationshipMapper();
  private hintsGenerator = new MigrationHintsGenerator();

  public generateMappingReport(
    targetSchema: ParsedSchema,
    inspectorTables: InspectorTableRecord[],
    inspectorColumns: InspectorColumnRecord[],
    inspectorFKs: InspectorFKRecord[],
    tableComparison: TableComparisonResult,
    columnDiffs: ColumnDifference[],
    schemaHash: string
  ): MappingReport {
    const tableMappings = this.tableMapper.mapTables(targetSchema, inspectorTables, tableComparison);
    const columnMappings = this.columnMapper.mapColumns(targetSchema, inspectorColumns, columnDiffs);
    const relationshipMappings = this.relationshipMapper.mapRelationships(targetSchema, inspectorFKs);
    const migrationHints = this.hintsGenerator.generateHints(tableMappings, columnMappings);

    const renameCandidates = tableComparison.renamedCandidates;

    // Confidence matrix
    const allConfidenceScores = [
      ...tableMappings.map((t) => t.confidenceScore),
      ...columnMappings.map((c) => c.confidenceScore),
      ...relationshipMappings.map((r) => r.confidenceScore),
    ];
    const confidenceMatrix = ConfidenceCalculator.summarizeConfidence(allConfidenceScores);

    // Risk matrix
    let lowCount = 0;
    let mediumCount = 0;
    let highCount = 0;
    let criticalCount = 0;

    [
      ...tableMappings.map((t) => t.risk),
      ...columnMappings.map((c) => c.risk),
      ...relationshipMappings.map((r) => r.risk),
    ].forEach((risk) => {
      if (risk === 'LOW') lowCount++;
      else if (risk === 'MEDIUM') mediumCount++;
      else if (risk === 'HIGH') highCount++;
      else if (risk === 'CRITICAL') criticalCount++;
    });

    return {
      timestamp: new Date().toISOString(),
      schemaHash,
      tableMappings,
      columnMappings,
      relationshipMappings,
      renameCandidates,
      migrationHints,
      confidenceMatrix,
      riskMatrix: {
        lowCount,
        mediumCount,
        highCount,
        criticalCount,
      },
    };
  }

  public writeMappingArtifacts(report: MappingReport, outputDir: string) {
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // 1. mapping_report.json
    fs.writeFileSync(
      path.join(outputDir, 'mapping_report.json'),
      JSON.stringify(report, null, 2),
      'utf-8'
    );

    // 2. table_mappings.json
    fs.writeFileSync(
      path.join(outputDir, 'table_mappings.json'),
      JSON.stringify(report.tableMappings, null, 2),
      'utf-8'
    );

    // 3. column_mappings.json
    fs.writeFileSync(
      path.join(outputDir, 'column_mappings.json'),
      JSON.stringify(report.columnMappings, null, 2),
      'utf-8'
    );

    // 4. rename_candidates.json
    fs.writeFileSync(
      path.join(outputDir, 'rename_candidates.json'),
      JSON.stringify(report.renameCandidates, null, 2),
      'utf-8'
    );

    // 5. migration_hints.json
    fs.writeFileSync(
      path.join(outputDir, 'migration_hints.json'),
      JSON.stringify(report.migrationHints, null, 2),
      'utf-8'
    );

    // 6. mapping_report.md
    const mdContent = this.generateMarkdownReport(report);
    fs.writeFileSync(path.join(outputDir, 'mapping_report.md'), mdContent, 'utf-8');
  }

  private generateMarkdownReport(report: MappingReport): string {
    const lines: string[] = [];

    lines.push(`# WYN Schema Intelligent Mapping Report`);
    lines.push(`**Schema Hash:** \`${report.schemaHash}\` | **Generated:** \`${report.timestamp}\``);
    lines.push(``);
    lines.push(`---`);
    lines.push(``);

    // Executive Summary
    lines.push(`## 1. Executive Summary`);
    lines.push(``);
    lines.push(`| Dimension | Counts |`);
    lines.push(`| :--- | :---: |`);
    lines.push(`| **Table Mappings** | ${report.tableMappings.length} |`);
    lines.push(`| **Column Mappings** | ${report.columnMappings.length} |`);
    lines.push(`| **Relationship Mappings** | ${report.relationshipMappings.length} |`);
    lines.push(`| **Rename Candidates** | ${report.renameCandidates.length} |`);
    lines.push(`| **Migration Hints** | ${report.migrationHints.length} |`);
    lines.push(``);

    // Confidence & Risk Matrix
    lines.push(`## 2. Confidence & Risk Matrix`);
    lines.push(``);
    lines.push(`### Confidence Distribution`);
    lines.push(`- **Very High (95-100%)**: ${report.confidenceMatrix.veryHighCount}`);
    lines.push(`- **High (80-94%)**: ${report.confidenceMatrix.highCount}`);
    lines.push(`- **Medium (60-79%)**: ${report.confidenceMatrix.mediumCount}`);
    lines.push(`- **Low (<60%)**: ${report.confidenceMatrix.lowCount}`);
    lines.push(``);
    lines.push(`### Risk Distribution`);
    lines.push(`- **LOW**: ${report.riskMatrix.lowCount}`);
    lines.push(`- **MEDIUM**: ${report.riskMatrix.mediumCount}`);
    lines.push(`- **HIGH**: ${report.riskMatrix.highCount}`);
    lines.push(`- **CRITICAL**: ${report.riskMatrix.criticalCount}`);
    lines.push(``);

    // Table Mapping Section
    lines.push(`## 3. Table Mappings`);
    lines.push(``);
    lines.push(`| Current Table | Target Table | Match Type | Confidence | Risk | Reason |`);
    lines.push(`| :--- | :--- | :---: | :---: | :---: | :--- |`);
    report.tableMappings.forEach((tm) => {
      lines.push(
        `| ${tm.currentTable ? `\`${tm.currentTable}\`` : '—'} | \`${tm.targetTable}\` | \`${tm.matchType}\` | ${tm.confidenceScore}% (${tm.confidenceLevel}) | \`${tm.risk}\` | ${tm.reason} |`
      );
    });
    lines.push(``);

    // Rename Candidates Section
    lines.push(`## 4. Candidate Table Renames`);
    lines.push(``);
    if (report.renameCandidates.length > 0) {
      report.renameCandidates.forEach((rc) => {
        lines.push(`- \`${rc.currentName}\` ➔ \`${rc.targetName}\` (Confidence: **${rc.confidenceScore}%**, ${rc.reason})`);
      });
    } else {
      lines.push(`- No candidate table renames identified.`);
    }
    lines.push(``);

    // Migration Hints Section
    lines.push(`## 5. Migration Hints`);
    lines.push(``);
    if (report.migrationHints.length > 0) {
      report.migrationHints.forEach((mh) => {
        lines.push(`- **[${mh.hintType}]** \`${mh.sourceEntity}\` ➔ \`${mh.targetEntity}\`: ${mh.hint} (*${mh.recommendation}*)`);
      });
    } else {
      lines.push(`- No migration hints required.`);
    }
    lines.push(``);

    return lines.join('\n');
  }
}
