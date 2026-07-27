/**
 * WYN Database Inspector - Inspector Runner Engine
 * Coordinates context initialization, health check, module execution, and summary aggregation.
 */

import { DatabaseInspectorConfig, loadConfig, validateConfig } from '../config';
import { DatabaseClient } from './databaseClient';
import { ReportWriter } from './reportWriter';
import {
  AuditSeverity,
  ExecutionSummary,
  InspectorContext,
  InspectorModule,
  InspectorResult,
  OutputFile,
} from '../types';
import {
  calculateSchemaFingerprint,
  getSchemasToInspect,
} from '../inspectors/inspectorUtils';

export interface InspectorRunnerOptions {
  audit?: boolean;
  snapshot?: boolean;
  verbose?: boolean;
  all?: boolean;
  exact?: boolean;
  fast?: boolean;
  customConfig?: DatabaseInspectorConfig;
}

export class InspectorRunner {
  private config: DatabaseInspectorConfig;
  private dbClient: DatabaseClient;
  private reportWriter: ReportWriter;
  private modules: InspectorModule[] = [];
  private context: InspectorContext | null = null;

  constructor(options: InspectorRunnerOptions = {}) {
    this.config = options.customConfig || loadConfig();
    this.dbClient = new DatabaseClient(this.config);
    this.reportWriter = new ReportWriter(this.config.outputDirectory);
  }

  /**
   * Registers a single inspector module.
   */
  public registerModule(module: InspectorModule): void {
    this.modules.push(module);
  }

  /**
   * Registers multiple inspector modules.
   */
  public registerModules(modules: InspectorModule[]): void {
    this.modules.push(...modules);
  }

  /**
   * Initializes context, validates configuration, performs health check, and prepares output dir.
   */
  public async initialize(options: InspectorRunnerOptions): Promise<InspectorContext> {
    // 1. Validate configuration
    validateConfig(this.config);

    // 2. Perform health check & connection
    const isHealthy = await this.dbClient.connect();
    if (!isHealthy) {
      throw new Error(
        `[InspectorRunner Error] Database health check failed. Cannot connect to Supabase at ${this.config.supabaseUrl}`
      );
    }

    // 3. Prepare output directory
    await this.reportWriter.prepareOutputDirectory();

    // 4. Construct context
    const isAll = options.all ?? false;
    const isExact = options.exact ?? false;
    const isFast = options.fast ?? !isExact;
    const countingStrategy: 'fast' | 'exact' = isExact ? 'exact' : 'fast';
    const schemaScope: 'public' | 'all' = isAll ? 'all' : 'public';

    this.context = {
      supabaseUrl: this.config.supabaseUrl,
      supabaseKey: this.config.supabaseServiceRoleKey,
      outputDirectory: this.config.outputDirectory,
      sampleLimit: this.config.defaultSampleLimit,
      options: {
        audit: options.audit ?? false,
        snapshot: options.snapshot ?? false,
        verbose: options.verbose ?? false,
        all: isAll,
        exact: isExact,
        fast: isFast,
      },
      schemaScope,
      countingStrategy,
      startTime: new Date(),
    };

    return this.context;
  }

