/**
 * WYN Engineering Validation Engine - Risk Validator
 * Validates risk classifications, critical/high risks, and completeness of mitigation strategies.
 */

import { ValidationResult, ValidationFinding } from '../types';

export class RiskValidator {
  public validate(migrationPlan: any, risksData: any): ValidationResult {
    const findings: ValidationFinding[] = [];
    let score = 100;

    const risks = migrationPlan?.risks || risksData || {};
    const risksByCategory: any[] = risks.risksByCategory || [];
    const overallRisk = risks.overallRiskLevel || 'LOW';

    // 1. Check for missing risk mitigations across mandatory categories
    const mandatoryCategories = [
      'DATA_LOSS',
      'CONSTRAINT_FAILURE',
      'PERFORMANCE',
      'LOCKING',
      'APPLICATION_COMPATIBILITY',
    ];

    const presentCategories = new Set(risksByCategory.map((r: any) => r.category));

    mandatoryCategories.forEach((cat) => {
      if (!presentCategories.has(cat)) {
        score -= 10;
        findings.push({
          id: `RISK-CAT-MISSING-${cat}`,
          category: 'RISK',
          severity: 'WARNING',
          title: `Missing Risk Assessment Category '${cat}'`,
          description: `Mandatory risk assessment category '${cat}' is missing from the risk matrix.`,
          recommendation: `Include an explicit risk assessment item for category '${cat}'.`,
        });
      }
    });

    // 2. Check for Critical/High risks and verify presence of actionable mitigations
    risksByCategory.forEach((riskItem: any, idx: number) => {
      if (!riskItem.mitigation || riskItem.mitigation.trim().length === 0) {
        score -= 15;
        findings.push({
          id: `RISK-MITIGATION-MISSING-${idx + 1}`,
          category: 'RISK',
          severity: 'CRITICAL',
          title: `Missing Risk Mitigation for ${riskItem.title}`,
          description: `Risk '${riskItem.title}' [${riskItem.riskLevel}] has no mitigation strategy defined.`,
          recommendation: `Define explicit mitigation instructions for '${riskItem.title}'.`,
        });
      }

      if (riskItem.riskLevel === 'CRITICAL') {
        score -= 10;
        findings.push({
          id: `RISK-CRITICAL-${idx + 1}`,
          category: 'RISK',
          severity: 'WARNING',
          title: `Critical Risk Highlighted: ${riskItem.title}`,
          description: `${riskItem.description} (Mitigation: ${riskItem.mitigation})`,
          recommendation: `Ensure critical risk mitigation steps are reviewed and pre-approved by database team.`,
        });
      } else if (riskItem.riskLevel === 'HIGH') {
        findings.push({
          id: `RISK-HIGH-${idx + 1}`,
          category: 'RISK',
          severity: 'INFO',
          title: `High Risk Highlighted: ${riskItem.title}`,
          description: `${riskItem.description}`,
          recommendation: `Apply lock_timeout and session safeguards during DDL execution.`,
        });
      }
    });

    score = Math.max(0, score);
    const status = score === 100 ? 'PASSED' : findings.some((f) => f.severity === 'CRITICAL') ? 'FAILED' : 'WARNING';

    return {
      category: 'Risk Validation',
      status,
      score,
      findings,
    };
  }
}
