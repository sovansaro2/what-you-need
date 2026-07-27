/**
 * WYN Engineering Validation Engine - Dependency Validator
 * Validates dependency graphs, circular dependencies, and stage ordering correctness.
 */

import { ValidationResult, ValidationFinding } from '../types';

export class DependencyValidator {
  public validate(migrationPlan: any, dependenciesData: any): ValidationResult {
    const findings: ValidationFinding[] = [];
    let score = 100;

    const circularDeps = migrationPlan?.dependencies?.circularDependencies || dependenciesData?.circularDependencies || [];
    const executionPlan = migrationPlan?.executionPlan || [];
    const depGraph = migrationPlan?.dependencies?.dependencyGraph || dependenciesData?.dependencyGraph || {};

    // 1. Check for circular dependencies
    if (circularDeps.length > 0) {
      circularDeps.forEach((cd: any, idx: number) => {
        score -= 10;
        findings.push({
          id: `DEP-CIRC-${idx + 1}`,
          category: 'DEPENDENCY',
          severity: 'WARNING',
          title: `Circular Foreign Key Dependency`,
          description: cd.description || `Circular dependency between tables: ${cd.tables?.join(', ')}`,
          recommendation: `Ensure foreign key creation tasks for circular dependencies are deferred to Stage 6 (Constraints & Indexes).`,
        });
      });
    }

    // 2. Check for missing dependencies or dangling table references
    const allKnownTables = new Set(Object.keys(depGraph));
    Object.entries(depGraph).forEach(([tableName, node]: [string, any]) => {
      const dependsOn: string[] = node.dependsOn || [];
      dependsOn.forEach((parentTable) => {
        if (!allKnownTables.has(parentTable)) {
          score -= 15;
          findings.push({
            id: `DEP-MISSING-${tableName}-${parentTable}`,
            category: 'DEPENDENCY',
            severity: 'CRITICAL',
            title: `Missing Referenced Dependency Table`,
            description: `Table '${tableName}' depends on '${parentTable}', but '${parentTable}' is missing from the dependency graph.`,
            recommendation: `Define target table '${parentTable}' in target schema DDL or verify table creation sequence.`,
          });
        }
      });
    });

    // 3. Check for invalid stage ordering in tasks
    const taskStageMap = new Map<string, number>();
    executionPlan.forEach((task: any) => {
      taskStageMap.set(task.id, task.stageNumber);
    });

    executionPlan.forEach((task: any) => {
      const taskDeps: string[] = task.dependencies || [];
      taskDeps.forEach((depTaskId) => {
        const depStage = taskStageMap.get(depTaskId);
        if (depStage !== undefined && depStage > task.stageNumber) {
          score -= 20;
          findings.push({
            id: `DEP-ORDER-${task.id}`,
            category: 'DEPENDENCY',
            severity: 'CRITICAL',
            title: `Invalid Stage Dependency Order`,
            description: `Task '${task.id}' (Stage ${task.stageNumber}) depends on Task '${depTaskId}' which is scheduled in a LATER Stage (${depStage}).`,
            recommendation: `Re-order task execution plan to ensure dependent tasks run in earlier or equal stages.`,
          });
        }
      });
    });

    score = Math.max(0, score);
    const status = score === 100 ? 'PASSED' : findings.some((f) => f.severity === 'CRITICAL') ? 'FAILED' : 'WARNING';

    return {
      category: 'Dependency Validation',
      status,
      score,
      findings,
    };
  }
}
