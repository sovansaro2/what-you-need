/**
 * WYN Intelligent Mapping Engine - Relationship Mapping Module
 * Maps foreign key constraints and relationships between CURRENT and TARGET schemas.
 */

import { ParsedSchema, InspectorFKRecord, RelationshipMapping } from '../types';
import { ConfidenceCalculator } from './confidenceCalculator';
import { RiskAnalyzer } from './riskAnalyzer';

export class RelationshipMapper {
  public mapRelationships(
    targetSchema: ParsedSchema,
    inspectorFKs: InspectorFKRecord[]
  ): RelationshipMapping[] {
    const mappings: RelationshipMapping[] = [];

    // Collect all foreign keys from target schema
    const targetFKs: Array<{
      constraintName: string | null;
      sourceTable: string;
      sourceColumn: string;
      targetTable: string;
      targetColumn: string;
    }> = [];

    targetSchema.tables.forEach((table) => {
      table.foreignKeys.forEach((fk) => {
        targetFKs.push({
          constraintName: fk.constraintName || null,
          sourceTable: fk.sourceTable,
          sourceColumn: fk.sourceColumn,
          targetTable: fk.targetTable,
          targetColumn: fk.targetColumn,
        });
      });
    });

    const mappedTargetIndices = new Set<number>();

    // 1. Process current foreign keys
    inspectorFKs.forEach((curFK) => {
      const matchIndex = targetFKs.findIndex((tgtFK, idx) => {
        if (mappedTargetIndices.has(idx)) return false;
        return (
          tgtFK.sourceTable.toLowerCase() === curFK.sourceTable.toLowerCase() &&
          tgtFK.sourceColumn.toLowerCase() === curFK.sourceColumn.toLowerCase() &&
          tgtFK.targetTable.toLowerCase() === curFK.targetTable.toLowerCase() &&
          tgtFK.targetColumn.toLowerCase() === curFK.targetColumn.toLowerCase()
        );
      });

      if (matchIndex !== -1) {
        mappedTargetIndices.add(matchIndex);
        mappings.push({
          constraintName: curFK.constraintName,
          sourceTable: curFK.sourceTable,
          sourceColumn: curFK.sourceColumn,
          targetTable: curFK.targetTable,
          targetColumn: curFK.targetColumn,
          status: 'RELATIONSHIP_PRESERVED',
          confidenceScore: 100,
          confidenceLevel: 'VERY_HIGH',
          risk: 'LOW',
          reason: 'Foreign key relationship preserved in target schema.',
        });
      } else {
        // Check if relationship was moved or renamed
        const softMatchIndex = targetFKs.findIndex((tgtFK, idx) => {
          if (mappedTargetIndices.has(idx)) return false;
          return (
            tgtFK.sourceTable.toLowerCase() === curFK.sourceTable.toLowerCase() &&
            tgtFK.sourceColumn.toLowerCase() === curFK.sourceColumn.toLowerCase()
          );
        });

        if (softMatchIndex !== -1) {
          const softFK = targetFKs[softMatchIndex];
          mappedTargetIndices.add(softMatchIndex);
          mappings.push({
            constraintName: curFK.constraintName,
            sourceTable: curFK.sourceTable,
            sourceColumn: curFK.sourceColumn,
            targetTable: softFK.targetTable,
            targetColumn: softFK.targetColumn,
            status: 'FK_MOVED',
            confidenceScore: 80,
            confidenceLevel: 'HIGH',
            risk: 'MEDIUM',
            reason: `Foreign key reference on ${curFK.sourceTable}.${curFK.sourceColumn} moved target from ${curFK.targetTable} to ${softFK.targetTable}.`,
          });
        } else {
          mappings.push({
            constraintName: curFK.constraintName,
            sourceTable: curFK.sourceTable,
            sourceColumn: curFK.sourceColumn,
            targetTable: curFK.targetTable,
            targetColumn: curFK.targetColumn,
            status: 'RELATIONSHIP_REMOVED',
            confidenceScore: 90,
            confidenceLevel: 'HIGH',
            risk: 'HIGH',
            reason: `Foreign key constraint on ${curFK.sourceTable}.${curFK.sourceColumn} -> ${curFK.targetTable} removed in target DDL.`,
          });
        }
      }
    });

    // 2. Unmapped target foreign keys are RELATIONSHIP_INTRODUCED
    targetFKs.forEach((tgtFK, idx) => {
      if (!mappedTargetIndices.has(idx)) {
        mappings.push({
          constraintName: tgtFK.constraintName,
          sourceTable: tgtFK.sourceTable,
          sourceColumn: tgtFK.sourceColumn,
          targetTable: tgtFK.targetTable,
          targetColumn: tgtFK.targetColumn,
          status: 'RELATIONSHIP_INTRODUCED',
          confidenceScore: 100,
          confidenceLevel: 'VERY_HIGH',
          risk: 'LOW',
          reason: `New foreign key relationship introduced in target schema on ${tgtFK.sourceTable}.${tgtFK.sourceColumn} -> ${tgtFK.targetTable}.${tgtFK.targetColumn}.`,
        });
      }
    });

    return mappings;
  }
}
