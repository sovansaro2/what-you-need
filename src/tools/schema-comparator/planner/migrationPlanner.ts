/**
 * WYN Migration Planning Engine - Main Orchestrator
 * Coordinates dependency analysis, staging, execution planning, rollback strategies, risk analysis, and artifact generation.
 */

import fs from 'fs';
import path from 'path';
import { ParsedSchema, SchemaComparison, MigrationPlan } from '../types';
import { DependencyAnalyzer } from './dependencyAnalyzer';
import { StagePlanner } from './stagePlanner';
import { ExecutionPlanner } from './executionPlanner';
import { RollbackPlanner } from './rollbackPlanner';
import { RiskPlanner } from './riskPlanner';
import { ValidationPlanner } from './validationPlanner';

export class MigrationPlanner {
  private dependencyAnalyzer = new DependencyAnalyzer();
  private stagePlanner = new StagePlanner();
  private executionPlanner = new ExecutionPlanner();
  private rollbackPlanner = new RollbackPlanner();
  private riskPlanner = new RiskPlanner();
  private validationPlanner = new ValidationPlanner();

  public createMigrationPlan(
    targetSchema: ParsedSchema,
    comparison: SchemaComparison
  ): MigrationPlan {
    // 1. Dependency Analysis
    const dependencies = this.dependencyAnalyzer.analyzeDependencies(targetSchema);

    // 2. Stage Planning
    const stages = this.stagePlanner.planStages(targetSchema, dependencies);

    // 3. Execution Planning
    const executionPlan = this.executionPlanner.generateTasks(
      targetSchema,
      comparison,
      stages,
      dependencies
    );

    // 4. Rollback Planning
    const rollbackPlan = this.rollbackPlanner.planRollback(stages, executionPlan);

    // 5. Risk Planning
    const risks = this.riskPlanner.planRisks(comparison, executionPlan);

    // 6. Validation Planning
    const validationChecklist = this.validationPlanner.generateChecklist();

    // 7. Recommendations
    const recommendations = this.generateRecommendations(comparison, risks, rollbackPlan);

    return {
      timestamp: new Date().toISOString(),
      targetFile: comparison.targetFile,
      schemaHash: comparison.schemaHash,
      summary: {
        totalStages: stages.length,
        totalTasks: executionPlan.length,
        estimatedTotalDuration: '28s',
        overallRisk: risks.overallRiskLevel,
        overallRollbackStrategy: rollbackPlan.overallStrategy,
      },
      dependencies,
      stages,
      executionPlan,
      rollbackPlan,
      risks,
      validationChecklist,
      recommendations,
    };
  }

  public writePlanArtifacts(plan: MigrationPlan, outputDir: string): {
    planJsonPath: string;
    planMdPath: string;
    stagesJsonPath: string;
    dependenciesJsonPath: string;
    risksJsonPath: string;
    rollbackMdPath: string;
  } {
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const planJsonPath = path.join(outputDir, 'migration_plan.json');
    const planMdPath = path.join(outputDir, 'migration_plan.md');
    const stagesJsonPath = path.join(outputDir, 'migration_stages.json');
    const dependenciesJsonPath = path.join(outputDir, 'migration_dependencies.json');
    const risksJsonPath = path.join(outputDir, 'migration_risks.json');
    const rollbackMdPath = path.join(outputDir, 'rollback_plan.md');

    // 1. migration_plan.json
    fs.writeFileSync(planJsonPath, JSON.stringify(plan, null, 2), 'utf-8');

    // 2. migration_stages.json
    fs.writeFileSync(stagesJsonPath, JSON.stringify(plan.stages, null, 2), 'utf-8');

    // 3. migration_dependencies.json
    fs.writeFileSync(dependenciesJsonPath, JSON.stringify(plan.dependencies, null, 2), 'utf-8');

    // 4. migration_risks.json
    fs.writeFileSync(risksJsonPath, JSON.stringify(plan.risks, null, 2), 'utf-8');

    // 5. rollback_plan.md
    const rollbackMdContent = this.rollbackPlanner.generateMarkdownReport(plan.rollbackPlan);
    fs.writeFileSync(rollbackMdPath, rollbackMdContent, 'utf-8');

    // 6. migration_plan.md
    const planMdContent = this.generateMarkdownPlan(plan);
    fs.writeFileSync(planMdPath, planMdContent, 'utf-8');

    return {
      planJsonPath,
      planMdPath,
      stagesJsonPath,
      dependenciesJsonPath,
      risksJsonPath,
      rollbackMdPath,
    };
  }

  private generateRecommendations(
    comparison: SchemaComparison,
    risks: any,
    rollbackPlan: any
  ): string[] {
    const recs: string[] = [];
    recs.push('1. Execute full database snapshot backup prior to starting Stage 1.');
    recs.push('2. Set lock_timeout = "2s" in migration session to protect production read queries.');
    recs.push('3. Run migration stages in sequential order within explicit BEGIN ... COMMIT blocks.');
    if (comparison.tableComparison.renamedCandidates.length > 0) {
      recs.push('4. Coordinate backend application release to handle table name aliasing during transition.');
    }
    recs.push('5. Re-run Database Inspector post-migration to verify 100% schema match rate.');
    return recs;
  }

