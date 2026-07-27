/**
 * WYN Schema Comparator Engine - SQL Schema Parser
 * Parses DDL SQL schema files (e.g. database_v1.sql) into structured in-memory schema objects.
 * Performs pure AST-like regex parsing without executing SQL queries.
 */

import fs from 'fs';
import {
  ParsedColumn,
  ParsedConstraint,
  ParsedForeignKey,
  ParsedIndex,
  ParsedPrimaryKey,
  ParsedSchema,
  ParsedTable,
} from '../types';

export function normalizeDataType(rawType: string): string {
  if (!rawType) return 'text';
  let clean = rawType.trim().toLowerCase();

  // Strip parameters like (255) for comparison normalization if needed, or format canonical PostgreSQL names
  if (clean.startsWith('varchar')) {
    const lenMatch = clean.match(/varchar\((\d+)\)/);
    return lenMatch ? `character varying(${lenMatch[1]})` : 'character varying';
  }
  if (clean.startsWith('character varying')) {
    return clean;
  }
  if (clean === 'int' || clean === 'integer' || clean === 'int4') {
    return 'integer';
  }
  if (clean === 'bigint' || clean === 'int8') {
    return 'bigint';
  }
  if (clean === 'smallint' || clean === 'int2') {
    return 'smallint';
  }
  if (clean === 'boolean' || clean === 'bool') {
    return 'boolean';
  }
  if (clean === 'timestamptz' || clean.includes('timestamp with time zone')) {
    return 'timestamp with time zone';
  }
  if (clean === 'timestamp' || clean.includes('timestamp without time zone')) {
    return 'timestamp without time zone';
  }
  if (clean === 'uuid') {
    return 'uuid';
  }
  if (clean === 'text') {
    return 'text';
  }
  if (clean === 'json' || clean === 'jsonb') {
    return clean;
  }
  if (clean.startsWith('numeric') || clean.startsWith('decimal')) {
    return clean;
  }
  if (clean.startsWith('double precision') || clean === 'float8') {
    return 'double precision';
  }
  if (clean === 'real' || clean === 'float4') {
    return 'real';
  }
  if (clean === 'date') {
    return 'date';
  }

  return clean;
}

export function normalizeDefaultValue(rawDefault: string | null): string | null {
  if (!rawDefault) return null;
  let val = rawDefault.trim();
  // Remove cast suffixes like ::text, ::numeric
  val = val.replace(/::[a-zA-Z0-9_ ]+/g, '');
  if (val.toLowerCase() === 'now()' || val.toLowerCase() === 'current_timestamp') {
    return 'now()';
  }
  if (val.toLowerCase() === 'gen_random_uuid()' || val.toLowerCase() === 'uuid_generate_v4()') {
    return 'gen_random_uuid()';
  }
  // Trim outer quotes
  if ((val.startsWith("'") && val.endsWith("'")) || (val.startsWith('"') && val.endsWith('"'))) {
    val = val.slice(1, -1);
  }
  return val;
}

export class SqlSchemaParser {
  /**
   * Parses a SQL DDL file content into a structured ParsedSchema object.
   */
  public parseFile(filePath: string): ParsedSchema {
    if (!fs.existsSync(filePath)) {
      throw new Error(`Target SQL file not found at path: ${filePath}`);
    }
    const sqlContent = fs.readFileSync(filePath, 'utf-8');
    return this.parseSql(sqlContent);
  }

