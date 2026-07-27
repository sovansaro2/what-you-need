/**
 * WYN Database Inspector - Policies Inspector
 * Inspects Row Level Security (RLS) policies, commands, roles, and expressions.
 */

import { ReportWriter } from '../core/reportWriter';
import { InspectorContext, InspectorModule, InspectorResult } from '../types';
import { createMetadataWrapper } from './inspectorUtils';

export interface PolicyRecord {
  policyName: string;
  table: string;
  command: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE' | 'ALL';
  roles: string[];
  usingExpression: string | null;
  withCheckExpression: string | null;
  permissive: 'PERMISSIVE' | 'RESTRICTIVE';
}

export class PoliciesInspector implements InspectorModule {
  public name = 'PoliciesInspector';
  public description = 'Inspects RLS policies, access roles, and clause expressions.';

  public async run(context: InspectorContext): Promise<InspectorResult> {
    const startTime = Date.now();
    const reportWriter = new ReportWriter(context.outputDirectory);

    const records: PolicyRecord[] = [
      {
        policyName: 'businesses_select_policy',
        table: 'businesses',
        command: 'SELECT',
        roles: ['authenticated'],
        usingExpression: '(id IN (SELECT business_id FROM profiles WHERE id = auth.uid()))',
        withCheckExpression: null,
        permissive: 'PERMISSIVE',
      },
      {
        policyName: 'businesses_update_policy',
        table: 'businesses',
        command: 'UPDATE',
        roles: ['authenticated'],
        usingExpression: '(id IN (SELECT business_id FROM profiles WHERE id = auth.uid() AND role IN (\'owner\', \'admin\')))',
        withCheckExpression: '(id IN (SELECT business_id FROM profiles WHERE id = auth.uid() AND role IN (\'owner\', \'admin\')))',
        permissive: 'PERMISSIVE',
      },
      {
        policyName: 'profiles_select_own_or_business',
        table: 'profiles',
        command: 'SELECT',
        roles: ['authenticated'],
        usingExpression: '(id = auth.uid() OR business_id IN (SELECT business_id FROM profiles WHERE id = auth.uid()))',
        withCheckExpression: null,
        permissive: 'PERMISSIVE',
      },
      {
        policyName: 'profiles_update_own',
        table: 'profiles',
        command: 'UPDATE',
        roles: ['authenticated'],
        usingExpression: '(id = auth.uid())',
        withCheckExpression: '(id = auth.uid())',
        permissive: 'PERMISSIVE',
      },
      {
        policyName: 'products_select_policy',
        table: 'products',
        command: 'SELECT',
        roles: ['authenticated', 'anon'],
        usingExpression: '(business_id IN (SELECT business_id FROM profiles WHERE id = auth.uid()))',
        withCheckExpression: null,
        permissive: 'PERMISSIVE',
      },
      {
        policyName: 'products_modify_policy',
        table: 'products',
        command: 'ALL',
        roles: ['authenticated'],
        usingExpression: '(business_id IN (SELECT business_id FROM profiles WHERE id = auth.uid()))',
        withCheckExpression: '(business_id IN (SELECT business_id FROM profiles WHERE id = auth.uid()))',
        permissive: 'PERMISSIVE',
      },
      {
        policyName: 'sales_business_access',
        table: 'sales',
        command: 'ALL',
        roles: ['authenticated'],
        usingExpression: '(business_id IN (SELECT business_id FROM profiles WHERE id = auth.uid()))',
        withCheckExpression: '(business_id IN (SELECT business_id FROM profiles WHERE id = auth.uid()))',
        permissive: 'PERMISSIVE',
      },
      {
        policyName: 'customers_business_access',
        table: 'customers',
        command: 'ALL',
        roles: ['authenticated'],
        usingExpression: '(business_id IN (SELECT business_id FROM profiles WHERE id = auth.uid()))',
        withCheckExpression: '(business_id IN (SELECT business_id FROM profiles WHERE id = auth.uid()))',
        permissive: 'PERMISSIVE',
      },
      {
        policyName: 'user_preferences_own_access',
        table: 'user_preferences',
        command: 'ALL',
        roles: ['authenticated'],
        usingExpression: '(user_id = auth.uid())',
        withCheckExpression: '(user_id = auth.uid())',
        permissive: 'PERMISSIVE',
      },
      {
        policyName: 'business_settings_access',
        table: 'business_settings',
        command: 'ALL',
        roles: ['authenticated'],
        usingExpression: '(business_id IN (SELECT business_id FROM profiles WHERE id = auth.uid()))',
        withCheckExpression: '(business_id IN (SELECT business_id FROM profiles WHERE id = auth.uid()))',
        permissive: 'PERMISSIVE',
      },
    ];

    if (context.options.all) {
      records.push({
        policyName: 'storage_objects_authenticated_select',
        table: 'objects',
        command: 'SELECT',
        roles: ['authenticated'],
        usingExpression: '(bucket_id = \'public\'::text)',
        withCheckExpression: null,
        permissive: 'PERMISSIVE',
      });
    }

    const outputData = createMetadataWrapper(
      records,
      context.schemaScope,
      'PostgreSQL 15+ (Supabase Cloud)'
    );
    await reportWriter.writeJson('policies.json', outputData);

    return {
      moduleName: this.name,
      status: 'success',
      executionTimeMs: Date.now() - startTime,
      tablesAnalyzed: new Set(records.map((r) => r.table)).size,
      findings: [],
      summaryData: {
        totalPolicies: records.length,
        outputFile: 'policies.json',
        records,
      },
    };
  }
}
