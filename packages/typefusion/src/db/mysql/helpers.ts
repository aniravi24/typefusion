import { SqlClient } from "@effect/sql/SqlClient";

/**
 * @internal
 */
export const mySqlDropTableIfExists = (sql: SqlClient, tableName: string) =>
  sql`DROP TABLE IF EXISTS \`${sql.unsafe(tableName)}\``;

/**
 * @internal
 */
export const mySqlCreateTableIfNotExists = (
  sql: SqlClient,
  tableName: string,
  columnDefinitions: string,
) =>
  sql`CREATE TABLE IF NOT EXISTS \`${sql.unsafe(tableName)}\` (${sql.unsafe(columnDefinitions)})`;

/**
 * @internal
 */
export const mySqlInsertIntoTable = (
  sql: SqlClient,
  tableName: string,
  data: unknown[],
) => sql`INSERT INTO \`${sql.unsafe(tableName)}\` ${sql.insert(data as any)}`;

/**
 * @internal
 */
export const mySqlSelectAllFromTable = (sql: SqlClient, tableName: string) =>
  sql`SELECT * FROM \`${sql.unsafe(tableName)}\``;

/**
 * @internal
 */
export const mySqlColumnDDL = (columnName: string, columnType: string) =>
  `\`${columnName}\` ${columnType}`;
