/**
 * WYN Database Intelligence Layer - Schema Comparator Engine
 * Main CLI entrypoint supporting Comparator Core, Intelligent Mapping, and Migration Planning Engine.
 */

import path from 'path';
import { SchemaComparator } from './comparator/schemaComparator';
import { ComparisonWriter } from './report/comparisonWriter';
import { MappingEngine } from './mapping/mappingEngine';
import { MigrationPlanner } from './planner/migrationPlanner';
import { InspectorDataReader } from './parser/inspectorDataReader';
import { ComparatorOptions } from './types';

function parseArgs(args: string[]): ComparatorOptions {
  const options: ComparatorOptions = {};

  for (const arg of args) {
    if (arg === '--verbose') {
      options.verbose = true;
    } else if (arg === '--summary') {
      options.summaryOnly = true;
    } else if (arg === '--mapping') {
      options.mapping = true;
    } else if (arg === '--plan') {
      options.plan = true;
      options.mapping = true; // Planning includes mapping intelligence
    } else if (arg.startsWith('--target=')) {
      options.targetSqlPath = arg.substring('--target='.length);
    } else if (arg.startsWith('--inputDir=')) {
      options.inspectorDir = arg.substring('--inputDir='.length);
    } else if (arg.startsWith('--outputDir=')) {
      options.outputDir = arg.substring('--outputDir='.length);
    }
  }

  return options;
}

async function main() {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
WYN Schema Comparator Engine CLI v1.0.0
---------------------------------------
Usage: npm run db:compare [-- [options]]

Options:
  --target=<path>      Path to target SQL DDL file (default: database_v1.sql)
  --inputDir=<path>    Path to inspector report directory (default: reports/db-inspector)
  --outputDir=<path>   Path to output report directory (default: reports/schema-comparator)
  --mapping            Run Intelligent Entity Mapping Engine
  --plan               Run Migration Planning Engine (includes mapping)
  --summary            Generate summary report only
  --verbose            Enable verbose logging output
  --help, -h           Show this help message

Examples:
  npm run db:compare
  npm run db:compare -- --mapping
  npm run db:compare -- --plan
  npm run db:compare -- --target=database_v1.sql --plan
`);
    process.exit(0);
  }

  const options = parseArgs(args);

  const targetSqlPath = options.targetSqlPath
    ? path.resolve(process.cwd(), options.targetSqlPath)
    : path.resolve(process.cwd(), 'database_v1.sql');

  const inspectorDir = options.inspectorDir
    ? path.resolve(process.cwd(), options.inspectorDir)
    : path.resolve(process.cwd(), 'reports/db-inspector');

  const outputDir = options.outputDir
    ? path.resolve(process.cwd(), options.outputDir)
    : path.resolve(process.cwd(), 'reports/schema-comparator');

  console.log('====================================================');
  console.log('      WYN SCHEMA COMPARATOR ENGINE v1.0.0           ');
  console.log('====================================================');
  console.log(`[Config] Target DDL File : ${targetSqlPath}`);
  console.log(`[Config] Inspector Dir   : ${inspectorDir}`);
  console.log(`[Config] Output Dir      : ${outputDir}`);
  console.log(`[Config] Flags           : verbose=${!!options.verbose}, mapping=${!!options.mapping}, plan=${!!options.plan}`);
  console.log('----------------------------------------------------');

  try {
    // 1. Comparator Core
    const comparator = new SchemaComparator();
    const comparison = comparator.compareSchemas({
      targetSqlPath,
      inspectorDir,
      outputDir,
      verbose: options.verbose,
      summaryOnly: options.summaryOnly,
    });

    const writer = new ComparisonWriter();
    const paths = writer.writeArtifacts(comparison, outputDir);

    console.log('[Status] Comparison Core Complete!');
    console.log(`- Target DDL File    : ${comparison.targetFile}`);
    console.log(`- Schema Hash        : ${comparison.schemaHash}`);
    console.log(`- Schema Match Rate  : ${comparison.summary.schemaMatchPercentage}%`);
    console.log(`- Overall Health     : ${comparison.health.overallScore} / 100 (${comparison.health.completeness.status})`);
    console.log(`- Total Differences  : ${comparison.summary.totalDifferences}`);

    // 2. Intelligent Mapping Engine (if --mapping or --plan is passed)
    if (options.mapping || options.plan) {
      console.log('----------------------------------------------------');
      console.log('[Status] Executing Intelligent Mapping Engine...');

      const targetSchema = comparator.getTargetSchema(targetSqlPath);
      const inspectorReader = new InspectorDataReader();
      const inspectorData = inspectorReader.readInspectorReports(inspectorDir);

      const mappingEngine = new MappingEngine();
      const mappingReport = mappingEngine.generateMappingReport(
        targetSchema,
        inspectorData.tables,
        inspectorData.columns,
        inspectorData.foreignKeys,
        comparison.tableComparison,
        comparison.columnDifferences,
        comparison.schemaHash
      );

      mappingEngine.writeMappingArtifacts(mappingReport, outputDir);

      console.log(`- Table Mappings     : ${mappingReport.tableMappings.length}`);
      console.log(`- Column Mappings    : ${mappingReport.columnMappings.length}`);
      console.log(`- Relationships      : ${mappingReport.relationshipMappings.length}`);
      console.log(`- Rename Candidates  : ${mappingReport.renameCandidates.length}`);
      console.log(`- Migration Hints    : ${mappingReport.migrationHints.length}`);
    }

    // 3. Migration Planning Engine (if --plan is passed)
    if (options.plan) {
      console.log('----------------------------------------------------');
      console.log('[Status] Executing Migration Planning Engine...');

      const targetSchema = comparator.getTargetSchema(targetSqlPath);
      const migrationPlanner = new MigrationPlanner();

      const plan = migrationPlanner.createMigrationPlan(targetSchema, comparison);
      const planPaths = migrationPlanner.writePlanArtifacts(plan, outputDir);

      console.log(`- Total Stages       : ${plan.summary.totalStages}`);
      console.log(`- Total Tasks        : ${plan.summary.totalTasks}`);
      console.log(`- Total Duration     : ${plan.summary.estimatedTotalDuration}`);
      console.log(`- Overall Risk Level : ${plan.summary.overallRisk}`);
      console.log(`- Rollback Strategy  : ${plan.summary.overallRollbackStrategy}`);
      console.log('----------------------------------------------------');
      console.log('Generated Migration Plan Artifacts:');
      console.log(`  └─ [JSON] ${planPaths.planJsonPath}`);
      console.log(`  └─ [MD]   ${planPaths.planMdPath}`);
      console.log(`  └─ [JSON] ${planPaths.stagesJsonPath}`);
      console.log(`  └─ [JSON] ${planPaths.dependenciesJsonPath}`);
      console.log(`  └─ [JSON] ${planPaths.risksJsonPath}`);
      console.log(`  └─ [MD]   ${planPaths.rollbackMdPath}`);
    }

    console.log('====================================================');
  } catch (error: any) {
    console.error('❌ Schema Comparator Failed:', error.message || error);
    process.exit(1);
  }
}

main();
