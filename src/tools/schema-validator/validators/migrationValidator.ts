/**
 * WYN Engineering Validation Engine - Migration Validator
 * Validates stage completeness, task coverage, and execution plan structure.
 */

import { ValidationResult, ValidationFinding } from '../types';

export class MigrationValidator {
  public validate(migrationPlan: any, schemaComparison: any): ValidationResult {
    const findings: ValidationFinding[] = [];
    let score = 100;

    const stages = migrationPlan?.stages || [];
    const tasks = migrationPlan?.executionPlan || [];
    const missingTables = schemaComparison?.summary?.missingTables || schemaComparison?.tableComparison?.missingTables || [];

    // 1. Check for missing migration stages
    const expectedStageNumbers = [1, 2, 3, 4, 5, 6];
    const presentStageNumbers = new Set(stages.map((s: any) => s.stageNumber));

    expectedStageNumbers.forEach((num) => {
      if (!presentStageNumbers.has(num)) {
        score -= 15;
        findings.push({
          id: `MIG-STAGE-MISSING-${num}`,
          category: 'MIGRATION',
          severity: 'CRITICAL',
          title: `Missing Migration Stage ${num}`,
          description: `Required migration Stage ${num} is missing from the migration plan.`,
          recommendation: `Ensure all 6 standard migration stages (Foundation, Lookups, Core, Ledger, Finance, Constraints) are populated.`,
        });
      }
    });

    // 2. Check for missing tasks for missing target tables
    const createdTableEntities = new Set(
      tasks.filter((t: any) => t.taskType === 'CREATE_TABLE').map((t: any) => t.targetEntity.toLowerCase())
    );

    missingTables.forEach((table: string) => {
      if (!createdTableEntities.has(table.toLowerCase())) {
        score -= 20;
        findings.push({
          id: `MIG-TASK-MISSING-TBL-${table}`,
          category: 'MIGRATION',
          severity: 'CRITICAL',
          title: `Missing Table Creation Task`,
          description: `Table '${table}' is missing in current database, but no 'CREATE_TABLE' task exists in the execution plan.`,
          recommendation: `Add a 'CREATE_TABLE' task for '${table}' in the appropriate migration stage.`,
        });
      }
    });

    // 3. Check for valid execution order and task IDs
    if (tasks.length === 0 && missingTables.length > 0) {
      score -= 30;
      findings.push({
        id: `MIG-EXEC-EMPTY`,
        category: 'MIGRATION',
        severity: 'CRITICAL',
        title: `Empty Execution Plan`,
        description: `Target schema differs from current database, but execution plan contains zero tasks.`,
        recommendation: `Generate execution tasks for missing tables, columns, constraints, and indexes.`,
      });
    }

    tasks.forEach((task: any, idx: number) => {
      if (!task.id || !task.stageId || !task.taskType) {
        score -= 5;
        findings.push({
          id: `MIG-TASK-MALFORMED-${idx + 1}`,
          category: 'MIGRATION',
          severity: 'WARNING',
          title: `Malformed Migration Task`,
          description: `Task at index ${idx} is missing required fields (id, stageId, or taskType).`,
          recommendation: `Ensure all tasks conform to the standard MigrationTask interface.`,
        });
      }
    });

    score = Math.max(0, score);
    const status = score === 100 ? 'PASSED' : findings.some((f) => f.severity === 'CRITICAL') ? 'FAILED' : 'WARNING';

    return {
      category: 'Migration Validation',
      status,
      score,
      findings,
    };
  }
}
