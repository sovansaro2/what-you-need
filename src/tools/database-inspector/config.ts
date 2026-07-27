/**
 * WYN Database Inspector - Configuration Manager
 * Reads and validates environment configuration for read-only database inspection.
 * Enforces strict separation between Frontend (VITE_*) and Toolkit (CLI) credentials.
 */

import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Load base .env and optional .env.toolkit
dotenv.config();
const toolkitEnvPath = path.join(process.cwd(), '.env.toolkit');
if (fs.existsSync(toolkitEnvPath)) {
  dotenv.config({ path: toolkitEnvPath, override: true });
}

export interface DatabaseInspectorConfig {
  supabaseUrl: string;
  supabaseServiceRoleKey: string;
  outputDirectory: string;
  defaultSampleLimit: number;
  environmentLoaded?: string;
}

/**
 * Loads configuration from process.env / .env.toolkit.
 * STRICT ENFORCEMENT: Toolkit MUST ONLY use SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.
 * Insecure fallbacks to VITE_SUPABASE_* or ANON keys are strictly forbidden.
 */
export function loadConfig(): DatabaseInspectorConfig {
  const supabaseUrl = process.env.SUPABASE_URL || '';
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

  const outputDirectory =
    process.env.OUTPUT_DIRECTORY ||
    path.join(process.cwd(), 'reports', 'db-inspector');

  const defaultSampleLimit = parseInt(
    process.env.DEFAULT_SAMPLE_LIMIT || '20',
    10
  );

  const envLoaded = fs.existsSync(toolkitEnvPath)
    ? '.env.toolkit + .env'
    : '.env / process.env';

  return {
    supabaseUrl,
    supabaseServiceRoleKey,
    outputDirectory,
    defaultSampleLimit: isNaN(defaultSampleLimit) ? 20 : defaultSampleLimit,
    environmentLoaded: envLoaded,
  };
}

/**
 * Validates the loaded configuration and throws readable engineering errors if critical variables are missing.
 */
export function validateConfig(config: DatabaseInspectorConfig): void {
  const errors: string[] = [];

  if (!config.supabaseUrl || config.supabaseUrl.trim() === '') {
    errors.push(
      'Missing SUPABASE_URL environment variable.\n' +
      '   Expected variable: SUPABASE_URL=https://your-project.supabase.co\n' +
      '   Please configure SUPABASE_URL in your environment or in .env.toolkit file.'
    );
  }

  if (!config.supabaseServiceRoleKey || config.supabaseServiceRoleKey.trim() === '') {
    errors.push(
      'Missing SUPABASE_SERVICE_ROLE_KEY environment variable.\n' +
      '   Toolkit requires administrative service role privileges for database introspection.\n' +
      '   Silent fallback to VITE_SUPABASE_ANON_KEY is strictly forbidden for security.\n' +
      '   Please configure SUPABASE_SERVICE_ROLE_KEY in .env.toolkit or process.env.'
    );
  }

  if (config.defaultSampleLimit <= 0) {
    errors.push(
      `Invalid DEFAULT_SAMPLE_LIMIT value: ${config.defaultSampleLimit}. Must be a positive integer.`
    );
  }

  if (errors.length > 0) {
    throw new Error(
      `[DatabaseInspectorConfig Error] Environment Hardening Validation Failed:\n - ${errors.join('\n - ')}`
    );
  }
}

