/**
 * WYN Migration Planning Engine - Execution Planner
 * Constructs detailed, ordered execution tasks with dependencies, risk levels, and rollback availability.
 */

import {
  ParsedSchema,
  SchemaComparison,
  MigrationStage,
  MigrationTask,
  DependencyAnalysis,
  RiskLevel,
} from '../types';

export class ExecutionPlanner {
  public generateTasks(
    targetSchema: ParsedSchema,
    comparison: SchemaComparison,
    stages: MigrationStage[],
    dependencies: DependencyAnalysis
  ): MigrationTask[] {
    const tasks: MigrationTask[] = [];
    let taskCounter = 100;

    const createdTableTasks = new Map<string, string>(); // tableName -> taskId

    // 1. Extensions in Stage 1
    targetSchema.extensions.forEach((ext) => {
      taskCounter += 1;
      const taskId = `TASK-${taskCounter}`;
      tasks.push({
        id: taskId,
        stageId: 'STAGE_1_FOUNDATION',
        stageNumber: 1,
        title: `Enable Extension '${ext}'`,
        description: `Install PostgreSQL extension '${ext}' if not already present.`,
        targetEntity: ext,
        taskType: 'CREATE_EXTENSION',
        dependencies: [],
        estimatedDuration: '200ms',
        risk: 'LOW',
        rollbackAvailability: 'SAFE',
        rollbackReason: `Can be safely dropped using DROP EXTENSION IF EXISTS ${ext}.`,
      });
    });

    // 2. Table Creation Tasks across Stages 1-5
    const stageMap = new Map<string, MigrationStage>();
    stages.forEach((s) => stageMap.set(s.stageId, s));

    dependencies.creationOrder.forEach((tableName) => {
      const table = targetSchema.tables.get(tableName);
      if (!table) return;

      // Determine which stage this table belongs to
      let assignedStage = stages.find((s) => s.tables.includes(tableName)) || stages[2];

      taskCounter += 1;
      const taskId = `TASK-${taskCounter}`;
      createdTableTasks.set(tableName, taskId);

      // Task dependencies: parent tables created earlier
      const tableDeps = dependencies.dependencyGraph[tableName]?.dependsOn || [];
      const taskDeps = tableDeps
        .map((depTable) => createdTableTasks.get(depTable))
        .filter((id): id is string => !!id);

      const isMissingTable = comparison.tableComparison.missingTables.includes(tableName);
      const isMatchingTable = comparison.tableComparison.matchingTables.includes(tableName);

      if (isMissingTable) {
        tasks.push({
          id: taskId,
          stageId: assignedStage.stageId,
          stageNumber: assignedStage.stageNumber,
          title: `Create Table '${tableName}'`,
          description: `Create new table '${tableName}' with primary keys and initial column definitions.`,
          targetEntity: tableName,
          taskType: 'CREATE_TABLE',
          dependencies: taskDeps,
          estimatedDuration: '400ms',
          risk: 'LOW',
          rollbackAvailability: 'SAFE',
          rollbackReason: `Table is newly created in this migration and can be safely dropped.`,
        });
      } else if (isMatchingTable) {
        // Table exists, check for column differences
        const colDiffs = comparison.columnDifferences.filter(
          (c) => c.table.toLowerCase() === tableName.toLowerCase()
        );

        colDiffs.forEach((cd) => {
          if (cd.diffType === 'MISSING') {
            taskCounter += 1;
            const colTaskId = `TASK-${taskCounter}`;
            tasks.push({
              id: colTaskId,
              stageId: assignedStage.stageId,
              stageNumber: assignedStage.stageNumber,
              title: `Add Column '${cd.column}' to '${tableName}'`,
              description: `Add missing column '${cd.column}' (${cd.target}) to table '${tableName}'.`,
              targetEntity: `${tableName}.${cd.column}`,
              taskType: 'ALTER_TABLE_ADD_COLUMN',
              dependencies: [taskId],
              estimatedDuration: '250ms',
              risk: 'LOW',
              rollbackAvailability: 'SAFE',
              rollbackReason: `Newly added column can be dropped via ALTER TABLE ${tableName} DROP COLUMN ${cd.column}.`,
            });
          } else if (cd.diffType === 'DATA_TYPE') {
            taskCounter += 1;
            const colTaskId = `TASK-${taskCounter}`;
            tasks.push({
              id: colTaskId,
              stageId: assignedStage.stageId,
              stageNumber: assignedStage.stageNumber,
              title: `Modify Column Type '${cd.column}' in '${tableName}'`,
              description: `Modify column '${cd.column}' in '${tableName}' from ${cd.current} to ${cd.target}.`,
              targetEntity: `${tableName}.${cd.column}`,
              taskType: 'ALTER_TABLE_MODIFY_COLUMN',
              dependencies: [taskId],
              estimatedDuration: '500ms',
              risk: 'HIGH',
              rollbackAvailability: 'MANUAL',
              rollbackReason: `Type conversion may require explicit reverse casting and data verification.`,
            });
          }
        });
      }
    });

    // 3. Stage 6: Foreign Keys, Constraints, and Indexes
    const stage6 = stages.find((s) => s.stageId === 'STAGE_6_CONSTRAINTS_INDEXES') || stages[5];

    // Foreign Keys
    targetSchema.tables.forEach((table, tableName) => {
      table.foreignKeys.forEach((fk) => {
        taskCounter += 1;
        const fkTaskId = `TASK-${taskCounter}`;
        const sourceTableTaskId = createdTableTasks.get(tableName);
        const targetTableTaskId = createdTableTasks.get(fk.targetTable);

        const deps: string[] = [];
        if (sourceTableTaskId) deps.push(sourceTableTaskId);
        if (targetTableTaskId && targetTableTaskId !== sourceTableTaskId) deps.push(targetTableTaskId);

        const fkName = fk.constraintName || `fk_${tableName}_${fk.sourceColumn}`;

        tasks.push({
          id: fkTaskId,
          stageId: stage6.stageId,
          stageNumber: stage6.stageNumber,
          title: `Add Foreign Key '${fkName}' on '${tableName}'`,
          description: `Add foreign key constraint '${fkName}' on ${tableName}(${fk.sourceColumn}) referencing ${fk.targetTable}(${fk.targetColumn}).`,
          targetEntity: `${tableName}.${fk.sourceColumn}`,
          taskType: 'ADD_FOREIGN_KEY',
          dependencies: deps,
          estimatedDuration: '300ms',
          risk: 'MEDIUM',
          rollbackAvailability: 'SAFE',
          rollbackReason: `Constraint can be dropped using ALTER TABLE ${tableName} DROP CONSTRAINT ${fkName}.`,
        });
      });

      // Indexes
      table.indexes.forEach((idx) => {
        taskCounter += 1;
        const idxTaskId = `TASK-${taskCounter}`;
        const tableTaskId = createdTableTasks.get(tableName);

        tasks.push({
          id: idxTaskId,
          stageId: stage6.stageId,
          stageNumber: stage6.stageNumber,
          title: `Create Index '${idx.indexName}' on '${tableName}'`,
          description: `Create ${idx.isUnique ? 'UNIQUE ' : ''}index '${idx.indexName}' on ${tableName}(${idx.columns.join(', ')}).`,
          targetEntity: `${tableName}.${idx.indexName}`,
          taskType: 'CREATE_INDEX',
          dependencies: tableTaskId ? [tableTaskId] : [],
          estimatedDuration: '400ms',
          risk: 'LOW',
          rollbackAvailability: 'SAFE',
          rollbackReason: `Index can be dropped safely using DROP INDEX IF EXISTS ${idx.indexName}.`,
        });
      });
    });

    // Update task counts on stages
    stages.forEach((stage) => {
      stage.taskCount = tasks.filter((t) => t.stageId === stage.stageId).length;
    });

    return tasks;
  }
}
