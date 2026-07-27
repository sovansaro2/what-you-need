/**
 * WYN Migration Planning Engine - Rollback Planner
 * Generates stage-by-stage and overall rollback plans with safety classifications and manual recovery steps.
 */

import { MigrationStage, MigrationTask, RollbackPlan, RollbackStagePlan } from '../types';

export class RollbackPlanner {
  public planRollback(stages: MigrationStage[], tasks: MigrationTask[]): RollbackPlan {
    const stageRollbacks: RollbackStagePlan[] = [];

    stages.forEach((stage) => {
      const stageTasks = tasks.filter((t) => t.stageId === stage.stageId);
      const hasIrreversible = stageTasks.some((t) => t.rollbackAvailability === 'IRREVERSIBLE');
      const hasManual = stageTasks.some((t) => t.rollbackAvailability === 'MANUAL');

      let rollbackStrategy: 'SAFE' | 'MANUAL' | 'IRREVERSIBLE' = 'SAFE';
      let reason = 'All tasks in this stage are fully reversible without data loss.';

      if (hasIrreversible) {
        rollbackStrategy = 'IRREVERSIBLE';
        reason = 'Stage contains irreversible data transformations or destructive drops.';
      } else if (hasManual) {
        rollbackStrategy = 'MANUAL';
        reason = 'Stage contains column type conversions or table renames requiring manual backup restoration.';
      }

      const steps: string[] = [];
      // Generate steps in reverse order of tasks
      [...stageTasks].reverse().forEach((task) => {
        if (task.taskType === 'CREATE_TABLE') {
          steps.push(`DROP TABLE IF EXISTS ${task.targetEntity} CASCADE;`);
        } else if (task.taskType === 'ALTER_TABLE_ADD_COLUMN') {
          const [tbl, col] = task.targetEntity.split('.');
          steps.push(`ALTER TABLE ${tbl} DROP COLUMN IF EXISTS ${col};`);
        } else if (task.taskType === 'ADD_FOREIGN_KEY') {
          const [tbl, col] = task.targetEntity.split('.');
          steps.push(`ALTER TABLE ${tbl} DROP CONSTRAINT IF EXISTS fk_${tbl}_${col};`);
        } else if (task.taskType === 'CREATE_INDEX') {
          const [tbl, idx] = task.targetEntity.split('.');
          steps.push(`DROP INDEX IF EXISTS ${idx};`);
        } else if (task.taskType === 'CREATE_EXTENSION') {
          steps.push(`DROP EXTENSION IF EXISTS ${task.targetEntity};`);
        } else {
          steps.push(`-- Manual rollback step required for ${task.title}`);
        }
      });

      stageRollbacks.push({
        stageId: stage.stageId,
        stageName: stage.name,
        rollbackStrategy,
        reason,
        steps,
      });
    });

    const overallIrreversible = stageRollbacks.some((s) => s.rollbackStrategy === 'IRREVERSIBLE');
    const overallManual = stageRollbacks.some((s) => s.rollbackStrategy === 'MANUAL');

    let overallStrategy: 'SAFE' | 'MANUAL' | 'IRREVERSIBLE' = 'SAFE';
    let summary = 'Full automated rollback is available across all migration stages.';

    if (overallIrreversible) {
      overallStrategy = 'IRREVERSIBLE';
      summary = 'Rollback contains irreversible steps. Point-in-time database restore required.';
    } else if (overallManual) {
      overallStrategy = 'MANUAL';
      summary = 'Rollback requires manual data verification and structured SQL scripts for column modifications.';
    }

    return {
      overallStrategy,
      summary,
      stageRollbacks,
    };
  }

  public generateMarkdownReport(rollbackPlan: RollbackPlan): string {
    const lines: string[] = [];

    lines.push(`# WYN Database Migration Rollback Plan`);
    lines.push(`**Overall Strategy:** \`${rollbackPlan.overallStrategy}\``);
    lines.push(`**Summary:** ${rollbackPlan.summary}`);
    lines.push(``);
    lines.push(`---`);
    lines.push(``);

    lines.push(`## Stage Rollback Plans`);
    lines.push(``);

    rollbackPlan.stageRollbacks.forEach((sr) => {
      lines.push(`### ${sr.stageName} [${sr.rollbackStrategy}]`);
      lines.push(`*Reason:* ${sr.reason}`);
      lines.push(``);
      lines.push(`**Rollback Steps:**`);
      if (sr.steps.length > 0) {
        lines.push(`\`\`\`sql`);
        sr.steps.forEach((step) => lines.push(step));
        lines.push(`\`\`\``);
      } else {
        lines.push(`- No rollback steps required for this stage.`);
      }
      lines.push(``);
    });

    return lines.join('\n');
  }
}
