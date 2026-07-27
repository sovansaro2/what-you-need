/**
 * WYN Database Inspector - Type Definitions
 * Phase 11 — Database Intelligence Layer
 * Step 11.1.1 — Core Engine Foundation
 */

export type AuditSeverity = 'critical' | 'high' | 'medium' | 'low' | 'info';

export interface DatabaseVersion {
  versionString: string;
  majorVersion: number;
  isSupported: boolean;
  connectedAt: string;
}

export interface ColumnSummary {
  name: string;
  dataType: string;
  isNullable: boolean;
  defaultValue: string | null;
  isPrimaryKey: boolean;
  isForeignKey: boolean;
  foreignTable?: string;
  foreignColumn?: string;
  comment?: string;
}

export interface TableSummary {
  tableName: string;
  schema: string;
  rowCount: number;
  columns: ColumnSummary[];
  indexesCount: number;
  foreignKeysCount: number;
  hasPrimaryKey: boolean;
  isRLSEnabled?: boolean;
}

export interface OutputFile {
  filePath: string;
  format: 'json' | 'markdown' | 'snapshot' | 'text';
  bytesWritten: number;
  createdAt: string;
}

export interface InspectorContext {
  supabaseUrl: string;
  supabaseKey: string;
  outputDirectory: string;
  sampleLimit: number;
  options: {
    audit: boolean;
    snapshot: boolean;
    verbose: boolean;
    all: boolean;
    exact: boolean;
    fast: boolean;
  };
  schemaScope: 'public' | 'all';
  countingStrategy: 'fast' | 'exact';
  startTime: Date;
}

export interface AuditFinding {
  severity: AuditSeverity;
  code: string;
  title: string;
  description: string;
  table?: string;
  column?: string;
  recommendation: string;
}

export interface InspectorResult {
  moduleName: string;
  status: 'success' | 'warning' | 'error' | 'skipped';
  executionTimeMs: number;
  tablesAnalyzed: number;
  findings: AuditFinding[];
  summaryData: Record<string, any>;
  errorMessage?: string;
}

export interface ExecutionSummary {
  totalModules: number;
  passedModules: number;
  failedModules: number;
  skippedModules: number;
  totalFindings: number;
  findingsBySeverity: Record<AuditSeverity, number>;
  totalExecutionTimeMs: number;
  timestamp: string;
  outputFiles: OutputFile[];
  status: 'success' | 'warning' | 'failure';
  inspectionScope: string;
  countingStrategy: 'fast' | 'exact';
  schemaHash: string;
  databaseVersion: string;
  schemasInspected: string[];
  objectsInspected: number;
  warnings: string[];
  rlsCoverage?: string;
  policiesCount?: number;
  functionsCount?: number;
  triggersCount?: number;
  viewsCount?: number;
  materializedViewsCount?: number;
  extensionsCount?: number;
  sequencesCount?: number;
}

export interface InspectorModule {
  name: string;
  description: string;
  run(context: InspectorContext): Promise<InspectorResult>;
}
