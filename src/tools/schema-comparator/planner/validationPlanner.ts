/**
 * WYN Migration Planning Engine - Validation Planner
 * Produces structured pre-flight, in-flight, and post-flight validation checklists.
 */

import { ValidationChecklist } from '../types';

export class ValidationPlanner {
  public generateChecklist(): ValidationChecklist {
    return {
      beforeMigration: [
        {
          id: 'VAL-PRE-001',
          check: 'Verify Full Database Backup',
          details: 'Ensure point-in-time snapshot or pg_dump backup is successfully generated and verified.',
          required: true,
        },
        {
          id: 'VAL-PRE-002',
          check: 'Validate Schema Hash',
          details: 'Confirm the current database schema hash matches the expected target hash in reports.',
          required: true,
        },
        {
          id: 'VAL-PRE-003',
          check: 'Inspect Active Database Connections',
          details: 'Ensure no active long-running write transactions exist on target tables.',
          required: true,
        },
        {
          id: 'VAL-PRE-004',
          check: 'Set Session Lock Timeouts',
          details: 'Configure lock_timeout = "2s" and statement_timeout = "10s" for the migration session.',
          required: true,
        },
      ],
      duringMigration: [
        {
          id: 'VAL-DUR-001',
          check: 'Stage-by-Stage Atomic Transactions',
          details: 'Execute each migration stage within an explicit BEGIN ... COMMIT transaction block.',
          required: true,
        },
        {
          id: 'VAL-DUR-002',
          check: 'Monitor Exclusive Table Lock Duration',
          details: 'Track ACCESS EXCLUSIVE lock hold times during DDL execution.',
          required: true,
        },
        {
          id: 'VAL-DUR-003',
          check: 'Error Log Trap',
          details: 'Immediately rollback active transaction on any SQL execution error or constraint failure.',
          required: true,
        },
      ],
      afterMigration: [
        {
          id: 'VAL-POST-001',
          check: 'Re-run Database Inspector & Schema Comparator',
          details: 'Verify schema match rate reaches 100% and zero differences remain.',
          required: true,
        },
        {
          id: 'VAL-POST-002',
          check: 'Validate Foreign Key Referential Integrity',
          details: 'Execute orphan record check across newly introduced foreign keys.',
          required: true,
        },
        {
          id: 'VAL-POST-003',
          check: 'Verify Index Usability and Status',
          details: 'Confirm all created btree indexes are marked as valid and ready for query optimizer.',
          required: true,
        },
        {
          id: 'VAL-POST-004',
          check: 'Validate Record Counts',
          details: 'Compare table row counts before and after migration to guarantee zero inadvertent data loss.',
          required: true,
        },
      ],
    };
  }
}
