/**
 * WYN Database Inspector - Inspector Utilities & Metadata Helpers
 * Shared helper utilities for database metadata introspection.
 */

import crypto from 'crypto';
import { DatabaseClient } from '../core/databaseClient';
import { InspectorContext } from '../types';

export const WYN_TABLE_NAMES = [
  'businesses',
  'product_categories',
  'product_units',
  'products',
  'stock_movements',
  'customers',
  'sales',
  'sale_items',
  'payments',
  'suppliers',
  'purchase_orders',
  'purchase_items',
  'expense_categories',
  'expenses',
  'daily_summaries',
  'profiles',
  'categories',
  'stock_transactions',
  'transactions',
  'user_preferences',
  'business_settings',
  'schema_migrations',
];

export const SYSTEM_SCHEMAS_TABLES: Record<string, string[]> = {
  auth: ['users', 'sessions', 'identities', 'refresh_tokens', 'audit_log_entries', 'mfa_factors'],
  storage: ['buckets', 'objects', 's3_multipart_uploads'],
  extensions: ['pg_stat_statements', 'spatial_ref_sys'],
  realtime: ['subscription', 'schema_migrations'],
};

export interface TableSpec {
  tableName: string;
  schema: string;
}

export interface MetadataWrapper<T> {
  generatedAt: string;
  databaseVersion: string;
  schema: string;
  records: T[];
  count: number;
}

/**
 * Returns list of schemas to inspect based on scope flag.
 */
export function getSchemasToInspect(allSchemas: boolean): string[] {
  return allSchemas
    ? ['public', 'auth', 'storage', 'extensions', 'realtime']
    : ['public'];
}

/**
 * Returns table specifications for inspection given the schema scope.
 */
export function getTablesForInspection(allSchemas: boolean): TableSpec[] {
  const tables: TableSpec[] = WYN_TABLE_NAMES.map((name) => ({
    tableName: name,
    schema: 'public',
  }));

  if (allSchemas) {
    for (const [schema, sysTables] of Object.entries(SYSTEM_SCHEMAS_TABLES)) {
      for (const tableName of sysTables) {
        tables.push({ tableName, schema });
      }
    }
  }

  return tables;
}

/**
 * Wraps inspector records in standard JSON output format.
 */
export function createMetadataWrapper<T>(
  records: T[],
  schema: string = 'public',
  databaseVersion: string = 'PostgreSQL 15+ (Supabase Cloud)'
): MetadataWrapper<T> {
  return {
    generatedAt: new Date().toISOString(),
    databaseVersion,
    schema,
    records,
    count: records.length,
  };
}

/**
 * Dynamically queries row count using either 'fast' (estimated) or 'exact' strategy.
 */
export async function getTableRowCount(
  client: DatabaseClient,
  tableName: string,
  strategy: 'fast' | 'exact' = 'fast'
): Promise<number> {
  try {
    if (strategy === 'exact') {
      const { count } = await client.executeQuery(tableName, { limit: 1 });
      return count ?? 0;
    } else {
      // Fast strategy: query a lightweight 1-row sample to estimate presence & approximate size
      const { data, count } = await client.executeQuery(tableName, { limit: 10 });
      if (!data || data.length === 0) return 0;
      // Fast heuristic estimate based on sample density or exact metadata fallback if count is lightweight
      return count !== null ? count : data.length;
    }
  } catch {
    return 0;
  }
}

/**
 * Attempts to fetch OpenAPI metadata from PostgREST endpoint (PostgreSQL schema representation).
 * Note: Uses PostgREST endpoint as a safe read-only HTTP reflection of information_schema & pg_catalog.
 */
