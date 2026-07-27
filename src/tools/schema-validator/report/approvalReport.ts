/**
 * WYN Engineering Validation Engine - Approval Report Generator
 * Generates the executive approval report markdown document.
 */

import { EngineeringValidation } from '../types';

export class ApprovalReportGenerator {
  public generateApprovalMarkdown(validation: EngineeringValidation): string {
    const lines: string[] = [];
    const summary = validation.summary;

    lines.push(`# WYN Database Engineering Validation & Approval Report`);
    lines.push(
      `**Target DDL File:** \`${validation.targetFile}\` | **Schema Hash:** \`${validation.schemaHash}\` | **Timestamp:** \`${validation.timestamp}\``
    );
    lines.push(``);
    lines.push(`---`);
    lines.push(``);

    // 1. Final Decision Banner
    lines.push(`## 1. Final Engineering Decision`);
    lines.push(``);
    if (validation.approvalDecision === 'APPROVED') {
      lines.push(`### Status: ✅ **APPROVED**`);
      lines.push(`*The schema structure, migration plan, dependencies, and risk mitigations pass all quality gates without blocking issues.*`);
    } else if (validation.approvalDecision === 'APPROVED WITH WARNINGS') {
      lines.push(`### Status: ⚠️ **APPROVED WITH WARNINGS**`);
      lines.push(`*The schema comparator and migration plan are approved for execution, provided highlighted warnings and mitigations are observed.*`);
    } else {
      lines.push(`### Status: ❌ **REJECTED**`);
      lines.push(`*Critical findings or structural defects were identified. Migration plan execution is blocked until resolved.*`);
    }
    lines.push(``);

    // 2. Executive Summary
    lines.push(`## 2. Executive Summary`);
    lines.push(``);
    lines.push(`| Metric | Value |`);
    lines.push(`| :--- | :---: |`);
    lines.push(`| **Final Engineering Status** | **\`${validation.approvalDecision}\`** |`);
    lines.push(`| **Overall Health Score** | **${summary.healthScore} / 100** (\`${summary.healthStatus}\`) |`);
    lines.push(`| **Total Validation Checks** | **${summary.totalChecks}** |`);
    lines.push(`| **Passed Checks** | **${summary.passedChecks}** |`);
    lines.push(`| **Warning Checks** | **${summary.warningChecks}** |`);
    lines.push(`| **Failed Checks** | **${summary.failedChecks}** |`);
    lines.push(`| **Critical Findings** | **${summary.criticalFindingsCount}** |`);
    lines.push(`| **Warnings** | **${summary.warningFindingsCount}** |`);
    lines.push(``);

    // 3. Validation Results by Category
    lines.push(`## 3. Validation Category Breakdown`);
    lines.push(``);
    lines.push(`| Category | Status | Score | Findings Count |`);
    lines.push(`| :--- | :---: | :---: | :---: |`);
    Object.values(validation.results).forEach((res) => {
      lines.push(`| **${res.category}** | \`${res.status}\` | ${res.score}/100 | ${res.findings.length} |`);
    });
    lines.push(``);

    // 4. Critical Findings
    lines.push(`## 4. Critical Findings (${validation.criticalFindings.length})`);
    lines.push(``);
    if (validation.criticalFindings.length > 0) {
      validation.criticalFindings.forEach((cf) => {
        lines.push(`### ❌ [${cf.id}] ${cf.title}`);
        lines.push(`${cf.description}`);
        if (cf.recommendation) {
          lines.push(`- **Action:** ${cf.recommendation}`);
        }
        lines.push(``);
      });
    } else {
      lines.push(`- Zero critical findings detected. All core validations passed cleanly.`);
      lines.push(``);
    }

    // 5. Warnings
    lines.push(`## 5. Warnings & Advisories (${validation.warnings.length})`);
    lines.push(``);
    if (validation.warnings.length > 0) {
      validation.warnings.forEach((w) => {
        lines.push(`- **[${w.id}] ${w.title}**: ${w.description}`);
        if (w.recommendation) {
          lines.push(`  *Mitigation:* ${w.recommendation}`);
        }
      });
      lines.push(``);
    } else {
      lines.push(`- Zero warnings reported.`);
      lines.push(``);
    }

    // 6. Recommendations
    lines.push(`## 6. Engineering Recommendations`);
    lines.push(``);
    validation.recommendations.forEach((rec) => lines.push(rec));
    lines.push(``);

    return lines.join('\n');
  }
}
