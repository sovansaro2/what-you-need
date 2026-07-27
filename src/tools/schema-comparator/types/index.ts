/**
 * WYN Schema Comparator Engine - Type Definitions
 * Complete interface declarations for parsed SQL schemas, inspector data, comparison outputs, and health metrics.
 */

export interface ParsedColumn {
  name: string;
  dataType: string;
  nullable: boolean;
  defaultValue: string | null;
  isPrimaryKey?: boolean;
  references?: {
    table: string;
    column: string;
    onDelete?: string;
    onUpdate?: string;
  };
}

export interface ParsedPrimaryKey {
  constraintName?: string;
  table: string;
  columns: string[];
}

export interface ParsedForeignKey {
  constraintName?: string;
  sourceTable: string;
  sourceColumn: string;
  targetTable: string;
  targetColumn: string;
  onDelete?: string;
  onUpdate?: string;
}

export interface ParsedConstraint {
  constraintName: string;
  constraintType: 'CHECK' | 'UNIQUE' | 'NOT NULL';
  table: string;
  definition: string;
  columns?: string[];
  expression?: string;
}

export interface ParsedIndex {
  indexName: string;
  table: string;
  columns: string[];
  isUnique: boolean;
  isPartial: boolean;
  whereClause?: string;
  definition?: string;
}

export interface ParsedTable {
  name: string;
  columns: Map<string, ParsedColumn>;
  primaryKey?: ParsedPrimaryKey;
  foreignKeys: ParsedForeignKey[];
  constraints: ParsedConstraint[];
  indexes: ParsedIndex[];
}

export interface ParsedSchema {
  tables: Map<string, ParsedTable>;
  extensions: string[];
  indexes: ParsedIndex[];
  constraints: ParsedConstraint[];
}

// Inspector input record interfaces
export interface InspectorTableRecord {
  tableName: string;
  schema: string;
  tableOwner?: string;
  estimatedRowCount?: number;
  estimatedSize?: string;
  tableType?: string;
}

export interface InspectorColumnRecord {
  table: string;
  columnName: string;
  dataType: string;
  nullable: boolean;
  defaultValue: string | null;
  ordinalPosition?: number;
}

export interface InspectorPKRecord {
  constraintName: string;
  table: string;
  columns: string[];
}

export interface InspectorFKRecord {
  constraintName: string;
  sourceTable: string;
  sourceColumn: string;
  targetTable: string;
  targetColumn: string;
  onDelete?: string;
  onUpdate?: string;
}

export interface InspectorConstraintRecord {
  constraintType: string;
  constraintName: string;
  table: string;
  definition: string;
}

export interface InspectorIndexRecord {
  indexName: string;
  table: string;
  columns: string[];
  isUnique: boolean;
  isPrimary?: boolean;
  isPartial?: boolean;
  definition?: string;
}

// Comparison output interfaces
export interface RenamedCandidate {
  currentName: string;
  targetName: string;
  confidenceScore: number; // 0 - 100
  reason: string;
}

export interface TableComparisonResult {
  missingTables: string[];
  extraTables: string[];
  matchingTables: string[];
  renamedCandidates: RenamedCandidate[];
}

export interface ColumnDifference {
  table: string;
  column: string;
  diffType: 'MISSING' | 'EXTRA' | 'DATA_TYPE' | 'NULLABILITY' | 'DEFAULT_VALUE';
  current?: string | boolean | null;
  target?: string | boolean | null;
  description: string;
}

export interface PrimaryKeyDifference {
  table: string;
  diffType: 'MISSING_PK' | 'EXTRA_PK' | 'COLUMN_MISMATCH';
  currentColumns?: string[];
  targetColumns?: string[];
  description: string;
}

export interface ForeignKeyDifference {
  table: string;
  constraintName?: string;
  sourceColumn?: string;
  targetTable?: string;
  diffType: 'MISSING_FK' | 'EXTRA_FK' | 'DEFINITION_MISMATCH';
  current?: Partial<InspectorFKRecord>;
  target?: Partial<ParsedForeignKey>;
  description: string;
}

