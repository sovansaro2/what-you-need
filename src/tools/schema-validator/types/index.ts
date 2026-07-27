/**
 * WYN Schema Validator Engine - Types Definition
 */

export type ValidationSeverity = 'CRITICAL' | 'WARNING' | 'INFO';
export type ValidationStatus = 'PASSED' | 'FAILED' | 'WARNING';
export type ApprovalDecision = 'APPROVED' | 'APPROVED WITH WARNINGS' | 'REJECTED';

export interface ValidationFinding {
  id: string;
  category: 'DEPENDENCY' | 'MAPPING' | 'MIGRATION' | 'ROLLBACK' | 'RISK' | 'HEALTH' | 'COVERAGE';
  severity: ValidationSeverity;
  title: string;
  description: string;
  recommendation?: string;
}

export interface ValidationResult {
  category: string;
  status: ValidationStatus;
  score: number; // 0 - 100
  findings: ValidationFinding[];
}

export interface ValidationSummary {
  totalChecks: number;
  passedChecks: number;
  warningChecks: number;
  failedChecks: number;
  criticalFindingsCount: number;
  warningFindingsCount: number;
  healthScore: number;
  healthStatus: 'HEALTHY' | 'WARNING' | 'CRITICAL';
  finalDecision: ApprovalDecision;
}

export interface EngineeringValidation {
  timestamp: string;
  targetFile: string;
  schemaHash: string;
  summary: ValidationSummary;
  results: {
    dependency: ValidationResult;
    mapping: ValidationResult;
    migration: ValidationResult;
    rollback: ValidationResult;
    risk: ValidationResult;
    health: ValidationResult;
    coverage: ValidationResult;
  };
  criticalFindings: ValidationFinding[];
  warnings: ValidationFinding[];
  recommendations: string[];
  approvalDecision: ApprovalDecision;
}

export interface ValidatorOptions {
  inspectorDir?: string;
  comparatorDir?: string;
  targetSqlPath?: string;
  outputDir?: string;
  verbose?: boolean;
}
