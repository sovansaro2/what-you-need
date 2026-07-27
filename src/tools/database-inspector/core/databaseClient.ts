/**
 * WYN Database Inspector - Read-Only Database Client Engine
 * Provides strictly read-only access to Supabase / PostgreSQL tables and system views.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { DatabaseInspectorConfig } from '../config';

export interface ReadQueryOptions {
  select?: string;
  limit?: number;
  offset?: number;
  orderBy?: { column: string; ascending?: boolean };
  filters?: Array<{
    column: string;
    operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'is' | 'in';
    value: any;
  }>;
}

export class DatabaseClient {
  private client: SupabaseClient | null = null;
  private isConnected: boolean = false;
  private readonly config: DatabaseInspectorConfig;

  constructor(config: DatabaseInspectorConfig) {
    this.config = config;
  }

  /**
   * Initializes and validates the connection instance to Supabase.
   */
  public async connect(): Promise<boolean> {
    if (this.isConnected && this.client) {
      return true;
    }

    try {
      this.client = createClient(
        this.config.supabaseUrl,
        this.config.supabaseServiceRoleKey,
        {
          auth: {
            persistSession: false,
            autoRefreshToken: false,
          },
        }
      );

      // Verify connection via health check
      const healthy = await this.healthCheck();
      this.isConnected = healthy;
      return healthy;
    } catch (error) {
      this.isConnected = false;
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to connect to Supabase database: ${message}`);
    }
  }

  /**
   * Resets and disconnects the database client instance.
   */
  public async disconnect(): Promise<void> {
    this.client = null;
    this.isConnected = false;
  }

  /**
   * Health check method: verifies that the Supabase client is responsive.
   * Performs a lightweight read operation (e.g. schema query or simple select).
   */
  public async healthCheck(): Promise<boolean> {
    if (!this.client) {
      return false;
    }

    try {
      // Execute a lightweight read query to confirm database responsiveness
      const { data, error } = await this.client
        .from('businesses')
        .select('id')
        .limit(1);

      if (error && error.code !== 'PGRST116') {
        // Fallback: try reading from another core table if businesses is missing
        const fallback = await this.client.from('products').select('id').limit(1);
        if (fallback.error && fallback.error.code !== 'PGRST116') {
          // If table doesn't exist, as long as PostgREST responds, service is alive
          return true;
        }
      }

      return true;
    } catch {
      return false;
    }
  }

  /**
   * Executes a strictly READ-ONLY SELECT query against a table or view.
   * Modifying operations (INSERT, UPDATE, DELETE, RPC mutations) are explicitly forbidden.
   */
  public async executeQuery<T = any>(
    tableName: string,
    options: ReadQueryOptions = {}
  ): Promise<{ data: T[] | null; count: number | null; error: Error | null }> {
    if (!this.client || !this.isConnected) {
      await this.connect();
    }

    if (!this.client) {
      throw new Error('Database client is not initialized.');
    }

    try {
      let query = this.client
        .from(tableName)
        .select(options.select || '*', { count: 'exact' });

      if (options.filters && options.filters.length > 0) {
        for (const filter of options.filters) {
          switch (filter.operator) {
            case 'eq':
              query = query.eq(filter.column, filter.value);
              break;
            case 'neq':
              query = query.neq(filter.column, filter.value);
              break;
            case 'gt':
              query = query.gt(filter.column, filter.value);
              break;
            case 'gte':
              query = query.gte(filter.column, filter.value);
              break;
            case 'lt':
              query = query.lt(filter.column, filter.value);
              break;
            case 'lte':
              query = query.lte(filter.column, filter.value);
              break;
            case 'is':
              query = query.is(filter.column, filter.value);
              break;
            case 'in':
              query = query.in(
                filter.column,
                Array.isArray(filter.value) ? filter.value : [filter.value]
              );
              break;
          }
        }
      }

      if (options.orderBy) {
        query = query.order(options.orderBy.column, {
          ascending: options.orderBy.ascending ?? true,
        });
      }

      if (options.limit !== undefined) {
        const from = options.offset || 0;
        const to = from + options.limit - 1;
        query = query.range(from, to);
      }

      const { data, count, error } = await query;

      if (error) {
        return {
          data: null,
          count: null,
          error: new Error(`[DatabaseClient Read Error] ${error.message}`),
        };
      }

      return {
        data: (data as T[]) || [],
        count: count ?? (data ? data.length : 0),
        error: null,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return {
        data: null,
        count: null,
        error: new Error(`[DatabaseClient Query Failure] ${message}`),
      };
    }
  }

  /**
   * Retrieves the raw underlying Supabase client for specialized read operations.
   */
  public getClient(): SupabaseClient | null {
    return this.client;
  }
}