export interface ConstraintDifference {
  table: string;
  constraintName?: string;
  constraintType: string;
  diffType: 'MISSING_CONSTRAINT' | 'EXTRA_CONSTRAINT' | 'DEFINITION_MISMATCH';
  current?: string;
  target?: string;
  description: string;
}

export interface IndexDifference {
  table: string;
  indexName: string;
  diffType: 'MISSING_INDEX' | 'EXTRA_INDEX' | 'DEFINITION_MISMATCH';
  isUniqueMismatch?: boolean;
  isPartialMismatch?: boolean;
  current?: Partial<InspectorIndexRecord>;
  target?: Partial<ParsedIndex>;
  description: string;
}

export interface HealthCategory {
  score: number; // 0 - 100
  status: 'EXCELLENT' | 'GOOD' | 'WARNING' | 'CRITICAL';
  details: string[];
  findingsCount: number;
}

export interface DatabaseHealth {
  overallScore: number;
  completeness: HealthCategory;
  integrity: HealthCategory;
  performance: HealthCategory;
  security: HealthCategory;
  maintainability: HealthCategory;
  timestamp: string;
}

export interface SchemaComparisonSummary {
  totalDifferences: number;
  missingTablesCount: number;
  extraTablesCount: number;
  columnDifferencesCount: number;
  pkDifferencesCount: number;
  fkDifferencesCount: number;
  constraintDifferencesCount: number;
  indexDifferencesCount: number;
  schemaMatchPercentage: number;
}

export interface SchemaComparison {
  timestamp: string;
  targetFile: string;
  schemaHash: string;
  summary: SchemaComparisonSummary;
  tableComparison: TableComparisonResult;
  columnDifferences: ColumnDifference[];
  pkDifferences: PrimaryKeyDifference[];
  fkDifferences: ForeignKeyDifference[];
  constraintDifferences: ConstraintDifference[];
  indexDifferences: IndexDifference[];
  health: DatabaseHealth;
}

export interface ComparatorOptions {
  targetSqlPath?: string;
  inspectorDir?: string;
  outputDir?: string;
  verbose?: boolean;
  summaryOnly?: boolean;
  mapping?: boolean;
  plan?: boolean;
}

// ==========================================
// INTELLIGENT MAPPING ENGINE TYPES
// ==========================================

export type ConfidenceLevel = 'VERY_HIGH' | 'HIGH' | 'MEDIUM' | 'LOW';
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface TableMapping {
  currentTable: string | null;
  targetTable: string;
  matchType: 'DIRECT_MATCH' | 'RENAME_CANDIDATE' | 'SPLIT_CANDIDATE' | 'MERGE_CANDIDATE' | 'DEPRECATED_TABLE' | 'NEW_TABLE';
  confidenceScore: number; // 0 - 100
  confidenceLevel: ConfidenceLevel;
  risk: RiskLevel;
  reason: string;
}

export interface ColumnMapping {
  table: string;
  currentColumn: string | null;
  targetColumn: string;
  matchType: 'DIRECT_MATCH' | 'RENAME_CANDIDATE' | 'TYPE_COMPATIBLE' | 'DEFAULT_COMPATIBLE' | 'SEMANTIC_COMPATIBLE' | 'NEW_COLUMN' | 'DEPRECATED_COLUMN';
  confidenceScore: number;
  confidenceLevel: ConfidenceLevel;
  typeMatch: boolean;
  nullabilityMatch: boolean;
  defaultMatch: boolean;
  risk: RiskLevel;
  reason: string;
}

export interface RelationshipMapping {
  constraintName: string | null;
  sourceTable: string;
  sourceColumn: string;
  targetTable: string;
  targetColumn: string;
  status: 'RELATIONSHIP_PRESERVED' | 'FK_MOVED' | 'FK_RENAMED' | 'RELATIONSHIP_REMOVED' | 'RELATIONSHIP_INTRODUCED';
  confidenceScore: number;
  confidenceLevel: ConfidenceLevel;
  risk: RiskLevel;
  reason: string;
}

export interface MigrationHint {
  sourceEntity: string;
  targetEntity: string;
  hintType: 'RENAME' | 'LEDGER_EVOLUTION' | 'DIRECT_NUMERIC' | 'TYPE_CAST' | 'NEW_STRUCTURE' | 'DEPRECATION';
  hint: string;
  recommendation: string;
}

