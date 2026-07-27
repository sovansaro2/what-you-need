/**
 * WYN Engineering Validation Engine - Validation Writer
 * Writes all 4 output artifacts to reports/schema-validator/.
 */

import fs from 'fs';
import path from 'path';
import { EngineeringValidation } from '../types';
import { ApprovalReportGenerator } from './approvalReport';

export class ValidationWriter {
  private approvalReportGenerator = new ApprovalReportGenerator();

  public writeValidationArtifacts(
    validation: EngineeringValidation,
    outputDir: string
  ): {
    validationJsonPath: string;
    validationMdPath: string;
    summaryJsonPath: string;
    approvalMdPath: string;
  } {
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const validationJsonPath = path.join(outputDir, 'engineering_validation.json');
    const validationMdPath = path.join(outputDir, 'engineering_validation.md');
    const summaryJsonPath = path.join(outputDir, 'validation_summary.json');
    const approvalMdPath = path.join(outputDir, 'approval_report.md');

    // 1. engineering_validation.json
    fs.writeFileSync(validationJsonPath, JSON.stringify(validation, null, 2), 'utf-8');

    // 2. validation_summary.json
    fs.writeFileSync(summaryJsonPath, JSON.stringify(validation.summary, null, 2), 'utf-8');

    // 3. approval_report.md
    const approvalMdContent = this.approvalReportGenerator.generateApprovalMarkdown(validation);
    fs.writeFileSync(approvalMdPath, approvalMdContent, 'utf-8');

    // 4. engineering_validation.md
    const validationMdContent = this.generateEngineeringValidationMarkdown(validation);
    fs.writeFileSync(validationMdPath, validationMdContent, 'utf-8');

    return {
      validationJsonPath,
      validationMdPath,
      summaryJsonPath,
      approvalMdPath,
    };
  }

  private generateEngineeringValidationMarkdown(validation: EngineeringValidation): string {
    const lines: string[] = [];

    lines.push(`# WYN Engineering Validation Detailed Report`);
    lines.push(`**Generated:** \`${validation.timestamp}\` | **Target File:** \`${validation.targetFile}\``);
    lines.push(``);
    lines.push(`---`);
    lines.push(``);

    lines.push(`## Summary`);
    lines.push(`- **Decision:** \`${validation.approvalDecision}\``);
    lines.push(`- **Health Score:** ${validation.summary.healthScore}/100`);
    lines.push(`- **Passed Checks:** ${validation.summary.passedChecks} / ${validation.summary.totalChecks}`);
    lines.push(`- **Critical Findings:** ${validation.summary.criticalFindingsCount}`);
    lines.push(`- **Warnings:** ${validation.summary.warningFindingsCount}`);
    lines.push(``);

    lines.push(`## Validation Categories`);
    lines.push(``);

    Object.values(validation.results).forEach((res) => {
      lines.push(`### ${res.category} [${res.status}] (Score: ${res.score}/100)`);
      if (res.findings.length > 0) {
        res.findings.forEach((f) => {
          lines.push(`- **[${f.severity}] ${f.title}**: ${f.description}`);
          if (f.recommendation) {
            lines.push(`  *Recommendation:* ${f.recommendation}`);
          }
        });
      } else {
        lines.push(`- All category checks passed with zero findings.`);
      }
      lines.push(``);
    });

    lines.push(`## Recommendations`);
    lines.push(``);
    validation.recommendations.forEach((r) => lines.push(r));
    lines.push(``);

    return lines.join('\n');
  }
}