  private generateMarkdownPlan(plan: MigrationPlan): string {
    const lines: string[] = [];

    lines.push(`# WYN Database Migration Execution Plan`);
    lines.push(
      `**Target File:** \`${plan.targetFile}\` | **Schema Hash:** \`${plan.schemaHash}\` | **Generated:** \`${plan.timestamp}\``
    );
    lines.push(``);
    lines.push(`---`);
    lines.push(``);

    // 1. Executive Summary
    lines.push(`## 1. Executive Summary`);
    lines.push(``);
    lines.push(`| Metric | Value |`);
    lines.push(`| :--- | :---: |`);
    lines.push(`| **Total Migration Stages** | **${plan.summary.totalStages}** |`);
    lines.push(`| **Total Execution Tasks** | **${plan.summary.totalTasks}** |`);
    lines.push(`| **Estimated Total Duration** | **${plan.summary.estimatedTotalDuration}** |`);
    lines.push(`| **Overall Migration Risk** | **\`${plan.summary.overallRisk}\`** |`);
    lines.push(`| **Rollback Strategy** | **\`${plan.summary.overallRollbackStrategy}\`** |`);
    lines.push(``);

    // 2. Migration Stages
    lines.push(`## 2. Migration Stages`);
    lines.push(``);
    lines.push(`| Stage | Name | Description | Tasks | Duration | Risk |`);
    lines.push(`| :---: | :--- | :--- | :---: | :---: | :---: |`);
    plan.stages.forEach((s) => {
      lines.push(
        `| **Stage ${s.stageNumber}** | ${s.name} | ${s.description} | ${s.taskCount} | ${s.estimatedDuration} | \`${s.risk}\` |`
      );
    });
    lines.push(``);

    // 3. Dependency Graph & Topological Order
    lines.push(`## 3. Dependency Graph & Creation Order`);
    lines.push(``);
    lines.push(`**Required Table Creation Sequence:**`);
    lines.push(`\`\`\``);
    lines.push(plan.dependencies.creationOrder.join(' ➔ '));
    lines.push(`\`\`\``);
    lines.push(``);
    if (plan.dependencies.circularDependencies.length > 0) {
      lines.push(`**Circular Dependencies Detected:**`);
      plan.dependencies.circularDependencies.forEach((cd) => {
        lines.push(`- ⚠️ ${cd.description}`);
      });
      lines.push(``);
    }

    // 4. Execution Order (Tasks)
    lines.push(`## 4. Execution Tasks`);
    lines.push(``);
    lines.push(`| ID | Stage | Title | Target Entity | Duration | Risk | Rollback |`);
    lines.push(`| :--- | :---: | :--- | :--- | :---: | :---: | :---: |`);
    plan.executionPlan.forEach((task) => {
      lines.push(
        `| \`${task.id}\` | Stage ${task.stageNumber} | ${task.title} | \`${task.targetEntity}\` | ${task.estimatedDuration} | \`${task.risk}\` | \`${task.rollbackAvailability}\` |`
      );
    });
    lines.push(``);

    // 5. Risk Matrix
    lines.push(`## 5. Risk Matrix & Mitigations`);
    lines.push(``);
    plan.risks.risksByCategory.forEach((r) => {
      lines.push(`### [${r.riskLevel}] ${r.title} (${r.category})`);
      lines.push(`${r.description}`);
      lines.push(`- **Mitigation:** ${r.mitigation}`);
      lines.push(``);
    });

    // 6. Rollback Strategy
    lines.push(`## 6. Rollback Strategy`);
    lines.push(``);
    lines.push(`**Overall Strategy:** \`${plan.rollbackPlan.overallStrategy}\``);
    lines.push(`${plan.rollbackPlan.summary}`);
    lines.push(`*For detailed step-by-step SQL rollback scripts, refer to \`rollback_plan.md\`.*`);
    lines.push(``);

    // 7. Validation Checklist
    lines.push(`## 7. Validation Checklist`);
    lines.push(``);
    lines.push(`### Pre-Migration Checklist`);
    plan.validationChecklist.beforeMigration.forEach((c) => {
      lines.push(`- [ ] **${c.check}** (\`${c.id}\`): ${c.details}`);
    });
    lines.push(``);
    lines.push(`### In-Flight Migration Checklist`);
    plan.validationChecklist.duringMigration.forEach((c) => {
      lines.push(`- [ ] **${c.check}** (\`${c.id}\`): ${c.details}`);
    });
    lines.push(``);
    lines.push(`### Post-Migration Checklist`);
    plan.validationChecklist.afterMigration.forEach((c) => {
      lines.push(`- [ ] **${c.check}** (\`${c.id}\`): ${c.details}`);
    });
    lines.push(``);

    // 8. Recommendations
    lines.push(`## 8. Engineering Recommendations`);
    lines.push(``);
    plan.recommendations.forEach((rec) => lines.push(rec));
    lines.push(``);

    return lines.join('\n');
  }
}
