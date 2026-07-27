/**
 * WYN Engineering Validation Engine - Health Validator
 * Validates overall schema/database health score against minimum required threshold (80/100).
 */

import { ValidationResult, ValidationFinding } from '../types';

export class HealthValidator {
  public validate(healthData: any, schemaComparison: any): ValidationResult {
    const findings: ValidationFinding[] = [];

    const health = healthData || schemaComparison?.health || {};
    const overallScore = typeof health.overallScore === 'number' ? health.overallScore : (schemaComparison?.summary?.schemaMatchPercentage || 0);
    const MIN_THRESHOLD = 80;

    let score = overallScore;

    if (overallScore < MIN_THRESHOLD) {
      const severity = overallScore < 50 ? 'CRITICAL' : 'WARNING';
      findings.push({
        id: `HEALTH-LOW-SCORE`,
        category: 'HEALTH',
        severity,
        title: `Database Health Score Below Threshold (${overallScore}/100)`,
        description: `Database overall health score is ${overallScore}/100, which is below the minimum required engineering threshold of ${MIN_THRESHOLD}/100.`,
        recommendation: `Execute migration plan to bring current database schema into 100% alignment with target DDL specification.`,
      });
    } else {
      findings.push({
        id: `HEALTH-OK`,
        category: 'HEALTH',
        severity: 'INFO',
        title: `Database Health Meets Required Threshold`,
        description: `Overall health score is ${overallScore}/100 (Threshold: ${MIN_THRESHOLD}/100).`,
      });
    }

    const status = overallScore >= MIN_THRESHOLD ? 'PASSED' : overallScore < 50 ? 'FAILED' : 'WARNING';

    return {
      category: 'Health Validation',
      status,
      score: Math.min(100, Math.max(0, overallScore)),
      findings,
    };
  }
}
