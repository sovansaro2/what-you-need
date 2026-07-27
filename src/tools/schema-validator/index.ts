/**
 * WYN Database Intelligence Layer - Engineering Validation Engine CLI Entrypoint
 * Step 11.2.4 — Engineering Validation Engine
 */

import fs from 'fs';
import path from 'path';
import { DependencyValidator } from './validators/dependencyValidator';
import { MappingValidator } from './validators/mappingValidator';
import { MigrationValidator } from './validators/migrationValidator';
import { RollbackValidator } from './validators/rollbackValidator';
import { RiskValidator } from './validators/riskValidator';
import { HealthValidator } from './validators/healthValidator';
import { CoverageValidator } from './validators/coverageValidator';
import { RecommendationEngine } from './validators/recommendationEngine';
import { ValidationWriter } from './report/validationWriter';
import { SqlSchemaParser } from '../schema-comparator/parser/sqlSchemaParser';
import { InspectorDataReader } from '../schema-comparator/parser/inspectorDataReader';
import {
  ValidatorOptions,
  EngineeringValidation,
  ValidationFinding,
  ApprovalDecision,
} from './types';

function readJsonFile<T>(filePath: string): T | null {
  if (!fs.existsSync(filePath)) return null;
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content) as T;
  } catch {
    return null;
  }
}

