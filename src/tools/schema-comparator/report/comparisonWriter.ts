/**
 * WYN Schema Comparator Engine - Comparison Writer
 * Saves comparison JSON artifacts and Markdown report into the designated reports directory.
 */

import fs from 'fs';
import path from 'path';
import { SchemaComparison } from '../types';
import { DifferenceReportGenerator } from './differenceReport';

export class ComparisonWriter {
  private reportGenerator: DifferenceReportGenerator;

  constructor() {
    this.reportGenerator = new DifferenceReportGenerator();
  }

  public writeArtifacts(comparison: SchemaComparison, outputDir?: string): {
    jsonPath: string;
    reportPath: string;
    healthPath: string;
  } {
    const targetDir = outputDir || path.resolve(process.cwd(), 'reports/schema-comparator');

    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    const jsonPath = path.join(targetDir, 'schema_comparison.json');
    const reportPath = path.join(targetDir, 'difference_report.md');
    const healthPath = path.join(targetDir, 'database_health.json');

    // 1. Write schema_comparison.json
    fs.writeFileSync(jsonPath, JSON.stringify(comparison, null, 2), 'utf-8');

    // 2. Write difference_report.md
    const markdownContent = this.reportGenerator.generateMarkdown(comparison);
    fs.writeFileSync(reportPath, markdownContent, 'utf-8');

    // 3. Write database_health.json
    fs.writeFileSync(healthPath, JSON.stringify(comparison.health, null, 2), 'utf-8');

    return {
      jsonPath,
      reportPath,
      healthPath,
    };
  }
}
