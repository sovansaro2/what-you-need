/**
 * WYN Engineering Validation Engine - Recommendation Engine
 * Synthesizes findings across all validation areas into prioritized engineering recommendations.
 */

import { ValidationFinding } from '../types';

export class RecommendationEngine {
  public generateRecommendations(
    criticalFindings: ValidationFinding[],
    warnings: ValidationFinding[],
    results: Record<string, any>
  ): string[] {
    const recs: string[] = [];

    if (criticalFindings.length > 0) {
      recs.push(`1. [CRITICAL] Resolve ${criticalFindings.length} critical blocking findings before proceeding to SQL migration code generation.`);
      criticalFindings.forEach((cf, idx) => {
        if (cf.recommendation) {
          recs.push(`   - ${cf.title}: ${cf.recommendation}`);
        }
      });
    } else {
      recs.push(`1. [APPROVED] All critical pre-flight engineering checks passed. Schema is cleared for migration plan execution.`);
    }

    if (warnings.length > 0) {
      recs.push(`2. [WARNINGS] Address ${warnings.length} warning items during migration preparation:`);
      warnings.slice(0, 5).forEach((w) => {
        if (w.recommendation) {
          recs.push(`   - ${w.title}: ${w.recommendation}`);
        }
      });
    }

    recs.push(`3. [SAFEGUARDS] Execute full database snapshot backup and configure lock_timeout = "2s" prior to applying DDL execution tasks.`);
    recs.push(`4. [VERIFICATION] Re-run Database Inspector and Schema Comparator after migration execution to verify 100% target schema match.`);

    return recs;
  }
}