function parseArgs(args: string[]): ValidatorOptions {
  const options: ValidatorOptions = {};

  for (const arg of args) {
    if (arg === '--verbose') {
      options.verbose = true;
    } else if (arg.startsWith('--target=')) {
      options.targetSqlPath = arg.substring('--target='.length);
    } else if (arg.startsWith('--inspectorDir=')) {
      options.inspectorDir = arg.substring('--inspectorDir='.length);
    } else if (arg.startsWith('--comparatorDir=')) {
      options.comparatorDir = arg.substring('--comparatorDir='.length);
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
WYN Engineering Validation Engine CLI v1.0.0
-------------------------------------------
Usage: npm run db:validate [-- [options]]

Options:
  --target=<path>         Path to target SQL DDL file (default: database_v1.sql)
  --inspectorDir=<path>   Path to inspector report directory (default: reports/db-inspector)
  --comparatorDir=<path>  Path to comparator report directory (default: reports/schema-comparator)
  --outputDir=<path>      Path to output report directory (default: reports/schema-validator)
  --verbose               Enable verbose logging output
  --help, -h              Show this help message

Examples:
  npm run db:validate
  npm run db:validate -- --verbose
  npm run db:validate -- --target=database_v1.sql
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

  const comparatorDir = options.comparatorDir
    ? path.resolve(process.cwd(), options.comparatorDir)
    : path.resolve(process.cwd(), 'reports/schema-comparator');

  const outputDir = options.outputDir
    ? path.resolve(process.cwd(), options.outputDir)
    : path.resolve(process.cwd(), 'reports/schema-validator');

  console.log('====================================================');
  console.log('    WYN ENGINEERING VALIDATION ENGINE v1.0.0        ');
  console.log('====================================================');
  console.log(`[Config] Target DDL File : ${targetSqlPath}`);
  console.log(`[Config] Inspector Dir   : ${inspectorDir}`);
  console.log(`[Config] Comparator Dir  : ${comparatorDir}`);
  console.log(`[Config] Output Dir      : ${outputDir}`);
  console.log(`[Config] Flags           : verbose=${!!options.verbose}`);
  console.log('----------------------------------------------------');

  try {
    // 1. Read Input Data
    const inspectorReader = new InspectorDataReader();
    const inspectorData = inspectorReader.readInspectorReports(inspectorDir);

    const parser = new SqlSchemaParser();
    const targetSchema = fs.existsSync(targetSqlPath) ? parser.parseFile(targetSqlPath) : null;

    const schemaComparison = readJsonFile<any>(path.join(comparatorDir, 'schema_comparison.json'));
    const healthData = readJsonFile<any>(path.join(comparatorDir, 'database_health.json'));
    const mappingReport = readJsonFile<any>(path.join(comparatorDir, 'mapping_report.json'));
    const tableMappings = readJsonFile<any[]>(path.join(comparatorDir, 'table_mappings.json'));
    const columnMappings = readJsonFile<any[]>(path.join(comparatorDir, 'column_mappings.json'));
    const migrationPlan = readJsonFile<any>(path.join(comparatorDir, 'migration_plan.json'));
    const dependenciesData = readJsonFile<any>(path.join(comparatorDir, 'migration_dependencies.json'));
    const risksData = readJsonFile<any>(path.join(comparatorDir, 'migration_risks.json'));

    // 2. Execute Validation Engine Modules
    const dependencyVal = new DependencyValidator().validate(migrationPlan, dependenciesData);
    const mappingVal = new MappingValidator().validate(mappingReport, tableMappings || [], columnMappings || []);
    const migrationVal = new MigrationValidator().validate(migrationPlan, schemaComparison);
    const rollbackVal = new RollbackValidator().validate(migrationPlan, null);
    const riskVal = new RiskValidator().validate(migrationPlan, risksData);
    const healthVal = new HealthValidator().validate(healthData, schemaComparison);
    const coverageVal = new CoverageValidator().validate(inspectorData, targetSchema, schemaComparison);

    const results = {
      dependency: dependencyVal,
      mapping: mappingVal,
      migration: migrationVal,
      rollback: rollbackVal,
      risk: riskVal,
      health: healthVal,
      coverage: coverageVal,
    };

    // 3. Collect All Findings
    const allFindings: ValidationFinding[] = [];
    Object.values(results).forEach((res) => {
      allFindings.push(...res.findings);
    });

    const criticalFindings = allFindings.filter((f) => f.severity === 'CRITICAL');
    const warnings = allFindings.filter((f) => f.severity === 'WARNING');

    // 4. Recommendation Engine
    const recEngine = new RecommendationEngine();
    const recommendations = recEngine.generateRecommendations(criticalFindings, warnings, results);

    // 5. Compute Final Decision & Summary
    let approvalDecision: ApprovalDecision = 'APPROVED';
    if (criticalFindings.length > 0 || Object.values(results).some((r) => r.status === 'FAILED')) {
      approvalDecision = 'REJECTED';
    } else if (
      warnings.length > 0 ||
      healthVal.score < 80 ||
      Object.values(results).some((r) => r.status === 'WARNING')
    ) {
      approvalDecision = 'APPROVED WITH WARNINGS';
    }

    const healthScore = healthVal.score;
    const healthStatus: 'HEALTHY' | 'WARNING' | 'CRITICAL' = healthScore >= 80 ? 'HEALTHY' : healthScore >= 50 ? 'WARNING' : 'CRITICAL';

    const totalChecks = Object.values(results).length;
    const passedChecks = Object.values(results).filter((r) => r.status === 'PASSED').length;
    const warningChecks = Object.values(results).filter((r) => r.status === 'WARNING').length;
    const failedChecks = Object.values(results).filter((r) => r.status === 'FAILED').length;

    const summary = {
      totalChecks,
      passedChecks,
      warningChecks,
      failedChecks,
      criticalFindingsCount: criticalFindings.length,
      warningFindingsCount: warnings.length,
      healthScore,
      healthStatus,
      finalDecision: approvalDecision,
    };

    const targetFile = schemaComparison?.targetFile || 'database_v1.sql';
    const schemaHash = schemaComparison?.schemaHash || 'UNKNOWN_HASH';

    const engineeringValidation: EngineeringValidation = {
      timestamp: new Date().toISOString(),
      targetFile,
      schemaHash,
      summary,
      results,
      criticalFindings,
      warnings,
      recommendations,
      approvalDecision,
    };

    // 6. Write Artifacts
    const writer = new ValidationWriter();
    const writtenPaths = writer.writeValidationArtifacts(engineeringValidation, outputDir);

    console.log('[Status] Engineering Validation Complete!');
    console.log(`- Final Decision      : ${approvalDecision}`);
    console.log(`- Health Score        : ${healthScore} / 100 (${healthStatus})`);
    console.log(`- Checks Passed       : ${passedChecks} / ${totalChecks}`);
    console.log(`- Critical Findings   : ${criticalFindings.length}`);
    console.log(`- Warnings            : ${warnings.length}`);
    console.log('----------------------------------------------------');
    console.log('Generated Validation Artifacts:');
    console.log(`  └─ [JSON] ${writtenPaths.validationJsonPath}`);
    console.log(`  └─ [MD]   ${writtenPaths.validationMdPath}`);
    console.log(`  └─ [JSON] ${writtenPaths.summaryJsonPath}`);
    console.log(`  └─ [MD]   ${writtenPaths.approvalMdPath}`);
    console.log('====================================================');
  } catch (error: any) {
    console.error('❌ Engineering Validation Engine Failed:', error.message || error);
    process.exit(1);
  }
}

main();