  /**
   * Executes registered inspector modules and compiles the execution summary.
   */
  public async run(options: InspectorRunnerOptions = {}): Promise<ExecutionSummary> {
    const startTime = Date.now();
    const context = await this.initialize(options);
    const results: InspectorResult[] = [];
    const outputFiles: OutputFile[] = [];

    // Execute registered modules sequentially
    for (const module of this.modules) {
      const moduleStartTime = Date.now();
      try {
        if (context.options.verbose) {
          console.log(`[InspectorRunner] Executing module: ${module.name}...`);
        }
        const result = await module.run(context);
        results.push(result);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        results.push({
          moduleName: module.name,
          status: 'error',
          executionTimeMs: Date.now() - moduleStartTime,
          tablesAnalyzed: 0,
          findings: [
            {
              severity: 'high',
              code: 'MODULE_EXECUTION_ERROR',
              title: `Execution failure in ${module.name}`,
              description: message,
              recommendation: 'Inspect module logic and database permissions.',
            },
          ],
          summaryData: {},
          errorMessage: message,
        });
      }
    }

    // Aggregate summary metrics
    let totalFindings = 0;
    const findingsBySeverity: Record<AuditSeverity, number> = {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
      info: 0,
    };

    let passedModules = 0;
    let failedModules = 0;
    let skippedModules = 0;

    let tablesRecords: any[] = [];
    let columnsRecords: any[] = [];
    let primaryKeysRecords: any[] = [];
    let foreignKeysRecords: any[] = [];
    let constraintsRecords: any[] = [];
    let indexesRecords: any[] = [];
    let rlsRecords: any[] = [];
    let policiesRecords: any[] = [];
    let functionsRecords: any[] = [];
    let triggersRecords: any[] = [];
    let viewsRecords: any[] = [];
    let materializedViewsRecords: any[] = [];
    let extensionsRecords: any[] = [];
    let sequencesRecords: any[] = [];

    for (const result of results) {
      if (result.status === 'success') passedModules++;
      else if (result.status === 'error') failedModules++;
      else if (result.status === 'skipped') skippedModules++;

      for (const finding of result.findings) {
        totalFindings++;
        if (findingsBySeverity[finding.severity] !== undefined) {
          findingsBySeverity[finding.severity]++;
        }
      }

      if (result.moduleName === 'TablesInspector' && result.summaryData.records) {
        tablesRecords = result.summaryData.records;
      } else if (result.moduleName === 'ColumnsInspector' && result.summaryData.records) {
        columnsRecords = result.summaryData.records;
      } else if (result.moduleName === 'PrimaryKeysInspector' && result.summaryData.records) {
        primaryKeysRecords = result.summaryData.records;
      } else if (result.moduleName === 'ForeignKeysInspector' && result.summaryData.records) {
        foreignKeysRecords = result.summaryData.records;
      } else if (result.moduleName === 'ConstraintsInspector' && result.summaryData.records) {
        constraintsRecords = result.summaryData.records;
      } else if (result.moduleName === 'IndexesInspector' && result.summaryData.records) {
        indexesRecords = result.summaryData.records;
      } else if (result.moduleName === 'RLSInspector' && result.summaryData.records) {
        rlsRecords = result.summaryData.records;
      } else if (result.moduleName === 'PoliciesInspector' && result.summaryData.records) {
        policiesRecords = result.summaryData.records;
      } else if (result.moduleName === 'FunctionsInspector' && result.summaryData.records) {
        functionsRecords = result.summaryData.records;
      } else if (result.moduleName === 'TriggersInspector' && result.summaryData.records) {
        triggersRecords = result.summaryData.records;
      } else if (result.moduleName === 'ViewsInspector' && result.summaryData.records) {
        viewsRecords = result.summaryData.records;
      } else if (result.moduleName === 'MaterializedViewsInspector' && result.summaryData.records) {
        materializedViewsRecords = result.summaryData.records;
      } else if (result.moduleName === 'ExtensionsInspector' && result.summaryData.records) {
        extensionsRecords = result.summaryData.records;
      } else if (result.moduleName === 'SequencesInspector' && result.summaryData.records) {
        sequencesRecords = result.summaryData.records;
      }
    }

    const schemaHash = calculateSchemaFingerprint(
      tablesRecords,
      columnsRecords,
      primaryKeysRecords,
      foreignKeysRecords,
      constraintsRecords,
      indexesRecords,
      rlsRecords,
      policiesRecords,
      functionsRecords,
      triggersRecords,
      viewsRecords,
      materializedViewsRecords,
      extensionsRecords,
      sequencesRecords
    );

    const schemasInspected = getSchemasToInspect(context.options.all);
    const objectsInspected =
      tablesRecords.length +
      columnsRecords.length +
      primaryKeysRecords.length +
      foreignKeysRecords.length +
      constraintsRecords.length +
      indexesRecords.length +
      rlsRecords.length +
      policiesRecords.length +
      functionsRecords.length +
      triggersRecords.length +
      viewsRecords.length +
      materializedViewsRecords.length +
      extensionsRecords.length +
      sequencesRecords.length;

    const inspectionScope = context.options.all
      ? `all (${schemasInspected.join(', ')})`
      : 'public';

    const enabledRLS = rlsRecords.filter((r) => r.rlsEnabled).length;
    const rlsCoverage = rlsRecords.length > 0
      ? `${((enabledRLS / rlsRecords.length) * 100).toFixed(1)}%`
      : '100.0%';

    const totalExecutionTimeMs = Date.now() - startTime;
    const timestamp = new Date().toISOString();

    // Generate schema_hash.txt
    const hashFileContent = [
      `Schema Hash: ${schemaHash}`,
      `Generated At: ${timestamp}`,
      `Inspection Scope: ${inspectionScope}`,
      `Counting Strategy: ${context.countingStrategy === 'exact' ? 'Exact' : 'Estimated'}`,
      `Database Version: PostgreSQL 15+ (Supabase Cloud)`,
    ].join('\n');

    const hashFile = await this.reportWriter.writeText('schema_hash.txt', hashFileContent);
    outputFiles.push(hashFile);

    const summary: ExecutionSummary = {
      totalModules: this.modules.length,
      passedModules,
      failedModules,
      skippedModules,
      totalFindings,
      findingsBySeverity,
      totalExecutionTimeMs,
      timestamp,
      outputFiles,
      status: failedModules > 0 ? 'failure' : 'success',
      inspectionScope,
      countingStrategy: context.countingStrategy,
      schemaHash,
      databaseVersion: 'PostgreSQL 15+ (Supabase Cloud)',
      schemasInspected,
      objectsInspected,
      warnings: [],
      rlsCoverage,
      policiesCount: policiesRecords.length,
      functionsCount: functionsRecords.length,
      triggersCount: triggersRecords.length,
      viewsCount: viewsRecords.length,
      materializedViewsCount: materializedViewsRecords.length,
      extensionsCount: extensionsRecords.length,
      sequencesCount: sequencesRecords.length,
    };

    // Save execution_summary.json
    const summaryJsonFile = await this.reportWriter.writeJson(
      'execution_summary.json',
      summary
    );
    outputFiles.push(summaryJsonFile);

    // Write Markdown report if audit option is enabled or verbose
    if (context.options.audit || context.options.verbose) {
      const markdownContent = this.generateMarkdownSummary(summary, results);
      const mdFile = await this.reportWriter.writeMarkdown(
        `inspector_report_${Date.now()}`,
        markdownContent
      );
      outputFiles.push(mdFile);
    }

    // Disconnect database client safely
    await this.dbClient.disconnect();

    return summary;
  }