  /**
   * Parses DDL SQL text content.
   */
  public parseSql(sql: string): ParsedSchema {
    const cleanedSql = this.stripComments(sql);
    const tables = new Map<string, ParsedTable>();
    const extensions: string[] = [];
    const indexes: ParsedIndex[] = [];
    const constraints: ParsedConstraint[] = [];

    // 1. Extract Extensions
    const extRegex = /CREATE\s+EXTENSION\s+(?:IF\s+NOT\s+EXISTS\s+)?"?([a-zA-Z0-9_]+)"?/gi;
    let extMatch;
    while ((extMatch = extRegex.exec(cleanedSql)) !== null) {
      if (extMatch[1]) {
        extensions.push(extMatch[1].toLowerCase());
      }
    }

    // 2. Extract CREATE TABLE statements
    const createTableRegex = /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?([a-zA-Z0-9_".]+)\s*\(([\s\S]*?)\);/gi;
    let tableMatch;
    while ((tableMatch = createTableRegex.exec(cleanedSql)) !== null) {
      const fullTableName = tableMatch[1].replace(/"/g, '');
      const tableName = fullTableName.includes('.') ? fullTableName.split('.')[1] : fullTableName;
      const body = tableMatch[2];

      const parsedTable = this.parseTableBody(tableName, body);
      tables.set(tableName, parsedTable);
    }

    // 3. Extract ALTER TABLE ADD CONSTRAINT statements
    const alterTableRegex = /ALTER\s+TABLE\s+(?:ONLY\s+)?([a-zA-Z0-9_".]+)\s+ADD\s+CONSTRAINT\s+([a-zA-Z0-9_"]+)\s+([\s\S]*?);/gi;
    let alterMatch;
    while ((alterMatch = alterTableRegex.exec(cleanedSql)) !== null) {
      const fullTableName = alterMatch[1].replace(/"/g, '');
      const tableName = fullTableName.includes('.') ? fullTableName.split('.')[1] : fullTableName;
      const constraintName = alterMatch[2].replace(/"/g, '');
      const constraintClause = alterMatch[3].trim();

      const table = tables.get(tableName);
      if (table) {
        this.parseAlterConstraintClause(table, constraintName, constraintClause, constraints);
      }
    }

    // 4. Extract CREATE [UNIQUE] INDEX statements
    const createIndexRegex = /CREATE\s+(UNIQUE\s+)?INDEX\s+(?:IF\s+NOT\s+EXISTS\s+)?([a-zA-Z0-9_"]+)\s+ON\s+([a-zA-Z0-9_".]+)(?:\s+USING\s+[a-zA-Z0-9_]+)?\s*\(([^)]+)\)(?:\s+WHERE\s+([^;]+))?;/gi;
    let indexMatch;
    while ((indexMatch = createIndexRegex.exec(cleanedSql)) !== null) {
      const isUnique = !!indexMatch[1];
      const indexName = indexMatch[2].replace(/"/g, '');
      const fullTableName = indexMatch[3].replace(/"/g, '');
      const tableName = fullTableName.includes('.') ? fullTableName.split('.')[1] : fullTableName;
      const columnsRaw = indexMatch[4];
      const whereClause = indexMatch[5] ? indexMatch[5].trim() : undefined;

      const columns = columnsRaw.split(',').map((c) => c.trim().replace(/"/g, ''));

      const parsedIndex: ParsedIndex = {
        indexName,
        table: tableName,
        columns,
        isUnique,
        isPartial: !!whereClause,
        whereClause,
        definition: indexMatch[0],
      };

      indexes.push(parsedIndex);

      const table = tables.get(tableName);
      if (table) {
        table.indexes.push(parsedIndex);
      }
    }

    return {
      tables,
      extensions,
      indexes,
      constraints,
    };
  }

  private stripComments(sql: string): string {
    // Strip multi-line comments /* ... */
    let clean = sql.replace(/\/\*[\s\S]*?\*\//g, '');
    // Strip single-line comments -- ...
    clean = clean.replace(/--.*$/gm, '');
    return clean;
  }

  private parseTableBody(tableName: string, body: string): ParsedTable {
    const columns = new Map<string, ParsedColumn>();
    const foreignKeys: ParsedForeignKey[] = [];
    const constraints: ParsedConstraint[] = [];
    const indexes: ParsedIndex[] = [];
    let primaryKey: ParsedPrimaryKey | undefined = undefined;

    // Split table definition by comma, taking into account parenthesis depth
    const lines = this.splitCsvStatements(body);

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line) continue;

      const upper = line.toUpperCase();

      // Check Table-Level PRIMARY KEY
      if (upper.startsWith('PRIMARY KEY') || upper.startsWith('CONSTRAINT') && upper.includes('PRIMARY KEY')) {
        const pkMatch = line.match(/(?:CONSTRAINT\s+([a-zA-Z0-9_"]+)\s+)?PRIMARY\s+KEY\s*\(([^)]+)\)/i);
        if (pkMatch) {
          const pkName = pkMatch[1] ? pkMatch[1].replace(/"/g, '') : `${tableName}_pkey`;
          const pkCols = pkMatch[2].split(',').map((c) => c.trim().replace(/"/g, ''));
          primaryKey = { constraintName: pkName, table: tableName, columns: pkCols };
        }
        continue;
      }

      // Check Table-Level FOREIGN KEY
      if (upper.startsWith('FOREIGN KEY') || (upper.startsWith('CONSTRAINT') && upper.includes('FOREIGN KEY'))) {
        const fkMatch = line.match(/(?:CONSTRAINT\s+([a-zA-Z0-9_"]+)\s+)?FOREIGN\s+KEY\s*\(([^)]+)\)\s+REFERENCES\s+([a-zA-Z0-9_".]+)\s*\(([^)]+)\)(?:\s+ON\s+DELETE\s+([a-zA-Z0-9_\s]+))?(?:\s+ON\s+UPDATE\s+([a-zA-Z0-9_\s]+))?/i);
        if (fkMatch) {
          const constraintName = fkMatch[1] ? fkMatch[1].replace(/"/g, '') : `fk_${tableName}_${fkMatch[2].trim()}`;
          const sourceColumn = fkMatch[2].trim().replace(/"/g, '');
          const targetTable = fkMatch[3].replace(/"/g, '').replace(/^public\./, '');
          const targetColumn = fkMatch[4].trim().replace(/"/g, '');
          const onDelete = fkMatch[5] ? fkMatch[5].trim().toUpperCase() : 'NO ACTION';
          const onUpdate = fkMatch[6] ? fkMatch[6].trim().toUpperCase() : 'NO ACTION';

          foreignKeys.push({
            constraintName,
            sourceTable: tableName,
            sourceColumn,
            targetTable,
            targetColumn,
            onDelete,
            onUpdate,
          });
        }
        continue;
      }

      // Check Table-Level UNIQUE / CHECK
      if (upper.startsWith('CONSTRAINT')) {
        const uniqueMatch = line.match(/CONSTRAINT\s+([a-zA-Z0-9_"]+)\s+UNIQUE\s*\(([^)]+)\)/i);
        if (uniqueMatch) {
          const cName = uniqueMatch[1].replace(/"/g, '');
          const cols = uniqueMatch[2].split(',').map((c) => c.trim().replace(/"/g, ''));
          constraints.push({
            constraintName: cName,
            constraintType: 'UNIQUE',
            table: tableName,
            definition: `UNIQUE (${cols.join(', ')})`,
            columns: cols,
          });
          continue;
        }

        const checkMatch = line.match(/CONSTRAINT\s+([a-zA-Z0-9_"]+)\s+CHECK\s*\(([\s\S]+)\)/i);
        if (checkMatch) {
          const cName = checkMatch[1].replace(/"/g, '');
          const expr = checkMatch[2].trim();
          constraints.push({
            constraintName: cName,
            constraintType: 'CHECK',
            table: tableName,
            definition: `CHECK (${expr})`,
            expression: expr,
          });
          continue;
        }
      }

      // Otherwise, line is a Column Definition
      const colMatch = line.match(/^([a-zA-Z0-9_"]+)\s+([a-zA-Z0-9_()]+(?:\s+\[\])?)([\s\S]*)$/i);
      if (colMatch) {
        const colName = colMatch[1].replace(/"/g, '');
        const rawType = colMatch[2];
        const rest = colMatch[3] || '';

        const dataType = normalizeDataType(rawType);
        let nullable = !rest.toUpperCase().includes('NOT NULL');
        let defaultValue: string | null = null;

        if (rest.toUpperCase().includes('PRIMARY KEY')) {
          nullable = false;
          if (!primaryKey) {
            primaryKey = {
              constraintName: `${tableName}_pkey`,
              table: tableName,
              columns: [colName],
            };
          }
        }

        const defaultMatch = rest.match(/DEFAULT\s+([^,;]+?)(?:\s+NOT\s+NULL|\s+NULL|\s+REFERENCES|\s+CHECK|\s+PRIMARY|$)/i);
        if (defaultMatch) {
          defaultValue = normalizeDefaultValue(defaultMatch[1]);
        }

        const refMatch = rest.match(/REFERENCES\s+([a-zA-Z0-9_".]+)\s*\(([^)]+)\)(?:\s+ON\s+DELETE\s+([a-zA-Z0-9_\s]+))?/i);
        if (refMatch) {
          const targetTable = refMatch[1].replace(/"/g, '').replace(/^public\./, '');
          const targetColumn = refMatch[2].trim().replace(/"/g, '');
          const onDelete = refMatch[3] ? refMatch[3].trim().toUpperCase() : 'NO ACTION';

          foreignKeys.push({
            constraintName: `fk_${tableName}_${colName}`,
            sourceTable: tableName,
            sourceColumn: colName,
            targetTable,
            targetColumn,
            onDelete,
          });
        }

        columns.set(colName, {
          name: colName,
          dataType,
          nullable,
          defaultValue,
          isPrimaryKey: rest.toUpperCase().includes('PRIMARY KEY'),
        });
      }
    }

    return {
      name: tableName,
      columns,
      primaryKey,
      foreignKeys,
      constraints,
      indexes,
    };
  }

  private parseAlterConstraintClause(
    table: ParsedTable,
    constraintName: string,
    clause: string,
    globalConstraints: ParsedConstraint[]
  ): void {
    const upper = clause.toUpperCase();

    if (upper.startsWith('CHECK')) {
      const checkMatch = clause.match(/CHECK\s*\(([\s\S]+)\)/i);
      if (checkMatch) {
        const expr = checkMatch[1].trim();
        const c: ParsedConstraint = {
          constraintName,
          constraintType: 'CHECK',
          table: table.name,
          definition: `CHECK (${expr})`,
          expression: expr,
        };
        table.constraints.push(c);
        globalConstraints.push(c);
      }
    } else if (upper.startsWith('UNIQUE')) {
      const uqMatch = clause.match(/UNIQUE\s*\(([^)]+)\)/i);
      if (uqMatch) {
        const cols = uqMatch[1].split(',').map((c) => c.trim().replace(/"/g, ''));
        const c: ParsedConstraint = {
          constraintName,
          constraintType: 'UNIQUE',
          table: table.name,
          definition: `UNIQUE (${cols.join(', ')})`,
          columns: cols,
        };
        table.constraints.push(c);
        globalConstraints.push(c);
      }
    } else if (upper.startsWith('FOREIGN KEY')) {
      const fkMatch = clause.match(/FOREIGN\s+KEY\s*\(([^)]+)\)\s+REFERENCES\s+([a-zA-Z0-9_".]+)\s*\(([^)]+)\)(?:\s+ON\s+DELETE\s+([a-zA-Z0-9_\s]+))?/i);
      if (fkMatch) {
        const sourceColumn = fkMatch[1].trim().replace(/"/g, '');
        const targetTable = fkMatch[2].replace(/"/g, '').replace(/^public\./, '');
        const targetColumn = fkMatch[3].trim().replace(/"/g, '');
        const onDelete = fkMatch[4] ? fkMatch[4].trim().toUpperCase() : 'NO ACTION';

        table.foreignKeys.push({
          constraintName,
          sourceTable: table.name,
          sourceColumn,
          targetTable,
          targetColumn,
          onDelete,
        });
      }
    }
  }

  private splitCsvStatements(text: string): string[] {
    const results: string[] = [];
    let current = '';
    let parenDepth = 0;
    let inString = false;
    let quoteChar = '';

    for (let i = 0; i < text.length; i++) {
      const char = text[i];

      if ((char === "'" || char === '"') && text[i - 1] !== '\\') {
        if (!inString) {
          inString = true;
          quoteChar = char;
        } else if (quoteChar === char) {
          inString = false;
        }
      }

      if (!inString) {
        if (char === '(') parenDepth++;
        else if (char === ')') parenDepth--;
        else if (char === ',' && parenDepth === 0) {
          results.push(current);
          current = '';
          continue;
        }
      }

      current += char;
    }

    if (current.trim()) {
      results.push(current);
    }

    return results;
  }
}