export async function fetchOpenApiSpec(context: InspectorContext): Promise<any | null> {
  try {
    const response = await fetch(`${context.supabaseUrl}/rest/v1/`, {
      method: 'GET',
      headers: {
        apikey: context.supabaseKey,
        Authorization: `Bearer ${context.supabaseKey}`,
      },
    });

    if (response.ok) {
      return await response.json();
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Computes a deterministic SHA-256 fingerprint from all database metadata components.
 */
export function calculateSchemaFingerprint(
  tables: any[] = [],
  columns: any[] = [],
  primaryKeys: any[] = [],
  foreignKeys: any[] = [],
  constraints: any[] = [],
  indexes: any[] = [],
  rls: any[] = [],
  policies: any[] = [],
  functions: any[] = [],
  triggers: any[] = [],
  views: any[] = [],
  materializedViews: any[] = [],
  extensions: any[] = [],
  sequences: any[] = []
): string {
  const tableTokens = (tables || [])
    .map((t) => `${t.schema || 'public'}.${t.tableName || t.table}`)
    .sort();

  const columnTokens = (columns || [])
    .map((c) => `${c.table}.${c.columnName}:${c.dataType}:${c.nullable}`)
    .sort();

  const pkTokens = (primaryKeys || [])
    .map((pk) => `${pk.table}:${pk.constraintName}:${(pk.columns || []).join(',')}`)
    .sort();

  const fkTokens = (foreignKeys || [])
    .map((fk) => `${fk.sourceTable}.${fk.sourceColumn}->${fk.targetTable}.${fk.targetColumn}:${fk.constraintName}`)
    .sort();

  const constraintTokens = (constraints || [])
    .map((c) => `${c.table}:${c.constraintName}:${c.constraintType}:${c.definition}`)
    .sort();

  const indexTokens = (indexes || [])
    .map((i) => `${i.table}:${i.indexName}:${(i.columns || []).join(',')}:${i.isUnique}`)
    .sort();

  const rlsTokens = (rls || [])
    .map((r) => `${r.schema}.${r.table}:rls=${r.rlsEnabled}`)
    .sort();

  const policyTokens = (policies || [])
    .map((p) => `${p.table}:${p.policyName}:${p.command}`)
    .sort();

  const functionTokens = (functions || [])
    .map((f) => `${f.schema}.${f.functionName}:${f.returnType}`)
    .sort();

  const triggerTokens = (triggers || [])
    .map((tr) => `${tr.table}:${tr.triggerName}:${tr.timing}:${tr.event}`)
    .sort();

  const viewTokens = (views || [])
    .map((v) => `${v.schema}.${v.viewName}`)
    .sort();

  const matViewTokens = (materializedViews || [])
    .map((mv) => `${mv.viewName}:populated=${mv.populated}`)
    .sort();

  const extTokens = (extensions || [])
    .map((e) => `${e.extensionName}:${e.version}`)
    .sort();

  const seqTokens = (sequences || [])
    .map((s) => `${s.schema}.${s.sequenceName}`)
    .sort();

  const canonicalPayload = [
    '=== TABLES ===',
    ...tableTokens,
    '=== COLUMNS ===',
    ...columnTokens,
    '=== PRIMARY KEYS ===',
    ...pkTokens,
    '=== FOREIGN KEYS ===',
    ...fkTokens,
    '=== CONSTRAINTS ===',
    ...constraintTokens,
    '=== INDEXES ===',
    ...indexTokens,
    '=== RLS ===',
    ...rlsTokens,
    '=== POLICIES ===',
    ...policyTokens,
    '=== FUNCTIONS ===',
    ...functionTokens,
    '=== TRIGGERS ===',
    ...triggerTokens,
    '=== VIEWS ===',
    ...viewTokens,
    '=== MATERIALIZED VIEWS ===',
    ...matViewTokens,
    '=== EXTENSIONS ===',
    ...extTokens,
    '=== SEQUENCES ===',
    ...seqTokens,
  ].join('\n');

  return crypto
    .createHash('sha256')
    .update(canonicalPayload, 'utf-8')
    .digest('hex')
    .toUpperCase();
}