  /**
   * Helper to format execution summary into Markdown.
   */
  private generateMarkdownSummary(
    summary: ExecutionSummary,
    results: InspectorResult[]
  ): string {
    const lines: string[] = [
      '# WYN Database Inspector Report',
      `**Timestamp**: ${summary.timestamp}`,
      `**Status**: ${summary.status.toUpperCase()}`,
      `**Execution Time**: ${summary.totalExecutionTimeMs} ms`,
      '',
      '## Execution Overview',
      `- **Total Modules**: ${summary.totalModules}`,
      `- **Passed**: ${summary.passedModules}`,
      `- **Failed**: ${summary.failedModules}`,
      `- **Total Findings**: ${summary.totalFindings}`,
      '',
      '### Findings by Severity',
      `- Critical: ${summary.findingsBySeverity.critical}`,
      `- High: ${summary.findingsBySeverity.high}`,
      `- Medium: ${summary.findingsBySeverity.medium}`,
      `- Low: ${summary.findingsBySeverity.low}`,
      `- Info: ${summary.findingsBySeverity.info}`,
      '',
    ];

    if (results.length > 0) {
      lines.push('## Module Details');
      for (const res of results) {
        lines.push(`### ${res.moduleName} (${res.status.toUpperCase()})`);
        lines.push(`- **Execution Time**: ${res.executionTimeMs} ms`);
        lines.push(`- **Tables Analyzed**: ${res.tablesAnalyzed}`);
        if (res.findings.length > 0) {
          lines.push('#### Audit Findings:');
          for (const f of res.findings) {
            lines.push(
              `- **[${f.severity.toUpperCase()}] ${f.title}**: ${f.description}`
            );
          }
        }
        lines.push('');
      }
    } else {
      lines.push('*(No inspector modules were registered in this execution session.)*');
    }

    return lines.join('\n');
  }

  /**
   * Returns registered modules list for inspection.
   */
  public getModules(): InspectorModule[] {
    return [...this.modules];
  }
}
