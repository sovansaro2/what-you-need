/**
 * WYN Intelligent Mapping Engine - Risk Analyzer
 * Evaluates mapping risks across tables, columns, and foreign key relationships.
 */

import { RiskLevel } from '../types';

export class RiskAnalyzer {
  public static evaluateTableRisk(matchType: string, confidenceScore: number): RiskLevel {
    if (matchType === 'DEPRECATED_TABLE') return 'HIGH';
    if (matchType === 'SPLIT_CANDIDATE' || matchType === 'MERGE_CANDIDATE') return 'CRITICAL';
    if (matchType === 'RENAME_CANDIDATE') {
      return confidenceScore >= 80 ? 'LOW' : 'MEDIUM';
    }
    if (matchType === 'NEW_TABLE') return 'LOW';
    return 'LOW';
  }

  public static evaluateColumnRisk(
    matchType: string,
    typeMatch: boolean,
    nullabilityMatch: boolean
  ): RiskLevel {
    if (matchType === 'DEPRECATED_COLUMN') return 'HIGH';
    if (!typeMatch) return 'CRITICAL';
    if (!nullabilityMatch) return 'MEDIUM';
    if (matchType === 'RENAME_CANDIDATE') return 'MEDIUM';
    return 'LOW';
  }

  public static evaluateRelationshipRisk(status: string): RiskLevel {
    if (status === 'RELATIONSHIP_REMOVED') return 'HIGH';
    if (status === 'FK_MOVED' || status === 'FK_RENAMED') return 'MEDIUM';
    if (status === 'RELATIONSHIP_INTRODUCED') return 'LOW';
    return 'LOW';
  }
}
