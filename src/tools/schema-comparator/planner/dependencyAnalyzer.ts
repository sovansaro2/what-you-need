/**
 * WYN Migration Planning Engine - Dependency Analyzer
 * Analyzes table dependencies, foreign key constraints, circular dependencies, and computes safe execution orders.
 */

import { ParsedSchema, DependencyAnalysis, DependencyNode } from '../types';

export class DependencyAnalyzer {
  public analyzeDependencies(targetSchema: ParsedSchema): DependencyAnalysis {
    const dependencyGraph: Record<string, DependencyNode> = {};

    // 1. Initialize graph nodes for all tables
    targetSchema.tables.forEach((table, tableName) => {
      dependencyGraph[tableName] = {
        tableName,
        dependsOn: [],
        referencedBy: [],
        hasCircularDependency: false,
      };
    });

    // 2. Populate dependencies from foreign keys
    targetSchema.tables.forEach((table, tableName) => {
      table.foreignKeys.forEach((fk) => {
        const targetTable = fk.targetTable;
        if (targetTable && targetTable !== tableName && dependencyGraph[targetTable]) {
          if (!dependencyGraph[tableName].dependsOn.includes(targetTable)) {
            dependencyGraph[tableName].dependsOn.push(targetTable);
          }
          if (!dependencyGraph[targetTable].referencedBy.includes(tableName)) {
            dependencyGraph[targetTable].referencedBy.push(tableName);
          }
        }
      });
    });

    // 3. Detect circular dependencies
    const circularDependencies: Array<{ tables: string[]; description: string }> = [];
    const allTableNames = Object.keys(dependencyGraph);

    allTableNames.forEach((tableA) => {
      dependencyGraph[tableA].dependsOn.forEach((tableB) => {
        if (dependencyGraph[tableB] && dependencyGraph[tableB].dependsOn.includes(tableA)) {
          dependencyGraph[tableA].hasCircularDependency = true;
          dependencyGraph[tableB].hasCircularDependency = true;

          const exists = circularDependencies.some(
            (cd) => cd.tables.includes(tableA) && cd.tables.includes(tableB)
          );

          if (!exists) {
            circularDependencies.push({
              tables: [tableA, tableB],
              description: `Circular foreign key dependency detected between '${tableA}' and '${tableB}'. Foreign keys will be created in Stage 6 after table creation.`,
            });
          }
        }
      });
    });

    // 4. Compute Creation Order via Topological Sort (Kahn's Algorithm)
    const creationOrder = this.topologicalSort(dependencyGraph);

    // 5. Compute Update Order & Validation Order
    const updateOrder = [...creationOrder];
    const validationOrder = [...creationOrder].reverse();

    return {
      creationOrder,
      updateOrder,
      validationOrder,
      dependencyGraph,
      circularDependencies,
    };
  }

  private topologicalSort(graph: Record<string, DependencyNode>): string[] {
    const inDegree: Record<string, number> = {};
    const adjList: Record<string, string[]> = {};
    const nodes = Object.keys(graph);

    nodes.forEach((node) => {
      inDegree[node] = 0;
      adjList[node] = [];
    });

    nodes.forEach((node) => {
      graph[node].dependsOn.forEach((dep) => {
        // dep must come BEFORE node, so edge is dep -> node
        if (adjList[dep]) {
          adjList[dep].push(node);
          inDegree[node] = (inDegree[node] || 0) + 1;
        }
      });
    });

    const queue: string[] = [];
    nodes.forEach((node) => {
      if (inDegree[node] === 0) {
        queue.push(node);
      }
    });

    const sorted: string[] = [];

    while (queue.length > 0) {
      // Sort queue alphabetically for deterministic ordering among independent nodes
      queue.sort();
      const current = queue.shift()!;
      sorted.push(current);

      const neighbors = adjList[current] || [];
      neighbors.forEach((neighbor) => {
        inDegree[neighbor]--;
        if (inDegree[neighbor] === 0) {
          queue.push(neighbor);
        }
      });
    }

    // Handle any nodes left out due to circular dependency
    if (sorted.length < nodes.length) {
      nodes.forEach((node) => {
        if (!sorted.includes(node)) {
          sorted.push(node);
        }
      });
    }

    return sorted;
  }
}
