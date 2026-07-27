/**
 * WYN Engineering Validation Engine - Rollback Validator
 * Validates rollback plan coverage, unsafe operations, and irreversible step callouts.
 */

import { ValidationResult, ValidationFinding } from '../types';

export class RollbackValidator {
  public validate(migrationPlan: any, rollbackPlanData: any): ValidationResult {
    const findings: ValidationFinding[] = [];
    let score = 100;

    const rollbackPlan = migrationPlan?.rollbackPlan || rollbackPlanData || {};
    const stageRollbacks: any[] = rollbackPlan.stageRollbacks || [];
    const overallStrategy = rollbackPlan.overallStrategy || 'SAFE';

    // 1. Check for missing stage rollback definitions
    if (stageRollbacks.length === 0) {
      score -= 30;
      findings.push({
        id: `ROL-STAGE-EMPTY`,
        category: 'ROLLBACK',
        severity: 'CRITICAL',
        title: `Missing Stage Rollback Plans`,
        description: `Rollback plan contains no stage-by-stage rollback definitions.`,
        recommendation: `Populate rollback strategies and reverse SQL steps for all migration stages.`,
      });
    }

    // 2. Check for stages missing explicit rollback steps
    stageRollbacks.forEach((sr: any) => {
      if (!sr.steps || sr.steps.length === 0) {
        score -= 5;
        findings.push({
          id: `ROL-STEPS-MISSING-${sr.stageId}`,
          category: 'ROLLBACK',
          severity: 'WARNING',
          title: `Empty Rollback Steps for ${sr.stageName}`,
          description: `Stage '${sr.stageName}' (${sr.stageId}) has no SQL rollback steps defined.`,
          recommendation: `Provide explicit reverse SQL statements (e.g., DROP TABLE, ALTER TABLE DROP COLUMN) for stage tasks.`,
        });
      }
    });

    // 3. Check for Irreversible or Manual Rollback Callouts
    if (overallStrategy === 'IRREVERSIBLE') {
      score -= 20;
      findings.push({
        id: `ROL-IRREVERSIBLE-OVERALL`,
        category: 'ROLLBACK',
        severity: 'WARNING',
        title: `Overall Migration Contains Irreversible Rollback Steps`,
        description: `Migration includes irreversible operations (e.g., data drops or column replacements). Database restore is required for rollback.`,
        recommendation: `Ensure automated point-in-time snapshot backup is completed before executing Stage 1.`,
      });
    } else if (overallStrategy === 'MANUAL') {
      findings.push({
        id: `ROL-MANUAL-OVERALL`,
        category: 'ROLLBACK',
        severity: 'INFO',
        title: `Rollback Requires Manual Execution Steps`,
        description: `Some rollback actions (e.g. column type conversions) require manual inspection or custom reverse casting scripts.`,
        recommendation: `Verify manual SQL scripts in staging environment before applying DDL modifications to production.`,
      });
    }

    score = Math.max(0, score);
    const status = score === 100 ? 'PASSED' : findings.some((f) => f.severity === 'CRITICAL') ? 'FAILED' : 'WARNING';

    return {
      category: 'Rollback Validation',
      status,
      score,
      findings,
    };
  }
}
