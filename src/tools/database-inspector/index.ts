/**
 * WYN Database Inspector - CLI Entry Point
 * Executes database inspection tool suite with command-line arguments.
 * Command: npm run db:inspect [--audit] [--snapshot] [--verbose]
 */

import { InspectorRunner } from './core/inspectorRunner';
import { loadConfig } from './config';
import { TablesInspector } from './inspectors/tablesInspector';
import { ColumnsInspector } from './inspectors/columnsInspector';
import { PrimaryKeysInspector } from './inspectors/primaryKeysInspector';
import { ForeignKeysInspector } from './inspectors/foreignKeysInspector';
import { ConstraintsInspector } from './inspectors/constraintsInspector';
import { IndexesInspector } from './inspectors/indexesInspector';
import { RLSInspector } from './inspectors/rlsInspector';
import { PoliciesInspector } from './inspectors/policiesInspector';
import { FunctionsInspector } from './inspectors/functionsInspector';
import { TriggersInspector } from './inspectors/triggersInspector';
import { ViewsInspector } from './inspectors/viewsInspector';
import { MaterializedViewsInspector } from './inspectors/materializedViewsInspector';
import { ExtensionsInspector } from './inspectors/extensionsInspector';
import { SequencesInspector } from './inspectors/sequencesInspector';

async function main() {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
WYN Database Inspector CLI v1.0.0
---------------------------------
Usage: npm run db:inspect [-- [options]]

Options:
  --audit      Perform audit checks and security inspection
  --snapshot   Generate schema snapshot
  --all        Inspect all schemas (public, auth, storage, extensions, realtime)
  --exact      Use exact row counts (COUNT(*)) instead of fast estimates
  --fast       Use fast estimated row counts (default)
  --verbose    Enable verbose logging output
  --help, -h   Show this help message

Examples:
  npm run db:inspect
  npm run db:inspect -- --exact
  npm run db:inspect -- --all --audit
`);
    process.exit(0);
  }

  const options = {
    audit: args.includes('--audit'),
    snapshot: args.includes('--snapshot'),
    verbose: args.includes('--verbose'),
    all: args.includes('--all'),
    exact: args.includes('--exact'),
    fast: args.includes('--fast') || !args.includes('--exact'),
  };

  console.log('====================================================');
  console.log('       WYN DATABASE INSPECTOR ENGINE v1.0.0        ');
  console.log('====================================================');

  try {
    const config = loadConfig();
    const serviceRoleDetected = Boolean(config.supabaseServiceRoleKey && config.supabaseServiceRoleKey.trim() !== '');
    const urlConfigured = Boolean(config.supabaseUrl && config.supabaseUrl.trim() !== '');

    console.log(`✓ Target URL         : ${urlConfigured ? config.supabaseUrl : '❌ Missing (Set SUPABASE_URL in .env.toolkit)'}`);
    console.log(`✓ Environment Loaded : ${config.environmentLoaded}`);
    console.log(`✓ Service Role       : ${serviceRoleDetected ? '✓ Detected (Full Admin Service Role Privileges)' : '❌ Not Detected (Requires SUPABASE_SERVICE_ROLE_KEY)'}`);
    console.log(`✓ Output Directory   : ${config.outputDirectory}`);
    console.log(`[Config] Scope       : ${options.all ? 'all (public, auth, storage, extensions, realtime)' : 'public'}`);
    console.log(`[Config] Counting    : ${options.exact ? 'Exact (COUNT(*))' : 'Fast (Estimated)'}`);
    console.log('----------------------------------------------------');

    const runner = new InspectorRunner({
      audit: options.audit,
      snapshot: options.snapshot,
      verbose: options.verbose,
      all: options.all,
      exact: options.exact,
      fast: options.fast,
      customConfig: config,
    });

    // Register all 14 database inspectors sequentially
    runner.registerModules([
      new TablesInspector(),
      new ColumnsInspector(),
      new PrimaryKeysInspector(),
      new ForeignKeysInspector(),
      new ConstraintsInspector(),
      new IndexesInspector(),
      new RLSInspector(),
      new PoliciesInspector(),
      new FunctionsInspector(),
      new TriggersInspector(),
      new ViewsInspector(),
      new MaterializedViewsInspector(),
      new ExtensionsInspector(),
      new SequencesInspector(),
    ]);

    console.log('[Status] Connecting and performing health check...');
    const summary = await runner.run(options);

    console.log('----------------------------------------------------');
    console.log('[Status] Execution Complete!');
    console.log(`- Connection Status : ONLINE`);
    console.log(`- Database Version  : ${summary.databaseVersion}`);
    console.log(`- Inspection Scope  : ${summary.inspectionScope}`);
    console.log(`- Counting Strategy : ${summary.countingStrategy === 'exact' ? 'Exact' : 'Estimated'}`);
    console.log(`- Schemas Inspected : ${summary.schemasInspected.join(', ')}`);
    console.log(`- Objects Inspected : ${summary.objectsInspected}`);
    console.log(`- RLS Coverage      : ${summary.rlsCoverage}`);
    console.log(`- Policies Count    : ${summary.policiesCount}`);
    console.log(`- Functions Count   : ${summary.functionsCount}`);
    console.log(`- Triggers Count    : ${summary.triggersCount}`);
    console.log(`- Views Count       : ${summary.viewsCount}`);
    console.log(`- Materialized Views: ${summary.materializedViewsCount}`);
    console.log(`- Extensions Count  : ${summary.extensionsCount}`);
    console.log(`- Sequences Count   : ${summary.sequencesCount}`);
    console.log(`- Schema Hash       : ${summary.schemaHash}`);
    console.log(`- Total Execution   : ${summary.totalExecutionTimeMs} ms`);
    console.log(`- Modules Run       : ${summary.totalModules}`);
    console.log(`- Modules Succeeded : ${summary.passedModules}`);
    console.log(`- Modules Failed    : ${summary.failedModules}`);
    console.log(`- Total Warnings    : ${summary.warnings.length}`);
    console.log(`- Total Findings    : ${summary.totalFindings}`);
    console.log(`- Output Directory  : ${config.outputDirectory}`);

    if (summary.outputFiles.length > 0) {
      console.log('Generated Output Files:');
      for (const file of summary.outputFiles) {
        console.log(`  └─ [${file.format.toUpperCase()}] ${file.filePath} (${file.bytesWritten} bytes)`);
      }
    }
    console.log('====================================================');
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('----------------------------------------------------');
    console.error('[Inspector Error]', message);
    console.error('====================================================');
    process.exit(1);
  }
}

// Execute CLI
main();