export interface MappingReport {
  timestamp: string;
  schemaHash: string;
  tableMappings: TableMapping[];
  columnMappings: ColumnMapping[];
  relationshipMappings: RelationshipMapping[];
  renameCandidates: RenamedCandidate[];
  migrationHints: MigrationHint[];
  confidenceMatrix: {
    veryHighCount: number;
    highCount: number;
    mediumCount: number;
    lowCount: number;
  };
  riskMatrix: {
    lowCount: number;
    mediumCount: number;
    highCount: number;
    criticalCount: number;
  };
}

// ==========================================
// MIGRATION PLANNING ENGINE TYPES
// ==========================================

export interface DependencyNode {
  tableName: string;
  dependsOn: string[];
  referencedBy: string[];
  hasCircularDependency: boolean;
}

export interface DependencyAnalysis {
  creationOrder: string[];
  updateOrder: string[];
  validationOrder: string[];
  dependencyGraph: Record<string, DependencyNode>;
  circularDependencies: Array<{ tables: string[]; description: string }>;
}

export interface MigrationStage {
  stageNumber: number;
  stageId: string;
  name: string;
  description: string;
  tables: string[];
  taskCount: number;
  estimatedDuration: string;
  risk: RiskLevel;
}

export interface MigrationTask {
  id: string;
  stageId: string;
  stageNumber: number;
  title: string;
  description: string;
  targetEntity: string;
  taskType: 'CREATE_EXTENSION' | 'CREATE_TABLE' | 'ALTER_TABLE_ADD_COLUMN' | 'ALTER_TABLE_MODIFY_COLUMN' | 'ADD_PRIMARY_KEY' | 'ADD_FOREIGN_KEY' | 'ADD_CONSTRAINT' | 'CREATE_INDEX' | 'DROP_CONSTRAINT' | 'DROP_INDEX' | 'DATA_TRANSFORMATION';
  dependencies: string[];
  estimatedDuration: string;
  risk: RiskLevel;
  rollbackAvailability: 'SAFE' | 'MANUAL' | 'IRREVERSIBLE';
  rollbackReason: string;
}

export interface RollbackStagePlan {
  stageId: string;
  stageName: string;
  rollbackStrategy: 'SAFE' | 'MANUAL' | 'IRREVERSIBLE';
  reason: string;
  steps: string[];
}

export interface RollbackPlan {
  overallStrategy: 'SAFE' | 'MANUAL' | 'IRREVERSIBLE';
  summary: string;
  stageRollbacks: RollbackStagePlan[];
}

export interface RiskCategoryItem {
  category: 'DATA_LOSS' | 'CONSTRAINT_FAILURE' | 'PERFORMANCE' | 'LOCKING' | 'APPLICATION_COMPATIBILITY';
  title: string;
  description: string;
  affectedEntities: string[];
  riskLevel: RiskLevel;
  mitigation: string;
}

export interface MigrationRisks {
  overallRiskLevel: RiskLevel;
  riskSummary: {
    lowCount: number;
    mediumCount: number;
    highCount: number;
    criticalCount: number;
  };
  risksByCategory: RiskCategoryItem[];
}

export interface ValidationChecklist {
  beforeMigration: Array<{ id: string; check: string; details: string; required: boolean }>;
  duringMigration: Array<{ id: string; check: string; details: string; required: boolean }>;
  afterMigration: Array<{ id: string; check: string; details: string; required: boolean }>;
}

export interface MigrationPlan {
  timestamp: string;
  targetFile: string;
  schemaHash: string;
  summary: {
    totalStages: number;
    totalTasks: number;
    estimatedTotalDuration: string;
    overallRisk: RiskLevel;
    overallRollbackStrategy: 'SAFE' | 'MANUAL' | 'IRREVERSIBLE';
  };
  dependencies: DependencyAnalysis;
  stages: MigrationStage[];
  executionPlan: MigrationTask[];
  rollbackPlan: RollbackPlan;
  risks: MigrationRisks;
  validationChecklist: ValidationChecklist;
  recommendations: string[];
}

