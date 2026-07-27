/**
 * WYN Migration Planning Engine - Risk Planner
 * Analyzes risks across 5 mandatory categories: Data Loss, Constraint Failure, Performance, Locking, Application Compatibility.
 */

import { SchemaComparison, MigrationTask, MigrationRisks, RiskCategoryItem, RiskLevel } from '../types';

export class RiskPlanner {
  public planRisks(comparison: SchemaComparison, tasks: MigrationTask[]): MigrationRisks {
    const risksByCategory: RiskCategoryItem[] = [];

    // 1. Data Loss Risks
    const typeModTasks = tasks.filter((t) => t.taskType === 'ALTER_TABLE_MODIFY_COLUMN');
    if (typeModTasks.length > 0) {
      risksByCategory.push({
        category: 'DATA_LOSS',
        title: 'Column Data Type Modifications',
        description: `${typeModTasks.length} column data type modifications detected. Potential data truncation or conversion failure if unhandled.`,
        affectedEntities: typeModTasks.map((t) => t.targetEntity),
        riskLevel: 'HIGH',
        mitigation: 'Use explicit SQL USING clauses with type casting functions and verify staging data before applying to production.',
      });
    } else {
      risksByCategory.push({
        category: 'DATA_LOSS',
        title: 'Data Loss Risk Assessment',
        description: 'No table or column drops required. Zero data loss anticipated.',
        affectedEntities: [],
        riskLevel: 'LOW',
        mitigation: 'Standard pre-migration database snapshot backup.',
      });
    }

    // 2. Constraint Failure Risks
    const missingFkCount = comparison.summary.fkDifferencesCount;
    if (missingFkCount > 0) {
      risksByCategory.push({
        category: 'CONSTRAINT_FAILURE',
        title: 'Foreign Key Referential Integrity Validation',
        description: `${missingFkCount} foreign key constraints need creation or verification. Existing orphan records could cause constraint creation failures.`,
        affectedEntities: comparison.fkDifferences.map((f) => f.table),
        riskLevel: 'MEDIUM',
        mitigation: 'Execute orphan record detection queries prior to applying ALTER TABLE ADD CONSTRAINT FOREIGN KEY.',
      });
    } else {
      risksByCategory.push({
        category: 'CONSTRAINT_FAILURE',
        title: 'Constraint Failure Risk Assessment',
        description: 'All primary and foreign key definitions in target DDL are consistent with database structure.',
        affectedEntities: [],
        riskLevel: 'LOW',
        mitigation: 'Standard transaction-bound constraint creation.',
      });
    }

    // 3. Performance Risks
    const indexCount = tasks.filter((t) => t.taskType === 'CREATE_INDEX').length;
    if (indexCount > 5) {
      risksByCategory.push({
        category: 'PERFORMANCE',
        title: 'Index Creation Overhead',
        description: `Creating ${indexCount} indexes concurrently may consume I/O resources during peak traffic.`,
        affectedEntities: tasks.filter((t) => t.taskType === 'CREATE_INDEX').map((t) => t.targetEntity),
        riskLevel: 'MEDIUM',
        mitigation: 'Execute CREATE INDEX CONCURRENTLY outside peak business hours to prevent table write blocking.',
      });
    } else {
      risksByCategory.push({
        category: 'PERFORMANCE',
        title: 'Performance Impact Assessment',
        description: 'Index creation footprint is lightweight and optimal.',
        affectedEntities: [],
        riskLevel: 'LOW',
        mitigation: 'Standard index creation in background window.',
      });
    }

    // 4. Locking Risks
    const alterTableCount = tasks.filter(
      (t) => t.taskType === 'ALTER_TABLE_ADD_COLUMN' || t.taskType === 'ALTER_TABLE_MODIFY_COLUMN'
    ).length;
    if (alterTableCount > 0) {
      risksByCategory.push({
        category: 'LOCKING',
        title: 'Access Exclusive Table Locking',
        description: `ALTER TABLE operations acquire ACCESS EXCLUSIVE locks on ${alterTableCount} tables, temporarily blocking concurrent queries.`,
        affectedEntities: tasks
          .filter((t) => t.taskType.startsWith('ALTER_TABLE'))
          .map((t) => t.targetEntity),
        riskLevel: 'HIGH',
        mitigation: 'Set statement_timeout = "5s" and lock_timeout = "2s" in PostgreSQL session to prevent lock queue blockage.',
      });
    } else {
      risksByCategory.push({
        category: 'LOCKING',
        title: 'Table Lock Assessment',
        description: 'Exclusive locks restricted to new table creations.',
        affectedEntities: [],
        riskLevel: 'LOW',
        mitigation: 'Standard transaction scope.',
      });
    }

    // 5. Application Compatibility Risks
    const renameCount = comparison.tableComparison.renamedCandidates.length;
    if (renameCount > 0) {
      risksByCategory.push({
        category: 'APPLICATION_COMPATIBILITY',
        title: 'Application Query Breakage due to Table Renames',
        description: `${renameCount} candidate table renames identified. Active backend ORM queries targeting old table names will fail if uncoordinated.`,
        affectedEntities: comparison.tableComparison.renamedCandidates.map(
          (r) => `${r.currentName} -> ${r.targetName}`
        ),
        riskLevel: 'CRITICAL',
        mitigation: 'Deploy application code with dual-query fallback support or use database VIEW aliasing during transition.',
      });
    } else {
      risksByCategory.push({
        category: 'APPLICATION_COMPATIBILITY',
        title: 'Application Backward Compatibility',
        description: 'Zero destructive renames. New tables and columns added incrementally.',
        affectedEntities: [],
        riskLevel: 'LOW',
        mitigation: 'Deploy database migration prior to backend code release.',
      });
    }

    // Summary counts
    let lowCount = 0;
    let mediumCount = 0;
    let highCount = 0;
    let criticalCount = 0;

    risksByCategory.forEach((r) => {
      if (r.riskLevel === 'LOW') lowCount++;
      else if (r.riskLevel === 'MEDIUM') mediumCount++;
      else if (r.riskLevel === 'HIGH') highCount++;
      else if (r.riskLevel === 'CRITICAL') criticalCount++;
    });

    let overallRiskLevel: RiskLevel = 'LOW';
    if (criticalCount > 0) overallRiskLevel = 'CRITICAL';
    else if (highCount > 0) overallRiskLevel = 'HIGH';
    else if (mediumCount > 0) overallRiskLevel = 'MEDIUM';

    return {
      overallRiskLevel,
      riskSummary: {
        lowCount,
        mediumCount,
        highCount,
        criticalCount,
      },
      risksByCategory,
    };
  }
}
